import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './GamePages.css';
import { AutoCashOutIcon } from './Icons';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Preload audio files for better performance ---
const takeoffSound = new Audio('/sounds/aviator-takeoff.mp3');
const crashSound = new Audio('/sounds/aviator-crash.mp3');
const cashoutSound = new Audio('/sounds/aviator-cashout.mp3');
takeoffSound.volume = 0.3;

// --- Helper Functions ---
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

// --- Reusable Bet Panel Component ---
const BetPanel = ({ betId, gameState, placeBet, cancelBet, cashOut, bet, setBet, currentMultiplier }) => {
    const { amount, autoCashOut, hasBet, isQueued, cashedOut, cashOutMultiplier } = bet;

    const handleBetClick = () => {
        if (!hasBet && !isQueued) {
            placeBet(betId);
        } else if (hasBet && !cashedOut && gameState === 'playing') {
            cashOut(betId, currentMultiplier);
        } else if (isQueued) {
            cancelBet(betId);
        }
    };

    const getButtonState = () => {
        if (isQueued) return { text: 'Cancel Bet', className: 'cancel-btn', disabled: false };
        if (hasBet) {
            if (cashedOut) return { text: `Cashed Out @ ${cashOutMultiplier}x`, className: 'cashed-out-btn', disabled: true };
            if (gameState === 'playing') return { text: `Cash Out ${formatCurrency(amount * currentMultiplier)}`, className: 'cashout-btn', disabled: false };
            return { text: 'Waiting for Next Round', className: 'bet-btn', disabled: true };
        }
        const text = (gameState === 'playing' || gameState === 'crashed') ? 'Bet (Next Round)' : 'Place Bet';
        return { text, className: 'bet-btn', disabled: false };
    };
    
    const buttonState = getButtonState();

    return (
        <div className={`aviator-controls ${hasBet || isQueued ? 'bet-placed' : ''}`}>
            <div className="bet-controls-row">
                <div className="bet-input-group">
                    <input type="number" value={amount} onChange={(e) => setBet(betId, 'amount', parseInt(e.target.value) || 0)} min="10" disabled={hasBet || isQueued}/>
                    <div className="quick-bet-buttons">
                        {[100, 250, 500, 1000].map(val => <button key={val} onClick={() => setBet(betId, 'amount', val)} disabled={hasBet || isQueued}>₹{val}</button>)}
                    </div>
                </div>
                 <div className="auto-cashout-group">
                    <AutoCashOutIcon />
                    <input type="number" step="0.1" value={autoCashOut} onChange={(e) => setBet(betId, 'autoCashOut', parseFloat(e.target.value) || null)} placeholder="Auto" disabled={hasBet || isQueued} />
                </div>
            </div>
            <button className={`action-button ${buttonState.className}`} onClick={handleBetClick} disabled={buttonState.disabled}>
                {buttonState.text}
            </button>
        </div>
    );
};

