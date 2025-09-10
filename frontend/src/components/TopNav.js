import React from 'react';
import './TopNav.css';

function TopNav({ theme, toggleTheme, onLogout, financialSummary }) {
    
    // Calculate total balance safely
    const totalBalance = (financialSummary?.balance || 0) + (financialSummary?.withdrawable_wallet || 0);

    // SVG for the Power Icon
    const PowerIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
            <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
    );
    
    // SVG for the Theme Icon (Sun/Moon)
    const ThemeIcon = () => (
        theme === 'dark' ? 
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg> : 
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    );


    return (
        <header className="top-nav">
            <div className="nav-left">
                <button onClick={toggleTheme} className="icon-btn theme-toggle">
                    <ThemeIcon />
                </button>
            </div>
            <div className="nav-center">
                <div className="balance-display">
                    <span className="balance-label">Total Balance</span>
                    <span className="balance-amount">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
            <div className="nav-right">
                <button onClick={onLogout} className="icon-btn logout-btn">
                    <PowerIcon />
                </button>
            </div>
        </header>
    );
}

export default TopNav;

