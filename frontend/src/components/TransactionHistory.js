import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionHistory.css';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

function TransactionHistory({ onBack }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication error. Please log in again.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/api/transactions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTransactions(response.data.transactions || []);
            } catch (err) {
                setError('Failed to load transaction history.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);

    const renderContent = () => {
        if (loading) {
            return <div className="loading-spinner">Loading transactions...</div>;
        }
        if (error) {
            return <p className="error-message">{error}</p>;
        }
        if (transactions.length === 0) {
            return <p className="no-transactions">No transactions found.</p>;
        }
        return transactions.map(tx => (
            <div key={tx.id} className="transaction-item">
                <div className={`status-indicator ${tx.status.toLowerCase()}`}></div>
                <div className="transaction-details">
                    <div className="details-row">
                        <span className="transaction-type">{tx.type}</span>
                        <span className={`transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(tx.amount)}
                        </span>
                    </div>
                    <div className="details-row">
                         <span className="transaction-date">{new Date(tx.date).toLocaleString()}</span>
                         <span className="transaction-status">{tx.status}</span>
                    </div>
                    {tx.description && (
                        <div className="details-row full-width">
                            <span className="transaction-description">{tx.description}</span>
                        </div>
                    )}
                </div>
            </div>
        ));
    };

    return (
        <div className="transaction-history-view">
            <div className="header-bar">
                <button onClick={onBack} className="back-button">‹</button>
                <h1>Transaction History</h1>
            </div>
            <div className="transaction-list">
                {renderContent()}
            </div>
        </div>
    );
}

export default TransactionHistory;

