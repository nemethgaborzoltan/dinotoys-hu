import {Link} from '@tanstack/react-router'
import type{Product} from '../data/products'
import type{JsonValue} from '../server/storefront'
import {useResolvedHero} from '../lib/hero'

const price=(value:number)=>new Intl.NumberFormat('hu-HU').format(value)+' Ft'

export function HeroShowcase({products,liveContent}:{products:Product[];liveContent?:Record<string,JsonValue>|null}){
 const hero=useResolvedHero(liveContent)
 const spotlight=products.find(p=>p.id===hero.spotlightProductId)??products.find(p=>p.trending)??products[0]
 const orbit=hero.orbitProductIds.map(id=>products.find(p=>p.id===id)).filter((p):p is Product=>Boolean(p)).slice(0,4)
 if(!spotlight)return null
 if(hero.mode==='showcase')return <CleanShowcaseHero hero={hero} spotlight={spotlight} orbit={orbit}/>
 if(hero.mode==='universe')return <UniverseHero hero={hero} spotlight={spotlight} orbit={orbit}/>
 return <section className={`hero hero-premium hero-mode-${hero.mode} container-wide`} style={{background:hero.background}}>
  <div className="hero-copy hero-copy-premium">{hero.showEyebrow!==false&&<span className="pill">{hero.eyebrow}</span>}<h1>{hero.title}<br/><span>{hero.emphasis}</span></h1><p>{hero.description}</p><div className="hero-actions">{hero.showPrimaryCta!==false&&<a href={hero.primaryHref||'/termekek'} className="btn btn-primary btn-large">{hero.primaryCta}</a>}{hero.showSecondaryCta!==false&&<a href={hero.secondaryHref||'/ai-ajandekkereso'} className="btn btn-ghost btn-large">{hero.secondaryCta}</a>}</div>{hero.showTrust!==false&&<div className="hero-trust hero-trust-premium">{hero.trustItems.map(item=><span key={item}>{item}</span>)}</div>}{hero.showChips!==false&&<div className="hero-micro-stats">{hero.chips.map(chip=><div className="hero-chip" key={chip.label}><small>{chip.label}</small><b>{chip.value}</b></div>)}</div>}</div>
  <div className="hero-visual hero-stage" aria-hidden="true"><div className="hero-stage-glow hero-stage-glow-a"/><div className="hero-stage-glow hero-stage-glow-b"/><div className="hero-stage-grid"/><div className="hero-stage-ring hero-stage-ring-a"/><div className="hero-stage-ring hero-stage-ring-b"/><div className="hero-stage-floor"/><div className="hero-product-surface"><div className="hero-product-card hero-product-card-main"><div className="hero-card-badge">Spotlight</div><img src={spotlight.art} alt="" fetchPriority="high"/><div className="hero-product-meta"><small>{spotlight.brand}</small><b>{spotlight.name}</b><span>{spotlight.category}</span></div></div>
  {orbit[0]&&<div className="hero-floating-card hero-floating-card-a"><img src={orbit[0].art} alt="" loading="eager" decoding="async"/><span>{orbit[0].name}</span></div>}
  {orbit[1]&&<div className="hero-floating-card hero-floating-card-b"><img src={orbit[1].art} alt="" loading="lazy" decoding="async"/><span>{orbit[1].name}</span></div>}
  {orbit[2]&&<div className="hero-floating-card hero-floating-card-c"><img src={orbit[2].art} alt="" loading="lazy" decoding="async"/><span>{orbit[2].name}</span></div>}
  {orbit[3]&&<div className="hero-floating-card hero-floating-card-d"><img src={orbit[3].art} alt="" loading="lazy" decoding="async"/><span>{orbit[3].name}</span></div>}
  <div className="hero-glass-note hero-glass-note-a"><strong>Kuponmotor</strong><small>Popup + checkout validáció</small></div><div className="hero-glass-note hero-glass-note-b"><strong>Variánsok</strong><small>Szín, méret, eltérő ár / készlet</small></div><div className="hero-glass-note hero-glass-note-c"><strong>Upsell / cross-sell</strong><small>Termékoldal + kosár ajánlók</small></div></div>{hero.showNotes!==false&&<div className="hero-bottom-marquee">{hero.notes.map(note=><span key={note}>{note}</span>)}</div>}</div>
 </section>
}

