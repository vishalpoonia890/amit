import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GameView.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

// Helper to determine the color of a number
const getNumberColorClass = (num) => {
    if (num === null || num === undefined) return '';
    if (num === 0 || num === 5) return 'violet';
    if ([1, 3, 7, 9].includes(num)) return 'red';
    if ([2, 4, 6, 8].includes(num)) return 'green';
    return '';
};

function GameView({ token, financialSummary, onViewChange, onBetPlaced, ws, realtimeData }) {
    // --- State Management ---
    const [loading, setLoading] = useState(true);
    const [gameHistory, setGameHistory] = useState([]);
    const [showBetModal, setShowBetModal] = useState(false);
    const [betDetails, setBetDetails] = useState({ type: '', value: '' });
    const [betAmount, setBetAmount] = useState(10);
    const [userRoundResult, setUserRoundResult] = useState(null);
    const [showFinalCountdown, setShowFinalCountdown] = useState(false);
// ✅ NEW: Function to scroll smoothly to the rules section
    const scrollToRules = () => {
        document.getElementById('game-rules-section').scrollIntoView({ behavior: 'smooth' });
    };
    // This effect fetches the initial game history ONCE when the component mounts.
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/game-state`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setGameHistory(res.data.results || []);
            })
            .catch(err => console.error("Failed to fetch initial history:", err));
    }, [token]);

    // This effect listens for all real-time updates from the server via WebSockets.
  // In GameView.js, replace the second useEffect

useEffect(() => {
    if (realtimeData) {
        if (loading) {
            setLoading(false);
        }

        if (realtimeData.type === 'ROUND_RESULT') {
            if (realtimeData.results && realtimeData.results.length > 0) {
                setGameHistory(realtimeData.results);
                
                const lastPeriod = realtimeData.results[0].game_period;
                axios.get(`${API_BASE_URL}/api/my-bet-result/${lastPeriod}`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(res => {
                        setUserRoundResult({ 
                            status: res.data.status, 
                            payout: res.data.payout,
                            period: lastPeriod, 
                            number: realtimeData.results[0].result_number 
                        });
                    })
                    .catch(err => console.error("Error fetching my-bet-result:", err)); // Added error catching
            }
        }

        if (realtimeData.type === 'TIMER_UPDATE') {
            setShowFinalCountdown(realtimeData.timeLeft <= 5 && realtimeData.timeLeft > 0);
        }
    }
}, [realtimeData, token, loading]);
            


    // --- Event Handlers ---
    const handleOpenBetModal = (type, value) => {
        if (realtimeData && !realtimeData.can_bet) {
            alert("Betting has closed for the current round.");
            return;
        }
        setBetDetails({ type, value });
        setShowBetModal(true);
    };

    const handlePlaceBet = async () => {
        if (betAmount < 10) {
            alert("Minimum bet is ₹10.");
            return;
        }
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            alert("Connection error. Please refresh the page.");
            return;
        }

        const betMessage = {
            game: 'color-prediction',
            action: 'bet',
            payload: {
                amount: betAmount,
                bet_on: betDetails.value,
                token: token
            }
        };
        ws.send(JSON.stringify(betMessage));
        alert('Bet placed successfully!');
        setShowBetModal(false);
        onBetPlaced();
    };
    
    // --- Render Logic ---
    if (loading) return <div className="loading-spinner">Connecting to Game...</div>;

    const totalBalance = (financialSummary?.balance || 0) + (financialSummary?.withdrawable_wallet || 0);

    const timeLeft = realtimeData?.timeLeft ?? 0;
    const currentPeriod = realtimeData?.current_period ?? '...';
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="game-view">
            <div className="game-balance-card">
                <p>Available balance</p>
                <h3>₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="balance-actions">
                    {/* This button correctly navigates to the Deposit view */}
                    <button onClick={() => onViewChange('deposit')}>Recharge</button>
                    {/* ✅ CHANGED: This button now scrolls to the rules */}
                    <button className="rules-btn" onClick={scrollToRules}>Read Rules</button>
               
                </div>
            </div>

            <div className="game-main-content">
                <div className="game-info">
                    <div className="period-info">
                        <h4>Period</h4>
                        <p>{currentPeriod}</p>
                    </div>
                    <div className="countdown-info">
                        <h4>Count Down</h4>
                        <p>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p>
                    </div>
                </div>
                <div className="betting-options-colors">
                    <button className="bet-btn green" onClick={() => handleOpenBetModal('color', 'Green')}>Join Green</button>
                    <button className="bet-btn violet" onClick={() => handleOpenBetModal('color', 'Violet')}>Join Violet</button>
                    <button className="bet-btn red" onClick={() => handleOpenBetModal('color', 'Red')}>Join Red</button>
                </div>
                <div className="betting-options-numbers">
                    {Array.from({ length: 10 }, (_, i) => i).map(num => (
                        <button key={num} className={`bet-btn number ${getNumberColorClass(num)}`} onClick={() => handleOpenBetModal('number', String(num))}>
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            <div className="game-history">
                <h4>Parity Record</h4>
                <table className="history-table">
                    <thead>
                        <tr><th>Period</th><th>Number</th><th>Result</th></tr>
                    </thead>
                    <tbody>
                        {gameHistory.map(res => (
                            <tr key={res.game_period}>
                                <td>{res.game_period}</td>
                                <td>{res.result_number}</td>
                                <td><span className={`result-dot ${getNumberColorClass(res.result_number)}`}></span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Betting Modal */}
            {showBetModal && (
                 <div className="modal-overlay">
                    <div className="bet-modal">
                        <h3 className={`bet-title ${betDetails.type === 'color' ? betDetails.value.toLowerCase() : ''}`}>Bet on {betDetails.value}</h3>
                        <div className="modal-content">
                            <p>Amount</p>
                            <div className="amount-controls">
                                <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))}>-</button>
                                <input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} />
                                <button onClick={() => setBetAmount(betAmount + 10)}>+</button>
                            </div>
                            <div className="quick-amounts">
                                <button onClick={() => setBetAmount(100)}>100</button>
                                <button onClick={() => setBetAmount(1000)}>1k</button>
                                <button onClick={() => setBetAmount(10000)}>10k</button>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowBetModal(false)}>Cancel</button>
                            <button className="confirm-btn" onClick={handlePlaceBet}>Confirm</button>
                        </div>
                    </div>
                 </div>
            )}
            
            {/* Final Countdown Popup */}
            {showFinalCountdown && (
                <div className="modal-overlay countdown-overlay">
                    <div className="countdown-popup">
                        {timeLeft}
                    </div>
                </div>
            )}

            {/* Personalized Result Popup */}
            {userRoundResult && (
                <div className="modal-overlay">
                    <div className={`result-modal ${userRoundResult.status}`}>
                        <button className="close-modal-btn" onClick={() => setUserRoundResult(null)}>×</button>
                        
                        {userRoundResult.status === 'won' && (
                            <>
                                <div className="result-icon win">🎉</div>
                                <h3>Congratulations!</h3>
                                <p className="result-payout">You Won: ₹{userRoundResult.payout.toLocaleString('en-IN')}</p>
                            </>
                        )}
                        
                        {userRoundResult.status === 'lost' && (
                            <>
                                <div className="result-icon loss">😕</div>
                                <h3>Better Luck Next Time!</h3>
                                <p className="result-motivation">This time you can do it!</p>
                            </>
                        )}
                        
                        {userRoundResult.status === 'did_not_play' && (
                            <>
                                <h3>Round Over</h3>
                            </>
                        )}

                        <p>Result for period {userRoundResult.period}</p>
                        <div className={`result-number-display ${getNumberColorClass(userRoundResult.number)}`}>
                            {userRoundResult.number}
                        </div>
                    </div>
                </div>
            )}

                 {/* ✅ NEW: Rules Section */}
            <div id="game-rules-section" className="game-rules-section">
                <h3>Game Rules & Payouts</h3>
                <ul>
                    <li>If you bet on <strong>Green</strong> and the result is 2, 4, 6, or 8, you get <strong>2x</strong> your bet. If the result is 5, you get <strong>1.5x</strong>.</li>
                    <li>If you bet on <strong>Red</strong> and the result is 1, 3, 7, or 9, you get <strong>2x</strong> your bet. If the result is 0, you get <strong>1.5x</strong>.</li>
                    <li>If you bet on <strong>Violet</strong> and the result is 0 or 5, you get <strong>4.5x</strong> your bet.</li>
                    <li>If you bet on a specific <strong>Number</strong> from 0-9 and it matches the result, you get <strong>9x</strong> your bet.</li>
                    <li>A fee of 2% is deducted from all winnings.</li>
                </ul>
            </div>
        </div>
    );
}

export default GameView;
