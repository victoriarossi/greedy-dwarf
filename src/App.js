import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom'; 
import HomePage from './Components/Home';
import GamePage from './Components/Game';
import Instructions from './Components/Instructions';
import PauseMenu from './Components/PauseMenu';
import LoginPage from './Components/Login';
import Leaderboard from "./Components/Leaderboard";
import CharacterSelection from './Components/CharacterSelection';
import ConfirmationScreen from './Components/ConfirmationScreen';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />  {/* Home Route */}
        <Route path='/instructions' element={<Instructions />} />  {/* Instructions Route */}
        <Route path="/game" element={<GamePage />} />  {/* Game Route */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/pause" element={<PauseMenu />} />  {/* Pause Route */}
        <Route path="/leaderboard" element={<Leaderboard />} />  {/* Leaderboard Route */}
        <Route path="/character-selection" element={<CharacterSelection />} /> {/* Character Selection Route */}
        <Route path="/confirmation" element={<ConfirmationScreen />} />  {/* Confirmation Route */}
      </Routes>
    </div>
  );
}

export default App;
