import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './WithdrawalForm.css';

// Debounce utility function (to prevent too many API calls while typing)
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        // In production, use the Render backend URL
        return 'https://investmentpro-nu7s.onrender.com';
    } else {
        // In development, use the proxy
        return '';
    }
};

const API_BASE_URL = getApiBaseUrl();

function WithdrawalForm({ token, userData, onBack }) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('bank'); // 'bank' or 'upi'
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
    });
    const [bankName, setBankName] = useState(''); // ✅ NEW: State for fetched bank name
    const [isIfscLoading, setIsIfscLoading] = useState(false); // ✅ NEW: Loading state for IFSC check
    const [upiId, setUpiId] = useState('');
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // --- IFSC Fetch Logic ---
    const fetchBankDetails = useCallback(async (ifsc) => {
        // IFSC code must be 11 characters long
        if (!ifsc || ifsc.length !== 11) {
            setBankName('');
            return;
        }

        setIsIfscLoading(true);
        setError('');

        try {
            // Using a public API to fetch bank details based on IFSC code
            const response = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
            
            if (response.data && response.data.BANK && response.data.BRANCH) {
                setBankName(`${response.data.BANK} - ${response.data.BRANCH}`);
            } else {
                setError('Invalid IFSC code. Could not verify bank.');
                setBankName('Verification Failed');
            }
        } catch (err) {
            console.error("IFSC check failed:", err);
            setError('Error verifying IFSC. Please check the code.');
            setBankName('Verification Failed');
        } finally {
            setIsIfscLoading(false);
        }
    }, []);

    // Debounced version of the fetch function
    const debouncedFetchBankDetails = useCallback(debounce(fetchBankDetails, 800), [fetchBankDetails]);

    const fetchWithdrawals = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/withdrawals`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setWithdrawals(response.data.withdrawals || []);
        } catch (err) {
            console.error('Failed to fetch withdrawals:', err);
        }
    }, [token]);

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    // Calculate GST (18%)
    const calculateGST = (amount) => {
        const value = parseFloat(amount) || 0;
        return value * 0.18;
    };

    // Calculate net amount (amount - GST)
    const calculateNetAmount = (amount) => {
        const value = parseFloat(amount) || 0;
        return value - calculateGST(value);
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        // Only allow numeric input with up to 2 decimal places
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            setAmount(value);
        }
    };

    const handleBankDetailsChange = (field, value) => {
        const uppercaseValue = (field === 'ifscCode') ? value.toUpperCase() : value;
        
        setBankDetails(prev => ({
            ...prev,
            [field]: uppercaseValue
        }));

        // ✅ NEW: Trigger IFSC check on change
        if (field === 'ifscCode') {
            debouncedFetchBankDetails(uppercaseValue);
        }
    };

    const handleRequestWithdrawal = async (e) => {
        e.preventDefault();
        
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        
        const amountFloat = parseFloat(amount);
        
        // Use the correct balance for withdrawal form
        // Assuming userData.withdrawable_wallet holds the correct limit
        if (amountFloat > (userData?.withdrawable_wallet || 0)) {
            setError('Insufficient withdrawable balance');
            return;
        }
        
        if (method === 'bank') {
            if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName || !bankName || bankName === 'Verification Failed') {
                setError('Please fill in all bank details and verify the IFSC code.');
                return;
            }
        } else if (method === 'upi') {
            if (!upiId) {
                setError('Please enter UPI ID');
                return;
            }
        }

        setLoading(true);
        setError('');
        setSuccess('');

        // Combine details into a single object/string for the backend
        const withdrawalDetails = method === 'bank' ? 
            { ...bankDetails, bankName: bankName } : 
            upiId;

        try {
            await axios.post(`${API_BASE_URL}/api/withdraw`, 
                {
                    amount: amountFloat,
                    method,
                    details: withdrawalDetails // Send the combined details object/string
                }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            setSuccess('Withdrawal request submitted successfully! Funds will be processed shortly.');
            setAmount('');
            setBankDetails({
                accountNumber: '',
                ifscCode: '',
                accountHolderName: ''
            });
            setUpiId('');
            setBankName('');
            fetchWithdrawals(); // Refresh withdrawals list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request withdrawal');
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const availableBalance = userData?.withdrawable_wallet || 0;

    return (
        <div className="withdrawal-container">
            {/* Header */}
            <div className="withdrawal-header">
                <button 
                    onClick={onBack}
                    className="secondary-button"
                    style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                    }}
                >
                    ←
                </button>
                <h1>Withdraw Funds</h1>
                <div style={{ width: '40px' }}></div> {/* Spacer for alignment */}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="withdrawal-card">
                <h2>Withdrawal Request</h2>
                <p className="available-balance-info">
                    Available Withdrawable Balance: <strong>{formatCurrency(availableBalance)}</strong>
                </p>
                
                <form onSubmit={handleRequestWithdrawal}>
                    {/* Amount Input */}
                    <div className="form-group">
                        <label className="form-label">Amount to Withdraw:</label>
                        <input
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="Enter amount"
                            className="form-input"
                        />
                    </div>

                    {/* Method Selection */}
                    <div className="form-group">
                        <label className="form-label">Withdrawal Method:</label>
                        <div className="method-selection">
                            <button
                                type="button"
                                className={`method-button ${method === 'bank' ? 'selected' : ''}`}
                                onClick={() => setMethod('bank')}
                            >
                                <div className="method-icon">🏦</div>
                                <div className="method-name">Bank Transfer</div>
                            </button>
                            <button
                                type="button"
                                className={`method-button ${method === 'upi' ? 'selected' : ''}`}
                                onClick={() => setMethod('upi')}
                            >
                                <div className="method-icon">💳</div>
                                <div className="method-name">UPI</div>
                            </button>
                        </div>
                    </div>

                    {/* Method Specific Fields */}
                    {method === 'bank' ? (
                        <div className="bank-details">
                            <div className="form-group">
                                <label className="form-label">Account Holder Name:</label>
                                <input
                                    type="text"
                                    value={bankDetails.accountHolderName}
                                    onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
                                    placeholder="Enter account holder name"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Account Number:</label>
                                <input
                                    type="text"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                                    placeholder="Enter account number"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">IFSC Code:</label>
                                <input
                                    type="text"
                                    value={bankDetails.ifscCode}
                                    onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value)}
                                    placeholder="Enter IFSC code"
                                    className="form-input"
                                    maxLength="11"
                                    required
                                />
                                {isIfscLoading && <p className="ifsc-status loading">Verifying...</p>}
                                {bankName && !isIfscLoading && (
                                    <p className={`ifsc-status ${bankName === 'Verification Failed' ? 'failed' : 'success'}`}>
                                        Bank: <strong>{bankName}</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="upi-details">
                            <div className="form-group">
                                <label className="form-label">UPI ID:</label>
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="Enter UPI ID (e.g., mobile@upi)"
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Amount Breakdown */}
                    {amount && parseFloat(amount) > 0 && (
                        <div className="amount-section">
                            <div className="amount-row">
                                <span className="amount-label">Amount:</span>
                                <span className="amount-value">{formatCurrency(parseFloat(amount))}</span>
                            </div>
                            <div className="amount-row">
                                <span className="amount-label">GST (18%):</span>
                                <span className="amount-value">-{formatCurrency(calculateGST(parseFloat(amount)))}</span>
                            </div>
                            <div className="amount-row amount-total">
                                <span className="amount-label">Net Amount:</span>
                                <span className="amount-value">{formatCurrency(calculateNetAmount(parseFloat(amount)))}</span>
                            </div>
                        </div>
                    )}

                    <div className="form-buttons">
                        <button 
                            type="submit" 
                            className="gradient-button"
                            disabled={loading || isIfscLoading || (method === 'bank' && (!bankName || bankName === 'Verification Failed'))}
                        >
                            {loading ? 'Processing...' : 'Request Withdrawal'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Withdrawal History */}
            <div className="history-section">
                <h2>Withdrawal History</h2>
                
                {withdrawals.length > 0 ? (
                    <div>
                        {withdrawals.slice(0, 5).map(withdrawal => (
                            <div key={withdrawal.id} className="history-item">
                                <div className="history-item-header">
                                    <div className="history-item-amount">
                                        {formatCurrency(withdrawal.amount)}
                                    </div>
                                    <span className={`history-item-status ${withdrawal.status}`}>
                                        {withdrawal.status}
                                    </span>
                                </div>
                                <div className="history-item-details">
                                    <span>{withdrawal.method.toUpperCase()}</span>
                                    <span>{formatDate(withdrawal.request_date)}</span>
                                </div>
                                {withdrawal.status === 'rejected' && withdrawal.remarks && (
                                    <div style={{ 
                                        color: 'var(--error-color)', 
                                        fontSize: '14px',
                                        marginTop: '8px'
                                    }}>
                                        Reason: {withdrawal.remarks}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="premium-card" style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--card-bg-color)' }}>
                        <p style={{ margin: '0', color: 'var(--text-color-light)' }}>
                            No withdrawal history
                        </p>
                    </div>
                )}
            </div>
            
            {/* FAB button removed as a back button is in the header */}
        </div>
    );
}

export default WithdrawalForm;
