import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import './components/AccountView.css';
import './components/AdminPanel.css';
import './components/FormPages.css';
 

// --- COMPONENT IMPORTS ---
import UserDashboard from './components/UserDashboard';
import ProductsAndPlans from './components/ProductsAndPlans';
import AdminPanel from './components/AdminPanel';
import BottomNav from './components/BottomNav';
import Notification from './components/Notification';
import TopNav from './components/TopNav';
import AccountView from './components/AccountView';
import NewsView from './components/NewsView';
import Deposit from './components/Deposit';
import Withdrawal from './components/Withdrawal';
import Wallet from './components/Wallet';
import Team from './components/Team';
import Promotions from './components/Promotions';
import Rewards from './components/Rewards';
import Support from './components/Support';


// ++ STUBBED COMPONENTS to prevent errors until they are built
const GameView = () => <div style={{ padding: '20px' }}>Game View Coming Soon!</div>;


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
    const [authView, setAuthView] = useState('login'); // 'login' or 'register'

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
            setView('login'); // Default to login view
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

    // --- Render Function for NEW Auth Forms ---
    const renderAuthForms = () => (
        <div className={`auth-container ${authView === 'register' ? 'active' : ''}`}>
             <div className="curved-shape"></div>
             <div className="curved-shape2"></div>

            {/* Login Form */}
            <div className="form-box Login">
                <h2 className="animation" style={{'--D':0, '--S':21}}>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-box animation" style={{'--D':1, '--S':22}}>
                        <input type="tel" name="mobile" value={loginFormData.mobile} onChange={handleLoginInputChange} required autoComplete="tel" />
                        <label>Mobile Number</label>
                        <i className='bx bxs-user'></i>
                    </div>
                    <div className="input-box animation" style={{'--D':2, '--S':23}}>
                        <input type="password" name="password" value={loginFormData.password} onChange={handleLoginInputChange} required autoComplete="current-password" />
                        <label>Password</label>
                        <i className='bx bxs-lock-alt' ></i>
                    </div>
                    <button className="btn animation" type="submit" style={{'--D':3, '--S':24}} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <div className="regi-link animation" style={{'--D':4, '--S':25}}>
                        <p>Don't have an account? <br/> <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('register'); }}>Sign Up</a></p>
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
                         <input type="text" name="username" value={registerFormData.username} onChange={handleRegisterInputChange} required autoComplete="username" />
                        <label>Username</label>
                        <i className='bx bxs-user'></i>
                    </div>
                    <div className="input-box animation" style={{'--li':19, '--S':2}}>
                        <input type="tel" name="mobile" value={registerFormData.mobile} onChange={handleRegisterInputChange} required pattern="\d{10}" autoComplete="tel" />
                        <label>Mobile Number</label>
                         <i className='bx bxs-phone'></i>
                    </div>
                    <div className="input-box animation" style={{'--li':19, '--S':3}}>
                        <input type="password" name="password" value={registerFormData.password} onChange={handleRegisterInputChange} required autoComplete="new-password" />
                        <label>Password</label>
                        <i className='bx bxs-lock-alt' ></i>
                    </div>
                     <div className="input-box animation" style={{'--li':19, '--S':3}}>
                        <input type="password" name="confirmPassword" value={registerFormData.confirmPassword} onChange={handleRegisterInputChange} required autoComplete="new-password" />
                        <label>Confirm Password</label>
                        <i className='bx bxs-lock-alt' ></i>
                    </div>
                     <div className="input-box animation" style={{'--li':19, '--S':3}}>
                        <input type="text" name="referralCode" placeholder="Referral Code (Optional)" value={registerFormData.referralCode} onChange={handleRegisterInputChange} />
                        <label>Referral Code (Optional)</label>
                         <i className='bx bxs-group'></i>
                    </div>
                    <button className="btn animation" type="submit" style={{'--li':20, '--S':4}} disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                    <div className="regi-link animation" style={{'--li':21, '--S':5}}>
                        <p>Already have an account? <br/> <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('login'); }}>Sign In</a></p>
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
            case 'deposit':
                return <Deposit onViewChange={handleViewChange} />;
            case 'withdrawal':
                 return <Withdrawal onViewChange={handleViewChange} />;
            case 'wallet':
                return <Wallet financialSummary={financialSummary} onViewChange={handleViewChange} />;
            case 'team':
                return <Team token={token} onViewChange={handleViewChange} />;
            case 'promotions':
                return <Promotions onViewChange={handleViewChange} />;
            case 'rewards':
                return <Rewards onViewChange={handleViewChange} />;
            case 'support':
                return <Support onViewChange={handleViewChange} />;
            default:
                return <UserDashboard onViewChange={handleViewChange} financialSummary={financialSummary} />;
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
                        isAdmin={userData?.is_admin}
                        onViewChange={handleViewChange}
                        financialSummary={financialSummary}
                    />
                    <main className="main-content">{renderMainView()}</main>
                    {!userData?.is_admin && <BottomNav activeView={view} onViewChange={handleViewChange} />}
                </div>
            )}
        </div>
    );
}

export default App;

