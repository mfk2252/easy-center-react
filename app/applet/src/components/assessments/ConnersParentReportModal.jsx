import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CONNERS_PARENT_ITEMS,
  CONNERS_PARENT_DOMAINS,
  calculateConnersParentScore,
} from '../../data/connersParentData';
import { printItem } from '../../utils/printUtils';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import IepBridgeModal from '../../pages/ProgramsReports/IepBridgeModal';

export default function ConnersParentReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center } = useApp();
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateConnersParentScore(assessment.results || assessment.scores || {});
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  const adhdIndexSub = psychometrics.subscales.find(s => s.id === 'H');
  const dsmTotalSub = psychometrics.subscales.find(s => s.id === 'N');
  const dsmInattentiveSub = psychometrics.subscales.find(s => s.id === 'L');
  const dsmHyperactiveSub = psychometrics.subscales.find(s => s.id === 'M');
  const cgiRestlessSub = psychometrics.subscales.find(s => s.id === 'I');
  const cgiEmotionalSub = psychometrics.subscales.find(s => s.id === 'J');

  function handlePrint() {
    const subscaleRows = psychometrics.subscales.map(s => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 7px 10px; font-weight: bold; color: ${s.color};">${s.id}</td>
        <td style="padding: 7px 10px; font-weight: 600;">${s.name}</td>
        <td style="padding: 7px 10px; text-align: center; color: #64748b;">${s.englishName || ''}</td>
        <td style="padding: 7px 10px; text-align: center; font-weight: bold;">${s.raw} / ${s.maxRaw}</td>
        <td style="padding: 7px 10px; text-align: center; font-weight: 800; color: #1e40af; font-size: 1.05em;">${s.tScore}</td>
        <td style="padding: 7px 10px; text-align: center;">
          <span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; background: ${s.severityColor}20; color: ${s.severityColor};">
            ${s.level}
          </span>
        </td>
      </tr>
    `).join('');

    const itemsRows = CONNERS_PARENT_ITEMS.map((it) => {
      const val = assessment.scores?.[it.id] ?? assessment.results?.[it.id];
      const valLabels = ['0 - أبداً/نادراً', '1 - أحياناً', '2 - غالباً', '3 - دائماً'];
      const textVal = val !== undefined && val !== null ? valLabels[val] || val : '—';
      const isHigh = val === 2 || val === 3;
      return `
        <tr style="border-bottom: 1px solid #f1f5f9; background: ${isHigh ? '#fffbeb' : '#ffffff'};">
          <td style="padding: 5px 8px; text-align: center; font-weight: bold; color: #64748b;">${it.num}</td>
          <td style="padding: 5px 8px; font-size: 0.9em; color: #1e293b;">${it.text}</td>
          <td style="padding: 5px 8px; text-align: center; font-weight: 700; font-size: 0.88em; color: ${isHigh ? '#ea580c' : '#475569'};">
            ${textVal}
          </td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="direction: rtl; text-align: right; font-family: 'Tajawal', sans-serif; color: #1e293b; padding: 10px;">
        <div style="border-bottom: 3px solid #ea580c; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="color: #ea580c; font-size: 21px; margin: 0 0 4px 0;">⚡ تقرير مقياس كونرز لفرط الحركة وتشتت الانتباه — نسخة الوالدين المطولة</h1>
            <p style="margin: 0; font-size: 13px; color: #64748b;">Conners Parent Rating Scale - Revised (CPRS-R L) · 80 بنداً سيكومترياً معتمداً</p>
          </div>
          <div style="text-align: left; font-size: 12px; color: #475569;">
            <div><b>التاريخ:</b> ${assessment.date || '—'}</div>
            <div><b>الرقم المرجعي:</b> ${assessment.id ? assessment.id.slice(0, 8) : 'CON-P'}</div>
          </div>
        </div>

        <table style="width: 100%; margin-bottom: 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px; font-size: 13px;">
          <tr>
            <td style="padding: 5px 10px;"><b>اسم المفحوص:</b> ${assessment.studentName || '—'}</td>
            <td style="padding: 5px 10px;"><b>العمر:</b> ${assessment.age || '—'} سنة</td>
            <td style="padding: 5px 10px;"><b>الجنس:</b> ${assessment.gender === 'female' ? 'أنثى' : assessment.gender === 'male' ? 'ذكر' : '—'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 10px;"><b>الأخصائي الفاحص:</b> ${assessment.examinerName || assessment.specialistName || '—'}</td>
            <td style="padding: 5px 10px;"><b>الدرجة الخام الكلية:</b> ${psychometrics.totalRawScore} / 240</td>
            <td style="padding: 5px 10px;"><b>الفقرات المكتملة:</b> ${psychometrics.answeredCount} / 80</td>
          </tr>
        </table>

        <div style="background: #fff; border: 1.5px solid #fdba74; border-radius: 8px; padding: 14px; margin-bottom: 18px;">
          <h3 style="margin: 0 0 10px 0; color: #c2410c; font-size: 15px;">📊 المؤشرات التشخيصية الإكلينيكية الرئيسية</h3>
          <div style="display: flex; justify-content: space-around; text-align: center; font-size: 13px; flex-wrap: wrap; gap: 8px;">
            <div style="background: #fff7ed; padding: 8px 14px; border-radius: 6px; border: 1px solid #fed7aa;">
              <div style="color: #64748b; font-size: 11px;">مؤشر نقص الانتباه وفرط الحركة (H)</div>
              <div style="font-size: 18px; font-weight: 900; color: #ea580c;">T = ${adhdIndexSub?.tScore || '—'}</div>
              <div style="font-size: 11px; font-weight: bold; color: ${adhdIndexSub?.severityColor || '#ea580c'};">${adhdIndexSub?.level || '—'}</div>
            </div>
            <div style="background: #f8fafc; padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1;">
              <div style="color: #64748b; font-size: 11px;">نقص الانتباه (DSM-IV)</div>
              <div style="font-size: 18px; font-weight: 900; color: #0284c7;">T = ${dsmInattentiveSub?.tScore || '—'}</div>
              <div style="font-size: 11px; font-weight: bold;">${dsmInattentiveSub?.level || '—'}</div>
            </div>
            <div style="background: #f8fafc; padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1;">
              <div style="color: #64748b; font-size: 11px;">فرط الحركة والاندفاعية (DSM-IV)</div>
              <div style="font-size: 18px; font-weight: 900; color: #d97706;">T = ${dsmHyperactiveSub?.tScore || '—'}</div>
              <div style="font-size: 11px; font-weight: bold;">${dsmHyperactiveSub?.level || '—'}</div>
            </div>
            <div style="background: #f8fafc; padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd5e1;">
              <div style="color: #64748b; font-size: 11px;">المؤشر الإجمالي الكلي (DSM-IV)</div>
              <div style="font-size: 18px; font-weight: 900; color: #4338ca;">T = ${dsmTotalSub?.tScore || '—'}</div>
              <div style="font-size: 11px; font-weight: bold;">${dsmTotalSub?.level || '—'}</div>
            </div>
          </div>
        </div>

        <h3 style="color: #ea580c; font-size: 15px; margin: 16px 0 8px 0;">📈 تحليل الأبعاد الـ 14 والدرجات المعيارية التائية (T-Scores)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
          <thead>
            <tr style="background: #ffedd5; color: #9a3412;">
              <th style="padding: 7px 10px; text-align: right;">الرمز</th>
              <th style="padding: 7px 10px; text-align: right;">البُعد التشخيصي</th>
              <th style="padding: 7px 10px; text-align: center;">المسمى بالإنجليزية</th>
              <th style="padding: 7px 10px; text-align: center;">الدرجة الخام</th>
              <th style="padding: 7px 10px; text-align: center;">الدرجة التائية (T)</th>
              <th style="padding: 7px 10px; text-align: center;">التصنيف الإكلينيكي</th>
            </tr>
          </thead>
          <tbody>
            ${subscaleRows}
          </tbody>
        </table>

        ${assessment.clinicalSummary ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 6px 0; color: #334155; font-size: 13px;">📝 الاستنتاج السريري والملاحظات:</h4>
            <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6;">${assessment.clinicalSummary}</p>
          </div>
        ` : ''}

        <h3 style="color: #ea580c; font-size: 14px; margin: 18px 0 8px 0;">📋 استجابات بنود المقياس الـ 80 بالتفصيل</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f1f5f9; color: #334155;">
              <th style="padding: 6px 8px; width: 40px; text-align: center;">#</th>
              <th style="padding: 6px 8px; text-align: right;">نص الفقرة السلوكية</th>
              <th style="padding: 6px 8px; width: 140px; text-align: center;">التقدير</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="margin-top: 30px; display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 16px; font-size: 12px;">
          <div style="text-align: center; width: 200px;">
            <div><b>الأخصائي النفسي / المشخص</b></div>
            <div style="margin-top: 35px; color: #64748b;">${assessment.examinerName || '.......................'}</div>
          </div>
          <div style="text-align: center; width: 200px;">
            <div><b>اعتماد مدير المركز</b></div>
            <div style="margin-top: 35px; color: #64748b;">${center?.directorName || '.......................'}</div>
          </div>
        </div>
      </div>
    `;

    printItem({
      title: `تقرير مقياس كونرز - ${assessment.studentName || 'طالب'}`,
      html,
    });
  }

  function handleShareWhatsApp() {
    const summary = `
📊 *تقرير مقياس كونرز لفرط الحركة وتشتت الانتباه (CPRS-R L)*
👦 *المفحوص:* ${assessment.studentName || '—'}
📅 *التاريخ:* ${assessment.date || '—'}
⚡ *مؤشر ADHD (T-Score):* ${adhdIndexSub?.tScore || '—'} (${adhdIndexSub?.level || '—'})
🧠 *نقص الانتباه DSM-IV:* T = ${dsmInattentiveSub?.tScore || '—'}
🏃 *فرط النشاط DSM-IV:* T = ${dsmHyperactiveSub?.tScore || '—'}
📈 *المؤشر الكلي DSM-IV:* T = ${dsmTotalSub?.tScore || '—'} (${dsmTotalSub?.level || '—'})
📌 *الدرجة الخام الكلية:* ${psychometrics.totalRawScore} من 240
    `.trim();

    sendReportToWhatsApp({
      title: `تقرير مقياس كونرز CPRS-R L - ${assessment.studentName}`,
      text: summary,
      recipientPhone: assessment.parentPhone || '',
    });
  }

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div className="mb mb-xl" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div
          className="modal-header-custom fhd"
          style={{
            background: 'linear-gradient(135deg, #ea580c, #c2410c)',
            color: '#ffffff',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#fff' }}>
                تقرير مقياس كونرز لفرط الحركة وتشتت الانتباه (CPRS-R L)
              </h3>
              <div style={{ fontSize: '.76rem', color: '#ffedd5', fontWeight: 500 }}>
                نسخة الوالدين المطولة المقننة (80 فقرة) · حساب الدرجات المعيارية T ومؤشرات DSM-IV
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--bg-card)' }}>
          {/* Top Info Bar */}
          <div
            style={{
              background: '#fff7ed',
              border: '1.5px solid #fed7aa',
              borderRadius: 12,
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#9a3412' }}>
                {assessment.studentName || 'طالب غير محدد'}
              </div>
              <div style={{ fontSize: '.8rem', color: '#c2410c' }}>
                تاريخ التقييم: {assessment.date || '—'} · الفاحص: {assessment.examinerName || '—'} · العمر: {assessment.age || '—'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setBridgeOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #4338ca, #2563eb)',
                  color: '#fff',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span>🎓</span>
                <span>اشتقاق خطة فردية (IEP)</span>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-g"
                onClick={() => {
                  onClose();
                  if (onEdit) onEdit(assessment);
                }}
              >
                ✏️ تعديل
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleShareWhatsApp}
                style={{ background: '#16a34a', color: '#fff', fontWeight: 700 }}
              >
                💬 واتساب
              </button>
              <button
                type="button"
                className="btn btn-sm btn-p"
                onClick={handlePrint}
                style={{ fontWeight: 800 }}
              >
                🖨️ طباعة التقرير
              </button>
            </div>
          </div>

          {/* Key Clinical Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 20,
            }}
          >
            {/* ADHD Index */}
            <div
              style={{
                background: '#fff7ed',
                border: '1.5px solid #fed7aa',
                borderRadius: 12,
                padding: 14,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '.76rem', color: '#9a3412', fontWeight: 700 }}>
                مؤشر نقص الانتباه وفرط الحركة (H)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', margin: '4px 0' }}>
                T = {adhdIndexSub?.tScore || '—'}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 6,
                  fontSize: '.76rem',
                  fontWeight: 800,
                  background: `${adhdIndexSub?.severityColor || '#ea580c'}20`,
                  color: adhdIndexSub?.severityColor || '#ea580c',
                }}
              >
                {adhdIndexSub?.level || '—'}
              </div>
            </div>

            {/* DSM Inattentive */}
            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 14,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                نقص الانتباه (DSM-IV)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', margin: '4px 0' }}>
                T = {dsmInattentiveSub?.tScore || '—'}
              </div>
              <div style={{ fontSize: '.76rem', fontWeight: 700, color: dsmInattentiveSub?.severityColor || '#0284c7' }}>
                {dsmInattentiveSub?.level || '—'}
              </div>
            </div>

            {/* DSM Hyperactive */}
            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 14,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                فرط الحركة والاندفاعية (DSM-IV)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d97706', margin: '4px 0' }}>
                T = {dsmHyperactiveSub?.tScore || '—'}
              </div>
              <div style={{ fontSize: '.76rem', fontWeight: 700, color: dsmHyperactiveSub?.severityColor || '#d97706' }}>
                {dsmHyperactiveSub?.level || '—'}
              </div>
            </div>

            {/* DSM Total */}
            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 14,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                المؤشر الإجمالي الكلي (DSM-IV)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4338ca', margin: '4px 0' }}>
                T = {dsmTotalSub?.tScore || '—'}
              </div>
              <div style={{ fontSize: '.76rem', fontWeight: 700, color: dsmTotalSub?.severityColor || '#4338ca' }}>
                {dsmTotalSub?.level || '—'}
              </div>
            </div>
          </div>

          {/* Subscales Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '12px 16px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📈 الدرجات المعيارية التائية (T-Scores) لجميع الأبعاد الـ 14
              </h4>
              <span style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>
                درجة T أعلى من 65 تدل على دلالة إكلينيكية مرتفعة
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-sub)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'right', width: 40 }}>الرمز</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>البُعد التشخيصي</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>الدرجة الخام</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>الدرجة التائية (T)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>مؤشر الشدة</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>التصنيف</th>
                  </tr>
                </thead>
                <tbody>
                  {psychometrics.subscales.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 800, color: sub.color }}>{sub.id}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700 }}>
                        <div>{sub.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>{sub.englishName}</div>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>
                        {sub.raw} / {sub.maxRaw}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 900, fontSize: '.95rem', color: sub.color }}>
                        {sub.tScore}
                      </td>
                      <td style={{ padding: '8px 12px', width: 140 }}>
                        <div style={{ background: 'var(--g1)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, (sub.tScore / 90) * 100)}%`, background: sub.color }} />
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '.75rem',
                            fontWeight: 800,
                            background: `${sub.severityColor}15`,
                            color: sub.severityColor,
                          }}
                        >
                          {sub.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Notes */}
          {assessment.clinicalSummary && (
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📝 الاستنتاج السريري والتوصيات:
              </h4>
              <p style={{ margin: 0, fontSize: '.84rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                {assessment.clinicalSummary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* IEP Bridge Modal Integration */}
      {bridgeOpen && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          assessment={assessment}
          scaleId="conners_parent"
          scaleItems={CONNERS_PARENT_ITEMS}
          scaleResults={assessment.results || assessment.scores || {}}
          studentName={assessment.studentName}
          studentId={assessment.stuId}
        />
      )}
    </div>
  );
}
