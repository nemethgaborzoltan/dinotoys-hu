import { describe, expect, it } from 'vitest'
import { amountUntilFreeShipping, percentageDiscount, shippingFee } from './commerce-rules'

describe('commerce rules', () => {
  it('makes standard shipping free from the threshold', () => {
    expect(shippingFee(14_999)).toBe(1490)
    expect(shippingFee(15_000)).toBe(0)
    expect(amountUntilFreeShipping(13_400)).toBe(1600)
  })

  it('caps percentage discounts', () => {
    expect(percentageDiscount(20_000, 10)).toBe(2000)
    expect(percentageDiscount(100_000, 20, 5000)).toBe(5000)
  })
})
