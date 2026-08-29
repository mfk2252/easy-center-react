import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import {
  PLS5_COPYRIGHT_INFO,
  PLS5_RECEPTIVE_ITEMS,
  PLS5_EXPRESSIVE_ITEMS,
  PLS5_AGE_GROUPS,
  PLS5_RESPONSE_OPTIONS,
  PLS5_SUBTESTS,
  getPLS5StartingPoints,
  calculatePLS5Psychometrics,
} from '../../data/pls5Data';

const EMPTY_PLS5_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: '',
  examinerName: '',
  specialistName: '',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {}, // Format: { 'r_1': 1, 'r_2': 0, 'e_1': 1 ... }
  clinicalSummary: '',
  recommendations: '',
};

export default function PLS5AssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast, currentUser } = useApp?.() || { toast: () => {}, currentUser: null };

  const [form, setForm] = useState(() => {
    if (initialData) {
      // Normalize existing scores if they were stored in resultsReceptive/resultsExpressive or scores/results
      const normalizedScores = {};
      const srcScores = initialData.scores || initialData.results || {};
      
      if (initialData.resultsReceptive) {
        Object.entries(initialData.resultsReceptive).forEach(([k, v]) => {
          const key = k.startsWith('r_') ? k : `r_${k}`;
          normalizedScores[key] = (v === 1 || v === true || v === '1') ? 1 : 0;
        });
      }
      if (initialData.resultsExpressive) {
        Object.entries(initialData.resultsExpressive).forEach(([k, v]) => {
          const key = k.startsWith('e_') ? k : `e_${k}`;
          normalizedScores[key] = (v === 1 || v === true || v === '1') ? 1 : 0;
        });
      }
      if (Object.keys(normalizedScores).length === 0) {
        Object.entries(srcScores).forEach(([k, v]) => {
          normalizedScores[k] = (v === 1 || v === true || v === '1') ? 1 : 0;
        });
      }

      return {
        ...EMPTY_PLS5_FORM,
        ...initialData,
        examinerName: initialData.examinerName || initialData.specialistName || currentUser?.name || '',
        raterName: initialData.raterName || initialData.informantName || '',
        scores: normalizedScores,
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_PLS5_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeSubtest, setActiveSubtest] = useState('receptive'); // 'receptive' | 'expressive'
  const [activeAgeFilter, setActiveAgeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Auto calculate chronological age in months
  const studentAgeMonths = useMemo(() => {
    if (!form.dob) return 48; // default 4 years (48 months)
    const ageObj = calcAge(form.dob);
    if (typeof ageObj === 'object' && ageObj !== null) {
      return Math.max(2, (ageObj.years || 0) * 12 + (ageObj.months || 0));
    }
    return 48;
  }, [form.dob]);

  // Recommended starting points based on age
  const startingPoints = useMemo(() => {
    return getPLS5StartingPoints(studentAgeMonths);
  }, [studentAgeMonths]);

  // Calculate live psychometrics
  const psychometrics = useMemo(() => {
    return calculatePLS5Psychometrics(form.scores, {}, studentAgeMonths);
  }, [form.scores, studentAgeMonths]);

  // Set recommended age filter when student changes
  useEffect(() => {
    if (form.stuId && !initialData) {
      if (studentAgeMonths < 12) setActiveAgeFilter('0-11 شهر');
      else if (studentAgeMonths < 24) setActiveAgeFilter('12-23 شهر');
      else if (studentAgeMonths < 36) setActiveAgeFilter('2-3 سنوات');
      else if (studentAgeMonths < 48) setActiveAgeFilter('3-4 سنوات');
      else if (studentAgeMonths < 60) setActiveAgeFilter('4-5 سنوات');
      else if (studentAgeMonths < 72) setActiveAgeFilter('5-6 سنوات');
      else if (studentAgeMonths < 84) setActiveAgeFilter('6-7 سنوات');
      else setActiveAgeFilter('7 سنوات فما فوق');
    }
  }, [form.stuId, studentAgeMonths, initialData]);

  // Handle student selection from dropdown
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
        diagnosis: '',
        grade: '',
        school: '',
      }));
      setIsManualEdit(true);
      return;
    }

    if (!val) {
      setForm(f => ({
        ...f,
        mode: 'select',
        stuId: '',
        studentName: '',
        dob: '',
        age: '',
        diagnosis: '',
        grade: '',
        school: '',
      }));
      return;
    }

    const st = students.find(s => s.id === val);
    if (st) {
      const ageStr = st.dob ? calcAge(st.dob).formatted : (st.age || '');
      setForm(f => ({
        ...f,
        mode: 'select',
        stuId: st.id,
        studentName: st.name || '',
        dob: st.dob || '',
        age: ageStr,
        diagnosis: st.diagnosis || '',
        grade: st.grade || st.className || '',
        school: st.school || st.schoolName || '',
      }));
      setIsManualEdit(false);
    }
  }

  if (!isOpen) return null;

  // Active items based on selected subtest
  const currentItems = activeSubtest === 'receptive' ? PLS5_RECEPTIVE_ITEMS : PLS5_EXPRESSIVE_ITEMS;
  const currentPrefix = activeSubtest === 'receptive' ? 'r_' : 'e_';

  // Filtered items based on age filter & search
  const filteredItems = currentItems.filter(item => {
    const matchesAge = activeAgeFilter === 'all' || item.ageGroup === activeAgeFilter;
    const matchesSearch = !searchQuery || 
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.domain && item.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(item.id).includes(searchQuery);
    return matchesAge && matchesSearch;
  });

  // Handle score change for an item
  function handleScoreSelect(itemId, value) {
    const key = `${currentPrefix}${itemId}`;
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [key]: value,
      },
    }));
  }

  // Handle note change for an item
  function handleItemNoteChange(itemId, text) {
    const key = `${currentPrefix}${itemId}`;
    setForm(prev => ({
      ...prev,
      itemNotes: {
        ...prev.itemNotes,
        [key]: text,
      },
    }));
  }

  // Auto-credit all items prior to the Basal index as 1
  function autoCreditBasal() {
    const basalIdx = activeSubtest === 'receptive' ? psychometrics.receptiveBasalIndex : psychometrics.expressiveBasalIndex;
    if (basalIdx <= 0) {
      toast?.('لم يتم تحديد خط قاعدي (Basal) بعد. يتطلب 3 إجابات صحيحة متتالية.', 'warning');
      return;
    }

    const updated = { ...form.scores };
    for (let i = 1; i <= basalIdx; i++) {
      updated[`${currentPrefix}${i}`] = 1;
    }

    setForm(prev => ({ ...prev, scores: updated }));
    toast?.(`تم اعتماد وتأكيد البنود السابقة للخط القاعدي (1 إلى ${basalIdx}) كإتقان تام (1) بنجاح ✓`, 'success');
  }

  // Auto-zero all items after the Ceiling index as 0
  function autoZeroCeiling() {
    const ceilIdx = activeSubtest === 'receptive' ? psychometrics.receptiveCeilingIndex : psychometrics.expressiveCeilingIndex;
    if (ceilIdx === -1) {
      toast?.('لم يتم الوصول إلى سقف التوقف (Ceiling) بعد. يتطلب 6 إخفاقات متتالية.', 'warning');
      return;
    }

    const stopItem = ceilIdx + 6;
    const updated = { ...form.scores };
    for (let i = stopItem + 1; i <= 40; i++) {
      updated[`${currentPrefix}${i}`] = 0;
    }

    setForm(prev => ({ ...prev, scores: updated }));
    toast?.(`تم تصفير واعتماد البنود اللاحقة لسقف التوقف (${stopItem + 1} إلى 40) كـ 0 بنجاح ✓`, 'success');
  }

  // Auto fill sample simulation
  function autoFillSample(profile = 'mild') {
    const newScores = {};
    
    // Receptive Subtest simulation
    PLS5_RECEPTIVE_ITEMS.forEach(it => {
      let score = 0;
      if (profile === 'normal') {
        score = it.id <= 32 ? 1 : (it.id <= 35 ? (it.id % 2 === 0 ? 1 : 0) : 0);
      } else if (profile === 'mild') {
        score = it.id <= 22 ? 1 : (it.id <= 26 ? (it.id % 2 === 1 ? 1 : 0) : 0);
      } else if (profile === 'moderate') {
        score = it.id <= 14 ? 1 : (it.id <= 18 ? (it.id % 2 === 0 ? 1 : 0) : 0);
      } else if (profile === 'severe') {
        score = it.id <= 6 ? 1 : (it.id <= 9 ? (it.id % 2 === 1 ? 1 : 0) : 0);
      }
      newScores[`r_${it.id}`] = score;
    });

    // Expressive Subtest simulation
    PLS5_EXPRESSIVE_ITEMS.forEach(it => {
      let score = 0;
      if (profile === 'normal') {
        score = it.id <= 30 ? 1 : (it.id <= 33 ? (it.id % 2 === 0 ? 1 : 0) : 0);
      } else if (profile === 'mild') {
        score = it.id <= 20 ? 1 : (it.id <= 24 ? (it.id % 2 === 0 ? 1 : 0) : 0);
      } else if (profile === 'moderate') {
        score = it.id <= 12 ? 1 : (it.id <= 16 ? (it.id % 2 === 1 ? 1 : 0) : 0);
      } else if (profile === 'severe') {
        score = it.id <= 5 ? 1 : (it.id <= 8 ? (it.id % 2 === 0 ? 1 : 0) : 0);
      }
      newScores[`e_${it.id}`] = score;
    });

    setForm(prev => ({
      ...prev,
      scores: newScores,
    }));

    toast?.(`تم توليد نموذج درجات تجريبية بنجاح (${profile === 'normal' ? 'أداء طبيعي' : profile === 'mild' ? 'تأخر بسيط' : profile === 'moderate' ? 'تأخر متوسط' : 'تأخر شديد'})`, 'info');
  }

  // Clear all scores
  function handleResetScores() {
    if (window.confirm('هل أنت متأكد من تصفير جميع درجات هذا المقياس؟')) {
      setForm(prev => ({
        ...prev,
        scores: {},
        itemNotes: {},
        clinicalSummary: '',
        recommendations: '',
      }));
      toast?.('تم تصفير جميع الاستجابات بنجاح.', 'info');
    }
  }

  // Auto-generate Clinical Summary and Recommendations
  function handleGenerateClinicalReport() {
    const ageYears = Math.floor(studentAgeMonths / 12);
    const ageRemMonths = studentAgeMonths % 12;
    const studentTitle = form.studentName || 'المفحوص';

    const summary = `تم تطبيق مقياس لغة الأطفال - الإصدار الخامس (PLS-5) المقنن على الطفل (${studentTitle}) في عمر زمني (${ageYears} سنة و ${ageRemMonths} شهر).
أظهرت النتائج السيكومترية الكلية الآتي:
- الدرجة المعيارية الكلية المركبة للغة (Total Language SS): ${psychometrics.totalSS} (الرتبة المئينية: ${psychometrics.totalPR}%).
- الفهم السمعي / اللغة الاستقبالية (AC Standard Score): ${psychometrics.receptiveSS} (الرتبة المئينية: ${psychometrics.receptivePR}%، العمر المكافئ: ${Math.floor(psychometrics.receptiveLAEMonths / 12)}س و${psychometrics.receptiveLAEMonths % 12}ش).
- التواصل اللفظي / اللغة التعبيرية (EC Standard Score): ${psychometrics.expressiveSS} (الرتبة المئينية: ${psychometrics.expressivePR}%، العمر المكافئ: ${Math.floor(psychometrics.expressiveLAEMonths / 12)}س و${psychometrics.expressiveLAEMonths % 12}ش).
- العمر اللغوي المكافئ الكلي (Total LAE): ${Math.floor(psychometrics.totalLAEMonths / 12)} سنة و ${psychometrics.totalLAEMonths % 12} شهر، مع فجوة تأخر نمائي تبلغ (${psychometrics.totalDelayGapMonths} شهراً).
- التصنيف الإكلينيكي: يقع أداء المفحوص في نطاق [${psychometrics.clinicalClassification}].`;

    const recs = `1. إدراج أهداف التدخل اللغوي الفردية المستخرجة من بنود الضعف في الخطة التربوية الفردية (IEP).
2. التركيز على مهارات الفهم السمعي واتباع الأوامر المركبة والمفاهيم المكانية والعلاقات المنطقية عبر الوسائل البصرية والمجسمات.
3. تنمية الحصيلة التعبيرية اللفظية، وتركيب الجمل السردية المتسلسلة واستخدام الضمائر وقواعد اللغة الوظيفية.
4. تطبيق استراتيجيات النمذجة اللفظية والتمديد اللغوي (Expansion) أثناء جلسات التخاطب اليومية والبيئة الصفية.
5. إشراك الأسرة في برنامج الإثراء اللغوي المنزلي، وإعادة تقييم النمو اللغوي بعد 6 أشهر لمتابعة التقدم النمائي.`;

    setForm(prev => ({
      ...prev,
      clinicalSummary: summary,
      recommendations: recs,
    }));

    toast?.('تم توليد التقرير الإكلينيكي والتوصيات التأهيلية تلقائياً بنجاح ✓', 'success');
  }

  // Save Assessment
  function handleSave(andOpenReport = false) {
    if (!form.studentName) {
      toast?.('يرجى تحديد أو إدخال اسم الطالب/المفحوص أولاً.', 'error');
      return;
    }

    const recScores = {};
    const expScores = {};
    Object.entries(form.scores).forEach(([k, v]) => {
      if (k.startsWith('r_')) recScores[k.replace('r_', '')] = v;
      if (k.startsWith('e_')) expScores[k.replace('e_', '')] = v;
    });

    const record = {
      id: form.id || uid(),
      measureId: 'pls_5',
      measureName: PLS5_COPYRIGHT_INFO.measureNameAr,
      measureNameEn: PLS5_COPYRIGHT_INFO.measureNameEn,
      stuId: form.stuId || '',
      studentName: form.studentName,
      dob: form.dob,
      age: form.age || `${Math.floor(studentAgeMonths / 12)} سنة و ${studentAgeMonths % 12} شهر`,
      diagnosis: form.diagnosis,
      grade: form.grade,
      school: form.school,
      raterName: form.raterName,
      raterRelation: form.raterRelation,
      examinerName: form.examinerName,
      specialistName: form.examinerName,
      date: form.date || todayStr(),
      scores: form.scores,
      results: form.scores,
      resultsReceptive: recScores,
      resultsExpressive: expScores,
      itemNotes: form.itemNotes,
      psychometrics: {
        receptiveRawScore: psychometrics.receptiveRawScore,
        expressiveRawScore: psychometrics.expressiveRawScore,
        totalRawScore: psychometrics.totalRawScore,
        totalSS: psychometrics.totalSS,
        receptiveSS: psychometrics.receptiveSS,
        expressiveSS: psychometrics.expressiveSS,
        totalPR: psychometrics.totalPR,
        receptivePR: psychometrics.receptivePR,
        expressivePR: psychometrics.expressivePR,
        totalLAEMonths: psychometrics.totalLAEMonths,
        receptiveLAEMonths: psychometrics.receptiveLAEMonths,
        expressiveLAEMonths: psychometrics.expressiveLAEMonths,
        totalDelayGapMonths: psychometrics.totalDelayGapMonths,
        clinicalClassification: psychometrics.clinicalClassification,
        severityColor: psychometrics.severityColor,
      },
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      notes: form.notes,
      updatedAt: new Date().toISOString(),
    };

    if (form.id) {
      lsUpd('assessments', record);
      toast?.('تم تحديث تقييم PLS-5 بنجاح ✓', 'success');
    } else {
      record.createdAt = new Date().toISOString();
      lsAdd('assessments', record);
      toast?.('تم حفظ تقييم PLS-5 الجديد بنجاح ✓', 'success');
    }

    onSaved?.(record);
    onClose();
  }

  // Count answered items
  const answeredCount = Object.keys(form.scores).length;
  const receptiveAnswered = Object.keys(form.scores).filter(k => k.startsWith('r_')).length;
  const expressiveAnswered = Object.keys(form.scores).filter(k => k.startsWith('e_')).length;

  return (
    <div className="mbg" style={{ zIndex: 1050 }}>
      <div
        className="mb"
        style={{
          maxWidth: '1180px',
          width: '96%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'var(--bg-card)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)',
            color: '#ffffff',
            padding: '16px 22px',
            position: 'relative',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                🗣️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    {PLS5_COPYRIGHT_INFO.measureNameAr}
                  </h2>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}
                  >
                    الإصدار الإكلينيكي المقنن
                  </span>
                  <span
                    style={{
                      background: '#cffafe',
                      color: '#0e7490',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}
                  >
                    الفئة: {PLS5_COPYRIGHT_INFO.ageRange}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', opacity: 0.92, color: '#ecfeff' }}>
                  {PLS5_COPYRIGHT_INFO.measureNameEn} — تقييم شامل للفهم السمعي والتواصل اللفظي
                </p>
              </div>
            </div>

            {/* Quick Actions & Header Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setShowCopyrightDetails(!showCopyrightDetails)}
                style={{
                  background: showCopyrightDetails ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                  color: showCopyrightDetails ? '#0e7490' : '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ⚖️ حقوق المقياس والتقنين
              </button>

              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
                title={isHeaderCollapsed ? 'إظهار بيانات المفحوص' : 'طي بيانات المفحوص'}
              >
                {isHeaderCollapsed ? '🔽 إظهار البيانات' : '🔼 إخفاء البيانات'}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: 'none',
                  color: '#ffffff',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* COPYRIGHT ACCORDION PANEL */}
          {showCopyrightDetails && (
            <div
              style={{
                marginTop: 14,
                padding: '12px 16px',
                background: 'var(--g0)',
                color: 'var(--text-main)',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0891b2', fontWeight: 800, marginBottom: 4 }}>
                <span>📜 بيانات المقياس والاعتماد الأكاديمي:</span>
              </div>
              <div>
                <b>المؤلفون:</b> {PLS5_COPYRIGHT_INFO.authorsAr} ({PLS5_COPYRIGHT_INFO.authorsEn}) · <b>الناشر:</b> {PLS5_COPYRIGHT_INFO.publisher}
              </div>
              <div>
                <b>التقنين:</b> {PLS5_COPYRIGHT_INFO.adaptation} · <b>المعايير:</b> {PLS5_COPYRIGHT_INFO.normSamples}
              </div>
              <div style={{ color: 'var(--text-sub)', marginTop: 4, fontSize: '0.76rem' }}>
                <b>قواعد الاختبار:</b> {PLS5_COPYRIGHT_INFO.basalCeilingRules}
              </div>
            </div>
          )}
        </div>

        {/* LIVE PSYCHOMETRIC SUMMARY STRIP */}
        <div
          style={{
            background: 'var(--g0)',
            padding: '10px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {/* Key Metric Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Total Standard Score */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '6px 12px',
                textAlign: 'center',
                minWidth: 85,
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>الدرجة الكلية (SS)</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.totalSS}
              </span>
            </div>

            {/* Total Percentile */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '6px 12px',
                textAlign: 'center',
                minWidth: 80,
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>الرتبة المئينية (PR)</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0891b2' }}>
                {psychometrics.totalPR}%
              </span>
            </div>

            {/* Receptive SS */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '6px 12px',
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>استقبالي (AC SS)</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0e7490' }}>
                {psychometrics.receptiveSS} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>({psychometrics.receptivePR}%)</small>
              </span>
            </div>

            {/* Expressive SS */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '6px 12px',
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>تعبيري (EC SS)</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
                {psychometrics.expressiveSS} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>({psychometrics.expressivePR}%)</small>
              </span>
            </div>

            {/* Age Equivalent LAE */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '6px 12px',
                textAlign: 'center',
                minWidth: 100,
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>العمر اللغوي (LAE)</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {Math.floor(psychometrics.totalLAEMonths / 12)}س و {psychometrics.totalLAEMonths % 12}ش
              </span>
            </div>

            {/* Delay Gap */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '6px 12px',
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>فجوة التأخر</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: psychometrics.totalDelayGapMonths > 0 ? '#dc2626' : '#059669' }}>
                {psychometrics.totalDelayGapMonths > 0 ? `${psychometrics.totalDelayGapMonths} شهراً` : 'لا يوجد تأخر'}
              </span>
            </div>
          </div>

          {/* Clinical Classification Banner */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--bg-card)',
              border: `1.5px solid ${psychometrics.severityColor}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: psychometrics.severityColor }}>
              {psychometrics.clinicalClassification}
            </span>
          </div>
        </div>

        {/* STUDENT & METADATA SECTION (COLLAPSIBLE) */}
        {!isHeaderCollapsed && (
          <div
            style={{
              padding: '14px 20px',
              background: 'var(--bg-card)',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {/* Student Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
                  اسم المفحوص / الطالب <span style={{ color: '#dc2626' }}>*</span>
                </label>
                {!isManualEdit ? (
                  <select
                    className="inp"
                    value={form.stuId || ''}
                    onChange={handleSelectStudent}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="">-- اختر طالباً من القائمة --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.dob ? calcAge(s.dob).formatted : s.age || '—'})
                      </option>
                    ))}
                    <option value="__other__">✏️ إدخال يدوي لطالب جديد...</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      type="text"
                      className="inp"
                      placeholder="اسم الطالب..."
                      value={form.studentName}
                      onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setIsManualEdit(false)}
                      title="العودة للقائمة"
                      style={{ fontSize: '0.75rem' }}
                    >
                      📋
                    </button>
                  </div>
                )}
              </div>

              {/* Date of Birth & Chronological Age */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
                  تاريخ الميلاد والعمر الزمني
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="date"
                    className="inp"
                    value={form.dob || ''}
                    onChange={e => {
                      const newDob = e.target.value;
                      const ageCalc = newDob ? calcAge(newDob) : null;
                      setForm(f => ({
                        ...f,
                        dob: newDob,
                        age: ageCalc ? ageCalc.formatted : f.age,
                      }));
                    }}
                    style={{ width: '55%', fontSize: '0.82rem' }}
                  />
                  <input
                    type="text"
                    className="inp"
                    placeholder="العمر الزمني"
                    value={form.age || ''}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    style={{ width: '45%', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Examiner Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
                  أخصائي التخاطب والفاحص
                </label>
                <input
                  type="text"
                  className="inp"
                  placeholder="اسم الأخصائي..."
                  value={form.examinerName}
                  onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Assessment Date & Diagnosis */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
                  تاريخ الجلسة والتشخيص
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="date"
                    className="inp"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ width: '50%', fontSize: '0.82rem' }}
                  />
                  <input
                    type="text"
                    className="inp"
                    placeholder="التشخيص الأولي"
                    value={form.diagnosis}
                    onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                    style={{ width: '50%', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTEST SELECTOR TABS & AGE MILESTONE BAR */}
        <div
          style={{
            background: 'var(--g0)',
            padding: '10px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {/* Subtest Switcher Tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {PLS5_SUBTESTS.map(st => {
              const isActive = activeSubtest === st.id;
              const subAnswered = st.id === 'receptive' ? receptiveAnswered : expressiveAnswered;
              const subBasal = st.id === 'receptive' ? psychometrics.receptiveBasalIndex : psychometrics.expressiveBasalIndex;
              const subCeil = st.id === 'receptive' ? psychometrics.receptiveCeilingIndex : psychometrics.expressiveCeilingIndex;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveSubtest(st.id)}
                  style={{
                    background: isActive ? (st.id === 'receptive' ? '#0891b2' : '#0284c7') : 'var(--bg-card)',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    border: `1.5px solid ${isActive ? (st.id === 'receptive' ? '#0891b2' : '#0284c7') : 'var(--border-color)'}`,
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 10px rgba(0, 0, 0, 0.12)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{st.id === 'receptive' ? '🎧' : '💬'}</span>
                  <span>{st.nameAr}</span>
                  <span
                    style={{
                      background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--g0)',
                      color: isActive ? '#ffffff' : 'var(--text-sub)',
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      borderRadius: 12,
                      fontWeight: 700,
                    }}
                  >
                    {subAnswered} / 40
                  </span>
                  {subBasal !== -1 && (
                    <span style={{ fontSize: '0.7rem', color: isActive ? '#cffafe' : '#059669', fontWeight: 800 }} title="تم تأسيس الخط القاعدي">
                      ✓ Basal
                    </span>
                  )}
                  {subCeil !== -1 && (
                    <span style={{ fontSize: '0.7rem', color: isActive ? '#fee2e2' : '#dc2626', fontWeight: 800 }} title="تم الوصول لسقف التوقف">
                      ⚠️ Ceiling
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Simulation & Helper Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>نماذج سريعة:</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => autoFillSample('normal')}
              style={{ fontSize: '0.74rem', padding: '4px 8px' }}
              title="محاكاة أداء لغوي طبيعي"
            >
              🟢 طبيعي
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => autoFillSample('mild')}
              style={{ fontSize: '0.74rem', padding: '4px 8px' }}
              title="محاكاة تأخر لغوي بسيط"
            >
              🟡 بسيط
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => autoFillSample('moderate')}
              style={{ fontSize: '0.74rem', padding: '4px 8px' }}
              title="محاكاة تأخر لغوي متوسط"
            >
              🟠 متوسط
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => autoFillSample('severe')}
              style={{ fontSize: '0.74rem', padding: '4px 8px' }}
              title="محاكاة تأخر لغوي شديد"
            >
              🔴 شديد
            </button>

            <button
              type="button"
              className="btn btn-sm"
              onClick={handleResetScores}
              style={{ fontSize: '0.74rem', padding: '4px 8px', color: '#dc2626' }}
              title="تصفير الاستجابات"
            >
              🔄 تصفير
            </button>
          </div>
        </div>

        {/* AGE FILTER PILLS & SEARCH / AUTO ACTIONS */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '10px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {/* Age Milestone Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)' }}>المرحلة النمائية:</span>
            {PLS5_AGE_GROUPS.map(grp => {
              const isSelected = activeAgeFilter === grp.id;
              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => setActiveAgeFilter(grp.id)}
                  style={{
                    background: isSelected ? '#0e7490' : 'var(--g0)',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    border: `1px solid ${isSelected ? '#0e7490' : 'var(--border-color)'}`,
                    borderRadius: 20,
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {grp.id === 'all' ? 'الكل (40)' : grp.id}
                </button>
              );
            })}
          </div>

          {/* Quick Basal / Ceiling Credit Actions & Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={autoCreditBasal}
              style={{
                fontSize: '0.74rem',
                padding: '4px 10px',
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                fontWeight: 700,
              }}
              title="اعتماد جميع البنود السابقة للخط القاعدي كـ 1 صحيح"
            >
              ✓ اعتماد ما قبل القاعدي (1)
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={autoZeroCeiling}
              style={{
                fontSize: '0.74rem',
                padding: '4px 10px',
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                fontWeight: 700,
              }}
              title="تصفير البنود اللاحقة لسقف التوقف كـ 0"
            >
              ⛔ تصفير ما بعد السقف (0)
            </button>

            <input
              type="text"
              className="inp"
              placeholder="🔍 بحث في البنود..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.78rem', padding: '4px 10px', width: 150 }}
            />
          </div>
        </div>

        {/* ITEMS LIST (SCROLLABLE) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            background: 'var(--g0)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {filteredItems.map(item => {
            const scoreKey = `${currentPrefix}${item.id}`;
            const currentScore = form.scores[scoreKey];
            const isScoredOne = currentScore === 1;
            const isScoredZero = currentScore === 0;
            const note = form.itemNotes[scoreKey] || '';

            // Check if item is starting item for this age
            const isStartItem = (activeSubtest === 'receptive' && startingPoints.receptiveStart === item.id) ||
                                (activeSubtest === 'expressive' && startingPoints.expressiveStart === item.id);

            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-card)',
                  border: `1.5px solid ${
                    isScoredOne ? '#10b981' : isScoredZero ? '#f87171' : 'var(--border-color)'
                  }`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  {/* Item Text & Metadata */}
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: isScoredOne ? '#10b981' : isScoredZero ? '#ef4444' : '#0e7490',
                          color: '#ffffff',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        بند #{item.id}
                      </span>
                      <span
                        style={{
                          background: 'var(--g0)',
                          color: 'var(--text-sub)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {item.ageGroup}
                      </span>
                      <span
                        style={{
                          background: 'rgba(14, 116, 144, 0.1)',
                          color: '#0e7490',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                        }}
                      >
                        {item.domain}
                      </span>
                      {isStartItem && (
                        <span
                          style={{
                            background: '#fef3c7',
                            color: '#b45309',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 12,
                            border: '1px solid #fde68a',
                          }}
                        >
                          ⭐ نقطة البداية الموصى بها لعمر الطالب
                        </span>
                      )}
                    </div>

                    <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {item.text}
                    </p>

                    {item.goal && isScoredZero && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: '0.76rem',
                          color: '#b91c1c',
                          background: '#fef2f2',
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid #fecaca',
                        }}
                      >
                        <b>🎯 الهدف التأهيلي المقترح:</b> {item.goal}
                      </div>
                    )}
                  </div>

                  {/* Score Selection Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleScoreSelect(item.id, 1)}
                      style={{
                        background: isScoredOne ? '#059669' : 'var(--g0)',
                        color: isScoredOne ? '#ffffff' : 'var(--text-main)',
                        border: `1.5px solid ${isScoredOne ? '#059669' : 'var(--border-color)'}`,
                        borderRadius: 8,
                        padding: '8px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s',
                        boxShadow: isScoredOne ? '0 4px 8px rgba(5, 150, 105, 0.25)' : 'none',
                      }}
                    >
                      <span>✓</span>
                      <span>1 - متقن / صحيح</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleScoreSelect(item.id, 0)}
                      style={{
                        background: isScoredZero ? '#dc2626' : 'var(--g0)',
                        color: isScoredZero ? '#ffffff' : 'var(--text-main)',
                        border: `1.5px solid ${isScoredZero ? '#dc2626' : 'var(--border-color)'}`,
                        borderRadius: 8,
                        padding: '8px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s',
                        boxShadow: isScoredZero ? '0 4px 8px rgba(220, 38, 38, 0.25)' : 'none',
                      }}
                    >
                      <span>✕</span>
                      <span>0 - غير متقن / خطأ</span>
                    </button>
                  </div>
                </div>

                {/* Item Notes Input */}
                <div>
                  <input
                    type="text"
                    className="inp"
                    placeholder="📝 ملاحظات نوعية على استجابة الطفل لهذا البند..."
                    value={note}
                    onChange={e => handleItemNoteChange(item.id, e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '4px 10px', width: '100%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* CLINICAL SUMMARY & RECOMMENDATIONS ACCORDION */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            padding: '12px 20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              📋 التقرير الإكلينيكي والتوصيات التأهيلية (PLS-5 Clinical Summary)
            </span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleGenerateClinicalReport}
              style={{
                fontSize: '0.76rem',
                background: '#0891b2',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 6,
              }}
            >
              ⚡ توليد التقرير والتوصيات تلقائياً
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <textarea
                className="inp"
                rows={2}
                placeholder="الملخص الإكلينيكي والتشخيصي للأداء اللغوي..."
                value={form.clinicalSummary}
                onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                style={{ width: '100%', fontSize: '0.8rem', resize: 'vertical' }}
              />
            </div>
            <div>
              <textarea
                className="inp"
                rows={2}
                placeholder="التوصيات التربوية والتأهيلية الموجهة للخطة الفردية (IEP)..."
                value={form.recommendations}
                onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                style={{ width: '100%', fontSize: '0.8rem', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            background: 'var(--g0)',
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 600 }}>
            إجمالي البنود المقيمة: <b>{answeredCount}</b> من أصل 80 بنداً (استقبالي: {receptiveAnswered} / تعبيري: {expressiveAnswered})
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{ fontSize: '0.86rem', padding: '8px 18px' }}
            >
              إلغاء
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSave(false)}
              style={{
                fontSize: '0.86rem',
                padding: '8px 22px',
                background: '#0891b2',
                borderColor: '#0891b2',
                color: '#ffffff',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>💾</span>
              <span>حفظ التقييم اللغوي</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
