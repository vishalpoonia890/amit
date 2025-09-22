// src/components/GameView.js

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

    useEffect(() => {
        // Step 1: Fetch the initial game history only ONCE when the component mounts.
        axios.get(`${API_BASE_URL}/api/game-state`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setGameHistory(res.data.results || []);
            })
            .catch(err => console.error("Failed to fetch initial history:", err));

    }, [token]);

    useEffect(() => {
        // Step 2: Listen for all real-time updates from the server.
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
                            // ✅ FIX: We removed the `if` condition here.
                            // Now, we ALWAYS set the result, whether the user won, lost, or didn't play.
                            setUserRoundResult({ 
                                status: res.data.status, // This will be 'won', 'lost', or 'did_not_play'
                                payout: res.data.payout, // This will exist if they won
                                period: lastPeriod, 
                                number: realtimeData.results[0].result_number 
                            });
                        });
                }
            }

            if (realtimeData.type === 'TIMER_UPDATE') {
                setShowFinalCountdown(realtimeData.timeLeft <= 5 && realtimeData.timeLeft > 0);
            }
        }
    }, [realtimeData, token, loading]);


    // --- (Event Handlers like handleOpenBetModal and handlePlaceBet remain the same) ---
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
            payload: { amount: betAmount, bet_on: betDetails.value, token: token }
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
            {/* ... (Balance Card and Main Content are the same) ... */}
            <div className="game-balance-card">...</div>
            <div className="game-main-content">...</div>

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

            {/* Betting Modal (no changes) */}
            {showBetModal && ( <div className="modal-overlay">...</div> )}
            
            {/* Final Countdown Popup (no changes) */}
            {showFinalCountdown && ( <div className="modal-overlay countdown-overlay">...</div> )}

            {/* ✅ MODIFIED: Personalized Result Popup */}
            {userRoundResult && (
                <div className="modal-overlay">
                    <div className={`result-modal ${userRoundResult.status}`}>
                        <button className="close-modal-btn" onClick={() => setUserRoundResult(null)}>×</button>
                        
                        {/* Win Condition */}
                        {userRoundResult.status === 'won' && (
                            <>
                                <div className="result-icon win">🎉</div>
                                <h3>Congratulations!</h3>
                                <p className="result-payout">You Won: ₹{userRoundResult.payout.toLocaleString('en-IN')}</p>
                            </>
                        )}
                        
                        {/* Loss Condition */}
                        {userRoundResult.status === 'lost' && (
                            <>
                                <div className="result-icon loss">😕</div>
                                <h3>Better Luck Next Time!</h3>
                                <p className="result-motivation">This time you can do it!</p>
                            </>
                        )}
                        
                        {/* ✅ NEW: 'Did Not Play' Condition */}
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
        </div>
    );
}

export default GameView;
