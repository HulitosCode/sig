import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PerfilTransportador {
  bi: string;
  tipoCarro: string;
  categoria: string;
  matricula: string;
  cargaMax: string;
  precoKm?: string;
  viagemLonga?: boolean;
  zonas?: string;
  obs?: string;
}

interface PerfilFornecedor {
  nif: string;
  provincia: string;
  produtos: string;
  obs?: string;
}

interface Exemplo {
  nome: string;
  email: string;
  telefone: string;
  whatsapp?: string;
  tipo: "transportador" | "fornecedor";
  perfil: PerfilTransportador | PerfilFornecedor;
}

const EXEMPLOS: Exemplo[] = [
  {
    nome: "João Machava", email: "joao@exemplo.co.mz", telefone: "+258 82 000 0001",
    whatsapp: "+258 82 000 0001", tipo: "transportador",
    perfil: {
      bi: "1000001T", tipoCarro: "Camião 4 eixos", categoria: "Camiões",
      matricula: "AAA-234-MZ", cargaMax: "20.000 kg", precoKm: "15",
      viagemLonga: true, zonas: "Maputo, Gaza, Sofala, Manica, Tete",
      obs: "Longo curso, materiais de construção e mercadorias pesadas."
    }
  },
  {
    nome: "Maria Nhantumbo", email: "maria@exemplo.co.mz", telefone: "+258 84 000 0002",
    whatsapp: "+258 84 000 0002", tipo: "transportador",
    perfil: {
      bi: "1000002T", tipoCarro: "Carrinha de carga", categoria: "Carrinhas (Vans)",
      matricula: "BBB-118-MZ", cargaMax: "1.200 kg", precoKm: "12",
      viagemLonga: false, zonas: "Maputo Cidade, Maputo, Gaza",
      obs: "Entregas rápidas e mudanças pequenas."
    }
  },
  {
    nome: "Carlos Sitoe", email: "carlos@exemplo.co.mz", telefone: "+258 87 000 0003",
    whatsapp: "+258 87 000 0003", tipo: "transportador",
    perfil: {
      bi: "1000003T", tipoCarro: "Minibus 22 lugares", categoria: "Minibus",
      matricula: "CCC-722-MZ", cargaMax: "1.800 kg", precoKm: "10",
      viagemLonga: true, zonas: "Maputo, Inhambane, Sofala",
      obs: "Carga mista e passageiros."
    }
  },
  {
    nome: "Ernesto Bila", email: "ernesto@exemplo.co.mz", telefone: "+258 82 000 0005",
    whatsapp: "+258 82 000 0005", tipo: "transportador",
    perfil: {
      bi: "1000004T", tipoCarro: "Camião longo curso", categoria: "Camiões",
      matricula: "EEE-308-MZ", cargaMax: "32.000 kg", precoKm: "13",
      viagemLonga: true, zonas: "Todas as províncias",
      obs: "Longo curso, todo o país."
    }
  },
  {
    nome: "Distribuidora Nhamatanda, Lda", email: "nhamatanda@exemplo.co.mz",
    telefone: "+258 82 100 0001", whatsapp: "+258 82 100 0001", tipo: "fornecedor",
    perfil: { nif: "400123456", provincia: "Sofala", produtos: "Materiais de construção", obs: "Entregas na região centro." }
  },
  {
    nome: "AgroTete, Lda", email: "agro@exemplo.co.mz",
    telefone: "+258 87 100 0003", whatsapp: "+258 87 100 0003", tipo: "fornecedor",
    perfil: { nif: "400345678", provincia: "Tete", produtos: "Produtos agrícolas", obs: "" }
  },
  {
    nome: "Comércio do Norte, Lda", email: "norte@exemplo.co.mz",
    telefone: "+258 86 100 0004", whatsapp: "+258 86 100 0004", tipo: "fornecedor",
    perfil: { nif: "400456789", provincia: "Nampula", produtos: "Eletrodomésticos e móveis", obs: "Entregas no norte do país." }
  }
];

async function main() {
  for (const ex of EXEMPLOS) {
    const existe = await prisma.user.findUnique({ where: { email: ex.email } });
    if (existe) continue;
    const hash = await bcrypt.hash("123456", 10);
    const user = await prisma.user.create({
      data: {
        nome: ex.nome, email: ex.email, senha: hash,
        telefone: ex.telefone, whatsapp: ex.whatsapp, role: ex.tipo
      }
    });
    if (ex.tipo === "transportador") {
      await prisma.transportador.create({
        data: { userId: user.id, status: "confirmado", pagamento: true, ...(ex.perfil as PerfilTransportador) }
      });
    } else {
      await prisma.fornecedor.create({
        data: { userId: user.id, status: "confirmado", pagamento: true, ...(ex.perfil as PerfilFornecedor) }
      });
    }
  }
  console.log("Seed concluído com sucesso.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
