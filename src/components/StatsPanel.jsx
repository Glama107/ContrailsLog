import React, { useState, useEffect, useRef } from 'react'

export default function StatsPanel({ isOpen, onClose, flights = [] }) {
  const COLLAPSED = 140
  const EXPANDED_RATIO = 0.6
  const DURATION = 220

  const [height, setHeight] = useState(COLLAPSED)
  const [dragging, setDragging] = useState(false)
  const draggingRef = useRef(false)
  const recentDragRef = useRef(0)
  const [closing, setClosing] = useState(false)
  const [visible, setVisible] = useState(false)
  const [typed, setTyped] = useState('')
  const startYRef = useRef(0)
  const startHRef = useRef(COLLAPSED)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) setHeight(COLLAPSED)
    // reset dragging
    setDragging(false)
    // reset animation states
    setClosing(false)
    setVisible(false)
    setTyped('')
    
    // trigger entrance animation after mount
    if (isOpen) {
      const t = setTimeout(()=> setVisible(true), 30)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // typing effect for title when panel becomes visible
  useEffect(() => {
    if (!visible) return
    const text = 'Statistiques'
    let i = 0
    const t = setInterval(() => {
      i++
      setTyped(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, 40)
    return () => clearInterval(t)
  }, [visible])

  // attach outside-click listener after a short delay so opening clicks don't immediately close
  useEffect(() => {
    if (!isOpen) return
    let timer = null
    let attached = false

    function onDocClick(e) {
      if (draggingRef.current) return
      // ignore clicks that happen right after a drag to avoid accidental close
      if (Date.now() - (recentDragRef.current || 0) < 400) return
      if (!containerRef.current) return
      if (containerRef.current.contains(e.target)) return
      // if click is outside, run closing animation then notify parent
      setClosing(true)
      setTimeout(() => { setClosing(false); onClose && onClose() }, DURATION)
    }

    // small delay before attaching the listener to avoid catching the open click
    timer = setTimeout(() => {
      document.addEventListener('click', onDocClick)
      attached = true
    }, 350)

    return () => {
      clearTimeout(timer)
      if (attached) document.removeEventListener('click', onDocClick)
    }
  }, [isOpen, onClose])

  // keep a ref in sync with dragging state so the document listener can read latest
  useEffect(() => { draggingRef.current = dragging }, [dragging])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return
      if (e && e.touches && e.touches.length) {
        if (e.preventDefault) e.preventDefault()
      }
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const dy = startYRef.current - clientY
      const maxH = Math.round(window.innerHeight * EXPANDED_RATIO)
      const nh = Math.max(COLLAPSED, Math.min(maxH, startHRef.current + dy))
      setHeight(nh)
    }
    const onUp = () => {
      if (!dragging) return
      setDragging(false)
      recentDragRef.current = Date.now()
      const maxH = Math.round(window.innerHeight * EXPANDED_RATIO)
      const threshold = COLLAPSED + (maxH - COLLAPSED) * 0.45
      if (height > threshold) setHeight(maxH)
      else setHeight(COLLAPSED)
      try { document.body.style.userSelect = '' } catch (err) {}
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [dragging, height])

  if (!isOpen) return null

  const total = flights.length
  const aircrafts = Array.from(new Set(flights.map(f => (f.aircraft || '').toUpperCase()))).filter(Boolean)
  const airports = {}
  flights.forEach(f => { airports[f.dep] = (airports[f.dep] || 0) + 1; airports[f.arr] = (airports[f.arr] || 0) + 1 })
  const topAirports = Object.entries(airports).sort((a,b)=>b[1]-a[1]).slice(0,5)

  function onPointerDown(e) {
    if (e && e.preventDefault) e.preventDefault()
    setDragging(true)
    recentDragRef.current = Date.now()
    startYRef.current = e.touches ? e.touches[0].clientY : e.clientY
    startHRef.current = height
    try { document.body.style.userSelect = 'none' } catch (err) {}
  }

  const containerStyle = {
    width: '100%',
    maxWidth: 720,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    background: '#0b0b0d',
    color: 'white',
    transition: dragging ? 'none' : `height ${DURATION}ms ease, opacity ${DURATION}ms ease, transform ${DURATION}ms ease`,
    height: `${height}px`,
    opacity: closing ? 0 : (visible ? 1 : 0),
    transform: closing ? 'translateY(12px)' : (visible ? 'translateY(0)' : 'translateY(12px)')
  }

  return (
    <div style={{ position: 'fixed', left: 12, right: 12, bottom: 100, zIndex: 60, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
      <div ref={containerRef} style={containerStyle}>
        <div onMouseDown={onPointerDown} onTouchStart={onPointerDown} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '0 auto', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, background: '#60a5fa', borderRadius: 4 }} />
            <strong style={{ letterSpacing: 1 }}>
              {typed}
            </strong>
            <span style={{ color: '#9ca3af', marginLeft: 8 }}>{height > COLLAPSED ? 'Détails' : 'Aperçu'}</span>
          </div>
          <div style={{ position: 'absolute', right: 12, top: 8 }}>
            <button onClick={() => { setClosing(true); setTimeout(()=>{ setClosing(false); onClose && onClose() }, DURATION) }} aria-label="Fermer" style={{ background: 'transparent', border: 'none', color: '#9ca3af' }}>✕</button>
          </div>
        </div>

        <div style={{ overflow: 'auto', padding: 14, height: `calc(100% - 52px)` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, justifyItems: 'center', textAlign: 'center' }}>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Vols</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{total}</div>
            </div>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Types d'appareils</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{aircrafts.length}</div>
            </div>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Aéroports top</div>
              <div style={{ marginTop: 6 }}>
                {topAirports.map(([code, n]) => (
                  <div key={code} style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                    <span>{code}</span>
                    <span style={{ color: '#9ca3af' }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4 style={{ margin: '6px 0' }}>Liste des vols</h4>
            <div style={{ display: 'grid', gap: 8 }}>
              {flights.map(f => (
                <div key={f.id} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{f.dep} → {f.arr}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{f.date} • {f.aircraft}</div>
                    </div>
                    <div style={{ color: '#9ca3af', marginTop: 8 }}>#{f.id}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
