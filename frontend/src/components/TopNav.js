import React, { useState } from 'react'; // Import useState
import './TopNav.css';
import { BellIcon, ThemeIcon } from './Icons'; // Assuming Icons.js for SVGs

function TopNav({ theme, toggleTheme, financialSummary, unreadNotificationCount, onNotificationClick }) { // Added unreadNotificationCount, onNotificationClick
    
    // Calculate total balance safely
    const totalBalance = (financialSummary?.balance || 0) + (financialSummary?.withdrawable_wallet || 0);

    return (
        <header className="top-nav">
            <div className="nav-left">
                <button onClick={toggleTheme} className="icon-btn theme-toggle">
                    <ThemeIcon theme={theme} />
                </button>
            </div>
            <div className="nav-center">
                <div className="balance-display">
                    <span className="balance-label">Total Balance</span>
                    <span className="balance-amount">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
            <div className="nav-right">
                <button onClick={onNotificationClick} className="icon-btn notification-btn">
                    <BellIcon />
                    {unreadNotificationCount > 0 && (
                        <span className="notification-badge">{unreadNotificationCount}</span>
                    )}
                </button>
            </div>
        </header>
    );
}

export default TopNav;
