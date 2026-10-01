import {useEffect,useMemo,useState} from 'react'
import type{JsonValue} from '../server/storefront'

export type HeroChip={label:string;value:string}
export type HeroConfig={
 version:string;mode:'legacy'|'cinematic'|'orbits'|'universe'|'showcase';eyebrow:string;title:string;emphasis:string;description:string;
 primaryCta:string;secondaryCta:string;trustItems:string[];spotlightProductId:string;orbitProductIds:string[];
 chips:HeroChip[];notes:string[];background:string
}
export type HeroVersion={id:string;sectionKey:string;name:string;content:HeroConfig;active:boolean;savedAt?:string}

export const legacyHero:HeroConfig={version:'legacy-20260925',mode:'legacy',eyebrow:'✨ Friss trendek hetente',title:'Nem még egy játékwebshop.',emphasis:'Találd meg gyorsan azt, aminek örülni fog.',description:'Trendi játékok, variánsok, okos ajánlatok és gyors vásárlási élmény — felesleges kattintgatás nélkül.',primaryCta:'Felfedezem a játékokat →',secondaryCta:'✨ Segíts ajándékot választani',trustItems:['✓ Mobilra optimalizált','✓ Biztonságos fizetés','✓ 14 napos elállási jog'],spotlightProductId:'p-stitch',orbitProductIds:['p-hotwheels','p-kawaii','p-squeeze'],chips:[{label:'Kupon',value:'WELCOME10'},{label:'Variáns',value:'Szín + méret'},{label:'Értékelés',value:'4.8/5'}],notes:['🔥 Könnyű CSS 3D','🛍 Upsell + cross-sell','⚡ Responsive + reduced-motion'],background:'#f3f5f4'}
export const premiumHero:HeroConfig={version:'premium-v2',mode:'cinematic',eyebrow:'🚀 Modern storefront élmény',title:'Prémium játékwebshop',emphasis:'ami minden kijelzőn ütős és gyors.',description:'Lebegő 3D termékkártyák, erős fókusztermék és tiszta kereskedelmi üzenetek — könnyű, GPU-barát animációkkal mobilon, tableten és desktopon.',primaryCta:'Felfedezem a katalógust →',secondaryCta:'✨ Ajándékkereső indítása',trustItems:['✓ Mobile-first élmény','✓ Variánsos kosár és checkout','✓ Kupon, upsell, cross-sell'],spotlightProductId:'p-stitch',orbitProductIds:['p-hotwheels','p-schleich','p-kawaii','p-squeeze'],chips:[{label:'Konverzió',value:'Upsell + popup'},{label:'Sebesség',value:'Lightweight motion'},{label:'Kereskedelem',value:'Variáns SKU/ár/készlet'}],notes:['3D mélység','Responsive minden eszközön','Adminból visszaállítható verziók'],background:'linear-gradient(135deg,#f7f8ff 0%,#eef4ff 40%,#f7fbf7 100%)'}
export const orbitHero:HeroConfig={...premiumHero,version:'orbits-v1',mode:'orbits',eyebrow:'🌟 Floating commerce hero',title:'Trendi játékok.',emphasis:'Tiszta, prémium, élő storefront érzettel.',spotlightProductId:'p-schleich',orbitProductIds:['p-stitch','p-hello','p-hotwheels'],background:'linear-gradient(135deg,#f4f2ff 0%,#fff7fb 52%,#f5fbff 100%)'}
export const universeHero:HeroConfig={
 version:'dinoverse-v3-20261001',mode:'universe',
 eyebrow:'DinoToys.hu · Játék. Élmény. Ajándék.',
 title:'A következő nagy kedvenc',
 emphasis:'itt kezdődik.',
 description:'Play-Doh alkotás, Star Wars kaland, Barbie stílus és még több ajándékötlet egy gyors, látványos játékshopban — gyerekeknek élmény, felnőtteknek egyszerű választás.',
 primaryCta:'Felfedezem a játékokat →',secondaryCta:'✨ Segíts ajándékot választani',
 trustItems:['✓ Gyors ajándékkereső','✓ Átlátható szállítás','✓ 14 napos elállás'],
 spotlightProductId:'p-playdoh-stamp-shape-a9305',
 orbitProductIds:['p-starwars-darth-vader-g1277','p-barbie-renee-jfx99','p-stitch-bagclip-3','p-playdoh-cupcakes-f7527'],
 chips:[{label:'Kreatív',value:'Play-Doh'},{label:'Kaland',value:'Star Wars'},{label:'Stílus',value:'Barbie'}],
 notes:['🎁 Ajándékötlet 60 mp alatt','🟠 FOXPOST pontválasztás','♡ Kedvencek és összehasonlítás','⚡ Gyors, mobilbarát élmény'],
 background:'radial-gradient(circle at 78% 20%,rgba(255,91,157,.24),transparent 28%),radial-gradient(circle at 12% 78%,rgba(64,224,208,.18),transparent 30%),linear-gradient(135deg,#111520 0%,#17152b 52%,#0d2430 100%)'
}
export const showcaseHero:HeroConfig={
 version:'dinostage-v4-20261001',mode:'showcase',
 eyebrow:'DinoToys.hu · játékok, amikért tényleg lelkesednek',
 title:'Találd meg azt a játékot,',
 emphasis:'amit alig várnak, hogy kibontsanak.',
 description:'Kreatív Play-Doh, ikonikus Star Wars, Barbie, Disney és még több kedvenc — átláthatóan, gyorsan, felesleges vizuális káosz nélkül.',
 primaryCta:'Játékok felfedezése →',secondaryCta:'✨ Ajándékkereső',
 trustItems:['Gyors választás','FOXPOST átvétel','14 napos elállás'],
 spotlightProductId:'p-playdoh-stamp-shape-a9305',
 orbitProductIds:['p-starwars-darth-vader-g1277','p-barbie-renee-jfx99','p-stitch-bagclip-3'],
 chips:[{label:'01',value:'Play-Doh'},{label:'02',value:'Star Wars'},{label:'03',value:'Barbie'}],
 notes:['🎁 Ajándékötlet 60 mp alatt','🟠 FOXPOST pontválasztás','♡ Kedvencek és összehasonlítás','⚡ Gyors, mobilbarát vásárlás'],
 background:'radial-gradient(circle at 84% 16%,rgba(255,121,181,.34),transparent 29%),radial-gradient(circle at 63% 82%,rgba(82,215,200,.28),transparent 31%),radial-gradient(circle at 16% 20%,rgba(255,214,93,.24),transparent 27%),linear-gradient(135deg,#fff8e8 0%,#f6edff 48%,#e9fbff 100%)'
}

