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
  const [maxFilter, setMaxFilter] = useState(Infinity)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const list = data ?? []
        setProducts(list)
        setLoading(false)
        if (list.length > 0) {
          const max = Math.ceil(Math.max(...list.map(p => Number(p.price))))
          setMaxFilter(max)
        }
      })
  }, [])

  const priceMax = useMemo(
    () => products.length > 0 ? Math.ceil(Math.max(...products.map(p => Number(p.price)))) : 1000,
    [products]
  )

  const filtered = useMemo(() => {
    let list = products
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter(p => Number(p.price) <= maxFilter)
    if (sort === 'price-asc') list = [...list].sort((a, b) => Number(a.price) - Number(b.price))
    else if (sort === 'price-desc') list = [...list].sort((a, b) => Number(b.price) - Number(a.price))
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, search, sort, maxFilter])

  const sliderValue = maxFilter === Infinity ? priceMax : Math.min(maxFilter, priceMax)
  const atMax = sliderValue >= priceMax

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

      {!loading && products.length > 0 && (
        <div className="price-range-control">
          <span className="price-range-label">
            Preço: {atMax ? 'Todos' : `Até R$ ${sliderValue}`}
          </span>
          <input
            type="range"
            className="price-range-input"
            min={0}
            max={priceMax}
            step={Math.max(1, Math.floor(priceMax / 50))}
            value={sliderValue}
            onChange={e => setMaxFilter(Number(e.target.value))}
            aria-label="Filtrar por preço máximo"
          />
          <div className="price-range-ends">
            <span>R$ 0</span>
            <span>R$ {priceMax}</span>
          </div>
        </div>
      )}

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
            {search || !atMax ? 'Nenhum produto encontrado.' : 'Nenhum produto encontrado.'}
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
