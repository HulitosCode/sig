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
  'Chimoio',
  'Nampula',
  'Tete',
  'Quelimane',
  'Cabo Delgado',
  'Niassa',
] as const

export type PracaValue = (typeof PRACAS)[number]

// Províncias de Moçambique (11) — o motorista selecciona a sua no cadastro.
export const PROVINCIAS = [
  'Maputo Cidade',
  'Maputo',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Zambézia',
  'Tete',
  'Nampula',
  'Niassa',
  'Cabo Delgado',
] as const

export type ProvinciaValue = (typeof PROVINCIAS)[number]

// Praça → província + coordenadas do hub (aprox.) para ordenar por
// proximidade real (haversine) e distribuir motoristas.
export const PRACAS_INFO: Record<
  PracaValue,
  { provincia: ProvinciaValue; lat: number; lng: number }
> = {
  Maputo: { provincia: 'Maputo Cidade', lat: -25.9692, lng: 32.5732 },
  Matola: { provincia: 'Maputo', lat: -25.9623, lng: 32.4589 },
  Marracuene: { provincia: 'Maputo', lat: -25.4747, lng: 32.6736 },
  Zimpeto: { provincia: 'Maputo', lat: -25.4864, lng: 32.6596 },
  Benfica: { provincia: 'Maputo', lat: -25.7883, lng: 32.674 },
  Boane: { provincia: 'Maputo', lat: -25.7667, lng: 32.6333 },
  Namaacha: { provincia: 'Maputo', lat: -26.0833, lng: 32.5833 },
  'Xai-Xai': { provincia: 'Gaza', lat: -25.0469, lng: 33.6394 },
  Chokwé: { provincia: 'Gaza', lat: -24.5333, lng: 33.0167 },
  Inhambane: { provincia: 'Inhambane', lat: -23.865, lng: 35.3833 },
  Beira: { provincia: 'Sofala', lat: -19.8436, lng: 34.8389 },
  Chimoio: { provincia: 'Manica', lat: -19.1167, lng: 33.4833 },
  Nampula: { provincia: 'Nampula', lat: -15.4167, lng: 39.2167 },
  Tete: { provincia: 'Tete', lat: -16.1667, lng: 33.6 },
  Quelimane: { provincia: 'Zambézia', lat: -17.8786, lng: 36.8883 },
  // Hub provincial (sede): cidade de Pemba.
  'Cabo Delgado': { provincia: 'Cabo Delgado', lat: -12.977, lng: 40.5158 },
  Niassa: { provincia: 'Niassa', lat: -13.3133, lng: 35.2419 },
}

// Praças de uma província (select em cascata do cadastro do motorista).
export function pracasDaProvincia(provincia: string): PracaValue[] {
  return PRACAS.filter((p) => PRACAS_INFO[p].provincia === provincia)
}

// Província de uma praça (defensivo: praças fora da tabela → undefined).
export function provinciaDaPraca(praca: string): ProvinciaValue | undefined {
  return PRACAS_INFO[praca as PracaValue]?.provincia
}

// Distância em km entre dois pontos (haversine) — ordenação por proximidade.
export function distanciaKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(s)) * 10) / 10
}

// Distância entre duas praças (null se alguma for desconhecida).
export function distanciaEntrePracas(
  pracaA: string,
  pracaB: string
): number | null {
  const a = PRACAS_INFO[pracaA as PracaValue]
  const b = PRACAS_INFO[pracaB as PracaValue]
  return a && b ? distanciaKm(a, b) : null
}

export const DISPONIBILIDADES = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'ocupado', label: 'Ocupado' },
  // Inactivo = não está a trabalhar: não aparece nas pesquisas dos clientes.
  { value: 'indisponivel', label: 'Inativo' },
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
