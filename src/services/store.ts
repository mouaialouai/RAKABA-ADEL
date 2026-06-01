import { AttendanceStatus } from '../types';
import { DataSyncManager } from './sync';

export interface Device {
  id: string;
  name: string;
}

export interface TrainingMode {
  id: string;
  name: string;
  devices: Device[];
}

export interface Learner {
  id: string;
  name: string;
  gender: 'M' | 'F';
  status: 'active' | 'suspended' | 'dropped';
  totalAbsences?: number; // accumulated absence hours
}

export interface SpecializationGroup {
  id: string;
  name: string; // تسمية التخصص
  modeId: string; // نمط التكوين
  deviceId?: string; // جهاز التكوين
  level: string; // مستوى التأهيل
  duration: string; // مدة التكوين
  startDate: string;
  endDate: string;
  guardian: string; // المؤطر / الأستاذ الوصي
  code: string; // رمز الفوج أو الفرع
  learners: Learner[]; // قائمة المتكونين
  isListApproved?: boolean; // هل تم اعتماد وموافقة القائمة من الرقابة العامة
}

export interface AttendanceSession {
  id: string;
  groupId: string;
  date: string;
  sessionType: 'theory' | 'practical' | 'directed';
  duration: number; // hours e.g. 1, 1.5, 2, 3
  sessionPeriod?: string; // e.g. '8-10', '10-12', '13-15', '15-16.5', '15-17', '17-19'
  attendanceMap: Record<string, AttendanceStatus>; // learnerId -> status
  justifications?: Record<string, string>; // learnerId -> justification file name / details
  teacherSignature?: string;
  submittedAt: string;
}

// Image 1 and Image 2 Training Modes & Devices
export const DEFAULT_MODES: TrainingMode[] = [
  { id: '1', name: 'التكوين الحضوري', devices: [] },
  { id: '2', name: 'التكوين عن طريق التمهين', devices: [] },
  { 
    id: '3', 
    name: 'التكوين التأهيلي', 
    devices: [
      { id: '3-1', name: 'تكوين المرأة الماكثة في البيت' },
      { id: '3-2', name: 'التكوين في الوسط الريفي' },
      { id: '3-3', name: 'محو الأمية تأهيل' },
      { id: '3-4', name: 'التكوين عن طريق المعابر' },
      { id: '3-5', name: 'التكوين التعاقدي' },
      { id: '3-6', name: 'تكوين المستفيدين من منحة البطالة' }
    ] 
  },
  { id: '4', name: 'التكوين عن بعد', devices: [] },
  { id: '5', name: 'التكوين عن طريق الدروس المسائية', devices: [] }
];

export const INITIAL_GROUPS: SpecializationGroup[] = [
  { 
    id: 'GP-WEB-1', 
    name: 'تطوير الويب الكامل', 
    modeId: '1', // حضوري -> متربصين
    level: 'تقني متخصص (TS)', 
    duration: 'سنتين', 
    startDate: '2024-09-01', 
    endDate: '2026-06-30', 
    guardian: 'أ. دليلة طهراوي',
    code: 'WF-WEB-2024',
    isListApproved: true,
    learners: [
      { id: 'L-01', name: 'علوي معمر عادل', gender: 'M', status: 'active' },
      { id: 'L-02', name: 'زين الإدريسي فوزي', gender: 'M', status: 'active' },
      { id: 'L-03', name: 'ياسمين ماري', gender: 'F', status: 'active' },
      { id: 'L-04', name: 'عمر بلقاسم', gender: 'M', status: 'active' },
      { id: 'L-05', name: 'سارة حداد', gender: 'F', status: 'active' }
    ]
  },
  { 
    id: 'GP-SEW-2', 
    name: 'الخياطة التقليدية والحياكة', 
    modeId: '3', // تأهيلي -> متمهنين / متكونين
    deviceId: '3-1', // المرأة الماكثة في البيت
    level: 'شهادة تأهيلية', 
    duration: '6 أشهر', 
    startDate: '2025-01-15', 
    endDate: '2025-07-15', 
    guardian: 'أ. سارة أمين',
    code: 'QA-SEW-2025',
    isListApproved: false,
    learners: [
      { id: 'L-11', name: 'حليمة منصوري', gender: 'F', status: 'active' },
      { id: 'L-12', name: 'فاطمة بن رمضان', gender: 'F', status: 'active' },
      { id: 'L-13', name: 'مريم الصالحي', gender: 'F', status: 'active' }
    ]
  },
  {
    id: 'GP-NET-3',
    name: 'أمن الشبكات وحمايتها',
    modeId: '2', // تمهين -> متمهنين
    level: 'تقني سامي (TS)',
    duration: '30 شهراً',
    startDate: '2023-10-01',
    endDate: '2026-04-30',
    guardian: 'أ. أمين بوجمعة',
    code: 'AP-NET-2023',
    isListApproved: true,
    learners: [
      { id: 'L-21', name: 'سامي بن ناني', gender: 'M', status: 'active' },
      { id: 'L-22', name: 'كنزة علوي', gender: 'F', status: 'active' },
      { id: 'L-23', name: 'إيمان فاسي', gender: 'F', status: 'active' }
    ]
  }
];

export const INITIAL_SESSIONS: AttendanceSession[] = [
  {
    id: 'SESS-01',
    groupId: 'GP-WEB-1',
    date: new Date().toISOString().split('T')[0],
    sessionType: 'practical',
    duration: 3,
    attendanceMap: {
      'L-01': 'present',
      'L-02': 'absent',
      'L-03': 'present',
      'L-04': 'present',
      'L-05': 'present'
    },
    teacherSignature: 'طهرواي',
    submittedAt: new Date().toISOString()
  }
];

export class AppStateStore {
  // Simple event system for state updates
  private static listeners = new Set<() => void>();

  public static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // 🔄 Remote Synchronization System for Cross-Device operations
  public static notifyListenersOnly() {
    this.listeners.forEach(l => l());
  }

  public static async syncWithServer() {
    await DataSyncManager.syncWithServer(() => this.notifyListenersOnly());
  }

  private static notify() {
    this.notifyListenersOnly();
    DataSyncManager.triggerImmediateSync(() => this.notifyListenersOnly());
  }

  public static addTombstone(key: string, id: string) {
    try {
      const saved = localStorage.getItem('rq_tombstones');
      const tombstones = saved ? JSON.parse(saved) : {};
      if (!tombstones[key]) {
        tombstones[key] = [];
      }
      if (!tombstones[key].includes(id)) {
        tombstones[key].push(id);
      }
      localStorage.setItem('rq_tombstones', JSON.stringify(tombstones));
    } catch (e) {
      console.error("[Tombstone registration error]", e);
    }
  }

  // Active user role session management
  public static getActiveRole(): 'admin' | 'supervisor' | 'teacher' | 'trainee' | 'parent' | 'none' {
    const role = localStorage.getItem('rq_active_role');
    if (role && ['admin', 'supervisor', 'teacher', 'trainee', 'parent'].includes(role)) {
      return role as any;
    }
    return 'none';
  }

  public static setActiveRole(role: 'admin' | 'supervisor' | 'teacher' | 'trainee' | 'parent' | 'none') {
    localStorage.setItem('rq_active_role', role);
    this.notify();
  }

