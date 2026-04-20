import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import api from '../api';

const SensorChart = ({ sensorId, plantRow }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sensorId) return;
    api.get(`/api/sensors/history/${sensorId}`)
      .then(r => {
        const formatted = r.data.map(d => ({
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          moisture: d.soilMoisture,
          temp: d.temperature,
          humidity: d.humidity,
        }));
        setData(formatted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sensorId]);

  if (loading) return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-center h-48">
      <p className="text-slate-400 text-sm">Loading history...</p>
    </div>
  );

  if (data.length === 0) return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-center h-48">
      <p className="text-slate-400 text-sm">No history yet — data appears after first reading</p>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <h3 className="text-sm font-semibold text-slate-300">{plantRow} — Last 24h</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          <Line type="monotone" dataKey="moisture" stroke="#22c55e" dot={false} name="Moisture %" strokeWidth={2} />
          <Line type="monotone" dataKey="temp"     stroke="#f97316" dot={false} name="Temp °C"    strokeWidth={2} />
          <Line type="monotone" dataKey="humidity" stroke="#06b6d4" dot={false} name="Humidity %" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;
