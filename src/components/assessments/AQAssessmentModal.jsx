import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  AQ_ITEMS,
  AQ_DOMAINS,
  AQ_RESPONSE_OPTIONS,
  AQ_COPYRIGHT_INFO,
  calculateAQPsychometrics,
} from '../../data/aqData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_AQ_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  gender: 'ذكر',
  version: 'child', // 'child' (4-11y) or 'adolescent' (12-16y)
  raterName: '',
  raterRelation: 'ولي الأمر (الأم / الأب)',
  examinerName: '',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function AQAssessmentModal({
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
        ...EMPTY_AQ_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
        version: initialData.version || initialData.aqVersion || 'child',
      };
    }
    return {
      ...EMPTY_AQ_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
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
        diagnosis: '',
      }));
      return;
    }
    const st = students.find(s => String(s.id) === String(val));
    if (!st) {
      setForm(f => ({ ...f, stuId: '', studentName: '' }));
      return;
    }
    const valErr = validateStudentPick(st);
    if (valErr) {
      toast?.(valErr, 'err');
      return;
    }
    const computedAge = st.dob ? calcAge(st.dob) : (st.age || '');
    
    // Auto-select version based on age if possible
    let suggestedVersion = 'child';
    const ageNum = parseInt(computedAge, 10);
    if (!isNaN(ageNum) && ageNum >= 12) {
      suggestedVersion = 'adolescent';
    }

    setForm(f => ({
      ...f,
      mode: 'registered',
      stuId: st.id,
      studentName: st.name || '',
      dob: st.dob || '',
      age: computedAge,
      gender: st.gender || 'ذكر',
      diagnosis: st.diagnosis || st.disabilityType || 'طيف التوحد',
      version: suggestedVersion,
    }));
  }

  function handleAnswer(itemId, answerValue) {
    setForm(prev => {
      const newScores = { ...prev.scores, [itemId]: answerValue };
      return { ...prev, scores: newScores };
    });
  }

  function handleItemNoteChange(itemId, text) {
    setForm(prev => ({
      ...prev,
      itemNotes: {
        ...prev.itemNotes,
        [itemId]: text,
      },
    }));
  }

  const psychometrics = useMemo(() => {
    return calculateAQPsychometrics(form.scores, form.version);
  }, [form.scores, form.version]);

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return AQ_ITEMS;
    return AQ_ITEMS.filter(it => it.domainId === activeDomainFilter);
  }, [activeDomainFilter]);

  function handleSave() {
    if (!form.studentName.trim()) {
      toast?.('يرجى تحديد أو إدخال اسم الطالب أولاً', 'err');
      return;
    }

    const answeredCount = Object.keys(form.scores).filter(k => form.scores[k]).length;
    if (answeredCount === 0) {
      toast?.('يرجى تقييم بنود المقياس قبل الحفظ', 'err');
      return;
    }

    const assessmentRecord = {
      id: initialData?.id || uid('aq'),
      measureId: 'aq',
      measureName: `مقياس طيف التوحد للأطفال واليافعين (AQ) — ${form.version === 'adolescent' ? 'نسخة اليافعين' : 'نسخة الأطفال'}`,
      scaleType: 'aq',
      category: 'autism',
      version: form.version,
      versionLabel: form.version === 'adolescent' ? 'نسخة اليافعين (12–16 سنة)' : 'نسخة الأطفال (4–11 سنة)',
      stuId: form.stuId || '',
      studentName: form.studentName,
      dob: form.dob,
      age: form.age,
      gender: form.gender,
      diagnosis: form.diagnosis,
      raterName: form.raterName,
      raterRelation: form.raterRelation,
      examinerName: form.examinerName,
      date: form.date,
      scores: form.scores,
      results: form.scores,
      itemNotes: form.itemNotes,
      score: psychometrics.totalScore,
      rawScore: psychometrics.totalScore,
      maxScore: 50,
      cutoff: psychometrics.cutoffScore,
      isAboveCutoff: psychometrics.isAboveCutoff,
      level: psychometrics.severityLabel,
      severityColor: psychometrics.severityColor,
      riskLevel: psychometrics.riskLevel,
      domainScores: psychometrics.domainScores,
      domainBreakdown: psychometrics.domainBreakdown,
      psychometrics,
      notes: form.notes,
      clinicalSummary: form.clinicalSummary || psychometrics.clinicalSummary,
      recommendations: form.recommendations,
      copyright: AQ_COPYRIGHT_INFO,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('assessments', initialData.id, assessmentRecord);
      toast?.('تم تحديث تقييم مقياس AQ بنجاح ✨', 'ok');
    } else {
      assessmentRecord.createdAt = new Date().toISOString();
      lsAdd('assessments', assessmentRecord);
      toast?.('تم حفظ تقييم مقياس AQ بنجاح في السجل الإكلينيكي ✨', 'ok');
    }

    if (onSaved) onSaved(assessmentRecord);
    onClose();
  }

  function handleAutoFill(type = 'autistic') {
    const mock = {};
    AQ_ITEMS.forEach(it => {
      if (type === 'autistic') {
        mock[it.id] = it.keying === 'AGREE' ? 'def_agree' : 'def_disagree';
      } else if (type === 'typical') {
        mock[it.id] = it.keying === 'AGREE' ? 'def_disagree' : 'def_agree';
      } else {
        // borderline
        const r = Math.random();
        if (r > 0.5) {
          mock[it.id] = it.keying === 'AGREE' ? 'slight_agree' : 'slight_disagree';
        } else {
          mock[it.id] = it.keying === 'AGREE' ? 'slight_disagree' : 'slight_agree';
        }
      }
    });
    setForm(f => ({ ...f, scores: mock }));
    toast?.(`تمت التعبئة السريعة للنموذج (${type === 'autistic' ? 'سمات توحد مرتفعة' : type === 'typical' ? 'أداء نمطي سليم' : 'حالة حدية'})`, 'ok');
  }

  function handleReset() {
    if (window.confirm('هل تريد حقاً مسح كافة إجابات الاستبيان والبدء من جديد؟')) {
      setForm(f => ({ ...f, scores: {}, itemNotes: {} }));
      toast?.('تمت إعادة ضبط النموذج', 'ok');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="mbg" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="mb"
        style={{
          maxWidth: 1100,
          width: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: 'var(--bg-main, #ffffff)',
        }}
      >
        {/* HEADER */}
        <div
          className="mhd"
          style={{
            padding: '16px 22px',
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              🧠
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  مقياس طيف التوحد للأطفال واليافعين (AQ)
                </h3>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '.68rem',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  Cambridge ARC • Open Access
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '.76rem', color: '#d1fae5', opacity: 0.9 }}>
                Autism Spectrum Quotient — 50 عبارة لقياس سمات طيف التوحد عبر 5 أبعاد معرفية وسلوكية
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-g btn-sm"
            onClick={onClose}
            style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8 }}
          >
            ✕ إغلاق
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', background: 'var(--bg-main, #f8fafc)' }}>
          {/* STUDENT & EXAMINER INFO BOX */}
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 16,
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: isHeaderCollapsed ? 0 : 12,
              }}
              onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
            >
              <div style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--text-main, #1e293b)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👤 بيانات المفحوص والاستمارة</span>
                <span style={{ fontSize: '.75rem', color: 'var(--text-sub, #64748b)', fontWeight: 400 }}>
                  ({form.studentName || 'لم يتم اختيار مفحوص'} • {form.version === 'adolescent' ? 'نسخة اليافعين 12-16' : 'نسخة الأطفال 4-11'})
                </span>
              </div>
              <button
                type="button"
                className="btn btn-xs btn-g"
                style={{ fontSize: '.75rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHeaderCollapsed(!isHeaderCollapsed);
                }}
              >
                {isHeaderCollapsed ? '⬇️ إظهار البيانات' : '⬆️ طي البيانات'}
              </button>
            </div>

            {!isHeaderCollapsed && (
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontSize: '.8rem', fontWeight: 700 }}>اختيار الطالب المسجل</label>
                  <select
                    value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                    onChange={handleSelectStudent}
                    style={{ fontSize: '.82rem', padding: '6px 8px' }}
                  >
                    <option value="">— اختر طالباً من المركز —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.age ? `${s.age} سنة` : s.dob || 'غير محدد'})
                      </option>
                    ))}
                    <option value="__other__">➕ إدخال بيانات طالب خارجي / غير مسجل</option>
                  </select>
                </div>

                <div className="fl">
                  <label style={{ fontSize: '.8rem', fontWeight: 700 }}>اسم المفحوص / الطالب *</label>
                  <input
                    type="text"
                    value={form.studentName}
                    onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                    placeholder="الاسم الثلاثي..."
                    style={{ fontSize: '.82rem', padding: '6px 8px' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontSize: '.8rem', fontWeight: 700 }}>نسخة الاستبيان (الفئة العمرية) *</label>
                  <select
                    value={form.version}
                    onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                    style={{ fontSize: '.82rem', padding: '6px 8px', fontWeight: 800, color: '#047857' }}
                  >
                    <option value="child">نسخة الأطفال: 4 – 11 سنة (Child Version)</option>
                    <option value="adolescent">نسخة اليافعين: 12 – 16 سنة (Adolescent Version)</option>
                  </select>
                </div>

                <div className="fl">
                  <label style={{ fontSize: '.8rem', fontWeight: 700 }}>العمر الزمني</label>
                  <input
                    type="text"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="مثال: 7 سنوات و4 أشهر"
                    style={{ fontSize: '.82rem', padding: '6px 8px' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontSize: '.8rem', fontWeight: 700 }}>الجنس</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    style={{ fontSize: '.82rem', padding: '6px 8px' }}
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                <div className="fl">
                  <label style={{ fontSize: '.8rem', fontWeight: 700 }}>تاريخ التقييم</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ fontSize: '.82rem', padding: '6px 8px' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontSize: '.8rem', fontWeight: 700 }}>المجيب / ولي الأمر</label>
                  <input
                    type="text"
                    value={form.raterName}
                    onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    placeholder="اسم ولي الأمر أو مقدم الرعاية..."
                    style={{ fontSize: '.82rem', padding: '6px 8px' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontSize: '.8rem', fontWeight: 700 }}>صلة القرابة</label>
                  <input
                    type="text"
                    value={form.raterRelation}
                    onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    placeholder="الأم / الأب / المعلم..."
                    style={{ fontSize: '.82rem', padding: '6px 8px' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontSize: '.8rem', fontWeight: 700 }}>الفاحص / الأخصائي</label>
                  <input
                    type="text"
                    value={form.examinerName}
                    onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    placeholder="اسم الأخصائي النفسي/التشخيصي..."
                    style={{ fontSize: '.82rem', padding: '6px 8px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* LIVE DIAGNOSTIC & PSYCHOMETRIC SCOREBOARD */}
          <div
            style={{
              background: '#fff',
              border: `2px solid ${psychometrics.isAboveCutoff ? '#f87171' : '#6ee7b7'}`,
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>📊</span>
                <span style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--text-main, #0f172a)' }}>
                  لوحة المؤشرات والفرز السريري المباشر
                </span>
                <span style={{ fontSize: '.78rem', color: 'var(--text-sub, #64748b)' }}>
                  (تمت الإجابة على {psychometrics.answeredCount} من 50 بنداً)
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => handleAutoFill('autistic')}
                  style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: 700 }}
                  title="تعبئة سريعة لحالة تظهر سمات طيف توحد مرتفعة"
                >
                  ⚡ سمات مرتفعة
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => handleAutoFill('borderline')}
                  style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontWeight: 700 }}
                  title="تعبئة سريعة لحالة حدية"
                >
                  ⚡ حالة حدية
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => handleAutoFill('typical')}
                  style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', fontWeight: 700 }}
                  title="تعبئة سريعة لحالة نمطية سليمة"
                >
                  ⚡ أداء نمطي
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-g"
                  onClick={handleReset}
                  title="مسح كافة الإجابات"
                >
                  🗑️ تفريغ
                </button>
              </div>
            </div>

            {/* SCORE STATS SUMMARY */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 10,
                marginBottom: 12,
              }}
            >
              {/* Total Score */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>درجة المقياس الكلية (AQ)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: psychometrics.severityColor, marginTop: 2 }}>
                  {psychometrics.totalScore} <span style={{ fontSize: '.85rem', fontWeight: 600, color: '#94a3b8' }}>/ 50</span>
                </div>
                <div style={{ fontSize: '.68rem', color: '#64748b', marginTop: 2 }}>
                  عتبة القطع الإكلينيكية: ≥ 30
                </div>
              </div>

              {/* Clinical Cut-off Status */}
              <div
                style={{
                  background: psychometrics.isAboveCutoff ? '#fef2f2' : '#f0fdf4',
                  border: `1px solid ${psychometrics.isAboveCutoff ? '#fecaca' : '#bbf7d0'}`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>عتبة الفرز التشخيصي</div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: psychometrics.isAboveCutoff ? '#dc2626' : '#16a34a',
                    marginTop: 4,
                  }}
                >
                  {psychometrics.isAboveCutoff ? 'تجاوز عتبة القطع ⚠️' : 'أقل من عتبة القطع ✅'}
                </div>
                <div style={{ fontSize: '.68rem', color: '#64748b', marginTop: 4 }}>
                  {psychometrics.isAboveCutoff ? 'مؤشر إيجابي لسمات التوحد' : 'ضمن النطاق النمائي الطبيعي'}
                </div>
              </div>

              {/* Classification */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>التصنيف والشدة</div>
                <div style={{ fontSize: '.88rem', fontWeight: 800, color: psychometrics.severityColor, marginTop: 4 }}>
                  {psychometrics.severityLabel}
                </div>
                <div style={{ fontSize: '.68rem', color: '#64748b', marginTop: 4 }}>
                  مستوى الخطورة: <strong>{psychometrics.riskLevel}</strong>
                </div>
              </div>

              {/* Flagged items count */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>بنود السمات المرصودة</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                  {psychometrics.flaggedItems.length} <span style={{ fontSize: '.8rem', color: '#94a3b8' }}>بنداً</span>
                </div>
                <div style={{ fontSize: '.68rem', color: '#059669', marginTop: 2 }}>
                  جاهزة للاشتقاق في الخطة الفردية IEP
                </div>
              </div>
            </div>

            {/* DOMAIN SCORES MINI BARS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
              {psychometrics.domainBreakdown.map(d => (
                <div
                  key={d.id}
                  style={{
                    background: d.bgLight,
                    border: `1px solid ${d.borderColor}`,
                    borderRadius: 8,
                    padding: '6px 10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', fontWeight: 700 }}>
                    <span style={{ color: d.color }}>{d.name}</span>
                    <span style={{ color: '#0f172a' }}>{d.rawScore} / 10</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 999, overflow: 'hidden', marginTop: 4 }}>
                    <div
                      style={{
                        width: `${(d.rawScore / 10) * 100}%`,
                        height: '100%',
                        background: d.color,
                        borderRadius: 999,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DOMAIN FILTER TABS */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 12,
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            <button
              type="button"
              className={`btn btn-xs ${activeDomainFilter === 'all' ? 'btn-pr' : 'btn-g'}`}
              onClick={() => setActiveDomainFilter('all')}
              style={{ fontWeight: 800, whiteSpace: 'nowrap' }}
            >
              جميع البنود الـ 50 ({psychometrics.answeredCount}/50)
            </button>
            {AQ_DOMAINS.map(d => {
              const dStats = psychometrics.domainBreakdown.find(x => x.id === d.id);
              const isSelected = activeDomainFilter === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`btn btn-xs ${isSelected ? 'btn-pr' : 'btn-g'}`}
                  onClick={() => setActiveDomainFilter(d.id)}
                  style={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    background: isSelected ? d.color : undefined,
                    color: isSelected ? '#fff' : undefined,
                  }}
                >
                  {d.name} ({dStats?.answeredCount || 0}/10)
                </button>
              );
            })}
          </div>

          {/* QUESTIONS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const currentVal = form.scores[item.id];
              const isAnswered = Boolean(currentVal);
              const domain = AQ_DOMAINS.find(d => d.id === item.domainId);
              const note = form.itemNotes[item.id] || '';

              // check if this answer awarded an autistic trait point
              const isAgree = currentVal === 'def_agree' || currentVal === 'slight_agree';
              const isDisagree = currentVal === 'def_disagree' || currentVal === 'slight_disagree';
              const isTrait = (item.keying === 'AGREE' && isAgree) || (item.keying === 'DISAGREE' && isDisagree);

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    border: isTrait
                      ? '1.5px solid #f87171'
                      : isAnswered
                      ? '1px solid #cbd5e1'
                      : '1px dashed #cbd5e1',
                    borderRadius: 10,
                    padding: '12px 16px',
                    boxShadow: isTrait ? '0 2px 8px rgba(239, 68, 68, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: domain?.bgLight || '#f1f5f9',
                          color: domain?.color || '#334155',
                          fontWeight: 900,
                          fontSize: '.82rem',
                          flexShrink: 0,
                          border: `1px solid ${domain?.borderColor || '#cbd5e1'}`,
                        }}
                      >
                        {item.id}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', lineHeight: 1.5 }}>
                          {item.textAr}
                        </div>
                        <div style={{ fontSize: '.75rem', color: '#94a3b8', direction: 'ltr', textAlign: 'right', marginTop: 2 }}>
                          {item.textEn}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '.68rem',
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: domain?.bgLight,
                          color: domain?.color,
                          fontWeight: 700,
                        }}
                      >
                        {domain?.name}
                      </span>
                      {isTrait && (
                        <span
                          style={{
                            fontSize: '.68rem',
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: '#fee2e2',
                            color: '#991b1b',
                            fontWeight: 800,
                          }}
                        >
                          +1 سمة طيف
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-POINT LIKERT OPTIONS */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {AQ_RESPONSE_OPTIONS.map(opt => {
                      const isSelected = currentVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAnswer(item.id, opt.value)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            fontSize: '.8rem',
                            fontWeight: isSelected ? 800 : 600,
                            cursor: 'pointer',
                            border: isSelected
                              ? '2px solid #047857'
                              : '1px solid #e2e8f0',
                            background: isSelected ? '#ecfdf5' : '#f8fafc',
                            color: isSelected ? '#065f46' : '#475569',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{opt.label}</span>
                          <span style={{ fontSize: '.65rem', opacity: 0.7, direction: 'ltr' }}>{opt.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ITEM NOTE INPUT */}
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      value={note}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      placeholder="ملاحظات سريرية أو شواهد سلوكية على هذا البند (اختياري)..."
                      style={{
                        width: '100%',
                        fontSize: '.75rem',
                        padding: '4px 8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* CLINICAL SUMMARY & RECOMMENDATIONS TEXTAREAS */}
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: 12,
              padding: '14px 18px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text-main, #1e293b)', marginBottom: 10 }}>
              📝 التقرير الإكلينيكي والتوصيات التأهيلية
            </div>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fl">
                <label style={{ fontSize: '.8rem', fontWeight: 700 }}>الملخص التشخيصي السريري</label>
                <textarea
                  rows={3}
                  value={form.clinicalSummary || psychometrics.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="سيتم توليد الخلاصة السريرية تلقائياً بناءً على الدرجة الكلية وعتبة القطع..."
                  style={{ fontSize: '.82rem', padding: '6px 8px', width: '100%' }}
                />
              </div>

              <div className="fl">
                <label style={{ fontSize: '.8rem', fontWeight: 700 }}>التوصيات والإحالات الموصى بها</label>
                <textarea
                  rows={3}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="مثال: إحالة لتقييم تشخيصي شامل، جلسات تنمية مهارات اجتماعية، تدريب المرونة السلوكية..."
                  style={{ fontSize: '.82rem', padding: '6px 8px', width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="mft"
          style={{
            padding: '14px 22px',
            background: '#fff',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '.82rem', color: 'var(--text-sub, #64748b)' }}>
            الدرجة: <strong style={{ color: psychometrics.severityColor, fontSize: '1rem' }}>{psychometrics.totalScore}/50</strong> • النتيجة: <strong>{psychometrics.isAboveCutoff ? 'تجاوز عتبة القطع (اشتباه إيجابي)' : 'ضمن النطاق الطبيعي'}</strong>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={onClose}
              style={{ fontWeight: 700 }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-pr"
              onClick={handleSave}
              style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                borderColor: '#047857',
                padding: '8px 22px',
              }}
            >
              💾 حفظ التقييم الإكلينيكي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
