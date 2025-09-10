import React from 'react';

const placeholderStyle = {
    padding: '40px 20px',
    textAlign: 'center',
    color: 'var(--text-color-light)'
};

const PageWrapper = ({ onBack, title, children }) => (
    <div style={{padding: '15px', paddingTop: '75px', paddingBottom: '80px'}}>
        <button className="back-button" onClick={onBack}>← Back</button>
        <div style={placeholderStyle}>
            <h2>{title}</h2>
            {children || <p>This feature is coming soon!</p>}
        </div>
    </div>
);

export const ProductsAndPlans = ({ onPlanPurchase }) => <div style={placeholderStyle}><h2>Products & Plans</h2><p>Coming Soon</p></div>;
export const NewsView = () => <div style={placeholderStyle}><h2>News & Announcements</h2><p>Coming Soon</p></div>;
export const Wallet = ({ onBack, financialSummary }) => <PageWrapper onBack={onBack} title="My Wallet" />;
export const Team = ({ onBack }) => <PageWrapper onBack={onBack} title="My Team & Referrals" />;
export const Promotions = ({ onBack }) => <PageWrapper onBack={onBack} title="Promotions" />;
export const Rewards = ({ onBack }) => <PageWrapper onBack={onBack} title="Daily Rewards" />;
export const Support = ({ onBack }) => <PageWrapper onBack={onBack} title="Customer Support" />;

