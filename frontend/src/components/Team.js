import React, { useState, useEffect } from 'react';
import './FormPages.css';

// Mock team data
const mockTeam = [
    { id: 101, name: 'Rohan Sharma', level: 1, joinDate: '2025-09-08' },
    { id: 102, name: 'Priya Verma', level: 1, joinDate: '2025-09-05' },
    { id: 103, name: 'Anjali Mehta', level: 2, joinDate: '2025-09-02' },
    { id: 104, name: 'Suresh Kumar', level: 2, joinDate: '2025-08-28' },
    { id: 105, name: 'Deepak Singh', level: 3, joinDate: '2025-08-15' },
];

function Team({ onBack, token }) {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, you would fetch this data
        // For now, we use mock data after a short delay
        setTimeout(() => {
            setTeam(mockTeam);
            setLoading(false);
        }, 500);
    }, [token]);

    return (
        <div className="form-page-container">
            <div className="form-page-header">
                <button onClick={onBack} className="back-button">←</button>
                <h1>My Team</h1>
            </div>
            
            {loading ? <p>Loading team members...</p> : (
                <div className="team-list">
                    {team.map(member => (
                        <div className="team-member-card" key={member.id}>
                            <div className="member-info">
                                <span className="member-name">{member.name}</span>
                                <span className="member-date">Joined: {member.joinDate}</span>
                            </div>
                            <div className={`member-level level-${member.level}`}>
                                Level {member.level}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Team;
