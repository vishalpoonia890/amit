import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// --- COMPONENT IMPORTS ---
import UserDashboard from './components/UserDashboard';
import ProductsAndPlans from './components/ProductsAndPlans';
import NewsView from './components/NewsView';
import Team from './components/Team';
import { Wallet, Promotions, Rewards, Support } from './components/PlaceholderViews';
import AdminPanel from './components/AdminPanel';
import BottomNav from './components/BottomNav';
import Notification from './components/Notification';
import TopNav from './components/TopNav';
import AccountView from './components/AccountView';
import GameView from './components/GameView';
import Deposit from './components/Deposit';
import Withdrawal from './components/Withdrawal';
import BetHistory from './components/BetHistory';
import NotificationsDialog from './components/NotificationsDialog';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [view, setView] = useState('landing');
    const [authView, setAuthView] = useState('login');
    const [userData, setUserData] = useState(null);
    const [financialSummary, setFinancialSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbarNotification, setSnackbarNotification] = useState({ show: false, message: '', type: 'info' });
    const [loginFormData, setLoginFormData] = useState({ mobile: '', password: '' });
    const [registerFormData, setRegisterFormData] = useState({ username: '', mobile: '', password: '', confirmPassword: '', referralCode: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [userNotifications, setUserNotifications] = useState([]);
    const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        document.body.className = `${theme}-theme`;
    }, [theme]);

    const showSnackbar = (message, type = 'info') => {
        setSnackbarNotification({ show: true, message, type });
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUserData(null);
        setFinancialSummary(null);
        showSnackbar('Your session is invalid. Please log in again.', 'error');
        setView('login');
        setAuthView('login');
    }, []);

    const fetchAllUserData = useCallback(async (authToken) => {
        if (!authToken) return;
        try {
            const [dataRes, summaryRes, notificationsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/data`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/api/financial-summary`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${authToken}` } })
            ]);
            setUserData(dataRes.data.user);
            setFinancialSummary(summaryRes.data);
            setUserNotifications(notificationsRes.data.notifications.map(n => ({ ...n, read: false })));
        } catch (err) {
            console.error("Failed to fetch user data, likely an invalid session:", err);
            if ([401, 403, 404].includes(err.response?.status)) {
                showSnackbar('Your session is invalid. Please log in again.', 'error');
                handleLogout();
            }
        }
    }, [handleLogout]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            setRegisterFormData(prev => ({ ...prev, referralCode: refCode }));
            setAuthView('register');
        }

        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchAllUserData(storedToken).then(() => setLoading(false));
        } else {
            setLoading(false);
            setView('login');
        }
    }, [fetchAllUserData]);

    useEffect(() => {
        if (token) {
            const interval = setInterval(() => fetchAllUserData(token), 5000);
            return () => clearInterval(interval);
        }
    }, [token, fetchAllUserData]);

    const handleDepositRequest = useCallback((amount) => {
        showSnackbar(`₹${amount.toLocaleString()} deposit requested. Awaiting admin approval.`, 'info');
    }, []);

    const handleWithdrawalRequest = useCallback((amount) => {
        showSnackbar(`₹${amount.toLocaleString()} withdrawal requested.`, 'info');
    }, []);

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
            showSnackbar('Login successful!', 'success');
        } catch (err) {
            showSnackbar(err.response?.data?.error || "Login failed.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (registerFormData.password !== registerFormData.confirmPassword) {
            showSnackbar("Passwords do not match.", 'error');
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
            showSnackbar('Registration successful!', 'success');
        } catch (err) {
            showSnackbar(err.response?.data?.error || "Registration failed.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderAuthForms = () => (
        <div className="auth-wrapper">
            <div className="auth-container-simple">
                {authView === 'login' ? (
                    <div className="form-box-simple">
                        <h2>Login</h2>
                        <form onSubmit={handleLogin}>
                           {/* Login Form Inputs */}
                            <div className="input-box">
                                <input type="tel" name="mobile" value={loginFormData.mobile} onChange={handleLoginInputChange} required autoComplete="tel"/>
                                <label>Mobile Number</label>
                            </div>
                            <div className="input-box">
                                <input type="password" name="password" value={loginFormData.password} onChange={handleLoginInputChange} required autoComplete="current-password"/>
                                <label>Password</label>
                            </div>
                            <button className="btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                            <div className="regi-link">
                                <p>Don't have an account? <button type="button" onClick={() => setAuthView('register')}>Sign Up</button></p>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="form-box-simple">
                        <h2>Register</h2>
                        <form onSubmit={handleRegister}>
                            {/* Register Form Inputs */}
                             <div className="input-box">
                                <input type="text" name="username" value={registerFormData.username} onChange={handleRegisterInputChange} required autoComplete="username"/>
                                <label>Username</label>
                            </div>
                            <div className="input-box">
                                <input type="tel" name="mobile" value={registerFormData.mobile} onChange={handleRegisterInputChange} required autoComplete="tel"/>
                                <label>Mobile Number</label>
                            </div>
                            <div className="input-box">
                                <input type="password" name="password" value={registerFormData.password} onChange={handleRegisterInputChange} required autoComplete="new-password"/>
                                <label>Password</label>
                            </div>
                             <div className="input-box">
                                <input type="password" name="confirmPassword" value={registerFormData.confirmPassword} onChange={handleRegisterInputChange} required autoComplete="new-password"/>
                                <label>Confirm Password</label>
                            </div>
                            <div className="input-box">
                                <input type="text" name="referralCode" value={registerFormData.referralCode} onChange={handleRegisterInputChange} autoComplete="off"/>
                                <label>Referral Code (Optional)</label>
                            </div>
                            <button className="btn" type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
                            <div className="regi-link">
                                <p>Already have an account? <button type="button" onClick={() => setAuthView('login')}>Sign In</button></p>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );

    const renderMainView = () => {
        if (userData?.is_admin) {
            return <AdminPanel token={token} />;
        }

        const goBackToDashboard = () => setView('dashboard');
        const goBackToAccount = () => setView('account');

        switch (view) {
            case 'dashboard': return <UserDashboard onViewChange={setView} />;
            case 'plans': 
                // ✅ --- THIS LOGIC IS UPDATED --- ✅
                // Calculate the total balance from both wallets
                const totalBalance = financialSummary 
                    ? parseFloat(financialSummary.balance) + parseFloat(financialSummary.withdrawable_wallet) 
                    : 0;
                return <ProductsAndPlans
                    token={token}
                    userBalance={totalBalance} // Pass the combined total balance
                    onPurchaseComplete={() => fetchAllUserData(token)}
                 />;
            case 'game': return <GameView token={token} financialSummary={financialSummary} onViewChange={setView} onBetPlaced={() => fetchAllUserData(token)} />;
            case 'news': return <NewsView />;
            case 'account': return <AccountView userData={userData} financialSummary={financialSummary} onLogout={handleLogout} onViewChange={setView} token={token}/>;
            case 'rewards': return <Rewards onBack={goBackToDashboard} />;
            case 'invite': return <Team token={token} onBack={goBackToDashboard} />;
            case 'team': return <Team token={token} onBack={goBackToDashboard} />;
            case 'support': return <Support onBack={goBackToDashboard} />;
            case 'wallet': return <Wallet financialSummary={financialSummary} onBack={goBackToDashboard} />;
            case 'deposit': return <Deposit token={token} onBack={goBackToDashboard} onDepositRequest={handleDepositRequest} />;
            case 'withdraw': return <Withdrawal token={token} financialSummary={financialSummary} onBack={goBackToDashboard} onWithdrawalRequest={handleWithdrawalRequest} />;
            case 'promotions': return <Promotions onBack={goBackToDashboard} />;
            case 'bet-history': return <BetHistory token={token} onBack={goBackToAccount} />;
            default: return <UserDashboard onViewChange={setView} />;
        }
    };

    if (loading && !token) return <div className="loading-app"><h1>InvestmentPlus</h1><p>Loading...</p></div>;

    return (
        <div className="App">
            <Notification
                message={snackbarNotification.message}
                type={snackbarNotification.type}
                show={snackbarNotification.show}
                onClose={() => setSnackbarNotification({ ...snackbarNotification, show: false })}
            />
            {!token ? (
                renderAuthForms()
            ) : (
                <div className="app-container">
                    <TopNav
                        theme={theme}
                        toggleTheme={toggleTheme}
                        onLogout={handleLogout}
                        financialSummary={financialSummary}
                    />
                    <main className="main-content">{renderMainView()}</main>
                    {!userData?.is_admin && <BottomNav activeView={view} onViewChange={setView} />}
                </div>
            )}
        </div>
    );
}

export default App;
