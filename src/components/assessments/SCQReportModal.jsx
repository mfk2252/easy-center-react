import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  SCQ_ITEMS,
  SCQ_DOMAINS,
  SCQ_COPYRIGHT_INFO,
  calculateSCQPsychometrics,
} from '../../data/scqData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';

export default function SCQReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'domains' | 'items'

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    const scores = assessment.results || assessment.scores || {};
    return calculateSCQPsychometrics(scores);
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  const rawAnswers = assessment.results || assessment.scores || {};
  const isNonVerbal = psychometrics.isNonVerbal;

  function handlePrint() {
    const itemsHtml = SCQ_ITEMS.map(item => {
      const val = rawAnswers[item.id] !== undefined ? rawAnswers[item.id] : rawAnswers[String(item.id)];
      const isSkipped = isNonVerbal && item.requiresVerbal;
      let scoreText = '—';
      let isRisk = false;

      if (!isSkipped && val !== undefined) {
        if (item.isGatewayItem) {
          scoreText = val === 'yes' ? 'لفظي (يتحدث بجمل)' : 'غير لفظي';
        } else {
          const itemScore = val === 'yes' ? item.yesScore : item.noScore;
          scoreText = `${val === 'yes' ? 'نعم' : 'لا'} (${itemScore} د)`;
          isRisk = itemScore === 1;
        }
      } else if (isSkipped) {
        scoreText = 'مستثنى (غير لفظي)';
      }

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 6px 8px; text-align: center; font-weight: bold;">${item.number}</td>
          <td style="padding: 6px 8px;">
            <div style="font-weight: 600; color: #1e293b;">${item.textAr}</div>
            <div style="font-size: 10px; color: #64748b;">${item.domainName}</div>
          </td>
          <td style="padding: 6px 8px; text-align: center; font-weight: bold; color: ${isRisk ? '#b45309' : '#059669'};">
            ${scoreText}
          </td>
        </tr>
      `;
    }).join('');

    const domainHtml = SCQ_DOMAINS.map(d => {
      const dScore = psychometrics.domainScores[d.id] || { score: 0, max: d.maxScore };
      const pct = Math.round((dScore.score / (dScore.max || 1)) * 100);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
          <td style="padding: 8px 10px; font-weight: bold;">${d.name} (${d.nameEn})</td>
          <td style="padding: 8px 10px; text-align: center; font-weight: bold;">${dScore.score} من ${dScore.max}</td>
          <td style="padding: 8px 10px; text-align: center;">${pct}%</td>
          <td style="padding: 8px 10px; font-size: 11px; color: #475569;">${d.description}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="font-family: 'Tajawal', sans-serif; direction: rtl; color: #1e293b; padding: 20px; line-height: 1.5;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <h2 style="margin: 0; color: #047857; font-size: 18px; font-weight: 800;">${center?.name || 'مركز التربية الخاصة والتأهيل'}</h2>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">قسم التشخيص والتقييم النفسي والنمائي</p>
          </div>
          <div style="text-align: left;">
            <h3 style="margin: 0; color: #0f172a; font-size: 15px;">تقرير استبيان التواصل الاجتماعي (SCQ)</h3>
            <span style="font-size: 11px; background: #ecfdf5; color: #065f46; padding: 3px 8px; border-radius: 4px; border: 1px solid #a7f3d0;">
              خوارزمية DSM-5 المفتوحة
            </span>
          </div>
        </div>

        <!-- Student Meta -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px;">
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #e2e8f0;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding: 6px 10px; border: 1px solid #e2e8f0;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding: 6px 10px; border: 1px solid #e2e8f0;"><b>الجنس:</b> ${assessment.gender || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #e2e8f0;"><b>تاريخ الفحص:</b> ${assessment.date || '—'}</td>
            <td style="padding: 6px 10px; border: 1px solid #e2e8f0;"><b>نوع الاستمارة:</b> ${assessment.formType === 'current' ? 'الوضع الراهن (آخر 3 أشهر)' : 'مدى الحياة (التاريخ النمائي)'}</td>
            <td style="padding: 6px 10px; border: 1px solid #e2e8f0;"><b>الفاحص:</b> ${assessment.examinerName || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #e2e8f0;" colspan="2"><b>المجيب (المصدر):</b> ${assessment.raterName || 'ولي الأمر'} (${assessment.raterRelation || 'الأم/الأب'})</td>
            <td style="padding: 6px 10px; border: 1px solid #e2e8f0;"><b>القدرة اللفظية:</b> ${isNonVerbal ? 'غير لفظي (استثناء بنود 2-7)' : 'لفظي (تقييم شامل)'}</td>
          </tr>
        </table>

        <!-- Result Overview Box -->
        <div style="background: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 14px; margin-bottom: 16px; text-align: center;">
          <div style="font-size: 13px; color: #065f46; font-weight: bold;">الدرجة الكلية لاستبيان SCQ</div>
          <div style="font-size: 28px; font-weight: 900; color: ${psychometrics.severityColor}; margin: 4px 0;">
            ${psychometrics.rawScore} / ${psychometrics.maxScore}
          </div>
          <div style="display: inline-block; padding: 4px 12px; border-radius: 12px; background: #fff; font-weight: 800; font-size: 13px; color: ${psychometrics.severityColor}; border: 1px solid #cbd5e1;">
            ${psychometrics.severityLabel}
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: #475569;">
            نقطة القطع السريرية المعتمدة للفرز: <b>15 نقطة فأكثر</b> | عتبة التوحد الشديد: <b>22 نقطة فأكثر</b>
          </div>
        </div>

        <!-- Domains Table -->
        <h4 style="margin: 12px 0 6px 0; font-size: 13px; color: #047857;">نتائج المجالات النمائية والتشخيصية (DSM-5 Algorithm):</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background: #e2e8f0; font-size: 11px; text-align: right;">
              <th style="padding: 6px 10px;">المجال</th>
              <th style="padding: 6px 10px; text-align: center;">الدرجة</th>
              <th style="padding: 6px 10px; text-align: center;">النسبة</th>
              <th style="padding: 6px 10px;">الوصف الإكلينيكي</th>
            </tr>
          </thead>
          <tbody>
            ${domainHtml}
          </tbody>
        </table>

        <!-- Interpretation & Recommendations -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #1e293b;">الانطباع الإكلينيكي:</h4>
          <p style="margin: 0 0 10px 0; font-size: 11px; line-height: 1.6; color: #334155;">
            ${assessment.interpretationAr || psychometrics.interpretationAr}
          </p>
          <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #1e293b;">التوصيات الإجرائية المترتبة:</h4>
          <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #334155; white-space: pre-line;">
            ${assessment.recommendations || psychometrics.clinicalRecommendation}
          </p>
        </div>

        <!-- Items Table -->
        <h4 style="margin: 12px 0 6px 0; font-size: 13px; color: #047857;">تفصيل بنود الاستبيان الأربعين (SCQ Items):</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background: #f1f5f9; font-size: 11px;">
              <th style="padding: 6px 8px; width: 35px; text-align: center;">#</th>
              <th style="padding: 6px 8px; text-align: right;">نص البند والمجال</th>
              <th style="padding: 6px 8px; width: 140px; text-align: center;">الاستجابة والدرجة</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 14px; border-top: 1px solid #cbd5e1; font-size: 12px;">
          <div style="text-align: center; width: 200px;">
            <div><b>الأخصائي الفاحص</b></div>
            <div style="margin-top: 35px; border-bottom: 1px solid #94a3b8;">${assessment.examinerName || '—'}</div>
          </div>
          <div style="text-align: center; width: 200px;">
            <div><b>المشرف الفني / الإكلينيكي</b></div>
            <div style="margin-top: 35px; border-bottom: 1px solid #94a3b8;">التوقيع والاعتماد</div>
          </div>
          <div style="text-align: center; width: 200px;">
            <div><b>ختم المركز المعتمد</b></div>
            <div style="margin-top: 35px; border-bottom: 1px solid #94a3b8;">${center?.name || 'المركز'}</div>
          </div>
        </div>
      </div>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير SCQ - ${assessment.studentName || 'المفحوص'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 10mm; background: #fff; }
              @page { size: A4; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      win.document.close();
    }
  }

  function handleShareWhatsApp() {
    const text = `*تقرير استبيان التواصل الاجتماعي (SCQ)*
المفحوص: ${assessment.studentName || '—'}
العمر: ${assessment.age || '—'}
التاريخ: ${assessment.date || '—'}
الدرجة الإجمالية: ${psychometrics.rawScore} من ${psychometrics.maxScore}
التصنيف الإكلينيكي: ${psychometrics.severityLabel}
نوع الاستمارة: ${assessment.formType === 'current' ? 'الوضع الراهن' : 'مدى الحياة'}
نقطة القطع للفرز: 15 فأكثر
المركز: ${center?.name || 'مركز التربية الخاصة والتأهيل'}`;
    sendReportToWhatsApp(text);
  }

  return (
    <>
      <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
        <div
          className="mb"
          style={{
            maxWidth: 'min(1280px, calc(100vw - 24px))',
            width: '100%',
            maxHeight: 'min(94vh, calc(100dvh - 20px))',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Header */}
          <div
            className="fhd modal-header-custom"
            style={{
              background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
              color: '#fff',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>📊</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#fff' }}>
                  تقرير استبيان التواصل الاجتماعي — SCQ
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#ecfdf5' }}>
                  {assessment.studentName || 'المفحوص'} | {assessment.formType === 'current' ? 'استمارة الوضع الراهن' : 'استمارة مدى الحياة'} | تاريخ: {assessment.date}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => {
                    onClose();
                    onEdit(assessment);
                  }}
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
                >
                  ✏️ تعديل الاستبيان
                </button>
              )}
              <button
                type="button"
                className="btn btn-xs"
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 20px',
              background: 'var(--g0)',
              borderBottom: '1px solid var(--border-color)',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              className={`btn btn-xs ${activeTab === 'summary' ? 'btn-p' : 'btn-g'}`}
              onClick={() => setActiveTab('summary')}
              style={activeTab === 'summary' ? { background: '#059669', borderColor: '#059669' } : {}}
            >
              ملخص التقرير ومؤشر الفرز
            </button>
            <button
              type="button"
              className={`btn btn-xs ${activeTab === 'domains' ? 'btn-p' : 'btn-g'}`}
              onClick={() => setActiveTab('domains')}
              style={activeTab === 'domains' ? { background: '#059669', borderColor: '#059669' } : {}}
            >
              تحليل المجالات النمائية
            </button>
            <button
              type="button"
              className={`btn btn-xs ${activeTab === 'items' ? 'btn-p' : 'btn-g'}`}
              onClick={() => setActiveTab('items')}
              style={activeTab === 'items' ? { background: '#059669', borderColor: '#059669' } : {}}
            >
              تفاصيل البنود الـ 40
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
            {activeTab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Visual Cutoff Card */}
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: `2px solid ${psychometrics.severityColor}`,
                    borderRadius: 'var(--r)',
                    padding: '18px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                    الدرجة الكلية لفرز استبيان SCQ
                  </span>

                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: psychometrics.severityColor, margin: '6px 0' }}>
                    {psychometrics.rawScore} <span style={{ fontSize: '1.2rem', color: 'var(--text-sub)' }}>/ {psychometrics.maxScore}</span>
                  </div>

                  <span
                    className={`bdg ${psychometrics.severityBadgeClass}`}
                    style={{ fontSize: '0.95rem', padding: '6px 14px', fontWeight: 800 }}
                  >
                    {psychometrics.severityLabel}
                  </span>

                  <div
                    style={{
                      marginTop: 14,
                      padding: '10px 14px',
                      background: 'var(--g0)',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      color: 'var(--text-main)',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 20,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      نقطة القطع الدولية للفرز (Cutoff): <strong>15 درجة فأكثر</strong>
                    </div>
                    <div>
                      عتبة الاشتباه المرتفع جداً: <strong>22 درجة فأكثر</strong>
                    </div>
                    <div>
                      الحالة اللغوية: <strong>{isNonVerbal ? 'غير لفظي (الحد الأقصى 33)' : 'لفظي (الحد الأقصى 39)'}</strong>
                    </div>
                  </div>
                </div>

                {/* Subdomains Visual Overview Cards */}
                <div className="fg c3">
                  {SCQ_DOMAINS.map(d => {
                    const dScore = psychometrics.domainScores[d.id] || { score: 0, max: d.maxScore };
                    const pct = Math.round((dScore.score / (dScore.max || 1)) * 100);
                    return (
                      <div
                        key={d.id}
                        style={{
                          background: 'var(--bg-card)',
                          border: `1.5px solid ${d.borderColor}`,
                          borderRadius: 'var(--r)',
                          padding: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <strong style={{ fontSize: '0.88rem', color: d.color }}>{d.name}</strong>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                            {dScore.score} / {dScore.max}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: 8, background: 'var(--g1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: d.color,
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>

                        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                          {d.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Clinical Interpretation Box */}
                <div
                  style={{
                    background: 'var(--g0)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 'var(--r)',
                    padding: '16px',
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#047857' }}>
                    💡 الانطباع الإكلينيكي وخوارزمية التشخيص:
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                    {assessment.interpretationAr || psychometrics.interpretationAr}
                  </p>

                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#047857' }}>
                    🎯 التوصيات الإجرائية المترتبة على الفرز:
                  </h4>
                  <div style={{ fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                    {assessment.recommendations || psychometrics.clinicalRecommendation}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'domains' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)' }}>
                  <thead>
                    <tr style={{ background: 'var(--g1)', fontSize: '0.82rem', textAlign: 'right' }}>
                      <th style={{ padding: '10px 12px' }}>المجال النمائي</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>الدرجة المرصودة</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>النسبة المئوية للقصور</th>
                      <th style={{ padding: '10px 12px' }}>الأهمية الإكلينيكية في معايير DSM-5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCQ_DOMAINS.map(d => {
                      const dScore = psychometrics.domainScores[d.id] || { score: 0, max: d.maxScore };
                      const pct = Math.round((dScore.score / (dScore.max || 1)) * 100);
                      return (
                        <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: d.color }}>
                            {d.name} <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{d.nameEn}</div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 900 }}>
                            {dScore.score} من {dScore.max}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span className={`bdg ${pct > 50 ? 'b-rd' : pct > 25 ? 'b-or' : 'b-gr'}`}>
                              {pct}%
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                            {d.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'items' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SCQ_ITEMS.map(item => {
                  const val = rawAnswers[item.id] !== undefined ? rawAnswers[item.id] : rawAnswers[String(item.id)];
                  const isSkipped = isNonVerbal && item.requiresVerbal;
                  let scoreBadge = null;

                  if (isSkipped) {
                    scoreBadge = <span className="bdg b-gr">مستثنى (غير لفظي)</span>;
                  } else if (val === undefined || val === null || val === '') {
                    scoreBadge = <span className="bdg">لم يُجب</span>;
                  } else if (item.isGatewayItem) {
                    scoreBadge = <span className="bdg b-bl">{val === 'yes' ? 'لفظي' : 'غير لفظي'}</span>;
                  } else {
                    const itemScore = val === 'yes' ? item.yesScore : item.noScore;
                    scoreBadge = (
                      <span className={`bdg ${itemScore === 1 ? 'b-or' : 'b-gr'}`}>
                        {val === 'yes' ? 'نعم' : 'لا'} ({itemScore === 1 ? '⚠️ +1 نقطة قصور' : '✓ 0 طبيعي'})
                      </span>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <span style={{ fontWeight: 800, width: 24, textAlign: 'center', color: 'var(--text-sub)' }}>
                          {item.number}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {item.textAr}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                            {item.domainName}
                          </div>
                        </div>
                      </div>

                      <div>{scoreBadge}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '12px 20px',
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-p"
                onClick={handlePrint}
                style={{ background: '#059669', color: '#fff', fontWeight: 800 }}
              >
                🖨️ طباعة التقرير الرسمي
              </button>
              <button
                type="button"
                className="btn btn-p"
                onClick={() => setBridgeOpen(true)}
                style={{ background: '#f59e0b', color: '#fff', fontWeight: 800 }}
              >
                🎯 اشتقاق الخطة الفردية (IEP)
              </button>
              <button
                type="button"
                className="btn btn-g"
                onClick={handleShareWhatsApp}
                title="مشاركة ملخص التقرير عبر واتساب"
              >
                💬 واتساب
              </button>
            </div>

            <button
              type="button"
              className="btn btn-g"
              onClick={onClose}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* IEP Bridge Modal Integration */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleItems={SCQ_ITEMS}
          scaleType="scq"
        />
      )}
    </>
  );
}
