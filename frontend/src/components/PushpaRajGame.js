// src/components/PushpaRajGame.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './PushpaRajGame.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';
const MAX_HISTORY = 20;

const PushpaRajGame = ({ token, onBack, ws, realtimeData }) => {
    const [isBettingPhase, setIsBettingPhase] = useState(true);
    const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
    const [betAmount, setBetAmount] = useState(10);
    const [isBetPlaced, setIsBetPlaced] = useState(false);
    const [isCashedOut, setIsCashedOut] = useState(false);
    const [message, setMessage] = useState('Place your bet!');
    const [buttonText, setButtonText] = useState('Place Bet');
    const [gameHistory, setGameHistory] = useState([]);
    const [countdown, setCountdown] = useState(0);

    const buttonRef = useRef(null);
    const multiplierRef = useRef(null);

    // This useEffect handles all incoming WebSocket data from the server.
    useEffect(() => {
        if (!realtimeData || realtimeData.game !== 'pushpa') {
            return;
        }

        const payload = realtimeData.payload;

        switch (payload.status) {
            case 'waiting':
                setIsBettingPhase(true);
                setIsBetPlaced(false);
                setIsCashedOut(false);
                setButtonText('Place Bet');
                setCurrentMultiplier(1.00);
                setMessage('Place your bet!');
                setCountdown(payload.countdown || 10000);
                break;
            case 'running':
                setIsBettingPhase(false);
                setMessage('Game in progress...');
                setCurrentMultiplier(payload.multiplier);
                setCountdown(0);
                if (isBetPlaced && !isCashedOut) {
                    setButtonText(`Cash Out @ ${payload.multiplier.toFixed(2)}x`);
                }
                break;
            case 'crashed':
                setIsBettingPhase(true);
                setIsCashedOut(false);
                setButtonText('Place Bet');
                setCountdown(0);
                const newHistoryItem = { multiplier: payload.crashPoint.toFixed(2) };
                setGameHistory(prevHistory => {
                    const newHistory = [newHistoryItem, ...prevHistory];
                    return newHistory.slice(0, MAX_HISTORY);
                });

                if (isBetPlaced && !isCashedOut) {
                    setMessage(`Lost! Crashed at ${payload.crashPoint.toFixed(2)}x.`);
                } else {
                    setMessage(`Crashed at ${payload.crashPoint.toFixed(2)}x!`);
                }
                break;
            default:
                break;
        }

    }, [realtimeData, isBetPlaced, isCashedOut]);

    // This useEffect handles the countdown display.
    useEffect(() => {
        let timer = null;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => Math.max(0, prev - 100));
            }, 100);
        }
        return () => clearInterval(timer);
    }, [countdown]);


    const handleBetAction = async () => {
        // Prevent action if not in the correct phase or if a bet is already placed
        if (isBettingPhase && !isBetPlaced) {
            if (betAmount <= 0) {
                setMessage("Please enter a valid bet amount.");
                return;
            }
            try {
                // Send bet via WebSocket for immediate processing
                ws.send(JSON.stringify({
                    game: 'pushpa',
                    action: 'bet',
                    payload: {
                        token: token,
                        betAmount: betAmount,
                        roundId: realtimeData?.payload?.roundId // Send current round ID
                    }
                }));

                // Update UI immediately for a better user experience
                setIsBetPlaced(true);
                setMessage('Bet placed. Waiting for next round...');
                setButtonText('Waiting for Game...');

            } catch (error) {
                console.error('Betting error:', error);
                setMessage('Error placing bet.');
            }
        } else if (!isBettingPhase && isBetPlaced && !isCashedOut) {
            // Cash out logic
            try {
                ws.send(JSON.stringify({
                    game: 'pushpa',
                    action: 'cashout',
                    payload: {
                        token: token,
                        roundId: realtimeData?.payload?.roundId,
                        cashOutMultiplier: currentMultiplier
                    }
                }));
                // Update UI immediately
                setIsCashedOut(true);
                setButtonText(`Cashed Out @ ${currentMultiplier.toFixed(2)}x`);
                setMessage('Cashing out...');
            } catch (error) {
                console.error('Cash out error:', error);
                setMessage('Failed to cash out.');
            }
        }
    };

    return (
        <div className="pushpa-raj-game">
            <button className="back-button" onClick={onBack}>← Back to Games</button>
            <h2 className="game-title">Pushpa Raj</h2>
            <div className="game-history">
                {gameHistory.map((item, index) => (
                    <span key={index} className="history-item">
                        {item.multiplier}x
                    </span>
                ))}
            </div>
            <div className="game-container">
                <div className="game-animation-area">
                    <div className="character-animation-container">
                        <div className="pushpa-character"></div>
                        <div className={`gun-animation ${!isBettingPhase ? 'active-gun' : ''}`}></div>
                    </div>
                    <div className="multiplier-display">
                        <span ref={multiplierRef} className={`multiplier-text ${isBettingPhase ? 'waiting' : 'active'}`}>
                            {isBettingPhase ? `${(countdown / 1000).toFixed(1)}s` : `${currentMultiplier.toFixed(2)}x`}
                        </span>
                    </div>
                </div>
                <div className="game-controls">
                    <div className="input-group">
                        <label htmlFor="betAmount">Bet Amount</label>
                        <input
                            type="number"
                            id="betAmount"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            disabled={isBetPlaced && isBettingPhase}
                            min="10"
                        />
                    </div>
                    <button
                        ref={buttonRef}
                        className={`action-button ${isBettingPhase ? 'place-bet' : 'cash-out'} ${isCashedOut ? 'cashed-out' : ''}`}
                        onClick={handleBetAction}
                        disabled={(isBetPlaced && isBettingPhase) || isCashedOut}
                    >
                        {buttonText}
                    </button>
                </div>
                <div className="game-message">
                    {message}
                </div>
            </div>
        </div>
    );
};

export default PushpaRajGame;
