import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './GamePages.css'; // Shared stylesheet

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Helper Function to get the current hourly draw ---
const getDrawTimes = () => {
    const now = new Date();
    // The start time is the beginning of the current hour.
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    // The end time is exactly one hour after the start time.
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const year = startTime.getFullYear();
    const month = String(startTime.getMonth() + 1).padStart(2, '0');
    const day = String(startTime.getDate()).padStart(2, '0');
    const hour = String(startTime.getHours()).padStart(2, '0');
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
            return "DRAWING NOW";
        }
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [endTime, onEnd]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
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


function IpLottery({ token, onBack }) {
    const [round, setRound] = useState(null);
    const [selectionMode, setSelectionMode] = useState('double');
    const [selectedNumA, setSelectedNumA] = useState(null);
    const [selectedNumB, setSelectedNumB] = useState(null);
    const [activeSlot, setActiveSlot] = useState('A');
    const [betAmount, setBetAmount] = useState(10);
    const [history, setHistory] = useState([]);
    const [liveStats, setLiveStats] = useState({ players: 0, pool: 0 });
    const [showResultModal, setShowResultModal] = useState(null);
    
    const fetchInitialState = useCallback(async (currentRoundId) => {
        try {
            const [historyRes, liveStatsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/lottery/history`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/lottery/live-stats/${currentRoundId}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setHistory(historyRes.data.history || []);
            setLiveStats({
                players: liveStatsRes.data.base_player_count || 100,
                pool: liveStatsRes.data.total_pool_amount || 50000
            });
        } catch (error) {
            console.error("Failed to fetch lottery state/history:", error);
            // Set default stats on error to prevent crash
            setLiveStats({ players: 100, pool: 50000 });
        }
    }, [token]);

    useEffect(() => {
        const nextDraw = getDrawTimes();
        setRound({ roundId: nextDraw.id, endTime: nextDraw.endTime, startTime: nextDraw.startTime });
        fetchInitialState(nextDraw.id);
        
        // Set up an interval to refresh live stats periodically
        const interval = setInterval(() => fetchInitialState(nextDraw.id), 20000); // Refresh every 20 seconds
        return () => clearInterval(interval);

    }, [fetchInitialState]);
    
    const handleNumberSelect = (num) => {
        if (selectionMode === 'double') {
            if (activeSlot === 'A') { 
                setSelectedNumA(num); 
                setActiveSlot('B'); 
            } else if (activeSlot === 'B') { 
                setSelectedNumB(num); 
                setActiveSlot(null); 
            }
        }
    };
    
    const clearSelection = () => {
        setSelectedNumA(null);
        setSelectedNumB(null);
        setActiveSlot('A');
    };

    const handleBet = async () => {
        const isDoubleBetValid = selectionMode === 'double' && selectedNumA !== null && selectedNumB !== null;
        if (!isDoubleBetValid) { 
            alert("Please select your two numbers."); 
            return; 
        }
        if (betAmount < 10) { 
            alert("Minimum bet amount is ₹10."); 
            return; 
        }
        
        try {
            await axios.post(`${API_BASE_URL}/api/lottery/bet`, {
                roundId: round.roundId,
                betAmount,
                selectedNumA,
                selectedNumB
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Your bet has been placed! The result will be announced after the draw.');
            fetchInitialState(round.roundId); // Refresh stats after betting
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
                <p>Next Draw In:</p>
                <div className="round-timer"><Countdown endTime={round.endTime} onEnd={handleDrawEnd}/></div>
            </div>

            <div className="live-pool-card">
                <div className="pool-stat"><span>Current Players</span><strong>{liveStats.players.toLocaleString('en-IN')}</strong></div>
                <div className="pool-stat"><span>Total Pool Amount</span><strong>₹{liveStats.pool.toLocaleString('en-IN')}</strong></div>
            </div>

            <div className="lottery-card">
                <div className="selection-header">
                    <h3>Select Two Numbers (25x Jackpot)</h3>
                    <button onClick={clearSelection} className="clear-selection-btn">Clear</button>
                </div>
                <div className="selection-slots">
                    <div className={`slot ${activeSlot === 'A' ? 'active' : ''}`} onClick={() => setActiveSlot('A')}>{selectedNumA ?? '?'}</div>
                    <div className={`slot ${activeSlot === 'B' ? 'active' : ''}`} onClick={() => setActiveSlot('B')}>{selectedNumB ?? '?'}</div>
                </div>
                <div className="number-grid">
                    {Array.from({ length: 10 }, (_, i) => i).map(num => (
                        <button key={num} className={`num-button ${(selectedNumA === num || selectedNumB === num) ? 'selected' : ''}`} onClick={() => handleNumberSelect(num)}>{num}</button>
                    ))}
                </div>
            </div>
            
            <div className="lottery-card bet-controls">
                <h3>Place Your Bet (Min: ₹10)</h3>
                <div className="quick-bet-buttons">
                    {[10, 50, 100, 500].map(amount => <button key={amount} onClick={() => setBetAmount(amount)}>₹{amount}</button>)}
                </div>
                <div className="bet-input-group">
                    <span>₹</span>
                    <input type="number" value={betAmount} onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)} min="10"/>
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
                                    <td>...{item.round_id.slice(-5)}</td>
                                    <td><span className="winning-num">{item.winning_num_a}</span><span className="winning-num">{item.winning_num_b}</span></td>
                                    <td>{item.winner_count}</td>
                                    <td>{item.sample_winner_name || '--'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="rules-card">
                <h4>About The Hourly Lottery</h4>
                <ul>
                    <li><strong>Hourly Draws:</strong> A new chance to win every single hour, 24/7!</li>
                    <li><strong>Aim for the Jackpot:</strong> Match two numbers to win the massive 25x prize.</li>
                    <li><strong>Instant Payouts:</strong> Winnings are credited directly to your withdrawable balance the moment a round ends.</li>
                    <li><strong>Fair & Transparent:</strong> Our system is designed for excitement and fairness, with results determined by betting patterns.</li>
                </ul>
            </div>
        </div>
    );
}

export default IpLottery;

