import React, { useState, useEffect, useRef } from 'react';
import GlobeWrapper from './components/GlobeWrapper'
import Controls from './components/Controls'
import FlightModal from './components/FlightModal'
import TopBar from './components/TopBar'
import FilterButton from './components/FilterButton'
import data from './data/data.json'
import StatsPanel from './components/StatsPanel'

function App() {
  const globeEl = useRef();
  const [flights, setFlights] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null)
  const [filters, setFilters] = useState({ mode: 'last30', aircraft: null })

  // 1. Charger les données au démarrage depuis le fichier JSON fourni
  useEffect(() => {
    if (data && data.flights) setFlights(data.flights)
  }, []);

  // 1.5 Préparer les contrôles (désactiver autoRotate : on utilise notre animation)
  useEffect(() => {
    const setupRotation = () => {
      const g = globeEl.current;
      if (!g) return;
      const controls = g.controls && g.controls();
      if (!controls) return;
      controls.autoRotate = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      // Dézoomer légèrement pour voir plus du globe
      try {
        g.pointOfView({ lat: 48, lng: 10, altitude: 3.2 }, 1500);
      } catch (e) {}
    };
    const t = setTimeout(setupRotation, 200);
    return () => {
      clearTimeout(t);
      try {
        const controls = globeEl.current && globeEl.current.controls && globeEl.current.controls();
        if (controls) controls.autoRotate = false;
      } catch (e) {}
    };
  }, []);

  // (oscillation removed)

  // globe material + controls now handled by `GlobeWrapper`

  // note: flights are loaded from bundled JSON; no localStorage read/write

  // signal to main that the app is mounted and ready to hide loader
  useEffect(() => {
    try { window.dispatchEvent(new Event('app-mounted')) } catch (e) {}
  }, [])

  // no theme toggle — app uses dark theme

  const handleAddFlight = (payload) => {
    const depCode = (payload.dep || payload.from || '').toUpperCase();
    const arrCode = (payload.arr || payload.to || '').toUpperCase();
    const origin = (data && data.airports && data.airports[depCode]) || null;
    const dest = (data && data.airports && data.airports[arrCode]) || null;

    if (!origin || !dest) {
      alert("Code ICAO non reconnu dans la base locale (ex: LFPG, KJFK...)");
      return;
    }

    const newFlight = {
      id: Date.now(),
      date: payload.date || '',
      aircraft: payload.aircraft || '',
      dep: depCode,
      arr: arrCode,
      startLat: origin.lat,
      startLng: origin.lng,
      endLat: dest.lat,
      endLng: dest.lng
    };

    setFlights(prev => [...prev, newFlight]);
    setIsDrawerOpen(false);

    // Orienter le globe vers le nouveau trajet
    try { globeEl.current.pointOfView({ lat: origin.lat, lng: origin.lng, altitude: 2 }, 1000); } catch (e) {}
  };

  function handleEditInitiate(flight) {
    setEditingFlight(flight)
    setIsDrawerOpen(true)
  }

  function handleSaveFlight(payload) {
    // payload contains id
    setFlights(prev => prev.map(f => f.id === payload.id ? { ...f, ...payload } : f))
    setEditingFlight(null)
    setIsDrawerOpen(false)
  }

  function handleDeleteFlight(id) {
    setFlights(prev => prev.filter(f => f.id !== id))
  }

  function handleSelectFilter(mode, value = null) {
    if (mode === 'all') setFilters({ mode: 'all', aircraft: null })
    else if (mode === 'thisMonth') setFilters({ mode: 'thisMonth', aircraft: null })
    else if (mode === 'lastMonth') setFilters({ mode: 'lastMonth', aircraft: null })
    else if (mode === 'last30') setFilters({ mode: 'last30', aircraft: null })
    else if (mode === 'aircraft') setFilters({ mode: 'aircraft', aircraft: value })
    else setFilters({ mode: 'all', aircraft: null })
  }

  const now = new Date()
  function matchesFilter(f) {
    if (!f) return false
    if (filters.mode === 'all') return true
      if (filters.mode === 'last30') {
        if (!f.date) return false
        const d = new Date(f.date + 'T00:00:00')
        const now = new Date()
        const cutoff = new Date(now)
        cutoff.setDate(cutoff.getDate() - 30)
        return d >= cutoff && d <= now
      }
    if (filters.mode === 'thisMonth') {
      if (!f.date) return false
      const d = new Date(f.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }
    if (filters.mode === 'lastMonth') {
      if (!f.date) return false
      const d = new Date(f.date)
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return d.getFullYear() === last.getFullYear() && d.getMonth() === last.getMonth()
    }
    if (filters.mode === 'aircraft') {
      if (!filters.aircraft) return true
      return (f.aircraft || '').toUpperCase() === (filters.aircraft || '').toUpperCase()
    }
    return true
  }

  const visibleFlights = flights.filter(matchesFilter)

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden font-sans">
      
      {/* GLOBE 3D */}
      <div className="absolute inset-0 z-10">
        <GlobeWrapper flights={visibleFlights} onGlobeReady={(ref) => { try { globeEl.current = ref.current } catch (e) {} }} />
      </div>

      <TopBar flights={flights} />
      <FilterButton flights={flights} onSelect={handleSelectFilter} selected={filters} />

      <Controls
        onOpenAdd={() => setIsDrawerOpen(true)}
        onClear={() => { if (confirm('Effacer tout ?')) setFlights([]) }}
        onShowList={() => alert(`${flights.length} vols enregistrés.`)}
        onOpenStats={() => setIsStatsOpen(true)}
        flights={flights}
        onEdit={handleEditInitiate}
        onDelete={handleDeleteFlight}
      />

      <FlightModal isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setEditingFlight(null) }} onAdd={handleAddFlight} initialData={editingFlight} onSave={handleSaveFlight} />
      <StatsPanel isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} flights={visibleFlights} onEdit={handleEditInitiate} onDelete={handleDeleteFlight} />
    </div>
  );
}

export default App;