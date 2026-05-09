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
    <div className="layout-page contato-page">
      <h1 style={{ textAlign: 'center' }}>Contato</h1>

      <div className="contato-info">
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:contato@kgc.com" className="contato-link">
            contato@kgc.com
          </a>
        </p>
        <p>
          <strong>WhatsApp:</strong>{' '}
          <a
            href="https://wa.me/5511945352659"
            target="_blank"
            rel="noopener noreferrer"
            className="contato-link"
          >
            +55 (11) 94535-2659
          </a>
        </p>
        <p className="contato-endereco">
          <strong>Endereço:</strong> R. Dom José de Barros, 337 - República, São Paulo - SP, 01038-000
        </p>
      </div>

      <h2 style={{ textAlign: 'center', marginTop: 30 }}>Envie uma mensagem</h2>

      {sent && (
        <p className="contato-sent">
          Mensagem enviada! Em breve entraremos em contato.
        </p>
      )}

      <form onSubmit={handleSubmit} className="contato-form">
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
