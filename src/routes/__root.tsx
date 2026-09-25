import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { ShopProvider } from '../lib/shop'
import { Layout } from '../components/Layout'
import { ConsentBanner } from '../components/ConsentBanner'
import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'DinoToys.hu – játékok, amikért tényleg lelkesednek' },
      { name: 'description', content: 'Modern magyar játékwebshop: trendi játékok, plüssök, dínók, gyűjthető figurák és ajándékötletek gyors szállítással.' },
      { property: 'og:locale', content: 'hu_HU' },
      { property: 'og:type', content: 'website' },
      { name: 'theme-color', content: '#ffffff' },
      { property: 'og:site_name', content: 'DinoToys.hu' },
      { property: 'og:title', content: 'DinoToys.hu – játékok, amikért tényleg lelkesednek' },
      { property: 'og:description', content: 'Modern magyar játékwebshop okos termékkereséssel és ajándékötletekkel.' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap' },
    ],
  }),
  component: Root,
})

function Root() {
  const isAdmin = useRouterState({ select: (s) => s.location.pathname.startsWith('/admin') })
  return <Document><ShopProvider>{isAdmin ? <Outlet /> : <><Layout><Outlet /></Layout><ConsentBanner /></>}</ShopProvider></Document>
}
function Document({ children }: { children: ReactNode }) { return <html lang="hu"><head><HeadContent /></head><body>{children}<Scripts /></body></html> }
