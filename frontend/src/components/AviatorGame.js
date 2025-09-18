import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './AviatorGame.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Preload sounds ---
const takeoffSound = new Audio('/sounds/aviator-takeoff.mp3');
const cashoutSound = new Audio('/sounds/aviator-cashout.mp3');
const crashSound = new Audio('/sounds/aviator-crash.mp3');
takeoffSound.volume = 0.3;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// --- Dummy Hidden Users ---
const generateHiddenUsers = () => {
  return Array.from({ length: 100 }, (_, i) => ({
    id: `hidden-${i}`,
    name: "Hidden",
    amount: Math.floor(Math.random() * 1000) + 100,
    multiplier: "-",
    payout: "-"
  }));
};

// --- Bet Panel ---
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
              <div className="amount-input">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setBet('amount', parseInt(e.target.value) || 0)}
                  disabled={hasBet || isQueued}
                />
                <div className="amount-adjusters">
                  <button onClick={() => setBet('amount', Math.round(amount / 2))} disabled={hasBet || isQueued}>½</button>
                  <button onClick={() => setBet('amount', amount * 2)} disabled={hasBet || isQueued}>2x</button>
                </div>
              </div>
            </div>
            <div className="input-group">
              <label>Cashout At</label>
              <input
                type="number"
                step="0.1"
                value={autoCashOut}
                onChange={(e) => setBet('autoCashOut', parseFloat(e.target.value) || null)}
                disabled={hasBet || isQueued}
              />
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
            <button className="action-button bet-btn" onClick={startAutoBet}>Start Autobet</button>
          </div>
        )}
      </div>
    </div>
  );
};

