import {Link,useNavigate,useRouterState} from '@tanstack/react-router'
import {useEffect,useState} from 'react'
import {products as demoProducts} from '../data/products'
import type{StorefrontShell} from '../server/storefront'
import {useShop} from '../lib/shop'
import {getProductDisplayPrice} from '../lib/catalog'
import {matchesProductQuery} from '../lib/product-search'
import {PromoPopup} from './PromoPopup'
import {CookiePreferencesButton} from './CookiePreferencesButton'
import {useDemoSiteEditorConfig} from '../lib/site-editor'

export function Layout({children,shell}:{children:React.ReactNode;shell:StorefrontShell|null}){
 const shop=useShop(),navigate=useNavigate(),editor=useDemoSiteEditorConfig(),[query,setQuery]=useState(''),[searchOpen,setSearchOpen]=useState(false),[mobileMenuOpen,setMobileMenuOpen]=useState(false),pathname=useRouterState({select:s=>s.location.pathname})
 const sourceProducts=shell?.searchProducts?.length?shell.searchProducts:demoProducts,headerNav=shell?.navigation?.filter(i=>i.location==='header')??[],footerNav=shell?.navigation?.filter(i=>i.location==='footer')??[]
 const header=editor.header,footer=editor.footer
 const effectiveHeaderNav=headerNav.length?headerNav.map(i=>({id:i.id,label:i.label,href:i.href,enabled:true})):header.navItems
 const effectiveFooterLegal=footerNav.length?footerNav.map(i=>({id:i.id,label:i.label,href:i.href,enabled:true})):footer.legalLinks
 const matches=query.trim().length>1?sourceProducts.filter(p=>matchesProductQuery(p,query)).slice(0,5):[]
 const promo=shell?.promotions?.[0]
 const renderHeaderText=(value:string)=>value.replace('{{freeShippingThreshold}}',shop.freeShippingThreshold.toLocaleString('hu-HU'))
 useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setSearchOpen(true)}if(event.key==='Escape'){setSearchOpen(false);setMobileMenuOpen(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
 useEffect(()=>{setMobileMenuOpen(false)},[pathname])
 useEffect(()=>{if(!mobileMenuOpen)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[mobileMenuOpen])
 const submitSearch=()=>{const q=query.trim();if(!q)return;navigate({to:'/termekek',search:{q}});setSearchOpen(false)}
 return <div className={`site-shell ${header.sticky?'site-header-sticky':''} ${header.compact?'site-header-compact':''}`} style={{'--brand':header.accent,'--brand2':header.accent,'--site-accent':header.accent,'--site-header-bg':header.headerBackground} as React.CSSProperties}>
  <div className="storefront-top">
   {header.showAnnouncement&&<div className="announcement" style={{background:header.announcementBackground}}>{header.announcementItems.map((item,index)=><span key={index}>{renderHeaderText(item)}</span>)}{promo?.code&&<><span>•</span><span>🎟 <b>{promo.code}</b> · {promo.name}</span></>}</div>}
   <div className="header-main">
    <header className="header" aria-label="DinoToys fő fejléc">
     <Link to="/" className="brand" aria-label="DinoToys.hu főoldal">
      <span className="brand-mark">{header.logoLetter||'D'}</span>
      <span className="brand-copy"><strong>{header.brandName}<span className="brand-dot">{header.brandSuffix}</span></strong><small>{header.tagline}</small></span>
     </Link>
     {header.showSearch?<div className="search-wrap">
      <button className="search-box" onClick={()=>setSearchOpen(true)} aria-label="Keresés megnyitása">
       <span className="search-icon">⌕</span><span className="search-placeholder">{header.searchPlaceholder}</span><kbd>⌘ K</kbd>
      </button>
     </div>:<div/>}
     <nav className="header-actions" aria-label="Gyorsműveletek">
      {header.showGiftFinder&&<Link to="/ai-ajandekkereso" className="icon-link"><span className="action-icon">✨</span><small>{header.giftFinderLabel}</small></Link>}
      {header.showWishlist&&<Link to="/kedvencek" className="icon-link"><span className="action-icon">♡</span><small>{header.wishlistLabel}{shop.wishlist.length?` (${shop.wishlist.length})`:''}</small></Link>}
      {header.showCart&&<Link to="/kosar" className="icon-link cart-link"><span className="action-icon">🛒</span><small>{header.cartLabel}</small>{shop.cartCount>0&&<b>{shop.cartCount}</b>}</Link>}
     </nav>
     <div className="mobile-header-actions">
      {header.showSearch&&<button className="mobile-header-icon" onClick={()=>setSearchOpen(true)} aria-label="Keresés">⌕</button>}
      {header.showCart&&<Link to="/kosar" className="mobile-header-icon mobile-cart" aria-label={header.cartLabel}>🛒{shop.cartCount>0&&<b>{shop.cartCount}</b>}</Link>}
      <button className={`mobile-menu-toggle ${mobileMenuOpen?'open':''}`} onClick={()=>setMobileMenuOpen(value=>!value)} aria-label={mobileMenuOpen?'Menü bezárása':'Menü megnyitása'} aria-expanded={mobileMenuOpen}><span/><span/><span/></button>
     </div>
    </header>
   </div>
   <div className="nav-shell">
    <nav className="nav-row" aria-label="Fő navigáció">
     {effectiveHeaderNav.filter(i=>i.enabled).map((i,index)=><a key={i.id} href={i.href} className={index===0?`nav-all ${pathname.startsWith('/termekek')?'active':''}`:undefined}>{index===0&&<span>☰</span>} {i.label}</a>)}
     {header.showBrandMenu&&<details className="brand-menu"><summary>{header.brandMenuLabel} ▾</summary><div className="brand-menu-panel"><span>Kiemelt márkák</span>{header.brandLinks.filter(i=>i.enabled).map(i=><a key={i.id} href={i.href}><b>{i.label}</b></a>)}</div></details>}
     {header.showGiftFinder&&<Link to="/ai-ajandekkereso" className="nav-highlight">✨ {header.giftFinderLabel}</Link>}
     {header.showCompare&&<Link to="/osszehasonlitas" className="nav-muted">{header.compareLabel} {shop.compare.length?`(${shop.compare.length})`:''}</Link>}
    </nav>
   </div>
   {mobileMenuOpen&&<div className="mobile-menu-backdrop" onMouseDown={()=>setMobileMenuOpen(false)}><aside className="mobile-menu-drawer" onMouseDown={e=>e.stopPropagation()} aria-label="Mobil navigáció">
    <div className="mobile-menu-head"><div className="brand"><span className="brand-mark">{header.logoLetter||'D'}</span><span className="brand-copy"><strong>{header.brandName}<span className="brand-dot">{header.brandSuffix}</span></strong><small>{header.tagline}</small></span></div><button onClick={()=>setMobileMenuOpen(false)} aria-label="Bezárás">×</button></div>
    {header.showSearch&&<button className="mobile-menu-search" onClick={()=>{setMobileMenuOpen(false);setSearchOpen(true)}}><span>⌕</span><span>{header.searchPlaceholder}</span></button>}
    <nav className="mobile-menu-links">{effectiveHeaderNav.filter(i=>i.enabled).map(i=><a key={i.id} href={i.href}>{i.label}<span>→</span></a>)}</nav>
    {header.showBrandMenu&&<section className="mobile-menu-section"><b>{header.brandMenuLabel}</b><div className="mobile-brand-grid">{header.brandLinks.filter(i=>i.enabled).map(i=><a key={i.id} href={i.href}>{i.label}</a>)}</div></section>}
    <section className="mobile-menu-quick">
     {header.showGiftFinder&&<Link to="/ai-ajandekkereso"><span>✨</span><div><b>{header.giftFinderLabel}</b><small>Segítünk választani</small></div></Link>}
     {header.showWishlist&&<Link to="/kedvencek"><span>♡</span><div><b>{header.wishlistLabel}</b><small>{shop.wishlist.length} mentett termék</small></div></Link>}
     {header.showCompare&&<Link to="/osszehasonlitas"><span>⇄</span><div><b>{header.compareLabel}</b><small>{shop.compare.length} termék</small></div></Link>}
    </section>
    {header.showCart&&<Link to="/kosar" className="btn btn-primary mobile-menu-cart">🛒 {header.cartLabel}{shop.cartCount?' · '+shop.cartCount+' db':''}</Link>}
   </aside></div>}
  </div>
  <main>{children}</main>
  {footer.enabled&&<footer className="footer editor-footer" style={{background:footer.background,color:footer.textColor}}><div><div className="brand footer-brand"><span className="brand-mark">{header.logoLetter||'D'}</span><span>{footer.brandName}<span className="brand-dot">{footer.brandSuffix}</span></span></div><p>{footer.intro}</p><small className="footer-legal-note">{footer.legalNote}</small><small className="footer-copyright">{footer.copyright}</small></div><FooterColumn title={footer.shoppingTitle} links={footer.shoppingLinks}/><FooterColumn title={footer.supportTitle} links={footer.supportLinks}/><div><strong>{footer.legalTitle}</strong>{effectiveFooterLegal.filter(i=>i.enabled).map(i=><a key={i.id} href={i.href}>{i.label}</a>)}{footer.showCookieButton&&<CookiePreferencesButton label={footer.cookieLabel}/>}</div></footer>}
  {searchOpen&&<div className="modal-backdrop" onMouseDown={()=>setSearchOpen(false)}><div className="search-modal" onMouseDown={e=>e.stopPropagation()}><div className="search-input-row"><span>⌕</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')submitSearch()}} placeholder={header.searchPlaceholder}/><button onClick={()=>setSearchOpen(false)}>Esc</button></div><div className="search-suggestions">{query.length<=1&&<><p className="eyebrow">Népszerű keresések</p><div className="chips"><button onClick={()=>setQuery('Stitch')}>Stitch</button><button onClick={()=>setQuery('dínó')}>Dínó</button><button onClick={()=>setQuery('Hot Wheels')}>Hot Wheels</button></div></>}{matches.map(p=><Link key={p.id} to="/termek/$slug" params={{slug:p.slug}} onClick={()=>setSearchOpen(false)} className="search-result"><img src={p.art} onError={e=>{e.currentTarget.src='/favicon.svg'}}/><span><b>{p.name}</b><small>{p.brand} • {p.category}</small></span><strong>{new Intl.NumberFormat('hu-HU').format(getProductDisplayPrice(p))} Ft</strong></Link>)}{query.trim().length>1&&matches.length===0&&<div className="search-empty"><b>Nincs pontos találat</b><span>Nyomj Entert a teljes katalógus kereséséhez.</span></div>}{query.trim().length>1&&<button className="search-all" onClick={submitSearch}>Összes találat erre: „{query.trim()}” →</button>}</div></div></div>}
  <PromoPopup popup={shell?shell.popup:undefined}/>
 </div>
}

function FooterColumn({title,links}:{title:string;links:Array<{id:string;label:string;href:string;enabled:boolean}>}){return <div><strong>{title}</strong>{links.filter(link=>link.enabled).map(link=><a key={link.id} href={link.href}>{link.label}</a>)}</div>}
