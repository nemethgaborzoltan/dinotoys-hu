import {Link,useRouterState} from '@tanstack/react-router'
import {useState} from 'react'
import {products as demoProducts} from '../data/products'
import type{StorefrontShell} from '../server/storefront'
import {useShop} from '../lib/shop'
import {getProductDisplayPrice} from '../lib/catalog'
import {matchesProductQuery} from '../lib/product-search'
import {PromoPopup} from './PromoPopup'
import {CookiePreferencesButton} from './CookiePreferencesButton'

export function Layout({children,shell}:{children:React.ReactNode;shell:StorefrontShell|null}){
 const shop=useShop(),[query,setQuery]=useState(''),[searchOpen,setSearchOpen]=useState(false),pathname=useRouterState({select:s=>s.location.pathname})
 const sourceProducts=shell?.searchProducts?.length?shell.searchProducts:demoProducts,headerNav=shell?.navigation?.filter(i=>i.location==='header')??[],footerNav=shell?.navigation?.filter(i=>i.location==='footer')??[]
 const matches=query.trim().length>1?sourceProducts.filter(p=>matchesProductQuery(p,query)).slice(0,5):[]
 const promo=shell?.promotions?.[0]
 return <div className="site-shell">
  <div className="storefront-top">
   <div className="announcement">
    <span>🚚 <b>{shop.freeShippingThreshold.toLocaleString('hu-HU')} Ft felett ingyenes szállítás</b></span>
    <span>•</span>
    <span>↩ 14 napos elállás</span>
    <span>•</span>
    <span>🔒 Biztonságos fizetés</span>
    {promo?.code&&<><span>•</span><span>🎟 <b>{promo.code}</b> · {promo.name}</span></>}
   </div>
   <div className="header-main">
    <header className="header" aria-label="DinoToys fő fejléc">
     <Link to="/" className="brand" aria-label="DinoToys.hu főoldal">
      <span className="brand-mark">D</span>
      <span className="brand-copy"><strong>DinoToys<span className="brand-dot">.hu</span></strong><small>Játék. Élmény. Ajándék.</small></span>
     </Link>
     <div className="search-wrap">
      <button className="search-box" onClick={()=>setSearchOpen(true)} aria-label="Keresés megnyitása">
       <span className="search-icon">⌕</span><span className="search-placeholder">Keress termékre, márkára vagy korosztályra…</span><kbd>⌘ K</kbd>
      </button>
     </div>
     <nav className="header-actions" aria-label="Gyorsműveletek">
      <Link to="/ai-ajandekkereso" className="icon-link"><span className="action-icon">✨</span><small>Ajándékkereső</small></Link>
      <Link to="/kedvencek" className="icon-link"><span className="action-icon">♡</span><small>Kedvencek{shop.wishlist.length?` (${shop.wishlist.length})`:''}</small></Link>
      <Link to="/kosar" className="icon-link cart-link"><span className="action-icon">🛒</span><small>Kosár</small>{shop.cartCount>0&&<b>{shop.cartCount}</b>}</Link>
     </nav>
    </header>
   </div>
   <div className="nav-shell">
    <nav className="nav-row" aria-label="Fő navigáció">
     <Link to="/termekek" search={{}} className={`nav-all ${pathname.startsWith('/termekek')?'active':''}`}><span>☰</span> Összes termék</Link>
     {headerNav.length?headerNav.map(i=><a key={i.id} href={i.href}>{i.label}</a>):<>
      <Link to="/termekek" search={{category:'Plüss & kulcstartó'}}>Plüss</Link>
      <Link to="/termekek" search={{category:'Dínók & figurák'}}>Dínók</Link>
      <Link to="/termekek" search={{category:'Járművek'}}>Járművek</Link>
      <Link to="/termekek" search={{category:'Puzzle & játék'}}>Játékok</Link>
      <Link to="/termekek" search={{category:'Back to School'}}>Iskola</Link>
     </>}
     <Link to="/marka/star-wars" className="nav-starwars">✦ Star Wars</Link>
     <Link to="/marka/play-doh" className="nav-playdoh">● Play-Doh</Link>
     <Link to="/ai-ajandekkereso" className="nav-highlight">✨ Ajándékkereső</Link>
     <Link to="/osszehasonlitas" className="nav-muted">Összehasonlítás {shop.compare.length?`(${shop.compare.length})`:''}</Link>
    </nav>
   </div>
  </div>
  <main>{children}</main>
  <footer className="footer"><div><div className="brand footer-brand"><span className="brand-mark">D</span><span>DinoToys<span className="brand-dot">.hu</span></span></div><p>Modern magyar játékwebshop, Dino Toys nagykereskedelmi forrásra tervezve.</p><small className="footer-legal-note">Az üzemeltető pontos cégadatai az admin jogi profiljából kerülnek a publikus dokumentumokba.</small></div><div><strong>Vásárlás</strong><Link to="/termekek" search={{}}>Termékek</Link><Link to="/ai-ajandekkereso">Ajándékkereső</Link><Link to="/kedvencek">Kedvencek</Link><Link to="/jogi/$slug" params={{slug:'elallas'}}>Elállás & visszaküldés</Link></div><div><strong>Ügyfélszolgálat</strong><Link to="/szallitas">Szállítás és fizetés</Link><Link to="/visszakuldes">Visszaküldés</Link><Link to="/kapcsolat">Kapcsolat</Link><Link to="/jogi/$slug" params={{slug:'panaszkezeles'}}>Panaszkezelés</Link><Link to="/jogi/$slug" params={{slug:'szavatossag'}}>Szavatosság / jótállás</Link></div><div><strong>Jogi / adatvédelem</strong>{footerNav.length?footerNav.map(i=><a key={i.id} href={i.href}>{i.label}</a>):<><Link to="/jogi/$slug" params={{slug:'impresszum'}}>Impresszum</Link><Link to="/jogi/$slug" params={{slug:'aszf'}}>ÁSZF</Link><Link to="/jogi/$slug" params={{slug:'adatkezeles'}}>Adatkezelés</Link><Link to="/jogi/$slug" params={{slug:'cookie'}}>Cookie tájékoztató</Link></>}<CookiePreferencesButton/></div></footer>
  {searchOpen&&<div className="modal-backdrop" onMouseDown={()=>setSearchOpen(false)}><div className="search-modal" onMouseDown={e=>e.stopPropagation()}><div className="search-input-row"><span>⌕</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Keresés termékre, márkára, korosztályra…"/><button onClick={()=>setSearchOpen(false)}>Esc</button></div><div className="search-suggestions">{query.length<=1&&<><p className="eyebrow">Népszerű keresések</p><div className="chips"><button onClick={()=>setQuery('Stitch')}>Stitch</button><button onClick={()=>setQuery('dínó')}>Dínó</button><button onClick={()=>setQuery('Hot Wheels')}>Hot Wheels</button></div></>}{matches.map(p=><Link key={p.id} to="/termek/$slug" params={{slug:p.slug}} onClick={()=>setSearchOpen(false)} className="search-result"><img src={p.art}/><span><b>{p.name}</b><small>{p.brand} • {p.category}</small></span><strong>{new Intl.NumberFormat('hu-HU').format(getProductDisplayPrice(p))} Ft</strong></Link>)}</div></div></div>}
  <PromoPopup popup={shell?shell.popup:undefined}/>
 </div>
}
