import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products } from '../data/products'
import type { Product } from '../data/products'

export type ProductSnapshot=Product
export type CartLine={productId:string;quantity:number;snapshot?:ProductSnapshot}
type PersistedState={cart:CartLine[];wishlist:string[];compare:string[];recentlyViewed:string[];snapshots:Record<string,ProductSnapshot>}
type ShopState=PersistedState&{
 addToCart:(productId:string,quantity?:number,product?:ProductSnapshot)=>void
 updateQuantity:(productId:string,quantity:number)=>void
 removeFromCart:(productId:string)=>void
 toggleWishlist:(productId:string,product?:ProductSnapshot)=>void
 toggleCompare:(productId:string,product?:ProductSnapshot)=>void
 markViewed:(productId:string,product?:ProductSnapshot)=>void
 rememberProduct:(product:ProductSnapshot)=>void
 getProduct:(productId:string)=>ProductSnapshot|undefined
 cartCount:number
 subtotal:number
 freeShippingThreshold:number
 shippingFee:number
 freeShippingLeft:number
}
const ShopContext=createContext<ShopState|null>(null)
const storageKey='dinotoys-hu-store-v2'
const initial:PersistedState={cart:[],wishlist:[],compare:[],recentlyViewed:[],snapshots:{}}

export function ShopProvider({children,freeShippingThreshold=15000}:{children:React.ReactNode;freeShippingThreshold?:number}){
 const [state,setState]=useState<PersistedState>(initial)
 useEffect(()=>{try{const raw=localStorage.getItem(storageKey);if(raw)setState({...initial,...JSON.parse(raw)})}catch{}},[])
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}},[state])
 const value=useMemo<ShopState>(()=>{
  const remember=(current:PersistedState,product?:ProductSnapshot)=>product?{...current.snapshots,[product.id]:product}:current.snapshots
  const rememberProduct=(product:ProductSnapshot)=>setState(c=>({...c,snapshots:remember(c,product)}))
  const addToCart=(productId:string,quantity=1,product?:ProductSnapshot)=>setState(current=>{const line=current.cart.find(x=>x.productId===productId);const snapshot=product??current.snapshots[productId];const cart=line?current.cart.map(x=>x.productId===productId?{...x,quantity:x.quantity+quantity,snapshot:snapshot??x.snapshot}:x):[...current.cart,{productId,quantity,snapshot}];return{...current,cart,snapshots:remember(current,product)}})
  const updateQuantity=(productId:string,quantity:number)=>setState(c=>({...c,cart:quantity<=0?c.cart.filter(x=>x.productId!==productId):c.cart.map(x=>x.productId===productId?{...x,quantity}:x)}))
  const removeFromCart=(productId:string)=>setState(c=>({...c,cart:c.cart.filter(x=>x.productId!==productId)}))
  const toggleWishlist=(productId:string,product?:ProductSnapshot)=>setState(c=>({...c,wishlist:c.wishlist.includes(productId)?c.wishlist.filter(x=>x!==productId):[...c.wishlist,productId],snapshots:remember(c,product)}))
  const toggleCompare=(productId:string,product?:ProductSnapshot)=>setState(c=>({...c,compare:c.compare.includes(productId)?c.compare.filter(x=>x!==productId):[...c.compare.slice(-3),productId],snapshots:remember(c,product)}))
  const markViewed=(productId:string,product?:ProductSnapshot)=>setState(c=>({...c,recentlyViewed:[productId,...c.recentlyViewed.filter(x=>x!==productId)].slice(0,8),snapshots:remember(c,product)}))
  const getProduct=(productId:string)=>state.snapshots[productId]??products.find(p=>p.id===productId)
  const cartCount=state.cart.reduce((s,l)=>s+l.quantity,0)
  const subtotal=state.cart.reduce((s,l)=>s+(l.snapshot??state.snapshots[l.productId]??products.find(p=>p.id===l.productId))!.retailPrice*l.quantity,0)
  const freeShippingLeft=Math.max(0,freeShippingThreshold-subtotal)
  const shippingFee=subtotal>=freeShippingThreshold?0:1490
  return{...state,addToCart,updateQuantity,removeFromCart,toggleWishlist,toggleCompare,markViewed,rememberProduct,getProduct,cartCount,subtotal,freeShippingThreshold,shippingFee,freeShippingLeft}
 },[state,freeShippingThreshold])
 return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
export function useShop(){const value=useContext(ShopContext);if(!value)throw new Error('useShop must be used inside ShopProvider');return value}
