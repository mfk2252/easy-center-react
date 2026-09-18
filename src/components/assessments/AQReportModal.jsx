import { useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AQ_DOMAINS,
  AQ_COPYRIGHT_INFO,
  calculateAQPsychometrics,
} from '../../data/aqData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';

export default function AQReportModal({
  isOpen,
  onClose,
  assessment,
  onOpenIepBridge,
}) {
  const { center, toast } = useApp();
  const printRef = useRef(null);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    const scores = assessment.results || assessment.scores || {};
    const version = assessment.version || assessment.aqVersion || 'child';
    return calculateAQPsychometrics(scores, version);
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

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
          <title>تقرير مقياس طيف التوحد (AQ) — ${assessment.studentName || 'تقرير تشخيصي'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
            body {
              font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
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
    const text = `*تقرير مقياس طيف التوحد (AQ - Autism Spectrum Quotient)*
المفحوص: ${assessment.studentName || '—'}
العمر: ${assessment.age || '—'}
التاريخ: ${assessment.date || '—'}
النسخة: ${assessment.version === 'adolescent' ? 'نسخة اليافعين (12-16 سنة)' : 'نسخة الأطفال (4-11 سنة)'}
الدرجة الإجمالية: ${psychometrics.totalScore} من ${psychometrics.maxScore}
حالة عتبة القطع (Cut-off ≥ 30): ${psychometrics.isAboveCutoff ? 'تجاوز عتبة القطع (مؤشر مرتفع لسمات التوحد)' : 'أقل من عتبة القطع (ضمن النطاق الطبيعي)'}
التصنيف الإكلينيكي: ${psychometrics.severityLabel}
مستوى الخطورة: ${psychometrics.riskLevel}
المركز: ${center?.name || 'مركز التربية الخاصة والتأهيل'}`;

    sendReportToWhatsApp({
      parentPhone: assessment.parentPhone || '',
      studentName: assessment.studentName,
      scaleName: 'مقياس طيف التوحد (AQ) — Cambridge ARC',
      reportText: text,
    });
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1150 }}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1200px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'var(--bg-main, #ffffff)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          className="mhd"
          style={{
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            color: '#fff',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🧠</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  التقرير السريري الإكلينيكي — مقياس طيف التوحد (AQ)
                </h3>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    fontSize: '.68rem',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  {assessment.version === 'adolescent' ? 'نسخة اليافعين 12-16' : 'نسخة الأطفال 4-11'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '.75rem', color: '#d1fae5', opacity: 0.9 }}>
                Cambridge Autism Research Centre • Simon Baron-Cohen et al.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onOpenIepBridge && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onOpenIepBridge(assessment)}
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  fontWeight: 800,
                  fontSize: '.78rem',
                }}
              >
                🎯 تصدير أهداف الخطة IEP
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleShareWhatsApp}
              style={{
                background: '#25D366',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '.78rem',
              }}
            >
              💬 مشاركة واتساب
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handlePrint}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 700,
                fontSize: '.78rem',
              }}
            >
              🖨️ طباعة / PDF
            </button>
            <button
              type="button"
              className="btn btn-sm btn-g"
              onClick={onClose}
              style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* SCROLLABLE REPORT BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#f8fafc' }}>
          <div
            ref={printRef}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            {/* PRINT HEADER */}
            <div
              style={{
                borderBottom: '2px solid #047857',
                paddingBottom: 16,
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#065f46' }}>
                  تقرير التقييم والفرز الإكلينيكي لسمات طيف التوحد (AQ)
                </h2>
                <div style={{ fontSize: '.84rem', color: '#475569', marginTop: 4 }}>
                  {AQ_COPYRIGHT_INFO.scaleFullNameAr} • {AQ_COPYRIGHT_INFO.authorsAr}
                </div>
                <div style={{ fontSize: '.75rem', color: '#64748b', marginTop: 2 }}>
                  Autism Research Centre (ARC), University of Cambridge — Open Access Clinical Tool
                </div>
              </div>

              <div style={{ textAlign: 'left', direction: 'ltr' }}>
                <div style={{ fontSize: '.95rem', fontWeight: 800, color: '#0f172a' }}>
                  {center?.name || 'مركز التأهيل والتربية الخاصة'}
                </div>
                <div style={{ fontSize: '.75rem', color: '#64748b' }}>
                  تاريخ التقييم: {assessment.date || '—'}
                </div>
                <div style={{ fontSize: '.75rem', color: '#059669', fontWeight: 700 }}>
                  كود التقييم: {assessment.id || '—'}
                </div>
              </div>
            </div>

            {/* STUDENT & EXAMINER DETAILS TABLE */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👤 بيانات المفحوص ومعلومات التقييم</span>
              </div>
              <table style={{ width: '100%', fontSize: '.84rem', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                <tbody>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ width: '15%', fontWeight: 700, color: '#475569' }}>اسم المفحوص:</td>
                    <td style={{ width: '35%', fontWeight: 800, color: '#0f172a' }}>{assessment.studentName || '—'}</td>
                    <td style={{ width: '15%', fontWeight: 700, color: '#475569' }}>العمر الزمني:</td>
                    <td style={{ width: '35%' }}>{assessment.age || '—'} ({assessment.gender || 'ذكر'})</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#475569' }}>نسخة المقياس:</td>
                    <td style={{ fontWeight: 700, color: '#047857' }}>
                      {assessment.version === 'adolescent' ? 'نسخة اليافعين (12–16 سنة)' : 'نسخة الأطفال (4–11 سنة)'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#475569' }}>التشخيص الأولي:</td>
                    <td>{assessment.diagnosis || 'طيف التوحد'}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ fontWeight: 700, color: '#475569' }}>المجيب / المصدر:</td>
                    <td>{assessment.raterName || 'ولي الأمر'} ({assessment.raterRelation || 'الأم / الأب'})</td>
                    <td style={{ fontWeight: 700, color: '#475569' }}>الأخصائي الفاحص:</td>
                    <td>{assessment.examinerName || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DIAGNOSTIC SCOREBOARD & CLINICAL CUT-OFF CARD */}
            <div
              style={{
                background: psychometrics.isAboveCutoff ? '#fef2f2' : '#f0fdf4',
                border: `2px solid ${psychometrics.isAboveCutoff ? '#f87171' : '#86efac'}`,
                borderRadius: 12,
                padding: '18px 22px',
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#475569' }}>
                    النتيجة التشخيصية الإجمالية لمقياس AQ
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: psychometrics.severityColor, marginTop: 4 }}>
                    {psychometrics.totalScore} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>من 50 نقطة</span>
                  </div>
                  <div style={{ fontSize: '.85rem', fontWeight: 800, color: psychometrics.severityColor, marginTop: 2 }}>
                    {psychometrics.severityLabel}
                  </div>
                </div>

                <div
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 10,
                    padding: '12px 18px',
                    textAlign: 'center',
                    minWidth: 200,
                  }}
                >
                  <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#64748b' }}>
                    عتبة القطع الإكلينيكية (Clinical Cut-off)
                  </div>
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      color: psychometrics.isAboveCutoff ? '#dc2626' : '#16a34a',
                      marginTop: 4,
                    }}
                  >
                    {psychometrics.isAboveCutoff ? '≥ 30 (تجاوز عتبة القطع)' : '< 30 (دون عتبة القطع)'}
                  </div>
                  <div style={{ fontSize: '.72rem', color: '#64748b', marginTop: 2 }}>
                    مستوى الخطورة: <strong>{psychometrics.riskLevel}</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  fontSize: '.82rem',
                  color: '#334155',
                  lineHeight: 1.6,
                }}
              >
                <strong>الخلاصة الإكلينيكية:</strong> {psychometrics.clinicalSummary}
              </div>
            </div>

            {/* DOMAIN ANALYSIS TABLE & BARS */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📊 التحليل التفصيلي للمجالات الخمسة (10 بنود لكل مجال)</span>
              </div>

              <table style={{ width: '100%', fontSize: '.82rem', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#1e293b' }}>
                    <th style={{ width: '25%' }}>المجال النمائي / المعرفي</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>الدرجة الخام</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>النسبة المئوية</th>
                    <th style={{ width: '25%', textAlign: 'center' }}>المستوى الإكلينيكي</th>
                    <th style={{ width: '20%' }}>التمثيل البياني</th>
                  </tr>
                </thead>
                <tbody>
                  {psychometrics.domainBreakdown.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ fontWeight: 700 }}>
                        <span style={{ color: d.color, marginRight: 6 }}>●</span> {d.name}
                        <div style={{ fontSize: '.7rem', color: '#64748b' }}>{d.nameEn}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '.9rem' }}>
                        {d.rawScore} <span style={{ fontSize: '.7rem', color: '#94a3b8' }}>/ 10</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {d.percentage}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: '.74rem',
                            fontWeight: 700,
                            background: d.bgLight,
                            color: d.color,
                            border: `1px solid ${d.borderColor}`,
                          }}
                        >
                          {d.level}
                        </span>
                      </td>
                      <td>
                        <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${(d.rawScore / 10) * 100}%`,
                              height: '100%',
                              background: d.color,
                              borderRadius: 999,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FLAGGED AUTISTIC TRAIT ITEMS & IEP TARGETS */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                <span>🎯 بنود سمات التوحد المرصودة والأهداف التأهيلية المقترحة (العدد: {psychometrics.flaggedItems.length})</span>
              </div>

              {psychometrics.flaggedItems.length === 0 ? (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    padding: '12px 16px',
                    fontSize: '.82rem',
                    color: '#166534',
                    fontWeight: 700,
                  }}
                >
                  ✅ لم يتم رصد سمات دالة على طيف التوحد في بنود المقياس، وجميع الاستجابات تقع ضمن النطاق النمطي الطبيعي.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {psychometrics.flaggedItems.map(item => {
                    const domain = AQ_DOMAINS.find(d => d.id === item.domainId);
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: '#fff',
                          border: '1px solid #fecaca',
                          borderRight: '4px solid #ef4444',
                          borderRadius: 8,
                          padding: '10px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ fontSize: '.84rem', fontWeight: 700, color: '#1e293b' }}>
                            <span style={{ color: '#dc2626', marginLeft: 6 }}>[بند {item.id}]</span>
                            {item.textAr}
                          </div>
                          <span
                            style={{
                              fontSize: '.68rem',
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: domain?.bgLight,
                              color: domain?.color,
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {domain?.name}
                          </span>
                        </div>
                        <div style={{ marginTop: 6, fontSize: '.78rem', color: '#047857', background: '#f0fdf4', padding: '6px 10px', borderRadius: 6, border: '1px solid #bbf7d0' }}>
                          <strong>الهدف التأهيلي المقترح (IEP):</strong> {item.iepGoal}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RECOMMENDATIONS & CLINICAL SIGNATURES */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '.88rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                📋 التوصيات والإجراءات الإكلينيكية الموصى بها
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: '.82rem',
                  color: '#334155',
                  lineHeight: 1.6,
                }}
              >
                {assessment.recommendations || (
                  psychometrics.isAboveCutoff
                    ? '1. إحالة الطفل لإجراء تقييم تشخيصي رسمي متعدد التخصصات يشمل التقييم النفسي واللغوي والتكيفي.\n2. إعداد وتطبيق خطة تربوية فردية (IEP) تركز على المهارات الاجتماعية والمرونة السلوكية والتواصل التبادلي.\n3. تدريب الأسرة على استراتيجيات الدعم البصري والقصص الاجتماعية لتعزيز التكيف في البيئة المنزلية.\n4. إعادة تقييم التطور بعد مرور 6 أشهر لمتابعة التقدم والتحسن.'
                    : '1. استمرار الملاحظة الدورية للتطور النمائي والتواصل الاجتماعي.\n2. تعزيز الأنشطة التفاعلية واللعب التشاركي مع الأقران.\n3. تقديم الدعم في المهارات التي تظهر سمات خفيفة حسب الحاجة.'
                )}
              </div>

              {/* SIGNATURES BLOCK */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 16,
                  marginTop: 30,
                  paddingTop: 16,
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '.75rem', color: '#64748b' }}>الأخصائي الفاحص</div>
                  <div style={{ fontSize: '.84rem', fontWeight: 800, marginTop: 4 }}>{assessment.examinerName || '—'}</div>
                  <div style={{ borderBottom: '1px dashed #94a3b8', width: '80%', margin: '20px auto 0' }} />
                </div>
                <div>
                  <div style={{ fontSize: '.75rem', color: '#64748b' }}>المشرف الفني / الإكلينيكي</div>
                  <div style={{ fontSize: '.84rem', fontWeight: 800, marginTop: 4 }}>د. الاستشاري المسؤول</div>
                  <div style={{ borderBottom: '1px dashed #94a3b8', width: '80%', margin: '20px auto 0' }} />
                </div>
                <div>
                  <div style={{ fontSize: '.75rem', color: '#64748b' }}>ختم واعتماد المركز</div>
                  <div style={{ fontSize: '.84rem', fontWeight: 800, marginTop: 4 }}>{center?.name || 'إدارة المركز'}</div>
                  <div style={{ borderBottom: '1px dashed #94a3b8', width: '80%', margin: '20px auto 0' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
