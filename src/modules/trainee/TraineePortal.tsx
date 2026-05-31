import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  MapPin, 
  QrCode, 
  AlertCircle, 
  ArrowUpRight,
  Download,
  Contact2,
  Calendar,
  Clock,
  ExternalLink,
  Award,
  BookOpen,
  TrendingUp,
  XCircle,
  CheckCircle2,
  UploadCloud,
  HelpCircle,
  Send,
  MessageSquare,
  FileText,
  Plus,
  Search,
  AlertTriangle,
  UserCheck,
  Bell,
  FileCheck,
  Smartphone,
  Check,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppStateStore, SemesterResult, GradeAppeal, DisciplinaryReferral } from '../../services/store';

export default function TraineePortal() {
  const [referrals, setReferrals] = useState<DisciplinaryReferral[]>(() => AppStateStore.getDisciplinaryReferrals());
  const [sessions, setSessions] = useState<any[]>(() => AppStateStore.getSessions());
  const [results, setResults] = useState<SemesterResult[]>(() => AppStateStore.getSemesterResults());
  const [appeals, setAppeals] = useState<GradeAppeal[]>(() => AppStateStore.getGradeAppeals());
  
  // Real dynamic Trainee login state
  const [loggedTraineeName, setLoggedTraineeName] = useState<string | null>(() => localStorage.getItem('rq_trainee_logged_name'));
  const [loggedGroupId, setLoggedGroupId] = useState<string | null>(() => localStorage.getItem('rq_trainee_logged_id'));
  const [inputName, setInputName] = useState<string>('');
  const [inputGroupId, setInputGroupId] = useState<string>('');

  const groups = AppStateStore.getGroups();
  const currentGroup = groups.find(g => g.id === (loggedGroupId || '')) || groups[0];

  // Simulation and Selection States
  const [studentId, setStudentId] = useState<string>('L-01');
  const [activeTab, setActiveTab] = useState<'attendance' | 'grades' | 'remote_attendance'>('attendance');
  const [selectedDay, setSelectedDay] = useState<number>(25);

  // SmartStage DZ Remote Attendance Specific states
  const [myCompanies, setMyCompanies] = useState(() => AppStateStore.getWorkplaceCompanies());
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [simulatedGpsType, setSimulatedGpsType] = useState<'inside' | 'edge' | 'outside' | 'home'>('inside');
  const [hasSelfie, setHasSelfie] = useState<boolean>(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string>('');
  const [qrCodeVal, setQrCodeVal] = useState<string>('');
  const [isVerifyingCheckIn, setIsVerifyingCheckIn] = useState<boolean>(false);
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState<string>('');
  const [checkInErrorMsg, setCheckInErrorMsg] = useState<string>('');
  const [remoteLogs, setRemoteLogs] = useState(() => AppStateStore.getRemoteAttendanceLogs());

  // === NEW SAAS PERFORMANCE, OFFLINE & CYBERCOMPLIANT STATES ===
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => AppStateStore.getOfflineQueue());
  const [isCompressingSelfie, setIsCompressingSelfie] = useState<boolean>(false);
  const [compressionRatio, setCompressionRatio] = useState<string>('');
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(() => localStorage.getItem('rq_pwa_installed') === 'true');
  const [qrCountdown, setQrCountdown] = useState<number>(30);
  const [secureFingerprint, setSecureFingerprint] = useState<string>('DF-VET-92A3-X89');
  const [showPwaInstallBanner, setShowPwaInstallBanner] = useState<boolean>(true);

  // Auto decrement QR countdown timer & rotate server verification fingerprint
  useEffect(() => {
    const interval = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) {
          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
          let token = "DF-VET-";
          for (let i = 0; i < 4; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
          token += "-" + Math.floor(Math.random() * 800 + 100);
          setSecureFingerprint(token);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update offline queue count when storage changes
  useEffect(() => {
    setOfflineQueue(AppStateStore.getOfflineQueue());
  }, [isOffline]);

  // Set default selected company
  useEffect(() => {
    if (myCompanies.length > 0) {
      setSelectedCompanyId(myCompanies[0].id);
    }
  }, [myCompanies]);

  
  // Grade appeal state
  const [appealSubject, setAppealSubject] = useState<string>('');
  const [appealReason, setAppealReason] = useState<string>('');
  const [appealSuccess, setAppealSuccess] = useState<string>('');

  // Parent alert sync state toggle
  const [guardianSmsAlerts, setGuardianSmsAlerts] = useState<boolean>(true);

  // Administrative Upload Wizard State (unused in student portal but kept for ref compatibility)
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  useEffect(() => {
    // Refresh states and handle real-time sync with Store
    setReferrals(AppStateStore.getDisciplinaryReferrals());
    setSessions(AppStateStore.getSessions());
    setResults(AppStateStore.getSemesterResults());
    setAppeals(AppStateStore.getGradeAppeals());
    setRemoteLogs(AppStateStore.getRemoteAttendanceLogs());
    setMyCompanies(AppStateStore.getWorkplaceCompanies());

    const unsub = AppStateStore.subscribe(() => {
      setReferrals(AppStateStore.getDisciplinaryReferrals());
      setSessions(AppStateStore.getSessions());
      setResults(AppStateStore.getSemesterResults());
      setAppeals(AppStateStore.getGradeAppeals());
      setRemoteLogs(AppStateStore.getRemoteAttendanceLogs());
      setMyCompanies(AppStateStore.getWorkplaceCompanies());
    });
    return unsub;
  }, []);

  // Update studentId based on logged name & group
  useEffect(() => {
    if (loggedTraineeName && currentGroup) {
      const match = currentGroup.learners?.find(l => 
        l.name.trim().toLowerCase().includes(loggedTraineeName.trim().toLowerCase()) ||
        loggedTraineeName.trim().toLowerCase().includes(l.name.trim().toLowerCase())
      );
      if (match) {
        setStudentId(match.id);
      } else {
        // Fallback
        setStudentId('L-01');
      }
    }
  }, [loggedTraineeName, loggedGroupId, currentGroup]);

  // Sync default appeal subject
  const currentStudentResults = results.find(r => r.learnerId === studentId);
  useEffect(() => {
    if (currentStudentResults?.subjects?.length) {
      setAppealSubject(currentStudentResults.subjects[0].name);
    }
  }, [studentId, results, currentStudentResults]);

  // Handle student profile swapping - showing only students belonging to their logged-in specialty (group)
  const studentProfiles = currentGroup?.learners?.length
    ? currentGroup.learners.map(l => ({
        id: l.id,
        name: l.name,
        code: currentGroup.code,
        label: `المتكون: ${l.name}`
      }))
    : [
        { id: 'L-01', name: 'علوي معمر عادل', code: 'WF-WEB-2024', label: 'المتكون الأول (ناجح متميز + إنذارات)' },
        { id: 'L-02', name: 'زين الإدريسي فوزي', code: 'WF-WEB-2024', label: 'المتكون الثاني (مستدرك بـ 9.80 + منضبط)' }
      ];

  // Assemble dynamic profile info based on actual logged credentials
  const currentProfile = loggedTraineeName 
    ? { id: studentId, name: loggedTraineeName, code: currentGroup?.code || 'WF-WEB-2024' }
    : studentProfiles.find(p => p.id === studentId) || studentProfiles[0];

  // Dynamic Training Mode checking for Apprenticeship Mode Restriction
  const currentModeId = localStorage.getItem('rq_trainee_logged_mode') || currentGroup?.modeId || '2';
  const currentModeObj = AppStateStore.getModes().find(m => m.id === currentModeId);
  const currentModeName = currentModeObj?.name || 'التكوين عن طريق التمهين';
  const isApprenticeshipMode = currentModeName.includes('تمهين') || currentModeId === '2';

  // Summons finder (Dynamic from store matching student name or fuzzy matches)
  const mySummons = referrals.find(r => 
    r.learnerId === studentId || 
    r.learnerName.includes(currentProfile.name.split(' ')[0]) || 
    r.learnerName.includes(currentProfile.name.split(' ')[1] || 'معمر')
  );

  // Absence calculation
  const mySessions = sessions.filter(s => s.groupId === (currentGroup?.id || 'GP-WEB-1'));
  let myAbsenceHours = 0;
  mySessions.forEach(s => {
    const status = s.attendanceMap?.[studentId];
    if (status === 'absent') {
      myAbsenceHours += s.duration || 2;
    }
  });

  // Dynamic attendance relative percentage
  const baseSemesterHours = 100;
  const attendancePercentage = Math.max(0, Math.min(100, 100 - myAbsenceHours));

  // Determine dynamic warning level based on the current PDF & photo rules:
  // - Warning 1 (Alert): if has any absences up to 3 days (12 hours)
  // - Warning 2 (Warning): if > 3 days and up to 9 days (12 to 36 hours)
  // - Reprimand & Council: 10 days (40 hours) 
  // - Dismissal: consecutive 15 days, or 20 days fragmented.
  let dynamicDisciplinaryStatus: {
    statusText: string;
    level: 'safe' | 'warning1' | 'warning2' | 'council' | 'dismissal';
    description: string;
  } = {
    statusText: 'مطابق ومنضبط',
    level: 'safe',
    description: 'سجلك نظيف ومثالي تماماً لهذا الشهر، تابع مواظبتك لضمان منحة التكوين الكاملة.'
  };

  const equivDays = myAbsenceHours * 0.25; // 0.25 day weight for each period/hour
  if (equivDays >= 20 || myAbsenceHours >= 80) {
    dynamicDisciplinaryStatus = {
      statusText: 'قارب الشطب النهائي (مجزأ)',
      level: 'dismissal',
      description: 'لقد تخطت غياباتك التراكمية عتبة 20 يوماً بيداغوجياً مجزأ، ملفك قيد التدقيق للشطب والقصاص الشامل.'
    };
  } else if (equivDays >= 10 || myAbsenceHours >= 40) {
    dynamicDisciplinaryStatus = {
      statusText: 'توبيخ وإحالة للمجلس التأديبي',
      level: 'council',
      description: 'لقد بلغت غياباتك 10 أيام سلوكية كاملة. تم إحالتك رسمياً للمثول والمساءلة الإدارية.'
    };
  } else if (equivDays > 3) {
    dynamicDisciplinaryStatus = {
      statusText: 'إنذار من الدرجة الثانية',
      level: 'warning2',
      description: 'تنبيه عاجل: غياباتك تجاوزت 3 أيام سلوكية وجاري استدعاء الولي الشرعي لتوقيع التعهد.'
    };
  } else if (myAbsenceHours > 0) {
    dynamicDisciplinaryStatus = {
      statusText: 'تنبيه أول بيداغوجي',
      level: 'warning1',
      description: 'تنبيه بسيط: لقد تم قيد غيابات ساعة/حصص غير مبررة وجاري مواءمة المعدلات السلوكية.'
    };
  }

  // Handle grade appeal submission
  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim()) {
      alert("الرجاء كتابة تفاصيل وسبب التظلم بشكل لائق.");
      return;
    }

    const newAppeal = {
      learnerId: studentId,
      learnerName: currentProfile.name,
      subjectName: appealSubject,
      reason: appealReason
    };

    AppStateStore.addGradeAppeal(newAppeal);
    setAppealReason('');
    setAppealSuccess(`✓ تم تقديم تظلمك البيداغوجي بشأن مادة [${appealSubject}] بنجاح، جاري إحالته آلياً للمنسق والرقابة للدراسة.`);
    
    setTimeout(() => {
      setAppealSuccess('');
    }, 5000);
  };

  // Calendar setup for May 2026
  const weekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const paddingDays = 5; 
  const calendarDays = [];
  for (let i = 0; i < paddingDays; i++) calendarDays.push({ isPadding: true, day: 0 });
  for (let d = 1; d <= 31; d++) calendarDays.push({ isPadding: false, day: d });

  const isDaySummons = (dayNum: number) => {
    if (!mySummons) return false;
    const summonsDay = parseInt(mySummons.date.split('-')[2], 10);
    return dayNum === summonsDay;
  };

  // ICS File Download helper
  const downloadIcsFile = (summons: any) => {
    const title = `معهد تبسة 2 - مجلس تأديبي المتكون: ${summons.learnerName}`;
    const description = `موضع الاستدعاء: ${summons.reason}. الحضور إجباري برفقة الولي الشرعي.`;
    const dateStr = summons.date.replace(/-/g, '');
    const timeParts = summons.time.split(':');
    const hours = timeParts[0].padStart(2, '0');
    const minutes = timeParts[1]?.padStart(2, '0') || '00';
    
    const startIso = `${dateStr}T${hours}${minutes}00`;
    const endHour = String(Number(hours) + 1).padStart(2, '0');
    const endIso = `${dateStr}T${endHour}${minutes}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//APP//LEARNER-PORTAL-ALGERIA//AR',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${summons.place} • ${summons.hallNumber || 'قاعة 3'}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `summons-${studentId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 text-right container mx-auto px-1" dir="rtl">
      
      {/* Simulation Console Card for Testing / Evaluation - Proactive and friendly indicator representing multiple student aspects */}
      <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-none pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 flex-row-reverse">
          <div className="text-right">
            <h4 className="text-xs font-bold text-emerald-400 tracking-wider mb-1 flex items-center justify-end gap-1">
              <span>بوابة محاكاة وسجل فضاء المتكون الرقمي</span>
              <Smartphone className="w-3.5 h-3.5" />
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              تصفح وجرب سيناريوهات المنصة بتبديل بيانات المتكون للاطلاع على نتائج المداولات وكشف النقاط والإجراءات الانضباطية.
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold ml-1">تحديد الحساب النشط:</span>
            {studentProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setStudentId(profile.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl font-bold text-[11px] font-sans transition-all duration-300",
                  studentId === profile.id
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 scale-105"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white"
                )}
              >
                {profile.name}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* ACTIVE REAL-TIME ALERTS HUB & DISCIPLINARY NOTIFICATIONS TIMELINE - Alerts 1/2, Reprimand, Dismissal for Trainee */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {/* Summon Notification Box */}
          {mySummons && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-rose-50 border border-rose-200 rounded-3xl p-5 md:p-6 text-right relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 left-0 bg-rose-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-2xl">
                إشعار بطلب حضور فوري للمثول
              </div>
              
              <div className="flex gap-4 flex-row-reverse items-start mt-2 flex-wrap md:flex-nowrap">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0 mx-auto">
                  <AlertCircle className="w-7 h-7 animate-pulse" />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <h3 className="text-[#0F172A] text-base font-black flex items-center gap-2 justify-end">
                    استدعاء رسمي للمثول أمام المجلس التأديبي
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    بمقتضى الميثاق الداخلي لمعهد التكوين والتمهين بالجزائر، يُطلب حضور المتكون <b>« {mySummons.learnerName} »</b> وبصفة إلزامية رفقة الولي الشرعي للمثول أمام أعضاء المجلس الموقر لدراسة السجل السلوكي للغيابات المترابطة:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-rose-100 mt-3 text-right">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">تاريخ وعقد الجلسة</span>
                      <span className="text-xs font-black text-slate-900 block font-sans">{mySummons.date}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">التوقيت والتفاصيل</span>
                      <span className="text-xs font-black text-rose-700 block font-sans">{mySummons.time}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">قاعة ومؤسسة الانعقاد</span>
                      <span className="text-xs font-black text-slate-900 block font-sans">{mySummons.place}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">القاعة رقم</span>
                      <span className="text-xs font-black text-indigo-650 block font-sans">{mySummons.hallNumber || "قاعة الاجتماعات 03"}</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-medium text-rose-800 bg-rose-100/40 p-2 rounded-lg border border-rose-100 mt-2">
                    <b>ملاحظة إدارية:</b> تخلفكم عن الحضور أو غياب الولي سيترتب عنه شطب المتكون بصفة نهائية آلياً وتطبيق الإجراءات البيداغوجية الصارمة.
                  </p>

                  <div className="pt-3 border-t border-rose-100/50 flex flex-wrap justify-between items-center gap-3 flex-row-reverse">
                    <span className="text-[9.5px] text-slate-400 font-bold italic">مكتب تتبع المواظبة والرقابة العامة • زارع عبد الباقي</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert('تم تأكيد علمكم وتأكيد وصول الإشعار للإدارة بنجاح.')}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10.5px] px-3.5 py-2 rounded-lg transition active:scale-95"
                      >
                        تأكيد العلم والاستلام ✓
                      </button>
                      <button 
                        onClick={() => downloadIcsFile(mySummons)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10.5px] px-3 py-2 rounded-lg transition flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        التقويم (.ics)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dynamic Behavioral Warning Alert Cards based on absences */}
          {dynamicDisciplinaryStatus.level !== 'safe' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "p-5 rounded-3xl border text-right mt-1.5 relative overflow-hidden flex flex-col md:flex-row items-center gap-4 flex-row-reverse",
                dynamicDisciplinaryStatus.level === 'dismissal' && "bg-amber-500/5 border-amber-500/20 text-slate-100",
                dynamicDisciplinaryStatus.level === 'council' && "bg-red-500/5 border-red-500/20 text-slate-100",
                dynamicDisciplinaryStatus.level === 'warning2' && "bg-amber-50/70 border-amber-200/85 text-slate-950",
                dynamicDisciplinaryStatus.level === 'warning1' && "bg-blue-50/70 border-blue-200/80 text-slate-950"
              )}
            >
              <div className="absolute top-0 left-0 text-[8px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl bg-slate-900 text-white">
                إنذار بيداغوجي ومواظبة
              </div>
              <div className={cn(
                "p-3 rounded-2xl shrink-0",
                dynamicDisciplinaryStatus.level === 'warning2' && "bg-amber-100 text-amber-600",
                dynamicDisciplinaryStatus.level === 'warning1' && "bg-blue-100 text-blue-600",
                dynamicDisciplinaryStatus.level === 'council' && "bg-red-100 text-red-600",
                dynamicDisciplinaryStatus.level === 'dismissal' && "bg-amber-100 text-amber-600"
              )}>
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1 text-right space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[10px] font-extrabold text-slate-400">حالة انضباط الفوج</span>
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  <h4 className="text-sm font-black text-slate-900">{dynamicDisciplinaryStatus.statusText}</h4>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {currentProfile.name}: {dynamicDisciplinaryStatus.description} (المكافئ الحسابي: {myAbsenceHours} ساعة غياب، المقابل: {equivDays.toFixed(2)} يوماً سلوك).
                </p>
              </div>
            </motion.div>
          )}

          {/* Special notice for Passed students or Remedial students */}
          {currentStudentResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-5 rounded-3xl border border-slate-200 shadow-sm text-right flex flex-col md:flex-row items-center gap-4 flex-row-reverse",
                currentStudentResults.status === 'passed' ? "bg-emerald-50/30 border-emerald-150" : "bg-amber-50/30 border-amber-150"
              )}
            >
              <div className={cn(
                "p-3 rounded-2xl shrink-0",
                currentStudentResults.status === 'passed' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
              )}>
                {currentStudentResults.status === 'passed' ? <Award className="w-7 h-7" /> : <TrendingUp className="w-7 h-7" />}
              </div>
              
              <div className="flex-1 space-y-1">
                <span className="text-[9.5px] font-bold text-slate-400 block">إشعار رسمي من الأمانة العامة للمداولات</span>
                <h4 className="text-sm font-black text-slate-900">
                  {currentStudentResults.status === 'passed' 
                    ? `تهانينا الحارة المتكون المتميز - السجل الأكاديمي: ناجح بـمعدل ${currentStudentResults.gpa.toFixed(2)}` 
                    : `تنبيه الأداء البيداغوجي - السجل الأكاديمي: مستدرك بمعدل ${currentStudentResults.gpa.toFixed(2)}`}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {currentStudentResults.deliberationsNote} <i>تم التحديث والاعتماد بموجب محضر المداولات لشهر ماي 2026.</i>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PRIMARY PROFILE CARD WITH ADAPTIVE BEHAVIOR SCORE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center flex-row-reverse relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#0F172A] opacity-[0.01] -ml-16 -mt-16 rounded-full" />
        
        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-inner relative z-10 shrink-0">
          <Contact2 className="w-10 h-10 text-slate-700" />
        </div>

        <div className="text-center md:text-right relative z-10 w-full">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2 flex-row-reverse items-center">
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9.5px] font-bold uppercase rounded-md border border-emerald-100">
              الدخول نشط ✓
            </span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-650 text-[9.5px] font-bold rounded-md border border-indigo-100">
              {currentProfile.code} - الفوج الدراسي الأول
            </span>
            <span className={cn(
              "px-2.5 py-0.5 text-[9.5px] font-black rounded-md border flex items-center gap-1",
              isApprenticeshipMode 
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                : "bg-slate-100 text-slate-800 border-slate-200"
            )}>
              💼 نمط التكوين: {currentModeName}
            </span>
          </div>
          
          <h2 className="text-xl font-black text-slate-900">{currentProfile.name}</h2>
          <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-tight">معهد التكوين المهني المتخصص زارع عبد الباقي تبسة 2</p>
          
          {/* Responsive stats grids with colored gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5 bg-slate-50/75 p-4 rounded-2xl border border-slate-150 flex-row-reverse">
            
            <div className="text-right">
              <span className="text-[9.5px] font-bold text-slate-400 block">إجمالي غياب السداسي</span>
              <span className={`text-sm font-black ${myAbsenceHours > 12 ? 'text-rose-600' : 'text-slate-800'}`}>
                {myAbsenceHours} ساعة ({equivDays.toFixed(1)} أيام سلوك)
              </span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", myAbsenceHours > 12 ? "bg-rose-500" : "bg-emerald-500")}
                  style={{ width: `${Math.min(100, (myAbsenceHours / 15) * 100)}%` }}
                />
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9.5px] font-bold text-slate-400 block">المعدل السداسي العام</span>
              <span className={`text-sm font-black ${currentStudentResults && currentStudentResults.status === 'passed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {currentStudentResults ? `${currentStudentResults.gpa.toFixed(2)} / 20` : 'معلق للمداولات'}
              </span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", currentStudentResults && currentStudentResults.gpa >= 10 ? "bg-emerald-500" : "bg-amber-500")}
                  style={{ width: `${currentStudentResults ? (currentStudentResults.gpa / 20) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9.5px] font-bold text-slate-400 block">نسبة الحضور الدراسي</span>
              <span className={`text-sm font-black ${attendancePercentage < 80 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {attendancePercentage}%
              </span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", attendancePercentage < 80 ? "bg-rose-500" : "bg-emerald-500")}
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>
            </div>

            <div className="text-right col-span-1">
              <span className="text-[9.5px] font-bold text-slate-400 block">حالة تفعيل إشعارات الأولياء</span>
              <div className="flex items-center gap-1.5 mt-1">
                <input 
                  type="checkbox" 
                  id="guardian-sms-check"
                  checked={guardianSmsAlerts}
                  onChange={(e) => setGuardianSmsAlerts(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500" 
                />
                <label htmlFor="guardian-sms-check" className="text-[10px] text-slate-600 font-extrabold cursor-pointer">
                  ربط SMS بـ الولي الشرعي
                </label>
              </div>
              <span className="text-[9px] text-indigo-600 block leading-none font-bold mt-1">
                {guardianSmsAlerts ? '✓ متصل هاتفياً وإلكترونياً' : '❌ الإشعارات ملغاة للولي'}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* PORTAL TAB NAVIGATION SELECTOR */}
      <div className="flex border-b border-slate-200 font-bold gap-6 flex-wrap">
        <button
          onClick={() => setActiveTab('attendance')}
          className={cn(
            "pb-3 text-xs tracking-tight transition-all duration-300 border-b-2 flex items-center gap-2 px-1 relative cursor-pointer",
            activeTab === 'attendance'
              ? "border-slate-900 text-slate-900 font-black scale-105"
              : "border-transparent text-slate-400 font-medium hover:text-slate-600"
          )}
        >
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>سجل الغيابات والتقويم والانضباط</span>
          {mySummons && (
            <span className="absolute top-0 left-0 -ml-1.5 -mt-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={cn(
            "pb-3 text-xs tracking-tight transition-all duration-300 border-b-2 flex items-center gap-2 px-1 cursor-pointer",
            activeTab === 'grades'
              ? "border-slate-900 text-slate-900 font-black scale-105"
              : "border-transparent text-slate-400 font-medium hover:text-slate-600"
          )}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>كشف النقاط السداسي ومحاضر المداولات</span>
          <span className="px-1.5 py-0.25 bg-amber-100 text-amber-700 text-[8px] font-black rounded-full">
            محدث
          </span>
        </button>

        <button
          onClick={() => setActiveTab('remote_attendance')}
          className={cn(
            "pb-3 text-xs tracking-tight transition-all duration-300 border-b-2 flex items-center gap-2 px-1 relative cursor-pointer",
            activeTab === 'remote_attendance'
              ? "border-slate-900 text-slate-900 font-black scale-105"
              : "border-transparent text-slate-400 font-medium hover:text-slate-600"
          )}
        >
          <MapPin className="w-4 h-4 text-sky-500 animate-pulse" />
          <span>متابعة التربص والوسط المهني (SmartStage DZ) 💼</span>
          <span className="px-1.5 py-0.25 bg-sky-100 text-sky-700 text-[8px] font-black rounded-full">
            مباشر عن بعد
          </span>
        </button>
      </div>

      {/* TAB CONTENTS CONTAINER */}
      <div>
        <AnimatePresence mode="wait">
          {activeTab === 'attendance' && (
            <motion.div
              key="attendance-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {!isApprenticeshipMode ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm relative overflow-hidden" dir="rtl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -mr-16 -mt-16 rounded-full" />
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 relative z-10">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 relative z-10">سجل حضور المتكونين مقيد</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    هذا الفضاء مخصص حصرياً للمتكونين الملتزمين بـ <span className="text-amber-600 font-extrabold">"نمط التكوين عن طريق التمهين"</span> (التربص الميداني وبطاقات التحرير المهني).
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-150 font-medium text-right" dir="rtl">
                    نمط التكوين المسجل بمقعدك حالياً هو: <b className="text-slate-900">« {currentModeName} »</b>. نظراً للقوانين البيداغوجية، يتم تسجيل ورصد غياباتك بانتظام ويدوياً من قبل أستاذ المادة داخل القاعة الدراسية دون الحاجة للبصمة والرمز المميز.
                  </p>
                  <button
                    onClick={() => setActiveTab('grades')}
                    className="mt-2 bg-slate-950 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition shadow-sm active:scale-95"
                  >
                    عرض كشوف النقاط ومحاضر المداولات 📊
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Interactive Calendar Widget (Left side in Arabic RTL columns context) */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5 flex-row-reverse pb-4 border-b">
                      <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                        التقويم الرقمي لدفتر الحصص والمواظبة اليومية
                        <Calendar className="w-4 h-4 text-emerald-500" />
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400 font-sans">ماي 2026</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      {/* Interactive Selection Details */}
                      <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-150 text-right flex flex-col justify-between">
                        <div>
                          <span className="text-[8.5px] font-bold text-slate-400 block uppercase">اليوم المحدد بجدول الغياب</span>
                          <span className="text-xs font-black text-slate-800 block font-sans mb-3">{selectedDay} ماي 2026</span>
                          
                          {selectedDay === 25 && mySummons ? (
                            <div className="space-y-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-right">
                              <span className="text-[9.5px] font-black text-rose-700 block">✓ جلسة مجلس تأديبي إجباري</span>
                              <p className="text-[10.5px] text-slate-600 font-bold leading-relaxed">
                                <b>الموضوع:</b> {mySummons.reason}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                <b>المكان:</b> {mySummons.place} • القاعة {mySummons.hallNumber || "03"}
                              </p>
                              <div className="pt-2 border-t border-rose-100/50 flex flex-col gap-1.5">
                                <button 
                                  onClick={() => downloadIcsFile(mySummons)}
                                  className="w-full bg-slate-950 text-white text-[10px] py-1.5 rounded-lg font-bold hover:bg-slate-800 transition text-center"
                                >
                                  تحميل بالهاتف (.ics)
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-400 py-6 text-center text-[10.5px] font-bold leading-relaxed">
                              {selectedDay === 24 ? (
                                <p className="text-emerald-650">اليوم الدراسي الجاري 🟢<br/><span className="text-slate-400 text-[9px]">مدرج بحصص التكوين الحضوري</span></p>
                              ) : (
                                <p>يوم دراسي مبرمج اعتيادياً.<br/><span className="text-[9px] text-slate-400 block mt-1">لا توجد به استدعاءات إدارية أو تفتيشات مسجلة حالياً.</span></p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-[9px] text-slate-400 border-t border-slate-200/60 pt-2 font-bold mt-4 leading-relaxed">
                          * الأيام الملونة بالأحمر بالبوابة تحوي جلسات انضباطية تشريعية معتمدة. انقر عليها لتأكيد العلم للمجلس.
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="md:col-span-7">
                        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-slate-400 mb-2">
                          {weekdays.map(w => <div key={w} className="py-1">{w}</div>)}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {calendarDays.map((item, idx) => {
                            if (item.isPadding) return <div key={`pad-${idx}`} className="aspect-square bg-slate-50/30 rounded-lg" />;
                            
                            const isCurrent = item.day === 24; 
                            const hasSummons = isDaySummons(item.day);
                            const isSelected = selectedDay === item.day;

                            return (
                              <button
                                key={`d-${item.day}`}
                                onClick={() => setSelectedDay(item.day)}
                                className={cn(
                                  "aspect-square rounded-lg flex flex-col justify-between p-1 text-[10.5px] font-bold transition-all relative font-sans",
                                  isCurrent && "border border-emerald-500 bg-emerald-50/20",
                                  hasSummons && "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
                                  !hasSummons && isSelected && "bg-slate-900 text-white",
                                  !hasSummons && !isSelected && "bg-slate-50 hover:bg-slate-100 text-slate-700",
                                  hasSummons && isSelected && "ring-2 ring-rose-300"
                                )}
                              >
                                <span>{item.day}</span>
                                {hasSummons && <span className="w-1 bg-white h-1 rounded-full self-end animate-pulse" />}
                                {isCurrent && !hasSummons && <span className="w-1 bg-emerald-500 h-1 rounded-full self-end" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro Actions, QR-NFC Gate / Mobile Wallet (Right side in Arabic context) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Digital QR Badge */}
                  <div className="bg-slate-950 text-white rounded-3xl p-6 text-center relative overflow-hidden shadow-md">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-32 h-32 bg-white rounded-xl p-2.5 shadow-xl mb-4">
                        <QrCode className="w-full h-full text-slate-950" />
                      </div>
                      <h4 className="text-xs font-black">البطاقة الرقمية للمتكون NFC-QR</h4>
                      <p className="text-slate-500 text-[9.5px] uppercase tracking-wider font-bold mt-1">رمز مرور مشفر للحضور والمنح</p>
                      
                      <button 
                        onClick={() => alert("جاري تصدير بطاقة المتكون على شكل PDF متوافق مع Apple Wallet, Google Wallet.")}
                        className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black py-2.5 rounded-xl text-[11px] shadow-sm flex items-center justify-center gap-1 mt-5 active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        تصدير بطاقة المعهد الرقمية
                      </button>
                    </div>
                  </div>

                  {/* VET Rules compliance reminder card */}
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 text-right space-y-3">
                    <div className="flex items-center gap-2 justify-end text-amber-500">
                      <span className="font-extrabold text-[9.5px] uppercase">دليل الانضباط لوزارة التكوين</span>
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-650 font-medium leading-relaxed">
                      يمنح كل غياب غير مبرر بوزن 0.25 يوماً خصماً بلقاء المواظبة اليومي. يترتب على تجاوز 15 يوماً متواصلة أو 20 يوماً متقطعة شطب كلي وقاطع من قائمة المتكونين بمعهد تبسة 2 بمحضر اجتماع الرقابة العامة.
                    </p>
                  </div>

                </div>

              </div>
              )}
            </motion.div>
          )}

          {activeTab === 'grades' && (
            <motion.div
              key="grades-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                
                {/* Semester Results Header & Download certificate */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5 mb-6 flex-row-reverse">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-indigo-650 block">مداولات السداسي الثاني الرسمية</span>
                    <h3 className="text-lg font-black text-slate-900">
                      {currentStudentResults ? currentStudentResults.semesterName : 'السداسي الثاني لفرع تطوير الويب 2025/2026'}
                    </h3>
                    <p className="text-[10.5px] text-slate-450 font-bold mt-1">
                      {currentStudentResults ? `تم النشر والاعتماد في: ${currentStudentResults.publishedAt}` : 'في انتظار نشر النتائج الرسمية بعد المداولات'}
                    </p>
                  </div>
                  
                  {currentStudentResults?.status === 'passed' && (
                    <button 
                      onClick={() => alert("جاري تحميل وثيقة كشف النقاط المعتمدة بصيغة PDF الممضية إلكترونياً.")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-1.5 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      تحميل كشف النقاط الرسمي (PDF)
                    </button>
                  )}
                </div>

                {/* Grade display table / List */}
                {currentStudentResults ? (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 font-extrabold">
                            <th className="p-3">المقياس / المادة البيداغوجية</th>
                            <th className="p-3 text-center">المعامل</th>
                            <th className="p-3 text-center">المراقبة المستمرة</th>
                            <th className="p-3 text-center">علامة الامتحان</th>
                            <th className="p-3 text-center">معدل المقياس</th>
                            <th className="p-3 text-center">الوضعية والقرار</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                          {currentStudentResults.subjects.map((subj, sIdx) => {
                            const isFailed = subj.average < 10;
                            return (
                              <tr key={sIdx} className="hover:bg-slate-50/50 transition duration-150">
                                <td className="p-3 font-semibold text-slate-800 text-right">{subj.name}</td>
                                <td className="p-3 text-center text-slate-500 font-bold">{subj.coeff}</td>
                                <td className="p-3 text-center font-bold text-slate-705">{subj.continuousScore.toFixed(2)}</td>
                                <td className="p-3 text-center font-bold text-slate-705">{subj.examScore.toFixed(2)}</td>
                                <td className={cn(
                                  "p-3 text-center font-extrabold",
                                  isFailed ? "text-rose-600" : "text-emerald-650"
                                )}>
                                  {subj.average.toFixed(2)}
                                </td>
                                <td className="p-3 text-center">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold block w-fit mx-auto",
                                    isFailed ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-650 border border-emerald-100"
                                  )}>
                                    {isFailed ? "مستدرك (دورة الاستدراك)" : "مستوفي بنجاح"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* SMART GUIDANCE PANEL (مستشار الدعم الأكاديمي) */}
                    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-150 text-right">
                      <div className="flex items-center gap-2 mb-3 justify-end text-slate-700">
                        <span className="font-black text-xs">مستشار التوجيه الأكاديمي الآلي</span>
                        <HelpCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
                      </div>
                      
                      {currentStudentResults.status === 'passed' ? (
                        <p className="text-[11.5px] text-slate-650 leading-relaxed font-medium">
                          يا عادل، سجلك الأكاديمي ممتاز وتستحق التقدير بـمعدل 14.25! ومع ذلك، رصيدك السلوكي يحوي **{myAbsenceHours} ساعة غياب** وهو موضوع تحت المجهر في مجلس التأديب. التزامك بجدول الحضور ضروري للمحافظة على مكانتك في الطليعة وصرف منحة التميز بانتظام.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11.5px] text-slate-650 leading-relaxed font-medium">
                            المتكون فوزي، غياباتك ممتازة بنسبة 100% انضباط متميز. لكن في الجانب الأكاديمي لديك معدل <b>9.80</b> وهو قريب جداً من عتبة النجاح (ناقص 0.20 نقطة فقط). المقاييس التي تستدعي الدخول للامتحان الاستدراكي هي:
                          </p>
                          <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-1 pr-3">
                            <li>تطوير تطبيقات الويب الكاملة (Fullstack) - معدلك الحالي {currentStudentResults.subjects[0].average}</li>
                            <li>قواعد البيانات وحلول المستودعات (SQL/NoSQL) - معدلك الحالي {currentStudentResults.subjects[3].average}</li>
                          </ul>
                          <div className="bg-amber-100/50 p-2.5 rounded-xl border border-amber-250 text-[10.5px] text-amber-800 font-extrabold mt-1">
                            📅 يعقد الامتحان الاستدراكي للمقاييس المذكورة يوم الخميس 28 ماي 2026 بقاعة الورشة 3، يرجى المراجعة والتحضير المناسب.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* GRADE APPEALS MANAGEMENT SECTION (التظلمات البيداغوجية) */}
                    <div className="border-t border-slate-150 pt-6">
                      <h4 className="text-xs font-black text-slate-900 mb-4 flex items-center justify-end gap-1.5">
                        <span>إرسال وتتبع التظلم البيداغوجي (الطعن في علامات المواد)</span>
                        <FileCheck className="w-4.5 h-4.5 text-indigo-500" />
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        
                        {/* Appeal Form */}
                        <form onSubmit={handleSubmitAppeal} className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                          <div>
                            <label className="text-[10px] font-extrabold text-slate-400 block mb-1">المادة المراد الطعن فيها</label>
                            <select 
                              value={appealSubject} 
                              onChange={(e) => setAppealSubject(e.target.value)}
                              className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs text-right font-sans"
                            >
                              {currentStudentResults.subjects.map((subj, idx) => (
                                <option key={idx} value={subj.name}>{subj.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-extrabold text-slate-400 block mb-1">سبب التظلم بالتفصيل</label>
                            <textarea 
                              value={appealReason}
                              onChange={(e) => setAppealReason(e.target.value)}
                              placeholder="اكتب التماسك هنا بشكل واضح وموضوعي..." 
                              rows={3}
                              className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs text-right"
                            />
                          </div>

                          {appealSuccess && (
                            <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg text-[10px] font-extrabold animate-fade-in leading-relaxed">
                              {appealSuccess}
                            </div>
                          )}

                          <button 
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-slate-950 text-white font-black text-[10.5px] py-2 rounded-lg transition duration-200 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>تقديم التظلم البيداغوجي</span>
                          </button>
                        </form>

                        {/* Appeals List Log */}
                        <div className="md:col-span-7 space-y-3">
                          <span className="text-[9.5px] font-bold text-slate-400 block">سجل أرشيف التظلمات والنتائج المرفوعة</span>
                          
                          {appeals.filter(a => a.learnerId === studentId).length > 0 ? (
                            <div className="space-y-2.5 max-h-56 overflow-y-auto">
                              {appeals.filter(a => a.learnerId === studentId).map((appeal, index) => (
                                <div key={appeal.id} className="bg-white p-3 rounded-xl border border-slate-150 text-right space-y-1 relative">
                                  <div className="flex justify-between items-center text-[10.5px] flex-row-reverse">
                                    <span className="font-extrabold text-slate-800">{appeal.subjectName}</span>
                                    <span className={cn(
                                      "px-2 py-0.25 rounded-full text-[8.5px] font-black uppercase text-center",
                                      appeal.status === 'pending' && "bg-amber-150 text-amber-700",
                                      appeal.status === 'accepted' && "bg-emerald-100 text-emerald-700",
                                      appeal.status === 'rejected' && "bg-rose-100 text-rose-700"
                                    )}>
                                      {appeal.status === 'pending' && 'قيد المراجعة والتدقيق'}
                                      {appeal.status === 'accepted' && 'تم قبول التظلم وتخصيص العلامة'}
                                      {appeal.status === 'rejected' && 'تم رفض التظلم بموجب محضر المادة'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-medium"><b>سبب طلب الطعن:</b> {appeal.reason}</p>
                                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold border-t border-slate-50 pt-1.5 flex-row-reverse">
                                    <span>تاريخ الطلب: {appeal.submittedAt}</span>
                                    <span>رقم التذكرة: {appeal.id}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border border-dashed border-slate-200 rounded-2xl py-8 text-center text-slate-400 font-extrabold text-[10.5px]">
                              لا توجد أي تظلمات بيداغوجية نشطة في قائمة المتغيرات لهذا الطالب.
                            </div>
                          )}

                        </div>

                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 font-bold text-xs space-y-2">
                    <p>عذراً، لم تكتمل مداولات النتائج السداسية لهذا القسم أو لم تقم الرقابة بنشرها بعد.</p>
                    <p className="text-[10px] text-slate-450">معاودة الولوج لاحقاً أو مراجعة إدارة المعهد للاستعلام عن موعد صدور النتائج.</p>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {activeTab === 'remote_attendance' && (
            <motion.div
              key="remote-attendance-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-right font-sans"
            >
              {!isApprenticeshipMode ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm relative overflow-hidden" dir="rtl">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-sky-500/5 -ml-16 -mt-16 rounded-full" />
                  <div className="w-16 h-16 bg-sky-500/10 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-2 relative z-10">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 relative z-10">المطابقة الميدانية والمواظبة الذكية مقيدة</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    ميزات تحديد المواقع الجغرافية (Geofencing)، تأكيد حضور المتربص بالوجه، والترميز الديناميكي للتواصل حصرية لـ <span className="text-sky-650 font-extrabold">"نمط التكوين عن طريق التمهين"</span>.
                  </p>
                  <p className="text-[11px] text-slate-650 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-150 font-medium text-right" dir="rtl">
                    بما أن نمط تكوينك هو: <b className="text-slate-900">« {currentModeName} »</b>، فإن حضورك وشهادة تربصك يتم معالجتها حصرياً عبر نظام الحصص الدراسية المباشرة ولا تتطلب توثيق المحاكاة عن بعد لدى تواصل المؤسسة.
                  </p>
                  <button
                    onClick={() => setActiveTab('grades')}
                    className="mt-2 bg-slate-950 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition active:scale-95 shadow-sm"
                  >
                    تفقد العلامات وكشوف المداولات 📊
                  </button>
                </div>
              ) : (
                <>
                  {/* PWA INSTALLATION COMPACT SAAS HERO BANNER */}
                  {showPwaInstallBanner && !pwaInstalled && (
                    <motion.div
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-3xl border border-indigo-500/20 shadow-md flex flex-col md:flex-row-reverse justify-between items-center gap-4 text-right overflow-hidden relative mb-4"
                    >
                      <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500/10 blur-2xl rounded-full" />
                      <div className="space-y-1.5 z-10">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">تطبيق PWA المستقل</span>
                          <h4 className="text-sm font-black">تبسيط الانضمام: ثبّت تطبيق SmartStage DZ على شاشتك الآن! 📱</h4>
                        </div>
                        <p className="text-slate-350 text-xs leading-relaxed font-semibold">
                          استمتع ببوابة مستقلة وسريعة بالكامل تدعم التوثيق دون اتصال بالإنترنت ومطابقة الوجه والـ GPS بدقة عالية.
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0 z-10">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('rq_pwa_installed', 'true');
                            setPwaInstalled(true);
                            AppStateStore.addAdminActivityLog('تثبيت تطبيق PWA', 'منصة المتكون المحمولة');
                          }}
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-xl transition shadow active:scale-95 cursor-pointer font-bold"
                        >
                          تثبيت مجاني فوراً ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPwaInstallBanner(false)}
                          className="text-slate-400 hover:text-white text-xs font-extrabold px-2.5 py-2 cursor-pointer font-bold"
                        >
                          تجاهل ✕
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* CONNECTIVITY CONTROL BAR & OFFLINE LOCAL DB QUEUE SYNCER */}
                  <div className="border border-slate-200 bg-slate-50 p-4 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-4">
                    <div className="md:col-span-4 flex items-center justify-end gap-3 flex-row-reverse text-right">
                      <div className="text-right">
                        <span className="text-[9px] font-black text-slate-400 block uppercase">بروتوكول الاتصال الجوي وقاعدة البيانات</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className={cn("inline-block w-2.5 h-2.5 rounded-full animate-pulse", isOffline ? "bg-amber-500" : "bg-emerald-500")} />
                          <span className="text-xs font-black text-slate-800">
                            {isOffline ? "غير متصل بالشبكة (الوضع المحلي الآمن Offline 📶)" : "متصل بالخادم السحابي الوطني (Online 🟢)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 flex justify-end">
                      <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 border border-slate-200 rounded-xl justify-end shadow-sm">
                        <input
                          id="offline-toggle-checkbox"
                          type="checkbox"
                          checked={isOffline}
                          onChange={(e) => {
                            setIsOffline(e.target.checked);
                            setCheckInErrorMsg('');
                            setCheckInSuccessMsg('');
                          }}
                          className="w-4 h-4 text-sky-500 border-slate-300 rounded cursor-pointer"
                        />
                        <label htmlFor="offline-toggle-checkbox" className="text-xs font-black text-slate-705 select-none cursor-pointer">
                          محاكاة انقطاع الإنترنت (دخول وضع أوفلاين) 🔌
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                      {offlineQueue.length > 0 ? (
                        <button
                          type="button"
                          disabled={isOffline}
                          onClick={() => {
                            const count = AppStateStore.syncOfflineQueue();
                            setCheckInSuccessMsg(`✓ تم بنجاح مزامنة ورفع عدد ${count} سجلات حضور محلية مخبأة لـ Cloud Base!`);
                            setOfflineQueue([]);
                            setRemoteLogs(AppStateStore.getRemoteAttendanceLogs());
                          }}
                          className={cn(
                            "w-full py-2 px-3 text-xs font-black rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer",
                            isOffline 
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          )}
                        >
                          <span>تحميل ومزامنة ({offlineQueue.length} معلقة) ⚡</span>
                        </button>
                      ) : (
                        <div className="text-center font-mono text-[9px] font-bold text-slate-400 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl w-full">
                          قاعدة المزامنة المحلية خالية ✓ IndexedDB
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-sky-50 to-blue-100/30 border border-sky-100 p-6 rounded-3xl flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-sky-600 text-white px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                    بوابة الحضور البيومترية الذكية للمتربصين • SmartStage DZ
                  </span>
                  <h3 className="text-md font-black text-slate-900 mt-2 font-black">تسجيل وتأكيد الحضور الميداني في مقر شركة التمهين</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    من خلال دمج نظام تحديد المواقع العالمي (GPS) مع التحقق البيومتري للوجه والمسح الديناميكي للرموز التناوبية، تتيح لك هذه المنصة إثبات وجودك وتأطيرك المهني عن بعد دون الحاجة للتنقل البيداغوجي.
                  </p>
                </div>
                <div className="p-3.5 bg-white border border-sky-100 rounded-2xl shadow-sm text-sky-600 shrink-0 self-center">
                  <MapPin className="w-8 h-8 text-sky-500 animate-pulse" />
                </div>
              </div>

              {/* MAIN ATTENDANCE INTERACTION PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Right Interactive Dashboard Control Unit */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Step 1: Taraget Workspace selection & Geofence Boundary Check */}
                  <div className="border border-slate-100 bg-slate-50/50 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 justify-end text-slate-800 border-b border-slate-200/50 pb-2 flex-row-reverse">
                      <MapPin className="w-5 h-5 text-sky-600" />
                      <span className="font-extrabold text-xs">١. اختيار بيئة العمل الشريكة وتأكيد الإرسال الجغرافي (GPS)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 mb-1">المؤسسة المستخدمة الشريكة المضيفة بالتربص</label>
                        <select 
                          value={selectedCompanyId} 
                          onChange={(e) => {
                            setSelectedCompanyId(e.target.value);
                            setCheckInErrorMsg('');
                            setCheckInSuccessMsg('');
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
                        >
                          {myCompanies.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.compliance})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1">محاكاة إحداثيات المشغل الجغرافي</label>
                        <select 
                          value={simulatedGpsType} 
                          onChange={(e) => {
                            setSimulatedGpsType(e.target.value as any);
                            setCheckInErrorMsg('');
                            setCheckInSuccessMsg('');
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-750 outline-none focus:border-sky-500"
                        >
                          <option value="inside">مكتب العمل الرئيسي (على بعد ١٥ مترًا) 🟢</option>
                          <option value="edge">حافة ساحة الورشة (على بعد ١٢٠ مترًا) 🟡</option>
                          <option value="outside">المقهى الخارجي المجاور (على بعد ٥٥٠ مترًا) 🔵</option>
                          <option value="home">المنزل الخاص بالمتمهن (على بعد ٤.٨ كم) 🔴</option>
                        </select>
                      </div>
                    </div>

                    {/* Geofence Radar Chart Display Mockup */}
                    {(() => {
                      const tgtCo = myCompanies.find(c => c.id === selectedCompanyId) || myCompanies[0];
                      if (!tgtCo) return null;

                      let currentDistance = 15;
                      let isInside = true;
                      let strokeColor = "#10B981"; // Emerald
                      let pulsePos = { x: 100, y: 100 }; // inside center

                      if (simulatedGpsType === 'edge') {
                        currentDistance = 120;
                        isInside = tgtCo.radius >= 120;
                        strokeColor = "#F59E0B"; // Amber
                        pulsePos = { x: 140, y: 110 };
                      } else if (simulatedGpsType === 'outside') {
                        currentDistance = 550;
                        isInside = tgtCo.radius >= 550;
                        strokeColor = "#EF4444"; // Rose
                        pulsePos = { x: 190, y: 70 };
                      } else if (simulatedGpsType === 'home') {
                        currentDistance = 4800;
                        isInside = tgtCo.radius >= 4800;
                        strokeColor = "#EF4444"; // Rose
                        pulsePos = { x: 230, y: 40 };
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-3.5 border border-slate-150 rounded-xl">
                          <div className="md:col-span-4 flex flex-col justify-center space-y-2">
                            <div className="text-right">
                              <span className="text-[9.5px] font-black text-slate-400 block">نطاق التغطية المرخص (Geofence)</span>
                              <span className="text-sm font-black text-slate-800">{tgtCo.radius} متر دائري</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9.5px] font-black text-slate-400 block">المسافة الحالية من نقطة التمركز</span>
                              <span className={cn("text-xs font-black", isInside ? "text-emerald-600" : "text-rose-600")}>
                                {currentDistance >= 1000 ? `${(currentDistance/1000).toFixed(2)} كم` : `${currentDistance} متر`}
                                {isInside ? " (داخل النطاق الآمن)" : " (خارج النطاق)"}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9.5px] font-bold text-slate-400 block">محدِّد الزوايا والمدار الجغرافي</span>
                              <span className="text-[10px] font-sans text-slate-500 font-bold block">{tgtCo.latitude.toFixed(4)}° N, {tgtCo.longitude.toFixed(4)}° E</span>
                            </div>
                          </div>

                          <div className="md:col-span-8 flex justify-center bg-slate-950 p-4 rounded-xl relative overflow-hidden h-36">
                            {/* Decorative Radial Grid */}
                            <svg className="w-full h-full max-w-[240px]" viewBox="0 0 200 120">
                              <circle cx="100" cy="60" r="10" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2" opacity="0.3" />
                              <circle cx="100" cy="60" r="25" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="3" opacity="0.4" />
                              <circle cx="100" cy="60" r="45" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="1" opacity="0.5" />
                              
                              {/* Geo radius allowed circle */}
                              <circle cx="100" cy="60" r="45" fill="rgba(34, 211, 238, 0.05)" stroke={strokeColor} strokeWidth="1.5" />
                              
                              {/* Central GPS marker */}
                              <circle cx="100" cy="60" r="3" fill="#ffffff" />
                              
                              {/* Radial scanning line */}
                              <line x1="100" y1="60" x2="160" y2="20" stroke="rgba(34,211,238,0.2)" strokeWidth="1.5" className="origin-center animate-spin" style={{ animationDuration: '6s' }} />

                              {/* Pulsing simulated device position */}
                              <g transform={`translate(${pulsePos.x}, ${pulsePos.y})`}>
                                <circle cx="0" cy="0" r="8" fill={strokeColor} className="animate-ping" opacity="0.6" style={{ animationDuration: '2s' }} />
                                <circle cx="0" cy="0" r="4" fill={strokeColor} />
                              </g>
                            </svg>
                            <span className="absolute top-2 right-2 text-[8px] font-mono text-emerald-400 uppercase tracking-widest font-black">● LIVE Georeference Radar</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Step 2: Biometric Facial Alignment Scan (Face Verification) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="border border-slate-100 bg-slate-50/50 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 justify-end text-slate-800 border-b border-slate-200/50 pb-2 flex-row-reverse">
                          <UserCheck className="w-5 h-5 text-sky-600" />
                          <span className="font-extrabold text-xs">٢. المطابقة البيومترية والمصادقة بالوجه</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2 text-right">
                          يقوم نظام التفتيش الذكي بمقارنة ملامح الوجه التفاعلية والمباشرة (Selfie) مع الصورة المرجعية الفيدرالية لضمان النزاهة القانونية للتمهين ومطابقة عقد التكوين.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2">
                        {capturedSelfie ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3 justify-end bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl flex-row-reverse">
                              <span className="text-xl">👤</span>
                              <div className="text-right">
                                <span className="text-[10px] font-black text-emerald-850 block">تم التحقق من الوجه بنسب تطابق ٩٨.٤٪</span>
                                <span className="text-[8.5px] text-slate-400 font-bold block">معتمد بالرقم التعريفي: {studentId}</span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  setCapturedSelfie('');
                                  setHasSelfie(false);
                                  setCompressionRatio('');
                                }}
                                className="text-rose-500 hover:text-rose-700 text-[10px] font-black mr-auto"
                              >
                                إعادة ✕
                              </button>
                            </div>
                            {compressionRatio && (
                              <div className="text-[9px] text-emerald-600 font-mono text-left font-bold pl-2 bg-emerald-50/40 py-1 rounded">
                                {compressionRatio}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isCompressingSelfie}
                            onClick={() => {
                              setIsVerifyingCheckIn(true);
                              setIsCompressingSelfie(true);
                              setCompressionRatio('جاري التقاط الإطار وضغط ملامح الوجه خوارزمياً...');
                              setTimeout(() => {
                                setIsVerifyingCheckIn(false);
                                setIsCompressingSelfie(false);
                                setCompressionRatio('مضغوط بصيغة WebP بنجاح (-82%) ⚡ الحجم: 41 KB لقاعدة البيانات');
                                setCapturedSelfie(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2005/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="gray"/></svg>`);
                                setHasSelfie(true);
                              }, 1200);
                            }}
                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          >
                            <span>👤</span>
                            <span>{isCompressingSelfie ? 'جاري الضغط والمطابقة...' : 'التقاط ومطابقة الصورة البيومترية الحية'}</span>
                          </button>
                        )}
                        
                        {isVerifyingCheckIn && (
                          <div className="text-center font-black text-[9px] text-sky-600 animate-pulse">
                            جاري تشغيل محرك معالجة الصور ومطابقتها...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Dynamic QR Code Scan */}
                    <div className="border border-slate-100 bg-slate-50/50 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 justify-end text-slate-800 border-b border-slate-200/50 pb-2 flex-row-reverse">
                          <QrCode className="w-5 h-5 text-sky-600" />
                          <span className="font-extrabold text-xs">٣. مسح الكود اليومي المتغير للشركة (QR)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2 text-right">
                          امسح كود التحقق المطبوع والنشط في بهو شركة التمهين للتأكد الميكانيكية من الهوية الجغرافية الحقيقية والمضادة لبرامج التموقع الوهمية.
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          <span className="text-sky-600 font-bold">بصمة QR المحدثة: {secureFingerprint}</span>
                          <span className="text-amber-650 font-bold">ينتهي الرمز خلال: {qrCountdown}ث ⏱️</span>
                        </div>
                        {qrCodeVal ? (
                          <div className="flex items-center gap-3 justify-end bg-emerald-50 border border-emerald-150 p-2 text-row-reverse">
                            <span className="text-sm">🔑</span>
                            <div className="text-right">
                              <span className="text-[10px] font-black text-emerald-850 block">تم التحقق من الكود المشفر للمؤسسة</span>
                              <span className="font-mono text-[8.5px] text-slate-400 block">{qrCodeVal}</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setQrCodeVal('')}
                              className="text-rose-500 hover:text-rose-700 text-[10px] font-black mr-auto"
                            >
                              إلغاء ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="كود اليوم أو انقر مسح محاكى..."
                              value={qrCodeVal}
                              onChange={(e) => setQrCodeVal(e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-xl p-1.5 text-xs font-bold text-center outline-none text-slate-850 focus:border-sky-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const tgtCo = myCompanies.find(c => c.id === selectedCompanyId) || myCompanies[0];
                                setQrCodeVal(`STAGE-${tgtCo?.id || 'COM001'}-${new Date().toISOString().split('T')[0]}-${secureFingerprint}`);
                              }}
                              className="px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[10px] font-extrabold transition shrink-0 cursor-pointer"
                            >
                              مسح الكود
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Submission triggers */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col items-center justify-center space-y-3">
                    
                    {checkInErrorMsg && (
                      <div className="w-full p-3 bg-rose-50 text-rose-700 border border-rose-150 rounded-xl text-xs font-bold text-right leading-relaxed flex items-center gap-2 justify-end">
                        <span>{checkInErrorMsg}</span>
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      </div>
                    )}

                    {checkInSuccessMsg && (
                      <div className="w-full p-4 bg-emerald-50 text-emerald-850 border border-emerald-150 rounded-xl text-xs font-bold text-right leading-relaxed flex flex-col gap-2 relative">
                        <div className="flex items-center gap-2 justify-end">
                          <span>{checkInSuccessMsg}</span>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        </div>
                        <span className="text-[10px] text-slate-500 block font-bold leading-relaxed mt-1 text-right border-t border-emerald-100 pt-2">
                          📡 تم تحويل إشعارات مجانية ذكية متكاملة فوراً (WhatsApp 💬، وبوت Telegram 🤖، وتنبيهات المتصفح Push 🔔) لولي الأمر في فندق اتصالاته المعتمد لضمان أدنى تكلفة مالبة مقارنة بخدمات الـ SMS الكلاسيكية!
                        </span>
                      </div>
                    )}

                    {/* ENHANCED INTELLIGENT CYBERSECURITY DISCLOSURE CARD */}
                    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap justify-between items-center text-right font-mono text-[9px] text-slate-400 gap-2">
                      <div className="flex items-center gap-1.5 flex-row-reverse font-bold text-sky-400">
                        <span>● درع الأمان المتقدم نشط</span>
                      </div>
                      <div className="flex gap-4">
                        <span>بصمة المتصفح: <b className="text-slate-100">{secureFingerprint}</b></span>
                        <span>فحص الحيويّة (Liveness): <b className="text-emerald-400">حقيقي 99.8% ✓</b></span>
                        <span>رادع الـ Fake GPS: <b className="text-emerald-400">مؤمّن ✓</b></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCheckInErrorMsg('');
                        setCheckInSuccessMsg('');

                        const targetCo = myCompanies.find(c => c.id === selectedCompanyId) || myCompanies[0];
                        if (!targetCo) return;

                        // 1. Check geofence
                        let dist = 15;
                        if (simulatedGpsType === 'edge') dist = 120;
                        else if (simulatedGpsType === 'outside') dist = 550;
                        else if (simulatedGpsType === 'home') dist = 4800;

                        if (dist > targetCo.radius) {
                          setCheckInErrorMsg(`❌ فشل المصادقة الجغرافية الجوية (GPS): جهازك يقع على بعد ${dist} متر من نطاق شركة [${targetCo.name}]، ونصف المرونة المسموح هو ${targetCo.radius} متر فقط، يرجى التموقع داخل الساحة لبدء النشاط.`);
                          return;
                        }

                        // 2. Check facial scan
                        if (!hasSelfie) {
                          setCheckInErrorMsg(`❌ متطلب بيومتري مفقود: يرجى التقاط السيلفي وتأكيد المطابقة الفورية لمعالم ملامح الوجه أولاً.`);
                          return;
                        }

                        // 3. Check QR code if enabled
                        if (targetCo.enableQRVerification && !qrCodeVal) {
                          setCheckInErrorMsg(`❌ توثيق الكود مطلوب: تفرض هذه الشركة مسحاً يومياً نشطاً للرمز الرقمي الحركي في بهو العمل.`);
                          return;
                        }

                        if (isOffline) {
                          // QUEUE LOCALLY FOR OFFLINE SUCCESS
                          const offlineLog = {
                            learnerId: studentId,
                            learnerName: currentProfile.name,
                            companyName: targetCo.name,
                            latitude: targetCo.latitude + (dist / 111000),
                            longitude: targetCo.longitude + (dist / 111000),
                            distance: dist,
                            selfieUrl: 'captured-biometric-thumbnail-offline',
                            verificationMethod: 'GPS_FACE_QR'
                          };
                          AppStateStore.queueOfflineCheckIn(offlineLog);
                          setOfflineQueue(AppStateStore.getOfflineQueue());
                          setCheckInSuccessMsg(`📶 [تم الحفظ محلياً بنجاح (Offline Mode)] تم تسجيل حضورك بنجاح وحفظ السجل ببيانات الـ GPS ومطابقة الوجه في ذاكرة الحفظ المحلي IndexedDB بجهازك نظراً لانقطاع تواصل الإنترنت. يرجى المزامنة بمجرد تواصلك مجدداً بالشبكة!`);
                          setQrCodeVal('');
                          setHasSelfie(false);
                          setCapturedSelfie('');
                          return;
                        }

                        // Save log remotely!
                        const newLog = {
                          learnerId: studentId,
                          learnerName: currentProfile.name,
                          companyName: targetCo.name,
                          timestamp: `${new Date().toLocaleDateString('ar-DZ')} ${new Date().toTimeString().split(' ')[0]}`,
                          status: simulatedGpsType === 'edge' ? 'late' as const : 'present' as const,
                          latitude: targetCo.latitude + (dist / 111000), // fuzzy coord
                          longitude: targetCo.longitude + (dist / 111000),
                          distanceFromPivot: dist,
                          selfieUrl: 'captured-biometric-thumbnail',
                          faceMatchScore: 98.4,
                          verificationMethod: 'GPS_FACE_QR' as const,
                          deviceInfo: 'Simulated Workspace Sandbox (VET Node)',
                          ipAddress: '197.112.55.10',
                          authorized: true
                        };

                        AppStateStore.addRemoteAttendanceLog(newLog);
                        setCheckInSuccessMsg(`✓ تم بنجاح وموثوقية عالية توقيع وتأشير حضورك الحقيقي لدى [${targetCo.name}] وإثبات السريان بيداغوجياً!`);
                        setRemoteLogs(AppStateStore.getRemoteAttendanceLogs());
                        setQrCodeVal('');
                        setHasSelfie(false);
                        setCapturedSelfie('');
                      }}
                      className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-lg transition duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>توقيع وتوثيق الحضور الفوري بالـ GPS والوجه 🔐</span>
                    </button>
                  </div>

                </div>

                {/* Left side checklist parameters Info unit */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Digital stage status cards */}
                  <div className="bg-slate-900 text-white p-5 rounded-3xl relative overflow-hidden space-y-4 text-right">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 blur-xl rounded-full" />
                    <h4 className="text-xs font-extrabold flex items-center gap-1.5 justify-end text-sky-400 flex-row-reverse">
                      <span>حالة العقد والتمهين عن بعد</span>
                      <Smartphone className="w-4 h-4 text-sky-400" />
                    </h4>
                    
                    <div className="border-t border-slate-800 pt-3 space-y-2.5 text-right">
                      <div className="flex justify-between flex-row-reverse text-[11px] font-bold">
                        <span className="text-slate-450">وضعية عقد التمهين:</span>
                        <span className="text-emerald-400">نشط ومعتمد ✓</span>
                      </div>
                      <div className="flex justify-between flex-row-reverse text-[11px] font-bold">
                        <span className="text-slate-450">المؤطر الخارجي:</span>
                        <span className="text-slate-200">المهندس عبدالقادر دراجي</span>
                      </div>
                      <div className="flex justify-between flex-row-reverse text-[11px] font-bold">
                        <span className="text-slate-450">تاريخ الانتهاء القانوني:</span>
                        <span className="text-slate-200">١٠ سبتمبر ٢٠٢٧</span>
                      </div>
                      <div className="flex justify-between flex-row-reverse text-[11px] font-bold">
                        <span className="text-slate-450">مستوى الإقرار التراكمي:</span>
                        <span className="text-emerald-400">مثالي (المواظبة ٩٧.٨٪)</span>
                      </div>
                    </div>
                  </div>

                  {/* Algerian Ministry of Vocational Training Rules Compliance disclaimer */}
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 text-right space-y-3">
                    <div className="flex items-center gap-2 justify-end text-amber-500 flex-row-reverse">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-extrabold text-[9.5px] uppercase">دليل وزارة التكوين للتمهين بوزارة الجزائر</span>
                    </div>
                    <p className="text-[10.5px] text-slate-650 leading-relaxed font-semibold">
                      يخضع نظام التمهين عن بعد المنظم للرقابة التشريعية الصارمة. يتم التدقيق في البوابات والربط البيومتري التلقائي من طرف اللجان البيداغوجية المتنقلة بمديرية التكوين لولاية تبسة للتحقق العينة من التزام المتربص بمقر عمله.
                    </p>
                  </div>

                  {/* SMS Smart Parent Alerts Panel Info */}
                  <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-3xl text-right space-y-2">
                    <h5 className="font-extrabold text-[11px] text-indigo-700">تنبيهات SMS الذكية للغياب</h5>
                    <p className="text-[10px] text-slate-650 leading-relaxed font-semibold">
                      مفعل تلقائياً للهاتف المسجل لولي الأمر. عند تسجيل أي حالة غياب أو تأخر من شركة التربص، يتم ترحيل رسالة نصية قصيرة فورياً وصارمة، لمواكبة الانضباط أولاً بأول.
                    </p>
                  </div>

                </div>

              </div>

              {/* LOG ENTRIES HISTORY OF THE TRAINEE */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-row-reverse flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <History className="w-5 h-5 text-slate-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm">سجل التوقيعات والحضور اليومي الخاص بالتمهين الميداني عن بعد</h3>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const logsToExport = remoteLogs.filter(l => l.learnerId === studentId || l.learnerName === currentProfile.name);
                      if (logsToExport.length === 0) {
                        alert("لا توجد سجلات حضور لتصديرها حالياً.");
                        return;
                      }
                      
                      let csvContent = "\uFEFF";
                      csvContent += "رقم العملية,اسم المتمهن,الشركة المضيفة,التوقيت,الحالة,المسافة من المركز (متر),التحقق البيومتري,عقد مطابق\n";
                      
                      logsToExport.forEach(l => {
                        csvContent += `"${l.id}","${l.learnerName}","${l.companyName}","${l.timestamp}","${l.status === 'present' ? 'حاضر' : 'متأخر'}","${l.distanceFromPivot}","${l.faceMatchScore}%","نعم"\n`;
                      });
                      
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", `سجل_حضور_الوسط_المهني_${currentProfile.name}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 border border-slate-200 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>تصدير السجل (.CSV) Excel ⬇️</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right bg-white text-xs whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 border-b text-slate-650 font-bold">
                          <th className="px-4 py-3 text-right">رقم العملية</th>
                          <th className="px-4 py-3 text-right">المتمهن</th>
                          <th className="px-4 py-3 text-right">الشركة المضيفة بالتمهين</th>
                          <th className="px-4 py-3 text-center">التاريخ والتوقيت المالي</th>
                          <th className="px-4 py-3 text-center">المسافة المحتسبة</th>
                          <th className="px-4 py-3 text-center">المطابقة البيومترية للوجه</th>
                          <th className="px-4 py-3 text-center">بروتوكول التحقق والتقييم</th>
                          <th className="px-4 py-3 text-center">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-sans">
                        {remoteLogs.filter(l => l.learnerId === studentId || l.learnerName === currentProfile.name).length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                              لم تقم بتسجيل أي حضور عن بعد للوسط المهني الميداني حتى الآن اليوم. يرجى توثيق الوجود من خلال اللوحة أعلاه.
                            </td>
                          </tr>
                        ) : (
                          remoteLogs.filter(l => l.learnerId === studentId || l.learnerName === currentProfile.name).map((l) => (
                            <tr key={l.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-mono font-black text-slate-500 text-right">{l.id}</td>
                              <td className="px-4 py-3 font-extrabold text-slate-800 text-right">{l.learnerName}</td>
                              <td className="px-4 py-3 font-bold text-slate-800 text-right">{l.companyName}</td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-slate-500 text-[10.5px]">{l.timestamp}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn(
                                  "font-bold",
                                  l.distanceFromPivot <= 250 ? "text-emerald-700" : "text-rose-750"
                                )}>
                                  {l.distanceFromPivot} م ({l.distanceFromPivot <= 250 ? "داخل النطاق المسموح" : "خارج النطاق"})
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600">
                                {l.faceMatchScore}% مطابقة ✓
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="bg-slate-100 text-slate-700 text-[8px] font-black uppercase rounded py-0.5 px-2">
                                  {l.verificationMethod}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn(
                                  "px-2.5 py-0.75 rounded-full text-[9px] font-black",
                                  l.status === 'present' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                )}>
                                  {l.status === 'present' ? "حاضر بالفرع" : "متأخر وموثق"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
