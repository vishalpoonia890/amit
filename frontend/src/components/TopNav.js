// src/components/TopNav.js
import React, { useState, useEffect } from 'react';
import './TopNav.css';

/**
 * Top Navigation Bar Component
 * @param {object} props - Component properties
 * @param {string} props.theme - Current theme ('light' or 'dark')
 * @param {function} props.toggleTheme - Function to switch theme
 * @param {function} props.onLogout - Function to handle user logout
 * @param {boolean} props.isAdmin - Flag for admin user status
 * @param {function} props.onViewChange - Function to change main view
 * @param {object} props.financialSummary - Object containing balance details:
 * { depositBalance, withdrawableBalance, todaysIncome, totalIncome }
 */
function TopNav({ theme, toggleTheme, onLogout, isAdmin, onViewChange, financialSummary }) {
    const [showFullLogo, setShowFullLogo] = useState(window.innerWidth > 768);
    const [showBalanceDetails, setShowBalanceDetails] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setShowFullLogo(window.innerWidth > 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Formatter for the main compact balance display in the navbar
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) {
            return '0'; // Return only number for compact display
        }
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount).replace('₹', ''); // Remove currency symbol for cleaner look next to static symbol
    };

    // Formatter for the detailed view in the hover box
    const formatDetailedCurrency = (amount) => {
        if (amount === null || amount === undefined) {
            return '₹0.00';
        }
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <header className="top-nav">
            <div className="top-nav-left">
                <div className="top-nav-logo-wrapper">
                    {showFullLogo ? (
                        <span className="logo-text">InvestmentPlus</span>
                    ) : (
                        <span className="logo-circle">IP</span>
                    )}
                </div>
            </div>

            {/* Balance display section with hover functionality */}
            <div
                className="top-nav-balance-wrapper"
                onMouseEnter={() => setShowBalanceDetails(true)}
                onMouseLeave={() => setShowBalanceDetails(false)}
            >
                <div className="top-nav-balance-display">
                    <span className="balance-symbol">₹</span>
                    {/* UPDATED: Display depositBalance from financialSummary prop */}
                    <strong className="balance-amount">{formatCurrency(financialSummary?.depositBalance)}</strong>
                </div>

                {showBalanceDetails && financialSummary && (
                    <div className="balance-details-box">
                        <h4>Account Summary</h4>
                        {/* UPDATED: Mapped to new financial summary structure per your request */}
                        <p><span>Deposit Balance:</span> <strong>{formatDetailedCurrency(financialSummary.depositBalance)}</strong></p>
                        <p><span>Withdrawable Balance:</span> <strong>{formatDetailedCurrency(financialSummary.withdrawableBalance)}</strong></p>
                        <p><span>Today's Income:</span> <strong>{formatDetailedCurrency(financialSummary.todaysIncome)}</strong></p>
                        <p><span>Total Income:</span> <strong>{formatDetailedCurrency(financialSummary.totalIncome)}</strong></p>
                    </div>
                )}
            </div>

            {/* Right side controls */}
            <div className="top-nav-right">
                {isAdmin && (
                    <button className="admin-panel-btn" onClick={() => onViewChange('admin-panel')}>
                        Admin Panel
                    </button>
                )}
                <button onClick={toggleTheme} className="theme-toggle">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button onClick={onLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </header>
    );
}

export default TopNav;
