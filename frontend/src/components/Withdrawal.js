import React, { useState } from 'react';
import axios from 'axios';
import './Withdrawal.css'; // We will create this CSS file

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

// --- SVG Icons for a cleaner look ---
const UpiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
const BankIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-4 7 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>;
const CryptoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M18 9l-6 6-6-6"/></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const SuccessIcon = () => <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

function Withdrawal({ token, financialSummary, onBack, onWithdrawalRequest }) {
    const [amount, setAmount] = useState(100);
    const [method, setMethod] = useState('upi');
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
            setTimeout(() => onBack(), 3000);
        } catch (error) {
            alert(error.response?.data?.error || 'Withdrawal request failed.');
        } finally {
            setLoading(false);
        }
    };

    const withdrawableBalance = financialSummary?.withdrawable_wallet || 0;

    if (showSuccess) {
        return (
            <div className="withdrawal-page">
                <div className="withdrawal-container">
                    <div className="success-message">
                        <SuccessIcon />
                        <h3>Request Submitted!</h3>
                        <p>Your withdrawal request is pending approval. You will be redirected shortly.</p>
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="withdrawal-page">
            <div className="withdrawal-container">
                <button className="back-button" onClick={onBack}>
                    <BackIcon />
                    <span>Back</span>
                </button>
                <div className="withdrawal-header">
                    <h2 className="withdrawal-title">Request Withdrawal</h2>
                    <p className="withdrawal-subtitle">Securely transfer your earnings.</p>
                </div>
                
                <div className="balance-card">
                    <span>Withdrawable Balance</span>
                    <strong>₹{withdrawableBalance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                </div>

                <div className="withdrawal-form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="amount">Amount (₹)</label>
                            <div className="amount-input-wrapper">
                                <span className="currency-symbol">₹</span>
                                <input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min="100" required />
                            </div>
                        </div>
                        
                        <label className="method-label">Select Method</label>
                        <div className="method-selector">
                            <button type="button" className={`method-btn ${method === 'upi' ? 'active' : ''}`} onClick={() => setMethod('upi')}><UpiIcon /><span>UPI</span></button>
                            <button type="button" className={`method-btn ${method === 'bank' ? 'active' : ''}`} onClick={() => setMethod('bank')}><BankIcon /><span>Bank</span></button>
                            <button type="button" className={`method-btn ${method === 'crypto' ? 'active' : ''}`} onClick={() => setMethod('crypto')}><CryptoIcon /><span>Crypto</span></button>
                        </div>

                        <div className="method-details">
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
                        </div>

                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </div>

                <div className="withdrawal-info">
                    <p>Withdrawals are processed Monday to Friday, 9 AM to 6 PM. Requests made outside these hours will be processed on the next working day. A small processing fee may apply.</p>
                </div>
            </div>
        </div>
    );
}

export default Withdrawal;

