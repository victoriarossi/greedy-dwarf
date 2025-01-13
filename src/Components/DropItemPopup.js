import React from 'react';
import Popup from 'reactjs-popup';
import '../css/Game.css';

const DropItemPopup = ({ isOpen, inventory, selectedItem, setSelectedItem, handleDrop, onClose }) => {
    return (
        <Popup open={isOpen} modal onClose={onClose} className="inventory-popup">
            <div className="inventory-popup">
                <h2>Select an item to drop</h2>
                <ul className="inventory-list-popup">
                    {inventory.map((item, index) => (
                        <li key={index} className="inventory-item-popup">
                            <button className="item-button" onClick={() => setSelectedItem(item)}>
                                {item.startsWith("K") ? `Key ${item.substring(1)}` : item}
                            </button>
                        </li>
                    ))}
                </ul>
                {selectedItem && (
                    <div className="confirm-section">
                        <p>Drop {selectedItem.startsWith("K") ? `Key ${selectedItem.substring(1)}` : selectedItem}?</p>
                        <button className="confirm-button" onClick={() => handleDrop(selectedItem)}>
                            Yes
                        </button>
                        <button className="cancel-button" onClick={() => setSelectedItem(null)}>
                            No
                        </button>
                    </div>
                )}
            </div>
        </Popup>
    );
};

export default DropItemPopup;
