// ✅ This file has also been updated to use the new WebSocket hook
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import './PushpaRajGame.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

// ✅ FIX: The component now receives realtimeData and a sendMessage function from the parent App component
function PushpaRajGame({ token, onBack, realtimeData, sendMessage }) {
    const [gameState, setGameState] = useState('waiting');
    const [multiplier, setMultiplier] = useState(1.00);
    const [betAmount, setBetAmount] = useState(10);
    const [isBetPlaced, setIsBetPlaced] = useState(false);
    const [lastBetDetails, setLastBetDetails] = useState(null);
    const [isCashedOut, setIsCashedOut] = useState(false);
    const [payout, setPayout] = useState(null);
    const [roundId, setRoundId] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();
    const [gameHistory, setGameHistory] = useState([]);
    const [isBettingEnabled, setIsBettingEnabled] = useState(true);
    const [countdown, setCountdown] = useState(15);
    const [showBetModal, setShowBetModal] = useState(false);
    const [lastBetStatus, setLastBetStatus] = useState(null);
    const gameBoardRef = useRef(null);

    // Initial state fetch on component mount
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/aviator/history`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setGameHistory(res.data.history))
            .catch(err => console.error("Failed to fetch game history:", err));
    }, [token]);

    // WebSocket message handling
    useEffect(() => {
        if (realtimeData && realtimeData.game === 'pushpa') {
            const data = realtimeData.payload;
            if (data.type === 'PUSHPA_STATE_UPDATE') {
                setGameState(data.status);
                setMultiplier(data.multiplier);
                setRoundId(data.roundId);
                setCountdown(Math.ceil(data.countdown / 1000));
                
                if (data.status === 'waiting' && data.prevStatus === 'crashed') {
                    setLastBetStatus(isCashedOut ? 'won' : 'lost');
                    setIsBetPlaced(false);
                    setIsCashedOut(false);
                }
            } else if (data.type === 'PUSHPA_BET_SUCCESS') {
                setIsBetPlaced(true);
                setLastBetDetails({ amount: betAmount, roundId: data.roundId });
            } else if (data.type === 'PUSHPA_BET_ERROR') {
                setIsBetPlaced(false);
                setLastBetStatus('failed');
            } else if (data.type === 'PUSHPA_CASHOUT_SUCCESS') {
                setIsCashedOut(true);
                setPayout(data.payout);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        }
    }, [realtimeData]);

    const handlePlaceBet = async () => {
        if (!betAmount || betAmount < 10) return alert("Minimum bet is ₹10.");
        if (!sendMessage) return alert("Connection error. Please try again.");

        sendMessage({
            game: 'pushpa',
            action: 'bet',
            payload: {
                betAmount,
                roundId,
                token
            }
        });
        setShowBetModal(false);
    };

    const handleCashOut = () => {
        if (!sendMessage) return alert("Connection error. Please try again.");

        sendMessage({
            game: 'pushpa',
            action: 'cashout',
            payload: {
                roundId,
                token
            }
        });
        setIsCashedOut(true);
    };
    
    return (
        <div className="pushpa-game-container">
            {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} gravity={0.1} />}
            <div className="game-header">
                <button onClick={onBack} className="back-btn">← Back</button>
                <span className="game-name">Pushpa Raj</span>
                <span className="question-mark"><FontAwesomeIcon icon={faQuestionCircle} /></span>
            </div>

            <div className="game-board" ref={gameBoardRef}>
                <div className="game-board-content">
                    {gameState === 'waiting' && (
                        <div className="waiting-state">
                            <span className="info-text">NEXT ROUND IN</span>
                            <div className="countdown-timer">{countdown}s</div>
                            <button onClick={() => setShowBetModal(true)} className="place-bet-btn">
                                Place Your Bet
                            </button>
                            <span className="status-text">
                                {lastBetStatus === 'won' && `You won ₹${payout.toFixed(2)} in the last round!`}
                                {lastBetStatus === 'lost' && 'Last round crashed. Better luck this time!'}
                                {lastBetStatus === 'failed' && 'Failed to place bet. Insufficient funds?'}
                            </span>
                        </div>
                    )}

                    {gameState === 'running' && (
                        <div className="running-state">
                            <span className="info-text">Multiplier</span>
                            <div className="multiplier-value">{multiplier.toFixed(2)}x</div>
                            <button 
                                className={`cashout-btn ${!isBetPlaced || isCashedOut ? 'disabled' : ''}`}
                                onClick={handleCashOut}
                                disabled={!isBetPlaced || isCashedOut}
                            >
                                {isCashedOut ? `Cashed Out @ ${payout.toFixed(2)}x` : `Cash Out @ ${multiplier.toFixed(2)}x`}
                            </button>
                            {isBetPlaced && <span className="status-text">Your Bet: ₹{betAmount}</span>}
                        </div>
                    )}
                    
                    {gameState === 'crashed' && (
                        <div className="crashed-state">
                            <span className="info-text">FLIGHT FLEW AWAY</span>
                            <div className="crashed-multiplier">{multiplier.toFixed(2)}x</div>
                            <span className="status-text">{isCashedOut ? `You won ₹${payout.toFixed(2)}!` : 'You lost this round.'}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="game-controls">
                <button onClick={() => setShowBetModal(true)} className={`primary-btn ${!isBettingEnabled ? 'disabled' : ''}`} disabled={!isBettingEnabled}>
                    Bet Amount: ₹{betAmount}
                </button>
            </div>
            
            <div className="history-section">
                <h4>Last Crashes</h4>
                <div className="history-list">
                    {gameHistory.map((round, index) => (
                        <span key={index} className="history-item">{round.crash_multiplier.toFixed(2)}x</span>
                    ))}
                </div>
            </div>
            
            {showBetModal && (
                <div className="modal-overlay">
                    <div className="bet-modal">
                        <h3>Place Your Bet</h3>
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
        </div>
    );
}

export default PushpaRajGame;
