import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products } from '../data/products'

type CartLine = { productId: string; quantity: number }
type ShopState = {
  cart: CartLine[]
  wishlist: string[]
  compare: string[]
  recentlyViewed: string[]
  addToCart: (productId: string, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  toggleWishlist: (productId: string) => void
  toggleCompare: (productId: string) => void
  markViewed: (productId: string) => void
  cartCount: number
  subtotal: number
}

const ShopContext = createContext<ShopState | null>(null)
const storageKey = 'dinotoys-hu-store-v1'
const initial = { cart: [] as CartLine[], wishlist: [] as string[], compare: [] as string[], recentlyViewed: [] as string[] }

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initial)
  useEffect(() => { try { const raw = localStorage.getItem(storageKey); if (raw) setState({ ...initial, ...JSON.parse(raw) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(state)) } catch {} }, [state])
  const value = useMemo<ShopState>(() => {
    const addToCart = (productId: string, quantity = 1) => setState((current) => { const line = current.cart.find((item) => item.productId === productId); const cart = line ? current.cart.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item) : [...current.cart, { productId, quantity }]; return { ...current, cart } })
    const updateQuantity = (productId: string, quantity: number) => setState((current) => ({ ...current, cart: quantity <= 0 ? current.cart.filter((x) => x.productId !== productId) : current.cart.map((x) => x.productId === productId ? { ...x, quantity } : x) }))
    const removeFromCart = (productId: string) => setState((current) => ({ ...current, cart: current.cart.filter((x) => x.productId !== productId) }))
    const toggleWishlist = (productId: string) => setState((current) => ({ ...current, wishlist: current.wishlist.includes(productId) ? current.wishlist.filter((x) => x !== productId) : [...current.wishlist, productId] }))
    const toggleCompare = (productId: string) => setState((current) => ({ ...current, compare: current.compare.includes(productId) ? current.compare.filter((x) => x !== productId) : [...current.compare.slice(-3), productId] }))
    const markViewed = (productId: string) => setState((current) => ({ ...current, recentlyViewed: [productId, ...current.recentlyViewed.filter((x) => x !== productId)].slice(0, 8) }))
    const cartCount = state.cart.reduce((sum, line) => sum + line.quantity, 0)
    const subtotal = state.cart.reduce((sum, line) => sum + (products.find((p) => p.id === line.productId)?.retailPrice ?? 0) * line.quantity, 0)
    return { ...state, addToCart, updateQuantity, removeFromCart, toggleWishlist, toggleCompare, markViewed, cartCount, subtotal }
  }, [state])
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() { const value = useContext(ShopContext); if (!value) throw new Error('useShop must be used inside ShopProvider'); return value }
