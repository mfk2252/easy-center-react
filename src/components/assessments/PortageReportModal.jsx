import { useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { todayStr } from '../../utils/dateHelpers';
import {
  PORTAGE_COPYRIGHT_INFO,
  PORTAGE_DOMAINS,
  PORTAGE_ITEMS,
  calculatePortagePsychometrics,
} from '../../data/portageAssessmentData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';

export default function PortageReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
  onOpenIepBridge,
}) {
  const { center, toast } = useApp();
  const printRef = useRef(null);

  const scores = useMemo(() => {
    return assessment?.results || assessment?.scores || assessment?.responses || {};
  }, [assessment]);

  const chronologicalAgeMonths = useMemo(() => {
    if (assessment?.psychometrics?.chronologicalAgeMonths) {
      return assessment.psychometrics.chronologicalAgeMonths;
    }
    const ageStr = String(assessment?.age || '');
    const matchYear = ageStr.match(/(\d+)\s*(سنوات|سنة|عام|years|yr)/i);
    const matchMonth = ageStr.match(/(\d+)\s*(أشهر|شهر|months|mo)/i);
    let totalMonths = 0;
    if (matchYear) totalMonths += parseInt(matchYear[1], 10) * 12;
    if (matchMonth) totalMonths += parseInt(matchMonth[1], 10);
    return totalMonths > 0 ? totalMonths : 48;
  }, [assessment]);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculatePortagePsychometrics(scores, chronologicalAgeMonths);
  }, [assessment, scores, chronologicalAgeMonths]);

  if (!isOpen || !assessment || !psychometrics) return null;

  const acquiredItems = PORTAGE_ITEMS.filter(it => scores[it.id] === 1.0);
  const emergingItems = PORTAGE_ITEMS.filter(it => scores[it.id] === 0.5);
  const deficitItems = PORTAGE_ITEMS.filter(it => scores[it.id] === 0.0);

  function handlePrint() {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '', 'height=800,width=1000');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير دليل بورتيدج للتدخل المبكر — ${assessment.studentName || 'تقرير تشخيصي'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
            body {
              font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif;
              color: #1e293b;
              background: #fff;
              margin: 0;
              padding: 20px;
              direction: rtl;
              font-size: 13px;
              line-height: 1.6;
            }
            .no-print { display: none !important; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; }
            th { background-color: #f1f5f9; font-weight: 700; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; }
            @media print {
              body { margin: 0; padding: 10mm; background: #fff; }
              @page { size: A4; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      win.document.close();
    }
  }

  function handleShareWhatsApp() {
    const text = `*تقرير التقييم النمائي الشامل — دليل بورتيدج للتدخل المبكر*
الطفل: ${assessment.studentName || '—'}
العمر الزمني: ${assessment.age || '—'} (${chronologicalAgeMonths} شهراً)
العمر النمائي المركب: ${psychometrics.compositeDevAgeText}
حاصل النمو (DQ): ${psychometrics.dqScore}
نسبة الإتقان النمائي: ${psychometrics.overallPercentage}%
التصنيف العام: ${psychometrics.overallLevel}
الأخصائي الفاحص: ${assessment.examinerName || '—'}
المركز: ${center?.name || 'مركز التربية الخاصة والتدخل المبكر'}`;

    sendReportToWhatsApp(assessment.parentPhone || '', text);
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="mb mb-xl"
        style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16,
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          fontFamily: "'Tajawal', 'Segoe UI', Tahoma, sans-serif",
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.12), rgba(5, 150, 105, 0.04))',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🌱</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                التقرير النمائي الشامل — دليل بورتيدج للتدخل المبكر
              </h3>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>
                المفحوص: <strong>{assessment.studentName || '—'}</strong> · {assessment.date || todayStr()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onOpenIepBridge && (
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={() => onOpenIepBridge(assessment)}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderColor: '#059669',
                  fontWeight: 800,
                  fontSize: '.76rem',
                }}
              >
                🎯 جسر الخطة (IEP)
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs btn-p"
              onClick={handlePrint}
              style={{ fontWeight: 700, fontSize: '.76rem' }}
            >
              🖨️ طباعة
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleShareWhatsApp}
              style={{ background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '.76rem', border: 'none' }}
            >
              💬 واتساب
            </button>
            {onEdit && (
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => {
                  onClose();
                  onEdit(assessment);
                }}
                style={{ fontWeight: 700, fontSize: '.76rem' }}
              >
                ✏️ تعديل
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={onClose}
              style={{ fontWeight: 700 }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* MODAL BODY (PRINTABLE) */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <div ref={printRef} style={{ maxWidth: '880px', margin: '0 auto', background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#1e293b' }}>
            {/* Header / Center Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #16a34a', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#15803d' }}>
                  {center?.name || 'مركز التربية الخاصة والتدخل المبكر'}
                </h1>
                <div style={{ fontSize: '.84rem', color: '#64748b', marginTop: 2 }}>
                  برنامج الفحص والتشخيص النمائي الشامل — دليل بورتيدج للتعليم المبكر
                </div>
              </div>
              <div style={{ textAlign: 'left', fontSize: '.8rem', color: '#64748b' }}>
                <div><strong>التاريخ:</strong> {assessment.date || todayStr()}</div>
                <div><strong>رقم التقرير:</strong> #{assessment.id?.slice(0, 8)}</div>
              </div>
            </div>

            {/* Student & Diagnostic Info Grid */}
            <table style={{ width: '100%', marginBottom: 16 }}>
              <tbody>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ width: '18%', fontWeight: 700 }}>اسم الطفل:</td>
                  <td style={{ width: '32%', fontWeight: 800, color: '#0f172a' }}>{assessment.studentName || '—'}</td>
                  <td style={{ width: '18%', fontWeight: 700 }}>العمر الزمني:</td>
                  <td style={{ width: '32%' }}>{assessment.age || `${Math.round(chronologicalAgeMonths / 12)} سنوات`} ({chronologicalAgeMonths} شهراً)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>التشخيص:</td>
                  <td>{assessment.diagnosis || 'تأخر نمائي / تدخل مبكر'}</td>
                  <td style={{ fontWeight: 700 }}>الأخصائي الفاحص:</td>
                  <td>{assessment.examinerName || '—'}</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ fontWeight: 700 }}>الجهة / المقياس:</td>
                  <td colSpan={3}>دليل بورتيدج للتدخل المبكر (Portage Guide - CESA 5 Modern Edition)</td>
                </tr>
              </tbody>
            </table>

            {/* Composite Psychometric Results Highlight Card */}
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 800, color: '#15803d', textAlign: 'center' }}>
                🌟 نتائج ومؤشرات العمر النمائي الشامل
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, textAlign: 'center' }}>
                <div style={{ background: '#fff', padding: '10px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 600 }}>العمر النمائي المركب</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#15803d' }}>
                    {psychometrics.compositeDevAgeText}
                  </div>
                </div>
                <div style={{ background: '#fff', padding: '10px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 600 }}>حاصل النمو (DQ)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.overallColor }}>
                    {psychometrics.dqScore}
                  </div>
                </div>
                <div style={{ background: '#fff', padding: '10px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 600 }}>نسبة الإتقان الكلية</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.overallColor }}>
                    {psychometrics.overallPercentage}%
                  </div>
                </div>
                <div style={{ background: '#fff', padding: '10px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 600 }}>المهارات المكتسبة</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
                    {psychometrics.totalAcquiredSkills} / {psychometrics.totalAssessedSkills}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: '.84rem', fontWeight: 800, color: psychometrics.overallColor }}>
                التشخيص العام: {psychometrics.overallLevel}
              </div>
            </div>

            {/* Domains Breakdown Table */}
            <h4 style={{ margin: '0 0 8px 0', fontSize: '.94rem', fontWeight: 800, color: '#0f172a' }}>
              📊 تفصيل الأداء عبر المجالات النمائية الستة:
            </h4>
            <table style={{ width: '100%', marginBottom: 20 }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th>المجال النمائي</th>
                  <th style={{ textAlign: 'center' }}>المهارات المقيمة</th>
                  <th style={{ textAlign: 'center' }}>المكتسبة (1.0)</th>
                  <th style={{ textAlign: 'center' }}>الناشئة (0.5)</th>
                  <th style={{ textAlign: 'center' }}>نسبة الإتقان</th>
                  <th style={{ textAlign: 'center' }}>العمر النمائي للمجال</th>
                  <th>المستوى التشخيصي</th>
                </tr>
              </thead>
              <tbody>
                {PORTAGE_DOMAINS.map(dom => {
                  const stat = psychometrics.domainStats[dom.id];
                  if (!stat) return null;
                  return (
                    <tr key={dom.id}>
                      <td style={{ fontWeight: 700 }}>
                        {dom.icon} {dom.name}
                      </td>
                      <td style={{ textAlign: 'center' }}>{stat.assessedItems}</td>
                      <td style={{ textAlign: 'center', color: '#059669', fontWeight: 700 }}>{stat.acquiredCount}</td>
                      <td style={{ textAlign: 'center', color: '#d97706', fontWeight: 700 }}>{stat.emergingCount}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{stat.percentage}%</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#15803d' }}>{stat.developmentalAgeText}</td>
                      <td>
                        <span className="badge" style={{ background: `${stat.severityColor}15`, color: stat.severityColor }}>
                          {stat.statusLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Emerging & Deficit Skills for IEP target derivation */}
            {(emergingItems.length > 0 || deficitItems.length > 0) && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '.94rem', fontWeight: 800, color: '#0f172a' }}>
                  🎯 المهارات ذات الأولوية في الخطة التربوية الفردية (IEP Priority Targets):
                </h4>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ background: '#fef3c7' }}>
                      <th style={{ width: '12%' }}>البند</th>
                      <th style={{ width: '22%' }}>المجال</th>
                      <th style={{ width: '46%' }}>نص المهارة النمائية</th>
                      <th style={{ width: '20%' }}>التقييم الحالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergingItems.slice(0, 6).map(it => (
                      <tr key={it.id}>
                        <td style={{ fontWeight: 700 }}>بند #{it.num}</td>
                        <td>{PORTAGE_DOMAINS.find(d => d.id === it.domainId)?.name}</td>
                        <td>{it.text}</td>
                        <td style={{ color: '#d97706', fontWeight: 700 }}>في طور الاكتساب (0.5)</td>
                      </tr>
                    ))}
                    {deficitItems.slice(0, 6).map(it => (
                      <tr key={it.id}>
                        <td style={{ fontWeight: 700 }}>بند #{it.num}</td>
                        <td>{PORTAGE_DOMAINS.find(d => d.id === it.domainId)?.name}</td>
                        <td>{it.text}</td>
                        <td style={{ color: '#dc2626', fontWeight: 700 }}>غير مكتسب (0.0)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Clinical Summary & Recommendations */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '.92rem', fontWeight: 800, color: '#0f172a' }}>
                📝 الخلاصة التشخيصية والتوصيات التربوية:
              </h4>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px', fontSize: '.84rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {assessment.clinicalSummary || 'تم تطبيق دليل بورتيدج للتدخل المبكر، وتظهر النتائج حاجة الطفل لخطة تربوية فردية مكثفة تركز على المهارات الناشئة.'}
              </div>
            </div>

            {assessment.recommendations && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '.92rem', fontWeight: 800, color: '#0f172a' }}>
                  💡 توصيات التدخل المبكر وتدريبات بطاقات بورتيدج:
                </h4>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px', fontSize: '.84rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: '#166534' }}>
                  {assessment.recommendations}
                </div>
              </div>
            )}

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ fontWeight: 700, marginBottom: 30 }}>أخصائي التدخل المبكر</div>
                <div style={{ borderBottom: '1px dotted #94a3b8' }}>{assessment.examinerName || '.......................'}</div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ fontWeight: 700, marginBottom: 30 }}>مدير المركز / المشرف الفني</div>
                <div style={{ borderBottom: '1px dotted #94a3b8' }}>.......................</div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '.82rem', color: 'var(--text-sub)' }}>
            العمر النمائي: <strong style={{ color: '#16a34a' }}>{psychometrics.compositeDevAgeText}</strong> · DQ: {psychometrics.dqScore}
          </div>
          <button
            type="button"
            className="btn btn-g"
            onClick={onClose}
            style={{ fontWeight: 700 }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
