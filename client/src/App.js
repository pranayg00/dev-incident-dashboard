import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import Services from './pages/Services';
import IncidentDetail from './pages/IncidentDetail';
import './index.css';

function App() {
  return (
    <Router>
      <div className="gradient-bg min-h-screen">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/services" element={<Services />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;