  // Helper to retrieve time periods based on Algerian VET regulations
  public static getAvailablePeriods(modeId: string, dateStr: string): { key: string; label: string; text: string }[] {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const isFriday = day === 5;
    if (isFriday) {
      return []; // Friday is weekend off
    }

    const isSaturday = day === 6;
    
    // Check if Evening lessons ( التكوين عن طريق الدروس المسائية / modeId = '5' )
    const isEveningMode = modeId === '5';

    if (isEveningMode && !isSaturday) {
      // From Sunday to Thursday: 1 period only, 17:00 - 19:00
      return [
        { key: '17-19', label: 'الحصة المسائية: 17:00 - 19:00', text: 'من 17:00 إلى 19:00 مساءً' }
      ];
    } else {
      // All other modes on all days (including Saturday), and Evening mode ON Saturday: 4 periods
      return [
        { key: '8-10', label: 'الحصة الأولى: 08:00 - 10:00', text: 'من 08:00 إلى 10:00 صباحاً' },
        { key: '10-12', label: 'الحصة الثانية: 10:00 - 12:00', text: 'من 10:00 إلى 12:00 صباحاً' },
        { key: '13-15', label: 'الحصة الثالثة: 13:00 - 15:00', text: 'من 13:00 إلى 15:00 زوالاً' },
        { key: '15-16.5', label: 'الحصة الرابعة: 15:00 - 16:30', text: 'من 15:00 إلى 16:30 مساءً' }
      ];
    }
  }

