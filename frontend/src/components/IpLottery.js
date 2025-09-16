import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './GamePages.css'; // Shared stylesheet

// --- Game Configuration ---
const DRAW_TIMES_HOURS = [12, 16, 20]; // 12:00 PM, 4:00 PM, 8:00 PM IST

// --- Helper Function to get the next draw ---
const getNextDraw = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (const hour of DRAW_TIMES_HOURS) {
        const drawTime = new Date(today);
        drawTime.setHours(hour, 0, 0, 0); // Set to the specific hour, minute 0, second 0
        if (now < drawTime) {
            return {
                endTime: drawTime,
                id: `${today.toISOString().slice(0, 10)}-${hour}`
            };
        }
    }
    
    // If all draws for today have passed, get the first draw of tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextDrawTime = new Date(tomorrow);
    nextDrawTime.setHours(DRAW_TIMES_HOURS[0], 0, 0, 0);
    return {
        endTime: nextDrawTime,
        id: `${tomorrow.toISOString().slice(0, 10)}-${DRAW_TIMES_HOURS[0]}`
    };
};

// --- Countdown Component ---
const Countdown = ({ endTime }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(endTime) - +new Date();
        if (difference <= 0) return "DRAWING NOW";
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [endTime]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });

    return <span>{timeLeft}</span>;
};

function IpLottery({ token, onBack }) {
    const [round, setRound] = useState(null);
    const [selectedNumA, setSelectedNumA] = useState(null);
    const [selectedNumB, setSelectedNumB] = useState(null);
    const [betAmount, setBetAmount] = useState(100);

    // Live Stats Simulation
    const [currentPlayers, setCurrentPlayers] = useState(1345);
    const [totalPool, setTotalPool] = useState(875630);

    useEffect(() => {
        const nextDraw = getNextDraw();
        setRound({
            roundId: nextDraw.id,
            endTime: nextDraw.endTime,
        });

        // Simulate live stats increasing
        const interval = setInterval(() => {
            setCurrentPlayers(prev => prev + Math.floor(Math.random() * 5) + 1);
            setTotalPool(prev => prev + Math.floor(Math.random() * 1000) + 100);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleNumberSelect = (num) => {
        if (selectedNumA === num) setSelectedNumA(null);
        else if (selectedNumB === num) setSelectedNumB(null);
        else if (selectedNumA === null) setSelectedNumA(num);
        else if (selectedNumB === null) setSelectedNumB(num);
    };

    const handleBet = () => {
        if (selectedNumA === null && selectedNumB === null) {
            alert("Please select at least one number.");
            return;
        }
        if (betAmount < 100) {
            alert("Minimum bet amount is ₹100.");
            return;
        }
        
        let betDetails = `You bet ₹${betAmount} on the number(s): ${[selectedNumA, selectedNumB].filter(n => n !== null).join(', ')}.`;
        alert(`${betDetails} Good luck!`);
    };
    
    if (!round) {
        return <div className="loading-spinner">Loading Lottery...</div>;
    }

    const isSingleSelection = selectedNumA !== null && selectedNumB === null;
    const isDoubleSelection = selectedNumA !== null && selectedNumB !== null;

    return (
        <div className="game-page-container lottery-theme">
            <button className="back-button" onClick={onBack}>← Back to Lobby</button>
            <div className="game-header">
                <h1>IP Lottery</h1>
                <p>Next Draw: {new Date(round.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                <div className="round-timer">
                    <Countdown endTime={round.endTime} />
                </div>
            </div>

            <div className="live-pool-card">
                <div className="pool-stat">
                    <span>Current Players</span>
                    <strong>{currentPlayers.toLocaleString('en-IN')}</strong>
                </div>
                <div className="pool-stat">
                    <span>Total Pool Amount</span>
                    <strong>₹{totalPool.toLocaleString('en-IN')}</strong>
                </div>
            </div>

            <div className="lottery-card">
                <h3>Select Your Numbers</h3>
                <p className="selection-info">Select one number for a 2.5x win, or two numbers for the 25x jackpot!</p>
                <div className="number-grid">
                    {Array.from({ length: 10 }, (_, i) => i).map(num => (
                        <button 
                            key={num}
                            className={`num-button ${(selectedNumA === num || selectedNumB === num) ? 'selected' : ''}`}
                            onClick={() => handleNumberSelect(num)}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="lottery-card bet-controls">
                <h3>Place Your Bet</h3>
                <div className="quick-bet-buttons">
                    {[100, 250, 500, 1000].map(amount => (
                        <button key={amount} onClick={() => setBetAmount(amount)}>₹{amount}</button>
                    ))}
                </div>
                <div className="bet-input-group">
                    <span>₹</span>
                    <input 
                        type="number" 
                        value={betAmount} 
                        onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                        min="100"
                    />
                </div>
                <button className="action-button" onClick={handleBet}>
                    Confirm Bet
                </button>
            </div>

            <div className="rules-card">
                <h4>How to Win</h4>
                <p><strong>Single Number Bet (2.5x):</strong> If you select only one number and it matches one of the two winning numbers, you win 2.5x your bet.</p>
                <p><strong>Double Number Bet (25x):</strong> If you select two numbers and they both match the two winning numbers (in any order), you win the 25x jackpot!</p>
                <p><strong>Important:</strong> If you select two numbers and only one matches, you do not win.</p>
                <p><strong>Regional Pool:</strong> To ensure the best odds, this prize pool is specific to your IP location.</p>
            </div>
        </div>
    );
}

export default IpLottery;

