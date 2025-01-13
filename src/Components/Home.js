import React from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom'; // If you're using react-router for navigation
import '../css/Home.css'; // Assuming you have a CSS file for styling

const HomePage = () => {
  const navigate = useNavigate(); // For navigation, assuming you're using react-router

  const startGame = () => {
    // Check if the user has already selected a character
    const selectedCharacter = localStorage.getItem("selectedCharacter");
    if (selectedCharacter) {
        // If a character is already selected, navigate to the Confirmation screen
        navigate("/confirmation");
    }
    else {
        // If no character is selected, navigate to the Character Selection screen
        navigate("/character-selection");
    }
  };

  const loadInstructions = () => {
    navigate('/instructions'); 
  };

  const viewLeaderboards = () => {
    navigate('/leaderboard'); 
  };

  return (
    <div className="home-page">
      <h1>Welcome to Greedy Dwarf!</h1>
      <div className='btns'>
        <Button className="btn" onClick={startGame}>Start Game</Button>
        <Button className="btn" onClick={loadInstructions}>Instructions</Button>
        <Button className="btn" onClick={viewLeaderboards}>Leaderboards</Button>
      </div>
    </div>
  );
};

export default HomePage;
