import React, { useState, useEffect } from 'react';
import './ProductsAndPlans.css';
import productImage from '../assets/Code.png'; // Make sure you have this image in src/assets
import axios from 'axios'; // Import axios
const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com'; // Define API_BASE_URL


// --- MOCK DATA FOR PRODUCTS WITH PRE-SALE ---
// NOTE: Sale start times are set in the future relative to the request time.
const mockPlans = {
    'New': [
        { id: 101, name: 'Fresh Start 1', price: 480, dailyIncome: 75, durationDays: 10, totalReturn: 750, saleStartTime: '2025-09-14T20:00:00' },
        { id: 102, name: 'Fresh Start 2', price: 650, dailyIncome: 90, durationDays: 12, totalReturn: 1080, saleStartTime: '2025-09-13T10:00:00' },
        { id: 103, name: 'Quick Boost', price: 800, dailyIncome: 110, durationDays: 15, totalReturn: 1650, saleStartTime: '2025-09-19T15:30:00' },
        { id: 104, name: 'Introductory Yield', price: 1000, dailyIncome: 130, durationDays: 15, totalReturn: 1950, saleStartTime: '2025-09-18T14:00:00' }, // This one is already live
        { id: 105, name: 'Beginner Loop', price: 1200, dailyIncome: 150, durationDays: 18, totalReturn: 2700, saleStartTime: '2025-09-15T09:00:00' },
    ],
    'Primary': [
        { id: 201, name: 'Core Builder 1', price: 1500, dailyIncome: 180, durationDays: 20, totalReturn: 3600 },
        { id: 202, name: 'Core Builder 2', price: 2500, dailyIncome: 280, durationDays: 25, totalReturn: 7000 },
        { id: 203, name: 'Steady Growth', price: 3500, dailyIncome: 380, durationDays: 30, totalReturn: 11400 },
        { id: 204, name: 'Foundation Fund', price: 5000, dailyIncome: 520, durationDays: 35, totalReturn: 18200 },
        { id: 205, name: 'Primary Plus', price: 7500, dailyIncome: 780, durationDays: 40, totalReturn: 31200 },
    ],
    'VIP': [
        { id: 301, name: 'VIP Access 1', price: 10000, dailyIncome: 1100, durationDays: 45, totalReturn: 49500 },
        { id: 302, name: 'VIP Gold', price: 15000, dailyIncome: 1600, durationDays: 45, totalReturn: 72000 },
        { id: 303, name: 'VIP Platinum', price: 25000, dailyIncome: 2700, durationDays: 50, totalReturn: 135000 },
        { id: 304, name: 'Diamond Circle', price: 35000, dailyIncome: 3800, durationDays: 50, totalReturn: 190000 },
        { id: 305, name: 'Inner Sanctum', price: 45000, dailyIncome: 4900, durationDays: 55, totalReturn: 269500 },
    ],
    'Luxury': [
        { id: 401, name: 'Elite Portfolio 1', price: 50000, dailyIncome: 5500, durationDays: 60, totalReturn: 330000 },
        { id: 402, name: 'Prestige Fund', price: 75000, dailyIncome: 8000, durationDays: 60, totalReturn: 480000 },
        { id: 403, name: 'Sovereign Trust', price: 100000, dailyIncome: 11000, durationDays: 60, totalReturn: 660000 },
        { id: 404, name: 'Chairman\'s Selection', price: 150000, dailyIncome: 17000, durationDays: 65, totalReturn: 1105000 },
        { id: 405, name: 'Founders Legacy', price: 200000, dailyIncome: 23000, durationDays: 70, totalReturn: 1610000 },
    ]
};

// --- Countdown Timer Component ---
const CountdownTimer = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.keys(timeLeft).map(interval => {
        if (!timeLeft[interval] && interval !== 'seconds' && timeLeft['days'] === 0) {
            return null;
        }
        return (
            <span key={interval} className="timer-segment">
                {String(timeLeft[interval]).padStart(2, '0')}
                <span className="timer-label">{interval[0]}</span>
            </span>
        );
    });

    return (
        <div className="countdown-timer">
            {timerComponents.length ? timerComponents : <span className="sale-live">Sale is Live!</span>}
        </div>
    );
};


function ProductsAndPlans({ token, onPlanPurchase }) {
    const [activeCategory, setActiveCategory] = useState('New');
    const [loading, setLoading] = useState(false);
    const [confirmingPlanId, setConfirmingPlanId] = useState(null);

    const handlePurchase = async (plan) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/purchase-plan`, {
                planId: plan.id,
                name: plan.name,
                price: plan.price,
                dailyIncome: plan.dailyIncome,
                durationDays: plan.durationDays,
                totalReturn: plan.totalReturn
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Purchase successful:', response.data);
            onPlanPurchase(); // Call the callback from App.js to show notification and refresh data
        } catch (error) {
            console.error('Error purchasing plan:', error.response?.data?.error || error.message);
            // You might want to pass an error message back to App.js or show it here
            onPlanPurchase(error.response?.data?.error || 'Failed to purchase plan.'); // Pass error message
        } finally {
            setLoading(false);
            setConfirmingPlanId(null);
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

    return (
        <div className="plans-page">
            <div className="plans-header">
                <h1>Investment Products</h1>
                <div className="category-tabs">
                    {Object.keys(mockPlans).map(category => (
                        <button
                            key={category}
                            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="plans-grid">
                {mockPlans[activeCategory].map((plan) => {
                    const isPreSale = plan.saleStartTime && new Date(plan.saleStartTime) > new Date();
                    return (
                        <div key={plan.id} className="plan-card">
                            <div className="plan-image-container">
                                <img src={productImage} alt={plan.name} className="plan-image" />
                                {isPreSale && <div className="presale-badge">Pre-Sale</div>}
                            </div>
                            <div className="plan-card-body">
                                <h3>{plan.name}</h3>
                                {isPreSale && (
                                    <div className="presale-info">
                                        <p>Sale Starts In:</p>
                                        <CountdownTimer targetDate={plan.saleStartTime} />
                                    </div>
                                )}
                                <p className="price">Price: {formatCurrency(plan.price)}</p>
                                <div className="plan-details">
                                    <div><span>Daily Income:</span><strong>{formatCurrency(plan.dailyIncome)}</strong></div>
                                    <div><span>Term:</span><strong>{plan.durationDays} Days</strong></div>
                                    <div><span>Total Return:</span><strong>{formatCurrency(plan.totalReturn)}</strong></div>
                                </div>
                                {confirmingPlanId !== plan.id ? (
                                    <button
                                        className={`purchase-button ${isPreSale ? 'presale' : ''}`}
                                        onClick={() => setConfirmingPlanId(plan.id)}
                                        disabled={loading}
                                    >
                                        {isPreSale ? 'Pre-Order Now' : 'Invest Now'}
                                    </button>
                                ) : (
                                    <div className="confirmation-buttons">
                                        <button className="confirm-btn" onClick={() => handlePurchase(plan)} disabled={loading}>Confirm</button>
                                        <button className="cancel-btn" onClick={() => setConfirmingPlanId(null)} disabled={loading}>Cancel</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
export default ProductsAndPlans;