function CleanShowcaseHero({hero,spotlight,orbit}:{hero:ReturnType<typeof useResolvedHero>;spotlight:Product;orbit:Product[]}){
 const products=[orbit[0],spotlight,orbit[1]??orbit[2]].filter((product):product is Product=>Boolean(product))
 return <section className={`hero hero-premium hero-showcase-v4 hero-motion-${hero.motion||'full'} ${hero.showProducts===false?'hero-products-hidden':''} container-wide`} style={{background:hero.background}}>
  <div className="showcase-v4-copy">
   {hero.showEyebrow!==false&&<span className="showcase-v4-kicker">{hero.eyebrow}</span>}
   <h1>{hero.title}<br/><span>{hero.emphasis}</span></h1>
   <p>{hero.description}</p>
   <div className="showcase-v4-actions">{hero.showPrimaryCta!==false&&<a href={hero.primaryHref||'/termekek'} className="btn btn-primary btn-large">{hero.primaryCta}</a>}{hero.showSecondaryCta!==false&&<a href={hero.secondaryHref||'/ai-ajandekkereso'} className="btn btn-ghost btn-large">{hero.secondaryCta}</a>}</div>
   {hero.showTrust!==false&&<div className="showcase-v4-trust">{hero.trustItems.map((item,index)=><span key={item}><i>{String(index+1).padStart(2,'0')}</i>{item}</span>)}</div>}
  </div>
  {hero.showProducts!==false&&<div className="showcase-v4-stage" aria-label="Kiemelt játékok">
   <div className="showcase-v4-backdrop" aria-hidden="true"><span className="shape one"/><span className="shape two"/><span className="shape three"/><span className="arc a"/><span className="arc b"/></div>
   <div className="showcase-v4-products">
    {products.map((product,index)=><Link key={product.id} to="/termek/$slug" params={{slug:product.slug}} className={`showcase-v4-product item-${index+1}`} aria-label={product.name}>
      <div className="showcase-v4-product-image"><span className="showcase-v4-blob" style={{background:product.accent}}/><img src={product.art} alt={product.name} fetchPriority={index===1?'high':undefined} loading={index===1?'eager':'lazy'} decoding="async" onError={e=>{e.currentTarget.src='/favicon.svg'}}/></div>
      <div className="showcase-v4-product-copy"><small>{product.brand}</small>{hero.showProductNames!==false&&<b>{product.name}</b>}{hero.showPrices!==false&&<strong>{product.retailPrice>0?price(product.retailPrice):'Ár hamarosan'}</strong>}</div>
    </Link>)}
   </div>
   <div className="showcase-v4-floor" aria-hidden="true"><span/><span/><span/></div>
  </div>}
  {(hero.showChips!==false||hero.showNotes!==false)&&<div className="showcase-v4-bottom">
   {hero.showChips!==false&&<div className="showcase-v4-worlds">{hero.chips.map(chip=><span key={chip.label}><i>{chip.label}</i><b>{chip.value}</b></span>)}</div>}
   {hero.showNotes!==false&&<div className="showcase-v4-notes">{hero.notes.map(note=><span key={note}>{note}</span>)}</div>}
  </div>}
 </section>
}

