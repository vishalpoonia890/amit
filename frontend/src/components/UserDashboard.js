// src/components/UserDashboard.js

import React from 'react';
import './UserDashboard.css';

// Mock data for product display placeholders. Replace with API data as needed.
const mockProductData = {
    "Best Sellers": [
        { id: 101, name: 'Dolphin 20T Plan', brand: 'Primary Tier', imageUrl: 'https://via.placeholder.com/250x150/FF9800/FFFFFF?text=Plan+A', price: 1500, roi: 2.67, duration: 18 },
        { id: 102, name: 'Elephant T40 Plan', brand: 'Primary Tier', imageUrl: 'https://via.placeholder.com/250x150/4CAF50/FFFFFF?text=Plan+B', price: 2500, roi: 2.0, duration: 30 },
    ],
    "VIP Investments": [
        { id: 201, name: 'VIP Gold Plan', brand: 'Exclusive Tier', imageUrl: 'https://via.placeholder.com/250x150/2196F3/FFFFFF?text=VIP+Gold', price: 50000, roi: 2.0, duration: 60 },
        { id: 202, name: 'VIP Platinum Plan', brand: 'Exclusive Tier', imageUrl: 'https://via.placeholder.com/250x150/9C27B0/FFFFFF?text=VIP+Platinum', price: 100000, roi: 2.5, duration: 60 },
    ],
};

// Helper to format currency
const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
}).format(amount || 0);

// --- Financial Summary Component ---
const FinancialSummary = ({ summary }) => {
    return (
        <section className="financial-summary-container">
            <div className="financial-summary-grid">
                <div className="summary-card">
                    <span className="summary-title">Deposit Balance</span>
                    <span className="summary-value">{formatCurrency(summary?.depositBalance)}</span>
                </div>
                <div className="summary-card">
                    <span className="summary-title">Withdrawable Balance</span>
                    <span className="summary-value">{formatCurrency(summary?.withdrawableBalance)}</span>
                </div>
                <div className="summary-card small">
                    <span className="summary-title">Today's Income</span>
                    <span className="summary-value small-positive">{formatCurrency(summary?.todaysIncome)}</span>
                </div>
                <div className="summary-card small">
                    <span className="summary-title">Total Income</span>
                    <span className="summary-value small">{formatCurrency(summary?.totalIncome)}</span>
                </div>
            </div>
        </section>
    );
};

// --- Main Dashboard Component ---
function UserDashboard({ onViewChange, financialSummary }) {
    return (
        <div className="dashboard-container">
            {/* --- Financial Summary Section --- */}
            <FinancialSummary summary={financialSummary} />

            {/* --- Quick Access Menu --- */}
            <section className="quick-access-menu">
                <div className="menu-grid">
                    <button className="menu-item" onClick={() => onViewChange('recharge')}>
                        <span role="img" aria-label="deposit">💰</span> Deposit
                    </button>
                    <button className="menu-item" onClick={() => onViewChange('withdraw')}>
                        <span role="img" aria-label="withdraw">💸</span> Withdraw
                    </button>
                    <button className="menu-item" onClick={() => onViewChange('team')}> {/* Assuming 'team' view exists */}
                        <span role="img" aria-label="team">👨‍👩‍👧‍👦</span> Team
                    </button>
                     <button className="menu-item" onClick={() => onViewChange('app-download')}> {/* Assuming 'app-download' view exists */}
                        <span role="img" aria-label="app">📱</span> App
                    </button>
                </div>
            </section>
            
            <div className="home-banner">
                {/* Placeholder for banner image */}
            </div>

            {/* --- Product category sections (using mock data) --- */}
            {Object.entries(mockProductData).map(([category, products]) => (
                <section key={category} className="product-category-section">
                    <h2>{category}</h2>
                    <div className="product-carousel">
                        {products.map(product => {
                            const dailyIncome = (product.price * product.roi) / 100;
                            return (
                                <div key={product.id} className="product-card-dashboard" onClick={() => onViewChange('plans')}>
                                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                                    <div className="product-info-dashboard">
                                        <h4 className="product-name">{product.name}</h4>
                                        <p className="product-brand">{product.brand}</p>
                                        <div className="product-details-dashboard">
                                            <div><span>Price:</span> <strong>{formatCurrency(product.price)}</strong></div>
                                            <div><span>Daily Income:</span> <strong className="roi-highlight">{formatCurrency(dailyIncome)}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            <div className="browse-all-container">
                <button className="browse-all-btn" onClick={() => onViewChange('plans')}>
                    Browse All Products
                </button>
            </div>
        </div>
    );
}

export default UserDashboard;
