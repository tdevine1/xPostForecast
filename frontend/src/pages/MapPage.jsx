/**
 * MapPage.jsx
 *
 * Main page of the temperature map application (only reachable when logged in).
 * Lets the user pick a month, fetches that month's temperatures from the
 * backend, and shows them on the map.
 *
 * All requests go through the shared `api` client (src/api.js), which sends
 * the auth cookie. A 401 means the session expired, so we go back to /login.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import api from '../api';
import MapComponent from '../components/MapComponent';
import DateSelector from '../components/DateSelector';

/**
 * MapPage component that fetches and displays temperature data.
 *
 * @component
 * @param {Function} setAuthenticated - Updates the app's authentication state.
 * @returns {JSX.Element} The map page with a date selector, map, and logout button.
 */
function MapPage({ setAuthenticated }) {
  const [date, setDate] = useState('');
  const [temperatureData, setTemperatureData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /** Session expired or missing: return to the login page. */
  const backToLogin = () => {
    setAuthenticated(false);
    navigate('/login', { replace: true });
  };

  /**
   * Fetches temperature points for the selected month from GET /temperature/:date.
   */
  const fetchTemperatureData = async () => {
    if (!date) {
      setError('Please select a month and year.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.get(`/temperature/${date}`);
      setTemperatureData(data);
    } catch (err) {
      if (err.response?.status === 401) {
        backToLogin();
        return;
      }
      // 404: no data for that month; 502: Planetary Computer unavailable; no response: backend down
      console.error('Failed to fetch temperature data:', err);
      setTemperatureData([]);
      setError(err.response?.data?.error ?? 'Could not reach the server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out: asks the backend to clear the cookie, then returns to /login.
   */
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Even if the request fails, log out on this side so the user isn't stuck
      console.error('Logout request failed (continuing client-side):', err);
    } finally {
      backToLogin();
    }
  };

  return (
    <div>
      <h1>ExPostForecast: Historical Monthly Average Temperatures</h1>

      {/* DateSelector reports the chosen date and triggers the fetch */}
      <DateSelector onDateChange={setDate} fetchTemperatureData={fetchTemperatureData} />

      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      {/* Loading indicator while a fetch is in progress (the first fetch of a month can take several seconds) */}
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
