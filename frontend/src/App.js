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

// ++ STUBBED COMPONENTS
const GameView = () => <div style={{ padding: '20px' }}>Game View Coming Soon!</div>;
const MyProductsView = ({ onBack }) => <div style={{ padding: '20px' }}><button onClick={onBack}>← Back</button><h2>My Products</h2></div>;
const TransactionsView = ({ onBack }) => <div style={{ padding: '20px' }}><button onClick={onBack}>← Back</button><h2>Transactions</h2></div>;
const WithdrawalForm = ({ onBack }) => <div style={{ padding: '20px' }}><button onClick={onBack}>← Back</button><h2>Request Withdrawal</h2></div>;
const RechargeForm = ({ onBack }) => <div style={{ padding: '20px' }}><button onClick={onBack}>← Back</button><h2>Recharge Account</h2></div>;

// --- API CONFIGURATION ---
const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'https://investmentpro-nu7s.onrender.com';
    }
    return '';
};
const API_BASE_URL = getApiBaseUrl();

// --- THE MAIN APP COMPONENT ---
function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [view, setView] = useState('login'); // Start with login view
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
        // We apply a specific class for the auth page vs the main app
        if (!token) {
            document.body.className = 'auth-body';
        } else {
            document.body.className = `${theme}-theme`;
        }
    }, [token, theme]);

    // Effect to load the boxicons script for the new login form
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/boxicons@2.1.4/dist/boxicons.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);


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

    // --- NEW: Render function for the stylish auth page ---
    const renderAuthPage = () => (
        <div className={view === 'register' ? 'container active' : 'container'}>
            <div className="curved-shape"></div>
            <div className="curved-shape2"></div>
            
            {/* Login Form */}
            <div className="form-box Login">
                <h2 className="animation" style={{'--D':0, '--S':21}}>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-box animation" style={{'--D':1, '--S':22}}>
                        <input type="tel" name="mobile" required value={loginFormData.mobile} onChange={handleLoginInputChange} />
                        <label>Mobile Number</label>
                        <box-icon type='solid' name='user' color="gray"></box-icon>
                    </div>
                    <div className="input-box animation" style={{'--D':2, '--S':23}}>
                        <input type="password" name="password" required value={loginFormData.password} onChange={handleLoginInputChange} />
                        <label>Password</label>
                        <box-icon name='lock-alt' type='solid' color="gray"></box-icon>
                    </div>
                    <div className="input-box animation" style={{'--D':3, '--S':24}}>
                        <button className="btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                    </div>
                    <div className="regi-link animation" style={{'--D':4, '--S':25}}>
                        <p>Don't have an account? <br /> <button type="button" className="SignUpLink" onClick={() => setView('register')}>Sign Up</button></p>
                    </div>
                </form>
            </div>
            <div className="info-content Login">
                <h2 className="animation" style={{'--D':0, '--S':20}}>WELCOME BACK!</h2>
                <p className="animation" style={{'--D':1, '--S':21}}>We are happy to have you with us again. If you need anything, we are here to help.</p>
            </div>

            {/* Register Form */}
            <div className="form-box Register">
                <h2 className="animation" style={{'--li':17, '--S':0}}>Register</h2>
                <form onSubmit={handleRegister}>
                    <div className="input-box animation" style={{'--li':18, '--S':1}}>
                        <input type="text" name="username" required value={registerFormData.username} onChange={handleRegisterInputChange} />
                        <label>Username</label>
                         <box-icon type='solid' name='user' color="gray"></box-icon>
                    </div>
                    <div className="input-box animation" style={{'--li':19, '--S':2}}>
                        <input type="tel" name="mobile" required value={registerFormData.mobile} onChange={handleRegisterInputChange} />
                        <label>Mobile Number</label>
                        <box-icon name='phone' type='solid' color="gray"></box-icon>
                    </div>
                    <div className="input-box animation" style={{'--li':20, '--S':3}}>
                        <input type="password" name="password" required value={registerFormData.password} onChange={handleRegisterInputChange} />
                        <label>Password</label>
                        <box-icon name='lock-alt' type='solid' color="gray"></box-icon>
                    </div>
                    <div className="input-box animation" style={{'--li':21, '--S':4}}>
                        <input type="password" name="confirmPassword" required value={registerFormData.confirmPassword} onChange={handleRegisterInputChange} />
                        <label>Confirm Password</label>
                        <box-icon name='lock-alt' type='solid' color="gray"></box-icon>
                    </div>
                    <div className="input-box animation" style={{'--li':22, '--S':5}}>
                        <input type="text" name="referralCode" value={registerFormData.referralCode} onChange={handleRegisterInputChange} />
                        <label>Referral Code (Optional)</label>
                        <box-icon name='user-plus' type='solid' color="gray"></box-icon>
                    </div>
                    <div className="input-box animation" style={{'--li':23, '--S':6}}>
                         <button className="btn" type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
                    </div>
                    <div className="regi-link animation" style={{'--li':24, '--S':7}}>
                        <p>Already have an account? <br /> <button type="button" className="SignInLink" onClick={() => setView('login')}>Sign In</button></p>
                    </div>
                </form>
            </div>
            <div className="info-content Register">
                <h2 className="animation" style={{'--li':17, '--S':0}}>WELCOME!</h2>
                <p className="animation" style={{'--li':18, '--S':1}}>We’re delighted to have you here. If you need any assistance, feel free to reach out.</p>
            </div>
        </div>
    );
    
    // --- Main View Renderer ---
    const renderMainView = () => {
        if (loading && !userData) return <div className="loading-app"><h1>InvestmentPlus</h1><p>Loading...</p></div>;
        if (userData?.is_admin) {
            return <AdminPanel token={token} onLogout={handleLogout} />;
        }

        switch (view) {
            case 'dashboard': return <UserDashboard onViewChange={setView} financialSummary={financialSummary} />;
            case 'plans': return <ProductsAndPlans token={token} onPlanPurchase={() => { showNotification('Plan purchased!', 'success'); fetchAllUserData(token); setView('dashboard'); }} />;
            case 'game': return <GameView />;
            case 'news': return <NewsView />;
            case 'account': return <AccountView userData={userData} financialSummary={financialSummary} onViewChange={setView} onLogout={handleLogout} />;
            case 'my-products': return <MyProductsView onBack={() => setView('account')} />;
            case 'transactions': return <TransactionsView onBack={() => setView('account')} />;
            case 'recharge': return <RechargeForm onBack={() => setView('account')} />;
            case 'withdraw': return <WithdrawalForm onBack={() => setView('account')} />;
            default: return <UserDashboard onViewChange={setView} financialSummary={financialSummary} />;
        }
    };

    return (
        <div className="App">
            <Notification message={notification.message} type={notification.type} show={notification.show} onClose={() => setNotification({ ...notification, show: false })} />
            {!token ? (
                renderAuthPage()
            ) : (
                <div className="app-container">
                    <TopNav
                        theme={theme}
                        toggleTheme={toggleTheme}
                        onLogout={handleLogout}
                        isAdmin={userData?.is_admin}
                        onViewChange={setView}
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

