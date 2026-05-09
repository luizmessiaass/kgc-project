'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  name: string
  price: number
  slug: string
  image: string
  color: string
  size: string
  quantity: number
}

export default function Cart() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const router = useRouter()

  const loadCart = useCallback(() => {
    try {
      const raw = localStorage.getItem('cart')
      setItems(raw ? JSON.parse(raw) : [])
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    loadCart()
    window.addEventListener('cart-updated', loadCart)
    return () => window.removeEventListener('cart-updated', loadCart)
  }, [loadCart])

  function removeItem(index: number) {
    const updated = [...items]
    updated.splice(index, 1)
    localStorage.setItem('cart', JSON.stringify(updated))
    setItems(updated)
    window.dispatchEvent(new Event('cart-updated'))
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <>
      {totalItems > 0 && (
        <div id="cart-icon" onClick={() => { setOpen(true); loadCart() }}>
          <i className="fas fa-shopping-cart" />
          <span className="cart-count">{totalItems}</span>
        </div>
      )}

      <div id="cart-overlay" className={open ? '' : 'hidden'}>
        <div id="cart-modal">
          <h2>Seu Carrinho</h2>
          <ul id="cart-items">
            {items.length === 0 ? (
              <li style={{ textAlign: 'center' }}>Carrinho vazio</li>
            ) : (
              items.map((item, i) => (
                <li key={item.id}>
                  <div>
                    <span>{item.name}</span>
                    <br />
                    <small style={{ color: '#aaa' }}>
                      {item.size} | {item.color} (x{item.quantity})
                    </small>
                  </div>
                  <div>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(i)}
                      style={{ width: 'auto', padding: '5px 8px', marginTop: 0 }}
                    >
                      X
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
          <p id="cart-total">Total: R$ {total.toFixed(2)}</p>
          <button onClick={() => { setOpen(false); router.push('/checkout') }}>
            Ir para Checkout
          </button>
          <button onClick={() => setOpen(false)}>Fechar</button>
        </div>
      </div>
    </>
  )
}
