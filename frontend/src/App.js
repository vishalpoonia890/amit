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
import NotificationsDialog from './components/NotificationsDialog'; // New: Notifications Dialog component

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';
function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [view, setView] = useState('landing');
    const [authView, setAuthView] = useState('login'); // 'login' or 'register'
    const [userData, setUserData] = useState(null);
    const [financialSummary, setFinancialSummary] = useState(null);
    const [loading, setLoading] = useState(true);
   const [snackbarNotification, setSnackbarNotification] = useState({ show: false, message: '', type: 'info' }); // Renamed to avoid conflict
    const [loginFormData, setLoginFormData] = useState({ mobile: '', password: '' });
    const [registerFormData, setRegisterFormData] = useState({ username: '', mobile: '', password: '', confirmPassword: '', referralCode: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // New: State for user-specific notifications
    
    const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
const [snackbarNotification, setSnackbarNotification] = useState({ show: false, message: '', type: 'info' }); // Renamed to avoid conflict

    
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        document.body.className = `${theme}-theme`;
    }, [theme]);

        const showSnackbarNotification = (message, type = 'info') => { // Renamed to match state
        setSnackbarNotification({ show: true, message, type });
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUserData(null);
        setFinancialSummary(null);
        showSnackbarNotification('Your session is invalid. Please log in again.', 'error');
        setView('login');
        setAuthView('login');
    }, []);

    const fetchAllUserData = useCallback(async (authToken) => {
        if (!authToken) return;
        try {
            const [dataRes, summaryRes, notificationsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/data`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/api/financial-summary`, { headers: { Authorization: `Bearer ${authToken}` } }), // <--- ADDED COMMA HERE
                axios.get(`${API_BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${authToken}` } }) // Fetch notifications
            ]);
            setUserData(dataRes.data.user);
            setFinancialSummary(summaryRes.data);
            setUserNotifications(notificationsRes.data.notifications.map(n => ({ ...n, read: false }))); // Initialize as unread        
            } catch (err) {
            
            console.error("Failed to fetch user data, likely an invalid session:", err);
            if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
                showSnackbarNotification('Your session is invalid. Please log in again.', 'error');
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
    
// New: Function to add a notification
    const addNotification = useCallback((message, type = 'info') => {
        const newNotification = {
            id: Date.now(), // Simple unique ID
            message: message,
            type: type, // 'deposit', 'withdrawal', 'purchase', 'bonus'
            timestamp: new Date().toISOString(),
            read: false,
        };
        setUserNotifications(prev => [newNotification, ...prev]);
    }, []);

    // New: Handle plan purchase notification
    const handlePlanPurchase = useCallback((errorMessage) => {
        if (errorMessage) {
            showSnackbarNotification(errorMessage, 'error');
        } else {
            showSnackbarNotification('Plan purchased successfully!', 'success');
            addNotification('Product purchased successfully!', 'purchase'); // Add specific notification
            fetchAllUserData(token); // Refresh balance only on success
        }
    }, [addNotification, fetchAllUserData, showSnackbarNotification, token]);

    // New: Handle deposit/withdrawal request/approval notifications
    const handleDepositRequest = useCallback((amount) => {
        addNotification(`₹${amount.toLocaleString()} deposit requested. Awaiting admin approval.`, 'deposit');
    }, [addNotification]);

    const handleWithdrawalRequest = useCallback((amount) => {
        addNotification(`₹${amount.toLocaleString()} withdrawal requested.`, 'withdrawal');
    }, [addNotification]);

 // Placeholder for admin actions (you'd call these from your admin panel or backend webhook)
    const handleAdminDepositApproved = useCallback((amount) => {
        addNotification(`₹${amount.toLocaleString()} has been deposited.`, 'deposit_approved');
    }, [addNotification]);

    const handleAdminWithdrawalApproved = useCallback((amount) => {
        addNotification(`₹${amount.toLocaleString()} has been withdrawn.`, 'withdrawal_approved');
    }, [addNotification]);

    const handleAdminBonusSent = useCallback((amount) => {
        addNotification(`Special bonus of ₹${amount.toLocaleString()} received!`, 'bonus');
    }, [addNotification]);

    const handleAdminDailyIncome = useCallback((amount) => {
        addNotification(`Admin sent ₹${amount.toLocaleString()} daily income.`, 'income');
    }, [addNotification]);

    
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
            showSnackbarNotification('Login successful!', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Login failed.";
            showSnackbarNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (registerFormData.password !== registerFormData.confirmPassword) {
            showSnackbarNotification("Passwords do not match.", 'error');
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
            showSnackbarNotification('Registration successful!', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Registration failed.";
            showSnackbarNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };
const markNotificationAsRead = (id) => {
        setUserNotifications(prev => 
            prev.map(notification => 
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
        // In a real app, you'd send an API call to mark as read on the backend
    };

    const markAllNotificationsAsRead = () => {
        setUserNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
        // In a real app, you'd send an API call to mark all as read on the backend
    };

    const deleteReadNotifications = () => {
        setUserNotifications(prev => prev.filter(notification => !notification.read));
    };

    const unreadNotificationCount = userNotifications.filter(n => !n.read).length;


    const renderAuthForms = () => (
        <div className="auth-wrapper">
            <div className="auth-container-simple">
                {authView === 'login' ? (
                    <div className="form-box-simple">
                        <h2>Login</h2>
                        <form onSubmit={handleLogin}>
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
            case 'plans': return <ProductsAndPlans
                        token={token}
                        userBalance={financialSummary?.balance} // Pass the user's balance here
                        onPlanPurchase={(errorMessage) => {
                            if (errorMessage) {
                                showNotification(errorMessage, 'error');
                            } else {
                                showNotification('Plan purchased successfully!', 'success');
                                fetchAllUserData(token); // Refresh balance only on success
                            }
                        }}
                    />; 
           
            case 'game': return <GameView token={token} financialSummary={financialSummary} onViewChange={setView} onBetPlaced={() => fetchAllUserData(token)} />;
            case 'news': return <NewsView />;
            case 'account': return <AccountView userData={userData} financialSummary={financialSummary} onLogout={handleLogout} onViewChange={setView} token={token}/>; // Pass onLogout
            case 'rewards': return <Rewards onBack={goBackToDashboard} />;
            case 'invite': return <Team token={token} onBack={goBackToDashboard} />;
            case 'team': return <Team token={token} onBack={goBackToDashboard} />;
            case 'support': return <Support onBack={goBackToDashboard} />;
            case 'wallet': return <Wallet financialSummary={financialSummary} onBack={goBackToDashboard} />;
           case 'deposit': return <Deposit token={token} onBack={goBackToDashboard} onDepositRequest={handleDepositRequest} />; // Pass deposit notification handler
            case 'withdraw': return <Withdrawal token={token} financialSummary={financialSummary} onBack={goBackToDashboard} onWithdrawalRequest={handleWithdrawalRequest} />; // Pass withdrawal notification handler            case 'promotions': return <Promotions onBack={goBackToDashboard} />;
            case 'bet-history': return <BetHistory token={token} onBack={goBackToAccount} />;
            default: return <UserDashboard onViewChange={setView} />;
        }
    };

    if (loading && !token) return <div className="loading-app"><h1>InvestmentPlus</h1><p>Loading...</p></div>;

    return (
        <div className="App">
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

