import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  DOWN_SYNDROME_SCALES,
  DS_COPYRIGHT_INFO,
  DS_SCALE_3_OPTIONS,
  DS_YESNO_MEDICAL_OPTIONS,
  calculateDownSyndromeScore,
} from '../../data/downSyndromeData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import { sanitizeAssessmentForm } from '../../utils/sanitize';

const EMPTY_DS_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: 'متلازمة داون (Down Syndrome)',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'الأخصائي المتابع / المعلم',
  examinerName: '',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function DownSyndromeAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
  initialScaleId = 'ds_developmental',
}) {
  const { toast, currentUser } = useApp();

  const [selectedScaleId, setSelectedScaleId] = useState(() => {
    return initialData?.measureId || initialData?.scaleId || initialScaleId || 'ds_developmental';
  });

  const activeScale = useMemo(() => {
    return DOWN_SYNDROME_SCALES.find(s => s.id === selectedScaleId) || DOWN_SYNDROME_SCALES[0];
  }, [selectedScaleId]);

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_DS_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || initialData.responses || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_DS_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

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
        diagnosis: 'متلازمة داون (Down Syndrome)',
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
      diagnosis: stu.diagnosis || 'متلازمة داون (Down Syndrome)',
      age: calculatedAge || stu.age || '',
      grade: stu.grade || stu.className || '',
      school: stu.school || stu.schoolName || '',
    }));
  }

  // Real-time calculation for active scale
  const psychometrics = useMemo(() => {
    return calculateDownSyndromeScore(activeScale.id, form.scores);
  }, [activeScale.id, form.scores]);

  // Unique domains in active scale
  const availableDomains = useMemo(() => {
    const set = new Set((activeScale.items || []).map(it => it.domain).filter(Boolean));
    return Array.from(set);
  }, [activeScale]);

  const filteredItems = useMemo(() => {
    const items = activeScale.items || [];
    if (activeDomainFilter === 'all') return items;
    return items.filter(it => it.domain === activeDomainFilter);
  }, [activeScale, activeDomainFilter]);

  const options = activeScale.responseType === 'yesno_medical' ? DS_YESNO_MEDICAL_OPTIONS : DS_SCALE_3_OPTIONS;

  const totalAnsweredCount = useMemo(() => {
    const items = activeScale.items || [];
    return items.filter(it => form.scores[it.id] !== undefined && form.scores[it.id] !== null).length;
  }, [activeScale, form.scores]);

  if (!isOpen) return null;

  function handleScoreSelect(itemId, scoreValue) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: scoreValue,
      },
    }));
  }

  function handleItemNoteChange(itemId, noteText) {
    setForm(prev => ({
      ...prev,
      itemNotes: {
        ...prev.itemNotes,
        [itemId]: noteText,
      },
    }));
  }

  function autoFillSample(level = 'advanced') {
    const newScores = { ...form.scores };
    const items = activeScale.items || [];

    items.forEach(it => {
      if (level === 'advanced') {
        newScores[it.id] = (it.id % 5 === 0) ? 0.5 : 1.0;
      } else if (level === 'emerging') {
        newScores[it.id] = (it.id % 3 === 0) ? 0.0 : (it.id % 2 === 0 ? 0.5 : 1.0);
      } else if (level === 'intensive') {
        newScores[it.id] = (it.id % 4 === 0) ? 0.5 : 0.0;
      }
    });

    setForm(f => ({ ...f, scores: newScores }));
    toast(
      `⚡ تم تعبئة استجابات نموذجية (${level === 'advanced' ? 'أداء متقدم' : level === 'emerging' ? 'في طور الاكتساب' : 'بحاجة لتدخل مكثف'}) للمعاينة السريعة`,
      'ok'
    );
  }

  function applyAutoClinicalSummary() {
    if (totalAnsweredCount < 4) {
      toast('⚠️ يرجى تقييم 4 بنود على الأقل لتوليد التقرير والخلاصة الإكلينيكية', 'er');
      return;
    }

    const items = activeScale.items || [];
    const deficits = items.filter(it => (form.scores[it.id] ?? 0) <= 0.5);
    const mastered = items.filter(it => (form.scores[it.id] ?? 0) === 1.0);

    const deficitsText = deficits.length > 0
      ? `• مجالات الضعف والاحتياج ذات الأولوية للخطة الفردية (IEP):\n` + deficits.slice(0, 5).map(it => `  - ${it.text} (الهدف المقترح: ${it.iepGoal || 'تدريب مكثف'})`).join('\n')
      : '• كافة مهارات المقياس مكتسبة بنجاح تام وبدون نقاط ضعف بارزة.';

    const strengthsText = mastered.length > 0
      ? `• نقاط القوة النمائية والتأهيلية المكتسبة:\n` + mastered.slice(0, 5).map(it => `  - ${it.text}`).join('\n')
      : '• المهارات قيد التأسيس والتطوير.';

    const suggestedSummary = `تقرير فحص وتقييم: ${activeScale.name}\n` +
      `وفق المعايير النمائية والتأهيلية لمتلازمة داون:\n\n` +
      `- إجمالي الدرجة المحققة: (${psychometrics.score} من ${psychometrics.maxScore}) بنسبة إتقان (${psychometrics.percentage}%).\n` +
      `- المستوى النمائي والتشخيصي: [${psychometrics.level}].\n` +
      `- عدد البنود المقيمة: (${totalAnsweredCount} من ${items.length} بنود).\n\n` +
      `${strengthsText}\n\n` +
      `${deficitsText}\n\n` +
      `التوصيات العامة: إدراج بنود الاحتياج غير المكتسبة ضمن خطة التدخل المبكر وتأهيل متلازمة داون وتطبيق استراتيجيات التكامل الحسي والعلاج الطبيعي والوظيفي المساند.`;

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: deficits.map(d => d.iepGoal).filter(Boolean).slice(0, 4).join(' | '),
    }));

    toast('✨ تم توليد الخلاصة السريرية والأهداف التربوية المقترحة بنجاح', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار أو كتابة اسم الطالب أولاً', 'er');
      return;
    }

    const cleanedForm = sanitizeAssessmentForm(form);
    const payloadId = initialData?.id || form.id || uid();
    const studentIdVal = cleanedForm.stuId || cleanedForm.studentId || '';

    const payload = {
      ...cleanedForm,
      id: payloadId,
      assessmentId: payloadId,
      studentId: studentIdVal,
      stuId: studentIdVal,
      measureId: activeScale.id,
      measureName: activeScale.name,
      measureNameEn: activeScale.nameEn,
      category: 'down_syndrome',
      isDownSyndrome: true,
      scaleType: 'down_syndrome',
      score: psychometrics.score,
      maxScore: psychometrics.maxScore,
      percentage: `${psychometrics.percentage}%`,
      percentageNum: psychometrics.percentage,
      level: psychometrics.level,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      responses: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations || form.notes,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast(`✅ تم تحديث نتيجة ${activeScale.name} بنجاح`, 'ok');
    } else {
      lsAdd('studentAssessments', payload);
      toast(`✅ تم حفظ نتيجة ${activeScale.name} بنجاح (${psychometrics.score}/${psychometrics.maxScore})`, 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
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
        }}
      >
        {/* MODAL HEADER */}
        <div
          className="modal-header-custom"
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.12), rgba(6, 182, 212, 0.04))',
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
                background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(8, 145, 178, 0.3)',
              }}
            >
              🧬
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  منظومة تقييم وتشخيص متلازمة داون
                </h2>
                <span className="bdg b-bl" style={{ fontSize: '.72rem', fontWeight: 700 }}>
                  بطارية الـ 14 مقياساً النمائية
                </span>
                <span className="bdg b-gr" style={{ fontSize: '.72rem', fontWeight: 600 }}>
                  Easy Center Clinical Edition
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)', marginTop: 2 }}>
                {activeScale.name} — ({activeScale.items?.length || 0} بنداً تشخيصياً)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setShowCopyrightDetails(!showCopyrightDetails)}
              style={{
                background: showCopyrightDetails ? '#0891b2' : 'rgba(8, 145, 178, 0.15)',
                color: showCopyrightDetails ? '#fff' : '#0e7490',
                border: '1px solid #0891b2',
                fontWeight: 700,
                fontSize: '.78rem',
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق المقياس' : 'إظهار حقوق المقياس'}
            </button>
            <button
              type="button"
              className="btn btn-xs btn-p"
              onClick={onClose}
              style={{ fontWeight: 700 }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          {/* EXPANDABLE DYNAMIC COPYRIGHT & SCIENTIFIC CITATIONS CARD */}
          {showCopyrightDetails && (
            <div
              style={{
                background: '#fffdf5',
                border: '1.5px solid #fcd34d',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 16,
                fontSize: '.82rem',
                color: '#78350f',
                lineHeight: 1.6,
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '.92rem', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لـ {activeScale.name}:
                </span>
                <span
                  style={{ cursor: 'pointer', opacity: 0.7, fontSize: '.8rem', fontWeight: 600 }}
                  onClick={() => setShowCopyrightDetails(false)}
                >
                  ✖ إخفاء
                </span>
              </div>

              {/* Top Banner Notice */}
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: '.8rem',
                  color: '#92400e',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                  <div>
                    <strong>إشعار حقوق الملكية الفكرية والاعتماد العلمي:</strong> {activeScale.name} — إعداد {activeScale.originalAuthor || 'المؤسسات العلمية المعنية'} · {activeScale.adaptationAndNorms || 'معايير التأهيل المقننة'}.
                  </div>
                </div>
                <span style={{ fontSize: '.72rem', background: '#fef3c7', padding: '3px 8px', borderRadius: 6, border: '1px solid #fcd34d', fontWeight: 700 }}>
                  {activeScale.diagnosticNature || 'مخصص للتشخيص والتقييم التربوي والنمائي المعتمد'}
                </span>
              </div>

              {/* 4 Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 10 }}>
                <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <strong>المؤلف الأصلي / الجهة:</strong> {activeScale.originalAuthor || 'المرجعيات النمائية العالمية'}
                </div>
                <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <strong>التقنين والتكييف:</strong> {activeScale.adaptationAndNorms || 'النسخ المقننة لمتلازمة داون'}
                </div>
                <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <strong>صفة التشخيص:</strong> {activeScale.diagnosticNature || 'مخصص للتشخيص والتقييم التربوي والنمائي المعتمد'}
                </div>
                <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <strong>المشغل الرقمي:</strong> {activeScale.hostPlatform || 'منصة إيزي سنتر لتشغيل وتطبيق المقاييس الرقمية (Host Platform)'}
                </div>
              </div>

              {/* Notice text */}
              <div style={{ fontSize: '.78rem', color: '#92400e', background: '#fef3c7', padding: '8px 12px', borderRadius: 8 }}>
                {activeScale.copyrightNotice}
              </div>
            </div>
          )}

          {/* SCALE PICKER TABS BAR (14 SCALES SWITCHER) */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '.84rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📑 اختيار المقياس المطلوب تطبيقه من بطارية متلازمة داون:</span>
                <span className="bdg b-bl" style={{ fontSize: '.7rem' }}>14 مقياساً</span>
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingBottom: 6,
                scrollbarWidth: 'thin',
              }}
            >
              {DOWN_SYNDROME_SCALES.map((s, idx) => {
                const isCurrent = s.id === selectedScaleId;
                const itemsCount = s.items?.length || 0;
                const answered = (s.items || []).filter(it => form.scores[it.id] !== undefined).length;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedScaleId(s.id);
                      setActiveDomainFilter('all');
                    }}
                    style={{
                      flexShrink: 0,
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: isCurrent ? '2px solid #0891b2' : '1px solid var(--border-color)',
                      background: isCurrent ? 'linear-gradient(135deg, rgba(8, 145, 178, 0.15), rgba(6, 182, 212, 0.05))' : 'var(--g0)',
                      color: isCurrent ? '#0e7490' : 'var(--text-main)',
                      fontWeight: isCurrent ? 800 : 600,
                      fontSize: '.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{s.icon || '🧬'}</span>
                    <span>{idx + 1}. {s.name.split('(')[0].trim()}</span>
                    {answered > 0 && (
                      <span
                        className="bdg"
                        style={{
                          background: answered === itemsCount ? '#d1fae5' : '#fef3c7',
                          color: answered === itemsCount ? '#065f46' : '#92400e',
                          fontSize: '.65rem',
                          padding: '1px 5px',
                        }}
                      >
                        {answered}/{itemsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STUDENT & EXAMINER PROFILE CARD WITH TOGGLE */}
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
                  بيانات الطالب والأخصائي الفاحص:
                </span>
                {form.studentName && (
                  <span className="bdg b-bl" style={{ fontSize: '.76rem', fontWeight: 700 }}>
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
                    <label>اختيار المستفيد / الطالب <span style={{ color: 'red' }}>*</span></label>
                    <select
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">— اختر طالباً مسجلاً —</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.diagnosis ? `(${s.diagnosis})` : ''}
                        </option>
                      ))}
                      <option value="__other__">➕ طالب أو مفحوص خارجي جديد</option>
                    </select>
                  </div>

                  {form.mode === 'other' && (
                    <div className="fl">
                      <label>اسم المفحوص الخارجي</label>
                      <input
                        type="text"
                        placeholder="اسم الطالب..."
                        value={form.studentName}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="fl">
                    <label>العمر الزمني</label>
                    <input
                      type="text"
                      placeholder="مثال: 5 سنوات و 3 أشهر"
                      value={form.age}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    />
                  </div>

                  <div className="fl">
                    <label>التشخيص والنمط</label>
                    <input
                      type="text"
                      value={form.diagnosis}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="fg c3">
                  <div className="fl">
                    <label>الأخصائي الفاحص</label>
                    <select
                      value={form.examinerName}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    >
                      <option value="">— حدد الأخصائي —</option>
                      {emps.map(emp => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name} ({emp.role || 'أخصائي'})
                        </option>
                      ))}
                      {currentUser?.name && !emps.some(e => e.name === currentUser.name) && (
                        <option value={currentUser.name}>{currentUser.name}</option>
                      )}
                    </select>
                  </div>

                  <div className="fl">
                    <label>مصدر المعلومات (المجيب / ولي الأمر)</label>
                    <input
                      type="text"
                      placeholder="مثال: الأم / المعلمة / الأخصائي"
                      value={form.raterRelation}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    />
                  </div>

                  <div className="fl">
                    <label>تاريخ الفحص والتطبيق</label>
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

          {/* REAL-TIME DIAGNOSTIC & PSYCHOMETRIC PERFORMANCE CONTAINER (حاوية الأداء الفورية) */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.08), rgba(6, 182, 212, 0.02))',
              border: '2px solid #0891b2',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <span style={{ fontWeight: 800, fontSize: '.96rem', color: 'var(--text-main)' }}>
                  المؤشرات السيكومترية والنمائية الفورية ({activeScale.name.split('(')[0].trim()}):
                </span>
              </div>

              {/* Fast Sample Auto-fill buttons */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => autoFillSample('advanced')}
                  style={{ background: '#059669', color: '#fff', fontSize: '.7rem', fontWeight: 700 }}
                  title="تعبئة بنتيجة متقدمة"
                >
                  ⚡ نموذج متقدم
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => autoFillSample('emerging')}
                  style={{ background: '#d97706', color: '#fff', fontSize: '.7rem', fontWeight: 700 }}
                  title="تعبئة بنتيجة متوسطة"
                >
                  ⚡ نموذج متوسط
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => autoFillSample('intensive')}
                  style={{ background: '#dc2626', color: '#fff', fontSize: '.7rem', fontWeight: 700 }}
                  title="تعبئة بحاجة لتدخل مكثف"
                >
                  ⚡ تدخل مكثف
                </button>
              </div>
            </div>

            {/* 4 Score Highlights Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 12 }}>
              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>الدرجة المحققة</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0891b2' }}>
                  {psychometrics.score} <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>/ {psychometrics.maxScore}</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>نسبة التطور والإتقان</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: psychometrics.severityColor }}>
                  {psychometrics.percentage}%
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>المستوى النمائي والتشخيصي</div>
                <div style={{ fontSize: '.88rem', fontWeight: 800, color: psychometrics.severityColor, marginTop: 4 }}>
                  {psychometrics.level}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>البنود المقيمة</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {totalAnsweredCount} <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>/ {activeScale.items?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: 8, background: 'var(--g0)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, psychometrics.percentage)}%`,
                  height: '100%',
                  background: psychometrics.severityColor,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', marginTop: 6, textAlign: 'left', direction: 'rtl' }}>
              {activeScale.thresholdText}
            </div>
          </div>

          {/* DOMAIN FILTER BUTTONS (IF MULTIPLE DOMAINS EXIST) */}
          {availableDomains.length > 1 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-sub)' }}>المجالات:</span>
              <button
                type="button"
                className={`btn btn-xs ${activeDomainFilter === 'all' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '.74rem', fontWeight: 700 }}
              >
                الكل ({activeScale.items?.length || 0})
              </button>
              {availableDomains.map(d => {
                const count = (activeScale.items || []).filter(it => it.domain === d).length;
                return (
                  <button
                    key={d}
                    type="button"
                    className={`btn btn-xs ${activeDomainFilter === d ? 'btn-p' : 'btn-g'}`}
                    onClick={() => setActiveDomainFilter(d)}
                    style={{ fontSize: '.74rem', fontWeight: 700 }}
                  >
                    {d} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* ITEMS LIST WORKSTATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map((item, idx) => {
              const currentScore = form.scores[item.id];
              const note = form.itemNotes[item.id] || '';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined ? '1.5px solid #0891b2' : '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span className="bdg b-bl" style={{ fontSize: '.7rem', fontWeight: 800 }}>
                          بند {item.id}
                        </span>
                        {item.domain && (
                          <span className="bdg b-gr" style={{ fontSize: '.68rem', fontWeight: 600 }}>
                            {item.domain}
                          </span>
                        )}
                        {item.iepGoal && (
                          <span className="bdg" style={{ background: '#fef3c7', color: '#b45309', fontSize: '.68rem', fontWeight: 600 }}>
                            🎯 هدف IEP متاح
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.45 }}>
                        {item.text}
                      </div>
                      {item.iepGoal && (
                        <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginTop: 4, fontStyle: 'italic' }}>
                          💡 الهدف الإجرائي: {item.iepGoal}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating Options Pills */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {options.map((opt) => {
                      const isSelected = currentScore === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleScoreSelect(item.id, opt.value)}
                          style={{
                            flex: '1 1 auto',
                            minWidth: 140,
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: isSelected ? '2px solid #0891b2' : '1px solid var(--border-color)',
                            background: isSelected ? 'linear-gradient(135deg, #0891b2, #0e7490)' : 'var(--g0)',
                            color: isSelected ? '#fff' : 'var(--text-main)',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{opt.label}</span>
                          <span style={{ fontSize: '.72rem', opacity: isSelected ? 0.9 : 0.6, fontWeight: 800 }}>
                            ({opt.score} ن)
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Clinical note toggle / input for this item */}
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="ملاحظات الأخصائي على استجابة هذا البند (اختياري)..."
                      value={note}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '.76rem',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px dashed var(--border-color)',
                        background: 'transparent',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* CLINICAL SUMMARY & RECOMMENDATIONS WORKSTATION */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝 الخلاصة الإكلينيكية والتوصيات العلاجية:</span>
              </div>

              <button
                type="button"
                className="btn btn-xs"
                onClick={applyAutoClinicalSummary}
                style={{
                  background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '.76rem',
                  padding: '6px 12px',
                  borderRadius: 8,
                }}
              >
                ✨ توليد الخلاصة والأهداف تلقائياً من الاستجابات
              </button>
            </div>

            <div className="fl full" style={{ marginBottom: 10 }}>
              <label>التقرير التشخيصي والخلاصة النمائية</label>
              <textarea
                rows={4}
                value={form.clinicalSummary}
                onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                placeholder="الخلاصة الإكلينيكية لمستوى تطور الطفل في هذا المقياس..."
                style={{ fontSize: '.82rem', lineHeight: 1.5 }}
              />
            </div>

            <div className="fl full">
              <label>توصيات الخطة التربوية الفردية (IEP Goals)</label>
              <textarea
                rows={2}
                value={form.recommendations}
                onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                placeholder="التوصيات والأهداف المقترحة للدمج والتدريب والتأهيل..."
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
            الدرجة الكلية: <b style={{ color: '#0891b2' }}>{psychometrics.score}/{psychometrics.maxScore}</b> ({psychometrics.percentage}%) — <b style={{ color: psychometrics.severityColor }}>{psychometrics.level}</b>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                borderColor: '#0891b2',
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
              onClick={onClose}
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
