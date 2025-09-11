import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// Helper to format currency
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        amount = 0;
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
};


function AdminPanel({ token }) {
    // State for all admin data
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [gameStatus, setGameStatus] = useState({ is_on: false, mode: 'auto', payout_priority: 'admin' });
    const [gameStats, setGameStats] = useState({ total: {}, today: {}, currentPeriod: {} });
    const [currentBets, setCurrentBets] = useState({});
    const [outcomeAnalysis, setOutcomeAnalysis] = useState({ mostProfitable: [], leastProfitable: [] });
    const [nextResult, setNextResult] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Centralized data fetching function
    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setLoading(true);
        setError(''); // Clear previous errors on each refresh
        try {
            const [depositsRes, withdrawalsRes, gameStatusRes, statsRes, betsRes, analysisRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/recharges/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/withdrawals/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/game-status`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/game-statistics`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/current-bets`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/game-outcome-analysis`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPendingDeposits(depositsRes.data.recharges || []);
            setPendingWithdrawals(withdrawalsRes.data.withdrawals || []);
            setGameStatus(gameStatusRes.data.status || { is_on: false, mode: 'auto', payout_priority: 'admin' });
            setGameStats(statsRes.data || { total: {}, today: {}, currentPeriod: {} });
            setCurrentBets(betsRes.data.summary || {});
            setOutcomeAnalysis(analysisRes.data || { mostProfitable: [], leastProfitable: [] });

        } catch (err) {
            if (isInitialLoad) setError('Failed to fetch admin data. Auto-refresh paused.');
            console.error(err);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, [token]);

    // Fetch data on initial load and set up an interval to refresh
    useEffect(() => {
        fetchData(true);
        const interval = setInterval(() => fetchData(false), 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    // Handler for deposit/withdrawal actions
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
            fetchData(false); // Refresh data after action
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed.');
        }
    };

    // Handler for updating game status (On/Off, Mode, Priority)
    const handleGameStatusUpdate = async (update) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/game-status`, update, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message || 'Game status updated!');
            fetchData(false);
        } catch (err) {
             alert(err.response?.data?.error || 'Failed to update game status.');
        }
    };
    
    // Handler for setting the next game result in admin mode
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

    if (loading) return <div className="loading-spinner">Loading Admin Panel...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-panel">
            <h1>Admin Control Panel</h1>

            <div className="admin-section stats-section">
                <h2>Game P/L Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h4>Current Period</h4>
                        <p className={`stat-value ${gameStats.currentPeriod.pl >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(gameStats.currentPeriod.pl)}
                        </p>
                        <div className="stat-details"><span>In:</span> {formatCurrency(gameStats.currentPeriod.totalIn)}</div>
                        <div className="stat-details"><span>Out:</span> {formatCurrency(gameStats.currentPeriod.totalOut)}</div>
                    </div>
                    <div className="stat-card">
                        <h4>Today</h4>
                        <p className={`stat-value ${gameStats.today.pl >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(gameStats.today.pl)}
                        </p>
                        <div className="stat-details"><span>In:</span> {formatCurrency(gameStats.today.totalIn)}</div>
                        <div className="stat-details"><span>Out:</span> {formatCurrency(gameStats.today.totalOut)}</div>
                    </div>
                    <div className="stat-card">
                        <h4>Overall</h4>
                        <p className={`stat-value ${gameStats.total.pl >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(gameStats.total.pl)}
                        </p>
                        <div className="stat-details"><span>In:</span> {formatCurrency(gameStats.total.totalIn)}</div>
                        <div className="stat-details"><span>Out:</span> {formatCurrency(gameStats.total.totalOut)}</div>
                    </div>
                </div>
            </div>

             <div className="admin-grid">
                <div className="grid-column">
                    <div className="admin-section live-bets">
                        <h2>Current Round Bet Summary</h2>
                        <div className="bet-summary-grid">
                            {Object.entries(currentBets).filter(([key]) => !isNaN(key)).map(([num, amount]) => (
                                <div key={num} className="bet-summary-item"><span className="bet-number">{num}</span><span className="bet-amount">{formatCurrency(amount)}</span></div>
                            ))}
                        </div>
                        <div className="bet-summary-colors">
                            <div className="bet-summary-item color"><span className="bet-number red">Red</span><span className="bet-amount">{formatCurrency(currentBets['Red'] || 0)}</span></div>
                            <div className="bet-summary-item color"><span className="bet-number green">Green</span><span className="bet-amount">{formatCurrency(currentBets['Green'] || 0)}</span></div>
                            <div className="bet-summary-item color"><span className="bet-number violet">Violet</span><span className="bet-amount">{formatCurrency(currentBets['Violet'] || 0)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="grid-column">
                    <div className="admin-section outcome-analysis">
                        <h2>Admin's Choice (Current Round)</h2>
                        <div className="analysis-table">
                            <div className="analysis-header">
                                <div>Outcome</div>
                                <div>Admin P/L</div>
                            </div>
                            {outcomeAnalysis.mostProfitable.map(outcome => (
                                <div className="analysis-row positive" key={`most-${outcome.number}`}>
                                    <div className="outcome-number">{outcome.number}</div>
                                    <div className="outcome-pl">{formatCurrency(outcome.pl)}</div>
                                </div>
                            ))}
                             {outcomeAnalysis.leastProfitable.length > 0 && <div className="analysis-divider"></div>}
                            {outcomeAnalysis.leastProfitable.map(outcome => (
                                <div className="analysis-row negative" key={`least-${outcome.number}`}>
                                    <div className="outcome-number">{outcome.number}</div>
                                    <div className="outcome-pl">{formatCurrency(outcome.pl)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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
                <div className="control-group">
                    <label>Payout Priority</label>
                    <div className="toggle-switch">
                        <button onClick={() => handleGameStatusUpdate({ payout_priority: 'admin' })} className={gameStatus.payout_priority === 'admin' ? 'active' : ''}>Admin</button>
                        <button onClick={() => handleGameStatusUpdate({ payout_priority: 'users' })} className={gameStatus.payout_priority === 'users' ? 'active' : ''}>Users</button>
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

            <div className="admin-section">
                <h2>Pending Deposits ({pendingDeposits.length})</h2>
                <div className="table-container">
                    <table className="request-table">
                        <thead><tr><th>User ID</th><th>Amount</th><th>UTR/Hash</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {pendingDeposits.length > 0 ? pendingDeposits.map(d => ( <tr key={d.id}><td>{d.user_id}</td><td>{formatCurrency(d.amount)}</td><td>{d.utr}</td><td>{new Date(d.request_date).toLocaleString()}</td><td className="actions"><button className="approve-btn" onClick={() => handleAction('approve-deposit', d.id)}>Approve</button><button className="reject-btn" onClick={() => handleAction('reject-deposit', d.id)}>Reject</button></td></tr> )) : <tr><td colSpan="5">No pending deposits.</td></tr>}
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
                            {pendingWithdrawals.length > 0 ? pendingWithdrawals.map(w => ( <tr key={w.id}><td>{w.user_id}</td><td>{formatCurrency(w.amount)}</td><td>{w.method}</td><td className="details-cell">{w.details}</td><td>{new Date(w.request_date).toLocaleString()}</td><td className="actions"><button className="approve-btn" onClick={() => handleAction('approve-withdrawal', w.id)}>Approve</button><button className="reject-btn" onClick={() => handleAction('reject-withdrawal', w.id)}>Reject</button></td></tr> )) : <tr><td colSpan="6">No pending withdrawals.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
export default AdminPanel;

