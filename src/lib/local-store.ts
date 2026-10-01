export type LocalStoreEnvelope<T>={version:number;updatedAt:string;data:T}
export type LocalStoreWriteResult={ok:boolean;bytes:number;error?:string}

const channelName='dinotoys-local-store-v1'
const eventName='dinotoys:local-store'
let channel:BroadcastChannel|null=null

function getChannel(){
 if(typeof window==='undefined'||typeof BroadcastChannel==='undefined')return null
 if(!channel)channel=new BroadcastChannel(channelName)
 return channel
}
function emit(key:string){
 if(typeof window==='undefined')return
 window.dispatchEvent(new CustomEvent(eventName,{detail:{key}}))
 try{getChannel()?.postMessage({key,at:Date.now()})}catch{}
}
export function readLocalVersioned<T>(key:string,version:number,fallback:T,migrate?:(legacy:unknown,fromVersion:number)=>T):T{
 if(typeof window==='undefined')return fallback
 try{
  const raw=localStorage.getItem(key)
  if(!raw)return fallback
  const parsed=JSON.parse(raw)
  if(parsed&&typeof parsed==='object'&&'version'in parsed&&'data'in parsed){
   const envelope=parsed as LocalStoreEnvelope<unknown>
   if(envelope.version===version)return envelope.data as T
   return migrate?migrate(envelope.data,envelope.version):fallback
  }
  return migrate?migrate(parsed,0):parsed as T
 }catch{return fallback}
}
export function writeLocalVersioned<T>(key:string,version:number,data:T):LocalStoreWriteResult{
 if(typeof window==='undefined')return{ok:false,bytes:0,error:'browser-only'}
 const payload=JSON.stringify({version,updatedAt:new Date().toISOString(),data} satisfies LocalStoreEnvelope<T>)
 try{
  localStorage.setItem(key,payload);emit(key)
  return{ok:true,bytes:new Blob([payload]).size}
 }catch(error){
  return{ok:false,bytes:new Blob([payload]).size,error:error instanceof Error?error.message:'localStorage write failed'}
 }
}
export function removeLocal(key:string){
 if(typeof window==='undefined')return
 try{localStorage.removeItem(key)}catch{}
 emit(key)
}
export function subscribeLocal(key:string,callback:()=>void){
 if(typeof window==='undefined')return()=>{}
 const onCustom=(event:Event)=>{const detail=(event as CustomEvent<{key?:string}>).detail;if(!detail?.key||detail.key===key)callback()}
 const onStorage=(event:StorageEvent)=>{if(event.key===key)callback()}
 const bc=getChannel()
 const onBroadcast=(event:MessageEvent<{key?:string}>)=>{if(event.data?.key===key)callback()}
 window.addEventListener(eventName,onCustom)
 window.addEventListener('storage',onStorage)
 bc?.addEventListener('message',onBroadcast)
 return()=>{window.removeEventListener(eventName,onCustom);window.removeEventListener('storage',onStorage);bc?.removeEventListener('message',onBroadcast)}
}
export function localStorageUsage(){
 if(typeof window==='undefined')return{bytes:0,items:0,keys:[] as Array<{key:string;bytes:number}>}
 const keys:Array<{key:string;bytes:number}>=[]
 let bytes=0
 for(let index=0;index<localStorage.length;index++){
  const key=localStorage.key(index);if(!key||!key.startsWith('dinotoys-'))continue
  const value=localStorage.getItem(key)||''
  const size=new Blob([key,value]).size
  bytes+=size;keys.push({key,bytes:size})
 }
 keys.sort((a,b)=>b.bytes-a.bytes)
 return{bytes,items:keys.length,keys}
}
export function exportDinoLocalStorage(){
 if(typeof window==='undefined')return{}
 const out:Record<string,string>={}
 for(let index=0;index<localStorage.length;index++){const key=localStorage.key(index);if(key?.startsWith('dinotoys-'))out[key]=localStorage.getItem(key)||''}
 return out
}
export function importDinoLocalStorage(data:Record<string,string>){
 if(typeof window==='undefined')return 0
 let count=0
 for(const [key,value] of Object.entries(data)){if(!key.startsWith('dinotoys-')||typeof value!=='string')continue;localStorage.setItem(key,value);count++}
 window.dispatchEvent(new CustomEvent(eventName,{detail:{}}))
 return count
}
export function clearDinoLocalStorage(except:string[]=[]){
 if(typeof window==='undefined')return 0
 const keep=new Set(except),keys:string[]=[]
 for(let index=0;index<localStorage.length;index++){const key=localStorage.key(index);if(key?.startsWith('dinotoys-')&&!keep.has(key))keys.push(key)}
 keys.forEach(key=>localStorage.removeItem(key))
 window.dispatchEvent(new CustomEvent(eventName,{detail:{}}))
 return keys.length
}
