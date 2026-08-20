import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import { handleFileInputChange, FILE_ACCEPT_IMAGE } from '../../utils/fileUpload';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { sendReportToWhatsApp } from './programsWhatsApp';
import CARS2AssessmentModal from '../../components/assessments/CARS2AssessmentModal';
import CARS2ReportModal from '../../components/assessments/CARS2ReportModal';
import GARS3AssessmentModal from '../../components/assessments/GARS3AssessmentModal';
import GARS3ReportModal from '../../components/assessments/GARS3ReportModal';
import SRS2AssessmentModal from '../../components/assessments/SRS2AssessmentModal';
import SRS2ReportModal from '../../components/assessments/SRS2ReportModal';
import IepBridgeModal from './IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';
import {
  DEFAULT_SCALE_LIBRARY,
  MEASUREMENT_CATEGORIES,
  groupScalesByCategory,
  buildAssessmentResult,
  getScaleOptions,
  normalizeCategoryId,
} from '../../utils/measurementBank';

const PROGRAM_DOMAINS = [
  'التربية الخاصة', 'التدخل المبكر', 'مرحلة الروضة', 'صعوبات التعلم',
  'فرط الحركة ونقص الانتباه', 'تعديل السلوك', 'التكامل الحسي',
  'التفاعل الاجتماعي', 'الرعاية الذاتية', 'التخاطب والنطق', 'العلاج الطبيعي', 'العلاج الوظيفي'
];

const EMPTY_EVAL = {
  ...EMPTY_STU_PICK,
  dob: '', age: '', diagnosis: '', specialistName: '', photo: '',
  history: '', parentsInterview: '', appliedTools: '', observationSessions: '',
  recommendations: '', summary: '', domain: 'التربية الخاصة', date: '',
};

const EMPTY_ASSESSMENT = {
  ...EMPTY_STU_PICK,
  date: todayStr(),
  measureId: 'cars',
  notes: '',
  score: '',
  percentage: '',
  level: '',
  results: {},
  recommendations: '',
};