// --- Main Game Component ---
function AviatorGame({ token, onBack }) {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState("waiting");
    const [multiplier, setMultiplier] = useState(1.0);
    const [countdown, setCountdown] = useState(10);
    const [history, setHistory] = useState([]);
    const [liveBets, setLiveBets] = useState([]);
    const [roundId, setRoundId] = useState('');

    const [bet1, setBet1] = useState({ amount: 100, autoCashOut: 2.0, hasBet: false, isQueued: false, cashedOut: false, cashOutMultiplier: null });
    const [bet2, setBet2] = useState({ amount: 100, autoCashOut: 2.0, hasBet: false, isQueued: false, cashedOut: false, cashOutMultiplier: null });
    
    const updateBetState = (betId, key, value) => {
        const setter = betId === 1 ? setBet1 : setBet2;
        setter(prev => ({...prev, [key]: value}));
    };

    const draw = useCallback((ctx, multiplier) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Dynamic properties based on multiplier
        const maxTime = 10; 
        const time = (multiplier - 1) * 2;
        const progress = Math.min(time / maxTime, 1);
        
        // Draw the curve
        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.height);
        const controlX = progress * ctx.canvas.width * 0.7;
        const controlY = ctx.canvas.height;
        const endX = progress * ctx.canvas.width;
        const endY = ctx.canvas.height - (progress * ctx.canvas.height * 0.8);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        
        // Gradient for the curve
        const curveGradient = ctx.createLinearGradient(0, ctx.canvas.height, endX, endY);
        curveGradient.addColorStop(0, "#EF4444");
        curveGradient.addColorStop(1, "#FBBF24");
        ctx.strokeStyle = curveGradient;
        ctx.lineWidth = 10;
        ctx.stroke();

        // Draw the plane at the end of the curve
        const planeX = endX;
        const planeY = endY;
        
        ctx.save();
        ctx.translate(planeX, planeY);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = '24px sans-serif';
        ctx.fillText('✈️', -12, 8); // Center the emoji
        ctx.restore();

    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        draw(ctx, multiplier); // Initial draw
    }, [draw, multiplier]);


    useEffect(() => {
        const fetchState = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/aviator/state`, { headers: { Authorization: `Bearer ${token}` } });
                
                if (data.gameState !== gameState) setGameState(data.gameState);
                if (data.multiplier !== multiplier) setMultiplier(data.multiplier);
                if (data.roundId !== roundId) {
                    setRoundId(data.roundId);
                    // Reset bets for the new round
                    setBet1(p => ({...p, hasBet: p.isQueued, isQueued: false, cashedOut: false, cashOutMultiplier: null}));
                    setBet2(p => ({...p, hasBet: p.isQueued, isQueued: false, cashedOut: false, cashOutMultiplier: null}));
                }
                setCountdown(data.countdown);

            } catch (error) { console.error("Failed to fetch game state:", error); }
        };

        const interval = setInterval(fetchState, 500);
        return () => clearInterval(interval);
    }, [token, gameState, multiplier, roundId]);
    
    useEffect(() => {
        if(gameState === 'playing') takeoffSound.play();
        if(gameState === 'crashed') {
            takeoffSound.pause();
            takeoffSound.currentTime = 0;
            crashSound.play();
        }
    }, [gameState]);
    
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/aviator/history`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setHistory(res.data.history || []))
            .catch(err => console.error("Failed to fetch history:", err));
    }, [token, gameState]);


    const placeBet = (betId) => {
        const bet = betId === 1 ? bet1 : bet2;
        if (gameState === "playing" || gameState === "crashed") {
            updateBetState(betId, 'isQueued', true);
        } else {
            updateBetState(betId, 'hasBet', true);
        }
    };

    const cancelBet = (betId) => {
        updateBetState(betId, 'isQueued', false);
    };

    const cashOut = (betId, currentMultiplier) => {
        cashoutSound.play();
        if (betId === 1 && !bet1.cashedOut) updateBetState(betId, 'cashedOut', true); updateBetState(betId, 'cashOutMultiplier', currentMultiplier);
        if (betId === 2 && !bet2.cashedOut) updateBetState(betId, 'cashedOut', true); updateBetState(betId, 'cashOutMultiplier', currentMultiplier);
    };
    
    const commonProps = { gameState, placeBet, cancelBet, cashOut, currentMultiplier: multiplier };

    return (
        <div className="game-page-container aviator-theme">
            <button className="back-button" onClick={onBack}>← Back</button>
            <div className="aviator-main-grid">
                <div className="aviator-live-bets-panel">
                    <h4>Live Bets</h4>
                    <table>
                        <thead><tr><th>User</th><th>Bet</th><th>Multiplier</th><th>Payout</th></tr></thead>
                        <tbody>
                            {liveBets.map(b => ( <tr key={b.id}><td>{b.name}</td><td>{formatCurrency(b.amount)}</td><td>-</td><td>-</td></tr> ))}
                        </tbody>
                    </table>
                </div>
                <div className="aviator-game-area">
                    <div className="history-bar">
                        {history.map(h => ( <span key={h.id} className={h.crash_multiplier > 1.99 ? "win" : "loss"}>{h.crash_multiplier}x</span> ))}
                    </div>
                    <div className="aviator-display-area">
                        <canvas ref={canvasRef} width="600" height="400" className="aviator-canvas" />
                        <div className={`multiplier-display ${gameState}`}>
                            {gameState === "playing" && `${multiplier.toFixed(2)}x`}
                            {(gameState === "waiting" || gameState === "betting") && `Starting in ${countdown}s...`}
                            {gameState === "crashed" && `💥 Flew Away @ ${multiplier.toFixed(2)}x`}
                        </div>
                    </div>
                </div>
            </div>
            <div className="aviator-controls-grid">
                <BetPanel betId={1} {...{...commonProps, bet: bet1, setBet: updateBetState}} />
                <BetPanel betId={2} {...{...commonProps, bet: bet2, setBet: updateBetState}} />
            </div>
        </div>
    );
}

export default AviatorGame;

