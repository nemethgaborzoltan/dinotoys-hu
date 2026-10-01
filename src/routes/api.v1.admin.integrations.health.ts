import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { fail,ok } from '../server/http'

const checks=[
 {provider:'supabase',kind:'platform',vars:['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']},
 {provider:'barion',kind:'payment',vars:['BARION_POS_KEY']},
 {provider:'stripe',kind:'payment',vars:['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET']},
 {provider:'resend',kind:'email',vars:['RESEND_API_KEY']},
 {provider:'billingo',kind:'billing',vars:['BILLINGO_API_KEY']},
 {provider:'szamlazz',kind:'billing',vars:['SZAMLAZZ_AGENT_KEY']},
 {provider:'foxpost',kind:'shipping',vars:['FOXPOST_API_USERNAME','FOXPOST_API_PASSWORD','FOXPOST_API_KEY']},
 {provider:'packeta',kind:'shipping',vars:['PACKETA_API_KEY']},
 {provider:'gls',kind:'shipping',vars:['GLS_API_USERNAME','GLS_API_PASSWORD','GLS_CLIENT_NUMBER']},
 {provider:'ga4',kind:'seo',vars:['VITE_GA4_MEASUREMENT_ID']},
 {provider:'gtm',kind:'seo',vars:['VITE_GTM_CONTAINER_ID']},
 {provider:'search-console',kind:'seo',vars:['GOOGLE_SEARCH_CONSOLE_CLIENT_ID','GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET','GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN']},
 {provider:'dinotoys',kind:'supplier',vars:['DINOTOYS_FEED_URL']},
]

export const Route=createFileRoute('/api/v1/admin/integrations/health')({server:{handlers:{GET:async({request})=>{try{
 await requireAdmin(request,'integrations.write')
 const env=process.env as Record<string,string|undefined>
 return ok(checks.map(check=>({provider:check.provider,kind:check.kind,ready:check.vars.every(key=>Boolean(env[key])),requiredSecrets:check.vars,configuredSecrets:check.vars.filter(key=>Boolean(env[key]))})))
}catch(e){return fail(e)}}}}})
