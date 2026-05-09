'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, type Product } from '../../../../lib/supabase'
import { Suspense } from 'react'

function ProductForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  const isEdit = !!slug

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', original_price: '', colors: '', sizes: '', active: true })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/admin'); return }
    })
    if (slug) {
      supabase.from('products').select('*').eq('slug', slug).single().then(({ data }) => {
        if (!data) return
        setForm({
          name: data.name, slug: data.slug, description: data.description ?? '',
          price: String(data.price), original_price: String(data.original_price ?? ''),
          colors: data.colors ?? '', sizes: data.sizes ?? '', active: data.active,
        })
        setImages(data.images ?? [])
      })
    }
  }, [slug])

  async function uploadImage(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${form.slug || 'temp'}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('products').getPublicUrl(path)
      setImages(prev => [...prev, data.publicUrl])
    }
    setUploading(false)
  }

  async function removeImage(url: string) {
    setImages(prev => prev.filter(i => i !== url))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name, slug: form.slug, description: form.description,
      price: parseFloat(form.price), original_price: form.original_price ? parseFloat(form.original_price) : null,
      colors: form.colors, sizes: form.sizes, active: form.active, images,
    }
    if (isEdit) {
      await supabase.from('products').update(payload).eq('slug', slug!)
    } else {
      await supabase.from('products').insert(payload)
    }
    setSaving(false)
    router.push('/admin/dashboard')
  }

  const inp: React.CSSProperties = { width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 16, boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', color: '#f5c542', fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', marginBottom: 6, marginTop: 16 }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Oswald', sans-serif", padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button onClick={() => router.push('/admin/dashboard')} style={{ background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>← Voltar</button>
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", color: '#f5c542', fontSize: '0.9rem', margin: 0 }}>
            {isEdit ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
          </h1>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={lbl}>NOME</label>
          <input style={inp} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

          <label style={lbl}>SLUG (URL)</label>
          <input style={inp} required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} disabled={isEdit} />

          <label style={lbl}>DESCRIÇÃO</label>
          <textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>PREÇO (R$)</label>
              <input style={inp} type="number" step="0.01" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>PREÇO ORIGINAL (R$)</label>
              <input style={inp} type="number" step="0.01" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} />
            </div>
          </div>

          <label style={lbl}>CORES (separadas por vírgula)</label>
          <input style={inp} placeholder="Ex: Preto, Branco, Camuflado" value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} />

          <label style={lbl}>TAMANHOS (separados por vírgula)</label>
          <input style={inp} placeholder="Ex: P,M,G,GG ou Único" value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} />

          <label style={lbl}>STATUS</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[true, false].map(v => (
              <button key={String(v)} type="button"
                onClick={() => setForm(f => ({ ...f, active: v }))}
                style={{ padding: '10px 20px', borderRadius: 8, cursor: 'pointer', border: '1px solid', fontSize: '0.85rem', background: form.active === v ? (v ? '#1a3a1a' : '#3a1a1a') : '#1a1a1a', color: form.active === v ? (v ? '#4caf50' : '#f44336') : '#777', borderColor: form.active === v ? (v ? '#4caf50' : '#f44336') : '#333' }}>
                {v ? 'ATIVO' : 'INATIVO'}
              </button>
            ))}
          </div>

          <label style={lbl}>IMAGENS</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
            {images.map(url => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #333' }} />
                <button type="button" onClick={() => removeImage(url)}
                  style={{ position: 'absolute', top: -6, right: -6, background: '#B22222', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()}
              style={{ width: 80, height: 80, background: '#1a1a1a', border: '2px dashed #333', borderRadius: 6, cursor: 'pointer', color: '#777', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploading ? '...' : '+'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]) }} />

          <button type="submit" disabled={saving} style={{
            marginTop: 28, padding: 16, background: '#f5c542', color: '#111',
            border: 'none', borderRadius: 8, fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.8rem', cursor: 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'SALVANDO...' : 'SALVAR PRODUTO'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ProductFormPage() {
  return <Suspense><ProductForm /></Suspense>
}
