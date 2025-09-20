import React, { useState } from "react";
import "./LandingPage.css";

function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showInvestmentDialog, setShowInvestmentDialog] = useState(false);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero fade-in">
        <img
          src="/assets/ipbi.png"
          alt="InvestmentPlus Hero"
          className="hero-img"
        />
        <h1 className="company-name">Welcome to InvestmentPlus</h1>
        <p className="tagline">
          Smart Investments & Casino Thrills – Grow Your Money Daily!
        </p>
        <div className="hero-buttons">
          <button onClick={() => setShowLogin(true)}>Login</button>
          <button onClick={() => setShowRegister(true)}>Register</button>
        </div>
      </section>

      {/* Smart Investments Section */}
      <section className="investments slide-up">
        <h2>Smart Investments</h2>
        <p>
          Start your journey with as little as ₹300 and earn daily profits from
          <b> 2% to 15%</b>.
        </p>
        <div
          className="investment-card bounce-hover"
          onClick={() => setShowInvestmentDialog(true)}
        >
          <img src="/assets/solar.png" alt="Solar Investment" />
          <p>Click to Know More</p>
        </div>
      </section>

      {/* Casino Section */}
      <section className="casino fade-in">
        <h2>Casino & Fun</h2>
        <div className="casino-content">
          <img src="/assets/casino1.jpg" alt="Casino Game" />
          <img src="/assets/casino2.jpg" alt="Casino Slots" />
          <img src="/assets/casino3.jpg" alt="Casino Chips" />
        </div>
        <p>
          Play responsibly and enjoy exciting games while growing your earnings.
        </p>
      </section>

      {/* Who We Are */}
      <section className="about slide-up">
        <h2>Who We Are?</h2>
        <p>
          InvestmentPlus is a trusted platform combining smart investments with
          entertainment. Our mission is to help people multiply their wealth
          through innovative financial opportunities and fun gaming experiences.
        </p>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2025 InvestmentPlus. All Rights Reserved.</p>
      </footer>

      {/* Investment Dialog */}
      {showInvestmentDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <img src="/assets/solar.png" alt="Solar Investment" />
            <h3>Start Investing with ₹300</h3>
            <p>Earn daily profit between 2% - 15% safely & securely.</p>
            <button
              onClick={() => {
                setShowInvestmentDialog(false);
                setShowRegister(true);
              }}
            >
              Start Investing
            </button>
            <button onClick={() => setShowInvestmentDialog(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Login</h2>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <div className="auth-buttons">
              <button>Login</button>
              <button onClick={() => setShowLogin(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Register</h2>
            <input type="text" placeholder="Full Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <input type="password" placeholder="Confirm Password" />
            <input type="text" placeholder="Referral Code (Optional)" />
            <label className="terms">
              <input type="checkbox" /> I accept the Terms & Conditions
            </label>
            <div className="auth-buttons">
              <button>Register</button>
              <button onClick={() => setShowRegister(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
