// src/components/AdminUserManagementView.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

function AdminUserManagementView({ token }) {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ balanceGreaterThan: '', depositGreaterThan: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    // Add state for modal
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setUsers(res.data.users))
            .catch(err => console.error("Failed to fetch users", err));
    }, [token]);

    const filteredAndSortedUsers = useMemo(() => {
        let sortedUsers = [...users];
        // Apply Search
        if (searchTerm) {
            sortedUsers = sortedUsers.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.mobile.includes(searchTerm) ||
                String(user.id).includes(searchTerm)
            );
        }
        // Apply Filters
        if (filters.balanceGreaterThan) {
            sortedUsers = sortedUsers.filter(user => user.balance >= parseFloat(filters.balanceGreaterThan));
        }
        // Apply Sorting
        sortedUsers.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortedUsers;
    }, [users, searchTerm, filters, sortConfig]);

    const handleSort = (key) => {
      // ... sort logic ...
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };
    
    // ... Function to save user data from modal ...

    return (
        <div className="admin-view">
            <h2>User Management</h2>
            <div className="controls-bar">
                <input type="text" placeholder="Search by ID, Name, Mobile..." onChange={e => setSearchTerm(e.target.value)} />
                <input type="number" placeholder="Balance greater than..." onChange={e => setFilters({...filters, balanceGreaterThan: e.target.value})} />
                {/* ... Add other filter/sort controls ... */}
            </div>
            <div className="user-table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')}>ID</th>
                            <th onClick={() => handleSort('name')}>Name</th>
                            <th>Mobile</th>
                            <th onClick={() => handleSort('balance')}>Balance</th>
                            {/* ... Other headers ... */}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.mobile}</td>
                                <td>{user.balance}</td>
                                {/* ... Other data cells ... */}
                                <td><button onClick={() => handleEditUser(user)}>Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* ... Modal for editing user ... */}
        </div>
    );
}

export default AdminUserManagementView;
