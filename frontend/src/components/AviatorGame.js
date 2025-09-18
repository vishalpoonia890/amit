import React, { useState, useEffect, useRef, useCallback } from "react";
import "./AviatorGame.css";
import { AutoCashOutIcon } from "./Icons";

/*
  AviatorGame.jsx
  - Works standalone with a built-in simulator if no API token is provided.
  - If you have a backend API, you can keep using your axios logic; this demo uses local simulation by default.
  - Sound files: the demo references /sounds/*.mp3 — add your sound files in public/sounds or change paths.
*/

const DEFAULT_START_COUNTDOWN = 8;

// --- simple audio helpers (optional) ---
const mkAudio = (src, vol = 0.3) => {
  try {
    const a = new Audio(src);
    a.volume = vol;
    return a;
  } catch {
    return { play: () => {}, pause: () => {}, currentTime: 0 };
  }
};
const takeoffSound = mkAudio("/sounds/aviator-takeoff.mp3", 0.2);
const cashoutSound = mkAudio("/sounds/aviator-cashout.mp3", 0.35);
const crashSound = mkAudio("/sounds/aviator-crash.mp3", 0.35);

const formatCurrencyINR = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    amount
  );

/* ----------------------
   Small reusable BetPanel
   ---------------------- */
const BetPanel = ({
  betId,
  bet,
  setBet,
  placeBet,
  cancelBet,
  cashOut,
  gameState,
  currentMultiplier,
}) => {
  const [activeTab, setActiveTab] = useState("manual");
  const { amount, autoCashOut, hasBet, isQueued, cashedOut, cashOutMultiplier } =
    bet;

  const handleBetClick = () => {
    if (!hasBet && !isQueued) placeBet(betId);
    else if (isQueued) cancelBet(betId);
    else if (hasBet && !cashedOut && gameState === "playing") cashOut(betId);
  };

  const getButtonState = () => {
    if (isQueued) return { text: "Bet (Next Round)", className: "waiting-btn" };
    if (hasBet) {
      if (cashedOut)
        return { text: `Cashed @ ${(+cashOutMultiplier).toFixed(2)}x`, className: "cashed-out-btn" };
      if (gameState === "playing")
        return {
          text: `Cashout ${formatCurrencyINR(amount * currentMultiplier)}`,
          className: "cashout-btn",
        };
      return { text: "Waiting for Next Round", className: "waiting-btn" };
    }
    return { text: gameState === "playing" ? "Bet (Next Round)" : "Bet", className: "bet-btn" };
  };

  const bs = getButtonState();

  return (
    <div className={`bet-panel ${hasBet || isQueued ? "bet-placed" : ""}`}>
      <div className="bet-panel-tabs">
        <button onClick={() => setActiveTab("manual")} className={activeTab === "manual" ? "active" : ""}>
          Manual
        </button>
        <button onClick={() => setActiveTab("auto")} className={activeTab === "auto" ? "active" : ""}>
          Auto
        </button>
      </div>

      <div className="bet-panel-body">
        {activeTab === "manual" ? (
          <>
            <div className="input-group">
              <label>Bet Amount</label>
              <div className="amount-input">
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setBet(betId, "amount", parseInt(e.target.value || 0))}
                  disabled={hasBet || isQueued}
                />
                <div className="amount-adjusters">
                  <button onClick={() => setBet(betId, "amount", Math.max(1, Math.round(amount / 2)))} disabled={hasBet || isQueued}>½</button>
                  <button onClick={() => setBet(betId, "amount", Math.round(amount * 2))} disabled={hasBet || isQueued}>2x</button>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Cashout At</label>
              <div className="cashout-input">
                <div className="cashout-with-icon">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Auto"
                    value={autoCashOut === null ? "" : autoCashOut}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      setBet(betId, "autoCashOut", v === "" ? null : parseFloat(v));
                    }}
                    disabled={hasBet || isQueued}
                  />
                  <span className="auto-icon" title="Auto cashout"><AutoCashOutIcon /></span>
                </div>
              </div>
            </div>

            <button className={`action-button ${bs.className}`} onClick={handleBetClick}>
              {bs.text}
            </button>
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

/* ----------------------
   Main AviatorGame
   ---------------------- */
export default function AviatorGame({ token = null /* optional: if you use API */ }) {
  // local UI state
  const [gameState, setGameState] = useState("waiting"); // waiting -> betting -> playing -> crashed
  const [countdown, setCountdown] = useState(DEFAULT_START_COUNTDOWN);
  const [multiplier, setMultiplier] = useState(1.0);
  const [history, setHistory] = useState([]); // array of crash multipliers
  const [liveBets, setLiveBets] = useState([]);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const simRef = useRef({
    // internal simulator control
    crashAt: 0,
    startTs: 0,
    playing: false,
  });

  // two sample bets (left + bottom)
  const [bet1, setBet1State] = useState({
    amount: 100,
    autoCashOut: 2.0,
    hasBet: false,
    isQueued: false,
    cashedOut: false,
    cashOutMultiplier: null,
  });
  const [bet2, setBet2State] = useState({
    amount: 100,
    autoCashOut: 2.0,
    hasBet: false,
    isQueued: false,
    cashedOut: false,
    cashOutMultiplier: null,
  });

  const setBet = (id, key, value) => {
    if (id === 1) setBet1State((p) => ({ ...p, [key]: value }));
    else setBet2State((p) => ({ ...p, [key]: value }));
  };

  // place / cancel / cashout
  const placeBet = (betId) => {
    if (gameState === "playing") {
      // queue for next round
      if (betId === 1) setBet(1, "isQueued", true);
      else setBet(2, "isQueued", true);
    } else {
      if (betId === 1) setBet(1, "hasBet", true);
      else setBet(2, "hasBet", true);
    }
  };
  const cancelBet = (betId) => {
    setBet(betId, "isQueued", false);
  };

  const doCashOut = (betId) => {
    const cur = multiplier;
    cashoutSound.play();
    if (betId === 1 && !bet1.cashedOut && bet1.hasBet) {
      setBet(1, "cashedOut", true);
      setBet(1, "cashOutMultiplier", cur);
      // optionally update liveBets/payouts
    }
    if (betId === 2 && !bet2.cashedOut && bet2.hasBet) {
      setBet(2, "cashedOut", true);
      setBet(2, "cashOutMultiplier", cur);
    }
  };

  // When round starts: move queued bets to active bets
  const startRoundApplyQueued = () => {
    if (bet1.isQueued) setBet(1, "hasBet", true);
    if (bet2.isQueued) setBet(2, "hasBet", true);
    if (bet1.isQueued) setBet(1, "isQueued", false);
    if (bet2.isQueued) setBet(2, "isQueued", false);

    // reset cashedOut state for active bets
    setBet(1, "cashedOut", false);
    setBet(1, "cashOutMultiplier", null);
    setBet(2, "cashedOut", false);
    setBet(2, "cashOutMultiplier", null);
  };

  // -------------------------
  // Local simulator (no backend)
  // -------------------------
  // random crash generator: returns multiplier > 1.0
  const sampleCrashMultiplier = () => {
    // heavy tail: chance for big multipliers
    const r = Math.random();
    if (r > 0.99) return (Math.random() * 200 + 50); // jackpot rare
    if (r > 0.95) return (Math.random() * 15 + 5);
    return +(1.0 + Math.pow(Math.random(), 1.6) * 4).toFixed(2);
  };

  // run one simulated round:
  const startSimRound = () => {
    const crashAt = sampleCrashMultiplier();
    simRef.current.crashAt = crashAt;
    simRef.current.startTs = performance.now();
    simRef.current.playing = true;

    // reset UI flags & play sound
    setMultiplier(1.0);
    setGameState("playing");
    takeoffSound.play();

    // animate multiplier: we'll update via raf loop
    const start = performance.now();
    const durationEstimate = 7000; // just for pacing of visual
    const animate = (t) => {
      const elapsed = t - start;
      // simple exponential growth function for visual (feel like real crash games)
      // we want multiplier to increase slowly at first then faster
      // formula: 1 + a * (e^(k * elapsed_ms) - 1)
      const k = 0.00055;
      const a = 1.2;
      let m = 1 + a * (Math.exp(k * elapsed) - 1);
      // clamp to some huge number but not too huge
      if (m > 300) m = 300;
      setMultiplier((prev) => {
        // also ensure monotonic
        if (m > prev) return m;
        return prev;
      });

      // handle auto cashouts
      if (bet1.hasBet && !bet1.cashedOut && bet1.autoCashOut && m >= bet1.autoCashOut) {
        setBet(1, "cashedOut", true);
        setBet(1, "cashOutMultiplier", +m.toFixed(2));
        cashoutSound.play();
      }
      if (bet2.hasBet && !bet2.cashedOut && bet2.autoCashOut && m >= bet2.autoCashOut) {
        setBet(2, "cashedOut", true);
        setBet(2, "cashOutMultiplier", +m.toFixed(2));
        cashoutSound.play();
      }

      // crash condition
      if (m >= simRef.current.crashAt) {
        // crash!
        simRef.current.playing = false;
        setMultiplier(simRef.current.crashAt);
        setGameState("crashed");
        crashSound.play();
        // add to history
        setHistory((h) => [simRef.current.crashAt, ...h].slice(0, 100));
        // clear active bets
        setBet(1, "hasBet", false);
        setBet(1, "isQueued", false);
        setBet(2, "hasBet", false);
        setBet(2, "isQueued", false);
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  // countdown loop (runs in background)
  useEffect(() => {
    let cd = DEFAULT_START_COUNTDOWN;
    setCountdown(cd);
    setGameState("betting");

    const tick = () => {
      cd -= 1;
      if (cd <= 0) {
        // start playing round
        setCountdown(0);
        setGameState("playing");
        startRoundApplyQueued();
        startSimRound();
        // after crash, schedule new round after short pause
        // handled in effect that watches gameState -> crashed
      } else {
        setCountdown(cd);
        setTimeout(tick, 1000);
      }
    };

    const timeout = setTimeout(tick, 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // when gameState becomes crashed -> start a new betting countdown after short delay
  useEffect(() => {
    if (gameState === "crashed") {
      // small delay so users see the crash
      const t = setTimeout(() => {
        setGameState("betting");
        setCountdown(DEFAULT_START_COUNTDOWN);
        // schedule countdown ticks
        let cd = DEFAULT_START_COUNTDOWN;
        const tick = () => {
          cd -= 1;
          if (cd <= 0) {
            setCountdown(0);
            setGameState("playing");
            startRoundApplyQueued();
            startSimRound();
          } else {
            setCountdown(cd);
            setTimeout(tick, 1000);
          }
        };
        setTimeout(tick, 1000);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [gameState]);

  // draw canvas curve
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ctx.clearRect(0, 0, rect.width, rect.height);

    // baseline & labels
    const padding = 40;
    const startX = padding;
    const startY = rect.height - padding;
    const usableW = rect.width - padding * 2;
    const usableH = rect.height - padding * 2;

    // visual scale: map multiplier to x (we will show until either multiplier or maxVisual)
    const maxVisual = Math.max(6, Math.min(50, multiplier * 1.5));
    const progress = Math.min((multiplier - 1) / (maxVisual - 1), 1);
    const endX = startX + progress * usableW;
    const endY = startY - Math.pow(progress, 1.7) * usableH;

    // gradient fill under curve
    const grad = ctx.createLinearGradient(0, startY, 0, endY);
    grad.addColorStop(0, "rgba(251,191,36, 0.0)");
    grad.addColorStop(1, "rgba(251,191,36, 0.18)");

    // path
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + (endX - startX) * 0.6, startY, endX, endY);
    ctx.lineTo(endX, startY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // stroke line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + (endX - startX) * 0.6, startY, endX, endY);
    ctx.strokeStyle = "#FBBF24";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();

    // dot
    ctx.beginPath();
    ctx.arc(endX, endY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#FBBF24";
    ctx.shadowColor = "#FBBF24";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // y labels (multipliers)
    ctx.fillStyle = "#9AA9B2";
    ctx.font = "11px Inter, sans-serif";
    const labelMultipliers = [1.0, 1.2, 1.5, 2, 3, 5].filter((m) => m <= maxVisual);
    labelMultipliers.forEach((m, i) => {
      const p = (m - 1) / (maxVisual - 1);
      const y = startY - Math.pow(p, 1.7) * usableH + 3;
      ctx.fillText(`${m.toFixed(2)}x`, 8, y);
    });

    // seconds tick markers along bottom — just decorative
    ctx.fillStyle = "#9AA9B2";
    for (let s = 2; s <= 20; s += 2) {
      const x = startX + (s / 20) * usableW;
      ctx.fillText(`${s}s`, x - 8, startY + 16);
    }
  }, [multiplier]);

  useEffect(() => {
    draw();
  }, [draw, multiplier, gameState]);

  // small auto-cashout listener: if multiplier passes user's autoCashOut (handled in simulation)
  // For demo, we don't contact backend.

  // small live bets table mock (purely cosmetic)
  useEffect(() => {
    // create a few fake live bets
    const mock = [
      { id: 1, name: "Hidden", amount: 754.71 },
      { id: 2, name: "Hidden", amount: 470.05 },
      { id: 3, name: "Pradeep", amount: 26_146.32 },
    ];
    setLiveBets(mock);
  }, []);

  // small helper to display multiplier text in big center
  const multiplierDisplayText = () => {
    if (gameState === "playing") return `${multiplier.toFixed(2)}x`;
    if (gameState === "betting" || gameState === "waiting") return `Starting in ${countdown}s...`;
    if (gameState === "crashed") return `💥 Flew Away @ ${multiplier.toFixed(2)}x`;
    return "";
  };

  // UI common props
  const commonProps = {
    gameState,
    placeBet,
    cancelBet,
    cashOut: doCashOut,
    currentMultiplier: multiplier,
  };

  return (
    <div className="aviator-page-container">
      <div className="aviator-main-grid">
        <div className="aviator-side-panel">
          <BetPanel betId={1} bet={bet1} setBet={setBet} {...commonProps} />
          <div className="aviator-live-bets-panel">
            <h4>Live Bets</h4>
            <table>
              <thead>
                <tr><th>User</th><th>Bet</th><th>Multiplier</th><th>Payout</th></tr>
              </thead>
              <tbody>
                {liveBets.map((b) => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{formatCurrencyINR(b.amount)}</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="aviator-game-area">
          <div className="history-bar">
            {history.map((h, i) => (
              <span key={i} className={h > 1.99 ? "win" : "loss"}>{h.toFixed(2)}x</span>
            ))}
          </div>

          <div className="aviator-display-area">
            <canvas ref={canvasRef} className="aviator-canvas" />
            <div className={`multiplier-display ${gameState}`}>
              {multiplierDisplayText()}
            </div>
            {/* little round indicator bottom-left */}
            <div className="round-indicator">
              <div className={`dot ${gameState}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="aviator-controls-grid">
        <BetPanel betId={2} bet={bet2} setBet={setBet} {...commonProps} />
      </div>
    </div>
  );
}
