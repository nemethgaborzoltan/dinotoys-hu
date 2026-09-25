import { getSupabaseBrowser } from './supabase.browser'

export class AdminApiError extends Error {
  constructor(public status:number,message:string,public code?:string,public details?:unknown){super(message)}
}

export async function adminApi<T>(path:string,init:RequestInit={}):Promise<T>{
  const client=getSupabaseBrowser()
  if(!client)throw new AdminApiError(503,'A Supabase kliens nincs konfigurálva.','BACKEND_NOT_CONFIGURED')
  const {data:{session}}=await client.auth.getSession()
  if(!session?.access_token)throw new AdminApiError(401,'Bejelentkezés szükséges.','UNAUTHENTICATED')
  const headers=new Headers(init.headers)
  headers.set('authorization',`Bearer ${session.access_token}`)
  if(init.body && !(init.body instanceof FormData))headers.set('content-type','application/json')
  const response=await fetch(path,{...init,headers})
  const payload=await response.json().catch(()=>null) as any
  if(!response.ok||payload?.ok===false)throw new AdminApiError(response.status,payload?.error?.message||'API hiba',payload?.error?.code,payload?.error?.details)
  return payload.data as T
}

export const jsonBody=(value:unknown)=>JSON.stringify(value)
