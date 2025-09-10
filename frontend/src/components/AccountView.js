import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AccountView.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

// Helper to format currency
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

    const user = userData || { name: 'User', mobile: 'N/A' };
    const financials = financialSummary ? {
        todays_earnings: financialSummary.todaysIncome || 0,
        withdrawable: financialSummary.withdrawable_wallet || 0,
        recharge: financialSummary.balance || 0,
        today: financialSummary.todaysIncome || 0,
        total_yid: financialSummary.totalIncome || 0,
        team_commission: financialSummary.teamIncome || 0,
        total_balance: (financialSummary.balance || 0) + (financialSummary.withdrawable_wallet || 0)
    } : { /* default empty values */ };

    return (
        <div className="account-view">
            <div className="profile-header-card">
                <img src={user.avatar_url || 'https://via.placeholder.com/150'} alt="User Avatar" className="avatar" />
                <div className="profile-info">
                    <h3 className="username">{user.name}</h3>
                    <p className="user-details">{user.mobile} • Singapore</p>
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
                    <span className="label">Withdraw</span>
                    <span className="value">{formatCurrency(financials.withdrawable)}</span>
                </div>
                <div className="grid-item">
                    <span className="label">Recharge</span>
                    <span className="value">{formatCurrency(financials.recharge)}</span>
                </div>
                <div className="grid-item">
                    <span className="label">Today</span>
                    <span className="value">{formatCurrency(financials.today)}</span>
                </div>
                <div className="grid-item">
                    <span className="label">Total YID</span>
                    <span className="value">{formatCurrency(financials.total_yid)}</span>
                </div>
                 <div className="grid-item">
                    <span className="label">Team</span>
                    <span className="value">{formatCurrency(financials.team_commission)}</span>
                </div>
                 <div className="grid-item">
                    <span className="label">Total</span>
                    <span className="value">{formatCurrency(financials.total_balance)}</span>
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

             <div className="account-options-card">
                 <button className="option-item" onClick={() => onViewChange('bet-history')}>Bet History</button>
                 <button className="option-item" onClick={onLogout}>Sign Out</button>
            </div>
        </div>
    );
}

export default AccountView;

