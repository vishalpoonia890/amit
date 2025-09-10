
import './UserDashboard.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';
const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

const Marquee = ({ items }) => (
    <div className="marquee-container">
        <div className="marquee-content">
            {items.map((item, index) => (
                <span key={index} className="marquee-item">
                    🎉 Congrats to <strong>{item.name}</strong> on their withdrawal of ₹{item.amount.toLocaleString()}!
                </span>
            ))}
            {/* Duplicate for seamless loop */}
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
                // In a real app, you might fetch real recent withdrawals here
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
        { id: 'rewards', label: 'Rewards', icon: '🎁' },
        { id: 'invite', label: 'Invite', icon: '🤝' },
        { id: 'team', label: 'Team', icon: '👥' },
        { id: 'support', label: 'Support', icon: '💬' },
        { id: 'wallet', label: 'Wallet', icon: '💼' },
        { id: 'deposit', label: 'Deposit', icon: '💰' },
        { id: 'withdraw', label: 'Withdraw', icon: '💸' },
        { id: 'promotions', label: 'Promotions', icon: '🔥' },
    ];
    
    return (
        <div className="user-dashboard">
            <div className="dashboard-card quick-access-menu">
                <div className="menu-grid">
                    {menuItems.map(item => (
                        <button key={item.id} className="menu-item" onClick={() => onViewChange(item.id)}>
                            <div className="menu-icon">{item.icon}</div>
                            <span className="menu-label">{item.label}</span>
                        </button>
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
                    <p>Want to unlock a powerful new income stream? Use the "Invite" feature! Share your unique referral link with friends, family, and your network. You will earn a generous commission on every single investment they make, creating a sustainable source of passive income. The more active members in your team, the higher your earnings potential becomes. It's a true win-win!</p>
                </AccordionItem>
                <AccordionItem title="📈 The InvestmentPlus Working Model">
                    <p>We are built on principles of transparency, security, and shared success. Our model is straightforward:</p>
                    <ul>
                       <li><strong>Community Pooling:</strong> We pool the investment funds from our users to gain access to exclusive, large-scale financial opportunities that are typically unavailable to individual investors.</li>
                       <li><strong>Expert Management:</strong> Our dedicated team of financial experts and analysts manages this diversified portfolio 24/7 to ensure consistent profit generation.</li>
                       <li><strong>Profit Distribution:</strong> A significant portion of the generated profits is systematically distributed back to you, our users, in the form of reliable daily income.</li>
                       <li><strong>Sustainable Growth:</strong> This creates a robust and sustainable ecosystem where every member benefits from the collective strength of the community.</li>
                    </ul>
                </AccordionItem>
            </div>
        </div>
    );
}

export default UserDashboard;

