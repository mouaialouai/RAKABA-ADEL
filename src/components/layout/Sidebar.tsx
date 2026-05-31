import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Settings, 
  Calendar, 
  Bell, 
  Scale,
  BrainCircuit,
  GraduationCap,
  UserCircle,
  LogOut,
  Briefcase
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppStateStore } from '../../services/store';

const navItems = [
  { path: '/', label: 'لوحة القيادة', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'teacher'] },
  { path: '/teacher', label: 'تسجيل الحضور', icon: UserCheck, roles: ['admin', 'teacher'] },
  { path: '/supervision', label: 'فضاء الرقابة العامة', icon: Users, roles: ['admin', 'supervisor'] },
  { path: '/disciplinary', label: 'المجلس التأديبي', icon: Scale, roles: ['admin', 'supervisor'] },
  { path: '/trainee', label: 'بوابة المتكون', icon: GraduationCap, roles: ['admin', 'trainee'] },
  { path: '/parent', label: 'بوابة الولي', icon: UserCircle, roles: ['admin', 'parent'] },
  { path: '/parent/professional', label: 'حضور الوسط المهني', icon: Briefcase, roles: ['admin', 'parent', 'supervisor'] },
  { path: '/admin', label: 'فضاء الإدارة والتهيئة', icon: ShieldCheck, roles: ['admin'] },
];

const roleNames = {
  admin: 'الإدارة المركزية',
  supervisor: 'الرقابة العامة',
  teacher: 'الأستاذ(ة)',
  parent: 'الولي الشرعي',
  trainee: 'المتكون'
};

export default function Sidebar() {
  const [activeRole, setActiveRole] = useState<'admin' | 'supervisor' | 'teacher' | 'trainee' | 'parent' | 'none'>(AppStateStore.getActiveRole());
  const [institute, setInstitute] = useState(() => AppStateStore.getInstitutionInfo());

  useEffect(() => {
    const unsub = AppStateStore.subscribe(() => {
      setActiveRole(AppStateStore.getActiveRole());
      setInstitute(AppStateStore.getInstitutionInfo());
    });
    return unsub;
  }, []);

  const formatName = (name: string) => {
    if (!name) return '';
    return name.replace(/^معهد/g, institute.type === 'center' ? 'مركز' : 'معهد');
  };

  const visibleNavs = navItems.filter(item => item.roles.includes(activeRole));

  const handleLogout = () => {
    AppStateStore.setActiveRole('none');
    window.location.href = '/';
  };

  return (
    <aside className="w-64 h-full bg-[#0F172A] text-white flex flex-col border-l border-slate-800 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
          <BrainCircuit className="text-slate-900 w-6 h-6" />
        </div>
        <div className="text-right flex-1 min-w-0">
          <h1 className="text-xs font-black tracking-tight text-amber-400 leading-none truncate" title={formatName(institute.name)}>
            {formatName(institute.name).split(' - ')[0]}
          </h1>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 truncate" title={formatName(institute.name)}>
            {formatName(institute.name).split(' - ')[1] || 'منصة الرقابة الرقمية'}
          </p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 mb-2 text-right">الفضاء الرقمي</div>
        {visibleNavs.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group flex-row-reverse",
              isActive 
                ? "bg-slate-800/50 text-amber-400 border-r-4 border-amber-400 shadow-sm" 
                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0 transition-colors" />
            <span className="text-xs font-bold">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800 space-y-3">
        {/* Active account profile card and Logout button */}
        {activeRole !== 'none' && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between flex-row-reverse">
            <div className="text-right">
              <p className="text-[10px] font-bold text-amber-500">الفضاء الحالي</p>
              <p className="text-xs font-extrabold text-slate-200 mt-0.5">{roleNames[activeRole as keyof typeof roleNames] || activeRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-900 hover:bg-rose-950 hover:text-rose-400 rounded-lg text-slate-400 transition-colors"
              title="تسجيل الخروج وتغيير الفضاء"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-amber-400/5 border border-amber-400/10 rounded-lg p-3 text-right">
          <p className="text-[9px] text-slate-400 leading-relaxed font-bold">
            معد البرنامج: <span className="text-amber-400">أ. عادل موايعية</span>
          </p>
          <p className="text-[8px] text-slate-500 truncate" title={formatName(institute.name)}>{formatName(institute.name)}</p>
        </div>
      </div>
    </aside>
  );
}
