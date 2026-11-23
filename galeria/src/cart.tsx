import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface Cart {
  count: number
  add: () => void
}

const CartContext = createContext<Cart>({ count: 0, add: () => {} })

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  const value = useMemo(() => ({ count, add: () => setCount((c) => c + 1) }), [count])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
