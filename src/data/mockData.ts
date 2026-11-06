import { Classroom, Microphone, Speaker, Booking, CancelledBooking, EmergencyRequest, RoomType, RoomStatus } from '../types';

// Official user-specified curriculum catalog
export const campusCurriculum = [
  {
    courseCode: 'EIT311',
    courseName: 'Cloud Computing',
    instructor: 'Dr Adane',
    department: 'MATHS AND ICT',
    email: 'adane@campus.edu',
  },
  {
    courseCode: 'EIT302',
    courseName: 'Designing Instructional Material',
    instructor: 'Dr Nelly',
    department: 'MATHS AND ICT',
    email: 'nelly@campus.edu',
  },
  {
    courseCode: 'INF309',
    courseName: 'Information System Management',
    instructor: 'Prof Aggrey',
    department: 'MATHS AND ICT',
    email: 'aggrey@campus.edu',
  },
  {
    courseCode: 'FN300',
    courseName: 'Food and Nutrition',
    instructor: 'Vocational Faculty (Madam Akosua)',
    department: 'VOCATIONAL',
    email: 'vocational@campus.edu',
  },
  {
    courseCode: 'STP330',
    courseName: 'Statistics and Probability',
    instructor: 'Sir John',
    department: 'MATHS AND STATISTICS',
    email: 'sirjohn@campus.edu',
  },
  {
    courseCode: 'ACC301',
    courseName: 'Cost Management Accounting',
    instructor: 'Dr. Mansu',
    department: 'SCHOOL OF BUSINESS',
    email: 'mansu@campus.edu',
  },
  {
    courseCode: 'BLL334',
    courseName: 'Business Law',
    instructor: 'Dr. Afful',
    department: 'SCHOOL OF BUSINESS',
    email: 'afful@campus.edu',
  },
];

export const campusDepartments = [
  'MATHS AND ICT',
  'VOCATIONAL',
  'MATHS AND STATISTICS',
  'SCHOOL OF BUSINESS',
];

// Configuration for NLT1 through NLT21
export const generateNLTClassrooms = (): Classroom[] => {
  const rooms: Classroom[] = [];

  // Room status setup for 21 classrooms
  // Occupied rooms: 2, 5, 9, 12, 15, 19
  // Reserved rooms: 3, 10, 17
  // Emergency Standby: 7, 21
  // Maintenance: 14
  // Available: 1, 4, 6, 8, 11, 13, 16, 18, 20

  const occupiedMap: Record<number, typeof campusCurriculum[0]> = {
    2: campusCurriculum[0], // EIT311 - Dr Adane
    5: campusCurriculum[1], // EIT302 - Dr Nelly
    9: campusCurriculum[2], // INF309 - Prof Aggrey
    12: campusCurriculum[3], // FN300 - Food & Nutrition
    15: campusCurriculum[4], // STP330 - Sir John
    19: campusCurriculum[5], // ACC301 - Dr. Mansu
  };

  const reservedMap: Record<number, typeof campusCurriculum[0]> = {
    3: campusCurriculum[6], // BLL334 - Dr. Afful
    10: campusCurriculum[0], // EIT311 Cloud Computing Lab - Dr Adane
    17: campusCurriculum[4], // STP330 Probability Workshop - Sir John
  };

  const standbyRooms = new Set([7, 21]);
  const maintenanceRooms = new Set([14]);

  for (let i = 1; i <= 21; i++) {
    const code = `NLT${i}`;
    let floor = 1;
    let building = 'NLT Block · Level 1 (NLT 1-7)';

    if (i > 14) {
      floor = 3;
      building = 'NLT Block · Level 3 (NLT 15-21)';
    } else if (i > 7) {
      floor = 2;
      building = 'NLT Block · Level 2 (NLT 8-14)';
    }

    // Room type and capacity
    let type: RoomType = 'lecture-hall';
    let capacity = 120;

    if (i === 1 || i === 7 || i === 15 || i === 21) {
      type = 'amphitheater';
      capacity = 250;
    } else if (i % 3 === 0) {
      type = 'smart-seminar';
      capacity = 70;
    } else if (i % 4 === 0) {
      type = 'computer-lab';
      capacity = 85;
    } else {
      type = 'lecture-hall';
      capacity = 140;
    }

    let status: RoomStatus = 'available';
    let currentSession: Classroom['currentSession'] = undefined;

    if (occupiedMap[i]) {
      status = 'occupied';
      const c = occupiedMap[i];
      currentSession = {
        id: `sess-nlt-${i}`,
        courseCode: c.courseCode,
        courseName: c.courseName,
        instructor: c.instructor,
        department: c.department,
        startTime: '09:00',
        endTime: '11:00',
        attendeeCount: Math.min(capacity - 10, Math.floor(capacity * 0.85)),
        requiresMics: capacity >= 100,
        requiresSpeakers: true,
      };
    } else if (reservedMap[i]) {
      status = 'reserved';
      const r = reservedMap[i];
      currentSession = {
        id: `sess-res-${i}`,
        courseCode: r.courseCode,
        courseName: r.courseName,
        instructor: r.instructor,
        department: r.department,
        startTime: '11:30',
        endTime: '13:00',
        attendeeCount: Math.floor(capacity * 0.75),
        requiresMics: true,
        requiresSpeakers: true,
        isReservation: true,
        bookingRef: `BK-NLT-200${i}`,
      };
    } else if (standbyRooms.has(i)) {
      status = 'emergency-standby';
    } else if (maintenanceRooms.has(i)) {
      status = 'maintenance';
    } else {
      status = 'available';
    }

    rooms.push({
      id: `nlt-${i}`,
      code,
      name: `${code} - New Lecture Theater`,
      building,
      floor,
      capacity,
      type,
      status,
      airConditioning: maintenanceRooms.has(i) ? 'issue' : (i % 3 === 0 ? 'cooling' : 'optimal'),
      projectorDisplay: i % 3 === 0 ? 'interactive-smartboard' : 'dual-laser-4k',
      accessibility: {
        wheelchairAccessible: true,
        assistiveListeningLoop: i % 2 === 1,
      },
      currentSession,
    });
  }

  return rooms;
};

