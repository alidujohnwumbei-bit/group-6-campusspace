import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { Booking, CancelledBooking } from '../types';
import { 
  Calendar, 
  Clock, 
  Users, 
  Trash2, 
  RotateCcw, 
  Search, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Building2,
  X
} from 'lucide-react';

export const BookingsHistoryView: React.FC<{ onOpenBookingModal: () => void }> = ({ onOpenBookingModal }) => {
  const { 
    bookings, 
    cancelledBookings, 
    cancelBooking, 
    rebookCancelled,
    playAudioDiagnostic
  } = useClassroom();

  const [historySubTab, setHistorySubTab] = useState<'active' | 'cancelled'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');
  
  // Cancel Action State
  const [targetBookingToCancel, setTargetBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState<CancelledBooking['cancellationReason']>('Lecturer Illness / Emergency');
  const [cancelledBy, setCancelledBy] = useState('Prof. Office');
  const [cancelNotes, setCancelNotes] = useState('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter Active Bookings
  const filteredActive = bookings.filter((b) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchRef = b.bookingRef.toLowerCase().includes(q);
      const matchRoom = b.classroomCode.toLowerCase().includes(q);
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchInst = b.instructorName.toLowerCase().includes(q);
      const matchDept = b.department.toLowerCase().includes(q);
      if (!matchRef && !matchRoom && !matchTitle && !matchInst && !matchDept) return false;
    }
    return true;
  });

  // Filter Cancelled Bookings
  const filteredCancelled = cancelledBookings.filter((c) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchRef = c.bookingRef.toLowerCase().includes(q);
      const matchRoom = c.classroomCode.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchInst = c.instructorName.toLowerCase().includes(q);
      const matchReason = c.cancellationReason.toLowerCase().includes(q);
      if (!matchRef && !matchRoom && !matchTitle && !matchInst && !matchReason) return false;
    }
    if (reasonFilter !== 'All' && c.cancellationReason !== reasonFilter) {
      return false;
    }
    return true;
  });

  const handleConfirmCancel = () => {
    if (!targetBookingToCancel) return;
    cancelBooking(targetBookingToCancel.id, cancellationReason, cancelledBy, cancelNotes);
    showToast(`Booking ${targetBookingToCancel.bookingRef} successfully cancelled.`);
    setTargetBookingToCancel(null);
    setCancelNotes('');
  };

  const handleRebook = (cancelledItem: CancelledBooking) => {
    const res = rebookCancelled(cancelledItem.id);
    showToast(res.message);
  };

  // Export CSV
  const handleExportCSV = () => {
    const dataToExport = historySubTab === 'active' ? filteredActive : filteredCancelled;
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `campus_space_${historySubTab}_bookings_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${dataToExport.length} records successfully.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-tab controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bookings &amp; Cancellation Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of active classroom reservations and detailed cancellation logs with restore actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Sub Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setHistorySubTab('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                historySubTab === 'active'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setHistorySubTab('cancelled')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                historySubTab === 'cancelled'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cancelled Bookings ({cancelledBookings.length})
            </button>
          </div>

          {/* Export Action */}
          <button
            onClick={handleExportCSV}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition-colors text-xs flex items-center gap-1.5"
            title="Download JSON/CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 font-bold">×</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search booking ref, room, title, instructor, reason..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {historySubTab === 'cancelled' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Reason:</span>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Cancellation Reasons</option>
              <option value="Lecturer Illness / Emergency">Lecturer Illness</option>
              <option value="AV Hardware / Microphone Malfunction">AV / Mic Malfunction</option>
              <option value="Class Moved Online / Hybrid">Moved Online</option>
              <option value="Emergency Classroom Requisition">Emergency Requisition</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Active Bookings Table */}
      {historySubTab === 'active' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {filteredActive.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No active bookings found</p>
              <button
                onClick={onOpenBookingModal}
                className="mt-3 px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Book a Classroom Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Classroom</th>
                    <th className="py-3 px-4">Title / Course</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Instructor / Dept</th>
                    <th className="py-3 px-4 text-right">Attendees</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredActive.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {b.bookingRef}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {b.classroomCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {b.title}
                        </div>
                        {b.courseCode && (
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {b.courseCode} · {b.purpose}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        <div>{b.date}</div>
                        <div className="text-[11px] text-slate-400">{b.startTime} - {b.endTime}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{b.instructorName}</div>
                        <div className="text-[11px] text-slate-400">{b.department}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {b.expectedAttendees}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setTargetBookingToCancel(b)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors inline-flex items-center gap-1"
                          title="Cancel this booking"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Cancelled Bookings Table */}
      {historySubTab === 'cancelled' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {filteredCancelled.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No cancelled bookings on record</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All scheduled sessions remain intact.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Classroom</th>
                    <th className="py-3 px-4">Original Session</th>
                    <th className="py-3 px-4">Cancellation Reason</th>
                    <th className="py-3 px-4">Cancelled By &amp; When</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredCancelled.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-400 line-through">
                        {c.bookingRef}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {c.classroomCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{c.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {c.originalDate} ({c.originalStartTime} - {c.originalEndTime}) · {c.instructorName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-rose-700 dark:text-rose-400">
                          {c.cancellationReason}
                        </div>
                        {c.notes && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 italic">
                            "{c.notes}"
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        <div>{c.cancelledBy}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(c.cancelledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRebook(c)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded transition-colors inline-flex items-center gap-1"
                          title="Restore and re-activate this booking if room is available"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Rebook</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {targetBookingToCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cancel Booking {targetBookingToCancel.bookingRef}
                </h3>
              </div>
              <button
                onClick={() => setTargetBookingToCancel(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs mb-4">
              <div className="font-semibold text-slate-900 dark:text-white">
                {targetBookingToCancel.classroomCode}: {targetBookingToCancel.title}
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                {targetBookingToCancel.date} · {targetBookingToCancel.startTime} - {targetBookingToCancel.endTime} · {targetBookingToCancel.instructorName}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Cancellation *
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value as CancelledBooking['cancellationReason'])}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Lecturer Illness / Emergency">Lecturer Illness / Emergency</option>
                  <option value="AV Hardware / Microphone Malfunction">AV Hardware / Microphone Malfunction</option>
                  <option value="Rescheduled to Other Date">Rescheduled to Other Date</option>
                  <option value="Class Moved Online / Hybrid">Class Moved Online / Hybrid</option>
                  <option value="Emergency Classroom Requisition">Emergency Classroom Requisition</option>
                  <option value="Low Expected Attendance">Low Expected Attendance</option>
                  <option value="Other Department Request">Other Department Request</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cancelled By (Name / Title)
                </label>
                <input
                  type="text"
                  value={cancelledBy}
                  onChange={(e) => setCancelledBy(e.target.value)}
                  placeholder="e.g. Scheduling Coordinator Sarah"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Internal Notes / Audit Comment
                </label>
                <textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Optional context for department logs"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTargetBookingToCancel(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirm Cancellation &amp; Release Room
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
