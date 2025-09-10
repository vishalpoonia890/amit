import React from 'react';
import './FormPages.css';

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
}).format(amount || 0);

function Wallet({ onBack, financialSummary }) {
    // Mocking some data that would come from an API
    const mockData = {
        referralIncome: 1250.75,
        dailyIncome: 350.50,
        allTimeTotal: (financialSummary?.balance || 0) + (financialSummary?.withdrawable_wallet || 0) + 1250.75,
    };

    return (
        <div className="form-page-container wallet-page">
            <div className="form-page-header">
                <button onClick={onBack} className="back-button">←</button>
                <h1>My Wallet</h1>
            </div>
            
            <div className="wallet-grid">
                <div className="wallet-card primary">
                    <span className="wallet-title">Total Income (All Time)</span>
                    <span className="wallet-value">{formatCurrency(mockData.allTimeTotal)}</span>
                </div>
                <div className="wallet-card">
                    <span className="wallet-title">Deposit Balance</span>
                    <span className="wallet-value">{formatCurrency(financialSummary?.balance)}</span>
                </div>
                 <div className="wallet-card">
                    <span className="wallet-title">Withdrawable Balance</span>
                    <span className="wallet-value">{formatCurrency(financialSummary?.withdrawable_wallet)}</span>
                </div>
                <div className="wallet-card">
                    <span className="wallet-title">Today's Income</span>
                    <span className="wallet-value">{formatCurrency(mockData.dailyIncome)}</span>
                </div>
                <div className="wallet-card">
                    <span className="wallet-title">Referral Income</span>
                    <span className="wallet-value">{formatCurrency(mockData.referralIncome)}</span>
                </div>
            </div>
        </div>
    );
}

export default Wallet;
