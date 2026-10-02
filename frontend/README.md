# Sprint 2 Frontend: Authentication & Integration Guide

In **Sprint 2**, the React (Vite) frontend talks to the backend using **cookie-based JWT authentication**. The backend sets an **HTTP-only cookie** on login (page JavaScript cannot read it, and nothing is kept in `localStorage`), and the frontend asks the backend whether the session is valid with `GET /auth/test`.

> This is the **reference implementation**. Keep building in the `frontend/` you created in Sprint 1; don't clone or fork this one.

---

## 📂 Frontend Folder Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── DateSelector.jsx       # month/year dropdowns (+ DateSelector.test.jsx)
│   │   └── MapComponent.jsx       # Leaflet map
│   ├── pages/
│   │   ├── Login.jsx              # POST /auth/login (withCredentials)
│   │   ├── Register.jsx           # POST /auth/register (email, username, password)
│   │   └── MapPage.jsx            # protected page; POST /auth/logout
│   ├── App.jsx                    # routes; GET /auth/test on startup
│   ├── App.test.jsx               # tests for the session check and redirects
│   └── main.jsx                   # entry point
├── .env.example                   # template for frontend/.env
└── index.html
```

---

## 🛠 Prerequisites

- **Node.js 24 LTS**
- The backend running at `http://localhost:5175` (see [`../backend/README.md`](../backend/README.md))

---

## 1) Install

```bash
cd frontend
npm install
```

New in this sprint: `axios` for HTTP requests.

---

## 2) Configure Environment Variables

```bash
cp .env.example .env
```

```ini
VITE_BACKEND_API_URL=http://localhost:5175
```

Vite only exposes variables whose names start with `VITE_`, and it reads them when the dev server starts or the app is built, so **restart `npm run dev` after editing `.env`**. The value is the backend's base URL with no trailing slash; the code appends paths such as `/auth/login`.

> Anything in a `VITE_` variable ends up in the JavaScript sent to the browser. Never put secrets there.

---

## 3) How Cookie-Based Authentication Works

1. **Login**: `POST /auth/login`. The backend responds with `Set-Cookie: token=...; HttpOnly`.
2. The browser stores the cookie and sends it with later requests to the backend, **but only if each request opts in**:
   - axios: `{ withCredentials: true }`
   - fetch: `{ credentials: 'include' }`
3. **Page load**: `App.jsx` calls `GET /auth/test`. A `200` means "logged in", a `401` means "not logged in". Until the answer arrives, `App.jsx` shows "Checking your session…" instead of any page, so a refresh on `/map` doesn't bounce you to `/login`.
4. **Logout**: `POST /auth/logout`, and the backend clears the cookie.

---

## 4) Component Responsibilities

| File | Responsibilities |
|------|------------------|
| `App.jsx` | On startup calls `/auth/test` with `credentials: 'include'` and sets `authenticated`. Routes: `/` redirects; `/login` and `/register` (redirect to `/map` if already logged in); `/map` (redirects to `/login` if not). |
| `pages/Login.jsx` | `POST /auth/login` with `{ username, password }` and `withCredentials: true`. On success sets `authenticated` and navigates to `/map`; on `401` alerts "Invalid credentials". |
| `pages/Register.jsx` | `POST /auth/register` with `{ email, username, password }`. On success navigates to `/login`; on error shows the backend's message (for example, "That username or email is already registered"). |
| `pages/MapPage.jsx` | Protected page. **Logout** calls `POST /auth/logout`. **Fetch Data** is still a stub (Sprint 3 makes it real). |
| `components/DateSelector.jsx` | Month and year dropdowns (1895–2022). Calls `onDateChange('YYYY-MM-01')` once both are chosen, and `fetchTemperatureData()` on **Fetch Data**. |
| `components/MapComponent.jsx` | Leaflet map of West Virginia; draws a colored circle per `{ lat, lon, tavg }` point (none yet in this sprint). |

---

## 5) Auth Call Patterns

**Login (axios):**

```js
await axios.post(`${API_URL}/auth/login`, { username, password }, { withCredentials: true });
```

**Session check in `App.jsx` (fetch):**

```js
const res = await fetch(`${API_URL}/auth/test`, { credentials: 'include' });
setAuthenticated(res.ok); // fetch: res.ok is true for 2xx responses
```

Note the difference: `fetch` resolves for **every** HTTP status (check `res.ok`), while axios **throws** for non-2xx statuses (handle them in `catch`).

**Logout (axios):**

```js
await axios.post(`${API_URL}/auth/logout`, null, { withCredentials: true });
```

---

## 6) Run, Lint, and Test

```bash
npm run dev     # http://localhost:5173
npm run lint
npm test
```

`App.test.jsx` replaces `fetch` with a fake and checks that a valid session stays on `/map` after a refresh and that a logged-out visitor is sent to `/login`.

> The backend's `FRONTEND_URL` must be exactly `http://localhost:5173`, otherwise CORS blocks every request.

---

## 7) Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Red `401` for `/auth/test` in the browser console | Not logged in | Normal before login and after logout |
| Login succeeds but a refresh logs you out | Cookie not stored or not sent | Use `withCredentials: true` / `credentials: 'include'`; check the backend's CORS `credentials: true` |
| `Network Error` or `Failed to fetch` | Backend not running, wrong `VITE_BACKEND_API_URL`, or CORS | Start the backend; check `.env`, restart `npm run dev`; read the console's CORS message |
| `VITE_BACKEND_API_URL` is `undefined` | `.env` missing, or dev server not restarted | Create `frontend/.env`, then restart `npm run dev` |
| Register shows "Password must be at least 8 characters" | Backend validation | Use a longer password |

---

## 📚 References

- React Router: <https://reactrouter.com/>
- Axios: <https://axios-http.com/>
- Vite env variables: <https://vite.dev/guide/env-and-mode>
- MDN CORS: <https://developer.mozilla.org/docs/Web/HTTP/Guides/CORS>
- MDN Cookies: <https://developer.mozilla.org/docs/Web/HTTP/Guides/Cookies>
