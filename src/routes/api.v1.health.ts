import { createFileRoute } from '@tanstack/react-router'
import { getOptionalServerEnv } from '../server/env'
import { json } from '../server/http'
export const Route=createFileRoute('/api/v1/health')({server:{handlers:{GET:async()=>{const e=getOptionalServerEnv();return json({ok:true,service:'dinotoys-hu',time:new Date().toISOString(),dependencies:{supabase:Boolean(e.supabaseUrl&&e.serviceRoleKey)}})}}}})
