/**
 * MapPage.jsx
 *
 * Main page of the temperature map application.
 * Provides a date selector, a "Fetch Data" button, and the map.
 *
 * Sprint 1: data fetching and logout are STUBS. They log to the console so you
 * can see the wiring works; Sprint 2 implements logout and Sprint 3 fetches
 * real temperature data from the backend.
 */

import { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import MapComponent from '../components/MapComponent';
import DateSelector from '../components/DateSelector';

/**
 * MapPage component that displays the map and (eventually) fetches temperature data.
 *
 * @component
 * @returns {JSX.Element} The map page with a date selector, map, and logout button.
 */
function MapPage() {
  const [date, setDate] = useState('');
  const [temperatureData] = useState([]); // stays empty until Sprint 3 fetches real data
  const [isLoading, setIsLoading] = useState(false);

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
   * Logout handler (stub). Sprint 2 replaces this with a real backend call.
   */
  const handleLogout = () => {
    console.log('Logout clicked (stub)');
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
