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

/**
 * يحدّث أيقونة تثبيت PWA (شاشة رئيسية/سطح مكتب) حسب شعار المركز الحالي.
 * ⚠️ يؤثر فقط على أي تثبيت جديد يحدث من الآن — لا يمكن لأي كود JS تغيير
 * أيقونة مثبَّتة مسبقاً على جهاز المستخدم (قيد من نظام التشغيل/المتصفح).
 * @param {string} logoUrl
 * @param {{ appName?: string }} [opts]
 */
export function updateManifestIcon(logoUrl, opts = {}) {
  try {
    const iconUrl = (logoUrl && logoUrl.trim()) ? logoUrl : DEFAULT_FAVICON;

    // Apple Touch Icon (iOS "إضافة إلى الشاشة الرئيسية") — يعمل فوراً، بلا قيود
    const appleIcon = document.getElementById('app-apple-icon');
    if (appleIcon) appleIcon.href = iconUrl;

    // Manifest الديناميكي (Chrome/Edge/Android) — يؤثر على التثبيتات القادمة فقط
    const manifestLink = document.getElementById('app-manifest');
    if (!manifestLink) return;

    const manifest = {
      name: opts.appName || 'نظام إدارة المركز',
      short_name: 'المركز',
      description: 'منصة إدارية متكاملة للمراكز التعليمية',
      theme_color: '#1a56db',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      dir: 'rtl',
      lang: 'ar',
      icons: [
        { src: iconUrl, sizes: '192x192', type: 'image/png' },
        { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const newBlobUrl = URL.createObjectURL(blob);
    const prevBlobUrl = manifestLink.dataset.blobUrl;

    manifestLink.href = newBlobUrl;
    manifestLink.dataset.blobUrl = newBlobUrl;

    // تحرير الذاكرة من الـ Blob السابق (لو وُجد) لتفادي تراكمها
    if (prevBlobUrl) URL.revokeObjectURL(prevBlobUrl);
  } catch (e) {
    // تحسين واجهة غير حرج
  }
}
