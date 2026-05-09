'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ExploreBar from './components/ExploreBar'

export default function HomePage() {
  const [showMenu, setShowMenu] = useState(false)
  const [showInitOverlay, setShowInitOverlay] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (window.location.hash === '#menu') setShowMenu(true)

    const setVH = () =>
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px')
    setVH()
    window.addEventListener('resize', setVH)
    return () => window.removeEventListener('resize', setVH)
  }, [])

  function handleEnter() {
    if (audioRef.current) {
      audioRef.current.volume = 0.2
      audioRef.current.play().catch(() => {})
    }
    setShowInitOverlay(true)
    setTimeout(() => {
      setShowInitOverlay(false)
      setShowMenu(true)
    }, 2000)
  }

  return (
    <div className="layout-home">
      <div id="retro-monitor">
        {!showMenu && (
          <div id="start-screen">
            <div className="brand">
              <img src="/assets/logo.gif" alt="KGC" className="kgc-logo" />
            </div>
            <button id="enter-btn" onClick={handleEnter}>
              Entrar na cena
            </button>
          </div>
        )}

        {showMenu && (
          <div id="main-menu">
            <div className="brand" style={{ textAlign: 'center', marginBottom: 20 }}>
              <img
                src="/assets/logo.gif"
                alt="KGC"
                className="kgc-logo"
                style={{ width: 150, height: 'auto' }}
              />
            </div>

            <div className="menu-grid">
              <Link href="/loja" className="menu-tile">
                <i className="fas fa-store icon-green" />
                <span>Loja</span>
              </Link>
              <Link href="/projetos" className="menu-tile">
                <i className="fas fa-project-diagram icon-orange" />
                <span>Projetos</span>
              </Link>
              <Link href="/colab" className="menu-tile">
                <i className="fas fa-users icon-blue" />
                <span>Collabs</span>
              </Link>
              <Link href="/sobre" className="menu-tile">
                <i className="fas fa-info-circle icon-red" />
                <span>Sobre</span>
              </Link>
              <Link href="/contato" className="menu-tile">
                <i className="fas fa-phone icon-darkgreen" />
                <span>Contato</span>
              </Link>
              <Link href="/media" className="menu-tile">
                <i className="fas fa-film icon-purple" />
                <span>Mídia</span>
              </Link>
            </div>

            <div className="menu-footer">
              <p>
                © 2025 KGC&nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="#">Termos</a>&nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="#">Privacidade</a>
              </p>
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} loop>
        <source src="/intro.mp3" type="audio/mpeg" />
      </audio>

      <div className={`init-overlay${showInitOverlay ? ' active' : ''}`}>
        <p>Inicializando sistema...</p>
        <p>&gt; Carregando cena...</p>
        <p>Aguarde, entrando na KGC</p>
      </div>

      <ExploreBar pageId="home" />
    </div>
  )
}