export const initialClassrooms: Classroom[] = generateNLTClassrooms();

export const generateMicrophones = (): Microphone[] => {
  const mics: Microphone[] = [];
  for (let i = 1; i <= 21; i++) {
    const isFaulty = i === 14;
    const isLowBattery = i === 5 || i === 12;

    mics.push({
      id: `mic-nlt-${i}-a`,
      name: `NLT${i} Wireless Handheld Alpha`,
      type: 'wireless-handheld',
      brandModel: 'Shure ULXD4 Digital Wireless',
      classroomId: `nlt-${i}`,
      status: isFaulty ? 'repair-needed' : (isLowBattery ? 'low-battery' : ([2, 5, 9, 12, 15, 19].includes(i) ? 'in-use' : 'operational')),
      batteryPercentage: isLowBattery ? 15 : 92,
      channelFrequency: `${512 + (i * 0.5)} MHz`,
      lastTestedAt: '2026-11-05 07:45 AM',
      notes: isFaulty ? 'Mic receiver unit servicing required' : undefined,
    });

    if (i % 2 === 0) {
      mics.push({
        id: `mic-nlt-${i}-b`,
        name: `NLT${i} Lapel Mic Beta`,
        type: 'wireless-lapel',
        brandModel: 'Sennheiser EW-DX SK Bodypack',
        classroomId: `nlt-${i}`,
        status: [2, 5, 9, 12, 15, 19].includes(i) ? 'in-use' : 'operational',
        batteryPercentage: 88,
        channelFrequency: `${535 + (i * 0.4)} MHz`,
        lastTestedAt: '2026-11-05 07:30 AM',
      });
    }
  }
  return mics;
};

export const initialMicrophones: Microphone[] = generateMicrophones();

export const generateSpeakers = (): Speaker[] => {
  const speakers: Speaker[] = [];
  for (let i = 1; i <= 21; i++) {
    const isOffline = i === 14;

    speakers.push({
      id: `spk-nlt-${i}`,
      name: `NLT${i} Acoustic Line Array System`,
      type: (i === 1 || i === 7 || i === 15 || i === 21) ? 'auditorium-pa' : 'ceiling-line-array',
      brandModel: 'Bose Panaray MSA12X Steerable Array',
      classroomId: `nlt-${i}`,
      status: isOffline ? 'offline' : ([2, 5, 9, 12, 15, 19].includes(i) ? 'in-use' : 'operational'),
      outputDecibels: isOffline ? 0 : 84,
      amplifierModel: 'Crown DriveCore CDI 4|600 BL',
      lastTestedAt: '2026-11-05 07:40 AM',
    });
  }
  return speakers;
};

