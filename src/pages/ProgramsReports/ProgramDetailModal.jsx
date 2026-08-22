import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { lsUpd } from '../../hooks/useStorage';
import { domainLabel } from '../../utils/goalsBank';
import { sendReportToWhatsApp } from './programsWhatsApp';
import { todayStr } from '../../utils/dateHelpers';

export default function ProgramDetailModal({
  program,
  onClose,
  onUpdate,
  onPrint,
  onEdit,
}) {
  const { toast, center } = useApp();
  const [activeTab, setActiveTab] = useState('goals'); // 'goals' | 'progress' | 'team' | 'notes'
  const [currentProg, setCurrentProg] = useState(program);
  const [selectedGoalForSession, setSelectedGoalForSession] = useState(null);
  const [sessionScoreInput, setSessionScoreInput] = useState('85');
  const [sessionNotesInput, setSessionNotesInput] = useState('');

  if (!program) return null;

  const goals = currentProg.goals || [];
  const totalGoals = goals.length;
  const masteredGoals = goals.filter(g => g.status === 'مكتسب' || g.status === 'mastered').length;
  const inProgressGoals = goals.filter(g => g.status === 'قيد التدريب' || g.status === 'in_progress' || !g.status).length;
  const notStartedGoals = goals.filter(g => g.status === 'لم يبدأ' || g.status === 'not_started').length;
  const progressPct = totalGoals > 0 ? Math.round((masteredGoals / totalGoals) * 100) : 0;

  // Toggle or change status of a goal
  const handleGoalStatusChange = (goalIndex, newStatus) => {
    const updatedGoals = [...goals];
    updatedGoals[goalIndex] = {
      ...updatedGoals[goalIndex],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    const updatedProg = {
      ...currentProg,
      goals: updatedGoals,
      updatedAt: new Date().toISOString(),
    };

    setCurrentProg(updatedProg);
    lsUpd('progPrograms', updatedProg.id, updatedProg);
    if (onUpdate) onUpdate(updatedProg);
    toast(`✅ تم تحديث حالة الهدف إلى "${newStatus}"`, 'ok');
  };

  // Log a new session score with Mastery Progression Engine check
  const handleLogSession = (goalIndex) => {
    const scoreNum = Number(sessionScoreInput);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      toast('⚠️ الرجاء إدخال نسبة مئوية صحيحة بين 0 و 100', 'er');
      return;
    }

    const updatedGoals = [...goals];
    const targetGoal = { ...updatedGoals[goalIndex] };
    const sessions = [...(targetGoal.sessions || [])];

    const newSession = {
      date: todayStr(),
      score: scoreNum,
      notes: sessionNotesInput,
      timestamp: new Date().toISOString(),
    };
    sessions.push(newSession);

    // Mastery Progression Engine: Check if last 2 consecutive sessions are >= 80%
    let newStatus = targetGoal.status || 'قيد التدريب';
    let masteryTriggered = false;

    if (sessions.length >= 2) {
      const lastTwo = sessions.slice(-2);
      if (lastTwo[0].score >= 80 && lastTwo[1].score >= 80) {
        newStatus = 'مكتسب';
        masteryTriggered = true;
      }
    }

    targetGoal.sessions = sessions;
    targetGoal.status = newStatus;
    targetGoal.lastScore = scoreNum;
    targetGoal.updatedAt = new Date().toISOString();
    updatedGoals[goalIndex] = targetGoal;

    const updatedProg = {
      ...currentProg,
      goals: updatedGoals,
      updatedAt: new Date().toISOString(),
    };

    setCurrentProg(updatedProg);
    lsUpd('progPrograms', updatedProg.id, updatedProg);
    if (onUpdate) onUpdate(updatedProg);

    if (masteryTriggered) {
      toast(`🏆 إنجاز رائع! تم إتقان الهدف واكتسابه بنجاح (تحقيق ${scoreNum}% في جلستين متتاليتين)`, 'ok');
    } else {
      toast(`✅ تم رصد نتيجة الجلسة (${scoreNum}%) بنجاح`, 'ok');
    }

    setSelectedGoalForSession(null);
    setSessionNotesInput('');
  };

  // Trajectory points for visualization
  const trajectoryPoints = [
    { label: 'التقييم القبلي', pct: 0 },
    { label: 'شهر 1', pct: Math.round(progressPct * 0.3) },
    { label: 'شهر 2', pct: Math.round(progressPct * 0.7) },
    { label: 'المستوى الحالي', pct: progressPct },
  ];

  return (
    <div className="mbg" style={{ zIndex: 1100 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: 'min(94vh, calc(100dvh - 20px))', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="modal-header-custom fhd" style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.6rem' }}>📋</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: 800 }}>
                  {currentProg.title}
                </h2>
                <span className={`bdg ${currentProg.status === 'completed' ? 'b-gr' : 'b-or'}`} style={{ fontSize: '.7rem' }}>
                  {currentProg.status === 'completed' ? 'خطة مكتملة ✅' : 'خطة نشطة ⏳'}
                </span>
              </div>
              <div style={{ fontSize: '.78rem', opacity: 0.9, marginTop: 3 }}>
                الطالب: <strong>{currentProg.studentName}</strong> {currentProg.diagnosis && `· (${currentProg.diagnosis})`} · الصف: {currentProg.className || 'غير محدد'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {currentProg.parentPhone && (
              <button
                type="button"
                className="btn btn-xs btn-s"
                onClick={() => {
                  const goalsSummary = (currentProg.goals || []).map((g, i) => `${i + 1}. ${g.text} [${g.status || 'قيد التدريب'}]`).join('\n');
                  sendReportToWhatsApp({
                    parentPhone: currentProg.parentPhone,
                    parentName: currentProg.parentName,
                    studentName: currentProg.studentName,
                    reportTitle: currentProg.title,
                    reportType: 'الخطة الفردية (IEP)',
                    date: currentProg.startDate,
                    summary: `إجمالي الأهداف: ${totalGoals}\nنسبة الإتقان: ${progressPct}%\n\n${goalsSummary}`,
                    recommendations: currentProg.activities || currentProg.notes,
                    specialistName: currentProg.specialistName,
                    centerName: center?.name,
                  });
                }}
              >
                💬 واتساب
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700 }}
              onClick={() => onPrint(currentProg)}
            >
              🖨️ طباعة
            </button>
            <button
              type="button"
              className="btn btn-xs"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700 }}
              onClick={onClose}
            >
              ✕ إغلاق
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="modal-subbar" style={{ display: 'flex', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', padding: '0 16px', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
          <button
            type="button"
            className={`tab ${activeTab === 'goals' ? 'on' : ''}`}
            onClick={() => setActiveTab('goals')}
            style={{ padding: '12px 16px', fontWeight: 700, fontSize: '.86rem' }}
          >
            🎯 الأهداف ومحرك الإتقان والتتبع ({totalGoals})
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'progress' ? 'on' : ''}`}
            onClick={() => setActiveTab('progress')}
            style={{ padding: '12px 16px', fontWeight: 700, fontSize: '.86rem' }}
          >
            📈 منحنى الإنجاز الزمني ({progressPct}%)
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'team' ? 'on' : ''}`}
            onClick={() => setActiveTab('team')}
            style={{ padding: '12px 16px', fontWeight: 700, fontSize: '.86rem' }}
          >
            👥 الاستراتيجيات وفريق التدريب
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'notes' ? 'on' : ''}`}
            onClick={() => setActiveTab('notes')}
            style={{ padding: '12px 16px', fontWeight: 700, fontSize: '.86rem' }}
          >
            📝 توجيهات الأسرة والملاحظات
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll" style={{ padding: 20 }}>
          
          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>إجمالي الأهداف</div>
              <strong style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>{totalGoals}</strong>
            </div>

            <div style={{ background: 'var(--ok-l)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--ok)' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--ok)' }}>مكتسب ومتقن (Mastered)</div>
              <strong style={{ fontSize: '1.3rem', color: 'var(--ok)' }}>{masteredGoals} هدف</strong>
            </div>

            <div style={{ background: 'var(--pr-l)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--pr)' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--pr)' }}>قيد التدريب النشط</div>
              <strong style={{ fontSize: '1.3rem', color: 'var(--pr)' }}>{inProgressGoals} هدف</strong>
            </div>

            <div style={{ background: 'var(--g1)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>لم يبدأ التدريب</div>
              <strong style={{ fontSize: '1.3rem', color: 'var(--text-sub)' }}>{notStartedGoals} هدف</strong>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 12, border: '1px solid var(--border-color)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '.84rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📊 مؤشر الإنجاز الكلي لأهداف الخطة التربوية:
              </span>
              <strong style={{ fontSize: '.95rem', color: 'var(--pr)' }}>{progressPct}% محقق</strong>
            </div>
            <div style={{ background: 'var(--g1)', height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)', height: '100%', transition: 'width 0.4s' }} />
            </div>
          </div>

          {/* TAB 1: GOALS LIST WITH DIRECT STATUS TOGGLES & SESSION TRACKING */}
          {activeTab === 'goals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  🎯 تفاصيل الأهداف، الخطوط القاعدية، ورصد جلسات الإتقان:
                </h3>
                <span style={{ fontSize: '.75rem', color: 'var(--ok)', background: 'var(--ok-l)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                  قاعدة الإتقان الآلية: تحقيق ≥ 80% في جلستين متتاليتين
                </span>
              </div>

              {goals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, background: 'var(--g0)', borderRadius: 12, color: 'var(--text-sub)' }}>
                  لا توجد أهداف مدرجة في هذه الخطة بعد.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {goals.map((g, idx) => {
                    const currentStatus = g.status || 'قيد التدريب';
                    const sessions = g.sessions || [];
                    const lastTwo = sessions.slice(-2);
                    const streakCount = (lastTwo[0]?.score >= 80 ? 1 : 0) + (lastTwo[1]?.score >= 80 ? 1 : 0);
                    const isMastered = currentStatus === 'مكتسب' || currentStatus === 'mastered';
                    const isCritical = g.priority === 'critical' || g.priorityRank === 1;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-card)',
                          border: isMastered ? '2px solid var(--ok)' : (isCritical ? '2px solid #ef4444' : '1px solid var(--border-color)'),
                          borderRadius: 14,
                          padding: '14px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        {/* Goal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 260 }}>
                            <span style={{ fontWeight: 900, color: 'var(--pr)', fontSize: '.95rem', minWidth: 24, marginTop: 2 }}>
                              {idx + 1}.
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>
                                {g.text}
                              </div>

                              <div style={{ display: 'flex', gap: 8, fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                {g.code && <span className="bdg b-bl" style={{ fontSize: '.68rem', fontWeight: 800 }}>{g.code}</span>}
                                <span>المجال: <strong style={{ color: 'var(--text-main)' }}>{domainLabel(g.domain) || g.domain || 'عام'}</strong></span>
                                <span>معيار الإتقان: <strong style={{ color: 'var(--ok)' }}>{g.mastery || '80%'}</strong></span>
                                
                                {isCritical && (
                                  <span className="bdg" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', fontSize: '.64rem', fontWeight: 800 }}>
                                    🔴 قصور حرج
                                  </span>
                                )}

                                {g.sourceAssessment && (
                                  <span style={{ color: 'var(--text-sub)' }}>المصدر: {g.sourceAssessment}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Status and Session Button */}
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedGoalForSession(selectedGoalForSession === idx ? null : idx)}
                              className="btn btn-xs btn-p"
                              style={{ fontWeight: 700 }}
                            >
                              📝 رصد جلسة ({sessions.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => handleGoalStatusChange(idx, 'مكتسب')}
                              className={`btn btn-xs ${isMastered ? 'btn-p' : 'btn-g'}`}
                              style={{
                                background: isMastered ? 'var(--ok)' : undefined,
                                color: isMastered ? '#fff' : undefined,
                                fontWeight: 700,
                              }}
                            >
                              ✅ مكتسب
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGoalStatusChange(idx, 'قيد التدريب')}
                              className={`btn btn-xs ${currentStatus === 'قيد التدريب' || currentStatus === 'in_progress' ? 'btn-p' : 'btn-g'}`}
                              style={{ fontWeight: 700 }}
                            >
                              ⏳ قيد التدريب
                            </button>
                          </div>
                        </div>

                        {/* Baseline & Strategies Section */}
                        {g.baseline && (
                          <div style={{ fontSize: '.78rem', background: 'var(--g0)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', color: 'var(--text-sub)' }}>
                            <strong style={{ color: 'var(--pr)' }}>📌 الخط القاعدي المقنن (PLEP):</strong> {g.baseline}
                          </div>
                        )}

                        {g.strategies && g.strategies.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>الاستراتيجيات الموصى بها:</span>
                            {g.strategies.map((st, sIdx) => (
                              <span key={sIdx} className="bdg b-bl" style={{ fontSize: '.68rem' }}>
                                💡 {st}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Consecutive Mastery Streak Indicator */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g0)', padding: '6px 12px', borderRadius: 8, fontSize: '.76rem' }}>
                          <div>
                            مؤشر الاستقرار والإتقان: <strong>{streakCount}/2 جلسات متتالية ≥ 80%</strong>
                            {streakCount === 2 && <span style={{ color: 'var(--ok)', fontWeight: 800, marginRight: 6 }}>🏆 محقق معيار الاستقرار الإكلينيكي</span>}
                          </div>
                          <div style={{ color: 'var(--text-sub)' }}>
                            آخر نسبة مسجلة: <strong>{g.lastScore != null ? `${g.lastScore}%` : '—'}</strong>
                          </div>
                        </div>

                        {/* EXPANDED SESSION LOGGING PANEL */}
                        {selectedGoalForSession === idx && (
                          <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 10, border: '1px dashed var(--pr)', marginTop: 6 }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '.86rem', fontWeight: 800, color: 'var(--pr)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>⏱️</span> <span>رصد نتيجة جلسة تدريب جديدة لهذا الهدف:</span>
                            </h4>

                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 10 }}>
                              <div>
                                <label style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 2 }}>
                                  نسبة النجاح المتحققة (%):
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={sessionScoreInput}
                                  onChange={e => setSessionScoreInput(e.target.value)}
                                  style={{ width: 100, padding: '6px 10px', fontSize: '.84rem', borderRadius: 6, border: '1px solid var(--border-color)', fontWeight: 800, color: 'var(--pr)' }}
                                />
                              </div>

                              <div style={{ flex: 1, minWidth: 200 }}>
                                <label style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 2 }}>
                                  ملاحظات الجلسة ونوع المساعدة (Prompt Level):
                                </label>
                                <input
                                  type="text"
                                  value={sessionNotesInput}
                                  onChange={e => setSessionNotesInput(e.target.value)}
                                  placeholder="مثال: مساعدة لفظية خفيفة / استجابة مستقلة بنجاح..."
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '.82rem', borderRadius: 6, border: '1px solid var(--border-color)' }}
                                />
                              </div>

                              <button
                                type="button"
                                className="btn btn-p btn-sm"
                                onClick={() => handleLogSession(idx)}
                                style={{ fontWeight: 800, padding: '7px 16px' }}
                              >
                                💾 تسجيل الجلسة
                              </button>
                            </div>

                            {/* Session History Log */}
                            {sessions.length > 0 && (
                              <div style={{ marginTop: 10 }}>
                                <div style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
                                  سجل الجلسات السابقة ({sessions.length}):
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {sessions.map((s, sI) => (
                                    <span
                                      key={sI}
                                      className={`bdg ${s.score >= 80 ? 'b-gr' : 'b-or'}`}
                                      style={{ fontSize: '.7rem', padding: '3px 8px' }}
                                    >
                                      جلسة {sI + 1}: {s.score}% {s.score >= 80 ? '✅' : '⏳'} ({s.date})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROGRESS TRAJECTORY CHART */}
          {activeTab === 'progress' && (
            <div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📈</span> <span>الرسم البياني لمنحنى تقدم الطفل واكتساب الأهداف عبر الزمن:</span>
                </h4>

                {/* SVG Curve Chart */}
                <div style={{ height: 180, width: '100%', position: 'relative', marginTop: 10 }}>
                  <svg width="100%" height="100%" viewBox="0 0 500 160" style={{ overflow: 'visible' }}>
                    {/* Horizontal grid lines */}
                    {[0, 25, 50, 75, 100].map((val, i) => {
                      const y = 140 - (val / 100) * 120;
                      return (
                        <g key={i}>
                          <line x1="40" y1={y} x2="480" y2={y} stroke="var(--border-color)" strokeDasharray="3 3" />
                          <text x="30" y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-sub)">{val}%</text>
                        </g>
                      );
                    })}

                    {/* Path line */}
                    {(() => {
                      const pts = trajectoryPoints.map((tp, idx) => ({
                        x: 60 + idx * 130,
                        y: 140 - (tp.pct / 100) * 120,
                        ...tp,
                      }));

                      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                      return (
                        <g>
                          <path
                            d={`${d} L ${pts[pts.length - 1].x} 140 L ${pts[0].x} 140 Z`}
                            fill="rgba(59, 130, 246, 0.12)"
                          />
                          <path
                            d={d}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {pts.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#2563eb" strokeWidth="3" />
                              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text-main)">
                                {p.pct}%
                              </text>
                              <text x={p.x} y="155" textAnchor="middle" fontSize="10" fill="var(--text-sub)">
                                {p.label}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM & STRATEGIES */}
          {activeTab === 'team' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '.9rem', fontWeight: 800, color: 'var(--pr)' }}>
                  👤 فريق التأهيل المشرف
                </h4>
                <div style={{ fontSize: '.84rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>الأخصائي المسؤول: <strong>{currentProg.specialistName || 'غير محدد'}</strong></div>
                  <div>ولي الأمر: <strong>{currentProg.parentName || '—'}</strong></div>
                  <div>هاتف التواصل: <strong>{currentProg.parentPhone || '—'}</strong></div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '.9rem', fontWeight: 800, color: 'var(--pr)' }}>
                  🛠️ الأنشطة والوسائل المقترحة
                </h4>
                <div style={{ fontSize: '.84rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                  {currentProg.activities || 'استخدام الأدوات التعليمية الحسية، النمذجة الإيجابية، وجداول التعزيز المتقطع.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '.9rem', fontWeight: 800, color: 'var(--pr)' }}>
                📝 ملاحظات وتوجيهات إضافية
              </h4>
              <div style={{ fontSize: '.86rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                {currentProg.notes || 'لا توجد ملاحظات إضافية مسجلة.'}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="fa" style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--g0)' }}>
          <button type="button" className="btn btn-p" onClick={() => onEdit(currentProg)}>
            ✏️ تعديل الخطة بالكامل
          </button>
          <button type="button" className="btn btn-g" onClick={onClose}>
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
