
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Waves,
  Zap,
  Droplets,
  AlertTriangle,
  MapPin,
  Clock,
  History,
  Target,
} from "lucide-react";

const Dashboard = ({ socket }) => {
  const [sensors, setSensors] = useState([]);
  const [recentIrrigation, setRecentIrrigation] = useState([]);
  const [stats, setStats] = useState({
    activeSensors: 0,
    totalRows: 0,
    alerts: 0,
    avgMoisture: 0,
  });

  useEffect(() => {
    fetchSensors();
    fetchRecentIrrigation();

    socket.on("sensorUpdate", (sensor) => {
      setSensors((prev) =>
        prev.map((s) => (s.sensorId === sensor.sensorId ? sensor : s))
      );
    });

    return () => {
      socket.off("sensorUpdate");
    };
  }, [socket]);

  useEffect(() => {
    const activeSensors = sensors.filter((s) => s.isActive).length;
    const totalRows = new Set(sensors.map((s) => s.plantRow)).size;
    const alerts = sensors.filter((s) => s.soilMoisture < 30).length;

    const avgMoisture =
      sensors.length > 0
        ? Math.round(
            sensors.reduce((sum, s) => sum + s.soilMoisture, 0) /
              sensors.length
          )
        : 0;

    setStats({ activeSensors, totalRows, alerts, avgMoisture });
  }, [sensors]);

  const fetchSensors = async () => {
    try {
      const response = await axios.get("/api/sensors");
      setSensors(response.data);
    } catch (error) {
      console.error("Error fetching sensors:", error);
    }
  };

  const fetchRecentIrrigation = async () => {
    try {
      const response = await axios.get("/api/irrigation/history");
      setRecentIrrigation(response.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching irrigation history:", error);
    }
  };

  const getMoistureStatus = (moisture) => {
    if (moisture < 30)
      return { label: "LOW", color: "text-red-400", bar: "bg-red-500" };

    if (moisture < 60)
      return { label: "OPTIONAL", color: "text-amber-400", bar: "bg-amber-500" };

    return { label: "GOOD", color: "text-green-400", bar: "bg-green-500" };
  };

  const DataCard = ({ children, className }) => (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg ${className}`}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <header className="flex justify-between items-center mb-10 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Waves className="w-5 h-5 text-green-400" />
              Smart Irrigation System
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
              <MapPin className="w-4 h-4" />
              Block A, Sector 4
            </div>
          </div>

          <button className="flex items-center gap-2 px-5 py-2 bg-green-500 text-black rounded-lg font-semibold hover:bg-green-400">
            Start New Cycle
          </button>
        </header>

        {/* TOP STATS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <DataCard>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Active Sensors</p>
              <Zap className="text-green-400" />
            </div>

            <p className="text-4xl mt-3 font-semibold">
              {stats.activeSensors}
              <span className="text-slate-500 text-xl">
                {" "}
                / {sensors.length}
              </span>
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

            <p className="text-4xl mt-3 font-semibold">
              {stats.avgMoisture}%
            </p>
          </DataCard>
        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* SENSOR DATA */}

          <div className="lg:col-span-8">

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="text-green-400" />
              Live Sensor Telemetry
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {sensors.length === 0 ? (
                <div className="text-center py-12 col-span-2 text-slate-400">
                  No sensors connected
                </div>
              ) : (
                sensors.map((sensor) => {
                  const status = getMoistureStatus(sensor.soilMoisture);

                  return (
                    <DataCard key={sensor.sensorId}>

                      <div className="flex justify-between mb-4">
                        <span className="text-green-400 text-sm font-semibold">
                          {sensor.plantRow}
                        </span>

                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(sensor.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-end">

                        <p className="text-4xl font-light">
                          {sensor.soilMoisture}%
                        </p>

                        <p className={`text-sm font-bold ${status.color}`}>
                          {status.label}
                        </p>
                      </div>

                      <div className="h-2 w-full bg-slate-800 rounded mt-4">
                        <div
                          className={`h-2 rounded ${status.bar}`}
                          style={{ width: `${sensor.soilMoisture}%` }}
                        />
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
              <p className="text-slate-400 text-sm">
                No irrigation history yet
              </p>
            ) : (
              <div className="space-y-5">
                {recentIrrigation.map((log) => (
                  <div key={log._id}>

                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">
                        {log.plantRow}
                      </span>

                      <span className="text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      {log.duration} min cycle ({log.status})
                    </p>
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