export const initialSpeakers: Speaker[] = generateSpeakers();

export const initialBookings: Booking[] = [
  {
    id: 'book-nlt-101',
    bookingRef: 'BK-NLT-2003',
    classroomId: 'nlt-3',
    classroomCode: 'NLT3',
    title: 'Business Law (Corporate Regulations)',
    courseCode: 'BLL334',
    instructorName: 'Dr. Afful',
    instructorEmail: 'afful@campus.edu',
    department: 'SCHOOL OF BUSINESS',
    date: '2026-11-05',
    startTime: '11:30',
    endTime: '13:00',
    expectedAttendees: 65,
    purpose: 'lecture',
    recurrence: 'weekly-semester',
    equipmentRequired: {
      wirelessHandheldMic: true,
      lapelMic: true,
      highPowerSpeakers: true,
      dualProjector: true,
      lectureRecording: true,
    },
    bookedAt: '2026-11-04T14:20:00Z',
    status: 'active',
    notes: 'Scheduled business law lecture series.',
  },
  {
    id: 'book-nlt-102',
    bookingRef: 'BK-NLT-2010',
    classroomId: 'nlt-10',
    classroomCode: 'NLT10',
    title: 'Cloud Computing Architectural Lab',
    courseCode: 'EIT311',
    instructorName: 'Dr Adane',
    instructorEmail: 'adane@campus.edu',
    department: 'MATHS AND ICT',
    date: '2026-11-05',
    startTime: '13:00',
    endTime: '15:00',
    expectedAttendees: 60,
    purpose: 'workshop',
    recurrence: 'once',
    equipmentRequired: {
      wirelessHandheldMic: true,
      lapelMic: false,
      highPowerSpeakers: true,
      dualProjector: true,
      lectureRecording: false,
    },
    bookedAt: '2026-11-04T09:10:00Z',
    status: 'active',
    notes: 'Hands-on cloud orchestration lab session.',
  },
  {
    id: 'book-nlt-103',
    bookingRef: 'BK-NLT-2017',
    classroomId: 'nlt-17',
    classroomCode: 'NLT17',
    title: 'Probability & Stochastic Distributions Tutorial',
    courseCode: 'STP330',
    instructorName: 'Sir John',
    instructorEmail: 'sirjohn@campus.edu',
    department: 'MATHS AND STATISTICS',
    date: '2026-11-05',
    startTime: '14:00',
    endTime: '16:00',
    expectedAttendees: 70,
    purpose: 'seminar',
    recurrence: 'weekly-4-weeks',
    equipmentRequired: {
      wirelessHandheldMic: true,
      lapelMic: true,
      highPowerSpeakers: true,
      dualProjector: true,
      lectureRecording: true,
    },
    bookedAt: '2026-11-03T16:00:00Z',
    status: 'active',
  },
];

