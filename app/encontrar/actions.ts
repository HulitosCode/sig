'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { rateLimit, extractClientIp } from '@/lib/rate-limit'
import { SERVICOS, PRACAS } from '@/lib/freta'

export type MotoristaResultado = {
  id: number
  nome: string
  fotoUrl: string | null
  praca: string
  tipoViatura: string
  matricula: string
  cargaMax: string
  precoKm: string | null
  telefone: string
  whatsapp: string | null
  disponibilidade: string
  // Opcional: presente nos painéis (contactados podem não estar activos).
  status?: string
  servicos: string[]
  notaMedia: number
  totalAvaliacoes: number
  naMinhaZona: boolean
}

type SearchState = {
  pedidoId?: number
  motoristas?: MotoristaResultado[]
  contactos?: number
  message?: string
  errors?: Record<string, string[]>
}

const searchSchema = z.object({
  tipoCarga: z.string().min(1, 'Escolha o tipo de carga.'),
  praca: z.enum(PRACAS, { message: 'Escolha a praça de origem.' }),
  origem: z.string().min(2, 'Indique onde está a carga.').max(200),
  destino: z.string().min(2, 'Indique para onde vai.').max(200),
  veiculoSugerido: z.string().max(80).optional().or(z.literal('')),
  contacto: z
    .string()
    .min(9, 'Telefone inválido (ex.: 84 123 4567).')
    .max(20)
    .optional()
    .or(z.literal('')),
})

function formatNota(avg: number): number {
  return Math.round(avg * 10) / 10
}

// Pesquisa de motoristas: cria o pedido e devolve os motoristas activos
// adequados (mesma praça primeiro, depois outros com o serviço pedido).
export async function searchMotoristasAction(
  _prev: SearchState,
  formData: FormData
): Promise<SearchState> {
  // Rate-limit: 20 pesquisas / 10 min por IP (anti-scraping).
  const h = await headers()
  const ip = extractClientIp(h.get('x-forwarded-for'), h.get('x-real-ip'))
  if (!rateLimit(`search:${ip}`, 10 * 60 * 1000, 20)) {
    return { message: 'Demasiadas pesquisas. Aguarde alguns minutos.' }
  }

  const raw = {
    tipoCarga: (formData.get('tipoCarga') as string) ?? '',
    praca: (formData.get('praca') as string) ?? '',
    origem: ((formData.get('origem') as string) ?? '').trim(),
    destino: ((formData.get('destino') as string) ?? '').trim(),
    veiculoSugerido: ((formData.get('veiculoSugerido') as string) ?? '').trim(),
    contacto: ((formData.get('contacto') as string) ?? '').trim(),
  }

  const validated = searchSchema.safeParse(raw)
  if (!validated.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(
      validated.error.flatten().fieldErrors
    )) {
      if (value) fieldErrors[key] = value
    }
    return { errors: fieldErrors, message: 'Verifique os campos indicados.' }
  }

  const data = validated.data

  if (!SERVICOS.some((s) => s.value === data.tipoCarga)) {
    return { errors: { tipoCarga: ['Tipo de carga inválido.'] } }
  }

  try {
    // Regista o pedido (fica visível aos motoristas da praça para callback).
    const pedido = await prisma.pedido.create({
      data: {
        tipoCarga: data.tipoCarga,
        praca: data.praca,
        origem: data.origem,
        destino: data.destino,
        veiculoSugerido: data.veiculoSugerido || null,
        contacto: data.contacto || null,
      },
    })

    // Motoristas activos que fazem o serviço pedido.
    const candidatos = await prisma.motorista.findMany({
      where: {
        status: 'ativo',
        disponibilidade: { not: 'indisponivel' },
        servicos: { has: data.tipoCarga },
      },
      include: { user: { select: { name: true } } },
    })

    const motoristaIds = candidatos.map((m) => m.id)
    const avaliacoes = motoristaIds.length
      ? await prisma.avaliacao.groupBy({
          by: ['motoristaId'],
          where: { motoristaId: { in: motoristaIds } },
          _avg: { nota: true },
          _count: { nota: true },
        })
      : []
    const notaByMotorista = new Map(
      avaliacoes.map((a) => [
        a.motoristaId,
        {
          media: formatNota(a._avg.nota ?? 0),
          total: a._count.nota,
        },
      ])
    )

    const resultados: MotoristaResultado[] = candidatos
      .map((m) => {
        const nota = notaByMotorista.get(m.id)
        return {
          id: m.id,
          nome: m.user.name,
          fotoUrl: m.fotoUrl,
          praca: m.praca,
          tipoViatura: m.tipoViatura,
          matricula: m.matricula,
          cargaMax: m.cargaMax,
          precoKm: m.precoKm,
          telefone: m.telefone,
          whatsapp: m.whatsapp,
          disponibilidade: m.disponibilidade,
          servicos: m.servicos,
          notaMedia: nota?.media ?? 0,
          totalAvaliacoes: nota?.total ?? 0,
          naMinhaZona: m.praca === data.praca,
        }
      })
      .sort((a, b) => {
        // Mesma praça primeiro, depois disponíveis, depois melhor avaliados.
        if (a.naMinhaZona !== b.naMinhaZona) return a.naMinhaZona ? -1 : 1
        const dispA = a.disponibilidade === 'disponivel' ? 0 : 1
        const dispB = b.disponibilidade === 'disponivel' ? 0 : 1
        if (dispA !== dispB) return dispA - dispB
        return b.notaMedia - a.notaMedia
      })

    revalidatePath('/encontrar')
    return { pedidoId: pedido.id, motoristas: resultados }
  } catch (error) {
    console.error('[Encontrar] Falha na pesquisa:', error)
    return { message: 'Não foi possível processar a pesquisa. Tente novamente.' }
  }
}

