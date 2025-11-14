/**
 * App.js
 *
 * Main entry point of the application with persistent authentication.
 * It sets up routing for the login, register, and map pages, and manages authentication state.
 *
 * NOTE: Authentication persistence is now handled by an HTTP-only cookie set by the backend.
 * We verify that cookie on app load by calling /auth/test instead of using localStorage.
 */

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MapPage from './pages/MapPage';
import Login from './pages/Login';
import Register from './pages/Register';
import api from './api'; 

/**
 * Main application component that manages authentication and routing.
 * @returns {JSX.Element} The rendered application with routes.
 */
function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // helps avoid flicker while we verify the cookie

  // Verify auth state with the server when the app initializes
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await api.get('/auth/test');
        setAuthenticated(res.ok); // true if cookie/JWT is valid
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }
    verifyAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Redirect base route based on auth state */}
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
              // Login should call the backend (/auth/login) with `credentials: 'include'`
              // and then call setAuthenticated(true) on success.
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
              // MapPage can also handle logout by calling /auth/logout (credentials: 'include')
              // and then setAuthenticated(false).
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
