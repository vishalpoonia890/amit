import React, { useState } from 'react';
import './SellUsdt.css';
import { BitcoinIcon, TwentyDayIcon, QuickDisbursalIcon } from './Icons'; // Assuming these are in your Icons.js file

const USDT_TO_INR_RATE = 98; // As specified, negotiable

const famousCryptos = [
    { name: 'Bitcoin', symbol: 'BTC', price: 115973.00, change: -0.01 },
    { name: 'Ethereum', symbol: 'ETH', price: 4663.08, change: -1.31 },
    { name: 'Solana', symbol: 'SOL', price: 246.62, change: 1.56 },
    { name: 'Dogecoin', symbol: 'DOGE', price: 0.29, change: 2.51 },
];

function SellUsdt({ onBack }) {
    const [usdtAmount, setUsdtAmount] = useState(100);
    const inrAmount = usdtAmount * USDT_TO_INR_RATE;

    return (
        <div className="sell-usdt-page">
            <button className="back-button" onClick={onBack}>← Back</button>
            <h2 className="page-title">Sell USDT Instantly</h2>

            <div className="info-card-grid">
                <div className="info-card">
                    <div className="info-icon"><BitcoinIcon /></div>
                    <div>
                        <h4>Get started in seconds</h4>
                        <p>Whether you are a beginner or an expert, you can easily get started without any professional knowledge.</p>
                    </div>
                </div>
                <div className="info-card">
                    <div className="info-icon"><TwentyDayIcon /></div>
                    <div>
                        <h4>20-Day Account Assurance</h4>
                        <p>We guarantee that your bank account will not be frozen for at least 20 days, otherwise a USDT refund will be issued.</p>
                    </div>
                </div>
                <div className="info-card">
                    <div className="info-icon"><QuickDisbursalIcon /></div>
                    <div>
                        <h4>Quick Disbursal of Funds</h4>
                        <p>Expect your funds to arrive in your bank account within 40 minutes. In rare instances, it may take up to 2 hours.</p>
                    </div>
                </div>
            </div>

            <div className="calculator-card">
                <h4>USDT to INR Calculator</h4>
                <p className="rate-note">Current Rate: 1 USDT ≈ ₹{USDT_TO_INR_RATE} (Negotiable for large amounts)</p>
                <div className="calculator-inputs">
                    <div className="input-group">
                        <label>You Sell (USDT)</label>
                        <input 
                            type="number" 
                            value={usdtAmount} 
                            onChange={(e) => setUsdtAmount(parseFloat(e.target.value) || 0)} 
                            placeholder="e.g., 100"
                        />
                    </div>
                    <div className="equals-sign">=</div>
                    <div className="input-group">
                        <label>You Receive (INR)</label>
                        <input type="text" value={`₹${inrAmount.toLocaleString('en-IN')}`} readOnly />
                    </div>
                </div>
                <a href="https://t.me/Xiaovai8" target="_blank" rel="noopener noreferrer" className="action-button">
                    Sell USDT Now
                </a>
            </div>
            
            <div className="market-rates-card">
                <h4>Live Market Rates</h4>
                {famousCryptos.map(crypto => (
                    <div key={crypto.symbol} className="crypto-rate-row">
                        <div className="crypto-name">
                            <span>{crypto.name}</span>
                            <span className="crypto-symbol">{crypto.symbol}</span>
                        </div>
                        <div className="crypto-price">
                            <span>${crypto.price.toLocaleString()}</span>
                            <span className={`crypto-change ${crypto.change >= 0 ? 'positive' : 'negative'}`}>
                                {crypto.change >= 0 ? '▲' : '▼'} {Math.abs(crypto.change)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SellUsdt;
