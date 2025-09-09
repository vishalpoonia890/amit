// src/components/ReferralView.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getApiBaseUrl = () => { /* ... same as before ... */ };
const API_BASE_URL = getApiBaseUrl();

function ReferralView({ token }) {
  const [referralLink, setReferralLink] = useState('');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const fetchReferralLink = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/referral-link`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const link = response.data.referralLink;
        setReferralLink(link);
        // Extract the code from the end of the link
        const code = link.split('/').pop();
        setReferralCode(code);
      } catch (err) {
        console.error("Failed to fetch referral link:", err);
      }
    };
    fetchReferralLink();
  }, [token]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a notification here
    alert("Copied to clipboard!");
  };

  return (
    <div className="referral-page">
      <div className="referral-header">
        <h1>Refer & Earn</h1>
        <p>Invite your friends and earn commissions from their investments.</p>
      </div>
      <div className="referral-card">
        <h3>Your Referral Code</h3>
        <div className="code-box">
          <span>{referralCode || 'Loading...'}</span>
          <button onClick={() => copyToClipboard(referralCode)}>Copy</button>
        </div>
      </div>
      <div className="referral-card">
        <h3>Your Referral Link</h3>
        <div className="link-box">
          <input type="text" value={referralLink || 'Loading...'} readOnly />
          <button onClick={() => copyToClipboard(referralLink)}>Copy</button>
        </div>
      </div>
    </div>
  );
}

export default ReferralView;
