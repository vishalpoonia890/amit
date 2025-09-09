// src/components/LandingPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LandingPage.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

const topProducts = [
    { id: 1, name: 'Bronze Plan', price: 500, dailyIncome: 25, duration: 30, imageUrl: 'https://images.pexels.com/photos/3943723/pexels-photo-3943723.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 2, name: 'Silver Plan', price: 2000, dailyIncome: 110, duration: 45, imageUrl: 'https://images.pexels.com/photos/5849576/pexels-photo-5849576.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 3, name: 'Gold Plan', price: 5000, dailyIncome: 300, duration: 60, imageUrl: 'https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

function LandingPage({ onViewChange }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    
    useEffect(() => {
        document.body.className = `${theme}-theme`;
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="logo">
                  <span className="logo-circle-landing">ip</span>
                  investmentplus
                </div>
                <div className="auth-buttons">
                    <button className="theme-toggle-btn" onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
                    <button className="login-btn" onClick={() => onViewChange('login')}>Login</button>
                    <button className="register-btn" onClick={() => onViewChange('register')}>Register</button>
                </div>
            </header>
            <main>
                <section className="hero-section">
                    <video autoPlay loop muted playsInline className="hero-background-video">
                        <source src="/background-video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1>Is Your Money Losing Value in the Bank?</h1>
                        <p>Start investing today and watch your earnings grow daily. <br/> Secure, simple, and profitable.</p>
                        <button className="cta-button" onClick={() => onViewChange('register')}>Start Earning Now</button>
                    </div>
                </section>
                <div className="product-details-section">
                    <h2>Our Best Plans</h2>
                    <div className="product-grid-landing">
                        {topProducts.map((product) => (
                            <div key={product.id} className="product-card-landing">
                                <img src={product.imageUrl} alt={product.name} />
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p>Invest: <strong>{formatCurrency(product.price)}</strong></p>
                                    <p>Daily Income: <strong>{formatCurrency(product.dailyIncome)}</strong></p>
                                    <button className="purchase-btn" onClick={() => onViewChange('login')}>Purchase Now</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} investmentplus. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default LandingPage;
