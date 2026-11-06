import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassroomProvider, useClassroom } from './context/ClassroomContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { LiveWeatherTimeBar } from './components/LiveWeatherTimeBar';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { EmergencyBanner } from './components/EmergencyBanner';
import { StatsBar } from './components/StatsBar';
import { ClassroomGrid } from './components/ClassroomGrid';
import { OccupiedClassesView } from './components/OccupiedClassesView';
import { TimetableView } from './components/TimetableView';
import { BookingsHistoryView } from './components/BookingsHistoryView';
import { AudioEquipmentView } from './components/AudioEquipmentView';
import { EmergencyDispatchView } from './components/EmergencyDispatchView';
import { StudentDashboard } from './components/StudentDashboard';
import { LecturerDashboard } from './components/LecturerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingModal } from './components/BookingModal';
import { EmergencyRequestModal } from './components/EmergencyRequestModal';
import { ClassroomDetailModal } from './components/ClassroomDetailModal';
import { CancelClassModal } from './components/CancelClassModal';
import { StudentRequestRoomModal } from './components/StudentRequestRoomModal';
import { RequestAVModal } from './components/RequestAVModal';
import { ClassroomSwapsModal } from './components/ClassroomSwapsModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { Classroom } from './types';
import { CheckCircle2, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useClassroom();
  const { user, role } = useAuth();

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isStudentRoomModalOpen, setIsStudentRoomModalOpen] = useState(false);
  const [isRequestAVModalOpen, setIsRequestAVModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [reportIssueRoomCode, setReportIssueRoomCode] = useState('NLT2');

  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Classroom | null>(null);
  const [selectedRoomForEmergency, setSelectedRoomForEmergency] = useState<Classroom | null>(null);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Classroom | null>(null);
  const [selectedRoomForCancel, setSelectedRoomForCancel] = useState<Classroom | null>(null);

  // Global notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  const handleOpenBookingModal = (room?: Classroom) => {
    setSelectedRoomForBooking(room || null);
    setIsBookingModalOpen(true);
  };

  const handleOpenEmergencyModal = (room?: Classroom) => {
    setSelectedRoomForEmergency(room || null);
    setIsEmergencyModalOpen(true);
  };

  const handleOpenCancelModal = (room: Classroom) => {
    setSelectedRoomForCancel(room);
    setIsCancelModalOpen(true);
  };

  const handleBookSlotFromTimetable = (room: Classroom, _timeSlot: string) => {
    setSelectedRoomForBooking(room);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors pb-20 lg:pb-8">
      
      {/* Live Time Display & Weather Bar with Adaptive Advisories */}
      <LiveWeatherTimeBar />

      {/* Top Navigation Bar with Role Switcher & User Profile */}
      <Navbar
        onOpenEmergencyModal={() => handleOpenEmergencyModal()}
        onOpenBookingModal={() => handleOpenBookingModal()}
        onOpenRequestRoomModal={() => setIsStudentRoomModalOpen(true)}
        onOpenRequestAVModal={() => setIsRequestAVModalOpen(true)}
        onOpenSwapModal={() => setIsSwapModalOpen(true)}
      />

      {/* Emergency Alert Notification Banner */}
      <EmergencyBanner
        onOpenEmergencyHub={() => setActiveTab('emergency')}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-medium border border-slate-700 dark:border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white dark:hover:text-slate-900 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* High-level Counters & Quick Filter Strip */}
        <StatsBar />

        {/* View Routing & Role-Specific Dashboards */}
        <div className="mt-4">
          
          {/* 1. ROLE DASHBOARDS */}
          {activeTab === 'dashboard' && (
            <>
              {role === 'student' && (
                <StudentDashboard
                  onOpenRequestRoomModal={() => setIsStudentRoomModalOpen(true)}
                  onOpenRequestAVModal={() => setIsRequestAVModalOpen(true)}
                  onOpenEmergencyModal={() => handleOpenEmergencyModal()}
                  onViewClassrooms={() => setActiveTab('overview')}
                />
              )}
              {role === 'lecturer' && (
                <LecturerDashboard
                  onOpenSwapModal={() => setIsSwapModalOpen(true)}
                  onOpenRequestAVModal={() => setIsRequestAVModalOpen(true)}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                  onOpenEmergencyModal={() => handleOpenEmergencyModal()}
                  onOpenReportIssueModal={(roomCode?: string) => {
                    if (roomCode) setReportIssueRoomCode(roomCode);
                    setIsReportIssueModalOpen(true);
                  }}
                  onViewClassrooms={() => setActiveTab('overview')}
                />
              )}
              {role === 'admin' && (
                <AdminDashboard
                  onOpenBookingModal={() => handleOpenBookingModal()}
                  onOpenEmergencyModal={() => handleOpenEmergencyModal()}
                />
              )}
            </>
          )}

          {/* 2. SPECIFIC SUB-VIEWS */}
          {activeTab === 'student-requests' && (
            <StudentDashboard
              onOpenRequestRoomModal={() => setIsStudentRoomModalOpen(true)}
              onOpenRequestAVModal={() => setIsRequestAVModalOpen(true)}
              onOpenEmergencyModal={() => handleOpenEmergencyModal()}
              onViewClassrooms={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'assigned-courses' && (
            <LecturerDashboard
              onOpenSwapModal={() => setIsSwapModalOpen(true)}
              onOpenRequestAVModal={() => setIsRequestAVModalOpen(true)}
              onOpenBookingModal={() => handleOpenBookingModal()}
              onOpenEmergencyModal={() => handleOpenEmergencyModal()}
              onOpenReportIssueModal={(roomCode?: string) => {
                if (roomCode) setReportIssueRoomCode(roomCode);
                setIsReportIssueModalOpen(true);
              }}
              onViewClassrooms={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'classroom-swaps' && (
            <LecturerDashboard
              onOpenSwapModal={() => setIsSwapModalOpen(true)}
              onOpenRequestAVModal={() => setIsRequestAVModalOpen(true)}
              onOpenBookingModal={() => handleOpenBookingModal()}
              onOpenEmergencyModal={() => handleOpenEmergencyModal()}
              onOpenReportIssueModal={(roomCode?: string) => {
                if (roomCode) setReportIssueRoomCode(roomCode);
                setIsReportIssueModalOpen(true);
              }}
              onViewClassrooms={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'approvals' && (
            <AdminDashboard
              onOpenBookingModal={() => handleOpenBookingModal()}
              onOpenEmergencyModal={() => handleOpenEmergencyModal()}
            />
          )}

          {/* 3. CORE SHARED CAMPUS VIEWS */}
          {activeTab === 'overview' && (
            <ClassroomGrid
              onSelectRoom={(room) => setSelectedRoomForDetail(room)}
              onBookRoom={(room) => handleOpenBookingModal(room)}
              onEmergencySwap={(room) => handleOpenEmergencyModal(room)}
              onCancelClass={(room) => handleOpenCancelModal(room)}
            />
          )}

          {activeTab === 'occupied' && (
            <OccupiedClassesView
              onOpenEmergencyModalWithRoom={(room) => handleOpenEmergencyModal(room)}
              onCancelClass={(room) => handleOpenCancelModal(room)}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableView
              onBookSlot={handleBookSlotFromTimetable}
            />
          )}

          {activeTab === 'history' && (
            <BookingsHistoryView
              onOpenBookingModal={() => handleOpenBookingModal()}
            />
          )}

          {activeTab === 'audio-gear' && (
            <AudioEquipmentView />
          )}

          {activeTab === 'emergency' && (
            <EmergencyDispatchView
              onOpenEmergencyModal={() => handleOpenEmergencyModal()}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenBookingModal={() => handleOpenBookingModal()}
        onOpenEmergencyModal={() => handleOpenEmergencyModal()}
        onOpenRequestRoomModal={() => setIsStudentRoomModalOpen(true)}
        onOpenRequestAVModal={() => setIsRequestAVModalOpen(true)}
        onOpenSwapModal={() => setIsSwapModalOpen(true)}
      />

      {/* Booking Wizard Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedRoom={selectedRoomForBooking}
      />

      {/* Emergency Request Modal */}
      <EmergencyRequestModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        initialSourceRoom={selectedRoomForEmergency}
      />

      {/* Cancel Class Modal */}
      <CancelClassModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        classroom={selectedRoomForCancel}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Classroom Technical Dossier Modal */}
      <ClassroomDetailModal
        room={selectedRoomForDetail}
        onClose={() => setSelectedRoomForDetail(null)}
        onBookRoom={(room) => handleOpenBookingModal(room)}
        onEmergencySwap={(room) => handleOpenEmergencyModal(room)}
        onCancelClass={(room) => handleOpenCancelModal(room)}
      />

      {/* Student Request Room Modal */}
      <StudentRequestRoomModal
        isOpen={isStudentRoomModalOpen}
        onClose={() => setIsStudentRoomModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Request AV Equipment Modal */}
      <RequestAVModal
        isOpen={isRequestAVModalOpen}
        onClose={() => setIsRequestAVModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Lecturer Classroom Swaps Modal */}
      <ClassroomSwapsModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Faculty Report Equipment / Projector Issue Modal */}
      <ReportIssueModal
        isOpen={isReportIssueModalOpen}
        onClose={() => setIsReportIssueModalOpen(false)}
        defaultRoomCode={reportIssueRoomCode}
      />

    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (toPath: string) => {
    if (window.location.pathname !== toPath) {
      window.history.pushState({}, '', toPath);
    }
    setCurrentPath(toPath);
  };

  // Route: /signup (Unauthenticated or redirect if logged in)
  if (currentPath === '/signup') {
    if (isAuthenticated && user) {
      navigate('/');
    } else {
      return <Signup onNavigate={navigate} />;
    }
  }

  // Route: /login (Unauthenticated or redirect if logged in)
  if (currentPath === '/login') {
    if (isAuthenticated && user) {
      navigate('/');
    } else {
      return <Login onNavigate={navigate} />;
    }
  }

  // Protected Routes: If no user, redirect to /login
  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState({}, '', '/login');
    }
    return <Login onNavigate={navigate} />;
  }

  // Authenticated Dashboard & Protected App Pages
  return <MainLayout />;
};

export default function App() {
  return (
    <AuthProvider>
      <ClassroomProvider>
        <AppContent />
      </ClassroomProvider>
    </AuthProvider>
  );
}
