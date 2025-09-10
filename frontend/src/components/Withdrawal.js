import React, { useState } from 'react';
import './FormPages.css';

function Withdrawal({ onBack }) {
    const [activeTab, setActiveTab] = useState('bank');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Withdrawal request submitted!');
        onBack();
    };

    return (
        <div className="form-page-container">
            <div className="form-page-header">
                <button onClick={onBack} className="back-button">←</button>
                <h1>Withdrawal</h1>
            </div>
            
            <div className="deposit-tabs">
                <button 
                    className={`tab-button ${activeTab === 'bank' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bank')}
                >
                    Bank Transfer
                </button>
                <button 
                    className={`tab-button ${activeTab === 'upi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upi')}
                >
                    UPI
                </button>
                <button 
                    className={`tab-button ${activeTab === 'crypto' ? 'active' : ''}`}
                    onClick={() => setActiveTab('crypto')}
                >
                    Crypto (USDT)
                </button>
            </div>

            <form onSubmit={handleSubmit} className="deposit-form">
                <div className="form-input-group">
                    <label htmlFor="amount">Amount to Withdraw (INR)</label>
                    <input type="number" id="amount" placeholder="Enter amount" required />
                </div>
                {activeTab === 'bank' && (
                    <div className="tab-content">
                        <h3>Bank Account Details</h3>
                        <div className="form-input-group"><input type="text" placeholder="Account Holder Name" required /></div>
                        <div className="form-input-group"><input type="text" placeholder="Account Number" required /></div>
                        <div className="form-input-group"><input type="text" placeholder="IFSC Code" required /></div>
                    </div>
                )}
                {activeTab === 'upi' && (
                    <div className="tab-content">
                         <h3>UPI Details</h3>
                         <div className="form-input-group"><input type="text" placeholder="UPI ID (e.g., yourname@upi)" required /></div>
                    </div>
                )}
                {activeTab === 'crypto' && (
                     <div className="tab-content">
                         <h3>Crypto Wallet</h3>
                         <div className="form-input-group"><input type="text" placeholder="USDT TRC20 Address" required /></div>
                    </div>
                )}
                <button type="submit" className="form-submit-button">Submit Request</button>
            </form>
        </div>
    );
}

export default Withdrawal;
