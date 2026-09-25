# Supabase + DinoAdmin setup

## 1. Supabase projekt

Hozz létre egy új Supabase projektet külön production környezetként.

## 2. Migrációk

A következő sorrendben futtasd a repository migrációit:
1. `20260925090000_init_shop.sql`
2. `20260925100000_backend_platform.sql`
3. `20260925103000_checkout_engine.sql`

## 3. Környezeti változók

Lokálisan másold az `.env.example` fájlt `.env` néven, majd add meg legalább:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_BOOTSTRAP_EMAIL=sajat-admin-email@pelda.hu
```

A VITE változók publikus klienskonfigurációk. A SERVICE_ROLE és minden külső API secret kizárólag server/Cloudflare secret.

## 4. Első admin

Supabase Authentication alatt hozz létre egy usert ugyanazzal az e-maillel, amelyet `ADMIN_BOOTSTRAP_EMAIL` értékként megadtál.

Lépj be:
`/admin`

A rendszer felismeri, hogy van Auth user, de nincs admin role, és felajánlja az egyszeri Super Admin bootstrapot.

Bootstrap csak akkor engedélyezett, ha:
- az e-mail pontosan egyezik az env értékével;
- az `admin_users` tábla még üres.

## 5. További adminok

A bootstrap után a Biztonság & audit munkaterületen meghívhatod a további admin felhasználókat, és szerepkört rendelhetsz hozzájuk.

## 6. Cloudflare secretek

Élesítés előtt a secret értékeket Wrangler/Cloudflare secretként állítsd be, ne GitHub fájlban.

Példák:
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- BILLINGO_API_KEY vagy SZAMLAZZ_AGENT_KEY
- választott shipping provider API key
- Dino Toys feed credential

## 7. Ellenőrzés

```bash
bun install
bun run build
bun run typecheck
bun run test
```

Ezután:
- `/api/v1/health`
- `/admin`
- termék draft létrehozás
- kép feltöltés
- compliance mezők
- active publish
- publikus terméklista
- kosár/checkout
