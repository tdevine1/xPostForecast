# components/ Directory Documentation

This directory contains reusable UI components for the React frontend.

---

## 1. `DateSelector.jsx`
Allows users to choose:
- A year  
- A month  

Emits state back to parent component (`MapPage`) via callbacks.

**Techniques Used**
- Controlled form inputs  
- Parent-child state lifting  
- Validation and formatting  

---

## 2. `MapComponent.jsx`
Core map visualization module using **Leaflet** + **React-Leaflet**.

Features:
- Rendering WV map  
- Plotting circle markers from `{ lat, lon, tavg }` data  
- Using `chroma-js` to build heat-based color scales  
- Showing popups with temperature values

**Tools**
- Leaflet mapping engine  
- React-Leaflet binding layer  
- Chroma.js color scales  

**References**
- Leaflet Docs: https://leafletjs.com  
- React-Leaflet Docs: https://react-leaflet.js.org  
- Chroma.js Palette Utility: https://gka.github.io/chroma.js
