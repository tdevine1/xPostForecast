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

Each point becomes a `CircleMarker` colored by temperature, with a popup showing latitude, longitude, and temperature. In Sprint 2 the array is always empty; Sprint 3 supplies real data.

```jsx
<MapComponent temperatures={temperatureData} />
```
