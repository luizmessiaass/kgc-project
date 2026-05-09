import Link from 'next/link'
import ExploreBar from '../components/ExploreBar'

export default function ColabPage() {
  return (
    <div className="layout-page" style={{
      padding: '34px 18px 110px',
      background: 'radial-gradient(900px circle at 50% -10%, rgba(245,197,66,.16), rgba(0,0,0,0) 55%), radial-gradient(700px circle at 15% 75%, rgba(255,255,255,.06), rgba(0,0,0,0) 60%)',
    }}>
      <h1 style={{ textAlign: 'center', margin: '10px 0 8px', textShadow: '0 0 18px rgba(245,197,66,.22)' }}>Collabs</h1>
      <p style={{ textAlign: 'center', margin: '8px auto', maxWidth: 620, opacity: 0.92, lineHeight: 1.5 }}>
        Projetos secretos e parcerias exclusivas.
      </p>
      <p style={{ textAlign: 'center', margin: '8px auto', maxWidth: 620 }}>
        <a href="https://brechodocorre.com/" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 14,
          border: '1px solid rgba(245,197,66,.55)', background: 'rgba(0,0,0,.35)',
          color: '#f5c542', textDecoration: 'none',
          boxShadow: '0 14px 30px rgba(0,0,0,.35)',
        }}>
          Visite o Brechó do Corre ↗
        </a>
      </p>

      <div className="voltar-container">
        <Link href="/#menu" className="link-voltar">← Voltar ao Menu</Link>
      </div>

      <ExploreBar pageId="colab" />
    </div>
  )
}
