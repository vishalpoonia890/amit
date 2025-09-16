import React from 'react';
import './GameLobby.css';

// --- Image Placeholders ---
const colorPredictionImage = 'https://i.ibb.co/bF9MDkC/color-prediction-game-thumb.png';
const lotteryImage = 'https://placehold.co/600x400/7c3aed/ffffff?text=IP+Lottery';
const winWinImage = 'https://placehold.co/600x400/db2777/ffffff?text=Win-Win';

const games = [
    {
        id: 'color-prediction',
        name: 'Color Prediction',
        description: 'Predict the next winning color to multiply your investment.',
        image: colorPredictionImage,
        view: 'color-prediction-game',
        isAvailable: true,
    },
    {
        id: 'ip-lottery',
        name: 'IP Lottery',
        description: 'Try your luck and earn a jackpot of 10k!',
        image: lotteryImage,
        view: 'ip-lottery', // New view name
        isAvailable: true,
    },
    {
        id: 'win-win',
        name: 'Win-Win',
        description: '100% rewards for everyone with a prize pool of 10 Lakh+!',
        image: winWinImage,
        view: 'win-win', // New view name
        isAvailable: true,
    },
];

const partners = ['Pragmatic Play', 'Evolution', 'Ezugi', 'Betsoft'];

function GameLobby({ onViewChange }) {
    return (
        <div className="game-lobby">
            <h1 className="lobby-title">Game Center</h1>
            <p className="lobby-subtitle">Choose a game to play and win big!</p>
            
            <div className="game-grid">
                {games.map(game => (
                    <div 
                        key={game.id} 
                        className={`game-card ${!game.isAvailable ? 'disabled' : ''}`}
                        onClick={() => game.isAvailable && onViewChange(game.view)}
                    >
                        <img src={game.image} alt={game.name} className="game-image" />
                        <div className="game-info">
                            <h3>{game.name}</h3>
                            <p>{game.description}</p>
                        </div>
                        {!game.isAvailable && <div className="coming-soon-overlay">Coming Soon</div>}
                    </div>
                ))}
            </div>

            <div className="how-to-play-card">
                <h3>How to Play</h3>
                <p><strong>1. Select a Game:</strong> Choose any available game from our lobby to get started.</p>
                <p><strong>2. Understand the Rules:</strong> Each game has unique rules. For Color Prediction, you guess the outcome. For IP Lottery, you pick numbers for a chance at the jackpot.</p>
                <p><strong>3. Place Your Bet:</strong> Enter the amount you wish to play with. Always play responsibly.</p>
                <p><strong>4. Enjoy & Win:</strong> Watch the results and see your winnings credited to your account instantly!</p>
            </div>

            <div className="partners-section">
                <h3>Our Game Providers</h3>
                <div className="partners-grid">
                    {partners.map(partner => (
                        <div key={partner} className="partner-logo">{partner}</div>
                    ))}
                </div>
            </div>

            <footer className="game-footer">
                <p>© 2025 InvestmentPlus.com | All Rights Reserved.</p>
                <p>InvestmentPlus is owned and operated by IP Gaming Solutions N.V., registration number: 145353, registered address: Seru Loraweg 17 B, Curaçao. Payment agent companies are IP Finance Limited and IP Tech Limited. Contact us at support@investmentplus.com.</p>
                <p>InvestmentPlus is committed to responsible gambling, for more information visit Gamblingtherapy.org</p>
            </footer>
        </div>
    );
}

export default GameLobby;

