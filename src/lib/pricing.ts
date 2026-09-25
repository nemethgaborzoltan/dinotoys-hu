export type PricingInput = {
  supplierNetEur: number
  eurHuf: number
  inboundPerUnitHuf: number
  targetGrossMargin: number
  vatRate?: number
  psychologicalEnding?: 90 | 99
}

export function calculateRetailPrice({
  supplierNetEur,
  eurHuf,
  inboundPerUnitHuf,
  targetGrossMargin,
  vatRate = 0.27,
  psychologicalEnding = 90,
}: PricingInput) {
  if (supplierNetEur < 0 || eurHuf <= 0 || inboundPerUnitHuf < 0) throw new Error('Invalid cost input')
  if (targetGrossMargin < 0 || targetGrossMargin >= 0.9) throw new Error('Invalid margin')
  const landedNet = supplierNetEur * eurHuf + inboundPerUnitHuf
  const requiredNet = landedNet / (1 - targetGrossMargin)
  const rawGross = requiredNet * (1 + vatRate)
  const hundredBase = Math.max(0, Math.ceil(rawGross / 100) * 100)
  const gross = hundredBase === 0 ? 0 : hundredBase - (100 - psychologicalEnding)
  return { landedNet: Math.round(landedNet), netRetail: Math.round(gross / (1 + vatRate)), grossRetail: Math.round(gross), grossMargin: gross === 0 ? 0 : 1 - landedNet / (gross / (1 + vatRate)) }
}

export function canPublishProduct(input: { name?: string; sku?: string; price?: number; stock?: number; manufacturer?: string; responsiblePerson?: string; warning?: string; imageCount?: number }) {
  const missing: string[] = []
  if (!input.name) missing.push('name')
  if (!input.sku) missing.push('sku')
  if (!input.price || input.price <= 0) missing.push('price')
  if (input.stock == null || input.stock < 0) missing.push('stock')
  if (!input.manufacturer) missing.push('manufacturer')
  if (!input.responsiblePerson) missing.push('responsible_person')
  if (!input.warning) missing.push('safety_warning')
  if (!input.imageCount) missing.push('image')
  return { ok: missing.length === 0, missing }
}
