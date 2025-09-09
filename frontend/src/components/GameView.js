// src/components/GameView.js
import React from 'react';

function GameView() {
  const gridItems = [
    { name: 'Watch', img: '⌚️' },
    { name: '2000rs', img: '💰' },
    { name: 'Headphones', img: '🎧' },
    { name: 'iPhone', img: '📱' },
    { name: 'BEGIN', img: '' },
    { name: 'Earbuds', img: '🎶' },
    { name: 'Smartphone', img: '📲' },
    { name: '1000rs', img: '💵' },
    { name: 'Laptop', img: '💻' }
  ];

  return (
    <div className="game-view">
      <div className="view-header">
        <button>&lt;</button>
        <h1>Lucky Grid</h1>
        <button>Rules</button>
      </div>
      <div className="lucky-grid-container">
        <div className="lucky-grid">
          {gridItems.map((item, index) => (
            <div key={index} className={`grid-item ${item.name === 'BEGIN' ? 'begin-button' : ''}`}>
              {item.name === 'BEGIN' ? 'BEGIN' : (
                <>
                  <div className="grid-item-icon">{item.img}</div>
                  <div className="grid-item-name">{item.name}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="chances-card">
        1 Chances
      </div>
      <div className="records-card">
        <h3>Records</h3>
        <div className="record-item">
          <span>875****795</span>
          <span>iPhone Pro</span>
          <span>12/07/23</span>
        </div>
      </div>
    </div>
  );
}

export default GameView;
