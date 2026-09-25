# DinoAdmin v2

## Munkaterületek

### Áttekintés
Backend rétegek és a webshop szerkeszthető domainjei.

### Termékek
Teljes termék CRUD:
- SKU/EAN/márka/slug;
- kisker és összehasonlító ár;
- supplier cost mező;
- ÁFA;
- safety stock;
- age;
- draft/review/active/archive/recall;
- leírás és SEO;
- GPSR/gyártó/EU responsible person/warning/CE;
- képek;
- atomikus készletkorrekció.

Aktív státusz csak publish gate teljesülése után engedélyezett.

### Tartalom & webhely
- kategóriák;
- márkák;
- CMS oldalak;
- header/footer navigáció;
- főoldali blokkok.

A storefront a DB-ből tölti ezeket. Supabase konfiguráció nélkül automatikus demo fallback működik.

### Kereskedelem
- általános settings;
- ingyenes szállítási küszöb;
- feature flag;
- pricing rules;
- promóciók.

### Rendelések
A státuszváltás state machine-en keresztül történik, nem szabad szöveges mezőként.

### Médiatár
Supabase Storage upload/delete és média metaadat kezelés.

### Integrációk
Supplier és provider registry + runtime readiness. API key/secret érték nem tárolható a szerkeszthető JSON-ban.

### Biztonság & audit
- aktuális role/permission lista;
- admin meghívás;
- role csere;
- admin tiltás/engedélyezés;
- audit eventek.

## Demo mód

Ha a `VITE_SUPABASE_URL` és `VITE_SUPABASE_PUBLISHABLE_KEY` nincs beállítva, az admin felület megnyitható demo módban. A demo mód vizuális/UX ellenőrzéshez való; nem ír adatbázist.

## Éles mód

Éles admin esetén minden mentés privát API-n megy keresztül és access token + permission ellenőrzést kap.
