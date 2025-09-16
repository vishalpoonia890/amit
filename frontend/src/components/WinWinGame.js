import React from 'react';
import './GamePages.css'; // A shared stylesheet for simple game pages

function WinWinGame({ onBack }) {
    return (
        <div className="game-page-placeholder">
            <button className="back-button" onClick={onBack}>← Back to Lobby</button>
            <h1>Win-Win Game</h1>
            <p>The Win-Win game with a 10 Lakh+ prize pool is coming soon!</p>
            <div className="coming-soon">Coming Soon!</div>
        </div>
    );
}

export default WinWinGame;
