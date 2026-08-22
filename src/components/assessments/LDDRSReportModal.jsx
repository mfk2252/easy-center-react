import React, { useMemo } from 'react';
import { LDDRS_COPYRIGHT_INFO, LDDRS_SCALES, calculateLDDRSPsychometrics } from '../../data/lddrsData';

export default function LDDRSReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const psych = useMemo(() => {
    if (!assessment) return null;
    if (assessment.psychometrics) return assessment.psychometrics;
    return calculateLDDRSPsychometrics(assessment.scores || {});
  }, [assessment]);

  if (!isOpen || !assessment || !psych) return null;

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const text = `📋 *تقرير بطارية مقاييس التقدير التشخيصية لصعوبات التعلم (LDDRS)*
👤 التلميذ: ${assessment.studentName || '—'}
📅 التاريخ: ${assessment.date || '—'}
📊 النتيجة العامة: ${psych.overallStatus}
🎯 عدد المجالات المتأثرة: ${psych.deficitScales.length} من 8
🔍 الاستنتاج: ${psych.conclusionText}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="mb"
        style={{
          maxWidth: 900,
          width: '95vw',
          maxHeight: 'min(94vh, calc(100dvh - 24px))',
          padding: 0,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          background: '#fff',
        }}
      >
        {/* Modal Top Bar (Screen only) */}
        <div
          className="no-print"
          style={{
            background: '#1e293b',
            color: '#fff',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #dc2626',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#dc2626', padding: '2px 8px', borderRadius: 6, fontWeight: 800, fontSize: '.75rem' }}>
              LDDRS REPORT
            </span>
            <span style={{ fontWeight: 800, fontSize: '.95rem' }}>
              التقرير التشخيصي لبطارية مقاييس صعوبات التعلم (الزيات)
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-sm btn-g"
                onClick={() => {
                  onClose();
                  onEdit(assessment);
                }}
                style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                ✏️ تعديل الدرجات
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleShareWhatsApp}
              style={{ background: '#25D366', color: '#fff', fontWeight: 800 }}
            >
              📱 واتساب
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handlePrint}
              style={{ background: '#dc2626', color: '#fff', fontWeight: 800 }}
            >
              🖨️ طباعة التقرير (A4)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-g"
              onClick={onClose}
              style={{ color: '#fff' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div
          id="printable-lddrs-report"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 36px',
            color: '#0f172a',
            fontFamily: 'Tajawal, sans-serif',
            background: '#fff',
          }}
        >
          {/* Official Report Header */}
          <div
            style={{
              borderBottom: '2px solid #0f172a',
              paddingBottom: 16,
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '.84rem', fontWeight: 700, color: '#475569' }}>
                المملكة العربية السعودية / وزارة التعليم
              </div>
              <div style={{ fontSize: '.84rem', fontWeight: 700, color: '#475569' }}>
                إدارة التربية الخاصة · برنامج وصعوبات التعلم
              </div>
              <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {assessment.schoolName || 'مدرسة التميز النموذجية'}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#dc2626' }}>
                تقرير التقدير والتشخيص النفسي التربوي
              </h1>
              <div style={{ fontSize: '.88rem', fontWeight: 800, color: '#1e293b', marginTop: 2 }}>
                بطارية مقاييس التقدير التشخيصية لصعوبات التعلم النمائية والأكاديمية (LDDRS)
              </div>
              <div style={{ fontSize: '.72rem', color: '#64748b', marginTop: 2 }}>
                إعداد: {LDDRS_COPYRIGHT_INFO.authorAr} · جامعة الخليج العربي
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: '.78rem', color: '#475569' }}>
              <div>رقم التقرير: <strong>{assessment.id}</strong></div>
              <div>تاريخ التقييم: <strong>{assessment.date}</strong></div>
            </div>
          </div>

          {/* Section 1: Student Information */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
              fontSize: '.82rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b' }}>اسم التلميذ: </span>
              <strong style={{ color: '#0f172a' }}>{assessment.studentName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>الصف الدراسي: </span>
              <strong style={{ color: '#0f172a' }}>{assessment.studentGrade || 'الابتدائي'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>القائم بالتقدير: </span>
              <strong style={{ color: '#0f172a' }}>{assessment.evaluator || 'الأخصائي النفسي'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>المسمى الوظيفي: </span>
              <strong style={{ color: '#0f172a' }}>{assessment.evaluatorRole || 'معلم صعوبات التعلم'}</strong>
            </div>
          </div>

          {/* Section 2: Clinical Summary Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                border: `1.5px solid ${psych.overallColor}`,
                background: psych.overallColor + '08',
                borderRadius: 8,
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>التصنيف التشخيصي العام</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: psych.overallColor, marginTop: 4 }}>
                {psych.overallStatus}
              </div>
            </div>

            <div
              style={{
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                borderRadius: 8,
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>المجالات ذات الدلالة الإكلينيكية</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#dc2626', marginTop: 2 }}>
                {psych.deficitScales.length} <span style={{ fontSize: '.8rem', color: '#64748b' }}>من 8 مجالات</span>
              </div>
            </div>

            <div
              style={{
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                borderRadius: 8,
                padding: '12px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>القرار التدخلي الموصى به</div>
              <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#0369a1', marginTop: 4 }}>
                {psych.deficitScales.length > 0 ? 'خطة تربوية فردية (IEP)' : 'متابعة وإثراء صفي عادي'}
              </div>
            </div>
          </div>

          {/* Section 3: Diagnostic Profile Matrix (Psychometric Table) */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '.92rem', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0', borderRight: '4px solid #dc2626', paddingRight: 8 }}>
              جدول تسجيل الدرجات والتخطيط البياني للبطارية (معايير الزيات)
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8', textAlign: 'right' }}>
                  <th style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1' }}>المقياس التشخيصي</th>
                  <th style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1' }}>النوع</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>الدرجة الخام</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>الرتبة المئينية</th>
                  <th style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1' }}>مستوى حدة الصعوبة</th>
                  <th style={{ padding: '8px 10px' }}>التفسير الإكلينيكي</th>
                </tr>
              </thead>
              <tbody>
                {psych.scaleResults.filter(s => s.id !== 'social_emotional').map((sc, idx) => (
                  <tr key={sc.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, borderRight: '1px solid #cbd5e1' }}>
                      {sc.num}. {sc.name}
                    </td>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1' }}>
                      <span style={{ fontSize: '.7rem', color: sc.color, fontWeight: 700 }}>{sc.typeName}</span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 900, color: sc.color, fontSize: '.92rem', borderRight: '1px solid #cbd5e1' }}>
                      {sc.rawScore} / 80
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800, color: '#b45309', borderRight: '1px solid #cbd5e1' }}>
                      %{sc.percentile}
                    </td>
                    <td style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1' }}>
                      <span
                        style={{
                          background: sc.severityColor + '15',
                          color: sc.severityColor,
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 800,
                          fontSize: '.72rem',
                          border: `1px solid ${sc.severityColor}40`,
                        }}
                      >
                        {sc.severity}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: '.74rem', color: '#475569' }}>
                      {sc.rawScore <= 20
                        ? 'أداء نمائي سليم (طبيعي)'
                        : sc.rawScore <= 40
                        ? 'صعوبة خفيفة تتطلب دعماً صفياً'
                        : sc.rawScore <= 60
                        ? 'صعوبة متوسطة تتطلب تدخلاً نوعياً'
                        : 'صعوبة شديدة مؤكدة تستوجب غرفة مصادر'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cut-off Legend */}
            <div
              style={{
                marginTop: 8,
                fontSize: '.7rem',
                color: '#64748b',
                display: 'flex',
                gap: 16,
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <span>🟢 <strong>0 - 20:</strong> عادي / لا توجد صعوبة</span>
              <span>🟡 <strong>21 - 40:</strong> صعوبات خفيفة</span>
              <span>🟠 <strong>41 - 60:</strong> صعوبات متوسطة</span>
              <span>🔴 <strong>61 - 80:</strong> صعوبات شديدة</span>
            </div>
          </div>

          {/* Section 4: Diagnostic Conclusions & Recommendations */}
          <div
            style={{
              border: '1.5px solid #cbd5e1',
              borderRadius: 8,
              padding: '14px 18px',
              background: '#f8fafc',
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: '.9rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              الاستنتاجات والقرارات التشخيصية (وفق القسم الثالث من دليل مقاييس الزيات)
            </h3>
            <div style={{ fontSize: '.82rem', lineHeight: 1.6, color: '#1e293b' }}>
              {psych.conclusionText}
            </div>

            {assessment.notes && (
              <div style={{ marginTop: 12, borderTop: '1px dashed #cbd5e1', paddingTop: 8 }}>
                <div style={{ fontSize: '.76rem', fontWeight: 800, color: '#475569' }}>
                  ملاحظات وتوصيات الفاحص الإضافية:
                </div>
                <div style={{ fontSize: '.8rem', color: '#0f172a', marginTop: 2 }}>
                  {assessment.notes}
                </div>
              </div>
            )}
          </div>

          {/* Signatures & Accreditation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: 36,
              paddingTop: 16,
              borderTop: '1px solid #cbd5e1',
              fontSize: '.82rem',
            }}
          >
            <div style={{ textAlign: 'center', width: 200 }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>معلم / أخصائي صعوبات التعلم</div>
              <div style={{ marginTop: 6, color: '#64748b' }}>{assessment.evaluator || '.........................'}</div>
              <div style={{ marginTop: 24, borderBottom: '1px dashed #94a3b8', width: '80%', margin: '24px auto 0' }}></div>
              <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: 4 }}>التوقيع والتاريخ</div>
            </div>

            <div style={{ textAlign: 'center', width: 200 }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>الأخصائي النفسي / المشرف الفني</div>
              <div style={{ marginTop: 6, color: '#64748b' }}>.........................</div>
              <div style={{ marginTop: 24, borderBottom: '1px dashed #94a3b8', width: '80%', margin: '24px auto 0' }}></div>
              <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: 4 }}>التوقيع والاعتماد</div>
            </div>

            <div style={{ textAlign: 'center', width: 200 }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>مدير المدرسة / المركز</div>
              <div style={{ marginTop: 6, color: '#64748b' }}>ختم الإدارة المعتمد</div>
              <div style={{ marginTop: 24, borderBottom: '1px dashed #94a3b8', width: '80%', margin: '24px auto 0' }}></div>
              <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: 4 }}>الختم الرسمي</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
