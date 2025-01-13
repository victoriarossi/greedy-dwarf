// CharacterStats.js

// Base stats for the Warrior Dwarf (current default stats)
export const BASE_WEIGHT_THRESHOLDS = {
    light: 30,
    medium: 50,
    heavy: 70,
    max: 100
};

export const BASE_MOVEMENT_DELAYS = {
    light: 50,      // No delay when lightly loaded
    medium: 250,   // 250ms delay when moderately loaded
    heavy: 500     // 500ms delay when heavily loaded
};

// Character-specific stat modifiers
export const CHARACTER_STATS = {
    "Warrior Dwarf": {
        weightModifier: 1.0,      // Base carrying capacity
        speedModifier: 1.0,       // Base movement speed
        description: "Balanced speed and carrying capacity"
    },
    "Miner Dwarf": {
        weightModifier: 1.5,      // 50% more carrying capacity
        speedModifier: 0.7,       // 30% slower movement
        description: "Higher carrying capacity but slower movement speed"
    },
    "Scout Dwarf": {
        weightModifier: 0.7,      // 30% less carrying capacity
        speedModifier: 3.0,       // 50% faster movement
        description: "Faster movement speed but lower carrying capacity"
    }
};

// Get modified weight thresholds for a specific character
export const getCharacterWeightThresholds = (characterName) => {
    const character = CHARACTER_STATS[characterName];
    if (!character) {
        console.warn(`Character "${characterName}" not found, using default stats`);
        return BASE_WEIGHT_THRESHOLDS;
    }
    return {
        light: Math.round(BASE_WEIGHT_THRESHOLDS.light * character.weightModifier),
        medium: Math.round(BASE_WEIGHT_THRESHOLDS.medium * character.weightModifier),
        heavy: Math.round(BASE_WEIGHT_THRESHOLDS.heavy * character.weightModifier),
        max: Math.round(BASE_WEIGHT_THRESHOLDS.max * character.weightModifier)
    };
};

// Calculate actual movement delay based on character and current weight
export const calculateMovementDelay = (characterName, currentWeight) => {
    const character = CHARACTER_STATS[characterName];
    if (!character) {
        console.warn(`Character "${characterName}" not found, using default movement delay`);
        return 0;
    }

    const thresholds = getCharacterWeightThresholds(characterName);
    
    // Return movement delay based on weight and character speed
    if (currentWeight <= thresholds.light) {
        return Math.round(BASE_MOVEMENT_DELAYS.light / character.speedModifier);
    } else if (currentWeight <= thresholds.medium) {
        return Math.round(BASE_MOVEMENT_DELAYS.medium / character.speedModifier);
    } else if (currentWeight <= thresholds.heavy) {
        return Math.round(BASE_MOVEMENT_DELAYS.heavy / character.speedModifier);
    } else if (currentWeight > thresholds.max) {
        return null; // Too heavy to move
    }
    
    // If between heavy and max, use heavy delay
    return Math.round(BASE_MOVEMENT_DELAYS.heavy / character.speedModifier);
};