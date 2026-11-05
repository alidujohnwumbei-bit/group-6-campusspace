import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Mic, 
  Volume2, 
  ArrowLeftRight, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  BarChart3, 
  Settings, 
  Sparkles,
  ExternalLink,
  RotateCcw,
  Sliders,
  Check
} from 'lucide-react';
import { Classroom, RoomStatus, RoomType } from '../types';

interface AdminDashboardProps {
  onOpenBookingModal: () => void;
  onOpenEmergencyModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenBookingModal,
  onOpenEmergencyModal,
}) => {
  const { 
    classrooms, 
    updateClassroom, 
    addClassroom, 
    microphones, 
    speakers, 
    updateMicrophone, 
    rechargeMic, 
    playAudioDiagnostic,
    bookings, 
    studentRequests, 
    updateStudentRequestStatus, 
    avRequests, 
    updateAVRequestStatus, 
    swapRequests, 
    updateSwapRequestStatus, 
    emergencyRequests, 
    resolveEmergencyRequest,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    resetToDefaults,
  } = useClassroom();
  const { user } = useAuth();

  // Active Admin Subtab
  const [adminSection, setAdminSection] = useState<
    'approvals' | 'classrooms' | 'av-fleet' | 'departments-faculty' | 'analytics'
  >('approvals');

  // Approvals filter
  const [approvalsCategory, setApprovalsCategory] = useState<'all' | 'room' | 'av' | 'swap' | 'emergency'>('all');
  
  // Feedback note state for approvals
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});

  // Classroom edit modal/inline state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingCapacity, setEditingCapacity] = useState<number>(120);
  const [editingStatus, setEditingStatus] = useState<RoomStatus>('available');
  const [editingAC, setEditingAC] = useState<Classroom['airConditioning']>('optimal');
  const [editingProjector, setEditingProjector] = useState<Classroom['projectorDisplay']>('dual-laser-4k');

  // New Department Form State
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [newDeptEmail, setNewDeptEmail] = useState('');

  // New Course Form State
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseInstructor, setNewCourseInstructor] = useState('Dr Adane');
  const [newCourseDept, setNewCourseDept] = useState('MATHS AND ICT');
  const [newCourseRoom, setNewCourseRoom] = useState('NLT2');

  // Metrics Calculations
  const totalClassrooms = classrooms.length;
  const occupiedCount = classrooms.filter(r => r.status === 'occupied').length;
  const availableCount = classrooms.filter(r => r.status === 'available').length;
  const reservedCount = classrooms.filter(r => r.status === 'reserved').length;
  const maintenanceCount = classrooms.filter(r => r.status === 'maintenance').length;
  const standbyCount = classrooms.filter(r => r.status === 'emergency-standby').length;
  const occupancyRate = Math.round(((occupiedCount + reservedCount) / totalClassrooms) * 100);

  const pendingRoomRequests = studentRequests.filter(r => r.status === 'pending');
  const pendingAVRequests = avRequests.filter(r => r.status === 'pending');
  const pendingSwaps = swapRequests.filter(r => r.status === 'pending');
  const activeEmergencies = emergencyRequests.filter(r => r.status === 'pending' || r.status === 'dispatched');
  const totalPendingApprovals = pendingRoomRequests.length + pendingAVRequests.length + pendingSwaps.length + activeEmergencies.length;

  // AV Health calculation
  const totalMics = microphones.length;
  const operationalMics = microphones.filter(m => m.status === 'operational' || m.status === 'in-use').length;
  const avHealthPercent = Math.round((operationalMics / (totalMics || 1)) * 100);

  // Approval Handlers
  const handleApproveRoom = (id: string, defaultRoomCode: string) => {
    const note = feedbackNotes[id] || 'Requisition approved by Academic Facilities Directorate.';
    updateStudentRequestStatus(id, 'approved', note, defaultRoomCode);
  };

  const handleRejectRoom = (id: string) => {
    const note = feedbackNotes[id] || 'Requested room is unavailable during this time slot.';
    updateStudentRequestStatus(id, 'rejected', note);
  };

  const handleApproveAV = (id: string) => {
    const note = feedbackNotes[id] || 'AV kit approved. Available for pickup from NLT Control Desk.';
    updateAVRequestStatus(id, 'approved', note);
  };

  const handleDispatchAV = (id: string) => {
    const note = feedbackNotes[id] || 'Dispatched by AV technician to room podium.';
    updateAVRequestStatus(id, 'dispatched', note);
  };

  const handleRejectAV = (id: string) => {
    const note = feedbackNotes[id] || 'Equipment currently in maintenance or fully allocated.';
    updateAVRequestStatus(id, 'rejected', note);
  };

  const handleSaveRoomEdit = (id: string) => {
    updateClassroom(id, {
      capacity: editingCapacity,
      status: editingStatus,
      airConditioning: editingAC,
      projectorDisplay: editingProjector,
    });
    setEditingRoomId(null);
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;
    addDepartment({
      name: newDeptName.toUpperCase(),
      code: newDeptCode.toUpperCase(),
      headOfDepartment: newDeptHead || 'Department Chair',
      contactEmail: newDeptEmail || 'dept@ucc.edu.gh',
      officeLocation: 'NLT Academic Block',
      activeLecturersCount: 1,
      assignedCoursesCount: 1,
    });
    setIsAddingDept(false);
    setNewDeptName('');
    setNewDeptCode('');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;
    addCourse({
      courseCode: newCourseCode.toUpperCase(),
      courseName: newCourseName,
      instructor: newCourseInstructor,
      department: newCourseDept,
      email: `${newCourseInstructor.toLowerCase().replace(/[^a-z]/g, '')}@campus.edu`,
      creditHours: 3,
      scheduledTime: 'Mon & Wed 10:00 - 12:00 PM',
      defaultRoom: newCourseRoom,
    });
    setIsAddingCourse(false);
    setNewCourseCode('');
    setNewCourseName('');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <span>DIRECTORATE OF ACADEMIC AFFAIRS · ADMIN CONTROL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Facility &amp; Classroom Operations Hub
            </h1>
            <p className="text-xs sm:text-sm text-purple-200">
              Logged in as <strong className="text-white">{user?.name || 'Administrator'}</strong> · Full Control over NLT1–NLT21, AV Equipment, Faculty &amp; Requests
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenBookingModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Admin Booking</span>
            </button>
            <button
              onClick={resetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
              title="Reset all database records to clean demo seeds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Approvals</div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-2">
            <span>{totalPendingApprovals}</span>
            {totalPendingApprovals > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Rooms, AV &amp; Swaps queue</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Classroom Utilization</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {occupancyRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{occupiedCount + reservedCount} of {totalClassrooms} in session</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available NLT Rooms</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {availableCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Free for allocation</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">AV Fleet Health</div>
          <div className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            {avHealthPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{operationalMics} mics operational</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs col-span-2 lg:col-span-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Emergencies</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {activeEmergencies.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{standbyCount} standby amphitheaters</div>
        </div>
      </div>

      {/* 3. Section Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto border border-slate-200 dark:border-slate-700/60 scrollbar-thin">
        {[
          { id: 'approvals', label: 'Approvals Hub', count: totalPendingApprovals, icon: CheckCircle2 },
          { id: 'classrooms', label: 'Manage Classrooms (NLT1-21)', count: totalClassrooms, icon: Building2 },
          { id: 'av-fleet', label: 'Manage AV Fleet', count: totalMics, icon: Mic },
          { id: 'departments-faculty', label: 'Departments & Faculty', count: departments.length, icon: Users },
          { id: 'analytics', label: 'Campus Analytics', icon: BarChart3 },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = adminSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setAdminSection(sec.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm font-bold border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{sec.label}</span>
              {sec.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {sec.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENT: APPROVALS HUB */}
      {adminSection === 'approvals' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Central Approvals &amp; Requisitions Queue</span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {totalPendingApprovals} Pending
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review, approve, or reject student classroom reservations, faculty AV gear, swaps, and emergency tickets
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setApprovalsCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  approvalsCategory === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setApprovalsCategory('room')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  approvalsCategory === 'room'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Rooms ({studentRequests.length})
              </button>
              <button
                onClick={() => setApprovalsCategory('av')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  approvalsCategory === 'av'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                AV Gear ({avRequests.length})
              </button>
              <button
                onClick={() => setApprovalsCategory('swap')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  approvalsCategory === 'swap'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Swaps ({swapRequests.length})
              </button>
              <button
                onClick={() => setApprovalsCategory('emergency')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  approvalsCategory === 'emergency'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Emergency ({emergencyRequests.length})
              </button>
            </div>
          </div>

          {/* List of Requests */}
          <div className="space-y-4">
            
            {/* 1. Student Classroom Requests */}
            {(approvalsCategory === 'all' || approvalsCategory === 'room') && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Student Classroom Reservation Requests</span>
                </div>

                {studentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {req.studentName} ({req.studentIndexNumber})
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          #{req.requestNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          · {req.department}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                        Requests <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{req.preferredClassroomCode}</strong> for <strong>{req.purpose}</strong> ({req.expectedAttendees} expected students)
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-mono">
                        <span>📅 {req.date}</span>
                        <span>⏰ {req.startTime} - {req.endTime}</span>
                        {req.allocatedRoomCode && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Allocated: {req.allocatedRoomCode}
                          </span>
                        )}
                      </div>

                      {/* Optional Note input */}
                      {req.status === 'pending' && (
                        <div className="mt-2.5">
                          <input
                            type="text"
                            placeholder="Add administrative feedback note..."
                            value={feedbackNotes[req.id] || ''}
                            onChange={(e) => setFeedbackNotes({ ...feedbackNotes, [req.id]: e.target.value })}
                            className="w-full max-w-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApproveRoom(req.id, req.preferredClassroomCode)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve ({req.preferredClassroomCode})</span>
                          </button>
                          <button
                            onClick={() => handleRejectRoom(req.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}>
                          {req.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span className="capitalize">{req.status}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. AV Equipment Requests */}
            {(approvalsCategory === 'all' || approvalsCategory === 'av') && (
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Audio-Visual Equipment Requisitions</span>
                </div>

                {avRequests.map((av) => (
                  <div
                    key={av.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {av.equipmentName}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                          #{av.requestNumber}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 uppercase">
                          Role: {av.userRole}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                        Requested by <strong>{av.userName}</strong> ({av.department}) for <strong className="text-sky-600 dark:text-sky-400 font-mono">{av.classroomCode}</strong> · {av.purpose}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-mono">
                        <span>📅 {av.date}</span>
                        <span>⏰ {av.timeSlot}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Priority: {av.urgency}</span>
                      </div>

                      {av.status === 'pending' && (
                        <div className="mt-2.5">
                          <input
                            type="text"
                            placeholder="Add AV dispatch / pickup instructions..."
                            value={feedbackNotes[av.id] || ''}
                            onChange={(e) => setFeedbackNotes({ ...feedbackNotes, [av.id]: e.target.value })}
                            className="w-full max-w-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                      {av.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApproveAV(av.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleDispatchAV(av.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-xs"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Dispatch</span>
                          </button>
                          <button
                            onClick={() => handleRejectAV(av.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          av.status === 'approved' || av.status === 'dispatched'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="capitalize">{av.status}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Classroom Swaps */}
            {(approvalsCategory === 'all' || approvalsCategory === 'swap') && (
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Faculty Classroom Swap Proposals</span>
                </div>

                {swapRequests.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {s.requesterLecturer} ({s.requesterRoomCode}) &harr; {s.targetLecturer} ({s.targetRoomCode})
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          #{s.requestNumber}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                        Courses: {s.requesterCourseCode} ({s.requesterCourseName}) &harr; {s.targetCourseCode} ({s.targetCourseName})
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                        📅 Date: {s.date} · ⏰ {s.timeSlot} · Reason: &quot;{s.reason}&quot;
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                      {s.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => updateSwapRequestStatus(s.id, 'approved', 'Authorized by Central Facilities Admin.')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Authorize Swap</span>
                          </button>
                          <button
                            onClick={() => updateSwapRequestStatus(s.id, 'rejected', 'Room swap declined by Administrator.')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          s.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="capitalize">{s.status}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Emergency Requests */}
            {(approvalsCategory === 'all' || approvalsCategory === 'emergency') && (
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Emergency Classroom Dispatches &amp; Standbys</span>
                </div>

                {emergencyRequests.map((emg) => (
                  <div
                    key={emg.id}
                    className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Incident: {emg.reason}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          #{emg.ticketNumber}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-600 text-white font-bold uppercase">
                          {emg.urgency}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                        Reported by <strong>{emg.requestedBy}</strong> ({emg.department}) for room <strong className="text-rose-600 dark:text-rose-400 font-mono">{emg.sourceClassroomCode}</strong>.
                      </div>

                      {emg.allocatedClassroomCode && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                          Standby Allocated: {emg.allocatedClassroomCode} (Amphitheater Relocation Active)
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                      {emg.status !== 'resolved' ? (
                        <button
                          onClick={() => resolveEmergencyRequest(emg.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Incident Resolved</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: MANAGE CLASSROOMS (NLT1-21) */}
      {adminSection === 'classrooms' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Classroom Master Inventory (NLT1 to NLT21)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Edit seating capacities, toggle status (Available, Occupied, Reserved, Maintenance), update AC &amp; projector hardware
              </p>
            </div>
          </div>

          {/* Classrooms Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Room Code</th>
                  <th className="px-4 py-3">Building / Level</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3">AC System</th>
                  <th className="px-4 py-3">Display</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {classrooms.map((room) => {
                  const isEditing = editingRoomId === room.id;

                  if (isEditing) {
                    return (
                      <tr key={room.id} className="bg-purple-50/50 dark:bg-purple-950/30">
                        <td className="px-4 py-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {room.code}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {room.building}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {room.type}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={20}
                            max={500}
                            value={editingCapacity}
                            onChange={(e) => setEditingCapacity(parseInt(e.target.value) || 50)}
                            className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-purple-400 rounded-lg font-mono"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value as any)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-purple-400 rounded-lg capitalize"
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="reserved">Reserved</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="emergency-standby">Emergency Standby</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editingAC}
                            onChange={(e) => setEditingAC(e.target.value as any)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-purple-400 rounded-lg capitalize"
                          >
                            <option value="optimal">Optimal</option>
                            <option value="cooling">Cooling</option>
                            <option value="issue">Issue</option>
                            <option value="off">Off</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editingProjector}
                            onChange={(e) => setEditingProjector(e.target.value as any)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-purple-400 rounded-lg"
                          >
                            <option value="dual-laser-4k">Dual Laser 4K</option>
                            <option value="interactive-smartboard">Smartboard</option>
                            <option value="standard-hd">Standard HD</option>
                            <option value="none">None</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveRoomEdit(room.id)}
                              className="px-2.5 py-1 rounded bg-purple-600 text-white font-semibold text-[11px] hover:bg-purple-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRoomId(null)}
                              className="px-2 py-1 rounded text-slate-500 hover:text-slate-800 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {room.code}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {room.building}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 capitalize">
                        {room.type.replace('-', ' ')}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        {room.capacity} seats
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono uppercase ${
                          room.status === 'available'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : room.status === 'occupied'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : room.status === 'reserved'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : room.status === 'emergency-standby'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize">
                        {room.airConditioning}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                        {room.projectorDisplay.replace('-', ' ')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setEditingRoomId(room.id);
                            setEditingCapacity(room.capacity);
                            setEditingStatus(room.status);
                            setEditingAC(room.airConditioning);
                            setEditingProjector(room.projectorDisplay);
                          }}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                          title="Edit classroom specs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: MANAGE AV FLEET */}
      {adminSection === 'av-fleet' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-sky-500" />
                <span>AV Hardware Fleet Management</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Microphones and acoustic speakers status, battery health, recharge, and diagnostic testing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => playAudioDiagnostic('chime')}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Audio Diagnostic Chime</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {microphones.map((mic) => (
              <div
                key={mic.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {mic.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {mic.brandModel}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    mic.status === 'operational'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : mic.status === 'in-use'
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                      : mic.status === 'low-battery'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  }`}>
                    {mic.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  <span>Freq: {mic.channelFrequency}</span>
                  <span className={`font-bold ${mic.batteryPercentage < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    🔋 {mic.batteryPercentage}%
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <button
                    onClick={() => rechargeMic(mic.id)}
                    className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                  >
                    Swap Battery / Recharge
                  </button>
                  <button
                    onClick={() => updateMicrophone(mic.id, {
                      status: mic.status === 'repair-needed' ? 'operational' : 'repair-needed'
                    })}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Toggle Repair
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: DEPARTMENTS & FACULTY */}
      {adminSection === 'departments-faculty' && (
        <div className="space-y-6">
          {/* Departments Manager */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Academic Departments ({departments.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage academic units across Maths &amp; ICT, Vocational, Statistics, and Business
                </p>
              </div>

              <button
                onClick={() => setIsAddingDept(!isAddingDept)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Department</span>
              </button>
            </div>

            {/* Add Department Form */}
            {isAddingDept && (
              <form onSubmit={handleCreateDepartment} className="mt-4 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Department Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. FACULTY OF ARTS"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Code:</label>
                    <input
                      type="text"
                      placeholder="e.g. ARTS"
                      value={newDeptCode}
                      onChange={(e) => setNewDeptCode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Head of Department:</label>
                    <input
                      type="text"
                      placeholder="e.g. Prof. Mensah"
                      value={newDeptHead}
                      onChange={(e) => setNewDeptHead(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Email:</label>
                    <input
                      type="email"
                      placeholder="arts@ucc.edu.gh"
                      value={newDeptEmail}
                      onChange={(e) => setNewDeptEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingDept(false)}
                    className="px-3 py-1 rounded text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-purple-600 text-white font-semibold"
                  >
                    Save Department
                  </button>
                </div>
              </form>
            )}

            {/* Department Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {d.name}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {d.code}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    HOD: <strong className="text-slate-800 dark:text-slate-200">{d.headOfDepartment}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {d.contactEmail}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Location: {d.officeLocation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lecturers & Courses Manager */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Curriculum Courses &amp; Assigned Lecturers ({courses.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage instructors, course codes, departments, and default NLT classrooms
                </p>
              </div>

              <button
                onClick={() => setIsAddingCourse(!isAddingCourse)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>
            </div>

            {/* Add Course Form */}
            {isAddingCourse && (
              <form onSubmit={handleCreateCourse} className="mt-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Course Code:</label>
                    <input
                      type="text"
                      placeholder="e.g. EIT315"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Course Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. Cyber Security"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Lecturer:</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr Adane"
                      value={newCourseInstructor}
                      onChange={(e) => setNewCourseInstructor(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Department:</label>
                    <select
                      value={newCourseDept}
                      onChange={(e) => setNewCourseDept(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Default Hall:</label>
                    <select
                      value={newCourseRoom}
                      onChange={(e) => setNewCourseRoom(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    >
                      {classrooms.map((r) => (
                        <option key={r.id} value={r.code}>{r.code}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCourse(false)}
                    className="px-3 py-1 rounded text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-indigo-600 text-white font-semibold"
                  >
                    Save Course
                  </button>
                </div>
              </form>
            )}

            {/* Courses Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mt-4">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Course Code</th>
                    <th className="px-4 py-2.5">Course Name</th>
                    <th className="px-4 py-2.5">Assigned Lecturer</th>
                    <th className="px-4 py-2.5">Department</th>
                    <th className="px-4 py-2.5">Designated Hall</th>
                    <th className="px-4 py-2.5">Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {c.courseCode}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">
                        {c.courseName}
                      </td>
                      <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 font-medium">
                        {c.instructor}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        {c.department}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {c.defaultRoom}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                        {c.scheduledTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT: ANALYTICS */}
      {adminSection === 'analytics' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Campus Facility &amp; Timetable Analytics</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live capacity breakdown across NLT levels, booking frequencies, and hardware reliability metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level 1 Utilization */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Level 1 (NLT1 to NLT7)</div>
              <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                71% Active Usage
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '71%' }}></div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">Features 250-seat Amphitheater (NLT1, NLT7 Standby)</div>
            </div>

            {/* Level 2 Utilization */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Level 2 (NLT8 to NLT14)</div>
              <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                57% Active Usage
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '57%' }}></div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">NLT14 in maintenance; NLT12 Food &amp; Nutrition</div>
            </div>

            {/* Level 3 Utilization */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Level 3 (NLT15 to NLT21)</div>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                85% Active Usage
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">High demand for Statistics &amp; Business accounting</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
