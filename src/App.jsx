import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { LayoutDashboard, Radio, Droplets, Bell, Leaf, LogOut, User, BookOpen } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import IrrigationControl from './components/IrrigationControl';
import SensorData from './components/SensorData';
import Notifications from './components/Notifications';
import LearnPanel from './components/LearnPanel';
import './App.css';
import Footer from './components/Footer';

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

function AppLayout() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [learnOpen, setLearnOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Join user-specific socket room
    socket.emit('join', user.id);

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
    <div className="min-h-screen main-page">
      <nav className="navbar">
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

          <div className="nav-links">
            <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/sensors" icon={Radio}>Sensors</NavLink>
            <NavLink to="/irrigation" icon={Droplets}>Irrigation</NavLink>
            <div className="relative">
              <NavLink to="/notifications" icon={Bell}>Notifications</NavLink>
              {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <User className="w-4 h-4" />
              <span className="hidden md:inline">{user?.name}</span>
            </div>
            <button onClick={() => setLearnOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Guide</span>
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-8">
        <Routes>
          <Route path="/" element={<Dashboard socket={socket} user={user} />} />
          <Route path="/sensors" element={<SensorData socket={socket} />} />
          <Route path="/irrigation" element={<IrrigationControl socket={socket} />} />
          <Route path="/notifications" element={<Notifications notifications={notifications} setNotifications={setNotifications} />} />
        </Routes>
      </main>
      <LearnPanel open={learnOpen} onClose={() => setLearnOpen(false)} />
      <Footer />
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
