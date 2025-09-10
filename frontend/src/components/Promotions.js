import React from 'react';
import './FormPages.css';

const promotions = [
    { 
        title: "🚀 Crypto First Deposit Bonus!", 
        content: "Get a 10% bonus on your first deposit made with USDT (TRC20). The bonus will be added directly to your deposit balance.",
        type: "crypto" 
    },
    { 
        title: "💵 UPI/Bank First Deposit Bonus!", 
        content: "Make your first deposit via UPI or Bank Transfer and receive a 5% bonus. A great way to kickstart your earnings.",
        type: "bank" 
    },
    { 
        title: "🤝 Referral Challenge!", 
        content: "Invite 10 new users who make their first investment, and receive a ₹500 bonus directly in your withdrawable wallet!",
        type: "referral" 
    },
];

function Promotions({ onBack }) {
    return (
        <div className="form-page-container">
            <div className="form-page-header">
                <button onClick={onBack} className="back-button">←</button>
                <h1>Promotions</h1>
            </div>

            <div className="promotions-list">
                {promotions.map((promo, index) => (
                    <div className={`promo-card promo-${promo.type}`} key={index}>
                        <h3>{promo.title}</h3>
                        <p>{promo.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Promotions;