export const initialCancelledBookings: CancelledBooking[] = [
  {
    id: 'cancel-nlt-1',
    bookingRef: 'BK-NLT-1088',
    classroomId: 'nlt-4',
    classroomCode: 'NLT4',
    title: 'Designing Instructional Material Workshop',
    courseCode: 'EIT302',
    instructorName: 'Dr Nelly',
    department: 'MATHS AND ICT',
    originalDate: '2026-11-05',
    originalStartTime: '08:00',
    originalEndTime: '10:00',
    expectedAttendees: 50,
    cancelledAt: '2026-11-05T07:15:00Z',
    cancelledBy: 'Dr Nelly',
    cancellationReason: 'Lecturer Illness / Emergency',
    notes: 'Rescheduled to tomorrow; classroom NLT4 released to Available status.',
  },
  {
    id: 'cancel-nlt-2',
    bookingRef: 'BK-NLT-1092',
    classroomId: 'nlt-8',
    classroomCode: 'NLT8',
    title: 'Cost Management Accounting Midterm Clinic',
    courseCode: 'ACC301',
    instructorName: 'Dr. Mansu',
    department: 'SCHOOL OF BUSINESS',
    originalDate: '2026-11-05',
    originalStartTime: '09:00',
    originalEndTime: '11:00',
    expectedAttendees: 80,
    cancelledAt: '2026-11-04T18:40:00Z',
    cancelledBy: 'Business School Office',
    cancellationReason: 'Class Moved Online / Hybrid',
    notes: 'Moved online via student webinar portal.',
  },
  {
    id: 'cancel-nlt-3',
    bookingRef: 'BK-NLT-1095',
    classroomId: 'nlt-14',
    classroomCode: 'NLT14',
    title: 'Food & Nutrition Sensory Practical',
    courseCode: 'FN300',
    instructorName: 'Vocational Faculty (Madam Akosua)',
    department: 'VOCATIONAL',
    originalDate: '2026-11-05',
    originalStartTime: '10:00',
    originalEndTime: '12:00',
    expectedAttendees: 65,
    cancelledAt: '2026-11-05T08:10:00Z',
    cancelledBy: 'AV Helpdesk',
    cancellationReason: 'AV Hardware / Microphone Malfunction',
    notes: 'Projector laser calibration needed; room set to maintenance.',
  },
];

export const initialEmergencyRequests: EmergencyRequest[] = [
  {
    id: 'emg-nlt-101',
    ticketNumber: 'EMG-NLT-501',
    sourceClassroomId: 'nlt-14',
    sourceClassroomCode: 'NLT14',
    allocatedClassroomId: 'nlt-7',
    allocatedClassroomCode: 'NLT7',
    reason: 'Projector Display Blackout',
    requestedBy: 'Madam Akosua',
    department: 'VOCATIONAL',
    requestedAt: '2026-11-05T08:30:00Z',
    requiredCapacity: 70,
    urgency: 'immediate',
    audioRequirement: 'must-have-working-mic-and-speaker',
    status: 'dispatched',
    notes: 'Projector display failed in NLT14. Class successfully relocated to NLT7 Standby Amphitheater.',
  },
];

// ==========================================
// DEMO ACCOUNTS & USER PROFILES
// ==========================================

