import React from 'react';

// A generic Icon wrapper if you need it for other icons
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// --- Icons for TopNav ---
export const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

export const ThemeIcon = ({ theme }) => (
    theme === 'light' 
    ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
);

// --- Icons for UserDashboard ---
export const DepositIcon = () => <span>💰</span>;
export const WithdrawIcon = () => <span>💸</span>;
export const RewardsIcon = () => <span>🎁</span>;
export const SellUsdtIcon = () => (
    <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#26A17B"/>
        <path d="M68 32H32V40H46V68H54V40H68V32Z" fill="white"/>
    </svg>
);
export const TeamIcon = () => <span>👥</span>;
export const SupportIcon = () => <span>💬</span>;
export const WalletIcon = () => <span>💼</span>;
export const PromotionsIcon = () => <span>🔥</span>;

// --- Icons for Sell USDT Page ---
export const BitcoinIcon = () => <span>💡</span>;
export const TwentyDayIcon = () => <span>🛡️</span>;
export const QuickDisbursalIcon = () => <span>⚡️</span>;

// --- Icons for the "How to Play" section in the Game Lobby ---
export const SelectGameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
);

export const PlaceBetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V6.375m18 10.5-18-10.5" />
    </svg>
);

export const WinBigIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 119 0zM16.5 18.75a9 9 0 11-18 0h18zM12 12.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v.008" />
    </svg>
);

// --- Crypto Icons ---
export const BtcIcon = () => <svg fill="#F7931A" viewBox="0 0 24 24"><path d="M16.6 13.92c.49-.29.81-.83.81-1.42 0-.92-.75-1.67-1.67-1.67h-1.61v3.33h1.61c.45 0 .87-.17 1.18-.47l-.32-.37zm-1.6-4.17h2.15c.92 0 1.67.75 1.67 1.67s-.75 1.67-1.67 1.67h-2.15V9.75zm3.33 5h-2.15c-.45 0-.87.17-1.18.47l.32.37c.49.29.81.83.81 1.42 0 .92-.75 1.67-1.67 1.67h-2.15v-5h-1.06v5.62c0 .35-.28.63-.63.63H10.5c-.35 0-.63-.28-.63-.63V7.75c0-.35.28-.63.63-.63h3.75c.35 0 .63.28.63.63v1.07h1.61c1.47 0 2.65.96 2.65 2.15 0 .8-.5 1.5-1.21 1.85l1.43 1.67c.2.23.16.58-.07.78-.11.1-.24.15-.37.15-.17 0-.33-.08-.44-.22l-1.4-1.64z"/></svg>;
export const EthIcon = () => <svg fill="#627EEA" viewBox="0 0 24 24"><path d="M12 1.75l-6.25 10.5 6.25 3.5 6.25-3.5L12 1.75zM12 17.25l-6.25-3.5 6.25 6.25 6.25-6.25-6.25 3.5z"/></svg>;
export const SolIcon = () => <svg fill="#9945FF" viewBox="0 0 24 24"><path d="M4 10.45h4.86v3.1H4zM9.8 4h4.4v3.1h-4.4zM9.8 16.9h4.4v3.1h-4.4zM15.14 10.45H20v3.1h-4.86z"/></svg>;
export const DogeIcon = () => <svg fill="#C2A633" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.68 15.15c-.32 0-.6-.11-.83-.29-.44-.35-.65-.9-.65-1.52V8.42c0-.62.21-1.17.65-1.52.23-.18.51-.29.83-.29.32 0 .6.11.83.29.44.35.65.9.65 1.52v6.92c0 .62-.21 1.17-.65 1.52-.23.18-.51.29-.83.29zm-4.32 0c-.32 0-.6-.11-.83-.29-.44-.35-.65-.9-.65-1.52V8.42c0-.62.21-1.17.65-1.52.23-.18.51-.29.83-.29s.6.11.83.29c.44.35.65.9.65 1.52v6.92c0 .62-.21 1.17-.65 1.52-.23.18-.51.29-.83.29z"/></svg>;
export const UsdtIcon = () => <svg fill="#26A17B" viewBox="0 0 24 24"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm4 6h-8v2h3v6h2v-6h3V8z"/></svg>;
export const XrpIcon = () => <svg fill="#23292F" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.18 4.29l1.18 1.18 1.18-1.18-1.18-1.18-1.18 1.18zM6.29 9.17l1.18 1.18 1.18-1.18-1.18-1.18-1.18 1.18zm8.24 0l1.18 1.18 1.18-1.18-1.18-1.18-1.18 1.18zm-4.12 2.96L9.23 15l-1.18-1.18 1.18-1.18 1.18 1.18zm5.29 0l-1.18 1.18-1.18-1.18 1.18-1.18 1.18 1.18zm-4.12 2.96l1.18 1.18 1.18-1.18-1.18-1.18-1.18 1.18z"/></svg>;
export const AdaIcon = () => <svg fill="#0033AD" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.03 4.28l5.03 2.9-5.03 2.9-5.03-2.9 5.03-2.9zm0 6.84l5.03 2.9-5.03 2.9-5.03-2.9 5.03-2.9z"/></svg>;


export default Icon;

