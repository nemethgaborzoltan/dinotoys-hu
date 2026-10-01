import {Link,createFileRoute} from '@tanstack/react-router'
import {ProductCard} from '../components/ProductCard'
import {products as demoProducts} from '../data/products'
import {getCatalogData} from '../server/storefront'
import {absoluteUrl} from '../lib/seo'

export const Route=createFileRoute('/marka/play-doh')({
 loader:()=>getCatalogData(),
 head:()=>({
  meta:[
   {title:'Play-Doh kreatív játékok és gyurmaszettek | DinoToys.hu'},
   {name:'description',content:'Play-Doh gyurma, kreatív készletek, sütis és utazós játékszettek. Színes alkotás, finommotorika és ajándékötletek 2–3 éves kortól.'},
  ],
  links:[{rel:'canonical',href:absoluteUrl('/marka/play-doh')}],
 }),
 component:PlayDohBrand,
})

function PlayDohBrand(){
 const data=Route.useLoaderData()
 const source=data?.products?.length?data.products:demoProducts
 const playdoh=source.filter(p=>p.brand==='Play-Doh')
 const hero=playdoh.find(p=>p.sourceSku==='A9305T040')??playdoh[0]
 const fourPack=playdoh.find(p=>p.sourceSku==='B6508ES00')
 const cupcakes=playdoh.find(p=>p.sourceSku==='F75275X01')
 const airplane=playdoh.find(p=>p.sourceSku==='F88045L01')
 return <div className="playdoh-brand-page">
  <section className="pd-brand-hero">
   <div className="pd-blob pd-blob-a" aria-hidden="true"/><div className="pd-blob pd-blob-b" aria-hidden="true"/><div className="pd-blob pd-blob-c" aria-hidden="true"/>
   <div className="pd-brand-copy">
    <span>PLAY-DOH · KREATÍV VILÁG</span>
    <h1>Nyomd.<br/><em>Formázd.</em><br/>Alkosd újra.</h1>
    <p>Színek, formák és végtelen ötletek egy helyen. A Play-Doh márkavilág olyan játékokat gyűjt össze, amelyek egyszerre szórakoztatnak, mozgatják a kis kezeket és új történetekre inspirálnak.</p>
    <div className="pd-brand-actions">
     <a href="#playdoh-termekek" className="btn pd-btn-red">Felfedezem a készleteket →</a>
     {fourPack&&<Link to="/termek/$slug" params={{slug:fourPack.slug}} className="btn pd-btn-yellow">Kezdőcsomagot keresek</Link>}
    </div>
    <div className="pd-brand-trust"><b>2–3+ éves kortól</b><b>Hasbro</b><b>Kreatív fejlesztő játék</b></div>
   </div>
   <div className="pd-brand-stage" aria-label="Kiemelt Play-Doh termékek">
    {hero&&<Link to="/termek/$slug" params={{slug:hero.slug}} className="pd-hero-product pd-hero-main"><img src={hero.art} alt={hero.name}/><span>30+ ESZKÖZ</span></Link>}
    {cupcakes&&<Link to="/termek/$slug" params={{slug:cupcakes.slug}} className="pd-hero-product pd-hero-float pd-float-one"><img src={cupcakes.art} alt={cupcakes.name}/></Link>}
    {airplane&&<Link to="/termek/$slug" params={{slug:airplane.slug}} className="pd-hero-product pd-hero-float pd-float-two"><img src={airplane.art} alt={airplane.name}/></Link>}
    <i className="pd-shadow" aria-hidden="true"/>
   </div>
  </section>

  <section className="pd-benefit-strip container-wide">
   <div><span>🎨</span><b>Szabad alkotás</b><small>Nincs egyetlen jó megoldás — minden játék más lehet.</small></div>
   <div><span>✋</span><b>Finommotorika</b><small>Gyúrás, nyomás, sodrás és formázás játék közben.</small></div>
   <div><span>🎁</span><b>Könnyű ajándék</b><small>Kicsi és nagy készletek többféle kerethez.</small></div>
   <div><span>🔁</span><b>Újrajátszható</b><small>Ugyanabból a gyurmából mindig új világ születhet.</small></div>
  </section>

  <section className="container section pd-product-section" id="playdoh-termekek">
   <div className="section-head"><div><span className="eyebrow">Play-Doh kollekció</span><h2>Válassz kreatív küldetést</h2></div><Link to="/termekek" search={{q:'Play-Doh'}}>Összes Play-Doh találat →</Link></div>
   <div className="product-grid">{playdoh.map(p=><ProductCard key={p.id} product={p}/>)}</div>
  </section>

  <section className="container pd-story-grid">
   <article className="pd-story-card pd-story-red"><span>KONYHAI KALAND</span><h2>Süti, muffin, díszítés — kalória nélkül.</h2><p>A Cookie Creations és a Cupcakes szettek a gyurmázást szerepjátékkal kombinálják. A gyerek nem csak formáz: saját mini cukrászdát talál ki.</p>{cupcakes&&<Link to="/termek/$slug" params={{slug:cupcakes.slug}}>Cupcakes szett →</Link>}</article>
   <article className="pd-story-card pd-story-blue"><span>UTAZÓ KÉPZELET</span><h2>Repülj oda, ahová a történet visz.</h2><p>Az Airplane Explorer a térképet, repülőt és Play-Doh formázást egy játékélményben kapcsolja össze.</p>{airplane&&<Link to="/termek/$slug" params={{slug:airplane.slug}}>Airplane Explorer →</Link>}</article>
  </section>

  <section className="container pd-bundle-lab">
   <div><span>PLAY-DOH MIX LAB</span><h2>Építs saját kreatív csomagot.</h2><p>Indulj egy 4-es klasszikus színcsomaggal, majd adj hozzá egy nagy eszközkészletet vagy tematikus játékszettet. Így a gyurma nem fogy el a történet közepén, és többféle játékötlet marad kéznél.</p></div>
   <div className="pd-bundle-orbit" aria-hidden="true"><i/><i/><i/><i/><b>PLAY<br/>MORE</b></div>
  </section>
 </div>
}
