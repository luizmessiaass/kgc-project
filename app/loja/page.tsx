'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ExploreBar from '../components/ExploreBar'
import { supabase, type Product } from '../../lib/supabase'

function getImage(p: Product): string {
  if (p.images && p.images.length > 0) return p.images[0]
  return `/products/${p.slug}/${p.slug}_1.png`
}

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="layout-page">
      <h1>KGC</h1>
      <p style={{ fontFamily: "'Press Start 2P', monospace", color: '#f5c542', marginBottom: 20 }}>
        Produtos disponíveis:
      </p>

      <div id="store">
        {loading ? (
          <p style={{ textAlign: 'center', padding: 20 }}>Carregando inventário...</p>
        ) : products.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          products.map(p => (
            <Link href={`/produto/${p.slug}`} key={p.slug} className="product-card" style={{ textDecoration: 'none' }}>
              <img
                src={getImage(p)}
                alt={p.name}
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.png' }}
              />
              <h3>{p.name}</h3>
              <p>R$ {Number(p.price).toFixed(2)}</p>
            </Link>
          ))
        )}
      </div>

      <div className="voltar-container">
        <Link href="/#menu" className="link-voltar">← Voltar ao Menu</Link>
      </div>

      <ExploreBar pageId="loja" />
    </div>
  )
}
