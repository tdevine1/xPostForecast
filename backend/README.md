# Sprint 3 Backend: Temperature Data API

> This is the **reference implementation** for Sprint 3's backend. Build the equivalent data pipeline in your own project's `backend/`; don't clone or fork this one.

This backend provides:

- Registration, login, and logout with a JWT in an HTTP-only cookie (from Sprint 2)
- Azure Database for MySQL access over TLS (from Sprint 2)
- **New:** `GET /temperature/:date`, which returns NOAA nClimGrid monthly average temperatures for West Virginia as map points, for logged-in users only

**Setup** (Node.js 24 LTS, `.env`, CA certificate, database schema, firewall) is the same as Sprint 2. If you haven't done it yet, follow the [Sprint 2 backend guide](https://github.com/tdevine1/xPostForecast/blob/sprint-2/backend/README.md). Then:

```bash
cd backend
npm install      # picks up the new dependency: geotiff
npm run dev      # http://localhost:5175
```

---

## Tech Stack

- **Runtime**: Node.js 24 (ES modules; built-in `fetch`)
- **Framework**: Express 5
- **Database**: Azure Database for MySQL via `mysql2/promise`
- **Auth**: JWT (`jsonwebtoken`) in an HTTP-only cookie (`cookie-parser`), passwords hashed with `bcryptjs`, `express-rate-limit` on login/register
- **Climate data**: Microsoft Planetary Computer STAC API + `geotiff` to read Cloud Optimized GeoTIFFs
- **Tests**: Vitest + Supertest

---

## Folder Structure

```text
backend/
├── app.js                       # middleware + routes
├── server.js                    # entry point: checks env vars, starts listening
├── config/                      # env loading, MySQL pool, cookie options, CA certificate
├── db/schema.sql                # users table
├── middleware/authMiddleware.js # JWT cookie check
├── routes/
│   ├── auth.js                  # /auth/*
│   └── stac.js                  # /temperature/:date   ← new
├── sign/
│   └── sign.js                  # signs Planetary Computer URLs   ← new
├── tests/
│   ├── auth.test.js
│   └── temperature.test.js      # ← new
└── .env.example
```

---

## Environment Variables

Unchanged from Sprint 2; the temperature route needs no API key.

```ini
PORT=5175
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=<generated secret>
DB_HOST=<your-server>.mysql.database.azure.com
DB_USER=<your-admin-user>
DB_PASSWORD=<your-password>
DB_NAME=authdb
DB_PORT=3306
```

---

## Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/health` | GET | — | `{ ok: true, env }` |
| `/auth/register` | POST | — | `{ email, username, password }` → `201` / `400` / `409` |
| `/auth/login` | POST | — | `{ username, password }` → `200` + cookie / `401` |
| `/auth/test` | GET | cookie | `{ ok: true, user }` / `401` |
| `/auth/logout` | POST | — | clears the cookie |
| `/temperature/:date` | GET | **cookie** | temperature points for that month (below) |

In `app.js`, the auth middleware runs before the temperature router, so every `/temperature` request without a valid cookie gets `401` and never reaches Planetary Computer:

```js
app.use('/temperature', authMiddleware, stacRoutes);
```

---

## `GET /temperature/:date` (`routes/stac.js`)

`:date` is `YYYY-MM-DD` (the frontend sends the first of the month); only the year and month are used.

| Status | Body | When |
|---|---|---|
| `200` | `[{ "lat": 40.6042, "lon": -82.6042, "tavg": 74.88 }, …]` (9,676 points) | Data found |
| `400` | `{ "error": "Date must be YYYY-MM-DD" }` | Malformed date or month outside 01–12 |
| `401` | `{ "error": "Not logged in" }` | No or invalid cookie |
| `404` | `{ "error": "No temperature data is available for 2022-12" }` | Month not in the dataset (before 1895-01 or after 2022-09) |
| `502` | `{ "error": "The temperature data service is unavailable. Try again later." }` | Planetary Computer failed or returned something unexpected |

`502 Bad Gateway` means "a server we depend on failed", which tells the frontend (and you) that the problem is not the request.

### How it works

1. **Cache check.** Results are kept in memory per month (`'2020-07'`), up to 24 months; historical data never changes. A cached month returns in milliseconds.
2. **STAC search.** POST to `https://planetarycomputer.microsoft.com/api/stac/v1/search`:

   ```json
   {
     "collections": ["noaa-nclimgrid-monthly"],
     "bbox": [-82.644739, 37.201483, -77.719519, 40.638801],
     "datetime": "2020-07-15T00:00:00Z"
   }
   ```

   Each nClimGrid item covers one whole month, so any instant inside the month (here the 15th) finds it. No item means `404`.
3. **Pick the asset by name.** An item has several assets (`prcp`, `tavg`, `tmax`, `tmin`, …); the code uses `item.assets.tavg`. Picking by name matters: the order of keys in the JSON is not guaranteed.
4. **Sign the URL** with `sign/sign.js`. The file lives in Azure Blob Storage, which only allows downloads with a short-lived SAS token; the signing endpoint returns the same URL with a token appended.
5. **Read the grid.** The backend downloads the COG (about 1.2 MB for the whole U.S.) and `geotiff` decodes only the window of rows and columns covering West Virginia.
6. **Convert cells to points.** For each cell: skip "no data" values; compute the cell's **center** (`west + (col + 0.5) × cellWidth`, `north − (row + 0.5) × cellHeight`); keep it only if the center is inside the bounding box; convert °C to °F with `c2f`. The result is capped at 10,000 points as a safety limit.
7. **Cache and return** the JSON array.

`samplePoints()` (step 6) and `c2f()` are exported so they can be unit-tested without the network.

### Try it with curl

```bash
# Log in first and save the cookie (see the Sprint 2 guide for registering)
curl -s -X POST http://localhost:5175/auth/login -H "Content-Type: application/json" \
  --data '{"username":"alice","password":"correct-horse"}' -c cookies.txt

curl -s http://localhost:5175/temperature/2020-07-01 -b cookies.txt | head -c 300
```

---

## Tests

```bash
npm test        # 25 tests: auth + temperature
npm run lint
```

`tests/temperature.test.js` replaces `fetch` with a fake Planetary Computer and `geotiff` with a fake grid, so it runs offline in a couple of seconds. It checks that the route requires login, picks `tavg` by name, converts to °F, uses the cache, and returns `404` and `502` in the right situations; it also checks `samplePoints()` cell-center math directly.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `401` from `/temperature/...` | Not logged in, or the cookie wasn't sent | Log in; the frontend must use the shared `api` client (`withCredentials: true`) |
| `404 No temperature data is available for …` | The month isn't in Planetary Computer's copy | Choose a month from 1895-01 to 2022-09 |
| `502` and `Error fetching temperature data` in the backend log | Planetary Computer unreachable or slow | Retry; check <https://planetarycomputer.microsoft.com> is up; the log line shows the underlying error |
| First request for a month takes several seconds | Normal: search + sign + download | Later requests for that month come from the cache |

---

## Deployment Notes

In Sprint 4 this backend runs on Azure App Service. The App Service needs outbound internet access to `planetarycomputer.microsoft.com` and `*.blob.core.windows.net` (allowed by default), and the same environment variables as `.env`, set as App Service settings.
