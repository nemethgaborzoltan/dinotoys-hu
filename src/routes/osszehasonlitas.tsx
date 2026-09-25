import { createFileRoute, Link } from '@tanstack/react-router'
import { money } from '../lib/format'
import { useShop } from '../lib/shop'
import { getDefaultVariant, getProductDisplayPrice, getProductStock } from '../lib/catalog'
export const Route=createFileRoute('/osszehasonlitas')({component:Compare})
function Compare(){
  const shop=useShop()
  const list=shop.compare.map((id)=>shop.getProduct(id)).filter((p):p is NonNullable<typeof p>=>Boolean(p))
  if(!list.length)return <div className="container section"><div className="empty-state large"><span>⇄</span><h1>Összehasonlítás</h1><p>Legfeljebb 4 terméket tehetsz egymás mellé.</p><Link to="/termekek" search={{}} className="btn btn-primary">Termékek</Link></div></div>
  return <div className="container section"><div className="page-title"><span className="eyebrow">Döntéstámogató nézet</span><h1>Összehasonlítás</h1></div><div className="compare-grid">{list.map((p)=>{const variant=getDefaultVariant(p);return <div className="compare-card" key={p.id}><button className="compare-remove" onClick={()=>shop.toggleCompare(p.id)}>×</button><img src={variant?.art??p.art}/><h3>{p.name}</h3><strong>{p.variants?.length?'-tól '+money(getProductDisplayPrice(p)):money(getProductDisplayPrice(p))}</strong><dl><div><dt>Márka</dt><dd>{p.brand}</dd></div><div><dt>Kor</dt><dd>{p.ageFrom}+ év</dd></div><div><dt>Variáns</dt><dd>{p.variants?.length??0}</dd></div><div><dt>Készlet</dt><dd>{getProductStock(p)} db</dd></div></dl><button className="btn btn-primary" onClick={()=>shop.addToCart(p.id,1,p,variant?.id)}>Kosárba</button></div>})}</div></div>
}
