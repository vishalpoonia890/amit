// PushpaRajGame.jsx
// A complete, self-contained demo Pushpa/Aviator-style game component.
//
// Props:
//  - token (optional): user JWT token to send with ws messages
//  - onBack (optional): callback when user clicks Back
//  - ws (optional): an open WebSocket instance that speaks your game's msg protocol
//  - realtimeData (optional): incoming realtime payloads (if your parent feeds them)
// If no ws is provided, this component runs a demo local game loop for development.

import React, { useState, useEffect, useRef, useCallback } from "react";

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

// Simple Truck SVG (keeps DOM light)
const TruckIcon = ({ className }) => (
  <svg viewBox="0 0 300 140" className={className} width="260" height="120" preserveAspectRatio="xMinYMin meet">
    <g transform="translate(0,0)">
      <rect x="20" y="60" width="130" height="35" fill="#c0392b" stroke="#2c3e50" strokeWidth="3" />
      <rect x="150" y="50" width="80" height="45" fill="#e74c3c" stroke="#2c3e50" strokeWidth="3" />
      <circle cx="60" cy="105" r="16" fill="#2c3e50" />
      <circle cx="170" cy="105" r="16" fill="#2c3e50" />
    </g>
  </svg>
);

// Simple Tree component
const Tree = ({ scale = 1 }) => (
  <div style={{ transform: `scale(${scale})`, transformOrigin: "center bottom", width: 60 }}>
    <svg viewBox="0 0 100 160" width="100%" height="100%">
      <rect x="45" y="120" width="10" height="30" fill="#6b4226" />
      <path d="M50 20 C25 20, 5 55, 50 70 C95 55, 75 20, 50 20 Z" fill="#145A32" />
      <path d="M50 40 C30 40, 15 70, 50 85 C85 70, 70 40, 50 40 Z" fill="#1E8449" />
    </svg>
  </div>
);

// Utility: safe toFixed
const safeToFixed = (num, digits = 2) => {
  const n = typeof num === "number" && !Number.isNaN(num) ? num : 1;
  return n.toFixed(digits);
};

