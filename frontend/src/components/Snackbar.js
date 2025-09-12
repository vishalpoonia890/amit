import React, { useEffect } from 'react';
import './Snackbar.css';

// The component is now named 'Snackbar' to avoid conflicts.
function Snackbar({ userNotifications, promotions, onClose, onMarkAsRead, onDeleteRead }) {
    const [activeTab, setActiveTab] = useState('notifications');

    const handleMarkAllRead = () => {
        const unreadIds = userNotifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length > 0) {
            onMarkAsRead(unreadIds);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'deposit': return '💰';
            case 'withdrawal': return '💸';
            case 'bonus': return '🎁';
            case 'status_change': return '⚠️';
            case 'welcome': return '👋';
            default: return '🔔';
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
                                            {getIconForType(notif.type)}
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
export default Snackbar;
