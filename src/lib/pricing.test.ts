import { describe, expect, it } from 'vitest'
import { calculateRetailPrice, canPublishProduct } from './pricing'

describe('pricing', () => {
  it('builds a VAT-inclusive retail price from landed cost and target margin', () => {
    const result = calculateRetailPrice({ supplierNetEur: 10, eurHuf: 400, inboundPerUnitHuf: 300, targetGrossMargin: 0.4 })
    expect(result.landedNet).toBe(4300)
    expect(result.grossRetail).toBeGreaterThan(4300 * 1.27)
    expect(result.grossMargin).toBeGreaterThanOrEqual(0.39)
  })

  it('blocks publishing if required safety fields are missing', () => {
    const result = canPublishProduct({ name: 'Demo', sku: '1', price: 2990, stock: 1, imageCount: 1 })
    expect(result.ok).toBe(false)
    expect(result.missing).toContain('manufacturer')
    expect(result.missing).toContain('responsible_person')
    expect(result.missing).toContain('safety_warning')
  })
})
