import React from 'react';
import './GamePages.css'; // A shared stylesheet for simple game pages

function IpLottery({ onBack }) {
    return (
        <div className="game-page-placeholder">
            <button className="back-button" onClick={onBack}>← Back to Lobby</button>
            <h1>IP Lottery</h1>
            <p>The lottery feature is under development.</p>
            <div className="coming-soon">Coming Soon!</div>
        </div>
    );
}

export default IpLottery;
