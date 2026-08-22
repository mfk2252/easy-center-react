import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LDDRS_COPYRIGHT_INFO,
  LDDRS_SCALES,
  LDDRS_ITEMS,
  LDDRS_RATING_OPTIONS,
  calculateLDDRSPsychometrics,
} from '../../data/lddrsData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function LDDRSReportModal({
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
    return calculateLDDRSPsychometrics(assessment.scores || assessment.results || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'lddrs',
      assessment.scores || assessment.results || {},
      LDDRS_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psych) return null;

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const text = `📋 *تقرير بطارية مقاييس التقدير التشخيصية لصعوبات التعلم (LDDRS)*\n` +
      `👤 *اسم التلميذ:* ${assessment.studentName || '—'}\n` +
      `📅 *تاريخ الفحص:* ${assessment.date || '—'}\n` +
      `--------------------------------\n` +
      `📊 *المجموع الكلي:* ${psych.totalRawScore} (تم تقييم ${psych.evaluatedScales.length} مقاييس)\n` +
      `🎯 *القرار التشخيصي:* ${psych.overallStatus}\n` +
      `⚠️ *المقاييس المتأثرة:* ${psych.deficitScales.length > 0 ? psych.deficitScales.map(s => s.name).join('، ') : 'لا توجد'}\n` +
      `--------------------------------\n` +
      `💡 *الخلاصة:* ${assessment.clinicalSummary ? assessment.clinicalSummary.slice(0, 180) + '...' : psych.conclusionText}\n\n` +
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
            background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
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
            <span style={{ fontSize: '1.4rem' }}>📑</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                تقرير بطارية مقاييس التقدير التشخيصية لصعوبات التعلم (LDDRS)
              </h3>
              <span style={{ fontSize: '.74rem', opacity: 0.9 }}>
                أ.د. فتحي مصطفى الزيات · بطارية التقدير التشخيصي النمائية والأكاديمية
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
          <div style={{ borderBottom: '2px solid #dc2626', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#991b1b' }}>المملكة العربية السعودية</div>
              <div style={{ fontSize: '.8rem', color: '#475569' }}>وزارة التعليم · الإدارة العامة للتربية الخاصة</div>
              <div style={{ fontSize: '.75rem', color: '#64748b' }}>برامج صعوبات التعلم النمائية والأكاديمية</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#991b1b' }}>
                تقرير بطارية مقاييس التقدير التشخيصية (LDDRS)
              </div>
              <div style={{ fontSize: '.84rem', fontWeight: 700, color: '#d97706', marginTop: 3 }}>
                إعداد وتقنين: أ.د. فتحي مصطفى الزيات
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: '.8rem', color: '#64748b' }}>
              <div>تاريخ التطبيق: <strong style={{ color: '#1e293b' }}>{assessment.date || '—'}</strong></div>
              <div>الرقم المرجعي: <strong style={{ color: '#1e293b' }}>{assessment.id ? assessment.id.slice(0, 8) : 'LDDRS'}</strong></div>
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
          <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '14px', fontWeight: 800 }}>
              📊 المؤشرات السيكومترية العامة لبطارية الزيات (LDDRS):
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, textAlign: 'center' }}>
              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecdd3' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>المجموع الخام الكلي</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: psych.overallColor }}>
                  {psych.totalRawScore} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ {psych.totalMaxScore || 640}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>تم تقييم {psych.totalAnswered} بنداً</div>
              </div>

              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecdd3' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>المقاييس المطبقة</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#991b1b' }}>
                  {psych.evaluatedScales.length} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ {LDDRS_SCALES.length} مقاييس</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>نمائية وأكاديمية</div>
              </div>

              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: `1px solid ${psych.deficitScales.length > 0 ? '#fecaca' : '#fecdd3'}` }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>المقاييس ذات الصعوبة الدالة</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: psych.deficitScales.length > 0 ? '#dc2626' : '#16a34a' }}>
                  {psych.deficitScales.length} <span style={{ fontSize: '12px', color: '#94a3b8' }}>مقاييس</span>
                </div>
                <div style={{ fontSize: '11px', color: psych.deficitScales.length > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                  {psych.deficitScales.length > 0 ? 'تتطلب خطة تدخل IEP' : 'ضمن المستوى الطبيعي'}
                </div>
              </div>

              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${psych.overallColor}` }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>القرار التشخيصي الإجمالي</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: psych.overallColor, marginTop: 4 }}>
                  {psych.overallStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Subscales Profiles Table */}
          <h4 style={{ color: '#991b1b', fontSize: '14px', margin: '16px 0 8px 0', fontWeight: 800 }}>
            🌐 خلاصة أداء التلميذ على مقاييس التقدير التشخيصية الفرعية:
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18, fontSize: '13px', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>المقياس الفرعي</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>النوع</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>الدرجة الخام</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>الرتبة المئينية</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>مستوى الشدة والتقدير</th>
              </tr>
            </thead>
            <tbody>
              {psych.scaleResults.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', background: s.isDeficit ? '#fef2f2' : '#ffffff' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>
                    {s.name}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px' }}>
                    <span className="bdg" style={{ background: s.type === 'developmental' ? '#e0e7ff' : '#fef3c7', color: s.type === 'developmental' ? '#3730a3' : '#92400e' }}>
                      {s.typeName}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: s.severityColor || '#334155' }}>
                    {s.rawScore} / {s.maxScore}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>
                    {s.percentile}%
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 800, color: s.severityColor || '#64748b', fontSize: '12px' }}>
                      {s.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Clinical Impression & Recommendations */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#991b1b', fontSize: '14px', margin: '0 0 6px 0', fontWeight: 800 }}>
              📌 الخلاصة التشخيصية والتفسير الإكلينيكي:
            </h4>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {assessment.clinicalSummary || psych.conclusionText}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: '#991b1b', fontSize: '14px', margin: '0 0 6px 0', fontWeight: 800 }}>
              💡 التوصيات التربوية والخطة العلاجية المقترحة:
            </h4>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {assessment.recommendations || 'يوصى بتسجيل الطالب في غرف المصادر ووضع خطة تربوية فردية تركز على المجالات النمائية والأكاديمية المتأثرة.'}
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
