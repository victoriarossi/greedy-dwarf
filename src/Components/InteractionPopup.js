import {React, useEffect} from 'react';
import Popup from 'reactjs-popup';

const InteractionPopup = ({ isVisible, popupMessage, onClose }) => {
    useEffect(() => {
        let timer;
        if (isVisible) {
            // Set a timeout to close the popup after 2 seconds
            timer = setTimeout(() => {
                onClose(); // Trigger the onClose function to close the popup
            }, 2000); // 2000 milliseconds = 2 seconds
        }

        // Cleanup the timer if the component unmounts or isVisible changes
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [isVisible, onClose]); // Run effect when isVisible changes

    return (
        <Popup open={isVisible} onClose={onClose} modal>
            <div className="interaction-popup">
                <p dangerouslySetInnerHTML={{ __html: popupMessage }}></p>
            </div>
        </Popup>
    );
};

export default InteractionPopup;
