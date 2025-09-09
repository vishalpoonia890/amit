 // src/components/AdminPanel.js
import React, { useState } from 'react';
import './AdminPanel.css'; // Make sure you have this CSS file
import AdminDashboardView from './AdminDashboardView';
import AdminUserManagementView from './AdminUserManagementView';
import AdminProductManagementView from './AdminProductManagementView';

function AdminPanel({ token, onLogout }) {
    const [view, setView] = useState('dashboard'); // dashboard, users, products

    const renderView = () => {
        switch (view) {
            case 'users':
                return <AdminUserManagementView token={token} />;
            case 'products':
                return <AdminProductManagementView token={token} />;
            case 'dashboard':
            default:
                return <AdminDashboardView token={token} />;
        }
    };

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="admin-nav">
                    <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>Dashboard</button>
                    <button onClick={() => setView('users')} className={view === 'users' ? 'active' : ''}>Users</button>
                    <button onClick={() => setView('products')} className={view === 'products' ? 'active' : ''}>Products</button>
                    <button onClick={onLogout}>Logout</button>
                </div>
            </div>
            <div className="admin-content">
                {renderView()}
            </div>
        </div>
    );
}

export default AdminPanel;
