import React, { useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    return false
  }
}

export default function Globe3D({ flights = [], dark = false }) {
  const globeRef = useRef()
  const [webgl, setWebgl] = useState(true)

  useEffect(() => {
    setWebgl(isWebGLAvailable())
  }, [])

  useEffect(() => {
    if (!webgl) return
    const g = globeRef.current
    if (!g) return
    const controls = g.controls()
    if (controls) {
      controls.autoRotate = false
      controls.enableDamping = true
    }
    g.pointOfView({ lat: 20, lng: 0, altitude: 2 })
  }, [webgl])

  const arcsData = (flights || []).map(f => ({
    startLat: f.origin.lat,
    startLng: f.origin.lng,
    endLat: f.dest.lat,
    endLng: f.dest.lng,
    color: dark ? ['#00ffd0'] : ['#ff8a00'],
    name: `${f.date} ${f.aircraft || ''}`
  }))

  if (!webgl) {
    return (
      <div className="globe-fallback" style={{ height: '60vh' }}>
        <div className="globe-fallback-inner">
          <img src="https://unpkg.com/three-globe/example/img/earth-day.jpg" alt="Earth" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
          <p>Globe 3D non disponible (WebGL requis). Ouvrez dans Safari pour une meilleure compatibilité.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '70vh', width: '100%' }}>
      <Globe
        ref={globeRef}
        globeImageUrl={
          dark
            ? 'https://unpkg.com/three-globe/example/img/earth-night.jpg'
            : 'https://unpkg.com/three-globe/example/img/earth-day.jpg'
        }
        backgroundColor={dark ? '#05060a' : '#eaf6ff'}
        arcsData={arcsData}
        arcColor={d => d.color}
        arcStroke={0.9}
        arcDashLength={0.4}
        arcDashGap={0.6}
        arcDashAnimateTime={d => {
          const key = d.name || (d.startLat && d.endLat ? `${d.startLat},${d.endLat}` : '')
          let h = 0
          for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
          return 1200 + (h % 1800)
        }}
      />
    </div>
  )
}
