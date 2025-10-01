import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './LandingPage.css'; // Re-importing the CSS file

// --- Placeholder Icon Definitions (Replaces import from './Icons') ---
const FidelityLogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="partner-logo">
        <path d="M12 2l1.41 4.33H18.7l-3.59 2.6L16.59 14 12 11.25 7.41 14 8.89 8.93 5.3 6.33h5.29L12 2z"></path>
    </svg>
);

const LoginIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="casino-login-icon">
        <path d="M15 3h6v6"></path>
        <path d="M10 14L21 3"></path>
        <path d="M22 10v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9"></path>
    </svg>
);

// --- SVG Icons for Password Toggle ---
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

// --- Placeholder Image URLs (Used in place of local asset imports) ---
const solarPlanImage = 'https://placehold.co/400x250/2ecc71/ffffff?text=Solar+Investment';
const aviatorGameImage = 'https://placehold.co/400x250/e74c3c/ffffff?text=Blackjack+Game';
const inflationImage = 'https://placehold.co/400x250/e67e22/ffffff?text=Wealth+Growth+Chart';
const promoImage = 'https://placehold.co/1200x800/2c3e50/ffffff?text=MoneyPlus+Mega+Bonus';
const casinoNews1 = 'https://placehold.co/300x200/9b59b6/ffffff?text=Casino+Fun+1';
const casinoNews2 = 'https://placehold.co/300x200/3498db/ffffff?text=Casino+Fun+2';
const casinoNews3 = 'https://placehold.co/300x200/1abc9c/ffffff?text=Casino+Fun+3';

// Debounce utility function
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

// --- Child Components ---

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
        { q: "Is my investment safe?", a: "Yes, security is our top priority. We employ advanced encryption and security protocols to protect your funds and personal information, backed by a robust legal framework." },
        { q: "How quickly can I withdraw my winnings?", a: "Withdrawals are processed swiftly. Most requests are completed within 40 minutes, ensuring you have quick access to your earnings." },
        { q: "How does the referral system work?", a: "Our referral system allows you to earn a commission when someone signs up with your link and makes a deposit (Level 1), and a smaller commission from their referrals (Level 2). Share and earn!" },
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

const testimonialsData = [
    { name: "Priya S.", city: "Mumbai", quote: "I started small with the Solar Plan and now use my daily returns to play the games. It's the perfect balance of security and excitement!" },
    { name: "Kunal M.", city: "Delhi", quote: "The fast withdrawal process is what sold me. Plus, the investment returns are much better than anything I found locally. MoneyPlus is a game-changer." },
    { name: "Aisha R.", city: "Bangalore", quote: "Finally, a platform that understands both financial growth and fun. I've already referred three friends—the referral income is a sweet bonus!" },
];

const TestimonialCard = ({ name, city, quote }) => (
    <div className="testimonial-card-item">
        <div className="quote-icon">“</div>
        <p className="quote">"{quote}"</p>
        <p className="author"><strong>{name}</strong>, <span>{city}</span></p>
    </div>
);

const Testimonials = () => (
    <div className="testimonials-grid">
        {testimonialsData.map((t, index) => (
            <TestimonialCard key={index} {...t} />
        ))}
    </div>
);

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

const FloatingCTA = ({ onRegisterClick }) => (
    <div className="floating-cta-bar" onClick={onRegisterClick}>
        <div className="cta-text">
            🚀 **Instant Bonus** - Click to Register and Get ₹50 Free!
        </div>
        <button className="cta-button-mini">Register Now</button>
    </div>
);

// --- Main Component ---

