# DinoToys.hu — WEBSHOP BLUEPRINT v0.1

## 1. Üzleti modell
B2C magyar kiskereskedelem, elsődleges forrás Dino Toys NL. A nagykereskedelmi katalógus adatforrás; a magyar oldal saját márka-, ár-, ügyfélélmény- és fulfillment-réteget kap. B2B modul később bekapcsolható. Bérlés MVP-ben nincs.

**Miért:** a forrásoldal üzleti vásárlóknak készült, a magyar végfelhasználó más keresési, bizalmi, checkout- és jogi élményt igényel.

## 2. Vásárlási modell
Vendég checkout + opcionális fiók. HUF bruttó ár, 27% alap ÁFA-paraméter, kupon, csomagajánlat, ajándékkártya, automatikus ingyenes-szállítási küszöb. Ár soha nem közvetlenül a supplier feedből jelenik meg: pricing rule számolja.

## 3. Bérleti modell
Kikapcsolva. Az eredeti generikus brief kompatibilitása miatt később külön modul lehet, de játék-kiskereskedelemnél most felesleges komplexitás.

## 4. Célfelhasználók
Szülők/nagyszülők; ajándékot gyorsan keresők; gyűjtők; trendterméket kereső fiatal felnőttek; iskolakezdési vásárlók.

## 5. Fő user journey-k
- Google/Meta/TikTok → termék → kosár → guest checkout → fizetés → tracking → review/reorder.
- Főoldal → Dino Match → kor + keret + érdeklődés → shortlist → termék → checkout.
- Kategória → facettált szűrés → összehasonlítás → kosár.
- Back-in-stock/price-drop email → termék → checkout.

## 6. Funkciólista
MVP: gyors keresés; kategória/facet; wishlist; compare; persistent cart; guest checkout; kupon; készlet; delivery ETA; safety block; order tracking; consent; analytics; supplier sync; pricing rules; admin publishing gate.

V1+: semantic search; visual search; AI gift finder; bundles; loyalty; referral; photo/video reviews; PWA/web push; back-in-stock/price-drop; one-click reorder; returns portal; Google Merchant/Meta catalog; personalized recommendation slots.

## 7. Publikus oldaltérkép
`/`, `/termekek`, `/termek/$slug`, `/kereses`, `/kedvencek`, `/osszehasonlitas`, `/kosar`, `/checkout`, `/rendeles/$id`, `/fiokom/*`, `/ai-ajandekkereso`, `/ujdonsagok`, `/akciok`, `/markak/$slug`, `/kategoriak/$slug`, `/szallitas`, `/visszakuldes`, `/kapcsolat`, `/blog`, `/jogi/$slug`.

## 8. Admin oldaltérkép
Dashboard; Products; Categories; Inventory; Supplier Sync; Pricing; Orders; Returns; Customers; Reviews; Marketing; Content; Analytics; Compliance/Recalls; Users/RBAC; Settings; Audit Log.

## 9. Rendszerarchitektúra
Browser → Cloudflare CDN/Workers → TanStack Start server functions → Supabase/PostgreSQL. R2 product media. External providers behind adapters: payment, shipping, invoice, email, supplier catalog. Scheduled sync via Worker cron/queue.

## 10. Tech stack
TypeScript + React 19 + TanStack Start + Cloudflare Workers + Supabase/PostgreSQL + R2 + Stripe + Resend. Tests: Vitest + Playwright later.

**Miért:** own-code-first, low baseline cost, portable provider interfaces, existing project familiarity, strong SSR/SEO.

## 11. Fő adatbázis entitások
products, categories, product_categories, product_images, inventory_movements, supplier_sync_runs, price_rules, profiles, addresses, carts, orders, order_items, payments, refunds, shipments, returns, reviews, wishlists, coupons, gift_cards, notification_subscriptions, audit_logs.

## 12. Payment architecture
`PaymentProvider` interface. Stripe first. Server creates payment intent; webhook is source of truth. Idempotency key on checkout/order creation. Apple Pay/Google Pay through provider where available.

## 13. Rental architecture
Not active; no runtime tables/routes in MVP. Keep business domain separated so later module doesn't contaminate purchase checkout.

## 14. Jogosultság
CUSTOMER, SUPPORT, WAREHOUSE, MARKETING, MANAGER, ADMIN, SUPER_ADMIN. DB/server authorization mandatory; admin navigation hiding is not security.

## 15. Security
Server-side price/stock/discount validation; Zod boundaries; CSP/HSTS; rate limits; CSRF strategy; secure cookies; webhook signature verification; RLS; audit logs; secrets only in runtime secret store; no payment card data in DB.

## 16. SEO
SSR category/product pages, canonical, sitemap, robots, OG, Product/Offer/Breadcrumb/Organization schema. Indexable category copy and FAQ. Out-of-stock strategy; redirects for removed SKUs; Hungarian slugs; Merchant Center feed.

## 17. Analytics
Consent Mode compatible event layer: view_item_list, select_item, view_item, add_to_wishlist, add_to_cart, begin_checkout, add_shipping_info, add_payment_info, purchase, search, gift_finder_completed. UTM/gclid/fbclid first- and last-touch.

## 18. AI
Dino Match conversational gift finder; semantic product search; admin translation/SEO draft; review summarization; support assistant; demand/stock suggestions. Human approval for public copy and compliance data.

## 19. DevOps
local/dev/staging/prod; GitHub Actions typecheck→tests→build; migrations reviewed separately; Cloudflare Workers deploy; observability; supplier/webhook logs; uptime monitor; backups and restore drill.

## 20. Tesztelés
Unit: pricing/VAT/coupon/stock. Integration: DB, supplier sync, payment webhook, invoice/email. E2E: search→PDP→cart→checkout; mobile; failed payment; duplicate click; out-of-stock race; refund/return.

## 21. Legal/compliance checklist
GDPR/cookie consent; distance-selling information; 14-day withdrawal information and exceptions; warranty/szavatosság review; displayed gross prices; GPSR/manufacturer/responsible person/product identifier/safety warnings; toy-specific warnings; CE where applicable; recall workflow; Hungarian-language warnings; accessibility target WCAG 2.2 AA. Final legal text requires professional review.

## 22. Külső szolgáltatások
Supabase; Cloudflare; Stripe; Resend; R2; shipping provider(s); Hungarian invoice provider; GA4/Ads/Meta; optional Algolia/Typesense only if native search becomes insufficient.

## 23. Havi infrastruktúra-költség
Early-stage target: very low fixed cost. Cloudflare/Supabase/Resend can start on low/free tiers; payment/shipping/invoice are mainly transaction/volume dependent. Exact budget only after order volume, storage and email volume are known.

## 24. Roadmap
Foundation → supplier feed → DB/admin → pricing/inventory → checkout/payment → shipping/invoice → compliance gate → analytics/marketing → SEO feeds → AI/recommendation → hardening/load/E2E → launch.

## 25. MVP vs later
MVP must sell safely and reliably. AI personalization, visual search, loyalty, rich UGC and sophisticated recommendation models are V1+ unless they directly improve launch conversion without destabilizing checkout.
