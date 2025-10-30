/**
 * MapPage.js
 * 
 * React component for the main page of the temperature map application.
 * Provides a date selector and a button to fetch temperature data from the backend API.
 * Displays a loading indicator while data is being fetched.
 *
 * NOTE (cookie-based auth):
 * - Every protected API call must include { withCredentials: true } so the JWT cookie is sent.
 * - On 401/403 from the backend, treat it as "session expired" and redirect to /login.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import DateSelector from '../components/DateSelector';
import { ClipLoader } from 'react-spinners';

/**
 * MapPage component that displays the map and handles temperature data fetching.
 * 
 * @component
 * @returns {JSX.Element} The rendered map page with temperature markers, a logout button, and a loading indicator.
 */
function MapPage({ setAuthenticated }) {
  const [date, setDate] = useState('');
  const [temperatureData, setTemperatureData] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  // Base API URL for the backend (e.g., http://localhost:5175)
  const API_URL = import.meta.env.VITE_API_URL || '';
  const LOGOUT_URL = `${API_URL}/auth/logout`;
  // Example protected data endpoint (replace with your actual route later)
  // const TEMPS_URL = `${API_URL}/api/temperatures?month=${date}`;

  /**
   * Handles the selected date change from DateSelector component.
   * 
   * @param {string} selectedDate - The selected date string in YYYY-MM format.
   */
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);  // Update date state
  };

  /**
   * fetchTemperatureData (stub)
   * 
   * Stubbed version of the temperature fetch function.
   * This placeholder simulates the interface but performs no actual API call.
   * 
   * @async
   * @function
   */
  const fetchTemperatureData = async () => {
    if (!date) {
      alert("Please select a date.");
      return;
    }

    setIsLoading(true);
    console.log(`Stub: would fetch temperature data for date: ${date}`);

    // Simulate short delay for the stub
    await new Promise(resolve => setTimeout(resolve, 500));

    // No data is actually set in this stub
    console.log("Stub: No temperature data fetched.");

    setIsLoading(false);
  };
  
  /**
   * handleLogout
   * 
   * Logs out the user by clearing the JWT cookie on the backend,
   * clearing authentication state, and navigating to the login page.
   */
  const handleLogout = async () => {
    try {
      await axios.post(LOGOUT_URL, null, { withCredentials: true });
    } catch (err) {
      // Even if the request fails, proceed with client-side logout to recover quickly.
      console.error('Logout request failed (continuing client-side):', err);
    } finally {
      setAuthenticated(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div>
      <h1>ExPostForecast: Historical Monthly Average Temperatures</h1>
      
      {/* DateSelector component allows user to select a date and trigger data fetch */}
      <DateSelector onDateChange={handleDateChange} fetchTemperatureData={fetchTemperatureData} />

      {/* Loading Indicator */}
      {isLoading && <ClipLoader color="#123abc" loading={isLoading} size={50} />}

      {/* MapComponent displays the temperature data as markers on the map */}
      {!isLoading && <MapComponent temperatures={temperatureData} />}

      {/* Logout button triggers the handleLogout function */}
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default MapPage;
