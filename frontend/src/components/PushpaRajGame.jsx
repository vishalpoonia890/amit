// PushpaRajAviator.jsx
// Aviator-style Pushpa Raj game component.
// - Demo mode if no ws or demo=true
// - Safe defaults and robust rendering (no toFixed crashes)
// - Sends/receives JSON messages via ws for server integration

import React, { useEffect, useRef, useState, useCallback } from "react";

/* -------------------------
   Small helper utilities
   ------------------------- */
const safeNum = (v, fallback = 1) => (typeof v === "number" && !Number.isNaN(v) ? v : fallback);
const safeToFixed = (v, d = 2) => safeNum(v).toFixed(d);

/* -------------------------
   Tiny SVG Truck (cartoon)
   ------------------------- */
const TruckSVG = ({ width = 220 }) => (
  <svg viewBox="0 0 300 140" width={width} height={(width * 140) / 300} preserveAspectRatio="xMinYMin meet">
    <g>
      <rect x="10" y="60" width="150" height="40" rx="6" fill="#e74c3c" stroke="#2c3e50" strokeWidth="3" />
      <rect x="155" y="45" width="90" height="55" rx="6" fill="#c0392b" stroke="#2c3e50" strokeWidth="3" />
      <circle cx="50" cy="110" r="14" fill="#1c2833" />
      <circle cx="190" cy="110" r="14" fill="#1c2833" />
      <circle cx="50" cy="110" r="7" fill="#bdc3c7" />
      <circle cx="190" cy="110" r="7" fill="#bdc3c7" />
      {/* Pushpa head (simple) */}
      <g transform="translate(170, 32) scale(0.9)">
        <circle cx="12" cy="12" r="12" fill="#2c3e50" />
        <circle cx="12" cy="9" r="6" fill="#f39c12" />
      </g>
    </g>
  </svg>
);

/* -------------------------
   Component
   ------------------------- */
