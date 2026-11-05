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
  Sparkles,
  School
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoAccounts } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('student@ucc.edu.gh');
  const [password, setPassword] = useState('student123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // When switching role tab, prefill the corresponding demo credentials
  const handleRoleTabClick = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    const demo = demoAccounts.find((a) => a.role === role);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  };

  const handleQuickLogin = (demo: typeof demoAccounts[0]) => {
    setSelectedRole(demo.role);
    setEmail(demo.email);
    setPassword(demo.password);
    setIsLoading(true);
    setTimeout(() => {
      login(demo.email, demo.password, demo.role);
      setIsLoading(false);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password, selectedRole);
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 mb-3 border border-indigo-400/20">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            UCC NLT Academic Portal
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200">
            Classroom &amp; AV Management System · NLT1 to NLT21
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] text-indigo-300 border border-white/10 font-mono">
            <School className="w-3 h-3 text-indigo-400" />
            <span>University of Cape Coast</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="mt-8 bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl sm:px-8 border border-white/10">
          
          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-2">
              Select Your Role:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => handleRoleTabClick('student')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'student'
                    ? 'bg-indigo-600 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabClick('lecturer')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'lecturer'
                    ? 'bg-indigo-600 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Lecturer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabClick('admin')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Admin</span>
              </button>
            </div>

            {/* Role Capabilities Quick Badge */}
            <div className="mt-2.5 text-[11px] text-indigo-300 bg-indigo-950/50 p-2.5 rounded-lg border border-indigo-800/40">
              {selectedRole === 'student' && (
                <span>
                  🎓 <strong>Student Permissions:</strong> View NLT1–21 classrooms, submit classroom reservation requests, request AV equipment, track request statuses, submit emergency room alerts.
                </span>
              )}
              {selectedRole === 'lecturer' && (
                <span>
                  👨‍🏫 <strong>Lecturer Permissions:</strong> View assigned courses (Dr. Adane, Dr. Nelly, Prof. Aggrey, Madam Akosua, Sir John, Dr. Mansu, Dr. Afful), review/approve classroom swaps, request priority AV.
                </span>
              )}
              {selectedRole === 'admin' && (
                <span>
                  🛡️ <strong>Admin Permissions:</strong> View &amp; approve/reject all requests, manage NLT classrooms, manage AV equipment fleet, manage departments &amp; lecturers/courses, view analytics.
                </span>
              )}
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@ucc.edu.gh"
                  className="block w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                1-Click Demo Accounts:
              </span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((demo) => {
                const isCurrentRole = selectedRole === demo.role;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleQuickLogin(demo)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isCurrentRole
                        ? 'bg-indigo-600/20 border-indigo-500/50 hover:bg-indigo-600/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center text-xs font-bold shrink-0">
                        {demo.role === 'student' && <GraduationCap className="w-4 h-4 text-emerald-400" />}
                        {demo.role === 'lecturer' && <BookOpen className="w-4 h-4 text-sky-400" />}
                        {demo.role === 'admin' && <ShieldCheck className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{demo.email}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-mono bg-white/10 text-indigo-300">
                            {demo.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Password: {demo.password}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300">
                      Login &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>© 2026 University of Cape Coast · Directorate of Academic Affairs &amp; IT Services</p>
        </div>
      </div>
    </div>
  );
};
