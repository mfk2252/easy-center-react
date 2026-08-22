import React, { useState, useEffect, useMemo } from 'react';
import {
  MYKLEBUST_COPYRIGHT_INFO,
  MYKLEBUST_RATING_OPTIONS,
  MYKLEBUST_DIMENSIONS,
  MYKLEBUST_ITEMS,
  calculateMyklebustPsychometrics,
} from '../../data/myklebustData';
import { lsAdd, lsUpd } from '../../hooks/useStorage';

export default function MyklebustAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
}) {
  const [studentId, setStudentId] = useState('');
  const [evaluator, setEvaluator] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState('الفصل الدراسي الأول');
  const [activeTab, setActiveTab] = useState('auditory_comprehension');
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setStudentId(initialData.studentId || initialData.student_id || '');
      setEvaluator(initialData.evaluator || initialData.evaluator_name || '');
      setDate(initialData.date || initialData.assessment_date || new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
      if (initialData.academicYear) setAcademicYear(initialData.academicYear);
      if (initialData.semester) setSemester(initialData.semester);
      
      const loadedScores = {};
      if (initialData.scores) {
        Object.assign(loadedScores, initialData.scores);
      } else if (initialData.responses) {
        Object.assign(loadedScores, initialData.responses);
      }
      setScores(loadedScores);
    } else {
      if (students.length > 0 && !studentId) {
        setStudentId(students[0].id);
      }
      if (emps.length > 0 && !evaluator) {
        setEvaluator(emps[0].name || emps[0].full_name || '');
      }
      // Initialize with average (3) default or empty
      setScores({});
    }
  }, [isOpen, initialData, students, emps]);

  const selectedStudent = useMemo(() => {
    return students.find(s => String(s.id) === String(studentId)) || null;
  }, [students, studentId]);

  const psychometrics = useMemo(() => {
    return calculateMyklebustPsychometrics(scores);
  }, [scores]);

  if (!isOpen) return null;

  function handleScoreChange(itemId, val) {
    setScores(prev => ({
      ...prev,
      [itemId]: Number(val),
    }));
  }

  function handleQuickFill(targetScore) {
    const next = {};
    MYKLEBUST_ITEMS.forEach(it => {
      next[it.id] = targetScore;
    });
    setScores(next);
  }

  function handleQuickFillDimension(dimId, targetScore) {
    const next = { ...scores };
    MYKLEBUST_ITEMS.filter(it => it.dimensionId === dimId).forEach(it => {
      next[it.id] = targetScore;
    });
    setScores(next);
  }

  async function handleSave() {
    if (!studentId) {
      alert('يرجى اختيار الطالب أولاً');
      return;
    }

    setSaving(true);
    try {
      const studentName = selectedStudent?.name || selectedStudent?.full_name || 'طالب غير محدد';
      const measureId = 'myklebust_scale';
      const measureName = MYKLEBUST_COPYRIGHT_INFO.scaleNameAr;

      const record = {
        id: initialData?.id || `myklebust_${Date.now()}`,
        studentId: String(studentId),
        student_id: String(studentId),
        studentName,
        measureId,
        measure_id: measureId,
        measureName,
        scaleType: 'myklebust',
        date,
        assessment_date: date,
        evaluator,
        evaluator_name: evaluator,
        academicYear,
        semester,
        scores,
        responses: scores,
        notes,
        score: psychometrics.totalRawScore,
        maxScore: 120,
        verbalScore: psychometrics.verbalScore,
        nonVerbalScore: psychometrics.nonVerbalScore,
        percentage: psychometrics.totalPercentage,
        level: psychometrics.overallStatus,
        severityColor: psychometrics.overallColor,
        diagnosisType: psychometrics.diagnosisType,
        conclusionText: psychometrics.conclusionText,
        psychometrics,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.id) {
        lsUpd('studentAssessments', initialData.id, record);
      } else {
        lsAdd('studentAssessments', record);
      }

      if (onSaved) onSaved(record);
      onClose();
    } catch (err) {
      console.error('Error saving Myklebust Assessment:', err);
      alert('حدث خطأ أثناء حفظ التقييم. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  const activeDim = MYKLEBUST_DIMENSIONS.find(d => d.id === activeTab) || MYKLEBUST_DIMENSIONS[0];
  const activeDimItems = MYKLEBUST_ITEMS.filter(it => it.dimensionId === activeTab);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div
        className="modal-box"
        style={{
          width: '95vw',
          maxWidth: 1150,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: 14,
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>📊</span>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                مقياس مايكل بيست لتقدير السمات السلوكية للتعرف على صعوبات التعلم (Myklebust PRS)
              </h2>
              <span className="bdg" style={{ background: '#3b82f6', color: '#fff', fontSize: '.72rem', padding: '2px 8px' }}>
                24 بنداً تقييمياً
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: '#bfdbfe' }}>
              إعداد: هلمر مايكل بيست (تقنين د. مصطفى كامل / د. تيسير كوافحة) · المقياس الشامل للمجالين اللفظي وغير اللفظي
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              width: 32,
              height: 32,
              borderRadius: 8,
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

        {/* Top Info Bar: Student Info & Real-Time Indicators */}
        <div
          style={{
            padding: '12px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div>
            <label style={{ fontSize: '.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>
              اسم التلميذ / المستفيد:
            </label>
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className="inp"
              style={{ padding: '6px 10px', fontSize: '.85rem', width: '100%' }}
            >
              <option value="">-- اختر التلميذ --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name || s.full_name} {s.grade ? `(${s.grade})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>
              المقيم / معلم صعوبات التعلم:
            </label>
            <input
              type="text"
              value={evaluator}
              onChange={e => setEvaluator(e.target.value)}
              placeholder="اسم الأخصائي أو المعلم"
              className="inp"
              style={{ padding: '6px 10px', fontSize: '.85rem', width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>
              تاريخ الملاحظة والتقييم:
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="inp"
              style={{ padding: '6px 10px', fontSize: '.85rem', width: '100%' }}
            />
          </div>

          {/* Quick Score Snapshot Box */}
          <div
            style={{
              background: '#fff',
              border: `1.5px solid ${psychometrics.overallColor}`,
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.75rem' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>المجموع الكلي:</span>
              <strong style={{ fontSize: '.95rem', color: psychometrics.overallColor }}>
                {psychometrics.totalRawScore} / 120
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, fontSize: '.7rem', color: '#64748b', marginTop: 2 }}>
              <span>لفظي: <b style={{ color: psychometrics.isVerbalDeficit ? '#dc2626' : '#1e40af' }}>{psychometrics.verbalScore}/45</b></span>
              <span>غير لفظي: <b style={{ color: psychometrics.isNonVerbalDeficit ? '#dc2626' : '#0891b2' }}>{psychometrics.nonVerbalScore}/75</b></span>
            </div>
          </div>
        </div>

        {/* Main Body: Tabs on left/top and Item Cards */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Side Dimension Tabs */}
          <div
            style={{
              width: 280,
              background: '#f1f5f9',
              borderLeft: '1px solid #e2e8f0',
              overflowY: 'auto',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ padding: '4px 8px', fontSize: '.75rem', fontWeight: 800, color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
              أبعاد مقياس مايكل بيست (5)
            </div>

            {/* Verbal Group Header */}
            <div style={{ padding: '6px 8px 2px', fontSize: '.7rem', fontWeight: 800, color: '#1e3a8a' }}>
              📌 المجال اللفظي (الحد الفاصل: 27)
            </div>
            {MYKLEBUST_DIMENSIONS.filter(d => d.scaleGroup === 'verbal').map(dim => {
              const dimRes = psychometrics.dimensionsResults.find(r => r.id === dim.id);
              const isActive = activeTab === dim.id;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => setActiveTab(dim.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: isActive ? `2px solid ${dim.color}` : '1px solid #e2e8f0',
                    background: isActive ? '#fff' : 'transparent',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'right',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontSize: '.8rem', fontWeight: 800, color: isActive ? dim.color : '#1e293b' }}>
                      {dim.icon} {dim.name.split(':')[1] || dim.name}
                    </span>
                    <span
                      style={{
                        fontSize: '.72rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: dimRes?.isDeficit ? '#fee2e2' : '#e0f2fe',
                        color: dimRes?.isDeficit ? '#991b1b' : '#0369a1',
                      }}
                    >
                      {dimRes?.rawScore || 0}/{dim.maxScore}
                    </span>
                  </div>
                  <span style={{ fontSize: '.68rem', color: '#64748b', marginTop: 2 }}>
                    {dim.itemsCount} بنود · حد القطع: {dim.cutoffScore}
                  </span>
                </button>
              );
            })}

            {/* Non-Verbal Group Header */}
            <div style={{ padding: '8px 8px 2px', fontSize: '.7rem', fontWeight: 800, color: '#0f766e' }}>
              📌 المجال غير اللفظي (الحد الفاصل: 45)
            </div>
            {MYKLEBUST_DIMENSIONS.filter(d => d.scaleGroup === 'non_verbal').map(dim => {
              const dimRes = psychometrics.dimensionsResults.find(r => r.id === dim.id);
              const isActive = activeTab === dim.id;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => setActiveTab(dim.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: isActive ? `2px solid ${dim.color}` : '1px solid #e2e8f0',
                    background: isActive ? '#fff' : 'transparent',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'right',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontSize: '.8rem', fontWeight: 800, color: isActive ? dim.color : '#1e293b' }}>
                      {dim.icon} {dim.name.split(':')[1] || dim.name}
                    </span>
                    <span
                      style={{
                        fontSize: '.72rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: dimRes?.isDeficit ? '#fee2e2' : '#e0f2fe',
                        color: dimRes?.isDeficit ? '#991b1b' : '#0369a1',
                      }}
                    >
                      {dimRes?.rawScore || 0}/{dim.maxScore}
                    </span>
                  </div>
                  <span style={{ fontSize: '.68rem', color: '#64748b', marginTop: 2 }}>
                    {dim.itemsCount} بنود · حد القطع: {dim.cutoffScore}
                  </span>
                </button>
              );
            })}

            {/* Quick Fill Actions */}
            <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                تعبئة نموذجية سريعة لجميع البنود (24):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => handleQuickFill(3)}
                  className="btn btn-xs"
                  style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '.68rem' }}
                >
                  طبيعي (3)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill(2)}
                  className="btn btn-xs"
                  style={{ background: '#ffedd5', color: '#c2410c', fontSize: '.68rem' }}
                >
                  صعوبة (2)
                </button>
              </div>
            </div>
          </div>

          {/* Active Dimension Items Workspace */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '16px 24px' }}>
            {/* Dimension Banner */}
            <div
              style={{
                background: activeDim.bgLight,
                border: `1px solid ${activeDim.color}40`,
                borderRight: `4px solid ${activeDim.color}`,
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: activeDim.color }}>
                    {activeDim.icon} {activeDim.name}
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '.76rem', color: '#475569' }}>
                    {activeDim.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleQuickFillDimension(activeDim.id, 3)}
                    className="btn btn-xs"
                    style={{ background: '#fff', border: '1px solid #cbd5e1', fontSize: '.7rem', color: '#0284c7' }}
                  >
                    تعبئة البعد كـ (متوسط 3)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFillDimension(activeDim.id, 1)}
                    className="btn btn-xs"
                    style={{ background: '#fff', border: '1px solid #cbd5e1', fontSize: '.7rem', color: '#dc2626' }}
                  >
                    تعبئة البعد كـ (منخفض 1)
                  </button>
                </div>
              </div>
            </div>

            {/* List of Item Cards for Active Dimension */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeDimItems.map(item => {
                const currentVal = scores[item.id] !== undefined ? scores[item.id] : 3;
                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: 14,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Item Title and Text */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              background: '#1e293b',
                              color: '#fff',
                              borderRadius: 6,
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '.75rem',
                              fontWeight: 800,
                            }}
                          >
                            {item.num}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '.9rem', color: '#1e293b' }}>
                            {item.title}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: '#64748b', marginRight: 32 }}>
                          {item.text}
                        </p>
                      </div>

                      {/* Current Score Tag */}
                      <span
                        className="bdg"
                        style={{
                          background:
                            currentVal <= 2 ? '#fee2e2' : currentVal === 3 ? '#e0f2fe' : '#dcfce7',
                          color:
                            currentVal <= 2 ? '#dc2626' : currentVal === 3 ? '#0369a1' : '#15803d',
                          fontWeight: 800,
                          fontSize: '.75rem',
                          padding: '2px 8px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        التقدير: {currentVal} من 5
                      </span>
                    </div>

                    {/* Behavioral Anchor Tooltip / Helper */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: '.72rem',
                        color: '#475569',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 8,
                        marginBottom: 10,
                        border: '1px dashed #cbd5e1',
                      }}
                    >
                      <div><strong style={{ color: '#dc2626' }}>[1-2 منخفض]:</strong> {item.anchor1}</div>
                      <div><strong style={{ color: '#0284c7' }}>[3 متوسط]:</strong> {item.anchor3}</div>
                      <div><strong style={{ color: '#16a34a' }}>[4-5 متفوق]:</strong> {item.anchor5}</div>
                    </div>

                    {/* 5-Point Rating Buttons Selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                      {MYKLEBUST_RATING_OPTIONS.map(opt => {
                        const isSelected = currentVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleScoreChange(item.id, opt.value)}
                            style={{
                              padding: '8px 4px',
                              borderRadius: 6,
                              border: isSelected ? `2px solid ${opt.color}` : '1px solid #e2e8f0',
                              background: isSelected ? `${opt.color}15` : '#fff',
                              color: isSelected ? opt.color : '#334155',
                              fontWeight: isSelected ? 800 : 500,
                              fontSize: '.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 2,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span style={{ fontSize: '.95rem', fontWeight: 900 }}>{opt.score}</span>
                            <span style={{ fontSize: '.68rem', textAlign: 'center', lineHeight: 1.1 }}>
                              {opt.label.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notes Area */}
            <div style={{ marginTop: 18 }}>
              <label style={{ fontSize: '.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                ملاحظات المعلم السلوكية والتربوية الإضافية:
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات حول أداء التلميذ في الصف، الاستجابة للتعليمات، التشتت، التفاعل مع الزملاء..."
                className="inp"
                style={{ width: '100%', minHeight: 60, fontSize: '.82rem' }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.82rem' }}>
            <span>
              التشخيص الإجمالي: <strong style={{ color: psychometrics.overallColor }}>{psychometrics.overallStatus}</strong>
            </span>
            <span>
              الأبعاد المتأثرة: <strong style={{ color: '#dc2626' }}>{psychometrics.deficitDimensions.length} من 5</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-g"
              style={{ fontSize: '.85rem' }}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-p"
              style={{ fontSize: '.85rem', fontWeight: 800, background: '#1e40af', padding: '8px 20px' }}
            >
              {saving ? 'جاري الحفظ...' : '💾 حفظ التقييم واعتماد النتيجة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
