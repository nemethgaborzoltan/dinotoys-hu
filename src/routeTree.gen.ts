/* eslint-disable */
// Minimal checked-in route tree. TanStack's Vite plugin regenerates this file.
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ProductsRouteImport } from './routes/termekek'
import { Route as ProductRouteImport } from './routes/termek.$slug'
import { Route as WishlistRouteImport } from './routes/kedvencek'
import { Route as CompareRouteImport } from './routes/osszehasonlitas'
import { Route as CartRouteImport } from './routes/kosar'
import { Route as CheckoutRouteImport } from './routes/checkout'
import { Route as GiftRouteImport } from './routes/ai-ajandekkereso'
import { Route as AdminRouteImport } from './routes/admin'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const ProductsRoute = ProductsRouteImport.update({ id: '/termekek', path: '/termekek', getParentRoute: () => rootRouteImport } as any)
const ProductRoute = ProductRouteImport.update({ id: '/termek/$slug', path: '/termek/$slug', getParentRoute: () => rootRouteImport } as any)
const WishlistRoute = WishlistRouteImport.update({ id: '/kedvencek', path: '/kedvencek', getParentRoute: () => rootRouteImport } as any)
const CompareRoute = CompareRouteImport.update({ id: '/osszehasonlitas', path: '/osszehasonlitas', getParentRoute: () => rootRouteImport } as any)
const CartRoute = CartRouteImport.update({ id: '/kosar', path: '/kosar', getParentRoute: () => rootRouteImport } as any)
const CheckoutRoute = CheckoutRouteImport.update({ id: '/checkout', path: '/checkout', getParentRoute: () => rootRouteImport } as any)
const GiftRoute = GiftRouteImport.update({ id: '/ai-ajandekkereso', path: '/ai-ajandekkereso', getParentRoute: () => rootRouteImport } as any)
const AdminRoute = AdminRouteImport.update({ id: '/admin', path: '/admin', getParentRoute: () => rootRouteImport } as any)

const rootRouteChildren = { IndexRoute, ProductsRoute, ProductRoute, WishlistRoute, CompareRoute, CartRoute, CheckoutRoute, GiftRoute, AdminRoute }
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)

import type { getRouter } from './router'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' { interface Register { ssr: true; router: Awaited<ReturnType<typeof getRouter>> } }