export default function PillarAssessment({ onDataChange }) {
  const { toast, center, currentUser } = useApp();
  const [subTab, setSubTab] = useState('initial'); // 'initial' | 'scales' | 'results'
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Initial Assessment States
  const [evaluations, setEvaluations] = useState([]);
  const [evalModal, setEvalModal] = useState(false);
  const [evalEditId, setEvalEditId] = useState(null);
  const [evalForm, setEvalForm] = useState({ ...EMPTY_EVAL, date: todayStr() });

  // Scales & Assessments States
  const [assessments, setAssessments] = useState([]);
  const [scaleModal, setScaleModal] = useState(false);
  const [scaleForm, setScaleForm] = useState(EMPTY_ASSESSMENT);
  const [selectedScaleId, setSelectedScaleId] = useState('cars');
  const [scaleResponses, setScaleResponses] = useState({});

  // CARS-2 Specific Specialized Modals States
  const [carsModalOpen, setCarsModalOpen] = useState(false);
  const [carsEditData, setCarsEditData] = useState(null);
  const [carsReportOpen, setCarsReportOpen] = useState(false);
  const [selectedCarsAssessment, setSelectedCarsAssessment] = useState(null);

  // GARS-3 Specific Specialized Modals States
  const [garsModalOpen, setGarsModalOpen] = useState(false);
  const [garsEditData, setGarsEditData] = useState(null);
  const [garsReportOpen, setGarsReportOpen] = useState(false);
  const [selectedGarsAssessment, setSelectedGarsAssessment] = useState(null);

  // SRS-2 Specific Specialized Modals States
  const [srsModalOpen, setSrsModalOpen] = useState(false);
  const [srsEditData, setSrsEditData] = useState(null);
  const [srsReportOpen, setSrsReportOpen] = useState(false);
  const [selectedSrsAssessment, setSelectedSrsAssessment] = useState(null);

  // IEP Bridge State
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const [bridgeAssessment, setBridgeAssessment] = useState(null);
  const [bridgeScaleItems, setBridgeScaleItems] = useState([]);

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setEvaluations(lsGet('progEvaluations').sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    setAssessments((lsGet('studentAssessments') || []).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    if (onDataChange) onDataChange();
  }

  useEffect(() => { reload(); }, []);

  const allScales = useMemo(() => {
    const custom = lsGet('measurements') || [];
    return [...DEFAULT_SCALE_LIBRARY, ...custom];
  }, []);

  const categoryMap = useMemo(() => {
    return Object.fromEntries(MEASUREMENT_CATEGORIES.map(c => [c.id, c]));
  }, []);

  const scalesGrouped = useMemo(() => {
    return groupScalesByCategory(allScales);
  }, [allScales]);

  const activeScale = useMemo(() => {
    return allScales.find(s => s.id === selectedScaleId) || allScales[0] || null;
  }, [selectedScaleId, allScales]);

  // Initial Assessment Form Handlers
  function openNewEval() {
    setEvalForm({ ...EMPTY_EVAL, date: todayStr() });
    setEvalEditId(null);
    setEvalModal(true);
  }

  function openEditEval(item) {
    setEvalForm({ ...EMPTY_EVAL, ...item });
    setEvalEditId(item.id);
    setEvalModal(true);
  }

  async function onEvalPhoto(e) {
    try {
      const res = await handleFileInputChange(e, { imagesOnly: true });
      if (res) setEvalForm(f => ({ ...f, photo: res.data }));
    } catch (ex) {
      toast('⚠️ ' + (ex.i18nKey === 'file.tooLarge' ? 'حجم الصورة يتجاوز 2 ميجا' : 'نوع الملف غير مدعوم'), 'er');
    }
  }

  function saveEval() {
    if (!validateStudentPick(evalForm)) { toast('⚠️ اختر الطالب من القائمة أو أدخل اسمه', 'er'); return; }
    if (!evalForm.date) { toast('⚠️ أدخل تاريخ التقييم', 'er'); return; }

    const payload = {
      ...evalForm,
      isUnregistered: evalForm.mode === 'other',
      updatedAt: new Date().toISOString(),
    };

    if (evalEditId) {
      lsUpd('progEvaluations', evalEditId, payload);
      toast('✅ تم تحديث التقييم المبدئي بنجاح', 'ok');
    } else {
      lsAdd('progEvaluations', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ التقييم المبدئي بنجاح', 'ok');
    }
    setEvalModal(false);
    reload();
  }

  function delEval(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    lsDel('progEvaluations', id);
    toast('🗑️ تم حذف التقييم', 'ok');
    reload();
  }

  // Scales Form Handlers
  function openNewScaleAssessment(scaleId) {
    if (scaleId === 'cars') {
      setCarsEditData(null);
      setCarsModalOpen(true);
      return;
    }
    if (scaleId === 'gars' || scaleId === 'gars3') {
      setGarsEditData(null);
      setGarsModalOpen(true);
      return;
    }
    if (scaleId === 'srs') {
      setSrsEditData(null);
      setSrsModalOpen(true);
      return;
    }
    const scale = allScales.find(s => s.id === scaleId) || activeScale;
    setSelectedScaleId(scale?.id || 'cars');
    setScaleResponses({});
    setScaleForm({
      ...EMPTY_ASSESSMENT,
      measureId: scale?.id || 'cars',
      date: todayStr(),
    });
    setScaleModal(true);
  }

  function openEditCarsAssessment(item) {
    setCarsEditData(item);
    setCarsModalOpen(true);
  }

  function openViewCarsReport(item) {
    setSelectedCarsAssessment(item);
    setCarsReportOpen(true);
  }

  function openEditGarsAssessment(item) {
    setGarsEditData(item);
    setGarsModalOpen(true);
  }

  function openViewGarsReport(item) {
    setSelectedGarsAssessment(item);
    setGarsReportOpen(true);
  }

  function openEditSrsAssessment(item) {
    setSrsEditData(item);
    setSrsModalOpen(true);
  }

  function openViewSrsReport(item) {
    setSelectedSrsAssessment(item);
    setSrsReportOpen(true);
  }

  function handleScaleOptionChange(itemId, value) {
    setScaleResponses(prev => ({
      ...prev,
      [itemId]: Number(value),
    }));
  }

  function saveScaleAssessment() {
    if (!validateStudentPick(scaleForm)) { toast('⚠️ اختر الطالب أولاً', 'er'); return; }
    if (!activeScale) { toast('⚠️ المقياس غير محدد', 'er'); return; }

    // Calculate score
    const resultObj = buildAssessmentResult(activeScale, scaleResponses);

    const payload = {
      ...scaleForm,
      measureId: activeScale.id,
      measureName: activeScale.name,
      category: activeScale.category,
      score: resultObj.score,
      maxScore: resultObj.maxScore,
      percentage: resultObj.percentage,
      level: resultObj.level,
      severityColor: resultObj.severityColor,
      results: scaleResponses,
      updatedAt: new Date().toISOString(),
    };

    lsAdd('studentAssessments', { ...payload, id: uid(), createdAt: new Date().toISOString() });
    toast(`✅ تم حفظ نتيجة المقياس (${resultObj.score}/${resultObj.maxScore}) بنجاح`, 'ok');
    setScaleModal(false);
    setSubTab('results');
    reload();
  }

  function delScaleAssessment(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذه النتيجة؟')) return;
    lsDel('studentAssessments', id);
    toast('🗑️ تم حذف النتيجة', 'ok');
    reload();
  }

  function handleOpenBridge(item) {
    const scale = allScales.find(s => s.id === item.measureId) || null;
    setBridgeScaleItems(scale?.items || []);
    setBridgeAssessment(item);
    setBridgeOpen(true);
  }

  // Printing
  function printEvalItem(item) {
    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;">
        <h2 style="color:#1a56db;border-bottom:2px solid #1a56db;padding-bottom:8px;margin-bottom:14px;">
          🎯 تقرير التقييم والتشخيص المبدئي الشامل
        </h2>
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;">
          <tr>
            <td><b>اسم الطالب:</b> ${item.studentName || '—'}</td>
            <td><b>العمر الزمني:</b> ${item.age || '—'}</td>
            <td><b>تاريخ التقييم:</b> ${item.date || '—'}</td>
          </tr>
          <tr>
            <td><b>التشخيص:</b> ${item.diagnosis || '—'}</td>
            <td><b>المجال المستهدف:</b> ${item.domain || '—'}</td>
            <td><b>الأخصائي القائم بالتقييم:</b> ${item.specialistName || '—'}</td>
          </tr>
        </table>
        ${item.history ? `<h3>📜 التاريخ التطوري والحالة النمائية:</h3><p style="white-space:pre-wrap;">${item.history}</p>` : ''}
        ${item.parentsInterview ? `<h3>👨‍👩‍👧 نتائج مقابلة ولي الأمر والملاحظة:</h3><p style="white-space:pre-wrap;">${item.parentsInterview}</p>` : ''}
        ${item.appliedTools ? `<h3>🧪 الأدوات والمقاييس المستخدمة:</h3><p style="white-space:pre-wrap;">${item.appliedTools}</p>` : ''}
        ${item.observationSessions ? `<h3>👁️ ملاحظات الجلسات التشخيصية:</h3><p style="white-space:pre-wrap;">${item.observationSessions}</p>` : ''}
        ${item.summary ? `<h3>📌 الخلاصة ومستوى الأداء الحالي:</h3><p style="white-space:pre-wrap;">${item.summary}</p>` : ''}
        ${item.recommendations ? `<h3>💡 التوصيات والبرنامج المقترح:</h3><p style="white-space:pre-wrap;">${item.recommendations}</p>` : ''}
        <div style="margin-top:30px;display:flex;justify-content:space-between;border-top:1px dashed #94a3b8;padding-top:16px;">
          <div><b>توقيع الأخصائي:</b> _______________</div>
          <div><b>اعتماد مدير المركز:</b> _______________</div>
        </div>
      </div>
    `;
    printItem({ html }, 'evaluation', center?.logo, center?.name);
  }

  // Filtered lists
  const filteredEvals = evaluations.filter(e => {
    const matchSearch = !searchTerm || (e.studentName && e.studentName.includes(searchTerm)) || (e.domain && e.domain.includes(searchTerm));
    const matchStu = !selectedStudentFilter || e.stuId === selectedStudentFilter;
    return matchSearch && matchStu;
  });

  const filteredAssessments = assessments.filter(a => {
    const matchSearch = !searchTerm || (a.studentName && a.studentName.includes(searchTerm)) || (a.measureName && a.measureName.includes(searchTerm));
    const matchStu = !selectedStudentFilter || a.stuId === selectedStudentFilter;
    const normCat = normalizeCategoryId(a.category);
    const matchCat = selectedCategoryFilter === 'all' || normCat === selectedCategoryFilter;
    return matchSearch && matchStu && matchCat;
  });

  const filteredScales = allScales.filter(s => {
    const normCat = normalizeCategoryId(s.category);
    const matchCat = selectedCategoryFilter === 'all' || normCat === selectedCategoryFilter;
    const matchSearch = !searchTerm || (s.name && s.name.includes(searchTerm)) || (s.nameEn && s.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) || (s.description && s.description.includes(searchTerm));
    return matchCat && matchSearch;
  });

  const currentCategoryMeta = categoryMap[selectedCategoryFilter] || null;

  return (
    <div>
      {/* Pillar Header & Controls using native Easy Center Tab System */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`tab ${subTab === 'initial' ? 'on' : ''}`}
            onClick={() => setSubTab('initial')}
          >
            📋 التقييم والتشخيص المبدئي ({evaluations.length})
          </button>
          <button
            type="button"
            className={`tab ${subTab === 'scales' ? 'on' : ''}`}
            onClick={() => setSubTab('scales')}
          >
            🧪 مقاييس وتشخيص مقنن ({allScales.length})
          </button>
          <button
            type="button"
            className={`tab ${subTab === 'results' ? 'on' : ''}`}
            onClick={() => setSubTab('results')}
          >
            📊 نتائج المقاييس المسجلة ({assessments.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {subTab === 'initial' && (
            <button type="button" className="btn btn-p" onClick={openNewEval}>
              ➕ تقييم مبدئي جديد
            </button>
          )}
          {subTab === 'scales' && (
            <button type="button" className="btn btn-p" onClick={() => openNewScaleAssessment(selectedScaleId)}>
              ➕ تطبيق مقياس لطالب
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="prog-filter-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input
          type="text"
          className="prog-search-input"
          style={{ flex: '1 1 220px' }}
          placeholder="🔍 بحث باسم الطالب، المقياس، أو الفئة التشخيصية..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="prog-select-filter"
          style={{ flex: '0 1 200px' }}
          value={selectedStudentFilter}
          onChange={e => setSelectedStudentFilter(e.target.value)}
        >
          <option value="">— تصفية بكل الطلاب —</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select
          className="prog-select-filter"
          style={{ flex: '0 1 220px' }}
          value={selectedCategoryFilter}
          onChange={e => setSelectedCategoryFilter(e.target.value)}
        >
          <option value="all">🌟 جميع الفئات التشخيصية (13 فئة)</option>
          {MEASUREMENT_CATEGORIES.map(cat => {
            const count = (scalesGrouped[cat.id] || []).length;
            return (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name} ({count})
              </option>
            );
          })}
        </select>

        {(searchTerm || selectedStudentFilter || selectedCategoryFilter !== 'all') && (
          <button
            type="button"
            className="btn btn-sm btn-g"
            onClick={() => { setSearchTerm(''); setSelectedStudentFilter(''); setSelectedCategoryFilter('all'); }}
          >
            إلغاء التصفية ✖
          </button>
        )}
      </div>

      {/* SUBTAB 1: INITIAL COMPREHENSIVE ASSESSMENTS */}
      {subTab === 'initial' && (
        <div>
          {filteredEvals.length === 0 ? (
            <EmptyState icon="🎯" title="لا توجد تقييمات مبدئية مسجلة بعد" sub="اضغط ➕ تقييم مبدئي جديد لبدء توثيق رحلة تشخيص الطالب" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filteredEvals.map(item => (
                <div key={item.id} className="prog-item-card" style={{ gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div className="prog-student-avatar">
                        {item.photo ? <img src={item.photo} alt="" /> : '👦'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="prog-student-name">{item.studentName}</div>
                        <div className="prog-student-meta">{item.diagnosis || 'تشخيص عام'} · {item.date}</div>
                      </div>
                    </div>
                    <span className="bdg b-bl" style={{ flexShrink: 0 }}>{item.domain || 'تربية خاصة'}</span>
                  </div>

                  {item.summary && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-sub)', background: 'var(--g0)', padding: '8px 10px', borderRadius: 'var(--r3)', lineHeight: 1.55, maxHeight: 68, overflow: 'hidden' }}>
                      {item.summary}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ color: 'var(--text-sub)' }}>الأخصائي: <strong style={{ color: 'var(--text-main)' }}>{item.specialistName || '—'}</strong></span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {item.parentPhone && (
                        <button
                          type="button"
                          className="btn btn-xs btn-s"
                          title="إرسال ملخص لولي الأمر عبر واتساب"
                          onClick={() => {
                            sendReportToWhatsApp({
                              parentPhone: item.parentPhone,
                              parentName: item.parentName,
                              studentName: item.studentName,
                              reportTitle: `التقييم المبدئي (${item.domain})`,
                              reportType: 'التقييم والتشخيص الشامل',
                              date: item.date,
                              summary: item.summary,
                              recommendations: item.recommendations,
                              specialistName: item.specialistName,
                              centerName: center?.name,
                            });
                          }}
                        >
                          💬 واتساب
                        </button>
                      )}
                      <button type="button" className="btn btn-xs btn-bl" title="طباعة" onClick={() => printEvalItem(item)}>🖨️</button>
                      <button type="button" className="btn btn-xs btn-g" title="تعديل" onClick={() => openEditEval(item)}>✏️</button>
                      <button type="button" className="btn btn-xs btn-d" title="حذف" onClick={() => delEval(item.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: SCALES LIBRARY WITH 13 DIAGNOSTIC CATEGORIES */}
      {subTab === 'scales' && (
        <div>
          {/* CATEGORIES BROWSER STRIP */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📑 الفئات التشخيصية المعتمدة للتربية الخاصة</span>
                <span className="bdg b-bl" style={{ fontSize: '.72rem' }}>13 فئة مقننة</span>
              </div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>
                انقر على أي فئة لاستعراض مقاييسها
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 8,
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
              }}
            >
              <button
                type="button"
                className={`btn btn-sm ${selectedCategoryFilter === 'all' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setSelectedCategoryFilter('all')}
                style={{
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontWeight: selectedCategoryFilter === 'all' ? 800 : 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                🌟 جميع المقاييس ({allScales.length})
              </button>

              {MEASUREMENT_CATEGORIES.map(cat => {
                const count = (scalesGrouped[cat.id] || []).length;
                const isSelected = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`btn btn-sm ${isSelected ? 'btn-p' : 'btn-g'}`}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    style={{
                      borderRadius: 20,
                      padding: '6px 14px',
                      fontWeight: isSelected ? 800 : 600,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    title={cat.nameEn}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--g1)',
                        padding: '1px 6px',
                        borderRadius: 10,
                        fontSize: '.72rem',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Category Description Banner if specific category selected */}
          {currentCategoryMeta && (
            <div
              style={{
                background: 'var(--pr-l)',
                border: '1px solid var(--pr)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>{currentCategoryMeta.icon}</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{currentCategoryMeta.name}</strong>
                  <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>({currentCategoryMeta.nameEn})</span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '.82rem', color: 'var(--text-sub)' }}>
                  {currentCategoryMeta.description}
                </p>
              </div>
              <span className="bdg b-bl" style={{ fontWeight: 800 }}>
                {(scalesGrouped[currentCategoryMeta.id] || []).length} مقاييس متوفرة
              </span>
            </div>
          )}

          {/* Featured Highlight Card for CARS-2 and GARS-3 if Autism or All is active */}
          {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'autism') && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 14,
                marginBottom: 20,
              }}
            >
              {/* CARS-2 Highlight */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.08), rgba(59, 130, 246, 0.04))',
                  border: '1.5px solid var(--pr)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="bdg b-bl" style={{ fontWeight: 900, fontSize: '.72rem' }}>المعيار الذهبي للتشخيص</span>
                    <span className="bdg b-gr" style={{ fontWeight: 800, fontSize: '.72rem' }}>CARS-2 ST</span>
                  </div>
                  <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    🧩 مقياس تقدير التوحد في الطفولة (CARS-2)
                  </h3>
                  <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45 }}>
                    15 مجالاً تشخيصياً معتمداً · سلم تقدير متدرج (1.0 إلى 4.0) · درجات معيارية T ورتب مئينية واشتقاق IEP
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-p"
                  onClick={() => { setCarsEditData(null); setCarsModalOpen(true); }}
                  style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', width: '100%' }}
                >
                  🚀 فتح أداة فحص وتطبيق CARS-2
                </button>
              </div>

              {/* GARS-3 Highlight */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(20, 184, 166, 0.04))',
                  border: '1.5px solid #0d9488',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="bdg" style={{ background: '#ccfbf1', color: '#0f766e', fontWeight: 900, fontSize: '.72rem' }}>وفق معايير DSM-5</span>
                    <span className="bdg b-gr" style={{ fontWeight: 800, fontSize: '.72rem' }}>GARS-3 المقنن</span>
                  </div>
                  <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    📊 مقياس جيليام لتقدير التوحد — الإصدار الثالث (GARS-3)
                  </h3>
                  <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45 }}>
                    58 بنداً مقنناً · 6 مقاييس فرعية (لفظي / غير لفظي) · معامل التوحد AQ ومستويات الدعم الثلاثة DSM-5
                  </p>
                </div>

                <button
                  type="button"
                  className="btn"
                  onClick={() => { setGarsEditData(null); setGarsModalOpen(true); }}
                  style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: '#0d9488', color: '#fff', width: '100%' }}
                >
                  🚀 فتح أداة فحص وتطبيق GARS-3
                </button>
              </div>

              {/* SRS-2 Highlight */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(16, 185, 129, 0.04))',
                  border: '1.5px solid #059669',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="bdg" style={{ background: '#d1fae5', color: '#047857', fontWeight: 900, fontSize: '.72rem' }}>التفاعل والتواصل المتبادل</span>
                    <span className="bdg b-gr" style={{ fontWeight: 800, fontSize: '.72rem' }}>SRS-2 المقنن</span>
                  </div>
                  <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    👥 مقياس الاستجابة الاجتماعية — الإصدار الثاني (SRS-2)
                  </h3>
                  <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45 }}>
                    65 عبارة سيكومترية · 5 مقاييس فرعية دقيقة · درجات معيارية تائية T متوافقة مع معايير DSM-5 واشتقاق IEP تلقائي
                  </p>
                </div>

                <button
                  type="button"
                  className="btn"
                  onClick={() => { setSrsEditData(null); setSrsModalOpen(true); }}
                  style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: '#059669', color: '#fff', width: '100%' }}
                >
                  🚀 فتح أداة فحص وتطبيق SRS-2
                </button>
              </div>
            </div>
          )}

          {/* SCALES GRID */}
          {filteredScales.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="لم يتم العثور على مقاييس تطابق البحث أو الفئة المختارة"
              sub="جرب تغيير الفئة التشخيصية أو تفريغ خانة البحث"
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
              {filteredScales.map(scale => {
                const isCars = scale.id === 'cars';
                const isGars = scale.id === 'gars' || scale.id === 'gars3';
                const normCat = normalizeCategoryId(scale.category);
                const catMeta = categoryMap[normCat] || { name: 'مقياس مقنن', icon: '📝', color: '#1a56db' };

                return (
                  <div
                    key={scale.id}
                    className="prog-scale-card"
                    style={{
                      border: isCars ? '2px solid var(--pr)' : isGars ? '2px solid #0d9488' : selectedScaleId === scale.id ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                      background: isCars ? 'var(--pr-l)' : isGars ? 'rgba(13, 148, 136, 0.05)' : selectedScaleId === scale.id ? 'var(--pr-l)' : 'var(--bg-card)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 6 }}>
                      <span className="bdg b-bl" style={{ fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{catMeta.icon}</span>
                        <span>{catMeta.name}</span>
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                        {scale.items?.length || 15} بنداً
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {scale.name}
                    </h4>
                    {scale.nameEn && (
                      <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 8, direction: 'ltr', textAlign: 'right' }}>
                        {scale.nameEn}
                      </div>
                    )}

                    <p style={{ fontSize: '.78rem', color: 'var(--text-sub)', margin: '0 0 14px 0', minHeight: 40, lineHeight: 1.5 }}>
                      {scale.description || scale.thresholdText || 'مقياس تشخيصي مقنن لتحديد مستوى الأداء وخطط التدخل'}
                    </p>

                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button
                        type="button"
                        className="btn btn-p btn-sm"
                        style={{
                          flex: 1,
                          fontWeight: 700,
                          background: isGars ? '#0d9488' : undefined,
                          borderColor: isGars ? '#0d9488' : undefined,
                        }}
                        onClick={() => openNewScaleAssessment(scale.id)}
                      >
                        {isCars ? '🧩 تطبيق CARS-2 الآن' : isGars ? '📊 تطبيق GARS-3 الآن' : '📝 تطبيق المقياس الآن'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: ASSESSMENTS RESULTS */}
      {subTab === 'results' && (
        <div>
          {filteredAssessments.length === 0 ? (
            <EmptyState icon="📊" title="لا توجد نتائج مقاييس مسجلة" sub="اختر أحد المقاييس وطبقه على طالب لحفظ نتائجه ومستواه" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filteredAssessments.map(item => {
                const isCars = item.measureId === 'cars' || item.scaleType === 'cars2';
                const isGars = item.measureId === 'gars' || item.measureId === 'gars3' || item.scaleType === 'gars3';
                const isSrs = item.measureId === 'srs' || item.scaleType === 'srs2' || item.measureId === 'srs2';
                return (
                  <div
                    key={item.id}
                    className="prog-item-card"
                    style={{
                      border: isCars ? '1.5px solid var(--pr)' : isGars ? '1.5px solid #0d9488' : isSrs ? '1.5px solid #059669' : '1px solid var(--border-color)',
                      boxShadow: isCars ? '0 4px 12px rgba(37, 99, 235, 0.08)' : isGars ? '0 4px 12px rgba(13, 148, 136, 0.08)' : isSrs ? '0 4px 12px rgba(5, 150, 105, 0.08)' : 'var(--sh)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <div>
                        <div className="prog-student-name" style={{ fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{item.studentName}</span>
                          {isCars && <span className="bdg b-bl" style={{ fontSize: '.68rem', padding: '1px 6px' }}>CARS-2</span>}
                          {isGars && <span className="bdg" style={{ background: '#ccfbf1', color: '#0f766e', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>GARS-3</span>}
                          {isSrs && <span className="bdg" style={{ background: '#d1fae5', color: '#047857', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>SRS-2</span>}
                        </div>
                        <div className="prog-student-meta">{item.measureName} · {item.date}</div>
                      </div>
                      <span className="bdg b-gr" style={{ fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>
                        {isGars ? `معامل AQ: ${item.autismQuotient || item.score}` : isSrs ? `الدرجة: ${item.score} / ${item.maxScore}` : `الدرجة: ${item.score} / ${item.maxScore}`}
                      </span>
                    </div>

                    {isCars && (item.tScore || item.percentile) && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)' }}>
                        <span>درجة معيارية T: <strong style={{ color: 'var(--text-main)' }}>{item.tScore}</strong></span>
                        <span>رتبة مئينية: <strong style={{ color: 'var(--text-main)' }}>{item.percentile}%</strong></span>
                      </div>
                    )}

                    {isGars && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>معامل التوحد AQ: <strong style={{ color: '#0d9488' }}>{item.autismQuotient || item.score}</strong></span>
                        <span>الرتبة المئينية: <strong style={{ color: 'var(--text-main)' }}>{item.percentile || 0}%</strong></span>
                        <span>النمط: <strong style={{ color: 'var(--text-sub)' }}>{item.isVerbal ? 'لفظي (6 مقاييس)' : 'غير لفظي (4 مقاييس)'}</strong></span>
                      </div>
                    )}

                    {isSrs && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>درجة تائية T: <strong style={{ color: '#059669' }}>{item.tScore || '—'} T</strong></span>
                        <span>الدرجة الخام الإجمالية: <strong style={{ color: 'var(--text-main)' }}>{item.rawScore || item.score} / 260</strong></span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, margin: '8px 0', alignItems: 'center' }}>
                      <div style={{ flex: 1, background: 'var(--g1)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: item.percentage || '50%', background: isGars ? '#0d9488' : isSrs ? '#059669' : 'var(--pr)', height: '100%' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.percentage}</span>
                    </div>

                    <div style={{ fontSize: '0.84rem', margin: '6px 0' }}>
                      <span style={{ color: 'var(--text-sub)' }}>المستوى التقديري: </span>
                      <strong style={{ color: item.severityColor || (isGars ? '#0d9488' : isSrs ? '#059669' : 'var(--pr)') }}>{item.level}</strong>
                    </div>

                    {item.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: 4 }}>{item.notes}</div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-xs btn-p"
                          style={{
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #4338ca, #2563eb)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          onClick={() => handleOpenBridge(item)}
                          title="اشتقاق أهداف سلوكية للخطة التربوية الفردية (IEP) تلقائياً من بنود التقييم"
                        >
                          <span>🎓</span>
                          <span>اشتقاق خطة فردية (IEP)</span>
                        </button>

                        {isCars && (
                          <button
                            type="button"
                            className="btn btn-xs btn-p"
                            onClick={() => openViewCarsReport(item)}
                            style={{ fontWeight: 800 }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isCars && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditCarsAssessment(item)}
                            title="تعديل درجات البنود"
                          >
                            ✏️
                          </button>
                        )}

                        {isGars && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewGarsReport(item)}
                            style={{ fontWeight: 800, background: '#0d9488', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isGars && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditGarsAssessment(item)}
                            title="تعديل درجات البنود"
                          >
                            ✏️
                          </button>
                        )}

                        {isSrs && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewSrsReport(item)}
                            style={{ fontWeight: 800, background: '#059669', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isSrs && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditSrsAssessment(item)}
                            title="تعديل درجات البنود"
                          >
                            ✏️
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        {item.parentPhone && (
                          <button
                            type="button"
                            className="btn btn-xs btn-s"
                            onClick={() => {
                              sendReportToWhatsApp({
                                parentPhone: item.parentPhone,
                                parentName: item.parentName,
                                studentName: item.studentName,
                                reportTitle: `نتيجة مقياس ${item.measureName}`,
                                reportType: 'نتائج الاختبارات والتشخيص',
                                date: item.date,
                                summary: `الدرجة المحققة: ${item.score}/${item.maxScore} (${item.percentage}) — المستوى التقديري: ${item.level}`,
                                recommendations: item.recommendations || item.notes,
                                specialistName: item.specialistName,
                                centerName: center?.name,
                              });
                            }}
                          >
                            💬 واتساب
                          </button>
                        )}
                        <button type="button" className="btn btn-xs btn-d" onClick={() => delScaleAssessment(item.id)}>🗑️ حذف</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CARS-2 SPECIALIZED ASSESSMENT WORKSTATION */}
      {carsModalOpen && (
        <CARS2AssessmentModal
          isOpen={carsModalOpen}
          onClose={() => setCarsModalOpen(false)}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={carsEditData}
        />
      )}

      {/* MODAL: CARS-2 OFFICIAL DIAGNOSTIC REPORT */}
      {carsReportOpen && selectedCarsAssessment && (
        <CARS2ReportModal
          isOpen={carsReportOpen}
          onClose={() => setCarsReportOpen(false)}
          assessment={selectedCarsAssessment}
          onEdit={(item) => openEditCarsAssessment(item)}
        />
      )}

      {/* MODAL: GARS-3 SPECIALIZED ASSESSMENT WORKSTATION */}
      {garsModalOpen && (
        <GARS3AssessmentModal
          isOpen={garsModalOpen}
          onClose={() => setGarsModalOpen(false)}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={garsEditData}
        />
      )}

      {/* MODAL: GARS-3 OFFICIAL DIAGNOSTIC REPORT */}
      {garsReportOpen && selectedGarsAssessment && (
        <GARS3ReportModal
          isOpen={garsReportOpen}
          onClose={() => setGarsReportOpen(false)}
          assessment={selectedGarsAssessment}
          onEdit={(item) => openEditGarsAssessment(item)}
        />
      )}

      {/* MODAL: SRS-2 SPECIALIZED ASSESSMENT WORKSTATION */}
      {srsModalOpen && (
        <SRS2AssessmentModal
          isOpen={srsModalOpen}
          onClose={() => setSrsModalOpen(false)}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={srsEditData}
        />
      )}

      {/* MODAL: SRS-2 OFFICIAL DIAGNOSTIC REPORT */}
      {srsReportOpen && selectedSrsAssessment && (
        <SRS2ReportModal
          isOpen={srsReportOpen}
          onClose={() => setSrsReportOpen(false)}
          assessment={selectedSrsAssessment}
          onEdit={(item) => openEditSrsAssessment(item)}
        />
      )}

      {/* MODAL: INITIAL ASSESSMENT FORM */}
      {evalModal && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>🎯 {evalEditId ? 'تعديل التقييم المبدئي' : 'إضافة تقييم مبدئي شامل جديد'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <StudentPicker form={evalForm} setForm={setEvalForm} students={students} emps={emps} showExtra />
                <div className="fl">
                  <label>تاريخ التقييم <span className="req">*</span></label>
                  <input type="date" value={evalForm.date} onChange={e => setEvalForm(f => ({ ...f, date: e.target.value }))}/>
                </div>
                <div className="fl">
                  <label>المجال المستهدف <span className="req">*</span></label>
                  <select value={evalForm.domain} onChange={e => setEvalForm(f => ({ ...f, domain: e.target.value }))}>
                    {PROGRAM_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="fl full">
                  <label>التاريخ التطوري والحالة النمائية</label>
                  <textarea value={evalForm.history} onChange={e => setEvalForm(f => ({ ...f, history: e.target.value }))} rows={3} placeholder="مراحل النمو، المشي، الكلام، التدخلات السابقة..."/>
                </div>
                <div className="fl full">
                  <label>نتائج مقابلة ولي الأمر والملاحظة المباشرة</label>
                  <textarea value={evalForm.parentsInterview} onChange={e => setEvalForm(f => ({ ...f, parentsInterview: e.target.value }))} rows={3} placeholder="شكوى الأهل الأساسية وسلوكيات الطفل في المنزل والمركز..."/>
                </div>
                <div className="fl full">
                  <label>الأدوات والمقاييس التشخيصية المطبقة</label>
                  <input value={evalForm.appliedTools} onChange={e => setEvalForm(f => ({ ...f, appliedTools: e.target.value }))} placeholder="مثال: مقياس كارز للتوحد، اختبار فاينلاند للسلوك التكيفي..."/>
                </div>
                <div className="fl full">
                  <label>ملخص مستوى الأداء الحالي ونقاط القوة والاحتياج</label>
                  <textarea value={evalForm.summary} onChange={e => setEvalForm(f => ({ ...f, summary: e.target.value }))} rows={3} placeholder="خلاصة التقييم، نقاط القوة الحالية والمهارات ذات الأولوية..."/>
                </div>
                <div className="fl full">
                  <label>التوصيات والبرنامج التأهيلي المقترح</label>
                  <textarea value={evalForm.recommendations} onChange={e => setEvalForm(f => ({ ...f, recommendations: e.target.value }))} rows={3} placeholder="عدد الجلسات المقترحة، نوع التدخل (تخاطب، وظيفي، سلوكي)..."/>
                </div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveEval}>💾 حفظ التقييم</button>
              <button type="button" className="btn btn-g" onClick={() => setEvalModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCALE APPLICATION FORM */}
      {scaleModal && activeScale && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>🧪 تطبيق مقياس: {activeScale.name}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2" style={{ marginBottom: 16 }}>
                <StudentPicker form={scaleForm} setForm={setScaleForm} students={students} emps={emps} showExtra />
                <div className="fl">
                  <label>تاريخ التطبيق</label>
                  <input type="date" value={scaleForm.date} onChange={e => setScaleForm(f => ({ ...f, date: e.target.value }))}/>
                </div>
              </div>

              <div style={{ background: 'var(--g0)', padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 4px 0' }}>بنود المقياس ({activeScale.items?.length || 0} بنداً):</h4>
                <p style={{ fontSize: '.8rem', color: 'var(--text-sub)', margin: 0 }}>حدد تقدير الدرجة لكل بند بناءً على الملاحظة المباشرة وسلوك الطفل</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(activeScale.items || []).map((it, idx) => {
                  const options = getScaleOptions(activeScale);
                  return (
                    <div key={it.id} style={{ padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-card)' }}>
                      <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 8 }}>
                        {idx + 1}. {it.text}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {options.map(val => (
                          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: 6, cursor: 'pointer', background: scaleResponses[it.id] === val ? 'var(--pr-l)' : 'transparent' }}>
                            <input
                              type="radio"
                              name={`scale_item_${it.id}`}
                              checked={scaleResponses[it.id] === val}
                              onChange={() => handleScaleOptionChange(it.id, val)}
                            />
                            <span style={{ fontSize: '.8rem' }}>درجة {val}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="fl full" style={{ marginTop: 14 }}>
                <label>ملاحظات وتوصيات إضافية للأخصائي</label>
                <textarea
                  value={scaleForm.notes}
                  onChange={e => setScaleForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="ملاحظات حول استجابة الطفل وظروف الاختبار..."
                />
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveScaleAssessment}>💾 حفظ وحساب نتيجة المقياس</button>
              <button type="button" className="btn btn-g" onClick={() => setScaleModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IEP BRIDGE GENERATOR */}
      {bridgeOpen && bridgeAssessment && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          student={{
            studentId: bridgeAssessment.stuId || bridgeAssessment.studentId,
            studentName: bridgeAssessment.studentName,
            nationalId: bridgeAssessment.nationalId,
            diagnosis: bridgeAssessment.diagnosis,
            className: bridgeAssessment.className,
            parentName: bridgeAssessment.parentName,
            parentPhone: bridgeAssessment.parentPhone,
          }}
          assessmentData={{
            measureId: bridgeAssessment.measureId || bridgeAssessment.scaleType || 'cars',
            measureName: bridgeAssessment.measureName || 'المقياس المقنن',
            date: bridgeAssessment.date,
            score: bridgeAssessment.score,
            results: bridgeAssessment.results || bridgeAssessment.scores || bridgeAssessment.responses || {},
          }}
          scaleItems={bridgeScaleItems}
        />
      )}
    </div>
  );
}
