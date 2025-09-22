import React from 'react';
import './UserDashboard.css';
import { 
    DepositIcon, WithdrawIcon, TeamIcon, SellUsdtIcon, SupportIcon, RewardsIcon,
    SecurePlatformIcon, HighReturnsIcon, InstantPayoutsIcon, ExcitingGamesIcon,
    BankVsInvestIcon, PassiveIncomeIcon, FinancialFreedomIcon
} from './Icons';
import casinoBgImage from '../assets/ipbi.png'; // Assuming images are in src/assets
import southPartner from '../assets/msme.png';
import northPartner from '../assets/invest1.png';
import dubaiPartner from '../assets/dubai.png';
import singaporePartner from '../assets/singapore.png';
import journeyImage from '../assets/ipbia.png';

// Sample plan data to showcase in the dashboard
const samplePlans = [
    { id: 101, name: 'iPhone 17', price: 480, dailyIncome: 75, image: 'https://placehold.co/600x400/3498db/ffffff?text=iPhone+17' },
    { id: 201, name: 'Sun Harvest 100', price: 1500, dailyIncome: 180, image: 'https://placehold.co/600x400/f1c40f/ffffff?text=Sun+Harvest' },
    { id: 301, name: 'AeroBlade Advantage', price: 10000, dailyIncome: 1100, image: 'https://placehold.co/600x400/9b59b6/ffffff?text=AeroBlade' },
    { id: 401, name: 'Hash Rate Pro', price: 50000, dailyIncome: 5500, image: 'https://placehold.co/600x400/e74c3c/ffffff?text=Hash+Rate' },
];

const investmentPartners = [
    { name: 'South India Ventures', logo: southPartner },
    { name: 'Northern Capital Group', logo: northPartner },
    { name: 'Dubai Future Investments', logo: dubaiPartner },
    { name: 'Singapore Wealth Fund', logo: singaporePartner },
];

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function UserDashboard({ onViewChange }) {
    
    const quickActions = [
        { id: 'deposit', label: 'Deposit', icon: <DepositIcon />, view: 'deposit' },
        { id: 'withdraw', label: 'Withdraw', icon: <WithdrawIcon />, view: 'withdraw' },
        { id: 'team', label: 'Team', icon: '👥', view: 'team' },
       { id: 'daily-tasks', label: 'Daily Tasks', icon: <RewardsIcon />, view: 'daily-tasks' },
        { id: 'sell-usdt', label: 'Sell USDT', icon: <SellUsdtIcon />, view: 'sell-usdt' },
        { id: 'support', label: 'Support', icon: <SupportIcon />, view: 'support' },
    ];

     const journeyContent = [
        { id: 1, title: 'Bank Savings vs. Smart Investing', text: 'Discover why letting your money work for you can vastly outperform traditional savings.', icon: <BankVsInvestIcon /> },
        { id: 2, title: 'The Power of Passive Income', text: 'Learn how our platform helps you build steady, passive income streams that grow over time.', icon: <PassiveIncomeIcon /> },
        { id: 3, title: 'Start Your Independence Journey', text: 'Take the first step towards financial freedom with tools designed for everyone.', icon: <FinancialFreedomIcon /> },
    ];

    return (
        <div className="user-dashboard">
            <div className="dashboard-hero">
                <h1 className="hero-title">Welcome to MoneyPlus</h1>
                <p className="hero-subtitle">Your Premier Destination for Digital Asset Growth & Gaming</p>
            </div>

            <div className="quick-actions-section" style={{backgroundImage: `url(${casinoBgImage})`}}>
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
                             <img src={plan.image} alt={plan.name} className="plan-mini-image"/>
                            <h5>{plan.name}</h5>
                            <p>Earn {formatCurrency(plan.dailyIncome)} Daily</p>
                        </div>
                    ))}
                </div>
                <div className="journey-content-wrapper">
                    <img src={journeyImage} alt="Financial Journey" className="journey-image"/>
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
            </div>

            <div className="dashboard-card partners-section">
                <h4>Our Investment Partners</h4>
                <div className="partners-logo-container">
                    <div className="partners-logo-grid">
                        {investmentPartners.map((partner, index) => (
                            <img key={index} src={partner.logo} alt={partner.name} title={partner.name} />
                        ))}
                        {/* Duplicate for seamless loop */}
                        {investmentPartners.map((partner, index) => (
                            <img key={`dup-${index}`} src={partner.logo} alt={partner.name} title={partner.name} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="payout-ticker-card">
                <h4>Total Payouts to Date</h4>
                <p className="payout-amount">{formatCurrency(10)} Cr+</p>
            </div>

            <div className="info-section">
                <div className="info-card">
                    <div className="info-card-icon"><InstantPayoutsIcon /></div>
                    <h4>Instant Payouts</h4>
                    <p>Winnings and earnings are credited to your withdrawable balance immediately.</p>
                </div>
                <div className="info-card">
                    <div className="info-card-icon"><SecurePlatformIcon /></div>
                    <h4>Secure Transactions</h4>
                    <p>We use state-of-the-art security to protect your data and transactions, 24/7.</p>
                </div>
                <div className="info-card">
                    <div className="info-card-icon"><HighReturnsIcon /></div>
                    <h4>High Returns</h4>
                    <p>Our diverse investment plans and games are designed to maximize your potential.</p>
                </div>
                 <div className="info-card">
                    <div className="info-card-icon"><ExcitingGamesIcon /></div>
                    <h4>Exciting Games</h4>
                    <p>Experience fair and engaging skill-based games designed for fun and profit.</p>
                </div>
            </div>
            
            <footer className="dashboard-footer">
                <div className="footer-logo">MoneyPlus</div>
                <div className="footer-regulatory">
                    <span>SEBI Compliant*</span>
                    <span>Follows RBI Guidelines*</span>
                </div>
                <p className="footer-disclaimer">
                    *Disclaimer: MoneyPlus is a privately operated platform. While we adhere to the highest standards of financial conduct and security inspired by regulatory bodies, we are not directly affiliated with, endorsed, or regulated by SEBI or RBI. All investments carry risks.
                </p>
                <p>© 2025 MoneyPlus.com | All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default UserDashboard;

