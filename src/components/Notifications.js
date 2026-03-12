import React from 'react';
import axios from 'axios';

const Notifications = ({ notifications, setNotifications }) => {
  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationStyle = (type, read) => {
    const baseStyle = 'border-l-4 transition-all duration-200 hover:shadow-md';
    const readStyle = read ? 'opacity-75' : 'shadow-lg';
    
    switch (type) {
      case 'warning':
        return `${baseStyle} ${readStyle} border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50`;
      case 'error':
        return `${baseStyle} ${readStyle} border-red-400 bg-gradient-to-r from-red-50 to-pink-50`;
      case 'success':
        return `${baseStyle} ${readStyle} border-green-400 bg-gradient-to-r from-green-50 to-emerald-50`;
      default:
        return `${baseStyle} ${readStyle} border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50`;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const todayNotifications = notifications.filter(n => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.toDateString() === today.toDateString();
  });

  const olderNotifications = notifications.filter(n => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.toDateString() !== today.toDateString();
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-white/80">Stay updated with your irrigation system alerts</p>
      </div>

      {/* Stats and Actions */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todayNotifications.length}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {notifications.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Notifications</h3>
            <p className="text-gray-600">
              You're all caught up! New alerts will appear here when your system needs attention.
            </p>
          </div>
        ) : (
          <>
            {/* Today's Notifications */}
            {todayNotifications.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <span>📅</span>
                  <span>Today</span>
                </h3>
                <div className="space-y-3">
                  {todayNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-xl cursor-pointer ${getNotificationStyle(notification.type, notification.read)}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {notification.plantRow && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                  {notification.plantRow}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          <p className={`text-gray-800 ${!notification.read ? 'font-medium' : ''}`}>
                            {notification.message}
                          </p>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Older Notifications */}
            {olderNotifications.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <span>📋</span>
                  <span>Earlier</span>
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {olderNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-xl cursor-pointer ${getNotificationStyle(notification.type, notification.read)}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-xl flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {notification.plantRow && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                  {notification.plantRow}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          <p className={`text-gray-800 text-sm ${!notification.read ? 'font-medium' : ''}`}>
                            {notification.message}
                          </p>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleDateString()} at {new Date(notification.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;