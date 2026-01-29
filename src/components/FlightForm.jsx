import React, { useState } from 'react'

function numberOrNaN(v) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : NaN
}

export default function FlightForm({ onAdd }) {
  const [originLat, setOriginLat] = useState('')
  const [originLng, setOriginLng] = useState('')
  const [destLat, setDestLat] = useState('')
  const [destLng, setDestLng] = useState('')
  const [date, setDate] = useState('')
  const [departTime, setDepartTime] = useState('')
  const [arriveTime, setArriveTime] = useState('')
  const [aircraft, setAircraft] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const oLat = numberOrNaN(originLat)
    const oLng = numberOrNaN(originLng)
    const dLat = numberOrNaN(destLat)
    const dLng = numberOrNaN(destLng)
    if ([oLat, oLng, dLat, dLng].some(Number.isNaN)) {
      alert('Veuillez entrer des coordonnées valides (ex: 48.8566 ou -0.1276)')
      return
    }
    const flight = {
      id: Date.now(),
      origin: { lat: oLat, lng: oLng },
      dest: { lat: dLat, lng: dLng },
      date,
      departTime,
      arriveTime,
      aircraft
    }
    onAdd && onAdd(flight)
    setOriginLat('')
    setOriginLng('')
    setDestLat('')
    setDestLng('')
    setDate('')
    setDepartTime('')
    setArriveTime('')
    setAircraft('')
  }

  return (
    <form className="flight-form" onSubmit={handleSubmit}>
      <div className="row">
        <label>Origine (lat)</label>
        <input value={originLat} onChange={e => setOriginLat(e.target.value)} placeholder="48.8566" />
        <label>Origine (lng)</label>
        <input value={originLng} onChange={e => setOriginLng(e.target.value)} placeholder="2.3522" />
      </div>
      <div className="row">
        <label>Destination (lat)</label>
        <input value={destLat} onChange={e => setDestLat(e.target.value)} placeholder="51.5074" />
        <label>Destination (lng)</label>
        <input value={destLng} onChange={e => setDestLng(e.target.value)} placeholder="-0.1278" />
      </div>
      <div className="row">
        <label>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <label>Avion</label>
        <input value={aircraft} onChange={e => setAircraft(e.target.value)} placeholder="A320" />
      </div>
      <div className="row">
        <label>Depart</label>
        <input type="time" value={departTime} onChange={e => setDepartTime(e.target.value)} />
        <label>Arrivee</label>
        <input type="time" value={arriveTime} onChange={e => setArriveTime(e.target.value)} />
      </div>
      <div className="actions">
        <button type="submit">Ajouter le vol</button>
      </div>
    </form>
  )
}
