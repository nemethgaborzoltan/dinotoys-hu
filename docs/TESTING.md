# TESTING

## Unit
- EUR→HUF retail pricing
- ÁFA és kerekítés
- árrés és pszichológiai ár
- kupon/ingyenes szállítás szabály
- safety publish gate

## Integration
- supplier import idempotencia
- DB insert/update és unique constraint
- checkout szerveroldali újraárazás
- készletellenőrzés
- payment webhook signature + idempotencia
- invoice/email adapter

## E2E
Mobil és desktop: keresés → lista → PDP → kosár → checkout → fizetés → sikeres rendelés. Negatív utak: elfogyó készlet, dupla kattintás, sikertelen fizetés, webhook retry, megszakadt checkout, kupon lejárat.

## Vizuális/accessibility QA
320/375/768/1024/1440 px; keyboard navigation; focus state; kontraszt; dialog/overlay; hosszú magyar szövegek; üres/loading/error/success state.

## Jelenlegi állapot
A repository tartalmaz Vitest pricing tesztet és CI workflow-t. Ebben a munkakörnyezetben a package registry telepítés időtúllépett, ezért teljes dependency-alapú buildet nem lehetett hitelesen lefuttatni. Első GitHub CI futás a kötelező technikai ellenőrzési kapu.
