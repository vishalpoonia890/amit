import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import './FormPages.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// IMPORTANT: You must add these variables to your frontend's .env file
// In Create React App, they would be in a file named .env.local
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function Deposit({ token, onBack, onDepositRequest }) {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [utr, setUtr] = useState('');
    const [paymentInfo, setPaymentInfo] = useState({ upi: {} });
    const [maintenance, setMaintenance] = useState({ isDown: false, endsAt: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // New state for file upload
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [filePreview, setFilePreview] = useState('');

    useEffect(() => {
        const fetchDepositInfo = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/deposit-info`, { headers: { Authorization: `Bearer ${token}` } });
                const upiData = data.methods.find(m => m.method_name === 'UPI') || {};
                setPaymentInfo({ upi: upiData });
                
                const status = data.status;
                if (status.is_maintenance && new Date(status.maintenance_ends_at) > new Date()) {
                    setMaintenance({ isDown: true, endsAt: status.maintenance_ends_at });
                }
            } catch (error) {
                console.error("Failed to fetch deposit info:", error);
                setError("Could not load deposit information. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchDepositInfo();
    }, [token]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic validation for file type and size (optional but recommended)
            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file (jpg, png, webp).');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File is too large. Please upload an image under 5MB.');
                return;
            }
            setError('');
            setScreenshotFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const handleDepositSubmit = async (e) => {
        e.preventDefault();
        if (!utr || utr.length < 12) {
            setError("Please enter a valid 12-digit UTR number.");
            return;
        }
        if (!screenshotFile) {
            setError("Please upload a screenshot of your payment.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            // 1. Get the current user's ID for creating a unique folder path
            const userResponse = await supabase.auth.getUser();
            const userId = userResponse.data.user.id;
            const filePath = `${userId}/${Date.now()}_${screenshotFile.name}`;

            // 2. Upload the screenshot to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('payment-screenshots')
                .upload(filePath, screenshotFile);

            if (uploadError) throw uploadError;

            // 3. Get the public URL of the uploaded file
            const { data: urlData } = supabase.storage
                .from('payment-screenshots')
                .getPublicUrl(uploadData.path);
            
            const screenshotUrl = urlData.publicUrl;

            // 4. Submit the recharge request to your server with all details
            await axios.post(
                `${API_BASE_URL}/api/recharge`,
                { amount: parseInt(amount), utr, screenshotUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            onDepositRequest(amount);
            setSuccess("Your deposit request has been submitted successfully!");
            setTimeout(() => onBack(), 2000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
    };

    if (maintenance.isDown) {
        return (
            <div className="form-page">
                <div className="maintenance-notice">
                    <h3>Deposits Temporarily Unavailable</h3>
                    <p>We are currently performing scheduled maintenance. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recharge-container">
            <div className="recharge-header">
                <button onClick={onBack} className="secondary-button">←</button>
                <h1>Wallet Recharge</h1>
                <div></div> {/* Placeholder for alignment */}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="recharge-card">
                <div className="recharge-steps">
                    {["Amount", "Pay", "Confirm"].map((label, i) => (
                        <div key={label} className={`step ${step >= i + 1 ? "active" : ""} ${step > i + 1 ? "completed" : ""}`}>
                            <div className="step-circle">{i + 1}</div>
                            <div className="step-label">{label}</div>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="recharge-step">
                        <h2>Enter Recharge Amount</h2>
                        <input
                            type="number"
                            className="amount-input"
                            placeholder="e.g., 500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <div className="form-buttons">
                            <button className="gradient-button" onClick={() => setStep(2)} disabled={!amount || parseInt(amount) < 100}>
                                Proceed to Pay
                            </button>
                        </div>
                    </div>
                )}
            
                {step === 2 && (
                    <div className="recharge-step">
                        <h2>Complete Payment</h2>
                        <p>Scan the QR to pay <strong>₹{parseInt(amount).toLocaleString()}</strong></p>
                        <img src={paymentInfo.upi.qr_code_url} alt="UPI QR Code" className="qr-code" />
                        <div className="upi-id-display">
                            <span>{paymentInfo.upi.account_id}</span>
                            <button className="copy-button" onClick={() => copyToClipboard(paymentInfo.upi.account_id)}>Copy</button>
                        </div>
                        <div className="form-buttons">
                            <button className="secondary-button" onClick={() => setStep(1)}>Back</button>
                            <button className="gradient-button" onClick={() => setStep(3)}>Next Step</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <form className="recharge-step" onSubmit={handleDepositSubmit}>
                        <h2>Confirm Your Payment</h2>
                        <input
                            type="text"
                            placeholder="Enter 12-digit UTR"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12))}
                            className="utr-input"
                        />
                        <div className="upload-area">
                            <label htmlFor="screenshot-upload">
                                {filePreview ? 
                                    <img src={filePreview} alt="Screenshot Preview" className="screenshot-preview"/> : 
                                    "Click to Upload Screenshot"
                                }
                            </label>
                            <input id="screenshot-upload" type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="form-buttons">
                            <button type="button" className="secondary-button" onClick={() => setStep(2)}>Back</button>
                            <button type="submit" className="gradient-button" disabled={loading || !utr || !screenshotFile}>
                                {loading ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Deposit;

