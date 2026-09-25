import {Link,createFileRoute} from '@tanstack/react-router'
import {absoluteUrl} from '../lib/seo'
import {getContentPage} from '../server/storefront'

export const Route=createFileRoute('/szallitas')({
 loader:()=>getContentPage({data:{slug:'szallitas'}}),
 head:()=>({meta:[{title:'Szállítás és fizetés | DinoToys.hu'},{name:'description',content:'Szállítási módok, díjak, fizetési lehetőségek és rendelési információk a DinoToys.hu webshopban.'}],links:[{rel:'canonical',href:absoluteUrl('/szallitas')}]}),
 component:ShippingInfo,
})
function ShippingInfo(){
 const page=Route.useLoaderData()
 if(page)return <div className="container section info-page"><span className="eyebrow">Vásárlási segítség</span><h1>{page.title}</h1><div className="cms-body">{page.body}</div></div>
 return <div className="container section info-page"><span className="eyebrow">Vásárlási segítség</span><h1>Szállítás és fizetés</h1><p className="lead">A végleges díjakat, elérhető átvételi módokat és várható teljesítési időt mindig a checkout mutatja a megrendelés véglegesítése előtt. A lentiek a még konfigurálandó provider-réteget ismertetik.</p><div className="info-grid"><section><span>📦</span><h2>Házhozszállítás</h2><p>A rendszer GLS/DPD jellegű szolgáltató adapterhez előkészített. Csak a ténylegesen aktivált partner és szerződéses díj jelenhet meg éles vásárláskor.</p></section><section><span>📍</span><h2>Csomagautomata</h2><p>Foxpost/Packeta jellegű automata- és átvételipont-választás támogatására tervezve.</p></section><section><span>💳</span><h2>Online fizetés</h2><p>A kártyás fizetés külső fizetési szolgáltatóhoz csatlakozik; a webshopnak nem kell nyers kártyaadatot tárolnia.</p></section><section><span>🎁</span><h2>Ingyenes szállítás</h2><p>Az aktuális küszöb adminból konfigurálható, a kosár pedig folyamatosan jelzi a hátralévő összeget.</p></section></div><p className="info-crosslink">A szerződéses részleteket az <Link to="/jogi/$slug" params={{slug:'aszf'}}>ÁSZF</Link>, az adatkezelési hátteret az <Link to="/jogi/$slug" params={{slug:'adatkezeles'}}>Adatkezelési tájékoztató</Link> tartalmazza.</p></div>
}
