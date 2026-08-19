import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CARS2_ITEMS, CARS2_DOMAINS, calculateCARS2Psychometrics } from '../../data/cars2Data';
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
    return extractRecommendedGoals('cars', assessment.results || assessment.scores || {}, CARS2_ITEMS);
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  function handlePrint() {
    const domainHtml = psychometrics.domainScores.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:bold;color:#1e40af;">${d.name}</td>
        <td style="padding:8px 12px;text-align:center;">${d.score} / ${d.maxScore}</td>
        <td style="padding:8px 12px;text-align:center;">${d.avg}</td>
        <td style="padding:8px 12px;text-align:center;">${d.percentage}%</td>
      </tr>
    `).join('');

    const itemsHtml = CARS2_ITEMS.map(it => {
      const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
      const anchor = it.anchors.find(a => a.score === score);
      const note = assessment.itemNotes?.[it.id] || '';

      return `
        <tr style="border-bottom:1px solid #e2e8f0;background:${score && score >= 3 ? '#fef2f2' : score && score >= 2 ? '#fffbeb' : '#ffffff'};">
          <td style="padding:8px 10px;text-align:center;font-weight:bold;">${it.id}</td>
          <td style="padding:8px 10px;font-weight:bold;">${it.title}</td>
          <td style="padding:8px 10px;text-align:center;font-weight:bold;font-size:1.05em;color:#1e40af;">${score !== null ? score.toFixed(1) : '—'}</td>
          <td style="padding:8px 10px;font-size:0.9em;color:#334155;">
            ${anchor ? `<b>${anchor.label}:</b> ${anchor.description}` : '—'}
            ${note ? `<br/><i style="color:#64748b;">ملاحظة: ${note}</i>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:10px;">
        <div style="border-bottom:3px solid #1e40af;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="color:#1e40af;font-size:22px;margin:0 0 4px 0;">🧩 تقرير التقييم والتشخيص النفسي الإكلينيكي (CARS-2)</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">Childhood Autism Rating Scale, 2nd Edition · مقياس تقدير التوحد في الطفولة</p>
          </div>
          <div style="text-align:left;font-size:12px;color:#475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>الرقم المرجعي:</b> ${assessment.id ? assessment.id.slice(0, 8) : 'CARS2'}</div>
          </div>
        </div>

        <table style="width:100%;margin-bottom:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:10px;font-size:13px;">
          <tr>
            <td style="padding:6px 10px;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:6px 10px;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:6px 10px;"><b>تاريخ الفحص:</b> ${assessment.date || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px;"><b>التشخيص المبدئي:</b> ${assessment.diagnosis || '—'}</td>
            <td style="padding:6px 10px;"><b>الأخصائي الفاحص:</b> ${assessment.specialistName || '—'}</td>
            <td style="padding:6px 10px;"><b>ولي الأمر:</b> ${assessment.parentName || '—'} (${assessment.parentPhone || '—'})</td>
          </tr>
        </table>

        <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;padding:14px;margin-bottom:18px;">
          <h3 style="margin:0 0 10px 0;color:#1e40af;font-size:16px;">📊 المؤشرات السيكومترية والدرجات المعيارية (Psychometric Indices)</h3>
          <div style="display:flex;justify-content:space-around;text-align:center;font-size:13px;">
            <div style="background:#ffffff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <div style="color:#64748b;">الدرجة الخام الكلية</div>
              <div style="font-size:20px;font-weight:900;color:#1e40af;">${psychometrics.rawScore} <span style="font-size:12px;color:#94a3b8;">/ 60</span></div>
            </div>
            <div style="background:#ffffff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <div style="color:#64748b;">الدرجة التائية المعيارية (T)</div>
              <div style="font-size:20px;font-weight:900;color:#0f172a;">${psychometrics.tScore}</div>
            </div>
            <div style="background:#ffffff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <div style="color:#64748b;">الرتبة المئينية (% Rank)</div>
              <div style="font-size:20px;font-weight:900;color:#0f172a;">${psychometrics.percentile}%</div>
            </div>
            <div style="background:#ffffff;padding:8px 14px;border-radius:6px;border:1px solid #bfdbfe;">
              <div style="color:#64748b;">التصنيف التشخيصي المعتمد</div>
              <div style="font-size:15px;font-weight:900;color:${psychometrics.severityKey === 'severe' ? '#dc2626' : psychometrics.severityKey === 'mild_moderate' ? '#d97706' : '#059669'};margin-top:4px;">
                ${psychometrics.severityLabel}
              </div>
            </div>
          </div>
        </div>

        <h3 style="color:#1e40af;font-size:15px;margin:16px 0 8px 0;">🌐 مظهر الأداء عبر المجالات النمائية الأربعة:</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:13px;border:1px solid #cbd5e1;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:8px 12px;text-align:right;">المجال النمائي</th>
              <th style="padding:8px 12px;text-align:center;">الدرجة المحققة</th>
              <th style="padding:8px 12px;text-align:center;">متوسط البند (1-4)</th>
              <th style="padding:8px 12px;text-align:center;">نسبة التأثر</th>
            </tr>
          </thead>
          <tbody>
            ${domainHtml}
          </tbody>
        </table>

        <h3 style="color:#1e40af;font-size:15px;margin:16px 0 8px 0;">📝 جدول تقييم بنود مقياس CARS-2 التفصيلية (15 بنداً):</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;border:1px solid #cbd5e1;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:8px 10px;width:30px;text-align:center;">#</th>
              <th style="padding:8px 10px;width:180px;text-align:right;">البند التشخيصي</th>
              <th style="padding:8px 10px;width:50px;text-align:center;">الدرجة</th>
              <th style="padding:8px 10px;text-align:right;">السلوك المرصود ووصف الدرجة</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-bottom:16px;">
          <h3 style="color:#1e40af;font-size:15px;margin:0 0 6px 0;">📌 الخلاصة التشخيصية والتفسير الإكلينيكي:</h3>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:13px;line-height:1.6;white-space:pre-wrap;">
            ${assessment.clinicalSummary || psychometrics.clinicalImpression}
          </div>
        </div>

        <div style="margin-bottom:24px;">
          <h3 style="color:#1e40af;font-size:15px;margin:0 0 6px 0;">💡 التوصيات العلاجية والبرنامج التأهيلي المقترح:</h3>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:13px;line-height:1.6;white-space:pre-wrap;">
            ${assessment.recommendations || 'يوصى بوضع خطة تربوية وسلوكية فردية ومتابعة التطور بشكل دوري.'}
          </div>
        </div>

        <div style="margin-top:35px;display:flex;justify-content:space-between;border-top:1.5px dashed #94a3b8;padding-top:18px;font-size:13px;">
          <div style="text-align:center;">
            <div><b>الأخصائي القائم بالتقييم</b></div>
            <div style="margin-top:8px;color:#64748b;">${assessment.specialistName || '________________'}</div>
            <div style="margin-top:25px;">التوقيع: _______________</div>
          </div>
          <div style="text-align:center;">
            <div><b>المشرف الفني / الأخصائي النفسي</b></div>
            <div style="margin-top:8px;color:#64748b;">________________</div>
            <div style="margin-top:25px;">التوقيع: _______________</div>
          </div>
          <div style="text-align:center;">
            <div><b>اعتماد مدير المركز والختم الرسمي</b></div>
            <div style="margin-top:8px;color:#64748b;">${center?.name || 'مركز التأهيل'}</div>
            <div style="margin-top:25px;">الختم: _______________</div>
          </div>
        </div>
      </div>
    `;

    printItem({ html }, 'cars2_report', center?.logo, center?.name);
  }

  function handleSendWhatsApp() {
    sendReportToWhatsApp({
      parentPhone: assessment.parentPhone,
      parentName: assessment.parentName,
      studentName: assessment.studentName,
      reportTitle: 'تقرير مقياس كارز-2 (CARS-2) لتقدير التوحد',
      reportType: 'تقرير تشخيصي مقنن',
      date: assessment.date,
      summary: `الدرجة الخام: ${psychometrics.rawScore}/60 (الدرجة المعيارية T=${psychometrics.tScore}، الرتبة المئينية ${psychometrics.percentile}%)\nالتشخيص المعتمد: ${psychometrics.severityLabel}`,
      recommendations: assessment.recommendations || assessment.clinicalSummary,
      specialistName: assessment.specialistName,
      centerName: center?.name,
    });
  }

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div
        className="mb mb-xl"
        style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16,
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          width: 'min(980px, calc(100vw - 20px))',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e40af, #2563eb)',
            color: '#fff',
            padding: '16px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🧩</span> <span>تقرير التشخيص والتقييم النفسي المعتمد — CARS-2</span>
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '.82rem', opacity: 0.9 }}>
              Childhood Autism Rating Scale, 2nd Edition · تقرير شامل مفصل
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-p"
              onClick={handlePrint}
              style={{ background: '#fff', color: '#1e40af', fontWeight: 800, borderRadius: 8 }}
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

        {/* Scrollable Report Content */}
        <div className="modal-body-scroll" style={{ padding: '20px 24px' }}>
          {/* Demographic Box */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div>
              <span style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>اسم الطالب:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{assessment.studentName || '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>العمر الزمني:</span>
              <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{assessment.age || '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>تاريخ الفحص:</span>
              <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{assessment.date || '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>الأخصائي الفاحص:</span>
              <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{assessment.specialistName || '—'}</div>
            </div>
          </div>

          {/* 4 Psychometric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--pr)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>الدرجة الخام الكلية (Raw)</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--pr)', margin: '4px 0' }}>
                {psychometrics.rawScore} <span style={{ fontSize: '.9rem', color: 'var(--text-sub)' }}>/ 60.0</span>
              </div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>المدى: 15.0 إلى 60.0</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>الدرجة المعيارية (T-Score)</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', margin: '4px 0' }}>
                {psychometrics.tScore}
              </div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>المتوسط = 50 (±10)</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>الرتبة المئينية (% Rank)</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', margin: '4px 0' }}>
                {psychometrics.percentile}%
              </div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>مقارنة بالعينة المعيارية</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>المستوى التشخيصي</span>
              <div style={{ margin: '8px 0' }}>
                <span className={`bdg ${psychometrics.severityBadgeClass}`} style={{ fontSize: '.84rem', fontWeight: 900 }}>
                  {psychometrics.severityLabel}
                </span>
              </div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>نقطة القطع: 30.0 / 37.0</span>
            </div>
          </div>

          {/* Domain Breakdown Cards */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🌐</span> <span>تحليل المجالات النمائية الأربعة</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
              {psychometrics.domainScores.map(d => (
                <div
                  key={d.id}
                  style={{
                    background: 'var(--g0)',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', fontWeight: 800, marginBottom: 6 }}>
                    <span style={{ color: d.color }}>{d.name}</span>
                    <span>{d.score} / {d.maxScore}</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${d.percentage}%`, height: '100%', background: d.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--text-sub)', marginTop: 6 }}>
                    <span>متوسط البند: <strong>{d.avg}</strong></span>
                    <span>تأثر: <strong>{d.percentage}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed 15 Items Table */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              overflowX: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📋</span> <span>سجل الدرجات التفصيلي لبنود مقياس CARS-2 (15 بنداً)</span>
            </h3>

            <table className="tbl" style={{ width: '100%', fontSize: '.82rem' }}>
              <thead>
                <tr>
                  <th style={{ width: 36, textAlign: 'center' }}>#</th>
                  <th style={{ minWidth: 160 }}>البند التشخيصي</th>
                  <th style={{ width: 64, textAlign: 'center' }}>الدرجة</th>
                  <th style={{ minWidth: 260 }}>السلوك والملاحظة المرصودة</th>
                </tr>
              </thead>
              <tbody>
                {CARS2_ITEMS.map(it => {
                  const score = assessment.results?.[it.id] !== undefined ? Number(assessment.results[it.id]) : null;
                  const anchor = it.anchors.find(a => a.score === score);
                  const note = assessment.itemNotes?.[it.id] || '';

                  return (
                    <tr key={it.id}>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{it.id}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{it.title}</div>
                        <div style={{ fontSize: '.74rem', color: 'var(--text-sub)' }}>{it.domainName}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="bdg"
                          style={{
                            fontWeight: 900,
                            fontSize: '.85rem',
                            background: score >= 3 ? '#fee2e2' : score >= 2 ? '#fef3c7' : '#dcfce7',
                            color: score >= 3 ? '#b91c1c' : score >= 2 ? '#b45309' : '#15803d',
                          }}
                        >
                          {score !== null ? score.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td>
                        {anchor ? (
                          <div>
                            <strong style={{ color: 'var(--text-main)' }}>{anchor.label}: </strong>
                            <span>{anchor.description}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-sub)' }}>لم يتم رصد الدرجة</span>
                        )}
                        {note && (
                          <div style={{ marginTop: 4, fontSize: '.75rem', color: 'var(--pr)', fontStyle: 'italic' }}>
                            📝 ملاحظة الفاحص: {note}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Clinical Interpretation Box */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📌</span> <span>الخلاصة الإكلينيكية والتشخيص النفسي</span>
            </h3>
            <p style={{ margin: 0, fontSize: '.86rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
              {assessment.clinicalSummary || psychometrics.clinicalImpression}
            </p>
          </div>

          {/* Recommendations Box */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💡</span> <span>التوصيات والبرنامج التأهيلي المقترح</span>
            </h3>
            <p style={{ margin: 0, fontSize: '.86rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
              {assessment.recommendations || 'يوصى بوضع خطة تربوية وسلوكية فردية ومتابعة التطور بشكل دوري.'}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="fa"
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--g0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: '.82rem', color: 'var(--text-sub)' }}>
            تم التقييم بواسطة: <strong>{assessment.specialistName || 'الأخصائي المعتمد'}</strong> · تاريخ {assessment.date}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-p"
              onClick={() => setBridgeOpen(true)}
              style={{
                fontWeight: 800,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #4338ca, #2563eb)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🎓</span>
              <span>اشتقاق أهداف الخطة (IEP Bridge)</span>
              {recommendedGoals.length > 0 && (
                <span style={{ background: '#fff', color: '#1e40af', padding: '1px 6px', borderRadius: 10, fontSize: '.74rem', fontWeight: 900 }}>
                  {recommendedGoals.length}
                </span>
              )}
            </button>
            <button
              type="button"
              className="btn btn-s"
              onClick={handlePrint}
              style={{ fontWeight: 800, borderRadius: 8 }}
            >
              🖨️ طباعة التقرير
            </button>
            <button
              type="button"
              className="btn btn-g"
              onClick={onClose}
              style={{ fontWeight: 700, borderRadius: 8 }}
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
          student={{
            studentId: assessment.studentId,
            studentName: assessment.studentName,
            nationalId: assessment.nationalId,
            diagnosis: assessment.diagnosis,
            className: assessment.className,
            parentName: assessment.parentName,
            parentPhone: assessment.parentPhone,
          }}
          assessmentData={{
            measureId: 'cars',
            measureName: 'مقياس تقدير التوحد في الطفولة CARS-2',
            date: assessment.date,
            score: assessment.score || psychometrics?.rawScore,
            results: assessment.results || assessment.scores || {},
          }}
          scaleItems={CARS2_ITEMS}
        />
      )}
    </div>
  );
}
