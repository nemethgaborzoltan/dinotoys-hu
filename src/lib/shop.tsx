import React,{createContext,useContext,useEffect,useMemo,useState} from 'react'
import {products} from '../data/products'
import type{Product} from '../data/products'
import type{StorefrontPromotion} from '../server/storefront'
import {demoPromotions} from '../data/offers'
import {getProductPrice} from './catalog'

export type ProductSnapshot=Product
export type CartLine={productId:string;variantId?:string;quantity:number;snapshot?:ProductSnapshot}
type PersistedState={cart:CartLine[];wishlist:string[];compare:string[];recentlyViewed:string[];snapshots:Record<string,ProductSnapshot>;appliedCouponCode:string|null}
type ShopState=PersistedState&{
 appliedCoupon:StorefrontPromotion|null;addToCart:(productId:string,quantity?:number,product?:ProductSnapshot,variantId?:string)=>void;updateQuantity:(productId:string,quantity:number,variantId?:string)=>void;
 removeFromCart:(productId:string,variantId?:string)=>void;toggleWishlist:(productId:string,product?:ProductSnapshot)=>void;toggleCompare:(productId:string,product?:ProductSnapshot)=>void;
 markViewed:(productId:string,product?:ProductSnapshot)=>void;rememberProduct:(product:ProductSnapshot)=>void;getProduct:(productId:string)=>ProductSnapshot|undefined;
 applyCoupon:(code:string)=>{ok:boolean;message:string};removeCoupon:()=>void;cartCount:number;itemsSubtotal:number;discount:number;subtotal:number;freeShippingThreshold:number;shippingFee:number;freeShippingLeft:number;total:number
}
const ShopContext=createContext<ShopState|null>(null),storageKey='dinotoys-hu-store-v3'
const initial:PersistedState={cart:[],wishlist:[],compare:[],recentlyViewed:[],snapshots:{},appliedCouponCode:null}
const lineKey=(productId:string,variantId?:string)=>`${productId}:${variantId??'base'}`

export function ShopProvider({children,freeShippingThreshold=15000,promotions}:{children:React.ReactNode;freeShippingThreshold?:number;promotions?:StorefrontPromotion[]}){
 const availablePromotions=promotions===undefined?demoPromotions:promotions
 const [state,setState]=useState<PersistedState>(initial)
 useEffect(()=>{try{const raw=localStorage.getItem(storageKey);if(raw)setState({...initial,...JSON.parse(raw)})}catch{}},[])
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}},[state])
 const value=useMemo<ShopState>(()=>{
  const remember=(current:PersistedState,product?:ProductSnapshot)=>product?{...current.snapshots,[product.id]:product}:current.snapshots
  const rememberProduct=(product:ProductSnapshot)=>setState(c=>({...c,snapshots:remember(c,product)}))
  const getProduct=(productId:string)=>state.snapshots[productId]??products.find(p=>p.id===productId)
  const addToCart=(productId:string,quantity=1,product?:ProductSnapshot,variantId?:string)=>setState(current=>{const key=lineKey(productId,variantId),line=current.cart.find(x=>lineKey(x.productId,x.variantId)===key),snapshot=product??current.snapshots[productId];const cart=line?current.cart.map(x=>lineKey(x.productId,x.variantId)===key?{...x,quantity:x.quantity+quantity,snapshot:snapshot??x.snapshot}:x):[...current.cart,{productId,variantId,quantity,snapshot}];return{...current,cart,snapshots:remember(current,product)}})
  const updateQuantity=(productId:string,quantity:number,variantId?:string)=>setState(c=>({...c,cart:quantity<=0?c.cart.filter(x=>lineKey(x.productId,x.variantId)!==lineKey(productId,variantId)):c.cart.map(x=>lineKey(x.productId,x.variantId)===lineKey(productId,variantId)?{...x,quantity}:x)}))
  const removeFromCart=(productId:string,variantId?:string)=>setState(c=>({...c,cart:c.cart.filter(x=>lineKey(x.productId,x.variantId)!==lineKey(productId,variantId))}))
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
  return{...state,appliedCoupon,addToCart,updateQuantity,removeFromCart,toggleWishlist,toggleCompare,markViewed,rememberProduct,getProduct,applyCoupon,removeCoupon,cartCount,itemsSubtotal,discount,subtotal,freeShippingThreshold,shippingFee,freeShippingLeft,total:subtotal+shippingFee}
 },[state,freeShippingThreshold,availablePromotions])
 return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
export function useShop(){const value=useContext(ShopContext);if(!value)throw new Error('useShop must be used inside ShopProvider');return value}
