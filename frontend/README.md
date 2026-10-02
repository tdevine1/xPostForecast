# Sprint 3 Frontend: Fetching and Mapping Real Data

> This is the **reference implementation** for Sprint 3's frontend. Keep building in the `frontend/` you created in earlier sprints; don't clone or fork this one.

This React (Vite) frontend provides:

- Login and registration using an HTTP-only cookie (from Sprint 2)
- **New:** a shared axios client, `src/api.js`, used for every backend call
- **New:** a real **Fetch Data** that loads a month of West Virginia temperatures from the backend and draws them on a Leaflet map, colored with `chroma-js`
- **New:** on-page error messages, and an automatic return to `/login` when the session has expired

Setup (Node.js 24 LTS, `frontend/.env` with `VITE_BACKEND_API_URL`) is the same as Sprint 2.

```bash
cd frontend
npm install      # picks up the new dependency: chroma-js
npm run dev      # http://localhost:5173
```

---

## Tech Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router
- **HTTP client**: axios, through the shared instance in `src/api.js`
- **Mapping**: Leaflet + React-Leaflet
- **Color scale**: `chroma-js`
- **Loading indicator**: `react-spinners` (`ClipLoader`)
- **Tests**: Vitest + Testing Library

---

## Folder Structure

```text
frontend/
├── .env.example           # VITE_BACKEND_API_URL=http://localhost:5175
└── src/
    ├── api.js             # shared axios instance   ← new
    ├── App.jsx            # routes + session check (now via api.get)
    ├── App.test.jsx       # session + data-fetch tests
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── DateSelector.jsx (+ DateSelector.test.jsx)
    │   └── MapComponent.jsx   # color scale + canvas rendering
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        └── MapPage.jsx        # real data fetch
```

---

## Shared HTTP Client (`src/api.js`)

Every backend call goes through one preconfigured axios instance:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL, // e.g. http://localhost:5175
  withCredentials: true,                         // send/receive the HTTP-only auth cookie
});

export default api;
```

- The backend address comes from `VITE_BACKEND_API_URL` and nothing else, so pointing the app at a different backend (as Sprint 4 does for Azure) means changing one variable.
- `withCredentials: true` is set once, so no request can forget to send the cookie.
- Pages call `api.get('/temperature/2020-07-01')` or `api.post('/auth/login', …)` with just the path.

---

## App-Level Routing and Auth (`src/App.jsx`)

- On startup, `api.get('/auth/test')`: success means logged in; any error (`401`, or backend unreachable) means logged out. While it waits, the app shows "Checking your session…".
- Routes: `/` redirects; `/login` and `/register` redirect to `/map` when logged in; `/map` redirects to `/login` when not.

Note the change from Sprint 2: `fetch` resolves for every status (you check `res.ok`), but **axios throws for any non-2xx status**, so "logged in" is decided by whether `api.get` succeeds or throws.

---

## Map Page (`src/pages/MapPage.jsx`)

State:

| State | Meaning |
|---|---|
| `date` | `'YYYY-MM-01'` from `DateSelector` |
| `temperatureData` | array of `{ lat, lon, tavg }` passed to the map |
| `isLoading` | shows the spinner while a request is running |
| `error` | message shown under the selectors, or `''` |

**Fetch Data** flow:

1. No date chosen yet → show "Please select a month and year."
2. `` api.get(`/temperature/${date}`) ``
3. Success → `temperatureData` is the returned array; `MapComponent` redraws.
4. `401` → the session has expired: set `authenticated` to `false` and go to `/login`.
5. Any other error → empty the map and show the backend's message (`404` "No temperature data is available for 2022-12", `502` "The temperature data service is unavailable…"), or "Could not reach the server" if there was no response at all.

**Logout** calls `api.post('/auth/logout')` and returns to `/login`, even if the request fails.

The first request for a month can take several seconds (the backend goes out to Planetary Computer); the backend caches each month, so repeat requests are fast.

---

## Date Selection (`src/components/DateSelector.jsx`)

- Month and year dropdowns; years 1895–2022 (newest first), the range Planetary Computer has.
- Calls `onDateChange('YYYY-MM-01')` once both are chosen, and `fetchTemperatureData()` on **Fetch Data**.
- Planetary Computer's copy ends in **September 2022**; October–December 2022 produce the "no data" message.

---

## Map Visualization (`src/components/MapComponent.jsx`)

- `MapContainer` centered on West Virginia (zoom 7) with OpenStreetMap tiles.
- One `CircleMarker` per point (radius 25 px, no outline, so neighbors blend into a continuous surface), with a popup showing latitude, longitude, and temperature.
- Color: a `chroma-js` scale from dark blue (−10 °F) through yellow to dark red (110 °F):

  ```js
  const scale = chroma
    .scale(['#002366', '#4169E1', '#87CEEB', '#FFFF66', '#FFD700', '#FF4500', '#B22222'])
    .domain([-10, 110]);
  ```

- `preferCanvas` makes Leaflet draw all ~9,700 circles on one `<canvas>` instead of creating ~9,700 SVG elements, which is much faster.

The backend already converts to °F, so `tavg` is display-ready.

---

## Data Flow: Date → Backend → Map

1. User picks a month and year in `DateSelector`; `MapPage` stores `'2020-07-01'`.
2. User clicks **Fetch Data**; `MapPage` calls `api.get('/temperature/2020-07-01')` (cookie included).
3. The backend checks the cookie, then (on a cache miss) searches the STAC API, signs the GeoTIFF URL, reads the West Virginia window, and returns about 9,700 `{ lat, lon, tavg }` points. See [`../backend/README.md`](../backend/README.md).
4. `MapPage` stores the array; `MapComponent` draws it.

---

## Tests

```bash
npm test
npm run lint
```

`App.test.jsx` replaces the `api` module with a mock and checks: a valid session stays on `/map` after a refresh; a logged-out visitor is sent to `/login`; Fetch Data requests the chosen month and hands the points to the map; a `404` shows the backend's message; an expired session (`401`) returns to `/login`.

---

## Build

```bash
npm run build    # production bundle in dist/
```

`VITE_BACKEND_API_URL` is baked into the bundle **at build time**. In Sprint 4, GitHub Actions sets it to the Azure backend's URL before building.
