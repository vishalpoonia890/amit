// src/components/ReferralCard.js
import React from 'react';

function ReferralCard({ onViewChange }) {
  // This is a static presentational component
  // We can add logic to fetch the real referral link later if needed
  const handleCopy = () => {
    const referralCode = "AB123XYZ"; // This would come from props or API
    navigator.clipboard.writeText(referralCode);
    alert(`Referral code ${referralCode} copied to clipboard!`);
  };

  return (
    <div className="referral-cta-card">
      <div className="card-icon">🔗</div>
      <div className="card-content">
        <h3>Refer & Earn</h3>
        <p>Invite friends and earn a commission on their investments!</p>
      </div>
      <button className="card-button" onClick={handleCopy}>
        Copy Code
      </button>
    </div>
  );
}

export default ReferralCard;
