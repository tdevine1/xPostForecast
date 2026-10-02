/**
 * MapPage.jsx
 *
 * Main page of the temperature map application (only reachable when logged in).
 * Provides a date selector, a "Fetch Data" button, the map, and logout.
 *
 * Sprint 2: logout is real (it clears the backend's cookie). Fetching data is
 * still a STUB; Sprint 3 replaces it with a call to the backend.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import MapComponent from '../components/MapComponent';
import DateSelector from '../components/DateSelector';

// Base URL of the backend (e.g., http://localhost:5175), from frontend/.env
const API_URL = import.meta.env.VITE_BACKEND_API_URL;

/**
 * MapPage component that displays the map and handles logout.
 *
 * @component
 * @param {Function} setAuthenticated - Updates the app's authentication state.
 * @returns {JSX.Element} The map page with a date selector, map, and logout button.
 */
function MapPage({ setAuthenticated }) {
  const [date, setDate] = useState('');
  const [temperatureData] = useState([]); // stays empty until Sprint 3 fetches real data
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Fetch handler (stub). Simulates a short request, but sets no data.
   */
  const fetchTemperatureData = async () => {
    if (!date) {
      alert('Please select a month and year.');
      return;
    }

    setIsLoading(true);
    console.log(`Stub: would fetch temperature data for date: ${date}`);

    // Simulate a short network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsLoading(false);
  };

  /**
   * Logs out: asks the backend to clear the cookie, then returns to /login.
   */
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, null, { withCredentials: true });
    } catch (err) {
      // Even if the request fails, log out on this side so the user isn't stuck
      console.error('Logout request failed (continuing client-side):', err);
    } finally {
      setAuthenticated(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div>
      <h1>ExPostForecast: Historical Monthly Average Temperatures</h1>

      {/* DateSelector reports the chosen date and triggers the fetch */}
      <DateSelector onDateChange={setDate} fetchTemperatureData={fetchTemperatureData} />

      {/* Loading indicator while a fetch is in progress */}
      {isLoading && <ClipLoader color="#123abc" loading={isLoading} size={50} />}

      {/* MapComponent draws one marker per temperature point */}
      {!isLoading && <MapComponent temperatures={temperatureData} />}

      <button type="button" onClick={handleLogout} style={{ marginTop: '20px' }}>
        Logout
      </button>
    </div>
  );
}

export default MapPage;
