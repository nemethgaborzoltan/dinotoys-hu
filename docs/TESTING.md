# TESTING

## Automatikusan futó CI
Minden `main` push és pull request esetén GitHub Actions fut:

`bun install → bun run build → bun run typecheck → bun run test`

A jelenlegi pipeline zöld.

## Unit
Jelenleg automatizált:
- EUR→HUF retail pricing
- ÁFA és kerekítés
- célárrés
- compliance publishing gate
- ingyenes szállítási küszöb
- százalékos kedvezmény maximum limit

Következő egységtesztek:
- kupon jogosultság és lejárat
- stock reservation TTL
- checkout total snapshot
- refund összegkorlát

## Integration
A külső szolgáltatások bekötésekor kötelező:
- supplier import idempotencia
- DB insert/update és unique constraint
- checkout szerveroldali újraárazás
- készletfoglalás tranzakcióban
- payment webhook signature + idempotencia
- invoice/email/shipping adapter

## E2E
Mobil és desktop: keresés → lista → PDP → kosár → checkout → fizetés → sikeres rendelés.

Negatív utak: elfogyó készlet, dupla kattintás, sikertelen fizetés, webhook retry, megszakadt checkout, kupon lejárat, visszatérítés.

## Vizuális/accessibility QA
320/375/768/1024/1440 px; keyboard navigation; focus state; kontraszt; dialog/overlay; hosszú magyar szövegek; üres/loading/error/success state.
