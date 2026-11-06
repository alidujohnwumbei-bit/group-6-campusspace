export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved' | 'emergency-standby';

export type RoomType = 'lecture-hall' | 'smart-seminar' | 'computer-lab' | 'amphitheater' | 'executive-studio';

export type BuildingWing = 
  | 'NLT Block · Level 1 (NLT 1-7)' 
  | 'NLT Block · Level 2 (NLT 8-14)' 
  | 'NLT Block · Level 3 (NLT 15-21)' 
  | 'NLT Classroom Block'
  | string;

export interface CampusWeather {
  temperatureC: number;
  condition: 'warm' | 'raining' | 'windy' | 'mild';
  description: string;
  humidity: number;
  windSpeedKmh: number;
  advisoryType: 'umbrella' | 'mask-specks' | 'none';
  advisoryTitle: string;
  advisoryText: string;
  lastUpdated: string;
}

export interface Microphone {
  id: string;
  name: string;
  type: 'wireless-handheld' | 'wireless-lapel' | 'podium-gooseneck' | 'boundary-table';
  brandModel: string;
  classroomId: string;
  status: 'operational' | 'in-use' | 'low-battery' | 'charging' | 'repair-needed';
  batteryPercentage: number;
  channelFrequency: string; // e.g. "542.125 MHz"
  lastTestedAt: string;
  notes?: string;
}

export interface Speaker {
  id: string;
  name: string;
  type: 'ceiling-line-array' | 'stereo-soundbar' | 'auditorium-pa' | 'floor-monitors' | 'hearing-loop';
  brandModel: string;
  classroomId: string;
  status: 'operational' | 'in-use' | 'buzzing-issue' | 'offline' | 'needs-calibration';
  outputDecibels: number; // e.g. 78 dB
  amplifierModel: string;
  lastTestedAt: string;
  notes?: string;
}

export interface Classroom {
  id: string;
  code: string; // e.g. "NLT1" to "NLT100"
  name: string; // e.g. "NLT 1 - Main Lecture Hall"
  building: BuildingWing;
  floor: number;
  capacity: number;
  type: RoomType;
  status: RoomStatus;
  airConditioning: 'optimal' | 'cooling' | 'issue' | 'off';
  projectorDisplay: 'dual-laser-4k' | 'interactive-smartboard' | 'standard-hd' | 'none';
  accessibility: {
    wheelchairAccessible: boolean;
    assistiveListeningLoop: boolean;
  };
  currentSession?: {
    id: string;
    courseCode: string;
    courseName: string;
    instructor: string;
    department: string;
    startTime: string; // "09:00"
    endTime: string;   // "10:30"
    attendeeCount: number;
    requiresMics: boolean;
    requiresSpeakers: boolean;
    isReservation?: boolean;
    bookingRef?: string;
  };
}

