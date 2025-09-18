import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './AviatorGame.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

const takeoffSound = new Audio('/sounds/aviator-takeoff.mp3');
const cashoutSound = new Audio('/sounds/aviator-cashout.mp3');
const crashSound = new Audio('/sounds/aviator-crash.mp3');
takeoffSound.volume = 0.3;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const generateHiddenUsers = () =>
  Array.from({ length: 100 }, (_, i) => ({
    id: `hidden-${i}`,
    name: "Hidden",
    amount: Math.floor(Math.random() * 1000) + 100,
    multiplier: "-",
    payout: "-"
  }));

// ---- BET PANEL ----
const BetPanel = ({ bet, setBet, gameState, placeBet, cancelBet, cashOut, currentMultiplier, startAutoBet, activeTab, setActiveTab }) => {
  const { amount, autoCashOut, hasBet, isQueued, cashedOut, cashOutMultiplier } = bet;

  const handleBetClick = () => {
    if (!hasBet && !isQueued) placeBet();
    else if (hasBet && !cashedOut && gameState === 'playing') cashOut(currentMultiplier);
    else if (isQueued) cancelBet();
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
    <div className="bet-panel">
      <div className="bet-panel-tabs">
        <button onClick={() => setActiveTab('manual')} className={activeTab === 'manual' ? 'active' : ''}>Manual</button>
        <button onClick={() => setActiveTab('auto')} className={activeTab === 'auto' ? 'active' : ''}>Auto</button>
      </div>

      <div className="bet-panel-body">
        {activeTab === 'manual' ? (
          <>
            <div className="input-group">
              <label>Bet Amount</label>
              <input type="number" value={amount} onChange={(e) => setBet('amount', parseInt(e.target.value) || 0)} disabled={hasBet || isQueued} />
            </div>
            <div className="input-group">
              <label>Cashout At</label>
              <input type="number" step="0.1" value={autoCashOut} onChange={(e) => setBet('autoCashOut', parseFloat(e.target.value) || null)} disabled={hasBet || isQueued} />
            </div>
            <button className={`action-button ${buttonState.className}`} onClick={handleBetClick} disabled={buttonState.disabled}>
              {buttonState.text}
            </button>
          </>
        ) : (
          <div className="auto-bet-options">
            <div className="auto-bet-input"><label>Number of Bets</label><input type="number" onChange={(e) => setBet('autoBets', parseInt(e.target.value) || 0)} /></div>
            <div className="auto-bet-input"><label>Stop on Profit</label><input type="number" onChange={(e) => setBet('stopProfit', parseInt(e.target.value) || 0)} /></div>
            <div className="auto-bet-input"><label>Stop on Loss</label><input type="number" onChange={(e) => setBet('stopLoss', parseInt(e.target.value) || 0)} /></div>
            
            {/* NEW: Increase/Decrease by % settings */}
            <div className="auto-bet-input"><label>On Loss Adjust (%)</label><input type="number" onChange={(e) => setBet('lossAdjust', parseInt(e.target.value) || 0)} /></div>
            <div className="auto-bet-input"><label>On Win Adjust (%)</label><input type="number" onChange={(e) => setBet('winAdjust', parseInt(e.target.value) || 0)} /></div>

            <button className="action-button bet-btn" onClick={startAutoBet}>Start Autobet</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- MAIN COMPONENT ----
function AviatorGame({ token }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("waiting");
  const [multiplier, setMultiplier] = useState(1.00);
  const [countdown, setCountdown] = useState(8);
  const [history, setHistory] = useState([]);
  const [liveBets, setLiveBets] = useState([]);
  const [roundId, setRoundId] = useState('');
  const [activeTab, setActiveTab] = useState('manual');

  const [bet, setBetState] = useState({
    amount: 100, autoCashOut: 2.0,
    hasBet: false, isQueued: false, cashedOut: false, cashOutMultiplier: null,
    autoBets: 0, stopProfit: 0, stopLoss: 0, profit: 0, loss: 0,
    lossAdjust: 0, winAdjust: 0
  });

  const setBet = (k, v) => setBetState(p => ({ ...p, [k]: v }));

  // --- Canvas graph draw ---
  const draw = useCallback((ctx, multiplier) => {
    const rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width = rect.width;
    ctx.canvas.height = rect.height;
    ctx.clearRect(0, 0, rect.width, rect.height);

    // margins
    const margin = 40;
    const width = rect.width - margin * 2;
    const height = rect.height - margin * 2;

    // draw axis
    ctx.strokeStyle = "#ccc";
    ctx.beginPath();
    ctx.moveTo(margin, rect.height - margin);
    ctx.lineTo(rect.width - margin, rect.height - margin);
    ctx.moveTo(margin, rect.height - margin);
    ctx.lineTo(margin, margin);
    ctx.stroke();

    // draw line curve (logarithmic like growth)
    ctx.strokeStyle = "#FBBF24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, rect.height - margin);

    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // time scale
      const x = margin + t * width;
      const y = rect.height - margin - Math.min(Math.log2(multiplier) * t * height, height);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // moving dot (plane)
    const progress = Math.min(1, multiplier / 50); // scale speed
    const planeX = margin + progress * width;
    const planeY = rect.height - margin - Math.min(Math.log2(multiplier) * progress * height, height);

    ctx.fillStyle = "#FBBF24";
    ctx.beginPath();
    ctx.arc(planeX, planeY, 8, 0, Math.PI * 2);
    ctx.fill();

    // multiplier text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 36px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(`${multiplier.toFixed(2)}x`, rect.width / 2, margin + 40);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    draw(ctx, multiplier);
  }, [draw, multiplier]);

  // --- Live Bets Fake Users ---
  useEffect(() => {
    setLiveBets(generateHiddenUsers());
  }, []);

  // --- Render ---
  return (
    <div className="aviator-page-container">
      <div className="aviator-main-box">
        {/* Bet panel left */}
        <div className="aviator-left">
          <BetPanel
            bet={bet} setBet={setBet}
            gameState={gameState} placeBet={() => setBet('isQueued', true)}
            cancelBet={() => setBet('isQueued', false)}
            cashOut={(m) => setBet('cashedOut', true) || setBet('cashOutMultiplier', m)}
            currentMultiplier={multiplier}
            startAutoBet={() => console.log("autobet start")}
            activeTab={activeTab} setActiveTab={setActiveTab}
          />

          {/* Hide live bets if auto mode */}
          {activeTab === "manual" && (
            <div className="aviator-live-bets-panel">
              <div className="live-bets-header">
                <h4>Live Bets</h4>
                <span className="total-bets">Total: {formatCurrency(liveBets.reduce((s, b) => s + (b.amount || 0), 0))}</span>
              </div>
              <div className="live-bets-scroll">
                <table>
                  <thead><tr><th>User</th><th>Bet</th><th>Multiplier</th><th>Payout</th></tr></thead>
                  <tbody>
                    {liveBets.map(b => (
                      <tr key={b.id}><td>{b.name}</td><td>{formatCurrency(b.amount)}</td><td>{b.multiplier}</td><td>{b.payout}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Crash graph right */}
        <div className="aviator-right">
          <canvas ref={canvasRef} className="aviator-canvas" />
          <div className={`multiplier-display ${gameState}`}>
            {gameState === "waiting" && `Starting in ${countdown}s...`}
            {gameState === "crashed" && `💥 Flew Away @ ${multiplier.toFixed(2)}x`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AviatorGame;
