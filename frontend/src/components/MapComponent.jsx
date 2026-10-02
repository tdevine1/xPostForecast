/**
 * MapComponent.jsx
 *
 * Leaflet map of West Virginia with one colored circle per temperature point.
 * Colors come from a continuous chroma-js scale: blue (cold) to red (hot).
 * Clicking a circle shows its latitude, longitude, and temperature.
 */

import chroma from 'chroma-js';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CENTER = [38.5976, -80.4549]; // center of West Virginia
const MARKER_RADIUS = 25;           // pixels; large enough that neighboring circles overlap into a smooth surface
const MARKER_OPACITY = 0.999;
const MIN_F = -10;                  // temperature mapped to the coldest color
const MAX_F = 110;                  // temperature mapped to the hottest color

// Build the color scale once (not on every render)
const scale = chroma
  .scale(['#002366', '#4169E1', '#87CEEB', '#FFFF66', '#FFD700', '#FF4500', '#B22222'])
  .domain([MIN_F, MAX_F]);
const getColor = (tavg) => scale(tavg).hex();

/**
 * MapComponent
 *
 * @component
 * @param {Object[]} [temperatures=[]] - Points: { lat, lon, tavg } with tavg in °F.
 * @returns {JSX.Element} A map with temperature markers and popups.
 */
function MapComponent({ temperatures = [] }) {
  return (
    // preferCanvas: draw the ~10,000 circles on one <canvas> instead of 10,000 SVG elements (much faster)
    <MapContainer center={CENTER} zoom={7} preferCanvas style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {temperatures.map((point) => (
        <CircleMarker
          key={`${point.lat},${point.lon}`}
          center={[point.lat, point.lon]}
          radius={MARKER_RADIUS}
          color={getColor(point.tavg)}
          fillOpacity={MARKER_OPACITY}
          stroke={false} // no outline, so the circles blend together
        >
          <Popup>
            <div>
              <p><strong>Latitude:</strong> {point.lat.toFixed(4)}</p>
              <p><strong>Longitude:</strong> {point.lon.toFixed(4)}</p>
              <p><strong>Avg Temp:</strong> {point.tavg.toFixed(2)} °F</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default MapComponent;
