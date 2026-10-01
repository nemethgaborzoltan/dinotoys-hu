import {useEffect,useState} from 'react'

export type EditableLink={id:string;label:string;href:string;enabled:boolean}
export type HeaderEditorConfig={
 showAnnouncement:boolean
 announcementItems:string[]
 logoLetter:string
 brandName:string
 brandSuffix:string
 tagline:string
 showSearch:boolean
 searchPlaceholder:string
 showGiftFinder:boolean
 giftFinderLabel:string
 showWishlist:boolean
 wishlistLabel:string
 showCart:boolean
 cartLabel:string
 navItems:EditableLink[]
 showBrandMenu:boolean
 brandMenuLabel:string
 brandLinks:EditableLink[]
 showCompare:boolean
 compareLabel:string
 sticky:boolean
 compact:boolean
 accent:string
 announcementBackground:string
 headerBackground:string
}
export type FooterEditorConfig={
 enabled:boolean
 brandName:string
 brandSuffix:string
 intro:string
 legalNote:string
 background:string
 textColor:string
 shoppingTitle:string
 shoppingLinks:EditableLink[]
 supportTitle:string
 supportLinks:EditableLink[]
 legalTitle:string
 legalLinks:EditableLink[]
 showCookieButton:boolean
 cookieLabel:string
 copyright:string
}
export type CheckoutEditorConfig={
 eyebrow:string
 title:string
 description:string
 showProgress:boolean
 progressLabels:[string,string,string]
 contactTitle:string
 contactDescription:string
 shippingTitle:string
 shippingDescription:string
 addressTitle:string
 addressDescription:string
 paymentTitle:string
 paymentDescription:string
 companyInvoiceLabel:string
 consentText:string
 submitLabel:string
 summaryEyebrow:string
 summaryTitle:string
 editCartLabel:string
 showTrust:boolean
 trustItems:string[]
 successBadge:string
 successTitle:string
 successText:string
 successPrimaryLabel:string
 successAdminLabel:string
 successContinueLabel:string
 accent:string
 panelRadius:number
 compact:boolean
}
export type SiteEditorConfig={header:HeaderEditorConfig;footer:FooterEditorConfig;checkout:CheckoutEditorConfig}
export type SiteEditorVersion={id:string;name:string;savedAt:string;config:SiteEditorConfig}

