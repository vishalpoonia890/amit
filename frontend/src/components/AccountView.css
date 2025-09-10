import React from 'react';
import './AccountView.css';

// Helper to format currency
const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
}).format(amount || 0);

function AccountView({ userData, financialSummary, onViewChange, onLogout }) {

    const handleClaimEarnings = () => {
        // This would call an API to move today's earnings to the main wallet
        alert("Today's earnings claimed!");
    };

    return (
        <div className="account-view-container">
            {/* --- User Profile Section --- */}
            <section className="profile-header-section">
                <img 
                    src={userData?.avatar_url || `https://i.pravatar.cc/150?u=${userData?.id}`} 
                    alt="User Avatar" 
                    className="profile-avatar"
                />
                <div className="profile-info">
                    <h2 className="profile-name">{userData?.name || 'User'}</h2>
                    <p className="profile-details">
                        <span>📞 {userData?.mobile || 'N/A'}</span>
                        <span>📍 Singapore</span>
                    </p>
                </div>
            </section>

            {/* --- Today's Earnings Section --- */}
            <section className="earnings-section">
                <div className="earnings-info">
                    <span className="earnings-label">Today's Earnings</span>
                    <span className="earnings-amount">{formatCurrency(134.00)}</span> {/* Placeholder */}
                </div>
                <button className="claim-button" onClick={handleClaimEarnings}>Claim</button>
            </section>

            {/* --- Financial Info Grid --- */}
            <section className="financial-grid">
                <div className="grid-card">
                    <span className="card-label">Withdrawal</span>
                    <span className="card-value">{formatCurrency(financialSummary?.withdrawable_wallet)}</span>
                </div>
                <div className="grid-card">
                    <span className="card-label">Recharge</span>
                    <span className="card-value">{formatCurrency(financialSummary?.balance)}</span>
                </div>
                <div className="grid-card">
                    <span className="card-label">Today</span>
                    <span className="card-value">{formatCurrency(134.00)}</span> {/* Placeholder */}
                </div>
                 <div className="grid-card">
                    <span className="card-label">Total YID</span>
                    <span className="card-value">{formatCurrency(1970.00)}</span> {/* Placeholder */}
                </div>
                 <div className="grid-card">
                    <span className="card-label">Team</span>
                    <span className="card-value">{formatCurrency(0.00)}</span> {/* Placeholder */}
                </div>
                 <div className="grid-card">
                    <span className="card-label">Total</span>
                    <span className="card-value">{formatCurrency(financialSummary?.balance + financialSummary?.withdrawable_wallet)}</span>
                </div>
            </section>

            {/* --- Action Buttons --- */}
            <section className="account-actions">
                <button className="action-button recharge" onClick={() => onViewChange('deposit')}>Recharge</button>
                <button className="action-button withdraw" onClick={() => onViewChange('withdraw')}>Withdraw</button>
            </section>

            {/* --- Menu List --- */}
            <section className="account-menu">
                <button className="menu-list-item" onClick={() => onViewChange('my-products')}>My Products</button>
                <button className="menu-list-item" onClick={() => onViewChange('transactions')}>Transaction History</button>
                <button className="menu-list-item" onClick={() => onViewChange('wallet')}>Wallet Details</button>
                <button className="menu-list-item" onClick={() => onViewChange('team')}>My Team</button>
                <button className="menu-list-item" onClick={() => onViewChange('support')}>Customer Support</button>
                <button className="menu-list-item logout" onClick={onLogout}>Logout</button>
            </section>
        </div>
    );
}

export default AccountView;
