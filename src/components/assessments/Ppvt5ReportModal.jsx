import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { printItem } from '../../utils/printUtils';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import { calculatePPVT5Psychometrics, PPVT5_COPYRIGHT_INFO } from '../../data/ppvt5Data';
import { calcAge } from '../../utils/dateHelpers';

export default function Ppvt5ReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { toast } = useApp();
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);

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
الدرجة الخام: ${assessment.score} / 96
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
      <div className="mb mb-xl" style={{ background: 'var(--card-bg, #fff)', color: 'var(--text-main, #111827)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: 16, overflow: 'hidden' }}>
        
        {/* Header toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g0, #f9fafb)', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>📄 التقرير السيكومتري الرسمي ومصفوفة القياس</h3>
              <button
                type="button"
                onClick={() => setShowCopyrightModal(true)}
                style={{ background: '#0f766e15', border: '1px solid #0f766e30', color: '#0f766e', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}
              >
                📜 دليل حقوق المقياس
              </button>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>{assessment.measureName} · {assessment.date}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-xs btn-p"
              onClick={() => onEdit(assessment)}
              style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff', fontWeight: 800 }}
            >
              ✏️ تعديل الدرجات
            </button>
            <button type="button" className="btn btn-xs" onClick={handlePrint} style={{ fontWeight: 800, background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>🖨️ طباعة التقرير</button>
            <button type="button" className="btn btn-xs btn-g" onClick={handleShareWhatsApp} style={{ background: '#25d366', color: '#fff', border: 'none', fontWeight: 800 }}>💬 مشاركة WhatsApp</button>
            <button type="button" className="btn btn-xs" onClick={onClose} style={{ fontWeight: 800, background: 'var(--g1)', color: 'var(--text-main)' }}>إغلاق ✖</button>
          </div>
        </div>

        {/* Print Content Area (Always high contrast crisp white background for official print layout) */}
        <div id={`ppvt5-official-print-pane-${assessment.id}`} style={{ padding: '30px 40px', background: '#ffffff', color: '#1f2937', direction: 'rtl', textAlign: 'right', overflowY: 'auto', flex: 1 }}>
          
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
            <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 700 }}>التقرير التشخيصي والتحليلي لمستوى اللغة الاستقبالية للأطفال (Peabody Picture Vocabulary Test - 5th Ed)</span>
          </div>

          {/* Demographic Information */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, background: '#f9fafb', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <div>
              <span style={{ fontSize: '0.84rem', color: '#4b5563', display: 'block', marginBottom: 2 }}>اسم الطالب الثلاثي:</span>
              <strong style={{ fontSize: '0.94rem', color: '#111827' }}>{assessment.studentName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: '#4b5563', display: 'block', marginBottom: 2 }}>السن الزمني الفعلي:</span>
              <strong style={{ fontSize: '0.94rem', color: '#111827' }}>{psychometrics?.ageLabel || assessment.age || '—'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: '#4b5563', display: 'block', marginBottom: 2 }}>الأخصائي الفاحص:</span>
              <strong style={{ fontSize: '0.94rem', color: '#111827' }}>{assessment.specialistName || 'غير محدد'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.84rem', color: '#4b5563', display: 'block', marginBottom: 2 }}>ولي الأمر / مجيب التقييم:</span>
              <strong style={{ fontSize: '0.94rem', color: '#111827' }}>{assessment.informantName || 'أحد الوالدين'}</strong>
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
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#1f2937' }}>
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

      {/* Copyright Info Modal */}
      {showCopyrightModal && (
        <div className="mbg" style={{ zIndex: 1300 }}>
          <div className="mb" style={{ maxWidth: '640px', background: 'var(--card-bg, #fff)', color: 'var(--text-main, #111827)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: 16, padding: 24, direction: 'rtl' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📜</span> دليل وحقوق الملكية الفكرية (PPVT™-5)
              </h3>
              <button type="button" className="btn-close-modal" onClick={() => setShowCopyrightModal(false)} style={{ background: 'var(--g0)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: 8, cursor: 'cursor' }}>✖</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.86rem', lineHeight: 1.6 }}>
              <div style={{ background: 'var(--g0)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#0f766e', display: 'block', marginBottom: 2 }}>اسم المقياس الرسمي:</strong>
                <span>{PPVT5_COPYRIGHT_INFO.measureNameAr} ({PPVT5_COPYRIGHT_INFO.measureNameEn})</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>المؤلفون والجهة الناشرة:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-sub)' }}>{PPVT5_COPYRIGHT_INFO.authorAr} · {PPVT5_COPYRIGHT_INFO.publisher}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>الفئة العمرية والتطبيق:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-sub)' }}>{PPVT5_COPYRIGHT_INFO.ageRange}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>المعايير السيكومترية:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-sub)' }}>{PPVT5_COPYRIGHT_INFO.normSamples}</p>
              </div>
            </div>
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <button type="button" className="btn btn-p" onClick={() => setShowCopyrightModal(false)} style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff' }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
