import React, { useEffect, useState, useRef } from "react";

const PushpaRajGame = ({ token }) => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState("waiting"); // waiting, running, crashed
  const [roundId, setRoundId] = useState(null);
  const [message, setMessage] = useState("");
  const [betPlaced, setBetPlaced] = useState(false);
  const [cashoutDone, setCashoutDone] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://amit-sigma.vercel.app"); // ✅ change to your ws server

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "PUSHPA_STATE_UPDATE") {
        setMultiplier(msg.payload.multiplier.toFixed(2));
        setStatus(msg.payload.status);
        setRoundId(msg.payload.roundId);
      }
      if (msg.type === "PUSHPA_BET_ERROR") setMessage(msg.message);
      if (msg.type === "PUSHPA_BET_SUCCESS") setMessage("✅ Bet Placed!");
      if (msg.type === "PUSHPA_CASHOUT_SUCCESS") {
        setMessage(`💰 Cashed out with payout ${msg.payout}`);
        setCashoutDone(true);
      }
    };

    return () => ws.current && ws.current.close();
  }, []);

  const placeBet = () => {
    if (!roundId) return;
    ws.current.send(
      JSON.stringify({
        game: "pushpa",
        action: "bet",
        payload: { token, betAmount: 10, roundId }, // 🔥 fixed bet 10 for demo
      })
    );
    setBetPlaced(true);
    setMessage("Betting...");
  };

  const cashout = () => {
    if (!roundId) return;
    ws.current.send(
      JSON.stringify({
        game: "pushpa",
        action: "cashout",
        payload: { token, roundId },
      })
    );
    setCashoutDone(true);
  };

  return (
    <div className="flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl mb-4">🚚 Pushpa Raj Aviator</h1>
      <p>Status: {status}</p>
      <p className="text-3xl font-bold">{multiplier}x</p>

      {/* Truck moving across screen */}
      <div className="relative w-full h-32 bg-green-900 mt-6 overflow-hidden">
        <div
          className={`absolute left-0 top-10 transition-all duration-1000`}
          style={{
            transform:
              status === "running"
                ? `translateX(${multiplier * 20}px)`
                : status === "crashed"
                ? "translateX(0)"
                : "translateX(0)",
          }}
        >
          🚛💨
        </div>
      </div>

      <div className="mt-6">
        {!betPlaced && status === "waiting" && (
          <button
            onClick={placeBet}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            Place Bet (10)
          </button>
        )}
        {betPlaced && !cashoutDone && status === "running" && (
          <button
            onClick={cashout}
            className="bg-yellow-500 px-4 py-2 rounded-lg"
          >
            Cash Out @ {multiplier}x
          </button>
        )}
      </div>

      <p className="mt-4">{message}</p>
    </div>
  );
};

export default PushpaRajGame;
