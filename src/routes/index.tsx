import {Link,createFileRoute} from '@tanstack/react-router'
import {categories as demoCategories,products as demoProducts} from '../data/products'
import {getHomeData} from '../server/storefront'
import {ProductCard} from '../components/ProductCard'
import {RecentlyViewed} from '../components/RecentlyViewed'
import {HeroShowcase} from '../components/HeroShowcase'
import {OrganizationJsonLd,SeoJsonLd,absoluteUrl} from '../lib/seo'
export const Route=createFileRoute('/')({loader:()=>getHomeData(),head:()=>({meta:[{title:'DinoToys.hu – játékok, ajándékötletek és trendtermékek'},{name:'description',content:'Fedezz fel trendi játékokat, variánsokat, ajándékötleteket és okos vásárlási funkciókat a DinoToys.hu webshopban.'}],links:[{rel:'canonical',href:absoluteUrl('/')}]}),component:Home})
function Home(){
 const data=Route.useLoaderData(),products=data?.products?.length?data.products:demoProducts,categories=data?.categories?.length?data.categories:demoCategories,hero=data?.sections?.find(s=>s.section_key==='hero')?.content??null
 const trending=products.filter(p=>p.trending).slice(0,4),fresh=products.filter(p=>p.newArrival).slice(0,4)
 return <>
 <OrganizationJsonLd/><SeoJsonLd data={{'@context':'https://schema.org','@type':'WebSite',name:'DinoToys.hu',url:absoluteUrl('/'),potentialAction:{'@type':'SearchAction',target:absoluteUrl('/termekek?q={search_term_string}'),'query-input':'required name=search_term_string'}}}/>
 <HeroShowcase products={products} liveContent={hero}/>
 <section className="container section"><div className="section-head"><div><span className="eyebrow">Böngéssz hangulat szerint</span><h2>Gyors út a jó választáshoz</h2></div><Link to="/termekek" search={{}}>Minden kategória →</Link></div><div className="category-grid">{categories.map(c=><Link key={c.name} to="/termekek" search={{category:c.name}} className="category-card"><span>{c.icon}</span><div><b>{c.name}</b><small>{c.blurb}</small></div><i>→</i></Link>)}</div></section>
 <section className="container section"><div className="section-head"><div><span className="eyebrow">Trend radar</span><h2>Amit most mindenki keres</h2></div></div><div className="product-grid">{(trending.length?trending:products.slice(0,4)).map(p=><ProductCard key={p.id} product={p}/>)}</div></section>
 <section className="feature-strip container"><div><span>🎁</span><b>Ajándék 60 mp alatt</b><p>Kor, keret és érdeklődés alapján.</p></div><div><span>🎨</span><b>Valódi variánsok</b><p>Szín, méret, SKU, ár és készlet.</p></div><div><span>🎟</span><b>Kupon + popup</b><p>Időzíthető marketingajánlatok.</p></div><div><span>🛒</span><b>Upsell / cross-sell</b><p>Adminból kapcsolható termékajánlók.</p></div></section>
 <section className="container section"><div className="section-head"><div><span className="eyebrow">Frissen érkezett</span><h2>Újdonságok</h2></div></div><div className="product-grid">{(fresh.length?fresh:products.slice(4,8)).map(p=><ProductCard key={p.id} product={p}/>)}</div></section><RecentlyViewed/>
 <section className="ai-banner container"><div><span className="pill">DINO MATCH ✨</span><h2>„Valami menő kell egy 7 éves dínórajongónak 8 000 Ft alatt.”</h2><p>Kor, keret és érdeklődés alapján céloz.</p><Link to="/ai-ajandekkereso" className="btn btn-light btn-large">Próbáld ki →</Link></div><div className="ai-orb"><span>🦕</span><span>🎁</span><span>✨</span></div></section>
 </>
}
