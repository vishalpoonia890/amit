import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- SVG Icons & Graphics ---
// NOTE: These are self-contained and don't need changes.
const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 140" className="w-full h-full">
        {/* Headlight Glow */}
        <g style={{filter: 'url(#glow)'}}>
            <polygon points="260 85, 300 70, 300 110, 260 95" fill="rgba(255, 223, 186, 0.5)" />
        </g>
        <g>
            {/* Rear Wheels */}
            <g id="wheel-1" className="wheel">
                <path d="M70 83 A 22 22 0 1 1 70 127 A 22 22 0 1 1 70 83" fill="#1c2833"/>
                <circle cx="70" cy="105" r="20" fill="#2c3e50" stroke="#1c2833" strokeWidth="1" />
                <circle cx="70" cy="105" r="10" fill="#bdc3c7" stroke="#34495e" strokeWidth="2" />
                <circle cx="70" cy="105" r="3" fill="#34495e"/>
            </g>
            <g id="wheel-2" className="wheel">
                 <path d="M130 83 A 22 22 0 1 1 130 127 A 22 22 0 1 1 130 83" fill="#1c2833"/>
                <circle cx="130" cy="105" r="20" fill="#2c3e50" stroke="#1c2833" strokeWidth="1" />
                <circle cx="130" cy="105" r="10" fill="#bdc3c7" stroke="#34495e" strokeWidth="2" />
                <circle cx="130" cy="105" r="3" fill="#34495e"/>
            </g>
            {/* Main Body */}
            <path d="M20 95 H180 V60 H30 Z" fill="#c0392b" />
            <path d="M20 95 L30 60 H180 L180 95 Z" stroke="#2c3e50" strokeWidth="3" fill="none"/>
            {/* Cargo */}
            <path d="M25 60 V30 H175 V60" fill="#e67e22" stroke="#2c3e50" strokeWidth="3" />
            <rect x="30" y="35" width="140" height="8" fill="#8D6E63" stroke="#5D4037" strokeWidth="1"/>
            <rect x="30" y="45" width="140" height="8" fill="#795548" stroke="#5D4037" strokeWidth="1"/>
            {/* Decorations */}
            <circle cx="55" cy="78" r="10" fill="#f1c40f" stroke="#2c3e50" strokeWidth="1.5"/>
            <circle cx="95" cy="78" r="10" fill="#2ecc71" stroke="#2c3e50" strokeWidth="1.5"/>
            <circle cx="135" cy="78" r="10" fill="#3498db" stroke="#2c3e50" strokeWidth="1.5"/>
            {/* Cabin */}
            <path d="M180 95 V40 H240 L260 55 V95 Z" fill="#e74c3c" stroke="#2c3e50" strokeWidth="3" />
            <path d="M190 50 H235 V85 H190 Z" fill="rgba(169, 204, 227, 0.7)" stroke="#2c3e50" strokeWidth="2" />
            {/* Front Bumper & Grill */}
            <rect x="255" y="80" width="20" height="15" fill="#f1c40f" stroke="#2c3e50" strokeWidth="2" />
            <rect x="180" y="95" width="95" height="10" fill="#7f8c8d" stroke="#2c3e50" strokeWidth="2"/>
            
            {/* Pushpa Head - V3, Improved Likeness */}
            <g transform="translate(192, 32) scale(2)">
                <path d="M11,25 Q15,29 19,25 L18,19 H12Z" fill="#8e44ad" />
                <path d="M14,17.5 h2 v3 h-2z" fill="#f39c12"/>
                <path d="M15,2 C5,2 3,25 10,28 Q15,32 20,28 C27,25 25,2 15,2" fill="#2c3e50"/>
                <path d="M15,6 C10,6 8,18 11,21 h8 C22,18 20,6 15,6" fill="#f39c12"/>
                <rect x="7" y="11" width="16" height="6" rx="2" fill="#111" />
                <path d="M9,22 C12,20, 18,20, 21,22 C18,24, 12,24, 9,22" fill="#1c1c1c" />
                <circle cx="6" cy="18" r="1.5" fill="#f1c40f" stroke="#333" strokeWidth="0.5"/>
            </g>
            
            {/* Front Wheel */}
            <g id="wheel-3" className="wheel">
                <path d="M235 83 A 22 22 0 1 1 235 127 A 22 22 0 1 1 235 83" fill="#1c2833"/>
                <circle cx="235" cy="105" r="20" fill="#2c3e50" stroke="#1c2833" strokeWidth="1" />
                <circle cx="235" cy="105" r="10" fill="#bdc3c7" stroke="#34495e" strokeWidth="2" />
                <circle cx="235" cy="105" r="3" fill="#34495e"/>
            </g>
        </g>
    </svg>
);


