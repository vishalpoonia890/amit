import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './AviatorGame.css'; // Shared stylesheet for all game pages

// --- Sound Effect Imports (place these in your public folder) ---
const takeoffSoundSrc = '/sounds/aviator-takeoff.mp3';
const cashoutSoundSrc = '/sounds/aviator-cashout.mp3';
const crashSoundSrc = '/sounds/aviator-crash.mp3';


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
        takeoff: new Audio(takeoffSoundSrc),
        cashout: new Audio(cashoutSoundSrc),
        crash: new Audio(crashSoundSrc),
    });

    const [gameState, setGameState] = useState('waiting'); // waiting, betting, playing, crashed
    const [multiplier, setMultiplier] = useState(1.00);
    const [betAmount, setBetAmount] = useState(100);
    const [hasBet, setHasBet] = useState(false);
    const [canCashOut, setCanCashOut] = useState(false);
    const [cashOutMultiplier, setCashOutMultiplier] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [history, setHistory] = useState([]);
    const [liveBets, setLiveBets] = useState([]); // Mocked for now

    // --- Canvas Drawing Logic ---
    const draw = useCallback((ctx, planePosition) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        for (let i = 0; i < ctx.canvas.height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(ctx.canvas.width, i);
            ctx.stroke();
        }
        for (let i = 0; i < ctx.canvas.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, ctx.canvas.height);
            ctx.stroke();
        }

        // Draw the plane
        ctx.fillStyle = '#EF4444';
        ctx.font = '24px sans-serif';
        ctx.fillText('✈️', planePosition.x, planePosition.y);
    }, []);

    // --- Game Loop and Animation ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        const crashPoint = 3.5 + Math.random() * 5; // Crashes between 3.5x and 8.5x
        const startTime = Date.now();

        const animate = () => {
            const elapsedTime = (Date.now() - startTime) / 1000;
            const currentMultiplier = parseFloat((1 + elapsedTime * 0.5).toFixed(2));

            if (currentMultiplier >= crashPoint) {
                setGameState('crashed');
                audioRefs.current.takeoff.pause();
                audioRefs.current.crash.play();
                return;
            }

            setMultiplier(currentMultiplier);
            const progress = (currentMultiplier - 1) / (crashPoint - 1);
            const planeX = progress * (ctx.canvas.width - 40);
            const planeY = ctx.canvas.height - (progress * (ctx.canvas.height - 40)) - 20;

            draw(ctx, { x: planeX, y: planeY });
            animationFrameId = requestAnimationFrame(animate);
        };

        if (gameState === 'playing') {
            audioRefs.current.takeoff.currentTime = 0;
            audioRefs.current.takeoff.play();
            animate();
        } else {
            draw(ctx, { x: 10, y: ctx.canvas.height - 40 });
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, draw]);

    // --- Countdown and Round Management ---
    useEffect(() => {
        if (gameState === 'waiting' || gameState === 'crashed') {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setGameState('playing');
                        setHasBet(false);
                        setCanCashOut(false);
                        setCashOutMultiplier(null);
                        setMultiplier(1.00);
                        // Mock new live bets for the round
                        setLiveBets([
                            { name: 'R K.', amount: 500 }, { name: 'S P.', amount: 1200 },
                            { name: 'A V.', amount: 250 }, { name: 'M G.', amount: 2000 },
                        ]);
                        return 5;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);
    
    // --- Action Handlers ---
    const placeBet = () => {
        if (financialSummary.balance < betAmount) {
            alert("Insufficient balance.");
            return;
        }
        setHasBet(true);
        // API call to deduct balance would go here
    };

    const cashOut = () => {
        setCashOutMultiplier(multiplier);
        setHasBet(false);
        setCanCashOut(false);
        audioRefs.current.takeoff.pause();
        audioRefs.current.cashout.play();
        // API call to add winnings would go here
    };

    return (
        <div className="game-page-container aviator-theme">
            <button className="back-button" onClick={onBack}>← Back to Lobby</button>
            <div className="game-header">
                <h1>Aviator</h1>
            </div>
            
            <div className="history-bar">
                {/* In a real app, this data would be fetched via API */}
                {[2.34, 1.12, 5.89, 1.01, 10.45, 3.22, 1.56, 4.01].map((m, i) => (
                    <span key={i} className={m < 2 ? 'loss' : 'win'}>{m}x</span>
                ))}
            </div>

            <div className="aviator-display-area">
                <canvas ref={canvasRef} width="300" height="300" className="aviator-canvas"></canvas>
                <div className={`multiplier-display ${gameState}`}>
                    {gameState === 'playing' && `${multiplier}x`}
                    {gameState === 'crashed' && <span className="crashed-text">Flew Away @ {multiplier}x</span>}
                    {gameState === 'waiting' && `Starting in ${countdown}s...`}
                </div>
            </div>

            {cashOutMultiplier && (
                <div className="cashout-success-message">
                    You cashed out at {cashOutMultiplier}x and won {formatCurrency(betAmount * cashOutMultiplier)}!
                </div>
            )}

            <div className="aviator-controls">
                <div className="bet-input-group">
                    <span>₹</span>
                    <input type="number" value={betAmount} onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)} min="10" disabled={hasBet}/>
                </div>
                <div className="quick-bet-buttons">
                    {[100, 250, 500, 1000].map(amount => (
                        <button key={amount} onClick={() => setBetAmount(amount)} disabled={hasBet}>₹{amount}</button>
                    ))}
                </div>
                
                {(!hasBet && gameState !== 'playing') && (
                    <button className="action-button bet-button" onClick={placeBet}>
                        Place Bet for Next Round
                    </button>
                )}
                
                {(hasBet && gameState !== 'playing') && (
                    <button className="action-button bet-button" disabled>Waiting for Next Round</button>
                )}
                
                {(gameState === 'playing' && hasBet) && (
                     <button className="action-button cashout-button" onClick={cashOut}>
                        Cash Out {formatCurrency(betAmount * multiplier)}
                    </button>
                )}
            </div>
            
            <div className="live-bets-table">
                 <h4>Current Round Bets</h4>
                <table>
                    <thead><tr><th>Player</th><th>Bet Amount</th></tr></thead>
                    <tbody>
                        {liveBets.map((bet, i) => (
                            <tr key={i}>
                                <td>{bet.name}</td>
                                <td>{formatCurrency(bet.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="rules-card">
                <h4>How to Play Aviator</h4>
                <p><strong>1. Place Your Bet:</strong> Set your bet amount before the round begins.</p>
                <p><strong>2. Watch the Plane:</strong> As the plane flies higher, the multiplier increases.</p>
                <p><strong>3. Cash Out:</strong> Click "Cash Out" at any time to lock in your winnings at the current multiplier.</p>
                <p><strong>Warning:</strong> The plane can fly away at any moment! If it does before you cash out, you lose your stake. The higher you wait, the greater the risk and reward.</p>
            </div>
        </div>
    );
}

export default AviatorGame;

