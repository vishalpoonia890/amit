import React, { useState } from 'react';
import './NotificationsDialog.css';

// --- Helper: Icon Component (can be shared across components) ---
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);


function NotificationsDialog({ userNotifications, promotions, onClose, onMarkAsRead, onDeleteRead }) {
    const [activeTab, setActiveTab] = useState('notifications');

    const handleMarkAllRead = () => {
        const unreadIds = userNotifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length > 0) {
            onMarkAsRead(unreadIds);
        }
    };

    return (
        <div className="notification-dialog-overlay" onClick={onClose}>
            <div className="notification-dialog-content" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-header">
                    <h2>Notifications</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                <div className="dialog-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        Personal
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'promotions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('promotions')}
                    >
                        Promotions
                    </button>
                </div>

                <div className="dialog-body">
                    {activeTab === 'notifications' ? (
                        <>
                            {userNotifications.length > 0 ? (
                                userNotifications.map(notif => (
                                    <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`}>
                                        <div className="notification-icon">
                                            {notif.type === 'deposit' && '💰'}
                                            {notif.type === 'withdrawal' && '💸'}
                                            {notif.type === 'bonus' && '🎁'}
                                            {notif.type === 'status_change' && '⚠️'}
                                            {notif.type !== 'deposit' && notif.type !== 'withdrawal' && notif.type !== 'bonus' && notif.type !== 'status_change' && '🔔'}
                                        </div>
                                        <div className="notification-text">
                                            <p>{notif.message}</p>
                                            <span className="timestamp">{new Date(notif.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">You have no personal notifications.</p>
                            )}
                        </>
                    ) : (
                        <>
                            {promotions.length > 0 ? (
                                promotions.map(promo => (
                                     <div key={promo.id} className="promotion-item">
                                         <h4>{promo.title}</h4>
                                         <p>{promo.message}</p>
                                         <span className="timestamp">{new Date(promo.created_at).toLocaleString()}</span>
                                     </div>
                                ))
                            ) : (
                                <p className="empty-state">There are no promotions right now.</p>
                            )}
                        </>
                    )}
                </div>

                {activeTab === 'notifications' && userNotifications.length > 0 && (
                     <div className="dialog-footer">
                        <button onClick={handleMarkAllRead} className="footer-button">Mark All as Read</button>
                        <button onClick={onDeleteRead} className="footer-button delete">Delete Read</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationsDialog;

