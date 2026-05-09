import Link from 'next/link'
import ExploreBar from '../components/ExploreBar'

export default function SobrePage() {
  return (
    <div className="layout-page" style={{ padding: 'clamp(40px,6vh,70px) clamp(16px,4vw,40px) 140px' }}>
      <h2>SOBRE NÓS</h2>
      <p>A &quot;Keep going, corredor!&quot; (KGC) não é apenas uma marca de streetwear; é um movimento que veste a mentalidade <strong>&quot;Hustler&quot;</strong>. É a expressão em forma de roupa daquele espírito incansável que pulsa nas ruas da cidade, nos coworkings criativos, nos estúdios de arte e em cada canto onde um empreendedor, artista ou criativo está construindo seu futuro com as próprias mãos.</p>

      <h2>KGC é para quem:</h2>

      <h3>Corre atrás dos seus sonhos</h3>
      <p>Seja no asfalto da maratona, no rush do dia a dia ou na busca incansável por um objetivo, o &quot;corredor&quot; KGC é movido pela persistência e pela garra de <strong>keep going</strong>.</p>

      <h3>Transforma a rua em palco e escritório</h3>
      <p>A cidade é o habitat natural do <strong>Hustler</strong>, o cenário vibrante onde a criatividade floresce e os negócios acontecem. A KGC veste essa energia urbana com estilo e funcionalidade.</p>

      <h3>Valoriza a autenticidade acima de tudo</h3>
      <p>O &quot;Hustler&quot; KGC não segue modismos passageiros, ele cria seu próprio caminho. A KGC celebra a originalidade, a expressão individual e a <strong>street credibility</strong> de quem é verdadeiro consigo mesmo.</p>

      <h3>Entende que estilo é ferramenta, não status</h3>
      <p>Para o &quot;Hustler&quot; KGC, a roupa é uma armadura para a jornada, uma forma de expressar sua identidade e se sentir confiante para enfrentar os desafios do dia a dia. Estilo é sobre funcionalidade, conforto e atitude, não sobre ostentação.</p>

      <div className="voltar-container">
        <Link href="/#menu" className="link-voltar">← Voltar ao Menu</Link>
      </div>

      <ExploreBar pageId="sobre" />
    </div>
  )
}