export default function PushpaRajAviator({ token = null, ws = null, onBack = () => {}, demo = false }) {
  // Game state (defaults safe)
  const [game, setGame] = useState({
    status: "waiting", // waiting | running | crashed
    roundId: null,
    multiplier: 1.0,
    countdown: 5000,   // ms until start
    waitingTime: 5000, // ms reference
    startTime: null,
  });

  // Player state
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [placed, setPlaced] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(1);
  const [message, setMessage] = useState("");

  // Visual state
  const [truckX, setTruckX] = useState(0); // px
  const [recentCrashes, setRecentCrashes] = useState([]);

  // Refs for internal loops
  const animationRef = useRef(null);
  const multiplierRef = useRef(1);
  const crashAtRef = useRef(null);
  const runningRef = useRef(false);
  const wsRef = useRef(ws); // to keep latest ws
  const demoMode = demo || !ws;

  // Sync ws prop changes
  useEffect(() => { wsRef.current = ws; }, [ws]);

  /* -------------------------
     WebSocket message handler
     Expected server -> client messages:
     { type: "STATE_UPDATE", payload: { roundId, status, multiplier, startTime, waitingTime, countdown } }
     { type: "BET_SUCCESS", payload: {...} }
     { type: "CASHOUT_SUCCESS", payload: {...} }
     { type: "BET_ERROR", payload: { message } }
  ------------------------- */
  const handleServerMessage = useCallback((ev) => {
    try {
      const msg = typeof ev === "string" ? JSON.parse(ev) : ev;
      if (!msg || !msg.type) return;

      if (msg.type === "STATE_UPDATE") {
        const p = msg.payload || {};
        setGame(gs => ({
          ...gs,
          roundId: p.roundId ?? gs.roundId,
          status: p.status ?? gs.status,
          multiplier: typeof p.multiplier === "number" ? p.multiplier : gs.multiplier,
          startTime: p.startTime ?? gs.startTime,
          waitingTime: p.waitingTime ?? gs.waitingTime,
          countdown: p.countdown ?? gs.countdown,
        }));
        // if new round arrived, reset player flags
        if ((p.status === "waiting" || p.roundId !== game.roundId)) {
          setPlaced(false);
          setCashedOut(false);
          setCashOutMultiplier(1);
        }
      } else if (msg.type === "BET_SUCCESS") {
        setPlaced(true);
        setMessage("Bet placed!");
        setTimeout(() => setMessage(""), 2000);
      } else if (msg.type === "CASHOUT_SUCCESS") {
        setCashedOut(true);
        setCashOutMultiplier(msg.payload?.multiplier ?? game.multiplier ?? 1);
        setMessage("Cashed out!");
        setTimeout(() => setMessage(""), 2000);
      } else if (msg.type === "BET_ERROR") {
        setMessage(msg.payload?.message || "Bet failed");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to parse server msg:", err);
    }
  }, [game.roundId, game.multiplier]);

  // Attach ws listener if ws provided
  useEffect(() => {
    if (!wsRef.current || demoMode) return;
    const socket = wsRef.current;
    const onMessage = (evt) => {
      let data = evt.data;
      handleServerMessage(data);
    };
    socket.addEventListener("message", onMessage);
    return () => socket.removeEventListener("message", onMessage);
  }, [handleServerMessage, demoMode]);

  /* -------------------------
     DEMO loop: when no server, run a client-side round loop
     - waiting -> running -> crash
  ------------------------- */
  const startDemoRound = useCallback(() => {
    // reset
    setGame({
      status: "waiting",
      roundId: Date.now(),
      multiplier: 1,
      countdown: 4000,
      waitingTime: 4000,
      startTime: null,
    });
    setPlaced(false);
    setCashedOut(false);
    setCashOutMultiplier(1);
    multiplierRef.current = 1;
    crashAtRef.current = 1 + Math.random() * 8; // crash between 1 and ~9
    runningRef.current = false;

    // after countdown, start running
    setTimeout(() => {
      const startTs = Date.now();
      setGame(gs => ({ ...gs, status: "running", startTime: startTs, multiplier: 1 }));
      runningRef.current = true;

      // start animation loop for multiplier and truck
      const step = () => {
        // elapsed seconds
        const t = (Date.now() - startTs) / 1000;
        // growth function (tweak constants for desired speed)
        const mult = Math.max(1, 1 * Math.exp(0.45 * t)); // exponential-like growth
        multiplierRef.current = mult;
        setGame(gs => ({ ...gs, multiplier: multiplierRef.current }));

        // truck moves to right proportionally
        setTruckX(prev => Math.min(800, prev + 2 + Math.log(Math.max(1, multiplierRef.current))));

        if (multiplierRef.current >= (crashAtRef.current || 3.2)) {
          // crash
          runningRef.current = false;
          cancelAnimationFrame(animationRef.current);
          setGame(gs => ({ ...gs, status: "crashed", multiplier: multiplierRef.current }));
          setRecentCrashes(prev => [multiplierRef.current, ...prev].slice(0, 8));
          // reset visuals shortly then start next round
          setTimeout(() => {
            setTruckX(0);
            startDemoRound();
          }, 1800);
          return;
        }

        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    }, 4000);
  }, []);

  useEffect(() => {
    if (demoMode) {
      startDemoRound();
      return () => cancelAnimationFrame(animationRef.current);
    }
  }, [demoMode, startDemoRound]);

  /* -------------------------
     Actions: PLACE BET and CASHOUT
     - optimistic UI updates for demo or server behavior
  ------------------------- */
  const placeBet = () => {
    if (placed) {
      setMessage("Bet already placed for this round.");
      setTimeout(() => setMessage(""), 1600);
      return;
    }
    if (betAmount <= 0 || betAmount > balance) {
      setMessage("Invalid amount / insufficient balance.");
      setTimeout(() => setMessage(""), 1600);
      return;
    }

    // optimistic deduction
    setBalance(b => +(b - betAmount).toFixed(2));
    setPlaced(true);
    setMessage("Placing bet...");

    // if ws available, send request; server should respond with BET_SUCCESS or BET_ERROR
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !demoMode) {
      wsRef.current.send(JSON.stringify({ type: "PLACE_BET", payload: { token, amount: betAmount, roundId: game.roundId } }));
    } else {
      // demo: accept immediately
      setTimeout(() => {
        setMessage("Bet placed!");
        setTimeout(() => setMessage(""), 1200);
      }, 300);
    }
  };

  const cashOut = () => {
    if (!placed) {
      setMessage("No bet in this round.");
      setTimeout(() => setMessage(""), 1200);
      return;
    }
    if (cashedOut) {
      setMessage("Already cashed out!");
      setTimeout(() => setMessage(""), 1200);
      return;
    }

    const currentMult = safeNum(game.multiplier, 1);
    const win = +(betAmount * currentMult).toFixed(2);

    // optimistic
    setBalance(b => +(b + win).toFixed(2));
    setCashedOut(true);
    setCashOutMultiplier(currentMult);
    setMessage(`Cashed @ ${safeToFixed(currentMult)}x`);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !demoMode) {
      wsRef.current.send(JSON.stringify({ type: "CASHOUT", payload: { token, roundId: game.roundId } }));
    }
  };

  /* -------------------------
     UI derived values
  ------------------------- */
  const countdownPct = Math.max(0, Math.min(100, ((game.countdown ?? 0) / (game.waitingTime ?? 1)) * 100));
  const safeMultiplier = safeNum(game.multiplier, 1);
  const formattedRecent = recentCrashes.map(m => safeNum(m, 1));

  /* -------------------------
     Render
  ------------------------- */
  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4 bg-[#0c0f14] text-white">
      <div className="w-full max-w-5xl mb-3 flex justify-between items-center">
        <button onClick={onBack} className="px-3 py-2 rounded bg-[#0f1720] hover:bg-[#182032]">Back</button>
        <div className="text-sm opacity-80">Round: {String(game.roundId ?? "-")}</div>
      </div>

      <div className="w-full max-w-5xl rounded-lg bg-gradient-to-b from-[#24102b] to-[#0d0d12] p-4 shadow-xl">
        {/* header */}
        <div className="flex flex-col items-center mb-4">
          <div className="text-yellow-300 font-bold text-xl">Pushpa Raj — Aviator</div>
          <div className="text-sm text-gray-300 mt-1">{game.status === "waiting" ? "Place your bet" : (game.status === "running" ? (cashedOut ? `Cashed @ ${safeToFixed(cashOutMultiplier)}x` : "Running — Cash out!") : "Round crashed")}</div>
        </div>

        {/* arena */}
        <div className="relative w-full h-56 bg-[#071019] rounded-lg overflow-hidden mb-4">
          {/* background hills */}
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 800 200" preserveAspectRatio="none">
            <path d="M0 200 L0 120 Q 150 40, 300 130 T 600 100 T 800 140 L 800 200 Z" fill="#2c0b2e" />
            <path d="M0 200 L0 150 Q 200 100, 400 160 T 800 150 L 800 200 Z" fill="#4a1d5a" opacity="0.5" />
          </svg>

          {/* trees row aligned bottom */}
          <div className="absolute left-0 right-0 bottom-6 flex justify-around items-end pointer-events-none z-10">
            <div style={{ transform: "scale(1.1)" }}><svg viewBox="0 0 100 160" width="48"><rect x="45" y="120" width="10" height="30" fill="#6b4226"/><path d="M50 20 C25 20, 5 55, 50 70 C95 55, 75 20, 50 20 Z" fill="#145A32"/><path d="M50 40 C30 40, 15 70, 50 85 C85 70, 70 40, 50 40 Z" fill="#1E8449"/></svg></div>
            <div style={{ transform: "scale(0.9)" }}><svg viewBox="0 0 100 160" width="44"><rect x="45" y="120" width="10" height="30" fill="#6b4226"/><path d="M50 20 C25 20, 5 55, 50 70 C95 55, 75 20, 50 20 Z" fill="#145A32"/><path d="M50 40 C30 40, 15 70, 50 85 C85 70, 70 40, 50 40 Z" fill="#1E8449"/></svg></div>
            <div style={{ transform: "scale(1.2)" }}><svg viewBox="0 0 100 160" width="56"><rect x="45" y="120" width="10" height="30" fill="#6b4226"/><path d="M50 20 C25 20, 5 55, 50 70 C95 55, 75 20, 50 20 Z" fill="#145A32"/><path d="M50 40 C30 40, 15 70, 50 85 C85 70, 70 40, 50 40 Z" fill="#1E8449"/></svg></div>
            <div style={{ transform: "scale(0.85)" }}><svg viewBox="0 0 100 160" width="40"><rect x="45" y="120" width="10" height="30" fill="#6b4226"/><path d="M50 20 C25 20, 5 55, 50 70 C95 55, 75 20, 50 20 Z" fill="#145A32"/><path d="M50 40 C30 40, 15 70, 50 85 C85 70, 70 40, 50 40 Z" fill="#1E8449"/></svg></div>
            <div style={{ transform: "scale(1.0)" }}><svg viewBox="0 0 100 160" width="48"><rect x="45" y="120" width="10" height="30" fill="#6b4226"/><path d="M50 20 C25 20, 5 55, 50 70 C95 55, 75 20, 50 20 Z" fill="#145A32"/><path d="M50 40 C30 40, 15 70, 50 85 C85 70, 70 40, 50 40 Z" fill="#1E8449"/></svg></div>
          </div>

          {/* truck (positioned left->right, controlled by truckX) */}
          <div style={{ position: "absolute", left: `${Math.min(88, (truckX / 800) * 88)}%`, bottom: 6, transform: "translateX(-6%)", zIndex: 20, transition: "left 50ms linear" }}>
            <TruckSVG width={160} />
          </div>

          {/* multiplier big center */}
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 22, zIndex: 30, textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: game.status === "crashed" ? "#ff6b6b" : "#fff" }}>{safeToFixed(safeMultiplier)}x</div>
            {game.status === "waiting" && (
              <div style={{ marginTop: 6, color: "#ddd" }}>{`Starting in ${(game.countdown / 1000).toFixed(1)}s`}</div>
            )}
            {game.status === "running" && !cashedOut && <div style={{ marginTop: 6, color: "#ffd86b" }}>Cash out before crash!</div>}
            {game.status === "crashed" && <div style={{ marginTop: 6, color: "#ff9b9b" }}>Crashed at {safeToFixed(safeMultiplier)}x</div>}
          </div>
        </div>

        {/* controls area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* bet input */}
          <div className="p-3 bg-[#0f1720] rounded">
            <div className="text-sm text-gray-300 mb-2">Bet Amount</div>
            <div className="flex gap-2">
              <input type="number" min="1" value={betAmount} onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value) || 1))} className="flex-1 p-2 bg-[#0b0f14] rounded border border-[#222]" />
              <button onClick={placeBet} disabled={game.status !== "waiting" || placed || betAmount > balance} className="px-3 py-2 bg-green-600 rounded disabled:opacity-50">Place</button>
            </div>
            <div className="mt-2 text-xs text-gray-400">Balance: ${Number(balance).toFixed(2)}</div>
          </div>

          {/* cashout */}
          <div className="p-3 bg-[#0f1720] rounded flex flex-col items-center justify-center">
            {game.status === "running" && placed && !cashedOut && (
              <button onClick={cashOut} className="w-full py-3 bg-yellow-500 font-bold rounded">CASH OUT @ {safeToFixed(safeMultiplier)}x</button>
            )}

            {game.status === "running" && placed && cashedOut && (
              <div className="w-full py-3 bg-blue-400 rounded text-center">CASHED @ {safeToFixed(cashOutMultiplier)}x</div>
            )}

            {game.status === "waiting" && <div className="text-sm text-gray-300">Place bet while waiting</div>}
            {game.status === "crashed" && <div className="text-sm text-gray-400">Round ended</div>}
          </div>

          {/* recent / stats */}
          <div className="p-3 bg-[#0f1720] rounded">
            <div className="text-sm text-gray-300 mb-2">Recent crashes</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {formattedRecent.length === 0 ? <div className="text-xs text-gray-500">—</div> : formattedRecent.map((m, i) => <div key={i} className="px-2 py-1 bg-[#111217] rounded text-sm">{safeToFixed(m)}x</div>)}
            </div>
            <div className="mt-3 text-xs text-gray-400">Demo mode: {demoMode ? "ON" : "OFF"}</div>
            {message && <div className="mt-2 p-2 bg-[#1f2937] rounded text-sm">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
