# Frontend (React / Vite)

This folder contains the React frontend for **xPostForecast**. It provides:

- A login and registration flow using an HTTP-only cookie for auth.
- A map-based UI (Leaflet) that visualizes historical monthly average temperatures over West Virginia.
- A date selector that drives calls to the backend STAC temperature endpoint.
- A consolidated Axios instance in `src/api.js` that centralizes the backend base URL and cookie handling.

---

## Tech Stack

- **Framework**: React (Vite)
- **Routing**: React Router
- **HTTP client**: Axios (shared instance in `src/api.js`)
- **Mapping**: Leaflet + React-Leaflet
- **Color scales**: `chroma-js`
- **Loading indicators**: `react-spinners` (e.g., `ClipLoader`)

---

## Folder Structure

```text
frontend_src/
└── src/
    ├── App.css
    ├── App.jsx            # Top-level router & auth gate
    ├── api.js             # Shared Axios instance
    ├── assets/
    │   └── react.svg
    ├── components/
    │   ├── DateSelector.jsx
    │   └── MapComponent.jsx
    ├── index.css
    ├── main.jsx           # React entry point
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        └── MapPage.jsx
```

You will also typically have a `.env` file at the frontend project root:

```ini
VITE_BACKEND_API_URL=http://localhost:5175
```

---

## Shared HTTP Client (`src/api.js`)

All backend calls should go through the shared Axios instance `src/api.js`:

```js
// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL, // e.g., http://localhost:5175 or deployed API
  withCredentials: true,                         // send/receive HTTP-only auth cookie
});

export default api;
```

Key points:

- The `baseURL` is controlled entirely by `VITE_BACKEND_API_URL`.
- `withCredentials: true` ensures the browser sends/receives the auth cookie on every request.
- If you add Axios interceptors (for logging, automatic 401 handling, etc.), do it here so all requests share the same behavior.

Components and pages (e.g., `Login.jsx`, `Register.jsx`, `MapPage.jsx`) should import this `api` instance instead of using `axios` directly.

---

## App-Level Routing and Auth (`src/App.jsx`)

`App.jsx`:

- Defines the client-side routes using React Router:
  - `/login` – Login page.
  - `/register` – Registration page.
  - `/` (or `/map`) – Main map page, behind an auth gate.
- Manages an `authenticated` state used to protect routes.
- On initial load, calls a backend endpoint (such as `/auth/test`) using `api.get(...)` to determine whether the current cookie represents a valid session.

High-level logic:

1. On mount, call the backend test endpoint:
   - If the call succeeds, set `authenticated = true` and allow access to protected routes.
   - If it fails with 401/403, redirect the user to `/login`.

2. When the user logs in successfully:
   - Set `authenticated = true` and navigate to the map page.

3. When the user logs out:
   - Call the backend logout endpoint.
   - Set `authenticated = false` and navigate to `/login`.

---

## Login Page (`src/pages/Login.jsx`)

`Login.jsx`:

- Renders a username/email and password form.
- On submit:
  - Sends a POST request to `/auth/login` via `api.post(...)`.
  - Expects the backend to set an HTTP-only cookie.
  - On success, updates `authenticated` state and navigates to the map.

It also shows validation or error messages when login fails and provides a link to the registration page for new users.

---

## Register Page (`src/pages/Register.jsx`)

`Register.jsx`:

- Presents a form for creating a new account (e.g., email/username + password).
- On submit:
  - Sends a POST request to `/auth/register` via `api.post(...)`.
  - On success, redirects to `/login` so the user can log in with the new credentials.

Using the shared `api` instance keeps configuration (base URL, credentials) consistent.

---

## Map Page (`src/pages/MapPage.jsx`)

`MapPage.jsx` is the main application view:

- Displays the `DateSelector` component for choosing the year/month.
- Provides a button to fetch temperature data for the selected date.
- Manages loading state and error messages.
- Renders the `MapComponent` with the data returned from the backend.
- Includes a logout button that calls the backend’s logout endpoint and sends the user back to `/login`.

Typical state in `MapPage`:

- `selectedYear` and `selectedMonth` (or a combined `selectedDate`).
- `temperatureData`: an array of `{ lat, lon, tavg }` objects.
- `isLoading`: a boolean used to toggle the loading indicator.
- `error`: a string to display when something goes wrong.

Typical flow:

1. User selects a year and month in `DateSelector`.
2. User clicks “Fetch Data” (or similar).
3. `MapPage` calls a backend STAC route using `api.get(...)` or `api.post(...)`, passing the selected date.
4. On success, `temperatureData` is set with the returned array.
5. `MapComponent` receives `temperatureData` as a prop and renders it on the map.
6. On failure:
   - 401/403 responses are treated as session expiration, and the user is redirected to `/login`.
   - Other errors show a generic error message.

---

## Date Selection (`src/components/DateSelector.jsx`)

`DateSelector.jsx`:

- Encapsulates the UI for selecting a year and month.
- Accepts props for the current selection and an `onChange` callback.
- When the user changes the year or month, calls `onChange` with the new values so `MapPage` can update its state.

This separation makes it easy to change the date UI without touching the map or backend logic.

---

## Map Visualization (`src/components/MapComponent.jsx`)

`MapComponent.jsx` uses React-Leaflet to render a Leaflet map:

- Imports `MapContainer`, `TileLayer`, and `CircleMarker` from `react-leaflet`.
- Expects a prop such as `data` or `temperatures` containing an array of:

  ```ts
  {
    lat: number;
    lon: number;
    tavg: number; // Fahrenheit
  }
  ```

- Uses `chroma-js` to turn `tavg` values into colors (for example, cool blues for lower temps and warmer reds for higher temps).
- For each point, renders a `CircleMarker` with:
  - A radius (fixed or scaled with temperature).
  - A fill color derived from `tavg`.
  - A popup showing the latitude, longitude, and temperature (e.g., `"54.3 °F"`).

Because the backend already converts Celsius to Fahrenheit, the frontend can treat `tavg` as display-ready.

---

## Data Flow: Date → STAC API → Map

End-to-end data flow:

1. User selects a date in `DateSelector`.
2. `MapPage` updates its state with the selected date.
3. User triggers a fetch (e.g., clicks a button).
4. `MapPage` sends a request to the backend STAC endpoint using `api` and includes the selected date in the request.
5. Backend `routes/stac.js`:
   - Calls the Planetary Computer STAC API.
   - Signs and fetches the relevant nClimGrid COG.
   - Samples a grid of points over West Virginia.
   - Returns an array of `{ lat, lon, tavg }` values.
6. `MapPage` sets `temperatureData` based on the response.
7. `MapComponent` receives `temperatureData` as a prop and renders markers on the map.

---

## Running the Frontend Locally

1. Install dependencies:

   ```bash
   cd frontend_src
   npm install
   ```

2. Create a `.env` file in the frontend project root:

   ```ini
   VITE_BACKEND_API_URL=http://localhost:5175
   ```

3. Start the Vite dev server:

   ```bash
   npm run dev
   ```

4. Open the printed URL (usually `http://localhost:5173`) in your browser.

---

## Build and Deployment

To build the static frontend:

```bash
npm run build
```

This creates a production-ready bundle in `dist/`. For deployment:

- Deploy `dist/` to Azure Static Web Apps or another static hosting provider.
- Configure the environment so that `VITE_BACKEND_API_URL` points to the deployed backend API (for example, your Azure App Service URL).

Because all HTTP calls go through `src/api.js`, updating this one environment variable is enough to point the frontend at a different backend.
