import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BetHistory.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

function BetHistory({ token, onBack }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/user/bet-history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (error) {
                console.error("Failed to fetch bet history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [token]);

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR" }).format(amount || 0);

    return (
        <div className="bet-history-container">
            <div className="page-header">
                <button onClick={onBack} className="back-button">←</button>
                <h1>Bet History</h1>
            </div>
            {loading ? <p>Loading history...</p> : (
                <div className="history-list">
                    {history.length > 0 ? history.map(bet => (
                        <div key={bet.id} className={`bet-item ${bet.status === 'win' ? 'bet-item-win' : 'bet-item-lose'}`}>
                            <div className="bet-info">
                                <span>Period:</span> <strong>{bet.period_number}</strong><br/>
                                <span>Bet on:</span> <strong className="bet-on-value">{bet.bet_on}</strong>
                            </div>
                            <div className={`bet-outcome ${bet.status === 'win' ? 'outcome-win' : 'outcome-lose'}`}>
                                {bet.status === 'win' ? `+${formatCurrency(bet.winnings)}` : `-${formatCurrency(bet.bet_amount)}`}
                            </div>
                        </div>
                    )) : <p className="no-history">No bets placed yet.</p>}
                </div>
            )}
        </div>
    );
}

export default BetHistory;


