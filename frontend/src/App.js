import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import './components/FormPages.css';

// --- COMPONENT IMPORTS ---
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import UserDashboard from './components/UserDashboard';
import ProductsAndPlans from './components/ProductsAndPlans';
import GameView from './components/GameView';
import AccountView from './components/AccountView';
import AdminPanel from './components/AdminPanel';
import Deposit from './components/Deposit';
import Withdrawal from './components/Withdrawal';
import Wallet from './components/Wallet';
import Team from './components/Team';
import Promotions from './components/Promotions';
import Rewards from './components/Rewards';
import Support from './components/Support';
import BetHistory from './components/BetHistory';
import Notification from './components/Notification';

// --- API CONFIGURATION ---
const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

// --- MAIN APP COMPONENT ---
function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [view, setView] = useState('landing');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
    const [loginFormData, setLoginFormData] = useState({ mobile: '', password: '' });
    const [registerFormData, setRegisterFormData] = useState({ username: '', mobile: '', password: '', confirmPassword: '', referralCode: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isLoginForm, setIsLoginForm] = useState(true);

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
        setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUserData(null);
        setView('login');
    }, []);

    const fetchUserData = useCallback(async (authToken) => {
        if (!authToken) return;
        // Don't set loading to true here to allow for silent background refreshes
        try {
            const res = await axios.get(`${API_BASE_URL}/api/data`, { headers: { Authorization: `Bearer ${authToken}` } });
            setUserData(res.data.user);
        } catch (err) {
            console.error("Failed to fetch user data:", err);
            showNotification('Session expired. Please log in again.', 'error');
            handleLogout();
        } finally {
            // Only set loading to false on the initial load
            if (loading) setLoading(false);
        }
    }, [handleLogout, loading]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchUserData(storedToken).then(() => setView('dashboard'));
        } else {
            setLoading(false);
            setView('login');
        }
    }, [fetchUserData]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, loginFormData);
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUserData(response.data.user);
            setView('dashboard');
            showNotification('Login successful!', 'success');
        } catch (err) {
            showNotification(err.response?.data?.error || "Login failed.", 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerFormData.password !== registerFormData.confirmPassword) {
            showNotification("Passwords do not match.", 'error');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/register`, registerFormData);
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUserData(response.data.user);
            setView('dashboard');
            showNotification('Registration successful!', 'success');
        } catch (err) {
            showNotification(err.response?.data?.error || "Registration failed.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewChange = (newView) => setView(newView);

    const renderAuthForms = () => (
        <div className={`auth-container ${!isLoginForm ? 'active' : ''}`}>
            {/* Login Form */}
            <div className="form-box Login">
                <h2 className="animation" style={{"--D":0, "--S":21}}>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-box animation" style={{"--D":1, "--S":22}}>
                        <input type="tel" name="mobile" required value={loginFormData.mobile} onChange={(e) => setLoginFormData({...loginFormData, mobile: e.target.value})} />
                        <label>Mobile Number</label>
                    </div>
                    <div className="input-box animation" style={{"--D":2, "--S":23}}>
                        <input type="password" name="password" required value={loginFormData.password} onChange={(e) => setLoginFormData({...loginFormData, password: e.target.value})} />
                        <label>Password</label>
                    </div>
                    <button className="btn animation" type="submit" disabled={loading} style={{"--D":3, "--S":24}}>{loading ? 'Logging in...' : 'Login'}</button>
                    <div className="regi-link animation" style={{"--D":4, "--S":25}}>
                        <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginForm(false);}}>Sign Up</a></p>
                    </div>
                </form>
            </div>
            {/* Register Form */}
            <div className="form-box Register">
                <h2 className="animation" style={{"--li":17, "--S":0}}>Register</h2>
                <form onSubmit={handleRegister}>
                    <div className="input-box animation" style={{"--li":18, "--S":1}}>
                         <input type="text" name="username" required value={registerFormData.username} onChange={(e) => setRegisterFormData({...registerFormData, username: e.target.value})} />
                        <label>Username</label>
                    </div>
                    <div className="input-box animation" style={{"--li":19, "--S":2}}>
                        <input type="tel" name="mobile" required value={registerFormData.mobile} onChange={(e) => setRegisterFormData({...registerFormData, mobile: e.target.value})}/>
                        <label>Mobile</label>
                    </div>
                    <div className="input-box animation" style={{"--li":19, "--S":3}}>
                        <input type="password" name="password" required value={registerFormData.password} onChange={(e) => setRegisterFormData({...registerFormData, password: e.target.value})}/>
                        <label>Password</label>
                    </div>
                     <div className="input-box animation" style={{"--li":19, "--S":4}}>
                        <input type="password" name="confirmPassword" required value={registerFormData.confirmPassword} onChange={(e) => setRegisterFormData({...registerFormData, confirmPassword: e.target.value})}/>
                        <label>Confirm Password</label>
                    </div>
                    <button className="btn animation" type="submit" disabled={loading} style={{"--li":20, "--S":5}}>{loading ? 'Registering...' : 'Register'}</button>
                    <div className="regi-link animation" style={{"--li":21, "--S":6}}>
                        <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginForm(true);}}>Sign In</a></p>
                    </div>
                </form>
            </div>
            {/* Info Content */}
            <div className="info-content Login">
                <h2 className="animation" style={{"--D":0, "--S":20}}>WELCOME BACK!</h2>
                <p className="animation" style={{"--D":1, "--S":21}}>We're happy to have you with us again.</p>
            </div>
             <div className="info-content Register">
                <h2 className="animation" style={{"--li":17, "--S":0}}>WELCOME!</h2>
                <p className="animation" style={{"--li":18, "--S":1}}>We’re delighted to have you here.</p>
            </div>
             {/* Shapes */}
            <div className="curved-shape"></div>
            <div className="curved-shape2"></div>
        </div>
    );
    
    const renderMainView = () => {
        if (userData?.is_admin) {
            return <AdminPanel token={token} onLogout={handleLogout} />;
        }
        switch (view) {
            case 'dashboard': return <UserDashboard onViewChange={handleViewChange} />;
            case 'plans': return <ProductsAndPlans token={token} onPlanPurchase={() => fetchUserData(token)} />;
            case 'game': return <GameView token={token} userData={userData} onBalanceUpdate={() => fetchUserData(token)} />;
            case 'account': return <AccountView userData={userData} onLogout={handleLogout} onViewChange={handleViewChange} />;
            case 'deposit': return <Deposit onBack={() => setView('account')} />;
            case 'withdraw': return <Withdrawal onBack={() => setView('account')} />;
            case 'wallet': return <Wallet userData={userData} onBack={() => setView('account')} />;
            case 'team': return <Team onBack={() => setView('account')} />;
            case 'promotions': return <Promotions onBack={() => setView('account')} />;
            case 'rewards': return <Rewards onBack={() => setView('account')} />;
            case 'support': return <Support onBack={() => setView('account')} />;
            case 'bet-history': return <BetHistory token={token} onBack={() => setView('account')} />;
            default: return <UserDashboard onViewChange={handleViewChange} />;
        }
    };

    if (loading && view === 'landing') return <div className="loading-app"><h1>InvestmentPlus</h1><p>Loading...</p></div>;

    return (
        <div className="App">
            <Notification message={notification.message} type={notification.type} show={notification.show} onClose={() => setNotification({ ...notification, show: false })} />
            {!token ? (
                 renderAuthForms()
            ) : (
                <div className="app-container">
                    <TopNav 
                        userData={userData}
                        theme={theme}
                        toggleTheme={toggleTheme}
                    />
                    <main className="main-content">{renderMainView()}</main>
                    {!userData?.is_admin && <BottomNav activeView={view} onViewChange={handleViewChange} />}
                </div>
            )}
        </div>
    );
}

export default App;

