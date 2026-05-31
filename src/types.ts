export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'suspended' | 'late' | 'dropped';

export interface Institution {
  id: string;
  name: string;
  logoUrl?: string;
  address?: string;
  contactEmail?: string;
  stats?: {
    totalTrainees: number;
    averageAttendance: number;
  };
}

export interface Specialization {
  id: string;
  name: string;
  code: string;
  level: string;
  qualification: string;
}

export interface Group {
  id: string;
  name: string;
  specializationId: string;
  semester: number;
  academicYear: string;
  teacherId: string;
}

export interface Trainee {
  id: string;
  name: string;
  email: string;
  groupId: string;
  parentEmail?: string;
  photoUrl?: string;
  qrCode?: string;
  status: 'active' | 'suspended' | 'dropped' | 'graduated';
  riskScore?: number; // 0-100
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  specializations: string[];
}

export interface AttendanceRecord {
  id: string;
  traineeId: string;
  sessionId: string;
  date: string;
  status: AttendanceStatus;
  recordedBy: string;
  notes?: string;
}

export interface Session {
  id: string;
  groupId: string;
  teacherId: string;
  startTime: string;
  endTime: string;
  subject: string;
  room?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'supervisor' | 'teacher' | 'trainee' | 'parent';
  displayName: string;
}
