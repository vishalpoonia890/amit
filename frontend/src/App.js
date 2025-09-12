import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- API Configuration ---
const API_BASE_URL = 'https://investmentpro-nu7s.onrender.com';

// --- Helper: Icon Component ---
// Using Heroicons (MIT License) as inline SVGs for clean, scalable icons.
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// --- Reusable UI Components for the Redesign ---

const ProductCard = ({ plan }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.plan_name || plan.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Duration: {plan.duration_days || plan.durationDays} days</p>
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Price</span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">₹{(plan.price || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Daily Income</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">+ ₹{(plan.daily_income || plan.dailyIncome || 0).toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Total Return</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">₹{(plan.total_return || plan.totalReturn || 0).toLocaleString()}</span>
                </div>
            </div>
            <button className="mt-5 w-full bg-primary-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50">
                Invest Now
            </button>
        </div>
    </div>
);

const FAQAccordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-4 text-left text-gray-800 dark:text-gray-200">
                <span className="font-semibold">{title}</span>
                <Icon path={isOpen ? "M19.5 12h-15" : "M12 4.5v15m7.5-7.5h-15"} className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{children}</div>}
        </div>
    );
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(true), 10000);
        return () => clearTimeout(timer);
    }, []);

    if (!isOpen) {
         return (
             <button onClick={() => setIsOpen(true)} className="fixed bottom-24 right-5 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-transform duration-300 hover:scale-110 z-20">
                 <Icon path="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
             </button>
         );
    }

    return (
        <div className="fixed bottom-24 right-5 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all duration-300 z-20">
             <div className="p-4 bg-primary-500 text-white rounded-t-xl flex justify-between items-center">
                 <h3 className="font-bold">InvestmentPlus Support</h3>
                 <button onClick={() => setIsOpen(false)}><Icon path="M6 18 18 6M6 6l12 12" className="w-5 h-5" /></button>
             </div>
             <div className="p-4 h-64 overflow-y-auto">
                <div className="text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded-lg self-start max-w-xs mb-2">Hello! How can I help you today?</div>
             </div>
             <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                 <input type="text" placeholder="Type a message..." className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none" />
             </div>
        </div>
    );
};


// --- Screen Components ---

const AdminPanelScreen = ({ token }) => {
    // A placeholder for the full admin panel functionality
    return (
        <div className="p-4 pb-24 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Admin Panel</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome, Admin!</p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Full administrative controls would be displayed here.</p>
            {/* In a real scenario, you'd fetch and display pending deposits, withdrawals, game stats, etc. */}
        </div>
    );
};

const HomeScreen = ({ financialSummary, featuredPlans, onViewChange }) => {
    const quickActions = [
        { label: 'Deposit', icon: 'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0 .75-.75V8.25m0 0a1.5 1.5 0 0 0-1.5-1.5H5.625a1.5 1.5 0 0 0-1.5 1.5v3.75a1.5 1.5 0 0 0 1.5 1.5h12.75a1.5 1.5 0 0 0 1.5-1.5V8.25Z', view: 'deposit' },
        { label: 'Withdraw', icon: 'M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', view: 'withdraw' },
        { label: 'Rewards', icon: 'M21 11.25v8.25a8.25 8.25 0 0 1-16.5 0v-8.25a8.25 8.25 0 0 1 16.5 0Z M12 15.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z M12 15.75a3.75 3.75 0 1 0 7.5 0 3.75 3.75 0 0 0-7.5 0Z M12 3v1.875m0 0a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12 3v1.875m-3.75 9v.008m7.5 0v.008m-.75-4.5h.008v.008h-.008v-.008Zm-6.75 0h.008v.008h-.008v-.008Z', view: 'rewards' },
        { label: 'Support', icon: 'M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.056 3 11.625c0 4.556 4.03 8.25 9 8.25Z M9.75 11.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm.002-3a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z', view: 'support' },
    ];
    
    const fakeWithdrawals = [
        { name: 'Rahul S.', amount: 5250 }, { name: 'Priya P.', amount: 8100 },
        { name: 'Amit K.', amount: 3400 }, { name: 'Sneha G.', amount: 12500 },
        { name: 'Vikas S.', amount: 6800 },
    ];

    return (
        <div className="p-4 pb-24 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back!</h1>
                <p className="text-gray-500 dark:text-gray-400">Let's grow your funds today.</p>
            </header>
            
            <div className="grid grid-cols-4 gap-4">
                {quickActions.map(action => (
                    <div key={action.label} onClick={() => onViewChange(action.view)} className="flex flex-col items-center space-y-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-md">
                            <Icon path={action.icon} className="w-6 h-6 text-primary-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">How to Earn</h2>
                <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
                    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0" title="Promotional Video" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
                </div>
            </div>

            <div>
                 <div className="flex justify-between items-center mb-2">
                     <h2 className="text-lg font-bold text-gray-900 dark:text-white">Featured Plans</h2>
                     <button onClick={() => onViewChange('plans')} className="text-sm font-semibold text-primary-500">View All</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(featuredPlans || []).slice(0, 2).map(plan => <ProductCard key={plan.id} plan={plan} />)}
                 </div>
            </div>
            
            <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-md p-2">
                <div className="flex animate-marquee whitespace-nowrap">
                    {fakeWithdrawals.concat(fakeWithdrawals).map((item, index) => (
                        <div key={index} className="mx-4 text-sm text-gray-600 dark:text-gray-400">
                           🎉 <strong>{item.name}</strong> just withdrew ₹{item.amount.toLocaleString()}!
                        </div>
                    ))}
                </div>
            </div>

            <div>
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h2>
                 <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                     <FAQAccordion title="How do I get started?" defaultOpen={true}>
                         <p>Simply register, make your first deposit using our secure methods, choose an investment plan that fits your goals, and start earning daily returns automatically!</p>
                     </FAQAccordion>
                     <FAQAccordion title="Is my investment safe?">
                         <p>We use a diversified portfolio strategy and state-of-the-art security to protect your funds. However, all investments carry inherent risks. Please invest wisely.</p>
                     </FAQAccordion>
                 </div>
            </div>

            <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-4">
                Disclaimer: Investments involve market risks. Please read all scheme-related documents carefully.
            </p>
        </div>
    );
};

// Merged ProductsAndPlans component
const ProductsAndPlansScreen = ({ token, userBalance, onPurchaseComplete, allPlans, loading }) => {
    // ... This can contain filter/search logic in the future
    return (
        <div className="p-4 pb-24">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">All Investment Plans</h1>
            {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Loading plans...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allPlans.map(plan => <ProductCard key={plan.id} plan={plan} />)}
                </div>
            )}
        </div>
    );
};

