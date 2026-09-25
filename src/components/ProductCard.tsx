import { Link } from '@tanstack/react-router'
import type { Product } from '../data/products'
import { money } from '../lib/format'
import { useShop } from '../lib/shop'
import { trackCommerce } from '../lib/analytics'

export function ProductCard({ product }: { product: Product }) {
  const shop = useShop()
  const liked = shop.wishlist.includes(product.id)
  const compared = shop.compare.includes(product.id)
  return <article className="product-card">
    <div className="product-media">
      <Link to="/termek/$slug" params={{ slug: product.slug }}><img src={product.art} alt={product.name}/></Link>
      <div className="badges">{product.newArrival && <span className="badge">ÚJ</span>}{product.trending && <span className="badge badge-dark">TREND</span>}</div>
      <button className={`heart ${liked ? 'selected' : ''}`} onClick={() => { shop.toggleWishlist(product.id); trackCommerce('add_to_wishlist', product) }} aria-label="Kedvencek">{liked ? '♥' : '♡'}</button>
    </div>
    <div className="product-body">
      <p className="product-meta">{product.brand} · {product.category}</p>
      <Link to="/termek/$slug" params={{ slug: product.slug }} className="product-title">{product.name}</Link>
      <div className="rating"><span>★ {product.rating}</span><small>({product.reviewCount})</small></div>
      <div className="price-row"><strong>{money(product.retailPrice)}</strong>{product.compareAtPrice && <del>{money(product.compareAtPrice)}</del>}</div>
      <div className="stock-line"><i className={product.stock > 10 ? 'in-stock' : 'low-stock'}></i>{product.stock > 10 ? 'Raktáron' : `Már csak ${product.stock} db`}</div>
      <div className="card-actions"><button className="btn btn-primary" onClick={() => { shop.addToCart(product.id); trackCommerce('add_to_cart', product) }}>Kosárba</button><button className={`btn btn-icon ${compared ? 'active' : ''}`} onClick={() => shop.toggleCompare(product.id)} title="Összehasonlítás">⇄</button></div>
    </div>
  </article>
}
