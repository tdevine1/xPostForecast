/**
 * MapComponent.js
 * 
 * React component that renders a map with color-coded markers for temperature data.
 * Each marker represents a location with latitude, longitude, and temperature (tavg),
 * and displays this information in a popup.
 */

import React from 'react';
import chroma from 'chroma-js';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * MapComponent
 * 
 * Renders a map with markers based on temperature data.
 * Each marker is color-coded based on the average temperature (tavg) and includes a popup
 * with details for latitude, longitude, and temperature.
 * 
 * @component
 * @param {Object[]} [temperatures=[]] - Array of objects with latitude, longitude, and tavg values.
 * @returns {JSX.Element} A map with temperature markers and popups.
 */
function MapComponent({ temperatures = [] }) {
    const CENTER = [38.5976, -80.4549]; // Center of WV
    const MARKER_RADIUS = 25;
    const MARKER_OPACITY = 0.999;
    const MIN = -10; // Minimum temperature for color scale
    const MAX = 110; // Maximum temperature for color scale


    const scale = chroma.scale(["#002366", "#4169E1", "#87CEEB", "#FFFF66", "#FFD700", "#FF4500", "#B22222"])
                   .domain([MIN, MAX]);  // adjust range to your data
    const getColor = (tavg) => scale(tavg).hex();
    
    return (
        <MapContainer center={CENTER} zoom={7} style={{ height: '500px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
             {Array.isArray(temperatures) && temperatures.map((point, index) => (
                <CircleMarker
                    key={index}
                    center={[point.lat, point.lon]}
                    radius={MARKER_RADIUS}
                    color={getColor(point.tavg)}
                    fillOpacity={MARKER_OPACITY}
                    stroke={false} // Removes the marker border for cleaner look
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
