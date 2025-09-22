import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './DailyTasks.css'; // Assuming you have a CSS file for styling

// --- Import image assets ---
import referralImage from '../assets/103.png';
import investmentImage from '../assets/104.png';
import gamingImage from '../assets/101.png';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

const imageMap = {
    'assets/103.png': referralImage,
    'assets/104.png': investmentImage,
    'assets/101.png': gamingImage,
};

// --- Helper Components ---
const TaskCard = ({ task, onClaim, isLoading }) => {
    const progress = Math.min((task.current_progress / task.target_value) * 100, 100);
    const isCompleted = task.status === 'completed';

    return (
        <div className={`task-card ${isCompleted ? 'completed' : ''}`}>
            {task.image_asset && <img src={imageMap[task.image_asset]} alt={task.title} className="task-image" />}
            <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="progress-text">
                    {`${Math.floor(task.current_progress)} / ${task.target_value}`}
                </div>
                <div className="reward-info">
                    Reward: 
                    <strong>
                        {task.reward_amount > 0 ? ` ₹${task.reward_amount.toLocaleString()}` : ''}
                        {task.reward_amount > 0 && task.reward_description ? ' + ' : ''}
                        {task.reward_description || ''}
                    </strong>
                </div>
                <button 
                    className="claim-button" 
                    onClick={() => onClaim(task.task_id)} 
                    disabled={!isCompleted || isLoading}
                >
                    {isLoading ? 'Claiming...' : (task.status === 'claimed' ? 'Claimed' : (isCompleted ? 'Claim Reward' : 'In Progress'))}
                </button>
            </div>
        </div>
    );
};

// --- Main Component ---
function DailyTasks({ token, userData, onBack }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [claimingId, setClaimingId] = useState(null);

    const fetchTasks = useCallback(async () => {
        if (!userData) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
            setError('Could not load tasks. Please try again later.');
            setLoading(false);
        }
    }, [token, userData]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleClaim = async (taskId) => {
        setClaimingId(taskId);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/tasks/claim`, 
                { taskId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data.message); // Or use a snackbar
            fetchTasks(); // Refresh tasks to show the new state
        } catch (err) {
            console.error("Failed to claim task:", err);
            alert(err.response?.data?.error || 'Failed to claim reward.');
        } finally {
            setClaimingId(null);
        }
    };

    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();
        if (!suggestion.trim()) {
            alert("Please enter a suggestion.");
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/api/suggestions`, 
                { suggestion_text: suggestion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Thank you! Your suggestion has been submitted.");
            setSuggestion('');
        } catch (err) {
            console.error("Failed to submit suggestion:", err);
            alert("Could not submit your suggestion at this time.");
        }
    };

    const groupedTasks = tasks.reduce((acc, task) => {
        acc[task.category] = acc[task.category] || [];
        acc[task.category].push(task);
        return acc;
    }, {});

    const renderContent = () => {
        if (loading) return <div className="loading-spinner">Loading Tasks...</div>;
        if (error) return <p className="error-message">{error}</p>;
        
        return Object.entries(groupedTasks).map(([category, tasksInCategory]) => (
            <div key={category} className="task-category-section">
                <h2 className="category-title">{category} Goals</h2>
                <div className="tasks-grid">
                    {tasksInCategory.map(task => (
                        <TaskCard 
                            key={task.task_id} 
                            task={task} 
                            onClaim={handleClaim}
                            isLoading={claimingId === task.task_id}
                        />
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <div className="daily-tasks-page">
            <div className="tasks-header">
                <button className="back-button" onClick={onBack}>← Back</button>
                <h1>Your Mission Hub</h1>
                <p>Unlock achievements, complete tasks, and earn massive rewards!</p>
            </div>
            
            {renderContent()}

            <div className="suggestion-box-section">
                <h2 className="category-title">Suggest a New Game</h2>
                <p>Have an idea for a fun new game? Let us know! If we build it, you'll get a special bonus.</p>
                <form onSubmit={handleSuggestionSubmit} className="suggestion-form">
                    <textarea
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder="Describe your game idea here..."
                        rows="4"
                    />
                    <button type="submit">Submit Idea</button>
                </form>
            </div>
        </div>
    );
}

export default DailyTasks;

