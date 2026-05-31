import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { AppStateStore } from '../../services/store';

const roleProfiles = {
  admin: { name: 'الأستاذ عادل موايعية', title: 'المسير المركزي للرقمية' },
  supervisor: { name: 'مستشار الرقابة العامة', title: 'هيئة الرقابة والتوجيه' },
  teacher: { name: 'أستاذ مؤطر بيداغوجي', title: 'الفريق الفني للتدريب' },
  parent: { name: 'ولي أمر المتكون', title: 'بوابة فضاء الأولياء الموحدة' },
  trainee: { name: 'متكون المركز', title: 'فضاء التحصيل المهني' },
  none: { name: 'زائر النظام', title: 'غير معرّف' }
};

export default function Topbar() {
  const [activeRole, setActiveRole] = useState<'admin' | 'supervisor' | 'teacher' | 'trainee' | 'parent' | 'none'>(AppStateStore.getActiveRole());
  const now = new Date();

  useEffect(() => {
    const unsub = AppStateStore.subscribe(() => {
      setActiveRole(AppStateStore.getActiveRole());
    });
    return unsub;
  }, []);

  const profile = roleProfiles[activeRole as keyof typeof roleProfiles] || roleProfiles.none;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text" 
            placeholder="بحث عن متكونين، متخصصين، مجموعات..." 
            className="w-full bg-slate-100 border-none rounded-full pr-10 pl-4 py-2 text-xs focus:ring-2 focus:ring-amber-400 outline-none transition-all text-right"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-left hidden md:block">
          <div className="text-[14px] font-mono font-bold text-slate-800">{format(now, 'HH:mm:ss a')}</div>
          <div className="text-[10px] text-slate-500 uppercase font-medium">{format(now, 'MMM dd, yyyy', { locale: ar })}</div>
        </div>
        
        <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900">{profile.name}</div>
            <div className="text-[10px] text-amber-600 font-bold uppercase">{profile.title}</div>
          </div>
          <div className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
             <User className="text-slate-400 w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
