import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './AviatorGame.css';
import { AutoCashOutIcon } from './Icons';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Preload audio files ---
const takeoffSound = new Audio('/sounds/aviator-takeoff.mp3');
const cashoutSound = new Audio('/sounds/aviator-cashout.mp3');
const crashSound = new Audio('/sounds/aviator-crash.mp3');
takeoffSound.volume = 0.3;

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// --- Reusable Bet Panel Component ---
const BetPanel = ({ betId, gameState, placeBet, cancelBet, cashOut, bet, setBet, currentMultiplier }) => {
    const [activeTab, setActiveTab] = useState('manual');
    const { amount, autoCashOut, hasBet, isQueued, cashedOut, cashOutMultiplier } = bet;

    const handleBetClick = () => {
        if (!hasBet && !isQueued) placeBet(betId);
        else if (hasBet && !cashedOut && gameState === 'playing') cashOut(betId, currentMultiplier);
        else if (isQueued) cancelBet(betId);
    };

    const getButtonState = () => {
        if (isQueued) return { text: 'Bet (Next Round)', className: 'waiting-btn', disabled: false };
        if (hasBet) {
            if (cashedOut) return { text: `Cashed Out @ ${cashOutMultiplier}x`, className: 'cashed-out-btn', disabled: true };
            if (gameState === 'playing') return { text: `Cash Out ${formatCurrency(amount * currentMultiplier)}`, className: 'cashout-btn', disabled: false };
            return { text: 'Waiting for Next Round', className: 'waiting-btn', disabled: true };
        }
        const text = (gameState === 'playing' || gameState === 'crashed') ? 'Bet (Next Round)' : 'Bet';
        return { text, className: 'bet-btn', disabled: false };
    };
    
    const buttonState = getButtonState();

    return (
        <div className={`bet-panel ${hasBet || isQueued ? 'bet-placed' : ''}`}>
            <div className="bet-panel-tabs">
                <button onClick={() => setActiveTab('manual')} className={activeTab === 'manual' ? 'active' : ''}>Manual</button>
                <button onClick={() => setActiveTab('auto')} className={activeTab === 'auto' ? 'active' : ''}>Auto</button>
            </div>
            <div className="bet-panel-body">
                {activeTab === 'manual' ? (
                    <>
                        <div className="input-group">
                            <label>Bet Amount</label>
                            <div className="amount-input">
                                <input type="number" value={amount} onChange={(e) => setBet(betId, 'amount', parseInt(e.target.value) || 0)} disabled={hasBet || isQueued} />
                                <div className="amount-adjusters">
                                    <button onClick={() => setBet(betId, 'amount', Math.round(amount / 2))} disabled={hasBet || isQueued}>½</button>
                                    <button onClick={() => setBet(betId, 'amount', amount * 2)} disabled={hasBet || isQueued}>2x</button>
                                </div>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Cashout At</label>
                            <div className="cashout-input">
                                <input type="number" step="0.1" value={autoCashOut} onChange={(e) => setBet(betId, 'autoCashOut', parseFloat(e.target.value) || null)} placeholder="Auto" disabled={hasBet || isQueued} />
                            </div>
                        </div>
                         <button className={`action-button ${buttonState.className}`} onClick={handleBetClick} disabled={buttonState.disabled}>{buttonState.text}</button>
                    </>
                ) : (
                    <div className="auto-bet-options">
                        <div className="auto-bet-input"><label>Number of Bets</label><input type="number" placeholder="∞" /></div>
                        <div className="auto-bet-input"><label>On Win</label><input type="number" placeholder="Increase by 0%" /></div>
                        <div className="auto-bet-input"><label>On Loss</label><input type="number" placeholder="Increase by 0%" /></div>
                        <div className="auto-bet-input"><label>Stop on Profit</label><input type="number" placeholder="₹0.00" /></div>
                        <div className="auto-bet-input"><label>Stop on Loss</label><input type="number" placeholder="₹0.00" /></div>
                        <button className="action-button bet-btn">Start Autobet</button>
                    </div>
                )}
            </div>
        </div>
    );
};


