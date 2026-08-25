import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  FAMILY_DISINTEGRATION_ITEMS,
  FAMILY_DISINTEGRATION_DOMAINS,
  FAMILY_DISINTEGRATION_RESPONSE_OPTIONS,
  calculateFamilyDisintegrationScore,
} from '../../data/familyDisintegrationData';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_FAM_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  gender: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'المفحوص ذاتياً', // أو الأم / الأب / الأخصائي الاجتماعي
  examinerName: '',
  examinerRole: 'أخصائي نفسي / إرشاد أسري',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function FamilyDisintegrationAssessmentModal({
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
        ...EMPTY_FAM_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_FAM_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');

  // Real-time Calculation
  const results = useMemo(() => {
    return calculateFamilyDisintegrationScore(form.scores);
  }, [form.scores]);

  const answeredCount = useMemo(() => {
    return Object.keys(form.scores).filter(id => form.scores[id] !== undefined && form.scores[id] !== '').length;
  }, [form.scores]);

  const progressPercent = Math.round((answeredCount / FAMILY_DISINTEGRATION_ITEMS.length) * 100);

  if (!isOpen) return null;

  function handleScoreSelect(itemId, value) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: value,
      },
    }));
  }

  function handleItemNoteChange(itemId, note) {
    setForm(prev => ({
      ...prev,
      itemNotes: {
        ...prev.itemNotes,
        [itemId]: note,
      },
    }));
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى تحديد الطالب أو المفحوص أولاً', 'er');
      return;
    }

    if (answeredCount < FAMILY_DISINTEGRATION_ITEMS.length) {
      const confirmIncomplete = window.confirm(
        `لم يتم استكمال جميع بنود المقياس (تمت الإجابة على ${answeredCount} من ${FAMILY_DISINTEGRATION_ITEMS.length}). هل ترغب في حفظ التقييم كمسودة غير مكتملة؟`
      );
      if (!confirmIncomplete) return;
    }

    const payload = {
      ...form,
      measureId: 'family_disintegration',
      scaleType: 'family_disintegration',
      measureName: 'مقياس التفكك الأسري',
      category: 'play_environmental',
      score: results.totalRawScore,
      maxScore: results.maxPossible,
      percentage: `${results.percentage}%`,
      level: results.level,
      severityColor: results.severityColor,
      results: form.scores,
      itemNotes: form.itemNotes,
      subscales: results.subscales,
      interpretation: results.interpretation,
      isComplete: results.isComplete,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث نتيجة مقياس التفكك الأسري بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', {
        ...payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      });
      toast(`✅ تم حفظ تقييم مقياس التفكك الأسري (${results.totalRawScore}/${results.maxPossible}) بنجاح`, 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  const filteredItems = FAMILY_DISINTEGRATION_ITEMS.filter(it => {
    if (activeDomainFilter === 'all') return true;
    return it.domainId === activeDomainFilter;
  });

  return (
    <div className="mbg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mb mb-xl"
        
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0, padding: '16px 22px',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem' }}>👨‍👩‍👧‍👦</span>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                مقياس التفكك الأسري
              </h2>
              <span className="bdg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '.75rem' }}>
                26 فقرة مقننة
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '.84rem' }}>
              تقييم علمي مقنن لتشخيص درجة التصدع والمناخ الأسري والنزاعات والانفصال والإنفاق المنزلي
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
            flexShrink: 0, padding: '10px 20px',
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
              <strong style={{ fontSize: '.9rem' }}>{answeredCount} / {FAMILY_DISINTEGRATION_ITEMS.length} فقرة ({progressPercent}%)</strong>
            </div>
            <div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>الدرجة الكلية: </span>
              <strong style={{ fontSize: '1.1rem', color: results.severityColor }}>
                {results.totalRawScore} / {results.maxPossible}
              </strong>
              <span style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginRight: 4 }}>
                (المتوسط الفرضي: {results.theoreticalMean})
              </span>
            </div>
            <div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>المستوى: </span>
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
                background: progressPercent === 100 ? '#059669' : '#7c3aed',
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
              📋 بيانات المفحوص والتطبيق الإرشادي
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
                <label>الطرف المجيب (مصدر التقرير) <span className="req">*</span></label>
                <select
                  value={form.raterRelation}
                  onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                >
                  <option value="المفحوص ذاتياً">المفحوص ذاتياً (المراهق / الطالب)</option>
                  <option value="الأم">الأم</option>
                  <option value="الأب">الأب</option>
                  <option value="الأخصائي الاجتماعي">الأخصائي الاجتماعي بالملاحظة والمقابلة</option>
                  <option value="الأخصائي النفسي">الأخصائي النفسي / المرشد</option>
                  <option value="ولي الأمر / الوصي">ولي الأمر / الوصي القانوني</option>
                </select>
              </div>

              <div className="fl">
                <label>اسم الفاحص / الأخصائي المسؤول</label>
                <select
                  value={form.examinerName}
                  onChange={e => {
                    const emp = emps.find(x => x.name === e.target.value);
                    setForm(f => ({
                      ...f,
                      examinerName: e.target.value,
                      examinerRole: emp ? emp.role : f.examinerRole,
                    }));
                  }}
                >
                  <option value="">-- اختر الأخصائي --</option>
                  {emps.map(e => <option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}
                </select>
              </div>

              <div className="fl">
                <label>تاريخ تطبيق المقياس <span className="req">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Domain Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 16,
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveDomainFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '.83rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeDomainFilter === 'all' ? '2px solid #7c3aed' : '1px solid var(--border-color)',
                background: activeDomainFilter === 'all' ? 'var(--pr-l)' : 'var(--bg-card)',
                color: activeDomainFilter === 'all' ? '#6d28d9' : 'var(--text-main)',
                whiteSpace: 'nowrap',
              }}
            >
              🌐 جميع البنود ({FAMILY_DISINTEGRATION_ITEMS.length})
            </button>
            {FAMILY_DISINTEGRATION_DOMAINS.map(dom => {
              const countInDom = FAMILY_DISINTEGRATION_ITEMS.filter(it => it.domainId === dom.id).length;
              const answeredInDom = FAMILY_DISINTEGRATION_ITEMS.filter(it => it.domainId === dom.id && form.scores[it.id] !== undefined).length;
              const isAct = activeDomainFilter === dom.id;

              return (
                <button
                  key={dom.id}
                  type="button"
                  onClick={() => setActiveDomainFilter(dom.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: '.83rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isAct ? `2px solid ${dom.color}` : '1px solid var(--border-color)',
                    background: isAct ? dom.bgLight : 'var(--bg-card)',
                    color: isAct ? dom.color : 'var(--text-main)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {dom.name} ({answeredInDom}/{countInDom})
                </button>
              );
            })}
          </div>

          {/* Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredItems.map(item => {
              const domMeta = FAMILY_DISINTEGRATION_DOMAINS.find(d => d.id === item.domainId);
              const selectedVal = form.scores[item.id];
              const isAnswered = selectedVal !== undefined && selectedVal !== '';
              const itemNote = form.itemNotes[item.id] || '';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: isAnswered ? `1.5px solid ${domMeta?.borderColor || 'var(--border-color)'}` : '1.5px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    boxShadow: isAnswered ? '0 1px 3px rgba(0,0,0,0.03)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: isAnswered ? (domMeta?.color || '#7c3aed') : '#94a3b8',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '.85rem',
                        }}
                      >
                        {item.num}
                      </span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.text}
                        </h4>
                        <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '.72rem', color: domMeta?.color || '#6d28d9', fontWeight: 600 }}>
                            📌 {domMeta?.name}
                          </span>
                          <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>
                            · البعد: {item.dimension}
                          </span>
                          <span
                            style={{
                              fontSize: '.7rem',
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: item.isReverse ? '#ecfdf5' : '#fef2f2',
                              color: item.isReverse ? '#047857' : '#b91c1c',
                              fontWeight: 600,
                            }}
                          >
                            {item.isReverse ? '🔄 فقرة إيجابية (تصحيح عكسي)' : '⚠️ فقرة سلبية (تصحيح مباشر)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Likert Response Buttons */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {FAMILY_DISINTEGRATION_RESPONSE_OPTIONS.map(opt => {
                      // القيمة المخزنة هي الدرجة الرقمية المباشرة (1 إلى 5)
                      // بالنسبة للفقرات الإيجابية: دائماً = 1, غالباً = 2, أحياناً = 3, نادراً = 4, أبداً = 5
                      // بالنسبة للفقرات السلبية: دائماً = 5, غالباً = 4, أحياناً = 3, نادراً = 2, أبداً = 1
                      const calculatedVal = item.isReverse
                        ? (opt.value === 5 ? 1 : opt.value === 4 ? 2 : opt.value === 3 ? 3 : opt.value === 2 ? 4 : 5)
                        : opt.value;

                      const isSelected = selectedVal === calculatedVal;

                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleScoreSelect(item.id, calculatedVal)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 10,
                            border: isSelected
                              ? `2px solid ${domMeta?.color || '#7c3aed'}`
                              : '1px solid var(--border-color, var(--border-color))',
                            background: isSelected
                              ? (domMeta?.bgLight || 'var(--pr-l)')
                              : 'var(--bg-card)',
                            color: isSelected
                              ? (domMeta?.color || '#6d28d9')
                              : 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            fontWeight: isSelected ? 800 : 500,
                            fontSize: '.85rem',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span>{opt.label}</span>
                          <span style={{ fontSize: '.7rem', color: isSelected ? (domMeta?.color || '#6d28d9') : 'var(--text-sub)' }}>
                            {item.isReverse ? opt.descPos : opt.descNeg}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional Item Note */}
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="ملاحظات وسياق إضافي عن هذه الفقرة (اختياري)..."
                      value={itemNote}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      style={{
                        fontSize: '.78rem',
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px dashed var(--border-color, var(--border-color))',
                        width: '100%',
                        background: '#fafafa',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subscales & Diagnostic Summary in Modal */}
          <div
            style={{
              marginTop: 24,
              background: 'var(--bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              📊 نتائج الأبعاد والمحاور الفرعية للتفكك الأسري
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {results.subscales.map(sub => (
                <div
                  key={sub.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1.5px solid ${sub.color}30`,
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
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

            {/* Recommendations input */}
            <div className="fg c1" style={{ marginTop: 16 }}>
              <div className="fl">
                <label>التوصيات الإرشادية والتدخل الأسري المقترح</label>
                <textarea
                  rows={3}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="سجل هنا خطة الإرشاد الأسري، الجلسات المقترحة، والتوجيهات الوالدية المتفق عليها..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 22px',
            background: 'var(--g0)',
            flexShrink: 0, borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '.84rem', color: 'var(--text-sub)' }}>
            المفحوص: <strong>{form.studentName || 'لم يتم التحديد'}</strong> · الدرجة الكلية: <strong>{results.totalRawScore}/{results.maxPossible}</strong>
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
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: 8,
              }}
            >
              💾 حفظ تقييم المقياس
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
