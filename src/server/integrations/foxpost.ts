import {ApiError} from '../http'
import {foxpostDestination,normalizeFoxpostPhone,type FoxpostPickupPoint} from '../../lib/foxpost'

type FoxpostEnv={username:string;password:string;apiKey:string;sandbox:boolean}

function readFoxpostEnv():FoxpostEnv{
 const env=process.env as Record<string,string|undefined>
 const username=env.FOXPOST_API_USERNAME||'',password=env.FOXPOST_API_PASSWORD||'',apiKey=env.FOXPOST_API_KEY||''
 if(!username||!password||!apiKey)throw new ApiError(503,'A FOXPOST API hozzáférés még nincs teljesen beállítva.','FOXPOST_NOT_CONFIGURED',{missing:['FOXPOST_API_USERNAME','FOXPOST_API_PASSWORD','FOXPOST_API_KEY'].filter(key=>!env[key])})
 return{username,password,apiKey,sandbox:(env.FOXPOST_ENV||'sandbox').toLowerCase()!=='production'}
}

function baseUrl(config:FoxpostEnv){return config.sandbox?'https://webapi-test.foxpost.hu/api':'https://webapi.foxpost.hu/api'}

async function foxpostRequest<T>(path:string,init:RequestInit={}){
 const config=readFoxpostEnv()
 const auth=Buffer.from(`${config.username}:${config.password}`).toString('base64')
 const headers=new Headers(init.headers);headers.set('Authorization',`Basic ${auth}`);headers.set('Api-key',config.apiKey);headers.set('Accept','application/json');if(init.body)headers.set('Content-Type','application/json')
 const response=await fetch(baseUrl(config)+path,{...init,headers})
 if(!response.ok){const body=await response.text().catch(()=>'');throw new ApiError(response.status,`FOXPOST API hiba (${response.status}).`,'FOXPOST_API_ERROR',body.slice(0,3000))}
 const type=response.headers.get('content-type')||''
 if(type.includes('application/pdf'))return await response.arrayBuffer() as T
 if(response.status===204)return undefined as T
 return await response.json() as T
}

export type FoxpostParcelInput={
 orderNumber:string
 recipientName:string
 recipientEmail:string
 recipientPhone:string
 pickupPoint:FoxpostPickupPoint
 codHuf?:number
 size?:'XS'|'S'|'M'|'L'|'XL'
 comment?:string
}

export function buildFoxpostParcel(input:FoxpostParcelInput){
 return{
  destination:foxpostDestination(input.pickupPoint),
  recipientName:input.recipientName,recipientEmail:input.recipientEmail,recipientPhone:normalizeFoxpostPhone(input.recipientPhone),
  refCode:input.orderNumber.slice(0,30),size:input.size||'M',cod:Math.max(0,Math.round(input.codHuf||0)),
  ...(input.comment?{comment:input.comment.slice(0,200)}:{}),
 }
}

export async function testFoxpostConnection(){
 const config=readFoxpostEnv()
 await foxpostRequest<unknown>('/address',{method:'GET'})
 return{ok:true,environment:config.sandbox?'sandbox':'production',baseUrl:baseUrl(config)}
}

export async function createFoxpostParcel(input:FoxpostParcelInput){
 return foxpostRequest<unknown>('/parcel',{method:'POST',body:JSON.stringify(buildFoxpostParcel(input))})
}

export async function updateFoxpostParcel(payload:unknown){
 return foxpostRequest<unknown>('/parcel',{method:'PUT',body:JSON.stringify(payload)})
}

export async function deleteFoxpostParcel(barcode:string){
 return foxpostRequest<unknown>('/parcel/'+encodeURIComponent(barcode),{method:'DELETE'})
}

export async function getFoxpostTracking(barcode:string){
 return foxpostRequest<unknown>('/tracking/'+encodeURIComponent(barcode),{method:'GET'})
}

export async function getFoxpostTrackingHistory(barcode:string){
 return foxpostRequest<unknown>('/tracking/tracks/'+encodeURIComponent(barcode),{method:'GET'})
}

export async function getFoxpostLabel(barcodes:string[],pageSize:'A6'|'A7'|'85X85'='A6'){
 return foxpostRequest<ArrayBuffer>('/label/'+pageSize,{method:'POST',body:JSON.stringify(barcodes)})
}