const demoActiveKey='dinotoys-demo-hero-active-v1'
const demoCustomKey='dinotoys-demo-hero-custom-v1'
const demoUniverseMigrationKey='dinotoys-demo-hero-universe-v3-activated'
const demoShowcaseMigrationKey='dinotoys-demo-hero-showcase-v4-activated'
export const builtInHeroVersions:HeroVersion[]=[
 {id:'legacy',sectionKey:'hero_legacy_20260925',name:'Korábbi hero – 2026-09-25',content:legacyHero,active:false},
 {id:'premium',sectionKey:'hero_premium_v2',name:'Premium 3D storefront',content:premiumHero,active:false},
 {id:'orbits',sectionKey:'hero_orbits_v1',name:'Floating commerce',content:orbitHero,active:false},
 {id:'universe',sectionKey:'hero_dinoverse_v3_20261001',name:'DinoVerse 3D · 2026-10-01',content:universeHero,active:false},
 {id:'showcase',sectionKey:'hero_dinostage_v4_20261001',name:'DinoStage Clean 3D · 2026-10-01',content:showcaseHero,active:true},
]

export function normalizeHero(value:unknown):HeroConfig{
 const raw=(value&&typeof value==='object'?value:{}) as Record<string,unknown>
 const base=premiumHero
 return{
  version:String(raw.version??base.version),mode:(['legacy','cinematic','orbits','universe','showcase'].includes(String(raw.mode))?String(raw.mode):base.mode) as HeroConfig['mode'],
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
export function getDemoActiveHero(){if(typeof window==='undefined')return showcaseHero;let id=localStorage.getItem(demoActiveKey);if(!localStorage.getItem(demoUniverseMigrationKey)){if(!id||id==='premium'){id='universe';localStorage.setItem(demoActiveKey,id)}localStorage.setItem(demoUniverseMigrationKey,'1')}if(!localStorage.getItem(demoShowcaseMigrationKey)){if(!id||id==='universe'){id='showcase';localStorage.setItem(demoActiveKey,id)}localStorage.setItem(demoShowcaseMigrationKey,'1')}id=id||'showcase';return readDemoVersions().find(v=>v.id===id)?.content??showcaseHero}
export function activateDemoHero(id:string){if(typeof window==='undefined')return;localStorage.setItem(demoActiveKey,id);window.dispatchEvent(new CustomEvent('dinotoys:hero-change'))}
export function saveDemoHeroSnapshot(content:HeroConfig){if(typeof window==='undefined')return;const row:HeroVersion={id:'saved-'+Date.now(),sectionKey:'hero_saved_'+Date.now(),name:'Mentett hero '+new Date().toLocaleString('hu-HU'),content,active:false,savedAt:new Date().toISOString()};const custom=readDemoVersions().filter(v=>!builtInHeroVersions.some(b=>b.id===v.id));localStorage.setItem(demoCustomKey,JSON.stringify([row,...custom]));window.dispatchEvent(new CustomEvent('dinotoys:hero-change'))}
export function saveAndActivateDemoHero(content:HeroConfig,name='Egyedi hero'){
 if(typeof window==='undefined')return
 const normalized=normalizeHero({...content,version:'builder-'+Date.now()})
 const custom=readDemoVersions().filter(v=>!builtInHeroVersions.some(b=>b.id===v.id)&&v.id!=='builder-current')
 const current=readDemoVersions().find(v=>v.id==='builder-current')
 const history=current?{...current,id:'saved-'+Date.now(),sectionKey:'hero_saved_'+Date.now(),name:'Hero mentés előtti állapot '+new Date().toLocaleString('hu-HU'),active:false,savedAt:new Date().toISOString()}:null
 const builder:HeroVersion={id:'builder-current',sectionKey:'hero_builder_current',name,content:normalized,active:true,savedAt:new Date().toISOString()}
 localStorage.setItem(demoCustomKey,JSON.stringify([builder,...(history?[history]:[]),...custom].slice(0,30)))
 localStorage.setItem(demoActiveKey,'builder-current')
 window.dispatchEvent(new CustomEvent('dinotoys:hero-change'))
}

export function deleteDemoHero(id:string){if(typeof window==='undefined')return;const custom=readDemoVersions().filter(v=>!builtInHeroVersions.some(b=>b.id===v.id)&&v.id!==id);localStorage.setItem(demoCustomKey,JSON.stringify(custom));if(localStorage.getItem(demoActiveKey)===id)localStorage.setItem(demoActiveKey,'showcase');window.dispatchEvent(new CustomEvent('dinotoys:hero-change'))}

export function useResolvedHero(liveContent?:Record<string,JsonValue>|null){
 const [demoHero,setDemoHero]=useState<HeroConfig>(showcaseHero)
 useEffect(()=>{if(liveContent)return;const sync=()=>setDemoHero(getDemoActiveHero());sync();window.addEventListener('dinotoys:hero-change',sync);return()=>window.removeEventListener('dinotoys:hero-change',sync)},[liveContent])
 return useMemo(()=>liveContent?normalizeHero(liveContent):demoHero,[liveContent,demoHero])
}
