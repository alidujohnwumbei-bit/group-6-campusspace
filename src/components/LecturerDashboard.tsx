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
  UserCheck,
  Projector,
  LogIn,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { LECTURER_PERSONAS } from '../data/mockData';

interface LecturerDashboardProps {
  onOpenSwapModal: () => void;
  onOpenRequestAVModal: () => void;
  onOpenBookingModal: () => void;
  onOpenEmergencyModal: () => void;
  onOpenReportIssueModal: (roomCode?: string) => void;
  onViewClassrooms: () => void;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({
  onOpenSwapModal,
  onOpenRequestAVModal,
  onOpenBookingModal,
  onOpenEmergencyModal,
  onOpenReportIssueModal,
  onViewClassrooms,
}) => {
  const { 
    classrooms, 
    swapRequests, 
    updateSwapRequestStatus, 
    setSelectedRoom,
    vacateSession,
  } = useClassroom();
  const { activeLecturerPersona, setActiveLecturerPersona, user } = useAuth();

  // Faculty Check-in state
  const [checkedInRooms, setCheckedInRooms] = useState<Record<string, { time: string; attendees: number }>>({
    NLT2: { time: '09:05 AM', attendees: 102 },
  });

  // Swaps involving current active lecturer persona
  const incomingSwaps = swapRequests.filter(
    s => s.targetLecturer === activeLecturerPersona.name && s.status === 'pending'
  );

  // Active room data for current lecturer
  const currentRoom = classrooms.find(r => r.code === activeLecturerPersona.activeRoom);
  const isCurrentlyCheckedIn = !!checkedInRooms[activeLecturerPersona.activeRoom];

  // Occupied classrooms (6/21)
  const occupiedClassrooms = classrooms.filter(r => r.status === 'occupied');

  const handleToggleCheckIn = (roomCode: string) => {
    if (checkedInRooms[roomCode]) {
      // Check-out
      const next = { ...checkedInRooms };
      delete next[roomCode];
      setCheckedInRooms(next);
    } else {
      // Check-in
      setCheckedInRooms({
        ...checkedInRooms,
        [roomCode]: {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attendees: (currentRoom?.currentSession?.attendeeCount || 90) + 5,
        },
      });
    }
  };

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
              <span>LECTURER / FACULTY PORTAL</span>
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

          {/* Lecturer Actions Strip (Book, Check-in, Report Issues, Swaps) */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Check-in / Start Lecture Button */}
            <button
              onClick={() => handleToggleCheckIn(activeLecturerPersona.activeRoom)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 ${
                isCurrentlyCheckedIn
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isCurrentlyCheckedIn ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Checked-In ({activeLecturerPersona.activeRoom})</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Check-In to Lecture</span>
                </>
              )}
            </button>

            {/* Report Issue Button (Projector Blackout / Mic Failure) */}
            <button
              onClick={() => onOpenReportIssueModal(activeLecturerPersona.activeRoom)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all active:scale-95"
              title="Report classroom issue like Projector Blackout or sound failure"
            >
              <Projector className="w-4 h-4" />
              <span>Report Issue</span>
            </button>

            {/* Propose Room Swap */}
            <button
              onClick={onOpenSwapModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4 text-indigo-300" />
              <span>Swap Room</span>
            </button>

            {/* Book Lecture Hall */}
            <button
              onClick={onOpenBookingModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Book Room</span>
            </button>

            {/* Request AV */}
            <button
              onClick={onOpenRequestAVModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 text-sky-400" />
              <span>Request AV</span>
            </button>
          </div>
        </div>

        {/* Quick Persona Switcher Strip */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Switch Active Lecturer Persona:</span>
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

      {/* 2. Active Session & Check-in Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Active Lecture Session in {activeLecturerPersona.activeRoom}
              </h2>
              {isCurrentlyCheckedIn ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>SESSION ACTIVE · CHECKED-IN</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Ready for Check-in
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Course: <strong className="text-indigo-600 dark:text-indigo-400">{activeLecturerPersona.courseCode}</strong> ({activeLecturerPersona.courseName}) · Instructor: {activeLecturerPersona.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleCheckIn(activeLecturerPersona.activeRoom)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-xs ${
                isCurrentlyCheckedIn
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 hover:bg-rose-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isCurrentlyCheckedIn ? 'Check-Out / End Lecture' : 'Confirm Check-In Now'}
            </button>
            <button
              onClick={() => onOpenReportIssueModal(activeLecturerPersona.activeRoom)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-600/10 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-600/20"
            >
              Report Malfunction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400">Classroom Block</div>
            <div className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
              {activeLecturerPersona.activeRoom}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{currentRoom?.building}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400">Estimated Attendees</div>
            <div className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
              {isCurrentlyCheckedIn ? checkedInRooms[activeLecturerPersona.activeRoom]?.attendees : (currentRoom?.currentSession?.attendeeCount || 85)} Students
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Capacity: {currentRoom?.capacity} seats</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400">Audio / Microphones</div>
            <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
              Operational (92%)
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Shure ULXD4 Wireless</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-slate-400">Projector Status</div>
            <div className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">
              Dual Laser 4K
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">AC: Optimal Cooling</div>
          </div>
        </div>
      </div>

      {/* 3. Occupied Classrooms View (6/21) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" />
              <span>Live Occupied Rooms ({occupiedClassrooms.length}/21)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time faculty sessions currently in progress across the NLT complex
            </p>
          </div>
          <button
            onClick={onViewClassrooms}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Classrooms Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {occupiedClassrooms.map((room) => {
            const session = room.currentSession;
            return (
              <div
                key={room.id}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/20 dark:bg-rose-950/10 hover:border-rose-300 dark:hover:border-rose-800 transition-all text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                      {room.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                      {session?.courseCode}: {session?.courseName}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white uppercase">
                    Occupied
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                  <div>
                    Lecturer: <strong className="text-slate-800 dark:text-slate-200">{session?.instructor}</strong>
                  </div>
                  <div>
                    Department: <span>{session?.department}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    ⏰ Time: {session?.startTime} - {session?.endTime} · {session?.attendeeCount} / {room.capacity} seats
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      onViewClassrooms();
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    View Room Details &rarr;
                  </button>

                  <button
                    onClick={() => onOpenReportIssueModal(room.code)}
                    className="text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Report Issue</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Incoming Classroom Swaps Alert Box (If any) */}
      {incomingSwaps.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-400/40 rounded-2xl p-5 shadow-sm text-slate-900 dark:text-white animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm mb-3">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Classroom Swap Proposals Requiring Your Approval ({incomingSwaps.length})</span>
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
                    Wants to trade <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{swap.requesterRoomCode}</strong> ({swap.requesterCourseCode}) for your designated hall <strong className="text-amber-600 dark:text-amber-400 font-mono">{swap.targetRoomCode}</strong> ({swap.targetCourseCode}).
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

      {/* 5. Assigned Courses Grid (7 Official Courses) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Assigned Curriculum &amp; Courses Catalog (7)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assigned NLT theaters, instructors, and quick swap actions
            </p>
          </div>
          <button
            onClick={onOpenSwapModal}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Propose New Swap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

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
                  <div>Lecturer: <strong className="text-slate-800 dark:text-slate-200">{persona.name}</strong></div>
                  <div>Department: <span>{persona.department}</span></div>
                  <div className="font-mono text-[11px]">
                    Designated: <strong className="text-indigo-600 dark:text-indigo-400">{persona.activeRoom}</strong> ({room?.capacity} seats)
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      if (room) {
                        setSelectedRoom(room);
                        onViewClassrooms();
                      }
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    View Room &rarr;
                  </button>
                  <button
                    onClick={() => {
                      setActiveLecturerPersona(persona);
                      onOpenSwapModal();
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
                  >
                    Swap Room
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
