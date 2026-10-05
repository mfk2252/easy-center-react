import { useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DOWN_SYNDROME_SCALES,
  DS_COPYRIGHT_INFO,
  calculateDownSyndromeScore,
} from '../../data/downSyndromeData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';

export default function DownSyndromeReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
  onOpenIepBridge,
}) {
  const { center, toast } = useApp();
  const printRef = useRef(null);

  const scale = useMemo(() => {
    if (!assessment) return DOWN_SYNDROME_SCALES[0];
    const measureId = assessment.measureId || assessment.scaleId || 'ds_scale';
    return DOWN_SYNDROME_SCALES.find(s => s.id === measureId) || DOWN_SYNDROME_SCALES[0];
  }, [assessment]);

  const scores = useMemo(() => {
    return assessment?.results || assessment?.scores || assessment?.responses || {};
  }, [assessment]);

  const psychometrics = useMemo(() => {
    if (!assessment || !scale) return null;
    return calculateDownSyndromeScore(scale.id, scores);
  }, [assessment, scale, scores]);

  if (!isOpen || !assessment || !psychometrics) return null;

  const items = scale.items || [];
  const masteredItems = items.filter(it => (scores[it.id] ?? 0) === 1.0);
  const emergingItems = items.filter(it => (scores[it.id] ?? 0) === 0.5);
  const deficitItems = items.filter(it => (scores[it.id] ?? 0) === 0.0);

  function handlePrint() {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '', 'height=800,width=1000');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير ${scale.name} — ${assessment.studentName || 'تقرير تشخيصي'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
            body {
              font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
              color: #1e293b;
              background: #fff;
              margin: 0;
              padding: 20px;
              direction: rtl;
              font-size: 13px;
              line-height: 1.6;
            }
            .no-print { display: none !important; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; }
            th { background-color: #f1f5f9; font-weight: 700; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; }
            @media print {
              body { margin: 0; padding: 10mm; background: #fff; }
              @page { size: A4; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      win.document.close();
    }
  }

  function handleShareWhatsApp() {
    const text = `*تقرير تقييم متلازمة داون — ${scale.name}*
المفحوص: ${assessment.studentName || '—'}
العمر: ${assessment.age || '—'}
التاريخ: ${assessment.date || '—'}
الدرجة المحققة: ${psychometrics.score} من أصل ${psychometrics.maxScore}
نسبة الإتقان النمائي: ${psychometrics.percentage}%
المستوى التشخيصي: ${psychometrics.level}
الأخصائي الفاحص: ${assessment.examinerName || '—'}
المركز: ${center?.name || 'مركز التربية الخاصة والتأهيل'}`;

    sendReportToWhatsApp({
      parentPhone: assessment.parentPhone || '',
      studentName: assessment.studentName,
      scaleName: scale.name,
      reportText: text,
    });
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1150 }}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1100px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'var(--bg-main, #ffffff)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          className="mhd"
          style={{
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #155e75 100%)',
            color: '#fff',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🧬</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  التقرير السريري الإكلينيكي — {scale.name}
                </h3>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    fontSize: '.68rem',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  بطارية متلازمة داون
                </span>
              </div>
              <div style={{ fontSize: '.76rem', color: '#cffafe', marginTop: 2 }}>
                {assessment.studentName || '—'} · تاريخ التقييم: {assessment.date || '—'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handlePrint}
              style={{
                background: '#fff',
                color: '#0891b2',
                fontWeight: 800,
                fontSize: '.78rem',
                border: 'none',
              }}
            >
              🖨️ طباعة التقرير
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleShareWhatsApp}
              style={{
                background: '#25D366',
                color: '#fff',
                fontWeight: 800,
                fontSize: '.78rem',
                border: 'none',
              }}
            >
              💬 مشاركة واتساب
            </button>
            {onEdit && (
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => {
                  onClose();
                  onEdit(assessment);
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '.78rem',
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
              >
                ✏️ تعديل التقييم
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
              }}
            >
              ✖
            </button>
          </div>
        </div>

        {/* MODAL BODY / REPORT PREVIEW */}
        <div
          className="modal-body-scroll"
          style={{
            padding: '20px',
            flex: 1,
            overflowY: 'auto',
            background: 'var(--bg-main, #ffffff)',
          }}
        >
          {/* PRINTABLE CONTAINER */}
          <div
            ref={printRef}
            style={{
              maxWidth: 920,
              margin: '0 auto',
              background: '#fff',
              padding: 24,
              borderRadius: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              color: '#1e293b',
              direction: 'rtl',
            }}
          >
            {/* OFFICIAL HEADER WITH LOGO */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #0891b2',
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 900, color: '#0891b2' }}>
                  {center?.name || 'مركز التربية الخاصة والتأهيل النمائي'}
                </h1>
                <div style={{ fontSize: '.84rem', color: '#64748b' }}>
                  وحدة التقييم والتشخيص النمائي لمتلازمة داون
                </div>
              </div>
              {center?.logo && (
                <img
                  src={center.logo}
                  alt="Logo"
                  style={{ maxHeight: 54, maxWidth: 140, objectFit: 'contain' }}
                />
              )}
            </div>

            {/* REPORT TITLE BANNER */}
            <div
              style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.08), rgba(6, 182, 212, 0.04))',
                border: '1.5px solid #0891b2',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
              }}
            >
              <h2 style={{ margin: '0 0 4px 0', fontSize: '1.18rem', fontWeight: 800, color: '#0e7490' }}>
                تقرير التقييم والتشخيص النمائي — {scale.name}
              </h2>
              <div style={{ fontSize: '.78rem', color: '#64748b' }}>
                {scale.nameEn}
              </div>
            </div>

            {/* ETHICAL CLINICAL DISCLAIMER & COPYRIGHT NOTICE */}
            <div
              style={{
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 18,
                fontSize: '.75rem',
                color: '#0f766e',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 2 }}>
                📜 إشعار الأمانة الأكاديمية والترخيص السريري:
              </div>
              <div>
                <b>الناشر والاعتماد:</b> {DS_COPYRIGHT_INFO.publisherAr} · <b>المرجعيات:</b> {DS_COPYRIGHT_INFO.academicAttribution}
              </div>
              <div style={{ marginTop: 2 }}>
                <b>الإخلاء الإكلينيكي:</b> {DS_COPYRIGHT_INFO.ethicalDisclaimer}
              </div>
            </div>

            {/* STUDENT & EXAMINER PROFILE TABLE */}
            <table style={{ width: '100%', marginBottom: 20, borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ width: '18%', fontWeight: 700, color: '#475569', padding: '8px 12px' }}>اسم الطالب:</td>
                  <td style={{ width: '32%', fontWeight: 800, color: '#0f172a', padding: '8px 12px' }}>{assessment.studentName || '—'}</td>
                  <td style={{ width: '18%', fontWeight: 700, color: '#475569', padding: '8px 12px' }}>العمر الزمني:</td>
                  <td style={{ width: '32%', fontWeight: 800, color: '#0f172a', padding: '8px 12px' }}>{assessment.age || '—'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#475569', padding: '8px 12px' }}>التشخيص:</td>
                  <td style={{ fontWeight: 700, color: '#0f172a', padding: '8px 12px' }}>{assessment.diagnosis || 'متلازمة داون'}</td>
                  <td style={{ fontWeight: 700, color: '#475569', padding: '8px 12px' }}>تاريخ التقييم:</td>
                  <td style={{ fontWeight: 700, color: '#0f172a', padding: '8px 12px' }}>{assessment.date || '—'}</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ fontWeight: 700, color: '#475569', padding: '8px 12px' }}>الأخصائي الفاحص:</td>
                  <td style={{ fontWeight: 700, color: '#0f172a', padding: '8px 12px' }}>{assessment.examinerName || '—'}</td>
                  <td style={{ fontWeight: 700, color: '#475569', padding: '8px 12px' }}>مصدر المعلومات:</td>
                  <td style={{ fontWeight: 700, color: '#0f172a', padding: '8px 12px' }}>{assessment.raterRelation || 'الأخصائي المتابع'}</td>
                </tr>
              </tbody>
            </table>

            {/* PERFORMANCE DASHBOARD CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#f0fdfa', border: '2px solid #5eead4', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: '.76rem', color: '#0f766e', fontWeight: 700 }}>الدرجة المحققة</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0891b2', margin: '4px 0' }}>
                  {psychometrics.score} <span style={{ fontSize: '.9rem', color: '#64748b' }}>/ {psychometrics.maxScore}</span>
                </div>
                <div style={{ fontSize: '.72rem', color: '#0d9488' }}>مجموع درجات بنود المقياس</div>
              </div>

              <div style={{ background: '#f8fafc', border: `2px solid ${psychometrics.severityColor}`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: '.76rem', color: '#475569', fontWeight: 700 }}>نسبة التطور والإتقان النمائي</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: psychometrics.severityColor, margin: '4px 0' }}>
                  {psychometrics.percentage}%
                </div>
                <div style={{ fontSize: '.72rem', color: '#64748b' }}>المعدل الإجمالي للاكتساب</div>
              </div>

              <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: '.76rem', color: '#475569', fontWeight: 700 }}>المستوى التشخيصي والتقديري</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: psychometrics.severityColor, margin: '8px 0' }}>
                  {psychometrics.level}
                </div>
                <div style={{ fontSize: '.72rem', color: '#64748b' }}>وفق المعايير النمائية لمتلازمة داون</div>
              </div>
            </div>

            {/* DETAILED ITEMS BREAKDOWN TABLE */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0e7490', borderBottom: '1.5px solid #0891b2', paddingBottom: 6, marginBottom: 10 }}>
                📊 تفاصيل استجابات بنود المقياس ({items.length} بنداً):
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ width: '6%', textAlign: 'center', padding: '6px' }}>#</th>
                    <th style={{ width: '54%', padding: '6px 10px' }}>البند النمائي / السلوكي</th>
                    <th style={{ width: '20%', padding: '6px 10px' }}>المجال النمائي</th>
                    <th style={{ width: '20%', textAlign: 'center', padding: '6px' }}>مستوى الأداء</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const val = scores[it.id];
                    let label = 'غير مقيم';
                    let bg = '#f1f5f9';
                    let col = '#64748b';

                    if (val === 1.0) {
                      label = 'مكتسب تماماً ✅';
                      bg = '#d1fae5';
                      col = '#065f46';
                    } else if (val === 0.5) {
                      label = 'في طور الاكتساب ⏳';
                      bg = '#fef3c7';
                      col = '#92400e';
                    } else if (val === 0.0) {
                      label = 'غير مكتسب ❌';
                      bg = '#fee2e2';
                      col = '#991b1b';
                    }

                    return (
                      <tr key={it.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ textAlign: 'center', fontWeight: 700, padding: '6px' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>{it.text}</td>
                        <td style={{ padding: '6px 10px', color: '#64748b' }}>{it.domain || 'عام'}</td>
                        <td style={{ textAlign: 'center', padding: '6px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, background: bg, color: col, fontWeight: 700, fontSize: '.72rem' }}>
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CLINICAL SUMMARY */}
            {assessment.clinicalSummary && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0e7490', borderBottom: '1.5px solid #0891b2', paddingBottom: 6, marginBottom: 8 }}>
                  📝 الخلاصة السريرية ومستوى الأداء الحالي:
                </h3>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, fontSize: '.84rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {assessment.clinicalSummary}
                </div>
              </div>
            )}

            {/* RECOMMENDATIONS & IEP TARGETS */}
            {(assessment.recommendations || deficitItems.length > 0) && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0e7490', borderBottom: '1.5px solid #0891b2', paddingBottom: 6, marginBottom: 8 }}>
                  🎯 التوصيات والأهداف المقترحة للخطة الفردية (IEP Goals):
                </h3>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12, fontSize: '.84rem', lineHeight: 1.6 }}>
                  {assessment.recommendations ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{assessment.recommendations}</div>
                  ) : (
                    <div>
                      {deficitItems.map(d => (
                        <div key={d.id} style={{ marginBottom: 4 }}>
                          • <b>{d.text}:</b> {d.iepGoal || 'تدريب فردي مكثف وتطوير المهارة'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SCIENTIFIC REFERENCE & COPYRIGHT ATTRIBUTION */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 20,
                fontSize: '.75rem',
                color: '#475569',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 800, color: '#0e7490', marginBottom: 4 }}>
                ⚖️ الاعتماد العلمي وحقوق الملكية الفكرية ({scale.name}):
              </div>
              <div><b>المؤلف والجهة الأصلية:</b> {scale.originalAuthor || 'المرجعيات النمائية العالمية'} · <b>التقنين:</b> {scale.adaptationAndNorms || 'معايير التأهيل المقننة'}</div>
              <div style={{ marginTop: 3, fontStyle: 'italic' }}>{scale.copyrightNotice}</div>
            </div>

            {/* OFFICIAL SIGNATURES BLOCK */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px dashed #94a3b8',
                paddingTop: 18,
                marginTop: 20,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: '#334155' }}>الأخصائي الفاحص:</div>
                <div style={{ marginTop: 4, color: '#64748b' }}>{assessment.examinerName || '_______________'}</div>
                <div style={{ marginTop: 12 }}>التوقيع: _______________</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, color: '#334155' }}>اعتماد المشرف الفني / مدير المركز:</div>
                <div style={{ marginTop: 4, color: '#64748b' }}>{center?.name || '_______________'}</div>
                <div style={{ marginTop: 12 }}>الختم والتوقيع: _______________</div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          className="mft"
          style={{
            padding: '12px 20px',
            background: 'var(--g0, #f8fafc)',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onOpenIepBridge && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  onClose();
                  onOpenIepBridge(assessment);
                }}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '.8rem',
                  padding: '7px 14px',
                  borderRadius: 8,
                }}
              >
                🎯 تحويل بنود الضعف إلى الخطة الفردية (IEP Bridge)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handlePrint}
              style={{
                background: '#0891b2',
                color: '#fff',
                fontWeight: 800,
                fontSize: '.82rem',
                padding: '7px 16px',
                borderRadius: 8,
              }}
            >
              🖨️ طباعة
            </button>
            <button
              type="button"
              className="btn btn-sm btn-g"
              onClick={onClose}
              style={{ fontWeight: 700 }}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
