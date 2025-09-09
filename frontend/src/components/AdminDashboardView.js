// src/components/AdminDashboardView.js 
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const getApiBaseUrl = () => process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';
const API_BASE_URL = getApiBaseUrl();

function AdminDashboardView({ token }) {
    const [summary, setSummary] = useState({ todaysProfit: 0, todaysDeposits: 0, todaysWithdrawals: 0 });
    const [pendingRecharges, setPendingRecharges] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, rechargesRes, withdrawalsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/dashboard-summary`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/recharges/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/withdrawals/pending`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setSummary(summaryRes.data);
            setPendingRecharges(rechargesRes.data.recharges || []);
            setPendingWithdrawals(withdrawalsRes.data.withdrawals || []);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (action, type, id) => {
        if (!window.confirm(`Are you sure you want to ${action} this ${type}?`)) return;
        try {
            await axios.post(`${API_BASE_URL}/api/admin/${type}/${id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert(`${type} ${action}ed successfully!`);
            fetchData(); // Refresh all data
        } catch (error) {
            alert(`Failed to ${action} ${type}.`);
        }
    };

     const handleDailyRecycle = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/admin/daily-recycle`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert("Daily profit distribution completed successfully!");
        } catch (error) {
            alert("Failed to distribute profits.");
        } finally {
            setLoading(false);
        }
    };
    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

    if (loading) return <p>Loading Dashboard...</p>;

    return (
        <div className="admin-view">
            <div className="summary-cards">
                <div className="summary-card"><h4>Today's Profit</h4><p>{formatCurrency(summary.todaysProfit)}</p></div>
                <div className="summary-card"><h4>Today's Deposits</h4><p>{formatCurrency(summary.todaysDeposits)}</p></div>
                <div className="summary-card"><h4>Today's Withdrawals</h4><p>{formatCurrency(summary.todaysWithdrawals)}</p></div>
            </div>

            <div className="daily-recycle-section">
                <h2>One-Click Profit Distribution</h2>
                <button onClick={handleDailyRecycle} className="recycle-btn">Distribute All Daily Profits</button>
            </div>

            <div className="requests-grid">
                <div className="requests-section">
                    <h2>Pending Recharges ({pendingRecharges.length})</h2>
                    <div className="requests-list">
                        {pendingRecharges.length > 0 ? pendingRecharges.map(r => (
                            <div key={r.id} className="request-card">
                                <p><strong>User:</strong> {r.user_name} ({r.user_email})</p>
                                <p><strong>Amount:</strong> {formatCurrency(r.amount)}</p>
                                <p><strong>UTR:</strong> {r.utr}</p>
                                <div className="request-actions">
                                    <button className="approve-btn" onClick={() => handleAction('approve', 'recharge', r.id)}>Approve</button>
                                    <button className="reject-btn" onClick={() => handleAction('reject', 'recharge', r.id)}>Reject</button>
                                </div>
                            </div>
                        )) : <p>No pending recharges.</p>}
                    </div>
                </div>
                <div className="requests-section">
                    <h2>Pending Withdrawals ({pendingWithdrawals.length})</h2>
                    <div className="requests-list">
                        {pendingWithdrawals.length > 0 ? pendingWithdrawals.map(w => (
                            <div key={w.id} className="request-card">
                                <p><strong>User:</strong> {w.user_name} ({w.user_email})</p>
                                <p><strong>Amount:</strong> {formatCurrency(w.amount)}</p>
                                <p><strong>Details:</strong> {w.details}</p>
                                <div className="request-actions">
                                    <button className="approve-btn" onClick={() => handleAction('approve', 'withdrawal', w.id)}>Approve</button>
                                    <button className="reject-btn" onClick={() => handleAction('reject', 'withdrawal', w.id)}>Reject</button>
                                </div>
                            </div>
                        )) : <p>No pending withdrawals.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardView;
