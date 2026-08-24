import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PEP3_ITEMS, PEP3_DOMAINS, calculatePEP3Score } from '../../data/pep3Data';
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

  const results = useMemo(() => {
    if (!assessment) return null;
    return calculatePEP3Score(assessment.results || assessment.scores || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    // Extract goals based on deficient/emerging PEP-3 items (score value of 0 or 1)
    return extractRecommendedGoals(
      'pep3',
      assessment.results || assessment.scores || {},
      PEP3_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !results) return null;

  function handlePrint() {
    const subscaleHtml = results.subscales.map(s => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 12px;font-weight:bold;color:#2563eb;">${s.name}</td>
        <td style="padding:10px 12px;text-align:center;">${s.raw} / ${s.maxRaw}</td>
        <td style="padding:10px 12px;text-align:center;font-weight:bold;color:#1d4ed8;font-size:1.1em;">${s.tScore} T</td>
        <td style="padding:10px 12px;text-align:center;">
          <span style="
            padding:3px 8px;
            border-radius:4px;
            font-size:0.85em;
            font-weight:bold;
            background:${s.level === 'طبيعي ومناسب' ? '#ecfdf5' : s.level === 'تأخر بسيط' ? '#fef9c3' : s.level === 'تأخر متوسط' ? '#ffedd5' : '#fee2e2'};
            color:${s.level === 'طبيعي ومناسب' ? '#047857' : s.level === 'تأخر بسيط' ? '#a16207' : s.level === 'تأخر متوسط' ? '#c2410c' : '#b91c1c'};
          ">
            ${s.level}
          </span>
        </td>
      </tr>
    `).join('');

    const itemsHtml = PEP3_ITEMS.map((it, idx) => {
      const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
      const note = assessment.itemNotes?.[it.id] || '';
      
      const responseLabels = {
        2: 'منجز (Pass)',
        1: 'بزوغ (Emerging)',
        0: 'إخفاق (Fail)'
      };

      const domMeta = PEP3_DOMAINS.find(d => d.id === it.domainId);

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${score === 0 ? '#fee2e2' : score === 1 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:8px 10px;text-align:center;font-weight:bold;">${idx + 1}</td>
          <td style="padding:8px 10px;">${it.text}</td>
          <td style="padding:8px 10px;font-size:0.85em;color:#475569;">${domMeta?.name.split(' (')[0] || ''}</td>
          <td style="padding:8px 10px;text-align:center;font-weight:bold;color:${score === 2 ? '#16a34a' : score === 1 ? '#ca8a04' : '#dc2626'};">${score !== null ? responseLabels[score] : '—'}</td>
          <td style="padding:8px 10px;text-align:center;font-weight:bold;">${score !== null ? score : '—'}</td>
          <td style="padding:8px 10px;font-size:0.85em;color:#64748b;">${note || '—'}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:20px;">
        <div style="border-bottom:3px solid #2563eb;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#2563eb;font-size:22px;margin:0 0 4px 0;">📊 ملف التقييم النفسي التربوي المعتمد للتوحد (PEP-3)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">مقياس السن النمائي، ونقاط القوة والاحتياج، وتحليل مهارات السلوك والنمو للتوحد</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>اسم المركز:</b> ${center?.name || 'مركز رعاية طيف التوحد'}</div>
          </div>
        </div>

        <table style="width:100%;margin-bottom:20px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;font-size:13px;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 10px;"><b>اسم الطالب:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:6px 10px;"><b>العمر الحقيقي:</b> ${assessment.age || '—'}</td>
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

        <div style="background:#f0fdfa;border:1.5px solid #2563eb70;border-radius:8px;padding:16px;margin-bottom:20px;">
          <h3 style="margin:0 0 10px 0;color:#1d4ed8;font-size:16px;">📈 الخلاصة السيكومترية العامة والسن النمائي لبيب-3</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:13px;gap:10px;">
            <div style="background:#fff;padding:8px 16px;border-radius:6px;flex:1;border:1px solid #e2e8f0;">
              <div style="color:#64748b;font-size:11px;">الدرجة الخام الكلية</div>
              <div style="font-size:20px;font-weight:900;color:#1e293b;margin-top:4px;">${results.totalRawScore} / 100</div>
            </div>
            <div style="background:#2563eb;color:#fff;padding:8px 16px;border-radius:6px;flex:1.5;">
              <div style="opacity:0.9;font-size:11px;">السن النمائي المقدر</div>
              <div style="font-size:18px;font-weight:900;margin-top:4px;">${results.estimatedDevelopmentalAge}</div>
            </div>
            <div style="background:#fff;padding:8px 16px;border-radius:6px;flex:2;border:1px solid #e2e8f0;text-align:right;">
              <div style="color:#64748b;font-size:11px;font-weight:bold;">التقدير والوصف الإكلينيكي</div>
              <div style="font-size:13px;font-weight:900;color:${results.overallColor === 'red' ? '#dc2626' : results.overallColor === 'orange' ? '#ea580c' : '#16a34a'};margin-top:4px;">
                ${results.overallLevel}
              </div>
            </div>
          </div>
          <p style="font-size:12px;line-height:1.6;color:#334155;margin:12px 0 0 0;white-space:pre-wrap;">${results.interpretation}</p>
        </div>

        <h3 style="color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;margin:20px 0 10px 0;font-size:16px;">📊 تحليل أبعاد ومقاييس بيب-3 (PEP-3 Subscales)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;text-align:right;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:10px;text-align:right;">المجال النمو سيكولوجي</th>
              <th style="padding:10px;text-align:center;width:120px;">الدرجة الخام</th>
              <th style="padding:10px;text-align:center;width:150px;">الدرجة التائية المعيارية T</th>
              <th style="padding:10px;text-align:center;width:180px;">مستوى القصور النمائي</th>
            </tr>
          </thead>
          <tbody>
            ${subscaleHtml}
          </tbody>
        </table>

        ${assessment.clinicalSummary ? `
          <h3 style="color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;margin:20px 0 10px 0;font-size:16px;">📝 الرأي والملاحظات السريرية للأخصائي</h3>
          <p style="font-size:12.5px;line-height:1.6;white-space:pre-wrap;background:#f8fafc;padding:12px;border:1px solid #e2e8f0;border-radius:6px;margin:0 0 20px 0;">${assessment.clinicalSummary}</p>
        ` : ''}

        ${assessment.recommendations ? `
          <h3 style="color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;margin:20px 0 10px 0;font-size:16px;">💡 التوصيات العلاجية وبرنامج التدخل المقترح</h3>
          <p style="font-size:12.5px;line-height:1.6;white-space:pre-wrap;background:#f0fdf4;padding:12px;border:1px solid #93c5fd;border-radius:6px;margin:0 0 20px 0;color:#1e3a8a;">${assessment.recommendations}</p>
        ` : ''}

        <div style="page-break-before:always;"></div>

        <h3 style="color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;margin:20px 0 10px 0;font-size:16px;">📝 تفاصيل إجابات بنود المقياس الـ 50 بالكامل</h3>
        <table style="width:100%;border-collapse:collapse;font-size:11px;text-align:right;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
              <th style="padding:6px;text-align:center;width:40px;">م</th>
              <th style="padding:6px;text-align:right;">البند / العبارة</th>
              <th style="padding:6px;text-align:right;width:150px;">المجال الفرعي</th>
              <th style="padding:6px;text-align:center;width:150px;">الاستجابة المسجلة</th>
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
          <div><b>توقيع مدير المركز المعتمد:</b> ____________________</div>
        </div>
      </div>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <html>
          <head>
            <title>تقرير PEP-3 - ${assessment.studentName || 'طالب'}</title>
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
    sendReportToWhatsApp(assessment, 'pep3');
  }

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div className="mb mb-xl"
        
      >
        {/* Modal Header */}
        <div
          className="modal-header-custom fhd"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
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
              <span>📄</span> <span>تقرير ملف التقييم النفسي التربوي المعتمد — PEP-3</span>
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '.82rem', opacity: 0.9 }}>
              Psychoeducational Profile, 3rd Edition · تقرير سيكومتري لتصميم وتطوير خطط IEP
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-p"
              onClick={handlePrint}
              style={{ background: '#fff', color: '#2563eb', fontWeight: 800, borderRadius: 8 }}
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
              <div><strong>اسم الطالب:</strong> <span style={{ color: '#2563eb', fontWeight: 700 }}>{assessment.studentName}</span></div>
              <div><strong>العمر الحقيقي:</strong> <span>{assessment.age || '—'}</span></div>
              <div><strong>تاريخ التطبيق:</strong> <span>{assessment.date}</span></div>
              <div><strong>القائم بالفحص:</strong> <span>{assessment.examinerName || '—'} ({assessment.examinerRole || 'أخصائي'})</span></div>
              <div><strong>مستجيب المقياس:</strong> <span>{assessment.raterName || '—'} ({assessment.raterRelation || '—'})</span></div>
              <div><strong>مدة المعرفة:</strong> <span>{assessment.relationshipDuration || '—'}</span></div>
            </div>
          </div>

          {/* MAIN RESULTS SCORE BANNER */}
          <div
            style={{
              border: '1px solid #3b82f6',
              background: 'var(--g0)',
              padding: '16px 20px',
              borderRadius: 12,
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 12, textAlign: 'center' }}>
              
              <div style={{ background: 'var(--bg-card)', padding: '8px 20px', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>الدرجة الخام الكلية</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>{results.totalRawScore} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-sub)' }}>/ 100</span></div>
              </div>

              <div style={{ background: '#2563eb', color: '#fff', padding: '10px 24px', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>السن النمائي المقدر الشامل</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: 2 }}>{results.estimatedDevelopmentalAge}</div>
              </div>

              <div style={{ textAlign: 'right', maxWidth: 350 }}>
                <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 600 }}>التقدير السلوكي والنمائي العام:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: results.overallColor === 'red' ? '#dc2626' : results.overallColor === 'orange' ? '#d97706' : '#15803d', marginTop: 4 }}>
                  {results.overallLevel}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 10, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              <strong>التفسير والتحليل السيكومتري:</strong> {results.interpretation}
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
              📊 تحليل مجالات النمو والسلوك الـ 8 بـ PEP-3
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'right' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1.5px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-main)' }}>المجال الفرعي للتقييم</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-main)' }}>الدرجة الخام المحققة</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-main)' }}>الدرجة التائية T</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-main)' }}>مستوى كفاءة المجال</th>
                  </tr>
                </thead>
                <tbody>
                  {results.subscales.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{s.name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{s.raw} / {s.maxRaw}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#1d4ed8' }}>{s.tScore} T</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: s.level === 'طبيعي ومناسب' ? '#ecfdf5' : s.level === 'تأخر بسيط' ? '#fef9c3' : s.level === 'تأخر متوسط' ? '#ffedd5' : '#fee2e2',
                            color: s.level === 'طبيعي ومناسب' ? '#047857' : s.level === 'تأخر بسيط' ? '#a16207' : s.level === 'تأخر متوسط' ? '#c2410c' : '#b91c1c',
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
                  📝 التقرير الأكاديمي وتوصيف الفجوات النمائية:
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
                  border: '1px solid #93c5fd',
                  background: '#f0f9ff',
                }}
              >
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e3a8a', borderBottom: '1px solid #93c5fd', paddingBottom: 6, marginBottom: 8 }}>
                  💡 التوصيات والخطة العلاجية والدمج الفردي:
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#1e3a8a', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
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
                🔍 عرض وتفصيل نتائج البنود الـ 50 بالكامل (PASS / EMERGING / FAIL)
              </summary>
              <div style={{ overflowX: 'auto', marginTop: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ background: 'var(--g0)', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-main)' }}>م</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-main)' }}>بند التقييم</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-main)' }}>المجال الفرعي</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-main)' }}>الاستجابة</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-main)' }}>الدرجة</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-main)' }}>ملاحظات الأخصائي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PEP3_ITEMS.map((it, idx) => {
                      const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
                      const note = assessment.itemNotes?.[it.id] || '';
                      
                      const labels = { 2: 'منجز (P)', 1: 'بزوغ (E)', 0: 'إخفاق (F)' };
                      const dom = PEP3_DOMAINS.find(d => d.id === it.domainId);

                      return (
                        <tr key={it.id} style={{ borderBottom: '1px solid var(--border-color)', background: score === 0 ? 'rgba(239, 68, 68, 0.08)' : score === 1 ? 'rgba(245, 158, 11, 0.08)' : undefined }}>
                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '6px 8px' }}>{it.text}</td>
                          <td style={{ padding: '6px 8px', color: 'var(--text-sub)' }}>{dom?.name.split(' (')[0]}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: score === 2 ? '#16a34a' : score === 1 ? '#ca8a04' : '#dc2626' }}>{score !== null ? labels[score] : '—'}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{score !== null ? score : '—'}</td>
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
              <span>اشتقاق خطة سلوكية (IEP)</span>
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

      {/* IEP BRIDGE POPUP */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleId="pep3"
          recommendedGoals={recommendedGoals}
        />
      )}
    </div>
  );
}
