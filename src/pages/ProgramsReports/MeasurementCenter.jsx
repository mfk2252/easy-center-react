import { useEffect, useMemo, useState } from 'react';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import {
  DEFAULT_SCALE_LIBRARY,
  MEASUREMENT_CATEGORIES,
  getScaleById,
  buildAssessmentResult,
  groupScalesByCategory,
  getScaleOptions,
} from '../../utils/measurementBank';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import CARS2AssessmentModal from '../../components/assessments/CARS2AssessmentModal';
import CARS2ReportModal from '../../components/assessments/CARS2ReportModal';
import LDESAssessmentModal from '../../components/assessments/LDESAssessmentModal';
import LDESReportModal from '../../components/assessments/LDESReportModal';
import DevLdAssessmentModal from '../../components/assessments/DevLdAssessmentModal';
import DevLdReportModal from '../../components/assessments/DevLdReportModal';
import LDDRSAssessmentModal from '../../components/assessments/LDDRSAssessmentModal';
import LDDRSReportModal from '../../components/assessments/LDDRSReportModal';
import FamilyDisintegrationAssessmentModal from '../../components/assessments/FamilyDisintegrationAssessmentModal';
import FamilyDisintegrationReportModal from '../../components/assessments/FamilyDisintegrationReportModal';

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
  const [selectedCategoryId, setSelectedCategoryId] = useState('autism');
  const [assessments, setAssessments] = useState([]);

  // CARS-2 Specific Modals
  const [carsModalOpen, setCarsModalOpen] = useState(false);
  const [carsReportOpen, setCarsReportOpen] = useState(false);
  const [selectedCarsAssessment, setSelectedCarsAssessment] = useState(null);

  // LDES Specific Modals
  const [ldesModalOpen, setLdesModalOpen] = useState(false);
  const [ldesReportOpen, setLdesReportOpen] = useState(false);
  const [selectedLdesAssessment, setSelectedLdesAssessment] = useState(null);

  // Developmental LD Checklist (Pre-school) Specific Modals
  const [devLdModalOpen, setDevLdModalOpen] = useState(false);
  const [devLdReportOpen, setDevLdReportOpen] = useState(false);
  const [selectedDevLdAssessment, setSelectedDevLdAssessment] = useState(null);

  // LDDRS Battery (El-Zayat) Specific Modals
  const [lddrsModalOpen, setLddrsModalOpen] = useState(false);
  const [lddrsReportOpen, setLddrsReportOpen] = useState(false);
  const [selectedLddrsAssessment, setSelectedLddrsAssessment] = useState(null);

  // Family Disintegration Scale Specific Modals
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [familyReportOpen, setFamilyReportOpen] = useState(false);
  const [selectedFamilyAssessment, setSelectedFamilyAssessment] = useState(null);

  function reload() {
    setStudents(lsGet('students'));
    setScales(getAvailableScales());
    setAssessments(lsGet('studentAssessments') || []);
  }

  useEffect(() => { reload(); }, []);

  const categoryMap = useMemo(() => Object.fromEntries(MEASUREMENT_CATEGORIES.map(c => [c.id, c])), []);
  const groupedScales = useMemo(() => groupScalesByCategory(scales), [scales]);

  const selectedScale = useMemo(() => {
    return scales.find(scale => scale.id === selectedScaleId) || scales[0] || null;
  }, [selectedScaleId, scales]);

  const visibleCategoryScales = useMemo(() => {
    const current = groupedScales[selectedCategoryId] || [];
    return current;
  }, [groupedScales, selectedCategoryId]);

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
    if (scaleId === 'cars') {
      setCarsModalOpen(true);
      return;
    }
    if (scaleId === 'learning_difficulties' || scaleId === 'ldes') {
      setLdesModalOpen(true);
      return;
    }
    if (scaleId === 'dev_learning_difficulties' || scaleId === 'dev_ld_preschool') {
      setDevLdModalOpen(true);
      return;
    }
    if (scaleId === 'lddrs_battery' || scaleId === 'lddrs' || scaleId.startsWith('lddrs_')) {
      setLddrsModalOpen(true);
      return;
    }
    if (scaleId === 'family_disintegration' || scaleId === 'family') {
      setFamilyModalOpen(true);
      return;
    }
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
          <button type="button" className="btn btn-g" onClick={onBack}>← رجوع</button>
        </div>
      </div>

      <div className="wg" style={{ marginBottom: 18 }}>
        <div className="wg-h"><h3>📚 فئات المقاييس</h3></div>
        <div className="wg-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          {MEASUREMENT_CATEGORIES.map(cat => {
            const count = groupedScales[cat.id]?.length || 0;
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className="card"
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  gap: 8,
                  padding: 14,
                  textAlign: 'right',
                  cursor: 'pointer',
                  border: isActive ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                  background: isActive ? 'var(--pr-l)' : 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontFamily: 'Tajawal, sans-serif',
                  boxShadow: 'var(--sh)',
                }}
              >
                <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>{cat.icon}</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Tajawal, sans-serif' }}>{cat.name}</div>
                <div style={{ color: 'var(--text-sub)', fontSize: '.8rem', fontFamily: 'Tajawal, sans-serif' }}>{count} مقياس</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="wg" style={{ marginBottom: 18 }}>
        <div className="wg-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h3>{categoryMap[selectedCategoryId]?.icon || '🧩'} {categoryMap[selectedCategoryId]?.name || 'المقاييس'}</h3>
        </div>
        <div className="wg-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {visibleCategoryScales.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--g5)' }}>
              لا توجد مقاييس في هذه الفئة حالياً.
            </div>
          ) : (
            visibleCategoryScales.map(scale => (
              <div key={scale.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: '1.4rem' }}>{scale.icon || '🧪'}</div>
                  {!scale.isDefault && (
                    <span className="bdg b-or">مخصص للمركز</span>
                  )}
                </div>
                <div style={{ fontWeight: 800, marginTop: 8 }}>{scale.name}</div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="bdg b-cy">{categoryMap[scale.category]?.name || 'أخرى'}</span>
                  <button type="button" className="btn btn-p btn-sm" onClick={() => { setSelectedScaleId(scale.id); openAssessmentModal(scale.id); }}>تطبيق</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="wg">
        <div className="wg-h"><h3>📊 سجل تطبيقات المقاييس</h3></div>
        <div className="wg-b p0">
          {(assessments.length === 0) ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--g5)' }}>لا توجد تقييمات مسجلة بعد.</div>
          ) : (
            assessments.map(item => {
              const isCars = item.measureId === 'cars' || item.scaleType === 'cars2';
              const isLdes = item.measureId === 'learning_difficulties' || item.scaleType === 'learning_difficulties' || item.measureId === 'ldes';
              const isDevLd = item.measureId === 'dev_learning_difficulties' || item.scaleType === 'dev_learning_difficulties' || item.measureId === 'dev_ld_preschool' || item.scaleType === 'dev_ld_preschool';
              const isLddrs = item.measureId === 'lddrs_battery' || item.scaleType === 'lddrs' || item.measureId?.startsWith('lddrs');
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 12, borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{item.measureName || 'مقياس'}</span>
                      {isCars && <span className="bdg b-bl" style={{ fontSize: '.68rem' }}>CARS-2</span>}
                      {isLdes && <span className="bdg" style={{ background: '#fef3c7', color: '#b45309', fontSize: '.68rem', fontWeight: 800 }}>LDES</span>}
                      {isDevLd && <span className="bdg" style={{ background: '#ccfbf1', color: '#0f766e', fontSize: '.68rem', fontWeight: 800 }}>صعوبات الروضة</span>}
                      {isLddrs && <span className="bdg" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '.68rem', fontWeight: 800 }}>بطارية الزيات</span>}
                    </div>
                    <div style={{ fontSize: '.76rem', color: 'var(--g5)' }}>
                      {item.studentName || 'طالب'} • {item.date} • {item.level || 'نتيجة'} {item.tScore ? `(T: ${item.tScore} | ${item.percentile}%)` : ''} {item.percentage ? `(${item.percentage})` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="bdg b-cy">الدرجة: {item.score ?? 0}</span>
                    {isCars && (
                      <button
                        type="button"
                        className="btn btn-xs btn-p"
                        onClick={() => {
                          setSelectedCarsAssessment(item);
                          setCarsReportOpen(true);
                        }}
                      >
                        📄 تقرير CARS-2
                      </button>
                    )}
                    {isLdes && (
                      <button
                        type="button"
                        className="btn btn-xs"
                        style={{ background: '#d97706', color: '#fff', fontWeight: 800 }}
                        onClick={() => {
                          setSelectedLdesAssessment(item);
                          setLdesReportOpen(true);
                        }}
                      >
                        📄 تقرير LDES
                      </button>
                    )}
                    {isDevLd && (
                      <button
                        type="button"
                        className="btn btn-xs"
                        style={{ background: '#0d9488', color: '#fff', fontWeight: 800 }}
                        onClick={() => {
                          setSelectedDevLdAssessment(item);
                          setDevLdReportOpen(true);
                        }}
                      >
                        📄 تقرير صعوبات الروضة
                      </button>
                    )}
                    {isLddrs && (
                      <button
                        type="button"
                        className="btn btn-xs"
                        style={{ background: '#dc2626', color: '#fff', fontWeight: 800 }}
                        onClick={() => {
                          setSelectedLddrsAssessment(item);
                          setLddrsReportOpen(true);
                        }}
                      >
                        📄 تقرير بطارية الزيات
                      </button>
                    )}
                    <button type="button" className="btn btn-xs btn-d" onClick={() => deleteAssessment(item.id)}>🗑️</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CARS-2 MODALS */}
      {carsModalOpen && (
        <CARS2AssessmentModal
          isOpen={carsModalOpen}
          onClose={() => setCarsModalOpen(false)}
          onSaved={() => reload()}
          students={students}
          emps={[]}
        />
      )}

      {carsReportOpen && selectedCarsAssessment && (
        <CARS2ReportModal
          isOpen={carsReportOpen}
          onClose={() => setCarsReportOpen(false)}
          assessment={selectedCarsAssessment}
        />
      )}

      {/* LDES MODALS */}
      {ldesModalOpen && (
        <LDESAssessmentModal
          isOpen={ldesModalOpen}
          onClose={() => setLdesModalOpen(false)}
          onSaved={() => reload()}
          students={students}
          emps={[]}
        />
      )}

      {ldesReportOpen && selectedLdesAssessment && (
        <LDESReportModal
          isOpen={ldesReportOpen}
          onClose={() => setLdesReportOpen(false)}
          assessment={selectedLdesAssessment}
        />
      )}

      {/* DEV LD (PRESCHOOL) MODALS */}
      {devLdModalOpen && (
        <DevLdAssessmentModal
          isOpen={devLdModalOpen}
          onClose={() => setDevLdModalOpen(false)}
          onSaved={() => reload()}
          students={students}
          emps={[]}
        />
      )}

      {devLdReportOpen && selectedDevLdAssessment && (
        <DevLdReportModal
          isOpen={devLdReportOpen}
          onClose={() => setDevLdReportOpen(false)}
          assessment={selectedDevLdAssessment}
        />
      )}

      {/* LDDRS BATTERY (EL-ZAYAT) MODALS */}
      {lddrsModalOpen && (
        <LDDRSAssessmentModal
          isOpen={lddrsModalOpen}
          onClose={() => setLddrsModalOpen(false)}
          onSaved={() => reload()}
          students={students}
          emps={[]}
        />
      )}

      {lddrsReportOpen && selectedLddrsAssessment && (
        <LDDRSReportModal
          isOpen={lddrsReportOpen}
          onClose={() => setLddrsReportOpen(false)}
          assessment={selectedLddrsAssessment}
        />
      )}

      {/* FAMILY DISINTEGRATION MODALS */}
      {familyModalOpen && (
        <FamilyDisintegrationAssessmentModal
          isOpen={familyModalOpen}
          onClose={() => setFamilyModalOpen(false)}
          onSaved={() => reload()}
          students={students}
          emps={[]}
        />
      )}

      {familyReportOpen && selectedFamilyAssessment && (
        <FamilyDisintegrationReportModal
          isOpen={familyReportOpen}
          onClose={() => setFamilyReportOpen(false)}
          assessment={selectedFamilyAssessment}
        />
      )}

      {measureModal && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setMeasureModal(false)}>
          <div className="mb" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: 'min(94vh, calc(100dvh - 20px))', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd modal-header-custom" style={{ padding: '12px 18px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)' }}>➕ إضافة مقياس جديد للمركز</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>تعريف وتخصيص مقياس جديد بفئاته وقيمه</span>
              </div>
              <button type="button" className="btn btn-xs btn-p" onClick={() => setMeasureModal(false)} style={{ fontWeight: 700 }}>✖ إغلاق</button>
            </div>
            <div className="modal-body-scroll" style={{ padding: '16px 18px', flex: 1, overflowY: 'auto' }}>
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
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: 'min(94vh, calc(100dvh - 20px))', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd modal-header-custom" style={{ padding: '12px 18px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)' }}>📝 تطبيق {selectedScale.name}</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>تسجيل استجابات وبنود التقييم للطالب</span>
              </div>
              <button type="button" className="btn btn-xs btn-p" onClick={() => setAssessmentModal(false)} style={{ fontWeight: 700 }}>✖ إغلاق</button>
            </div>
            <div className="modal-body-scroll" style={{ padding: '16px 18px', flex: 1, overflowY: 'auto' }}>
              <div className="fg c2">
                <StudentPicker form={assessmentForm} setForm={setAssessmentForm} students={students} emps={[]} showExtra />
                <div className="fl full"><label>تاريخ التطبيق</label><input type="date" value={assessmentForm.date} onChange={e => setAssessmentForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div className="fl full"><label>ملاحظات</label><textarea value={assessmentForm.notes} onChange={e => setAssessmentForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>
              </div>

              {(selectedScale.items || []).map((item, index) => {
                const options = getScaleOptions(selectedScale);
                return (
                  <div key={item.id} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 12, marginTop: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>{index + 1}. {item.text}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {options.map(opt => (
                        <label key={`${item.id}-${opt}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 10px', background: 'var(--bg-card)' }}>
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
                );
              })}
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
