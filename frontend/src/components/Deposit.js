import React, { useState } from 'react';
import './FormPages.css';
import qrCodeImage from '../assets/Code.png'; // Assuming you have this image

function Deposit({ onBack }) {
    const [activeTab, setActiveTab] = useState('upi');
    const [upiAmount, setUpiAmount] = useState('');
    const [upiUtr, setUpiUtr] = useState('');
    const [cryptoAmount, setCryptoAmount] = useState('');
    const [cryptoHash, setCryptoHash] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would handle the form submission, e.g., send to backend
        if (activeTab === 'upi') {
            alert(`UPI Deposit Submitted:\nAmount: ₹${upiAmount}\nUTR: ${upiUtr}`);
        } else {
            alert(`Crypto Deposit Submitted:\nAmount: $${cryptoAmount}\nHash: ${cryptoHash}`);
        }
        onBack(); // Go back after submission
    };

    return (
        <div className="form-page-container">
            <div className="form-page-header">
                <button onClick={onBack} className="back-button">←</button>
                <h1>Deposit</h1>
            </div>
            
            <div className="deposit-tabs">
                <button 
                    className={`tab-button ${activeTab === 'upi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upi')}
                >
                    UPI
                </button>
                <button 
                    className={`tab-button ${activeTab === 'crypto' ? 'active' : ''}`}
                    onClick={() => setActiveTab('crypto')}
                >
                    Crypto (USDT)
                </button>
            </div>

            <form onSubmit={handleSubmit} className="deposit-form">
                {activeTab === 'upi' && (
                    <div className="tab-content">
                        <h3>Pay with UPI</h3>
                        <div className="qr-code-container">
                            <img src={qrCodeImage} alt="UPI QR Code" />
                            <p>Scan the QR code to pay.</p>
                        </div>
                        <div className="form-input-group">
                            <label htmlFor="upiAmount">Amount (INR)</label>
                            <input 
                                type="number" 
                                id="upiAmount" 
                                value={upiAmount}
                                onChange={(e) => setUpiAmount(e.target.value)}
                                placeholder="Enter amount" 
                                required 
                            />
                        </div>
                         <div className="form-input-group">
                            <label htmlFor="upiUtr">UTR Number</label>
                            <input 
                                type="text" 
                                id="upiUtr" 
                                value={upiUtr}
                                onChange={(e) => setUpiUtr(e.target.value)}
                                placeholder="Enter 12-digit UTR" 
                                required 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'crypto' && (
                     <div className="tab-content">
                        <h3>Pay with USDT (TRC20)</h3>
                         <div className="qr-code-container">
                            <img src={qrCodeImage} alt="USDT TRC20 QR Code" />
                            <p className="wallet-address">Your-TRC20-Wallet-Address-Here</p>
                        </div>
                         <div className="form-input-group">
                            <label htmlFor="cryptoAmount">Amount (USD)</label>
                            <input 
                                type="number" 
                                id="cryptoAmount" 
                                value={cryptoAmount}
                                onChange={(e) => setCryptoAmount(e.target.value)}
                                placeholder="Enter USDT amount" 
                                required 
                            />
                        </div>
                         <div className="form-input-group">
                            <label htmlFor="cryptoHash">Transaction Hash</label>
                            <input 
                                type="text" 
                                id="cryptoHash"
                                value={cryptoHash}
                                onChange={(e) => setCryptoHash(e.target.value)} 
                                placeholder="Enter transaction hash" 
                                required 
                            />
                        </div>
                    </div>
                )}
                <button type="submit" className="form-submit-button">Submit</button>
            </form>
        </div>
    );
}

export default Deposit;
