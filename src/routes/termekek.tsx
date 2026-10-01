import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { z } from 'zod'
import { ProductCard } from '../components/ProductCard'
import { categories as demoCategories, products as demoProducts } from '../data/products'
import { getCatalogData } from '../server/storefront'
import { getProductDisplayCompareAtPrice, getProductDisplayPrice, getProductStock } from '../lib/catalog'
import {absoluteUrl} from '../lib/seo'
import {matchesProductQuery} from '../lib/product-search'

const searchSchema=z.object({category:z.string().optional(),brand:z.string().optional(),q:z.string().optional(),age:z.coerce.number().optional(),max:z.coerce.number().optional(),stock:z.enum(['1']).optional(),sale:z.enum(['1']).optional(),sort:z.string().optional()})
export const Route=createFileRoute('/termekek')({validateSearch:(search)=>searchSchema.parse(search),loader:()=>getCatalogData(),head:()=>({meta:[{title:'Játékok és ajándékötletek | DinoToys.hu'},{name:'description',content:'Böngéssz játékok, plüssök, dínók, járművek, puzzle-k és trendtermékek között. Szűrés kor, kategória és ár szerint.'}],links:[{rel:'canonical',href:absoluteUrl('/termekek')}]}),component:Products})

function Products(){
  const search=Route.useSearch()
  const navigate=Route.useNavigate()
  const data=Route.useLoaderData()
  const products=data?.products?.length?data.products:demoProducts
  const categories=data?.categories?.length?data.categories:demoCategories
  const brands=useMemo(()=>Array.from(new Set(products.map(p=>p.brand).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'hu')),[products])
  const filtered=useMemo(()=>{
    let result=products.filter((p)=>{
      const price=getProductDisplayPrice(p)
      if(search.category&&p.category!==search.category)return false
      if(search.brand&&p.brand!==search.brand)return false
      if(search.age&&p.ageFrom>search.age)return false
      if(search.max&&price>search.max)return false
      if(search.stock&&getProductStock(p)<=0)return false
      if(search.sale){const compareAt=getProductDisplayCompareAtPrice(p);if(!compareAt||compareAt<=price)return false}
      if(search.q&&!matchesProductQuery(p,search.q))return false
      return true
    })
    if(search.sort==='price-asc')result=[...result].sort((a,b)=>getProductDisplayPrice(a)-getProductDisplayPrice(b))
    if(search.sort==='price-desc')result=[...result].sort((a,b)=>getProductDisplayPrice(b)-getProductDisplayPrice(a))
    if(search.sort==='rating')result=[...result].sort((a,b)=>b.rating-a.rating)
    if(search.sort==='trending')result=[...result].sort((a,b)=>Number(Boolean(b.trending))-Number(Boolean(a.trending)))
    return result
  },[search,products])
  const set=(patch:Record<string,unknown>)=>navigate({search:(prev)=>({...prev,...patch})})
  const activeCount=[search.category,search.brand,search.age,search.max,search.stock,search.sale,search.q].filter(Boolean).length
  const title=search.q?`Találatok: „${search.q}”`:search.brand||search.category||'Minden játék'
  return <div className="container section catalog-page"><div className="catalog-title"><div><span className="eyebrow">DinoToys katalógus</span><h1>{title}</h1><p>{filtered.length} termék{activeCount?` · ${activeCount} aktív szűrő`:''}</p></div><div className="catalog-actions"><select value={search.sort||''} onChange={(e)=>set({sort:e.target.value||undefined})}><option value="">Ajánlott sorrend</option><option value="trending">Trend</option><option value="rating">Legjobbra értékelt</option><option value="price-asc">Ár: növekvő</option><option value="price-desc">Ár: csökkenő</option></select></div></div><div className="catalog-layout"><aside className="filters filters-pro"><div className="filters-head"><div><b>Szűrők</b><small>{activeCount?activeCount+' aktív':'Találd meg gyorsabban'}</small></div>{activeCount>0&&<button onClick={()=>navigate({search:{}})}>Törlés</button>}</div><div className="filter-block"><b>Keresés</b><input value={search.q||''} onChange={(e)=>set({q:e.target.value||undefined})} placeholder="pl. Play-Doh, Barbie…"/></div><div className="filter-block"><b>Márka</b><select value={search.brand||''} onChange={e=>set({brand:e.target.value||undefined})}><option value="">Minden márka</option>{brands.map(brand=><option key={brand} value={brand}>{brand}</option>)}</select></div><div className="filter-block"><b>Kategória</b><button className={!search.category?'selected':''} onClick={()=>set({category:undefined})}>Mind</button>{categories.map((c)=><button key={c.name} className={search.category===c.name?'selected':''} onClick={()=>set({category:c.name})}>{c.icon} {c.name}</button>)}</div><div className="filter-block"><b>Gyors szűrők</b><div className="filter-chips"><button className={search.stock?'selected':''} onClick={()=>set({stock:search.stock?undefined:'1'})}>✓ Készleten</button><button className={search.sale?'selected':''} onClick={()=>set({sale:search.sale?undefined:'1'})}>% Akciós</button></div></div><div className="filter-block"><b>Életkor</b><div className="filter-chips">{[3,4,6,8,10].map((age)=><button key={age} className={search.age===age?'selected':''} onClick={()=>set({age:search.age===age?undefined:age})}>{age}+ év</button>)}</div></div><div className="filter-block"><b>Maximum ár</b><div className="filter-chips">{[3000,5000,8000,10000,15000].map((max)=><button key={max} className={search.max===max?'selected':''} onClick={()=>set({max:search.max===max?undefined:max})}>{max/1000}k</button>)}</div></div></aside><div>{filtered.length?<div className="product-grid catalog-grid">{filtered.map((p)=><ProductCard key={p.id} product={p}/>)}</div>:<div className="empty-state large"><span>🧩</span><h3>Nincs találat</h3><button className="btn btn-primary" onClick={()=>navigate({search:{}})}>Szűrők törlése</button></div>}</div></div></div>
}
