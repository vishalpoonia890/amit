// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// --- COMPONENT IMPORTS ---
import UserDashboard from './components/UserDashboard';
import ProductsAndPlans from './components/ProductsAndPlans';
import AdminPanel from './components/AdminPanel'; // Assuming AdminPanel component exists
import BottomNav from './components/BottomNav'; // Assuming BottomNav component exists
import Notification from './components/Notification'; // Assuming Notification component exists
import TopNav from './components/TopNav';
import AccountView from './components/AccountView'; // Assuming AccountView component exists
import NewsView from './components/NewsView'; // Assuming NewsView component exists

// ++ STUBBED COMPONENTS to prevent errors until they are built
const GameView = () => <div style={{ padding: '20px' }}>Game View Coming Soon!</div>;
const MyProductsView = ({ onBack }) => <div style={{ padding: '20px' }}><button onClick={onBack}>← Back</button><h2>My Products</h2></div>;
const TransactionsView = ({ onBack }) => <div style={{ padding: '20px' }}><button onClick={onBack}>← Back</button><h2>Transactions</h2></div>;
const WithdrawalForm = ({ onBack }) => <div style={{ padding: '20px' }}><button onClick={onBack}>← Back</button><h2>Request Withdrawal</h2></div>;
const RechargeForm = ({ onBack }) => <div style={{ padding: '20px' }}><button onClick={onBack}>← Back</button><h2>Recharge Account</h2></div>;

// --- API CONFIGURATION ---
const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'https://investmentpro-nu7s.onrender.com'; // Use your production URL here
    }
    return ''; // Assumes proxy for development (http://localhost:10000)
};
const API_BASE_URL = getApiBaseUrl();

