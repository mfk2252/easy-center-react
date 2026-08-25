import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SENSORY_CHECKLIST_ITEMS,
  SENSORY_CHECKLIST_DOMAINS,
  SENSORY_CHECKLIST_OPTIONS,
  calculateSensoryChecklistScore,
} from '../../data/sensoryChecklistData';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_SC_FORM = {
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

export default function SensoryChecklistAssessmentModal({
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
        ...EMPTY_SC_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
      };
    }
    return { ...EMPTY_SC_FORM, examinerName: currentUser?.name || '' };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setForm({
        ...EMPTY_SC_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
      });
      setActiveDomainFilter('all');
    } else {
      setForm({ ...EMPTY_SC_FORM, examinerName: currentUser?.name || '' });
      setActiveDomainFilter('all');
    }
  }, [isOpen, initialData, currentUser]);

  const results = useMemo(() => calculateSensoryChecklistScore(form.scores || {}), [form.scores]);
  
  const answeredCount = results.answeredCount;
  const progressPercent = Math.round((answeredCount / SENSORY_CHECKLIST_ITEMS.length) * 100);

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
      type: 'sensory_checklist',
      date: form.date,
      stuId: form.mode === 'registered' ? form.stuId : '',
      studentName: form.mode === 'registered' ? (students.find(s => s.id === form.stuId)?.name || '') : form.studentName,
      examinerName: form.examinerName,
      mode: form.mode,
      dob: form.dob,
      age: form.age,
      scores: form.scores,
      results,
      notes: form.notes,
      clinicalSummary: form.clinicalSummary,
    };

    if (form.id) {
      lsUpd('assessments', payload.id, payload);
      toast(`تم تحديث القائمة الحسية (${results.totalRawScore}) بنجاح`, 'ok');
    } else {
      lsAdd('assessments', payload);
      toast(`✅ تم حفظ القائمة الحسية (${results.totalRawScore}) بنجاح`, 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  const filteredItems = SENSORY_CHECKLIST_ITEMS.filter(it => {
    if (activeDomainFilter === 'all') return true;
    return it.domainId === activeDomainFilter;
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
            background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem' }}>🧠</span>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                القائمة الحسية - The Sensory Checklist
              </h2>
              <span className="bdg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '.75rem' }}>
                117 فقرة مقننة
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '.84rem' }}>
              إعداد: Sue Larkey · ترجمة وتقنين: د. أحمد محمد عبد الفتاح (مركز معاك)
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
              <strong style={{ fontSize: '.9rem' }}>{answeredCount} / {SENSORY_CHECKLIST_ITEMS.length} فقرة ({progressPercent}%)</strong>
            </div>
            <div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>الدرجة الكلية: </span>
              <strong style={{ fontSize: '1.1rem', color: results.severityColor }}>
                {results.totalRawScore}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>التصنيف: </span>
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
                background: progressPercent === 100 ? '#059669' : '#1e40af',
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
              📋 بيانات المفحوص
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
                <label>اسم الفاحص / القائم بالتطبيق</label>
                <select
                  value={form.examinerName}
                  onChange={e => {
                    const emp = emps.find(x => x.name === e.target.value);
                    setForm(f => ({
                      ...f,
                      examinerName: e.target.value,
                    }));
                  }}
                >
                  <option value="">— اختر الأخصائي —</option>
                  {emps.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
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
                    background: activeDomainFilter === 'all' ? '#1e40af' : 'var(--g2)',
                    color: activeDomainFilter === 'all' ? '#fff' : 'var(--text-sub)',
                    fontWeight: 800,
                    fontSize: '.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  جميع الأبعاد (117)
                </button>
                {SENSORY_CHECKLIST_DOMAINS.map(dom => {
                  const isActive = activeDomainFilter === dom.id;
                  const domRes = results.subscales.find(s => s.id === dom.id);
                  const answeredInDom = domRes?.count || 0;
                  const totalInDom = SENSORY_CHECKLIST_ITEMS.filter(it => it.domainId === dom.id).length;
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
                      {dom.name}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredItems.map(item => {
                  const domMeta = SENSORY_CHECKLIST_DOMAINS.find(d => d.id === item.domainId);
                  const val = form.scores[item.id] !== undefined ? form.scores[item.id] : null;
                  const isAnswered = val !== null;
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: isAnswered ? `1.5px solid ${domMeta?.color || '#0284c7'}` : '1px solid var(--border-color)',
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
                            background: isAnswered ? domMeta?.color : 'var(--g2)',
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

                      <div style={{ display: 'inline-flex', gap: 4, flexShrink: 0 }}>
                        {SENSORY_CHECKLIST_OPTIONS.map(opt => {
                          const isSelected = val === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleScoreChange(item.id, opt.value)}
                              title={`${opt.label} - ${opt.desc}`}
                              style={{
                                padding: '4px 8px',
                                minWidth: 52,
                                height: 28,
                                borderRadius: 6,
                                border: isSelected ? `1.5px solid ${opt.color}` : '1px solid var(--border-color)',
                                background: isSelected ? opt.color : 'var(--bg-input)',
                                color: isSelected ? '#fff' : 'var(--text-main)',
                                fontWeight: isSelected ? 800 : 500,
                                fontSize: '.74rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {opt.label}
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
            <div style={{ flex: '1 1 300px', maxWidth: 400 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, marginBottom: 16, position: 'sticky', top: 0 }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px dashed var(--border-color)', paddingBottom: 10 }}>
                  📊 نتائج المعالجة الحسية
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {results.subscales.map(sub => (
                    <div key={sub.id} style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '.85rem', color: sub.color }}>{sub.name}</span>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: '.72rem',
                            fontWeight: 700,
                            background: `${sub.color}15`,
                            color: sub.color,
                          }}
                        >
                          {sub.level}
                        </span>
                      </div>
                      <div style={{ fontSize: '.82rem', color: 'var(--text-sub)' }}>
                        الدرجة: <strong>{sub.raw}</strong> / {sub.maxRaw} ({sub.percentage}%)
                      </div>
                      <div style={{ background: 'var(--border-color)', height: 6, borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${sub.percentage}%`, background: sub.color }} />
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
                      placeholder="سجل هنا تفسير النتائج، والملاحظات العامة على استجابات المفحوص..."
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
                background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
                color: '#fff',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: 8,
              }}
            >
              💾 حفظ تقييم القائمة الحسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
