import { useState } from 'react';
import { X, BookOpen, Droplets, Thermometer, Wind, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const sections = [
  {
    icon: Droplets,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Soil Moisture %',
    content: [
      { range: '100%', label: 'Sensor in air / not inserted', color: 'text-slate-400', note: 'Place the sensor prongs fully into soil to get a real reading.' },
      { range: '70–100%', label: 'Very wet / waterlogged', color: 'text-blue-400', note: 'Soil is saturated. No irrigation needed. Risk of root rot if prolonged.' },
      { range: '50–70%', label: 'Optimal moisture', color: 'text-green-400', note: 'Ideal range for most crops. Plants are happy.' },
      { range: '30–50%', label: 'Moderate — monitor closely', color: 'text-amber-400', note: 'Soil is drying out. Consider irrigation soon.' },
      { range: '0–30%', label: 'Dry — irrigate now', color: 'text-red-400', note: 'Critical level. Plants are stressed. Trigger irrigation immediately.' },
    ]
  },
  {
    icon: Thermometer,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    title: 'Temperature (°C)',
    content: [
      { range: '< 10°C', label: 'Too cold', color: 'text-blue-400', note: 'Plant growth slows significantly. Frost risk.' },
      { range: '15–25°C', label: 'Ideal for most crops', color: 'text-green-400', note: 'Optimal growth range for vegetables and herbs.' },
      { range: '25–35°C', label: 'Warm — increase watering', color: 'text-amber-400', note: 'Higher evaporation. Soil dries faster, irrigate more frequently.' },
      { range: '> 35°C', label: 'Heat stress', color: 'text-red-400', note: 'Plants may wilt. Shade and frequent irrigation recommended.' },
    ]
  },
  {
    icon: Wind,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Humidity (%)',
    content: [
      { range: '< 30%', label: 'Very dry air', color: 'text-red-400', note: 'High transpiration rate. Plants lose water faster.' },
      { range: '40–60%', label: 'Comfortable range', color: 'text-green-400', note: 'Good for most crops. Reduces disease risk.' },
      { range: '60–80%', label: 'High humidity', color: 'text-amber-400', note: 'Monitor for fungal diseases like mildew.' },
      { range: '> 80%', label: 'Very humid', color: 'text-red-400', note: 'High disease risk. Ensure good air circulation.' },
    ]
  },
  {
    icon: Zap,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'How the System Works',
    content: [
      { range: 'ESP32', label: 'Microcontroller', color: 'text-green-400', note: 'Reads sensors every 10 seconds and sends data via USB serial to your PC.' },
      { range: 'Serial Bridge', label: 'Node.js script', color: 'text-blue-400', note: 'Reads ESP32 output and POSTs it to the backend API.' },
      { range: 'Backend', label: 'Express + MongoDB', color: 'text-purple-400', note: 'Stores readings, triggers alerts, pushes live updates via Socket.io.' },
      { range: 'Dashboard', label: 'React frontend', color: 'text-cyan-400', note: 'Displays live data, threshold monitor, and irrigation history in real time.' },
    ]
  },
  {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Alerts & Thresholds',
    content: [
      { range: 'Moisture < 30%', label: 'Low moisture alert', color: 'text-red-400', note: 'System automatically sends an alert notification and flags the sensor card.' },
      { range: 'Threshold bar', label: 'Dashboard monitor', color: 'text-amber-400', note: 'Shows how far each sensor is from your target moisture level (default 50%).' },
      { range: 'Live badge', label: 'Real hardware', color: 'text-green-400', note: 'Green pulsing badge = real sensor data. Amber "Demo" = simulated data.' },
    ]
  },
];

const LearnPanel = ({ open, onClose }) => {
  const [active, setActive] = useState(0);

  if (!open) return null;

  const Section = sections[active];
  const Icon = Section.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-700 h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            <h2 className="font-bold text-white text-lg">Sensor Guide</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-2 p-4 border-b border-slate-800 overflow-x-auto">
          {sections.map((s, i) => {
            const TabIcon = s.icon;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                  active === i ? `${s.bg} ${s.color}` : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {s.title.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5 flex-1">
          <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${Section.bg}`}>
            <Icon className={`w-6 h-6 ${Section.color}`} />
            <h3 className="font-bold text-white">{Section.title}</h3>
          </div>

          <div className="space-y-4">
            {Section.content.map((item, i) => (
              <div key={i} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${item.color}`}>{item.range}</span>
                  <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">{item.label}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-300">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer tip */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300">
              <span className="text-green-400 font-semibold">Pro tip: </span>
              Always insert the soil sensor fully into the root zone (5–10cm deep) for accurate readings. Avoid rocks and air pockets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPanel;