// Regista que o cliente contactou um motorista.
// - Com pedido (pesquisa em /encontrar): associa o motorista ao pedido.
// - Com sessão de cliente: alimenta o histórico de contactos do painel
//   (/cliente — "motoristas com quem já entrou em contacto").
export async function recordContactAction(
  pedidoId: number | null,
  motoristaId: number,
  canal: 'telefone' | 'whatsapp'
): Promise<{ ok: boolean }> {
  const h = await headers()
  const ip = extractClientIp(h.get('x-forwarded-for'), h.get('x-real-ip'))
  if (!rateLimit(`contact:${ip}`, 60 * 1000, 30)) {
    return { ok: false }
  }

  try {
    if (pedidoId) {
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: { motoristaId },
      })
    }

    // Histórico por cliente (só com sessão; anónimos ficam só no pedido).
    const session = await getSession()
    const role = session?.user?.role
    if (session?.user && (role === 'cliente' || role === 'admin')) {
      await prisma.contacto.upsert({
        where: {
          clienteId_motoristaId: {
            clienteId: session.user.id,
            motoristaId,
          },
        },
        // @updatedAt coloca a data do último contacto automaticamente.
        update: { canal, ...(pedidoId ? { pedidoId } : {}) },
        create: {
          clienteId: session.user.id,
          motoristaId,
          pedidoId: pedidoId ?? null,
          canal,
        },
      })
      revalidatePath('/cliente')
    }

    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// Avaliação anónima do motorista (rate-limited por IP).
export async function avaliarMotoristaAction(
  motoristaId: number,
  pedidoId: number | null,
  nota: number,
  comentario: string
): Promise<{ ok: boolean; message?: string }> {
  const h = await headers()
  const ip = extractClientIp(h.get('x-forwarded-for'), h.get('x-real-ip'))
  if (!rateLimit(`avaliacao:${ip}`, 60 * 60 * 1000, 5)) {
    return { ok: false, message: 'Demasiadas avaliações. Tente mais tarde.' }
  }

  const notaValida = Math.round(nota)
  if (notaValida < 1 || notaValida > 5) {
    return { ok: false, message: 'Nota inválida.' }
  }

  try {
    // Confirma que o motorista existe e está activo.
    const motorista = await prisma.motorista.findFirst({
      where: { id: motoristaId, status: 'ativo' },
    })
    if (!motorista) {
      return { ok: false, message: 'Motorista não encontrado.' }
    }

    await prisma.avaliacao.create({
      data: {
        motoristaId,
        pedidoId: pedidoId ?? null,
        nota: notaValida,
        comentario: comentario.trim().slice(0, 500) || null,
      },
    })
    return { ok: true }
  } catch (error) {
    console.error('[Avaliação] Falha:', error)
    return { ok: false, message: 'Não foi possível registar a avaliação.' }
  }
}