// --- THE MAIN APP COMPONENT ---
function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [view, setView] = useState('landing');
    const [userData, setUserData] = useState(null);
    const [financialSummary, setFinancialSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
    const [loginFormData, setLoginFormData] = useState({ mobile: '', password: '' });
    const [registerFormData, setRegisterFormData] = useState({ username: '', mobile: '', password: '', confirmPassword: '', referralCode: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        document.body.className = `${theme}-theme`;
    }, [theme]);

    const showNotification = (message, type = 'info') => {
        setNotification({ show: true, message, type });
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUserData(null);
        setFinancialSummary(null);
        setView('login');
    }, []);

    const fetchAllUserData = useCallback(async (authToken) => {
        if (!authToken) return;
        setLoading(true);
        try {
            // Fetch user data and financial summary in parallel
            const [dataRes, summaryRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/data`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/api/financial-summary`, { headers: { Authorization: `Bearer ${authToken}` } })
            ]);
            setUserData(dataRes.data.user);
            setFinancialSummary(summaryRes.data);
        } catch (err) {
            console.error("Failed to fetch user data:", err);
            showNotification('Session expired. Please log in again.', 'error');
            handleLogout();
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchAllUserData(storedToken).then(() => setView('dashboard'));
        } else {
            setLoading(false);
            setView('login');
        }
    }, [fetchAllUserData]);

    const handleLoginInputChange = (e) => setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
    const handleRegisterInputChange = (e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, loginFormData);
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            await fetchAllUserData(newToken);
            setView('dashboard');
            showNotification('Login successful!', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Login failed. Please check your credentials.";
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (registerFormData.password !== registerFormData.confirmPassword) {
            showNotification("Passwords do not match.", 'error');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL}/api/register`, registerFormData);
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            await fetchAllUserData(newToken);
            setView('dashboard');
            showNotification('Registration successful!', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Registration failed. Please try again.";
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewChange = (newView) => setView(newView);

    // --- Render Functions for Auth Forms ---
    const renderLoginForm = () => (
        <div className="auth-page-wrapper">
            <div className="auth-form-container">
                <div className="auth-header"><div className="auth-logo">InvestmentPlus</div><h1>Welcome Back</h1><p>Sign in to your account.</p></div>
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group"><input type="tel" name="mobile" placeholder="Mobile Number" value={loginFormData.mobile} onChange={handleLoginInputChange} required /></div>
                    <div className="form-group"><input type="password" name="password" placeholder="Password" value={loginFormData.password} onChange={handleLoginInputChange} required /></div>
                    <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                </form>
                <div className="auth-footer"><p>Don’t have an account? <button onClick={() => setView('register')}>Sign up</button></p></div>
            </div>
        </div>
    );

    const renderRegisterForm = () => (
        <div className="auth-page-wrapper">
            <div className="auth-form-container">
                <div className="auth-header"><div className="auth-logo">InvestmentPlus</div><h1>Create Account</h1><p>Start your investment journey.</p></div>
                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group"><input type="text" name="username" placeholder="Username" value={registerFormData.username} onChange={handleRegisterInputChange} required /></div>
                    <div className="form-group"><input type="tel" name="mobile" placeholder="Mobile Number (10 digits)" value={registerFormData.mobile} onChange={handleRegisterInputChange} required pattern="\d{10}" /></div>
                    <div className="form-group"><input type="password" name="password" placeholder="Password" value={registerFormData.password} onChange={handleRegisterInputChange} required /></div>
                    <div className="form-group"><input type="password" name="confirmPassword" placeholder="Confirm Password" value={registerFormData.confirmPassword} onChange={handleRegisterInputChange} required /></div>
                    <div className="form-group"><input type="text" name="referralCode" placeholder="Referral Code (Optional)" value={registerFormData.referralCode} onChange={handleRegisterInputChange} /></div>
                    <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
                </form>
                <div className="auth-footer"><p>Already have an account? <button onClick={() => setView('login')}>Login</button></p></div>
            </div>
        </div>
    );

    // --- Main View Renderer ---
    const renderMainView = () => {
        if (userData?.is_admin) {
            return <AdminPanel token={token} onLogout={handleLogout} />;
        }

        switch (view) {
            case 'dashboard':
                return <UserDashboard onViewChange={handleViewChange} financialSummary={financialSummary} />;
            case 'plans':
                return <ProductsAndPlans token={token} onPlanPurchase={() => {
                    showNotification('Plan purchased successfully!', 'success');
                    fetchAllUserData(token); // Refresh data after purchase
                    setView('dashboard');
                }} />;
            case 'game':
                return <GameView />;
            case 'news':
                return <NewsView />;
            case 'account':
                return <AccountView userData={userData} financialSummary={financialSummary} onViewChange={handleViewChange} onLogout={handleLogout} />;
            case 'my-products':
                return <MyProductsView onBack={() => setView('account')} />;
            case 'transactions':
                return <TransactionsView onBack={() => setView('account')} />;
            case 'recharge':
                return <RechargeForm onBack={() => setView('account')} />;
            case 'withdraw':
                return <WithdrawalForm onBack={() => setView('account')} />;
            default:
                return <UserDashboard onViewChange={handleViewChange} financialSummary={financialSummary} />;
        }
    };

    if (loading && view === 'landing') return <div className="loading-app"><h1>InvestmentPlus</h1><p>Loading...</p></div>;

    return (
        <div className="App">
            <Notification message={notification.message} type={notification.type} show={notification.show} onClose={() => setNotification({ ...notification, show: false })} />
            {!token ? (
                <>
                    {view === 'login' && renderLoginForm()}
                    {view === 'register' && renderRegisterForm()}
                    {view === 'landing' && renderLoginForm()} {/* Fallback */}
                </>
            ) : (
                <div className="app-container">
                    <TopNav
                        theme={theme}
                        toggleTheme={toggleTheme}
                        onLogout={handleLogout}
                        isAdmin={userData?.is_admin}
                        onViewChange={handleViewChange}
                        financialSummary={financialSummary} // Pass the complete summary object
                    />
                    <main className="main-content">{renderMainView()}</main>
                    {/* Render BottomNav only if not admin */}
                    {!userData?.is_admin && <BottomNav activeView={view} onViewChange={handleViewChange} />}
                </div>
            )}
        </div>
    );
}

export default App;
