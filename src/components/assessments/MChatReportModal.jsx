import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MCHAT_ITEMS,
  MCHAT_DOMAINS,
  MCHAT_COPYRIGHT_INFO,
  calculateMChatPsychometrics,
} from '../../data/mchatData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function MChatReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateMChatPsychometrics(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'mchat_r_f',
      assessment.results || assessment.scores || {},
      MCHAT_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const domainHtml = psychometrics.domainStats.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#1e40af;">
          ${d.name} (${d.code})
        </td>
        <td style="padding:8px 12px;text-align:center;">${d.totalItems}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#166534;">${d.passCount}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:${d.failCount > 0 ? '#dc2626' : '#166534'};">${d.failCount}</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          ${d.failCount === 0
            ? '<span style="color:#059669;font-weight:bold;">طبيعي (خطر معدوم)</span>'
            : d.failCount <= 2
            ? '<span style="color:#d97706;font-weight:bold;">خطر بسيط</span>'
            : '<span style="color:#dc2626;font-weight:bold;">خطر مرتفع</span>'}
        </td>
      </tr>
    `).join('');

    const itemsHtml = MCHAT_ITEMS.map(it => {
      const userVal = assessment.results?.[it.id] !== undefined ? String(assessment.results[it.id]).toUpperCase() : '';
      const isFail = userVal === it.failResponse;
      const note = assessment.itemNotes?.[it.id] || '';
      const domain = MCHAT_DOMAINS.find(d => d.id === it.domainId);

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${isFail ? '#fef2f2' : '#ffffff'};">
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:#64748b;">${it.code}</td>
          <td style="padding:6px 8px;font-weight:600;font-size:12px;">${it.text}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;">${domain?.name?.split(' ')[0] || ''}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:bold;">${userVal === 'YES' ? 'نعم' : userVal === 'NO' ? 'لا' : '—'}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:${isFail ? '#dc2626' : '#059669'};">
            ${userVal ? (isFail ? '⚠️ إخفاق (نقطة خطر)' : '✓ نجاح') : '—'}
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
            <h1 style="color:#1e40af;font-size:22px;margin:0 0 4px 0;">🧩 تقرير مسح وتقييم التوحد (M-CHAT-R/F)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">Modified Checklist for Autism in Toddlers, Revised with Follow-Up</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>المركز:</b> ${center?.name || 'مركز التربية الخاصة والتأهيل'}</div>
          </div>
        </div>

        <!-- COPYRIGHT & INTELLECTUAL PROPERTY BOX -->
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#1e40af;line-height:1.5;">
          <b>⚖️ إشعار حقوق الملكية الفكرية والأمانة العلمية:</b> ${MCHAT_COPYRIGHT_INFO.scaleTitleAr} · 
          إعداد: <b>${MCHAT_COPYRIGHT_INFO.authorsAr}</b> (${MCHAT_COPYRIGHT_INFO.authorsEn}) · 
          الناشر: <b>${MCHAT_COPYRIGHT_INFO.publisherAr}</b> · 
          ${MCHAT_COPYRIGHT_INFO.standardsReference}.
          <div style="margin-top:3px;font-size:10px;color:#1d4ed8;">
            ${MCHAT_COPYRIGHT_INFO.notice}
          </div>
        </div>

        <!-- Student & Assessment Info Table -->
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:12px;">
          <tr>
            <td style="padding:4px 8px;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:4px 8px;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:4px 8px;"><b>تاريخ الميلاد:</b> ${assessment.dob || '—'}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;"><b>الأخصائي الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '—'}</td>
            <td style="padding:4px 8px;"><b>المستجيب:</b> ${assessment.raterName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:4px 8px;"><b>الروضة/الحضانة:</b> ${assessment.school || '—'}</td>
          </tr>
        </table>

        <!-- Psychometric Dashboard -->
        <div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 10px 0;color:#1e40af;font-size:15px;">📊 نتيجة المسح وتصنيف الخطر (M-CHAT-R/F Dashboard)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:12px;">
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">نقاط الخطر (عدد الإخفاقات)</span>
              <span style="font-size:22px;font-weight:900;color:${psychometrics.riskColor};">${psychometrics.totalFailures} <small style="font-size:11px;color:#64748b;">/ 20</small></span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">مستوى الخطر الإكلينيكي</span>
              <span style="font-size:15px;font-weight:900;color:${psychometrics.riskColor};display:block;margin-top:4px;">${psychometrics.riskTitle}</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">نسبة اكتمال التقييم</span>
              <span style="font-size:22px;font-weight:900;color:#2563eb;">${psychometrics.completionPercentage}%</span>
            </div>
          </div>
        </div>

        <!-- Subscales Breakdown Table -->
        <h3 style="color:#1e40af;font-size:15px;margin:16px 0 8px 0;">📑 تفاصيل الإخفاقات والنجاح حسب المجالات النمائية</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px 12px;text-align:right;">المجال النمائي</th>
              <th style="padding:8px 12px;text-align:center;">عدد البنود</th>
              <th style="padding:8px 12px;text-align:center;">البنود الناجحة</th>
              <th style="padding:8px 12px;text-align:center;">نقاط الخطر (الإخفاق)</th>
              <th style="padding:8px 12px;text-align:center;">مستوى الخطر بالمجال</th>
            </tr>
          </thead>
          <tbody>
            ${domainHtml}
          </tbody>
        </table>

        <!-- Clinical Summary -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;font-size:12px;">
          <h4 style="margin:0 0 6px 0;color:#1e40af;">📝 الخلاصة والتشخيص الإكلينيكي:</h4>
          <p style="margin:0;white-space:pre-line;line-height:1.6;color:#334155;">${assessment.clinicalSummary || psychometrics.recommendationSummary}</p>
        </div>

        <!-- Recommendations -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;font-size:12px;">
          <h4 style="margin:0 0 6px 0;color:#1e40af;">💡 التوصيات والإجراءات التأهيلية:</h4>
          <p style="margin:0;white-space:pre-line;line-height:1.6;color:#334155;">${assessment.recommendations || 'ينصح ببدء المتابعة النمائية وإجراء التقييم التشخيصي الشامل.'}</p>
        </div>

        <!-- Full Items Table -->
        <h3 style="color:#1e40af;font-size:15px;margin:16px 0 8px 0;">📋 سجل استجابات جميع بنود المقياس الـ 20</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:11px;border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:6px 8px;width:40px;text-align:center;">الرمز</th>
              <th style="padding:6px 8px;text-align:right;">نص البند التشخيصي</th>
              <th style="padding:6px 8px;text-align:center;width:120px;">المجال</th>
              <th style="padding:6px 8px;text-align:center;width:70px;">الاستجابة</th>
              <th style="padding:6px 8px;text-align:center;width:90px;">الحالة</th>
              <th style="padding:6px 8px;text-align:right;width:150px;">الملاحظة الإكلينيكية</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signatures -->
        <div style="display:flex;justify-content:space-between;margin-top:30px;padding-top:14px;border-top:2px dashed #cbd5e1;font-size:12px;">
          <div>
            <b>الأخصائي الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '....................'}<br/>
            <b>التوقيع:</b> ....................
          </div>
          <div style="text-align:left;">
            <b>اعتماد إدارة المركز:</b> ....................<br/>
            <b>الختم الرسمي:</b>
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
          <meta charset="utf-8">
          <title>تقرير M-CHAT-R/F للتوحد - ${assessment.studentName || 'طالب'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 20px; background: #fff; font-family: 'Tajawal', sans-serif; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${html}
          <script>
            setTimeout(() => { window.print(); window.close(); }, 600);
          </script>
        </body>
        </html>
      `);
      printWin.document.close();
    }
  }

  function handleSendWhatsApp() {
    const text = `*📊 تقرير قائمة تفقد التوحد المعدلة (M-CHAT-R/F)*\n` +
      `*اسم الطالب:* ${assessment.studentName || '—'}\n` +
      `*التاريخ:* ${assessment.date || '—'}\n` +
      `*نقاط الخطر:* ${psychometrics.totalFailures} / 20\n` +
      `*مستوى الخطر:* ${psychometrics.riskTitle}\n\n` +
      `*التوصية الإكلينيكية:*\n${assessment.recommendations || psychometrics.recommendationSummary}`;

    sendReportToWhatsApp(text);
  }

  return (
    <div className="mbg">
      <div
        className="mb"
        style={{
          maxWidth: 'min(1100px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="fhd"
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.6rem' }}>🧩</span>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                تقرير تقييم M-CHAT-R/F — {assessment.studentName || 'طالب'}
              </h2>
              <span style={{ fontSize: '0.76rem', opacity: 0.9 }}>
                تاريخ التقييم: {assessment.date || '—'} · العمر: {assessment.age || '—'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => { onClose(); onEdit(assessment); }}
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700 }}
              >
                ✏️ تعديل
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setBridgeOpen(true)}
              style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 800, border: 'none' }}
            >
              🌉 أهداف IEP ({recommendedGoals.length})
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleSendWhatsApp}
              style={{ background: '#22c55e', color: '#fff', fontWeight: 700, border: 'none' }}
            >
              📱 واتساب
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handlePrint}
              style={{ background: '#fff', color: '#1e40af', fontWeight: 800, border: 'none' }}
            >
              🖨️ طباعة التقرير
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

        {/* Scrollable Report Content */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          
          {/* Copyright Header Notice */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: '#1e40af' }}>
            <strong>حقوق الملكية الفكرية والاعتماد العلمية:</strong> {MCHAT_COPYRIGHT_INFO.scaleTitleAr} — إعداد: <b>{MCHAT_COPYRIGHT_INFO.authorsAr}</b> ({MCHAT_COPYRIGHT_INFO.authorsEn}) · ناشر النسخة الأصلية: <b>{MCHAT_COPYRIGHT_INFO.publisherAr}</b>.
          </div>

          {/* Student Info Banner */}
          <div style={{ background: 'var(--g0)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: '0.84rem' }}>
            <div><b>المفحوص:</b> {assessment.studentName || '—'}</div>
            <div><b>العمر:</b> {assessment.age || '—'}</div>
            <div><b>تاريخ التقييم:</b> {assessment.date || '—'}</div>
            <div><b>الفاحص:</b> {assessment.examinerName || assessment.specialistName || '—'}</div>
            <div><b>المستجيب:</b> {assessment.raterName || '—'} ({assessment.raterRelation || '—'})</div>
            <div><b>الدار/الروضة:</b> {assessment.school || '—'}</div>
          </div>

          {/* Psychometrics Dashboard */}
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${psychometrics.riskColor}`, borderRadius: 12, padding: '16px', marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📊</span> نتيجة التقييم ومؤشر الخطر الإكلينيكي
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, textAlign: 'center' }}>
              <div style={{ background: 'var(--g0)', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>نقاط الخطر (عدد الإخفاقات)</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: psychometrics.riskColor }}>{psychometrics.totalFailures} / 20</span>
              </div>
              <div style={{ background: 'var(--g0)', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>تصنيف الخطر</span>
                <span className={`bdg ${psychometrics.riskBadgeClass}`} style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: 4, display: 'inline-block' }}>
                  {psychometrics.riskTitle}
                </span>
              </div>
              <div style={{ background: 'var(--g0)', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>نسبة المكتمل</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>{psychometrics.completionPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Domain Breakdown Table */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 10px 0', color: '#1e40af' }}>
              📑 الأداء التفصيلي بالمجالات النمائية الـ 3
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                    <th style={{ padding: '8px 12px' }}>المجال</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>إجمالي البنود</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>الناجحة</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>الإخفاق (الخطر)</th>
                  </tr>
                </thead>
                <tbody>
                  {psychometrics.domainStats.map(dom => (
                    <tr key={dom.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e40af' }}>{dom.name} ({dom.code})</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{dom.totalItems}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#166534' }}>{dom.passCount}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: dom.failCount > 0 ? '#dc2626' : '#166534' }}>{dom.failCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Summary & Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 800, color: '#1e40af' }}>📝 الخلاصة والتشخيص الإكلينيكي:</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: 'var(--text-main)' }}>
                {assessment.clinicalSummary || psychometrics.recommendationSummary}
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 800, color: '#1e40af' }}>💡 التوصيات والإجراءات التأهيلية:</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: 'var(--text-main)' }}>
                {assessment.recommendations || 'المتابعة النمائية الدورية وإجراء الفحوصات التخصصية عند الحاجة.'}
              </p>
            </div>
          </div>

          {/* Detailed Items Table */}
          <div>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 10px 0', color: '#1e40af' }}>
              📋 تفاصيل استجابات البنود الـ 20
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                    <th style={{ padding: '8px', textAlign: 'center', width: 40 }}>#</th>
                    <th style={{ padding: '8px' }}>البند</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: 80 }}>الاستجابة</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: 100 }}>الحالة الإكلينيكية</th>
                    <th style={{ padding: '8px' }}>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {MCHAT_ITEMS.map(it => {
                    const userVal = assessment.results?.[it.id] !== undefined ? String(assessment.results[it.id]).toUpperCase() : '';
                    const isFail = userVal === it.failResponse;
                    const note = assessment.itemNotes?.[it.id] || '';

                    return (
                      <tr key={it.id} style={{ borderBottom: '1px solid var(--border-color)', background: isFail ? '#fef2f2' : 'transparent' }}>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sub)' }}>{it.code}</td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{it.text}</td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{userVal === 'YES' ? 'نعم' : userVal === 'NO' ? 'لا' : '—'}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          {userVal ? (
                            <span className={`bdg ${isFail ? 'b-rd' : 'b-gr'}`} style={{ fontSize: '0.7rem' }}>
                              {isFail ? '⚠️ إخفاق' : '✓ نجاح'}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '8px', color: 'var(--text-sub)', fontSize: '0.76rem' }}>{note || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* IEP Bridge Modal for M-CHAT-R/F */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          studentName={assessment.studentName}
          scaleName="قائمة تفقد التوحد المعدلة للأطفال الصغار (M-CHAT-R/F)"
          scaleKey="mchat_r_f"
          recommendedGoals={recommendedGoals}
          scaleItems={MCHAT_ITEMS}
          scaleResults={assessment.results || assessment.scores || {}}
        />
      )}
    </div>
  );
}