export const defaultSiteEditorConfig:SiteEditorConfig={
 header:{
  showAnnouncement:true,
  announcementItems:['🚚 15 000 Ft felett ingyenes szállítás','↩ 14 napos elállás','🔒 Biztonságos fizetés'],
  logoLetter:'D',brandName:'DinoToys',brandSuffix:'.hu',tagline:'Játék. Élmény. Ajándék.',
  showSearch:true,searchPlaceholder:'Keress termékre, márkára vagy korosztályra…',
  showGiftFinder:true,giftFinderLabel:'Ajándékkereső',showWishlist:true,wishlistLabel:'Kedvencek',showCart:true,cartLabel:'Kosár',
  navItems:[
   {id:'all',label:'Összes termék',href:'/termekek',enabled:true},
   {id:'plush',label:'Plüss',href:'/termekek?category=Plüss%20%26%20kulcstartó',enabled:true},
   {id:'dino',label:'Dínók',href:'/termekek?category=Dínók%20%26%20figurák',enabled:true},
   {id:'vehicles',label:'Járművek',href:'/termekek?category=Járművek',enabled:true},
   {id:'games',label:'Játékok',href:'/termekek?category=Puzzle%20%26%20játék',enabled:true},
   {id:'school',label:'Iskola',href:'/termekek?category=Back%20to%20School',enabled:true},
  ],
  showBrandMenu:true,brandMenuLabel:'Márkák',
  brandLinks:[
   {id:'starwars',label:'Star Wars',href:'/marka/star-wars',enabled:true},
   {id:'playdoh',label:'Play-Doh',href:'/marka/play-doh',enabled:true},
   {id:'barbie',label:'Barbie',href:'/termekek?q=Barbie',enabled:true},
   {id:'marvel',label:'Marvel',href:'/termekek?q=Marvel',enabled:true},
  ],
  showCompare:true,compareLabel:'Összehasonlítás',sticky:true,compact:false,
  accent:'#ff5f3d',announcementBackground:'#17211b',headerBackground:'#ffffff',
 },
 footer:{
  enabled:true,brandName:'DinoToys',brandSuffix:'.hu',
  intro:'Modern magyar játékwebshop, Dino Toys nagykereskedelmi forrásra tervezve.',
  legalNote:'Az üzemeltető pontos cégadatai az admin jogi profiljából kerülnek a publikus dokumentumokba.',
  background:'#121916',textColor:'#ffffff',
  shoppingTitle:'Vásárlás',
  shoppingLinks:[
   {id:'products',label:'Termékek',href:'/termekek',enabled:true},
   {id:'gift',label:'Ajándékkereső',href:'/ai-ajandekkereso',enabled:true},
   {id:'wishlist',label:'Kedvencek',href:'/kedvencek',enabled:true},
   {id:'withdrawal',label:'Elállás & visszaküldés',href:'/jogi/elallas',enabled:true},
  ],
  supportTitle:'Ügyfélszolgálat',
  supportLinks:[
   {id:'shipping',label:'Szállítás és fizetés',href:'/szallitas',enabled:true},
   {id:'returns',label:'Visszaküldés',href:'/visszakuldes',enabled:true},
   {id:'contact',label:'Kapcsolat',href:'/kapcsolat',enabled:true},
   {id:'complaint',label:'Panaszkezelés',href:'/jogi/panaszkezeles',enabled:true},
   {id:'warranty',label:'Szavatosság / jótállás',href:'/jogi/szavatossag',enabled:true},
  ],
  legalTitle:'Jogi / adatvédelem',
  legalLinks:[
   {id:'imprint',label:'Impresszum',href:'/jogi/impresszum',enabled:true},
   {id:'terms',label:'ÁSZF',href:'/jogi/aszf',enabled:true},
   {id:'privacy',label:'Adatkezelés',href:'/jogi/adatkezeles',enabled:true},
   {id:'cookie',label:'Cookie tájékoztató',href:'/jogi/cookie',enabled:true},
  ],
  showCookieButton:true,cookieLabel:'Cookie beállítások',copyright:'© DinoToys.hu',
 },
 checkout:{
  eyebrow:'Biztonságos demo pénztár',title:'Rendelés véglegesítése',
  description:'Minden lépést kipróbálhatsz. A demó módban nem történik valódi terhelés vagy futármegrendelés.',
  showProgress:true,progressLabels:['Adatok','Szállítás','Fizetés'],
  contactTitle:'Kapcsolattartás',contactDescription:'A neved, e-mail címed és telefonszámod kell a rendeléshez.',
  shippingTitle:'Hogyan kéred a csomagot?',shippingDescription:'Először válassz szállítási módot. FOXPOST esetén utána csak egy átvételi pontot kell kiválasztanod.',
  addressTitle:'Szállítási cím',addressDescription:'Add meg, hová kéred a csomagot.',
  paymentTitle:'Fizetési mód',paymentDescription:'Demóban egyik opció sem indít valódi tranzakciót.',
  companyInvoiceLabel:'Céges számlát kérek',
  consentText:'Elolvastam és elfogadom az ÁSZF-et, valamint megismertem az Adatkezelési tájékoztatót.',
  submitLabel:'Fizetési kötelezettséggel járó megrendelés',
  summaryEyebrow:'Rendelésed',summaryTitle:'{{count}} termék',editCartLabel:'Kosár szerkesztése',
  showTrust:true,trustItems:['🔒 Titkosított kapcsolat','↩ 14 napos elállás','📦 Várható kézbesítés: 1–2 munkanap'],
  successBadge:'DEMO RENDELÉS',successTitle:'Rendelés #{{orderNumber}}',
  successText:'Köszönjük! A demo rendelést helyben elmentettük, a készletet lefoglaltuk, és az admin Rendelések menüjében már kezelhető.',
  successPrimaryLabel:'Főoldal',successAdminLabel:'Rendelés megnyitása az adminban →',successContinueLabel:'Tovább vásárolok',
  accent:'#ff5f3d',panelRadius:18,compact:false,
 },
}

const configKey='dinotoys-demo-site-editor-v1'
const historyKey='dinotoys-demo-site-editor-history-v1'
const eventName='dinotoys:site-editor'

