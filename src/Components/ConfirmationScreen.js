import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ConfirmationScreen.css";
import minerDwarfImage from '../imgs/miner_dwarf.png';
import scoutDwarfImage from '../imgs/scout_dwarf.png';
import warriorDwarfImage from '../imgs/dwarf.png';

const characters = {
    "Miner Dwarf": {
        name: "Miner Dwarf",
        description: "A sturdy dwarf known for mining.",
        image: minerDwarfImage,
    },
    "Scout Dwarf": {
        name: "Scout Dwarf",
        description: "A swift dwarf known for scouting.",
        image: scoutDwarfImage,
    },
    "Warrior Dwarf": {
        name: "Warrior Dwarf",
        description: "A brave dwarf skilled in combat.",
        image: warriorDwarfImage,
    },
};

const ConfirmationScreen = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");
    const selectedCharacterName = localStorage.getItem(`selectedCharacter_${username}`);
    const selectedCharacter = characters[selectedCharacterName];

    useEffect(() => {
        if (!selectedCharacter) {
            navigate("/character-selection");
        }
    }, [selectedCharacter, navigate]);

    if (!selectedCharacter) { 
        return null;
    }

    const handleConfirm = () => {
        navigate("/game");
    };

    const handleChangeCharacter = () => {
        navigate("/character-selection");
    };

    return (
        <div className="confirmation-screen">
            <h1>Welcome Back!</h1>
            <p>You previously selected:</p>
            <div className="character-card">
                <img src={selectedCharacter.image} alt={selectedCharacter.name}/>
                <h2>{selectedCharacter.name}</h2>
                <p>{selectedCharacter.description}</p>
            </div>
            <div className="confirmation-buttons">
                <button onClick={handleConfirm}>Confirm</button>
                <button onClick={handleChangeCharacter}>Change Character</button>
            </div>
        </div>
    );
};

export default ConfirmationScreen;
