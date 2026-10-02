/**
 * App.jsx
 *
 * Top-level component: sets up client-side routing with React Router.
 * In Sprint 1 there is only one real page (/map). Sprint 2 adds /login and
 * /register and puts /map behind a login check.
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
        {/* Send the base URL straight to the map page */}
        <Route path="/" element={<Navigate to="/map" replace />} />

        {/* Map Page Route */}
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  );
}

export default App;
