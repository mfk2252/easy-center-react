import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ATEC_ITEMS,
  ATEC_DOMAINS,
  ATEC_COPYRIGHT_INFO,
  calculateATECPsychometrics,
} from '../../data/atecData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function ATECReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateATECPsychometrics(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'atec',
      assessment.results || assessment.scores || {},
      ATEC_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const domainHtml = psychometrics.domainScores.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#1e3a8a;">${d.name}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;">${d.score} / ${d.maxScore}</td>
        <td style="padding:8px 12px;text-align:center;">${d.answered} / ${d.totalItems}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${d.percentage}%</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          <span style="color:${d.severityColor};font-weight:bold;">${d.severityLevel}</span>
        </td>
      </tr>
    `).join('');

    const itemsHtml = ATEC_ITEMS.map(it => {
      const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
      const anchor = it.anchors.find(a => a.score === score);
      const note = assessment.itemNotes?.[it.id] || '';

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${score && score >= 2 ? '#fef2f2' : score && score === 1 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:8px 10px;text-align:center;font-weight:bold;color:#1e3a8a;">${it.id}</td>
          <td style="padding:8px 10px;font-weight:bold;font-size:12px;">
            ${it.title}
            <div style="font-size:10px;color:#64748b;font-weight:normal;">${it.subtitle}</div>
          </td>
          <td style="padding:8px 10px;text-align:center;font-weight:bold;font-size:1.1em;color:${score >= 2 ? '#dc2626' : score === 1 ? '#d97706' : '#16a34a'};">
            ${score !== null ? `${score} ن` : '—'}
          </td>
          <td style="padding:8px 10px;font-size:11px;color:#334155;">
            ${anchor ? `<b>${anchor.label}:</b> ${anchor.description}` : '—'}
            ${note ? `<div style="margin-top:4px;color:#475569;background:#f1f5f9;padding:4px 8px;border-radius:4px;"><b>ملاحظات الفاحص:</b> ${note}</div>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:12px;max-width:900px;margin:auto;">
        <!-- Header -->
        <div style="border-bottom:3px solid #1e3a8a;padding-bottom:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#1e3a8a;font-size:22px;margin:0 0 4px 0;">🧩 تقرير استمارة تقييم علاج وبرامج التوحد (ATEC)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">Autism Treatment Evaluation Checklist · معهد أبحاث التوحد في سان دييغو (ARI)</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>المركز:</b> ${center?.name || 'مركز التربية الخاصة والتأهيل'}</div>
            <div><b>مرحلة التقييم:</b> ${
              assessment.evaluationPhase === 'post' ? 'تقييم بعدي ختامي' :
              assessment.evaluationPhase === 'progress' ? 'تقييم متابعة دوري' : 'خط الأساس (قبلي)'
            }</div>
          </div>
        </div>

        <!-- Open-Access / Scientific Status Box -->
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#1e3a8a;line-height:1.5;">
          <b>🏛️ الترخيص والاعتماد العلمي (Open Access):</b> استمارة تقييم علاج وبرامج التوحد (ATEC) · 
          تطوير: <b>${ATEC_COPYRIGHT_INFO.authorsAr}</b> · 
          الناشر: <b>${ATEC_COPYRIGHT_INFO.publisherAr} (${ATEC_COPYRIGHT_INFO.publisherEn})</b> · 
          أداة معيارية مفتوحة المصدر مخصصة للاستخدام الإكلينيكي والتربوي لتتبع مدى التطور والتحسن واستجابة المفحوصين للبرامج العلاجية دون أي قيود ملكية.
        </div>

        <!-- Student & Assessment Info Table -->
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:12px;">
          <tr>
            <td style="padding:4px 8px;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:4px 8px;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:4px 8px;"><b>تاريخ الفحص:</b> ${assessment.date || '—'}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;"><b>الأخصائي الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '—'}</td>
            <td style="padding:4px 8px;"><b>الملاحظ / المستجيب:</b> ${assessment.raterName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:4px 8px;"><b>التشخيص المسجل:</b> ${assessment.diagnosis || '—'}</td>
          </tr>
        </table>

        <!-- Psychometric Dashboard -->
        <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 10px 0;color:#1e3a8a;font-size:15px;">📊 المؤشرات السيكومترية الكلية (ATEC Summary Indices)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:12px;">
            <div style="background:#fff;padding:8px 16px;border-radius:6px;border:1px solid #bfdbfe;min-width:140px;">
              <div style="font-size:11px;color:#64748b;">الدرجة الكلية (Total Score):</div>
              <div style="font-size:22px;font-weight:bold;color:#1e3a8a;">${psychometrics.rawScore} / 180</div>
              <div style="font-size:10px;color:#64748b;">(الدرجة الأقل تمثل تحسناً أعلى)</div>
            </div>
            <div style="background:#fff;padding:8px 16px;border-radius:6px;border:1px solid #bfdbfe;min-width:140px;">
              <div style="font-size:11px;color:#64748b;">التصنيف ومستوى الشدة:</div>
              <div style="font-size:14px;font-weight:bold;color:${psychometrics.severityColor};margin-top:4px;">${psychometrics.severityLabel}</div>
              <div style="font-size:10px;color:#64748b;">${psychometrics.percentileRange}</div>
            </div>
            <div style="background:#fff;padding:8px 16px;border-radius:6px;border:1px solid #bfdbfe;min-width:140px;">
              <div style="font-size:11px;color:#64748b;">اكتمال بنود المقياس:</div>
              <div style="font-size:20px;font-weight:bold;color:#059669;">${psychometrics.answeredCount} / 77</div>
              <div style="font-size:10px;color:#64748b;">نسبة الاكتمال: ${psychometrics.progressPercent}%</div>
            </div>
          </div>
        </div>

        <!-- Subscales Breakdown Table -->
        <h3 style="color:#1e3a8a;font-size:14px;margin:14px 0 8px 0;">📈 نتائج الأقسام والمجالات النمائية الأربعة (ATEC Subscales):</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;background:#fff;border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f1f5f9;color:#334155;border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px 12px;text-align:right;">المجال النمائي</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة المحققة / العظمى</th>
              <th style="padding:8px 12px;text-align:center;">البنود المكتملة</th>
              <th style="padding:8px 12px;text-align:center;">نسبة التأثر</th>
              <th style="padding:8px 12px;text-align:center;">مستوى القصور</th>
            </tr>
          </thead>
          <tbody>
            ${domainHtml}
          </tbody>
        </table>

        <!-- Clinical Impression -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;">
          <h3 style="margin:0 0 6px 0;color:#1e3a8a;font-size:14px;">📝 الخلاصة الإكلينيكية ومستوى التطور النمائي:</h3>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#334155;white-space:pre-wrap;">
            ${assessment.clinicalSummary || psychometrics.clinicalImpression}
          </p>
        </div>

        <!-- Recommendations -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 6px 0;color:#1e3a8a;font-size:14px;">🎯 التوصيات العلاجية وأولويات الخطة التربوية الفردية (IEP Priorities):</h3>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#334155;white-space:pre-wrap;">
            ${assessment.recommendations || psychometrics.recommendations}
          </p>
        </div>

        <!-- Detailed Items Table -->
        <h3 style="color:#1e3a8a;font-size:14px;margin:14px 0 8px 0;">📋 تفاصيل الاستجابات لجميع بنود المقياس (77 بنداً):</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:11px;background:#fff;border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f1f5f9;color:#334155;border-bottom:2px solid #cbd5e1;">
              <th style="padding:6px;width:35px;text-align:center;">#</th>
              <th style="padding:6px;text-align:right;width:240px;">البند والسلوك الملاحظ</th>
              <th style="padding:6px;text-align:center;width:60px;">الدرجة</th>
              <th style="padding:6px;text-align:right;">الوصف السريري وملاحظات الفاحص</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signatures Footer -->
        <div style="display:flex;justify-content:space-between;margin-top:30px;padding-top:14px;border-top:1px solid #cbd5e1;font-size:12px;">
          <div style="text-align:center;width:200px;">
            <div><b>الأخصائي الفاحص</b></div>
            <div style="margin-top:35px;border-bottom:1px solid #94a3b8;">${assessment.examinerName || assessment.specialistName || '—'}</div>
          </div>
          <div style="text-align:center;width:200px;">
            <div><b>المشرف الفني / الإكلينيكي</b></div>
            <div style="margin-top:35px;border-bottom:1px solid #94a3b8;">التوقيع والاعتماد</div>
          </div>
          <div style="text-align:center;width:200px;">
            <div><b>ختم المركز المعتمد</b></div>
            <div style="margin-top:35px;border-bottom:1px solid #94a3b8;">${center?.name || 'المركز'}</div>
          </div>
        </div>
      </div>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير ATEC - ${assessment.studentName || 'المفحوص'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 10mm; background: #fff; }
              @page { size: A4; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${html}
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
    const text = `*تقرير تقييم علاج وبرامج التوحد (ATEC)*
المفحوص: ${assessment.studentName || '—'}
العمر: ${assessment.age || '—'}
التاريخ: ${assessment.date || '—'}
الدرجة الكلية: ${psychometrics.rawScore} من 180
التصنيف الإكلينيكي: ${psychometrics.severityLabel}
مرحلة التقييم: ${assessment.evaluationPhase === 'post' ? 'بعدي ختامي' : assessment.evaluationPhase === 'progress' ? 'متابعة دورية' : 'خط الأساس (قبلي)'}
المركز: ${center?.name || 'مركز التربية الخاصة والتأهيل'}`;
    sendReportToWhatsApp(text);
  }

  return (
    <>
      <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
        <div
          className="mb"
          style={{
            maxWidth: 'min(1280px, calc(100vw - 24px))',
            width: '100%',
            maxHeight: 'min(94vh, calc(100dvh - 20px))',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Header */}
          <div
            className="fhd modal-header-custom"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#fff',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>📊</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                  تقرير استمارة تقييم علاج وبرامج التوحد (ATEC Report)
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#e0e7ff' }}>
                  المفحوص: {assessment.studentName} · التاريخ: {assessment.date} · المرحلة: {
                    assessment.evaluationPhase === 'post' ? '🏆 ختامي (بعدي)' :
                    assessment.evaluationPhase === 'progress' ? '📈 متابعة دورية' : '🏁 خط الأساس (قبلي)'
                  }
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => {
                    onClose();
                    onEdit(assessment);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  ✏️ تعديل الدرجات
                </button>
              )}
              <button
                type="button"
                className="btn btn-xs"
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 22px' }}>
            {/* Open-Access Legal & Scientific Notice */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--r)',
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: '0.8rem',
                color: '#1e40af',
                lineHeight: 1.5,
              }}
            >
              🏛️ <strong>أداة قياس وتتبع نمائية معتمدة بدون قيود حقوق ملكية:</strong> تم تطوير استمارة ATEC بواسطة 
              د. برنارد ريملاند ود. ستيفن إدلسون من معهد أبحاث التوحد في أمريكا (ARI) لتكون أداة مفتوحة (Public Domain) لقياس أثر البرامج التأهيلية بدقة وشفافية.
            </div>

            {/* Student & Examiner Summary Cards */}
            <div
              style={{
                background: 'var(--g0)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--r)',
                padding: '12px 16px',
                marginBottom: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
                fontSize: '0.82rem',
              }}
            >
              <div><strong>اسم المفحوص:</strong> {assessment.studentName || '—'}</div>
              <div><strong>العمر الزمني:</strong> {assessment.age || '—'}</div>
              <div><strong>تاريخ الفحص:</strong> {assessment.date || '—'}</div>
              <div><strong>الفاحص المطبق:</strong> {assessment.examinerName || '—'}</div>
              <div><strong>الملاحظ / ولي الأمر:</strong> {assessment.raterName || '—'}</div>
              <div><strong>التشخيص الأساسي:</strong> {assessment.diagnosis || '—'}</div>
            </div>

            {/* Psychometric Highlight Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '12px 16px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الكلية (ATEC Total):</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--pr)', marginTop: 2 }}>
                  {psychometrics.rawScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>/ 180</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>درجة أقل = تحسن نمائي أعلى</span>
              </div>

              <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${psychometrics.severityColor}`, borderRadius: 'var(--r2)', padding: '12px 16px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>التصنيف التشخيصي ومستوى الشدة:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: psychometrics.severityColor, marginTop: 4 }}>
                  {psychometrics.severityLabel}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>{psychometrics.percentileRange}</span>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '12px 16px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>اكتمال التقييم:</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ok)', marginTop: 4 }}>
                  {psychometrics.answeredCount} / 77 بنداً
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>نسبة الإنجاز: {psychometrics.progressPercent}%</span>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '12px 16px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>مرحلة القياس:</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a', marginTop: 4 }}>
                  {assessment.evaluationPhase === 'post' ? '🏆 ختامي (بعدي)' :
                   assessment.evaluationPhase === 'progress' ? '📈 متابعة دورية' : '🏁 خط الأساس (قبلي)'}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>تطبيق منتظم كل 3-6 أشهر</span>
              </div>
            </div>

            {/* Subscales Breakdown Cards */}
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📊 نتائج الأقسام والمجالات النمائية الأربعة:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {psychometrics.domainScores.map(dom => (
                  <div
                    key={dom.id}
                    style={{
                      background: dom.bgLight,
                      border: `1px solid ${dom.borderColor}`,
                      borderRadius: 'var(--r2)',
                      padding: '12px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.85rem', color: dom.color }}>{dom.name}</strong>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: dom.color }}>
                        {dom.score} / {dom.maxScore}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: 6 }}>
                      <span>البنود: {dom.answered} من {dom.totalItems}</span>
                      <span style={{ fontWeight: 700, color: dom.severityColor }}>{dom.severityLevel}</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${dom.percentage}%`,
                          height: '100%',
                          background: dom.severityColor,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Impression & Recommendations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r)', padding: '14px 18px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--pr)' }}>
                  📝 الخلاصة التشخيصية ومستوى التطور:
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {assessment.clinicalSummary || psychometrics.clinicalImpression}
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r)', padding: '14px 18px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--pr)' }}>
                  🎯 التوصيات التأهيلية وأولويات الخطة (IEP):
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {assessment.recommendations || psychometrics.recommendations}
                </p>
              </div>
            </div>

            {/* Detailed Items Table (77 Items) */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📋 تفاصيل الاستجابة لجميع بنود المقياس (77 بنداً):
              </h4>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--r)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-sub)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: 45 }}>#</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>البند والسلوك الملاحظ</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: 80 }}>الدرجة</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>الوصف السريري وملاحظات الفاحص</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ATEC_ITEMS.map(item => {
                      const score = assessment.results?.[item.id] !== undefined ? Number(assessment.results[item.id]) : null;
                      const anchor = item.anchors.find(a => a.score === score);
                      const note = assessment.itemNotes?.[item.id] || '';

                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: score && score >= 2 ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800, color: 'var(--pr)' }}>
                            {item.id}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>
                            {item.title}
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 400 }}>{item.subtitle}</div>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <span
                              className={`bdg ${
                                score >= 2 ? 'b-rd' : score === 1 ? 'b-or' : 'b-gr'
                              }`}
                              style={{ fontWeight: 800, fontSize: '0.78rem' }}
                            >
                              {score !== null ? `${score} ن` : '—'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {anchor ? (
                              <div>
                                <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{anchor.label}: </strong>
                                <span style={{ color: 'var(--text-sub)', fontSize: '0.78rem' }}>{anchor.description}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-sub)' }}>—</span>
                            )}
                            {note && (
                              <div style={{ marginTop: 4, background: 'var(--g0)', padding: '4px 8px', borderRadius: 'var(--r3)', fontSize: '0.74rem', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                                ✍️ <strong>شواهد وملاحظات الفاحص:</strong> {note}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal Sticky Footer (وفق تصميم CARS-2 المعتمد) */}
          <div
            className="modal-footer-custom"
            style={{
              padding: '12px 20px',
              background: 'var(--g0)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="btn btn-p"
                onClick={handlePrint}
                style={{ fontWeight: 800 }}
              >
                🖨️ طباعة التقرير
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setBridgeOpen(true)}
                style={{ background: '#f59e0b', color: '#fff', fontWeight: 800 }}
              >
                🎯 اشتقاق الخطة الفردية (IEP)
              </button>
              <button
                type="button"
                className="btn btn-g"
                onClick={handleShareWhatsApp}
                title="مشاركة ملخص التقرير عبر واتساب"
              >
                💬 واتساب
              </button>
            </div>

            <button
              type="button"
              className="btn btn-g"
              onClick={onClose}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* IEP Bridge Modal Integration */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleItems={ATEC_ITEMS}
          scaleType="atec"
        />
      )}
    </>
  );
}
