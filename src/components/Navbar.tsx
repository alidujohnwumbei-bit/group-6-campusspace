import React from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { 
  Building2, 
  AlertTriangle, 
  Moon, 
  Sun, 
  Clock, 
  Volume2, 
  RotateCcw,
  CalendarCheck
} from 'lucide-react';

interface NavbarProps {
  onOpenEmergencyModal: () => void;
  onOpenBookingModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEmergencyModal, onOpenBookingModal }) => {
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

  const navLinks = [
    { id: 'overview', label: 'Classrooms' },
    { id: 'occupied', label: 'Occupied Live' },
    { id: 'timetable', label: 'Timetable Matrix' },
    { id: 'book', label: 'Book Room' },
    { id: 'history', label: 'Bookings & Cancellations' },
    { id: 'audio-gear', label: 'Mics & Speakers' },
    { id: 'emergency', label: 'Emergency Hub' },
  ] as const;

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          
          {/* Zone 1: Wordmark Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('overview')}
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
                  NLT Block Manager · NLT1 to NLT21
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === 'book') {
                      onOpenBookingModal();
                    } else if (link.id === 'emergency') {
                      setActiveTab('emergency');
                    } else {
                      setActiveTab(link.id as typeof activeTab);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors relative ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                  {link.id === 'emergency' && activeEmergencyCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                      {activeEmergencyCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & Utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Simulated Campus Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Simulated:</span>
              <select
                value={simulatedTime}
                onChange={(e) => setSimulatedTime(e.target.value)}
                className="bg-transparent font-mono text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                title="Change simulated time to test session countdowns"
              >
                <option value="09:15" className="dark:bg-slate-900">09:15 AM</option>
                <option value="10:15" className="dark:bg-slate-900">10:15 AM</option>
                <option value="10:50" className="dark:bg-slate-900">10:50 AM (Ending Soon)</option>
                <option value="13:30" className="dark:bg-slate-900">01:30 PM</option>
                <option value="15:30" className="dark:bg-slate-900">03:30 PM</option>
              </select>
            </div>

            {/* Emergency Request Button */}
            <button
              onClick={onOpenEmergencyModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Request emergency classroom swap or allocation"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Emergency Room</span>
            </button>

            {/* Quick Book Button (Desktop) */}
            <button
              onClick={onOpenBookingModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-95 whitespace-nowrap"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Book Class</span>
            </button>

            {/* Dark/Light Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Reset Seed Data */}
            <button
              onClick={resetToDefaults}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset demo data to default initial state"
              aria-label="Reset demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
