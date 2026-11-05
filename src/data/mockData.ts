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
