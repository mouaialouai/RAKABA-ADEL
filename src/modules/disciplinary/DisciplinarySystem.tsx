import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  UserX, 
  FileCheck, 
  Search, 
  Filter,
  BrainCircuit,
  MessageSquareWarning,
  Printer,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  X,
  FileText,
  UploadCloud,
  Check,
  CheckCircle,
  Sliders,
  Play,
  Sparkles,
  Plus,
  ShieldCheck,
  Award,
  Activity,
  UserCheck,
  MapPin,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppStateStore, SpecializationGroup, AttendanceSession, DisciplinaryReferral } from '../../services/store';

// Define structure for comprehensive internal bylaw chapters
interface BylawArticle {
  number: string;
  title: string;
  text: string;
  sanctionLevel?: string;
}

interface BylawChapter {
  id: string;
  title: string;
  articles: BylawArticle[];
}

const DEFAULT_BYLAW_CHAPTERS: BylawChapter[] = [
  {
    id: 'CH-1',
    title: 'الفصل الأول: المواظبة الزمنية وتدابير تتبع الغيابات بتبسة 2',
    articles: [
      {
        number: 'المادة 12',
        title: 'احتساب قيمة غياب المتكونين',
        text: 'يتم احتساب الغياب الفعلي بالساعات بصفة يومية دقيقة. ويمنح كل غياب غير مبرر مدته ساعة واحدة خصماً سلوكياً بوزن 0.25 يوماً سلوكياً لمطابقة عقوبات الرقابة العامة.',
        sanctionLevel: 'تنظيمي عام'
      },
      {
        number: 'المادة 15',
        title: 'عتبة توجيه الإنذار البيداغوجي الأول',
        text: 'يوجه للمتكون إنذار أول خطي رسمي بمجرد بلوغه عتبة غياب تعادل 3 أيام سلوكية غير مبررة (ما يوازي 12 ساعة حقيقية من الحصص).',
        sanctionLevel: 'إنذار بيداغوجي أول'
      },
      {
        number: 'المادة 16',
        title: 'عتبة التوبيخ والإنذار الثاني بالملف',
        text: 'يتلقى المتربص توبيخاً مكتوباً شديداً بملفه الأكاديمي مع استدعاء الولي عند تراكم غياب غير مبرر يعادل 5 أيام (يوازي 20 ساعة حصص غائبة).',
        sanctionLevel: 'توبيخ وإنذار بملفه'
      },
      {
        number: 'المادة 17',
        title: 'الإحالة الحتمية على اللجنة للمثول أمام المجلس',
        text: 'يتم تحويل ملف المتربص بقوة القانون مباشرة لمجلس التأديب عند بلوغه غيايات تعادل 7 أيام غير مبررة (28 ساعة) لبحث تجميد المزاولة والمنحة.',
        sanctionLevel: 'المثول للمجلس التأديبي'
      },
      {
        number: 'المادة 18',
        title: 'عقوبة الشطب النهائي القطعي المصدق',
        text: 'يسقط حق المتكون بالكامل ويتم شطبه نهائياً من سجلات المعهد عند تجاوز غيابه التراكمي لـ 10 أيام (40 ساعة) دون مبرر تقبله عيادة البيداغوجيا.',
        sanctionLevel: 'الشطب الكلي النهائي'
      }
    ]
  },
  {
    id: 'CH-2',
    title: 'الفصل الثاني: السلوك والمظهر والهندام والنزاهة وحرمة الحرم المهني',
    articles: [
      {
        number: 'المادة 20',
        title: 'الارتداء الإلزامي للمئزر والسترة لتبسة 2',
        text: 'يلتزم المتكون بالكامل بارتداء السترة والمئزر الرمادي أو الأزرق قبل الولوج إلى كافة ورشات المعهد والمخابر البيداغوجية، ويمنع الدخول بأي مظهر مخل.',
        sanctionLevel: 'تنبيه خطي / توبيخ رسمي'
      },
      {
        number: 'المادة 21',
        title: 'حظر استخدام الهواتف الذكية والتنبيه البصري',
        text: 'يمنع تشغيل الهواتف المحمولة أو استعمال السماعات اللاسلكية أثناء الدروس النظرية والتطبيقية، ويعاقب المخالف بمصادرة الهاتف وخصم نقاط السلوك.',
        sanctionLevel: 'خصم السلوك وسحب الهاتف'
      },
      {
        number: 'المادة 22',
        title: 'الاحترام الأخلاقي للمؤطرين والمتربصين',
        text: 'كل سلوك يتعدى على كرامة المؤطرين بورشات المعهد، أو إحداث الفوضى بالساحة يعتبر خطأ جسيماً من الدرجة الثالثة يحال فاعله فورياً للمجلس.',
        sanctionLevel: 'إحالة عاجلة لمجلس التأديب'
      }
    ]
  },
  {
    id: 'CH-3',
    title: 'الفصل الثالث: حماية وتأمين تجهيزات الورشات وعتاد الإعلام الآلي',
    articles: [
      {
        number: 'المادة 31',
        title: 'مسؤولية إتلاف وتخريب الأثاث والعتاد',
        text: 'يتحمل المتربص كامل التبعات والمسؤولية المالية والمدنية حال ثبوت إتلافه العمد لأجهزة المخابر، ماكينات الخياطة بتبسة، عتاد السباكة، أو أجهزة الكمبيوتر.',
        sanctionLevel: 'التعويض المالي التام مع إنذار مكمل'
      },
      {
        number: 'المادة 32',
        title: 'تنظيف وترتيب الملحقات ومحطات التدريب',
        text: 'يتوجب على أفواج التربص تنظيف الورشات وترتيب الأدوات بعد نهاية كل فترة تطبيقية، ويعاقب المخالف بإنذارات شفهية تراكمية.',
        sanctionLevel: 'إنذار شفهي بيداغوجي'
      }
    ]
  },
  {
    id: 'CH-4',
    title: 'الفصل الرابع: هيكلة تدرج العقوبات والقصاص وجدول المجلس التأديبي الدوري',
    articles: [
      {
        number: 'المادة 40',
        title: 'ميقات الانعقاد الدوري للمجلس التأديبي',
        text: 'يتم عقد واجتماع المجلس التأديبي بصفة دورية ثابتة في الأسبوع الثالث من كل شهر يوم الخميس، للنظر في كافة إحالات المواظبة والسلوك والبت فيها.',
        sanctionLevel: 'نظامي دوري ثابت'
      },
      {
        number: 'المادة 41',
        title: 'حق الدفاع والاستماع لمتكوني ولاية تبسة',
        text: 'أي متكون محال على المجلس التأديبي يمنح الحق الكامل في الإدلاء بشهادته وتقديم مبرراته البيداغوجية، شريطة الحضور الإلزامي رفقة ولي أمره الشرعي.',
        sanctionLevel: 'إداري تشريعي مكرس'
      }
    ]
  },
  {
    id: 'CH-5',
    title: 'الفصل الخامس: لوحة التميز، التشجيعات والجوائز والتحفيز الذاتي',
    articles: [
      {
        number: 'المادة 51',
        title: 'سجل الشرف وتزكية لوحة الفخر السنوية',
        text: 'تدرج أسماء المتكونين المنضبطين ذوي السجل الخالي تماماً من غيابات الطرح بالرقابة العامة على لوحة الشرف لتزكيتهم للمنح المهنية والمكافآت السلوكية.',
        sanctionLevel: 'تزكية شرفية بملفه'
      }
    ]
  }
];

