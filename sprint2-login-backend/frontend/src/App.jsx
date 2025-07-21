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
          element={<Navigate to={authenticated ? "/map" : "/login"} replace />}
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            authenticated ? (
              <Navigate to="/map" replace />
            ) : (
              <Login setAuthenticated={setAuthenticated} />
            )
          }
        />

        {/* Register Route */}
        <Route
          path="/register"
          element={
            authenticated ? (
              <Navigate to="/map" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Map Page Route */}
        <Route
          path="/map"
          element={
            authenticated ? (
              <MapPage setAuthenticated={setAuthenticated} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
