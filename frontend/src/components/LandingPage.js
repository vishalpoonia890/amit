import React, { useState } from "react";
import "./LandingPage.css"; // rename your style.css -> LandingPage.css

function LandingPage() {
  // ----------------------------
  // 🔹 States for Modals
  // ----------------------------
  const [showPromo, setShowPromo] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // ----------------------------
  // 🔹 Toggle Handlers
  // ----------------------------
  const togglePromo = () => setShowPromo(!showPromo);
  const toggleLogin = () => setShowLogin(!showLogin);
  const toggleRegister = () => setShowRegister(!showRegister);

  return (
    <div id="webcrumbs">
      {/* ----------------------------
          🔹 Landing Page Header
      ---------------------------- */}
      <header className="landing-header">
        <h1>Welcome to Our Casino + Investment Platform 🎉</h1>
        <p>Guaranteed fun, rewards, and secure transactions!</p>
        <div className="landing-buttons">
          <button onClick={togglePromo} className="btn-primary">
            View Promo
          </button>
          <button onClick={toggleLogin} className="btn-secondary">
            Login
          </button>
          <button onClick={toggleRegister} className="btn-secondary">
            Register
          </button>
        </div>
      </header>

      {/* ----------------------------
          🔹 New HTML Landing Section
      ---------------------------- */}
      <section className="landing-section">
        <div className="hero">
          <h2>Play. Invest. Win.</h2>
          <p>
            Join thousands of users already enjoying our secure gaming and
            investment ecosystem.
          </p>
        </div>
        <div className="features">
          <div className="feature-card">
            <i className="fa-solid fa-coins"></i>
            <h3>Instant Deposits</h3>
            <p>Seamless UPI & crypto payment support.</p>
          </div>
          <div className="feature-card">
            <i className="fa-solid fa-trophy"></i>
            <h3>Guaranteed Wins</h3>
            <p>Daily rewards and bonus promotions.</p>
          </div>
          <div className="feature-card">
            <i className="fa-solid fa-lock"></i>
            <h3>Secure & Transparent</h3>
            <p>We use top encryption and blockchain tech.</p>
          </div>
        </div>
      </section>

      {/* ----------------------------
          🔹 FAQ Section
      ---------------------------- */}
      <section className="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h3>How do I start?</h3>
          <p>Simply register, deposit funds, and start playing or investing.</p>
        </div>
        <div className="faq-item">
          <h3>Is my money safe?</h3>
          <p>
            Yes, we use secure UPI gateways and blockchain transparency for
            payouts.
          </p>
        </div>
        <div className="faq-item">
          <h3>Can I withdraw anytime?</h3>
          <p>Yes, withdrawals are instant and hassle-free.</p>
        </div>
      </section>

      {/* ----------------------------
          🔹 Promo Modal
      ---------------------------- */}
      {showPromo && (
        <div className="modal-overlay" onClick={togglePromo}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🔥 Special Promo!</h2>
            <p>Deposit ₹500 and get ₹200 free instantly!</p>
            <button onClick={togglePromo} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------
          🔹 Login Modal
      ---------------------------- */}
      {showLogin && (
        <div className="modal-overlay" onClick={toggleLogin}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Login</h2>
            <form>
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit" className="btn-primary">
                Login
              </button>
            </form>
            <button onClick={toggleLogin} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------
          🔹 Register Modal
      ---------------------------- */}
      {showRegister && (
        <div className="modal-overlay" onClick={toggleRegister}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Register</h2>
            <form>
              <input type="text" placeholder="Full Name" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit" className="btn-primary">
                Register
              </button>
            </form>
            <button onClick={toggleRegister} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
