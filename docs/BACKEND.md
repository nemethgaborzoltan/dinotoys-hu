# DinoToys.hu backend architecture

## Cél

A backend nem egyetlen nagy route-fájl. A rendszer határvonalai külön vannak választva:

```
Browser / Admin
  ↓
TanStack Start server routes (/api/v1/*)
  ↓
Authentication + RBAC + Zod validation
  ↓
Domain/service layer
  ↓
Supabase/PostgreSQL + Storage
  ↓
External provider adapters
```

A böngésző soha nem kap `SUPABASE_SERVICE_ROLE_KEY`-t vagy provider secretet.

## API

Publikus:
- `GET /api/v1/health`
- `GET /api/v1/products`
- `GET /api/v1/products/:slug`
- `POST /api/v1/checkout`

Admin:
- `GET /api/v1/admin/me`
- `POST /api/v1/admin/bootstrap`
- `GET|POST /api/v1/admin/products`
- `GET|PATCH|DELETE /api/v1/admin/products/:id`
- `POST /api/v1/admin/products/:id/inventory`
- `PUT /api/v1/admin/products/:id/categories`
- `POST|DELETE /api/v1/admin/products/:id/images`
- `GET|POST /api/v1/admin/resources/:resource`
- `PATCH|DELETE /api/v1/admin/resources/:resource/:id`
- `GET|POST /api/v1/admin/media`
- `DELETE /api/v1/admin/media/:id`
- `GET /api/v1/admin/orders`
- `PATCH /api/v1/admin/orders/:id`
- `GET /api/v1/admin/audit`
- `GET|POST /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id`
- `GET /api/v1/admin/integrations/health`

## Authentication

Supabase Auth kezeli a felhasználói identity/session réteget. Az admin kliens a Supabase access tokent Bearer tokenként küldi a privát DinoToys API-nak.

A backend:
1. `auth.getUser(token)` hívással ellenőrzi a tokent;
2. megkeresi az `admin_users` rekordot;
3. betölti a role permissionöket;
4. az endpoint által igényelt permissiont ellenőrzi.

A kliensoldali menü elrejtése nem authorization.

## RBAC

Beépített szerepkörök:
- super_admin
- admin
- catalog_manager
- order_manager
- marketing
- warehouse
- support
- readonly

Permissionök külön táblában vannak. A Super Admin/Admin megkapja az összes permissiont. A többi szerepkör célzott permission-csomagot kap.

## Checkout business logic

A `create_checkout_order(...)` PostgreSQL function egy adatbázis-tranzakcióban:
- idempotency key alapján megakadályozza a dupla rendelést;
- újraolvassa az aktív termékeket;
- nem bízik a kliens által küldött árban;
- lezárja/lockolja a terméksort ellenőrzéskor;
- levonja a safety stockot és az aktív reservationöket;
- order item snapshotot készít;
- 15 perces inventory reservationt hoz létre;
- a settings táblából olvassa az ingyenes szállítási küszöböt;
- kiszámolja a végleges rendelési összeget;
- outbox eventet ír a későbbi e-mail/fizetési/fulfillment feldolgozáshoz.

## Inventory

Kézi készletmódosítás az `adjust_inventory(...)` RPC-n keresztül történik. Negatív készletet nem enged, és minden mozgást `inventory_movements` ledgerbe ír.

Checkout alatt külön `inventory_reservations` tábla védi a készletet a párhuzamos vásárlásoktól.

## File storage

A migráció létrehozza a `product-media` Supabase Storage bucketet.

Upload:
- privát admin API-n keresztül;
- max. 8 MB;
- MIME allowlist;
- egyedi object path;
- metadata a `media_assets` táblában;
- audit log.

A termékképek olvasása publikus, a feltöltés/törlés server-only.

## Admin editable resources

Az admin strukturáltan tudja szerkeszteni:
- termékek és biztonsági mezők;
- kiskereskedelmi árak;
- készlet;
- kategóriák;
- márkák;
- CMS oldalak;
- navigáció;
- főoldali blokkok;
- pricing rules;
- promóciók;
- publikus és belső settings;
- suppliers;
- integration registry;
- média;
- order státusz;
- admin users/roles.

Pénzügyi és kritikus állapotadatok nem kapnak raw database editor felületet. Ezek kontrollált domain műveletekkel módosulnak.

## Audit

Minden fontos admin mutáció `audit_logs` rekordot ír actor, action, entity, before/after és metadata adatokkal.

## Integrációk

A kód provider interface-eket használ payment/shipping/invoice/email területen. Az `integration_accounts` csak nem titkos konfigurációt és secret neveket tárol. Secret érték kizárólag runtime secret store-ban lehet.

A readiness API megmutatja, hogy a szükséges secret nevek konfigurálva vannak-e, de értéket soha nem ad vissza.