function UniverseHero({hero,spotlight,orbit}:{hero:ReturnType<typeof useResolvedHero>;spotlight:Product;orbit:Product[]}){
 const tilt=(event:React.PointerEvent<HTMLElement>)=>{
  if(event.pointerType==='touch')return
  const rect=event.currentTarget.getBoundingClientRect()
  const x=(event.clientX-rect.left)/rect.width-.5
  const y=(event.clientY-rect.top)/rect.height-.5
  event.currentTarget.style.setProperty('--hero-rx',`${-y*4}deg`)
  event.currentTarget.style.setProperty('--hero-ry',`${x*7}deg`)
  event.currentTarget.style.setProperty('--hero-x',`${x*12}px`)
  event.currentTarget.style.setProperty('--hero-y',`${y*10}px`)
 }
 const reset=(event:React.PointerEvent<HTMLElement>)=>{event.currentTarget.style.setProperty('--hero-rx','0deg');event.currentTarget.style.setProperty('--hero-ry','0deg');event.currentTarget.style.setProperty('--hero-x','0px');event.currentTarget.style.setProperty('--hero-y','0px')}
 return <section className="hero hero-premium hero-universe container-wide" style={{background:hero.background}} onPointerMove={tilt} onPointerLeave={reset}>
  <div className="dinoverse-atmosphere" aria-hidden="true"><i className="dinoverse-aurora a"/><i className="dinoverse-aurora b"/><i className="dinoverse-orbit-line one"/><i className="dinoverse-orbit-line two"/><i className="dinoverse-spark s1"/><i className="dinoverse-spark s2"/><i className="dinoverse-spark s3"/><i className="dinoverse-spark s4"/></div>
  <div className="hero-copy hero-copy-premium dinoverse-copy">
   <div className="dinoverse-kicker"><span className="pill">{hero.eyebrow}</span><span className="dinoverse-live"><i/> Új világok, új kedvencek</span></div>
   <h1>{hero.title}<br/><span>{hero.emphasis}</span></h1>
   <p>{hero.description}</p>
   <div className="hero-actions dinoverse-actions"><Link to="/termekek" search={{}} className="btn btn-primary btn-large">{hero.primaryCta}</Link><Link to="/ai-ajandekkereso" className="btn btn-ghost btn-large">{hero.secondaryCta}</Link></div>
   <div className="dinoverse-brand-row" aria-label="Kiemelt világok"><Link to="/marka/play-doh"><span className="brand-dot playdoh"/>Play-Doh</Link><Link to="/marka/star-wars"><span className="brand-dot starwars"/>Star Wars</Link><Link to="/termekek" search={{q:'Barbie'}}><span className="brand-dot barbie"/>Barbie</Link><Link to="/termekek" search={{q:'Disney'}}><span className="brand-dot disney"/>Disney</Link></div>
   <div className="hero-trust hero-trust-premium dinoverse-trust">{hero.trustItems.map(item=><span key={item}>{item}</span>)}</div>
   <div className="hero-micro-stats dinoverse-stats">{hero.chips.map(chip=><div className="hero-chip" key={chip.label}><small>{chip.label}</small><b>{chip.value}</b></div>)}</div>
  </div>
  <div className="hero-visual dinoverse-stage">
   <div className="dinoverse-depth-grid" aria-hidden="true"/>
   <div className="dinoverse-ring r1" aria-hidden="true"/><div className="dinoverse-ring r2" aria-hidden="true"/><div className="dinoverse-ring r3" aria-hidden="true"/>
   <div className="dinoverse-pedestal" aria-hidden="true"/>
   <Link to="/termek/$slug" params={{slug:spotlight.slug}} className="dinoverse-main-product" aria-label={spotlight.name}>
    <span className="dinoverse-main-badge">KIEMELT JÁTÉK</span>
    <div className="dinoverse-main-image"><span className="dinoverse-image-halo"/><img src={spotlight.art} alt={spotlight.name} fetchPriority="high" onError={e=>{e.currentTarget.src='/favicon.svg'}}/></div>
    <div className="dinoverse-main-meta"><span>{spotlight.brand}</span><b>{spotlight.name}</b><div><small>{spotlight.category}</small><strong>{spotlight.retailPrice>0?price(spotlight.retailPrice):'Ár hamarosan'}</strong></div></div>
   </Link>
   <div className="dinoverse-satellites">
    {orbit.map((product,index)=><Link key={product.id} to="/termek/$slug" params={{slug:product.slug}} className={`dinoverse-satellite sat-${index+1}`} aria-label={product.name}><span className="sat-glow" style={{background:product.accent}}/><img src={product.art} alt={product.name} loading={index<2?'eager':'lazy'} decoding="async" onError={e=>{e.currentTarget.src='/favicon.svg'}}/><div><small>{product.brand}</small><b>{product.name}</b><strong>{product.retailPrice>0?price(product.retailPrice):'Felfedezem'}</strong></div></Link>)}
   </div>
   <div className="dinoverse-float-label label-gift"><span>✨</span><div><b>Ajándékkereső</b><small>Kor · keret · érdeklődés</small></div></div>
   <div className="dinoverse-float-label label-delivery"><span>🟠</span><div><b>FOXPOST</b><small>Egyszerű pontválasztás</small></div></div>
   <div className="dinoverse-float-label label-love"><span>♡</span><div><b>Mentsd el</b><small>Kedvencek későbbre</small></div></div>
  </div>
  <div className="dinoverse-ticker" aria-label="DinoToys előnyök"><div>{[...hero.notes,...hero.notes].map((note,index)=><span key={index}>{note}</span>)}</div></div>
 </section>
}
