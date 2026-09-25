import {Link,createFileRoute} from '@tanstack/react-router'
import {absoluteUrl} from '../lib/seo'
import {getContentPage} from '../server/storefront'

export const Route=createFileRoute('/visszakuldes')({
 loader:()=>getContentPage({data:{slug:'visszakuldes'}}),
 head:()=>({meta:[{title:'Visszaküldés és elállás | DinoToys.hu'},{name:'description',content:'Visszaküldési folyamat és tájékoztatás a fogyasztói elállási jog gyakorlásához.'}],links:[{rel:'canonical',href:absoluteUrl('/visszakuldes')}]}),
 component:ReturnsInfo,
})
function ReturnsInfo(){
 const page=Route.useLoaderData()
 if(page)return <div className="container section info-page"><span className="eyebrow">Vásárlási segítség</span><h1>{page.title}</h1><div className="cms-body">{page.body}</div></div>
 return <div className="container section info-page"><span className="eyebrow">Átlátható folyamat</span><h1>Visszaküldés és elállás</h1><p className="lead">Online fogyasztói vásárlásnál főszabály szerint 14 napos indokolás nélküli elállási jog áll rendelkezésre. A konkrét ügyben mindig a hatályos szabályok és az adott termékre vonatkozó esetleges kivételek irányadók.</p><ol className="steps"><li><b>1</b><span><strong>Elállási szándék jelzése</strong><small>Egyértelmű nyilatkozat rendelésazonosítóval és elérhetőséggel.</small></span></li><li><b>2</b><span><strong>Visszaküldés</strong><small>A terméket a vonatkozó határidő és feltételek szerint vissza kell juttatni.</small></span></li><li><b>3</b><span><strong>Beérkezés és ellenőrzés</strong><small>A visszáru adminfolyamata státusszal és auditálható kezeléssel készül.</small></span></li><li><b>4</b><span><strong>Visszatérítés</strong><small>A jogszabály és a fizetési mód szabályai szerint.</small></span></li></ol><div className="legal-note">Részletes jogi tájékoztató: <Link to="/jogi/$slug" params={{slug:'elallas'}}><b>Elállás és visszaküldés</b></Link>. Hibás termék esetén lásd a <Link to="/jogi/$slug" params={{slug:'szavatossag'}}><b>Szavatosság és jótállás</b></Link> oldalt.</div></div>
}
