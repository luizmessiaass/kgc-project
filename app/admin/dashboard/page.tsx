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
    page: { minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Oswald', sans-serif", padding: '24px 20px 60px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 },
    title: { fontFamily: "'Press Start 2P', monospace", color: '#f5c542', fontSize: '1rem', margin: 0 },
    btnGold: { background: '#f5c542', color: '#111', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: '0.65rem' },
    btnDark: { background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: '0.85rem' },
    btnRed: { background: '#B22222', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem' },
    card: { background: '#111', border: '1px solid #222', borderRadius: 10, padding: '16px', display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 14, alignItems: 'center', marginBottom: 10 },
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
        <p style={{ color: '#f5c542', fontFamily: "'Press Start 2P', monospace", fontSize: '0.7rem' }}>Carregando...</p>
      ) : products.length === 0 ? (
        <p style={{ color: '#777' }}>Nenhum produto cadastrado.</p>
      ) : (
        products.map(p => {
          const img = p.images?.[0] ?? `/products/${p.slug}/${p.slug}_1.png`
          return (
            <div key={p.id} style={s.card}>
              <img src={img} alt={p.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #222' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                <div style={{ color: '#f5c542', fontSize: '0.9rem' }}>R$ {Number(p.price).toFixed(2)}</div>
                <div style={{ color: '#888', fontSize: '0.8rem', marginTop: 2 }}>{p.slug}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <button
                  onClick={() => toggleActive(p)}
                  style={{ ...s.btnDark, background: p.active ? '#1a3a1a' : '#3a1a1a', color: p.active ? '#4caf50' : '#f44336', border: `1px solid ${p.active ? '#4caf50' : '#f44336'}`, padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  {p.active ? 'ATIVO' : 'INATIVO'}
                </button>
                <Link href={`/admin/dashboard/produto?slug=${p.slug}`}>
                  <button style={{ ...s.btnDark, padding: '6px 12px', fontSize: '0.8rem' }}>Editar</button>
                </Link>
                <button style={s.btnRed} onClick={() => deleteProduct(p)}>Deletar</button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
