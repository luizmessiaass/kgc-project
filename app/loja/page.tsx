'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import ExploreBar from '../components/ExploreBar'
import { supabase, type Product } from '../../lib/supabase'

function getImage(p: Product): string {
  if (p.images && p.images.length > 0) return p.images[0]
  return `/products/${p.slug}/${p.slug}_1.png`
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name'

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')

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

  const filtered = useMemo(() => {
    let list = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'price-asc') list = [...list].sort((a, b) => Number(a.price) - Number(b.price))
    else if (sort === 'price-desc') list = [...list].sort((a, b) => Number(b.price) - Number(a.price))
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, search, sort])

  return (
    <div className="layout-page">
      <h1>KGC</h1>
      <p style={{ fontFamily: "'Press Start 2P', monospace", color: '#f5c542', marginBottom: 20 }}>
        Produtos disponíveis:
      </p>

      <div className="store-controls">
        <input
          type="text"
          className="store-search"
          placeholder="Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Buscar produto"
        />
        <select
          className="store-sort"
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          aria-label="Ordenar por"
        >
          <option value="newest">Mais novos</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="name">A-Z</option>
        </select>
      </div>

      <div id="store">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))
        ) : filtered.length === 0 ? (
          <p style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: 40,
            color: '#777', fontFamily: "'Press Start 2P', monospace", fontSize: '0.7rem',
          }}>
            {search ? `Nenhum resultado para "${search}"` : 'Nenhum produto encontrado.'}
          </p>
        ) : (
          filtered.map(p => {
            const discount = p.original_price && Number(p.original_price) > Number(p.price)
              ? Math.round((1 - Number(p.price) / Number(p.original_price)) * 100)
              : null
            return (
              <Link
                href={`/produto/${p.slug}`}
                key={p.slug}
                className="product-card"
                style={{ textDecoration: 'none', position: 'relative' }}
              >
                {discount && (
                  <span className="card-discount-tag">-{discount}%</span>
                )}
                <img
                  src={getImage(p)}
                  alt={p.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.png' }}
                />
                <h3>{p.name}</h3>
                <p>R$ {Number(p.price).toFixed(2)}</p>
              </Link>
            )
          })
        )}
      </div>

      <div className="voltar-container">
        <Link href="/#menu" className="link-voltar">← Voltar ao Menu</Link>
      </div>

      <ExploreBar pageId="loja" />
    </div>
  )
}
