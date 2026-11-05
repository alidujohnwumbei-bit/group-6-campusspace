import React from 'react';
import { Classroom } from '../types';
import { useClassroom } from '../context/ClassroomContext';
import { 
  Users, 
  Mic, 
  Volume2, 
  Tv, 
  Wind, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CalendarX,
  Info,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface ClassroomCardProps {
  classroom: Classroom;
  onSelectRoom: (room: Classroom) => void;
  onBookRoom: (room: Classroom) => void;
  onEmergencySwap: (room: Classroom) => void;
  onCancelClass?: (room: Classroom) => void;
}

export const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
  onSelectRoom,
  onBookRoom,
  onEmergencySwap,
  onCancelClass,
}) => {
  const { microphones, speakers, simulatedTime } = useClassroom();

  // Find microphones and speakers for this classroom
  const roomMics = microphones.filter((m) => m.classroomId === classroom.id);
  const roomSpeakers = speakers.filter((s) => s.classroomId === classroom.id);

  // AV Readiness summary
  const micLowBattery = roomMics.some((m) => m.status === 'low-battery');
  const micFaulty = roomMics.some((m) => m.status === 'repair-needed');
  const speakerIssue = roomSpeakers.some((s) => s.status === 'buzzing-issue' || s.status === 'offline');

  // Status visual styles
  const getStatusDisplay = () => {
    switch (classroom.status) {
      case 'available':
        return {
          label: 'Available Now',
          textColor: 'text-emerald-700 dark:text-emerald-400',
          dotBg: 'bg-emerald-500',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
        };
      case 'occupied':
        return {
          label: 'Occupied · Live Session',
          textColor: 'text-amber-700 dark:text-amber-400',
          dotBg: 'bg-amber-500',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        };
      case 'reserved':
        return {
          label: 'Reserved · Scheduled',
          textColor: 'text-purple-700 dark:text-purple-400',
          dotBg: 'bg-purple-500',
          badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
        };
      case 'emergency-standby':
        return {
          label: 'Emergency Standby Reserve',
          textColor: 'text-indigo-700 dark:text-indigo-400',
          dotBg: 'bg-indigo-500',
          badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
        };
      case 'maintenance':
        return {
          label: 'Under Maintenance',
          textColor: 'text-rose-700 dark:text-rose-400',
          dotBg: 'bg-rose-500',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
        };
    }
  };

  const statusInfo = getStatusDisplay();

  // Compute countdown if occupied
  const getRemainingTime = () => {
    if (!classroom.currentSession) return null;
    const [currH, currM] = simulatedTime.split(':').map(Number);
    const [endH, endM] = classroom.currentSession.endTime.split(':').map(Number);
    const currTotal = currH * 60 + currM;
    const endTotal = endH * 60 + endM;
    const diff = endTotal - currTotal;
    if (diff <= 0) return 'Ending now';
    return `${diff}m left`;
  };

  const remaining = getRemainingTime();

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-xl p-4.5 hover:shadow-md transition-all flex flex-col justify-between ${
      classroom.status === 'occupied' 
        ? 'border-amber-200 dark:border-amber-900/60' 
        : classroom.status === 'reserved'
        ? 'border-purple-200 dark:border-purple-900/60'
        : classroom.status === 'emergency-standby'
        ? 'border-indigo-200 dark:border-indigo-900/60'
        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                {classroom.code}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md font-medium capitalize bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {classroom.type.replace('-', ' ')}
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-1">
              {classroom.name}
            </h3>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.badgeBg}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotBg} animate-pulse`} />
            <span className="font-semibold text-[11px] whitespace-nowrap">{statusInfo.label}</span>
          </div>
        </div>

        {/* Level / Capacity Metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 flex-wrap">
          <span className="font-medium text-slate-700 dark:text-slate-300">Level {classroom.floor}</span>
          <span aria-hidden="true">·</span>
          <span>{classroom.building.split('·')[1]?.trim() || classroom.building}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            {classroom.capacity} seats
          </span>
        </div>

        {/* Current Active Session or Reservation Banner */}
        {classroom.currentSession ? (
          <div className={`mb-3 p-3 rounded-lg border text-xs ${
            classroom.status === 'reserved'
              ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50'
              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
          }`}>
            <div className="flex items-center justify-between font-medium mb-1">
              <span className={`font-mono font-bold text-xs ${
                classroom.status === 'reserved' ? 'text-purple-700 dark:text-purple-300' : 'text-amber-800 dark:text-amber-300'
              }`}>
                {classroom.currentSession.courseCode}
              </span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3 text-slate-400" />
                {classroom.currentSession.startTime} - {classroom.currentSession.endTime}
                {classroom.status === 'occupied' && (
                  <span className="text-amber-700 dark:text-amber-400 font-bold ml-1">({remaining})</span>
                )}
              </span>
            </div>
            
            <div className="text-slate-900 dark:text-white font-semibold truncate">
              {classroom.currentSession.courseName}
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span className="truncate max-w-[170px]">{classroom.currentSession.instructor}</span>
              <span className="font-mono tabular-nums font-medium">
                {classroom.currentSession.attendeeCount} students
              </span>
            </div>
          </div>
        ) : classroom.status === 'emergency-standby' ? (
          <div className="mb-3 p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-[11px] leading-tight">
              Pre-warmed standby hall with tested dual mics and line array for rapid emergency dispatch.
            </span>
          </div>
        ) : classroom.status === 'maintenance' ? (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-[11px] leading-tight">
              Under technical service. Scheduled AV &amp; climate calibration in progress.
            </span>
          </div>
        ) : (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <span className="text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Vacant &amp; Ready for Immediate Booking
            </span>
            <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase">
              Free Slot
            </span>
          </div>
        )}

        {/* AV Audio & Facility Health Checks */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1 text-[11px]">
              <Mic className="w-3 h-3 text-slate-400" />
              <span>Microphones:</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              {roomMics.length > 0 ? (
                <>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{roomMics.length}</span>
                  {micFaulty ? (
                    <span className="text-rose-600 font-bold">Faulty</span>
                  ) : micLowBattery ? (
                    <span className="text-amber-600 font-medium">Low Batt</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">Operational</span>
                  )}
                </>
              ) : (
                <span className="text-slate-400">None</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1 text-[11px]">
              <Volume2 className="w-3 h-3 text-slate-400" />
              <span>Speakers:</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              {speakerIssue ? (
                <span className="text-rose-600 font-bold">Buzzing</span>
              ) : (
                <span className="text-emerald-600 font-medium">
                  {roomSpeakers[0] ? `${roomSpeakers[0].outputDecibels} dB` : 'Operational'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Tv className="w-2.5 h-2.5" />
              {classroom.projectorDisplay.replace(/-/g, ' ')}
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-2.5 h-2.5" />
              AC {classroom.airConditioning}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        
        {/* Info / Details Button */}
        <button
          onClick={() => onSelectRoom(classroom)}
          className="py-1.5 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1"
          title="Inspect classroom details & AV specs"
        >
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Details</span>
        </button>

        {/* Dynamic Action 1: Book / Emergency Swap */}
        {classroom.status === 'available' ? (
          <button
            onClick={() => onBookRoom(classroom)}
            className="flex-1 py-1.5 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Class</span>
          </button>
        ) : classroom.status === 'emergency-standby' ? (
          <div className="flex-1 flex gap-1.5">
            <button
              onClick={() => onBookRoom(classroom)}
              className="flex-1 py-1.5 px-2 text-[11px] font-semibold text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors text-center"
            >
              Book
            </button>
            <button
              onClick={() => onEmergencySwap(classroom)}
              className="flex-1 py-1.5 px-2 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Dispatch</span>
            </button>
          </div>
        ) : (
          /* Occupied or Reserved Classroom Actions */
          <div className="flex-1 flex items-center gap-1.5">
            {/* CANCEL CLASS BUTTON - Clear & Direct */}
            <button
              onClick={() => onCancelClass ? onCancelClass(classroom) : onEmergencySwap(classroom)}
              className="flex-1 py-1.5 px-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center justify-center gap-1 active:scale-95"
              title={`Cancel class in ${classroom.code} and release to Available`}
            >
              <CalendarX className="w-3.5 h-3.5" />
              <span>{classroom.status === 'reserved' ? 'Cancel Res' : 'Cancel Class'}</span>
            </button>

            {/* Emergency Swap / Relocate Button */}
            <button
              onClick={() => onEmergencySwap(classroom)}
              className="py-1.5 px-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 rounded-lg border border-amber-200 dark:border-amber-900/50 transition-colors flex items-center justify-center gap-1"
              title="Request emergency technician or room swap"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Emergency</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
