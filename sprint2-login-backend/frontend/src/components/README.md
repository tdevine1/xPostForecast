# Frontend Components README (`src/components`)

This folder contains **reusable UI components** used across Sprint 2’s frontend. 
Components are written in React (Vite) and are designed to be **stateless** (or minimally stateful) so they can be dropped into pages like `MapPage.jsx`.

> This README applies to `sprint2-login-backend/frontend/src/components`.

---

## 📦 Components

### 1) `DateSelector.jsx`
Lightweight month/year selector that emits the chosen value and can trigger a fetch action from its parent.

**Props**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onDateChange` | `(value: string) => void` | ✅ | Called when the user selects a new date (format `YYYY-MM`). |
| `fetchTemperatureData` | `() => Promise<void>` | ✅ | Handler invoked when the user presses “Fetch”. |

**Behavior**
- Emits an ISO-like `YYYY-MM` string.
- Delegates the actual data fetching to parent (`MapPage.jsx`).

**Usage (example)**
```jsx
<DateSelector
  onDateChange={(value) => setDate(value)}
  fetchTemperatureData={fetchTemperatureData}
/>
```

---

### 2) `MapComponent.jsx`
Responsible for **rendering map visuals** for the selected month’s data. 
In Sprint 2 this is a **stub** to keep focus on auth and wiring; later sprints can swap in a real map library (Leaflet, Mapbox GL, etc.).

**Props**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `temperatures` | `Array<any>` | ✅ | The transformed data the map will render (empty array is allowed). |

**Behavior**
- Renders placeholders or basic markers based on `temperatures`.
- Contains no direct auth calls.

**Usage (example)**
```jsx
<MapComponent temperatures={temperatureData} />
```
