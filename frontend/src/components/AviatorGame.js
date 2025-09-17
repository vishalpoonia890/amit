// src/components/AviatorGame.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AviatorGame.css';

// 🎵 Preload audio files
const takeoffSound = new Audio('/sounds/aviator-takeoff.mp3');
const crashSound = new Audio('/sounds/aviator-crash.mp3');
const cashoutSound = new Audio('/sounds/aviator-cashout.mp3');

// 📊 Currency formatter
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

function AviatorGame({ onBack }) {
  const canvasRef = useRef(null);

  // 🎮 Game states
  const [gameState, setGameState] = useState("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [betAmount, setBetAmount] = useState(100);
  const [autoCashOut, setAutoCashOut] = useState(2.0);

  // 💰 Bet states
  const [hasBet, setHasBet] = useState(false);
  const [queuedBet, setQueuedBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(null);

  // 📜 Tracking
  const [countdown, setCountdown] = useState(8);
  const [history, setHistory] = useState([]);
  const [liveBets, setLiveBets] = useState([]);

  // ✈️ Draw plane + trail
  const draw = useCallback((ctx, pos, trail) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Trail
    trail.forEach(p => {
      ctx.fillStyle = `rgba(239, 68, 68, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Plane
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.angle);
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-15, 10);
    ctx.lineTo(-15, -10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, []);

  // 🎞️ Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let trail = [];
    let crashPoint = 1.5 + Math.random() * 6; // random crash
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const currentMult = parseFloat((1 + elapsed * 0.3 + elapsed ** 2 * 0.03).toFixed(2));

      if (currentMult >= crashPoint) {
        setHistory(h => [{ id: Date.now(), crash: currentMult }, ...h.slice(0, 9)]);
        setGameState("crashed");
        crashSound.play();
        return;
      }

      setMultiplier(currentMult);

      // Plane position
      const x = 40 + Math.min(elapsed / 6, 1) * (ctx.canvas.width - 80);
      const y = ctx.canvas.height - 60 - Math.pow(elapsed / 3, 2) * 100;
      const angle = -0.3;

      // Trail effect
      trail.push({ x: x - 10, y, size: Math.random() * 2 + 1, opacity: 1 });
      trail = trail.map(p => ({ ...p, opacity: p.opacity - 0.02, size: p.size * 0.97 })).filter(p => p.opacity > 0);

      // Auto cashout
      if (hasBet && !cashedOut && autoCashOut && currentMult >= autoCashOut) {
        cashOut(currentMult);
      }

      draw(ctx, { x, y, angle }, trail);
      animationId = requestAnimationFrame(animate);
    };

    if (gameState === "playing") {
      takeoffSound.play();
      animate();
    } else {
      draw(ctx, { x: 30, y: ctx.canvas.height - 50, angle: 0 }, []);
    }

    return () => cancelAnimationFrame(animationId);
  }, [gameState, draw, hasBet, cashedOut, autoCashOut]);

  // 🕑 Round cycle
  useEffect(() => {
    if (gameState === "waiting" || gameState === "crashed") {
      let timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timer);
            setGameState("betting");
            setHasBet(false);
            setCashedOut(false);
            setCashOutMultiplier(null);
            setMultiplier(1.0);

            // Apply queued bet
            if (queuedBet) {
              setHasBet(true);
              setQueuedBet(false);
            }

            // Fake bets
            setLiveBets([
              { id: 1, name: "Rahul", amount: 200 },
              { id: 2, name: "Priya", amount: 500 }
            ]);

            setTimeout(() => setGameState("playing"), 1500);
            return 8;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, queuedBet]);

  // 🎲 Bet actions
  const placeBet = () => {
    if (gameState === "playing") {
      setQueuedBet(true);
    } else {
      setHasBet(true);
    }
  };

  const cashOut = (mult) => {
    if (cashedOut) return;
    setCashOutMultiplier(mult);
    setCashedOut(true);
    setHasBet(false);
    cashoutSound.play();
  };

  return (
    <div className="aviator-container">
      <button onClick={onBack} className="back-btn">← Back</button>
      <h2>✈️ Aviator</h2>

      {/* History */}
      <div className="history-bar">
        {history.map(h => (
          <span key={h.id} className={h.crash > 2 ? "win" : "loss"}>
            {h.crash}x
          </span>
        ))}
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width="320" height="240" className="aviator-canvas" />

      {/* Multiplier display */}
      <div className={`multiplier ${gameState}`}>
        {gameState === "playing" && `${multiplier}x`}
        {gameState === "waiting" && `Next round in ${countdown}s`}
        {gameState === "crashed" && `💥 Flew Away @ ${multiplier}x`}
      </div>

      {/* Cashout message */}
      {cashOutMultiplier && (
        <p className="cashout-msg">
          ✅ You cashed out at {cashOutMultiplier}x → Won {formatCurrency(betAmount * cashOutMultiplier)}
        </p>
      )}

      {/* Bet Controls */}
      <div className="bet-controls">
        <input
          type="number"
          min="10"
          value={betAmount}
          disabled={hasBet}
          onChange={(e) => setBetAmount(Number(e.target.value))}
        />
        <input
          type="number"
          step="0.1"
          value={autoCashOut}
          onChange={(e) => setAutoCashOut(parseFloat(e.target.value) || null)}
          placeholder="Auto cashout"
        />

        {(!hasBet && (gameState === "waiting" || gameState === "betting")) && (
          <button onClick={placeBet} className="bet-btn">Bet</button>
        )}

        {(gameState === "playing" && hasBet && !cashedOut) && (
          <button onClick={() => cashOut(multiplier)} className="cashout-btn">
            Cash Out ({formatCurrency(betAmount * multiplier)})
          </button>
        )}

        {(gameState === "playing" && !hasBet && !queuedBet) && (
          <button onClick={placeBet} className="next-bet-btn">Bet (Next Round)</button>
        )}

        {queuedBet && <p className="queued-msg">✅ Bet queued for next round</p>}
      </div>

      {/* Live bets */}
      <div className="live-bets">
        <h4>💸 Current Bets</h4>
        <table>
          <thead><tr><th>User</th><th>Bet</th></tr></thead>
          <tbody>
            {liveBets.map(b => (
              <tr key={b.id}><td>{b.name}</td><td>{formatCurrency(b.amount)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rules */}
      <div className="rules">
        <h4>📖 How to Play</h4>
        <p>1. Place a bet before the round starts.</p>
        <p>2. Watch the plane fly up — multiplier rises!</p>
        <p>3. Cash out before it crashes to win.</p>
        <p>4. If you don’t cash out → you lose your bet.</p>
      </div>
    </div>
  );
}

export default AviatorGame;
