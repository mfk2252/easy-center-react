import { useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { printItem } from '../../utils/printUtils';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import {
  SPEECH_ORAL_MOTOR_ITEMS,
  FEEDING_SWALLOWING_ITEMS,
  SPEECH_PHONETIC_ITEMS,
  PHONOLOGICAL_PROCESSES_ITEMS,
  STUTTERING_FLUENCY_ITEMS,
  RESONANCE_NASALITY_ITEMS,
  CAPEV_VOICE_ITEMS,
  PRAGMATIC_ITEMS,
  AAC_READINESS_ITEMS,
  calculateSpeechScreeningPsychometrics
} from '../../data/speechArticulationData';

export default function SpeechArticulationReportModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}) {
  const { center, toast } = useApp();
  const printRef = useRef(null);

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateSpeechScreeningPsychometrics(assessment.results || assessment.scores || {});
  }, [assessment]);

  if (!isOpen || !assessment || !psychometrics) return null;

  // Custom helper to retrieve status label and score for select items
  function getItemDetail(itemsList, prefix, id, fallbackLabel = 'غير مقيم') {
    const val = assessment.results[`${prefix}_${id}`];
    const it = itemsList.find(i => i.id === id);
    if (!it) return { label: fallbackLabel, score: '—' };
    const opt = it.options.find(o => o.value === val);
    return {
      label: opt ? opt.label : fallbackLabel,
      score: val !== undefined && val !== null ? `${val} درجات` : '—'
    };
  }

  // Generate Print Layout (HTML format for printItem)
  function handlePrint() {
    // 1. Oral Motor Exam rows
    const omeRows = SPEECH_ORAL_MOTOR_ITEMS.map(it => {
      const detail = getItemDetail(SPEECH_ORAL_MOTOR_ITEMS, 'oral', it.id);
      return `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;font-size:0.85rem;">${it.name}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;font-size:0.8rem;color:#475569;">${it.description}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:bold;color:#0e7490;font-size:0.85rem;">${detail.label} (${detail.score})</td>
        </tr>
      `;
    }).join('');

    // 2. Feeding rows
    const feedingRows = FEEDING_SWALLOWING_ITEMS.map(it => {
      const detail = getItemDetail(FEEDING_SWALLOWING_ITEMS, 'feeding', it.id);
      return `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;font-size:0.85rem;">${it.name}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;font-size:0.8rem;color:#475569;">${it.description}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:bold;color:#059669;font-size:0.85rem;">${detail.label} (${detail.score})</td>
        </tr>
      `;
    }).join('');

    // 3. Phonetic letter errors rows
    const errorRows = psychometrics.errorDetails.map((err, idx) => `
      <tr>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-size:0.8rem;">${idx + 1}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:bold;color:#0369a1;font-size:0.85rem;">${err.letter} (${err.name})</td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-size:0.8rem;">${err.position}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:bold;font-size:0.82rem;">${err.word}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;color:#b91c1c;font-weight:bold;font-size:0.82rem;">${err.errorType}</td>
      </tr>
    `).join('');

    // 4. Phonological processes rows
    const procRows = PHONOLOGICAL_PROCESSES_ITEMS.map(it => {
      const detail = getItemDetail(PHONOLOGICAL_PROCESSES_ITEMS, 'phone_proc', it.id, 'سليم/طبيعي');
      return `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;font-size:0.85rem;">${it.name}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;font-size:0.8rem;color:#475569;">${it.description}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:bold;color:#6d28d9;font-size:0.82rem;">${detail.label}</td>
        </tr>
      `;
    }).join('');

    // 5. Stuttering rows
    const fluencyRows = STUTTERING_FLUENCY_ITEMS.map(it => {
      const detail = getItemDetail(STUTTERING_FLUENCY_ITEMS, 'fluency', it.id);
      return `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;font-size:0.85rem;">${it.name}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;font-size:0.8rem;color:#475569;">${it.description}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:bold;color:#0891b2;font-size:0.82rem;">${detail.label}</td>
        </tr>
      `;
    }).join('');

    // 6. Resonance rows
    const resonanceRows = RESONANCE_NASALITY_ITEMS.map(it => {
      const detail = getItemDetail(RESONANCE_NASALITY_ITEMS, 'resonance', it.id);
      return `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;font-size:0.85rem;">${it.name}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;font-size:0.8rem;color:#475569;">${it.description}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:bold;color:#0284c7;font-size:0.82rem;">${detail.label}</td>
        </tr>
      `;
    }).join('');

    // 7. Voice rows
    const voiceRows = CAPEV_VOICE_ITEMS.map(it => {
      const detail = getItemDetail(CAPEV_VOICE_ITEMS, 'voice', it.id);
      return `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;font-size:0.85rem;">${it.name}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;font-size:0.8rem;color:#475569;">${it.description}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:bold;color:#7c3aed;font-size:0.82rem;">${detail.label}</td>
        </tr>
      `;
    }).join('');

    // 8. Pragmatic rows
    const pragmaticRows = PRAGMATIC_ITEMS.map(it => {
      const detail = getItemDetail(PRAGMATIC_ITEMS, 'pragmatic', it.id);
      return `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;font-size:0.85rem;">${it.name}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;font-size:0.8rem;color:#475569;">${it.description}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:bold;color:#be185d;font-size:0.82rem;">${detail.label}</td>
        </tr>
      `;
    }).join('');

    // 9. AAC rows
    const aacRows = AAC_READINESS_ITEMS.map(it => {
      const detail = getItemDetail(AAC_READINESS_ITEMS, 'aac', it.id);
      return `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;font-size:0.85rem;">${it.name}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;font-size:0.8rem;color:#475569;">${it.description}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:bold;color:#c2410c;font-size:0.82rem;">${detail.label}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;color:#1e293b;padding:24px;line-height:1.5;">
        
        <!-- Header banner -->
        <div style="text-align:center;margin-bottom:25px;border-bottom:4px solid #0e7490;padding-bottom:14px;">
          <h1 style="color:#0e7490;font-size:1.6rem;margin:0 0 6px 0;font-weight:800;">🗣️ سجل التقييم الإكلينيكي الشامل للنطق واللغة والبلع وعضلات الفم</h1>
          <p style="margin:0;font-size:0.9rem;color:#4b5563;font-weight:700;">تقرير تشخيصي متكامل للأهداف السلوكية والخطة الفردية (IEP)</p>
        </div>

        <!-- Student demographics table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;font-size:0.85rem;">
          <tr>
            <td style="padding:10px;border:1px solid #cbd5e1;width:33%;"><b>اسم الطالب:</b> ${assessment.studentName || '—'}</td>
            <td style="padding:10px;border:1px solid #cbd5e1;width:33%;"><b>العمر الزمني:</b> ${assessment.age || '—'}</td>
            <td style="padding:10px;border:1px solid #cbd5e1;width:33%;"><b>تاريخ الميلاد:</b> ${assessment.dob || '—'}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #cbd5e1;"><b>التشخيص النمائي:</b> ${assessment.diagnosis || '—'}</td>
            <td style="padding:10px;border:1px solid #cbd5e1;"><b>تاريخ التقييم:</b> ${assessment.date}</td>
            <td style="padding:10px;border:1px solid #cbd5e1;"><b>الأخصائي المعالج:</b> ${assessment.specialistName || '—'}</td>
          </tr>
        </table>

        <!-- Summary Clinical metrics box -->
        <div style="background:rgba(14, 116, 144, 0.05);border:2px solid #0e7490;border-radius:10px;padding:16px;margin-bottom:24px;display:grid;grid-template-columns:repeat(3, 1fr);gap:15px;text-align:center;">
          <div style="border-left:1px solid #0e7490;">
            <span style="font-size:0.8rem;color:#0e7490;display:block;font-weight:700;">معدل كفاءة المهارات الكلي</span>
            <span style="font-size:1.5rem;font-weight:800;color:#0e7490;">${psychometrics.overallAvgPercentage}%</span>
          </div>
          <div style="border-left:1px solid #0e7490;">
            <span style="font-size:0.8rem;color:#0e7490;display:block;font-weight:700;">المستوى التشخيصي العام</span>
            <span style="font-size:1.1rem;font-weight:800;color:${psychometrics.overallColor};">${psychometrics.overallLevel}</span>
          </div>
          <div>
            <span style="font-size:0.8rem;color:#0e7490;display:block;font-weight:700;">دقة النطق الفونيمي</span>
            <span style="font-size:1.2rem;font-weight:800;color:${psychometrics.severityColor};">${psychometrics.accuracyRate}%</span>
          </div>
        </div>

        <!-- 1. OME Section -->
        <h3 style="color:#0e7490;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">🦷 1. آلية الفم وأعضاء الكلام (Oral Mechanism Exam)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.8rem;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;width:150px;">العضو النطقي</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;">وصف الفحص الإكلينيكي</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:center;width:220px;">النتيجة والدرجة</th>
            </tr>
          </thead>
          <tbody>
            ${omeRows}
          </tbody>
        </table>

        <!-- 2. Feeding & Swallowing Section -->
        <h3 style="color:#059669;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">🍲 2. بلع ومضغ الأغذية (Pediatric Feeding & Swallowing)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.8rem;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;width:150px;">المهمة الغذائية</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;">طبيعة الملاحظة السريرية</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:center;width:220px;">التقييم السريري</th>
            </tr>
          </thead>
          <tbody>
            ${feedingRows}
          </tbody>
        </table>

        <!-- 3. Phonetic Articulation Errors Section -->
        <h3 style="color:#0284c7;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">🗣️ 3. الأخطاء ومخارج الأصوات الفونيمية</h3>
        ${psychometrics.errorDetails.length > 0 ? `
          <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.8rem;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;width:50px;">#</th>
                <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;width:150px;">الصوت اللفظي</th>
                <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;">موضع الكلمة</th>
                <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;width:180px;">الكلمة الاختبارية</th>
                <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;width:180px;">نوع ومظهر الخطأ</th>
              </tr>
            </thead>
            <tbody>
              ${errorRows}
            </tbody>
          </table>
        ` : `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;color:#16a34a;text-align:center;font-weight:bold;margin-bottom:18px;font-size:0.85rem;">
            ✓ نطق سليم وطبيعي لجميع مخارج الحروف والكلمات الاختبارية دون رصد عيوب نطق.
          </div>
        `}

        <!-- 4. Phonological Processes -->
        <h3 style="color:#6d28d9;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">📈 4. تحليل وتبسيط العمليات الفونولوجية</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.8rem;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;width:180px;">العملية الفونولوجية</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;">طبيعة التبسيط الصوتي</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:center;width:200px;">التقييم السريري</th>
            </tr>
          </thead>
          <tbody>
            ${procRows}
          </tbody>
        </table>

        <!-- 5. Fluency / Stuttering -->
        <h3 style="color:#0891b2;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">📈 5. الطلاقة وسلوكيات التخلص (Fluency Checklist)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.8rem;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;width:180px;">سلوك التلعثم</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;">طبيعة السلوك والمظهر</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:center;width:200px;">التقييم السريري</th>
            </tr>
          </thead>
          <tbody>
            ${fluencyRows}
          </tbody>
        </table>

        <!-- 6. Resonance & Nasality -->
        <h3 style="color:#0284c7;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">🌬️ 6. الرنين الصوتي والخنف (Resonance Screening)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.8rem;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;width:180px;">الرنين الصوتي</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;">الفحص والضغط الهوائي</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:center;width:200px;">التقييم السريري</th>
            </tr>
          </thead>
          <tbody>
            ${resonanceRows}
          </tbody>
        </table>

        <!-- 7. Voice (CAPE-V Adapted) -->
        <h3 style="color:#7c3aed;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">🎙️ 7. جودة الصوت والنبرة الإدراكية (CAPE-V Adapted)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.8rem;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;width:180px;">البعد الصوتي</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;">مؤشرات وعلو ونبرة النطق</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:center;width:200px;">التقدير الإدراكي</th>
            </tr>
          </thead>
          <tbody>
            ${voiceRows}
          </tbody>
        </table>

        <!-- 8. Pragmatic Social Language -->
        <h3 style="color:#be185d;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">💬 8. الجانب البراجماتي والاستخدام الاجتماعي للغة</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.8rem;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;width:180px;">السلوك البراجماتي</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;">طبيعة التفاعل الحواري</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:center;width:200px;">التقييم الاجتماعي</th>
            </tr>
          </thead>
          <tbody>
            ${pragmaticRows}
          </tbody>
        </table>

        <!-- 9. AAC Readiness -->
        <h3 style="color:#c2410c;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">📱 9. جاهزية وسائل التواصل البديل والمعزز (AAC)</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.8rem;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;width:180px;">مؤشر الجاهزية</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:right;">المعايير المعرفية والحركية</th>
              <th style="border:1px solid #cbd5e1;padding:8px;text-align:center;width:200px;">مستوى القابلية والجهوزية</th>
            </tr>
          </thead>
          <tbody>
            ${aacRows}
          </tbody>
        </table>

        <!-- 10. Clinical summary and IEP Goals -->
        <h3 style="color:#0e7490;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">📌 10. التقرير النهائي والخطط السلوكية للـ IEP</h3>
        <p style="white-space:pre-wrap;background:#f8fafc;padding:15px;border:1px solid #cbd5e1;border-radius:10px;line-height:1.6;font-size:0.85rem;margin-bottom:18px;">${assessment.clinicalSummary || 'لا يوجد تقرير سردي مكتوب.'}</p>

        <h3 style="color:#0e7490;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:24px 0 12px 0;font-size:1.05rem;">💡 11. نقاط الضعف المسجلة والمصنفة للتدريب</h3>
        <p style="white-space:pre-wrap;background:#fffbeb;padding:15px;border:1px solid #fef3c7;border-radius:10px;line-height:1.6;font-size:0.85rem;margin-bottom:18px;">${assessment.recommendations || 'لا توجد نقاط ضعف مسجلة.'}</p>

        <!-- Signatures block -->
        <div style="margin-top:40px;display:flex;justify-content:space-between;border-top:1px dashed #94a3b8;padding-top:20px;">
          <div style="text-align:center;width:200px;">
            <b>توقيع الأخصائي الفاحص</b>
            <div style="margin-top:25px;border-bottom:1px solid #cbd5e1;width:150px;margin-left:auto;margin-right:auto;"></div>
            <span style="font-size:0.8rem;color:#64748b;display:block;margin-top:4px;">${assessment.specialistName || 'الأخصائي المعالج'}</span>
          </div>
          <div style="text-align:center;width:200px;">
            <b>اعتماد إدارة المركز التربوي</b>
            <div style="margin-top:25px;border-bottom:1px solid #cbd5e1;width:150px;margin-left:auto;margin-right:auto;"></div>
            <span style="font-size:0.8rem;color:#64748b;display:block;margin-top:4px;">مستند رسمي معتمد مخرجاته للـ IEP</span>
          </div>
        </div>

      </div>
    `;

    printItem({ html: htmlContent }, 'speech_screening', center?.logo, center?.name);
    toast('🖨️ تم إرسال مستند التقييم الشامل للـ IEP وجهاز النطق لبرنامج الطباعة بنجاح', 'ok');
  }

  return (
    <div className="mbg">
      <div className="mb mb-xl">
        
        {/* Modal Header */}
        <div className="fhd" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)', color: '#fff' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              📄 ملف التشخيص والتقرير الشامل لأعضاء النطق والبلع والحروف
            </h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: '4px 0 0 0', fontWeight: 400 }}>
              مخرجات إكلينيكية رسمية معتمدة للطفل: {assessment.studentName}
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>إغلاق ✖</button>
        </div>

        {/* Modal Scrollable Workspace */}
        <div className="modal-body-scroll" ref={printRef} style={{ padding: '24px', flex: 1, overflowY: 'auto', background: 'var(--bg-app)', color: 'var(--text-main)' }}>
          
          {/* Patient Demographic Details */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>اسم الطالب:</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>{assessment.studentName}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>العمر الزمني:</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>{assessment.age || '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>التشخيص النمائي:</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>{assessment.diagnosis || '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>تاريخ الفحص:</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>{assessment.date}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>الأخصائي الفاحص:</span>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>{assessment.specialistName || '—'}</div>
            </div>
          </div>

          {/* Key Analytics Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', display: 'block', marginBottom: 4 }}>معدل كفاءة المهارات الكلي</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0e7490' }}>{psychometrics.overallAvgPercentage}%</div>
              <div style={{ width: '100%', background: 'var(--border-color)', height: 6, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${psychometrics.overallAvgPercentage}%`, background: psychometrics.overallColor, height: '100%' }}></div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', display: 'block', marginBottom: 2 }}>المستوى التشخيصي العام</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: psychometrics.overallColor }}>{psychometrics.overallLevel}</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', display: 'block', marginBottom: 2 }}>دقة النطق الفونيمي العربي</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: psychometrics.severityColor }}>{psychometrics.accuracyRate}% ({psychometrics.phoneticCorrect}/{psychometrics.phoneticTested} حرف سليم)</div>
            </div>
          </div>

          {/* Onscreen Report Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* OME & Swallowing */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '18px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0e7490', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                🦷 1. آلية عضلات الفم والبلع (OME & Feeding)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SPEECH_ORAL_MOTOR_ITEMS.map(it => {
                  const detail = getItemDetail(SPEECH_ORAL_MOTOR_ITEMS, 'oral', it.id);
                  return (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--g0)', borderRadius: 8, gap: 16 }}>
                      <div>
                        <strong style={{ fontSize: '0.86rem', display: 'block', color: 'var(--text-main)' }}>{it.name}</strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>{it.description}</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0e7490' }}>
                        {detail.label} ({detail.score})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phonetic Articulation Errors */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '18px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0369a1', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                🗣️ 2. عيوب الأصوات والحروف المرصودة ({psychometrics.errorDetails.length} مواضع عجز)
              </h3>
              {psychometrics.errorDetails.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '8px', textAlign: 'center', width: 40 }}>م</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>الحرف المستهدف</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>موضع الحرف</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>الكلمة الاختبارية</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>طبيعة الخلل المكتشف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {psychometrics.errorDetails.map((err, idx) => (
                        <tr key={err.key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-sub)' }}>{idx + 1}</td>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>{err.letter} ({err.name})</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>{err.position}</td>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{err.word}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#dc2626', fontWeight: 800 }}>{err.errorType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981', color: '#10b981', padding: '12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 800, textAlign: 'center' }}>
                  ✓ نطق سليم وطبيعي لجميع مخارج الحروف والأصوات المختبرة دون رصد عجز.
                </div>
              )}
            </div>

            {/* Other protocols quick summaries */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '18px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 12px 0', color: '#6d28d9', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                🎵 3. الطلاقة وسلوكيات التخلص والعمليات الفونولوجية
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                <div style={{ padding: '10px 14px', background: 'var(--g0)', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>درجة طلاقة الكلام:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0891b2', marginTop: 2 }}>{psychometrics.fluencyPercentage}% (كفاءة ممتازة)</div>
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--g0)', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>التبسيط الفونولوجي:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#6d28d9', marginTop: 2 }}>
                    {psychometrics.weaknesses.filter(w => w.domain === 'العمليات الفونولوجية').length} عمليات نشطة مرصودة
                  </div>
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--g0)', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>الاستخدام الاجتماعي والبراجماتي:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#be185d', marginTop: 2 }}>{psychometrics.pragmaticPercentage}% (مستوى {psychometrics.pragmaticPercentage > 85 ? 'طبيعي سليم' : 'يحتاج تفعيل'})</div>
                </div>
              </div>
            </div>

            {/* Clinical summary and narrative */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '18px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0e7490', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                📌 التقرير التشخيصي النهائي (Diagnostic Narrative)
              </h3>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.86rem', lineHeight: 1.6, margin: 0, color: 'var(--text-main)', background: 'var(--g0)', padding: '14px', borderRadius: 8, fontFamily: 'monospace' }}>
                {assessment.clinicalSummary || 'لا توجد خلاصة تشخيصية مسجلة.'}
              </p>
            </div>

            {/* Recommendations */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '18px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0e7490', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                💡 التوصيات وعلاقة الأهداف بالخطة الفردية (IEP Goals)
              </h3>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.86rem', lineHeight: 1.6, margin: 0, color: 'var(--text-main)', background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.12)', padding: '14px', borderRadius: 8 }}>
                {assessment.recommendations || 'لا توجد توصيات مسجلة.'}
              </p>
            </div>

          </div>

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="fa" style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g0)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {assessment.parentPhone && (
              <button
                type="button"
                className="btn btn-s"
                style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => {
                  sendReportToWhatsApp({
                    parentPhone: assessment.parentPhone,
                    parentName: assessment.parentName,
                    studentName: assessment.studentName,
                    reportTitle: `تقرير تقييم النطق وعضلات الفم والبلع الشامل`,
                    reportType: 'تقييم النطق واللغة والبلع المتكامل',
                    date: assessment.date,
                    summary: `المستوى الإجمالي: ${psychometrics.overallLevel} — معدل الكفاءة: ${psychometrics.overallAvgPercentage}% — دقة النطق: ${psychometrics.accuracyRate}%`,
                    recommendations: assessment.recommendations,
                    specialistName: assessment.specialistName,
                    centerName: center?.name,
                  });
                }}
              >
                💬 إرسال التقرير الشامل عبر واتساب
              </button>
            )}
            <button
              type="button"
              className="btn"
              style={{ fontWeight: 800, background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, border: 'none' }}
              onClick={handlePrint}
            >
              🖨️ طباعة التقرير التشخيصي الرسمي
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-g"
              style={{ fontWeight: 800 }}
              onClick={() => {
                onClose();
                onEdit(assessment);
              }}
            >
              ✏️ تعديل التقييم
            </button>
            <button type="button" className="btn btn-p" onClick={onClose} style={{ fontWeight: 800 }}>إغلاق</button>
          </div>
        </div>

      </div>
    </div>
  );
}
