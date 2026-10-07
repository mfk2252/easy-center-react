import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { todayStr } from '../../utils/dateHelpers';
import {
  SB5_DOMAINS,
  SB5_FACTORS,
  SB5_SUBTESTS,
  SB5_COPYRIGHT_INFO,
  calculateSB5Psychometrics,
} from '../../data/sb5Data';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';

export default function StanfordBinet5ReportModal({
  isOpen,
  onClose,
  assessmentData,
  assessment,
  onEdit,
  onOpenIepBridge,
}) {
  const targetData = assessmentData || assessment;
  const { currentUser, centerInfo } = useApp();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'factors' | 'subtests' | 'iep'

  const psych = useMemo(() => {
    if (!targetData) return null;
    const scores = targetData.results || targetData.scores || {};
    const rawOverrides = targetData.rawOverrides || {};
    return calculateSB5Psychometrics(scores, rawOverrides);
  }, [targetData]);

  if (!isOpen || !targetData || !psych) return null;

  const {
    fsiq,
    nviq,
    viq,
    fsiqPercentile,
    nviqPercentile,
    viqPercentile,
    classification,
    classificationEn,
    severityColor,
    clinicalImpression,
    recommendations,
    factorResults = [],
    subtestResults = [],
    deficitFactors = [],
    strengthFactors = [],
  } = psych;

  const studentName = targetData.studentName || 'غير محدد';
  const age = targetData.age || 'غير محدد';
  const examinerName = targetData.examinerName || targetData.specialistName || currentUser?.name || 'الأخصائي النفسي';
  const assessmentDate = targetData.date || todayStr();

  function handlePrint() {
    window.print();
  }

  function handleShareWhatsApp() {
    const summaryText = `*تقرير مقياس ستانفورد - بينيه للذكاء (الصورة الخامسة SB5)*
اسم المستفيد: ${studentName}
العمر: ${age}
تاريخ التقييم: ${assessmentDate}
الفاحص: ${examinerName}

*النتائج السيكومترية الرئيسية:*
• نسبة الذكاء الكلي (FSIQ): ${fsiq} (الرتبة المئينية: ${fsiqPercentile}%)
• نسبة الذكاء غير اللفظي (NVIQ): ${nviq} (الرتبة: ${nviqPercentile}%)
• نسبة الذكاء اللفظي (VIQ): ${viq} (الرتبة: ${viqPercentile}%)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
      style={{ fontFamily: 'Tajawal, sans-serif' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header - Screen Only */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl border border-white/20 shadow-inner">
              🧠
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                تقرير نتائج مقياس ستانفورد - بينيه للذكاء (SB5)
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  الصورة الخامسة المقننة
                </span>
              </h2>
              <p className="text-xs text-purple-100 mt-0.5">
                بطارية التقييم الشامل للقدرات العقلية والمعرفية (المجال اللفظي وغير اللفظي)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shadow-sm"
              title="طباعة التقرير أو حفظ كـ PDF"
            >
              <span>🖨️</span> طباعة / PDF
            </button>
            <button
              onClick={handleShareWhatsApp}
              type="button"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="مشاركة التقرير عبر واتساب"
            >
              <span>📱</span> واتساب
            </button>
            {onOpenIepBridge && (
              <button
                onClick={() => onOpenIepBridge(targetData)}
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="تصدير الأهداف إلى الخطة التربوية الفردية"
              >
                <span>🎯</span> جسر الخطة (IEP)
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shadow-sm"
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
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>📊</span> المؤشرات الكلية والتشخيص
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            type="button"
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'factors'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>🧩</span> العوامل الخمسة للمقياس
          </button>
          <button
            onClick={() => setActiveTab('subtests')}
            type="button"
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'subtests'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>📋</span> تفاصيل الاختبارات الفرعية (10)
          </button>
          <button
            onClick={() => setActiveTab('iep')}
            type="button"
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'iep'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>🎯</span> التوصيات والتدخل التربوي (IEP)
          </button>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 print:p-0 print:space-y-4">
          {/* Header Info Block */}
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/40 p-5 rounded-xl border border-slate-200/80 shadow-sm print:border-slate-300 print:bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 mb-3">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>تقرير التقييم النفسي والقدرات العقلية (SB5)</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Stanford-Binet Intelligence Scales — Fifth Edition • المعايير المقننة
                </p>
              </div>
              <div className="text-left text-xs font-semibold text-slate-600">
                <div>الجهة: {centerInfo?.name || 'المركز التأهيلي والتربوي'}</div>
                <div>تاريخ التقييم: {assessmentDate}</div>
              </div>
            </div>

            {/* Demographics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-400 block text-[11px]">اسم المفحوص / الطالب:</span>
                <span className="font-bold text-slate-800 text-sm">{studentName}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-400 block text-[11px]">العمر الزمني:</span>
                <span className="font-bold text-slate-800 text-sm">{age || 'غير محدد'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-400 block text-[11px]">الفاحص / الأخصائي:</span>
                <span className="font-bold text-slate-800 text-sm">{examinerName}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-400 block text-[11px]">التشخيص / الشكوى الأساسية:</span>
                <span className="font-bold text-slate-800 text-sm truncate block">
                  {assessmentData.diagnosis || 'تقييم شامل للقدرات العقلية'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Psychometric Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* FSIQ Card */}
            <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/50 p-5 rounded-xl border-2 border-purple-300 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md">
                    مؤشر الذكاء الكلي العام
                  </span>
                  <span className="text-xs font-semibold text-slate-500">FSIQ (10 اختبارات)</span>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold text-purple-900 tracking-tight">{fsiq}</span>
                  <span className="text-xs font-bold text-purple-600">درجة معيارية (M=100, SD=15)</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span>الرتبة المئينية:</span>
                    <span className="font-bold text-slate-800">{fsiqPercentile}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التصنيف الإكلينيكي:</span>
                    <span className="font-bold text-purple-800">{classification}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-200 text-[11px] text-purple-700 font-semibold flex items-center justify-between">
                <span>المستوى التفسيري: {classificationEn}</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: severityColor }} />
              </div>
            </div>

            {/* NVIQ Card */}
            <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/50 p-5 rounded-xl border border-sky-300 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md">
                    نسبة الذكاء غير اللفظي
                  </span>
                  <span className="text-xs font-semibold text-slate-500">NVIQ (5 اختبارات)</span>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold text-sky-900 tracking-tight">{nviq}</span>
                  <span className="text-xs font-bold text-sky-600">درجة معيارية</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span>الرتبة المئينية:</span>
                    <span className="font-bold text-slate-800">{nviqPercentile}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التركيز النمائي:</span>
                    <span className="font-bold text-sky-800">الأداء البصري والعملي المجرد</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-sky-200 text-[11px] text-sky-700 font-semibold flex items-center justify-between">
                <span>المجال غير اللفظي (Nonverbal Domain)</span>
                <span>🧩</span>
              </div>
            </div>

            {/* VIQ Card */}
            <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 p-5 rounded-xl border border-indigo-300 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
                    نسبة الذكاء اللفظي
                  </span>
                  <span className="text-xs font-semibold text-slate-500">VIQ (5 اختبارات)</span>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold text-indigo-900 tracking-tight">{viq}</span>
                  <span className="text-xs font-bold text-indigo-600">درجة معيارية</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span>الرتبة المئينية:</span>
                    <span className="font-bold text-slate-800">{viqPercentile}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التركيز النمائي:</span>
                    <span className="font-bold text-indigo-800">الاستدلال والمفاهيم اللغوية</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-indigo-200 text-[11px] text-indigo-700 font-semibold flex items-center justify-between">
                <span>المجال اللفظي (Verbal Domain)</span>
                <span>🗣️</span>
              </div>
            </div>
          </div>

          {/* Section: 5 Factors Profile */}
          {(activeTab === 'summary' || activeTab === 'factors') && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>📊</span> الملف النفسي للعوامل المعرفية الخمسة (The 5 SB5 Cognitive Factors)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {factorResults.map((factor) => (
                  <div
                    key={factor.factorId}
                    className="p-3.5 rounded-xl border transition flex flex-col justify-between"
                    style={{
                      backgroundColor: factor.bgLight || '#f8fafc',
                      borderColor: factor.borderColor || '#cbd5e1',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">{factor.icon || '📌'}</span>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                          {factor.code}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 mb-1">{factor.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{factor.description}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-bold text-slate-600">مؤشر العامل:</span>
                        <span className="text-base font-extrabold text-slate-900">{factor.factorIndexScore}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>الرتبة: {factor.percentile}%</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            factor.isDeficit
                              ? 'bg-rose-100 text-rose-700'
                              : factor.isStrength
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {factor.qualitativeDesc}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: 10 Subtests Breakdown Table */}
          {(activeTab === 'summary' || activeTab === 'subtests') && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>📋</span> تفاصيل أداء الاختبارات الفرعية العشرة (Subtests Scaled Scores 1-19)
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  الدرجة المعيارية الموزونة (المتوسط = 10، الانحراف المعياري = 3)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100/75 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="p-3">رمز</th>
                      <th className="p-3">الاختبار الفرعي (Subtest)</th>
                      <th className="p-3">المجال</th>
                      <th className="p-3">العامل المعرفي</th>
                      <th className="p-3 text-center">الدرجة الخام</th>
                      <th className="p-3 text-center">الدرجة الموزونة (1-19)</th>
                      <th className="p-3">التصنيف والتحليل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {subtestResults.map((st) => (
                      <tr key={st.subtestId} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-slate-700">{st.code}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{st.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{st.nameEn}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.domainId === 'nonverbal'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {st.domainName}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{st.factorName}</td>
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
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>📝</span> التقرير التفسيري والانطباع الإكلينيكي
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
                  {assessmentData.clinicalSummary || clinicalImpression}
                </div>

                {deficitFactors.length > 0 && (
                  <div className="mt-3 p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs">
                    <span className="font-bold text-rose-800 block mb-1">
                      ⚠️ مجالات الاحتياج ذات الأولوية للتدخل:
                    </span>
                    <ul className="list-disc list-inside text-rose-700 space-y-0.5">
                      {deficitFactors.map((df) => (
                        <li key={df.factorId}>
                          {df.name} (المؤشر: {df.factorIndexScore} - {df.qualitativeDesc})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations & IEP Directives */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>🎯</span> التوجيهات والتوصيات للخطة التربوية الفردية (IEP)
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line bg-purple-50/40 p-3.5 rounded-lg border border-purple-200/60">
                  {assessmentData.recommendations || recommendations}
                </div>

                {strengthFactors.length > 0 && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-800 block mb-1">
                      🌟 نقاط القوة المعرفية لتوظيفها في التدريس:
                    </span>
                    <ul className="list-disc list-inside text-emerald-700 space-y-0.5">
                      {strengthFactors.map((sf) => (
                        <li key={sf.factorId}>
                          {sf.name} (المؤشر: {sf.factorIndexScore} - {sf.qualitativeDesc})
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
                <span>🛡️</span> توثيق الملكية الفكرية والاعتماد المهني (SB5 Attribution)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Riverside Insights / Gale H. Roid, Ph.D.
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              {SB5_COPYRIGHT_INFO.notice} {SB5_COPYRIGHT_INFO.disclaimer}
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
            معامل الذكاء الكلي: <strong className="text-purple-800">{fsiq}</strong> ({classification})
          </div>
          <div className="flex items-center gap-2">
            {onOpenIepBridge && (
              <button
                type="button"
                onClick={() => onOpenIepBridge(assessmentData)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition shadow-sm"
              >
                🎯 الانتقال إلى جسر الخطة الفردية (IEP)
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow-sm"
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
