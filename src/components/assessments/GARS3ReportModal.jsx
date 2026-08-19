import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { printItem } from '../../utils/printUtils';
import { sendReportToWhatsApp } from '../../pages/ProgramsReports/programsWhatsApp';
import { calculateGARS3Psychometrics, GARS3_DOMAINS } from '../../data/gars3Data';

export default function GARS3ReportModal({
  isOpen,
  onClose,
  assessment = null,
  onEdit = null,
  onOpenBridge = null,
}) {
  const { center } = useApp();

  const psychometrics = useMemo(() => {
    if (!assessment) return null;
    return calculateGARS3Psychometrics(
      assessment.results || assessment.scores || {},
      assessment.isVerbal !== undefined ? assessment.isVerbal : true
    );
  }, [assessment]);

  if (!isOpen || !assessment) return null;

  function handlePrint() {
    printItem(assessment, 'gars3Report');
  }

  function handleSendWhatsApp() {
    sendReportToWhatsApp(assessment, 'gars3');
  }

  const verbalLabel = assessment.isVerbal !== false
    ? 'الأطفال الناطقون (تطبيق 6 مقاييس فرعية)'
    : 'الأطفال غير الناطقين (تطبيق 4 مقاييس فرعية أساسية)';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header Actions */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-xl font-bold shadow-sm">
              📋
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>التقرير التشخيصي الإكلينيكي المعتمد (GARS-3)</span>
              </h2>
              <p className="text-xs text-slate-400">
                مقياس جيليام لتقدير اضطراب طيف التوحد - الإصدار الثالث • DSM-5
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBridge && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBridge(assessment);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>🌉</span>
                <span>جسر الربط بالخطة الفردية (IEP)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>📱</span>
              <span>واتساب</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>🖨️</span>
              <span>طباعة التقرير</span>
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(assessment);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>✏️</span>
                <span>تعديل</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div id="print-area" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          
          {/* 1. Official Diagnostic Report Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {center?.logo ? (
                  <img src={center.logo} alt="Logo" className="w-14 h-14 object-contain rounded-lg" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-teal-700 text-white flex items-center justify-center text-2xl font-bold">
                    🏛️
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white">
                    {center?.name || 'مركز الرعاية النهارية والتأهيل الشامل'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    قسم القياس والتشخيص النفسي والتربية الخاصة • {center?.phone || ''}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-teal-50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-200 dark:border-teal-800">
                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 block">
                  تقرير تشخيصي نفسي مقنن
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  GARS-3 Diagnostic Assessment
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  تاريخ التقييم: {assessment.date || '—'}
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-base font-black tracking-wide text-teal-900 dark:text-teal-200 uppercase">
                تقرير مقياس جيليام لتقدير اضطراب طيف التوحد (الإصدار الثالث - GARS-3)
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                وفق معايير الدليل التشخيصي والإحصائي الخامس للأمراض النفسية (DSM-5)
              </span>
            </div>
          </div>

          {/* 2. Biodata & Examination Profile */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
              <span>👤</span> بيانات الحالة والملاحظة الإكلينيكية
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">اسم المفحوص:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{assessment.studentName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">العمر الزمني:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{assessment.age || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">تاريخ الميلاد:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{assessment.dob || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">الصف / المدرسة:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {assessment.grade ? `${assessment.grade} (${assessment.school || '—'})` : (assessment.school || '—')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">القائم بالاستجابة (المقدر):</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {assessment.raterName || '—'} ({assessment.raterRelation || 'ولي الأمر'})
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">صلته بالطفل منذ:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{assessment.relationshipDuration || 'منذ الولادة'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">الفاحص المعتمد:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{assessment.examinerName || 'الأخصائي النفسي'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">صيغة التطبيق:</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">{verbalLabel}</span>
              </div>
            </div>
          </div>

          {/* 3. Executive Diagnostic Summary Banner */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 p-5 rounded-2xl border-2 border-teal-300 dark:border-teal-700 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-teal-800 dark:text-teal-300 block mb-1">
                  النتيجة والتشخيص النهائي وفق DSM-5
                </span>
                <h3 className="text-xl font-black text-teal-950 dark:text-white flex items-center gap-2">
                  <span>{psychometrics?.dsm5Level}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  مستوى الدعم المطلوب: <b>{psychometrics?.supportLevel}</b>
                </p>
              </div>

              <div className="flex items-center gap-4 text-center shrink-0">
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-teal-200 dark:border-teal-800 shadow-2xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">مجموع المعيارية</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">{psychometrics?.sumScaledScores}</span>
                </div>

                <div className="bg-teal-700 text-white px-5 py-2.5 rounded-xl shadow-md">
                  <span className="text-[11px] text-teal-100 block font-bold">معامل التوحد (AQ)</span>
                  <span className="text-2xl font-black">{psychometrics?.autismQuotient}</span>
                </div>

                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-teal-200 dark:border-teal-800 shadow-2xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">الرتبة المئينية</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{psychometrics?.overallPercentile}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Subscales Performance Table (جدول الأداء على المقاييس الفرعية) */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <span>📊</span> نتائج الأداء على المقاييس الفرعية (Subscales Performance Table)
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-right border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">
                  <tr>
                    <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">م</th>
                    <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">المقياس الفرعي</th>
                    <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 text-center">الرمز</th>
                    <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 text-center">الدرجة الخام</th>
                    <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 text-center bg-teal-50/70 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300">
                      الدرجة المعيارية (1-20)
                    </th>
                    <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 text-center">الرتبة المئينية</th>
                    <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 text-center">الخطأ المعياري</th>
                    <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 text-center">المستوى الوصفي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {psychometrics?.domainResults.map((d, idx) => {
                    let desc = 'ضمن المتوسط (طبيعي)';
                    let descClass = 'text-emerald-600 dark:text-emerald-400';
                    if (d.scaledScore >= 13) {
                      desc = 'مرتفع جداً (شديد)';
                      descClass = 'text-rose-600 dark:text-rose-400 font-bold';
                    } else if (d.scaledScore >= 11) {
                      desc = 'فوق المتوسط (متوسط)';
                      descClass = 'text-amber-600 dark:text-amber-400 font-bold';
                    }

                    return (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-100">
                          {d.name} <span className="text-[10px] text-slate-400">({d.englishName})</span>
                        </td>
                        <td className="p-2.5 text-center font-bold" style={{ color: d.color }}>{d.code}</td>
                        <td className="p-2.5 text-center font-bold">{d.rawScore} / {d.maxRaw}</td>
                        <td className="p-2.5 text-center font-black text-teal-700 dark:text-teal-300 bg-teal-50/40 dark:bg-teal-950/20 text-sm">
                          {d.scaledScore}
                        </td>
                        <td className="p-2.5 text-center font-bold text-indigo-600 dark:text-indigo-400">{d.percentile}%</td>
                        <td className="p-2.5 text-center text-slate-500">±{d.sem}</td>
                        <td className={`p-2.5 text-center ${descClass}`}>{desc}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800 font-bold">
                  <tr>
                    <td colSpan={3} className="p-2.5 text-slate-700 dark:text-slate-200">المجموع الكلي:</td>
                    <td className="p-2.5 text-center text-slate-900 dark:text-slate-100 font-black">{psychometrics?.totalRawScore}</td>
                    <td className="p-2.5 text-center text-teal-800 dark:text-teal-200 font-black text-sm bg-teal-100/50 dark:bg-teal-900/30">
                      {psychometrics?.sumScaledScores}
                    </td>
                    <td colSpan={3} className="p-2.5 text-center text-slate-500">
                      معامل التوحد: <b>{psychometrics?.autismQuotient}</b> (رتبة مئينية {psychometrics?.overallPercentile}%)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 5. Visual Profile of Subscale Scores */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>📈 المظهر الجانبي للدرجات المعيارية (Subscale Profile)</span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                المتوسط المعياري = 10 • الانحراف المعياري = 3
              </span>
            </h3>

            <div className="space-y-3">
              {psychometrics?.domainResults.map(d => {
                const percentage = Math.min(100, Math.max(5, (d.scaledScore / 20) * 100));
                return (
                  <div key={d.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span>{d.name} ({d.code})</span>
                      </span>
                      <span className="font-bold">
                        معياري: <b style={{ color: d.color }}>{d.scaledScore}</b> / 20 (مئيني: {d.percentile}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 relative overflow-hidden">
                      {/* Mean Line indicator at 10 (50%) */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 z-10" title="المتوسط = 10" />
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: d.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. DSM-5 Diagnostic Matrix (الدليل التفسيري للدرجات) */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              📋 الدليل التفسيري لمعامل التوحد ومستوى الشدة وفق معايير DSM-5
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-3 rounded-xl border ${
                psychometrics?.autismQuotient <= 54
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-400 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 opacity-70'
              }`}>
                <span className="block font-black text-sm mb-0.5">54 فأقل</span>
                <span className="block text-emerald-700 dark:text-emerald-400 font-bold">غير محتمل</span>
                <span className="block text-[11px] mt-1 text-slate-600 dark:text-slate-300">غير توحد / لا يحتاج دعماً نوعياً</span>
              </div>

              <div className={`p-3 rounded-xl border ${
                psychometrics?.autismQuotient >= 55 && psychometrics?.autismQuotient <= 70
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-400 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 opacity-70'
              }`}>
                <span className="block font-black text-sm mb-0.5">55 - 70</span>
                <span className="block text-blue-700 dark:text-blue-400 font-bold">محتمل (بسيط)</span>
                <span className="block text-[11px] mt-1 text-slate-600 dark:text-slate-300">المستوى 1 / يتطلب حداً أدنى من الدعم</span>
              </div>

              <div className={`p-3 rounded-xl border ${
                psychometrics?.autismQuotient >= 71 && psychometrics?.autismQuotient <= 100
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-400 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 opacity-70'
              }`}>
                <span className="block font-black text-sm mb-0.5">71 - 100</span>
                <span className="block text-amber-700 dark:text-amber-400 font-bold">ملائم / مؤكد (متوسط)</span>
                <span className="block text-[11px] mt-1 text-slate-600 dark:text-slate-300">المستوى 2 / يتطلب دعماً كبيراً</span>
              </div>

              <div className={`p-3 rounded-xl border ${
                psychometrics?.autismQuotient >= 101
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 ring-2 ring-rose-400 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 opacity-70'
              }`}>
                <span className="block font-black text-sm mb-0.5">101 فأكثر</span>
                <span className="block text-rose-700 dark:text-rose-400 font-bold">ملائم جداً (شديد)</span>
                <span className="block text-[11px] mt-1 text-slate-600 dark:text-slate-300">المستوى 3 / يتطلب دعماً كبيراً جداً</span>
              </div>
            </div>
          </div>

          {/* 7. Clinical Psychological Summary & Recommendations */}
          <div className="space-y-4 pt-2">
            {assessment.clinicalSummary && (
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <span>📝</span> التقرير والملخص الإكلينيكي (Clinical Summary)
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {assessment.clinicalSummary}
                </p>
              </div>
            )}

            {assessment.recommendations && (
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 mb-2 flex items-center gap-1.5">
                  <span>💡</span> التوصيات التأهيلية والعلاجية (Intervention Recommendations)
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {assessment.recommendations}
                </p>
              </div>
            )}
          </div>

          {/* 8. MDT Signatures & Stamp */}
          <div className="mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <span className="block text-slate-500 dark:text-slate-400 mb-1">الأخصائي النفسي / الفاحص</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{assessment.examinerName || '—'}</span>
              <div className="mt-6 border-b border-dashed border-slate-400 w-28 mx-auto" />
            </div>

            <div>
              <span className="block text-slate-500 dark:text-slate-400 mb-1">المشرف الفني والأكاديمي</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">د. المشرف الأكاديمي</span>
              <div className="mt-6 border-b border-dashed border-slate-400 w-28 mx-auto" />
            </div>

            <div>
              <span className="block text-slate-500 dark:text-slate-400 mb-1">ختم المركز والاعتماد</span>
              <div className="w-20 h-14 border-2 border-slate-300 dark:border-slate-700 rounded-xl mx-auto flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold text-[10px]">
                ختم الإدارة
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
