import React from 'react';
import './TransactionHistory.css';

function TransactionHistory({ onBack }) {
  return (
    <div className="transaction-history-view">
      <div className="header">
        <button onClick={onBack} className="back-button">←</button>
        <h1>Transaction History</h1>
      </div>
      <div className="content-area">
        <p>This feature is coming soon.</p>
        {/* You can add a list of transactions here later */}
      </div>
    </div>
  );
}

export default TransactionHistory;
