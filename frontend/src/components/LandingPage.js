import React, { useState } from 'react';
import './LandingPage.css';
import { 
    FidelityLogoIcon, BankVsInvestIcon, PassiveIncomeIcon, FinancialFreedomIcon, 
    SmartInvestingIcon, LongTermGrowthIcon, DiversificationIcon, SpadeIcon
} from './Icons';

// ✅ You will need to add these images to your `src/assets` folder
import solarPlanImage from '../assets/solar.png';
import aviatorGameImage from '../assets/color.png';
import inflationImage from '../assets/inflation.png';
import heroBgImage from '../assets/ipbi.png'; // Replace with your promoter image

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


function LandingPage({ authView, setAuthView, loginFormData, registerFormData, handleLoginInputChange, handleRegisterInputChange, handleLogin, handleRegister, loading }) {
    
    const scrollToAuth = (view) => {
        setAuthView(view);
        document.getElementById('auth').scrollIntoView({ behavior: 'smooth' });
    };
    
    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="landing-logo">Investment<span>Plus</span></div>
                <nav className="landing-nav">
                    <a href="#plans" onClick={(e) => { e.preventDefault(); document.getElementById('plans').scrollIntoView({ behavior: 'smooth' }); }}>Plans</a>
                    <a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq').scrollIntoView({ behavior: 'smooth' }); }}>FAQs</a>
                    <button onClick={() => scrollToAuth('login')} className="login-btn-nav">Login / Register</button>
                </nav>
            </header>

            <section className="hero-section" style={{backgroundImage: `url(${heroBgImage})`}} onClick={() => scrollToAuth('register')}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title-animate">Shape Your Financial Future</h1>
                    <p className="hero-subtitle-animate">Don't just save. Invest. Grow. Play. Your journey to financial independence starts with a single click.</p>
                    <div className="hero-cta-animate">
                        <span className="cta-button-text">Click Anywhere to Begin</span>
                    </div>
                </div>
            </section>

            <main id="main-content" className="main-content">
                <section id="inflation" className="content-section">
                     <div className="content-image">
                        <img src={inflationImage} alt="Money losing value over time"/>
                    </div>
                    <div className="content-text">
                        <h2>Don't Let Inflation Eat Your Savings</h2>
                        <p>Every day, the money in your bank account is losing purchasing power. What costs ₹100 today could cost ₹107 next year. Simply saving is no longer enough. To truly grow your wealth and secure your future, your money needs to work for you and grow faster than inflation.</p>
                    </div>
                </section>
                
                <section id="plans" className="sample-section dark-bg">
                    <h2>Our Investment Products</h2>
                    <div className="sample-grid">
                        <div className="sample-card">
                            <img src={solarPlanImage} alt="Solar Energy Plan"/>
                            <h3>Solar Energy Plans</h3>
                            <p>Invest in a green future and earn stable daily returns by funding large-scale solar projects.</p>
                        </div>
                         <div className="sample-card">
                            <img src={aviatorGameImage} alt="Aviator Game"/>
                            <h3>Aviator Game</h3>
                            <p>Test your nerve in this thrilling crash game. Cash out before the plane flies away to multiply your bet!</p>
                        </div>
                    </div>
                </section>
                
                <section id="auth" className="auth-section">
                    <div className="auth-container">
                        <div className="auth-form-wrapper">
                            <div className="casino-icon"><SpadeIcon/></div>
                            {authView === 'login' ? (
                                <form onSubmit={handleLogin} className="auth-form">
                                    <h2>Welcome Back!</h2>
                                    <div className="input-box"><input type="tel" name="mobile" value={loginFormData.mobile} onChange={handleLoginInputChange} required autoComplete="tel"/><label>Mobile Number</label></div>
                                    <div className="input-box"><input type="password" name="password" value={loginFormData.password} onChange={handleLoginInputChange} required autoComplete="current-password"/><label>Password</label></div>
                                    <button className="cta-button" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                                    <p className="auth-switch">Don't have an account? <button type="button" onClick={() => setAuthView('register')}>Sign Up</button></p>
                                </form>
                            ) : (
                                 <form onSubmit={handleRegister} className="auth-form">
                                    <h2>Join InvestmentPlus</h2>
                                     <div className="input-box"><input type="text" name="username" value={registerFormData.username} onChange={handleRegisterInputChange} required autoComplete="username"/><label>Username</label></div>
                                    <div className="input-box"><input type="tel" name="mobile" value={registerFormData.mobile} onChange={handleRegisterInputChange} required autoComplete="tel"/><label>Mobile Number</label></div>
                                    <div className="input-box"><input type="password" name="password" value={registerFormData.password} onChange={handleRegisterInputChange} required autoComplete="new-password"/><label>Password</label></div>
                                    <div className="input-box"><input type="password" name="confirmPassword" value={registerFormData.confirmPassword} onChange={handleRegisterInputChange} required autoComplete="new-password"/><label>Confirm Password</label></div>
                                    <div className="input-box"><input type="text" name="referralCode" value={registerFormData.referralCode} onChange={handleRegisterInputChange} autoComplete="off" /><label>Referral Code (Optional)</label></div>
                                    <button className="cta-button" type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
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
                    <div className="trust-section">
                        <div className="trust-badge">SEBI Compliant*</div>
                        <div className="trust-badge">Follows RBI Guidelines*</div>
                    </div>
                    <div className="partner-section">
                        <span>Backed By</span>
                        <FidelityLogoIcon />
                    </div>
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

