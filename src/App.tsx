import React, { useState } from 'react';
import { ClassroomProvider, useClassroom } from './context/ClassroomContext';
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
import { BookingModal } from './components/BookingModal';
import { EmergencyRequestModal } from './components/EmergencyRequestModal';
import { ClassroomDetailModal } from './components/ClassroomDetailModal';
import { CancelClassModal } from './components/CancelClassModal';
import { Classroom } from './types';
import { CheckCircle2, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useClassroom();

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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

      {/* Top Navigation Bar */}
      <Navbar
        onOpenEmergencyModal={() => handleOpenEmergencyModal()}
        onOpenBookingModal={() => handleOpenBookingModal()}
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

        {/* View Routing */}
        <div className="mt-2">
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

      {/* Mobile Bottom Navigation (Thumb Zone) */}
      <BottomNav
        onOpenBookingModal={() => handleOpenBookingModal()}
        onOpenEmergencyModal={() => handleOpenEmergencyModal()}
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

    </div>
  );
};

export default function App() {
  return (
    <ClassroomProvider>
      <MainLayout />
    </ClassroomProvider>
  );
}
