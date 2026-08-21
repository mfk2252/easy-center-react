import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { lsUpd } from '../../hooks/useStorage';
import { domainLabel } from '../../utils/goalsBank';
import { sendReportToWhatsApp } from './programsWhatsApp';

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
            🎯 الأهداف السلوكية ومستوى الإتقان ({totalGoals})
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'progress' ? 'on' : ''}`}
            onClick={() => setActiveTab('progress')}
            style={{ padding: '12px 16px', fontWeight: 700, fontSize: '.86rem' }}
          >
            📈 مسار التقدم الزمني ({progressPct}%)
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'team' ? 'on' : ''}`}
            onClick={() => setActiveTab('team')}
            style={{ padding: '12px 16px', fontWeight: 700, fontSize: '.86rem' }}
          >
            👥 فريق التأهيل المشرف والأنشطة
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'notes' ? 'on' : ''}`}
            onClick={() => setActiveTab('notes')}
            style={{ padding: '12px 16px', fontWeight: 700, fontSize: '.86rem' }}
          >
            📝 توجيهات وملاحظات الأسرة
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
              <div style={{ fontSize: '.75rem', color: 'var(--ok)' }}>مكتسب ومحقق</div>
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

          {/* TAB 1: GOALS LIST WITH DIRECT STATUS TOGGLES */}
          {activeTab === 'goals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  🎯 تفاصيل الأهداف وإمكانية تحديث حالة الإتقان:
                </h3>
                <span style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>
                  يمكنك النقر على حالة أي هدف لتغييرها فوراً
                </span>
              </div>

              {goals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, background: 'var(--g0)', borderRadius: 12, color: 'var(--text-sub)' }}>
                  لا توجد أهداف مدرجة في هذه الخطة بعد.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {goals.map((g, idx) => {
                    const currentStatus = g.status || 'قيد التدريب';
                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 12,
                          padding: '12px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                            <span style={{ fontWeight: 900, color: 'var(--pr)', fontSize: '.95rem', minWidth: 24 }}>
                              {idx + 1}.
                            </span>
                            <div>
                              <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>
                                {g.text}
                              </div>
                              <div style={{ display: 'flex', gap: 10, fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 4, flexWrap: 'wrap' }}>
                                {g.code && <span className="bdg b-bl" style={{ fontSize: '.64rem' }}>{g.code}</span>}
                                <span>المجال: <strong style={{ color: 'var(--text-main)' }}>{domainLabel(g.domain) || g.domain || 'عام'}</strong></span>
                                <span>معيار الإتقان: <strong style={{ color: 'var(--ok)' }}>{g.mastery || '80%'}</strong></span>
                                {g.sourceAssessment && <span style={{ color: 'var(--text-sub)' }}>المصدر: {g.sourceAssessment}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Status buttons */}
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => handleGoalStatusChange(idx, 'مكتسب')}
                              className={`btn btn-xs ${currentStatus === 'مكتسب' || currentStatus === 'mastered' ? 'btn-p' : 'btn-g'}`}
                              style={{
                                background: currentStatus === 'مكتسب' || currentStatus === 'mastered' ? 'var(--ok)' : undefined,
                                color: currentStatus === 'مكتسب' || currentStatus === 'mastered' ? '#fff' : undefined,
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
                            <button
                              type="button"
                              onClick={() => handleGoalStatusChange(idx, 'لم يبدأ')}
                              className={`btn btn-xs ${currentStatus === 'لم يبدأ' || currentStatus === 'not_started' ? 'btn-d' : 'btn-g'}`}
                              style={{ fontWeight: 700 }}
                            >
                              ⏸️ لم يبدأ
                            </button>
                          </div>
                        </div>
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
                            fill="rgba(37, 99, 235, 0.12)"
                          />
                          <path d={d} fill="none" stroke="var(--pr)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                          {pts.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke="var(--pr)" strokeWidth="3" />
                              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--text-main)">
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

                <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--g0)', borderRadius: 10, fontSize: '.84rem', color: 'var(--text-main)' }}>
                  💡 <strong>ملاحظة إكلينيكية:</strong> معدل اكتساب الطالب للأهداف يسير بوتيرة إيجابية متوافقة مع الخطة التأهيلية المرسومة. يوصى بالاستمرار في استراتيجيات التعزيز التفاضلي وتعميم المهارات المكتسبة.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MULTIDISCIPLINARY REHABILITATION TEAM */}
          {activeTab === 'team' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 18 }}>
                <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>الأخصائي المسؤول الرئيسي</div>
                  <strong style={{ fontSize: '.95rem', color: 'var(--text-main)', display: 'block', marginTop: 4 }}>
                    👤 {currentProg.specialistName || 'أخصائي التربية الخاصة'}
                  </strong>
                  <div style={{ fontSize: '.75rem', color: 'var(--pr)', marginTop: 2 }}>مسؤول متابعة وتنسيق الخطة</div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>فريق التأهيل المساند</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-main)', marginTop: 4 }}>
                    🗣️ أخصائي التخاطب واضطرابات اللغة<br />
                    🧩 أخصائي تعديل السلوك وتحليل السلوك التطبيقي<br />
                    🎯 أخصائي العلاج الوظيفي والتكامل الحسي
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>الجدول الزمني للخطة</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-main)', marginTop: 4 }}>
                    📅 البدء: <strong>{currentProg.startDate || '—'}</strong><br />
                    ⏳ المدة المقررة: <strong>{currentProg.duration || '3 أشهر'}</strong><br />
                    🗓️ تاريخ التقييم الدوري: <strong>{currentProg.reviewDate || 'نهاية الفصل'}</strong>
                  </div>
                </div>
              </div>

              {currentProg.activities && (
                <div style={{ background: 'var(--pr-l)', border: '1px solid var(--pr)', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '.92rem', fontWeight: 800, color: 'var(--pr)' }}>
                    🎨 الأنشطة والوسائل التعليمية والتأهيلية المعتمدة:
                  </h4>
                  <p style={{ margin: 0, fontSize: '.84rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {currentProg.activities}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTES & FAMILY GUIDANCE */}
          {activeTab === 'notes' && (
            <div>
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '.95rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📝</span> <span>توجيهات وملاحظات الخطة للأخصائي والأسرة:</span>
                </h4>
                <p style={{ margin: 0, fontSize: '.86rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {currentProg.notes || 'لا توجد ملاحظات إضافية مسجلة.'}
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  👨‍👩‍👧 شراكة الأسرة وتعميم المهارات بالمنزل:
                </h4>
                <p style={{ fontSize: '.82rem', color: 'var(--text-sub)', margin: 0 }}>
                  ولي الأمر: <strong>{currentProg.parentName || 'مسجل بالملف'}</strong> · الجوال: {currentProg.parentPhone || '—'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="fa" style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--g0)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-p"
                onClick={() => onPrint(currentProg)}
              >
                🖨️ طباعة الخطة (A4)
              </button>

              {currentProg.parentPhone && (
                <button
                  type="button"
                  className="btn btn-s"
                  onClick={() => {
                    const goalsSummary = goals.map((g, i) => `${i + 1}. ${g.text} [${g.status || 'قيد التدريب'}]`).join('\n');
                    sendReportToWhatsApp({
                      parentPhone: currentProg.parentPhone,
                      parentName: currentProg.parentName,
                      studentName: currentProg.studentName,
                      reportTitle: currentProg.title,
                      reportType: 'الخطة التربوية والتأهيلية الفردية (IEP)',
                      date: currentProg.startDate,
                      summary: `نسبة الإنجاز المحققة: ${progressPct}%\nإجمالي الأهداف: ${totalGoals}\n\nالأهداف:\n${goalsSummary}`,
                      recommendations: currentProg.activities || currentProg.notes,
                      specialistName: currentProg.specialistName,
                      centerName: center?.name,
                    });
                  }}
                >
                  💬 إرسال تقرير الخطة عبر واتساب
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  className="btn btn-g"
                  onClick={() => {
                    onClose();
                    onEdit(currentProg);
                  }}
                >
                  ✏️ تعديل بيانات الخطة
                </button>
              )}
            </div>

            <button type="button" className="btn btn-g" onClick={onClose}>
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
