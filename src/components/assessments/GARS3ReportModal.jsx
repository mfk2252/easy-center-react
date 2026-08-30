import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GARS3_ITEMS,
  GARS3_DOMAINS,
  GARS3_COPYRIGHT_INFO,
  calculateGARS3Psychometrics,
} from '../../data/gars3Data';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function GARS3ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const [showItemBreakdown, setShowItemBreakdown] = useState(true);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateGARS3Psychometrics(
      assessment.results || assessment.scores || {},
      assessment.isVerbal !== undefined ? assessment.isVerbal : true
    );
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'autism_spectrum',
      assessment.results || assessment.scores || {},
      GARS3_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  // Identify high-priority symptoms (scaled score >= 11) and relative strengths (scaled score < 8)
  const highSymptomDomains = psychometrics.domainResults.filter(d => d.scaledScore >= 11);
  const relativeStrengthDomains = psychometrics.domainResults.filter(d => d.scaledScore < 9);

  function handlePrint() {
    const targetItems = assessment.isVerbal !== false
      ? GARS3_ITEMS
      : GARS3_ITEMS.filter(it => it.domainId !== 'cs' && it.domainId !== 'ms');

    const domainHtml = psychometrics.domainResults.map(d => {
      let severityBadge = d.scaledScore >= 13
        ? '<span style="color:#b91c1c;font-weight:800;background:#fee2e2;padding:2px 8px;border-radius:4px;">شديد جداً (حرج)</span>'
        : d.scaledScore >= 11
        ? '<span style="color:#c2410c;font-weight:800;background:#ffedd5;padding:2px 8px;border-radius:4px;">فوق المتوسط (مرتفع)</span>'
        : d.scaledScore >= 8
        ? '<span style="color:#0369a1;font-weight:800;background:#e0f2fe;padding:2px 8px;border-radius:4px;">متوسط (ملاحظ)</span>'
        : '<span style="color:#047857;font-weight:800;background:#d1fae5;padding:2px 8px;border-radius:4px;">ضمن المتوسط الطبيعي</span>';

      return `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 12px;font-weight:bold;color:${d.color};">${d.name} (${d.code})</td>
          <td style="padding:8px 12px;text-align:center;">${d.rawScore} / ${d.maxRaw}</td>
          <td style="padding:8px 12px;text-align:center;font-weight:900;color:${d.color};font-size:1.05em;">${d.scaledScore}</td>
          <td style="padding:8px 12px;text-align:center;font-weight:bold;">${d.percentile}%</td>
          <td style="padding:8px 12px;text-align:center;">${severityBadge}</td>
        </tr>
      `;
    }).join('');

    const itemsHtml = targetItems.map(it => {
      const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : (assessment.scores?.[it.id] !== undefined ? Number(assessment.scores[it.id]) : null);
      const note = assessment.itemNotes?.[it.id] || '';
      const scoreLabels = ['0 - أبداً (لا يلاحظ)', '1 - نادراً', '2 - أحياناً', '3 - كثيراً جداً / نعم'];
      const scoreColor = score === 3 ? '#b91c1c' : score === 2 ? '#c2410c' : score === 1 ? '#0369a1' : '#047857';

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${score && score >= 3 ? '#fef2f2' : score && score >= 2 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:6px 10px;text-align:center;font-weight:bold;">#${it.id}</td>
          <td style="padding:6px 10px;font-weight:bold;">${it.text}</td>
          <td style="padding:6px 10px;text-align:center;font-weight:bold;color:${scoreColor};">${score !== null ? scoreLabels[score] || score : '—'}</td>
          <td style="padding:6px 10px;font-size:0.85em;color:#64748b;">${note || '—'}</td>
        </tr>
      `;
    }).join('');

    const verbalLabel = assessment.isVerbal !== false
      ? '🗣️ نموذج الأطفال الناطقين (6 مقاييس فرعية - 58 بنداً)'
      : '🤫 نموذج الأطفال غير الناطقين (4 مقاييس فرعية أساسية - 44 بنداً)';

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:15px;max-width:1000px;margin:auto;">
        
        <!-- Header Branding -->
        <div style="border-bottom:3px solid #0d9488;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#0f766e;font-size:22px;margin:0 0 4px 0;font-weight:900;">
              📊 تقرير تقييم وتشخيص اضطراب طيف التوحد (GARS-3)
            </h1>
            <p style="margin:0;font-size:13px;color:#0d9488;font-weight:700;">
              Gilliam Autism Rating Scale (3rd Edition) — مقنن وفق معايير DSM-5
            </p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#64748b;">
              © PRO-ED / د. جيمس إي. جيليام · مرخص للاستخدام المهني في برامج ومراكز التربية الخاصة والتأهيل
            </p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>تاريخ التقييم:</b> ${assessment.date || '—'}</div>
            <div><b>صيغة التطبيق:</b> ${verbalLabel}</div>
            <div style="font-weight:bold;color:#0f766e;margin-top:2px;">${center?.name || 'مركز التأهيل والتربية الخاصة'}</div>
          </div>
        </div>

        <!-- Student & Assessment Quick Info -->
        <table style="width:100%;margin-bottom:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;width:33%;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;width:33%;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;width:33%;"><b>الصف / المرحلة:</b> ${assessment.grade || '—'}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;width:33%;"><b>الأخصائي الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '—'}</td>
            <td style="padding:8px 12px;width:33%;"><b>المستجيب (ولي أمر/معلم):</b> ${assessment.raterName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:8px 12px;width:33%;"><b>التشخيص المبدئي:</b> ${assessment.diagnosis || '—'}</td>
          </tr>
        </table>

        <!-- Psychometric Dashboard Tiles -->
        <div style="background:#f0fdfa;border:1.5px solid #99f6e4;border-radius:10px;padding:14px;margin-bottom:18px;">
          <h3 style="margin:0 0 10px 0;color:#0f766e;font-size:15px;font-weight:900;">
            📈 المؤشرات السيكومترية ومعامل التوحد (AQ Dashboard) وفق DSM-5:
          </h3>
          <div style="display:flex;justify-content:space-between;text-align:center;gap:10px;">
            <div style="flex:1;background:#ffffff;padding:10px;border-radius:8px;border:1.5px solid #0d9488;">
              <div style="font-size:12px;color:#0f766e;font-weight:700;">معامل التوحد (AQ)</div>
              <div style="font-size:24px;font-weight:900;color:${psychometrics.severityColor};">${psychometrics.autismQuotient}</div>
              <div style="font-size:11px;color:#64748b;">المتوسط: 100 · الانحراف: ±15</div>
            </div>
            <div style="flex:1;background:#ffffff;padding:10px;border-radius:8px;border:1px solid #cbd5e1;">
              <div style="font-size:12px;color:#0369a1;font-weight:700;">الرتبة المئينية الكلية</div>
              <div style="font-size:24px;font-weight:900;color:#0284c7;">${psychometrics.overallPercentile}%</div>
              <div style="font-size:11px;color:#64748b;">مقارنة بالعينة المعيارية</div>
            </div>
            <div style="flex:1;background:#ffffff;padding:10px;border-radius:8px;border:1px solid #cbd5e1;">
              <div style="font-size:12px;color:#6d28d9;font-weight:700;">مجموع الدرجات المعيارية</div>
              <div style="font-size:24px;font-weight:900;color:#7c3aed;">${psychometrics.sumScaledScores}</div>
              <div style="font-size:11px;color:#64748b;">موزونة على ${assessment.isVerbal !== false ? '6' : '4'} مقاييس</div>
            </div>
            <div style="flex:1.2;background:#ffffff;padding:10px;border-radius:8px;border:1.5px solid ${psychometrics.severityColor};">
              <div style="font-size:12px;color:#475569;font-weight:700;">التشخيص والشدة الإكلينيكية</div>
              <div style="font-size:14px;font-weight:900;color:${psychometrics.severityColor};margin-top:2px;">${psychometrics.probability}</div>
              <div style="font-size:12px;font-weight:800;color:${psychometrics.severityColor};">${psychometrics.dsm5Level}</div>
            </div>
          </div>
        </div>

        <!-- Subscales Psychometric Table -->
        <h3 style="color:#0f766e;font-size:15px;margin:16px 0 8px 0;font-weight:900;">
          🌐 النتائج السيكومترية للمقاييس الفرعية (Subscale Analysis):
        </h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:13px;border:1px solid #cbd5e1;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:8px 12px;text-align:right;">المقياس الفرعي</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة الخام</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة المعيارية (1-20)</th>
              <th style="padding:8px 12px;text-align:center;">الرتبة المئينية</th>
              <th style="padding:8px 12px;text-align:center;">مستوى الشدة والأعراض</th>
            </tr>
          </thead>
          <tbody>
            ${domainHtml}
          </tbody>
        </table>

        <!-- Clinical Narrative Summary -->
        ${assessment.clinicalSummary ? `
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;">
            <h4 style="margin:0 0 6px 0;color:#0f766e;font-size:14px;font-weight:900;">📝 الخلاصة التشخيصية والوصف النفسي والسلوكي:</h4>
            <p style="margin:0;font-size:12.5px;line-height:1.7;white-space:pre-wrap;">${assessment.clinicalSummary}</p>
          </div>
        ` : ''}

        <!-- IEP Recommendations -->
        ${assessment.recommendations ? `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:16px;">
            <h4 style="margin:0 0 6px 0;color:#15803d;font-size:14px;font-weight:900;">🎯 توصيات الخطة التربوية التأهيلية الفردية (IEP):</h4>
            <p style="margin:0;font-size:12.5px;line-height:1.7;white-space:pre-wrap;color:#166534;">${assessment.recommendations}</p>
          </div>
        ` : ''}

        <!-- Complete Items Breakdown Table -->
        <h3 style="color:#0f766e;font-size:14px;margin:20px 0 8px 0;font-weight:900;">
          📑 تفريغ استجابات بنود المقياس التفصيلية (${targetItems.length} بنداً):
        </h3>
        <table style="width:100%;border-collapse:collapse;font-size:11.5px;border:1px solid #cbd5e1;margin-bottom:24px;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:6px 10px;text-align:center;width:40px;">#</th>
              <th style="padding:6px 10px;text-align:right;">نص العبارة السلوكية</th>
              <th style="padding:6px 10px;text-align:center;width:160px;">الاستجابة المسجلة</th>
              <th style="padding:6px 10px;text-align:right;">ملاحظات الأخصائي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Legal Notice & Copyright Footer in print -->
        <div style="font-size:10.5px;color:#64748b;border-top:1px dashed #cbd5e1;padding-top:8px;margin-bottom:20px;text-align:justify;">
          <b>إشعار قانوني واعتماد علمي:</b> مقياس GARS-3 هو علامة تجارية مسجلة لمؤسسة PRO-ED الأمريكية. هذا التقرير صادر عن المنظومة الرقمية للتربية الخاصة والتأهيل، ويستخدم حصراً لأغراض التشخيص وتصميم الخطط الفردية.
        </div>

        <!-- Official 3-Person Signatures Block -->
        <div style="margin-top:24px;padding-top:14px;border-top:1.5px solid #94a3b8;display:flex;justify-content:space-between;text-align:center;font-size:12.5px;">
          <div style="width:30%;">
            <div style="font-weight:bold;margin-bottom:35px;color:#0f766e;">الأخصائي الفاحص</div>
            <div style="border-top:1px solid #cbd5e1;padding-top:4px;">${assessment.examinerName || assessment.specialistName || '................................'}</div>
          </div>
          <div style="width:30%;">
            <div style="font-weight:bold;margin-bottom:35px;color:#0f766e;">المستجيب / ولي الأمر</div>
            <div style="border-top:1px solid #cbd5e1;padding-top:4px;">${assessment.raterName || '................................'}</div>
          </div>
          <div style="width:30%;">
            <div style="font-weight:bold;margin-bottom:35px;color:#0f766e;">المشرف الإكلينيكي / مدير المركز</div>
            <div style="border-top:1px solid #cbd5e1;padding-top:4px;">................................</div>
          </div>
        </div>

      </div>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>تقرير مقياس GARS-3 - ${assessment.studentName || 'المفحوص'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
          <style>
            body { margin: 20px; font-family: 'Tajawal', sans-serif; }
            @media print {
              body { margin: 0; }
              button { display: none !important; }
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
    sendReportToWhatsApp(assessment, 'autism_spectrum');
  }

  return (
    <>
      <div className="mbg" style={{ zIndex: 1100 }} onClick={e => e.target === e.currentTarget && onClose()}>
        <div
          className="mb"
          style={{
            maxWidth: 'min(1360px, calc(100vw - 24px))',
            width: '100%',
            maxHeight: 'min(94vh, calc(100dvh - 20px))',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Top Banner */}
          <div
            className="fhd modal-header-custom"
            style={{
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
              color: '#fff',
              flexShrink: 0,
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  📊 تقرير تشخيص اضطراب طيف التوحد (GARS-3)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  {assessment.studentName} · {assessment.date}
                </span>
                <span className="bdg" style={{ background: '#134e4a', color: '#ccfbf1', fontSize: '0.68rem', fontWeight: 800 }}>
                  © PRO-ED / د. جيمس إي. جيليام
                </span>
              </div>
              <span style={{ fontSize: '0.76rem', opacity: 0.95, display: 'block', marginTop: 2 }}>
                Gilliam Autism Rating Scale (3rd Edition) — التقرير السيكومتري والتوصيات التشخيصية لخطة الـ IEP
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-xs"
                onClick={handlePrint}
                style={{ background: '#fff', color: '#0f766e', fontWeight: 800, border: 'none' }}
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
              background: '#f0fdfa',
              borderBottom: '1px solid #99f6e4',
              padding: '10px 18px',
              fontSize: '0.78rem',
              color: '#115e59',
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
                <strong>حقوق الملكية الفكرية:</strong> مقياس جيليام لتقدير اضطراب طيف التوحد (GARS-3) — إعداد: <b>{GARS3_COPYRIGHT_INFO.authorAr}</b> ({GARS3_COPYRIGHT_INFO.authorEn}) · ناشر النسخة الأصلية: <b>{GARS3_COPYRIGHT_INFO.publisherAr}</b>.
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', background: '#ccfbf1', color: '#134e4a', padding: '2px 8px', borderRadius: 4, border: '1px solid #5eead4', fontWeight: 700 }}>
              النسخة المقننة للتربية الخاصة والتشخيص الإكلينيكي (DSM-5)
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
              
              {/* Autism Quotient (AQ) Tile */}
              <div style={{ background: '#f0fdfa', border: '1.5px solid #5eead4', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#115e59', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  حاصل معامل التوحد الكلي (AQ)
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: psychometrics.severityColor }}>
                  {psychometrics.autismQuotient}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#134e4a', display: 'block', marginTop: 2 }}>
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
                  مقارنة بالعينة المعيارية للتصلب والتوحد
                </span>
              </div>

              {/* Sum of Scaled Scores Tile */}
              <div style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  مجموع الدرجات المعيارية (Sum of SS)
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#7c3aed' }}>
                  {psychometrics.sumScaledScores}
                  <small style={{ fontSize: '0.85rem', color: '#6d28d9' }}> / {assessment.isVerbal !== false ? '120' : '80'}</small>
                </span>
                <span style={{ fontSize: '0.74rem', color: '#5b21b6', display: 'block', marginTop: 2 }}>
                  موزونة على {assessment.isVerbal !== false ? '6' : '4'} مقاييس فرعية
                </span>
              </div>

              {/* Diagnosis Classification Tile */}
              <div style={{ background: 'var(--g0)', border: `1.5px solid ${psychometrics.severityColor}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  التشخيص الإكلينيكي (DSM-5)
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: psychometrics.severityColor, display: 'block', marginTop: 6 }}>
                  {psychometrics.probability}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', marginTop: 4 }}>
                  {psychometrics.dsm5Level}
                </span>
              </div>
            </div>

            {/* Subscales Psychometric Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ padding: '12px 16px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f766e' }}>
                  📑 النتائج السيكومترية على المقاييس الفرعية لـ GARS-3 (Subscale Analysis):
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  متوسط الدرجة المعيارية الطبيعية = 10 (انحراف ±3) · الرتبة المئينية = 50%
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                      <th style={{ padding: '8px 14px' }}>المقياس الفرعي</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الرمز</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الدرجة الخام</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الدرجة المعيارية (1-20)</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الرتبة المئينية</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>التصنيف والشدة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psychometrics.domainResults.map(dom => {
                      const isHigh = dom.scaledScore >= 11;
                      const isExtreme = dom.scaledScore >= 13;
                      const badgeClass = isExtreme ? 'b-rd' : isHigh ? 'b-or' : dom.scaledScore >= 8 ? 'b-bl' : 'b-gr';
                      const severityDesc = isExtreme ? 'شديد جداً (حرج)' : isHigh ? 'فوق المتوسط (مرتفع)' : dom.scaledScore >= 8 ? 'متوسط (ملاحظ)' : 'ضمن المتوسط الطبيعي';

                      return (
                        <tr key={dom.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: dom.color }}>
                            {dom.name}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sub)' }}>
                            {dom.code}
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
                            <span className={`bdg ${badgeClass}`} style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                              {severityDesc}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strengths & Deficits Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 18 }}>
              {/* Deficit Areas (High Symptom Load) */}
              <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#be123c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚠️</span> جوانب الأعراض الشديدة ذات الأولوية للخطة الفردية (IEP Priority Needs):
                </div>
                {highSymptomDomains.length > 0 ? (
                  <ul style={{ margin: 0, paddingRight: 20, fontSize: '0.8rem', color: '#9f1239', lineHeight: 1.6 }}>
                    {highSymptomDomains.map(d => (
                      <li key={d.id}>
                        <strong>{d.name} ({d.code}):</strong> درجة معيارية ({d.scaledScore}/20) - رتبة مئينية ({d.percentile}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                    ✓ لا توجد مقاييس في النطاق الحرج الشديد.
                  </div>
                )}
              </div>

              {/* Relative Strengths / Milder Areas */}
              <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#047857', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🌟</span> نقاط القوة النسبية والأعراض الأقل حدة (Strengths & Assets):
                </div>
                {relativeStrengthDomains.length > 0 ? (
                  <ul style={{ margin: 0, paddingRight: 20, fontSize: '0.8rem', color: '#065f46', lineHeight: 1.6 }}>
                    {relativeStrengthDomains.map(d => (
                      <li key={d.id}>
                        <strong>{d.name} ({d.code}):</strong> درجة معيارية ({d.scaledScore}/20) - رتبة مئينية ({d.percentile}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    تتوزع استجابات المفحوص على كافة المقاييس الفرعية بدرجات متقاربة.
                  </div>
                )}
              </div>
            </div>

            {/* Narrative Clinical Summary */}
            <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f766e', marginBottom: 6 }}>
                📝 الخلاصة التشخيصية والوصف النفسي السلوكي:
              </div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                {assessment.clinicalSummary || assessment.summary || assessment.resultNote || 'لم يتم تسجيل خلاصة تشخيصية.'}
              </div>
            </div>

            {/* IEP Recommendations */}
            <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10, border: '1px solid #bbf7d0', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#15803d', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <span>🎯 توصيات الخطة التربوية الفردية (IEP) واستراتيجيات التدخل التأهيلي:</span>
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

            {/* Collapsible Item Breakdown Section */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: 16 }}>
              <div
                style={{
                  padding: '10px 16px',
                  background: 'var(--g0)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => setShowItemBreakdown(s => !s)}
              >
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                  📑 تفريغ إجابات بنود المقياس ({assessment.isVerbal !== false ? '58' : '44'} بنداً)
                </div>
                <button
                  type="button"
                  className="btn btn-xs btn-g"
                  style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                >
                  {showItemBreakdown ? '⬆️ إخفاء البنود' : '⬇️ عرض تفاصيل البنود'}
                </button>
              </div>

              {showItemBreakdown && (
                <div style={{ overflowX: 'auto', maxHeight: 350, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                        <th style={{ padding: '6px 12px', width: 50, textAlign: 'center' }}>#</th>
                        <th style={{ padding: '6px 12px' }}>نص العبارة السلوكية</th>
                        <th style={{ padding: '6px 12px', textAlign: 'center', width: 140 }}>الاستجابة المسجلة</th>
                        <th style={{ padding: '6px 12px' }}>ملاحظات الفاحص</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(assessment.isVerbal !== false ? GARS3_ITEMS : GARS3_ITEMS.filter(it => it.domainId !== 'cs' && it.domainId !== 'ms')).map(it => {
                        const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : (assessment.scores?.[it.id] !== undefined ? Number(assessment.scores[it.id]) : null);
                        const note = assessment.itemNotes?.[it.id] || '';
                        const scoreLabels = ['0 - أبداً', '1 - نادراً', '2 - أحياناً', '3 - كثيراً جداً'];
                        const badgeClass = score === 3 ? 'b-rd' : score === 2 ? 'b-or' : score === 1 ? 'b-bl' : 'b-gr';

                        return (
                          <tr key={it.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '6px 12px', textAlign: 'center', fontWeight: 700 }}>
                              #{it.id}
                            </td>
                            <td style={{ padding: '6px 12px' }}>
                              {it.text}
                            </td>
                            <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                              {score !== null ? (
                                <span className={`bdg ${badgeClass}`} style={{ fontSize: '0.72rem' }}>
                                  {scoreLabels[score] || score}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-sub)' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                              {note || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
              flexWrap: 'wrap',
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
                🌉 ربط الأهداف بالـ IEP ({recommendedGoals.length})
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-p btn-sm"
                onClick={handlePrint}
                style={{
                  background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
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

      {/* IEP Bridge Modal for GARS-3 */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleType="autism_spectrum"
          scaleItems={GARS3_ITEMS}
        />
      )}
    </>
  );
}
