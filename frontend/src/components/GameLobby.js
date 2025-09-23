import React from 'react';
import './GameLobby.css';
// --- IMPORT IMAGES DIRECTLY ---
import colorImage from '../assets/color.png';
import lotteryImage from '../assets/lottery.png';
import pushpaImage from '../assets/pushpa.png';
import winwinImage from '../assets/winwin.png';

// --- INLINED ICONS ---
const SelectGameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
    </svg>
);
const PlaceBetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
);
const WinBigIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 L12 2 Z" />
    </svg>
);

const games = [
    {
        id: 'color-prediction',
        name: 'Color Prediction',
        description: 'Predict the next winning color to multiply your investment.',
        image: colorImage,
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
        id: 'pushpa-raj',
        name: 'Pushpa Raj',
        description: 'Cash out before the truck stops. Rukega nahi saala!',
        image: pushpaImage,
        view: 'pushpa-raj',
        isAvailable: false, // Set to false to show 'Coming Soon'
    },
    {
        id: 'win-win',
        name: 'Win-Win',
        description: 'Exclusive game for our top investors. Guaranteed win for every top player!',
        image: winwinImage,
        view: 'win-win',
        isAvailable: false, // Set to false to show 'Exclusive Access'
        isExclusive: true,
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

            <div className="zero-edge-promo-card">
                <h3>World's First Casino with "ZERO" House Edge</h3>
                <p>We believe in fair play. Every rupee you bet is redistributed among the players. To ensure everyone wins, MoneyPlus matches the total prize pool, guaranteeing a 100% payout rate and creating a truly rewarding experience for our community.</p>
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
                        {!game.isAvailable && (
                            <div className="coming-soon-overlay">
                                {game.isExclusive ? 'Exclusive Access' : 'Coming Soon!!'}
                            </div>
                        )}
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
                    </div >
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
                <p>© 2025 MoneyPlus.com | All Rights Reserved.</p>
                <p>MoneyPlus is owned and operated by IP Gaming Solutions N.V., registration number: 145353, registered address: Seru Loraweg 17 B, Curaçao. Payment agent companies are IP Finance Limited and IP Tech Limited. Contact us at support@moneyplus.com.</p>
                <p>MoneyPlus is committed to responsible gambling, for more information visit Gamblingtherapy.org</p>
            </footer>
        </div>
    );
}

export default GameLobby;
