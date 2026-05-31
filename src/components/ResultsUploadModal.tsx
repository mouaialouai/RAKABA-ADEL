import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  X, 
  FileText, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Database, 
  Activity, 
  ArrowLeft,
  BookOpen,
  Award,
  Terminal,
  Send
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppStateStore, SemesterResult } from '../services/store';

interface ResultsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGroupId?: string;
}

export default function ResultsUploadModal({ isOpen, onClose, defaultGroupId }: ResultsUploadModalProps) {
  const groups = AppStateStore.getGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string>(defaultGroupId || groups[0]?.id || 'GP-WEB-1');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<SemesterResult[] | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-reset when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setParsedPreview(null);
      setSelectedFile(null);
      setPastedText('');
      setErrorMessage(null);
      setSaveSuccess(false);
      if (defaultGroupId) {
        setSelectedGroupId(defaultGroupId);
      }
    }
  }, [isOpen, defaultGroupId]);

  if (!isOpen) return null;

  const currentGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSimulationFill = () => {
    // Fill sample text/CSV format representing Algerian VET grade sheet in Arabic
    if (selectedGroupId === 'GP-WEB-1') {
      setPastedText(
        `الاسم الكامل,معدل السداسي,تطوير الويب الكامل,الخوارزميات وهياكل المعطيات,هندسة البرمجيات,قواعد البيانات\n` +
        `علوي معمر عادل,14.80,15.5,13.0,16.5,14.0\n` +
        `زين الإدريسي فوزي,10.40,10.0,9.5,12.0,10.0\n` +
        `ياسمين ماري,15.20,16.0,14.0,15.5,15.0\n` +
        `عمر بلقاسم,11.50,11.0,10.5,13.0,11.5\n` +
        `سارة حداد,14.00,14.5,13.0,15.0,13.5`
      );
    } else {
      setPastedText(
        `الاسم الكامل,معدل السداسي,نقاط المقياس 1,نقاط المقياس 2,نقاط المقياس 3\n` +
        `حليمة منصوري,13.50,14.0,12.5,14.0\n` +
        `فاطمة بن رمضان,10.80,11.0,10.0,11.5\n` +
        `مريم الصالحي,12.40,12.0,13.0,12.2`
      );
    }
    setActiveTab('paste');
  };

  const handleStartParsing = async () => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setParsedPreview(null);

    try {
      let fileText = pastedText;
      let base64Data = '';
      let mimeType = '';

      if (activeTab === 'upload' && selectedFile) {
        mimeType = selectedFile.type;
        // If it's CSV or plain text, read as text
        if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.txt')) {
          fileText = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = (e) => reject(new Error("خطأ في قراءة ملف CSV"));
            reader.readAsText(selectedFile);
          });
        } else {
          // Send as base64 for PDF or Excel binary sheets
          base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.onerror = () => reject(new Error("خطأ في معالجة المستند الثنائي"));
            reader.readAsDataURL(selectedFile);
          });
        }
      }

      if (activeTab === 'paste' && !pastedText.trim()) {
        throw new Error("يرجى لصق بيانات كشف النقاط أولاً أو استيراد ملف معتمد.");
      }

      // Prepare payload with registered learners of the group for precise AI-to-learner mapping
      const mappedLearners = currentGroup.learners.map(l => ({
        id: l.id,
        name: l.name,
        gender: l.gender
      }));

      const payload = {
        text: fileText,
        learners: mappedLearners,
        groupCode: currentGroup.code,
        file: base64Data,
        mimeType
      };

      const response = await fetch('/api/ai/parse-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errDesc = "فشلت مصلحة معالجة النقاط بالذكاء الاصطناعي في تفكيك الملف المرفوع.";
        try {
          // If the server returns a JSON error or plain text, extract it
          const errData = await response.json().catch(() => null);
          if (errData && errData.error) {
            errDesc += ` (${errData.error})`;
          } else if (response.status === 413) {
            errDesc += " (حجم الملف كبير جداً، يرجى استخدام ملف أصغر أو لصق البيانات نصياً).";
          }
        } catch (_) {}
        throw new Error(errDesc);
      }

      const result = await response.json();
      if (result && result.data && Array.isArray(result.data)) {
        setParsedPreview(result.data);
      } else {
        throw new Error("تنسيق النقاط مستخلص بشكل غير صالح من محرك المداولات الآلي.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "عذراً، حدث خطأ غير متوقع أثناء تفكيك وتحليل نقاط المداولات.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResults = async () => {
    if (!parsedPreview) return;
    setIsSaving(true);

    try {
      // Fetch currently saved semester results database
      const currentStoredResults = AppStateStore.getSemesterResults();

      // We replace or merge the newly parsed student grades into our stored database matching pupil ids
      const updatedResults = [...currentStoredResults];

      parsedPreview.forEach((newRes) => {
        const idx = updatedResults.findIndex(r => r.learnerId === newRes.learnerId);
        if (idx !== -1) {
          // Update existing
          updatedResults[idx] = {
            ...updatedResults[idx],
            ...newRes,
            publishedAt: new Date().toLocaleDateString('ar-DZ')
          };
        } else {
          // Add new record
          updatedResults.push({
            ...newRes,
            publishedAt: new Date().toLocaleDateString('ar-DZ')
          });
        }
      });

      AppStateStore.saveSemesterResults(updatedResults);
      setSaveSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (err) {
      setErrorMessage("أخفق حفظ وتوطين كشوف النقاط المستخلصة بقاعدة البيانات الإدارية.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:my-8 text-right font-sans"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rotate-45 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <button
            onClick={onClose}
            className="absolute top-6 left-6 p-2 bg-white/10 text-white/80 hover:bg-white/20 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 space-y-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 text-[9px] font-black rounded-lg block w-fit">
              بوابة الرقابة العامة ولجنة المداولات
            </span>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <h2 className="text-lg font-black tracking-tight">واجهة التوطين الذكي لكشوف النقاط والمعدلات</h2>
            </div>
            <p className="text-[11px] text-slate-300 max-w-2xl leading-relaxed">
              قم برفع أو لصق ملف كشف نقاط السداسي المعتمد (Excel / CSV) وسيقوم المساعد الذكي تلقائياً بمسح الملف ومطابقة معدلات كل متكون في فضاء الطالب الخاص به بتبسة 2.
            </p>
          </div>
        </div>

        {/* Modal Main Content Container */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 max-h-[75vh]">
          {saveSuccess ? (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="py-12 text-center space-y-4 max-w-md mx-auto"
            >
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-500 rounded-full text-emerald-500 flex items-center justify-center mx-auto text-3xl font-black">
                ✓
              </div>
              <h3 className="text-lg font-black text-slate-900">تم توطين كشوف النقاط بنجاح!</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                عبر الاسترشاد بمحرك الذكاء الاصطناعي، تم تحديث وتوزيع معدلات المداولات وعلامات المقاييس فورياً للطلبة وأوليائهم في فضاء الطالب النشط لمعهد تبسة 2 وجاري إغلاق النافذة...
              </p>
            </motion.div>
          ) : !parsedPreview ? (
            <div className="space-y-6">
              {/* Top Configuration Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10.5px] font-black text-slate-500 block mb-1.5">
                    1. الفوج الدراسي المستهدف بالبث
                    {defaultGroupId && (
                      <span className="mr-2 text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[9.5px] font-black">
                        محدد ومقفل للتخصص الحالي
                      </span>
                    )}
                  </label>
                  <select 
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    disabled={!!defaultGroupId}
                    className={cn(
                      "w-full p-3 rounded-xl text-xs font-bold text-right border",
                      defaultGroupId 
                        ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" 
                        : "bg-slate-50 border-slate-200"
                    )}
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.code}) - {g.learners.length} {AppStateStore.getTerminology(g.modeId).plural}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10.5px] font-black text-slate-500 block mb-1.5">نماذج سريعة للتجربة والتقييم</label>
                  <button
                    onClick={handleSimulationFill}
                    className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/80 p-3 rounded-xl text-xs font-black transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>تعبئة كشف نقاط نموذجي للتجربة فوراً</span>
                  </button>
                </div>
              </div>

              {/* Upload or Paste Tab Area */}
              <div className="space-y-3">
                <div className="flex border-b border-slate-200 gap-4 text-xs font-black">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={cn(
                      "pb-2.5 transition relative",
                      activeTab === 'upload' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    ملف كشف النقاط (Excel / CSV)
                  </button>
                  <button
                    onClick={() => setActiveTab('paste')}
                    className={cn(
                      "pb-2.5 transition relative",
                      activeTab === 'paste' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    لصق وتفكيك نصي للمداولات
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'upload' ? (
                    <motion.div
                      key="tab-upload"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-2xl p-8 text-center space-y-4 cursor-pointer transition-all duration-300",
                          dragActive ? "border-indigo-500 bg-indigo-50/20 scale-[0.99]" : "border-slate-200 hover:border-indigo-400 bg-slate-50/40"
                        )}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".csv,.txt,.xlsx,.xls,.pdf"
                          className="hidden" 
                        />
                        <div className="p-4 bg-white shadow-md rounded-full w-fit mx-auto text-indigo-500">
                          <UploadCloud className="w-8 h-8" />
                        </div>

                        {selectedFile ? (
                          <div className="space-y-1">
                            <span className="text-xs font-black text-indigo-650 block font-sans">{selectedFile.name}</span>
                            <span className="text-[10px] text-emerald-600 font-extrabold block">✓ تم تحميل المستند وجاهز لتمريره للمعالجة والتحليل</span>
                            <span className="text-[9px] text-slate-400 block mt-1">المقاس: {(selectedFile.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs font-black text-slate-705">اسحب وأفلت ملف المداولات هنا أمثلة (.csv, .xlsx, .pdf)</p>
                            <p className="text-[9.5px] text-slate-400">أو اضغط للملف لتصفح المجلدات المحلية بهاتفك أو كمبيوترك المكتبي</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tab-paste"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="الصق بيانات كشف النقاط هنا المكتوبة بالفواصل أو الجدول..."
                        rows={6}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-sans text-right placeholder-slate-400 block leading-relaxed resize-none outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Warning/Guide advice note */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-right flex gap-3 flex-row-reverse">
                <div className="p-2.5 bg-white text-indigo-600 border border-slate-150 rounded-xl shrink-0 h-fit self-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 mb-0.5">شروط توافق الأسماء البيداغوجية</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    سيقوم محرك الذكاء الاصطناعي بالتحليل المستمر لتوزيع كشوف النقاط. ليس من الضروري مطابقة الاسم بالكامل حرفياً؛ حيث تدعم الخوارزمية الفهرسة الضوئية لتحديد الهوية البيداغوجية وتخطيط الفارق وتوزيع النتائج فورياً.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-150 rounded-xl text-xs font-bold flex items-center gap-2 flex-row-reverse">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submission Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 flex-row-reverse">
                <button
                  onClick={handleStartParsing}
                  disabled={isAnalyzing}
                  className="bg-indigo-650 hover:bg-slate-900 text-white font-black text-xs px-6 py-3 rounded-xl transition duration-200 flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري التفكيك واستخلاص علامات الطلاب...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                      <span>تحليل وتوطين كشوف النقاط بالذكاء الاصطناعي</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-5 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء التوطين
                </button>
              </div>
            </div>
          ) : (
            /* Results preview layout and verification step */
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl flex items-center justify-between flex-row-reverse">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-extrabold font-mono">AI PIPELINE: SUCCESS</span>
                </div>
                <p className="text-xs font-extrabold text-slate-300">
                  تم استجابة محرك المداولات. يرجى مراجعة وتدقيق علامات المتكونين قبل إقرار الترحيل النهائي:
                </p>
              </div>

              {/* Preview Students Results Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black">
                        <th className="p-3">اسم المتكون بتبسة 2</th>
                        <th className="p-3 text-center">المعدل العام المستخلص</th>
                        <th className="p-3 text-center">القرار والوضعية</th>
                        <th className="p-3 text-center">المقاييس المسجلة وعلاماتها</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {parsedPreview.map((item, idx) => {
                        const hasPassed = item.gpa >= 10;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/40">
                            <td className="p-3">
                              <span className="font-extrabold text-slate-900 block">{item.learnerName}</span>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">المعّرف بـ {item.learnerId}</span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "text-sm font-black text-center font-mono py-1 px-3 rounded-full",
                                hasPassed ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {item.gpa.toFixed(2)}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "px-2.5 py-1 rounded text-[10px] font-black",
                                hasPassed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                              )}>
                                {hasPassed ? "مستوفي (ناجح)" : "مستدرك (دورة الاستدراك)"}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1.5 justify-end">
                                {item.subjects.map((subj, sIdx) => {
                                  const subjFailed = subj.average < 10;
                                  return (
                                    <span 
                                      key={sIdx} 
                                      className={cn(
                                        "px-2 py-0.5 rounded text-[9.5px] font-sans font-bold",
                                        subjFailed ? "bg-rose-50 border border-rose-100 text-rose-600" : "bg-slate-50 border border-slate-150 text-slate-700"
                                      )}
                                      title={`${subj.name}: مستمرة ${subj.continuousScore} | امتحان ${subj.examScore}`}
                                    >
                                      {subj.name.substring(0, 15)}... • {subj.average.toFixed(1)}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warning and Dispatch Final Action Buttons */}
              <div className="pt-4 border-t border-slate-150 flex justify-between items-center gap-4">
                <button
                  onClick={() => setParsedPreview(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition duration-200 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>إعادة قراءة وتصحيح الملف</span>
                </button>

                <button
                  onClick={handleSaveResults}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-xl transition duration-200 flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري البث للطلبة وتوطين النقاط...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4.5 h-4.5" />
                      <span>تأكيد ونشر النتائج بالفضاء الرقمي فوراً</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
