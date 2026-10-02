# `src/components/`

Reusable UI pieces. Pages (in `src/pages/`) combine them; components don't call the backend themselves.

## `DateSelector.jsx`

Month and year dropdowns plus a **Fetch Data** button.

| Prop | Type | Description |
|------|------|-------------|
| `onDateChange` | `(date: string) => void` | Called with `'YYYY-MM-01'` (for example `'2020-07-01'`) once both month and year are chosen, and again on every later change. |
| `fetchTemperatureData` | `() => void` | Called when **Fetch Data** is clicked. |

Years run from 1895 to 2022, the range available on Microsoft Planetary Computer (exported as `FIRST_YEAR` and `LAST_YEAR`). `DateSelector.test.jsx` covers its behavior.

```jsx
<DateSelector onDateChange={setDate} fetchTemperatureData={fetchTemperatureData} />
```

## `MapComponent.jsx`

A [React-Leaflet](https://react-leaflet.js.org/) map centered on West Virginia, with OpenStreetMap tiles.

| Prop | Type | Description |
|------|------|-------------|
| `temperatures` | `Array<{ lat: number, lon: number, tavg: number }>` | Points to draw (°F). An empty array shows just the map. |

Each point becomes a `CircleMarker` (radius 25 px, no outline) colored by a `chroma-js` scale from dark blue at −10 °F to dark red at 110 °F, with a popup showing latitude, longitude, and temperature. `preferCanvas` draws all markers on one `<canvas>`, which keeps ~9,700 markers fast.

```jsx
<MapComponent temperatures={temperatureData} />
```
