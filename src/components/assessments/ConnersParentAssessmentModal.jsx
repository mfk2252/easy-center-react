import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  CONNERS_PARENT_DOMAINS,
  CONNERS_PARENT_OPTIONS,
  CONNERS_PARENT_ITEMS,
  CONNERS3_COPYRIGHT_INFO,
  calculateConnersParentScore,
} from '../../data/connersParentData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';

const EMPTY_CONNERS_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  gender: '',
  grade: '',
  school: '',
  examinerName: '',
  raterName: '',
  raterRelation: 'الأم',
  date: todayStr(),
  notes: '',
  scores: {},
  domainRawScores: {},
  inputMode: 'subscales', // 'subscales' (حاسبة الدرجات الخام للمجالات) أو 'items' (تفريغ أرقام بنود الكراسة)
  clinicalSummary: '',
  recommendations: '',
};

export default function ConnersParentAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast, currentUser } = useApp();

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_CONNERS_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        domainRawScores: initialData.domainRawScores || initialData.subscalesRaw || {},
        inputMode: initialData.inputMode || 'subscales',
      };
    }
    return {
      ...EMPTY_CONNERS_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [openAccordions, setOpenAccordions] = useState(() => ({
    A: true, B: true, C: true, D: false, E: false, F: false, G: false, H: false, L: false
  }));
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [bridgeOpen, setBridgeOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setForm({
        ...EMPTY_CONNERS_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        domainRawScores: initialData.domainRawScores || initialData.subscalesRaw || {},
        inputMode: initialData.inputMode || 'subscales',
      });
    } else {
      setForm({
        ...EMPTY_CONNERS_FORM,
        examinerName: currentUser?.name || '',
        date: todayStr(),
      });
    }
  }, [isOpen, initialData, currentUser]);

  // Real-time Psychometrics calculation
  const psychometrics = useMemo(() => {
    if (form.inputMode === 'subscales') {
      return calculateConnersParentScore({}, form.domainRawScores);
    }
    return calculateConnersParentScore(form.scores, null);
  }, [form.scores, form.domainRawScores, form.inputMode]);

  if (!isOpen) return null;

  function handleSelectStudent(e) {
    const val = e.target.value;
    if (val === '__other__') {
      setForm(f => ({
        ...f,
        mode: 'other',
        stuId: '',
        studentName: '',
        dob: '',
        age: '',
        grade: '',
        school: '',
      }));
      return;
    }
    const stu = students.find(s => s.id === val);
    if (!stu) {
      setForm(f => ({ ...f, mode: 'registered', stuId: '', studentName: '' }));
      return;
    }

    const calculatedAge = stu.dob ? calcAge(stu.dob) : '';
    setForm(f => ({
      ...f,
      mode: 'registered',
      stuId: stu.id,
      studentName: stu.name || '',
      dob: stu.dob || '',
      age: calculatedAge || stu.age || '',
      grade: stu.grade || stu.className || '',
      school: stu.school || stu.schoolName || '',
    }));
  }

  function handleDomainRawChange(domainId, rawVal) {
    const domain = CONNERS_PARENT_DOMAINS.find(d => d.id === domainId);
    const max = domain?.maxRawScore || 30;
    const numeric = rawVal === '' ? '' : Math.max(0, Math.min(max, Number(rawVal) || 0));

    setForm(prev => {
      const nextDomainRaw = {
        ...prev.domainRawScores,
        [domainId]: numeric,
      };
      return {
        ...prev,
        domainRawScores: nextDomainRaw,
      };
    });
  }

  function handleItemScoreChange(itemId, val) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: val,
      },
    }));
  }

  function toggleAccordion(domId) {
    setOpenAccordions(prev => ({
      ...prev,
      [domId]: !prev[domId],
    }));
  }

  function handleQuickSample(level = 'mild') {
    if (form.inputMode === 'subscales') {
      const domainRaw = {};
      CONNERS_PARENT_DOMAINS.forEach(dom => {
        if (level === 'mild') {
          domainRaw[dom.id] = Math.round(dom.maxRawScore * 0.35);
        } else if (level === 'moderate') {
          domainRaw[dom.id] = Math.round(dom.maxRawScore * 0.55);
        } else if (level === 'severe') {
          domainRaw[dom.id] = Math.round(dom.maxRawScore * 0.85);
        } else {
          domainRaw[dom.id] = Math.round(dom.maxRawScore * 0.15);
        }
      });
      setForm(f => ({ ...f, domainRawScores: domainRaw }));
    } else {
      const scores = {};
      CONNERS_PARENT_ITEMS.forEach(it => {
        if (level === 'severe') scores[it.id] = (it.id % 2 === 0 ? 3 : 2);
        else if (level === 'moderate') scores[it.id] = (it.id % 3 === 0 ? 3 : (it.id % 2 === 0 ? 2 : 1));
        else if (level === 'mild') scores[it.id] = (it.id % 3 === 0 ? 2 : (it.id % 2 === 0 ? 1 : 0));
        else scores[it.id] = (it.id % 4 === 0 ? 1 : 0);
      });
      setForm(f => ({ ...f, scores }));
    }
    toast(`⚡ تم تعبئة استجابات افتراضية لمقياس كونرز (${level === 'mild' ? 'مؤشرات بسيطة' : level === 'moderate' ? 'مؤشرات دالة إكلينيكياً' : 'مؤشرات مرتفعة جداً'})`, 'ok');
  }

  function applyAutoClinicalSummary() {
    const summary = psychometrics.summary;
    const recommendations = psychometrics.recommendations;
    setForm(f => ({
      ...f,
      clinicalSummary: summary,
      recommendations,
    }));
    toast('✨ تم توليد الخلاصة السيكومترية والتوصيات التربوية بدقة', 'ok');
  }

  // Navigation Guard / Safe Close
  function handleSafeClose() {
    const hasRaw = Object.values(form.domainRawScores || {}).some(v => v !== '' && v !== undefined);
    const hasScores = Object.keys(form.scores || {}).length > 0;
    if (hasRaw || hasScores) {
      if (window.confirm('⚠️ تنبيه: هل أنت متأكد من رغبتك في إغلاق المقياس دون حفظ التغييرات الحالية؟')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى تحديد الطالب (أو إدخال اسمه) أولاً', 'er');
      return;
    }
    if (!form.date) {
      toast('⚠️ يرجى إدخال تاريخ التقييم', 'er');
      return;
    }

    const payload = {
      ...form,
      id: form.id || uid(),
      type: 'conners_parent',
      measureId: 'conners_parent',
      scaleId: 'conners_parent',
      scaleType: 'conners_parent',
      scaleName: 'مقياس كونرز لتقدير الوالدين (Conners-3 Parent)',
      category: 'adhd',
      categoryName: 'مقاييس فرط الحركة وتشتت الانتباه',
      score: psychometrics.adhdTScore,
      tScore: psychometrics.adhdTScore,
      standardScore: psychometrics.adhdTScore,
      percentile: psychometrics.percentile,
      level: psychometrics.level,
      severityKey: psychometrics.severityKey,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      domainRawScores: form.domainRawScores,
      subscalesRaw: form.domainRawScores,
      psychometrics,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      updatedAt: new Date().toISOString(),
    };

    if (form.id) {
      lsUpd('studentAssessments', payload.id, payload);
      lsUpd('assessments', payload.id, payload);
      toast('✅ تم تحديث مقياس كونرز بنجاح', 'ok');
    } else {
      const newId = uid();
      const newObj = { ...payload, id: newId, createdAt: new Date().toISOString() };
      lsAdd('studentAssessments', newObj);
      lsAdd('assessments', newObj);
      toast('✅ تم حفظ مقياس كونرز لتقدير الوالدين بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  return (
    <div className="mbg" style={{ zIndex: 1100 }} onClick={e => e.target === e.currentTarget && handleSafeClose()}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
        }}
      >
        {/* Modal Main Header */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس كونرز لتقدير الوالدين (Conners-3 Parent) — الحاسبة السيكومترية الرقمية
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  الفئات الفرعية (A-G) · تحويل T-Scores
                </span>
                <span className="bdg" style={{ background: '#7c2d12', color: '#ffedd5', fontSize: '0.7rem', fontWeight: 800 }}>
                  معتمد لتقييم ADHD وفق DSM-5
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Conners 3rd Edition (Parent) — تفريغ الدرجات الخام لحساب الدرجات التائية والرتب المئينية
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setShowCopyrightModal(true)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
              }}
            >
              📜 حقوق الملكية وتصريح الاستخدام
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleSafeClose}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700 }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* Real-time Psychometrics & Clinical Metric Strip */}
        <div
          className="modal-subbar transition-colors bg-slate-50 border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-800"
          style={{
            padding: '10px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* ADHD Index Metric */}
            <div
              className="rounded-lg px-3 py-1.5 text-center border bg-white border-orange-500 dark:bg-slate-800 dark:border-orange-600"
            >
              <span className="text-xs text-slate-500 dark:text-slate-400 block">مؤشر ADHD الكلي (T-Score):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.severityColor }}>
                T = {psychometrics.adhdTScore}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
                (مئيني: {psychometrics.percentile}%)
              </span>
            </div>

            {/* Input Mode Selector */}
            <div
              className="rounded-lg p-1 border flex items-center gap-1 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
            >
              <span className="text-xs text-slate-500 dark:text-slate-400 px-1">نمط الإدخال:</span>
              <button
                type="button"
                className={`btn btn-xs ${form.inputMode === 'subscales' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setForm(f => ({ ...f, inputMode: 'subscales' }))}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: form.inputMode === 'subscales' ? 800 : 500,
                  background: form.inputMode === 'subscales' ? '#ea580c' : undefined,
                  color: form.inputMode === 'subscales' ? '#fff' : undefined,
                  border: 'none',
                }}
              >
                🧮 حاسبة درجات الفئات (A-G)
              </button>
              <button
                type="button"
                className={`btn btn-xs ${form.inputMode === 'items' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setForm(f => ({ ...f, inputMode: 'items' }))}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: form.inputMode === 'items' ? 800 : 500,
                  background: form.inputMode === 'items' ? '#ea580c' : undefined,
                  color: form.inputMode === 'items' ? '#fff' : undefined,
                  border: 'none',
                }}
              >
                📋 تفريغ أرقام الكراسة (1-80)
              </button>
            </div>

            {/* Severity Result Badge */}
            <div
              className="rounded-lg px-3 py-1.5 border flex items-center gap-2 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
            >
              <span className="text-xs text-slate-500 dark:text-slate-400">التصنيف الإكلينيكي:</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-extrabold"
                style={{
                  background: `${psychometrics.severityColor}15`,
                  color: psychometrics.severityColor,
                  border: `1px solid ${psychometrics.severityColor}40`,
                }}
              >
                {psychometrics.level}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. Student & Clinical Case Metadata */}
          <div
            className="rounded-xl p-3 md:p-3.5 mb-4 border transition-colors bg-slate-50/80 border-slate-200 dark:bg-slate-900/80 dark:border-slate-800"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isHeaderCollapsed ? 0 : 8 }}>
              <div className="text-sm font-extrabold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                <span>👦</span>
                <span>بيانات المفحوص والفحص الإكلينيكي</span>
                {form.studentName && (
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-orange-100 text-orange-800 dark:bg-slate-800 dark:text-orange-300">
                    {form.studentName}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsManualEdit(prev => !prev)}
                  className="btn btn-xs btn-g"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', height: 24 }}
                >
                  {isManualEdit ? '🔒 قفل التعديل' : '✏️ تعديل يدوي'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsHeaderCollapsed(prev => !prev)}
                  className="btn btn-xs btn-g"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', height: 24, fontWeight: 700 }}
                >
                  {isHeaderCollapsed ? '⬇️ إظهار التفاصيل' : '⬆️ إخفاء التفاصيل'}
                </button>
              </div>
            </div>

            {!isHeaderCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {form.mode === 'other' && (
                  <div className="fl full">
                    <label className="text-xs text-slate-700 dark:text-slate-300">اسم المستفيد الخارجي <span className="req">*</span></label>
                    <input
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2.5 h-8 text-xs"
                      value={form.studentName || ''}
                      onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                      placeholder="اكتب اسم الطالب / المفحوص..."
                    />
                  </div>
                )}

                {/* Grid Rows */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                  <div className="fl" style={{ margin: 0 }}>
                    <label className="text-xs text-slate-700 dark:text-slate-300 mb-0.5">الطالب / المفحوص <span className="req">*</span></label>
                    <select
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 h-8 text-xs"
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">-- اختر طالباً مسجلاً في المركز --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code || s.id})</option>
                      ))}
                      <option value="__other__">➕ مفحوص خارجي / غير مسجل</option>
                    </select>
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label className="text-xs text-slate-700 dark:text-slate-300 mb-0.5">تاريخ التقييم <span className="req">*</span></label>
                    <input
                      type="date"
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 h-8 text-xs"
                      value={form.date || ''}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label className="text-xs text-slate-700 dark:text-slate-300 mb-0.5">العمر الزمني</label>
                    <input
                      type="text"
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 h-8 text-xs"
                      readOnly={!isManualEdit && form.mode === 'registered'}
                      placeholder="العمر الزمني"
                      value={form.age || ''}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label className="text-xs text-slate-700 dark:text-slate-300 mb-0.5">الأخصائي الفاحص</label>
                    <select
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 h-8 text-xs"
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    >
                      <option value="">-- اختر الفاحص --</option>
                      {emps.map(emp => (
                        <option key={emp.id} value={emp.name}>{emp.name}</option>
                      ))}
                      {currentUser?.name && !emps.some(e => e.name === currentUser.name) && (
                        <option value={currentUser.name}>{currentUser.name}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                  <div className="fl" style={{ margin: 0 }}>
                    <label className="text-xs text-slate-700 dark:text-slate-300 mb-0.5">المستجيب (ولي الأمر)</label>
                    <input
                      type="text"
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 h-8 text-xs"
                      placeholder="اسم المستجيب..."
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>
                  <div className="fl" style={{ margin: 0 }}>
                    <label className="text-xs text-slate-700 dark:text-slate-300 mb-0.5">صلة القرابة</label>
                    <input
                      type="text"
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 h-8 text-xs"
                      placeholder="الأم / الأب..."
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. MODE A: SUBSCALE RAW SCORE CALCULATOR (CATEGORIES A-G) WITH ACCORDIONS */}
          {form.inputMode === 'subscales' ? (
            <div style={{ marginBottom: 20 }}>
              <div
                className="rounded-xl p-4 md:p-5 mb-4 border transition-colors bg-orange-50/70 border-orange-400/50 dark:bg-slate-900/90 dark:border-orange-900/50"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 className="text-base font-extrabold text-orange-800 dark:text-orange-300 flex items-center gap-2 m-0">
                      <span>🧮</span> حاسبة مجموع الدرجات الخام للفئات الفرعية (Conners-3 Subscales A - G)
                    </h3>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-1 mb-0">
                      طبّق كراسة التقدير الورقية الأصلية لكونرز، ثم أدخل مجموع الدرجات الخام لكل فئة فرعية أدناه لحساب الدرجات التائية (T-Scores) والمعايير الإكلينيكية تلقائياً.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={() => handleQuickSample('mild')}
                    >
                      ⚡ تجربة (مؤشرات بسيطة)
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={() => handleQuickSample('moderate')}
                    >
                      ⚡ تجربة (مؤشرات دالة)
                    </button>
                  </div>
                </div>

                {/* Subscales Grid Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 12,
                  }}
                >
                  {CONNERS_PARENT_DOMAINS.map(dom => {
                    const currentRaw = form.domainRawScores[dom.id] !== undefined ? form.domainRawScores[dom.id] : '';
                    const subRes = psychometrics.subscaleResults.find(s => s.id === dom.id);
                    const tScore = subRes?.tScore || 50;
                    const isOpenAcc = openAccordions[dom.id] !== false;

                    return (
                      <div
                        key={dom.id}
                        className="rounded-lg p-3.5 flex flex-col justify-between gap-2.5 border shadow-sm transition-colors bg-white border-slate-200 dark:bg-slate-800/90 dark:border-slate-700"
                        style={{
                          borderRightWidth: '4px',
                          borderRightColor: dom.color,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  background: dom.color,
                                  color: '#fff',
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                }}
                              >
                                فئة {dom.id} · {dom.code}
                              </span>
                              <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{dom.name}</strong>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {dom.itemsCount} فقرات بالكراسة · الدرجة القصوى ({dom.maxRawScore})
                            </div>
                          </div>

                          <div
                            className="text-center px-2 py-1 rounded border min-w-[70px] dark:bg-slate-900/60 dark:border-slate-700"
                            style={{
                              background: 'var(--bg-card)',
                              borderColor: `${dom.color}50`,
                            }}
                          >
                            <span style={{ fontSize: '0.68rem', color: dom.color, display: 'block', fontWeight: 700 }}>الدرجة التائية:</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: subRes?.severityColor || dom.color }}>
                              T = {tScore}
                            </span>
                            <span className="text-xs block text-slate-500 dark:text-slate-400">
                              {subRes?.severityLabel || 'متوسط'}
                            </span>
                          </div>
                        </div>

                        {/* Raw Score Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            مجموع الدرجة الخام (0 - {dom.maxRawScore}):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={dom.maxRawScore}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded border text-center font-extrabold focus:outline-none"
                            style={{
                              width: 90,
                              height: 34,
                              fontSize: '0.95rem',
                              borderColor: dom.color,
                            }}
                            placeholder="0"
                            value={currentRaw}
                            onChange={e => handleDomainRawChange(dom.id, e.target.value)}
                          />
                        </div>

                        {/* Accordion Toggle for domain description & IEP target */}
                        <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-2">
                          <button
                            type="button"
                            onClick={() => toggleAccordion(dom.id)}
                            className="text-xs font-bold flex items-center justify-between w-full text-slate-600 dark:text-slate-300 hover:text-orange-600"
                          >
                            <span>🎯 الهدف التربوي والتفاصيل:</span>
                            <span>{isOpenAcc ? '▲ إخفاء' : '▼ إظهار'}</span>
                          </button>
                          {isOpenAcc && (
                            <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-2 rounded">
                              <div><strong>الوصف الإكلينيكي:</strong> {dom.description}</div>
                              <div className="mt-1 text-orange-700 dark:text-orange-400"><strong>هدف الخطة الفردية (IEP):</strong> {dom.iepTargetArea}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* MODE B: 80-ITEMS CODES RECORDING SHEET */
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  📑 كشف تفريغ أرقام بنود كراسة كونرز (1 إلى 80):
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  مفتاح التقدير: 0 (أبداً)، 1 (أحياناً)، 2 (غالباً)، 3 (دائماً)
                </div>
              </div>

              {/* Domain Filter Tabs */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
                <button
                  type="button"
                  className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
                  onClick={() => setActiveDomainFilter('all')}
                  style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                >
                  🌐 جميع البنود (80)
                </button>
                {CONNERS_PARENT_DOMAINS.map(dom => (
                  <button
                    key={dom.id}
                    type="button"
                    className={`tab ${activeDomainFilter === dom.id ? 'on' : ''}`}
                    onClick={() => setActiveDomainFilter(dom.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${dom.color}`,
                    }}
                  >
                    فئة {dom.id} ({dom.name})
                  </button>
                ))}
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CONNERS_PARENT_ITEMS.filter(it => activeDomainFilter === 'all' || it.subscaleId === activeDomainFilter).map(item => {
                  const dom = CONNERS_PARENT_DOMAINS.find(d => d.id === item.subscaleId);
                  const val = form.scores[item.id];
                  const isSelected = val !== undefined && val !== null;

                  return (
                    <div
                      key={item.id}
                      className="rounded-lg p-3 flex justify-between items-center gap-3 flex-wrap border transition-colors bg-white border-slate-200 dark:bg-slate-800/90 dark:border-slate-700"
                      style={{
                        borderColor: isSelected ? dom?.color : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
                        <span
                          style={{
                            background: dom?.color || '#ea580c',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.74rem',
                            padding: '3px 8px',
                            borderRadius: 6,
                          }}
                        >
                          #{item.id} · فئة {item.subscaleId}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            تفريغ استجابة كراسة كونرز لبند رقم ({item.id}) — {dom?.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            راجع كراسة التقدير المعتمدة لرصد السلوك المقابل
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {CONNERS_PARENT_OPTIONS.map(opt => {
                          const active = val === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleItemScoreChange(item.id, opt.value)}
                              className={`btn btn-xs ${active ? 'btn-p' : 'btn-g'}`}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.74rem',
                                fontWeight: active ? 800 : 500,
                                background: active ? (opt.value === 3 ? '#dc2626' : opt.value === 2 ? '#ea580c' : opt.value === 1 ? '#0284c7' : '#059669') : undefined,
                                color: active ? '#fff' : undefined,
                                border: 'none',
                              }}
                            >
                              {opt.label} {active && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Clinical Summary & Recommendations */}
          <div
            className="rounded-xl p-4 border mt-4 transition-colors bg-slate-50/80 border-slate-200 dark:bg-slate-900/80 dark:border-slate-800"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div className="text-sm font-extrabold text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                <span>📝</span> الخلاصة التشخيصية لمقياس كونرز والتوصيات السلوكية المعتمدة
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, background: '#ea580c' }}
              >
                ✨ توليد الخلاصة بناءً على الدرجات التائية
              </button>
            </div>

            <div className="fg c1">
              <div className="fl">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">التقرير السيكومتري والتشخيص الإكلينيكي (وفق DSM-5)</label>
                <textarea
                  rows={5}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-xs leading-relaxed"
                  placeholder="الخلاصة السيكومترية وتفسير الدرجات التائية لمؤشرات الانتباه وفرط الحركة..."
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                />
              </div>

              <div className="fl">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">توصيات الخطة التربوية الفردية (IEP) والتدخل السلوكي الأسري</label>
                <textarea
                  rows={4}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-xs leading-relaxed"
                  placeholder="استراتيجيات إدارة السلوك في الفصل والمنزل وتعديل البيئة الصفية..."
                  value={form.recommendations || ''}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div
          className="transition-colors bg-slate-50 border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800"
          style={{
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="text-xs font-extrabold text-orange-700 dark:text-orange-400">
              مؤشر فرط الحركة (ADHD): <strong>T = {psychometrics.adhdTScore}</strong> | الرتبة المئينية: <strong>{psychometrics.percentile}%</strong>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded font-extrabold"
              style={{
                background: `${psychometrics.severityColor}15`,
                color: psychometrics.severityColor,
                border: `1px solid ${psychometrics.severityColor}40`,
              }}
            >
              {psychometrics.level}
            </span>

            {/* IEP Bridge Export Button */}
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={() => setBridgeOpen(true)}
              style={{ fontWeight: 700 }}
              title="تصدير نتائج المقياس مباشرة إلى جسر أهداف الخطة التربوية الفردية"
            >
              🌉 جسر الخطة الفردية (IEP Bridge)
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={handleSafeClose}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                padding: '8px 20px',
              }}
            >
              💾 حفظ تقييم مقياس كونرز (Conners-3)
            </button>
          </div>
        </div>
      </div>

      {/* COPYRIGHT & COMPLIANCE MODAL */}
      {showCopyrightModal && (
        <div
          className="mbg"
          style={{ zIndex: 1200 }}
          onClick={e => e.target === e.currentTarget && setShowCopyrightModal(false)}
        >
          <div
            className="mb rounded-xl max-w-lg p-5 border shadow-2xl bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <div className="flex justify-between items-center mb-3 border-b pb-2 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-orange-600 dark:text-orange-400 m-0 flex items-center gap-2">
                <span>📜</span> حقوق الملكية وتصريح الاستخدام الإكلينيكي
              </h3>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => setShowCopyrightModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="text-xs leading-relaxed space-y-2.5">
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 text-orange-950 dark:text-orange-200">
                <strong>الامتثال لحقوق النشر:</strong> مقياس كونرز لتقدير الوالدين (Conners 3® Parent) علامة تجارية ومصنف محمي لدار النشر Multi-Health Systems Inc. (MHS).
              </div>

              <div>
                <strong>آلية التطبيق المعتمدة:</strong> يتم تطبيق فقرات المقياس الـ 80 عبر كراسة الاستجابة الورقية الرسمية الأصلية من قبل الفاحص المرخص. يعمل هذا النظام كـ <strong>"حاسبة رقمية سيكومترية للدرجات الخام" (Psychometric Raw Score Calculator)</strong> لحساب الدرجات التائية وتحويل المعايير ورسم المنحنيات السلوكية دون عرض نصوص الاختبار المحمية.
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <div><strong>المؤلف الأصلي:</strong> {CONNERS3_COPYRIGHT_INFO.authorAr}</div>
                <div><strong>الناشر:</strong> {CONNERS3_COPYRIGHT_INFO.publisherAr}</div>
                <div><strong>المرجعية:</strong> {CONNERS3_COPYRIGHT_INFO.standardsReference}</div>
                <div><strong>الفئة المستهدفة:</strong> {CONNERS3_COPYRIGHT_INFO.targetAge}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={() => setShowCopyrightModal(false)}
                style={{ background: '#ea580c' }}
              >
                فهمت ذلك ومتابعة الاستخدام
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IEP BRIDGE MODAL */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={form}
          scaleId="conners_parent"
          scaleName="مقياس كونرز لتقدير الوالدين (Conners-3 Parent)"
          studentId={form.stuId}
          studentName={form.studentName}
          results={form.scores}
          itemsBank={CONNERS_PARENT_ITEMS}
        />
      )}
    </div>
  );
}
