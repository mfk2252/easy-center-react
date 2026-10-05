import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  PORTAGE_COPYRIGHT_INFO,
  PORTAGE_DOMAINS,
  PORTAGE_AGE_BANDS,
  PORTAGE_RATING_OPTIONS,
  PORTAGE_ITEMS,
  calculatePortagePsychometrics,
} from '../../data/portageAssessmentData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import { sanitizeAssessmentForm } from '../../utils/sanitize';

const EMPTY_PORTAGE_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: 'تأخر نمائي شامل / تدخل مبكر',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'أخصائي التدخل المبكر / المعلم',
  examinerName: '',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function PortageAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  onOpenIepBridge,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast, currentUser } = useApp();

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_PORTAGE_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || initialData.responses || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_PORTAGE_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [activeAgeBandFilter, setActiveAgeBandFilter] = useState('all');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate chronological age in months for accurate DQ & developmental comparison
  const chronologicalAgeMonths = useMemo(() => {
    if (!form.dob && !form.age) return 48;
    if (form.dob) {
      const birth = new Date(form.dob);
      const now = new Date(form.date || todayStr());
      if (!isNaN(birth.getTime())) {
        const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        return Math.max(diffMonths, 6);
      }
    }
    const ageStr = String(form.age || '');
    const matchYear = ageStr.match(/(\d+)\s*(سنوات|سنة|عام|years|yr)/i);
    const matchMonth = ageStr.match(/(\d+)\s*(أشهر|شهر|months|mo)/i);
    let totalMonths = 0;
    if (matchYear) totalMonths += parseInt(matchYear[1], 10) * 12;
    if (matchMonth) totalMonths += parseInt(matchMonth[1], 10);
    return totalMonths > 0 ? totalMonths : 48;
  }, [form.dob, form.age, form.date]);

  // Real-time calculation of Portage Psychometrics & Developmental Age
  const psychometrics = useMemo(() => {
    return calculatePortagePsychometrics(form.scores, chronologicalAgeMonths);
  }, [form.scores, chronologicalAgeMonths]);

  // Filtered items based on domain, age band, and search query
  const filteredItems = useMemo(() => {
    return PORTAGE_ITEMS.filter(item => {
      if (activeDomainFilter !== 'all' && item.domainId !== activeDomainFilter) return false;
      if (activeAgeBandFilter !== 'all' && item.ageBand !== activeAgeBandFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = item.text.toLowerCase().includes(q);
        const matchHelper = (item.helperText || '').toLowerCase().includes(q);
        const matchNum = String(item.num).includes(q);
        if (!matchText && !matchHelper && !matchNum) return false;
      }
      return true;
    });
  }, [activeDomainFilter, activeAgeBandFilter, searchQuery]);

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
        diagnosis: 'تأخر نمائي / تدخل مبكر',
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
      diagnosis: stu.diagnosis || 'تأخر نمائي / تدخل مبكر',
      age: calculatedAge || stu.age || '',
      grade: stu.grade || stu.className || '',
      school: stu.school || stu.schoolName || '',
    }));
  }

  function handleSetScore(itemId, scoreValue) {
    setForm(f => {
      const updatedScores = { ...f.scores };
      if (scoreValue === null || scoreValue === undefined) {
        delete updatedScores[itemId];
      } else {
        updatedScores[itemId] = scoreValue;
      }
      return {
        ...f,
        scores: updatedScores,
      };
    });
  }

  function handleSetItemNote(itemId, noteText) {
    setForm(f => ({
      ...f,
      itemNotes: {
        ...f.itemNotes,
        [itemId]: noteText,
      },
    }));
  }

  // Safe Close protection to prevent losing assessment responses
  function safeClose() {
    const answeredCount = Object.keys(form.scores).length;
    if (answeredCount > 0 && !initialData) {
      if (!window.confirm(`⚠️ لديك ${answeredCount} بنداً تم تقييمه ولم يتم حفظه نهائياً بعد. هل أنت متأكد من الخروج دون حفظ؟`)) {
        return;
      }
    }
    onClose();
  }

  // Fast auto-fill sample responses
  function autoFillSample(level = 'emerging') {
    const newScores = {};
    PORTAGE_ITEMS.forEach(it => {
      if (level === 'advanced') {
        newScores[it.id] = Math.random() > 0.15 ? 1.0 : 0.5;
      } else if (level === 'emerging') {
        const rand = Math.random();
        newScores[it.id] = rand > 0.6 ? 1.0 : rand > 0.25 ? 0.5 : 0.0;
      } else if (level === 'intensive') {
        const rand = Math.random();
        newScores[it.id] = rand > 0.75 ? 0.5 : 0.0;
      }
    });

    setForm(f => ({
      ...f,
      scores: newScores,
      clinicalSummary: `التقييم النمائي الشامل وفق دليل بورتيدج الحديث: يبلغ العمر النمائي الكلي للطفل حوالي (${psychometrics.compositeDevAgeText}) مقابل عمر زمني مقداره (${chronologicalAgeMonths} شهراً)، بنسبة إتقان نمائي عامة تبلغ (${psychometrics.overallPercentage}%). يظهر الطفل أداءً نمائياً بمستوى (${psychometrics.overallLevel}).`,
      recommendations: `1. إعداد خطة تربوية فردية تركز على المحاور ذات الفجوات النمائية بالدليل.\n2. تكثيف أنشطة التفاعل اللغوي والاستقلالية الحركية الدقيقة.\n3. إشراك الأسرة في تنفيذ تدريبات بطاقات بورتيدج المنزلية بمعدل 4 جلسات أسبوعياً.`,
    }));

    toast('⚡ تم تعبئة نموذج الاستجابات النمائية بنجاح', 'ok');
  }

  function handleAutoGenerateSummary() {
    const lines = [
      `🌟 تقرير التقييم النمائي الشامل — دليل بورتيدج للتدخل المبكر (Portage Guide):`,
      `المفحوص: ${form.studentName || '—'} | العمر الزمني: ${form.age || `${Math.round(chronologicalAgeMonths / 12)} سنوات`} (${chronologicalAgeMonths} شهراً).`,
      `العمر النمائي المركب المحقق: ${psychometrics.compositeDevAgeText} (حاصل النمو النمائي DQ = ${psychometrics.dqScore}).`,
      `المستوى والتشخيص العام: ${psychometrics.overallLevel} (${psychometrics.overallPercentage}% إتقان كلي).`,
      `\nتفصيل الأداء عبر المجالات النمائية الستة:`,
    ];

    PORTAGE_DOMAINS.forEach(dom => {
      const stat = psychometrics.domainStats[dom.id];
      if (stat && stat.assessedItems > 0) {
        lines.push(`• ${dom.name}: العمر النمائي (${stat.developmentalAgeText}) — نسبة الإتقان ${stat.percentage}% (${stat.statusLevel}).`);
      }
    });

    const summaryText = lines.join('\n');
    const recText = `1. ترحيل البنود غير المكتسبة (${psychometrics.totalAssessedSkills - psychometrics.totalAcquiredSkills} مهارة) إلى خطة التدخل المبكر الفردية (IEP).\n2. تدريب الطفل على المهام النمائية ذات الأولوية باستخدام التلقين المتدرج والدعم الحسي.\n3. إعادة تقييم التطور النمائي دورياً كل 3 أشهر لتتبع مسار الاكتساب.`;

    setForm(f => ({
      ...f,
      clinicalSummary: summaryText,
      recommendations: recText,
    }));

    toast('✨ تم توليد الخلاصة النمائية وتوصيات التدخل المبكر بنجاح', 'ok');
  }

  function buildPayload() {
    const cleanedForm = sanitizeAssessmentForm(form);
    const payloadId = initialData?.id || form.id || uid();
    const studentIdVal = cleanedForm.stuId || cleanedForm.studentId || '';

    return {
      ...cleanedForm,
      id: payloadId,
      assessmentId: payloadId,
      studentId: studentIdVal,
      stuId: studentIdVal,
      measureId: 'portage-guide-v2',
      scaleId: 'portage-guide-v2',
      measureName: 'دليل بورتيدج للتدخل المبكر (Portage Guide)',
      measureNameEn: 'Portage Guide to Early Education (Modern Clinical Edition)',
      category: 'developmental_early',
      isPortage: true,
      scaleType: 'portage_guide',
      score: psychometrics.totalEarnedScore,
      maxScore: psychometrics.totalPossibleScore,
      percentage: `${psychometrics.overallPercentage}%`,
      percentageNum: psychometrics.overallPercentage,
      level: psychometrics.overallLevel,
      severityColor: psychometrics.overallColor,
      results: form.scores,
      scores: form.scores,
      responses: form.scores,
      itemNotes: form.itemNotes,
      psychometrics: {
        compositeDevAgeMonths: psychometrics.compositeDevAgeMonths,
        compositeDevAgeText: psychometrics.compositeDevAgeText,
        chronologicalAgeMonths: psychometrics.chronologicalAgeMonths,
        dqScore: psychometrics.dqScore,
        domainStats: psychometrics.domainStats,
      },
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations || form.notes,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };
  }

  function handleSave(skipClose = false) {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار أو كتابة اسم المستفيد / الطالب أولاً', 'er');
      return null;
    }

    const payload = buildPayload();

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث نتيجة تقييم دليل بورتيدج بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', payload);
      toast(`✅ تم حفظ تقييم دليل بورتيدج بنجاح (${psychometrics.compositeDevAgeText})`, 'ok');
    }

    if (onSaved) onSaved();
    if (!skipClose) onClose();
    return payload;
  }

  function handleSaveAndTransferToBridge() {
    const payload = handleSave(true);
    if (!payload) return;
    if (onOpenIepBridge) {
      onOpenIepBridge(payload);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && safeClose()}>
      <div
        className="mb mb-xl"
        style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16,
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          fontFamily: "'Tajawal', 'Segoe UI', Tahoma, sans-serif",
        }}
      >
        {/* MODAL HEADER BANNER */}
        <div
          className="modal-header-custom"
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.12), rgba(5, 150, 105, 0.04))',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #16a34a, #059669)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
              }}
            >
              🌱
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  دليل بورتيدج للتدخل المبكر (Portage Guide)
                </h2>
                <span className="bdg b-gr" style={{ fontSize: '.72rem', fontWeight: 800 }}>
                  بطارية الـ 6 مجالات النمائية (0-6 سنوات)
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)', marginTop: 2 }}>
                Portage Guide to Early Education — {PORTAGE_ITEMS.length} بنداً تشخيصياً مع شروحات التطبيق والأهداف الفردية
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setShowCopyrightDetails(!showCopyrightDetails)}
              style={{
                background: showCopyrightDetails ? '#16a34a' : 'rgba(22, 163, 74, 0.15)',
                color: showCopyrightDetails ? '#fff' : '#15803d',
                border: '1px solid #16a34a',
                fontWeight: 700,
                fontSize: '.78rem',
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق المقياس' : 'إظهار حقوق المقياس'}
            </button>
            <button
              type="button"
              className="btn btn-xs btn-p"
              onClick={safeClose}
              style={{ fontWeight: 700 }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* MODAL BODY SCROLLABLE */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          {/* EXPANDABLE COPYRIGHT & SCIENTIFIC ATTRIBUTION NOTICE */}
          {showCopyrightDetails && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 16,
                fontSize: '.82rem',
                color: '#14532d',
                lineHeight: 1.6,
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '.92rem', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لدليل بورتيدج:
                </span>
                <span
                  style={{ cursor: 'pointer', opacity: 0.7, fontSize: '.8rem', fontWeight: 600 }}
                  onClick={() => setShowCopyrightDetails(false)}
                >
                  ✖ إخفاء
                </span>
              </div>

              <div
                style={{
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: '.8rem',
                  color: '#166534',
                }}
              >
                <div>
                  <strong>المرجعية العلمية:</strong> {PORTAGE_COPYRIGHT_INFO.title} — إعداد {PORTAGE_COPYRIGHT_INFO.originalAuthors} · {PORTAGE_COPYRIGHT_INFO.institution}.
                </div>
                <span style={{ fontSize: '.72rem', background: '#bbf7d0', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                  {PORTAGE_COPYRIGHT_INFO.diagnosticNature}
                </span>
              </div>

              <div style={{ fontSize: '.78rem', color: '#166534', background: '#dcfce7', padding: '8px 12px', borderRadius: 8 }}>
                {PORTAGE_COPYRIGHT_INFO.copyrightNotice}
              </div>
            </div>
          )}

          {/* COMPACT COLLAPSIBLE DEMOGRAPHICS CARD */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>👤</span>
                <span style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text-main)' }}>
                  بيانات المفحوص وأخصائي التدخل المبكر:
                </span>
                {form.studentName && (
                  <span className="bdg b-gr" style={{ fontSize: '.76rem', fontWeight: 700 }}>
                    {form.studentName} {form.age ? `(${form.age})` : ''}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '.78rem', color: 'var(--pr)', fontWeight: 700 }}>
                {isHeaderCollapsed ? '▼ إظهار البيانات' : '▲ طي البيانات'}
              </span>
            </div>

            {!isHeaderCollapsed && (
              <div style={{ marginTop: 12 }}>
                <div className="fg c3" style={{ marginBottom: 10 }}>
                  <div className="fl">
                    <label>اختيار المستفيد / الطفل <span style={{ color: 'red' }}>*</span></label>
                    <select
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">— اختر طفلاً مسجلاً في المركز —</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.diagnosis ? `(${s.diagnosis})` : ''}
                        </option>
                      ))}
                      <option value="__other__">➕ طفل خارجي جديد</option>
                    </select>
                  </div>

                  {form.mode === 'other' && (
                    <div className="fl">
                      <label>اسم الطفل الخارجي</label>
                      <input
                        type="text"
                        placeholder="اسم الطفل..."
                        value={form.studentName}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="fl">
                    <label>تاريخ الميلاد</label>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={e => {
                        const dobVal = e.target.value;
                        const autoAge = dobVal ? calcAge(dobVal) : form.age;
                        setForm(f => ({ ...f, dob: dobVal, age: autoAge }));
                      }}
                    />
                  </div>

                  <div className="fl">
                    <label>العمر الزمني</label>
                    <input
                      type="text"
                      placeholder="مثال: 3 سنوات و 6 أشهر"
                      value={form.age}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    />
                  </div>

                  <div className="fl">
                    <label>التشخيص النمائي</label>
                    <input
                      type="text"
                      placeholder="مثال: تأخر نمائي شامل، داون، توحد"
                      value={form.diagnosis}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                    />
                  </div>

                  <div className="fl">
                    <label>أخصائي الفحص والتقييم</label>
                    <input
                      type="text"
                      placeholder="اسم الأخصائي..."
                      value={form.examinerName}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    />
                  </div>

                  <div className="fl">
                    <label>تاريخ التقييم</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* REAL-TIME PSYCHOMETRIC & DEVELOPMENTAL AGE DASHBOARD */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(5, 150, 105, 0.02))',
              border: '2px solid #16a34a',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <span style={{ fontWeight: 800, fontSize: '.96rem', color: 'var(--text-main)' }}>
                  المؤشرات النمائية والعمر النمائي الفوري (Portage Metrics):
                </span>
              </div>

              {/* Fast Auto-fill sample buttons */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => autoFillSample('advanced')}
                  style={{ background: '#059669', color: '#fff', fontSize: '.7rem', fontWeight: 700 }}
                  title="نموذج نمو متقدم"
                >
                  ⚡ نموذج متقدم
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => autoFillSample('emerging')}
                  style={{ background: '#d97706', color: '#fff', fontSize: '.7rem', fontWeight: 700 }}
                  title="نموذج في طور الاكتساب"
                >
                  ⚡ نموذج متوسط
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => autoFillSample('intensive')}
                  style={{ background: '#dc2626', color: '#fff', fontSize: '.7rem', fontWeight: 700 }}
                  title="نموذج بحاجة لتدخل مكثف"
                >
                  ⚡ تدخل مكثف
                </button>
              </div>
            </div>

            {/* 4 Score Highlight Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 12 }}>
              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>العمر النمائي المركب</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#16a34a' }}>
                  {psychometrics.compositeDevAgeText}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>حاصل النمو (DQ)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.overallColor }}>
                  {psychometrics.dqScore}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>نسبة الإتقان النمائي</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.overallColor }}>
                  {psychometrics.overallPercentage}%
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>المهارات المكتسبة / المقيمة</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {psychometrics.totalAcquiredSkills} <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>/ {psychometrics.totalAssessedSkills}</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Level Banner */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 8,
                padding: '8px 12px',
                border: `1px solid ${psychometrics.overallColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ fontSize: '.82rem', fontWeight: 800, color: psychometrics.overallColor }}>
                🎯 التصنيف النمائي العام: {psychometrics.overallLevel}
              </div>
              <div style={{ fontSize: '.74rem', color: 'var(--text-sub)' }}>
                العمر الزمني المعتمد: {Math.floor(chronologicalAgeMonths / 12)} سنوات ({chronologicalAgeMonths} شهر)
              </div>
            </div>
          </div>

          {/* DOMAIN & AGE BAND FILTER TABS */}
          <div style={{ marginBottom: 14 }}>
            {/* Domain Filter Buttons */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-sub)' }}>المجالات:</span>
              <button
                type="button"
                className={`btn btn-xs ${activeDomainFilter === 'all' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '.74rem', fontWeight: 700 }}
              >
                🌟 جميع المجالات ({PORTAGE_ITEMS.length})
              </button>
              {PORTAGE_DOMAINS.map(dom => {
                const count = PORTAGE_ITEMS.filter(it => it.domainId === dom.id).length;
                const stat = psychometrics.domainStats[dom.id];
                return (
                  <button
                    key={dom.id}
                    type="button"
                    className={`btn btn-xs ${activeDomainFilter === dom.id ? 'btn-p' : 'btn-g'}`}
                    onClick={() => setActiveDomainFilter(dom.id)}
                    style={{ fontSize: '.74rem', fontWeight: 700 }}
                  >
                    {dom.icon} {dom.name} ({count}) {stat?.developmentalAgeText && stat.assessedItems > 0 ? `· ${stat.developmentalAgeText}` : ''}
                  </button>
                );
              })}
            </div>

            {/* Age Band Filter Buttons */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-sub)' }}>المرحلة العمرية:</span>
              {PORTAGE_AGE_BANDS.map(band => (
                <button
                  key={band.id}
                  type="button"
                  className={`btn btn-xs ${activeAgeBandFilter === band.id ? 'btn-p' : 'btn-g'}`}
                  onClick={() => setActiveAgeBandFilter(band.id)}
                  style={{
                    fontSize: '.72rem',
                    fontWeight: 600,
                    background: activeAgeBandFilter === band.id ? '#16a34a' : undefined,
                    borderColor: activeAgeBandFilter === band.id ? '#16a34a' : undefined,
                  }}
                >
                  {band.label}
                </button>
              ))}
            </div>

            {/* Search Input Bar */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                className="prog-search-input"
                placeholder="🔍 البحث في نصوص بنود دليل بورتيدج أو شروحات التطبيق..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', fontSize: '.84rem', borderRadius: 8 }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-xs btn-g"
                  onClick={() => setSearchQuery('')}
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* ITEMS LIST WORKSTATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const currentScore = form.scores[item.id];
              const note = form.itemNotes[item.id] || '';
              const domMeta = PORTAGE_DOMAINS.find(d => d.id === item.domainId) || PORTAGE_DOMAINS[0];

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined ? '1.5px solid #16a34a' : '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Top Item Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span className="bdg b-gr" style={{ fontSize: '.7rem', fontWeight: 800 }}>
                          بند #{item.num}
                        </span>
                        <span className="bdg" style={{ background: `${domMeta.color}15`, color: domMeta.color, fontSize: '.68rem', fontWeight: 700 }}>
                          {domMeta.icon} {domMeta.name}
                        </span>
                        <span className="bdg b-bl" style={{ fontSize: '.68rem', fontWeight: 600 }}>
                          📅 {item.ageBand} سنة
                        </span>
                        {item.iepGoal && (
                          <span className="bdg" style={{ background: '#fef3c7', color: '#b45309', fontSize: '.68rem', fontWeight: 600 }}>
                            🎯 هدف IEP متاح
                          </span>
                        )}
                      </div>

                      {/* Main Skill Item Text */}
                      <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.45 }}>
                        {item.text}
                      </div>

                      {/* HELPER TEXT BELOW ITEM (إرشادات التطبيق السريري) */}
                      {item.helperText && (
                        <div
                          style={{
                            fontSize: '.78rem',
                            color: '#15803d',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: 6,
                            padding: '6px 10px',
                            marginTop: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span>💡</span>
                          <span><strong>إجراء التطبيق والملاحظة:</strong> {item.helperText}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SCORING BUTTONS ROW */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)', marginLeft: 6 }}>
                      درجة التقييم:
                    </span>
                    {PORTAGE_RATING_OPTIONS.map(opt => {
                      const isSelected = currentScore === opt.value;
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                          onClick={() => handleSetScore(item.id, isSelected ? null : opt.value)}
                          style={{
                            fontSize: '.74rem',
                            fontWeight: 700,
                            background: isSelected ? opt.color : undefined,
                            borderColor: isSelected ? opt.color : undefined,
                            color: isSelected ? '#fff' : undefined,
                            padding: '4px 10px',
                            borderRadius: 6,
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Item Optional Specialist Note */}
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="ملاحظات نوعية على أداء الطفل في هذا البند (اختياري)..."
                      value={note}
                      onChange={e => handleSetItemNote(item.id, e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '.78rem',
                        padding: '4px 8px',
                        background: 'var(--g0)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>
                🔍 لا توجد بنود مطابقة لمعايير البحث والتصفية المحددة.
              </div>
            )}
          </div>

          {/* SUMMARY & IEP RECOMMENDATIONS SECTION */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: '16px',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: '.94rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة النمائية وتوصيات التدخل المبكر (IEP Direct Export)
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={handleAutoGenerateSummary}
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #059669)',
                  borderColor: '#059669',
                  fontWeight: 700,
                  fontSize: '.74rem',
                }}
              >
                ✨ توليد الخلاصة والأهداف آلياً
              </button>
            </div>

            <div className="fl full" style={{ marginBottom: 10 }}>
              <label>التقرير والتشخيص النمائي الشامل</label>
              <textarea
                rows={4}
                value={form.clinicalSummary}
                onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                placeholder="الخلاصة السريرية والنمائية لمستوى تطور الطفل..."
                style={{ fontSize: '.82rem', lineHeight: 1.5 }}
              />
            </div>

            <div className="fl full">
              <label>توصيات خطة التدخل المبكر الفردية (IEP Goals)</label>
              <textarea
                rows={3}
                value={form.recommendations}
                onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                placeholder="الأهداف النمائية المقترحة وتدريبات بطاقات بورتيدج..."
                style={{ fontSize: '.82rem', lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          className="modal-footer-custom"
          style={{
            padding: '12px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 10,
          }}
        >
          <div style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>
            العمر النمائي: <b style={{ color: '#16a34a' }}>{psychometrics.compositeDevAgeText}</b> (DQ: {psychometrics.dqScore}) — <b style={{ color: psychometrics.overallColor }}>{psychometrics.overallLevel}</b>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {onOpenIepBridge && (
              <button
                type="button"
                className="btn btn-p"
                onClick={handleSaveAndTransferToBridge}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderColor: '#059669',
                  fontWeight: 800,
                  padding: '8px 16px',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>🎯</span> حفظ ونقل إلى جسر الخطة (IEP)
              </button>
            )}
            <button
              type="button"
              className="btn btn-p"
              onClick={() => handleSave(false)}
              style={{
                background: 'linear-gradient(135deg, #16a34a, #059669)',
                borderColor: '#16a34a',
                fontWeight: 800,
                padding: '8px 20px',
                borderRadius: 10,
              }}
            >
              💾 حفظ التقييم وحساب النتيجة
            </button>
            <button
              type="button"
              className="btn btn-g"
              onClick={safeClose}
              style={{ fontWeight: 700 }}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
