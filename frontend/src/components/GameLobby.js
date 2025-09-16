import React from 'react';
import './GameLobby.css';

// Using a placeholder image to represent your color prediction game.
const colorPredictionImage = 'https://i.ibb.co/bF9MDkC/color-prediction-game-thumb.png';
const placeholderImage = 'https://placehold.co/600x400/374151/9CA3AF?text=Coming+Soon';

const games = [
    {
        id: 'color-prediction',
        name: 'Color Prediction',
        description: 'Predict the next winning color to multiply your investment.',
        image: colorPredictionImage,
        view: 'color-prediction-game', // This will navigate to your existing GameView
        isAvailable: true,
    },
    {
        id: 'aviator',
        name: 'Aviator',
        description: 'Cash out before the plane flies away. How high can you go?',
        image: placeholderImage,
        isAvailable: false,
    },
    {
        id: 'lucky-wheel',
        name: 'Lucky Wheel',
        description: 'Spin the wheel to win exciting prizes and bonuses.',
        image: placeholderImage,
        isAvailable: false,
    },
];

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
        </div>
    );
}

export default GameLobby;
