import React from 'react';
import { weightColors } from './constants';
import '../css/Inventory.css';

const getItemImageSrc = (item) => {
    try {
        return require(`../imgs/${item.startsWith("K")?"Key":item}.png`);
    } catch (error) {
        console.warn(`Image for ${item} not found. Defaulting to placeholder.`);
    }
};

const Inventory = ({ inventory, inventoryWeight, maxWeight, characterType }) => {
    const getWeightColor = (weight) => {
        const weightPercentage = (weight / maxWeight) * 100;
        if (weightPercentage <= 30) {
            return weightColors.light;
        } else if (weightPercentage <= 50) {
            return weightColors.medium;
        } else if (weightPercentage <= 70) {
            return weightColors.heavy;
        } else {
            return weightColors.tooHeavy;
        }
    };

    const inventoryWeightColor = getWeightColor(inventoryWeight);

    return (
        <div className="inventory">
            <div className="inventory-header">
                <h2>{characterType}'s Inventory</h2>
                <div className="weight-status">
                    <div className="weight-info">
                        <span style={{ color: inventoryWeightColor }}>
                            Weight: {inventoryWeight}/{maxWeight}
                        </span>
                        <div className="weight-bar-container">
                            <div 
                                className="weight-bar"
                                style={{
                                    width: `${Math.min((inventoryWeight / maxWeight) * 100, 100)}%`,
                                    backgroundColor: inventoryWeightColor
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {inventory.length === 0 ? (
                <p className="no-items">No items collected yet.</p>
            ) : (
                <div className="inventory-items">
                    {Object.entries(
                        inventory.reduce((acc, item) => {
                            const displayName = item.startsWith("K") ? `Key${item.substring(1)}` : item;
                            acc[displayName] = (acc[displayName] || 0) + 1;
                            return acc;
                        }, {})
                    ).map(([item, count]) => (
                        <div className="inventory-item" key={item}>
                            <p>{count > 1 ? `${count}x` : ''}</p>
                            <img
                                src={getItemImageSrc(item)}
                                alt={item}
                                className="inventory-item-image"
                            />
                            {item.startsWith("K") ? <p>{item.slice(-1)}</p> : <p></p>}
                        </div>
                    ))}
                </div>
            )}
            <p className="drop-text">To drop an item from your inventory, press 'm'</p>
        </div>
    );
};


export default Inventory;
