import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './GamePages.css'; // Shared stylesheet

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Helper Function to get the current and next hourly draw ---
const getHourlyDrawTimes = () => {
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const roundId = `${year}${month}${day}-${hour}`;

    return {
        endTime: endTime,
        startTime: startTime,
        id: roundId
    };
};


// --- Reusable Components ---
const Countdown = ({ endTime, onEnd }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(endTime) - +new Date();
        if (difference <= 0) {
            onEnd();
            // Use a brief timeout to allow the onEnd function to trigger state updates
            setTimeout(() => window.location.reload(), 3000);
            return "DRAWING NOW";
        }
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [endTime, onEnd]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);


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
    { id: 1, name: 'Rahul S.', amount: 250000 }, { id: 2, name: 'Priya K.', amount: 65000 },
    { id: 3, name: 'Amit V.', amount: 75000 }, { id: 4, name: 'Kamal', amount: 50000},
];
const topWins = [
    { id: 1, name: 'Vikas M.', amount: 1250000 }, { id: 2, name: 'Anjali P.', amount: 950000 },
    { id: 3, name: 'Sandeep R.', amount: 780000 },
];

function IpLottery({ token, onBack }) {
    const [round, setRound] = useState(null);
    const [selectionMode, setSelectionMode] = useState('double');
    const [selectedNumA, setSelectedNumA] = useState(null);
    const [selectedNumB, setSelectedNumB] = useState(null);
    const [activeSlot, setActiveSlot] = useState('A');
    const [betAmount, setBetAmount] = useState(10);
    const [history, setHistory] = useState([]);
    const [showResultModal, setShowResultModal] = useState(null);
    
    const [basePlayers, setBasePlayers] = useState(0);
    const [actualPoolAmount, setActualPoolAmount] = useState(0); // This holds the real bet amount from the server
    const [isBettingClosed, setIsBettingClosed] = useState(false); // New state for betting window
    const [error, setError] = useState('');
    
    const liveStats = useMemo(() => {
        if (!round) return { players: 0, pool: 0 };
        const totalDuration = round.endTime.getTime() - round.startTime.getTime();
        const elapsedTime = Date.now() - round.startTime.getTime();
        const progress = Math.max(0, Math.min(elapsedTime / totalDuration, 1));
        
        const players = basePlayers + Math.floor(progress * (basePlayers * 0.5));
        
        // ✅ NEW POOL LOGIC: A visual pool that grows to 10L, plus the actual bets from users.
        const visualBasePool = 1000000 * progress;
        const pool = visualBasePool + actualPoolAmount;

        return { players, pool };
    }, [round, basePlayers, actualPoolAmount]);

    const fetchInitialState = useCallback(async (currentRoundId) => {
        setError('');
        try {
            const [historyRes, liveStatsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/lottery/history`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/lottery/live-stats/${currentRoundId}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setHistory(historyRes.data.history);
            setBasePlayers(liveStatsRes.data.base_player_count);
            setActualPoolAmount(liveStatsRes.data.total_pool_amount); // Store the real bet amount
        } catch (error) {
            console.error("Failed to fetch lottery state/history:", error);
            setError("Could not connect to the game server. Please check your connection and try again.");
        }
    }, [token]);

    useEffect(() => {
        const nextDraw = getHourlyDrawTimes();
        setRound({ roundId: nextDraw.id, endTime: nextDraw.endTime, startTime: nextDraw.startTime });
        
        const fetchAndSetInterval = async () => {
            await fetchInitialState(nextDraw.id);
        };

        fetchAndSetInterval();
        const interval = setInterval(fetchAndSetInterval, 30000);

        return () => clearInterval(interval);
    }, [fetchInitialState]);

    // ✅ NEW EFFECT: Manages the betting window timer
    useEffect(() => {
        if (!round) return;

        const checkBettingWindow = () => {
            const timeLeft = round.endTime.getTime() - Date.now();
            // Check if less than 5 minutes (300,000 milliseconds) remain
            if (timeLeft < 5 * 60 * 1000) {
                setIsBettingClosed(true);
            } else {
                setIsBettingClosed(false);
            }
        };

        checkBettingWindow(); // Check immediately
        const interval = setInterval(checkBettingWindow, 1000); // Re-check every second

        return () => clearInterval(interval);
    }, [round]);
    
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
        // ✅ NEW CHECK: Prevents betting in the last 5 minutes
        if (isBettingClosed) {
            alert("The betting window is now closed for this round. Good luck in the next draw!");
            return;
        }

        const isSingleBetValid = selectionMode === 'single' && selectedNumA !== null;
        const isDoubleBetValid = selectionMode === 'double' && selectedNumA !== null && selectedNumB !== null;
        if (!isSingleBetValid && !isDoubleBetValid) { alert("Please make your number selection(s)."); return; }
        if (betAmount < 10) { alert("Minimum bet amount is ₹10."); return; }
        
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
        if (!round) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/lottery/my-bet-result/${round.roundId}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowResultModal(res.data);
        } catch (error) {
            console.error("Failed to fetch bet result", error);
        }
    }, [round, token]);
    
    if (error) {
        return <div className="game-error-message">{error}</div>;
    }
    
    if (!round) {
        return <div className="loading-spinner">Loading Lottery...</div>;
    }

    return (
        <div className="game-page-container lottery-theme">
            {showResultModal && <ResultModal result={showResultModal} onClose={() => { setShowResultModal(null); window.location.reload(); }} />}
            
            <button className="back-button" onClick={onBack}>← Back to Lobby</button>
            <div className="game-header">
                <h1>IP Lottery</h1>
                <p>Next Draw In:</p>
                <div className="round-timer"><Countdown endTime={round.endTime} onEnd={handleDrawEnd}/></div>
            </div>

            <div className="live-pool-card">
                <div className="pool-stat"><span>Current Players</span><strong>{liveStats.players.toLocaleString('en-IN')}</strong></div>
                <div className="pool-stat"><span>Total Pool Amount</span><strong>₹{liveStats.pool.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></div>
            </div>

            <div className="lottery-card">
                <div className="selection-header">
                    <h3>Select Your Numbers</h3>
                    <button onClick={clearSelection} className="clear-selection-btn">Clear</button>
                </div>
                <div className="toggle-switch">
                    <button className={selectionMode === 'single' ? 'active' : ''} onClick={() => { setSelectionMode('single'); clearSelection(); }}>Single (2.5x)</button>
                    <button className={selectionMode === 'double' ? 'active' : ''} onClick={() => { setSelectionMode('double'); clearSelection();}}>Double (25x)</button>
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
                {/* ✅ NEW: Message for when betting is closed */}
                {isBettingClosed && (
                    <div className="betting-closed-message">
                        Betting is closed for the final 5 minutes.
                    </div>
                )}
                <div className="quick-bet-buttons">
                    {[10, 50, 100, 500].map(amount => <button key={amount} onClick={() => setBetAmount(amount)} disabled={isBettingClosed}>₹{amount}</button>)}
                </div>
                <div className="bet-input-group">
                    <span>₹</span>
                    <input type="number" value={betAmount} onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)} min="10" disabled={isBettingClosed}/>
                </div>
                <button className="action-button" onClick={handleBet} disabled={isBettingClosed}>
                    {isBettingClosed ? 'Betting Closed' : 'Confirm Bet'}
                </button>
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
                    <li><strong>Hourly Draws:</strong> Your chance to win big is always just around the corner, with draws happening every hour!</li>
                    <li><strong>Strategic Payouts:</strong> Go for a reliable 2.5x win by matching just one number, or aim for the massive 25x jackpot by picking two!</li>
                    <li><strong>Instant Payouts:</strong> Winnings are credited directly to your withdrawable balance the moment a round ends. No waiting, no delays.</li>
                </ul>
            </div>
        </div>
    );
}

export default IpLottery;

