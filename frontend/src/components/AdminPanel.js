import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

function AdminPanel({ token, onLogout }) {
    const [view, setView] = useState('dashboard'); // dashboard, deposits, withdrawals
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [gameStatus, setGameStatus] = useState({ is_active: false, mode: 'auto', next_winner: null });
    const [manualWinner, setManualWinner] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const [depositsRes, withdrawalsRes, gameStatusRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/admin/recharges/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/api/admin/withdrawals/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/api/admin/game-status`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setPendingDeposits(depositsRes.data.recharges);
                setPendingWithdrawals(withdrawalsRes.data.withdrawals);
                setGameStatus(gameStatusRes.data);
            } catch (error) {
                console.error("Failed to fetch admin data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, [token]);

    const handleSettleDailyIncome = async () => {
        if (!window.confirm("Are you sure you want to settle daily income for ALL active users? This cannot be undone.")) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/daily-recycle`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message);
        } catch (error) {
            alert('Failed to settle daily income.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleUpdateGameStatus = async (newStatus) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/update-game-status`, newStatus, {
                 headers: { Authorization: `Bearer ${token}` } 
            });
            setGameStatus(res.data);
            alert("Game status updated!");
        } catch (error) {
             alert('Failed to update game status.');
             console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    // Placeholder functions for approving/rejecting
    const handleApproveDeposit = (id) => alert(`Approving deposit ${id}...`);
    const handleApproveWithdrawal = (id) => alert(`Approving withdrawal ${id}...`);
    const handleRejectWithdrawal = (id) => alert(`Rejecting withdrawal ${id}...`);


    return (
        <div className="admin-panel">
            <header className="admin-header">
                <h1>Admin Panel</h1>
                <button onClick={onLogout}>Logout</button>
            </header>

            <div className="admin-main-content">
                <div className="admin-card">
                    <h4>Master Controls</h4>
                    <button onClick={handleSettleDailyIncome} disabled={loading} className="control-btn settle-btn">
                        Settle Daily Income
                    </button>
                </div>

                <div className="admin-card">
                    <h4>Color Game Management</h4>
                     <div className="game-controls">
                        <label className="switch">
                            <input type="checkbox" checked={gameStatus.is_active} onChange={(e) => handleUpdateGameStatus({ is_active: e.target.checked })} />
                            <span className="slider round"></span>
                        </label>
                        <span>Game {gameStatus.is_active ? 'On' : 'Off'}</span>
                    </div>
                     <div className="game-controls">
                        <label className="switch">
                            <input type="checkbox" checked={gameStatus.mode === 'admin'} onChange={(e) => handleUpdateGameStatus({ mode: e.target.checked ? 'admin' : 'auto' })} />
                            <span className="slider round"></span>
                        </label>
                        <span>{gameStatus.mode === 'admin' ? 'Admin Mode' : 'Auto Mode'}</span>
                    </div>

                    {gameStatus.mode === 'admin' && (
                        <div className="manual-winner-control">
                            <input 
                                type="number" 
                                min="0" 
                                max="9"
                                value={manualWinner}
                                onChange={(e) => setManualWinner(e.target.value)}
                                placeholder="Next Winner (0-9)"
                            />
                            <button onClick={() => handleUpdateGameStatus({ next_winner: parseInt(manualWinner) })} disabled={loading}>Set Winner</button>
                        </div>
                    )}
                </div>

                <div className="admin-card">
                    <h4>Pending Deposits ({pendingDeposits.length})</h4>
                     <div className="request-list">
                        {pendingDeposits.length > 0 ? pendingDeposits.map(d => (
                            <div key={d.id} className="request-item">
                                <div>ID: {d.user_id} | Amount: {d.amount}</div>
                                <div>UTR: {d.utr || 'N/A'}</div>
                                <div className="actions">
                                    <button className="approve-btn" onClick={() => handleApproveDeposit(d.id)}>Approve</button>
                                </div>
                            </div>
                        )) : <p>No pending deposits.</p>}
                    </div>
                </div>

                 <div className="admin-card">
                    <h4>Pending Withdrawals ({pendingWithdrawals.length})</h4>
                    <div className="request-list">
                       {pendingWithdrawals.length > 0 ? pendingWithdrawals.map(w => (
                            <div key={w.id} className="request-item">
                                <div>ID: {w.user_id} | Amount: {w.amount}</div>
                                <div>Details: {w.details}</div>
                                <div className="actions">
                                    <button className="approve-btn" onClick={() => handleApproveWithdrawal(w.id)}>Approve</button>
                                    <button className="reject-btn" onClick={() => handleRejectWithdrawal(w.id)}>Reject</button>
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

