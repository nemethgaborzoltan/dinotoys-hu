import {createFileRoute} from '@tanstack/react-router'
import {useMemo,useState} from 'react'
import {ProductCard} from '../components/ProductCard'
import {products as demoProducts} from '../data/products'
import {getCatalogData} from '../server/storefront'
import {absoluteUrl} from '../lib/seo'
import {giftMatchLabel,giftOccasionLabels,giftPlayStyleLabels,rankGiftProducts,type GiftOccasion,type GiftPlayStyle} from '../lib/gift-finder'

export const Route=createFileRoute('/ai-ajandekkereso')({
 loader:()=>getCatalogData(),
 head:()=>({meta:[{title:'Ajándékkereső gyerekeknek | DinoToys.hu'},{name:'description',content:'Keress játékajándékot életkor, keret, érdeklődés, alkalom és játékstílus alapján a DinoToys.hu ajándékkeresőjével.'}],links:[{rel:'canonical',href:absoluteUrl('/ai-ajandekkereso')}]}),
 component:GiftFinder
})

const playStyles=Object.keys(giftPlayStyleLabels) as GiftPlayStyle[]
const occasions=Object.keys(giftOccasionLabels) as GiftOccasion[]

function GiftFinder(){
 const data=Route.useLoaderData(),products=data?.products?.length?data.products:demoProducts
 const brands=useMemo(()=>Array.from(new Set(products.map(p=>p.brand).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'hu')).slice(0,14),[products])
 const [age,setAge]=useState(7),[budget,setBudget]=useState(10000),[interest,setInterest]=useState(''),[occasion,setOccasion]=useState<GiftOccasion>('birthday'),[styles,setStyles]=useState<GiftPlayStyle[]>([]),[selectedBrands,setSelectedBrands]=useState<string[]>([]),[inStockOnly,setInStockOnly]=useState(true),[searched,setSearched]=useState(false)
 const recommendations=useMemo(()=>rankGiftProducts(products,{age,budget,interest,occasion,playStyles:styles,brands:selectedBrands,inStockOnly}).slice(0,8),[products,age,budget,interest,occasion,styles,selectedBrands,inStockOnly])
 const toggleStyle=(style:GiftPlayStyle)=>setStyles(current=>current.includes(style)?current.filter(item=>item!==style):[...current,style])
 const toggleBrand=(brand:string)=>setSelectedBrands(current=>current.includes(brand)?current.filter(item=>item!==brand):[...current,brand])
 const reset=()=>{setAge(7);setBudget(10000);setInterest('');setOccasion('birthday');setStyles([]);setSelectedBrands([]);setInStockOnly(true);setSearched(false)}
 return <div className="gift-finder gift-finder-pro">
  <div className="gift-finder-hero">
   <div className="container"><span className="pill">DINO MATCH ✨</span><h1>Ajándékot keresel?<br/><span>Szűkítsük le együtt.</span></h1><p>Nem kell végignézned az egész kínálatot. Mondd el, kinek és milyen alkalomra keresel játékot, mi pedig rangsoroljuk a legjobb találatokat.</p><div className="gift-finder-hero-points"><span>✓ életkor</span><span>✓ keret</span><span>✓ érdeklődés</span><span>✓ játékstílus</span><span>✓ készlet</span></div></div>
  </div>
  <div className="container gift-finder-layout">
   <aside className="gift-finder-panel">
    <div className="gift-finder-panel-head"><div><span className="eyebrow">1 perc</span><h2>Mit keresünk?</h2></div><button onClick={reset}>Alaphelyzet</button></div>
    <section><div className="gift-filter-title"><b>1. Hány éves?</b><strong>{age} éves</strong></div><input className="gift-range" aria-label="Életkor" type="range" min="2" max="16" value={age} onChange={e=>setAge(+e.target.value)}/><div className="gift-range-labels"><span>2</span><span>16+</span></div></section>
    <section><div className="gift-filter-title"><b>2. Mekkora a keret?</b><strong>{budget.toLocaleString('hu-HU')} Ft</strong></div><input className="gift-range" aria-label="Költségkeret" type="range" min="2000" max="30000" step="1000" value={budget} onChange={e=>setBudget(+e.target.value)}/><div className="gift-budget-chips">{[5000,8000,10000,15000,20000].map(value=><button key={value} className={budget===value?'active':''} onClick={()=>setBudget(value)}>{value/1000}k</button>)}</div></section>
    <section><b>3. Milyen alkalom?</b><div className="gift-choice-grid">{occasions.map(item=><button key={item} className={occasion===item?'active':''} onClick={()=>setOccasion(item)}>{giftOccasionLabels[item]}</button>)}</div></section>
    <section><b>4. Mi érdekli?</b><input className="gift-text-input" value={interest} onChange={e=>setInterest(e.target.value)} placeholder="pl. dínó, Stitch, Barbie, autók…"/></section>
    <section><b>5. Milyen játékot szeret?</b><div className="gift-choice-grid styles">{playStyles.map(style=><button key={style} className={styles.includes(style)?'active':''} onClick={()=>toggleStyle(style)}>{giftPlayStyleLabels[style]}</button>)}</div></section>
    <details className="gift-advanced"><summary>További szűrés</summary><div><b>Kedvelt márka</b><div className="gift-brand-cloud">{brands.map(brand=><button key={brand} className={selectedBrands.includes(brand)?'active':''} onClick={()=>toggleBrand(brand)}>{brand}</button>)}</div><label className="gift-stock-toggle"><input type="checkbox" checked={inStockOnly} onChange={e=>setInStockOnly(e.target.checked)}/><span>Csak készleten lévő termék</span></label></div></details>
    <button className="btn btn-primary btn-large gift-find-button" onClick={()=>setSearched(true)}>✨ Mutasd a legjobb ötleteket</button>
   </aside>
   <main className="gift-results">
    {!searched?<div className="gift-results-placeholder"><div className="gift-orb-pro">🎁<span>✨</span><i>🦕</i></div><span className="eyebrow">Személyre szabott lista</span><h2>Állítsd be bal oldalt, kinek keresel.</h2><p>A találatok nem véletlenszerűek: életkor, keret, érdeklődés, játékstílus, márka, készlet és trendérték alapján kapnak pontszámot.</p></div>:<>
     <div className="gift-results-head"><div><span className="eyebrow">Ajánlott játékok</span><h2>{recommendations.length?recommendations.length+' jó ötletet találtunk':'Nincs megfelelő találat'}</h2><p>{recommendations.length?'A legerősebb egyezéseket tettük előre.':'Próbálj nagyobb keretet vagy kevesebb szűrőt.'}</p></div><button className="btn btn-ghost" onClick={()=>setSearched(false)}>Módosítom</button></div>
     {recommendations.length?<div className="gift-recommendation-grid">{recommendations.map((item,index)=><article key={item.product.id} className="gift-recommendation"><div className="gift-match-top"><span>#{index+1}</span><div><b>{giftMatchLabel(item.score)}</b><small>{item.score} pont</small></div></div><ProductCard product={item.product}/><div className="gift-reasons">{item.reasons.map(reason=><span key={reason}>✓ {reason}</span>)}</div></article>)}</div>:<div className="empty-state large"><span>🎁</span><h3>Most nincs pontos találat</h3><p>Növeld a keretet vagy kapcsold ki a csak készleten opciót.</p></div>}
    </>}
   </main>
  </div>
 </div>
}
