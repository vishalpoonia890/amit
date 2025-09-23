import React, { useState, useEffect, useRef } from 'react';

// --- SVG Icons & Graphics ---
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 140" className="w-full h-full">
        {/* Headlight Glow */}
        <g style={{ filter: 'url(#glow)' }}>
            <polygon points="260 85, 300 70, 300 110, 260 95" fill="rgba(255, 223, 186, 0.5)" />
        </g>
        <g>
            {/* Rear Wheels */}
            <g id="wheel-1" className="wheel">
                <path d="M70 83 A 22 22 0 1 1 70 127 A 22 22 0 1 1 70 83" fill="#1c2833" />
                <circle cx="70" cy="105" r="20" fill="#2c3e50" stroke="#1c2833" strokeWidth="1" />
                <circle cx="70" cy="105" r="10" fill="#bdc3c7" stroke="#34495e" strokeWidth="2" />
                <circle cx="70" cy="105" r="3" fill="#34495e" />
            </g>
            <g id="wheel-2" className="wheel">
                <path d="M130 83 A 22 22 0 1 1 130 127 A 22 22 0 1 1 130 83" fill="#1c2833" />
                <circle cx="130" cy="105" r="20" fill="#2c3e50" stroke="#1c2833" strokeWidth="1" />
                <circle cx="130" cy="105" r="10" fill="#bdc3c7" stroke="#34495e" strokeWidth="2" />
                <circle cx="130" cy="105" r="3" fill="#34495e" />
            </g>
            {/* Main Body */}
            <path d="M20 95 H180 V60 H30 Z" fill="#c0392b" />
            <path d="M20 95 L30 60 H180 L180 95 Z" stroke="#2c3e50" strokeWidth="3" fill="none" />
            {/* Cargo */}
            <path d="M25 60 V30 H175 V60" fill="#e67e22" stroke="#2c3e50" strokeWidth="3" />
            <rect x="30" y="35" width="140" height="8" fill="#8D6E63" stroke="#5D4037" strokeWidth="1" />
            <rect x="30" y="45" width="140" height="8" fill="#795548" stroke="#5D4037" strokeWidth="1" />
            {/* Decorations */}
            <circle cx="55" cy="78" r="10" fill="#f1c40f" stroke="#2c3e50" strokeWidth="1.5" />
            <circle cx="95" cy="78" r="10" fill="#2ecc71" stroke="#2c3e50" strokeWidth="1.5" />
            <circle cx="135" cy="78" r="10" fill="#3498db" stroke="#2c3e50" strokeWidth="1.5" />
            {/* Cabin */}
            <path d="M180 95 V40 H240 L260 55 V95 Z" fill="#e74c3c" stroke="#2c3e50" strokeWidth="3" />
            <path d="M190 50 H235 V85 H190 Z" fill="rgba(169, 204, 227, 0.7)" stroke="#2c3e50" strokeWidth="2" />
            {/* Front Bumper & Grill */}
            <rect x="255" y="80" width="20" height="15" fill="#f1c40f" stroke="#2c3e50" strokeWidth="2" />
            <rect x="180" y="95" width="95" height="10" fill="#7f8c8d" stroke="#2c3e50" strokeWidth="2" />
            {/* Pushpa Head */}
            <g transform="translate(192, 32) scale(2)">
                <path d="M11,25 Q15,29 19,25 L18,19 H12Z" fill="#8e44ad" />
                <path d="M14,17.5 h2 v3 h-2z" fill="#f39c12" />
                <path d="M15,2 C5,2 3,25 10,28 Q15,32 20,28 C27,25 25,2 15,2" fill="#2c3e50" />
                <path d="M15,6 C10,6 8,18 11,21 h8 C22,18 20,6 15,6" fill="#f39c12" />
                <rect x="7" y="11" width="16" height="6" rx="2" fill="#111" />
                <path d="M9,22 C12,20, 18,20, 21,22 C18,24, 12,24, 9,22" fill="#1c1c1c" />
                <circle cx="6" cy="18" r="1.5" fill="#f1c40f" stroke="#333" strokeWidth="0.5" />
            </g>
            {/* Front Wheel */}
            <g id="wheel-3" className="wheel">
                <path d="M235 83 A 22 22 0 1 1 235 127 A 22 22 0 1 1 235 83" fill="#1c2833" />
                <circle cx="235" cy="105" r="20" fill="#2c3e50" stroke="#1c2833" strokeWidth="1" />
                <circle cx="235" cy="105" r="10" fill="#bdc3c7" stroke="#34495e" strokeWidth="2" />
                <circle cx="235" cy="105" r="3" fill="#34495e" />
            </g>
        </g>
    </svg>
);

