import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Withdrawal.css'; // We will create this CSS file

// Debounce utility function (to prevent too many API calls while typing)
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

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
    const [details, setDetails] = useState({ 
        upiId: '', 
        bankAccount: '', 
        bankIfsc: '', // We will capitalize this
        accountHolderName: '', // Added for bank details
        cryptoAddress: '' 
    });
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [bankName, setBankName] = useState(''); // State for fetched bank name/branch
    const [isIfscLoading, setIsIfscLoading] = useState(false); // State for IFSC loading
    const [ifscError, setIfscError] = useState(''); // State for IFSC validation error

    // --- IFSC Fetch Logic ---
    const fetchBankDetails = useCallback(async (ifsc) => {
        if (!ifsc || ifsc.length !== 11) {
            setBankName('');
            setIfscError('');
            return;
        }

        setIsIfscLoading(true);
        setIfscError('');
        setBankName(''); // Clear previous bank name

        try {
            const response = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
            
            // The API returns 200 even on failure, so we check for 'BANK' field presence
            if (response.data && response.data.BANK && response.data.BRANCH) {
                setBankName(`${response.data.BANK} - ${response.data.BRANCH}`);
            } else {
                setIfscError('IFSC Verification Failed.');
                setBankName('Verification Failed');
            }
        } catch (err) {
            // Catch actual network/404 errors
            setIfscError('Error verifying IFSC. Please check the code.');
            setBankName('Verification Failed');
        } finally {
            setIsIfscLoading(false);
        }
    }, []);

    const debouncedFetchBankDetails = useCallback(debounce(fetchBankDetails, 800), [fetchBankDetails]);


    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        const processedValue = (name === 'bankIfsc') ? value.toUpperCase() : value;
        
        setDetails(prev => ({ ...prev, [name]: processedValue }));

        // Trigger IFSC check only if the input is IFSC and has 11 characters
        if (name === 'bankIfsc') {
            debouncedFetchBankDetails(processedValue);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setIfscError(''); // Clear general IFSC error on submit attempt

        let withdrawalDetails;
        let isValid = false;
        let errorMsg = '';

        if (amount < 100) {
            errorMsg = 'Minimum withdrawal amount is ₹100.';
        } else if (amount > withdrawableBalance) {
            errorMsg = `Insufficient balance. Available: ₹${withdrawableBalance.toLocaleString()}`;
        } else {
            if (method === 'upi' && details.upiId.trim()) {
                withdrawalDetails = { method: 'UPI', upiId: details.upiId };
                isValid = true;
            } else if (method === 'bank' && details.bankAccount.trim() && details.bankIfsc.trim() && details.accountHolderName.trim()) {
                if (!bankName || bankName === 'Verification Failed') {
                    errorMsg = 'Please ensure the IFSC code is valid and verified.';
                } else {
                    withdrawalDetails = { 
                        method: 'BANK', 
                        account: details.bankAccount, 
                        ifsc: details.bankIfsc,
                        holder: details.accountHolderName,
                        bankName: bankName 
                    };
                    isValid = true;
                }
            } else if (method === 'crypto' && details.cryptoAddress.trim()) {
                withdrawalDetails = { method: 'CRYPTO', address: details.cryptoAddress };
                isValid = true;
            } else {
                errorMsg = 'Please fill in all details for the selected method.';
            }
        }

        if (!isValid) {
            alert(errorMsg);
            setLoading(false);
            return;
        }
        
        try {
            await axios.post(`${API_BASE_URL}/api/withdraw`, 
                { amount, method, details: JSON.stringify(withdrawalDetails) },
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
                                        <label htmlFor="accountHolderName">Account Holder Name</label>
                                        <input id="accountHolderName" name="accountHolderName" type="text" value={details.accountHolderName} onChange={handleDetailChange} placeholder="Enter account holder name" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="bankAccount">Bank Account Number</label>
                                        <input id="bankAccount" name="bankAccount" type="text" value={details.bankAccount} onChange={handleDetailChange} placeholder="Enter account number" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="bankIfsc">IFSC Code</label>
                                        <input id="bankIfsc" name="bankIfsc" type="text" value={details.bankIfsc} onChange={handleDetailChange} placeholder="Enter IFSC code" maxLength="11" required />
                                        
                                        {isIfscLoading && <p className="ifsc-status loading">Verifying IFSC...</p>}
                                        {bankName && !isIfscLoading && (
                                            <p className={`ifsc-status ${bankName === 'Verification Failed' ? 'failed' : 'success'}`}>
                                                {bankName === 'Verification Failed' ? 
                                                    'Invalid IFSC: Verification Failed' : 
                                                    `Bank Branch: ${bankName}`
                                                }
                                            </p>
                                        )}
                                        {ifscError && <p className="ifsc-status failed">{ifscError}</p>}
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

                        <button type="submit" className="submit-button" disabled={loading || isIfscLoading || (method === 'bank' && (!bankName || bankName === 'Verification Failed'))}>
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
