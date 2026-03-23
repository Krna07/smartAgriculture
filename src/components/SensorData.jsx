import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Thermometer, Wind, Radio, AlertTriangle, X, Droplets } from 'lucide-react';

const SensorData = ({ socket }) => {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);

  useEffect(() => {
    fetchSensors();

    socket.on('sensorUpdate', (sensor) => {
      setSensors(prev => {
        const existing = prev.find(s => s.sensorId === sensor.sensorId);
        if (existing) {
          return prev.map(s => s.sensorId === sensor.sensorId ? sensor : s);
        } else {
          return [...prev, sensor];
        }
      });
    });

    return () => {
      socket.off('sensorUpdate');
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

  const getStatusInfo = (moisture) => {
    if (moisture < 30) return { text: 'Needs Water', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (moisture < 60) return { text: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { text: 'Good', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const getMoistureClass = (moisture) => {
    if (moisture < 30) return 'progress-low';
    if (moisture < 60) return 'progress-medium';
    return 'progress-high';
  };

  const SensorCard = ({ sensor }) => {
    const status = getStatusInfo(sensor.soilMoisture);
    const isLowMoisture = sensor.soilMoisture < 30;
    
    return (
      <div 
        className={`sensor-card ${isLowMoisture ? 'low-moisture' : ''}`}
        onClick={() => setSelectedSensor(sensor)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{sensor.plantRow}</h3>
            <p className="text-sm text-gray-500">ID: {sensor.sensorId}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`status-indicator ${sensor.isActive ? 'status-online' : 'status-offline'}`}></div>
            <span className={`text-sm font-medium ${sensor.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {sensor.isActive ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Soil Moisture - Main Metric */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Soil Moisture</span>
            <span className={`text-2xl font-bold ${status.color}`}>
              {sensor.soilMoisture}%
            </span>
          </div>
          
          <div className="progress-bar mb-2">
            <div 
              className={`progress-fill ${getMoistureClass(sensor.soilMoisture)}`}
              style={{ width: `${sensor.soilMoisture}%` }}
            ></div>
          </div>
          
          <div className={`text-center py-2 px-3 rounded-lg ${status.bgColor}`}>
            <span className={`text-sm font-medium ${status.color}`}>
              Status: {status.text}
            </span>
          </div>
        </div>

        {/* Other Metrics */}
        <div className="sensor-metrics mb-4">
          <div className="metric-item metric-item-blue text-center">
            <Thermometer className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">{sensor.temperature}°C</div>
            <div className="text-xs text-blue-500">Temperature</div>
          </div>
          
          <div className="metric-item metric-item-cyan text-center">
            <Wind className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-cyan-600">{sensor.humidity}%</div>
            <div className="text-xs text-cyan-500">Humidity</div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(sensor.lastUpdated).toLocaleString()}
        </div>

        {/* Alert Banner */}
        {isLowMoisture && (
          <div className="mt-4 p-3 rounded-xl text-center text-white" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Low Moisture Alert!</span>
            </div>
            <p className="text-xs mt-1" style={{ opacity: 0.9 }}>Consider irrigation for optimal plant health</p>
          </div>
        )}
      </div>
    );
  };

  const SensorModal = ({ sensor, onClose }) => {
    if (!sensor) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', zIndex: 50 }}>
        <div className="bg-white rounded-2xl p-6 w-full" style={{ maxWidth: '28rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">{sensor.plantRow}</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
              style={{ transition: 'background-color 0.2s' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-700 mb-2">Sensor Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sensor ID:</span>
                  <span className="font-medium">{sensor.sensorId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${sensor.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {sensor.isActive ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Update:</span>
                  <span className="font-medium">{new Date(sensor.lastUpdated).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3">
              <div className="metric-item metric-item-blue text-center">
                <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-600">{sensor.soilMoisture}%</div>
                <div className="text-xs text-blue-500">Moisture</div>
              </div>
              <div className="metric-item metric-item-red text-center">
                <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-red-600">{sensor.temperature}°C</div>
                <div className="text-xs text-red-500">Temperature</div>
              </div>
              <div className="metric-item metric-item-cyan text-center">
                <Wind className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-cyan-600">{sensor.humidity}%</div>
                <div className="text-xs text-cyan-500">Humidity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Sensor Monitoring</h1>
        <p className="text-slate-600">Real-time data from your IoT sensors</p>
      </div>

      {/* Sensors Grid */}
      {sensors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sensors.map(sensor => (
            <SensorCard key={sensor.sensorId} sensor={sensor} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Sensors Detected</h3>
          <p className="text-gray-600 mb-4">
            Make sure your IoT devices are connected and sending data to the system.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 text-left" style={{ maxWidth: '28rem', margin: '0 auto' }}>
            <h4 className="font-medium text-blue-800 mb-2">Expected Sensors:</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Row A - Tomatoes (SENSOR_001)</li>
              <li>• Row B - Lettuce (SENSOR_002)</li>
              <li>• Row C - Peppers (SENSOR_003)</li>
              <li>• Row D - Herbs (SENSOR_004)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Sensor Detail Modal */}
      <SensorModal 
        sensor={selectedSensor} 
        onClose={() => setSelectedSensor(null)} 
      />
    </div>
  );
};

export default SensorData;