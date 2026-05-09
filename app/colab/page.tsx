import Link from 'next/link'
import ExploreBar from '../components/ExploreBar'

export default function ColabPage() {
  return (
    <div className="layout-page colab-page">
      <h1 style={{ textAlign: 'center', margin: '10px 0 8px', textShadow: '0 0 18px rgba(245,197,66,.22)' }}>Collabs</h1>
      <p className="colab-intro">
        Projetos secretos e parcerias exclusivas.
      </p>
      <div className="colab-link-wrap">
        <a
          href="https://brechodocorre.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="colab-link"
        >
          Visite o Brechó do Corre ↗
        </a>
      </div>

      <div className="voltar-container">
        <Link href="/#menu" className="link-voltar">← Voltar ao Menu</Link>
      </div>

      <ExploreBar pageId="colab" />
    </div>
  )
}
