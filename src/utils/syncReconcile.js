/**
 * منطق المزامنة (دالة نقية قابلة للاختبار): يقرر ماذا نفعل بمجموعة واحدة
 * بعد جلبها من السحابة، دون أي وصول للشبكة أو للتخزين.
 *
 * @param {Array|null} cloud       نتيجة الجلب؛ null = فشل الجلب (لا نعرف حالة السحابة)
 * @param {Array}      local       النسخة المحلية الحالية
 * @param {Array}      pendingOps  عمليات لم تصل للسحابة بعد ({type,docId,data})
 * @param {boolean}    seenCloud   هل سبق لهذا الجهاز أن قرأ هذه المجموعة من السحابة بنجاح؟
 * @returns {{ action: 'keep'|'replace'|'migrate', list?: Array }}
 */
export function reconcileCollection({ cloud, local, pendingOps = [], seenCloud }) {
  // فشل الجلب (شبكة/صلاحيات): لا نعدّل شيئاً، ولا نرفع شيئاً
  if (cloud === null || !Array.isArray(cloud)) return { action: 'keep' };

  // ترحيل لمرة واحدة: السحابة فارغة وهذا الجهاز لم يرَ السحابة قط ولديه بيانات محلية
  if (cloud.length === 0 && !seenCloud && Array.isArray(local) && local.length > 0) {
    return { action: 'migrate', list: local };
  }

  // السحابة هي المرجع (تنتشر الحذوفات)، مع الحفاظ على تغييرات محلية لم تصل بعد
  let list = cloud.slice();
  for (const op of pendingOps) {
    if (op.type === 'delete') {
      list = list.filter(x => x.id !== op.docId);
    } else if (op.type === 'set') {
      const idx = list.findIndex(x => x.id === op.docId);
      const merged = { ...(idx >= 0 ? list[idx] : {}), ...(op.data || {}), id: op.docId };
      if (idx >= 0) list[idx] = merged; else list.push(merged);
    }
  }
  return { action: 'replace', list };
}
