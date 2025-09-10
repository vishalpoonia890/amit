import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

function AdminPanel({ token }) {
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [gameStatus, setGameStatus] = useState({ is_on: false, mode: 'auto', maintenance_mode: false, whitelisted_users: [] });
    const [currentBets, setCurrentBets] = useState({});
    const [nextResult, setNextResult] = useState('');
    const [whitelistInput, setWhitelistInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setLoading(true);
        if(!isInitialLoad) setError('');
        try {
            const [depositsRes, withdrawalsRes, gameStatusRes, betsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/recharges/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/withdrawals/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/game-status`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/current-bets`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPendingDeposits(depositsRes.data.recharges || []);
            setPendingWithdrawals(withdrawalsRes.data.withdrawals || []);
            setGameStatus(gameStatusRes.data.status || { is_on: false, mode: 'auto', maintenance_mode: false, whitelisted_users: [] });
            setCurrentBets(betsRes.data.summary || {});
        } catch (err) {
            if(isInitialLoad) setError('Failed to fetch admin data. Please refresh.');
            console.error(err);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData(true);
        const interval = setInterval(() => fetchData(false), 5000);
        return () => clearInterval(interval);
    }, [fetchData]);
    
    const handleAction = async (action, id) => {
        const urlMap = {
            'approve-deposit': `/api/admin/recharge/${id}/approve`,
            'reject-deposit': `/api/admin/recharge/${id}/reject`,
            'approve-withdrawal': `/api/admin/withdrawal/${id}/approve`,
            'reject-withdrawal': `/api/admin/withdrawal/${id}/reject`,
        };
        try {
            await axios.post(urlMap[action], {}, { headers: { Authorization: `Bearer ${token}` } });
            alert('Action successful!');
            fetchData(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed.');
        }
    };

    const handleGameStatusUpdate = async (update) => {
        try {
            await axios.post(`${API_BASE_URL}/api/admin/game-status`, update, { headers: { Authorization: `Bearer ${token}` } });
            alert('Game status updated!');
            fetchData(false);
        } catch (err) {
             alert(err.response?.data?.error || 'Failed to update game status.');
        }
    };

    const handleSetNextResult = async () => {
        if (!nextResult || isNaN(parseInt(nextResult)) || nextResult < 0 || nextResult > 9) {
            alert('Please enter a valid number between 0 and 9.');
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/api/admin/game-next-result`, { result: parseInt(nextResult) }, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Next result set to ${nextResult}!`);
            setNextResult('');
            fetchData(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to set next result.');
        }
    };

    const handleMaintenanceUpdate = async (update) => {
        try {
            await axios.post(`${API_BASE_URL}/api/admin/game-maintenance`, update, { headers: { Authorization: `Bearer ${token}` } });
            alert('Maintenance settings updated!');
            fetchData(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update maintenance settings.');
        }
    };

    const handleAddWhitelistUser = () => {
        const newId = parseInt(whitelistInput, 10);
        if (isNaN(newId) || newId <= 0) {
            alert('Please enter a valid User ID.');
            return;
        }
        if (gameStatus.whitelisted_users.includes(newId)) {
            alert('This User ID is already whitelisted.');
            return;
        }
        const updatedList = [...gameStatus.whitelisted_users, newId];
        handleMaintenanceUpdate({ whitelisted_users: updatedList });
        setWhitelistInput('');
    };

    const handleRemoveWhitelistUser = (idToRemove) => {
        const updatedList = gameStatus.whitelisted_users.filter(id => id !== idToRemove);
        handleMaintenanceUpdate({ whitelisted_users: updatedList });
    };

    if (loading) return <div className="loading-spinner">Loading Admin Panel...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-panel">
            <h1>Admin Control Panel</h1>

            <div className="admin-section game-controls">
                <h2>Game Management</h2>
                <div className="control-group">
                    <label>Game Status</label>
                    <div className="toggle-switch">
                        <button onClick={() => handleGameStatusUpdate({ is_on: true })} className={gameStatus.is_on ? 'active' : ''}>ON</button>
                        <button onClick={() => handleGameStatusUpdate({ is_on: false })} className={!gameStatus.is_on ? 'active' : ''}>OFF</button>
                    </div>
                </div>
                 <div className="control-group">
                    <label>Game Mode</label>
                    <div className="toggle-switch">
                        <button onClick={() => handleGameStatusUpdate({ mode: 'auto' })} className={gameStatus.mode === 'auto' ? 'active' : ''}>Auto</button>
                        <button onClick={() => handleGameStatusUpdate({ mode: 'admin' })} className={gameStatus.mode === 'admin' ? 'active' : ''}>Admin</button>
                    </div>
                </div>
                {gameStatus.mode === 'admin' && gameStatus.is_on && (
                     <div className="control-group manual-control">
                        <label>Set Next Winning Number (0-9)</label>
                        <div className="input-group">
                            <input type="number" value={nextResult} onChange={(e) => setNextResult(e.target.value)} min="0" max="9" placeholder="e.g., 5" />
                            <button onClick={handleSetNextResult}>Set Result</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="admin-section maintenance-controls">
                <h2>Maintenance Mode</h2>
                <div className="control-group">
                    <label>Maintenance Status</label>
                    <div className="toggle-switch">
                        <button onClick={() => handleMaintenanceUpdate({ maintenance_mode: true })} className={gameStatus.maintenance_mode ? 'active' : ''}>ON</button>
                        <button onClick={() => handleMaintenanceUpdate({ maintenance_mode: false })} className={!gameStatus.maintenance_mode ? 'active' : ''}>OFF</button>
                    </div>
                </div>
                <div className="control-group">
                    <label>Whitelist User ID</label>
                    <div className="input-group">
                        <input
                            type="number"
                            value={whitelistInput}
                            onChange={(e) => setWhitelistInput(e.target.value)}
                            placeholder="Enter User ID to allow access"
                        />
                        <button onClick={handleAddWhitelistUser}>Add User</button>
                    </div>
                </div>
                <div className="whitelist-display">
                    <strong>Whitelisted Users:</strong>
                    {gameStatus.whitelisted_users.length > 0 ? (
                        <ul>
                            {gameStatus.whitelisted_users.map(id => (
                                <li key={id}>
                                    User {id}
                                    <button onClick={() => handleRemoveWhitelistUser(id)} className="remove-btn">×</button>
                                </li>
                            ))}
                        </ul>
                    ) : <p>No users are currently whitelisted.</p>}
                </div>
            </div>

            <div className="admin-section live-bets">
                <h2>Current Round Bet Summary <button className="refresh-btn" onClick={() => fetchData(false)}>Refresh Now</button></h2>
                <div className="bet-summary-grid">
                    {Object.entries(currentBets).filter(([key]) => !isNaN(key)).map(([num, amount]) => (
                        <div key={num} className="bet-summary-item">
                            <span className="bet-number">{num}</span>
                            <span className="bet-amount">₹{amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                <div className="bet-summary-colors">
                    <div className="bet-summary-item color"><span className="bet-number red">Red</span><span className="bet-amount">₹{currentBets['Red']?.toLocaleString() || '0'}</span></div>
                    <div className="bet-summary-item color"><span className="bet-number green">Green</span><span className="bet-amount">₹{currentBets['Green']?.toLocaleString() || '0'}</span></div>
                    <div className="bet-summary-item color"><span className="bet-number violet">Violet</span><span className="bet-amount">₹{currentBets['Violet']?.toLocaleString() || '0'}</span></div>
                </div>
            </div>
            
            <div className="admin-section">
                <h2>Pending Deposits ({pendingDeposits.length})</h2>
                <div className="table-container">
                    <table className="request-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Amount</th>
                                <th>UTR/Hash</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingDeposits.length > 0 ? pendingDeposits.map(d => (
                                <tr key={d.id}>
                                    <td>{d.user_id}</td>
                                    <td>₹{d.amount.toLocaleString()}</td>
                                    <td>{d.utr}</td>
                                    <td>{new Date(d.request_date).toLocaleString()}</td>
                                    <td className="actions">
                                        <button className="approve-btn" onClick={() => handleAction('approve-deposit', d.id)}>Approve</button>
                                        <button className="reject-btn" onClick={() => handleAction('reject-deposit', d.id)}>Reject</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="5">No pending deposits.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="admin-section">
                <h2>Pending Withdrawals ({pendingWithdrawals.length})</h2>
                <div className="table-container">
                    <table className="request-table">
                         <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Details</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingWithdrawals.length > 0 ? pendingWithdrawals.map(w => (
                                <tr key={w.id}>
                                    <td>{w.user_id}</td>
                                    <td>₹{w.amount.toLocaleString()}</td>
                                    <td>{w.method}</td>
                                    <td className="details-cell">{w.details}</td>
                                    <td>{new Date(w.request_date).toLocaleString()}</td>
                                    <td className="actions">
                                        <button className="approve-btn" onClick={() => handleAction('approve-withdrawal', w.id)}>Approve</button>
                                        <button className="reject-btn" onClick={() => handleAction('reject-withdrawal', w.id)}>Reject</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="6">No pending withdrawals.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;

