import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// IMPORTANT: This component assumes a client-side environment where a central state
// (like a Redux/Context Store) holds the user's balance and token.
// For this standalone component, BALANCE is managed locally.

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com'; // Use your actual API base URL

// --- Card Components and Logic ---

/** Creates a visual representation of a single card using SVG/divs. */
const Card = ({ card, isHidden = false }) => {
    const suitColor = card && (card.suit === '♥' || card.suit === '♦') ? 'text-red-500' : 'text-gray-900';
    
    if (isHidden) {
        return (
            <div className="w-[70px] h-[100px] sm:w-20 sm:h-28 bg-blue-700 border-2 border-yellow-300 rounded-lg shadow-xl flex items-center justify-center">
                <span className="text-xl font-extrabold text-white transform rotate-12">BJ</span>
            </div>
        );
    }
    
    return (
        <div className="w-[70px] h-[100px] sm:w-20 sm:h-28 bg-white border border-gray-300 rounded-lg shadow-md flex flex-col p-1 sm:p-2 text-xs sm:text-base font-bold">
            <div className={`text-left ${suitColor}`}>{card.value}</div>
            <div className={`flex-grow flex items-center justify-center text-xl sm:text-2xl ${suitColor}`}>
                {card.suit}
            </div>
            <div className={`text-right ${suitColor} rotate-180`}>{card.value}</div>
        </div>
    );
};


// Deck utility functions (pure logic, adapted for React state)
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

// --- Main Blackjack Component ---

