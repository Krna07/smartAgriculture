import { useState, useEffect } from "react";
import axios from "axios";
import { Waves, Zap, Droplets, AlertTriangle, MapPin, Clock, History, Target } from "lucide-react";

const THRESHOLD = 50; // target moisture %

const Dashboard = ({ socket, user }) => {
  const [sensors, setSensors] = useState([]);
  const [recentIrrigation, setRecentIrrigation] = useState([]);
  const [stats, setStats] = useState({ activeSensors: 0, totalRows: 0, alerts: 0, avgMoisture: 0 });

  useEffect(() => {
    fetchSensors();
    fetchRecentIrrigation();
    socket.on("sensorUpdate", (sensor) => {
      setSensors((prev) => prev.map((s) => (s.sensorId === sensor.sensorId ? sensor : s)));
    });
    return () => socket.off("sensorUpdate");
  }, [socket]);

  useEffect(() => {
    setStats({
      activeSensors: sensors.filter((s) => s.isActive).length,
      totalRows: new Set(sensors.map((s) => s.plantRow)).size,
      alerts: sensors.filter((s) => s.soilMoisture < 30).length,
      avgMoisture: sensors.length > 0
        ? Math.round(sensors.reduce((sum, s) => sum + s.soilMoisture, 0) / sensors.length)
        : 0,
    });
  }, [sensors]);

  const fetchSensors = async () => {
    try { const r = await api.get("/api/sensors"); setSensors(r.data); }
    catch (e) { console.error(e); }
  };

  const fetchRecentIrrigation = async () => {
    try { const r = await api.get("/api/irrigation/history"); setRecentIrrigation(r.data.slice(0, 5)); }
    catch (e) { console.error(e); }
  };

  const getMoistureStatus = (m) => {
    if (m < 30) return { label: "LOW", color: "text-red-400", bar: "bg-red-500" };
    if (m < 60) return { label: "OPTIONAL", color: "text-amber-400", bar: "bg-amber-500" };
    return { label: "GOOD", color: "text-green-400", bar: "bg-green-500" };
  };

  const DataCard = ({ children, className = "" }) => (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg ${className}`}>
      {children}
    </div>
  );

  const ThresholdMonitor = () => (
    <DataCard className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Target className="text-green-400 w-5 h-5" />
          Threshold Monitor
        </h2>
        <span className="text-xs px-3 py-1 bg-slate-800 rounded-full text-slate-400">
          Target: <span className="text-green-400 font-semibold">{THRESHOLD}%</span>
        </span>
      </div>

      {sensors.length === 0 ? (
        <p className="text-slate-500 text-sm">No sensors connected</p>
      ) : (
        <div className="space-y-5">
          {sensors.map((sensor) => {
            const diff = sensor.soilMoisture - THRESHOLD;
            const exceeded = diff >= 0;
            const barWidth = Math.min((Math.abs(diff) / THRESHOLD) * 100, 100);

            return (
              <div key={sensor.sensorId}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">{sensor.plantRow}</span>
                  <span className={exceeded ? "text-green-400" : "text-red-400"}>
                    {exceeded ? `+${diff}% above` : `${Math.abs(diff)}% below`} threshold
                  </span>
                </div>

                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10" style={{ left: "50%" }} />
                  {exceeded ? (
                    <div
                      className="absolute h-3 bg-green-500 transition-all duration-700"
                      style={{ left: "50%", width: `${barWidth / 2}%` }}
                    />
                  ) : (
                    <div
                      className="absolute h-3 bg-red-500 transition-all duration-700"
                      style={{ right: "50%", width: `${barWidth / 2}%` }}
                    />
                  )}
                </div>

                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0%</span>
                  <span className="text-white/30">threshold ({THRESHOLD}%)</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DataCard>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Waves className="w-5 h-5 text-green-400" />
              {user?.farmName || "Smart Irrigation System"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
              <MapPin className="w-4 h-4" />
              Welcome back, {user?.name || "Farmer"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && !user.hasHardware && (
              <span className="text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full">
                Demo Mode
              </span>
            )}
            <button className="flex items-center gap-2 px-5 py-2 bg-green-500 text-black rounded-lg font-semibold hover:bg-green-400">
              Start New Cycle
            </button>
          </div>
        </header>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <DataCard>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Active Sensors</p>
              <Zap className="text-green-400" />
            </div>
            <p className="text-4xl mt-3 font-semibold">
              {stats.activeSensors}<span className="text-slate-500 text-xl"> / {sensors.length}</span>
            </p>
          </DataCard>

          <DataCard>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Plant Rows</p>
              <Target className="text-blue-400" />
            </div>
            <p className="text-4xl mt-3 font-semibold">{stats.totalRows}</p>
          </DataCard>

          <DataCard>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Alerts</p>
              <AlertTriangle className="text-orange-400" />
            </div>
            <p className="text-4xl mt-3 font-semibold">{stats.alerts}</p>
          </DataCard>

          <DataCard>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Average Moisture</p>
              <Droplets className="text-cyan-400" />
            </div>
            <p className="text-4xl mt-3 font-semibold">{stats.avgMoisture}%</p>
          </DataCard>
        </div>

        {/* THRESHOLD MONITOR */}
        <ThresholdMonitor />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* SENSOR TELEMETRY */}
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="text-green-400" />
              Live Sensor Telemetry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sensors.length === 0 ? (
                <div className="text-center py-12 col-span-2 text-slate-400">No sensors connected</div>
              ) : (
                sensors.map((sensor) => {
                  const status = getMoistureStatus(sensor.soilMoisture);
                  return (
                    <DataCard key={sensor.sensorId}>
                      <div className="flex justify-between mb-4">
                        <span className="text-green-400 text-sm font-semibold">{sensor.plantRow}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(sensor.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-4xl font-light">{sensor.soilMoisture}%</p>
                        <p className={`text-sm font-bold ${status.color}`}>{status.label}</p>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded mt-4">
                        <div className={`h-2 rounded ${status.bar}`} style={{ width: `${sensor.soilMoisture}%` }} />
                      </div>
                    </DataCard>
                  );
                })
              )}
            </div>
          </div>

          {/* IRRIGATION HISTORY */}
          <DataCard className="lg:col-span-4">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <History className="text-green-400" />
              Recent Cycles
            </h3>
            {recentIrrigation.length === 0 ? (
              <p className="text-slate-400 text-sm">No irrigation history yet</p>
            ) : (
              <div className="space-y-5">
                {recentIrrigation.map((log) => (
                  <div key={log._id}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{log.plantRow}</span>
                      <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-400">{log.duration} min cycle ({log.status})</p>
                  </div>
                ))}
              </div>
            )}
          </DataCard>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
