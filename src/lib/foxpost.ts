export type FoxpostPickupPoint={
 place_id:number|string
 operator_id?:string
 name:string
 address:string
 zip:string
 city:string
 street?:string
 findme?:string
 geolat?:number
 geolng?:number
 variant?:string
 service?:string
 serviceString?:string
 paymentOptionsString?:string
 isOutdoor?:boolean
}

export function foxpostDestination(point:FoxpostPickupPoint){
 return String(point.operator_id||point.place_id||'')
}

export function normalizeFoxpostPhone(input:string){
 const digits=input.replace(/[^0-9+]/g,'')
 let normalized=digits
 if(normalized.startsWith('06'))normalized='+36'+normalized.slice(2)
 else if(normalized.startsWith('36'))normalized='+'+normalized
 else if(!normalized.startsWith('+36')&&/^\d{9}$/.test(normalized))normalized='+36'+normalized
 return normalized
}

export function isValidFoxpostPhone(input:string){
 return /^(\+36|36)(20|30|31|50|51|70)\d{7}$/.test(normalizeFoxpostPhone(input))
}

export function parseFoxpostMessage(data:unknown):FoxpostPickupPoint|null{
 try{
  const raw=typeof data==='string'?JSON.parse(data):data
  if(!raw||typeof raw!=='object')return null
  const point=raw as Record<string,unknown>
  if(!point.place_id||!point.name||!point.address)return null
  return{
   place_id:String(point.place_id),
   operator_id:point.operator_id?String(point.operator_id):undefined,
   name:String(point.name),address:String(point.address),zip:String(point.zip||''),city:String(point.city||''),
   street:point.street?String(point.street):undefined,findme:point.findme?String(point.findme):undefined,
   geolat:typeof point.geolat==='number'?point.geolat:undefined,geolng:typeof point.geolng==='number'?point.geolng:undefined,
   variant:point.variant?String(point.variant):undefined,service:point.service?String(point.service):undefined,
   serviceString:point.serviceString?String(point.serviceString):undefined,paymentOptionsString:point.paymentOptionsString?String(point.paymentOptionsString):undefined,
   isOutdoor:typeof point.isOutdoor==='boolean'?point.isOutdoor:undefined,
  }
 }catch{return null}
}
