import React, { useState, useEffect } from 'react';
import './DailyTasks.css';

// --- Import image assets ---
import iphone17ProImage from '../assets/103.png';
import iphone17ProMaxImage from '../assets/104.png';
import iphone17Image from '../assets/101.png';

// --- Helper component for the progress bar ---
const ProgressBar = ({ current, target }) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
        <div className="progress-bar-container">
            <div 
                className="progress-bar-fill" 
                style={{ width: `${percentage}%` }}
            />
            <span className="progress-bar-text">{`${Math.floor(current).toLocaleString()} / ${target.toLocaleString()}`}</span>
        </div>
    );
};

// --- Main DailyTasks Component ---
function DailyTasks({ onBack }) {
    // In a real app, this data would come from an API
    const [taskProgress, setTaskProgress] = useState({
        totalDeposits: 7500,
        successfulReferrals: 12,
        ordersPlaced: 6,
        orderValue: 62000,
        betsPlaced: 120,
        betValue: 1500,
    });
    const [suggestion, setSuggestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Task Definitions ---
    // This structure makes it easy to manage tasks and their tiers
    const taskTiers = {
        deposit: [
            { target: 10000, reward: "₹1,000 Bonus" },
            { target: 50000, reward: "₹10,000 Bonus" },
            { target: 100000, reward: "₹20,000 Bonus" },
        ],
        referral: [
            { target: 10, reward: "₹500 Bonus" },
            { target: 20, reward: "₹2,000 Bonus" },
            { target: 50, reward: "₹10,000 Bonus" },
            { target: 100, reward: "₹20,000 Bonus" },
            { target: 500, reward: "iPhone 17 Pro + AppleCare", image: iphone17ProImage },
        ],
        orders: [
            { target: 5, reward: "₹1,000 Bonus" },
            { target: 10, reward: "₹10,000 Bonus", condition: "Order value > ₹50,000" },
            { target: 20, reward: "iPhone 17 Pro Max", image: iphone17ProMaxImage, condition: "Order value > ₹5,00,000" },
        ],
        gaming: [
            { target: 10, reward: "₹20 Bonus", condition: "Bet value > ₹100" },
            { target: 100, reward: "₹200 Bonus", condition: "Bet value > ₹1,000" },
            { target: 1000, reward: "₹2,000 + Chance to win iPhone 17", image: iphone17Image, condition: "Bet value > ₹10,000" },
        ],
    };

    const getActiveTask = (category, progress) => {
        const tiers = taskTiers[category];
        for (const task of tiers) {
            if (progress < task.target) {
                return task;
            }
        }
        return { ...tiers[tiers.length - 1], completed: true }; // All tasks in this category are done
    };

    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();
        if (!suggestion.trim() || isSubmitting) return;

        setIsSubmitting(true);
        // In a real app, you would send this to your Supabase backend
        console.log("Submitting suggestion to Supabase:", suggestion);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        alert("Thank you! Your suggestion has been submitted.");
        setSuggestion('');
        setIsSubmitting(false);
    };

    const renderTaskCard = (category, progress, title, icon) => {
        const activeTask = getActiveTask(category, progress);
        const isCompleted = progress >= activeTask.target || activeTask.completed;

        return (
            <div className="task-card">
                <div className="task-card-header">
                    <span className="task-icon">{icon}</span>
                    <h3>{title}</h3>
                </div>
                {activeTask.image && <img src={activeTask.image} alt={activeTask.reward} className="task-image" />}
                <div className="task-card-body">
                    <p className="task-reward">
                        <span>Reward:</span> {activeTask.reward}
                    </p>
                    <p className="task-description">
                        Target: {activeTask.target.toLocaleString()} 
                        {category === 'referral' && ' successful referrals'}
                        {category === 'orders' && ' orders placed'}
                        {category === 'gaming' && ' bets placed'}
                        {category === 'deposit' && ' total deposit'}
                    </p>
                    {activeTask.condition && <p className="task-condition">{activeTask.condition}</p>}

                    {!activeTask.completed ? (
                        <>
                            <ProgressBar current={progress} target={activeTask.target} />
                            <button className="claim-btn" disabled={!isCompleted}>
                                {isCompleted ? 'Claim Reward' : 'In Progress'}
                            </button>
                        </>
                    ) : (
                         <button className="claim-btn completed-btn" disabled>All Tasks Completed</button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="tasks-page">
            <div className="tasks-header">
                <h1>The Winner's Circle</h1>
                <p>Complete Your Quests, Claim Your Crowns! Every Task You Conquer Unlocks a Richer Reward.</p>
            </div>

            <div className="tasks-grid">
                {renderTaskCard('deposit', taskProgress.totalDeposits, 'Deposit Challenge', '💰')}
                {renderTaskCard('referral', taskProgress.successfulReferrals, 'Referral Royalty', '👑')}
                {renderTaskCard('orders', taskProgress.ordersPlaced, 'Investment Streak', '📈')}
                {renderTaskCard('gaming', taskProgress.betsPlaced, 'Gaming Gladiator', '🎲')}
            </div>
            
            <div className="suggestion-box">
                <h3>Want a New Game? Suggest It!</h3>
                <p>Tell us what games you want to see on MoneyPlus. Your ideas could become our next big hit!</p>
                <form onSubmit={handleSuggestionSubmit}>
                    <textarea 
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder="Describe the game you'd love to play..."
                        rows="4"
                        required
                    />
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Send Suggestion'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DailyTasks;
