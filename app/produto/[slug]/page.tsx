'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ExploreBar from '../../components/ExploreBar'
import { supabase, type Product } from '../../../lib/supabase'

function getImages(p: Product): string[] {
  if (p.images && p.images.length > 0) return p.images
  const imgs = []
  for (let i = 1; i <= 5; i++) imgs.push(`/products/${p.slug}/${p.slug}_${i}.png`)
  return imgs
}

function parseList(val: string): string[] {
  return val ? val.split(',').map(v => v.trim()).filter(Boolean) : []
}

export default function ProdutoPage() {
  const { slug } = useParams() as { slug: string }

  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [zoomSrc, setZoomSrc] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ msg: string; error: boolean } | null>(null)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (!data) { setNotFound(true); return }
        setProduct(data)
        if (parseList(data.colors).length === 0) setSelectedColor('Padrão')
        if (parseList(data.sizes).length === 0) setSelectedSize('Único')
      })
  }, [slug])

  const images = product ? getImages(product) : []
  const colors = product ? parseList(product.colors) : []
  const sizes = product ? parseList(product.sizes) : []

  function addToCart() {
    if (!product) return
    if (!selectedSize) { setNotification({ msg: 'Selecione um tamanho!', error: true }); return }
    if (!selectedColor) { setNotification({ msg: 'Selecione uma cor!', error: true }); return }

    const cartItem = {
      id: `${product.slug}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: Number(product.price),
      slug: product.slug,
      image: images[0] || '/assets/placeholder.png',
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
    }

    let cart = []
    try { cart = JSON.parse(localStorage.getItem('cart') || '[]') } catch { cart = [] }
    const idx = cart.findIndex((i: typeof cartItem) => i.id === cartItem.id)
    if (idx > -1) cart[idx].quantity += 1
    else cart.push(cartItem)

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    setNotification({ msg: 'ITEM ADICIONADO AO INVENTÁRIO!', error: false })
  }

  if (notFound) return (
    <div className="layout-page">
      <h2>Produto não encontrado.</h2>
      <Link href="/loja" className="link-voltar">← Voltar à Loja</Link>
    </div>
  )

  if (!product) return (
    <div className="layout-page">
      <p style={{ fontFamily: "'Press Start 2P', monospace", color: '#f5c542' }}>Carregando...</p>
    </div>
  )

  const discount = product.original_price && Number(product.original_price) > Number(product.price)
    ? Math.round((1 - product.price / Number(product.original_price)) * 100)
    : null

  return (
    <div className="layout-page">
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ margin: 0, display: 'inline-block' }}>KGC</h1>
        </Link>
      </div>

      {zoomSrc && (
        <div className="zoom-modal" style={{ display: 'block' }} onClick={() => setZoomSrc(null)}>
          <span className="zoom-close">&times;</span>
          <img className="zoom-modal-content" src={zoomSrc} alt="zoom" />
        </div>
      )}

      <div id="product-detail">
        <div className="product-images">
          <div className="carousel-container">
            {images.map((img, i) => (
              <div key={i} className={`carousel-item${i === slideIndex ? ' active' : ''}`}
                style={{ display: i === slideIndex ? 'block' : 'none' }}>
                <img src={img} alt={product.name} style={{ cursor: 'zoom-in' }}
                  onClick={() => setZoomSrc(img)}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            ))}
            <span className="prev" onClick={() => setSlideIndex(i => (i - 1 + images.length) % images.length)}>&#10094;</span>
            <span className="next" onClick={() => setSlideIndex(i => (i + 1) % images.length)}>&#10095;</span>
          </div>
        </div>

        <div className="product-info">
          <h2>{product.name}</h2>

          <div className="price-section">
            {discount && (
              <>
                <span className="original-price">R$ {Number(product.original_price).toFixed(2)}</span>
                <span className="discount-badge">-{discount}%</span>
              </>
            )}
            <div className="price">R$ {Number(product.price).toFixed(2)}</div>
          </div>

          <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>

          <div className="options">
            <div className="colors">
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: '#f5c542', fontSize: '0.8rem' }}>Cor:</span>
              <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 5, marginLeft: 10 }}>
                {colors.length === 0
                  ? <span style={{ fontSize: '0.7rem', color: '#777' }}>Única</span>
                  : colors.map(c => (
                    <button key={c} className={`option-btn${selectedColor === c ? ' selected' : ''}`}
                      onClick={() => setSelectedColor(c)}>{c}</button>
                  ))}
              </div>
            </div>
            <div className="sizes" style={{ marginTop: 15 }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: '#f5c542', fontSize: '0.8rem' }}>Tamanho:</span>
              <div id="size-options" style={{ marginTop: 5 }}>
                {sizes.length === 0
                  ? <span style={{ fontSize: '0.7rem', color: '#777' }}>Único</span>
                  : sizes.map(s => (
                    <button key={s} className={`option-btn${selectedSize === s ? ' selected' : ''}`}
                      onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
              </div>
            </div>
          </div>

          <div className="actions" style={{ marginTop: 30 }}>
            <button onClick={addToCart}>Adicionar ao Carrinho</button>
            <Link href="/loja"><button>Voltar à Loja</button></Link>
          </div>
        </div>
      </div>

      {notification && (
        <div style={{
          display: 'flex', position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', background: '#111',
          border: '2px solid #f5c542', padding: 25, zIndex: 9999,
          flexDirection: 'column', gap: 20, width: '90%', maxWidth: 350,
          boxShadow: '0 0 30px rgba(0,0,0,0.9)', textAlign: 'center',
        }}>
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '0.8rem', margin: 0, lineHeight: 1.6, color: notification.error ? '#ff5555' : '#f5c542' }}>
            {notification.msg}
          </p>
          <button onClick={() => setNotification(null)}>OK</button>
        </div>
      )}

      <ExploreBar pageId="product" />
    </div>
  )
}
