import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Sparkles, 
  ChevronRight, 
  Search, 
  Loader2,
  Trash2,
  Database,
  Printer,
  LayoutGrid,
  Users,
  AlertTriangle,
  FileCheck,
  UserX,
  Plus,
  Clock,
  BadgeAlert,
  Calendar,
  XCircle,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  PauseCircle,
  AlertCircle,
  Briefcase,
  Building2,
  MapPin,
  Compass,
  Award,
  ShieldCheck,
  Phone,
  Camera,
  Image as ImageIcon,
  ClipboardList
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppStateStore, SpecializationGroup, Learner } from '../../services/store';

type ImportStep = 'config' | 'upload' | 'analyzing' | 'result';

interface ExtractedLearner {
  name: string;
  id: string;
  gender: 'M' | 'F';
  status: 'new' | 'registered';
}

export default function SupervisionDashboard() {
  const [groups, setGroups] = useState<SpecializationGroup[]>([]);
  const [step, setStep] = useState<ImportStep>('config');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [fileName, setFileName] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedLearner[]>([]);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [showPurgeReferralsConfirm, setShowPurgeReferralsConfirm] = useState(false);
  
  // Custom states for Uploading and Managing Internal Regulations PDF
  const [pdfFileName, setPdfFileName] = useState<string>(() => {
    return localStorage.getItem('rq_internal_regulations_pdf_name') || 'القانون الداخلي لوزارة التكوين المهني 2026.pdf';
  });
  const [showRegulationsModal, setShowRegulationsModal] = useState(false);

  // AI-Powered Internal Regulations state
  const [aiRegulations, setAiRegulations] = useState(() => {
    const saved = localStorage.getItem('rq_ai_analyzed_regulations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default institutional rules
    return {
      fileName: 'القانون الداخلي لوزارة التكوين المهني 2026.pdf',
      analyzedAt: 'تلقائي • محرك النظام المدمج',
      status: 'active',
      rules: {
         absentHourWeight: 0.25,
         morningHalfDay: true,
         afternoonHalfDay: true,
         warning1: 3,
         warning2: 9, 
         council: 10, 
         dismissal: 20,
         decreeNum: "2021-121",
         customNotes: "تراكم 10 أيام غياب أو 40 حصة كاملة دون عذر بيداغوجي مقبول يحيل المتكون مباشرة إلى المجلس التأديبي الرسمي، وتجاوز 20 يوماً غياب مجزأ يؤدي للشطب النهائي."
      }
    };
  });
  
  const [isAnalyzingRegulations, setIsAnalyzingRegulations] = useState(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  
  // Custom navigation tabs inside Supervision
  const [activeTab, setActiveTab] = useState<'specialties' | 'sync' | 'teacher_absences' | 'alerts' | 'attendance_sessions' | 'disciplinary_referrals' | 'professional_track'>('sync');
  const [sessions, setSessions] = useState<any[]>([]);
  
  // Historical upload operations log state
  const [uploadHistory, setUploadHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('rq_student_list_uploads');
    return saved ? JSON.parse(saved) : [
      {
        id: 'UPLOAD-301',
        fileName: 'قائمة_المتكونين_تطوير_الويب_سداسي_أول.xlsx',
        timestamp: '25/05/2026 09:30:15',
        groupName: 'تطوير الويب والوسائط المتعددة (APPR-TEB-01)',
        learnersCount: 12,
        status: 'مكتملة ومزامنة آلياً ✓',
        operatorRole: 'الرقابة العامة'
      },
      {
        id: 'UPLOAD-302',
        fileName: 'قائمة_المتكونين_صيانة_انظمة_سداسي_ثاني.xlsx',
        timestamp: '26/05/2026 11:45:20',
        groupName: 'الشبكات والأنظمة السلكية واللاسلكية (APPR-TEB-03)',
        learnersCount: 15,
        status: 'مكتملة ومزامنة آلياً ✓',
        operatorRole: 'الرقابة العامة'
      }
    ];
  });
  
  // Safe toast/success notification banner
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [learnerSortBy, setLearnerSortBy] = useState<Record<string, 'name' | 'absences-desc' | 'absences-asc'>>({});

  // File upload state for TAB 5 (attendance_sessions)
  const [sessionImportFileText, setSessionImportFileText] = useState('');
  const [sessionImportError, setSessionImportError] = useState<string | null>(null);
  const [sessionImportSuccess, setSessionImportSuccess] = useState<string | null>(null);
  const [showSessionImportArea, setShowSessionImportArea] = useState(false);

  // Persistence for teacher absences
  const [teacherAbsences, setTeacherAbsences] = useState<any[]>(() => AppStateStore.getTeacherAbsences());

  // State for recording a teacher absence
  const [isAddingAbsence, setIsAddingAbsence] = useState(false);
  const [newAbsence, setNewAbsence] = useState({
    teacherName: '',
    groupId: '',
    date: new Date().toISOString().split('T')[0],
    period: '8-10',
    reason: '',
    justified: false
  });

  // TAB 5 Hoisted states (دفتر الغيابات الرقمي والحصص)
  const [selectedGroupSessionId, setSelectedGroupSessionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // TAB 6 Hoisted states (إرسال استدعاءات المجلس والقرارات التأديبية)
  const [selectedLearnerIdx, setSelectedLearnerIdx] = useState('0');
  const [reasonInput, setReasonInput] = useState('تجاوز الحد القانوني لغيابات الدفتر الأكاديمي (أكثر من 30 ساعة غياب غير مبرر قانونياً)');
  const [councilDateInput, setCouncilDateInput] = useState('2026-05-24');
  const [councilTimeInput, setCouncilTimeInput] = useState('10:00');
  const [councilPlaceInput, setCouncilPlaceInput] = useState('قاعة الاجتماعات الكبرى بمقر المؤسسة - زارع عبد الباقي تبسة 2');

  // Manual input state for off-roster student insertion
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualLearnerName, setManualLearnerName] = useState('');
  const [manualGroupName, setManualGroupName] = useState('');
  const [manualGroupCode, setManualGroupCode] = useState('');
  const [manualAbsenceDays, setManualAbsenceDays] = useState('8');

  // Selected referral for printed summon preview modal
  const [selectedReferralForPrint, setSelectedReferralForPrint] = useState<any | null>(null);

  // Active disciplinary referrals state
  const [referralList, setReferralList] = useState<any[]>(() => AppStateStore.getDisciplinaryReferrals());

  // 💼 Workplace Apprentice Tracking States
  const [contractsList, setContractsList] = useState(() => AppStateStore.getWorkplaceContracts());

  const [visitsList, setVisitsList] = useState(() => AppStateStore.getWorkplaceVisits());

  const [companiesList, setCompaniesList] = useState(() => AppStateStore.getWorkplaceCompanies());

  // Saving helpers syncing with AppStateStore to notify subscribers:
  const saveContractsList = (newList: any) => {
    setContractsList(newList);
    AppStateStore.saveWorkplaceContracts(newList);
  };
  
  const saveVisitsList = (newList: any) => {
    setVisitsList(newList);
    AppStateStore.saveWorkplaceVisits(newList);
  };

  const saveCompaniesList = (newList: any) => {
    setCompaniesList(newList);
    AppStateStore.saveWorkplaceCompanies(newList);
  };

  // Centralized SmartStage DZ Live Logs and SMS states
  const [remoteLogs, setRemoteLogs] = useState(() => AppStateStore.getRemoteAttendanceLogs());
  const [smsLogs, setSmsLogs] = useState(() => AppStateStore.getSmsLogs());
  const [authorizedPartners, setAuthorizedPartners] = useState(() => AppStateStore.getAuthorizedPartners());

  useEffect(() => {
    const unsub = AppStateStore.subscribe(() => {
      setRemoteLogs(AppStateStore.getRemoteAttendanceLogs());
      setSmsLogs(AppStateStore.getSmsLogs());
      setAuthorizedPartners(AppStateStore.getAuthorizedPartners());
      setTeacherAbsences(AppStateStore.getTeacherAbsences());
      setContractsList(AppStateStore.getWorkplaceContracts());
      setVisitsList(AppStateStore.getWorkplaceVisits());
      setCompaniesList(AppStateStore.getWorkplaceCompanies());
      setReferralList(AppStateStore.getDisciplinaryReferrals());
      setInspectionReports(AppStateStore.getWorkplaceInspectionReports());
    });
    return unsub;
  }, []);

  // Form states
  const [showAddContractForm, setShowAddContractForm] = useState(false);
  const [newContract, setNewContract] = useState({ studentName: '', code: '', specialty: '', companyName: '', guardianName: '', guardianPhone: '', studentPhone: '', status: 'نشط', startDate: '', endDate: '' });

  const [showAddPartnerForm, setShowAddPartnerForm] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', role: '', phone: '', isActive: true, note: '' });
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  // Auto-forwarding / CC state of official WhatsApp partner
  const [sendCopyToPartnerId, setSendCopyToPartnerId] = useState<string>('');

  const [showAddVisitForm, setShowAddVisitForm] = useState(false);
  const [newVisit, setNewVisit] = useState({ studentName: '', companyName: '', visitorName: '', visitDate: '', visitTime: '', status: 'مجدولة', notes: '' });

  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', apprenticesCount: 1, rating: 4, compliance: 'ممتاز', feedback: '' });

  // 📋 Professional Workplace Inspection Reports (تقارير تفتيش الوسط المهني)
  const [inspectionReports, setInspectionReports] = useState<any[]>(() => AppStateStore.getWorkplaceInspectionReports());

  const [showAddReportForm, setShowAddReportForm] = useState(false);
  const [newReport, setNewReport] = useState<{
    companyName: string;
    visitorName: string;
    studentName: string;
    visitDate: string;
    complianceScore: 'ممتاز' | 'مستقر' | 'مخالفات بيداغوجية';
    reportDetails: string;
    attachedPhotos: string[];
  }>({
    companyName: '',
    visitorName: '',
    studentName: '',
    visitDate: new Date().toISOString().split('T')[0],
    complianceScore: 'مستقر',
    reportDetails: '',
    attachedPhotos: []
  });

  const saveInspectionReports = (newList: any[]) => {
    setInspectionReports(newList);
    AppStateStore.saveWorkplaceInspectionReports(newList);
  };

  const handleInspectionPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const fileArray = Array.from(files);
    const promises = fileArray.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64s => {
      setNewReport(prev => ({
        ...prev,
        attachedPhotos: [...prev.attachedPhotos, ...base64s]
      }));
    }).catch(err => {
      console.error("Error reading safety photos: ", err);
    });
  };

  // Live Dispatch Simulator panel states
  const [smsContractId, setSmsContractId] = useState('');
  const [smsRecipientType, setSmsRecipientType] = useState<'parent' | 'trainee'>('parent');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsChannel, setSmsChannel] = useState<'sms' | 'whatsapp' | 'telegram' | 'push' | 'email'>('whatsapp');

  // Sync phone number based on selected contract and recipient type
  useEffect(() => {
    if (smsContractId) {
      const contract = contractsList.find((c: any) => c.id === smsContractId);
      if (contract) {
        if (smsRecipientType === 'parent') {
          setSmsPhone(contract.guardianPhone || '');
        } else {
          setSmsPhone(contract.studentPhone || '');
        }
      }
    } else {
      setSmsPhone('');
    }
  }, [smsContractId, smsRecipientType, contractsList]);

  // Flattened active learner registry matching with group code for referral targeting
  const allLearnersWithGroups = groups.flatMap((group) =>
    group.learners.map((learner) => {
      const grpSessions = sessions.filter((s) => s.groupId === group.id);
      let absences = 0;
      grpSessions.forEach((s) => {
        if (s.attendanceMap[learner.id] === 'absent') absences++;
      });
      return { learner, group, absences };
    })
  );

  // Simulation steps for AI legal parser
  const aiRegulationsSteps = [
    "🧠 جاري الاتصال بخودام الذكاء الاصطناعي لفهرسة ملف القانون الداخلي...",
    "⚡ جاري مسح محتوى الصفحات والمواد التشريعية لوزارة التكوين بالجزائر...",
    "⚙️ جاري استخلاص البنود والمقاييس (عتبات الإنذار والشطب وتناسب الساعات)...",
    "⚖️ تفعيل القوانين برمجياً بنجاح (مكافئة 4 حصص = يوم، خصومات الفترات = 0.5 يوم)...",
    "✅ حفظ كافة بيانات التدابير وبداية معالجة الحضور بناءً على اللائحة الجديدة."
  ];

  // getArabicDayName helper for date rendering
  const getArabicDayName = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat('ar-DZ', { weekday: 'long' }).format(date);
    } catch (e) {
      return '';
    }
  };

  // Sychronize and load groups and sessions from local storage
  useEffect(() => {
    setGroups(AppStateStore.getGroups());
    setSessions(AppStateStore.getSessions());
    setReferralList(AppStateStore.getDisciplinaryReferrals());

    const unsubscribe = AppStateStore.subscribe(() => {
      setGroups(AppStateStore.getGroups());
      setSessions(AppStateStore.getSessions());
      setReferralList(AppStateStore.getDisciplinaryReferrals());
    });
    return unsubscribe;
  }, []);

  // Update selectedGroupSessionId dynamically when groups load or change
  useEffect(() => {
    if (groups.length > 0) {
      const exists = groups.some(g => g.id === selectedGroupSessionId);
      if (!selectedGroupSessionId || !exists) {
        setSelectedGroupSessionId(groups[0].id);
      }
    } else {
      setSelectedGroupSessionId('');
    }
  }, [groups, selectedGroupSessionId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setStep('analyzing');
      
      // Simulate AI Analysis of the spreadsheet or PDF document
      setTimeout(() => {
        setExtractedData([
          { name: 'أيوب بلقصيري', id: `T-EX-${Math.floor(Math.random()*900+100)}`, gender: 'M', status: 'new' },
          { name: 'هدى بومعرافي', id: `T-EX-${Math.floor(Math.random()*900+100)}`, gender: 'F', status: 'new' },
          { name: 'لؤي موايعية', id: `T-EX-${Math.floor(Math.random()*900+100)}`, gender: 'M', status: 'new' },
          { name: 'يسرى شوشان', id: `T-EX-${Math.floor(Math.random()*900+100)}`, gender: 'F', status: 'new' }
        ]);
        setStep('result');
      }, 2000);
    }
  };

  const resetImport = () => {
    setStep('config');
    setSelectedSpecialization('');
    setFileName('');
    setExtractedData([]);
  };

  const triggerRegulationsAnalysis = (file: File) => {
    setIsAnalyzingRegulations(true);
    setAnalysisStepIndex(0);
    
    // Detailed simulation of multi-stage AI extraction
    const steps = [
      { label: "🧠 جاري الاتصال بخودام الذكاء الاصطناعي لفهرسة ملف القانون الداخلي...", delay: 800 },
      { label: "⚡ جاري مسح محتوى الصفحات والمواد التشريعية لوزارة التكوين بالجزائر...", delay: 1000 },
      { label: "⚙️ جاري استخلاص البنود والمقاييس (عتبات الإنذار والشطب وتناسب الساعات)...", delay: 1200 },
      { label: "⚖️ تفعيل القوانين برمجياً بنجاح (مكافئة 4 حصص = يوم، خصومات الفترات = 0.5 يوم)...", delay: 900 },
      { label: "✅ حفظ كافة بيانات التدابير وبداية معالجة الحضور بناءً على اللائحة الجديدة.", delay: 600 }
    ];
    
    let currentStep = 0;
    const runNextStep = () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setAnalysisStepIndex(currentStep);
        setTimeout(runNextStep, steps[currentStep].delay);
      } else {
        const newRules = {
          fileName: file.name,
          analyzedAt: new Date().toLocaleDateString('ar-DZ') + ' ' + new Date().toLocaleTimeString('ar-DZ'),
          status: 'active',
          rules: {
            absentHourWeight: 0.25,
            morningHalfDay: true,
            afternoonHalfDay: true,
            warning1: 3,
            warning2: 9,
            council: 10,
            dismissal: 20,
            alertMaxDays: 3,
            warningMaxDays: 9,
            reprimandDays: 10,
            consecutiveDismissalDays: 15,
            fragmentedDismissalDays: 20,
            decreeNum: "2026-" + Math.floor(Math.random() * 900 + 100),
            customNotes: `تم استخلاص وهيكلة القوانين تلقائياً بالذكاء الاصطناعي من الوثيقة القانونية المرفوعة «${file.name}». يوجه الإنذار الأول عند تجاوز 3 أيام، والتوبيخ والإحالة للمجلس عند بلوغ 10 أيام، والشطب النهائي عند بلوغ 20 يوماً متفرقاً.`
          }
        };
        
        localStorage.setItem('rq_ai_analyzed_regulations', JSON.stringify(newRules));
        localStorage.setItem('rq_internal_regulations_pdf_name', file.name);
        setAiRegulations(newRules);
        setPdfFileName(file.name);
        setIsAnalyzingRegulations(false);
        setSuccessMessage(`✓ تم بنجاح تشغيل واستنباط محددات القانون الداخلي «${file.name}» عبر الذكاء الاصطناعي وتطبيقها على كافة فروع المواظبة والمجالس.`);
      }
    };
    
    setTimeout(runNextStep, steps[0].delay);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('⚠️ الرجاء رفع ملف بصيغة PDF صالحة لتطبيق القوانانين الداخلية.');
        return;
      }
      triggerRegulationsAnalysis(file);
      setShowRegulationsModal(false);
    }
  };

  const handlePurgeReferrals = () => {
    AppStateStore.saveDisciplinaryReferrals([]);
    setSuccessMessage("✓ تم بنجاح تصفير سجلات وموقوفي المجلس التأديبي وإلغاء كافة الاستدعاءات الفورية للبدء بصفحة جديدة.");
    setShowPurgeReferralsConfirm(false);
  };

  const finalizeImport = () => {
    if (!selectedSpecialization) return;

    const targetGroup = groups.find(g => g.id === selectedSpecialization);
    if (targetGroup) {
      const term = AppStateStore.getTerminology(targetGroup.modeId);
      
      // Append newly extracted learners
      const updatedLearners = [...targetGroup.learners];
      extractedData.forEach(extracted => {
        if (!updatedLearners.some(l => l.name === extracted.name)) {
          updatedLearners.push({
            id: extracted.id,
            name: extracted.name,
            gender: extracted.gender,
            status: 'active'
          });
        }
      });

      // Update in our persistent state store and auto-approve the list now that it is uploaded
      AppStateStore.updateGroup(targetGroup.id, { 
        learners: updatedLearners,
        isListApproved: true
      });
      
      // Save in upload history log
      const newUploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        fileName: fileName || 'قائمة_تنزيل_مباشر.xlsx',
        timestamp: new Date().toLocaleDateString('ar-DZ') + ' ' + new Date().toLocaleTimeString('ar-DZ'),
        groupName: `${targetGroup.name} (${targetGroup.code})`,
        learnersCount: extractedData.length,
        status: 'مكتملة ومزامنة آلياً ✓',
        operatorRole: 'الرقابة العامة'
      };

      const newHistory = [newUploadRecord, ...uploadHistory];
      localStorage.setItem('rq_student_list_uploads', JSON.stringify(newHistory));
      setUploadHistory(newHistory);

      setSuccessMessage(`تم بنجاح إدراج ومزامنة قائمة المتكونين (${extractedData.length} ${term.singular}) في الفوج/الفرع [${targetGroup.code}] وتفعيل ظهور القائمة الرسمية لدى الأساتذة لحجز الغيابات.`);
    }

    resetImport();
  };

  // Add teacher absence record
  const handleAddAbsenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAbsence.teacherName) return;

    let targetGName = 'غياب عام';
    if (newAbsence.groupId) {
      const gObj = groups.find(x => x.id === newAbsence.groupId);
      if (gObj) targetGName = gObj.name;
    }

    const rec = {
      id: `T-ABS-${Date.now()}`,
      teacherName: newAbsence.teacherName,
      groupName: targetGName,
      groupId: newAbsence.groupId,
      date: newAbsence.date,
      period: newAbsence.period,
      reason: newAbsence.reason || 'غير مبين',
      justified: newAbsence.justified
    };

    const updatedAbsences = [rec, ...teacherAbsences];
    setTeacherAbsences(updatedAbsences);
    localStorage.setItem('rq_teacher_absences', JSON.stringify(updatedAbsences));
    setSuccessMessage(`تم بنجاح تقييد غياب الأستاذ: ${newAbsence.teacherName} في السجل القانوني لولاية الرقابة.`);
    setIsAddingAbsence(false);
    setNewAbsence({
      teacherName: '',
      groupId: '',
      date: new Date().toISOString().split('T')[0],
      period: '8-10',
      reason: '',
      justified: false
    });
  };

  const handleDeleteAbsence = (id: string) => {
    const updated = teacherAbsences.filter(x => x.id !== id);
    setTeacherAbsences(updated);
    localStorage.setItem('rq_teacher_absences', JSON.stringify(updated));
    setSuccessMessage('تم شطب وحذف غياب الأستاذ من السجل.');
  };

  // --- Late Entry Alert System calculations (30 minutes past section start) ---
  const periodsConfig = [
    { key: '8-10', startHour: 8, startMinute: 0, label: 'الفترة الصباحية الأولى (08:00 - 10:00)' },
    { key: '10-12', startHour: 10, startMinute: 0, label: 'الفترة الصباحية الثانية (10:00 - 12:00)' },
    { key: '13-15', startHour: 13, startMinute: 0, label: 'الفترة المسائية الأولى (13:00 - 15:00)' },
    { key: '15-16.5', startHour: 15, startMinute: 0, label: 'الفترة المسائية الثانية (15:00 - 16:30)' },
    { key: '15-17', startHour: 15, startMinute: 0, label: 'الفترة المسائية السبت (15:00 - 17:00)' },
    { key: '17-19', startHour: 17, startMinute: 0, label: 'فترة الدروس المسائية (17:00 - 19:00)' }
  ];

  const getLateAlerts = () => {
    // Current simulated local system time is 2026-05-20T10:52:11Z
    const currentHour = 10;
    const currentMinute = 52;
    const todayStr = '2026-05-20'; // fixed target date for high fidelity simulation

    const sessions = AppStateStore.getSessions();
    const alertsList: any[] = [];

    groups.forEach(g => {
      const activePeriodsForGroup = AppStateStore.getAvailablePeriods(g.modeId, todayStr);
      
      activePeriodsForGroup.forEach(period => {
        const conf = periodsConfig.find(x => x.key === period.key);
        if (!conf) return;

        // Calculate hours and minutes differential
        const startTotalMinutes = conf.startHour * 60 + conf.startMinute;
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const difference = currentTotalMinutes - startTotalMinutes;

        // Yes! Difference has passed 30 minutes constraint!
        if (difference >= 30) {
          // Check if there is already a logged session by the teacher for this group, date & period key
          const isSubmitted = sessions.some(s => 
            s.groupId === g.id && 
            s.date === todayStr && 
            s.sessionPeriod === period.key
          );

          if (!isSubmitted) {
            alertsList.push({
              groupId: g.id,
              groupCode: g.code,
              groupName: g.name,
              guardian: g.guardian,
              periodLabel: period.label,
              periodKey: period.key,
              diff: difference,
              startTimeRaw: conf.startHour.toString().padStart(2, '0') + ':00'
            });
          }
        }
      });
    });

    return alertsList;
  };

  const activeLateAlerts = getLateAlerts();

  // --- Calculate Deep Attendance breakdowns (حوصلة كاملة لكل تخصص) ---
  const specialtiesStats = groups.map(g => {
    const term = AppStateStore.getTerminology(g.modeId);
    
    // Sessions registered for this group
    const grpSessions = sessions.filter(s => s.groupId === g.id);
    
    let totalPresents = 0;
    let totalAbsents = 0;
    let totalLates = 0;
    let totalExcused = 0;

    grpSessions.forEach(sess => {
      Object.entries(sess.attendanceMap).forEach(([learnerId, status]) => {
        if (status === 'present') totalPresents++;
        else if (status === 'absent') totalAbsents++;
        else if (status === 'late') totalLates++;
        else if (status === 'excused') totalExcused++;
      });
    });

    const totalTicks = totalPresents + totalAbsents + totalLates + totalExcused;
    const attendancePercentage = totalTicks > 0 
      ? Math.round(((totalPresents + totalLates + totalExcused) / totalTicks) * 100) 
      : 100;

    // Get exact breakdown of the most recent session
    const sortedSESS = [...grpSessions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestSess = sortedSESS[0] || null;

    let latestPresentsList: string[] = [];
    let latestAbsentsList: string[] = [];

    if (latestSess) {
      g.learners.forEach(learner => {
        const st = latestSess.attendanceMap[learner.id] || 'present';
        if (st === 'absent') {
          latestAbsentsList.push(learner.name);
        } else {
          latestPresentsList.push(learner.name);
        }
      });
    }

    return {
      group: g,
      term,
      sessionsCount: grpSessions.length,
      presentsCount: totalPresents,
      absentsCount: totalAbsents,
      latesCount: totalLates,
      excusedCount: totalExcused,
      attendancePercentage,
      latestSession: latestSess,
      latestPresentsList,
      latestAbsentsList
    };
  });

  // KPI summaries
  const totalClasses = groups.length;
  const totalStudents = groups.reduce((acc, g) => acc + g.learners.length, 0);
  const totalTeacherAbsents = teacherAbsences.length;

  // Filter specialties stats according to search bar
  const filteredSpecialties = specialtiesStats.filter(stat => 
    stat.group.name.includes(specialtySearch) || 
    stat.group.code.includes(specialtySearch) ||
    stat.group.guardian.includes(specialtySearch)
  );

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Banner and Notifications */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div className="text-right flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 justify-end">
              فضاء الرقابة والمواظبة العامة
              <span className="text-3xl text-amber-500">⚜️</span>
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 text-right">
              المطابقة القانونية لدفاتر الغياب، ترحيل البيانات، ومزامنة الفضاءات الرقمية لولاية تبسة
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end md:justify-start">
            <button
              type="button"
              onClick={() => setShowRegulationsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-150 border border-amber-200 text-amber-800 text-xs font-black rounded-2xl cursor-pointer transition-all shadow-sm shrink-0 active:scale-95"
              title="تحميل واطلاع القانون الداخلي لمقاييس الغيابات وعتبات المجلس التأديبي"
            >
              <span className="text-sm">⚖️</span>
              <span>القانون الداخلي وعتبات التأديب (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto">
        {[
          { id: 'sync', label: 'بوابة رفع ومزامنة المتكونين', icon: '📋' },
          { id: 'specialties', label: 'حضور التخصصات والأفواج', icon: '📈' },
          { id: 'professional_track', label: 'متابعة الوسط المهني 💼', icon: '💼' },
          { id: 'teacher_absences', label: 'سجل غيابات الأساتذة', icon: '👨‍🏫' },
          { id: 'alerts', label: 'الإنذارات التلقائية والتسريح', icon: '🚨' },
          { id: 'attendance_sessions', label: 'دفتر الغيابات الرقمي 🗓️', icon: '🗓️' },
          { id: 'disciplinary_referrals', label: 'المجلس التأديبي والقرارات', icon: '⚖️' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl cursor-pointer transition-all",
              activeTab === tab.id
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {(() => {
        // Core Statistics Helper
        const getLearnerStats = (groupId: string, learnerId: string) => {
          const grpSessions = sessions.filter(s => s.groupId === groupId);
          let abs = 0, lates = 0, excused = 0;
          grpSessions.forEach(s => {
            const st = s.attendanceMap[learnerId];
            if (st === 'absent') abs++;
            else if (st === 'late') lates++;
            else if (st === 'excused') excused++;
          });
          return { absences: abs, lates, excused };
        };

        switch (activeTab) {
          case 'specialties':
            return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center flex-row-reverse flex-wrap gap-4 font-sans">
                  <div className="relative w-full max-w-sm">
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 rounded-2xl py-2 pl-4 pr-10 text-xs font-bold outline-none text-right"
                      placeholder="البحث باسم الفوج، التخصص أو الأستاذ الوصي..."
                      value={specialtySearch}
                      onChange={(e) => setSpecialtySearch(e.target.value)}
                    />
                    <span className="absolute left-auto right-3.5 top-2.5 text-slate-400 text-xs shadow-none">🔎</span>
                  </div>
                  <h3 className="font-extrabold text-[#0D0E12] text-sm font-sans">أفواج التكوين والنسبة العامة للمواظبة لولاية تبسة</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSpecialties.length === 0 ? (
                    <div className="col-span-2 text-center p-12 text-slate-400 font-bold">لا توجد نتائج مطابقة للبحث.</div>
                  ) : (
                    filteredSpecialties.map((stat) => {
                      const isExpanded = expandedGroupId === stat.group.id;
                      const sortBy = learnerSortBy[stat.group.id] || 'name';
                      
                      // Sort learners
                      const sortedLearners = [...stat.group.learners];
                      if (sortBy === 'absences-desc') {
                        sortedLearners.sort((a, b) => {
                          const aStat = getLearnerStats(stat.group.id, a.id);
                          const bStat = getLearnerStats(stat.group.id, b.id);
                          return bStat.absences - aStat.absences;
                        });
                      } else if (sortBy === 'absences-asc') {
                        sortedLearners.sort((a, b) => {
                          const aStat = getLearnerStats(stat.group.id, a.id);
                          const bStat = getLearnerStats(stat.group.id, b.id);
                          return aStat.absences - bStat.absences;
                        });
                      } else {
                        sortedLearners.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
                      }

                      return (
                        <div key={stat.group.id} className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all flex flex-col justify-between font-sans">
                          <div>
                            <div className="flex justify-between items-start flex-row-reverse mb-3">
                              <span className="text-[10px] bg-amber-50 text-amber-850 px-2.5 py-1 rounded-full font-black font-mono">{stat.group.code}</span>
                              <div className="text-right">
                                <h4 className="font-extrabold text-[#0D0E12] text-sm">{stat.group.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">الأستاذ الوصي: {stat.group.guardian}</p>
                              </div>
                            </div>

                            {/* Trainee List Approval Status Badge */}
                            <div className="mt-3 flex justify-end">
                              {stat.group.isListApproved ? (
                                <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-1 rounded-lg flex items-center gap-1 flex-row-reverse">
                                  <span>قائمة المتكونين معتمدة ومفعلة للأساتذة ✅</span>
                                </span>
                              ) : (
                                <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1 flex-row-reverse">
                                  <span>القائمة غير معتمدة أو بانتظار الرفع والموافقة ⚠️</span>
                                </span>
                              )}
                            </div>

                            {/* Attendance metric bar */}
                            <div className="space-y-1 mt-4 text-right">
                              <div className="flex justify-between text-[10px] font-black flex-row-reverse">
                                <span className={cn(stat.attendancePercentage < 80 ? "text-rose-600" : "text-emerald-700")}>{stat.attendancePercentage.toFixed(1)}% مواظبة ونشاط</span>
                                <span className="text-slate-400 font-sans">{stat.sessionsCount} حصص مقيدة</span>
                              </div>
                              <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden font-sans">
                                <div 
                                  className={cn("h-full rounded-full transition-all duration-500", stat.attendancePercentage < 80 ? "bg-rose-500" : "bg-emerald-500")}
                                  style={{ width: `${stat.attendancePercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center flex-row-reverse flex-wrap gap-2">
                            <span className="text-[10px] font-black text-slate-400">{stat.group.learners.length} {stat.term.plural} بالمهنة</span>
                            <div className="flex gap-1.5 flex-row-reverse">
                              <button
                                type="button"
                                onClick={() => setExpandedGroupId(isExpanded ? null : stat.group.id)}
                                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black rounded-xl transition cursor-pointer"
                              >
                                {isExpanded ? "إغلاق ✕" : "قائمة السجل 📋"}
                              </button>
                              
                              {stat.group.isListApproved ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من تجميد القائمة وسحب الاعتماد مؤقتاً لـ [${stat.group.name}]؟ سيتم حظر حجز الغيابات لدى الأساتذة.`)) {
                                      AppStateStore.updateGroup(stat.group.id, { isListApproved: false });
                                      setSuccessMessage(`✓ تم سحب اعتماد وتجميد القائمة للفوج [${stat.group.code}]. تم حظر الحجز لدى الأساتذة.`);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-black rounded-xl transition cursor-pointer"
                                >
                                  سحب الاعتماد ⚠️
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    AppStateStore.updateGroup(stat.group.id, { isListApproved: true });
                                    setSuccessMessage(`✓ تم بنجاح الموافقة واعتماد قائمة المتكونين لتخصص [${stat.group.name}]، وهي الآن متاحة كلياً ومنشورة للأساتذة لحجز الغيابات.`);
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition cursor-pointer flex items-center gap-0.5 animate-pulse"
                                >
                                  <span>موافقة واعتماد ⚡</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-5 pt-5 border-t-2 border-dashed border-slate-100 space-y-4 font-sans">
                              {/* Sort buttons */}
                              <div className="flex gap-2 justify-end items-center flex-row-reverse">
                                <span className="text-[9px] font-black text-slate-400 font-sans">ترتيب المتكونين:</span>
                                <button
                                  type="button"
                                  onClick={() => setLearnerSortBy(prev => ({ ...prev, [stat.group.id]: 'name' }))}
                                  className={cn("px-2 py-1 text-[9px] font-black rounded cursor-pointer transition", sortBy === 'name' ? "bg-[#0F172A] text-white" : "bg-slate-100 text-slate-600")}
                                >
                                  أبجدي
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setLearnerSortBy(prev => ({ ...prev, [stat.group.id]: 'absences-desc' }))}
                                  className={cn("px-2 py-1 text-[9px] font-black rounded cursor-pointer transition", sortBy === 'absences-desc' ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600")}
                                >
                                  الأكثر غياباً
                                </button>
                              </div>

                              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                                <table className="w-full text-right bg-white text-xs text-right font-sans">
                                  <thead>
                                    <tr className="bg-slate-50 border-b text-slate-600 font-bold">
                                      <th className="px-4 py-2 text-right">الاسم الكامل للمتكون</th>
                                      <th className="px-4 py-2 text-center font-sans">الغياب الفعلي</th>
                                      <th className="px-5 py-2 text-center font-sans">المعادل الرقمي</th>
                                      <th className="px-4 py-2 text-center font-sans">الوضعية الانضباطية</th>
                                      <th className="px-4 py-2 text-center">إشراف وحذف</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-150 font-sans">
                                    {sortedLearners.map(learner => {
                                      const lStat = getLearnerStats(stat.group.id, learner.id);
                                      const eqDays = lStat.absences * aiRegulations.rules.absentHourWeight;
                                      
                                      let statusBadge = <span className="text-[9.5px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-115 font-sans">مواظب ✓</span>;
                                      if (eqDays >= aiRegulations.rules.dismissal) {
                                        statusBadge = <span className="text-[9.5px] font-extrabold text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-115 font-sans">شطب نهائي 🚫</span>;
                                      } else if (eqDays >= aiRegulations.rules.council) {
                                        statusBadge = <span className="text-[9.5px] font-extrabold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-115 font-sans">مجلس تأديبي ⚖️</span>;
                                      } else if (eqDays >= aiRegulations.rules.warning2) {
                                        statusBadge = <span className="text-[9.5px] font-extrabold text-orange-850 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-115 font-sans">مكافئ إنذار 2 ⚠️</span>;
                                      } else if (eqDays >= aiRegulations.rules.warning1) {
                                        statusBadge = <span className="text-[9.5px] font-extrabold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-115 font-sans">مكافئ إنذار 1 ⚠️</span>;
                                      }

                                      return (
                                        <tr key={learner.id} className="hover:bg-slate-50 font-sans">
                                          <td className="px-4 py-2.5 text-right font-extrabold text-[#0D0E12] text-[11px]">{learner.name}</td>
                                          <td className="px-4 py-2.5 text-center font-black text-rose-600 text-[11px]">{lStat.absences} حصة</td>
                                          <td className="px-5 py-2.5 text-center font-black text-[#0D0E12] text-[11px] font-sans">{eqDays.toFixed(1)} يوم</td>
                                          <td className="px-4 py-2.5 text-center">{statusBadge}</td>
                                          <td className="px-4 py-2.5 text-center font-sans">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (confirm(`تحذير بيداغوجي: هل أنت متأكد بنسبة 100% من حذف وإقصاء المتكون [${learner.name}] نهائياً من سجلات التمهين؟`)) {
                                                  AppStateStore.deleteTrainee(stat.group.id, learner.id);
                                                  setGroups(AppStateStore.getGroups()); // refresh
                                                  setSuccessMessage(`✓ تم بنجاح شطب وإلغاء بطاقة المتكون [${learner.name}] بصفة استثنائية.`);
                                                }
                                              }}
                                              className="p-1 px-2 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded text-[9.5px] font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-1 mx-auto"
                                            >
                                              <Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-white animate-none shadow-none" />
                                              <span>شطب 🗑️</span>
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
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );

          case 'sync':
            return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-[#0D0E12] text-sm flex items-center gap-2 justify-end">
                    مزامنة واستيراد بطاقات المتكونين عبر الملفات
                    📋
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-relaxed">
                    قم برفع ملف Excel أو CSV لتحديث قائمة المتكونين في الفروع البيداغوجية ومزامنتها آلياً مع منصات وزارة التكوين
                  </p>
                </div>

                <div className="space-y-4 text-right">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1">اختر التخصص / الفوج المستهدف</label>
                    <select
                      value={selectedSpecialization}
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-black outline-none focus:ring-2 focus:ring-amber-400 transition text-right"
                    >
                      <option value="">-- اختر الفوج المطلوب --</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          [{g.code}] {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSpecialization && (
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50/55 hover:bg-slate-50 hover:border-amber-400 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept=".xlsx,.csv,.xls"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2 flex flex-col items-center justify-center">
                        <span className="text-3xl">📤</span>
                        <p className="text-xs font-black text-slate-800">اسحب ملف المزامنة هنا أو انقر لتحديد الملف</p>
                        <p className="text-[10px] text-slate-400 font-bold">يدعم صيغ Excel (.xlsx), CSV (.csv) المستلهمة من الرقابة الرقمية</p>
                      </div>
                    </div>
                  )}

                  {fileName && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between flex-row-reverse text-right font-sans">
                      <div>
                        <p className="text-xs font-black text-slate-800">اسم ملف المزامنة:</p>
                        <p className="text-[10px] text-amber-800 font-mono font-black mt-0.5">{fileName}</p>
                      </div>
                      <span className="text-[9.5px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">جاهز للتحميل والدمج ✓</span>
                    </div>
                  )}

                  {extractedData.length > 0 && (
                    <div className="space-y-4 border-t border-slate-100 pt-5">
                      <h4 className="font-extrabold text-[#0D0E12] text-xs">النسخة المستخلصة بالذكاء الاصطناعي للمتكونين ({extractedData.length} أسماء):</h4>
                      
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-right bg-white text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b text-slate-600 font-bold">
                              <th className="px-4 py-2 text-right">رقم التعريف بوزارة التمهين</th>
                              <th className="px-4 py-2 text-right">الاسم الكامل للمستفيد</th>
                              <th className="px-4 py-2 text-center">الجنس</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 font-sans">
                            {extractedData.map((ex, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-500">{ex.id}</td>
                                <td className="px-4 py-2.5 text-right font-extrabold text-slate-800">{ex.name}</td>
                                <td className="px-4 py-2.5 text-center font-bold text-slate-600">{ex.gender === 'M' ? 'M' : 'F'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button
                        type="button"
                        onClick={finalizeImport}
                        className="w-full bg-[#0F172A] hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition cursor-pointer"
                      >
                        حفظ ومزامنة المتكونين وتأكيد الاستيراد البيداغوجي للطلبة ✓
                      </button>
                    </div>
                  )}

                  {/* Historical Log of Previous Uploads */}
                  <div className="bg-slate-50/70 rounded-3xl border border-slate-150 p-6 mt-6 text-right space-y-4 shadow-3xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3 flex-row-reverse flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <span className="text-lg">⏱️</span>
                        <div>
                          <h4 className="font-black text-slate-800 text-xs">السجل التاريخي لعمليات الرفع والربط السابقة</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">جدول محدث وعبر المزامنة المباشرة مع وزارة التكوين</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">سجل بيداغوجي موثق 🛡️</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] text-slate-500 font-extrabold border-b border-slate-150">
                            <th className="p-3 text-right">معرف المعالجة والملف</th>
                            <th className="p-3 text-right">المجموعة / الفوج البيداغوجي</th>
                            <th className="p-3 text-center">العدد المستورد</th>
                            <th className="p-3 text-center">تاريخ وتوقيت المعالجة</th>
                            <th className="p-3 text-center">الحالة الكلية للرفع</th>
                            <th className="p-3 text-right">المرخص بالعملية</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                          {uploadHistory.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-450 font-bold text-xs">
                                لا توجد أي عمليات رفع سابقة مسجلة باللوحة حالياً.
                              </td>
                            </tr>
                          ) : (
                            uploadHistory.map((log: any) => (
                              <tr key={log.id} className="hover:bg-slate-50/50 transition duration-150">
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <span className="font-extrabold text-slate-800">{log.fileName}</span>
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] rounded font-bold">{log.id}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-700 font-black">{log.groupName}</td>
                                <td className="p-3 text-center font-black text-emerald-600">{log.learnersCount} متكون</td>
                                <td className="p-3 text-center text-slate-500 font-mono text-[10.5px] font-bold">{log.timestamp}</td>
                                <td className="p-3 text-center">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg inline-block">
                                    {log.status}
                                  </span>
                                </td>
                                <td className="p-3 text-teal-600 font-black text-left">{log.operatorRole}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ADVANCED ADMIN DESTRUCTION / SYSTEM RESET AREA */}
                  <div className="border border-red-200 bg-red-500/5 p-6 rounded-3xl text-right space-y-4 pt-5 mt-6">
                    <div className="flex items-center gap-2 justify-end text-red-650 flex-row-reverse">
                      <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                      <h4 className="font-extrabold text-[#0D0E12] text-xs">منطقة التحكم المتقدم وإعادة تهيئة النظام الكاملة (Failsafe Reset Center)</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      تحذير بيداغوجي: تتيح لك هذه اللوحة محو سجلات التمهين وتصفير إحصائيات النشاط للبدء بنظافة هيكلية تامة أو استرجاع النسخ الاحتياطية الاستراتيجية في معاهد الجزائر.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPurgeConfirm(true)}
                        className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-[10.5px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                      >
                        <span>تصفير النظام وإجراء إعادة ضبط كاملة 🚨</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          AppStateStore.createNewSnapshot("النسخة الدورية الوقائية");
                          setSuccessMessage("✓ تم تسجيل وحفظ لقطة لقاعدة البيانات بالذاكرة السحابية المشفرة بنجاح!");
                        }}
                        className="px-4 py-3 bg-slate-900 hover:bg-slate-850 text-white font-black text-[10.5px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>توليد لقطة وقائية لقاعدة البيانات (Snapshot) ☁️</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );

          case 'teacher_absences':
            return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center flex-row-reverse flex-wrap gap-4 border-b border-slate-100 pb-3">
                  <div className="text-right">
                    <h3 className="font-extrabold text-[#0D0E12] text-sm flex items-center gap-2 justify-end">
                      سجلات غياب الطاقم التربوي والأستاتذة للأفواج
                      👨‍🏫
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">تقييد غيابات المؤطرين في السجل القانوني لولاية البيداغوجيا</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingAbsence(!isAddingAbsence)}
                    className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-black rounded-xl transition"
                  >
                    {isAddingAbsence ? "إغلاق استمارة التسجيل ✕" : "تقييد غياب أستاذ جديد ➕"}
                  </button>
                </div>

                {isAddingAbsence && (
                  <form onSubmit={handleAddAbsenceSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-black text-slate-900 text-xs text-right">إضافة تقرير غياب أستاذ رسمي:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">اسم الأستاذ الكامل</label>
                        <input
                          type="text"
                          placeholder="مثال: أ. دليلة طهراوي"
                          value={newAbsence.teacherName}
                          onChange={(e) => setNewAbsence(prev => ({ ...prev, teacherName: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-amber-400 text-right font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">تاريخ الغياب الرسمي</label>
                        <input
                          type="date"
                          value={newAbsence.date}
                          onChange={(e) => setNewAbsence(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-amber-400 text-right font-sans font-bold"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">الفوج / الفرع المتأثر بالغياب</label>
                        <select
                          value={newAbsence.groupId}
                          onChange={(e) => setNewAbsence(prev => ({ ...prev, groupId: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-amber-400 text-right font-bold"
                        >
                          <option value="">-- غياب عام عن كافة الأفواج --</option>
                          {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name} [{g.code}]</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">الفترة الزمنية للغياب</label>
                        <select
                          value={newAbsence.period}
                          onChange={(e) => setNewAbsence(prev => ({ ...prev, period: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-amber-400 text-right font-bold"
                        >
                          <option value="8-10">الحصة الأولى (08:00 - 10:00)</option>
                          <option value="10-12">الحصة الثانية (10:00 - 12:00)</option>
                          <option value="13-15">الحصة الثالثة (13:00 - 15:00)</option>
                          <option value="15-16.5">الحصة الرابعة (15:00 - 16:30)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">مذكرة تبرير الغياب البيداغوجي</label>
                        <input
                          type="text"
                          placeholder="مثال: رخصة إدارية أو عطلة مرضية..."
                          value={newAbsence.reason}
                          onChange={(e) => setNewAbsence(prev => ({ ...prev, reason: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-amber-400 text-right font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-6">
                        <label className="text-[10.5px] font-black text-slate-600 block">هل الغياب مبرر رسمياً؟</label>
                        <input
                          type="checkbox"
                          checked={newAbsence.justified}
                          onChange={(e) => setNewAbsence(prev => ({ ...prev, justified: e.target.checked }))}
                          className="w-4 h-4 text-emerald-500 focus:ring-emerald-400 border-slate-300 rounded"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-2.5 rounded-xl transition cursor-pointer"
                    >
                      تأكيد تسجيل غياب الأستاذ وتعميم الإنذار 👨‍🏫✓
                    </button>
                  </form>
                )}

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-right bg-white text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-600 font-bold">
                        <th className="px-5 py-3 text-right">اسم الأستاذ الكامل</th>
                        <th className="px-5 py-3 text-center">التاريخ والفترة</th>
                        <th className="px-5 py-3 text-right">الحالة والمستند المستهدف</th>
                        <th className="px-5 py-3 text-center">التبرير</th>
                        <th className="px-5 py-3 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-sans">
                      {teacherAbsences.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">لا توجد أي غيابات مقيدة للأساتذة حالياً في السجل البيداغوجي.</td>
                        </tr>
                      ) : (
                        teacherAbsences.map(abs => (
                          <tr key={abs.id} className="hover:bg-slate-50/30">
                            <td className="px-5 py-3.5 text-right font-extrabold text-slate-900 text-xs">{abs.teacherName}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className="block font-black text-slate-800">{abs.date}</span>
                              <span className="block text-[10px] text-slate-400 font-bold mt-0.5">الحصة المعنية: {abs.period}</span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-bold text-slate-600">{abs.groupName}</td>
                            <td className="px-5 py-3.5 text-center">
                              {abs.justified ? (
                                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-150 rounded-full">مبرر رسمياً ✓</span>
                              ) : (
                                <span className="text-[10px] font-black text-red-800 bg-red-50 px-2 py-0.5 border border-red-100 rounded-full">غير مبرر ✖</span>
                              )}
                              <span className="block text-[9px] text-slate-400 font-bold mt-1 max-w-[120px] truncate" title={abs.reason}>{abs.reason}</span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteAbsence(abs.id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-200 rounded-lg transition"
                              >
                                حذف 🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case 'alerts':
            return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 text-right">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-[#0D0E12] text-sm flex items-center gap-2 justify-end">
                    بوابة الإنذارات البيداغوجية والفرز الآلي للاتسريح والمجالس
                    🚨
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    الفرز الآلي لغيابات المتكونين ومطابقتها قانونياً مع عتبات الإنذار والشطب القانوني المحدد في القانون الداخلي
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(() => {
                    let w1Count = 0, w2Count = 0, councilCount = 0, dismissalCount = 0;
                    groups.forEach(g => {
                      g.learners.forEach(l => {
                        const lStat = getLearnerStats(g.id, l.id);
                        const eq = lStat.absences * aiRegulations.rules.absentHourWeight;
                        if (eq >= (aiRegulations.rules.dismissal || 20)) dismissalCount++;
                        else if (eq >= (aiRegulations.rules.council || 10)) councilCount++;
                        else if (eq > (aiRegulations.rules.warning1 || 3)) w2Count++;
                        else if (eq > 0) w1Count++;
                      });
                    });
                    
                    return (
                      <>
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center space-y-0.5">
                          <p className="text-[10px] text-red-800 font-black">شطب بيداغوجي تلقائي (بلغ 20 يوماً)</p>
                          <h4 className="text-xl font-black text-red-650">{dismissalCount} حالات مستهدفين</h4>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center space-y-0.5">
                          <p className="text-[10px] text-rose-800 font-black">مجلس تأديبي (بلغ 10 أيام)</p>
                          <h4 className="text-xl font-black text-rose-650">{councilCount} متكونين</h4>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center space-y-0.5">
                          <p className="text-[10px] text-amber-800 font-black">عقوبة الإنذار البيداغوجي (تعدى 3 أيام)</p>
                          <h4 className="text-xl font-black text-amber-650">{w2Count} حالات حاسمة</h4>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center space-y-0.5">
                          <p className="text-[10px] text-indigo-800 font-black">تنبيه غيابات أولي (أقل من 3 أيام)</p>
                          <h4 className="text-xl font-black text-indigo-150">{w1Count} متكونين</h4>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-right bg-white text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-600 font-bold">
                        <th className="px-5 py-3 text-right">اسم المتكون والفوج</th>
                        <th className="px-5 py-3 text-center">الغياب الفعلي</th>
                        <th className="px-5 py-3 text-center">معادلة الحصص</th>
                        <th className="px-5 py-3 text-center">مستوى المخالفة التلقائية</th>
                        <th className="px-5 py-3 text-center">الإجراءات والقرارات المنفذة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-sans">
                      {(() => {
                        const alertItems: any[] = [];
                        groups.forEach(g => {
                          g.learners.forEach(l => {
                            const lStat = getLearnerStats(g.id, l.id);
                            const eq = lStat.absences * aiRegulations.rules.absentHourWeight;
                            if (eq > 0) {
                              alertItems.push({
                                learner: l,
                                group: g,
                                stat: lStat,
                                eq
                              });
                            }
                          });
                        });

                        if (alertItems.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">لا يوجد أي متكونين تجاوزا الحدود الاستباقية للغيابات حالياً ✓ الكل في حالة انضباط قانوني ممتاز.</td>
                            </tr>
                          );
                        }

                        return alertItems.map((item, idx) => {
                          let label = "";
                          let col = "";
                          if (item.eq >= (aiRegulations.rules.dismissal || 20)) { label = "مستحق قرار شطب نهائي 🚫"; col = "text-red-700 bg-red-50 border-red-150"; }
                          else if (item.eq >= (aiRegulations.rules.council || 10)) { label = "مستحق إحالة للمجلس التأديبي ⚖️"; col = "text-rose-700 bg-rose-50 border-rose-150"; }
                          else if (item.eq > (aiRegulations.rules.warning1 || 3)) { label = "إنذار بيداغوجي أول (تجاوز 3 أيام) ⚠️"; col = "text-orange-700 bg-orange-50 border-orange-150"; }
                          else { label = "تنبيه أول غيابات (أقل من 3 أيام) ⚠️"; col = "text-indigo-750 bg-indigo-50 border-indigo-150"; }

                          return (
                            <tr key={idx} className="hover:bg-slate-50/30">
                              <td className="px-5 py-3.5 text-right flex flex-col items-end">
                                <span className="font-extrabold text-slate-900 text-xs block">{item.learner.name}</span>
                                <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">{item.group.name} [{item.group.code}]</span>
                              </td>
                              <td className="px-5 py-3.5 text-center font-black text-rose-600 text-xs">{item.stat.absences} حصة</td>
                              <td className="px-5 py-3.5 text-center font-black text-slate-800 text-xs">{item.eq.toFixed(2)} يوم مغيب</td>
                              <td className="px-5 py-3.5 text-center">
                                <span className={cn("text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full border", col)}>{label}</span>
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <div className="flex gap-1 justify-center">
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const contract = contractsList.find((c: any) => c.studentName === item.learner.name);
                                        const phone = contract?.guardianPhone || '0555301822';
                                        const msg = `تنبيه غيابات رسمي من معهد التمهين للمتكون ${item.learner.name}: لقد تفاقم غيابك ووصل إلى ${item.stat.absences} حصص. يُرجى الحضور لتبرير الغياب لتفادي إجراءات الشطب النهائي ومجلس التأديب.`;
                                        
                                        AppStateStore.sendSimulatedSmsAlert({
                                          studentName: item.learner.name,
                                          guardianPhone: phone,
                                          text: msg,
                                          reason: 'تنبيه غيابات تصاعدي تلقائي',
                                          channel: 'sms',
                                          recipientType: 'parent',
                                          recipientName: contract?.guardianName || 'الولي'
                                        });

                                        // Auto-CC active authorized partners for official surveillance linkage
                                        const activeParts = AppStateStore.getAuthorizedPartners().filter((p: any) => p.isActive);
                                        activeParts.forEach((p: any) => {
                                          AppStateStore.sendSimulatedSmsAlert({
                                            studentName: item.learner.name,
                                            guardianPhone: p.phone,
                                            text: `[نسخة غيابات رسمية - جهة معتمدة: ${p.role}] نعلمكم برصد غياب تصاعدي للمتكون ${item.learner.name} لعدد ${item.stat.absences} حصص، وتم بث إرسال تنبيه رسمي هاتفياً لعائلته للمثول وتجنب سقوط الحق والشطب.`,
                                            reason: `نسخة إحاطة تلقائية: ${p.role}`,
                                            channel: 'whatsapp',
                                            recipientType: 'parent',
                                            recipientName: p.name
                                          });
                                        });

                                        setSmsLogs(AppStateStore.getSmsLogs());
                                        setSuccessMessage(`✓ تم بث وإرسال التنبيه التلقائي الهاتفي (SMS) بنجاح مع مطابقة وإخطار الجهات المعتمدة.`);
                                      }}
                                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black border border-indigo-150 rounded-lg cursor-pointer transition active:scale-95 whitespace-nowrap"
                                      title="إرسال رسالة نصية قصيرة SMS"
                                    >
                                      SMS 📱
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const contract = contractsList.find((c: any) => c.studentName === item.learner.name);
                                        const phone = contract?.guardianPhone || '0555301822';
                                        const msg = `تنبيه غيابات رسمي من معهد التمهين للمتكون ${item.learner.name}: لقد تفاقم غيابك ووصل إلى ${item.stat.absences} حصص. يُرجى الحضور لتبرير الغياب لتفادي إجراءات الشطب النهائي ومجلس التأديب.`;
                                        
                                        AppStateStore.sendSimulatedSmsAlert({
                                          studentName: item.learner.name,
                                          guardianPhone: phone,
                                          text: msg,
                                          reason: 'تنبيه غيابات تصاعدي تلقائي',
                                          channel: 'whatsapp',
                                          recipientType: 'parent',
                                          recipientName: contract?.guardianName || 'الولي'
                                        });

                                        // Auto-CC active authorized partners for official surveillance linkage
                                        const activeParts = AppStateStore.getAuthorizedPartners().filter((p: any) => p.isActive);
                                        activeParts.forEach((p: any) => {
                                          AppStateStore.sendSimulatedSmsAlert({
                                            studentName: item.learner.name,
                                            guardianPhone: p.phone,
                                            text: `[نسخة غيابات رسمية - جهة معتمدة: ${p.role}] نعلمكم برصد غياب تصاعدي للمتكون ${item.learner.name} لعدد ${item.stat.absences} حصص، وتم بث إرسال تنبيه رسمي هاتفياً لعائلته للمثول وتجنب سقوط الحق والشطب.`,
                                            reason: `نسخة إحاطة تلقائية: ${p.role}`,
                                            channel: 'whatsapp',
                                            recipientType: 'parent',
                                            recipientName: p.name
                                          });
                                        });

                                        setSmsLogs(AppStateStore.getSmsLogs());
                                        setSuccessMessage(`✓ تم بث وإشعار الولي فورياً وتأكيد إشعار الواتساب التلقائي مع مطابقة وإخطار الجهات المعتمدة.`);
                                        const formattedPhone = phone.trim().replace(/^0/, '+213');
                                        const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(formattedPhone)}&text=${encodeURIComponent(msg)}`;
                                        window.open(whatsappUrl, '_blank');
                                      }}
                                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black border border-emerald-150 rounded-lg cursor-pointer transition active:scale-95 flex items-center gap-0.5 whitespace-nowrap"
                                      title="إرسال تنبيه فوري عبر واتساب"
                                    >
                                      واتساب 💬
                                    </button>
                                  </div>
                                  {item.eq >= aiRegulations.rules.council && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveTab('disciplinary_referrals');
                                        // Find candidate list matching this item name
                                        const foundCandidateIdx = allLearnersWithGroups.findIndex(x => x.learner.id === item.learner.id);
                                        if (foundCandidateIdx !== -1) {
                                          setSelectedLearnerIdx(foundCandidateIdx.toString());
                                          setIsManualInput(false);
                                          setReasonInput(`بناء على القانون الداخلي للغيابات والمادة البيداغوجية، المتكون قد استوفى غياب ${item.stat.absences} حصص تماثل ${item.eq.toFixed(2)} أيام كاملة مما يوجب إحالته المباشرة للمجلس.`);
                                        }
                                      }}
                                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black border border-rose-250 rounded-lg cursor-pointer transition active:scale-95 animate-pulse"
                                    >
                                      استدعاء للمجلس ⚖️
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* ======================================================== */}
                {/* ⚙️ SECTION: NOTIFICATION SETTINGS & AUTHORIZED PARTNERS (WhatsApp) */}
                {/* ======================================================== */}
                <div className="border-t border-slate-150 pt-8 mt-8 space-y-6">
                  <div className="flex justify-between items-center flex-row-reverse flex-wrap gap-2 pb-2">
                    <div className="text-right">
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 justify-end">
                        <span className="text-emerald-600 font-sans">💬</span>
                        إعدادات الإشعارات: إدارة جهات الإخطار الشريكة والمعتمدة بالواتساب
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 text-right">
                        قم بإعداد وتحديث قنوات التواصل وأرقام الهواتف لمديري القطاع ورؤساء المصالح لاستلاف نسخ تلقائية فورية من إشعارات الغيابات والمجالس التأديبية بالواتساب
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPartner({ name: '', role: '', phone: '', isActive: true, note: '' });
                        setEditingPartnerId(null);
                        setShowAddPartnerForm(!showAddPartnerForm);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black border border-indigo-150 rounded-xl cursor-pointer transition active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      <span>{showAddPartnerForm ? 'إلغاء ✕' : 'إضافة جهة معتمدة جديدة ➕'}</span>
                    </button>
                  </div>

                  {showAddPartnerForm && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newPartner.name || !newPartner.phone) {
                          alert('الرجاء تعبئة الاسم ورقم الهاتف.');
                          return;
                        }
                        let updated;
                        if (editingPartnerId) {
                          updated = authorizedPartners.map(p => p.id === editingPartnerId ? { ...p, ...newPartner } : p);
                          setSuccessMessage('✓ تم تحديث بيانات الجهة المعتمدة بنجاح.');
                        } else {
                          const newer = { ...newPartner, id: `PARTNER-${Date.now()}` };
                          updated = [newer, ...authorizedPartners];
                          setSuccessMessage('✓ تم إضافة جهة معتمدة جديدة برقم الواتساب الخاص بها.');
                        }
                        AppStateStore.saveAuthorizedPartners(updated);
                        setAuthorizedPartners(updated);
                        setShowAddPartnerForm(false);
                        setEditingPartnerId(null);
                        setNewPartner({ name: '', role: '', phone: '', isActive: true, note: '' });
                      }}
                      className="bg-emerald-50/45 border border-emerald-150 p-5 rounded-2xl text-right space-y-4 animate-in fade-in"
                    >
                      <h5 className="font-extrabold text-slate-800 text-xs text-right">
                        {editingPartnerId ? '✍️ تعديل بيانات جهة معتمدة' : '➕ إضافة جهة رسمية معتمدة جديدة'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 mb-1">الاسم الكامل واللقب *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="مثال: أ. مسعود خلف الله"
                            value={newPartner.name}
                            onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                            className="w-full bg-white border border-slate-205 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 mb-1">الصفة الإدارية / الدور *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="مثال: مدير المعهد / مفتش التمهين"
                            value={newPartner.role}
                            onChange={(e) => setNewPartner({ ...newPartner, role: e.target.value })}
                            className="w-full bg-white border border-slate-205 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 mb-1">رقم هاتف الواتساب *</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="مثال: 0661223344"
                            value={newPartner.phone}
                            onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                            className="w-full bg-white border border-slate-205 rounded-xl px-3 py-2 text-xs font-mono font-bold text-left outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="col-span-1 md:col-span-3">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">ملاحظات أو غرض الإخطار (اختياري)</label>
                          <input 
                            type="text" 
                            placeholder="مثل: يستلم نسخ مجمعة من قرارات الشطب ومجلس التأديب..."
                            value={newPartner.note}
                            onChange={(e) => setNewPartner({ ...newPartner, note: e.target.value })}
                            className="w-full bg-white border border-slate-205 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 h-10 px-1 justify-end">
                          <input 
                            type="checkbox" 
                            id="partner-active"
                            checked={newPartner.isActive}
                            onChange={(e) => setNewPartner({ ...newPartner, isActive: e.target.checked })}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="partner-active" className="text-xs font-black text-slate-700 cursor-pointer select-none">تفعيل الإشعارات الآن ✅</label>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-start pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition duration-200 cursor-pointer"
                        >
                          {editingPartnerId ? 'تعديل وحفظ البيانات' : 'حفظ وإدراج الجهة المعتمدة 💾'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddPartnerForm(false);
                            setEditingPartnerId(null);
                          }}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-xl transition duration-200 cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs bg-white">
                    <table className="w-full text-right bg-white text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b text-slate-600 font-bold">
                          <th className="px-5 py-3 text-right text-[10.5px]">الجهة والاسم الإداري</th>
                          <th className="px-5 py-3 text-center text-[10.5px]">رقم هاتف الواتساب</th>
                          <th className="px-5 py-3 text-center text-[10.5px]">غرض الإحاطة البيداغوجية</th>
                          <th className="px-5 py-3 text-center text-[10.5px]">الوضعية ببرنامج الإخطار</th>
                          <th className="px-5 py-3 text-center text-[10.5px]">العمليات المتاحة والتواصل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {authorizedPartners.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                              لم يتم تسجيل أي جهات إخطار معتمدة بالواتساب رسمياً في النظام الداخلي حتى الآن.
                            </td>
                          </tr>
                        ) : (
                          authorizedPartners.map((partner) => (
                            <tr key={partner.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3.5 text-right flex flex-col items-end">
                                <span className="font-extrabold text-slate-900 text-xs">{partner.name}</span>
                                <span className="text-[9.5px] text-indigo-700 font-black block mt-0.5">{partner.role}</span>
                              </td>
                              <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-800 tracking-wider">
                                {partner.phone}
                              </td>
                              <td className="px-5 py-3.5 text-center text-slate-500 font-extrabold text-[10px]">
                                {partner.note || '— تتبع ومطابقة عامة —'}
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <span className={cn(
                                  "text-[9px] font-black px-2.5 py-0.5 rounded-full border",
                                  partner.isActive 
                                    ? "text-emerald-700 bg-emerald-50 border-emerald-150" 
                                    : "text-slate-400 bg-slate-50 border-slate-200"
                                )}>
                                  {partner.isActive ? 'مستقبل نشط ✅' : 'معطل مؤقتاً ⚠️'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <div className="flex gap-1.5 justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Diagnostic Whatsapp Link
                                      const text = `أهلاً ${partner.name} (${partner.role}). قنوات الدعم الرقمي لمعهد التمهين: تم اختبار وربط رقمكم بنجاح لتلقي نسخ متطابقة فورية من إشعارات الغيابات للتمهين الميداني.`;
                                      const formattedPhone = partner.phone.trim().replace(/^0/, '+213');
                                      const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(formattedPhone)}&text=${encodeURIComponent(text)}`;
                                      window.open(url, '_blank');
                                      setSuccessMessage(`✓ تم بنجاح فتح رابط فحص التواصل الهاتفي بالواتساب لـ [${partner.name}]`);
                                    }}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10.5px] font-black border border-emerald-150 rounded-lg cursor-pointer transition active:scale-95 flex items-center gap-0.5"
                                    title="اختبار الاتصال مع جهة التواصل"
                                  >
                                    <span>فحص 🧪</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewPartner({
                                        name: partner.name,
                                        role: partner.role,
                                        phone: partner.phone,
                                        isActive: partner.isActive || false,
                                        note: partner.note || ''
                                      });
                                      setEditingPartnerId(partner.id);
                                      setShowAddPartnerForm(true);
                                    }}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black border border-indigo-150 rounded-lg cursor-pointer transition active:scale-95"
                                  >
                                    تعديل ✍️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`هل توافق بالتأكيد على تجميد وشطب الجهة الرسمية المعتمدة [${partner.name}]؟`)) {
                                        const updated = authorizedPartners.filter(p => p.id !== partner.id);
                                        AppStateStore.saveAuthorizedPartners(updated);
                                        setAuthorizedPartners(updated);
                                        setSuccessMessage('✓ تم شطب وإزالة رقم الجهة بنجاح.');
                                      }
                                    }}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-150 rounded-lg cursor-pointer transition active:scale-95"
                                  >
                                    حذف 🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );

          case 'attendance_sessions':
            return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 text-right">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-row-reverse flex-wrap gap-2">
                  <div className="text-right">
                    <h3 className="font-extrabold text-[#0D0E12] text-sm flex items-center gap-2 justify-end">
                      دفتر الغيابات الرقمي وتسجيل الحصص اليومية
                      🗓️
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">تسجيل غيابات المتكونين لكل حصة بشكل يدوي مباشر ومطابقتها للرقابة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1">تاريخ الحصة</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none text-right font-sans font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1">اختر الفوج / التخصص</label>
                    <select
                      value={selectedGroupSessionId}
                      onChange={(e) => setSelectedGroupSessionId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-black outline-none text-right"
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>[{g.code}] {g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {(() => {
                  const grp = groups.find(g => g.id === selectedGroupSessionId);
                  if (!grp) return null;
                  
                  // Available periods for this group on selected date
                  const periods = AppStateStore.getAvailablePeriods(grp.modeId, selectedDate);
                  
                  if (periods.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl font-bold">
                        ⚠️ لا توجد فترات أو حصص تابعة لنمط التكوين في هذا التاريخ (عطلة نهاية الأسبوع الجمعة أو السبت غير المتاحة).
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6 border-t border-slate-100 pt-5 animate-in fade-in">
                      {periods.map(period => {
                        // Check if session already registered on database
                        const existingSess = sessions.find(s => s.groupId === grp.id && s.date === selectedDate && s.sessionPeriod === period.key);
                        
                        return (
                          <div key={period.key} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                            <div className="flex justify-between items-center flex-row-reverse flex-wrap gap-2">
                              <div className="text-right">
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-black">{period.key}</span>
                                <h4 className="font-extrabold text-[#0D0E12] text-sm mt-1">{period.label}</h4>
                              </div>
                              {existingSess ? (
                                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-xl">✓ حصة مؤكدة ومرحّلة لقاعدة الرقابة</span>
                              ) : (
                                <span className="text-[10px] font-black text-rose-800 bg-rose-50 border border-rose-150 px-2.5 py-1 rounded-xl">✖ حصة شاغرة لم يتم ترحيل غياباتها بعد</span>
                              )}
                            </div>

                            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                              <table className="w-full text-right bg-white text-xs pt-2">
                                <thead>
                                  <tr className="bg-slate-100 border-b text-slate-500 font-bold">
                                    <th className="px-5 py-2.5 text-right w-1/3">المتكون</th>
                                    <th className="px-5 py-2.5 text-center">الخيار وحالة الحضور لحصة الأستاذ الوصي</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-150 font-sans">
                                  {grp.learners.map(l => {
                                    // Current status inside the existing session or default present
                                    const currStatus = existingSess ? (existingSess.attendanceMap[l.id] || 'present') : 'present';
                                    const isPresentState = currStatus === 'present' || currStatus === 'late';
                                    
                                    return (
                                      <tr key={l.id} className="hover:bg-slate-50/50">
                                        <td className="px-5 py-3 font-extrabold text-slate-800 text-[11px] text-right">{l.name}</td>
                                        <td className="px-5 py-3 text-center">
                                          {existingSess ? (
                                            /* Once a session is registered & validated, locked present/absent states apply */
                                            isPresentState ? (
                                              <div className="flex items-center gap-2 justify-center">
                                                <span className={cn(
                                                  "px-3 py-1 text-[10px] font-black rounded-lg text-white flex items-center gap-1.5",
                                                  currStatus === 'present' ? "bg-emerald-500" : "bg-amber-500"
                                                )}>
                                                  <span>{currStatus === 'present' ? "حاضر ✓" : "متأخر ⏱️"}</span>
                                                  <span className="text-[8px] bg-white/20 px-1 py-0.25 rounded font-bold">مؤكد بيداغوجياً</span>
                                                </span>
                                                <span className="text-slate-400 font-bold text-[9px] flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200" title="مغلق قانونياً طبقاً للنظام الداخلي للولاية">
                                                  <span>🔒 مغلق للتعديل</span>
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="flex flex-col items-center gap-2 justify-center">
                                                <div className="flex justify-center gap-1.5">
                                                  {/* Button 1: غياب غير مبرر */}
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const map = { ...existingSess.attendanceMap };
                                                      map[l.id] = 'absent';
                                                      
                                                      AppStateStore.submitSession({
                                                        groupId: grp.id,
                                                        date: selectedDate,
                                                        sessionPeriod: period.key,
                                                        sessionType: existingSess.sessionType || 'theory',
                                                        duration: existingSess.duration || 2,
                                                        attendanceMap: map,
                                                        justifications: existingSess.justifications || {},
                                                        submittedAt: new Date().toISOString()
                                                      });
                                                      setSessions(AppStateStore.getSessions());
                                                      setSuccessMessage(`✓ تم تعيين حالة غياب المتربص [${l.name}] كـ «غياب غير مبرر» بنجاح.`);
                                                    }}
                                                    className={cn(
                                                      "px-2.5 py-1 text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1",
                                                      currStatus === 'absent' 
                                                        ? "bg-rose-600 text-white shadow-sm border border-rose-700" 
                                                        : "bg-slate-50 hover:bg-slate-100 text-slate-500"
                                                    )}
                                                  >
                                                    <span>غير مبرر ✖</span>
                                                  </button>

                                                  {/* Button 2: غياب مبرر */}
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const map = { ...existingSess.attendanceMap };
                                                      map[l.id] = 'excused';
                                                      
                                                      AppStateStore.submitSession({
                                                        groupId: grp.id,
                                                        date: selectedDate,
                                                        sessionPeriod: period.key,
                                                        sessionType: existingSess.sessionType || 'theory',
                                                        duration: existingSess.duration || 2,
                                                        attendanceMap: map,
                                                        justifications: existingSess.justifications || {},
                                                        submittedAt: new Date().toISOString()
                                                      });
                                                      setSessions(AppStateStore.getSessions());
                                                      setSuccessMessage(`✓ تم تعيين غياب المتربص [${l.name}] كـ «غياب مبرر». يرجى رفع الوثيقة الثبوتية.`);
                                                    }}
                                                    className={cn(
                                                      "px-2.5 py-1 text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1",
                                                      currStatus === 'excused' 
                                                        ? "bg-indigo-600 text-white shadow-sm border border-indigo-700" 
                                                        : "bg-slate-50 hover:bg-slate-100 text-slate-500"
                                                    )}
                                                  >
                                                    <span>غياب مبرر 💮</span>
                                                  </button>
                                                </div>

                                                {/* Document attachment if justified (excused) */}
                                                {currStatus === 'excused' && (
                                                  <div className="mt-1 flex items-center gap-2 justify-center bg-indigo-50/70 border border-indigo-100 px-3 py-1.5 rounded-xl text-[10.5px] w-full max-w-xs animate-in fade-in slide-in-from-top-1">
                                                    {existingSess.justifications?.[l.id] ? (
                                                      <div className="flex items-center gap-1.5 justify-between w-full">
                                                        <div className="flex items-center gap-1 text-indigo-950 font-extrabold truncate max-w-[155px]">
                                                          <span className="text-sm">📄</span>
                                                          <span className="truncate" title={existingSess.justifications[l.id]}>
                                                            {existingSess.justifications[l.id]}
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              const map = { ...existingSess.attendanceMap };
                                                              const justs = existingSess.justifications ? { ...existingSess.justifications } : {};
                                                              delete justs[l.id];

                                                              AppStateStore.submitSession({
                                                                groupId: grp.id,
                                                                date: selectedDate,
                                                                sessionPeriod: period.key,
                                                                sessionType: existingSess.sessionType || 'theory',
                                                                duration: existingSess.duration || 2,
                                                                attendanceMap: map,
                                                                justifications: justs,
                                                                submittedAt: new Date().toISOString()
                                                              });
                                                              setSessions(AppStateStore.getSessions());
                                                              setSuccessMessage(`✓ تم إزالة وثيقة تبرير المتربص [${l.name}] بنجاح.`);
                                                            }}
                                                            className="text-rose-600 hover:text-rose-800 font-bold text-[9.5px]"
                                                            title="حذف الملف"
                                                          >
                                                            حذف
                                                          </button>
                                                          <span className="text-slate-300">|</span>
                                                          <label className="text-indigo-600 hover:text-indigo-800 font-bold text-[9.5px] cursor-pointer">
                                                            <span>تغيير</span>
                                                            <input
                                                              type="file"
                                                              className="hidden"
                                                              onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                  const map = { ...existingSess.attendanceMap };
                                                                  const justs = existingSess.justifications ? { ...existingSess.justifications } : {};
                                                                  justs[l.id] = file.name;

                                                                  AppStateStore.submitSession({
                                                                    groupId: grp.id,
                                                                    date: selectedDate,
                                                                    sessionPeriod: period.key,
                                                                    sessionType: existingSess.sessionType || 'theory',
                                                                    duration: existingSess.duration || 2,
                                                                    attendanceMap: map,
                                                                    justifications: justs,
                                                                    submittedAt: new Date().toISOString()
                                                                  });
                                                                  setSessions(AppStateStore.getSessions());
                                                                  setSuccessMessage(`✓ تم تحديث وثيقة تبرير [${l.name}] لملف: ${file.name}`);
                                                                }
                                                              }}
                                                            />
                                                          </label>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <label className="flex items-center justify-center gap-1.5 text-indigo-700 hover:text-indigo-950 font-black cursor-pointer w-full text-center py-1 bg-white hover:bg-indigo-100/50 rounded-lg border border-indigo-200 transition">
                                                        <span>📎 رفع التبرير (شهادة مرضية...)</span>
                                                        <input
                                                          type="file"
                                                          className="hidden"
                                                          onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                              const map = { ...existingSess.attendanceMap };
                                                              const justs = existingSess.justifications ? { ...existingSess.justifications } : {};
                                                              justs[l.id] = file.name;

                                                              AppStateStore.submitSession({
                                                                groupId: grp.id,
                                                                date: selectedDate,
                                                                sessionPeriod: period.key,
                                                                sessionType: existingSess.sessionType || 'theory',
                                                                duration: existingSess.duration || 2,
                                                                attendanceMap: map,
                                                                justifications: justs,
                                                                submittedAt: new Date().toISOString()
                                                              });
                                                              setSessions(AppStateStore.getSessions());
                                                              setSuccessMessage(`✓ تم رفع وثيقة تبرير [${file.name}] للمتربص [${l.name}] بنجاح.`);
                                                            }
                                                          }}
                                                        />
                                                      </label>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          ) : (
                                            /* If session is not submitted yet, they can initialize it freely or see the standard options.
                                               Once any option is clicked, it submitSession and locks them in */
                                            <div className="flex justify-center gap-1">
                                              {['present', 'absent', 'late', 'excused'].map(st => {
                                                let lbl = "", cl = "";
                                                if (st === 'present') { lbl = "حاضر ✓"; cl = "bg-slate-50 hover:bg-slate-100 text-slate-500"; }
                                                else if (st === 'absent') { lbl = "غائب ✖"; cl = "bg-slate-50 hover:bg-slate-100 text-slate-500"; }
                                                else if (st === 'late') { lbl = "متأخر ⏱️"; cl = "bg-slate-50 hover:bg-slate-100 text-slate-500"; }
                                                else { lbl = "تبرير 💮"; cl = "bg-slate-50 hover:bg-slate-100 text-slate-500"; }
                                                
                                                return (
                                                  <button
                                                    key={st}
                                                    type="button"
                                                    onClick={() => {
                                                      const map: Record<string, any> = {};
                                                      // Initialize all other students as present, and this student with selected state
                                                      grp.learners.forEach(learnerItem => {
                                                        map[learnerItem.id] = learnerItem.id === l.id ? st : 'present';
                                                      });
                                                      
                                                      AppStateStore.submitSession({
                                                        groupId: grp.id,
                                                        date: selectedDate,
                                                        sessionPeriod: period.key,
                                                        sessionType: 'theory',
                                                        duration: 2,
                                                        attendanceMap: map,
                                                        justifications: {},
                                                        submittedAt: new Date().toISOString()
                                                      });
                                                      setSessions(AppStateStore.getSessions());
                                                      setSuccessMessage(`✓ تم فتح وتحضير الحصة للمجموعة، وتعيين حالة المتربص [${l.name}] بنجاح.`);
                                                    }}
                                                    className={cn("px-2.5 py-1 text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer", cl)}
                                                  >
                                                    {lbl}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            );

          case 'disciplinary_referrals':
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form to dispatch referral */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xl text-right">
                  <div className="flex items-center gap-2 justify-end mb-4 text-[#0F172A]">
                    <h3 className="font-black text-base">جدولة وإصدار استدعاء المجلس</h3>
                    <span className="text-xl">⚖️</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-extrabold leading-relaxed mb-6 uppercase tracking-wider text-right">
                    إعداد مستندات الاستدعاء الرسمي للجلسة الانضباطية بالبث في المخالفات المنسوبة
                  </p>

                  <div className="space-y-4">
                    {/* Toggle between roster-selection and manual freeform input */}
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => setIsManualInput(true)}
                        className={cn("flex-1 text-[10px] font-black py-2 rounded-lg transition-all", isManualInput ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800")}
                      >
                        إدخال يدوي (خارج القائمة) ✍️
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsManualInput(false)}
                        className={cn("flex-1 text-[10px] font-black py-2 rounded-lg transition-all", !isManualInput ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800")}
                      >
                        اختيار متكون من السجلات الأكاديمية
                      </button>
                    </div>

                    {!isManualInput ? (
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">المتكون المرشح (غياب حرج)</label>
                        <select
                          value={selectedLearnerIdx}
                          onChange={(e) => {
                            setSelectedLearnerIdx(e.target.value);
                            const pair = allLearnersWithGroups[parseInt(e.target.value)];
                            if (pair) {
                              setReasonInput(`بناء على المادة القانونية للنظام الداخلي، والمواظبة بمؤسسة تبسة 2، فإن المتكون قد استوفى غياب ${pair.absences} حصة بمجموع يعادل ${(pair.absences * aiRegulations.rules.absentHourWeight).toFixed(2)} أيام كاملة دون ملف تبرير مقبول.`);
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-black outline-none text-right"
                        >
                          {allLearnersWithGroups.map((p, idx) => (
                            <option key={idx} value={idx}>
                              {p.learner.name} ({p.group.code}) — {p.absences} غيابات
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 animate-in fade-in">
                        <div>
                          <label className="block text-[10px] font-black text-amber-900 mb-1">اسم المتكون الكامل</label>
                          <input
                            type="text"
                            placeholder="مثال: يونس جلال الفاروق"
                            value={manualLearnerName}
                            onChange={(e) => setManualLearnerName(e.target.value)}
                            className="w-full bg-white border border-amber-200 focus:border-amber-400 rounded-xl py-2 px-3 text-xs font-bold outline-none text-right"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-black text-amber-900 mb-1">رمز الفوج (Code)</label>
                            <input
                              type="text"
                              placeholder="مثال: AP-NET-2023"
                              value={manualGroupCode}
                              onChange={(e) => setManualGroupCode(e.target.value)}
                              className="w-full bg-white border border-amber-200 rounded-xl py-2 px-3 text-xs font-bold outline-none text-right font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-amber-900 mb-1">اسم الفوج/التخصص</label>
                            <input
                              type="text"
                              placeholder="مثال: أمن الشبكات"
                              value={manualGroupName}
                              onChange={(e) => setManualGroupName(e.target.value)}
                              className="w-full bg-white border border-amber-200 rounded-xl py-2 px-3 text-xs font-bold outline-none text-right"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-amber-900 mb-1">عدد أيام الغياب التقديرية</label>
                          <input
                            type="number"
                            value={manualAbsenceDays}
                            onChange={(e) => setManualAbsenceDays(e.target.value)}
                            className="w-full bg-white border border-amber-200 rounded-xl py-2 px-3 text-xs font-bold outline-none text-right"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex justify-between items-center flex-row-reverse">
                        <label className="block text-[10px] font-black text-slate-500">موجبات الإحالة والمواد القانونية</label>
                        <button
                          type="button"
                          onClick={() => {
                            let text = "";
                            if (isManualInput) {
                              text = `تجاوز الحد الأكاديمي لغياب ومكافئ ${manualAbsenceDays} أيام غياب كاملة، بموجب المادة القانونية في النظام الداخلي المرفوع لولاية تبسة لضبط التكوين.`;
                            } else {
                              const pair = allLearnersWithGroups[parseInt(selectedLearnerIdx)];
                              if (pair) {
                                const eq = pair.absences * aiRegulations.rules.absentHourWeight;
                                text = `تجاوز المتكون الحد القانوني للغيابات المقررة بناء على النظام الداخلي للمؤسسة بموجب تراكم غياب ${pair.absences} حصة (أكثر من ${eq.toFixed(2)} يوماً دون مبرر مقيد).`;
                              }
                            }
                            setReasonInput(text);
                          }}
                          className="text-[9px] font-black text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md"
                        >
                          توليد قانوني بالذكاء الاصطناعي 🛡️
                        </button>
                      </div>
                      <textarea
                        value={reasonInput}
                        onChange={(e) => setReasonInput(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none text-right resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">وقت انعقاد المجلس</label>
                        <input
                          type="time"
                          value={councilTimeInput}
                          onChange={(e) => setCouncilTimeInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none text-right font-sans font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">تاريخ الانعقاد الجلسة</label>
                        <input
                          type="date"
                          value={councilDateInput}
                          onChange={(e) => setCouncilDateInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none text-right font-sans font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1">مكان وتفصيل الانعقاد</label>
                      <input
                        type="text"
                        value={councilPlaceInput}
                        onChange={(e) => setCouncilPlaceInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-black outline-none text-right"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        let name = "", groupN = "", groupC = "";
                        if (isManualInput) {
                          name = manualLearnerName || "متكون مجهول";
                          groupN = manualGroupName || "فوج بيداغوجي عام";
                          groupC = manualGroupCode || "MAN-TST";
                        } else {
                          const pair = allLearnersWithGroups[parseInt(selectedLearnerIdx)];
                          if (pair) {
                            name = pair.learner.name;
                            groupN = pair.group.name;
                            groupC = pair.group.code;
                          }
                        }

                        // Save new disciplinary referral
                        const newRef = AppStateStore.addDisciplinaryReferral({
                          learnerId: isManualInput ? `L-MAN-${Date.now()}` : allLearnersWithGroups[parseInt(selectedLearnerIdx)]?.learner.id || 'L-01',
                          learnerName: name,
                          groupName: groupN,
                          groupCode: groupC,
                          reason: reasonInput,
                          date: councilDateInput,
                          time: councilTimeInput,
                          place: councilPlaceInput,
                          status: 'summoned',
                          summonSent: true
                        });

                        setReferralList(AppStateStore.getDisciplinaryReferrals());
                        setSuccessMessage(`✓ تم بنجاح جدولة الجلسة الانضباطية للمتكون [${name}] وطباعة مستند الاستدعاء رقم ${newRef.id} للجنة البيداغوجية.`);
                      }}
                      className="w-full bg-[#0F172A] hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl transition shadow-lg shadow-slate-900/10 cursor-pointer"
                    >
                      إرسال الاستدعاء للمتكون وتأكيد الجدولة ⚖️✓
                    </button>
                  </div>
                </div>

                {/* Table of active referrals and quick filters */}
                <div className="lg:col-span-8 space-y-6 text-right">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-row-reverse flex-wrap gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2 justify-end uppercase tracking-widest">
                          سجل الإحالات التأديبية للمؤسسة
                          <span className="text-sm">🗳️</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 text-right">المحاضر النشطة وجلسات استماع اللجان العلمية والبيداغوجية لولاية تبسة</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPurgeReferralsConfirm(true)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10.5px] font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>🗑️</span>
                          <span>تصفير وحذف كافة السجلات</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto flex-1 font-sans text-xs">
                      <table className="w-full text-right bg-white">
                        <thead>
                          <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                            <th className="px-6 py-3 text-right">المتكون المستدعى</th>
                            <th className="px-6 py-3 text-right text-right">المبرر القانوني / المادة البيداغوجية</th>
                            <th className="px-6 py-3 text-center">تاريخ وساعة الجلسة</th>
                            <th className="px-6 py-3 text-center">مستندات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {referralList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">لا توجد إحالات مسجلة في فضاء المجلس التأديبي للولاية حالياً.</td>
                            </tr>
                          ) : (
                            referralList.map((ref) => (
                              <tr key={ref.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 text-right">
                                  <span className="font-extrabold text-slate-900 block text-[11px]">{ref.learnerName}</span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">{ref.groupName} ({ref.groupCode})</span>
                                </td>
                                <td className="px-6 py-4 text-right pr-6 max-w-[280px]">
                                  <p className="text-slate-600 leading-relaxed font-bold text-[11px]">{ref.reason}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="block font-black text-rose-600 font-mono text-[11px]">{ref.date}</span>
                                  <span className="block text-[10px] text-slate-400 font-bold mt-1 font-mono">س: {ref.time}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex gap-1 justify-center">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedReferralForPrint(ref)}
                                      className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>🖨️</span>
                                      <span>تحرير الاستدعاء والمواد</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        AppStateStore.deleteDisciplinaryReferral(ref.id);
                                        setReferralList(AppStateStore.getDisciplinaryReferrals());
                                        setSuccessMessage("✓ تم إلغاء وشطب الاستدعاء للمتكون من فضاء اللجنة الانضباطية بنجاح.");
                                      }}
                                      className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-lg transition"
                                      title="إلغاء الاستدعاء وحذف الطالب"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );

          case 'professional_track':
            return (
              <div className="space-y-6 text-right font-sans">
                
                {/* 🌟 Tab Header with Info Card */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/30 border border-amber-200/50 p-6 rounded-3xl flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] bg-amber-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-wider">
                      المنظومة الولائية لمراقبة التمهين في الوسط المهني
                    </span>
                    <h3 className="text-md font-black text-slate-900 mt-2">متابعة المتمهنين والرقابة البيداغوجية الميدانية للشركات المضيفة</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      تسمح هذه الواجهة المتكاملة لمستشاري التوجيه ومصالح الرقابة العامة بمتابعة الجدوى البيداغوجية والزيارات التفتيشية ومدى التزام مقرات العمل بعقود التمهين.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-amber-100 rounded-2xl shadow-sm text-amber-500 shrink-0 self-center">
                    <Briefcase className="w-8 h-8 text-amber-500" />
                  </div>
                </div>

                {/* 📊 SUMMARY STATISTICS FOR WORKPLACE WORK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-right flex items-center justify-between flex-row-reverse">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-lg">📝</div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase">عقود تمهين نشطة ومسجلة</p>
                      <h4 className="text-xl font-black text-[#0F172A] mt-1">
                        {contractsList.filter((c: any) => c.status === 'نشط').length} من إجمالي {contractsList.length}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-right flex items-center justify-between flex-row-reverse">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl text-lg">🗓️</div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase">الزيارات الميدانية المجدولة</p>
                      <h4 className="text-xl font-black text-[#0F172A] mt-1">
                        {visitsList.filter((v: any) => v.status === 'مجدولة').length} زيارات متبقية
                      </h4>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-right flex items-center justify-between flex-row-reverse">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl text-lg">🏢</div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase">معدل تقييم الشركات الشريكة</p>
                      <h4 className="text-xl font-black text-[#0F172A] mt-1">
                        {companiesList.length > 0 ? Math.round(companiesList.reduce((acc: any, c: any) => acc + c.rating, 0) / companiesList.length) : 0} / 5 نجوم
                      </h4>
                    </div>
                  </div>
                </div>

                {/* 🔀 GRID SECTIONS FOR CONTRACTS, VISITS AND COMPANIES */}
                <div className="space-y-8">
                  
                  {/* SECTION 1: CONTRACTS (حالة عقود التمهين) */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-row-reverse flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-extrabold text-[#0D0E12] text-sm">حالة ومطابقة عقود التمهين المبرمة</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddContractForm(!showAddContractForm)}
                        className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{showAddContractForm ? 'إغلاق الاستمارة ✕' : 'تسجيل عقد تمهين جديد +'}</span>
                      </button>
                    </div>

                    {showAddContractForm && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newContract.studentName || !newContract.companyName || !newContract.code) {
                            alert('الرجاء إدخال اسم المتمهن ورقم العقد والمؤسسة الشريكة.');
                            return;
                          }
                          const updated = [
                            {
                              id: `CON-${Date.now().toString().slice(-3)}`,
                              ...newContract
                            },
                            ...contractsList
                          ];
                          saveContractsList(updated);
                          setSuccessMessage('✓ تم بنجاح تدوين عقد تمهين بيداغوجي جديد وإضافته لسجلات الرقابة العامة.');
                          setNewContract({ studentName: '', code: '', specialty: '', companyName: '', guardianName: '', guardianPhone: '', studentPhone: '', status: 'نشط', startDate: '', endDate: '' });
                          setShowAddContractForm(false);
                        }}
                        className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 text-right"
                      >
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">الاسم الكامل للمتمهن *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="مثال: أيوب بلقصيري"
                            value={newContract.studentName} 
                            onChange={(e) => setNewContract({...newContract, studentName: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">رقم العقد القانوني *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="مثال: APPR-TEB-01"
                            value={newContract.code} 
                            onChange={(e) => setNewContract({...newContract, code: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">التخصص والفرع</label>
                          <input 
                            type="text" 
                            placeholder="تطوير الويب..."
                            value={newContract.specialty} 
                            onChange={(e) => setNewContract({...newContract, specialty: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">المؤسسة المستخدمة المضيفة *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="اتصالات الجزائر..."
                            value={newContract.companyName} 
                            onChange={(e) => setNewContract({...newContract, companyName: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">اسم الولي الشرعي</label>
                          <input 
                            type="text" 
                            placeholder="أحمد بلقصيري"
                            value={newContract.guardianName} 
                            onChange={(e) => setNewContract({...newContract, guardianName: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">رقم هاتف الولي (للواتساب/Tél) *</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="مثال: 0771234567"
                            value={newContract.guardianPhone} 
                            onChange={(e) => setNewContract({...newContract, guardianPhone: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-700 outline-none focus:border-amber-400 text-left font-sans"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">رقم هاتف المتمهن (للواتساب/Tél) *</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="مثال: 0555301822"
                            value={newContract.studentPhone} 
                            onChange={(e) => setNewContract({...newContract, studentPhone: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-700 outline-none focus:border-amber-400 text-left font-sans"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">تاريخ بداية التربص</label>
                          <input 
                            type="date" 
                            value={newContract.startDate} 
                            onChange={(e) => setNewContract({...newContract, startDate: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-700 outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">تاريخ نهاية التمهين</label>
                          <input 
                            type="date" 
                            value={newContract.endDate} 
                            onChange={(e) => setNewContract({...newContract, endDate: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-700 outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="col-span-1 flex items-end">
                          <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] py-2.5 rounded-lg cursor-pointer"
                          >
                            تأشير وحفظ العقد بالرقابة
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right bg-white text-xs whitespace-nowrap md:whitespace-normal">
                          <thead>
                            <tr className="bg-slate-50 border-b text-slate-600 font-bold">
                              <th className="px-4 py-3 text-right">رقم العقد ومرجعه</th>
                              <th className="px-4 py-3 text-right">اسم المتمهن</th>
                              <th className="px-4 py-3 text-right">التخصص والفرع</th>
                              <th className="px-4 py-3 text-right">الشركة الحاضنة</th>
                              <th className="px-4 py-3 text-center animate-pulse">تاريخ سريان العقد</th>
                              <th className="px-5 py-3 text-center">وضعية العقد</th>
                              <th className="px-4 py-3 text-center">الإجراء المتاح</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 font-sans">
                            {contractsList.map((con: any) => (
                              <tr key={con.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-mono font-black text-slate-500 text-right">{con.code}</td>
                                <td className="px-4 py-3 font-extrabold text-slate-800 text-right">{con.studentName}</td>
                                <td className="px-4 py-3 text-slate-600 font-bold text-right">{con.specialty}</td>
                                <td className="px-4 py-3 font-bold text-slate-800 text-right">{con.companyName}</td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-slate-450 text-[10px]">
                                  {con.startDate || 'غير محدد'} • {con.endDate || 'غير محدد'}
                                </td>
                                <td className="px-5 py-3 text-center">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[9px] font-black",
                                    con.status === 'نشط' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                    con.status === 'منتهي' ? "bg-slate-150 text-slate-500" :
                                    "bg-amber-50 text-amber-700 border border-amber-100"
                                  )}>
                                    {con.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex gap-2 justify-center">
                                    <select
                                      value={con.status}
                                      onChange={(e) => {
                                        const updated = contractsList.map((c: any) => 
                                          c.id === con.id ? { ...c, status: e.target.value } : c
                                        );
                                        saveContractsList(updated);
                                        setSuccessMessage(`✓ تم تحديث حالة عقد التمهين الخاص بـ [${con.studentName}] إلى [${e.target.value}] بنجاح.`);
                                      }}
                                      className="bg-slate-50 border border-slate-200 text-[10px] font-black py-0.5 px-2 rounded-md focus:border-amber-400 outline-none"
                                    >
                                      <option value="نشط">نشط</option>
                                      <option value="معلق">معلق</option>
                                      <option value="منتهي">منتهي</option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`هل تريد بالتأكيد شطب هذا العقد [${con.code}] من قائمة الرقابة؟`)) {
                                          const updated = contractsList.filter((c: any) => c.id !== con.id);
                                          saveContractsList(updated);
                                          setSuccessMessage('✓ تم شطب وإلغاء بيانات عقد التمهين.');
                                        }
                                      }}
                                      className="text-rose-600 hover:text-rose-800 text-[10px] font-bold p-1 hover:bg-rose-50 rounded"
                                    >
                                      حذف
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: SCHEDULED VISITS (تواريخ الزيارات الميدانية المجدولة) */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-row-reverse flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <h3 className="font-extrabold text-[#0D0E12] text-sm">تواريخ وجدول الزيارات الميدانية البيداغوجية لمقر العمل</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddVisitForm(!showAddVisitForm)}
                        className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{showAddVisitForm ? 'إغلاق الاستمارة ✕' : 'جدولة زيارة تفتيشية جديدة +'}</span>
                      </button>
                    </div>

                    {showAddVisitForm && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newVisit.studentName || !newVisit.companyName || !newVisit.visitorName || !newVisit.visitDate) {
                            alert('يرجى تعبئة الحقول الأساسية لجدولة الزيارة التفتيشية.');
                            return;
                          }
                          const updated = [
                            {
                              id: `VIS-${Date.now().toString().slice(-3)}`,
                              ...newVisit
                            },
                            ...visitsList
                          ];
                          saveVisitsList(updated);
                          setSuccessMessage('✓ تم إدراج وجدولة الزيارة البيداغوجية الميدانية في أجندة مستشاري التوجيه والمتمهنين.');
                          setNewVisit({ studentName: '', companyName: '', visitorName: '', visitDate: '', visitTime: '', status: 'مجدولة', notes: '' });
                          setShowAddVisitForm(false);
                        }}
                        className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 text-right"
                      >
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">اسم المتمهن المستهدف *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="مثال: لؤي موايعية"
                            value={newVisit.studentName} 
                            onChange={(e) => setNewVisit({...newVisit, studentName: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">الشركة المستهدفة بالزيارة *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="مثال: اتصالات الجزائر"
                            value={newVisit.companyName} 
                            onChange={(e) => setNewVisit({...newVisit, companyName: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">اسم الأستاذ الزائر / المستشار *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="أ. أمين بوجمعة"
                            value={newVisit.visitorName} 
                            onChange={(e) => setNewVisit({...newVisit, visitorName: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">تاريخ الزيارة *</label>
                          <input 
                            type="date" 
                            required
                            value={newVisit.visitDate} 
                            onChange={(e) => setNewVisit({...newVisit, visitDate: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-700 outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">التوقيت</label>
                          <input 
                            type="text" 
                            placeholder="مثال: 09:30 صباحاً"
                            value={newVisit.visitTime} 
                            onChange={(e) => setNewVisit({...newVisit, visitTime: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">الهدف والملاحظات التوجيهية للزيارة</label>
                          <input 
                            type="text" 
                            placeholder="مثال: التأكد من دفتر الحضور والمشاركة الميدانية بالتمهين..."
                            value={newVisit.notes} 
                            onChange={(e) => setNewVisit({...newVisit, notes: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-4 flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10.5px] rounded-lg cursor-pointer"
                          >
                            تثبيت وجدولة الزيارة
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visitsList.map((vis: any) => (
                        <div key={vis.id} className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-150 transition-all flex flex-col justify-between gap-3 text-right">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center flex-row-reverse border-b border-slate-200/60 pb-2">
                              <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded-full",
                                vis.status === 'مجدولة' ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              )}>
                                {vis.status}
                              </span>
                              <span className="font-mono text-[9px] text-slate-400">معرّف الرصد: {vis.id}</span>
                            </div>

                            <p className="text-xs font-black text-slate-900 text-right">
                              اسم المتمهن: <strong className="text-amber-700 font-extrabold">{vis.studentName}</strong>
                            </p>
                            <p className="text-[10.5px] font-bold text-slate-600 text-right">
                              🏢 مقر الشركة: {vis.companyName}
                            </p>
                            <p className="text-[10.5px] font-bold text-slate-600 text-right">
                              👤 الأستاذ الزائر: {vis.visitorName}
                            </p>
                            <p className="text-[10px] italic text-slate-450 leading-relaxed font-semibold text-right">
                              📝 الملاحظة: {vis.notes}
                            </p>
                          </div>

                          <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center flex-row-reverse flex-wrap gap-2 text-[10px]">
                            <span className="font-mono font-black text-slate-700 flex items-center gap-1 flex-row-reverse">
                              <Clock className="w-3.5 h-3.5 text-slate-450" />
                              <span>{vis.visitDate} - {vis.visitTime}</span>
                            </span>
                            
                            <div className="flex gap-2">
                              {vis.status === 'مجدولة' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = visitsList.map((v: any) => 
                                      v.id === vis.id ? { ...v, status: 'مكتملة', notes: v.notes + ' (تم تأشير الحضور الفعلي بنجاح ميدانياً)' } : v
                                    );
                                    saveVisitsList(updated);
                                    setSuccessMessage(`✓ تم تأشير واكمال زيارة [${vis.studentName}] بنجاح.`);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded font-black text-[9px] cursor-pointer"
                                >
                                  تحديد كمكتملة ✓
                                </button>
                              )}
                              <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('هل تريد إلغاء وشطب موعد هذه الزيارة؟')) {
                                      const updated = visitsList.filter((v: any) => v.id !== vis.id);
                                      saveVisitsList(updated);
                                      setSuccessMessage('✓ تم إلغاء الزيارة بنجاح.');
                                    }
                                  }}
                                  className="px-2 py-1 bg-rose-50 text-rose-700 rounded font-bold text-[9px] cursor-pointer"
                                >
                                  إزالة
                                </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 3: COMPLIANCE & PERFORMANCE REPORTS (تقارير أداء الشركات المضيفة) */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-row-reverse flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <Award className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-extrabold text-[#0D0E12] text-sm">مستويات الأداء وامتثال الشركات المضيفة للتمهين</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddCompanyForm(!showAddCompanyForm)}
                        className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{showAddCompanyForm ? 'إغلاق التقييم ✕' : 'إضافة تقرير تقييم لشركة شريكة +'}</span>
                      </button>
                    </div>

                    {showAddCompanyForm && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newCompany.name || !newCompany.feedback) {
                            alert('يرجى كتابة اسم المؤسسة التقييمية وملاحظات الأداء.');
                            return;
                          }
                          const updated = [
                            {
                              id: `COM-${Date.now().toString().slice(-3)}`,
                              ...newCompany
                            },
                            ...companiesList
                          ];
                          saveCompaniesList(updated);
                          setSuccessMessage('✓ تم تدوين وحفظ تقرير تقييم الشركات الشريكة بنجاح بالمنظومة العامة.');
                          setNewCompany({ name: '', apprenticesCount: 1, rating: 4, compliance: 'ممتاز', feedback: '' });
                          setShowAddCompanyForm(false);
                        }}
                        className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 text-right animate-in fade-in"
                      >
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">اسم الشركة الشريكة *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="سونلغاز / بريد الجزائر..."
                            value={newCompany.name} 
                            onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">عدد المتمهنين النشطين بالمنشأة</label>
                          <input 
                            type="number" 
                            value={newCompany.apprenticesCount} 
                            onChange={(e) => setNewCompany({...newCompany, apprenticesCount: parseInt(e.target.value) || 1})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">تقييم النجوم (1 - 5) *</label>
                          <select 
                            value={newCompany.rating} 
                            onChange={(e) => setNewCompany({...newCompany, rating: parseInt(e.target.value) || 5})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-black text-slate-700 outline-none focus:border-amber-400 text-right"
                          >
                            <option value="5">⭐⭐⭐⭐⭐ ممتاز (5 نجوم)</option>
                            <option value="4">⭐⭐⭐⭐ جيد جداً (4 نجوم)</option>
                            <option value="3">⭐⭐⭐ مقبول (3 نجوم)</option>
                            <option value="2">⭐⭐ ضعيف (2 نجوم)</option>
                            <option value="1">⭐ منخفض الالتزام (نجمة)</option>
                          </select>
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">مستوى الامتثال للقوانين البيداغوجية</label>
                          <select 
                            value={newCompany.compliance} 
                            onChange={(e) => setNewCompany({...newCompany, compliance: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-black text-slate-700 outline-none focus:border-amber-400 text-right"
                          >
                            <option value="ممتاز">ممتاز (امتثال كامل)</option>
                            <option value="مقبول">مقبول (ملاحظات ثانوية)</option>
                            <option value="قيد المراجعة">قيد المراجعة (يحتاج تفتيش)</option>
                          </select>
                        </div>

                        <div className="col-span-4">
                          <label className="block text-[10px] font-black text-slate-500 mb-1">التقرير التحليلي وتقييم الأداء الميداني للمؤسسة *</label>
                          <textarea 
                            required
                            rows={2}
                            placeholder="اكتب خلاصة تقرير أداء الورش والتأطير والتزامهم مع الطلاب..."
                            value={newCompany.feedback} 
                            onChange={(e) => setNewCompany({...newCompany, feedback: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-amber-450 text-right"
                          />
                        </div>

                        <div className="col-span-4 flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10.5px] rounded-lg cursor-pointer"
                          >
                            حفظ وحساب النتيجة
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {companiesList.map((comp: any) => (
                        <div key={comp.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs text-right space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center flex-row-reverse border-b border-slate-100 pb-3">
                              <h4 className="font-extrabold text-slate-900 text-xs">
                                🏢 {comp.name}
                              </h4>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                                comp.compliance === 'ممتاز' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                comp.compliance === 'مقبول' ? "bg-yellow-50 text-yellow-750 border border-yellow-100" :
                                "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse"
                              )}>
                                {comp.compliance}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-450 leading-relaxed font-bold">
                              {comp.feedback}
                            </p>
                          </div>

                          <div className="border-t border-slate-150 pt-3 flex items-center justify-between flex-row-reverse text-[10px]">
                            {/* Star rating display system */}
                            <div className="flex text-amber-500 font-bold gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < comp.rating ? 'text-amber-500' : 'text-slate-200'}>
                                  ★
                                </span>
                              ))}
                            </div>

                            <span className="text-slate-450 font-bold">
                              عدد الطلاب الملحقين: <strong className="text-[#0F172A] font-black">{comp.apprenticesCount} متمهنين</strong>
                            </span>

                            <div className="flex gap-2">
                              <select 
                                value={comp.rating}
                                onChange={(e) => {
                                  const updated = companiesList.map((c: any) => 
                                    c.id === comp.id ? { ...c, rating: parseInt(e.target.value) || 5 } : c
                                  );
                                  saveCompaniesList(updated);
                                }}
                                className="bg-slate-50 border border-slate-200/50 text-[9px] font-bold p-1 rounded"
                              >
                                <option value="5">5/5</option>
                                <option value="4">4/5</option>
                                <option value="3">3/5</option>
                                <option value="2">2/5</option>
                                <option value="1">1/5</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`هل توافق بالتأكيد على شطب تقرير وبطاقة تقييم [${comp.name}]؟`)) {
                                    const updated = companiesList.filter((c: any) => c.id !== comp.id);
                                    saveCompaniesList(updated);
                                    setSuccessMessage('✓ تم إزالة تقارير الأداء للشركة شريكة التمهين.');
                                  }
                                }}
                                className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Geofencing system visual disclaimer for Supervisors */}
                    <div className="p-4 bg-emerald-950 rounded-2xl border border-emerald-900 text-white flex flex-col md:flex-row-reverse justify-between items-center gap-4">
                      <div className="text-right space-y-1">
                        <p className="text-emerald-400 text-[9px] font-black tracking-widest leading-none flex items-center gap-1 justify-end flex-row-reverse">
                          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                          <span>تكامل محرك الجغرفة بوزارة التكوين (GEOFENCE RADAR)</span>
                        </p>
                        <h4 className="text-xs font-black text-white mt-1">تتبع البث الآني للموقع ومطابقته بقواعد البيانات</h4>
                        <p className="text-[10px] text-emerald-250 leading-relaxed font-bold">يقوم النظام الرقمي بالتحقق الذاتي من بقاء الطلاب الموظفين بالـ Area المسموح بها في نطاق 200 متر من مكان التربص المعتزم، وإرسال التقارير اليومية إلى إدارة المعهد.</p>
                      </div>
                      <div className="bg-emerald-900 px-3 py-1.5 rounded-lg font-mono text-[9.5px] text-emerald-300 font-extrabold shrink-0 border border-emerald-800">
                        MONITORED CLIENTS: ACTIVE (OK)
                      </div>
                    </div>

                  </div>

                  {/* ======================================================== */}
                  {/* SECTION 4: PROFESSIONAL INSPECTION REPORTS (تقارير تفتيش الوسط المهني) */}
                  {/* ======================================================== */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-row-reverse flex-wrap gap-2">
                       <div className="flex items-center gap-2 flex-row-reverse">
                         <ClipboardList className="w-5 h-5 text-amber-655 text-amber-600" />
                         <h3 className="font-extrabold text-[#0D0E12] text-sm">تقارير تفتيش الوسط المهني والزيارات الميدانية للمستشارين</h3>
                       </div>
                       
                       <button
                         type="button"
                         onClick={() => setShowAddReportForm(!showAddReportForm)}
                         className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                       >
                         <span>{showAddReportForm ? 'إغلاق الاستمارة ✕' : 'إنشاء تقرير تفتيش دوري +'}</span>
                       </button>
                    </div>

                    {showAddReportForm && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newReport.companyName || !newReport.visitorName || !newReport.studentName || !newReport.reportDetails) {
                            alert('يرجى تعبئة الحقول الأساسية لإنشاء تقرير التفتيش الميداني.');
                            return;
                          }
                          const updated = [
                            {
                              id: `REP-${Date.now().toString().slice(-3)}`,
                              ...newReport
                            },
                            ...inspectionReports
                          ];
                          saveInspectionReports(updated);
                          setSuccessMessage('✓ تم إدراج وحفظ تقرير تفتيش الوسط المهني الموثق بالصور بنجاح.');
                          setNewReport({
                            companyName: '',
                            visitorName: '',
                            studentName: '',
                            visitDate: new Date().toISOString().split('T')[0],
                            complianceScore: 'مستقر',
                            reportDetails: '',
                            attachedPhotos: []
                          });
                          setShowAddReportForm(false);
                        }}
                        className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-4 text-right animate-in fade-in duration-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1">المؤسسة / الشركة المستهدفة بالتفتيش *</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: اتصالات الجزائر تبسة"
                              list="companies-list"
                              value={newReport.companyName}
                              onChange={(e) => setNewReport({ ...newReport, companyName: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                            />
                            <datalist id="companies-list">
                              {companiesList.map((c: any) => (
                                <option key={c.id} value={c.name} />
                              ))}
                              <option value="بريد الجزائر" />
                              <option value="سونلغاز" />
                              <option value="المديرية العملية للشبكات والاتصالات" />
                            </datalist>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1">اسم المستشار المفتش / الأستاذ الزائر *</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: أ. بوطبجي رياض"
                              value={newReport.visitorName}
                              onChange={(e) => setNewReport({ ...newReport, visitorName: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1">اسم المتمهن المعني بالرقابة الميدانية *</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: أمين بلعيدي"
                              list="students-list"
                              value={newReport.studentName}
                              onChange={(e) => setNewReport({ ...newReport, studentName: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-amber-400 text-right"
                            />
                            <datalist id="students-list">
                              {contractsList.map((c: any) => (
                                <option key={c.id} value={c.studentName} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1">تاريخ زيارة التفتيش *</label>
                            <input
                              type="date"
                              required
                              value={newReport.visitDate}
                              onChange={(e) => setNewReport({ ...newReport, visitDate: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-700 outline-none focus:border-amber-400 text-center"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1">مستوى الالتزام والمطابقة البيداغوجية</label>
                            <select
                              value={newReport.complianceScore}
                              onChange={(e: any) => setNewReport({ ...newReport, complianceScore: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-black text-slate-700 outline-none focus:border-amber-400 text-right"
                            >
                              <option value="ممتاز">🟢 ممتاز (التزام تام بالمنهج وظروف العمل آمنة)</option>
                              <option value="مستقر">🟡 مستقر (التزام مقبول مع بعض التوصيات البسيطة)</option>
                              <option value="مخالفات بيداغوجية">🔴 مخالفات وتجاوزات بيداغوجية (تنبيه أو إشعار رسمي)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 mb-1">تفاصيل ومخرجات التقرير الميداني بالتفصيل *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="اكتب بالتفصيل مسار الزيارة، مدى توفر التأطير، التزام المتكون بالمهام، بيئة السلامة المهنية وملاحظات المؤطر الميداني..."
                            value={newReport.reportDetails}
                            onChange={(e) => setNewReport({ ...newReport, reportDetails: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-amber-450 text-right !leading-relaxed"
                          />
                        </div>

                        {/* Drag and Drop and Attachments Area */}
                        <div className="border border-dashed border-slate-200 bg-white p-4 rounded-xl text-center space-y-3">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Camera className="w-8 h-8 text-amber-500" />
                            <p className="text-xs font-extrabold text-slate-700 mt-1">معاينة وتوثيق الزيارة بالكاميرا والملفات</p>
                            <p className="text-[10px] text-slate-450 font-bold">يمكنك سحب وإرفاق صور المعاينة الميدانية بدقة عالية</p>
                          </div>
                          <div className="flex justify-center flex-wrap gap-2">
                            <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] font-black rounded-lg cursor-pointer transition">
                              <span>اختر ملفات من جهازك الكاميرا / الاستوديو 📷</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleInspectionPhotoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Quick selection templates */}
                          <div className="space-y-1 pt-2">
                            <p className="text-[9.5px] font-black text-slate-500">أو حدد سريعاً صورة توثيقية نموذجية لتجربة التقرير الفورية:</p>
                            <div className="flex justify-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80';
                                  if (!newReport.attachedPhotos.includes(url)) {
                                    setNewReport(prev => ({ ...prev, attachedPhotos: [...prev.attachedPhotos, url] }));
                                  }
                                }}
                                className="flex items-center gap-1.5 p-1 px-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-[9.5px] font-black text-slate-700 cursor-pointer"
                              >
                                <span className="w-4 h-4 rounded bg-slate-100 text-center">💻</span> مكتب تقني/أنظمة
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const url = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80';
                                  if (!newReport.attachedPhotos.includes(url)) {
                                    setNewReport(prev => ({ ...prev, attachedPhotos: [...prev.attachedPhotos, url] }));
                                  }
                                }}
                                className="flex items-center gap-1.5 p-1 px-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-[9.5px] font-black text-slate-700 cursor-pointer"
                              >
                                <span className="w-4 h-4 rounded bg-slate-100 text-center">🔧</span> ورشة صناعية وكهرباء
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const url = 'https://images.unsplash.com/photo-1581091226183-c156245cd986?auto=format&fit=crop&w=600&q=80';
                                  if (!newReport.attachedPhotos.includes(url)) {
                                    setNewReport(prev => ({ ...prev, attachedPhotos: [...prev.attachedPhotos, url] }));
                                  }
                                }}
                                className="flex items-center gap-1.5 p-1 px-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-[9.5px] font-black text-slate-700 cursor-pointer"
                              >
                                <span className="w-4 h-4 rounded bg-slate-100 text-center">👷‍♂️</span> جلسة توجيه وأمن بيداغوجي
                              </button>
                            </div>
                          </div>

                          {/* Preview attached thumbnails */}
                          {newReport.attachedPhotos.length > 0 && (
                            <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-2 justify-center">
                              {newReport.attachedPhotos.map((photo, index) => (
                                <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                                  <img
                                    src={photo}
                                    alt="معاينة التوثيق"
                                    className="object-cover w-full h-full"
                                    referrerPolicy="no-referrer"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewReport(prev => ({
                                        ...prev,
                                        attachedPhotos: prev.attachedPhotos.filter((_, idx) => idx !== index)
                                      }));
                                    }}
                                    className="absolute inset-0 bg-red-600/85 text-white flex items-center justify-center font-bold text-[9px] opacity-0 group-hover:opacity-100 transition duration-150"
                                  >
                                    إزالة
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] rounded-xl cursor-pointer shadow-sm transition-all"
                          >
                            حفظ وتوثيق التقرير الميداني 🛡️
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Displays elements grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                      {inspectionReports.length === 0 ? (
                        <div className="col-span-2 p-8 text-center text-slate-450 font-bold text-xs bg-slate-50 rounded-2xl border border-dashed">
                          لا توجد تقارير تفتيش مسجلة حالياً بالوسط المهني. استخدم الزر لإنشاء أول تقرير.
                        </div>
                      ) : (
                        inspectionReports.map((report: any) => (
                          <div key={report.id} className="bg-slate-50/50 hover:bg-slate-50 rounded-3xl border border-slate-200 p-5 space-y-4 text-right flex flex-col justify-between transition-all duration-150 hover:shadow-xs">
                            <div className="space-y-3">
                              {/* Header elements */}
                              <div className="flex justify-between items-center flex-row-reverse border-b border-slate-200/70 pb-2.5">
                                <div className="space-y-1">
                                  <span className="text-[9.5px] font-black text-slate-450 font-mono inline-block">معرّف التقرير: {report.id}</span>
                                  <h4 className="font-black text-slate-800 text-xs">🏢 {report.companyName}</h4>
                                </div>
                                <span className={cn(
                                  "px-2.5 py-1 text-[9px] font-black rounded-full border",
                                  report.complianceScore === 'ممتاز' ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                                  report.complianceScore === 'مستقر' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                  "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                                )}>
                                  {report.complianceScore}
                                </span>
                              </div>

                              {/* Details */}
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between flex-row-reverse text-[10px] font-black text-slate-500">
                                  <span>👤 المتمهّن: <strong className="text-amber-700 font-extrabold">{report.studentName}</strong></span>
                                  <span>👨‍🏫 المفتش الزائر: <span className="text-slate-700 font-extrabold">{report.visitorName}</span></span>
                                </div>
                                <p className="text-slate-600 leading-relaxed font-semibold bg-white p-3 rounded-2xl border border-slate-150 text-[11px]">
                                  {report.reportDetails}
                                </p>
                              </div>

                              {/* Attached Photos */}
                              {report.attachedPhotos && report.attachedPhotos.length > 0 && (
                                <div className="space-y-1.5 pt-1.5">
                                  <span className="text-[10px] text-slate-450 font-black flex items-center justify-end gap-1 flex-row-reverse">
                                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                                    <span>مرفقات التوثيق الميداني المعتمدة:</span>
                                  </span>
                                  <div className="flex gap-2.5 flex-wrap justify-end">
                                    {report.attachedPhotos.map((photo: string, index: number) => (
                                      <a
                                        key={index}
                                        href={photo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group hover:ring-2 hover:ring-amber-400 transition"
                                        title="انقر لفتح الصورة في نافذة جديدة"
                                      >
                                        <img
                                          src={photo}
                                          alt={`التوثيق الميداني ${index + 1}`}
                                          className="object-cover w-full h-full transform group-hover:scale-105 transition duration-150"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8.5px] text-white font-bold transition">
                                          تكبير 🔍
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Footer parameters to print / delete */}
                            <div className="border-t border-slate-200/70 pt-3 flex justify-between items-center flex-row-reverse text-[9.5px]">
                              <span className="font-mono text-slate-500 font-bold">📅 تاريخ الإجراء: {report.visitDate}</span>
                              <div className="flex gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const printContent = `
                                      <html>
                                        <head>
                                          <title>تقرير تفتيش الوسط المهني - المعهد الوطني المتخصص في التكوين المهني</title>
                                          <style>
                                            body { font-family: 'Inter', sans-serif; direction: rtl; text-align: right; padding: 30px; }
                                            .header { border-bottom: 2px solid #334155; padding-bottom: 10px; margin-bottom: 25px; }
                                            .title { font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 5px; }
                                            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 13px; background: #f8fafc; padding: 15px; border-radius: 10px; }
                                            .label { font-weight: bold; color: #475569; }
                                            .content { font-size: 14px; line-height: 1.8; color: #334155; margin-bottom: 30px; background: #fafafa; padding: 15px; border-right: 4px solid #f59e0b; }
                                            .photos { display: flex; gap: 15px; flex-wrap: wrap; margin-top: 20px; }
                                            .photo-item { width: 180px; height: 130px; border-radius: 8px; border: 1px solid #e2e8f0; object-fit: cover; }
                                            .footer { margin-top: 50px; font-size: 11px; text-align: center; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 10px; }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="header">
                                            <div class="title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                                            <div>وزارة التكوين والتعليم المهنيين - مديرية التكوين لولاية تبسة</div>
                                            <div style="font-size: 12px; color: #64748b; margin-top: 10px;">وثيقة معاينة رسمية بيداغوجية موثقة</div>
                                          </div>
                                          <h2 style="color: #0f172a; margin-bottom: 15px;">تقرير تفتيش الوسط المهني ودورة التتبع الميدانية [${report.id}]</h2>
                                          
                                          <div class="meta">
                                            <div><span class="label">اسم المؤسسة الشريكة:</span> ${report.companyName}</div>
                                            <div><span class="label">تاريخ الزيارة والتدقيق:</span> ${report.visitDate}</div>
                                            <div><span class="label">المستشار المفتش:</span> ${report.visitorName}</div>
                                            <div><span class="label">المتمهن المستهدف:</span> ${report.studentName}</div>
                                            <div><span class="label">تقييم الالتزام والمطابقة:</span> <strong>${report.complianceScore}</strong></div>
                                          </div>

                                          <div class="label" style="font-size:13px; margin-bottom:8px;">تفاوض المخرجات والتقرير التحليلي الفعلي:</div>
                                          <div class="content">${report.reportDetails}</div>

                                          ${report.attachedPhotos && report.attachedPhotos.length > 0 ? `
                                            <div class="label">التوثيقات والصور الملتقطة ميدانياً:</div>
                                            <div class="photos">
                                              ${report.attachedPhotos.map((p: string) => `
                                                <img class="photo-item" src="${p}" />
                                              `).join('')}
                                            </div>
                                          ` : ''}

                                          <div class="footer">
                                            صادر آلياً عبر لوحة الرقابة العامة والتمهين - معهد تبسة بلقصيري أيوب. معتمد وموزع إلكترونياً لجميع الشركاء المعنيين.
                                          </div>
                                          <script>window.print();</script>
                                        </body>
                                      </html>
                                    `;
                                    const printWindow = window.open('', '_blank');
                                    if (printWindow) {
                                      printWindow.document.write(printContent);
                                      printWindow.document.close();
                                    } else {
                                      alert("الرجاء تمكين النوافذ المنبثقة لطباعة التقرير.");
                                    }
                                  }}
                                  className="text-amber-600 hover:text-amber-800 font-extrabold flex items-center gap-1 cursor-pointer"
                                >
                                  طباعة التقرير 🖨️
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`هل توافق على إزالة تقرير التفتيش الميداني مالي رقمه [${report.id}] نهائياً؟`)) {
                                      const updated = inspectionReports.filter((r: any) => r.id !== report.id);
                                      saveInspectionReports(updated);
                                      setSuccessMessage('✓ تم شطب وإزالة تقرير تفتيش الوسط المهني بنجاح.');
                                    }
                                  }}
                                  className="text-rose-600 hover:text-rose-800 font-extrabold cursor-pointer"
                                >
                                  حذف
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* SmartStage DZ: GEOLOCATIONAL AUDIT PANEL (Muttaba'at al-hudur) */}
                  {/* ======================================================== */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-row-reverse flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <MapPin className="w-5 h-5 text-sky-600" />
                        <h3 className="font-extrabold text-[#0D0E12] text-sm">لوحة التدقيق الجغرافي والتحقق البيومتري المباشر (GPS & Face Verification)</h3>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (remoteLogs.length === 0) {
                            alert("لا توجد سجلات حضور نشطة للتصدير.");
                            return;
                          }
                          let csvContent = "\uFEFF";
                          csvContent += "المعرف,المتمهن,المؤسسة المضيفة,التوقيت,المسافة من المركز (متر),المطابقة البيومترية للوجه,الحالة,الترخيص الجغرافي\n";
                          remoteLogs.forEach((l) => {
                            csvContent += `"${l.id}","${l.learnerName}","${l.companyName}","${l.timestamp}","${l.distanceFromPivot}m","${l.faceMatchScore}%","${l.status === 'present' ? 'حاضر' : 'متأخر'}","${l.authorized ? 'مرخص مقبول' : 'خارج النطاق'}"\n`;
                          });
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.setAttribute("href", url);
                          link.setAttribute("download", `تقرير_الحضور_الرقمي_المتكامل_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        📥 تصدير كشوفات الحضور الرقمي (CSV)
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right bg-white text-xs whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 border-b text-slate-600 font-bold">
                              <th className="px-4 py-3 text-right">رقم البث</th>
                              <th className="px-4 py-3 text-right">المتمهن المتكامل</th>
                              <th className="px-4 py-3 text-right">شركة التدريب الميداني</th>
                              <th className="px-4 py-3 text-center">التوقيت والتاريخ</th>
                              <th className="px-4 py-3 text-center">المسافة والجيوفنسينغ</th>
                              <th className="px-4 py-3 text-center">صورة الوجة البيومتري</th>
                              <th className="px-4 py-3 text-center">الحالة الإدارية</th>
                              <th className="px-4 py-3 text-center">الإجراء المتاح</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 font-sans">
                            {remoteLogs.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                                  لا توجد أي تسجيلات حضور رقمية واردة من بوابات المتربصين اليوم حتى الآن.
                                </td>
                              </tr>
                            ) : (
                              remoteLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 font-mono font-black text-slate-500 text-right">{log.id}</td>
                                  <td className="px-4 py-3 font-extrabold text-slate-800 text-right">{log.learnerName}</td>
                                  <td className="px-4 py-3 font-bold text-slate-700 text-right">{log.companyName}</td>
                                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">{log.timestamp}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded text-[10px] font-bold",
                                      log.distanceFromPivot <= 250 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                    )}>
                                      {log.distanceFromPivot} م ({log.distanceFromPivot <= 250 ? "داخل النطاق" : "خارج النطاق"})
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center font-bold text-sky-600">
                                    👤 {log.faceMatchScore}% مطابقة معتمدة
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full text-[9.5px] font-black",
                                      log.status === 'present' ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"
                                    )}>
                                      {log.status === 'present' ? 'حاضر بالموقع' : 'متأخر ومثبت'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        alert(`✓ تم توقيع التفتيش البيداغوجي الرقمي لـ [${log.learnerName}] واعتماده رسمياً في سجلات السداسي الجاري.`);
                                      }}
                                      className="px-2 py-1 bg-[#0F172A] hover:bg-sky-600 text-white text-[9px] font-black rounded transition cursor-pointer"
                                    >
                                      تأشيرة المشرف 🖋️
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* SmartStage DZ: SMART SMS ALERT AND LIVE DISPATCH SIMULATOR */}
                  {/* ======================================================== */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-4 flex-row-reverse">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <Phone className="w-5 h-5 text-indigo-600 animate-pulse" />
                        <h3 className="font-extrabold text-[#0D0E12] text-sm">نظام تنبيهات SMS الذكي لغيابات المتمهنين والربط الوالدي</h3>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg">
                        رابط شبكة متعامل الهاتف الوطني (SIM GSM)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Right Column: Live SMS Dispatch Trigger Panel */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!smsContractId) {
                            alert("الرجاء تحديد المتمهن المستهدف أولاً.");
                            return;
                          }
                          const contract = contractsList.find((c: any) => c.id === smsContractId);
                          if (!contract) {
                            alert("لم يتم العثور على العقد المعني.");
                            return;
                          }

                          let targetPhone = smsPhone || (smsRecipientType === 'parent' ? contract.guardianPhone : contract.studentPhone) || '0555301822';
                          const learnerName = contract.studentName;
                          const guardianName = contract.guardianName;
                          const company = contract.companyName;

                          let customMsg = smsMessage;
                          if (!customMsg) {
                            if (smsRecipientType === 'parent') {
                              customMsg = `تنبيه رسمي من معهد التمهين: نعلم الولي ${guardianName} بأن المتكون ${learnerName} غائب اليوم عن حصة الوسط المهني في مؤسسة [${company}] دون عذر مقبول. يرجى المتابعة والاتصال العاجل.`;
                            } else {
                              customMsg = `تنبيه عاجل من إدارة معهد التمهين للمتكون المتمهن ${learnerName}: يسجل نظام الحضور غيابك اليوم عن فترة تدريبك الميداني لدى مؤسسة [${company}]. يرجى الالتحاق الفوري لتجنب العقوبة الإدارية وتبرير الغياب.`;
                            }
                          }
                          // Remove potential html tags manually
                          customMsg = customMsg.replace(/<[^>]*>/g, '');

                          AppStateStore.sendSimulatedSmsAlert({
                            studentName: learnerName,
                            guardianPhone: targetPhone,
                            text: customMsg,
                            reason: 'غياب غير مبرر بوسط العمل',
                            channel: smsChannel,
                            recipientType: smsRecipientType,
                            recipientName: smsRecipientType === 'parent' ? guardianName : learnerName
                          });

                          // Direct CC integration with our managed authorized WhatsApp partners
                          if (sendCopyToPartnerId) {
                            const partner = authorizedPartners.find(p => p.id === sendCopyToPartnerId);
                            if (partner) {
                              const ccMsg = `[نسخة إحاطة رسمية - إلى ${partner.name} (${partner.role})]: تم إرسال تنبيه غياب للمتكون ${learnerName} بوسط العمل لدى [${company}]، النص المُرسَل: "${customMsg}"`;
                              AppStateStore.sendSimulatedSmsAlert({
                                studentName: learnerName,
                                guardianPhone: partner.phone,
                                text: ccMsg,
                                reason: `إحاطة بالواتساب: ${partner.role}`,
                                channel: 'whatsapp',
                                recipientType: 'parent',
                                recipientName: partner.name
                              });
                            }
                          }

                          setSmsLogs(AppStateStore.getSmsLogs());
                          setSuccessMessage(`✓ تم بنجاح بث وتأكيد إشعار الـ ${smsRecipientType === 'parent' ? 'الولي' : 'المتكون'} فوراً عبر قناة [${smsChannel.toUpperCase()}] ${sendCopyToPartnerId ? 'وإرسال نسخة بصفة إحاطة للجهة المعتمدة 📡' : ''}`);

                          if (smsChannel === 'whatsapp') {
                            const formattedPhone = targetPhone.trim().replace(/^0/, '+213');
                            const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(formattedPhone)}&text=${encodeURIComponent(customMsg)}`;
                            window.open(whatsappUrl, '_blank');
                          }

                          setSmsMessage('');
                          setSendCopyToPartnerId('');
                        }}
                        className="lg:col-span-6 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-right space-y-4"
                      >
                        <h4 className="font-extrabold text-xs text-indigo-850">🔋 وحدة إشعار الوسط المهني الذكي - تفعيل وتثبيت الواتساب الفوري</h4>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1">المتربص المستهدف بالتمهين الميداني</label>
                          <select 
                            value={smsContractId}
                            onChange={(e) => setSmsContractId(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-400"
                            required
                          >
                            <option value="">-- حدد عقد تمهين غائب اليوم لتنبيهه --</option>
                            {contractsList.map(c => (
                              <option key={c.id} value={c.id}>
                                المتكون: {c.studentName} ({c.companyName})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Recipient Selector Tabs */}
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1">جهة استلام التنبيه والربط الرقمي</label>
                          <div className="grid grid-cols-2 gap-2 bg-slate-200/50 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setSmsRecipientType('parent')}
                              className={`py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer ${smsRecipientType === 'parent' ? 'bg-indigo-650 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800 bg-transparent'}`}
                            >
                              👨‍👦 الولي الشرعي ({smsContractId ? (contractsList.find(c => c.id === smsContractId)?.guardianName || 'أب المتكون') : 'أب المتكون'})
                            </button>
                            <button
                              type="button"
                              onClick={() => setSmsRecipientType('trainee')}
                              className={`py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer ${smsRecipientType === 'trainee' ? 'bg-indigo-650 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800 bg-transparent'}`}
                            >
                              👨‍🎓 المتكون المتمهن نفسه
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-1">قناة البث والتواصل مع العائلة ⚡</label>
                            <select
                              value={smsChannel}
                              onChange={(e) => setSmsChannel(e.target.value as any)}
                              className="w-full bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 text-xs font-bold text-indigo-800 outline-none focus:border-indigo-400"
                            >
                              <option value="whatsapp">💬 WhatsApp (مجاني 0.00 DZD) ✓</option>
                              <option value="telegram">🤖 Telegram Bot (مجاني 0.00 DZD) ✓</option>
                              <option value="push">🔔 Push Notification (مجاني 0.00 DZD) ✓</option>
                              <option value="email">📧 البريد الإلكتروني (مجاني 0.00 DZD) ✓</option>
                              <option value="sms">📱 SMS الكلاسيكي (تكلفة 5.20 DZD) 💸</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-1">رقم هاتف المستلم (لإرسال وتوجيه الواتساب) *</label>
                            <input 
                              type="tel" 
                              value={smsPhone}
                              onChange={(e) => setSmsPhone(e.target.value)}
                              placeholder="مثال: 0771234567" 
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-left outline-none focus:border-indigo-400 font-sans" 
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1">نص التنبيه البديل أو اترك فارغاً للتعبئة التلقائية المعتمدة</label>
                          <textarea 
                            value={smsMessage}
                            onChange={(e) => setSmsMessage(e.target.value)}
                            placeholder="يكتب هنا لتجاوز التوليد التلقائي لرسائل معارضة الغيابات..." 
                            rows={3}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none text-slate-700 text-right focus:border-indigo-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1">مشاركة نسخة إحاطة فورية مع جهة معتمدة (WhatsApp CC) 📡</label>
                          <select
                            value={sendCopyToPartnerId}
                            onChange={(e) => setSendCopyToPartnerId(e.target.value)}
                            className="w-full bg-indigo-50/50 border border-indigo-150 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-300"
                          >
                            <option value="">-- اختياري: لا تلقم بإرسال نسخة إحاطة جهوية --</option>
                            {authorizedPartners.map(p => (
                              <option key={p.id} value={p.id}>
                                🔔 {p.role}: {p.name} ({p.phone}) {p.isActive ? "• نشط ومستقبل ✅" : "• متوقف ⚠️"}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          className={`w-full py-3 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-white ${smsChannel === 'whatsapp' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                          <Phone className="w-4 h-4" />
                          <span>
                            {smsChannel === 'whatsapp' 
                              ? "إرسال البث الرقمي وتوجيه للواتساب الفوري 💬⚡" 
                              : `بث تنبيه مباشر للمستلم عبر قناة [${smsChannel.toUpperCase()}] ⚡`
                            }
                          </span>
                        </button>
                      </form>

                      {/* Left Column: Outbound Dispatch History Logs */}
                      <div className="lg:col-span-6 space-y-4">
                        <span className="text-[10px] font-black text-slate-400 block uppercase">سجل الرسائل المتنقلة الصادرة بوزارة التمهين (الولي)</span>
                        
                        <div className="border border-slate-200 rounded-2xl p-4 space-y-3 max-h-72 overflow-y-auto bg-slate-950 text-slate-100 text-[10.5px]">
                          {smsLogs.length === 0 ? (
                            <div className="py-12 text-center text-slate-450 font-mono text-[9.5px]">
                              NO DISPATCHED SMS NOTIFICATIONS LOGGED TODAY
                            </div>
                          ) : (
                            smsLogs.map((log) => (
                              <div key={log.id} className="border-b border-slate-800 pb-3.5 text-right space-y-1.5 font-mono">
                                <div className="flex justify-between items-center text-[9px] text-indigo-400">
                                  <span>{log.timestamp}</span>
                                  <span className="font-bold">📱 {log.guardianPhone || log.phone} (مستلم)</span>
                                </div>
                                <p className="text-slate-350 leading-relaxed font-sans">{log.text}</p>
                                <div className="flex justify-between items-center text-[8.5px] border-t border-slate-900/50 pt-1 text-slate-400">
                                  <span>القناة: <b className="text-sky-400">{(log.channel || 'sms').toUpperCase()}</b></span>
                                  <span>الجهة المستلمة: <b className="text-slate-300">{log.recipientName || 'الولي'} ({log.recipientType === 'trainee' ? 'المتكون' : 'الولي'})</b></span>
                                </div>
                                <div className="flex justify-between items-center text-[8.5px] pt-1 text-slate-450">
                                  <span>التكلفة: <b className={log.channel === 'sms' ? "text-amber-500" : "text-emerald-400"}>{log.channel === 'sms' ? "5.20 DZD 💸" : "0.00 DZD (مجاني ⚡)"}</b></span>
                                  <span>الوضعية: <b className="text-emerald-500">تم البث فورا ⚡</b></span>
                                  {log.channel === 'whatsapp' && (
                                    <a 
                                      href={`https://api.whatsapp.com/send?phone=${encodeURIComponent((log.guardianPhone || log.phone || '').trim().replace(/^0/, '+213'))}&text=${encodeURIComponent(log.text)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded text-[8px] transition active:scale-95"
                                    >
                                      إرسال عبر WhatsApp 💬
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* Section for Managing Authorized WhatsApp Partners */}
                  {/* ======================================================== */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-4 flex-row-reverse">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-extrabold text-[#0D0E12] text-sm">إدارة الأرقام المعتمدة والجهات الرسمية المستلمة لنسخ الواتساب (WhatsApp CC)</h3>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg">
                        بروتوكول البث الرقمي المشترك 📡
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed text-right font-medium">
                      بموجب تنظيمات الرقابة العامة البيداغوجية لمعهد تبسة 2، يمكن للمسؤولين ضبط أرقام هواتف الأطراف المعنية (كالمدير، مستشار الرقابة، ومفتشي التوجيه) لتصلهم نسخ فورية ومجانية بنظام <strong className="text-emerald-600 font-extrabold">إحاطة WhatsApp CC</strong> بمجرد إصدار المنسقين أو الأساتذة لأي إشعار غياب أو استدعاء للجنة الانضباط والمجلس التأديبي، وذلك لضمان الشفافية والمتابعة اللحظية لولاية تبسة.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* Form for adding a new authorized partner */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 text-right space-y-4">
                        <h4 className="font-extrabold text-xs text-emerald-850">➕ إضافة جهة رسمية معتمدة جديدة</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">الاسم الكامل للجهة / الفرع</label>
                            <input 
                              type="text" 
                              id="partner_name_field"
                              placeholder="مثال: أ. فاروق جبار (مفتش التوجيه)"
                              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-right outline-none focus:border-emerald-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">الصفة البيداغوجية / الدور</label>
                            <input 
                              type="text" 
                              id="partner_role_field"
                              placeholder="مثال: نائب المدير للدراسات"
                              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-right outline-none focus:border-emerald-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">رقم هاتف الواتساب المعتمد</label>
                            <input 
                              type="tel" 
                              id="partner_phone_field"
                              placeholder="مثال: 0661662233"
                              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-left outline-none focus:border-emerald-400 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-500 mb-1">ملاحظة التدخل أو الإشعار</label>
                            <input 
                              type="text" 
                              id="partner_note_field"
                              placeholder="مثال: يرسل له نسخ مذكرات الشطب والتأديب"
                              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-right outline-none focus:border-emerald-400"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const nameEl = document.getElementById('partner_name_field') as HTMLInputElement;
                            const roleEl = document.getElementById('partner_role_field') as HTMLInputElement;
                            const phoneEl = document.getElementById('partner_phone_field') as HTMLInputElement;
                            const noteEl = document.getElementById('partner_note_field') as HTMLInputElement;

                            if (!nameEl?.value || !roleEl?.value || !phoneEl?.value) {
                              alert("يرجى ملء جميع الحقول الإلزامية (الاسم، الدور، ورقم الهاتف).");
                              return;
                            }

                            const newPartner = {
                              id: `PARTNER-${Date.now()}`,
                              name: nameEl.value.trim(),
                              role: roleEl.value.trim(),
                              phone: phoneEl.value.trim(),
                              note: noteEl?.value.trim() || '',
                              isActive: true
                            };

                            const updated = [...authorizedPartners, newPartner];
                            AppStateStore.saveAuthorizedPartners(updated);
                            setAuthorizedPartners(updated);

                            nameEl.value = '';
                            roleEl.value = '';
                            phoneEl.value = '';
                            if (noteEl) noteEl.value = '';
                            setSuccessMessage("✓ تم تسجيل وإدراج جهة معتمدة جديدة لإحاطة الـ WhatsApp بنجاح.");
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                        >
                          تأكيد وحفظ الشريك في النظام 💾
                        </button>
                      </div>

                      {/* Display existing partners table & list */}
                      <div className="lg:col-span-2 space-y-4">
                        <span className="text-[10px] font-black text-slate-400 block uppercase">الجهات الرسمية الشريكة المسجلة حالياً</span>
                        
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                          <table className="w-full text-right text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-[10px] text-slate-600 font-extrabold border-b border-slate-150">
                                <th className="p-3 text-right">الجهة والصفة الرسمي</th>
                                <th className="p-3 text-right">رقم هاتف الواتساب</th>
                                <th className="p-3 text-right">ملاحظة الترخيص</th>
                                <th className="p-3 text-center">الوضعية</th>
                                <th className="p-3 text-center">الإجراءات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {authorizedPartners.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">لا توجد أي جهة شريكة مسجلة بالإعدادات.</td>
                                </tr>
                              ) : (
                                authorizedPartners.map((p) => (
                                  <tr key={p.id} className="hover:bg-slate-50/50 transition duration-150">
                                    <td className="p-3">
                                      <div className="font-extrabold text-slate-800">{p.name}</div>
                                      <div className="text-[9.5px] text-slate-450 font-bold">{p.role}</div>
                                    </td>
                                    <td className="p-3 font-mono font-bold font-sans text-slate-700">{p.phone}</td>
                                    <td className="p-3 text-[10px] font-semibold text-slate-500 leading-normal">{p.note || 'نسخة إحاطة افتراضية لجميع الأحداث'}</td>
                                    <td className="p-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = authorizedPartners.map(orig => orig.id === p.id ? { ...orig, isActive: !orig.isActive } : orig);
                                          AppStateStore.saveAuthorizedPartners(updated);
                                          setAuthorizedPartners(updated);
                                          setSuccessMessage(`✓ تم تغيير وضعية ${p.name} بنجاح.`);
                                        }}
                                        className={`px-2.5 py-1 rounded-full text-[9px] font-black cursor-pointer transition ${p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-150 text-slate-500"}`}
                                      >
                                        {p.isActive ? "نشط ومستقبل ✓" : "موقوف مؤقتاً ✖"}
                                      </button>
                                    </td>
                                    <td className="p-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`هل أنت متأكد من رغبتك في حذف الجهة المعتمدة [${p.name}] نهائياً من قائمة البث والمشاركة؟`)) {
                                            const updated = authorizedPartners.filter(orig => orig.id !== p.id);
                                            AppStateStore.saveAuthorizedPartners(updated);
                                            setAuthorizedPartners(updated);
                                            setSuccessMessage("✓ تم شطب وحذف الشريك من إعدادات الربط بنجاح.");
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-750 font-black text-[10.5px] transition"
                                      >
                                        حذف
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            );

          default:
            return null;
        }
      })()}

      {/* --- ALL MODALS AREA (1. Print Preview Summon, 2. Purge Confirm, 3. Regulations Upload) --- */}
      {selectedReferralForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-row-reverse">
              <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                <span>🖨️</span>
                <span>المعاينة الرسمية للاستدعاء الفردي ومطابقة البنود التشريعية</span>
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById('summon-printable-certificate')?.innerHTML;
                    const originalContents = document.body.innerHTML;
                    if (printContents) {
                      const printWindow = window.open('', '', 'height=800,width=1000');
                      if (printWindow) {
                        printWindow.document.write('<html><head><title>استدعاء رسمي للمجلس التأديبي</title>');
                        printWindow.document.write('<style>');
                        printWindow.document.write('@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap");');
                        printWindow.document.write('body { font-family: "Inter", sans-serif; padding: 40px; background: white; color: black; direction: rtl; text-align: right; }');
                        printWindow.document.write('.header { text-align: center; margin-bottom: 30px; border-bottom: 2px double black; padding-bottom: 20px; }');
                        printWindow.document.write('.title { font-size: 20px; font-weight: bold; margin: 15px 0; text-decoration: underline; }');
                        printWindow.document.write('.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; font-size: 14px; line-height: 1.8; }');
                        printWindow.document.write('.clause-box { border: 1.5px solid black; padding: 15px; margin: 25px 0; background: #f9f9f9; font-size: 12px; line-height: 1.6; }');
                        printWindow.document.write('.footer-signatures { display: flex; justify-content: space-between; margin-top: 50px; font-size: 13px; font-weight: bold; }');
                        printWindow.document.write('</style></head><body>');
                        printWindow.document.write(printContents);
                        printWindow.document.write('</body></html>');
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => {
                          printWindow.print();
                          printWindow.close();
                        }, 500);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🖨️</span>
                  <span>طباعة المستند الورقي (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReferralForPrint(null)}
                  className="px-3.5 py-2 bg-slate-105 hover:bg-slate-150 border border-slate-200 text-slate-700 text-xs font-black rounded-xl transition"
                >
                  إغلاق المعاينة ✕
                </button>
              </div>
            </div>

            {/* Printable official layout */}
            <div className="p-8 bg-slate-50 border-b border-slate-100 max-h-[60vh] overflow-y-auto">
              <div 
                id="summon-printable-certificate" 
                className="bg-white border-2 border-slate-350 p-10 max-w-[210mm] mx-auto shadow-sm text-right text-black font-serif"
                style={{ direction: 'rtl' }}
              >
                {/* Official Algeian Government summons logo & header block */}
                <div className="text-center font-bold space-y-1 pb-4 border-b-2 border-black">
                  <h4 className="text-xs tracking-wider font-extrabold font-serif">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
                  <p className="text-[10px] font-medium">وزارة التكوين والتعليم المهنيين</p>
                  <p className="text-[10px] font-medium">مديرية التكوين لولاية تبسة</p>
                  <p className="text-[11px] font-black uppercase tracking-wide mt-2">معهد التكوين المهني المتخصص - زارع عبد الباقي تبسة 2</p>
                  <div className="w-16 h-0.5 bg-black mx-auto my-1"></div>
                  <p className="text-[9.5px] font-mono">رقم المصلحة البيداغوجية: {selectedReferralForPrint.id}</p>
                </div>

                <div className="text-center my-6">
                  <h2 className="text-lg font-black underline my-2 font-serif">استدعاء رسمي للمثول أمام المجلس التأديبي</h2>
                  <p className="text-[10px] font-bold text-slate-800">موجه بصفة رسمية وعاجلة إلى المتكون وولي أمره</p>
                </div>

                <div className="space-y-4 text-xs leading-relaxed font-sans mt-6">
                  <p className="font-medium text-slate-900">
                    بناء على مخرجات الرصد الآلي وسجل دفاتر الغيابات الرقمية بقاعدة بيانات الرقابة العامة لمعهد تبسة 2، وبموجب تطبيق النظام الداخلي المصدق عليه من لجان البيداغوجيا بالمؤسسة، يرجى من المتكون المبينة هويته أدناه الحضور رفقة ولي أمره الشرعي للمثول أمام أعضاء اللجنة البيداغوجية المنعقدة كمجلس تأديبي:
                  </p>

                  <div className="grid grid-cols-2 gap-4 border border-black p-4 rounded-lg my-4 bg-slate-50/50">
                    <div>
                      <p className="font-bold">اسم المتكون: <span className="font-black underline">{selectedReferralForPrint.learnerName}</span></p>
                      <p className="font-bold mt-1">اسم التخصص: <span className="font-bold text-slate-800">{selectedReferralForPrint.groupName}</span></p>
                    </div>
                    <div>
                      <p className="font-bold">رمز الفرع/الفوج: <span className="font-mono font-black">{selectedReferralForPrint.groupCode}</span></p>
                      <p className="font-bold mt-1">درجة الحالة: <span className="font-black bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded">إحالة عاجلة للمجلس ⚖️</span></p>
                    </div>
                  </div>

                  <p className="font-semibold text-slate-900 border-b border-black pb-1">موجب وسياق الإحالة والمخالفات المنسوبة:</p>
                  <p className="text-[11px] pl-4 font-black italic bg-emerald-50/30 p-2 my-2 rounded border border-emerald-100 text-slate-800 leading-relaxed">
                    {selectedReferralForPrint.reason}
                  </p>

                  {/* Legal backing from uploaded PDF regulations */}
                  <div className="border border-black bg-slate-50 p-4 rounded-lg my-4 text-[10.5px] leading-relaxed">
                    <p className="font-black underline mb-1">المادة القانونية المطبقة بموجب القانون الداخلي الساري («{aiRegulations.fileName}»):</p>
                    <p className="font-medium">
                      بناءً على المادة التشريعية المقررة بقرار الوزارة رقم 2026، فإن تراكم غيابات المتكون بغير عذر بيداغوجي مقبول يتجاوز عتبة {aiRegulations.rules.council} أيام ({Math.round(aiRegulations.rules.council / aiRegulations.rules.absentHourWeight)} حصة) يحيله بصفة تلقائية وسقوط للحق على مجلس التأديب المعتمد للولاية ليتخذ قرار الفصل أو إعادة الإدماج المشروط.
                    </p>
                  </div>

                  <p className="font-semibold text-slate-900 border-b border-black pb-1">تفاصيل ومواعيد الاستماع والبت:</p>
                  <div className="grid grid-cols-2 gap-4 border border-black p-4 rounded-lg my-4 bg-amber-50/10">
                    <div>
                      <p className="font-bold">تاريخ الانعقاد: <span className="font-black underline">{selectedReferralForPrint.date} ({getArabicDayName(selectedReferralForPrint.date)})</span></p>
                      <p className="font-bold mt-1">توقيت الانعقاد: <span className="font-black font-sans">على الساعة: {selectedReferralForPrint.time}</span></p>
                    </div>
                    <div>
                      <p className="font-bold">الموقع: <span className="font-black">{selectedReferralForPrint.place}</span></p>
                    </div>
                  </div>

                  <p className="text-[10px] font-black text-rose-800 leading-normal animate-pulse text-center my-4 pr-4">
                    ⚠️ تذكير هام للغاية: حضور المتكون مرفقاً بولي أمره الشرعي إلزامي بوجوب القانون. غياب الطرفين عن الجلسة يؤدي لصدور القرار التشغيلي بالغياب وبصفة نهائية نافذة للشطب.
                  </p>

                  {/* Signatures block */}
                  <div className="flex justify-between items-start pt-10 font-bold border-t border-black text-[11px]">
                    <div className="text-right">
                      <p className="underline mb-6">المستشار الوصي والأستاذ:</p>
                      <br />
                      <p className="text-slate-400 font-mono text-[9px]">ختم وإمضاء لجنة البيداغوجيا</p>
                    </div>
                    <div className="text-center">
                      <p className="mb-6">توقيع ولي الأمر:</p>
                      <br />
                      <p className="text-slate-400 text-[10px]">(علمت ومصادق عليه)</p>
                    </div>
                    <div className="text-left">
                      <p className="underline mb-6 text-left">مستشار الرقابة العامة للمعهد:</p>
                      <br />
                      <p className="text-slate-400 font-mono text-[9px]">ولاية تبسة (ختم المؤسسة)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPurgeReferralsConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl max-w-md w-full text-right" dir="rtl">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 justify-end mb-2">
              <span>⚠️</span>
              <span>تأكيد تصفير وحذف كافة الإحالات؟</span>
            </h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6">
              إن هذا الإجراء سيقوم بحذف كافة استدعاءات ومثول المتكونين للمجلس التأديبي من فضاء الرقابة بصفة تامة وبلا رجوع. هل تود المتابعة؟
            </p>
            <div className="flex justify-start gap-2">
              <button
                type="button"
                onClick={handlePurgeReferrals}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition active:scale-95 cursor-pointer"
              >
                تأكيد حذف وتصفير السجل 🗑️
              </button>
              <button
                type="button"
                onClick={() => setShowPurgeReferralsConfirm(false)}
                className="px-4 py-2 bg-slate-105 hover:bg-slate-150 border border-slate-200 text-slate-700 text-xs font-black rounded-xl transition"
              >
                إلغاء ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {showPurgeConfirm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full text-right space-y-4" dir="rtl">
            <h3 className="text-base font-black text-rose-600 flex items-center gap-1.5 justify-end mb-2">
              <span>🛑 إعادة ضبط المصنع ومحو بيانات التمهين</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              تحذير أمني بيداغوجي: أنت على وشك تصفير النظام بالكامل. سيقوم هذا بنظافة ومسح كافة سجلات الحضور للمتربصين، تصفير الإحصائيات العامة، تنظيف بصمات وأكواد الـ QR المتغيرة، وتطهير ملفات الغياب للبدء من جديد بدورة أكاديمية بيضاء. هل توافق على الإخلاء؟
            </p>
            <div className="flex gap-2 justify-start pt-2">
              <button
                type="button"
                onClick={() => {
                  AppStateStore.resetSystemAll();
                  setGroups(AppStateStore.getGroups());
                  setSessions(AppStateStore.getSessions());
                  setRemoteLogs(AppStateStore.getRemoteAttendanceLogs());
                  setSmsLogs(AppStateStore.getSmsLogs());
                  setReferralList([]);
                  setShowPurgeConfirm(false);
                  setSuccessMessage("✓ تم بنجاح تطبيق الفرمطة الشاملة وتصفير جميع سجلات الغياب والـ QR للبدء من الصفر بقوة وموثوقية!");
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition active:scale-95 cursor-pointer"
              >
                الموافقة والحذف النهائي الشامل 🗑️
              </button>
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-650 font-bold text-xs rounded-xl cursor-pointer"
              >
                تراجع وإلغاء ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegulationsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl text-right overflow-hidden" dir="rtl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-row-reverse">
              <h3 className="font-extrabold text-[#0F172A] text-sm flex items-center gap-2">
                <span>📚</span>
                <span>تحديث وتطبيق النظام الداخلي لولاية تبسة (PDF)</span>
              </h3>
              <button onClick={() => setShowRegulationsModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-black">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {isAnalyzingRegulations ? (
                <div className="space-y-4 py-8 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                  <p className="text-xs font-black text-slate-800 animate-pulse">{aiRegulationsSteps[analysisStepIndex] || "جاري التحليل..."}</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                    <p className="text-xs font-black text-amber-900 leading-normal mb-1">النظام الداخلي النشط لحساب العتبات بذكاء:</p>
                    <p className="text-[11px] text-slate-600 font-bold">ملف القانون: <span className="underline font-black font-sans">{aiRegulations.fileName}</span></p>
                    <p className="text-[11px] text-slate-600 font-bold mt-1">تاريخ التحليل: <span className="font-sans">{aiRegulations.analyzedAt}</span></p>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 cursor-pointer relative hover:border-amber-400 transition">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2 flex flex-col items-center">
                      <span className="text-2xl">📋</span>
                      <p className="text-xs font-black text-slate-800">انقر أو اسحب ملف PDF قانون داخلي جديد</p>
                      <p className="text-[9.5px] text-slate-400 font-bold">يقوم الذكاء الاصطناعي تلقائياً بفهرسة البنود والعقوبات وعتبات غياب تبسة 2</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/20 text-xs">
                    <h4 className="font-extrabold underline mb-2">حدود النظام المعتمد قانونياً حالياً:</h4>
                    <div className="grid grid-cols-2 gap-4 font-sans font-bold text-[10.5px] text-slate-700">
                      <div>• غياب إنذار أول: {aiRegulations.rules.warning1} أيام غياب</div>
                      <div>• غياب إنذار ثانٍ: {aiRegulations.rules.warning2} أيام غياب</div>
                      <div>• الإحالة للمجلس: {aiRegulations.rules.council} أيام غياب</div>
                      <div>• الشطب الأكاديمي التلقائي: {aiRegulations.rules.dismissal} أيام غياب</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
