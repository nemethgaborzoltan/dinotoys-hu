export type IntegrationSection='overview'|'shipping'|'billing'|'payment'|'seo'|'email'|'supplier'

export type IntegrationProvider={
 id:string
 section:Exclude<IntegrationSection,'overview'>
 name:string
 shortName:string
 icon:string
 description:string
 capabilities:string[]
 secretNames:string[]
 docsUrl:string
 recommended?:boolean
}

export const integrationProviders:IntegrationProvider[]=[
 {id:'packeta',section:'shipping',name:'Packeta / Z-BOX',shortName:'Packeta',icon:'📦',description:'Átvételi pontok, Z-BOX, csomagfeladás, címke és nyomkövetés.',capabilities:['Átvételi pont választás','Csomag létrehozás','Címkenyomtatás','Nyomkövetés','Visszáru'],secretNames:['PACKETA_API_KEY'],docsUrl:'https://docs.packeta.com/',recommended:true},
 {id:'foxpost',section:'shipping',name:'FOXPOST',shortName:'FOXPOST',icon:'🟠',description:'FOXPOST–Packeta Group átvételi pont választás, csomagfeladás, címke és nyomkövetés.',capabilities:['Hivatalos térképes pontválasztó','Csomag létrehozás','Címke','Tracking','Utánvét'],secretNames:['FOXPOST_API_USERNAME','FOXPOST_API_PASSWORD','FOXPOST_API_KEY'],docsUrl:'https://webapi.foxpost.hu/swagger-ui/index.html',recommended:true},
 {id:'gls',section:'shipping',name:'GLS Hungary',shortName:'GLS',icon:'🚚',description:'Házhozszállítás, csomagfeladás, címke és kézbesítési folyamat.',capabilities:['Házhozszállítás','Csomag létrehozás','Címke','Nyomkövetés'],secretNames:['GLS_API_USERNAME','GLS_API_PASSWORD','GLS_CLIENT_NUMBER'],docsUrl:'https://api.mygls.hu/',recommended:true},
 {id:'szamlazz',section:'billing',name:'Számlázz.hu',shortName:'Számlázz.hu',icon:'🧾',description:'Automatikus magyar számlázás a Számla Agent segítségével.',capabilities:['Számla létrehozás','Sztornó','Befizetés rögzítés','PDF lekérés','Nyugta'],secretNames:['SZAMLAZZ_AGENT_KEY'],docsUrl:'https://docs.szamlazz.hu/hu/agent',recommended:true},
 {id:'billingo',section:'billing',name:'Billingo',shortName:'Billingo',icon:'📄',description:'Automatikus számlázás Billingo API v3 kapcsolattal.',capabilities:['Számla létrehozás','Partner kezelés','Bizonylatok','Automatizálható számlázás'],secretNames:['BILLINGO_API_KEY'],docsUrl:'https://api.billingo.hu/'},
 {id:'barion',section:'payment',name:'Barion Smart Gateway',shortName:'Barion',icon:'💳',description:'Magyar piacon elterjedt online bankkártyás fizetési kapu sandbox lehetőséggel.',capabilities:['Bankkártya','Sandbox','3D Secure','Refund','Callback'],secretNames:['BARION_POS_KEY'],docsUrl:'https://docs.barion.com/Main_Page',recommended:true},
 {id:'stripe',section:'payment',name:'Stripe',shortName:'Stripe',icon:'💠',description:'Nemzetközi online fizetési infrastruktúra webhook alapú visszajelzéssel.',capabilities:['Bankkártya','Wallets','Refund','Webhook'],secretNames:['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET'],docsUrl:'https://docs.stripe.com/payments'},
 {id:'ga4',section:'seo',name:'Google Analytics 4',shortName:'GA4',icon:'📊',description:'Forgalom, termékmegtekintés, kosár, checkout és vásárlás mérése.',capabilities:['E-commerce események','Konverziómérés','DebugView'],secretNames:[],docsUrl:'https://developers.google.com/analytics/devguides/collection/ga4/ecommerce',recommended:true},
 {id:'gtm',section:'seo',name:'Google Tag Manager',shortName:'GTM',icon:'🏷️',description:'Mérőkódok központi kezelése új deploy nélkül.',capabilities:['Tag kezelés','GA4 események','Marketing pixelek','Consent integráció'],secretNames:[],docsUrl:'https://developers.google.com/tag-platform/tag-manager'},
 {id:'search-console',section:'seo',name:'Google Search Console',shortName:'Search Console',icon:'🔎',description:'Google organikus keresési teljesítmény és indexelési adatok.',capabilities:['Tulajdon igazolás','Keresési teljesítmény','Indexelés','Sitemap ellenőrzés'],secretNames:['GOOGLE_SEARCH_CONSOLE_CLIENT_ID','GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET','GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN'],docsUrl:'https://developers.google.com/webmaster-tools/v1/getting-started',recommended:true},
 {id:'resend',section:'email',name:'Resend',shortName:'Resend',icon:'✉️',description:'Rendelés-visszaigazolás, státusz és tranzakciós e-mailek.',capabilities:['Tranzakciós e-mail','Sablonok','Webhook','Domain hitelesítés'],secretNames:['RESEND_API_KEY'],docsUrl:'https://resend.com/docs',recommended:true},
 {id:'dinotoys',section:'supplier',name:'DinoToys beszállító',shortName:'DinoToys',icon:'🦕',description:'Beszállítói termék-, ár- és készletadatok későbbi szinkronizálása.',capabilities:['Termékimport','Árfrissítés','Készletszinkron','Képimport'],secretNames:['DINOTOYS_FEED_URL'],docsUrl:'https://www.dinotoys.nl/'},
]

