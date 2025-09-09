// src/components/BottomNav.js 
import React from 'react';
import './BottomNav.css';

function BottomNav({ activeView, onViewChange }) {
  // ++ UPDATED: Using the provided new icons from your prompt's CSS
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: '🏠' }, // Home icon
    { id: 'plans', label: 'Products', icon: '🛍️' }, // Shopping bag or box icon
    { id: 'game', label: 'Game', icon: '🎲' }, // Dice icon
    { id: 'news', label: 'News', icon: '📰' }, // Newspaper icon (changed from 'community')
    { id: 'account', label: 'My', icon: '👤' }, // User icon (changed from 'personal')
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${activeView === item.id ? 'active' : ''}`}
          onClick={() => onViewChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
