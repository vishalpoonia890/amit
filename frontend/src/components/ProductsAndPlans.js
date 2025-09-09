// src/components/ProductsAndPlans.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// import './ProductsAndPlans.css'; // Ensure you create this CSS file

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

function ProductsAndPlans({ token, onPlanPurchase }) {
    const [allPlans, setAllPlans] = useState([]);
    const [filteredPlans, setFilteredPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmingPlanId, setConfirmingPlanId] = useState(null);
    const [activeCategory, setActiveCategory] = useState('');

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/product-plans`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const fetchedPlans = response.data.plans || [];
            setAllPlans(fetchedPlans);

            // Dynamically determine categories from fetched data and create display names
            const categoryMap = { 'general': 'Primary', 'vip': 'VIP', 'session':G 'Sessions' };
            const uniqueInternalCategories = [...new Set(fetchedPlans.map(plan => plan.category || 'general'))];
            const displayCategories = uniqueInternalCategories.map(cat => categoryMap[cat.toLowerCase()] || cat);
            
            setCategories(displayCategories);
            
            const initialCategory = displayCategories[0] || '';
            setActiveCategory(initialCategory);
            filterPlansByCategory(fetchedPlans, initialCategory, categoryMap);

        } catch (err) {
            setError('Failed to load plans. Please try again.');
            console.error("Fetch plans error:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const filterPlansByCategory = (plansToFilter, categoryName, categoryMap) => {
        const internalCategoryName = Object.keys(categoryMap).find(key => categoryMap[key] === categoryName) || categoryName;
        const filtered = plansToFilter.filter(plan => (plan.category || 'general').toLowerCase() === internalCategoryName.toLowerCase());
        setFilteredPlans(filtered);
    };

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        const categoryMap = { 'general': 'Primary', 'vip': 'VIP', 'session': 'Sessions' };
        filterPlansByCategory(allPlans, categoryName, categoryMap);
    };

    const handlePurchase = async (plan) => {
        setLoading(true);
        setError('');
        try {
            await axios.post(
                `${API_BASE_URL}/api/purchase-plan`,
                { planId: plan.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onPlanPurchase(); // Triggers refresh and navigation in App.js
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to purchase plan. Please try again later.';
            alert(errorMessage);
            setError(errorMessage);
        } finally {
            setConfirmingPlanId(null);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

    return (
        <div className="plans-page"> {/* Ensure .plans-page styles exist in ProductsAndPlans.css */}
            <div className="plans-header">
                <h1>Available Investment Plans</h1>
                <div className="category-tabs">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category)}
                            disabled={loading}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            {error && <p className="error-message">{error}</p>}
            {loading ? <p>Loading Plans...</p> : (
                <div className="plans-grid">
                    {filteredPlans.map((plan) => (
                        <div key={plan.id} className="plan-card">
                            <div className="plan-card-body">
                                <h3>{plan.name}</h3>
                                <p className="price">Price: {formatCurrency(plan.price)}</p>
                                <div className="plan-details">
                                    <div><span>Daily Income:</span><strong>{formatCurrency(plan.dailyIncome)}</strong></div>
                                    <div><span>Term:</span><strong>{plan.durationDays} Days</strong></div>
                                    <div><span>Total Return:</span><strong>{formatCurrency(plan.totalReturn)}</strong></div>
                                </div>
                                {confirmingPlanId !== plan.id ? (
                                    <button className="purchase-button" onClick={() => setConfirmingPlanId(plan.id)} disabled={loading}>Invest Now</button>
                                ) : (
                                    <div className="confirmation-buttons">
                                        <button className="confirm-btn" onClick={() => handlePurchase(plan)} disabled={loading}>Confirm</button>
                                        <button className="cancel-btn" onClick={() => setConfirmingPlanId(null)} disabled={loading}>Cancel</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductsAndPlans;