export interface Booking {
  id: string;
  bookingRef: string; // e.g. "BK-2026-8821"
  classroomId: string;
  classroomCode: string;
  title: string;
  courseCode?: string;
  instructorName: string;
  instructorEmail: string;
  department: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "10:00"
  endTime: string;   // "11:30"
  expectedAttendees: number;
  purpose: 'lecture' | 'seminar' | 'examination' | 'guest-speaker' | 'workshop' | 'emergency-swap';
  recurrence: 'once' | 'weekly-4-weeks' | 'weekly-semester';
  equipmentRequired: {
    wirelessHandheldMic: boolean;
    lapelMic: boolean;
    highPowerSpeakers: boolean;
    dualProjector: boolean;
    lectureRecording: boolean;
  };
  bookedAt: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface CancelledBooking {
  id: string;
  bookingRef: string;
  classroomId: string;
  classroomCode: string;
  title: string;
  courseCode?: string;
  instructorName: string;
  department: string;
  originalDate: string;
  originalStartTime: string;
  originalEndTime: string;
  expectedAttendees: number;
  cancelledAt: string;
  cancelledBy: string;
  cancellationReason: 
    | 'Lecturer Illness / Emergency'
    | 'Rescheduled to Other Date'
    | 'Class Moved Online / Hybrid'
    | 'AV Hardware / Microphone Malfunction'
    | 'Emergency Classroom Requisition'
    | 'Low Expected Attendance'
    | 'Other Department Request';
  rebookedId?: string;
  notes?: string;
}

export interface EmergencyRequest {
  id: string;
  ticketNumber: string; // e.g. "EMG-4091"
  sourceClassroomId?: string;
  sourceClassroomCode?: string;
  allocatedClassroomId?: string;
  allocatedClassroomCode?: string;
  reason: 
    | 'Microphone / Sound Audio Failure'
    | 'Projector Display Blackout'
    | 'Air Conditioning / Thermal Fault'
    | 'Classroom Flooding / Water Leak'
    | 'Severe Overflow Attendance (+40%)'
    | 'VIP Guest Lecture Priority'
    | 'Urgent Exam Reschedule';
  requestedBy: string;
  department: string;
  requestedAt: string;
  requiredCapacity: number;
  urgency: 'immediate' | 'next-30-mins' | 'today';
  audioRequirement: 'must-have-working-mic-and-speaker' | 'standard' | 'none';
  status: 'pending' | 'allocated' | 'dispatched' | 'resolved';
  resolvedAt?: string;
  notes?: string;
}

// ==========================================
// AUTHENTICATION & MULTI-ROLE SYSTEM TYPES
// ==========================================

export type UserRole = 'Student' | 'Lecturer' | 'Administrator' | 'student' | 'lecturer' | 'admin';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  studentId?: string; // e.g. "PS/ITC/23/0042"
  lecturerTitle?: string; // e.g. "Dr. Adane", "Dr. Nelly"
  assignedCourseCodes?: string[];
  avatarUrl?: string;
}

export interface AVEquipmentRequest {
  id: string;
  requestNumber: string; // e.g. "AV-REQ-2026-101"
  userId: string;
  userName: string;
  userRole: UserRole;
  department: string;
  classroomId: string;
  classroomCode: string;
  equipmentType: 'wireless-handheld-mic' | 'wireless-lapel-mic' | 'auditorium-pa-sound' | 'laser-pointer-clicker' | 'hdmi-dual-adapter' | 'full-av-kit';
  equipmentName: string;
  date: string;
  timeSlot: string;
  purpose: string;
  urgency: 'normal' | 'urgent' | 'immediate';
  status: 'pending' | 'approved' | 'rejected' | 'dispatched';
  requestedAt: string;
  adminFeedback?: string;
}

export interface ClassroomSwapRequest {
  id: string;
  requestNumber: string; // e.g. "SWAP-401"
  requesterLecturer: string;
  requesterEmail: string;
  requesterCourseCode: string;
  requesterCourseName: string;
  requesterRoomCode: string;
  targetLecturer: string;
  targetEmail: string;
  targetCourseCode: string;
  targetCourseName: string;
  targetRoomCode: string;
  date: string;
  timeSlot: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
  notes?: string;
}

export interface StudentClassroomRequest {
  id: string;
  requestNumber: string; // e.g. "STU-REQ-501"
  studentId: string;
  studentName: string;
  studentIndexNumber: string; // e.g. "PS/ITC/23/0042"
  department: string;
  preferredClassroomCode: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedAttendees: number;
  purpose: 'Study Group Discussion' | 'Class Project Presentation' | 'Department Association Meeting' | 'Revision & Peer Tutoring' | 'Society / Club Seminar';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  adminFeedback?: string;
  allocatedRoomCode?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  contactEmail: string;
  officeLocation: string;
  activeLecturersCount: number;
  assignedCoursesCount: number;
}

export interface CurriculumCourse {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  department: string;
  email: string;
  creditHours: number;
  scheduledTime: string;
  defaultRoom: string;
}

