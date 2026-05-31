import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  Printer, 
  Users, 
  Layers, 
  Box,
  ChevronLeft,
  Calendar,
  User,
  Upload,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Search,
  X,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AppStateStore, SpecializationGroup, TrainingMode, Learner } from '../../services/store';

export default function TrainingStructure() {
  const [modes, setModes] = useState<TrainingMode[]>([]);
  const [groups, setGroups] = useState<SpecializationGroup[]>([]);
  const [activeTab, setActiveTab] = useState<'modes' | 'specs' | 'groups'>('specs');
  
  // Modals / forms state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mode modal/form state
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [editingModeId, setEditingModeId] = useState<string | null>(null);
  const [modeName, setModeName] = useState('');

  // Device modal/form state
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [targetModeId, setTargetModeId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('');

  // Confirmation states for safe deleting in iframe sandbox
  const [deleteGroupConfirmId, setDeleteGroupConfirmId] = useState<string | null>(null);
  const [deleteModeConfirmId, setDeleteModeConfirmId] = useState<string | null>(null);
  const [deleteDeviceConfirmId, setDeleteDeviceConfirmId] = useState<{ modeId: string; devId: string } | null>(null);

  // Group form state
  const [formData, setFormData] = useState({
    name: '',
    modeId: '1',
    deviceId: '',
    level: 'تقني سامي (TS)',
    duration: 'سنتين',
    startDate: '2024-09-01',
    endDate: '2026-06-30',
    guardian: 'أ. دليلة طهراوي',
    code: '',
  });

  // Learner upload state inside group form
  const [uploadedRoster, setUploadedRoster] = useState<Omit<Learner, 'status'>[]>([]);
  const [uploadFeedback, setUploadFeedback] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeUploadMethod, setActiveUploadMethod] = useState<'upload' | 'paste'>('upload');

  // Synchronize state with store
  useEffect(() => {
    setModes(AppStateStore.getModes());
    setGroups(AppStateStore.getGroups());

    const unsubscribe = AppStateStore.subscribe(() => {
      setModes(AppStateStore.getModes());
      setGroups(AppStateStore.getGroups());
    });

    return unsubscribe;
  }, []);

  // Set default device when mode transitions in form
  useEffect(() => {
    const selectedMode = modes.find(m => m.id === formData.modeId);
    if (selectedMode && selectedMode.devices.length > 0) {
      setFormData(prev => ({ ...prev, deviceId: selectedMode.devices[0].id }));
    } else {
      setFormData(prev => ({ ...prev, deviceId: '' }));
    }
  }, [formData.modeId, modes]);

  // Handle group save (ADD or Update)
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const finalLearners: Learner[] = uploadedRoster.map(x => ({
      id: x.id,
      name: x.name,
      gender: x.gender,
      status: 'active' as const
    }));

    if (editingGroupId) {
      // Edit existing
      AppStateStore.updateGroup(editingGroupId, {
        name: formData.name,
        modeId: formData.modeId,
        deviceId: formData.deviceId || undefined,
        level: formData.level,
        duration: formData.duration,
        startDate: formData.startDate,
        endDate: formData.endDate,
        guardian: formData.guardian,
        code: formData.code || undefined,
        ...(finalLearners.length > 0 ? { learners: finalLearners } : {})
      });
      alert('تم تحديث بيانات التخصص والفوج بنجاح.');
    } else {
      // Add new
      AppStateStore.addGroup({
        name: formData.name,
        modeId: formData.modeId,
        deviceId: formData.deviceId || undefined,
        level: formData.level,
        duration: formData.duration,
        startDate: formData.startDate,
        endDate: formData.endDate,
        guardian: formData.guardian,
        code: formData.code || undefined,
        learners: finalLearners.length > 0 ? finalLearners : [
          { id: 'L-N01', name: 'أحمد بن ويس', gender: 'M', status: 'active' },
          { id: 'L-N02', name: 'فريدة بوشافع', gender: 'F', status: 'active' },
          { id: 'L-N03', name: 'سليم جفال', gender: 'M', status: 'active' }
        ]
      });
      alert('تم إضافة التخصص الجديد وتوليد الفوج/الفرع بنجاح.');
    }

    // Reset and close
    closeGroupModal();
  };

  const openAddGroupModal = () => {
    setEditingGroupId(null);
    setFormData({
      name: '',
      modeId: '1',
      deviceId: '',
      level: 'تقني سامي (TS)',
      duration: 'سنتين',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-12-31',
      guardian: 'أ. جيلالي محمد',
      code: '',
    });
    setUploadedRoster([]);
    setUploadFeedback('');
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (g: SpecializationGroup) => {
    setEditingGroupId(g.id);
    setFormData({
      name: g.name,
      modeId: g.modeId,
      deviceId: g.deviceId || '',
      level: g.level,
      duration: g.duration,
      startDate: g.startDate,
      endDate: g.endDate,
      guardian: g.guardian,
      code: g.code,
    });
    setUploadedRoster(g.learners);
    setUploadFeedback(`قائمة من ${g.learners.length} متكون محملة مسبقاً.`);
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setEditingGroupId(null);
  };

  const handleDeleteGroup = (id: string) => {
    AppStateStore.deleteGroup(id);
    setDeleteGroupConfirmId(null);
  };

  // Send text dataset or csv to the backend Gemini AI extractor
  const sendTextToGemini = async (text: string, sourceName: string) => {
    setIsAiLoading(true);
    setUploadFeedback('جاري إرسال البيانات للذكاء الاصطناعي (Gemini) لتحليل الأسماء واستخراجها...');
    try {
      const response = await fetch("/api/ai/extract-trainees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error("Server parsing failed");
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        setUploadedRoster(result.data);
        setUploadFeedback(`✓ نجح الذكاء الاصطناعي في استخراج ${result.data.length} متكون من ${sourceName} وتحديد جنسهم.`);
      } else {
        setUploadFeedback('⚠️ لم نتمكن من العثور على متكونين صالحين في البيانات المعالجة.');
      }
    } catch (err) {
      console.error(err);
      setUploadFeedback('❌ فشل معالج الذكاء الاصطناعي في تحليل هذا المحتوى.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Real list upload analyzer supporting XLSX, CSV, PDF, and Images (OCR)
  const handleListUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    setIsAiLoading(true);

    if (extension === 'xlsx' || extension === 'xls') {
      setUploadFeedback('جاري قراءة وتحويل جدول Excel بالكامل...');
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const binaryStr = evt.target?.result;
          const workbook = XLSX.read(binaryStr, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          await sendTextToGemini(csvText, `ملف Excel: ${file.name}`);
        } catch (err) {
          console.error(err);
          setUploadFeedback('❌ خطأ في معالجة وفك تشفيير ملف Excel.');
          setIsAiLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } else if (extension === 'csv' || extension === 'txt') {
      setUploadFeedback('جاري قراءة البيانات المباشرة للملف النصي...');
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const text = evt.target?.result as string;
        await sendTextToGemini(text, `الملف: ${file.name}`);
      };
      reader.readAsText(file);
    } else if (extension === 'pdf' || extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
      setUploadFeedback('جاري قراءة المستند واستخلاص المحتوى بالذكاء الاصطناعي (OCR)... قد يستغرق ذلك بضع ثوانٍ...');
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const base64Data = (evt.target?.result as string).split(',')[1];
          let mimeType = file.type;
          if (extension === 'pdf') mimeType = 'application/pdf';

          const response = await fetch("/api/ai/extract-trainees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64Data, mimeType })
          });
          if (!response.ok) throw new Error("OCR Failed");
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            setUploadedRoster(result.data);
            setUploadFeedback(`✓ تم تحليل المستند واستخراج ${result.data.length} متكون بنجاح.`);
          } else {
            setUploadFeedback('⚠️ لم نتمكن من استخلاص الأسماء من المستند المرفوع.');
          }
        } catch (err) {
          console.error(err);
          setUploadFeedback('❌ فشل معالج المستندات الذكي OCR في التعرف على الملف الذاتي.');
        } finally {
          setIsAiLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setUploadFeedback('❌ ملحق غير مدعوم. يرجى اختيار ملف xlsx, csv, pdf أو صورة.');
      setIsAiLoading(false);
    }
  };

  const handlePasteExtract = async () => {
    if (!pastedText.trim()) return;
    await sendTextToGemini(pastedText, 'النص المنسوخ');
  };

  const handleAddNewLearner = () => {
    const newId = `L-M${Math.floor(Math.random() * 9000 + 1000)}`;
    setUploadedRoster(prev => [
      ...prev,
      { id: newId, name: 'متكون جديد', gender: 'M' }
    ]);
  };

  const handleUpdateLearnerField = (index: number, field: 'name' | 'id' | 'gender', value: any) => {
    setUploadedRoster(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteUploadedLearner = (index: number) => {
    setUploadedRoster(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearRoster = () => {
    setUploadedRoster([]);
    setUploadFeedback('');
    setPastedText('');
  };

  // Mode CRUD
  const handleSaveMode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modeName) return;

    if (editingModeId) {
      const updated = modes.map(m => m.id === editingModeId ? { ...m, name: modeName } : m);
      AppStateStore.saveModes(updated);
    } else {
      const newMode = { id: `M-${Date.now()}`, name: modeName, devices: [] };
      AppStateStore.saveModes([...modes, newMode]);
    }
    setIsModeModalOpen(false);
    setModeName('');
    setEditingModeId(null);
  };

  const handleDeleteMode = (id: string) => {
    const filtered = modes.filter(m => m.id !== id);
    AppStateStore.saveModes(filtered);
    setDeleteModeConfirmId(null);
  };

  // Device CRUD
  const handleSaveDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName || !targetModeId) return;

    const updated = modes.map(m => {
      if (m.id === targetModeId) {
        return {
          ...m,
          devices: [...m.devices, { id: `D-${Date.now()}`, name: deviceName }]
        };
      }
      return m;
    });

    AppStateStore.saveModes(updated);
    setIsDeviceModalOpen(false);
    setDeviceName('');
    setTargetModeId(null);
  };

  const handleDeleteDevice = (modeId: string, devId: string) => {
    const updated = modes.map(m => {
      if (m.id === modeId) {
        return {
          ...m,
          devices: m.devices.filter(d => d.id !== devId)
        };
      }
      return m;
    });
    AppStateStore.saveModes(updated);
    setDeleteDeviceConfirmId(null);
  };

  // Export CSV
  const handleExportFullStructure = () => {
    const headers = ['Type', 'Name', 'Qualification / Level', 'Guardian / Teacher', 'Registered Learners Count'];
    const rows = groups.map(g => {
      const term = AppStateStore.getTerminology(g.modeId);
      return [
        term.title,
        g.name,
        g.level,
        g.guardian,
        g.learners.length
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'structural_report_rakaba.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering groups based on search
  const filteredGroups = groups.filter(g => 
    g.name.includes(searchQuery) || 
    g.code.includes(searchQuery) ||
    g.guardian.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-row-reverse">
        <div className="flex gap-2 flex-row-reverse">
          <TabButton 
            active={activeTab === 'modes'} 
            onClick={() => setActiveTab('modes')} 
            label="أنماط وأجهزة التكوين" 
            icon={Layers} 
          />
          <TabButton 
            active={activeTab === 'specs'} 
            onClick={() => setActiveTab('specs')} 
            label="التخصصات والفروع والأفواج" 
            icon={Box} 
          />
          <TabButton 
            active={activeTab === 'groups'} 
            onClick={() => setActiveTab('groups')} 
            label="قوائم المتكونين والمتربصين" 
            icon={Users} 
          />
        </div>
        <button 
          onClick={handleExportFullStructure}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex-row-reverse"
        >
          <Printer className="w-4 h-4" />
          تصدير الهيكل المالي والتنظيمي
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: Modes Configuration */}
        {activeTab === 'modes' && (
          <motion.div 
            key="modes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {modes.map(mode => (
              <div key={mode.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-amber-400/50 transition-all text-right flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6 flex-row-reverse">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                      <Building2 className="w-5 h-5 text-amber-500 shrink-0" />
                      {mode.name}
                    </h3>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          setEditingModeId(mode.id);
                          setModeName(mode.name);
                          setIsModeModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="تعديل النمط"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {deleteModeConfirmId === mode.id ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1.5 rounded-lg border border-red-100">
                          <button
                            onClick={() => handleDeleteMode(mode.id)}
                            className="bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 rounded shadow-sm hover:bg-red-700 transition"
                          >
                            تأكيد
                          </button>
                          <button
                            onClick={() => setDeleteModeConfirmId(null)}
                            className="bg-slate-200 text-slate-700 font-bold text-[9px] px-2 py-0.5 rounded hover:bg-slate-300 transition"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeleteModeConfirmId(mode.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          title="حذف النمط"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex-row-reverse">
                      <span>أجهزة التكوين الملحقة</span>
                      <button 
                        onClick={() => {
                          setTargetModeId(mode.id);
                          setIsDeviceModalOpen(true);
                        }}
                        className="text-amber-600 flex items-center gap-1 hover:underline text-[10px] font-black"
                      >
                        <Plus className="w-3 h-3" /> إضافة جهاز
                      </button>
                    </div>
                    {mode.devices.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {mode.devices.map(device => (
                          <div key={device.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex-row-reverse text-xs">
                            <span className="font-semibold text-slate-700">{device.name}</span>
                            {deleteDeviceConfirmId?.modeId === mode.id && deleteDeviceConfirmId?.devId === device.id ? (
                              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-md border border-red-100">
                                <button
                                  onClick={() => handleDeleteDevice(mode.id, device.id)}
                                  className="bg-red-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-sm hover:bg-red-700 transition"
                                >
                                  حذف
                                </button>
                                <button
                                  onClick={() => setDeleteDeviceConfirmId(null)}
                                  className="bg-slate-200 text-slate-700 font-bold text-[8px] px-1.5 py-0.5 rounded hover:bg-slate-300 transition"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setDeleteDeviceConfirmId({ modeId: mode.id, devId: device.id })}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                title="حذف الجهاز"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-xs text-slate-400 italic font-medium">لا توجد أجهزة متصلة بهذا النمط</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => {
                setEditingModeId(null);
                setModeName('');
                setIsModeModalOpen(true);
              }}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-amber-400 hover:text-amber-600 hover:bg-slate-50 transition-all group min-h-[220px]"
            >
              <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black">إضافة نمط تكوين جديد</span>
            </button>
          </motion.div>
        )}

        {/* Tab 2: Specializations & Groups */}
        {activeTab === 'specs' && (
          <motion.div 
            key="specs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search and Quick Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between flex-row-reverse">
              <div className="relative w-full md:w-96">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="بحث في التخصصات والفروع والأفواج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right"
                />
              </div>

              <button 
                onClick={openAddGroupModal}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-amber-400 text-slate-900 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-300 transition-all flex-row-reverse shadow-md shadow-amber-400/10"
              >
                <Plus className="w-4 h-4" />
                إضافة تخصص جديد
              </button>
            </div>

            {/* List Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">التخصص / الفرع</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">نمط التكوين والجهاز</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">المستوى التأهيلي</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">التأطير وقوائم الطلبة</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map(group => {
                      const mode = modes.find(m => m.id === group.modeId);
                      const device = mode?.devices.find(d => d.id === group.deviceId);
                      const term = AppStateStore.getTerminology(group.modeId);

                      return (
                        <tr key={group.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 text-sm">{group.name}</p>
                            <div className="flex items-center gap-2 justify-end mt-1 font-mono">
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">{term.title}: {group.code}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{mode?.name}</span>
                              {device && <span className="text-[10px] text-amber-600 font-bold mt-1">» {device.name}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                            <span className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded">{group.level}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-around flex-row-reverse text-xs">
                              <div className="flex items-center gap-1.5 flex-row-reverse">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-800">{group.guardian}</span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                <Users className="w-3.5 h-3.5" />
                                <span>{group.learners.length} {term.plural}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openEditGroupModal(group)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="تعديل التخصص"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {deleteGroupConfirmId === group.id ? (
                                <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-100 shrink-0">
                                  <button
                                    onClick={() => handleDeleteGroup(group.id)}
                                    className="bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 rounded shadow-sm hover:bg-red-700 transition"
                                  >
                                    تأكيد
                                  </button>
                                  <button
                                    onClick={() => setDeleteGroupConfirmId(null)}
                                    className="bg-slate-200 text-slate-700 font-bold text-[9px] px-2 py-0.5 rounded hover:bg-slate-300 transition"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setDeleteGroupConfirmId(group.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="حذف التخصص"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 italic text-xs font-medium">
                        لا توجد تخصصات مطابقة للبحث الحالي.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Trainees list review */}
        {activeTab === 'groups' && (
          <motion.div 
            key="groups"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden text-right shadow-xl">
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex p-2 bg-amber-500/20 text-amber-400 rounded-xl mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tight">قاعدة البيانات وعمليات استيراد المتفوقين</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                  يقدم نظام "رقابة" إدارة آلية وذكية لقوائم المتكونين والمتربصين في جميع الشعب المهنية. يمكنك رفع قائمة جديدة أو مراجعة قوائم الأفواج وتحديثها.
                </p>
                <button 
                  onClick={openAddGroupModal}
                  className="bg-amber-400 text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all"
                >
                  رفع واستيراد مباشرة
                </button>
              </div>
              <div className="absolute right-0 top-0 w-64 h-64 bg-amber-400/5 blur-3xl rounded-full -mr-32 -mt-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => {
                const term = AppStateStore.getTerminology(group.modeId);
                return (
                  <div key={group.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-right flex flex-col justify-between hover:border-amber-400/40 transition-shadow">
                    <div>
                      <div className="flex items-center justify-between mb-4 flex-row-reverse">
                        <span className="text-[10px] font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-amber-700 font-mono">{group.code}</span>
                        <span className="text-xs text-slate-400 font-extrabold">{group.learners.length} {term.plural}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1 text-base">{group.name}</h4>
                      <p className="text-slate-400 text-[10px] font-semibold mb-4">{group.level} • الوصي: {group.guardian}</p>
                      
                      {/* Trainees quick list snippet */}
                      <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-6 max-h-36 overflow-y-auto">
                        {group.learners.map((learner, idx) => (
                          <div key={idx} className="flex justify-between flex-row-reverse text-xs text-slate-600">
                            <span>{learner.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{learner.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => openEditGroupModal(group)}
                      className="w-full py-2 bg-slate-50 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all text-center"
                    >
                      إدارة {term.plural} والملف
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modals for CRUD --- */}

      {/* Group / Specialization / Trainee import Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-right">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center flex-row-reverse border-b border-white/5">
              <h3 className="font-black text-base">{editingGroupId ? 'تعديل التخصص وقواعد الفوج' : 'إضافة تخصص وفوج جديد'}</h3>
              <button onClick={closeGroupModal} className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">تسمية التخصص (مثال: تطوير الويب الكامل)</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">نمط التكوين</label>
                  <select 
                    value={formData.modeId}
                    onChange={(e) => setFormData({ ...formData, modeId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right font-semibold"
                  >
                    {modes.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic device Selector based on mode */}
              {modes.find(m => m.id === formData.modeId)?.devices.length! > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 font-sans">حدد جهاز التكوين الملحق</label>
                  <select 
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right font-semibold"
                  >
                    {modes.find(m => m.id === formData.modeId)?.devices.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">مستوى التأهيل</label>
                  <input 
                    type="text" 
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">مدة التكوين</label>
                  <input 
                    type="text" 
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">بداية التكوين</label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">نهاية التكوين</label>
                  <input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">المؤطر المسؤول (الأستاذ الوصي)</label>
                  <input 
                    type="text" 
                    value={formData.guardian}
                    onChange={(e) => setFormData({ ...formData, guardian: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 font-semibold">رمز الفوج / الفرع (تلقائي مالم يحدد)</label>
                  <input 
                    type="text" 
                    placeholder="مثال: TC-INFO-2024"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right font-mono"
                  />
                </div>
              </div>

              {/* AI-powered trainee list upload or copy-paste feature */}
              <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200 text-right space-y-4">
                <div className="flex justify-between items-center flex-row-reverse">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse animate-duration-1000" />
                    <span className="text-sm font-black text-slate-800">استيراد قوائم المتكونين والمتربصين بالذكاء الاصطناعي</span>
                  </div>
                  <div className="text-[10px] text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md font-black font-sans">
                    Gemini 3.5 Active
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  اختر طريقة الاستيراد مباشرة لملفات الشعبة أو الفوج. يتم رسم وهندسة الجداول وتحديد المعطيات وتوليد الترميز تلقائياً بالذكاء الاصطناعي مع إمكانية التعديل والمطابقة الفورية للأعمدة.
                </p>

                {/* Import method tabs */}
                <div className="flex gap-2 border-b border-slate-200 pb-2 flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => setActiveUploadMethod('upload')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                      activeUploadMethod === 'upload'
                        ? "bg-amber-400 text-slate-900 shadow-sm"
                        : "text-slate-500 hover:bg-slate-200/50"
                    )}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    رفع مستند مالي (XLSX, CSV, PDF, صور)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveUploadMethod('paste')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                      activeUploadMethod === 'paste'
                        ? "bg-amber-400 text-slate-900 shadow-sm"
                        : "text-slate-500 hover:bg-slate-200/50"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    نسخ ولصق قائمة أسماء
                  </button>
                </div>

                {activeUploadMethod === 'upload' ? (
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center flex-row-reverse">
                      <label className="cursor-pointer bg-slate-950 text-white rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 select-none">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".xlsx,.xls,.csv,.txt,.pdf,.png,.jpg,.jpeg"
                          onChange={handleListUpload} 
                          disabled={isAiLoading}
                        />
                        <Upload className="w-4 h-4" /> 
                        اختر الملف من جهازك
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        المدعوم: Excel ،CSV ،PDF والجداول المصورة (OCR)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="ألصق القوائم هنا (الاسم، اللقب، الجنس أو مجرد أسماء متتالية)... مثال:&#10;شريف محمد جلال&#10;فاطمة الزهراء منصوري - أنثى&#10;Amine Boumediane"
                      rows={4}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right font-semibold placeholder:text-slate-300 placeholder:font-normal leading-relaxed"
                      disabled={isAiLoading}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handlePasteExtract}
                        disabled={isAiLoading || !pastedText.trim()}
                        className="bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        تحليل النص واستخلاص الأسماء بالذكاء الاصطناعي
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading Status */}
                {isAiLoading && (
                  <div className="flex items-center justify-center p-6 bg-amber-500/5 rounded-xl border border-amber-500/10 gap-3 text-slate-700 flex-row-reverse">
                    <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                    <span className="text-xs font-bold animate-pulse font-sans">
                      جاري تحليل الأسطر ومطابقة البيانات بالذكاء الاصطناعي... يرجى الانتظار
                    </span>
                  </div>
                )}

                {/* Feedback Log */}
                {uploadFeedback && !isAiLoading && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2 text-right justify-between flex-row-reverse">
                    <div className="flex items-center gap-1.5 flex-row-reverse text-xs font-bold text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{uploadFeedback}</span>
                    </div>
                    {uploadedRoster.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearRoster}
                        className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer"
                      >
                        إعادة تعيين 🧹
                      </button>
                    )}
                  </div>
                )}

                {/* Column Mapping and Interactive Editing Table */}
                {uploadedRoster.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    <div className="flex justify-between items-center flex-row-reverse">
                      <span className="text-[11px] font-black text-slate-700">
                        مراجعة قائمة المتكونين والمطابقة الذكية للأقسام والشعب:
                      </span>
                      <span className="text-[10px] bg-slate-200/65 text-slate-700 px-2.5 py-0.5 rounded-full font-extrabold font-mono">
                        العدد الكلي: {uploadedRoster.length} ({uploadedRoster.filter(l => l.gender === 'M').length} ذكور | {uploadedRoster.filter(l => l.gender === 'F').length} إناث)
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner max-h-60 overflow-y-auto">
                      <table className="w-full text-right border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 sticky top-0 z-10 text-right">
                            <th className="p-2 text-[10px] font-bold text-slate-400 text-center w-8">#</th>
                            <th className="p-2 text-[10px] font-bold text-slate-400">الاسم واللقب (تعديل مباشر)</th>
                            <th className="p-2 text-[10px] font-bold text-slate-400">رقم التسجيل والترميز</th>
                            <th className="p-2 text-[10px] font-bold text-slate-400 text-center w-28">جنس المتكون</th>
                            <th className="p-2 text-[10px] font-bold text-slate-500 text-center w-8">حذف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {uploadedRoster.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-2 text-center font-bold text-slate-400">{index + 1}</td>
                              <td className="p-1">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleUpdateLearnerField(index, 'name', e.target.value)}
                                  className="w-full bg-transparent hover:bg-slate-50 focus:bg-white p-1 rounded border border-transparent focus:border-slate-300 outline-none text-xs font-semibold text-slate-700 font-sans"
                                />
                              </td>
                              <td className="p-1">
                                <input
                                  type="text"
                                  value={item.id}
                                  onChange={(e) => handleUpdateLearnerField(index, 'id', e.target.value)}
                                  className="w-full bg-transparent hover:bg-slate-50 focus:bg-white p-1 rounded border border-transparent focus:border-slate-300 outline-none text-xs font-mono text-slate-500"
                                />
                              </td>
                              <td className="p-1 text-center">
                                <select
                                  value={item.gender}
                                  onChange={(e) => handleUpdateLearnerField(index, 'gender', e.target.value)}
                                  className="mx-auto block text-xs bg-slate-50 hover:bg-slate-100 p-1 rounded-lg border border-slate-200 font-semibold outline-none text-slate-700"
                                >
                                  <option value="M">M / ذكـر ♂</option>
                                  <option value="F">F / أنـثـى ♀</option>
                                </select>
                              </td>
                              <td className="p-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUploadedLearner(index)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                  title="إزالة من القوائم"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-center pt-2 flex-row-reverse">
                      <button
                        type="button"
                        onClick={handleAddNewLearner}
                        className="text-xs text-amber-600 hover:text-amber-800 font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة متبصر أو متكون يدوياً للقائمة المؤقتة
                      </button>
                      <button
                        type="button"
                        onClick={handleClearRoster}
                        className="text-xs text-red-500 hover:text-red-700 font-extrabold cursor-pointer"
                      >
                        مسح القائمة الحالية (تفريغ) 🧹
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={closeGroupModal}
                  className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 text-slate-900 rounded-xl font-black text-xs hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
                >
                  {editingGroupId ? 'حفظ التحديثات' : 'إدراج وحفظ'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Mode Modal */}
      {isModeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-right shadow-2xl">
            <div className="p-4 bg-slate-9 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white flex-row-reverse">
              <span className="font-bold text-sm">{editingModeId ? 'تعديل نمط التكوين' : 'إضافة نمط تكوين جديد'}</span>
              <button onClick={() => setIsModeModalOpen(false)} className="text-slate-100 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveMode} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">اسم نمط التكوين (بالعربية)</label>
                <input 
                  type="text" 
                  value={modeName}
                  onChange={(e) => setModeName(e.target.value)}
                  placeholder="مثال: التكوين التأهيلي، الدروس المسائية"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModeModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-amber-400 text-slate-900 hover:bg-amber-300 rounded-lg text-xs font-black shadow-md shadow-amber-400/10">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device Modal */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-right shadow-2xl">
            <div className="p-4 bg-slate-9 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white flex-row-reverse">
              <span className="font-bold text-sm">إضافة جهاز تكويني ملحق</span>
              <button onClick={() => setIsDeviceModalOpen(false)} className="text-slate-100 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveDevice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">تسمية الجهاز التكويني</label>
                <input 
                  type="text" 
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="مثال: تكوين المستفيدين من منحة البطالة"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 text-right font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsDeviceModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-amber-400 text-slate-900 hover:bg-amber-300 rounded-lg text-xs font-black">إضافة جهاز</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-row-reverse select-none",
        active 
          ? "bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20 scale-102" 
          : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 shadow-sm"
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0", active ? "text-slate-900" : "text-slate-400")} />
      <span>{label}</span>
    </button>
  );
}
