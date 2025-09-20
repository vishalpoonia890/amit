import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import { 
    DepositIcon, WithdrawIcon, TeamIcon, RewardsIcon, WalletIcon, SupportIcon,
    SecurePlatformIcon, HighReturnsIcon, InstantPayoutsIcon,
    BankVsInvestIcon, PassiveIncomeIcon, FinancialFreedomIcon,
    SmartInvestingIcon, LongTermGrowthIcon, DiversificationIcon 
} from './Icons';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// Sample plan data to showcase in the dashboard
const samplePlans = [
    { id: 101, name: 'iPhone 17', price: 480, dailyIncome: 75, durationDays: 10 },
    { id: 201, name: 'Sun Harvest 100', price: 1500, dailyIncome: 180, durationDays: 20 },
    { id: 301, name: 'AeroBlade Advantage', price: 10000, dailyIncome: 1100, durationDays: 45 },
    { id: 401, name: 'Hash Rate Pro', price: 50000, dailyIncome: 5500, durationDays: 60 },
];

const investmentPartners = [
    'https://placehold.co/150x50/ffffff/000000?text=Partner+1',
    'https://placehold.co/150x50/ffffff/000000?text=Partner+2',
    'https://placehold.co/150x50/ffffff/000000?text=Partner+3',
    'https://placehold.co/150x50/ffffff/000000?text=Partner+4',
];

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function UserDashboard({ onViewChange }) {
    const [totalPayout, setTotalPayout] = useState(10000000); // Start at 1 Crore for visual effect

    useEffect(() => {
        // Simulate total payouts increasing over time
        const interval = setInterval(() => {
            setTotalPayout(prev => prev + Math.floor(Math.random() * (100000 - 50000) + 50000));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    
    const quickActions = [
        { id: 'deposit', label: 'Deposit', icon: <DepositIcon />, view: 'deposit' },
        { id: 'withdraw', label: 'Withdraw', icon: <WithdrawIcon />, view: 'withdraw' },
        { id: 'team', label: 'Team', icon: <TeamIcon />, view: 'team' },
        { id: 'daily-tasks', label: 'Daily Tasks', icon: <RewardsIcon />, view: 'rewards' },
        { id: 'wallet', label: 'Wallet', icon: <WalletIcon />, view: 'wallet' },
        { id: 'support', label: 'Support', icon: <SupportIcon />, view: 'support' },
    ];

     const journeyContent = [
        { id: 1, title: 'Bank Savings vs. Smart Investing', text: 'Discover why letting your money work for you can vastly outperform traditional savings.', icon: <BankVsInvestIcon /> },
        { id: 2, title: 'The Power of Passive Income', text: 'Learn how our platform helps you build steady, passive income streams that grow over time.', icon: <PassiveIncomeIcon /> },
        { id: 3, title: 'Start Your Independence Journey', text: 'Take the first step towards financial freedom. Our tools are designed for beginners and experts alike.', icon: <FinancialFreedomIcon /> },
        { id: 4, title: 'Smart Investing in a Digital Age', text: 'Explore how diversifying into high-growth digital assets can accelerate your wealth creation.', icon: <SmartInvestingIcon /> },
        { id: 5, title: 'Long-Term Growth Strategies', text: 'See how consistent investments can lead to substantial long-term financial security.', icon: <LongTermGrowthIcon /> },
        { id: 6, title: 'The Art of Diversification', text: 'Understand why spreading your investments across different products minimizes risk and maximizes returns.', icon: <DiversificationIcon /> },
    ];

    return (
        <div className="user-dashboard">
            <div className="dashboard-hero">
                <h1 className="hero-title">Welcome to InvestmentPlus</h1>
                <p className="hero-subtitle">Your Premier Destination for Digital Asset Growth & Gaming</p>
            </div>

            <div className="quick-actions-section">
                <div className="quick-actions-grid">
                    {quickActions.map(action => (
                        <div key={action.id} className="action-card-wrapper">
                            <button onClick={() => onViewChange(action.view)} className="action-card">
                                <div className="action-icon-container">{action.icon}</div>
                                <span>{action.label}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div id="journey" className="dashboard-card journey-section">
                <h4>Start Your Journey</h4>
                <div className="plan-showcase-grid">
                    {samplePlans.map(plan => (
                        <div key={plan.id} className="plan-card-mini">
                            <h5>{plan.name}</h5>
                            <p>Earn {formatCurrency(plan.dailyIncome)} Daily</p>
                        </div>
                    ))}
                </div>
                <div className="blog-grid">
                    {journeyContent.map(post => (
                        <div key={post.id} className="blog-card">
                            <div className="blog-card-icon">{post.icon}</div>
                            <h5>{post.title}</h5>
                            <p>{post.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-card partners-section">
                <h4>Our Investment Partners</h4>
                <div className="partners-logo-grid">
                    {investmentPartners.map((src, index) => (
                        <img key={index} src={src} alt={`Partner ${index + 1}`} />
                    ))}
                </div>
            </div>

            <div className="payout-ticker-card">
                <h4>Total Payouts to Date</h4>
                <p className="payout-amount">{formatCurrency(totalPayout)}</p>
            </div>

            <div className="info-section">
                <div className="info-card">
                    <div className="info-card-icon"><InstantPayoutsIcon /></div>
                    <h4>Instant Payouts</h4>
                    <p>Your winnings and earnings are credited to your withdrawable balance immediately.</p>
                </div>
                <div className="info-card">
                    <div className="info-card-icon"><SecurePlatformIcon /></div>
                    <h4>Secure Platform</h4>
                    <p>We use state-of-the-art security to protect your data and transactions, 24/7.</p>
                </div>
                <div className="info-card">
                    <div className="info-card-icon"><HighReturnsIcon /></div>
                    <h4>High Returns</h4>
                    <p>Our diverse investment plans and games are designed to maximize your earning potential.</p>
                </div>
            </div>
            
            <footer className="dashboard-footer">
                <div className="footer-logo">InvestmentPlus</div>
                <div className="footer-regulatory">
                    <span>SEBI Compliant*</span>
                    <span>Follows RBI Guidelines*</span>
                </div>
                <p className="footer-disclaimer">
                    *Disclaimer: InvestmentPlus is a privately operated platform. While we adhere to the highest standards of financial conduct and security inspired by regulatory bodies, we are not directly affiliated with, endorsed, or regulated by SEBI or RBI. All investments carry risks.
                </p>
                <p>© 2025 InvestmentPlus.com | All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default UserDashboard;

