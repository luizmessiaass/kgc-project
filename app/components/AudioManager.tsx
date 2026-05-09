'use client'
import { useEffect, useRef, useState } from 'react'

export default function AudioManager() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('kgc_mute')
    if (saved === 'true') setMuted(true)
  }, [])

  // Tenta autoplay; se bloqueado, aguarda primeira interação
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.2
    audio.muted = muted

    const tryPlay = () => {
      audio.play().catch(() => {})
    }

    // Tenta imediatamente
    tryPlay()

    // Fallback: primeira interação do usuário
    const unlock = () => {
      audio.play().catch(() => {})
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
    document.addEventListener('click', unlock)
    document.addEventListener('touchstart', unlock)

    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [])

  // Sync mute
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.muted = muted
    localStorage.setItem('kgc_mute', String(muted))
  }, [muted])

  // Click sounds via Web Audio API
  useEffect(() => {
    let ctx: AudioContext | null = null

    function playClick() {
      try {
        if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.05)
      } catch {}
    }

    function handleClick(e: MouseEvent) {
      const t = e.target as HTMLElement
      if (t.closest('button, a, .menu-tile, [role="button"]')) playClick()
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      ctx?.close()
    }
  }, [])

  return (
    <>
      <audio ref={audioRef} src="/intro.mp3" loop />
      <button
        onClick={() => setMuted(m => !m)}
        aria-label={muted ? 'Ativar som' : 'Silenciar'}
        style={{
          position: 'fixed', bottom: '60px', right: '16px', zIndex: 90,
          width: 36, height: 36, borderRadius: '50%',
          background: '#111', border: '1px solid #333',
          color: '#f5c542', fontSize: '0.85rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, margin: 0, minHeight: 0, minWidth: 0,
          touchAction: 'manipulation',
        }}
      >
        <i className={`fas ${muted ? 'fa-volume-mute' : 'fa-volume-up'}`} />
      </button>
    </>
  )
}