export type DemoIntegrationConfig={
 shipping:{
  packeta:{enabled:boolean;feeHuf:number;freeAboveHuf:number}
  foxpost:{enabled:boolean;feeHuf:number;freeAboveHuf:number}
  gls:{enabled:boolean;feeHuf:number;freeAboveHuf:number}
  personalPickup:{enabled:boolean;feeHuf:number}
 }
 billing:{provider:'szamlazz'|'billingo'|'none';autoIssue:boolean;issueWhen:'paid'|'processing';sendEmail:boolean;eInvoice:boolean;invoicePrefix:string}
 payment:{barion:{enabled:boolean;sandbox:boolean};stripe:{enabled:boolean}}
 seo:{ga4MeasurementId:string;gtmContainerId:string;searchConsoleVerification:string;metaPixelId:string;ecommerceEvents:boolean}
 email:{resend:{enabled:boolean;fromName:string;fromEmail:string;replyTo:string}}
 supplier:{dinotoys:{enabled:boolean;syncMode:'manual'|'daily'|'hourly'}}
}

export const demoIntegrationDefaults:DemoIntegrationConfig={
 shipping:{
  packeta:{enabled:true,feeHuf:1190,freeAboveHuf:15000},
  foxpost:{enabled:true,feeHuf:1090,freeAboveHuf:15000},
  gls:{enabled:true,feeHuf:1490,freeAboveHuf:15000},
  personalPickup:{enabled:true,feeHuf:0},
 },
 billing:{provider:'szamlazz',autoIssue:true,issueWhen:'paid',sendEmail:true,eInvoice:true,invoicePrefix:'DT'},
 payment:{barion:{enabled:false,sandbox:true},stripe:{enabled:false}},
 seo:{ga4MeasurementId:'',gtmContainerId:'',searchConsoleVerification:'',metaPixelId:'',ecommerceEvents:true},
 email:{resend:{enabled:false,fromName:'DinoToys.hu',fromEmail:'',replyTo:''}},
 supplier:{dinotoys:{enabled:true,syncMode:'manual'}},
}

const storageKey='dinotoys-demo-integrations-v1'