const ImprovedTree = ({ style }) => (
    <svg viewBox="0 0 150 250" className="h-32 w-24 absolute bottom-12" style={style}>
        <path d="M75,250 L85,100 L75,100 L75,0 L50,50 L25,80 L50,85 L40,150 L65,100 L75,250 Z" fill="#145A32"/>
        <path d="M75,250 L65,100 L75,100 L75,20 L90,60 L125,90 L95,95 L110,160 L85,100 L75,250 Z" fill="#1E8449"/>
    </svg>
);

const BackgroundHills = () => (
    <svg viewBox="0 0 800 200" className="absolute bottom-10 left-0 w-full h-48 z-0 opacity-50" preserveAspectRatio="none">
        <path d="M0 200 L0 120 Q 150 40, 300 130 T 600 100 T 800 140 L 800 200 Z" fill="#2c0b2e" />
        <path d="M0 200 L0 150 Q 200 100, 400 160 T 800 150 L 800 200 Z" fill="#4a1d5a" opacity="0.5" />
    </svg>
);


// --- Main Game Component ---
export default function PushpaRajGame({ onBack, token, ws, realtimeData, financialSummary, onBetPlaced }) {
    // Game state from WebSocket
    const [gameState, setGameState] = useState({ status: 'connecting', roundId: null, multiplier: 1.00 });
    
    // Local player state
    const [balance, setBalance] = useState(financialSummary?.balance || 1000);
    const [betAmount, setBetAmount] = useState(10);
    const [nextBetAmount, setNextBetAmount] = useState(10);
    const [hasPlacedBet, setHasPlacedBet] = useState(false);
    const [hasCashedOut, setHasCashedOut] = useState(false);
    const [cashOutMultiplier, setCashOutMultiplier] = useState(0);
    const [notification, setNotification] = useState('');

    // Animation & display state
    const [truckPosition, setTruckPosition] = useState(0);
    const [recentCrashes, setRecentCrashes] = useState([]); // This would need a separate API call to fetch
    const [countdown, setCountdown] = useState(100);
    
    // --- Sound State ---
    const sounds = useRef(null);
    const [isAudioReady, setIsAudioReady] = useState(false);
    
    // --- Game State Update Effect ---
    useEffect(() => {
        if (realtimeData) {
            // Listen for general Pushpa game state updates
            if (realtimeData.type === 'PUSHPA_STATE_UPDATE') {
                const { status, roundId, multiplier, crashMultiplier, countdown: serverCountdown, waitingTime } = realtimeData.payload;
                
                // Reset player state on new round
                if (gameState.roundId !== roundId) {
                    setHasPlacedBet(false);
                    setHasCashedOut(false);
                    setCashOutMultiplier(0);
                }

                setGameState(realtimeData.payload);
                
                if(status === 'running') {
                    const elapsed = (1 - (serverCountdown / waitingTime)) * (waitingTime / 1000);
                    const newPosition = elapsed * (10 + Math.log(multiplier));
                    setTruckPosition(newPosition);
                }
            }

            // Listen for specific outcomes for THIS user
            if(realtimeData.type === 'PUSHPA_BET_SUCCESS') {
                setNotification('Bet placed successfully!');
                setTimeout(() => setNotification(''), 3000);
                onBetPlaced(); // This function should be passed from App.js to refresh balance
            }
            if(realtimeData.type === 'PUSHPA_BET_ERROR') {
                setNotification(realtimeData.message || 'Bet failed!');
                setHasPlacedBet(false); // Re-enable betting button
                setTimeout(() => setNotification(''), 3000);
            }
            if(realtimeData.type === 'PUSHPA_CASHOUT_SUCCESS') {
                setNotification(`Cashed out for ${realtimeData.payout.toFixed(2)}!`);
                setTimeout(() => setNotification(''), 3000);
                onBetPlaced(); // Refresh balance
            }
        }
    }, [realtimeData, gameState.roundId, onBetPlaced]);

    // Update balance from props
    useEffect(() => {
        if(financialSummary) {
            setBalance(financialSummary.balance);
        }
    }, [financialSummary]);


    // --- Countdown Timer Effect ---
    useEffect(() => {
        if (gameState.status === 'waiting' && gameState.countdown && gameState.waitingTime) {
            const percentage = (gameState.countdown / gameState.waitingTime) * 100;
            setCountdown(percentage);
        } else {
            setCountdown(0);
        }
    }, [gameState.status, gameState.countdown, gameState.waitingTime]);


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
        if (window.Tone && window.Tone.context.state !== 'running') { await window.Tone.start(); }
        setIsAudioReady(true);
    };
    
    // --- Sound Playing Effect ---
    useEffect(() => {
        if (isAudioReady && sounds.current) {
            if (gameState.status === 'running' && sounds.current.engineSound.state === 'stopped') {
                sounds.current.engineSound.triggerAttack();
            } else if (gameState.status !== 'running' && sounds.current.engineSound.state === 'started') {
                sounds.current.engineSound.triggerRelease();
            }
            if (gameState.status === 'crashed' && (realtimeData?.payload?.prevStatus === 'running')) {
                 sounds.current.crashSound.triggerAttackRelease("1n");
            }
        }
    }, [gameState.status, isAudioReady, realtimeData]);
    
    // --- User Actions ---
    const handlePlaceBet = async () => {
        if (!isAudioReady) await initAudio();
        if (sounds.current) sounds.current.betSound.triggerAttackRelease("C4", "8n");
        if (balance >= nextBetAmount) { 
            setHasPlacedBet(true); 
            ws.send(JSON.stringify({
                game: 'pushpa',
                action: 'bet',
                payload: { token, betAmount: nextBetAmount, roundId: gameState.roundId }
            }));
        } else { 
            setNotification("Insufficient balance!"); 
            setTimeout(() => setNotification(''), 3000); 
        }
    };
    const handleCancelBet = () => { /* Cancellation logic would need backend support */ };
    const handleCashOut = () => {
        if (sounds.current) sounds.current.cashOutSound.triggerAttackRelease("G5", "4n");
        if (gameState.status === 'running' && hasPlacedBet && !hasCashedOut) {
            setHasCashedOut(true);
            ws.send(JSON.stringify({
                game: 'pushpa',
                action: 'cashout',
                payload: { token, roundId: gameState.roundId }
            }));
        }
    };
    
    // --- UI Components ---
    const renderActionButton = () => {
        if (gameState.status === 'waiting') {
            if (hasPlacedBet) { return ( <button disabled className="w-full h-full text-xl font-bold bg-gray-500 rounded-lg"> WAITING FOR START... </button> ); }
            return ( <button onClick={handlePlaceBet} className="w-full h-full text-xl font-bold bg-green-500 hover:bg-green-600 rounded-lg shadow-lg transition-all transform hover:scale-105"> PLACE BET </button> );
        }
        if (gameState.status === 'running') {
            if (hasPlacedBet && !hasCashedOut) { return ( <button onClick={handleCashOut} className="w-full h-full text-xl font-bold bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-lg transition-all transform hover:scale-105"> CASH OUT @ {gameState.multiplier.toFixed(2)}x </button> ); }
            if(hasCashedOut){ return ( <button disabled className="w-full h-full text-xl font-bold bg-blue-400 rounded-lg cursor-not-allowed"> CASHED OUT @ {cashOutMultiplier.toFixed(2)}x </button> ); }
        }
        return ( <button disabled className="w-full h-full text-xl font-bold bg-gray-700 rounded-lg cursor-not-allowed"> WAITING FOR NEXT ROUND... </button> );
    };
    const getMultiplierColor = () => {
        if (gameState.status === 'crashed') return 'text-red-500';
        if (gameState.multiplier > 5) return 'text-green-400';
        if (gameState.multiplier > 2) return 'text-yellow-400';
        return 'text-white';
    };
    const getStatusMessage = () => {
        switch (gameState.status) {
            case 'connecting': return 'CONNECTING...';
            case 'waiting': return 'PLACE YOUR BETS!';
            case 'running': return hasCashedOut ? `SUCCESSFULLY CASHED OUT!` : 'Rukega nahi saala!';
            case 'crashed': return `TRUCK STOPPED!`;
            default: return '';
        }
    };

    return (
        <div className="w-full h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden antialiased">
            {notification && ( <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white py-2 px-6 rounded-lg shadow-xl z-50 transition-opacity duration-300"> {notification} </div> )}
             <svg width="0" height="0">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="cartoonify">
                        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="turbulence"/>
                        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.5" />
                    </filter>
                </defs>
            </svg>
             <style>{`
                @keyframes wheel-spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
                .wheel { animation: wheel-spin 0.4s linear infinite; }
                #wheel-1 { transform-origin: 70px 105px; }
                #wheel-2 { transform-origin: 130px 105px; }
                #wheel-3 { transform-origin: 235px 105px; }
                @keyframes shake { 0%, 100% { transform: translate(0, 0) rotate(0); } 25% { transform: translate(-1px, 1px) rotate(-0.5deg); } 50% { transform: translate(1px, -1px) rotate(0.5deg); } 75% { transform: translate(-1px, -1px) rotate(0.2deg); } }
                .shake-animation { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes road-lines { from { background-position: 0 50%; } to { background-position: -200px 50%; } }
                .road-lines-animation { background-image: repeating-linear-gradient(90deg, transparent, transparent 40px, #2c1a0e 40px, #2c1a0e 80px); animation: road-lines 0.5s linear infinite; }
             `}</style>
            
            <div className="w-full max-w-4xl flex justify-between items-center mb-2 px-4 py-2 bg-black bg-opacity-30 rounded-lg z-30">
                <button onClick={onBack} className="text-yellow-300 font-bold hover:underline">&lt; Back to Lobby</button>
                <div className="text-lg">Balance: <span className="font-bold text-green-400">${Number(balance).toFixed(2)}</span></div>
            </div>

            <div className="w-full max-w-4xl flex justify-center items-center gap-2 mb-2 z-30">
                <span className="text-gray-400 text-sm">Recent:</span>
                {recentCrashes.map((crash, i) => ( <span key={i} className={`px-2 py-1 rounded-full text-xs font-semibold ${crash >= 2 ? 'bg-green-500' : 'bg-red-500'} bg-opacity-70`}> {crash.toFixed(2)}x </span> ))}
            </div>

            <div className="relative w-full max-w-4xl aspect-video bg-[#191927] rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700" style={{filter: 'url(#cartoonify)'}}>
                <div className="absolute inset-0 bg-gradient-to-b from-[#4a1d5a] to-[#191927]">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-bold text-yellow-300 z-30 whitespace-nowrap" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                        Pushpa Rani, Paisa Banaye Aasani!!
                    </div>
                    <BackgroundHills />
                     <ImprovedTree style={{ left: `${(100 - (truckPosition * 0.4) % 150)}%`, zIndex: 1, transform: 'scale(0.7)', filter: 'blur(1.5px)' }} />
                     <ImprovedTree style={{ left: `${(120 - (truckPosition * 0.8) % 200)}%`, zIndex: 3, transform: 'scale(1.1)' }} />
                     <ImprovedTree style={{ left: `${(60 - (truckPosition * 0.5) % 180)}%`, zIndex: 2, transform: 'scale(0.9)', filter: 'blur(1px)' }} />
                     <ImprovedTree style={{ left: `${(150 - (truckPosition * 0.7) % 220)}%`, zIndex: 2, transform: 'scale(1.0)' }} />
                     <ImprovedTree style={{ left: `${(200 - (truckPosition * 0.6) % 250)}%`, zIndex: 1, transform: 'scale(0.8)', filter: 'blur(1px)' }} />
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-24 bg-[#4a2c0f]"></div>
                <div className={`absolute bottom-16 left-0 w-full h-1 road-lines-animation ${gameState.status === 'running' ? 'opacity-100' : 'opacity-0'}`}></div>
                
                {gameState.status === 'waiting' && (
                    <div className="absolute top-0 left-0 w-full h-2.5 bg-gray-700/50 z-20">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-100 ease-linear rounded-r-full" style={{ width: `${countdown}%` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                            STARTING IN {((countdown / 100) * (15)).toFixed(1)}s
                        </div>
                    </div>
                )}

                <div className={`absolute bottom-4 z-10 w-72 h-36 transition-transform duration-100 ease-linear ${gameState.status === 'crashed' ? 'shake-animation' : ''}`} style={{ left: '5%', transform: `translateX(${Math.min(truckPosition, 500)}px)`}}>
                   <TruckIcon />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-20 pointer-events-none z-20">
                    <h2 className={`text-7xl md:text-9xl font-bold tracking-tighter transition-colors ${getMultiplierColor()}`}>{gameState.multiplier.toFixed(2)}x</h2>
                    <p className="text-xl mt-2 font-semibold text-gray-200 bg-black bg-opacity-40 px-4 py-1 rounded-md">{getStatusMessage()}</p>
                </div>
            </div>

            <div className="w-full max-w-4xl mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 z-30">
                <div className="md:col-span-1 bg-gray-800 p-4 rounded-lg flex flex-col justify-center">
                    <label htmlFor="bet-amount" className="text-sm text-gray-400">Bet Amount</label>
                    <div className="flex items-center mt-1">
                        <span className="text-green-400 font-bold mr-2">$</span>
                        <input
                            type="number" id="bet-amount" value={nextBetAmount}
                            onChange={(e) => setNextBetAmount(Math.max(0, parseFloat(e.target.value)))}
                            disabled={gameState.status !== 'waiting' || hasPlacedBet}
                            className="w-full bg-gray-900 text-white font-bold text-lg p-2 rounded border-2 border-gray-700 focus:border-green-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="md:col-span-2 bg-gray-800 p-2 rounded-lg h-24">
                     {renderActionButton()}
                </div>
            </div>
        </div>
    );
}
