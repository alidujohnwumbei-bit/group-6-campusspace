import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { useAuth } from '../context/AuthContext';
import { X, ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { LECTURER_PERSONAS } from '../data/mockData';

interface ClassroomSwapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const ClassroomSwapsModal: React.FC<ClassroomSwapsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { classrooms, createSwapRequest } = useClassroom();
  const { user, activeLecturerPersona } = useAuth();

  const [requesterRoom, setRequesterRoom] = useState(activeLecturerPersona.activeRoom || 'NLT2');
  const [targetRoom, setTargetRoom] = useState('NLT5');
  const [targetLecturerName, setTargetLecturerName] = useState('Dr Nelly');
  const [date, setDate] = useState('2026-11-06');
  const [timeSlot, setTimeSlot] = useState('09:00 - 11:00 AM');
  const [reason, setReason] = useState('Need larger theater seating capacity for multi-group presentation.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetPersona = LECTURER_PERSONAS.find(p => p.name === targetLecturerName) || LECTURER_PERSONAS[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      createSwapRequest({
        requesterLecturer: activeLecturerPersona.name,
        requesterEmail: activeLecturerPersona.email,
        requesterCourseCode: activeLecturerPersona.courseCode,
        requesterCourseName: activeLecturerPersona.courseName,
        requesterRoomCode: requesterRoom,
        targetLecturer: targetPersona.name,
        targetEmail: targetPersona.email,
        targetCourseCode: targetPersona.courseCode,
        targetCourseName: targetPersona.courseName,
        targetRoomCode: targetRoom,
        date,
        timeSlot,
        reason,
      });

      setIsSubmitting(false);
      onClose();
      if (onSuccess) {
        onSuccess(`Swap proposal sent to ${targetPersona.name} (${targetRoom}) successfully!`);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Propose Classroom Swap</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                FACULTY
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Request room exchange between courses with automated timetable adjustment
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Swap Visual Mapping */}
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 grid grid-cols-2 gap-3 items-center text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-500 block">Your Course &amp; Room:</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                {activeLecturerPersona.courseCode} ({requesterRoom})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeLecturerPersona.name}
              </span>
            </div>

            <div className="border-l border-indigo-200 dark:border-indigo-800 pl-3">
              <span className="text-[10px] uppercase font-bold text-indigo-500 block">Swap Target Course:</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                {targetPersona.courseCode} ({targetRoom})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {targetPersona.name}
              </span>
            </div>
          </div>

          {/* Target Lecturer Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Swap With Lecturer / Course:
            </label>
            <select
              value={targetLecturerName}
              onChange={(e) => {
                const name = e.target.value;
                setTargetLecturerName(name);
                const p = LECTURER_PERSONAS.find(x => x.name === name);
                if (p) {
                  setTargetRoom(p.activeRoom);
                }
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LECTURER_PERSONAS.filter(p => p.name !== activeLecturerPersona.name).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} · {p.courseCode} - {p.courseName} (Currently in {p.activeRoom})
                </option>
              ))}
            </select>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Current Room:
              </label>
              <select
                value={requesterRoom}
                onChange={(e) => setRequesterRoom(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              >
                {classrooms.map((r) => (
                  <option key={r.id} value={r.code}>{r.code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Requested Target Room:
              </label>
              <select
                value={targetRoom}
                onChange={(e) => setTargetRoom(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              >
                {classrooms.map((r) => (
                  <option key={r.id} value={r.code}>{r.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Swap:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Time Slot:
              </label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Reason for Swap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Swap:
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Proposal...' : 'Propose Room Swap'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
