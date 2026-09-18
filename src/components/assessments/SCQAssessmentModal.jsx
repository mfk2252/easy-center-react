import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SCQ_ITEMS,
  SCQ_DOMAINS,
  SCQ_COPYRIGHT_INFO,
  calculateSCQPsychometrics,
} from '../../data/scqData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_SCQ_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  gender: 'ذكر',
  raterName: '',
  raterRelation: 'ولي الأمر (الأم / الأب)',
  examinerName: '',
  date: todayStr(),
  formType: 'lifetime', // 'lifetime' (مدى الحياة) or 'current' (الوضع الراهن)
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function SCQAssessmentModal({
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
        ...EMPTY_SCQ_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_SCQ_FORM,
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
    setForm(f => ({
      ...f,
      mode: 'registered',
      stuId: st.id,
      studentName: st.name || '',
      dob: st.dob || '',
      age: computedAge,
      gender: st.gender || 'ذكر',
      diagnosis: st.diagnosis || st.disabilityType || 'طيف التوحد',
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
    return calculateSCQPsychometrics(form.scores);
  }, [form.scores]);

  const isNonVerbal = psychometrics.isNonVerbal;

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return SCQ_ITEMS;
    return SCQ_ITEMS.filter(it => it.domainId === activeDomainFilter);
  }, [activeDomainFilter]);

  function handleSave() {
    if (!form.studentName || !form.studentName.trim()) {
      alert('يرجى تحديد أو إدخال اسم المفحوص.');
      return;
    }

    if (psychometrics.answeredCount < 5) {
      if (!window.confirm('تمت الإجابة على عدد قليل جداً من بنود الاستبيان. هل ترغب في حفظ المسودة رغم ذلك؟')) {
        return;
      }
    }

    const assessmentRecord = {
      id: form.id || uid(),
      measureId: 'scq',
      scaleType: 'scq',
      measureName: SCQ_COPYRIGHT_INFO.scaleFullNameAr,
      measureNameEn: SCQ_COPYRIGHT_INFO.scaleFullNameEn,
      category: 'autism',
      stuId: form.stuId || null,
      studentName: form.studentName.trim(),
      dob: form.dob || '',
      age: form.age || '',
      gender: form.gender || 'ذكر',
      diagnosis: form.diagnosis || 'طيف التوحد',
      raterName: form.raterName || 'ولي الأمر',
      raterRelation: form.raterRelation || '',
      examinerName: form.examinerName || currentUser?.name || 'الأخصائي المسؤول',
      date: form.date || todayStr(),
      formType: form.formType || 'lifetime',
      notes: form.notes || '',
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      score: psychometrics.rawScore,
      rawScore: psychometrics.rawScore,
      maxScore: psychometrics.maxScore,
      cutoffScore: psychometrics.cutoffScore,
      cutoffResult: psychometrics.cutoffResult,
      level: psychometrics.severityLabel,
      severityLabel: psychometrics.severityLabel,
      severityKey: psychometrics.severityKey,
      severityColor: psychometrics.severityColor,
      isNonVerbal: psychometrics.isNonVerbal,
      domainScores: psychometrics.domainScores,
      interpretationAr: form.clinicalSummary || psychometrics.interpretationAr,
      recommendations: form.recommendations || psychometrics.clinicalRecommendation,
      updatedAt: new Date().toISOString(),
    };

    if (form.id) {
      lsUpd('assessments', form.id, assessmentRecord);
      lsUpd('studentAssessments', form.id, assessmentRecord);
      toast?.('✅ تم تحديث استبيان SCQ بنجاح', 'ok');
    } else {
      assessmentRecord.createdAt = new Date().toISOString();
      lsAdd('assessments', assessmentRecord);
      lsAdd('studentAssessments', assessmentRecord);
      toast?.('✅ تم حفظ واعتماد استبيان SCQ بنجاح', 'ok');
    }

    if (onSaved) onSaved(assessmentRecord);
    onClose();
  }

  function handleSafeClose() {
    if (psychometrics.answeredCount > 0 && !form.id) {
      if (window.confirm('⚠️ هناك إجابات مرصودة لم يتم حفظها، هل أنت متأكد من الإغلاق وإلغاء الاستبيان؟')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && handleSafeClose()}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          className="fhd modal-header-custom"
          style={{
            background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
            color: '#fff',
            padding: '14px 20px',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.5rem' }}>📋</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                  {SCQ_COPYRIGHT_INFO.scaleFullNameAr}
                </h3>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 'var(--r3)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  عتبة الفرز الدولية (Cutoff = 15)
                </span>
                <span
                  style={{
                    background: '#064e3b',
                    color: '#a7f3d0',
                    padding: '2px 8px',
                    borderRadius: 'var(--r3)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  خوارزمية ADI-R & DSM-5 المفتوحة
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#ecfdf5', lineHeight: 1.4 }}>
                {SCQ_COPYRIGHT_INFO.purpose}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.75rem',
                }}
              >
                {isHeaderCollapsed ? 'إظهار بيانات المفحوص ▼' : 'طي البيانات ▲'}
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={handleSafeClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          {/* Collapsible Student & Assessment Context Panel */}
          {!isHeaderCollapsed && (
            <div
              style={{
                background: 'var(--g0)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--r)',
                padding: '14px 18px',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                <strong style={{ fontSize: '0.88rem', color: '#047857' }}>
                  👤 بيانات المفحوص ونموذج استبيان SCQ:
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                  الفئة العمرية المستهدفة: {SCQ_COPYRIGHT_INFO.targetAge}
                </span>
              </div>

              <div className="fg c3">
                <div className="fl">
                  <label>اختيار المفحوص من السجل:</label>
                  <select
                    value={form.mode === 'other' ? '__other__' : form.stuId}
                    onChange={handleSelectStudent}
                  >
                    <option value="">-- اختر مفحوصاً مسجلاً بالمركز --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.diagnosis ? `(${s.diagnosis})` : ''}
                      </option>
                    ))}
                    <option value="__other__">➕ إدخال يدوي / مفحوص غير مسجل</option>
                  </select>
                </div>

                <div className="fl">
                  <label>اسم المفحوص كاملاً:</label>
                  <input
                    type="text"
                    value={form.studentName}
                    onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                    placeholder="اسم الطفل الثلاثي..."
                  />
                </div>

                <div className="fl">
                  <label>نوع استمارة SCQ:</label>
                  <select
                    value={form.formType}
                    onChange={e => setForm(f => ({ ...f, formType: e.target.value }))}
                    style={{ fontWeight: 700, color: '#047857' }}
                  >
                    <option value="lifetime">استمارة مدى الحياة (Lifetime Form) — التاريخ النمائي الشامل</option>
                    <option value="current">استمارة الوضع الراهن (Current Form) — سلوك آخر 3 أشهر</option>
                  </select>
                </div>
              </div>

              <div className="fg c4" style={{ marginTop: 10 }}>
                <div className="fl">
                  <label>العمر الزمني:</label>
                  <input
                    type="text"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="مثال: 5 سنوات و 3 أشهر"
                  />
                </div>

                <div className="fl">
                  <label>الجنس:</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                <div className="fl">
                  <label>الأخصائي المطبق / الفاحص:</label>
                  <input
                    type="text"
                    value={form.examinerName}
                    onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    placeholder="اسم الأخصائي..."
                  />
                </div>

                <div className="fl">
                  <label>تاريخ إجراء الفحص:</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="fg c2" style={{ marginTop: 10 }}>
                <div className="fl">
                  <label>اسم مجيب الاستبيان (المصدر):</label>
                  <input
                    type="text"
                    value={form.raterName}
                    onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    placeholder="مثال: والدة الطفل / الأب"
                  />
                </div>

                <div className="fl">
                  <label>صلة القرابة بالمفحوص:</label>
                  <input
                    type="text"
                    value={form.raterRelation}
                    onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    placeholder="مثال: الأم، الأب، الحاضنة"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Domain Filters & Live Score Metric */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16,
              padding: '10px 14px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--r)',
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-xs ${activeDomainFilter === 'all' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setActiveDomainFilter('all')}
                style={activeDomainFilter === 'all' ? { background: '#059669', borderColor: '#059669' } : {}}
              >
                جميع البنود (40 بنداً)
              </button>
              {SCQ_DOMAINS.map(d => {
                const isActive = activeDomainFilter === d.id;
                const dScore = psychometrics.domainScores[d.id];
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={`btn btn-xs ${isActive ? 'btn-p' : 'btn-g'}`}
                    onClick={() => setActiveDomainFilter(d.id)}
                    style={isActive ? { background: d.color, borderColor: d.color, color: '#fff' } : {}}
                  >
                    {d.name} ({dScore?.score || 0}/{dScore?.max || d.maxScore})
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'left', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-sub)' }}>الدرجة الخام: </span>
                <strong style={{ fontSize: '1.15rem', color: psychometrics.severityColor }}>
                  {psychometrics.rawScore} / {psychometrics.maxScore}
                </strong>
              </div>
              <span
                className={`bdg ${psychometrics.severityBadgeClass}`}
                style={{ fontSize: '0.78rem', padding: '4px 10px', fontWeight: 800 }}
              >
                {psychometrics.severityLabel}
              </span>
            </div>
          </div>

          {/* Special Notice if Item 1 is Non-Verbal */}
          {isNonVerbal && (
            <div
              style={{
                background: '#eff6ff',
                border: '1.5px solid #3b82f6',
                borderRadius: 'var(--r)',
                padding: '10px 14px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.82rem',
                color: '#1e40af',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>ℹ️</span>
              <div>
                <strong>تطبيق الخوارزمية الخاصة بغير اللفظيين:</strong> نظراً لأن إجابة البند رقم (1) هي "لا" (الطفل لا يتحدث بعبارات)، يتم تلقائياً استثناء البنود من 2 إلى 7 من احتساب الدرجة الكلية وتعديل الحد الأقصى إلى 33 درجة وفق المعايير الرسمية لـ SCQ.
              </div>
            </div>
          )}

          {/* Questions Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredItems.map(item => {
              const currentVal = form.scores[item.id] !== undefined ? form.scores[item.id] : '';
              const isSkippedDueToNonVerbal = isNonVerbal && item.requiresVerbal;
              const hasAnswered = currentVal === 'yes' || currentVal === 'no';
              const isAbnormal = (currentVal === 'yes' && item.yesScore === 1) || (currentVal === 'no' && item.noScore === 1);

              return (
                <div
                  key={item.id}
                  style={{
                    background: isSkippedDueToNonVerbal ? 'var(--g0)' : 'var(--bg-card)',
                    border: `1.5px solid ${isSkippedDueToNonVerbal ? 'var(--border-color)' : hasAnswered ? (isAbnormal ? '#f59e0b' : '#10b981') : 'var(--border-color)'}`,
                    borderRadius: 'var(--r)',
                    padding: '14px 16px',
                    opacity: isSkippedDueToNonVerbal ? 0.65 : 1,
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            background: '#059669',
                            color: '#fff',
                            fontWeight: 900,
                            borderRadius: '50%',
                            width: 26,
                            height: 26,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            flexShrink: 0,
                          }}
                        >
                          {item.number}
                        </span>
                        <span className="bdg" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                          {item.domainName}
                        </span>
                        {item.isGatewayItem && (
                          <span className="bdg b-bl" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                            بند استطلاعي حاسم للقدرة اللفظية
                          </span>
                        )}
                        {isSkippedDueToNonVerbal && (
                          <span className="bdg b-gr" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                            مستثنى تلقائياً للطفل غير اللفظي
                          </span>
                        )}
                      </div>

                      <h4 style={{ margin: '4px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.45 }}>
                        {item.textAr}
                      </h4>

                      <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                        {item.textEn}
                      </p>

                      {item.notesAr && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#047857', fontWeight: 500 }}>
                          💡 توجيه إكلينيكي: {item.notesAr}
                        </p>
                      )}
                    </div>

                    {/* Answer Buttons (Yes / No) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      {isSkippedDueToNonVerbal ? (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', background: 'var(--g1)', padding: '6px 12px', borderRadius: 8 }}>
                          لا يتم تقييم هذا البند لعدم اكتمال الجمل
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleAnswer(item.id, 'yes')}
                            style={{
                              padding: '8px 18px',
                              borderRadius: 8,
                              fontWeight: 800,
                              fontSize: '0.86rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              border: currentVal === 'yes' ? '2px solid #059669' : '1.5px solid var(--border-color)',
                              background: currentVal === 'yes'
                                ? (item.yesScore === 1 ? '#fef3c7' : '#dcfce7')
                                : 'var(--bg-card)',
                              color: currentVal === 'yes'
                                ? (item.yesScore === 1 ? '#92400e' : '#166534')
                                : 'var(--text-main)',
                              boxShadow: currentVal === 'yes' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                            }}
                          >
                            نعم
                            {currentVal === 'yes' && item.isScored && (
                              <span style={{ fontSize: '0.72rem', marginRight: 4, fontWeight: 900 }}>
                                ({item.yesScore === 1 ? '⚠️ +1' : '✓ 0'})
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAnswer(item.id, 'no')}
                            style={{
                              padding: '8px 18px',
                              borderRadius: 8,
                              fontWeight: 800,
                              fontSize: '0.86rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              border: currentVal === 'no' ? '2px solid #059669' : '1.5px solid var(--border-color)',
                              background: currentVal === 'no'
                                ? (item.noScore === 1 ? '#fef3c7' : '#dcfce7')
                                : 'var(--bg-card)',
                              color: currentVal === 'no'
                                ? (item.noScore === 1 ? '#92400e' : '#166534')
                                : 'var(--text-main)',
                              boxShadow: currentVal === 'no' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                            }}
                          >
                            لا
                            {currentVal === 'no' && item.isScored && (
                              <span style={{ fontSize: '0.72rem', marginRight: 4, fontWeight: 900 }}>
                                ({item.noScore === 1 ? '⚠️ +1' : '✓ 0'})
                              </span>
                            )}
                          </button>
                        </div>
                      )}

                      {hasAnswered && item.isScored && !isSkippedDueToNonVerbal && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: isAbnormal ? '#d97706' : '#059669',
                          }}
                        >
                          {isAbnormal ? '⚠️ مؤشر دال على التحدي / القصور' : '✓ استجابة نمائية طبيعية'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Optional Item Notes Toggle */}
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="ملاحظات وسياق إضافي للبند (اختياري)..."
                      value={form.itemNotes[item.id] || ''}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        width: '100%',
                        borderRadius: 6,
                        border: '1px dashed var(--border-color)',
                        background: 'var(--g0)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical Interpretation & Recommendations Box */}
          <div
            style={{
              marginTop: 20,
              background: 'var(--g0)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--r)',
              padding: '16px 18px',
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: '#047857' }}>
              📝 الخلاصة والتقرير الإكلينيكي التلقائي لمقياس SCQ:
            </h4>

            <div className="fl" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>الانطباع الإكلينيكي للفرز:</label>
              <textarea
                rows={3}
                value={form.clinicalSummary || psychometrics.interpretationAr}
                onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
              />
            </div>

            <div className="fl">
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>التوصيات والإحالات المترتبة:</label>
              <textarea
                rows={4}
                value={form.recommendations || psychometrics.clinicalRecommendation}
                onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>البنود المنجزة: </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {psychometrics.answeredCount} / {psychometrics.totalItems} ({psychometrics.progressPercent}%)
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>الدرجة الإجمالية: </span>
              <strong style={{ fontSize: '1.2rem', color: psychometrics.severityColor }}>
                {psychometrics.rawScore} / {psychometrics.maxScore}
              </strong>
            </div>

            <span
              className={`bdg ${psychometrics.severityBadgeClass}`}
              style={{ fontSize: '0.8rem', padding: '4px 10px', fontWeight: 800 }}
            >
              {psychometrics.severityLabel}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 800,
                padding: '8px 20px',
              }}
            >
              💾 حفظ استبيان SCQ واعتماد النتيجة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
