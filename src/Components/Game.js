import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import "../css/Game.css"; 
import PauseMenu from "./PauseMenu";
import GameOverOverlay from "./GameOverOverlay";
import axios from 'axios';

import {
    walkableTiles,
    interactiveTiles,
    NUM_ROWS,
    NUM_COLS,
    treasuresScores,
    treasuresWeights,
    keyWeight,
    mainMapTreasures,
    poiMapTreasures
} from './constants';
import {
    randomizeTreasures,
    calculateDistance,
    findDwarfPosition,
    getAdjacentTiles,
} from './utils';


import {
    CHARACTER_STATS,
    getCharacterWeightThresholds,
    calculateMovementDelay
} from './CharacterStats';

import { getNextMove } from './astar';
import MapRenderer from './MapRenderer';
import Inventory from './Inventory';
import InteractionPopup from './InteractionPopup';
import DropItemPopup from './DropItemPopup';

import minerDwarfImage from "../imgs/miner_dwarf.png";
import scoutDwarfImage from "../imgs/scout_dwarf.png";
import warriorDwarfImage from "../imgs/dwarf.png";

const characterImages = {
    "Miner Dwarf": minerDwarfImage,
    "Scout Dwarf": scoutDwarfImage,
    "Warrior Dwarf": warriorDwarfImage,
};

