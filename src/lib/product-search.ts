import type { Product } from '../data/products'

const normalize = (value: string) => value.toLocaleLowerCase('hu').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export function matchesProductQuery(product: Product, query: string) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean)
  const text = normalize([product.name, product.brand, product.sourceSku, product.ean, ...product.tags].join(' '))
  return terms.every(term => text.includes(term))
}
