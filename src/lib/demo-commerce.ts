export type DemoCommercePreferences={
 guestCheckout:boolean
 deliveryEstimate:boolean
 trustBadges:boolean
 bundles:boolean
 crossSell:boolean
}

export const demoCommerceDefaults:DemoCommercePreferences={guestCheckout:true,deliveryEstimate:true,trustBadges:true,bundles:true,crossSell:true}
export const demoCommerceStorageKey='dinotoys-admin-demo-commerce-tools'

export function readDemoCommercePreferences():DemoCommercePreferences{
 if(typeof window==='undefined')return demoCommerceDefaults
 try{const raw=localStorage.getItem(demoCommerceStorageKey);return raw?{...demoCommerceDefaults,...JSON.parse(raw)}:demoCommerceDefaults}catch{return demoCommerceDefaults}
}

export function writeDemoCommercePreferences(value:DemoCommercePreferences){
 if(typeof window==='undefined')return
 try{localStorage.setItem(demoCommerceStorageKey,JSON.stringify(value))}catch{}
}
