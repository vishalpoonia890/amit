import React from 'react';
import './TopNav.css';

// You may need to create this Icon component or use SVGs directly
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const ThemeIcon = ({ theme }) => (
    // Your theme icon SVG logic here
    <Icon path={theme === 'light' ? "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" : "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"} />
);

const BellIcon = () => (
    <Icon path="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
);


function TopNav({ theme, toggleTheme, financialSummary, unreadCount, onNotificationsClick }) {
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
                <button onClick={onNotificationsClick} className="icon-btn notification-btn">
                    <BellIcon />
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount}</span>
                    )}
                </button>
            </div>
        </header>
    );
}

export default TopNav;

