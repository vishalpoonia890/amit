// src/components/ContactUs.js
import React from 'react';

function ContactUs() {
  // In a real app, these would link to actual URLs
  const handleContactClick = () => {
    alert("Contact support at support@investpro.com");
  };

  const handleTelegramClick = () => {
    alert("Joining our Telegram channel...");
    // window.open('https://t.me/yourchannel', '_blank');
  };

  return (
    <div style={{ padding: "24px 16px", textAlign: 'center' }}>
      <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Need Help?
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <button className="secondary-button" onClick={handleContactClick}>
          📞 Contact Us
        </button>
        <button className="secondary-button" onClick={handleTelegramClick}>
          ✈️ Telegram
        </button>
      </div>
    </div>
  );
}

export default ContactUs;
