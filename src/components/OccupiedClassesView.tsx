import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { 
  Users, 
  Clock, 
  Mic, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  LogOut, 
  PlusCircle, 
  Building2, 
  Radio, 
  HelpCircle
} from 'lucide-react';
import { Classroom } from '../types';

export const OccupiedClassesView: React.FC<{
  onOpenEmergencyModalWithRoom: (room: Classroom) => void;
  onCancelClass?: (room: Classroom) => void;
}> = ({ onOpenEmergencyModalWithRoom, onCancelClass }) => {
  const { 
    classrooms, 
    microphones, 
    speakers, 
    simulatedTime, 
    extendSession, 
    vacateSession,
    cancelClassroomSession,
    updateMicrophone,
    updateSpeaker,
    playAudioDiagnostic
  } = useClassroom();

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const occupiedRooms = classrooms.filter((r) => r.status === 'occupied' && r.currentSession);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleExtend = (room: Classroom) => {
    extendSession(room.id, 15);
    showToast(`Extended session for ${room.code} by +15 minutes.`);
  };

  const handleVacate = (room: Classroom) => {
    if (onCancelClass) {
      onCancelClass(room);
    } else {
      vacateSession(room.id);
      showToast(`Classroom ${room.code} vacated and available.`);
    }
  };

  const handleReportAudioGlitch = (room: Classroom) => {
    // Flag the mic/speaker in this room
    const roomMics = microphones.filter(m => m.classroomId === room.id);
    if (roomMics.length > 0) {
      updateMicrophone(roomMics[0].id, { status: 'repair-needed', notes: 'Reported glitch during active class' });
    }
    showToast(`AV glitch logged for ${room.code}. Emergency swap recommended.`);
    onOpenEmergencyModalWithRoom(room);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Live Occupied Classrooms
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time monitoring of ongoing lectures, attendee headcounts, countdown timers, and active AV equipment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Active Classes: <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">{occupiedRooms.length}</span>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between animate-fade-in">
          <span>{notificationMsg}</span>
          <button onClick={() => setNotificationMsg(null)} className="text-indigo-500 hover:text-indigo-800 font-bold">×</button>
        </div>
      )}

      {occupiedRooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No classrooms currently occupied
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            All lecture halls and labs are currently vacant and available for booking or scheduled maintenance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {occupiedRooms.map((room) => {
            const session = room.currentSession!;
            
            // Calculate time remaining
            const [currH, currM] = simulatedTime.split(':').map(Number);
            const [endH, endM] = session.endTime.split(':').map(Number);
            const [startH, startM] = session.startTime.split(':').map(Number);
            
            const currTotal = currH * 60 + currM;
            const endTotal = endH * 60 + endM;
            const startTotal = startH * 60 + startM;
            const duration = endTotal - startTotal;
            const elapsed = Math.max(0, currTotal - startTotal);
            const percentElapsed = Math.min(100, Math.max(0, Math.round((elapsed / duration) * 100)));
            const minsLeft = endTotal - currTotal;

            const roomMics = microphones.filter((m) => m.classroomId === room.id);
            const roomSpeakers = speakers.filter((s) => s.classroomId === room.id);

            return (
              <div
                key={room.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top Bar: Room Code & Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                          {room.code}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                          {room.type.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.building} (Floor {room.floor})</span>
                      </div>
                    </div>

                    {/* Countdown Badge */}
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-mono tabular-nums font-semibold">
                        <Clock className="w-3 h-3" />
                        {minsLeft > 0 ? `${minsLeft}m remaining` : 'Class Concluding'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Course & Lecturer Info */}
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {session.courseCode}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {session.department}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {session.courseName}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mt-2">
                      <span>Instructor: <strong className="font-medium text-slate-800 dark:text-slate-200">{session.instructor}</strong></span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {session.attendeeCount} / {room.capacity} seats ({Math.round((session.attendeeCount / room.capacity) * 100)}% full)
                      </span>
                    </div>

                    {/* Progress Bar of Session Duration */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentElapsed}%` }}
                      />
                    </div>
                  </div>

                  {/* Active AV Equipment in this Room */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Active AV Channels &amp; Output
                    </div>

                    {/* Microphones status */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-3.5 h-3.5 text-sky-500" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {roomMics.length > 0 ? roomMics[0].name : 'No microphone assigned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                        {roomMics.length > 0 && (
                          <>
                            <span className="text-slate-500 text-[11px]">{roomMics[0].channelFrequency}</span>
                            <span className={`text-[11px] font-semibold ${
                              roomMics[0].batteryPercentage < 20 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {roomMics[0].batteryPercentage}% batt
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Speaker status */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {roomSpeakers.length > 0 ? roomSpeakers[0].brandModel : 'Standard ceiling speakers'}
                        </span>
                      </div>
                      <div className="font-mono tabular-nums text-xs text-slate-700 dark:text-slate-300">
                        {roomSpeakers.length > 0 ? `${roomSpeakers[0].outputDecibels} dB SPL` : 'Nominal'}
                      </div>
                    </div>
                  </div>

                </div>

                {/* In-Session Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleExtend(room)}
                    className="flex-1 py-1.5 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    title="Extend session duration by +15 minutes"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>+15m Extend</span>
                  </button>

                  <button
                    onClick={() => handleVacate(room)}
                    className="flex-1 py-1.5 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    title="Mark class completed and free up room"
                  >
                    <LogOut className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vacate Early</span>
                  </button>

                  <button
                    onClick={() => handleReportAudioGlitch(room)}
                    className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900/50 whitespace-nowrap"
                    title="Report microphone or audio glitch and request urgent room swap"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report AV &amp; Swap</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
