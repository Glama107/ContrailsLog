import React, { useEffect, useRef, useMemo, useState } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'

export default function GlobeWrapper({ flights = [], initialView = { lat: 48, lng: 10, altitude: 1 }, onGlobeReady }) {
  const globeRef = useRef()
  const [countries, setCountries] = useState(null)
  const [markers, setMarkers] = useState([])
  const rafRef = useRef(null)

  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    // prepare controls
    const controls = g.controls && g.controls()
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.3
      controls.enableDamping = true
      controls.dampingFactor = 0.06
    }

    // set initial view
    try { g.pointOfView(initialView, 800) } catch (e) {}

    // globe material and polygons handled below; nothing else here

    onGlobeReady && onGlobeReady(globeRef)
  }, [])

  // load simplified world geojson (polygons for countries)
  useEffect(() => {
    let mounted = true
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(r => r.json())
      .then(data => { if (mounted && data && data.features) setCountries(data.features) })
      .catch(e => console.warn('failed loading world geojson', e))
    return () => { mounted = false }
  }, [])

  const mat = useMemo(() => new THREE.MeshPhongMaterial({
    color: new THREE.Color(0x2b2b2b),
    flatShading: true,
    shininess: 0,
    specular: new THREE.Color(0x0b0b0b),
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0.0
  }), [])

  const AIRCRAFT_COLORS = {
    A320: '#f97316',
    B738: '#60a5fa',
    A350: '#34d399',
    B787: '#a78bfa',
    B777: '#fb7185',
    DEFAULT: '#9ca3af'
  }

  // convert hex color (#rrggbb) to rgba string with alpha
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(156,163,175,${alpha})`
    const h = hex.replace('#', '')
    const bigint = parseInt(h, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r},${g},${b},${alpha})`
  }

  // simple stable hash for strings -> small integer
  const idHash = (s) => {
    if (!s) return 0
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return h
  }

  // small 3D marker geometry/materials were removed — labels will show airport points

  // when flights change, build a set of unique airport markers and fade them in
  useEffect(() => {
    // collect unique coords from flights (dep/arr) but dedupe by airport code
    const map = {}
    flights.forEach(f => {
      if (f.startLat != null && f.startLng != null) {
        if (!map[f.dep]) map[f.dep] = { code: f.dep, lat: f.startLat, lng: f.startLng }
      }
      if (f.endLat != null && f.endLng != null) {
        if (!map[f.arr]) map[f.arr] = { code: f.arr, lat: f.endLat, lng: f.endLng }
      }
    })
    const list = Object.values(map).map(m => ({ id: m.code, code: m.code, lat: m.lat, lng: m.lng, alpha: 0 }))
    setMarkers(list)

    // animate alpha to 1
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const start = performance.now()
    const duration = 700
    function step(now) {
      const t = Math.min(1, (now - start) / duration)
      setMarkers(prev => prev.map(p => ({ ...p, alpha: Math.min(1, t) })))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [flights])

  const aircraftColor = (code) => {
    if (!code) return AIRCRAFT_COLORS.DEFAULT
    const c = code.toUpperCase()
    for (const key of Object.keys(AIRCRAFT_COLORS)) {
      if (key === 'DEFAULT') continue
      if (c.includes(key)) return AIRCRAFT_COLORS[key]
    }
    return AIRCRAFT_COLORS.DEFAULT
  }

  

  return (
    <Globe
      ref={globeRef}
      width={window.innerWidth}
      height={window.innerHeight}
      backgroundColor="rgba(0,0,0,0)"
      globeMaterial={mat}
      atmosphereColor="#050505"
      atmosphereDaylightAlpha={0.02}
      arcsData={flights}
      arcColor={d => hexToRgba(aircraftColor(d.aircraft), 0.65)}
      arcDashLength={0.25}
      arcDashGap={1.2}
      arcDashAnimateTime={d => {
        const key = d.id || d.dep || d.arr || (d.startLat && d.endLat ? `${d.startLat},${d.endLat}` : '')
        // base 1200ms, plus a pseudo-random offset up to 1800ms to stagger
        return 1200 + (idHash(String(key)) % 1800)
      }}
      arcStroke={0.18}
      /* airport markers removed; relying on labels (with built-in dot) */
      labelsData={markers}
      labelLat={d => d.lat}
      labelLng={d => d.lng}
      labelText={d => d.code}
      labelSize={0.38}
      labelDotRadius={0.08}
      labelColor={d => `rgba(255,255,255,${0.95 * (d.alpha || 0)})`}
      labelAltitude={0.02}
      labelResolution={1}
      polygonsData={countries}
      polygonCapColor={() => '#444444'}
      polygonSideColor={() => '#2e2e2e'}
      polygonStrokeColor={() => 'rgba(0,0,0,0.18)'}
      polygonAltitude={0.007}
      polygonsTransitionDuration={0}
    />
  )
}
