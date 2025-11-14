# Backend API (Node.js / Express)

This folder contains the Node.js/Express backend for **xPostForecast**. It provides:

- User registration, login, and logout using JWT in HTTP-only cookies.
- Secure MySQL access (Azure Database for MySQL) via a connection pool.
- STAC-backed temperature data endpoints that query NOAA nClimGrid data from Microsoft Planetary Computer and return point-based temperatures over West Virginia.

This service is intended to be deployed as an Azure App Service and consumed by the React frontend.

---

## Tech Stack

- **Runtime**: Node.js (ES modules)
- **Framework**: Express
- **Database**: Azure Database for MySQL (`mysql2/promise`)
- **Auth**: JSON Web Tokens (JWT) in HTTP-only cookies
- **HTTP helpers**: `cookie-parser`, `cors`
- **Climate data**: Microsoft Planetary Computer STAC API  
  - `node-fetch` for HTTP requests  
  - `georaster` and `geoblaze` to read/sample COG rasters
- **TLS**: Root CA cert (`config/DigiCertGlobalRootG2.crt.pem`) for MySQL SSL

---

## Folder Structure

```text
backend/
├── .env                         # Environment variables (not committed)
├── config/
│   ├── DigiCertGlobalRootG2.crt.pem
│   ├── README.md
│   └── database.js              # MySQL connection pool + SSL CA
├── middleware/
│   ├── README.md
│   └── authMiddleware.js        # JWT cookie verification
├── routes/
│   ├── README.md
│   ├── auth.js                  # /auth/* routes for login/register/logout
│   └── stac.js                  # STAC / temperature data endpoints
├── sign/
│   └── sign.js                  # Helper to sign Planetary Computer URLs
└── server.js                    # Express app entry point
```

---

## Environment Variables

Create a `.env` file in the `backend/` folder. Typical configuration:

```ini
# Backend server
BACKEND_PORT=5175
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# JWT
JWT_SECRET=replace_this_with_a_strong_secret

# Azure Database for MySQL
DB_HOST=your-mysql-host.mysql.database.azure.com
DB_USER=your-mysql-username
DB_PASSWORD=your-mysql-password
DB_DATABASE=your-database-name
DB_PORT=3306
```

> The database connection uses SSL and the bundled CA certificate at `config/DigiCertGlobalRootG2.crt.pem`.

---

## server.js – Express App and Wiring

`server.js` is the main entry point. It:

1. Loads `.env` using `dotenv/config`.
2. Creates an Express app.
3. Applies middleware:
   - `express.json()` for JSON request bodies.
   - `cookieParser()` for cookie parsing.
   - `cors()` configured to allow the frontend origin and credentials.
4. Mounts routers:
   - Authentication router under `/auth`.
   - STAC/temperature router under its API prefix (see `routes/stac.js`).
5. Installs a basic error handler that returns a JSON error object.
6. Starts listening on `BACKEND_PORT`.

CORS is configured to allow `credentials: true` and the exact `FRONTEND_URL`, so the frontend can send/receive the auth cookie.

---

## Database Connection (`config/database.js`)

`config/database.js`:

- Uses `mysql2/promise` to create a connection pool.
- Reads credentials from environment variables.
- Loads the DigiCert root CA for TLS:

```js
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const caPath = path.join(process.cwd(), "config", "DigiCertGlobalRootG2.crt.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT || 3306),
  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },
});

export default pool;
```

All DB queries elsewhere in the backend use this pool. The module logs connection issues at startup so that database problems surface early.

---

## Authentication

### Routes (`routes/auth.js`)

The `auth.js` router defines authentication endpoints, mounted under `/auth` in `server.js`. Typical routes:

- `POST /auth/register`  
  Accepts username/email/password, hashes the password with bcrypt, and inserts a new user record into MySQL.

- `POST /auth/login`  
  Verifies the supplied credentials. On success, issues a signed JWT and sets it as an HTTP-only cookie (for example, `token`). Returns a simple JSON success payload.

- `POST /auth/logout`  
  Clears the auth cookie and returns a JSON success payload.

- `GET /auth/test` (or similar)  
  Reads the JWT from the cookie, verifies it, and returns basic user/session info. The frontend uses this to verify that a session is still active when the app loads.

All responses are JSON and are designed to be consumed by the React frontend.

### Middleware (`middleware/authMiddleware.js`)

`authMiddleware.js` provides a reusable JWT guard to protect routes that require authentication:

```js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
```

Apply this middleware to any route that should only be accessible to logged-in users.

---

## STAC / Temperature Data Endpoint (`routes/stac.js`)

This router is responsible for querying NOAA nClimGrid data from Microsoft Planetary Computer, sampling it over West Virginia, and returning temperature points for the map.

### Constants and Helpers

Inside `routes/stac.js` you will see constants such as:

```js
const STAC_SEARCH = "https://planetarycomputer.microsoft.com/api/stac/v1/search";
const SIGN_URL = "https://planetarycomputer.microsoft.com/api/sas/v1/sign";

// Bounding box [west, south, east, north] for West Virginia
const BBOX = [-82.644739, 37.201483, -77.719519, 40.638801];

const MAX_POINTS = 10000;

function c2f(c) {
  return c * 9 / 5 + 32;
}
```

These configure the STAC search endpoint, the signing endpoint, the WV bounding box, and a helper to convert Celsius to Fahrenheit.

### Main Flow

For a given request from the frontend (e.g., with year/month params), the STAC route:

1. **Builds a STAC search request** to `STAC_SEARCH`:
   - Filters by the `nclimgrid-monthly` collection.
   - Restricts to the WV bounding box.
   - Uses a `datetime` range based on the requested year/month.

2. **Finds the relevant asset** in the STAC search response (a COG representing gridded data for the chosen month).

3. **Signs the asset URL** using `sign/sign.js`:
   - Calls the Planetary Computer signing endpoint (`SIGN_URL`) with the asset href.
   - Receives a signed URL that can be safely fetched.

4. **Fetches and parses the raster**:
   - Downloads the COG from the signed URL using `node-fetch`.
   - Converts the response buffer into a georaster object via `parseGeoraster`.

5. **Samples grid cells over West Virginia**:
   - Iterates over raster indices, converting each cell center into latitude/longitude.
   - Checks that the point lies inside the WV bounding box.
   - Reads the temperature value (in Celsius) and converts to Fahrenheit with `c2f`.
   - Pushes records into an array of:

     ```js
     {
       lat,
       lon,
       tavg: c2fValue,
     }
     ```

   - Stops when `MAX_POINTS` is reached to keep the response manageable.

6. **Returns JSON** back to the client:

   ```json
   [
     { "lat": 39.1234, "lon": -79.5678, "tavg": 54.3 },
     { "lat": 38.9012, "lon": -80.1234, "tavg": 55.7 }
   ]
   ```

The frontend uses this array to draw colored markers on the Leaflet map.

---

## Running the Backend Locally

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create `.env` with the variables listed in the **Environment Variables** section.

3. Start the server:

   ```bash
   npm run dev     # or npm start / node server.js depending on package.json
   ```

4. Ensure the frontend’s `VITE_BACKEND_API_URL` points to this backend, e.g.:

   ```ini
   VITE_BACKEND_API_URL=http://localhost:5175
   ```

---

## Deployment Notes

- The backend is designed for deployment to **Azure App Service**.
- Configure environment variables in the App Service settings.
- Ensure the MySQL firewall allows connections from the App Service.
- CORS must allow your production frontend origin with `credentials: true`.
- In production, cookies should be set with `secure: true` when served over HTTPS.
