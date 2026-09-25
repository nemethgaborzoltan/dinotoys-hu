# Architecture

## Runtime
- Cloudflare Worker hosts TanStack Start SSR and server functions.
- PostgreSQL/Supabase is source of truth for catalog, customer and order state.
- R2 stores normalized authorized product media.
- Browser state may cache wishlist/cart for anonymous users, but checkout re-prices server-side.

## Supplier boundary
All supplier-specific fields are normalized through `SupplierCatalogAdapter`. Never make customer pages depend on Dino Toys HTML structure. Prefer contractual API/XML/CSV over scraping.

## Pricing
Supplier price is cost input only. Final retail price is calculated from landed cost, margin rule, VAT and rounding. Admin sees source cost and margin; storefront sees only current retail offer.

## Product publish gate
A product cannot become `active` until required image, manufacturer/responsible-person identity, product identifier and safety warning fields are complete and reviewed.
