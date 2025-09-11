
import './AccountView.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

function AccountView({ userData, financialSummary, onLogout, onViewChange, token }) {
    const [userInvestments, setUserInvestments] = useState([]);
    
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

    const user = userData || { name: 'User', mobile: 'N/A', ip_username: 'N/A' };
    const financials = financialSummary ? {
        todays_earnings: financialSummary.todaysIncome || 0,
        withdrawable: financialSummary.withdrawable_wallet || 0,
        recharge: financialSummary.balance || 0,
        total_balance: (financialSummary.balance || 0) + (financialSummary.withdrawable_wallet || 0)
    } : {};

    const avatarUrl = user.avatar_url || `https://placehold.co/150x150/007bff/FFFFFF?text=${user.name?.[0]?.toUpperCase() || 'U'}`;

    return (
        <div className="account-view">
            <div className="profile-header-card">
                <img src={avatarUrl} alt="User Avatar" className="avatar" />
                <div className="profile-info">
                    <h3 className="username">{user.name}</h3>
                    <p className="user-details">ID: {user.ip_username}</p>
                </div>
            </div>

            <div className="earnings-card">
                <div className="earnings-info">
                    <p>Today's Earnings</p>
                    <span className="earnings-amount">{formatCurrency(financials.todays_earnings)}</span>
                </div>
                <button className="claim-button">Claim</button>
            </div>

            <div className="financial-grid-card">
                 <div className="grid-item">
                    <span className="label">Total Balance</span>
                    <span className="value">{formatCurrency(financials.total_balance)}</span>
                </div>
                 <div className="grid-item">
                    <span className="label">Withdrawable</span>
                    <span className="value">{formatCurrency(financials.withdrawable)}</span>
                </div>
            </div>
            
            <div className="action-buttons">
                <button className="recharge-btn" onClick={() => onViewChange('deposit')}>Recharge</button>
                <button className="withdraw-btn" onClick={() => onViewChange('withdraw')}>Withdraw</button>
            </div>

            <div className="my-products-card">
                <h4>My Products</h4>
                <ul>
                    {userInvestments.length > 0 ? (
                        userInvestments.map(product => (
                            <li key={product.id}>
                               <span>{product.plan_name}</span>
                               <span className="arrow-icon">&gt;</span>
                            </li>
                        ))
                    ) : (
                        <li className="no-products">You have no active products.</li>
                    )}
                </ul>
            </div>

             <div className="account-options">
                {/* ... other options */}
                <button className="account-option-item logout-btn" onClick={onLogout}>
                    <span className="icon">
                        {/* Power Icon SVG - can be reused from TopNav if you centralize SVGs */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                            <line x1="12" y1="2" x2="12" y2="12"></line>
                        </svg>
                    </span>
                    <span className="label">Logout</span>
                </button>
            </div>
        </div>
    );
}

export default AccountView;

