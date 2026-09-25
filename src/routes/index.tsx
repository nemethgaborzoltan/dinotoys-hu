import { Link, createFileRoute } from '@tanstack/react-router'
import { categories as demoCategories, products as demoProducts } from '../data/products'
import { getHomeData } from '../server/storefront'
import { ProductCard } from '../components/ProductCard'
import { RecentlyViewed } from '../components/RecentlyViewed'

export const Route = createFileRoute('/')({ loader: () => getHomeData(), component: Home })

function Home() {
  const data = Route.useLoaderData()
  const products = data?.products?.length ? data.products : demoProducts
  const categories = data?.categories?.length ? data.categories : demoCategories
  const hero = data?.sections?.find((section) => section.section_key === 'hero')?.content ?? {}
  const trending = products.filter((p) => p.trending).slice(0, 4)
  const fresh = products.filter((p) => p.newArrival).slice(0, 4)
  return <>
    <section className="hero container-wide"><div className="hero-copy"><span className="pill">✨ {String(hero.eyebrow ?? 'Friss trendek hetente')}</span><h1>Nem még egy játékwebshop.<br/><span>{String(hero.title ?? 'Találd meg gyorsan azt, aminek örülni fog.')}</span></h1><p>{String(hero.description ?? 'Válogatott trendtermékek, ismert márkák, okos ajándékkeresés és egy modern vásárlási élmény — felesleges kattintgatás nélkül.')}</p><div className="hero-actions"><Link to="/termekek" search={{}} className="btn btn-primary btn-large">Felfedezem a játékokat →</Link><Link to="/ai-ajandekkereso" className="btn btn-ghost btn-large">✨ Segíts ajándékot választani</Link></div><div className="hero-trust"><span>✓ Magyar ügyfélszolgálat</span><span>✓ Biztonságos fizetés</span><span>✓ 14 napos jogszabályi elállás</span></div></div><div className="hero-visual"><div className="hero-card hero-card-main"><img src={(products[0] ?? demoProducts[0]).art} alt={(products[0] ?? demoProducts[0]).name}/><div><span>Most pörög</span><b>{products[0].name}</b></div></div><div className="hero-float top">🔥 1 000+ termékforrásra tervezve</div><div className="hero-float bottom">⭐ 4.8/5 demo értékelés</div></div></section>
    <section className="container section"><div className="section-head"><div><span className="eyebrow">Böngéssz hangulat szerint</span><h2>Gyors út a jó választáshoz</h2></div><Link to="/termekek" search={{}}>Minden kategória →</Link></div><div className="category-grid">{categories.map((c) => <Link key={c.name} to="/termekek" search={{ category: c.name }} className="category-card"><span>{c.icon}</span><div><b>{c.name}</b><small>{c.blurb}</small></div><i>→</i></Link>)}</div></section>
    <section className="container section"><div className="section-head"><div><span className="eyebrow">Trend radar</span><h2>Amit most mindenki keres</h2></div><Link to="/termekek" search={{ sort: 'trending' }}>Összes trendtermék →</Link></div><div className="product-grid">{trending.map((p) => <ProductCard key={p.id} product={p}/>)}</div></section>
    <section className="feature-strip container"><div><span>🎁</span><b>Ajándék 60 másodperc alatt</b><p>Kor, keret és érdeklődés alapján szűkítünk.</p></div><div><span>📦</span><b>Valós készletlogika</b><p>Beszállítói készlet + saját készlet szétválasztva.</p></div><div><span>🛡️</span><b>Biztonsági adatok</b><p>Korhatár, figyelmeztetés és termékbiztonsági mezők.</p></div><div><span>⚡</span><b>Gyors mobilélmény</b><p>Mobile-first, gyors keresés és egyszerű checkout.</p></div></section>
    <section className="container section"><div className="section-head"><div><span className="eyebrow">Frissen érkezett</span><h2>Újdonságok</h2></div></div><div className="product-grid">{fresh.map((p) => <ProductCard key={p.id} product={p}/>)}</div></section>
    <RecentlyViewed />
    <section className="ai-banner container"><div><span className="pill">DINO MATCH ✨</span><h2>„Valami menő kell egy 7 éves dínórajongónak 8 000 Ft alatt.”</h2><p>Így is kereshetsz. A rendszer célzottan szűr a teljes katalógusból, nem csak kulcsszavakat egyeztet.</p><Link to="/ai-ajandekkereso" className="btn btn-light btn-large">Próbáld ki az ajándékkeresőt →</Link></div><div className="ai-orb"><span>🦕</span><span>🎁</span><span>✨</span></div></section>
    <section className="newsletter container"><div><span className="eyebrow">Dino Drop</span><h2>Újdonságok, amik még nem jöttek szembe mindenhol.</h2><p>Heti egy rövid válogatás trendjátékokból. Spam nélkül.</p></div><form onSubmit={(e)=>e.preventDefault()}><input type="email" placeholder="email@pelda.hu" aria-label="E-mail cím"/><button className="btn btn-primary">Feliratkozom</button></form></section>
  </>
}
