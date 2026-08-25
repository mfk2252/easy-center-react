import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CONNERS_PARENT_DOMAINS,
  CONNERS_PARENT_ITEMS,
  CONNERS_PARENT_OPTIONS,
  calculateConnersParentScore,
} from '../../data/connersParentData';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';

export default function ConnersParentReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp?.() || {};
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const psych = useMemo(() => {
    if (!assessment) return null;
    if (assessment.psychometrics && assessment.psychometrics.subscales) {
      return assessment.psychometrics;
    }
    return calculateConnersParentScore(assessment.scores || assessment.results || {});
  }, [assessment]);

  const recommendedGoals = useMemo(() => {
    if (!assessment) return [];
    return extractRecommendedGoals(
      'conners_parent',
      assessment.scores || assessment.results || {},
      CONNERS_PARENT_ITEMS
    );
  }, [assessment]);

  if (!isOpen || !assessment || !psych) return null;

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const adhdScale = psych.subscales?.find(s => s.id === 'H');
    const inattScale = psych.subscales?.find(s => s.id === 'L');
    const hyperScale = psych.subscales?.find(s => s.id === 'M');

    const text = `📋 *تقرير مقياس كونرز لتقدير الوالدين (CPRS-R L)*\n` +
      `👤 *اسم التلميذ:* ${assessment.studentName || '—'}\n` +
      `📅 *تاريخ التقييم:* ${assessment.date || '—'}\n` +
      `--------------------------------\n` +
      `📊 *الدرجة الخام الكلية:* ${psych.totalRawScore || assessment.score || 0} من 240\n` +
      `🎯 *مؤشر ADHD الكلي:* T = ${adhdScale?.tScore || '—'} (${adhdScale?.level || '—'})\n` +
      `🧠 *نقص الانتباه (DSM-IV):* T = ${inattScale?.tScore || '—'} (${inattScale?.level || '—'})\n` +
      `⚡ *فرط الحركة والاندفاعية (DSM-IV):* T = ${hyperScale?.tScore || '—'} (${hyperScale?.level || '—'})\n` +
      `--------------------------------\n` +
      `💡 *الخلاصة التشخيصية:* ${assessment.clinicalSummary || psych.level || '—'}\n\n` +
      `تم استخراج هذا التقرير رسمياً عبر منظومة برامج التربية الخاصة.`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  const scores = assessment.scores || assessment.results || {};

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1100 }}>
      <div className="mb mb-xl" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* TOP BAR / ACTION HEADER (No Print) */}
        <div
          className="no-print"
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
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
                التقرير السيكومتري لمقياس كونرز لتقدير الوالدين (CPRS-R L)
              </h3>
              <span style={{ fontSize: '.74rem', opacity: 0.9 }}>
                Conners' Parent Rating Scale - Revised (Long Form - 80 Items) · C. Keith Conners, Ph.D.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setBridgeOpen(true)}
              style={{
                background: '#4338ca',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🎯 اشتقاق أهداف IEP ({recommendedGoals.length})</span>
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
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '6px 12px',
                  borderRadius: 6,
                }}
              >
                ✏️ تعديل الدرجات
              </button>
            )}

            <button
              type="button"
              className="btn btn-xs"
              onClick={handleShareWhatsApp}
              style={{
                background: '#25D366',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontWeight: 700,
              }}
            >
              💬 واتساب
            </button>

            <button
              type="button"
              className="btn btn-xs"
              onClick={handlePrint}
              style={{
                background: '#fff',
                color: '#c2410c',
                fontWeight: 800,
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
              }}
            >
              🖨️ طباعة التقرير
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg)' }}>
          <div
            className="printable-report"
            style={{
              maxWidth: 900,
              margin: '0 auto',
              background: '#fff',
              padding: '36px',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              color: '#1e293b',
              lineHeight: 1.6,
            }}
          >
            {/* OFFICIAL LETTERHEAD */}
            <div style={{ borderBottom: '2px solid #ea580c', paddingBottom: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#c2410c', fontSize: '1.4rem', fontWeight: 900 }}>
                    {center?.name || 'مركز التربية الخاصة والتأهيل الشامل'}
                  </h2>
                  <div style={{ fontSize: '.84rem', color: '#64748b', marginTop: 3 }}>
                    وحدة القياس والتشخيص السيكومتري واضطرابات النمو السلوكي
                  </div>
                </div>
                <div style={{ textAlign: 'left', fontSize: '.8rem', color: '#64748b' }}>
                  <div>الرقم المرجعي: CON-{assessment.id?.slice(0, 8) || 'AUTO'}</div>
                  <div>تاريخ الفحص: {assessment.date || '—'}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                  تقرير مقياس كونرز لتقدير سلوك الطفل للوالدين (CPRS-R:L)
                </h1>
                <div style={{ fontSize: '.86rem', color: '#ea580c', fontWeight: 700, marginTop: 4 }}>
                  النسخة المعربة والمقننة المطولة - 80 بنداً (14 بعداً تشخيصياً)
                </div>
              </div>
            </div>

            {/* STUDENT & EXAMINER PROFILE */}
            <div
              style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: 8,
                padding: '14px 18px',
                marginBottom: 24,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                fontSize: '.88rem',
              }}
            >
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>اسم التلميذ: </span>
                <strong style={{ color: '#0f172a' }}>{assessment.studentName || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>تاريخ الميلاد / العمر: </span>
                <span>{assessment.studentAge || assessment.birthDate || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>الصف / الشعبة: </span>
                <span>{assessment.grade || assessment.class || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>القائم بالتقييم (الفاحص): </span>
                <strong>{assessment.examiner || assessment.evaluator || 'أخصائي التشخيص'}</strong>
              </div>
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>مستجيب التقرير: </span>
                <span>{assessment.respondent || 'ولي الأمر (الأب / الأم)'}</span>
              </div>
              <div>
                <span style={{ color: '#9a3412', fontWeight: 700 }}>عدد البنود المجاب عنها: </span>
                <strong>{psych.answeredCount} من 80 بنداً</strong>
              </div>
            </div>

            {/* KEY DIAGNOSTIC FINDINGS BANNER */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#0f172a', margin: '0 0 12px 0', fontSize: '1.02rem', fontWeight: 800 }}>
                📌 المؤشرات التشخيصية الجوهرية (Executive Diagnostic Indices)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                
                {/* ADHD Global Index */}
                {(() => {
                  const adhd = psych.subscales?.find(s => s.id === 'H');
                  return (
                    <div style={{ border: '2px solid #ea580c', borderRadius: 10, padding: '14px', background: '#fff' }}>
                      <div style={{ fontSize: '.8rem', color: '#c2410c', fontWeight: 800 }}>مؤشر ADHD الرئيسي (H)</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ea580c' }}>
                          T = {adhd?.tScore || '—'}
                        </span>
                        <span style={{ fontSize: '.82rem', color: '#64748b' }}>
                          الخام: {adhd?.raw || 0} / {adhd?.maxRaw || 36}
                        </span>
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: '.75rem',
                          fontWeight: 800,
                          background: `${adhd?.severityColor}15`,
                          color: adhd?.severityColor || '#ea580c',
                          border: `1px solid ${adhd?.severityColor}40`,
                        }}
                      >
                        {adhd?.level || '—'}
                      </span>
                    </div>
                  );
                })()}

                {/* DSM-IV Inattentive */}
                {(() => {
                  const inatt = psych.subscales?.find(s => s.id === 'L');
                  return (
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '14px', background: '#fff' }}>
                      <div style={{ fontSize: '.8rem', color: '#0284c7', fontWeight: 800 }}>نقص الانتباه DSM-IV (L)</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7' }}>
                          T = {inatt?.tScore || '—'}
                        </span>
                        <span style={{ fontSize: '.82rem', color: '#64748b' }}>
                          الخام: {inatt?.raw || 0} / {inatt?.maxRaw || 27}
                        </span>
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: '.75rem',
                          fontWeight: 800,
                          background: `${inatt?.severityColor}15`,
                          color: inatt?.severityColor || '#0284c7',
                          border: `1px solid ${inatt?.severityColor}40`,
                        }}
                      >
                        {inatt?.level || '—'}
                      </span>
                    </div>
                  );
                })()}

                {/* DSM-IV Hyperactive-Impulsive */}
                {(() => {
                  const hyper = psych.subscales?.find(s => s.id === 'M');
                  return (
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '14px', background: '#fff' }}>
                      <div style={{ fontSize: '.8rem', color: '#d97706', fontWeight: 800 }}>فرط الحركة والاندفاعية DSM-IV (M)</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#d97706' }}>
                          T = {hyper?.tScore || '—'}
                        </span>
                        <span style={{ fontSize: '.82rem', color: '#64748b' }}>
                          الخام: {hyper?.raw || 0} / {hyper?.maxRaw || 27}
                        </span>
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: '.75rem',
                          fontWeight: 800,
                          background: `${hyper?.severityColor}15`,
                          color: hyper?.severityColor || '#d97706',
                          border: `1px solid ${hyper?.severityColor}40`,
                        }}
                      >
                        {hyper?.level || '—'}
                      </span>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* FULL 14-DIMENSION PSYCHOMETRIC PROFILE TABLE */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ color: '#0f172a', margin: '0 0 12px 0', fontSize: '1.02rem', fontWeight: 800 }}>
                📊 جدول تفصيل الأبعاد الـ 14 والدرجات المعيارية التائية (T-Scores Profile)
              </h4>
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '10px 12px' }}>الرمز</th>
                      <th style={{ padding: '10px 12px' }}>البعد / المجال السلوكي</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>الدرجة الخام</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>الدرجة التائية (T)</th>
                      <th style={{ padding: '10px 12px' }}>مخطط الدرجة التائية (38 - 90)</th>
                      <th style={{ padding: '10px 12px' }}>الدلالة الإكلينيكية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psych.subscales?.map((scale, idx) => {
                      const t = scale.tScore || 50;
                      // T-Score graph math: 38 is 0%, 90 is 100%
                      const barPercent = Math.max(0, Math.min(100, ((t - 38) / (90 - 38)) * 100));
                      const isClinical = t >= 65;

                      return (
                        <tr key={scale.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: scale.color }}>
                            {scale.id}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <strong style={{ color: '#1e293b' }}>{scale.name}</strong>
                            <div style={{ fontSize: '.72rem', color: '#94a3b8' }}>{scale.englishName} ({scale.items.length} فقرة)</div>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>
                            {scale.raw} / {scale.maxRaw}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{ fontWeight: 900, color: scale.severityColor, fontSize: '.92rem' }}>
                              {scale.tScore}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', width: 220 }}>
                            <div style={{ background: '#e2e8f0', borderRadius: 4, height: 12, position: 'relative', overflow: 'hidden' }}>
                              {/* Clinical threshold line at T=65 (which is ((65-38)/52)*100 = 51.9%) */}
                              <div style={{ position: 'absolute', left: `${((65 - 38) / 52) * 100}%`, top: 0, bottom: 0, width: 2, background: '#ef4444', zIndex: 2 }} title="حد الدلالة الإكلينيكية (T=65)" />
                              <div
                                style={{
                                  height: '100%',
                                  width: `${barPercent}%`,
                                  background: isClinical ? '#ef4444' : scale.color,
                                  borderRadius: 4,
                                  transition: 'width 0.4s ease',
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span
                              style={{
                                fontSize: '.74rem',
                                fontWeight: 700,
                                color: scale.severityColor,
                                background: `${scale.severityColor}12`,
                                padding: '2px 6px',
                                borderRadius: 4,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {scale.level}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: '.74rem', color: '#64748b', marginTop: 6, display: 'flex', gap: 14 }}>
                <span>* الخط الأحمر في المخطط يمثل الحد الإكلينيكي الحرج (T ≥ 65).</span>
                <span>* الدرجات التائية (T-Scores) محسوبة بمتوسط 50 وانحراف معياري 10.</span>
              </div>
            </div>

            {/* CLINICAL SUMMARY & RECOMMENDATIONS */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 18, marginBottom: 24, background: '#f8fafc' }}>
              <h4 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 800 }}>
                💡 الخلاصة السيكومترية والتوصيات التربوية التأهيلية
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '.88rem', color: '#334155', lineHeight: 1.7 }}>
                {assessment.clinicalSummary ||
                  `بناءً على استجابات ولي الأمر على مقياس كونرز للوالدين (CPRS-R:L)، سجل التلميذ درجة خام إجمالية قدرها (${psych.totalRawScore}) من أصل 240. يظهر التحليل السيكومتري أن مؤشر فرط الحركة وتشتت الانتباه العام هو (${psych.subscales?.find(s => s.id === 'H')?.level}) بدرجة تائية قدرها (T=${psych.subscales?.find(s => s.id === 'H')?.tScore}). يوصى بإدراج التلميذ في برامج تعديل السلوك المعرفي وضبط الاندفاعية وتصميم خطة تربوية فردية (IEP) ملائمة.`}
              </p>

              {assessment.recommendations && (
                <div style={{ marginTop: 10 }}>
                  <strong style={{ fontSize: '.84rem', color: '#0f172a' }}>توصيات الفاحص الإكلينيكية:</strong>
                  <div style={{ fontSize: '.84rem', color: '#475569', marginTop: 4, whiteSpace: 'pre-line' }}>
                    {assessment.recommendations}
                  </div>
                </div>
              )}
            </div>

            {/* DETAILED ITEM RESPONSES (OPTIONAL / COLLAPSIBLE ACCORDION IN PRINT) */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 800 }}>
                📋 جدول تفصيل استجابات البنود الـ 80
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8, fontSize: '.76rem' }}>
                {CONNERS_PARENT_ITEMS.map((item, idx) => {
                  const val = scores[`q${idx + 1}`];
                  const opt = CONNERS_PARENT_OPTIONS.find(o => o.value === val);
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 8px',
                        background: val === 3 ? '#fee2e2' : val === 2 ? '#fef3c7' : '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                        <strong>{idx + 1}.</strong> {item.text}
                      </span>
                      <strong style={{ color: val >= 2 ? '#b91c1c' : '#475569' }}>
                        {opt ? opt.label.split(' ')[0] : '—'} ({val ?? '—'})
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SIGNATURES SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 20, borderTop: '1px dashed #cbd5e1' }}>
              <div style={{ textAlign: 'center', minWidth: 160 }}>
                <div style={{ fontSize: '.84rem', color: '#64748b' }}>أخصائي القياس والتشخيص</div>
                <div style={{ marginTop: 30, fontWeight: 800, color: '#0f172a' }}>
                  {assessment.examiner || '___________________'}
                </div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 160 }}>
                <div style={{ fontSize: '.84rem', color: '#64748b' }}>مستجيب التقييم (ولي الأمر)</div>
                <div style={{ marginTop: 30, fontWeight: 800, color: '#0f172a' }}>
                  {assessment.respondent || '___________________'}
                </div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 160 }}>
                <div style={{ fontSize: '.84rem', color: '#64748b' }}>اعتماد مدير المركز / المشرف</div>
                <div style={{ marginTop: 30, fontWeight: 800, color: '#0f172a' }}>
                  {center?.director || '___________________'}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* IEP BRIDGE MODAL */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleId="conners_parent"
          scaleName="مقياس كونرز لتقدير سلوك الطفل للوالدين (CPRS-R:L)"
          studentId={assessment.studentId}
          studentName={assessment.studentName}
          results={scores}
          itemsBank={CONNERS_PARENT_ITEMS}
        />
      )}
    </div>
  );
}
