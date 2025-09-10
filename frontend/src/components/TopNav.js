import React from 'react';
import './TopNav.css';

function TopNav({ theme, toggleTheme, onLogout, isAdmin, onViewChange, financialSummary }) {

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount || 0);

    // Calculate total balance
    const totalBalance = (financialSummary?.balance || 0) + (financialSummary?.withdrawable_wallet || 0);

    return (
        <header className="top-nav">
            <div className="top-nav-content">
                <div className="logo">
                    InvestmentPro
                </div>
                <div className="nav-actions">
                    {!isAdmin && (
                        <div className="total-balance">
                           💰 {formatCurrency(totalBalance)}
                        </div>
                    )}
                    <button onClick={toggleTheme} className="theme-toggle">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button onClick={onLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}

export default TopNav;

