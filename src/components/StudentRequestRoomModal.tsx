import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, Users, Building, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentRequestRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const StudentRequestRoomModal: React.FC<StudentRequestRoomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { classrooms, createStudentRequest } = useClassroom();
  const { user } = useAuth();

  const [preferredRoom, setPreferredRoom] = useState('NLT8');
  const [date, setDate] = useState('2026-11-05');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  const [attendees, setAttendees] = useState(25);
  const [purpose, setPurpose] = useState<
    'Study Group Discussion' | 'Class Project Presentation' | 'Department Association Meeting' | 'Revision & Peer Tutoring' | 'Society / Club Seminar'
  >('Study Group Discussion');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      createStudentRequest({
        studentId: user?.id || 'usr-student-1',
        studentName: user?.name || 'Kwame Mensah',
        studentIndexNumber: user?.studentId || 'PS/ITC/23/0042',
        department: user?.department || 'MATHS AND ICT',
        preferredClassroomCode: preferredRoom,
        date,
        startTime,
        endTime,
        expectedAttendees: attendees,
        purpose,
      });

      setIsSubmitting(false);
      onClose();
      if (onSuccess) {
        onSuccess(`Classroom request for ${preferredRoom} submitted successfully! Awaiting Admin approval.`);
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
              <span>Request Classroom Reservation</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                STUDENT
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit an official requisition for study groups, project defenses, or society meetings
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
          
          {/* Student Info Pill */}
          <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-indigo-950 dark:text-indigo-200 block">
                {user?.name || 'Kwame Mensah'} ({user?.studentId || 'PS/ITC/23/0042'})
              </span>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-400">
                Department: {user?.department || 'MATHS AND ICT'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-600 text-white font-medium">
              Verified Student
            </span>
          </div>

          {/* Preferred Classroom Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred NLT Classroom Block:
            </label>
            <select
              value={preferredRoom}
              onChange={(e) => setPreferredRoom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {classrooms.map((room) => (
                <option key={room.id} value={room.code}>
                  {room.code} - {room.type} (Cap: {room.capacity} seats) · Status: {room.status}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose of Reservation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Purpose of Reservation:
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Study Group Discussion">Study Group Discussion</option>
              <option value="Class Project Presentation">Class Project Presentation</option>
              <option value="Department Association Meeting">Department Association Meeting</option>
              <option value="Revision & Peer Tutoring">Revision &amp; Peer Tutoring</option>
              <option value="Society / Club Seminar">Society / Club Seminar</option>
            </select>
          </div>

          {/* Date and Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date:
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
                Start Time:
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time:
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Expected Attendees */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expected Number of Students / Attendees:
            </label>
            <input
              type="number"
              min={2}
              max={250}
              value={attendees}
              onChange={(e) => setAttendees(parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Special Notes / Equipment Needs (Optional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need projector cable, whiteboard markers..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Action */}
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
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Classroom Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
