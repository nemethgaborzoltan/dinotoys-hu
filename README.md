# DinoToys.hu — modern Hungarian retail toy webshop

Production-oriented foundation for a Hungarian B2C toy store sourcing products from Dino Toys (NL). The supplier site is treated as a catalog source, **not** as a UX template.

## Implemented in this first slice

- modern mobile-first storefront
- category browsing + faceted filters + sorting
- product search overlay
- product detail with safety/compliance block
- wishlist, compare, recently-viewed-ready state model
- persistent cart and free-shipping progress
- guest-checkout UX shell
- rule-based “Dino Match” gift finder, ready to upgrade to semantic/AI search
- admin overview with supplier sync and compliance gate concepts
- supplier adapter contract (no brittle scraping)
- Supabase/PostgreSQL foundation schema
- purchase-cost → retail pricing utility
- CI workflow and Cloudflare Workers configuration

## Important demo assumptions

The visible HUF prices and ratings are **demo data**, not Dino Toys wholesale prices. Wholesale price/stock data is intentionally not scraped from authenticated areas. Connect the contractual API/XML/CSV feed when available.

Product names/categories are seeded only to demonstrate the architecture. Before production, import full supplier metadata, authorized images, Hungarian descriptions, age information, manufacturer/responsible-person details and warnings.

## Run

```bash
bun install
bun run dev
```

Production verification:

```bash
bun run typecheck
bun run test
bun run build
```

## Deploy

Cloudflare Workers is configured in `wrangler.jsonc`.

```bash
npx wrangler login
bun run deploy
```

## Next integration sequence

1. Obtain Dino Toys contractual catalog/stock/price feed and image-use terms.
2. Create Supabase project; apply migration in `supabase/migrations`.
3. Implement `DinoToysAdapter` against the feed.
4. Add admin auth/RBAC and product review/publish workflow.
5. Add Stripe, shipping adapter (Foxpost/Packeta/GLS), invoice adapter (Billingo/Számlázz.hu) and Resend.
6. Add consent/GA4/Ads/Meta, Merchant Center and product feeds.
7. Add E2E/browser QA before production.


## Backend platform v2

A repository már nem csak storefront alap:

- TanStack Start `/api/v1/*` REST/server routes
- Supabase Auth + szerveroldali RBAC permission ellenőrzés
- PostgreSQL RLS
- teljes product CRUD + category mapping + GPSR publish gate
- atomikus inventory adjustment + movement ledger
- idempotens checkout + DB oldali újraárazás + 15 perces stock reservation
- orders/payments/refunds/shipments/returns adatmodell
- Supabase Storage alapú médiatár
- CMS oldalak, navigáció, homepage sectionök és settings adminból
- pricing rules + promotions
- suppliers + supplier product staging
- integration registry + secret-readiness ellenőrzés
- webhook event store + transactional outbox
- admin meghívás, szerepkörök és szerkeszthető permission matrix
- minden kritikus admin mutációhoz audit log

### Éles backend aktiválása

Lásd: `docs/SETUP_SUPABASE.md`.

A migrációk sorrendje:

1. `20260925090000_init_shop.sql`
2. `20260925100000_backend_platform.sql`
3. `20260925103000_checkout_engine.sql`

A storefront Supabase nélkül továbbra is demo fallbackkel fut. Supabase konfiguráció után ugyanaz az admin által kezelt adatbázis szolgálja ki a publikus shopot.
