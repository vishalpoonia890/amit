import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './AviatorGame.css'; // Shared stylesheet for all game pages
import { AutoCashOutIcon } from './Icons';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Helper Functions ---
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') amount = 0;
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
};

// --- Main Game Component ---
function AviatorGame({ token, onBack, financialSummary }) {
    // --- State Management ---
    const canvasRef = useRef(null);
    const audioRefs = useRef({
        takeoff: new Audio('/sounds/aviator-takeoff.mp3'),
        cashout: new Audio('/sounds/aviator-cashout.mp3'),
        crash: new Audio('/sounds/aviator-crash.mp3'),
    });

    const [gameState, setGameState] = useState('waiting');
    const [multiplier, setMultiplier] = useState(1.00);
    const [betAmount, setBetAmount] = useState(100);
    const [autoCashOut, setAutoCashOut] = useState(2.0);
    const [hasBet, setHasBet] = useState(false);
    const [cashedOut, setCashedOut] = useState(false);
    const [cashOutMultiplier, setCashOutMultiplier] = useState(null);
    const [countdown, setCountdown] = useState(10);
    const [history, setHistory] = useState([]);
    const [liveBets, setLiveBets] = useState([]);

    // --- Canvas Drawing Logic ---
    const draw = useCallback((ctx, planePosition, trail) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const gridOffset = (Date.now() / 20) % 40;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        for (let i = gridOffset - 40; i < ctx.canvas.height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(ctx.canvas.width, i);
            ctx.stroke();
        }
        
        trail.forEach(p => {
            ctx.fillStyle = `rgba(239, 68, 68, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.save();
        ctx.translate(planePosition.x, planePosition.y);
        ctx.rotate(planePosition.angle);
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 15;
        // Simple SVG-like plane shape
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-15, 10);
        ctx.lineTo(-15, -10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }, []);

    // --- Game Loop and Animation ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let trail = [];
        
        const crashPoint = 3.5 + Math.random() * 5;
        const startTime = Date.now();

        const animate = () => {
            const elapsedTime = (Date.now() - startTime) / 1000;
            const currentMultiplier = parseFloat((1 + elapsedTime * 0.2 + Math.pow(elapsedTime, 2) * 0.02).toFixed(2));

            if (currentMultiplier >= crashPoint) {
                setGameState('crashed');
                return;
            }

            setMultiplier(currentMultiplier);
            const progress = Math.min(elapsedTime / 5, 1);
            const planeX = 30 + progress * (ctx.canvas.width - 60);
            const planeY = ctx.canvas.height - 40 - Math.pow(progress, 2) * (ctx.canvas.height - 80);
            const angle = -Math.atan(progress * 0.5);

            trail.push({ x: planeX - 15, y: planeY, size: Math.random() * 2 + 1, opacity: 1 });
            trail = trail.map(p => ({ ...p, opacity: p.opacity - 0.03, size: p.size * 0.98 })).filter(p => p.opacity > 0);
            
            if (hasBet && !cashedOut && autoCashOut && currentMultiplier >= autoCashOut) {
                cashOut(currentMultiplier);
            }

            draw(ctx, { x: planeX, y: planeY, angle }, trail);
            animationFrameId = requestAnimationFrame(animate);
        };

        if (gameState === 'playing') {
            animate();
        } else {
            draw(ctx, { x: 30, y: ctx.canvas.height - 40, angle: 0 }, []);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, draw, hasBet, autoCashOut, cashedOut]);

    // --- Round Management, Sound Effects & Data Fetching ---
    useEffect(() => {
        // Fetch history on initial load
        axios.get(`${API_BASE_URL}/api/aviator/history`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setHistory(res.data.history || []))
            .catch(err => console.error("Failed to fetch history:", err));
    }, [token]);
    
    useEffect(() => {
        if (gameState === 'playing') {
            audioRefs.current.takeoff.currentTime = 0;
            audioRefs.current.takeoff.play();
        }
        if (gameState === 'crashed') {
            audioRefs.current.takeoff.pause();
            audioRefs.current.crash.play();
        }
        if (gameState === 'waiting' || gameState === 'crashed') {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setGameState('betting');
                        setHasBet(false);
                        setCashedOut(false);
                        setCashOutMultiplier(null);
                        setMultiplier(1.00);
                        setLiveBets([ { id: 1, name: 'Rahul S.', amount: 500 }, { id: 2, name: 'Priya K.', amount: 1200 } ]);
                        setTimeout(() => setGameState('playing'), 2000);
                        return 10;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);
    
    const placeBet = () => {
        if (financialSummary.balance < betAmount) { alert("Insufficient balance."); return; }
        setHasBet(true);
    };

    const cashOut = (currentMultiplier) => {
        if(cashedOut) return;
        setCashOutMultiplier(currentMultiplier);
        setHasBet(false);
        setCashedOut(true);
        audioRefs.current.takeoff.pause();
        audioRefs.current.cashout.play();
    };

    return (
        <div className="game-page-container aviator-theme">
            <button className="back-button" onClick={onBack}>← Back to Lobby</button>
            <div className="game-header"><h1>Aviator</h1></div>
            
            <div className="history-bar">
                {history.map(item => (
                    <span key={item.id} className={item.crash_multiplier < 2 ? 'loss' : 'win'}>{item.crash_multiplier}x</span>
                ))}
            </div>

            <div className="aviator-display-area">
                <canvas ref={canvasRef} width="300" height="300" className="aviator-canvas"></canvas>
                <div className={`multiplier-display ${gameState}`}>
                    {gameState === 'playing' && `${multiplier}x`}
                    {gameState === 'crashed' && <span className="crashed-text">Flew Away @ {multiplier}x</span>}
                    {(gameState === 'waiting' || gameState === 'betting') && `Next round in ${countdown}s...`}
                </div>
            </div>

            {cashOutMultiplier && (
                <div className="cashout-success-message">
                    You cashed out at {cashOutMultiplier}x and won {formatCurrency(betAmount * cashOutMultiplier)}!
                </div>
            )}

            <div className="aviator-controls">
                <div className="bet-controls-row">
                    <div className="bet-input-group">
                        <input type="number" value={betAmount} onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)} min="10" disabled={hasBet}/>
                        <div className="quick-bet-buttons">
                            {[100, 250, 500, 1000].map(amount => <button key={amount} onClick={() => setBetAmount(amount)} disabled={hasBet}>₹{amount}</button>)}
                        </div>
                    </div>
                     <div className="auto-cashout-group">
                        <AutoCashOutIcon />
                        <input type="number" step="0.1" value={autoCashOut} onChange={(e) => setAutoCashOut(parseFloat(e.target.value) || null)} placeholder="Auto Cash Out" />
                    </div>
                </div>
                
                {(!hasBet && (gameState === 'waiting' || gameState === 'betting')) && (
                    <button className="action-button bet-button" onClick={placeBet}>Place Bet</button>
                )}
                
                {(hasBet && (gameState === 'waiting' || gameState === 'betting')) && (
                    <button className="action-button cancel-button">Cancel Bet</button>
                )}
                
                {(gameState === 'playing' && hasBet && !cashedOut) && (
                     <button className="action-button cashout-button" onClick={() => cashOut(multiplier)}>
                        Cash Out {formatCurrency(betAmount * multiplier)}
                    </button>
                )}
            </div>
            
            <div className="live-bets-table">
                 <h4>Current Round Bets</h4>
                <table>
                    <thead><tr><th>Player</th><th>Bet Amount</th></tr></thead>
                    <tbody>
                        {liveBets.map((bet) => (
                            <tr key={bet.id}><td>{bet.name}</td><td>{formatCurrency(bet.amount)}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="rules-card">
                <h4>How to Play Aviator</h4>
                <p><strong>1. Place Your Bet:</strong> Set your bet amount and an optional auto cash-out multiplier before the round begins.</p>
                <p><strong>2. Watch the Plane:</strong> As the plane flies higher, the prize multiplier increases.</p>
                <p><strong>3. Cash Out:</strong> Click "Cash Out" at any time to lock in your winnings at the current multiplier.</p>
                <p><strong>Warning:</strong> The plane can fly away at any moment! If it does before you cash out, you lose your stake.</p>
            </div>
        </div>
    );
}

export default AviatorGame;

