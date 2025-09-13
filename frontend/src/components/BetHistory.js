import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BetHistory.css'; // We will create this file next

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
}).format(amount || 0);

function BetHistory({ onBack }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/api/bet-history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(response.data.history || []);
            } catch (err) {
                setError('Failed to load bet history.');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const renderContent = () => {
        if (loading) return <div className="loading-spinner">Loading history...</div>;
        if (error) return <p className="error-message">{error}</p>;
        if (history.length === 0) return <p className="no-transactions">No bet history found.</p>;
        
        return (
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>Bet On</th>
                        <th>Amount</th>
                        <th>Result</th>
                        <th>Payout</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(bet => (
                        <tr key={bet.id}>
                            <td>{bet.game_period}</td>
                            <td>{bet.bet_on}</td>
                            <td>{formatCurrency(bet.amount)}</td>
                            <td className={`status-${bet.status}`}>{bet.status}</td>
                            <td className="payout">{formatCurrency(bet.payout)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="history-view">
            <div className="header-bar">
                <button onClick={onBack} className="back-button">←</button>
                <h1>Bet History</h1>
            </div>
            <div className="history-list table-container">
                {renderContent()}
            </div>
        </div>
    );
}

export default BetHistory;
