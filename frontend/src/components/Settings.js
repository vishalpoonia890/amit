// src/components/Settings.js
import React, { useState } from 'react';
import EditProfileModal from './EditProfileModal'; // Import the new modal

function Settings({ token, userData, onUserDataUpdate, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // You can implement these history views later
  const viewDepositHistory = () => alert("Deposit History view coming soon!");
  const viewWithdrawalHistory = () => alert("Withdrawal History view coming soon!");

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>
      <div className="settings-options">
        <button className="settings-option-btn" onClick={() => setIsModalOpen(true)}>
          <span className="icon">👤</span>
          <span>Update Profile</span>
        </button>
        <button className="settings-option-btn" onClick={viewDepositHistory}>
          <span className="icon">📥</span>
          <span>Deposit History</span>
        </button>
        <button className="settings-option-btn" onClick={viewWithdrawalHistory}>
          <span className="icon">📤</span>
          <span>Withdrawal History</span>
        </button>
        <button className="settings-option-btn logout" onClick={onLogout}>
          <span className="icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
      
      {/* Conditionally render the modal */}
      {isModalOpen && (
        <EditProfileModal
          token={token}
          userData={userData}
          onUserDataUpdate={onUserDataUpdate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Settings;
