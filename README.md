# xPostForecast

A full-stack web app that maps **historical monthly average temperatures across West Virginia** from NOAA nClimGrid data. You register, log in, pick a month between January 1895 and September 2022, and the app paints about 9,700 colored squares over a street map.

It is built with a React + Leaflet frontend, a Node.js/Express backend, Azure Database for MySQL, and deployment to Azure with GitHub Actions. It is also the **worked example** for WVU's CS 330 course.

> **Two ways to use this repository**
>
> - **Run xPostForecast yourself:** this README and the READMEs in `frontend/` and `backend/` explain how the app works and how to set it up.
> - **Build your own project (CS 330 students):** don't copy this repo. Follow the [student guides](https://tdevine1.github.io/xPostForecast/), which teach each step for *your* topic, and use this repo to see what a finished version looks like. For this sprint, start with the [Sprint 3 guide](https://tdevine1.github.io/xPostForecast/students/sprint-3.html).
>
> **You are on the `sprint-3` branch**, which has everything in Sprint 2 plus **real NOAA temperature data** from the Planetary Computer STAC API, drawn on the map. The finished app, with deployment and code-quality checks, is on [`main`](https://github.com/tdevine1/xPostForecast/tree/main).

## The sprints: one branch each

The app was built in four stages, kept as branches so you can see how it grew:

| Sprint | Branch | What it adds | What changed | Student guide |
|--------|--------|--------------|--------------|---------------|
| 1 | [`sprint-1`](https://github.com/tdevine1/xPostForecast/tree/sprint-1) | React (Vite) frontend: Leaflet map and month/year selector | — | [Sprint 1](https://tdevine1.github.io/xPostForecast/students/sprint-1.html) |
| 2 | [`sprint-2`](https://github.com/tdevine1/xPostForecast/tree/sprint-2) | Express backend, Azure MySQL, login/registration with JWT cookies | [Sprint 1 → 2](https://github.com/tdevine1/xPostForecast/compare/sprint-1...sprint-2) | [Sprint 2](https://tdevine1.github.io/xPostForecast/students/sprint-2.html) |
| 3 | [`sprint-3`](https://github.com/tdevine1/xPostForecast/tree/sprint-3) | Real NOAA temperature data from the Planetary Computer STAC API | [Sprint 2 → 3](https://github.com/tdevine1/xPostForecast/compare/sprint-2...sprint-3) | [Sprint 3](https://tdevine1.github.io/xPostForecast/students/sprint-3.html) |
| 4 | [`main`](https://github.com/tdevine1/xPostForecast/tree/main) | Deployment to Azure with GitHub Actions, and SonarQube | [Sprint 3 → 4](https://github.com/tdevine1/xPostForecast/compare/sprint-3...main) | [Sprint 4](https://tdevine1.github.io/xPostForecast/students/sprint-4.html) |

Switch sprints with the branch dropdown on GitHub, or locally with `git switch sprint-2`. The **What changed** links show every file a sprint added or modified.

**Guides site:** **<https://tdevine1.github.io/xPostForecast/>** (source in [`docs/`](https://github.com/tdevine1/xPostForecast/tree/main/docs) on `main`) has a student guide for every sprint, the [instructor runbook](https://tdevine1.github.io/xPostForecast/instructors.html), and a [glossary](https://tdevine1.github.io/xPostForecast/glossary.html) of plain-English definitions.

---

# Sprint 3 – API Integration & Climate Data Pipeline

Sprint 3 turns xPostForecast from an authenticated shell into a **data-driven climate app**. The backend queries the **Microsoft Planetary Computer STAC API** for NOAA climate data, reads the matching grid file, and returns West Virginia temperatures; the frontend draws them on the map.

Building your own project? The [Sprint 3 student guide](https://tdevine1.github.io/xPostForecast/students/sprint-3.html) teaches what APIs, JSON, and REST are and walks you through connecting your own project to a data API.

New in this sprint:

- Backend route `GET /temperature/:date`, **only for logged-in users**
- STAC search, URL signing, and Cloud Optimized GeoTIFF reading (`geotiff`)
- Grid cells converted to `{ lat, lon, tavg }` points in °F, cached per month
- Frontend calls consolidated into one axios client, `src/api.js`
- Temperatures drawn on the Leaflet map with a `chroma-js` color scale
- Error messages on the page (no data for a month, service unavailable) and automatic return to login when the session expires

See every changed file: **[Sprint 2 → 3 diff](https://github.com/tdevine1/xPostForecast/compare/sprint-2...sprint-3)**.

---

## 🎯 Objectives

This sprint demonstrates how to:

1. **Integrate an external scientific API** into a Node.js backend
2. Explain the **STAC (SpatioTemporal Asset Catalog)** search model: collections → items → assets
3. Get temporary read access to cloud-hosted files with **SAS URL signing**
4. Read a raster (grid) file and convert grid cells into map points
5. Protect a data route with the auth middleware from Sprint 2
6. Build a frontend that selects a date, fetches data, handles errors, and visualizes the result

---

## 🌡️ The Data

- **Dataset**: NOAA **nClimGrid** monthly, collection `noaa-nclimgrid-monthly` on [Microsoft Planetary Computer](https://planetarycomputer.microsoft.com/dataset/noaa-nclimgrid-monthly)
- **Coverage**: the contiguous U.S. on a grid of about 1/24° (≈ 5 km); January 1895 to **September 2022** in Planetary Computer's copy (later months return "no data")
- **Variable used**: `tavg`, monthly average temperature in °C (the item's other assets are `prcp`, `tmax`, `tmin`)
- **Format**: one Cloud Optimized GeoTIFF (COG) per month and variable, about 1.2 MB each
- **West Virginia**: the bounding box `[-82.644739, 37.201483, -77.719519, 40.638801]` (west, south, east, north) contains **9,676** grid cells

No API key is needed: STAC search and URL signing are free and anonymous.

---

## 🏗️ Architecture

```text
 Frontend (React + Leaflet)                          Backend (Express)
 ─────────────────────────                           ─────────────────
 DateSelector ── date ──► MapPage                    app.js: /temperature → authMiddleware → routes/stac.js
                            │  api.get('/temperature/2020-07-01')   (cookie sent automatically)
                            └──────────────────────────────────────►  1. cache hit? return it
                                                                      2. STAC search (collection + bbox + date)
                                                                      3. item.assets.tavg.href → sign/sign.js (SAS)
                                                                      4. download COG; geotiff reads the WV window
                                                                      5. cell centers inside the box → { lat, lon, tavg°F }
 MapComponent ◄── [{ lat, lon, tavg }, …] (≈9,700) ◄──────────────────  6. cache and return JSON
```

---

## 📁 What's New in This Branch

```text
backend/
├── routes/stac.js               # GET /temperature/:date
├── sign/sign.js                 # signs Planetary Computer asset URLs
└── tests/temperature.test.js    # route + sampling tests (Planetary Computer faked)
frontend/
└── src/
    ├── api.js                   # shared axios client: base URL + cookies
    ├── pages/MapPage.jsx        # real fetch, error message, 401 → /login
    └── components/MapComponent.jsx  # chroma-js color scale, canvas rendering
```

Setup is unchanged from Sprint 2 (`.env` files, database). Detailed guides:

- **Backend**: [`backend/README.md`](./backend/README.md), including how the temperature route works step by step
- **Frontend**: [`frontend/README.md`](./frontend/README.md), including the shared API client and the data flow

---

## 🧪 Try It

1. Start the backend (`cd backend && npm run dev`) and the frontend (`cd frontend && npm run dev`).
2. Log in, choose a month and year, and click **Fetch Data**.
3. The first request for a month takes several seconds (it goes out to Planetary Computer); asking for the same month again is nearly instant because the backend caches it.
4. Try **December 2022** to see the "no data" message.
5. Click a colored circle to see that cell's coordinates and temperature.

---

## 📚 References

- STAC specification: <https://stacspec.org>
- Planetary Computer: [STAC API](https://planetarycomputer.microsoft.com/docs/quickstarts/reading-stac/) · [SAS signing](https://planetarycomputer.microsoft.com/docs/concepts/sas/) · [nClimGrid monthly dataset](https://planetarycomputer.microsoft.com/dataset/noaa-nclimgrid-monthly)
- Cloud Optimized GeoTIFF: <https://cogeo.org>
- geotiff.js: <https://geotiffjs.github.io/>
- Leaflet: <https://leafletjs.com> · React-Leaflet: <https://react-leaflet.js.org> · chroma.js: <https://gka.github.io/chroma.js/>

---

In **Sprint 4**, the whole app moves to Azure: the frontend to Azure Static Web Apps and the backend to Azure App Service, deployed automatically by GitHub Actions.

