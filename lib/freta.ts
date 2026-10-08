// Constantes de domínio do FRETA (pt-MZ)

export const SERVICOS = [
  { value: 'mudanca', label: 'Mudança de casa' },
  { value: 'mercadoria', label: 'Transporte de mercadoria' },
  { value: 'moveis', label: 'Móveis' },
  { value: 'construcao', label: 'Material de construção' },
  { value: 'pesada', label: 'Carga pesada' },
  { value: 'outro', label: 'Outro frete' },
] as const

export type ServicoValue = (typeof SERVICOS)[number]['value']

// Tipos de carro (select do cadastro de verificação).
export const TIPOS_CARRO = [
  'Carrinha de passageiros',
  'Carrinha de carga',
  'Camião ligeiro',
  'Camião',
  'Pick-up',
  'Furgão',
  'Trator',
  'Outro',
] as const

export const PRACAS = [
  'Maputo',
  'Matola',
  'Marracuene',
  'Zimpeto',
  'Benfica',
  'Boane',
  'Namaacha',
  'Xai-Xai',
  'Chokwé',
  'Inhambane',
  'Beira',
  'Nampula',
  'Tete',
  'Quelimane',
  'Cabo Delgado',
  'Niassa',
] as const

export type PracaValue = (typeof PRACAS)[number]

export const DISPONIBILIDADES = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'ocupado', label: 'Ocupado' },
  { value: 'indisponivel', label: 'Indisponível' },
] as const

export const VALOR_MENSALIDADE_MT = 480
// Cadastro de motorista: grátis (sem custo de registo).

// Contactos de suporte FRETA (chamadas e WhatsApp).
export const SUPORTE = {
  telefone: '843779669',
  telefoneFormatado: '843 779 669',
  telefoneIntl: '+258843779669',
  whatsapp: 'https://wa.me/258843779669',
} as const

// Formata valores em MT com ponto de milhar (ex.: 1440 → "1.440").
export function formatMt(valor: number): string {
  return String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export const SERVICO_LABELS: Record<string, string> = Object.fromEntries(
  SERVICOS.map((s) => [s.value, s.label])
)
