# DEPLOYMENT

## Környezetek
`local` → `staging` → `production`. A production külön Supabase projekttel/adatbázissal és külön runtime secretekkel fusson.

## Cloudflare
TanStack Start SSR a Cloudflare Workers runtime-on. Statikus assetek CDN-ről. Termékképekhez R2 + image resizing javasolt.

## Secret kezelés
A `.env.example` csak kulcsneveket tartalmaz. Production secret: Supabase service role, payment secret/webhook secret, Resend, invoice/shipping API kulcsok. Ezek Cloudflare secret store-ban legyenek, Gitben soha.

## CI/CD
GitHub Actions: install → route generation/build → typecheck → unit test. Production deploy csak zöld ellenőrzések után. Adatbázis migráció külön, kontrollált lépés.

## Release gate
1. migration/staging
2. build + automated tests
3. smoke checkout teszt
4. payment webhook teszt
5. safety/compliance publish gate ellenőrzés
6. production deploy
7. post-deploy smoke + logs

## Rollback
Kód: előző Worker deployment. Adatbázis: kompatibilis forward-fix preferált; destruktív változásnál előre elkészített restore terv.
