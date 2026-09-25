import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import ScholarshipsPage from './pages/ScholarshipsPage';
import TrackPage from './pages/TrackPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/track" element={<TrackPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
