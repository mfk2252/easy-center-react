import React, { useMemo } from 'react';
import {
  MYKLEBUST_COPYRIGHT_INFO,
  MYKLEBUST_DIMENSIONS,
  MYKLEBUST_ITEMS,
  calculateMyklebustPsychometrics,
} from '../../data/myklebustData';

export default function MyklebustReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const psych = useMemo(() => {
    if (!assessment) return null;
    if (assessment.psychometrics) return assessment.psychometrics;
    return calculateMyklebustPsychometrics(assessment.scores || assessment.responses || {});
  }, [assessment]);

  if (!isOpen || !assessment || !psych) return null;

  function handlePrint() {
    window.print();
  }

  const scores = assessment.scores || assessment.responses || {};

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div
        className="modal-box"
        style={{
          width: '95vw',
          maxWidth: 960,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: 14,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Top Header (No Print) */}
        <div
          className="no-print"
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.25rem' }}>📄</span>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
              التقرير التشخيصي: مقياس مايكل بيست (Myklebust PRS)
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {onEdit && (
              <button
                type="button"
                onClick={() => { onClose(); onEdit(assessment); }}
                className="btn btn-xs"
                style={{ background: '#3b82f6', color: '#fff' }}
              >
                ✏️ تعديل الدرجات
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-xs"
              style={{ background: '#f59e0b', color: '#fff' }}
            >
              🖨️ طباعة
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#fff' }} className="print-area">
          
          {/* Official Header */}
          <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#1e3a8a' }}>المملكة العربية السعودية</div>
              <div style={{ fontSize: '.8rem', color: '#475569' }}>وزارة التعليم · الإدارة العامة للتربية الخاصة</div>
              <div style={{ fontSize: '.75rem', color: '#64748b' }}>برامج التربية الخاصة (صعوبات التعلم)</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e3a8a' }}>
                تقرير مقياس مايكل بيست للتعرف على صعوبات التعلم
              </div>
              <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#d97706', marginTop: 4 }}>
                Myklebust Pupil Rating Scale (PRS)
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: '.8rem', color: '#64748b' }}>
              <div>تاريخ التطبيق: <strong style={{ color: '#1e293b' }}>{assessment.date}</strong></div>
              <div>العام الدراسي: <strong style={{ color: '#1e293b' }}>{assessment.academicYear || '—'}</strong></div>
            </div>
          </div>

          {/* Student Info */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <span style={{ fontSize: '.75rem', color: '#64748b', display: 'block' }}>اسم التلميذ:</span>
              <strong style={{ fontSize: '.95rem', color: '#1e293b' }}>{assessment.studentName || 'غير محدد'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '.75rem', color: '#64748b', display: 'block' }}>الصف الدراسي / الفصل:</span>
              <strong style={{ fontSize: '.95rem', color: '#1e293b' }}>{assessment.studentGrade || assessment.semester || 'غير محدد'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '.75rem', color: '#64748b', display: 'block' }}>القائم بالتقييم:</span>
              <strong style={{ fontSize: '.95rem', color: '#1e293b' }}>{assessment.evaluator || 'غير محدد'}</strong>
            </div>
          </div>

          {/* Diagnosis Banner */}
          <div style={{ border: `2px solid ${psych.overallColor}`, background: `${psych.overallColor}08`, borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                القرار التشخيصي النهائي (بناءً على محكات مايكل بيست)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: psych.overallColor, marginBottom: 8 }}>
                {psych.diagnosisType}
              </div>
              <div style={{ fontSize: '.9rem', color: '#334155', lineHeight: 1.6, maxWidth: 650 }}>
                {psych.conclusionText}
              </div>
            </div>
            
            <div style={{ textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 20px', minWidth: 150 }}>
              <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 700 }}>المجموع الكلي</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: psych.overallColor, lineHeight: 1 }}>
                {psych.totalRawScore}
              </div>
              <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 4 }}>من أصل 120 (المتوسط 72)</div>
            </div>
          </div>

          {/* Two Main Domains Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Verbal Domain */}
            <div style={{ border: `1.5px solid ${psych.isVerbalDeficit ? '#dc2626' : '#1e40af'}`, borderRadius: 10, padding: 16, background: psych.isVerbalDeficit ? '#fef2f2' : '#eff6ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: psych.isVerbalDeficit ? '#dc2626' : '#1e40af' }}>
                  المجال اللفظي (Verbal)
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: psych.isVerbalDeficit ? '#dc2626' : '#1e40af' }}>
                  {psych.verbalScore} <span style={{ fontSize: '.8rem', fontWeight: 600, color: '#64748b' }}>/ 45</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: '#475569', marginBottom: 8 }}>
                <span>حد القطع (الصعوبة): 27 فأقل</span>
                <span style={{ fontWeight: 800, color: psych.isVerbalDeficit ? '#dc2626' : '#16a34a' }}>
                  {psych.isVerbalDeficit ? 'صعوبة لفظية' : 'أداء لفظي طبيعي'}
                </span>
              </div>
              {/* Progress Bar */}
              <div style={{ height: 8, background: '#cbd5e1', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${psych.verbalPercentage}%`, height: '100%', background: psych.isVerbalDeficit ? '#dc2626' : '#1e40af', borderRadius: 4 }} />
              </div>
            </div>

            {/* Non-Verbal Domain */}
            <div style={{ border: `1.5px solid ${psych.isNonVerbalDeficit ? '#dc2626' : '#0891b2'}`, borderRadius: 10, padding: 16, background: psych.isNonVerbalDeficit ? '#fef2f2' : '#ecfeff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: psych.isNonVerbalDeficit ? '#dc2626' : '#0891b2' }}>
                  المجال غير اللفظي (Non-Verbal)
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: psych.isNonVerbalDeficit ? '#dc2626' : '#0891b2' }}>
                  {psych.nonVerbalScore} <span style={{ fontSize: '.8rem', fontWeight: 600, color: '#64748b' }}>/ 75</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: '#475569', marginBottom: 8 }}>
                <span>حد القطع (الصعوبة): 45 فأقل</span>
                <span style={{ fontWeight: 800, color: psych.isNonVerbalDeficit ? '#dc2626' : '#16a34a' }}>
                  {psych.isNonVerbalDeficit ? 'صعوبة غير لفظية' : 'أداء غير لفظي طبيعي'}
                </span>
              </div>
              {/* Progress Bar */}
              <div style={{ height: 8, background: '#cbd5e1', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${psych.nonVerbalPercentage}%`, height: '100%', background: psych.isNonVerbalDeficit ? '#dc2626' : '#0891b2', borderRadius: 4 }} />
              </div>
            </div>
          </div>

          {/* Sub-Dimensions Breakdown */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', paddingBottom: 8, marginBottom: 16 }}>
              تفصيل الأبعاد الفرعية (5 أبعاد)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px', textAlign: 'right' }}>البعد الفرعي</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>المجال</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>المجموع المستحق</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>الدرجة الخام</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>حد القطع</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>النتيجة الفرعية</th>
                </tr>
              </thead>
              <tbody>
                {psych.dimensionsResults.map((dim, idx) => (
                  <tr key={dim.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#334155' }}>
                      <span style={{ marginRight: 6 }}>{dim.icon}</span> {dim.name.split(':')[1] || dim.name}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: dim.scaleGroup === 'verbal' ? '#1e40af' : '#0891b2' }}>
                      {dim.scaleGroup === 'verbal' ? 'لفظي' : 'غير لفظي'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{dim.maxScore}</td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800, color: dim.isDeficit ? '#dc2626' : '#16a34a', fontSize: '.95rem' }}>
                      {dim.rawScore}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>≤ {dim.cutoffScore}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span className="bdg" style={{ background: dim.isDeficit ? '#fee2e2' : '#dcfce7', color: dim.isDeficit ? '#991b1b' : '#15803d', fontWeight: 700, fontSize: '.75rem' }}>
                        {dim.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Critical Items (Scores 1 or 2) */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626', borderBottom: '2px solid #e2e8f0', paddingBottom: 8, marginBottom: 16 }}>
              ⚠️ البنود الحرجة التي تظهر قصوراً واضحاً (درجة 1 أو 2) وتحتاج لخطة فردية
            </h3>
            
            {psych.criticalItems.length === 0 ? (
              <div style={{ padding: 16, background: '#f0fdf4', color: '#15803d', borderRadius: 8, fontSize: '.9rem', fontWeight: 700 }}>
                ✅ لم يتم تسجيل أي بنود بدرجة منخفضة (1 أو 2). أداء التلميذ يقع ضمن المتوسط أو أعلى.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {psych.criticalItems.map(item => {
                  const val = scores[item.id] || 3;
                  const dim = MYKLEBUST_DIMENSIONS.find(d => d.id === item.dimensionId);
                  return (
                    <div key={item.id} style={{ background: '#fff', border: '1px solid #fca5a5', borderRight: `4px solid ${val === 1 ? '#dc2626' : '#ea580c'}`, borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '.75rem', fontWeight: 800, color: '#991b1b' }}>بند {item.num} · {dim?.nameEn?.split('(')[0] || 'البعد'}</span>
                        <span className={`bdg ${val === 1 ? 'b-rd' : 'b-or'}`} style={{ fontSize: '.7rem' }}>
                          التقدير: {val} (منخفض{val === 1 ? ' جداً' : ''})
                        </span>
                      </div>
                      <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: '.75rem', color: '#475569', lineHeight: 1.4 }}>{item.text}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          {assessment.notes && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', marginBottom: 12 }}>الملاحظات التربوية والإكلينيكية</h3>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, fontSize: '.9rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {assessment.notes}
              </div>
            </div>
          )}

          {/* Signatures */}
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '2px dashed #cbd5e1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, textAlign: 'center', fontSize: '.85rem' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#1e3a8a', marginBottom: 40 }}>معلم التربية الخاصة / القائم بالتقييم</div>
              <div style={{ borderBottom: '1px solid #94a3b8', width: '70%', margin: '0 auto' }}></div>
              <div style={{ marginTop: 8, color: '#64748b' }}>{assessment.evaluator}</div>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#1e3a8a', marginBottom: 40 }}>المرشد الطلابي</div>
              <div style={{ borderBottom: '1px solid #94a3b8', width: '70%', margin: '0 auto' }}></div>
              <div style={{ marginTop: 8, color: '#64748b' }}>التوقيع</div>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#1e3a8a', marginBottom: 40 }}>مدير المدرسة / الختم</div>
              <div style={{ borderBottom: '1px solid #94a3b8', width: '70%', margin: '0 auto' }}></div>
              <div style={{ marginTop: 8, color: '#64748b' }}>الاعتماد الرسمي</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
