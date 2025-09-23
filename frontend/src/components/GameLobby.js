// src/components/GameLobby.js
import React from 'react';
import './GameLobby.css';
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

// --- UPDATED IMAGE & CSS FIX ---
// The placeholder URLs have been replaced with the image filenames.
// You'll need to ensure these images are in your project's public folder or assets directory.
const games = [
    {
        id: 'color-prediction',
        name: 'Color Prediction',
        description: 'Predict the next winning color to multiply your investment.',
        image: '../assests/color.png',
        view: 'color-prediction-game',
        isAvailable: true,
    },
    {
        id: 'ip-lottery',
        name: 'IP Lottery',
        description: 'Try your luck and earn a jackpot of 10k!',
        image: '../assests/lottery.png',
        view: 'ip-lottery',
        isAvailable: true,
    },
    {
        id: 'pushpa-raj',
        name: 'Pushpa Raj',
        description: 'Cash out before the truck stops. Rukega nahi saala!',
        image: '../assests/pushpa.png',
        view: 'pushpa-raj',
        isAvailable: false, // Set to false to show 'Coming Soon'
    },
    {
        id: 'win-win',
        name: 'Win-Win',
        description: 'Exclusive game for our top investors. Guaranteed win for every top player!',
        image: '../assests/winwin.png',
        view: 'win-win',
        isAvailable: false, // Set to false to show 'Exclusive Access'
        isExclusive: true,
    },
];

const partners = ['Pragmatic Play', 'Evolution', 'Ezugi', 'Betsoft', 'NetEnt', 'Playtech'];

function GameLobby({ onViewChange }) {
    return (
        <div className="game-lobby">
            <style>{`
                .game-lobby {
                    padding: 20px;
                    padding-bottom: 80px;
                    background: linear-gradient(180deg, var(--bg-color, #1a202c) 0%, var(--card-bg-color, #2d3748) 100%);
                    animation: fadeIn 0.5s ease-in-out;
                }
                .lobby-hero {
                    text-align: center;
                    padding: 40px 20px;
                    margin: -20px -20px 30px -20px;
                    background: linear-gradient(rgba(26, 32, 44, 0.8), var(--card-bg-color, #2d3748)), url('https://www.transparenttextures.com/patterns/dark-denim-3.png');
                    border-bottom: 1px solid var(--border-color, #4a5568);
                }
                .lobby-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #FFFFFF;
                    text-shadow: 0 0 10px var(--primary-color-light, #9f7aea), 0 0 20px var(--primary-color-light, #9f7aea);
                    animation: pulse-glow 3s infinite ease-in-out;
                }
                @keyframes pulse-glow {
                    0%, 100% { text-shadow: 0 0 10px var(--primary-color-light, #9f7aea), 0 0 20px var(--primary-color-light, #9f7aea); }
                    50% { text-shadow: 0 0 20px var(--primary-color, #805ad5), 0 0 30px var(--primary-color, #805ad5); }
                }
                .lobby-subtitle {
                    font-size: 1.1rem;
                    color: var(--text-color-light, #a0aec0);
                    margin-top: 5px;
                }
                .zero-edge-promo-card {
                    background: linear-gradient(135deg, var(--primary-color-light, #9f7aea), var(--card-bg-color, #2d3748));
                    border: 1px solid var(--primary-color, #805ad5);
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 30px;
                    box-shadow: 0 0 20px var(--primary-color-light, #9f7aea);
                }
                .zero-edge-promo-card h3 {
                    margin: 0 0 10px 0;
                    color: var(--text-color, #ffffff);
                    font-size: 1.2em;
                }
                .zero-edge-promo-card p {
                    margin: 0;
                    color: var(--text-color-light, #a0aec0);
                    font-size: 0.9em;
                    line-height: 1.6;
                }
                .game-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 25px;
                }
                @media (min-width: 600px) {
                    .game-grid { grid-template-columns: repeat(2, 1fr); }
                }
                .game-card {
                    background-color: var(--card-bg-color, #2d3748);
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                    border: 1px solid var(--border-color, #4a5568);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .game-card:hover:not(.disabled) {
                    transform: translateY(-8px) scale(1.03);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                .game-card.disabled {
                    cursor: not-allowed;
                }
                .game-image-container { overflow: hidden; }
                .game-image { width: 100%; height: 160px; object-fit: cover; display: block; transition: transform 0.3s ease; }
                .game-card:hover:not(.disabled) .game-image { transform: scale(1.1); }
                .game-info { padding: 20px; }
                .game-info h3 { margin: 0 0 8px 0; font-size: 1.3em; color: var(--text-color, #ffffff); }
                .game-info p { margin: 0; font-size: 0.9em; color: var(--text-color-light, #a0aec0); }
                .coming-soon-overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, 0.7); color: white;
                    display: flex; justify-content: center; align-items: center;
                    font-size: 1.5rem; font-weight: bold; backdrop-filter: blur(4px);
                }
                .how-to-play-card, .partners-section {
                    background-color: transparent; border-radius: 12px;
                    padding: 20px; margin-top: 40px; border: 1px solid var(--border-color, #4a5568);
                }
                .how-to-play-card h3, .partners-section h3 {
                    margin-top: 0; margin-bottom: 25px;
                    text-align: center; color: var(--primary-color, #805ad5);
                }
                .how-to-play-steps {
                    display: grid; grid-template-columns: 1fr; gap: 25px; text-align: center;
                }
                @media (min-width: 768px) { .how-to-play-steps { grid-template-columns: repeat(3, 1fr); } }
                .step-icon {
                    width: 60px; height: 60px; margin: 0 auto 15px auto;
                    background: linear-gradient(135deg, var(--primary-color, #805ad5), var(--primary-hover-color, #6b46c1));
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    color: white; box-shadow: 0 0 15px var(--primary-color-light, #9f7aea);
                }
                .step-item h4 { margin: 0 0 5px 0; font-size: 1.1em; color: var(--text-color, #ffffff); }
                .step-item p { margin: 0; font-size: 0.9em; color: var(--text-color-light, #a0aec0); }
                .partners-grid {
                    display: flex; flex-wrap: wrap; justify-content: center;
                    gap: 15px; margin-top: 20px; filter: grayscale(1) brightness(1.5);
                }
                .partner-logo {
                    padding: 10px 20px; font-weight: 600; color: var(--text-color-light, #a0aec0);
                    font-family: 'Arial', sans-serif; font-style: italic; opacity: 0.6;
                }
                .game-footer {
                    margin-top: 40px; text-align: center; font-size: 0.75rem;
                    color: var(--text-color-light, #a0aec0); line-height: 1.5; opacity: 0.7;
                }
                .game-footer p { margin: 5px 0; }
            `}</style>
            
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
                <p>© 2025 MoneyPlus.com | All Rights Reserved.</p>
                <p>MoneyPlus is owned and operated by IP Gaming Solutions N.V., registration number: 145353, registered address: Seru Loraweg 17 B, Curaçao. Payment agent companies are IP Finance Limited and IP Tech Limited. Contact us at support@moneyplus.com.</p>
                <p>MoneyPlus is committed to responsible gambling, for more information visit Gamblingtherapy.org</p>
            </footer>
        </div>
    );
}

export default GameLobby;