const BlackjackGame = ({ userToken }) => {
    // --- State Management ---
    const [balance, setBalance] = useState(1000); // Mock User Balance
    const [currentBet, setCurrentBet] = useState(0);
    const [deck, setDeck] = useState(shuffleDeck(createDeck()));
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [gameState, setGameState] = useState('betting'); // betting, playerTurn, dealerTurn, finished
    const [message, setMessage] = useState('Place your bet and hit DEAL.');
    const [isDealerCardHidden, setIsDealerCardHidden] = useState(true);
    const [blackjackSettings, setBlackjackSettings] = useState({ luckFactor: 0, isManualShuffle: false });


    const chips = [10, 50, 100, 500];
    const minBet = 10;
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);


    // --- Server Settings Fetch (for demonstration of integration) ---
    const fetchAdminSettings = useCallback(async () => {
        try {
            // Note: This API call is theoretical, assuming your userToken is an admin token.
            // If running as a standard user, you would need a non-admin endpoint.
            const response = await axios.get(`${API_BASE_URL}/api/admin/blackjack-settings`, {
                headers: { Authorization: `Bearer ${userToken || 'MOCK_TOKEN'}` }
            });
            setBlackjackSettings(response.data.settings);
        } catch (error) {
            // console.error("Could not fetch Blackjack admin settings:", error);
            // Default to safe settings if API fails
            setBlackjackSettings({ luckFactor: 0, isManualShuffle: false });
        }
    }, [userToken]);

    useEffect(() => {
        fetchAdminSettings();
    }, [fetchAdminSettings]);


    // --- Game Logic Functions ---

    const drawCard = (currentDeck) => {
        if (currentDeck.length === 0) {
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

        let currentDeck = [...deck];
        let pHand = [];
        let dHand = [];

        // Deal 2 cards each
        pHand.push(drawCard(currentDeck));
        dHand.push(drawCard(currentDeck));
        pHand.push(drawCard(currentDeck));
        dHand.push(drawCard(currentDeck));

        setPlayerHand(pHand);
        setDealerHand(dHand);

        // Check for initial Blackjack
        if (calculateHandValue(pHand) === 21) {
            setMessage('BLACKJACK! Checking dealer...');
            setTimeout(() => finishGame(calculateHandValue(dHand) === 21 ? 'push' : 'playerBlackjack'), 1500);
        }
    };

    const hit = () => {
        if (gameState !== 'playerTurn') return;
        let currentDeck = [...deck];
        const newCard = drawCard(currentDeck);
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
        if (gameState !== 'playerTurn' || currentBet * 2 > balance) {
            setMessage('Cannot double down. Check balance.');
            return;
        }

        // Double bet
        setBalance(b => b - currentBet);
        setCurrentBet(b => b * 2);

        // Hit exactly one card
        let currentDeck = [...deck];
        const newCard = drawCard(currentDeck);
        const newHand = [...playerHand, newCard];
        setPlayerHand(newHand);
        setMessage('Double Down! One card taken. Standing.');

        const newValue = calculateHandValue(newHand);

        if (newValue > 21) {
            setTimeout(() => finishGame('dealerWin'), 1500);
        } else {
            // Auto-stand and proceed to dealer's turn
            setGameState('dealerTurn');
            setTimeout(dealerPlay, 2000);
        }
    };

    const dealerPlay = () => {
        let dHand = [...dealerHand];
        let dValue = calculateHandValue(dHand);
        const pValue = calculateHandValue(playerHand);

        const playMove = () => {
            dValue = calculateHandValue(dHand);
            if (dValue < 17) {
                let currentDeck = [...deck];
                const newCard = drawCard(currentDeck);
                dHand.push(newCard);
                setDealerHand(dHand);
                setMessage('Dealer hits...');
                setTimeout(playMove, 1500); // Recursive call to continue hitting
            } else if (dValue > 21) {
                setMessage('Dealer busts!');
                setTimeout(() => finishGame('playerWin'), 1500);
            } else {
                setMessage('Dealer stands.');
                // Compare hands
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
        
        const finalPValue = calculateHandValue(playerHand);
        const finalDValue = calculateHandValue(dealerHand);

        switch (result) {
            case 'playerWin':
                title = 'PLAYER WINS!';
                finalMessage = `You won ₹${currentBet}! Your ${finalPValue} beat the dealer's ${finalDValue}.`;
                payout = currentBet * 2;
                break;
            case 'playerBlackjack':
                title = 'BLACKJACK!';
                finalMessage = `You got a Blackjack! Payout is 1.5x. You win ₹${currentBet * 1.5}.`;
                payout = currentBet * 2.5;
                break;
            case 'dealerWin':
                title = 'DEALER WINS!';
                finalMessage = `The dealer won with ${finalDValue}. You lost ₹${currentBet}.`;
                payout = 0;
                break;
            case 'push':
                title = 'PUSH (TIE)';
                finalMessage = `It's a tie at ${finalPValue}. Your bet of ₹${currentBet} is returned.`;
                payout = currentBet;
                break;
            default:
                title = 'ERROR';
                finalMessage = 'An unexpected result occurred. Bet returned.';
                payout = currentBet;
        }

        // Finalize payout
        setBalance(b => b + payout);
        setCurrentBet(0);
        
        // Show dialog after a delay
        document.getElementById('resultDialog').classList.remove('hidden');
        document.getElementById('dialogTitle').textContent = title;
        document.getElementById('dialogMessage').textContent = finalMessage;
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
        <div id="actionControls" className="flex flex-wrap gap-4 justify-center p-4 bg-gray-900 rounded-lg shadow-inner mt-4 sm:mt-0">
            <button 
                onClick={deal} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 transition-colors"
                disabled={gameState !== 'betting' || currentBet < minBet}
            >
                DEAL
            </button>
            <button 
                onClick={hit} 
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 transition-colors"
                disabled={gameState !== 'playerTurn'}
            >
                HIT
            </button>
            <button 
                onClick={stand} 
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 transition-colors"
                disabled={gameState !== 'playerTurn'}
            >
                STAND
            </button>
            <button 
                onClick={doubleDown} 
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 transition-colors"
                disabled={gameState !== 'playerTurn' || currentBet * 2 > balance}
            >
                DOUBLE DOWN
            </button>
        </div>
    );
    
    const renderBettingArea = () => (
        <div className="w-full p-4 sm:p-6 bg-gray-800 rounded-xl shadow-lg mt-4 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
                <p className="text-xl font-bold text-white mb-2">Balance: <span className="text-yellow-400">₹{balance.toLocaleString()}</span></p>
                <p className="text-lg font-semibold text-gray-300">Current Bet: <span className="text-green-400">₹{currentBet.toLocaleString()}</span></p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {chips.map(value => (
                    <button
                        key={value}
                        className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-full shadow-lg border-2 border-white/30 transition-transform transform hover:scale-105 disabled:opacity-50"
                        onClick={() => placeBet(value)}
                        disabled={gameState !== 'betting'}
                    >
                        {value}
                    </button>
                ))}
            </div>
            
            <button
                className="mt-4 sm:mt-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 transition-colors"
                onClick={clearBet}
                disabled={gameState !== 'betting' || currentBet === 0}
            >
                Clear Bet
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 bg-gray-900 min-h-screen text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-yellow-500 mb-6 border-b border-gray-700 pb-2">
                    Blackjack 21
                </h1>
                <p className="text-center text-sm text-gray-400 mb-4">
                    Admin Luck Factor: <span className={blackjackSettings.luckFactor > 0 ? 'text-green-400' : blackjackSettings.luckFactor < 0 ? 'text-red-400' : 'text-yellow-400'}>{blackjackSettings.luckFactor}%</span>
                </p>

                {/* --- Main Game Table --- */}
                <div className="bg-green-800 p-4 sm:p-6 rounded-2xl shadow-2xl border-4 border-green-700">
                    
                    {/* Dealer Hand */}
                    <div className="mb-8">
                        <p className="text-xl font-bold mb-2 text-yellow-300 flex justify-between">
                            <span>Dealer's Hand:</span>
                            <span className="text-white">Value: {isDealerCardHidden ? `${getDealerVisibleValue()} + ?` : dealerValue}</span>
                        </p>
                        <div className="flex gap-2 min-h-[100px] overflow-x-auto">
                            {dealerHand.map((card, index) => (
                                <Card key={index} card={card} isHidden={isDealerCardHidden && index === 1} />
                            ))}
                        </div>
                    </div>

                    <div className="text-center my-4">
                        <p className="text-lg font-semibold text-yellow-100 min-h-[30px]">{message}</p>
                    </div>

                    {/* Player Hand */}
                    <div className="mb-4">
                        <p className="text-xl font-bold mb-2 text-yellow-300 flex justify-between">
                            <span>Your Hand:</span>
                            <span className="text-white">Value: {playerValue}</span>
                        </p>
                        <div className="flex gap-2 min-h-[100px] overflow-x-auto">
                            {playerHand.map((card, index) => (
                                <Card key={index} card={card} isHidden={false} />
                            ))}
                        </div>
                    </div>
                    
                    {/* Action Buttons (Below Game Table) */}
                    {renderActionButtons()}
                </div>

                {/* Betting Area (Below Main Game) */}
                {renderBettingArea()}

                {/* --- How to Play Section --- */}
                <div className="mt-8 p-4 sm:p-6 bg-gray-700 rounded-xl shadow-xl">
                    <h2 className="text-2xl font-extrabold text-yellow-300 mb-4">How to Play Blackjack</h2>
                    <ol className="list-decimal list-inside space-y-3 text-lg text-gray-200">
                        <li><strong>Place a Bet:</strong> Click on the chips below the game table to place your bet. The minimum bet is ₹{minBet}.</li>
                        <li><strong>Deal:</strong> Click the "DEAL" button to start the round. You and the Dealer receive two cards. One of the Dealer's cards is hidden.</li>
                        <li><strong>Scoring:</strong> The goal is to get a hand total closer to 21 than the Dealer, without exceeding 21 (Busting). Face cards (J, Q, K) are 10. Aces (A) are 1 or 11.</li>
                        <li><strong>Player's Turn:</strong>
                            <ul className="list-disc list-inside ml-6 text-base text-gray-300 space-y-1 mt-1">
                                <li>**HIT:** Take one more card.</li>
                                <li>**STAND:** End your turn, keeping your current hand.</li>
                                <li>**DOUBLE DOWN:** Double your bet and take only one more card, then automatically Stand.</li>
                            </ul>
                        </li>
                        <li><strong>Dealer's Turn:</strong> The Dealer reveals their hidden card. The Dealer must hit on 16 or less and must stand on 17 or more.</li>
                        <li><strong>Payouts:</strong> Winning pays 1:1 (you win your bet back). Blackjack pays 3:2 (1.5x your bet). A Push (tie) returns your bet.</li>
                    </ol>
                </div>
            </div>

            {/* Modal Dialog for Game End */}
            <div id="resultDialog" className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 hidden">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-sm w-11/12 transform transition-all">
                    <h3 id="dialogTitle" className="text-3xl font-extrabold mb-4 text-yellow-400">Game Over!</h3>
                    <p id="dialogMessage" className="text-lg mb-6 text-gray-300"></p>
                    <button 
                        id="newRoundButton" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors" 
                        onClick={startNewRound}
                    >
                        Start New Round
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlackjackGame;
