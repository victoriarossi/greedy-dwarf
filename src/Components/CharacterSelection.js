import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/CharacterSelection.css";
import minerDwarfImage from '../imgs/miner_dwarf.png';
import scoutDwarfImage from '../imgs/scout_dwarf.png';
import warriorDwarfImage from '../imgs/dwarf.png';

const characters = [
    {
        name: "Miner Dwarf",
        description: "A sturdy dwarf known for mining.",
        image: minerDwarfImage,
    },
    {
        name: "Scout Dwarf",
        description: "A swift dwarf known for scouting.",
        image: scoutDwarfImage,
    },
    {
        name: "Warrior Dwarf",
        description: "A brave dwarf skilled in combat.",
        image: warriorDwarfImage,
    },
];

const CharacterSelection = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const [selectedCharacter, setSelectedCharacter] = useState(() => {
        const storedCharacterName = localStorage.getItem(`selectedCharacter_${username}`);
        if (storedCharacterName) { 
            return characters.find((c) => c.name === storedCharacterName);
        }
        return null;
    })
    
    if (!username) { 
        alert('Please log in to select a character.');
        navigate('/login');
        return null; // Prevent rendering until user is logged in
    }

    

    const handleSelect = (character) => {
        setSelectedCharacter(character);
    };

    const handleConfirm = () => {
        if (selectedCharacter) {
            localStorage.setItem(`selectedCharacter_${username}`, selectedCharacter.name);
            navigate("/game");
        }
    };

    return (
        <div className="character-selection">
        <h1 className="character-title">Select Your Character</h1>
        <div className="characters">
            {characters.map((character) => (
                <div
                    key={character.name}
                    className={`character-card ${selectedCharacter?.name === character.name ? "selected" : ""}`}
                    onClick={() => handleSelect(character)}>
                    <img src={character.image} alt={character.name}/>
                    <h2>{character.name}</h2>
                    <p>{character.description}</p>
                </div>
            ))}
        </div>
        <button
            className="confirm-button"
            onClick={handleConfirm}
            disabled={!selectedCharacter}>
            Confirm Selection
        </button>
        </div>
    );
};

export default CharacterSelection;
