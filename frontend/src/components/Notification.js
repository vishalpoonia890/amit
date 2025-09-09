// src/components/Notification.js
import React, { useEffect } from 'react';

function Notification({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Hide after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`notification-toast ${show ? 'show' : ''}`}>
       {message}
    </div>
  );
}

export default Notification;
