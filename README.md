# ContrailsLog

ContrailsLog — minimal PWA globe for pilot flights

Quick start

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

What I added

- `src/components/Globe.jsx` — 3D globe using `react-globe.gl` with flight arcs
- `src/components/FlightForm.jsx` — simple form to add flights (coordinates, date, times, aircraft)
- Updated `src/App.jsx` to integrate globe, form and a simple list
- PWA support: `public/manifest.webmanifest` and `public/sw.js`, plus meta tags in `index.html`
- Dark mode support and responsive layout in `src/App.css`

Data storage

- Flights are persisted to `localStorage` by default. You can replace this with your own DB by sending the new flight object to your API in `handleAdd` in `src/App.jsx`.

Install on iPhone (without App Store)

- Open the site in Safari, tap the Share button, then "Add to Home Screen". The app will open standalone like a native app.

Next steps I can do for you

- Replace localStorage with Supabase / Postgres or any REST endpoint and show sync examples
- Add airport lookup (ICAO/IATA) and click-to-set coordinates on globe
- Improve visuals: custom globe textures, trail animations, clustering
