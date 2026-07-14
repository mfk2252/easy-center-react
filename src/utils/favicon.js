const DEFAULT_FAVICON = '/pwa-192x192.png';

/**
 * يحدّث أيقونة تبويب المتصفح (Favicon) ديناميكياً حسب شعار المركز الحالي.
 * يدعم روابط عادية وروابط Base64 (data:image/...) لأن شعارات المراكز في
 * هذا المشروع تُخزَّن غالباً كـ Base64 مباشرة، وليست ملفات مرفوعة لسيرفر.
 * @param {string} logoUrl - رابط الشعار، أو فارغ/غير معرّف للعودة للأيقونة الافتراضية
 */
export function updateFavicon(logoUrl) {
  try {
    let link = document.getElementById('app-favicon');
    if (!link) {
      // احتياط: لو لم يوجد id (مثلاً نسخة index.html أقدم لم تُحدَّث بعد)
      link = document.querySelector("link[rel~='icon']");
    }
    if (!link) {
      link = document.createElement('link');
      link.id = 'app-favicon';
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = (logoUrl && logoUrl.trim()) ? logoUrl : DEFAULT_FAVICON;
  } catch (e) {
    // تحسين واجهة غير حرج — لا نكسر التطبيق لو فشل لأي سبب متصفح نادر
  }
}
