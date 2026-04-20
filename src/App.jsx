import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { LayoutDashboard, Radio, Droplets, Bell, Leaf, LogOut, User, BookOpen, UserCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import IrrigationControl from './components/IrrigationControl';
import SensorData from './components/SensorData';
import Notifications from './components/Notifications';
import LearnPanel from './components/LearnPanel';
import Profile from './pages/Profile';
import './App.css';
import Footer from './components/Footer';

import api from './api';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL);

function NavLink({ to, children, icon: Icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon: Icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive ? 'text-green-400' : 'text-slate-400'}`}>
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
function AppLayout() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [learnOpen, setLearnOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    socket.emit('join', user.id);

    // Load existing notifications from backend on mount
    api.get('/api/notifications').then(r => setNotifications(r.data)).catch(() => {});

    socket.on('newNotification', (n) => setNotifications(prev => [n, ...prev]));
    socket.on('irrigationAlert', (alert) => {
      setNotifications(prev => [{
        id: Date.now(), message: alert.message, type: 'warning',
        plantRow: alert.plantRow, timestamp: new Date(), read: false
      }, ...prev]);
    });

    return () => {
      socket.off('newNotification');
      socket.off('irrigationAlert');
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen main-page flex flex-col">
      {/* Top navbar — logo + farm name only on mobile, full nav on desktop */}
      <nav className="navbar flex-shrink-0">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-logo">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="nav-title">{user?.farmName || 'Smart Irrigation'}</h1>
              <p className="nav-subtitle">IoT Agriculture System</p>
            </div>
          </div>

          {/* Desktop only nav links */}
          <div className="nav-links hidden md:flex">
            <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/sensors" icon={Radio}>Sensors</NavLink>
            <NavLink to="/irrigation" icon={Droplets}>Irrigation</NavLink>
            <div className="relative">
              <NavLink to="/notifications" icon={Bell}>Notifications</NavLink>
              {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
            </div>
          </div>

          {/* Desktop only right actions */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <User className="w-4 h-4" />
              <span>{user?.name}</span>
            </div>
            <NavLink to="/profile" icon={UserCircle}>Profile</NavLink>
            <button onClick={() => setLearnOpen(true)} className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <BookOpen className="w-4 h-4" />
              <span>Guide</span>
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile only — guide button in top bar */}
          <button onClick={() => setLearnOpen(true)} className="md:hidden flex items-center gap-1 px-2 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main content — grows to fill space, bottom padding = bottom nav height */}
      <main className="flex-1 container py-4 md:py-8" style={{ paddingBottom: '5rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard socket={socket} user={user} />} />
          <Route path="/sensors" element={<SensorData socket={socket} />} />
          <Route path="/irrigation" element={<IrrigationControl socket={socket} />} />
          <Route path="/notifications" element={<Notifications notifications={notifications} setNotifications={setNotifications} />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Desktop footer */}
      <div className="hidden md:block flex-shrink-0"><Footer /></div>

      {/* Mobile bottom navigation — fixed, never overlaps content due to paddingBottom above */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700" style={{ height: '4rem' }}>
        <div className="flex justify-around items-center h-full px-1">
          <MobileNavLink to="/" icon={LayoutDashboard} label="Home" />
          <MobileNavLink to="/sensors" icon={Radio} label="Sensors" />
          <MobileNavLink to="/irrigation" icon={Droplets} label="Irrigate" />
          <div className="relative">
            <MobileNavLink to="/notifications" icon={Bell} label="Alerts" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
          </div>
          <MobileNavLink to="/profile" icon={UserCircle} label="Profile" />
          <button onClick={logout} className="flex flex-col items-center gap-0.5 px-2 py-1 text-slate-400 active:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </nav>

      <LearnPanel open={learnOpen} onClose={() => setLearnOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Redirect logged-in users away from login/signup
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

export default App;
