import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  ArrowLeftRight, 
  Mic, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Users, 
  Check, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { LECTURER_PERSONAS } from '../data/mockData';

interface LecturerDashboardProps {
  onOpenSwapModal: () => void;
  onOpenRequestAVModal: () => void;
  onOpenBookingModal: () => void;
  onOpenEmergencyModal: () => void;
  onViewClassrooms: () => void;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({
  onOpenSwapModal,
  onOpenRequestAVModal,
  onOpenBookingModal,
  onOpenEmergencyModal,
  onViewClassrooms,
}) => {
  const { 
    classrooms, 
    swapRequests, 
    updateSwapRequestStatus, 
    avRequests, 
    setSelectedRoom,
    setActiveTab
  } = useClassroom();
  const { activeLecturerPersona, setActiveLecturerPersona } = useAuth();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'my-courses' | 'swaps'>('all');

  // Swaps involving current active lecturer persona
  const incomingSwaps = swapRequests.filter(
    s => s.targetLecturer === activeLecturerPersona.name && s.status === 'pending'
  );
  const myOutgoingSwaps = swapRequests.filter(
    s => s.requesterLecturer === activeLecturerPersona.name
  );
  const allCompletedSwaps = swapRequests.filter(s => s.status !== 'pending');

  // Active room data for current lecturer
  const currentRoom = classrooms.find(r => r.code === activeLecturerPersona.activeRoom);

  const handleApproveSwap = (id: string) => {
    updateSwapRequestStatus(id, 'approved', 'Approved by course instructor.');
  };

  const handleDeclineSwap = (id: string) => {
    updateSwapRequestStatus(id, 'rejected', 'Room swap cannot be accommodated at this time.');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Lecturer Hero Banner & Persona Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>LECTURER FACULTY PORTAL</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex flex-wrap items-center gap-2">
              <span>{activeLecturerPersona.name}</span>
              <span className="text-sm font-normal text-indigo-300 font-mono">
                · {activeLecturerPersona.department}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200">
              Primary Course: <strong className="text-white font-mono">{activeLecturerPersona.courseCode}</strong> ({activeLecturerPersona.courseName}) · Designated Hall: <strong className="text-amber-400 font-mono">{activeLecturerPersona.activeRoom}</strong>
            </p>
          </div>

          {/* Lecturer Actions Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenSwapModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Propose Room Swap</span>
            </button>

            <button
              onClick={onOpenRequestAVModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 text-sky-400" />
              <span>Request AV Gear</span>
            </button>

            <button
              onClick={onOpenBookingModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Book Lecture Hall</span>
            </button>

            <button
              onClick={onOpenEmergencyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Urgent Relocation</span>
            </button>
          </div>
        </div>

        {/* Quick Persona Switcher Strip (Allowing user to view all 7 lecturers easily) */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Select Active Lecturer Persona to Test Assigned Courses:</span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {LECTURER_PERSONAS.map((persona) => {
              const isActive = activeLecturerPersona.name === persona.name;
              return (
                <button
                  key={persona.id}
                  onClick={() => setActiveLecturerPersona(persona)}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border flex items-center gap-2 ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                  }`}
                >
                  <span>{persona.name}</span>
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${isActive ? 'bg-slate-900 text-white' : 'bg-black/40 text-sky-300'}`}>
                    {persona.courseCode} ({persona.activeRoom})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Pending Classroom Swaps Alert Box (If any incoming swap request) */}
      {incomingSwaps.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-400/40 rounded-2xl p-5 shadow-sm text-slate-900 dark:text-white animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm mb-3">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Incoming Classroom Swap Proposals Requiring Your Approval ({incomingSwaps.length})</span>
          </div>

          <div className="space-y-3">
            {incomingSwaps.map((swap) => (
              <div 
                key={swap.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Swap Proposal from {swap.requesterLecturer}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      #{swap.requestNumber}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Wants to trade <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{swap.requesterRoomCode}</strong> ({swap.requesterCourseCode} - {swap.requesterCourseName}) for your designated hall <strong className="text-amber-600 dark:text-amber-400 font-mono">{swap.targetRoomCode}</strong> ({swap.targetCourseCode}).
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    📅 Date: {swap.date} · ⏰ Time: {swap.timeSlot} · Reason: &quot;{swap.reason}&quot;
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <button
                    onClick={() => handleApproveSwap(swap.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Swap</span>
                  </button>
                  <button
                    onClick={() => handleDeclineSwap(swap.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Assigned Courses Grid (User's 7 Official Courses) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Assigned Curriculum &amp; Courses Catalog</span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                7 Official Courses
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live schedule, assigned NLT theaters, audio-visual readiness, and direct actions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSwapModal}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Initiate New Swap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 7 Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {LECTURER_PERSONAS.map((persona) => {
            const isCurrent = activeLecturerPersona.name === persona.name;
            const room = classrooms.find(r => r.code === persona.activeRoom);

            return (
              <div
                key={persona.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                      {persona.courseCode}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                      {persona.courseName}
                    </h3>
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-600 text-white">
                      Your Course
                    </span>
                  )}
                </div>

                <div className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Lecturer:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{persona.name}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Department:</span>
                    <span>{persona.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-slate-400">Assigned Hall:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">{persona.activeRoom}</strong>
                    <span className="text-slate-400">({room?.capacity} seats · {room?.status})</span>
                  </div>
                </div>

                {/* Direct Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      if (room) {
                        setSelectedRoom(room);
                        onViewClassrooms();
                      }
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View {persona.activeRoom}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveLecturerPersona(persona);
                      onOpenSwapModal();
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    Swap Room
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Classroom Swap History & Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
              <span>Classroom Swap Activity Log</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Approved, completed, and pending room exchanges across NLT1 to NLT21
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {swapRequests.map((s) => (
            <div 
              key={s.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{s.requesterLecturer} ({s.requesterRoomCode}) &harr; {s.targetLecturer} ({s.targetRoomCode})</span>
                  <span className="text-[10px] font-mono text-slate-400">#{s.requestNumber}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Courses: {s.requesterCourseCode} &harr; {s.targetCourseCode} · {s.reason}
                </div>
              </div>

              <div>
                {s.status === 'approved' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Approved &amp; Swapped</span>
                  </span>
                )}
                {s.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Pending Target Approval</span>
                  </span>
                )}
                {s.status === 'rejected' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                    <XCircle className="w-3 h-3 text-rose-500" />
                    <span>Declined</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
