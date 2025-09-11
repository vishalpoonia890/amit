import React, { useState } from 'react';
import axios from 'axios';
import './FormPages.css';
import upiQrCode from '../assets/ptys.jpg';
import cryptoQrCode from '../assets/usdt.jpg';
const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

const USDT_TO_INR_RATE = 92;

function Deposit({ token, onBack }) {
    const [inputAmount, setInputAmount] = useState(500);
    const [utr, setUtr] = useState('');
    const [method, setMethod] = useState('upi');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAmountChange = (e) => {
        setInputAmount(Math.max(0, parseFloat(e.target.value) || 0));
    };

    const finalInrAmount = method === 'crypto' ? inputAmount * USDT_TO_INR_RATE : inputAmount;

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
                { amount: finalInrAmount, utr: utr.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowSuccess(true);
            setTimeout(() => onBack(), 2500);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit deposit request.');
        } finally {
            setLoading(false);
        }
    };
    
    const copyToClipboard = (text) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Copied to clipboard!');
        } catch (err) {
            alert('Failed to copy. Please copy it manually.');
        }
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
                        <label>Amount ({method === 'upi' ? '₹' : 'USDT'})</label>
                        <input type="number" value={inputAmount} onChange={handleAmountChange} min="1" />
                    </div>
                    
                    {method === 'upi' && (
                        <p className="bonus-note">
                            Current Offer: <strong>Get 10% Extra Bonus on USDT deposits!</strong>
                        </p>
                    )}

                    {method === 'crypto' && (
                        <p className="conversion-note">
                            You are depositing <strong>{inputAmount} USDT</strong> which is equal to <strong>₹{finalInrAmount.toLocaleString('en-IN')}</strong>.
                        </p>
                    )}

                    <div className="qr-code-container">
                        <img src={method === 'upi' ? upiQrCode : cryptoQrCode} alt={`${method.toUpperCase()} QR Code`} />
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
                        {loading ? 'Submitting...' : `Confirm Deposit of ₹${finalInrAmount.toLocaleString()}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Deposit;

