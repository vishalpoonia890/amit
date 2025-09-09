// src/components/Wallet.js
import React from 'react';

function Wallet({ onViewChange }) {
  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h1>My Wallet</h1>
        <p>Manage your funds and referrals in one place.</p>
      </div>
      <div className="wallet-actions">
        <button className="wallet-action-btn deposit" onClick={() => onViewChange('recharge')}>
          <span className="icon">➕</span>
          <span>Deposit Money</span>
          <span className="description">Add funds to your account.</span>
        </button>
        <button className="wallet-action-btn withdraw" onClick={() => onViewChange('withdraw')}>
          <span className="icon">➖</span>
          <span>Withdraw Money</span>
          <span className="description">Transfer earnings to your bank.</span>
        </button>
        <button className="wallet-action-btn refer" onClick={() => onViewChange('refer')}>
          <span className="icon">🔗</span>
          <span>Refer a Friend</span>
          <span className="description">Earn commissions from referrals.</span>
        </button>
      </div>
    </div>
  );
}

export default Wallet;
