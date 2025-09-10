import React, { useEffect } from 'react';

function Notification({ message, type, show, onClose }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div className={`notification ${type} ${show ? 'show' : ''}`}>
            {message}
        </div>
    );
}

export default Notification;
