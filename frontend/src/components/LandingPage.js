import React, { useState } from 'react';
import './LandingPage.css';
import { FidelityLogoIcon, LoginIcon } from './Icons';

// ✅ IMPORTANT: Make sure you have an 'assets' folder inside your 'src' directory
// and that these images are placed inside it.
import solarPlanImage from '../assets/solar-plan.png'; 
import aviatorGameImage from '../assets/aviator-game.png';
import inflationImage from '../assets/inflation-image.jpg';
import promoImage from '../assets/ipbi.png';

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
        { q: "How quickly can I withdraw my winnings?", a: "Withdrawals are processed swiftly. Most requests are completed within 40 minutes, ensuring you have quick access to your earnings." },
        { q: "How does the referral system work?", a: "Our referral system allows you to earn a commission when someone signs up with your link and makes a deposit (Level 1), and a smaller commission from their referrals (Level 2)." },
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
            <h3>Welcome to InvestmentPlus!</h3>
            <p className="bonus-highlight">Register now to get an instant <strong>₹50 Bonus</strong> and up to a <strong>300% Deposit Bonus</strong> on your first investment!</p>
            <button className="cta-button" onClick={onRegisterClick}>Register Now</button>
        </div>
    </div>
);

function LandingPage({ authView, setAuthView, loginFormData, registerFormData, handleLoginInputChange, handleRegisterInputChange, handleLogin, handleRegister, loading }) {
    
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPromo, setShowPromo] = useState(true);
    
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
        handleRegister(e);
    };
    
    return (
        <div className="landing-page">
            {showPromo && <PromoModal onClose={() => setShowPromo(false)} onRegisterClick={() => { setShowPromo(false); scrollToAuth('register'); }} />}
            
            <section className="hero-section" onClick={() => scrollToAuth('register')}>
                <img src={promoImage} alt="InvestmentPlus Promotion" className="hero-image"/>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title-animate">Your Financial Future, Reimagined</h1>
                    <div className="hero-cta-animate">
                        <span className="cta-button-text">Click to Start Earning</span>
                    </div>
                </div>
            </section>

            <main id="main-content" className="main-content">
                <section className="hero-content-below-image">
                     <h2>Worried About Your Money?</h2>
                    <p>Don't be. We are with you in shaping your financial situation for the better. With our investment products that provide daily income and exciting games that offer big wins, your journey to financial independence starts now.</p>
                </section>

                <section id="inflation" className="content-section">
                     <div className="content-image"><img src={inflationImage} alt="Money losing value"/></div>
                    <div className="content-text">
                        <h2>Don't Let Inflation Eat Your Savings</h2>
                        <p>Every day, the money in your bank account is losing purchasing power. To truly grow your wealth and secure your future, your money needs to work for you and grow faster than inflation.</p>
                    </div>
                </section>
                
                <section id="plans" className="sample-section dark-bg">
                    <h2>Our Investment Products</h2>
                    <div className="sample-grid">
                        <div className="sample-card"><img src={solarPlanImage} alt="Solar Energy Plan"/><h3>Solar Energy Plans</h3><p>Invest in a green future and earn stable daily returns by funding large-scale solar projects.</p></div>
                         <div className="sample-card"><img src={aviatorGameImage} alt="Aviator Game"/><h3>Aviator Game</h3><p>Test your nerve in this thrilling crash game. Cash out before the plane flies away to multiply your bet!</p></div>
                    </div>
                </section>
                
                <section id="auth" className="auth-section">
                    <div className="auth-container">
                        <div className="auth-form-wrapper">
                            <div className="casino-icon"><LoginIcon/></div>
                            {authView === 'login' ? (
                                <form onSubmit={handleLogin} className="auth-form">
                                    <h2>Welcome Back!</h2>
                                    <div className="input-box"><input type="tel" name="mobile" value={loginFormData.mobile} onChange={handleLoginInputChange} required autoComplete="tel"/><label>Mobile Number</label></div>
                                    <div className="input-box"><input type="password" name="password" value={loginFormData.password} onChange={handleLoginInputChange} required autoComplete="current-password"/><label>Password</label></div>
                                    <button className="cta-button" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                                    <p className="auth-switch">Don't have an account? <button type="button" onClick={() => setAuthView('register')}>Sign Up</button></p>
                                </form>
                            ) : (
                                 <form onSubmit={handleRegisterSubmit} className="auth-form">
                                    <h2>Join InvestmentPlus</h2>
                                     <div className="input-box"><input type="text" name="username" value={registerFormData.username} onChange={handleRegisterInputChange} required autoComplete="username"/><label>Username</label></div>
                                    <div className="input-box"><input type="tel" name="mobile" value={registerFormData.mobile} onChange={handleRegisterInputChange} required autoComplete="tel"/><label>Mobile Number</label></div>
                                    <div className="input-box"><input type="password" name="password" value={registerFormData.password} onChange={handleRegisterInputChange} required autoComplete="new-password"/><label>Password</label></div>
                                    <div className="input-box"><input type="password" name="confirmPassword" value={registerFormData.confirmPassword} onChange={handleRegisterInputChange} required autoComplete="new-password"/><label>Confirm Password</label></div>
                                    <div className="input-box"><input type="text" name="referralCode" value={registerFormData.referralCode} onChange={handleRegisterInputChange} autoComplete="off" /><label>Referral Code (Optional)</label></div>
                                    <div className="terms-checkbox">
                                        <input type="checkbox" id="terms" name="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                                        <label htmlFor="terms">I accept all the <a href="#terms" target="_blank">Terms and Conditions</a></label>
                                    </div>
                                    <button className="cta-button" type="submit" disabled={loading || !termsAccepted}>{loading ? 'Registering...' : 'Register'}</button>
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
                    <p>InvestmentPlus is a premier platform dedicated to democratizing wealth creation. We believe that everyone, regardless of their financial background, deserves the opportunity to build a secure and prosperous future. By combining expertly managed, high-yield investment products with fair and engaging skill-based games, we provide a unique and powerful ecosystem for our members to grow their capital and achieve their financial goals.</p>
                    <div className="trust-section"><div className="trust-badge">SEBI Compliant*</div><div className="trust-badge">Follows RBI Guidelines*</div></div>
                    <div className="partner-section"><span>Backed By</span><FidelityLogoIcon /></div>
                </section>
                
                <footer className="landing-footer">
                    <p><strong>InvestmentPlus Solutions Pvt. Ltd.</strong></p>
                    <p>12th Floor, Tower C, Tech Boulevard, Sector 127, Noida, Uttar Pradesh 201303, India</p>
                    <p className="disclaimer">*Disclaimer: Investments are subject to market risks. Please read all scheme-related documents carefully. Gaming involves an element of financial risk and may be addictive. Please play responsibly and at your own risk. InvestmentPlus is a privately operated platform and is not directly affiliated with or regulated by SEBI or RBI.</p>
                </footer>
            </main>
        </div>
    );
}

export default LandingPage;

