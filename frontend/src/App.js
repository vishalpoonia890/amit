import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// --- COMPONENT IMPORTS ---
import UserDashboard from './components/UserDashboard';
import ProductsAndPlans from './components/ProductsAndPlans';
import AdminPanel from './components/AdminPanel';
import BottomNav from './components/BottomNav';
import Notification from './components/Notification';
import TopNav from './components/TopNav';
import AccountView from './components/AccountView';
import NewsView from './components/NewsView';
import GameView from './components/GameView';
import Deposit from './components/Deposit';
import Withdrawal from './components/Withdrawal';
import Wallet from './components/Wallet';
import Team from './components/Team';
import Promotions from './components/Promotions';
import Rewards from './components/Rewards';
import Support from './components/Support';
import BetHistory from './components/BetHistory';


const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';

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
    const [isContainerActive, setIsContainerActive] = useState(false);


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
        try {
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
        }
    }, [handleLogout]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchAllUserData(storedToken).then(() => {
                setView('dashboard');
                setLoading(false);
            });
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
            const errorMessage = err.response?.data?.error || "Login failed.";
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
            const errorMessage = err.response?.data?.error || "Registration failed.";
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderAuthForms = () => (
        <div className={`auth-container ${isContainerActive ? 'active' : ''}`}>
            <div className="curved-shape"></div>
            <div className="curved-shape2"></div>
            
            <div className="form-box Login">
                <h2 className="animation" style={{'--D':0, '--S':21}}>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-box animation" style={{'--D':1, '--S':22}}>
                        <input type="tel" name="mobile" value={loginFormData.mobile} onChange={handleLoginInputChange} required autoComplete="tel"/>
                        <label>Mobile Number</label>
                    </div>
                    <div className="input-box animation" style={{'--D':2, '--S':23}}>
                        <input type="password" name="password" value={loginFormData.password} onChange={handleLoginInputChange} required autoComplete="current-password"/>
                        <label>Password</label>
                    </div>
                    <button className="btn animation" type="submit" disabled={loading} style={{'--D':3, '--S':24}}>{loading ? 'Logging in...' : 'Login'}</button>
                    <div className="regi-link animation" style={{'--D':4, '--S':25}}>
                        <p>Don't have an account? <button type="button" onClick={() => setIsContainerActive(true)} className="SignUpLink">Sign Up</button></p>
                    </div>
                </form>
            </div>
            <div className="info-content Login">
                <h2 className="animation" style={{'--D':0, '--S':20}}>WELCOME BACK!</h2>
                <p className="animation" style={{'--D':1, '--S':21}}>We are happy to have you with us again. Your next opportunity awaits.</p>
            </div>

            <div className="form-box Register">
                <h2 className="animation" style={{'--li':17, '--S':0}}>Register</h2>
                <form onSubmit={handleRegister}>
                    <div className="input-box animation" style={{'--li':18, '--S':1}}>
                        <input type="text" name="username" value={registerFormData.username} onChange={handleRegisterInputChange} required autoComplete="username"/>
                        <label>Username</label>
                    </div>
                    <div className="input-box animation" style={{'--li':19, '--S':2}}>
                        <input type="tel" name="mobile" value={registerFormData.mobile} onChange={handleRegisterInputChange} required autoComplete="tel"/>
                        <label>Mobile Number</label>
                    </div>
                    <div className="input-box animation" style={{'--li':20, '--S':3}}>
                        <input type="password" name="password" value={registerFormData.password} onChange={handleRegisterInputChange} required autoComplete="new-password"/>
                        <label>Password</label>
                    </div>
                     <div className="input-box animation" style={{'--li':21, '--S':4}}>
                        <input type="password" name="confirmPassword" value={registerFormData.confirmPassword} onChange={handleRegisterInputChange} required autoComplete="new-password"/>
                        <label>Confirm Password</label>
                    </div>
                    <button className="btn animation" type="submit" disabled={loading} style={{'--li':22, '--S':5}}>{loading ? 'Registering...' : 'Register'}</button>
                    <div className="regi-link animation" style={{'--li':23, '--S':6}}>
                        <p>Already have an account? <button type="button" onClick={() => setIsContainerActive(false)} className="SignInLink">Sign In</button></p>
                    </div>
                </form>
            </div>
             <div className="info-content Register">
                <h2 className="animation" style={{'--li':17, '--S':0}}>JOIN US!</h2>
                <p className="animation" style={{'--li':18, '--S':1}}>Create your account to start your journey towards financial growth.</p>
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
            case 'plans': return <ProductsAndPlans token={token} onPlanPurchase={() => { showNotification('Plan purchased!', 'success'); fetchAllUserData(token); setView('dashboard'); }} />;
            case 'game': return <GameView token={token} financialSummary={financialSummary} onViewChange={setView} onBetPlaced={() => fetchAllUserData(token)} />;
            case 'news': return <NewsView />;
            case 'account': return <AccountView userData={userData} financialSummary={financialSummary} onLogout={handleLogout} onViewChange={setView} token={token}/>;
            
            case 'rewards': return <Rewards onBack={goBackToDashboard} />;
            case 'invite': return <Team onBack={goBackToDashboard} />;
            case 'team': return <Team onBack={goBackToDashboard} />;
            case 'support': return <Support onBack={goBackToDashboard} />;
            case 'wallet': return <Wallet financialSummary={financialSummary} onBack={goBackToDashboard} />;
            case 'deposit': return <Deposit token={token} onBack={goBackToDashboard} />;
            case 'withdraw': return <Withdrawal token={token} financialSummary={financialSummary} onBack={goBackToDashboard} />;
            case 'promotions': return <Promotions onBack={goBackToDashboard} />;
            case 'bet-history': return <BetHistory token={token} onBack={goBackToAccount} />;

            default: return <UserDashboard onViewChange={setView} />;
        }
    };

    if (loading && !token) return <div className="loading-app"><h1>InvestmentPlus</h1><p>Loading...</p></div>;

    return (
        <div className="App">
            <Notification message={notification.message} type={notification.type} show={notification.show} onClose={() => setNotification({ ...notification, show: false })} />
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

