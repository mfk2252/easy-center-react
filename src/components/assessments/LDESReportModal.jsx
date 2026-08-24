import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LDES_ITEMS,
  LDES_DOMAINS,
  LDES_COPYRIGHT_INFO,
  calculateLDESPsychometrics,
} from '../../data/ldesData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function LDESReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateLDESPsychometrics(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'learning_difficulties',
      assessment.results || assessment.scores || {},
      LDES_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const domainHtml = psychometrics.domainResults.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#b45309;">
          ${d.name} (${d.code})
          <div style="font-size:11px;color:#64748b;font-weight:normal;">${d.categoryName}</div>
        </td>
        <td style="padding:8px 12px;text-align:center;">${d.rawScore} / ${d.maxRaw}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#b45309;font-size:14px;">${d.scaledScore} / 20</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${d.percentile}%</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          ${d.scaledScore <= 4
            ? '<span style="color:#e11d48;font-weight:bold;">صعوبة شديدة جداً</span>'
            : d.scaledScore <= 7
            ? '<span style="color:#d97706;font-weight:bold;">صعوبة ملحوظة</span>'
            : d.scaledScore <= 12
            ? '<span style="color:#059669;font-weight:bold;">متوسط طبيعي</span>'
            : '<span style="color:#0284c7;font-weight:bold;">نقطة قوة</span>'}
        </td>
      </tr>
    `).join('');

    const itemsHtml = LDES_ITEMS.map(it => {
      const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
      const note = assessment.itemNotes?.[it.id] || '';
      const domain = LDES_DOMAINS.find(d => d.id === itemDomainId(it.domainId));
      const scoreLabels = ['0 - طبيعي', '1 - نادراً (بسيطة)', '2 - أحياناً (متوسطة)', '3 - دائماً (شديدة)'];

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${score && score >= 3 ? '#fff1f2' : score && score >= 2 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:#64748b;">${it.id}</td>
          <td style="padding:6px 8px;font-weight:600;font-size:12px;">${it.text}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;">${domain?.name?.split(' ')[0] || ''}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:${score === 3 ? '#dc2626' : score === 2 ? '#ea580c' : score === 1 ? '#0284c7' : '#059669'};">
            ${score !== null ? scoreLabels[score] || score : '—'}
          </td>
          <td style="padding:6px 8px;font-size:11px;color:#64748b;">${note || '—'}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:12px;max-width:900px;margin:auto;">
        <!-- Header -->
        <div style="border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#b45309;font-size:22px;margin:0 0 4px 0;">📘 تقرير التقييم والتشخيص لصعوبات التعلم (LDES)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">Learning Disabilities Evaluation Scale — مقياس التقدير التشخيصي المقنن</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>المركز:</b> ${center?.name || 'مركز التربية الخاصة والتأهيل'}</div>
          </div>
        </div>

        <!-- COPYRIGHT & INTELLECTUAL PROPERTY BOX -->
        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#92400e;line-height:1.5;">
          <b>⚖️ إشعار حقوق الملكية الفكرية والأمانة العلمية:</b> مقياس التقدير التشخيصي لصعوبات التعلم (LDES) · 
          إعداد: <b>${LDES_COPYRIGHT_INFO.authorAr}</b> (${LDES_COPYRIGHT_INFO.authorEn}) · 
          الناشر: <b>${LDES_COPYRIGHT_INFO.publisherAr}</b> · 
          التقنين: ${LDES_COPYRIGHT_INFO.adaptationAr} · 
          ${LDES_COPYRIGHT_INFO.standardsReference}.
          <div style="margin-top:3px;font-size:10px;color:#b45309;">
            ${LDES_COPYRIGHT_INFO.notice}
          </div>
        </div>

        <!-- Student & Assessment Info Table -->
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:12px;">
          <tr>
            <td style="padding:4px 8px;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:4px 8px;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:4px 8px;"><b>الصف الدراسي:</b> ${assessment.grade || '—'}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;"><b>الأخصائي الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '—'}</td>
            <td style="padding:4px 8px;"><b>المستجيب:</b> ${assessment.raterName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:4px 8px;"><b>المدرسة:</b> ${assessment.school || '—'}</td>
          </tr>
        </table>

        <!-- Psychometric Dashboard -->
        <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 10px 0;color:#b45309;font-size:15px;">📊 المؤشرات السيكومترية ومعامل صعوبات التعلم (LDEQ Dashboard)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:12px;">
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #fcd34d;">
              <span style="color:#64748b;display:block;font-size:11px;">حاصل صعوبات التعلم (LDEQ)</span>
              <span style="font-size:22px;font-weight:900;color:${psychometrics.severityColor};">${psychometrics.ldeq}</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #fcd34d;">
              <span style="color:#64748b;display:block;font-size:11px;">الرتبة المئينية الكلية</span>
              <span style="font-size:22px;font-weight:900;color:#b45309;">${psychometrics.overallPercentile}%</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #fcd34d;">
              <span style="color:#64748b;display:block;font-size:11px;">مجموع الدرجات المعيارية</span>
              <span style="font-size:22px;font-weight:900;color:#0284c7;">${psychometrics.sumScaledScores} <small style="font-size:11px;color:#64748b;">/ 140</small></span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #fcd34d;">
              <span style="color:#64748b;display:block;font-size:11px;">التشخيص والتصنيف</span>
              <span style="font-size:13px;font-weight:bold;color:${psychometrics.severityColor};display:block;margin-top:4px;">${psychometrics.probability}</span>
            </div>
          </div>
        </div>

        <!-- Subscales Breakdown Table -->
        <h3 style="color:#b45309;font-size:15px;margin:16px 0 8px 0;">📑 الأداء التفصيلي على المقاييس الفرعية السبعة</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px 12px;text-align:right;">المقياس الفرعي</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة الخام</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة المعيارية (1-20)</th>
              <th style="padding:8px 12px;text-align:center;">الرتبة المئينية</th>
              <th style="padding:8px 12px;text-align:center;">مستوى الأداء والشدة</th>
            </tr>
          </thead>
          <tbody>
            ${domainHtml}
          </tbody>
        </table>

        <!-- Clinical Summary -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;">
          <h4 style="margin:0 0 6px 0;color:#b45309;font-size:14px;">📝 الخلاصة التشخيصية والوصف النفسي التربوي:</h4>
          <p style="margin:0;font-size:12px;line-height:1.6;white-space:pre-wrap;color:#334155;">${assessment.clinicalSummary || assessment.summary || assessment.resultNote || 'لم يتم تسجيل خلاصة.'}</p>
        </div>

        <!-- IEP Recommendations -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:20px;">
          <h4 style="margin:0 0 6px 0;color:#15803d;font-size:14px;">🎯 توصيات الخطة التربوية الفردية (IEP) وغرفة المصادر:</h4>
          <p style="margin:0;font-size:12px;line-height:1.6;white-space:pre-wrap;color:#166534;">${assessment.recommendations || 'لم يتم تسجيل توصيات محددة.'}</p>
        </div>

        <!-- Items Table -->
        <h4 style="color:#475569;font-size:13px;margin:16px 0 6px 0;">📋 سجل استجابات البنود التفصيلية (88 بنداً):</h4>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:11px;border:1px solid #e2e8f0;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:1.5px solid #cbd5e1;">
              <th style="padding:6px;width:30px;">#</th>
              <th style="padding:6px;text-align:right;">البند التشخيصي</th>
              <th style="padding:6px;width:70px;text-align:center;">المجال</th>
              <th style="padding:6px;width:120px;text-align:center;">التقدير</th>
              <th style="padding:6px;text-align:right;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signatures Footer -->
        <div style="margin-top:24px;display:flex;justify-content:space-between;border-top:1px solid #cbd5e1;padding-top:14px;font-size:12px;color:#475569;">
          <div><b>الأخصائي الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '—'}<br/><br/>التوقيع: ..........................</div>
          <div><b>المستجيب / المعلم:</b> ${assessment.raterName || '—'}<br/><br/>التوقيع: ..........................</div>
          <div><b>مدير المركز / المشرف الأكاديمي:</b><br/><br/>الختم والتوقيع: ..........................</div>
        </div>
      </div>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>تقرير LDES لصعوبات التعلم - ${assessment.studentName || 'طالب'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Tajawal', sans-serif; margin: 0; padding: 16px; }
            @media print {
              body { padding: 0; }
              @page { margin: 15mm; size: A4; }
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = () => { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWin.document.close();
    }
  }

  function handleShareWhatsApp() {
    const text = `*📊 تقرير مقياس التقدير التشخيصي لصعوبات التعلم (LDES)*\n` +
      `*اسم الطالب:* ${assessment.studentName || '—'}\n` +
      `*تاريخ التقييم:* ${assessment.date || '—'}\n` +
      `*حاصل صعوبات التعلم (LDEQ):* ${psychometrics.ldeq} (رتبة مئينية: ${psychometrics.overallPercentile}%)\n` +
      `*التشخيص والتصنيف:* ${psychometrics.probability}\n` +
      `*مستوى الشدة:* ${psychometrics.severityLevel}\n` +
      `*الأخصائي الفاحص:* ${assessment.examinerName || '—'}\n\n` +
      `*الخلاصة والتوصيات:*\n${assessment.recommendations || 'متابعة البرنامج التربوي الفردي بغرفة المصادر.'}\n\n` +
      `_تم استخراج التقرير بواسطة نظام مركز التربية الخاصة والتأهيل._`;

    sendReportToWhatsApp(assessment.phone || '', text);
  }

  function itemDomainId(domainId) {
    return domainId;
  }

  return (
    <>
      <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-xl"
          
        >
          {/* Modal Top Banner */}
          <div
            className="fhd modal-header-custom"
            style={{
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
              color: '#fff',
              flexShrink: 0,
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  📊 تقرير تشخيص صعوبات التعلم (LDES)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  {assessment.studentName} · {assessment.date}
                </span>
                <span className="bdg" style={{ background: '#78350f', color: '#fef3c7', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Hawthorne / Dr. Stephen McCarney
                </span>
              </div>
              <span style={{ fontSize: '0.76rem', opacity: 0.95, display: 'block', marginTop: 2 }}>
                Learning Disabilities Evaluation Scale — التقرير السيكومتري والتوصيات التربوية لخطة الـ IEP
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-xs"
                onClick={handlePrint}
                style={{ background: '#fff', color: '#b45309', fontWeight: 800, border: 'none' }}
              >
                🖨️ طباعة التقرير
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={handleShareWhatsApp}
                style={{ background: '#22c55e', color: '#fff', fontWeight: 800, border: 'none' }}
              >
                💬 واتساب
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700 }}
              >
                ✖ إغلاق
              </button>
            </div>
          </div>

          {/* INTELLECTUAL PROPERTY & COPYRIGHT NOTICE BANNER */}
          <div
            style={{
              background: '#fffbeb',
              borderBottom: '1px solid #fde68a',
              padding: '10px 18px',
              fontSize: '0.78rem',
              color: '#92400e',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>⚖️</span>
              <div>
                <strong>حقوق الملكية الفكرية:</strong> مقياس التقدير التشخيصي لصعوبات التعلم (LDES) — إعداد: <b>{LDES_COPYRIGHT_INFO.authorAr}</b> ({LDES_COPYRIGHT_INFO.authorEn}) · ناشر النسخة الأصلية: <b>{LDES_COPYRIGHT_INFO.publisherAr}</b>.
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', background: '#fef3c7', padding: '2px 8px', borderRadius: 4, border: '1px solid #fcd34d', fontWeight: 700 }}>
              النسخة المقننة للتربية الخاصة وغرف المصادر
            </span>
          </div>

          {/* Scrollable Report Body */}
          <div className="modal-body-scroll" style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
            
            {/* Student & Examiner Quick Profile */}
            <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 12, marginBottom: 16, border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '0.82rem' }}>
                <div><strong>اسم المفحوص:</strong> {assessment.studentName || '—'}</div>
                <div><strong>العمر الزمني:</strong> {assessment.age || '—'}</div>
                <div><strong>الصف الدراسي:</strong> {assessment.grade || '—'}</div>
                <div><strong>تاريخ التقييم:</strong> {assessment.date || '—'}</div>
                <div><strong>الأخصائي الفاحص:</strong> {assessment.examinerName || assessment.specialistName || '—'}</div>
                <div><strong>المستجيب:</strong> {assessment.raterName || '—'} ({assessment.raterRelation || '—'})</div>
              </div>
            </div>

            {/* Diagnostic Dashboard Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 18 }}>
              {/* LDEQ Quotient Tile */}
              <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  حاصل صعوبات التعلم الكلي (LDEQ)
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: psychometrics.severityColor }}>
                  {psychometrics.ldeq}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#78350f', display: 'block', marginTop: 2 }}>
                  المتوسط المعياري: 100 · الانحراف: ±15
                </span>
              </div>

              {/* Overall Percentile Tile */}
              <div style={{ background: '#f0f9ff', border: '1.5px solid #7dd3fc', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  الرتبة المئينية الكلية (Percentile)
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0284c7' }}>
                  {psychometrics.overallPercentile}%
                </span>
                <span style={{ fontSize: '0.74rem', color: '#075985', display: 'block', marginTop: 2 }}>
                  تتفوق صعوباته على {100 - psychometrics.overallPercentile}% من العينة
                </span>
              </div>

              {/* Sum of Scaled Scores */}
              <div style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  مجموع الدرجات المعيارية (Sum of SS)
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#7c3aed' }}>
                  {psychometrics.sumScaledScores}
                  <small style={{ fontSize: '0.85rem', color: '#6d28d9' }}> / 140</small>
                </span>
                <span style={{ fontSize: '0.74rem', color: '#5b21b6', display: 'block', marginTop: 2 }}>
                  موزونة على 7 مقاييس فرعية
                </span>
              </div>

              {/* Diagnosis Classification Tile */}
              <div style={{ background: 'var(--g0)', border: `1.5px solid ${psychometrics.severityColor}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  التشخيص الإكلينيكي
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: psychometrics.severityColor, display: 'block', marginTop: 6 }}>
                  {psychometrics.probability}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', marginTop: 4 }}>
                  {psychometrics.severityLevel}
                </span>
              </div>
            </div>

            {/* Subscales Psychometric Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ padding: '12px 16px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#b45309' }}>
                  📑 النتائج السيكومترية على المقاييس الفرعية السبعة (Subscale Analysis):
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  متوسط الدرجة المعيارية الطبيعية = 10 (انحراف ±3)
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                      <th style={{ padding: '8px 14px' }}>المقياس الفرعي</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>نوع الصعوبة</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الدرجة الخام</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الدرجة المعيارية (1-20)</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الرتبة المئينية</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>التصنيف والشدة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psychometrics.domainResults.map(dom => (
                      <tr key={dom.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: dom.color }}>
                          <span style={{ marginRight: 6 }}>{dom.icon}</span> {dom.name} ({dom.code})
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span className={`bdg ${dom.category === 'developmental' ? 'b-bl' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
                            {dom.categoryName}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          {dom.rawScore} / {dom.maxRaw}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 900, color: dom.color, fontSize: '0.95rem' }}>
                          {dom.scaledScore} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>/ 20</small>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>
                          {dom.percentile}%
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span className={`bdg ${dom.severityClass}`} style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                            {dom.severityLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strengths & Deficits Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 18 }}>
              {/* Deficit Areas (Needs for IEP) */}
              <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#be123c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚠️</span> جوانب الصعوبة ذات الأولوية للخطة الفردية (IEP Priority Needs):
                </div>
                {psychometrics.deficitDomains.length > 0 ? (
                  <ul style={{ margin: 0, paddingRight: 20, fontSize: '0.8rem', color: '#9f1239', lineHeight: 1.6 }}>
                    {psychometrics.deficitDomains.map(d => (
                      <li key={d.id}>
                        <strong>{d.name} ({d.code}):</strong> درجة معيارية ({d.scaledScore}/20) - {d.severityLevel}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                    ✓ لا توجد مقاييس في النطاق الحرج الشديد.
                  </div>
                )}
              </div>

              {/* Strengths Areas */}
              <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#047857', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🌟</span> نقاط القوة النمائية والأكاديمية (Strengths to Build On):
                </div>
                {psychometrics.strengthDomains.length > 0 ? (
                  <ul style={{ margin: 0, paddingRight: 20, fontSize: '0.8rem', color: '#065f46', lineHeight: 1.6 }}>
                    {psychometrics.strengthDomains.map(d => (
                      <li key={d.id}>
                        <strong>{d.name} ({d.code}):</strong> درجة معيارية ({d.scaledScore}/20) - رتبة مئينية ({d.percentile}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    الأداء يقع ضمن المتوسط العام للمرحلة العمرية.
                  </div>
                )}
              </div>
            </div>

            {/* Narrative Clinical Summary */}
            <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#b45309', marginBottom: 6 }}>
                📝 الخلاصة التشخيصية والوصف النفسي التربوي:
              </div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                {assessment.clinicalSummary || assessment.summary || assessment.resultNote || 'لم يتم تسجيل خلاصة تشخيصية.'}
              </div>
            </div>

            {/* IEP Recommendations */}
            <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10, border: '1px solid #bbf7d0', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#15803d', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🎯 توصيات الخطة التربوية الفردية (IEP) واستراتيجيات التدريس:</span>
                <button
                  type="button"
                  className="btn btn-xs btn-p"
                  onClick={() => setBridgeOpen(true)}
                  style={{ fontWeight: 700 }}
                >
                  🌉 ربط الأهداف بالخطة الفردية ({recommendedGoals.length} أهداف مقترحة)
                </button>
              </div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#166534' }}>
                {assessment.recommendations || 'لم يتم تسجيل توصيات محددة.'}
              </div>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <div
            style={{
              padding: '12px 20px',
              background: 'var(--g0)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-g btn-sm"
                  onClick={() => {
                    onClose();
                    onEdit(assessment);
                  }}
                >
                  ✏️ تعديل التقييم
                </button>
              )}
              <button
                type="button"
                className="btn btn-g btn-sm"
                onClick={() => setBridgeOpen(true)}
              >
                🌉 ربط الأهداف بالـ IEP
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-p btn-sm"
                onClick={handlePrint}
                style={{
                  background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  border: 'none',
                }}
              >
                🖨️ طباعة التقرير الرسمي (A4)
              </button>
              <button
                type="button"
                className="btn btn-g btn-sm"
                onClick={onClose}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* IEP Bridge Modal for LDES */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleType="learning_difficulties"
          scaleItems={LDES_ITEMS}
        />
      )}
    </>
  );
}
