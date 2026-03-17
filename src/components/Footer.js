import { Leaf, Mail, Github, Instagram, Twitter, Cpu, Wifi, Database, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-md mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">SmartAgri</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Precision irrigation intelligence powered by IoT sensors. Monitor, automate, and optimize your farm's water usage in real time.
            </p>
            <div className="flex items-center gap-3">
              <a href="mailto:contact@smartagri.io" aria-label="Email"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-green-500 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-green-500 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-green-500 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-green-500 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Dashboard' },
                { to: '/sensors', label: 'Sensor Monitoring' },
                { to: '/irrigation', label: 'Irrigation Control' },
                { to: '/notifications', label: 'Notifications' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-green-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Tech Stack</h4>
            <ul className="space-y-2.5">
              {[
                { icon: Cpu,      label: 'React + Tailwind CSS' },
                { icon: Database, label: 'Node.js + MongoDB' },
                { icon: Wifi,     label: 'Socket.io Real-time' },
                { icon: Shield,   label: 'JWT Authentication' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-slate-400 text-sm">
                  <Icon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">Email</p>
                <a href="mailto:contact@smartagri.io" className="text-slate-400 hover:text-green-400 text-sm transition-colors">
                  contact@smartagri.io
                </a>
              </li>
              <li>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">GitHub</p>
                <a href="https://github.com/smartagri" target="_blank" rel="noreferrer"
                  className="text-slate-400 hover:text-green-400 text-sm transition-colors">
                  github.com/smartagri
                </a>
              </li>
              <li>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">Status</p>
                <span className="flex items-center gap-1.5 text-sm text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  All systems operational
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {year} SmartAgri. Built for precision agriculture.
          </p>
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            IoT-powered · Real-time · Secure
          </div>
        </div>

      </div>
    </footer>
  );
}
