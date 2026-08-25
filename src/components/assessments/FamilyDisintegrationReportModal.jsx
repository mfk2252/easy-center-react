import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FAMILY_DISINTEGRATION_ITEMS,
  FAMILY_DISINTEGRATION_DOMAINS,
  calculateFamilyDisintegrationScore,
} from '../../data/familyDisintegrationData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function FamilyDisintegrationReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const results = useMemo(() => {
    if (!assessment) return null;
    return calculateFamilyDisintegrationScore(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'family_disintegration',
      assessment.results || assessment.scores || {},
      FAMILY_DISINTEGRATION_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !results) return null;

  function handlePrint() {
    const subscaleHtml = results.subscales.map(s => `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:10px 12px;font-weight:bold;color:${s.color};">${s.name}</td>
        <td style="padding:10px 12px;text-align:center;">${s.raw} / ${s.maxRaw}</td>
        <td style="padding:10px 12px;text-align:center;font-weight:bold;color:${s.color};">${s.percentage}%</td>
        <td style="padding:10px 12px;text-align:center;">
          <span style="
            padding:3px 8px;
            border-radius:4px;
            font-size:0.85em;
            font-weight:bold;
            background:${s.level === 'طبيعي' ? '#ecfdf5' : s.level === 'تفكك طفيف' ? '#eff6ff' : s.level === 'تفكك ملحوظ' ? 'var(--bg-card)beb' : '#fee2e2'};
            color:${s.level === 'طبيعي' ? '#047857' : s.level === 'تفكك طفيف' ? '#0369a1' : s.level === 'تفكك ملحوظ' ? '#b45309' : '#b91c1c'};
          ">
            ${s.level}
          </span>
        </td>
      </tr>
    `).join('');

    const itemsHtml = results.itemDetails.map(it => {
      const isDef = it.isDeficient;
      const domMeta = FAMILY_DISINTEGRATION_DOMAINS.find(d => d.id === it.domainId);
      const note = assessment.itemNotes?.[it.id] || '';

      return `
        <tr style="border-bottom:1px solid var(--border-color);background:${isDef ? '#fee2e2' : it.calculatedScore >= 3 ? 'var(--bg-card)beb' : 'var(--bg-card)'};">
          <td style="padding:8px 10px;text-align:center;font-weight:bold;">${it.num}</td>
          <td style="padding:8px 10px;">${it.text}</td>
          <td style="padding:8px 10px;font-size:0.85em;color:var(--text-sub);">${domMeta?.name || ''}</td>
          <td style="padding:8px 10px;text-align:center;font-weight:bold;color:${isDef ? '#b91c1c' : 'var(--text-main)'};">
            ${it.calculatedScore ?? '-'} / 5
          </td>
          <td style="padding:8px 10px;text-align:center;">
            <span style="
              padding:2px 6px;
              border-radius:4px;
              font-size:0.8em;
              font-weight:bold;
              background:${isDef ? '#f87171' : 'var(--border-color)'};
              color:${isDef ? 'var(--bg-card)' : 'var(--text-main)'};
            ">
              ${isDef ? 'تفكك/خطر' : it.calculatedScore >= 3 ? 'متوسط' : 'تماسك سليم'}
            </span>
          </td>
          <td style="padding:8px 10px;font-size:0.82em;color:var(--text-sub);">${note || '-'}</td>
        </tr>
      `;
    }).join('');

    const recsHtml = results.recommendations.map(r => `
      <li style="margin-bottom:6px;color:var(--text-main);line-height:1.5;">${r}</li>
    `).join('');

    const printHtml = `
      <div style="direction:rtl;text-align:right;font-family:system-ui, -apple-system, sans-serif;padding:20px;color:var(--text-main);">
        <!-- Header -->
        <div style="border-bottom:2px solid #7c3aed;padding-bottom:12px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#6d28d9;margin:0 0 6px 0;font-size:1.6rem;">${center?.name || 'مركز التأهيل والرعاية المتخصصة'}</h1>
            <h2 style="color:var(--text-main);margin:0;font-size:1.2rem;">تقرير تشخيص وتقييم مقياس التفكك الأسري</h2>
            <div style="font-size:0.85rem;color:var(--text-sub);margin-top:4px;">مقياس تشخيصي مقنن للبيئة والمناخ الأسري · 26 فقرة</div>
          </div>
          <div style="text-align:left;">
            <div style="font-size:0.9rem;font-weight:bold;color:#6d28d9;">تاريخ التقرير: ${assessment.date || ''}</div>
            <div style="font-size:0.85rem;color:var(--text-sub);">الرقم المرجعي: ${assessment.id?.slice(0, 8) || ''}</div>
          </div>
        </div>

        <!-- Student Info Card -->
        <div style="background:var(--bg-input);border:1px solid var(--border-color);border-radius:8px;padding:14px 18px;margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
          <div><strong>اسم المفحوص:</strong> ${assessment.studentName || '-'}</div>
          <div><strong>العمر / تاريخ الميلاد:</strong> ${assessment.age || '-'} / ${assessment.dob || '-'}</div>
          <div><strong>الصف / المرحلة:</strong> ${assessment.grade || assessment.className || '-'}</div>
          <div><strong>مصدر التقرير (الطرف المجيب):</strong> ${assessment.raterRelation || 'المفحوص ذاتياً'}</div>
          <div><strong>الأخصائي الفاحص:</strong> ${assessment.examinerName || '-'} (${assessment.examinerRole || 'أخصائي نفسي'})</div>
          <div><strong>المدرسة / المركز:</strong> ${assessment.school || center?.name || '-'}</div>
        </div>

        <!-- Psychometric Summary Banner -->
        <div style="background:linear-gradient(135deg, #f5f3ff, #ede9fe);border:2px solid #7c3aed;border-radius:10px;padding:16px;margin-bottom:20px;display:flex;justify-content:space-around;align-items:center;text-align:center;">
          <div>
            <div style="font-size:0.85rem;color:#6d28d9;font-weight:bold;">الدرجة الكلية الخام</div>
            <div style="font-size:1.8rem;font-weight:900;color:${results.severityColor};">${results.totalRawScore} <span style="font-size:0.9rem;color:var(--text-sub);">/ ${results.maxPossible}</span></div>
            <div style="font-size:0.75rem;color:var(--text-sub);">المدى (26 - 130)</div>
          </div>
          <div>
            <div style="font-size:0.85rem;color:#6d28d9;font-weight:bold;">المتوسط الفرضي للمقياس</div>
            <div style="font-size:1.6rem;font-weight:800;color:var(--text-main);">${results.theoreticalMean}</div>
            <div style="font-size:0.75rem;color:var(--text-sub);">نقطة التوازن المعياري</div>
          </div>
          <div>
            <div style="font-size:0.85rem;color:#6d28d9;font-weight:bold;">نسبة التفكك المقدرة</div>
            <div style="font-size:1.8rem;font-weight:900;color:${results.severityColor};">${results.percentage}%</div>
            <div style="font-size:0.75rem;color:var(--text-sub);">مؤشر الشدة التراكمي</div>
          </div>
          <div>
            <div style="font-size:0.85rem;color:#6d28d9;font-weight:bold;">المستوى التشخيصي العام</div>
            <div style="font-size:1.15rem;font-weight:bold;color:${results.severityColor};margin-top:4px;">${results.level}</div>
          </div>
        </div>

        <!-- Clinical Narrative -->
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:14px 18px;margin-bottom:20px;">
          <h3 style="color:#6d28d9;margin:0 0 8px 0;font-size:1.05rem;">📝 التفسير الإكلينيكي لدرجة التفكك الأسري:</h3>
          <p style="margin:0;line-height:1.6;color:var(--text-main);font-size:0.95rem;">${results.interpretation}</p>
        </div>

        <!-- Subscales Breakdown -->
        <h3 style="color:#6d28d9;margin:0 0 10px 0;font-size:1.1rem;">📊 تحليل الأبعاد والمحاور الفرعية للتفكك الأسري:</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:var(--bg-input);border-bottom:2px solid var(--border-color);">
              <th style="padding:10px 12px;text-align:right;color:var(--text-main);">البعد والمجال الفرعي</th>
              <th style="padding:10px 12px;text-align:center;color:var(--text-main);">الدرجة المحققة</th>
              <th style="padding:10px 12px;text-align:center;color:var(--text-main);">نسبة التفكك</th>
              <th style="padding:10px 12px;text-align:center;color:var(--text-main);">المستوى التقديري</th>
            </tr>
          </thead>
          <tbody>
            ${subscaleHtml}
          </tbody>
        </table>

        <!-- Recommendations -->
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
          <h3 style="color:#166534;margin:0 0 8px 0;font-size:1.05rem;">💡 التوصيات الإرشادية وخطة الدعم الأسري:</h3>
          <ul style="margin:0;padding-right:20px;">
            ${recsHtml}
          </ul>
          ${assessment.recommendations ? `<div style="margin-top:10px;padding-top:8px;border-top:1px dashed #86efac;font-size:0.9rem;color:#14532d;"><strong>ملاحظات الأخصائي الإضافية:</strong> ${assessment.recommendations}</div>` : ''}
        </div>

        <!-- Detailed Items Table -->
        <h3 style="color:#6d28d9;margin:0 0 10px 0;font-size:1.1rem;page-break-before:always;">📋 استجابات بنود المقياس التفصيلية (26 فقرة):</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:0.88rem;">
          <thead>
            <tr style="background:var(--bg-input);border-bottom:2px solid var(--border-color);">
              <th style="padding:8px 10px;text-align:center;width:40px;">#</th>
              <th style="padding:8px 10px;text-align:right;">نص الفقرة</th>
              <th style="padding:8px 10px;text-align:right;">البعد</th>
              <th style="padding:8px 10px;text-align:center;width:80px;">درجة التفكك</th>
              <th style="padding:8px 10px;text-align:center;width:100px;">المؤشر</th>
              <th style="padding:8px 10px;text-align:right;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signature Block -->
        <div style="margin-top:40px;display:flex;justify-content:space-between;padding:0 20px;">
          <div style="text-align:center;">
            <div style="font-weight:bold;color:var(--text-main);margin-bottom:50px;">الأخصائي النفسي / المرشد الأسري</div>
            <div>${assessment.examinerName || '.....................................'}</div>
          </div>
          <div style="text-align:center;">
            <div style="font-weight:bold;color:var(--text-main);margin-bottom:50px;">مدير المركز / المشرف العام</div>
            <div>.....................................</div>
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
          <meta charset="utf-8">
          <title>تقرير مقياس التفكك الأسري - ${assessment.studentName || ''}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: A4; margin: 12mm; }
            }
          </style>
        </head>
        <body>
          ${printHtml}
          <script>
            setTimeout(() => {
              window.print();
            }, 400);
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  function handleSendWhatsApp() {
    const parentPhone = assessment.parentPhone || assessment.phone || '';
    const reportSummary = `تم إجراء مقياس التفكك الأسري للمفحوص (${assessment.studentName})، وكانت الدرجة الكلية: ${results.totalRawScore}/${results.maxPossible} (${results.percentage}%)، والمستوى التقديري: ${results.level}.`;
    
    sendReportToWhatsApp({
      parentPhone,
      parentName: assessment.parentName || 'ولي الأمر الكريم',
      studentName: assessment.studentName,
      reportTitle: 'تقرير مقياس التفكك الأسري',
      reportType: 'تقييم نفسي وإرشاد أسري',
      date: assessment.date,
      summary: reportSummary,
      recommendations: results.recommendations.join(' · '),
      specialistName: assessment.examinerName,
      centerName: center?.name,
    });
  }

  return (
    <div className="mbg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mb mb-xl"
        
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: 'var(--bg-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.4rem' }}>📄</span>
              <h2 style={{ margin: 0, color: 'var(--bg-card)', fontSize: '1.2rem', fontWeight: 800 }}>
                تقرير نتائج مقياس التفكك الأسري
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '.84rem' }}>
              المفحوص: <strong>{assessment.studentName}</strong> · تاريخ التطبيق: <strong>{assessment.date}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'var(--bg-card)',
                color: '#6d28d9',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '.85rem',
                cursor: 'pointer',
              }}
            >
              🖨️ طباعة التقرير الرسمي
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: 'var(--bg-card)',
                width: 34,
                height: 34,
                borderRadius: '50%',
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="modal-body-scroll" style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
          {/* Key Metric Score Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 14,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>الدرجة الكلية الخام</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: results.severityColor }}>
                {results.totalRawScore} <span style={{ fontSize: '.9rem', color: 'var(--text-sub)' }}>/ {results.maxPossible}</span>
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>المدى النظري: 26 - 130</div>
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
              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>المتوسط الفرضي</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {results.theoreticalMean}
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>نقطة التوازن (78 درجة)</div>
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
              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>نسبة التفكك التقديرية</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: results.severityColor }}>
                {results.percentage}%
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>كلما زادت دلت على تفكك أكبر</div>
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
              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>المستوى الإكلينيكي</div>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '.85rem',
                  fontWeight: 800,
                  background: `${results.severityColor}15`,
                  color: results.severityColor,
                  border: `1px solid ${results.severityColor}40`,
                }}
              >
                {results.level}
              </div>
            </div>
          </div>

          {/* Clinical Interpretation */}
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 20,
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '.95rem', fontWeight: 700, color: '#6d28d9' }}>
              🧠 الخلاصة والتفسير السيكومتري:
            </h4>
            <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {results.interpretation}
            </p>
          </div>

          {/* Subscales Analysis */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              📊 درجات ومستويات الأبعاد الأربعة لمقياس التفكك:
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {results.subscales.map(sub => (
                <div
                  key={sub.id}
                  style={{
                    background: 'var(--bg-input)',
                    border: `1.5px solid ${sub.color}30`,
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '.85rem', color: sub.color }}>{sub.name}</span>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: '.72rem',
                        fontWeight: 700,
                        background: `${sub.color}15`,
                        color: sub.color,
                      }}
                    >
                      {sub.level}
                    </span>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginBottom: 6 }}>
                    الدرجة: <strong>{sub.raw}</strong> / {sub.maxRaw} ({sub.percentage}%)
                  </div>
                  <div style={{ background: 'var(--border-color)', height: 6, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sub.percentage}%`, background: sub.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Card */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 20,
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '.95rem', fontWeight: 700, color: '#166534' }}>
              💡 التوصيات الإرشادية وخطة التدخل:
            </h4>
            <ul style={{ margin: 0, paddingRight: 20, fontSize: '.88rem', color: '#14532d', lineHeight: 1.6 }}>
              {results.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
            {assessment.recommendations && (
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #86efac', fontSize: '.85rem', color: '#14532d' }}>
                <strong>توصيات الأخصائي الإضافية: </strong> {assessment.recommendations}
              </div>
            )}
          </div>

          {/* Items Breakdown Table */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              📋 تفصيل استجابات بنود المقياس (26 فقرة):
            </h4>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: 40 }}>#</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>نص الفقرة</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>البعد</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: 90 }}>درجة التفكك</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: 100 }}>المؤشر</th>
                  </tr>
                </thead>
                <tbody>
                  {results.itemDetails.map(it => {
                    const domMeta = FAMILY_DISINTEGRATION_DOMAINS.find(d => d.id === it.domainId);
                    const isDef = it.isDeficient;

                    return (
                      <tr
                        key={it.id}
                        style={{
                          borderBottom: '1px solid var(--bg-input)',
                          background: isDef ? '#fef2f2' : it.calculatedScore >= 3 ? 'var(--bg-card)beb' : 'var(--bg-card)',
                        }}
                      >
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{it.num}</td>
                        <td style={{ padding: '8px 10px' }}>{it.text}</td>
                        <td style={{ padding: '8px 10px', fontSize: '.8rem', color: domMeta?.color }}>{domMeta?.name}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800, color: isDef ? '#dc2626' : 'var(--text-main)' }}>
                          {it.calculatedScore ?? '-'} / 5
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: '.75rem',
                              fontWeight: 700,
                              background: isDef ? '#fee2e2' : 'var(--bg-input)',
                              color: isDef ? '#dc2626' : 'var(--text-sub)',
                            }}
                          >
                            {isDef ? '⚠️ تفكك/خطر' : it.calculatedScore >= 3 ? 'متوسط' : '✅ سليم'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 22px',
            background: 'var(--g0, var(--bg-input))',
            borderTop: '1px solid var(--border-color, var(--border-color))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-s"
              onClick={() => setBridgeOpen(true)}
              style={{ fontWeight: 700, fontSize: '.85rem' }}
            >
              🌉 اشتقاق أهداف الخطة التربوية والتأهيلية (IEP)
            </button>
            <button
              type="button"
              className="btn btn-s"
              onClick={handleSendWhatsApp}
              style={{ fontWeight: 700, fontSize: '.85rem', background: '#25D366', color: 'var(--bg-card)' }}
            >
              💬 إرسال التقرير عبر واتساب
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-g"
                onClick={() => {
                  onClose();
                  onEdit(assessment);
                }}
              >
                ✏️ تعديل التقييم
              </button>
            )}
            <button type="button" className="btn btn-g" onClick={onClose}>
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
          scaleItems={FAMILY_DISINTEGRATION_ITEMS}
          scaleType="family_disintegration"
          recommendedGoals={recommendedGoals}
        />
      )}
    </div>
  );
}
