import {Link,createFileRoute,notFound} from '@tanstack/react-router'
import {buildLegalDocument} from '../data/legal'
import {absoluteUrl} from '../lib/seo'
import {getContentPage,getLegalProfile} from '../server/storefront'

export const Route=createFileRoute('/jogi/$slug')({
 loader:async({params})=>{
  const [live,profile]=await Promise.all([getContentPage({data:{slug:params.slug}}),getLegalProfile()])
  const fallback=buildLegalDocument(params.slug,profile)
  if(!live&&!fallback)throw notFound()
  return{live,profile,fallback,slug:params.slug,draft:!live&&!profile.complete}
 },
 head:({loaderData,params})=>{
  const title=loaderData?.live?.seo_title||loaderData?.live?.title||loaderData?.fallback?.title||'Jogi tájékoztató'
  const description=loaderData?.live?.seo_description||loaderData?.fallback?.description||'DinoToys.hu jogi tájékoztató'
  return{meta:[{title:`${title} | DinoToys.hu`},{name:'description',content:description},{name:'robots',content:loaderData?.draft?'noindex,follow':'index,follow'}],links:[{rel:'canonical',href:absoluteUrl(`/jogi/${params.slug}`)}]}
 },
 component:Legal,
})

function Legal(){
 const {live,profile,fallback,draft}=Route.useLoaderData()
 const title=live?.title||fallback?.title||'Jogi tájékoztató'
 return <div className="container section info-page legal-page"><div className="breadcrumbs"><Link to="/">Főoldal</Link><span>/</span><b>{title}</b></div><span className="eyebrow">Jogi és vásárlói tájékoztatás</span><h1>{title}</h1>{draft&&<div className="legal-launch-warning"><b>Élesítés előtti teendő</b><span>A vállalkozás pontos jogi adatai még nincsenek teljesen kitöltve. Admin → Kereskedelem → Beállítások alatt töltsd ki a <code>legal.*</code> mezőket, majd jogi ellenőrzés után publikáld a CMS-verziót.</span></div>}
 {live?.body?<article className="cms-body legal-article">{live.body}</article>:<article className="legal-article"><p className="lead">{fallback?.description}</p>{fallback?.sections.map(section=><section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs?.map((paragraph,index)=><p key={index}>{paragraph}</p>)}{section.bullets&&<ul>{section.bullets.map(item=><li key={item}>{item}</li>)}</ul>}</section>)}</article>}
 <aside className="legal-meta"><span>Utolsó technikai/jogi sablon-felülvizsgálat: <b>{profile.lastReviewed}</b></span><span>Kapcsolat: <b>{profile.email}</b></span></aside><div className="legal-note">A beépített szöveg működő e-kereskedelmi jogi sablon, de a konkrét vállalkozás, termékkör, fizetési/szállítási partnerek és üzleti folyamatok alapján indulás előtt szakmai jogi ellenőrzés szükséges.</div></div>
}
