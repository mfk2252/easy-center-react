import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import { handleFileInputChange, FILE_ACCEPT_IMAGE } from '../../utils/fileUpload';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { sendReportToWhatsApp } from './programsWhatsApp';
import {
  DEFAULT_SCALE_LIBRARY,
  MEASUREMENT_CATEGORIES,
  groupScalesByCategory,
  buildAssessmentResult,
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
      score: resultObj.score,
      maxScore: resultObj.maxScore,
      percentage: resultObj.percentage,
      level: resultObj.level,
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
    return matchSearch && matchStu;
  });

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
      <div className="prog-filter-bar">
        <input
          type="text"
          className="prog-search-input"
          placeholder="🔍 بحث باسم الطالب أو المجال أو المقياس..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="prog-select-filter"
          value={selectedStudentFilter}
          onChange={e => setSelectedStudentFilter(e.target.value)}
        >
          <option value="">— تصفية بكل الطلاب —</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {(searchTerm || selectedStudentFilter) && (
          <button type="button" className="btn btn-sm btn-g" onClick={() => { setSearchTerm(''); setSelectedStudentFilter(''); }}>
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

      {/* SUBTAB 2: SCALES LIBRARY */}
      {subTab === 'scales' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {allScales.map(scale => (
              <div
                key={scale.id}
                className="prog-scale-card"
                style={{
                  border: selectedScaleId === scale.id ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                  background: selectedScaleId === scale.id ? 'var(--pr-l)' : 'var(--bg-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="bdg b-or">{scale.categoryLabel || 'مقياس مقنن'}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 600 }}>{scale.items?.length || 15} بنداً</span>
                </div>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4 }}>
                  {scale.name}
                </h4>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="btn btn-p btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => openNewScaleAssessment(scale.id)}
                  >
                    📝 تطبيق المقياس الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: ASSESSMENTS RESULTS */}
      {subTab === 'results' && (
        <div>
          {filteredAssessments.length === 0 ? (
            <EmptyState icon="📊" title="لا توجد نتائج مقاييس مسجلة" sub="اختر أحد المقاييس وطبقه على طالب لحفظ نتائجه ومستواه" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filteredAssessments.map(item => (
                <div key={item.id} className="prog-item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                    <div>
                      <div className="prog-student-name" style={{ fontSize: '1.02rem' }}>{item.studentName}</div>
                      <div className="prog-student-meta">{item.measureName} · {item.date}</div>
                    </div>
                    <span className="bdg b-gr" style={{ fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>
                      الدرجة: {item.score} / {item.maxScore}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, margin: '8px 0', alignItems: 'center' }}>
                    <div style={{ flex: 1, background: 'var(--g1)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: item.percentage || '50%', background: 'var(--pr)', height: '100%' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.percentage}</span>
                  </div>

                  <div style={{ fontSize: '0.84rem', margin: '6px 0' }}>
                    <span style={{ color: 'var(--text-sub)' }}>المستوى التقديري: </span>
                    <strong style={{ color: 'var(--pr)' }}>{item.level}</strong>
                  </div>

                  {item.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: 4 }}>{item.notes}</div>}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
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
              ))}
            </div>
          )}
        </div>
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
                {(activeScale.items || []).map((it, idx) => (
                  <div key={it.id} style={{ padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-card)' }}>
                    <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 8 }}>
                      {idx + 1}. {it.text}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4].map(val => (
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
                ))}
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
    </div>
  );
}
