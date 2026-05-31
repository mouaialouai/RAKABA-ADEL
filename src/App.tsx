import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Home from './modules/home/Home';
import AdminDashboard from './modules/admin/AdminDashboard';
import SupervisionDashboard from './modules/supervision/SupervisionDashboard';
import TeacherDashboard from './modules/teacher/TeacherDashboard';
import TraineePortal from './modules/trainee/TraineePortal';
import ParentPortal from './modules/parent/ParentPortal';
import DisciplinarySystem from './modules/disciplinary/DisciplinarySystem';
import PortalLogin from './modules/login/PortalLogin';
import { AppStateStore } from './services/store';
import { ShieldAlert } from 'lucide-react';

// Access Denied Shield Component
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-3xl shadow-sm text-center max-w-md mx-auto my-12 text-right space-y-4">
      <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-black text-slate-900">ولوج غير مصرح به!</h3>
      <p className="text-slate-500 text-xs leading-relaxed font-semibold">
        عذراً، هذا الفضاء الرقمي محمي بالكامل ومقيد بأحدث بروتوكولات الأمان التشريعية. ليس لديك الصلاحية المناسبة للولوج إلى هذا القسم.
      </p>
      <button 
        onClick={() => {
          AppStateStore.setActiveRole('none');
          window.location.href = '/';
        }}
        className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
      >
        العودة لبوابة التعريف / تغيير الحساب
      </button>
    </div>
  );
}

export default function App() {
  const [activeRole, setActiveRole] = useState<'admin' | 'supervisor' | 'teacher' | 'trainee' | 'parent' | 'none'>(AppStateStore.getActiveRole());

  useEffect(() => {
    const unsub = AppStateStore.subscribe(() => {
      setActiveRole(AppStateStore.getActiveRole());
    });
    return unsub;
  }, []);

  // Root authentication flow
  if (activeRole === 'none') {
    return <PortalLogin />;
  }

  // Routing checks mapping roles
  const isAdmin = activeRole === 'admin';
  const isSupervisor = activeRole === 'supervisor' || isAdmin;
  const isTeacher = activeRole === 'teacher' || isAdmin;
  const isTrainee = activeRole === 'trainee' || isAdmin;
  const isParent = activeRole === 'parent' || isAdmin;

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                
                <Route 
                  path="/admin/*" 
                  element={isAdmin ? <AdminDashboard /> : <AccessDenied />} 
                />
                <Route 
                  path="/supervision/*" 
                  element={isSupervisor ? <SupervisionDashboard /> : <AccessDenied />} 
                />
                <Route 
                  path="/disciplinary/*" 
                  element={isSupervisor ? <DisciplinarySystem /> : <AccessDenied />} 
                />
                <Route 
                  path="/teacher/*" 
                  element={isTeacher ? <TeacherDashboard /> : <AccessDenied />} 
                />
                <Route 
                  path="/trainee/*" 
                  element={isTrainee ? <TraineePortal /> : <AccessDenied />} 
                />
                <Route 
                  path="/parent/*" 
                  element={isParent ? <ParentPortal /> : <AccessDenied />} 
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
