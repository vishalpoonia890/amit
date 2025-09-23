import React from 'react';
import './DailyTasks.css';

// --- Import image assets ---
import referralImage from '../assets/103.png';
import investmentImage from '../assets/104.png';
import gamingImage from '../assets/101.png';
import winwinImage from '../assets/winwin.png';
import pushpaImage from '../assets/pushpa.png';

const imageMap = {
    'assets/103.png': referralImage,
    'assets/104.png': investmentImage,
    'assets/101.png': gamingImage,
    'assets/winwin.png': winwinImage,
    'assets/pushpa.png': pushpaImage,
};

const staticTasks = [
    {
        task_id: 1,
        title: 'Referral Bonus',
        description: 'Refer a friend and get a bonus when they sign up and make their first deposit.',
        image_asset: 'assets/103.png',
        reward_amount: 50,
        reward_description: 'Instant Bonus',
        status: 'unclaimed',
    },
    {
        task_id: 2,
        title: 'First Investment',
        description: 'Make your very first investment in any product plan and get a special reward.',
        image_asset: 'assets/104.png',
        reward_amount: 100,
        reward_description: 'Investment Credit',
        status: 'completed',
    },
    {
        task_id: 3,
        title: 'New Game Launch',
        description: 'Be one of the first 100 players to play our new game to get an exclusive bonus.',
        image_asset: 'assets/101.png',
        reward_amount: 75,
        reward_description: 'Gaming Credit',
        status: 'claimed',
    },
    {
        task_id: 4,
        title: 'Exclusive Access',
        description: 'Get exclusive access to our newest games and private investment opportunities.',
        image_asset: 'assets/winwin.png',
        reward_amount: 0,
        reward_description: 'VIP Status',
        status: 'completed',
    },
    {
        task_id: 5,
        title: 'Pushpa Raj Special',
        description: 'Play the Pushpa Raj game for a chance to win a massive jackpot.',
        image_asset: 'assets/pushpa.png',
        reward_amount: 0,
        reward_description: 'Jackpot Entry',
        status: 'unclaimed',
    },
];

// --- Helper Component for offers ---
const OfferCard = ({ offer }) => {
    return (
        <div className="task-card">
            <img src={imageMap[offer.image_asset]} alt={offer.title} className="task-image" />
            <div className="task-content">
                <h3 className="task-title">{offer.title}</h3>
                <p className="task-description">{offer.description}</p>
                <div className="reward-info">
                    Reward:
                    <strong>
                        {offer.reward_amount > 0 ? ` ₹${offer.reward_amount.toLocaleString()}` : ''}
                        {offer.reward_amount > 0 && offer.reward_description ? ' + ' : ''}
                        {offer.reward_description || ''}
                    </strong>
                </div>
                <button className="claim-button" disabled>
                    View Offer
                </button>
            </div>
        </div>
    );
};

// --- Main Component ---
function DailyTasks({ onBack }) {
    return (
        <div className="daily-tasks-page">
            <div className="tasks-header">
                <button className="back-button" onClick={onBack}>← Back</button>
                <h1>Current Offers</h1>
                <p>Check out our latest offers and exciting rewards!</p>
            </div>
            
            <div className="task-category-section">
                <h2 className="category-title">Special Rewards</h2>
                <div className="tasks-grid">
                    {staticTasks.map(task => (
                        <OfferCard key={task.task_id} offer={task} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DailyTasks;
