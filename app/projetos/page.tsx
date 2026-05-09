import Link from 'next/link'
import ExploreBar from '../components/ExploreBar'

export default function ProjetosPage() {
  return (
    <div className="layout-page">
      <h1>Projetos</h1>

      <p style={{ textAlign: 'center', maxWidth: 600, margin: '20px auto' }}>
        Em breve você encontrará aqui projetos, coleções e colaborações especiais da marca KGC. Fique ligado para novidades!
      </p>

      <div className="voltar-container">
        <Link href="/#menu" className="link-voltar">← Voltar ao Menu</Link>
      </div>

      <ExploreBar pageId="projetos" />
    </div>
  )
}