function clone<T>(value:T):T{return JSON.parse(JSON.stringify(value)) as T}
function mergeConfig(raw:Partial<SiteEditorConfig>|null|undefined):SiteEditorConfig{
 const defaults=defaultSiteEditorConfig
 return{
  header:{...defaults.header,...(raw?.header||{}),announcementItems:Array.isArray(raw?.header?.announcementItems)?raw!.header!.announcementItems:defaults.header.announcementItems,navItems:Array.isArray(raw?.header?.navItems)?raw!.header!.navItems:defaults.header.navItems,brandLinks:Array.isArray(raw?.header?.brandLinks)?raw!.header!.brandLinks:defaults.header.brandLinks},
  footer:{...defaults.footer,...(raw?.footer||{}),shoppingLinks:Array.isArray(raw?.footer?.shoppingLinks)?raw!.footer!.shoppingLinks:defaults.footer.shoppingLinks,supportLinks:Array.isArray(raw?.footer?.supportLinks)?raw!.footer!.supportLinks:defaults.footer.supportLinks,legalLinks:Array.isArray(raw?.footer?.legalLinks)?raw!.footer!.legalLinks:defaults.footer.legalLinks},
  checkout:{...defaults.checkout,...(raw?.checkout||{}),progressLabels:Array.isArray(raw?.checkout?.progressLabels)&&raw!.checkout!.progressLabels.length===3?raw!.checkout!.progressLabels as [string,string,string]:defaults.checkout.progressLabels,trustItems:Array.isArray(raw?.checkout?.trustItems)?raw!.checkout!.trustItems:defaults.checkout.trustItems},
 }
}
export function readDemoSiteEditorConfig(){
 if(typeof window==='undefined')return clone(defaultSiteEditorConfig)
 try{const raw=localStorage.getItem(configKey);return mergeConfig(raw?JSON.parse(raw):null)}catch{return clone(defaultSiteEditorConfig)}
}
export function saveDemoSiteEditorConfig(config:SiteEditorConfig,name='Admin mentés'){
 if(typeof window==='undefined')return
 const previous=readDemoSiteEditorConfig()
 const history=readDemoSiteEditorVersions()
 const snapshot:SiteEditorVersion={id:'site-'+Date.now(),name,savedAt:new Date().toISOString(),config:previous}
 try{
  localStorage.setItem(historyKey,JSON.stringify([snapshot,...history].slice(0,30)))
  localStorage.setItem(configKey,JSON.stringify(mergeConfig(config)))
 }catch{}
 window.dispatchEvent(new CustomEvent(eventName))
}
export function resetDemoSiteEditorConfig(){
 if(typeof window==='undefined')return
 const previous=readDemoSiteEditorConfig(),history=readDemoSiteEditorVersions()
 const snapshot:SiteEditorVersion={id:'site-'+Date.now(),name:'Reset előtti állapot',savedAt:new Date().toISOString(),config:previous}
 try{localStorage.setItem(historyKey,JSON.stringify([snapshot,...history].slice(0,30)));localStorage.removeItem(configKey)}catch{}
 window.dispatchEvent(new CustomEvent(eventName))
}
export function readDemoSiteEditorVersions(){
 if(typeof window==='undefined')return[] as SiteEditorVersion[]
 try{const raw=JSON.parse(localStorage.getItem(historyKey)||'[]');return Array.isArray(raw)?raw.map((item:any)=>({...item,config:mergeConfig(item?.config)})):[]}catch{return[]}
}
export function restoreDemoSiteEditorVersion(id:string){
 if(typeof window==='undefined')return false
 const version=readDemoSiteEditorVersions().find(item=>item.id===id);if(!version)return false
 const current=readDemoSiteEditorConfig(),history=readDemoSiteEditorVersions()
 const snapshot:SiteEditorVersion={id:'site-'+Date.now(),name:'Visszaállítás előtti állapot',savedAt:new Date().toISOString(),config:current}
 try{localStorage.setItem(historyKey,JSON.stringify([snapshot,...history].slice(0,30)));localStorage.setItem(configKey,JSON.stringify(version.config))}catch{return false}
 window.dispatchEvent(new CustomEvent(eventName));return true
}
export function useDemoSiteEditorConfig(){
 const [config,setConfig]=useState<SiteEditorConfig>(()=>clone(defaultSiteEditorConfig))
 useEffect(()=>{
  const sync=()=>setConfig(readDemoSiteEditorConfig())
  sync();window.addEventListener(eventName,sync)
  const storage=(event:StorageEvent)=>{if(event.key===configKey)sync()}
  window.addEventListener('storage',storage)
  return()=>{window.removeEventListener(eventName,sync);window.removeEventListener('storage',storage)}
 },[])
 return config
}