  // Raw helper to get modes list
  public static getModes(): TrainingMode[] {
    const saved = localStorage.getItem('rq_modes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_MODES;
      }
    }
    return DEFAULT_MODES;
  }

  public static saveModes(modes: TrainingMode[]) {
    localStorage.setItem('rq_modes', JSON.stringify(modes));
    this.notify();
  }

  // GET Groups / Specialties
  public static getGroups(): SpecializationGroup[] {
    const saved = localStorage.getItem('rq_groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_GROUPS;
      }
    }
    // Seed initial database
    localStorage.setItem('rq_groups', JSON.stringify(INITIAL_GROUPS));
    return INITIAL_GROUPS;
  }

  // Save the complete groups array
  public static saveGroups(groups: SpecializationGroup[]) {
    localStorage.setItem('rq_groups', JSON.stringify(groups));
    this.notify();
  }

  // Add a group
  public static addGroup(group: Omit<SpecializationGroup, 'id' | 'code'> & { id?: string, code?: string }) {
    const groups = this.getGroups();
    const id = group.id || `GP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Choose pattern tag for coding
    const mode = this.getModes().find(m => m.id === group.modeId);
    const patternTag = mode?.name.includes('تمهين') ? 'AP' : mode?.name.includes('حضوري') ? 'WF' : 'FR';
    const code = group.code || `${patternTag}-${group.name.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}`;

    const newGroup: SpecializationGroup = {
      ...group,
      id,
      code,
      learners: group.learners || []
    };

    groups.push(newGroup);
    this.saveGroups(groups);
    return newGroup;
  }

  // Edit an existing group
  public static updateGroup(id: string, updatedFields: Partial<SpecializationGroup>) {
    const groups = this.getGroups();
    const index = groups.findIndex(g => g.id === id);
    if (index !== -1) {
      groups[index] = {
        ...groups[index],
        ...updatedFields
      };
      this.saveGroups(groups);
      return true;
    }
    return false;
  }

  // Delete a group
  public static deleteGroup(id: string) {
    const groups = this.getGroups();
    const filtered = groups.filter(g => g.id !== id);
    this.saveGroups(filtered);
    
    // Also cleanup sessions
    const sessions = this.getSessions().filter(s => s.groupId !== id);
    this.saveSessions(sessions);
    return true;
  }

  // Get terminology based on Mode name (متربصين vs متمهنين vs متكونين)
  public static getTerminology(modeId: string): { plural: string; singular: string; title: string } {
    const mode = this.getModes().find(m => m.id === modeId);
    if (!mode) return { plural: 'متكونين', singular: 'متكون', title: 'فرع' };
    
    // If classroom (حضوري) -> متربصين / متربص / فوج
    if (mode.name.includes('حضوري')) {
      return { plural: 'متربصين', singular: 'متربص', title: 'فوج' };
    }
    // If apprenticeship (تمهين) -> متمهنين / متمهن / فوج
    if (mode.name.includes('تمهين')) {
      return { plural: 'متمهنين', singular: 'متمهن', title: 'فوج' };
    }
    // Otherwise -> متكونين / متكون / فرع
    return { plural: 'متكونين', singular: 'متكون', title: 'فرع' };
  }

  // SESSIONS (Attendance Registry)
  public static getSessions(): AttendanceSession[] {
    const saved = localStorage.getItem('rq_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SESSIONS;
      }
    }
    localStorage.setItem('rq_sessions', JSON.stringify(INITIAL_SESSIONS));
    return INITIAL_SESSIONS;
  }

  public static saveSessions(sessions: AttendanceSession[]) {
    localStorage.setItem('rq_sessions', JSON.stringify(sessions));
    this.notify();
  }

  // Store new attendance session and update analytics (updates existing if groupId, date, and period match)
  public static submitSession(session: Omit<AttendanceSession, 'id'>) {
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex(
      s => s.groupId === session.groupId && s.date === session.date && s.sessionPeriod === session.sessionPeriod
    );

    if (existingIndex !== -1) {
      sessions[existingIndex] = {
        ...sessions[existingIndex],
        ...session,
        submittedAt: new Date().toISOString()
      };
      this.saveSessions(sessions);
      return sessions[existingIndex];
    } else {
      const id = `SESS-${Date.now()}`;
      const newSession: AttendanceSession = {
        ...session,
        id
      };
      sessions.push(newSession);
      this.saveSessions(sessions);
      return newSession;
    }
  }

  // DISCIPLINARY REFERRALS (المجالس التأديبية)
  public static getDisciplinaryReferrals(): DisciplinaryReferral[] {
    const saved = localStorage.getItem('rq_disciplinary_referrals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initialReferrals: DisciplinaryReferral[] = [
      {
        id: 'REF-01',
        learnerId: 'L-21',
        learnerName: 'سامي بن ناني',
        groupName: 'أمن الشبكات وحمايتها',
        groupCode: 'AP-NET-2023',
        reason: 'تجاوز الحد القانوني للغيابات (16.5 ساعة غياب بدون مبرر مقيد)',
        date: '2026-05-24',
        time: '10:00',
        place: 'قاعة الاجتماعات الكبرى بالطابق الأرضي بمعهد تبسة 2',
        status: 'summoned',
        summonSent: true
      },
      {
        id: 'REF-02',
        learnerId: 'L-01',
        learnerName: 'علوي معمر عادل',
        groupName: 'تطوير الويب الكامل',
        groupCode: 'WF-WEB-2024',
        reason: 'تراكم ساعات الغياب غير المبررة وتأخرات متكررة في الفترة الصباحية والمسائية',
        date: '2026-05-25',
        time: '14:00',
        place: 'مكتب مستشار الرقابة العامة بذات المؤسسة',
        status: 'summoned',
        summonSent: true
      }
    ];
    localStorage.setItem('rq_disciplinary_referrals', JSON.stringify(initialReferrals));
    return initialReferrals;
  }

  public static saveDisciplinaryReferrals(referrals: DisciplinaryReferral[]) {
    localStorage.setItem('rq_disciplinary_referrals', JSON.stringify(referrals));
    this.notify();
  }

  public static addDisciplinaryReferral(referral: Omit<DisciplinaryReferral, 'id'>) {
    const referrals = this.getDisciplinaryReferrals();
    const newRef: DisciplinaryReferral = {
      ...referral,
      id: `REF-${Date.now()}`
    };
    referrals.push(newRef);
    this.saveDisciplinaryReferrals(referrals);
    return newRef;
  }

  public static updateDisciplinaryReferral(id: string, updatedFields: Partial<DisciplinaryReferral>) {
    const referrals = this.getDisciplinaryReferrals();
    const index = referrals.findIndex(r => r.id === id);
    if (index !== -1) {
      referrals[index] = {
        ...referrals[index],
        ...updatedFields
      };
      this.saveDisciplinaryReferrals(referrals);
      return true;
    }
    return false;
  }



  // INSTITUTION INFO MANAGEMENT
  public static getInstitutionInfo(): InstitutionInfo {
    const saved = localStorage.getItem('rq_institution_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use fallback
      }
    }
    const defaultInfo: InstitutionInfo = {
      name: 'معهد التكوين المهني المتخصص - زارع عبد الباقي تبسة 2',
      address: 'طريق القنطرة، بئر العاتر، تبسة، الجزائر',
      phone: '+213 (0) 37 49 55 12',
      email: 'insfp.tebessa2@dfp.gov.dz',
      director: 'الأستاذ جمال الدين بلقاسم',
      website: 'www.facebook.com/insfptebessa2',
      decreeNum: 'المرسوم التنفيذي رقم 21-121 المصدق بمجلس الوزراء',
      city: 'ولاية تبسة',
      type: 'institute'
    };
    localStorage.setItem('rq_institution_info', JSON.stringify(defaultInfo));
    return defaultInfo;
  }

  public static saveInstitutionInfo(info: InstitutionInfo) {
    localStorage.setItem('rq_institution_info', JSON.stringify(info));
    this.notify();
  }

  // SEMESTER RESULTS (النتائج السداسية)
  public static getSemesterResults(): SemesterResult[] {
    const saved = localStorage.getItem('rq_semester_results');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    const defaults: SemesterResult[] = [
      {
        learnerId: 'L-01',
        learnerName: 'علوي معمر عادل',
        groupCode: 'WF-WEB-2024',
        semesterName: 'السداسي الثاني 2025/2026',
        gpa: 14.25,
        status: 'passed',
        subjects: [
          { name: 'تطوير تطبيقات الويب الكاملة (Fullstack)', coeff: 4, continuousScore: 15, examScore: 14.5, average: 14.7 },
          { name: 'خوارزميات وهياكل المعطيات المتقدمة', coeff: 3, continuousScore: 13, examScore: 12.5, average: 12.7 },
          { name: 'هندسة البرمجيات والمنهجيات الرشيقة', coeff: 2, continuousScore: 16, examScore: 15.0, average: 15.4 },
          { name: 'قواعد البيانات وحلول المستودعات (SQL/NoSQL)', coeff: 3, continuousScore: 14.5, examScore: 14.0, average: 14.2 },
          { name: 'أمن تطبيقات السحاب والدخول الموحد', coeff: 2, continuousScore: 15, examScore: 11.5, average: 12.9 },
          { name: 'الإنجليزية التقنية والاتصال المهني', coeff: 1, continuousScore: 18, examScore: 17.0, average: 17.4 }
        ],
        deliberationsNote: 'ناجح بموجب قرار اللجنة البيداغوجية البارزة لفرع تطوير الويب مع تهنئة الطاقم المؤطر ومجلس التميز.',
        publishedAt: '2026-05-20'
      },
      {
        learnerId: 'L-02',
        learnerName: 'زين الإدريسي فوزي',
        groupCode: 'WF-WEB-2024',
        semesterName: 'السداسي الثاني 2025/2026',
        gpa: 9.80,
        status: 'remedial',
        subjects: [
          { name: 'تطوير تطبيقات الويب الكاملة (Fullstack)', coeff: 4, continuousScore: 10, examScore: 9.0, average: 9.4 },
          { name: 'خوارزميات وهياكل المعطيات المتقدمة', coeff: 3, continuousScore: 9.5, examScore: 10.0, average: 9.8 },
          { name: 'هندسة البرمجيات والمنهجيات الرشيقة', coeff: 2, continuousScore: 12, examScore: 11.0, average: 11.4 },
          { name: 'قواعد البيانات وحلول المستودعات (SQL/NoSQL)', coeff: 3, continuousScore: 10, examScore: 8.5, average: 9.1 },
          { name: 'أمن تطبيقات السحاب والدخول الموحد', coeff: 2, continuousScore: 11, examScore: 9.0, average: 9.8 },
          { name: 'الإنجليزية التقنية والاتصال المهني', coeff: 1, continuousScore: 14, examScore: 13.0, average: 13.4 }
        ],
        deliberationsNote: 'مستدرك - يحال على دورة الاستدراك في مقاييس (Fullstack، قواعد البيانات، أمن التطبيقات) لاسترجاع وتحسين النقاط والتقييم.',
        publishedAt: '2026-05-20'
      }
    ];
    localStorage.setItem('rq_semester_results', JSON.stringify(defaults));
    return defaults;
  }

  public static saveSemesterResults(results: SemesterResult[]) {
    localStorage.setItem('rq_semester_results', JSON.stringify(results));
    this.notify();
  }

  // GRADE APPEALS (التظلمات البيداغوجية)
  public static getGradeAppeals(): GradeAppeal[] {
    const saved = localStorage.getItem('rq_grade_appeals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'APL-01',
        learnerId: 'L-01',
        learnerName: 'علوي معمر عادل',
        subjectName: 'خوارزميات وهياكل المعطيات المتقدمة',
        reason: 'أرجو إعادة مراجعة ورقة الامتحان لأن إجابتي عن السؤال الثالث لم تحتسب بالكامل على حد علمي بالمقارنة مع الحل التعليقي النموذجي.',
        status: 'pending',
        submittedAt: '2026-05-22'
      }
    ];
  }

  public static saveGradeAppeals(appeals: GradeAppeal[]) {
    localStorage.setItem('rq_grade_appeals', JSON.stringify(appeals));
    this.notify();
  }

  public static addGradeAppeal(appeal: Omit<GradeAppeal, 'id' | 'status' | 'submittedAt'>) {
    const appeals = this.getGradeAppeals();
    const newAppeal: GradeAppeal = {
      ...appeal,
      id: `APL-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('ar-DZ')
    };
    appeals.push(newAppeal);
    this.saveGradeAppeals(appeals);
    return newAppeal;
  }

  // 💼 Workplace Contracts (عقود التمهين)
  public static getWorkplaceContracts(): WorkplaceContract[] {
    const saved = localStorage.getItem('rq_workplace_contracts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initialContracts: WorkplaceContract[] = [
      { id: 'CON-001', studentName: 'أيوب بلقصيري', code: 'APPR-TEB-01', specialty: 'تطوير الويب والوسائط المتعددة', companyName: 'مؤسسة اتصالات الجزائر - تبسة', guardianName: 'أحمد بلقصيري', guardianPhone: '0771234567', studentPhone: '0558123456', smsAlertsEnabled: true, status: 'نشط', startDate: '2025-09-10', endDate: '2027-09-10' },
      { id: 'CON-002', studentName: 'هدى بومعرافي', code: 'APPR-TEB-02', specialty: 'صيانة أنظمة الإعلام الآلي', companyName: 'الشركة الوطنية للكهرباء والغاز (سونلغاز) - تبسة', guardianName: 'رشيد بومعرافي', guardianPhone: '0665987412', studentPhone: '0660987654', smsAlertsEnabled: false, status: 'نشط', startDate: '2025-09-15', endDate: '2027-09-15' },
      { id: 'CON-003', studentName: 'لؤي موايعية', code: 'APPR-TEB-03', specialty: 'الشبكات والأنظمة السلكية واللاسلكية', companyName: 'مؤسسة اتصالات الجزائر - تبسة', guardianName: 'صالح موايعية', guardianPhone: '0799887766', studentPhone: '0791223344', smsAlertsEnabled: true, status: 'نشط', startDate: '2025-10-01', endDate: '2027-10-01' },
      { id: 'CON-004', studentName: 'يسرى شوشان', code: 'APPR-TEB-04', specialty: 'تسيير الموارد البشرية والرقابة', companyName: 'مديرية التضامن والنشاط الاجتماعي - تبسة', guardianName: 'كمال شوشان', guardianPhone: '0551223344', studentPhone: '0550334455', smsAlertsEnabled: false, status: 'منتهي', startDate: '2024-03-01', endDate: '2026-03-01' },
      { id: 'CON-005', studentName: 'فارس قادري', code: 'APPR-TEB-05', specialty: 'الكهرباء المعمارية والصناعية', companyName: 'فرع سونلغاز للإنشاءات الهندسية', guardianName: 'جمال قادري', guardianPhone: '0693524178', studentPhone: '0690556677', smsAlertsEnabled: true, status: 'معلق', startDate: '2025-11-20', endDate: '2027-11-20' },
    ];
    localStorage.setItem('rq_workplace_contracts', JSON.stringify(initialContracts));
    return initialContracts;
  }

  public static saveWorkplaceContracts(contracts: WorkplaceContract[]) {
    localStorage.setItem('rq_workplace_contracts', JSON.stringify(contracts));
    this.notify();
  }

  // 🏥 Workplace Visits (الزيارات الميدانية المجدولة)
  public static getWorkplaceVisits(): WorkplaceVisit[] {
    const saved = localStorage.getItem('rq_workplace_visits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initialVisits: WorkplaceVisit[] = [
      { id: 'VIS-201', studentName: 'أيوب بلقصيري', companyName: 'مؤسسة اتصالات الجزائر - تبسة', visitorName: 'أ. دليلة طهراوي', visitDate: '2026-05-30', visitTime: '10:00', status: 'مجدولة', notes: 'زيارة دورية للتحقق من الانضباط وملء دفتر التوطين البيداغوجي.' },
      { id: 'VIS-202', studentName: 'لؤي موايعية', companyName: 'مؤسسة اتصالات الجزائر - تبسة', visitorName: 'أ. أمين بوجمعة', visitDate: '2026-06-02', visitTime: '09:30', status: 'مجدولة', notes: 'زيارة بيداغوجية لمتابعة تقدّم التمهين بمصلحة الشبكات.' },
      { id: 'VIS-203', studentName: 'هدى بومعرافي', companyName: 'الشركة الوطنية للكهرباء والغاز (سونلغاز) - تبسة', visitorName: 'أ. دليلة طهراوي', visitDate: '2026-05-18', visitTime: '11:00', status: 'مكتملة', notes: 'تمت الزيارة بنجاح. وسلوك المتمهن ممتاز مع التزام كامل بتعليمات السلامة المعتمدة.' },
      { id: 'VIS-204', studentName: 'فارس قادري', companyName: 'فرع سونلغاز للإنشاءات الهندسية', visitorName: 'أ. مسعود خلف الله', visitDate: '2026-06-15', visitTime: '13:30', status: 'مجدولة', notes: 'تحقيق انضباط في إطار مراجعة تعليق عقد التمهين الخاص بالفوج.' },
    ];
    localStorage.setItem('rq_workplace_visits', JSON.stringify(initialVisits));
    return initialVisits;
  }

  public static saveWorkplaceVisits(visits: WorkplaceVisit[]) {
    localStorage.setItem('rq_workplace_visits', JSON.stringify(visits));
    this.notify();
  }

  // 🏢 Workplace Partner Companies (الشركات المضيفة)
  public static getWorkplaceCompanies(): WorkplaceCompany[] {
    const saved = localStorage.getItem('rq_workplace_companies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initialCompanies: WorkplaceCompany[] = [
      { id: 'COM-101', name: 'مؤسسة اتصالات الجزائر - تبسة', apprenticesCount: 8, rating: 5, compliance: 'ممتاز', feedback: 'تلتزم بالكامل بتوفير بيئة تأطير تكنولوجية عالية وتوقيت منتظم ومراعاة معايير السلامة المهنية ومطابقة البرامج البيداغوجية لقوانين الوزارة.', latitude: 35.4021, longitude: 8.1214, radius: 250, enableQRVerification: true, enableFaceVerification: true, gpsRequired: true },
      { id: 'COM-102', name: 'الشركة الوطنية للكهرباء والغاز (سونلغاز) - تبسة', apprenticesCount: 5, rating: 4, compliance: 'ممتاز', feedback: 'تأطير عالي الكفاءة وورشات مجهزة تجهيزاً كاملاً، مع غياب بسيط في التنسيق الدوري بخصوص دفتر التدريب التدريجي.', latitude: 35.4055, longitude: 8.1189, radius: 200, enableQRVerification: true, enableFaceVerification: true, gpsRequired: true },
      { id: 'COM-103', name: 'مديرية التضامن والنشاط الاجتماعي - تبسة', apprenticesCount: 2, rating: 3, compliance: 'مقبول', feedback: 'البيئة الإدارية مناسبة جداً، ولكن يرجى الحرص على دقة متابعة حضور المتمهنين بالتوقيت المزدوج.', latitude: 35.3999, longitude: 8.1250, radius: 300, enableQRVerification: false, enableFaceVerification: false, gpsRequired: true },
      { id: 'COM-104', name: 'مؤسسة نفطال لتوزع وتخزين الوقود - تبسة', apprenticesCount: 3, rating: 2, compliance: 'تحت المراجعة', feedback: 'تم تسجيل تأخر مستمر في الرد على تقارير الغياب ومخالفات الانضباط، والمنظومة تدعو لتحسين الإشراف.', latitude: 35.4120, longitude: 8.1305, radius: 500, enableQRVerification: true, enableFaceVerification: true, gpsRequired: true },
    ];
    localStorage.setItem('rq_workplace_companies', JSON.stringify(initialCompanies));
    return initialCompanies;
  }

  public static saveWorkplaceCompanies(companies: WorkplaceCompany[]) {
    localStorage.setItem('rq_workplace_companies', JSON.stringify(companies));
    this.notify();
  }

  // 📋 Teacher Absences (غيابات الأساتذة)
  public static getTeacherAbsences(): any[] {
    const saved = localStorage.getItem('rq_teacher_absences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initialAbsences = [
      { id: '1', teacherName: 'أ. دليلة طهراوي', groupName: 'تطوير الويب الكامل', date: '2026-05-18', period: '13-15', reason: 'مهمة إدارية بمديرية التكوين', justified: true },
      { id: '2', teacherName: 'أ. أمين بوجمعة', groupName: 'أمن الشبكات وحمايتها', date: '2026-05-19', period: '8-10', reason: 'شهادة طبية طارئة', justified: false }
    ];
    localStorage.setItem('rq_teacher_absences', JSON.stringify(initialAbsences));
    return initialAbsences;
  }

  public static saveTeacherAbsences(absences: any[]) {
    localStorage.setItem('rq_teacher_absences', JSON.stringify(absences));
    this.notify();
  }

  // 📝 Workplace Inspection Reports (تقارير تفتيش الوسط المهني)
  public static getWorkplaceInspectionReports(): any[] {
    const saved = localStorage.getItem('rq_workplace_inspection_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initialReports = [
      {
        id: 'REP-001',
        companyName: 'اتصالات الجزائر تبسة',
        visitorName: 'أ. بوجمعة محمد السعيد',
        studentName: 'أمين بلعيدي',
        visitDate: '2026-05-20',
        complianceScore: 'ممتاز',
        reportDetails: 'خلال الزيارة الميدانية الفجائية لمقر المديرية العملية لاتصالات الجزائر، تم مراجعة دفتر التمهين المبرمج بالتنسيق مع المؤطر الخارجي م. عبد القادر. المتكون مستمر في تطبيق برنامج الصيانة والشبكات بشكل ممتاز والتحاقه يومي دون غيابات مسجلة.',
        attachedPhotos: [
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80'
        ]
      },
      {
        id: 'REP-002',
        companyName: 'مؤسسة سونلغاز للكهرباء والغاز',
        visitorName: 'أ. موايعية عادل (مستشار التوجيه)',
        studentName: 'أسامة قادري',
        visitDate: '2026-05-24',
        complianceScore: 'مستقر',
        reportDetails: 'تفقد ورشة الصيانة الكهربائية بسونلغاز وتبين أن المتكون أسامة قادري يتلقى توجيهاً جيداً، مع الالتزام بكافة تبريرات الأمن وقواعد السلامة المعتمدة. لوحظ تأخر بضع دقائق في مطلع الأسبوع وجرى التنبيه شفهياً بمرافقة المشرف الميداني.',
        attachedPhotos: [
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'
        ]
      }
    ];
    localStorage.setItem('rq_workplace_inspection_reports', JSON.stringify(initialReports));
    return initialReports;
  }

  public static saveWorkplaceInspectionReports(reports: any[]) {
    localStorage.setItem('rq_workplace_inspection_reports', JSON.stringify(reports));
    this.notify();
  }

  // 📝 Remote Attendance Logs (سجلات الحضور عن بعد للوسط المهني)
  public static getRemoteAttendanceLogs(): RemoteAttendanceLog[] {
    const saved = localStorage.getItem('rq_remote_attendance_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initialLogs: RemoteAttendanceLog[] = [
      {
        id: 'LOG-301',
        learnerId: 'L-01',
        learnerName: 'علوي معمر عادل',
        companyName: 'مؤسسة اتصالات الجزائر - تبسة',
        timestamp: `${new Date().toISOString().split('T')[0]} 08:02:15`,
        status: 'present',
        latitude: 35.4022,
        longitude: 8.1215,
        distanceFromPivot: 15,
        selfieUrl: '',
        faceMatchScore: 98.4,
        verificationMethod: 'GPS_ONLY',
        deviceInfo: 'Galaxy S23 - Android 14',
        ipAddress: '197.112.48.55',
        authorized: true
      },
      {
        id: 'LOG-302',
        learnerId: 'L-03',
        learnerName: 'أيوب بلقصيري',
        companyName: 'مؤسسة اتصالات الجزائر - تبسة',
        timestamp: `${new Date().toISOString().split('T')[0]} 08:15:40`,
        status: 'late',
        latitude: 35.4023,
        longitude: 8.1213,
        distanceFromPivot: 23,
        selfieUrl: '',
        faceMatchScore: 97.1,
        verificationMethod: 'GPS_FACE_QR',
        deviceInfo: 'Xiaomi Redmi Note 12',
        ipAddress: '105.235.120.4',
        authorized: true
      }
    ];
    localStorage.setItem('rq_remote_attendance_logs', JSON.stringify(initialLogs));
    return initialLogs;
  }

  public static saveRemoteAttendanceLogs(logs: RemoteAttendanceLog[]) {
    localStorage.setItem('rq_remote_attendance_logs', JSON.stringify(logs));
    this.notify();
  }

  public static addRemoteAttendanceLog(log: Omit<RemoteAttendanceLog, 'id'>) {
    const logs = this.getRemoteAttendanceLogs();
    const newLog: RemoteAttendanceLog = {
      ...log,
      id: `LOG-${Date.now().toString().slice(-4)}`
    };
    logs.unshift(newLog);
    this.saveRemoteAttendanceLogs(logs);

    // If student was marked absent or late and SMS Alerts are active, simulate SMS alerts!
    if (log.status === 'absent' || log.status === 'late') {
      const contracts = this.getWorkplaceContracts();
      const contract = contracts.find(c => c.studentName === log.learnerName);
      if (contract && contract.smsAlertsEnabled && contract.guardianPhone) {
        // Log a simulated SMS
        const smsLogs = this.getSimulatedSMSLogs();
        const msg = `تنبيه ذكي: غاب/تأخر ابنكم ${log.learnerName} المتمهن لدى [${log.companyName}] اليوم عند الساعة ${log.timestamp.split(' ')[1]}. معهد تبسة 2.`;
        smsLogs.unshift({
          id: `SMS-${Date.now()}`,
          phone: contract.guardianPhone,
          message: msg,
          timestamp: new Date().toLocaleString('ar-DZ'),
          status: 'delivered'
        });
        localStorage.setItem('rq_simulated_sms_logs', JSON.stringify(smsLogs));
      }
    }

    return newLog;
  }

  // Simulated SMS/Free Notification Send History (سجل الإخطارات الذكية والمراسلات عبر القنوات المجانية للأولياء)
  public static getSimulatedSMSLogs(): any[] {
    const saved = localStorage.getItem('rq_simulated_sms_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Normalize for old key-value compatibility
        return parsed.map((item: any) => ({
          ...item,
          guardianPhone: item.guardianPhone || item.phone || '0555301822',
          phone: item.phone || item.guardianPhone || '0555301822',
          text: item.text || item.message || '',
          message: item.message || item.text || '',
          channel: item.channel || 'sms'
        }));
      } catch (e) {
        return [];
      }
    }
    const initialSMSLogs = [
      { id: 'SMS-101', phone: '0771234567', guardianPhone: '0771234567', message: 'تنبيه ذكي: يسجل نظام معهد تبسة 2 غياب ابنكم أيوب بلقصيري اليوم عن التمهين العملي لدى اتصالات الجزائر.', text: 'تنبيه ذكي: يسجل نظام معهد تبسة 2 غياب ابنكم أيوب بلقصيري اليوم عن التمهين العملي لدى اتصالات الجزائر.', timestamp: '24/05/2026, 08:31:00', status: 'delivered', channel: 'whatsapp', reason: 'غياب غير مبرر' },
      { id: 'SMS-102', phone: '0693524178', guardianPhone: '0693524178', message: 'مراسلة رقمية: تذكير بضرورة إحضار مبرر طبي للمتمهن فارس قادري بخصوص غيابه الأخير غداً صباحاً.', text: 'مراسلة رقمية: تذكير بضرورة إحضار مبرر طبي للمتمهن فارس قادري بخصوص غيابه الأخير غداً صباحاً.', timestamp: '23/05/2026, 11:15:10', status: 'delivered', channel: 'telegram', reason: 'طلب تبرير غياب' }
    ];
    localStorage.setItem('rq_simulated_sms_logs', JSON.stringify(initialSMSLogs));
    return initialSMSLogs;
  }

  public static saveSimulatedSMSLogs(smsLogs: any[]) {
    localStorage.setItem('rq_simulated_sms_logs', JSON.stringify(smsLogs));
    this.notify();
  }

  public static getSmsLogs(): any[] {
    return this.getSimulatedSMSLogs();
  }

  // ==========================================
  // AUTHORIZED PARTNERS (الجهات الرسمية المعتمدة لاستلام نسخ الإشعارات بـ WhatsApp)
  // ==========================================
  
  public static getAuthorizedPartners(): any[] {
    const saved = localStorage.getItem('rq_authorized_whatsapp_partners');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initialPartners = [
      { id: 'PARTNER-1', name: 'أ. مسعود خلف الله', role: 'مدير المعهد', phone: '0661223344', isActive: true, note: 'نسخة إلزامية من قرارات الشطب والمجلس التأديبي' },
      { id: 'PARTNER-2', name: 'أ. دليلة طهراوي', role: 'مستشارة الرقابة العامة', phone: '0770556677', isActive: true, note: 'متابعة يومية لغيابات الوسط المهني الميداني' },
      { id: 'PARTNER-3', name: 'مكتب المدير الفرعي للتمهين', role: 'مدير فرعي (تبسة)', phone: '0555301822', isActive: false, note: 'تقارير أسبوعية مجمعة للقطاع الولائي' }
    ];
    localStorage.setItem('rq_authorized_whatsapp_partners', JSON.stringify(initialPartners));
    return initialPartners;
  }

  public static saveAuthorizedPartners(partners: any[]) {
    localStorage.setItem('rq_authorized_whatsapp_partners', JSON.stringify(partners));
    this.notify();
  }

  public static sendSimulatedSmsAlert(payload: { 
    studentName: string; 
    guardianPhone: string; 
    text: string; 
    reason: string; 
    channel?: 'sms' | 'whatsapp' | 'telegram' | 'push' | 'email';
    recipientType?: 'parent' | 'trainee';
    recipientName?: string;
  }) {
    const logs = this.getSimulatedSMSLogs();
    const chosenChannel = payload.channel || 'sms';
    const recipientType = payload.recipientType || 'parent';
    const recipientName = payload.recipientName || (recipientType === 'parent' ? 'الولي' : payload.studentName);
    
    // Cost estimation for reporting saas panel
    let cost = '0.00 دج (مجاني بالكامل ✅)';
    if (chosenChannel === 'sms') {
      cost = '4.50 دج (رخصة مدفوعة ❌)';
    }

    logs.unshift({
      id: `SMS-${Date.now()}`,
      phone: payload.guardianPhone,
      guardianPhone: payload.guardianPhone,
      message: payload.text,
      text: payload.text,
      timestamp: new Date().toLocaleString('ar-DZ'),
      status: 'delivered',
      reason: payload.reason,
      studentName: payload.studentName,
      channel: chosenChannel,
      costEstimate: cost,
      recipientType,
      recipientName
    });
    this.saveSimulatedSMSLogs(logs);
    return true;
  }

  // ==========================================
  // OFFLINE MODE ATTENDANCE SYNC ENGINE
  // ==========================================
  
  public static getOfflineQueue(): any[] {
    const saved = localStorage.getItem('rq_offline_queue');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  public static saveOfflineQueue(queue: any[]) {
    localStorage.setItem('rq_offline_queue', JSON.stringify(queue));
    this.notify();
  }

  public static queueOfflineCheckIn(checkIn: { learnerId: string; learnerName: string; companyName: string; latitude: number; longitude: number; distance: number; selfieUrl: string; verificationMethod: string }) {
    const queue = this.getOfflineQueue();
    const newCheckIn = {
      ...checkIn,
      id: `OFFLINE-${Date.now()}`,
      timestamp: new Date().toLocaleString('ar-DZ'),
      deviceInfo: navigator.userAgent.substring(0, 50) + " (Offline Storage MD)",
      ipAddress: '127.0.0.1 (محلي)',
      faceMatchScore: Math.floor(Math.random() * 8 + 92) // 92% - 99%
    };
    queue.push(newCheckIn);
    this.saveOfflineQueue(queue);
    
    // Log local action for auditing
    this.addAdminActivityLog('تسجيل حضور محلي (دون إنترنت)', `${checkIn.learnerName} - شركة ${checkIn.companyName}`, 'نجاح');
    return newCheckIn;
  }

  public static syncOfflineQueue(): number {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return 0;

    const remoteLogs = this.getRemoteAttendanceLogs();
    queue.forEach(item => {
      remoteLogs.unshift({
        id: `REM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        learnerId: item.learnerId,
        learnerName: item.learnerName,
        companyName: item.companyName,
        timestamp: item.timestamp,
        status: 'present',
        latitude: item.latitude,
        longitude: item.longitude,
        distanceFromPivot: item.distance,
        selfieUrl: item.selfieUrl,
        faceMatchScore: item.faceMatchScore,
        verificationMethod: 'GPS_FACE_QR',
        deviceInfo: item.deviceInfo + ' [تمت المزامنة البعدية]',
        ipAddress: '197.230.12.98',
        authorized: true
      });
    });

    localStorage.setItem('rq_remote_attendance_logs', JSON.stringify(remoteLogs));
    this.saveOfflineQueue([]); // Empty queue
    this.addAdminActivityLog('مزامنة الحضور المتأخر لقاعدة البيانات', `تم بنجاح رفع وبث عدد ${queue.length} سجلات حضور مؤجلة`, 'نجاح');
    this.notify();
    return queue.length;
  }

  // ==========================================
  // CLOUD SNAPSHOTS / DATABASE BACKUP & RESTORE
  // ==========================================

  public static getDatabaseSnapshots(): any[] {
    const saved = localStorage.getItem('rq_db_snapshots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initialSnapshots = [
      { id: 'SNAP-001', name: 'النسخة الاحتياطية الدورية للأسبوع الدراسي 34', timestamp: '2026-05-20 23:59:00', type: 'scheduled', creator: 'النظام الآلي (FCM Daily Cloud)', size: '245 KB', recordsCount: 142 },
      { id: 'SNAP-002', name: 'ما قبل تعديل التخصصات وصيانة السداسي الثاني', timestamp: '2026-05-15 11:20:00', type: 'manual', creator: 'سليماني عبد القادر', size: '210 KB', recordsCount: 118 }
    ];
    localStorage.setItem('rq_db_snapshots', JSON.stringify(initialSnapshots));
    return initialSnapshots;
  }

  public static createNewSnapshot(name: string): any {
    const snapshots = this.getDatabaseSnapshots();
    const newSnap = {
      id: `SNAP-${Date.now()}`,
      name: name || 'نسخة احتياطية يدوية',
      timestamp: new Date().toLocaleString('ar-DZ').replace('T', ' ').substring(0, 19),
      type: 'manual',
      creator: 'سليماني عبد القادر (Super Admin)',
      size: `${Math.floor(Math.random() * 100 + 150)} KB`,
      recordsCount: this.getSessions().length + this.getRemoteAttendanceLogs().length + 50
    };
    snapshots.unshift(newSnap);
    localStorage.setItem('rq_db_snapshots', JSON.stringify(snapshots));
    this.addAdminActivityLog('توليد نقطة استعادة بعبق السحاب', `تصدير اللقطة: ${newSnap.name}`);
    this.notify();
    return newSnap;
  }

  public static restoreFromSnapshot(id: string): boolean {
    const snapshots = this.getDatabaseSnapshots();
    const snap = snapshots.find(s => s.id === id);
    if (!snap) return false;
    
    // Simulate restoration
    this.addAdminActivityLog('استنباط واسترجاع من نقطة السحاب ↺', `استرجاع ناجح لقاعدة البيانات من لقطة: ${snap.name}`);
    this.notify();
    return true;
  }

  public static deleteSnapshot(id: string): boolean {
    const snapshots = this.getDatabaseSnapshots();
    const remaining = snapshots.filter(s => s.id !== id);
    localStorage.setItem('rq_db_snapshots', JSON.stringify(remaining));
    this.addAdminActivityLog('حذف ملف لقطة سحابية', `الملف المستهدف: ID ${id}`);
    this.notify();
    return true;
  }

  // ==========================================
  // DISCIPLINARY / ABSENTEEISM AI RISK PREDICTOR
  // ==========================================

  public static getAIPointsAnalytics(): any {
    const groups = this.getGroups();
    const attendees = groups.flatMap(g => g.learners.map(l => ({
      ...l,
      groupName: g.name,
      groupCode: g.code
    })));

    // Calculate dynamically
    const totalCount = attendees.length;
    const highRiskLearners = attendees
      .filter(l => (l.totalAbsences || 0) >= 12)
      .map(l => ({
        id: l.id,
        name: l.name,
        groupName: l.groupName,
        absentHours: l.totalAbsences || 0,
        riskPercentage: Math.min(99, Math.floor(((l.totalAbsences || 0) / 30) * 100)),
        reason: 'تجاوز العتبة القانونية للغيابات المتكررة مع الغياب الميداني الشبه تام',
        recommendation: 'إرسال إنذار الدرجة الثالثة واستدعاء فوري للمؤطر القانوني للمؤسسة'
      }));

    const moderateRiskLearners = attendees
      .filter(l => (l.totalAbsences || 0) >= 6 && (l.totalAbsences || 0) < 12)
      .map(l => ({
        id: l.id,
        name: l.name,
        groupName: l.groupName,
        absentHours: l.totalAbsences || 0,
        riskPercentage: Math.min(85, Math.floor(((l.totalAbsences || 0) / 20) * 105)),
        reason: 'نمط غياب أسبوعي متكرر (خصوصاً في حصص التطبيقي البيداغوجي)',
        recommendation: 'تفعيل إخطارات WhatsApp الآلية وإخطار الأستاذ المتابع لزيارة المنشأة'
      }));

    return {
      totalCount,
      highRiskCount: highRiskLearners.length,
      moderateRiskCount: moderateRiskLearners.length,
      riskList: [...highRiskLearners, ...moderateRiskLearners].sort((a,b) => b.riskPercentage - a.riskPercentage)
    };
  }

  // ==========================================
  // ADMIN CONTROL AND SECURITY ACTIVITY LOGS
  // ==========================================

  public static getAdminActivityLogs(): AdminActivityLog[] {
    const saved = localStorage.getItem('rq_admin_activity_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    const initialLogs: AdminActivityLog[] = [
      { id: 'ACT-001', timestamp: '2026-05-27 09:12:05', adminName: 'سليماني عبد القادر (Super Admin)', action: 'تسجيل دخول لوحة التحكم', resource: 'نظام المصادقة الرقمي الموحد', ipAddress: '197.112.42.112', status: 'نجاح' },
      { id: 'ACT-002', timestamp: '2026-05-26 14:35:10', adminName: 'سليماني عبد القادر (Super Admin)', action: 'تعديل وثائق وميثاق المؤسسة', resource: 'معهد تبسة 2 المعلوماتية', ipAddress: '197.112.42.112', status: 'نجاح' }
    ];
    localStorage.setItem('rq_admin_activity_logs', JSON.stringify(initialLogs));
    return initialLogs;
  }

  public static saveAdminActivityLogs(logs: AdminActivityLog[]) {
    localStorage.setItem('rq_admin_activity_logs', JSON.stringify(logs));
    this.notify();
  }

  public static addAdminActivityLog(action: string, resource: string, status: 'نجاح' | 'فشل' = 'نجاح') {
    const logs = this.getAdminActivityLogs();
    const newLog: AdminActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toLocaleString('ar-DZ').replace('T', ' ').substring(0, 19),
      adminName: 'سليماني عبد القادر (Super Admin)',
      action,
      resource,
      ipAddress: '197.112.4' + Math.floor(Math.random() * 9 + 1) + '.' + Math.floor(Math.random() * 254),
      status
    };
    logs.unshift(newLog);
    this.saveAdminActivityLogs(logs);
  }

  // DELETE TRAINEE inside a specific group (Direct Admin Action)
  public static deleteTrainee(groupId: string, traineeId: string): boolean {
    const groups = this.getGroups();
    const groupIdx = groups.findIndex(g => g.id === groupId);
    if (groupIdx === -1) return false;
    
    const initialLength = groups[groupIdx].learners.length;
    groups[groupIdx].learners = groups[groupIdx].learners.filter(l => l.id !== traineeId);
    
    if (groups[groupIdx].learners.length < initialLength) {
      this.saveGroups(groups);
      this.addTombstone('rq_learners', traineeId);
      this.addAdminActivityLog('حذف متكون بصفة نهائية', `المتكون: ${traineeId} من الفوج ${groups[groupIdx].name}`);
      return true;
    }
    return false;
  }

  // DELETE WORKPLACE COMPANY (Institution / Enterprise)
  public static deleteWorkplaceCompany(companyId: string): boolean {
    const companies = this.getWorkplaceCompanies();
    const targetComp = companies.find(c => c.id === companyId);
    const initialLength = companies.length;
    const remains = companies.filter(c => c.id !== companyId);
    if (remains.length < initialLength) {
      this.saveWorkplaceCompanies(remains);
      this.addTombstone('rq_workplace_companies', companyId);
      this.addAdminActivityLog('حذف مؤسسة مستقبلة', `المؤسسة: ${targetComp?.name || companyId}`);
      return true;
    }
    return false;
  }

  // DELETE ATTENDANCE SESSION RECORD
  public static deleteAttendanceSession(sessionId: string): boolean {
    const sessions = this.getSessions();
    const targetSess = sessions.find(s => s.id === sessionId);
    const initialLength = sessions.length;
    const remains = sessions.filter(s => s.id !== sessionId);
    if (remains.length < initialLength) {
      this.saveSessions(remains);
      this.addTombstone('rq_sessions', sessionId);
      this.addAdminActivityLog('حذف سجل حضور الحصة الدراسية', `رقم الحصة: ${sessionId} (تاريخ: ${targetSess?.date || ''})`);
      return true;
    }
    return false;
  }

  // DELETE REPORT (Disciplinary Referral / Summons)
  public static deleteDisciplinaryReferral(referralId: string): boolean {
    const referrals = this.getDisciplinaryReferrals();
    const targetRef = referrals.find(r => r.id === referralId);
    const initialLength = referrals.length;
    const remains = referrals.filter(r => r.id !== referralId);
    if (remains.length < initialLength) {
      this.saveDisciplinaryReferrals(remains);
      this.addTombstone('rq_disciplinary_referrals', referralId);
      this.addAdminActivityLog('حذف تقرير إحالة للجنة الانضباط', `رقم الإحالة للجن: ${referralId} (المتكون: ${targetRef?.learnerName || ''})`);
      return true;
    }
    return false;
  }

  // DELETE GRADE APPEAL
  public static deleteGradeAppeal(appealId: string): boolean {
    const appeals = this.getGradeAppeals();
    const targetApp = appeals.find(a => a.id === appealId);
    const initialLength = appeals.length;
    const remains = appeals.filter(a => a.id !== appealId);
    if (remains.length < initialLength) {
      this.saveGradeAppeals(remains);
      this.addTombstone('rq_grade_appeals', appealId);
      this.addAdminActivityLog('حذف طعن في النقطة', `رقم الطعن: ${appealId} (المتكون: ${targetApp?.learnerName || ''})`);
      return true;
    }
    return false;
  }

  // DELETE REMOTE ATTENDANCE LOG
  public static deleteRemoteAttendanceLog(logId: string): boolean {
    const logs = this.getRemoteAttendanceLogs();
    const targetLog = logs.find(l => l.id === logId);
    const initialLength = logs.length;
    const remains = logs.filter(l => l.id !== logId);
    if (remains.length < initialLength) {
      this.saveRemoteAttendanceLogs(remains);
      this.addTombstone('rq_remote_attendance_logs', logId);
      this.addAdminActivityLog('حذف سجل حضور ميداني (GPS/QR)', `رقم الحضور: ${logId} (المتكون: ${targetLog?.learnerName || ''})`);
      return true;
    }
    return false;
  }

  // TOTAL SYSTEM RESET
  public static resetSystemAll(): void {
    // 1. Clear sessions and logs
    localStorage.removeItem('rq_sessions');
    localStorage.removeItem('rq_remote_attendance_logs');
    
    // 2. Clear sms logs
    localStorage.removeItem('rq_simulated_sms_logs');
    
    // 3. Clear grade appeals and referrals
    localStorage.removeItem('rq_grade_appeals');
    localStorage.removeItem('rq_disciplinary_referrals');

    // 4. Reset dynamic accumulated absences parameters
    const groups = this.getGroups();
    groups.forEach(g => {
      g.learners.forEach(l => {
        l.totalAbsences = 0;
      });
    });
    this.saveGroups(groups);

    // 5. Log the reset action
    this.addAdminActivityLog('إعادة تهيئة وضبط النظام الكلي ⚠️', 'تفريغ وتطهير قاعدة البيانات الفورية لبدء سداسي بيداغوجي جديد من الصفر');
    this.notify();
  }
}

export interface InstitutionInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  website: string;
  decreeNum: string;
  city: string;
  type?: 'institute' | 'center';
}

export interface DisciplinaryReferral {
  id: string;
  learnerId: string;
  learnerName: string;
  groupName: string;
  groupCode: string;
  reason: string;
  date: string;
  time: string;
  place: string;
  status: 'pending' | 'summoned' | 'resolved';
  summonSent: boolean;
  hallNumber?: string;
  bylawArticlesExtracted?: string;
}

export interface SubjectGrade {
  name: string;
  coeff: number;
  continuousScore: number;
  examScore: number;
  average: number;
}

export interface SemesterResult {
  learnerId: string;
  learnerName: string;
  groupCode: string;
  semesterName: string;
  gpa: number;
  status: 'passed' | 'remedial';
  subjects: SubjectGrade[];
  deliberationsNote?: string;
  publishedAt: string;
}

export interface GradeAppeal {
  id: string;
  learnerId: string;
  learnerName: string;
  subjectName: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  adminNotes?: string;
  submittedAt: string;
}

export interface WorkplaceCompany {
  id: string;
  name: string;
  apprenticesCount: number;
  rating: number; // 2 to 5 stars
  compliance: string; // 'ممتاز' | 'مقبول' | 'محدود' | 'تحت المراجعة'
  feedback: string;
  latitude: number; // GPS coordinates
  longitude: number;
  radius: number; // in meters (e.g., 100, 200, 500)
  enableQRVerification: boolean;
  enableFaceVerification: boolean;
  gpsRequired: boolean;
}

export interface WorkplaceContract {
  id: string;
  studentName: string;
  code: string;
  specialty: string;
  companyName: string;
  guardianName: string;
  guardianPhone?: string;
  studentPhone?: string;
  smsAlertsEnabled?: boolean;
  status: 'نشط' | 'معلق' | 'منتهي';
  startDate: string;
  endDate: string;
}

export interface WorkplaceVisit {
  id: string;
  studentName: string;
  companyName: string;
  visitorName: string;
  visitDate: string;
  visitTime: string;
  status: 'مجدولة' | 'مكتملة' | 'ملغاة';
  notes: string;
}

export interface RemoteAttendanceLog {
  id: string;
  learnerId: string;
  learnerName: string;
  companyName: string;
  timestamp: string; // date + time
  status: 'present' | 'absent' | 'late' | 'excused';
  latitude: number;
  longitude: number;
  distanceFromPivot: number; // distance in meters from the company GPS
  selfieUrl: string; // base64 or placeholder
  faceMatchScore: number; // e.g. 98%
  verificationMethod: 'GPS_ONLY' | 'GPS_FACE_QR' | 'FACE_QR';
  deviceInfo: string;
  ipAddress: string;
  authorized: boolean; // geofence or QR verification success
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'نجاح' | 'فشل';
}

// ⏱️ Auto-Sync Interval: Automatically sync with real-time server database every 3 seconds using the new DataSyncManager
if (typeof window !== 'undefined') {
  DataSyncManager.startAutoSync(() => {
    AppStateStore.notifyListenersOnly();
  }, 3000);
}

