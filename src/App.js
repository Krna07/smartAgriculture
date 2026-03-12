import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import IrrigationControl from './components/IrrigationControl';
import SensorData from './components/SensorData';
import Notifications from './components/Notifications';
import './App.css';

const socket = io('http://localhost:5000');

function NavLink({ to, children, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? 'active' : ''}`}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

function App() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on('irrigationAlert', (alert) => {
      setNotifications(prev => [{
        id: Date.now(),
        message: alert.message,
        type: 'warning',
        plantRow: alert.plantRow,
        timestamp: new Date(),
        read: false
      }, ...prev]);
    });

    return () => {
      socket.off('newNotification');
      socket.off('irrigationAlert');
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Router>
      <div className="min-h-screen main-page" >
        {/* Navigation */}
        <nav className="navbar">
          <div className="nav-container">
            {/* Logo */}
            <div className="nav-brand">
              <div className="nav-logo">
                <span>🌱</span>
              </div>
              <div>
                <h1 className="nav-title">Smart Irrigation</h1>
                <p className="nav-subtitle">IoT Agriculture System</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="nav-links">
              <NavLink to="/" icon="📊">Dashboard</NavLink>
              <NavLink to="/sensors" icon="📡">Sensors</NavLink>
              <NavLink to="/irrigation" icon="💧">Irrigation</NavLink>
              <div className="relative">
                <NavLink to="/notifications" icon="🔔">
                  Notifications
                </NavLink>
                {unreadCount > 0 && (
                  <div className="notification-badge">
                    {unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container py-8">
          <Routes>
            <Route path="/" element={<Dashboard socket={socket} />} />
            <Route path="/sensors" element={<SensorData socket={socket} />} />
            <Route path="/irrigation" element={<IrrigationControl socket={socket} />} />
            <Route path="/notifications" element={
              <Notifications 
                notifications={notifications} 
                setNotifications={setNotifications} 
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;