// src/components/FakeWithdrawalPopup.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import './FakeWithdrawalPopup.css';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://investmentpro-nu7s.onrender.com";
  }
  return "";
};
const API_BASE_URL = getApiBaseUrl();

// --- NEW: List of random Indian cities ---
const indianCities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad",
  "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
  "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
  "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
  "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad",
  "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah",
  "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur",
  "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh",
  "Kochi", "Mysuru", "Bhubaneswar", "Dehradun", "Thiruvananthapuram"
];

function FakeWithdrawalPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState(null);

  useEffect(() => {
    const generateFakeWithdrawal = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/fake-withdrawal`);
        const withdrawal = response.data?.withdrawal;

        if (withdrawal) {
          // --- MODIFICATION: Pick a random city and add it to the data ---
          const randomCity = indianCities[Math.floor(Math.random() * indianCities.length)];
          
          const withdrawalWithLocation = {
            ...withdrawal,
            location: randomCity, // Add the new location property
          };
          
          setWithdrawalData(withdrawalWithLocation);
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 5000); // Hide after 5 seconds
        }
      } catch (err) {
        console.error("Failed to generate fake withdrawal:", err);
      }
    };

    const initialTimeout = setTimeout(generateFakeWithdrawal, 5000); // First popup after 5s
    const interval = setInterval(generateFakeWithdrawal, 15000); // New popup every 15s

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

   // Use a conditional class for showing/hiding with animation
  const popupClassName = `fake-withdrawal-popup ${showPopup ? 'show' : ''}`;

  if (!withdrawalData) return null;

  return (
    <div className={popupClassName}>
      <p className="popup-title">💸 New Withdrawal!</p>
      <div className="popup-details">
        <p className="popup-name">{withdrawalData.name}</p>
        <p className="popup-amount">₹{withdrawalData.amount.toLocaleString()}</p>
      </div>
      {/* --- NEW: Display the random location --- */}
      <p className="popup-location">📍 from {withdrawalData.location}, India</p>
      <p className="popup-timestamp">{withdrawalData.timestamp}</p>
    </div>
  );
}

export default FakeWithdrawalPopup;
