import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { printItem } from '../../utils/printUtils';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import { calculateAbuHasibaPsychometrics } from '../../data/abuhasibaData';
import { calcAge } from '../../utils/dateHelpers';

export default function AbuHasibaReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { toast } = useApp();

  // Re-calculate live psychometrics based on saved results to guarantee high accuracy
  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    const ageObj = assessment.dob ? calcAge(assessment.dob) : { years: 3, months: 0 };
    const ageMonths = Math.max(2, ageObj.years * 12 + ageObj.months);

    // Extract receptive and expressive results maps
    const rawReceptive = {};
    const rawExpressive = {};
    
    Object.entries(assessment.resultsReceptive || {}).forEach(([k, v]) => {
      const id = k.replace('r_', '');
      rawReceptive[id] = v;
    });

    Object.entries(assessment.resultsExpressive || {}).forEach(([k, v]) => {
      const id = k.replace('e_', '');
      rawExpressive[id] = v;
    });

    return calculateAbuHasibaPsychometrics(rawReceptive, rawExpressive, ageMonths);
  }, [assessment]);

  if (!isOpen || !assessment) return null;

  function handlePrint() {
    printItem(`abuhasiba-official-print-pane-${assessment.id}`, `تقرير مقياس أبو حسيبة للغة المعرب - ${assessment.studentName}`);
    toast('🖨️ تم إرسال تقرير الدكتور أبو حسيبة للغة المعرب إلى الطباعة بنجاح', 'ok');
  }

  function handleShareWhatsApp() {
    const textReport = assessment.clinicalSummary || `
📝 تقرير سيكومتري رسمي: مقياس د. أحمد أبو حسيبة للغة المعرب (PLS)
الطالب: ${assessment.studentName}
الدرجة الخام الكلية: ${assessment.score} / 133
الدرجة المعيارية الكلية: ${assessment.standardScore || '—'}
الرتبة المئينية: ${assessment.percentile || '—'}%
العمر اللغوي الكلي المكافئ: ${assessment.ageEquivalent || '—'}
فجوة التأخر اللغوي: ${assessment.delayGap || '—'}
التصنيف الإكلينيكي: ${assessment.clinicalClassification || '—'}
    `;
    sendReportToWhatsApp(assessment.studentName, 'مقياس د. أحمد أبو حسيبة للغة المعرب', textReport);
    toast('📲 تم تجهيز التقرير التشخيصي وإرساله لواتساب بنجاح', 'ok');
  }

  return (
    <div className="mbg" style={{ zIndex: 1200 }}>
      <div className="mb mb-xl">
        
        {/* Header Toolbar */}
        <div className="fhd modal-header-custom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g0)', padding: '12px 20px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0369a1' }}>📄 التقرير السيكومتري الرسمي ومصفوفة قياس أبو حسيبة</h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>{assessment.measureName} · {assessment.date}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn btn-xs btn-p"
              onClick={() => onEdit(assessment)}
              style={{ background: '#0369a1', borderColor: '#0369a1', color: '#fff', fontWeight: 800 }}
            >
              ✏️ تعديل الدرجات والبنود
            </button>
            <button type="button" className="btn btn-xs" onClick={handlePrint} style={{ fontWeight: 800 }}>🖨️ طباعة التقرير</button>
            <button type="button" className="btn btn-xs btn-g" onClick={handleShareWhatsApp} style={{ background: '#25d366', color: '#fff', border: 'none', fontWeight: 800 }}>💬 مشاركة WhatsApp</button>
            <button type="button" className="btn btn-xs" onClick={onClose} style={{ fontWeight: 800 }}>إغلاق ✖</button>
          </div>
        </div>

        {/* Print Content Area */}
        <div id={`abuhasiba-official-print-pane-${assessment.id}`} style={{ padding: '35px 45px', background: '#fff', color: '#1f2937', direction: 'rtl', textAlign: 'right', overflowY: 'auto', maxHeight: '75vh' }}>
          
          {/* Official Letterhead */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0369a1', paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0369a1', margin: 0 }}>المملكة العربية السعودية</h2>
              <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>مركز الرعاية المتخصصة والتأهيل الأكاديمي واللغوي</span>
            </div>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#0369a115', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '1px solid #0369a130' }}>
              🧠
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block' }}>تاريخ الفحص: {assessment.date}</span>
              <span style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block' }}>الأخصائي الفاحص: {assessment.specialistName || 'أخصائي تخاطب لغوي'}</span>
            </div>
          </div>

          {/* Title block */}
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0369a1', margin: '0 0 4px 0' }}>مقياس الدكتور أحمد أبو حسيبة للغة المعرب (Preschool Language Scale)</h1>
            <span style={{ fontSize: '0.84rem', color: '#4b5563', fontWeight: 700 }}>تقرير التشخيص السيكومتري الشامل ومصفوفة العمر اللغوي للطفل</span>
          </div>

          {/* Demographic Data Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginBottom: 2 }}>اسم الطالب:</span>
              <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>{assessment.studentName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginBottom: 2 }}>تاريخ الميلاد:</span>
              <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>{assessment.dob || 'غير متوفر'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginBottom: 2 }}>السن الزمني وقت التقييم:</span>
              <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>{assessment.age || 'غير متوفر'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginBottom: 2 }}>التصنيف الطبي/التشخيص:</span>
              <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>{assessment.diagnosis || 'غير محدد'}</strong>
            </div>
          </div>

          {/* Clinical Disclaimer Box in print */}
          <div style={{ border: '1px solid #93c5fd', background: '#eff6ff', padding: '10px 14px', borderRadius: 8, fontSize: '0.74rem', color: '#1e3a8a', lineHeight: 1.5, marginBottom: 24 }}>
            <strong>تنبيه إداري وسيكومتري:</strong> هذا التقرير الإلكتروني يعالج درجات ومخرجات تطبيق اختبار الدكتور أحمد أبو حسيبة للغة المعرب وفق شروط الخط القاعدي (Basal) وحد التوقف (Ceiling) المعتمدة أكاديمياً. يشترط لصحة المعايرة استخدام الأدوات والمواد الحسية الأصلية الخاصة بالحقيبة الرسمية للمقياس.
          </div>

          {/* Core Results Matrices Table */}
          <div style={{ marginBottom: 26 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', marginBottom: 12, borderBottom: '2px solid #e2e8f0', paddingBottom: 6 }}>📊 مصفوفة التحليل الكمي والدرجات السيكومترية</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'center' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>القسم والمهارة اللغوية</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>الدرجة الخام المحققة</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>الدرجة المعيارية (SS)</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>الرتبة المئينية (%)</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>العمر اللغوي المكافئ (LAE)</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>فجوة التأخر اللغوي</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>اللغة الاستقبالية (Receptive)</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>{assessment.receptiveRaw || 0} / 62</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>{assessment.receptiveSS || '—'}</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>{assessment.receptivePR || '—'}%</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
                    {psychometrics ? `${Math.floor(psychometrics.receptiveLAEMonths / 12)}س و ${psychometrics.receptiveLAEMonths % 12}ش` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', color: '#b91c1c', fontWeight: 700 }}>
                    {psychometrics ? `${Math.floor(psychometrics.receptiveDelayGapMonths / 12)}س و ${psychometrics.receptiveDelayGapMonths % 12}ش` : '—'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>اللغة التعبيرية (Expressive)</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>{assessment.expressiveRaw || 0} / 71</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>{assessment.expressiveSS || '—'}</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>{assessment.expressivePR || '—'}%</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
                    {psychometrics ? `${Math.floor(psychometrics.expressiveLAEMonths / 12)}س و ${psychometrics.expressiveLAEMonths % 12}ش` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', color: '#b91c1c', fontWeight: 700 }}>
                    {psychometrics ? `${Math.floor(psychometrics.expressiveDelayGapMonths / 12)}س و ${psychometrics.expressiveDelayGapMonths % 12}ش` : '—'}
                  </td>
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: 800, borderBottom: '2px solid #94a3b8' }}>
                  <td style={{ padding: '12px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0369a1' }}>الدرجة الكلية المركبة (Total)</td>
                  <td style={{ padding: '12px 12px', border: '1px solid #cbd5e1', color: '#0369a1' }}>{assessment.score || 0} / 133</td>
                  <td style={{ padding: '12px 12px', border: '1px solid #cbd5e1', color: '#0369a1' }}>{assessment.standardScore || '—'}</td>
                  <td style={{ padding: '12px 12px', border: '1px solid #cbd5e1', color: '#0369a1' }}>{assessment.percentile || '—'}%</td>
                  <td style={{ padding: '12px 12px', border: '1px solid #cbd5e1', color: '#0284c7' }}>{assessment.ageEquivalent || '—'}</td>
                  <td style={{ padding: '12px 12px', border: '1px solid #cbd5e1', color: '#b91c1c' }}>{assessment.delayGap || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Clinical Interpretation & Cut-off Diagnostic Verdict */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 26 }}>
            <div style={{ background: '#0369a1', color: '#fff', padding: '8px 16px', fontWeight: 800, fontSize: '0.9rem' }}>
              🎯 التشخيص الإكلينيكي ونقطة القطع (Diagnostic Cut-off & Verdict)
            </div>
            <div style={{ padding: 16, background: '#f8fafc', fontSize: '0.86rem', lineHeight: 1.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                <span>التصنيف السلوكي التطوري للغة:</span>
                <strong style={{ color: assessment.standardScore < 77.5 ? '#dc2626' : '#16a34a' }}>
                  {assessment.clinicalClassification || 'تأخر لغوي ملموس'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>معيار نقطة الحد الفاصل للعمر الزمني:</span>
                <span style={{ fontWeight: 700, color: '#334155' }}>{assessment.cutoffText || '—'}</span>
              </div>
            </div>
          </div>

          {/* Narrative clinical Summary */}
          <div style={{ marginBottom: 26 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', marginBottom: 10, borderBottom: '2px solid #e2e8f0', paddingBottom: 6 }}>📝 التقرير الإكلينيكي التفصيلي (Clinical Impression Summary)</h3>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: 1.7, background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0', color: '#334155' }}>
              {assessment.clinicalSummary || 'لم يتم تسجيل تقرير وصفي.'}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ marginBottom: 26 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', marginBottom: 10, borderBottom: '2px solid #e2e8f0', paddingBottom: 6 }}>💡 التوصيات العلاجية والتربوية (Clinical Recommendations)</h3>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: 1.7, background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0', color: '#334155' }}>
              {assessment.recommendations || 'لم تسجل أي توصيات.'}
            </div>
          </div>

          {/* Measurable IEP goals linked directly from weaknesses */}
          {(assessment.receptiveWeaknesses?.length > 0 || assessment.expressiveWeaknesses?.length > 0) && (
            <div style={{ marginBottom: 30, pageBreakBefore: 'always' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f766e', marginBottom: 12, borderBottom: '2px solid #cbd5e1', paddingBottom: 6 }}>
                🎯 أهداف الخطة التربوية الفردية المقترحة (Measurable IEP Goals Linked from Weaknesses)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 14px 0' }}>
                تم استخلاص الأهداف التالية تلقائياً من البنود غير المجتازة التي تقع ضمن الفئة التطورية للطفل، وصيغت كأهداف سلوكية إجرائية قابلة للقياس المباشر:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {assessment.receptiveWeaknesses?.slice(0, 4).map((w, idx) => (
                  <div key={`rec-weak-${w.id}`} style={{ padding: 12, background: '#f0fdfa', borderRight: '4px solid #0f766e', borderRadius: 8, fontSize: '0.84rem' }}>
                    <strong style={{ color: '#0f766e', display: 'block', marginBottom: 4 }}>هدف لغة استقبالية مقترح (بند {w.id}): {w.domain}</strong>
                    <span style={{ color: '#334155' }}>{w.goal}</span>
                  </div>
                ))}

                {assessment.expressiveWeaknesses?.slice(0, 4).map((w, idx) => (
                  <div key={`exp-weak-${w.id}`} style={{ padding: 12, background: '#fffbeb', borderRight: '4px solid #d97706', borderRadius: 8, fontSize: '0.84rem' }}>
                    <strong style={{ color: '#d97706', display: 'block', marginBottom: 4 }}>هدف لغة تعبيرية مقترح (بند {w.id}): {w.domain}</strong>
                    <span style={{ color: '#334155' }}>{w.goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 40, borderTop: '2px solid #e2e8f0', paddingTop: 20, fontSize: '0.84rem' }}>
            <div style={{ textAlign: 'center' }}>
              <strong>الأخصائي الفاحص</strong>
              <div style={{ height: 40 }} />
              <span style={{ display: 'block', color: '#64748b' }}>{assessment.specialistName || 'أخصائي نطق وتخاطب'}</span>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>التوقيع: ..........................</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <strong>المشرف الفني السلوكي</strong>
              <div style={{ height: 40 }} />
              <span style={{ display: 'block', color: '#64748b' }}>المشرف المعتمد للمركز</span>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>التوقيع والختم: ..........................</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <strong>مدير المركز</strong>
              <div style={{ height: 40 }} />
              <span style={{ display: 'block', color: '#64748b' }}>إدارة التأهيل والتشخيص</span>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>الختم الرسمي للمركز</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
