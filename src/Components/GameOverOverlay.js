import React from "react";
import '../css/GameOverOverlay.css';
import { Link } from'react-router-dom'; 

const GameOverOverlay = ({message, onQuit, score}) => {
    return (
        <div className="game-over-overlay">
            <div className="game-over-content">
                <h2>Game Over</h2>
                <p dangerouslySetInnerHTML={{__html: message}}></p>
                <p className="score-display">Your Score: {score}</p>
                <div className="game-over-buttons">
                    <button className="btn" onClick={onQuit}>Main Menu</button>
                    <Link to="/leaderboard">
                        <button className="btn">View Leaderboards</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
export default GameOverOverlay;