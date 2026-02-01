import React, { useState, useEffect } from 'react'

export default function TopBar({ flights = [] }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 520)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - 30)
  const last30Count = flights.filter(f => {
    if (!f.date) return false
    const d = new Date(f.date + 'T00:00:00')
    if (isNaN(d)) return false
    return d >= cutoff && d <= now
  }).length

  const byAircraft = flights.reduce((acc, f) => {
    const k = (f.aircraft || '—').toUpperCase()
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
  const topAircraft = Object.entries(byAircraft).sort((a,b) => b[1]-a[1]).slice(0,3)

  const containerStyle = {
    position: 'fixed',
    left: 12,
    right: 12,
    top: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 8 : 0,
    pointerEvents: 'none',
    zIndex: 70
  }

  const rightStyle = {
    pointerEvents: 'auto',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexDirection: isMobile ? 'column' : 'row',
    marginTop: isMobile ? 6 : 0
  }

  const leftBox = {
    position: 'fixed',
    left: 12,
    top: 12,
    pointerEvents: 'auto',
    background: 'rgba(255,255,255,0.02)',
    padding: '8px 12px',
    borderRadius: 10,
    color: '#9ca3af',
    fontSize: 13,
    zIndex: 70
  }

  const rightBox = {
    position: 'fixed',
    right: 12,
    top: 12,
    pointerEvents: 'auto',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexDirection: isMobile ? 'column' : 'row',
    zIndex: 70
  }

  return (
    <>
      <div style={leftBox}>v1 — Conseils • Dernière sync: locale</div>

      <div style={rightBox}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 10, textAlign: 'center', minWidth: 84 }}>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
            <span>{last30Count}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>vols</span>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>30 derniers jours</div>
        </div>
      </div>
    </>
  )
}
