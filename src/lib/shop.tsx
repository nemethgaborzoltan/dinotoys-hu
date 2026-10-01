import React,{createContext,useContext,useEffect,useMemo,useState} from 'react'
import {products} from '../data/products'
import type{Product} from '../data/products'
import type{StorefrontPromotion} from '../server/storefront'
import {demoPromotions} from '../data/offers'
import {getProductPrice} from './catalog'
import {readLocalVersioned,writeLocalVersioned} from './local-store'

export type ProductSnapshot=Product
export type CartLine={productId:string;variantId?:string;quantity:number;snapshot?:ProductSnapshot}
type PersistedState={cart:CartLine[];wishlist:string[];compare:string[];recentlyViewed:string[];snapshots:Record<string,ProductSnapshot>;appliedCouponCode:string|null}
type ShopState=PersistedState&{
 appliedCoupon:StorefrontPromotion|null;addToCart:(productId:string,quantity?:number,product?:ProductSnapshot,variantId?:string)=>void;updateQuantity:(productId:string,quantity:number,variantId?:string)=>void;
 removeFromCart:(productId:string,variantId?:string)=>void;clearCart:()=>void;toggleWishlist:(productId:string,product?:ProductSnapshot)=>void;toggleCompare:(productId:string,product?:ProductSnapshot)=>void;
 markViewed:(productId:string,product?:ProductSnapshot)=>void;rememberProduct:(product:ProductSnapshot)=>void;getProduct:(productId:string)=>ProductSnapshot|undefined;
 applyCoupon:(code:string)=>{ok:boolean;message:string};removeCoupon:()=>void;cartCount:number;itemsSubtotal:number;discount:number;subtotal:number;freeShippingThreshold:number;shippingFee:number;freeShippingLeft:number;total:number
}
const ShopContext=createContext<ShopState|null>(null),storageKey='dinotoys-hu-store-v4',legacyStorageKey='dinotoys-hu-store-v3',storageVersion=4
const initial:PersistedState={cart:[],wishlist:[],compare:[],recentlyViewed:[],snapshots:{},appliedCouponCode:null}
const lineKey=(productId:string,variantId?:string)=>`${productId}:${variantId??'base'}`
function normalizePersisted(raw:any):PersistedState{
 const value=raw&&typeof raw==='object'?raw:{}
 return{
  cart:Array.isArray(value.cart)?value.cart.filter((line:any)=>line&&typeof line.productId==='string'&&Number(line.quantity)>0).map((line:any)=>({productId:line.productId,variantId:line.variantId||undefined,quantity:Math.max(1,Math.round(Number(line.quantity)||1)),snapshot:line.snapshot})):[],
  wishlist:Array.isArray(value.wishlist)?value.wishlist.filter((id:any)=>typeof id==='string').slice(0,100):[],
  compare:Array.isArray(value.compare)?value.compare.filter((id:any)=>typeof id==='string').slice(-4):[],
  recentlyViewed:Array.isArray(value.recentlyViewed)?value.recentlyViewed.filter((id:any)=>typeof id==='string').slice(0,8):[],
  snapshots:value.snapshots&&typeof value.snapshots==='object'?value.snapshots:{},
  appliedCouponCode:typeof value.appliedCouponCode==='string'?value.appliedCouponCode:null,
 }
}
function readPersistedState(){
 if(typeof window==='undefined')return initial
 const current=readLocalVersioned<PersistedState>(storageKey,storageVersion,initial,(legacy)=>normalizePersisted(legacy))
 if(localStorage.getItem(storageKey))return normalizePersisted(current)
 try{
  const raw=localStorage.getItem(legacyStorageKey)
  if(raw){const migrated=normalizePersisted(JSON.parse(raw));writeLocalVersioned(storageKey,storageVersion,compactPersistedState(migrated));localStorage.removeItem(legacyStorageKey);return migrated}
 }catch{}
 return normalizePersisted(current)
}
function compactPersistedState(state:PersistedState):PersistedState{
 const referenced=new Set([...state.cart.map(line=>line.productId),...state.wishlist,...state.compare,...state.recentlyViewed])
 const demoIds=new Set(products.map(product=>product.id))
 const snapshots=Object.fromEntries(Object.entries(state.snapshots).filter(([id])=>referenced.has(id)&&!demoIds.has(id)))
 const cart=state.cart.map(line=>({...line,snapshot:undefined}))
 return{...state,cart,snapshots,recentlyViewed:state.recentlyViewed.slice(0,8),compare:state.compare.slice(-4)}
}


