import React from 'react';
import './FormPages.css';

function Support({ onClose }) {
    return (
        <div className="support-overlay">
            <div className="support-box">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Customer Support</h2>
                <div className="support-details">
                    <p>For any assistance, please contact us through the following channels:</p>
                    <ul>
                        <li><strong>Email:</strong> support@investmentplus.com</li>
                        <li><strong>Telegram:</strong> @InvestmentPlusSupport</li>
                        <li><strong>WhatsApp:</strong> +91 12345 67890</li>
                    </ul>
                    <p className="support-hours">Our support team is available from 9 AM to 7 PM IST.</p>
                </div>
            </div>
        </div>
    );
}

export default Support;
