import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Lock, 
  Mail, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  CheckCircle2,
  X,
  HelpCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoAccounts, rememberedEmail, sessionTimeoutMessage, clearSessionTimeoutMessage } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState(rememberedEmail || 'admin@campus.edu');
  const [password, setPassword] = useState('Admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // Role selector handler
  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setErrorMessage(null);
    const demo = demoAccounts.find((a) => a.role === newRole);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  };

  // Quick 1-click preset account loader
  const handleQuickPreset = (acc: typeof demoAccounts[0]) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email, password, selectedRole, rememberMe);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Authentication service temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccessMessage(`Password recovery credentials & verification code sent to ${forgotEmail}. For demo: Admin123 / Lecturer123 / Student123.`);
    setTimeout(() => {
      setForgotSuccessMessage(null);
      setIsForgotModalOpen(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1128] via-[#0c1a40] to-[#050b1a] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden font-sans">
      
      {/* Background ambient elements */}
      <div className="absolute top-0 -left-20 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Session Timeout Warning Notification */}
        {sessionTimeoutMessage && (
          <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center justify-between gap-2 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{sessionTimeoutMessage}</span>
            </div>
            <button 
              onClick={clearSessionTimeoutMessage}
              className="text-amber-300 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. Header with CampusSpace Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/25 mb-3 border border-indigo-400/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            CampusSpace
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200">
            Classroom &amp; Facilities Management System · NLT Block
          </p>
        </div>

        {/* 2. Center Login Card */}
        <div className="mt-7 bg-[#0f1d3e]/90 backdrop-blur-xl py-8 px-5 shadow-2xl rounded-2xl sm:px-8 border border-indigo-500/20 shadow-indigo-950/50">
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Role Selector Dropdown (Student / Lecturer / Administrator) */}
            <div>
              <label className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1.5">
                Login Role / Access Level:
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="block w-full px-3 py-2.5 bg-[#081026] border border-indigo-500/30 rounded-xl text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="student">🎓 Student (View Available Rooms, Book, View Timetable)</option>
                  <option value="lecturer">👨‍🏫 Lecturer / Faculty (Check-in, Report Issues, Book, View Occupied)</option>
                  <option value="admin">🛡️ Administrator (Full Control, Manage Rooms, Users &amp; Approvals)</option>
                </select>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-indigo-100 mb-1">
                Campus Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@campus.edu"
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#081026] border border-indigo-500/30 rounded-xl text-xs sm:text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field (Show/Hide Eye Icon) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-indigo-100">
                  Password (6+ characters)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-[#081026] border border-indigo-500/30 rounded-xl text-xs sm:text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-indigo-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-indigo-500/40 bg-[#081026] text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me</span>
              </label>

              <span className="text-[11px] text-indigo-400/80 font-mono">
                Auto-timeout: 30 mins
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.99] disabled:opacity-60 shadow-indigo-600/30 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to CampusSpace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 3. Fast Default Account Loaders */}
          <div className="mt-6 pt-5 border-t border-indigo-500/20">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                Demo Accounts (Click to Fill):
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset(demoAccounts[0])}
                className={`p-2 rounded-xl border text-left transition-all ${
                  selectedRole === 'admin'
                    ? 'border-purple-500/60 bg-purple-500/20 text-white'
                    : 'border-indigo-500/20 bg-[#081026]/60 text-slate-300 hover:text-white hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">admin@campus.edu</div>
                <div className="text-[10px] text-indigo-300 font-mono">Admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset(demoAccounts[1])}
                className={`p-2 rounded-xl border text-left transition-all ${
                  selectedRole === 'lecturer'
                    ? 'border-sky-500/60 bg-sky-500/20 text-white'
                    : 'border-indigo-500/20 bg-[#081026]/60 text-slate-300 hover:text-white hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Lecturer</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">lecturer@campus.edu</div>
                <div className="text-[10px] text-indigo-300 font-mono">Lecturer123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset(demoAccounts[2])}
                className={`p-2 rounded-xl border text-left transition-all ${
                  selectedRole === 'student'
                    ? 'border-emerald-500/60 bg-emerald-500/20 text-white'
                    : 'border-indigo-500/20 bg-[#081026]/60 text-slate-300 hover:text-white hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">student@campus.edu</div>
                <div className="text-[10px] text-indigo-300 font-mono">Student123</div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-indigo-300/60">
          <p>Protected by CampusSpace Academic Security · University System</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#0f1d3e] border border-indigo-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Reset Account Password</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Enter your institutional campus email address to reset your login credentials.
            </p>

            {forgotSuccessMessage ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{forgotSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  required
                  className="w-full px-3 py-2 bg-[#081026] border border-indigo-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
                >
                  Send Password Reset Instructions
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
