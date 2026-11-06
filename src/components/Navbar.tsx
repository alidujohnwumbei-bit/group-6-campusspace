import React, { useState } from 'react';
import { useClassroom, AppTab } from '../context/ClassroomContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Building2, 
  AlertTriangle, 
  Moon, 
  Sun, 
  Clock, 
  Volume2, 
  RotateCcw,
  CalendarCheck,
  LogOut,
  User,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onOpenEmergencyModal: () => void;
  onOpenBookingModal: () => void;
  onOpenRequestRoomModal?: () => void;
  onOpenRequestAVModal?: () => void;
  onOpenSwapModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenEmergencyModal, 
  onOpenBookingModal,
  onOpenRequestRoomModal,
  onOpenRequestAVModal,
  onOpenSwapModal,
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    theme, 
    toggleTheme, 
    activeEmergencyCount, 
    simulatedTime, 
    setSimulatedTime,
    resetToDefaults,
  } = useClassroom();

  const { user, role, logout, switchRole } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Dynamic Navigation Links Tailored to Role
  const getNavLinks = (): { id: AppTab; label: string; badge?: number }[] => {
    if (role === 'student') {
      return [
        { id: 'dashboard', label: 'My Dashboard' },
        { id: 'overview', label: 'Available Rooms (9/21)' },
        { id: 'timetable', label: 'Timetable' },
        { id: 'student-requests', label: 'My Requests Status' },
        { id: 'emergency', label: 'Emergency Dispatch (View)', badge: activeEmergencyCount },
      ];
    }

    if (role === 'lecturer') {
      return [
        { id: 'dashboard', label: 'Faculty Dashboard' },
        { id: 'occupied', label: 'Occupied Rooms (6/21)' },
        { id: 'assigned-courses', label: 'Assigned Courses (7)' },
        { id: 'classroom-swaps', label: 'Room Swaps' },
        { id: 'overview', label: 'All Rooms (NLT1-21)' },
        { id: 'timetable', label: 'Timetable' },
        { id: 'emergency', label: 'Emergency Hub', badge: activeEmergencyCount },
      ];
    }

    // Admin Navigation
    return [
      { id: 'dashboard', label: 'Admin Dashboard' },
      { id: 'overview', label: 'Classrooms (NLT1-21)' },
      { id: 'approvals', label: 'Approvals Hub' },
      { id: 'history', label: 'Reserved (3/21) & Bookings' },
      { id: 'audio-gear', label: 'AV Gear' },
      { id: 'timetable', label: 'Timetable' },
      { id: 'emergency', label: 'Emergency Dispatch', badge: activeEmergencyCount },
    ];
  };

  const navLinks = getNavLinks();

  const getRoleBadgeStyle = (userRole?: UserRole | null) => {
    switch (userRole) {
      case 'student':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'lecturer':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getRoleIcon = (userRole?: UserRole | null) => {
    switch (userRole) {
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'lecturer':
        return <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'admin':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Zone 1: Wordmark Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
                  CampusSpace
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
                  NLT Block · NLT1 to NLT21
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Dynamic Role Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors relative ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: User Role Switcher, Quick Actions & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Logged-In User Profile & 1-Click Role Switcher */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition-all"
                  title="Click to view profile or switch demo personas"
                >
                  <div className="w-7 h-7 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                    {getRoleIcon(role)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                      <span className="truncate max-w-[130px] font-semibold">{user.name}</span>
                      <span className="text-slate-400 font-normal">·</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${getRoleBadgeStyle(role)}`}>
                        {role === 'lecturer' ? 'Faculty' : role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-mono">
                      {role === 'student' ? `${user.studentId || 'PS/ITC/23/0042'}` : (role === 'lecturer' ? 'Senior Faculty' : 'Administrator')}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {/* Role Switcher Dropdown */}
                {isRoleDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 text-xs animate-in fade-in duration-100"
                    onMouseLeave={() => setIsRoleDropdownOpen(false)}
                  >
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role Mode:
                    </div>
                    
                    <button
                      onClick={() => {
                        switchRole('student');
                        setActiveTab('dashboard');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                        role === 'student'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-500" />
                        <span>Student (Kwame)</span>
                      </span>
                      {role === 'student' && <span className="text-[10px] font-mono text-emerald-600 font-bold">Active</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchRole('lecturer');
                        setActiveTab('dashboard');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                        role === 'lecturer'
                          ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-sky-500" />
                        <span>Lecturer (Dr. Adane)</span>
                      </span>
                      {role === 'lecturer' && <span className="text-[10px] font-mono text-sky-600 font-bold">Active</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchRole('admin');
                        setActiveTab('dashboard');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                        role === 'admin'
                          ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-500" />
                        <span>Admin (Director)</span>
                      </span>
                      {role === 'admin' && <span className="text-[10px] font-mono text-purple-600 font-bold">Active</span>}
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Emergency Request Button */}
            <button
              onClick={onOpenEmergencyModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs active:scale-95 focus-visible:outline-none"
              title="Request emergency classroom swap or allocation"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap hidden sm:inline">Emergency</span>
            </button>

            {/* Dark/Light Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Reset Seed Data */}
            <button
              onClick={resetToDefaults}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset demo data to default initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Top Right Prominent Logout Button */}
            {user && (
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 transition-colors shadow-xs active:scale-95"
                title="Log out of CampusSpace"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
