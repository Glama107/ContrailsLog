import React, { useState, useRef, useEffect } from 'react'

export default function FilterButton({ flights = [], onSelect = () => {}, selected = { mode: 'all', aircraft: null } }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const aircrafts = Array.from(new Set(flights.map(f => (f.aircraft || '').toUpperCase()).filter(Boolean)))

  const menuBase = {
    position: 'absolute',
    right: 0,
    bottom: 'calc(100% + 10px)',
    background: '#0b0b0d',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 8,
    minWidth: 160,
    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
    transformOrigin: 'bottom right',
    transition: 'opacity 180ms ease, transform 160ms ease',
    zIndex: 90
  }

  const menuOpenStyle = { opacity: 1, transform: 'translateY(0) scale(1)' }
  const menuClosedStyle = { opacity: 0, transform: 'translateY(6px) scale(0.98)', pointerEvents: 'none' }

  const itemStyle = (active) => ({
    textAlign: 'left',
    background: active ? '#1f6feb' : 'transparent',
    color: active ? 'white' : '#9ca3af',
    border: 'none',
    padding: '6px 8px',
    borderRadius: 8,
    width: '100%'
  })

  return (
    <div ref={ref} style={{ position: 'fixed', right: 18, bottom: 110, zIndex: 80, pointerEvents: 'auto' }}>
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label="Filtres" style={{ background: 'rgba(255,255,255,0.03)', color: '#9ca3af', border: 'none', padding: 10, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', position: 'relative', zIndex: 95 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div style={{ ...menuBase, ...(open ? menuOpenStyle : menuClosedStyle), pointerEvents: open ? 'auto' : 'none' }} role="menu" aria-hidden={!open}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={() => { onSelect('all'); setOpen(false) }} style={itemStyle(selected.mode === 'all')}>Tous</button>
            <button onClick={() => { onSelect('thisMonth'); setOpen(false) }} style={itemStyle(selected.mode === 'thisMonth')}>Ce mois</button>
            <button onClick={() => { onSelect('lastMonth'); setOpen(false) }} style={itemStyle(selected.mode === 'lastMonth')}>Mois dernier</button>
            <button onClick={() => { onSelect('last30'); setOpen(false) }} style={itemStyle(selected.mode === 'last30')}>30 derniers jours</button>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 8 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Par appareil</div>
              {aircrafts.length ? aircrafts.map(a => (
                <button key={a} onClick={() => { onSelect('aircraft', a); setOpen(false) }} style={itemStyle(selected.mode === 'aircraft' && selected.aircraft === a)}>{a}</button>
              )) : <div style={{ fontSize: 12, color: '#444' }}>—</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
