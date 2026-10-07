import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { todayStr } from '../../utils/dateHelpers';
import {
  RAVEN_COPYRIGHT_INFO,
  RAVEN_VERSIONS,
  RAVEN_SETS_META,
  calculateRavenPsychometrics,
} from '../../data/ravenData';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';

export default function RavenReportModal({
  isOpen,
  onClose,
  assessmentData,
  assessment,
  onEdit,
  onOpenIepBridge,
}) {
  const targetData = assessmentData || assessment;
  const { currentUser, centerInfo } = useApp();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'sets' | 'iep'

  const psych = useMemo(() => {
    if (!targetData) return null;
    const scores = targetData.results || targetData.scores || {};
    const rawOverrides = targetData.rawOverrides || {};
    const version = targetData.version || targetData.ravenVersion || 'cpm';
    const age = parseFloat(targetData.age) || 8.0;
    return calculateRavenPsychometrics(scores, rawOverrides, version, age);
  }, [targetData]);

  if (!isOpen || !targetData || !psych) return null;

  const {
    versionName,
    totalRaw,
    maxRawScore,
    percentile,
    equivalentIQ,
    grade,
    classification,
    classificationEn,
    shortClassification,
    severityColor,
    severityBg,
    severityBorder,
    setResults = [],
    strengthSets = [],
    deficitSets = [],
    clinicalImpression,
    recommendations,
  } = psych;

  const studentName = targetData.studentName || 'غير محدد';
  const age = targetData.age || 'غير محدد';
  const examinerName = targetData.examinerName || targetData.specialistName || currentUser?.name || 'الأخصائي النفسي';
  const assessmentDate = targetData.date || todayStr();

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const summaryText = `*تقرير مقياس مصفوفات رافن المتتابعة (${versionName})*
اسم المفحوص: ${studentName}
العمر الزمني: ${age}
تاريخ التقييم: ${assessmentDate}
الفاحص: ${examinerName}

*المؤشرات السيكومترية الرئيسية:*
• الدرجة الخام الكلية: ${totalRaw} من ${maxRawScore}
• الرتبة المئينية المعيارية: ${percentile}%
• مكافئ معامل الذكاء (IQ): ${equivalentIQ}
• المستوى والتصنيف: ${grade} — ${classification}

*الخلاصة الإكلينيكية والتشخيص:*
${clinicalImpression || targetData.clinicalSummary || 'لا توجد ملاحظات إضافية'}

مركز: ${centerInfo?.name || 'Easy Center'}`;

    sendReportToWhatsApp({
      phone: targetData.phone || '',
      text: summaryText,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
      style={{ fontFamily: 'Tajawal, sans-serif' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header - Screen Only */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl border border-white/20 shadow-inner">
              ▦
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                تقرير نتائج مقياس مصفوفات رافن المتتابعة (RPM)
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900 border border-emerald-300">
                  {versionName}
                </span>
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                تقرير القياس النفسي للقدرة الاستدلالية العامة والذكاء غير اللفظي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shadow-xs"
              title="طباعة التقرير أو حفظ كـ PDF"
            >
              <span>🖨️</span> طباعة / PDF
            </button>
            <button
              onClick={handleShareWhatsApp}
              type="button"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="مشاركة التقرير عبر واتساب"
            >
              <span>📱</span> واتساب
            </button>
            {onOpenIepBridge && (
              <button
                onClick={() => onOpenIepBridge(targetData)}
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="تصدير الأهداف إلى الخطة التربوية الفردية"
              >
                <span>🎯</span> جسر الخطة (IEP)
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shadow-xs"
                title="تعديل درجات الفحص"
              >
                <span>✏️</span> تعديل
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition mr-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation - Screen Only */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold print:hidden">
          <button
            onClick={() => setActiveTab('summary')}
            type="button"
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>📊</span> ملخص النتائج والمؤشرات
          </button>
          <button
            onClick={() => setActiveTab('sets')}
            type="button"
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'sets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🧩</span> تحليل المجموعات الاستدلالية ({setResults.length})
          </button>
          <button
            onClick={() => setActiveTab('iep')}
            type="button"
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'iep'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🎯</span> أهداف الخطة الفردية المقترحة (IEP)
          </button>
        </div>

        {/* Report Content Body - Printable Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 print:overflow-visible">
          {/* Official Printable Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  {centerInfo?.name || 'مركز الأمل للرعاية والتأهيل'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  قسم القياس النفسي والتشخيص الإكلينيكي · تقييم القدرات العقلية والذكاء غير اللفظي
                </p>
              </div>
              <div className="text-left">
                <span className="inline-block px-3 py-1 rounded-md bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200">
                  {versionName}
                </span>
                <div className="text-[11px] text-slate-400 mt-1">Raven Progressive Matrices</div>
              </div>
            </div>

            {/* Student & Assessment Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">اسم المفحوص:</span>{' '}
                <strong className="text-slate-900 font-bold">{studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">العمر الزمني:</span>{' '}
                <strong className="text-slate-900 font-bold">{age}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">تاريخ التقييم:</span>{' '}
                <strong className="text-slate-900 font-bold">{assessmentDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">الفاحص المعتمد:</span>{' '}
                <strong className="text-slate-900 font-bold">{examinerName}</strong>
              </div>
              {targetData.diagnosis && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium">التشخيص الأولي:</span>{' '}
                  <strong className="text-slate-900 font-bold">{targetData.diagnosis}</strong>
                </div>
              )}
              {targetData.school && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium">المدرسة / المركز:</span>{' '}
                  <strong className="text-slate-900 font-bold">{targetData.school}</strong>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: SUMMARY & CORE PSYCHOMETRICS */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Core Raven Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Raw Score */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-center shadow-xs">
                  <div className="text-xs font-bold text-slate-500">الدرجة الخام الكلية (Raw Score)</div>
                  <div className="text-4xl font-black text-slate-900 mt-2">
                    {totalRaw}{' '}
                    <span className="text-sm font-normal text-slate-400">/ {maxRawScore}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">
                    نسبة الإنجاز الصحيح: {psych.percentage}%
                  </div>
                </div>

                {/* Percentile Rank */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-center shadow-xs">
                  <div className="text-xs font-bold text-blue-700">الرتبة المئينية المعيارية (Percentile)</div>
                  <div className="text-4xl font-black text-blue-900 mt-2">
                    {percentile}%
                  </div>
                  <div className="text-xs text-blue-600 mt-1 font-semibold">
                    مقارنة بعمر {age} سنة
                  </div>
                </div>

                {/* Equivalent IQ & Grade */}
                <div
                  className="p-5 rounded-2xl border text-center shadow-xs"
                  style={{ background: severityBg, borderColor: severityBorder }}
                >
                  <div className="text-xs font-bold" style={{ color: severityColor }}>
                    مكافئ معامل الذكاء (IQ) · {grade}
                  </div>
                  <div className="text-4xl font-black mt-2" style={{ color: severityColor }}>
                    {equivalentIQ}
                  </div>
                  <div className="text-xs font-bold mt-1" style={{ color: severityColor }}>
                    {shortClassification}
                  </div>
                </div>
              </div>

              {/* Classification Grade Detail Box */}
              <div
                className="p-4 rounded-xl border flex items-start gap-3"
                style={{ background: severityBg, borderColor: severityBorder }}
              >
                <div className="text-2xl mt-0.5">🎖️</div>
                <div className="space-y-1">
                  <div className="font-bold text-sm" style={{ color: severityColor }}>
                    التصنيف السيكومتري المعتمد لمصفوفات رافن: {classification} ({grade})
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {psych.gradeDescription}
                  </p>
                </div>
              </div>

              {/* Sets Performance Grid */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                  توزيع درجات المجموعات والقدرات الاستدلالية المقاسة
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {setResults.map(s => (
                    <div
                      key={s.setId}
                      className="p-4 rounded-xl border bg-slate-50/70 border-slate-200 space-y-2"
                      style={{ borderTop: `4px solid ${s.color}` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{s.name}</span>
                        <span className="font-black text-sm text-slate-900">
                          {s.rawScore} / 12
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 leading-snug">
                        <strong>المهارة:</strong> {s.cognitiveSkill}
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${s.percentage}%`, background: s.color }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 text-left">
                        {s.percentage}% إتقان
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths and Deficits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                    <span>🌟</span> نقاط القوة الاستدلالية البارزة
                  </div>
                  {strengthSets.length > 0 ? (
                    <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                      {strengthSets.map(s => (
                        <li key={s.setId}>
                          <strong>{s.name}:</strong> أداء مرتفع ({s.rawScore}/12) في {s.cognitiveSkill}.
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-700">
                      أداء المفحوص متقارب ومتناسق حول المعدل العام دون تباين مرتفع.
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                  <div className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                    <span>⚠️</span> مجالات الاحتياج ذات الأولوية في الخطة (IEP)
                  </div>
                  {deficitSets.length > 0 ? (
                    <ul className="text-xs text-rose-800 space-y-1 list-disc list-inside">
                      {deficitSets.map(s => (
                        <li key={s.setId}>
                          <strong>{s.name}:</strong> يحتاج دعماً ({s.rawScore}/12) في {s.cognitiveSkill}.
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-rose-700">
                      كافة مجموعات المقياس تقع في النطاق المتوسط أو الجيد دون وجود قصور حاد.
                    </p>
                  )}
                </div>
              </div>

              {/* Clinical Impression & Narrative */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  الخلاصة الإكلينيكية والتشخيصية (Clinical Impression)
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {clinicalImpression || targetData.clinicalSummary || 'تم تطبيق المقياس وفق القواعد المعيارية المقننة.'}
                </p>
              </div>

              {/* Recommendations */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  التوصيات التربوية والتدخلية المساندة
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {recommendations || targetData.recommendations || 'متابعة تدريب المهارات الاستدلالية غير اللفظية وإدراج الأهداف في الخطة الفردية.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED SETS ANALYSIS */}
          {activeTab === 'sets' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="font-bold text-base text-slate-900">
                  التحليل التفصيلي لمجموعات مصفوفات رافن ({versionName})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  يوضح هذا التحليل القدرة النوعية للمفحوص في كل مرحلة نمائية ومعرفية من المقياس.
                </p>
              </div>

              <div className="space-y-4">
                {setResults.map(s => {
                  const setMeta = RAVEN_SETS_META[s.setId];
                  return (
                    <div
                      key={s.setId}
                      className="p-5 rounded-2xl border bg-white shadow-xs space-y-3"
                      style={{ borderRight: `6px solid ${s.color}` }}
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2.5 py-0.5 rounded-md text-xs font-bold text-white shadow-xs"
                              style={{ background: s.color }}
                            >
                              المجموعة {s.setId}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{setMeta?.description}</p>
                        </div>

                        <div className="text-left">
                          <div className="text-xl font-black text-slate-900">
                            {s.rawScore} <span className="text-xs font-normal text-slate-400">/ 12</span>
                          </div>
                          <div className="text-[11px] font-bold" style={{ color: s.color }}>
                            {s.percentage}% كفاءة
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <strong>المهارة المعرفية الأساسية:</strong> {s.cognitiveSkill}
                      </div>

                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${s.percentage}%`, background: s.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: IEP GOALS EXPORT */}
          {activeTab === 'iep' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    أهداف الخطة التربوية الفردية المقترحة (IEP Bridge)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    أهداف سلوكية وإدراكية مشتقة مباشرة من نتائج مقياس رافن لتغذية خطة الطالب الفردية.
                  </p>
                </div>
                {onOpenIepBridge && (
                  <button
                    onClick={() => onOpenIepBridge(targetData)}
                    type="button"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>🎯</span> إرسال الأهداف للخطة التربوية (IEP)
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {setResults.map(s => {
                  return (
                    <div key={s.setId} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">
                          أهداف المجموعة ({s.setId}): {s.cognitiveSkill}
                        </span>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded"
                          style={{
                            background: s.rawScore >= 10 ? '#ecfdf5' : s.rawScore <= 4 ? '#fef2f2' : '#eff6ff',
                            color: s.rawScore >= 10 ? '#059669' : s.rawScore <= 4 ? '#dc2626' : '#2563eb',
                          }}
                        >
                          درجة المجموعة: {s.rawScore} من 12
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {s.setId === 'A' && (
                          <p>• أن يكمل الطالب النمط البصري والنسيج المستمر للأشكال الهندسية بنسبة دقة لا تقل عن 80% في 4 من أصل 5 محاولات.</p>
                        )}
                        {s.setId === 'Ab' && (
                          <p>• أن يستدل الطالب على التموضع المكاني وتغير أحجام الأشكال الهندسية المنفصلة بنسبة دقة 80% وفق معايير التدخل الحسي البصري.</p>
                        )}
                        {s.setId === 'B' && (
                          <p>• أن يحل الطالب مشكلات التماثل الشكلي البسيط واستنتاج القاعدة المنطقية بين زوجين من الأشكال غير اللفظية في جلسات التفكير التجريدي.</p>
                        )}
                        {s.setId === 'C' && (
                          <p>• أن يكتشف الطالب قاعدة التغير التدرجي في الأنماط المصفوفية 3×3 ويحدد الشكل المكمل الصحيح بدقة واستقلالية.</p>
                        )}
                        {s.setId === 'D' && (
                          <p>• أن يقوم الطالب بتركيب وتحويل وتبديل الأشكال الهندسية المعقدة ذهنياً وحل مشكلات الاستدلال الصامت بدقة 80%.</p>
                        )}
                        {s.setId === 'E' && (
                          <p>• أن يستخلص الطالب القواعد التجريدية الرياضية والدمج الهندسي فائق التعقيد للأشكال المتداخلة في جلسات التفكير المنظومي المتقدم.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Official Signatures & IP Footer */}
          <div className="pt-6 border-t border-slate-200 mt-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-center">
              <div>
                <div className="font-bold text-slate-800">الأخصائي الفاحص</div>
                <div className="mt-8 text-slate-500 font-semibold">{examinerName}</div>
                <div className="border-t border-slate-300 w-32 mx-auto mt-1" />
              </div>
              <div>
                <div className="font-bold text-slate-800">المشرف الفني / الإكلينيكي</div>
                <div className="mt-8 text-slate-500 font-semibold">د. الاستشاري النفسي</div>
                <div className="border-t border-slate-300 w-32 mx-auto mt-1" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="font-bold text-slate-800">ختم المركز والاعتماد</div>
                <div className="mt-8 text-slate-400 font-medium">الختم الرسمي للمركز</div>
                <div className="border-t border-slate-300 w-32 mx-auto mt-1" />
              </div>
            </div>

            {/* IP Reference Card in Footer */}
            <div className="text-[10px] text-slate-400 text-center leading-relaxed pt-2">
              {RAVEN_COPYRIGHT_INFO.scaleNameAr} · {RAVEN_COPYRIGHT_INFO.scaleNameEn} · تأليف: {RAVEN_COPYRIGHT_INFO.authorAr} · الناشر المعتمد: {RAVEN_COPYRIGHT_INFO.publisherAr} · {RAVEN_COPYRIGHT_INFO.notice}
            </div>
          </div>
        </div>

        {/* Footer Actions - Screen Only */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden shrink-0">
          <div className="text-xs text-slate-500">
            الرتبة المئينية: <strong className="text-blue-800">{percentile}%</strong> — {classification}
          </div>
          <div className="flex items-center gap-2">
            {onOpenIepBridge && (
              <button
                type="button"
                onClick={() => onOpenIepBridge(targetData)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>🎯</span> الانتقال إلى جسر الخطة الفردية (IEP)
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs"
            >
              🖨️ طباعة التقرير
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
