// src/components/MyProductsView.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const getApiBaseUrl = () => process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';
const API_BASE_URL = getApiBaseUrl();

function MyProductsView({ token, onBack }) {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/investments`, { headers: { Authorization: `Bearer ${token}` } });
      setInvestments(res.data.investments || []);
    } catch (err) {
      console.error("Failed to fetch investments:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleClaimIncome = async (investmentId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/investments/${investmentId}/claim`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Income claimed successfully!");
      fetchInvestments(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.error || "Failed to claim income. You may have already claimed it for today.");
    }
  };
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB');

  return (
    <div className="my-products-view">
      <div className="view-header">
        <button onClick={onBack}>&lt;</button>
        <h1>My Products</h1>
        <div></div>
      </div>
      <div className="products-list">
        {loading ? <p>Loading...</p> : investments.map(inv => (
          <div key={inv.id} className="my-product-card">
            <img src={inv.imageUrl || 'https://via.placeholder.com/100'} alt={inv.plan_name} />
            <div className="details">
              <div><span>Price</span><strong>{inv.price} Rs</strong></div>
              <div><span>Cycle</span><strong>{inv.duration_days} Days</strong></div>
              <div><span>Income</span><strong>{inv.daily_income} Rs</strong></div>
              <div><span>Create</span><strong>{formatDate(inv.purchase_date)}</strong></div>
            </div>
            <button 
              className="claim-button" 
              onClick={() => handleClaimIncome(inv.id)}
              disabled={inv.claimed_today} // Assuming your API provides this status
            >
              {inv.claimed_today ? 'Claimed' : 'Get'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyProductsView;
