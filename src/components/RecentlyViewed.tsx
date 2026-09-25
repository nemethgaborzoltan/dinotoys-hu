import { products } from '../data/products'
import { useShop } from '../lib/shop'
import { ProductCard } from './ProductCard'

export function RecentlyViewed() {
  const { recentlyViewed } = useShop()
  const list = recentlyViewed.map(id => products.find(p => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p)).slice(0, 4)
  if (!list.length) return null
  return <section className="container section"><div className="section-head"><div><span className="eyebrow">Folytasd innen</span><h2>Nemrég megnézted</h2></div></div><div className="product-grid">{list.map(p => <ProductCard key={p.id} product={p} />)}</div></section>
}
