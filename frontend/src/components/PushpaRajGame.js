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
        if (!realtimeData || realtimeData.type !== 'PUSHPA_STATE_UPDATE') {
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
                const newHistoryItem = { multiplier: payload.crashMultiplier.toFixed(2) };
                setGameHistory(prevHistory => {
                    const newHistory = [newHistoryItem, ...prevHistory];
                    return newHistory.slice(0, MAX_HISTORY);
                });

                if (isBetPlaced && !isCashedOut) {
                    setMessage(`Lost! Crashed at ${payload.crashMultiplier.toFixed(2)}x.`);
                } else {
                    setMessage(`Crashed at ${payload.crashMultiplier.toFixed(2)}x!`);
                }
                break;
            default:
                break;
        }

    }, [realtimeData, isBetPlaced, isCashedOut]);

    // This useEffect handles the countdown display.
    useEffect(() => {
        let timer = null;
        if (isBettingPhase && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => Math.max(0, prev - 100));
            }, 100);
        }
        return () => clearInterval(timer);
    }, [countdown, isBettingPhase]);


    const handleBetAction = async () => {
        // Prevent action if not in the correct phase or if a bet is already placed
        if (isBettingPhase && !isBetPlaced) {
            if (betAmount <= 0) {
                setMessage("Please enter a valid bet amount.");
                return;
            }
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    game: 'pushpa',
                    action: 'bet',
                    payload: {
                        token: token,
                        betAmount: betAmount,
                        roundId: realtimeData?.payload?.roundId
                    }
                }));
                setIsBetPlaced(true);
                setMessage('Bet placed. Waiting for game to start...');
                setButtonText('Waiting for Game...');
            } else {
                setMessage('Connection error. Please refresh.');
            }
        } else if (!isBettingPhase && isBetPlaced && !isCashedOut) {
            // Cash out logic
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    game: 'pushpa',
                    action: 'cashout',
                    payload: {
                        token: token,
                        roundId: realtimeData?.payload?.roundId,
                        cashOutMultiplier: currentMultiplier
                    }
                }));
                setIsCashedOut(true);
                setButtonText(`Cashed Out @ ${currentMultiplier.toFixed(2)}x`);
                setMessage('Cashing out...');
            } else {
                setMessage('Connection error. Please refresh.');
            }
        }
    };

    return (
        <div className="pushpa-raj-game">
            <button className="back-button" onClick={onBack}>← Back to Games</button>
            <h2 className="game-title">Pushpa Raj, Paisa Banaye Aasani!</h2>
            <div className="game-history">
                {gameHistory.map((item, index) => (
                    <span key={index} className="history-item">
                        {item.multiplier}x
                    </span>
                ))}
            </div>
            <div className="game-container">
                <div className="game-animation-area">
                    {/* The animated truck and character */}
                    <div className="pushpa-truck-container">
                        <div className="pushpa-truck"></div>
                        <div className="pushpa-character"></div>
                    </div>
                    {/* The multiplier display */}
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
                            disabled={isBetPlaced || !isBettingPhase}
                            min="10"
                        />
                    </div>
                    <button
                        ref={buttonRef}
                        className={`action-button ${isBettingPhase ? 'place-bet' : 'cash-out'} ${isCashedOut ? 'cashed-out' : ''}`}
                        onClick={handleBetAction}
                        disabled={(isBetPlaced && isBettingPhase) || isCashedOut || !isBettingPhase && !isBetPlaced}
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
