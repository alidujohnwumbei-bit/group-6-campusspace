import React from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { AlertCircle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export const EmergencyBanner: React.FC<{ onOpenEmergencyHub: () => void }> = ({ onOpenEmergencyHub }) => {
  const { emergencyRequests, resolveEmergencyRequest } = useClassroom();

  const activeRequests = emergencyRequests.filter(r => r.status === 'pending' || r.status === 'allocated' || r.status === 'dispatched');

  if (activeRequests.length === 0) return null;

  const topEmergency = activeRequests[0];

  return (
    <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/50 py-2.5 px-4 sm:px-6 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200">
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="font-semibold">
            Urgent Dispatch {topEmergency.ticketNumber}:
          </span>
          <span className="text-rose-700 dark:text-rose-300">
            {topEmergency.sourceClassroomCode ? `Room ${topEmergency.sourceClassroomCode} ` : ''}
            — {topEmergency.reason}
          </span>
          {topEmergency.allocatedClassroomCode && (
            <span className="font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              Swapped to {topEmergency.allocatedClassroomCode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {topEmergency.status === 'allocated' && (
            <button
              onClick={() => resolveEmergencyRequest(topEmergency.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Mark Resolved</span>
            </button>
          )}
          <button
            onClick={onOpenEmergencyHub}
            className="inline-flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-300 hover:underline"
          >
            <span>View Emergency Dispatch Console</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
