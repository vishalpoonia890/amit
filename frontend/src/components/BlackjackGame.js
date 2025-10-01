// blackjackgame.js (Final Version with Card Display Fix)

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './BlackjackGame.css'; // Ensure this path is correct

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Utility Functions (Deck/Hand Logic) ---

const createDeck = () => {
    const suits = ['♥', '♦', '♣', '♠'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const newDeck = [];
    for (const suit of suits) {
        for (const value of values) {
            newDeck.push({ value, suit });
        }
    }
    return newDeck;
};

const shuffleDeck = (deck) => {
    let newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};

const calculateHandValue = (hand) => {
    let value = 0;
    let aceCount = 0;

    for (const card of hand) {
        if (card.value === 'A') {
            aceCount++;
            value += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }

    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    return value;
};


// --- Card Component (Styled, Responsive, and FIXED) ---

const Card = ({ card, isHidden = false }) => {
    // Suit color refinement for better contrast
    const suitColor = card && (card.suit === '♥' || card.suit === '♦') ? 'text-red-700' : 'text-gray-900';
    
    // Responsive sizing and CRITICAL: flex-shrink-0 to prevent collapsing
    const cardSizeClasses = "w-[50px] h-[80px] sm:w-24 sm:h-32 flex-shrink-0"; 

    if (isHidden) {
        return (
            // Card Back (MP side)
            <div className={`card-face card-back ${cardSizeClasses} bg-yellow-900/90 border-2 border-yellow-300 rounded-lg shadow-xl flex items-center justify-center transform rotate-3`}>
                <span className="text-xl font-extrabold text-gray-800 tracking-widest text-shadow-md">MP</span>
            </div>
        );
    }
    
    return (
        // Card Front: MUST use 'flex flex-col' for vertical stacking of value/suit
        <div className={`card-face card-front bg-white border ${cardSizeClasses} rounded-lg shadow-md flex flex-col p-1 sm:p-2 text-xs sm:text-base font-bold select-none transition-all duration-300`}>
            
            {/* Top Value (Properly sized and aligned) */}
            <div className={`text-left text-xs sm:text-lg ${suitColor}`}>
                {card.value}
            </div> 
            
            {/* Center Suit (Uses flex-grow to occupy space and centers the large suit symbol) */}
            <div className={`flex-grow flex items-center justify-center text-xl sm:text-4xl ${suitColor}`}>
                {card.suit}
            </div>
            
            {/* Bottom Value (Rotated) */}
            <div className={`text-right text-xs sm:text-lg ${suitColor} rotate-180`}>
                {card.value}
            </div> 
        </div>
    );
};


// --- Main Blackjack Component ---

const BlackjackGame = ({ onBack, userToken }) => {
    // --- State Management ---
    const [balance, setBalance] = useState(1000); 
    const [currentBet, setCurrentBet] = useState(0);
    const [deck, setDeck] = useState(shuffleDeck(createDeck()));
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [gameState, setGameState] = useState('betting');
    const [message, setMessage] = useState('Place your bet and hit DEAL.');
    const [isDealerCardHidden, setIsDealerCardHidden] = useState(true);
    const [blackjackSettings, setBlackjackSettings] = useState({ luckFactor: 0, isManualShuffle: false });

    const chips = [10, 50, 100, 500];
    const minBet = 10;
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);


    // --- Server Settings Fetch ---
    const fetchAdminSettings = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/blackjack-settings`, {
                headers: { Authorization: `Bearer ${userToken || 'MOCK_TOKEN'}` }
            });
            setBlackjackSettings(response.data.settings);
        } catch (error) {
            setBlackjackSettings({ luckFactor: 0, isManualShuffle: false });
        }
    }, [userToken]);

    useEffect(() => {
        fetchAdminSettings();
    }, [fetchAdminSettings]);


    // --- Game Logic Functions (Includes 'is not iterable' Fix) ---

    const drawCard = () => {
        // Fix for "is not iterable" error: Ensure 'deck' is a valid array, reshuffle if empty/invalid.
        let currentDeck = Array.isArray(deck) && deck.length >= 1 
                          ? [...deck] 
                          : shuffleDeck(createDeck()); 

        if (currentDeck.length < 5) {
            setMessage("Shuffling a new deck...");
            currentDeck = shuffleDeck(createDeck());
        }

        const card = currentDeck.pop();
        setDeck(currentDeck); 
        return card;
    };

    const placeBet = (amount) => {
        if (gameState !== 'betting') return;
        if (amount > balance) {
            setMessage('Insufficient balance.');
            return;
        }
        setBalance(b => b - amount);
        setCurrentBet(b => b + amount);
        setMessage(`Bet increased to ₹${currentBet + amount}.`);
    };

    const clearBet = () => {
        if (gameState !== 'betting' || currentBet === 0) return;
        setBalance(b => b + currentBet);
        setCurrentBet(0);
        setMessage('Bet cleared. Place a new bet.');
    };

    const deal = () => {
        if (gameState !== 'betting' || currentBet < minBet) {
            setMessage(`Minimum bet is ₹${minBet}.`);
            return;
        }
        
        setGameState('playerTurn');
        setMessage('Player turn! Hit, Stand, or Double.');
        setIsDealerCardHidden(true);

        let pHand = [];
        let dHand = [];

        pHand.push(drawCard());
        dHand.push(drawCard());
        pHand.push(drawCard());
        dHand.push(drawCard());

        setPlayerHand(pHand);
        setDealerHand(dHand);

        if (calculateHandValue(pHand) === 21) {
            setMessage('BLACKJACK! Checking dealer...');
            setTimeout(() => finishGame(calculateHandValue(dHand) === 21 ? 'push' : 'playerBlackjack'), 1500);
        }
    };

    const hit = () => {
        if (gameState !== 'playerTurn') return;
        
        const newCard = drawCard();
        const newHand = [...playerHand, newCard];
        setPlayerHand(newHand);
        
        const newValue = calculateHandValue(newHand);

        if (newValue > 21) {
            setMessage('Bust! Over 21.');
            setTimeout(() => finishGame('dealerWin'), 1000);
        } else if (newValue === 21) {
            setMessage('21! Standing...');
            setTimeout(stand, 1000);
        } else {
            setMessage('You hit.');
        }
    };

    const stand = () => {
        if (gameState !== 'playerTurn') return;
        setGameState('dealerTurn');
        setMessage('Dealer is playing...');
        setIsDealerCardHidden(false);
        setTimeout(dealerPlay, 1500);
    };

    const doubleDown = () => {
        if (gameState !== 'playerTurn' || currentBet * 2 > balance || playerHand.length > 2) {
            setMessage('Double Down only allowed on first move or insufficient balance.');
            return;
        }

        setBalance(b => b - currentBet);
        setCurrentBet(b => b * 2);

        const newCard = drawCard();
        const newHand = [...playerHand, newCard];
        setPlayerHand(newHand);
        setMessage('Double Down! One card taken. Standing.');

        const newValue = calculateHandValue(newHand);

        if (newValue > 21) {
            setTimeout(() => finishGame('dealerWin'), 1500);
        } else {
            setGameState('dealerTurn');
            setTimeout(dealerPlay, 2000);
        }
    };

    const dealerPlay = () => {
        let dHand = [...dealerHand];
        
        const playMove = () => {
            let dValue = calculateHandValue(dHand);
            const pValue = calculateHandValue(playerHand);

            if (dValue < 17) {
                const newCard = drawCard();
                dHand.push(newCard);
                setDealerHand(dHand);
                setMessage('Dealer hits...');
                setTimeout(playMove, 1500);
            } else if (dValue > 21) {
                setMessage('Dealer busts!');
                setTimeout(() => finishGame('playerWin'), 1500);
            } else {
                setMessage('Dealer stands.');
                setTimeout(() => {
                    if (dValue > pValue) {
                        finishGame('dealerWin');
                    } else if (pValue > dValue) {
                        finishGame('playerWin');
                    } else {
                        finishGame('push');
                    }
                }, 1500);
            }
        };
        
        playMove();
    };

    const finishGame = (result) => {
        setGameState('finished');
        let title = '';
        let finalMessage = '';
        let payout = 0;
        
        setIsDealerCardHidden(false); 

        const finalPValue = calculateHandValue(playerHand);
        const finalDValue = calculateHandValue(dealerHand);

        switch (result) {
            case 'playerWin':
                title = 'PLAYER WINS! 🎉'; 
                finalMessage = `You won ₹${currentBet}! Your ${finalPValue} beat the dealer's ${finalDValue}.`;
                payout = currentBet * 2;
                break;
            case 'playerBlackjack':
                title = 'BLACKJACK! ♠️'; 
                finalMessage = `You got a Blackjack! Payout is 1.5x. You win ₹${(currentBet * 1.5).toFixed(0)}.`;
                payout = currentBet * 2.5;
                break;
            case 'dealerWin':
                title = 'DEALER WINS! 💔'; 
                finalMessage = `The dealer won with ${finalDValue}. You lost ₹${currentBet}.`;
                payout = 0;
                break;
            case 'push':
                title = 'PUSH (TIE) 🤝'; 
                finalMessage = `It's a tie at ${finalPValue}. Your bet of ₹${currentBet} is returned.`;
                payout = currentBet;
                break;
            default:
                title = 'ERROR';
                finalMessage = 'An unexpected result occurred. Bet returned.';
                payout = currentBet;
        }

        setBalance(b => b + payout);
        
        setTimeout(() => {
             document.getElementById('resultDialog').classList.remove('hidden');
             document.getElementById('dialogTitle').textContent = title;
             document.getElementById('dialogMessage').textContent = finalMessage;
        }, 500);
        
        setTimeout(() => {
             setCurrentBet(0);
        }, 100);
    };

    const startNewRound = () => {
        document.getElementById('resultDialog').classList.add('hidden');
        setGameState('betting');
        setPlayerHand([]);
        setDealerHand([]);
        setIsDealerCardHidden(true);
        setMessage('Place your bet and hit DEAL.');
    };

    const getDealerVisibleValue = () => {
        if (dealerHand.length === 0) return 0;
        if (isDealerCardHidden) {
            return calculateHandValue([dealerHand[0]]);
        }
        return dealerValue;
    };


    // --- UI Rendering ---

    const renderActionButtons = () => (
        <div id="actionControls" className="flex flex-col sm:flex-row gap-4 justify-center p-2"> 
            <button 
                onClick={hit} 
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-full shadow-2xl disabled:opacity-50 transition-all action-button"
                disabled={gameState !== 'playerTurn'}
            >
                HIT
            </button>
            <button 
                onClick={stand} 
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full shadow-2xl disabled:opacity-50 transition-all action-button"
                disabled={gameState !== 'playerTurn'}
            >
                STAND
            </button>
            <button 
                onClick={doubleDown} 
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-2xl disabled:opacity-50 transition-all action-button"
                disabled={gameState !== 'playerTurn' || currentBet * 2 > balance || playerHand.length > 2}
            >
                DOUBLE DOWN
            </button>
        </div>
    );
    
    const renderBettingArea = () => (
        <div className="w-full p-4 sm:p-6 bg-gray-900/95 border-t border-yellow-500/30 rounded-t-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between">
            
            {/* 1. Player Info & Current Bet */}
            <div className="flex justify-between items-center w-full sm:w-1/3 mb-4 sm:mb-0">
                <p className="text-sm font-bold text-white tracking-wider sm:text-lg">BALANCE: <span className="text-yellow-400 text-lg sm:text-2xl">₹{balance.toLocaleString()}</span></p>
                <p className={`text-sm font-semibold ${currentBet > 0 ? 'text-green-400' : 'text-gray-400'} transition-colors sm:text-lg`}>BET: <span className="text-lg sm:text-2xl font-extrabold">₹{currentBet.toLocaleString()}</span></p>
            </div>
            
            {/* 2. Chip Controls */}
            <div className="flex flex-wrap gap-2 justify-center w-full sm:w-1/3 mb-4 sm:mb-0">
                {chips.map(value => (
                    <button
                        key={value}
                        className="betting-chip w-12 h-12 text-sm font-extrabold rounded-full transition-transform sm:w-16 sm:h-16 sm:text-base"
                        style={{ backgroundColor: value === 500 ? '#ffb700' : value === 100 ? '#4caf50' : value === 50 ? '#2196f3' : '#e91e63' }}
                        onClick={() => placeBet(value)}
                        disabled={gameState !== 'betting' || value > balance}
                    >
                        {value}
                    </button>
                ))}
                <button
                    className="clear-bet-button bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full shadow-md disabled:opacity-50 transition-colors text-xs self-center"
                    onClick={clearBet}
                    disabled={gameState !== 'betting' || currentBet === 0}
                >
                    Clear
                </button>
            </div>
            
            {/* 3. Deal Button */}
            <div className="w-full sm:w-1/3 flex justify-center sm:justify-end">
                 <button 
                    onClick={deal} 
                    className="bg-red-700 hover:bg-red-800 text-white font-black py-3 px-8 rounded-full shadow-2xl disabled:opacity-50 transition-all transform hover:scale-[1.05] text-lg tracking-widest deal-button w-full sm:w-auto"
                    disabled={gameState !== 'betting' || currentBet < minBet}
                >
                    DEAL
                </button>
            </div>
        </div>
    );

    return (
        <div className="blackjack-game-container p-2 sm:p-8 min-h-screen text-white flex flex-col">
            <div className="flex justify-between items-center max-w-4xl mx-auto w-full mb-4">
                 <button onClick={onBack} className="mb-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-lg shadow-md transition-colors flex items-center text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Lobby
                </button>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-yellow-500 tracking-widest text-shadow-lg">Blackjack 21</h1>
            </div>
            
            <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
                
                {/* --- Main Game Table --- */}
                <div className="game-table-felt p-4 sm:p-8 rounded-2xl shadow-2xl flex-grow mb-4">
                    
                    {/* Dealer Hand Area (Top) */}
                    <div className="text-center mb-8">
                        <p className="text-base sm:text-xl font-bold mb-3 text-yellow-300">
                            Dealer ({dealerHand.length > 0 ? getDealerVisibleValue() : '0'})
                        </p>
                        <div className="flex gap-3 justify-center min-h-[120px] overflow-x-auto card-hand-container flex-nowrap"> 
                            {dealerHand.map((card, index) => (
                                <Card key={index} card={card} isHidden={isDealerCardHidden && index === 1} />
                            ))}
                        </div>
                    </div>

                    {/* Game Message (Center) & Bet Visualizer */}
                    <div className="flex justify-center items-center my-4 h-16 relative sm:h-20">
                        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${currentBet > 0 ? 'visible' : 'hidden'} transition-all duration-500 bet-visualizer`}>
                            <div className="chip-stack bg-red-800 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center border-4 border-yellow-500 shadow-2xl p-2 text-center">
                                <span className="text-sm font-black text-white sm:text-xl">BET <br/> ₹{currentBet.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                             <p className={`text-lg sm:text-2xl font-black text-yellow-100 p-2 rounded-lg bg-black/50 backdrop-blur-sm transition-opacity duration-500 message-bar ${gameState !== 'betting' ? 'opacity-100' : 'opacity-80'}`}>
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Player Hand Area (Bottom) */}
                    <div className="mt-8 text-center">
                        <p className="text-base sm:text-xl font-bold mb-3 text-yellow-300">
                            Your Hand ({playerHand.length > 0 ? playerValue : '0'})
                        </p>
                        <div className="flex gap-3 justify-center min-h-[120px] overflow-x-auto card-hand-container flex-nowrap"> 
                            {playerHand.map((card, index) => (
                                <Card key={index} card={card} isHidden={false} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Action/Betting Control Panel --- */}
                <div className="bg-gray-900/90 py-4 shadow-top-heavy">
                    {gameState === 'betting' ? renderBettingArea() : renderActionButtons()}
                </div>
            </div>

            {/* Modal Dialog for Game End */}
            <div id="resultDialog" className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 hidden">
                <div className="bg-gray-900 p-6 rounded-xl shadow-2xl text-center max-w-xs w-11/12 transform transition-all result-dialog-style">
                    <h3 id="dialogTitle" className="text-2xl sm:text-3xl font-extrabold mb-4 text-yellow-400">Game Over!</h3>
                    <p id="dialogMessage" className="text-sm sm:text-lg mb-6 text-gray-300"></p>
                    <button 
                        id="newRoundButton" 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-colors w-full" 
                        onClick={startNewRound}
                    >
                        New Bet
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlackjackGame;
