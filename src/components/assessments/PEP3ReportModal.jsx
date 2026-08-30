import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PEP3_ITEMS,
  PEP3_DOMAINS,
  PEP3_RESPONSE_OPTIONS,
  PEP3_COPYRIGHT_INFO,
  calculatePEP3Score,
} from '../../data/pep3Data';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function PEP3ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const [activeItemFilter, setActiveItemFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculatePEP3Score(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'pep3',
      assessment.results || assessment.scores || {},
      PEP3_ITEMS
    );
  }, [assessment]);

  const filteredItemsList = useMemo(() => {
    return PEP3_ITEMS.filter(it => {
      const matchDomain = activeItemFilter === 'all' || it.domainId === activeItemFilter;
      const matchSearch = !searchTerm || it.text.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDomain && matchSearch;
    });
  }, [activeItemFilter, searchTerm]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const subscaleHtml = psychometrics.subscales.map(s => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#1e40af;">
          ${s.name} (${s.code})
          <div style="font-size:11px;color:#64748b;font-weight:normal;">${s.englishName}</div>
        </td>
        <td style="padding:8px 12px;text-align:center;">${s.raw} / ${s.maxRaw}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#2563eb;font-size:14px;">${s.tScore} T</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          <span style="
            padding:3px 8px;
            border-radius:4px;
            font-size:0.85em;
            font-weight:bold;
            background:${s.level === 'طبيعي ومناسب' ? '#ecfdf5' : s.level === 'تأخر بسيط' ? '#eff6ff' : s.level === 'تأخر متوسط' ? '#fffbeb' : '#fef2f2'};
            color:${s.level === 'طبيعي ومناسب' ? '#047857' : s.level === 'تأخر بسيط' ? '#1d4ed8' : s.level === 'تأخر متوسط' ? '#b45309' : '#b91c1c'};
          ">
            ${s.level}
          </span>
        </td>
      </tr>
    `).join('');

    const itemsHtml = PEP3_ITEMS.map((it, idx) => {
      const score = assessment.results?.[it.id] !== undefined && assessment.results?.[it.id] !== null
        ? Number(assessment.results[it.id])
        : (assessment.scores?.[it.id] !== undefined ? Number(assessment.scores[it.id]) : null);
      const note = assessment.itemNotes?.[it.id] || '';
      const domMeta = PEP3_DOMAINS.find(d => d.id === it.domainId);

      const responseLabels = {
        2: 'منجز (Pass)',
        1: 'بزوغ (Emerging)',
        0: 'إخفاق (Fail)',
      };

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${score === 0 ? '#fef2f2' : score === 1 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:#64748b;">${idx + 1}</td>
          <td style="padding:6px 8px;font-weight:600;font-size:12px;">${it.text}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;">${domMeta?.name.split(' ')[0] || ''}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:${score === 2 ? '#16a34a' : score === 1 ? '#ca8a04' : score === 0 ? '#dc2626' : '#94a3b8'};">
            ${score !== null ? responseLabels[score] || score : '—'}
          </td>
          <td style="padding:6px 8px;font-size:11px;color:#64748b;">${note || '—'}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:12px;max-width:900px;margin:auto;">
        <!-- Header -->
        <div style="border-bottom:3px solid #2563eb;padding-bottom:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#1e40af;font-size:22px;margin:0 0 4px 0;">📋 تقرير ملف التقييم النفسي التربوي للتوحد (PEP-3)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">Psychoeducational Profile — Third Edition (TEACCH Autism Program)</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>المركز:</b> ${center?.name || 'مركز رعاية وتأهيل التوحد'}</div>
          </div>
        </div>

        <!-- COPYRIGHT & INTELLECTUAL PROPERTY BOX -->
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#1e40af;line-height:1.5;">
          <b>⚖️ إشعار حقوق الملكية الفكرية والأمانة العلمية:</b> ملف التقييم النفسي التربوي للتوحد (PEP-3) · 
          إعداد: <b>${PEP3_COPYRIGHT_INFO.authorAr}</b> · 
          الناشر: <b>${PEP3_COPYRIGHT_INFO.publisherAr}</b> · 
          الفئة المستهدفة: ${PEP3_COPYRIGHT_INFO.targetAge} · 
          ${PEP3_COPYRIGHT_INFO.standardsReference}.
          <div style="margin-top:3px;font-size:10px;color:#1e3a8a;">
            ${PEP3_COPYRIGHT_INFO.notice}
          </div>
        </div>

        <!-- Student & Assessment Info Table -->
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:12px;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;"><b>تاريخ الميلاد:</b> ${assessment.dob || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;"><b>التشخيص:</b> ${assessment.diagnosis || '—'}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;"><b>المستجيب:</b> ${assessment.raterName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;"><b>الأخصائي الفاحص:</b> ${assessment.examinerName || '—'}</td>
          </tr>
        </table>

        <!-- Psychometric Dashboard -->
        <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 10px 0;color:#1e40af;font-size:15px;">📊 المؤشرات السيكومترية والسن النمائي لـ PEP-3</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:12px;">
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">السن النمائي المقدر</span>
              <span style="font-size:18px;font-weight:900;color:${psychometrics.severityColor};">${psychometrics.estimatedDevelopmentalAge}</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">الدرجة الخام الكلية</span>
              <span style="font-size:20px;font-weight:900;color:#1e40af;">${psychometrics.totalRawScore} <small style="font-size:11px;color:#64748b;">/ 100</small></span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">الرتبة المئينية</span>
              <span style="font-size:20px;font-weight:900;color:#2563eb;">${psychometrics.percentile}%</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">التقدير النمائي</span>
              <span style="font-size:13px;font-weight:bold;color:${psychometrics.severityColor};display:block;margin-top:4px;">${psychometrics.overallLevel}</span>
            </div>
          </div>
        </div>

        <!-- Subscales Results Table -->
        <h3 style="color:#1e40af;font-size:15px;margin:16px 0 8px 0;">📈 نتائج المقاييس الفرعية النمائية:</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px;text-align:right;">المجال النمائي</th>
              <th style="padding:8px;text-align:center;">الدرجة الخام</th>
              <th style="padding:8px;text-align:center;">الدرجة المعيارية (T-Score)</th>
              <th style="padding:8px;text-align:center;">المستوى النمائي</th>
            </tr>
          </thead>
          <tbody>
            ${subscaleHtml}
          </tbody>
        </table>

        <!-- Clinical Narrative -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;">
          <h4 style="margin:0 0 6px 0;color:#1e40af;font-size:13px;">📝 التحليل النمائي والخلاصة الإكلينيكية:</h4>
          <p style="margin:0;font-size:12px;line-height:1.6;white-space:pre-line;">${assessment.clinicalSummary || psychometrics.interpretation}</p>
        </div>

        <!-- Recommendations -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h4 style="margin:0 0 6px 0;color:#047857;font-size:13px;">🎯 التوصيات التربوية وأولويات الخطة الفردية (IEP):</h4>
          <p style="margin:0;font-size:12px;line-height:1.6;white-space:pre-line;">${assessment.recommendations || 'يوصى باستهداف مهارات البزوغ (Emerging) لردم الفجوة النمائية وبناء خطة دعم فردية.'}</p>
        </div>

        <!-- Items Table -->
        <h3 style="color:#1e40af;font-size:14px;margin:16px 0 8px 0;">📋 تفريغ استجابات بنود المقياس الـ 50:</h3>
        <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:20px;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:6px;width:30px;text-align:center;">#</th>
              <th style="padding:6px;text-align:right;">نص البند والمهارة</th>
              <th style="padding:6px;width:100px;text-align:center;">المجال</th>
              <th style="padding:6px;width:110px;text-align:center;">الاستجابة</th>
              <th style="padding:6px;width:120px;text-align:right;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signatures -->
        <div style="display:flex;justify-content:space-between;margin-top:30px;padding-top:14px;border-top:1px dashed #cbd5e1;font-size:12px;">
          <div style="text-align:center;width:200px;">
            <b>الأخصائي الفاحص</b>
            <div style="margin-top:24px;border-bottom:1px solid #000;width:140px;margin-inline:auto;"></div>
            <div style="margin-top:4px;">${assessment.examinerName || '....................'}</div>
          </div>
          <div style="text-align:center;width:200px;">
            <b>المشرف الفني / مدير المركز</b>
            <div style="margin-top:24px;border-bottom:1px solid #000;width:140px;margin-inline:auto;"></div>
            <div style="margin-top:4px;">الختم والتوقيع المعتمد</div>
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
          <title>تقرير بيب-3 (PEP-3) — ${assessment.studentName || 'طالب'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
          <style>
            body { font-family: 'Tajawal', sans-serif; margin: 0; padding: 0; background: #fff; }
            @media print {
              @page { margin: 12mm; size: A4; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWin.document.close();
    }
  }

  function handleShareWhatsApp() {
    const text = `*📋 تقرير ملف التقييم النفسي التربوي للتوحد (PEP-3)*
*اسم المفحوص:* ${assessment.studentName || '—'}
*العمر الزمني:* ${assessment.age || '—'}
*تاريخ التقييم:* ${assessment.date || '—'}

*📊 المؤشرات السيكومترية والسن النمائي:*
• السن النمائي المقدر: *${psychometrics.estimatedDevelopmentalAge}*
• مجموع الدرجة الخام: *${psychometrics.totalRawScore} / 100*
• الرتبة المئينية الكلية: *${psychometrics.percentile}%*
• التقدير العام: *${psychometrics.overallLevel}*
• توزيع المهارات: *${psychometrics.passCount} منجز | ${psychometrics.emergingCount} بزوغ | ${psychometrics.failCount} إخفاق*

*المقاييس الفرعية لـ PEP-3:*
${psychometrics.subscales.map(s => `• ${s.name}: ${s.raw}/${s.maxRaw} (${s.tScore} T) - [${s.level}]`).join('\n')}

*الخلاصة الإكلينيكية:*
${assessment.clinicalSummary || psychometrics.interpretation}

*صادر من:* ${center?.name || 'مركز رعاية وتأهيل التوحد'}`;

    sendReportToWhatsApp(text);
  }

  return (
    <>
      <div
        className="modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 12,
        }}
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="modal-box"
          style={{
            background: 'var(--bg-card, #ffffff)',
            color: 'var(--text-main, #1e293b)',
            width: '100%',
            maxWidth: 'min(1360px, calc(100vw - 24px))',
            maxHeight: 'min(94vh, calc(100dvh - 20px))',
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--border-color, #e2e8f0)',
          }}
        >
          {/* Header */}
          <div
            className="modal-header"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
              color: '#ffffff',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.6rem' }}>📊</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  تقرير ملف التقييم النفسي التربوي للتوحد (PEP-3) المقنن
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', opacity: 0.9 }}>
                  تقرير السن النمائي الشامل ومستويات الأداء الحالي والخطة التربوية الفردية
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(assessment);
                  }}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '5px 12px',
                    borderRadius: 8,
                  }}
                >
                  ✏️ تعديل التقييم
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-sm"
                style={{
                  background: '#ffffff',
                  color: '#1e40af',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  padding: '5px 14px',
                  borderRadius: 8,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                🖨️ طباعة التقرير الرسمي
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="btn btn-sm"
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '5px 12px',
                  borderRadius: 8,
                }}
              >
                📲 مشاركة واتساب
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: 'none',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
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
          </div>

          {/* Scrollable Content */}
          <div className="modal-body-scroll" style={{ padding: '18px 20px', flex: 1, overflowY: 'auto' }}>
            
            {/* Copyright Box */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: '0.8rem',
                color: '#1e40af',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <div>
                  <strong>⚖️ حقوق الملكية الفكرية والأمانة العلمية:</strong> {PEP3_COPYRIGHT_INFO.scaleNameAr} · 
                  المؤلف الأصلي: <b>{PEP3_COPYRIGHT_INFO.authorAr}</b> · 
                  دار النشر: <b>{PEP3_COPYRIGHT_INFO.publisherAr}</b> · 
                  {PEP3_COPYRIGHT_INFO.standardsReference}.
                </div>
                <span style={{ fontSize: '0.7rem', background: '#dbeafe', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                  مرجع معتمد دولياً
                </span>
              </div>
            </div>

            {/* Student Info Bar */}
            <div
              style={{
                background: 'var(--g0, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 10,
                fontSize: '0.85rem',
              }}
            >
              <div><b>اسم المفحوص:</b> {assessment.studentName || '—'}</div>
              <div><b>العمر الزمني:</b> {assessment.age || '—'}</div>
              <div><b>تاريخ التقييم:</b> {assessment.date || '—'}</div>
              <div><b>التشخيص:</b> {assessment.diagnosis || '—'}</div>
              <div><b>الأخصائي الفاحص:</b> {assessment.examinerName || '—'}</div>
              <div><b>المستجيب:</b> {assessment.raterName || '—'} ({assessment.raterRelation || '—'})</div>
            </div>

            {/* Real-time Psychometrics Dashboard */}
            <div
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                border: '1.5px solid #bfdbfe',
                borderRadius: 12,
                padding: '16px',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem', fontWeight: 800 }}>
                  📊 المؤشرات السيكومترية الشاملة ومستوى النمو (PEP-3 Dashboard)
                </h4>
                <span className="bdg b-bl" style={{ fontSize: '0.75rem' }}>
                  TEACCH Developmental Standard
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {/* Developmental Age Equivalent */}
                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 10, border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub, #64748b)', display: 'block' }}>السن النمائي المقدر الشامل</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.severityColor, display: 'block', margin: '4px 0' }}>
                    {psychometrics.estimatedDevelopmentalAge}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-sub, #64748b)' }}>
                    الرتبة المئينية: <b>{psychometrics.percentile}%</b>
                  </span>
                </div>

                {/* Total Raw Score */}
                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 10, border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub, #64748b)', display: 'block' }}>الدرجة الخام الكلية</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e40af', display: 'block', margin: '4px 0' }}>
                    {psychometrics.totalRawScore} <small style={{ fontSize: '0.8rem', color: 'var(--text-sub, #64748b)' }}>/ 100</small>
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-sub, #64748b)' }}>
                    نسبة الإنجاز: <b>{psychometrics.completionPercentage}%</b>
                  </span>
                </div>

                {/* Skills State Breakdown */}
                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 10, border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub, #64748b)', display: 'block' }}>توزيع حالة المهارات</span>
                  <div style={{ display: 'flex', justifyContent: 'space-around', margin: '6px 0', fontSize: '0.82rem', fontWeight: 800 }}>
                    <span style={{ color: '#16a34a' }}>منجز: {psychometrics.passCount}</span>
                    <span style={{ color: '#ca8a04' }}>بزوغ: {psychometrics.emergingCount}</span>
                    <span style={{ color: '#dc2626' }}>إخفاق: {psychometrics.failCount}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700 }}>
                    ✨ {psychometrics.emergingCount} مهارة بزوغ كأهداف رئيسية للخطة
                  </span>
                </div>

                {/* Diagnostic Level */}
                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 10, border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub, #64748b)', display: 'block' }}>المستوى والتقدير النمائي</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: psychometrics.severityColor, display: 'block', margin: '6px 0' }}>
                    {psychometrics.overallLevel}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-sub, #64748b)' }}>
                    {psychometrics.isComplete ? 'تقييم كامل وشامل' : `مكتمل (${psychometrics.totalAnswered}/50)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscales Results Table */}
            <div
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 10,
                overflow: 'hidden',
                marginBottom: 18,
              }}
            >
              <div style={{ padding: '12px 16px', background: 'var(--g0, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>📈 نتائج المقاييس الفرعية لـ PEP-3 (Subscales Psychometrics)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub, #64748b)' }}>8 مقاييس نمائية وتكيفية</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--g0, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)', color: 'var(--text-sub, #64748b)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>المجال النمائي</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>الدرجة الخام</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>الدرجة المعيارية (T-Score)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>المهارات (منجز / بزوغ / إخفاق)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>المستوى والأداء</th>
                  </tr>
                </thead>
                <tbody>
                  {psychometrics.subscales.map(s => {
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: s.color }}>
                            {s.name} ({s.code})
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-sub, #64748b)' }}>
                            {s.description}
                          </div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>
                          {s.raw} / {s.maxRaw}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', color: s.color }}>
                          {s.tScore} T
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontSize: '0.78rem' }}>
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>{s.domPass}P</span> · 
                          <span style={{ color: '#ca8a04', fontWeight: 700, marginInline: 4 }}>{s.domEmerging}E</span> · 
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>{s.domFail}F</span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span
                            className={`bdg ${
                              s.severityKey === 'normal' ? 'b-gr' : s.severityKey === 'mild' ? 'b-bl' : s.severityKey === 'moderate' ? 'b-or' : 'b-rd'
                            }`}
                            style={{ fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            {s.level}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Clinical Summary & Narrative */}
            <div
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 18,
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '0.92rem', fontWeight: 800 }}>
                📝 التفسير النمائي والتحليل الإكلينيكي:
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-main, #1e293b)', whiteSpace: 'pre-line' }}>
                {assessment.clinicalSummary || psychometrics.interpretation}
              </p>
            </div>

            {/* IEP Recommendations & Bridge Section */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1.5px solid #a7f3d0',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <h4 style={{ margin: 0, color: '#047857', fontSize: '0.92rem', fontWeight: 800 }}>
                  🎯 التوصيات التربوية وأولويات الخطة التربوية الفردية (IEP):
                </h4>
                <button
                  type="button"
                  onClick={() => setBridgeOpen(true)}
                  className="btn btn-sm"
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '5px 12px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>🔗 نقل وتوليد الأهداف لخطة IEP</span>
                  <span style={{ background: '#047857', padding: '1px 6px', borderRadius: 10, fontSize: '0.7rem' }}>
                    {recommendedGoals.length}
                  </span>
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6, color: '#065f46', whiteSpace: 'pre-line' }}>
                {assessment.recommendations || 'يوصى بالتركيز على مهارات البزوغ كأهداف رئيسية قابلة للقياس، مع تطبيق الدعم البصري واستراتيجيات تيتش.'}
              </p>
            </div>

            {/* Detailed Items Evaluation Breakdown */}
            <div
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 10,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--g0, #f8fafc)',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>📋 تفريغ بنود مقياس PEP-3 والاستجابات:</span>
                
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="inp"
                    placeholder="بحث في البنود..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ fontSize: '0.75rem', padding: '3px 8px', width: 160 }}
                  />

                  <select
                    className="inp"
                    value={activeItemFilter}
                    onChange={e => setActiveItemFilter(e.target.value)}
                    style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  >
                    <option value="all">جميع المقاييس (50 بنداً)</option>
                    {PEP3_DOMAINS.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--g0, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)', color: 'var(--text-sub, #64748b)' }}>
                    <th style={{ width: 40, padding: '8px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>نص المهارة / السلوك</th>
                    <th style={{ width: 140, padding: '8px', textAlign: 'center' }}>المجال</th>
                    <th style={{ width: 130, padding: '8px', textAlign: 'center' }}>الدرجة والاستجابة</th>
                    <th style={{ width: 160, padding: '8px 12px', textAlign: 'right' }}>ملاحظات نوعية</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItemsList.map((it, idx) => {
                    const score = assessment.results?.[it.id] !== undefined && assessment.results?.[it.id] !== null
                      ? Number(assessment.results[it.id])
                      : (assessment.scores?.[it.id] !== undefined ? Number(assessment.scores[it.id]) : null);
                    const note = assessment.itemNotes?.[it.id] || '';
                    const domMeta = PEP3_DOMAINS.find(d => d.id === it.domainId);
                    const isEmerging = score === 1;
                    const isFail = score === 0;

                    return (
                      <tr
                        key={it.id}
                        style={{
                          borderBottom: '1px solid var(--border-color, #e2e8f0)',
                          background: isEmerging
                            ? 'rgba(254, 249, 195, 0.45)'
                            : isFail
                            ? 'rgba(254, 226, 226, 0.35)'
                            : score === 2
                            ? 'rgba(220, 252, 231, 0.25)'
                            : 'transparent',
                        }}
                      >
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sub, #64748b)' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                          {it.text}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: domMeta?.color, fontWeight: 700 }}>
                            {domMeta?.name.split(' ')[0]}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800 }}>
                          {score === 2 ? (
                            <span style={{ color: '#16a34a' }}>منجز (Pass)</span>
                          ) : score === 1 ? (
                            <span style={{ color: '#ca8a04' }}>بزوغ (Emerging)</span>
                          ) : score === 0 ? (
                            <span style={{ color: '#dc2626' }}>إخفاق (Fail)</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-sub, #64748b)' }}>
                          {note || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div
            className="modal-footer"
            style={{
              background: 'var(--g0, #f8fafc)',
              padding: '12px 20px',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color, #cbd5e1)',
                color: 'var(--text-main, #334155)',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '6px 14px',
                borderRadius: 8,
              }}
            >
              إغلاق
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setBridgeOpen(true)}
                className="btn"
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '6px 14px',
                  borderRadius: 8,
                }}
              >
                🔗 جسر أهداف IEP ({recommendedGoals.length})
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  padding: '6px 18px',
                  borderRadius: 8,
                }}
              >
                🖨️ طباعة التقرير الشامل
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* IEP Bridge Modal */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          sourceAssessment={{
            ...assessment,
            scaleType: 'pep3',
            scaleName: 'ملف التقييم النفسي التربوي للتوحد (PEP-3)',
          }}
          recommendedGoals={recommendedGoals}
        />
      )}
    </>
  );
}
