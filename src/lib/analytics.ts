import type { Product } from '../data/products'

export type ConsentPreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

const consentKey = 'dinotoys-consent-v1'

export function getConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(consentKey)
    return stored ? JSON.parse(stored) as ConsentPreferences : null
  } catch { return null }
}

export function saveConsent(preferences: Omit<ConsentPreferences, 'necessary'>) {
  if (typeof window === 'undefined') return
  const value: ConsentPreferences = { necessary: true, ...preferences }
  window.localStorage.setItem(consentKey, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('dinotoys:consent', { detail: value }))
}

export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  const consent = getConsent()
  if (!consent?.analytics) return
  const w = window as typeof window & { dataLayer?: Array<Record<string, unknown>> }
  w.dataLayer ||= []
  w.dataLayer.push({ event, ...payload })
}

export function trackCommerce(event: 'view_item' | 'add_to_cart' | 'add_to_wishlist', product: Product, quantity = 1) {
  track(event, {
    currency: 'HUF',
    value: product.retailPrice * quantity,
    items: [{ item_id: product.sourceSku, item_name: product.name, item_brand: product.brand, item_category: product.category, price: product.retailPrice, quantity }],
  })
}
