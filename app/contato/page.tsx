'use client'

import { useState } from 'react'
import Link from 'next/link'
import ExploreBar from '../components/ExploreBar'

export default function ContatoPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="layout-page">
      <h1>Contato</h1>

      <p><strong>Email:</strong> <a href="mailto:contato@kgc.com" style={{ color: '#f5c542' }}>contato@kgc.com</a></p>
      <p><strong>Telefone:</strong> <a href="https://wa.me/5511945352659" target="_blank" rel="noopener noreferrer" style={{ color: '#f5c542' }}>+55 (11) 94535-2659</a></p>
      <p><strong>Endereço:</strong> R. Dom José de Barros, 337 - República, São Paulo - SP, 01038-000</p>

      <h2 style={{ textAlign: 'center', marginTop: 30 }}>Envie uma mensagem</h2>

      {sent && <p style={{ textAlign: 'center', color: '#f5c542', fontFamily: "'Press Start 2P', monospace", fontSize: '0.7rem' }}>Mensagem enviada! Em breve entraremos em contato.</p>}

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className="input-retro" type="text" name="nome" placeholder="Seu nome" required />
          <input className="input-retro" type="email" name="email" placeholder="Seu email" required />
          <textarea className="input-retro" name="mensagem" placeholder="Sua mensagem" rows={4} required style={{ resize: 'vertical' }} />
          <button type="submit" className="btn-submit">Enviar</button>
        </div>
      </form>

      <div className="voltar-container">
        <Link href="/#menu" className="link-voltar">← Voltar ao Menu</Link>
      </div>

      <ExploreBar pageId="contato" />
    </div>
  )
}
