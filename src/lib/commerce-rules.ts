export const FREE_SHIPPING_THRESHOLD_HUF = 15_000

export function shippingFee(subtotalHuf: number, standardFeeHuf = 1490) {
  if (subtotalHuf < 0) throw new Error('Subtotal cannot be negative')
  return subtotalHuf >= FREE_SHIPPING_THRESHOLD_HUF ? 0 : standardFeeHuf
}

export function amountUntilFreeShipping(subtotalHuf: number) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_HUF - subtotalHuf)
}

export function percentageDiscount(subtotalHuf: number, percent: number, maxDiscountHuf?: number) {
  if (percent < 0 || percent > 100) throw new Error('Invalid discount')
  const raw = Math.round(subtotalHuf * percent / 100)
  return maxDiscountHuf == null ? raw : Math.min(raw, maxDiscountHuf)
}
