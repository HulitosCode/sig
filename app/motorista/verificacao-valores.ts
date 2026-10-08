import type { VerificacaoValores } from '@/app/motorista/perfil/verificacao-form'

type Utilizador = { id: string; name: string }

type MotoristaLeve = {
  telefone: string
  whatsapp: string | null
  praca: string
  tipoViatura: string
  modelo: string | null
  ano: number | null
  matricula: string
  cargaMax: string
  servicos: string[]
  precoKm: string | null
  observacoes: string | null
  fotoUrl: string | null
  biFrenteUrl: string | null
  biVersoUrl: string | null
  fotoFrenteUrl: string | null
  fotoEsquerdaUrl: string | null
  fotoDireitaUrl: string | null
  fotoTraseiraUrl: string | null
}

/** Converte utilizador + motorista (ou null) nos valores do formulário. */
export function paraVerificacaoValores(
  user: Utilizador,
  motorista: MotoristaLeve | null
): VerificacaoValores {
  return {
    nome: user.name,
    telefone: motorista?.telefone ?? '',
    whatsapp: motorista?.whatsapp ?? '',
    praca: motorista?.praca || '',
    tipoViatura: motorista?.tipoViatura ?? '',
    modelo: motorista?.modelo ?? '',
    ano: motorista?.ano ? String(motorista.ano) : '',
    matricula: motorista?.matricula ?? '',
    cargaMax: motorista?.cargaMax ?? '',
    servicos: motorista?.servicos ?? [],
    precoKm: motorista?.precoKm ?? '',
    observacoes: motorista?.observacoes ?? '',
    fotoUrl: motorista?.fotoUrl ?? '',
    biFrenteUrl: motorista?.biFrenteUrl ?? '',
    biVersoUrl: motorista?.biVersoUrl ?? '',
    fotoFrenteUrl: motorista?.fotoFrenteUrl ?? '',
    fotoEsquerdaUrl: motorista?.fotoEsquerdaUrl ?? '',
    fotoDireitaUrl: motorista?.fotoDireitaUrl ?? '',
    fotoTraseiraUrl: motorista?.fotoTraseiraUrl ?? '',
  }
}
