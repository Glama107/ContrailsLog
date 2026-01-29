import React, { useState, useEffect } from 'react'

export default function FlightModal({ isOpen, onClose, onAdd, initialData = null, onSave }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [dep, setDep] = useState('')
  const [arr, setArr] = useState('')
  const [aircraft, setAircraft] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const [mounted, setMounted] = useState(isOpen)
  const [state, setState] = useState(isOpen ? 'entered' : 'exited') // 'entering'|'entered'|'exiting'|'exited'
  const DURATION = 220

  useEffect(() => {
    let timeout
    if (isOpen) {
      setMounted(true)
      setState('entering')
      // next tick -> entered
      timeout = setTimeout(() => setState('entered'), 20)
    } else if (mounted) {
      setState('exiting')
      timeout = setTimeout(() => { setState('exited'); setMounted(false) }, DURATION)
    }
    return () => clearTimeout(timeout)
  }, [isOpen])

  // populate form when editing
  useEffect(() => {
    if (!initialData) {
      setFrom('')
      setTo('')
      setDate('')
      setDep('')
      setArr('')
      setAircraft('')
      return
    }
    setFrom(initialData.dep || initialData.from || '')
    setTo(initialData.arr || initialData.to || '')
    setDate(initialData.date || '')
    setDep(initialData.depTime || initialData.dep || '')
    setArr(initialData.arrTime || initialData.arr || '')
    setAircraft(initialData.aircraft || '')
  }, [initialData, isOpen])

  if (!mounted) return null

  function submit(e) {
    e.preventDefault()
    const payload = { dep: from, arr: to, date, depTime: dep, arrTime: arr, aircraft }
    if (initialData && onSave) {
      onSave({ ...payload, id: initialData.id })
    } else {
      onAdd({ from, to, date, dep, arr, aircraft })
    }
    setFrom('')
    setTo('')
    setDate('')
    setDep('')
    setArr('')
    setAircraft('')
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />
      <form onSubmit={submit} aria-label="Ajouter un vol" style={{ position: 'relative', width: 'min(720px, 92%)', background: '#0b0b0d', borderRadius: 14, padding: '22px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', color: 'white', zIndex: 62, transition: `transform ${DURATION}ms ease, opacity ${DURATION}ms ease`, transform: state === 'entered' ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.985)', opacity: state === 'entered' ? 1 : 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Ajouter un vol</h3>
          <button type="button" onClick={onClose} aria-label="Fermer" style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#9ca3af' }}>
            Départ (ICAO)
            <input value={from} onChange={e => setFrom(e.target.value.toUpperCase())} placeholder="LFPG" style={{ marginTop: 6, padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'white', outline: 'none', transition: 'box-shadow 120ms' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#9ca3af' }}>
            Arrivée (ICAO)
            <input value={to} onChange={e => setTo(e.target.value.toUpperCase())} placeholder="LFMN" style={{ marginTop: 6, padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'white', outline: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: 12, color: '#9ca3af' }}>
            Date
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'white' }} />
          </label>

          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: 12, color: '#9ca3af' }}>
            Avion
            <input value={aircraft} onChange={e => setAircraft(e.target.value)} placeholder="A320" style={{ marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'white' }} />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#9ca3af' }}>
            Heure départ
            <input type="time" value={dep} onChange={e => setDep(e.target.value)} style={{ marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'white' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#9ca3af' }}>
            Heure arrivée
            <input type="time" value={arr} onChange={e => setArr(e.target.value)} style={{ marginTop: 6, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'white' }} />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 14px', borderRadius: 10, background: 'transparent', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.04)' }}>Annuler</button>
          <button type="submit" style={{ padding: '10px 16px', borderRadius: 10, background: '#2563eb', color: 'white', border: 'none', fontWeight: 700 }}>Enregistrer</button>
        </div>
      </form>
    </div>
  )
}