function AviatorGame({ token, onBack }) {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState("waiting");
    const [multiplier, setMultiplier] = useState(1.00);
    const [countdown, setCountdown] = useState(8);
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
        const dpr = window.devicePixelRatio || 1;
        const rect = ctx.canvas.getBoundingClientRect();
        if (ctx.canvas.width !== rect.width * dpr || ctx.canvas.height !== rect.height * dpr) {
            ctx.canvas.width = rect.width * dpr;
            ctx.canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        const maxMultiplierVisual = 10;
        const progress = Math.min((multiplier - 1) / (maxMultiplierVisual - 1), 1);

        const startX = 40, startY = rect.height - 40;
        const endX = startX + progress * (rect.width - 80);
        const endY = startY - Math.pow(progress, 2) * (rect.height - 80);

        const gradient = ctx.createLinearGradient(0, startY, 0, endY);
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0)');
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0.4)');

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + (endX - startX) * 0.5, startY, endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + (endX - startX) * 0.5, startY, endX, endY);
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(endX, endY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FBBF24';
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#a0aec0';
        ctx.font = '10px sans-serif';
        [1.0, 1.5, 2.0, 2.5, 3.0, 3.5].forEach(val => {
            const yPos = startY - (((val - 1) / (maxMultiplierVisual - 1)) * (startY - 40));
            ctx.fillText(`${val.toFixed(1)}x`, 5, yPos + 3);
        });
        [4, 9, 13, 18].forEach(val => {
            const xPos = startX + ((val / 20) * (rect.width - 80));
            ctx.fillText(`${val}s`, xPos - 10, startY + 15);
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        draw(ctx, multiplier);
    }, [draw, multiplier]);

    useEffect(() => {
        const fetchState = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/aviator/state`, { headers: { Authorization: `Bearer ${token}` } });
                
                if (data.gameState !== gameState) setGameState(data.gameState);
                if (data.multiplier !== multiplier) setMultiplier(data.multiplier);
                if (data.roundId !== roundId) {
                    setRoundId(data.roundId);
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
        if (betId === 1 && !bet1.cashedOut) {
            updateBetState(1, 'cashedOut', true);
            updateBetState(1, 'cashOutMultiplier', currentMultiplier);
        }
        if (betId === 2 && !bet2.cashedOut) {
            updateBetState(2, 'cashedOut', true);
            updateBetState(2, 'cashOutMultiplier', currentMultiplier);
        }
    };
    
    const commonProps = { gameState, placeBet, cancelBet, cashOut, currentMultiplier: multiplier };

    return (
        <div className="aviator-page-container">
            <div className="aviator-main-grid">
                <div className="aviator-side-panel">
                    <BetPanel betId={1} {...{...commonProps, bet: bet1, setBet: updateBetState}} />
                    <div className="aviator-live-bets-panel">
                        <h4>Live Bets</h4>
                        <table>
                            <thead><tr><th>User</th><th>Bet</th><th>Multiplier</th><th>Payout</th></tr></thead>
                            <tbody>
                                {liveBets.map(b => ( <tr key={b.id}><td>{b.name}</td><td>{formatCurrency(b.amount)}</td><td>-</td><td>-</td></tr> ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="aviator-game-area">
                    <div className="history-bar">
                        {history.slice(0, 20).map(h => ( <span key={h.id} className={h.crash_multiplier > 1.99 ? "win" : "loss"}>{h.crash_multiplier}x</span> ))}
                    </div>
                    <div className="aviator-display-area">
                        <canvas ref={canvasRef} className="aviator-canvas" />
                        <div className={`multiplier-display ${gameState}`}>
                            {gameState === "playing" && `${multiplier.toFixed(2)}x`}
                            {(gameState === "waiting" || gameState === "betting") && `Starting in ${countdown}s...`}
                            {gameState === "crashed" && `💥 Flew Away @ ${multiplier.toFixed(2)}x`}
                        </div>
                    </div>
                </div>
            </div>
            <div className="aviator-controls-grid">
                <BetPanel betId={2} {...{...commonProps, bet: bet2, setBet: updateBetState}} />
            </div>
        </div>
    );
}

export default AviatorGame;

