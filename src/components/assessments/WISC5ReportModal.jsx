import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WISC5_ITEMS,
  WISC5_DOMAINS,
  WISC5_COPYRIGHT_INFO,
  calculateWISC5Psychometrics,
} from '../../data/wisc5Data';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function WISC5ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateWISC5Psychometrics(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'wisc_5',
      assessment.results || assessment.scores || {},
      WISC5_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const domainHtml = psychometrics.domainResults.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#6d28d9;">
          ${d.icon} ${d.name} (${d.code})
          <div style="font-size:11px;color:#64748b;font-weight:normal;">${d.nameEn}</div>
        </td>
        <td style="padding:8px 12px;text-align:center;">${d.rawScore} / ${d.maxRaw}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#6d28d9;font-size:14px;">${d.scaledScore} / 19</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#4338ca;font-size:14px;">${d.compositeScore}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${d.percentile}%</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          <span style="color:${d.levelColor};font-weight:bold;">${d.level}</span>
        </td>
      </tr>
    `).join('');

    const itemsHtml = WISC5_ITEMS.map(it => {
      const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
      const note = assessment.itemNotes?.[it.id] || '';
      const domain = WISC5_DOMAINS.find(d => d.id === it.domainId);
      const scoreLabels = ['0 - عجز/خطأ', '1 - جزئي/ممتد', '2 - مقبول/متوسط', '3 - إتقان تجريدي'];

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${score === 0 ? '#fff1f2' : score === 1 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:#64748b;">${it.id}</td>
          <td style="padding:6px 8px;font-weight:600;font-size:12px;">${it.title}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;">${it.subtest}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;">${domain?.code || ''}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:${score === 0 ? '#dc2626' : score === 1 ? '#ea580c' : score === 2 ? '#0284c7' : '#059669'};">
            ${score !== null ? scoreLabels[score] || score : '—'}
          </td>
          <td style="padding:6px 8px;font-size:11px;color:#64748b;">${note || '—'}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:12px;max-width:900px;margin:auto;">
        <!-- Header -->
        <div style="border-bottom:3px solid #7c3aed;padding-bottom:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#6d28d9;font-size:22px;margin:0 0 4px 0;">🧠 تقرير التقييم النفسي والذكاء المعرفي (WISC-V)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">Wechsler Intelligence Scale for Children — مقياس وكسلر لذكاء الأطفال (الطبعة الخامسة المقننة)</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>المركز:</b> ${center?.name || 'مركز التربية الخاصة والتأهيل'}</div>
          </div>
        </div>

        <!-- COPYRIGHT & INTELLECTUAL PROPERTY BOX -->
        <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#6b21a8;line-height:1.5;">
          <b>⚖️ إشعار حقوق الملكية الفكرية والأمانة العلمية:</b> مقياس وكسلر لذكاء الأطفال (WISC-V) · 
          المؤلف الأصلي: <b>${WISC5_COPYRIGHT_INFO.authorAr}</b> (${WISC5_COPYRIGHT_INFO.authorEn}) · 
          الناشر والمطور: <b>${WISC5_COPYRIGHT_INFO.publisherAr}</b> · 
          التقنين: ${WISC5_COPYRIGHT_INFO.adaptationAr} · 
          ${WISC5_COPYRIGHT_INFO.standardsReference}.
          <div style="margin-top:3px;font-size:10px;color:#7c3aed;">
            ${WISC5_COPYRIGHT_INFO.notice}
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
            <td style="padding:4px 8px;"><b>الأخصائي النفسي/الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '—'}</td>
            <td style="padding:4px 8px;"><b>المستجيب/الملاحظ:</b> ${assessment.raterName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:4px 8px;"><b>المدرسة / الجهة:</b> ${assessment.school || '—'}</td>
          </tr>
        </table>

        <!-- Psychometric Dashboard -->
        <div style="background:#faf5ff;border:1.5px solid #e9d5ff;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 10px 0;color:#6d28d9;font-size:15px;">📊 المؤشرات السيكومترية ومعامل الذكاء الكلي (FSIQ Dashboard)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:12px;">
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #d8b4fe;">
              <span style="color:#64748b;display:block;font-size:11px;">معامل الذكاء الكلي (FSIQ)</span>
              <span style="font-size:22px;font-weight:900;color:${psychometrics.severityColor};">${psychometrics.fsiq}</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #d8b4fe;">
              <span style="color:#64748b;display:block;font-size:11px;">الرتبة المئينية الكلية</span>
              <span style="font-size:22px;font-weight:900;color:#6d28d9;">${psychometrics.overallPercentile}%</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #d8b4fe;">
              <span style="color:#64748b;display:block;font-size:11px;">مجموع الدرجات المعيارية</span>
              <span style="font-size:22px;font-weight:900;color:#0284c7;">${psychometrics.sumScaledScores} <small style="font-size:11px;color:#64748b;">/ 95</small></span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #d8b4fe;">
              <span style="color:#64748b;display:block;font-size:11px;">التصنيف السيكومتري المعتمد</span>
              <span style="font-size:13px;font-weight:bold;color:${psychometrics.severityColor};display:block;margin-top:4px;">${psychometrics.classification}</span>
            </div>
          </div>
        </div>

        <!-- Subscales Breakdown Table -->
        <h3 style="color:#6d28d9;font-size:15px;margin:16px 0 8px 0;">📑 الأداء التفصيلي على المؤشرات المعرفية الخمسة (Primary Indices)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px 12px;text-align:right;">المؤشر المعرفي</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة الخام</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة المعيارية (1-19)</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة الموزونة</th>
              <th style="padding:8px 12px;text-align:center;">الرتبة المئينية</th>
              <th style="padding:8px 12px;text-align:center;">التصنيف والوصف</th>
            </tr>
          </thead>
          <tbody>
            ${domainHtml}
          </tbody>
        </table>

        <!-- Clinical Impression & Summary -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 6px 0;color:#334155;font-size:14px;">📝 الخلاصة الإكلينيكية والتقرير التشخيصي</h3>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#475569;white-space:pre-line;">
            ${assessment.clinicalSummary || psychometrics.clinicalImpression}
          </p>
        </div>

        <!-- Recommendations -->
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 6px 0;color:#065f46;font-size:14px;">🎯 التوصيات التربوية وبناء الخطة الفردية (IEP)</h3>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#047857;white-space:pre-line;">
            ${assessment.recommendations || psychometrics.recommendations}
          </p>
        </div>

        <!-- Item by Item Breakdown -->
        <h3 style="color:#6d28d9;font-size:14px;margin:16px 0 8px 0;">📋 تفاصيل الاستجابة لبنود المقياس الـ 32</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:11px;border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:6px 8px;width:30px;text-align:center;">#</th>
              <th style="padding:6px 8px;text-align:right;">المهمة المعرفية / البند</th>
              <th style="padding:6px 8px;text-align:center;width:120px;">الاختبار الفرعي</th>
              <th style="padding:6px 8px;text-align:center;width:60px;">المؤشر</th>
              <th style="padding:6px 8px;text-align:center;width:100px;">الدرجة</th>
              <th style="padding:6px 8px;text-align:right;">الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Footer / Signatures -->
        <div style="display:flex;justify-content:space-between;margin-top:24px;padding-top:12px;border-top:1px dashed #cbd5e1;font-size:12px;">
          <div style="text-align:center;width:200px;">
            <b>الأخصائي النفسي الفاحص</b>
            <div style="margin-top:35px;border-bottom:1px solid #94a3b8;"></div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">${assessment.examinerName || '..............................'}</div>
          </div>
          <div style="text-align:center;width:200px;">
            <b>رئيس قسم القياس والتشخيص</b>
            <div style="margin-top:35px;border-bottom:1px solid #94a3b8;"></div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">..............................</div>
          </div>
          <div style="text-align:center;width:200px;">
            <b>مدير المركز / الختم الرسمي</b>
            <div style="margin-top:35px;border-bottom:1px solid #94a3b8;"></div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">${center?.name || '..............................'}</div>
          </div>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <title>تقرير مقياس وكسلر (WISC-V) - ${assessment.studentName || 'طالب'}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
            @page { size: A4 portrait; margin: 12mm 10mm; }
            body { margin: 0; padding: 0; background: #fff; }
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
      printWindow.document.close();
    }
  }

  function handleShareWhatsApp() {
    sendReportToWhatsApp({
      title: 'تقرير مقياس وكسلر لذكاء الأطفال (WISC-V)',
      studentName: assessment.studentName,
      date: assessment.date,
      score: `معامل الذكاء الكلي (FSIQ): ${psychometrics.fsiq} (رتبة مئينية: ${psychometrics.overallPercentile}%)`,
      level: psychometrics.classification,
      summary: assessment.clinicalSummary || psychometrics.clinicalImpression,
      recommendations: assessment.recommendations || psychometrics.recommendations,
      centerName: center?.name,
    });
  }

  return (
    <>
      <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
        <div
          className="mb"
          style={{
            maxWidth: 1000,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                🧠
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                  تقرير مقياس وكسلر لذكاء الأطفال (WISC-V)
                </h2>
                <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>
                  {assessment.studentName || 'المفحوص'} · {assessment.date || '—'} · Pearson Clinical Assessment
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={onEdit}
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
                >
                  ✏️ تعديل التقييم
                </button>
              )}
              <button
                type="button"
                className="btn btn-sm btn-p"
                onClick={handlePrint}
                style={{ background: '#fff', color: '#6d28d9', fontWeight: 800 }}
              >
                🖨️ طباعة التقرير (PDF)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-g"
                onClick={handleShareWhatsApp}
                style={{ background: '#22c55e', color: '#fff', border: 'none' }}
              >
                💬 واتساب
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* BODY */}
          <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* COPYRIGHT NOTICE BANNER */}
            <div
              style={{
                background: 'rgba(124, 58, 237, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 12,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>⚖️</span>
              <div style={{ flex: 1 }}>
                <b>إشعار حقوق الملكية الفكرية والاعتماد العلمي:</b> مقياس وكسلر لذكاء الأطفال — الطبعة الخامسة (WISC-V) · إعداد: {WISC5_COPYRIGHT_INFO.authorAr} · جهة النشر: {WISC5_COPYRIGHT_INFO.publisherAr} · {WISC5_COPYRIGHT_INFO.standardsReference}.
              </div>
            </div>

            {/* STUDENT INFO SUMMARY */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
                background: 'var(--g0)',
                padding: 12,
                borderRadius: 10,
                fontSize: 12,
              }}
            >
              <div><b>اسم المفحوص:</b> {assessment.studentName || '—'}</div>
              <div><b>العمر الزمني:</b> {assessment.age || '—'}</div>
              <div><b>الصف الدراسي:</b> {assessment.grade || '—'}</div>
              <div><b>المدرسة:</b> {assessment.school || '—'}</div>
              <div><b>الأخصائي النفسي:</b> {assessment.examinerName || '—'}</div>
              <div><b>تاريخ التقييم:</b> {assessment.date || '—'}</div>
            </div>

            {/* FSIQ MAIN CARDS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
              }}
            >
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: `2px solid ${psychometrics.severityColor}`,
                  borderRadius: 12,
                  padding: 14,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>معامل الذكاء الكلي (FSIQ)</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: psychometrics.severityColor }}>
                  {psychometrics.fsiq}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: psychometrics.severityColor }}>
                  {psychometrics.classification}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: 14,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>الرتبة المئينية الكلية</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#7c3aed' }}>
                  {psychometrics.overallPercentile}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>مقارنة بالأقران في نفس العمر</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: 14,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>مجموع الدرجات المعيارية</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#0284c7' }}>
                  {psychometrics.sumScaledScores} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ 95</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>متوسط المؤشرات الخمسة</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: 14,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <button
                  type="button"
                  className="btn btn-p"
                  onClick={() => setBridgeOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 13,
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span>🚀 اشتقاق خطة فردية (IEP)</span>
                  <span className="b-rd" style={{ background: '#fff', color: '#7c3aed', padding: '2px 6px', borderRadius: 12, fontSize: 11, fontWeight: 900 }}>
                    {recommendedGoals.length}
                  </span>
                </button>
              </div>
            </div>

            {/* DOMAINS BREAKDOWN */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: 'var(--g0)', fontWeight: 800, fontSize: 13 }}>
                📊 المؤشرات المعرفية الأولية الخمسة (Primary Cognitive Indices)
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl" style={{ width: '100%', fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'right' }}>المؤشر المعرفي</th>
                      <th style={{ textAlign: 'center' }}>الدرجة الخام</th>
                      <th style={{ textAlign: 'center' }}>الدرجة المعيارية (1-19)</th>
                      <th style={{ textAlign: 'center' }}>الدرجة الموزونة</th>
                      <th style={{ textAlign: 'center' }}>الرتبة المئينية</th>
                      <th style={{ textAlign: 'center' }}>التصنيف والوصف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psychometrics.domainResults.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 700 }}>
                          <span style={{ marginLeft: 6 }}>{d.icon}</span>
                          <span>{d.name} ({d.code})</span>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>{d.nameEn}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{d.rawScore} / {d.maxRaw}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: d.color }}>{d.scaledScore}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: '#4338ca' }}>{d.compositeScore}</td>
                        <td style={{ textAlign: 'center' }}>{d.percentile}%</td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              background: `${d.levelColor}15`,
                              color: d.levelColor,
                              border: `1px solid ${d.levelColor}40`,
                            }}
                          >
                            {d.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CLINICAL SUMMARY & RECOMMENDATIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: '#7c3aed' }}>
                  📝 التقرير الإكلينيكي والتشخيص السيكومتري
                </h4>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                  {assessment.clinicalSummary || psychometrics.clinicalImpression}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: '#059669' }}>
                  🎯 توصيات الخطة التربوية الفردية (IEP)
                </h4>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                  {assessment.recommendations || psychometrics.recommendations}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IEP BRIDGE MODAL */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessmentData={assessment}
          measureId="wisc_5"
          scaleItems={WISC5_ITEMS}
        />
      )}
    </>
  );
}