export interface DemoAccount {
  email: string;
  password: string; // Plaintext for demo login evaluation
  name: string;
  role: 'student' | 'lecturer' | 'admin';
  department: string;
  studentId?: string;
  lecturerTitle?: string;
  assignedCourseCodes?: string[];
  avatarUrl: string;
  badgeLabel: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@campus.edu',
    password: 'Admin123',
    name: 'Academic Affairs Admin',
    role: 'admin',
    department: 'DIRECTORATE OF ACADEMIC AFFAIRS',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Administrator · Timetable & NLT Operations',
  },
  {
    email: 'lecturer@campus.edu',
    password: 'Lecturer123',
    name: 'Dr. Adane',
    role: 'lecturer',
    department: 'MATHS AND ICT',
    lecturerTitle: 'Dr. Adane (Faculty)',
    assignedCourseCodes: ['EIT311', 'EIT302', 'INF309'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Faculty · Senior Lecturer',
  },
  {
    email: 'student@campus.edu',
    password: 'Student123',
    name: 'Kwame Mensah',
    role: 'student',
    department: 'MATHS AND ICT',
    studentId: 'STU-2026-042',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Student · Level 300 Representative',
  },
  {
    email: 'student@ucc.edu.gh',
    password: 'student123',
    name: 'Kwame Mensah',
    role: 'student',
    department: 'MATHS AND ICT',
    studentId: 'PS/ITC/23/0042',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Student · Level 300 Representative',
  },
  {
    email: 'lecturer@ucc.edu.gh',
    password: 'lecturer123',
    name: 'Dr. Adane',
    role: 'lecturer',
    department: 'MATHS AND ICT',
    lecturerTitle: 'Dr. Adane (Faculty)',
    assignedCourseCodes: ['EIT311', 'EIT302', 'INF309'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Faculty · Senior Lecturer',
  },
  {
    email: 'admin@ucc.edu.gh',
    password: 'admin123',
    name: 'Academic Affairs Admin',
    role: 'admin',
    department: 'DIRECTORATE OF ACADEMIC AFFAIRS',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Administrator · Timetable & NLT Operations',
  },
];

// 7 Official User Lecturers
export const LECTURER_PERSONAS = [
  {
    id: 'lec-adane',
    name: 'Dr Adane',
    email: 'adane@campus.edu',
    department: 'MATHS AND ICT',
    courseCode: 'EIT311',
    courseName: 'Cloud Computing',
    activeRoom: 'NLT2',
  },
  {
    id: 'lec-nelly',
    name: 'Dr Nelly',
    email: 'nelly@campus.edu',
    department: 'MATHS AND ICT',
    courseCode: 'EIT302',
    courseName: 'Designing Instructional Material',
    activeRoom: 'NLT5',
  },
  {
    id: 'lec-aggrey',
    name: 'Prof Aggrey',
    email: 'aggrey@campus.edu',
    department: 'MATHS AND ICT',
    courseCode: 'INF309',
    courseName: 'Information System Management',
    activeRoom: 'NLT9',
  },
  {
    id: 'lec-akosua',
    name: 'Vocational Faculty (Madam Akosua)',
    email: 'vocational@campus.edu',
    department: 'VOCATIONAL',
    courseCode: 'FN300',
    courseName: 'Food and Nutrition',
    activeRoom: 'NLT12',
  },
  {
    id: 'lec-john',
    name: 'Sir John',
    email: 'sirjohn@campus.edu',
    department: 'MATHS AND STATISTICS',
    courseCode: 'STP330',
    courseName: 'Statistics and Probability',
    activeRoom: 'NLT15',
  },
  {
    id: 'lec-mansu',
    name: 'Dr. Mansu',
    email: 'mansu@campus.edu',
    department: 'SCHOOL OF BUSINESS',
    courseCode: 'ACC301',
    courseName: 'Cost Management Accounting',
    activeRoom: 'NLT19',
  },
  {
    id: 'lec-afful',
    name: 'Dr. Afful',
    email: 'afful@campus.edu',
    department: 'SCHOOL OF BUSINESS',
    courseCode: 'BLL334',
    courseName: 'Business Law',
    activeRoom: 'NLT3',
  },
];

export const initialDepartmentsData = [
  {
    id: 'dept-ict',
    name: 'MATHS AND ICT',
    code: 'MICT',
    headOfDepartment: 'Prof. Kofi Aggrey',
    contactEmail: 'ict.maths@ucc.edu.gh',
    officeLocation: 'NLT Block 2nd Floor, Room 204',
    activeLecturersCount: 3,
    assignedCoursesCount: 3,
  },
  {
    id: 'dept-voc',
    name: 'VOCATIONAL',
    code: 'VOC',
    headOfDepartment: 'Madam Akosua Mensah',
    contactEmail: 'vocational@ucc.edu.gh',
    officeLocation: 'Vocational Pavilion B, Room 101',
    activeLecturersCount: 1,
    assignedCoursesCount: 1,
  },
  {
    id: 'dept-stat',
    name: 'MATHS AND STATISTICS',
    code: 'MSTAT',
    headOfDepartment: 'Sir John Boateng',
    contactEmail: 'maths.stat@ucc.edu.gh',
    officeLocation: 'Mathematical Sciences Tower, 4th Floor',
    activeLecturersCount: 1,
    assignedCoursesCount: 1,
  },
  {
    id: 'dept-bus',
    name: 'SCHOOL OF BUSINESS',
    code: 'SOB',
    headOfDepartment: 'Dr. Kwesi Mansu',
    contactEmail: 'business.school@ucc.edu.gh',
    officeLocation: 'Business Complex Block C, Room 302',
    activeLecturersCount: 2,
    assignedCoursesCount: 2,
  },
];

export const initialCoursesData = [
  {
    id: 'course-1',
    courseCode: 'EIT311',
    courseName: 'Cloud Computing',
    instructor: 'Dr Adane',
    department: 'MATHS AND ICT',
    email: 'adane@campus.edu',
    creditHours: 3,
    scheduledTime: 'Mon & Wed 09:00 - 11:00 AM',
    defaultRoom: 'NLT2',
  },
  {
    id: 'course-2',
    courseCode: 'EIT302',
    courseName: 'Designing Instructional Material',
    instructor: 'Dr Nelly',
    department: 'MATHS AND ICT',
    email: 'nelly@campus.edu',
    creditHours: 3,
    scheduledTime: 'Tue & Thu 10:00 - 12:00 PM',
    defaultRoom: 'NLT5',
  },
  {
    id: 'course-3',
    courseCode: 'INF309',
    courseName: 'Information System Management',
    instructor: 'Prof Aggrey',
    department: 'MATHS AND ICT',
    email: 'aggrey@campus.edu',
    creditHours: 3,
    scheduledTime: 'Mon & Fri 11:00 - 01:00 PM',
    defaultRoom: 'NLT9',
  },
  {
    id: 'course-4',
    courseCode: 'FN300',
    courseName: 'Food and Nutrition',
    instructor: 'Vocational Faculty (Madam Akosua)',
    department: 'VOCATIONAL',
    email: 'vocational@campus.edu',
    creditHours: 2,
    scheduledTime: 'Wed 08:00 - 11:00 AM',
    defaultRoom: 'NLT12',
  },
  {
    id: 'course-5',
    courseCode: 'STP330',
    courseName: 'Statistics and Probability',
    instructor: 'Sir John',
    department: 'MATHS AND STATISTICS',
    email: 'sirjohn@campus.edu',
    creditHours: 3,
    scheduledTime: 'Tue & Fri 01:00 - 03:00 PM',
    defaultRoom: 'NLT15',
  },
  {
    id: 'course-6',
    courseCode: 'ACC301',
    courseName: 'Cost Management Accounting',
    instructor: 'Dr. Mansu',
    department: 'SCHOOL OF BUSINESS',
    email: 'mansu@campus.edu',
    creditHours: 3,
    scheduledTime: 'Mon & Wed 02:00 - 04:00 PM',
    defaultRoom: 'NLT19',
  },
  {
    id: 'course-7',
    courseCode: 'BLL334',
    courseName: 'Business Law',
    instructor: 'Dr. Afful',
    department: 'SCHOOL OF BUSINESS',
    email: 'afful@campus.edu',
    creditHours: 3,
    scheduledTime: 'Thu 11:30 - 01:30 PM',
    defaultRoom: 'NLT3',
  },
];

export const initialAVRequestsData: any[] = [
  {
    id: 'av-req-1',
    requestNumber: 'AV-REQ-801',
    userId: 'usr-student-1',
    userName: 'Kwame Mensah',
    userRole: 'student',
    department: 'MATHS AND ICT',
    classroomId: 'nlt-4',
    classroomCode: 'NLT4',
    equipmentType: 'wireless-handheld-mic',
    equipmentName: 'Wireless Handheld Microphone Kit',
    date: '2026-11-05',
    timeSlot: '14:00 - 16:00',
    purpose: 'Level 300 Software Project Defense',
    urgency: 'normal',
    status: 'approved',
    requestedAt: '2026-11-05T08:15:00Z',
    adminFeedback: 'Approved. Collect Shure ULXD4 mic kit from NLT Control Desk 10 mins before start.',
  },
  {
    id: 'av-req-2',
    requestNumber: 'AV-REQ-802',
    userId: 'usr-student-1',
    userName: 'Kwame Mensah',
    userRole: 'student',
    department: 'MATHS AND ICT',
    classroomId: 'nlt-6',
    classroomCode: 'NLT6',
    equipmentType: 'laser-pointer-clicker',
    equipmentName: 'Wireless Presentation Clicker & HDMI Dongle',
    date: '2026-11-05',
    timeSlot: '16:00 - 17:30',
    purpose: 'Google Developer Student Club Tech Talk',
    urgency: 'normal',
    status: 'pending',
    requestedAt: '2026-11-05T09:40:00Z',
  },
  {
    id: 'av-req-3',
    requestNumber: 'AV-REQ-803',
    userId: 'usr-lec-1',
    userName: 'Dr Adane',
    userRole: 'lecturer',
    department: 'MATHS AND ICT',
    classroomId: 'nlt-2',
    classroomCode: 'NLT2',
    equipmentType: 'wireless-lapel-mic',
    equipmentName: 'Sennheiser Wireless Lapel Mic Beta',
    date: '2026-11-05',
    timeSlot: '09:00 - 11:00',
    purpose: 'EIT311 Cloud Computing Lecture & Live Stream',
    urgency: 'urgent',
    status: 'dispatched',
    requestedAt: '2026-11-05T07:20:00Z',
    adminFeedback: 'Dispatched to podium in NLT2 by AV Tech Kojo.',
  },
  {
    id: 'av-req-4',
    requestNumber: 'AV-REQ-804',
    userId: 'usr-lec-2',
    userName: 'Dr. Mansu',
    userRole: 'lecturer',
    department: 'SCHOOL OF BUSINESS',
    classroomId: 'nlt-19',
    classroomCode: 'NLT19',
    equipmentType: 'auditorium-pa-sound',
    equipmentName: 'Acoustic PA Sound Array Calibration',
    date: '2026-11-05',
    timeSlot: '14:00 - 16:00',
    purpose: 'ACC301 Cost Management Large Joint Session (180 students)',
    urgency: 'normal',
    status: 'approved',
    requestedAt: '2026-11-04T15:00:00Z',
    adminFeedback: 'Sound engineers scheduled to pre-test Bose array at 13:45.',
  },
];

export const initialSwapRequestsData: any[] = [
  {
    id: 'swap-req-1',
    requestNumber: 'SWAP-NLT-201',
    requesterLecturer: 'Dr. Nelly',
    requesterEmail: 'nelly@campus.edu',
    requesterCourseCode: 'EIT302',
    requesterCourseName: 'Designing Instructional Material',
    requesterRoomCode: 'NLT5',
    targetLecturer: 'Dr Adane',
    targetEmail: 'adane@campus.edu',
    targetCourseCode: 'EIT311',
    targetCourseName: 'Cloud Computing',
    targetRoomCode: 'NLT2',
    date: '2026-11-06',
    timeSlot: '09:00 - 11:00 AM',
    reason: 'Need larger amphitheater seating capacity for combined class presentation.',
    status: 'pending',
    requestedAt: '2026-11-05T08:30:00Z',
    notes: 'Awaiting Dr. Adane approval or administrative sign-off.',
  },
  {
    id: 'swap-req-2',
    requestNumber: 'SWAP-NLT-202',
    requesterLecturer: 'Sir John',
    requesterEmail: 'sirjohn@campus.edu',
    requesterCourseCode: 'STP330',
    requesterCourseName: 'Statistics and Probability',
    requesterRoomCode: 'NLT15',
    targetLecturer: 'Dr. Afful',
    targetEmail: 'afful@campus.edu',
    targetCourseCode: 'BLL334',
    targetCourseName: 'Business Law',
    targetRoomCode: 'NLT3',
    date: '2026-11-04',
    timeSlot: '11:30 - 01:30 PM',
    reason: 'Wheelchair access required for three enrolled statistics students.',
    status: 'approved',
    requestedAt: '2026-11-04T10:00:00Z',
    respondedAt: '2026-11-04T10:45:00Z',
    notes: 'Swap mutually agreed and approved by Facility Admin.',
  },
];

export const initialStudentRequestsData: any[] = [
  {
    id: 'stu-req-1',
    requestNumber: 'STU-REQ-301',
    studentId: 'usr-student-1',
    studentName: 'Kwame Mensah',
    studentIndexNumber: 'PS/ITC/23/0042',
    department: 'MATHS AND ICT',
    preferredClassroomCode: 'NLT8',
    date: '2026-11-05',
    startTime: '16:00',
    endTime: '18:00',
    expectedAttendees: 25,
    purpose: 'Study Group Discussion',
    status: 'approved',
    requestedAt: '2026-11-04T16:00:00Z',
    adminFeedback: 'Granted for NLT8. Keep room tidy and ensure lights/AC turned off after study.',
    allocatedRoomCode: 'NLT8',
  },
  {
    id: 'stu-req-2',
    requestNumber: 'STU-REQ-302',
    studentId: 'usr-student-1',
    studentName: 'Kwame Mensah',
    studentIndexNumber: 'PS/ITC/23/0042',
    department: 'MATHS AND ICT',
    preferredClassroomCode: 'NLT11',
    date: '2026-11-06',
    startTime: '14:00',
    endTime: '16:30',
    expectedAttendees: 40,
    purpose: 'Class Project Presentation',
    status: 'pending',
    requestedAt: '2026-11-05T09:15:00Z',
    adminFeedback: 'Under review by Central Timetable desk.',
  },
];

