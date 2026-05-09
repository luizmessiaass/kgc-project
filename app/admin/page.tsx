'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou senha incorretos.'); setLoading(false); return }
    router.push('/admin/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000',
      /* horizontal padding keeps card off edges on 375px */
      padding: '20px 16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: '#111', border: '2px solid #f5c542', borderRadius: 12,
        /* reduce horizontal padding on small screens via clamp-like approach */
        padding: 'clamp(24px, 8vw, 40px) clamp(16px, 6vw, 32px)',
        width: '100%', maxWidth: 380, textAlign: 'center',
        boxSizing: 'border-box',
      }}>
        <img src="/assets/logo.gif" alt="KGC" style={{ width: 'clamp(80px, 30vw, 120px)', marginBottom: 20 }} />
        <h1 style={{ fontFamily: "'Press Start 2P', monospace", color: '#f5c542', fontSize: 'clamp(0.75rem, 3vw, 1rem)', marginBottom: 8, margin: 0 }}>
          ADMIN
        </h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <input
            type="email" placeholder="Email" required value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              padding: '14px 12px', background: '#1a1a1a', border: '1px solid #333',
              borderRadius: 8, color: '#fff',
              /* 16px prevents iOS auto-zoom on focus */
              fontSize: 16,
              width: '100%', boxSizing: 'border-box',
              minHeight: 48,
            }}
          />
          <input
            type="password" placeholder="Senha" required value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              padding: '14px 12px', background: '#1a1a1a', border: '1px solid #333',
              borderRadius: 8, color: '#fff', fontSize: 16,
              width: '100%', boxSizing: 'border-box',
              minHeight: 48,
            }}
          />
          {error && (
            <p style={{
              color: '#ff5555', fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.6rem', margin: '4px 0', lineHeight: 1.5,
              wordBreak: 'break-word',
            }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} style={{
            marginTop: 8,
            /* min-height 48px for comfortable touch target */
            minHeight: 48, padding: '14px 16px',
            background: '#f5c542', color: '#111',
            border: 'none', borderRadius: 8, fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.8rem', cursor: 'pointer', opacity: loading ? 0.7 : 1,
            width: '100%', boxSizing: 'border-box',
          }}>
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  )
}
