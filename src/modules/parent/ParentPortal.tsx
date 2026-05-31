import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BellRing, 
  LineChart, 
  GraduationCap, 
  MessageSquareCode, 
  AlertTriangle,
  History,
  CheckCircle2,
  Download,
  FileText,
  X,
  Award,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Fingerprint,
  Upload,
  Trash2,
  Clock,
  BookOpen,
  ShieldAlert,
  Briefcase,
  Smartphone,
  MapPin,
  Compass,
  Building2,
  RotateCw,
  Camera
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppStateStore } from '../../services/store';
import { useLocation } from 'react-router-dom';

export default function ParentPortal() {
  // Get logged-in parent student data or fallback to defaults
  const studentId = localStorage.getItem('rq_parent_logged_student_id') || 'L-01';
  const studentName = localStorage.getItem('rq_parent_logged_student_name') || 'علوي معمر عادل';
  const groupId = localStorage.getItem('rq_parent_logged_group_id') || 'GP-WEB-1';

  const groups = AppStateStore.getGroups();
  const activeGroup = groups.find(g => g.id === groupId) || groups[0] || {
    id: 'GP-WEB-1',
    name: 'تطوير الويب الكامل',
    code: 'WF-WEB-2024',
    guardian: 'أ. دليلة طهراوي',
    level: 'تقني متخصص (TS)',
    duration: 'سنتين',
    learners: [{ id: 'L-01', name: 'علوي معمر عادل', gender: 'M', status: 'active' }]
  };

  const student = activeGroup.learners.find(l => l.id === studentId) || {
    id: 'L-01',
    name: studentName,
    gender: 'M',
    status: 'active'
  };

  const [sessions, setSessions] = useState(() => AppStateStore.getSessions().filter(s => s.groupId === activeGroup.id));
  const referrals = AppStateStore.getDisciplinaryReferrals().filter(r => r.learnerId === student.id);
  const institution = AppStateStore.getInstitutionInfo();
  const instWord = institution.type === 'center' ? 'المركز' : 'المعهد';
  const instPrefix = institution.type === 'center' ? 'مركز' : 'معهد';

  // Calendar translation options (for reports preview)
  const currentMonthArabic = new Date().toLocaleString('ar-DZ', { month: 'long' });
  const currentYear = new Date().getFullYear();

  // Calculate real metrics
  let totalPresence = 0;
  let totalAbsences = 0;
  let totalLates = 0;
  let totalExcused = 0;
  let totalAbsenceHours = 0;

  sessions.forEach(s => {
    const status = s.attendanceMap[student.id];
    if (status === 'present') {
      totalPresence++;
    } else if (status === 'absent') {
      totalAbsences++;
      totalAbsenceHours += (s.duration || 2);
    } else if (status === 'late') {
      totalLates++;
    } else if (status === 'excused') {
      totalExcused++;
    }
  });

  // Dynamic social behavior index calculations
  // Base is 100%, subtract dynamic disciplinary impacts
  const behaviorDeduction = (referrals.length * 15) + (totalLatesCount() * 2);
  const calculatedBehaviorIndex = Math.max(50, 100 - behaviorDeduction);
  
  function totalLatesCount() {
    return totalLates;
  }

  // Calculate equivalent days based on the internal regulations weight (0.25 day per hour of absence)
  const equivDays = totalAbsenceHours * 0.25;

  // Calculate standard stability letter rating based on days of absence
  let stabilityGrade = 'A+';
  let stabilityLabel = 'حالة ممتازة وانضباط مثالي (بدون غيابات)';
  let progressColorClass = 'bg-emerald-500';

  if (equivDays >= 20) {
    stabilityGrade = 'F';
    stabilityLabel = 'إقصاء نهائي وشطب بيداغوجي (تجاوز عتبة 20 يوماً غياب مجزأة)';
    progressColorClass = 'bg-rose-600';
  } else if (equivDays >= 10) {
    stabilityGrade = 'D';
    stabilityLabel = 'توبيخ رسمي وإنذار ثانٍ - إحالة للمجلس التأديبي (بلغ 10 أيام غياب)';
    progressColorClass = 'bg-red-500';
  } else if (equivDays > 3) {
    stabilityGrade = 'C';
    stabilityLabel = 'عقوبة الإنذار الأول البيداغوجي (تجاوز عتبة 3 أيام غياب)';
    progressColorClass = 'bg-amber-500';
  } else if (equivDays > 0) {
    stabilityGrade = 'B';
    stabilityLabel = 'تنبيه أول غيابات - غيابات طفيفة دون عتبة الإنذار (أقل من 3 أيام)';
    progressColorClass = 'bg-sky-500';
  }

  // State to manage the highly interactive preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'grades' | 'referrals' | 'professional'>(() => {
    if (location.pathname.includes('/professional')) {
      return 'professional';
    }
    return 'overview';
  });

  // Keep tab state synchronized with direct sidebar navigations
  React.useEffect(() => {
    if (location.pathname.includes('/professional')) {
      setActiveTab('professional');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  // SMS Alerts States
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [guardianPhone, setGuardianPhone] = useState('+213 6 55 98 12 34');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhoneVal, setNewPhoneVal] = useState('+213 6 55 98 12 34');
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [smsTestSuccess, setSmsTestSuccess] = useState('');

  // Workplace Attendance states
  const [visitRequestSuccess, setVisitRequestSuccess] = useState('');
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [workplaceNotes, setWorkplaceNotes] = useState('');
  const [showWorkplaceSuccessMsg, setShowWorkplaceSuccessMsg] = useState('');

  // State-driven sessions and appeals
  const [appeals, setAppeals] = useState(() => AppStateStore.getGradeAppeals().filter(a => a.learnerId === student.id));

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() => {
    const activeSessions = AppStateStore.getSessions().filter(s => s.groupId === activeGroup.id);
    return activeSessions.length > 0 ? activeSessions[0].id : null;
  });

  // Form states for appeal
  const [appealSubject, setAppealSubject] = useState('');
  const [appealReason, setAppealReason] = useState('');
  const [appealSuccess, setAppealSuccess] = useState('');

  // Handler to upload document justification
  const handleUploadJustification = (sessionId: string, learnerId: string, fileName: string) => {
    const allSessions = AppStateStore.getSessions();
    const idx = allSessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      const sess = { ...allSessions[idx] };
      const justifications = sess.justifications ? { ...sess.justifications } : {};
      justifications[learnerId] = fileName;

      const attendanceMap = { ...sess.attendanceMap };
      if (attendanceMap[learnerId] === 'absent') {
        attendanceMap[learnerId] = 'excused';
      }

      const updatedSess = {
        ...sess,
        justifications,
        attendanceMap
      };

      AppStateStore.submitSession(updatedSess);

      // Update state
      const refinedSessions = AppStateStore.getSessions().filter(s => s.groupId === activeGroup.id);
      setSessions(refinedSessions);
    }
  };

  const handleRemoveJustification = (sessionId: string, learnerId: string) => {
    const allSessions = AppStateStore.getSessions();
    const idx = allSessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      const sess = { ...allSessions[idx] };
      const justifications = sess.justifications ? { ...sess.justifications } : {};
      delete justifications[learnerId];

      const attendanceMap = { ...sess.attendanceMap };
      if (attendanceMap[learnerId] === 'excused') {
        attendanceMap[learnerId] = 'absent';
      }

      const updatedSess = {
        ...sess,
        justifications,
        attendanceMap
      };

      AppStateStore.submitSession(updatedSess);

      const refinedSessions = AppStateStore.getSessions().filter(s => s.groupId === activeGroup.id);
      setSessions(refinedSessions);
    }
  };

  const handleAddAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealSubject || !appealReason.trim()) return;

    AppStateStore.addGradeAppeal({
      learnerId: student.id,
      learnerName: student.name,
      subjectName: appealSubject,
      reason: appealReason
    });

    setAppealSubject('');
    setAppealReason('');
    setAppealSuccess(`تم إرسال طعنك بنجاح وسيتم معالجته من طرف المجلس البيداغوجي لـ ${instWord} في أقرب الآجال!`);

    // Refresh list
    setAppeals(AppStateStore.getGradeAppeals().filter(a => a.learnerId === student.id));

    setTimeout(() => {
      setAppealSuccess('');
    }, 5000);
  };

  // Generate dynamic timelines - merge custom logs with any actual session data for completeness
  const defaultLogs = [
    { time: '08:15', date: 'اليوم', event: 'تسجيل دخول بيومتري (البوابة 2)', location: 'القطاع الرئيسي A', status: 'ok' },
    { time: '12:00', date: 'اليوم', event: `تحديد حضور بالفصل: ${activeGroup.name}`, location: 'قاعة المحاضرات المركزية', status: 'ok' },
  ];

  // If we have actual real session entries, override/prepend to show live platform tracking
  const liveLogs = sessions.map(s => {
    const status = s.attendanceMap[student.id];
    return {
      time: s.sessionPeriod || '08:00',
      date: s.date,
      event: status === 'present' ? 'تحديد حضور آمن للحصة الدراسية' : 
             status === 'absent' ? 'رصد حالة غياب كاملة عن الحصة' :
             status === 'late' ? 'تسجيل متأخر للحصة الدراسية مبرمج' : 'تأكيد غياب بعذر مقبول بيداغوجياً',
      location: `حصة نوع: ${s.sessionType === 'theory' ? 'نظري' : 'تطبيقي'} • ${activeGroup.name}`,
      status: status === 'present' || status === 'excused' ? 'ok' : 'fail'
    };
  });

  const mergedLogs = liveLogs.length > 0 ? liveLogs.slice(0, 4) : defaultLogs;

  const handlePrint = () => {
    setIsPreviewOpen(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header with Arabic branding and document export */}
      <div className="flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 justify-end">
            <span>بوابة فضاء الأولياء والرقابة الآلية</span>
            <span className="text-amber-500">🎓</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">تتبع مباشر وحصري للحالة التفصيلية وسيرة المتربص: <strong className="text-amber-600 font-sans">{student.name} ({activeGroup.code})</strong></p>
        </div>
        
        {/* PDF Export trigger button */}
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>تحميل التقرير الشهري الموثق بالختم القانوني (PDF)</span>
        </button>
      </div>

      {/* PREMIUM MULTI-TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 gap-2 mb-6 overflow-x-auto flex-row-reverse pb-1">
        <button
          id="tab-overview"
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-5 py-3 text-xs font-black transition-all border-b-2 rounded-t-xl cursor-pointer shrink-0 flex items-center gap-2 flex-row-reverse",
            activeTab === 'overview' 
              ? "border-amber-500 text-amber-600 bg-amber-50/20" 
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          <LineChart className="w-4 h-4" />
          <span>لوحة التحكم والمتابعة العامة</span>
        </button>
        <button
          id="tab-attendance"
          onClick={() => setActiveTab('attendance')}
          className={cn(
            "px-5 py-3 text-xs font-black transition-all border-b-2 rounded-t-xl cursor-pointer shrink-0 flex items-center gap-2 flex-row-reverse",
            activeTab === 'attendance'
              ? "border-amber-500 text-amber-600 bg-amber-50/20" 
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>دفتر الغيابات الرقمي للفوج</span>
          {sessions.some(s => s.attendanceMap[student.id] === 'absent') && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>
        <button
          id="tab-grades"
          onClick={() => {
            setActiveTab('grades');
            setAppeals(AppStateStore.getGradeAppeals().filter(a => a.learnerId === student.id));
          }}
          className={cn(
            "px-5 py-3 text-xs font-black transition-all border-b-2 rounded-t-xl cursor-pointer shrink-0 flex items-center gap-2 flex-row-reverse",
            activeTab === 'grades'
              ? "border-amber-500 text-amber-600 bg-amber-50/20" 
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          <span>كشف النقاط والدفتر المدرسي</span>
        </button>
        <button
          id="tab-referrals"
          onClick={() => setActiveTab('referrals')}
          className={cn(
            "px-5 py-3 text-xs font-black transition-all border-b-2 rounded-t-xl cursor-pointer shrink-0 flex items-center gap-2 flex-row-reverse",
            activeTab === 'referrals'
              ? "border-amber-500 text-amber-600 bg-amber-50/20" 
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>الاستدعاءات والمجلس التأديبي</span>
          {referrals.length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.25 rounded-full">{referrals.length}</span>
          )}
        </button>
        <button
          id="tab-professional"
          onClick={() => setActiveTab('professional')}
          className={cn(
            "px-5 py-3 text-xs font-black transition-all border-b-2 rounded-t-xl cursor-pointer shrink-0 flex items-center gap-2 flex-row-reverse",
            activeTab === 'professional'
              ? "border-amber-500 text-amber-600 bg-amber-50/20" 
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          <Briefcase className="w-4 h-4 text-emerald-500" />
          <span>متابعة حضور الوسط المهني</span>
          <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">تتبع عن بعد</span>
        </button>
      </div>

      {/* TAB CONTENT GRID SWITCHER */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            
            {/* Dynamic analytics with live score computation */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-right">
              <div className="flex items-center justify-between mb-8 flex-row-reverse border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#0F172A] tracking-tight flex items-center gap-2 uppercase tracking-widest">
                  تحليلات السلوك والانضباط الشهري
                  <LineChart className="w-4 h-4 text-amber-500" />
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">تحديث فوري وآمن للمجلس</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-right space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مؤشر الاستقرار والمواظبة العامة</p>
                  <div className="flex items-end gap-2 flex-row-reverse justify-start">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{stabilityGrade}</span>
                    <span className={cn(
                      "text-xs font-black px-2 py-0.5 rounded-full",
                      stabilityGrade === 'A+' ? "bg-emerald-50 text-emerald-700" :
                      stabilityGrade === 'B' ? "bg-sky-50 text-sky-700" :
                      stabilityGrade === 'C' ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                    )}>{stabilityLabel}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 mt-4 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all", progressColorClass)} style={{ width: `${Math.max(5, 100 - (equivDays * 5))}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-normal">مجموع غيابات الطالب المسجلة: <b className="text-rose-600 font-extrabold font-sans">{totalAbsenceHours} ساعة</b> (أي ما يعادل: <b className="text-slate-900 font-black font-sans">{equivDays.toFixed(1)} يوماً</b> غياب مكافئ طبقاً للنظام الداخلي المعتمد).</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-right space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مؤشر السلوك والمواظبة الأخلاقية</p>
                  <div className="flex items-end gap-2 flex-row-reverse justify-start">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{calculatedBehaviorIndex}%</span>
                    <span className={cn(
                      "text-xs font-black px-2 py-0.5 rounded-full",
                      calculatedBehaviorIndex >= 90 ? "bg-emerald-50 text-emerald-700" :
                      calculatedBehaviorIndex >= 70 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                    )}>
                      {calculatedBehaviorIndex >= 90 ? 'سلوك سوي مثالي' : calculatedBehaviorIndex >= 70 ? 'ملاحظات انضباط خفيفة' : 'مخالفات متكررة مبرمجة'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all animate-pulse" style={{ width: `${calculatedBehaviorIndex}%` }} />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">مجموع توجيهات عقوبات الإجراءات والمجالس التأديبية: <b className="text-[#0F172A] font-black">{referrals.length} إحالات قانونية</b></p>
                </div>
              </div>
            </div>

            {/* Timeline block */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden text-right">
              <h3 className="text-xs font-black text-[#0F172A] tracking-tight mb-8 flex items-center gap-2 uppercase tracking-widest justify-end">
                سجل التحقق الأكاديمي الحركي المتزامن
                <History className="w-4 h-4 text-amber-500" />
              </h3>
              <div className="space-y-0 relative">
                <div className="absolute right-[17px] top-4 bottom-4 w-px bg-slate-200" />
                {mergedLogs.map((log, i) => (
                  <div key={i} className="flex gap-6 pb-6 relative z-10 flex-row-reverse">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-white shadow-md transition-all duration-300",
                      log.status === 'ok' ? "bg-emerald-500 text-white hover:scale-105" : "bg-red-500 text-white hover:scale-105"
                    )}>
                      {log.status === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl flex-1 border border-slate-100 hover:border-amber-400 transition-all group text-right">
                      <div className="flex justify-between items-start mb-1 flex-row-reverse">
                        <p className="font-extrabold text-slate-800 text-xs group-hover:text-amber-600 transition-colors">{log.event}</p>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter font-sans">{log.date} • {log.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{log.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic side cards & notifications */}
          <div className="space-y-6">
            <div className="bg-amber-400 rounded-2xl p-6 text-[#0F172A] relative overflow-hidden shadow-xl shadow-amber-400/10 transition-transform hover:scale-[1.01] text-right">
              <BellRing className="w-10 h-10 mb-6 opacity-20 float-left" />
              <div className="clear-both"></div>
              <h4 className="text-md font-black mb-2 tracking-tight uppercase">تنبيه الحالة والمواظبة الفوري</h4>
              
              {equivDays > 0 ? (
                <div className="text-[#0F172A]/90 text-[11px] font-bold mb-8 space-y-2 leading-relaxed tracking-tight text-right">
                  <p>
                    بموجب الميثاق والنظام الداخلي لولاية تبسة، رصد النظام غيابات مكافئة تُقدّر بـ <b className="text-rose-900 text-xs font-black font-sans bg-white/50 px-2 py-0.5 rounded">{equivDays.toFixed(1)} يوماً</b> ({totalAbsenceHours} ساعة غياب).
                  </p>
                  {equivDays > 3 ? (
                    <p className="font-extrabold text-rose-950 bg-white/20 p-2 rounded-lg border border-rose-905/10">
                      🚨 عتبة الإنذار: لقد تجاوز المتربص الحد المسموح به (3 أيام) وهو تحت طائلة الإنذارات الرسمية والإعذار بالتزام خطي.
                    </p>
                  ) : (
                    <p className="font-extrabold text-emerald-950 bg-white/20 p-2 rounded-lg border border-emerald-905/10">
                      ⚠️ تنبيه أولي غيابات: المتربص في حدود أقل من 3 أيام غياب، يرجى تزويد الإدارة بالتبريرات اللازمة لتفادي صدور القرار التأديبي.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[#0F172A]/70 text-[11px] font-bold mb-8 leading-relaxed uppercase tracking-tight text-right">
                  المتربص في حالة استقرار مثالي (0 يوم غياب). يثني مدير {instWord} والرقابة العامة على التزام المتكون وسلوكه النموذجي وسيرته الحسنة بـ {instWord}.
                </p>
              )}

              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="w-full bg-[#0F172A] text-white font-black py-3.5 rounded-lg shadow-lg shadow-[#0F172A]/20 hover:bg-slate-800 transition-all text-[10px] uppercase tracking-widest text-center cursor-pointer"
              >
                مراجعة وتصدير الكشف الشهري
              </button>
              <div className="absolute -left-4 -top-4 w-16 h-16 bg-white opacity-20 blur-2xl rounded-full"></div>
            </div>

            {/* 📱 SMART SMS ALERTS CARD */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-right space-y-4">
              <div className="flex justify-between items-center border-b pb-3 flex-row-reverse border-slate-100">
                <h4 className="text-xs font-black text-[#0F172A] flex items-center gap-2 flex-row-reverse">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>تنبيهات SMS الذكية</span>
                </h4>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black font-sans shrink-0",
                  smsEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {smsEnabled ? "نشطة ومفعّلة" : "موقف بطلبك"}
                </span>
              </div>

              <p className="text-[10px] text-slate-450 leading-relaxed font-bold">
                يتيح هذا النظام المؤتمت إرسال رسالة SMS فورية ودقيقة لهاتف الولي الشرعي عند رصد وتسجيل أي غياب أو تأخر في المنصة الرقمية من قبل الأستاذ.
              </p>

              {/* State toggle switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 flex-row-reverse">
                <span className="text-xs font-black text-slate-700">تفعيل الإرسال التلقائي:</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={smsEnabled} 
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Registered Phone Link with instant inline edits */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 block uppercase">رقم هاتف الولي المستهدف:</label>
                {isEditingPhone ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newPhoneVal}
                      onChange={(e) => setNewPhoneVal(e.target.value)}
                      className="flex-grow bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-left font-mono outline-none focus:border-amber-400 font-bold"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setGuardianPhone(newPhoneVal);
                        setIsEditingPhone(false);
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-lg cursor-pointer"
                    >
                      حفظ
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditingPhone(false)}
                      className="px-3 py-2 bg-slate-100 text-slate-400 font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-row-reverse">
                    <span className="font-mono text-xs font-black text-slate-800 tracking-wider" dir="ltr">{guardianPhone}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        setNewPhoneVal(guardianPhone);
                        setIsEditingPhone(true);
                      }}
                      className="text-[9px] font-black text-amber-600 hover:underline cursor-pointer"
                    >
                      تعديل الرقم
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isTestingSms || !smsEnabled}
                  onClick={() => {
                    setIsTestingSms(true);
                    setSmsTestSuccess('');
                    setTimeout(() => {
                      setIsTestingSms(false);
                      setSmsTestSuccess(`تم إطلاق إشارة اختبار المخدم بنجاح! تم استلام رسالة SMS تجريبية إلى رقم هاتف الولي: ${guardianPhone}`);
                    }, 1000);
                  }}
                  className={cn(
                    "w-full text-center py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 flex-row-reverse cursor-pointer",
                    smsEnabled 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/15"
                      : "bg-slate-100 text-slate-300 pointer-events-none"
                  )}
                >
                  {isTestingSms ? (
                    <span className="flex items-center gap-1.5"><RotateCw className="w-3.5 h-3.5 animate-spin" /> جاري الإرسال التجريبي...</span>
                  ) : (
                    <>
                      <span>اختبار إرسال رسالة SMS فورية</span>
                      <Smartphone className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                {smsTestSuccess && (
                  <p className="text-[9px] text-emerald-700 font-extrabold mt-2 leading-relaxed bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-right">
                     {smsTestSuccess}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-right">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-6">قنوات التنسيق مع الهيئة البيداغوجية</h4>
              <div className="space-y-2">
                <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-4 transition-all border border-transparent hover:border-slate-200 group flex-row-reverse cursor-pointer">
                  <div className="w-9 h-9 bg-blue-50 bg-opacity-100 rounded-lg flex items-center justify-center group-hover:bg-blue-105 transition-colors">
                    <MessageSquareCode className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">قناة الاتصال المباشرة مع الأستاذ الوصي</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">أ. {activeGroup.guardian} • الرد العادي خلال اليوم</p>
                  </div>
                </button>
                
                <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-4 transition-all border border-transparent hover:border-slate-200 group flex-row-reverse cursor-pointer">
                  <div className="w-9 h-9 bg-purple-50 bg-opacity-100 rounded-lg flex items-center justify-center group-hover:bg-purple-105 transition-colors">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">التزامن مع مستشار التوجيه والتقييم</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">طلب مبرر غياب رسمي أو شهادة إدارية</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: DIGITAL ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right">
          
          {/* SESSIONS list sidebar (1 col) */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 mb-3 tracking-wide uppercase border-b pb-2">📂 سجل الحصص الدراسية للفوج</h4>
              <p className="text-[10px] text-slate-400 font-bold mb-4">اختر حصة المداولة لمطالعة دفتر غياب الفوج ورفع تبريرات المتكون:</p>
              
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center font-bold">لا توجد حصص حضور مقيدة لهذا الفوج.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {sessions.map(s => {
                    const status = s.attendanceMap[student.id];
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSessionId(s.id)}
                        className={cn(
                          "w-full text-right p-3.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 cursor-pointer",
                          selectedSessionId === s.id
                            ? "border-amber-400 bg-amber-50/20 shadow-sm"
                            : "border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                        )}
                      >
                        <div className="flex justify-between items-center w-full flex-row-reverse">
                          <span className="font-extrabold text-slate-800 font-sans">{s.date}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black",
                            s.sessionType === 'theory' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                          )}>
                            {s.sessionType === 'theory' ? 'نظري' : 'تطبيقي'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full text-[10px] text-slate-500 font-bold">
                          <span className="flex items-center gap-1 flex-row-reverse font-mono leading-none">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {s.sessionPeriod}
                          </span>
                          <span className={cn(
                            "font-extrabold",
                            status === 'present' ? "text-emerald-600" :
                            status === 'late' ? "text-amber-600" :
                            status === 'excused' ? "text-indigo-600" : "text-rose-600"
                          )}>
                            {status === 'present' ? 'حاضر ✓' :
                             status === 'late' ? 'متأخر ⏱️' :
                             status === 'excused' ? 'غياب مبرر 💮' : 'غياب غير مبرر ✖'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Attendance system regulations info card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 text-[11px] leading-relaxed text-slate-600">
              <h5 className="font-black text-slate-800 flex items-center gap-1.5 flex-row-reverse mb-2">
                <span>دستور العقوبات والغيابات بـ {instWord}</span>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              </h5>
              <ul className="list-disc pr-4 space-y-1 text-slate-500">
                <li>0.25 يوم غياب مكافئ يسجل عن كل ساعة غياب غير مبررة.</li>
                <li>عند بلوغ <b>3 أيام</b> غياب مكافئة: صدور <b>الإنذار الأول</b>.</li>
                <li>عند بلوغ <b>10 أيام</b> غياب مكافئة: صدور <b>الإنذار وبطاقة التوبيخ الثاني</b>.</li>
                <li>تجاوز عتبة <b>20 يوماً</b> غياب مجزأة يسقط قانون التدريب ويقرر <b>الشطب والاقصاء البيدغوجي النهائي</b>.</li>
              </ul>
            </div>
          </div>

          {/* SESSIONS DETAILS & ROLL BOOK (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {(() => {
              const currSess = sessions.find(s => s.id === selectedSessionId);
              if (!currSess) {
                return (
                  <div className="bg-white p-12 text-center border rounded-2xl text-slate-400 font-bold min-h-[300px] flex flex-col justify-center items-center gap-2">
                    <Calendar className="w-10 h-10 text-slate-350" />
                    <span>الرجاء تحديد حصة دراسية من السجل الجانبي لقراءة دفتر حضور الفوج.</span>
                  </div>
                );
              }

              return (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  
                  {/* Ledger header */}
                  <div className="bg-slate-900 text-white p-5 text-right flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="text-[9px] font-black tracking-widest bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                        المعطيات المتزامنة والمقيدة من الأستاذ المؤطر
                      </span>
                      <h3 className="text-sm font-black mt-1 text-white">دفتر حضور الحصة البيداغوجية المعتمد</h3>
                      <p className="text-[10px] text-slate-300 font-bold mt-1">تاريخ الحصة: {currSess.date} • الفترة: {currSess.sessionPeriod} • المؤطر: {activeGroup.guardian}</p>
                    </div>
                    <div className="text-left font-mono text-[9px] text-slate-400 border border-slate-800 p-2 rounded bg-slate-950/40">
                      SESS_ID: {currSess.id} • SIGNATED: {currSess.teacherSignature || 'الإمضاء البشري للوصي'}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="bg-amber-500/10 border border-amber-300/30 p-4 rounded-xl text-xs flex items-center gap-3 flex-row-reverse text-amber-900 leading-normal font-bold">
                      <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600" />
                      <span>قيد مراجعة الولي: تم تأمين هذا المدخل البيداغوجي وهو غير قابل للتغيير والتعديل المباشر منعاً للمساس بمصداقية الرقابة. يمكنك فقط رفع الوثائق الثبوتية لتبرير غيابات ابنك مباشرة في الفتحة المعتمدة.</span>
                    </div>

                    {/* Class ledger representation */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800 border-r-4 border-amber-500 pr-2">أعضاء الفوج البيداغوجي للحصة والوضعيات المرصودة:</h4>
                      <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold">
                              <th className="p-3">اسم ولقب المتربص</th>
                              <th className="p-3 text-center">صفة وبنية الهوية</th>
                              <th className="p-3 text-center">الوضعية والغياب</th>
                              <th className="p-3 text-center">تأكيد التبرير الرسمي للمجلس</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {activeGroup.learners.map((l, idx) => {
                              const sStatus = currSess.attendanceMap[l.id];
                              const isMyChild = l.id === student.id;
                              const justification = currSess.justifications?.[l.id];

                              return (
                                <tr key={l.id} className={cn(
                                  "hover:bg-slate-50/50 transition-colors",
                                  isMyChild ? "bg-amber-50/30" : ""
                                )}>
                                  <td className="p-3 border-l border-slate-100">
                                    <div className="flex items-center gap-2 flex-row-reverse justify-start">
                                      {isMyChild && <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.25 rounded-md">ابنـك</span>}
                                      <span className="font-extrabold text-slate-900 font-sans">{l.name}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 block font-mono">MATRICULE: {l.id}</span>
                                  </td>
                                  <td className="p-3 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    {l.gender === 'M' ? 'ذكر' : 'أنثى'} • متربص رسمي
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={cn(
                                      "px-2.5 py-1 rounded-full text-[9.5px] font-black inline-flex items-center gap-1.5",
                                      sStatus === 'present' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                      sStatus === 'late' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                      sStatus === 'excused' ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                                      "bg-rose-50 text-rose-700 border border-rose-100"
                                    )}>
                                      {sStatus === 'present' ? 'حاضر بالفرع ✓' :
                                       sStatus === 'late' ? 'دخول متأخر ⏱️' :
                                       sStatus === 'excused' ? 'غياب مبرر بيداغوجياً' : 'غياب غير مبرر'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center border-r border-slate-100">
                                    {/* If absent / excused, then show status and upload justification */}
                                    {(sStatus === 'absent' || sStatus === 'excused') ? (
                                      <div className="flex items-center justify-center gap-2 flex-row-reverse">
                                        {justification ? (
                                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold">
                                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="font-sans truncate max-w-[120px]">{justification}</span>
                                            {isMyChild && (
                                              <button
                                                onClick={() => handleRemoveJustification(currSess.id, l.id)}
                                                className="text-rose-600 hover:text-rose-800 font-black mr-1 cursor-pointer"
                                                title="حذف مبرر الغياب وإعادة الحالة للغياب غير مبرر"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            {isMyChild ? (
                                              <label className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 flex-row-reverse shadow-xs shadow-amber-600/10 hover:-translate-y-0.5">
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>رفع شهادة تبرير الغياب</span>
                                                <input
                                                  type="file"
                                                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                      handleUploadJustification(currSess.id, l.id, file.name);
                                                    }
                                                  }}
                                                />
                                              </label>
                                            ) : (
                                              <span className="text-[10px] text-slate-450 italic font-medium">مغلق للولي</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-[10px] font-bold">لا غياب مقيد باليوم</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-[10.5px] leading-relaxed text-slate-500 font-bold flex gap-2 flex-row-reverse text-right">
                      <span className="text-amber-500 text-left">💡</span>
                      <p>
                        <b>توضيح من مصلحة التقييم:</b> يرجى إرسال التبرير في حدود 
                        <b> 48 ساعة</b> من تسجيل الغياب. التبريرات تدرس بعناية وتحديث الحالة إلى غياب مبرر يسقط فوراً ساعات الإقصاء من الاستحواذ الإقصائي.
                      </p>
                    </div>

                  </div>

                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* 3. TAB: GRADES & SCHOOL TRANSLATION BOOKLET */}
      {activeTab === 'grades' && (
        <div className="space-y-6 text-right">
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center flex-row-reverse border-b pb-4 mb-6">
              <div>
                <span className="text-[9px] font-black tracking-widest bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  صادر ومصادق من الطاقم البيداغوجي لـ {instPrefix} تبسة 2
                </span>
                <h3 className="text-md font-black text-slate-850 mt-1">بطاقة كشف النقاط والمعدلات الدورية للمتكون</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">معدلات واجتيازات السداسيات البيداغوجية والامتحانات الرسمية:</p>
              </div>
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 border rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer flex-row-reverse"
              >
                <Download className="w-4 h-4" />
                <span>طباعة الكشف المدرسي الكامل</span>
              </button>
            </div>

            {(() => {
              const studentResults = AppStateStore.getSemesterResults().filter(r => r.learnerId === student.id);
              if (studentResults.length === 0) {
                return (
                  <p className="text-center py-12 text-slate-400 font-bold">لا توجد نتائج أو علامات دورية منشورة حالياً لهذا الطالب.</p>
                );
              }

              return (
                <div className="space-y-8">
                  {studentResults.map((r, rIdx) => {
                    return (
                      <div key={rIdx} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-150 space-y-5">
                        
                        {/* Term header */}
                        <div className="flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-4 bg-slate-905 p-4 rounded-xl text-slate-900 border border-slate-200">
                          <div>
                            <h4 className="font-extrabold text-[#0F172A] text-sm">{r.semesterName}</h4>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">تاريخ نشر النتائج ومداولة اللجنة: {r.publishedAt}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 flex-row-reverse justify-start">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-450 block font-bold leading-none">معدل السداسي</span>
                              <span className="text-2xl font-black text-slate-900 font-sans tracking-tight">{r.gpa.toFixed(2)}</span>
                            </div>
                            <span className={cn(
                              "px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-black",
                              r.status === 'passed' ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"
                            )}>
                              {r.status === 'passed' ? 'ناجح ومؤهل للفترة الموالية ✓' : 'مستدرك (يحال على الاستدراك)'}
                            </span>
                          </div>
                        </div>

                        {/* Module table */}
                        <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-xs">
                          <table className="w-full text-right text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold">
                                <th className="p-3">تسمية المقياس / المادة البيداغوجية</th>
                                <th className="p-3 text-center">المعامل</th>
                                <th className="p-3 text-center">علامة المراقبة المستمرة</th>
                                <th className="p-3 text-center">علامة الامتحان النهائي</th>
                                <th className="p-3 text-center">المعدل النهائي للمقياس</th>
                                <th className="p-3 text-center">الكفاءة ونسبة النجاح</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {r.subjects.map((sub, sIdx) => {
                                const passed = sub.average >= 10;
                                return (
                                  <tr key={sIdx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-3 font-extrabold text-slate-800 font-sans border-l border-slate-100">
                                      {sub.name}
                                    </td>
                                    <td className="p-3 text-center font-bold text-slate-500 font-sans">
                                      {sub.coeff}
                                    </td>
                                    <td className="p-3 text-center font-bold font-sans text-slate-700">
                                      {sub.continuousScore} / 20
                                    </td>
                                    <td className="p-3 text-center font-bold font-sans text-slate-700">
                                      {sub.examScore} / 20
                                    </td>
                                    <td className={cn(
                                      "p-3 text-center font-black font-sans border-r border-slate-100",
                                      passed ? "text-emerald-600 bg-emerald-50/30" : "text-rose-600 bg-rose-50/30"
                                    )}>
                                      {sub.average} / 20
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-2 flex-row-reverse">
                                        <div className="w-16 bg-slate-150 h-1.5 rounded-full overflow-hidden">
                                          <div className={cn(
                                            "h-full",
                                            passed ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                                          )} style={{ width: `${sub.average * 5}%` }}></div>
                                        </div>
                                        <span className={cn(
                                          "text-[9px] font-black px-1.5 py-0.25 rounded",
                                          passed ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                        )}>
                                          {passed ? 'مكتسب' : 'غير كافٍ'}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Jury decision comment */}
                        {r.deliberationsNote && (
                          <div className="p-4 bg-emerald-50/30 border border-emerald-250 text-emerald-950 rounded-xl text-xs font-bold leading-normal text-right">
                            📢 <b>ملاحظة لجنة المداولات البيداغوجية:</b> {r.deliberationsNote}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* DYNAMIC GRADE APPEALS AND DISPUTE FORM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-right">
            
            {/* Left panel: File appeal form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-right">
              <h4 className="text-xs font-black text-[#0F172A] border-r-4 border-amber-500 pr-2 mb-3">
                تقديم التماس وتظلم بيداغوجي رسمي للمجلس
              </h4>
              <p className="text-[10px] text-slate-400 font-bold mb-4">إن ساورك أي شك بخصوص علامة أو تظن أن هناك خطأً مادياً في حساب النقاط، أرسل طعناً بيداغوجياً للمجلس:</p>
              
              {appealSuccess && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold leading-relaxed">
                  {appealSuccess}
                </div>
              )}

              <form onSubmit={handleAddAppeal} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">اختر المادة / المقياس موضوع التظلم</label>
                  <select
                    value={appealSubject}
                    onChange={(e) => setAppealSubject(e.target.value)}
                    required
                    className="w-full text-right text-xs bg-slate-50 hover:bg-slate-100/75 border border-slate-200 p-3 rounded-xl transition-all focus:border-amber-400 outline-none font-bold"
                  >
                    <option value="">--- حدد مادة الطعن ---</option>
                    {(() => {
                      const studentResult = AppStateStore.getSemesterResults().find(r => r.learnerId === student.id);
                      const subjects = studentResult ? studentResult.subjects : [];
                      return subjects.map((sub, sIdx) => (
                        <option key={sIdx} value={sub.name}>{sub.name} (المعامل: {sub.coeff})</option>
                      ));
                    })()}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">أسباب ومبررات الطعن البيداغوجي بالتفصيل</label>
                  <textarea
                    rows={4}
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    required
                    placeholder="اكتب رسالة مفصلة للطاقم الإداري (مثال: أرجو إعادة مراجعة علامة الامتحان النهائي لأنني متأكد من حل كافة تمرينات المنحنى الدراسي بالامتحان)..."
                    className="w-full text-right text-xs bg-slate-50 hover:bg-slate-100/75 border border-slate-200 p-3 rounded-xl transition-all focus:border-amber-400 outline-none font-bold placeholder:text-slate-350"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md cursor-pointer text-center w-full transition-all"
                >
                  إرسال الطعن الرسمي للمديرية البيداغوجية
                </button>
              </form>
            </div>

            {/* Right panel: list of submitted appeals */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-right flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-[#0F172A] border-r-4 border-slate-500 pr-2 mb-3">
                  تتبع حالة الطعون المقدمة
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mb-4">قائمة الالتماسات قيد التحقيق مع المستشار البيداغوجي أو الأستاذ الوصي:</p>
                
                {appeals.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-bold text-xs">
                    لم تقدم أي طعون أو التماسات حتى الآن.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {appeals.map(a => {
                      return (
                        <div key={a.id} className="p-4 bg-slate-50 rounded-xl border border-slate-150 text-xs space-y-2">
                          <div className="flex justify-between items-center flex-row-reverse border-b pb-1.5 border-slate-200">
                            <span className="font-extrabold text-slate-800">{a.subjectName}</span>
                            <span className={cn(
                              "text-[9px] font-black px-2 py-0.5 rounded-full",
                              a.status === 'pending' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                              a.status === 'accepted' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              "bg-rose-50 text-rose-700 border border-rose-100"
                            )}>
                              {a.status === 'pending' ? 'قيد الدراسة والتدقيق الإداري' :
                               a.status === 'accepted' ? 'مقبول - تم مراجعة العلامة' : 'تم الرفض وتأكيد العلامة'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal font-medium mt-1"><b>رسالة التظلم:</b> "{a.reason}"</p>
                          
                          {a.adminNotes && (
                            <div className="bg-slate-200/50 p-2.5 rounded-lg text-[9.5px] font-bold text-slate-700 border border-slate-300 mt-2 leading-relaxed">
                              💬 <b>رد الطاقم الإداري:</b> {a.adminNotes}
                            </div>
                          )}
                          
                          <div className="text-[9px] text-slate-450 text-left">تاريخ الإرسال: {a.submittedAt}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-200 text-blue-900 border-opacity-60 text-[9.5px] rounded-lg leading-normal mt-4">
                ℹ️ <b>تعليمات الأمان البيداغوجي:</b> طبقا للمرسوم التنفيذي الوزاري، معالجة الطعن المادي تستغرق دورتين بيداغوجيتين (ما يقارب 5 أيام عمل). تظهر النتيجة فورا على كشف العلامات فور تعديلها.
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 4. TAB: DISCIPLINARY COUNCIL SUMMONS */}
      {activeTab === 'referrals' && (
        <div className="space-y-6 text-right">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-right">
            <h4 className="text-xs font-black text-[#0F172A] border-r-4 border-rose-500 pr-2 mb-3">
              رصد وضبط محاضر المخالفات والاستدعاءات للمجلس
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mb-6">تنبيهاً للإجراءات المتخذة بحق المتربص بموجب ميثاق الانضباط الداخلي لولاية تبسة:</p>

            {referrals.length === 0 ? (
              <div className="border border-emerald-250 p-8 rounded-2xl bg-emerald-50/20 text-center text-emerald-800 space-y-2 max-w-xl mx-auto flex flex-col items-center">
                <span className="text-3xl">🏆</span>
                <h5 className="font-black text-sm text-emerald-950">وضع السلوك ممتاز والحمد لله!</h5>
                <p className="text-[11px] leading-relaxed text-emerald-700 font-medium">سيرة المتكون الأكاديمية والمهنية سليمة تماما داخل أسوار المعهد. لم يتم تقييد أي مخالفات سلوكية أو إحالات للمجالس التأديبية بحقه لمداولات الشطب أو الإعذار البيداغوجي.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {referrals.map(r => {
                  return (
                    <div key={r.id} className="p-5 bg-rose-50/30 border border-rose-150 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center flex-row-reverse border-b pb-2 border-rose-150">
                        <div className="text-right">
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full">استدعاء عاجل للمثول</span>
                          <h4 className="text-xs font-black text-slate-900 mt-1 font-sans">{r.groupName}</h4>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400">REF: {r.id}</span>
                      </div>

                      <div className="space-y-2 text-[11px] text-slate-700 leading-normal font-sans">
                        <p>👤 <b>المعني بالشهادة:</b> {student.name}</p>
                        <p>🚨 <b>أسباب الإحالة والضبط:</b> <span className="text-rose-700 font-extrabold">{r.reason}</span></p>
                        <p>📅 <b>تاريخ وموقع حضور المجلس:</b> {r.date} في تمام الساعة {r.time}</p>
                        <p>📍 <b>قاعة وتفاصيل التلاقي:</b> {r.place}</p>
                        <p className="pt-2 border-t border-dashed border-rose-200">
                          ⚖️ <b>بند القانون المنظم استخراجاً:</b> المادة 41 من القرار التنظيمي 21-121 المتعلق بحضور ومواظبة وعقوبات المتكونين بالمطابع البيداغوجية.
                        </p>
                      </div>

                      <div className="flex gap-2 flex-row-reverse pt-2">
                        <button
                          onClick={() => window.print()}
                          className="bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl h-9 cursor-pointer transition-all flex items-center gap-1 flex-row-reverse text-center"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>تحميل الاستدعاء القانوني المعتمد</span>
                        </button>
                        <span className={cn(
                          "px-2.5 rounded-xl text-[10px] font-black inline-flex items-center h-9",
                          r.status === 'summoned' ? "bg-amber-100 text-amber-800 border" : "bg-emerald-100 text-emerald-800 border"
                        )}>
                          {r.status === 'summoned' ? 'ساري المفعول (قيد المثول)' : 'تم المثول والتسوية'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 5. TAB: WORKPLACE ATTENDANCE TRACKING (TETEBOU' AN BA'AD FOR APPRENTICES) */}
      {activeTab === 'professional' && (
        <div className="space-y-6 text-right font-sans">
          
          {/* Main Informative Disclaimer Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/30 border border-emerald-200/50 p-6 rounded-2xl flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4 shadow-xs">
            <div className="text-right space-y-1">
              <span className="text-[10px] font-black tracking-widest bg-emerald-600 text-white px-2.5 py-0.75 rounded-full uppercase">
                بوابة التمهين الذكية والرقابة الجغرافية عن بعد
              </span>
              <h3 className="text-md font-black text-slate-900">نظام تتبع حضور المتمهنين في الوسط المهني ومقرات التشغيل</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                يسمح هذا المدخل المتطور لأولياء المتمهنين بمراقبة وتتبع الحضور الفعلي واليومي لأبنائهم داخل ورشات ومقرات الشركات المضيفة بصفة آنية وعبر نظام تحديد المواقع الجغرافي <strong className="text-emerald-600 font-sans font-black">(GPS/Geo-Fence)</strong> بالتنسيق مع المؤطر المهني.
              </p>
            </div>
            <div className="p-3 bg-white border border-emerald-100 rounded-xl shadow-xs text-emerald-600 self-center">
              <Compass className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Right Column: Apprentice Profile and Actions (1 col) */}
            <div className="space-y-6">
              
              {/* Employer / Workplace Placement Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3 flex-row-reverse border-slate-100">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 flex-row-reverse">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>موقع التكوين التطبيقي والتمهين</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700">معتمد وقائي</span>
                </div>

                <div className="space-y-3.5 text-xs text-slate-700 leading-normal">
                  <div>
                    <span className="text-slate-400 text-[9.5px] font-bold block">🏢 المؤسسة المستخدمة الحاضنة:</span>
                    <strong className="text-slate-900 font-black text-sm">مؤسسة اتصالات الجزائر - المديرية العملياتية بتبسة</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9.5px] font-bold block">📍 الإحداثيات والتموضع المعتمد:</span>
                    <strong className="text-slate-800 font-semibold flex items-center gap-1 flex-row-reverse justify-end">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span className="font-mono">Lat: 35.4087° N, Long: 8.1105° E (تبسة وسط)</span>
                    </strong>
                  </div>
                  <div className="border-t border-dashed border-slate-100 pt-3">
                    <span className="text-slate-400 text-[9.5px] font-bold block">👤 المؤطر والوصي المهني بالمنشأة:</span>
                    <strong className="text-slate-900 font-black">المهندس سليم بوعافية (رئيس مصلحة تسيير التراسل)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9.5px] font-bold block">📞 رقم السلك المباشر للمؤطر:</span>
                    <strong className="font-mono font-black text-emerald-700 tracking-wider" dir="ltr">+213 771 88 52 44</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-[10px] text-slate-500 font-bold leading-normal">
                    📄 رقم العقد القانوني للتمهين: <strong className="font-sans font-black text-slate-800">APPR-TEB2-24/87-A</strong>
                  </div>
                </div>
              </div>

              {/* Guidebook and Performance Rating card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3 flex-row-reverse border-slate-100">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 flex-row-reverse">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>الانضباط وتقييم دفتر التمهين الميداني</span>
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-extrabold font-sans">18 / 20 مميز</span>
                </div>

                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  يقوم المعهد بزيارات فجائية لتفقد "دفتر التمهين المبرمج" للتأكد من مواءمة المهارات المكتسبة مع البرنامج القانوني للولاية.
                </p>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-amber-900 border-opacity-60 text-[10px] leading-relaxed">
                  🗓️ <b>آخر زيارة تدقيقية:</b> تمت من طرف الأستاذ الوصي (<b>أ. أمين بوجمعة</b>) بتاريخ <b>18-05-2026</b> وتم تدوين تقييم ممتاز ونسب مواظبة كاملة بالدفتر.
                </div>
              </div>

              {/* Request inspection / field visit from Institute */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3.5">
                <h4 className="text-xs font-black text-slate-800 border-r-4 border-amber-500 pr-2">
                  طلب إيفاد مستشار التمهين لزيارة مراقبة ميدانية طارئة
                </h4>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  إذا لاحظت خللاً في تأطير ابنك، أو تغيبه غير المبرر وتريد من مستشار التوجيه والتمهين بالمعهد تنسيق زيارة تفتيشية لمقر اتصالات الجزائر، أرسل طلباً للمديرية:
                </p>
                
                {visitRequestSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] rounded-xl font-bold leading-relaxed text-right">
                    ✓ {visitRequestSuccess}
                  </div>
                )}

                <textarea
                  rows={3}
                  value={workplaceNotes}
                  onChange={(e) => setWorkplaceNotes(e.target.value)}
                  placeholder="مثال: يرجى إيفاد زيارة تفتيشية للتحقق من المهام الموكلة للمتمهن والتأكد من تواجده بالقسم..."
                  className="w-full text-right text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-amber-400 outline-none font-bold text-slate-700 placeholder:text-slate-350"
                />

                <button
                  type="button"
                  disabled={isSubmittingVisit || !workplaceNotes.trim()}
                  onClick={() => {
                    setIsSubmittingVisit(true);
                    setVisitRequestSuccess('');
                    setTimeout(() => {
                      setIsSubmittingVisit(false);
                      setVisitRequestSuccess('تم تسجيل طلبك بنجاح. سيقوم مستشار التمهين بالمعهد ببرمجة زيارة تفتيشية فجائية لمقر الشركة بالتنسيق مع المؤطر وهاتف الوصي خلال 48 ساعة.');
                      setWorkplaceNotes('');
                    }, 1000);
                  }}
                  className={cn(
                    "w-full text-center py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 flex-row-reverse cursor-pointer",
                    workplaceNotes.trim()
                      ? "bg-slate-900 hover:bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-350 pointer-events-none"
                  )}
                >
                  {isSubmittingVisit ? (
                    <span>جاري قفل الطلب...</span>
                  ) : (
                    <>
                      <span>طلب زيارة تفتيشية ومراقبة</span>
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Left Column: Log and GPS Remote Tracker (2 cols) */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Daily GPS Verified Geolocation Logs */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 text-right">
                <div className="flex justify-between items-center border-b pb-4 flex-row-reverse border-slate-100">
                  <div>
                    <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">سجل إمضاء الحضور الجغرافي والبيومتري الفوري (عن بعد)</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">تتبع تزامني فوري لبث المواقع الجغرافية للمتمهن هذا الأسبوع:</p>
                  </div>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-sans tracking-wide">أجهزة الرقابة الذكية نشطة</span>
                </div>

                {showWorkplaceSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] rounded-xl font-bold leading-relaxed text-right">
                    ✓ {showWorkplaceSuccessMsg}
                  </div>
                )}

                {/* Micro Geolocation interactive timeline */}
                <div className="space-y-4">
                  
                  {/* SUNDAY */}
                  <div className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-150 transition-all flex flex-col md:flex-row-reverse justify-between gap-4">
                    <div className="flex gap-3 flex-row-reverse items-start">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">أحد</div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900">حضور مؤكد جغرافياً (GPS Verified)</h4>
                        <p className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 flex-row-reverse justify-end">
                          <MapPin className="w-3 h-3" />
                          <span>ضمن النطاق المسموح لاتصالات الجزائر (تبسة)</span>
                        </p>
                        <p className="text-[9.5px] text-slate-400 font-bold font-sans">تم التقاط البصمة الجيو-مكانية + التوقيع الرقمي للمؤطر بنجاح</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-row md:flex-col justify-between md:justify-center items-end text-xs font-sans">
                      <span className="font-extrabold text-slate-800 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px]">حاضر ✓</span>
                      <span className="text-[10px] text-slate-450 mt-1 font-mono font-bold">⏱️ 07:56 صباحاً - 16:02 مساءً</span>
                    </div>
                  </div>

                  {/* MONDAY */}
                  <div className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-150 transition-all flex flex-col md:flex-row-reverse justify-between gap-4">
                    <div className="flex gap-3 flex-row-reverse items-start">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">إثنين</div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900">حضور مؤكد جغرافياً (GPS Verified)</h4>
                        <p className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 flex-row-reverse justify-end">
                          <MapPin className="w-3 h-3" />
                          <span>ضمن النطاق المسموح لاتصالات الجزائر (تبسة)</span>
                        </p>
                        <p className="text-[9.5px] text-slate-400 font-bold font-sans">تم مطابقة الملامح الرقمية للكاميرا (سيلفي المقر) + إمضاء الوصي</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-row md:flex-col justify-between md:justify-center items-end text-xs font-sans">
                      <span className="font-extrabold text-slate-800 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px]">حاضر ✓</span>
                      <span className="text-[10px] text-slate-450 mt-1 font-mono font-bold">⏱️ 07:51 صباحاً - 16:10 مساءً</span>
                    </div>
                  </div>

                  {/* TUESDAY */}
                  <div className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-150 transition-all flex flex-col md:flex-row-reverse justify-between gap-4">
                    <div className="flex gap-3 flex-row-reverse items-start">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">ثلاثاء</div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900">حضور مؤكد جغرافياً (GPS Verified)</h4>
                        <p className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 flex-row-reverse justify-end">
                          <MapPin className="w-3 h-3" />
                          <span>ضمن النطاق المسموح لاتصالات الجزائر (تبسة)</span>
                        </p>
                        <p className="text-[9.5px] text-slate-400 font-bold font-sans">تحقق تلقائي جيو-مكاني للموقع الموثق</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-row md:flex-col justify-between md:justify-center items-end text-xs font-sans">
                      <span className="font-extrabold text-slate-800 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px]">حاضر ✓</span>
                      <span className="text-[10px] text-slate-450 mt-1 font-mono font-bold">⏱️ 07:58 صباحاً - 16:05 مساءً</span>
                    </div>
                  </div>

                  {/* WEDNESDAY (TODAY LOG OR PRE-ABSENCE TEST LOG) */}
                  <div className="p-4 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-xl border border-emerald-200 transition-all flex flex-col md:flex-row-reverse justify-between gap-4">
                    <div className="flex gap-3 flex-row-reverse items-start">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5">أربعاء</div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-emerald-900">حضور مباشر ومؤكد حالياً (Live Track)</h4>
                        <p className="text-[10.5px] text-[#059669] font-black flex items-center gap-1 flex-row-reverse justify-end border border-[#10b981]/20 bg-[#10b981]/15 px-2 py-0.5 rounded-lg w-max">
                          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                          <span>جاري التتبع الحي: متواجد بالشركة</span>
                        </p>
                        <p className="text-[9.5px] text-slate-500 font-bold font-sans">البث الجيو-مكاني للأجهزة نشط وتغطية الإرسال 100%</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-row md:flex-col justify-between md:justify-center items-end text-xs font-sans">
                      <span className="font-extrabold bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] animate-pulse">متصل ومواظب ✓</span>
                      <span className="text-[10px] text-emerald-700 mt-1 font-mono font-black">⏱️ البث: 08:04 صباحاً - نشط</span>
                    </div>
                  </div>

                  {/* THURSDAY (EXCUSED / SUBMIT JUSTIFICATION SAMPLE FOR ROBUSTNESS) */}
                  <div className="p-4 bg-rose-50/20 hover:bg-rose-50/40 rounded-xl border border-rose-150 transition-all flex flex-col md:flex-row-reverse justify-between gap-4">
                    <div className="flex gap-3 flex-row-reverse items-start">
                      <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 animate-pulse">خميس</div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900">حالة رصد غياب بالوسط المهني (Employer Absent Check)</h4>
                        <p className="text-[10px] text-rose-700 font-extrabold flex items-center gap-1 flex-row-reverse justify-end">
                          <AlertTriangle className="w-3 h-3" />
                          <span>لم يسجل المتمهن بصمة دخوله الجغرافية لليوم حتى الآن</span>
                        </p>
                        <p className="text-[9.5px] text-slate-400 font-semibold font-sans">تنبيه: تم إرسال رسالة SMS تلقائية لهاتف الولي لتوضيح الحالة.</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-row md:flex-col justify-between md:justify-center items-end text-xs font-sans gap-2">
                      <span className="font-extrabold text-slate-800 bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px]">لم يحضر ✖</span>
                      
                      {/* Upload justification specifically for workplace absence */}
                      <label className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-black cursor-pointer transition-all flex items-center gap-1 flex-row-reverse shadow-xs">
                        <Upload className="w-3 h-3" />
                        <span>رفع مبرر غياب الوسط المهني</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg text"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setShowWorkplaceSuccessMsg(`تم رفع شهادة المبرر للغياب المهني بنجاح (المستند: ${file.name}). سيقوم الأستاذ المؤطر ومستشار التمهيد بمراجعتنا وتأشير الحالة.`);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                </div>

                {/* Simulated Live GPS Map Geofence boundaries visual component */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                  <div className="relative z-10 flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none flex items-center gap-1 justify-end flex-row-reverse">
                        <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                        <span>المنظومة الرقمية القوقلية الخرائطية (Geofence System)</span>
                      </p>
                      <h4 className="text-xs font-black text-white mt-1.5 leading-tight">حدود السياج الجغرافي القانوني المصادق ببلدية تبسة</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed font-bold">بموجب المخطط، يسمح للمتمهن بالبث ضمن دائرة سلامة قطرها 200 متر حول الإحداثيات المرجعية لاتصالات الجزائر تبسة لضمان الحضور الميداني.</p>
                    </div>
                    
                    {/* Visual compass/cyber telemetry status */}
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-[9px] text-emerald-400 font-bold tracking-tight">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                      <span>SIGNAL: EXCELLENT • ACCURACY: &lt; 3 METERS</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* STUNNING HIGH-POLISHED INTERACTIVE PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-150 overflow-hidden text-right flex flex-col font-sans"
          >
            {/* Modal header with download controls */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-row-reverse">
              <div className="flex items-center gap-2 flex-row-reverse">
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">كشف المتابعة الشهري الرسمي للمتكون</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document sheet container (A4 simulated preview) */}
            <div className="p-6 overflow-y-auto max-h-[70vh] bg-slate-100/50">
              <div id="print-area-parent" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-6 max-w-xl mx-auto text-slate-950 text-right">
                
                {/* Official Algerian logo headers */}
                <div className="text-center space-y-1 pb-4 border-b-2 border-slate-300">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">وزارة التكوين والتعليم المهنيين</p>
                  <p className="text-[12px] font-black text-rose-950">{institution.name}</p>
                  <div className="bg-slate-100 py-2.5 px-4 rounded-xl inline-block mt-4 border border-slate-200">
                    <h2 className="text-sm font-black text-slate-900">
                      📝 كشف الحضور والتأهيل والسلوك الشهري للمتكون
                    </h2>
                  </div>
                </div>

                {/* Subtitle / Month selection details */}
                <div className="flex justify-between flex-row-reverse text-[11px] font-black text-slate-500">
                  <span>شهر المداولة المعتمد: {currentMonthArabic} {currentYear}</span>
                  <span>تاريخ استخراج الوثيقة: {new Date().toLocaleDateString('ar-DZ')}</span>
                </div>

                {/* Learner & Group Meta Grids */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-slate-50 p-4 border border-slate-200 rounded-xl text-[11px] leading-relaxed font-sans text-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold">👤 اسم ولقب المتكون:</span>
                    <strong className="text-slate-900 font-black font-sans text-xs">{student.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold">🏢 الفوج البيداغوجي وتخصصه:</span>
                    <strong className="text-slate-900 font-black font-sans text-xs">{activeGroup.name} ({activeGroup.code})</strong>
                  </div>
                  <div className="border-t pt-2 border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-bold">🎓 نمط التكوين والمؤهل:</span>
                    <strong className="text-slate-800 font-bold">{activeGroup.level} • {activeGroup.duration}</strong>
                  </div>
                  <div className="border-t pt-2 border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-bold">👨‍🏫 الأستاذ المؤطر الوصي:</span>
                    <strong className="text-amber-700 font-extrabold">أ. {activeGroup.guardian}</strong>
                  </div>
                </div>

                {/* Quantitative statistics panel */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-905 border-r-4 border-emerald-500 pr-2 pb-0.5">أولاً: بيانية ونسب الحضور والمواظبة العامة:</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold">
                          <th className="p-2.5 font-bold">الحصص الحاضر فيها</th>
                          <th className="p-2.5 text-center font-bold">حالات التغيب</th>
                          <th className="p-2.5 text-center font-bold">مجموع الساعات المقيدة</th>
                          <th className="p-2.5 text-center font-bold text-slate-900">أيام الغياب المكافئة (النظام الداخلي)</th>
                          <th className="p-2.5 text-center font-bold">تأخر معتمد</th>
                          <th className="p-2.5 text-center font-bold">درجة الحضور المطبوعة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-600 font-sans">{totalPresence} حصص حاضرة</td>
                          <td className="p-2.5 text-center font-black text-rose-600 font-sans">{totalAbsences} غيابات</td>
                          <td className="p-2.5 text-center font-black text-slate-900 font-sans">{totalAbsenceHours} ساعة</td>
                          <td className="p-2.5 text-center font-black text-amber-805 bg-amber-50/70 font-sans">{equivDays.toFixed(1)} أيام غياب</td>
                          <td className="p-2.5 text-center font-sans font-extrabold text-amber-600">{totalLates} تأخر</td>
                          <td className="p-2.5 text-center">
                            <span className={cn(
                              "text-[9px] font-black px-2 py-0.5 rounded-full",
                              stabilityGrade === 'A+' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              stabilityGrade === 'B' ? "bg-sky-50 text-sky-700 border border-sky-100" :
                              stabilityGrade === 'C' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                              "bg-rose-50 text-rose-700 border border-rose-100"
                            )}>{stabilityGrade}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Behavioral & Disciplinary Panel */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-905 border-r-4 border-amber-500 pr-2 pb-0.5">ثانياً: مؤشرات السلوك والتقارير التأديبية:</h4>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 text-[11px] leading-relaxed">
                    <div className="flex justify-between items-center flex-row-reverse mb-1">
                      <strong className="text-slate-800">مؤشر الانضباط العام:</strong>
                      <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{calculatedBehaviorIndex / 10} / 10 استقرار</span>
                    </div>
                    {referrals.length > 0 ? (
                      <div className="space-y-1 mt-2 text-rose-700 font-extrabold">
                        <p className="text-[10px] text-rose-600">⚠️ تنبيه: تم رصد الإجراءات التأديبية التالية بحق المتكون:</p>
                        <ul className="list-disc pr-4 space-y-1 text-[10px]">
                          {referrals.map(r => (
                            <li key={r.id}>مخالفة بخصوص {r.reason} (الحالة: {r.status === 'resolved' ? 'تمت تسويتها' : 'قيد المتابعة'})</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-emerald-700 font-extrabold text-[10.5px] mt-1 flex items-center gap-1 flex-row-reverse">
                        <span>🎖️ يتميز المتربص بسيرة بيداغوجية حسنة وسلوك منضبط وسوي طوال فترة التكوين داخل المعهد.</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Director Digital Signature Block & Vector Stamp with Circle Seal */}
                <div className="grid grid-cols-2 gap-4 text-xs pt-6 border-t border-slate-200 mt-6 flex-row-reverse leading-relaxed text-right font-sans">
                  
                  {/* Security Verification Hash */}
                  <div className="space-y-1 text-[9px] text-slate-500">
                    <p className="font-bold flex items-center gap-1 flex-row-reverse">
                      <span>مصادق من الرقابة العامة البيداغوجية</span>
                      <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                    </p>
                    <p className="font-mono text-slate-700">VERIFY-MD5: {activeGroup.code}-{student.id}-{currentYear}-{currentMonthArabic.substring(0, 3)}</p>
                    <p className="text-slate-450">مستند رسمي معتمد متاح رقمياً لأولياء التلاميذ ولا يحتاج لإعادة إمضاء يدوي.</p>
                  </div>

                  {/* Integrated Signature and Stamp */}
                  <div className="text-center space-y-2">
                    <p className="font-black text-slate-900 text-[10.5px]">إمضاء ومصادقة مدير المؤسسة:</p>
                    
                    <div className="relative inline-block p-2 bg-emerald-50/20">
                      
                      {/* Highly Polished SVG Official Calligraphy Signature */}
                      <div className="relative z-20 mx-auto w-32 h-14 flex items-center justify-center">
                        {/* Interactive hand-drawn styled SVG name */}
                        <svg viewBox="0 0 100 45" className="w-full h-full text-blue-800 drop-shadow-sm select-none">
                          <path 
                            d="M 10,25 Q 30,5, 50,22 T 90,20 M 15,10 Q 40,38, 70,5 T 85,35 M 30,30 Q 55,42, 80,15"
                            fill="none" 
                            stroke="#1e40af" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                          <text x="50" y="41" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="900" fontStyle="italic" className="font-sans">J. Belkacem</text>
                        </svg>
                      </div>

                      {/* Official Administrative Stamp of the Institute overlaying behind the signature */}
                      <div className="absolute inset-0 z-10 opacity-75 pointer-events-none flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-24 h-24 text-rose-500/80">
                          {/* Outer ring */}
                          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="150" className="animate-spin-slow" />
                          <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="1" />
                          
                          {/* Center ring */}
                          <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          
                          {/* Stamp arabic text path */}
                          <path id="stamp_text_top_path" d="M 15,50 A 35,35 0 0,1 85,50" fill="none" />
                          <path id="stamp_text_bottom_path" d="M 85,50 A 35,35 0 0,1 15,50" fill="none" />
                          
                          <text fontSize="5.5" fontWeight="900" fill="currentColor">
                            <textPath href="#stamp_text_top_path" startOffset="50%" textAnchor="middle">
                              وزارة التكوين والتعليم المهنيين
                            </textPath>
                          </text>
                          <text fontSize="5.5" fontWeight="900" fill="currentColor">
                            <textPath href="#stamp_text_bottom_path" startOffset="50%" textAnchor="middle">
                              م.و.م.ت.م تبسة 2 * الرقابة
                            </textPath>
                          </text>
                          
                          {/* Inner center text */}
                          <text x="50" y="47" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="currentColor">مدير {instWord}</text>
                          <text x="50" y="56" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="currentColor">المصادق المعتد</text>
                          
                          {/* Decorative star */}
                          <polygon points="50,62 51,64 53,64 51.5,65 52,67 50,65.8 48,67 48.5,65 47,64 49,64" fill="currentColor" />
                        </svg>
                      </div>

                    </div>
                    
                    <p className="text-[10px] text-[#0F172A] font-black">{institution.director}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">مدير {institution.type === 'center' ? 'المركز الوطني للتكوين' : 'المعهد الوطني المتخصص'}</p>
                  </div>

                </div>

                {/* Footer and metadata print codes */}
                <div className="text-center text-[7px] text-slate-400 font-mono tracking-widest pt-8 border-t border-dashed border-slate-200">
                  SYSTEM CODE: RQ-PORTAL-PRINT-MD2026 • DIGITAL ARCHIVE NUMBER {student.id}-{currentYear}
                </div>

              </div>
            </div>

            {/* Modal action triggers */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 flex-row-reverse">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <Download className="w-4 h-4" />
                <span>المباشرة بالطباعة وتنزيل PDF 🖨️</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <span>إلغاء</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* DYNAMIC STUNNING PRINT ONLY CANVAS OVERLAY (Direct Window.print compatibility) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[999999] p-12 text-black text-right font-sans" dir="rtl">
        <div className="space-y-6 max-w-3xl mx-auto">
          
          {/* Institution banner */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-black">
            <h3 className="text-[12px] font-black font-sans">الجمهورية الجزائرية الديمقراطية الشعبية</h3>
            <h3 className="text-[11px] font-black font-sans">وزارة التكوين والتعليم المهنيين</h3>
            <h2 className="text-[14px] font-extrabold font-sans mt-1">{institution.name.replace(/^معهد/g, instPrefix)}</h2>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5">منصة الرقابة الرقمية الرسمية • كشف الحضور والسلوك الشهري للمتكون</div>
          </div>

          <div className="text-center py-2">
            <h1 className="text-md font-black border-2 border-black bg-slate-50 px-6 py-2.5 inline-block uppercase font-sans">
              كشف الغيابات والتقرير التأهيلي الشهري
            </h1>
            <p className="text-[11px] mt-1.5 text-slate-600 font-bold font-sans">شهر المداولة المعتمد: <strong className="font-sans font-extrabold text-black">{currentMonthArabic} {currentYear}</strong></p>
          </div>

          {/* Student Meta Details */}
          <div className="grid grid-cols-2 gap-4 border border-black p-4 text-[12px] leading-relaxed font-sans bg-slate-50/50">
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">🏢 الفوج البيداغوجي وتخصصه:</span>
              <strong className="text-black font-black font-sans">{activeGroup.name} ({activeGroup.code})</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">👤 اسم ولقب المتكون:</span>
              <strong className="text-black font-black font-sans">{student.name} ({student.id})</strong>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <span className="text-slate-500 font-bold block text-[10px]">🎓 نمط التكوين ومستوى التأهيل الدراسي:</span>
              <strong className="text-black">{activeGroup.level} • {activeGroup.duration}</strong>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <span className="text-slate-500 font-bold block text-[10px]">👨‍🏫 الأستاذ المؤطر الوصي للفوج:</span>
              <strong className="text-slate-900 font-black">أ. {activeGroup.guardian}</strong>
            </div>
          </div>

          {/* Table Stats */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-950 border-r-4 border-black pr-2">أولاً: بيانية ونسب حضور وغيابات المتكون:</h3>
            <table className="w-full text-right text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 border-b border-black text-[10px] text-slate-700 font-bold">
                  <th className="p-2.5 border border-black">الحصص الحاضر فيها الفوج</th>
                  <th className="p-2.5 border border-black text-center">حالات التغيب المرصودة</th>
                  <th className="p-2.5 border border-black text-center">مجموع الساعات الساقطة</th>
                  <th className="p-2.5 border border-black text-center text-black font-black">المكافئ بالأيام (طبقاً للنظام الداخلي)</th>
                  <th className="p-2.5 border border-black text-center">التأخر المعتمد</th>
                  <th className="p-2.5 border border-black text-center">قرار المجلس التأهيلي المعتمد</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-slate-950 text-[11px] font-bold">
                  <td className="p-2.5 border border-black font-sans">{totalPresence} حصص حاضرة</td>
                  <td className="p-2.5 border border-black text-center font-sans text-rose-600">{totalAbsences} غيابات</td>
                  <td className="p-2.5 border border-black text-center font-sans font-black text-red-650">{totalAbsenceHours} ساعة</td>
                  <td className="p-2.5 border border-black text-center font-sans font-black bg-slate-100">{equivDays.toFixed(1)} يوماً</td>
                  <td className="p-2.5 border border-black text-center font-sans text-amber-600">{totalLates} تأخر</td>
                  <td className="p-2.5 border border-black text-center font-black text-slate-900">
                    {stabilityGrade === 'A+' ? 'انضباط ممتاز (مستقر)' : 
                     stabilityGrade === 'B' ? 'تنبيه أول غيابات' : 
                     stabilityGrade === 'C' ? 'عقوبة الإنذار البيداغوجي (تجاوز 3 أيام)' : 
                     stabilityGrade === 'D' ? 'توبيخ وإنذار بيداغوجي ثانٍ (تجاوز 10 أيام)' : 'شطب نهائي بيداغوجي المدى (بلغ 20 يوماً)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Behavior block */}
          <div className="border border-black p-4 space-y-1.5 bg-slate-50 font-sans">
            <h4 className="text-xs font-black text-slate-900">ثانياً: سلوك ومواظبة المتكون ومقررات العقوبة البيداغوجية:</h4>
            {referrals.length > 0 ? (
              <div className="text-[11px] space-y-1">
                <p className="font-black text-red-600">⚠️ تم تقييد الإحالات والمخالفات الموثقة التالية هذا الشهر بحق المتكون:</p>
                <ol className="list-decimal pr-4 text-[10.5px]">
                  {referrals.map(r => (
                    <li key={r.id}>مخالفة بخصوص {r.reason} (الحالة: {r.status === 'resolved' ? 'تمت تسويتها' : 'قيد المتابعة'})</li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="text-[11.5px] italic text-slate-800 font-semibold leading-relaxed">
                "🎖️ بعد المراجعة والتدقيق في جداول مجلس الرقابة، يتمتع المتكون بسيرة وسلوك نموذجي منضبط طيلة الشهر الجاري ولم تسجل ضده أي مخالفات بيداغوجية أو تربوية."
              </p>
            )}
          </div>

          {/* Stamps & Signatures */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-8 border-t border-black mt-8">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px]">🔒 الموثق الرقمي الأمني المعتمد:</p>
              <p className="font-mono font-bold text-slate-800 text-[9px]">HASH-ID: SIG-WEEK-{activeGroup.code}-{student.id}-{currentYear}-{currentMonthArabic.substring(0,3)}</p>
              <p className="text-[9px] text-slate-550">توقيع معتمد آليا وموثق برمز البصمة في فري فلو السحابي لوزارة التكوين والتعليم المهنيين.</p>
            </div>
            
            <div className="text-center space-y-1">
              <p className="font-black text-slate-900">المصادقة والتوقيع وختم المدير العام للمعهد:</p>
              
              <div className="relative inline-block p-1 border border-black rounded bg-emerald-50/10">
                {/* Simulated director signature ink calligraphy */}
                <svg viewBox="0 0 100 45" className="w-28 h-12 text-blue-800 mx-auto select-none">
                  <path 
                    d="M 10,25 Q 30,5, 50,22 T 90,20 M 15,10 Q 40,38, 70,5 T 85,35 M 30,30 Q 55,42, 80,15"
                    fill="none" 
                    stroke="#1e40af" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <text x="50" y="41" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="900" fontStyle="italic">J. Belkacem</text>
                </svg>

                {/* Simulated circle red seal */}
                <div className="absolute inset-x-0 top-0 bottom-0 z-10 opacity-75 pointer-events-none flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-20 h-20 text-rose-500">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1" />
                    
                    <path id="print_stamp_text_top_path" d="M 15,50 A 35,35 0 0,1 85,50" fill="none" />
                    <path id="print_stamp_text_bottom_path" d="M 85,50 A 35,35 0 0,1 15,50" fill="none" />
                    
                    <text fontSize="5" fontWeight="900" fill="currentColor">
                      <textPath href="#print_stamp_text_top_path" startOffset="50%" textAnchor="middle">
                        وزارة التكوين والتعليم المهنيين
                      </textPath>
                    </text>
                    <text fontSize="5" fontWeight="900" fill="currentColor">
                      <textPath href="#print_stamp_text_bottom_path" startOffset="50%" textAnchor="middle">
                        م.و.م.ت.م تبسة 2 * الرقابة
                      </textPath>
                    </text>
                    
                    <text x="50" y="47" textAnchor="middle" fontSize="6" fontWeight="900" fill="currentColor">مدير المعهد</text>
                    <text x="50" y="55" textAnchor="middle" fontSize="5" fontWeight="900" fill="currentColor">المصادق المعتد</text>
                  </svg>
                </div>
              </div>
              
              <p className="text-[10px] text-black font-black leading-none">{institution.director}</p>
              <p className="text-[8px] text-slate-500">المدير الوصي للمعهد</p>
            </div>
          </div>

          {/* Footer print details */}
          <div className="text-center text-[9px] text-slate-400 pt-12 border-t border-dashed mt-12 flex justify-between flex-row-reverse">
            <span>حقوق استخراج هذا المستخرج محفوظة لقواعد بيانات المعهد الوطني تبسة 2 في {new Date().toLocaleDateString('ar-DZ')}</span>
            <span>تصميم ورقابة المنصة الإلكترونية</span>
          </div>

        </div>
      </div>

    </div>
  );
}
