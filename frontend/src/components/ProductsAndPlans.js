import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductsAndPlans.css';

// --- Import ALL individual product images ---
import product_101_Image from '../assets/101.png';
import product_102_Image from '../assets/102.png';
import product_103_Image from '../assets/103.png';
import product_104_Image from '../assets/104.png';
import product_105_Image from '../assets/105.png';

import product_201_Image from '../assets/201.png';
import product_202_Image from '../assets/202.png';
import product_203_Image from '../assets/203.png';
import product_204_Image from '../assets/204.png';
import product_205_Image from '../assets/205.png';

import product_301_Image from '../assets/301.png';
import product_302_Image from '../assets/302.png';
import product_303_Image from '../assets/303.png';
import product_304_Image from '../assets/304.png';
import product_305_Image from '../assets/305.png';

import product_401_Image from '../assets/401.png';
import product_402_Image from '../assets/402.png';
import product_403_Image from '../assets/403.png';
import product_404_Image from '../assets/404.png';
import product_405_Image from '../assets/405.png';

import product_501_Image from '../assets/501.png';
import product_502_Image from '../assets/502.png';
import product_503_Image from '../assets/503.png';
import product_504_Image from '../assets/504.png';
import product_505_Image from '../assets/505.png';


const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

const categoryData = {
    'New': {
        title: "Explore Our Latest Investment Opportunities!",
        points: [
            "You acquire a share in our newly launched, high-potential products.",
            "Your funds are invested in diverse, cutting-edge projects with rapid growth potential.",
            "Profits from these successful early-stage ventures are distributed among investors.",
            "Witness the power of innovation as your investment grows with emerging markets."
        ],
        isLocked: false
    },
    'Solar Energy': {
        title: "Category Locked: Coming Soon!",
        points: ["This investment category is currently reserved. Check back later!"],
        isLocked: true
    },
    'Wind Mill': {
        title: "Category Locked: Coming Soon!",
        points: ["This investment category is currently reserved. Check back later!"],
        isLocked: true
    },
    'Crypto Mining': {
        title: "Category Locked: Coming Soon!",
        points: ["This investment category is currently reserved. Check back later!"],
        isLocked: true
    },
    'Seaport': {
        title: "Category Locked: Coming Soon!",
        points: ["This investment category is currently reserved. Check back later!"],
        isLocked: true
    }
};

const imageMap = {
    101: product_101_Image, 102: product_102_Image, 103: product_103_Image, 104: product_104_Image, 105: product_105_Image,
    201: product_201_Image, 202: product_202_Image, 203: product_203_Image, 204: product_204_Image, 205: product_205_Image,
    301: product_301_Image, 302: product_302_Image, 303: product_303_Image, 304: product_304_Image, 305: product_305_Image,
    401: product_401_Image, 402: product_402_Image, 403: product_403_Image, 404: product_404_Image, 405: product_405_Image,
    501: product_501_Image, 502: product_502_Image, 503: product_503_Image, 504: product_504_Image, 505: product_505_Image,
};


const ResultModal = ({ result, onClose }) => {
    if (!result.show) return null;
    const isSuccess = result.success;
    const title = isSuccess ? "Congratulations!" : "Purchase Failed";
    const icon = isSuccess ? "✅" : "❌";

    return (
        <div className="purchase-result-modal-overlay">
            <div className={`purchase-result-modal ${isSuccess ? 'success' : 'error'}`}>
                <div className="modal-icon">{icon}</div>
                <h2>{title}</h2>
                <p>{result.message}</p>
                <button className="modal-close-btn" onClick={onClose}>OK</button>
            </div>
        </div>
    );
};


