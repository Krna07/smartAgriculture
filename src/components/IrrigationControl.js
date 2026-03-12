import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IrrigationControl = ({ socket }) => {
  const [sensors, setSensors] = useState([]);
  const [selectedRow, setSelectedRow] = useState('');
  const [duration, setDuration] = useState(5);
  const [isIrrigating, setIsIrrigating] = useState({});
  const [irrigationHistory, setIrrigationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchSensors();
    fetchIrrigationHistory();

    socket.on('irrigationStarted', (data) => {
      setIsIrrigating(prev => ({ ...prev, [data.plantRow]: true }));
    });

    socket.on('irrigationCompleted', (data) => {
      setIsIrrigating(prev => ({ ...prev, [data.plantRow]: false }));
      fetchIrrigationHistory();
    });

    return () => {
      socket.off('irrigationStarted');
      socket.off('irrigationCompleted');
    };
  }, [socket]);

  const fetchSensors = async () => {
    try {
      const response = await axios.get('/api/sensors');
      setSensors(response.data);
    } catch (error) {
      console.error('Error fetching sensors:', error);
    }
  };

  const fetchIrrigationHistory = async () => {
    try {
      const response = await axios.get('/api/irrigation/history');
      setIrrigationHistory(response.data);
    } catch (error) {
      console.error('Error fetching irrigation history:', error);
    }
  };

  const startIrrigation = async (plantRow, customDuration = duration) => {
    try {
      await axios.post('/api/irrigation/start', {
        plantRow,
        duration: customDuration,
        triggeredBy: 'User'
      });
      
      setSelectedRow('');
      setDuration(5);
    } catch (error) {
      console.error('Error starting irrigation:', error);
      alert('Failed to start irrigation');
    }
  };

  const handleManualIrrigation = (e) => {
    e.preventDefault();
    if (!selectedRow) {
      alert('Please select a plant row');
      return;
    }
    startIrrigation(selectedRow);
  };

  const quickIrrigate = (plantRow) => {
    startIrrigation(plantRow, 3);
  };

  const plantRows = [...new Set(sensors.map(s => s.plantRow))];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerColor = (type) => {
    switch (type) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'automatic': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Irrigation Control</h1>
        <p className="text-white/80">Manage water distribution across your plant rows</p>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manual Control */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🎛️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Manual Irrigation</h3>
          </div>

          <form onSubmit={handleManualIrrigation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Plant Row
              </label>
              <select 
                value={selectedRow} 
                onChange={(e) => setSelectedRow(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Choose a plant row...</option>
                {plantRows.map(row => (
                  <option key={row} value={row}>{row}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <div className="absolute right-3 top-3 text-gray-400">min</div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Start Irrigation 💧
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
          </div>

          <p className="text-gray-600 mb-4">Quick 3-minute irrigation for each plant row:</p>
          
          <div className="space-y-3">
            {plantRows.map(row => {
              const sensor = sensors.find(s => s.plantRow === row);
              const needsWater = sensor && sensor.soilMoisture < 30;
              const isCurrentlyIrrigating = isIrrigating[row];
              
              return (
                <div key={row} className={`p-4 rounded-xl border-2 transition-all ${
                  needsWater ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800">{row}</span>
                        {needsWater && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                            ⚠️ Low Moisture
                          </span>
                        )}
                      </div>
                      {sensor && (
                        <div className="text-sm text-gray-600 mt-1">
                          Moisture: {sensor.soilMoisture}% • Temp: {sensor.temperature}°C
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => quickIrrigate(row)}
                      disabled={isCurrentlyIrrigating}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isCurrentlyIrrigating
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : needsWater
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isCurrentlyIrrigating ? (
                        <span className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Irrigating...</span>
                        </span>
                      ) : (
                        'Quick Irrigate'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Irrigation History</h3>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>

        {showHistory && (
          <div className="overflow-hidden">
            {irrigationHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🌱</div>
                <p>No irrigation history available</p>
                <p className="text-sm">Start your first irrigation to see activity here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Plant Row</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Triggered By</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {irrigationHistory.slice(0, 10).map(log => (
                      <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{log.plantRow}</td>
                        <td className="py-3 px-4 text-gray-600">{log.duration} min</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTriggerColor(log.triggerType)}`}>
                            {log.triggerType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{log.triggeredBy}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IrrigationControl;