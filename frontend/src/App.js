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
import Snackbar from './components/Snackbar';
import TopNav from './components/TopNav';
import AccountView from './components/AccountView';
import GameLobby from './components/GameLobby';
import GameView from './components/GameView';
import Deposit from './components/Deposit';
import Withdrawal from './components/Withdrawal';
import BetHistory from './components/BetHistory';
import TransactionHistory from './components/TransactionHistory';
import NotificationsDialog from './components/NotificationsDialog';
import SellUsdt from './components/SellUsdt';
import IpLottery from './components/IpLottery';
import WinWinGame from './components/WinWinGame';
import AviatorGame from './components/AviatorGame';
import LandingPage from './components/LandingPage';

const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// A dedicated loading screen component for registration
const LoadingScreen = () => (
    <div className="loading-app">
        <h1 className="animated-logo">InvestmentPlus</h1>
        <p>Please wait, your account creation is in progress...</p>
        <div className="progress-bar">
            <div className="progress-bar-inner"></div>
        </div>
    </div>
);

function App() {
    // --- State Management ---
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [view, setView] = useState(localStorage.getItem('view') || 'dashboard');
    const [authView, setAuthView] = useState('login');
    const [userData, setUserData] = useState(null);
    const [financialSummary, setFinancialSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [snackbarNotification, setSnackbarNotification] = useState({ show: false, message: '', type: 'info' });
    const [loginFormData, setLoginFormData] = useState({ mobile: '', password: '' });
    const [registerFormData, setRegisterFormData] = useState({ username: '', mobile: '', password: '', confirmPassword: '', referralCode: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [allPlans, setAllPlans] = useState([]);
    const [userNotifications, setUserNotifications] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
    const [initialCategory, setInitialCategory] = useState('all');

    // Save the current view to localStorage whenever it changes while logged in
    useEffect(() => {
        if (token) {
            localStorage.setItem('view', view);
        }
    }, [view, token]);

    const handleViewChange = (newView, category = 'all') => {
        setView(newView);
        setInitialCategory(category);
    };

    // --- Core Functions ---
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.className = `${newTheme}-theme`;
    };

    useEffect(() => {
        document.body.className = `${theme}-theme`;
    }, [theme]);

    const showSnackbar = (message, type = 'info') => {
        setSnackbarNotification({ show: true, message, type });
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('view');
        setToken(null);
        setUserData(null);
        setFinancialSummary(null);
    }, []);

    const fetchAllUserData = useCallback(async (authToken) => {
        if (!authToken) return;
        try {
            const [dataRes, summaryRes, plansRes, notifRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/data`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/api/financial-summary`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/api/product-plans`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${authToken}` } })
            ]);
            setUserData(dataRes.data.user);
            setFinancialSummary(summaryRes.data);
            setAllPlans(plansRes.data.plans || []);
            setUserNotifications(notifRes.data.userNotifications || []);
            setPromotions(notifRes.data.promotions || []);
        } catch (err) {
            console.error("Failed to fetch user data, likely an invalid session:", err);
            if (err.response && err.response.status === 403) {
                 handleLogout();
            }
        }
    }, [handleLogout]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchAllUserData(storedToken).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [fetchAllUserData]);

    useEffect(() => {
        if (token) {
            const interval = setInterval(() => fetchAllUserData(token), 30000);
            return () => clearInterval(interval);
        }
    }, [token, fetchAllUserData]);
    
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
        setIsRegistering(true);
        if (registerFormData.password !== registerFormData.confirmPassword) {
            showSnackbar("Passwords do not match.", 'error');
            setIsRegistering(false);
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
            setIsRegistering(false);
        }
    };

    const handleLoginInputChange = (e) => setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
    const handleRegisterInputChange = (e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value });
    const handleDepositRequest = useCallback((amount) => showSnackbar(`₹${amount.toLocaleString()} deposit requested.`, 'info'), []);
    const handleWithdrawalRequest = useCallback((amount) => showSnackbar(`₹${amount.toLocaleString()} withdrawal requested.`, 'info'), []);

    const handleMarkAsRead = async (ids) => {
        try {
            await axios.post(`${API_BASE_URL}/api/notifications/read`, { ids }, { headers: { Authorization: `Bearer ${token}` } });
            setUserNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark notifications as read:", error);
        }
    };

    const handleDeleteRead = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/notifications/delete-read`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setUserNotifications(prev => prev.filter(n => !n.is_read));
        } catch (error) {
            console.error("Failed to delete read notifications:", error);
        }
    };
    
    const unreadCount = userNotifications.filter(n => !n.is_read).length;

    const renderMainView = () => {
        if (userData?.is_admin) {
            return <AdminPanel token={token} />;
        }
        
        const goBackToDashboard = () => handleViewChange('dashboard');
        const goBackToAccount = () => handleViewChange('account');
        const goBackToGameLobby = () => handleViewChange('game');

        switch (view) {
            case 'dashboard': return <UserDashboard onViewChange={handleViewChange} />;
            case 'plans': return <ProductsAndPlans token={token} allPlans={allPlans} onPurchaseComplete={() => fetchAllUserData(token)} initialCategory={initialCategory} />;
            case 'game': return <GameLobby onViewChange={handleViewChange} />; 
            case 'color-prediction-game': return <GameView token={token} financialSummary={financialSummary} onBack={goBackToGameLobby} onBetPlaced={() => fetchAllUserData(token)} />;
            case 'ip-lottery': return <IpLottery token={token} onBack={goBackToGameLobby} />;
            case 'win-win': return <WinWinGame onBack={goBackToGameLobby} />;
            case 'aviator': return <AviatorGame token={token} onBack={goBackToGameLobby} />;
            case 'account': return <AccountView userData={userData} financialSummary={financialSummary} onLogout={handleLogout} onViewChange={handleViewChange} token={token}/>;
            case 'deposit': return <Deposit token={token} onBack={goBackToDashboard} onDepositRequest={handleDepositRequest} />;
            case 'withdraw': return <Withdrawal token={token} financialSummary={financialSummary} onBack={goBackToDashboard} onWithdrawalRequest={handleWithdrawalRequest} />;
            case 'team': return <Team token={token} onBack={goBackToDashboard} />;
            case 'rewards': return <Rewards onBack={goBackToDashboard} />;
            case 'sell-usdt': return <SellUsdt onBack={goBackToDashboard} />;
            case 'support': return <Support onBack={goBackToDashboard} />;
            case 'wallet': return <Wallet financialSummary={financialSummary} onBack={goBackToDashboard} />;
            case 'transactions': return <TransactionHistory onBack={goBackToAccount} />;
            case 'bet-history': return <BetHistory token={token} onBack={goBackToAccount} />;
            default: return <UserDashboard onViewChange={handleViewChange} />;
        }
    };

    if (isRegistering) {
        return <LoadingScreen />;
    }
    
    if (loading) return <div className="loading-app"><h1>InvestmentPlus</h1></div>;
    
    if (!token) {
        return (
            <LandingPage
                authView={authView}
                setAuthView={setAuthView}
                loginFormData={loginFormData}
                registerFormData={registerFormData}
                handleLoginInputChange={handleLoginInputChange}
                handleRegisterInputChange={handleRegisterInputChange}
                handleLogin={handleLogin}
                handleRegister={handleRegister}
                loading={loading}
            />
        );
    }

    return (
        <div className="App">
            <Snackbar message={snackbarNotification.message} type={snackbarNotification.type} show={snackbarNotification.show} onClose={() => setSnackbarNotification({ ...snackbarNotification, show: false })} />
            {showNotificationsDialog && <NotificationsDialog userNotifications={userNotifications} promotions={promotions} onClose={() => setShowNotificationsDialog(false)} onMarkAsRead={handleMarkAsRead} onDeleteRead={handleDeleteRead} />}
            <div className="app-container">
                <TopNav theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} financialSummary={financialSummary} unreadCount={unreadCount} onNotificationsClick={() => setShowNotificationsDialog(true)} />
                <main className="main-content">{renderMainView()}</main>
                {!userData?.is_admin && <BottomNav activeView={view} onViewChange={setView} />}
            </div>
        </div>
    );
}

export default App;

