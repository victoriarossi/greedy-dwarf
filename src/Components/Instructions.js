import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Instructions.css';

const Instructions = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const treasureData = [
        { item: "Diamond", value: 50, weight: 5, ratio: 10.0 },
        { item: "Ring", value: 25, weight: 5, ratio: 5.0 },
        { item: "Ruby", value: 30, weight: 10, ratio: 3.0 },
        { item: "Scroll", value: 75, weight: 35, ratio: 2.14 },
        { item: "Dragon Egg", value: 100, weight: 40, ratio: 2.5 },
        { item: "Crown", value: 100, weight: 40, ratio: 2.5 },
        { item: "Emerald", value: 40, weight: 15, ratio: 2.67 },
        { item: "Potion", value: 15, weight: 10, ratio: 1.5 },
        { item: "Gold", value: 15, weight: 15, ratio: 1.0 },
        { item: "Sword", value: 10, weight: 20, ratio: 0.5 },
        { item: "Shield", value: 10, weight: 20, ratio: 0.5 },
        { item: "Armor", value: 10, weight: 30, ratio: 0.33 },
        { item: "Key", value: 1, weight: 1, ratio: 1.0 },
    ].sort((a, b) => b.ratio - a.ratio); // Sort by ratio descending

    return (
        <div className='instructions-wrapper'>
            <div className="back-btn-container">
                <button className="back-btn" onClick={goBack}>
                    <i className="bi bi-arrow-left"></i> 
                </button>
            </div>
            <h1>Instructions</h1>
            <section className="instructions">
                <h2>Description</h2>
                <p>"Greedy Dwarf" is a fast-paced, roguelite game where players control a dwarf navigating dungeons to steal treasure from a dragon. 
                    The players should collect all the treasure they can while trying to avoid the dragon. 
                    But be careful, the more treasure you carry, the slower you move.</p>

                <h2>Objective</h2>
                <p>Navigate the Dragon's Lair and collect as much treasure as possible before the dragon catches you.</p>
                
                <h2>How to Play</h2>
                <ol>
                    <li><strong>Control Your Dwarf:</strong> Use the directional controls to move through the lair (WASD or arrows).</li>
                    <li><strong>Collect Treasure:</strong> Approach and collect treasures to increase your score. But have in mind that carrying too much slows you down!</li>
                    <li><strong>Navigate Obstacles:</strong> Avoid walls and locked doors as you explore. Strategy is key—plan your path wisely.</li>
                </ol>

                <h2>Game Features</h2>
                <ul>
                    <li><strong>Customizable Lair:</strong> Explore a lairs defined by a flexible map, offering unique environments and challenges.</li>
                    <li><strong>Strategic Play:</strong> Balance speed and treasure collection to optimize your escape route by choosing between one of three characters,
                    of which two sacrifice speed or carrying capacity for increased ability points in the other.</li>
                </ul>

                <h2>Treasure Guide</h2>
                <p>Not all treasures are equally valuable for their weight. Here's a guide to help you make strategic decisions about what to carry:</p>
                <table className="treasure-table">
                    <thead>
                        <tr>
                            <th>Treasure</th>
                            <th>Value</th>
                            <th>Weight</th>
                            <th>Value:Weight Ratio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {treasureData.map(({ item, value, weight, ratio }) => (
                            <tr key={item}>
                                <td>{item}</td>
                                <td>{value}</td>
                                <td>{weight}</td>
                                <td>{ratio.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className='note'><strong>Note:</strong> Items with a Value/Weight ratio greater than 1.0 are worth carrying, as they provide more value than the burden of their weight.</p>
            </section>
        </div>
    );
}

export default Instructions;