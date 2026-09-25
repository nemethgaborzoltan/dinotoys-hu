import type { LegalProfile } from '../server/storefront'

export type LegalSection={heading:string;paragraphs?:string[];bullets?:string[]}
export type LegalDocument={slug:string;title:string;description:string;sections:LegalSection[]}

const seller=(p:LegalProfile)=>`${p.companyName}, székhely: ${p.registeredOffice}, nyilvántartási/cégjegyzékszám: ${p.registrationNumber}, adószám: ${p.taxNumber}`

export function buildLegalDocument(slug:string,p:LegalProfile):LegalDocument|null{
 const commonSeller=`A webshop üzemeltetője: ${seller(p)}. Kapcsolat: ${p.email}, ${p.phone}.`
 const docs:Record<string,LegalDocument>={
  impresszum:{slug,title:'Impresszum',description:'A DinoToys.hu üzemeltetői, kapcsolattartási és tárhelyszolgáltatói adatai.',sections:[
   {heading:'Szolgáltató adatai',bullets:[`Név: ${p.companyName}`,`Székhely: ${p.registeredOffice}`,`Levelezési cím: ${p.mailingAddress}`,`Nyilvántartási/cégjegyzékszám: ${p.registrationNumber}`,`Adószám: ${p.taxNumber}`,`E-mail: ${p.email}`,`Telefon: ${p.phone}`]},
   {heading:'Tárhely és infrastruktúra',paragraphs:[`Szolgáltató: ${p.hostingName}.`,`Cím: ${p.hostingAddress}. Kapcsolat: ${p.hostingContact}.`]},
   {heading:'Kapcsolat és panasz',paragraphs:[`Panaszkezelési cím: ${p.complaintAddress}. Elektronikus kapcsolat: ${p.email}.`]},
  ]},
  aszf:{slug,title:'Általános Szerződési Feltételek',description:'A DinoToys.hu online vásárlás, fizetés, szállítás, elállás és hibás teljesítés fő szabályai.',sections:[
   {heading:'1. Szolgáltató és hatály',paragraphs:[commonSeller,'Az ÁSZF a DinoToys.hu felületén fogyasztóként leadott online megrendelésekre irányadó. A termékoldal, a kosár, a checkout és a rendelés-visszaigazolás a szerződéshez kapcsolódó tájékoztatás részét képezik.']},
   {heading:'2. Termékek, variánsok és árak',paragraphs:['A termék lényeges tulajdonságai a termékoldalon találhatók. Szín-, méret- vagy más variáns esetén a választott variáns saját SKU-val, árral és készletállapottal rendelkezhet.','A feltüntetett fogyasztói ár bruttó HUF ár. A checkout a végleges árakat, kedvezményeket és szállítási költséget a megrendelés előtt összesíti.']},
   {heading:'3. Megrendelés és szerződéskötés',bullets:['A vásárló a kosárban ellenőrizheti és módosíthatja a tételeket, variánsokat és mennyiségeket.','A checkout előtt megadhatók a kapcsolati, számlázási és szállítási adatok.','A végső gomb egyértelműen jelzi, hogy a megrendelés fizetési kötelezettséggel jár.','A rendelés beérkezését elektronikus visszaigazolás követi; az automatikus technikai visszaigazolás önmagában nem feltétlenül jelenti minden esetben a rendelés elfogadását, ha készlet- vagy áradat-hiba merül fel.']},
   {heading:'4. Fizetés és szállítás',paragraphs:['Az elérhető fizetési és szállítási módokat, díjakat és várható teljesítési információkat a checkout mutatja. Külső fizetési vagy logisztikai szolgáltató igénybevétele esetén annak technikai folyamata is része a teljesítésnek.']},
   {heading:'5. Kuponok és promóciók',paragraphs:['A kupon feltételeit – például minimum kosárérték, lejárat, felhasználási limit vagy maximális kedvezmény – a rendszer a checkoutkor szerveroldalon ismét ellenőrzi. Hibás vagy lejárt kupon nem csökkenti a fizetendő összeget.']},
   {heading:'6. Elállás',paragraphs:['Távollévők között kötött fogyasztói szerződésnél a fogyasztót főszabály szerint 14 napos indokolás nélküli elállási jog illeti meg. Az elállás részletes menetét, a visszaküldést, a visszatérítést és a jogszabályi kivételeket az Elállás és visszaküldés oldal ismerteti.']},
   {heading:'7. Hibás teljesítés, szavatosság és jótállás',paragraphs:['Hibás teljesítés esetén a mindenkor hatályos polgári jogi és fogyasztóvédelmi szabályok szerinti kellékszavatossági, termékszavatossági és – ahol alkalmazandó – jótállási igények érvényesíthetők. Részletek a Szavatosság és jótállás oldalon.']},
   {heading:'8. Panaszkezelés',paragraphs:[`Panasz küldhető a(z) ${p.email} címre, illetve a(z) ${p.complaintAddress} címre. A békéltető testületi és fogyasztóvédelmi lehetőségeket külön Panaszkezelés oldal tartalmazza.`]},
   {heading:'9. Adatvédelem',paragraphs:['A megrendelés során kezelt személyes adatokra az Adatkezelési tájékoztató, a végberendezésen tárolt vagy onnan kiolvasott technológiákra a Cookie tájékoztató vonatkozik.']},
  ]},
  adatkezeles:{slug,title:'Adatkezelési tájékoztató',description:'Tájékoztató a webshop személyesadat-kezeléseiről, jogalapokról, megőrzésről és érintetti jogokról.',sections:[
   {heading:'1. Adatkezelő',paragraphs:[commonSeller]},
   {heading:'2. Megrendelés és szerződés teljesítése',bullets:['Kezelt adatok: név, e-mail, telefonszám, szállítási/számlázási adatok, rendelés tételei és státusza.','Cél: rendelés feldolgozása, teljesítés, kapcsolattartás, fizetés és szállítás koordinálása.','Jogalap: a szerződés megkötése és teljesítése; egyes számlázási és bizonylatmegőrzési adatoknál jogi kötelezettség.']},
   {heading:'3. Ügyfélszolgálat és panaszkezelés',paragraphs:['Az ügyfélszolgálati megkereséseket a válaszadás, jogérvényesítés és vitás ügyek dokumentálása érdekében kezeljük. A konkrét megőrzési időt az ügy típusa és a vonatkozó jogi kötelezettség határozza meg.']},
   {heading:'4. Hírlevél és marketing',paragraphs:['Hírlevél, remarketing és nem szükséges marketing technológia csak megfelelő hozzájárulás vagy más alkalmazható jogalap mellett aktiválható. A hozzájárulás jövőre nézve bármikor visszavonható.']},
   {heading:'5. Analitika és cookie-k',paragraphs:['A szükséges helyi tárolás a kosár, biztonság és hozzájárulási állapot működéséhez használható. Analitikai és marketing mérés csak a felhasználó választása után indulhat. A beállítások a láblécben bármikor újranyithatók.']},
   {heading:'6. Adatfeldolgozók és címzettek',bullets:['Felhő/adatbázis és fájltárolás: Supabase, ha production környezetben konfigurálva van.','CDN/edge és webkiszolgálás: Cloudflare, ha production környezetben konfigurálva van.','Fizetés: a kiválasztott payment provider (például Stripe), ha aktiválva van.','E-mail: a kiválasztott tranzakciós e-mail szolgáltató (például Resend), ha aktiválva van.','Szállítás és számlázás: a rendeléshez ténylegesen kiválasztott/logikailag szükséges szolgáltatók.']},
   {heading:'7. Nemzetközi adattovábbítás',paragraphs:['Ha valamely igénybe vett szolgáltató EGT-n kívüli adatkezelést vagy hozzáférést végez, az adattovábbítás csak alkalmazható GDPR-garanciák – például megfelelőségi határozat vagy megfelelő szerződéses biztosíték – mellett történhet. A production szolgáltatói szerződéseket indulás előtt ténylegesen ellenőrizni kell.']},
   {heading:'8. Érintetti jogok',bullets:['hozzáférés és másolat kérése','helyesbítés','törlés, ha annak feltételei fennállnak','adatkezelés korlátozása','tiltakozás a vonatkozó esetekben','adathordozhatóság a jogszabályi feltételek szerint','hozzájárulás visszavonása','panasz benyújtása a felügyeleti hatósághoz és bírósági jogorvoslat']},
   {heading:'9. Kapcsolat',paragraphs:[`Adatvédelmi megkeresés: ${p.email}. Utolsó felülvizsgálat: ${p.lastReviewed}.`]},
  ]},
  cookie:{slug,title:'Cookie és helyi tárolási tájékoztató',description:'A szükséges, analitikai és marketing technológiák célja és kezelése.',sections:[
   {heading:'1. Hogyan működik a hozzájárulás?',paragraphs:['A szükséges technológiák a kifejezetten kért webshopfunkciókhoz működhetnek. Analitikai és marketing kategória csak a hozzájárulás után kapcsolható be. A választás később a lábléc Cookie beállítások gombjával módosítható.']},
   {heading:'2. Szükséges tárolás',bullets:['dinotoys-consent-v1 – a cookie/technológiai preferenciák megjegyzése','dinotoys-hu-store-v3 – anonim kosár, kedvencek, összehasonlítás és kapcsolódó webshopállapot','dinotoys-popup-* – popup megjelenítési gyakoriság szabályozása','Supabase Auth storage – kizárólag akkor, ha az adott felhasználói/admin authentikáció aktív']},
   {heading:'3. Analitika',paragraphs:['Analitikai események a jelenlegi kódban csak akkor kerülhetnek a dataLayerbe, ha az analytics hozzájárulás igaz. A tényleges GA4/GTM szolgáltatás csak külön production konfigurációval kapcsolható be.']},
   {heading:'4. Marketing',paragraphs:['Remarketing, hirdetési pixel vagy marketing azonosító csak marketing hozzájárulás után aktiválható. A jelenlegi alapprojekt nem tölt be ilyen külső szkriptet automatikusan.']},
   {heading:'5. Beállítások módosítása',paragraphs:['A hozzájárulás megtagadása nem akadályozhatja az alapvető vásárlási funkciók használatát, ha az adott technológia nem feltétlenül szükséges a kért szolgáltatáshoz.']},
  ]},
  elallas:{slug,title:'Elállás és visszaküldés',description:'A 14 napos elállási jog és a visszaküldés gyakorlati menete.',sections:[
   {heading:'1. Elállási határidő',paragraphs:['Online, távollévők között kötött fogyasztói szerződésnél főszabály szerint 14 napon belül indokolás nélkül elállhatsz. Termék adásvételénél a határidő főszabály szerint az átvételhez igazodik.']},
   {heading:'2. Hogyan jelezd?',paragraphs:[`Küldj egyértelmű elállási nyilatkozatot a(z) ${p.email} címre vagy a(z) ${p.complaintAddress} címre. Megadhatod a rendelésazonosítót, nevedet, az érintett terméket és az elállási szándékot.`]},
   {heading:'3. Visszaküldés',paragraphs:['Az elállási nyilatkozat után a terméket a jogszabályi határidőn belül vissza kell juttatni. A termék jellegének, tulajdonságainak és működésének megállapításához szükséges használatot meghaladó értékcsökkenésért a fogyasztó felelhet.']},
   {heading:'4. Visszatérítés',paragraphs:['Szabályos elállás esetén a vállalkozás a jogszabályban előírt módon és határidőben téríti vissza az érintett összegeket. A visszatérítés bizonyos esetekben a termék visszaérkezéséig vagy a feladás igazolásáig visszatartható.']},
   {heading:'5. Kivételek',paragraphs:['A jogszabály meghatároz olyan eseteket, amikor az elállási jog nem vagy korlátozottan gyakorolható. A webshopban ilyen termék esetén az erre vonatkozó egyedi tájékoztatást a vásárlás előtt külön is meg kell jeleníteni.']},
  ]},
  panaszkezeles:{slug,title:'Panaszkezelés és jogorvoslat',description:'Kapcsolat, panaszkezelés, békéltető testület és fogyasztóvédelmi jogorvoslat.',sections:[
   {heading:'1. Panasz benyújtása',paragraphs:[`Panasz: ${p.email}; postai/panaszkezelési cím: ${p.complaintAddress}; telefon: ${p.phone}.`]},
   {heading:'2. Kivizsgálás',paragraphs:['A panaszt a vállalkozás a vonatkozó fogyasztóvédelmi szabályok szerint vizsgálja ki és dokumentálja. Ha a szavatossági vagy jótállási igény azonnal nem bírálható el, az arra irányadó külön eljárási szabályok szerint kell tájékoztatni a fogyasztót.']},
   {heading:'3. Békéltető testület',paragraphs:['Fogyasztói jogvita esetén a fogyasztó kezdeményezheti az illetékes kereskedelmi és iparkamara mellett működő békéltető testület eljárását. Az aktuális testületi elérhetőséget a fogyasztó lakóhelye/tartózkodási helye és a mindenkori hivatalos közzététel alapján kell megadni.']},
   {heading:'4. Fogyasztóvédelmi hatóság és bíróság',paragraphs:['A fogyasztó a hatáskörrel rendelkező fogyasztóvédelmi hatósághoz fordulhat, illetve jogait bíróság előtt is érvényesítheti.']},
  ]},
  szavatossag:{slug,title:'Szavatosság és jótállás',description:'Hibás teljesítés esetén igénybe vehető fogyasztói jogok és ügyintézés.',sections:[
   {heading:'1. Kellékszavatosság',paragraphs:['Ha a termék a teljesítéskor nem felel meg a szerződésnek, a fogyasztó a hatályos Polgári Törvénykönyv és fogyasztói adásvételi szabályok szerint kellékszavatossági jogokat érvényesíthet. A konkrét jog és sorrend az ügy körülményeitől függ.']},
   {heading:'2. Termékszavatosság',paragraphs:['A jogszabályi feltételek fennállása esetén a fogyasztó a gyártóval szemben is érvényesíthet termékszavatossági igényt.']},
   {heading:'3. Jótállás',paragraphs:['Kötelező vagy önkéntes jótállás kizárólag azokra a termékekre és feltételekkel alkalmazandó, amelyekre azt jogszabály vagy vállalás előírja. A termékoldalon és a rendelési dokumentumokban ennek megfelelő tájékoztatást kell megjeleníteni.']},
   {heading:'4. Bejelentés és jegyzőkönyv',paragraphs:[`Igény bejelenthető a(z) ${p.email} elérhetőségen. A fogyasztói szavatossági/jótállási igény ügyintézését a vonatkozó eljárási szabályok szerint dokumentálni kell.`]},
  ]},
 }
 return docs[slug]??null
}
