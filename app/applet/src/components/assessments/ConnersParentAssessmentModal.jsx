import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  CONNERS_PARENT_ITEMS,
  CONNERS_PARENT_DOMAINS,
  CONNERS_PARENT_OPTIONS,
  calculateConnersParentScore,
} from '../../data/connersParentData';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

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
  date: todayStr(),
  notes: '',
  scores: {},
  clinicalSummary: '',
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
      };
    }
    return { ...EMPTY_CONNERS_FORM, examinerName: currentUser?.name || '' };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setForm({
        ...EMPTY_CONNERS_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
      });
      setActiveDomainFilter('all');
    } else {
      setForm({ ...EMPTY_CONNERS_FORM, examinerName: currentUser?.name || '' });
      setActiveDomainFilter('all');
    }
  }, [isOpen, initialData, currentUser]);

  const results = useMemo(() => calculateConnersParentScore(form.scores || {}), [form.scores]);

  const answeredCount = results.answeredCount;
  const progressPercent = Math.round((answeredCount / CONNERS_PARENT_ITEMS.length) * 100);

  function handleScoreChange(qId, val) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [qId]: val,
      },
    }));
  }

  function handleFillRemaining(defaultVal = 0) {
    setForm(prev => {
      const nextScores = { ...prev.scores };
      CONNERS_PARENT_ITEMS.forEach(it => {
        if (nextScores[it.id] === undefined || nextScores[it.id] === null) {
          nextScores[it.id] = defaultVal;
        }
      });
      return { ...prev, scores: nextScores };
    });
    toast(`تم تعبئة الفقرات المتبقية بالقيمة (${defaultVal})`, 'info');
  }

  function handleClearAllScores() {
    if (!window.confirm('هل أنت متأكد من تفريغ جميع الإجابات الحالية؟')) return;
    setForm(prev => ({ ...prev, scores: {} }));
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('يرجى تحديد الطالب (أو إدخال اسمه) أولاً', 'err');
      return;
    }
    if (answeredCount === 0) {
      toast('لم يتم تقييم أي فقرة بعد', 'err');
      return;
    }

    const payload = {
      id: form.id || uid(),
      measureId: 'conners_parent',
      measureName: 'مقياس كونرز لفرط الحركة وتشتت الانتباه (نسخة الوالدين المطولة CPRS-R L)',
      scaleType: 'conners_parent',
      type: 'conners_parent',
      category: 'adhd',
      date: form.date,
      stuId: form.mode === 'registered' ? form.stuId : '',
      studentName: form.mode === 'registered' ? (students.find(s => s.id === form.stuId)?.name || form.studentName) : form.studentName,
      examinerName: form.examinerName,
      mode: form.mode,
      dob: form.dob,
      age: form.age,
      gender: form.gender,
      grade: form.grade,
      school: form.school,
      score: results.totalRawScore,
      maxScore: 240,
      level: results.level,
      severityColor: results.severityColor,
      percentage: Math.round((results.totalRawScore / 240) * 100) + '%',
      scores: form.scores,
      results: form.scores,
      psychometrics: results,
      notes: form.notes,
      clinicalSummary: form.clinicalSummary,
      updatedAt: new Date().toISOString(),
    };

    if (form.id) {
      lsUpd('studentAssessments', payload.id, payload);
      toast(`✅ تم تحديث تقييم مقياس كونرز بنجاح`, 'ok');
    } else {
      lsAdd('studentAssessments', { ...payload, createdAt: new Date().toISOString() });
      toast(`✅ تم حفظ تقييم مقياس كونرز بنجاح`, 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  if (!isOpen) return null;

  const filteredItems = CONNERS_PARENT_ITEMS.filter(it => {
    if (activeDomainFilter === 'all') return true;
    const domain = CONNERS_PARENT_DOMAINS.find(d => d.id === activeDomainFilter);
    return domain ? domain.items.includes(it.num) : true;
  });

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div className="mb mb-xl" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div
          className="modal-header-custom fhd"
          style={{
            background: 'linear-gradient(135deg, #ea580c, #c2410c)',
            color: '#ffffff',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                مقياس كونرز لفرط الحركة وتشتت الانتباه — نسخة الوالدين المطولة (CPRS-R L)
              </h3>
              <div style={{ fontSize: '.78rem', color: '#ffedd5', fontWeight: 500 }}>
                المعيار السيكومتري الشامل (80 بنداً) · 14 بعداً تشخيصياً مع الدرجات المعيارية T ومؤشرات DSM-IV
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--bg-card)' }}>
          {/* Top Form Fields: Student Selection */}
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <StudentPicker
              data={form}
              setData={setForm}
              students={students}
              showDetails
            />
            <div className="fg fg-3" style={{ marginTop: 12 }}>
              <div className="fl">
                <label>اسم الأخصائي / الفاحص</label>
                <input
                  type="text"
                  value={form.examinerName}
                  onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                  placeholder="اسم الأخصائي المسؤول عن المقابلة..."
                />
              </div>
              <div className="fl">
                <label>تاريخ تطبيق المقياس</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="fl">
                <label>المدرسة / الصف</label>
                <input
                  type="text"
                  value={form.grade || ''}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  placeholder="مثال: الصف الثاني الابتدائي..."
                />
              </div>
            </div>
          </div>

          {/* Quick Progress and Global Score Bar */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08), rgba(249, 115, 22, 0.04))',
              border: '1.5px solid #ea580c',
              borderRadius: 12,
              padding: '12px 18px',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: '.95rem', color: '#ea580c' }}>
                  📊 إنجاز التقييم: {answeredCount} من {CONNERS_PARENT_ITEMS.length} بنداً ({progressPercent}%)
                </span>
                <span className="bdg" style={{ background: `${results.severityColor}20`, color: results.severityColor, fontWeight: 800 }}>
                  {results.level}
                </span>
              </div>
              <div style={{ width: 220, background: 'var(--g1)', height: 7, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, background: '#ea580c', height: '100%', transition: 'width 0.3s' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleFillRemaining(0)}
                title="تعبئة كافة الفقرات المتروكة بالقيمة 0 (أبداً / نادراً)"
              >
                ⚡ إكمال الباقي (0 - نادراً)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={handleClearAllScores}
                title="مسح كافة الإجابات الحالية"
              >
                🗑️ تفريغ
              </button>
            </div>
          </div>

          {/* Two-Column Layout: Questions on Left, Psychometrics on Right */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {/* LEFT SIDE: Domain Filter Tabs & 80 Items List */}
            <div style={{ flex: '1 1 560px', minWidth: 320 }}>
              {/* Domain Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => setActiveDomainFilter('all')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: '.78rem',
                    fontWeight: activeDomainFilter === 'all' ? 800 : 500,
                    border: '1px solid var(--border-color)',
                    background: activeDomainFilter === 'all' ? '#ea580c' : 'var(--bg-input)',
                    color: activeDomainFilter === 'all' ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  جميع البنود (80)
                </button>
                {CONNERS_PARENT_DOMAINS.map(dom => {
                  const isActive = activeDomainFilter === dom.id;
                  const answeredInDom = dom.items.filter(num => form.scores[`q${num}`] !== undefined && form.scores[`q${num}`] !== null).length;
                  const totalInDom = dom.items.length;
                  return (
                    <button
                      key={dom.id}
                      type="button"
                      onClick={() => setActiveDomainFilter(dom.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: '.74rem',
                        fontWeight: isActive ? 800 : 500,
                        border: `1px solid ${isActive ? dom.color : 'var(--border-color)'}`,
                        background: isActive ? dom.color : 'var(--bg-input)',
                        color: isActive ? '#fff' : 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>{dom.id}. {dom.name}</span>
                      <span
                        style={{
                          background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-card)',
                          padding: '1px 5px',
                          borderRadius: 8,
                          fontSize: '.68rem',
                          color: isActive ? '#fff' : 'var(--text-sub)',
                        }}
                      >
                        {answeredInDom}/{totalInDom}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredItems.map(item => {
                  const val = form.scores[item.id] !== undefined && form.scores[item.id] !== null ? form.scores[item.id] : null;
                  const isAnswered = val !== null;
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: isAnswered ? '#fffbeb' : 'var(--bg-card)',
                        border: isAnswered ? '1.5px solid #f59e0b' : '1px solid var(--border-color)',
                        borderRadius: 12,
                        padding: 14,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: isAnswered ? '#ea580c' : 'var(--g2)',
                            color: isAnswered ? '#fff' : 'var(--text-sub)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '.82rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {item.num}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '.92rem', color: isAnswered ? '#9a3412' : 'var(--text-main)', lineHeight: 1.5 }}>
                            {item.text}
                          </h4>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {CONNERS_PARENT_OPTIONS.map(opt => {
                              const isSelected = val === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => handleScoreChange(item.id, opt.value)}
                                  style={{
                                    flex: 1,
                                    minWidth: 100,
                                    padding: '7px 6px',
                                    borderRadius: 8,
                                    border: isSelected ? '2px solid #ea580c' : '1.5px solid var(--border-color)',
                                    background: isSelected ? '#ffedd5' : 'var(--bg-input)',
                                    color: isSelected ? '#c2410c' : 'var(--text-sub)',
                                    fontWeight: isSelected ? 800 : 500,
                                    fontSize: '.78rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                  }}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE: Subscale Live Results & Recommendations */}
            <div style={{ flex: '1 1 320px', maxWidth: 450 }}>
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: 16,
                  position: 'sticky',
                  top: 10,
                }}
              >
                <h4 style={{ margin: '0 0 12px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px dashed var(--border-color)', paddingBottom: 8 }}>
                  📊 النتائج المباشرة للأبعاد الـ 14
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '55vh', overflowY: 'auto', paddingRight: 4 }}>
                  {results.subscales.map(sub => (
                    <div key={sub.id} style={{ background: 'var(--bg-input)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '.78rem', color: sub.color }}>{sub.id}. {sub.name}</span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-sub)' }}>خام: {sub.raw}</span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: '.72rem',
                              fontWeight: 800,
                              background: `${sub.severityColor}15`,
                              color: sub.severityColor,
                            }}
                          >
                            T: {sub.tScore}
                          </span>
                        </div>
                      </div>
                      <div style={{ background: 'var(--border-color)', height: 4, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (sub.tScore / 90) * 100)}%`, background: sub.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fg c1" style={{ marginTop: 16 }}>
                  <div className="fl">
                    <label>الاستنتاج السريري والملاحظات</label>
                    <textarea
                      rows={3}
                      value={form.clinicalSummary}
                      onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                      placeholder="سجل هنا تفسير النتائج والملاحظات الإكلينيكية حول فرط الحركة وتشتت الانتباه..."
                      style={{ fontSize: '.84rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            flexShrink: 0,
            padding: '14px 22px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '.84rem', color: 'var(--text-sub)' }}>
            المفحوص: <strong>{form.studentName || 'لم يتم التحديد'}</strong> · الدرجة الكلية: <strong>{results.totalRawScore} / 240</strong>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-g" onClick={onClose}>
              إلغاء
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                color: '#fff',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: 8,
              }}
            >
              💾 حفظ تقييم كونرز
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
