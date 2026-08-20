import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SRS2_ITEMS,
  SRS2_DOMAINS,
  SRS2_RESPONSE_OPTIONS,
  calculateSRS2Score
} from '../../data/srs2Data';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_SRS2_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'الأم',
  relationshipDuration: 'سنتان',
  examinerName: '',
  examinerRole: 'أخصائي نمائي / تشخيص',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function SRS2AssessmentModal({
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
        ...EMPTY_SRS2_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_SRS2_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');

  // Real-time calculation of SRS-2 scores
  const results = useMemo(() => {
    return calculateSRS2Score(form.scores);
  }, [form.scores]);

  const answeredCount = useMemo(() => {
    return Object.keys(form.scores).filter(id => form.scores[id] !== undefined).length;
  }, [form.scores]);

  const progressPercent = Math.round((answeredCount / 65) * 100);

  if (!isOpen) return null;

  function handleScoreSelect(itemId, value) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: Number(value),
      },
    }));
  }

  function fillAllRandomly(defaultValue = 1) {
    const defaultScores = {};
    SRS2_ITEMS.forEach(it => {
      // either fixed default value, or a pseudo-random representative set
      defaultScores[it.id] = defaultValue;
    });
    setForm(prev => ({
      ...prev,
      scores: defaultScores,
    }));
    toast('⚡ تم تعبئة جميع العبارات بقيمة افتراضية للمراجعة والتجربة السريعة', 'ok');
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

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً', 'er');
      return;
    }

    if (answeredCount < 65) {
      if (!window.confirm(`المقياس غير مكتمل (${answeredCount} من أصل 65 بنداً). هل ترغب في الحفظ كمشروع غير مكتمل؟`)) {
        return;
      }
    }

    const payload = {
      id: form.id || uid(),
      stuId: form.stuId,
      studentName: form.studentName,
      dob: form.dob,
      age: form.age,
      grade: form.grade,
      school: form.school,
      raterName: form.raterName,
      raterRelation: form.raterRelation,
      relationshipDuration: form.relationshipDuration,
      examinerName: form.examinerName,
      examinerRole: form.examinerRole,
      date: form.date,
      measureId: 'srs',
      measureName: 'مقياس الاستجابة الاجتماعية (SRS-2)',
      category: 'autism',
      scaleType: 'srs2',
      score: results.totalRawScore,
      maxScore: 260,
      percentage: results.isComplete ? `${results.totalTScore} T` : 'غير مكتمل',
      level: results.isComplete ? results.category : 'غير مكتمل',
      severityColor: results.isComplete ? results.severityColor : 'gray',
      results: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      tScore: results.totalTScore || 0,
      rawScore: results.totalRawScore || 0,
      subscales: results.subscales || [],
      updatedAt: new Date().toISOString(),
    };

    if (form.id) {
      lsUpd('studentAssessments', form.id, payload);
      toast('✅ تم تحديث نتيجة مقياس SRS-2 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', { ...payload, createdAt: new Date().toISOString() });
      toast('✅ تم حفظ نتيجة مقياس SRS-2 بنجاح وتحويلها لدرجات تائية معيارية', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  const filteredItems = SRS2_ITEMS.filter(it => {
    if (activeDomainFilter === 'all') return true;
    return it.domainId === activeDomainFilter;
  });

  return (
    <div className="mbg" style={{ display: 'flex', zIndex: 1000 }}>
      <div
        className="mcont"
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          backgroundColor: '#fff',
          fontFamily: "'Tajawal', sans-serif"
        }}
        id="srs2_modal_container"
      >
        {/* HEADER */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>👥</span>
              <span>تطبيق مقياس الاستجابة الاجتماعية - الإصدار الثاني (SRS-2)</span>
            </h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: '4px 0 0 0', fontWeight: 400 }}>
              مقياس الوعي، الإدراك، التواصل، الدافعية الاجتماعية، والاهتمامات المقيدة للأطفال واليافعين
            </p>
          </div>
          <button
            type="button"
            className="btn-close"
            style={{ color: '#fff', fontSize: '1.4rem', cursor: 'pointer', background: 'none', border: 'none' }}
            onClick={onClose}
            aria-label="إغلاق"
          >
            &times;
          </button>
        </div>

        {/* WORKSPACE SCROLLABLE */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc' }}>
          
          {/* STEP 1: STUDENT PICKER & DEMOGRAPHICS */}
          <div className="card" style={{ marginBottom: 16, padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 14, color: '#1e293b' }}>
              👤 بيانات الطالب ومستجيب التقييم
            </h3>
            
            <StudentPicker form={form} setForm={setForm} students={students} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 4 }}>اسم مستجيب المقياس:</label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', padding: '8px', fontSize: '0.88rem' }}
                  placeholder="الأم، الأب، المعلم..."
                  value={form.raterName}
                  onChange={e => setForm(p => ({ ...p, raterName: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 4 }}>صلة القرابة / الدور:</label>
                <select
                  className="input"
                  style={{ width: '100%', padding: '8px', fontSize: '0.88rem' }}
                  value={form.raterRelation}
                  onChange={e => setForm(p => ({ ...p, raterRelation: e.target.value }))}
                >
                  <option value="الأم">الأم</option>
                  <option value="الأب">الأب</option>
                  <option value="المعلم">المعلم</option>
                  <option value="الأخصائي">الأخصائي</option>
                  <option value="ولي الأمر">مستجيب آخر</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 4 }}>مدة معرفة الطفل:</label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', padding: '8px', fontSize: '0.88rem' }}
                  placeholder="مثال: سنتان"
                  value={form.relationshipDuration}
                  onChange={e => setForm(p => ({ ...p, relationshipDuration: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 4 }}>اسم الفاحص / الأخصائي:</label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', padding: '8px', fontSize: '0.88rem' }}
                  value={form.examinerName}
                  onChange={e => setForm(p => ({ ...p, examinerName: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* REALTIME RESULTS MINI DASHBOARD */}
          <div className="card" style={{ marginBottom: 16, padding: '14px 16px', borderRadius: 10, border: '1px solid #10b981', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>التقدم المحرز للإجابات:</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065f46' }}>
                  {answeredCount} / 65 عبارة ({progressPercent}%)
                </div>
              </div>

              {results.isComplete ? (
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', background: '#fff', padding: '6px 12px', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>الدرجة الخام</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{results.totalRawScore}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#059669', color: '#fff', padding: '6px 16px', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>الدرجة التائية المعيارية (T)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{results.totalTScore} T</div>
                  </div>
                  <div style={{ background: '#fff', padding: '6px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>التصنيف الإكلينيكي</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: results.severityColor === 'red' ? '#dc2626' : results.severityColor === 'orange' ? '#d97706' : '#15803d' }}>
                      {results.category}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>أكمل جميع العبارات الـ 65 لعرض التقرير المعياري:</span>
                  <button type="button" className="btn btn-xs btn-g" onClick={() => fillAllRandomly(1)}>ملء بـ 1</button>
                  <button type="button" className="btn btn-xs btn-g" onClick={() => fillAllRandomly(2)}>ملء بـ 2</button>
                  <button type="button" className="btn btn-xs btn-g" onClick={() => fillAllRandomly(3)}>ملء بـ 3</button>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ background: '#e2e8f0', height: 6, borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, background: '#059669', height: '100%', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* DOMAIN NAVIGATION TABS */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <button
              type="button"
              className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
              style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => setActiveDomainFilter('all')}
            >
              🌐 الكل (65)
            </button>
            {SRS2_DOMAINS.map(dom => {
              const count = SRS2_ITEMS.filter(it => it.domainId === dom.id).length;
              const answered = SRS2_ITEMS.filter(it => it.domainId === dom.id && form.scores[it.id] !== undefined).length;
              const isDone = answered === count;
              return (
                <button
                  key={dom.id}
                  type="button"
                  className={`tab ${activeDomainFilter === dom.id ? 'on' : ''}`}
                  style={{
                    fontSize: '0.82rem',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    borderColor: dom.borderColor,
                    color: activeDomainFilter === dom.id ? '#fff' : '#1e293b',
                    background: activeDomainFilter === dom.id ? dom.color : isDone ? dom.bgLight : undefined,
                  }}
                  onClick={() => setActiveDomainFilter(dom.id)}
                >
                  {dom.name} ({answered}/{count}) {isDone && '✓'}
                </button>
              );
            })}
          </div>

          {/* ITEMS GRID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredItems.map((item, index) => {
              const isReverse = item.isReverse;
              const globalIndex = SRS2_ITEMS.findIndex(x => x.id === item.id) + 1;
              const rating = form.scores[item.id];
              const domMeta = SRS2_DOMAINS.find(d => d.id === item.domainId);

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                  id={`srs_item_${item.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '4px',
                          padding: '2px 6px',
                          flexShrink: 0,
                        }}
                      >
                        {globalIndex}
                      </span>
                      <p style={{ fontSize: '0.94rem', fontWeight: 400, color: '#1e293b', margin: 0, lineHeight: 1.5 }}>
                        {item.text}
                      </p>
                    </div>

                    <span
                      style={{
                        background: domMeta?.bgLight || '#f1f5f9',
                        color: domMeta?.color || '#475569',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {domMeta?.name} {isReverse && '◀ م'}
                    </span>
                  </div>

                  {/* RESPONSE BUTTONS */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {SRS2_RESPONSE_OPTIONS.map(opt => {
                      const isSelected = rating === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          style={{
                            flex: 1,
                            minWidth: '130px',
                            textAlign: 'center',
                            padding: '8px 10px',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 700 : 400,
                            borderRadius: '6px',
                            border: isSelected ? `2px solid ${domMeta?.color || '#059669'}` : '1.5px solid #e2e8f0',
                            backgroundColor: isSelected ? (domMeta?.bgLight || '#e6f4ea') : '#fff',
                            color: isSelected ? (domMeta?.color || '#047857') : '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease',
                          }}
                          onClick={() => handleScoreSelect(item.id, opt.value)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* MINI NOTE FOR THE ITEM */}
                  <div style={{ marginTop: 4 }}>
                    <input
                      type="text"
                      placeholder="📝 إضافة ملاحظة سريعة أو سلوك رصدته على هذا البند..."
                      style={{
                        width: '100%',
                        fontSize: '0.75rem',
                        border: 'none',
                        borderBottom: '1px dashed #cbd5e1',
                        padding: '3px 0',
                        color: '#64748b',
                        background: 'transparent',
                        outline: 'none',
                      }}
                      value={form.itemNotes[item.id] || ''}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* RECOMMENDATIONS & CLINICAL SUMMARY */}
          <div className="card" style={{ marginTop: 16, padding: 16, borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 12, color: '#1e293b' }}>
              📝 الخلاصة الإكلينيكية والتوصيات التأهيلية
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 4 }}>الملخص السلوكي والتشخيصي:</label>
                <textarea
                  className="input"
                  style={{ width: '100%', minHeight: 80, fontSize: '0.85rem', padding: 8 }}
                  placeholder="رأي الأخصائي النمائي والتحليل السلوكي المستنتج..."
                  value={form.clinicalSummary}
                  onChange={e => setForm(p => ({ ...p, clinicalSummary: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 4 }}>التوصيات والخطة العلاجية المقترحة:</label>
                <textarea
                  className="input"
                  style={{ width: '100%', minHeight: 80, fontSize: '0.85rem', padding: 8 }}
                  placeholder="توصيات التدخل كالعلاج الاجتماعي والسلوكي والتعليم الفردي..."
                  value={form.recommendations}
                  onChange={e => setForm(p => ({ ...p, recommendations: e.target.value }))}
                />
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div
          style={{
            padding: '12px 20px',
            background: '#f1f5f9',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            أجبت على {answeredCount} من 65 بنداً · تائية إجمالية متوقعة: {results.totalTScore || '—'}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-g" onClick={onClose}>
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-p"
              style={{
                background: '#059669',
                borderColor: '#059669',
                fontWeight: 700,
                padding: '8px 24px',
              }}
              onClick={handleSave}
            >
              💾 حفظ نتيجة التقييم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
