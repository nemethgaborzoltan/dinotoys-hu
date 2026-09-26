import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import { matchesProductQuery } from './product-search'

const barbie = products.find(product => product.sourceSku === 'JFP42')!

describe('Barbie JFP42 kereshetősége', () => {
  it('a beszállítói névvel, az azonosítóval és ékezet nélkül is megtalálható', () => {
    expect(matchesProductQuery(barbie, 'Mattel Barbie Luxus stílusú pop kék metálfényezéss')).toBe(true)
    expect(matchesProductQuery(barbie, 'JFP42')).toBe(true)
    expect(matchesProductQuery(barbie, 'kek metalfenyu barbie')).toBe(true)
  })
})
