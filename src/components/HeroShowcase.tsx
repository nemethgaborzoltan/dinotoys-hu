import {Link} from '@tanstack/react-router'
import type{Product} from '../data/products'
import type{JsonValue} from '../server/storefront'
import {useResolvedHero} from '../lib/hero'

export function HeroShowcase({products,liveContent}:{products:Product[];liveContent?:Record<string,JsonValue>|null}){
 const hero=useResolvedHero(liveContent)
 const spotlight=products.find(p=>p.id===hero.spotlightProductId)??products.find(p=>p.trending)??products[0]
 const orbit=hero.orbitProductIds.map(id=>products.find(p=>p.id===id)).filter((p):p is Product=>Boolean(p)).slice(0,4)
 if(!spotlight)return null
 return <section className={`hero hero-premium hero-mode-${hero.mode} container-wide`} style={{background:hero.background}}>
  <div className="hero-copy hero-copy-premium"><span className="pill">{hero.eyebrow}</span><h1>{hero.title}<br/><span>{hero.emphasis}</span></h1><p>{hero.description}</p><div className="hero-actions"><Link to="/termekek" search={{}} className="btn btn-primary btn-large">{hero.primaryCta}</Link><Link to="/ai-ajandekkereso" className="btn btn-ghost btn-large">{hero.secondaryCta}</Link></div><div className="hero-trust hero-trust-premium">{hero.trustItems.map(item=><span key={item}>{item}</span>)}</div><div className="hero-micro-stats">{hero.chips.map(chip=><div className="hero-chip" key={chip.label}><small>{chip.label}</small><b>{chip.value}</b></div>)}</div></div>
  <div className="hero-visual hero-stage" aria-hidden="true"><div className="hero-stage-glow hero-stage-glow-a"/><div className="hero-stage-glow hero-stage-glow-b"/><div className="hero-stage-grid"/><div className="hero-stage-ring hero-stage-ring-a"/><div className="hero-stage-ring hero-stage-ring-b"/><div className="hero-stage-floor"/><div className="hero-product-surface"><div className="hero-product-card hero-product-card-main"><div className="hero-card-badge">Spotlight</div><img src={spotlight.art} alt="" fetchPriority="high"/><div className="hero-product-meta"><small>{spotlight.brand}</small><b>{spotlight.name}</b><span>{spotlight.category}</span></div></div>
  {orbit[0]&&<div className="hero-floating-card hero-floating-card-a"><img src={orbit[0].art} alt="" loading="eager" decoding="async"/><span>{orbit[0].name}</span></div>}
  {orbit[1]&&<div className="hero-floating-card hero-floating-card-b"><img src={orbit[1].art} alt="" loading="lazy" decoding="async"/><span>{orbit[1].name}</span></div>}
  {orbit[2]&&<div className="hero-floating-card hero-floating-card-c"><img src={orbit[2].art} alt="" loading="lazy" decoding="async"/><span>{orbit[2].name}</span></div>}
  {orbit[3]&&<div className="hero-floating-card hero-floating-card-d"><img src={orbit[3].art} alt="" loading="lazy" decoding="async"/><span>{orbit[3].name}</span></div>}
  <div className="hero-glass-note hero-glass-note-a"><strong>Kuponmotor</strong><small>Popup + checkout validáció</small></div><div className="hero-glass-note hero-glass-note-b"><strong>Variánsok</strong><small>Szín, méret, eltérő ár / készlet</small></div><div className="hero-glass-note hero-glass-note-c"><strong>Upsell / cross-sell</strong><small>Termékoldal + kosár ajánlók</small></div></div><div className="hero-bottom-marquee">{hero.notes.map(note=><span key={note}>{note}</span>)}</div></div>
 </section>
}
