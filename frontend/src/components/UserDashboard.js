import React from 'react';
import './UserDashboard.css';

// Mock data for product display placeholders. Replace with API data as needed.
const mockProductData = {
    "Best Sellers": [
        { id: 101, name: 'Dolphin 20T Plan', brand: 'Primary Tier', imageUrl: 'https://placehold.co/250x150/FF9800/FFFFFF?text=Plan+A', price: 1500, dailyIncome: 80.50 },
        { id: 102, name: 'Elephant T40 Plan', brand: 'Primary Tier', imageUrl: 'https://placehold.co/250x150/4CAF50/FFFFFF?text=Plan+B', price: 2500, dailyIncome: 125.00 },
        { id: 103, name: 'Lion T60 Plan', brand: 'Primary Tier', imageUrl: 'https://placehold.co/250x150/f44336/FFFFFF?text=Plan+C', price: 5000, dailyIncome: 275.00 },
    ],
    "VIP Investments": [
        { id: 201, name: 'VIP Gold Plan', brand: 'Exclusive Tier', imageUrl: 'https://placehold.co/250x150/2196F3/FFFFFF?text=VIP+Gold', price: 50000, dailyIncome: 3000.00 },
        { id: 202, name: 'VIP Platinum Plan', brand: 'Exclusive Tier', imageUrl: 'https://placehold.co/250x150/9C27B0/FFFFFF?text=VIP+Platinum', price: 100000, dailyIncome: 6500.00 },
    ],
};

// Helper to format currency
const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
}).format(amount || 0);

// --- Main Dashboard Component ---
function UserDashboard({ onViewChange, financialSummary }) {
    // Calculate total balance from the summary
    const totalBalance = (financialSummary?.balance || 0) + (financialSummary?.withdrawable_wallet || 0);

    return (
        <div className="dashboard-container">
            {/* --- Main Balance Display --- */}
            <section className="main-balance-section">
                <div className="balance-card">
                    <span className="balance-title">Total Balance</span>
                    <span className="balance-value">{formatCurrency(totalBalance)}</span>
                    <div className="balance-actions">
                        <button className="action-btn deposit" onClick={() => onViewChange('recharge')}>Deposit</button>
                        <button className="action-btn withdraw" onClick={() => onViewChange('withdraw')}>Withdraw</button>
                    </div>
                </div>
            </section>

            {/* --- Quick Access Menu --- */}
            <section className="quick-access-menu">
                <button className="menu-item" onClick={() => onViewChange('team')}>
                    <div className="menu-icon-wrapper team"><span>👨‍👩‍👧‍👦</span></div>
                    <span className="menu-label">Team</span>
                </button>
                <button className="menu-item" onClick={() => alert('Online service coming soon!')}>
                    <div className="menu-icon-wrapper service"><span>💬</span></div>
                    <span className="menu-label">Service</span>
                </button>
                <button className="menu-item" onClick={() => onViewChange('game')}>
                    <div className="menu-icon-wrapper games"><span>🎲</span></div>
                    <span className="menu-label">Games</span>
                </button>
                 <button className="menu-item" onClick={() => alert('App download coming soon!')}>
                    <div className="menu-icon-wrapper app"><span>📱</span></div>
                    <span className="menu-label">App</span>
                </button>
            </section>

            {/* --- Sample Video Section --- */}
            <section className="video-section">
                 <video controls poster="https://placehold.co/600x300/1a1a2e/ffffff?text=Video+Preview">
                    {/* Provide a real video source here */}
                    <source src="background-video.mp4" type="video/mp4" /> 
                    Your browser does not support the video tag.
                </video>
            </section>

             {/* --- Latest Updates Section --- */}
            <section className="latest-updates-section">
                <div className="update-icon">📢</div>
                <marquee behavior="scroll" direction="left">
                    Welcome to InvestmentPlus! All withdrawals are processed within 24 hours. | New VIP plans have been added with higher returns! Check them out now. | Our official Telegram channel is now live. Join for exclusive updates!
                </marquee>
            </section>
            
            {/* --- Product category sections (using mock data) --- */}
            {Object.entries(mockProductData).map(([category, products]) => (
                <section key={category} className="product-category-section">
                    <h2>{category}</h2>
                    <div className="product-grid">
                        {products.map(product => (
                            <div key={product.id} className="product-card-dashboard" onClick={() => onViewChange('plans')}>
                                <img src={product.imageUrl} alt={product.name} className="product-image" />
                                <div className="product-info-dashboard">
                                    <h4 className="product-name">{product.name}</h4>
                                    <div className="product-details-dashboard">
                                        <div><span>Price:</span> <strong>{formatCurrency(product.price)}</strong></div>
                                        <div><span>Daily Income:</span> <strong className="roi-highlight">{formatCurrency(product.dailyIncome)}</strong></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <div className="browse-all-container">
                <button className="browse-all-btn" onClick={() => onViewChange('plans')}>
                    Browse All Products
                </button>
            </div>
        </div>
    );
}

export default UserDashboard;
