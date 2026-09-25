import {useEffect,useMemo,useState} from 'react'
import type{JsonValue} from '../server/storefront'

export type HeroChip={label:string;value:string}
export type HeroConfig={
 version:string;mode:'legacy'|'cinematic'|'orbits';eyebrow:string;title:string;emphasis:string;description:string;
 primaryCta:string;secondaryCta:string;trustItems:string[];spotlightProductId:string;orbitProductIds:string[];
 chips:HeroChip[];notes:string[];background:string
}
export type HeroVersion={id:string;sectionKey:string;name:string;content:HeroConfig;active:boolean;savedAt?:string}

export const legacyHero:HeroConfig={version:'legacy-20260925',mode:'legacy',eyebrow:'✨ Friss trendek hetente',title:'Nem még egy játékwebshop.',emphasis:'Találd meg gyorsan azt, aminek örülni fog.',description:'Trendi játékok, variánsok, okos ajánlatok és gyors vásárlási élmény — felesleges kattintgatás nélkül.',primaryCta:'Felfedezem a játékokat →',secondaryCta:'✨ Segíts ajándékot választani',trustItems:['✓ Mobilra optimalizált','✓ Biztonságos fizetés','✓ 14 napos elállási jog'],spotlightProductId:'p-stitch',orbitProductIds:['p-hotwheels','p-kawaii','p-squeeze'],chips:[{label:'Kupon',value:'WELCOME10'},{label:'Variáns',value:'Szín + méret'},{label:'Értékelés',value:'4.8/5'}],notes:['🔥 Könnyű CSS 3D','🛍 Upsell + cross-sell','⚡ Responsive + reduced-motion'],background:'#f3f5f4'}
export const premiumHero:HeroConfig={version:'premium-v2',mode:'cinematic',eyebrow:'🚀 Modern storefront élmény',title:'Prémium játékwebshop',emphasis:'ami minden kijelzőn ütős és gyors.',description:'Lebegő 3D termékkártyák, erős fókusztermék és tiszta kereskedelmi üzenetek — könnyű, GPU-barát animációkkal mobilon, tableten és desktopon.',primaryCta:'Felfedezem a katalógust →',secondaryCta:'✨ Ajándékkereső indítása',trustItems:['✓ Mobile-first élmény','✓ Variánsos kosár és checkout','✓ Kupon, upsell, cross-sell'],spotlightProductId:'p-stitch',orbitProductIds:['p-hotwheels','p-schleich','p-kawaii','p-squeeze'],chips:[{label:'Konverzió',value:'Upsell + popup'},{label:'Sebesség',value:'Lightweight motion'},{label:'Kereskedelem',value:'Variáns SKU/ár/készlet'}],notes:['3D mélység','Responsive minden eszközön','Adminból visszaállítható verziók'],background:'linear-gradient(135deg,#f7f8ff 0%,#eef4ff 40%,#f7fbf7 100%)'}
export const orbitHero:HeroConfig={...premiumHero,version:'orbits-v1',mode:'orbits',eyebrow:'🌟 Floating commerce hero',title:'Trendi játékok.',emphasis:'Tiszta, prémium, élő storefront érzettel.',spotlightProductId:'p-schleich',orbitProductIds:['p-stitch','p-hello','p-hotwheels'],background:'linear-gradient(135deg,#f4f2ff 0%,#fff7fb 52%,#f5fbff 100%)'}

const demoActiveKey='dinotoys-demo-hero-active-v1'
const demoCustomKey='dinotoys-demo-hero-custom-v1'
export const builtInHeroVersions:HeroVersion[]=[
 {id:'legacy',sectionKey:'hero_legacy_20260925',name:'Korábbi hero – 2026-09-25',content:legacyHero,active:false},
 {id:'premium',sectionKey:'hero_premium_v2',name:'Premium 3D storefront',content:premiumHero,active:true},
 {id:'orbits',sectionKey:'hero_orbits_v1',name:'Floating commerce',content:orbitHero,active:false},
]

