// src/components/AccountView.js
import React from 'react';

function AccountView({ userData, financialSummary, onViewChange }) {
  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);

  const listItems = [
    { label: 'My Products', view: 'my-products' },
    { label: 'Transactions', view: 'transactions' },
    { label: 'My Coupon', view: 'coupons' },
    { label: 'My Team', view: 'team' },
    { label: 'Redeem Gift', view: 'redeem' },
    { label: 'My Bank Account', view: 'bank-account' },
  ];

  return (
    <div className="account-view">
      <div className="account-header">
        <div className="account-info">
          <div className="account-logo">CPL</div>
          <div className="account-details">
            <p>{userData?.mobile}</p>
            <span>VIP-{userData?.vip_level || 0}</span>
          </div>
        </div>
      </div>

      <div className="account-summary-card">
        <div className="summary-grid">
          <div><span>{formatCurrency(financialSummary?.totalProfit)}</span>Total Income</div>
          <div><span>{formatCurrency(userData?.total_recharge)}</span>Total Recharge</div>
          <div><span>{formatCurrency(financialSummary?.totalAssets)}</span>Total Assets</div>
          <div><span>{formatCurrency(userData?.total_withdraw)}</span>Total Withdraw</div>
          <div><span>{formatCurrency(financialSummary?.todays_earning)}</span>Today's Income</div>
          <div><span>{formatCurrency(userData?.team_income)}</span>Team Income</div>
        </div>
      </div>
      
      <div className="account-balance-card">
         <div><span>{formatCurrency(userData?.recharge_balance)}</span>Recharge</div>
         <div><span>{formatCurrency(userData?.balance)}</span>Balance</div>
         <div><span>{userData?.points || 0}</span>Points</div>
      </div>

      <div className="account-actions">
        <button onClick={() => onViewChange('recharge')}>Recharge</button>
        <button onClick={() => onViewChange('withdraw')}>Withdraw</button>
      </div>

      <div className="account-list">
        {listItems.map(item => (
          <button key={item.label} onClick={() => onViewChange(item.view)} className="list-item">
            <span>{item.label}</span>
            <span>&gt;</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export default AccountView;
