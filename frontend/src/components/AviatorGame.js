import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './AviatorGame.css'; // Shared stylesheet for all game pages
import { AutoCashOutIcon } from './Icons';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Preload audio files for better performance ---
const takeoffSound = new Audio('/sounds/aviator-takeoff.mp3');
const crashSound = new Audio('/sounds/aviator-crash.mp3');
const cashoutSound = new Audio('/sounds/aviator-cashout.mp3');
takeoffSound.volume = 0.5;

// --- Helper Functions ---
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// --- Reusable Bet Panel Component ---
const BetPanel = ({ betId, gameState, placeBet, cancelBet, cashOut, betAmount, setBetAmount, autoCashOut, setAutoCashOut, hasBet, cashedOut, cashOutMultiplier, currentMultiplier }) => {
    
    const handleBetClick = () => {
        if (!hasBet) {
            placeBet(betId);
        } else if(hasBet && !cashedOut && gameState === 'playing') {
            cashOut(betId, currentMultiplier);
        } else if (hasBet && (gameState === 'waiting' || gameState === 'betting')) {
            cancelBet(betId);
        }
    };

    const getButtonState = () => {
        if (hasBet) {
            if (cashedOut) return { text: `Cashed Out @ ${cashOutMultiplier}x`, className: 'cashed-out-btn', disabled: true };
            if (gameState === 'playing') return { text: `Cash Out ${formatCurrency(betAmount * currentMultiplier)}`, className: 'cashout-btn', disabled: false };
            return { text: 'Cancel Bet', className: 'cancel-btn', disabled: false };
        }
        return { text: 'Place Bet', className: 'bet-btn', disabled: gameState === 'playing' || gameState === 'crashed' };
    };
    
    const buttonState = getButtonState();

    return (
        <div className={`aviator-controls ${hasBet ? 'bet-placed' : ''}`}>
            <div className="bet-controls-row">
                <div className="bet-input-group">
                    <input type="number" value={betAmount} onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)} min="10" disabled={hasBet}/>
                    <div className="quick-bet-buttons">
                        {[100, 250, 500, 1000].map(amount => <button key={amount} onClick={() => setBetAmount(amount)} disabled={hasBet}>₹{amount}</button>)}
                    </div>
                </div>
                 <div className="auto-cashout-group">
                    <AutoCashOutIcon />
                    <input type="number" step="0.1" value={autoCashOut} onChange={(e) => setAutoCashOut(parseFloat(e.target.value) || null)} placeholder="Auto Cash Out" disabled={hasBet} />
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
    const [countdown, setCountdown] = useState(8);
    const [history, setHistory] = useState([]);
    const [liveBets, setLiveBets] = useState([]);

    const [bet1, setBet1] = useState({ amount: 100, autoCashOut: 2.0, hasBet: false, cashedOut: false, cashOutMultiplier: null, isQueued: false });
    const [bet2, setBet2] = useState({ amount: 100, autoCashOut: 2.0, hasBet: false, cashedOut: false, cashOutMultiplier: null, isQueued: false });

    const draw = useCallback((ctx, multiplier) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const maxTime = 10; // Corresponds to max multiplier visually
        const time = (multiplier - 1) * 2; // Simple relation for demonstration
        const progress = Math.min(time / maxTime, 1);

        // Draw curve
        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.height);
        ctx.quadraticCurveTo(
            progress * ctx.canvas.width * 0.7, ctx.canvas.height,
            progress * ctx.canvas.width, ctx.canvas.height - (progress * ctx.canvas.height * 0.8)
        );
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 10;
        ctx.stroke();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationId;
        let crashPoint = 1.5 + Math.random() * 6;
        let startTime = Date.now();

        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const currentMult = parseFloat((1 + elapsed * 0.3 + elapsed ** 2 * 0.03).toFixed(2));

            if (currentMult >= crashPoint) {
                setHistory(h => [{ id: Date.now(), crash_multiplier: currentMult }, ...h.slice(0, 19)]);
                setGameState("crashed");
                crashSound.play();
                return;
            }

            setMultiplier(currentMult);

            // Auto cashout checks
            if (bet1.hasBet && !bet1.cashedOut && bet1.autoCashOut && currentMult >= bet1.autoCashOut) {
                cashOut(1, currentMult);
            }
            if (bet2.hasBet && !bet2.cashedOut && bet2.autoCashOut && currentMult >= bet2.autoCashOut) {
                cashOut(2, currentMult);
            }
            
            draw(ctx, currentMult);
            animationId = requestAnimationFrame(animate);
        };

        if (gameState === "playing") {
            takeoffSound.play();
            animate();
        } else {
            draw(ctx, 1.0);
        }

        return () => {
            takeoffSound.pause();
            takeoffSound.currentTime = 0;
            cancelAnimationFrame(animationId);
        }
    }, [gameState, draw, bet1.hasBet, bet1.cashedOut, bet1.autoCashOut, bet2.hasBet, bet2.cashedOut, bet2.autoCashOut]);

    useEffect(() => {
        if (gameState === "waiting" || gameState === "crashed") {
            let timer = setInterval(() => {
                setCountdown(c => {
                    if (c <= 1) {
                        clearInterval(timer);
                        setGameState("betting");
                        setBet1(p => ({ ...p, hasBet: p.isQueued, isQueued: false, cashedOut: false, cashOutMultiplier: null }));
                        setBet2(p => ({ ...p, hasBet: p.isQueued, isQueued: false, cashedOut: false, cashOutMultiplier: null }));
                        setMultiplier(1.0);
                        setLiveBets([ { id: 1, name: "Rahul", amount: 200 }, { id: 2, name: "Priya", amount: 500 } ]);
                        setTimeout(() => setGameState("playing"), 2000);
                        return 8;
                    }
                    return c - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    const placeBet = (betId) => {
        if (gameState === "playing" || gameState === "crashed") {
            if (betId === 1) setBet1(p => ({...p, isQueued: true}));
            if (betId === 2) setBet2(p => ({...p, isQueued: true}));
        } else {
            if (betId === 1) setBet1(p => ({...p, hasBet: true}));
            if (betId === 2) setBet2(p => ({...p, hasBet: true}));
        }
    };

    const cancelBet = (betId) => {
        if (betId === 1) setBet1(p => ({...p, hasBet: false, isQueued: false}));
        if (betId === 2) setBet2(p => ({...p, hasBet: false, isQueued: false}));
    };

    const cashOut = (betId, currentMultiplier) => {
        cashoutSound.play();
        if (betId === 1 && !bet1.cashedOut) setBet1(p => ({ ...p, cashedOut: true, cashOutMultiplier: currentMultiplier }));
        if (betId === 2 && !bet2.cashedOut) setBet2(p => ({ ...p, cashedOut: true, cashOutMultiplier: currentMultiplier }));
    };

    return (
        <div className="game-page-container aviator-theme">
            <button className="back-button" onClick={onBack}>← Back to Lobby</button>
            
            <div className="history-bar">
                {history.map(h => (
                    <span key={h.id} className={h.crash_multiplier > 1.99 ? "win" : "loss"}>{h.crash_multiplier}x</span>
                ))}
            </div>

            <div className="aviator-display-area">
                <canvas ref={canvasRef} width="600" height="400" className="aviator-canvas" />
                <div className={`multiplier-display ${gameState}`}>
                    {gameState === "playing" && `${multiplier.toFixed(2)}x`}
                    {(gameState === "waiting" || gameState === "betting") && `Next round in ${countdown}s`}
                    {gameState === "crashed" && `💥 Flew Away @ ${multiplier.toFixed(2)}x`}
                </div>
            </div>

            <div className="aviator-controls-grid">
                <BetPanel 
                    betId={1} gameState={gameState} placeBet={placeBet} cancelBet={cancelBet} cashOut={cashOut}
                    betAmount={bet1.amount} setBetAmount={(val) => setBet1(p => ({...p, amount: val}))}
                    autoCashOut={bet1.autoCashOut} setAutoCashOut={(val) => setBet1(p => ({...p, autoCashOut: val}))}
                    hasBet={bet1.hasBet || bet1.isQueued} cashedOut={bet1.cashedOut} cashOutMultiplier={bet1.cashOutMultiplier} currentMultiplier={multiplier}
                />
                <BetPanel 
                    betId={2} gameState={gameState} placeBet={placeBet} cancelBet={cancelBet} cashOut={cashOut}
                    betAmount={bet2.amount} setBetAmount={(val) => setBet2(p => ({...p, amount: val}))}
                    autoCashOut={bet2.autoCashOut} setAutoCashOut={(val) => setBet2(p => ({...p, autoCashOut: val}))}
                    hasBet={bet2.hasBet || bet2.isQueued} cashedOut={bet2.cashedOut} cashOutMultiplier={bet2.cashOutMultiplier} currentMultiplier={multiplier}
                />
            </div>
            
            <div className="live-bets-table">
                 <h4>💸 Current Bets</h4>
                <table>
                    <thead><tr><th>Player</th><th>Bet</th><th>Multiplier</th><th>Payout</th></tr></thead>
                    <tbody>
                        {liveBets.map(b => (
                            <tr key={b.id}><td>{b.name}</td><td>{formatCurrency(b.amount)}</td><td>-</td><td>-</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AviatorGame;

