# Implementation plan

| Epic | Status | Depends on | Acceptance criteria |
|---|---|---|---|
| Foundation/design system | IN PROGRESS | — | Responsive storefront, routes, tokens, core states |
| Supplier integration | BLOCKED_EXTERNAL | Dino Toys feed credentials/spec | Incremental sync, retry, audit, no HTML dependency |
| Catalog & search | IN PROGRESS | Foundation | Filters, SEO routes, fast search, pagination |
| Compliance | IN PROGRESS | Supplier metadata | Missing safety data blocks publish |
| Pricing | IN PROGRESS | Supplier costs/FX policy | Deterministic margin/VAT/rounding rules + tests |
| Inventory | TODO | DB | Atomic reservations, stock movements, low-stock alerts |
| Checkout/payment | UI READY | Stripe account | Idempotent server checkout + verified webhook |
| Shipping/invoice | TODO | Provider choice | Labels/tracking + compliant invoice flow |
| Customer/account | TODO | Auth | Orders, addresses, returns, preferences |
| Marketing/analytics | TODO | consent config | GA4/Ads/Meta gated by consent; feed/export |
| AI/recommendations | PROTOTYPE | production catalog | Semantic search + measurable recommendation quality |
| QA/security/deploy | TODO | integrations | CI green, E2E pass, headers, rate limits, backups |
