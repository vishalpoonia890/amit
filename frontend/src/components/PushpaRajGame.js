import React from 'react';
import './PushpaRajGame.css';

function PushpaRajGame({ onBack }) {
    return (
        <div className="pushpa-game-container">
            <div className="game-header">
                <button onClick={onBack} className="back-btn">← Back</button>
            </div>
            <div className="coming-soon-message">
                <h1>Pushpa Raj</h1>
                <p>This game is coming soon!</p>
            </div>
        </div>
    );
}

export default PushpaRajGame;
