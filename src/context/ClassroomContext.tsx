import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Classroom, 
  Microphone, 
  Speaker, 
  Booking, 
  CancelledBooking, 
  EmergencyRequest, 
  RoomStatus, 
  RoomType, 
  CampusWeather,
  AVEquipmentRequest,
  ClassroomSwapRequest,
  StudentClassroomRequest,
  DepartmentItem,
  CurriculumCourse,
} from '../types';
import {
  initialClassrooms,
  initialMicrophones,
  initialSpeakers,
  initialBookings,
  initialCancelledBookings,
  initialEmergencyRequests,
  initialDepartmentsData,
  initialCoursesData,
  initialAVRequestsData,
  initialSwapRequestsData,
  initialStudentRequestsData,
} from '../data/mockData';

export const WEATHER_PRESETS: Record<CampusWeather['condition'], CampusWeather> = {
  warm: {
    temperatureC: 33,
    condition: 'warm',
    description: 'Hot Sunshine & Warm Heat (33°C)',
    humidity: 54,
    windSpeedKmh: 10,
    advisoryType: 'umbrella',
    advisoryTitle: 'Umbrella Suggested · Sun & Heat Protection',
    advisoryText: 'Weather is very warm! Suggest using an umbrella for shade against intense sunlight when moving across NLT campus paths.',
    lastUpdated: 'Live Campus Sensor',
  },
  raining: {
    temperatureC: 22,
    condition: 'raining',
    description: 'Heavy Rain Showers & Wet Walkways (22°C)',
    humidity: 93,
    windSpeedKmh: 18,
    advisoryType: 'umbrella',
    advisoryTitle: 'Umbrella Required · Rain Protection',
    advisoryText: 'Active rainfall over campus! Suggest the use of an umbrella to stay dry while navigating between NLT1 and NLT21.',
    lastUpdated: 'Live Campus Sensor',
  },
  windy: {
    temperatureC: 27,
    condition: 'windy',
    description: 'Strong Gusty Winds & Airborne Dust (27°C)',
    humidity: 46,
    windSpeedKmh: 36,
    advisoryType: 'mask-specks',
    advisoryTitle: 'Nose Mask & Specks Suggested · Wind & Dust Protection',
    advisoryText: 'High gusty winds and dust particles detected! Suggest wearing a nose mask with protective specks (glasses) along walkways.',
    lastUpdated: 'Live Campus Sensor',
  },
  mild: {
    temperatureC: 25,
    condition: 'mild',
    description: 'Mild & Pleasant Breeze (25°C)',
    humidity: 62,
    windSpeedKmh: 12,
    advisoryType: 'none',
    advisoryTitle: 'Fair Weather',
    advisoryText: 'Favorable campus weather. Comfortable conditions for classes across NLT lecture theaters.',
    lastUpdated: 'Live Campus Sensor',
  },
};

interface BookingResult {
  success: boolean;
  message: string;
  booking?: Booking;
  conflictingBooking?: Booking;
  suggestedRooms?: Classroom[];
}

interface EmergencyResult {
  success: boolean;
  message: string;
  request: EmergencyRequest;
  allocatedRoom?: Classroom;
}

export type AppTab = 
  | 'dashboard'
  | 'overview' 
  | 'occupied' 
  | 'timetable' 
  | 'book' 
  | 'history' 
  | 'emergency' 
  | 'audio-gear'
  | 'student-requests'
  | 'request-av'
  | 'assigned-courses'
  | 'classroom-swaps'
  | 'approvals'
  | 'manage-classrooms'
  | 'manage-av'
  | 'manage-departments'
  | 'manage-faculty';

interface ClassroomContextType {
  classrooms: Classroom[];
  microphones: Microphone[];
  speakers: Speaker[];
  bookings: Booking[];
  cancelledBookings: CancelledBooking[];
  emergencyRequests: EmergencyRequest[];
  
  // Multi-role Requests & Management State
  avRequests: AVEquipmentRequest[];
  createAVRequest: (data: Omit<AVEquipmentRequest, 'id' | 'requestNumber' | 'requestedAt' | 'status'>) => void;
  updateAVRequestStatus: (id: string, status: AVEquipmentRequest['status'], adminFeedback?: string) => void;

