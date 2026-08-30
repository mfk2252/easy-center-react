import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GARS3_ITEMS, GARS3_DOMAINS, calculateGARS3Psychometrics } from '../../data/gars3Data';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function GARS3ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateGARS3Psychometrics(
      assessment.results || assessment.scores || {},
      assessment.isVerbal !== undefined ? assessment.isVerbal : true
    );
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'gars',
      assessment.results || assessment.scores || {},
      GARS3_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const domainHtml = psychometrics.domainResults.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#0d9488;">${d.name} (${d.code})</td>
        <td style="padding:8px 12px;text-align:center;">${d.rawScore} / ${d.maxRaw}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:bold;color:#0f766e;">${d.scaledScore}</td>
        <td style="padding:8px 12px;text-align:center;">${d.percentile}%</td>
        <td style="padding:8px 12px;text-align:center;font-size:0.9em;">
          ${d.scaledScore >= 13 ? '<span style="color:#e11d48;font-weight:bold;">مرتفع جداً (شديد)</span>' : d.scaledScore >= 11 ? '<span style="color:#d97706;font-weight:bold;">فوق المتوسط (متوسط)</span>' : '<span style="color:#059669;">متوسط / طبيعي</span>'}
        </td>
      </tr>
    `).join('');

    const targetItems = assessment.isVerbal !== false
      ? GARS3_ITEMS
      : GARS3_ITEMS.filter(it => it.domainId !== 'cs' && it.domainId !== 'ms');

    const itemsHtml = targetItems.map(it => {
      const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
      const note = assessment.itemNotes?.[it.id] || '';
      const scoreLabels = ['0 - لم يلاحظ أبداً', '1 - يلاحظ نادراً', '2 - يلاحظ أحياناً', '3 - يلاحظ بكثرة'];

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${score && score >= 3 ? '#fff1f2' : score && score >= 2 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:6px 10px;text-align:center;font-weight:bold;">${it.id}</td>
          <td style="padding:6px 10px;font-weight:bold;">${it.text || it.title}</td>
          <td style="padding:6px 10px;text-align:center;font-weight:bold;color:#0d9488;">${score !== null ? scoreLabels[score] || score : '—'}</td>
          <td style="padding:6px 10px;font-size:0.85em;color:#64748b;">${note || '—'}</td>
        </tr>
      `;
    }).join('');

    const verbalLabel = assessment.isVerbal !== false
      ? 'نموذج الأطفال الناطقين (6 مقاييس فرعية - 58 بنداً)'
      : 'نموذج الأطفال غير الناطقين (4 مقاييس فرعية - 44 بنداً)';

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:10px;">
        <div style="border-bottom:3px solid #0d9488;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#0d9488;font-size:22px;margin:0 0 4px 0;">📊 تقرير التقييم والتشخيص السيكومتري (GARS-3)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">مقياس جيليام لتقدير اضطراب طيف التوحد — الإصدار الثالث المقنن وفق DSM-5</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>النموذج:</b> ${verbalLabel}</div>
          </div>
        </div>

        <table style="width:100%;margin-bottom:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:10px;font-size:13px;">
          <tr>
            <td style="padding:6px 10px;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:6px 10px;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:6px 10px;"><b>تاريخ الفحص:</b> ${assessment.date || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px;"><b>الأخصائي الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '—'}</td>
            <td style="padding:6px 10px;"><b>المستجيب / ولي الأمر:</b> ${assessment.raterName || '—'} (${assessment.raterRelation || '—'})</td>
            <td style="padding:6px 10px;"><b>صيغة التطبيق:</b> ${assessment.isVerbal !== false ? 'ناطق (6 مقاييس)' : 'غير ناطق (4 مقاييس)'}</td>
          </tr>
        </table>

        <div style="background:#f0fdfa;border:1.5px solid #99f6e4;border-radius:8px;padding:14px;margin-bottom:18px;">
          <h3 style="margin:0 0 10px 0;color:#0f766e;font-size:16px;">📈 المؤشرات السيكومترية ومعامل التوحد (AQ Dashboard)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:13px;">
            <div style="background:#ffffff;padding:8px 14px;border-radius:6px;border:1px solid #99f6e4;">
              <div style="color:#64748b;">مجموع الدرجات المعيارية</div>
              <div style="font-size:20px;font-weight:900;color:#0d9488;">${psychometrics.sumScaledScores}</div>
            </div>
            <div style="background:#ffffff;padding:8px 14px;border-radius:6px;border:1px solid #99f6e4;">
              <div style="color:#64748b;">معامل التوحد (AQ)</div>
              <div style="font-size:22px;font-weight:900;color:#0f766e;">${psychometrics.autismQuotient}</div>
            </div>
            <div style="background:#ffffff;padding:8px 14px;border-radius:6px;border:1px solid #99f6e4;">
              <div style="color:#64748b;">الرتبة المئينية الكلية</div>
              <div style="font-size:20px;font-weight:900;color:#0f172a;">${psychometrics.overallPercentile}%</div>
            </div>
            <div style="background:#ffffff;padding:8px 14px;border-radius:6px;border:1px solid #99f6e4;">
              <div style="color:#64748b;">مستوى الشدة وفق DSM-5</div>
              <div style="font-size:15px;font-weight:900;color:${psychometrics.severityColor};margin-top:4px;">
                ${psychometrics.dsm5Level}
              </div>
            </div>
          </div>
        </div>

        <h3 style="color:#0f766e;font-size:15px;margin:16px 0 8px 0;">🌐 الأداء على المقاييس الفرعية لـ GARS-3:</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:13px;border:1px solid #cbd5e1;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:8px 12px;text-align:right;">المقياس الفرعي</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة الخام</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة المعيارية (1-20)</th>
              <th style="padding:8px 12px;text-align:center;">الرتبة المئينية</th>
              <th style="padding:8px 12px;text-align:center;">مستوى التأثر</th>
            </tr>
          </thead>
          <tbody>
            ${domainHtml}
          </tbody>
        </table>

        ${assessment.clinicalSummary ? `
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;">
            <h4 style="margin:0 0 6px 0;color:#0f766e;font-size:14px;">📝 الخلاصة الإكلينيكية والتشخيصية:</h4>
            <p style="margin:0;font-size:13px;line-height:1.7;white-space:pre-wrap;">${assessment.clinicalSummary}</p>
          </div>
        ` : ''}

        ${assessment.recommendations ? `
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:16px;">
            <h4 style="margin:0 0 6px 0;color:#0f766e;font-size:14px;">💡 التوصيات والبرامج المقترحة:</h4>
            <p style="margin:0;font-size:13px;line-height:1.7;white-space:pre-wrap;">${assessment.recommendations}</p>
          </div>
        ` : ''}

        <h3 style="color:#0f766e;font-size:15px;margin:20px 0 8px 0;">📑 تفريغ استجابات بنود المقياس (${targetItems.length} بنداً):</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #cbd5e1;margin-bottom:24px;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:6px 10px;text-align:center;width:40px;">#</th>
              <th style="padding:6px 10px;text-align:right;">نص العبارة السلوكية</th>
              <th style="padding:6px 10px;text-align:center;width:150px;">الاستجابة / التكرار</th>
              <th style="padding:6px 10px;text-align:right;">ملاحظات الفاحص</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signatures Section -->
        <div style="margin-top:30px;padding-top:16px;border-top:1.5px solid #cbd5e1;display:flex;justify-content:space-between;text-align:center;font-size:13px;">
          <div>
            <div style="font-weight:bold;margin-bottom:30px;">الأخصائي الفاحص</div>
            <div>${assessment.examinerName || assessment.specialistName || '.......................'}</div>
          </div>
          <div>
            <div style="font-weight:bold;margin-bottom:30px;">المشرف الفني / الإكلينيكي</div>
            <div>.......................</div>
          </div>
          <div>
            <div style="font-weight:bold;margin-bottom:30px;">مدير المركز / المدرسة</div>
            <div>.......................</div>
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
          <title>تقرير مقياس GARS-3 - ${assessment.studentName || 'الطالب'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet">
          <style>
            body { margin: 20px; font-family: 'Tajawal', sans-serif; }
            @media print {
              body { margin: 0; }
              button { display: none !important; }
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

  function handleSendWhatsApp() {
    sendReportToWhatsApp(assessment, 'gars3');
  }

  return (
    <div className="mbg" style={{ zIndex: 1100 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header-custom fhd"
          style={{
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
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
              <span>📊</span> <span>تقرير التشخيص والتقييم النفسي المعتمد — GARS-3</span>
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '.82rem', opacity: 0.9 }}>
              Gilliam Autism Rating Scale, 3rd Edition · مقنن وفق DSM-5
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-p"
              onClick={handlePrint}
              style={{ background: '#fff', color: '#0d9488', fontWeight: 800, borderRadius: 8 }}
            >
              🖨️ طباعة التقرير الرسمي
            </button>
            {assessment.parentPhone && (
              <button
                type="button"
                className="btn btn-sm btn-s"
                onClick={handleSendWhatsApp}
                style={{ borderRadius: 8, fontWeight: 800 }}
              >
                💬 واتساب لولي الأمر
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                className="btn btn-sm btn-g"
                onClick={() => { onClose(); onEdit(assessment); }}
                style={{ borderRadius: 8, color: '#fff', background: 'rgba(255,255,255,0.2)', border: 'none' }}
              >
                ✏️ تعديل
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body-scroll" style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
          {/* Header Card with Meta info */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {assessment.studentName || 'اسم الطالب'}
              </div>
              <div style={{ fontSize: '.82rem', color: 'var(--text-sub)', marginTop: 3 }}>
                العمر: {assessment.age || '—'} · تاريخ الجلسة: {assessment.date || '—'} · الفاحص: {assessment.examinerName || assessment.specialistName || '—'}
              </div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginTop: 2 }}>
                المستجيب: {assessment.raterName || '—'} ({assessment.raterRelation || '—'}) · النمط: {assessment.isVerbal !== false ? '🗣️ ناطق (6 مقاييس)' : '🤫 غير ناطق (4 مقاييس)'}
              </div>
            </div>

            {/* IEP Bridge Trigger Button */}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setBridgeOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                color: '#fff',
                fontWeight: 800,
                borderRadius: 8,
                padding: '8px 16px',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
              }}
            >
              🎓 اشتقاق أهداف الخطة الفردية (IEP Bridge) ({recommendedGoals.length})
            </button>
          </div>

          {/* Diagnostic Key Psychometrics */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
              📊 المؤشرات السيكومترية والدرجات المعيارية المعتمدة:
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-card)',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>مجموع الدرجات المعيارية</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0d9488', marginTop: 4 }}>
                  {psychometrics.sumScaledScores}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>معامل التوحد (AQ)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f766e', marginTop: 4 }}>
                  {psychometrics.autismQuotient}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>الرتبة المئينية (% Rank)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>
                  {psychometrics.overallPercentile}%
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${psychometrics.severityColor}40`,
                }}
              >
                <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>المستوى وفق DSM-5</div>
                <div
                  style={{
                    fontSize: '.95rem',
                    fontWeight: 900,
                    color: psychometrics.severityColor,
                    marginTop: 6,
                  }}
                >
                  {psychometrics.dsm5Level}
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  {psychometrics.supportLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Subscales Performance Table */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 10 }}>
              🌐 تحليل الأداء على المقاييس الفرعية (GARS-3 Subscales):
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>المقياس الفرعي</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>الدرجة الخام</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>الدرجة المعيارية</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>الرتبة المئينية</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>مستوى التأثر</th>
                  </tr>
                </thead>
                <tbody>
                  {psychometrics.domainResults.map(dr => (
                    <tr key={dr.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: dr.color }}>
                        {dr.name} ({dr.code})
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {dr.rawScore} / {dr.maxRaw}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 900, color: dr.color }}>
                        {dr.scaledScore}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {dr.percentile}%
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '.75rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: dr.scaledScore >= 13 ? '#e11d4820' : dr.scaledScore >= 11 ? '#d9770620' : '#05966920',
                            color: dr.scaledScore >= 13 ? '#e11d48' : dr.scaledScore >= 11 ? '#d97706' : '#059669',
                          }}
                        >
                          {dr.scaledScore >= 13 ? 'شديد (مرتفع جداً)' : dr.scaledScore >= 11 ? 'متوسط (فوق المتوسط)' : 'ضمن المتوسط'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Summary & Impressions */}
          {assessment.clinicalSummary && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text-main)', marginBottom: 8 }}>
                📝 الخلاصة الإكلينيكية والتشخيصية:
              </div>
              <div style={{ fontSize: '.84rem', color: 'var(--text-main)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {assessment.clinicalSummary}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {assessment.recommendations && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text-main)', marginBottom: 8 }}>
                💡 التوصيات والبرامج العلاجية والتربوية:
              </div>
              <div style={{ fontSize: '.84rem', color: 'var(--text-main)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {assessment.recommendations}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="fa"
          style={{
            padding: '12px 22px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--g0)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button type="button" className="btn btn-g" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>

      {/* IEP Bridge Modal Integration */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          student={{ id: assessment.stuId, name: assessment.studentName }}
          assessmentData={{
            ...assessment,
            scaleType: 'gars',
            results: assessment.results || assessment.scores || {},
          }}
        />
      )}
    </div>
  );
}
