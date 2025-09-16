import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './GamePages.css'; // Shared stylesheet

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Game Configuration ---
const DRAW_TIMES_HOURS = [8, 12, 16, 20]; // 8 AM, 12 PM, 4 PM, 8 PM IST

// --- Helper Function to get the current and next draw ---
const getDrawTimes = () => {
    const now = new Date();
    const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const todayIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()));

    for (let i = 0; i < DRAW_TIMES_HOURS.length; i++) {
        const hour = DRAW_TIMES_HOURS[i];
        const drawTime = new Date(todayIST);
        drawTime.setUTCHours(hour, 0, 0, 0);

        if (nowIST < drawTime) {
            const prevHour = i > 0 ? DRAW_TIMES_HOURS[i - 1] : DRAW_TIMES_HOURS[DRAW_TIMES_HOURS.length - 1];
            const startTime = new Date(drawTime);
            if (i === 0) {
                startTime.setUTCDate(startTime.getUTCDate() - 1);
            }
            startTime.setUTCHours(prevHour, 0, 0, 0);
            return {
                endTime: drawTime,
                startTime: startTime,
                id: `${todayIST.toISOString().slice(0, 10)}-${hour}`
            };
        }
    }
    
    const tomorrowIST = new Date(todayIST);
    tomorrowIST.setUTCDate(todayIST.getUTCDate() + 1);
    const nextDrawTime = new Date(tomorrowIST);
    nextDrawTime.setUTCHours(DRAW_TIMES_HOURS[0], 0, 0, 0);
    const lastDrawOfToday = new Date(todayIST);
    lastDrawOfToday.setUTCHours(DRAW_TIMES_HOURS[DRAW_TIMES_HOURS.length - 1], 0, 0, 0);

    return {
        endTime: nextDrawTime,
        startTime: lastDrawOfToday,
        id: `${tomorrowIST.toISOString().slice(0, 10)}-${DRAW_TIMES_HOURS[0]}`
    };
};

// --- Reusable Components ---
const Countdown = ({ endTime, onEnd }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(endTime) - +new Date();
        if (difference <= 0) {
            onEnd();
            return "DRAWING NOW";
        }
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [endTime, onEnd]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });

    return <span>{timeLeft}</span>;
};

