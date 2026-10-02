/**
 * App.js
 * 
 * Main entry point of the application with persistent authentication using local storage.
 * It sets up routing for the login, register, and map pages, and manages authentication state.
 * For this sprint, it only includes the MapPage route.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MapPage from './pages/MapPage';

/**
 * Main application component that manages routes.
 * @returns {JSX.Element} The rendered application with routes.
 */
function App() {


  return (
    <Router>
      <Routes>
        {/* Redirect to /login if not authenticated; otherwise to /map */}
        <Route
          path="/"
          element={<Navigate to="/map" replace />}
        />
        {/* Map Page Route */}
        <Route
          path="/map"
          element={<MapPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
