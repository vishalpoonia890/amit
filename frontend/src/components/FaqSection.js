// src/components/FaqSection.js
import React from 'react';

function FaqSection() {
  const steps = [
    {
      icon: '1️⃣',
      title: 'Choose a Plan',
      description: 'Browse our investment products and select one that fits your financial goals.'
    },
    {
      icon: '2️⃣',
      title: 'Recharge Your Wallet',
      description: 'Add funds to your account easily using our secure recharge options.'
    },
    {
      icon: '3️⃣',
      title: 'Purchase & Earn',
      description: 'Buy your chosen plan and start earning daily income automatically.'
    },
    {
      icon: '4️⃣',
      title: 'Withdraw Profits',
      description: 'Withdraw your earnings directly to your bank account with ease.'
    }
  ];

  return (
    <div className="premium-card">
      <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", color: "var(--text-primary)", fontWeight: "600" }}>
        How It Works
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {steps.map((step, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '24px' }}>{step.icon}</div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
                {step.title}
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FaqSection;
