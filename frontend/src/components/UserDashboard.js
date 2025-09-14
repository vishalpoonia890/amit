import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import { DepositIcon, WithdrawIcon, RewardsIcon, SellUsdtIcon, TeamIcon, SupportIcon, WalletIcon, PromotionsIcon } from './Icons'; // Assuming these are in an Icons.js file

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

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="accordion-item">
            <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
                <span>{title}</span>
                <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
};

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

    const menuItems = [
        { id: 'deposit', label: 'Deposit', icon: <DepositIcon /> },
        { id: 'withdraw', label: 'Withdraw', icon: <WithdrawIcon /> },
        { id: 'sell-usdt', label: 'Sell USDT', icon: <SellUsdtIcon /> }, // ✅ UPDATED
        { id: 'rewards', label: 'Rewards', icon: <RewardsIcon /> },
        { id: 'team', label: 'Team', icon: <TeamIcon /> },
        { id: 'support', label: 'Support', icon: <SupportIcon /> },
        { id: 'wallet', label: 'Wallet', icon: <WalletIcon /> },
        { id: 'promotions', label: 'Promotions', icon: <PromotionsIcon /> },
    ];
    
    return (
        <div className="user-dashboard">
            <div className="dashboard-card quick-access-menu">
                <div className="menu-grid">
                    {menuItems.map(item => (
                        // ✅ UPDATED: Added a wrapper for the new border style
                        <div key={item.id} className="menu-item-wrapper">
                            <button className="menu-item" onClick={() => onViewChange(item.id)}>
                                <div className="menu-icon">{item.icon}</div>
                                <span className="menu-label">{item.label}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-card video-section">
                <h4>How to Earn with InvestmentPlus</h4>
                <div className="video-placeholder">
                    <iframe 
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0" 
                        title="Promotional Video"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                    </iframe>
                </div>
            </div>

            <Marquee items={withdrawals} />

            <div className="dashboard-card updates-section">
                <h4>Latest Updates & Guides</h4>
                <AccordionItem title="🚀 How to Earn on InvestmentPlus">
                    <p>Earning with us is designed to be simple and rewarding. Here’s your path to success:</p>
                    <ul>
                        <li><strong>Step 1: Register & Bonus:</strong> Sign up in seconds and instantly receive a welcome bonus to kickstart your journey.</li>
                        <li><strong>Step 2: Secure Deposit:</strong> Add funds to your account using our trusted UPI or Crypto (USDT TRC20) payment methods.</li>
                        <li><strong>Step 3: Choose a Plan:</strong> Browse our diverse range of investment products, each with clear daily returns and durations.</li>
                        <li><strong>Step 4: Earn Daily:</strong> Purchase a product and relax! Your daily income will be automatically credited to your account.</li>
                    </ul>
                </AccordionItem>
                 <AccordionItem title="🏆 Our Winning Strategy">
                    <p>Our core strategy revolves around smart diversification and proactive market analysis. We don't just follow trends; we create opportunities. By investing in a carefully curated portfolio of high-growth digital and financial assets, we effectively minimize risk while maximizing potential returns for our entire user community. Your financial growth is the ultimate measure of our success.</p>
                </AccordionItem>
                <AccordionItem title="💸 Maximize Your Winnings with Referrals">
                    <p>Want to unlock a powerful new income stream? Use the "Team" feature! Share your unique referral link with friends, family, and your network. You will earn a generous commission on every single investment they make, creating a sustainable source of passive income. The more active members in your team, the higher your earnings potential becomes. It's a true win-win!</p>
                </AccordionItem>
            </div>
        </div>
    );
}

export default UserDashboard;

