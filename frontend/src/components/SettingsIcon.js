// src/components/SettingsIcon.js
import React, { useState } from 'react';

function SettingsIcon({ onViewChange, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="settings-icon-container">
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="settings-button">
        ⚙️
      </button>
      {isMenuOpen && (
        <div className="settings-dropdown">
          <button onClick={() => { onViewChange('settings'); setIsMenuOpen(false); }}>
            Update Profile
          </button>
          <button onClick={() => alert('History page coming soon!')}>
            History
          </button>
          <button onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default SettingsIcon;