function AviatorGame({ token }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("waiting");
  const [multiplier, setMultiplier] = useState(1.00);
  const [countdown, setCountdown] = useState(8);
  const [history, setHistory] = useState([]);
  const [liveBets, setLiveBets] = useState([]);
  const [roundId, setRoundId] = useState('');
  const [activeTab, setActiveTab] = useState('manual');

  // --- Only one bet ---
  const [bet, setBetState] = useState({
    amount: 100,
    autoCashOut: 2.0,
    hasBet: false,
    isQueued: false,
    cashedOut: false,
    cashOutMultiplier: null,
    autoBets: 0,
    stopProfit: 0,
    stopLoss: 0,
    profit: 0,
    loss: 0
  });

  const setBet = (key, value) => setBetState(prev => ({ ...prev, [key]: value }));

  // --- Drawing on canvas ---
  const draw = useCallback((ctx, multiplier) => {
    const rect = ctx.canvas.getBoundingClientRect();
    ctx.canvas.width = rect.width;
    ctx.canvas.height = rect.height;
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = "#FBBF24";
    ctx.beginPath();
    ctx.arc(rect.width / 2, rect.height / 2, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(`${multiplier.toFixed(2)}x`, rect.width / 2, rect.height / 2);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    draw(ctx, multiplier);
  }, [draw, multiplier]);

  // --- Fetching state ---
  useEffect(() => {
    const fetchState = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/aviator/state`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data.gameState !== gameState) setGameState(data.gameState);
        if (data.roundId !== roundId) {
          setRoundId(data.roundId);
          setBetState(p => ({ ...p, hasBet: p.isQueued, isQueued: false, cashedOut: false, cashOutMultiplier: null }));
        }
        setCountdown(data.countdown);

        // Smooth multiplier increase
        if (data.gameState === "playing") {
          setMultiplier(prev => parseFloat((prev + 0.01).toFixed(2)));
        } else {
          setMultiplier(data.multiplier);
        }

      } catch (error) { console.error(error); }
    };
    const interval = setInterval(fetchState, 100);
    return () => clearInterval(interval);
  }, [token, gameState, roundId]);

  // --- Place / Cashout / Cancel ---
  const placeBet = () => setBet('isQueued', true);
  const cancelBet = () => setBet('isQueued', false);
  const cashOut = (currentMultiplier) => {
    cashoutSound.play();
    if (!bet.cashedOut) {
      setBet('cashedOut', true);
      setBet('cashOutMultiplier', currentMultiplier);
    }
  };

  // --- AutoBet Logic ---
  const startAutoBet = () => {
    if (bet.autoBets > 0) {
      placeBet();
    }
  };

  // --- Fake hidden users ---
  useEffect(() => {
    setLiveBets(generateHiddenUsers());
  }, []);

  return (
    <div className="aviator-page-container">
      <div className="aviator-main-box">
        {activeTab === "manual" ? (
          <>
            {/* Left side: bet + live bets */}
            <div className="aviator-left">
              <BetPanel
                bet={bet}
                setBet={setBet}
                gameState={gameState}
                placeBet={placeBet}
                cancelBet={cancelBet}
                cashOut={cashOut}
                currentMultiplier={multiplier}
                startAutoBet={startAutoBet}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <div className="aviator-live-bets-panel">
                <div className="live-bets-header">
                  <h4>Live Bets</h4>
                  <span className="total-bets">
                    Total: {formatCurrency(liveBets.reduce((sum, b) => sum + (b.amount || 0), 0))}
                  </span>
                </div>
                <div className="live-bets-scroll">
                  <table>
                    <thead>
                      <tr><th>User</th><th>Bet</th><th>Multiplier</th><th>Payout</th></tr>
                    </thead>
                    <tbody>
                      {liveBets.map(b => (
                        <tr key={b.id}>
                          <td>{b.name}</td>
                          <td>{formatCurrency(b.amount)}</td>
                          <td>{b.multiplier}</td>
                          <td>{b.payout}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right side: crash game */}
            <div className="aviator-right">
              <div className="history-bar">
                {history.slice(0, 20).map(h => (
                  <span key={h.id} className={h.crash_multiplier > 1.99 ? "win" : "loss"}>
                    {h.crash_multiplier}x
                  </span>
                ))}
              </div>
              <div className="aviator-display-area">
                <canvas ref={canvasRef} className="aviator-canvas" />
                <div className={`multiplier-display ${gameState}`}>
                  {gameState === "waiting" && `Starting in ${countdown}s...`}
                  {gameState === "crashed" && `💥 Flew Away @ ${multiplier.toFixed(2)}x`}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Auto mode layout */}
            <div className="aviator-left">
              <BetPanel
                bet={bet}
                setBet={setBet}
                gameState={gameState}
                placeBet={placeBet}
                cancelBet={cancelBet}
                cashOut={cashOut}
                currentMultiplier={multiplier}
                startAutoBet={startAutoBet}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            <div className="aviator-right">
              <div className="history-bar">
                {history.slice(0, 20).map(h => (
                  <span key={h.id} className={h.crash_multiplier > 1.99 ? "win" : "loss"}>
                    {h.crash_multiplier}x
                  </span>
                ))}
              </div>
              <div className="aviator-display-area">
                <canvas ref={canvasRef} className="aviator-canvas" />
                <div className={`multiplier-display ${gameState}`}>
                  {gameState === "waiting" && `Starting in ${countdown}s...`}
                  {gameState === "crashed" && `💥 Flew Away @ ${multiplier.toFixed(2)}x`}
                </div>
              </div>
            </div>

            {/* Live bets below the box */}
            <div className="aviator-live-bets-panel full-width">
              <div className="live-bets-header">
                <h4>Live Bets</h4>
                <span className="total-bets">
                  Total: {formatCurrency(liveBets.reduce((sum, b) => sum + (b.amount || 0), 0))}
                </span>
              </div>
              <div className="live-bets-scroll">
                <table>
                  <thead>
                    <tr><th>User</th><th>Bet</th><th>Multiplier</th><th>Payout</th></tr>
                  </thead>
                  <tbody>
                    {liveBets.map(b => (
                      <tr key={b.id}>
                        <td>{b.name}</td>
                        <td>{formatCurrency(b.amount)}</td>
                        <td>{b.multiplier}</td>
                        <td>{b.payout}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- Crash Game Description --- */}
      <div className="aviator-description">
        <h3>About Crash</h3>
        <p>
          Crash is a multiplayer betting game where a multiplier starts at 1.00x and keeps rising. At a random moment,
          the multiplier will crash, and the round ends instantly.
        </p>

        <h3>How to Play</h3>
        <ul>
          <li>Choose your bet amount before the round starts.</li>
          <li>Watch the multiplier increase in real-time.</li>
          <li>Click <b>Cash Out</b> before the crash to secure your winnings.</li>
          <li>If the game crashes before you cash out, you lose your bet.</li>
          <li>Use AutoBet to play multiple rounds automatically with profit/loss limits.</li>
        </ul>
      </div>
    </div>
  );
}

export default AviatorGame;
