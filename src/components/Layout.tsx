import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { products as demoProducts } from '../data/products'
import type { StorefrontShell } from '../server/storefront'
import { useShop } from '../lib/shop'

export function Layout({ children, shell }: { children: React.ReactNode; shell: StorefrontShell | null }) {
  const shop = useShop()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const sourceProducts = shell?.searchProducts?.length ? shell.searchProducts : demoProducts
  const headerNav = shell?.navigation?.filter((item) => item.location === 'header') ?? []
  const footerNav = shell?.navigation?.filter((item) => item.location === 'footer') ?? []
  const matches = query.trim().length > 1
    ? sourceProducts.filter((p) => `${p.name} ${p.brand} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : []

  return (
    <div className="site-shell">
      <div className="announcement"><span>🚚 {shop.freeShippingThreshold.toLocaleString('hu-HU')} Ft felett ingyenes szállítás</span><span>•</span><span>14 napos elállási jog</span><span>•</span><span>Biztonságos online fizetés</span></div>
      <header className="header">
        <Link to="/" className="brand" aria-label="DinoToys.hu főoldal"><span className="brand-mark">D</span><span>DinoToys<span className="brand-dot">.hu</span></span></Link>
        <div className="search-wrap">
          <button className="search-box" onClick={() => setSearchOpen(true)} aria-label="Keresés megnyitása"><span>⌕</span><span>Mit keresel? Pl. Stitch, dínó, 6 évesnek…</span><kbd>⌘ K</kbd></button>
        </div>
        <nav className="header-actions" aria-label="Fő navigáció">
          <Link to="/ai-ajandekkereso" className="icon-link"><span>✨</span><small>Ajándékkereső</small></Link>
          <Link to="/kedvencek" className="icon-link"><span>♡</span><small>Kedvencek {shop.wishlist.length ? `(${shop.wishlist.length})` : ''}</small></Link>
          <Link to="/kosar" className="icon-link cart-link"><span>🛒</span><small>Kosár</small>{shop.cartCount > 0 && <b>{shop.cartCount}</b>}</Link>
        </nav>
      </header>
      <div className="nav-row">
        <Link to="/termekek" search={{}} className={pathname.startsWith('/termekek') ? 'active' : ''}>Összes termék</Link>
        {headerNav.length ? headerNav.map((item) => <a key={item.id} href={item.href}>{item.label}</a>) : <>
          <Link to="/termekek" search={{ category: 'Plüss & kulcstartó' }}>Plüss</Link>
          <Link to="/termekek" search={{ category: 'Dínók & figurák' }}>Dínók</Link>
          <Link to="/termekek" search={{ category: 'Járművek' }}>Járművek</Link>
          <Link to="/termekek" search={{ category: 'Puzzle & játék' }}>Játékok</Link>
          <Link to="/termekek" search={{ category: 'Back to School' }}>Iskola</Link>
        </>}
        <Link to="/osszehasonlitas" className="nav-muted">Összehasonlítás {shop.compare.length ? `(${shop.compare.length})` : ''}</Link>
      </div>
      <main>{children}</main>
      <footer className="footer">
        <div><div className="brand footer-brand"><span className="brand-mark">D</span><span>DinoToys<span className="brand-dot">.hu</span></span></div><p>Modern magyar játékwebshop, Dino Toys nagykereskedelmi forrásra tervezve.</p></div>
        <div><strong>Vásárlás</strong><Link to="/termekek" search={{}}>Termékek</Link><Link to="/ai-ajandekkereso">Ajándékkereső</Link><Link to="/kedvencek">Kedvencek</Link></div>
        <div><strong>Ügyfélszolgálat</strong><Link to="/szallitas">Szállítás és fizetés</Link><Link to="/visszakuldes">Visszaküldés</Link><Link to="/kapcsolat">Kapcsolat</Link></div>
        <div><strong>Jogi / egyéb</strong>{footerNav.length ? footerNav.map((item) => <a key={item.id} href={item.href}>{item.label}</a>) : <><Link to="/jogi/$slug" params={{ slug: 'aszf' }}>ÁSZF</Link><Link to="/jogi/$slug" params={{ slug: 'adatkezeles' }}>Adatkezelés</Link><Link to="/jogi/$slug" params={{ slug: 'cookie' }}>Cookie tájékoztató</Link></>}</div>
      </footer>

      {searchOpen && <div className="modal-backdrop" onMouseDown={() => setSearchOpen(false)}>
        <div className="search-modal" onMouseDown={(e) => e.stopPropagation()}>
          <div className="search-input-row"><span>⌕</span><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Keresés termékre, márkára, korosztályra…"/><button onClick={() => setSearchOpen(false)}>Esc</button></div>
          <div className="search-suggestions">
            {query.length <= 1 && <><p className="eyebrow">Népszerű keresések</p><div className="chips"><button onClick={()=>setQuery('Stitch')}>Stitch</button><button onClick={()=>setQuery('dínó')}>Dínó</button><button onClick={()=>setQuery('Hot Wheels')}>Hot Wheels</button><button onClick={()=>setQuery('ajándék')}>Ajándék</button></div></>}
            {matches.map((p) => <Link key={p.id} to="/termek/$slug" params={{ slug: p.slug }} onClick={() => setSearchOpen(false)} className="search-result"><img src={p.art} alt=""/><span><b>{p.name}</b><small>{p.brand} • {p.category}</small></span><strong>{new Intl.NumberFormat('hu-HU').format(p.retailPrice)} Ft</strong></Link>)}
            {query.length > 1 && matches.length === 0 && <div className="empty-state"><span>🔎</span><b>Nincs pontos találat</b><p>Próbálj márkára, kategóriára vagy életkorra keresni.</p></div>}
          </div>
        </div>
      </div>}
    </div>
  )
}
