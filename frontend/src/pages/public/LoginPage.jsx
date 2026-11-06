import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login, getDashboardPath } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        addToast(`Welcome back, ${res.user.fullName}!`, 'success');
        const redirectPath = location.state?.from?.pathname || getDashboardPath(res.user.roleName);
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMessage(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo helper
  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-2xl bg-blood-700 flex items-center justify-center text-white shadow-lg shadow-blood-700/30 group-hover:bg-blood-800 transition-colors">
            <Droplet className="w-7 h-7 fill-current" />
          </div>
          <span className="text-3xl font-black text-navy-950 tracking-tight">
            Blood<span className="text-blood-700">Bridge</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-navy-950 tracking-tight">
          Unified Account Sign In
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Enter your credentials to access your role-based dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-slate-200/80">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blood-700 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact system administration at support@bloodbridge.org to reset your credentials.'); }} className="text-xs font-semibold text-blood-700 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blood-700 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blood-700 focus:ring-blood-700 border-slate-300 mr-2"
                />
                Remember me on this browser
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blood-700 hover:bg-blood-800 text-white font-bold rounded-xl text-sm shadow-lg shadow-blood-700/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to BloodBridge'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Demo Profiles
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('patient.john@bloodbridge.org', 'Patient@123')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-left transition-colors"
              >
                <span className="block text-[10px] text-blood-700 font-bold uppercase">Patient</span>
                Johnathan Archer
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('donor.sarah@bloodbridge.org', 'Donor@123')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-left transition-colors"
              >
                <span className="block text-[10px] text-blood-700 font-bold uppercase">Donor (O+)</span>
                Sarah Jenkins
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('citygeneral@bloodbridge.org', 'Hospital@123')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-left transition-colors"
              >
                <span className="block text-[10px] text-blood-700 font-bold uppercase">Hospital Admin</span>
                City General Hospital
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@bloodbridge.org', 'Admin@123')}
                className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-left transition-colors"
              >
                <span className="block text-[10px] text-blood-700 font-bold uppercase">System Admin</span>
                Platform Console
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blood-700 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
