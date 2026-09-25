# BUSINESS RULES

## Retail modell
A magyar webshop B2C kiskereskedelmi csatorna. A Dino Toys NL beszállítói katalógus és készletforrás; a retail ár, készletígéret, marketing és ügyfélkommunikáció saját üzleti réteg.

## Árazás
Retail ár nem másolható vakon supplier mezőből. Formula: supplier EUR cost × FX buffer + inbound allocation → target gross margin → VAT → pricing ending. Minden szabály verziózható és auditálható legyen.

## Készlet
`in_stock` csak akkor publikálható, ha a saját/szinkronizált készlet szabály szerint rendelkezésre áll. Supplier feed késése esetén safety stock használható. Checkoutkor újraellenőrzés kötelező.

## Compliance publish gate
Termék nem publikálható aktívként, ha a kötelező azonosító/biztonsági adatok hiányoznak. Kezelendő: manufacturer, EU responsible person ahol szükséges, product identifier/EAN, warnings HU, CE ahol alkalmazandó, recall/safety state.

## Tartalom
Beszállítói leírás importálható szerződés/licenc keretei között, de retail oldalon saját magyar leírás, strukturált specifikáció és SEO mezők készüljenek. AI-generált safety állítás nem publikálható emberi ellenőrzés nélkül.

## Checkout
A backend a végső forrás ár, ÁFA, kedvezmény, készlet és fizetési státusz ügyében. Guest checkout támogatott. Rendelés csak hiteles payment/webhook esemény alapján válhat fizetettá.

## Visszáru
Returns workflow külön státuszokkal és audit loggal. A konkrét ÁSZF/elállási szöveg jogi jóváhagyást igényel.
