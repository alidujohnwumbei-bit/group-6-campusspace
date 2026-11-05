import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  CalendarPlus, 
  Mic, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  ArrowRight, 
  Building2, 
  Volume2, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenRequestRoomModal: () => void;
  onOpenRequestAVModal: () => void;
  onOpenEmergencyModal: () => void;
  onViewClassrooms: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenRequestRoomModal,
  onOpenRequestAVModal,
  onOpenEmergencyModal,
  onViewClassrooms,
}) => {
  const { 
    classrooms, 
    studentRequests, 
    avRequests, 
    setActiveTab,
    setSelectedRoom 
  } = useClassroom();
  const { user } = useAuth();

  const [activeRequestSubtab, setActiveRequestSubtab] = useState<'all' | 'room' | 'av'>('all');

  // Filter student's specific requests
  const myRoomRequests = studentRequests;
  const myAVRequests = avRequests.filter(r => r.userRole === 'student' || r.userName.includes(user?.name || 'Kwame'));

  const pendingRoomCount = myRoomRequests.filter(r => r.status === 'pending').length;
  const approvedRoomCount = myRoomRequests.filter(r => r.status === 'approved').length;
  const pendingAVCount = myAVRequests.filter(r => r.status === 'pending').length;

  // Available quiet study rooms
  const availableStudyRooms = classrooms.filter(r => r.status === 'available').slice(0, 6);

  return (
    <div className="space-y-6">
      
      {/* 1. Student Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>STUDENT PORTAL ACTIVE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome, {user?.name || 'Kwame Mensah'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200">
              Student ID: <span className="font-mono font-bold text-white">{user?.studentId || 'PS/ITC/23/0042'}</span> · Department of {user?.department || 'MATHS AND ICT'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenRequestRoomModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-sm transition-all active:scale-95"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Request Classroom</span>
            </button>
            <button
              onClick={onOpenRequestAVModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 text-sky-400" />
              <span>Request AV Gear</span>
            </button>
            <button
              onClick={onOpenEmergencyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Approved Allocations</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {approvedRoomCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for group study / presentation</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Approvals</div>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-1">
            {pendingRoomCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Under review by Timetable admin</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">AV Requisitions</div>
          <div className="text-2xl font-bold font-mono text-sky-500 mt-1">
            {myAVRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{pendingAVCount} currently awaiting dispatch</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Free Study Halls Now</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {availableStudyRooms.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Available across NLT1 to NLT21</div>
        </div>
      </div>

      {/* 3. My Submissions & Requests Status Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>My Requests Status</span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {myRoomRequests.length + myAVRequests.length} Total
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time approval tracking and feedback from Directorate of Academic Affairs
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveRequestSubtab('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeRequestSubtab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setActiveRequestSubtab('room')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeRequestSubtab === 'room'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Classroom ({myRoomRequests.length})
            </button>
            <button
              onClick={() => setActiveRequestSubtab('av')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeRequestSubtab === 'av'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              AV Equipment ({myAVRequests.length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="mt-4 space-y-3">
          {/* Room Requests */}
          {(activeRequestSubtab === 'all' || activeRequestSubtab === 'room') && (
            <>
              {myRoomRequests.map((req) => (
                <div 
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Classroom Requisition: {req.preferredClassroomCode}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          #{req.requestNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        <strong className="text-slate-800 dark:text-slate-200">{req.purpose}</strong> · {req.expectedAttendees} expected students
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
                      {req.adminFeedback && (
                        <div className="mt-2 text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 p-2 rounded-lg border border-indigo-200 dark:border-indigo-900">
                          <strong>Admin Feedback:</strong> {req.adminFeedback}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    {req.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Approved</span>
                      </span>
                    )}
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pending Review</span>
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* AV Requests */}
          {(activeRequestSubtab === 'all' || activeRequestSubtab === 'av') && (
            <>
              {myAVRequests.map((av) => (
                <div 
                  key={av.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-sky-300 dark:hover:border-sky-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          AV Equipment: {av.equipmentName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          #{av.requestNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Target Hall: <strong className="text-slate-800 dark:text-slate-200">{av.classroomCode}</strong> · {av.purpose}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-mono">
                        <span>📅 {av.date}</span>
                        <span>⏰ {av.timeSlot}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                          Priority: {av.urgency}
                        </span>
                      </div>
                      {av.adminFeedback && (
                        <div className="mt-2 text-xs bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 p-2 rounded-lg border border-sky-200 dark:border-sky-900">
                          <strong>AV Dispatch Note:</strong> {av.adminFeedback}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    {av.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Approved for Pickup</span>
                      </span>
                    )}
                    {av.status === 'dispatched' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                        <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                        <span>Dispatched to Hall</span>
                      </span>
                    )}
                    {av.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Awaiting Tech Review</span>
                      </span>
                    )}
                    {av.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Unavailable</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {myRoomRequests.length === 0 && myAVRequests.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <CalendarPlus className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">You have no active requests yet.</p>
              <button
                onClick={onOpenRequestRoomModal}
                className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Submit your first classroom request &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Currently Available Study Theaters in NLT Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>Available NLT Lecture Halls (Quiet Study / Open Access)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              These rooms are currently unallocated and open for students
            </p>
          </div>
          <button
            onClick={onViewClassrooms}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
          >
            <span>View All 21 Rooms</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {availableStudyRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                setSelectedRoom(room);
                onViewClassrooms();
              }}
              className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-left hover:border-emerald-400 transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {room.code}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 capitalize truncate">
                {room.type.replace('-', ' ')}
              </div>
              <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                {room.capacity} seats · Free Now
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
