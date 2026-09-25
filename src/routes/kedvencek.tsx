import { createFileRoute, Link } from '@tanstack/react-router'
import { ProductCard } from '../components/ProductCard'
import { products } from '../data/products'
import { useShop } from '../lib/shop'
export const Route = createFileRoute('/kedvencek')({ component: Wishlist })
function Wishlist(){ const shop=useShop(); const list=products.filter(p=>shop.wishlist.includes(p.id)); return <div className="container section"><div className="page-title"><span className="eyebrow">Mentett ötletek</span><h1>Kedvenceim</h1><p>{list.length} termék</p></div>{list.length?<div className="product-grid">{list.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="empty-state large"><span>♡</span><h3>Még nincs elmentett játék</h3><p>A szív ikonra kattintva ide gyűjtheted az ötleteket.</p><Link to="/termekek" search={{}} className="btn btn-primary">Termékek felfedezése</Link></div>}</div> }
