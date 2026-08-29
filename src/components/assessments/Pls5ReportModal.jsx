import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PLS5_COPYRIGHT_INFO,
  PLS5_RECEPTIVE_ITEMS,
  PLS5_EXPRESSIVE_ITEMS,
  PLS5_SUBTESTS,
  calculatePLS5Psychometrics,
} from '../../data/pls5Data';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';
import { calcAge } from '../../utils/dateHelpers';

export default function Pls5ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp?.() || { center: null };
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState('dashboard'); // 'dashboard' | 'subtests' | 'items' | 'goals'
  const [subtestFilter, setSubtestFilter] = useState('all'); // 'all' | 'receptive' | 'expressive'

  const allItems = useMemo(() => {
    return [
      ...PLS5_RECEPTIVE_ITEMS.map(it => ({ ...it, subtest: 'receptive', subtestName: 'الفهم السمعي (الاستقبالي)', key: `r_${it.id}` })),
      ...PLS5_EXPRESSIVE_ITEMS.map(it => ({ ...it, subtest: 'expressive', subtestName: 'التواصل اللفظي (التعبيري)', key: `e_${it.id}` })),
    ];
  }, []);

  const studentAgeMonths = useMemo(() => {
    if (!assessment) return 48;
    if (assessment.dob) {
      const ageObj = calcAge(assessment.dob);
      if (typeof ageObj === 'object' && ageObj !== null) {
        return Math.max(2, (ageObj.years || 0) * 12 + (ageObj.months || 0));
      }
    }
    return 48;
  }, [assessment]);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    const scoresMap = assessment.scores || assessment.results || {};
    return calculatePLS5Psychometrics(scoresMap, {}, studentAgeMonths);
  }, [assessment, studentAgeMonths]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'pls5',
      assessment.scores || assessment.results || {},
      allItems
    );
  }, [assessment, allItems]);

  if (!isOpen || !assessment || !psychometrics) return null;

  // Printable Report Generation
  function handlePrint() {
    const subtestRowsHtml = `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#0e7490;">
          الفهم السمعي / اللغة الاستقبالية (AC)
          <div style="font-size:11px;color:#64748b;font-weight:normal;">Auditory Comprehension</div>
        </td>
        <td style="padding:8px 12px;text-align:center;">${psychometrics.receptiveRawScore} / 40</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#0e7490;font-size:14px;">${psychometrics.receptiveSS}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${psychometrics.receptivePR}%</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${Math.floor(psychometrics.receptiveLAEMonths / 12)}س و ${psychometrics.receptiveLAEMonths % 12}ش</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          ${psychometrics.receptiveBasalIndex !== -1 ? '<span style="color:#059669;font-weight:bold;">قاعدي: بند ' + (psychometrics.receptiveBasalIndex + 1) + '</span>' : '—'} 
          ${psychometrics.receptiveCeilingIndex !== -1 ? ' · <span style="color:#dc2626;font-weight:bold;">سقف: بند ' + (psychometrics.receptiveCeilingIndex + 6) + '</span>' : ''}
        </td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#0284c7;">
          التواصل اللفظي / اللغة التعبيرية (EC)
          <div style="font-size:11px;color:#64748b;font-weight:normal;">Expressive Communication</div>
        </td>
        <td style="padding:8px 12px;text-align:center;">${psychometrics.expressiveRawScore} / 40</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#0284c7;font-size:14px;">${psychometrics.expressiveSS}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${psychometrics.expressivePR}%</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${Math.floor(psychometrics.expressiveLAEMonths / 12)}س و ${psychometrics.expressiveLAEMonths % 12}ش</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          ${psychometrics.expressiveBasalIndex !== -1 ? '<span style="color:#059669;font-weight:bold;">قاعدي: بند ' + (psychometrics.expressiveBasalIndex + 1) + '</span>' : '—'} 
          ${psychometrics.expressiveCeilingIndex !== -1 ? ' · <span style="color:#dc2626;font-weight:bold;">سقف: بند ' + (psychometrics.expressiveCeilingIndex + 6) + '</span>' : ''}
        </td>
      </tr>
      <tr style="background:#f0fdfa;font-weight:bold;border-top:2px solid #0891b2;">
        <td style="padding:10px 12px;color:#0f766e;">المجموع اللغوي الكلي المركب (Total Language Score)</td>
        <td style="padding:10px 12px;text-align:center;">${psychometrics.totalRawScore} / 80</td>
        <td style="padding:10px 12px;text-align:center;color:${psychometrics.severityColor};font-size:16px;">${psychometrics.totalSS}</td>
        <td style="padding:10px 12px;text-align:center;color:#0f766e;font-size:15px;">${psychometrics.totalPR}%</td>
        <td style="padding:10px 12px;text-align:center;">${Math.floor(psychometrics.totalLAEMonths / 12)}س و ${psychometrics.totalLAEMonths % 12}ش</td>
        <td style="padding:10px 12px;text-align:center;color:${psychometrics.totalDelayGapMonths > 0 ? '#dc2626' : '#059669'};">
          ${psychometrics.totalDelayGapMonths > 0 ? 'تأخر: ' + psychometrics.totalDelayGapMonths + ' شهراً' : 'ضمن المعدل الطبيعي'}
        </td>
      </tr>
    `;

    const itemsHtml = allItems.map(it => {
      const resp = assessment.scores?.[it.key] !== undefined ? assessment.scores[it.key] : assessment.results?.[it.key];
      const isCorrect = resp === 1 || resp === true || resp === '1';
      const isFailed = resp === 0 || resp === false || resp === '0';
      const note = assessment.itemNotes?.[it.key] || '';

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${isFailed ? '#fff1f2' : isCorrect ? '#ffffff' : '#f8fafc'};">
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:#64748b;">${it.subtest === 'receptive' ? 'AC-' + it.id : 'EC-' + it.id}</td>
          <td style="padding:6px 8px;font-weight:600;font-size:12px;color:#0f766e;">${it.text}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;">${it.subtestName}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;">${it.ageGroup}</td>
          <td style="padding:6px 8px;text-align:center;font-weight:bold;color:${isCorrect ? '#059669' : isFailed ? '#dc2626' : '#94a3b8'};">
            ${isCorrect ? '1 (متقن)' : isFailed ? '0 (غير متقن)' : '—'}
          </td>
          <td style="padding:6px 8px;font-size:11px;color:#64748b;">${note || '—'}</td>
        </tr>
      `;
    }).join('');

    const goalsHtml = recommendedGoals.slice(0, 8).map((g, i) => `
      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px 12px;margin-bottom:8px;">
        <div style="font-weight:bold;color:#0f766e;font-size:12px;">${i + 1}. [${g.code}] ${g.title}</div>
        <div style="font-size:11px;color:#334155;margin-top:3px;">${g.text}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;"><b>معيار الإتقان:</b> ${g.mastery}</div>
      </div>
    `).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:12px;max-width:900px;margin:auto;">
        <!-- Header -->
        <div style="border-bottom:3px solid #0891b2;padding-bottom:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#0e7490;font-size:22px;margin:0 0 4px 0;">🗣️ تقرير مقياس لغة الأطفال - الإصدار الخامس (PLS-5)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">Preschool Language Scale (5th Ed) — المقياس الإكلينيكي المقنن للغة الاستقبالية والتعبيرية</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>المركز:</b> ${center?.name || 'مركز التربية الخاصة والتأهيل والتخاطب'}</div>
          </div>
        </div>

        <!-- COPYRIGHT & INTELLECTUAL PROPERTY BOX -->
        <div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#0e7490;line-height:1.5;">
          <b>⚖️ إشعار حقوق الملكية الفكرية والأمانة العلمية:</b> مقياس لغة الأطفال (PLS-5) · 
          إعداد: <b>${PLS5_COPYRIGHT_INFO.authorsAr}</b> (${PLS5_COPYRIGHT_INFO.authorsEn}) · 
          الناشر: <b>${PLS5_COPYRIGHT_INFO.publisher}</b> · 
          التقنين: ${PLS5_COPYRIGHT_INFO.adaptation} · 
          الفئة المستهدفة: ${PLS5_COPYRIGHT_INFO.ageRange}.
        </div>

        <!-- Student & Assessment Info Table -->
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:12px;">
          <tr>
            <td style="padding:4px 8px;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:4px 8px;"><b>العمر الزمني:</b> ${assessment.age || `${Math.floor(studentAgeMonths / 12)} سنة و ${studentAgeMonths % 12} شهر`}</td>
            <td style="padding:4px 8px;"><b>الصف / الفصل:</b> ${assessment.grade || '—'}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;"><b>أخصائي التخاطب:</b> ${assessment.examinerName || assessment.specialistName || '—'}</td>
            <td style="padding:4px 8px;"><b>المرافق / المستجيب:</b> ${assessment.raterName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:4px 8px;"><b>التشخيص:</b> ${assessment.diagnosis || '—'}</td>
          </tr>
        </table>

        <!-- Psychometric Dashboard -->
        <div style="background:#ecfeff;border:1.5px solid #67e8f9;border-radius:8px;padding:12px;margin-bottom:16px;">
          <h3 style="margin:0 0 10px 0;color:#0e7490;font-size:15px;">📊 المؤشرات السيكومترية والنمو اللغوي (PLS-5 Clinical Dashboard)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:12px;">
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #a5f3fc;">
              <span style="color:#64748b;display:block;font-size:11px;">الدرجة المعيارية الكلية (Total SS)</span>
              <span style="font-size:22px;font-weight:900;color:${psychometrics.severityColor};">${psychometrics.totalSS}</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #a5f3fc;">
              <span style="color:#64748b;display:block;font-size:11px;">الرتبة المئينية الكلية (Total PR)</span>
              <span style="font-size:22px;font-weight:900;color:#0e7490;">${psychometrics.totalPR}%</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #a5f3fc;">
              <span style="color:#64748b;display:block;font-size:11px;">العمر اللغوي المكافئ (Total LAE)</span>
              <span style="font-size:18px;font-weight:900;color:#0284c7;">${Math.floor(psychometrics.totalLAEMonths / 12)}س و ${psychometrics.totalLAEMonths % 12}ش</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #a5f3fc;">
              <span style="color:#64748b;display:block;font-size:11px;">فجوة التأخر اللغوي</span>
              <span style="font-size:18px;font-weight:900;color:${psychometrics.totalDelayGapMonths > 0 ? '#dc2626' : '#059669'};">
                ${psychometrics.totalDelayGapMonths > 0 ? psychometrics.totalDelayGapMonths + ' شهراً' : 'طبيعي'}
              </span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #a5f3fc;">
              <span style="color:#64748b;display:block;font-size:11px;">التشخيص والتصنيف</span>
              <span style="font-size:12px;font-weight:bold;color:${psychometrics.severityColor};display:block;margin-top:4px;">
                ${psychometrics.clinicalClassification.split('(')[0]}
              </span>
            </div>
          </div>
        </div>

        <!-- Subtest Comparison Table -->
        <h3 style="color:#0e7490;font-size:14px;margin:16px 0 8px 0;">📋 المقارنة السيكومترية للمقياسين الفرعيين (AC vs EC)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;">
          <thead>
            <tr style="background:#e0f2fe;color:#0369a1;text-align:center;">
              <th style="padding:8px 12px;text-align:right;">المقياس الفرعي (Subtest)</th>
              <th style="padding:8px 12px;">الدرجة الخام</th>
              <th style="padding:8px 12px;">الدرجة المعيارية (SS)</th>
              <th style="padding:8px 12px;">الرتبة المئينية (PR)</th>
              <th style="padding:8px 12px;">العمر اللغوي (LAE)</th>
              <th style="padding:8px 12px;">الخط القاعدي والسقف</th>
            </tr>
          </thead>
          <tbody>
            ${subtestRowsHtml}
          </tbody>
        </table>

        <!-- Clinical Summary & Recommendations -->
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:16px;font-size:12px;">
          <h4 style="margin:0 0 6px 0;color:#0e7490;font-size:13px;">📝 الملخص والتشخيص الإكلينيكي:</h4>
          <p style="margin:0 0 10px 0;line-height:1.6;color:#334155;white-space:pre-wrap;">${assessment.clinicalSummary || 'تم تطبيق المقياس وفق المعايير السيكومترية المقننة.'}</p>
          
          <h4 style="margin:0 0 6px 0;color:#0e7490;font-size:13px;">🎯 التوصيات التأهيلية وبرنامج التدخل (IEP):</h4>
          <p style="margin:0;line-height:1.6;color:#334155;white-space:pre-wrap;">${assessment.recommendations || 'إدراج بنود الضعف المحددة ضمن الخطة التربوية الفردية للتخاطب واللغة.'}</p>
        </div>

        <!-- Recommended IEP Goals Sample -->
        ${recommendedGoals.length > 0 ? `
          <h3 style="color:#0e7490;font-size:14px;margin:16px 0 8px 0;">🎯 عينة الأهداف التأهيلية الموصى بها للخطة الفردية (IEP Goals)</h3>
          ${goalsHtml}
        ` : ''}

        <!-- Item by Item Breakdown -->
        <h3 style="color:#0e7490;font-size:14px;margin:20px 0 8px 0;">📑 سجل استجابات جميع بنود المقياس (80 بنداً)</h3>
        <table style="width:100%;border-collapse:collapse;font-size:11px;">
          <thead>
            <tr style="background:#f1f5f9;color:#475569;text-align:center;">
              <th style="padding:6px 8px;width:60px;">الرمز</th>
              <th style="padding:6px 8px;text-align:right;">نص البند والمهمة التقييمية</th>
              <th style="padding:6px 8px;width:130px;">المجال</th>
              <th style="padding:6px 8px;width:90px;">الفئة النمائية</th>
              <th style="padding:6px 8px;width:80px;">الاستجابة</th>
              <th style="padding:6px 8px;width:120px;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signatures Footer -->
        <div style="margin-top:28px;display:flex;justify-content:space-between;padding:0 20px;font-size:12px;color:#475569;">
          <div style="text-align:center;">
            <div><b>أخصائي التخاطب والنمو اللغوي</b></div>
            <div style="margin-top:25px;color:#94a3b8;">...................................</div>
          </div>
          <div style="text-align:center;">
            <div><b>المشرف الفني / مدير المركز</b></div>
            <div style="margin-top:25px;color:#94a3b8;">...................................</div>
          </div>
          <div style="text-align:center;">
            <div><b>ختم المركز والاعتماد</b></div>
            <div style="margin-top:25px;color:#94a3b8;">[ خـتـم رسـمـي ]</div>
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
          <meta charset="UTF-8">
          <title>تقرير PLS-5 - ${assessment.studentName || 'المفحوص'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 20px; background: #fff; }
            @media print {
              body { padding: 0; }
              @page { size: A4; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
        </html>
      `);
      printWin.document.close();
    }
  }

  // WhatsApp Share Message
  function handleWhatsAppShare() {
    const text = `*🗣️ تقرير مقياس لغة الأطفال - الإصدار الخامس (PLS-5)*
*اسم المفحوص:* ${assessment.studentName || '—'}
*العمر الزمني:* ${assessment.age || `${Math.floor(studentAgeMonths / 12)} سنة و ${studentAgeMonths % 12} شهر`}
*تاريخ التقييم:* ${assessment.date || '—'}
*أخصائي التخاطب:* ${assessment.examinerName || '—'}

*📊 المؤشرات السيكومترية للنمو اللغوي:*
- الدرجة المعيارية الكلية (Total SS): *${psychometrics.totalSS}* (الرتبة المئينية: *${psychometrics.totalPR}%*)
- الفهم السمعي / الاستقبالي (AC SS): *${psychometrics.receptiveSS}* (${psychometrics.receptivePR}%)
- التواصل اللفظي / التعبيري (EC SS): *${psychometrics.expressiveSS}* (${psychometrics.expressivePR}%)
- العمر اللغوي المكافئ (Total LAE): *${Math.floor(psychometrics.totalLAEMonths / 12)}س و ${psychometrics.totalLAEMonths % 12}ش*
- فجوة التأخر اللغوي: *${psychometrics.totalDelayGapMonths > 0 ? psychometrics.totalDelayGapMonths + ' شهراً' : 'لا يوجد تأخر'}*
- التصنيف الإكلينيكي: *${psychometrics.clinicalClassification}*

*💡 التوصيات:* ${assessment.recommendations || 'متابعة الخطة الفردية للتخاطب.'}
— ${center?.name || 'مركز التربية الخاصة والتخاطب'}`;

    sendReportToWhatsApp(text);
  }

  // Filter items for ledger view
  const displayedLedgerItems = allItems.filter(it => {
    if (subtestFilter === 'receptive') return it.subtest === 'receptive';
    if (subtestFilter === 'expressive') return it.subtest === 'expressive';
    return true;
  });

  return (
    <div className="mbg">
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
        }}
      >
        {/* MODAL MAIN HEADER */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)',
            color: '#ffffff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}
            >
              📊
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  تقرير مقياس لغة الأطفال (PLS-5)
                </h2>
                <span
                  style={{
                    background: '#cffafe',
                    color: '#0e7490',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '20px',
                  }}
                >
                  {assessment.studentName || 'المفحوص'}
                </span>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                  }}
                >
                  العمر: {assessment.age || `${Math.floor(studentAgeMonths / 12)}س و${studentAgeMonths % 12}ش`}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', opacity: 0.9, color: '#ecfeff' }}>
                Preschool Language Scale 5th Edition — التقرير الإكلينيكي المعتمد
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handlePrint}
              style={{
                background: '#ffffff',
                color: '#0e7490',
                fontWeight: 800,
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>🖨️</span>
              <span>طباعة التقرير</span>
            </button>

            <button
              type="button"
              className="btn btn-sm"
              onClick={handleWhatsAppShare}
              style={{
                background: '#25d366',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>📲</span>
              <span>مشاركة واتساب</span>
            </button>

            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setBridgeOpen(true)}
              style={{
                background: '#f59e0b',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>🌉</span>
              <span>تصدير للخطة الفردية (IEP)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: 'none',
                color: '#ffffff',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* NAVIGATION VIEW TABS */}
        <div
          style={{
            background: 'var(--g0)',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveViewTab('dashboard')}
            style={{
              background: activeViewTab === 'dashboard' ? '#0891b2' : 'var(--bg-card)',
              color: activeViewTab === 'dashboard' ? '#ffffff' : 'var(--text-main)',
              border: `1px solid ${activeViewTab === 'dashboard' ? '#0891b2' : 'var(--border-color)'}`,
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>📊</span>
            <span>لوحة المؤشرات والتشخيص</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('subtests')}
            style={{
              background: activeViewTab === 'subtests' ? '#0891b2' : 'var(--bg-card)',
              color: activeViewTab === 'subtests' ? '#ffffff' : 'var(--text-main)',
              border: `1px solid ${activeViewTab === 'subtests' ? '#0891b2' : 'var(--border-color)'}`,
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>📈</span>
            <span>المقارنة النمائية (AC vs EC)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('items')}
            style={{
              background: activeViewTab === 'items' ? '#0891b2' : 'var(--bg-card)',
              color: activeViewTab === 'items' ? '#ffffff' : 'var(--text-main)',
              border: `1px solid ${activeViewTab === 'items' ? '#0891b2' : 'var(--border-color)'}`,
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>📑</span>
            <span>سجل استجابات البنود (80)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('goals')}
            style={{
              background: activeViewTab === 'goals' ? '#0891b2' : 'var(--bg-card)',
              color: activeViewTab === 'goals' ? '#ffffff' : 'var(--text-main)',
              border: `1px solid ${activeViewTab === 'goals' ? '#0891b2' : 'var(--border-color)'}`,
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🎯</span>
            <span>أهداف الخطة الفردية ({recommendedGoals.length})</span>
          </button>
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px 22px',
            background: 'var(--g0)',
          }}
        >
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeViewTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* KEY PSYCHOMETRIC METRIC CARDS */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                }}
              >
                {/* Total Language Score */}
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '14px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block' }}>
                    الدرجة المعيارية الكلية المركبة
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: psychometrics.severityColor, margin: '4px 0' }}>
                    {psychometrics.totalSS}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                    الرتبة المئينية: <b>{psychometrics.totalPR}%</b>
                  </span>
                </div>

                {/* Auditory Comprehension Score */}
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '14px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: '#0e7490', fontWeight: 700, display: 'block' }}>
                    الفهم السمعي (الاستقبالي AC)
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0e7490', margin: '4px 0' }}>
                    {psychometrics.receptiveSS}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                    الخام: {psychometrics.receptiveRawScore}/40 · مئيني: <b>{psychometrics.receptivePR}%</b>
                  </span>
                </div>

                {/* Expressive Communication Score */}
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '14px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 700, display: 'block' }}>
                    التواصل اللفظي (التعبيري EC)
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0284c7', margin: '4px 0' }}>
                    {psychometrics.expressiveSS}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                    الخام: {psychometrics.expressiveRawScore}/40 · مئيني: <b>{psychometrics.expressivePR}%</b>
                  </span>
                </div>

                {/* Developmental Age Equivalent */}
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '14px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block' }}>
                    العمر اللغوي المكافئ (LAE)
                  </span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', margin: '8px 0' }}>
                    {Math.floor(psychometrics.totalLAEMonths / 12)}س و {psychometrics.totalLAEMonths % 12}ش
                  </div>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: psychometrics.totalDelayGapMonths > 0 ? '#dc2626' : '#059669',
                    }}
                  >
                    {psychometrics.totalDelayGapMonths > 0 ? `تأخر قدره ${psychometrics.totalDelayGapMonths} شهراً` : 'مطابق للعمر الزمني'}
                  </span>
                </div>
              </div>

              {/* DIAGNOSTIC CLASSIFICATION BANNER */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: `2px solid ${psychometrics.severityColor}`,
                  borderRadius: 12,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)', display: 'block' }}>
                    التشخيص والتصنيف الإكلينيكي المعتمد:
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: psychometrics.severityColor }}>
                    {psychometrics.clinicalClassification}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>
                  {psychometrics.cutoffText}
                </div>
              </div>

              {/* CLINICAL SUMMARY & RECOMMENDATIONS CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '16px',
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#0891b2', fontWeight: 800 }}>
                    📝 الملخص الإكلينيكي والتشخيصي
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                    {assessment.clinicalSummary || 'لا يوجد ملخص مدخل.'}
                  </p>
                </div>

                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '16px',
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#0891b2', fontWeight: 800 }}>
                    🎯 التوصيات التأهيلية الموجهة للتدخل
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                    {assessment.recommendations || 'لا توجد توصيات مدخلة.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBTEST COMPARISON (AC vs EC) */}
          {activeViewTab === 'subtests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: '16px',
                }}
              >
                <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', color: '#0891b2', fontWeight: 800 }}>
                  ⚖️ التحليل والمقارنة بين الفهم السمعي (الاستقبالي) والتواصل اللفظي (التعبيري)
                </h3>

                {/* Visual Progress Comparison Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Receptive Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#0e7490' }}>الفهم السمعي (اللغة الاستقبالية AC)</span>
                      <span>
                        <b>{psychometrics.receptiveRawScore}</b> / 40 بنداً ({psychometrics.receptivePercentage}%) · SS: <b>{psychometrics.receptiveSS}</b>
                      </span>
                    </div>
                    <div style={{ height: 10, background: 'var(--g0)', borderRadius: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${psychometrics.receptivePercentage}%`,
                          background: 'linear-gradient(90deg, #0e7490, #06b6d4)',
                          borderRadius: 6,
                          transition: 'width 0.4s',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: 2 }}>
                      <span>العمر المكافئ: {Math.floor(psychometrics.receptiveLAEMonths / 12)}س و {psychometrics.receptiveLAEMonths % 12}ش</span>
                      <span>
                        {psychometrics.receptiveDelayGapMonths > 0 ? `تأخر استقبالي: ${psychometrics.receptiveDelayGapMonths} شهراً` : 'أداء استقبالي طبيعي ✓'}
                      </span>
                    </div>
                  </div>

                  {/* Expressive Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#0284c7' }}>التواصل اللفظي (اللغة التعبيرية EC)</span>
                      <span>
                        <b>{psychometrics.expressiveRawScore}</b> / 40 بنداً ({psychometrics.expressivePercentage}%) · SS: <b>{psychometrics.expressiveSS}</b>
                      </span>
                    </div>
                    <div style={{ height: 10, background: 'var(--g0)', borderRadius: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${psychometrics.expressivePercentage}%`,
                          background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                          borderRadius: 6,
                          transition: 'width 0.4s',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: 2 }}>
                      <span>العمر المكافئ: {Math.floor(psychometrics.expressiveLAEMonths / 12)}س و {psychometrics.expressiveLAEMonths % 12}ش</span>
                      <span>
                        {psychometrics.expressiveDelayGapMonths > 0 ? `تأخر تعبيري: ${psychometrics.expressiveDelayGapMonths} شهراً` : 'أداء تعبيري طبيعي ✓'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtest Detailed Table */}
                <div style={{ marginTop: 20, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--g0)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>المقياس الفرعي</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>الدرجة الخام</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>الدرجة المعيارية (SS)</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>الرتبة المئينية (PR)</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>العمر اللغوي (LAE)</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>الخط القاعدي والسقف</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0e7490' }}>
                          الفهم السمعي (الاستقبالي AC)
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{psychometrics.receptiveRawScore} / 40</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#0e7490' }}>
                          {psychometrics.receptiveSS}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                          {psychometrics.receptivePR}%
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {Math.floor(psychometrics.receptiveLAEMonths / 12)}س و {psychometrics.receptiveLAEMonths % 12}ش
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.78rem' }}>
                          {psychometrics.receptiveBasalIndex !== -1 ? (
                            <span style={{ color: '#059669', fontWeight: 700 }}>✓ خط قاعدي: بند {psychometrics.receptiveBasalIndex + 1}</span>
                          ) : (
                            <span style={{ color: 'var(--text-sub)' }}>—</span>
                          )}
                          {psychometrics.receptiveCeilingIndex !== -1 && (
                            <div style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ سقف: بند {psychometrics.receptiveCeilingIndex + 6}</div>
                          )}
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0284c7' }}>
                          التواصل اللفظي (التعبيري EC)
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{psychometrics.expressiveRawScore} / 40</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>
                          {psychometrics.expressiveSS}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                          {psychometrics.expressivePR}%
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {Math.floor(psychometrics.expressiveLAEMonths / 12)}س و {psychometrics.expressiveLAEMonths % 12}ش
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.78rem' }}>
                          {psychometrics.expressiveBasalIndex !== -1 ? (
                            <span style={{ color: '#059669', fontWeight: 700 }}>✓ خط قاعدي: بند {psychometrics.expressiveBasalIndex + 1}</span>
                          ) : (
                            <span style={{ color: 'var(--text-sub)' }}>—</span>
                          )}
                          {psychometrics.expressiveCeilingIndex !== -1 && (
                            <div style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ سقف: بند {psychometrics.expressiveCeilingIndex + 6}</div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FULL ITEMS LEDGER */}
          {activeViewTab === 'items' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Filter Subtest Filter Bar */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)' }}>تصفية البنود:</span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setSubtestFilter('all')}
                  style={{
                    background: subtestFilter === 'all' ? '#0891b2' : 'var(--bg-card)',
                    color: subtestFilter === 'all' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.76rem',
                  }}
                >
                  الكل (80)
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setSubtestFilter('receptive')}
                  style={{
                    background: subtestFilter === 'receptive' ? '#0891b2' : 'var(--bg-card)',
                    color: subtestFilter === 'receptive' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.76rem',
                  }}
                >
                  🎧 الاستقبالي فقط (40)
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setSubtestFilter('expressive')}
                  style={{
                    background: subtestFilter === 'expressive' ? '#0891b2' : 'var(--bg-card)',
                    color: subtestFilter === 'expressive' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.76rem',
                  }}
                >
                  💬 التعبيري فقط (40)
                </button>
              </div>

              {/* Items Table */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: 70 }}>الرمز</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>نص البند والمهمة التقييمية</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: 140 }}>المجال اللغوي</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: 110 }}>المرحلة النمائية</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: 110 }}>الاستجابة</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', width: 160 }}>ملاحظات الفاحص</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedLedgerItems.map(it => {
                      const resp = assessment.scores?.[it.key] !== undefined ? assessment.scores[it.key] : assessment.results?.[it.key];
                      const isCorrect = resp === 1 || resp === true || resp === '1';
                      const isFailed = resp === 0 || resp === false || resp === '0';
                      const note = assessment.itemNotes?.[it.key] || '';

                      return (
                        <tr
                          key={it.key}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: isFailed ? 'rgba(239, 68, 68, 0.06)' : isCorrect ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: 'var(--text-sub)' }}>
                            {it.subtest === 'receptive' ? `AC-${it.id}` : `EC-${it.id}`}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {it.text}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.74rem', color: '#0891b2' }}>
                            {it.domain}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                            {it.ageGroup}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {isCorrect ? (
                              <span
                                style={{
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  fontWeight: 800,
                                  fontSize: '0.76rem',
                                  border: '1px solid #a7f3d0',
                                }}
                              >
                                1 - متقن
                              </span>
                            ) : isFailed ? (
                              <span
                                style={{
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  fontWeight: 800,
                                  fontSize: '0.76rem',
                                  border: '1px solid #fecaca',
                                }}
                              >
                                0 - غير متقن
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-sub)', fontSize: '0.76rem' }}>— لم يقيم</span>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: '0.76rem', color: 'var(--text-sub)' }}>
                            {note || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RECOMMENDED IEP GOALS */}
          {activeViewTab === 'goals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.96rem', color: '#0891b2', fontWeight: 800 }}>
                    🎯 بنود الضعف المستخرجة والأهداف التأهيلية الموصى بها ({recommendedGoals.length})
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                    أهداف سلوكية وإجرائية مقننة جاهزة للإدراج المباشر في الخطة التربوية الفردية (IEP)
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setBridgeOpen(true)}
                  style={{
                    background: '#f59e0b',
                    borderColor: '#f59e0b',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                >
                  🌉 تصدير الأهداف للخطة الفردية الآن
                </button>
              </div>

              {recommendedGoals.length === 0 ? (
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '30px',
                    textAlign: 'center',
                    color: 'var(--text-sub)',
                  }}
                >
                  ✨ لا توجد بنود إخفاق مسجلة! حقق الطفل درجات إتقان كاملة في البنود المقيمة.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recommendedGoals.map((goal, idx) => (
                    <div
                      key={goal.id || idx}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 12,
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              background: '#0891b2',
                              color: '#ffffff',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 6,
                            }}
                          >
                            {goal.code}
                          </span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {goal.title}
                          </span>
                        </div>
                        <span
                          style={{
                            background: goal.priority === 'critical' ? '#fef2f2' : '#fffbeb',
                            color: goal.priority === 'critical' ? '#dc2626' : '#d97706',
                            border: `1px solid ${goal.priority === 'critical' ? '#fecaca' : '#fde68a'}`,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 12,
                          }}
                        >
                          {goal.priority === 'critical' ? 'أولوية قصوى' : 'أولوية متوسطة'}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        <b>الهدف:</b> {goal.text}
                      </p>

                      <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)', marginTop: 2 }}>
                        <b>معيار الإتقان:</b> {goal.mastery} · <b>السبب:</b> {goal.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div
          className="fa"
          style={{
            background: 'var(--g0)',
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
            جلسة التقييم: <b>{assessment.date || '—'}</b> · الفاحص: <b>{assessment.examinerName || '—'}</b>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  onEdit(assessment);
                  onClose();
                }}
                style={{
                  fontSize: '0.82rem',
                  padding: '6px 14px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                }}
              >
                ✏️ تعديل التقييم
              </button>
            )}

            <button
              type="button"
              className="btn btn-sm"
              onClick={onClose}
              style={{
                fontSize: '0.82rem',
                padding: '6px 18px',
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* IEP BRIDGE MODAL */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          student={assessment}
          sourceAssessment={assessment}
          preloadedGoals={recommendedGoals}
        />
      )}
    </div>
  );
}
