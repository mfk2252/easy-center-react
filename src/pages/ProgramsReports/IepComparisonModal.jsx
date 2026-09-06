import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet } from '../../hooks/useStorage';
import { printItem } from '../../utils/printUtils';
import {
  TrendingUp,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Award,
  ArrowRight,
  ArrowUpRight,
  FileText,
  ChevronDown
} from 'lucide-react';

export default function IepComparisonModal({ student, initialPlanAId, initialPlanBId, onClose }) {
  const { center } = useApp();
  const allStudentPlans = useMemo(() => {
    if (!student?.id && !student?.name) return [];
    const all = lsGet('progPrograms') || [];
    return all.filter(p => (student?.id && p.studentId === student.id) || (student?.name && p.studentName === student.name));
  }, [student]);

  // If there are at least two plans, pick the last two
  const [planAId, setPlanAId] = useState(() => {
    if (initialPlanAId) return initialPlanAId;
    if (allStudentPlans.length >= 2) return allStudentPlans[0].id;
    return allStudentPlans[0]?.id || '';
  });

  const [planBId, setPlanBId] = useState(() => {
    if (initialPlanBId) return initialPlanBId;
    if (allStudentPlans.length >= 2) return allStudentPlans[1].id;
    return allStudentPlans[1]?.id || allStudentPlans[0]?.id || '';
  });

  const planA = useMemo(() => allStudentPlans.find(p => p.id === planAId), [allStudentPlans, planAId]);
  const planB = useMemo(() => allStudentPlans.find(p => p.id === planBId), [allStudentPlans, planBId]);

  // Assessments for student from both progEvaluations and studentAssessments
  const studentAssessments = useMemo(() => {
    const evals = lsGet('progEvaluations') || [];
    const assList = lsGet('studentAssessments') || [];
    const combined = [...evals, ...assList];
    return combined.filter(a => (student?.id && a.studentId === student.id) || (student?.name && (a.studentName === student.name || a.name === student.name)));
  }, [student]);

  // Compute stats for a plan
  function computePlanStats(plan) {
    if (!plan) return { total: 0, mastered: 0, inProgress: 0, pct: 0, domainStats: {} };
    const goals = plan.goals || [];
    const total = goals.length;
    const mastered = goals.filter(g => g.status === 'mastered' || (g.progress || 0) >= 100).length;
    const inProgress = total - mastered;
    const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

    const domainStats = {};
    goals.forEach(g => {
      const dom = g.domain || 'عام';
      if (!domainStats[dom]) domainStats[dom] = { total: 0, mastered: 0 };
      domainStats[dom].total += 1;
      if (g.status === 'mastered' || (g.progress || 0) >= 100) {
        domainStats[dom].mastered += 1;
      }
    });

    Object.keys(domainStats).forEach(dom => {
      const d = domainStats[dom];
      d.pct = d.total > 0 ? Math.round((d.mastered / d.total) * 100) : 0;
    });

    return { total, mastered, inProgress, pct, domainStats };
  }

  const statsA = useMemo(() => computePlanStats(planA), [planA]);
  const statsB = useMemo(() => computePlanStats(planB), [planB]);

  // Combine domains for comparison
  const allDomains = useMemo(() => {
    const set = new Set([...Object.keys(statsA.domainStats), ...Object.keys(statsB.domainStats)]);
    return Array.from(set);
  }, [statsA, statsB]);

  // Handle printing
  const handlePrint = () => {
    const reportData = {
      student,
      planA,
      planB,
      statsA,
      statsB,
      allDomains,
      assessments: studentAssessments
    };
    printItem(reportData, 'iep_comparison', center?.logo, center?.name);
  };

  return (
    <div className="mbg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxWidth: 960 }}>
        {/* Header */}
        <div
          className="fhd"
          style={{
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              📊
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>مقارنة التطور التراكمي للخطة التربوية الفردية عبر السنوات (IEP)</h2>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                ملف الطالب: <strong>{student?.name || 'غير محدد'}</strong> {student?.code ? `(${student.code})` : ''}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-g btn-sm no-print"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}
            >
              <Printer style={{ width: 15, height: 15 }} />
              <span>طباعة تقرير المقارنة</span>
            </button>
            <button
              type="button"
              className="btn btn-g btn-sm"
              onClick={onClose}
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body-scroll" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '80vh' }}>
          
          {/* Plan Selector Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {/* Plan A Selector */}
            <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--pr)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span>🔵 الخطة الأولى (السنة / الدورة السابقة)</span>
              </label>
              <select
                value={planAId}
                onChange={(e) => setPlanAId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: '0.86rem' }}
              >
                {allStudentPlans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.academicYear ? `[${p.academicYear}] ` : ''}{p.title || 'خطة فردية'} ({p.goals?.length || 0} أهداف)
                  </option>
                ))}
              </select>
              {planA && (
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-sub)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>الحالة: {planA.status === 'completed' ? 'مكتملة / مرحّلة' : 'نشطة'}</span>
                  <span>التاريخ: {planA.startDate || '—'} إلى {planA.endDate || '—'}</span>
                </div>
              )}
            </div>

            {/* Plan B Selector */}
            <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span>🟢 الخطة المقارنة (السنة / الدورة التالية)</span>
              </label>
              <select
                value={planBId}
                onChange={(e) => setPlanBId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: '0.86rem' }}
              >
                {allStudentPlans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.academicYear ? `[${p.academicYear}] ` : ''}{p.title || 'خطة فردية'} ({p.goals?.length || 0} أهداف)
                  </option>
                ))}
              </select>
              {planB && (
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-sub)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>الحالة: {planB.status === 'completed' ? 'مكتملة' : 'نشطة'}</span>
                  <span>التاريخ: {planB.startDate || '—'} إلى {planB.endDate || '—'}</span>
                </div>
              )}
            </div>
          </div>

          {/* High-level Side-by-Side Analytics */}
          {planA && planB && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pr)' }}>
                <div className="stat-label">نسبة الإتقان في الخطة 1</div>
                <div className="stat-val" style={{ color: 'var(--pr)' }}>{statsA.pct}%</div>
                <div className="stat-sub">{statsA.mastered} من أصل {statsA.total} هدف محقق</div>
              </div>

              <div className="unified-stat-box" style={{ borderRight: '4px solid var(--ok)' }}>
                <div className="stat-label">نسبة الإتقان في الخطة 2</div>
                <div className="stat-val" style={{ color: 'var(--ok)' }}>{statsB.pct}%</div>
                <div className="stat-sub">{statsB.mastered} من أصل {statsB.total} هدف محقق</div>
              </div>

              <div className="unified-stat-box" style={{ borderRight: `4px solid ${statsB.pct >= statsA.pct ? 'var(--ok)' : 'var(--warn, #f59e0b)'}` }}>
                <div className="stat-label">معدل التطور العام للطفل</div>
                <div className="stat-val" style={{ color: statsB.pct >= statsA.pct ? 'var(--ok)' : 'var(--warn, #f59e0b)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{statsB.pct >= statsA.pct ? `+${statsB.pct - statsA.pct}%` : `${statsB.pct - statsA.pct}%`}</span>
                  {statsB.pct >= statsA.pct ? <TrendingUp style={{ width: 22, height: 22 }} /> : null}
                </div>
                <div className="stat-sub">
                  {statsB.pct >= statsA.pct ? 'تقدم إيجابي ملحوظ في المهارات 📈' : 'حاجة لتعزيز ومراجعة الأهداف ⏳'}
                </div>
              </div>
            </div>
          )}

          {/* Domain Breakdown Comparative Progress */}
          {planA && planB && allDomains.length > 0 && (
            <div className="wg" style={{ margin: 0, padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart2 style={{ width: 18, height: 18, color: 'var(--pr)' }} />
                <span>مقارنة نسب الإنجاز حسب المجالات النمائية والمهارية:</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {allDomains.map(domain => {
                  const da = statsA.domainStats[domain] || { pct: 0, mastered: 0, total: 0 };
                  const db = statsB.domainStats[domain] || { pct: 0, mastered: 0, total: 0 };
                  const diff = db.pct - da.pct;

                  return (
                    <div key={domain} style={{ padding: '10px 14px', background: 'var(--g0)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{domain}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem' }}>
                          <span style={{ color: 'var(--pr)', fontWeight: 700 }}>سنة 1: {da.pct}% ({da.mastered}/{da.total})</span>
                          <span>⬅️</span>
                          <span style={{ color: 'var(--ok)', fontWeight: 700 }}>سنة 2: {db.pct}% ({db.mastered}/{db.total})</span>
                          <span
                            className={diff >= 0 ? 'bdg b-gr' : 'bdg b-yl'}
                            style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                          >
                            {diff >= 0 ? `+${diff}% تقدم` : `${diff}%`}
                          </span>
                        </div>
                      </div>

                      {/* Dual Progress Bars */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ height: 7, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${da.pct}%`, background: 'var(--pr)', borderRadius: 4 }} />
                        </div>
                        <div style={{ height: 7, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${db.pct}%`, background: 'var(--ok)', borderRadius: 4 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standardized Scales & Assessment Progress across periods */}
          <div className="wg" style={{ margin: 0, padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award style={{ width: 18, height: 18, color: 'var(--pur, #7c3aed)' }} />
              <span>مؤشرات المقاييس والتقييمات المقننة المسجلة للطالب:</span>
            </div>

            {studentAssessments.length === 0 ? (
              <div style={{ padding: 14, textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                لم يتم تسجيل مقاييس تشخيصية قبلية/بعدية إضافية لهذا الطالب بعد في سجل المقاييس.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                {studentAssessments.map(ass => (
                  <div key={ass.id} style={{ background: 'var(--g0)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{ass.tool || ass.name || ass.type}</div>
                      <span className="bdg b-bl" style={{ fontSize: '0.7rem' }}>{ass.date}</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                      <div>الدرجة الكلية: <strong>{ass.score ?? ass.totalScore ?? '—'}</strong></div>
                      <div>النتيجة / الشدة: <strong>{ass.result || ass.severity || ass.level || 'معتمد'}</strong></div>
                      {ass.examiner && <div>الفاحص: {ass.examiner}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-Side Goals Preview */}
          {planA && planB && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              {/* Plan A Goals */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: 'var(--g0)', padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--pr)' }}>
                  🎯 أهداف الخطة 1 ({planA.academicYear || 'الدورة السابقة'})
                </div>
                <div style={{ maxHeight: 250, overflowY: 'auto', padding: 8 }}>
                  {(planA.goals || []).map((g, i) => (
                    <div key={g.id || i} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{g.text || g.title}</span>
                      <span className={g.status === 'mastered' || (g.progress || 0) >= 100 ? 'bdg b-gr' : 'bdg b-yl'} style={{ fontSize: '0.68rem' }}>
                        {g.status === 'mastered' || (g.progress || 0) >= 100 ? 'متقن ✅' : `${g.progress || 0}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan B Goals */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: 'var(--g0)', padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--ok)' }}>
                  🎯 أهداف الخطة 2 ({planB.academicYear || 'الدورة التالية'})
                </div>
                <div style={{ maxHeight: 250, overflowY: 'auto', padding: 8 }}>
                  {(planB.goals || []).map((g, i) => (
                    <div key={g.id || i} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{g.text || g.title}</span>
                      <span className={g.status === 'mastered' || (g.progress || 0) >= 100 ? 'bdg b-gr' : 'bdg b-yl'} style={{ fontSize: '0.68rem' }}>
                        {g.status === 'mastered' || (g.progress || 0) >= 100 ? 'متقن ✅' : `${g.progress || 0}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations for Next Cycle */}
          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
            <div style={{ fontWeight: 800, color: '#334155', marginBottom: 4 }}>📋 توصيات لجنة دراسة الحالة والجودة:</div>
            <div style={{ color: '#475569', lineHeight: 1.6 }}>
              بناءً على نتائج المقارنة التراكمية، يُوصى بالتركيز في الدورة القادمة على تدعيم المهارات التي أظهر فيها الطفل استجابة نمائية إيجابية، وإعادة صياغة مؤشرات الأداء للأهداف الممتدة لضمان وصول الطفل إلى أقصى طاقاته الاستقلالية والأكاديمية.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fa" style={{ padding: '14px 22px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-g" onClick={onClose}>إغلاق</button>
          <button
            type="button"
            className="btn btn-p"
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <Printer style={{ width: 16, height: 16 }} />
            <span>طباعة تقرير التطور والمقارنة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
