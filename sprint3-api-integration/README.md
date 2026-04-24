# Sprint 3 – API Integration & STAC-Based Data Pipeline

Sprint 3 focuses on transforming the xPostForecast project from a simple authenticated frontend/backend system into a **fully data-driven climate application**. This sprint introduces end-to-end integration with the **Microsoft Planetary Computer STAC API**, enabling the app to fetch and visualize real NOAA climate data over West Virginia.

This sprint occurs after:
- **Sprint 1**: Frontend scaffold + basic UI  
- **Sprint 2**: Backend user authentication + MySQL connection  

Now, Sprint 3 adds:
✔ Backend ability to query NOAA nClimGrid datasets  
✔ Secure signed access to COG climate rasters  
✔ Raster sampling pipeline producing `{ lat, lon, tavg }`  
✔ Full frontend–backend API integration  
✔ Data visualization using Leaflet + color scales  
✔ Consolidation of frontend API calls into `api.js`

---

# Objectives

By the end of this sprint, students should be able to:

1. **Integrate external scientific APIs** into a Node.js backend  
2. Understand the **STAC (SpatioTemporal Asset Catalog)** search model  
3. Acquire and authorize COG (Cloud Optimized GeoTIFF) assets using **SAS signing**  
4. Parse geospatial rasters using:
   - `georaster`
5. Convert raster cells into mappable point data  
6. Build frontend interfaces to:
   - Select dates
   - Trigger backend data fetches
   - Display temperature grids on a map  

---

# Architecture for Sprint 3

```
 ┌────────────────────────┐
 │       Frontend         │
 │   React + Leaflet      │
 │                        │
 │  DateSelector.jsx      │
 │       │                │
 │ MapPage.jsx  ──────────────► Calls backend `/stac` endpoint
 │       │                │
 │ MapComponent.jsx       │
 └──────────▲────────────┘
            │  JSON: [{lat,lon,tavg}]
 ┌──────────┴────────────┐
 │        Backend         │
 │  Node.js + Express     │
 │                        │
 │ STAC Route             │
 │  1. STAC search        │
 │  2. Sign COG URLs      │
 │  3. Fetch raster       │
 │  4. Sample WV bbox     │
 │  5. Convert C→F        │
 │  6. Return points      │
 └────────────────────────┘
```

---

# Backend Additions (Sprint 3)

## 1. New STAC Route

Located in:

```
backend/routes/stac.js
```

This route:

1. Builds a STAC search POST request to:  
   `https://planetarycomputer.microsoft.com/api/stac/v1/search`

2. Filters by:
   - `collection: 'nclimgrid-monthly'`
   - WV bounding box
   - Date range derived from user-selected year/month

3. Selects the correct COG asset from the response.

4. Signs the COG URL using:
   ```
   backend/sign/sign.js
   ```

5. Downloads the raster (COG) via `node-fetch`.

6. Parses raster using:
   - `georaster`
   - `geoblaze`

7. Samples WV bounding box and converts all temps to Fahrenheit.

8. Returns an array:
   ```json
   [
     {"lat":38.91,"lon":-80.12,"tavg":53.2},
     ...
   ]
   ```

---

# Frontend Additions (Sprint 3)

## 1. Consolidated Axios API Client (`src/api.js`)

All frontend→backend calls now use:

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL,
  withCredentials: true
});
```

This ensures:
- All requests include credentials  
- Base URL is environment-driven  
- Backend can maintain session via secure cookie  

---

## 2. Date Selection UI

`components/DateSelector.jsx`  
Provides dropdowns or selectors for year + month.

## 3. Map Page Logic

`pages/MapPage.jsx` now:

- Stores selected date in React state  
- Calls backend STAC endpoint using `api.get()`  
- Shows loading spinner during request  
- Passes temperature data to map component  

## 4. Leaflet Map Rendering

`components/MapComponent.jsx` displays:

- Base map  
- Colored circle markers for each `{ lat, lon, tavg }`  
- Popups with detailed temperature info  

Color scaling uses **chroma.js**.

---

# Tools and References

### STAC Specification  
https://stacspec.org

### Microsoft Planetary Computer  
- STAC Documentation  
  https://planetarycomputer.microsoft.com/docs  
- SAS Signing API  
  https://planetarycomputer.microsoft.com/docs/concepts/sas

### COG (Cloud-Optimized GeoTIFF)  
https://www.cogeo.org

### Raster Libraries  
- georaster: https://github.com/geotiff/georaster  
- geoblaze: https://geoblaze.io  

### Frontend  
- Leaflet: https://leafletjs.com  
- React-Leaflet: https://react-leaflet.js.org  
- Chroma.js: https://gka.github.io/chroma.js  

This sprint marks the point where **real climate science meets full-stack development**—producing the first meaningful analytics output from the application.
