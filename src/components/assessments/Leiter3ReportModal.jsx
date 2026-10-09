import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LEITER3_BATTERIES,
  LEITER3_SUBTESTS,
  LEITER3_COPYRIGHT_INFO,
  calculateLeiter3Psychometrics,
} from '../../data/leiter3Data';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import { todayStr } from '../../utils/dateHelpers';

export default function Leiter3ReportModal({
  isOpen,
  onClose,
  assessmentData,
  assessment,
  onEdit,
  onOpenIepBridge,
}) {
  const targetData = assessmentData || assessment;
  const { currentUser, centerInfo } = useApp();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'batteries' | 'subtests' | 'iep'

  const psych = useMemo(() => {
    if (!targetData) return null;
    const scores = targetData.results || targetData.scores || {};
    const rawOverrides = targetData.rawOverrides || {};
    return calculateLeiter3Psychometrics(scores, rawOverrides);
  }, [targetData]);

  if (!isOpen || !targetData || !psych) return null;

  const {
    nviq,
    nviqPercentile,
    ami,
    amiPercentile,
    classification,
    classificationEn,
    severityColor,
    clinicalImpression,
    recommendations,
    subtestResults = [],
    strengthSubtests = [],
    deficitSubtests = [],
  } = psych;

  const studentName = targetData.studentName || 'غير محدد';
  const age = targetData.age || 'غير محدد';
  const examinerName = targetData.examinerName || targetData.specialistName || currentUser?.name || 'الأخصائي النفسي';
  const assessmentDate = targetData.date || todayStr();

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const summaryText = `*تقرير مقياس ليتر العالمي المعدل للتقييم غير اللفظي (Leiter-3)*
اسم المستفيد: ${studentName}
العمر: ${age}
تاريخ التقييم: ${assessmentDate}
الفاحص: ${examinerName}

*المؤشرات السيكومترية الرئيسية:*
• معامل الذكاء غير اللفظي (NVIQ): ${nviq} (الرتبة المئينية: ${nviqPercentile}%)
• مؤشر الانتباه والذاكرة (AMI): ${ami} (الرتبة المئينية: ${amiPercentile}%)
• التصنيف الإكلينيكي: ${classification}

*الخلاصة الإكلينيكية:*
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl border border-white/20 shadow-inner">
              🧩
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                تقرير نتائج مقياس ليتر العالمي غير اللفظي (Leiter-3)
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-900 border border-cyan-300">
                  الإصدار الثالث المقنن
                </span>
              </h2>
              <p className="text-xs text-indigo-100 mt-0.5">
                تقرير القياس السيكومتري لمعامل الذكاء غير اللفظي (NVIQ) والذاكرة والانتباه
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
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>📊</span> المؤشرات الكلية والتشخيص
          </button>
          <button
            onClick={() => setActiveTab('batteries')}
            type="button"
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'batteries'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>🧩</span> بطاريتا المقياس (الذكاء والانتباه)
          </button>
          <button
            onClick={() => setActiveTab('subtests')}
            type="button"
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'subtests'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>📋</span> تفاصيل الاختبارات الفرعية (7)
          </button>
          <button
            onClick={() => setActiveTab('iep')}
            type="button"
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'iep'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>🎯</span> التوصيات والتدخل التربوي (IEP)
          </button>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 print:p-0 print:space-y-4">
          {/* Header Info Block */}
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-5 rounded-xl border border-slate-200/80 shadow-xs print:border-slate-300 print:bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 mb-3">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>تقرير التقييم النفسي والقدرات غير اللفظية (Leiter-3)</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Leiter International Performance Scale — 3rd Edition • Stoelting Co.
                </p>
              </div>
              <div className="text-left text-xs font-semibold text-slate-600">
                <div>الجهة: {centerInfo?.name || 'المركز التأهيلي والتربوي'}</div>
                <div>تاريخ التقييم: {assessmentDate}</div>
              </div>
            </div>

            {/* Demographics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-400 block text-[11px]">اسم المفحوص / الطالب:</span>
                <span className="font-bold text-slate-800 text-sm">{studentName}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-400 block text-[11px]">العمر الزمني:</span>
                <span className="font-bold text-slate-800 text-sm">{age || 'غير محدد'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-400 block text-[11px]">الفاحص / الأخصائي:</span>
                <span className="font-bold text-slate-800 text-sm">{examinerName}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-400 block text-[11px]">التشخيص / الشكوى الأساسية:</span>
                <span className="font-bold text-slate-800 text-sm truncate block">
                  {assessmentData.diagnosis || 'تقييم غير لفظي للقدرات العقلية'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Gauges (NVIQ & AMI) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NVIQ Card */}
            <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 p-5 rounded-xl border-2 border-indigo-300 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
                    معامل الذكاء غير اللفظي الكلي
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Nonverbal IQ (NVIQ)</span>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-black text-indigo-900 tracking-tight">{nviq}</span>
                  <span className="text-xs font-bold text-indigo-600">درجة معيارية (M=100, SD=15)</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span>الرتبة المئينية:</span>
                    <span className="font-bold text-slate-800">{nviqPercentile}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التصنيف الإكلينيكي:</span>
                    <span className="font-bold text-indigo-800">{classification}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-indigo-200 text-[11px] text-indigo-700 font-semibold flex items-center justify-between">
                <span>المستوى التفسيري: {classificationEn}</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: severityColor }} />
              </div>
            </div>

            {/* AMI Card */}
            <div className="bg-gradient-to-br from-cyan-50 via-white to-cyan-50/50 p-5 rounded-xl border-2 border-cyan-300 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-800 bg-cyan-100 px-2.5 py-1 rounded-md">
                    مؤشر الانتباه والذاكرة غير اللفظية
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Attention & Memory (AMI)</span>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-black text-cyan-900 tracking-tight">{ami}</span>
                  <span className="text-xs font-bold text-cyan-700">درجة معيارية مركبة</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span>الرتبة المئينية:</span>
                    <span className="font-bold text-slate-800">{amiPercentile}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التركيز الوظيفي:</span>
                    <span className="font-bold text-cyan-800">الانتباه المستمر والذاكرة المكانية</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-200 text-[11px] text-cyan-700 font-semibold flex items-center justify-between">
                <span>بطارية الانتباه والذاكرة (Attention & Memory Battery)</span>
                <span>🎯</span>
              </div>
            </div>
          </div>

          {/* Section: The 2 Batteries Overview */}
          {(activeTab === 'summary' || activeTab === 'batteries') && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>🧩</span> بطاريتا مقياس ليتر-3 (Leiter-3 Batteries)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LEITER3_BATTERIES.map(bat => {
                  const subtests = subtestResults.filter(s => s.batteryId === bat.id);
                  const isCognitive = bat.id === 'cognitive';
                  return (
                    <div
                      key={bat.id}
                      className="p-4 rounded-xl border flex flex-col justify-between"
                      style={{ backgroundColor: bat.bgLight, borderColor: bat.borderColor }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{bat.icon}</span>
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-white border border-slate-200">
                            {isCognitive ? `مجموع المعيارية: ${psych.cogSumScaled}/76` : `مجموع المعيارية: ${psych.attSumScaled}/57`}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mb-1">{bat.name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">{bat.description}</p>
                      </div>

                      <div className="border-t border-slate-200/80 pt-3 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 block">الاختبارات الفرعية التابعة:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {subtests.map(st => (
                            <span
                              key={st.subtestId}
                              className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs"
                            >
                              {st.code}: {st.scaledScore}/19
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: 7 Subtests Breakdown Table */}
          {(activeTab === 'summary' || activeTab === 'subtests') && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>📋</span> أداء الاختبارات الفرعية السبعة (Subtests Scaled Scores 1-19)
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  الدرجة المعيارية (المتوسط = 10، الانحراف المعياري = 3)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100/75 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="p-3">رمز</th>
                      <th className="p-3">الاختبار الفرعي (Subtest)</th>
                      <th className="p-3">البطارية</th>
                      <th className="p-3 text-center">الدرجة الخام</th>
                      <th className="p-3 text-center">الدرجة المعيارية (1-19)</th>
                      <th className="p-3">التصنيف الإكلينيكي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {subtestResults.map(st => (
                      <tr key={st.subtestId} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-slate-700">{st.code}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{st.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{st.nameEn}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.batteryId === 'cognitive'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                            }`}
                          >
                            {st.batteryId === 'cognitive' ? 'الذكاء المعرفي' : 'الانتباه والذاكرة'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800">
                          {st.rawScore} <span className="text-slate-400 font-normal">/ {st.maxRawScore}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md font-extrabold text-sm ${
                              st.scaledScore >= 13
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : st.scaledScore <= 6
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {st.scaledScore}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-700">{st.qualitativeDesc}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Clinical Summary & Recommendations */}
          {(activeTab === 'summary' || activeTab === 'iep') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Clinical Impression */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>📝</span> التقرير السريري والانطباع التشخيصي
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
                  {assessmentData.clinicalSummary || clinicalImpression}
                </div>

                {deficitSubtests.length > 0 && (
                  <div className="mt-3 p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs">
                    <span className="font-bold text-rose-800 block mb-1">
                      ⚠️ مجالات القصور غير اللفظي ذات الأولوية للتدخل:
                    </span>
                    <ul className="list-disc list-inside text-rose-700 space-y-0.5">
                      {deficitSubtests.map(ds => (
                        <li key={ds.subtestId}>
                          {ds.name} (درجة معيارية: {ds.scaledScore} - {ds.qualitativeDesc})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations & IEP Directives */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>🎯</span> التوجيهات والتوصيات للخطة التربوية الفردية (IEP)
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line bg-indigo-50/40 p-3.5 rounded-lg border border-indigo-200/60">
                  {assessmentData.recommendations || recommendations}
                </div>

                {strengthSubtests.length > 0 && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-800 block mb-1">
                      🌟 نقاط القوة البصرية غير اللفظية لتوظيفها في التدريس:
                    </span>
                    <ul className="list-disc list-inside text-emerald-700 space-y-0.5">
                      {strengthSubtests.map(ss => (
                        <li key={ss.subtestId}>
                          {ss.name} (درجة معيارية: {ss.scaledScore} - {ss.qualitativeDesc})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Intellectual Property & Standard Notice Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2 print:border-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>🛡️</span> توثيق الملكية الفكرية والاعتماد المهني (Leiter-3 Attribution)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Stoelting Company / Gale H. Roid, Ph.D.
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              {LEITER3_COPYRIGHT_INFO.notice} {LEITER3_COPYRIGHT_INFO.disclaimer}
            </p>
          </div>

          {/* Signatures for Print */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-8 text-xs text-slate-700 border-t border-slate-300 mt-6">
            <div className="space-y-4">
              <p className="font-bold">توقيع الأخصائي النفسي / الفاحص:</p>
              <div className="h-12 border-b border-slate-400 border-dashed" />
              <p className="text-slate-500 text-[11px]">الاسم: {examinerName}</p>
            </div>
            <div className="space-y-4">
              <p className="font-bold">اعتماد المشرف الفني / إدارة المركز:</p>
              <div className="h-12 border-b border-slate-400 border-dashed" />
              <p className="text-slate-500 text-[11px]">الختم والتاريخ: {assessmentDate}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions - Screen Only */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <div className="text-xs text-slate-500">
            معامل الذكاء غير اللفظي: <strong className="text-indigo-800">{nviq}</strong> ({classification})
          </div>
          <div className="flex items-center gap-2">
            {onOpenIepBridge && (
              <button
                type="button"
                onClick={() => onOpenIepBridge(targetData)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition shadow-xs"
              >
                🎯 الانتقال إلى جسر الخطة الفردية (IEP)
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition shadow-xs"
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
