import { useEffect, useMemo, useState } from 'react';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { DEFAULT_SCALE_LIBRARY, MEASUREMENT_CATEGORIES, getScaleById, buildAssessmentResult } from '../../utils/measurementBank';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';

const EMPTY_MEASURE = {
  id: '',
  name: '',
  category: 'autism',
  description: '',
  isDefault: false,
  scoreMode: 'sum',
  responseType: 'scale',
  minValue: 1,
  maxValue: 4,
  thresholdText: '',
};

const EMPTY_ASSESSMENT = {
  ...EMPTY_STU_PICK,
  date: todayStr(),
  measureId: '',
  notes: '',
  score: '',
  percentage: '',
  level: '',
  results: {},
};

function getCustomMeasurements() {
  return lsGet('measurements') || [];
}

function getAvailableScales() {
  const custom = getCustomMeasurements();
  return [...DEFAULT_SCALE_LIBRARY, ...custom];
}

export default function MeasurementCenter({ onBack }) {
  const [students, setStudents] = useState([]);
  const [scales, setScales] = useState([]);
  const [measureForm, setMeasureForm] = useState(EMPTY_MEASURE);
  const [assessmentForm, setAssessmentForm] = useState(EMPTY_ASSESSMENT);
  const [measureModal, setMeasureModal] = useState(false);
  const [assessmentModal, setAssessmentModal] = useState(false);
  const [selectedScaleId, setSelectedScaleId] = useState('cars');
  const [assessments, setAssessments] = useState([]);

  function reload() {
    setStudents(lsGet('students'));
    setScales(getAvailableScales());
    setAssessments(lsGet('studentAssessments') || []);
  }

  useEffect(() => { reload(); }, []);

  const categoryMap = useMemo(() => Object.fromEntries(MEASUREMENT_CATEGORIES.map(c => [c.id, c])), []);

  const selectedScale = useMemo(() => {
    const list = getAvailableScales();
    return list.find(scale => scale.id === selectedScaleId) || list[0] || null;
  }, [selectedScaleId, scales]);

  function openMeasureModal() {
    setMeasureForm({ ...EMPTY_MEASURE, category: 'autism' });
    setMeasureModal(true);
  }

  function saveMeasure() {
    if (!measureForm.name.trim()) {
      alert('أدخل اسم المقياس');
      return;
    }

    const payload = {
      ...measureForm,
      id: measureForm.id || `custom_${uid()}`,
      name: measureForm.name.trim(),
      description: measureForm.description.trim(),
      isDefault: false,
      items: [
        { id: 'item_1', text: 'بند 1', domain: 'general' },
        { id: 'item_2', text: 'بند 2', domain: 'general' },
      ],
      maxScore: 20,
      scoreMode: measureForm.scoreMode || 'sum',
      responseType: measureForm.responseType || 'scale',
    };

    const current = getCustomMeasurements();
    const exists = current.find(s => s.id === payload.id);

    if (exists) {
      const updated = current.map(s => s.id === payload.id ? payload : s);
      lsUpd('measurements', payload.id, payload);
      lsAdd('measurements', payload);
      localStorage.setItem(`${getCenterId()}_measurements`, JSON.stringify(updated));
    } else {
      lsAdd('measurements', payload);
    }

    setMeasureModal(false);
    reload();
  }

  function getCenterId() {
    try {
      const session = JSON.parse(localStorage.getItem('scs_session') || 'null');
      if (session?.centerId) return session.centerId;
      return localStorage.getItem('scs_current_uid') || 'local';
    } catch { return 'local'; }
  }

  function openAssessmentModal(scaleId) {
    const scale = getAvailableScales().find(item => item.id === scaleId);
    if (!scale) return;
    const answerDefaults = {};
    (scale.items || []).forEach(item => {
      answerDefaults[item.id] = '';
    });

    setSelectedScaleId(scaleId);
    setAssessmentForm({
      ...EMPTY_ASSESSMENT,
      measureId: scaleId,
      results: answerDefaults,
    });
    setAssessmentModal(true);
  }

  function handleAnswerChange(itemId, value) {
    setAssessmentForm(form => ({
      ...form,
      results: {
        ...(form.results || {}),
        [itemId]: value,
      },
    }));
  }

  function saveAssessment() {
    if (!validateStudentPick(assessmentForm)) {
      alert('اختر الطالب أولاً');
      return;
    }

    const scale = getAvailableScales().find(item => item.id === assessmentForm.measureId) || getScaleById(assessmentForm.measureId);
    if (!scale) {
      alert('المقياس غير موجود');
      return;
    }

    const result = buildAssessmentResult(scale, assessmentForm.results || {});
    const payload = {
      ...assessmentForm,
      id: uid(),
      measureName: scale.name,
      category: scale.category,
      score: result.total,
      percentage: result.percentage,
      level: result.level,
      color: result.color,
      resultNote: result.note,
      createdAt: new Date().toISOString(),
    };

    lsAdd('studentAssessments', payload);
    setAssessmentModal(false);
    reload();
  }

  function deleteAssessment(id) {
    if (!window.confirm('حذف هذا التقييم؟')) return;
    lsDel('studentAssessments', id);
    reload();
  }

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>🧪 المقاييس والتقييمات</h2>
          <p>مكتبة مقاييس مركزية + إمكانية إضافة مقاييس جديدة لكل مركز مع حفظها داخل هذا المركز فقط.</p>
        </div>
        <div className="ph-a" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-p" onClick={openMeasureModal}>➕ إضافة مقياس جديد</button>
          {selectedScale && (
            <button type="button" className="btn btn-bl" onClick={() => openAssessmentModal(selectedScale.id)}>📝 تطبيق مقياس على طالب</button>
          )}
          <button type="button" className="btn btn-g" onClick={onBack}>← رجوع</button>
        </div>
      </div>

      <div className="wg" style={{ marginBottom: 18 }}>
        <div className="wg-h"><h3>📚 فئات المقاييس</h3></div>
        <div className="wg-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          {MEASUREMENT_CATEGORIES.map(cat => {
            const count = scales.filter(scale => scale.category === cat.id).length;
            return (
              <div key={cat.id} className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: '1.6rem' }}>{cat.icon}</div>
                <div style={{ fontWeight: 800 }}>{cat.name}</div>
                <div style={{ color: 'var(--g5)', fontSize: '.8rem' }}>{count} مقياس</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="wg" style={{ marginBottom: 18 }}>
        <div className="wg-h"><h3>🧩 المقاييس المتاحة</h3></div>
        <div className="wg-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {scales.map(scale => (
            <div key={scale.id} className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: '1.4rem' }}>{scale.icon || '🧪'}</div>
                {!scale.isDefault && (
                  <span className="bdg b-or">مخصص للمركز</span>
                )}
              </div>
              <div style={{ fontWeight: 800, marginTop: 8 }}>{scale.name}</div>
              <div style={{ color: 'var(--g5)', fontSize: '.8rem', marginTop: 4 }}>{scale.description}</div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="bdg b-cy">{categoryMap[scale.category]?.name || 'أخرى'}</span>
                <button type="button" className="btn btn-p btn-sm" onClick={() => { setSelectedScaleId(scale.id); openAssessmentModal(scale.id); }}>تطبيق</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wg">
        <div className="wg-h"><h3>📊 سجل تطبيقات المقاييس</h3></div>
        <div className="wg-b p0">
          {(assessments.length === 0) ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--g5)' }}>لا توجد تقييمات مسجلة بعد.</div>
          ) : (
            assessments.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 12, borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{item.measureName || 'مقياس'}</div>
                  <div style={{ fontSize: '.76rem', color: 'var(--g5)' }}>{item.studentName || 'طالب'} • {item.date} • {item.level || 'نتيجة'} </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="bdg b-cy">{item.score ?? 0}</span>
                  <button type="button" className="btn btn-xs btn-d" onClick={() => deleteAssessment(item.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {measureModal && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setMeasureModal(false)}>
          <div className="mb" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '14px 20px' }}><h2>➕ إضافة مقياس جديد للمركز</h2></div>
            <div style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <div className="fl full"><label>اسم المقياس</label><input value={measureForm.name} onChange={e => setMeasureForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="fl"><label>الفئة</label>
                  <select value={measureForm.category} onChange={e => setMeasureForm(f => ({ ...f, category: e.target.value }))}>
                    {MEASUREMENT_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="fl"><label>نوع الإجابة</label>
                  <select value={measureForm.responseType} onChange={e => setMeasureForm(f => ({ ...f, responseType: e.target.value }))}>
                    <option value="scale">مقياس</option>
                    <option value="yesno">نعم/لا</option>
                    <option value="number">رقم</option>
                  </select>
                </div>
                <div className="fl"><label>أقل قيمة</label><input type="number" value={measureForm.minValue} onChange={e => setMeasureForm(f => ({ ...f, minValue: Number(e.target.value) }))} /></div>
                <div className="fl"><label>أعلى قيمة</label><input type="number" value={measureForm.maxValue} onChange={e => setMeasureForm(f => ({ ...f, maxValue: Number(e.target.value) }))} /></div>
                <div className="fl full"><label>وصف المقياس</label><textarea value={measureForm.description} onChange={e => setMeasureForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                <div className="fl full"><label>تفسير النتيجة</label><textarea value={measureForm.thresholdText} onChange={e => setMeasureForm(f => ({ ...f, thresholdText: e.target.value }))} rows={2} /></div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveMeasure}>💾 حفظ</button>
              <button type="button" className="btn btn-g" onClick={() => setMeasureModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {assessmentModal && selectedScale && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setAssessmentModal(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '14px 20px' }}><h2>📝 تطبيق {selectedScale.name}</h2></div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <StudentPicker form={assessmentForm} setForm={setAssessmentForm} students={students} emps={[]} showExtra />
                <div className="fl full"><label>تاريخ التطبيق</label><input type="date" value={assessmentForm.date} onChange={e => setAssessmentForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div className="fl full"><label>ملاحظات</label><textarea value={assessmentForm.notes} onChange={e => setAssessmentForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>
              </div>

              {(selectedScale.items || []).map((item, index) => (
                <div key={item.id} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 12, marginTop: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{index + 1}. {item.text}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(selectedScale.responseType === 'yesno' ? ['لا', 'نعم'] : Array.from({ length: (selectedScale.maxValue || 5) - (selectedScale.minValue || 0) + 1 }, (_, i) => String(i + (selectedScale.minValue || 0)))).map(opt => (
                      <label key={opt} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 10px', background: 'var(--bg-card)' }}>
                        <input
                          type="radio"
                          name={item.id}
                          checked={String(assessmentForm.results?.[item.id] ?? '') === String(opt)}
                          onChange={() => handleAnswerChange(item.id, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveAssessment}>💾 حفظ التقييم</button>
              <button type="button" className="btn btn-g" onClick={() => setAssessmentModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
