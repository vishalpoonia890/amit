import React, { useState } from 'react';
import axios from 'axios';
import './FormPages.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

function Withdrawal({ token, financialSummary, onBack,onWithdrawalRequest }) {
    const [amount, setAmount] = useState(100);
    const [method, setMethod] = useState('upi'); // upi, bank, crypto
    const [details, setDetails] = useState({ upiId: '', bankAccount: '', bankIfsc: '', cryptoAddress: '' });
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleDetailChange = (e) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let withdrawalDetails;
        let isValid = false;
        if (method === 'upi' && details.upiId.trim()) {
            withdrawalDetails = `UPI: ${details.upiId}`;
            isValid = true;
        }
        if (method === 'bank' && details.bankAccount.trim() && details.bankIfsc.trim()) {
            withdrawalDetails = `A/C: ${details.bankAccount}, IFSC: ${details.bankIfsc}`;
            isValid = true;
        }
        if (method === 'crypto' && details.cryptoAddress.trim()) {
            withdrawalDetails = `USDT TRC20: ${details.cryptoAddress}`;
            isValid = true;
        }

        if (!isValid) {
            alert('Please fill in the required details for the selected method.');
            setLoading(false);
            return;
        }
        
        try {
            await axios.post(`${API_BASE_URL}/api/withdraw`, 
                { amount, method, details: withdrawalDetails },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onWithdrawalRequest(amount);
            setShowSuccess(true);
            setTimeout(() => onBack(), 2500);
        } catch (error) {
            alert(error.response?.data?.error || 'Withdrawal request failed.');
        } finally {
            setLoading(false);
        }
    };

    const withdrawableBalance = financialSummary?.withdrawable_wallet || 0;

    if (showSuccess) {
         return (
             <div className="form-page">
                 <div className="form-container">
                    <div className="success-message">
                        <div className="icon">✅</div>
                        <h3>Request Submitted!</h3>
                        <p>Your withdrawal request has been sent and is pending approval.</p>
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="form-page">
            <button className="back-button" onClick={onBack}>← Back</button>
            <div className="form-container">
                <h2 className="form-title">Request Withdrawal</h2>
                <div className="form-card">
                    <p className="balance-info">Withdrawable Balance: <strong>₹{withdrawableBalance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="amount">Amount (₹)</label>
                            <input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min="100" required />
                        </div>
                        
                        <div className="method-selector">
                            <button type="button" className={method === 'upi' ? 'active' : ''} onClick={() => setMethod('upi')}>UPI</button>
                            <button type="button" className={method === 'bank' ? 'active' : ''} onClick={() => setMethod('bank')}>Bank</button>
                            <button type="button" className={method === 'crypto' ? 'active' : ''} onClick={() => setMethod('crypto')}>Crypto</button>
                        </div>

                        {method === 'upi' && (
                            <div className="form-group">
                                <label htmlFor="upiId">UPI ID</label>
                                <input id="upiId" name="upiId" type="text" value={details.upiId} onChange={handleDetailChange} placeholder="yourname@bank" required />
                            </div>
                        )}
                        {method === 'bank' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="bankAccount">Bank Account Number</label>
                                    <input id="bankAccount" name="bankAccount" type="text" value={details.bankAccount} onChange={handleDetailChange} placeholder="Enter account number" required />
                                </div>
                                 <div className="form-group">
                                    <label htmlFor="bankIfsc">IFSC Code</label>
                                    <input id="bankIfsc" name="bankIfsc" type="text" value={details.bankIfsc} onChange={handleDetailChange} placeholder="Enter IFSC code" required />
                                </div>
                            </>
                        )}
                        {method === 'crypto' && (
                             <div className="form-group">
                                <label htmlFor="cryptoAddress">USDT (TRC20) Address</label>
                                <input id="cryptoAddress" name="cryptoAddress" type="text" value={details.cryptoAddress} onChange={handleDetailChange} placeholder="Enter your TRC20 wallet address" required />
                            </div>
                        )}

                        <button type="submit" className="form-button" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Withdrawal;

