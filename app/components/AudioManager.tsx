'use client'
import { useEffect, useRef, useState } from 'react'

export default function AudioManager() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)

  // Read persisted mute preference
  useEffect(() => {
    const saved = localStorage.getItem('kgc_mute')
    if (saved === 'true') setMuted(true)
  }, [])

  // Click sound via Web Audio API
  useEffect(() => {
    let ctx: AudioContext | null = null

    function getCtx() {
      if (!ctx) {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      return ctx
    }

    function playClick() {
      try {
        const c = getCtx()
        const osc = c.createOscillator()
        const gain = c.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(600, c.currentTime)
        gain.gain.setValueAtTime(0.15, c.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.05)
        osc.connect(gain)
        gain.connect(c.destination)
        osc.start()
        osc.stop(c.currentTime + 0.05)
      } catch {}
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const interactive = target.closest('button, a, .menu-tile, [role="button"]')
      if (interactive) playClick()
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      ctx?.close()
    }
  }, [])

  // Start background music on first user interaction
  useEffect(() => {
    if (started) return

    function startAudio() {
      const audio = audioRef.current
      if (!audio) return
      audio.volume = 0.2
      audio.muted = muted
      audio.play().catch(() => {})
      setStarted(true)
    }

    document.addEventListener('click', startAudio, { once: true })
    document.addEventListener('touchstart', startAudio, { once: true })
    return () => {
      document.removeEventListener('click', startAudio)
      document.removeEventListener('touchstart', startAudio)
    }
  }, [started, muted])

  // Sync mute state to audio element and localStorage
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.muted = muted
    localStorage.setItem('kgc_mute', String(muted))
  }, [muted])

  function toggleMute() {
    setMuted(m => !m)
  }

  return (
    <>
      <audio ref={audioRef} src="/intro.mp3" loop />
      <button
        onClick={toggleMute}
        aria-label={muted ? 'Ativar som' : 'Silenciar'}
        style={{
          position: 'fixed',
          bottom: '60px',
          right: '16px',
          zIndex: 90,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#111',
          border: '1px solid #333',
          color: '#f5c542',
          fontSize: '0.85rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          margin: 0,
          minHeight: 0,
          minWidth: 0,
          touchAction: 'manipulation',
        }}
      >
        <i className={`fas ${muted ? 'fa-volume-mute' : 'fa-volume-up'}`} />
      </button>
    </>
  )
}
