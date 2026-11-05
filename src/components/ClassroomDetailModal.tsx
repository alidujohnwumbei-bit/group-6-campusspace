import React from 'react';
import { Classroom } from '../types';
import { useClassroom } from '../context/ClassroomContext';
import { 
  X, 
  Building2, 
  Users, 
  Mic, 
  Volume2, 
  Tv, 
  Wind, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Battery, 
  Radio, 
  Layers 
} from 'lucide-react';

interface ClassroomDetailModalProps {
  room: Classroom | null;
  onClose: () => void;
  onBookRoom: (room: Classroom) => void;
  onEmergencySwap: (room: Classroom) => void;
  onCancelClass?: (room: Classroom) => void;
}

export const ClassroomDetailModal: React.FC<ClassroomDetailModalProps> = ({
  room,
  onClose,
  onBookRoom,
  onEmergencySwap,
  onCancelClass,
}) => {
  const { microphones, speakers, bookings, playAudioDiagnostic } = useClassroom();

  if (!room) return null;

  const roomMics = microphones.filter((m) => m.classroomId === room.id);
  const roomSpeakers = speakers.filter((s) => s.classroomId === room.id);
  const roomBookings = bookings.filter((b) => b.classroomId === room.id && b.status === 'active');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold flex items-center justify-center text-sm">
              {room.code}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {room.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{room.building}</span>
                <span>·</span>
                <span>Floor {room.floor}</span>
                <span>·</span>
                <span className="capitalize">{room.type.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Key Specs Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Total Seating</span>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                {room.capacity}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Status</span>
              <div className="text-sm font-semibold capitalize text-slate-900 dark:text-white mt-1">
                {room.status.replace('-', ' ')}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Air Conditioning</span>
              <div className="text-sm font-semibold capitalize text-slate-900 dark:text-white mt-1">
                {room.airConditioning}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Assistive Loop</span>
              <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {room.accessibility.assistiveListeningLoop ? 'Installed (Hearing Loop)' : 'None'}
              </div>
            </div>
          </div>

          {/* Microphones Inventory in this Room */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-sky-500" />
              <span>Assigned Microphones ({roomMics.length})</span>
            </h4>

            {roomMics.length === 0 ? (
              <p className="text-slate-400 italic">No dedicated microphones assigned to this room.</p>
            ) : (
              <div className="space-y-2">
                {roomMics.map(m => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                        {m.brandModel} · {m.channelFrequency}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">
                        {m.batteryPercentage}% batt
                      </div>
                      <div className="text-[11px] capitalize text-emerald-600 dark:text-emerald-400">
                        {m.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Speakers Inventory in this Room */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span>Assigned Speakers &amp; Amplification ({roomSpeakers.length})</span>
            </h4>

            {roomSpeakers.length === 0 ? (
              <p className="text-slate-400 italic">Standard ceiling passive audio.</p>
            ) : (
              <div className="space-y-2">
                {roomSpeakers.map(s => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {s.brandModel} · Powered by {s.amplifierModel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">
                        {s.outputDecibels} dB SPL
                      </div>
                      <div className="text-[11px] capitalize text-emerald-600 dark:text-emerald-400">
                        {s.status.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Bookings & Schedule */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Today's Scheduled Sessions</span>
            </h4>

            {room.currentSession && (
              <div className="p-3 mb-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center justify-between text-amber-800 dark:text-amber-200 font-semibold mb-1">
                  <span>NOW LIVE: {room.currentSession.courseCode} - {room.currentSession.courseName}</span>
                  <span className="font-mono tabular-nums">{room.currentSession.startTime} - {room.currentSession.endTime}</span>
                </div>
                <div className="text-amber-700 dark:text-amber-300 text-[11px]">
                  Instructor: {room.currentSession.instructor} ({room.currentSession.department}) · {room.currentSession.attendeeCount} students
                </div>
              </div>
            )}

            {roomBookings.length === 0 && !room.currentSession ? (
              <p className="text-slate-400 italic">No upcoming reservations scheduled for today.</p>
            ) : (
              <div className="space-y-1.5">
                {roomBookings.map(b => (
                  <div key={b.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{b.title}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5 font-mono">({b.bookingRef})</span>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {b.instructorName} · {b.department}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {b.startTime} - {b.endTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 flex-wrap">
          <button
            onClick={() => {
              playAudioDiagnostic('chime');
            }}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Audio Diagnostic Beep
          </button>

          <div className="flex items-center gap-2">
            {(room.status === 'occupied' || room.status === 'reserved') && onCancelClass && (
              <button
                onClick={() => {
                  onClose();
                  onCancelClass(room);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 rounded-lg transition-colors border border-rose-200 dark:border-rose-900"
              >
                Cancel Class
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onEmergencySwap(room);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 rounded-lg transition-colors border border-amber-200 dark:border-amber-900"
            >
              Emergency Relocate
            </button>

            {room.status === 'available' && (
              <button
                onClick={() => {
                  onClose();
                  onBookRoom(room);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Book This Room
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