function ProductsAndPlans({ token, userBalance, onPurchaseComplete, allPlans = [], loading: plansLoading }) {
    const [activeCategory, setActiveCategory] = useState('New');
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [confirmingPlanId, setConfirmingPlanId] = useState(null);
    const [resultModal, setResultModal] = useState({ show: false, success: false, message: '' });
    const [userInvestments, setUserInvestments] = useState([]);

    useEffect(() => {
        const fetchUserInvestments = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/investments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Store a map of plan_id to true to easily check if a plan is purchased
                const purchasedPlans = {};
                response.data.investments.forEach(inv => {
                    purchasedPlans[inv.plan_name] = true;
                });
                setUserInvestments(purchasedPlans);
            } catch (error) {
                console.error("Failed to fetch user investments:", error);
            }
        };
        if (token) {
            fetchUserInvestments();
        }
    }, [token, onPurchaseComplete]);

    const handlePurchase = async (plan) => {
        setPurchaseLoading(true);
        const productStatus = getProductStatus(plan.id);
        
        try {
            const purchasePayload = { 
                id: plan.id, 
                price: plan.price, 
                name: plan.plan_name, 
                durationDays: plan.duration_days 
            };
            
            await axios.post(`${API_BASE_URL}/api/purchase-plan`, purchasePayload, { headers: { Authorization: `Bearer ${token}` } });
            
            if (productStatus.isPreSale) {
                 setResultModal({ 
                     show: true, 
                     success: true, 
                     message: `Congratulations! You have successfully booked the product. Your purchase is pending admin approval and income will start once the sale begins on ${productStatus.launchDate}.` 
                 });
            } else {
                 setResultModal({ show: true, success: true, message: `You have successfully invested in ${plan.plan_name}.` });
            }
           
        } catch (error) {
            console.error("Server responded with an error:", error.response?.data || error.message);
            setResultModal({ show: true, success: false, message: error.response?.data?.error || 'An unknown error occurred.' });
        } finally {
            setPurchaseLoading(false);
            setConfirmingPlanId(null);
            // After purchase, re-fetch investments to update the UI
            onPurchaseComplete();
        }
    };
    
    const closeResultModalAndRefresh = () => {
        setResultModal({ show: false, success: false, message: '' });
    };

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

    const filteredPlans = allPlans.filter(plan => plan.category === activeCategory);

    // Hardcode pre-sale status and launch dates for new products
    const getProductStatus = (id) => {
        const preSaleProducts = [102, 103, 104, 105];
        const launchDates = {
            102: '2025-10-07T00:00:00Z',
            103: '2025-10-08T00:00:00Z',
            104: '2025-10-09T00:00:00Z',
            105: '2025-10-10T00:00:00Z',
        };
        const launchDate = launchDates[id];
        const isPreSale = preSaleProducts.includes(id) && new Date(launchDate) > new Date();
        const launchText = new Date(launchDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

        if (preSaleProducts.includes(id)) {
            return { isPreSale, launchDate: launchText, fullLaunchDate: launchDate };
        }
        return { isPreSale: false };
    };

    return (
        <div className="plans-page">
            <ResultModal result={resultModal} onClose={closeResultModalAndRefresh} />

            <div className="plans-header">
                <h1>Investment Products</h1>
                <div className="category-tabs-container">
                    <div className="category-tabs">
                        {Object.keys(categoryData).map(category => {
                            const isLocked = categoryData[category].isLocked;
                            return (
                                <button
                                    key={category}
                                    className={`category-tab ${activeCategory === category ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                    onClick={() => !isLocked && setActiveCategory(category)}
                                    disabled={isLocked}
                                >
                                    {category} {isLocked && '🔒'}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="category-description-section">
                <h2>{categoryData[activeCategory].title}</h2>
                <ul>
                    {categoryData[activeCategory].points.map((point, index) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
            </div>
            
            <div className="plans-grid">
                {categoryData[activeCategory].isLocked ? (
                    <div className="locked-message">
                        <p>This section is currently available for VIP Level users. Check back soon for more exciting investment products!</p>
                    </div>
                ) : (
                    plansLoading ? (
                        <p>Loading plans...</p>
                    ) : (
                        filteredPlans.map((plan) => {
                            const canAfford = userBalance !== undefined && userBalance >= plan.price;
                            const productStatus = getProductStatus(plan.id);
                            // Check if the user has purchased this specific plan name
                            const isPurchased = userInvestments[plan.plan_name] === true;
                            
                            return (
                                <div key={plan.id} className="plan-card">
                                    {productStatus.isPreSale && (
                                        <div className="pre-sale-tag">Pre-Sale</div>
                                    )}
                                    <div className="plan-image-container">
                                        <img src={imageMap[plan.id] || product_101_Image} alt={plan.plan_name} className="plan-image" />
                                    </div>
                                    <div className="plan-card-body">
                                        <h3>{plan.plan_name}</h3>
                                        <p className="price">Price: {formatCurrency(plan.price)}</p>
                                        <div className="plan-details">
                                            <div><span>Daily Income:</span><strong>{formatCurrency(plan.daily_income)}</strong></div>
                                            <div><span>Term:</span><strong>{plan.duration_days} Days</strong></div>
                                            <div><span>Total Return:</span><strong>{formatCurrency(plan.total_return)}</strong></div>
                                        </div>
                                        {isPurchased ? (
                                            <button className="purchase-button purchased-button" disabled>Already Purchased</button>
                                        ) : (
                                            productStatus.isPreSale ? (
                                                <div className="pre-sale-info">
                                                    {confirmingPlanId !== plan.id ? (
                                                        <button
                                                            className={`purchase-button pre-sale-button ${!canAfford ? 'disabled' : ''}`}
                                                            onClick={() => setConfirmingPlanId(plan.id)}
                                                            disabled={purchaseLoading || !canAfford}
                                                        >
                                                            Buy Pre-Sale
                                                        </button>
                                                    ) : (
                                                        <div className="confirmation-buttons">
                                                            <button className="confirm-btn" onClick={() => handlePurchase(plan)} disabled={purchaseLoading}>
                                                                {purchaseLoading ? 'Processing...' : 'Confirm Booking'}
                                                            </button>
                                                            <button className="cancel-btn" onClick={() => setConfirmingPlanId(null)} disabled={purchaseLoading}>Cancel</button>
                                                        </div>
                                                    )}
                                                    <p>Launches: {productStatus.launchDate}</p>
                                                </div>
                                            ) : (
                                                confirmingPlanId !== plan.id ? (
                                                    <button
                                                        className={`purchase-button ${!canAfford ? 'disabled' : ''}`}
                                                        onClick={() => setConfirmingPlanId(plan.id)}
                                                        disabled={purchaseLoading || !canAfford}
                                                    >
                                                        Invest Now
                                                    </button>
                                                ) : (
                                                    <div className="confirmation-buttons">
                                                        <button className="confirm-btn" onClick={() => handlePurchase(plan)} disabled={purchaseLoading}>
                                                            {purchaseLoading ? 'Processing...' : 'Confirm'}
                                                        </button>
                                                        <button className="cancel-btn" onClick={() => setConfirmingPlanId(null)} disabled={purchaseLoading}>Cancel</button>
                                                    </div>
                                                )
                                            )
                                        )}
                                        {!canAfford && !isPurchased && <p className="insufficient-balance-message">Insufficient Balance</p>}
                                    </div>
                                </div>
                            );
                        })
                    )
                )}
            </div>
        </div>
    );
}

export default ProductsAndPlans;
