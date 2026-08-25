import { useRef } from 'react';
import { useApp } from '../../context/AppContext';

export default function ConnersParentReportModal({ isOpen, onClose, assessment }) {
  const { center } = useApp();
  const reportRef = useRef(null);

  if (!isOpen || !assessment) return null;

  const results = assessment.results || {};
  const stuName = assessment.studentName || 'غير مسجل';

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mbg no-print" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mb mb-xl" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ flexShrink: 0, padding: '16px 20px', background: 'linear-gradient(135deg, #ea580c, #c2410c)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>تقرير مقياس كونرز للوالدين - CPRS-R (L)</h2>
            <p style={{ margin: '4px 0 0', fontSize: '.84rem', opacity: 0.9 }}>
              تقييم فرط الحركة وتشتت الانتباه - النسخة المطولة (80 فقرة)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }} onClick={handlePrint}>
              🖨️ طباعة
            </button>
            <button className="btn btn-g" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Report Area */}
        <div ref={reportRef} className="print-only-container" style={{ flex: 1, overflowY: 'auto', padding: '30px 40px', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
          {/* Print Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {center?.logo && <img src={center.logo} alt="Logo" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--pr)' }}>{center?.name || 'مركز الرعاية والتأهيل'}</h2>
                <div style={{ fontSize: '.8rem', color: 'var(--text-sub)', marginTop: 4 }}>قسم التقييم والتشخيص النفسي</div>
              </div>
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.6 }}>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>رقم التقرير: <strong style={{ color: 'var(--text-main)' }}>CON-{assessment.id?.slice(-6) || '2026'}</strong></div>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>تاريخ الفحص: <strong style={{ color: 'var(--text-main)' }}>{assessment.date || new Date().toISOString().split('T')[0]}</strong></div>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>حالة التقرير: <strong style={{ color: '#059669' }}>معتمد رسمياً</strong></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              التقرير السيكومتري لمقياس كونرز - النسخة الوالدية
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '.9rem', color: 'var(--text-sub)' }}>Conners Parent Rating Scale - Revised (L)</p>
          </div>

          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 18px', marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>اسم المفحوص:</span>
              <strong style={{ fontSize: '.95rem', color: 'var(--text-main)' }}>{stuName}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>العمر / الجنس:</span>
              <strong style={{ fontSize: '.95rem', color: 'var(--text-main)' }}>
                {assessment.age || '—'} · {assessment.gender === 'male' ? 'ذكر' : assessment.gender === 'female' ? 'أنثى' : '—'}
              </strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>الأخصائي الفاحص:</span>
              <strong style={{ fontSize: '.95rem', color: 'var(--text-main)' }}>{assessment.examinerName || '—'}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {(() => {
              const adhdSub = results.subscales?.find(s => s.id === 'H');
              return (
                <div style={{ background: 'var(--bg-card)', border: `2px solid ${results.severityColor || '#cbd5e1'}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-sub)', fontWeight: 700 }}>المؤشر العام للدرجة المعيارية (ADHD Index T-Score)</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: results.severityColor || 'var(--text-main)', margin: '8px 0' }}>
                    {adhdSub?.tScore || 50}
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>{results.level}</div>
                </div>
              );
            })()}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '.85rem', color: 'var(--text-sub)', fontWeight: 700, marginBottom: 8 }}>دلالة الدرجات المعيارية (T-Scores):</div>
              <ul style={{ margin: 0, padding: '0 20px', fontSize: '.8rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
                <li><strong>45 - 55:</strong> متوسط وطبيعي</li>
                <li><strong>56 - 60:</strong> فوق المتوسط بدرجة طفيفة</li>
                <li><strong>61 - 65:</strong> فوق المتوسط (مؤشر خطر)</li>
                <li><strong style={{ color: '#ef4444' }}>66 فأكثر:</strong> دلالة إكلينيكية مرتفعة جداً</li>
              </ul>
              <div style={{ fontSize: '.7rem', color: 'var(--text-sub)', marginTop: 8 }}>* الدرجات المعيارية هنا مقدرة تقريبياً (Approx). يرجى مطابقتها مع الجداول النرمية الأصلية للدقة القصوى.</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '2px solid var(--border-color)', paddingBottom: 8, marginBottom: 16 }}>
            تحليل الأبعاد الفرعية للمقياس (Profile)
          </h3>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-sub)', fontWeight: 800 }}>
                  <th style={{ padding: '10px 14px', width: '35%' }}>البعد (Scale)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>الخام (Raw)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>المعيارية (T-Score)</th>
                  <th style={{ padding: '10px 14px' }}>المستوى الإكلينيكي</th>
                </tr>
              </thead>
              <tbody>
                {results.subscales?.map((sub, idx) => (
                  <tr key={sub.id} style={{ borderBottom: idx === results.subscales.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: sub.color, fontSize: '.9rem' }}>{sub.id}. {sub.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>{sub.englishName}</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>
                      {sub.raw}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ background: `${sub.severityColor}15`, color: sub.severityColor, padding: '4px 10px', borderRadius: 6, fontSize: '.9rem', fontWeight: 900 }}>
                        {sub.tScore}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '.84rem', fontWeight: 700, color: sub.severityColor }}>
                      {sub.level}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(assessment.clinicalSummary || assessment.notes) && (
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 18, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                الاستنتاج السريري والملاحظات
              </h3>
              <p style={{ margin: 0, fontSize: '.88rem', lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                {assessment.clinicalSummary || assessment.notes}
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 40, paddingTop: 20, borderTop: '2px dashed var(--border-color)', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '.85rem', color: 'var(--text-sub)', marginBottom: 6 }}>الأخصائي الفاحص</div>
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{assessment.examinerName || '.......................'}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 4 }}>التوقيع: .......................</div>
            </div>
            <div>
              <div style={{ fontSize: '.85rem', color: 'var(--text-sub)', marginBottom: 6 }}>الاعتماد والختم</div>
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>إدارة المركز</div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
