import './AccountView.css';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

const CountdownTimer = ({ targetDate, onEnd }) => {
    const calculateTimeLeft = useCallback(() => {
        if (!targetDate) return null;
        const difference = +new Date(targetDate) - +new Date();
        if (difference <= 0) {
            onEnd();
            return null;
        }
        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }, [targetDate, onEnd]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });
    
    if (!timeLeft) return "Claim";

    return `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
};

function AccountView({ userData, financialSummary, onLogout, onViewChange, token }) {
    const [userInvestments, setUserInvestments] = useState([]);
    const [isClaiming, setIsClaiming] = useState(false);
    const [nextClaimTime, setNextClaimTime] = useState(null);

    useEffect(() => {
        const fetchInvestments = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/api/investments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserInvestments(response.data.investments || []);
            } catch (error) {
                console.error("Failed to fetch user investments:", error);
            }
        };
        fetchInvestments();
    }, [token]);

    useEffect(() => {
        if (financialSummary && financialSummary.lastClaimAt) {
            const lastClaim = new Date(financialSummary.lastClaimAt);
            const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
            if (nextClaim > new Date()) {
                setNextClaimTime(nextClaim);
            } else {
                setNextClaimTime(null);
            }
        } else {
            setNextClaimTime(null);
        }
    }, [financialSummary]);

    const activeInvestments = useMemo(() => 
        userInvestments.filter(inv => inv.status === 'active' && inv.days_left > 0),
        [userInvestments]
    );

    const totalDailyIncome = useMemo(() =>
        activeInvestments.reduce((sum, inv) => sum + (inv.daily_income || 0), 0),
        [activeInvestments]
    );

    const handleClaimIncome = async () => {
        setIsClaiming(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/claim-income`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to claim income.');
        } finally {
            setIsClaiming(false);
        }
    };
    
    const user = userData || { name: 'User', ip_username: 'N/A', status: 'active' };
    const financials = financialSummary || { todaysIncome: 0, withdrawable_wallet: 0, balance: 0 };
    const totalBalance = (financials.balance || 0) + (financials.withdrawable_wallet || 0);

    const avatarUrl = user.avatar_url || `https://placehold.co/150x150/7F56D9/FFFFFF?text=${user.name?.[0]?.toUpperCase() || 'U'}`;
    const canClaim = financials.todaysIncome > 0;
    const isOnCooldown = nextClaimTime && new Date() < nextClaimTime;
    const status = (user.status || 'active').replace(/\s+/g, '-').toLowerCase();

    return (
        <div className="account-view">
            <div className="profile-header-card">
                <div className="avatar-container">
                    <img src={avatarUrl} alt="User Avatar" className="avatar" />
                </div>
                <div className="profile-info">
                    <h3 className="username">{user.name}</h3>
                    <p className="user-details">ID: {user.ip_username}</p>
                     <div className="user-status-wrapper">
                        Account Status: 
                        <span className={`status-badge status-${status}`}>
                            {user.status || 'Active'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="earnings-card">
                <div className="earnings-info">
                    <p>Today's Total Plan Income</p>
                    <span className="earnings-amount">{formatCurrency(totalDailyIncome)}</span>
                </div>
                <button 
                    className="claim-button" 
                    onClick={handleClaimIncome}
                    disabled={!canClaim || isClaiming || isOnCooldown}
                >
                    {isClaiming ? 'Claiming...' : (
                        isOnCooldown 
                        ? <CountdownTimer targetDate={nextClaimTime} onEnd={() => setNextClaimTime(null)} /> 
                        : `Claim (₹${financials.todaysIncome.toLocaleString()})`
                    )}
                </button>
            </div>

            <div className="financial-grid-card">
                 <div className="grid-item">
                    <span className="label">Total Balance</span>
                    <span className="value">{formatCurrency(totalBalance)}</span>
                </div>
                 <div className="grid-item">
                    <span className="label">Withdrawable</span>
                    <span className="value">{formatCurrency(financials.withdrawable_wallet)}</span>
                </div>
            </div>
            
            <div className="action-buttons">
                <button className="recharge-btn" onClick={() => onViewChange('deposit')}>Recharge</button>
                <button className="withdraw-btn" onClick={() => onViewChange('withdraw')}>Withdraw</button>
            </div>

            <div className="account-options-card">
                 <button className="account-option-item" onClick={() => onViewChange('transactions')}>
                    <span className="icon">📜</span>
                    <span className="label">Transaction History</span>
                    <span className="arrow-icon">&gt;</span>
                </button>
                <button className="account-option-item" onClick={() => onViewChange('bet-history')}>
                    <span className="icon">🎲</span>
                    <span className="label">Bet History</span>
                    <span className="arrow-icon">&gt;</span>
                </button>
            </div>

             <div className="my-products-card">
                 <h4>My Active Investments</h4>
                 <ul>
                     {activeInvestments.length > 0 ? (
                         activeInvestments.map(product => (
                             <li key={product.id}>
                                 <div className="product-info">
                                     <span>{product.plan_name}</span>
                                     <span className="product-details">Ends in {product.days_left} days</span>
                                 </div>
                                 <div className="product-income">
                                     <span>Daily Income</span>
                                     <strong>{formatCurrency(product.daily_income)}</strong>
                                 </div>
                             </li>
                         ))
                     ) : (
                         <li className="no-products">You have no active investments.</li>
                     )}
                 </ul>
             </div>

             <div className="logout-section">
                <button className="logout-btn-styled" onClick={onLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

export default AccountView;

