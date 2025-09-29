import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './BlackjackGame.css'; // Ensure this path is correct

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com'; // Use your actual API base URL

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


// --- Card Component (Styled) ---

const Card = ({ card, isHidden = false }) => {
    const suitColor = card && (card.suit === '♥' || card.suit === '♦') ? 'text-red-600' : 'text-gray-900';
    
    // card-face and bg-white.border classes trigger custom CSS effects
    if (isHidden) {
        return (
            <div className="card-face w-[70px] h-[100px] sm:w-24 sm:h-32 bg-yellow-900/90 border-2 border-yellow-300 rounded-lg shadow-xl flex items-center justify-center transform rotate-3">
                <span className="text-2xl font-extrabold text-gray-800">M P</span>
            </div>
        );
    }
    
    return (
        <div className="card-face bg-white border w-[70px] h-[100px] sm:w-24 sm:h-32 rounded-lg shadow-md flex flex-col p-1 sm:p-2 text-xs sm:text-base font-bold select-none">
            <div className={`text-left text-sm sm:text-lg ${suitColor}`}>{card.value}</div>
            <div className={`flex-grow flex items-center justify-center text-2xl sm:text-4xl ${suitColor}`}>
                {card.suit}
            </div>
            <div className={`text-right text-sm sm:text-lg ${suitColor} rotate-180`}>{card.value}</div>
        </div>
    );
};


// --- Main Blackjack Component ---

const BlackjackGame = ({ onBack, userToken }) => {
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


    // --- Server Settings Fetch (for demonstration) ---
    const fetchAdminSettings = useCallback(async () => {
        // ... (API logic to fetch settings remains the same)
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


    // --- Game Logic Functions (Same as previous version) ---

    const drawCard = (currentDeck) => {
        if (currentDeck.length < 5) { // Shuffle early if deck is low
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

        pHand.push(drawCard(currentDeck));
        dHand.push(drawCard(currentDeck));
        pHand.push(drawCard(currentDeck));
        dHand.push(drawCard(currentDeck));

        setPlayerHand(pHand);
        setDealerHand(dHand);

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
        if (gameState !== 'playerTurn' || currentBet * 2 > balance || playerHand.length > 2) {
            setMessage('Double Down only allowed on first move or insufficient balance.');
            return;
        }

        setBalance(b => b - currentBet);
        setCurrentBet(b => b * 2);

        let currentDeck = [...deck];
        const newCard = drawCard(currentDeck);
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
                let currentDeck = [...deck];
                const newCard = drawCard(currentDeck);
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
        
        // Ensure hidden card is revealed before calculating final values
        setIsDealerCardHidden(false); 

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
                finalMessage = `You got a Blackjack! Payout is 1.5x. You win ₹${(currentBet * 1.5).toFixed(0)}.`;
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
        setTimeout(() => {
            document.getElementById('resultDialog').classList.remove('hidden');
            document.getElementById('dialogTitle').textContent = title;
            document.getElementById('dialogMessage').textContent = finalMessage;
        }, 500);
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
        <div id="actionControls" className="flex flex-wrap gap-3 justify-center p-4 bg-gray-900 rounded-lg shadow-inner mt-4 sm:mt-0">
            <button 
                onClick={deal} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg disabled:opacity-50 transition-colors transform hover:scale-[1.02]"
                disabled={gameState !== 'betting' || currentBet < minBet}
            >
                DEAL
            </button>
            <button 
                onClick={hit} 
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-bold py-3 px-6 rounded-xl shadow-lg disabled:opacity-50 transition-colors transform hover:scale-[1.02]"
                disabled={gameState !== 'playerTurn'}
            >
                HIT
            </button>
            <button 
                onClick={stand} 
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg disabled:opacity-50 transition-colors transform hover:scale-[1.02]"
                disabled={gameState !== 'playerTurn'}
            >
                STAND
            </button>
            <button 
                onClick={doubleDown} 
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg disabled:opacity-50 transition-colors transform hover:scale-[1.02]"
                disabled={gameState !== 'playerTurn' || currentBet * 2 > balance || playerHand.length > 2}
            >
                DOUBLE DOWN
            </button>
        </div>
    );
    
    const renderBettingArea = () => (
        <div className="w-full p-4 sm:p-6 bg-gray-800 rounded-xl shadow-lg mt-6 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
                <p className="text-xl font-bold text-white mb-2">Total Balance: <span className="text-yellow-400">₹{balance.toLocaleString()}</span></p>
                <p className="text-lg font-semibold text-gray-300">Current Bet: <span className="text-green-400">₹{currentBet.toLocaleString()}</span></p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {chips.map(value => (
                    <button
                        key={value}
                        className="betting-chip w-14 h-14 bg-red-600 text-white font-extrabold rounded-full transition-transform"
                        style={{ backgroundColor: value === 500 ? '#f6e05e' : value === 100 ? '#48bb78' : value === 50 ? '#4299e1' : '#ed8936' }} // Custom colors for better look
                        onClick={() => placeBet(value)}
                        disabled={gameState !== 'betting' || value > balance}
                    >
                        {value}
                    </button>
                ))}
                <button
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 transition-colors"
                    onClick={clearBet}
                    disabled={gameState !== 'betting' || currentBet === 0}
                >
                    Clear Bet
                </button>
            </div>
        </div>
    );

    return (
        // Apply the custom CSS class here
        <div className="blackjack-game-container p-4 sm:p-8 min-h-screen text-white">
            <button onClick={onBack} className="mb-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Lobby
            </button>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-yellow-500 mb-8 border-b border-gray-700 pb-3">
                    Blackjack 21
                </h1>
                
                {/* --- Main Game Table --- */}
                <div className="bg-green-800 p-4 sm:p-8 rounded-2xl shadow-2xl border-4 border-yellow-800/50">
                    
                    {/* Dealer Hand Area */}
                    <div className="mb-10">
                        <p className="text-xl font-bold mb-3 text-yellow-300 flex justify-between">
                            <span>Dealer's Hand:</span>
                            <span className="text-white text-2xl font-extrabold">Value: {isDealerCardHidden ? `${getDealerVisibleValue()} + ?` : dealerValue}</span>
                        </p>
                        <div className="flex gap-3 min-h-[120px] overflow-x-auto card-hand-container">
                            {dealerHand.map((card, index) => (
                                <Card key={index} card={card} isHidden={isDealerCardHidden && index === 1} />
                            ))}
                        </div>
                    </div>

                    {/* Game Message */}
                    <div className="text-center my-6">
                        <p className="text-xl font-semibold text-yellow-100 min-h-[30px]">{message}</p>
                    </div>

                    {/* Player Hand Area */}
                    <div className="mb-6">
                        <p className="text-xl font-bold mb-3 text-yellow-300 flex justify-between">
                            <span>Your Hand:</span>
                            <span className="text-white text-2xl font-extrabold">Value: {playerValue}</span>
                        </p>
                        <div className="flex gap-3 min-h-[120px] overflow-x-auto card-hand-container">
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
                                <li>**DOUBLE DOWN:** Double your bet and take only one more card, then automatically Stand. Only allowed on the initial two cards.</li>
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
