'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, type Product } from '../../../lib/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/admin'); return }
      fetchProducts()
    })
  }, [])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  async function toggleActive(p: Product) {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x))
  }

  async function deleteProduct(p: Product) {
    if (!confirm(`Deletar "${p.name}"?`)) return
    await supabase.from('products').delete().eq('id', p.id)
    setProducts(prev => prev.filter(x => x.id !== p.id))
  }

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/admin')
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Oswald', sans-serif", padding: '24px 16px 60px', boxSizing: 'border-box' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 },
    title: { fontFamily: "'Press Start 2P', monospace", color: '#f5c542', fontSize: 'clamp(0.7rem, 3vw, 1rem)', margin: 0, flexShrink: 0 },
    /* Action buttons: full touch targets (min 44px), shrink text on narrow screens */
    btnGold: {
      background: '#f5c542', color: '#111', border: 'none', borderRadius: 8,
      padding: '0 14px', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace",
      fontSize: 'clamp(0.5rem, 2vw, 0.65rem)',
      minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      whiteSpace: 'nowrap',
    },
    btnDark: {
      background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8,
      padding: '0 14px', cursor: 'pointer', fontSize: '0.85rem',
      minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      whiteSpace: 'nowrap',
    },
    btnRed: {
      background: '#B22222', color: '#fff', border: 'none', borderRadius: 6,
      padding: '0 12px', cursor: 'pointer', fontSize: '0.8rem',
      minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '100%', justifyItems: 'center', boxSizing: 'border-box' as const,
    },
    /* Card: on mobile stack image+info vertically, keep actions column to the right */
    card: {
      background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px',
      display: 'grid',
      /* 56px image | flexible info | action column — works down to 375px */
      gridTemplateColumns: '56px 1fr auto',
      gap: 10, alignItems: 'center', marginBottom: 10,
      boxSizing: 'border-box',
    },
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>ADMIN KGC</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/dashboard/novo">
            <button style={s.btnGold}>+ NOVO PRODUTO</button>
          </Link>
          <button style={s.btnDark} onClick={logout}>Sair</button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#f5c542', fontFamily: "'Press Start 2P', monospace", fontSize: '0.7rem', textAlign: 'center', padding: '40px 0' }}>Carregando...</p>
      ) : products.length === 0 ? (
        <p style={{ color: '#777', textAlign: 'center', padding: '40px 0' }}>Nenhum produto cadastrado.</p>
      ) : (
        products.map(p => {
          const img = p.images?.[0] ?? `/products/${p.slug}/${p.slug}_1.png`
          return (
            <div key={p.id} style={s.card}>
              {/* Product image — 56×56, hidden on error */}
              <img src={img} alt={p.name}
                style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #222', flexShrink: 0 }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />

              {/* Name / price / slug — overflow truncated */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ color: '#f5c542', fontSize: '0.85rem' }}>R$ {Number(p.price).toFixed(2)}</div>
                <div style={{ color: '#888', fontSize: '0.75rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.slug}</div>
              </div>

              {/* Action column — 44px min-height on every button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch', minWidth: 72 }}>
                <button
                  onClick={() => toggleActive(p)}
                  style={{
                    background: p.active ? '#1a3a1a' : '#3a1a1a',
                    color: p.active ? '#4caf50' : '#f44336',
                    border: `1px solid ${p.active ? '#4caf50' : '#f44336'}`,
                    borderRadius: 6, padding: '0 8px', cursor: 'pointer', fontSize: '0.65rem',
                    minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Press Start 2P', monospace", whiteSpace: 'nowrap',
                    width: '100%', boxSizing: 'border-box',
                  }}
                >
                  {p.active ? 'ATIVO' : 'INATIVO'}
                </button>
                <Link href={`/admin/dashboard/produto?slug=${p.slug}`} style={{ display: 'block' }}>
                  <button style={{
                    background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 6,
                    padding: '0 8px', cursor: 'pointer', fontSize: '0.8rem',
                    minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', boxSizing: 'border-box',
                  }}>Editar</button>
                </Link>
                <button onClick={() => deleteProduct(p)} style={{
                  background: '#B22222', color: '#fff', border: 'none', borderRadius: 6,
                  padding: '0 8px', cursor: 'pointer', fontSize: '0.8rem',
                  minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', boxSizing: 'border-box',
                }}>Deletar</button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