// Merged AccountView component
const PersonalScreen = ({ userData, financialSummary, onLogout, onViewChange }) => {
     if (!userData || !financialSummary) return <div className="p-4 text-center">Loading personal data...</div>;

     const totalBalance = (financialSummary.balance || 0) + (financialSummary.withdrawable_wallet || 0);

     return (
         <div className="p-4 pb-24 space-y-6">
             <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                <img src={`https://placehold.co/80x80/FF6B6B/FFFFFF?text=${userData.name?.[0]?.toUpperCase() || 'U'}`} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-primary-200 dark:border-primary-800" />
                <div>
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">{userData.name}</h2>
                     <p className="text-sm text-gray-500 dark:text-gray-400">ID: {userData.ip_username}</p>
                </div>
             </div>
             
             <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                    <p className="text-sm opacity-80">Total Balance</p>
                    <p className="text-4xl font-bold mt-1">₹{totalBalance.toLocaleString()}</p>
                </div>
                <div className="flex justify-between mt-4 text-center">
                    <div>
                        <p className="text-xs opacity-80">Recharge</p>
                        <p className="font-semibold">₹{(financialSummary.balance || 0).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs opacity-80">Withdrawable</p>
                        <p className="font-semibold">₹{(financialSummary.withdrawable_wallet || 0).toLocaleString()}</p>
                    </div>
                </div>
             </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md divide-y dark:divide-gray-700">
                 <button onClick={() => onViewChange('transactions')} className="w-full flex items-center p-4 text-left">
                    <Icon path="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 3H18a2.25 2.25 0 0 1 2.25 2.25v11.25A2.25 2.25 0 0 1 18 19.5H6A2.25 2.25 0 0 1 3.75 17.25V3Z" className="w-6 h-6 mr-4 text-gray-500"/>
                    <span className="flex-1 font-semibold text-gray-800 dark:text-gray-200">Transaction History</span>
                    <Icon path="m8.25 4.5 7.5 7.5-7.5 7.5" className="w-5 h-5 text-gray-400"/>
                 </button>
                 <button onClick={() => onViewChange('bet-history')} className="w-full flex items-center p-4 text-left">
                    <Icon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" className="w-6 h-6 mr-4 text-gray-500"/>
                    <span className="flex-1 font-semibold text-gray-800 dark:text-gray-200">Bet History</span>
                    <Icon path="m8.25 4.5 7.5 7.5-7.5 7.5" className="w-5 h-5 text-gray-400"/>
                 </button>
            </div>
             
             <div className="mt-6">
                <button onClick={onLogout} className="w-full flex items-center justify-center p-3 text-left bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-semibold">
                    <Icon path="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" className="w-6 h-6 mr-3"/>
                    Logout
                 </button>
             </div>
         </div>
     );
};


// --- Main App Component ---

function App() {
    // --- State from your existing App.js ---
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [view, setView] = useState('landing'); // Will change to 'home' after login
    const [authView, setAuthView] = useState('login');
    const [userData, setUserData] = useState(null);
    const [financialSummary, setFinancialSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginFormData, setLoginFormData] = useState({ mobile: '', password: '' });
    const [registerFormData, setRegisterFormData] = useState({ username: '', mobile: '', password: '', confirmPassword: '', referralCode: '' });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    
    // New state for redesigned app
    const [plans, setPlans] = useState([]);

    // --- Functions from your existing App.js ---
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    useEffect(() => {
        // Apply theme on initial load
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUserData(null);
        setFinancialSummary(null);
        setView('login');
    }, []);
    
    const fetchAllData = useCallback(async (authToken) => {
        if (!authToken) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [dataRes, summaryRes, plansRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/data`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/api/financial-summary`, { headers: { Authorization: `Bearer ${authToken}` } }),
                axios.get(`${API_BASE_URL}/api/product-plans`, { headers: { Authorization: `Bearer ${authToken}` } })
            ]);
            
            setUserData(dataRes.data.user);
            setFinancialSummary(summaryRes.data);
            setPlans(plansRes.data.plans || []);
            setView('home'); // Go to home screen after successful fetch
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            handleLogout(); // If any call fails, log out
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchAllData(storedToken);
        } else {
            setLoading(false);
            setView('login');
        }
    }, [fetchAllData]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, loginFormData);
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            await fetchAllData(newToken);
        } catch (err) {
            alert(err.response?.data?.error || "Login failed.");
            setLoading(false);
        }
    };

    // --- Other handlers from your App.js ---
    const handleLoginInputChange = (e) => setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
    
    const renderAuthForms = () => (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
             <div className="w-full max-w-sm">
                <h2 className="text-3xl font-bold text-center text-primary-500 mb-6">InvestmentPlus</h2>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                     <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Welcome Back</h3>
                     <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                             <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Mobile Number</label>
                             <input type="tel" name="mobile" value={loginFormData.mobile} onChange={handleLoginInputChange} required className="w-full p-3 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                        </div>
                        <div>
                             <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Password</label>
                             <input type="password" name="password" value={loginFormData.password} onChange={handleLoginInputChange} required className="w-full p-3 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-primary-500 text-white font-bold py-3 rounded-lg hover:bg-primary-600 transition-colors duration-300 disabled:bg-gray-400">
                             {loading ? 'Logging in...' : 'Login'}
                        </button>
                     </form>
                </div>
             </div>
        </div>
    );

    const renderMainView = () => {
        // Your AdminPanel logic can be added back here if needed
         if (userData?.is_admin) { return <AdminPanelScreen token={token} />; }
        
        switch (view) {
            case 'home':
                return <HomeScreen financialSummary={financialSummary} featuredPlans={plans} onViewChange={setView} />;
            case 'plans':
                return <ProductsAndPlansScreen allPlans={plans} loading={loading} />;
            case 'personal':
                return <PersonalScreen userData={userData} financialSummary={financialSummary} onLogout={handleLogout} onViewChange={setView} />;
            // Placeholder views for other sections
            case 'games':
            case 'news':
            case 'deposit':
            case 'withdraw':
            case 'rewards':
            case 'support':
            case 'transactions':
            case 'bet-history':
            default:
                return (
                    <div className="p-4 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{view.charAt(0).toUpperCase() + view.slice(1)}</h1>
                        <p className="text-gray-500 dark:text-gray-400">This section is under construction.</p>
                        <button onClick={() => setView('home')} className="mt-4 bg-primary-500 text-white font-bold py-2 px-4 rounded-lg">Go Home</button>
                    </div>
                );
        }
    };

    if (view === 'login' || !token) {
        return renderAuthForms();
    }
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">Loading your dashboard...</div>;
    }
    
    const navItems = [
        { name: 'home', label: 'Home', icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
        { name: 'plans', label: 'Plans', icon: "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.117 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.117 1.007Z" },
        { name: 'games', label: 'Games', icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" },
        { name: 'news', label: 'News', icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" },
        { name: 'personal', label: 'Personal', icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" }
    ];

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
            <div className="max-w-md mx-auto bg-white dark:bg-black shadow-lg relative">
                
                {/* Top Navigation */}
                <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Icon path={theme === 'light' ? "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" : "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"} className="w-6 h-6 text-gray-700 dark:text-gray-300"/>
                        </button>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Total Balance</p>
                            <p className="text-lg font-bold text-primary-500">
                                ₹{financialSummary ? ((financialSummary.balance || 0) + (financialSummary.withdrawable_wallet || 0)).toLocaleString() : '0.00'}
                            </p>
                        </div>
                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                             <Icon path="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" className="w-6 h-6 text-gray-700 dark:text-gray-300"/>
                             <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-black"></span>
                        </button>
                    </div>
                </header>

                <main className="pt-16 pb-20">
                    {renderMainView()}
                </main>
                <Chatbot />

                <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                    <div className="flex justify-around p-2 border-t border-gray-200 dark:border-gray-800">
                        {navItems.map(item => (
                            <button key={item.name} onClick={() => setView(item.name)} className="flex flex-col items-center justify-center w-16 p-2 rounded-lg transition-colors duration-300">
                               <Icon path={item.icon} className={`w-7 h-7 mb-1 ${view === item.name ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}/>
                               <span className={`text-xs font-bold ${view === item.name ? 'text-primary-500' : 'text-gray-600 dark:text-gray-400'}`}>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

            </div>
        </div>
    );
}

export default App;