const GamePage = () => {
    const navigate = useNavigate();
    const [score, setScore] = useState(0);
    const [paused, setPaused] = useState(false);
    const [tileSize, setTileSize] = useState(getTileSize());
    const [inventory, setInventory] = useState([]); // Track collected items
    const [randomizedTreasures, setRandomizedTreasures] = useState({}); // Store random treasure for each chest
    const [initialRandomizedTreasures, setInitialRandomizedTreasures] = useState({}); // Initial treasures for each map
    const [interaction, setInteraction] = useState(null); // Current interaction
    const [isVisible, setIsVisible] = useState(false); // Popup
    const [popupMessage, setPopupMessage] = useState(""); // Popup message
    const [inventoryWeight, setInventoryWeight] = useState(0); // Inventory weight
    const [isMoving, setIsMoving] = useState(false); // For movement delays
    const [currentMap, setCurrentMap] = useState('main'); // Move this up
    const [map, setMap] = useState([]);
    const mapRef = useRef([]);
    const [dragonPositions, setDragonPositions] = useState({
        'main': { row: 3, col: 21 },
        'Jungle City': { row: 13, col: 20 },
        'Dragon Lair': { row: 8, col: 20 },
        'Crossroads City': { row: 9, col: 20 },
    }); // Dragon positions per map
    const [gameOver, setGameOver] = useState(false); // Track game over state
    const [selectedItem, setSelectedItem] = useState(null); // To track selected item
    const [isOpen, setIsOpen] = useState(false); // Control popup visibility
    const [previousPosition, setPreviousPosition] = useState(null); // Stores the dwarf's position before entering a POI
    const [poiEntrancePosition, setPoiEntrancePosition] = useState(null); // Entrance position inside the POI
    const [poiName, setPoiName] = useState(''); // Name of the current POI

    const username = localStorage.getItem("username");

    // Manage map states and collected chests
    const [mapStates, setMapStates] = useState({}); // Stores state of each map
    const [collectedChests, setCollectedChests] = useState({}); // Tracks collected chests throughout all maps

    const dragonLastPositionRef = useRef(null);
    const isDragonMovingRef = useRef(false);

    const poiEntrancePositions = {
        'Jungle City': { row: 13, col: 3 },
        'Dragon Lair': { row: 3, col: 3 },
        'Crossroads City': { row: 8, col: 0 },
    };

    const goBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const selectedCharacter = useMemo(() => {
        const selectedCharacterName = localStorage.getItem(`selectedCharacter_${username}`) || 'Warrior Dwarf';
        return {
            name: selectedCharacterName,
            image: characterImages[selectedCharacterName],
            stats: CHARACTER_STATS[selectedCharacterName]
        };
    }, [username]);

    const weightThresholds = useMemo(() => 
        getCharacterWeightThresholds(selectedCharacter.name), 
        [selectedCharacter.name]
    );

    // Function to calculate tile size
    function getTileSize() {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        // Calculate tile size based on the width and height of the window
        const tileSizeWidth = containerWidth / NUM_COLS; // Divide by the number of columns (27)
        const tileSizeHeight = containerHeight / NUM_ROWS; // Divide by the number of rows (17)

        // Return the smaller of the two to maintain proportional scaling
        return Math.max(25, Math.min(50, Math.min(tileSizeWidth, tileSizeHeight)));
    }

    useEffect(() => {
        mapRef.current = map;
    }, [map]);

    // Flag to indicate when map is being set from mapStates
    const isSettingMapFromState = useRef(false);

    // Update mapStates whenever map changes, unless we're setting map from mapStates
    useEffect(() => {
        if (map.length > 0) {
            if (isSettingMapFromState.current) {
                // Reset the flag without updating mapStates
                isSettingMapFromState.current = false;
            } else {
                // Update mapStates since map has changed by user action
                setMapStates(prevStates => ({
                    ...prevStates,
                    [currentMap]: map,
                }));
            }
        }
    }, [map, currentMap]);

    // Remove collected chests from map when it's loaded or updated
    useEffect(() => {
        if (map.length > 0) { 
            setMap(prevMap => {
                const updatedMap = prevMap.map(row => [...row]);
                for (let row = 0; row < updatedMap.length; row++) {
                    for (let col = 0; col < updatedMap[row].length; col++) {
                        if (updatedMap[row][col] === "T") {
                            const treasureKey = `${currentMap}-${row}-${col}`;
                            if (collectedChests[currentMap] && collectedChests[currentMap][treasureKey]) {
                                updatedMap[row][col] = "P";
                            }
                        }
                    }
                }
                return updatedMap;
            });
        }
    }, [map, currentMap, collectedChests]);

    // Check if all chests have been collected in the current map
    useEffect(() => {
        const totalChestsInMap = Object.keys(initialRandomizedTreasures[currentMap] || {}).length;
        const collectedChestsInMap = Object.keys(collectedChests[currentMap] || {}).length;

        if (collectedChestsInMap === totalChestsInMap && totalChestsInMap > 0) {
            // All chests in the current map have been collected
            resetChestsInMap(currentMap);
            // Provide user feedback
            setPopupMessage(`All chests in ${currentMap} have been collected! Chests have respawned.`);
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 3000);
        }
    }, [collectedChests, initialRandomizedTreasures, currentMap]);

    // Function to reset chests in a specific map
    const resetChestsInMap = (mapName) => {
        if (!initialRandomizedTreasures[mapName]) return; // Add this check

        // Reset collected chests for this map
        setCollectedChests(prevChests => {
            const updatedChests = { ...prevChests };
            delete updatedChests[mapName];
            return updatedChests;
        });

        // Reset the treasures to initial assignments
        setRandomizedTreasures(prevTreasures => ({
            ...prevTreasures,
            [mapName]: initialRandomizedTreasures[mapName],
        }));

        // Re-add chests to the map
        if (currentMap === mapName) {
            setMap(prevMap => {
                const updatedMap = prevMap.map(row => [...row]);
                for (let row = 0; row < updatedMap.length; row++) {
                    for (let col = 0; col < updatedMap[row].length; col++) {
                        const treasureKey = `${mapName}-${row}-${col}`;
                        if (initialRandomizedTreasures[mapName][treasureKey]) {
                            if (updatedMap[row][col] === "P") {
                                updatedMap[row][col] = "T";
                            }
                        }
                    }
                }
                return updatedMap;
            });
        } else {
            // If the map is not currently loaded, update its state in mapStates
            setMapStates(prevStates => {
                const updatedStates = { ...prevStates };
                const updatedMap = prevStates[mapName].map(row => [...row]);
                for (let row = 0; row < updatedMap.length; row++) {
                    for (let col = 0; col < updatedMap[row].length; col++) {
                        const treasureKey = `${mapName}-${row}-${col}`;
                        if (initialRandomizedTreasures[mapName][treasureKey]) {
                            if (updatedMap[row][col] === "P") {
                                updatedMap[row][col] = "T";
                            }
                        }
                    }
                }
                updatedStates[mapName] = updatedMap;
                return updatedStates;
            });
        }
    };

    useEffect(() => {
        if(isVisible) {
            let timer;
            timer = setTimeout(() => {
                setIsVisible(false);
            }, 2000);
            return () => {
                if (timer) {
                    clearTimeout(timer);
                }
            };
        }
    }, [isVisible]);

    const checkWeights = useCallback((currentWeight) => {
        if (currentWeight >= weightThresholds.medium && currentWeight < weightThresholds.heavy) {
            handleWeightWarning("medium", `slightly reduced (${selectedCharacter.stats.description})`);
        } else if (currentWeight >= weightThresholds.heavy && currentWeight < weightThresholds.max) {
            handleWeightWarning("heavy", `reduced (${selectedCharacter.stats.description})`);
        } else if (currentWeight >= weightThresholds.max) {
            handleWeightWarning("You are carrying too much weight to move!");
        }
    }, [weightThresholds, selectedCharacter.stats.description]);

    const handleWeightWarning = (weightCategory, movementRestriction) => {
        if (weightCategory === "You are carrying too much weight to move!") {
            setPopupMessage(weightCategory);
            return;
        }
        
        setPopupMessage(
            `You are carrying a ${weightCategory} load. ` +
            `Your movement speed is ${movementRestriction}.`
        );
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 2000);
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setTileSize(getTileSize());
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // This useEffect ensures that poiEntrancePosition is set whenever the map or currentMap changes
    useEffect(() => {
        if (map.length > 0 && currentMap !== 'main') {
            const entrancePosition = poiEntrancePositions[currentMap] || findEntrancePosition(map);
            if (entrancePosition) {
                setPoiEntrancePosition(entrancePosition);
            }
        } else {
            setPoiEntrancePosition(null);
        }
    }, [map, currentMap]);

    // Pause menu event
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' || event.key === 'p') {
                setPaused(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Fetch the map based on the currentMap state
    useEffect(() => {
        if (mapStates[currentMap]) {
            // If the map state exists, use it
            isSettingMapFromState.current = true; // Set the flag
            setMap(mapStates[currentMap]);
        } else {
            if (currentMap === 'main') {
                fetch("/maps/map.json")
                    .then((response) => response.json())
                    .then((data) => {
                        setMap(data.map);
                        mapRef.current = data.map;
                        const treasures = randomizeTreasures(data.map, mainMapTreasures, currentMap);
                        setRandomizedTreasures((prevTreasures) => ({
                            ...prevTreasures,
                            [currentMap]: treasures,
                        }));
                        setInitialRandomizedTreasures((prevInitialTreasures) => ({
                            ...prevInitialTreasures,
                            [currentMap]: treasures,
                        }));
                    })
                    .catch((error) => console.error("Error loading map:", error));
            } else {
                const mapFilePath = `/maps/${currentMap.replace(' ', '')}.json`;
                fetch(mapFilePath)
                    .then((response) => response.json())
                    .then((data) => {
                        const mapData = data.map || data.jungleCity || data.dragonLair || data.crossroadsCity;
                        setMap(mapData);
                        mapRef.current = mapData;
                        const treasures = randomizeTreasures(mapData, poiMapTreasures, currentMap);
                        setRandomizedTreasures((prevTreasures) => ({
                            ...prevTreasures,
                            [currentMap]: treasures,
                        }));
                        setInitialRandomizedTreasures((prevInitialTreasures) => ({
                            ...prevInitialTreasures,
                            [currentMap]: treasures,
                        }));

                        // Initialize dragon position for the new map if not already set
                        const dwarfPos = findDwarfPosition(mapData);
                        if (dwarfPos) {
                            setDragonPositions(prev => {
                                if (!prev[currentMap]) {
                                    const dragonPos = findDragonInitialPosition(mapData, dwarfPos);
                                    return {
                                        ...prev,
                                        [currentMap]: dragonPos || { row: 0, col: 0 }
                                    };
                                }
                                return prev;
                            });
                        }

                        // Handle dwarf placement at entrance
                        const entrancePosition = poiEntrancePositions[currentMap] || findEntrancePosition(mapData);
                        if (entrancePosition) {
                            setMap(prevMap => {
                                const updatedMap = prevMap.map(row => [...row]);
                                updatedMap[entrancePosition.row][entrancePosition.col] = 'D';
                                return updatedMap;
                            });
                            setPoiEntrancePosition(entrancePosition);
                        }
                    })
                    .catch((error) => console.error("Error loading map:", error));
            }
        }
    }, [currentMap]); // Removed mapStates from dependencies

    useEffect(() => {
        mapRef.current = map;
    }, [map]);

    useEffect(() => {
        if (gameOver) {
            const username = localStorage.getItem("username") || "Unknown";
            const gameResult = {
                username,
                score,
                won: popupMessage.includes("won") ? 'WON' : 'LOST'
            };

            axios
                .post("http://localhost:3001/save-game-result", gameResult)
                .then((response) => {
                    console.log("Game result saved:", response.data);
                    const { finished_at } = response.data;
                    localStorage.setItem("lastGameFinishedAt", finished_at);
                })
                .catch((error) => {
                    console.error("Error saving game result:", error);
                });
        }
    }, [gameOver, popupMessage, score]);

    const findDragonInitialPosition = (mapData, dwarfPosition) => {
        let maxDistance = -1;
        let dragonPosition = null;

        for (let row = 0; row < mapData.length; row++) {
            for (let col = 0; col < mapData[row].length; col++) {
                const tile = mapData[row][col];
                if (walkableTiles.includes(tile)) {
                    const distance = calculateDistance(row, col, dwarfPosition.row, dwarfPosition.col);
                    if (distance > maxDistance) {
                        maxDistance = distance;
                        dragonPosition = { row, col };
                    }
                }
            }
        }

        return dragonPosition;
    };

    // Dragon movement logic using smart movement towards the dwarf
    useEffect(() => {
        if (!map.length || gameOver || paused) return;

        const moveDragon = () => {
            if (isDragonMovingRef.current) return;
            isDragonMovingRef.current = true;

            const dwarfPosition = findDwarfPosition(mapRef.current);
            if (!dwarfPosition) {
                isDragonMovingRef.current = false;
                return;
            }

            setDragonPositions(prevPositions => {
                const currentDragonPosition = prevPositions[currentMap];
                if (!currentDragonPosition) {
                    isDragonMovingRef.current = false;
                    return prevPositions;
                }

                // Use A* to get next move
                const nextMove = getNextMove(mapRef.current, currentDragonPosition, dwarfPosition);
                
                if (!nextMove) {
                    isDragonMovingRef.current = false;
                    return prevPositions;
                }

                // Check if next move would catch the dwarf
                if (nextMove.row === dwarfPosition.row && nextMove.col === dwarfPosition.col) {
                    setTimeout(() => {
                        setPopupMessage("The dragon has eaten you! You lost.");
                        setGameOver(true);
                    }, 0);
                }

                dragonLastPositionRef.current = { ...currentDragonPosition };
                isDragonMovingRef.current = false;

                return {
                    ...prevPositions,
                    [currentMap]: { row: nextMove.row, col: nextMove.col }
                };
            });
        };

        const intervalId = setInterval(moveDragon, 1000);
        
        return () => {
            clearInterval(intervalId);
            isDragonMovingRef.current = false;
        };
    }, [currentMap, map.length, gameOver, paused]);

    const getMovementDelay = useMemo(() => {
        return () => {
            const delay = calculateMovementDelay(selectedCharacter.name, inventoryWeight);
            console.log('Movement delay:', delay, 'Character:', selectedCharacter.name, 'Weight:', inventoryWeight);
            return delay;
        };
    }, [selectedCharacter.name, inventoryWeight]);

    // Move handler
    const handleKeyDown = useCallback((event) => {

        // Prevent default behavior for movement keys to stop scrolling
        const movementKeys = ["w", "a", "s", "d", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        if (movementKeys.includes(event.key)) {
            event.preventDefault();
        }

        if (paused || gameOver) return;

        if (isMoving) return;
        const delay = getMovementDelay();
        if (delay === null) {
            setPopupMessage(
                `You are carrying too much weight to move! ` +
                `(Max capacity: ${weightThresholds.max} - ${selectedCharacter.stats.description})`
            );
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 2000);
            return; 
        }

        const dwarfPosition = findDwarfPosition(map);
        if (!dwarfPosition) {
            return;
        }

        let { row, col } = dwarfPosition;
        let newRow = row;
        let newCol = col;

        switch (event.key) {
            case "w":
            case "ArrowUp":
                newRow = row - 1;
                break;
            case "s":
            case "ArrowDown":
                newRow = row + 1;
                break;
            case "a":
            case "ArrowLeft":
                newCol = col - 1;
                break;
            case "d":
            case "ArrowRight":
                newCol = col + 1;
                break;
            default:
                return;
        }

        // Check if the new position is within the map boundaries 
        if (newRow >= 0 && newRow < map.length && newCol >= 0 && newCol < map[0].length) {
            const targetTile = map[newRow][newCol];

            if (walkableTiles.includes(targetTile) ) {
                setIsMoving(true); // Set moving state
                // Move dwarf
                setTimeout(() => {
                    const updatedMap = map.map((row) => [...row]);
                    updatedMap[row][col] = "P"; // Set old position to path
                    updatedMap[newRow][newCol] = "D"; // Move dwarf to new position
                    setMap(updatedMap);

                    const currentDragonPosition = dragonPositions[currentMap];
                    if (currentDragonPosition && newRow === currentDragonPosition.row && newCol === currentDragonPosition.col) {
                        setPopupMessage("The dragon has eaten you! You lost.");
                        setGameOver(true);
                    }

                    if (targetTile === "E") {
                        setPopupMessage("Congratulations! You've won the game!");
                        setGameOver(true);
                    }

                    // Check for interaction after moving dwarf
                    const adjacentTiles = getAdjacentTiles(map, newRow, newCol);
                    const adjacentPoiTile = adjacentTiles.find(tile => ['A', 'X', 'C'].includes(tile.tile));
                    if (adjacentPoiTile) { 
                        const poiNames = { X: "Jungle City", A: "Dragon Lair", C: "Crossroads City" };
                        setInteraction({
                            type: 'poi',
                            tile: adjacentPoiTile.tile,
                            position: { row: newRow, col: newCol },
                            poiName: poiNames[adjacentPoiTile.tile],
                        });
                        setPopupMessage(`Press 'E' to enter ${poiNames[adjacentPoiTile.tile]}.`);
                        setIsVisible(true);
                    }
                    else if (interactiveTiles.includes(map[newRow][newCol])) { 
                        setInteraction({
                            type: targetTile.startsWith("B") ? "door" : "treasure",
                            tile: targetTile,
                            position: { row: newRow, col: newCol },
                        });
                    } else {
                        setInteraction(null); // Clear interaction if not on an interactive tile
                        setIsVisible(false);
                    }

                    setIsMoving(false); // Reset moving state
                }, delay);
            } else if (interactiveTiles.includes(targetTile)) {
                // If the tile is interactive but not walkable (e.g., a door), set the interaction
                setInteraction({
                    type: targetTile.startsWith("B") ? "door" : targetTile.startsWith("T") ? "treasure" : targetTile.startsWith('K') ? "inventory" : null,
                    tile: targetTile,
                    position: { row: newRow, col: newCol },
                });

                if (targetTile.startsWith("B")) {
                    setPopupMessage("You have encountered a locked door.<br />Press 'I' to attempt to open it.");
                } else if (targetTile.startsWith("T")) {
                    setPopupMessage("You have found a treasure chest!<br />Press 'I' to open it.");
                } else if (targetTile.startsWith("K")) {
                    setPopupMessage("You have found a key!<br />Press 'I' to pick it up.");
                } else {
                    setPopupMessage("You have found an item!<br />Press 'I' to pick it up.");
                }
                setIsVisible(true);
            }
        }
    }, [map, isMoving, getMovementDelay, paused, gameOver, dragonPositions, currentMap, weightThresholds, selectedCharacter, inventoryWeight]);

    // Handle interaction when 'I' key is pressed
    const handleInteractionKeyDown = useCallback((event) => {
        if (event.key.toLowerCase() === "i" && interaction) {
            const { type, tile, position } = interaction;
            const { row, col } = position;
            const updatedMap = map.map((row) => [...row]);

            if (type === "treasure") {
                const treasureKey = `${currentMap}-${row}-${col}`;
                const collectedItem = randomizedTreasures[currentMap][treasureKey];
                if (collectedItem) {
                    const isKey = collectedItem.startsWith("K");
                    const itemName = isKey ? 'key' : collectedItem;
                    const itemWeight = treasuresWeights[itemName] || keyWeight;
                    const itemScore = treasuresScores[itemName] || 0;

                    if (inventoryWeight + itemWeight > weightThresholds.max) {
                        setPopupMessage(`You have encountered a ${isKey ? 'key' : 'treasure'}, <br /> but your inventory is full. <br /> Press 'M' to drop an item.`);
                        setIsVisible(true);
                        setTimeout(() => setIsVisible(false), 3000);
                    }
                    else {
                        // Collect the item
                        setInventory((prevInventory) => [...prevInventory, collectedItem]);
                        setScore((prevScore) => prevScore + itemScore);
                        setInventoryWeight((prevWeight) => prevWeight + itemWeight);

                        setPopupMessage(isKey ? `You have picked up Key ${collectedItem.substring(1)}.<br />Search for new doors to use the key.` : `You have collected a ${collectedItem}!`);
                        setIsVisible(true);
                        setTimeout(() => {
                            setIsVisible(false);
                            checkWeights(inventoryWeight + itemWeight);
                        }, 1500);

                        // Update map
                        updatedMap[row][col] = "D";
                        const dwarfPosition = findDwarfPosition(map);
                        updatedMap[dwarfPosition.row][dwarfPosition.col] = "P";
                        setMap(updatedMap);
                        setMapStates(prevStates => ({
                            ...prevStates,
                            [currentMap]: updatedMap,
                        }));

                        // Update collected chests
                        setCollectedChests(prevChests => {
                            const updatedChests = { ...prevChests };
                            if (!updatedChests[currentMap]) {
                                updatedChests[currentMap] = {};
                            }
                            updatedChests[currentMap][treasureKey] = true;
                            return updatedChests;
                        });

                        // Remove the treasure from the randomizedTreasures
                        setRandomizedTreasures(prevTreasures => {
                            const updatedTreasures = { ...prevTreasures };
                            const mapTreasures = { ...updatedTreasures[currentMap] };
                            delete mapTreasures[treasureKey];
                            updatedTreasures[currentMap] = mapTreasures;
                            return updatedTreasures;
                        });

                        const currentDragonPosition = dragonPositions[currentMap];
                        if (currentDragonPosition && row === currentDragonPosition.row && col === currentDragonPosition.col) {
                            setPopupMessage("The dragon has eaten you! You lost.");
                            setGameOver(true);
                        }
                        setInteraction(null); // Clear interaction
                    }

                }
                else {
                    console.warn(`No treasure assigned to chest at ${treasureKey}`);
                }
            } else if (type === "door") {
                const doorId = tile; // e.g., "B1"
                const correspondingKey = `K${doorId.substring(1)}`; // e.g., "K1"

                if (inventory.includes(correspondingKey)) {
                    // Open the door
                    updatedMap[row][col] = "D"; // Move dwarf to new position
                    const dwarfPosition = findDwarfPosition(map);
                    updatedMap[dwarfPosition.row][dwarfPosition.col] = "P";
                    setMap(updatedMap);
                    setMapStates(prevStates => ({
                        ...prevStates,
                        [currentMap]: updatedMap,
                    }));

                    // Remove key from inventory
                    setInventory((prevInventory) => prevInventory.filter((item) => item !== correspondingKey));
                    setScore((prevScore) => prevScore + 20); // Score for opening doors
                    setInventoryWeight((prevWeight) => prevWeight - keyWeight);

                    setPopupMessage(`You used Key ${doorId.substring(1)} to open the door.`);
                    setIsVisible(true);

                    const currentDragonPosition = dragonPositions[currentMap];
                    if (currentDragonPosition && row === currentDragonPosition.row && col === currentDragonPosition.col) {
                        setPopupMessage("The dragon has eaten you! You lost.");
                        setGameOver(true);
                    }
                } else {
                    setPopupMessage(`The door is locked.<br />You need Key ${doorId.substring(1)} to open it.`);
                    setIsVisible(true);
                }

                setTimeout(() => {
                    setIsVisible(false);
                    setInteraction(null);
                }, 2000);
            } else if (type === "inventory") {
                const itemWeight = treasuresWeights[tile] || keyWeight;
                if (inventoryWeight + itemWeight > weightThresholds.max) {
                    setPopupMessage(`You have encountered an item,<br />but your inventory is full.<br />Press 'M' to drop an item.`);
                    setIsVisible(true);
                    setTimeout(() => setIsVisible(false), 2000);
                } else {
                    // Collect the item
                    setInventory((prevInventory) => [...prevInventory, tile]);
                    setInventoryWeight((prevWeight) => prevWeight + itemWeight);

                    setPopupMessage(`You have collected ${tile.startsWith('K') ?  `Key ${tile.substring(1)}` : `a ${tile}`}!`);
                    setIsVisible(true);
                    setTimeout(() => {
                        setIsVisible(false);
                        checkWeights(inventoryWeight);
                    }, 1500);

                    // Update map
                    updatedMap[row][col] = "D";
                    const dwarfPosition = findDwarfPosition(map);
                    updatedMap[dwarfPosition.row][dwarfPosition.col] = "P";
                    setMap(updatedMap);
                    setMapStates(prevStates => ({
                        ...prevStates,
                        [currentMap]: updatedMap,
                    }));

                    setInteraction(null);

                    const currentDragonPosition = dragonPositions[currentMap];
                    if (currentDragonPosition && row === currentDragonPosition.row && col === currentDragonPosition.col) {
                        setPopupMessage("The dragon has eaten you! You lost.");
                        setGameOver(true);
                    }
                }
            }

        } else if (event.key.toLowerCase() === "m") {
            if (inventory.length > 0) {
                setIsOpen(true); // Open the popup to drop items
            }
        }
    }, [interaction, map, randomizedTreasures, inventory, inventoryWeight, dragonPositions, currentMap]);

    // Handle 'E' key for entering/exiting POIs
    const handleEnterKeyDown = useCallback((event) => {
        if (event.key.toLowerCase() === 'e' && interaction && interaction.type === 'poi') {
            const { poiName, position } = interaction;

            // Save the current map state before entering the POI
            setMapStates(prevStates => ({
                ...prevStates,
                [currentMap]: map,
            }));

            setPreviousPosition({ row: position.row, col: position.col });
            setCurrentMap(poiName);
            setPoiName(poiName);
            setInteraction(null);
            setIsVisible(false);

            // Set the map to the POI's map state if it exists
            if (mapStates[poiName]) {
                isSettingMapFromState.current = true; // Set the flag
                setMap(mapStates[poiName]);
            }

        } else if (event.key.toLowerCase() === 'e' && currentMap !== 'main' && poiEntrancePosition) {
            const dwarfPosition = findDwarfPosition(map);
            if (dwarfPosition.row === poiEntrancePosition.row && dwarfPosition.col === poiEntrancePosition.col) {

                // Save the current POI map state before exiting
                setMapStates(prevStates => ({
                    ...prevStates,
                    [currentMap]: map,
                }));

                // Switch back to the main map
                setCurrentMap('main');
                setPoiName('');

                // Retrieve the main map state from mapStates
                const mainMapState = mapStates['main'];

                // Clone the main map to avoid mutating state directly
                const updatedMainMap = mainMapState.map((row) => [...row]);

                // Remove the old dwarf position
                for (let r = 0; r < updatedMainMap.length; r++) {
                    for (let c = 0; c < updatedMainMap[r].length; c++) {
                        if (updatedMainMap[r][c] === 'D') {
                            updatedMainMap[r][c] = 'P'; // Set to path tile
                            break;
                        }
                    }
                }

                // Place the dwarf back at the previous position
                updatedMainMap[previousPosition.row][previousPosition.col] = 'D';

                // Update the map and mapStates
                isSettingMapFromState.current = true; // Set the flag
                setMap(updatedMainMap);
                setMapStates(prevStates => ({
                    ...prevStates,
                    ['main']: updatedMainMap,
                }));

                setInteraction(null);
                setIsVisible(false);
                setPoiEntrancePosition(null); // Reset entrance position
            }
        }
    }, [interaction, currentMap, poiEntrancePosition, previousPosition, map, mapStates]);


    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keydown", handleInteractionKeyDown);
        window.addEventListener("keydown", handleEnterKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keydown", handleInteractionKeyDown);
            window.removeEventListener("keydown", handleEnterKeyDown);
        };
    }, [handleKeyDown, handleInteractionKeyDown, handleEnterKeyDown]);

    // Display exit prompt inside POI
    useEffect(() => {
        if (currentMap !== 'main' && poiEntrancePosition) {
            const dwarfPosition = findDwarfPosition(map);
            if (dwarfPosition.row === poiEntrancePosition.row && dwarfPosition.col === poiEntrancePosition.col) {
                setPopupMessage(`Press 'E' to exit ${poiName}.`);
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        }
    }, [map, currentMap, poiEntrancePosition, poiName]);

    // Function to handle dropping an item
    const handleDrop = (item) => {
        setInventory((prevInventory) => prevInventory.filter((i) => i !== item));
        setSelectedItem(null);
        setIsOpen(false);

        const itemWeight = treasuresWeights[item] || keyWeight;
        setInventoryWeight((prevWeight) => prevWeight - itemWeight);

        // Decrease score
        const isKey = item.startsWith("K");
        const itemName = isKey ? 'key' : item;
        const itemScore = treasuresScores[itemName] || 0;
        setScore((prevScore) => prevScore - itemScore);

        setPopupMessage(`You have dropped ${isKey ? `Key ${item.substring(1)}` : item}.`);
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 2000);
    };

    // Function to find entrance position inside the POI
    const findEntrancePosition = (mapData) => {
        for (let row = 0; row < mapData.length; row++) {
            for (let col = 0; col < mapData[row].length; col++) {
                const tile = mapData[row][col];
                if (tile === 'P' || tile === 'sP' || tile === 'edP' || tile === 'jP') {
                    return { row, col };
                }
            }
        }
        return null;
    };

    const getLocationDisplayName = (mapName) => {
        switch(mapName) {
            case 'main':
                return "Dragon Lair";
            case 'Jungle City':
                return "Jungle City";
            case 'Dragon Lair':
                return "Dragon's Cave";
            case 'Crossroads City':
                return "Crossroads City";
            default:
                return "Dragon Lair";
        }
    };

    return (
        <div className="game-page">
            <h1>{getLocationDisplayName(currentMap)}</h1>
            <div className="back-btn-container">
                <button className="back-btn" onClick={goBack}>
                    <i className="bi bi-arrow-left"></i> 
                </button>
            </div>
            <div className="score-display">
                <p>Score: {score}</p>
            </div>

            <div className="map-container">
                {map.length > 0 ? (
                    <MapRenderer 
                        map={map} 
                        tileSize={tileSize} 
                        dragonPosition={dragonPositions[currentMap]}
                        selectedCharacter={selectedCharacter} 
                    />
                ) : (
                    <p>Loading map...</p>
                )}
            </div>
            <Inventory 
                inventory={inventory} 
                inventoryWeight={inventoryWeight}
                maxWeight={weightThresholds.max}
                characterType={selectedCharacter.name}
            />
            {paused && <PauseMenu onResume={() => setPaused(false)} onQuit={() => navigate('/')} />}
            <InteractionPopup 
                isVisible={isVisible} 
                popupMessage={popupMessage} 
                onClose={() => setIsVisible(false)} 
            />
            {gameOver && (
                <GameOverOverlay
                    message={popupMessage}
                    onQuit={() => navigate('/')}
                    score={score}
                />
            )}
            <DropItemPopup
                isOpen={isOpen}
                inventory={inventory}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                handleDrop={handleDrop}
                onClose={() => setIsOpen(false)}
            />
        </div>
    );
};

export default GamePage;
