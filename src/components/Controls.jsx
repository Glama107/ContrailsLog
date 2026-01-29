import React, { useRef, useState, useEffect } from 'react'
import { Plus, List, Trash2, BarChart, Edit2 } from 'lucide-react'

export default function Controls({ onOpenAdd, onClear, onShowList, onOpenStats, flights = [], onEdit = () => {}, onDelete = () => {} }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)

  // previously attached a global click listener to close the menu when clicking outside
  // removing that behavior to avoid unexpected immediate closures

  const menuBase = {
    position: 'absolute',
    left: 0,
    bottom: 'calc(100% + 10px)',
    background: '#0b0b0d',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 8,
    minWidth: 220,
    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
    transformOrigin: 'bottom left',
    transition: 'opacity 160ms ease, transform 140ms ease',
    zIndex: 60
  }

  const menuOpenStyle = { opacity: 1, transform: 'translateY(0) scale(1)' }
  const menuClosedStyle = { opacity: 0, transform: 'translateY(6px) scale(0.98)', pointerEvents: 'none' }

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 24, zIndex: 40, display: 'flex', justifyContent: 'center', pointerEvents: 'auto', padding: '0 12px' }}>
      <div style={{ width: '100%', maxWidth: 720, display: 'flex', gap: 12, alignItems: 'center', padding: '8px 12px', borderRadius: 9999, background: 'transparent', border: 'none', boxShadow: 'none' }}>

        {/* left group: two items */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label="Modifier / Supprimer" style={{ padding: 10, borderRadius: 12, background: 'transparent', border: 'none', color: 'white' }}>
              <Edit2 size={18} />
            </button>

            <div style={{ ...menuBase, ...(open ? menuOpenStyle : menuClosedStyle), pointerEvents: open ? 'auto' : 'none' }} role="menu" aria-hidden={!open}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {flights.length ? flights.map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 700 }}>{f.dep} → {f.arr}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{f.date} • {f.aircraft}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { onEdit(f); setOpen(false) }} aria-label="Modifier" style={{ background: 'transparent', border: 'none', color: '#60a5fa' }}><Edit2 size={16} /></button>
                      <button onClick={() => { if (confirm('Supprimer ce vol ?')) { onDelete(f.id); setOpen(false) } }} aria-label="Supprimer" style={{ background: 'transparent', border: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                )) : <div style={{ color: '#9ca3af' }}>Aucun vol</div>}
              </div>
            </div>
          </div>
        </div>

        {/* center + big button */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={onOpenAdd} aria-label="Ajouter un vol" style={{ padding: 14, borderRadius: 16, background: '#2563eb', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 64, minHeight: 64 }}>
            <Plus size={26} />
          </button>
        </div>

        {/* right group: two items */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button onClick={onOpenStats} aria-label="Statistiques" style={{ padding: 8, borderRadius: 10, background: 'transparent', border: 'none', color: 'white' }}>
            <BarChart size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
