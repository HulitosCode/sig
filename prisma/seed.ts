import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'
import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL não definido')
  process.exit(1)
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

async function createUserWithPassword(opts: {
  name: string
  email: string
  password: string
  role: 'admin' | 'motorista'
}) {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } })
  if (existing) {
    console.log(`• Utilizador já existe: ${opts.email}`)
    return existing
  }

  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: opts.name,
      email: opts.email,
      emailVerified: true,
      role: opts.role,
    },
  })

  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: user.id,
      providerId: 'credential',
      userId: user.id,
      password: await hashPassword(opts.password),
    },
  })

  console.log(`✓ Utilizador criado: ${opts.email} (${opts.role})`)
  return user
}

async function createMotorista(opts: {
  name: string
  email: string
  telefone: string
  whatsapp?: string
  praca: string
  tipoViatura: string
  matricula: string
  cargaMax: string
  servicos: string[]
  precoKm?: string
  status?: string
  fotoUrl?: string
  pagamentosConfirmados?: boolean
}) {
  const user = await createUserWithPassword({
    name: opts.name,
    email: opts.email,
    password: 'freta12345',
    role: 'motorista',
  })

  const existente = await prisma.motorista.findUnique({ where: { userId: user.id } })
  if (existente) {
    console.log(`• Perfil já existe: ${opts.name}`)
    return existente
  }

  const status = opts.status ?? 'ativo'
  const motorista = await prisma.motorista.create({
    data: {
      userId: user.id,
      telefone: opts.telefone,
      whatsapp: opts.whatsapp ?? opts.telefone,
      praca: opts.praca,
      tipoViatura: opts.tipoViatura,
      matricula: opts.matricula,
      cargaMax: opts.cargaMax,
      servicos: opts.servicos,
      precoKm: opts.precoKm ?? null,
      status,
      fotoUrl: opts.fotoUrl ?? null,
    },
  })

  if (opts.pagamentosConfirmados !== false && status === 'ativo') {
    const validoAte = new Date()
    validoAte.setMonth(validoAte.getMonth() + 1)
    await prisma.pagamento.create({
      data: {
        motoristaId: motorista.id,
        valor: 120,
        status: 'confirmado',
        pagoEm: new Date(),
        validoAte,
      },
    })
  }

  console.log(`✓ Motorista criado: ${opts.name} (${opts.praca}, ${status})`)
  return motorista
}

async function main() {
  // Admin inicial (credenciais de .env / env vars do container:
  // ADMIN_EMAIL e ADMIN_SENHA — idempotente, não duplica existentes).
  await createUserWithPassword({
    name: 'Administração FRETA',
    email: process.env.ADMIN_EMAIL || 'admin@freta.co.mz',
    password: process.env.ADMIN_SENHA || 'admin123',
    role: 'admin',
  })

  // Dados de teste (motoristas/pedidos/avaliações de exemplo): apenas fora
  // de produção, ou com SEED_DEMO=1 explícito. Em produção o seed cria só
  // a conta de admin — sem perfis falsos na base de dados real.
  const comDadosDemo =
    process.env.SEED_DEMO === '1' || process.env.NODE_ENV !== 'production'

  if (!comDadosDemo) {
    console.log('• Dados de demo omitidos (produção). Defina SEED_DEMO=1 para os criar.')
    console.log('\nSeed concluído.')
    console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@freta.co.mz'} / ${process.env.ADMIN_SENHA || 'admin123'}`)
    return
  }

  // Motoristas de exemplo (para testar a pesquisa)
  const carlos = await createMotorista({
    name: 'Carlos Mucavele',
    email: 'carlos@freta.co.mz',
    telefone: '84 111 2233',
    praca: 'Zimpeto',
    tipoViatura: 'Toyota Dyna',
    matricula: 'AA-11-BB',
    cargaMax: '2 toneladas',
    servicos: ['mudanca', 'mercadoria', 'moveis'],
    precoKm: '50 MT/km',
  })

  const amelia = await createMotorista({
    name: 'Amélia Bila',
    email: 'amelia@freta.co.mz',
    telefone: '84 555 6677',
    whatsapp: '84 555 6677',
    praca: 'Maputo',
    tipoViatura: 'Isuzu NPR',
    matricula: 'CC-22-DD',
    cargaMax: '5 toneladas',
    servicos: ['mercadoria', 'construcao', 'pesada'],
    precoKm: '80 MT/km',
  })

  await createMotorista({
    name: 'João Nhantumbo',
    email: 'joao@freta.co.mz',
    telefone: '82 999 0011',
    praca: 'Matola',
    tipoViatura: 'carrinha Master',
    matricula: 'EE-33-FF',
    cargaMax: '1,5 toneladas',
    servicos: ['mudanca', 'moveis', 'outro'],
    status: 'pendente',
    pagamentosConfirmados: false,
  })

  // Pedidos e avaliações de exemplo
  const pedidoExiste = await prisma.pedido.findFirst()
  if (!pedidoExiste) {
    await prisma.pedido.createMany({
      data: [
        {
          tipoCarga: 'mudanca',
          praca: 'Zimpeto',
          origem: 'Bairro da Liberdade, Zimpeto',
          destino: 'Matola, Rua dos Pescadores',
          veiculoSugerido: 'carrinha 2t',
          contacto: '84 777 8899',
        },
        {
          tipoCarga: 'mercadoria',
          praca: 'Maputo',
          origem: 'Mercado Central, Maputo',
          destino: 'Xai-Xai',
          veiculoSugerido: 'camião',
        },
        {
          tipoCarga: 'construcao',
          praca: 'Maputo',
          origem: 'Cimentoeira, Maputo',
          destino: 'Zimpeto',
          contacto: '86 123 4567',
        },
      ],
    })
    console.log('✓ 3 pedidos de exemplo criados')
  }

  const avaliacaoExiste = await prisma.avaliacao.findFirst()
  if (!avaliacaoExiste) {
    await prisma.avaliacao.createMany({
      data: [
        { motoristaId: carlos.id, nota: 5, comentario: 'Pontual e cuidadoso com a carga.' },
        { motoristaId: carlos.id, nota: 4, comentario: 'Bom serviço, preço justo.' },
        { motoristaId: carlos.id, nota: 5, comentario: null },
        { motoristaId: amelia.id, nota: 4, comentario: 'Viatura grande e limpa.' },
      ],
    })
    console.log('✓ 4 avaliações de exemplo criadas')
  }

  console.log('\nSeed concluído.')
  console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@freta.co.mz'} / ${process.env.ADMIN_SENHA || 'admin123'}`)
  console.log('Motoristas de teste: carlos@freta.co.mz, amelia@freta.co.mz (senha: freta12345)')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
