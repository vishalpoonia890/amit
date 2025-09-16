import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import { 
    DepositIcon, WithdrawIcon, RewardsIcon, SellUsdtIcon, 
    TeamIcon, SupportIcon, WalletIcon, PromotionsIcon,
    SecurePlatformIcon, HighReturnsIcon, InstantPayoutsIcon,
    BankVsInvestIcon, PassiveIncomeIcon, FinancialFreedomIcon,
    SmartInvestingIcon, LongTermGrowthIcon, DiversificationIcon,
    Support247Icon, IntuitiveInterfaceIcon, CommunityRewardsIcon // New Icons
} from './Icons';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

const Marquee = ({ items }) => (
    <div className="marquee-container">
        <div className="marquee-content">
            {items.map((item, index) => (
                <span key={index} className="marquee-item">
                    🎉 Congrats to <strong>{item.name}</strong> on their withdrawal of ₹{item.amount.toLocaleString()}!
                </span>
            ))}
            {items.map((item, index) => (
                <span key={`dup-${index}`} className="marquee-item">
                    🎉 Congrats to <strong>{item.name}</strong> on their withdrawal of ₹{item.amount.toLocaleString()}!
                </span>
            ))}
        </div>
    </div>
);

function UserDashboard({ onViewChange }) {
    const [withdrawals, setWithdrawals] = useState([]);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/fake-withdrawals`);
                if (data.withdrawals && data.withdrawals.length > 0) {
                    setWithdrawals(data.withdrawals);
                }
            } catch (error) {
                console.error("Could not fetch withdrawals for ticker:", error);
            }
        };
        fetchWithdrawals();
    }, []);

    const quickActions = [
        { id: 'deposit', label: 'Deposit', icon: <DepositIcon />, view: 'deposit' },
        { id: 'withdraw', label: 'Withdraw', icon: <WithdrawIcon />, view: 'withdraw' },
        { id: 'sell-usdt', label: 'Sell USDT', icon: <SellUsdtIcon />, view: 'sell-usdt' },
        { id: 'team', label: 'Team', icon: <TeamIcon />, view: 'team' },
        { id: 'rewards', label: 'Rewards', icon: <RewardsIcon />, view: 'rewards' },
        { id: 'support', label: 'Support', icon: <SupportIcon />, view: 'support' },
    ];

    const blogPosts = [
        { id: 1, title: 'Bank Savings vs. Smart Investing', text: 'Discover why letting your money work for you in investments can vastly outperform traditional savings.', icon: <BankVsInvestIcon /> },
        { id: 2, title: 'The Power of Passive Income', text: 'Learn how our platform helps you build steady, passive income streams that grow over time.', icon: <PassiveIncomeIcon /> },
        { id: 3, title: 'Start Your Independence Journey', text: 'Take the first step towards financial freedom. Our tools are designed for beginners and experts alike.', icon: <FinancialFreedomIcon /> },
        { id: 4, title: 'Smart Investing in a Digital Age', text: 'Explore how diversifying into high-growth digital assets can accelerate your wealth creation.', icon: <SmartInvestingIcon /> },
        { id: 5, title: 'Long-Term Growth Strategies', text: 'See how consistent, strategic investments can lead to substantial long-term financial security.', icon: <LongTermGrowthIcon /> },
        { id: 6, title: 'The Art of Diversification', text: 'Understand why spreading your investments across different products minimizes risk and maximizes returns.', icon: <DiversificationIcon /> },
    ];

    return (
        <div className="user-dashboard">
            <div className="dashboard-hero">
                <h1 className="hero-title">Welcome to InvestmentPlus</h1>
                <p className="hero-subtitle">Your Premier Destination for Digital Asset Growth & Gaming</p>
            </div>

            <div className="quick-actions-scroll-container">
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
            
            {/* ✅ UPDATED: The "Why Choose Us" section is now fully implemented with more content */}
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
                <div className="info-card">
                    <div className="info-card-icon"><Support247Icon /></div>
                    <h4>24/7 Support</h4>
                    <p>Our dedicated support team is available around the clock to assist you with any questions.</p>
                </div>
                <div className="info-card">
                    <div className="info-card-icon"><IntuitiveInterfaceIcon /></div>
                    <h4>Intuitive Interface</h4>
                    <p>Our platform is designed to be easy to navigate for both beginners and experts.</p>
                </div>
                <div className="info-card">
                    <div className="info-card-icon"><CommunityRewardsIcon /></div>
                    <h4>Community Rewards</h4>
                    <p>Join a thriving community and participate in exclusive events to maximize your earnings.</p>
                </div>
            </div>
            
            <Marquee items={withdrawals} />

            <div className="dashboard-card blog-section">
                <h4>Start Your Financial Journey</h4>
                <div className="blog-grid">
                    {blogPosts.map(post => (
                        <div key={post.id} className="blog-card">
                            <div className="blog-card-icon">{post.icon}</div>
                            <h5>{post.title}</h5>
                            <p>{post.text}</p>
                        </div>
                    ))}
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

