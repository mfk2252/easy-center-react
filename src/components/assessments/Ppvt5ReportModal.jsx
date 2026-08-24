import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { printItem } from '../../utils/printUtils';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import { calculatePPVT5Psychometrics } from '../../data/ppvt5Data';
import { calcAge } from '../../utils/dateHelpers';

export default function Ppvt5ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { toast } = useApp();

  // Re-calculate live psychometrics based on saved results to guarantee high accuracy
  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    const ageObj = assessment.dob ? calcAge(assessment.dob) : { years: 6, months: 0 };
    const ageMonths = Math.max(30, ageObj.years * 12 + ageObj.months);
    return calculatePPVT5Psychometrics(assessment.score || 0, ageMonths);
  }, [assessment]);

  if (!isOpen || !assessment) return null;

  function handlePrint() {
    printItem(`ppvt5-official-print-pane-${assessment.id}`, `تقرير بيبودي (PPVT-5) - ${assessment.studentName}`);
    toast('🖨️ تم إرسال تقرير بيبودي إلى الطباعة بنجاح', 'ok');
  }

  function handleShareWhatsApp() {
    const textReport = assessment.clinicalSummary || `
📝 تقرير سيكومتري رسمي: مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)
الطالب: ${assessment.studentName}
الدرجة الخام: ${assessment.score}
الدرجة المعيارية: ${assessment.standardScore || '—'}
الرتبة المئينية: ${assessment.percentile || '—'}%
العمر اللغوي الاستقبالي: ${assessment.ageEquivalent || '—'}
التقييم الإكلينيكي: ${assessment.level}
    `;
    sendReportToWhatsApp(assessment.studentName, 'مقياس بيبودي PPVT-5', textReport);
    toast('📲 تم تجهيز التقرير وإرساله لواتساب بنجاح', 'ok');
  }

  return (
    <div className="mbg" style={{ zIndex: 1200 }}>
      <div className="mb mb-xl">
        
        {/* Header toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g0)', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>📄 التقرير السيكومتري الرسمي ومصفوفة القياس</h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>{assessment.measureName} · {assessment.date}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn btn-xs btn-p"
              onClick={() => onEdit(assessment)}
              style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff', fontWeight: 800 }}
            >
              ✏️ تعديل الدرجات
            </button>
            <button type="button" className="btn btn-xs" onClick={handlePrint} style={{ fontWeight: 800 }}>🖨️ طباعة التقرير</button>
            <button type="button" className="btn btn-xs btn-g" onClick={handleShareWhatsApp} style={{ background: '#25d366', color: '#fff', border: 'none', fontWeight: 800 }}>💬 مشاركة WhatsApp</button>
            <button type="button" className="btn btn-xs" onClick={onClose} style={{ fontWeight: 800 }}>إغلاق ✖</button>
          </div>
        </div>

        {/* Print Content Area */}
        <div id={`ppvt5-official-print-pane-${assessment.id}`} style={{ padding: '30px 40px', background: '#fff', color: '#1f2937', direction: 'rtl', textAlign: 'right', overflowY: 'auto', maxHeight: '75vh' }}>
          
          {/* Institutional Official Letterhead */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f766e', paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f766e', margin: 0 }}>المملكة العربية السعودية</h2>
              <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>مركز الرعاية المتخصصة والتأهيل الأكاديمي</span>
            </div>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#0f766e15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '1px solid #0f766e30' }}>
              📚
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block' }}>التاريخ: {assessment.date}</span>
              <span style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block' }}>نوع التقرير: تقرير سيكومتري رسمي</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f766e', margin: '0 0 4px 0' }}>مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)</h1>
            <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 700 }}>التقرير التشخيصي والتحليلي لمستوى اللغة الاستقبالية للأطفال</span>
          </div>

          {/* Demographic Information */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, background: '#f9fafb', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <div>
              <span style={{ fontSize: '0.84rem', color: '#4b5563', display: 'block', marginBottom: 2 }}>اسم الطالب الثلاثي:</span>
              <strong style={{ fontSize: '0.94rem' }}>{assessment.studentName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: '#4b5563', display: 'block', marginBottom: 2 }}>السن الزمني الفعلي:</span>
              <strong style={{ fontSize: '0.94rem' }}>{psychometrics?.ageLabel || assessment.age || '—'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: '#4b5563', display: 'block', marginBottom: 2 }}>الأخصائي الفاحص:</span>
              <strong style={{ fontSize: '0.94rem' }}>{assessment.specialistName || 'غير محدد'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: '#4b5563', display: 'block', marginBottom: 2 }}>التشخيص الطبي الأولي:</span>
              <strong style={{ fontSize: '0.94rem' }}>{assessment.diagnosis || '—'}</strong>
            </div>
          </div>

          {/* Psychometric Scores Table */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f766e', borderBottom: '2px solid #e5e7eb', paddingBottom: 6, margin: '0 0 12px 0', fontWeight: 800 }}>
              📊 أولاً: نتائج التحليل السيكومتري للمفردات الاستقبالية:
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={{ padding: '12px 10px', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#0f766e', display: 'block', fontWeight: 700 }}>الدرجة الخام</span>
                <strong style={{ fontSize: '1.5rem', color: '#115e59', display: 'block', margin: '4px 0' }}>{assessment.score}</strong>
                <span style={{ fontSize: '0.64rem', color: '#4b5563' }}>الحد الأقصى: 96</span>
              </div>
              <div style={{ padding: '12px 10px', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#1e40af', display: 'block', fontWeight: 700 }}>الدرجة المعيارية (SS)</span>
                <strong style={{ fontSize: '1.5rem', color: '#1d4ed8', display: 'block', margin: '4px 0' }}>{assessment.standardScore || '—'}</strong>
                <span style={{ fontSize: '0.64rem', color: '#4b5563' }}>المتوسط = 100</span>
              </div>
              <div style={{ padding: '12px 10px', background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#065f46', display: 'block', fontWeight: 700 }}>الرتبة المئينية</span>
                <strong style={{ fontSize: '1.5rem', color: '#047857', display: 'block', margin: '4px 0' }}>{assessment.percentile || '—'}%</strong>
                <span style={{ fontSize: '0.64rem', color: '#4b5563' }}>يتفوق على أقرانه</span>
              </div>
              <div style={{ padding: '12px 10px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#92400e', display: 'block', fontWeight: 700 }}>العمر اللغوي المكافئ</span>
                <strong style={{ fontSize: '1.1rem', color: '#b45309', display: 'block', margin: '8px 0 6px 0' }}>{assessment.ageEquivalent || '—'}</strong>
                <span style={{ fontSize: '0.64rem', color: '#4b5563' }}>السن المفرداتي المتوقع</span>
              </div>
            </div>
          </div>

          {/* Clinical Impress Panel */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f766e', borderBottom: '2px solid #e5e7eb', paddingBottom: 6, margin: '0 0 12px 0', fontWeight: 800 }}>
              🔍 ثانياً: التقييم الإكلينيكي والدلالات التشخيصية:
            </h3>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {assessment.clinicalSummary || 'لا يوجد ملخص إكلينيكي مسجل لهذا التقييم.'}
            </div>
          </div>

          {/* Educational Goals / Recommendations */}
          {assessment.recommendations && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.05rem', color: '#0f766e', borderBottom: '2px solid #e5e7eb', paddingBottom: 6, margin: '0 0 12px 0', fontWeight: 800 }}>
                🎯 ثالثاً: التوصيات السلوكية وخطط التدخل التربوي الفردي (IEP):
              </h3>
              <div style={{ background: '#fdfdfd', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#374151' }}>
                {assessment.recommendations}
              </div>
            </div>
          )}

          {/* Institutional Signature Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block' }}>أخصائي التخاطب والنطق الفاحص</span>
              <div style={{ height: 40 }} />
              <strong style={{ fontSize: '0.85rem' }}>{assessment.specialistName || '________________'}</strong>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block' }}>ختم المؤسسة الرسمي</span>
              <div style={{ width: 80, height: 80, border: '1px dashed #ccc', borderRadius: '50%', margin: '8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.64rem', color: '#9ca3af' }}>
                الختم الرسمي
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block' }}>المشرف الفني والأكاديمي للقسم</span>
              <div style={{ height: 40 }} />
              <strong style={{ fontSize: '0.85rem' }}>أ.د. مـحـمـد فـهـد</strong>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
