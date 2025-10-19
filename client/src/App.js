import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GameRoomPage from './pages/GameRoomPage';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-primary-bg">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/room/:roomCode" element={<GameRoomPage />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;
