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

export const VALOR_MENSALIDADE_MT = 120

export const SERVICO_LABELS: Record<string, string> = Object.fromEntries(
  SERVICOS.map((s) => [s.value, s.label])
)
