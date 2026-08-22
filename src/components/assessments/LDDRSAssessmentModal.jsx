import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  LDDRS_COPYRIGHT_INFO,
  LDDRS_SCALES,
  LDDRS_ITEMS,
  LDDRS_RATING_OPTIONS,
  calculateLDDRSPsychometrics,
} from '../../data/lddrsData';

export default function LDDRSAssessmentModal({
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
    initialData?.evaluator || initialData?.evaluatorName || (emps[0]?.name || 'أخصائي صعوبات التعلم')
  );
  const [evaluatorRole, setEvaluatorRole] = useState(initialData?.evaluatorRole || 'معلم صعوبات التعلم / أخصائي نفسي');
  const [evalDate, setEvalDate] = useState(
    initialData?.date || todayStr()
  );
  const [schoolName, setSchoolName] = useState(initialData?.schoolName || 'مدرسة التميز النموذجية');
  const [sessionsCount, setSessionsCount] = useState(initialData?.sessionsCount || '5 حصص أسبوعياً');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Subscale selection
  const [activeScaleId, setActiveScaleId] = useState('attention');
  const [scores, setScores] = useState(initialData?.scores || initialData?.results || {});
  const [viewMode, setViewMode] = useState('items'); // 'items' | 'summary'

  const selectedStudent = useMemo(() => {
    return students.find(s => String(s.id) === String(selectedStudentId)) || null;
  }, [students, selectedStudentId]);

  const activeScale = useMemo(() => {
    return LDDRS_SCALES.find(s => s.id === activeScaleId) || LDDRS_SCALES[0];
  }, [activeScaleId]);

  const activeItems = useMemo(() => {
    return LDDRS_ITEMS.filter(it => it.scaleId === activeScaleId);
  }, [activeScaleId]);

  const psychometrics = useMemo(() => {
    return calculateLDDRSPsychometrics(scores, activeScaleId);
  }, [scores, activeScaleId]);

  const activeScalePsych = useMemo(() => {
    return psychometrics.scaleResults.find(s => s.id === activeScaleId) || null;
  }, [psychometrics, activeScaleId]);

  if (!isOpen) return null;

  function handleScoreChange(itemId, value) {
    setScores(prev => ({
      ...prev,
      [itemId]: Number(value),
    }));
  }

  function handleAutoFill(targetScaleId = null, fillLevel = 'moderate') {
    const newScores = { ...scores };
    const itemsToFill = targetScaleId
      ? LDDRS_ITEMS.filter(it => it.scaleId === targetScaleId)
      : LDDRS_ITEMS;

    itemsToFill.forEach(item => {
      let val = 0;
      if (fillLevel === 'normal') {
        val = Math.random() < 0.8 ? 0 : 1; // score <= 20
      } else if (fillLevel === 'mild') {
        val = Math.random() < 0.5 ? 1 : 2; // score ~ 21-40
      } else if (fillLevel === 'moderate') {
        val = Math.random() < 0.5 ? 2 : 3; // score ~ 41-60
      } else if (fillLevel === 'severe') {
        val = Math.random() < 0.4 ? 3 : 4; // score ~ 61-80
      }
      newScores[item.id] = val;
    });

    setScores(newScores);
    toast(`⚡ تم تعبئة استجابات نموذجية لمقياس الزيات (${fillLevel === 'normal' ? 'أداء طبيعي' : fillLevel === 'moderate' ? 'صعوبات متوسطة' : 'صعوبات شديدة'})`, 'ok');
  }

  function handleSave() {
    if (!selectedStudentId) {
      toast('⚠️ يرجى اختيار التلميذ أولاً', 'er');
      return;
    }

    const assessmentRecord = {
      id: initialData?.id || uid(),
      measureId: 'lddrs_battery',
      scaleId: 'lddrs_battery',
      scaleType: 'lddrs',
      measureName: 'بطارية مقاييس التقدير التشخيصية لصعوبات التعلم النمائية والأكاديمية (LDDRS)',
      measureNameEn: 'Learning Disabilities Diagnostic Rating Scales (LDDRS)',
      category: 'learning_academic',
      categoryName: 'صعوبات التعلم النمائية والأكاديمية',
      author: LDDRS_COPYRIGHT_INFO.authorAr,
      studentId: selectedStudentId,
      studentName: selectedStudent?.name || initialData?.studentName || 'تلميذ غير محدد',
      studentGrade: selectedStudent?.grade || initialData?.studentGrade || 'الصف الابتدائي',
      evaluator: evaluatorName,
      evaluatorRole,
      date: evalDate,
      schoolName,
      sessionsCount,
      notes,
      scores,
      results: scores,
      psychometrics,
      score: psychometrics.totalRawScore,
      maxScore: psychometrics.totalMaxScore,
      level: psychometrics.overallStatus,
      severityKey: psychometrics.overallKey,
      severityColor: psychometrics.overallColor,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, assessmentRecord);
      toast('✅ تم تحديث تطبيق بطارية الزيات LDDRS بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', {
        ...assessmentRecord,
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق بطارية مقاييس التقدير التشخيصية (الزيات) بنجاح', 'ok');
    }

    if (onSaved) onSaved(assessmentRecord);
    onClose();
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="mb"
        style={{
          maxWidth: 1040,
          width: '96vw',
          maxHeight: 'min(94vh, calc(100dvh - 24px))',
          padding: 0,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header with Zayat Battery Identity */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            padding: '16px 22px',
            borderBottom: '3px solid #dc2626',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: '.75rem',
                }}
              >
                LDDRS
              </span>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                بطارية مقاييس التقدير التشخيصية لصعوبات التعلم (الزيات)
              </h2>
            </div>
            <div style={{ fontSize: '.78rem', color: '#94a3b8', marginTop: 4 }}>
              إعداد: <strong style={{ color: '#f1f5f9' }}>{LDDRS_COPYRIGHT_INFO.authorAr}</strong> (جامعة الخليج العربي) · تشخيص صعوبات التعلم النمائية والأكاديمية
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 8 }}>
              <div style={{ fontSize: '.7rem', color: '#94a3b8' }}>المقاييس المكتملة</div>
              <div style={{ fontSize: '.92rem', fontWeight: 800, color: '#38bdf8' }}>
                {psychometrics.evaluatedScales.length} من {LDDRS_SCALES.length}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-g"
              onClick={onClose}
              style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              ✕ إغلاق
            </button>
          </div>
        </div>

        {/* Student & Session Info Bar */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-color)',
            padding: '12px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 3 }}>
              التلميذ المفحوص *
            </label>
            <select
              className="form-control"
              style={{ padding: '6px 10px', fontSize: '.84rem', fontWeight: 600 }}
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
            >
              {students.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} {st.grade ? `(${st.grade})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 3 }}>
              القائم بالتقدير / الأخصائي
            </label>
            <input
              type="text"
              className="form-control"
              style={{ padding: '6px 10px', fontSize: '.84rem' }}
              value={evaluatorName}
              onChange={e => setEvaluatorName(e.target.value)}
              placeholder="اسم المعلم أو الأخصائي"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 3 }}>
              المدرسة / الصف
            </label>
            <input
              type="text"
              className="form-control"
              style={{ padding: '6px 10px', fontSize: '.84rem' }}
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="اسم المدرسة"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 3 }}>
              تاريخ التقدير
            </label>
            <input
              type="date"
              className="form-control"
              style={{ padding: '6px 10px', fontSize: '.84rem' }}
              value={evalDate}
              onChange={e => setEvalDate(e.target.value)}
            />
          </div>
        </div>

        {/* Subscales Navigation Ribbon */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            background: '#fff',
            borderBottom: '1px solid var(--border-color)',
            padding: '8px 16px',
            gap: 6,
          }}
        >
          {LDDRS_SCALES.filter(s => s.id !== 'social_emotional').map(sc => {
            const scPsych = psychometrics.scaleResults.find(s => s.id === sc.id);
            const isSelected = activeScaleId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setActiveScaleId(sc.id);
                  setViewMode('items');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: isSelected ? `2px solid ${sc.color}` : '1px solid var(--border-color)',
                  background: isSelected ? sc.bgLight : '#fff',
                  color: isSelected ? sc.color : 'var(--text-main)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                <span>{sc.icon}</span>
                <span>{sc.name}</span>
                {scPsych && scPsych.answeredCount > 0 && (
                  <span
                    style={{
                      background: scPsych.severityColor,
                      color: '#fff',
                      borderRadius: 12,
                      padding: '1px 6px',
                      fontSize: '.68rem',
                      fontWeight: 800,
                    }}
                  >
                    {scPsych.rawScore} / 80
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setViewMode('summary')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: viewMode === 'summary' ? '2px solid #1e293b' : '1px dashed #64748b',
              background: viewMode === 'summary' ? '#1e293b' : '#f1f5f9',
              color: viewMode === 'summary' ? '#fff' : '#475569',
              fontWeight: 800,
              fontSize: '.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginRight: 'auto',
            }}
          >
            📊 التقرير والملف التشخيصي الشامل
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#f8fafc' }}>
          {viewMode === 'items' ? (
            <div>
              {/* Active Subscale Description & Status Card */}
              <div
                style={{
                  background: '#fff',
                  border: `1.5px solid ${activeScale.color}`,
                  borderRadius: 12,
                  padding: '12px 18px',
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.4rem' }}>{activeScale.icon}</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: activeScale.color }}>
                      {activeScale.name} ({activeScale.nameEn})
                    </h3>
                    <span
                      style={{
                        background: activeScale.bgLight,
                        color: activeScale.color,
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: '.72rem',
                        border: `1px solid ${activeScale.color}40`,
                      }}
                    >
                      {activeScale.typeName}
                    </span>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginTop: 4, maxWidth: 650 }}>
                    {activeScale.description}
                  </div>
                </div>

                {activeScalePsych && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center', background: '#f8fafc', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-sub)' }}>الدرجة الخام</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: activeScale.color }}>
                        {activeScalePsych.rawScore} <span style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>/ 80</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', background: activeScalePsych.severityColor + '15', padding: '6px 12px', borderRadius: 8, border: `1px solid ${activeScalePsych.severityColor}40` }}>
                      <div style={{ fontSize: '.68rem', color: activeScalePsych.severityColor, fontWeight: 700 }}>مستوى الصعوبة</div>
                      <div style={{ fontSize: '.9rem', fontWeight: 800, color: activeScalePsych.severityColor }}>
                        {activeScalePsych.severity}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', background: '#f8fafc', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-sub)' }}>الرتبة المئينية</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#b45309' }}>
                        %{activeScalePsych.percentile}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Fill Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                  تعليمات التقدير: حدد مدى تكرار وديمومة كل خاصية سلوكية لدى التلميذ خلال الشهرين الأخيرين.
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-xs"
                    style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #059669' }}
                    onClick={() => handleAutoFill(activeScaleId, 'normal')}
                  >
                    تعبئة عادي (لا توجد صعوبة)
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #b45309' }}
                    onClick={() => handleAutoFill(activeScaleId, 'mild')}
                  >
                    تعبئة خفيف
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ea580c' }}
                    onClick={() => handleAutoFill(activeScaleId, 'moderate')}
                  >
                    تعبئة متوسط
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #dc2626' }}
                    onClick={() => handleAutoFill(activeScaleId, 'severe')}
                  >
                    تعبئة شديد
                  </button>
                </div>
              </div>

              {/* Items List Table */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 340px',
                    padding: '10px 14px',
                    background: '#f1f5f9',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '.78rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                  }}
                >
                  <div>#</div>
                  <div>الخصائص السلوكية المستهدفة بالتقدير</div>
                  <div style={{ textAlign: 'center' }}>سلم التقدير الخماسي (الزيات)</div>
                </div>

                {activeItems.map((item, idx) => {
                  const currentVal = scores[item.id];
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 340px',
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-color)',
                        background: idx % 2 === 0 ? '#fff' : '#fcfcfc',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: 800, color: 'var(--text-sub)', fontSize: '.84rem' }}>
                        {item.num}
                      </div>
                      <div style={{ fontSize: '.86rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        {item.text}
                      </div>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        {LDDRS_RATING_OPTIONS.map(opt => {
                          const isChecked = currentVal === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleScoreChange(item.id, opt.value)}
                              title={opt.desc}
                              style={{
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: isChecked ? `2px solid ${opt.color}` : '1px solid var(--border-color)',
                                background: isChecked ? opt.color : '#fff',
                                color: isChecked ? '#fff' : 'var(--text-main)',
                                fontWeight: isChecked ? 800 : 500,
                                fontSize: '.74rem',
                                cursor: 'pointer',
                                transition: 'all 0.1s',
                                flex: 1,
                                textAlign: 'center',
                              }}
                            >
                              {opt.label.split(' ')[0]} ({opt.value})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Comprehensive Summary & Psychometric Matrix Tab */
            <div>
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    الملف النفسي والتربوي لمقاييس التقدير التشخيصية (LDDRS)
                  </h3>
                  <button
                    type="button"
                    className="btn btn-xs btn-p"
                    onClick={() => handleAutoFill(null, 'moderate')}
                  >
                    ⚡ تعبئة نموذج تجريبي لكافة المقاييس
                  </button>
                </div>

                {/* Subscales Matrix Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)', textAlign: 'right' }}>
                      <th style={{ padding: '8px 10px' }}>المقياس التشخيصي</th>
                      <th style={{ padding: '8px 10px' }}>النوع</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>الدرجة الخام (0-80)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>الرتبة المئينية</th>
                      <th style={{ padding: '8px 10px' }}>مستوى الشدة والحدة</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psychometrics.scaleResults.filter(s => s.id !== 'social_emotional').map(sc => (
                      <tr key={sc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px', fontWeight: 700 }}>
                          <span style={{ marginRight: 6 }}>{sc.icon}</span> {sc.name}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: '.72rem', background: sc.bgLight, color: sc.color, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            {sc.typeName}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800, color: sc.color, fontSize: '.95rem' }}>
                          {sc.rawScore} / 80
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800, color: '#b45309' }}>
                          %{sc.percentile}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span
                            style={{
                              background: sc.severityColor + '15',
                              color: sc.severityColor,
                              border: `1px solid ${sc.severityColor}40`,
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontWeight: 800,
                              fontSize: '.75rem',
                            }}
                          >
                            {sc.severity}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => {
                              setActiveScaleId(sc.id);
                              setViewMode('items');
                            }}
                          >
                            تعديل الدرجات
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Diagnostic Conclusion & Clinical Summary */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: `1.5px solid ${psychometrics.overallColor}`,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '.92rem', fontWeight: 800, color: psychometrics.overallColor }}>
                  📌 الاستنتاج والقرار التشخيصي النهائي وفق معايير الزيات
                </h4>
                <div style={{ fontSize: '.86rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {psychometrics.conclusionText}
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', fontSize: '.76rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
                    ملاحظات الأخصائي والتوصيات الإكلينيكية والتدخلية:
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    style={{ fontSize: '.84rem' }}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="اكتب التوصيات الخاصة بغرفة المصادر، التعديلات الأكاديمية، أو استراتيجيات التعلم..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer & Actions */}
        <div
          style={{
            background: '#fff',
            borderTop: '1px solid var(--border-color)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>
            حقوق النشر والملكية الفكرية: <strong>{LDDRS_COPYRIGHT_INFO.authorAr}</strong> · صعوبات التعلم النمائية والأكاديمية
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-sm btn-g" onClick={onClose}>
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-sm btn-p"
              onClick={handleSave}
              style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff', fontWeight: 800 }}
            >
              💾 حفظ نتائج التقييم واعتماد التقرير
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
