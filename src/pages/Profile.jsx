import { useState } from 'react';
import { User, Mail, Leaf, Copy, Check, Pencil, Save, X, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Profile = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name:     user?.name     || '',
    farmName: user?.farmName || '',
    email:    user?.email    || '',
  });

  const copyId = () => {
    navigator.clipboard.writeText(user?.id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/api/auth/profile', {
        name:     form.name,
        farmName: form.farmName,
      });
      // Update auth context with new user data
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.reload(); // simplest way to refresh user context
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ icon: Icon, label, value, editable, field }) => (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      {editing && editable ? (
        <input
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none border border-slate-600 focus:border-green-500"
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        />
      ) : (
        <p className="text-white font-medium">{value}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account and hardware setup</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setError(''); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      {/* Profile fields */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="font-semibold text-slate-700 mb-4">Account Details</h2>
        <Field icon={User}  label="Full Name"  value={user?.name}     editable field="name" />
        <Field icon={Leaf}  label="Farm Name"  value={user?.farmName} editable field="farmName" />
        <Field icon={Mail}  label="Email"      value={user?.email}    editable={false} />
      </div>

      {/* Device ID section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-700 mb-1">Hardware Setup</h2>
        <p className="text-slate-500 text-sm mb-4">Use your User ID in the ESP32 sketch to link your sensor to this account.</p>

        <div className="bg-slate-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Your User ID
            </span>
            <button
              onClick={copyId}
              className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
          <p className="text-green-400 font-mono text-sm break-all">{user?.id}</p>
        </div>

        {/* ESP32 code snippet */}
        <div className="mt-4 bg-slate-950 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-2">Paste into your ESP32 sketch:</p>
          <pre className="text-xs text-cyan-300 font-mono whitespace-pre-wrap">{`const char* USER_ID = "${user?.id}";`}</pre>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-700">
            Never share your User ID publicly. Anyone with this ID can send sensor data to your account.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Profile;
