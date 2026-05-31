import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  UserCheck, 
  GraduationCap, 
  ShieldAlert, 
  Users, 
  Building2,
  Lock,
  ChevronRight,
  Sparkles,
  Info,
  User,
  Layers
} from 'lucide-react';
import { AppStateStore } from '../../services/store';
import { cn } from '../../lib/utils';

interface RoleOption {
  role: 'admin' | 'supervisor' | 'teacher' | 'trainee' | 'parent';
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function PortalLogin() {
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [password, setPassword] = useState('');
  const [errorMess, setErrorMess] = useState('');
  
  // Custom trainee profile registration variables
  const [traineePhone, setTraineePhone] = useState(() => localStorage.getItem('rq_trainee_logged_phone') || '');
  const [traineeEmail, setTraineeEmail] = useState(() => localStorage.getItem('rq_trainee_logged_email') || '');
  const [traineeMode, setTraineeMode] = useState(() => localStorage.getItem('rq_trainee_logged_mode') || '2');

  // Dropdown states for student / parent verification
  const groups = AppStateStore.getGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>('');

  // Auto-fill defaults on role changes
  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroupId(groups[0].id);
      if (groups[0].learners && groups[0].learners.length > 0) {
        setSelectedLearnerId(groups[0].learners[0].id);
      }
    }
    setPassword('');
    setErrorMess('');
  }, [selectedRole]);

  // Update learner dropdown on group changes
  useEffect(() => {
    const activeGroup = groups.find(g => g.id === selectedGroupId);
    if (activeGroup && activeGroup.learners && activeGroup.learners.length > 0) {
      setSelectedLearnerId(activeGroup.learners[0].id);
    } else {
      setSelectedLearnerId('');
    }
  }, [selectedGroupId]);

  const rolesList: RoleOption[] = [
    {
      role: 'admin',
      title: 'الإدارة المركزية',
      desc: 'إدارة هيكل المؤسسة، الأكواد، الصلاحيات والأجهزة الفنية',
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      role: 'supervisor',
      title: 'الرقابة العامة',
      desc: 'فضاء مستشار الرقابة: أرشفة، ترحيل، استيراد القوائم ومعالجة الأعذار',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200'
    },
    {
      role: 'teacher',
      title: 'الأستاذ(ة) / المؤطر',
      desc: 'دفتر الغيابات الرقمي، تسجيل الحضور حسب الحصص والتواقيع الرقمية',
      icon: UserCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      role: 'parent',
      title: 'الولي الشرعي',
      desc: 'فضاء الأولياء الرقمي لمتابعة مواظبة وسلوك ومعاقبات المتكونين والمنشورات',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      role: 'trainee',
      title: 'المتكون(ة) / المتربص',
      desc: 'فحص الحضور الذاتي وكشوف النقاط السداسية ومراسيم الغيابات النشطة',
      icon: GraduationCap,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200'
    },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    const roleKey = selectedRole.role;

    // Secure authentication codes for all portals
    if (roleKey === 'admin') {
      if (password !== 'admin' && password !== '123') {
        setErrorMess('رمز المرور غير صحيح للإدارة المركزية (المثال: admin)');
        return;
      }
    } else if (roleKey === 'supervisor') {
      if (password !== 'super' && password !== '123') {
        setErrorMess('رمز المرور غير صحيح للرقابة العامة (المثال: super)');
        return;
      }
    } else if (roleKey === 'teacher') {
      if (password !== 'teacher' && password !== '123') {
        setErrorMess('كلمة المرور للأستاذ غير صحيحة (ملاحظة: جرب teacher)');
        return;
      }
    } else if (roleKey === 'parent') {
      if (password !== 'parent' && password !== '123') {
        setErrorMess('كلمة المرور لولي المتكون غير صحيحة (ملاحظة: جرب parent)');
        return;
      }
      
      // Save targeted learner details for parent tracking
      if (selectedGroupId && selectedLearnerId) {
        const matchingGroup = groups.find(g => g.id === selectedGroupId);
        const matchingLearner = matchingGroup?.learners?.find(l => l.id === selectedLearnerId);
        if (matchingLearner) {
          localStorage.setItem('rq_parent_logged_student_name', matchingLearner.name);
          localStorage.setItem('rq_parent_logged_student_id', matchingLearner.id);
          localStorage.setItem('rq_parent_logged_group_id', selectedGroupId);
        }
      }
    } else if (roleKey === 'trainee') {
      if (password !== 'student' && password !== '123') {
        setErrorMess('الرقم السري للمتكون غير صحيح بالأنظمة الرقمية (ملاحظة: جرب student)');
        return;
      }

      if (!selectedGroupId || !selectedLearnerId) {
        setErrorMess('الرجاء اختيار التخصص والاسم واللقب لتثبيط الحساب.');
        return;
      }

      // Find actual details to send results accurately
      const targetGroup = groups.find(g => g.id === selectedGroupId);
      const targetLearner = targetGroup?.learners?.find(l => l.id === selectedLearnerId);
      
      if (targetLearner) {
        localStorage.setItem('rq_trainee_logged_name', targetLearner.name);
        localStorage.setItem('rq_trainee_logged_id', selectedGroupId);
        localStorage.setItem('rq_trainee_logged_learner_pk', targetLearner.id);
        localStorage.setItem('rq_trainee_logged_phone', traineePhone || '');
        localStorage.setItem('rq_trainee_logged_email', traineeEmail || '');
        localStorage.setItem('rq_trainee_logged_mode', traineeMode || '2');
      } else {
        setErrorMess('تعذر التعرف الرقمي على المتكون المحدد.');
        return;
      }
    }

    // Success Authentication
    AppStateStore.setActiveRole(roleKey);
    
    // Redirect depend on context
    if (roleKey === 'admin') window.location.href = '/admin';
    else if (roleKey === 'supervisor') window.location.href = '/supervision';
    else if (roleKey === 'teacher') window.location.href = '/teacher';
    else if (roleKey === 'parent') window.location.href = '/parent';
    else if (roleKey === 'trainee') window.location.href = '/trainee';
  };

  const activeGroupForLearners = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6 relative overflow-hidden" dir="rtl">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-3xl rounded-full -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/5 blur-3xl rounded-full -ml-48 -mb-48 pointer-events-none" />

      {/* Top logo & Header */}
      <div className="text-center mt-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-amber-500/15"
        >
          <Sparkles className="w-4 h-4" />
          مؤسسة التكوين المهني والتمهين
        </motion.div>
        
        <h1 className="text-4xl font-black text-white tracking-tight font-sans">نظام إدارة الغيابات الذكي «رقابة»</h1>
        <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-wide">
          الربط الرقمي المتكامل بين الإدارة، الرقابة العامة، الأساتذة، المتكونين والأولياء
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {!selectedRole ? (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-1">اختر فضاء الولوج الخاص بك</h2>
              <p className="text-slate-500 text-xs font-semibold">كل فضاء محمي تماماً ولا يمكن تجاوزه إلا بوضع الرقم السري المعتمد</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {rolesList.map((item) => (
                <div 
                  key={item.role}
                  onClick={() => setSelectedRole(item)}
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/50 hover:bg-slate-950/90 hover:scale-[1.02] transition-all duration-300 text-right cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className="flex items-center gap-3 flex-row-reverse mb-3 justify-between">
                      <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.borderColor} border`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 rotate-180" />
                    </div>
                    <h3 className="font-bold text-white mb-1 text-sm">{item.title}</h3>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">{item.desc}</p>

                    {/* Highly polished role-based permission scope note */}
                    <div className="mt-3.5 pt-2 border-t border-slate-900/60 text-right">
                      <span className={cn(
                        "text-[8.5px] font-black px-2 py-1 rounded-md border inline-block leading-tight",
                        item.role === 'admin'
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : item.role === 'teacher'
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-900/80 text-slate-400 border-slate-800"
                      )}>
                        {item.role === 'admin' 
                          ? "👑 ولاية إدارية شاملة: ولوج غير مقيد لكافة الأيقونات دون أي شروط"
                          : item.role === 'supervisor'
                          ? "🔒 رقابة بيداغوجية: ولوج حصري لفضاء الرقابة والمجالس التأديبية"
                          : item.role === 'teacher'
                          ? "📝 تسجيل حصري: ولوج حصري لدفاتر تسجيل الغياب والتوقيع الرقمي"
                          : item.role === 'parent'
                          ? "👨‍👦 متابعة سلوكية: تصفح سجلات انضباط ومعدلات ابنكم فقط"
                          : "🎓 تصفح سداسي: الاطلاع على تخصصكم ونقاط السداسي المرصودة لكم"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-right space-y-6"
          >
            <div className="flex items-center gap-4 flex-row-reverse border-b border-slate-800 pb-4">
              <div className={`p-3 rounded-2xl ${selectedRole.bgColor} border ${selectedRole.borderColor}`}>
                <selectedRole.icon className={`w-6 h-6 ${selectedRole.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-white text-lg">{selectedRole.title}</h3>
                <p className="text-slate-400 text-xs font-semibold">{selectedRole.desc}</p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Questionnaire for student / parent identifying themselves */}
              {['trainee', 'parent'].includes(selectedRole.role) && (
                <div className="space-y-4 bg-slate-950 p-4 border border-slate-800 rounded-2xl">
                  <div className="text-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] text-amber-400 font-black block">إجراء التعرف الرقمي الإلزامي لأهداف الإعلانات والتقارير الفورية</span>
                  </div>
                  
                  {/* Select specialty */}
                  <div className="space-y-1">
                    <label className="text-right text-[11px] font-bold text-slate-400 block">1. اختر الفوج أو التخصص البيداغوجي للدراسة:</label>
                    <div className="relative">
                      <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl py-3 pr-10 pl-4 text-xs text-white outline-none text-right font-sans"
                        required
                      >
                        {groups.map(g => (
                          <option key={g.id} value={g.id} className="text-slate-900 font-sans">
                            {g.name} ({g.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Select student name */}
                  <div className="space-y-1">
                    <label className="text-right text-[11px] font-bold text-slate-400 block">
                      {selectedRole.role === 'trainee' 
                        ? '2. اختر اسمك ولقبك الشخصي بالكامل:' 
                        : '2. اختر اسم ولقب ابنكم المتكون:'}
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        value={selectedLearnerId}
                        onChange={(e) => setSelectedLearnerId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl py-3 pr-10 pl-4 text-xs text-white outline-none text-right font-sans"
                        required
                      >
                        {activeGroupForLearners?.learners?.map(l => (
                          <option key={l.id} value={l.id} className="text-slate-900 font-sans">
                            {l.name}
                          </option>
                        ))}
                        {(!activeGroupForLearners?.learners || activeGroupForLearners.learners.length === 0) && (
                          <option value="">لا يوجد متكونين متاحين</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Add basic information inputs for trainee so the app registers their contact info */}
                  {selectedRole.role === 'trainee' && (
                    <div className="space-y-3 pt-3 border-t border-slate-900 mt-3">
                      <div className="text-right text-[9px] text-amber-500 font-extrabold pb-0.5 uppercase tracking-wider">
                        ✍️ يرجى تسجيل البيانات الأساسية بدقة (مطلوبة للتعريف وتوصيل الإشعارات الفورية)
                      </div>
                      
                      {/* Phone Input */}
                      <div className="space-y-1">
                        <label className="text-right text-[11px] font-bold text-slate-400 block">3. رقم الهاتف المحمول النشط:</label>
                        <input
                          type="tel"
                          placeholder="مثال: 06XXXXXXXX"
                          value={traineePhone || ''}
                          onChange={(e) => setTraineePhone(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 px-4 text-xs text-white outline-none text-right font-sans font-medium"
                          required
                        />
                      </div>

                      {/* Email Input */}
                      <div className="space-y-1">
                        <label className="text-right text-[11px] font-bold text-slate-400 block">4. عنوان بريدك الإلكتروني الشخصي:</label>
                        <input
                          type="email"
                          placeholder="مثال: student@insfp.dz"
                          value={traineeEmail || ''}
                          onChange={(e) => setTraineeEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 px-4 text-xs text-white outline-none text-right font-sans font-medium"
                          required
                        />
                      </div>

                      {/* Training Mode Dropdown */}
                      <div className="space-y-1">
                        <label className="text-right text-[11px] font-bold text-slate-400 block">5. نمط التكوين المهني المتكامل:</label>
                        <select
                          value={traineeMode}
                          onChange={(e) => setTraineeMode(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl py-2.5 px-4 text-xs text-white outline-none text-right font-sans"
                          required
                        >
                          <option value="2" className="text-slate-900">التكوين عن طريق التمهين (Formation par Apprentissage) 💼</option>
                          <option value="1" className="text-slate-900">التكوين الحضوري (Formation Residentielle)</option>
                          <option value="3" className="text-slate-900">التكوين التأهيلي (Formation Qualifiante)</option>
                          <option value="4" className="text-slate-900">التكوين عن بعد (A Distance)</option>
                          <option value="5" className="text-slate-900">التكوين عن طريق الدروس المسائية</option>
                        </select>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Secure Password Access input for all roles */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">
                  كلمة المرور / الرقم السري الخاص بفضاء {selectedRole.title}
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password"
                    placeholder="أدخل برائتكم السرية للولوج"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMess('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-3 pr-10 pl-4 text-xs text-white outline-none font-sans text-right"
                    required
                  />
                </div>
                
                {/* Visual helper pins for evaluating */}
                <p className="text-[10px] text-slate-500 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 mt-2 leading-relaxed text-right">
                  🔐 <b>أكواد المرور والولوج المبرمجة بالنسخة التدريبية:</b><br/>
                  - فضاء الإدارة المركزية: <span className="font-mono text-amber-500 font-bold">admin</span> أو <span className="font-mono text-amber-500 font-bold">123</span><br/>
                  - فضاء الرقابة العامة: <span className="font-mono text-amber-500 font-bold">super</span> أو <span className="font-mono text-amber-500 font-bold">123</span><br/>
                  - الأستاذ المؤطر: <span className="font-mono text-amber-500 font-bold">teacher</span> أو <span className="font-mono text-amber-500 font-bold">123</span><br/>
                  - الولي الشرعي: <span className="font-mono text-amber-500 font-bold">parent</span> أو <span className="font-mono text-amber-500 font-bold">123</span><br/>
                  - المتكون المتربص: <span className="font-mono text-amber-500 font-bold">student</span> أو <span className="font-mono text-amber-500 font-bold">123</span>
                </p>
              </div>

              {errorMess && (
                <p className="text-[10px] text-rose-500 font-bold bg-rose-500/10 p-2 rounded-lg text-center">
                  ⚠️ {errorMess}
                </p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 py-3 rounded-xl text-xs font-bold hover:text-white transition-all text-center"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-center shadow-lg shadow-amber-400/10"
                >
                  تحقق ودخول
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>

      {/* Footer Credentials as requested by the user */}
      <div className="text-center mt-6 z-10 border-t border-slate-900 pt-6">
        <p className="text-[11px] text-slate-500 font-black leading-relaxed">
          البرنامج من تصميم وإعداد الأستاذ: <span className="text-amber-400">عادل موايعية</span>
        </p>
        <p className="text-[10px] text-slate-600 font-bold mt-1">
          مركز التكوين المهني والتمهين زارع عبد الباقي تبسة 2
        </p>
      </div>
    </div>
  );
}
