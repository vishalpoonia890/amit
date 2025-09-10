import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
}).format(amount || 0);

function AdminPanel({ token, onLogout }) {
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [depositsRes, withdrawalsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/recharges/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/withdrawals/pending`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPendingDeposits(depositsRes.data.recharges || []);
            setPendingWithdrawals(withdrawalsRes.data.withdrawals || []);
        } catch (err) {
            setError('Failed to fetch pending requests.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleApprove = async (type, id) => {
        const url = type === 'deposit' 
            ? `${API_BASE_URL}/api/admin/recharge/${id}/approve` 
            : `${API_BASE_URL}/api/admin/withdrawal/${id}/approve`;
        try {
            await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert(`${type} approved successfully!`);
            fetchData(); // Refresh data
        } catch (err) {
            alert(`Failed to approve ${type}.`);
            console.error(err);
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.post(`${API_BASE_URL}/api/admin/withdrawal/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Withdrawal rejected successfully!`);
            fetchData(); // Refresh data
        } catch (err) {
            alert(`Failed to reject withdrawal.`);
            console.error(err);
        }
    };

    const handleSettleIncome = async () => {
        if (!window.confirm("Are you sure you want to settle daily income for ALL users? This action cannot be undone.")) {
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/api/admin/daily-recycle`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Daily income settled successfully! Processed ${res.data.processedInvestments} investments.`);
        } catch (err) {
            alert('Failed to settle daily income.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>Admin Panel</h1>
                <button onClick={onLogout} className="admin-logout-btn">Logout</button>
            </div>

            {error && <p className="admin-error">{error}</p>}
            {loading && <p>Loading...</p>}

            <div className="admin-card master-controls">
                <h2>Master Controls</h2>
                <button onClick={handleSettleIncome} className="settle-income-btn" disabled={loading}>
                    Settle Daily Income for All Users
                </button>
            </div>

            <div className="admin-grid">
                <div className="admin-card">
                    <h2>Pending Deposits ({pendingDeposits.length})</h2>
                    <div className="request-list">
                        {pendingDeposits.length > 0 ? pendingDeposits.map(d => (
                            <div key={d.id} className="request-item">
                                <div className="item-details">
                                    <span><strong>User ID:</strong> {d.user_id}</span>
                                    <span><strong>Amount:</strong> {formatCurrency(d.amount)}</span>
                                    <span><strong>UTR:</strong> {d.utr || 'N/A'}</span>
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => handleApprove('deposit', d.id)} className="approve-btn">Approve</button>
                                </div>
                            </div>
                        )) : <p>No pending deposits.</p>}
                    </div>
                </div>

                <div className="admin-card">
                    <h2>Pending Withdrawals ({pendingWithdrawals.length})</h2>
                     <div className="request-list">
                        {pendingWithdrawals.length > 0 ? pendingWithdrawals.map(w => (
                            <div key={w.id} className="request-item">
                                <div className="item-details">
                                    <span><strong>User ID:</strong> {w.user_id}</span>
                                    <span><strong>Amount:</strong> {formatCurrency(w.amount)}</span>
                                    <span><strong>Method:</strong> {w.method}</span>
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => handleApprove('withdrawal', w.id)} className="approve-btn">Approve</button>
                                    <button onClick={() => handleReject(w.id)} className="reject-btn">Reject</button>
                                </div>
                            </div>
                        )) : <p>No pending withdrawals.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;
