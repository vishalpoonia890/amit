import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './LandingPage.css';
import { FidelityLogoIcon, LoginIcon } from './Icons';

// Asset imports
import solarPlanImage from '../assets/solar.png'; 
import aviatorGameImage from '../assets/blackjack.png';
import inflationImage from '../assets/inflation.png';
import promoImage from '../assets/ipbia.png';
import casinoNews1 from '../assets/casino1.jpg';
import casinoNews2 from '../assets/casino2.jpg';
import casinoNews3 from '../assets/casino3.jpg';

// The conversion tracking function provided by Google Ads
function gtag_report_conversion(url) {
    // Check if gtag is defined before calling it
    if (typeof window.gtag !== 'function') {
        console.error("Google Ads gtag function is not loaded!");
        return true; // Prevent further execution if gtag is missing
    }
    
    // Assign window.gtag to a local variable named gtag for cleaner use inside this function
    const gtag = window.gtag; 
    
    var callback = function () {
        if (typeof(url) != 'undefined') {
            window.location = url;
        }
    };
    gtag('event', 'conversion', {
        'send_to': 'AW-17609971527/xMgkCI_v_qUbEMeui81B',
        'value': 1.0,
        'currency': 'INR',
        'event_callback': callback
    });
    return false;
}

// Debounce utility function (to prevent too many API calls while typing)
const debounce = (func, delay) => {

    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

// --- SVG Icons for Password Toggle ---
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);


const AccordionItem = ({ title, children, isOpen, onClick }) => (
    <div className="faq-item">
        <button className="faq-header" onClick={onClick}>
            <span>{title}</span>
            <span className="faq-icon">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div className="faq-content">{children}</div>}
    </div>
);

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
        { q: "Is my investment safe?", a: "Yes, security is our top priority. We employ advanced encryption and security protocols to protect your funds and personal information." },
        { q: "How quickly can I withdraw my winnings?", a: "Withdrawals are processed swiftly. Most requests are completed within **40 minutes**, ensuring you have quick access to your earnings." },
        { q: "How does the referral system work?", a: "Our referral system allows you to earn a commission when someone signs up with your link and makes a deposit (Level 1), and a smaller commission from their referrals (Level 2)." },
        { q: "Is this gambling or investment?", a: "MoneyPlus is primarily an investment platform offering high-yield products. We also offer optional skill-based games as a supplementary way to earn." },
    ];

    return (
        <div className="faq-section">
            {faqs.map((faq, index) => (
                <AccordionItem key={index} title={faq.q} isOpen={openIndex === index} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                    <p>{faq.a}</p>
                </AccordionItem>
            ))}
        </div>
    );
};

const PromoModal = ({ onClose, onRegisterClick }) => (
    <div className="promo-modal-overlay" onClick={onClose}>
        <div className="promo-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={onClose}>&times;</button>
            <h3>Welcome to MoneyPlus!</h3>
            <p className="bonus-highlight">Register now to get an instant <strong>₹50 Bonus</strong> and up to a <strong>300% Deposit Bonus</strong> on your first investment!</p>
            <button className="cta-button" onClick={onRegisterClick}>Register Now</button>
        </div>
    </div>
);

