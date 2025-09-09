import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://investmentpro-nu7s.onrender.com';
  }
  return '';
};
const API_BASE_URL = getApiBaseUrl();

function InvestmentPlans({ token, onPlanPurchase, userData, onBack }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPlanToConfirm, setSelectedPlanToConfirm] = useState(null);
  const [purchaseError, setPurchaseError] = useState('');
  const [showInsufficientBalancePopup, setShowInsufficientBalancePopup] = useState(false);

  // Fetch plans from backend
  const fetchProductPlans = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/product-plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(response.data.plans);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch product plans');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProductPlans();
  }, [fetchProductPlans]);

  // Actual purchase call to backend
  const handlePurchasePlan = async (planId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/purchase-plan`,
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Plan purchased successfully!');
      if (onPlanPurchase) {
        onPlanPurchase(response.data.newRechargeBalance);
      }
      fetchProductPlans();
      setSelectedPlanToConfirm(null);
    } catch (err) {
      setPurchaseError(err.response?.data?.error || 'Failed to purchase plan.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Check balance and show confirm or error popup
  const handleInitialPurchaseClick = (plan) => {
    setPurchaseError('');
    if ((userData?.recharge_balance ?? 0) < plan.price) {
      setShowInsufficientBalancePopup(true);
      setSelectedPlanToConfirm(null);
    } else {
      setSelectedPlanToConfirm(plan.id);
    }
  };

  // Step 2: Confirm purchase
  const handleConfirmPurchaseClick = () => {
    if (selectedPlanToConfirm) {
      handlePurchasePlan(selectedPlanToConfirm);
    }
  };

  // Format numbers as INR currency
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

  return (
    <div style={{ padding: 16, fontFamily: 'Arial, sans-serif', color: '#ddd', backgroundColor: '#121212', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', fontSize: 18 }}>←</button>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: 24, background: 'linear-gradient(to right, #FFD700, #4169e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Investment Plans
        </h1>
        <div style={{ width: 40 }} />
      </div>

      {error && <div style={{ color: 'tomato', marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ color: 'lightgreen', marginBottom: 16 }}>{success}</div>}
      {purchaseError && <div style={{ color: 'tomato', marginBottom: 16 }}>{purchaseError}</div>}

      {loading && !plans.length ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Loading plans...</div>
      ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {plans.map(plan => {
              const isConfirming = selectedPlanToConfirm === plan.id;
              const categoryColors = {
                beginner: { bg: 'rgba(0, 200, 83, 0.1)', text: '#00C853', border: 'rgba(0, 200, 83, 0.3)' },
                intermediate: { bg: 'rgba(65, 105, 225, 0.1)', text: '#4169e1', border: 'rgba(65, 105, 225, 0.3)' },
                advanced: { bg: 'rgba(123, 31, 162, 0.1)', text: '#7b1fa2', border: 'rgba(123, 31, 162, 0.3)' },
                premium: { bg: 'rgba(255, 215, 0, 0.1)', text: '#FFD700', border: 'rgba(255, 215, 0, 0.3)' }
              };
              const color = categoryColors[plan.category] || categoryColors.premium;

              return (
                <div key={plan.id} style={{ margin: 0, border: `1px solid ${color.border}`, position: 'relative', overflow: 'hidden', backgroundColor: '#1e1e1e', padding: 16, borderRadius: 8 }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', fontSize: 12, fontWeight: 600, borderBottomLeftRadius: 12, backgroundColor: color.bg, color: color.text }}>
                    {plan.category}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px', fontSize: 20, color: '#fff', fontWeight: 600 }}>{plan.name}</h3>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#FFD700', margin: '8px 0' }}>{formatCurrency(plan.price)}</div>
                    </div>
                    <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      💼
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 4px', color: '#bbb', fontSize: 12 }}>Daily Income</p>
                      <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: 16 }}>{formatCurrency(plan.dailyIncome)}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 4px', color: '#bbb', fontSize: 12 }}>Duration</p>
                      <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: 16 }}>{plan.durationDays} Days</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 4px', color: '#bbb', fontSize: 12 }}>Profit</p>
                      <p style={{ margin: 0, color: '#00C853', fontWeight: 600, fontSize: 16 }}>{formatCurrency(plan.totalReturn - plan.price)}</p>
                    </div>
                  </div>
                  {!isConfirming && (
                    <button className="gradient-button"
                      onClick={() => handleInitialPurchaseClick(plan)}
                      disabled={loading}
                      style={{ width: '100%', padding: 16, fontWeight: 600, fontSize: 16, background: '#FFD700', color: '#000', border: 'none', cursor: 'pointer', borderRadius: 8 }}
                    >
                      Purchase Plan
                    </button>
                  )}
                  {isConfirming && (
                    <>
                      <button className="gradient-button"
                        onClick={handleConfirmPurchaseClick}
                        disabled={loading}
                        style={{ width: '100%', padding: 16, marginBottom: 8, fontWeight: 600, fontSize: 16, background: '#00C853', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 8 }}
                      >
                        {loading ? 'Processing...' : 'Confirm Purchase'}
                      </button>
                      <button className="secondary-button"
                        onClick={() => setSelectedPlanToConfirm(null)}
                        disabled={loading}
                        style={{ width: '100%', padding: 16, fontWeight: 600, fontSize: 16, background: '#555', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 8 }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      {/* Insufficient Balance Popup */}
      {showInsufficientBalancePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, maxWidth: 320, width: '90%', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#000' }}>Insufficient Balance</h2>
            <p style={{ color: '#000' }}>You do not have enough balance to purchase this plan.</p>
            <button onClick={() => setShowInsufficientBalancePopup(false)} style={{ marginTop: 16, padding: '8px 24px', borderRadius: 8, border: 'none', backgroundColor: '#4169e1', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentPlans;
