import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './HomePage';
import ArchivePage from './ArchivePage';
import AuthPage from './AuthPage';
import DashboardPage from './DashboardPage';
import DonationPage from './DonationPage';
import AboutPage from './AboutPage';
import EventsPage from './EventsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/donate" element={<DonationPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* If user enters a wrong link, send them back to Home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}