import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { EmergencyRequest } from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Mic, 
  Volume2, 
  Building2, 
  Zap, 
  Search, 
  ArrowRight,
  Filter
} from 'lucide-react';

export const EmergencyDispatchView: React.FC<{ onOpenEmergencyModal: () => void }> = ({
  onOpenEmergencyModal,
}) => {
  const { emergencyRequests, resolveEmergencyRequest, classrooms } = useClassroom();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = emergencyRequests.filter((r) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTicket = r.ticketNumber.toLowerCase().includes(q);
      const matchReason = r.reason.toLowerCase().includes(q);
      const matchReq = r.requestedBy.toLowerCase().includes(q);
      const matchDept = r.department.toLowerCase().includes(q);
      const matchSource = r.sourceClassroomCode?.toLowerCase().includes(q);
      const matchAlloc = r.allocatedClassroomCode?.toLowerCase().includes(q);
      if (!matchTicket && !matchReason && !matchReq && !matchDept && !matchSource && !matchAlloc) return false;
    }
    if (statusFilter !== 'All' && r.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Emergency Classroom &amp; AV Dispatch Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rapid response hub for urgent equipment failures, classroom swaps, and priority room reassignments.
          </p>
        </div>

        <button
          onClick={onOpenEmergencyModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>New Emergency Request</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ticket #, reason, room, or instructor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Status:</span>
          {['All', 'pending', 'allocated', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No emergency tickets found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All classroom facilities operating nominally.</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isResolved = req.status === 'resolved';
            const isAllocated = req.status === 'allocated' || req.status === 'dispatched';
            const isPending = req.status === 'pending';

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {req.ticketNumber}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                      isResolved
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : isAllocated
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                    }`}>
                      {req.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {req.reason}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Requested by: <strong className="text-slate-700 dark:text-slate-300">{req.requestedBy}</strong> ({req.department})</span>
                    <span>·</span>
                    <span>Min Seating: <strong className="font-mono tabular-nums">{req.requiredCapacity} seats</strong></span>
                  </div>

                  {/* Reallocation flow highlight */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    {req.sourceClassroomCode && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        Source: {req.sourceClassroomCode}
                      </span>
                    )}
                    {req.allocatedClassroomCode && (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                          Allocated Standby: {req.allocatedClassroomCode}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mic className="w-3 h-3 text-emerald-500" />
                          <Volume2 className="w-3 h-3 text-emerald-500" />
                          Tested Audio Verified
                        </span>
                      </>
                    )}
                  </div>

                  {req.notes && (
                    <div className="text-xs text-slate-500 italic pt-1">
                      "{req.notes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {!isResolved && (
                    <button
                      onClick={() => resolveEmergencyRequest(req.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