export function ShopProvider({children,freeShippingThreshold=15000,promotions}:{children:React.ReactNode;freeShippingThreshold?:number;promotions?:StorefrontPromotion[]}){
 const availablePromotions=promotions===undefined?demoPromotions:promotions
 const [state,setState]=useState<PersistedState>(initial)
 useEffect(()=>{setState(readPersistedState());const sync=(event:StorageEvent)=>{if(event.key===storageKey)setState(readPersistedState())};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[])
 useEffect(()=>{if(typeof window==='undefined')return;const compact=compactPersistedState(state),result=writeLocalVersioned(storageKey,storageVersion,compact);if(!result.ok){const emergency={...compact,snapshots:{},recentlyViewed:[]};writeLocalVersioned(storageKey,storageVersion,emergency)}},[state])
 const value=useMemo<ShopState>(()=>{
  const remember=(current:PersistedState,product?:ProductSnapshot)=>product?{...current.snapshots,[product.id]:product}:current.snapshots
  const rememberProduct=(product:ProductSnapshot)=>setState(c=>({...c,snapshots:remember(c,product)}))
  const getProduct=(productId:string)=>state.snapshots[productId]??products.find(p=>p.id===productId)
  const addToCart=(productId:string,quantity=1,product?:ProductSnapshot,variantId?:string)=>setState(current=>{const key=lineKey(productId,variantId),line=current.cart.find(x=>lineKey(x.productId,x.variantId)===key),snapshot=product??current.snapshots[productId];const cart=line?current.cart.map(x=>lineKey(x.productId,x.variantId)===key?{...x,quantity:x.quantity+quantity,snapshot:snapshot??x.snapshot}:x):[...current.cart,{productId,variantId,quantity,snapshot}];return{...current,cart,snapshots:remember(current,product)}})
  const updateQuantity=(productId:string,quantity:number,variantId?:string)=>setState(c=>({...c,cart:quantity<=0?c.cart.filter(x=>lineKey(x.productId,x.variantId)!==lineKey(productId,variantId)):c.cart.map(x=>lineKey(x.productId,x.variantId)===lineKey(productId,variantId)?{...x,quantity}:x)}))
  const removeFromCart=(productId:string,variantId?:string)=>setState(c=>({...c,cart:c.cart.filter(x=>lineKey(x.productId,x.variantId)!==lineKey(productId,variantId))}))
  const clearCart=()=>setState(c=>({...c,cart:[],appliedCouponCode:null}))
  const toggleWishlist=(productId:string,product?:ProductSnapshot)=>setState(c=>({...c,wishlist:c.wishlist.includes(productId)?c.wishlist.filter(x=>x!==productId):[...c.wishlist,productId],snapshots:remember(c,product)}))
  const toggleCompare=(productId:string,product?:ProductSnapshot)=>setState(c=>({...c,compare:c.compare.includes(productId)?c.compare.filter(x=>x!==productId):[...c.compare.slice(-3),productId],snapshots:remember(c,product)}))
  const markViewed=(productId:string,product?:ProductSnapshot)=>setState(c=>({...c,recentlyViewed:[productId,...c.recentlyViewed.filter(x=>x!==productId)].slice(0,8),snapshots:remember(c,product)}))
  const itemsSubtotal=state.cart.reduce((s,l)=>{const p=l.snapshot??state.snapshots[l.productId]??products.find(x=>x.id===l.productId);return p?s+getProductPrice(p,l.variantId)*l.quantity:s},0)
  const appliedCoupon=availablePromotions.find(p=>p.code.toUpperCase()===state.appliedCouponCode?.toUpperCase())??null
  const minSubtotal=Number(appliedCoupon?.conditions?.minSubtotal??0)
  let discount=0
  if(appliedCoupon&&itemsSubtotal>=minSubtotal){if(appliedCoupon.kind==='percentage')discount=Math.round(itemsSubtotal*(appliedCoupon.value/100));if(appliedCoupon.kind==='fixed')discount=Math.min(itemsSubtotal,Math.round(appliedCoupon.value));if(appliedCoupon.maxDiscountHuf!=null)discount=Math.min(discount,appliedCoupon.maxDiscountHuf)}
  const subtotal=Math.max(0,itemsSubtotal-discount),shippingFee=appliedCoupon?.kind==='free_shipping'&&itemsSubtotal>=minSubtotal?0:subtotal>=freeShippingThreshold||subtotal===0?0:1490
  const applyCoupon=(code:string)=>{const coupon=availablePromotions.find(p=>p.code.toUpperCase()===code.trim().toUpperCase());if(!coupon)return{ok:false,message:'Ismeretlen vagy lejárt kuponkód.'};const min=Number(coupon.conditions?.minSubtotal??0);if(itemsSubtotal<min)return{ok:false,message:`A kupon minimum ${min.toLocaleString('hu-HU')} Ft kosárértéktől használható.`};setState(c=>({...c,appliedCouponCode:coupon.code}));return{ok:true,message:`Kupon aktiválva: ${coupon.name}`}}
  const removeCoupon=()=>setState(c=>({...c,appliedCouponCode:null}))
  const cartCount=state.cart.reduce((s,l)=>s+l.quantity,0),freeShippingLeft=Math.max(0,freeShippingThreshold-subtotal)
  return{...state,appliedCoupon,addToCart,updateQuantity,removeFromCart,clearCart,toggleWishlist,toggleCompare,markViewed,rememberProduct,getProduct,applyCoupon,removeCoupon,cartCount,itemsSubtotal,discount,subtotal,freeShippingThreshold,shippingFee,freeShippingLeft,total:subtotal+shippingFee}
 },[state,freeShippingThreshold,availablePromotions])
 return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
export function useShop(){const value=useContext(ShopContext);if(!value)throw new Error('useShop must be used inside ShopProvider');return value}
