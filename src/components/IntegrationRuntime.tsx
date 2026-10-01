import {useEffect} from 'react'
import {getConsent} from '../lib/analytics'
import {readDemoIntegrationConfig,type DemoIntegrationConfig} from '../lib/integration-config'

declare global {
 interface Window {
  dataLayer?: unknown[]
  gtag?: (...args:unknown[])=>void
  fbq?: ((...args:unknown[])=>void)&{queue?:unknown[];loaded?:boolean;version?:string}
  _fbq?: any
  __dinotoysDirectGa4?: boolean
 }
}

const envGa4=String(import.meta.env.VITE_GA4_MEASUREMENT_ID||'')
const envGtm=String(import.meta.env.VITE_GTM_CONTAINER_ID||'')
const envVerification=String(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION||'')

function addScript(id:string,src:string){
 if(document.getElementById(id))return
 const script=document.createElement('script');script.id=id;script.async=true;script.src=src;document.head.appendChild(script)
}

function ensureGtag(){
 window.dataLayer ||= []
 window.gtag ||= (...args:unknown[])=>{window.dataLayer!.push(args)}
}

function applyVerification(token:string){
 const value=token.trim()
 let meta=document.querySelector('meta[name="google-site-verification"]') as HTMLMetaElement|null
 if(!value){meta?.remove();return}
 if(!meta){meta=document.createElement('meta');meta.name='google-site-verification';document.head.appendChild(meta)}
 meta.content=value
}

function applyGoogle(config:DemoIntegrationConfig){
 const consent=getConsent()
 const ga4=(envGa4||config.seo.ga4MeasurementId).trim()
 const gtm=(envGtm||config.seo.gtmContainerId).trim()
 ensureGtag()
 window.gtag!('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})
 window.gtag!('consent','update',{analytics_storage:consent?.analytics?'granted':'denied',ad_storage:consent?.marketing?'granted':'denied',ad_user_data:consent?.marketing?'granted':'denied',ad_personalization:consent?.marketing?'granted':'denied'})
 window.__dinotoysDirectGa4=false
 if(!consent?.analytics)return
 if(/^GTM-[A-Z0-9]+$/i.test(gtm)){
  window.dataLayer!.push({'gtm.start':Date.now(),event:'gtm.js'})
  addScript('dinotoys-gtm','https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(gtm))
  return
 }
 if(/^G-[A-Z0-9]+$/i.test(ga4)){
  window.__dinotoysDirectGa4=true
  addScript('dinotoys-ga4','https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ga4))
  window.gtag!('js',new Date())
  window.gtag!('config',ga4,{send_page_view:true})
 }
}

function applyMeta(config:DemoIntegrationConfig){
 const consent=getConsent()
 const pixel=config.seo.metaPixelId.trim()
 if(!consent?.marketing||!/^\d{5,30}$/.test(pixel)||window.fbq)return
 const fbq:any=function(...args:unknown[]){fbq.callMethod?fbq.callMethod(...args):fbq.queue.push(args)}
 fbq.queue=[];fbq.loaded=true;fbq.version='2.0';window.fbq=fbq;window._fbq=fbq
 addScript('dinotoys-meta-pixel','https://connect.facebook.net/en_US/fbevents.js')
 fbq('init',pixel);fbq('track','PageView')
}

function applyAll(){
 const config=readDemoIntegrationConfig()
 applyVerification(envVerification||config.seo.searchConsoleVerification)
 applyGoogle(config)
 applyMeta(config)
}

export function IntegrationRuntime(){
 useEffect(()=>{
  applyAll()
  const rerun=()=>applyAll()
  window.addEventListener('dinotoys:consent',rerun as EventListener)
  window.addEventListener('dinotoys:integrations',rerun as EventListener)
  return()=>{window.removeEventListener('dinotoys:consent',rerun as EventListener);window.removeEventListener('dinotoys:integrations',rerun as EventListener)}
 },[])
 return null
}
