import { useState } from 'react';
import {
  DEV_LD_ITEMS,
  DEV_LD_DOMAINS,
  DEV_LD_COPYRIGHT_INFO,
  calculateDevLdPsychometrics,
} from '../../data/devLdData';

export default function DevLdReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const [showItemDetails, setShowItemDetails] = useState(false);

  if (!isOpen || !assessment) return null;

  const psychometrics = assessment.psychometrics || calculateDevLdPsychometrics(assessment.results || assessment.scores || {});

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const text = `*تقرير تشخيصي - قائمة صعوبات التعلم النمائية لأطفال الروضة*\n` +
      `*إعداد:* أ.د. عادل عبدالله محمد (جامعة الزقازيق - دار الرشاد)\n` +
      `--------------------------------\n` +
      `*اسم الطفل:* ${assessment.studentName || '—'}\n` +
      `*المستوى بالروضة:* ${assessment.grade || '—'}\n` +
      `*تاريخ التقييم:* ${assessment.date || '—'}\n` +
      `*الدرجة الكلية:* ${psychometrics.totalRawScore} من ${psychometrics.totalMaxScore} (${psychometrics.overallPercentage}%)\n` +
      `*التصنيف التشخيصي:* ${psychometrics.probability}\n` +
      `--------------------------------\n` +
      `*الأبعاد النمائية الثلاثة:*\n` +
      `1. المعرفية (الانتباه، الإدراك، الذاكرة): ${psychometrics.cognitivePct}%\n` +
      `2. اللغوية والتفكير: ${psychometrics.langThinkingPct}%\n` +
      `3. البصرية - الحركية: ${psychometrics.visualMotorPct}%\n` +
      `--------------------------------\n` +
      `*الخلاصة:* ${psychometrics.severityLevel}\n` +
      `تم استخراج هذا التقرير عبر منظومة التربية الخاصة وصعوبات التعلم.`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="mb mb-xl"
        style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16,
          maxHeight: 'min(95vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '1100px',
        }}
      >
        {/* Top Action Bar (Screen Only) */}
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
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>📄</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                تقرير الفرز والتشخيص النمائي الرسمي
              </h3>
              <span style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                قائمة صعوبات التعلم النمائية لأطفال الروضة · أ.د. عادل عبدالله محمد
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => {
                  onClose();
                  onEdit(assessment);
                }}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700 }}
              >
                ✏️ تعديل الدرجات
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleShareWhatsApp}
              style={{ background: '#25D366', color: '#fff', border: 'none', fontWeight: 700 }}
            >
              📲 مشاركة واتساب
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handlePrint}
              style={{ background: '#fff', color: '#0f766e', border: 'none', fontWeight: 800 }}
            >
              🖨️ طباعة التقرير (A4)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}
            >
              ✖
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div
          className="print-container"
          style={{
            padding: '24px 32px',
            flex: 1,
            overflowY: 'auto',
            background: '#fff',
            color: '#1e293b',
            lineHeight: 1.6,
          }}
        >
          {/* Official Report Header */}
          <div
            style={{
              borderBottom: '2px solid #0f766e',
              paddingBottom: 14,
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                المملكة العربية السعودية / المنظومة الإكلينيكية والتربوية
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f766e', margin: '4px 0' }}>
                تقرير الفرز والتشخيص لصعوبات التعلم النمائية لأطفال الروضة
              </h1>
              <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                مبني على مقياس وقائمة: <strong>أ.د. عادل عبدالله محمد</strong> (جامعة الزقازيق - دار الرشاد) وفق نموذج كيرك وكالفنت (Kirk & Chalfant)
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: '0.78rem', color: '#475569' }}>
              <div><strong>تاريخ التقرير:</strong> {assessment.date || '—'}</div>
              <div><strong>رقم السجل:</strong> #{assessment.id?.slice(0, 8) || 'DEV-LD'}</div>
              <div className="bdg" style={{ background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', marginTop: 4, fontWeight: 800 }}>
                معتمد للتدخل المبكر والروضة
              </div>
            </div>
          </div>

          {/* Child & Assessment Demographics Table */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: '12px 18px',
              border: '1px solid #e2e8f0',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f766e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>👦</span> البيانات الأساسية والمعلومات العامة:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 16px', fontSize: '0.82rem' }}>
              <div><strong>اسم الطفل:</strong> {assessment.studentName || '—'}</div>
              <div><strong>العمر الزمني:</strong> {assessment.age ? `${assessment.age} سنة` : '—'}</div>
              <div><strong>المستوى بالروضة:</strong> {assessment.grade || 'المستوى الثاني (KG2)'}</div>
              <div><strong>الروضة / المدرسة:</strong> {assessment.school || '—'}</div>
              <div><strong>القائم بالتقييم / الفاحص:</strong> {assessment.examinerName || '—'}</div>
              <div><strong>المستجيب والملاحظ:</strong> {assessment.raterName || 'معلمة الروضة'} ({assessment.raterRelation || 'معلمة الفصل'})</div>
            </div>
          </div>

          {/* Core Diagnostic Classification Hero Box */}
          <div
            style={{
              background: psychometrics.severityKey === 'severe' ? '#fef2f2' : psychometrics.severityKey === 'at_risk' ? '#fffbeb' : '#f0fdf4',
              border: `2px solid ${psychometrics.severityColor}`,
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
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                النتيجة والتصنيف التشخيصي المعتمد:
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.severityColor, margin: '4px 0' }}>
                {psychometrics.probability}
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '650px' }}>
                {psychometrics.severityLevel}
              </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '160px', background: '#fff', padding: '10px 16px', borderRadius: 10, border: `1px solid ${psychometrics.severityColor}` }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>الدرجة الكلية والنسبة</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.totalRawScore} <small style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {psychometrics.totalMaxScore}</small>
              </div>
              <div className="bdg" style={{ background: psychometrics.severityColor, color: '#fff', fontWeight: 800, fontSize: '0.74rem' }}>
                النسبة: {psychometrics.overallPercentage}%
              </div>
            </div>
          </div>

          {/* Three Major Pillars Summary Cards */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f766e', marginBottom: 10 }}>
              📊 توزيع الأداء على الأبعاد النمائية الثلاثية الكبرى (Kirk & Chalfant):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {/* Pillar 1 */}
              <div style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, color: '#6d28d9', fontSize: '0.86rem' }}>1. الصعوبات المعرفية</span>
                  <span className="bdg" style={{ background: '#6d28d9', color: '#fff', fontSize: '0.72rem' }}>
                    {psychometrics.cognitivePct}%
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#4b5563', marginBottom: 6 }}>
                  تشمل: الانتباه (11) · الإدراك (15) · الذاكرة (13)
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1f2937' }}>
                  الدرجة: {psychometrics.cognitiveRaw} / {psychometrics.cognitiveMax}
                </div>
              </div>

              {/* Pillar 2 */}
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, color: '#b45309', fontSize: '0.86rem' }}>2. الصعوبات اللغوية والتفكير</span>
                  <span className="bdg" style={{ background: '#b45309', color: '#fff', fontSize: '0.72rem' }}>
                    {psychometrics.langThinkingPct}%
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#4b5563', marginBottom: 6 }}>
                  تشمل: التفكير والاستدلال (13) · اللغة الشفوية والاستقبال (14)
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1f2937' }}>
                  الدرجة: {psychometrics.langThinkingRaw} / {psychometrics.langThinkingMax}
                </div>
              </div>

              {/* Pillar 3 */}
              <div style={{ background: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.86rem' }}>3. الصعوبات البصرية - الحركية</span>
                  <span className="bdg" style={{ background: '#0f766e', color: '#fff', fontSize: '0.72rem' }}>
                    {psychometrics.visualMotorPct}%
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#4b5563', marginBottom: 6 }}>
                  تشمل: التناسق العضلي العام · المهارات الدقيقة · التوازن والتآزر (14)
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1f2937' }}>
                  الدرجة: {psychometrics.visualMotorRaw} / {psychometrics.visualMotorMax}
                </div>
              </div>
            </div>
          </div>

          {/* Subscales Table Breakdown */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f766e', marginBottom: 10 }}>
              📋 جدول درجات المقاييس الفرعية الستة (Subscales Table):
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'right' }}>
                <thead>
                  <tr style={{ background: '#0f766e', color: '#fff' }}>
                    <th style={{ padding: '8px 12px', borderRadius: '0 6px 0 0' }}>المقياس الفرعي</th>
                    <th style={{ padding: '8px 12px' }}>البعد النمائي</th>
                    <th style={{ padding: '8px 12px' }}>العبارات</th>
                    <th style={{ padding: '8px 12px' }}>الدرجة الخام</th>
                    <th style={{ padding: '8px 12px' }}>النسبة %</th>
                    <th style={{ padding: '8px 12px', borderRadius: '6px 0 0 0' }}>التفسير والشدة</th>
                  </tr>
                </thead>
                <tbody>
                  {psychometrics.domainResults.map((dom, idx) => (
                    <tr key={dom.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700 }}>
                        {dom.icon} {dom.name}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>{dom.pillarName}</td>
                      <td style={{ padding: '8px 12px' }}>{dom.itemsRange} ({dom.itemsCount})</td>
                      <td style={{ padding: '8px 12px', fontWeight: 800 }}>
                        {dom.rawScore} <small style={{ color: '#64748b' }}>/ {dom.maxScore}</small>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 800, color: dom.color }}>
                        {dom.percentage}%
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span className={`bdg ${dom.domainClass}`} style={{ fontSize: '0.72rem' }}>
                          {dom.domainStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr style={{ background: '#f0fdfa', fontWeight: 900, borderTop: '2px solid #0f766e' }}>
                    <td style={{ padding: '10px 12px' }} colSpan={3}>
                      المجموع الكلي للقائمة (80 عبارة)
                    </td>
                    <td style={{ padding: '10px 12px', color: '#0f766e', fontSize: '0.95rem' }}>
                      {psychometrics.totalRawScore} / {psychometrics.totalMaxScore}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#0f766e', fontSize: '0.95rem' }}>
                      {psychometrics.overallPercentage}%
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`bdg ${psychometrics.severityKey === 'severe' ? 'b-rd' : psychometrics.severityKey === 'at_risk' ? 'b-or' : 'b-gr'}`}>
                        {psychometrics.probability}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Qualitative Clinical Analysis */}
          {assessment.clinicalSummary && (
            <div style={{ marginBottom: 20, background: '#f8fafc', padding: '14px 18px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f766e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> التحليل الإكلينيكي والفرز النمائي:
              </div>
              <div style={{ whiteSpace: 'pre-line', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                {assessment.clinicalSummary}
              </div>
            </div>
          )}

          {/* Early Intervention & IEP Recommendations */}
          {assessment.recommendations && (
            <div style={{ marginBottom: 24, background: '#f0fdf4', padding: '14px 18px', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🎯</span> توصيات التدخل المبكر والخطة التربوية الفردية (IEP Bridge):
              </div>
              <div style={{ whiteSpace: 'pre-line', fontSize: '0.82rem', color: '#166534', lineHeight: 1.6 }}>
                {assessment.recommendations}
              </div>
            </div>
          )}

          {/* Expandable Item-by-Item Evaluation Log */}
          <div className="no-print" style={{ marginBottom: 24 }}>
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={() => setShowItemDetails(s => !s)}
              style={{ width: '100%', padding: '8px 12px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
            >
              <span>{showItemDetails ? '▲ إخفاء تفاصيل استجابات البنود الـ 80' : '▼ عرض تفاصيل استجابات البنود الـ 80 مع الملاحظات'}</span>
            </button>

            {showItemDetails && (
              <div style={{ marginTop: 12, border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, maxHeight: 400, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 8, fontSize: '0.78rem' }}>
                  {DEV_LD_ITEMS.map(it => {
                    const score = assessment.scores?.[it.id] ?? assessment.results?.[it.id];
                    const note = assessment.itemNotes?.[it.id];
                    const domain = DEV_LD_DOMAINS.find(d => d.id === it.domainId);
                    return (
                      <div key={it.id} style={{ background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                          <span style={{ fontWeight: 700, color: domain?.color }}>#{it.id} {it.text}</span>
                          <span className={`bdg ${score === 2 ? 'b-rd' : score === 1 ? 'b-or' : 'b-gr'}`} style={{ flexShrink: 0 }}>
                            {score === 2 ? 'نعم (2)' : score === 1 ? 'أحياناً (1)' : score === 0 ? 'لا (0)' : '—'}
                          </span>
                        </div>
                        {note && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>💬 {note}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Intellectual Property Notice Footer */}
          <div
            style={{
              background: '#f1f5f9',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.72rem',
              color: '#64748b',
              lineHeight: 1.5,
              marginBottom: 24,
              border: '1px dashed #cbd5e1',
            }}
          >
            <strong>حقوق الملكية الفكرية والتوثيق العلمي:</strong> {DEV_LD_COPYRIGHT_INFO.scaleNameAr} — إعداد: <b>{DEV_LD_COPYRIGHT_INFO.authorAr}</b> ({DEV_LD_COPYRIGHT_INFO.authorTitle}) · الناشر المعتمد: <b>{DEV_LD_COPYRIGHT_INFO.publisherAr}</b>. تم استخراج هذا التقرير لأغراض الفرز والتشخيص والتدخل المبكر بالروضة وغرف المصادر ومراكز التربية الخاصة.
          </div>

          {/* Official Signatures Box */}
          <div
            style={{
              marginTop: 30,
              paddingTop: 16,
              borderTop: '1px solid #cbd5e1',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              textAlign: 'center',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 35 }}>معلمة الروضة / الفاحص:</div>
              <div style={{ borderTop: '1px dashed #94a3b8', width: '80%', margin: '0 auto', paddingTop: 4 }}>
                {assessment.raterName || assessment.examinerName || '....................'}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 35 }}>أخصائي التربية الخاصة / التدخل المبكر:</div>
              <div style={{ borderTop: '1px dashed #94a3b8', width: '80%', margin: '0 auto', paddingTop: 4 }}>
                {assessment.examinerName || '....................'}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 35 }}>مدير الروضة / المركز:</div>
              <div style={{ borderTop: '1px dashed #94a3b8', width: '80%', margin: '0 auto', paddingTop: 4 }}>
                الختم والاعتماد الرسمي
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
