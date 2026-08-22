import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MYKLEBUST_COPYRIGHT_INFO,
  MYKLEBUST_DIMENSIONS,
  MYKLEBUST_ITEMS,
  MYKLEBUST_RATING_OPTIONS,
  calculateMyklebustPsychometrics,
} from '../../data/myklebustData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function MyklebustReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp?.() || {};
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const psych = useMemo(() => {
    if (!assessment) return null;
    if (assessment.psychometrics) return assessment.psychometrics;
    return calculateMyklebustPsychometrics(assessment.scores || assessment.results || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'myklebust',
      assessment.scores || assessment.results || {},
      MYKLEBUST_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psych) return null;

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const text = `📋 *تقرير مقياس مايكل بيست لتشخيص صعوبات التعلم (Myklebust PRS)*\n` +
      `👤 *اسم التلميذ:* ${assessment.studentName || '—'}\n` +
      `📅 *تاريخ الفحص:* ${assessment.date || '—'}\n` +
      `--------------------------------\n` +
      `📊 *المجموع الكلي:* ${psych.totalRawScore} من 120 (${psych.overallPercentage}%)\n` +
      `🗣️ *المجال اللفظي:* ${psych.verbalScore} من 45 (الفاصل: 27) - [${psych.isVerbalDeficit ? 'قصور دال' : 'طبيعي'}]\n` +
      `🧭 *المجال غير اللفظي:* ${psych.nonVerbalScore} من 75 (الفاصل: 45) - [${psych.isNonVerbalDeficit ? 'قصور دال' : 'طبيعي'}]\n` +
      `🎯 *القرار التشخيصي:* ${psych.diagnosisType}\n` +
      `--------------------------------\n` +
      `💡 *الخلاصة:* ${assessment.clinicalSummary ? assessment.clinicalSummary.slice(0, 180) + '...' : psych.diagnosisDescription}\n\n` +
      `تم استخراج هذا التقرير رسمياً عبر منظومة برامج التربية الخاصة وصعوبات التعلم.`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  const scores = assessment.scores || assessment.results || {};

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1100 }}>
      <div
        className="mb mb-xl"
        style={{
          width: '96vw',
          maxWidth: 1040,
          maxHeight: 'min(95vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Top Header (No Print) */}
        <div
          className="no-print"
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>📄</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                تقرير مقياس مايكل بيست للتعرف على صعوبات التعلم (PRS)
              </h3>
              <span style={{ fontSize: '.74rem', opacity: 0.9 }}>
                Helmer Myklebust Pupil Rating Scale · تقنين د. مصطفى كامل ود. تيسير كوافحة
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-xs btn-p"
              onClick={() => setBridgeOpen(true)}
              style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4338ca, #3b82f6)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>🎓</span>
              <span>اشتقاق خطة فردية (IEP)</span>
            </button>

            <button
              type="button"
              className="btn btn-xs"
              onClick={handleShareWhatsApp}
              style={{ background: '#22c55e', color: '#fff', fontWeight: 800 }}
            >
              📱 واتساب
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => { onClose(); onEdit(assessment); }}
                className="btn btn-xs"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700 }}
              >
                ✏️ تعديل الدرجات
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-xs"
              style={{ background: '#f59e0b', color: '#78350f', fontWeight: 800 }}
            >
              🖨️ طباعة التقرير
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                width: 30,
                height: 30,
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#fff' }} className="print-area">
          {/* Official Header */}
          <div style={{ borderBottom: '2px solid #0891b2', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#0e7490' }}>المملكة العربية السعودية</div>
              <div style={{ fontSize: '.8rem', color: '#475569' }}>وزارة التعليم · الإدارة العامة للتربية الخاصة</div>
              <div style={{ fontSize: '.75rem', color: '#64748b' }}>برامج صعوبات التعلم وغرف المصادر</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#0e7490' }}>
                تقرير مقياس مايكل بيست للتعرف على صعوبات التعلم
              </div>
              <div style={{ fontSize: '.84rem', fontWeight: 700, color: '#d97706', marginTop: 3 }}>
                Myklebust Pupil Rating Scale (PRS)
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: '.8rem', color: '#64748b' }}>
              <div>تاريخ التطبيق: <strong style={{ color: '#1e293b' }}>{assessment.date || '—'}</strong></div>
              <div>الرقم المرجعي: <strong style={{ color: '#1e293b' }}>{assessment.id ? assessment.id.slice(0, 8) : 'MYK-PRS'}</strong></div>
            </div>
          </div>

          {/* Student Info Card */}
          <table style={{ width: '100%', marginBottom: 18, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '6px 10px' }}><b>اسم التلميذ:</b> {assessment.studentName || '—'}</td>
                <td style={{ padding: '6px 10px' }}><b>العمر الزمني:</b> {assessment.age || '—'}</td>
                <td style={{ padding: '6px 10px' }}><b>تاريخ الفحص:</b> {assessment.date || '—'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 10px' }}><b>المدرسة / الصف:</b> {assessment.schoolName || '—'} ({assessment.studentGrade || assessment.semester || '—'})</td>
                <td style={{ padding: '6px 10px' }}><b>القائم بالتقييم:</b> {assessment.evaluator || assessment.specialistName || 'أخصائي صعوبات التعلم'}</td>
                <td style={{ padding: '6px 10px' }}><b>ولي الأمر:</b> {assessment.parentName || '—'} ({assessment.parentPhone || '—'})</td>
              </tr>
            </tbody>
          </table>

          {/* KPI Psychometric Box */}
          <div style={{ background: '#ecfeff', border: '1.5px solid #a5f3fc', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0e7490', fontSize: '14px', fontWeight: 800 }}>
              📊 المؤشرات السيكومترية والدرجات المقننة لمقياس مايكل بيست:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, textAlign: 'center' }}>
              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid #cffafe' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>الدرجة الكلية الخام</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: psych.overallColor }}>
                  {psych.totalRawScore} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ 120</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>متوسط الأقران: 72</div>
              </div>

              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: `1px solid ${psych.isVerbalDeficit ? '#fecaca' : '#cffafe'}` }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>المجال اللفظي (9 بنود)</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: psych.isVerbalDeficit ? '#dc2626' : '#2563eb' }}>
                  {psych.verbalScore} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ 45</span>
                </div>
                <div style={{ fontSize: '11px', color: psych.isVerbalDeficit ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                  {psych.isVerbalDeficit ? '⚠️ قصور دال (< 27)' : '✓ طبيعي (≥ 27)'}
                </div>
              </div>

              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: `1px solid ${psych.isNonVerbalDeficit ? '#fecaca' : '#cffafe'}` }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>المجال غير اللفظي (15 بنداً)</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: psych.isNonVerbalDeficit ? '#dc2626' : '#0891b2' }}>
                  {psych.nonVerbalScore} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ 75</span>
                </div>
                <div style={{ fontSize: '11px', color: psych.isNonVerbalDeficit ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                  {psych.isNonVerbalDeficit ? '⚠️ قصور دال (< 45)' : '✓ طبيعي (≥ 45)'}
                </div>
              </div>

              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${psych.overallColor}` }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>القرار التشخيصي النهائي</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: psych.overallColor, marginTop: 4 }}>
                  {psych.diagnosisType}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>نسبة التحقق: {psych.overallPercentage}%</div>
              </div>
            </div>
          </div>

          {/* Subscales Breakdown Table */}
          <h4 style={{ color: '#0e7490', fontSize: '14px', margin: '16px 0 8px 0', fontWeight: 800 }}>
            🌐 توزيع درجات الأداء عبر أبعاد المقياس الخمسة:
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18, fontSize: '13px', border: '1px solid #e2e8f0' }}>
            <thead style="background:#f1f5f9;">
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>البعد / المجال</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>المجال التابع</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>الدرجة المحققة</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>الحد الفاصل للقصور</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>الحالة والتقدير</th>
              </tr>
            </thead>
            <tbody>
              {psych.dimensionScores.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #e2e8f0', background: d.isDeficit ? '#fef2f2' : '#ffffff' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>
                    {d.name}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px' }}>
                    <span className="bdg" style={{ background: d.scaleGroup === 'verbal' ? '#e0e7ff' : '#ecfeff', color: d.scaleGroup === 'verbal' ? '#3730a3' : '#0e7490' }}>
                      {d.scaleGroup === 'verbal' ? 'لفظي' : 'غير لفظي'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: d.isDeficit ? '#dc2626' : '#0891b2' }}>
                    {d.score} / {d.maxScore}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>
                    &lt; {d.cutoffScore}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 800, color: d.isDeficit ? '#dc2626' : '#16a34a', fontSize: '12px' }}>
                      {d.levelLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Detailed Items Table */}
          <h4 style={{ color: '#0e7490', fontSize: '14px', margin: '16px 0 8px 0', fontWeight: 800 }}>
            📝 جدول تقييم بنود مقياس مايكل بيست التفصيلية (24 بنداً):
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: '12px', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '6px 8px', width: '30px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '6px 8px', width: '160px', textAlign: 'right' }}>البند المقنن</th>
                <th style={{ padding: '6px 8px', width: '90px', textAlign: 'center' }}>البعد</th>
                <th style={{ padding: '6px 8px', width: '50px', textAlign: 'center' }}>الدرجة</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>السلوك الملاحظ والتقدير الإكلينيكي</th>
              </tr>
            </thead>
            <tbody>
              {MYKLEBUST_ITEMS.map(it => {
                const itemScore = scores[it.id];
                const opt = it.options.find(o => o.score === itemScore);
                const note = assessment.itemNotes?.[it.id];
                const dim = MYKLEBUST_DIMENSIONS.find(d => d.id === it.dimensionId);
                const isDeficit = itemScore <= 2;

                return (
                  <tr key={it.id} style={{ borderBottom: '1px solid #e2e8f0', background: isDeficit ? '#fef2f2' : '#ffffff' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, color: '#64748b' }}>{it.id}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1e293b' }}>{it.title}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                      {dim?.name?.split(':')[1] || dim?.name}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 900, color: isDeficit ? '#dc2626' : '#0891b2' }}>
                      {itemScore !== undefined ? itemScore : '—'}
                    </td>
                    <td style={{ padding: '6px 8px', color: '#334155' }}>
                      {opt ? <span><b>{opt.label}:</b> {opt.description}</span> : '—'}
                      {note && <div style={{ color: '#b45309', fontSize: '11px', marginTop: 2 }}>ملاحظة: {note}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Clinical Impression & Recommendations */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#0e7490', fontSize: '14px', margin: '0 0 6px 0', fontWeight: 800 }}>
              📌 الخلاصة التشخيصية والتفسير الإكلينيكي:
            </h4>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {assessment.clinicalSummary || psych.diagnosisDescription}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: '#0e7490', fontSize: '14px', margin: '0 0 6px 0', fontWeight: 800 }}>
              💡 التوصيات التربوية والخطة العلاجية المقترحة:
            </h4>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {assessment.recommendations || 'يوصى بتقديم الدعم التربوي الملائم والتنسيق بين معلم الصف ومعلم صعوبات التعلم والأسرة.'}
            </div>
          </div>

          {/* Signatures Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 32, paddingTop: 16, borderTop: '2px solid #e2e8f0', fontSize: '13px' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 35 }}>معلم / أخصائي صعوبات التعلم</div>
              <div style={{ borderTop: '1px dotted #94a3b8', paddingTop: 4, color: '#64748b' }}>
                {assessment.evaluator || assessment.specialistName || 'التوقيع والاعتماد'}
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 35 }}>المرشد الطلابي / الأخصائي النفسي</div>
              <div style={{ borderTop: '1px dotted #94a3b8', paddingTop: 4, color: '#64748b' }}>
                الختم والتوقيع
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 35 }}>مدير المدرسة / قائد البرنامج</div>
              <div style={{ borderTop: '1px dotted #94a3b8', paddingTop: 4, color: '#64748b' }}>
                الاعتماد الرسمي
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IEP Bridge Modal Integration */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          goals={recommendedGoals}
        />
      )}
    </div>
  );
}