const ImprovedTree = ({ style }) => (
    <svg viewBox="0 0 150 250" className="h-32 w-24 absolute bottom-12" style={style}>
        <path d="M75,250 L85,100 L75,100 L75,0 L50,50 L25,80 L50,85 L40,150 L65,100 L75,250 Z" fill="#145A32" />
        <path d="M75,250 L65,100 L75,100 L75,20 L90,60 L125,90 L95,95 L110,160 L85,100 L75,250 Z" fill="#1E8449" />
    </svg>
);

const BackgroundHills = () => (
    <svg viewBox="0 0 800 200" className="absolute bottom-10 left-0 w-full h-48 z-0 opacity-50" preserveAspectRatio="none">
        <path d="M0 200 L0 120 Q 150 40, 300 130 T 600 100 T 800 140 L 800 200 Z" fill="#2c0b2e" />
        <path d="M0 200 L0 150 Q 200 100, 400 160 T 800 150 L 800 200 Z" fill="#4a1d5a" opacity="0.5" />
    </svg>
);

// --- Main Game Component ---
export default function PushpaRajGame({ token, onBack, ws, realtimeData }) {
    // Game state from WebSocket
    const [gameState, setGameState] = useState({
        status: 'connecting',
        roundId: null,
        countdown: 15000,
        waitingTime: 15000,   // ✅ safe default
        multiplier: 1.0       // ✅ safe default
    });

    // Local player state
    const [balance, setBalance] = useState(1000);
    const [betAmount, setBetAmount] = useState(10);
    const [nextBetAmount, setNextBetAmount] = useState(10);
    const [hasPlacedBet, setHasPlacedBet] = useState(false);
    const [hasCashedOut, setHasCashedOut] = useState(false);
    const [cashOutMultiplier, setCashOutMultiplier] = useState(1.0); // ✅ safe default
    const [notification, setNotification] = useState('');

    const [truckPosition, setTruckPosition] = useState(0);
    const [recentCrashes, setRecentCrashes] = useState([]);

    const sounds = useRef(null);
    const [isAudioReady, setIsAudioReady] = useState(false);

    // --- WebSocket Data Handler ---
    useEffect(() => {
        if (realtimeData && realtimeData.type === 'PUSHPA_STATE_UPDATE') {
            const serverState = realtimeData.payload;
            if (gameState.roundId !== serverState.roundId) {
                setHasPlacedBet(false);
                setHasCashedOut(false);
                setCashOutMultiplier(1.0);
                if (serverState.prevStatus === 'running' && serverState.status === 'crashed') {
                    setRecentCrashes(prev => [gameState.multiplier ?? 1, ...prev.slice(0, 5)]);
                }
            }
            setGameState({
                ...gameState,
                ...serverState,
                multiplier: serverState.multiplier ?? 1
            });
        }
        if (realtimeData && realtimeData.type === 'PUSHPA_BET_SUCCESS') {
            setHasPlacedBet(true);
        }
        if (realtimeData && realtimeData.type === 'PUSHPA_BET_ERROR') {
            setNotification(realtimeData.message);
            setTimeout(() => setNotification(''), 3000);
        }
        if (realtimeData && realtimeData.type === 'PUSHPA_CASHOUT_SUCCESS') {
            setHasCashedOut(true);
            setCashOutMultiplier(gameState.multiplier ?? 1);
        }
    }, [realtimeData, gameState.roundId, gameState.multiplier]);

    // --- Animation ---
    useEffect(() => {
        let animationFrameId;
        const runAnimation = () => {
            if (gameState.status === 'running' && gameState.startTime) {
                const elapsed = (Date.now() - gameState.startTime) / 1000;
                const newPosition = elapsed * (10 + Math.log(gameState.multiplier ?? 1));
                setTruckPosition(newPosition);
            }
            animationFrameId = requestAnimationFrame(runAnimation);
        };

        if (gameState.status === 'running') {
            animationFrameId = requestAnimationFrame(runAnimation);
        } else {
            setTruckPosition(0);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState.status, gameState.startTime, gameState.multiplier]);

    // --- Sound Setup Effect ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js";
            script.async = true;
            script.onload = () => {
                const Tone = window.Tone;
                sounds.current = {
                    betSound: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 } }).toDestination(),
                    cashOutSound: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 } }).toDestination(),
                    crashSound: new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 } }).toDestination(),
                    engineSound: new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.1, decay: 0.2, sustain: 1.0, release: 0.5 } }).toDestination(),
                };
                sounds.current.engineSound.volume.value = -20;
            };
            document.body.appendChild(script);
            return () => { if (document.body.contains(script)) { document.body.removeChild(script); } }
        }
    }, []);

    const initAudio = async () => {
        if (window.Tone && window.Tone.context.state !== 'running') {
            await window.Tone.start();
        }
        setIsAudioReady(true);
    };

    // --- User Actions ---
    const handlePlaceBet = async () => {
        if (!isAudioReady) await initAudio();
        if (sounds.current) sounds.current.betSound.triggerAttackRelease("C4", "8n");
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                game: 'pushpa',
                action: 'bet',
                payload: { token, betAmount: nextBetAmount, roundId: gameState.roundId }
            }));
            setBetAmount(nextBetAmount);
        }
    };

    const handleCashOut = () => {
        if (sounds.current) sounds.current.cashOutSound.triggerAttackRelease("G5", "4n");
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                game: 'pushpa',
                action: 'cashout',
                payload: { token, roundId: gameState.roundId }
            }));
        }
    };

    const getStatusMessage = () => {
        switch (gameState.status) {
            case 'connecting': return 'CONNECTING...';
            case 'waiting': return 'PLACE YOUR BETS!';
            case 'running': return hasCashedOut ? `CASHED OUT!` : 'Rukega nahi saala!';
            case 'crashed': return `TRUCK STOPPED!`;
            default: return '';
        }
    };

    const countdownPercentage = ((gameState.countdown ?? 0) / (gameState.waitingTime ?? 1)) * 100;

    return (
        <div className="w-full h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden antialiased">
            {notification && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white py-2 px-6 rounded-lg shadow-xl z-50 transition-opacity duration-300">
                    {notification}
                </div>
            )}
            <svg width="0" height="0">
                <defs>
                    <filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <filter id="cartoonify"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="turbulence" /><feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.5" /></filter>
                </defs>
            </svg>
            <style>{`
                @keyframes wheel-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .wheel { animation: wheel-spin 0.4s linear infinite; }
                #wheel-1 { transform-origin: 70px 105px; } #wheel-2 { transform-origin: 130px 105px; } #wheel-3 { transform-origin: 235px 105px; }
                @keyframes shake { 0%, 100% { transform: translate(0, 0) rotate(0); } 25% { transform: translate(-1px, 1px) rotate(-0.5deg); } 50% { transform: translate(1px, -1px) rotate(0.5deg); } 75% { transform: translate(-1px, -1px) rotate(0.2deg); } }
                .shake-animation { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes road-lines { from { background-position: 0 50%; } to { background-position: -200px 50%; } }
                .road-lines-animation { background-image: repeating-linear-gradient(90deg, transparent, transparent 40px, #2c1a0e 40px, #2c1a0e 80px); animation: road-lines 0.5s linear infinite; }
            `}</style>

            <div className="w-full max-w-4xl flex justify-between items-center mb-2 px-4 py-2 bg-black bg-opacity-30 rounded-lg z-30">
                <button onClick={onBack} className="flex items-center gap-2 text-yellow-300 hover:text-yellow-400"><BackIcon /> Back to Lobby</button>
            </div>

            <div className="relative w-full max-w-4xl aspect-video bg-[#191927] rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700" style={{ filter: 'url(#cartoonify)' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-[#4a1d5a] to-[#191927]">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-bold text-yellow-300 z-30 whitespace-nowrap">
                        {getStatusMessage()}
                    </div>
                    <BackgroundHills />
                    <ImprovedTree style={{ left: "15%", transform: "scale(1.2)" }} />
                    <ImprovedTree style={{ left: "80%", transform: "scale(1.1)" }} />
                    <ImprovedTree style={{ left: "45%", transform: "scale(0.9)" }} />
                    <div className={`absolute w-full h-24 bottom-0 bg-[#1c1c1c] border-t-4 border-gray-800 ${gameState.status === 'running' ? 'road-lines-animation' : ''}`}></div>
                    <div className={`absolute bottom-6 left-[10%] transition-transform duration-300 ${gameState.status === 'crashed' ? 'shake-animation' : ''}`} style={{ transform: `translateX(${truckPosition}px)` }}>
                        <TruckIcon />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <h2 className={`text-7xl md:text-9xl font-bold tracking-tighter transition-colors ${gameState.status === 'crashed' ? 'text-red-500' : 'text-white'}`}>
                            {(gameState.multiplier ?? 1).toFixed(2)}x
                        </h2>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl mt-4 grid grid-cols-3 gap-4">
                <div className="bg-[#1e1e2f] p-4 rounded-lg shadow-md border border-gray-700">
                    <h3 className="text-lg font-bold mb-3">Bet Controls</h3>
                    <div className="flex gap-2 mb-3">
                        <input type="number" value={nextBetAmount} min="1" max={balance} onChange={(e) => setNextBetAmount(Number(e.target.value))} className="w-full p-2 rounded bg-gray-800 border border-gray-600" />
                        <button onClick={handlePlaceBet} disabled={gameState.status !== 'waiting' || hasPlacedBet || nextBetAmount > balance} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50">Bet</button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setNextBetAmount(10)} className="px-2 py-1 bg-gray-700 rounded">10</button>
                        <button onClick={() => setNextBetAmount(50)} className="px-2 py-1 bg-gray-700 rounded">50</button>
                        <button onClick={() => setNextBetAmount(100)} className="px-2 py-1 bg-gray-700 rounded">100</button>
                    </div>
                </div>

                <div className="bg-[#1e1e2f] p-4 rounded-lg shadow-md border border-gray-700 flex flex-col items-center justify-center">
                    {gameState.status === 'waiting' && (
                        <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                            <div className="bg-yellow-400 h-3 transition-all duration-500 ease-linear" style={{ width: `${countdownPercentage}%` }}></div>
                        </div>
                    )}
                    {gameState.status === 'running' && hasPlacedBet && !hasCashedOut && (
                        <button onClick={handleCashOut} className="w-full h-full text-xl font-bold bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg">
                            CASH OUT @ {(gameState.multiplier ?? 1).toFixed(2)}x
                        </button>
                    )}
                    {gameState.status === 'running' && hasCashedOut && (
                        <button disabled className="w-full h-full text-xl font-bold bg-blue-400 rounded-lg cursor-not-allowed">
                            CASHED OUT @ {(cashOutMultiplier ?? 1).toFixed(2)}x
                        </button>
                    )}
                </div>

                <div className="bg-[#1e1e2f] p-4 rounded-lg shadow-md border border-gray-700">
                    <h3 className="text-lg font-bold mb-3">Balance & Stats</h3>
                    <p>Balance: <span className="text-green-400">${balance.toFixed(2)}</span></p>
                    <p>Bet: <span className="text-yellow-400">${betAmount}</span></p>
                    <div className="mt-3">
                        <h4 className="font-semibold mb-1">Recent Crashes</h4>
                        <div className="flex gap-2 overflow-x-auto">
                            {recentCrashes.map((mult, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-sm">
                                    {mult.toFixed(2)}x
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
