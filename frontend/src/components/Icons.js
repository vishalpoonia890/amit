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

// --- Icons for UserDashboard Quick Actions ---
export const DepositIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
export const WithdrawIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
export const RewardsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25v-8.25M12 4.875A2.625 2.625 0 1012 10.125A2.625 2.625 0 0012 4.875z" /></svg>);
export const SellUsdtIcon = () => ( <svg fill="currentColor" viewBox="0 0 24 24" ><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M16,8H8V10H11V16H13V10H16V8Z" /></svg> );
export const TeamIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.964A3 3 0 0012 12.75a3 3 0 00-3.75 2.25m5.25 2.964v.005M16.5 18.75a-9 9 0 10-12 0v.005" /></svg>);
export const SupportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.056 3 11.75c0 4.556 4.03 8.25 9 8.25z" /></svg>);
export const WalletIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 13.5v-1.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>);
export const PromotionsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 002.999.608z" /></svg>);

// --- Icons for UserDashboard "Why Choose Us" Section ---
export const InstantPayoutsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>);
export const SecurePlatformIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" /></svg>);
export const HighReturnsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5" /></svg>);
export const Support247Icon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 4.5-3-3m-3 3l3-3m0 0l-3-3m3 3l3 3M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
export const IntuitiveInterfaceIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H5.25A2.25 2.25 0 003 3.75v16.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 20.25V10.5M10.5 1.5L15 1.5m-4.5 0V5.625c0 .621.504 1.125 1.125 1.125h3.375c.621 0 1.125-.504 1.125-1.125V1.5m-4.5 0h3.375" /></svg>);
export const CommunityRewardsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 119 0zM16.5 18.75a9 9 0 11-18 0h18zM12 12.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /></svg>);

// --- Icons for UserDashboard Blog Section ---
export const BankVsInvestIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-6h6m-3-9a9 9 0 110 18 9 9 0 010-18z" /></svg>;
export const PassiveIncomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
export const FinancialFreedomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a12.022 12.022 0 00-5.84-2.56m0 0V3.34a12.022 12.022 0 00-5.84 2.56m5.84 2.56a6 6 0 015.84 7.38m-5.84-7.38a6 6 0 00-5.84 7.38m5.84-7.38L12 3.34m0 0l-2.25 2.25m2.25-2.25L14.25 5.6" /></svg>;
export const SmartInvestingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0h9.75" /></svg>;
export const LongTermGrowthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
export const DiversificationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Icons for GameLobby ---
export const SelectGameIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>);
export const PlaceBetIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V6.375m18 10.5-18-10.5" /></svg>);
export const WinBigIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 119 0zM16.5 18.75a9 9 0 11-18 0h18zM12 12.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v.008" /></svg>);
export const ZeroEdgeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5-2.25v.008H18M18.75 9l-1.5-2.25M3.375 6.75l1.5 2.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// --- Icon for Aviator Game ---
export const AutoCashOutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a12.022 12.022 0 00-5.84-2.56m0 0V3.34a12.022 12.022 0 00-5.84 2.56m5.84 2.56a6 6 0 015.84 7.38m-5.84-7.38a6 6 0 00-5.84 7.38m5.84-7.38L12 3.34m0 0l-2.25 2.25m2.25-2.25L14.25 5.6" /></svg>);

