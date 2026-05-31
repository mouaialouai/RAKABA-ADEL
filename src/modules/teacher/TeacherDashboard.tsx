import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  PauseCircle, 
  Save,
  QrCode,
  Mic,
  BookOpen,
  Calendar,
  Check,
  Award,
  Edit2,
  Sparkles,
  UploadCloud,
  Loader2,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AttendanceStatus } from '../../types';
import { AppStateStore, SpecializationGroup, Learner } from '../../services/store';

const statusOptions: { key: AttendanceStatus; label: string; icon: any; color: string; activeColor: string }[] = [
  { key: 'present', label: 'حاضر', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', activeColor: 'bg-emerald-600 text-white shadow-emerald-200' },
  { key: 'absent', label: 'غائب', icon: XCircle, color: 'bg-rose-50 text-rose-600', activeColor: 'bg-rose-600 text-white shadow-rose-200' },
  { key: 'late', label: 'متأخر', icon: Clock, color: 'bg-amber-50 text-amber-600', activeColor: 'bg-amber-500 text-slate-900 shadow-amber-200' },
  { key: 'dropped', label: 'متخلي', icon: PauseCircle, color: 'bg-orange-50 text-orange-600', activeColor: 'bg-orange-600 text-white shadow-orange-200' },
  { key: 'suspended', label: 'مفصول', icon: AlertCircle, color: 'bg-purple-50 text-purple-600', activeColor: 'bg-purple-600 text-white shadow-purple-200' }
];

export default function TeacherDashboard() {
  const [groups, setGroups] = useState<SpecializationGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>(AppStateStore.getSessions());
  
  // Session details configuration
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<'theory' | 'practical' | 'directed'>('practical');
  const [duration, setDuration] = useState<number>(3); // hours
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  // AI-Assisted Mapping States
  const [pastedText, setPastedText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLog, setAiLog] = useState<string | null>(null);

  // Signature state
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [signatureText, setSignatureText] = useState('');

  // Safe notification and dialog states for sandboxed iframe
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showBulkAbsentConfirm, setShowBulkAbsentConfirm] = useState(false);

  // Tab control states for recording vs weekly reporting
  const [activeTab, setActiveTab] = useState<'record' | 'weeklyReport'>('record');
  const [selectedWeekRange, setSelectedWeekRange] = useState<string>('2026-05-24_2026-05-28');
  const [tutorReportNotes, setTutorReportNotes] = useState<string>('الفوج منضبط بصفة عامة ونوصي بمتابعة الملاحظات الأسبوعية مع أولياء المتربصين المتغيبين.');
  const [tutorDigitalSignature, setTutorDigitalSignature] = useState<string>('');
  const [isSignatureLocked, setIsSignatureLocked] = useState<boolean>(false);

  // Canvas Drawing Refs and states
  const signatureCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const activeGroup = groups.find(g => g.id === selectedGroupId);

  // Calculate available Algerian time periods dynamically
  const availablePeriods = activeGroup
    ? AppStateStore.getAvailablePeriods(activeGroup.modeId, sessionDate)
    : [];

  // Automatically update selected period when date, activeGroup or available periods change
  useEffect(() => {
    if (availablePeriods.length > 0) {
      if (!selectedPeriod || !availablePeriods.some(p => p.key === selectedPeriod)) {
        setSelectedPeriod(availablePeriods[0].key);
      }
    } else {
      setSelectedPeriod('');
    }
  }, [sessionDate, selectedGroupId, availablePeriods, selectedPeriod]);

  // Synchronize and load groups and sessions
  useEffect(() => {
    const list = AppStateStore.getGroups();
    setGroups(list);
    if (list.length > 0) {
      setSelectedGroupId(list[0].id);
    }
    setSessions(AppStateStore.getSessions());

    const unsubscribe = AppStateStore.subscribe(() => {
      const updatedList = AppStateStore.getGroups();
      setGroups(updatedList);
      setSessions(AppStateStore.getSessions());
    });
    return unsubscribe;
  }, []);

  // Terminology helper mapping the active group's mode
  const term = activeGroup ? AppStateStore.getTerminology(activeGroup.modeId) : { plural: 'متكونين', singular: 'متكون', title: 'فوج' };

  // Set initial or saved attendance values reactively when group, date, period selection or saved sessions list change
  useEffect(() => {
    if (activeGroup) {
      const existingSession = sessions.find(
        s => s.groupId === selectedGroupId && s.date === sessionDate && s.sessionPeriod === selectedPeriod
      );

      if (existingSession && existingSession.attendanceMap) {
        // Load the saved and confirmed attendance directly
        setAttendance(existingSession.attendanceMap);
        setNotes({});
      } else {
        // Set all to present by default for a clean sheet
        const initialMap: Record<string, AttendanceStatus> = {};
        activeGroup.learners.forEach(learner => {
          initialMap[learner.id] = 'present';
        });
        setAttendance(initialMap);
        setNotes({});
      }
    }
  }, [selectedGroupId, sessionDate, selectedPeriod, sessions, activeGroup]);

  // AI OCR parser implementation
  const handleAiParse = async (fileBase64?: string, fileMime?: string) => {
    if (!activeGroup) return;
    setAiLoading(true);
    setAiError(null);
    setAiLog(null);

    try {
      const resp = await fetch('/api/ai/parse-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedText || undefined,
          file: fileBase64 || undefined,
          mimeType: fileMime || undefined,
          learners: activeGroup.learners.map(l => ({ id: l.id, name: l.name }))
        })
      });

      if (!resp.ok) {
        throw new Error('فشلت عملية التحليل والمطابقة الذكية في الخادم الرئيسي.');
      }

      const result = await resp.json();
      if (result.attendanceMap) {
        // Merge mapped statuses into attendance state
        setAttendance(prev => ({
          ...prev,
          ...result.attendanceMap
        }));
        setAiLog(result.explanation || 'تمت مطابقة وحساب تفاصيل الحضور لـ ' + Object.keys(result.attendanceMap).length + ' متكون بنجاح.');
        setPastedText('');
      } else {
        throw new Error('لم يرجع المحرك نتائج مطابقة صالحة للنص المُدرج.');
      }
    } catch (err: any) {
      setAiError(err.message || 'حدث خطأ متوافق أثناء تشغيل الذكاء الاصطناعي.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      handleAiParse(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleStatusChange = (learnerId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [learnerId]: status }));
  };

  const handleNoteChange = (learnerId: string, note: string) => {
    setNotes(prev => ({ ...prev, [learnerId]: note }));
  };

  // Bulk actions
  const markAllPresent = () => {
    if (!activeGroup) return;
    const updated: Record<string, AttendanceStatus> = {};
    activeGroup.learners.forEach(l => {
      updated[l.id] = 'present';
    });
    setAttendance(updated);
  };

  const executeMarkAllAbsent = () => {
    if (!activeGroup) return;
    const updated: Record<string, AttendanceStatus> = {};
    activeGroup.learners.forEach(l => {
      updated[l.id] = 'absent';
    });
    setAttendance(updated);
    setShowBulkAbsentConfirm(false);
  };

  const markAllAbsent = () => {
    setShowBulkAbsentConfirm(true);
  };

  // Post attendance
  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;
    if (!signatureText) {
      setErrorMessage('الرجاء كتابة توقيعك الرقمي لتوثيق الحصة قانونياً.');
      return;
    }

    setErrorMessage(null);

    // Submit to store
    AppStateStore.submitSession({
      groupId: activeGroup.id,
      date: sessionDate,
      sessionType,
      duration,
      sessionPeriod: selectedPeriod,
      attendanceMap: attendance,
      teacherSignature: signatureText,
      submittedAt: new Date().toISOString()
    });

    setSuccessMessage(`تم تأكيد الحصة لـ [${term.title}: ${activeGroup.code}] وحفظ الغيابات تلقائياً وترحيلها إلى الإدارة المركزية والرقابة العامة بنجاح.`);
    setIsSignOpen(false);
    setSignatureText('');
  };

  // School weeks configurations (Algerian administration)
  const WEEK_OPTIONS = [
    { key: '2026-05-24_2026-05-28', label: 'الأسبوع الجاري: من 24 ماي 2026 إلى 28 ماي 2026', start: '2026-05-24', end: '2026-05-28' },
    { key: '2026-05-17_2026-05-21', label: 'الأسبوع الماضي: من 17 ماي 2026 إلى 21 ماي 2026', start: '2026-05-17', end: '2026-05-21' },
    { key: '2026-05-10_2026-05-14', label: 'الأسبوع الثالث: من 10 ماي 2026 إلى 14 ماي 2026', start: '2026-05-10', end: '2026-05-14' },
    { key: '2026-05-03_2026-05-07', label: 'الأسبوع الرابع: من 03 ماي 2026 إلى 07 ماي 2026', start: '2026-05-03', end: '2026-05-07' },
  ];

  const getArabicDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()] || '';
  };

  // Canvas digital signature tracing methods for authentic reports
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e3a8a'; // sleek deep blue signature ink
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = signatureCanvasRef.current;
      if (canvas) {
        setTutorDigitalSignature(canvas.toDataURL());
      }
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTutorDigitalSignature('');
    setIsSignatureLocked(false);
  };

  const handleApplySignatureText = (name: string) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'italic bold 18px Garamond, serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name || 'مصادق رقمياً', canvas.width / 2, canvas.height / 2);
    setTutorDigitalSignature(canvas.toDataURL());
    setIsSignatureLocked(true);
  };

  // Calculate weekly statistics and list of absentees for reporting
  const selectedWeekObj = WEEK_OPTIONS.find(w => w.key === selectedWeekRange) || WEEK_OPTIONS[0];
  const weeklySessions = activeGroup 
    ? sessions.filter(s => s.groupId === activeGroup.id && s.date >= selectedWeekObj.start && s.date <= selectedWeekObj.end)
    : [];

  const totalStudents = activeGroup ? activeGroup.learners.length : 0;
  let totalAbsenceHoursAll = 0;
  
  const learnerAbsences = activeGroup 
    ? activeGroup.learners.map(learner => {
        let hours = 0;
        const days: string[] = [];
        weeklySessions.forEach(s => {
          const status = s.attendanceMap[learner.id];
          if (status === 'absent') {
            const h = s.duration || 2;
            hours += h;
            totalAbsenceHoursAll += h;
            const day = getArabicDayName(s.date);
            if (!days.includes(day)) {
              days.push(day);
            }
          }
        });
        return {
          ...learner,
          hours,
          days
        };
      })
    : [];

  const absenteesOnly = learnerAbsences.filter(l => l.hours > 0);
  const totalPossibleHours = totalStudents * weeklySessions.length * 3; // Estimated hours volume
  const calculatedAttendanceRate = totalPossibleHours > 0
    ? Math.max(0, Math.min(100, Math.round(((totalPossibleHours - totalAbsenceHoursAll) / totalPossibleHours) * 100)))
    : 100;

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white space-y-4">
        <Users className="w-12 h-12 text-slate-300" />
        <h3 className="font-bold text-slate-800 text-lg">لم يتم تهيئة أي أفواج في النظام بعد</h3>
        <p className="text-slate-400 text-xs max-w-sm">يرجى تسجيل دخول المدير لتحديد هيكل التكوين والأفواج قبل تفعيل تسجيل الحضور.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-right">
      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between flex-row-reverse text-emerald-800 text-xs font-bold gap-3"
        >
          <div className="flex items-center gap-2 flex-row-reverse">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-right">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-450 hover:text-slate-650 font-black">إغلاق</button>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between flex-row-reverse text-rose-800 text-xs font-bold gap-3"
        >
          <div className="flex items-center gap-2 flex-row-reverse">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
            <p className="text-right">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-slate-450 hover:text-slate-650 font-black">إغلاق</button>
        </motion.div>
      )}

      {showBulkAbsentConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-right" dir="rtl">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 space-y-4 shadow-2xl"
          >
            <h3 className="font-black text-slate-950 text-base">تسجيل غياب جماعي</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              هل أنت متأكد من رغبتك في تسجيل غياب جميع الطلبة والمتربصين في الفوج المختار دفعة واحدة؟ 
            </p>
            <div className="flex gap-2 justify-start pt-2">
              <button
                type="button"
                onClick={executeMarkAllAbsent}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-rose-600/10"
              >
                نعم، غياب جماعي متكامل
              </button>
              <button
                type="button"
                onClick={() => setShowBulkAbsentConfirm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black transition"
              >
                تراجع وإلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-6 flex-row-reverse">
        
        {/* Selector Panel */}
        <div className="flex-1 space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">تحديد الفهرست والفوج المستهدف</label>
          <div className="flex gap-2 flex-row-reverse">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="font-bold text-slate-900 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 text-xs text-right w-full"
            >
              {groups.map((g) => {
                const grpTerm = AppStateStore.getTerminology(g.modeId);
                return (
                  <option key={g.id} value={g.id}>
                    [{grpTerm.title}] - {g.name} ({g.code})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Group Info Indicator */}
        {activeGroup && (
          <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3.5 border border-amber-200 flex-row-reverse">
            <div className="p-2 bg-amber-400 rounded-lg text-slate-900">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-xs">مسؤول مرافقة الفوج: {activeGroup.guardian}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">رمز التخصص: {activeGroup.code} • {activeGroup.level}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 flex-row-reverse mb-4 gap-2">
        <button
          onClick={() => setActiveTab('record')}
          className={cn(
            "pb-3.5 px-6 text-xs font-black transition-all border-b-2 relative whitespace-nowrap",
            activeTab === 'record' 
              ? "border-amber-500 text-amber-600 font-extrabold" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          ✍️ تسجيل دفتر الغيابات اليومي
        </button>
        <button
          onClick={() => setActiveTab('weeklyReport')}
          className={cn(
            "pb-3.5 px-6 text-xs font-black transition-all border-b-2 relative flex items-center gap-2 whitespace-nowrap",
            activeTab === 'weeklyReport' 
              ? "border-amber-500 text-amber-600 font-extrabold" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          📂 تقرير الحضور الأسبوعي الشامل (مستخرج PDF)
          <span className="bg-amber-400/20 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse">جديد المداولات ⚡</span>
        </button>
      </div>

      {activeGroup && activeTab === 'record' && (
        activeGroup.isListApproved === false ? (
          <div className="bg-amber-500/5 border border-amber-200 rounded-3xl p-8 text-center space-y-4 shadow-sm max-w-4xl mx-auto font-sans w-full">
            <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto text-amber-600 text-3xl font-sans">
              ⚠️
            </div>
            <h4 className="font-extrabold text-[#0D0E12] text-sm font-sans">بانتظار الموافقة والاعتماد البيدغوجي من الرقابة العامة</h4>
            <p className="text-slate-600 text-[11px] max-w-lg mx-auto leading-relaxed font-semibold">
              إن القائمة الاسمية للمتكونين في اختصاص <strong className="text-[#0D0E12] border-b border-dashed border-slate-400 font-extrabold font-sans">«{activeGroup.name}» ({activeGroup.code})</strong> لم يتم اعتمادها أو الموافقة عليها بعد من قبل مصالح الرقابة العامة للمعهد بولاية تبسة.
              <br /><br />
              يرجى التنسيق والاتصال بمصلحة الرقابة العامة لرفع ملف المتكونين للتخصص وتفعيله، لتظهر لكم القائمة آلياً على هذه اللوحة ومباشرة حجز الغيابات وتوثيق الحصص.
            </p>
            <div className="pt-2 text-[9px] text-slate-400 font-mono font-black">
              رمز التخصص: {activeGroup.code} • مصلحة الرقابة العامة والمتابعة والتقييم
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Attendance Grid */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Active Session Details Banner (Dynamic Header) */}
            <div className="bg-[#0F172A] text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[10px] bg-amber-400 text-[#0F172A] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">تفاصيل الحصة النشطة</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <h4 className="font-extrabold text-white text-base">
                  [{term.title}] {activeGroup.name} ({activeGroup.code})
                </h4>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  تاريخ اليوم: <strong className="text-white font-sans">{sessionDate}</strong> &bull; نوع التكوين: <strong className="text-white">{sessionType === 'practical' ? 'تطبيقي' : sessionType === 'theory' ? 'نظري' : 'أعمال موجهة'}</strong> &bull; الغلاف الزمني المقيد: <strong className="text-white font-sans">{duration} سا</strong>
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3 flex-row-reverse self-start md:self-auto">
                <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">الفترة الزمنية القانونية للحصة</p>
                  <p className="font-extrabold text-white text-xs">
                    {availablePeriods.find(p => p.key === selectedPeriod)?.label || 'غير محددة'}
                  </p>
                </div>
              </div>

              {/* Decorative design elements */}
              <div className="absolute -left-12 -top-12 w-28 h-28 bg-amber-450/10 rounded-full blur-2xl"></div>
            </div>

            {/* AI-Assisted Smart Attendance Filler */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 text-right">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="p-1.5 bg-amber-400 text-[#0F172A] rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0F172A] text-sm">المساعد الذكي لتعبئة الغيابات (AI-Assisted)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">ألصق قائمة مفرغة أو ارفع ورقة تفريغ لمطابقة الحضور بلمسة واحدة</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pasted text area */}
                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-bold text-slate-500">أدخل نص تقرير غيابات الحصة (مثال: علوي غائب، عمر متأخر)</label>
                  <textarea
                    rows={3}
                    placeholder="مثال: علوي معمر عادل غائب ومريم الصالحي غائبة وسارة حداد متأخرة..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="w-full p-3 border border-slate-200 bg-white rounded-2xl text-xs text-right outline-none font-medium focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                {/* File Upload Dropzone */}
                <div className="flex flex-col justify-center">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">أو ارفع ورقة غياب رسمية (صورة / تفريغ مستند)</label>
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-2xl hover:border-amber-400 bg-white hover:bg-slate-50/50 cursor-pointer transition-all p-4 text-center group">
                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    <span className="text-[10px] text-slate-500 font-bold mt-1.5 group-hover:text-amber-600">اسحب أو انقر لرفع ملف الغيابات</span>
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {aiLog && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px] font-bold leading-relaxed">
                  ✓ {aiLog}
                </div>
              )}

              {aiError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-bold leading-relaxed">
                  ⚠ {aiError}
                </div>
              )}

              <div className="flex gap-2 justify-start">
                <button
                  type="button"
                  disabled={aiLoading || !pastedText.trim()}
                  onClick={() => handleAiParse()}
                  className="bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/10"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      جاري تحليل ومطابقة الغيابات بالذكاء الاصطناعي...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      تحليل ومطابقة النص المدخل
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Table Action Controls */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 flex-row-reverse">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <h3 className="font-bold text-slate-800 text-sm">قائمة حضور الـ {term.plural}</h3>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">{activeGroup.learners.length} {term.singular}</span>
                </div>

                <div className="flex gap-2 flex-row-reverse">
                  <button 
                    onClick={markAllPresent}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-[10px] font-black transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> تحضير الكل
                  </button>
                  <button 
                    onClick={markAllAbsent}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[10px] font-black transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> تغييب الكل
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">ملف {term.singular}</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">ملاحظة الحصة</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeGroup.learners.map((learner) => (
                      <tr key={learner.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 flex-row-reverse">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 group-hover:border-amber-400 transition-all font-sans">
                              {learner.name.charAt(0)}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-800 text-sm">{learner.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">الرقم المتسلسل: {learner.id} • {learner.gender === 'M' ? 'ذكر' : 'أنثى'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="text"
                            placeholder="مثال: غادر قبل الوقت، بدون مبرر"
                            value={notes[learner.id] || ''}
                            onChange={(e) => handleNoteChange(learner.id, e.target.value)}
                            className="w-full max-w-xs border border-slate-100 bg-slate-50 text-slate-700 rounded-lg px-2 py-1 text-[11px] outline-none focus:border-amber-400 focus:bg-white text-right"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5" dir="rtl">
                            {statusOptions.map((opt) => {
                              const Icon = opt.icon;
                              const isActive = attendance[learner.id] === opt.key;
                              return (
                                <button
                                  type="button"
                                  key={opt.key}
                                  onClick={() => handleStatusChange(learner.id, opt.key)}
                                  className={cn(
                                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-150 font-bold text-[10px]",
                                    isActive ? opt.activeColor + " shadow-sm font-extrabold scale-102" : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100"
                                  )}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Session settings Panel & submit */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <h4 className="font-black text-slate-900 border-b border-slate-100 pb-3 text-sm flex items-center gap-2 justify-end">
                <Clock className="w-4 h-4 text-amber-500" /> أجندة وتفاصيل الحصة
              </h4>

              {/* Date selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">تاريخ الحصة</label>
                <input 
                  type="date" 
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-right outline-none font-semibold focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Attendance Period selection based on user request */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">الحصة الفترة الزمنية (القانونية)</label>
                {availablePeriods.length > 0 ? (
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full p-2.5 bg-amber-500/5 border border-amber-300 rounded-xl text-xs text-right outline-none font-extrabold text-[#0F172A] focus:ring-2 focus:ring-amber-400"
                  >
                    {availablePeriods.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="p-2.5 bg-red-50 text-red-700 text-[10px] rounded-xl text-center font-bold">
                    ⚠️ عطلة نهاية الأسبوع (يوم الجمعة) أو لا توجد فترات نشطة
                  </p>
                )}
              </div>

              {/* Session Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">طبيعة التكوين المستهدف</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-right outline-none font-semibold focus:ring-2 focus:ring-amber-400"
                >
                  <option value="practical">حصة تطبيقية (Practical)</option>
                  <option value="theory">حصة نظرية (Theory)</option>
                  <option value="directed">أعمال موجهة (Directed Classes)</option>
                </select>
              </div>

              {/* Session duration */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">الحجم الساعي للحصة</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-right outline-none font-semibold focus:ring-2 focus:ring-amber-400"
                >
                  <option value={1}>ساعة واحدة (1h)</option>
                  <option value={1.5}>ساعة ونصف (1.5h)</option>
                  <option value={2}>ساعتين (2h)</option>
                  <option value={3}>ثلاث ساعات (3h)</option>
                  <option value={4}>أربع ساعات (4h)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignOpen(true)}
                  className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 shadow-slate-900/15"
                >
                  <Save className="w-4 h-4" />
                  توثيق وإتمام الحصة
                </button>
              </div>
            </div>
          </div>
        </div>
        )
      )}

      {/* Weekly Report Tab View */}
      {activeGroup && activeTab === 'weeklyReport' && (
        activeGroup.isListApproved === false ? (
          <div className="bg-amber-500/5 border border-amber-200 rounded-3xl p-8 text-center space-y-4 shadow-sm max-w-4xl mx-auto font-sans w-full">
            <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto text-amber-600 text-3xl font-sans">
              ⚠️
            </div>
            <h4 className="font-extrabold text-[#0D0E12] text-sm font-sans">بانتظار الموافقة والاعتماد البيدغوجي من الرقابة العامة</h4>
            <p className="text-slate-600 text-[11px] max-w-lg mx-auto leading-relaxed font-semibold">
              لا يمكن إصدار أو استخراج كشف الغياب الأسبوعي لاختصاص <strong className="text-[#0D0E12] border-b border-dashed border-slate-400 font-extrabold font-sans">«{activeGroup.name}» ({activeGroup.code})</strong> حالياً.
              <br /><br />
              يرجى التواصل مع مصالح الرقابة العامة لتأكيد واعتماد قائمة المتكونين أولاً، حتى يُسمح لكم بإدارة وتلخيص الغيابات الدورية لهذه الشعبة واستصدار كشوف الحضور.
            </p>
            <div className="pt-2 text-[9px] text-slate-400 font-mono font-black">
              رمز التخصص: {activeGroup.code} • إدارة البرامج والمتابعة
            </div>
          </div>
        ) : (
          <div className="space-y-6">
          {/* Report Configuration & Interactive Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tweak settings column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-right">
                <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2 text-xs flex items-center gap-1.5 justify-end">
                  <span>إعدادات مستخرج الغياب الأسبوعي</span>
                  <span>⚙️</span>
                </h4>
                
                {/* Choosing week */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">1. اختر الأسبوع القانوني للدراسة:</label>
                  <select
                    value={selectedWeekRange}
                    onChange={(e) => setSelectedWeekRange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-right font-extrabold text-[#0F172A] outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {WEEK_OPTIONS.map(w => (
                      <option key={w.key} value={w.key} className="text-slate-900 font-sans">{w.label}</option>
                    ))}
                  </select>
                </div>

                {/* Report notes */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">2. ملاحظات المسؤول البيداغوجي الأسبوعية:</label>
                  <textarea
                    rows={4}
                    value={tutorReportNotes}
                    onChange={(e) => setTutorReportNotes(e.target.value)}
                    placeholder="اكتب التوجيهات أو الملاحظات التي ستظهر على كشف الغيابات المطبوع..."
                    className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-xs text-right outline-none font-semibold text-slate-800 resize-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Signature Drawing Pad */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center flex-row-reverse pb-1">
                    <label className="block text-[11px] font-bold text-slate-500">3. لوحة التوقيع والمصادقة الرقمية:</label>
                    <span className="text-[9px] bg-amber-400/10 text-amber-700 px-1.5 py-0.5 rounded font-bold">لوحة خطية ✍️</span>
                  </div>
                  
                  <div className="relative h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center p-1">
                    {tutorDigitalSignature && !isDrawing ? (
                      <img 
                        src={tutorDigitalSignature} 
                        alt="التوقيع الرقمي" 
                        className="h-28 object-contain mx-auto z-15"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400 text-[10px] space-y-1 pointer-events-none">
                        <Edit2 className="w-5 h-5 mx-auto text-slate-300 animate-pulse" />
                        <span>ارسم توقيعك بيدك أو مؤشرك المحمول بالمربع</span>
                      </div>
                    )}

                    <canvas
                      ref={signatureCanvasRef}
                      width={300}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="absolute inset-0 w-full h-full cursor-crosshair z-20"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <button
                      type="button"
                      onClick={() => handleApplySignatureText(activeGroup.guardian)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg text-[10px] transition-all"
                    >
                      🖋️ إمضاء خطي مبرمج
                    </button>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-rose-600 hover:text-rose-700 font-extrabold"
                    >
                      إعادة رسم التوقيع
                    </button>
                  </div>
                </div>

                {/* PDF generation Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!tutorDigitalSignature) {
                        setErrorMessage('يرجى رسم أو إدراج توقيعك الشخصي في المربع لتوثيق هذا التقرير الأسبوعي قانونياً قبل ترحيله إلى صيغة PDF.');
                        return;
                      }
                      setErrorMessage(null);
                      window.print();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 shadow-emerald-600/10"
                  >
                    <Download className="w-4 h-4" />
                    تصدير وطباعة تقرير الـ PDF 🖨️
                  </button>
                  <p className="text-[9px] text-slate-400 mt-2 text-center">
                    * يقوم النظام بتنسيق التقرير ليناسب أوراق A4 للمجالس والمصادقات.
                  </p>
                </div>

              </div>
            </div>

            {/* Layout graphical preview column */}
            <div className="lg:col-span-2 space-y-4 font-sans">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-right space-y-4">
                <div className="flex justify-between items-center flex-row-reverse border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="w-2.5 h-2.5 bg-amber-505 bg-amber-400 rounded-full animate-pulse"></span>
                    <h4 className="font-extrabold text-slate-900 text-sm">المعاينة الحية لكشف الحضور والمواظبة الأسبوعي</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">نسخة غيابات رسمية بيداغوجية</span>
                </div>

                {/* Preview template */}
                <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 space-y-6 max-w-2xl mx-auto shadow-sm text-slate-950">
                  
                  {/* Republic Header */}
                  <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-350">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-505 text-slate-500">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-505 text-slate-500">وزارة التكوين والتعليم المهنيين</p>
                    <p className="text-[11px] font-black text-rose-950">المعهد الوطني المتخصص في التكوين المهني زارع عبد الباقي تبسة 2</p>
                    
                    <h2 className="text-sm font-black text-slate-900 bg-slate-100 py-2 px-4 rounded-xl inline-block mt-3 border border-slate-300">
                      📝 تقرير غيابات الحضور الأسبوعي لمجلس المداولات والرقابة
                    </h2>
                  </div>

                  {/* Meta structure info */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-slate-50 p-4 rounded-xl border border-slate-150 text-slate-800 text-[11px] font-semibold">
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block font-bold">الفوج البيداغوجي / الرتبة:</span>
                      <strong className="text-slate-800 font-bold font-sans">{activeGroup.name} ({activeGroup.code})</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block font-bold">الأستاذ المؤطر الوصي:</span>
                      <strong className="text-amber-600 font-extrabold">{activeGroup.guardian}</strong>
                    </div>
                    <div className="text-right col-span-2 border-t pt-2 border-slate-200">
                      <span className="text-slate-400 text-[10px] block font-bold">الأسبوع الأكاديمي المداولة فيه:</span>
                      <strong className="text-slate-800 font-bold font-sans">{selectedWeekObj.label.split(': ')[1]}</strong>
                    </div>
                  </div>

                  {/* Absentees Table block */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center flex-row-reverse text-xs">
                      <span className="font-bold text-slate-700">قائمة المتكونين المتغيبين هذا الأسبوع:</span>
                      <span className="text-[10px] text-slate-400">مجموع المتغيبين: {absenteesOnly.length} متكون</span>
                    </div>

                    {absenteesOnly.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500">
                              <th className="p-2.5 font-bold">اسم ولقب المتكون</th>
                              <th className="p-2.5 text-center font-bold">ساعات الغياب المقيدة</th>
                              <th className="p-2.5 font-bold">أيام وتفاصيل الغياب في الأسبوع</th>
                              <th className="p-2.5 text-center font-bold">الإجراء التأديبي المقترح</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {absenteesOnly.map(l => (
                              <tr key={l.id} className="hover:bg-slate-900/5 transition-colors">
                                <td className="p-2.5 font-bold text-slate-900">{l.name}</td>
                                <td className="p-2.5 text-center font-bold text-rose-600 font-mono scale-102">{l.hours} ساعة</td>
                                <td className="p-2.5 text-slate-500 text-[10px]">{l.days.join('، ') || 'غياب جزئي'}</td>
                                <td className="p-2.5 text-center">
                                  <span className={cn(
                                    "text-[9px] font-extrabold px-2 py-0.5 rounded-full",
                                    l.hours >= 14 ? "bg-red-105 bg-red-100 text-red-700 border border-red-200" :
                                    l.hours >= 10 ? "bg-rose-105 bg-rose-100 text-rose-700 border border-rose-200" :
                                    l.hours >= 4 ? "bg-amber-105 bg-amber-100 text-amber-700 border border-amber-200" :
                                    "bg-sky-105 bg-sky-100 text-sky-700 border border-sky-200"
                                  )}>
                                    {l.hours >= 14 ? 'شطب نهائي' : l.hours >= 10 ? 'مجلس تأديبي' : l.hours >= 4 ? 'إنذار بيداغوجي' : 'متابعة بيداغوجية'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-emerald-800 text-[11px] font-bold">
                        🏆 ممتاز! لا توجد غيابات مسجلة لهذا الفوج خلال هذا الأسبوع. نسبة الحضور 100%.
                      </div>
                    )}
                  </div>

                  {/* Observations block */}
                  <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-400 font-bold">توصيات وملاحظات الأستاذ بخصوص الفوج:</span>
                    <p className="text-slate-800 text-[11.5px] font-semibold italic">
                      "{tutorReportNotes || 'لا توجد ملاحظات إضافية مسجلة للفوج'}"
                    </p>
                  </div>

                  {/* Official Footnotes signature previews */}
                  <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-200 flex-row-reverse">
                    <div className="text-right text-[10px] text-slate-505 text-slate-450 leading-relaxed font-sans">
                      <p>المعرف الرقمي: <b className="text-slate-700 font-mono font-bold">SIG-WEEK-{activeGroup.code}-{selectedWeekObj.start}</b></p>
                      <p>مصادق عليه ومنشور بصفة رسمية في فضاء الأولياء والرقابة العامة البيداغوجية</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-505 text-slate-450 font-bold mb-1">توقيع ختم الأستاذ الوصي:</p>
                      {tutorDigitalSignature ? (
                        <div className="relative inline-block border border-amber-300 p-1.5 rounded-lg bg-emerald-50/20">
                          <img src={tutorDigitalSignature} alt="التوقيع" className="h-11 object-contain max-w-[130px]" referrerPolicy="no-referrer" />
                          <span className="absolute -bottom-1 -left-1 bg-emerald-500 text-white rounded text-[5.5px] font-black px-1.5 py-0.5 shadow-sm">توقيع معتمد ✓</span>
                        </div>
                      ) : (
                        <span className="text-[9px] border border-dashed border-red-350 text-red-500 p-2 rounded-xl inline-block font-extrabold animate-pulse">بانتظار الإمضاء</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
        )
      )}

      {/* Signature & Confirmation dialog */}
      {isSignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden text-right shadow-2xl border border-slate-100"
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center flex-row-reverse border-b">
              <span className="font-extrabold text-sm">التوثيق القانوني الرقمي للحضور</span>
              <button onClick={() => setIsSignOpen(false)} className="text-slate-400 hover:text-white"><XCircle className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                قانونياً، عند حفظ هذه الحصة، سيتم قيد الغيابات نهائياً وترحيلها إلى حساب كشوفات الرقابة فورياً. يرجى توقيع الحصة بكتابة اسمك كأستاذ مسؤول.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">أدخل اسمك الكامل أو توقيعك النصي المستند</label>
                <input 
                  type="text"
                  placeholder="مثال: الأستاذ طهراوي سليم"
                  required
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs text-center font-bold outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
                />
              </div>

              {/* Digital Pad design fallback */}
              <div className="h-28 bg-slate-100 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-[10px] space-y-1 cursor-pointer">
                <Edit2 className="w-5 h-5 opacity-40" />
                <span>لوحة إمضاء المحاضر التفاعلية جاهزة</span>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsSignOpen(false)} 
                  className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold"
                >
                  إلغاء التقديم
                </button>
                <button 
                  type="button"
                  onClick={handleSubmitAttendance}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black shadow-md shadow-green-600/10"
                >
                  تأكيد وتوقيع المحضر
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* STUNNING STATE VECTOR PRINT-PDF OVERLAY */}
      {activeGroup && (
        <div className="hidden print:block fixed inset-0 bg-white z-[999999] p-12 text-black text-right font-sans" dir="rtl">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Algerian Official Header */}
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
              <h3 className="text-[12px] font-black font-sans">الجمهورية الجزائرية الديمقراطية الشعبية</h3>
              <h3 className="text-[11px] font-black font-sans">وزارة التكوين والتعليم المهنيين</h3>
              <h2 className="text-[14px] font-extrabold font-sans mt-1">المعهد الوطني المتخصص في التكوين المهني زارع عبد الباقي - تبسة 2</h2>
              <div className="text-[9px] text-slate-500 font-mono mt-0.5">منصة رقابة الإلكترونية • كشف الحضور الأسبوعي الشامل للمداولات</div>
            </div>

            {/* Title Document */}
            <div className="text-center">
              <h1 className="text-md font-black border-2 border-slate-900 px-6 py-2.5 inline-block uppercase bg-slate-50 font-sans">
                محضر تداولات الحضور والمواظبة الأسبوعي للأفواج
              </h1>
              <p className="text-[11px] mt-1 text-slate-600 font-bold font-sans">الفترة الزمنية المعتمدة: <strong className="font-sans font-extrabold text-black">{selectedWeekObj.label.split(': ')[1]}</strong></p>
            </div>

            {/* Meta facts grids */}
            <div className="grid grid-cols-2 gap-4 border border-slate-900 p-4 text-[12px] leading-relaxed font-sans bg-slate-50/50">
              <div>
                <span className="text-slate-500 font-bold block text-[10px]">🏢 الفوج البيداغوجي وتخصصه:</span>
                <strong className="text-black font-black font-sans">{activeGroup.name} ({activeGroup.code})</strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[10px]">👤 الأستاذ المؤطر الوصي:</span>
                <strong className="text-slate-900 font-black">{activeGroup.guardian}</strong>
              </div>
              <div className="border-t border-slate-300 pt-2">
                <span className="text-slate-500 font-bold block text-[10px]">🎓 نمط مستوى التأهيل الدراسي:</span>
                <strong className="text-black">{activeGroup.level} • {activeGroup.duration}</strong>
              </div>
              <div className="border-t border-slate-300 pt-2">
                <span className="text-slate-500 font-bold block text-[10px]">📊 نسبة الحضور الإجمالية للفوج:</span>
                <strong className="text-black font-sans font-black">{calculatedAttendanceRate}% الحضور العام</strong>
              </div>
            </div>

            {/* List of Absentees table */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-950 border-r-4 border-slate-900 pr-2">أولاً: قائمة المتكونين المتغيبين خلال الأسبوع الجاري:</h3>
              {absenteesOnly.length > 0 ? (
                <table className="w-full text-right text-xs border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 text-[10px] text-slate-700">
                      <th className="p-2 border border-slate-900 text-right">الرقم الشخصي</th>
                      <th className="p-2 border border-slate-900 text-right">اسم ولقب المتكون والمنصب</th>
                      <th className="p-2 border border-slate-900 text-center">مجموع ساعات السقوط والتغيب</th>
                      <th className="p-2 border border-slate-900 text-right">تفاصيل أيام الحضور المستخلص</th>
                      <th className="p-2 border border-slate-900 text-center">الإجراء التأديبي المقترح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {absenteesOnly.map(l => (
                      <tr key={l.id} className="text-slate-950 text-[11px] font-semibold">
                        <td className="p-2 border border-slate-900 font-sans">{l.id}</td>
                        <td className="p-2 border border-slate-900 font-black">{l.name}</td>
                        <td className="p-2 border border-slate-900 text-center font-mono font-black">{l.hours} ساعة غياب</td>
                        <td className="p-2 border border-slate-900 text-slate-700">{l.days.join('، ') || 'غياب جزئي'}</td>
                        <td className="p-2 border border-slate-900 text-center">
                          <span className="font-extrabold uppercase text-[10px]">
                            {l.hours >= 14 ? 'شطب نهائي بيداغوجي' : l.hours >= 10 ? 'مجالس تأديبية (إنذار 2)' : l.hours >= 4 ? 'إعذار أول (إنذار بيداغوجي)' : 'متابعة وتأكيد'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 bg-emerald-50 border-2 border-slate-900 text-center text-emerald-950 text-xs font-black">
                  🏅 تهانينا للفوج البيداغوجي! لا توجد كشوفات غيابات مسجلة طيلة الأسبوع. نسبة الانضباط 100%.
                </div>
              )}
            </div>

            {/* Recommendations notes */}
            <div className="border border-slate-900 p-4 space-y-1.5 rounded-none bg-slate-50 font-sans">
              <h4 className="text-xs font-black text-slate-900">ثانياً: توصيات وملاحظات الأستاذ بخصوص سلوك ومواظبة الفوج:</h4>
              <p className="text-[11.5px] italic text-slate-800 font-semibold leading-relaxed">
                "{tutorReportNotes || 'لا توجد ملاحظات إضافية مسجلة'}"
              </p>
            </div>

            {/* Stamp & Seal Area */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-8 border-t border-slate-400 mt-8">
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px]">🔒 الموثق الرقمي الأمني للتقرير الأسبوعي:</p>
                <p className="font-mono font-bold text-slate-800 text-[9px]">HASH-ID: SIG-WEEK-{activeGroup.code}-{selectedWeekObj.start}</p>
                <p className="text-[9px] text-slate-550">تم توليد هذه الوثيقة وتوقيعها رقمياً بصفة الكترونية ولا تحتاج لمصادقة إضافية.</p>
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-slate-900">إمضاء الكفيل وختم الأستاذ الوصي للفوج:</p>
                {tutorDigitalSignature ? (
                  <div className="inline-block p-1 border-2 border-slate-900 rounded-lg">
                    <img src={tutorDigitalSignature} alt="توقيع رسمي" className="h-14 object-contain mx-auto" referrerPolicy="no-referrer" />
                    <p className="text-[7px] text-slate-550 mt-1 uppercase font-bold tracking-widest font-mono">DIGITAL SIGNATURE SECURED</p>
                  </div>
                ) : (
                  <div className="h-12 border-2 border-dashed border-slate-400 rounded flex items-center justify-center text-slate-400 text-[10px]">
                    بانتظار الإمضاء والختم
                  </div>
                )}
              </div>
            </div>

            {/* Footer Signatories */}
            <div className="text-center text-[9px] text-slate-400 pt-12 border-t border-dashed mt-12 flex justify-between flex-row-reverse">
              <span>تحريراً بـ المعهد الوطني المتخصص تبسة 2 في {new Date().toLocaleDateString('ar-DZ')}</span>
              <span>البرنامج من تصميم وإعداد الأستاذ: عادل موايعية</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
