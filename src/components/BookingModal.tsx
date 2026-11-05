import React, { useState, useEffect } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { Classroom, Booking } from '../types';
import { campusCurriculum, campusDepartments } from '../data/mockData';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Mic, 
  Volume2, 
  Tv, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Building2,
  FileCheck,
  BookOpen
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRoom?: Classroom | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, preselectedRoom }) => {
  const { classrooms, bookClassroom } = useClassroom();

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [instructorEmail, setInstructorEmail] = useState('');
  const [department, setDepartment] = useState('MATHS AND ICT');
  const [date, setDate] = useState('2026-11-05');
  const [startTime, setStartTime] = useState('11:30');
  const [endTime, setEndTime] = useState('13:00');
  const [expectedAttendees, setExpectedAttendees] = useState(60);
  const [purpose, setPurpose] = useState<Booking['purpose']>('lecture');
  const [recurrence, setRecurrence] = useState<Booking['recurrence']>('once');
  const [notes, setNotes] = useState('');

  // Equipment Checklist
  const [requiresHandheldMic, setRequiresHandheldMic] = useState(true);
  const [requiresLapelMic, setRequiresLapelMic] = useState(false);
  const [requiresSpeakers, setRequiresSpeakers] = useState(true);
  const [requiresProjector, setRequiresProjector] = useState(true);
  const [requiresRecording, setRequiresRecording] = useState(false);

  // Submission State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [conflictingBooking, setConflictingBooking] = useState<Booking | null>(null);
  const [suggestedRooms, setSuggestedRooms] = useState<Classroom[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (preselectedRoom) {
      setSelectedRoomId(preselectedRoom.id);
    } else if (classrooms.length > 0 && !selectedRoomId) {
      // Pick first available room
      const firstAvail = classrooms.find(r => r.status === 'available') || classrooms[0];
      setSelectedRoomId(firstAvail.id);
    }
  }, [preselectedRoom, classrooms]);

  if (!isOpen) return null;

  const currentSelectedRoom = classrooms.find(r => r.id === selectedRoomId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setConflictingBooking(null);
    setSuggestedRooms([]);

    if (!selectedRoomId) {
      setErrorMsg('Please select a classroom.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a course or session title.');
      return;
    }
    if (!instructorName.trim()) {
      setErrorMsg('Please enter the instructor or host name.');
      return;
    }
    if (startTime >= endTime) {
      setErrorMsg('End time must be after start time.');
      return;
    }

    const result = bookClassroom({
      classroomId: selectedRoomId,
      title: title.trim(),
      courseCode: courseCode.trim() || undefined,
      instructorName: instructorName.trim(),
      instructorEmail: instructorEmail.trim() || `${instructorName.toLowerCase().replace(/[^a-z]/g, '')}@campus.edu`,
      department,
      date,
      startTime,
      endTime,
      expectedAttendees: Number(expectedAttendees) || 30,
      purpose,
      recurrence,
      equipmentRequired: {
        wirelessHandheldMic: requiresHandheldMic,
        lapelMic: requiresLapelMic,
        highPowerSpeakers: requiresSpeakers,
        dualProjector: requiresProjector,
        lectureRecording: requiresRecording,
      },
      notes: notes.trim() || undefined,
    });

    if (result.success && result.booking) {
      setConfirmedBooking(result.booking);
    } else {
      setErrorMsg(result.message);
      if (result.conflictingBooking) {
        setConflictingBooking(result.conflictingBooking);
      }
      if (result.suggestedRooms) {
        setSuggestedRooms(result.suggestedRooms);
      }
    }
  };

  const handleResetForm = () => {
    setConfirmedBooking(null);
    setErrorMsg(null);
    setConflictingBooking(null);
    setTitle('');
    setCourseCode('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {confirmedBooking ? 'Booking Confirmed' : 'Book a Classroom'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {confirmedBooking 
                  ? 'Digital reservation pass issued' 
                  : 'Automatic schedule conflict detection & AV equipment allocation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmedBooking ? (
          /* Confirmation State */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Classroom Reserved Successfully!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Booking Reference: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{confirmedBooking.bookingRef}</span>
              </p>
            </div>

            {/* Digital Pass Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left text-xs max-w-md mx-auto space-y-2">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-400">Classroom:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{confirmedBooking.classroomCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-400">Course / Title:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{confirmedBooking.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-400">Date &amp; Time:</span>
                <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                  {confirmedBooking.date} · {confirmedBooking.startTime} - {confirmedBooking.endTime}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-400">Instructor:</span>
                <span className="text-slate-800 dark:text-slate-200">{confirmedBooking.instructorName} ({confirmedBooking.department})</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">AV Equipment:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Allocated &amp; Ready</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={handleResetForm}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Book Another Room
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Conflict Warning & Alternatives Banner */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>

                {suggestedRooms.length > 0 && (
                  <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
                    <div className="font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Recommended available alternative classrooms:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suggestedRooms.map(alt => (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => {
                            setSelectedRoomId(alt.id);
                            setErrorMsg(null);
                            setConflictingBooking(null);
                            setSuggestedRooms([]);
                          }}
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-left hover:border-indigo-500 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{alt.code}</span>
                            <span className="text-[11px] text-slate-500 ml-1.5">{alt.building}</span>
                            <div className="text-[10px] text-slate-400 font-mono tabular-nums">{alt.capacity} seats · AV ready</div>
                          </div>
                          <span className="text-[11px] font-semibold text-indigo-600 flex items-center">
                            Select <ArrowRight className="w-3 h-3 ml-0.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Room Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select Classroom *
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              >
                {classrooms.map((room) => (
                  <option key={room.id} value={room.id} disabled={room.status === 'maintenance'}>
                    {room.code} — {room.name} ({room.building}, {room.capacity} seats) {room.status === 'maintenance' ? '[MAINTENANCE]' : ''}
                  </option>
                ))}
              </select>
              {currentSelectedRoom && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span>Type: <strong className="capitalize">{currentSelectedRoom.type.replace('-', ' ')}</strong></span>
                  <span>·</span>
                  <span>Floor: {currentSelectedRoom.floor}</span>
                  <span>·</span>
                  <span>Capacity: <strong className="font-mono tabular-nums">{currentSelectedRoom.capacity} seats</strong></span>
                </div>
              )}
            </div>

            {/* Quick Course / Lecturer Preset Selector */}
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Quick Curriculum Autofill (Departments &amp; Lecturers)
                </span>
                <span className="text-[10px] text-indigo-500">Click to autofill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {campusCurriculum.map((item) => (
                  <button
                    key={item.courseCode}
                    type="button"
                    onClick={() => {
                      setTitle(item.courseName);
                      setCourseCode(item.courseCode);
                      setInstructorName(item.instructor);
                      setInstructorEmail(item.email);
                      setDepartment(item.department);
                    }}
                    className={`p-1.5 px-2 text-left rounded-lg text-[11px] transition-colors border flex flex-col justify-between ${
                      courseCode === item.courseCode
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold">{item.courseCode}</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-80">{item.department}</span>
                    </div>
                    <div className="font-medium truncate">{item.courseName}</div>
                    <div className="text-[10px] opacity-80">Lecturer: {item.instructor}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Course Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Session Title / Subject *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cloud Computing / Business Law"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. EIT311"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Instructor Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Instructor Name *
                </label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="e.g. Dr Adane / Sir John"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {campusDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Expected Attendees
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono tabular-nums focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Date and Time Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Schedule Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  step="900"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  step="900"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Purpose & Recurrence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Purpose / Format
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as Booking['purpose'])}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="lecture">Standard Lecture</option>
                  <option value="seminar">Seminar / Interactive Discussion</option>
                  <option value="examination">Examination / Midterm</option>
                  <option value="guest-speaker">Distinguished Guest Speaker</option>
                  <option value="workshop">Hands-on Workshop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Booking['recurrence'])}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="once">One-time Session</option>
                  <option value="weekly-4-weeks">Weekly (Next 4 Weeks)</option>
                  <option value="weekly-semester">Full Semester Schedule</option>
                </select>
              </div>
            </div>

            {/* AV & Equipment Allocation Checklist */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Required AV &amp; Audio Equipment Setup
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requiresHandheldMic}
                    onChange={(e) => setRequiresHandheldMic(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <Mic className="w-3.5 h-3.5 text-sky-500" />
                  <span>Wireless Handheld Mic</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requiresLapelMic}
                    onChange={(e) => setRequiresLapelMic(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <Mic className="w-3.5 h-3.5 text-purple-500" />
                  <span>Lapel / Collar Mic</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requiresSpeakers}
                    onChange={(e) => setRequiresSpeakers(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>High-Fidelity Speaker Output</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requiresProjector}
                    onChange={(e) => setRequiresProjector(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <Tv className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Dual 4K / Laser Projector</span>
                </label>
              </div>
            </div>

            {/* Additional notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Special Logistics / AV Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Guest speaker needs HDMI adapter and hearing loop assistive system turned on."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs active:scale-95"
              >
                Confirm &amp; Reserve Classroom
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
