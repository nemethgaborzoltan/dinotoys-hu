import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

export function hasSupabaseBrowserConfig() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
}

export function getSupabaseBrowser(): SupabaseClient | null {
  if (client !== undefined) return client
  const url=import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  if(!url||!key){client=null;return null}
  client=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
  return client
}
