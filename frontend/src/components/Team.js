


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Team.css';
const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

function Team({ token, onBack }) {
    const [teamData, setTeamData] = useState({
        referralLink: '',
        activeUsers: 0,
        newUsers: 0,
        totalRewards: 0,
        referredUsers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/referral-details`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // NOTE: The backend currently sends back placeholder/calculated data.
                // We'll use sample data for now to match the screenshot's design.
                setTeamData({
                    referralLink: response.data.referralLink || 'Generating link...',
                    activeUsers: response.data.activeReferrals?.length || 0,
                    newUsers: response.data.referredUsers?.length || 0,
                    totalRewards: response.data.totalRewards || 0, // Assuming backend provides this
                    referredUsers: response.data.referredUsers || []
                });
            } catch (error) {
                console.error("Failed to fetch team data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeamData();
    }, [token]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(teamData.referralLink).then(() => {
            alert('Invite Link Copied!');
        });
    };

    if (loading) {
        return <div className="loading-spinner">Loading Team Data...</div>;
    }

    return (
        <div className="team-page">
            <button className="back-button" onClick={onBack}>← Back</button>
            <h2 className="page-title">IP Team Network</h2>

            <div className="team-card">
                <h4>➕ Grow Your IP Team</h4>
                <div className="referral-link-box">
                    <input type="text" value={teamData.referralLink} readOnly />
                </div>
                <button className="action-button" onClick={copyToClipboard}>📋 Copy Invite Link</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-value">{teamData.activeUsers}</span>
                    <span className="stat-label">Active Foxes</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{teamData.newUsers}</span>
                    <span className="stat-label">New Foxes</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">₹{teamData.totalRewards.toLocaleString()}</span>
                    <span className="stat-label">Total Rewards</span>
                </div>
            </div>

            <div className="team-card">
                 <button className="action-button full-width">💰 Collect Team Rewards</button>
            </div>
            
            <div className="team-card referred-users-table">
                <h4>Referred Users</h4>
                 <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Sr No.</th>
                                <th>Name</th>
                                <th>Total Bonus Earned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamData.referredUsers.length > 0 ? (
                                teamData.referredUsers.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td>{user.name}</td>
                                        <td>₹{user.bonusEarned || '0.00'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">You haven't referred any users yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Team;


