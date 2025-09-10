import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './GameView.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

// Helper map to determine colors for each number
const numberToColorMap = {
    0: ['red', 'violet'],
    1: ['green'],
    2: ['red'],
    3: ['green'],
    4: ['red'],
    5: ['green', 'violet'],
    6: ['red'],
    7: ['green'],
    8: ['red'],
    9: ['green']
};


function GameView({ token, userData, onBetPlaced }) {
    const [gameState, setGameState] = useState({ periodId: '...', countdown: '...', phase: 'loading', result: null });
    const [history, setHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [betDetails, setBetDetails] = useState({ amount: 10, type: '', value: '' });
    const [loading, setLoading] = useState(false);

    const fetchGameState = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/game-state`);
            setGameState(res.data);
        } catch (error) {
            console.error("Error fetching game state:", error);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/game/history`);
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching game history:", error);
        }
    }, []);

    useEffect(() => {
        fetchGameState();
        fetchHistory();
        const interval = setInterval(fetchGameState, 1000); // Poll for real-time updates
        return () => clearInterval(interval);
    }, [fetchGameState, fetchHistory]);
    
    // When the game result is announced, wait a moment then refresh the history
    useEffect(() => {
        if(gameState.phase === 'result') {
            const timer = setTimeout(fetchHistory, 1500); 
            return () => clearTimeout(timer);
        }
    }, [gameState.phase, fetchHistory]);

    const handleBetClick = (type, value) => {
        setBetDetails({ amount: 10, type, value });
        setShowModal(true);
    };

    const handlePlaceBet = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/place-bet`, 
                { amount: betDetails.amount, betType: betDetails.type, betValue: betDetails.value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(res.data.message);
            setShowModal(false);
            onBetPlaced(); // This triggers a refresh of user balance in App.js
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to place bet.');
        } finally {
            setLoading(false);
        }
    };
    
    const renderResultDot = (number) => {
        if (number === null || number < 0 || number > 9) return <div className="result-dot"></div>;
        const colors = numberToColorMap[number];
        if (colors.length > 1) {
            return <div className="result-dot-split"><div className={`dot-half ${colors[0]}`}></div><div className={`dot-half ${colors[1]}`}></div></div>;
        }
        return <div className={`result-dot ${colors[0]}`}></div>;
    };
    
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (gameState.phase === 'maintenance') {
        return <div className="game-maintenance">
            <h2>Game Under Maintenance</h2>
            <p>More games are on the way, so stay tuned and ready to earn much more money!</p>
        </div>;
    }

    return (
        <div className="game-view">
            <div className="game-header">
                <div>
                    <p>Available Balance</p>
                    <span>₹{(userData?.balance + userData?.withdrawable_wallet || 0).toFixed(2)}</span>
                </div>
                <div>
                    <button className="game-btn-recharge">Recharge</button>
                    <button className="game-btn-rule">Read Rule</button>
                </div>
            </div>
            
            <div className="game-tabs">
                <button className="tab active">Parity</button>
                <button className="tab">Sapre</button>
                <button className="tab">Bcone</button>
                <button className="tab">Emerd</button>
            </div>

            <div className="game-info">
                <div>
                    <p>Period</p>
                    <span>{gameState.periodId}</span>
                </div>
                 <div>
                    <p>Count Down</p>
                    <span className="countdown-text">{formatTime(gameState.countdown)}</span>
                </div>
            </div>

            <div className="betting-area">
                 <div className="bet-colors">
                    <button className="bet-btn green" onClick={() => handleBetClick('color', 'green')}>Join Green</button>
                    <button className="bet-btn violet" onClick={() => handleBetClick('color', 'violet')}>Join Violet</button>
                    <button className="bet-btn red" onClick={() => handleBetClick('color', 'red')}>Join Red</button>
                </div>
                <div className="bet-numbers">
                    {[...Array(10).keys()].map(num => (
                        <button key={num} className={`bet-btn-num ${numberToColorMap[num].join(' ')}`} onClick={() => handleBetClick('number', num.toString())}>
                           {num}
                        </button>
                    ))}
                </div>
            </div>

            <div className="history-table">
                <h4><i className="fas fa-history"></i> Parity Record</h4>
                <div className="history-header">
                    <div>Period</div>
                    <div>Price</div>
                    <div>Number</div>
                    <div>Result</div>
                </div>
                <div className="history-body">
                    {history.map(item => (
                        <div key={item.period_id} className="history-row">
                             <div>{item.period_id}</div>
                             <div>{Math.floor(35000 + Math.random() * 5000)}</div>
                             <div className={`result-num ${numberToColorMap[item.result]?.join(' ')}`}>{item.result}</div>
                             <div>{renderResultDot(item.result)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final Countdown Modal */}
            {gameState.phase === 'waiting' && (
                <div className="countdown-modal-overlay">
                    <div className="countdown-modal-content">
                        <h2>Revealing Result</h2>
                        <div className="countdown-timer">{gameState.countdown}</div>
                    </div>
                </div>
            )}
            
             {/* Result Modal */}
            {gameState.phase === 'result' && gameState.result !== null && (
                <div className="countdown-modal-overlay">
                    <div className="countdown-modal-content result-modal">
                        <h2>Result is</h2>
                        <div className={`result-number-large ${numberToColorMap[gameState.result].join(' ')}`}>{gameState.result}</div>
                        <div className="result-colors-large">
                             {numberToColorMap[gameState.result].map(c => <span key={c} className={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</span>)}
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="bet-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="bet-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h4 className={`bet-modal-title ${betDetails.type === 'color' ? betDetails.value : numberToColorMap[betDetails.value].join(' ')}`}>
                            Bet on {betDetails.type === 'color' ? betDetails.value.toUpperCase() : `Number ${betDetails.value}`}
                        </h4>
                         <div className="modal-input-group">
                            <label>Amount</label>
                            <div className="amount-controls">
                                <button onClick={() => setBetDetails(prev => ({...prev, amount: Math.max(10, prev.amount - 10)}))}>-</button>
                                <input type="number" value={betDetails.amount} onChange={e => setBetDetails(prev => ({...prev, amount: parseInt(e.target.value, 10) || 10}))} />
                                <button onClick={() => setBetDetails(prev => ({...prev, amount: prev.amount + 10}))}>+</button>
                            </div>
                        </div>
                        <div className="quick-amount-buttons">
                            <button onClick={() => setBetDetails(prev => ({...prev, amount: 100}))}>100</button>
                            <button onClick={() => setBetDetails(prev => ({...prev, amount: 1000}))}>1000</button>
                            <button onClick={() => setBetDetails(prev => ({...prev, amount: 10000}))}>10000</button>
                        </div>
                        <div className="modal-actions">
                             <button className="modal-btn-cancel" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                             <button className="modal-btn-confirm" onClick={handlePlaceBet} disabled={loading}>
                                {loading ? 'Placing...' : 'Confirm'}
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GameView;

