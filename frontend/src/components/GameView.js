import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './GameView.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

// Helper to determine the color of a number
const getNumberColorClass = (num) => {
    if (num === 0 || num === 5) return 'violet';
    if ([1, 3, 7, 9].includes(num)) return 'red';
    if ([2, 4, 6, 8].includes(num)) return 'green';
    return '';
};


function GameView({ token, financialSummary, onViewChange, onBetPlaced }) {
    const [gameState, setGameState] = useState(null);
    const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showBetModal, setShowBetModal] = useState(false);
    const [betDetails, setBetDetails] = useState({ type: '', value: '' });
    const [betAmount, setBetAmount] = useState(10);
    const [showResultModal, setShowResultModal] = useState(false);
    const [lastShownPeriod, setLastShownPeriod] = useState(null);

    const fetchGameState = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/game-state`, { headers: { Authorization: `Bearer ${token}` } });
            
            if (data.maintenance) {
                setIsUnderMaintenance(true);
                setGameState(null);
            } else {
                // Check if a new result has arrived to trigger the result modal
                if (gameState && data.results && data.results.length > 0 && data.results[0].game_period !== lastShownPeriod && gameState.current_period !== data.current_period) {
                    setShowResultModal(true);
                    setLastShownPeriod(data.results[0].game_period);
                }
                setIsUnderMaintenance(false);
                setGameState(data);
            }
        } catch (error) {
            console.error("Error fetching game state:", error);
            setIsUnderMaintenance(true);
        } finally {
            setLoading(false);
        }
    }, [token, gameState, lastShownPeriod]);

    useEffect(() => {
        fetchGameState();
        const interval = setInterval(fetchGameState, 2000); // Poll for updates every 2 seconds
        return () => clearInterval(interval);
    }, [fetchGameState]);

    const handleOpenBetModal = (type, value) => {
        if (!gameState.can_bet) {
            alert("Betting has closed for the current round. Please wait for the next one.");
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
        try {
            await axios.post(`${API_BASE_URL}/api/bet`, 
                { amount: betAmount, bet_on: betDetails.value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Bet placed successfully!');
            setShowBetModal(false);
            onBetPlaced(); // This will trigger a refresh of financial data in App.js
        } catch (err) {
            alert(err.response?.data?.error || "Failed to place bet.");
        }
    };

    if (loading) return <div className="loading-spinner">Loading Game...</div>;

    if (isUnderMaintenance) {
        return (
            <div className="game-view maintenance-mode">
                <h3>Game Under Maintenance</h3>
                <p>We are improving the game experience. Please check back later.</p>
                <p>More exciting games are on the way!</p>
            </div>
        );
    }
    
    if (!gameState) return <div className="loading-spinner">Connecting to game...</div>;

    const totalBalance = (financialSummary?.balance || 0) + (financialSummary?.withdrawable_wallet || 0);
    const minutes = Math.floor(gameState.time_left / 60);
    const seconds = gameState.time_left % 60;

    return (
        <div className="game-view">
            <div className="game-balance-card">
                <p>Available balance</p>
                <h3>₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="balance-actions">
                    <button onClick={() => onViewChange('deposit')}>Recharge</button>
                    <button className="rules-btn">Read Rules</button>
                </div>
            </div>

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

            <div className="game-history">
                <h4>Parity Record</h4>
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Number</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gameState.results?.map(res => (
                            <tr key={res.game_period}>
                                <td>{res.game_period}</td>
                                <td>{res.result_number}</td>
                                <td>
                                    <span className={`result-dot ${getNumberColorClass(res.result_number)}`}></span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showBetModal && (
                 <div className="modal-overlay">
                    <div className="bet-modal">
                        <h3 className={`bet-title ${betDetails.type === 'color' ? betDetails.value.toLowerCase() : ''}`}>
                            Bet on {betDetails.value}
                        </h3>
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
            
            {showResultModal && gameState.results && gameState.results.length > 0 && (
                <div className="modal-overlay">
                    <div className="result-modal">
                        <h3>Period {gameState.results[0].game_period} Result</h3>
                        <div className={`result-number-display ${getNumberColorClass(gameState.results[0].result_number)}`}>
                            {gameState.results[0].result_number}
                        </div>
                        <button onClick={() => setShowResultModal(false)}>Close</button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default GameView;