  swapRequests: ClassroomSwapRequest[];
  createSwapRequest: (data: Omit<ClassroomSwapRequest, 'id' | 'requestNumber' | 'requestedAt' | 'status'>) => void;
  updateSwapRequestStatus: (id: string, status: ClassroomSwapRequest['status'], notes?: string) => void;

  studentRequests: StudentClassroomRequest[];
  createStudentRequest: (data: Omit<StudentClassroomRequest, 'id' | 'requestNumber' | 'requestedAt' | 'status'>) => void;
  updateStudentRequestStatus: (id: string, status: StudentClassroomRequest['status'], adminFeedback?: string, allocatedRoomCode?: string) => void;

  departments: DepartmentItem[];
  addDepartment: (dept: Omit<DepartmentItem, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<DepartmentItem>) => void;
  deleteDepartment: (id: string) => void;

  courses: CurriculumCourse[];
  addCourse: (course: Omit<CurriculumCourse, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<CurriculumCourse>) => void;
  deleteCourse: (id: string) => void;

  addClassroom: (room: Classroom) => void;
  updateClassroom: (id: string, updates: Partial<Classroom>) => void;
  
  // Navigation & Filtering
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedRoom: Classroom | null;
  setSelectedRoom: (room: Classroom | null) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  buildingFilter: string;
  setBuildingFilter: (b: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  minCapacityFilter: number;
  setMinCapacityFilter: (c: number) => void;
  avReadyOnly: boolean;
  setAvReadyOnly: (val: boolean) => void;
  
  // Simulation, Weather & App State
  simulatedTime: string;
  setSimulatedTime: (time: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeEmergencyCount: number;
  
  weather: CampusWeather;
  setWeatherCondition: (cond: CampusWeather['condition']) => void;

  // Actions
  bookClassroom: (data: {
    classroomId: string;
    title: string;
    courseCode?: string;
    instructorName: string;
    instructorEmail: string;
    department: string;
    date: string;
    startTime: string;
    endTime: string;
    expectedAttendees: number;
    purpose: Booking['purpose'];
    recurrence: Booking['recurrence'];
    equipmentRequired: Booking['equipmentRequired'];
    notes?: string;
  }) => BookingResult;
  
  cancelBooking: (bookingId: string, reason: CancelledBooking['cancellationReason'], cancelledBy: string, notes?: string) => void;
  cancelClassroomSession: (classroomId: string, reason: CancelledBooking['cancellationReason'], cancelledBy: string, notes?: string) => { success: boolean; message: string };
  rebookCancelled: (cancelledBookingId: string) => { success: boolean; message: string };
  
  createEmergencyRequest: (data: {
    sourceClassroomId?: string;
    reason: EmergencyRequest['reason'];
    requestedBy: string;
    department: string;
    requiredCapacity: number;
    urgency: EmergencyRequest['urgency'];
    audioRequirement: EmergencyRequest['audioRequirement'];
    notes?: string;
  }) => EmergencyResult;
  
  resolveEmergencyRequest: (ticketId: string) => void;
  
  extendSession: (classroomId: string, additionalMinutes: number) => void;
  vacateSession: (classroomId: string) => void;
  
  updateMicrophone: (micId: string, updates: Partial<Microphone>) => void;
  updateSpeaker: (speakerId: string, updates: Partial<Speaker>) => void;
  rechargeMic: (micId: string) => void;
  
  playAudioDiagnostic: (toneType: 'chime' | 'sweep' | 'ping') => void;
  resetToDefaults: () => void;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLASSROOMS: 'campus_nlt_21_v6_classrooms',
  MICS: 'campus_nlt_21_v6_mics',
  SPEAKERS: 'campus_nlt_21_v6_speakers',
  BOOKINGS: 'campus_nlt_21_v6_bookings',
  CANCELLED: 'campus_nlt_21_v6_cancelled',
  EMERGENCY: 'campus_nlt_21_v6_emergency',
  THEME: 'campus_nlt_21_v6_theme',
  WEATHER: 'campus_nlt_21_v6_weather',
  AV_REQUESTS: 'campus_nlt_21_v6_av_requests',
  SWAP_REQUESTS: 'campus_nlt_21_v6_swap_requests',
  STUDENT_REQUESTS: 'campus_nlt_21_v6_student_requests',
  DEPARTMENTS: 'campus_nlt_21_v6_departments',
  COURSES: 'campus_nlt_21_v6_courses',
};

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Weather State
  const [weather, setWeather] = useState<CampusWeather>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEATHER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return WEATHER_PRESETS.warm;
  });

  const setWeatherCondition = (cond: CampusWeather['condition']) => {
    const next = WEATHER_PRESETS[cond] || WEATHER_PRESETS.warm;
    setWeather(next);
    localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(next));
  };

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Clean light academic default, easily toggleable
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Primary Data
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialClassrooms;
  });

  const [microphones, setMicrophones] = useState<Microphone[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MICS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialMicrophones;
  });

  const [speakers, setSpeakers] = useState<Speaker[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPEAKERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialSpeakers;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialBookings;
  });

  const [cancelledBookings, setCancelledBookings] = useState<CancelledBooking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CANCELLED);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialCancelledBookings;
  });

  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialEmergencyRequests;
  });

  // Persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MICS, JSON.stringify(microphones));
  }, [microphones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPEAKERS, JSON.stringify(speakers));
  }, [speakers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANCELLED, JSON.stringify(cancelledBookings));
  }, [cancelledBookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(emergencyRequests));
  }, [emergencyRequests]);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedRoom, setSelectedRoom] = useState<Classroom | null>(null);

  // Multi-role Requests & Management State
  const [avRequests, setAVRequests] = useState<AVEquipmentRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AV_REQUESTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialAVRequestsData;
  });

  const [swapRequests, setSwapRequests] = useState<ClassroomSwapRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SWAP_REQUESTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialSwapRequestsData;
  });

  const [studentRequests, setStudentRequests] = useState<StudentClassroomRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_REQUESTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialStudentRequestsData;
  });

  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialDepartmentsData;
  });

  const [courses, setCourses] = useState<CurriculumCourse[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialCoursesData;
  });

  // Persist multi-role state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AV_REQUESTS, JSON.stringify(avRequests));
  }, [avRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SWAP_REQUESTS, JSON.stringify(swapRequests));
  }, [swapRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_REQUESTS, JSON.stringify(studentRequests));
  }, [studentRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [minCapacityFilter, setMinCapacityFilter] = useState(0);
  const [avReadyOnly, setAvReadyOnly] = useState(false);

  // Simulated Time (Current class countdown reference: 10:15 AM)
  const [simulatedTime, setSimulatedTime] = useState('10:15');

  // Count active emergency alerts
  const activeEmergencyCount = emergencyRequests.filter(r => r.status === 'pending' || r.status === 'dispatched').length;

  // Web Audio Diagnostic Beep / Chime
  const playAudioDiagnostic = (toneType: 'chime' | 'sweep' | 'ping') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (toneType === 'ping') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 ping
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (toneType === 'sweep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        // Multi-frequency chime
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const startTime = ctx.currentTime + index * 0.1;
          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.5);
        });
      }
    } catch (e) {
      console.warn('AudioContext not allowed or not supported yet:', e);
    }
  };

  // Check time overlap helper
  const isTimeOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
    return startA < endB && endA > startB;
  };

  // Action: Book Classroom
  const bookClassroom: ClassroomContextType['bookClassroom'] = (data) => {
    const targetRoom = classrooms.find(r => r.id === data.classroomId);
    if (!targetRoom) {
      return { success: false, message: 'Classroom not found.' };
    }

    // Check conflict against existing active bookings
    const conflict = bookings.find(b => 
      b.classroomId === data.classroomId &&
      b.status === 'active' &&
      b.date === data.date &&
      isTimeOverlap(data.startTime, data.endTime, b.startTime, b.endTime)
    );

    if (conflict) {
      // Find smart alternatives: same or greater capacity, not conflicting
      const alternatives = classrooms.filter(r => {
        if (r.id === data.classroomId) return false;
        if (r.status === 'maintenance') return false;
        if (r.capacity < data.expectedAttendees) return false;
        // Check if alternative has conflict
        const hasOtherConflict = bookings.some(b => 
          b.classroomId === r.id &&
          b.status === 'active' &&
          b.date === data.date &&
          isTimeOverlap(data.startTime, data.endTime, b.startTime, b.endTime)
        );
        return !hasOtherConflict;
      }).slice(0, 3);

      return {
        success: false,
        message: `Conflict detected! Room ${targetRoom.code} is already booked by ${conflict.instructorName} (${conflict.startTime} - ${conflict.endTime}).`,
        conflictingBooking: conflict,
        suggestedRooms: alternatives,
      };
    }

    // Create booking
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      bookingRef: `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      classroomId: data.classroomId,
      classroomCode: targetRoom.code,
      title: data.title,
      courseCode: data.courseCode || 'GEN-101',
      instructorName: data.instructorName,
      instructorEmail: data.instructorEmail,
      department: data.department,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      expectedAttendees: data.expectedAttendees,
      purpose: data.purpose,
      recurrence: data.recurrence,
      equipmentRequired: data.equipmentRequired,
      bookedAt: new Date().toISOString(),
      status: 'active',
      notes: data.notes,
    };

    setBookings(prev => [newBooking, ...prev]);

    // Mark room as reserved immediately
    setClassrooms(prev => prev.map(r => {
      if (r.id === data.classroomId) {
        return {
          ...r,
          status: 'reserved',
          currentSession: {
            id: `sess-${Date.now()}`,
            courseCode: data.courseCode || 'RES',
            courseName: data.title,
            instructor: data.instructorName,
            department: data.department,
            startTime: data.startTime,
            endTime: data.endTime,
            attendeeCount: data.expectedAttendees,
            requiresMics: data.equipmentRequired.wirelessHandheldMic || data.equipmentRequired.lapelMic,
            requiresSpeakers: data.equipmentRequired.highPowerSpeakers,
            isReservation: true,
            bookingRef: newBooking.bookingRef,
          },
        };
      }
      return r;
    }));

    playAudioDiagnostic('chime');
    return {
      success: true,
      message: `Successfully booked ${targetRoom.code} for ${data.title}!`,
      booking: newBooking,
    };
  };

  // Action: Cancel Booking
  const cancelBooking = (
    bookingId: string,
    reason: CancelledBooking['cancellationReason'],
    cancelledBy: string,
    notes?: string
  ) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Remove from active bookings
    setBookings(prev => prev.filter(b => b.id !== bookingId));

    // Add to cancelled bookings list
    const newCancelled: CancelledBooking = {
      id: `cancel-${Date.now()}`,
      bookingRef: booking.bookingRef,
      classroomId: booking.classroomId,
      classroomCode: booking.classroomCode,
      title: booking.title,
      courseCode: booking.courseCode,
      instructorName: booking.instructorName,
      department: booking.department,
      originalDate: booking.date,
      originalStartTime: booking.startTime,
      originalEndTime: booking.endTime,
      expectedAttendees: booking.expectedAttendees,
      cancelledAt: new Date().toISOString(),
      cancelledBy: cancelledBy || 'Classroom Coordinator',
      cancellationReason: reason,
      notes: notes || 'Cancelled via CampusSpace portal.',
    };

    setCancelledBookings(prev => [newCancelled, ...prev]);

    // If room is currently tied to this booking session, free it up
    setClassrooms(prev => prev.map(r => {
      if (r.id === booking.classroomId && (r.status === 'occupied' || r.status === 'reserved')) {
        return {
          ...r,
          status: 'available',
          currentSession: undefined,
        };
      }
      return r;
    }));
  };

  // Action: Cancel Classroom Session directly from Classroom Card / Modal
  const cancelClassroomSession = (
    classroomId: string,
    reason: CancelledBooking['cancellationReason'],
    cancelledBy: string,
    notes?: string
  ): { success: boolean; message: string } => {
    const room = classrooms.find(r => r.id === classroomId);
    if (!room) return { success: false, message: 'Classroom not found.' };

    // Check if there is an active booking for this classroom
    const activeBooking = bookings.find(b => b.classroomId === classroomId && b.status === 'active');
    if (activeBooking) {
      cancelBooking(activeBooking.id, reason, cancelledBy, notes);
      return {
        success: true,
        message: `Session in ${room.code} (${activeBooking.title}) cancelled. Room is now available.`,
      };
    }

    // If there is an active ongoing session without a separate booking record
    if (room.currentSession) {
      const newCancelled: CancelledBooking = {
        id: `cancel-${Date.now()}`,
        bookingRef: room.currentSession.bookingRef || `BK-NLT-CUR-${Math.floor(1000 + Math.random() * 9000)}`,
        classroomId: room.id,
        classroomCode: room.code,
        title: room.currentSession.courseName,
        courseCode: room.currentSession.courseCode,
        instructorName: room.currentSession.instructor,
        department: room.currentSession.department,
        originalDate: '2026-11-04',
        originalStartTime: room.currentSession.startTime,
        originalEndTime: room.currentSession.endTime,
        expectedAttendees: room.currentSession.attendeeCount,
        cancelledAt: new Date().toISOString(),
        cancelledBy: cancelledBy || 'Classroom Coordinator',
        cancellationReason: reason,
        notes: notes || 'Class ended early / cancelled via NLT Room Manager.',
      };
      setCancelledBookings(prev => [newCancelled, ...prev]);
    }

    // Free the classroom
    setClassrooms(prev => prev.map(r => {
      if (r.id === classroomId) {
        return {
          ...r,
          status: 'available',
          currentSession: undefined,
        };
      }
      return r;
    }));

    playAudioDiagnostic('ping');
    return {
      success: true,
      message: `Class in ${room.code} cancelled. Room is now marked Available.`,
    };
  };

  // Action: Rebook a previously cancelled booking
  const rebookCancelled = (cancelledBookingId: string): { success: boolean; message: string } => {
    const item = cancelledBookings.find(c => c.id === cancelledBookingId);
    if (!item) return { success: false, message: 'Cancelled record not found.' };

    const targetRoom = classrooms.find(r => r.id === item.classroomId);
    if (!targetRoom) return { success: false, message: 'Classroom not found.' };

    // Check conflict
    const conflict = bookings.find(b => 
      b.classroomId === item.classroomId &&
      b.status === 'active' &&
      b.date === item.originalDate &&
      isTimeOverlap(item.originalStartTime, item.originalEndTime, b.startTime, b.endTime)
    );

    if (conflict) {
      return {
        success: false,
        message: `Cannot rebook. Room ${targetRoom.code} has since been booked by ${conflict.instructorName}.`,
      };
    }

    // Create reinstated booking
    const restoredBooking: Booking = {
      id: `book-${Date.now()}`,
      bookingRef: `BK-REST-${Math.floor(1000 + Math.random() * 9000)}`,
      classroomId: item.classroomId,
      classroomCode: item.classroomCode,
      title: item.title,
      courseCode: item.courseCode,
      instructorName: item.instructorName,
      instructorEmail: `${item.instructorName.toLowerCase().replace(/[^a-z]/g, '')}@campus.edu`,
      department: item.department,
      date: item.originalDate,
      startTime: item.originalStartTime,
      endTime: item.originalEndTime,
      expectedAttendees: item.expectedAttendees,
      purpose: 'lecture',
      recurrence: 'once',
      equipmentRequired: {
        wirelessHandheldMic: true,
        lapelMic: false,
        highPowerSpeakers: true,
        dualProjector: true,
        lectureRecording: false,
      },
      bookedAt: new Date().toISOString(),
      status: 'active',
      notes: `Restored from cancellation ${item.bookingRef}`,
    };

    setBookings(prev => [restoredBooking, ...prev]);
    // Remove from cancelled list
    setCancelledBookings(prev => prev.filter(c => c.id !== cancelledBookingId));
    playAudioDiagnostic('chime');

    return {
      success: true,
      message: `Booking ${restoredBooking.bookingRef} successfully re-activated for ${targetRoom.code}!`,
    };
  };

  // Action: Emergency Classroom Request
  const createEmergencyRequest = (data: {
    sourceClassroomId?: string;
    reason: EmergencyRequest['reason'];
    requestedBy: string;
    department: string;
    requiredCapacity: number;
    urgency: EmergencyRequest['urgency'];
    audioRequirement: EmergencyRequest['audioRequirement'];
    notes?: string;
  }): EmergencyResult => {
    const sourceRoom = data.sourceClassroomId 
      ? classrooms.find(r => r.id === data.sourceClassroomId)
      : undefined;

    // Search for emergency allocation:
    // 1st priority: Rooms marked 'emergency-standby' with verified audio
    // 2nd priority: Rooms marked 'available' with capacity >= requiredCapacity and operational microphones
    let candidates = classrooms.filter(r => 
      r.id !== data.sourceClassroomId &&
      (r.status === 'emergency-standby' || r.status === 'available') &&
      r.capacity >= (data.requiredCapacity || 30)
    );

    // If audio is mandatory, ensure candidate room has working mic and speaker
    if (data.audioRequirement === 'must-have-working-mic-and-speaker') {
      candidates = candidates.filter(r => {
        const hasWorkingMic = microphones.some(m => m.classroomId === r.id && (m.status === 'operational' || m.status === 'charging') && m.batteryPercentage >= 20);
        const hasWorkingSpeaker = speakers.some(s => s.classroomId === r.id && s.status === 'operational');
        return hasWorkingMic && hasWorkingSpeaker;
      });
    }

    // Sort: prefer emergency-standby first, then closest capacity fit
    candidates.sort((a, b) => {
      if (a.status === 'emergency-standby' && b.status !== 'emergency-standby') return -1;
      if (b.status === 'emergency-standby' && a.status !== 'emergency-standby') return 1;
      return a.capacity - b.capacity;
    });

    const allocatedRoom = candidates[0];

    const newRequest: EmergencyRequest = {
      id: `emg-${Date.now()}`,
      ticketNumber: `EMG-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceClassroomId: data.sourceClassroomId,
      sourceClassroomCode: sourceRoom?.code,
      allocatedClassroomId: allocatedRoom ? allocatedRoom.id : undefined,
      allocatedClassroomCode: allocatedRoom ? allocatedRoom.code : undefined,
      reason: data.reason,
      requestedBy: data.requestedBy,
      department: data.department,
      requestedAt: new Date().toISOString(),
      requiredCapacity: data.requiredCapacity,
      urgency: data.urgency,
      audioRequirement: data.audioRequirement,
      status: allocatedRoom ? 'allocated' : 'pending',
      notes: data.notes,
    };

    setEmergencyRequests(prev => [newRequest, ...prev]);

    if (allocatedRoom) {
      // Reallocate: mark old room under maintenance/investigation if AV failed, move session to allocated room
      setClassrooms(prev => prev.map(r => {
        if (r.id === allocatedRoom.id) {
          return {
            ...r,
            status: 'occupied',
            currentSession: sourceRoom?.currentSession ? {
              ...sourceRoom.currentSession,
              id: `sess-swap-${Date.now()}`,
            } : {
              id: `sess-emg-${Date.now()}`,
              courseCode: 'EMERGENCY',
              courseName: `Urgent Reallocation (${data.reason})`,
              instructor: data.requestedBy,
              department: data.department,
              startTime: simulatedTime,
              endTime: '12:00',
              attendeeCount: data.requiredCapacity,
              requiresMics: true,
              requiresSpeakers: true,
            },
          };
        }
        if (sourceRoom && r.id === sourceRoom.id) {
          return {
            ...r,
            status: data.reason.includes('Audio') || data.reason.includes('Display') || data.reason.includes('Thermal') 
              ? 'maintenance' 
              : 'available',
            currentSession: undefined,
          };
        }
        return r;
      }));

      playAudioDiagnostic('sweep');
      return {
        success: true,
        message: `Emergency Classroom Allocated: Room ${allocatedRoom.code} (${allocatedRoom.building}) is dispatched with fully tested audio gear!`,
        request: newRequest,
        allocatedRoom,
      };
    } else {
      return {
        success: false,
        message: `No immediate room found meeting the capacity (${data.requiredCapacity}) and audio requirements. Request queued for urgent technician review.`,
        request: newRequest,
      };
    }
  };

  // Resolve emergency request
  const resolveEmergencyRequest = (ticketId: string) => {
    setEmergencyRequests(prev => prev.map(req => {
      if (req.id === ticketId) {
        return {
          ...req,
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  // Extend occupied session
  const extendSession = (classroomId: string, additionalMinutes: number) => {
    setClassrooms(prev => prev.map(r => {
      if (r.id === classroomId && r.currentSession) {
        const [hours, mins] = r.currentSession.endTime.split(':').map(Number);
        const totalMins = hours * 60 + mins + additionalMinutes;
        const newHours = Math.floor(totalMins / 60) % 24;
        const newMins = totalMins % 60;
        const newEndTime = `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
        return {
          ...r,
          currentSession: {
            ...r.currentSession,
            endTime: newEndTime,
          },
        };
      }
      return r;
    }));
    playAudioDiagnostic('ping');
  };

  // Vacate session early
  const vacateSession = (classroomId: string) => {
    setClassrooms(prev => prev.map(r => {
      if (r.id === classroomId) {
        return {
          ...r,
          status: 'available',
          currentSession: undefined,
        };
      }
      return r;
    }));
    playAudioDiagnostic('ping');
  };

  // Microphones and Speakers updates
  const updateMicrophone = (micId: string, updates: Partial<Microphone>) => {
    setMicrophones(prev => prev.map(m => (m.id === micId ? { ...m, ...updates } : m)));
  };

  const updateSpeaker = (speakerId: string, updates: Partial<Speaker>) => {
    setSpeakers(prev => prev.map(s => (s.id === speakerId ? { ...s, ...updates } : s)));
  };

  const rechargeMic = (micId: string) => {
    setMicrophones(prev => prev.map(m => {
      if (m.id === micId) {
        return {
          ...m,
          status: 'operational',
          batteryPercentage: 100,
          lastTestedAt: 'Just now',
          notes: 'Freshly swapped / fully charged to 100%',
        };
      }
      return m;
    }));
    playAudioDiagnostic('ping');
  };

  // Request Handlers
  const createAVRequest = (data: Omit<AVEquipmentRequest, 'id' | 'requestNumber' | 'requestedAt' | 'status'>) => {
    const newReq: AVEquipmentRequest = {
      ...data,
      id: `av-req-${Date.now()}`,
      requestNumber: `AV-REQ-${Math.floor(100 + Math.random() * 900)}`,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    setAVRequests(prev => [newReq, ...prev]);
  };

  const updateAVRequestStatus = (id: string, status: AVEquipmentRequest['status'], adminFeedback?: string) => {
    setAVRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status,
          adminFeedback: adminFeedback !== undefined ? adminFeedback : req.adminFeedback,
        };
      }
      return req;
    }));
  };

  const createSwapRequest = (data: Omit<ClassroomSwapRequest, 'id' | 'requestNumber' | 'requestedAt' | 'status'>) => {
    const newSwap: ClassroomSwapRequest = {
      ...data,
      id: `swap-req-${Date.now()}`,
      requestNumber: `SWAP-NLT-${Math.floor(200 + Math.random() * 800)}`,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    setSwapRequests(prev => [newSwap, ...prev]);
  };

  const updateSwapRequestStatus = (id: string, status: ClassroomSwapRequest['status'], notes?: string) => {
    setSwapRequests(prev => prev.map(swap => {
      if (swap.id === id) {
        return {
          ...swap,
          status,
          notes: notes || swap.notes,
          respondedAt: new Date().toISOString(),
        };
      }
      return swap;
    }));

    // If approved, perform actual classroom swap
    if (status === 'approved') {
      const targetSwap = swapRequests.find(s => s.id === id);
      if (targetSwap) {
        setClassrooms(prev => {
          const roomA = prev.find(r => r.code === targetSwap.requesterRoomCode);
          const roomB = prev.find(r => r.code === targetSwap.targetRoomCode);
          if (!roomA || !roomB) return prev;

          const sessionA = roomA.currentSession;
          const sessionB = roomB.currentSession;

          return prev.map(r => {
            if (r.code === targetSwap.requesterRoomCode) {
              return { ...r, currentSession: sessionB, status: sessionB ? 'occupied' : 'available' };
            }
            if (r.code === targetSwap.targetRoomCode) {
              return { ...r, currentSession: sessionA, status: sessionA ? 'occupied' : 'available' };
            }
            return r;
          });
        });
      }
    }
  };

  const createStudentRequest = (data: Omit<StudentClassroomRequest, 'id' | 'requestNumber' | 'requestedAt' | 'status'>) => {
    const newReq: StudentClassroomRequest = {
      ...data,
      id: `stu-req-${Date.now()}`,
      requestNumber: `STU-REQ-${Math.floor(300 + Math.random() * 700)}`,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    setStudentRequests(prev => [newReq, ...prev]);
  };

  const updateStudentRequestStatus = (
    id: string, 
    status: StudentClassroomRequest['status'], 
    adminFeedback?: string, 
    allocatedRoomCode?: string
  ) => {
    setStudentRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status,
          adminFeedback: adminFeedback || req.adminFeedback,
          allocatedRoomCode: allocatedRoomCode || req.allocatedRoomCode || req.preferredClassroomCode,
        };
      }
      return req;
    }));

    // If approved, mark the room as reserved with the student session
    if (status === 'approved') {
      const req = studentRequests.find(r => r.id === id);
      if (req) {
        const roomCode = allocatedRoomCode || req.preferredClassroomCode;
        setClassrooms(prev => prev.map(r => {
          if (r.code === roomCode && (r.status === 'available' || r.status === 'reserved')) {
            return {
              ...r,
              status: 'reserved',
              currentSession: {
                id: `sess-stu-${req.id}`,
                courseCode: 'STUDENT-SESSION',
                courseName: `${req.purpose} (${req.studentName})`,
                instructor: `${req.studentName} [${req.studentIndexNumber}]`,
                department: req.department,
                startTime: req.startTime,
                endTime: req.endTime,
                attendeeCount: req.expectedAttendees,
                requiresMics: false,
                requiresSpeakers: false,
                isReservation: true,
                bookingRef: req.requestNumber,
              },
            };
          }
          return r;
        }));
      }
    }
  };

  // Department Management Handlers
  const addDepartment = (dept: Omit<DepartmentItem, 'id'>) => {
    const newDept: DepartmentItem = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    setDepartments(prev => [...prev, newDept]);
  };

  const updateDepartment = (id: string, updates: Partial<DepartmentItem>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  // Course & Faculty Management Handlers
  const addCourse = (course: Omit<CurriculumCourse, 'id'>) => {
    const newCourse: CurriculumCourse = {
      ...course,
      id: `course-${Date.now()}`,
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const updateCourse = (id: string, updates: Partial<CurriculumCourse>) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  // Classroom Management Handlers
  const addClassroom = (room: Classroom) => {
    setClassrooms(prev => [...prev, room]);
  };

  const updateClassroom = (id: string, updates: Partial<Classroom>) => {
    setClassrooms(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  // Reset demo data to defaults
  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.CLASSROOMS);
    localStorage.removeItem(STORAGE_KEYS.MICS);
    localStorage.removeItem(STORAGE_KEYS.SPEAKERS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.CANCELLED);
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY);
    localStorage.removeItem(STORAGE_KEYS.AV_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.SWAP_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEYS.COURSES);

    setClassrooms(initialClassrooms);
    setMicrophones(initialMicrophones);
    setSpeakers(initialSpeakers);
    setBookings(initialBookings);
    setCancelledBookings(initialCancelledBookings);
    setEmergencyRequests(initialEmergencyRequests);
    setAVRequests(initialAVRequestsData);
    setSwapRequests(initialSwapRequestsData);
    setStudentRequests(initialStudentRequestsData);
    setDepartments(initialDepartmentsData);
    setCourses(initialCoursesData);
    setSimulatedTime('10:15');
  };

  return (
    <ClassroomContext.Provider
      value={{
        classrooms,
        microphones,
        speakers,
        bookings,
        cancelledBookings,
        emergencyRequests,
        avRequests,
        createAVRequest,
        updateAVRequestStatus,
        swapRequests,
        createSwapRequest,
        updateSwapRequestStatus,
        studentRequests,
        createStudentRequest,
        updateStudentRequestStatus,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        addClassroom,
        updateClassroom,
        activeTab,
        setActiveTab,
        selectedRoom,
        setSelectedRoom,
        searchQuery,
        setSearchQuery,
        buildingFilter,
        setBuildingFilter,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        minCapacityFilter,
        setMinCapacityFilter,
        avReadyOnly,
        setAvReadyOnly,
        simulatedTime,
        setSimulatedTime,
        theme,
        toggleTheme,
        activeEmergencyCount,
        weather,
        setWeatherCondition,
        bookClassroom,
        cancelBooking,
        cancelClassroomSession,
        rebookCancelled,
        createEmergencyRequest,
        resolveEmergencyRequest,
        extendSession,
        vacateSession,
        updateMicrophone,
        updateSpeaker,
        rechargeMic,
        playAudioDiagnostic,
        resetToDefaults,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error('useClassroom must be used within a ClassroomProvider');
  }
  return context;
};
