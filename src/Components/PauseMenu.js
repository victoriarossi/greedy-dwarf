import React from 'react';
import "../css/PauseMenu.css";

const PauseMenu = ({onResume, onQuit}) => {

  return (
    <div className="pause-menu">
      <h1>Game Paused</h1>
      <button className="btn" onClick={onResume}>Resume</button>
      <button className="btn" onClick={onQuit}>Quit</button>
    </div>
  );
};

export default PauseMenu;