function LandingPage({ authView, setAuthView, loginFormData, registerFormData, handleLoginInputChange, handleRegisterInputChange, handleLogin, handleRegister, loading }) {
    
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPromo, setShowPromo] = useState(true);
    
    // --- State for password visibility ---
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- State for Pincode/City ---
    const [cityName, setCityName] = useState('');
    const [pinCodeError, setPinCodeError] = useState('');

    // --- Pincode API Call Logic ---
    const fetchCityName = useCallback(async (pinCode) => {
        setCityName('');
        setPinCodeError('');
        if (!pinCode || pinCode.length !== 6 || isNaN(pinCode)) {
            return;
        }

        try {
            // Using the official India Post API for reliable Pincode lookup
            const response = await axios.get(`https://api.postalpincode.in/pincode/${pinCode}`);
            const data = response.data;

            if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
                // Use the main district/region name
                setCityName(data[0].PostOffice[0].District);
            } else {
                setPinCodeError('Invalid Pincode.');
                setCityName('');
            }
        } catch (error) {
            console.error("Pincode API Error:", error);
            setPinCodeError('Failed to verify Pincode.');
            setCityName('');
        }
    }, []);

    const debouncedFetchCityName = useCallback(debounce(fetchCityName, 500), [fetchCityName]);

    const handlePinCodeChange = (e) => {
        const pinCode = e.target.value;
        // Update the form data
        handleRegisterInputChange({ target: { name: 'cityPinCode', value: pinCode } });
        // Trigger debounced lookup
        if (pinCode.length === 6) {
            debouncedFetchCityName(pinCode);
        } else {
            setCityName('');
            setPinCodeError('');
        }
    };
    
    const scrollToAuth = (view) => {
        setAuthView(view);
        document.getElementById('auth').scrollIntoView({ behavior: 'smooth' });
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (!termsAccepted) {
            alert("You must accept the terms and conditions to register.");
            return;
        }
        if (!cityName) {
            alert("Please enter a valid 6-digit PIN code and ensure the city name is displayed.");
            return;
        }
        handleRegister(e);
    };
    
    return (
        <div className="landing-page">
            {showPromo && <PromoModal onClose={() => setShowPromo(false)} onRegisterClick={() => { setShowPromo(false); scrollToAuth('register'); }} />}
            
            <section className="hero-section" onClick={() => scrollToAuth('register')}>
                <img src={promoImage} alt="MoneyPlus Promotion" className="hero-image"/>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title-animate">Your Financial Future, Reimagined</h1>
                    <div className="hero-cta-animate pulse-animation"> 
                        <span className="cta-button-text">Click to Start Earning ₹50 Bonus!</span>
                    </div>
                </div>
            </section>

            <main id="main-content" className="main-content">
                <section className="stats-section">
                    <div className="stat-item">
                        <span className="stat-value">100000+</span>
                        <span className="stat-label">Happy Investors</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">₹50 Cr+</span>
                        <span className="stat-label">Total Investments</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">₹5 Cr+</span>
                        <span className="stat-label">Paid Out Daily</span>
                    </div>
                </section>

                <section className="hero-content-below-image">
                    <h2>Worried About Your Money?</h2>
                    <p>Don't be. We are with you in shaping your financial situation for the better. With our investment products that provide daily income and exciting **skill-based games** that offer big wins, your journey to financial independence starts now.</p>
                </section>
                
                {/* --- NEW SECTION: Why Choose MoneyPlus? (TRUST CONTENT IMPROVED) --- */}
                <section id="why-choose" className="content-section dark-bg">
                    <h2>Why Choose MoneyPlus? 🚀</h2>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <h3>High-Yield Investments</h3>
                            <p>Generate **up to 12% daily returns** on select products. Your money grows while you sleep.</p>
                        </div>
                        <div className="benefit-card">
                            <h3>Instant Withdrawals</h3>
                            <p>Cashout Guarantee: Get your funds in your bank in **under 40 minutes**, guaranteed.</p>
                        </div>
                        <div className="benefit-card">
                            <h3>Secure & Trusted Platform</h3>
                            <p>**256-bit SSL Encryption.** Your data is secured with bank-grade protocols and biometric authentication support.</p>
                        </div>
                        <div className="benefit-card">
                            <h3>24/7 Customer Support</h3>
                            <p>**Dedicated WhatsApp Support.** Instant help available 24/7 to resolve any query.</p>
                        </div>
                    </div>
                </section>
                {/* ----------------------------------------------------------------- */}

                <section id="inflation" className="content-section">
                    <div className="content-image"><img src={inflationImage} alt="Money losing value"/></div>
                    <div className="content-text">
                        <h2>Don't Let Inflation Eat Your Savings</h2>
                        <p>Every day, the money in your bank account is losing purchasing power. To truly grow your wealth and secure your future, your money needs to work for you and grow faster than inflation. **Start earning passive income today.**</p>
                    </div>
                </section>
                
                <section id="plans" className="sample-section dark-bg">
                    <h2>Our Investment Products & Games</h2>
                    <div className="sample-grid">
                        <div className="sample-card"><img src={solarPlanImage} alt="Solar Energy Plan"/><h3>Solar Energy Plans</h3><p>Invest in a green future and earn stable daily returns by funding large-scale solar projects.</p></div>
                        <div className="sample-card"><img src={aviatorGameImage} alt="Black-Jack"/><h3>Black-Jack & Skill Games</h3><p>Test your nerve in this thrilling card game. Play smartly and show your talent to multiply your bet!</p></div>
                    </div>
                </section>
                
                <section className="casino-news-section">
                    <h2>Skill-Based Games & Fun</h2>
                    <div className="casino-grid">
                        <img src={casinoNews1} alt="Skill Game Fun 1" />
                        <img src={casinoNews2} alt="Skill Game Fun 2" />
                        <img src={casinoNews3} alt="Skill Game Fun 3" />
                    </div>
                    <p>Play responsibly and enjoy exciting games while supplementing your earnings. **This is not gambling.**</p>
                </section>
                
                <section id="auth" className="auth-section">
                    <div className="auth-container">
                        <div className="auth-form-wrapper">
                            <div className="casino-icon"><LoginIcon/></div>
                            {authView === 'login' ? (
                                <form onSubmit={handleLogin} className="auth-form">
                                    <h2>Welcome Back!</h2>
                                    <div className="input-box"><input type="tel" name="mobile" value={loginFormData.mobile} onChange={handleLoginInputChange} required autoComplete="tel"/><label>Mobile Number</label></div>
                                    <div className="input-box">
                                        <input 
                                            type={showLoginPassword ? 'text' : 'password'} 
                                            name="password" 
                                            value={loginFormData.password} 
                                            onChange={handleLoginInputChange} 
                                            required 
                                            autoComplete="current-password"
                                        />
                                        <label>Password</label>
                                        <button type="button" className="password-toggle-btn" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                                            {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                    <button className="cta-button" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                                    <p className="auth-switch">Don't have an account? <button type="button" onClick={() => setAuthView('register')}>Sign Up</button></p>
                                </form>
                            ) : (
                                <form onSubmit={handleRegisterSubmit} className="auth-form">
                                    <h2>Join MoneyPlus</h2>
                                    <div className="input-box"><input type="text" name="username" value={registerFormData.username} onChange={handleRegisterInputChange} required autoComplete="username"/><label>Username</label></div>
                                    
                                    <div className="input-box"><input type="number" name="mobile" value={registerFormData.mobile} onChange={handleRegisterInputChange} required autoComplete="tel" pattern="\d*"/><label>Mobile Number</label></div>
                                    
                                    {/* --- Pincode Input (City Code/Name feature) --- */}
                                    <div className="input-box">
                                        <input 
                                            type="tel" 
                                            name="cityPinCode" 
                                            value={registerFormData.cityPinCode || ''} 
                                            onChange={handlePinCodeChange} 
                                            placeholder="" 
                                            maxLength="6"
                                            required 
                                        />
                                        <label>City Pin Code</label>
                                    </div>
                                    {cityName && <p className="pincode-status success">City: <strong>{cityName}</strong></p>}
                                    {pinCodeError && <p className="pincode-status error">{pinCodeError}</p>}
                                    
                                    <div className="input-box">
                                        <input 
                                            type={showRegisterPassword ? 'text' : 'password'} 
                                            name="password" 
                                            value={registerFormData.password} 
                                            onChange={handleRegisterInputChange} 
                                            required 
                                            autoComplete="new-password"
                                        />
                                        <label>Password</label>
                                        <button type="button" className="password-toggle-btn" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                                            {showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                    <div className="input-box">
                                        <input 
                                            type={showConfirmPassword ? 'text' : 'password'} 
                                            name="confirmPassword" 
                                            value={registerFormData.confirmPassword} 
                                            onChange={handleRegisterInputChange} 
                                            required 
                                            autoComplete="new-password"
                                        />
                                        <label>Confirm Password</label>
                                        <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                    <div className="input-box"><input type="text" name="referralCode" value={registerFormData.referralCode} onChange={handleRegisterInputChange} autoComplete="off" /><label>Referral Code (Optional)</label></div>
                                    <div className="terms-checkbox">
                                        <input type="checkbox" id="terms" name="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                                        <label htmlFor="terms">I accept all the <a href="#terms" target="_blank">Terms and Conditions</a></label>
                                    </div>
                                    <button className="cta-button" type="submit" disabled={loading || !termsAccepted || !cityName}>{loading ? 'Registering...' : 'Register'}</button>
                                    <p className="auth-switch">Already have an account? <button type="button" onClick={() => setAuthView('login')}>Sign In</button></p>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                <section id="faq" className="content-section dark-bg">
                    <h2>Frequently Asked Questions</h2>
                    <FAQ />
                </section>

                <section id="about" className="content-section">
                    <h2>Who Are We?</h2>
                    <p>MoneyPlus is a premier platform dedicated to democratizing wealth creation. We believe that everyone, regardless of their financial background, deserves the opportunity to build a secure and prosperous future. By combining expertly managed, high-yield investment products with fair and engaging skill-based games, we provide a unique and powerful ecosystem for our members to grow their capital and achieve their financial goals.</p>
                    
                    <div className="trust-section">
                        <div className="trust-badge badge-security">🔒 Bank-Grade Security</div>
                        <div className="trust-badge badge-payout">⚡ Guaranteed Payouts</div>
                    </div>
                </section>
                
                {/* --- NEW FOOTER CONTENT: Risk Disclosure & SEO --- */}
                <footer className="landing-footer">
                    <p><strong>MoneyPlus Solutions Pvt. Ltd.</strong></p>
                    <p>12th Floor, Tower C, Tech Boulevard, Texas, USA</p>
                    
                    <div className="licensing-info">
                        <h3>Risk Disclosure & Key Information</h3>
                        <p><strong>Investment Focus:</strong> Our core business provides access to private financial instruments like Solar Energy Bonds, structured to offer high daily returns. These are not publicly traded equity or mutual funds.</p>
                        <p><strong>Skill-Based Gaming:</strong> We offer engaging, skill-based games to supplement earnings. Please remember, these games involve financial risk.</p>
                        <p><strong>Keywords for SEO:</strong> Daily Income Investment, High Return Schemes, Top Casino Games India, Low-Risk Investment, Financial Freedom Platform.</p>
                    </div>

                    <p className="disclaimer">
                        **Disclaimer:** Investments are subject to financial risk. Please read all scheme-related documents carefully. **MoneyPlus is a privately operated platform and is not directly affiliated with or regulated by SEBI, RBI, or any government financial authority.** Gaming involves an element of financial risk and may be addictive. Please play responsibly and at your own risk.
                    </p>
                </footer>
            </main>
        </div>
    );
}

export default LandingPage;
