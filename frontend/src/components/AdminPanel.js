import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

function AdminPanel({ token }) {
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [gameStatus, setGameStatus] = useState({ is_on: false, mode: 'auto', maintenance_mode: false, whitelisted_users: [], user_win_chance_percent: 45 });
    const [currentBets, setCurrentBets] = useState({});
    const [nextResult, setNextResult] = useState('');
    const [whitelistInput, setWhitelistInput] = useState('');
    const [bonusAmount, setBonusAmount] = useState(100);
    const [bonusReason, setBonusReason] = useState('');
    const [bonusUserIds, setBonusUserIds] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- NEW STATES FOR NEW FEATURES ---
    const [gameStats, setGameStats] = useState(null);
    const [winChance, setWinChance] = useState(45);


    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setLoading(true);
        if(!isInitialLoad) setError('');
        try {
            const [depositsRes, withdrawalsRes, gameStatusRes, betsRes, statsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/recharges/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/withdrawals/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/game-status`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/current-bets`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/game-statistics`, { headers: { Authorization: `Bearer ${token}` } }) // Fetch new stats
            ]);
            setPendingDeposits(depositsRes.data.recharges || []);
            setPendingWithdrawals(withdrawalsRes.data.withdrawals || []);
            const fetchedGameStatus = gameStatusRes.data.status || { is_on: false, mode: 'auto', maintenance_mode: false, whitelisted_users: [], user_win_chance_percent: 45 };
            setGameStatus(fetchedGameStatus);
            setWinChance(fetchedGameStatus.user_win_chance_percent); // Sync win chance input
            setCurrentBets(betsRes.data.summary || {});
            setGameStats(statsRes.data); // Set the new game stats
        } catch (err) {
            if(isInitialLoad) setError('Failed to fetch admin data. Auto-refresh paused.');
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
            const res = await axios.post(`${API_BASE_URL}${urlMap[action]}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message || 'Action successful!');
            fetchData(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed.');
        }
    };

    const handleGameStatusUpdate = async (update) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/game-status`, update, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message || 'Game status updated!');
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
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to set next result.');
        }
    };

    const handleMaintenanceUpdate = async (update) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/game-maintenance`, update, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message || 'Maintenance settings updated!');
            fetchData(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update maintenance settings.');
        }
    };

    const handleAddWhitelistUser = () => {
        const newId = parseInt(whitelistInput, 10);
        if (isNaN(newId) || newId <= 0) { alert('Please enter a valid User ID.'); return; }
        if (gameStatus.whitelisted_users.includes(newId)) { alert('This User ID is already whitelisted.'); return; }
        const updatedList = [...gameStatus.whitelisted_users, newId];
        handleMaintenanceUpdate({ whitelisted_users: updatedList });
        setWhitelistInput('');
    };

    const handleRemoveWhitelistUser = (idToRemove) => {
        const updatedList = gameStatus.whitelisted_users.filter(id => id !== idToRemove);
        handleMaintenanceUpdate({ whitelisted_users: updatedList });
    };

    const handleDistributeIncome = async () => {
        if (!window.confirm("Are you sure you want to distribute daily income to all active investments? This action cannot be undone.")) return;
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/distribute-daily-income`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to distribute income.');
        }
    };

    const handleGrantBonus = async () => {
        const userIdsArray = bonusUserIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0);
        const target = userIdsArray.length > 0 ? `${userIdsArray.length} specific users` : 'ALL users';
        if (!window.confirm(`Are you sure you want to grant a bonus of ₹${bonusAmount} to ${target}?`)) return;

        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/grant-bonus`, 
                { amount: bonusAmount, reason: bonusReason, user_ids: userIdsArray }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message);
            setBonusAmount(100); setBonusReason(''); setBonusUserIds('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to grant bonus.');
        }
    };

     // ✅ --- NEW FUNCTION TO HANDLE SETTING WIN CHANCE ---
    const handleSetWinChance = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/set-win-chance`, 
                { winChance: winChance }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message || 'Win chance updated successfully!');
            fetchData(false); // Refresh data to confirm change
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update win chance.');
        }
    };


    if (loading) return <div className="loading-spinner">Loading Admin Panel...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const StatCard = ({ title, stats }) => (
        <div className="stat-card">
            <h3>{title}</h3>
            <div className="stat-row">
                <span className="stat-label">Total Bet Amount:</span>
                <span className="stat-value">{formatCurrency(stats?.totalIn)}</span>
            </div>
            <div className="stat-row">
                <span className="stat-label">Total Payouts:</span>
                <span className="stat-value">{formatCurrency(stats?.totalOut)}</span>
            </div>
            <div className="stat-row profit">
                <span className="stat-label">Profit / Loss:</span>
                <span className={`stat-value ${stats?.pl >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(stats?.pl)}</span>
            </div>
        </div>
    );

    return (
        <div className="admin-panel">
            <h1>Admin Control Panel</h1>

             {/* ✅ --- NEW GAME STATISTICS SECTION --- */}
            <div className="admin-section game-statistics">
                <h2>Game P/L Statistics</h2>
                {gameStats ? (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h4>Current Period</h4>
                            <p className="stat-value total-in">{formatCurrency(gameStats.currentPeriod.totalIn)}</p>
                            <p className="stat-label">Total In</p>
                            <p className="stat-value total-out">{formatCurrency(gameStats.currentPeriod.totalOut)}</p>
                            <p className="stat-label">Total Out</p>
                            <p className={`stat-value pl ${gameStats.currentPeriod.pl >= 0 ? 'profit' : 'loss'}`}>{formatCurrency(gameStats.currentPeriod.pl)}</p>
                            <p className="stat-label">Profit/Loss</p>
                        </div>
                        <div className="stat-card">
                            <h4>Today</h4>
                            <p className="stat-value total-in">{formatCurrency(gameStats.today.totalIn)}</p>
                            <p className="stat-label">Total In</p>
                            <p className="stat-value total-out">{formatCurrency(gameStats.today.totalOut)}</p>
                            <p className="stat-label">Total Out</p>
                            <p className={`stat-value pl ${gameStats.today.pl >= 0 ? 'profit' : 'loss'}`}>{formatCurrency(gameStats.today.pl)}</p>
                            <p className="stat-label">Profit/Loss</p>
                        </div>
                        <div className="stat-card">
                            <h4>All Time</h4>
                            <p className="stat-value total-in">{formatCurrency(gameStats.total.totalIn)}</p>
                            <p className="stat-label">Total In</p>
                            <p className="stat-value total-out">{formatCurrency(gameStats.total.totalOut)}</p>
                            <p className="stat-label">Total Out</p>
                            <p className={`stat-value pl ${gameStats.total.pl >= 0 ? 'profit' : 'loss'}`}>{formatCurrency(gameStats.total.pl)}</p>
                            <p className="stat-label">Profit/Loss</p>
                        </div>
                    </div>
                ) : <p>Loading statistics...</p>}
            </div>


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
                 {/* ✅ --- NEW WIN CHANCE CONTROL --- */}
                <div className="control-group win-chance-control">
                   <label>User Win Chance: <strong>{winChance}%</strong></label>
                   <div className="slider-group">
                       <input 
                           type="range" 
                           min="0" 
                           max="100" 
                           value={winChance} 
                           onChange={(e) => setWinChance(Number(e.target.value))}
                           className="win-chance-slider"
                       />
                       <button onClick={handleSetWinChance}>Set Chance</button>
                   </div>
               </div>
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
                        <input type="number" value={whitelistInput} onChange={(e) => setWhitelistInput(e.target.value)} placeholder="Enter User ID to allow access" />
                        <button onClick={handleAddWhitelistUser}>Add User</button>
                    </div>
                </div>
                <div className="whitelist-display">
                    <strong>Whitelisted Users:</strong>
                    {gameStatus.whitelisted_users.length > 0 ? (
                        <ul> {gameStatus.whitelisted_users.map(id => ( <li key={id}> User {id} <button onClick={() => handleRemoveWhitelistUser(id)} className="remove-btn">×</button> </li> ))} </ul>
                    ) : <p>No users are currently whitelisted.</p>}
                </div>
            </div>
            <div className="admin-section live-bets">
                <h2>Current Round Bet Summary <button className="refresh-btn" onClick={() => fetchData(false)}>Refresh Now</button></h2>
                <div className="bet-summary-grid">
                    {Object.entries(currentBets).filter(([key]) => !isNaN(key)).map(([num, amount]) => (
                        <div key={num} className="bet-summary-item"><span className="bet-number">{num}</span><span className="bet-amount">₹{amount.toLocaleString()}</span></div>
                    ))}
                </div>
                <div className="bet-summary-colors">
                    <div className="bet-summary-item color"><span className="bet-number red">Red</span><span className="bet-amount">₹{currentBets['Red']?.toLocaleString() || '0'}</span></div>
                    <div className="bet-summary-item color"><span className="bet-number green">Green</span><span className="bet-amount">₹{currentBets['Green']?.toLocaleString() || '0'}</span></div>
                    <div className="bet-summary-item color"><span className="bet-number violet">Violet</span><span className="bet-amount">₹{currentBets['Violet']?.toLocaleString() || '0'}</span></div>
                </div>
            </div>
            <div className="admin-section server-actions">
                <h2>Server Actions</h2>
                <div className="action-group">
                    <p>Distribute daily income from active investments to all users.</p>
                    <button onClick={handleDistributeIncome} className="action-btn">Distribute Daily Income</button>
                </div>
                <div className="action-group">
                    <p>Grant a bonus to all users or a specific list of comma-separated user IDs.</p>
                    <div className="bonus-controls">
                        <input type="number" value={bonusAmount} onChange={e => setBonusAmount(Number(e.target.value))} placeholder="Bonus Amount (₹)" />
                        <input type="text" value={bonusReason} onChange={e => setBonusReason(e.target.value)} placeholder="Reason (e.g., Festival Bonus)" />
                        <textarea value={bonusUserIds} onChange={e => setBonusUserIds(e.target.value)} placeholder="User IDs: 1, 2, 3 (optional, leave blank for all users)"></textarea>
                        <button onClick={handleGrantBonus} className="action-btn">Grant Bonus</button>
                    </div>
                </div>
            </div>
            <div className="admin-section">
                <h2>Pending Deposits ({pendingDeposits.length})</h2>
                <div className="table-container">
                    <table className="request-table">
                        <thead><tr><th>User ID</th><th>Amount</th><th>UTR/Hash</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {pendingDeposits.length > 0 ? pendingDeposits.map(d => ( <tr key={d.id}><td>{d.user_id}</td><td>₹{d.amount.toLocaleString()}</td><td>{d.utr}</td><td>{new Date(d.request_date).toLocaleString()}</td><td className="actions"><button className="approve-btn" onClick={() => handleAction('approve-deposit', d.id)}>Approve</button><button className="reject-btn" onClick={() => handleAction('reject-deposit', d.id)}>Reject</button></td></tr> )) : <tr><td colSpan="5">No pending deposits.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="admin-section">
                <h2>Pending Withdrawals ({pendingWithdrawals.length})</h2>
                <div className="table-container">
                    <table className="request-table">
                         <thead><tr><th>User ID</th><th>Amount</th><th>Method</th><th>Details</th><th>Date</th><th>Actions</th></tr></thead>
                         <tbody>
                            {pendingWithdrawals.length > 0 ? pendingWithdrawals.map(w => ( <tr key={w.id}><td>{w.user_id}</td><td>₹{w.amount.toLocaleString()}</td><td>{w.method}</td><td className="details-cell">{w.details}</td><td>{new Date(w.request_date).toLocaleString()}</td><td className="actions"><button className="approve-btn" onClick={() => handleAction('approve-withdrawal', w.id)}>Approve</button><button className="reject-btn" onClick={() => handleAction('reject-withdrawal', w.id)}>Reject</button></td></tr> )) : <tr><td colSpan="6">No pending withdrawals.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
export default AdminPanel;