export default function PushpaRajGame({ token = null, onBack = () => {}, ws = null, realtimeData = null }) {
  // --- Game state defaults ---
  const [gameState, setGameState] = useState({
    status: "waiting",         // 'waiting' | 'running' | 'crashed'
    roundId: null,
    multiplier: 1.0,
    countdown: 8000,           // ms until start when waiting
    waitingTime: 8000,         // ms (reference)
    startTime: null,           // timestamp when run started
  });

  // Player state
  const [balance, setBalance] = useState(1000);    // currency units
  const [nextBetAmount, setNextBetAmount] = useState(10);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(1.0);
  const [notification, setNotification] = useState("");

  // UI state
  const [truckPosition, setTruckPosition] = useState(0);
  const [recentCrashes, setRecentCrashes] = useState([]);
  const animationRef = useRef(null);

  // Audio (tone import optional)
  const toneRef = useRef(null);
  const isAudioReadyRef = useRef(false);

  useEffect(() => {
    // try dynamic import of tone; if not present, skip audio silently
    let cancelled = false;
    (async () => {
      try {
        const Tone = (await import("tone")).default || (await import("tone"));
        if (cancelled) return;
        toneRef.current = {
          Tone,
          betSynth: new Tone.Synth({ oscillator: { type: "sine" } }).toDestination(),
          cashSynth: new Tone.Synth({ oscillator: { type: "triangle" } }).toDestination(),
          crashNoise: new Tone.NoiseSynth({ noise: { type: "brown" } }).toDestination(),
        };
        isAudioReadyRef.current = true;
      } catch (e) {
        // tone not installed/available — ignore (no audio)
        console.warn("Tone.js not available — audio disabled for demo.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const playBetSound = () => {
    if (toneRef.current && toneRef.current.betSynth) {
      try { toneRef.current.betSynth.triggerAttackRelease("C5", "8n"); } catch { /* ignore */ }
    }
  };
  const playCashSound = () => {
    if (toneRef.current && toneRef.current.cashSynth) {
      try { toneRef.current.cashSynth.triggerAttackRelease("G5", "8n"); } catch { /* ignore */ }
    }
  };
  const playCrashSound = () => {
    if (toneRef.current && toneRef.current.crashNoise) {
      try { toneRef.current.crashNoise.triggerAttackRelease("0.2"); } catch { /* ignore */ }
    }
  };

  // --- WebSocket handling (if ws prop provided) or demo loop ---
  const demoIntervalRef = useRef(null);
  const multiplierRef = useRef(1.0);
  const crashAtRef = useRef(null);
  const runningRef = useRef(false);

  // Utility to start a new round (demo)
  const startDemoWaiting = useCallback(() => {
    // reset round
    setGameState(gs => ({ ...gs, status: "waiting", countdown: 8000, waitingTime: 8000, roundId: Date.now() }));
    setHasPlacedBet(false);
    setHasCashedOut(false);
    setCashOutMultiplier(1.0);
    multiplierRef.current = 1.0;
    runningRef.current = false;

    // schedule transition to running
    setTimeout(() => {
      // determine crash multiplier randomly for demo (between 1.2 and 8)
      crashAtRef.current = (Math.random() * 6.8) + 1.2;
      setGameState(gs => ({ ...gs, status: "running", startTime: Date.now(), multiplier: 1.0 }));
      runningRef.current = true;
      runDemoMultiplier();
    }, 8000);
  }, []);

  // Demo multiplier loop
  const runDemoMultiplier = () => {
    // cancel previous if any
    cancelAnimationFrame(animationRef.current);
    const start = Date.now();
    const step = () => {
      // simple deterministic growth function (exponential slow)
      const t = (Date.now() - start) / 1000; // seconds since start
      // base growth; tweak constants for speed
      const mult = Math.max(1, Math.exp(0.5 * t)); // grows exponentially
      multiplierRef.current = mult;
      setGameState(gs => ({ ...gs, multiplier: multiplierRef.current }));

      // move truck visually (use log so position grows smoothly)
      setTruckPosition(prev => Math.min(600, prev + 0.6 + Math.log(Math.max(1, multiplierRef.current))));

      // check crash
      if (multiplierRef.current >= (crashAtRef.current ?? 3.2)) {
        // crash
        runningRef.current = false;
        setGameState(gs => ({ ...gs, status: "crashed", multiplier: multiplierRef.current }));
        setRecentCrashes(prev => [multiplierRef.current, ...prev].slice(0, 8));
        playCrashSound();
        // reset truck position after short delay and start new waiting
        setTimeout(() => {
          setTruckPosition(0);
          startDemoWaiting();
        }, 2000);
        // cancel loop
        return;
      }

      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
  };

  // Start demo on mount if no external ws provided
  useEffect(() => {
    if (!ws) {
      startDemoWaiting();
    } else {
      // If ws provided, user should hook their own handlers. We'll still have safe UI.
      // You can add code here to register message listeners to ws if desired.
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, [ws, startDemoWaiting]);

  // If parent passes realtimeData prop, integrate incoming server updates safely
  useEffect(() => {
    if (!realtimeData) return;
    // expected payload structure: { type: 'PUSHPA_STATE_UPDATE', payload: { status, multiplier, roundId, startTime, waitingTime, countdown } }
    try {
      if (realtimeData.type === "PUSHPA_STATE_UPDATE") {
        const p = realtimeData.payload || {};
        setGameState(gs => ({
          ...gs,
          status: p.status ?? gs.status,
          multiplier: typeof p.multiplier === "number" ? p.multiplier : gs.multiplier,
          roundId: p.roundId ?? gs.roundId,
          startTime: p.startTime ?? gs.startTime,
          waitingTime: p.waitingTime ?? gs.waitingTime,
          countdown: p.countdown ?? gs.countdown,
        }));
      } else if (realtimeData.type === "PUSHPA_BET_SUCCESS") {
        setHasPlacedBet(true);
      } else if (realtimeData.type === "PUSHPA_CASHOUT_SUCCESS") {
        setHasCashedOut(true);
        setCashOutMultiplier(realtimeData.payload?.multiplier ?? gameState.multiplier ?? 1);
      } else if (realtimeData.type === "PUSHPA_BET_ERROR") {
        setNotification(realtimeData.message ?? "Bet failed");
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (e) {
      console.error("Error applying realtime data:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeData]);

  // --- Actions: place bet & cashout ---
  const placeBet = () => {
    if (hasPlacedBet) {
      setNotification("Bet already placed for this round.");
      setTimeout(() => setNotification(""), 2000);
      return;
    }
    if (nextBetAmount <= 0) {
      setNotification("Enter a valid bet amount.");
      setTimeout(() => setNotification(""), 2000);
      return;
    }
    if (nextBetAmount > balance) {
      setNotification("Insufficient balance.");
      setTimeout(() => setNotification(""), 2000);
      return;
    }

    // Optimistic UI: deduct amount and mark placed
    setBalance(b => +(b - nextBetAmount).toFixed(2));
    setHasPlacedBet(true);
    playBetSound();

    // send over ws if available
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ game: "pushpa", action: "bet", payload: { token, amount: nextBetAmount, roundId: gameState.roundId } }));
      } catch (err) {
        console.warn("Failed to send bet over ws:", err);
      }
    } else {
      // demo server would mark Bet success automatically (we already set local state)
    }
  };

  const cashOut = () => {
    if (!hasPlacedBet) {
      setNotification("You haven't placed a bet this round.");
      setTimeout(() => setNotification(""), 2000);
      return;
    }
    if (hasCashedOut) {
      setNotification("Already cashed out.");
      setTimeout(() => setNotification(""), 2000);
      return;
    }

    const currentMultiplier = typeof gameState.multiplier === "number" ? gameState.multiplier : 1;
    const win = +(nextBetAmount * currentMultiplier).toFixed(2);

    // optimistic UI: add winnings (note: we've already deducted bet when placing)
    setBalance(b => +(b + win).toFixed(2));
    setHasCashedOut(true);
    setCashOutMultiplier(currentMultiplier);
    playCashSound();

    // send cashout to server if available
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ game: "pushpa", action: "cashout", payload: { token, roundId: gameState.roundId } }));
      } catch (err) {
        console.warn("Failed to send cashout over ws:", err);
      }
    }
  };

  // countdown pct for UI (safe divide)
  const countdownPct = Math.max(0, Math.min(100, ((gameState.countdown ?? 0) / (gameState.waitingTime ?? 1)) * 100));

  // Recent crashes formatting safe
  const formattedRecent = recentCrashes.map(m => (typeof m === "number" ? m : 1));

  return (
    <div className="w-full min-h-screen bg-[#0b0b10] text-white flex flex-col items-center p-4">
      {/* Top bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded bg-[#111217] hover:bg-[#1c1c24]">
          <BackIcon /> <span className="text-sm">Lobby</span>
        </button>
        <div className="text-sm opacity-80">Round: {String(gameState.roundId ?? "-")}</div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="mb-3 px-4 py-2 bg-red-600 rounded">{notification}</div>
      )}

      {/* Game Arena */}
      <div className="w-full max-w-5xl bg-gradient-to-b from-[#24102b] to-[#0d0d12] rounded-lg shadow-2xl overflow-hidden relative">
        {/* Background hills */}
        <div className="absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 800 200" className="w-full h-full opacity-40" preserveAspectRatio="none">
            <path d="M0 200 L0 120 Q 150 40, 300 130 T 600 100 T 800 140 L 800 200 Z" fill="#2c0b2e" />
            <path d="M0 200 L0 150 Q 200 100, 400 160 T 800 150 L 800 200 Z" fill="#4a1d5a" opacity="0.5" />
          </svg>
        </div>

        {/* Center HUD */}
        <div className="relative z-10 p-6 flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-bold text-yellow-300 mb-2">Pushpa Raj - Demo</div>

          {/* Trees row (responsive and aligned) */}
          <div className="w-full flex justify-around items-end mb-2 px-6" style={{ pointerEvents: "none" }}>
            <div><Tree scale={1.1} /></div>
            <div><Tree scale={0.9} /></div>
            <div><Tree scale={1.2} /></div>
            <div><Tree scale={0.85} /></div>
            <div><Tree scale={1.0} /></div>
          </div>

          {/* Play field */}
          <div className="w-full relative bg-[#12121a] rounded-lg p-4 mb-4">
            <div className="absolute left-4 bottom-6 transition-transform" style={{ transform: `translateX(${truckPosition}px)` }}>
              <TruckIcon />
            </div>

            {/* Multiplier big */}
            <div className="w-full flex flex-col items-center py-6">
              <div className={`text-6xl md:text-8xl font-extrabold ${gameState.status === "crashed" ? "text-red-500" : "text-white"}`}>
                {(typeof gameState.multiplier === "number" ? gameState.multiplier : 1).toFixed(2)}x
              </div>
              <div className="mt-2 text-sm text-gray-300">{gameState.status === "waiting" ? `Starting in ${(gameState.countdown / 1000).toFixed(1)}s` : (gameState.status === "running" ? (hasCashedOut ? `Cashed @ ${safeToFixed(cashOutMultiplier)}x` : "Rukega nahi saala!") : "TRUCK STOPPED")}</div>

              {/* progress bar when waiting */}
              {gameState.status === "waiting" && (
                <div className="w-3/4 mt-4 bg-[#2a2a30] h-3 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 transition-all" style={{ width: `${countdownPct}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Controls and sidebar */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left: Bet controls */}
            <div className="bg-[#0f0f14] p-4 rounded shadow-inner">
              <div className="text-sm text-gray-300 mb-2">Bet Amount</div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  value={nextBetAmount}
                  onChange={(e) => setNextBetAmount(Math.max(1, Number(e.target.value) || 1))}
                  className="flex-1 p-2 rounded bg-[#111116] border border-[#222232]"
                />
                <button onClick={placeBet} disabled={gameState.status !== "waiting" || hasPlacedBet || nextBetAmount > balance}
                  className="px-3 py-2 bg-green-600 rounded disabled:opacity-50">
                  Place
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={() => setNextBetAmount(10)} className="px-2 py-1 bg-gray-800 rounded">10</button>
                <button onClick={() => setNextBetAmount(50)} className="px-2 py-1 bg-gray-800 rounded">50</button>
                <button onClick={() => setNextBetAmount(100)} className="px-2 py-1 bg-gray-800 rounded">100</button>
              </div>
            </div>

            {/* Center: Cashout / Action */}
            <div className="bg-[#0f0f14] p-4 rounded shadow-inner flex flex-col items-center justify-center">
              {gameState.status === "running" && hasPlacedBet && !hasCashedOut && (
                <button onClick={cashOut} className="w-full py-3 text-lg font-bold bg-yellow-500 rounded">CASH OUT @ {(typeof gameState.multiplier === "number" ? gameState.multiplier : 1).toFixed(2)}x</button>
              )}

              {gameState.status === "running" && hasPlacedBet && hasCashedOut && (
                <div className="w-full py-3 text-lg font-bold bg-blue-400 rounded text-center">CASHED @ {safeToFixed(cashOutMultiplier)}x</div>
              )}

              {gameState.status === "waiting" && (
                <div className="w-full py-3 text-center text-sm text-gray-300">Place bet while waiting</div>
              )}

              {gameState.status === "crashed" && (
                <div className="w-full py-3 text-center text-sm text-gray-400">Round ended — waiting for next</div>
              )}
            </div>

            {/* Right: balance & recent crashes */}
            <div className="bg-[#0f0f14] p-4 rounded shadow-inner">
              <div className="text-sm text-gray-300 mb-2">Balance</div>
              <div className="text-2xl font-bold text-green-400 mb-3">${(typeof balance === "number" ? balance : 0).toFixed(2)}</div>

              <div className="text-sm text-gray-300 mb-2">Recent Crashes</div>
              <div className="flex gap-2 overflow-x-auto">
                {formattedRecent.length === 0 ? <div className="text-xs text-gray-400">—</div> : formattedRecent.map((m, i) => (
                  <div key={i} className="px-2 py-1 bg-[#111116] rounded text-sm">{(typeof m === "number" ? m : 1).toFixed(2)}x</div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">Demo game (client-side). Hook websocket & server events to replace demo behavior.</div>
    </div>
  );
}
