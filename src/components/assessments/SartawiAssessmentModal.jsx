import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SARTAWI_COPYRIGHT_INFO,
  SARTAWI_DIMENSIONS,
  SARTAWI_ITEMS,
  SARTAWI_RATING_OPTIONS,
  calculateSartawiPsychometrics,
} from '../../data/sartawiData';

export default function SartawiAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast } = useApp?.() || { toast: () => {} };

  const [selectedStudentId, setSelectedStudentId] = useState(
    initialData?.studentId || (students[0]?.id ? String(students[0].id) : '')
  );
  const [evaluatorName, setEvaluatorName] = useState(
    initialData?.evaluator || (emps[0]?.name || 'معلم / أخصائي صعوبات التعلم')
  );
  const [evaluatorRole, setEvaluatorRole] = useState(
    initialData?.evaluatorRole || 'معلم صعوبات التعلم / المرشد الطلابي'
  );
  const [relationship, setRelationship] = useState(
    initialData?.relationship || 'معلم الفصل / معلم صعوبات التعلم'
  );
  const [evalDate, setEvalDate] = useState(
    initialData?.date || todayStr()
  );
  const [schoolName, setSchoolName] = useState(
    initialData?.schoolName || 'مدرسة الابتدائية النموذجية'
  );
  const [semester, setSemester] = useState(
    initialData?.semester || 'الفصل الدراسي الأول'
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [activeDimensionId, setActiveDimensionId] = useState('all');
  const [scores, setScores] = useState(initialData?.scores || initialData?.results || {});
  const [viewMode, setViewMode] = useState('items'); // 'items' | 'summary'

  const selectedStudent = useMemo(() => {
    return students.find(s => String(s.id) === String(selectedStudentId)) || null;
  }, [students, selectedStudentId]);

  const psychometrics = useMemo(() => {
    return calculateSartawiPsychometrics(scores);
  }, [scores]);

  const filteredItems = useMemo(() => {
    if (activeDimensionId === 'all') return SARTAWI_ITEMS;
    return SARTAWI_ITEMS.filter(it => it.dimensionId === activeDimensionId);
  }, [activeDimensionId]);

  if (!isOpen) return null;

  function handleScoreChange(itemId, value) {
    setScores(prev => ({
      ...prev,
      [itemId]: Number(value),
    }));
  }

  function handleAutoFill(fillLevel = 'normal') {
    const newScores = {};

    SARTAWI_ITEMS.forEach(item => {
      if (fillLevel === 'normal') {
        // درجات منخفضة (1 أو 2) -> لا توجد صعوبات
        newScores[item.id] = Math.random() > 0.3 ? 1 : 2;
      } else if (fillLevel === 'borderline') {
        // درجات متوسطة (2 أو 3 أو 4)
        newScores[item.id] = Math.random() > 0.5 ? 3 : (Math.random() > 0.5 ? 2 : 4);
      } else if (fillLevel === 'ld') {
        // درجات عالية (4 أو 5) -> صعوبة تعلم محتملة ومؤكدة
        newScores[item.id] = Math.random() > 0.3 ? 5 : 4;
      }
    });

    setScores(newScores);
    toast(`⚡ تم تعبئة استجابات نموذجية لمقياس السرطاوي (${fillLevel === 'normal' ? 'أداء طبيعي' : fillLevel === 'borderline' ? 'فئة حدية' : 'صعوبات تعلم محتملة'})`, 'ok');
  }

  function handleSave() {
    if (!selectedStudentId) {
      toast('⚠️ يرجى اختيار التلميذ أولاً', 'er');
      return;
    }

    const assessmentRecord = {
      id: initialData?.id || uid(),
      measureId: 'sartawi_scale',
      scaleId: 'sartawi_scale',
      scaleType: 'sartawi_ld',
      measureName: 'مقياس صعوبات التعلم (إعداد وتقنين د. زيدان السرطاوي)',
      measureNameEn: 'Learning Disabilities Scale (Dr. Zaydan Al-Sartawi)',
      category: 'learning_academic',
      categoryName: 'صعوبات التعلم الأكاديمية والسلوكية',
      author: SARTAWI_COPYRIGHT_INFO.authorAr,
      studentId: selectedStudentId,
      studentName: selectedStudent?.name || initialData?.studentName || 'تلميذ غير محدد',
      studentGrade: selectedStudent?.grade || initialData?.studentGrade || 'الصف الابتدائي',
      evaluator: evaluatorName,
      evaluatorRole,
      relationship,
      schoolName,
      semester,
      date: evalDate,
      notes,
      scores,
      results: scores,
      psychometrics,
      score: psychometrics.totalRawScore,
      maxScore: 250,
      tScore: psychometrics.totalTScore,
      level: psychometrics.overallStatus,
      severityKey: psychometrics.overallKey,
      severityColor: psychometrics.overallColor,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, assessmentRecord);
      toast('✅ تم تحديث تطبيق مقياس السرطاوي لصعوبات التعلم بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', {
        ...assessmentRecord,
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق مقياس السرطاوي لصعوبات التعلم بنجاح', 'ok');
    }

    if (onSaved) onSaved(assessmentRecord);
    onClose();
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1050 }}>
      <div
        className="mb"
        style={{
          maxWidth: 1040,
          width: '96%',
          maxHeight: 'min(94vh, calc(100dvh - 16px))',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header with official styling */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
            color: '#fff',
            padding: '16px 20px',
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>📘</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  مقياس صعوبات التعلم — إعداد وتقنين أ.د. زيدان السرطاوي
                </h3>
                <span className="bdg" style={{ background: '#f59e0b', color: '#78350f', fontWeight: 800, fontSize: '.72rem' }}>
                  معتمد بوزارة التعليم (50 عبارة)
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: '#cbd5e1' }}>
                ملحق رقم (1) بنود التقدير الخماسية · ملحق (2) جدول الدرجات التائية المعيارية · ملحق (3) استمارة خلاصة النتائج
              </p>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => setViewMode(viewMode === 'items' ? 'summary' : 'items')}
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700 }}
              >
                {viewMode === 'items' ? '📊 ملخص الأبعاد' : '📝 بنود التقدير (50)'}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Strip */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-color)',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '.82rem',
          }}
        >
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-sub)' }}>الدرجة الخام الكلية: </span>
              <strong style={{ fontSize: '1rem', color: '#1e40af' }}>{psychometrics.totalRawScore} / 250</strong>
            </div>
            <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />
            <div>
              <span style={{ color: 'var(--text-sub)' }}>الدرجة التائية المعيارية (T-Score): </span>
              <strong style={{ fontSize: '1rem', color: '#7c3aed' }}>{psychometrics.totalTScore}</strong>
            </div>
            <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />
            <div>
              <span style={{ color: 'var(--text-sub)' }}>القرار التشخيصي: </span>
              <span
                className="bdg"
                style={{
                  background: psychometrics.overallKey === 'severe' ? '#fee2e2' : psychometrics.overallKey === 'borderline' ? '#fef3c7' : '#dcfce7',
                  color: psychometrics.overallColor,
                  fontWeight: 800,
                  fontSize: '.8rem',
                  padding: '2px 8px',
                }}
              >
                {psychometrics.overallStatus}
              </span>
            </div>
          </div>

          {/* Quick Mock Auto-Fill Controls */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>تعبئة سريعة:</span>
            <button
              type="button"
              className="btn btn-xs"
              style={{ background: '#dcfce7', color: '#15803d', fontSize: '.72rem', padding: '2px 7px' }}
              onClick={() => handleAutoFill('normal')}
              title="تعبئة نموذجية بدون صعوبات"
            >
              طبيعي
            </button>
            <button
              type="button"
              className="btn btn-xs"
              style={{ background: '#fef3c7', color: '#b45309', fontSize: '.72rem', padding: '2px 7px' }}
              onClick={() => handleAutoFill('borderline')}
              title="تعبئة بدرجات فئة حدية"
            >
              حدي
            </button>
            <button
              type="button"
              className="btn btn-xs"
              style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '.72rem', padding: '2px 7px' }}
              onClick={() => handleAutoFill('ld')}
              title="تعبئة بدرجات صعوبات محتملة"
            >
              صعوبة محتملة
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fff' }}>
          {/* Metadata Grid */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: 4 }}>
                اسم التلميذ / التلميذة *
              </label>
              <select
                className="inp"
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                style={{ width: '100%', fontSize: '.84rem', padding: '6px 10px', height: 36 }}
              >
                <option value="">-- اختر التلميذ --</option>
                {students.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} {st.grade ? `(${st.grade})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: 4 }}>
                القائم بالتقدير *
              </label>
              <input
                type="text"
                className="inp"
                value={evaluatorName}
                onChange={e => setEvaluatorName(e.target.value)}
                placeholder="اسم المعلم / الأخصائي"
                style={{ width: '100%', fontSize: '.84rem', padding: '6px 10px', height: 36 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: 4 }}>
                علاقته بالطالب (ملحق 3)
              </label>
              <input
                type="text"
                className="inp"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                placeholder="معلم الفصل / معلم الصعوبات"
                style={{ width: '100%', fontSize: '.84rem', padding: '6px 10px', height: 36 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: 4 }}>
                اسم المدرسة والفصل الدراسي
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className="inp"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="المدرسة"
                  style={{ width: '60%', fontSize: '.8rem', padding: '6px 8px', height: 36 }}
                />
                <input
                  type="text"
                  className="inp"
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  placeholder="الفصل"
                  style={{ width: '40%', fontSize: '.8rem', padding: '6px 8px', height: 36 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: 4 }}>
                تاريخ التطبيق
              </label>
              <input
                type="date"
                className="inp"
                value={evalDate}
                onChange={e => setEvalDate(e.target.value)}
                style={{ width: '100%', fontSize: '.84rem', padding: '6px 10px', height: 36 }}
              />
            </div>
          </div>

          {/* Dimension Selector Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 16,
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: 10,
              overflowX: 'auto',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${activeDimensionId === 'all' ? 'btn-p' : 'btn-g'}`}
              onClick={() => setActiveDimensionId('all')}
              style={{ fontWeight: 800, whiteSpace: 'nowrap' }}
            >
              📑 جميع الأبعاد الثلاثة (50 عبارة)
            </button>
            {SARTAWI_DIMENSIONS.map(dim => {
              const dimRes = psychometrics.dimensionsResults.find(d => d.id === dim.id);
              const isActive = activeDimensionId === dim.id;
              return (
                <button
                  key={dim.id}
                  type="button"
                  className={`btn btn-sm ${isActive ? 'btn-p' : 'btn-g'}`}
                  onClick={() => setActiveDimensionId(dim.id)}
                  style={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    borderRight: `4px solid ${dim.color}`,
                  }}
                >
                  <span>{dim.icon} {dim.name}</span>
                  <span
                    className="bdg"
                    style={{
                      marginRight: 6,
                      fontSize: '.7rem',
                      background: dimRes?.isDeficit ? '#fee2e2' : '#f1f5f9',
                      color: dimRes?.isDeficit ? '#991b1b' : 'inherit',
                    }}
                  >
                    {dimRes?.rawScore || dim.minRawScore} / {dim.maxRawScore}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode 1: Items Evaluation Table */}
          {viewMode === 'items' && (
            <div>
              <div
                style={{
                  background: '#f1f5f9',
                  padding: '8px 14px',
                  borderRadius: 8,
                  marginBottom: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '.82rem',
                }}
              >
                <div style={{ fontWeight: 700, color: '#334155' }}>
                  سلم التقدير: 5 (ينطبق بدرجة عالية جداً) · 4 (عالية) · 3 (متوسطة) · 2 (منخفضة) · 1 (منخفضة جداً)
                </div>
                <div style={{ color: 'var(--text-sub)', fontSize: '.76rem' }}>
                  معروض: {filteredItems.length} من أصل 50 عبارة
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>
                      <th style={{ padding: '10px 12px', width: 44, textAlign: 'center' }}>الرقم</th>
                      <th style={{ padding: '10px 12px' }}>العبـــــــارة</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', width: 340 }}>مستوى الانطباق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => {
                      const currentValue = scores[item.id] || 1;
                      const dim = SARTAWI_DIMENSIONS.find(d => d.id === item.dimensionId);
                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: idx % 2 === 0 ? '#fff' : '#fafafa',
                          }}
                        >
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: dim?.color }}>
                            {item.num}
                          </td>
                          <td style={{ padding: '10px 12px', lineHeight: 1.5 }}>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.text}</div>
                            <div style={{ fontSize: '.72rem', color: '#64748b', marginTop: 2 }}>
                              {dim?.name}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                              {SARTAWI_RATING_OPTIONS.map(opt => {
                                const isChecked = currentValue === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleScoreChange(item.id, opt.value)}
                                    style={{
                                      padding: '6px 8px',
                                      fontSize: '.72rem',
                                      borderRadius: 6,
                                      border: isChecked ? `2px solid ${opt.color}` : '1px solid #e2e8f0',
                                      background: isChecked ? opt.color : '#fff',
                                      color: isChecked ? '#fff' : '#475569',
                                      fontWeight: isChecked ? 800 : 500,
                                      cursor: 'pointer',
                                      flex: 1,
                                      minWidth: 54,
                                      textAlign: 'center',
                                      transition: 'all 0.15s ease',
                                    }}
                                    title={opt.label}
                                  >
                                    <div>{opt.value}</div>
                                    <div style={{ fontSize: '.62rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {opt.value === 5 ? 'عالية جداً' : opt.value === 4 ? 'عالية' : opt.value === 3 ? 'متوسطة' : opt.value === 2 ? 'منخفضة' : 'منخفضة جداً'}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View Mode 2: Statistical & Dimensional Summary (ملحق 3) */}
          {viewMode === 'summary' && (
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: '.95rem', fontWeight: 800, color: '#1e3a8a' }}>
                استمارة خلاصة النتائج وتوزيع الأبعاد (ملحق رقم 3)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 20 }}>
                {psychometrics.dimensionsResults.map(dim => (
                  <div
                    key={dim.id}
                    style={{
                      border: `1.5px solid ${dim.color}`,
                      borderRadius: 12,
                      padding: 16,
                      background: dim.bgLight,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontWeight: 800, fontSize: '.92rem', color: dim.color }}>
                        {dim.icon} {dim.name}
                      </div>
                      <span
                        className="bdg"
                        style={{
                          background: dim.isDeficit ? '#fee2e2' : '#dcfce7',
                          color: dim.severityColor,
                          fontWeight: 800,
                          fontSize: '.75rem',
                        }}
                      >
                        {dim.severity}
                      </span>
                    </div>

                    <p style={{ fontSize: '.78rem', color: '#475569', margin: '0 0 12px', lineHeight: 1.4 }}>
                      {dim.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: 6 }}>
                      <span>الدرجة الخام المحققة:</span>
                      <strong>{dim.rawScore} من {dim.maxRawScore} ({dim.percentage}%)</strong>
                    </div>

                    <div style={{ width: '100%', height: 8, background: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, dim.percentage)}%`,
                          background: dim.color,
                          borderRadius: 4,
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: '#64748b', marginTop: 8 }}>
                      <span>حد عدم الصعوبة: ≤ {dim.cutoffNormal}</span>
                      <span>الحد الفاصل للصعوبة: ≥ {dim.cutoffLD}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Normative Summary Box */}
              <div
                style={{
                  border: '2px solid #1e40af',
                  borderRadius: 12,
                  padding: 18,
                  background: '#f8fafc',
                }}
              >
                <h5 style={{ margin: '0 0 10px', fontSize: '.9rem', fontWeight: 800, color: '#1e40af' }}>
                  📋 التفسير السيكومتري والقرار التشخيصي النهائي
                </h5>
                <p style={{ fontSize: '.84rem', lineHeight: 1.6, color: '#334155', margin: 0 }}>
                  {psychometrics.conclusionText}
                </p>
              </div>
            </div>
          )}

          {/* Notes textarea */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: 4 }}>
              الملاحظات والتوصيات الإكلينيكية والتربوية
            </label>
            <textarea
              className="inp"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="اكتب أية ملاحظات سلوكية أو توصيات تخص الخطة الفردية وغرفة المصادر..."
              style={{ width: '100%', fontSize: '.82rem', padding: '8px 12px', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: '.8rem', color: '#64748b' }}>
            الدرجة الكلية: <strong>{psychometrics.totalRawScore} / 250</strong> · الدرجة التائية: <strong>T={psychometrics.totalTScore}</strong>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-g" onClick={onClose} style={{ fontWeight: 700 }}>
              إلغاء
            </button>
            <button type="button" className="btn btn-p" onClick={handleSave} style={{ fontWeight: 800, minWidth: 140 }}>
              💾 حفظ النتيجة والتشخيص
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
