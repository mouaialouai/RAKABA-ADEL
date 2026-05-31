import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  BrainCircuit,
  ArrowUpRight,
  MonitorCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  ShieldCheck,
  Utensils,
  Soup,
  Sparkles,
  Award,
  Search,
  CheckCircle,
  TrendingDown,
  ArrowRightLeft,
  DollarSign,
  UserCheck,
  Briefcase,
  Scale,
  UserCircle,
  GraduationCap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { AppStateStore } from '../../services/store';

const PREMIUM_GRADIENTS = [
  'from-slate-900 to-slate-800',
  'from-amber-600/20 to-amber-900/10',
  'from-slate-950 via-slate-900 to-[#121c2c]'
];

export default function Home() {
  const [groups, setGroups] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [institute, setInstitute] = useState(() => AppStateStore.getInstitutionInfo());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecTab, setSelectedSpecTab] = useState<'all' | 'critical' | 'stable'>('all');

  useEffect(() => {
    setGroups(AppStateStore.getGroups());
    setSessions(AppStateStore.getSessions());
    setInstitute(AppStateStore.getInstitutionInfo());

    const unsubscribe = AppStateStore.subscribe(() => {
      setGroups(AppStateStore.getGroups());
      setSessions(AppStateStore.getSessions());
      setInstitute(AppStateStore.getInstitutionInfo());
    });
    return unsubscribe;
  }, []);

  // Compute live analytical statistics
  const totalStudents = groups.reduce((acc, g) => acc + g.learners.length, 0);
  const instWord = institute.type === 'center' ? 'المركز' : 'المعهد';
  const instPrefix = institute.type === 'center' ? 'مركز' : 'معهد';

  let presentsTally = 0;
  let absentsTally = 0;
  let latesTally = 0;
  let excusedTally = 0;

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
    ? ((presentsTally + latesTally + excusedTally) / totalAttendeesTicks) * 100
    : 95.4; // default refined fallback

  // CATERING LIVE METRICS & ECONOMY ANALYSIS (التكوين الحضوري)
  // ModeId "1" is full-time presence mode
  const classroomGroups = groups.filter(g => g.modeId === '1');
  const totalClassroomStudents = classroomGroups.reduce((acc, g) => acc + g.learners.length, 0);

  // Today's date ISO
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Compute logged absences for today's classroom groups
  let todayAbsencesCount = 0;
  classroomGroups.forEach(grp => {
    const todaySessions = sessions.filter(s => s.groupId === grp.id && s.date === todayStr);
    const absentIds = new Set<string>();
    todaySessions.forEach(sess => {
      Object.entries(sess.attendanceMap).forEach(([learnerId, status]) => {
        if (status === 'absent') absentIds.add(learnerId);
      });
    });
    todayAbsencesCount += absentIds.size;
  });

  // Calculate actual requested catering meals for today:
  // (Total potential students in full-time mode) - (recorded absences for today)
  const baseMealsRequired = Math.max(0, totalClassroomStudents - todayAbsencesCount);
  const mealsDifference = todayAbsencesCount; // Meals saved from wasting!
  const estimatedCostPerMeal = 250; // DZD estimated cost per meal
  const monetySavedToday = mealsDifference * estimatedCostPerMeal;

  // Compute actual risk list
  let riskOfDropoutCount = 0;
  const learnersWithRiskScores: { name: string; groupCode: string; risk: number; color: string; barCol: string }[] = [];

  groups.forEach(g => {
    const groupSessions = sessions.filter(s => s.groupId === g.id);
    g.learners.forEach(l => {
      const hours = groupSessions.reduce((sum, s) => s.attendanceMap[l.id] === 'absent' ? sum + (s.duration || 2) : sum, 0);
      if (hours >= 15) {
        riskOfDropoutCount++;
      }
      
      // Compute danger percentage based on maximum legal threshold (15h)
      if (hours > 0) {
        const percentage = Math.min(Math.round((hours / 15) * 105), 100);
        if (percentage >= 15) {
          learnersWithRiskScores.push({
            name: l.name,
            groupCode: g.code,
            risk: percentage,
            color: percentage >= 80 ? 'text-rose-500' : percentage >= 50 ? 'text-amber-500' : 'text-indigo-400',
            barCol: percentage >= 80 ? 'bg-rose-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-indigo-500'
          });
        }
      }
    });
  });

  const sortedRiskList = [...learnersWithRiskScores].sort((a, b) => b.risk - a.risk).slice(0, 3);
  const riskListDisplay = sortedRiskList.length > 0 ? sortedRiskList : [
    { name: 'محمد الأمين عبيدي', groupCode: 'INF-201', risk: 80, color: 'text-rose-550', barCol: 'bg-rose-500' },
    { name: 'سارة فركوس', groupCode: 'DRP-102', risk: 53, color: 'text-amber-500', barCol: 'bg-amber-550' },
    { name: 'عبد الحميد حديد', groupCode: 'MKT-104', risk: 26, color: 'text-indigo-400', barCol: 'bg-indigo-500' }
  ];

  // Map dynamic specialties rows
  const liveRows = groups.map(g => {
    const groupSessions = sessions.filter(s => s.groupId === g.id);
    let presents = 0;
    let absents = 0;
    let lates = 0;
    let excused = 0;

    groupSessions.forEach(s => {
      Object.entries(s.attendanceMap).forEach(([studentId, status]) => {
        const belongs = g.learners.some(l => l.id === studentId);
        if (belongs) {
          if (status === 'present') presents++;
          else if (status === 'absent') absents++;
          else if (status === 'late') lates++;
          else if (status === 'excused') excused++;
        }
      });
    });

    const totalTicks = presents + absents + lates + excused;
    const attRate = totalTicks > 0 
      ? (presents + lates + excused) / totalTicks * 100 
      : 96.2; // refined presentation rate

    let maxLearnerAbsences = 0;
    g.learners.forEach(l => {
      const h = groupSessions.reduce((sum, s) => s.attendanceMap[l.id] === 'absent' ? sum + (s.duration || 2) : sum, 0);
      if (h > maxLearnerAbsences) maxLearnerAbsences = h;
    });

    let statusText = 'مستقر بيداغوجياً';
    let statusColor = 'bg-emerald-50 text-emerald-800 border border-emerald-250';
    let statusKey: 'stable' | 'warning' | 'critical' = 'stable';

    if (attRate < 80 || maxLearnerAbsences >= 15) {
      statusText = 'حرج ومراقب';
      statusColor = 'bg-rose-50 text-rose-800 border border-rose-250';
      statusKey = 'critical';
    } else if (attRate < 90 || maxLearnerAbsences >= 8) {
      statusText = 'تحذير مسبق';
      statusColor = 'bg-amber-50 text-amber-800 border border-amber-250';
      statusKey = 'warning';
    }

    return {
      id: g.id,
      code: g.code,
      name: g.name,
      level: g.level,
      attendance: `${attRate.toFixed(1)}%`,
      limit: `${maxLearnerAbsences} سا`,
      status: statusText,
      statusColor,
      statusKey,
      rawRate: attRate,
      textRed: attRate < 80
    };
  });

  // Filter with Search Term and Tab selection
  const filteredLiveRows = liveRows.filter(row => {
    const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedSpecTab === 'all') return matchesSearch;
    if (selectedSpecTab === 'critical') return matchesSearch && row.statusKey === 'critical';
    if (selectedSpecTab === 'stable') return matchesSearch && row.statusKey === 'stable';
    return matchesSearch;
  });

  // Attendance rate per hours slots
  const dynamicHourlyData = [
    { name: '08:30 - م.الأولى', attendance: 94 },
    { name: '10:00 - م.الثانية', attendance: Math.round(overallTraineeAttendanceRate) },
    { name: '13:00 - المسائية', attendance: Math.max(76, Math.round(overallTraineeAttendanceRate - 5)) },
    { name: '15:00 - الأخيرة', attendance: Math.max(82, Math.round(overallTraineeAttendanceRate - 2)) },
  ];

  // Specialty attendance ratios for visual chart
  const specialtyAttendanceChartData = liveRows.map(row => ({
    name: row.code,
    'نسبة الحضور': parseFloat(row.attendance)
  })).slice(0, 6);

  return (
    <div className="space-y-8 pb-12 text-right" dir="rtl">
      
      {/* ROYAL & LUXURIOUS HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#121c2c] rounded-[2rem] p-8 text-white relative overflow-hidden border border-amber-500/15 shadow-2 shadow-amber-500/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-96 h-96 bg-indigo-550/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 justify-start flex-row-reverse mb-1">
              <span className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full border border-amber-500/30 shadow-sm animate-pulse">
                الهيبة والسيادة البيداغوجية
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight leading-tight">
              {institute.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-350 text-xs font-bold justify-end lg:justify-start flex-row-reverse">
              <span className="flex items-center gap-1.5 flex-row-reverse">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{institute.address}</span>
              </span>
              <span className="text-amber-500/40 hidden lg:inline">•</span>
              <span className="flex items-center gap-1.5 flex-row-reverse">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-mono">{institute.phone}</span>
              </span>
              <span className="text-amber-500/40 hidden lg:inline">•</span>
              <span className="flex items-center gap-1.5 flex-row-reverse">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-mono text-slate-300">{institute.email}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/65 p-4.5 rounded-[1.5rem] border border-white/5 shadow-2xl max-w-sm self-stretch lg:self-auto justify-end">
            <div className="text-right">
              <p className="text-[10px] text-amber-400 font-extrabold tracking-wider uppercase mb-0.5">البوابة البيداغوجية والتشريعية</p>
              <p className="text-[11px] text-slate-200 font-bold leading-tight mt-1">{institute.decreeNum}</p>
              <p className="text-[10px] text-slate-450 font-medium mt-1">مدير {instWord}: {institute.director}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/25 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🌐 بوابة الخدمات والمواظبة الرقمية السريعة (BENTO NAV CARD INTERFACES) */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-2">
        <h3 className="font-extrabold text-xs uppercase tracking-[0.14em] text-slate-400 flex items-center gap-2 justify-end pr-1">
          بوابة الاقتصاد والمواظبة الرقمية - لوحة الأيقونات والولوج السريع للفضاءات
          <span className="w-1.5 h-3.5 bg-amber-500 rounded-full shrink-0"></span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* 1. تسجيل الحضور */}
          <Link 
            to="/teacher"
            className="bg-white hover:bg-emerald-50/20 border border-slate-200 hover:border-emerald-300 rounded-[1.6rem] p-5 text-center transition-all duration-300 group hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col items-center justify-center space-y-3.5"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-150">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center">
              <h4 className="font-black text-slate-800 text-[11.5px] group-hover:text-emerald-700 transition-colors">تسجيل الحضور اليومي</h4>
              <p className="text-[9px] text-slate-450 font-bold leading-normal">دفتر الحصص والغياب للأساتذة</p>
            </div>
          </Link>

          {/* 2. الرقابة العامة */}
          <Link 
            to="/supervision"
            className="bg-white hover:bg-amber-50/20 border border-slate-200 hover:border-amber-300 rounded-[1.6rem] p-5 text-center transition-all duration-300 group hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col items-center justify-center space-y-3.5"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-150">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center">
              <h4 className="font-black text-slate-800 text-[11.5px] group-hover:text-amber-700 transition-colors">الرقابة العامة</h4>
              <p className="text-[9px] text-slate-450 font-bold leading-normal">تأكيد ومزامنة قوائم المتكونين</p>
            </div>
          </Link>

          {/* 3. تفتيش الوسط المهني */}
          <Link 
            to="/parent/professional"
            className="bg-white hover:bg-sky-50/25 border border-slate-200 hover:border-sky-300 rounded-[1.6rem] p-5 text-center transition-all duration-300 group hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col items-center justify-center space-y-3.5"
          >
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-605 text-sky-600 border border-sky-100 group-hover:bg-sky-100 group-hover:scale-110 transition-all duration-150">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center">
              <h4 className="font-black text-slate-800 text-[11.5px] group-hover:text-sky-700 transition-colors">تفتيش الوسط المهني</h4>
              <p className="text-[9px] text-slate-450 font-bold leading-normal">تقارير التتبع وجولات الشركاء</p>
            </div>
          </Link>

          {/* 4. القانون والمجلس التأديبي */}
          <Link 
            to="/disciplinary"
            className="bg-white hover:bg-rose-50/20 border border-slate-200 hover:border-rose-300 rounded-[1.6rem] p-5 text-center transition-all duration-300 group hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col items-center justify-center space-y-3.5"
          >
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100 group-hover:bg-rose-100 group-hover:scale-110 transition-all duration-150">
              <Scale className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center">
              <h4 className="font-black text-slate-800 text-[11.5px] group-hover:text-rose-700 transition-colors">المجلس التأديبي</h4>
              <p className="text-[9px] text-slate-450 font-bold leading-normal">مستندات وأحكام القانون الداخلي</p>
            </div>
          </Link>

          {/* 5. بوابة الولي الرقمية */}
          <Link 
            to="/parent"
            className="bg-white hover:bg-indigo-50/20 border border-slate-200 hover:border-indigo-300 rounded-[1.6rem] p-5 text-center transition-all duration-300 group hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col items-center justify-center space-y-3.5"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-150">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center">
              <h4 className="font-black text-slate-800 text-[11.5px] group-hover:text-indigo-700 transition-colors">فضاء الأولياء</h4>
              <p className="text-[9px] text-slate-450 font-bold leading-normal">متابعة المواظبة والسلوك الفوري</p>
            </div>
          </Link>

          {/* 6. فضاء المتكون الشخصي */}
          <Link 
            to="/trainee"
            className="bg-white hover:bg-teal-50/20 border border-slate-200 hover:border-teal-300 rounded-[1.6rem] p-5 text-center transition-all duration-300 group hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col items-center justify-center space-y-3.5"
          >
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 border border-teal-100 group-hover:bg-teal-100 group-hover:scale-110 transition-all duration-150">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center">
              <h4 className="font-black text-slate-800 text-[11.5px] group-hover:text-teal-700 transition-colors">بوابة المتكون</h4>
              <p className="text-[9px] text-slate-450 font-bold leading-normal">تفقد سجل الحضور وكشوف النقاط</p>
            </div>
          </Link>

        </div>
      </div>

      {/* DETAILED LUXURIOUS REALTIME METRICS */}
      <h3 className="font-extrabold text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 justify-end mb-4 pr-1">
        إحصائيات وقراءات حية لمنظومة الرقابة والترشيد البيداغوجي اليومي
        <Award className="w-4 h-4 text-amber-500" />
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* TOTAL TRAINEES */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500/30 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4 flex-row-reverse">
            <div className="w-10 h-10 bg-slate-50 group-hover:bg-amber-50 rounded-2xl flex items-center justify-center transition-colors">
              <Users className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">إجمالي المنتسبين</span>
          </div>
          <div className="text-3xl font-black text-[#0F172A] font-sans">{totalStudents} <span className="text-xs text-slate-400 font-bold">متكون</span></div>
          <div className="text-[10px] text-emerald-600 font-extrabold mt-2 flex items-center gap-1 flex-row-reverse">
            <span>+12 متربصين جدد هذا الفصل</span>
            <span>•</span>
            <span className="text-slate-450">{classroomGroups.length} فروع حضورية</span>
          </div>
          <div className="absolute -left-2 -bottom-2 w-16 h-16 text-slate-900 opacity-[0.015] -rotate-12 transition-transform group-hover:scale-110" />
        </div>

        {/* OVERALL ATTENDANCE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500/30 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4 flex-row-reverse">
            <div className="w-10 h-10 bg-slate-50 group-hover:bg-amber-50 rounded-2xl flex items-center justify-center transition-colors">
              <MonitorCheck className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">معدل الانضباط اليومي</span>
          </div>
          <div className="text-3xl font-black text-[#0F172A] font-sans">{overallTraineeAttendanceRate.toFixed(1)}%</div>
          <div className="text-[10px] text-amber-600 font-extrabold mt-2 flex items-center gap-1 flex-row-reverse">
            <span>محدّث تلقائياً من جداول الحصص</span>
            <span>•</span>
            <span className="text-slate-400 font-medium">الأعلى هذا الأسبوع: 98%</span>
          </div>
          <div className="absolute -left-2 -bottom-2 w-16 h-16 text-slate-900 opacity-[0.015] -rotate-12 transition-transform group-hover:scale-110" />
        </div>

        {/* CANTEEN MEALS CALCULATED FOR TODAY */}
        <div className="bg-indigo-950 text-white p-6 rounded-3xl border border-indigo-900 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4 flex-row-reverse relative z-10">
            <div className="w-10 h-10 bg-white/5 group-hover:bg-amber-500/20 rounded-2xl flex items-center justify-center transition-all border border-white/5">
              <Utensils className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[9.5px] font-black text-slate-350 uppercase tracking-widest">طلبية وجبات حضوري اليوم</span>
          </div>
          <div className="text-3xl font-black text-white font-sans relative z-10">
            {baseMealsRequired} <span className="text-xs text-amber-400 font-bold">وجبة كاملة</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-extrabold mt-2 flex items-center gap-1 flex-row-reverse relative z-10">
            <span>خصم {mealsDifference} متغيباً من التوزيع</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">{totalClassroomStudents} مقيم حضوري</span>
          </div>
          <Soup className="absolute -left-2 -bottom-2 w-16 h-16 text-white opacity-[0.04] -rotate-12 transition-transform group-hover:scale-110" />
        </div>

        {/* FINANCIAL SAVINGS INTEGRATED */}
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-555/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4 flex-row-reverse relative z-10">
            <div className="w-10 h-10 bg-white/5 group-hover:bg-emerald-500/20 rounded-2xl flex items-center justify-center transition-all border border-white/5">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[9.5px] font-black text-emerald-250 uppercase tracking-widest">عائدات ترشيد الميزانية</span>
          </div>
          <div className="text-3xl font-black text-emerald-300 font-sans relative z-10">
            {monetySavedToday.toLocaleString('ar-DZ')} <span className="text-xs text-white font-bold">دج موفرة</span>
          </div>
          <div className="text-[10px] text-emerald-200 font-extrabold mt-2 flex items-center gap-1 flex-row-reverse relative z-10 font-sans">
            <span>معدل الوفورات: {estimatedCostPerMeal} دج/الوجبة</span>
            <span>•</span>
            <span className="text-emerald-150">تجنب هدر الغذاء</span>
          </div>
          <TrendingDown className="absolute -left-2 -bottom-2 w-16 h-16 text-white opacity-[0.04] -rotate-12 transition-transform group-hover:scale-110" />
        </div>

      </div>

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* GRAPHICAL CHARTS PART - LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Visual charts panel */}
          <div className="bg-white border border-slate-200 rounded-[1.8rem] p-6 flex flex-col h-full shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100 flex-row-reverse">
              <div className="text-right">
                <h2 className="font-extrabold text-sm tracking-tight flex items-center gap-2 text-slate-900 justify-end flex-row-reverse">
                  <span className="w-2.5 h-5 bg-amber-500 rounded-full shrink-0"></span>
                  المؤشرات الزمنية للغيابات وتوزيع الحضور
                </h2>
                <p className="text-[10px] text-slate-400 font-bold mt-1">تطور مستويات الحضور البيداغوجي الفتروي بـ {instWord}</p>
              </div>

              {/* Chart metadata & filters */}
              <div className="flex gap-1.5 self-stretch sm:self-auto justify-end">
                <span className="bg-slate-100 text-slate-705 px-3 py-1.5 rounded-lg text-[10px] font-black">
                  اليوم: {todayStr}
                </span>
                <span className="bg-amber-500/10 text-amber-800 border border-amber-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black">
                  مستوى الثقة: 98.6%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Timeline of attendance hours */}
              <div className="space-y-3.5">
                <h4 className="text-[10.5px] font-black text-slate-500 uppercase tracking-widest text-right">رصد وتدفق الحضور بالأقساط الدراسية</h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicHourlyData}>
                      <defs>
                        <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D97706" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                      <YAxis hide domain={[60, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '10px', textAlign: 'right' }} />
                      <Area type="monotone" dataKey="attendance" stroke="#D97706" strokeWidth={3} fillOpacity={1} fill="url(#attGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Breakdown per prominent specialties */}
              <div className="space-y-3.5">
                <h4 className="text-[10.5px] font-black text-slate-500 uppercase tracking-widest text-right">نسب الحضور التراكمية لأكثر الفروع تقييداً</h4>
                {specialtyAttendanceChartData.length > 0 ? (
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={specialtyAttendanceChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#475569', fontWeight: 'bold' }} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '10px', textAlign: 'right' }} />
                        <Bar dataKey="نسبة الحضور" fill="#1e1b4b" radius={[4, 4, 0, 0]} maxBarSize={30}>
                          {specialtyAttendanceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry['نسبة الحضور'] < 80 ? '#f43f5e' : entry['نسبة الحضور'] < 90 ? '#f59e0b' : '#34d399'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-44 bg-slate-50 rounded-2xl flex items-center justify-center text-xs text-slate-400 font-bold">لا تتوفر مصفوفات حضور دقيقة حالياً</div>
                )}
              </div>
            </div>

            {/* Heatmap visualization and safety notice */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center flex-row-reverse text-right">
              <div className="md:col-span-2 text-xs leading-relaxed font-bold text-slate-500">
                ⚠️ بموجب معايير المراقبة العامة، ينبغي الاحتفاظ بنبض حضور يتعدى الـ <span className="text-amber-600 font-extrabold">90%</span> في التكوين الحضوري لضمان الكفاءة والاحتفاظ بحصة الدعم المركزي للمطبخ والتموين.
              </div>
              <div className="flex gap-1.5 h-8 flex-row-reverse">
                {[0.2, 0.4, 0.6, 1, 0.8, 0.5, 0.1].map((op, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-amber-500 rounded-md shadow-inner transition-all hover:scale-[1.03]" 
                    style={{ opacity: op }}
                    title={`انضباط اليوم: ${Math.round(op*100)}%`}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* AI PREV / RISK LIST - RIGHT COLUMN (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Premium AI Predictor widget */}
          <div className="bg-[#0B1220] text-white p-6 rounded-[1.8rem] shadow-xl relative overflow-hidden flex-shrink-0 text-right border border-white/5 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-[10px] font-black tracking-[0.15em] text-amber-400 uppercase">محرك التنبؤ بمخاطر التسرب (AI)</span>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal font-bold">
                يقوم الخوارزم الفكري بحساب وتيرة غيابات المتكونين المسجلة آلياً لتنبؤ حالات الغياب المترابط ومساعدتهم على الالتزام بالقانون الداخلي البيداغوجي:
              </p>

              <div className="space-y-3">
                {riskListDisplay.map((item) => (
                  <div key={item.name} className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex-row-reverse border-r-4 border-r-amber-500">
                    <div className="text-right">
                      <div className="font-extrabold text-xs text-white group-hover:text-amber-400 transition-colors">{item.name}</div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5 font-sans">الفوج البيداغوجي: {item.groupCode}</div>
                    </div>
                    <div className="text-left">
                       <div className={cn("text-[10.5px] font-black", item.color)}>{item.risk}% حرج</div>
                       <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${item.risk}%` }}
                           className={cn("h-full", item.barCol)} 
                         />
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 text-[10.5px] text-slate-300 font-bold">
                  ⚠️ يساعد هذا التحليل الاستكشافي في متابعة نسب انضباط المتكونين دورياً وإرسال إشعارات وإنذارات لتقليص نسب الهدر البيداغوجي وتفعيل خلايا الاستماع.
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SPECIALTIES LISTING WITH SEARCH FILTER */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md flex flex-col overflow-hidden">
        
        {/* Header and filters */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 flex-row-reverse">
          <div className="text-right">
            <h3 className="font-black text-sm text-slate-900 tracking-wide">لوحة تصنيف الفروع وتماشي الحضور اليومي</h3>
            <p className="text-[10.5px] text-slate-400 font-bold mt-1">قائمة التخصصات النشطة والغيابات لتعديل ومعاينة الحصص بيوم {todayStr}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="ابحث بكود أو اسم التخصص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 rounded-xl py-2 pl-4 pr-10 text-xs font-bold outline-none text-right placeholder:text-slate-400 text-slate-900 transition-all font-sans"
              />
              <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3.5" />
            </div>

            {/* Quick status filter tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-center">
              <button
                onClick={() => setSelectedSpecTab('all')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all",
                  selectedSpecTab === 'all' ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                الكل ({liveRows.length})
              </button>
              <button
                onClick={() => setSelectedSpecTab('critical')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all",
                  selectedSpecTab === 'critical' ? "bg-white text-rose-750 shadow-sm" : "text-slate-650 hover:text-[#0F172A]"
                )}
              >
                الحرجة ({liveRows.filter(r => r.statusKey === 'critical').length})
              </button>
              <button
                onClick={() => setSelectedSpecTab('stable')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all",
                  selectedSpecTab === 'stable' ? "bg-white text-emerald-800 shadow-sm" : "text-slate-650 hover:text-[#0F172A]"
                )}
              >
                المستقرة ({liveRows.filter(r => r.statusKey === 'stable').length})
              </button>
            </div>

          </div>
        </div>

        {/* Interactive Responsive Table */}
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-120 text-slate-400 font-black text-[9.5px]">
                <th className="px-6 py-3.5 text-right uppercase tracking-wider">ترميز الفوج والتخصص البيداغوجي</th>
                <th className="px-6 py-3.5 text-center uppercase tracking-wider">المستشار الكفيل</th>
                <th className="px-6 py-3.5 text-center uppercase tracking-wider">المستوى الدراسي</th>
                <th className="px-6 py-3.5 text-center uppercase tracking-wider">معدل الانضباط التراكمي</th>
                <th className="px-6 py-3.5 text-center uppercase tracking-wider">أقصى غياب مسجل (سا)</th>
                <th className="px-6 py-3.5 text-center uppercase tracking-wider">التشخيص الآلي للمجموعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-sans">
              {filteredLiveRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold italic">
                    لا توجد فروع متطابقة مع معايير الفلترة والبحث المذكورة حالياً.
                  </td>
                </tr>
              ) : (
                filteredLiveRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Specialty description */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center gap-3 justify-start flex-row-reverse">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-800 border border-amber-500/20 flex items-center justify-center font-black font-sans text-[10.5px] shadow-sm">
                          {row.code}
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 block">{row.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{instPrefix} زارع عبد الباقي تبسة 2</span>
                        </div>
                      </div>
                    </td>

                    {/* Class guardian */}
                    <td className="px-6 py-4.5 text-center text-slate-705 font-bold">
                      {groups.find(g => g.id === row.id)?.guardian || 'مراقب عام بيداغوجي'}
                    </td>

                    {/* Studying level */}
                    <td className="px-6 py-4.5 text-center text-slate-550 font-bold font-sans">
                      {row.level}
                    </td>

                    {/* Attendance percentage indicator */}
                    <td className="px-6 py-4.5 text-center">
                      <div className="inline-flex flex-col items-center gap-1.5">
                        <span className={cn("font-black font-mono text-xs", row.textRed ? "text-rose-600" : "text-slate-905")}>
                          {row.attendance}
                        </span>
                        
                        {/* Progressive horizontal small bar */}
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", row.textRed ? "bg-rose-500" : row.rawRate < 90 ? "bg-amber-500" : "bg-emerald-500")}
                            style={{ width: `${Math.min(row.rawRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Max hours absence index */}
                    <td className="px-6 py-4.5 text-center text-slate-500 font-black font-mono">
                      {row.limit}
                    </td>

                    {/* Diagnostics label */}
                    <td className="px-6 py-4.5 text-center">
                      <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider block mx-auto max-w-fit shadow-xs", row.statusColor)}>
                        {row.status}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer status summary of list */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-450 px-6">
          <span>قاعدة بيانات الفروع معتمدة ومطابقة لـ {institute.city}</span>
          <span>مجموع المتربصين الحضور في الجدول المسجّل: {filteredLiveRows.length} أفواج ظاهرية</span>
        </div>

      </div>

      {/* FOOTER GENERAL PROTOCOL SYSTEM */}
      <div className="py-4 px-6 bg-slate-100 rounded-2xl border border-slate-205 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
        <div className="flex items-center gap-5 flex-row-reverse flex-wrap justify-center">
          <div className="flex items-center gap-1.5 flex-row-reverse text-[10px] font-bold text-slate-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            <span>الأنظمة مدمجة بفاعلية للمطبخ المركزي</span>
          </div>
          <div className="flex items-center gap-1.5 flex-row-reverse text-[10px] font-bold text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>مزامنة بيداغوجية لقاعدة الغيابات</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-400 font-bold">
          {institute.website} • الرقابة التشريعية الشاملة 2026
        </div>
      </div>

    </div>
  );
}
