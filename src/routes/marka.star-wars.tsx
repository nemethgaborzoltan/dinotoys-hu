import {Link,createFileRoute} from '@tanstack/react-router'
import {ProductCard} from '../components/ProductCard'
import {products as demoProducts} from '../data/products'
import {getCatalogData} from '../server/storefront'
import {absoluteUrl} from '../lib/seo'

export const Route=createFileRoute('/marka/star-wars')({
 loader:()=>getCatalogData(),
 head:()=>({
  meta:[
   {title:'Star Wars játékok és akciófigurák | DinoToys.hu'},
   {name:'description',content:'Star Wars Titan Hero akciófigurák Darth Vaderrel és Stormtrooperrel. Galaktikus ajándékötletek 4 éves kortól.'},
  ],
  links:[{rel:'canonical',href:absoluteUrl('/marka/star-wars')}],
 }),
 component:StarWarsBrand,
})

function StarWarsBrand(){
 const data=Route.useLoaderData()
 const source=data?.products?.length?data.products:demoProducts
 const starWars=source.filter(p=>p.brand==='Star Wars')
 const vader=starWars.find(p=>p.sourceSku==='G1277')
 const storm=starWars.find(p=>p.sourceSku==='G1279')
 return <div className="starwars-brand-page">
  <section className="sw-brand-hero">
   <div className="sw-stars" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></div>
   <div className="sw-brand-copy">
    <span>STAR WARS · TITAN HERO SERIES</span>
    <h1>Egy galaxis.<br/><em>Két oldal.</em></h1>
    <p>Darth Vader sötét ereje vagy a rohamosztagosok fegyelme? Válassz karaktert, építs saját történetet, és indulhat a galaktikus küldetés.</p>
    <div className="sw-brand-actions">
     {vader&&<Link to="/termek/$slug" params={{slug:vader.slug}} className="btn sw-btn-red">Darth Vader →</Link>}
     {storm&&<Link to="/termek/$slug" params={{slug:storm.slug}} className="btn sw-btn-blue">Stormtrooper →</Link>}
    </div>
   </div>
   <div className="sw-brand-visual">
    {vader&&<Link to="/termek/$slug" params={{slug:vader.slug}} className="sw-character sw-character-vader"><img src={vader.art} alt={vader.name}/><span>SÖTÉT OLDAL</span></Link>}
    <div className="sw-versus" aria-hidden="true"><b>VS</b><span/></div>
    {storm&&<Link to="/termek/$slug" params={{slug:storm.slug}} className="sw-character sw-character-storm"><img src={storm.art} alt={storm.name}/><span>BIRODALMI ERŐK</span></Link>}
   </div>
  </section>

  <section className="sw-mission-strip container-wide" aria-label="Star Wars termékelőnyök">
   <div><span>01</span><b>30 CM KATEGÓRIA</b><small>Látványos Titan Hero méret</small></div>
   <div><span>02</span><b>4+ ÉVES KORTÓL</b><small>Szerepjátékhoz és gyűjtéshez</small></div>
   <div><span>03</span><b>HASBRO</b><small>Licencelt Star Wars termékek</small></div>
   <div><span>04</span><b>KARAKTERPÁROS</b><small>A két figura egymás tökéletes párja</small></div>
  </section>

  <section className="container section sw-product-section">
   <div className="section-head"><div><span className="eyebrow">Galaktikus választék</span><h2>Válaszd ki az oldalad</h2></div><Link to="/termekek" search={{q:'Star Wars'}}>Összes Star Wars találat →</Link></div>
   <div className="product-grid">{starWars.map(p=><ProductCard key={p.id} product={p}/>)}</div>
  </section>

  <section className="container sw-lore-panel">
   <div><span>IMPERIAL ARCHIVE</span><h2>Két ikonikus karakter. Két teljesen más játékélmény.</h2><p>Darth Vader a fénykardos párbajokhoz és drámai jelenetekhez erős választás, a Stormtrooper pedig csapatalapú, küldetéses történetekhez ad jó alapot. Együtt már kész mini Star Wars-szettként működnek.</p></div>
   <div className="sw-lore-grid"><article><b>G1277</b><span>Darth Vader</span><small>Fénykard · 5 mozgáspont · 30,5 cm</small></article><article><b>G1279</b><span>Stormtrooper</span><small>Blaster · mozgatható · 30 cm</small></article></div>
  </section>
 </div>
}
