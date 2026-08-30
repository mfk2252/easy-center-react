import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CARS2_ITEMS,
  CARS2_DOMAINS,
  CARS2_COPYRIGHT_INFO,
  calculateCARS2Psychometrics,
} from '../../data/cars2Data';
import { printItem } from '../../utils/printUtils';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function CARS2ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateCARS2Psychometrics(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'cars',
      assessment.results || assessment.scores || {},
      CARS2_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const domainHtml = psychometrics.domainScores.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#1e40af;">${d.name}</td>
        <td style="padding:8px 12px;text-align:center;">${d.score} / ${d.maxScore}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#1e40af;">${d.avg} / 4.0</td>
        <td style="padding:8px 12px;text-align:center;font-weight:600;">${d.percentage}%</td>
        <td style="padding:8px 12px;text-align:center;font-size:12px;">
          ${d.avg >= 3.0
            ? '<span style="color:#dc2626;font-weight:bold;">تأثر شديد</span>'
            : d.avg >= 2.0
            ? '<span style="color:#d97706;font-weight:bold;">تأثر متوسط</span>'
            : d.avg >= 1.5
            ? '<span style="color:#2563eb;font-weight:bold;">تأثر بسيط</span>'
            : '<span style="color:#16a34a;font-weight:bold;">طبيعي</span>'}
        </td>
      </tr>
    `).join('');

    const itemsHtml = CARS2_ITEMS.map(it => {
      const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
      const anchor = it.anchors.find(a => a.score === score);
      const note = assessment.itemNotes?.[it.id] || '';

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${score && score >= 3 ? '#fef2f2' : score && score >= 2 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:8px 10px;text-align:center;font-weight:bold;color:#1e40af;">${it.id}</td>
          <td style="padding:8px 10px;font-weight:bold;font-size:12px;">
            ${it.title}
            <div style="font-size:10px;color:#64748b;font-weight:normal;">${it.subtitle}</div>
          </td>
          <td style="padding:8px 10px;text-align:center;font-weight:bold;font-size:1.1em;color:${score >= 3 ? '#dc2626' : score >= 2 ? '#d97706' : '#16a34a'};">
            ${score !== null ? score.toFixed(1) : '—'}
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
        <div style="border-bottom:3px solid #1e40af;padding-bottom:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#1e40af;font-size:22px;margin:0 0 4px 0;">🧩 تقرير التقييم والتشخيص النفسي الإكلينيكي (CARS-2)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">Childhood Autism Rating Scale, 2nd Edition · مقياس تقدير التوحد في الطفولة — النسخة القياسية</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>المركز:</b> ${center?.name || 'مركز التربية الخاصة والتأهيل'}</div>
          </div>
        </div>

        <!-- COPYRIGHT NOTICE BOX -->
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#1e40af;line-height:1.5;">
          <b>⚖️ إشعار حقوق الملكية الفكرية والاعتماد العلمي:</b> مقياس تقدير التوحد في الطفولة — الإصدار الثاني (CARS-2) · 
          تأليف: <b>${CARS2_COPYRIGHT_INFO.authorsAr}</b> · 
          الناشر: <b>${CARS2_COPYRIGHT_INFO.publisherAr} (${CARS2_COPYRIGHT_INFO.publisherEn})</b> · 
          الفئة المستهدفة: ${CARS2_COPYRIGHT_INFO.targetAge} · 
          المعيار الذهبي المعتمد لتشخيص اضطراب طيف التوحد وتحديد شدة الأعراض وفق معايير DSM-5 و ICD-11.
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
          <h3 style="margin:0 0 10px 0;color:#1e40af;font-size:15px;">📊 المؤشرات السيكومترية والدرجات المعيارية (Psychometric Indices)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:12px;">
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">الدرجة الخام الكلية</span>
              <span style="font-size:22px;font-weight:900;color:#1e40af;">${psychometrics.rawScore} <small style="font-size:11px;color:#64748b;">/ 60.0</small></span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">الدرجة التائية (T-Score)</span>
              <span style="font-size:22px;font-weight:900;color:#0f172a;">T = ${psychometrics.tScore}</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">الرتبة المئينية (% Rank)</span>
              <span style="font-size:22px;font-weight:900;color:#0f172a;">${psychometrics.percentile}%</span>
            </div>
            <div style="background:#fff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <span style="color:#64748b;display:block;font-size:11px;">التصنيف التشخيصي المعتمد</span>
              <span style="font-size:13px;font-weight:bold;color:${psychometrics.severityColor};display:block;margin-top:4px;">${psychometrics.severityLabel}</span>
            </div>
          </div>
        </div>

        <!-- Domains Table -->
        <h3 style="color:#1e40af;font-size:14px;margin:14px 0 8px 0;">🌐 توزيع درجات الأداء عبر المجالات النمائية الأربعة:</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;border:1px solid #cbd5e1;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:8px 12px;text-align:right;">المجال النمائي</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة المحققة</th>
              <th style="padding:8px 12px;text-align:center;">متوسط البند (1-4)</th>
              <th style="padding:8px 12px;text-align:center;">نسبة التأثر</th>
              <th style="padding:8px 12px;text-align:center;">مستوى التأثر</th>
            </tr>
          </thead>
          <tbody>
            ${domainHtml}
          </tbody>
        </table>

        <!-- Detailed Items Table -->
        <h3 style="color:#1e40af;font-size:14px;margin:14px 0 8px 0;">📋 التقدير التفصيلي لبنود المقياس الـ 15 وأوصاف السلوك:</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:11px;border:1px solid #cbd5e1;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:6px 8px;text-align:center;width:30px;">#</th>
              <th style="padding:6px 8px;text-align:right;width:150px;">البند السلوكي</th>
              <th style="padding:6px 8px;text-align:center;width:60px;">الدرجة</th>
              <th style="padding:6px 8px;text-align:right;">الوصف السلوكي الإكلينيكي المسجل</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Clinical Impressions & Recommendations -->
        <div style="margin-bottom:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;font-size:12px;line-height:1.6;">
          <h3 style="margin:0 0 6px 0;color:#1e40af;font-size:14px;">📝 الخلاصة التشخيصية والملاحظة الإكلينيكية:</h3>
          <div style="white-space:pre-wrap;color:#334155;">${assessment.clinicalSummary || psychometrics.clinicalImpression}</div>
        </div>

        <div style="margin-bottom:20px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;font-size:12px;line-height:1.6;">
          <h3 style="margin:0 0 6px 0;color:#1e40af;font-size:14px;">🎯 التوصيات العلاجية والتربوية الفردية:</h3>
          <div style="white-space:pre-wrap;color:#334155;">${assessment.recommendations || 'يوصى بتطبيق الخطة التربوية الفردية المبنية على نتائج التقييم وجلسات التدخل المتخصصة.'}</div>
        </div>

        <!-- Signatures -->
        <div style="display:flex;justify-content:space-between;margin-top:24px;padding-top:12px;border-top:1px solid #cbd5e1;font-size:12px;">
          <div style="text-align:center;">
            <div><b>الأخصائي النفسي الفاحص:</b></div>
            <div style="margin-top:24px;color:#64748b;">${assessment.examinerName || assessment.specialistName || '................................'}</div>
          </div>
          <div style="text-align:center;">
            <div><b>المشرف الفني / الإكلينيكي:</b></div>
            <div style="margin-top:24px;color:#64748b;">................................</div>
          </div>
          <div style="text-align:center;">
            <div><b>مدير المركز / الختم الرسمي:</b></div>
            <div style="margin-top:24px;color:#64748b;">................................</div>
          </div>
        </div>
      </div>
    `;

    printItem(`تقرير مقياس CARS-2 - ${assessment.studentName || 'الطالب'}`, html);
  }

  function handleWhatsAppShare() {
    const text = `*تقرير التقييم والتشخيص النفسي الإكلينيكي بمقياس CARS-2*\n\n` +
      `*اسم المفحوص:* ${assessment.studentName || '—'}\n` +
      `*العمر الزمني:* ${assessment.age || '—'}\n` +
      `*تاريخ الفحص:* ${assessment.date || '—'}\n\n` +
      `*النتائج السيكومترية الأساسية:*\n` +
      `• الدرجة الخام الكلية: *${psychometrics.rawScore} من 60.0*\n` +
      `• الدرجة التائية المعيارية: *T = ${psychometrics.tScore}*\n` +
      `• الرتبة المئينية: *${psychometrics.percentile}%*\n` +
      `• التصنيف التشخيصي: *${psychometrics.severityLabel}*\n\n` +
      `*الخلاصة الإكلينيكية:*\n${assessment.clinicalSummary || psychometrics.clinicalImpression}\n\n` +
      `*المركز:* ${center?.name || 'مركز التربية الخاصة'}`;

    sendReportToWhatsApp(assessment.parentPhone || '', text);
  }

  return (
    <div className="mbg">
      <div
        className="mb"
        style={{
          maxWidth: 'min(1100px, calc(100vw - 24px))',
          width: '100%',
        }}
      >
        {/* Modal Main Header */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.6rem' }}>🧩</span>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                تقرير التقييم والتشخيص الإكلينيكي — مقياس CARS-2
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', opacity: 0.9 }}>
                Childhood Autism Rating Scale, 2nd Edition · التقرير السيكومتري الشامل
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handlePrint}
              style={{ background: '#fff', color: '#1e40af', fontWeight: 800, border: 'none' }}
            >
              🖨️ طباعة التقرير الرسمي
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleWhatsAppShare}
              style={{ background: '#25d366', color: '#fff', fontWeight: 700, border: 'none' }}
            >
              📱 واتساب
            </button>
            {onEdit && (
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => { onClose(); onEdit(assessment); }}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700 }}
              >
                ✏️ تعديل الدرجات
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setBridgeOpen(true)}
              style={{ background: '#f59e0b', color: '#fff', fontWeight: 800, border: 'none' }}
            >
              🎯 اشتقاق الخطة الفردية (IEP)
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

        {/* Modal Scrollable Body */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1, maxHeight: 'calc(88vh - 80px)' }}>

          {/* Official Header Badge */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 10,
              padding: '10px 16px',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: '0.8rem',
              color: '#1e40af',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>⚖️</span>
              <div>
                <strong>الاعتماد العلمي والأمانة المهنية:</strong> مقياس تقدير التوحد في الطفولة (CARS-2) · تأليف: د. إريك شوبلر، د. روبرت رايشلر، د. باربرا روتشن رينر · الناشر الرسمي: Western Psychological Services (WPS).
              </div>
            </div>
            <span className="bdg b-bl" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
              المعيار الذهبي المعتمد
            </span>
          </div>

          {/* Student & Examiner Info Table */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '12px 18px',
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.76rem', display: 'block' }}>اسم المفحوص:</span>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{assessment.studentName || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.76rem', display: 'block' }}>العمر الزمني:</span>
                <strong>{assessment.age || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.76rem', display: 'block' }}>تاريخ الفحص والملاحظة:</span>
                <strong>{assessment.date || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.76rem', display: 'block' }}>الأخصائي الفاحص الملاحظ:</span>
                <strong>{assessment.examinerName || assessment.specialistName || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.76rem', display: 'block' }}>مصدر المعلومات / الملاحظ:</span>
                <strong>{assessment.raterName || '—'} {assessment.raterRelation ? `(${assessment.raterRelation})` : ''}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.76rem', display: 'block' }}>التشخيص الأولي المسجل:</span>
                <strong>{assessment.diagnosis || '—'}</strong>
              </div>
            </div>
          </div>

          {/* Psychometric Index Dashboard Cards */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              border: '1.5px solid #bfdbfe',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 20,
              boxShadow: '0 2px 8px rgba(37,99,235,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📊</span> نتائج المؤشرات السيكومترية ومستوى شدة الأعراض (CARS-2 Psychometrics)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الخام الكلية:</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e40af', lineHeight: 1.2, margin: '4px 0' }}>
                  {psychometrics.rawScore} <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600 }}>/ 60.0</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>المدى النظري (15 - 60)</span>
              </div>

              <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة التائية المعيارية:</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, margin: '4px 0' }}>
                  T = {psychometrics.tScore}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>المتوسط 50 ± 10</span>
              </div>

              <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'block' }}>الرتبة المئينية (% Rank):</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, margin: '4px 0' }}>
                  {psychometrics.percentile}%
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>مقارنة بعينة التقنين</span>
              </div>

              <div style={{ background: '#fff', border: `2px solid ${psychometrics.severityColor}`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'block' }}>التصنيف التشخيصي المعتمد:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: psychometrics.severityColor, marginTop: 6, lineHeight: 1.3 }}>
                  {psychometrics.severityLabel}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Developmental Domains Breakdown Table */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🌐</span> مظهر الأداء السلوكي عبر المجالات الأربعة:
            </h3>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>المجال السلوكي النمائي</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>الدرجة المحققة</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>متوسط البند (1-4)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>مؤشر التأثر</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>التقييم النوعي</th>
                  </tr>
                </thead>
                <tbody>
                  {psychometrics.domainScores.map((d, i) => (
                    <tr key={d.id} style={{ borderBottom: i < psychometrics.domainScores.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: d.color }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block', marginLeft: 8 }} />
                        {d.name}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>
                        {d.score} <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>/ {d.maxScore}</span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#1e40af' }}>
                        {d.avg} / 4.0
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                          <div style={{ width: 80, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${d.percentage}%`, height: '100%', background: d.color }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{d.percentage}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span
                          className={`bdg ${
                            d.avg >= 3.0 ? 'b-re' : d.avg >= 2.0 ? 'b-or' : d.avg >= 1.5 ? 'b-bl' : 'b-gr'
                          }`}
                          style={{ fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          {d.avg >= 3.0 ? 'تأثر شديد' : d.avg >= 2.0 ? 'تأثر متوسط' : d.avg >= 1.5 ? 'تأثر بسيط' : 'طبيعي'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Cutoffs Matrix */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: '0.8rem',
            }}
          >
            <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: 6 }}>
              📌 الدلالة الإكلينيكية ومعايير القطع التشخيصية لمقياس CARS-2:
            </strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
              <div style={{ background: '#dcfce7', padding: '6px 10px', borderRadius: 6, color: '#15803d', border: '1px solid #86efac' }}>
                <strong>الدرجة 15 - 29.5:</strong> الحد الطبيعي (لا تقع ضمن طيف التوحد)
              </div>
              <div style={{ background: '#fef3c7', padding: '6px 10px', borderRadius: 6, color: '#b45309', border: '1px solid #fde68a' }}>
                <strong>الدرجة 30.0 - 36.5:</strong> أعراض طيف توحد بسيطة إلى متوسطة
              </div>
              <div style={{ background: '#fee2e2', padding: '6px 10px', borderRadius: 6, color: '#b91c1c', border: '1px solid #fca5a5' }}>
                <strong>الدرجة 37.0 - 60.0:</strong> أعراض طيف توحد شديدة / حادة
              </div>
            </div>
          </div>

          {/* Detailed 15 Items Ratings Table */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📋</span> الاستجابات الملاحظية التفصيلية للبنود الـ 15:
            </h3>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: 40 }}>#</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', width: 220 }}>البند السلوكي</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: 70 }}>الدرجة</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>التوصيف الإكلينيكي والملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {CARS2_ITEMS.map((item, idx) => {
                    const score = assessment.results?.[item.id] !== undefined ? Number(assessment.results[item.id]) : null;
                    const anchor = item.anchors.find(a => a.score === score);
                    const note = assessment.itemNotes?.[item.id] || '';

                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: idx < CARS2_ITEMS.length - 1 ? '1px solid var(--border-color)' : 'none',
                          background: score && score >= 3.0 ? 'rgba(239, 68, 68, 0.04)' : score && score >= 2.0 ? 'rgba(245, 158, 11, 0.03)' : undefined,
                        }}
                      >
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800, color: '#1e40af' }}>
                          {item.id}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>
                          {item.title}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 400 }}>{item.subtitle}</div>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span
                            className={`bdg ${
                              score >= 3.0 ? 'b-re' : score >= 2.0 ? 'b-or' : 'b-gr'
                            }`}
                            style={{ fontWeight: 800, fontSize: '0.78rem' }}
                          >
                            {score !== null ? score.toFixed(1) : '—'}
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
                            <div style={{ marginTop: 4, background: 'var(--g0)', padding: '4px 8px', borderRadius: 4, fontSize: '0.74rem', color: '#334155' }}>
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

          {/* Clinical Summary & Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 18px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#1e40af' }}>
                📝 الخلاصة التشخيصية والملاحظة الإكلينيكية:
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {assessment.clinicalSummary || psychometrics.clinicalImpression}
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 18px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#1e40af' }}>
                🎯 التوصيات العلاجية والتربوية الفردية:
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {assessment.recommendations || 'يوصى بتطبيق التدخلات السلوكية المتخصصة واشتقاق الخطة التربوية الفردية.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer */}
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
              className="btn btn-pr"
              onClick={handlePrint}
              style={{ background: '#1e40af', fontWeight: 800 }}
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

      {/* IEP Bridge Modal Integration */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleItems={CARS2_ITEMS}
          scaleType="cars"
        />
      )}
    </div>
  );
}
