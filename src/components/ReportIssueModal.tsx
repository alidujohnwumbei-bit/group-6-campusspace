import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { useAuth } from '../context/AuthContext';
import { X, AlertTriangle, CheckCircle2, Projector, Mic, Snowflake, Droplets, Users, ShieldAlert } from 'lucide-react';
import { EmergencyRequest } from '../types';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoomCode?: string;
  onSuccess?: (msg: string) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  defaultRoomCode = 'NLT2',
  onSuccess,
}) => {
  const { classrooms, createEmergencyRequest } = useClassroom();
  const { user, activeLecturerPersona } = useAuth();

  const [selectedRoom, setSelectedRoom] = useState(defaultRoomCode);
  const [reason, setReason] = useState<EmergencyRequest['reason']>('Projector Display Blackout');
  const [urgency, setUrgency] = useState<EmergencyRequest['urgency']>('immediate');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetRoom = classrooms.find(r => r.code === selectedRoom);

  const issuePresets = [
    { label: 'Projector Display Blackout', icon: Projector, desc: 'Laser display or smartboard screen failed' },
    { label: 'Microphone / Sound Audio Failure', icon: Mic, desc: 'Wireless mic or PA sound system offline' },
    { label: 'Air Conditioning / Thermal Fault', icon: Snowflake, desc: 'Room too hot or AC compressor stopped' },
    { label: 'Severe Overflow Attendance (+40%)', icon: Users, desc: 'Class size exceeds room seating capacity' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const res = createEmergencyRequest({
        sourceClassroomId: targetRoom?.id || `nlt-${selectedRoom.replace('NLT', '')}`,
        reason,
        requestedBy: user?.name || activeLecturerPersona.name || 'Dr. Adane',
        department: user?.department || activeLecturerPersona.department || 'MATHS AND ICT',
        requiredCapacity: targetRoom?.capacity || 120,
        urgency,
        audioRequirement: 'must-have-working-mic-and-speaker',
        notes: notes || `Faculty reported urgent classroom malfunction in ${selectedRoom}: ${reason}`,
      });

      setIsSubmitting(false);
      onClose();

      if (onSuccess) {
        onSuccess(`Incident reported for ${selectedRoom}. Standby amphitheater (NLT7/21) alert dispatched to Facility Operations.`);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-200 dark:border-rose-950/60 bg-rose-50/60 dark:bg-rose-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Report Classroom Issue</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-mono font-bold">
                  FACULTY RAPID ALERT
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Report critical faults like projector blackout or mic failure for immediate standby dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Target Room */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Affected Lecture Hall (NLT1 to NLT21):
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {classrooms.map((room) => (
                <option key={room.id} value={room.code}>
                  {room.code} - {room.name} ({room.status})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Select Issue Type */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Issue Category:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {issuePresets.map((preset) => {
                const isSelected = reason === preset.label;
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setReason(preset.label as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-semibold ring-1 ring-rose-500'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Icon className="w-3.5 h-3.5 text-rose-500" />
                      <span>{preset.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {preset.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority Urgency:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'immediate', label: 'Immediate', desc: 'Class in progress right now' },
                { id: 'next-30-mins', label: 'Next 30 Mins', desc: 'Upcoming lecture soon' },
                { id: 'today', label: 'Today', desc: 'Maintenance required' },
              ].map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUrgency(u.id as any)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    urgency === u.id
                      ? 'border-rose-600 bg-rose-600 text-white font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs">{u.label}</div>
                  <div className={`text-[10px] mt-0.5 ${urgency === u.id ? 'text-rose-100' : 'text-slate-400'}`}>
                    {u.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Additional Details / Description (Optional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. HDMI port has no signal on main projector; 80 students waiting..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Reporting...' : 'Dispatch Emergency Standby'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
