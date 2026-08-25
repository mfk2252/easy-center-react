import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SENSORY_INTEGRATION_DOMAINS,
  SENSORY_INTEGRATION_ITEMS,
  calculateSensoryIntegrationScore
} from '../../data/sensoryIntegrationData';

export default function SensoryIntegrationAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null
}) {
  const { toast } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(initialData?.studentId || (students[0]?.id ? String(students[0].id) : ''));
  const [examinerName, setExaminerName] = useState(initialData?.evaluator || initialData?.examinerName || (emps[0]?.name || 'أخصائي العلاج الوظيفي والتكامل الحسي'));
  const [assessmentDate, setAssessmentDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [activeDomainTab, setActiveDomainTab] = useState('all');
  const [responses, setResponses] = useState({});
  const [clinicalNotes, setClinicalNotes] = useState(initialData?.notes || '');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (initialData) {
      setSelectedStudentId(initialData.studentId ? String(initialData.studentId) : '');
      setExaminerName(initialData.evaluator || initialData.examinerName || '');
      setAssessmentDate(initialData.date || new Date().toISOString().split('T')[0]);
      setClinicalNotes(initialData.notes || '');
      if (initialData.responses || initialData.answers) {
        setResponses(initialData.responses || initialData.answers || {});
      }
    } else {
      // Default empty responses
      setResponses({});
    }
  }, [initialData]);

  // Balance task timer countdown
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      try {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([200, 100, 200]);
        }
      } catch {
        // ignore
      }
      showToast('انتهت مدة الدقيقة (60 ثانية) لمهمة التوازن بنجاح!', 'info');
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  function showToast(msg, type = 'info') {
    if (toast) {
      toast(msg, type === 'error' ? 'er' : 'ok');
    }
  }

  const selectedStudent = useMemo(() => {
    return students.find(s => String(s.id) === String(selectedStudentId)) || null;
  }, [students, selectedStudentId]);

  // Calculation results
  const scoreResult = useMemo(() => {
    return calculateSensoryIntegrationScore(responses);
  }, [responses]);

  const filteredItems = useMemo(() => {
    if (activeDomainTab === 'all') return SENSORY_INTEGRATION_ITEMS;
    return SENSORY_INTEGRATION_ITEMS.filter(it => it.domainId === activeDomainTab);
  }, [activeDomainTab]);

  function handleScoreItem(itemId, scoreValue) {
    setResponses(prev => ({
      ...prev,
      [itemId]: scoreValue
    }));
  }

  function handleQuickDomainScore(domainId, scoreValue) {
    const domainItems = SENSORY_INTEGRATION_ITEMS.filter(it => it.domainId === domainId);
    setResponses(prev => {
      const updated = { ...prev };
      domainItems.forEach(it => {
        updated[it.id] = scoreValue;
      });
      return updated;
    });
    showToast(`تم تعيين علامة (${scoreValue}) لجميع بنود المجال`, 'success');
  }

  function handleSave() {
    if (!selectedStudentId) {
      showToast('يرجى اختيار الطالب المراد تقييمه', 'error');
      return;
    }

    const studentObj = students.find(s => String(s.id) === String(selectedStudentId));
    const studentName = studentObj ? (studentObj.name || studentObj.fullName) : 'طالب غير محدد';

    const assessmentRecord = {
      id: initialData?.id || `si_${Date.now()}`,
      measureId: 'sensory_integration_scale',
      measureName: 'مقياس التكامل الحسي للأطفال (طعيمة والطنطاوي والشخص)',
      scaleType: 'sensory_integration',
      scaleCategory: 'sensory_motor',
      category: 'sensory_motor',
      studentId: selectedStudentId,
      stuId: selectedStudentId,
      studentName,
      evaluator: examinerName,
      examinerName,
      date: assessmentDate,
      score: scoreResult.totalRawScore,
      maxScore: scoreResult.maxPossible,
      rawScore: scoreResult.totalRawScore,
      percentage: `${scoreResult.percentage}%`,
      percentageNum: scoreResult.percentage,
      level: scoreResult.level,
      levelCode: scoreResult.levelCode,
      statusBadge: scoreResult.statusBadge,
      severityColor: scoreResult.severityColor,
      isSensoryIntegration: true,
      cutoffScore: scoreResult.cutoffScore,
      interpretation: scoreResult.interpretation,
      recommendations: scoreResult.recommendations,
      subscales: scoreResult.subscales,
      responses,
      answers: responses,
      notes: clinicalNotes,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, assessmentRecord);
    } else {
      lsAdd('studentAssessments', assessmentRecord);
    }

    showToast('تم حفظ تقييم التكامل الحسي بنجاح', 'success');
    if (onSaved) onSaved(assessmentRecord);
    if (onClose) onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="mbg" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-xl">
        
        {/* HEADER */}
        <div style={{ padding: '16px 22px', background: 'linear-gradient(135deg, var(--text-main) 0%, #1e1b4b 100%)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(165, 180, 252, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              🎯
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  مقياس التكامل الحسي للأطفال (90 مهمة أدائية)
                </h3>
                <span className="bdg" style={{ background: '#312e81', color: '#c7d2fe', fontSize: '.72rem', border: '1px solid #4338ca' }}>
                  جامعة عين شمس 2017
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '.78rem', color: '#94a3b8' }}>
                إعداد: أ. داليا طعيمة · د. محمود الطنطاوي · أ.د. عبد العزيز الشخص (9 محاور × 10 مهام)
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-g"
            onClick={onClose}
            style={{ color: 'var(--border-color)', borderColor: 'rgba(255,255,255,0.2)', width: 34, height: 34, padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* TOP CONTROLS & STATS BAR */}
        <div style={{ padding: '12px 20px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color, var(--border-color))', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
              👤 الطالب المفحوص:
            </label>
            <select
              className="inp"
              style={{ width: '100%', padding: '6px 10px', fontSize: '.85rem', fontWeight: 700 }}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- اختر الطالب --</option>
              {students.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name || st.fullName} ({st.code || st.gender || 'طالب'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
              👨‍⚕️ الأخصائي الفاحص:
            </label>
            <input
              type="text"
              className="inp"
              style={{ width: '100%', padding: '6px 10px', fontSize: '.85rem' }}
              value={examinerName}
              onChange={(e) => setExaminerName(e.target.value)}
              placeholder="اسم أخصائي العلاج الوظيفي"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
              📅 تاريخ التقييم:
            </label>
            <input
              type="date"
              className="inp"
              style={{ width: '100%', padding: '6px 10px', fontSize: '.85rem' }}
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
          </div>

          {/* LIVE METRIC WIDGET */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                المجموع الكلي ({scoreResult.answeredCount}/90)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: scoreResult.severityColor }}>
                {scoreResult.totalRawScore} <span style={{ fontSize: '.85rem', color: 'var(--text-sub)' }}>/ 90</span>
                <span style={{ fontSize: '.78rem', marginRight: 6, fontWeight: 700 }}>({scoreResult.percentage}%)</span>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <span className="bdg" style={{ background: `${scoreResult.severityColor}18`, color: scoreResult.severityColor, border: `1px solid ${scoreResult.severityColor}40`, fontSize: '.72rem', fontWeight: 800 }}>
                {scoreResult.statusBadge}
              </span>
              <div style={{ fontSize: '.68rem', color: 'var(--text-sub)', marginTop: 2 }}>
                محك القطع: 45 درجة
              </div>
            </div>
          </div>
        </div>

        {/* DOMAIN NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: 6, padding: '8px 16px', overflowX: 'auto', background: 'var(--bg-main, #f1f5f9)', borderBottom: '1px solid var(--border-color, var(--border-color))', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setActiveDomainTab('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: '.78rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: activeDomainTab === 'all' ? '1.5px solid #3b82f6' : '1px solid var(--border-color, var(--border-color))',
              background: activeDomainTab === 'all' ? '#2563eb' : 'var(--bg-card)',
              color: activeDomainTab === 'all' ? 'var(--bg-card)' : 'var(--text-main, var(--text-main))',
            }}
          >
            📋 جميع المحاور (90 مهمة)
          </button>

          {SENSORY_INTEGRATION_DOMAINS.map((dom) => {
            const dScore = scoreResult.subscales.find(s => s.id === dom.id);
            const isSelected = activeDomainTab === dom.id;
            return (
              <button
                key={dom.id}
                type="button"
                onClick={() => setActiveDomainTab(dom.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '.78rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected ? `1.5px solid ${dom.color}` : '1px solid var(--border-color, var(--border-color))',
                  background: isSelected ? dom.color : 'var(--bg-card)',
                  color: isSelected ? 'var(--bg-card)' : 'var(--text-main, var(--text-main))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{dom.num}. {dom.name}</span>
                <span
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.25)' : dom.bgLight,
                    color: isSelected ? 'var(--bg-card)' : dom.color,
                    padding: '1px 6px',
                    borderRadius: 6,
                    fontSize: '.7rem',
                    fontWeight: 900
                  }}
                >
                  {dScore?.raw || 0}/10
                </span>
              </button>
            );
          })}
        </div>

        {/* BODY ITEMS & SCORING */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: 'var(--bg)' }}>
          
          {/* VESTIBULAR BALANCE TIMER HELPER (Visible if balance domain is selected or all) */}
          {(activeDomainTab === 'vestibular_balance' || activeDomainTab === 'all') && (
            <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#fff', borderRadius: 12, padding: '12px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.8rem' }}>⏱️</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.92rem' }}>مؤقت مهام التوازن الدهليزي (دقيقة كاملة / 60 ثانية)</div>
                  <div style={{ fontSize: '.76rem', color: '#a7f3d0' }}>
                    يستخدم لاختبار الثبات للوقوف على قدم واحدة أو المشطين مغمض ومفتوح العينين
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '2px 14px', borderRadius: 8, minWidth: 70, textAlign: 'center' }}>
                  {timerSeconds}s
                </div>
                {!timerRunning ? (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: 'var(--bg-card)', color: '#065f46', fontWeight: 800, border: 'none' }}
                    onClick={() => {
                      if (timerSeconds === 0) setTimerSeconds(60);
                      setTimerRunning(true);
                    }}
                  >
                    ▶ بدء المؤقت
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#f87171', color: 'var(--bg-card)', fontWeight: 800, border: 'none' }}
                    onClick={() => setTimerRunning(false)}
                  >
                    ⏸ إيقاف مؤقت
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--bg-card)', fontWeight: 700, border: 'none' }}
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(60);
                  }}
                >
                  🔄 إعادة ضبط
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE DOMAIN TITLE & QUICK ACTIONS */}
          {activeDomainTab !== 'all' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {SENSORY_INTEGRATION_DOMAINS.find(d => d.id === activeDomainTab)?.num}. {SENSORY_INTEGRATION_DOMAINS.find(d => d.id === activeDomainTab)?.name}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '.78rem', color: 'var(--text-sub)' }}>
                  {SENSORY_INTEGRATION_DOMAINS.find(d => d.id === activeDomainTab)?.description}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-xs"
                  style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontWeight: 800 }}
                  onClick={() => handleQuickDomainScore(activeDomainTab, 1)}
                >
                  ✓ تعليم الكل صحيح (1)
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 800 }}
                  onClick={() => handleQuickDomainScore(activeDomainTab, 0)}
                >
                  ✕ تصفير الكل (0)
                </button>
              </div>
            </div>
          )}

          {/* ITEMS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredItems.map((item) => {
              const currentVal = responses[item.id];
              const isAnswered = currentVal !== undefined && currentVal !== null && currentVal !== '';
              const domObj = SENSORY_INTEGRATION_DOMAINS.find(d => d.id === item.domainId);

              return (
                <div
                  key={item.id}
                  id={`item-card-${item.id}`}
                  style={{
                    background: 'var(--bg-card)',
                    border: isAnswered ? (Number(currentVal) === 1 ? '1.5px solid #86efac' : '1.5px solid #fca5a5') : '1px solid var(--border-color, var(--border-color))',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            background: domObj?.bgLight || '#f1f5f9',
                            color: domObj?.color || 'var(--text-main)',
                            fontSize: '.72rem',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 6,
                            border: `1px solid ${domObj?.borderColor || 'var(--border-color)'}`
                          }}
                        >
                          مهمة #{item.num} · {domObj?.name}
                        </span>
                        <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                          [{item.target}]
                        </span>
                      </div>
                      <div style={{ fontSize: '.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-sub)', marginTop: 4, lineHeight: 1.5, background: 'var(--bg-input)', padding: '6px 10px', borderRadius: 6, border: '1px dashed var(--border-color)' }}>
                        🗣️ <strong style={{ color: 'var(--text-main)' }}>تعليمات الفاحص:</strong> {item.instruction}
                      </div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', marginTop: 4 }}>
                        📏 <strong style={{ color: 'var(--text-sub)' }}>معيار التصحيح:</strong> {item.scoringGuide}
                      </div>
                    </div>

                    {/* SCORING BUTTONS (1 vs 0) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleScoreItem(item.id, 1)}
                        style={{
                          width: 86,
                          height: 38,
                          borderRadius: 8,
                          fontSize: '.82rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          transition: 'all 0.15s ease',
                          border: currentVal === 1 || currentVal === '1' ? '2px solid #059669' : '1px solid var(--border-color)',
                          background: currentVal === 1 || currentVal === '1' ? '#059669' : '#f0fdf4',
                          color: currentVal === 1 || currentVal === '1' ? 'var(--bg-card)' : '#166534',
                          boxShadow: currentVal === 1 || currentVal === '1' ? '0 2px 6px rgba(5,150,105,0.3)' : 'none',
                        }}
                      >
                        ✓ أداء سليم (1)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleScoreItem(item.id, 0)}
                        style={{
                          width: 86,
                          height: 38,
                          borderRadius: 8,
                          fontSize: '.82rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          transition: 'all 0.15s ease',
                          border: currentVal === 0 || currentVal === '0' ? '2px solid #dc2626' : '1px solid var(--border-color)',
                          background: currentVal === 0 || currentVal === '0' ? '#dc2626' : '#fef2f2',
                          color: currentVal === 0 || currentVal === '0' ? 'var(--bg-card)' : '#991b1b',
                          boxShadow: currentVal === 0 || currentVal === '0' ? '0 2px 6px rgba(220,38,38,0.3)' : 'none',
                        }}
                      >
                        ✕ أداء خاطئ (0)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CLINICAL OBSERVATIONS & NOTES */}
          <div style={{ marginTop: 20, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
            <label style={{ display: 'block', fontSize: '.84rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              📝 الملاحظات الإكلينيكية والسلوكية أثناء تطبيق المهام:
            </label>
            <textarea
              className="inp"
              style={{ width: '100%', minHeight: 70, fontSize: '.85rem', lineHeight: 1.5, padding: 10 }}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="سجل ملاحظاتك حول درجة انتباه الطفل، مقاومته لبعض الملامس، التردد، الإجهاد العضلي، استخدام اليد المفضلة، واستجابته للتوجيهات..."
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div style={{ flexShrink: 0, padding: '14px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>
            تم تقييم <strong>{scoreResult.answeredCount}</strong> من أصل <strong>90 مهمة</strong>
            {scoreResult.answeredCount < 90 && (
              <span style={{ color: '#d97706', marginRight: 6 }}>
                (يستحسن استكمال جميع البنود لدقة التقرير السيكومتري)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={onClose}
              style={{ fontWeight: 700 }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              style={{ fontWeight: 800, background: '#2563eb', padding: '8px 22px', fontSize: '.9rem' }}
            >
              💾 حفظ واعتماد تقييم التكامل الحسي
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