export function normalizeHero(value:unknown):HeroConfig{
 const raw=(value&&typeof value==='object'?value:{}) as Record<string,unknown>
 const base=premiumHero
 return{
  version:String(raw.version??base.version),mode:(['legacy','cinematic','orbits'].includes(String(raw.mode))?String(raw.mode):base.mode) as HeroConfig['mode'],
  eyebrow:String(raw.eyebrow??base.eyebrow),title:String(raw.title??base.title),emphasis:String(raw.emphasis??base.emphasis),description:String(raw.description??base.description),
  primaryCta:String(raw.primaryCta??base.primaryCta),secondaryCta:String(raw.secondaryCta??base.secondaryCta),
  trustItems:Array.isArray(raw.trustItems)?raw.trustItems.map(String):base.trustItems,spotlightProductId:String(raw.spotlightProductId??base.spotlightProductId),
  orbitProductIds:Array.isArray(raw.orbitProductIds)?raw.orbitProductIds.map(String):base.orbitProductIds,
  chips:Array.isArray(raw.chips)?raw.chips.map((item:any)=>({label:String(item?.label??''),value:String(item?.value??'')})):base.chips,
  notes:Array.isArray(raw.notes)?raw.notes.map(String):base.notes,background:String(raw.background??base.background),
 }
}
export function heroToJson(hero:HeroConfig):Record<string,JsonValue>{return hero as unknown as Record<string,JsonValue>}

function readDemoVersions(){
 if(typeof window==='undefined')return builtInHeroVersions
 try{const custom=JSON.parse(localStorage.getItem(demoCustomKey)||'[]') as HeroVersion[];return[...custom,...builtInHeroVersions]}catch{return builtInHeroVersions}
}
export function getDemoHeroVersions(){return readDemoVersions()}
export function getDemoActiveHero(){if(typeof window==='undefined')return premiumHero;const id=localStorage.getItem(demoActiveKey)||'premium';return readDemoVersions().find(v=>v.id===id)?.content??premiumHero}
export function activateDemoHero(id:string){if(typeof window==='undefined')return;localStorage.setItem(demoActiveKey,id);window.dispatchEvent(new CustomEvent('dinotoys:hero-change'))}
export function saveDemoHeroSnapshot(content:HeroConfig){if(typeof window==='undefined')return;const row:HeroVersion={id:'saved-'+Date.now(),sectionKey:'hero_saved_'+Date.now(),name:'Mentett hero '+new Date().toLocaleString('hu-HU'),content,active:false,savedAt:new Date().toISOString()};const custom=readDemoVersions().filter(v=>!builtInHeroVersions.some(b=>b.id===v.id));localStorage.setItem(demoCustomKey,JSON.stringify([row,...custom]));window.dispatchEvent(new CustomEvent('dinotoys:hero-change'))}
export function deleteDemoHero(id:string){if(typeof window==='undefined')return;const custom=readDemoVersions().filter(v=>!builtInHeroVersions.some(b=>b.id===v.id)&&v.id!==id);localStorage.setItem(demoCustomKey,JSON.stringify(custom));if(localStorage.getItem(demoActiveKey)===id)localStorage.setItem(demoActiveKey,'premium');window.dispatchEvent(new CustomEvent('dinotoys:hero-change'))}

export function useResolvedHero(liveContent?:Record<string,JsonValue>|null){
 const [demoHero,setDemoHero]=useState<HeroConfig>(premiumHero)
 useEffect(()=>{if(liveContent)return;const sync=()=>setDemoHero(getDemoActiveHero());sync();window.addEventListener('dinotoys:hero-change',sync);return()=>window.removeEventListener('dinotoys:hero-change',sync)},[liveContent])
 return useMemo(()=>liveContent?normalizeHero(liveContent):demoHero,[liveContent,demoHero])
}
