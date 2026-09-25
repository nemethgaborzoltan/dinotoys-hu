# DATABASE

## Cél
A webshop tranzakciós adatai PostgreSQL/Supabase alatt futnak. A beszállítói katalógus nem közvetlenül publikált adatforrás: import → normalizálás → árképzés → compliance gate → publikálás.

## Fő entitások
- `categories`: hierarchikus kategóriák és SEO mezők.
- `products`: saját retail termékrekord; supplier SKU/EAN, retail ár, ÁFA, készlet, safety/compliance mezők.
- `product_categories`, `product_images`: N:M kategória és média.
- `inventory_movements`: készletmozgások auditálható ledgerként.
- `supplier_sync_runs`: importok állapota és hibái.
- `price_rules`: árrés/FX/logisztikai szabályok.
- `profiles`, `addresses`: ügyféladatok.
- `orders`, `order_items`: immutable order snapshotok; terméknév/ár/ÁFA rendeléskor rögzítve.
- `audit_logs`: admin módosítások.

## Integritás
Foreign key, unique EAN/SKU ahol értelmezhető, CHECK constraint ár/készlet/státusz mezőkre, tranzakció checkoutnál és készletfoglalásnál. A kliens által küldött ár soha nem tekinthető hitelesnek.

## Készletmodell
Az MVP `stock_on_hand` és inventory movement ledger kombinációt használ. Fizetés előtt szerveroldali újraellenőrzés szükséges. Később reservation táblával és rövid TTL-lel kezelhető a nagy checkout concurrency.

## RLS
Customer adatok csak saját `auth.uid()` alapján olvashatók. Admin hozzáférés service-role/server oldalon RBAC ellenőrzéssel történik; service-role kulcs soha nem kerül browser bundle-be.

## Migráció
Minden schema változás verziózott SQL migráció. Production migráció előtt staging próba és backup szükséges. Destruktív migráció kétlépcsős: expand → backfill → switch → contract.
