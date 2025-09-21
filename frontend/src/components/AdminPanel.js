import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Helper Components ---
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') amount = 0;
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
};

const CooldownTimer = ({ targetDate }) => {
    const calculateTimeLeft = useCallback(() => {
        if (!targetDate) return 'Loading...';
        const difference = +new Date(targetDate) - +new Date();
        if (difference <= 0) return 'Ready Now';
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    return <span>{timeLeft}</span>;
};

// --- Main Admin Panel Component ---
function AdminPanel({ token }) {
    // --- State Management ---
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [platformStats, setPlatformStats] = useState({ totalDeposits: 0, totalWithdrawals: 0, platformPL: 0 });
    const [overallGameStats, setOverallGameStats] = useState({ totalBet: 0, totalPayout: 0, totalPL: 0 });
    
    const [gameStatus, setGameStatus] = useState({ is_on: false, mode: 'auto', payout_priority: 'admin' });
    const [gameStats, setGameStats] = useState({ total: {}, today: {}, currentPeriod: {} });
    const [currentBets, setCurrentBets] = useState({});
    const [outcomeAnalysis, setOutcomeAnalysis] = useState({ mostProfitable: [], leastProfitable: [] });
    const [nextResult, setNextResult] = useState('');
    
    const [lotteryAnalysis, setLotteryAnalysis] = useState([]);
    const [lotteryMode, setLotteryMode] = useState('auto');
    const [manualNumA, setManualNumA] = useState('');
    const [manualNumB, setManualNumB] = useState('');
    const [currentLotteryRoundId, setCurrentLotteryRoundId] = useState('');

    const [aviatorLiveBets, setAviatorLiveBets] = useState([]);
    const [aviatorAnalysis, setAviatorAnalysis] = useState([]);
    const [aviatorSettings, setAviatorSettings] = useState({ mode: 'auto', profitMargin: 0.10, manualCrashPoint: null });

    const [incomeStatus, setIncomeStatus] = useState({ canDistribute: false, nextDistributionTime: null });
    const [userStatusId, setUserStatusId] = useState('');
    const [newStatus, setNewStatus] = useState('active');
    const [searchUserId, setSearchUserId] = useState('');
    const [searchedUserInfo, setSearchedUserInfo] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const [bonusAmount, setBonusAmount] = useState('');
    const [bonusReason, setBonusReason] = useState('');
    const [bonusUserIds, setBonusUserIds] = useState('');
    const [promoTitle, setPromoTitle] = useState('');
    const [promoMessage, setPromoMessage] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setLoading(true);
        setError('');
        try {
            const now = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
            const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            const drawHours = [8, 12, 16, 20];
            let nextDrawHour = drawHours[drawHours.length - 1];
            for (const hour of drawHours) {
                const drawTime = new Date(today);
                drawTime.setUTCHours(hour, 0, 0, 0);
                if (now < drawTime) { nextDrawHour = hour; break; }
            }
            const roundId = `${today.toISOString().slice(0, 10)}-${nextDrawHour}`;
            setCurrentLotteryRoundId(roundId);

            const [depositsRes, withdrawalsRes, gameStatusRes, statsRes, betsRes, analysisRes, incomeRes, platformStatsRes, lotteryAnalysisRes, overallGameStatsRes, aviatorBetsRes, aviatorAnalysisRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/recharges/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/withdrawals/pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/game-status`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/game-statistics`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/current-bets`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/game-outcome-analysis`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/income-status`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/platform-stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/lottery-analysis?roundId=${roundId}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/overall-game-stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/aviator/live-bets`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/aviator-analysis`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPendingDeposits(depositsRes.data.recharges || []);
            setPendingWithdrawals(withdrawalsRes.data.withdrawals || []);
            setGameStatus(gameStatusRes.data.status || { is_on: false, mode: 'auto', payout_priority: 'admin' });
            setGameStats(statsRes.data || { total: {}, today: {}, currentPeriod: {} });
            setCurrentBets(betsRes.data.summary || {});
            setOutcomeAnalysis(analysisRes.data || { mostProfitable: [], leastProfitable: [] });
            setIncomeStatus(incomeRes.data);
            setPlatformStats(platformStatsRes.data);
            setLotteryAnalysis(lotteryAnalysisRes.data.outcomes || []);
            setLotteryMode(lotteryAnalysisRes.data.mode || 'auto');
            setOverallGameStats(overallGameStatsRes.data);
            setAviatorLiveBets(aviatorBetsRes.data.bets || []);
            setAviatorAnalysis(aviatorAnalysisRes.data.analysis || []);
        } catch (err) {
            if (isInitialLoad) setError('Failed to fetch admin data. Auto-refresh paused.');
            console.error(err);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData(true);
        const interval = setInterval(() => fetchData(false), 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    
    // --- Action Handlers ---
    const handleAction = async (action, id) => {
        const urlMap = {
            'approve-deposit': `/api/admin/recharge/${id}/approve`, 'reject-deposit': `/api/admin/recharge/${id}/reject`,
            'approve-withdrawal': `/api/admin/withdrawal/${id}/approve`, 'reject-withdrawal': `/api/admin/withdrawal/${id}/reject`,
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

    const handleDistributeIncome = async () => {
        if (!window.confirm("Are you sure you want to distribute daily income to ALL active users? This will trigger notifications.")) return;
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/distribute-income`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to distribute income.');
        }
    };

    const handleUserSearch = async (e) => {
        e.preventDefault();
        if (!searchUserId) return;
        setSearchLoading(true);
        setSearchError('');
        setSearchedUserInfo(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/user-income-status/${searchUserId}`, { headers: { Authorization: `Bearer ${token}` } });
            setSearchedUserInfo({ id: searchUserId, ...res.data });
        } catch (err) {
            setSearchError(err.response?.data?.error || 'Failed to find user.');
        } finally {
            setSearchLoading(false);
        }
    };
    
    const handleManageUserIncome = async (canReceive) => {
        if (!searchedUserInfo) return;
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/manage-user-income`, 
                { userId: searchedUserInfo.id, canReceiveIncome: canReceive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message);
            setSearchedUserInfo(prev => ({ ...prev, can_receive_income: canReceive }));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update status.');
        }
    };
    
    const handleSetUserStatus = async (e) => {
        e.preventDefault();
        if (!userStatusId) {
            alert('Please enter a User ID.');
            return;
        }
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/set-user-status`, 
                { userId: userStatusId, status: newStatus }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message);
            setUserStatusId('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to set user status.');
        }
    };

    const handleGrantBonus = async (e) => {
        e.preventDefault();
        const userIdsArray = bonusUserIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/grant-bonus`, 
                { amount: parseFloat(bonusAmount), reason: bonusReason, user_ids: userIdsArray.length > 0 ? userIdsArray : null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message);
            setBonusAmount(''); setBonusReason(''); setBonusUserIds('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to grant bonus.');
        }
    };

    const handleCreatePromotion = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/create-promotion`, 
                { title: promoTitle, message: promoMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message);
            setPromoTitle(''); setPromoMessage('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create promotion.');
        }
    };
    
    const handleLotteryModeChange = async (mode) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/lottery-mode`, { mode }, { headers: { Authorization: `Bearer ${token}` } });
            setLotteryMode(mode);
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to change mode.');
        }
    };
    
    const handleSetLotteryResult = async (e) => {
        e.preventDefault();
        const numA = parseInt(manualNumA, 10);
        const numB = parseInt(manualNumB, 10);
        if (isNaN(numA) || isNaN(numB) || numA < 0 || numA > 9 || numB < 0 || numB > 9) {
            alert('Please enter valid numbers between 0 and 9.');
            return;
        }
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/lottery-set-result`, {
                roundId: currentLotteryRoundId,
                winning_num_a: numA,
                winning_num_b: numB
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to set result.');
        }
    };
    
const handleAviatorSettingsUpdate = async (update) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/aviator-settings`, update, { headers: { Authorization: `Bearer ${token}` } });
            setAviatorSettings(res.data.settings);
            alert(res.data.message);
        } catch (err) {
            alert('Failed to update Aviator settings.');
        }
    };

    
    if (loading) return <div className="loading-spinner">Loading Admin Panel...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-panel">
            <h1>Admin Control Panel</h1>
            
            <div className="admin-section stats-section">
                <h2>Platform Financials</h2>
                <div className="stats-grid">
                    <div className="stat-card"><h4>Total Deposits</h4><p className="stat-value positive">{formatCurrency(platformStats.totalDeposits)}</p></div>
                    <div className="stat-card"><h4>Total Withdrawals</h4><p className="stat-value negative">{formatCurrency(platformStats.totalWithdrawals)}</p></div>
                    <div className="stat-card"><h4>Platform P/L</h4><p className={`stat-value ${platformStats.platformPL >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(platformStats.platformPL)}</p></div>
                </div>
            </div>

            <div className="admin-section stats-section">
                <h2>Overall Game Financials</h2>
                <div className="stats-grid">
                    <div className="stat-card"><h4>Total Bet Amount</h4><p className="stat-value">{formatCurrency(overallGameStats.totalBet)}</p></div>
                    <div className="stat-card"><h4>Total Payouts</h4><p className="stat-value">{formatCurrency(overallGameStats.totalPayout)}</p></div>
                    <div className="stat-card"><h4>Overall Game P/L</h4><p className={`stat-value ${overallGameStats.totalPL >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(overallGameStats.totalPL)}</p></div>
                </div>
            </div>
            
            <div className="admin-section stats-section">
                <h2>Color Prediction P/L Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-card"><h4>Current Period</h4><p className={`stat-value ${gameStats.currentPeriod.pl >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(gameStats.currentPeriod.pl)}</p></div>
                    <div className="stat-card"><h4>Today</h4><p className={`stat-value ${gameStats.today.pl >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(gameStats.today.pl)}</p></div>
                    <div className="stat-card"><h4>Overall</h4><p className={`stat-value ${gameStats.total.pl >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(gameStats.total.pl)}</p></div>
                </div>
            </div>

            <div className="admin-grid">
                <div className="grid-column">
                    <div className="admin-section">
                        <h2>Color Prediction Management</h2>
                        <div className="control-group"><label>Game Status</label><div className="toggle-switch"><button onClick={() => handleGameStatusUpdate({ is_on: true })} className={gameStatus.is_on ? 'active' : ''}>ON</button><button onClick={() => handleGameStatusUpdate({ is_on: false })} className={!gameStatus.is_on ? 'active' : ''}>OFF</button></div></div>
                        <div className="control-group"><label>Game Mode</label><div className="toggle-switch"><button onClick={() => handleGameStatusUpdate({ mode: 'auto' })} className={gameStatus.mode === 'auto' ? 'active' : ''}>Auto</button><button onClick={() => handleGameStatusUpdate({ mode: 'admin' })} className={gameStatus.mode === 'admin' ? 'active' : ''}>Admin</button></div></div>
                        <div className="control-group"><label>Payout Priority</label><div className="toggle-switch"><button onClick={() => handleGameStatusUpdate({ payout_priority: 'admin' })} className={gameStatus.payout_priority === 'admin' ? 'active' : ''}>Admin</button><button onClick={() => handleGameStatusUpdate({ payout_priority: 'users' })} className={gameStatus.payout_priority === 'users' ? 'active' : ''}>Users</button></div></div>
                        {gameStatus.mode === 'admin' && gameStatus.is_on && (<div className="control-group manual-control"><label>Set Next Winning Number (0-9)</label><div className="input-group"><input type="number" value={nextResult} onChange={(e) => setNextResult(e.target.value)} min="0" max="9" placeholder="e.g., 5" /><button onClick={handleSetNextResult}>Set Result</button></div></div>)}
                    </div>
                    <div className="admin-section live-bets">
                        <h2>Color Prediction: Live Bets</h2>
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
                    <div className="admin-section">
                        <h2>Lottery Management (Round: {currentLotteryRoundId})</h2>
                        <div className="control-group">
                            <label>Lottery Mode</label>
                            <div className="toggle-switch">
                                <button onClick={() => handleLotteryModeChange('auto')} className={lotteryMode === 'auto' ? 'active' : ''}>Auto (Profit-First)</button>
                                <button onClick={() => handleLotteryModeChange('admin')} className={lotteryMode === 'admin' ? 'active' : ''}>Admin Choice</button>
                            </div>
                        </div>
                        {lotteryMode === 'admin' && (
                            <form className="action-group" onSubmit={handleSetLotteryResult}>
                                <h4>Set Manual Result for Next Draw</h4>
                                <div className="input-group">
                                    <input type="number" value={manualNumA} onChange={e => setManualNumA(e.target.value)} min="0" max="9" placeholder="Num A" required />
                                    <input type="number" value={manualNumB} onChange={e => setManualNumB(e.target.value)} min="0" max="9" placeholder="Num B" required />
                                    <button type="submit" className="action-btn">Set Result</button>
                                </div>
                            </form>
                        )}
                    </div>
                     <div className="admin-section outcome-analysis">
                        <h2>Color Prediction: Admin's Choice</h2>
                        <div className="analysis-table-container">
                            <table className="analysis-table">
                                <thead><tr><th>Outcome</th><th>Admin P/L</th></tr></thead>
                                <tbody>
                                    {outcomeAnalysis.mostProfitable.map(outcome => (
                                        <tr className="positive" key={`most-${outcome.number}`}><td>{outcome.number}</td><td>{formatCurrency(outcome.pl)}</td></tr>
                                    ))}
                                    {outcomeAnalysis.leastProfitable.length > 0 && <tr><td colSpan="2"><div className="analysis-divider"></div></td></tr>}
                                    {outcomeAnalysis.leastProfitable.map(outcome => (
                                        <tr className="negative" key={`least-${outcome.number}`}><td>{outcome.number}</td><td>{formatCurrency(outcome.pl)}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-section">
                <h2>Aviator Management</h2>
                <div className="control-group">
                    <label>Game Mode</label>
                    <div className="toggle-switch">
                        <button onClick={() => handleAviatorSettingsUpdate({ mode: 'auto' })} className={aviatorSettings.mode === 'auto' ? 'active' : ''}>Auto (Profit-Based)</button>
                        <button onClick={() => handleAviatorSettingsUpdate({ mode: 'admin' })} className={aviatorSettings.mode === 'admin' ? 'active' : ''}>Admin Choice</button>
                    </div>
                </div>
                 <div className="action-group">
                    <h4>Set Profit Margin (Auto Mode)</h4>
                    <input type="number" step="0.01" value={aviatorSettings.profitMargin} onChange={e => handleAviatorSettingsUpdate({ profitMargin: parseFloat(e.target.value) })} />
                </div>
                {aviatorSettings.mode === 'admin' && (
                    <div className="action-group">
                        <h4>Set Manual Crash Point</h4>
                        <input type="number" step="0.01" placeholder="e.g., 2.50" onChange={e => handleAviatorSettingsUpdate({ manualCrashPoint: parseFloat(e.target.value) })} />
                    </div>
                )}
                 <h4>Live Bets in Current Round ({aviatorLiveBets.length})</h4>
                <div className="analysis-table-container">
                    <table className="analysis-table">
                        <thead><tr><th>Player</th><th>Bet Amount</th></tr></thead>
                        <tbody>
                            {aviatorLiveBets.map(bet => (
                                <tr key={bet.id}>
                                    <td>{bet.users.name} (ID: {bet.user_id})</td>
                                    <td>{formatCurrency(bet.bet_amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <h4>Profitability Analysis (Current Round)</h4>
                <div className="analysis-table-container">
                    <table className="analysis-table">
                        <thead><tr><th>Target Profit</th><th>Required Crash At</th><th>Total Bet In</th><th>Estimated Payout</th><th>Net P/L</th></tr></thead>
                        <tbody>
                            {aviatorAnalysis.map(row => (
                                <tr key={row.profitMargin} className={row.netProfit >= 0 ? 'positive' : 'negative'}>
                                    <td>{row.profitMargin}</td>
                                    <td>{row.requiredMultiplier}</td>
                                    <td>{formatCurrency(row.totalBet)}</td>
                                    <td>{formatCurrency(row.estimatedPayout)}</td>
                                    <td>{formatCurrency(row.netProfit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="admin-section">
                <h2>Live Round Analysis (Lottery)</h2>
                <div className="analysis-table-container">
                    <table className="analysis-table">
                         <thead><tr><th>Winning Pair</th><th>Total Bets On Pair</th><th>Total Payout</th><th>Admin P/L</th></tr></thead>
                        <tbody>
                            {lotteryAnalysis.map(outcome => (
                                <tr key={`${outcome.a}-${outcome.b}`} className={outcome.netResult >= 0 ? 'positive' : 'negative'}>
                                    <td>{`{${outcome.a}, ${outcome.b}}`}</td>
                                    <td>{formatCurrency(outcome.totalBetOnPair)}</td>
                                    <td>{formatCurrency(outcome.payout)}</td>
                                    <td>{formatCurrency(outcome.netResult)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="admin-section server-actions">
                <h2>User & Platform Management</h2>
                <div className="action-group">
                    <h4>Global Daily Income Distribution</h4>
                    <p>Calculate and distribute daily income to all users with active investments. This will enable their "Claim" button and send a notification.</p>
                    <button onClick={handleDistributeIncome} className="action-btn" disabled={!incomeStatus.canDistribute}>
                        Distribute Income Now
                    </button>
                    {!incomeStatus.canDistribute && (
                        <div className="cooldown-timer">
                            Next distribution available in: <CooldownTimer targetDate={incomeStatus.nextDistributionTime} />
                        </div>
                    )}
                </div>
                    </div>

            <div className="admin-section server-actions">
                <h2>User & Platform Management</h2>
                <div className="action-group">
                    <h4>Global Daily Income Distribution</h4>
                    <p>Calculate and distribute daily income to all users with active investments. This will enable their "Claim" button and send a notification.</p>
                    <button onClick={handleDistributeIncome} className="action-btn" disabled={!incomeStatus.canDistribute}>
                        Distribute Income Now
                    </button>
                    {!incomeStatus.canDistribute && (
                        <div className="cooldown-timer">
                            Next distribution available in: <CooldownTimer targetDate={incomeStatus.nextDistributionTime} />
                        </div>
                    )}
                </div>
                <div className="action-group">
                    <h4>Set User Account Status</h4>
                    <p>Change a user's status to Active, Non-Active, or Flagged.</p>
                    <form onSubmit={handleSetUserStatus} className="input-group">
                        <input type="number" value={userStatusId} onChange={e => setUserStatusId(e.target.value)} placeholder="User ID" required />
                        <select value={newStatus} onChange={e => setNewStatus(e.target.value)}><option value="active">Active</option><option value="non-active">Non-Active</option><option value="flagged">Flagged</option></select>
                        <button type="submit" className="action-btn">Set Status</button>
                    </form>
                </div>
                <div className="action-group">
                    <h4>Manage User Income</h4>
                    <p>Search for a user to allow or block their ability to receive daily income.</p>
                    <form onSubmit={handleUserSearch} className="input-group">
                        <input type="number" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} placeholder="Enter User ID" required />
                        <button type="submit" disabled={searchLoading}>{searchLoading ? 'Searching...' : 'Search'}</button>
                    </form>
                    {searchError && <p className="error-message small">{searchError}</p>}
                </div>
                {searchedUserInfo && (
                    <div className="action-group user-status-result">
                        <h4>User: {searchedUserInfo.name} (ID: {searchedUserInfo.id})</h4>
                        <div className="status-control">
                            <p>Current Income Status: 
                                <span className={searchedUserInfo.can_receive_income ? 'status-allowed' : 'status-blocked'}>
                                    {searchedUserInfo.can_receive_income ? 'Allowed' : 'Blocked'}
                                </span>
                            </p>
                            <div className="button-group">
                                <button onClick={() => handleManageUserIncome(true)} className="approve-btn" disabled={searchedUserInfo.can_receive_income}>Allow</button>
                                <button onClick={() => handleManageUserIncome(false)} className="reject-btn" disabled={!searchedUserInfo.can_receive_income}>Block</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="action-group">
                    <h4>Grant Bonus</h4>
                    <form onSubmit={handleGrantBonus}>
                        <input type="number" placeholder="Bonus Amount (₹)" value={bonusAmount} onChange={e => setBonusAmount(e.target.value)} required />
                        <input type="text" placeholder="Reason for Bonus" value={bonusReason} onChange={e => setBonusReason(e.target.value)} required />
                        <input type="text" placeholder="User IDs (comma-separated, or leave blank for all)" value={bonusUserIds} onChange={e => setBonusUserIds(e.target.value)} />
                        <button type="submit" className="action-btn">Grant Bonus</button>
                    </form>
                </div>
                <div className="action-group">
                    <h4>Create Promotion</h4>
                    <form onSubmit={handleCreatePromotion}>
                        <input type="text" placeholder="Promotion Title" value={promoTitle} onChange={e => setPromoTitle(e.target.value)} required />
                        <textarea placeholder="Promotion Message" value={promoMessage} onChange={e => setPromoMessage(e.target.value)} required />
                        <button type="submit" className="action-btn">Create Promotion</button>
                    </form>
                </div>
            </div>
            
            <div className="admin-section">
                <h2>Pending Deposits ({pendingDeposits.length})</h2>
                <div className="table-container">
                    <table className="request-table">
                        {/* ✅ UPDATED: Added "Screenshot" to the table header */}
                        <thead><tr><th>User ID</th><th>Amount</th><th>UTR/Hash</th><th>Screenshot</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {pendingDeposits.map(d => (
                                <tr key={d.id}>
                                    <td>{d.user_id}</td>
                                    <td>{formatCurrency(d.amount)}</td>
                                    <td>{d.utr}</td>
                                    {/* ✅ UPDATED: Added a clickable link to view the screenshot */}
                                    <td>
                                        <a href={d.screenshot_url} target="_blank" rel="noopener noreferrer" className="screenshot-link">
                                            View
                                        </a>
                                    </td>
                                    <td>{new Date(d.request_date).toLocaleString()}</td>
                                    <td className="actions">
                                        <button className="approve-btn" onClick={() => handleAction('approve-deposit', d.id)}>Approve</button>
                                        <button className="reject-btn" onClick={() => handleAction('reject-deposit', d.id)}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             <div className="admin-section">
                <h2>Pending Withdrawals ({pendingWithdrawals.length})</h2>
                <div className="table-container">
                    <table className="request-table">
                          <thead><tr><th>User ID</th><th>Name</th><th>Account Status</th><th>Amount</th><th>Method</th><th>Details</th><th>Date</th><th>Actions</th></tr></thead>
                          <tbody>
                            {pendingWithdrawals.map(w => (
                                <tr key={w.id}>
                                    <td>{w.user_id}</td>
                                    <td>{w.users ? w.users.name : 'N/A'}</td>
                                    <td><span className={`status-badge status-${w.users ? w.users.status : 'active'}`}>{w.users ? w.users.status : 'Active'}</span></td>
                                    <td>{formatCurrency(w.amount)}</td>
                                    <td>{w.method}</td>
                                    <td className="details-cell">{w.details}</td>
                                    <td>{new Date(w.request_date).toLocaleString()}</td>
                                    <td className="actions"><button className="approve-btn" onClick={() => handleAction('approve-withdrawal', w.id)}>Approve</button><button className="reject-btn" onClick={() => handleAction('reject-withdrawal', w.id)}>Reject</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;

