/**
 * App.js
 * 
 * Main entry point of the application. This version is basic and display a map page.
 */

import React, { useState, useEffect } from 'react';
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