function mergeConfig(raw:Partial<DemoIntegrationConfig>):DemoIntegrationConfig{
 return{
  shipping:{
   packeta:{...demoIntegrationDefaults.shipping.packeta,...raw.shipping?.packeta},
   foxpost:{...demoIntegrationDefaults.shipping.foxpost,...raw.shipping?.foxpost},
   gls:{...demoIntegrationDefaults.shipping.gls,...raw.shipping?.gls},
   personalPickup:{...demoIntegrationDefaults.shipping.personalPickup,...raw.shipping?.personalPickup},
  },
  billing:{...demoIntegrationDefaults.billing,...raw.billing},
  payment:{barion:{...demoIntegrationDefaults.payment.barion,...raw.payment?.barion},stripe:{...demoIntegrationDefaults.payment.stripe,...raw.payment?.stripe}},
  seo:{...demoIntegrationDefaults.seo,...raw.seo},
  email:{resend:{...demoIntegrationDefaults.email.resend,...raw.email?.resend}},
  supplier:{dinotoys:{...demoIntegrationDefaults.supplier.dinotoys,...raw.supplier?.dinotoys}},
 }
}

export function readDemoIntegrationConfig():DemoIntegrationConfig{
 if(typeof window==='undefined')return demoIntegrationDefaults
 try{const raw=localStorage.getItem(storageKey);return raw?mergeConfig(JSON.parse(raw)):demoIntegrationDefaults}catch{return demoIntegrationDefaults}
}

export function writeDemoIntegrationConfig(value:DemoIntegrationConfig){
 if(typeof window==='undefined')return
 try{localStorage.setItem(storageKey,JSON.stringify(value));window.dispatchEvent(new CustomEvent('dinotoys:integrations',{detail:value}))}catch{}
}

export function resetDemoIntegrationConfig(){
 if(typeof window==='undefined')return
 try{localStorage.removeItem(storageKey);window.dispatchEvent(new CustomEvent('dinotoys:integrations',{detail:demoIntegrationDefaults}))}catch{}
}

export type DemoShippingMethod={id:string;provider:string;name:string;description:string;icon:string;fee:number;freeAboveHuf:number|null}
export function getDemoShippingMethods(config=readDemoIntegrationConfig()):DemoShippingMethod[]{
 const methods:DemoShippingMethod[]=[]
 if(config.shipping.gls.enabled)methods.push({id:'gls-home',provider:'gls',name:'GLS házhozszállítás',description:'Futár kézbesíti a megadott címre · demó',icon:'🚚',fee:config.shipping.gls.feeHuf,freeAboveHuf:config.shipping.gls.freeAboveHuf})
 if(config.shipping.foxpost.enabled)methods.push({id:'foxpost-locker',provider:'foxpost',name:'FOXPOST / Packeta átvételi pont',description:'Hivatalos FOXPOST térképes pontválasztó',icon:'🟠',fee:config.shipping.foxpost.feeHuf,freeAboveHuf:config.shipping.foxpost.freeAboveHuf})
 if(config.shipping.packeta.enabled)methods.push({id:'packeta-point',provider:'packeta',name:'Packeta / Z-BOX',description:'Átvételi pont vagy Z-BOX · demó pontválasztó',icon:'📦',fee:config.shipping.packeta.feeHuf,freeAboveHuf:config.shipping.packeta.freeAboveHuf})
 if(config.shipping.personalPickup.enabled)methods.push({id:'personal-pickup',provider:'local',name:'Személyes átvétel',description:'Egyeztetett átvétel · demó',icon:'🏠',fee:config.shipping.personalPickup.feeHuf,freeAboveHuf:null})
 return methods
}

export function billingProviderLabel(config=readDemoIntegrationConfig()){
 return config.billing.provider==='szamlazz'?'Számlázz.hu':config.billing.provider==='billingo'?'Billingo':'Nincs automatikus számlázó'
}
