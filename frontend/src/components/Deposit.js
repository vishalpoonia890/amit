import React, { useState } from 'react';
import axios from 'axios';
import './FormPages.css';
import qrCodeImage from '../assets/Code.png'; // Make sure you have this image in src/assets/

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

function Deposit({ token, onBack }) {
    const [amount, setAmount] = useState(500);
    const [utr, setUtr] = useState('');
    const [method, setMethod] = useState('upi');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmitRecharge = async (e) => {
        e.preventDefault();
        if (!utr.trim()) {
            alert('Please enter the UTR / Hash after payment to confirm your transaction.');
            return;
        }
        setLoading(true);
        try {
            await axios.post(
                `${API_BASE_URL}/api/recharge`,
                { amount, utr: utr.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowSuccess(true);
            setTimeout(() => onBack(), 2500); // Go back after showing success message
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit deposit request.');
        } finally {
            setLoading(false);
        }
    };
    
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }, (err) => {
            alert('Failed to copy. Please copy it manually.');
        });
    };

    const paymentDetails = {
        upi: { id: 'investmentplus@paytm', name: 'InvestmentPlus Corporation' },
        crypto: { address: 'TXkjfhdskjahf234jhKJHFKJhsdfjhsdkfjhSDFDSF', network: 'USDT (TRC20)' }
    };

    if (showSuccess) {
        return (
             <div className="form-page">
                 <div className="form-container">
                    <div className="success-message">
                        <div className="icon">✅</div>
                        <h3>Request Submitted!</h3>
                        <p>Your deposit is pending approval and will be reflected in your balance soon.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="form-page">
            <button className="back-button" onClick={onBack}>← Back</button>
            <div className="form-container">
                <h2 className="form-title">Deposit Funds</h2>
                
                <div className="method-selector">
                    <button className={method === 'upi' ? 'active' : ''} onClick={() => setMethod('upi')}>UPI</button>
                    <button className={method === 'crypto' ? 'active' : ''} onClick={() => setMethod('crypto')}>Crypto</button>
                </div>

                <div className="form-card">
                    <h4>Step 1: Make Payment</h4>
                    <p className="form-subtitle">Enter an amount and pay using the details below.</p>
                    
                     <div className="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10)))} min="1" placeholder="Enter amount" />
                    </div>

                    <div className="qr-code-container">
                        <img src={qrCodeImage} alt="Payment QR Code" />
                    </div>

                    {method === 'upi' && (
                        <div className="payment-info">
                            <p><strong>UPI ID:</strong> {paymentDetails.upi.id} <button onClick={() => copyToClipboard(paymentDetails.upi.id)} className="copy-btn">Copy</button></p>
                            <p><strong>Name:</strong> {paymentDetails.upi.name}</p>
                        </div>
                    )}

                    {method === 'crypto' && (
                        <div className="payment-info">
                             <p><strong>Network:</strong> {paymentDetails.crypto.network}</p>
                            <p><strong>Address:</strong> <span className="crypto-address">{paymentDetails.crypto.address}</span> <button onClick={() => copyToClipboard(paymentDetails.crypto.address)} className="copy-btn">Copy</button></p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmitRecharge} className="form-card">
                     <h4>Step 2: Confirm Deposit</h4>
                     <p className="form-subtitle">After paying, enter the transaction number to confirm.</p>
                    <div className="form-group">
                        <label htmlFor="utr">{method === 'upi' ? 'UTR Number' : 'Transaction Hash'}</label>
                        <input id="utr" type="text" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder={method === 'upi' ? 'Enter 12-digit UTR' : 'Enter transaction hash'} required />
                    </div>
                    <button type="submit" className="form-button" disabled={loading}>
                        {loading ? 'Submitting...' : 'Confirm Deposit'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Deposit;

