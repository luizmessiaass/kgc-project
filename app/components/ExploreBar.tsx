'use client'

import { useState, useEffect } from 'react'

const PAGES = ['home', 'loja', 'projetos', 'colab', 'sobre', 'contato', 'media', 'product', 'checkout']

export default function ExploreBar({ pageId }: { pageId: string }) {
  const [progress, setProgress] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    let visited: string[] = []
    try { visited = JSON.parse(localStorage.getItem('visitedPages') || '[]') } catch { visited = [] }

    if (pageId && !visited.includes(pageId)) {
      visited.push(pageId)
      localStorage.setItem('visitedPages', JSON.stringify(visited))
    }

    const valid = visited.filter(id => PAGES.includes(id))
    const pct = Math.min(100, Math.floor((valid.length / PAGES.length) * 100))
    setProgress(pct)

    if (pct >= 100 && !localStorage.getItem('kgc_explore_complete')) {
      setShowOverlay(true)
      localStorage.setItem('kgc_explore_complete', 'true')
      setTimeout(() => setShowOverlay(false), 3000)
    }
  }, [pageId])

  return (
    <>
      <div className="explore-bar">
        <span>EXPLORAÇÃO DO SITE</span>
        <div className="explore-track">
          <div className="explore-progress" style={{ width: `${progress}%` }} />
        </div>
        <span className="explore-percent">{progress}%</span>
      </div>

      <div className={`explore-overlay${showOverlay ? ' active' : ''}`}>
        <div className="explore-overlay-content">
          <p>Você zerou o site.</p>
          <button className="explore-close-btn" onClick={() => setShowOverlay(false)}>
            Fechar
          </button>
        </div>
      </div>
    </>
  )
}
