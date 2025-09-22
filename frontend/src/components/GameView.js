// src/components/GameView.js

import React, { useState, useEffect, useCallback } from 'react';
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
    const [gameState, setGameState] = useState(null);
    const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
    const [gameHistory, setGameHistory] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [showBetModal, setShowBetModal] = useState(false);
    const [betDetails, setBetDetails] = useState({ type: '', value: '' });
    const [betAmount, setBetAmount] = useState(10);
    
    // ✅ NEW States for popups and result tracking
    const [userRoundResult, setUserRoundResult] = useState(null); // Stores win/loss info
    const [lastCheckedPeriod, setLastCheckedPeriod] = useState(null); // Prevents re-fetching results
    const [showFinalCountdown, setShowFinalCountdown] = useState(false); // Controls 5-sec countdown popup

    // // --- Data Fetching ---
    // const fetchGameState = useCallback(async () => {
    //     try {
    //         const { data } = await axios.get(`${API_BASE_URL}/api/game-state`, { headers: { Authorization: `Bearer ${token}` } });
            
    //         if (data.maintenance) {
    //             setIsUnderMaintenance(true);
    //             setGameState(null);
    //         } else {
    //             setIsUnderMaintenance(false);
                
    //             // ✅ LOGIC: When a new round starts, check the result of the previous round for the user.
    //             if (gameState && data.current_period !== gameState.current_period && lastCheckedPeriod !== gameState.current_period) {
    //                 setLastCheckedPeriod(gameState.current_period);
    //                 try {
    //                     const resultRes = await axios.get(`${API_BASE_URL}/api/my-bet-result/${gameState.current_period}`, { headers: { Authorization: `Bearer ${token}` } });
    //                     if (resultRes.data.status !== 'did_not_play') {
    //                         // Set the result data, which will trigger the result modal
    //                         setUserRoundResult({ 
    //                             ...resultRes.data, 
    //                             period: gameState.current_period, 
    //                             number: data.results[0].result_number 
    //                         });
    //                     }
    //                 } catch (err) {
    //                     console.error("Could not fetch user's round result:", err);
    //                 }
    //             }
                
    //             setGameState(data);

    //             // ✅ LOGIC: Show the final countdown popup only in the last 5 seconds
    //             setShowFinalCountdown(data.time_left <= 5 && data.time_left > 0);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching game state:", error);
    //         setIsUnderMaintenance(true);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [token, gameState, lastCheckedPeriod]);

    // useEffect(() => {
    //     fetchGameState();
    //     const interval = setInterval(fetchGameState, 2000);
    //     return () => clearInterval(interval);
    // }, [fetchGameState]);


    //// ✅ NEW useEffect: This hook processes the real-time data as it comes in from App.js.
    useEffect(() => {
        // Check if we have received any data yet
        if (realtimeData) {
            setLoading(false); // Stop loading once we get the first message

            // When the server sends new results, update the history
            if (realtimeData.type === 'ROUND_RESULT') {
                setGameHistory(realtimeData.results);
                
                // Check the user's personal result for the round that just ended
                const lastPeriod = realtimeData.results[0].game_period;
                axios.get(`${API_BASE_URL}/api/my-bet-result/${lastPeriod}`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(res => {
                        if (res.data.status !== 'did_not_play') {
                            setUserRoundResult({ 
                                ...res.data, 
                                period: lastPeriod, 
                                number: realtimeData.results[0].result_number 
                            });
                        }
                    });
            }

            // Update the countdown popup visibility
            if (realtimeData.type === 'TIMER_UPDATE') {
                setShowFinalCountdown(realtimeData.timeLeft <= 5 && realtimeData.timeLeft > 0);
            }

        }
    }, [realtimeData, token]); // This effect runs every time new data arrives.


    // --- Event Handlers ---
    const handleOpenBetModal = (type, value) => {
        if (!gameState.can_bet) {
            alert("Betting has closed for the current round. Please wait for the next one.");
            return;
        }
        setBetDetails({ type, value });
        setShowBetModal(true);
    };

    // ✅ MODIFIED: handlePlaceBet now uses WebSockets
    const handlePlaceBet = async () => {
        if (betAmount < 10) {
            alert("Minimum bet is ₹10.");
            return;
        }

        // Check if the WebSocket connection is open and ready
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            alert("Connection error. Please refresh the page.");
            return;
        }

        // Send the bet message to the server
        const betMessage = {
            game: 'color-prediction', // Important for the server's router
            action: 'bet',
            payload: {
                amount: betAmount,
                bet_on: betDetails.value,
                token: token // Send token for authentication on the backend
            }
        };
        ws.send(JSON.stringify(betMessage));

        alert('Bet placed successfully!');
        setShowBetModal(false);
        onBetPlaced(); // Refresh user balance
    };

    
    // --- Render Logic ---
    if (loading) return <div className="loading-spinner">Loading Game...</div>;

    if (isUnderMaintenance) {
        return (
            <div className="game-view maintenance-mode">
                <h3>Game Under Maintenance</h3>
                <p>We are improving the game experience. Please check back later.</p>
            </div>
        );
    }
    
    if (!gameState) return <div className="loading-spinner">Connecting to game...</div>;

    const totalBalance = (financialSummary?.balance || 0) + (financialSummary?.withdrawable_wallet || 0);
    const minutes = Math.floor(gameState.time_left / 60);
    const seconds = gameState.time_left % 60;

    return (
        <div className="game-view">
            {/* Balance and Actions */}
            <div className="game-balance-card">
                <p>Available balance</p>
                <h3>₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="balance-actions">
                    <button onClick={() => onViewChange('deposit')}>Recharge</button>
                    <button className="rules-btn">Read Rules</button>
                </div>
            </div>

            {/* Game Content */}
            <div className="game-main-content">
                <div className="game-info">
                    <div className="period-info">
                        <h4>Period</h4>
                        <p>{gameState.current_period}</p>
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

            {/* Game History Table */}
            <div className="game-history">
                <h4>Parity Record</h4>
                <table className="history-table">
                    <thead>
                        <tr><th>Period</th><th>Number</th><th>Result</th></tr>
                    </thead>
                    <tbody>
                        {gameState.results?.map(res => (
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
            
            {/* ✅ NEW: Final Countdown Popup */}
            {showFinalCountdown && (
                <div className="modal-overlay countdown-overlay">
                    <div className="countdown-popup">
                        {gameState.time_left}
                    </div>
                </div>
            )}

            {/* ✅ NEW: Personalized Result Popup */}
            {userRoundResult && (
                <div className="modal-overlay">
                    <div className={`result-modal ${userRoundResult.status}`}>
                        <button className="close-modal-btn" onClick={() => setUserRoundResult(null)}>×</button>
                        {userRoundResult.status === 'won' ? (
                            <>
                                <div className="result-icon win">🎉</div>
                                <h3>Congratulations!</h3>
                                <p className="result-payout">You Won: ₹{userRoundResult.payout.toLocaleString('en-IN')}</p>
                            </>
                        ) : (
                            <>
                                <div className="result-icon loss">😕</div>
                                <h3>Better Luck Next Time!</h3>
                                <p className="result-motivation">This time you can do it!</p>
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
