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
        [qId]: val
      }
    }));
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
      type: 'conners_parent',
      date: form.date,
      stuId: form.mode === 'registered' ? form.stuId : '',
      studentName: form.mode === 'registered' ? (students.find(s => s.id === form.stuId)?.name || '') : form.studentName,
      examinerName: form.examinerName,
      mode: form.mode,
      dob: form.dob,
      age: form.age,
      gender: form.gender,
      scores: form.scores,
      results,
      notes: form.notes,
      clinicalSummary: form.clinicalSummary,
    };

    if (form.id) {
      lsUpd('assessments', payload.id, payload);
      toast(`تم تحديث مقياس كونرز بنجاح`, 'ok');
    } else {
      lsAdd('assessments', payload);
      toast(`✅ تم حفظ مقياس كونرز بنجاح`, 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  // Handle fast answering of remaining empty items with a default value (e.g. 0)
  function handleFillRemaining(val = 0) {
    if (!window.confirm(`هل أنت متأكد من تعبئة جميع الفقرات الفارغة بـ "${CONNERS_PARENT_OPTIONS.find(o => o.value === val)?.label}"؟`)) return;
    const newScores = { ...form.scores };
    CONNERS_PARENT_ITEMS.forEach(it => {
      if (newScores[it.id] === undefined) {
        newScores[it.id] = val;
      }
    });
    setForm(prev => ({ ...prev, scores: newScores }));
  }

  const filteredItems = CONNERS_PARENT_ITEMS.filter(it => {
    if (activeDomainFilter === 'all') return true;
    const domain = CONNERS_PARENT_DOMAINS.find(d => d.id === activeDomainFilter);
    return domain?.items.includes(it.num);
  });

  if (!isOpen) return null;

  return (
    <div className="mbg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mb mb-xl">
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            padding: '16px 22px',
            background: 'linear-gradient(135deg, #ea580c, #c2410c)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                مقياس كونرز لفرط الحركة وتشتت الانتباه
              </h2>
              <span className="bdg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '.75rem' }}>
                CPRS-R (L) · 80 فقرة
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '.84rem' }}>
              النسخة المطولة للوالدين (Conners Parent Rating Scale - Revised)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              width: 34,
              height: 34,
              borderRadius: '50%',
              fontSize: '1.1rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Live Status Bar */}
        <div
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: 'var(--g0)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>نسبة الاستجابة: </span>
              <strong style={{ fontSize: '.9rem' }}>{answeredCount} / {CONNERS_PARENT_ITEMS.length} فقرة ({progressPercent}%)</strong>
            </div>
            {answeredCount < 80 && (
              <button 
                type="button" 
                onClick={() => handleFillRemaining(0)}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '2px 8px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}
              >
                تعبئة المتبقي "أبداً/صفر"
              </button>
            )}
            <div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>المؤشر العام (ADHD Index): </span>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: '.82rem',
                  fontWeight: 700,
                  background: `${results.severityColor}15`,
                  color: results.severityColor,
                  border: `1px solid ${results.severityColor}40`,
                }}
              >
                {results.level}
              </span>
            </div>
          </div>
          <div style={{ width: 140, background: 'var(--border-color)', borderRadius: 10, height: 8, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: progressPercent === 100 ? '#059669' : '#ea580c',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body-scroll" style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
          {/* Metadata Section */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              📋 بيانات المفحوص (النسخة الوالدية)
            </h4>
            <div className="fg c2">
              <StudentPicker
                form={form}
                setForm={setForm}
                students={students}
                emps={emps}
                showExtra={true}
              />
            </div>
            <div className="fg c3" style={{ marginTop: 12 }}>
              <div className="fl">
                <label>الجنس <span className="req">*</span></label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                  <option value="">— اختر —</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
              <div className="fl">
                <label>اسم الفاحص</label>
                <input
                  type="text"
                  value={form.examinerName}
                  onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                />
              </div>
              <div className="fl">
                <label>تاريخ الفحص</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: '.78rem', color: 'var(--text-sub)', background: 'var(--g0)', padding: 10, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <strong>تعليمات التطبيق:</strong> الأسئلة الآتية بها عدد من المشاكل المنتشرة لدى الأطفال. يجب عليك تحديد درجة السؤال من ملاحظاتك لتصرفات ابنك خلال الشهر الماضي وضع علامة على الإجابة المثالية.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            {/* LEFT SIDE: Items & Scoring */}
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 6 }}>
                <button
                  type="button"
                  onClick={() => setActiveDomainFilter('all')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: 'none',
                    background: activeDomainFilter === 'all' ? '#ea580c' : 'var(--g2)',
                    color: activeDomainFilter === 'all' ? '#fff' : 'var(--text-sub)',
                    fontWeight: 800,
                    fontSize: '.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  جميع الفقرات (80)
                </button>
                {CONNERS_PARENT_DOMAINS.map(dom => {
                  const isActive = activeDomainFilter === dom.id;
                  const domRes = results.subscales.find(s => s.id === dom.id);
                  const answeredInDom = domRes?.count || 0;
                  const totalInDom = dom.items.length;
                  const isDone = answeredInDom === totalInDom;
                  
                  return (
                    <button
                      key={dom.id}
                      type="button"
                      onClick={() => setActiveDomainFilter(dom.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 20,
                        background: isActive ? dom.color : (isDone ? `${dom.color}15` : 'var(--g0)'),
                        color: isActive ? '#fff' : (isDone ? dom.color : 'var(--text-sub)'),
                        border: isDone && !isActive ? `1px solid ${dom.color}40` : (isActive ? `1px solid ${dom.color}` : '1px solid var(--border-color)'),
                        fontWeight: 800,
                        fontSize: '.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {dom.id}. {dom.name}
                      <span style={{ 
                        background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)', 
                        padding: '1px 6px', 
                        borderRadius: 10, 
                        fontSize: '.7rem',
                        color: isActive ? '#fff' : 'inherit'
                      }}>
                        {answeredInDom}/{totalInDom}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Legend bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--g0)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  marginBottom: 10,
                  fontSize: '.75rem',
                  color: 'var(--text-sub)',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>مفتاح التقدير:</span>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span><strong style={{ color: '#ea580c' }}>0:</strong> أبداً / نادراً</span>
                  <span><strong style={{ color: '#ea580c' }}>1:</strong> أحياناً (قليلاً)</span>
                  <span><strong style={{ color: '#ea580c' }}>2:</strong> غالباً (إلى حد ما)</span>
                  <span><strong style={{ color: '#ea580c' }}>3:</strong> دائماً (بشكل كبير)</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredItems.map(item => {
                  const val = form.scores[item.id] !== undefined ? form.scores[item.id] : null;
                  const isAnswered = val !== null;
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: isAnswered ? 'var(--bg-card)' : 'var(--bg-card)',
                        border: isAnswered ? '1.5px solid #ea580c' : '1px solid var(--border-color)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 240px' }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: isAnswered ? '#ea580c' : 'var(--g2)',
                            color: isAnswered ? '#fff' : 'var(--text-sub)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '.75rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {item.num}
                        </div>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: '.86rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.text}
                        </h4>
                      </div>

                      {/* Compact 4-choice button group */}
                      <div style={{ display: 'inline-flex', gap: 4, flexShrink: 0 }}>
                        {CONNERS_PARENT_OPTIONS.map(opt => {
                          const isSelected = val === opt.value;
                          const shortLabels = ['0 · أبداً', '1 · أحياناً', '2 · غالباً', '3 · دائماً'];
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleScoreChange(item.id, opt.value)}
                              title={`${opt.value} - ${opt.label}`}
                              style={{
                                padding: '4px 8px',
                                minWidth: 56,
                                height: 28,
                                borderRadius: 6,
                                border: isSelected ? '1.5px solid #ea580c' : '1px solid var(--border-color)',
                                background: isSelected ? '#ea580c' : 'var(--bg-input)',
                                color: isSelected ? '#fff' : 'var(--text-main)',
                                fontWeight: isSelected ? 800 : 500,
                                fontSize: '.74rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {shortLabels[opt.value] || opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE: Subscale Live Results & Recommendations */}
            <div style={{ flex: '1 1 320px', maxWidth: 450 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, marginBottom: 16, position: 'sticky', top: 0 }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px dashed var(--border-color)', paddingBottom: 10 }}>
                  📊 نتائج أبعاد المقياس
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.subscales.map(sub => (
                    <div key={sub.id} style={{ background: 'var(--bg-input)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '.8rem', color: sub.color }}>{sub.id}. {sub.name}</span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--text-sub)' }}>Raw: {sub.raw}</span>
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
                      <div style={{ background: 'var(--border-color)', height: 4, borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (sub.tScore / 90) * 100)}%`, background: sub.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fg c1" style={{ marginTop: 20 }}>
                  <div className="fl">
                    <label>الاستنتاج السريري والملاحظات</label>
                    <textarea
                      rows={4}
                      value={form.clinicalSummary}
                      onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                      placeholder="سجل هنا تفسير النتائج، والملاحظات الإكلينيكية حول فرط الحركة وتشتت الانتباه..."
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
            المفحوص: <strong>{form.studentName || 'لم يتم التحديد'}</strong> · الدرجة الكلية: <strong>{results.totalRawScore}</strong>
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
