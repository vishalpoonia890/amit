import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './GameView.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

function GameView({ token, userData, onBalanceUpdate }) {
    const [gameState, setGameState] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [selectedBet, setSelectedBet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResultModal, setShowResultModal] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const fetchGameState = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/game/color-prediction/state`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGameState(res.data);

            if (res.data.currentGame) {
                const endTime = new Date(res.data.currentGame.end_time).getTime();
                const now = new Date().getTime();
                const diff = Math.floor((endTime - now) / 1000);
                setCountdown(diff > 0 ? diff : 0);
            }
        } catch (err) {
            console.error("Failed to fetch game state", err);
            setError('Could not connect to the game server.');
        }
    }, [token]);

    useEffect(() => {
        fetchGameState();
        const interval = setInterval(fetchGameState, 10000); // Poll for state every 10 seconds
        return () => clearInterval(interval);
    }, [fetchGameState]);
    
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            if (countdown <= 5 && !showResultModal) {
                 setShowResultModal(true);
            }
            if(countdown === 1){
                 setTimeout(() => {
                    setShowResultModal(false);
                    fetchGameState();
                    onBalanceUpdate(); // Refresh user balance after round ends
                 }, 2000); // Show result for 2 seconds
            }
        }
        return () => clearTimeout(timer);
    }, [countdown, showResultModal, fetchGameState, onBalanceUpdate]);

    const handleBet = async () => {
        if (!selectedBet || betAmount <= 0) {
            alert('Please select a bet and enter a valid amount.');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/game/color-prediction/bet`, 
                { amount: betAmount, on: selectedBet },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Bet placed successfully!');
            onBalanceUpdate(); // Immediately update balance
            setSelectedBet(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to place bet.');
        } finally {
            setLoading(false);
        }
    };
    
    if (gameState?.maintenance) {
        return <div className="maintenance-screen">
            <h2>Game Under Maintenance</h2>
            <p>More exciting games are on the way. Stay tuned and get ready to earn more!</p>
        </div>;
    }
    
    const renderHistoryDot = (num) => {
        let colorClass = '';
        if ([1,3,7,9].includes(num)) colorClass = 'red-dot';
        if ([2,4,6,8].includes(num)) colorClass = 'green-dot';
        if ([0,5].includes(num)) colorClass = 'violet-dot';
        return <div className={`history-dot ${colorClass}`}>{num}</div>
    }

    return (
        <div className="color-game-container">
            {showResultModal && (
                <div className="result-modal">
                    {countdown > 1 ? (
                        <>
                            <h2>Result in...</h2>
                            <div className="modal-countdown">{countdown}</div>
                        </>
                    ) : (
                         <>
                            <h2>Result is</h2>
                            <div className="modal-result">{renderHistoryDot(gameState?.history[0]?.winning_number)}</div>
                        </>
                    )}
                </div>
            )}

            <div className="game-header">
                <h3>Period: {gameState?.currentGame?.period_number}</h3>
                <div className="countdown-timer">{`00:${countdown < 10 ? '0' : ''}${countdown}`}</div>
            </div>

            <div className="betting-area">
                 <button className="color-btn red" onClick={() => setSelectedBet('red')}>Join Red</button>
                 <button className="color-btn green" onClick={() => setSelectedBet('green')}>Join Green</button>
                 <button className="color-btn violet" onClick={() => setSelectedBet('violet')}>Join Violet</button>
            </div>
            
            <div className="number-bets">
                {[...Array(10).keys()].map(num => (
                    <button key={num} onClick={() => setSelectedBet(num.toString())}>{num}</button>
                ))}
            </div>

            {selectedBet && (
                <div className="bet-slip">
                    <h4>Placing Bet on: <span className="selected-bet-value">{selectedBet}</span></h4>
                    <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} min="10" />
                    <button onClick={handleBet} disabled={loading || countdown < 6}>{loading ? 'Placing...' : 'Confirm Bet'}</button>
                </div>
            )}

            <div className="game-history">
                <h4>History</h4>
                <div className="history-grid">
                    {gameState?.history?.map(game => (
                       <div key={game.id} className="history-item">
                           <span>{game.period_number}</span>
                           {renderHistoryDot(game.winning_number)}
                       </div>
                    ))}
                </div>
            </div>
             <div className="game-rules">
                <h4>How to Play</h4>
                <p>Join a color or number. Win rewards based on the result!</p>
                <ul>
                    <li><span className="red-dot"></span><span className="green-dot"></span> Red/Green Win: <strong>1.98x</strong></li>
                    <li><span className="violet-dot"></span> Violet Win: <strong>4.5x</strong></li>
                    <li><strong>#</strong> Number Win: <strong>9.2x</strong></li>
                    <li>If Violet (0 or 5) is the result, 50% of your bet on Red/Green is returned.</li>
                </ul>
            </div>
        </div>
    );
}

export default GameView;

