import React, { useState } from "react";
import "./LandingPage.css";

function LandingPage() {
  // 🔹 State management
  const [showPromo, setShowPromo] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div id="webcrumbs" className="casino-theme">
      {/* ----------------------------
          🎰 Landing Header
      ---------------------------- */}
      <header className="landing-header">
        <h1 className="animate-fade">🎲 Welcome to CasinoX</h1>
        <p className="animate-slide">
          Play, Invest & Win Big – Your Gateway to Guaranteed Thrills!
        </p>
        <div className="landing-buttons animate-bounce">
          <button onClick={() => setShowPromo(true)} className="btn-primary">
            View Promo
          </button>
          <button onClick={() => setShowLogin(true)} className="btn-secondary">
            Login
          </button>
          <button onClick={() => setShowRegister(true)} className="btn-secondary">
            Register
          </button>
        </div>
      </header>

      {/* ----------------------------
          🃏 Casino Hero Section
      ---------------------------- */}
      <section className="hero-section">
        <div className="hero-text animate-fade">
          <h2>Spin, Bet & Invest</h2>
          <p>
            Experience the ultimate casino platform with investment
            opportunities. Trusted by thousands of users worldwide.
          </p>
        </div>
        <div className="hero-image animate-zoom">
          <img
            src="https://images.unsplash.com/photo-1544986581-efac024faf62"
            alt="Casino"
          />
        </div>
      </section>

      {/* ----------------------------
          🪙 Features
      ---------------------------- */}
      <section className="features">
        <div className="feature-card animate-hover">
          <img
            src="https://images.unsplash.com/photo-1604014237744-3b2b1a7e3f74"
            alt="Investment"
          />
          <h3>Smart Investments</h3>
          <p>Grow your money with low-risk casino investment plans.</p>
        </div>
        <div className="feature-card animate-hover">
          <img
            src="https://images.unsplash.com/photo-1582142838965-1e51c8da9a71"
            alt="Jackpot"
          />
          <h3>Daily Jackpots</h3>
          <p>Spin the wheel and claim exciting prizes every day.</p>
        </div>
        <div className="feature-card animate-hover">
          <img
            src="https://images.unsplash.com/photo-1542089363-6aa45e78f02b"
            alt="Secure"
          />
          <h3>Secure Payments</h3>
          <p>Fast UPI, card, and crypto transactions with encryption.</p>
        </div>
      </section>

      {/* ----------------------------
          ❓ FAQ Section
      ---------------------------- */}
      <section className="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h3>How do I start?</h3>
          <p>Register, deposit funds, and start playing your favorite games.</p>
        </div>
        <div className="faq-item">
          <h3>Is my money safe?</h3>
          <p>
            Absolutely! We use blockchain tech and trusted payment partners.
          </p>
        </div>
        <div className="faq-item">
          <h3>Can I withdraw anytime?</h3>
          <p>Yes, withdrawals are instant 24/7.</p>
        </div>
      </section>

      {/* ----------------------------
          🔥 Promo Modal
      ---------------------------- */}
      {showPromo && (
        <div className="modal-overlay" onClick={() => setShowPromo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🔥 Special Promo!</h2>
            <p>Deposit ₹500 and get ₹200 FREE instantly!</p>
            <button onClick={() => setShowPromo(false)} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------
          🔑 Login Modal
      ---------------------------- */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Login</h2>
            <form>
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit" className="btn-primary">
                Login
              </button>
            </form>
            <button onClick={() => setShowLogin(false)} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------
          📝 Register Modal
      ---------------------------- */}
      {showRegister && (
        <div className="modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Register</h2>
            <form>
              <input type="text" placeholder="Full Name" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <input type="password" placeholder="Confirm Password" required />
              <input type="text" placeholder="Referral Code (Optional)" />
              <button type="submit" className="btn-primary">
                Register
              </button>
            </form>
            <button
              onClick={() => setShowRegister(false)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
