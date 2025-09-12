import React, {useEffect } from 'react';
import './Snackbar.css';

// This is the simple component for showing brief messages like "Login successful".
function Snackbar({ message, type, show, onClose }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto-hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div className={`snackbar ${type} show`}>
            <div className="snackbar-message">{message}</div>
            <button onClick={onClose} className="snackbar-close-btn">&times;</button>
        </div>
    );
}

export default Snackbar;

