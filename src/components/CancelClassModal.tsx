import React, { useState } from 'react';
import { Classroom, CancelledBooking } from '../types';
import { useClassroom } from '../context/ClassroomContext';
import { 
  X, 
  AlertTriangle, 
  CalendarX, 
  CheckCircle2, 
  Building2, 
  Users, 
  Clock, 
  FileText 
} from 'lucide-react';

interface CancelClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
  onSuccess?: (message: string) => void;
}

export const CancelClassModal: React.FC<CancelClassModalProps> = ({
  isOpen,
  onClose,
  classroom,
  onSuccess,
}) => {
  const { cancelClassroomSession } = useClassroom();

  const [reason, setReason] = useState<CancelledBooking['cancellationReason']>('Lecturer Illness / Emergency');
  const [cancelledBy, setCancelledBy] = useState('Department Coordinator');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !classroom) return null;

  const session = classroom.currentSession;
  const isReserved = classroom.status === 'reserved';
  const isOccupied = classroom.status === 'occupied';

  const cancellationReasons: Array<CancelledBooking['cancellationReason']> = [
    'Lecturer Illness / Emergency',
    'Rescheduled to Other Date',
    'Class Moved Online / Hybrid',
    'AV Hardware / Microphone Malfunction',
    'Emergency Classroom Requisition',
    'Low Expected Attendance',
    'Other Department Request',
  ];

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = cancelClassroomSession(
      classroom.id,
      reason,
      cancelledBy.trim() || 'Classroom Coordinator',
      notes.trim() || undefined
    );

    setIsSubmitting(false);
    onClose();

    if (onSuccess) {
      onSuccess(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 dark:border-rose-950/60 bg-rose-50/70 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CalendarX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cancel Class Session
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Cancel reservation or vacate {classroom.code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmCancel} className="p-6 space-y-4 text-xs">
          
          {/* Target Classroom Card Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {classroom.code}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {classroom.name}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                isOccupied
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
              }`}>
                {classroom.status}
              </span>
            </div>

            {session && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                <div>
                  <span className="text-[10px] text-slate-400 block">Course / Session</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {session.courseCode}: {session.courseName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Instructor</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {session.instructor} ({session.department})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Scheduled Time</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Capacity / Attendees</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {session.attendeeCount} students
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Confirming cancellation will immediately release <span className="font-bold">{classroom.code}</span> to <strong>Available</strong> status for other lecturers, courses, or emergency dispatch.
            </p>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Cancellation Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as CancelledBooking['cancellationReason'])}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              {cancellationReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Cancelled By */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Authorized By / Contact Person
            </label>
            <input
              type="text"
              value={cancelledBy}
              onChange={(e) => setCancelledBy(e.target.value)}
              placeholder="e.g. Prof. David Vance / Department Office"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Internal Notes / Reassignment Info (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Session rescheduled to next Thursday or students notified via campus portal."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Keep Class
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <CalendarX className="w-3.5 h-3.5" />
              <span>Confirm &amp; Free Classroom</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
