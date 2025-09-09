// src/components/EditProfileModal.js
import React, { useState } from 'react';
import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://investmentpro-nu7s.onrender.com';
  }
  return '';
};
const API_BASE_URL = getApiBaseUrl();

function EditProfileModal({ token, userData, onUserDataUpdate, onClose }) {
  const [formData, setFormData] = useState({
    name: userData.name || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Only include fields that have a value
    const updateData = {};
    if (formData.name && formData.name !== userData.name) {
      updateData.name = formData.name;
    }
    if (formData.password) {
      updateData.password = formData.password;
    }

    if (Object.keys(updateData).length === 0) {
      setError("No changes to save.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user/update-profile`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Profile updated successfully!');
      onUserDataUpdate(response.data.user); // Update the user data in App.js
      setTimeout(() => {
        onClose(); // Close the modal after a short delay
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">New Password (optional)</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Leave blank to keep current"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
