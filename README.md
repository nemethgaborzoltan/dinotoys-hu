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
