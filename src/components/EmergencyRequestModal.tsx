import React, { useState, useEffect } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { Classroom, EmergencyRequest } from '../types';
import { campusDepartments } from '../data/mockData';
import { 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Mic, 
  Volume2, 
  Users, 
  Building2 
} from 'lucide-react';

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSourceRoom?: Classroom | null;
}

export const EmergencyRequestModal: React.FC<EmergencyRequestModalProps> = ({
  isOpen,
  onClose,
  initialSourceRoom,
}) => {
  const { 
    classrooms, 
    microphones, 
    speakers, 
    createEmergencyRequest,
    simulatedTime 
  } = useClassroom();

  const [sourceRoomId, setSourceRoomId] = useState<string>('');
  const [reason, setReason] = useState<EmergencyRequest['reason']>('Microphone / Sound Audio Failure');
  const [requestedBy, setRequestedBy] = useState('Prof. in Session');
  const [department, setDepartment] = useState('MATHS AND ICT');
  const [requiredCapacity, setRequiredCapacity] = useState(40);
  const [urgency, setUrgency] = useState<EmergencyRequest['urgency']>('immediate');
  const [audioRequirement, setAudioRequirement] = useState<EmergencyRequest['audioRequirement']>('must-have-working-mic-and-speaker');
  const [notes, setNotes] = useState('');

  // Result state
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    message: string;
    request?: EmergencyRequest;
    allocatedRoom?: Classroom;
  } | null>(null);

  useEffect(() => {
    if (initialSourceRoom) {
      setSourceRoomId(initialSourceRoom.id);
      if (initialSourceRoom.currentSession) {
        setRequestedBy(initialSourceRoom.currentSession.instructor);
        setDepartment(initialSourceRoom.currentSession.department);
        setRequiredCapacity(initialSourceRoom.currentSession.attendeeCount || initialSourceRoom.capacity);
      } else {
        setRequiredCapacity(initialSourceRoom.capacity);
      }
    } else {
      setSourceRoomId('');
    }
  }, [initialSourceRoom]);

  if (!isOpen) return null;

  const currentSource = classrooms.find(r => r.id === sourceRoomId);

  // Quick preset reasons
  const presetReasons: Array<{ label: string; value: EmergencyRequest['reason']; defaultCapacity?: number }> = [
    { label: 'Mic / Audio Sound Dead', value: 'Microphone / Sound Audio Failure' },
    { label: 'Projector Blackout', value: 'Projector Display Blackout' },
    { label: 'AC Failed / Overheating', value: 'Air Conditioning / Thermal Fault' },
    { label: 'Student Overflow (+50)', value: 'Severe Overflow Attendance (+40%)', defaultCapacity: 120 },
    { label: 'Water Leak / Spill', value: 'Classroom Flooding / Water Leak' },
    { label: 'VIP Priority Event', value: 'VIP Guest Lecture Priority', defaultCapacity: 150 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = createEmergencyRequest({
      sourceClassroomId: sourceRoomId || undefined,
      reason,
      requestedBy: requestedBy.trim() || 'Urgent Classroom Dispatch',
      department,
      requiredCapacity: Number(requiredCapacity) || 40,
      urgency,
      audioRequirement,
      notes: notes.trim() || undefined,
    });

    setDispatchResult(res);
  };

  const handleReset = () => {
    setDispatchResult(null);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/50">
          <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-300">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Emergency Classroom Request
              </h3>
              <p className="text-xs text-rose-600/80 dark:text-rose-400">
                Instant priority standby room allocation &amp; audio-verified dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {dispatchResult ? (
          /* Dispatched Confirmation Screen */
          <div className="p-6 text-center space-y-4">
            {dispatchResult.success && dispatchResult.allocatedRoom ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Emergency Standby Classroom Dispatched!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ticket <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{dispatchResult.request?.ticketNumber}</span> · Allocated in 2 seconds
                  </p>
                </div>

                {/* Dispatched Room Highlight Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-300 dark:border-emerald-800 text-left text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {dispatchResult.allocatedRoom.code}
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {dispatchResult.allocatedRoom.name}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                      Ready to occupy
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span>Building:</span> <strong>{dispatchResult.allocatedRoom.building}</strong>
                    </div>
                    <div>
                      <span>Capacity:</span> <strong className="font-mono tabular-nums">{dispatchResult.allocatedRoom.capacity} seats</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Dual Mics 100% Tested</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>PA System Operational</span>
                    </div>
                  </div>

                  {currentSource && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 text-[11px]">
                      Previous room <strong>{currentSource.code}</strong> set to maintenance for technical inspection.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    Close &amp; Notify Class
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Ticket Queued for Rapid Support
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {dispatchResult.message}
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg"
                >
                  Understood
                </button>
              </>
            )}
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Quick Reason Presets */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Quick Incident Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presetReasons.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setReason(p.value);
                      if (p.defaultCapacity) setRequiredCapacity(p.defaultCapacity);
                    }}
                    className={`p-2 rounded-lg text-xs font-medium text-left transition-colors border ${
                      reason === p.value
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-800 dark:text-rose-200'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Affected Classroom (if any) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Affected Classroom (Source)
                </label>
                <select
                  value={sourceRoomId}
                  onChange={(e) => setSourceRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">No specific room (New urgent request)</option>
                  {classrooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.code} — {room.name} ({room.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Required Minimum Seating *
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={requiredCapacity}
                  onChange={(e) => setRequiredCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            {/* Requester & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Requester (Instructor / Coordinator) *
                </label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  placeholder="e.g. Prof. David Vance"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                >
                  {campusDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audio Requirement Guarantee */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Audio Equipment Guarantee for Allocated Room
              </label>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="audioReq"
                    checked={audioRequirement === 'must-have-working-mic-and-speaker'}
                    onChange={() => setAudioRequirement('must-have-working-mic-and-speaker')}
                    className="text-rose-600"
                  />
                  <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-sky-500" />
                    <Volume2 className="w-3.5 h-3.5 text-purple-500" />
                    Strict: Must have tested working microphone + verified speakers
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="audioReq"
                    checked={audioRequirement === 'standard'}
                    onChange={() => setAudioRequirement('standard')}
                    className="text-rose-600"
                  />
                  <span>Standard room (Any available room with required capacity)</span>
                </label>
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Urgency Level
              </label>
              <div className="flex items-center gap-2 text-xs">
                {(['immediate', 'next-30-mins', 'today'] as const).map((urg) => (
                  <button
                    key={urg}
                    type="button"
                    onClick={() => setUrgency(urg)}
                    className={`flex-1 py-1.5 rounded-lg font-medium capitalize border transition-colors ${
                      urgency === urg
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {urg.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Incident Description / Specific Needs
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Wireless lapel mic cut out completely during mid-term exam review. 80 students waiting."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Locate &amp; Dispatch Emergency Classroom</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
