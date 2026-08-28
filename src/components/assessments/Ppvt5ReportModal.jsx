import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PPVT5_ITEMS,
  PPVT5_SET_METADATA,
  PPVT5_COPYRIGHT_INFO,
  calculatePPVT5Psychometrics,
} from '../../data/ppvt5Data';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';
import { calcAge } from '../../utils/dateHelpers';

export default function Ppvt5ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const studentAgeMonths = useMemo(() => {
    if (!assessment) return 72;
    if (assessment.dob) {
      const ageObj = calcAge(assessment.dob);
      return Math.max(30, ageObj.years * 12 + ageObj.months);
    }
    return 72;
  }, [assessment]);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    const scoresMap = assessment.scores || assessment.results || {};
    return calculatePPVT5Psychometrics(scoresMap, studentAgeMonths);
  }, [assessment, studentAgeMonths]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'ppvt_5',
      assessment.scores || assessment.results || {},
      PPVT5_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const setRowsHtml = psychometrics.setResults.map(s => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#0f766e;">
          ${s.name}
          <div style="font-size:11px;color:#64748b;font-weight:normal;">المرحلة النمائية: ${s.ageRange}</div>
        </td>
        <td style="padding:8px 12px;text-align:center;">${s.correctCount} / ${s.itemsCount}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:${s.percentage >= 75 ? '#059669' : s.percentage >= 50 ? '#d97706' : '#dc2626'};">${s.percentage}%</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          ${s.isBasal ? '<span style="color:#059669;font-weight:bold;">خط قاعدي (Basal) ✓</span>' : s.isCeiling ? '<span style="color:#dc2626;font-weight:bold;">سقف التوقف (Ceiling) ⚠️</span>' : '—'}
        </td>
      </tr>
    `).join('');

    const catRowsHtml = psychometrics.categoryResults.map(c => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;">${c.name}</td>
        <td style="padding:8px 12px;text-align:center;">${c.correctCount} / ${c.answeredCount || c.totalItems}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:${c.color};">${c.percentage}%</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;font-weight:bold;color:${c.color};">${c.status}</td>
      </tr>
    `).join('');

    const itemsHtml = PPVT5_ITEMS.map(it => {
      const resp = assessment.scores?.[it.id] !== undefined ? assessment.scores[it.id] : assessment.results?.[it.id];
      const isCorrect = resp === 1 || resp === true || resp === '1';
      const isFailed = resp === 0 || resp === false || resp === '0';
      const note = assessment.itemNotes?.[it.id] || '';

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${isFailed ? '#fff1f2' : isCorrect ? '#ffffff' : '#f8fafc'};">
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:#64748b;">${it.id}</td>
          <td style="padding:6px 8px;font-weight:bold;font-size:12px;color:#115e59;">${it.word}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;">المجموعة ${it.setId}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;">${it.type}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:${isCorrect ? '#059669' : isFailed ? '#dc2626' : '#94a3b8'};">
            ${isCorrect ? '1 (صحيح)' : isFailed ? '0 (خطأ)' : '—'}
          </td>
          <td style="padding:6px 8px;font-size:11px;color:#64748b;">${note || '—'}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:12px;max-width:900px;margin:auto;">
        <!-- Header -->
        <div style="border-bottom:3px solid #0d9488;padding-bottom:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#0f766e;font-size:22px;margin:0 0 4px 0;">📚 تقرير تقييم المفردات اللغوية المصورة (PPVT-5)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">Peabody Picture Vocabulary Test (5th Ed) — مقياس بيبودي المقنن للمفردات الاستقبالية</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>المركز:</b> ${center?.name || 'مركز التربية الخاصة والتأهيل والتخاطب'}</div>
          </div>
        </div>

        <!-- COPYRIGHT & INTELLECTUAL PROPERTY BOX -->
        <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#115e59;line-height:1.5;">
          <b>⚖️ إشعار حقوق الملكية الفكرية والأمانة العلمية:</b> مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5) · 
          إعداد: <b>${PPVT5_COPYRIGHT_INFO.authorAr}</b> (${PPVT5_COPYRIGHT_INFO.authorEn}) · 
          الناشر: <b>${PPVT5_COPYRIGHT_INFO.publisherAr}</b> · 
          التقنين: ${PPVT5_COPYRIGHT_INFO.adaptationAr} · 
          ${PPVT5_COPYRIGHT_INFO.standardsReference}.
        </div>

        <!-- Student & Assessment Info Table -->
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:12px;">
          <tr>
            <td style="padding:4px 8px;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:4px 8px;"><b>العمر الزمني:</b> ${psychometrics.ageLabel || assessment.age || '—'}</td>
            <td style="padding:4px 8px;"><b>الصف الدراسي:</b> ${assessment.grade || '—'}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;"><b>أخصائي التخاطب:</b> ${assessment.examinerName || assessment.specialistName || '—'}</td>
            <td style="padding:4px 8px;"><b>المرافق / المستجيب:</b> ${assessment.raterName || assessment.informantName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:4px 8px;"><b>التشخيص:</b> ${assessment.diagnosis || '—'}</td>
          </tr>
        </table>

        <!-- Psychometric Dashboard -->
        <div style="background:#f0fdfa;border:1.5px solid #5eead4;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 10px 0;color:#0f766e;font-size:15px;">📊 المؤشرات السيكومترية للحصيلة اللفظية (PPVT-5 Dashboard)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:12px;">
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #99f6e4;">
              <span style="color:#64748b;display:block;font-size:11px;">الدرجة المعيارية (SS)</span>
              <span style="font-size:22px;font-weight:900;color:${psychometrics.severityColor};">${psychometrics.standardScore}</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #99f6e4;">
              <span style="color:#64748b;display:block;font-size:11px;">الرتبة المئينية (PR)</span>
              <span style="font-size:22px;font-weight:900;color:#0f766e;">${psychometrics.percentile}%</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #99f6e4;">
              <span style="color:#64748b;display:block;font-size:11px;">الدرجة الخام (Raw)</span>
              <span style="font-size:22px;font-weight:900;color:#0284c7;">${psychometrics.rawScore} <small style="font-size:11px;color:#64748b;">/ 96</small></span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #99f6e4;">
              <span style="color:#64748b;display:block;font-size:11px;">العمر اللغوي المكافئ (AE)</span>
              <span style="font-size:14px;font-weight:bold;color:#b45309;display:block;margin-top:4px;">${psychometrics.ageEquivalentLabel}</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #99f6e4;">
              <span style="color:#64748b;display:block;font-size:11px;">التشخيص والتصنيف</span>
              <span style="font-size:12px;font-weight:bold;color:${psychometrics.severityColor};display:block;margin-top:4px;">${psychometrics.level}</span>
            </div>
          </div>
        </div>

        <!-- Sets Breakdown Table -->
        <h3 style="color:#0f766e;font-size:15px;margin:16px 0 8px 0;">📑 الأداء على المجموعات النمائية المتدرجة (8 مجموعات)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px 12px;text-align:right;">المجموعة النمائية</th>
              <th style="padding:8px 12px;text-align:center;">الإتقان (الصحيح)</th>
              <th style="padding:8px 12px;text-align:center;">نسبة الإنجاز</th>
              <th style="padding:8px 12px;text-align:center;">حالة القياس (قاعدي / سقف)</th>
            </tr>
          </thead>
          <tbody>
            ${setRowsHtml}
          </tbody>
        </table>

        <!-- Lexical Categories Table -->
        <h3 style="color:#0f766e;font-size:15px;margin:16px 0 8px 0;">🏷️ التحليل الدلالي لمجموعات المفردات (Lexical Domains)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px 12px;text-align:right;">نوع المفردة</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة</th>
              <th style="padding:8px 12px;text-align:center;">نسبة الإتقان</th>
              <th style="padding:8px 12px;text-align:center;">التقييم الدلالي</th>
            </tr>
          </thead>
          <tbody>
            ${catRowsHtml}
          </tbody>
        </table>

        <!-- Clinical Summary -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;">
          <h4 style="margin:0 0 6px 0;color:#0f766e;font-size:14px;">📝 الخلاصة التشخيصية والوصف النفسي اللغوي:</h4>
          <p style="margin:0;font-size:12px;line-height:1.6;white-space:pre-wrap;color:#334155;">${assessment.clinicalSummary || assessment.summary || assessment.resultNote || 'لم يتم تسجيل خلاصة.'}</p>
        </div>

        <!-- IEP Recommendations -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:20px;">
          <h4 style="margin:0 0 6px 0;color:#15803d;font-size:14px;">🎯 توصيات الخطة التربوية الفردية (IEP) وجلسات التخاطب:</h4>
          <p style="margin:0;font-size:12px;line-height:1.6;white-space:pre-wrap;color:#166534;">${assessment.recommendations || 'لم يتم تسجيل توصيات محددة.'}</p>
        </div>

        <!-- Items Table -->
        <h4 style="color:#475569;font-size:13px;margin:16px 0 6px 0;">📋 سجل استجابات المفردات التفصيلية (96 مفردة):</h4>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:11px;border:1px solid #e2e8f0;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:1.5px solid #cbd5e1;">
              <th style="padding:6px;width:30px;">#</th>
              <th style="padding:6px;text-align:right;">المفردة المستهدفة</th>
              <th style="padding:6px;width:80px;text-align:center;">المجموعة</th>
              <th style="padding:6px;width:70px;text-align:center;">النوع</th>
              <th style="padding:6px;width:90px;text-align:center;">الاستجابة</th>
              <th style="padding:6px;text-align:right;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signatures Footer -->
        <div style="margin-top:24px;display:flex;justify-content:space-between;border-top:1px solid #cbd5e1;padding-top:14px;font-size:12px;color:#475569;">
          <div><b>أخصائي التخاطب الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '—'}<br/><br/>التوقيع: ..........................</div>
          <div><b>المرافق / المستجيب:</b> ${assessment.raterName || assessment.informantName || '—'}<br/><br/>التوقيع: ..........................</div>
          <div><b>المشرف الفني / مدير المركز:</b><br/><br/>الختم والتوقيع: ..........................</div>
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
          <title>تقرير بيبودي PPVT-5 للمفردات - ${assessment.studentName || 'طالب'}</title>
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
    const text = `*📊 تقرير مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)*\n` +
      `*اسم المفحوص:* ${assessment.studentName || '—'}\n` +
      `*تاريخ التقييم:* ${assessment.date || '—'}\n` +
      `*الدرجة المعيارية (SS):* ${psychometrics.standardScore} (رتبة مئينية: ${psychometrics.percentile}%)\n` +
      `*الدرجة الخام:* ${psychometrics.rawScore} / 96\n` +
      `*العمر اللغوي المكافئ:* ${psychometrics.ageEquivalentLabel}\n` +
      `*التشخيص والتصنيف:* ${psychometrics.level}\n` +
      `*أخصائي التخاطب:* ${assessment.examinerName || assessment.specialistName || '—'}\n\n` +
      `*الخلاصة والتوصيات:*\n${assessment.recommendations || 'متابعة جلسات التأهيل اللغوي والتخاطب.'}\n\n` +
      `_تم استخراج التقرير بواسطة نظام مركز التربية الخاصة والتأهيل._`;

    sendReportToWhatsApp(assessment.phone || '', text);
  }

  return (
    <>
      <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="mb mb-xl">
          
          {/* Modal Top Banner */}
          <div
            className="fhd modal-header-custom"
            style={{
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              color: '#fff',
              flexShrink: 0,
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  📊 تقرير تشخيص المفردات اللغوية (PPVT-5)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  {assessment.studentName} · {assessment.date}
                </span>
                <span className="bdg" style={{ background: '#134e4a', color: '#ccfbf1', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Pearson / Dr. Douglas Dunn & Dr. Lloyd Dunn
                </span>
              </div>
              <span style={{ fontSize: '0.76rem', opacity: 0.95, display: 'block', marginTop: 2 }}>
                Peabody Picture Vocabulary Test (5th Ed) — التقرير السيكومتري والتوصيات العلاجية لخطة الـ IEP
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
                <strong>حقوق الملكية الفكرية:</strong> مقياس بيبودي للمفردات المصورة (PPVT-5) — إعداد: <b>{PPVT5_COPYRIGHT_INFO.authorAr}</b> ({PPVT5_COPYRIGHT_INFO.authorEn}) · ناشر النسخة الأصلية: <b>{PPVT5_COPYRIGHT_INFO.publisherAr}</b>.
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', background: '#ccfbf1', padding: '2px 8px', borderRadius: 4, border: '1px solid #5eead4', fontWeight: 700 }}>
              النسخة المقننة للتربية الخاصة والتخاطب
            </span>
          </div>

          {/* Scrollable Report Body */}
          <div className="modal-body-scroll" style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
            
            {/* Student & Examiner Quick Profile */}
            <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 12, marginBottom: 16, border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '0.82rem' }}>
                <div><strong>اسم المفحوص:</strong> {assessment.studentName || '—'}</div>
                <div><strong>العمر الزمني:</strong> {psychometrics.ageLabel || assessment.age || '—'}</div>
                <div><strong>الصف الدراسي:</strong> {assessment.grade || '—'}</div>
                <div><strong>تاريخ التقييم:</strong> {assessment.date || '—'}</div>
                <div><strong>أخصائي التخاطب:</strong> {assessment.examinerName || assessment.specialistName || '—'}</div>
                <div><strong>المرافق / المستجيب:</strong> {assessment.raterName || assessment.informantName || '—'} ({assessment.raterRelation || '—'})</div>
              </div>
            </div>

            {/* Diagnostic Dashboard Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
              {/* Standard Score Tile */}
              <div style={{ background: '#f0fdfa', border: '1.5px solid #5eead4', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#115e59', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  الدرجة المعيارية (Standard Score)
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: psychometrics.severityColor }}>
                  {psychometrics.standardScore}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#134e4a', display: 'block', marginTop: 2 }}>
                  المتوسط المعياري: 100 · الانحراف: ±15
                </span>
              </div>

              {/* Percentile Rank Tile */}
              <div style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  الرتبة المئينية (Percentile Rank)
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0284c7' }}>
                  {psychometrics.percentile}%
                </span>
                <span style={{ fontSize: '0.74rem', color: '#1e3a8a', display: 'block', marginTop: 2 }}>
                  تتفوق لغته على {psychometrics.percentile}% من أقرانه
                </span>
              </div>

              {/* Raw Score */}
              <div style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  الدرجة الخام المحققة (Raw Score)
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#7c3aed' }}>
                  {psychometrics.rawScore}
                  <small style={{ fontSize: '0.85rem', color: '#6d28d9' }}> / 96</small>
                </span>
                <span style={{ fontSize: '0.74rem', color: '#5b21b6', display: 'block', marginTop: 2 }}>
                  سقف: مجموعة {psychometrics.ceilingSetId} | أخطاء: {psychometrics.totalErrors}
                </span>
              </div>

              {/* Age Equivalent Tile */}
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  العمر اللغوي المكافئ (AE)
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#b45309', display: 'block', marginTop: 6 }}>
                  {psychometrics.ageEquivalentLabel}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#78350f', display: 'block', marginTop: 4 }}>
                  {psychometrics.ageDiffMonths > 0 ? `تأخر قدره ${psychometrics.ageDiffMonths} شهراً` : 'متطابق/متقدم نمائياً'}
                </span>
              </div>

              {/* Diagnosis Classification Tile */}
              <div style={{ background: 'var(--g0)', border: `1.5px solid ${psychometrics.severityColor}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  التشخيص الإكلينيكي
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: psychometrics.severityColor, display: 'block', marginTop: 6 }}>
                  {psychometrics.level.split(' (')[0]}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', marginTop: 4 }}>
                  {psychometrics.level.includes('(') ? psychometrics.level.split('(')[1].replace(')', '') : ''}
                </span>
              </div>
            </div>

            {/* Subscales / Sets Psychometric Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ padding: '12px 16px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f766e' }}>
                  📑 النتائج على المجموعات النمائية المتدرجة (Sets Analysis):
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  قاعدة الاختبار (خطأ 0-1) · سقف التوقف (6 أخطاء في المجموعة)
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                      <th style={{ padding: '8px 14px' }}>المجموعة النمائية</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الفئة العمرية</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>عدد المفردات</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الإتقان (الصحيح)</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>نسبة الإنجاز</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psychometrics.setResults.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: s.color }}>
                          <span style={{ marginRight: 6 }}>{s.icon}</span> {s.name} ({s.code})
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span className="bdg b-gr" style={{ fontSize: '0.72rem' }}>
                            {s.ageRange}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          {s.itemsCount} مفردة
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 900, color: s.color, fontSize: '0.95rem' }}>
                          {s.correctCount} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>/ {s.itemsCount}</small>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>
                          {s.percentage}%
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          {s.isBasal ? (
                            <span className="bdg b-gr" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                              خط قاعدي (Basal) ✓
                            </span>
                          ) : s.isCeiling ? (
                            <span className="bdg b-rd" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                              سقف التوقف (Ceiling) ⚠️
                            </span>
                          ) : s.answeredCount > 0 ? (
                            <span className="bdg b-bl" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                              تم التطبيق
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-sub)', fontSize: '0.74rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lexical Categories Breakdown */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ padding: '12px 16px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f766e' }}>
                  🏷️ التحليل الدلالي لمجموعات المفردات (Lexical Categories):
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                      <th style={{ padding: '8px 14px' }}>تصنيف المفردة</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>إجمالي المفردات</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>المفردات الصحيحة</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>نسبة الإتقان</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center' }}>التقييم الدلالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psychometrics.categoryResults.map(c => (
                      <tr key={c.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                          {c.name}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          {c.totalItems}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: c.color }}>
                          {c.correctCount} / {c.answeredCount || c.totalItems}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>
                          {c.percentage}%
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 800, color: c.color, fontSize: '0.78rem' }}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Narrative Clinical Summary */}
            <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f766e', marginBottom: 6 }}>
                📝 الخلاصة التشخيصية والوصف النفسي اللغوي:
              </div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                {assessment.clinicalSummary || assessment.summary || assessment.resultNote || 'لم يتم تسجيل خلاصة تشخيصية.'}
              </div>
            </div>

            {/* IEP Recommendations */}
            <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10, border: '1px solid #bbf7d0', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#15803d', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🎯 توصيات الخطة التربوية الفردية (IEP) وجلسات التخاطب:</span>
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

      {/* IEP Bridge Modal for PPVT-5 */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleType="ppvt_5"
          scaleItems={PPVT5_ITEMS}
        />
      )}
    </>
  );
}
