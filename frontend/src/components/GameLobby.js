import React from 'react';
import './GameLobby.css';
import { SelectGameIcon, PlaceBetIcon, WinBigIcon } from './Icons';

// --- Image Placeholders ---
const colorPredictionImage = 'https://i.ibb.co/7jQqySP/color-prediction-game-thumb.png';
const lotteryImage = 'https://placehold.co/600x400/7c3aed/ffffff?text=IP+Lottery';
const winWinImage = 'https://placehold.co/600x400/db2777/ffffff?text=Win-Win';
const aviatorImage = 'https://i.ibb.co/zV9W7Yc/aviator-game-thumb.png';

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
        view: 'ip-lottery',
        isAvailable: true,
    },
    {
        id: 'aviator',
        name: 'Aviator',
        description: 'Cash out before the plane flies away. How high can you go?',
        image: aviatorImage,
        view: 'aviator',
        isAvailable: true,
    },
    {
        id: 'win-win',
        name: 'Win-Win',
        description: '100% rewards for everyone with a prize pool of 10 Lakh+!',
        image: winWinImage,
        view: 'win-win',
        isAvailable: true,
    },
];

const partners = ['Pragmatic Play', 'Evolution', 'Ezugi', 'Betsoft', 'NetEnt', 'Playtech'];

function GameLobby({ onViewChange }) {
    return (
        <div className="game-lobby">
            <div className="lobby-hero">
                <h1 className="lobby-title">Game Center</h1>
                <p className="lobby-subtitle">Choose a game to play and win big!</p>
            </div>
            
            <div className="game-grid">
                {games.map(game => (
                    <div 
                        key={game.id} 
                        className={`game-card ${!game.isAvailable ? 'disabled' : ''}`}
                        onClick={() => game.isAvailable && onViewChange(game.view)}
                    >
                        <div className="game-image-container">
                            <img src={game.image} alt={game.name} className="game-image" />
                        </div>
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
                <div className="how-to-play-steps">
                    <div className="step-item">
                        <div className="step-icon"><SelectGameIcon /></div>
                        <h4>1. Select a Game</h4>
                        <p>Choose any available game from our lobby to get started.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-icon"><PlaceBetIcon /></div>
                        <h4>2. Place Your Bet</h4>
                        <p>Understand the rules, enter your amount, and confirm your bet. Always play responsibly.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-icon"><WinBigIcon /></div>
                        <h4>3. Enjoy & Win</h4>
                        <p>Watch the results and see your winnings credited to your account instantly!</p>
                    </div>
                </div>
            </div>

            <div className="partners-section">
                <h3>Our Trusted Game Providers</h3>
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

