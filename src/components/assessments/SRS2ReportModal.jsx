import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SRS2_ITEMS, SRS2_DOMAINS, calculateSRS2Score } from '../../data/srs2Data';
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

  const results = useMemo(() => {
    if (!assessment) return null;
    return calculateSRS2Score(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    // Extract goals based on deficient SRS-2 items (score value of 3 or 4 indicating frequent impairment)
    return extractRecommendedGoals(
      'srs',
      assessment.results || assessment.scores || {},
      SRS2_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !results) return null;

  function handlePrint() {
    const subscaleHtml = results.subscales.map(s => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 12px;font-weight:bold;color:#059669;">${s.name}</td>
        <td style="padding:10px 12px;text-align:center;">${s.raw} / ${s.maxRaw}</td>
        <td style="padding:10px 12px;text-align:center;font-weight:bold;color:#047857;font-size:1.1em;">${s.tScore} T</td>
        <td style="padding:10px 12px;text-align:center;">
          <span style="
            padding:3px 8px;
            border-radius:4px;
            font-size:0.85em;
            font-weight:bold;
            background:${s.level === 'طبيعي' ? '#ecfdf5' : s.level === 'بسيط' ? '#fef9c3' : s.level === 'متوسط' ? '#ffedd5' : '#fee2e2'};
            color:${s.level === 'طبيعي' ? '#047857' : s.level === 'بسيط' ? '#a16207' : s.level === 'متوسط' ? '#c2410c' : '#b91c1c'};
          ">
            ${s.level}
          </span>
        </td>
      </tr>
    `).join('');

    const itemsHtml = SRS2_ITEMS.map((it, idx) => {
      const rawVal = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
      let calculatedScore = rawVal;
      if (rawVal !== null && it.isReverse) {
        calculatedScore = 5 - rawVal;
      }
      
      const note = assessment.itemNotes?.[it.id] || '';
      const responseLabels = {
        1: '1 - غير صحيح على الإطلاق',
        2: '2 - صحيح أحياناً',
        3: '3 - صحيح غالباً',
        4: '4 - صحيح دائماً تقريباً'
      };

      const domMeta = SRS2_DOMAINS.find(d => d.id === it.domainId);

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${calculatedScore && calculatedScore >= 3 ? '#fee2e2' : calculatedScore && calculatedScore >= 2 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:8px 10px;text-align:center;font-weight:bold;">${idx + 1}</td>
          <td style="padding:8px 10px;">${it.text}</td>
          <td style="padding:8px 10px;font-size:0.85em;color:#475569;">${domMeta?.name || ''} ${it.isReverse ? '(مقلوب)' : ''}</td>
          <td style="padding:8px 10px;text-align:center;font-weight:bold;color:#047857;">${rawVal ? responseLabels[rawVal] : '—'}</td>
          <td style="padding:8px 10px;text-align:center;font-weight:bold;color:${calculatedScore && calculatedScore >= 3 ? '#b91c1c' : '#475569'};">${calculatedScore || '—'}</td>
          <td style="padding:8px 10px;font-size:0.85em;color:#64748b;">${note || '—'}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:20px;">
        <div style="border-bottom:3px solid #059669;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#059669;font-size:22px;margin:0 0 4px 0;">📊 تقرير التقييم والتشخيص الإكلينيكي المعتمد (SRS-2)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">مقياس الاستجابة الاجتماعية - الإصدار الثاني المقنن لتشخيص صعوبات التفاعل الاجتماعي</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>اسم المركز:</b> ${center?.name || 'مركز رعاية طيف التوحد'}</div>
          </div>
        </div>

        <table style="width:100%;margin-bottom:20px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;font-size:13px;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 10px;"><b>اسم الطالب:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:6px 10px;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:6px 10px;"><b>تاريخ الميلاد:</b> ${assessment.dob || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px;"><b>الصف الدراسي:</b> ${assessment.grade || '—'}</td>
            <td style="padding:6px 10px;"><b>المدرسة:</b> ${assessment.school || '—'}</td>
            <td style="padding:6px 10px;"><b>تاريخ التطبيق:</b> ${assessment.date || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px;"><b>الأخصائي الفاحص:</b> ${assessment.examinerName || '—'} (${assessment.examinerRole || 'أخصائي تشخيص'})</td>
            <td style="padding:6px 10px;"><b>مستجيب المقياس:</b> ${assessment.raterName || '—'}</td>
            <td style="padding:6px 10px;"><b>صلة القرابة ومدة المعرفة:</b> ${assessment.raterRelation || '—'} (لمدة ${assessment.relationshipDuration || '—'})</td>
          </tr>
        </table>

        <div style="background:#f0fdf4;border:1.5px solid #a7f3d0;border-radius:8px;padding:16px;margin-bottom:20px;">
          <h3 style="margin:0 0 10px 0;color:#047857;font-size:16px;">📈 الخلاصة السيكومترية العامة والدرجة المعيارية ت</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:13px;gap:10px;">
            <div style="background:#fff;padding:8px 16px;border-radius:6px;flex:1;border:1px solid #e2e8f0;">
              <div style="color:#64748b;font-size:11px;">الدرجة الخام الإجمالية</div>
              <div style="font-size:20px;font-weight:900;color:#1e293b;margin-top:4px;">${results.totalRawScore} / 260</div>
            </div>
            <div style="background:#059669;color:#fff;padding:8px 16px;border-radius:6px;flex:1;">
              <div style="opacity:0.9;font-size:11px;">الدرجة التائية الإجمالية (T-Score)</div>
              <div style="font-size:22px;font-weight:900;margin-top:4px;">${results.totalTScore} T</div>
            </div>
            <div style="background:#fff;padding:8px 16px;border-radius:6px;flex:2;border:1px solid #e2e8f0;text-align:right;">
              <div style="color:#64748b;font-size:11px;font-weight:bold;">التفسير الإكلينيكي المعتمد</div>
              <div style="font-size:13px;font-weight:900;color:${results.severityColor === 'red' ? '#dc2626' : results.severityColor === 'orange' ? '#ea580c' : '#16a34a'};margin-top:4px;">
                ${results.category}
              </div>
            </div>
          </div>
          <p style="font-size:12px;line-height:1.6;color:#334155;margin:12px 0 0 0;white-space:pre-wrap;">${results.interpretation}</p>
        </div>

        <h3 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:6px;margin:20px 0 10px 0;font-size:16px;">📊 تحليل المقاييس الفرعية (Subscales Breakdown)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;text-align:right;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:10px;text-align:right;">المقياس الفرعي</th>
              <th style="padding:10px;text-align:center;width:120px;">الدرجة الخام</th>
              <th style="padding:10px;text-align:center;width:150px;">الدرجة التائية المعيارية T</th>
              <th style="padding:10px;text-align:center;width:150px;">مستوى القصور الإكلينيكي</th>
            </tr>
          </thead>
          <tbody>
            ${subscaleHtml}
          </tbody>
        </table>

        ${assessment.clinicalSummary ? `
          <h3 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:6px;margin:20px 0 10px 0;font-size:16px;">📝 الرأي والملاحظات الإكلينيكية للأخصائي</h3>
          <p style="font-size:12.5px;line-height:1.6;white-space:pre-wrap;background:#f8fafc;padding:12px;border:1px solid #e2e8f0;border-radius:6px;margin:0 0 20px 0;">${assessment.clinicalSummary}</p>
        ` : ''}

        ${assessment.recommendations ? `
          <h3 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:6px;margin:20px 0 10px 0;font-size:16px;">💡 التوصيات العلاجية وبرنامج التدخل المقترح</h3>
          <p style="font-size:12.5px;line-height:1.6;white-space:pre-wrap;background:#f0fdf4;padding:12px;border:1px solid #bbf7d0;border-radius:6px;margin:0 0 20px 0;color:#166534;">${assessment.recommendations}</p>
        ` : ''}

        <div style="page-break-before:always;"></div>

        <h3 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:6px;margin:20px 0 10px 0;font-size:16px;">📝 تفاصيل إجابات عبارات المقياس (65 بنداً)</h3>
        <table style="width:100%;border-collapse:collapse;font-size:11px;text-align:right;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:6px;text-align:center;width:40px;">م</th>
              <th style="padding:6px;text-align:right;">البند / العبارة</th>
              <th style="padding:6px;text-align:right;width:120px;">المجال الفرعي</th>
              <th style="padding:6px;text-align:center;width:160px;">الإجابة المسجلة</th>
              <th style="padding:6px;text-align:center;width:60px;">الدرجة</th>
              <th style="padding:6px;text-align:right;width:150px;">ملاحظات الأخصائي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top:40px;display:flex;justify-content:space-between;font-size:13px;border-top:1px solid #cbd5e1;padding-top:16px;">
          <div><b>توقيع الأخصائي القائم بالتشخيص:</b> ____________________</div>
          <div><b>توقيع مدير المركز:</b> ____________________</div>
        </div>
      </div>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <html>
          <head>
            <title>تقرير SRS-2 - ${assessment.studentName || 'طالب'}</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
            <style>
              body { margin: 20px; font-family: 'Tajawal', sans-serif; background: #fff; }
              @media print {
                body { margin: 0; }
                button { display: none !important; }
              }
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
      printWin.document.close();
    }
  }

  function handleWhatsAppShare() {
    sendReportToWhatsApp(assessment, 'srs2');
  }

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div className="mb mb-xl"
        
      >
        {/* Modal Header */}
        <div
          className="modal-header-custom fhd"
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: '#fff',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            flexShrink: 0,
            flexGrow: 0,
            width: '100%',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📄</span> <span>تقرير التشخيص والتقييم النفسي المعتمد — SRS-2</span>
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '.82rem', opacity: 0.9 }}>
              Social Responsiveness Scale, 2nd Edition · متوافق مع معايير الدليل DSM-5
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-p"
              onClick={handlePrint}
              style={{ background: '#fff', color: '#059669', fontWeight: 800, borderRadius: 8 }}
            >
              🖨️ طباعة التقرير الرسمي
            </button>
            {assessment.parentPhone && (
              <button
                type="button"
                className="btn btn-sm btn-s"
                onClick={handleWhatsAppShare}
                style={{ borderRadius: 8, fontWeight: 800 }}
              >
                💬 واتساب لولي الأمر
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="modal-body-scroll" style={{ padding: '18px 22px' }}>
          
          {/* TOP METADATA TABLE */}
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '0.86rem' }}>
              <div><strong>اسم الطالب:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{assessment.studentName}</span></div>
              <div><strong>العمر الزمني:</strong> <span>{assessment.age || '—'}</span></div>
              <div><strong>تاريخ التطبيق:</strong> <span>{assessment.date}</span></div>
              <div><strong>القائم بالفحص:</strong> <span>{assessment.examinerName || '—'} ({assessment.examinerRole || 'أخصائي'})</span></div>
              <div><strong>مستجيب المقياس:</strong> <span>{assessment.raterName || '—'} ({assessment.raterRelation || '—'})</span></div>
              <div><strong>مدة المعرفة:</strong> <span>{assessment.relationshipDuration || '—'}</span></div>
            </div>
          </div>

          {/* MAIN RESULTS SCORE BANNER */}
          <div
            style={{
              border: '1px solid #10b981',
              background: 'var(--g0)',
              padding: '16px 20px',
              borderRadius: 12,
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 12, textAlign: 'center' }}>
              
              <div style={{ background: 'var(--bg-card)', padding: '8px 20px', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>الدرجة الخام الكلية</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>{results.totalRawScore} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-sub)' }}>/ 260</span></div>
              </div>

              <div style={{ background: '#059669', color: '#fff', padding: '10px 24px', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}>
                <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>الدرجة التائية المعيارية (Total T-Score)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: 2 }}>{results.totalTScore} T</div>
              </div>

              <div style={{ textAlign: 'right', maxWidth: 350 }}>
                <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>التفسير الإكلينيكي للنتيجة:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: results.severityColor === 'red' ? '#dc2626' : results.severityColor === 'orange' ? '#d97706' : '#15803d', marginTop: 4 }}>
                  {results.category}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 10, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              <strong>شرح النطاق الإكلينيكي:</strong> {results.interpretation}
            </div>
          </div>

          {/* SUBSCALE TABLE GRID */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              marginBottom: 18,
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
              📊 تحليل أبعاد ومقاييس الاستجابة الاجتماعية الـ 5
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'right' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1.5px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-main)' }}>البعد / المجال الفرعي للـ SRS-2</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-main)' }}>الدرجة الخام</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-main)' }}>الدرجة التائية T</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-main)' }}>الرتبة التقديرية للقصور</th>
                  </tr>
                </thead>
                <tbody>
                  {results.subscales.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#059669' }}>{s.name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{s.raw} / {s.maxRaw}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#047857' }}>{s.tScore} T</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: s.level === 'طبيعي' ? '#ecfdf5' : s.level === 'بسيط' ? '#fef9c3' : s.level === 'متوسط' ? '#ffedd5' : '#fee2e2',
                            color: s.level === 'طبيعي' ? '#047857' : s.level === 'بسيط' ? '#a16207' : s.level === 'متوسط' ? '#c2410c' : '#b91c1c',
                          }}
                        >
                          {s.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CLINICAL SUMMARY & RECOMMENDATIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 14, marginBottom: 18 }}>
            
            {assessment.clinicalSummary && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                }}
              >
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: 6, marginBottom: 8 }}>
                  📝 الملاحظات السريرية للأخصائي:
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {assessment.clinicalSummary}
                </p>
              </div>
            )}

            {assessment.recommendations && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                }}
              >
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#166534', borderBottom: '1px solid #bbf7d0', paddingBottom: 6, marginBottom: 8 }}>
                  💡 التوصيات والخطة المقترحة للطفل:
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#166534', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {assessment.recommendations}
                </p>
              </div>
            )}
          </div>

          {/* ITEM BREAKDOWN TOGGLE */}
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
            }}
          >
            <details>
              <summary style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}>
                🔍 عرض وتفصيل إجابات الـ 65 بنداً بالكامل
              </summary>
              <div style={{ overflowX: 'auto', marginTop: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ background: 'var(--g0)', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-main)' }}>م</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-main)' }}>البند / العبارة</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-main)' }}>المجال</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-main)' }}>الإجابة</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-main)' }}>الدرجة</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-main)' }}>ملاحظات الأخصائي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SRS2_ITEMS.map((it, idx) => {
                      const rawVal = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
                      let score = rawVal;
                      if (rawVal !== null && it.isReverse) {
                        score = 5 - rawVal;
                      }

                      const note = assessment.itemNotes?.[it.id] || '';
                      const labels = { 1: 'غير صحيح', 2: 'أحياناً', 3: 'غالباً', 4: 'دائماً تقريباً' };
                      const dom = SRS2_DOMAINS.find(d => d.id === it.domainId);

                      return (
                        <tr key={it.id} style={{ borderBottom: '1px solid var(--border-color)', background: score >= 3 ? 'rgba(239, 68, 68, 0.08)' : undefined }}>
                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '6px 8px' }}>{it.text}</td>
                          <td style={{ padding: '6px 8px', color: 'var(--text-sub)' }}>{dom?.name} {it.isReverse && '◀'}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600 }}>{rawVal ? labels[rawVal] : '—'}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: score >= 3 ? '#dc2626' : 'var(--text-main)' }}>{score || '—'}</td>
                          <td style={{ padding: '6px 8px', color: 'var(--text-sub)', fontStyle: 'italic' }}>{note || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div
          className="fa"
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--g0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-p"
              style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4338ca, #2563eb)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              onClick={() => setBridgeOpen(true)}
            >
              <span>🎓</span>
              <span>اشتقاق خطة فردية (IEP)</span>
            </button>
            <button type="button" className="btn btn-s" onClick={handlePrint} style={{ fontWeight: 700 }}>
              🖨️ طباعة التقرير / PDF
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={() => onEdit(assessment)}
            >
              ✏️ تعديل الدرجات
            </button>
            <button
              type="button"
              className="btn btn-g"
              onClick={onClose}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* IEP BRIDGE BRIDGE WORKSTATION POPUP */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleId="srs"
          recommendedGoals={recommendedGoals}
        />
      )}
    </div>
  );
}
