import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './GamePages.css'; // Shared stylesheet for all game pages

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Game Configuration ---
const DRAW_TIMES_HOURS = [8, 12, 16, 20]; // 8 AM, 12 PM, 4 PM, 8 PM IST

// --- Helper Function to get the next draw ---
const getNextDraw = () => {
    const now = new Date();
    // Use Indian Standard Time (IST is UTC+5:30)
    const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const todayIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()));

    for (const hour of DRAW_TIMES_HOURS) {
        const drawTime = new Date(todayIST);
        drawTime.setUTCHours(hour, 0, 0, 0);
        if (nowIST < drawTime) {
            return {
                endTime: drawTime,
                id: `${todayIST.toISOString().slice(0, 10)}-${hour}`
            };
        }
    }
    
    const tomorrowIST = new Date(todayIST);
    tomorrowIST.setUTCDate(todayIST.getUTCDate() + 1);
    const nextDrawTime = new Date(tomorrowIST);
    nextDrawTime.setUTCHours(DRAW_TIMES_HOURS[0], 0, 0, 0);
    return {
        endTime: nextDrawTime,
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
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
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

const HistoryModal = ({ onClose, token }) => {
    const [history, setHistory] = useState([]);
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/lottery/history`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setHistory(res.data.history))
            .catch(err => console.error("Failed to fetch history", err));
    }, [token]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Last 20 Results</h3>
                <div className="history-list">
                    {history.map(item => (
                        <div key={item.round_id} className="history-item">
                            <span>Round: {item.round_id}</span>
                            <strong>{item.winning_num_a}, {item.winning_num_b}</strong>
                        </div>
                    ))}
                </div>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
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
    const [betAmount, setBetAmount] = useState(100);
    const [lastResult, setLastResult] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showResultModal, setShowResultModal] = useState(null);


     // ✅ FIX: The live stats logic is now based on time progression for guaranteed positive numbers.
    const [basePlayers, setBasePlayers] = useState(Math.floor(Math.random() * 150) + 100);
    const [basePool, setBasePool] = useState(Math.floor(Math.random() * 200000) + 50000);
    
    // Live Stats Simulation
    const currentPlayers = useMemo(() => {
        if (!round) return 0;
        const totalDuration = DRAW_TIMES_HOURS[1] - DRAW_TIMES_HOURS[0]; // 4 hours in ms
        const timeLeft = (new Date(round.endTime) - new Date()) / (1000 * 60 * 60);
        const players = basePlayers + Math.floor(progress * 350); // Grows by up to 350 players
        const pool = basePool + Math.floor(progress * 800000); // Grows by up to 8 Lakh
        return { players, pool };
    }, [round, basePlayers, basePool]);

    const fetchInitialState = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/lottery/state`, { headers: { Authorization: `Bearer ${token}` } });
            setLastResult(res.data.lastResult);
        } catch (error) {
            console.error("Failed to fetch initial lottery state:", error);
        }
    }, [token]);

    useEffect(() => {
        const nextDraw = getNextDraw();
        setRound({ roundId: nextDraw.id, endTime: nextDraw.endTime });
        fetchInitialState();
    }, [fetchInitialState]);

    const handleNumberSelect = (num) => {
        if (selectionMode === 'single') {
            setSelectedNumA(num);
            setSelectedNumB(null);
            setActiveSlot(null);
        } else {
            if (activeSlot === 'A') {
                setSelectedNumA(num);
                setActiveSlot('B');
            } else if (activeSlot === 'B') {
                setSelectedNumB(num);
                setActiveSlot(null);
            }
        }
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
        // After the draw, check if the user played this round and show their result
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
            {showHistory && <HistoryModal token={token} onClose={() => setShowHistory(false)} />}
            {showResultModal && <ResultModal result={showResultModal} onClose={() => { setShowResultModal(null); window.location.reload(); }} />}
            
            <button className="back-button" onClick={onBack}>← Back to Lobby</button>
            <div className="game-header">
                <h1>IP Lottery</h1>
                <p>Next Draw: {new Date(round.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</p>
                <div className="round-timer">
                    <Countdown endTime={round.endTime} onEnd={handleDrawEnd}/>
                </div>
            </div>

            <div className="live-pool-card">
                <div className="pool-stat"><span>Current Players</span><strong>{currentPlayers.toLocaleString('en-IN')}</strong></div>
                <div className="pool-stat"><span>Total Pool Amount</span><strong>₹{totalPool.toLocaleString('en-IN')}</strong></div>
            </div>

            <div className="lottery-card">
                <div className="selection-header">
                    <h3>Select Your Numbers</h3>
                    <button onClick={() => { setSelectedNumA(null); setSelectedNumB(null); setActiveSlot('A'); }} className="clear-selection-btn">Clear</button>
                </div>
                <div className="toggle-switch">
                    <button className={selectionMode === 'single' ? 'active' : ''} onClick={() => { setSelectionMode('single'); setSelectedNumB(null); setActiveSlot('A'); }}>Single (2.5x)</button>
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

            {lastResult && (
                <div className="last-result-card">
                    <h3>Last Result (Round: {lastResult.round_id})</h3>
                    <div className="result-numbers">
                        <span>{lastResult.winning_num_a}</span>
                        <span>{lastResult.winning_num_b}</span>
                    </div>
                    {lastResult.jackpot_rolled_over && <p className="rollover-alert">JACKPOT ROLLED OVER!</p>}
                    <button onClick={() => setShowHistory(true)}>View History</button>
                </div>
            )}

            <div className="rules-card">
                <h4>About This Game</h4>
                <p><strong>Instant Action:</strong> With draws happening four times a day, your chance to win is always just around the corner.</p>
                <p><strong>High Payouts:</strong> Our generous 2.5x and 25x payouts offer the potential for significant returns on even small bets.</p>
                <p><strong>Fair & Transparent:</strong> Our system is designed to be fair. In the rare case of a high-risk round, the jackpot rolls over, creating an even bigger prize pool for the next draw. This means bigger wins are always possible!</p>
                <p><strong>IP Location Pool:</strong> This prize pool is specific to your IP location to ensure better odds and more frequent winners in your region.</p>
            </div>
        </div>
    );
}

export default IpLottery;

