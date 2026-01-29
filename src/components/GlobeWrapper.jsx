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

  // when flights change, build a set of unique airport markers and fade them in
  useEffect(() => {
    // collect unique coords from flights (dep/arr)
    const map = {}
    flights.forEach(f => {
      if (f.startLat != null && f.startLng != null) map[`${f.dep}_${f.startLat}_${f.startLng}`] = { code: f.dep, lat: f.startLat, lng: f.startLng }
      if (f.endLat != null && f.endLng != null) map[`${f.arr}_${f.endLat}_${f.endLng}`] = { code: f.arr, lat: f.endLat, lng: f.endLng }
    })
    const list = Object.values(map).map((m, i) => ({ id: `${m.code}_${i}`, code: m.code, lat: m.lat, lng: m.lng, alpha: 0 }))
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
      arcColor={d => aircraftColor(d.aircraft)}
      arcDashLength={0.4}
      arcDashGap={1}
      arcDashAnimateTime={2000}
      arcStroke={0.7}
      pointsData={markers}
      pointLat={d => d.lat}
      pointLng={d => d.lng}
      pointColor={d => `rgba(96,165,250,${d.alpha || 0})`}
      pointRadius={d => 0.35 + (d.alpha || 0) * 0.25}
      pointAltitude={0.01}
      pointsMerge={true}
      labelsData={markers}
      labelLat={d => d.lat}
      labelLng={d => d.lng}
      labelText={d => d.code}
      labelSize={1}
      labelDotRadius={0.35}
      labelColor={d => `rgba(255,255,255,${d.alpha || 0})`}
      labelAltitude={0.015}
      labelResolution={2}
      polygonsData={countries}
      polygonCapColor={() => '#444444'}
      polygonSideColor={() => '#2e2e2e'}
      polygonStrokeColor={() => 'rgba(0,0,0,0.18)'}
      polygonAltitude={0.007}
      polygonsTransitionDuration={0}
    />
  )
}
