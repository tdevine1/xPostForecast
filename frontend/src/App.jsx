/**
 * App.jsx
 *
 * Top-level component: routing plus "is the user logged in?" state.
 *
 * Login state lives in an HTTP-only cookie set by the backend, which page
 * JavaScript cannot read. So on startup we ask the backend (GET /auth/test)
 * whether the cookie holds a valid session, and wait for the answer before
 * deciding which page to show. This keeps a page refresh from logging you out.
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
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Ask the backend once, on startup, whether we already have a valid session
  useEffect(() => {
    async function verifyAuth() {
      try {
        await api.get('/auth/test');
        setAuthenticated(true); // axios only gets here for 2xx responses
      } catch {
        setAuthenticated(false); // 401 (not logged in) or backend unreachable
      } finally {
        setCheckingAuth(false);
      }
    }
    verifyAuth();
  }, []);

  // Don't render any route until we know the answer, otherwise /map would
  // briefly redirect to /login on every page refresh
  if (checkingAuth) {
    return <p>Checking your session…</p>;
  }

  return (
    <Router>
      <Routes>
        {/* Redirect base route based on auth state */}
        <Route path="/" element={<Navigate to={authenticated ? '/map' : '/login'} replace />} />

        <Route
          path="/login"
          element={authenticated ? <Navigate to="/map" replace /> : <Login setAuthenticated={setAuthenticated} />}
        />

        <Route
          path="/register"
          element={authenticated ? <Navigate to="/map" replace /> : <Register />}
        />

        {/* Protected: only reachable when logged in */}
        <Route
          path="/map"
          element={authenticated ? <MapPage setAuthenticated={setAuthenticated} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