// ✅ FIX: This entire section was missing. It has now been restored.
// --- Crypto Icons ---
export const BitcoinIcon = () => <span>💡</span>; // Fallback, since BtcIcon is used elsewhere
export const BtcIcon = () => <svg fill="#F7931A" viewBox="0 0 24 24"><path d="M16.6 13.92c.49-.29.81-.83.81-1.42 0-.92-.75-1.67-1.67-1.67h-1.61v3.33h1.61c.45 0 .87-.17 1.18-.47l-.32-.37zm-1.6-4.17h2.15c.92 0 1.67.75 1.67 1.67s-.75 1.67-1.67 1.67h-2.15V9.75zm3.33 5h-2.15c-.45 0-.87.17-1.18.47l.32.37c.49.29.81.83.81 1.42 0 .92-.75 1.67-1.67 1.67h-2.15v-5h-1.06v5.62c0 .35-.28.63-.63.63H10.5c-.35 0-.63-.28-.63-.63V7.75c0-.35.28-.63.63-.63h3.75c.35 0 .63.28.63.63v1.07h1.61c1.47 0 2.65.96 2.65 2.15 0 .8-.5 1.5-1.21 1.85l1.43 1.67c.2.23.16.58-.07.78-.11.1-.24.15-.37.15-.17 0-.33-.08-.44-.22l-1.4-1.64z"/></svg>;
export const EthIcon = () => <svg fill="#627EEA" viewBox="0 0 24 24"><path d="M12 1.75l-6.25 10.5 6.25 3.5 6.25-3.5L12 1.75zM12 17.25l-6.25-3.5 6.25 6.25 6.25-6.25-6.25 3.5z"/></svg>;
export const SolIcon = () => <svg fill="#9945FF" viewBox="0 0 24 24"><path d="M4 10.45h4.86v3.1H4zM9.8 4h4.4v3.1h-4.4zM9.8 16.9h4.4v3.1h-4.4zM15.14 10.45H20v3.1h-4.86z"/></svg>;
export const DogeIcon = () => <svg fill="#C2A633" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.68 15.15c-.32 0-.6-.11-.83-.29-.44-.35-.65-.9-.65-1.52V8.42c0-.62.21-1.17.65-1.52.23-.18.51-.29.83-.29.32 0 .6.11.83.29.44.35.65.9.65 1.52v6.92c0 .62-.21 1.17-.65 1.52-.23-.18-.51.29-.83.29zm-4.32 0c-.32 0-.6-.11-.83-.29-.44-.35-.65-.9-.65-1.52V8.42c0-.62.21-1.17.65-1.52.23-.18.51-.29.83-.29s.6.11.83.29c.44.35.65.9.65 1.52v6.92c0 .62-.21 1.17-.65 1.52-.23-.18-.51.29-.83.29z"/></svg>;
export const UsdtIcon = () => <svg fill="#26A17B" viewBox="0 0 24 24"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm4 6h-8v2h3v6h2v-6h3V8z"/></svg>;
export const XrpIcon = () => <svg fill="#23292F" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.18 4.29l1.18 1.18 1.18-1.18-1.18-1.18-1.18 1.18zM6.29 9.17l1.18 1.18 1.18-1.18-1.18-1.18-1.18 1.18zm8.24 0l1.18 1.18 1.18-1.18-1.18-1.18-1.18 1.18zm-4.12 2.96L9.23 15l-1.18-1.18 1.18-1.18 1.18 1.18zm5.29 0l-1.18 1.18-1.18-1.18 1.18-1.18 1.18 1.18zm-4.12 2.96l1.18 1.18 1.18-1.18-1.18-1.18-1.18 1.18z"/></svg>;
export const AdaIcon = () => <svg fill="#0033AD" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.03 4.28l5.03 2.9-5.03 2.9-5.03-2.9 5.03-2.9zm0 6.84l5.03 2.9-5.03 2.9-5.03-2.9 5.03-2.9z"/></svg>;

// --- Landing Page Icons ---
export const FidelityLogoIcon = () => (
    <svg height="40" viewBox="0 0 128 35" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.4 33.6H17.2V1.4H22.4V33.6Z" />
        <path d="M32 33.6H26.8V1.4H32V33.6Z" />
        <path d="M41.6 33.6H36.4V1.4H41.6V33.6Z" />
        <path d="M45.6 1.4H51.4L55.8 21.4L60.2 1.4H66L58.8 33.6H52.8L45.6 1.4Z" />
        <path d="M78.6 1.4V33.6H73.4V1.4H78.6Z" />
        <path d="M96.6 1.4H102.4L106.8 21.4L111.2 1.4H117L109.8 33.6H103.8L96.6 1.4Z" />
        <path d="M82.4 1.4H88.2L91.2 14.2C91.5113 15.7013 91.8227 17.2027 92.134 18.704C92.4453 17.2027 92.7567 15.7013 93.068 14.2L96 1.4H101.8L94.6 33.6H89.2L82.4 1.4Z" />
    </svg>
);
export const LoginIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);


export default Icon;

