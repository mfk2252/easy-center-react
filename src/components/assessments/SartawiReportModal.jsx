import React, { useMemo } from 'react';
import {
  SARTAWI_COPYRIGHT_INFO,
  SARTAWI_DIMENSIONS,
  SARTAWI_ITEMS,
  calculateSartawiPsychometrics,
} from '../../data/sartawiData';

export default function SartawiReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const psych = useMemo(() => {
    if (!assessment) return null;
    if (assessment.psychometrics) return assessment.psychometrics;
    return calculateSartawiPsychometrics(assessment.scores || assessment.results || {});
  }, [assessment]);

  if (!isOpen || !assessment || !psych) return null;

  function handlePrint() {
    window.print();
  }

  const scores = assessment.scores || assessment.results || {};

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1060 }}>
      <div
        className="mb"
        style={{
          maxWidth: 960,
          width: '96%',
          maxHeight: 'min(94vh, calc(100dvh - 16px))',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 16,
          overflow: 'hidden',
          background: '#f8fafc',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Modal Top Bar (Hidden in Print) */}
        <div
          className="no-print"
          style={{
            background: '#1e3a8a',
            color: '#fff',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>📑</span>
            <div style={{ fontWeight: 800, fontSize: '.95rem' }}>
              التقرير التشخيصي الشامل لمقياس صعوبات التعلم (د. زيدان السرطاوي)
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => {
                  onClose();
                  onEdit(assessment);
                }}
                style={{ fontWeight: 700 }}
              >
                ✏️ تعديل الدرجات
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs"
              onClick={handlePrint}
              style={{ background: '#f59e0b', color: '#78350f', fontWeight: 800 }}
            >
              🖨️ طباعة التقرير
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: '#fff' }}>
          {/* Official Ministry / Diagnostic Header */}
          <div
            style={{
              borderBottom: '2px solid #1e3a8a',
              paddingBottom: 16,
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '.84rem', fontWeight: 800, color: '#1e3a8a' }}>المملكة العربية السعودية</div>
              <div style={{ fontSize: '.8rem', color: '#475569' }}>وزارة التعليم · الإدارة العامة للتربية الخاصة</div>
              <div style={{ fontSize: '.76rem', color: '#64748b' }}>برامج صعوبات التعلم والتشخيص النمائي والأكاديمي</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px' }}>
                استمارة خلاصة نتائج مقياس صعوبات التعلم
              </div>
              <div style={{ fontSize: '.84rem', fontWeight: 700, color: '#d97706', marginTop: 2 }}>
                ملحق رقم (3) · إعداد وتقنين أ.د. زيدان أحمد السرطاوي
              </div>
            </div>
            <div style={{ textAlign: 'left', fontSize: '.78rem', color: '#64748b' }}>
              <div>تاريخ التقييم: <strong>{assessment.date}</strong></div>
              <div>رقم السجل: <strong>{assessment.id?.slice(0, 8)}</strong></div>
            </div>
          </div>

          {/* Student Info Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              fontSize: '.84rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-sub)' }}>اسم التلميذ / التلميذة: </span>
              <strong>{assessment.studentName || 'غير محدد'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-sub)' }}>المدرسة: </span>
              <strong>{assessment.schoolName || 'مدرسة الابتدائية النموذجية'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-sub)' }}>الفصل الدراسي: </span>
              <strong>{assessment.semester || 'الفصل الأول'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-sub)' }}>القائم بالتقدير: </span>
              <strong>{assessment.evaluator || 'أخصائي التربية الخاصة'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-sub)' }}>علاقته بالطالب: </span>
              <strong>{assessment.relationship || 'معلم الفصل / معلم الصعوبات'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-sub)' }}>الصف الدراسي: </span>
              <strong>{assessment.studentGrade || 'المرحلة الابتدائية'}</strong>
            </div>
          </div>

          {/* Overall Diagnostic Summary Banner */}
          <div
            style={{
              border: `2px solid ${psych.overallColor}`,
              background: psych.overallKey === 'severe' ? '#fef2f2' : psych.overallKey === 'borderline' ? '#fffbeb' : '#f0fdf4',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4 }}>
                النتيجة والقرار التشخيصي النهائي (بناءً على جدول التائية المعياري ملحق 2)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: psych.overallColor }}>
                {psych.overallStatus}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '.82rem', color: '#334155', maxWidth: 650, lineHeight: 1.5 }}>
                {psych.conclusionText}
              </p>
            </div>

            <div style={{ textAlign: 'center', background: '#fff', padding: '12px 18px', borderRadius: 10, border: '1px solid #e2e8f0', minWidth: 140 }}>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>الدرجة التائية المعيارية</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e3a8a', lineHeight: 1.2 }}>
                T = {psych.totalTScore}
              </div>
              <div style={{ fontSize: '.76rem', color: '#64748b', marginTop: 2 }}>
                الخام: {psych.totalRawScore} / 250
              </div>
            </div>
          </div>

          {/* Dimensions Performance Table (Form 3 Reproduction) */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '.95rem', fontWeight: 800, color: '#1e3a8a' }}>
              مصفوفة الأبعاد الثلاثة وتوزيع الدرجات الخام ومستويات القطع
            </h4>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>
                  <th style={{ padding: '10px 12px' }}>البعد / المجال الفرعي</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>عدد العبارات</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>الدرجة الخام</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>النسبة المئوية</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>الحد الفاصل للصعوبة</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>التشخيص الفرعي</th>
                </tr>
              </thead>
              <tbody>
                {psych.dimensionsResults.map(dim => (
                  <tr key={dim.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b' }}>
                      <span style={{ marginRight: 6 }}>{dim.icon}</span> {dim.name}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{dim.itemsCount}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: dim.color }}>
                      {dim.rawScore} / {dim.maxRawScore}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{dim.percentage}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '.78rem', color: '#64748b' }}>
                      ≥ {dim.cutoffLD}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span
                        className="bdg"
                        style={{
                          background: dim.isDeficit ? '#fee2e2' : '#dcfce7',
                          color: dim.severityColor,
                          fontWeight: 800,
                          fontSize: '.75rem',
                        }}
                      >
                        {dim.severity}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                  <td style={{ padding: '10px 12px', color: '#1e3a8a' }}>المجموع الكلي للمقياس</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>50</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1e3a8a', fontSize: '.95rem' }}>
                    {psych.totalRawScore} / 250
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{psych.totalPercentage}%</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '.78rem' }}>≥ 150 (T≥60)</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span
                      className="bdg"
                      style={{
                        background: psych.overallKey === 'severe' ? '#fee2e2' : psych.overallKey === 'borderline' ? '#fef3c7' : '#dcfce7',
                        color: psych.overallColor,
                        fontWeight: 800,
                      }}
                    >
                      T = {psych.totalTScore} ({psych.overallStatus})
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Critical Problematic Items (Score 4 or 5) for IEP Direct Translation */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '.95rem', fontWeight: 800, color: '#dc2626' }}>
              🎯 العبارات الأشد تأثراً وتتطلب تدخلاً عاجلاً في الخطة الفردية (تقدير 4 و 5)
            </h4>

            {(() => {
              const criticalItems = SARTAWI_ITEMS.filter(it => (scores[it.id] || 1) >= 4);
              if (criticalItems.length === 0) {
                return (
                  <div style={{ padding: 14, background: '#f0fdf4', color: '#15803d', borderRadius: 8, fontSize: '.84rem' }}>
                    ✅ لا توجد عبارات حاصلة على درجات شديدة (4 أو 5) لدى الطالب.
                  </div>
                );
              }
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                  {criticalItems.map(item => {
                    const val = scores[item.id];
                    const dim = SARTAWI_DIMENSIONS.find(d => d.id === item.dimensionId);
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: '#fff',
                          border: '1px solid #fee2e2',
                          borderRadius: 8,
                          padding: '10px 12px',
                          borderRight: `4px solid ${val === 5 ? '#dc2626' : '#ea580c'}`,
                          fontSize: '.8rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, color: '#991b1b' }}>بند {item.num} ({dim?.name?.split(':')[0]})</span>
                          <span className="bdg b-rd" style={{ fontSize: '.7rem' }}>
                            {val === 5 ? 'عالية جداً (5)' : 'عالية (4)'}
                          </span>
                        </div>
                        <div style={{ color: '#1e293b', fontWeight: 600 }}>{item.text}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Clinical Notes & Recommendations */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '.92rem', fontWeight: 800, color: '#1e3a8a' }}>
              التوصيات التربوية والإكلينيكية لغرفة المصادر
            </h4>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: '.84rem',
                color: '#334155',
                lineHeight: 1.6,
              }}
            >
              {assessment.notes ? (
                <p style={{ margin: 0 }}>{assessment.notes}</p>
              ) : (
                <ul style={{ margin: 0, paddingRight: 20 }}>
                  {psych.overallKey === 'severe' ? (
                    <>
                      <li>قبول الطالب في برنامج صعوبات التعلم بالمدرسة وتفعيل غرفة المصادر.</li>
                      <li>إعداد خطة تربوية فردية (IEP) تركز على الأبعاد ذات الدرجات الحرجة (الأكاديمية، السلوكية، الإدراكية).</li>
                      <li>استخدام استراتيجيات التدريس المباشر، وتجزئة المهمات، والتعزيز الإيجابي المستمر.</li>
                      <li>تكييف البيئة الصفية لتقليل المشتتات البصرية والسمعية.</li>
                    </>
                  ) : psych.overallKey === 'borderline' ? (
                    <>
                      <li>تقديم دعم صفي وقائي من قبل معلم المادة والمرشد الطلابي.</li>
                      <li>إعادة التقييم والملاحظة المستمرة خلال الفصل الدراسي.</li>
                    </>
                  ) : (
                    <>
                      <li>مواصلة التعلم بالصف العادي مع تشجيع المهارات الأكاديمية والدافعية الذاتية.</li>
                    </>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Official Signature Lines */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 16,
              borderTop: '1px dashed #cbd5e1',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              textAlign: 'center',
              fontSize: '.82rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: '#1e3a8a', marginBottom: 28 }}>معلم / أخصائي صعوبات التعلم</div>
              <div style={{ borderBottom: '1px solid #94a3b8', width: '80%', margin: '0 auto' }}></div>
              <div style={{ marginTop: 4, color: '#64748b', fontSize: '.75rem' }}>{assessment.evaluator}</div>
            </div>

            <div>
              <div style={{ fontWeight: 800, color: '#1e3a8a', marginBottom: 28 }}>المرشد الطلابي / الأخصائي النفسي</div>
              <div style={{ borderBottom: '1px solid #94a3b8', width: '80%', margin: '0 auto' }}></div>
              <div style={{ marginTop: 4, color: '#64748b', fontSize: '.75rem' }}>التوقيع والاعتماد</div>
            </div>

            <div>
              <div style={{ fontWeight: 800, color: '#1e3a8a', marginBottom: 28 }}>مدير المدرسة / قائد المجمع</div>
              <div style={{ borderBottom: '1px solid #94a3b8', width: '80%', margin: '0 auto' }}></div>
              <div style={{ marginTop: 4, color: '#64748b', fontSize: '.75rem' }}>الختم الرسمي للمدرسة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
