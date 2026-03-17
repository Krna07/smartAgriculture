import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, Home, AlertCircle, Loader2 } from 'lucide-react';
import Footer from '../components/Footer';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', farmName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.farmName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen farm-background-container flex flex-col">
      <div className="absolute inset-0 bg-slate-950/70" />

      {/* Form area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-4">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-slate-400 mt-1">Start monitoring your farm today</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" required value={form.name} onChange={set('name')}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="John Farmer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Farm Name <span className="text-slate-500">(optional)</span>
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" value={form.farmName} onChange={set('farmName')}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="Green Valley Farm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input type="email" required value={form.email} onChange={set('email')}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input type="password" required value={form.password} onChange={set('password')}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="Min. 6 characters" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-black font-bold py-3 rounded-lg transition-colors mt-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
              <p className="text-blue-400 text-xs">Demo sensors are auto-created for new accounts. Connect real hardware anytime.</p>
            </div>

            <p className="text-center text-slate-400 text-sm mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">Sign in</Link>
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
