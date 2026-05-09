'use client'

import { useState } from 'react'
import Link from 'next/link'
import ExploreBar from '../components/ExploreBar'

const LOOKBOOK = [
  'img_7713','img_7731','img_7738','img_7751','img_7761','img_7763','img_7768','img_7769',
  'img_7774','img_7776','img_7777','img_7779','img_7781','img_7788','img_7792','img_7801',
  'img_7805','img_7806','img_7810','img_7812','img_7814','img_7818','img_7834','img_7840',
  'img_7849','img_7852','img_7858','img_7859','img_7863','img_7869','img_7873','img_7877',
  'img_7886','img_7890',
]

export default function MediaPage() {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <div className="layout-page">
      <h1 style={{ textAlign: 'center' }}>Mídia</h1>

      <div className="media-video">
        <div className="video-container">
          <iframe
            src="https://www.youtube.com/embed/yzJlXG07MTo"
            title="Vídeo KGC"
            frameBorder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      <p className="media-intro" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
        Seleção de registros do nosso primeiro lookbook oficial KGC. Role a tela,
        toque nas imagens para ver em tela cheia e mergulhar no clima da cena.
      </p>

      <div className="media-gallery">
        <div className="media-grid">
          {LOOKBOOK.map((name, i) => (
            <figure key={name} className="media-item">
              <img
                src={`/assets/lookbook/thumb_${name}.jpg`}
                alt={`Lookbook KGC ${String(i + 1).padStart(2, '0')}`}
                loading="lazy"
                decoding="async"
                onClick={() => setLightbox(`/assets/lookbook/${name}.jpg`)}
              />
            </figure>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" aria-label="Fechar" onClick={() => setLightbox(null)}>&times;</button>
          <img src={lightbox} alt="Foto do lookbook KGC" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="voltar-container">
        <Link href="/#menu" className="link-voltar">← Voltar ao Menu</Link>
      </div>

      <ExploreBar pageId="media" />
    </div>
  )
}
