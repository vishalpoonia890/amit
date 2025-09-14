import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Team.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

function Team({ token, onBack }) {
    const [teamData, setTeamData] = useState({
        referralLink: '',
        totalRewards: 0,
        level1: { count: 0, users: [] },
        level2: { count: 0, users: [] }
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
                setTeamData(response.data);
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
            <h2 className="page-title">My Referral Network</h2>

            <div className="team-card">
                <h4>➕ Grow Your Team</h4>
                <div className="referral-link-box">
                    <input type="text" value={teamData.referralLink} readOnly />
                </div>
                <button className="action-button" onClick={copyToClipboard}>📋 Copy Invite Link</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-value">{teamData.level1.count}</span>
                    <span className="stat-label">Level 1 Users</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{teamData.level2.count}</span>
                    <span className="stat-label">Level 2 Users</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">₹{teamData.totalRewards.toLocaleString()}</span>
                    <span className="stat-label">Total Rewards</span>
                </div>
            </div>

            <div className="team-card info-box">
                <h4>Referral Bonus Structure</h4>
                <ul>
                    <li><span>Level 1:</span> Invite a user, and when they deposit, you receive a <strong>5%</strong> commission.</li>
                    <li><span>Level 2:</span> When your invited user invites someone, you get a <strong>1%</strong> commission on their deposit.</li>
                    <li><span>Ongoing Rewards:</span> You may also earn smaller commissions on subsequent deposits in your referral chain.</li>
                </ul>
            </div>

            <div className="team-card referred-users-table">
                <h4>Level 1 Referrals ({teamData.level1.count})</h4>
                <div className="table-container">
                    <table>
                        <thead><tr><th>#</th><th>Name</th></tr></thead>
                        <tbody>
                            {teamData.level1.users.length > 0 ? (
                                teamData.level1.users.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td>{user.name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="2">You haven't referred any users yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

             <div className="team-card referred-users-table">
                <h4>Level 2 Referrals ({teamData.level2.count})</h4>
                <div className="table-container">
                    <table>
                        <thead><tr><th>#</th><th>Name</th></tr></thead>
                        <tbody>
                            {teamData.level2.users.length > 0 ? (
                                teamData.level2.users.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td>{user.name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="2">No users found at this level.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Team;