export default function LandingPage({ authView, setAuthView, loginFormData, registerFormData, handleLoginInputChange, handleRegisterInputChange, handleLogin, handleRegister, loading }) {
    
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
        // Replaced alert() with a console error/warning to avoid blocking UI
        if (!termsAccepted) {
            console.warn("User must accept the terms and conditions to register.");
            return;
        }
        if (!cityName) {
            console.warn("Please enter a valid 6-digit PIN code and ensure the city name is displayed.");
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
                    <div className="hero-cta-animate">
                        <span className="cta-button-text">Click to Start Earning</span>
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
                </section>

                <section className="hero-content-below-image">
                    <h2>Worried About Your Money?</h2>
                    <p>Don't be. We are with you in shaping your financial situation for the better. With our investment products that provide daily income and exciting games that offer big wins, your journey to **financial independence starts now**.</p>
                </section>
                
                {/* --- NEW SECTION: Why Choose MoneyPlus? (for SEO and trust) --- */}
                <section id="why-choose" className="content-section dark-bg">
                    <h2>Why Choose MoneyPlus? 🚀</h2>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <h3>High-Yield Investments</h3>
                            <p>Generate **daily returns** that outpace inflation with our expertly managed investment products.</p>
                        </div>
                        <div className="benefit-card">
                            <h3>Instant Withdrawals</h3>
                            <p>Get your winnings and daily income in your account in **under 40 minutes**, guaranteed.</p>
                        </div>
                        <div className="benefit-card">
                            <h3>Secure & Trusted Platform</h3>
                            <p>Your security is our priority. We use advanced encryption to protect your funds and data.</p>
                        </div>
                        <div className="benefit-card">
                            <h3>24/7 Customer Support</h3>
                            <p>Our dedicated team is always here to help you with any investment or gaming queries.</p>
                        </div>
                    </div>
                </section>
                {/* ----------------------------------------------------------------- */}

                <section id="growth" className="content-section">
                    <div className="content-text">
                        <h2>See Your Wealth Grow Daily 📈</h2>
                        <p>Our investments pay out daily, meaning your earnings immediately start compounding. **Imagine earning while you sleep.** This powerful compounding effect allows you to accelerate your financial goals, turning small investments into significant wealth over time. Don't wait—start benefiting from daily compounding today.</p>
                        <button className="cta-button-inline" onClick={() => scrollToAuth('register')}>Start Daily Earning Now</button>
                    </div>
                    <div className="content-image"><img src={inflationImage} alt="Money growing in a graph"/></div>
                </section>
                
                <section id="testimonials" className="content-section dark-bg">
                    <h2>What Our Users Say</h2>
                    <Testimonials />
                </section>

                <section id="plans" className="sample-section">
                    <h2>Investment & Gaming Offerings</h2>
                    <div className="sample-grid">
                        <div className="sample-card"><img src={solarPlanImage} alt="Solar Energy Plan"/><h3>Solar Energy Plans</h3><p>Invest in a green future and earn stable daily returns by funding large-scale solar projects. **Lowest entry barrier guaranteed.**</p></div>
                        <div className="sample-card"><img src={aviatorGameImage} alt="Black-Jack"/><h3>Black-Jack</h3><p>Test your nerve in this thrilling card game. Play smartly and show your talent to multiply your bet! **Fair & Transparent.**</p></div>
                    </div>
                </section>
                
                <section className="casino-news-section dark-bg">
                    <h2>Excitement & Big Wins Await</h2>
                    <div className="casino-grid">
                        <img src={casinoNews1} alt="Casino Fun 1" />
                        <img src={casinoNews2} alt="Casino Fun 2" />
                        <img src={casinoNews3} alt="Casino Fun 3" />
                    </div>
                    <p>Play responsibly and enjoy exciting games while growing your earnings. **The next jackpot could be yours!**</p>
                    <button className="cta-button-inline" onClick={() => scrollToAuth('register')}>Register & Get ₹50 Bonus</button>
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

                <section id="faq" className="content-section">
                    <h2>Frequently Asked Questions</h2>
                    <FAQ />
                </section>

                <section id="about" className="content-section dark-bg">
                    <h2>Who Are We? | The MoneyPlus Promise</h2>
                    <p>MoneyPlus is a premier platform dedicated to democratizing wealth creation. We believe that everyone, regardless of their financial background, deserves the opportunity to build a secure and prosperous future. By combining expertly managed, high-yield investment products with fair and engaging skill-based games, we provide a unique and powerful ecosystem for our members to **grow their capital and achieve their financial goals**.</p>
                    <div className="trust-section"><div className="trust-badge">Encrypted Security</div><div className="trust-badge">Fastest Payouts</div></div>
                    <div className="partner-section"><span>Backed By</span><FidelityLogoIcon /></div>
                </section>
                
                {/* --- FOOTER CONTENT: Risk Disclosure & SEO --- */}
                <footer className="landing-footer">
                    <p><strong>MoneyPlus Solutions Pvt. Ltd.</strong></p>
                    <p>12th Floor, Tower C, Tech Boulevard, Texas, USA</p>
                    
                    <div className="licensing-info">
                        <h3>Risk Disclosure & Key Information</h3>
                        <p><strong>Investment Focus:</strong> Our core business provides access to private financial instruments like Solar Energy Bonds, structured to offer high daily returns. These are not publicly traded equity or mutual funds.</p>
                        <p><strong>Skill-Based Gaming:</strong> We offer engaging, skill-based games to supplement earnings. Please remember, these games involve financial risk.</p>
                        <p><strong>Keywords for SEO:</strong> Daily Income Investment, High Return Schemes, Top Casino Games India, Low-Risk Investment, Financial Freedom Platform.</p>
                    </div>

                    <p className="disclaimer">*Disclaimer: Investments are subject to market risks. Please read all scheme-related documents carefully. Gaming involves an element of financial risk and may be addictive. Please play responsibly and at your own risk. MoneyPlus is a privately operated platform and is not directly affiliated with or regulated by SEBI or RBI.</p>
                </footer>
            </main>
            
            {/* --- Floating CTA Bar for High Conversion Rate --- */}
            <FloatingCTA onRegisterClick={() => scrollToAuth('register')} />
        </div>
    );
}