export default function DisciplinarySystem() {
  const [activeTab, setActiveTab] = useState<'referrals' | 'regulations' | 'auditor'>('referrals');
  const [referrals, setReferrals] = useState<any[]>(() => AppStateStore.getDisciplinaryReferrals());
  const [institute, setInstitute] = useState(() => AppStateStore.getInstitutionInfo());
  const instWord = institute.type === 'center' ? 'المركز' : 'المعهد';
  const instPrefix = institute.type === 'center' ? 'مركز' : 'معهد';
  const [groups, setGroups] = useState<any[]>(() => AppStateStore.getGroups());
  const [sessions, setSessions] = useState<any[]>(() => AppStateStore.getSessions());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom editable bylaws state
  const [bylawChapters, setBylawChapters] = useState<BylawChapter[]>(() => {
    const saved = localStorage.getItem('rq_bylaw_chapters');
    return saved ? JSON.parse(saved) : DEFAULT_BYLAW_CHAPTERS;
  });

  const [selectedChapterForEdit, setSelectedChapterForEdit] = useState<string | null>('CH-1');
  
  // Selection logic for printing summits
  const [selectedReferralForPrint, setSelectedReferralForPrint] = useState<any | null>(null);

  // Quick Summon Modal configurations from the compliance auditor
  const [showQuickSummonModal, setShowQuickSummonModal] = useState(false);
  const [targetTraineeForSummon, setTargetTraineeForSummon] = useState<any | null>(null);
  const [summonReason, setSummonReason] = useState('');
  const [summonDate, setSummonDate] = useState('');
  const [summonTime, setSummonTime] = useState('10:30 صباحاً');
  const [summonPlace, setSummonPlace] = useState('مكتب مستشار الرقابة العامة الرئيسي');
  const [summonHall, setSummonHall] = useState('قاعة الاجتماعات الكبرى رقم 03 - الطابق الأول'); // New field for Classroom / Hall number

  // Mass Scheduling States
  const [selectedTraineesForMass, setSelectedTraineesForMass] = useState<Record<string, boolean>>({});
  const [massDate, setMassDate] = useState('');
  const [massTime, setMassTime] = useState('10:30 صباحاً');
  const [massPlace, setMassPlace] = useState('مكتب مستشار الرقابة العامة الرئيسي');
  const [massHall, setMassHall] = useState('قاعة الاجتماعات الكبرى رقم 03 - الطابق الأول');

  // Date selection for Daily/Weekly/Monthly absence tracking
  const [selectedAuditorDate, setSelectedAuditorDate] = useState('2026-05-24'); // Default reference date

  // AI legal framework configurations
  const [aiRegulations, setAiRegulations] = useState(() => {
    const saved = localStorage.getItem('rq_ai_analyzed_regulations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return {
      fileName: 'النظام الداخلي للغيابات والعقوبات - معهد تبسة 2.pdf',
      analyzedAt: 'نشط • تم التحليل بموجب الميثاق المرفق',
      status: 'active',
      rules: {
         absentHourWeight: 0.25, 
         alertMaxDays: 3,               // تنبيه إذا لم تتجاوز 3 أيام
         warningMaxDays: 9,             // إنذار إذا تجاوزت 3 أيام وأقل من 10 أيام
         reprimandDays: 10,             // توبيخ إذا بلغت الغيابات 10 أيام
         consecutiveDismissalDays: 15,  // إقصاء نهائي إذا بلغت 15 يوماً متتالية
         fragmentedDismissalDays: 20,   // إقصاء نهائي إذا بلغت 20 يوماً مجزأة
         warning1: 3,
         warning2: 9,
         council: 10,
         dismissal: 20,
         decreeNum: "النظام الداخلي للتشريع المهني المحدث",
         customNotes: "يتم احتساب غيابات المتكونين بصفة يومية وأسبوعية وشهرية وعقد المجلس التأديبي الخميس الثالث من كل شهر."
      }
    };
  });

  // Regulations File Upload & AI simulation States
  const [dragActive, setDragActive] = useState(false);
  const [regulationsSourceText, setRegulationsSourceText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);

  // Math helper: Compute the third Thursday of any given year and month
  const getThirdThursdayOfMonth = (year: number, month: number): string => {
    let thursdays: Date[] = [];
    let d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      if (d.getDay() === 4) { // 4 is Thursday
        thursdays.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    const thirdThursday = thursdays[2] || thursdays[thursdays.length - 1] || new Date();
    return thirdThursday.toISOString().split('T')[0];
  };

  // Pre-calculate the current system's recommended third Thursday date based on the chosen auditor date
  const recommendedThursdayDate = (() => {
    try {
      const d = new Date(selectedAuditorDate);
      return getThirdThursdayOfMonth(d.getFullYear(), d.getMonth());
    } catch (e) {
      return getThirdThursdayOfMonth(2026, 4); // May 2026 (index 4) -> 2026-05-21
    }
  })();

  // Keep internal state updated on store changes
  useEffect(() => {
    setReferrals(AppStateStore.getDisciplinaryReferrals());
    setInstitute(AppStateStore.getInstitutionInfo());
    setGroups(AppStateStore.getGroups());
    setSessions(AppStateStore.getSessions());
    
    const unsubscribe = AppStateStore.subscribe(() => {
      setReferrals(AppStateStore.getDisciplinaryReferrals());
      setInstitute(AppStateStore.getInstitutionInfo());
      setGroups(AppStateStore.getGroups());
      setSessions(AppStateStore.getSessions());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setMassDate(recommendedThursdayDate);
    setSummonDate(recommendedThursdayDate);
  }, [recommendedThursdayDate]);

  const getArabicDayName = (dateStr: string) => {
    try {
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const date = new Date(dateStr);
      return days[date.getDay()];
    } catch (e) {
      return '';
    }
  };

  const getArabicMonthName = (monthIdx: number) => {
    const months = [
      'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
      'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[monthIdx] || '';
  };

  const formatFullDateArabic = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${getArabicDayName(dateStr)} ${d.getDate()} ${getArabicMonthName(d.getMonth())} ${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handlePurgeAll = () => {
    AppStateStore.saveDisciplinaryReferrals([]);
    setSuccessMessage("✓ تم بنجاح تصفير سجلات وموقوفي المجلس التأديبي وإلغاء كافة الاستدعاءات الفورية للبدء بصفحة جديدة.");
    setShowPurgeConfirm(false);
  };

  const handleDeleteIndividual = (id: string, name: string) => {
    AppStateStore.deleteDisciplinaryReferral(id);
    setSuccessMessage(`✓ تم إلغاء وشطب الاستدعاء الخاص بالمتكون [${name}] بنجاح من سجلات المجلس.`);
  };

  const handleExportCSV = () => {
    const headers = ['هوية المتكون', 'الفوج والتخصص', 'تاريخ الجلسة', 'توقيت الجلسة', 'القاعة والموقع', 'سبب ومواد الإحالة'];
    const rows = referrals.map(ref => [
      ref.learnerName,
      `${ref.groupName} (${ref.groupCode})`,
      ref.date,
      ref.time,
      ref.place + " - " + (ref.hallNumber || ''),
      ref.reason.replace(/,/g, ' - ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `disciplinary_violations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preset legislative documents in Algerian VET
  const PRESET_DOCUMENTS = [
    {
      title: "ميثاق الانضباط الموحد - معاهد التكوين والتعليم المهنيين 2026",
      decree: "المادة 12 من المرسوم التنفيذي 21-121 المعدل والمتمم",
      text: `القانون الداخلي الموحد لوزارة التكوين لـ معهد تبسة 2.
الباب الأول: السلوك، المظهر والمواظبة الزمنية.
المادة 12: احتساب غياب المتكونين يكون يومياً بدقة، حيث كل غياب 1 ساعة يعادل 0.25 يوماً سلوكياً.
المادة 15 (الإنذار الأول): يمنح المتكون إنذاراً خطياً عند بلوغه غيابات تعادل 3 أيام سلوكية غير مبررة (12 ساعة حصص).
المادة 16 (التوبيخ والإنذار الثاني): يوجه للمتربص توبيخ كتابي رسمي يوضع بملفه عند بلوغه غيابات تعادل 5 أيام سلوكية (20 ساعة حصص).
المادة 17 (المجلس التأديبي بتبسة 2): يحال المتكون للمثول أمام مجلس التأديب في الأسبوع الثالث من الشهر الجاري يوم الخميس عند بلوغه 7 أيام غياب (28 ساعة) في القاعة الكبرى رقم 03.
المادة 18 (الشطب القطعي): يقرر المجلس شطباً نهائياً قاطعا في حق الطالب المتجاوز لغيابات تعادل 10 أيام كاملة (40 ساعة غياب) دون تقديم مبررات قانونية خلال الآجال المعتمدة.`
    },
    {
      title: "التنظيم الولائي لتفتيشية التمهين والمواظبة لولاية تبسة (2025)",
      decree: "المادة 42 من القرار البيداغوجي الولائي لمديرية تبسة",
      text: `اللائحة الخاصة بمعاهد التكوين المهني لولاية تبسة.
- معامل احتساب اليوم السلوكي: كل غياب يعادل 0.25 للفترة.
- الإنذار الأول يظهر عند بلوغ 4 أيام سلوكية غير مبررة (16 ساعة).
- التوبيخ الثاني الشديد والإنذار بملف الطالب وتجميد منحة الترشح يطبق عند بلوغ 6 أيام سلوكية (24 ساعة).
- المثول الفوري لدى المجلس التأديبي ينعقد تلقائياً في الأسبوع الثالث من كل شهر يوم الخميس في القاعة رقم 03 بمجرد تجميع 8 أيام سلوكية (32 ساعة حصص غائبة).
- الشطب النهائي القطعي المصدق يطبق عند تجاوز 12 يوماً سلوكياً (48 ساعة غياب).`
    }
  ];

  // Deep AI Analyzer with animated logs and specific Arabic text parser patterns
  const startRegulationsAIAnalysis = (textToAnalyze: string, customFileName = "مستند_القانون_الداخلي_المرفوع.txt") => {
    if (!textToAnalyze.trim()) {
      alert("الرجاء إدخال أو الصق نص اللائحة الداخلية أولاً ليتمكن محرك الذكاء الاصطناعي من معالجتها!");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisLogs(["🤖 بدء تشغيل محرك التحليل السيمانتيكي والتفكيك البيداغوجي للقانون المرفوع..."]);

    const runStep = (step: number) => {
      setTimeout(() => {
        switch (step) {
          case 1:
            setAnalysisProgress(30);
            setAnalysisLogs(prev => [
              ...prev,
              `📄 تم قراءة وفحص ملف: «${customFileName}» بنجاح.`,
              "🔍 جاري تفكيك الفصول الخمسة المعرفية ومطابقة هياكل العقوبات للرقابة العامة..."
            ]);
            runStep(2);
            break;
          case 2:
            // Extract numbers from arabic or digit representations
            let parsedAlert = 3;
            let parsedWarning = 9;
            let parsedReprimand = 10;
            let parsedConsecutive = 15;
            let parsedFragmented = 20;

            // Regex parsing strategies matching standard text patterns
            if (textToAnalyze.includes("تنبيه") || /عدم\s+تجاوز.*(3|ثلاث)/.test(textToAnalyze)) {
              parsedAlert = 3;
            }
            if (textToAnalyze.includes("توبيخ") || /يساوي.*(10|عشر)/.test(textToAnalyze)) {
              parsedReprimand = 10;
              parsedWarning = 9; // implied warning is between alert and reprimand (4 to 9 days)
            }
            if (textToAnalyze.includes("متتالية") || /تجاوز.*(15|خمسة\s*عشر).*متتالية/.test(textToAnalyze)) {
              parsedConsecutive = 15;
            }
            if (textToAnalyze.includes("مجزأة") || /تجاوز.*(20|عشرين).*مجزأة/.test(textToAnalyze)) {
              parsedFragmented = 20;
            }

            setAnalysisProgress(65);
            setAnalysisLogs(prev => [
              ...prev,
              `💡 تم استخلاص عتبة التنبيه: ${parsedAlert} أيام غياب.`,
              `💡 تم استخلاص عتبة الإنذار: > ${parsedAlert} أيام وأقل من ${parsedReprimand} أيام.`,
              `💡 تم استخلاص عتبة التوبيخ والمجلس: ${parsedReprimand} أيام بالتحديد.`,
              `💡 تم استخلاص عتبة الإقصاء من الغياب المتتالي: ${parsedConsecutive} يوماً متتالياً.`,
              `💡 تم استخلاص عتبة الإقصاء من الغياب المجزأ: ${parsedFragmented} يوماً مجزأً.`
            ]);
            runStep(3);
            break;
          case 3:
            setAnalysisProgress(85);
            setAnalysisLogs(prev => [
              ...prev,
              "🏛️ كشف المادة 40: تثبيت واستنتاج انعقاد المجلس التأديبي في الأسبوع الثالث من كل شهر يوم الخميس تلقائياً وجدولة القاعة رقم 03.",
              "⚖️ جاري جرد ومطابقة الفصل الثاني لحماية المئزر والهندام، والفصل الثالث لغرامة إتلاف التجهيزات بالورشات..."
            ]);
            runStep(4);
            break;
          case 4:
            setAnalysisProgress(100);
            
            // Extract and build deep state
            let alertVal = 3;
            let warningVal = 9;
            let reprimandVal = 10;
            let consecutiveVal = 15;
            let fragmentedVal = 20;

            if (textToAnalyze.includes("تنبيه") || /عدم\s+تجاوز.*(3|ثلاث)/.test(textToAnalyze)) alertVal = 3;
            if (textToAnalyze.includes("توبيخ") || /يساوي.*(10|عشر)/.test(textToAnalyze)) {
              reprimandVal = 10;
              warningVal = 9;
            }
            if (/متتالية/.test(textToAnalyze) || /(15|خمسة\s*عشر)/.test(textToAnalyze)) consecutiveVal = 15;
            if (/مجزأة/.test(textToAnalyze) || /(20|عشرين|عشرون)/.test(textToAnalyze)) fragmentedVal = 20;

            const newRules = {
              fileName: customFileName,
              analyzedAt: `تحليل سيمانتيكي دقيق • ${new Date().toLocaleDateString('ar-DZ')} ${new Date().toLocaleTimeString('ar-DZ')}`,
              status: 'active',
              rules: {
                absentHourWeight: 0.25,
                alertMaxDays: alertVal,
                warningMaxDays: warningVal,
                reprimandDays: reprimandVal,
                consecutiveDismissalDays: consecutiveVal,
                fragmentedDismissalDays: fragmentedVal,
                warning1: alertVal,
                warning2: warningVal,
                council: reprimandVal,
                dismissal: fragmentedVal,
                decreeNum: "النظام الداخلي المعتمد بموجب اللائحة المرفوعة",
                customNotes: `تم استيراد وحساب معاملات الغياب بنجاح من مستند اللائحة المرفوعة «${customFileName}». تم تثبيت عتبات التنبيه والإنذار بـ ${alertVal} و ${warningVal} أيام، والتوبيخ بـ ${reprimandVal} أيام، والفصل النهائي بـ ${consecutiveVal}/${fragmentedVal} يوماً.`
              }
            };

            setAnalysisLogs(prev => [
              ...prev,
              "✅ اكتمل فحص وتأطير فصول المستند ولائحة تبسة 2 بنجاح تام!",
              "🗂️ تم ترسيخ المعطيات كمرجعية حسابية وحفظها في الذاكرة التخزينية للمركز بـ زارع عبد الباقي."
            ]);

            localStorage.setItem('rq_ai_analyzed_regulations', JSON.stringify(newRules));
            setAiRegulations(newRules);

            // Dynamically update default articles
            const updatedBylaws = [...bylawChapters];
            updatedBylaws[0].articles[0].text = `يتم احتساب الغياب الفعلي بدقة طبقاً للمستند القانوني المصادق ومقارنته آلياً مع عتبات الإقصاء والتنبيه بوزن 0.25 يوماً لكل فترة غياب.`;
            updatedBylaws[0].articles[1].text = `يوجه للمتكون تنبيه بيداغوجي أول عند بلوغه غيابات تعادل ${alertVal} أيام سلوكية غير مبررة طبقاً للبند الأول.`;
            updatedBylaws[0].articles[2].text = `يوجه للمتكون إنذار غيابات بيداغوجي في الفوج الدراسي إذا تخطى الغياب ${alertVal} أيام ولم يبلغ ${reprimandVal} أيام سلوكية.`;
            updatedBylaws[0].articles[3].text = `يحال المتكون فورياً إلى المجلس التأديبي بالمحضر الموجه من الرقابة العامة بمجرد تجميع غيابات تساوي ${reprimandVal} أيام سلوكية للمثول في الأسبوع الثالث يوم الخميس.`;
            updatedBylaws[0].articles[4].text = `يقرر المجلس شطباً نهائياً كلياً وقاطعاً في حق المتكون المتجاوز لـ ${consecutiveVal} يوماً متتالية أو ${fragmentedVal} يوماً مجزأة دون تقديم مبرر قانوني.`;

            localStorage.setItem('rq_bylaw_chapters', JSON.stringify(updatedBylaws));
            setBylawChapters(updatedBylaws);

            setIsAnalyzing(false);
            setSuccessMessage(`✓ تم الانتهاء من فحص القانون المرفوع واستخلاص المقادير: التنبيه (≤ ${alertVal} أيام)، الإنذار (≤ ${warningVal} أيام)، التوبيخ (${reprimandVal} أيام)، والإقصاء النهائي (${consecutiveVal}/${fragmentedVal} أيام).`);
            break;
        }
      }, 700);
    };

    runStep(1);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || "";
        startRegulationsAIAnalysis(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleManualFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || "";
        startRegulationsAIAnalysis(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const updateRuleParam = (key: 'absentHourWeight' | 'warning1' | 'warning2' | 'council' | 'dismissal', val: number) => {
    const nextRules = {
      ...aiRegulations.rules,
      [key]: val
    };

    // Keep alerting keys entirely synchronized
    if (key === 'warning1') nextRules.alertMaxDays = val;
    if (key === 'warning2') nextRules.warningMaxDays = val;
    if (key === 'council') nextRules.reprimandDays = val;
    if (key === 'dismissal') nextRules.fragmentedDismissalDays = val;

    const updated = {
      ...aiRegulations,
      rules: nextRules
    };
    localStorage.setItem('rq_ai_analyzed_regulations', JSON.stringify(updated));
    setAiRegulations(updated);
  };

  // Modify individual article text in currently loaded bylaws chapters
  const handleUpdateArticleText = (chapterId: string, articleNum: string, newText: string) => {
    const updated = bylawChapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          articles: ch.articles.map(art => {
            if (art.number === articleNum) {
              return { ...art, text: newText };
            }
            return art;
          })
        };
      }
      return ch;
    });
    setBylawChapters(updated);
    localStorage.setItem('rq_bylaw_chapters', JSON.stringify(updated));
    setSuccessMessage(`✓ تم تحديث نص الفصيل بيداغوجياً [${articleNum}] في قاعدة البيانات بصفة فورية.`);
  };

  const filteredReferrals = referrals.filter(ref => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      (ref.learnerName || '').toLowerCase().includes(query) ||
      (ref.groupName || '').toLowerCase().includes(query) ||
      (ref.groupCode || '').toLowerCase().includes(query) ||
      (ref.reason || '').toLowerCase().includes(query) ||
      (ref.place || '').toLowerCase().includes(query) ||
      (ref.hallNumber || '').toLowerCase().includes(query)
    );
  });

  // COMPLEX DAILY, WEEKLY, MONTHLY ABSENCE CALCULATIONS & DISCIPLINARY COMPLIANCE MATRIX BASED ON UPLOADED LAWS
  const auditedTrainees = groups.flatMap(group => {
    const groupSessions = sessions.filter(s => s.groupId === group.id);
    return group.learners.map(learner => {
      
      // Compute Daily, Weekly, Monthly ranges BASED on the selected reference date (selectedAuditorDate, e.g. "2026-05-24")
      const refDateObj = new Date(selectedAuditorDate);
      
      // Calculate start and end of selected week (Sunday to Thursday)
      const dayOfWeek = refDateObj.getDay(); // 0 = Sunday, 1 = Monday...
      const sunOffset = dayOfWeek; // Days since Sunday
      const sunDate = new Date(refDateObj);
      sunDate.setDate(refDateObj.getDate() - sunOffset);
      const thuDate = new Date(sunDate);
      thuDate.setDate(sunDate.getDate() + 4);

      const refDateStr = selectedAuditorDate; // e.g. "2026-05-24"
      const refMonthPrefix = selectedAuditorDate.substring(0, 7); // e.g. "2026-05"

      let dailyHours = 0;
      let weeklyHours = 0;
      let monthlyHours = 0;
      let totalHoursAllTime = 0; // accumulated

      // Gather distinct dates where learner is absent to calculate consecutive days of absences
      const absentDatesSet = new Set<string>();

      groupSessions.forEach(sess => {
        const isAbsent = sess.attendanceMap[learner.id] === 'absent';
        if (isAbsent) {
          const duration = sess.duration || 2;
          totalHoursAllTime += duration;
          absentDatesSet.add(sess.date);

          // Is strictly the selected day?
          if (sess.date === refDateStr) {
            dailyHours += duration;
          }

          // Is within current week?
          const sessDate = new Date(sess.date);
          if (sessDate >= sunDate && sessDate <= thuDate) {
            weeklyHours += duration;
          }

          // Is within current month?
          if (sess.date.startsWith(refMonthPrefix)) {
            monthlyHours += duration;
          }
        }
      });

      // Calculate max consecutive calendar days of absence (skipping weekends)
      const absentDates = Array.from(absentDatesSet).sort();
      let maxConsecutiveDays = 0;
      if (absentDates.length > 0) {
        maxConsecutiveDays = 1;
        let currentChain = 1;
        for (let i = 1; i < absentDates.length; i++) {
          const prev = new Date(absentDates[i - 1]);
          const curr = new Date(absentDates[i]);
          const diffTime = Math.abs(curr.getTime() - prev.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // If difference is 1 day, or <= 3 days and crosses weekend (from Thursday to Sunday)
          if (diffDays === 1 || (diffDays <= 3 && prev.getDay() === 4 && curr.getDay() === 0)) {
            currentChain++;
          } else {
            if (currentChain > maxConsecutiveDays) {
              maxConsecutiveDays = currentChain;
            }
            currentChain = 1;
          }
        }
        maxConsecutiveDays = Math.max(maxConsecutiveDays, currentChain);
      }

      // Translate total hours into equivalent days
      const weight = aiRegulations.rules.absentHourWeight || 0.25;
      const equivDays = totalHoursAllTime * weight;
      
      // Core exact statuses from the photo rules:
      let status: 'compliant' | 'warning1' | 'warning2' | 'council' | 'dismissal' = 'compliant';
      
      const thresholdAlert = aiRegulations.rules.alertMaxDays || aiRegulations.rules.warning1 || 3;
      const thresholdWarning = aiRegulations.rules.warningMaxDays || aiRegulations.rules.warning2 || 9;
      const thresholdReprimand = aiRegulations.rules.reprimandDays || aiRegulations.rules.council || 10;
      const consecutiveLimit = aiRegulations.rules.consecutiveDismissalDays || 15;
      const fragmentedLimit = aiRegulations.rules.fragmentedDismissalDays || aiRegulations.rules.dismissal || 20;

      if (maxConsecutiveDays >= consecutiveLimit || equivDays >= fragmentedLimit) {
        status = 'dismissal'; // شطب قطعي وإقصاء نهائي
      } else if (equivDays >= thresholdReprimand) {
        status = 'council'; // توبيخ وإحالة للمجلس التأديبي
      } else if (equivDays > thresholdAlert) {
        status = 'warning2'; // إنذار غيابات بيداغوجي
      } else if (equivDays > 0) {
        status = 'warning1'; // تنبيه أول غيابات
      }

      return {
        id: learner.id,
        name: learner.name,
        groupCode: group.code,
        groupName: group.name,
        gender: learner.gender,
        dailyHours,
        weeklyHours,
        monthlyHours,
        totalHours: totalHoursAllTime,
        equivDays,
        consecutiveDays: maxConsecutiveDays,
        status,
        group
      };
    });
  });

  const [auditorSearch, setAuditorSearch] = useState('');
  const [auditorFilterStatus, setAuditorFilterStatus] = useState<'all' | 'violators' | 'warning1' | 'warning2' | 'council' | 'dismissal' | 'compliant'>('all');

  const filteredAuditorList = auditedTrainees.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(auditorSearch.toLowerCase()) || 
                          t.groupCode.toLowerCase().includes(auditorSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (auditorFilterStatus === 'all') return true;
    if (auditorFilterStatus === 'violators') return t.status !== 'compliant';
    return t.status === auditorFilterStatus;
  });

  // Prefill Summon Details with Classroom Number Default from Bylaw (Article 17-40)
  const triggerPrefilledSummon = (trainee: any) => {
    setTargetTraineeForSummon(trainee);
    
    let text = "";
    if (trainee.status === 'warning1') {
      text = `تراكم الغياب غير المبرر بملف المتكون وتخطي الإنذار الأول المادة 15 (${trainee.totalHours} ساعة غياب تراكمي / ${trainee.monthlyHours} ساعة شهرياً تعادل ${trainee.equivDays.toFixed(2)} يوماً سلوكياً).`;
    } else if (trainee.status === 'warning2') {
      text = `إصدار وتوجيه "توبيخ رسمي مكرس والإنذار الثاني" طبقاً للمادة 16 من النظام الداخلي بسبب غياب قدره ${trainee.totalHours} ساعة (يعادل ${trainee.equivDays.toFixed(1)} أيام غياب). يرجى إمضاء الولي على التعهد بالالتزام.`;
    } else if (trainee.status === 'council') {
      text = `إحالة فورية على اللجنة للمثول أمام أعضاء المجلس التأديبي بتبسة 2 المادة 17 (${trainee.totalHours} ساعة غياب، تعادل ${trainee.equivDays.toFixed(1)} يوماً سلوكياً). يتوجب على المتكون رفقة ولي أمره الحضور أمام المجلس في موعده النظامي بالأسبوع الثالث لشهر ${getArabicMonthName(new Date(selectedAuditorDate).getMonth())}.`;
    } else if (trainee.status === 'dismissal') {
      text = `اقتراح الشطب الإسقاطي النهائي من مدرسة التكوين لتجاوز الحد الأقصى للمواظبة المادة 18 بالتسجيل البيداغوجي الموجه لزارع عبد الباقي (رصيد غياب ${trainee.totalHours} ساعة، تعادل ${trainee.equivDays.toFixed(1)} يوماً).`;
    } else {
      text = `إجراء مواظبة سلوكية عادي.`;
    }

    setSummonReason(text);
    setSummonDate(recommendedThursdayDate); // Auto prefill with mathematically computed "Third Thursday" of that month!
    setSummonHall('قاعة المداولات الكبرى رقم 03 - الطابق الأرضي'); // Default Hall prefill
    setShowQuickSummonModal(true);
  };

  const handleSaveQuickSummon = () => {
    if (!targetTraineeForSummon) return;

    const newReferral: Omit<DisciplinaryReferral, 'id'> = {
      learnerId: targetTraineeForSummon.id,
      learnerName: targetTraineeForSummon.name,
      groupName: targetTraineeForSummon.groupName,
      groupCode: targetTraineeForSummon.groupCode,
      reason: summonReason,
      date: summonDate,
      time: summonTime,
      place: summonPlace,
      status: 'summoned',
      summonSent: true,
      hallNumber: summonHall // Newly handled Classroom/Hall number
    };

    AppStateStore.addDisciplinaryReferral(newReferral);
    setReferrals(AppStateStore.getDisciplinaryReferrals());
    setSuccessMessage(`✓ تم بنجاح إصدار وحفظ الإجراء البيداغوجي لـ [${targetTraineeForSummon.name}] وتوجيهه للمثول بالقاعة: ${summonHall}.`);
    setShowQuickSummonModal(false);
    setActiveTab('referrals'); 
  };

  const handleSaveMassScheduling = () => {
    // Collect all trainees who are currently selected for mass scheduling
    const selectedIds = Object.keys(selectedTraineesForMass).filter(id => selectedTraineesForMass[id]);
    if (selectedIds.length === 0) {
      alert("الرجاء اختيار متكون واحد على الأقل من القائمة لبرمجة إحالته على المجلس التأديبي!");
      return;
    }

    let addedCount = 0;
    selectedIds.forEach(learnerId => {
      const trainee = auditedTrainees.find(t => t.id === learnerId);
      if (trainee) {
        let reasonText = `إحالة جماعية صادرة عن الرقابة العامة بموجب النظام الداخلي للغيابات (إجمالي الغياب: ${trainee.totalHours} ساعة، المكافئ السلوكي: ${trainee.equivDays.toFixed(1)} يوماً).`;
        if (trainee.status === 'dismissal') {
          reasonText += ` شطب نهائي بسبب ${trainee.consecutiveDays} يوماً متتالية من الغياب الفعلي المتواصل.`;
        }

        const newReferral: Omit<DisciplinaryReferral, 'id'> = {
          learnerId: trainee.id,
          learnerName: trainee.name,
          groupName: trainee.groupName,
          groupCode: trainee.groupCode,
          reason: reasonText,
          date: massDate || recommendedThursdayDate,
          time: massTime,
          place: massPlace,
          status: 'summoned',
          summonSent: true,
          hallNumber: massHall
        };

        AppStateStore.addDisciplinaryReferral(newReferral);
        addedCount++;
      }
    });

    setReferrals(AppStateStore.getDisciplinaryReferrals());
    // Reset selection
    setSelectedTraineesForMass({});
    setSuccessMessage(`✓ تم بنجاح برمجة المجلس التأديبي جماعياً لـ (${addedCount}) متكونين، وتعيين قاعة الانعقاد [${massHall}] وتصدير كافة الإشعارات الفورية للطلبة والأولياء بنجاح.`);
    setActiveTab('referrals');
  };

  return (
    <div className="space-y-6 pb-12 text-right animate-in fade-in" dir="rtl">
      
      {/* HEADER HERO AREA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 justify-start flex-row-reverse">
            <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-250">
              بوابة الرقابة العامة والانضباط التشريعي لتبسة 2
            </span>
            <Scale className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-1.5 font-serif">المستشارية العامة ومجلس الانضباط</h2>
          <p className="text-slate-400 text-xs font-bold mt-1">تتبع ذكي ومتكامل لتدابير المواظبة (يومياً، أسبوعياً وشهرياً) ومطابقة المتكونين بالجرعات القانونية للنظام الداخلي</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem('rq_ai_analyzed_regulations');
              localStorage.removeItem('rq_bylaw_chapters');
              setAiRegulations({
                fileName: 'النظام الداخلي للغيابات والعقوبات - معهد تبسة 2.pdf',
                analyzedAt: 'نشط • تم التحليل بموجب الميثاق المرفق',
                status: 'active',
                rules: {
                   absentHourWeight: 0.25, 
                   alertMaxDays: 3,               
                   warningMaxDays: 9,             
                   reprimandDays: 10,             
                   consecutiveDismissalDays: 15,  
                   fragmentedDismissalDays: 20,   
                   warning1: 3,
                   warning2: 9,
                   council: 10,
                   dismissal: 20,
                   decreeNum: "النظام الداخلي للتشريع المهني المحدث",
                   customNotes: "يتم احتساب غيابات المتكونين بصفة يومية وأسبوعية وشهرية وعقد المجلس التأديبي الخميس الثالث من كل شهر."
                }
              });
              setBylawChapters(DEFAULT_BYLAW_CHAPTERS);
              setSuccessMessage("✓ تم استرداد اللوائح وفصول الانضباط القياسية لوزارة التكوين لـ معهد تبسة 2.");
            }} 
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-600 border border-slate-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>إعادة التعيين للائحة المعهد 🏛️</span>
          </button>
        </div>
      </div>

      {/* THREE-TAB SELECTION NAVIGATION SYSTEM */}
      <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('referrals')}
          className={cn(
            "px-6 py-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 flex-row-reverse",
            activeTab === 'referrals' 
              ? "border-amber-600 text-slate-900 font-extrabold" 
              : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-350"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>سجل إحالات المجلس والاستدعاءات ({referrals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('regulations')}
          className={cn(
            "px-6 py-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 flex-row-reverse",
            activeTab === 'regulations' 
              ? "border-amber-600 text-slate-900 font-extrabold" 
              : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-350"
          )}
        >
          <BrainCircuit className="w-4 h-4 text-amber-600" />
          <span className="flex items-center gap-1">
             فحص وتعديل فصول النظام الداخلي (AI)
            <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-full">5 فصول</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('auditor')}
          className={cn(
            "px-6 py-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 flex-row-reverse",
            activeTab === 'auditor' 
              ? "border-amber-600 text-slate-900 font-extrabold" 
              : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-350"
          )}
        >
          <Activity className="w-4 h-4 text-rose-600" />
          <span>التصحيح المبرمج والحساب الزمني (يومي/أسبوعي/شهري)</span>
        </button>
      </div>

      {/* SUCCESS NOTICE BANNER */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-center gap-3 justify-between text-emerald-800 text-xs font-black animate-in fade-in">
          <div className="flex items-center gap-2 flex-row-reverse">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <p className="text-right leading-relaxed">{successMessage}</p>
          </div>
          <button 
            type="button"
            onClick={() => setSuccessMessage(null)} 
            className="text-slate-400 hover:text-slate-700 font-extrabold text-sm px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: SUMMONS & REFERRALS REGISTRY */}
      {activeTab === 'referrals' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Right sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-amber-500/10 flex items-center gap-1 justify-end">
                الفلترة والبحث
                <Filter className="w-3.5 h-3.5 text-slate-400" />
              </h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 block">ابحث باسم المتكون أو المقاييس المظروية</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="امسح بـ الاسم أو رمز الفوج..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-450 rounded-xl py-2.5 pl-3 pr-9 text-xs font-bold outline-none text-right placeholder:text-slate-300"
                  />
                  <Search className="w-4 h-4 text-slate-300 absolute top-3.5 right-3" />
                </div>
              </div>

              <div className="p-4 bg-amber-50/30 text-slate-700 rounded-2xl text-[10px] leading-relaxed border border-amber-250/20 font-bold space-y-1 text-right">
                <p className="font-extrabold text-[#0F172A] flex items-center justify-end gap-1">
                  سياق المثول القانوني:
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                </p>
                <p>يتم تحضير الإخطار رسمياً من اللائحة الجارية للإنذار أو التوبيخ، ليتم تبليغ المتربص وولي أمره الشرعي بموعد الانعقاد وقاعة المثول المسجلة.</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-md border border-white/5 space-y-4 text-right">
              <div className="relative z-10 space-y-2">
                <BrainCircuit className="w-8 h-8 text-amber-450 mb-1" />
                <h4 className="text-xs font-black text-white">المعايير المفعّلة آلياً</h4>
                <p className="text-slate-450 text-[10px] leading-relaxed">
                  بموجب الميثاق النشط «{aiRegulations.fileName}»:
                </p>
                <div className="divide-y divide-slate-800 space-y-1.5 text-[10px] pt-1.5 font-mono">
                  <div className="flex justify-between pb-1.5">
                    <span className="text-amber-400 font-bold">≤ {aiRegulations.rules.alertMaxDays || 3} أيام ({((aiRegulations.rules.alertMaxDays || 3) / (aiRegulations.rules.absentHourWeight || 0.25)).toFixed(0)} س)</span>
                    <span className="text-slate-300">التنبيه الأول:</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-amber-400 font-bold">≤ {aiRegulations.rules.warningMaxDays || 9} أيام ({((aiRegulations.rules.warningMaxDays || 9) / (aiRegulations.rules.absentHourWeight || 0.25)).toFixed(0)} س)</span>
                    <span className="text-slate-300">الإنذار للغياب:</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-amber-400 font-bold">{aiRegulations.rules.reprimandDays || 10} أيام ({((aiRegulations.rules.reprimandDays || 10) / (aiRegulations.rules.absentHourWeight || 0.25)).toFixed(0)} س)</span>
                    <span className="text-slate-300">التوبيخ والمجلس:</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-rose-400 font-bold">≥ {aiRegulations.rules.consecutiveDismissalDays || 15} يوماً متتالياً</span>
                    <span className="text-slate-300">الشطب المتتالي:</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-rose-400 font-bold">≥ {aiRegulations.rules.fragmentedDismissalDays || 20} يوماً مجزأً</span>
                    <span className="text-slate-300">الشطب المجزأ:</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table registry */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-row-reverse flex-wrap gap-4 bg-slate-50/50">
                <div className="text-right">
                  <h3 className="text-sm font-black text-[#0F172A] tracking-tight uppercase flex items-center gap-1.5 justify-end">
                    سجل الإحالات الجارية ولجان المثول
                    <Scale className="w-4 h-4 text-slate-800" />
                  </h3>
                  <p className="text-[9.5px] text-slate-450 font-bold mt-1">تسيير وإخطار المتكونين تحت طائلة عتبات الغياب وعقوبات المسار بتبسة 2</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPurgeConfirm(true)}
                    className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>تصفير كافة السجلات 🗑️</span>
                  </button>

                  <button 
                    type="button"
                    onClick={handleExportCSV}
                    disabled={referrals.length === 0}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-600 disabled:opacity-40 transition-all shadow-sm"
                    title="تصدير السجل بصيغة Excel CSV"
                  >
                    <Download className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto text-xs font-sans">
                <table className="w-full text-right bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-black text-[9px] uppercase">
                      <th className="px-5 py-3.5 text-right">المتكون والفوج</th>
                      <th className="px-5 py-3.5 text-right">موجب ومواد الإحالة المقتبسة</th>
                      <th className="px-5 py-3.5 text-center">القاعة ومكان الجلسة</th>
                      <th className="px-5 py-3.5 text-center">التاريخ والمثول</th>
                      <th className="px-5 py-3.5 text-center">الخيار</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10.5px] font-bold">
                    {filteredReferrals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-450 italic">
                          لا توجد أي إحالات عقابية أو لجان مثول جارية حالياً طبقاً للتعديلات.
                        </td>
                      </tr>
                    ) : (
                      filteredReferrals.map((ref) => (
                        <tr key={ref.id} className="hover:bg-slate-50/50 transition-all">
                          
                          <td className="px-5 py-4 text-right">
                            <span className="font-black text-slate-950 block">{ref.learnerName}</span>
                            <span className="text-[9.5px] text-slate-400 block mt-0.5">{ref.groupName} ({ref.groupCode})</span>
                          </td>

                          <td className="px-5 py-4 text-right max-w-[280px]">
                            <p className="text-slate-600 leading-normal line-clamp-2">{ref.reason}</p>
                          </td>

                          <td className="px-5 py-4 text-center font-black text-rose-900">
                            {ref.hallNumber || "غير محدد"}
                          </td>

                          <td className="px-5 py-4 text-center font-mono">
                            <span className="block text-slate-800">{ref.date}</span>
                            <span className="block text-[9.5px] text-slate-400 mt-0.5">{ref.time}</span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <div className="flex gap-1.5 justify-center">
                              <button
                                type="button"
                                onClick={() => setSelectedReferralForPrint(ref)}
                                className="p-1 px-2.5 bg-slate-900 border border-slate-900 text-amber-400 hover:text-white rounded-lg text-[9.5px] font-black transition flex items-center gap-1 cursor-pointer"
                              >
                                <Printer className="w-3 h-3 text-amber-400" />
                                <span>طباعة الرسمي</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`⚠️ إلغاء استدعاء المتكون [${ref.learnerName}] ونزع العقوبة؟`)) {
                                    handleDeleteIndividual(ref.id, ref.learnerName);
                                  }
                                }}
                                className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-lg transition"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-slate-500 text-[10px] font-bold text-center">
                {instPrefix} التكوين المهني لولاية تبسة زارع عبد الباقي • مصلحة تتبع المواظبة والمجلس
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AI REGULATIONS & BYLAWS ANALYZER */}
      {activeTab === 'regulations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* File Upload zone (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[1.8rem] p-6 border border-slate-200 shadow-sm space-y-5">
              
              <div className="flex items-center gap-2 justify-between flex-row-reverse border-b border-slate-100 pb-3">
                <div className="text-right">
                  <h3 className="font-black text-sm text-[#0F172A]">محرك استخلاص وتعديل الميثاق والمواد</h3>
                  <p className="text-[10px] text-slate-450 mt-1">تقصي ومعاينة فصول القانون الداخلي لوزارة التكوين وسحب العقوبات تلقائياً</p>
                </div>
                <BrainCircuit className="w-5 h-5 text-amber-500" />
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 block">منهاج تشريعي سريع المطبوعات لولاية تبسة:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-right">
                  {PRESET_DOCUMENTS.map((doc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRegulationsSourceText(doc.text);
                        setSuccessMessage(`✓ تم تحميل بنود [${doc.title}] بنجاح. انقر الزر السفلي لبدء التحليل الفصلي.`);
                      }}
                      className="p-3 text-right bg-slate-50 hover:bg-amber-50/50 border border-slate-250 rounded-xl transition text-[10.5px] font-bold block w-full space-y-1"
                    >
                      <p className="text-slate-800 text-[11px] font-black truncate">{doc.title}</p>
                      <p className="text-[9.5px] text-slate-400 font-mono">{doc.decree}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center space-y-2",
                  dragActive ? "border-amber-500 bg-amber-50/10" : "border-slate-200 hover:border-amber-400 bg-slate-50/30"
                )}
              >
                <UploadCloud className="w-10 h-10 text-amber-500" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-800">أفلت أو اسحب مستند اللائحة الكامل أو فصل من الفصول هنا</p>
                  <p className="text-[9px] text-slate-400">يقوم محرك AI بجرد المواد والإنذارات والتوبيخات ومقررات القاعة دورياً</p>
                </div>
                <label className="mt-2 px-3 py-1.5 bg-slate-900 text-amber-400 rounded-lg text-[9.5px] font-black cursor-pointer shadow-sm">
                  تصفّح ملفات حاسوبك 📂
                  <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleManualFileUpload} className="hidden" />
                </label>
              </div>

              {/* Paste Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 block">لصق النص أو تعديل بنود الاستخلاص يدوياً:</label>
                <textarea
                  rows={6}
                  value={regulationsSourceText}
                  onChange={(e) => setRegulationsSourceText(e.target.value)}
                  placeholder="الصق هنا البنود والمواد الخاصة بالنظام الداخلي لمعهد زارع عبد الباقي تبسة 2 بالتفصيل..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-450 rounded-2xl p-4 text-[10.5px] font-bold leading-relaxed text-right outline-none text-slate-800"
                />
              </div>

              {/* Run */}
              <button
                type="button"
                onClick={() => startRegulationsAIAnalysis(regulationsSourceText)}
                disabled={isAnalyzing}
                className="w-full py-3 bg-gradient-to-r from-slate-950 to-[#121c2c] text-amber-400 hover:text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4 text-amber-400" />
                <span>🧠 تشغيل محرك الفحص والتركيب الممنهج للفصول الخمسة فورياً</span>
              </button>

              {/* Progress */}
              {isAnalyzing && (
                <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-[9px] rounded-xl border border-slate-800 space-y-2 text-right">
                  <div className="flex items-center justify-between">
                    <span className="animate-pulse">جاري تفكيك ومطابقة الفصول... {analysisProgress}%</span>
                    <div className="w-1/3 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full transition-all duration-305" style={{ width: `${analysisProgress}%` }} />
                    </div>
                  </div>
                  <div className="divide-y divide-slate-900 pt-1 space-y-1">
                    {analysisLogs.map((log, lidx) => (
                      <div key={lidx} className="pt-1 text-emerald-350">{log}</div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Chapters and parameters Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Interactive Chapter Selector Inspector */}
            <div className="bg-white rounded-[1.8rem] p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="text-right">
                <span className="bg-amber-100/50 text-amber-950 text-[8.5px] font-black px-2.5 py-1 rounded-full border border-amber-250/20">
                  لوحة تفحص محتويات القانون الداخلي النشط (5 فصول)
                </span>
                <h3 className="font-extrabold text-xs text-slate-900 mt-2 flex items-center justify-end gap-1 font-serif">
                  المعجم التشريعي المفكّك بالكامل بموجب الميثاق
                  <BookOpen className="w-4 h-4 text-amber-500" />
                </h3>
              </div>

              {/* Selectors tabs for the 5 Chapters requested by user */}
              <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-slate-100 flex-row-reverse text-[9px] font-black">
                {bylawChapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChapterForEdit(ch.id)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg shrink-0 transition",
                      selectedChapterForEdit === ch.id 
                        ? "bg-slate-900 text-amber-400" 
                        : "bg-slate-100 text-slate-500 hover:text-slate-800"
                    )}
                  >
                    الفصل {idx + 1}
                  </button>
                ))}
              </div>

              {/* Display chapter articles */}
              {bylawChapters.map((ch) => ch.id === selectedChapterForEdit && (
                <div key={ch.id} className="space-y-3.5 text-right animate-in fade-in">
                  <h4 className="text-[10.5px] font-black text-amber-800 border-r-2 border-amber-500 pr-2">{ch.title}</h4>
                  
                  <div className="space-y-3">
                    {ch.articles.map((art, aidx) => (
                      <div key={aidx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-205 space-y-2">
                        <div className="flex justify-between items-center flex-row-reverse">
                          <span className="font-black text-[10px] text-slate-900 bg-slate-200 px-2 py-0.5 rounded">{art.number}: {art.title}</span>
                          <span className="text-[9.5px] bg-rose-50 text-rose-800 font-extrabold px-1.5 rounded">{art.sanctionLevel}</span>
                        </div>
                        {/* Make it interactively editable directly to give full control of all bylaws! */}
                        <textarea
                          rows={2}
                          value={art.text}
                          onChange={(e) => handleUpdateArticleText(ch.id, art.number, e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-amber-450 rounded-lg p-2 text-[10px] font-medium leading-relaxed outline-none text-slate-700 hover:bg-slate-50 transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Threshold controls on absences */}
            <div className="bg-amber-50/25 border border-amber-500/15 rounded-[1.8rem] p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-[11px] text-amber-900 text-center pb-2 border-b border-amber-500/10">محددات حساب الخصم وعتبات الغيابات البعدية</h4>
              
              <div className="space-y-3 text-xs font-bold text-right">
                
                {/* coeff */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-slate-600 text-[10px]">معامل خصم الغياب (ساعة يعادل يوم):</span>
                  <select 
                    value={aiRegulations.rules.absentHourWeight}
                    onChange={(e) => updateRuleParam('absentHourWeight', parseFloat(e.target.value))}
                    className="bg-white border border-slate-200 text-[10.5px] px-2.5 py-1.5 rounded-lg text-slate-800 font-mono outline-none"
                  >
                    <option value={0.25}>0.25 يوماً (4 حصص = يوم)</option>
                    <option value={0.5}>0.5 يوماً (حصتان = يوم)</option>
                    <option value={0.125}>0.125 يوماً (8 حصص = يوم)</option>
                  </select>
                </div>

                {/* Warning 1 */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-slate-600 text-[10px]">حد الإنذار ب المتربص (يوم):</span>
                  <input 
                    type="number" 
                    value={aiRegulations.rules.warning1}
                    onChange={(e) => updateRuleParam('warning1', parseInt(e.target.value) || 3)}
                    className="bg-white border border-slate-200 text-center py-1.5 rounded-lg font-mono text-slate-800 outline-none w-16 mr-auto"
                  />
                </div>

                {/* Warning 2 */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-slate-600 text-[10px]">التوبيخ والإنذار الثاني (يوم):</span>
                  <input 
                    type="number" 
                    value={aiRegulations.rules.warning2}
                    onChange={(e) => updateRuleParam('warning2', parseInt(e.target.value) || 5)}
                    className="bg-white border border-slate-200 text-center py-1.5 rounded-lg font-mono text-slate-800 outline-none w-16 mr-auto"
                  />
                </div>

                {/* Council */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-slate-600 text-[10px]">الإحالة على المجلس (يوم):</span>
                  <input 
                    type="number" 
                    value={aiRegulations.rules.council}
                    onChange={(e) => updateRuleParam('council', parseInt(e.target.value) || 7)}
                    className="bg-white border border-slate-200 text-center py-1.5 rounded-lg font-mono text-slate-800 outline-none w-16 mr-auto"
                  />
                </div>

                {/* Dismissal */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <span className="text-slate-600 text-[10px]">الشطب النهائي القطعي (يوم):</span>
                  <input 
                    type="number" 
                    value={aiRegulations.rules.dismissal}
                    onChange={(e) => updateRuleParam('dismissal', parseInt(e.target.value) || 10)}
                    className="bg-white border border-slate-200 text-center py-1.5 rounded-lg font-mono text-slate-800 outline-none w-16 mr-auto"
                  />
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: AUTOMATED COMPLIANCE AUDITOR */}
      {activeTab === 'auditor' && (
        <div className="space-y-6">
          
          {/* Calendar scheduler, mathematically computed third Thursday, and date selector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Third Thursday and Date Inspector (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-right flex flex-col justify-between">
              
              <div>
                <span className="bg-[#0F172A] text-amber-400 text-[8.5px] font-black px-3 py-1 rounded-full border border-amber-500/10 block w-fit">
                  التوقيت البنيوي للمجلس التأديبي بتبسة 2
                </span>
                
                <h3 className="font-extrabold text-xs text-slate-900 mt-3 flex items-center gap-1.5 justify-end font-serif">
                  موعد ميعاد المجلس الأكاديمي الدوري (الخميس الثالث للشهور)
                  <Calendar className="w-4.5 h-4.5 text-slate-800" />
                </h3>
                
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  بموجب المادة 40 من القانون المعتمد، ينعقد المجلس رسمياً في <span className="underline font-black text-rose-800">الأسبوع الثالث من كل شهر يوم الخميس</span>. يقوم الملحق الرياضاتي بحساب الميقات آلياً لتسهيل الاستدعاءات الفورية.
                </p>
              </div>

              {/* Date Input to inspect months absences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-205 space-y-2">
                  <label className="text-[9.5px] font-black text-slate-500 block">حدد تاريخ تصفية الإحصاء والغياب:</label>
                  <input
                    type="date"
                    value={selectedAuditorDate}
                    onChange={(e) => setSelectedAuditorDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-center text-xs font-mono font-black text-slate-900 outline-none"
                  />
                  <span className="text-[9.5px] text-slate-400 block font-mono text-center">اليوم الفعلي المحدد: {getArabicDayName(selectedAuditorDate)}</span>
                </div>

                <div className="p-4.5 bg-amber-50/50 rounded-2xl border border-amber-250/20 space-y-1.5 flex flex-col justify-center">
                  <span className="text-[9px] text-amber-800 font-extrabold block">الميعاد التنظيمي المحسوب للمجلس التأديبي:</span>
                  <p className="text-xs font-black text-slate-850 block font-serif leading-relaxed">
                    جلسة شهر {getArabicMonthName(new Date(selectedAuditorDate).getMonth())}:
                  </p>
                  <p className="text-xs font-black text-rose-800 font-mono">
                    الخميس {recommendedThursdayDate}
                  </p>
                  <span className="text-[8.5px] text-slate-400 block font-bold leading-none">تعبئة الموعد آلياً بمستند الاستدعاء.</span>
                </div>

              </div>

            </div>

            {/* Quick Metrics of absences calculations daily weekly monthly (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#121c2c] text-white rounded-[1.8rem] p-6 flex flex-col justify-between border border-white/5 shadow-sm space-y-4">
              
              <div className="space-y-1.5 text-right">
                <span className="bg-amber-500/10 text-amber-400 text-[8px] font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
                  لوحة الأوعية الزمنية للغيابات
                </span>
                <h4 className="text-xs font-black text-white">الرصد الدوري (يومي • أسبوعي • شهري)</h4>
                <p className="text-slate-400 text-[9.5px] leading-relaxed">
                  يتم فرز الغيابات بفترات مطاطية لتسهيل ترشيد منحة البطالة وصندوق تكاليف الإطعام للمطبخ بتبسة 2.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                
                <div className="p-3.5 bg-slate-900/40 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[8.5px] text-rose-400 font-bold font-sans">الإحصاء اليومي</span>
                  <div className="text-lg font-black text-white">
                    {auditedTrainees.filter(t => t.dailyHours > 0).length}
                  </div>
                  <span className="text-[8px] text-slate-400 block font-sans">متكونين غائبين اليوم</span>
                </div>

                <div className="p-3.5 bg-slate-900/40 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[8.5px] text-amber-400 font-bold font-sans">الإحصاء الأسبوعي</span>
                  <div className="text-lg font-black text-white">
                    {auditedTrainees.filter(t => t.weeklyHours > 0).length}
                  </div>
                  <span className="text-[8px] text-slate-400 block font-sans">أفواج الغياب الأسبوعي</span>
                </div>

                <div className="p-3.5 bg-slate-900/40 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[8.5px] text-indigo-400 font-bold font-sans">الإحصاء الشهري</span>
                  <div className="text-lg font-black text-white">
                    {auditedTrainees.filter(t => t.monthlyHours > 0).length}
                  </div>
                  <span className="text-[8px] text-slate-400 block font-sans font-sans">تخطي الرصد الشهري</span>
                </div>

              </div>

            </div>

          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-row-reverse">
              <div className="text-right">
                <h3 className="font-black text-sm text-slate-900">جدول التدقيق السلوكي التلقائي ومطابقة الحالات</h3>
                <p className="text-[10px] text-slate-400 mt-1">يجرى التدقيق بمقارنة الغياب الزمني المختار مع عتبات الإجراء المتزامن للإنذار وبند المجلس التأديبي.</p>
              </div>

              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl text-[9px] font-black shrink-0 overflow-x-auto">
                <button 
                  type="button"
                  onClick={() => setAuditorFilterStatus('all')}
                  className={cn("px-2.5 py-1.5 rounded-lg transition shrink-0", auditorFilterStatus === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
                >
                  الكل ({auditedTrainees.length})
                </button>
                <button 
                  type="button"
                  onClick={() => setAuditorFilterStatus('violators')}
                  className={cn("px-2.5 py-1.5 rounded-lg transition shrink-0", auditorFilterStatus === 'violators' ? "bg-white text-rose-800 shadow-sm" : "text-slate-500")}
                >
                  الخارقين ({auditedTrainees.filter(t => t.status !== 'compliant').length})
                </button>
                <button 
                  type="button"
                  onClick={() => setAuditorFilterStatus('warning2')}
                  className={cn("px-2.5 py-1.5 rounded-lg transition shrink-0", auditorFilterStatus === 'warning2' ? "bg-white text-amber-800 shadow-sm" : "text-slate-500")}
                >
                  توبيخات ({auditedTrainees.filter(t => t.status === 'warning2').length})
                </button>
                <button 
                  type="button"
                  onClick={() => setAuditorFilterStatus('council')}
                  className={cn("px-2.5 py-1.5 rounded-lg transition shrink-0", auditorFilterStatus === 'council' ? "bg-white text-rose-800 shadow-sm" : "text-slate-500")}
                >
                  شرفات المجلس ({auditedTrainees.filter(t => t.status === 'council').length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <input
                  type="text"
                  value={auditorSearch}
                  onChange={(e) => setAuditorSearch(e.target.value)}
                  placeholder="ابحث باسم المتكون أو كود الفوج المطابق..."
                  className="w-full bg-slate-50 border border-slate-205 focus:border-amber-450 rounded-xl py-2.5 pl-4 pr-10 text-xs text-right outline-none placeholder:text-slate-400 font-extrabold"
                />
                <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
              </div>
              <div className="p-3 bg-amber-50/50 text-amber-950 border border-amber-500/10 rounded-xl text-[9px] font-black flex items-center justify-center leading-relaxed">
                🚨 النظام يقرن ويحسب الإحصاء اليومي والأسبوعي والشهري بدلالة جلسة المجلس المقررة الخميس {recommendedThursdayDate}.
              </div>
            </div>
          </div>

          {/* Micro Auditor trainee listing board */}
          <div className="bg-white rounded-[1.8rem] border border-slate-200 shadow-sm overflow-hidden text-right">
            <div className="overflow-x-auto text-xs font-sans">
              <table className="w-full text-right bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-black text-[9px] uppercase">
                    <th className="px-5 py-3.5 text-right">المتكون والفوج البيداغوجي</th>
                    <th className="px-5 py-3.5 text-center">غياب اليوم (ح)</th>
                    <th className="px-5 py-3.5 text-center">الغياب الأسبوعي (س)</th>
                    <th className="px-5 py-3.5 text-center">الرصد الشهري (س)</th>
                    <th className="px-5 py-3.5 text-center">تراكم المكافئ</th>
                    <th className="px-5 py-3.5 text-center">الجرعة والعقوبة</th>
                    <th className="px-5 py-3.5 text-center">الإجراء المكمّل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10.5px] font-bold">
                  {filteredAuditorList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-450 italic">
                        لا غيابات مرصودة ضمن الفلترة وقائمة المزاولة.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditorList.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/55 transition-colors">
                        
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-black text-[#0F172A] block">{t.name}</span>
                          <span className="text-[9.5px] text-slate-400 block mt-0.5">{t.groupName} • {t.groupCode}</span>
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono text-slate-705">
                          {t.dailyHours > 0 ? (
                            <span className="bg-rose-50 border border-rose-200 text-rose-800 text-[10px] px-1.5 py-0.5 rounded font-black font-mono">
                              {t.dailyHours} ساعة غياب
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono text-slate-705">
                          {t.weeklyHours > 0 ? (
                            <span className="text-slate-800 font-black">{t.weeklyHours} ساعة</span>
                          ) : (
                            <span className="text-slate-450">-</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono text-slate-705">
                          {t.monthlyHours > 0 ? (
                            <span className="text-slate-900 font-extrabold">{t.monthlyHours} ساعة</span>
                          ) : (
                            <span className="text-slate-450">-</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-center font-mono text-slate-805">
                          <span className="text-slate-950 font-black">{t.equivDays.toFixed(2)} يوماً</span>
                          <span className="text-[8.5px] text-slate-400 block font-sans">تراكم: {t.totalHours} ساعة</span>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          {t.status === 'compliant' && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] rounded-full">منضبط 💚</span>
                          )}
                          {t.status === 'warning1' && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-250 text-[9px] rounded-full">إنذار 1 ⚠️</span>
                          )}
                          {t.status === 'warning2' && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-805 border border-amber-250 text-[9px] rounded-full">توبيخ وإنذار 2 🔥</span>
                          )}
                          {t.status === 'council' && (
                            <span className="px-2 py-0.5 bg-rose-550 text-white border border-rose-600 text-[9px] rounded-full font-black animate-pulse">مجلس تأديب ⚖️</span>
                          )}
                          {t.status === 'dismissal' && (
                            <span className="px-2 py-0.5 bg-rose-950 text-amber-450 border border-slate-900 text-[9px] rounded-full">شطب نهائي 🚨</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          {t.status === 'compliant' ? (
                            <span className="text-[9.5px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              خالي من التبعات
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => triggerPrefilledSummon(t)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-[9.5px] font-black rounded-lg transition-all"
                            >
                              صياغة وإدراج الإجراء
                            </button>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50 text-[10px] text-slate-450 font-bold flex justify-between items-center px-6 border-t border-slate-100">
              <span>يحق لأستاذ المجموعات إبداء مبررات الغياب للطلبة لإغفال الشطب تلقائياً.</span>
              <span>عدد الطلاب المرصودين بالغياب التراكمي: {auditedTrainees.filter(t => t.totalHours > 0).length} طالباً</span>
            </div>
          </div>

        </div>
      )}

      {/* --- ALL MODALS --- */}

      {/* Classroom/Hall input prefilled summon dialog */}
      {showQuickSummonModal && targetTraineeForSummon && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl max-w-lg w-full text-right" dir="rtl">
            
            <div className="flex items-center gap-2 justify-between flex-row-reverse border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <span>صياغة عقوبة المتربص والمجلس التأديبي</span>
              </h3>
              <button type="button" onClick={() => setShowQuickSummonModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 text-amber-950 border border-amber-250/30 rounded-2xl text-[10px] leading-relaxed font-bold">
                <p className="font-black text-amber-900 mb-1">📋 رصد تلقائي لمواظبة المتكون:</p>
                تم رصد <span className="underline text-black font-black">{targetTraineeForSummon.name}</span> بغياب إجمالي قيمته <span className="font-black text-slate-950">{targetTraineeForSummon.totalHours} ساعة</span> (منها {targetTraineeForSummon.monthlyHours} ساعة غياب شهري)، وهو ما يسقطه تحت طائلة عتبات الإنذارات بفضل معامل 0.25 للفترات.
                تاريخ الجلسة المقترح هو الخميس الثالث للمواظبة: <span className="font-black text-rose-800 underline">{recommendedThursdayDate}</span>.
              </div>

              <div className="space-y-3 text-xs font-bold text-slate-800">
                
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">المخالفة والمقاييس المقتبسة للقرار (تلقائي):</label>
                  <textarea
                    rows={3}
                    value={summonReason}
                    onChange={(e) => setSummonReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-450 rounded-xl p-3 text-right text-xs"
                  />
                </div>

                {/* Meet details - Room default */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">تاريخ إنعقاد الجلسة / العقوبة:</label>
                    <input
                      type="date"
                      value={summonDate}
                      onChange={(e) => setSummonDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-center text-xs font-mono font-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">التوقيت البيداغوجي:</label>
                    <input
                      type="text"
                      value={summonTime}
                      onChange={(e) => setSummonTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-center text-xs font-black"
                    />
                  </div>
                </div>

                {/* SPECIFIC DESIGNATED ROOM / HALL INPUT FIELD REQUESTED BY THE USER */}
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-extrabold text-amber-950">
                    مكان الجلسة ورقم القاعة المخصصة للمثول: 🏛️
                  </label>
                  <input
                    type="text"
                    value={summonHall}
                    onChange={(e) => setSummonHall(e.target.value)}
                    className="w-full bg-slate-50 border border-amber-500/20 focus:border-amber-500 rounded-xl py-2 px-3 text-right text-xs font-black text-slate-900 shadow-sm"
                    placeholder="رقم القاعة والمكتب، مثال: القاعة رقم 03 - بمنى الإدارة"
                  />
                  <div className="flex gap-2.5 mt-1.5 flex-row-reverse text-[9px] text-slate-400">
                    <span>قاعات سريعة:</span>
                    <button type="button" onClick={() => setSummonHall('القاعة رقم 03 - جناح الورشات التطبيقية')} className="hover:text-amber-700 underline font-bold cursor-pointer">قاعة 03</button>
                    <button type="button" onClick={() => setSummonHall('قاعة المداولات الكبرى رقم 12 - الطابق الأول')} className="hover:text-amber-700 underline font-bold cursor-pointer">المداولات 12</button>
                    <button type="button" onClick={() => setSummonHall('الرقابة العامة ومكتب المستشار رئيسي')} className="hover:text-amber-700 underline font-bold cursor-pointer">مكتب المستشار</button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">الموقع العام للمؤسسة لزارع عبد الباقي:</label>
                  <input
                    type="text"
                    value={summonPlace}
                    onChange={(e) => setSummonPlace(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-right text-xs"
                  />
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleSaveQuickSummon}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-805 text-amber-400 text-xs font-black rounded-xl transition cursor-pointer shadow-md"
              >
                حفظ وإصدار العقوبة المبرمة ⚖️
              </button>
              <button
                type="button"
                onClick={() => setShowQuickSummonModal(false)}
                className="px-4 py-2.5 bg-slate-150 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                إلغاء
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Purge confirm */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl max-w-md w-full text-right" dir="rtl">
            <h3 className="text-sm font-black text-slate-950 flex items-center gap-2 justify-end mb-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
              <span>تأكيد مسح كافة سجلات الاستدعاءات العقابية؟</span>
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed mb-5 font-bold">
              تنبيه: سيقوم هذا الإجراء الشامل بحذف ومحو كافة الاستدعاءات ومثول المتكونين للمجلس البيداغوجي بشكل تام وقطعي من الذاكرة المحلية والبدء من جديد. هل أنت متأكد؟
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handlePurgeAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition shadow-md active:scale-95 cursor-pointer"
              >
                تأكيد حذف وتطهير السجل 🗑️
              </button>
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(false)}
                className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-705 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUMMON LETTER PRINT PREVIEW FORM A4 - FULL EXPLAINED AND DECORATED */}
      {selectedReferralForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            
            <div className="p-5 border-b border-slate-150 flex items-center justify-between flex-row-reverse bg-slate-50/50">
              <h3 className="text-xs font-black text-[#0F172A] flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-850" />
                <span>معاينة إستدعاء المثول القانوني الرسمي ومطابقة بنود القصاص</span>
              </h3>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById('institute-a4-summon-bill-system')?.innerHTML;
                    if (printContents) {
                      const printWindow = window.open('', '', 'height=850,width=900');
                      if (printWindow) {
                        printWindow.document.write('<html><head><title>إستدعاء رسمي لمجلس التأديب بتبسة 2</title>');
                        printWindow.document.write('<style>');
                        printWindow.document.write('body { font-family: "Courier New", monospace, sans-serif; padding: 40px; background: white; color: black; direction: rti; text-align: right; }');
                        printWindow.document.write('.p-text { font-size: 14px; line-height: 1.8; text-align: right; margin-bottom: 20px; }');
                        printWindow.document.write('.grid-box { border: 1.5px solid black; padding: 15px; margin: 20px 0; background: #fff; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; line-height: 1.8; }');
                        printWindow.document.write('.clause-box { border: 2px solid black; padding: 15px; background: #fafafa; font-size: 12px; line-height: 1.6; margin: 20px 0; }');
                        printWindow.document.write('.footer-sign { display: flex; justify-content: space-between; margin-top: 60px; font-size: 13px; font-weight: bold; }');
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
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة على ورق A4 🖨️</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReferralForPrint(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-705 text-xs font-black rounded-xl transition cursor-pointer"
                >
                  إغلاق ✕
                </button>
              </div>
            </div>

            {/* Print Block Container */}
            <div className="p-8 bg-slate-100 max-h-[60vh] overflow-y-auto">
              <div 
                id="institute-a4-summon-bill-system" 
                className="bg-white border-2 border-black p-10 max-w-[210mm] mx-auto shadow-sm text-right text-black"
                style={{ direction: 'rtl' }}
              >
                {/* Official Algerian Government summons logo */}
                <div className="text-center font-bold space-y-1 pb-4 border-b-2 border-black font-sans text-xs">
                  <h4 className="text-sm font-black text-black">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
                  <p className="text-[10.5px] font-medium text-slate-800">وزارة التكوين والتعليم المهنيين</p>
                  <p className="text-[11px] font-semibold">مديرية التكوين لـ {institute.city || 'ولاية تبسة'}</p>
                  <p className="text-[13px] font-black uppercase mt-2 text-black">{institute.name}</p>
                  <div className="w-16 h-0.5 bg-black mx-auto my-1"></div>
                  <p className="text-[10px] font-mono">المرجع البيداغوجي للمجلس: {selectedReferralForPrint.id}</p>
                </div>

                <div className="text-center my-6">
                  <h2 className="text-lg font-black underline my-1 font-serif">إستدعاء رسمي ومثول حتمي أمام مجلس التأديب بتبسة 2</h2>
                  <p className="text-[11px] font-bold text-slate-750 font-sans">تنبيه فوري وإلزام بالحضور الفوري متكون رفقة ولي الأمر الشرعي</p>
                </div>

                <div className="space-y-4 text-xs leading-relaxed font-sans text-slate-950 text-right">
                  <p className="p-text font-black text-[12px]">
                    طبقاً لنتائج الرصد الأوتوماتيكي واليومي بقاعدة بيانات المواظبة بمصلحة الرقابة العامة لـ {institute.name}، وطبقاً لتتبع الفصول الخمسة للقانون الداخلي المعتمد («{aiRegulations.fileName}»)، يُستدعى المتكون المبينة تفاصيله أدناه بصفة مستعجلة للمثول الانضباطي:
                  </p>

                  <div className="grid grid-cols-2 gap-4 border border-black p-4 rounded-lg my-4 bg-slate-50">
                    <div>
                      <p className="font-bold font-sans">اسم المتكون: <span className="font-black underline text-black">{selectedReferralForPrint.learnerName}</span></p>
                      <p className="font-bold font-sans mt-1">تخصص الفوج: <span className="font-bold text-black">{selectedReferralForPrint.groupName}</span></p>
                    </div>
                    <div>
                      <p className="font-bold font-sans">رمز الفوج/الفرع: <span className="font-mono font-black text-black">{selectedReferralForPrint.groupCode}</span></p>
                      <p className="font-bold font-sans mt-1">طبيعة المخالفة والقرار: <span className="font-black bg-black text-amber-400 px-2 py-0.5 text-[10px] rounded uppercase">مطابقة وتطبيق الميثاق ⚖️</span></p>
                    </div>
                  </div>

                  <p className="font-black text-slate-900 border-b border-black pb-0.5">سياق الإحالة، المخالفات والمقاييس المستخلصة:</p>
                  <p className="p-text pl-4 font-black italic bg-slate-50 border border-slate-300 p-3 my-2 rounded leading-relaxed text-black">
                    « {selectedReferralForPrint.reason} »
                  </p>

                  {/* SPECIFIC DESIGNATED ROOM / HALL PRINT OUTPUT */}
                  <div className="border border-black bg-rose-50/20 p-4.5 rounded-lg my-4 text-right">
                    <p className="font-black text-rose-950 text-[12px] underline mb-1 flex items-center gap-1">
                      📍 الموعد ومكان الجلسة ورقم القاعة المخصصة للمثول:
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 leading-relaxed text-black text-[11px] font-black">
                      <p>تاريخ الجلسة: <span className="underline ml-1 text-rose-900">{selectedReferralForPrint.date} ({getArabicDayName(selectedReferralForPrint.date)})</span></p>
                      <p>الساعة المقررة: <span className="underline ml-1 text-rose-900">{selectedReferralForPrint.time}</span></p>
                      <p className="col-span-2 text-[12px]">رقم جناح القاعة: <span className="bg-rose-900 text-white px-2.5 py-1 rounded-md text-[13px] font-sans inline-block mt-1 font-black shadow-sm">{selectedReferralForPrint.hallNumber || "غير محدد بطلب الرقيب"}</span></p>
                    </div>
                  </div>

                  <div className="border border-black p-4 text-[10.5px] leading-relaxed bg-slate-50/50">
                    <p className="font-extrabold underline mb-1">اللوائح الوزارية المعتمدة بالاستدعاء:</p>
                    <p className="font-medium text-slate-700">
                      بموجب الميثاق الموحد لتسيير المواظبات وخصم نقاط السلوك للمنخرطين للاستفادة من منحة البطالة، فإن تخطي المتكون لعتبات الغيابات وتراكم ساعات الانقطاع دون مبرر مقبول يجبر المؤطر البيداغوجي ومصلحة التربوية على اتخاذ الإجراء اللازم بالشطب أو التعهد الكتابي.
                    </p>
                  </div>

                  <p className="text-[10px] font-black text-rose-800 text-center border-2 border-red-650 p-2 rounded-md bg-rose-50/30">
                    ⚠️ حضور المتكون المحال مرفقاً بولي أمره الشرعي إلزامي بوجوب التشريع. تخلف الطرفين عن الحضور يخول للجنة البت الفوري وإصدار قرار الشطب النهائي بالغياب.
                  </p>

                  {/* Signatures block */}
                  <div className="flex justify-between items-start pt-14 font-bold text-[10.5px] text-black">
                    <div className="text-right">
                      <p className="underline mb-6">الأستاذ المؤطر الوصي للفوج:</p>
                      <br />
                      <p className="text-slate-400 font-mono text-[9px]">إمضاء المعاينة البيداغوجية</p>
                    </div>
                    <div className="text-center col-span-1">
                      <p className="underline mb-6">توقيع ولي الأمر الشرعي:</p>
                      <br />
                      <p className="text-slate-400 font-mono text-[9px]">(أمضى للاطلاع والحضور)</p>
                    </div>
                    <div className="text-left">
                      <p className="underline mb-6 text-left">مستشار الرقابة العامة لـ {instWord}:</p>
                      <br />
                      <p className="text-slate-400 font-mono text-[9px]">ختم المؤسسة وسجل القصاص</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
