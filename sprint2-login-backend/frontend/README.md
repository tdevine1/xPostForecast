# Sprint 2 Frontend: Authentication & Integration Guide

In **Sprint 2**, the React (Vite) frontend integrates with the backend using **cookie‑based JWT authentication**. 
Instead of using `localStorage`, the backend sets an **HTTP‑only cookie** on login, and the frontend verifies the session via `/auth/test`.

> This README applies to the `sprint2-login-backend/frontend` folder — the **reference implementation**. Keep building in the `frontend/` you created in Sprint 1; don't clone or fork this one.

---

## 📂 Frontend Folder Structure

```bash
frontend/
├── src/
│   ├── components/
│   │   ├── MapComponent.jsx
│   │   └── DateSelector.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx           # POST /auth/login (withCredentials)
│   │   ├── Register.jsx        # POST /auth/register (email, username, password)
│   │   └── MapPage.jsx         # Protected page + /auth/logout
│   │
│   ├── App.jsx                 # Checks /auth/test on load
│   └── main.jsx                # Vite bootstrap
│
├── .env.example                # sample frontend env
└── index.html
```
> Actual filenames may vary slightly; this reflects the Sprint 2 reference implementation.

---

## 🛠 Prerequisites

- **Node.js** 20.19+
- **Vite** (bundled via npm scripts)
- Running backend at `http://localhost:5175` (or update URL below)

---

## 1) Clone & Install

```bash
cd sprint2-login-backend/frontend
npm install
```

---

## 2) Configure Environment Variables

Copy the sample and point it to your backend:

```bash
cp .env.example .env
```

```ini
VITE_API_URL=http://localhost:5175
```

> The frontend uses this base URL for all auth calls (e.g., `${VITE_API_URL}/auth/login`).
> **Do not commit** `.env` (already in `.gitignore`).

---

## 3) Cookie‑Based Authentication (How it works)

- On **Login**, the backend sets a **JWT cookie** with `httpOnly: true` (unreadable by JS).
- On page load (or route change), the frontend calls **`GET /auth/test`** to check whether a valid cookie is present.
- The frontend **must send credentials** with each request so the browser includes the cookie:
  - Axios: `{ withCredentials: true }`
  - fetch: `{ credentials: 'include' }`
- On **Logout**, the frontend calls **`POST /auth/logout`**, and the backend clears the cookie.

---

## 4) Component Responsibilities

| Component | Responsibilities |
|----------|-------------------|
| `App.jsx` | On mount, calls `/auth/test` with `credentials` to set `authenticated`. Routes `/`, `/login`, `/register`, `/map`. |
| `pages/Login.jsx` | Sends `POST /auth/login` with `{ username, password }`, using `withCredentials: true`. On success, navigate to `/map`. |
| `pages/Register.jsx` | Sends `POST /auth/register` with `{ email, username, password }`. On success, navigate to `/login`. |
| `pages/MapPage.jsx` | Protected page. Example protected fetch pattern included. Provides a **Logout** button that calls `POST /auth/logout`. |
| `components/DateSelector.jsx` | UI for selecting the target month (YYYY-MM). Calls a passed `fetchTemperatureData` handler. |
| `components/MapComponent.jsx` | Renders map and temperature overlays (stub in Sprint 2). |

---

## 5) Auth Call Patterns (Examples)

**Axios Login (cookie‑based):**
```js
await axios.post(
  `${import.meta.env.VITE_API_URL}/auth/login`,
  { username, password },
  { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
);
```

**Session Verify in `App.jsx`:**
```js
await fetch(`${import.meta.env.VITE_API_URL}/auth/test`, {
  method: 'GET',
  credentials: 'include'
});
```

**Logout in `MapPage.jsx`:**
```js
await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, null, {
  withCredentials: true
});
```

**Protected Fetch Pattern (e.g., later Sprint endpoints):**
```js
try {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/protected`, { withCredentials: true });
  // handle res.data
} catch (err) {
  if (err?.response?.status === 401 || err?.response?.status === 403) {
    // session expired → redirect to /login
  }
}
```

---

## 6) Run the Frontend

```bash
npm run dev
```
Vite default: `http://localhost:5173`

> Ensure the backend’s `.env` has `FRONTEND_URL=http://localhost:5173` and CORS is enabled with `credentials: true`.

---

## 7) Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `403 /auth/test` on reload | No cookie yet | Normal before login; log in first |
| Login returns 200 but still “not logged in” | Cookies not accepted | Add `withCredentials: true` (Axios) / `credentials: 'include'` (fetch); check backend CORS |
| `TypeError: Failed to fetch` | Wrong `VITE_API_URL` or backend down | Start backend and verify URL |
| Redirect loops to `/login` | `/auth/test` failing | Check JWT secret, cookie name `token`, and CORS setup |
| Registration 500 w/ `ER_NO_DEFAULT_FOR_FIELD 'email'` | Backend requires email | Ensure `Register.jsx` sends `{ email, username, password }` and DB has `email` column |

---

## 📚 References

- React Router: https://reactrouter.com/
- Axios: https://axios-http.com/
- Vite: https://vitejs.dev/
- MDN CORS: https://developer.mozilla.org/docs/Web/HTTP/CORS
- Cookie Basics (MDN): https://developer.mozilla.org/docs/Web/HTTP/Cookies
