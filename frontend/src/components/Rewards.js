import React from 'react';
import './FormPages.css';

const dailyTasks = [
    { id: 1, title: "Daily Login", reward: "₹5", completed: true },
    { id: 2, title: "Make 1 Investment", reward: "₹25", completed: false },
    { id: 3, title: "Invite 1 New User", reward: "₹50", completed: false },
];

function Rewards({ onBack }) {
    return (
        <div className="form-page-container">
            <div className="form-page-header">
                <button onClick={onBack} className="back-button">←</button>
                <h1>Daily Rewards</h1>
            </div>
            
            <div className="rewards-list">
                {dailyTasks.map(task => (
                    <div className="reward-card" key={task.id}>
                        <div className="reward-info">
                            <h4>{task.title}</h4>
                            <p>Reward: <span className="reward-amount">{task.reward}</span></p>
                        </div>
                        <button className="reward-button" disabled={task.completed}>
                            {task.completed ? 'Claimed' : 'Claim'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Rewards;
