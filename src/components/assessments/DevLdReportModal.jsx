import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DEV_LD_COPYRIGHT_INFO,
  DEV_LD_DOMAINS,
  DEV_LD_ITEMS,
  DEV_LD_RESPONSE_OPTIONS,
  calculateDevLdPsychometrics,
} from '../../data/devLdData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function DevLdReportModal({
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
    return calculateDevLdPsychometrics(assessment.scores || assessment.results || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'dev_ld',
      assessment.scores || assessment.results || {},
      DEV_LD_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psych) return null;

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const text = `📋 *تقرير قائمة صعوبات التعلم النمائية لأطفال الروضة*\n` +
      `👤 *اسم الطفل:* ${assessment.studentName || '—'}\n` +
      `📅 *تاريخ الفحص:* ${assessment.date || '—'}\n` +
      `--------------------------------\n` +
      `📊 *الدرجة الكلية:* ${psych.totalRawScore} من 160 (${psych.overallPercentage}%)\n` +
      `🎯 *القرار التشخيصي:* ${psych.probability}\n` +
      `🧠 *المجال المعرفي:* ${psych.cognitiveRaw} / ${psych.cognitiveMax} (${psych.cognitivePct}%)\n` +
      `🗣️ *المجال اللغوي والتفكير:* ${psych.langThinkingRaw} / ${psych.langThinkingMax} (${psych.langThinkingPct}%)\n` +
      `🖐️ *المجال البصري الحركي:* ${psych.visualMotorRaw} / ${psych.visualMotorMax} (${psych.visualMotorPct}%)\n` +
      `--------------------------------\n` +
      `💡 *الخلاصة:* ${assessment.clinicalSummary ? assessment.clinicalSummary.slice(0, 180) + '...' : psych.recommendationSummary}\n\n` +
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
        {/* Modal Top Bar */}
        <div
          className="no-print"
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
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
            <span style={{ fontSize: '1.4rem' }}>🧸</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                تقرير قائمة صعوبات التعلم النمائية لأطفال الروضة
              </h3>
              <span style={{ fontSize: '.74rem', opacity: 0.9 }}>
                أ.د. عادل عبدالله محمد · أداة الفرز والتشخيص المبكر النمائي (80 عبارة)
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
          <div style={{ borderBottom: '2px solid #0d9488', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#0f766e' }}>المملكة العربية السعودية</div>
              <div style={{ fontSize: '.8rem', color: '#475569' }}>وزارة التعليم · رياض الأطفال والتربية الخاصة</div>
              <div style={{ fontSize: '.75rem', color: '#64748b' }}>برامج التدخل المبكر وصعوبات التعلم النمائية</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#0f766e' }}>
                تقرير نتائج قائمة صعوبات التعلم النمائية لأطفال الروضة
              </div>
              <div style={{ fontSize: '.84rem', fontWeight: 700, color: '#d97706', marginTop: 3 }}>
                إعداد وتقنين: أ.د. عادل عبدالله محمد
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: '.8rem', color: '#64748b' }}>
              <div>تاريخ التطبيق: <strong style={{ color: '#1e293b' }}>{assessment.date || '—'}</strong></div>
              <div>الرقم المرجعي: <strong style={{ color: '#1e293b' }}>{assessment.id ? assessment.id.slice(0, 8) : 'DEV-LD'}</strong></div>
            </div>
          </div>

          {/* Student Info Card */}
          <table style={{ width: '100%', marginBottom: 18, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '6px 10px' }}><b>اسم الطفل:</b> {assessment.studentName || '—'}</td>
                <td style={{ padding: '6px 10px' }}><b>العمر الزمني:</b> {assessment.age || '—'}</td>
                <td style={{ padding: '6px 10px' }}><b>تاريخ الفحص:</b> {assessment.date || '—'}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 10px' }}><b>الروضة / المستوى:</b> {assessment.schoolName || '—'} ({assessment.grade || assessment.semester || '—'})</td>
                <td style={{ padding: '6px 10px' }}><b>القائم بالتقييم:</b> {assessment.evaluator || assessment.specialistName || 'أخصائي التشخيص النمائي'}</td>
                <td style={{ padding: '6px 10px' }}><b>ولي الأمر:</b> {assessment.parentName || '—'} ({assessment.parentPhone || '—'})</td>
              </tr>
            </tbody>
          </table>

          {/* KPI Psychometric Box */}
          <div style={{ background: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0f766e', fontSize: '14px', fontWeight: 800 }}>
              📊 مؤشرات الفرز النمائي والتشخيص المبكر (Kirk & Chalfant):
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, textAlign: 'center' }}>
              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>الدرجة الكلية الخام</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: psych.severityColor }}>
                  {psych.totalRawScore} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ 160</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>النسبة المئوية: {psych.overallPercentage}%</div>
              </div>

              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>المجال المعرفي (انتباه/إدراك/ذاكرة)</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: psych.cognitivePct >= 50 ? '#dc2626' : '#0f766e' }}>
                  {psych.cognitiveRaw} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ {psych.cognitiveMax}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>النسبة: {psych.cognitivePct}%</div>
              </div>

              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>المجال اللغوي والتفكير</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: psych.langThinkingPct >= 50 ? '#dc2626' : '#0f766e' }}>
                  {psych.langThinkingRaw} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ {psych.langThinkingMax}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>النسبة: {psych.langThinkingPct}%</div>
              </div>

              <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${psych.severityColor}` }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>القرار والتشخيص النهائي</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: psych.severityColor, marginTop: 4 }}>
                  {psych.probability}
                </div>
              </div>
            </div>
          </div>

          {/* Subscales Breakdown Table */}
          <h4 style={{ color: '#0f766e', fontSize: '14px', margin: '16px 0 8px 0', fontWeight: 800 }}>
            🌐 توزيع درجات الأداء عبر أبعاد القائمة النمائية الستة:
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18, fontSize: '13px', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>المجال النمائي</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>المجال الرئيسي</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>الدرجة الخام</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>النسبة المئوية</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>التقدير الإكلينيكي</th>
              </tr>
            </thead>
            <tbody>
              {psych.domainResults.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #e2e8f0', background: d.isDeficit ? '#fef2f2' : '#ffffff' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>
                    {d.name}
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>{d.itemsCount} عبارة</div>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px' }}>
                    <span className="bdg" style={{ background: '#f0fdfa', color: '#0f766e' }}>
                      {d.pillarName}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: d.isDeficit ? '#dc2626' : '#0f766e' }}>
                    {d.rawScore} / {d.maxScore}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>
                    {d.percentage}%
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 800, color: d.isDeficit ? '#dc2626' : '#16a34a', fontSize: '12px' }}>
                      {d.domainStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Clinical Impression & Recommendations */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: '#0f766e', fontSize: '14px', margin: '0 0 6px 0', fontWeight: 800 }}>
              📌 الخلاصة التشخيصية والتفسير الإكلينيكي:
            </h4>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {assessment.clinicalSummary || psych.recommendationSummary}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: '#0f766e', fontSize: '14px', margin: '0 0 6px 0', fontWeight: 800 }}>
              💡 التوصيات التربوية وبرنامج التدخل المبكر:
            </h4>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {assessment.recommendations || 'يوصى بتسجيل الطفل في برنامج التدخل النمائي المبكر وتصميم خطة فردية تركز على الأبعاد المتأثرة.'}
            </div>
          </div>

          {/* Signatures Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 32, paddingTop: 16, borderTop: '2px solid #e2e8f0', fontSize: '13px' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 35 }}>معلمة الروضة / الأخصائية النمائية</div>
              <div style={{ borderTop: '1px dotted #94a3b8', paddingTop: 4, color: '#64748b' }}>
                {assessment.evaluator || assessment.specialistName || 'التوقيع والاعتماد'}
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 35 }}>الأخصائي النفسي / مشرف التدخل المبكر</div>
              <div style={{ borderTop: '1px dotted #94a3b8', paddingTop: 4, color: '#64748b' }}>
                الختم والتوقيع
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 35 }}>مديرة الروضة / رئيسة المركز</div>
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
