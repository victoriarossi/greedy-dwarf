// Tiles the dwarf can walk on
export const walkableTiles = ["E", "P"]; 

// Tiles that trigger interaction
export const interactiveTiles = ["T", "B1", "B2", "B3", "B4", "ruby", "ring", "gold", "shield", "sword", "potion", "diamond","armor", "K1", "K2", "K3", "K4", "emerald", "crown", "scroll", "dragonegg"];

// Number of rows and columns
export const NUM_ROWS = 17; 
export const NUM_COLS = 27; 

// Possible treasures for main map
export const mainMapTreasures = ["gold", "sword", "diamond", "armor", "ruby", "shield", "potion", "ring"];

// Possible treasures for POIs
export const poiMapTreasures = ["emerald", "crown", "scroll", "dragonegg"];

export const treasuresScores = {
    gold: 15,
    sword: 10,
    diamond: 50,
    armor: 10,
    ruby: 30,
    shield: 10,
    potion: 15,
    ring: 25,
    key: 1,
    emerald: 40,
    crown: 100,
    scroll: 75,
    dragonegg: 100,
};
export const treasuresWeights = {
    gold: 15,
    sword: 20,
    diamond: 5,
    armor: 30,
    ruby: 10,
    shield: 20,
    potion: 10,
    ring: 5,
    key: 1,
    emerald: 15,
    crown: 40,
    scroll: 35,
    dragonegg: 40,
};
export const keyWeight = 1; // Key weight

// Thresholds for weight categories
export const weightThresholds = {
    light: 30,
    medium: 50,
    heavy: 80,
    max: 100, // Max weight
};

// Colors for each weight category
export const weightColors = {
    light: "#4CAF50",    // Green: Light weight (easy to carry)
    medium: "#FF9800",   // Orange: Medium weight (manageable)
    heavy: "#FF5722",    // Dark Orange/Red: Heavy weight (challenging)
    tooHeavy: "#D32F2F"  // Red: Too heavy (difficult to carry)
};
