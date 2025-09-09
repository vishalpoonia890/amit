// src/components/LiveWithdrawalMarquee.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the Render backend URL
    return 'https://investmentpro-nu7s.onrender.com';
  } else {
    // In development, use the proxy
    return '';
  }
};
const API_BASE_URL = getApiBaseUrl();
const indianCities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"];

function LiveWithdrawalMarquee() {
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    const fetchAndSetWithdrawals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/fake-withdrawal`);
        const withdrawal = response.data?.withdrawal;
        if (withdrawal) {
          const randomCity = indianCities[Math.floor(Math.random() * indianCities.length)];
          const newEntry = `💸 ${withdrawal.name} from ${randomCity} just withdrew ₹${withdrawal.amount.toLocaleString()}`;
          setWithdrawals(prev => [newEntry, ...prev.slice(0, 19)]); // Keep a list of 20
        }
      } catch (err) {
        console.error("Failed to generate fake withdrawal:", err);
      }
    };

    const initialTimeout = setTimeout(fetchAndSetWithdrawals, 2000);
    const interval = setInterval(fetchAndSetWithdrawals, 8000); // Fetch a new one every 8 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (withdrawals.length === 0) return null;

  // Duplicate the array for a seamless loop
  const duplicatedWithdrawals = [...withdrawals, ...withdrawals];

  return (
    <div className="live-withdrawal-container">
      <h3>Live Withdrawals</h3>
      <div className="scroller-wrapper">
        <div className="scroller">
          {duplicatedWithdrawals.map((text, index) => (
            <div key={index} className="withdrawal-item">
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LiveWithdrawalMarquee;
