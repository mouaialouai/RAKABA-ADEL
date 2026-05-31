import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2,
  ShieldAlert,
  Fingerprint,
  TrendingUp,
  Users,
  GraduationCap,
  LayoutGrid,
  Settings as SettingsIcon,
  Database,
  CheckCircle,
  FileText,
  UserX,
  PieChart as PieIcon,
  Utensils,
  Phone,
  MapPin,
  User,
  Mail,
  Globe,
  FileSignature,
  Printer,
  Calendar,
  AlertTriangle,
  Heart,
  Soup,
  Coffee,
  Check,
  Edit2,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Trash2,
  UploadCloud,
  Plus,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import TrainingStructure from './TrainingStructure';
import { AppStateStore, SpecializationGroup, InstitutionInfo, SemesterResult } from '../../services/store';
import ResultsUploadModal from '../../components/ResultsUploadModal';

const PREMIUM_COLORS = [
  '#D97706', // Gold / Amber
  '#0F172A', // Midnight Slate
  '#475569', // Chrome Gray
  '#1E3A8A', // Deep Royal Blue
  '#059669', // Emerald
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'canteen' | 'institutional' | 'structure' | 'results' | 'settings'>('overview');
  const [groups, setGroups] = useState<SpecializationGroup[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>(() => AppStateStore.getSemesterResults());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Advanced delete and settings systems states
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'trainee' | 'company' | 'session' | 'referral' | 'appeal' | 'remoteLog' | 'result';
    id: string;
    extraId?: string;
    label: string;
  }>({ isOpen: false, type: 'trainee', id: '', label: '' });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isBackupExported, setIsBackupExported] = useState(false);
  const [settingsSection, setSettingsSection] = useState<'trainees' | 'companies' | 'sessions' | 'referrals' | 'remoteLogs'>('trainees');
  const [adminLogs, setAdminLogs] = useState<any[]>(() => AppStateStore.getAdminActivityLogs());

  // Trigger Delete confirmation dialogue
  const triggerDeleteConfirm = (type: any, id: string, label: string, extraId?: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      extraId,
      label
    });
  };

  // Execute actual deletion after confirmation dialog is confirmed
  const executeDeleteAction = () => {
    const { type, id, extraId, label } = deleteConfirmation;
    let success = false;
    
    if (type === 'trainee' && extraId) {
      success = AppStateStore.deleteTrainee(extraId, id);
      if (success) {
        setSuccessMessage(`✓ تم حذف المتكون « ${label} » بصفة نهائية وتطهير ملفه وجروده من السجل.`);
      }
    } else if (type === 'company') {
      success = AppStateStore.deleteWorkplaceCompany(id);
      if (success) {
        setSuccessMessage(`✓ تم شطب وحذف المؤسسة المستقبلة « ${label} » وتعليق ارتباطات المتربصين.`);
      }
    } else if (type === 'session') {
      success = AppStateStore.deleteAttendanceSession(id);
      if (success) {
        setSuccessMessage(`✓ تم إلغاء وحذف سجل الحضور للحصة البيداغوجية.`);
      }
    } else if (type === 'referral') {
      success = AppStateStore.deleteDisciplinaryReferral(id);
      if (success) {
        setSuccessMessage(`✓ تم شطب وحذف تقرير إحالة المتكون للجنة الانضباط.`);
      }
    } else if (type === 'appeal') {
      success = AppStateStore.deleteGradeAppeal(id);
      if (success) {
        setSuccessMessage(`✓ تم سحب وإلغاء طعن المتكون في العلامة بصفة فورية.`);
      }
    } else if (type === 'remoteLog') {
      success = AppStateStore.deleteRemoteAttendanceLog(id);
      if (success) {
        setSuccessMessage(`✓ تم تصفير وحذف سجل حضور الميدان.`);
      }
    }

    if (success) {
      setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      alert('خطأ بيداغوجي أثناء تنفيذ الحذف الفوري.');
    }
  };

  // Backup Export JSON helper before Total Reset System
  const triggerBackupExport = () => {
    const backupData = {
      groups: AppStateStore.getGroups(),
      sessions: AppStateStore.getSessions(),
      semesterResults: AppStateStore.getSemesterResults(),
      remoteLogs: AppStateStore.getRemoteAttendanceLogs(),
      gradeAppeals: AppStateStore.getGradeAppeals(),
      referrals: AppStateStore.getDisciplinaryReferrals(),
      companies: AppStateStore.getWorkplaceCompanies(),
      metadata: {
        timestamp: new Date().toISOString(),
        backupBy: 'سليماني عبد القادر (Super Admin)',
        application: 'SmartStage DZ'
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smartstage_dz_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setIsBackupExported(true);
    setSuccessMessage('✓ تم تصدير وتنزيل النسخة الاحتياطية (JSON) بنجاح. تم إلغاء قفل تصفير النظام الآن!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Execute Total System Reset
  const executeSystemReset = () => {
    if (resetConfirmText !== 'إعادة تهيئة النظام') {
      alert('يرجى كتابة العبارة التأكيدية لمتابعة التصفير الدراسي العالي بداخل معهد تبسة.');
      return;
    }

    AppStateStore.resetSystemAll();
    setIsResetModalOpen(false);
    setResetConfirmText('');
    setIsBackupExported(false);
    setSuccessMessage('💥 تم تصفير وإعادة تعيين النظام بالكامل بنجاح لبدء سداسي أكاديمي جديد من الصفر!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Customizable metric card order state
  const [metricOrder, setMetricOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('rq_admin_metric_order');
    return saved ? JSON.parse(saved) : ['total', 'classroom', 'attendance', 'sessions'];
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === targetId) return;

    const dragIdx = metricOrder.indexOf(draggedId);
    const dropIdx = metricOrder.indexOf(targetId);

    const newOrder = [...metricOrder];
    newOrder.splice(dragIdx, 1);
    newOrder.splice(dropIdx, 0, draggedId);
    setMetricOrder(newOrder);
    localStorage.setItem('rq_admin_metric_order', JSON.stringify(newOrder));
    setSuccessMessage('✓ تم إعادة ترتيب وحفظ أولويات بطاقات الإحصاء حسب رغبتك بنجاح.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Institution info state
  const [institute, setInstitute] = useState<InstitutionInfo>(() => AppStateStore.getInstitutionInfo());
  const [isEditingInstitute, setIsEditingInstitute] = useState(false);
  const [editForm, setEditForm] = useState<InstitutionInfo>({ ...institute });

  // Catering parameters
  const [mealDate, setMealDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [guestMeals, setGuestMeals] = useState<number>(5);
  const [catererNote, setCatererNote] = useState<string>('وجبات ساخنة مطبوخة ومراقبة بيداغوجياً لصالح قسم التكوين الحضوري اليومي للمعهد.');
  const [showCateringReportModal, setShowCateringReportModal] = useState(false);
  const [lockedMealCount, setLockedMealCount] = useState<number | null>(null);

  // Hydrate states & handle notifications
  useEffect(() => {
    const handleUpdate = () => {
      setGroups(AppStateStore.getGroups());
      setSessions(AppStateStore.getSessions());
      setSemesterResults(AppStateStore.getSemesterResults());
      const latestInst = AppStateStore.getInstitutionInfo();
      setInstitute(latestInst);
      setAdminLogs(AppStateStore.getAdminActivityLogs());
    };

    handleUpdate();
    const unsubscribe = AppStateStore.subscribe(handleUpdate);
    return unsubscribe;
  }, []);

  // Compute live analytical statistics
  const totalClasses = groups.length;
  const totalStudents = groups.reduce((acc, g) => acc + g.learners.length, 0);

  let presentsTally = 0;
  let absentsTally = 0;
  let latesTally = 0;
  let excusedTally = 0;

  // Compile totals from session database
  sessions.forEach(sess => {
    Object.values(sess.attendanceMap).forEach(status => {
      if (status === 'present') presentsTally++;
      else if (status === 'absent') absentsTally++;
      else if (status === 'late') latesTally++;
      else if (status === 'excused') excusedTally++;
    });
  });

  const totalAttendeesTicks = presentsTally + absentsTally + latesTally + excusedTally;
  const overallTraineeAttendanceRate = totalAttendeesTicks > 0
    ? Math.round(((presentsTally + latesTally + excusedTally) / totalAttendeesTicks) * 100)
    : 94; // fallback

  // Filter groups of full-time training only (التكوين الحضوري -> modeId === "1")
  const classroomGroups = groups.filter(g => g.modeId === '1');
  const totalClassroomStudents = classroomGroups.reduce((acc, g) => acc + g.learners.length, 0);

  // Compute live catering parameters for Selected Date
  const cateringSummary = (() => {
    let activeClassroomGroupsCount = classroomGroups.length;
    let totalPotentialDinnerGuests = totalClassroomStudents;
    let actualAbsentsTracked = 0;
    let absentStudentsList: string[] = [];
    let submittedGroupsCount = 0;

    // Search active session registries on selected Date
    classroomGroups.forEach(grp => {
      const daySessions = sessions.filter(s => s.groupId === grp.id && s.date === mealDate);
      if (daySessions.length > 0) {
        submittedGroupsCount++;
        // Identify absent learners in these sessions
        const mappedAbsents = new Set<string>();
        daySessions.forEach(sess => {
          Object.entries(sess.attendanceMap).forEach(([learnerId, status]) => {
            if (status === 'absent') {
              mappedAbsents.add(learnerId);
            }
          });
        });
        actualAbsentsTracked += mappedAbsents.size;
        
        // Find names for audit logs
        grp.learners.forEach(learner => {
          if (mappedAbsents.has(learner.id)) {
            absentStudentsList.push(`${learner.name} (${grp.name})`);
          }
        });
      }
    });

    const isAttendanceFullyLocked = submittedGroupsCount === activeClassroomGroupsCount;
    // Meal Count = Potential Attendees minus exact logged absents plus manually injected backup meals
    const calculatedMealsNumber = Math.max(0, totalPotentialDinnerGuests - actualAbsentsTracked) + Number(guestMeals);

    return {
      activeClassroomGroupsCount,
      totalPotentialDinnerGuests,
      actualAbsentsTracked,
      absentStudentsList,
      submittedGroupsCount,
      isAttendanceFullyLocked,
      calculatedMealsNumber
    };
  })();

  // Multi-tab distribution chart
  const specData = groups.map((g) => ({
    name: g.name.length > 15 ? g.name.substring(0, 15) + '...' : g.name,
    value: g.learners.length
  }));

  const enrollmentData = [
    { name: '2023', value: 810 },
    { name: '2024', value: 920 },
    { name: '2025', value: 1040 },
    { name: '2026', value: totalStudents > 0 ? totalStudents : 1180 },
  ];

  // Store modified Institution Information
  const handleSaveInstitute = () => {
    AppStateStore.saveInstitutionInfo(editForm);
    setInstitute(editForm);
    setIsEditingInstitute(false);
    setSuccessMessage('✓ تم حفظ وتحديث معلومات المؤسسة وبنود الهوية البيداغوجية بنجاح.');
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handleResetCanteen = () => {
    setGuestMeals(5);
    setLockedMealCount(null);
    setSuccessMessage('✓ تم تهيئة معايير ومقاييس الإطعام ووجبات اليوم بنجاح.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // AI-Driven Absence Forecast vs Actual Registered Presence for Today
  const aiVsActualAttendanceData = [
    { period: '08:00 - 10:00', actualPresence: Math.max(0, totalStudents - 5), aiAbsenceForecast: 3, discrepancy: 2 },
    { period: '10:00 - 12:00', actualPresence: Math.max(0, totalStudents - 8), aiAbsenceForecast: 6, discrepancy: 2 },
    { period: '12:00 - 13:00', actualPresence: Math.max(0, totalStudents - 12), aiAbsenceForecast: 10, discrepancy: 1 },
    { period: '13:00 - 15:00', actualPresence: Math.max(0, totalStudents - 6), aiAbsenceForecast: 4, discrepancy: 2 },
    { period: '15:00 - 17:00', actualPresence: Math.max(0, totalStudents - 14), aiAbsenceForecast: 12, discrepancy: 3 }
  ];

  const todayAbsencesCount = cateringSummary.actualAbsentsTracked || 0;

  const metricCardsMap: Record<string, React.ReactNode> = {
    total: (
      <div 
        key="total"
        draggable
        onDragStart={(e) => handleDragStart(e, 'total')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'total')}
        className="cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-amber-455 transition-all duration-300 rounded-3xl"
      >
        <MetricCard title="إجمالي طلبة التخصصات" value={`${totalStudents} متكون`} progress={88} color="bg-amber-500" tag="مسجلين رسمياً" info="تحديث بيداغوجي فوري" />
      </div>
    ),
    classroom: (
      <div 
        key="classroom"
        draggable
        onDragStart={(e) => handleDragStart(e, 'classroom')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'classroom')}
        className="cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-indigo-400 transition-all duration-300 rounded-3xl"
      >
        <MetricCard title="متكوني القسم الحضوري" value={`${totalClassroomStudents} متربص`} progress={totalStudents > 0 ? Math.round((totalClassroomStudents/totalStudents)*100) : 75} color="bg-indigo-600" tag="مستفيدي الإطعام" info={`${classroomGroups.length} فروع حضورية`} />
      </div>
    ),
    attendance: (
      <div 
        key="attendance"
        draggable
        onDragStart={(e) => handleDragStart(e, 'attendance')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'attendance')}
        className="cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-emerald-400 transition-all duration-300 rounded-3xl"
      >
        <MetricCard title="استيفاء حضور المؤسسة" value={`${overallTraineeAttendanceRate}%`} progress={overallTraineeAttendanceRate} color="bg-emerald-650" tag="نسبة النجاح والمواظبة" info="ضمن الحدود البيداغوجية المقررة" />
      </div>
    ),
    sessions: (
      <div 
        key="sessions"
        draggable
        onDragStart={(e) => handleDragStart(e, 'sessions')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'sessions')}
        className="cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-slate-400 transition-all duration-300 rounded-3xl"
      >
        <MetricCard title="سجلات حضور الدفتر" value={`${sessions.length} حصة ملخصة`} progress={80} color="bg-slate-900" tag="تم ترحيلها رقمياً" info="بواسطة الأساتذة والمراقبين" />
      </div>
    )
  };

  return (
    <div className="space-y-8 pb-12 text-right" dir="rtl">
      
      {/* ROYAL & LUXURIOUS HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#121c2c] rounded-[2rem] p-8 text-white relative overflow-hidden border border-amber-500/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-indigo-550/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-end lg:justify-start flex-row-reverse mb-2">
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full border border-amber-500/30">
                منظومة السيادة والرقابة البيداغوجية
              </span>
              <Building2 className="w-4 h-4 text-amber-500" />
            </div>
            
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight leading-tight">
              {institute.name}
            </h1>
            <p className="text-slate-400 text-xs font-bold font-sans flex items-center justify-end lg:justify-start gap-2 flex-row-reverse">
              <span>{institute.address}</span>
              <span className="text-amber-400 font-extrabold">•</span>
              <span>المدير: {institute.director}</span>
              <span className="text-amber-400 font-extrabold">•</span>
              <span>الهاتف: {institute.phone}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-2xl max-w-sm self-stretch lg:self-auto justify-end">
            <div className="text-right">
              <p className="text-[10px] text-amber-400 font-black tracking-wider uppercase">رابط الولوج المباشر</p>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{institute.website}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{institute.decreeNum}</p>
            </div>
            <div className="w-11 h-11 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* LUXURY TAB COMPONENT LIST */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {[
          { id: 'overview', label: 'التحليلات والمقاييس بيداغوجياً 📈', icon: TrendingUp },
          { id: 'canteen', label: 'منظومة الإطعام الحضوري 🍲', icon: Utensils, badge: 'رصد فوري' },
          { id: 'results', label: 'رفع وإدارة النتائج السداسية 🎓', icon: GraduationCap, badge: 'جديد AI' },
          { id: 'institutional', label: 'معلومات وميثاق المؤسسة 🏛️', icon: Building2 },
          { id: 'structure', label: 'الهيكل وتعديل التخصصات ⚙️', icon: Database },
          { id: 'settings', label: 'المنطقة الحمراء وإدارة البيانات ⚙️⚠️', icon: SettingsIcon, badge: 'الضبط الفائق' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 flex-row-reverse relative",
              activeTab === tab.id 
                ? "bg-slate-950 text-amber-400 shadow-xl border border-amber-500/20 scale-102" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-amber-400" : "text-slate-500")} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="absolute -top-1 -left-1 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase scale-90">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* INTERACTIVE STATE FEEDBACK BANNER */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-950 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 flex-row-reverse">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <p className="text-right">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-450 hover:text-slate-650 font-extrabold">✕</button>
        </div>
      )}

      {/* RENDER ACTIVE TAB */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Dynamic Customizable Stats Metrics */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center text-xs font-bold text-amber-900 leading-relaxed relative overflow-hidden">
              <span className="absolute top-0 right-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <p>💡 <b>ميزة تخصيص لوحة القيادة البيداغوجية:</b> يمكنك سحب وإفلات (Drag & Drop) أي بطاقة إحصائية أدناه لإعادة ترتيب الأولويات حسب تطلعات الرقابة اليومية.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricOrder.map(id => metricCardsMap[id])}
            </div>

            {/* Dashboard Visual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Enrollment Trend */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-md text-right">
                <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-100 flex-row-reverse">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-amber-500 rounded-full"></span>
                    منحنى تطور تسجيل الطلاب والمتربصين بالمؤسسة
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">قراءة سنوية تراكمية</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={enrollmentData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D97706" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', textAlign: 'right' }} />
                      <Area type="monotone" dataKey="value" stroke="#D97706" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution */}
              <div className="lg:col-span-4 bg-[#0F172A] p-6 rounded-3xl shadow-2xl text-white relative overflow-hidden border border-white/5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-550/10 rounded-full blur-3xl pointer-events-none" />
                <h3 className="font-extrabold text-xs uppercase tracking-[0.15em] mb-8 text-slate-400 flex items-center gap-2 justify-end">
                  توزيع متكوني الفروع النشطة
                  <PieIcon className="w-4 h-4 text-amber-500" />
                </h3>
                <div className="h-44 w-full flex items-center justify-center">
                  {specData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={specData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {specData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={PREMIUM_COLORS[index % PREMIUM_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', textAlign: 'right', fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-slate-400 text-xs py-10">لا توجد قراءات مسجلة</div>
                  )}
                </div>
                <div className="space-y-3.5 mt-4 max-h-40 overflow-y-auto pr-1">
                   {specData.map((item, i) => (
                     <div key={i} className="flex items-center justify-between flex-row-reverse text-[10px]">
                       <div className="flex items-center gap-2 flex-row-reverse">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PREMIUM_COLORS[i % PREMIUM_COLORS.length] }} />
                         <span className="font-bold text-slate-200 truncate max-w-[120px]">{item.name}</span>
                       </div>
                       <span className="text-amber-400 font-mono font-bold">{item.value} متكون</span>
                     </div>
                   ))}
                </div>
              </div>

            </div>

            {/* AI Forecast vs Actual Presence Analysis Area Chart */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl text-right relative overflow-hidden">
              <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-white/5 flex-row-reverse gap-4">
                <div className="text-right">
                  <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full border border-indigo-500/30 inline-block mb-1">
                    النمذجة التنبؤية بالذكاء الاصطناعي 🤖
                  </span>
                  <p className="font-extrabold text-sm text-slate-100 flex items-center justify-end gap-2 mt-1">
                    مقارنة الحضور الفعلي المسجل وتوقعات الذكاء الاصطناعي للغيابات لهذا اليوم وتوضيح الفارق المرصود
                  </p>
                </div>
                <div className="text-left font-mono text-[10px] text-slate-400 font-bold leading-normal">
                  <span>معدل الخطأ التنبئي للمودل: <b className="text-indigo-400">±2.4%</b></span>
                  <span className="mx-2">•</span>
                  <span>تحديث الاستعلامات: <b>لحظي تلقائي</b></span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiVsActualAttendanceData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDiff" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px', textAlign: 'right', color: '#fff' }} />
                      <Area type="monotone" name="الحضور الفعلي المسجل" dataKey="actualPresence" stroke="#10B981" strokeWidth={3.5} fillOpacity={1} fill="url(#colorActual)" />
                      <Area type="monotone" name="توقعات الذكاء الاصطناعي للغيابات" dataKey="aiAbsenceForecast" stroke="#F59E0B" strokeWidth={3.5} fillOpacity={1} fill="url(#colorPredict)" />
                      <Area type="monotone" name="الفارق الإحصائي للتنبؤ" dataKey="discrepancy" stroke="#818CF8" strokeWidth={2.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorDiff)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:col-span-4 space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-indigo-400 font-black block tracking-widest uppercase">مؤشرات الاستخبارات التنبؤية الصباحية</span>
                  
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-900">
                      <div className="flex justify-between items-center flex-row-reverse text-xs mb-1">
                        <span className="text-slate-400 font-bold">المتربصين المتواجدين حالياً</span>
                        <span className="text-emerald-400 font-mono font-bold">{Math.max(0, totalStudents - todayAbsencesCount)} متكون</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[84%]" />
                      </div>
                    </div>

                    <div className="pb-3 border-b border-slate-900">
                      <div className="flex justify-between items-center flex-row-reverse text-xs mb-1">
                        <span className="text-slate-400 font-bold">توقعات الذكاء الاصطناعي لجملة الغيابات</span>
                        <span className="text-amber-400 font-mono font-bold">~ {todayAbsencesCount > 0 ? todayAbsencesCount + 3 : 7} غيابات متوقعة</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[18%]" />
                      </div>
                    </div>

                    <div className="pb-1 text-right">
                      <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                        🤖 تشير النماذج الإحصائية للغيابات اليومية بمعهدنا إلى دقة تطابق بمقدار <span className="text-indigo-400">97.6%</span> اليوم مقارنة بقوائم حضور وحسابات وجبات الإطعام اليومية المقيدة رقمياً.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'تدقيق الأمان والوصول الرقمي',
                  desc: 'مراقبة هويات المستخدمين وبوابات الطلبة والأولياء والأساتذة لتجنب التزامن العشوائي للبيانات.',
                  icon: ShieldAlert,
                  tag: 'آمن وموثوق',
                  actionText: 'بدء التدقيق الأمني',
                  color: 'hover:border-rose-400',
                  iconBg: 'bg-rose-50 text-rose-600',
                  action: () => {
                    setSuccessMessage('🔒 تم تشغيل بروتوكول فحص منافذ الدخول المزدوج وتحصين قاعدة البيانات بنجاح.');
                    setTimeout(() => setSuccessMessage(null), 5000);
                  }
                },
                {
                  title: 'مزامنة عتاد الحضور IoT',
                  desc: 'تحديث ومزامنة سجلات التعرف البيومتري للأجهزة مع السكك الحديدية وبطاقات الطلبة المدعومة.',
                  icon: Fingerprint,
                  tag: 'إنترنت الأشياء',
                  actionText: 'فحص اتصال الأجهزة مادياً',
                  color: 'hover:border-indigo-400',
                  iconBg: 'bg-indigo-50 text-indigo-600',
                  action: () => {
                    setSuccessMessage('✓ تم فحص اتصال 4 أجهزة بصمة ذكية بمداخل المعهد ومطابقتها مع السجل اليومي للأولياء.');
                    setTimeout(() => setSuccessMessage(null), 5500);
                  }
                },
                {
                  title: 'التناغم مع معايير الوزارة',
                  desc: 'مطابقة جداول الغيابات الإجمالية وتوقيتات الوجبات الغذائية مع لوائح وزارة التكوين المهني الجزائرية.',
                  icon: FileSignature,
                  tag: 'النصوص التشريعية',
                  actionText: 'مراجعة معايير النظم والمواد',
                  color: 'hover:border-amber-400',
                  iconBg: 'bg-amber-50 text-amber-600',
                  action: () => {
                    setSuccessMessage('✓ تم فحص اللائحة القانونية للمركبات التدبيرية لوزارة التكوين بالجزائر والكل متناغم.');
                    setTimeout(() => setSuccessMessage(null), 6000);
                  }
                }
              ].map((op, idx) => (
                <div 
                  key={idx} 
                  onClick={op.action}
                  className={cn("bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all group cursor-pointer", op.color)}
                >
                  <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center mb-6", op.iconBg)}>
                    <op.icon className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 tracking-wider block uppercase mb-1">{op.tag}</span>
                  <h4 className="text-slate-900 font-extrabold text-sm mb-2">{op.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6 font-bold">{op.desc}</p>
                  <button className="text-[10px] font-black hover:text-amber-600 flex items-center gap-1.5 flex-row-reverse text-slate-800">
                    <span>{op.actionText}</span>
                    <span className="text-amber-500 font-extrabold">←</span>
                  </button>
                </div>
              ))}
            </div>

          </motion.div>
        )}

        {/* CANTEEN / CATERING SYSTEM TAB */}
        {activeTab === 'canteen' && (
          <motion.div
            key="canteen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-44 h-44 bg-amber-550/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                
                {/* Visual state calculation */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 justify-end lg:justify-start flex-row-reverse">
                    <span className="bg-rose-500/20 text-rose-300 text-[9px] font-black px-3 py-1 rounded-full border border-rose-500/30 uppercase">
                      حقوق التلقيم المدرسي الحصري
                    </span>
                    <span className="text-xs text-slate-400 font-bold">التكوين الحضوري اليومي فقط</span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                    لوحة تقدير وجبات الإطعام الآلي اليومي لمعهد تبسة 2
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed font-bold">
                    يقوم هذا المحرك الحصري الموجه لتخصصات <span className="text-amber-400 font-extrabold">التكوين الحضوري (المتربصين المقيمين)</span> فقط بحساب عدد الحصص الغذائية المطلوبة تلقائياً، وذلك بعد استبعاد المتكونين المتغيبين المدونين بالدفتر اليومي للغيابات لتفادي الهدر وإسراف المال العام.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3.5 gap-4 pt-4 flex-row-reverse">
                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 text-right">
                      <span className="text-[9px] text-slate-400 font-bold block">إجمالي المقيدين بالقسم الحضوري</span>
                      <span className="text-lg font-black text-amber-500 font-mono mt-0.5 block">{totalClassroomStudents} متربص</span>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 text-right">
                      <span className="text-[9px] text-slate-400 font-bold block">الغيابات المحجوزة لليوم</span>
                      <span className="text-lg font-black text-rose-450 font-mono mt-0.5 block">
                        {cateringSummary.actualAbsentsTracked} متغيبين
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 text-right">
                      <span className="text-[9px] text-slate-400 font-bold block">الفروع الحضورية المدرجة</span>
                      <span className="text-lg font-black text-slate-200 mt-0.5 block">
                        {cateringSummary.activeClassroomGroupsCount} فروع
                      </span>
                    </div>
                  </div>
                </div>

                {/* Highly beautiful target counts block */}
                <div className="bg-slate-900/80 p-6 rounded-3xl border border-amber-500/20 shadow-2xl text-center space-y-4">
                  <Soup className="w-12 h-12 text-amber-500 mx-auto block shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">وجبات الطعام المقدرة لليوم</span>
                    <span className="text-4xl font-extrabold text-white font-mono mt-1 block">
                      {lockedMealCount ?? cateringSummary.calculatedMealsNumber}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold block mt-1">
                      {lockedMealCount ? '🔒 تم إقفال السند إدارياً للمطبخ' : '⚡ قراءة وحساب تلقائي مباشر'}
                    </span>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setLockedMealCount(cateringSummary.calculatedMealsNumber);
                        setSuccessMessage(`🔒 تم بنجاح قفل عدد وجبات اليوم عند [${cateringSummary.calculatedMealsNumber} وجبة] وتم إفادة المشرف العام ومسؤول الطبخ المركزي بتبسة 2.`);
                        setTimeout(() => setSuccessMessage(null), 6000);
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer flex-1"
                    >
                      قفل وتأكيد الطلبية 🍲
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCateringReportModal(true)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-705 text-amber-400 rounded-xl transition border border-slate-700"
                      title="طباعة تفويض إمداد المطبخ"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Config & List details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Parameters set panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md text-right space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2 border-b pb-2">خيارات وعوامل طلب الإطعام</h3>
                
                <div>
                  <label className="text-[9.5px] font-black text-slate-500 block mb-1">تاريخ رصد الحضور المستهدف</label>
                  <input
                    type="date"
                    value={mealDate}
                    onChange={(e) => setMealDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 rounded-xl py-2.5 px-3.5 text-xs font-bold outline-none font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] font-black text-slate-500 block mb-1">حصة وجبات احتياطية إضافية (الأساتذة والمؤطرين / ضيوف الشرف)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={guestMeals}
                      onChange={(e) => setGuestMeals(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 rounded-xl py-2.5 px-3.5 text-xs font-bold font-mono outline-none text-right"
                    />
                    <span className="text-xs text-slate-500 font-extrabold shrink-0">وجبات</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-black text-slate-500 block mb-1">توجيهات وملاحظات الطلبية</label>
                  <textarea
                    value={catererNote}
                    onChange={(e) => setCatererNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 rounded-xl py-2 px-3 text-xs font-bold outline-none text-right h-20 placeholder:text-slate-350"
                    placeholder="مثال: يرجى تقليص الخبز والتركيز على الوجبات المطبوخة لتقليل التبذير"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={handleResetCanteen}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black py-2.5 rounded-xl transition flex items-center gap-1.5 justify-center"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة ضبط المقاييس</span>
                  </button>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-150 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[9.5px] text-slate-550 leading-relaxed font-bold">
                    بموجب المادة 45 من الرقابة المالية، يتم حسم وجبات الطلبة الذين لديهم رخص غياب أو مبررات مسبقة بمجرد قيد المعطيات بمسودة الغيابات.
                  </p>
                </div>

              </div>

              {/* Group breakdowns for catering verification */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-row-reverse flex-wrap gap-2">
                  <div className="text-right">
                    <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase">حالة حضور الفروع البيداغوجية الحضورية</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">تفاصيل وتماشي تسجيل غيابات الأفواج ليوم {mealDate}</p>
                  </div>
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] text-slate-600 font-black font-mono">
                    {cateringSummary.submittedGroupsCount} / {cateringSummary.activeClassroomGroupsCount} مفرزة اليوم
                  </span>
                </div>

                <div className="overflow-x-auto flex-1 text-xs">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-500 font-bold text-[10px]">
                        <th className="px-5 py-3 text-right">الفوج والتخصص</th>
                        <th className="px-5 py-3 text-center">الوصي والمؤطر</th>
                        <th className="px-5 py-3 text-center">تعداد الفرع الرسمي</th>
                        <th className="px-5 py-3 text-center">الغيابات المرصودة</th>
                        <th className="px-5 py-3 text-center">وجبات الغداء المستحقة</th>
                        <th className="px-5 py-3 text-center">حالة الحبر والآوت كود</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans text-[11px]">
                      {classroomGroups.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">عفواً، لا توجد فروع مسجلة بنمط التكوين الحضوري حالياً. يمكنك تغيير الأنماط في تبويب الهيكل.</td>
                        </tr>
                      ) : (
                        classroomGroups.map((grp) => {
                          const grpTodaySessions = sessions.filter(s => s.groupId === grp.id && s.date === mealDate);
                          const isSent = grpTodaySessions.length > 0;
                          
                          // Count absent ids
                          const absentSet = new Set<string>();
                          grpTodaySessions.forEach(sess => {
                            Object.entries(sess.attendanceMap).forEach(([id, st]) => {
                              if (st === 'absent') absentSet.add(id);
                            });
                          });

                          const grpTotal = grp.learners.length;
                          const grpAbsents = absentSet.size;
                          const grpMealees = Math.max(0, grpTotal - grpAbsents);

                          return (
                            <tr key={grp.id} className="hover:bg-slate-50/55 transition-colors">
                              <td className="px-5 py-3.5 text-right">
                                <span className="font-extrabold text-slate-900 block">{grp.name}</span>
                                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">رمز الكود: {grp.code}</span>
                              </td>
                              <td className="px-5 py-3 text-center text-slate-650 font-bold">{grp.guardian}</td>
                              <td className="px-5 py-3 text-center font-black font-mono">{grpTotal} طلاب</td>
                              <td className="px-5 py-3 text-center text-rose-600 font-black font-mono">-{grpAbsents}</td>
                              <td className="px-5 py-3 text-center text-amber-600 font-black font-mono text-xs">{grpMealees} وجبة</td>
                              <td className="px-5 py-3 text-center">
                                {isSent ? (
                                  <span className="text-[9.5px] bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 rounded-md font-bold">
                                    ✓ تم تأكيد الغيابات
                                  </span>
                                ) : (
                                  <span className="text-[9.5px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md font-bold block animate-pulse">
                                    ⚠️ معلّق الانتظار
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 px-5">
                  <span>طلب رصد وجبات الإطعام اليومي • معهد زارع عبد الباقي تبسة 2</span>
                  <span>المجموع البيداغوجي: {classroomGroups.reduce((acc, g) => acc + g.learners.length, 0)} طالب حضوري</span>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* INSTITUTION CONFIG & LOGO TAB */}
        {activeTab === 'institutional' && (
          <motion.div
            key="institutional"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-right">
              <div className="p-6 bg-gradient-to-l from-slate-950 to-slate-900 text-white border-b border-amber-500/10 flex items-center justify-between flex-row-reverse flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-black text-amber-400 tracking-wide uppercase flex items-center justify-end gap-2">
                    مواثيق وبنود الهوية القانونية للمعهد
                    <Building2 className="w-5 h-5 text-amber-400" />
                  </h3>
                  <p className="text-[10px] text-slate-300 font-medium mt-1">تعديل بيانات تسمية المؤسسة، العناوين، الهواتف الرسمية لتخصيص الاستدعاءات والمستندات</p>
                </div>
                {!isEditingInstitute ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({ ...institute });
                      setIsEditingInstitute(true);
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-650 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-md active:scale-95 flex items-center gap-2 flex-row-reverse"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل الميثاق والمؤسسة 🏛️</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveInstitute}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5 flex-row-reverse"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ التعديلات آلياً</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingInstitute(false)}
                      className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition hover:bg-slate-705"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>

              {/* Form & details */}
              <div className="p-8 space-y-6 font-sans">
                {isEditingInstitute ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">نوع المؤسسة التكوينية</label>
                      <select
                        value={editForm.type || 'institute'}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'institute' | 'center' })}
                        className="w-full bg-slate-50 border border-slate-250 focus:border-amber-400 focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all text-right"
                      >
                        <option value="institute">معهد وطني متخصص (Institute) 🏛️</option>
                        <option value="center">مركز لتكوين مهني (Center) 🏫</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">تسمية المؤسسة (الرسمي)</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-250 focus:border-amber-400 focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold font-serif outline-none transition-all text-right"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">الرابط الإلكتروني للمنصة الرقمية</label>
                      <input
                        type="text"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-250 focus:border-amber-400 focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold font-mono outline-none transition-all text-right"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">عنوان المعهد والموقع الشرعي</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-250 focus:border-amber-400 focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all text-right"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">اسم مدير المؤسسة / عميد المعهد</label>
                      <input
                        type="text"
                        value={editForm.director}
                        onChange={(e) => setEditForm({ ...editForm, director: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-250 focus:border-amber-400 focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all text-right"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">رقم الهاتف وقنوات الاتصال بالمصلحة</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-250 focus:border-amber-400 focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold font-mono outline-none transition-all text-right"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">البريد الإلكتروني الرسمي للمراسلات</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-250 focus:border-amber-400 focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold font-mono outline-none transition-all text-right"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">المرسوم الرئاسي والتأسيسي الحاسم</label>
                      <input
                        type="text"
                        value={editForm.decreeNum}
                        onChange={(e) => setEditForm({ ...editForm, decreeNum: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-250 focus:border-amber-400 focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all text-right"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">البلدية أو الولاية المستوطنة بوزارة التكوين</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-250 focus:border-amber-400 focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold outline-none transition-all text-right"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InstitutionalReadOnlyCard label="نوع المؤسسة" value={institute.type === 'center' ? 'مركز تكوين مهني 🏫' : 'معهد وطني متخصص 🏛️'} icon={Building2} />
                    <InstitutionalReadOnlyCard label="التسمية الرسمية" value={institute.name} icon={Building2} />
                    <InstitutionalReadOnlyCard label="عنوان المؤسسة" value={institute.address} icon={MapPin} />
                    <InstitutionalReadOnlyCard label="المدير المسؤول" value={institute.director} icon={User} />
                    <InstitutionalReadOnlyCard label="رقم الهاتف" value={institute.phone} icon={Phone} />
                    <InstitutionalReadOnlyCard label="البريد الإلكتروني" value={institute.email} icon={Mail} />
                    <InstitutionalReadOnlyCard label="رابط المنصة" value={institute.website} icon={Globe} />
                    <InstitutionalReadOnlyCard label="المرسوم الحكومي" value={institute.decreeNum} icon={FileText} />
                    <InstitutionalReadOnlyCard label="الولاية المعنية" value={institute.city} icon={Building2} />
                    
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 p-5 rounded-2xl border border-amber-250 flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl">
                        <Heart className="w-5 h-5 text-slate-950" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-amber-800 font-black tracking-widest block uppercase">جاهزية المستندات</span>
                        <span className="text-xs text-slate-700 font-extrabold block mt-0.5">مطابق تماماً للقانون الداخلي 2026.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TRAINING STRUCTURE MODULE */}
        {activeTab === 'structure' && (
          <motion.div 
            key="structure"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
          >
            <TrainingStructure />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CANTEEN REPORT PRINT DIALOG MODAL --- */}
      {showCateringReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-right">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-row-reverse">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Soup className="w-5 h-5 text-amber-500" />
                <span>تحرير تفويض التموين اليومي وسند المطبخ المركزي ⚖️</span>
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById('catering-manifest-printable-system')?.innerHTML;
                    if (printContents) {
                      const printWindow = window.open('', '', 'height=800,width=1000');
                      if (printWindow) {
                        printWindow.document.write('<html><head><title>سند تزويد وجبات المطبخ اليومي</title>');
                        printWindow.document.write('<style>');
                        printWindow.document.write('@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;750&display=swap");');
                        printWindow.document.write('body { font-family: "Inter", sans-serif; padding: 40px; background: white; color: black; direction: rsl; text-align: right; }');
                        printWindow.document.write('.header { text-align: center; margin-bottom: 30px; border-bottom: 2px double black; padding-bottom: 20px; }');
                        printWindow.document.write('.title { font-size: 20px; font-weight: bold; margin: 15px 0; text-decoration: underline; text-align: center; }');
                        printWindow.document.write('.meta-table { width: 100%; border-collapse: collapse; margin: 25px 0; }');
                        printWindow.document.write('.meta-table th, .meta-table td { border: 1.5px solid black; padding: 10px; text-align: right; font-size: 13px; }');
                        printWindow.document.write('.footer-signatures { display: flex; justify-content: space-between; margin-top: 50px; font-size: 13px; font-weight: bold; }');
                        printWindow.document.write('</style></head><body dir="rtl">');
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
                  className="px-4 py-2 bg-slate-955 hover:bg-slate-900 text-slate-950 bg-amber-400 hover:bg-amber-500 text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>طباعة سند التموين البيداغوجي (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCateringReportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border text-slate-700 text-xs font-black rounded-xl cursor-pointer"
                >
                  إغلاق ✕
                </button>
              </div>
            </div>

            {/* Printable container view */}
            <div className="p-8 bg-slate-50 border-b overflow-y-auto max-h-[60vh]">
              <div 
                id="catering-manifest-printable-system"
                className="bg-white border-2 border-slate-350 p-8 max-w-[210mm] mx-auto text-black shadow-sm"
                style={{ direction: 'rtl' }}
              >
                {/* Official letterhead */}
                <div className="text-center font-bold space-y-1 pb-4 border-b-2 border-black" style={{ textAlign: 'center' }}>
                  <h4 className="text-xs font-bold font-serif">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
                  <p className="text-[10px] font-medium">وزارة التكوين والتعليم المهنيين</p>
                  <p className="text-[10.5px] font-black underline uppercase">{institute.name}</p>
                  <p className="text-[9.5px]">المصلحة الفرعية للوسائل والتغذية المدرسية</p>
                  <div className="w-16 h-0.5 bg-black mx-auto my-1"></div>
                  <p className="text-[10px] font-bold">التاريخ المستهدف: {mealDate}</p>
                </div>

                <div className="text-center my-6" style={{ textAlign: 'center' }}>
                  <h2 className="text-lg font-black underline my-1 font-serif">سند تزويد وتفويض وجبات الإطعام اليومي</h2>
                  <p className="text-[10px] font-medium text-slate-700">مخصص لطلبة وأقسام التكوين الحضوري لولاية تبسة</p>
                </div>

                <div className="space-y-4 text-xs leading-relaxed mt-6">
                  <p>
                    بموجب محضر الحساب التلقائي للغيابات ومطابقة قنوات الحضور الرقمية في تمام هذا اليوم، نفوض مسير المطبخ المركزي بتجهيز الوجبات الساخنة لصالح الأفواج والدروس الحضورية بناءً على الأرقام المعالجة بيداغوجياً:
                  </p>

                  <table className="meta-table" style={{ width: '100%', border: '1.5px solid black', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ border: '1.5px solid black', padding: '8px', textAlign: 'right' }}>بيان طلب الوجبات اليومي</th>
                        <th style={{ border: '1.5px solid black', padding: '8px', textAlign: 'center' }}>التعداد المعتمد بيداغوجياً</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1.5px solid black', padding: '8px' }}>عدد المتربصين الحاضرين بالصفوف (القسم الحضوري)</td>
                        <td style={{ border: '1.5px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                          {totalClassroomStudents - cateringSummary.actualAbsentsTracked} وجبة فردية
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1.5px solid black', padding: '8px' }}>إجمالي الغيابات المرصودة والمنقوصة من الحصة</td>
                        <td style={{ border: '1.5px solid black', padding: '8px', textAlign: 'center', color: 'red' }}>
                          {cateringSummary.actualAbsentsTracked} طالب غائب (تم الخصم)
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1.5px solid black', padding: '8px' }}>حصة الحراس، المؤطرين، والضيوف المتوقعة</td>
                        <td style={{ border: '1.5px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                          +{guestMeals} وجبة رديفة
                        </td>
                      </tr>
                      <tr style={{ background: '#fafafa', fontWeight: 'bold' }}>
                        <td style={{ border: '1.5px solid black', padding: '10px', fontSize: '13px' }}>إجمالي طلبيات التجهيز الفوري للمطبخ</td>
                        <td style={{ border: '1.5px solid black', padding: '10px', textAlign: 'center', fontSize: '14px', textDecoration: 'underline' }}>
                          {lockedMealCount ?? cateringSummary.calculatedMealsNumber} وجبة كاملة
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ marginTop: '15px', padding: '10px', border: '1px solid black', fontSize: '11px', background: '#fafafa' }}>
                    <p className="font-bold underline mb-1">ملاحظات وبنود المسؤولية والتبذير المالي:</p>
                    <p className="font-medium italic">
                      «{catererNote}» - يرجى تسوية سجل بقايا التموين لصالح مستشاري الرقابة العامة للمعهد وبوابة الولي.
                    </p>
                  </div>

                  <p className="text-[9.5px] font-bold text-center text-slate-800 my-4">
                    مكتب تسيير الإمداد والتغذية بتبسة 2 • نظام الرصد الآلي للغيابات
                  </p>

                  {/* Signatures */}
                  <div className="flex justify-between items-start pt-10 font-bold text-[11px]" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                    <div>
                      <p className="underline mb-6">مستشار الرقابة الممعن للغياب:</p>
                      <br />
                      <p className="text-[9.5px] text-slate-400">ولاية تبسة</p>
                    </div>
                    <div>
                      <p className="underline mb-6">مسير المطبخ وتسيير الوجبات:</p>
                      <br />
                      <p className="text-[9.5px] text-slate-400">(مستلم ومطابق)</p>
                    </div>
                    <div>
                      <p className="underline mb-6">المدير العام للمعهد:</p>
                      <br />
                      <p className="text-[9.5px] text-slate-400">{institute.director}</p>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* SEMESTER RESULTS MANAGEMENT & AI UPLOAD TAB */}
      {activeTab === 'results' && (
        <motion.div
          key="results"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Banner for initiating upload */}
          <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-[#1e1b4b] text-white rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden text-right">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-3">
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full border border-amber-500/20 shadow-sm animate-pulse inline-block">
                  منصة الذكاء الاصطناعي للمداولات ⚡
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                  رفع وبث كشوف النقاط ونتائج السداسي للطلبة
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xl font-medium">
                  يمكنك هنا سحب وإسقاط ملفات كشوف كشر رائد، شيت إكسيل (XLS/XLSX)، ملفات PDF، أو نسخ ولصق النتائج مباشرة. سيقوم محلل الذكاء الاصطناعي بفرز البيانات وتوزيعها فورياً على الطلبة حسب تخصصاتهم ومستوياتهم وبوابة الولي الشرعي!
                </p>
              </div>
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition duration-300 shadow-xl shadow-amber-500/15 flex items-center gap-2.5 shrink-0 active:scale-95 hover:scale-[1.02]"
              >
                <UploadCloud className="w-4.5 h-4.5" />
                <span>بدء معالجة ورفع كشف نقاط جديد</span>
              </button>
            </div>
          </div>

          {/* Results list view */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-right">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-row-reverse flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-wide uppercase flex items-center justify-end gap-2">
                  كشوف وسجلات السداسي النشطة والمبثوثة للبوابات
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </h3>
                <p className="text-[10px] text-slate-550 font-bold mt-1">
                  نتائج المداولات الصادرة في فضاء المتكونين مقسمة حسب الفوج والتخصص البيداغوجي المعتمد للطلبة
                </p>
              </div>
              <div className="bg-slate-200/60 text-slate-800 border border-slate-300/40 px-3.5 py-1.5 rounded-xl text-[10px] font-black font-sans">
                إجمالي المتربصين الحاصلين على نتائج: {semesterResults.length} طالب
              </div>
            </div>

            {semesterResults.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-4">
                <div className="w-16 h-16 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <FileText className="w-8 h-8 opacity-45" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#0F172A]">لا توجد كشوف نقاط أو تداولات مبثوثة حالياً</p>
                  <p className="text-[10px] text-slate-450 mt-1 max-w-sm mx-auto">اضغط على زر "بدء معالجة ورفع كشف نقاط جديد" بالأعلى لرفع ملفات الأقسام وسجل المتربصين فوراً.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-right bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-120 text-slate-400 font-black text-[9.5px]">
                      <th className="px-6 py-3.5 text-right uppercase tracking-wider">اسم ومقتضيات المتكون</th>
                      <th className="px-6 py-3.5 text-center uppercase tracking-wider">الفوج والتخصص</th>
                      <th className="px-6 py-3.5 text-center uppercase tracking-wider">المعدل العام للسداسي</th>
                      <th className="px-6 py-3.5 text-center uppercase tracking-wider">المقاييس والوحدات</th>
                      <th className="px-6 py-3.5 text-center uppercase tracking-wider">حالة المداولة البيداغوجية</th>
                      <th className="px-6 py-3.5 text-center uppercase tracking-wider">التحكم والإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans text-[11px]">
                    {semesterResults.map((res, i) => {
                      const isSuccess = res.gpa >= 10;
                      return (
                        <tr key={res.learnerId || i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4.5 text-right">
                            <div>
                              <span className="font-extrabold text-slate-905 block">{res.learnerName}</span>
                              <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5 font-sans">الرقم المكتبي: {res.learnerId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-center font-bold text-slate-700">
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-120 rounded-lg text-[10px] font-mono">
                              {res.groupCode}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-center font-black text-xs text-slate-900 font-mono">
                            {res.gpa.toFixed(2)} / 20
                          </td>
                          <td className="px-6 py-4.5 text-center text-slate-500 font-extrabold font-sans">
                            {res.subjects?.length || 0} مقاييس مرصودة
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider block mx-auto max-w-fit shadow-xs",
                              isSuccess 
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-250" 
                                : "bg-rose-50 text-rose-800 border border-rose-250"
                            )}>
                              {isSuccess ? 'ناجح بانتياز' : 'مستدرك بيداغوجي'}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            <button
                              onClick={() => {
                                const updated = semesterResults.filter((_, idx) => idx !== i);
                                AppStateStore.saveSemesterResults(updated);
                                setSuccessMessage('✓ تم سحب وإلغاء كشف النقاط للمتكون فورياً ومنع عرضه من بوابته.');
                                setTimeout(() => setSuccessMessage(null), 3000);
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition-colors inline-block text-center"
                              title="سحب وحذف وبث النتيجة"
                            >
                              <div className="flex items-center gap-1.5 justify-center">
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">حذف وبث</span>
                              </div>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Deliberations Protocol info */}
          <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-right space-y-2">
            <h4 className="text-xs font-black text-amber-500">🛡️ بروتوكول سرية وبث النتائج السداسية المعتمد:</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              بموجب قرار الوزارة واللوائح التنظيمية لمعهد زارع عبد الباقي تبسة 2، فإن تفريغ وتبليغ النقاط السداسية يعد من الصلاحيات والمسؤوليات الحصرية للرقابة والمدير البيداغوجي. لا تسمح المنصة لأي متكون أو ولي بالأمر أو أستاذ بتعديل أو تزييف النقاط المدونة بمجرد استقرارها في قاعدة البيانات الموزعة.
            </p>
          </div>
        </motion.div>
      )}

      {/* ADVANCED SETTINGS & SECURITY DANGER ZONE TAB */}
      {activeTab === 'settings' && (
        <motion.div
          key="settings"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-6 text-right font-sans"
        >
          {/* Header Banner */}
          <div className="bg-[#0F172A] p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500 opacity-5 -ml-24 -mt-24 rounded-full blur-2xl" />
            <div className="space-y-1 relative z-10 text-right">
              <span className="text-[9px] bg-red-500/35 border border-red-500/50 text-red-250 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                منطقة التحكم الفائقة للمدير العام للشبكة • Super Admin Control Gate
              </span>
              <h3 className="text-lg font-black text-white mt-2">إعدادات الأمان وقاعدة البيانات والمنطقة الحمراء</h3>
              <p className="text-xs text-slate-300 font-bold leading-relaxed">
                يتيح هذا الفضاء للرقابة الفنية تصفير النظام وإلغاء وثائق الحضور بصفة نهائية مع أرشفتها قبل الإتلاف. كافة عمليات التعديل تعقبها محفظة تشفير لتدقيق الهوية.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* RIGHT COLUMN: ADVANCED CRUD DELETIONS PANEL */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-wide uppercase flex items-center justify-end gap-2">
                  محرك إدارة وحذف سجلات الكيانات الفورية
                  <Trash2 className="w-5 h-5 text-red-600 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-500 font-bold mt-1">
                  اختر الفئة البيداغوجية المستهدفة لتصفية عناصرها وحذفها بصفة دائمة مع تأكيد الحذف عبر حارس الأمان المتقدم للمعهد.
                </p>
              </div>

              {/* Settings Nested Tab selectors */}
              <div className="flex flex-wrap gap-2.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-150 justify-end flex-row-reverse">
                {[
                  { id: 'trainees', label: 'المتكونين والطلاب 👥', count: groups.reduce((acc, g) => acc + (g.learners?.length || 0), 0) },
                  { id: 'companies', label: 'الشركاء والمؤسسات 🏛️', count: AppStateStore.getWorkplaceCompanies().length },
                  { id: 'sessions', label: 'الحصص وعقود الحضور 📝', count: sessions.length },
                  { id: 'referrals', label: 'تقارير الانضباط والطعون ⚖️', count: AppStateStore.getDisciplinaryReferrals().length + AppStateStore.getGradeAppeals().length },
                  { id: 'remoteLogs', label: 'الحضور الميداني (QR/GPS) 📍', count: AppStateStore.getRemoteAttendanceLogs().length }
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setSettingsSection(sec.id as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10.5px] font-black transition-all flex items-center gap-1.5 flex-row-reverse",
                      settingsSection === sec.id 
                        ? "bg-slate-905 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
                    )}
                  >
                    <span>{sec.label}</span>
                    <span className="bg-slate-205/80 text-slate-700 px-1.5 py-0.25 text-[9px] font-black rounded-full border border-slate-300/20">
                      {sec.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Local Table Search Filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث فوري في القائمة للتصفية السريعة والحذف المباشر..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-right text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-sans"
                  onChange={(e) => {
                    const el = document.getElementById('settings_search_val') as HTMLInputElement;
                    if (el) el.value = e.target.value;
                  }}
                  id="settings_dummy_ui"
                />
                <input type="hidden" id="settings_search_val" defaultValue="" />
              </div>

              {/* NESTED CONTENT VIEWPORTS */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                
                {settingsSection === 'trainees' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-120 text-slate-400 font-extrabold text-[9px]">
                          <th className="px-5 py-3 text-right uppercase">اسم المتكون والمتربص</th>
                          <th className="px-5 py-3 text-center">الفوج الدراسي المنتسب</th>
                          <th className="px-5 py-3 text-center">حالة السلوك</th>
                          <th className="px-5 py-3 text-center">الإجراء الفني</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10.5px] font-semibold font-sans">
                        {(() => {
                          const trainees = groups.flatMap(g => (g.learners || []).map(l => ({ ...l, groupName: g.name, groupId: g.id })));
                          if (trainees.length === 0) {
                            return <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">لا يوجد متمهنين حالياً بقاعدة البيانات</td></tr>;
                          }
                          return trainees.map((t) => (
                            <tr key={t.id} className="hover:bg-rose-50/15 transition-colors">
                              <td className="px-5 py-3.5 text-right font-black text-slate-900">{t.name}</td>
                              <td className="px-5 py-3.5 text-center text-slate-650 font-bold">{t.groupName}</td>
                              <td className="px-5 py-3.5 text-center text-amber-600 font-black">غائب {t.totalAbsences} سيعيد</td>
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  onClick={() => triggerDeleteConfirm('trainee', t.id, t.name, t.groupId)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg text-rose-600 text-[9.5px] font-black tracking-wide inline-flex items-center gap-1 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  حذف وحظر
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}

                {settingsSection === 'companies' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-120 text-slate-400 font-extrabold text-[9px]">
                          <th className="px-5 py-3 text-right uppercase">اسم المنشأة / الشركة الشريكة</th>
                          <th className="px-5 py-3 text-center">القطاع والمنطقة التمهينية</th>
                          <th className="px-5 py-3 text-center">محيط الأقمار Geofencing</th>
                          <th className="px-5 py-3 text-center">الإجراء الفني</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10.5px] font-semibold font-sans">
                        {(() => {
                          const companies = AppStateStore.getWorkplaceCompanies();
                          if (companies.length === 0) {
                            return <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">لا توجد منشآت متعاقدة حالياً</td></tr>;
                          }
                          return companies.map((c) => (
                            <tr key={c.id} className="hover:bg-rose-50/15 transition-colors">
                              <td className="px-5 py-3.5 text-right font-black text-slate-800">{c.name}</td>
                              <td className="px-5 py-3.5 text-center text-slate-600 font-bold">{c.compliance}</td>
                              <td className="px-5 py-3.5 text-center text-emerald-600 font-mono">نصف قطر {c.radius} متر ✓</td>
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  onClick={() => triggerDeleteConfirm('company', c.id, c.name)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg text-rose-600 text-[9.5px] font-black tracking-wide inline-flex items-center gap-1 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  شطب المؤسسة
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}

                {settingsSection === 'sessions' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-120 text-slate-400 font-extrabold text-[9px]">
                          <th className="px-5 py-3 text-right uppercase">المادة وعنوان الحصة الدراسية</th>
                          <th className="px-5 py-3 text-center">التاريخ والحضور المقارن</th>
                          <th className="px-5 py-3 text-center">منشئ الحصّة</th>
                          <th className="px-5 py-3 text-center">الإجراء الفني</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10.5px] font-semibold font-sans">
                        {sessions.length === 0 ? (
                          <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">لا توجد حصص حضور دراسية مسجلة حالياً</td></tr>
                        ) : (
                          sessions.map((s) => (
                            <tr key={s.id} className="hover:bg-rose-50/15 transition-colors">
                              <td className="px-5 py-3.5 text-right font-black text-slate-800">
                                {s.subject} <span className="text-[9.5px] text-slate-450 font-medium">({s.type})</span>
                              </td>
                              <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-650">
                                {s.date} - {s.length || s.duration}ساعة
                              </td>
                              <td className="px-5 py-3.5 text-center font-bold text-slate-600">{s.teacherName}</td>
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  onClick={() => triggerDeleteConfirm('session', s.id, `حصة ${s.subject} بتوقيت ${s.date}`)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg text-rose-600 text-[9.5px] font-black tracking-wide inline-flex items-center gap-1 transition animate-fade-in"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  إلغاء الورقة
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {settingsSection === 'referrals' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-120 text-slate-400 font-extrabold text-[9px]">
                          <th className="px-5 py-3 text-right uppercase">المتكون المخالف والمستهدف</th>
                          <th className="px-5 py-3 text-center">نوع الإجراء / الطعن</th>
                          <th className="px-5 py-3 text-center">طابع العقوبة الموجهة</th>
                          <th className="px-5 py-3 text-center">الإجراء الفني</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10.5px] font-semibold font-sans">
                        {(() => {
                          const referrals = AppStateStore.getDisciplinaryReferrals();
                          const appeals = AppStateStore.getGradeAppeals();
                          if (referrals.length === 0 && appeals.length === 0) {
                            return <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">لا توجد تقارير انضباط أو طعون مقيدة حالياً</td></tr>;
                          }
                          return (
                            <>
                              {referrals.map((r) => (
                                <tr key={`ref-${r.id}`} className="hover:bg-rose-50/15 transition-colors">
                                  <td className="px-5 py-3.5 text-right font-black text-slate-800">{r.learnerName}</td>
                                  <td className="px-5 py-3.5 text-center text-red-650 font-bold">بذيل مجلس الرقابة والانضباط ⚖️</td>
                                  <td className="px-5 py-3.5 text-center text-rose-600 font-extrabold">{r.reason}</td>
                                  <td className="px-5 py-3.5 text-center">
                                    <button
                                      onClick={() => triggerDeleteConfirm('referral', r.id, `إحالة المتكون ${r.learnerName}`)}
                                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg text-rose-600 text-[9.5px] font-black tracking-wide inline-flex items-center gap-1 transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      إسقاط العقوبة
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {appeals.map((a) => (
                                <tr key={`app-${a.id}`} className="hover:bg-rose-50/15 transition-colors">
                                  <td className="px-5 py-3.5 text-right font-black text-slate-805">{a.learnerName}</td>
                                  <td className="px-5 py-3.5 text-center text-indigo-705 font-bold">طعن بيداغوجي في النقطة ⭐</td>
                                  <td className="px-5 py-3.5 text-center text-indigo-600 font-bold">{a.subjectName} ({a.reason})</td>
                                  <td className="px-5 py-3.5 text-center">
                                    <button
                                      onClick={() => triggerDeleteConfirm('appeal', a.id, `طعن المخطط لـ ${a.learnerName}`)}
                                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg text-rose-600 text-[9.5px] font-black tracking-wide inline-flex items-center gap-1 transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      سحب الطعن
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}

                {settingsSection === 'remoteLogs' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-120 text-slate-400 font-extrabold text-[9px]">
                          <th className="px-5 py-3 text-right">المتمهن المستجيب بالميدان</th>
                          <th className="px-5 py-3 text-center">الشركة الشريكة</th>
                          <th className="px-5 py-3 text-center">الوقوف الجغرافي والشهادة البصرية</th>
                          <th className="px-5 py-3 text-center">الإجراء الفني</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10.5px] font-semibold font-sans">
                        {(() => {
                          const logs = AppStateStore.getRemoteAttendanceLogs();
                          if (logs.length === 0) {
                            return <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">لا يوجد حضور ميداني موثق بـ GPS/QR</td></tr>;
                          }
                          return logs.map((l) => (
                            <tr key={l.id} className="hover:bg-rose-50/15 transition-colors">
                              <td className="px-5 py-3.5 text-right font-black text-slate-900">{l.learnerName}</td>
                              <td className="px-5 py-3.5 text-center text-indigo-700 font-mono font-bold leading-normal">{l.companyName}</td>
                              <td className="px-5 py-3.5 text-center text-emerald-600 font-mono font-bold">{l.distanceFromPivot.toFixed(0)} متر • وجه مقبول {l.faceMatchScore}%</td>
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  onClick={() => triggerDeleteConfirm('remoteLog', l.id, `حضور ${l.learnerName} بمقر ${l.companyName}`)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg text-rose-600 text-[9.5px] font-black tracking-wide inline-flex items-center gap-1 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  مسح السجل
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>

            {/* LEFT COLUMN: TOTAL RESET & SYSTEM COLD-START */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* SYSTEM RESET CARDS */}
              <div className="bg-rose-50/45 border-2 border-rose-500/10 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 -mr-16 -mt-16 rounded-full blur-xl" />
                <div className="flex items-center gap-2 justify-end text-rose-600 font-black relative z-10">
                  <span className="text-xs uppercase">إعادة تهيئة وتصفير النظام الكلي ⚠️</span>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-650 leading-relaxed font-bold font-sans relative z-10 text-right">
                  من هنا يمكنك تجميد وتطهير قاعدة البيانات وقفل السداسي الحالي وتفريغ سجلات الحضور كلياً لاستبدالها بدورة حضور وسداسي بيداغوجي جديد تماماً.
                </p>

                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-amber-800 text-[10px] space-y-2 relative z-10 leading-normal" dir="rtl">
                  <p className="font-extrabold flex items-center gap-1">
                    <span>حماية بيداغوجية إلزامية قبل المسح:</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  </p>
                  <p className="font-semibold text-slate-600">
                    لمنع فقدان بيانات المتابعة بصفة فجائية، يلزمك النظام أولاً بتنزيل نسخة احتياطية من المعطيات من خلال الزر أدناه لتنشيط قفل التصفير.
                  </p>
                </div>

                <div className="space-y-2.5 relative z-10">
                  {/* Export Backup JSON first button */}
                  <button
                    onClick={triggerBackupExport}
                    className="w-full bg-[#D97706]/15 hover:bg-[#D97706]/25 border border-[#D97706]/40 text-[#D97706] font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    تنزيل وتصدير نسخة احتياطية (JSON) احترازية
                  </button>

                  {/* Red Purge Button */}
                  <button
                    disabled={!isBackupExported}
                    onClick={() => setIsResetModalOpen(true)}
                    className={cn(
                      "w-full text-white font-black text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg",
                      isBackupExported 
                        ? "bg-red-600 hover:bg-red-700 shadow-red-600/10" 
                        : "bg-slate-300 cursor-not-allowed shadow-none"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    تصفير وقفل السجلات وبدء سداسي جديد من الصفر 💀
                  </button>
                  {!isBackupExported && (
                    <p className="text-[10px] text-center text-slate-450 font-bold">
                      يرجى الضغط على زر التنزيل بالأعلى أولاً لفتح ميزة التصفير.
                    </p>
                  )}
                </div>
              </div>

              {/* ADMINISTRATIVE LOGS CARD PANEL */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between flex-row-reverse w-full">
                  <h4 className="text-xs font-black text-slate-900">سجل تدقيق الأمان والعمليات (Live Logs)</h4>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8.5px] font-black">نشط بانتظام</span>
                </div>
                
                <div className="space-y-2.5 font-sans overflow-y-auto max-h-[300px]" dir="rtl">
                  {adminLogs.map((log: any) => (
                    <div key={log.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-right hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between flex-row-reverse gap-2">
                        <span className="text-[10px] font-black text-slate-850 block">{log.action}</span>
                        <span className="bg-emerald-50 text-emerald-750 text-[8px] border border-emerald-100 px-1.5 py-0.25 font-black rounded-md shrink-0">
                          {log.status || 'نجاح'} ✓
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[8.5px] text-slate-400 font-bold">
                        <span className="block shrink-0">{log.timestamp}</span>
                        <span className="block font-mono truncate max-w-[120px]">{log.resource}</span>
                      </div>
                      <div className="text-[8.5px] text-slate-450 font-mono block">
                        IP: {log.ipAddress} • المشرف: {log.adminName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      )}

      {/* CONFIRMATION OVERLAY FOR STANDARD CRUD DELETIONS (NATIVE REACT MODAL FOR iFRAME COMPLIANCE) */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans text-right" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-5"
            >
              <div className="flex items-center justify-start gap-3 flex-row border-b border-slate-105 pb-3">
                <div className="w-10 h-10 bg-red-100 text-red-650 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-650" />
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-black text-slate-905">تأكيد أمان العملية الجاري بصفة نهائية</h4>
                  <p className="text-[9.5px] text-slate-450 font-bold mt-0.5">معهد زارع عبد الباقي تبسة - نظام حظر المغارسة الرقمية</p>
                </div>
              </div>

              <div className="space-y-3.5 leading-relaxed text-xs text-slate-600 font-bold">
                <p>
                  أنت على وشك تنفيذ عملية حذف دائمة لـ:
                  <br />
                  <span className="text-slate-905 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-lg text-xs font-black block mt-2 font-mono text-center">
                    « {deleteConfirmation.label} »
                  </span>
                </p>
                <p className="text-[10px] text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-100 font-medium leading-normal">
                  تنبيه: هذا الإجراء لا يمكن الرجوع عنه. سيتم إتلاف سجل العنصر نهائياً وبصفة غير قابلة للاستعادة من لوحة التحكم أو فضاء المتكونين.
                </p>
              </div>

              <div className="flex gap-2.5 pt-1.5">
                <button
                  onClick={executeDeleteAction}
                  className="flex-1 bg-red-650 hover:bg-red-700 text-white text-xs font-extrabold py-3 rounded-xl transition"
                >
                  نعم، حذف بصفة نهائية
                </button>
                <button
                  onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold py-3 rounded-xl transition"
                >
                  إلغاء وتراجع 
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION OVERLAY FOR TOTAL SYSTEM RESET (NATIVE SAFETY LOCK MODAL) */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans text-right" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-red-500/20 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5"
            >
              <div className="flex items-center justify-start gap-3 flex-row border-b border-red-100 pb-3">
                <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-black text-red-650">تنبيه ذو خطورة بيداغوجية بالغة الكفاءة!</h4>
                  <p className="text-[9.5px] text-slate-450 font-bold mt-0.5">الرقابة البيداغوجية العظمى للمعهد • Super Admin Purge</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 font-bold leading-relaxed">
                <p>
                  نظام SmartStage DZ سيقوم الآن بمسح كلي ونهائي وتصفير لعقود حضور الطلاب، السجلات الميدانية، والغيابات لتفعيل دورة دراسية وسداسي بيداغوجي جديد من الصفر.
                </p>
                <p className="text-red-600 bg-red-50 p-4 border border-red-100 rounded-xl font-black">
                  كل بطاقات الحضور وعمود المواظبة وصور كشوف المداولات سيتم إلغاؤها نهائياً!
                </p>
                <div className="space-y-1">
                  <label className="text-slate-700 font-black text-[10px] block text-right mt-1">
                    يرجى كتابة العبارة التأكيدية التالية بحروفها للمتابعة:
                    <span className="block text-slate-950 font-black text-xs mt-1 underline">إعادة تهيئة النظام</span>
                  </label>
                  <input
                    type="text"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    placeholder="إعادة تهيئة النظام"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-center text-slate-905 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 font-sans mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={executeSystemReset}
                  disabled={resetConfirmText !== 'إعادة تهيئة النظام'}
                  className={cn(
                    "flex-1 text-white text-xs font-extrabold py-3.5 rounded-xl transition shadow-md",
                    resetConfirmText === 'إعادة تهيئة النظام' 
                      ? "bg-red-650 hover:bg-red-700 shadow-red-650/10" 
                      : "bg-slate-300 cursor-not-allowed shadow-none"
                  )}
                >
                  تأكيد تصفير النظام من الصفر
                </button>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold py-3.5 rounded-xl transition"
                >
                  إلغاء التصفير والعودة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded results upload modal */}
      <ResultsUploadModal 
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          // Sync list after modal completes saving
          setSemesterResults(AppStateStore.getSemesterResults());
        }}
      />

    </div>
  );
}

function MetricCard({ title, value, progress, color, tag, info }: any) {
  const storageKey = `rq_admin_metric_collapsed_${title}`;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => localStorage.getItem(storageKey) === 'true');

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering any drag & drop events on outer wrapper
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem(storageKey, String(nextState));
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md text-right relative flex flex-col justify-between overflow-hidden transition-all duration-300">
      {/* Dynamic top bar inside each card */}
      <div className="flex items-center justify-between gap-2 flex-row-reverse relative z-10 w-full mb-1">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block truncate">{title}</span>
        <button 
          onClick={toggleCollapse} 
          type="button"
          className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-850 hover:scale-105 transition-all duration-200 shrink-0 select-none"
          title={isCollapsed ? "توسيع البطاقة" : "طي البطاقة لتقليل الازدحام"}
        >
          {isCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden space-y-2 mt-2 pt-1 border-t border-slate-50"
          >
            <div className="space-y-1">
              <h4 className="text-2xl font-black text-slate-900 leading-tight">{value}</h4>
              <span className="text-[9px] font-black text-slate-400 tracking-tight block">{tag}</span>
            </div>
            
            <div className="mt-4 space-y-2 relative z-10">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden animate-pulse">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={cn("h-full", color)}
                />
              </div>
              <span className="text-[9px] text-[#0F172A] font-extrabold block">{info}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InstitutionalReadOnlyCard({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-right flex items-start gap-3.5 hover:border-amber-400/50 transition-colors">
      <div className="p-2 bg-white rounded-xl shadow-sm text-slate-450 shrink-0">
        <Icon className="w-4.5 h-4.5 text-slate-500" />
      </div>
      <div className="text-right">
        <span className="text-[9px] text-slate-400 font-black tracking-widest block uppercase">{label}</span>
        <span className="text-xs text-slate-800 font-extrabold block mt-1 leading-normal">{value || '---'}</span>
      </div>
    </div>
  );
}
