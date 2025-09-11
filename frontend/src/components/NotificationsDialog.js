import React from 'react';
import './NotificationsDialog.css'; // Create this CSS file

function NotificationsDialog({ notifications, onClose, onNotificationClick, onReadAll }) {
    return (
        <div className="notifications-dialog-overlay" onClick={onClose}>
            <div className="notifications-dialog-content" onClick={e => e.stopPropagation()}> {/* Prevent clicks inside from closing */}
                <div className="dialog-header">
                    <h3>Notifications</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="notifications-list">
                    {notifications.length === 0 ? (
                        <p className="no-notifications">No new notifications.</p>
                    ) : (
                        notifications.map(notification => (
                            <div 
                                key={notification.id} 
                                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                onClick={() => onNotificationClick(notification.id)}
                            >
                                <span className="notification-icon">
                                    {notification.type === 'deposit' && '💰'}
                                    {notification.type === 'deposit_approved' && '✅'}
                                    {notification.type === 'withdrawal' && '💸'}
                                    {notification.type === 'withdrawal_approved' && '✔️'}
                                    {notification.type === 'purchase' && '🛍️'}
                                    {notification.type === 'bonus' && '🎁'}
                                    {notification.type === 'income' && '📈'}
                                    {/* Add more icons for different types */}
                                </span>
                                <div className="notification-details">
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-timestamp">{new Date(notification.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="dialog-footer">
                        <button className="read-all-btn" onClick={onReadAll}>Read All Notifications</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationsDialog;
