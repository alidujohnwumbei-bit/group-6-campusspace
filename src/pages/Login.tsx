import React, { useState } from 'react';
import { useAuth, CampusRole } from '../context/AuthContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  ArrowRight, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface LoginProps {
  onNavigate?: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();

  const [role, setRole] = useState<CampusRole>('Administrator');
  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('Admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(email, password, role);
      if (res.success) {
        handleNavigate('/');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click Fill Demo Accounts
  const handleQuickDemo = (demoRole: CampusRole, demoEmail: string, demoPass: string) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows matching dark blue CampusSpace */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/30 text-white mb-3">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          CampusSpace
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Academic Classroom &amp; Resource Management System
        </p>
      </div>

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Sign In to Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Select your campus role and enter your verified credentials.
          </p>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CampusRole)}
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white appearance-none cursor-pointer transition-all"
              >
                <option value="Administrator">Administrator (Director &amp; Full Access)</option>
                <option value="Lecturer">Lecturer (Faculty Teaching Staff)</option>
                <option value="Student">Student (Classrooms &amp; Bookings)</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                {role === 'Administrator' ? (
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                ) : role === 'Lecturer' ? (
                  <BookOpen className="w-4 h-4 text-sky-400" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] text-slate-500">Min 6 characters</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to /signup */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <a
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('/signup');
              }}
              className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              Sign up here
            </a>
          </p>
        </div>

        {/* 1-Click Demo Accounts Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Instant Test Accounts:</span>
            </span>
            <span className="text-slate-500 text-[10px]">1-Click load</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('Administrator', 'admin@campus.edu', 'Admin123')}
              className={`p-2 rounded-lg text-[11px] font-mono border text-center transition-all ${
                role === 'Administrator'
                  ? 'bg-purple-950/50 border-purple-500/50 text-purple-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Lecturer', 'lecturer@campus.edu', 'Lecturer123')}
              className={`p-2 rounded-lg text-[11px] font-mono border text-center transition-all ${
                role === 'Lecturer'
                  ? 'bg-sky-950/50 border-sky-500/50 text-sky-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Lecturer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Student', 'student@campus.edu', 'Student123')}
              className={`p-2 rounded-lg text-[11px] font-mono border text-center transition-all ${
                role === 'Student'
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Student
            </button>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center mt-8 text-xs text-slate-500">
        NLT Classroom Complex · NLT1 to NLT21 · CampusSpace Security
      </div>

    </div>
  );
};
