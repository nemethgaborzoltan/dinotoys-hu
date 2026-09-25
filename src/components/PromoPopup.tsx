import { useRouterState } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import type { StorefrontPopup } from '../server/storefront'
import { demoPopup } from '../data/offers'
import { useShop } from '../lib/shop'

function scopeMatches(scope:StorefrontPopup['pageScope'],path:string){
  if(scope==='all')return true
  if(scope==='home')return path==='/'
  if(scope==='catalog')return path.startsWith('/termekek')
  if(scope==='product')return path.startsWith('/termek/')
  if(scope==='cart')return path.startsWith('/kosar')
  return false
}
export function PromoPopup({popup}:{popup?:StorefrontPopup|null}){
  const config=popup===undefined?demoPopup:popup
  const path=useRouterState({select:s=>s.location.pathname})
  const shop=useShop()
  const [open,setOpen]=useState(false)
  const [message,setMessage]=useState<string|null>(null)
  const storageKey=useMemo(()=>config?'dinotoys-popup-'+config.id:null,[config?.id])

  useEffect(()=>{
    if(!config||!scopeMatches(config.pageScope,path)||(config.minCartHuf!=null&&shop.subtotal<config.minCartHuf))return
    try{if(config.frequency!=='always'&&storageKey&&sessionStorage.getItem(storageKey)==='1')return}catch{}
    const show=()=>setOpen(true)
    let timer:number|undefined
    if(config.triggerType==='delay')timer=window.setTimeout(show,config.delaySeconds*1000)
    const exit=(event:MouseEvent)=>{if(config.triggerType==='exit_intent'&&event.clientY<=8)show()}
    document.addEventListener('mouseleave',exit)
    if(config.triggerType==='cart_value')show()
    return()=>{if(timer)window.clearTimeout(timer);document.removeEventListener('mouseleave',exit)}
  },[config?.id,path,shop.subtotal,storageKey])

  if(!config||!open)return null
  const close=()=>{setOpen(false);try{if(config.frequency!=='always'&&storageKey)sessionStorage.setItem(storageKey,'1')}catch{}}
  const activate=()=>{if(!config.couponCode){close();return}const result=shop.applyCoupon(config.couponCode);setMessage(result.message);if(result.ok)window.setTimeout(close,900)}

  return <div className="modal-backdrop promo-backdrop" onMouseDown={close}>
    <div className="promo-popup" onMouseDown={(e)=>e.stopPropagation()}>
      <button className="popup-close" onClick={close} aria-label="Bezárás">×</button>
      {config.eyebrow&&<span className="pill">{config.eyebrow}</span>}
      <h3>{config.title}</h3>
      {config.body&&<p>{config.body}</p>}
      {config.couponCode&&<div className="promo-code"><span>Kupon</span><strong>{config.couponCode}</strong></div>}
      {message&&<div className="popup-message">{message}</div>}
      <div className="promo-actions">
        {config.couponCode&&<button className="btn btn-primary" onClick={activate}>{config.ctaLabel}</button>}
        <a href={config.ctaHref} className="btn btn-ghost" onClick={close}>Megnézem az ajánlatot</a>
      </div>
      <small>Bezárható és gyakoriság-szabályozott ajánlat.</small>
    </div>
  </div>
}
