import React, { useRef, useState } from 'react';
import {
  SENSORY_INTEGRATION_DOMAINS,
  SENSORY_INTEGRATION_ITEMS,
  calculateSensoryIntegrationScore
} from '../../data/sensoryIntegrationData';

export default function SensoryIntegrationReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
  onOpenIepBridge
}) {
  const reportRef = useRef(null);
  const [showItemDetails, setShowItemDetails] = useState(false);

  if (!isOpen || !assessment) return null;

  const responses = assessment.responses || assessment.answers || {};
  const scoreResult = calculateSensoryIntegrationScore(responses);

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const studentName = assessment.studentName || 'الطالب';
    const text = `📄 *تقرير تشخيص التكامل الحسي للأطفال (Sensory Integration Profile)*
👤 *الطالب:* ${studentName}
📅 *التاريخ:* ${assessment.date || new Date().toISOString().split('T')[0]}
👨‍⚕️ *الفاحص:* ${assessment.evaluator || 'أخصائي العلاج الوظيفي'}
📊 *الدرجة الكلية:* ${scoreResult.totalRawScore} من 90 (${scoreResult.percentage}%)
🎯 *المستوى التشخيصي:* ${scoreResult.level}
📏 *محك القطع الإكلينيكي:* 45 درجة (${scoreResult.totalRawScore >= 45 ? 'أعلى من المحك' : 'دون المحك - يتطلب علاجاً وظيفياً'})

*أبرز درجات المحاور (من 10):*
1. التآزر البصري الحركي: ${scoreResult.subscales.find(s=>s.id==='eye_motor')?.raw || 0}/10
2. الشكل والأرضية: ${scoreResult.subscales.find(s=>s.id==='figure_ground')?.raw || 0}/10
3. الموضع في الفراغ: ${scoreResult.subscales.find(s=>s.id==='position_space')?.raw || 0}/10
4. نسخ الأشكال: ${scoreResult.subscales.find(s=>s.id==='design_copying')?.raw || 0}/10
5. المثير اللمسي: ${scoreResult.subscales.find(s=>s.id==='tactile_localization')?.raw || 0}/10
6. تمييز الأصابع: ${scoreResult.subscales.find(s=>s.id==='finger_identification')?.raw || 0}/10
7. الكتابة على الكف: ${scoreResult.subscales.find(s=>s.id==='graphesthesis')?.raw || 0}/10
8. التوازن الدهليزي: ${scoreResult.subscales.find(s=>s.id==='vestibular_balance')?.raw || 0}/10
9. محاكاة وضع الجسم: ${scoreResult.subscales.find(s=>s.id==='proprioceptive_posture')?.raw || 0}/10

مركز التأهيل ورعاية ذوي الإعاقة.`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="mbg" style={{ zIndex: 1150, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-xl">
        
        {/* ACTION BAR (Print, Share, Edit, Close) */}
        <div className="no-print" style={{ padding: '12px 20px', background: 'var(--text-main)', color: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>📄</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--bg-input)' }}>
                تقرير التقييم التشخيصي للتكامل الحسي (Sensory Integration Assessment)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '.74rem', color: '#94a3b8' }}>
                المرجع: مجلة الإرشاد النفسي - كلية التربية جامعة عين شمس (العدد 49، 2017)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onOpenIepBridge && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  onClose();
                  onOpenIepBridge(assessment);
                }}
                style={{ background: '#7c3aed', color: 'var(--bg-card)', fontWeight: 800, border: 'none' }}
              >
                🎯 ترحيل للخطة الفردية IEP
              </button>
            )}

            <button
              type="button"
              className="btn btn-sm"
              onClick={handleShareWhatsApp}
              style={{ background: '#25D366', color: 'var(--bg-card)', fontWeight: 800, border: 'none' }}
            >
              💬 مشاركة واتساب
            </button>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handlePrint}
              style={{ fontWeight: 800 }}
            >
              🖨️ طباعة التقرير / PDF
            </button>

            {onEdit && (
              <button
                type="button"
                className="btn btn-sm btn-g"
                onClick={() => {
                  onClose();
                  onEdit(assessment);
                }}
                style={{ color: 'var(--border-color)', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                ✏️ تعديل
              </button>
            )}

            <button
              type="button"
              className="btn btn-sm btn-g"
              onClick={onClose}
              style={{ color: 'var(--border-color)', borderColor: 'rgba(255,255,255,0.2)', width: 32, height: 32, padding: 0 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT BODY */}
        <div ref={reportRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 30px', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
          
          {/* OFFICIAL HEADER */}
          <div style={{ borderBottom: '2px solid var(--text-main)', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--text-sub)' }}>المملكة العربية السعودية / جمهورية مصر العربية</div>
              <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--text-sub)' }}>مركز التأهيل الشامل والرعاية التخصصية</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>قسم العلاج الوظيفي وتأهيل التكامل الحسي والنمائي</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--bg-input)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 4px' }}>
                🎯
              </div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                تقرير مقياس التكامل الحسي للأطفال
              </h2>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#2563eb' }}>
                Sensory Integration Performance Scale (90 Items)
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>رقم التقرير: <strong style={{ color: 'var(--text-main)' }}>SI-{assessment.id?.slice(-6) || '2026'}</strong></div>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>تاريخ الفحص: <strong style={{ color: 'var(--text-main)' }}>{assessment.date || new Date().toISOString().split('T')[0]}</strong></div>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>حالة التقرير: <strong style={{ color: '#059669' }}>معتمد رسمياً</strong></div>
            </div>
          </div>

          {/* ACADEMIC CITATION BADGE */}
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 14px', marginBottom: 18, fontSize: '.76rem', color: 'var(--text-sub)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <div>
              📖 <strong>المرجع المقنن:</strong> مقياس التكامل الحسي للأطفال وخصائصه السيكومترية - مجلة الإرشاد النفسي (ع 49، 2017).
            </div>
            <div>
              ✍️ <strong>إعداد:</strong> أ. داليا طعيمة · د. محمود الطنطاوي · أ.د. عبد العزيز الشخص (جامعة عين شمس).
            </div>
          </div>

          {/* STUDENT & EXAMINER DEMOGRAPHICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, background: 'var(--bg-input)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div>
              <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>اسم الطالب:</span>
              <strong style={{ fontSize: '.92rem', color: 'var(--text-main)' }}>{assessment.studentName || '—'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>الأخصائي الفاحص:</span>
              <strong style={{ fontSize: '.92rem', color: 'var(--text-main)' }}>{assessment.evaluator || 'أخصائي العلاج الوظيفي'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>المحك التشخيصي:</span>
              <strong style={{ fontSize: '.92rem', color: '#2563eb' }}>45 درجة (نصف المجموع)</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>نسبة الإنجاز:</span>
              <strong style={{ fontSize: '.92rem', color: scoreResult.severityColor }}>{scoreResult.percentage}%</strong>
            </div>
          </div>

          {/* SUMMARY SCORE CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            
            <div style={{ background: 'var(--bg-card)', border: `2px solid ${scoreResult.severityColor}`, borderRadius: 12, padding: 14, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', fontWeight: 700 }}>الدرجة الكلية للمقياس</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: scoreResult.severityColor, margin: '4px 0' }}>
                {scoreResult.totalRawScore} <span style={{ fontSize: '1rem', color: 'var(--text-sub)' }}>/ 90</span>
              </div>
              <div style={{ fontSize: '.75rem', fontWeight: 800, color: scoreResult.severityColor }}>
                نسبة الكفاءة الحسية: {scoreResult.percentage}%
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', fontWeight: 700 }}>التصنيف والتشخيص الإكلينيكي</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: scoreResult.severityColor, margin: '6px 0' }}>
                {scoreResult.statusBadge}
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                {scoreResult.totalRawScore >= 45 ? 'أداء حسي يتجاوز محك القصور' : 'قصور واضطراب حسي دون محك الـ 45'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', fontWeight: 700 }}>المحاور المستوفاة</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: '4px 0' }}>
                {scoreResult.subscales.filter(s => s.raw >= 6).length} <span style={{ fontSize: '.9rem', color: 'var(--text-sub)' }}>/ 9 أبعاد</span>
              </div>
              <div style={{ fontSize: '.72rem', color: scoreResult.subscales.some(s => s.isWeak) ? '#dc2626' : '#059669', fontWeight: 700 }}>
                {scoreResult.subscales.filter(s => s.isWeak).length} أبعاد بحاجة لتدخل وتأهيل
              </div>
            </div>

          </div>

          {/* 9 DOMAINS BREAKDOWN TABLE */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '.95rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              📊 التوزيع السيكومتري لدرجات المحاور الـ 9:
            </h4>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem', textAlign: 'right' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-sub)', fontWeight: 800 }}>
                    <th style={{ padding: '10px 12px', width: 40, textAlign: 'center' }}>#</th>
                    <th style={{ padding: '10px 12px' }}>اسم المحور الحسي / الحركي</th>
                    <th style={{ padding: '10px 12px', width: 90, textAlign: 'center' }}>الدرجة الخام</th>
                    <th style={{ padding: '10px 12px', width: 75, textAlign: 'center' }}>النسبة</th>
                    <th style={{ padding: '10px 12px', width: 110, textAlign: 'center' }}>مستوى الأداء</th>
                    <th style={{ padding: '10px 12px', minWidth: 160 }}>مخطط الكفاءة</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreResult.subscales.map((sub, idx) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'var(--bg-card)' : '#fcfcfd' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sub)' }}>{sub.num}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{sub.name}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>{sub.englishName}</div>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 900, color: sub.color, fontSize: '.9rem' }}>
                        {sub.raw} <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>/ {sub.maxRaw}</span>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: 'var(--text-sub)' }}>
                        {sub.percentage}%
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span
                          style={{
                            background: `${sub.color}15`,
                            color: sub.color,
                            border: `1px solid ${sub.color}40`,
                            fontSize: '.72rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            display: 'inline-block'
                          }}
                        >
                          {sub.level}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ width: '100%', height: 9, background: 'var(--border-color)', borderRadius: 6, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${sub.percentage}%`,
                              height: '100%',
                              background: sub.color,
                              borderRadius: 6,
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CLINICAL INTERPRETATION & PSYCHOMETRIC ANALYSIS */}
          <div style={{ background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '.92rem', fontWeight: 900, color: 'var(--text-main)' }}>
              🧠 التحليل والتفسير السيكومتري الإكلينيكي:
            </h4>
            <p style={{ margin: 0, fontSize: '.84rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
              {scoreResult.interpretation}
            </p>

            {assessment.notes && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--border-color)', fontSize: '.8rem', color: 'var(--text-sub)' }}>
                📝 <strong>ملاحظات الفاحص الإكلينيكية المسجلة:</strong> {assessment.notes}
              </div>
            )}
          </div>

          {/* OCCUPATIONAL THERAPY & REHABILITATION RECOMMENDATIONS */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid #bfdbfe', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '.92rem', fontWeight: 900, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
              🎯 توصيات العلاج الوظيفي وبرنامج التكامل الحسي (Sensory Intervention Plan):
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scoreResult.recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <span style={{ color: '#2563eb', fontWeight: 900 }}>•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TOGGLE FULL 90 ITEMS AUDIT TRAIL */}
          <div className="no-print" style={{ marginBottom: 24, textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-sm btn-g"
              onClick={() => setShowItemDetails(!showItemDetails)}
              style={{ fontWeight: 800 }}
            >
              {showItemDetails ? '▲ إخفاء تفاصيل درجات البنود الـ 90' : '▼ استعراض تفاصيل إجابات الـ 90 مهمة بالتفصيل'}
            </button>
          </div>

          {/* DETAILED 90 ITEMS LIST (OPTIONAL / PRINTABLE) */}
          {showItemDetails && (
            <div style={{ marginBottom: 24, border: '1px solid var(--border-color)', borderRadius: 10, padding: 16, background: '#fafafa' }}>
              <h4 style={{ fontSize: '.9rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 12px' }}>
                📋 قائمة درجات المهام الأدائية التفصيلية (1 = نجاح، 0 = فشل):
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
                {scoreResult.itemDetails.map(it => (
                  <div
                    key={it.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: it.isPassed ? '1px solid #86efac' : '1px solid #fca5a5',
                      padding: '6px 10px',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '.76rem'
                    }}
                  >
                    <div style={{ flex: 1, paddingLeft: 6 }}>
                      <strong>#{it.num}</strong> {it.title}
                    </div>
                    <span
                      style={{
                        fontWeight: 900,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: it.isPassed ? '#dcfce7' : '#fee2e2',
                        color: it.isPassed ? '#166534' : '#991b1b'
                      }}
                    >
                      {it.isPassed ? 'ناجح (1)' : 'خاطئ (0)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OFFICIAL SIGN-OFF & STAMPS */}
          <div style={{ marginTop: 30, paddingTop: 16, borderTop: '2px solid var(--text-main)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginBottom: 4 }}>أخصائي العلاج الوظيفي والتكامل الحسي</div>
              <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--text-main)' }}>{assessment.evaluator || 'الأخصائي المسؤول'}</div>
              <div style={{ marginTop: 24, fontSize: '.72rem', color: '#94a3b8' }}>التوقيع: ............................</div>
            </div>

            <div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginBottom: 4 }}>رئيس قسم التأهيل والتكامل الحسي</div>
              <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--text-main)' }}>د. إشراف العلاج والتأهيل</div>
              <div style={{ marginTop: 24, fontSize: '.72rem', color: '#94a3b8' }}>التوقيع: ............................</div>
            </div>

            <div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginBottom: 4 }}>الختم والاعتماد الرسمي</div>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px dashed #94a3b8', margin: '4px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', color: '#94a3b8' }}>
                ختم المركز
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
