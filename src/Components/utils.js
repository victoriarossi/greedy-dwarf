import { mainMapTreasures, poiMapTreasures, NUM_ROWS, NUM_COLS, walkableTiles } from './constants';

// Function to calculate Manhattan distance
export const calculateDistance = (row1, col1, row2, col2) => {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
};

// Function to randomize treasures in the map
export const randomizeTreasures = (map, possibleTreasuresArray, mapName) => {
    const treasures = {};
    let availableKeys = ["K1", "K2", "K3", "K4"]; // Keys corresponding to doors B1 to B4
    const treasurePositions = [];

    // Collect all treasure chest positions
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            if (map[row][col] === "T") {
                treasurePositions.push({ row, col });
            }
        }
    }

    // Shuffle treasure positions to randomize key placement
    treasurePositions.sort(() => Math.random() - 0.5);

    // Assign treasures to chests
    treasurePositions.forEach(({ row, col }) => {
        const treasureKey = `${mapName}-${row}-${col}`;
        if (Math.random() < 0.25 && availableKeys.length > 0) {
            // 25% chance to assign a key
            const keyIndex = Math.floor(Math.random() * availableKeys.length);
            const keyId = availableKeys.splice(keyIndex, 1)[0]; // Remove the key from availableKeys
            treasures[treasureKey] = keyId;
        } else {
            // Assign a random treasure
            const randomTreasure = possibleTreasuresArray[Math.floor(Math.random() * possibleTreasuresArray.length)];
            treasures[treasureKey] = randomTreasure;
        }
    });

    return treasures;
};

// Function to find the dwarf's position
export const findDwarfPosition = (map) => {
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            if (map[row][col] === "D") {
                return { row, col };
            }
        }
    }
    return null;
};

// Function to check if a tile is a path or dwarf tile
export const isPathTile = (map, row, col) => {
    if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) return false;
    const tile = map[row][col];
    return walkableTiles.includes(tile) || tile === "D" || tile === "jP";
};

// Function to get all adjacent path tiles
export const getAdjacentPathOrDwarfTiles = (map, row, col) => {
    const directions = [
        { dRow: -1, dCol: 0 }, // Up
        { dRow: 1, dCol: 0 },  // Down
        { dRow: 0, dCol: -1 }, // Left
        { dRow: 0, dCol: 1 },  // Right
    ];

    const adjacent = [];

    for (const dir of directions) {
        const newRow = row + dir.dRow;
        const newCol = col + dir.dCol;
        
        // First check bounds
        if (newRow >= 0 && newRow < map.length && newCol >= 0 && newCol < map[0].length) {
            const tile = map[newRow][newCol];

            // Check if it's a walkable tile
            if (walkableTiles.includes(tile) || tile === "D" || tile === "jP") {
                adjacent.push({ 
                    row: newRow, 
                    col: newCol,
                    tile: tile
                });
            }
        }
    }

    return adjacent;
};

export const getAdjacentTiles = (map, row, col) => {
    const adjacent = [];
    const directions = [
        { row: -1, col: 0 }, // Up
        { row: 1, col: 0 },  // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 },  // Right
    ];

    for (const dir of directions) {
        const newRow = row + dir.row;
        const newCol = col + dir.col;

        if (newRow >= 0 && newRow < map.length && newCol >= 0 && newCol < map[0].length) {
            adjacent.push({
                tile: map[newRow][newCol],
                row: newRow,
                col: newCol,
            });
        }
    }

    return adjacent;
};