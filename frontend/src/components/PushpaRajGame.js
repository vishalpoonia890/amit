// src/components/PushpaRajGame.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './PushpaRajGame.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

const PushpaRajGame = ({ token, onBack, ws, realtimeData }) => {
    const [isBettingPhase, setIsBettingPhase] = useState(true);
    const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
    const [betAmount, setBetAmount] = useState(10);
    const [isBetPlaced, setIsBetPlaced] = useState(false);
    const [isCashedOut, setIsCashedOut] = useState(false);
    const [message, setMessage] = useState('Place your bet!');
    const [buttonText, setButtonText] = useState('Place Bet');

    const intervalRef = useRef(null);

    // This useEffect handles the core game animation and state changes
    useEffect(() => {
        if (!realtimeData) return;

        // Start a new round
        if (realtimeData.event === 'start_round' && isBettingPhase) {
            setMessage('Game starting soon!');
            setIsBettingPhase(true);
            setIsBetPlaced(false);
            setIsCashedOut(false);
            setButtonText('Place Bet');
            setCurrentMultiplier(1.00);
        }

        // Game in progress
        if (realtimeData.event === 'multiplier_update') {
            setIsBettingPhase(false);
            setMessage('Game in progress...');
            setCurrentMultiplier(realtimeData.multiplier);
            setButtonText(`Cash Out @ ${realtimeData.multiplier.toFixed(2)}x`);
        }

        // Game crashed
        if (realtimeData.event === 'game_crashed') {
            clearInterval(intervalRef.current);
            setMessage(`Crashed at ${realtimeData.crashPoint.toFixed(2)}x!`);
            setIsBettingPhase(true);
            setIsBetPlaced(false);
            setIsCashedOut(false);
            setButtonText('Place Bet');
        }

        // Handle a user's cash-out result
        if (realtimeData.event === 'cash_out_result' && realtimeData.userId === token) {
            if (realtimeData.success) {
                setMessage(`Cashed out successfully! Winnings: ₹${realtimeData.winnings.toFixed(2)}`);
                setIsCashedOut(true);
            } else {
                setMessage('Failed to cash out.');
            }
        }
    }, [realtimeData, token, isBettingPhase]);


    const handleBetAction = async () => {
        if (isBettingPhase) {
            // Logic for placing a bet
            try {
                // The API endpoint you created on the backend
                const response = await axios.post(
                    `${API_BASE_URL}/api/pushpa-raj/place-bet`,
                    { betAmount },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setIsBetPlaced(true);
                    setMessage('Bet placed. Waiting for next round...');
                    // The WebSocket will handle the rest of the game state
                } else {
                    setMessage(response.data.error || 'Failed to place bet.');
                }
            } catch (error) {
                console.error('Betting error:', error);
                setMessage('Error placing bet.');
            }
        } else if (isBetPlaced && !isCashedOut) {
            // Logic for cashing out
            ws.send(JSON.stringify({
                action: 'cash_out',
                userId: token, // Send a unique user identifier
                cashOutMultiplier: currentMultiplier
            }));
        }
    };

    return (
        <div className="pushpa-raj-game">
            <button className="back-button" onClick={onBack}>← Back to Games</button>
            <h2 className="game-title">Pushpa Raj</h2>
            <div className="game-container">
                <div className="multiplier-display">
                    <span className={`multiplier-text ${isBettingPhase ? 'waiting' : 'active'}`}>
                        {isBettingPhase ? '1.00x' : `${currentMultiplier.toFixed(2)}x`}
                    </span>
                    <div className={`animation-line ${!isBettingPhase ? 'active-line' : ''}`}></div>
                </div>
                <div className="game-controls">
                    <div className="input-group">
                        <label htmlFor="betAmount">Bet Amount</label>
                        <input
                            type="number"
                            id="betAmount"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            disabled={isBetPlaced}
                            min="10"
                        />
                    </div>
                    <button
                        className={`action-button ${isBettingPhase ? 'place-bet' : 'cash-out'} ${isCashedOut ? 'cashed-out' : ''}`}
                        onClick={handleBetAction}
                        disabled={isCashedOut}
                    >
                        {isCashedOut ? 'Cashed Out' : buttonText}
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