const ResultModal = ({ result, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content result-modal">
            <h2>{result.title}</h2>
            <p>{result.message}</p>
            <button onClick={onClose}>OK</button>
        </div>
    </div>
);

// --- Mock Data for New Sections ---
const luckyWins = [
    { id: 1, name: 'Rahul S.', amount: 2500 }, { id: 2, name: 'Priya K.', amount: 250 },
    { id: 3, name: 'Amit V.', amount: 25000 }, { id: 4, name: 'Sneha G.', amount: 250 },
];
const topWins = [
    { id: 1, name: 'Vikas M.', amount: 125000 }, { id: 2, name: 'Anjali P.', amount: 95000 },
    { id: 3, name: 'Sandeep R.', amount: 78000 },
];

function IpLottery({ token, onBack }) {
    const [round, setRound] = useState(null);
    const [selectionMode, setSelectionMode] = useState('double');
    const [selectedNumA, setSelectedNumA] = useState(null);
    const [selectedNumB, setSelectedNumB] = useState(null);
    const [activeSlot, setActiveSlot] = useState('A');
    const [betAmount, setBetAmount] = useState(100);
    const [history, setHistory] = useState([]);
    const [showResultModal, setShowResultModal] = useState(null);
    
    const [basePlayers, setBasePlayers] = useState(0);
    const [basePool, setBasePool] = useState(0);
    
    const liveStats = useMemo(() => {
        if (!round) return { players: 0, pool: 0 };
        const totalDuration = round.endTime.getTime() - round.startTime.getTime();
        const elapsedTime = Date.now() - round.startTime.getTime();
        const progress = Math.max(0, Math.min(elapsedTime / totalDuration, 1));
        const players = basePlayers + Math.floor(progress * (basePlayers * 1.5));
        const pool = basePool + Math.floor(progress * (basePool * 2.5));
        return { players, pool };
    }, [round, basePlayers, basePool]);

    const fetchInitialState = useCallback(async (currentRoundId) => {
        try {
            const [historyRes, liveStatsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/lottery/history`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/lottery/live-stats/${currentRoundId}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setHistory(historyRes.data.history);
            setBasePlayers(liveStatsRes.data.base_player_count);
            setBasePool(liveStatsRes.data.total_pool_amount);
        } catch (error) {
            console.error("Failed to fetch lottery state/history:", error);
        }
    }, [token]);

    useEffect(() => {
        const nextDraw = getDrawTimes();
        setRound({ roundId: nextDraw.id, endTime: nextDraw.endTime, startTime: nextDraw.startTime });
        fetchInitialState(nextDraw.id);
    }, [fetchInitialState]);
    
    const handleNumberSelect = (num) => {
        if (selectionMode === 'single') {
            setSelectedNumA(num);
            setSelectedNumB(null);
            setActiveSlot(null);
        } else {
            if (activeSlot === 'A') { setSelectedNumA(num); setActiveSlot('B'); } 
            else if (activeSlot === 'B') { setSelectedNumB(num); setActiveSlot(null); }
        }
    };
    
    const clearSelection = () => {
        setSelectedNumA(null);
        setSelectedNumB(null);
        setActiveSlot('A');
    };

    const handleBet = async () => {
        const isSingleBetValid = selectionMode === 'single' && selectedNumA !== null;
        const isDoubleBetValid = selectionMode === 'double' && selectedNumA !== null && selectedNumB !== null;
        if (!isSingleBetValid && !isDoubleBetValid) { alert("Please make your number selection(s)."); return; }
        if (betAmount < 100) { alert("Minimum bet amount is ₹100."); return; }
        
        try {
            await axios.post(`${API_BASE_URL}/api/lottery/bet`, {
                roundId: round.roundId,
                betAmount,
                selectedNumA,
                selectedNumB: selectionMode === 'single' ? null : selectedNumB
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Your bet has been placed! The result will be announced after the draw.');
        } catch (error) {
            alert(error.response?.data?.error || "Failed to place bet.");
        }
    };
    
    const handleDrawEnd = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/lottery/my-bet-result/${round.roundId}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowResultModal(res.data);
        } catch (error) {
            console.error("Failed to fetch bet result", error);
        }
    }, [round, token]);
    
    if (!round) {
        return <div className="loading-spinner">Loading Lottery...</div>;
    }

    return (
        <div className="game-page-container lottery-theme">
            {showResultModal && <ResultModal result={showResultModal} onClose={() => { setShowResultModal(null); window.location.reload(); }} />}
            
            <button className="back-button" onClick={onBack}>← Back to Lobby</button>
            <div className="game-header">
                <h1>IP Lottery</h1>
                <p>Next Draw: {new Date(round.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</p>
                <div className="round-timer"><Countdown endTime={round.endTime} onEnd={handleDrawEnd}/></div>
            </div>

            <div className="live-pool-card">
                <div className="pool-stat"><span>Current Players</span><strong>{liveStats.players.toLocaleString('en-IN')}</strong></div>
                <div className="pool-stat"><span>Total Pool Amount</span><strong>₹{liveStats.pool.toLocaleString('en-IN')}</strong></div>
            </div>

            <div className="lottery-card">
                <div className="selection-header">
                    <h3>Select Your Numbers</h3>
                    <button onClick={clearSelection} className="clear-selection-btn">Clear</button>
                </div>
                <div className="toggle-switch">
                    <button className={selectionMode === 'single' ? 'active' : ''} onClick={() => { setSelectionMode('single'); clearSelection(); }}>Single (2.5x)</button>
                    <button className={selectionMode === 'double' ? 'active' : ''} onClick={() => setSelectionMode('double')}>Double (25x)</button>
                </div>
                <div className="selection-slots">
                    <div className={`slot ${activeSlot === 'A' ? 'active' : ''}`} onClick={() => setActiveSlot('A')}>{selectedNumA ?? '?'}</div>
                    {selectionMode === 'double' && (
                        <div className={`slot ${activeSlot === 'B' ? 'active' : ''}`} onClick={() => setActiveSlot('B')}>{selectedNumB ?? '?'}</div>
                    )}
                </div>
                <div className="number-grid">
                    {Array.from({ length: 10 }, (_, i) => i).map(num => (
                        <button key={num} className={`num-button ${(selectedNumA === num || selectedNumB === num) ? 'selected' : ''}`} onClick={() => handleNumberSelect(num)}>{num}</button>
                    ))}
                </div>
            </div>
            
            <div className="lottery-card bet-controls">
                <h3>Place Your Bet</h3>
                <div className="quick-bet-buttons">
                    {[100, 250, 500, 1000].map(amount => <button key={amount} onClick={() => setBetAmount(amount)}>₹{amount}</button>)}
                </div>
                <div className="bet-input-group">
                    <span>₹</span>
                    <input type="number" value={betAmount} onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)} min="100"/>
                </div>
                <button className="action-button" onClick={handleBet}>Confirm Bet</button>
            </div>

            <div className="history-card">
                <h4>Recent Results</h4>
                <div className="history-table-container">
                    <table>
                        <thead>
                            <tr><th>Round</th><th>Result</th><th>Winners</th><th>Top Winner</th></tr>
                        </thead>
                        <tbody>
                            {history.slice(0, 20).map(item => (
                                <tr key={item.round_id}>
                                    <td>{item.round_id.slice(-5)}</td>
                                    <td><span className="winning-num">{item.winning_num_a}</span><span className="winning-num">{item.winning_num_b}</span></td>
                                    <td>{item.winner_count}</td>
                                    <td>{item.sample_winner_name || '--'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="winners-grid">
                <div className="winners-card">
                    <h4>🍀 Lucky Wins</h4>
                    {luckyWins.map(win => <div key={win.id} className="winner-row"><span>{win.name}</span><strong>₹{win.amount.toLocaleString()}</strong></div>)}
                </div>
                <div className="winners-card">
                    <h4>🏆 Top Wins</h4>
                    {topWins.map(win => <div key={win.id} className="winner-row"><span>{win.name}</span><strong>₹{win.amount.toLocaleString()}</strong></div>)}
                </div>
            </div>

            <div className="rules-card">
                <h4>About This Game</h4>
                <ul>
                    <li><strong>Four Daily Draws:</strong> Your chance to win big is always just around the corner, with draws at 8 AM, 12 PM, 4 PM, and 8 PM!</li>
                    <li><strong>Strategic Payouts:</strong> Go for a reliable 2.5x win by matching just one number, or aim for the massive 25x jackpot by picking two!</li>
                    <li><strong>Instant Payouts:</strong> Winnings are credited directly to your withdrawable balance the moment a round ends. No waiting, no delays.</li>
                    <li><strong>Simple to Play:</strong> No complex rules. Just pick your numbers, place your bet, and watch the draw. It's that easy!</li>
                    <li><strong>Community Driven:</strong> The prize pool grows with every player who joins. More players mean bigger potential wins for everyone.</li>
                    <li><strong>Fair & Transparent:</strong> Our system is designed for excitement. In rare high-risk rounds, the jackpot rolls over, creating an even bigger prize pool for the next draw.</li>
                    <li><strong>Secure & Trusted:</strong> Our platform uses state-of-the-art security to ensure your funds and bets are always safe.</li>
                    <li><strong>Progressive Jackpots:</strong> In rollover rounds, the prize pool gets even bigger, leading to massive potential winnings!</li>
                    <li><strong>Loss Protection:</strong> To reward loyal players, we offer special cashback bonuses if you experience a long losing streak.</li>
                    <li><strong>Regional Pool:</strong> To ensure the best odds, this prize pool is specific to your IP location, creating more frequent winners in your region.</li>
                </ul>
            </div>
        </div>
    );
}

export default IpLottery;

