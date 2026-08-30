import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  SRS2_ITEMS,
  SRS2_DOMAINS,
  SRS2_COPYRIGHT_INFO,
  calculateSRS2Psychometrics,
} from '../../data/srs2Data';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function SRS2ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateSRS2Psychometrics(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'srs',
      assessment.results || assessment.scores || {},
      SRS2_ITEMS
    );
  }, [assessment]);

  const filteredItems = useMemo(() => {
    return SRS2_ITEMS.filter(it => {
      const matchesDomain = activeDomainFilter === 'all' || it.domainId === activeDomainFilter;
      const matchesSearch = !searchQuery || it.text.toLowerCase().includes(searchQuery.toLowerCase()) || it.id.includes(searchQuery);
      return matchesDomain && matchesSearch;
    });
  }, [activeDomainFilter, searchQuery]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const subscaleHtml = psychometrics.subscales.map(s => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#065f46;">
          ${s.name}
          <div style="font-size:11px;color:#64748b;font-weight:normal;">كود المقياس: ${s.code}</div>
        </td>
        <td style="padding:8px 12px;text-align:center;">${s.raw} / ${s.maxRaw}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#047857;font-size:14px;">${s.tScore} T</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${s.percentile}%</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          <span style="
            padding:3px 8px;
            border-radius:4px;
            font-size:11px;
            font-weight:bold;
            background:${s.tScore <= 59 ? '#ecfdf5' : s.tScore <= 65 ? '#fef9c3' : s.tScore <= 75 ? '#ffedd5' : '#fee2e2'};
            color:${s.tScore <= 59 ? '#047857' : s.tScore <= 65 ? '#a16207' : s.tScore <= 75 ? '#c2410c' : '#b91c1c'};
          ">
            ${s.level}
          </span>
        </td>
      </tr>
    `).join('');

    const dsmHtml = `
      <tr style="border-bottom:1px solid #e2e8f0;background:#f0fdf4;">
        <td style="padding:8px 12px;font-weight:bold;color:#0f766e;">
          ${psychometrics.dsmScales.sci.name}
          <div style="font-size:11px;color:#0d9488;font-weight:normal;">المقاييس المدمجة: AWR + COG + COM + MOT (53 بنداً)</div>
        </td>
        <td style="padding:8px 12px;text-align:center;">${psychometrics.dsmScales.sci.raw} / 212</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#0f766e;font-size:14px;">${psychometrics.dsmScales.sci.tScore} T</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${psychometrics.dsmScales.sci.percentile}%</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#0f766e;">${psychometrics.dsmScales.sci.level}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;background:#fef2f2;">
        <td style="padding:8px 12px;font-weight:bold;color:#b91c1c;">
          ${psychometrics.dsmScales.rrb.name}
          <div style="font-size:11px;color:#ef4444;font-weight:normal;">مقياس السلوكيات النمطية والاهتمامات المقيدة (12 بنداً)</div>
        </td>
        <td style="padding:8px 12px;text-align:center;">${psychometrics.dsmScales.rrb.raw} / 48</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#b91c1c;font-size:14px;">${psychometrics.dsmScales.rrb.tScore} T</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${psychometrics.dsmScales.rrb.percentile}%</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#b91c1c;">${psychometrics.dsmScales.rrb.level}</td>
      </tr>
    `;

    const answers = assessment.results || assessment.scores || {};

    const itemsHtml = SRS2_ITEMS.map((it, idx) => {
      const rawVal = answers[it.id] !== undefined && answers[it.id] !== null ? Number(answers[it.id]) : null;
      let calculatedScore = rawVal;
      if (rawVal !== null && it.isReverse) {
        calculatedScore = 5 - rawVal;
      }

      const note = assessment.itemNotes?.[it.id] || '';
      const responseLabels = {
        1: '1 - غير صحيح',
        2: '2 - أحياناً',
        3: '3 - غالباً',
        4: '4 - دائماً تقريباً'
      };

      const domMeta = SRS2_DOMAINS.find(d => d.id === it.domainId);
      const isDeficit = calculatedScore !== null && calculatedScore >= 3;

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${isDeficit ? '#fff1f2' : (calculatedScore === 2 ? '#fffbeb' : '#ffffff')};">
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:#64748b;">${idx + 1}</td>
          <td style="padding:6px 8px;font-weight:600;font-size:12px;">
            ${it.text}
            ${it.isReverse ? '<span style="font-size:10px;color:#047857;background:#ecfdf5;padding:1px 4px;border-radius:3px;margin-right:4px;">(بند مقلوب)</span>' : ''}
          </td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;">${domMeta?.name?.split(' ')[0] || ''}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:#047857;font-size:11px;">
            ${rawVal ? responseLabels[rawVal] : '—'}
          </td>
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:${isDeficit ? '#dc2626' : '#475569'};">
            ${calculatedScore || '—'}
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
            <h1 style="color:#065f46;font-size:22px;margin:0 0 4px 0;">👥 تقرير التقييم والتشخيص الإكلينيكي المعتمد (SRS-2)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">مقياس الاستجابة الاجتماعية — الإصدار الثاني (Social Responsiveness Scale, Second Edition)</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>المركز:</b> ${center?.name || 'مركز التربية الخاصة والتأهيل النفسي'}</div>
          </div>
        </div>

        <!-- COPYRIGHT & INTELLECTUAL PROPERTY BOX -->
        <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#065f46;line-height:1.5;">
          <b>⚖️ إشعار حقوق الملكية الفكرية والاعتماد العلمي:</b> مقياس الاستجابة الاجتماعية — الإصدار الثاني (SRS-2) · 
          إعداد: <b>${SRS2_COPYRIGHT_INFO.authorsAr}</b> (${SRS2_COPYRIGHT_INFO.authorsEn}) · 
          الناشر: <b>${SRS2_COPYRIGHT_INFO.publisherAr}</b> · 
          ${SRS2_COPYRIGHT_INFO.standardNormsAr}.
          <div style="margin-top:3px;font-size:10px;color:#047857;">
            ${SRS2_COPYRIGHT_INFO.licensingNotice}
          </div>
        </div>

        <!-- Student & Assessment Info Table -->
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:12px;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 8px;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:4px 8px;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:4px 8px;"><b>تاريخ الميلاد:</b> ${assessment.dob || '—'}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;"><b>التشخيص المبدئي:</b> ${assessment.diagnosis || '—'}</td>
            <td style="padding:4px 8px;"><b>المستجيب (Rater):</b> ${assessment.raterName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:4px 8px;"><b>الأخصائي الفاحص:</b> ${assessment.examinerName || '—'}</td>
          </tr>
        </table>

        <!-- Psychometric Dashboard -->
        <div style="background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 10px 0;color:#065f46;font-size:15px;">📊 المؤشرات السيكومترية والدرجة التائية الإجمالية (SRS-2 Dashboard)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:12px;flex-wrap:wrap;gap:8px;">
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #6ee7b7;min-width:130px;">
              <span style="color:#64748b;display:block;font-size:11px;">الدرجة التائية الكلية (Total T)</span>
              <span style="font-size:22px;font-weight:900;color:${psychometrics.severityColor};">${psychometrics.totalTScore}T</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #6ee7b7;min-width:130px;">
              <span style="color:#64748b;display:block;font-size:11px;">الرتبة المئينية الكلية</span>
              <span style="font-size:22px;font-weight:900;color:#0d9488;">${psychometrics.overallPercentile}%</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #6ee7b7;min-width:130px;">
              <span style="color:#64748b;display:block;font-size:11px;">المجموع الخام الكلي</span>
              <span style="font-size:22px;font-weight:900;color:#0284c7;">${psychometrics.totalRawScore} <small style="font-size:11px;color:#64748b;">/ 260</small></span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #6ee7b7;min-width:130px;">
              <span style="color:#64748b;display:block;font-size:11px;">مؤشر DSM-5 (SCI)</span>
              <span style="font-size:20px;font-weight:900;color:#0f766e;">${psychometrics.dsmScales.sci.tScore}T</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #6ee7b7;min-width:130px;">
              <span style="color:#64748b;display:block;font-size:11px;">مؤشر DSM-5 (RRB)</span>
              <span style="font-size:20px;font-weight:900;color:#dc2626;">${psychometrics.dsmScales.rrb.tScore}T</span>
            </div>
          </div>
          <div style="margin-top:10px;text-align:center;padding:6px;background:#fff;border-radius:6px;border:1px solid #6ee7b7;">
            <span style="font-size:12px;color:#64748b;">التصنيف والشدة الإكلينيكية: </span>
            <strong style="color:${psychometrics.severityColor};font-size:13px;">${psychometrics.category}</strong>
            <span style="font-size:11px;color:#64748b;margin-right:8px;">[${psychometrics.dsm5Classification}]</span>
          </div>
        </div>

        <!-- Subscales Breakdown Table -->
        <h3 style="color:#065f46;font-size:14px;margin:14px 0 8px 0;">📋 نتائج المقاييس الفرعية العلاجية ومؤشرات DSM-5 المعتمدة:</h3>
        <table style="width:100%;margin-bottom:16px;border-collapse:collapse;font-size:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px 12px;text-align:right;">المقياس الفرعي</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة الخام</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة التائية (T)</th>
              <th style="padding:8px 12px;text-align:center;">الرتبة المئينية</th>
              <th style="padding:8px 12px;text-align:center;">مستوى القصور</th>
            </tr>
          </thead>
          <tbody>
            ${subscaleHtml}
            ${dsmHtml}
          </tbody>
        </table>

        <!-- Clinical Narrative -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;">
          <h3 style="margin:0 0 6px 0;color:#065f46;font-size:14px;">📝 الخلاصة والتقرير الإكلينيكي:</h3>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#334155;white-space:pre-wrap;">${assessment.clinicalSummary || psychometrics.interpretation}</p>
        </div>

        <!-- Recommendations -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;">
          <h3 style="margin:0 0 6px 0;color:#065f46;font-size:14px;">🎯 التوصيات التأهيلية وأهداف الخطة الفردية (IEP):</h3>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#334155;white-space:pre-wrap;">${assessment.recommendations || 'يوصى ببناء أهداف خطة تربوية فردية وتنمية مهارات التفاعل الاجتماعي واللغة البراجماتية وتطبيق فنيات تعديل السلوك.'}</p>
        </div>

        <!-- All Items Table -->
        <h3 style="color:#065f46;font-size:14px;margin:14px 0 8px 0;">🔍 تفريغ درجات بنود المقياس الـ 65 كاملة:</h3>
        <table style="width:100%;margin-bottom:20px;border-collapse:collapse;font-size:11px;background:#fff;border:1px solid #e2e8f0;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:6px;width:30px;text-align:center;">#</th>
              <th style="padding:6px;text-align:right;">نص البند التقييمي</th>
              <th style="padding:6px;width:80px;text-align:center;">المجال</th>
              <th style="padding:6px;width:120px;text-align:center;">الاستجابة المسجلة</th>
              <th style="padding:6px;width:50px;text-align:center;">الدرجة</th>
              <th style="padding:6px;width:120px;text-align:right;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signatures Footer -->
        <div style="margin-top:24px;border-top:1px solid #cbd5e1;padding-top:14px;display:flex;justify-content:space-between;font-size:12px;color:#475569;">
          <div>
            <b>الأخصائي الفاحص:</b> ${assessment.examinerName || '________________'}
            <br /><span style="font-size:10px;">التوقيع والاعتماد</span>
          </div>
          <div>
            <b>المشرف الفني / مدير المركز:</b> ________________
            <br /><span style="font-size:10px;">الختم الرسمي للمركز</span>
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
          <meta charset="utf-8" />
          <title>تقرير SRS-2 - ${assessment.studentName || 'مفحوص'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; background: #fff; font-family: 'Tajawal', sans-serif; }
            @media print {
              body { padding: 0; }
              @page { margin: 12mm; size: A4; }
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = () => {
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
    const summaryText = `*تقرير تقييم مقياس الاستجابة الاجتماعية (SRS-2)*\n` +
      `👤 *المفحوص:* ${assessment.studentName || '—'}\n` +
      `📅 *التاريخ:* ${assessment.date || '—'}\n` +
      `📊 *الدرجة التائية الكلية:* ${psychometrics.totalTScore}T (مئيني: ${psychometrics.overallPercentile}%)\n` +
      `🎯 *التصنيف:* ${psychometrics.category}\n` +
      `📋 *مؤشر DSM-5 (SCI):* ${psychometrics.dsmScales.sci.tScore}T\n` +
      `🔄 *مؤشر DSM-5 (RRB):* ${psychometrics.dsmScales.rrb.tScore}T\n\n` +
      `📌 *الخلاصة الإكلينيكية:* ${assessment.clinicalSummary?.slice(0, 200) || psychometrics.interpretation.slice(0, 200)}...`;

    sendReportToWhatsApp({
      phone: assessment.phone || '',
      message: summaryText,
    });
  }

  return (
    <div className="mbg">
      <div
        className="mb"
        style={{
          maxWidth: 'min(1120px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Report Main Header */}
        <div
          className="fhd"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #065f46 0%, #0d9488 50%, #0284c7 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.8rem' }}>👥</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  تقرير التقييم والتشخيص الإكلينيكي المعتمد (SRS-2)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  Social Responsiveness Scale
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.95, marginTop: 2 }}>
                {assessment.studentName} · {assessment.date} · المعايير المقننة وفق DSM-5
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setBridgeOpen(true)}
              style={{
                background: '#f59e0b',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(245,158,11,0.4)',
              }}
            >
              🎯 ربط بالخطة الفردية ({recommendedGoals.length} أهداف)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handlePrint}
              style={{ background: '#fff', color: '#065f46', border: 'none', fontWeight: 800 }}
            >
              🖨️ طباعة التقرير
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleShareWhatsApp}
              style={{ background: '#25D366', color: '#fff', border: 'none', fontWeight: 800 }}
            >
              💬 واتساب
            </button>
            {onEdit && (
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => {
                  onClose();
                  onEdit(assessment);
                }}
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700 }}
              >
                ✏️ تعديل
              </button>
            )}
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Copyright Scientific Notice */}
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: '0.78rem',
              color: '#065f46',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>⚖️</span>
              <div>
                <strong>إشعار حقوق الملكية الفكرية والأمانة العلمية:</strong> {SRS2_COPYRIGHT_INFO.scaleFullNameAr} · 
                المؤلفون: {SRS2_COPYRIGHT_INFO.authorsAr} ({SRS2_COPYRIGHT_INFO.authorsEn}) · 
                الناشر: {SRS2_COPYRIGHT_INFO.publisherAr}.
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#d1fae5', padding: '3px 8px', borderRadius: 6, border: '1px solid #6ee7b7', fontWeight: 700 }}>
              معايير مقننة وفق DSM-5
            </span>
          </div>

          {/* Student Profile Card */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-sub)' }}>اسم المفحوص: </span>
                <strong style={{ color: 'var(--text-main)' }}>{assessment.studentName || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)' }}>العمر الزمني: </span>
                <strong>{assessment.age || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)' }}>تاريخ الميلاد: </span>
                <strong>{assessment.dob || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)' }}>التشخيص المبدئي: </span>
                <strong>{assessment.diagnosis || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)' }}>الأخصائي الفاحص: </span>
                <strong>{assessment.examinerName || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)' }}>المستجيب (Rater): </span>
                <strong>{assessment.raterName || '—'} ({assessment.raterRelation || '—'})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)' }}>تاريخ التطبيق: </span>
                <strong>{assessment.date || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)' }}>حالة الاكتمال: </span>
                <span className="bdg b-gr" style={{ fontSize: '0.72rem' }}>
                  {psychometrics.answeredCount} / {SRS2_ITEMS.length} بنداً ({psychometrics.progressPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Psychometric Dashboard Cards */}
          <div
            style={{
              background: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              borderRadius: 10,
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ margin: 0, color: '#065f46', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📊</span> المؤشرات السيكومترية والدرجات المعيارية التائية (SRS-2 Summary Dashboard):
              </h3>
              <span className="bdg" style={{ background: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: '0.74rem' }}>
                Mean = 50 · SD = 10 · SEM = ±{psychometrics.sem}T
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {/* Total T-Score */}
              <div style={{ background: '#fff', padding: '12px', borderRadius: 8, border: `2px solid ${psychometrics.severityColor}`, textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة التائية الكلية (Total T)</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: psychometrics.severityColor }}>
                  {psychometrics.totalTScore}T
                </span>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  الرتبة المئينية: <strong>{psychometrics.overallPercentile}%</strong>
                </div>
              </div>

              {/* Total Raw */}
              <div style={{ background: '#fff', padding: '12px', borderRadius: 8, border: '1px solid #a7f3d0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>المجموع الخام الكلي</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0d9488' }}>
                  {psychometrics.totalRawScore} <small style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>/ 260</small>
                </span>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  نسبة الاستجابة: <strong>{psychometrics.progressPercent}%</strong>
                </div>
              </div>

              {/* DSM-5 SCI */}
              <div style={{ background: '#fff', padding: '12px', borderRadius: 8, border: '1px solid #a7f3d0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>مؤشر DSM-5 التواصلي (SCI)</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f766e' }}>
                  {psychometrics.dsmScales.sci.tScore}T
                </span>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  الرتبة: <strong>{psychometrics.dsmScales.sci.percentile}%</strong> ({psychometrics.dsmScales.sci.level})
                </div>
              </div>

              {/* DSM-5 RRB */}
              <div style={{ background: '#fff', padding: '12px', borderRadius: 8, border: '1px solid #a7f3d0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block' }}>مؤشر DSM-5 النمطي (RRB)</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626' }}>
                  {psychometrics.dsmScales.rrb.tScore}T
                </span>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  الرتبة: <strong>{psychometrics.dsmScales.rrb.percentile}%</strong> ({psychometrics.dsmScales.rrb.level})
                </div>
              </div>
            </div>

            {/* Diagnostic Severity Banner */}
            <div
              style={{
                marginTop: 12,
                background: '#fff',
                borderRadius: 8,
                padding: '10px 14px',
                border: `1.5px solid ${psychometrics.severityColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>التصنيف والنتيجة الإكلينيكية العامة: </span>
                <strong style={{ fontSize: '0.95rem', color: psychometrics.severityColor }}>{psychometrics.category}</strong>
              </div>
              <span className="bdg" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '0.78rem', fontWeight: 700 }}>
                {psychometrics.dsm5Classification}
              </span>
            </div>
          </div>

          {/* Subscales Table */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '12px 16px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📋 تفصيل المقاييس الفرعية العلاجية ومؤشرات DSM-5 المعتمدة:
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>المقياس الفرعي</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>الدرجة الخام</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>الدرجة التائية (T-Score)</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>الرتبة المئينية</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>مستوى القصور</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', width: '180px' }}>مستوى الشدة البصري</th>
                  </tr>
                </thead>
                <tbody>
                  {psychometrics.subscales.map(s => {
                    const pct = Math.min(100, Math.max(0, ((s.tScore - 35) / 65) * 100));
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <strong style={{ color: s.color }}>{s.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>كود المقياس: [{s.code}] · {s.total} بنود</div>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>
                          {s.raw} / {s.maxRaw}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, color: s.color, fontSize: '0.95rem' }}>
                          {s.tScore}T
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>
                          {s.percentile}%
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                          <span
                            className="bdg"
                            style={{
                              background: s.tScore <= 59 ? '#ecfdf5' : s.tScore <= 65 ? '#fef9c3' : s.tScore <= 75 ? '#ffedd5' : '#fee2e2',
                              color: s.tScore <= 59 ? '#047857' : s.tScore <= 65 ? '#a16207' : s.tScore <= 75 ? '#c2410c' : '#b91c1c',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {s.level}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: 4 }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* DSM-5 SCI Row */}
                  <tr style={{ background: '#f0fdf4', borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <strong style={{ color: '#0f766e' }}>{psychometrics.dsmScales.sci.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#0d9488' }}>مؤشر التفاعل والتواصل التبادلي (53 بنداً)</div>
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>
                      {psychometrics.dsmScales.sci.raw} / 212
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, color: '#0f766e', fontSize: '0.95rem' }}>
                      {psychometrics.dsmScales.sci.tScore}T
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>
                      {psychometrics.dsmScales.sci.percentile}%
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                      <span className="bdg b-tl" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                        {psychometrics.dsmScales.sci.level}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ width: '100%', height: 8, background: '#ccfbf1', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Math.max(0, ((psychometrics.dsmScales.sci.tScore - 35) / 65) * 100))}%`, height: '100%', background: '#0f766e', borderRadius: 4 }} />
                      </div>
                    </td>
                  </tr>

                  {/* DSM-5 RRB Row */}
                  <tr style={{ background: '#fef2f2' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <strong style={{ color: '#dc2626' }}>{psychometrics.dsmScales.rrb.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#ef4444' }}>مؤشر السلوكيات المقيدة والتكرارية (12 بنداً)</div>
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>
                      {psychometrics.dsmScales.rrb.raw} / 48
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, color: '#dc2626', fontSize: '0.95rem' }}>
                      {psychometrics.dsmScales.rrb.tScore}T
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>
                      {psychometrics.dsmScales.rrb.percentile}%
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                      <span className="bdg b-rd" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                        {psychometrics.dsmScales.rrb.level}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ width: '100%', height: 8, background: '#fee2e2', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Math.max(0, ((psychometrics.dsmScales.rrb.tScore - 35) / 65) * 100))}%`, height: '100%', background: '#dc2626', borderRadius: 4 }} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Narrative & Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {/* Clinical Summary */}
            <div style={{ background: 'var(--g0)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '14px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 800, color: '#065f46' }}>
                📝 التقرير والخلاصة الإكلينيكية:
              </h4>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                {assessment.clinicalSummary || psychometrics.interpretation}
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ background: 'var(--g0)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '14px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 800, color: '#065f46' }}>
                🎯 التوصيات التأهيلية وأهداف الخطة الفردية (IEP):
              </h4>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                {assessment.recommendations || 'يوصى بتطبيق برامج تدريب المهارات الاجتماعية، التدخل السلوكي التطبيقي، والتنسيق التربوي الشامل.'}
              </div>
            </div>
          </div>

          {/* Detailed Items Table with Filter */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                background: 'var(--g0)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                🔍 تفريغ الاستجابات على بنود المقياس الـ 65 ({filteredItems.length} بنداً معروضاً):
              </h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="inp"
                  style={{ fontSize: '0.74rem', padding: '4px 10px', width: 160 }}
                  placeholder="بحث في نص البند..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <select
                  className="inp"
                  style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                  value={activeDomainFilter}
                  onChange={e => setActiveDomainFilter(e.target.value)}
                >
                  <option value="all">جميع المقاييس (65)</option>
                  {SRS2_DOMAINS.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.itemsCount})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--g0)' }}>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 6px', width: '40px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>نص البند التقييمي</th>
                    <th style={{ padding: '8px 8px', width: '110px', textAlign: 'center' }}>المجال</th>
                    <th style={{ padding: '8px 10px', width: '150px', textAlign: 'center' }}>الاستجابة المسجلة</th>
                    <th style={{ padding: '8px 8px', width: '60px', textAlign: 'center' }}>الدرجة</th>
                    <th style={{ padding: '8px 10px', width: '160px', textAlign: 'right' }}>ملاحظات نوعية</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(it => {
                    const answers = assessment.results || assessment.scores || {};
                    const rawVal = answers[it.id] !== undefined && answers[it.id] !== null ? Number(answers[it.id]) : null;
                    let calculatedScore = rawVal;
                    if (rawVal !== null && it.isReverse) {
                      calculatedScore = 5 - rawVal;
                    }

                    const note = assessment.itemNotes?.[it.id] || '';
                    const domMeta = SRS2_DOMAINS.find(d => d.id === it.domainId);
                    const isDeficit = calculatedScore !== null && calculatedScore >= 3;

                    const responseLabels = {
                      1: '1 - غير صحيح',
                      2: '2 - أحياناً',
                      3: '3 - غالباً',
                      4: '4 - دائماً تقريباً'
                    };

                    return (
                      <tr
                        key={it.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          background: isDeficit ? 'rgba(239, 68, 68, 0.05)' : (calculatedScore === 2 ? 'rgba(245, 158, 11, 0.04)' : 'transparent'),
                        }}
                      >
                        <td style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 800, color: 'var(--text-sub)' }}>
                          {it.id.replace('s', '')}
                        </td>
                        <td style={{ padding: '6px 10px', lineHeight: 1.4 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {it.text}
                          </div>
                          {it.isReverse && (
                            <span className="bdg" style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.64rem', fontWeight: 700, marginTop: 2 }}>
                              🔄 بند إيجابي مقلوب
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <span
                            className="bdg"
                            style={{
                              background: domMeta?.bgLight || '#f1f5f9',
                              color: domMeta?.color || '#334155',
                              border: `1px solid ${domMeta?.borderColor || '#cbd5e1'}`,
                              fontSize: '0.66rem',
                              fontWeight: 700,
                            }}
                          >
                            {domMeta?.code} · {domMeta?.name ? domMeta.name.split(' ')[0] : ''}
                          </span>
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700, color: '#047857', fontSize: '0.76rem' }}>
                          {rawVal ? responseLabels[rawVal] : '—'}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, color: isDeficit ? '#dc2626' : 'var(--text-main)' }}>
                          {calculatedScore !== null ? calculatedScore : '—'}
                        </td>
                        <td style={{ padding: '6px 10px', fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                          {note || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-sub)' }}>
            <span>👥 {SRS2_COPYRIGHT_INFO.scaleFullNameAr}</span>
            <span>·</span>
            <span>{SRS2_COPYRIGHT_INFO.publisherAr}</span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              style={{ fontSize: '0.82rem', padding: '6px 16px', fontWeight: 700 }}
            >
              إغلاق
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                border: 'none',
                fontSize: '0.82rem',
                padding: '6px 20px',
                fontWeight: 800,
                color: '#fff',
              }}
            >
              🖨️ طباعة التقرير الكامل
            </button>
          </div>
        </div>
      </div>

      {/* IEP Bridge Modal Integration */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          measureId="srs"
          scaleName="مقياس الاستجابة الاجتماعية (SRS-2)"
          studentId={assessment.stuId}
          studentName={assessment.studentName}
          assessmentScores={assessment.results || assessment.scores || {}}
          scaleItems={SRS2_ITEMS}
          recommendedGoals={recommendedGoals}
          assessmentDate={assessment.date}
        />
      )}
    </div>
  );
}
