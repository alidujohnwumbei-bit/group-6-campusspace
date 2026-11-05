import React from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { LayoutGrid, Users, Calendar, Mic, AlertTriangle, History } from 'lucide-react';

interface BottomNavProps {
  onOpenBookingModal: () => void;
  onOpenEmergencyModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenBookingModal, onOpenEmergencyModal }) => {
  const { activeTab, setActiveTab, activeEmergencyCount } = useClassroom();

  interface TabItem {
    id: string;
    label: string;
    icon: React.ElementType;
    isAction?: boolean;
  }

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Rooms', icon: LayoutGrid },
    { id: 'occupied', label: 'Occupied', icon: Users },
    { id: 'book-action', label: 'Book', icon: Calendar, isAction: true },
    { id: 'audio-gear', label: 'AV Gear', icon: Mic },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onOpenBookingModal}
                className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] text-slate-700 dark:text-slate-300 active:scale-95 transition-transform"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm -mt-2">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5 text-indigo-600 dark:text-indigo-400">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
