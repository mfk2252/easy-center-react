/**
 * رفع الملفات: التخزين الحالي base64 داخل مستندات Firestore (حدها 1MiB للمستند كاملاً).
 * لذلك: الصور تُصغَّر وتُضغط تلقائياً، والمستندات (PDF/Word) لا يمكن ضغطها فنحدّد حجمها.
 */
const MAX_DOC_BYTES = 500 * 1024;               // PDF / Word
const MAX_IMAGE_INPUT_BYTES = 15 * 1024 * 1024; // الصور تُضغط، فنقبل مدخلاً كبيراً

export const UPLOAD_TOO_LARGE_MSG = 'الملف كبير جداً — الحد الأقصى للمستندات (PDF/Word) 500 كيلوبايت، والصور تُضغط تلقائياً';

// أقصى بُعد وحجم نهائي (بعد الضغط) لكل نوع صورة
export const IMAGE_PRESETS = {
  avatar:     { maxDim: 400,  maxBytes: 60 * 1024 },                    // صورة طالب/موظف
  logo:       { maxDim: 512,  maxBytes: 120 * 1024, keepAlpha: true },  // شعار/باركود
  photo:      { maxDim: 1280, maxBytes: 220 * 1024 },                   // صورة نشاط
  attachment: { maxDim: 1600, maxBytes: 300 * 1024 },                   // مرفق صورة
};

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const ALLOWED_IMAGE = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function extOf(file) {
  return (file?.name || '').split('.').pop()?.toLowerCase();
}

function isVideo(file) {
  if (!file) return false;
  if (file.type?.startsWith('video/')) return true;
  return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'wmv', 'flv', 'mpeg', 'mpg'].includes(extOf(file));
}

function isImage(file) {
  return !!file && (ALLOWED_IMAGE.includes(file.type) || IMAGE_EXTS.includes(extOf(file)));
}

/**
 * Validates upload before read. Returns { ok, errorKey } for i18n.
 * @param {File} file
 * @param {{ imagesOnly?: boolean, allowPdf?: boolean, allowDoc?: boolean }} opts
 */
export function validateUploadFile(file, opts = {}) {
  if (!file) return { ok: false, errorKey: 'file.invalidType' };
  if (isVideo(file)) return { ok: false, errorKey: 'file.invalidType' };

  const { imagesOnly, allowPdf = true, allowDoc = true } = opts;
  const image = isImage(file);

  if (image) {
    if (file.size > MAX_IMAGE_INPUT_BYTES) return { ok: false, errorKey: 'file.tooLarge' };
    return { ok: true };
  }
  if (imagesOnly) return { ok: false, errorKey: 'file.invalidType' };

  const allowed = [];
  if (allowPdf) allowed.push('application/pdf');
  if (allowDoc) allowed.push(...ALLOWED_DOC.filter(t => t !== 'application/pdf'));
  const extOk = (allowPdf && extOf(file) === 'pdf') || (allowDoc && ['doc', 'docx'].includes(extOf(file)));
  if (!(file.type && allowed.includes(file.type)) && !extOk) return { ok: false, errorKey: 'file.invalidType' };

  if (file.size > MAX_DOC_BYTES) return { ok: false, errorKey: 'file.tooLarge' };
  return { ok: true };
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = ev => resolve({ data: ev.target.result, name: file.name });
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(file);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image decode failed')); };
    img.src = url;
  });
}

const dataUrlBytes = u => Math.floor((u.length - u.indexOf(',') - 1) * 0.75);

function drawScaled(img, scale, fillWhite) {
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (fillWhite) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

/** يصغّر الصورة ويضغطها حتى لا تتجاوز الحجم المحدد للنوع. يرجع data URL. */
export async function compressImage(file, presetName = 'attachment') {
  const { maxDim, maxBytes, keepAlpha } = IMAGE_PRESETS[presetName] || IMAGE_PRESETS.attachment;
  const img = await loadImage(file);
  let scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));

  // الشعارات الشفافة: نجرّب PNG أولاً للحفاظ على الشفافية
  if (keepAlpha && file.type !== 'image/jpeg') {
    const png = drawScaled(img, scale, false).toDataURL('image/png');
    if (dataUrlBytes(png) <= maxBytes) return png;
  }

  for (let round = 0; round < 5; round++) {
    const canvas = drawScaled(img, scale, true);
    for (const q of [0.85, 0.7, 0.55, 0.4]) {
      const out = canvas.toDataURL('image/jpeg', q);
      if (dataUrlBytes(out) <= maxBytes) return out;
    }
    scale *= 0.75;
  }
  const err = new Error('image too large');
  err.i18nKey = 'file.tooLarge';
  throw err;
}

/** رسالة عربية جاهزة لعرضها عند فشل الرفع */
export function uploadErrorMessage(ex) {
  return ex?.i18nKey === 'file.tooLarge' ? UPLOAD_TOO_LARGE_MSG : 'نوع الملف غير مدعوم';
}

/**
 * @param {Event} e
 * @param {{ imagesOnly?: boolean, allowPdf?: boolean, allowDoc?: boolean, preset?: keyof typeof IMAGE_PRESETS }} opts
 * @returns {Promise<{ data: string, name: string } | null>}
 */
export async function handleFileInputChange(e, opts = {}) {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return null;
  const v = validateUploadFile(file, opts);
  if (!v.ok) {
    const err = new Error(v.errorKey);
    err.i18nKey = v.errorKey;
    throw err;
  }
  if (!isImage(file)) return readFileAsDataURL(file);

  try {
    const data = await compressImage(file, opts.preset || (opts.imagesOnly ? 'logo' : 'attachment'));
    // المخرج JPEG أو PNG: نصحّح الامتداد حتى لا يُحفظ باسم يخالف المحتوى
    const outExt = data.startsWith('data:image/png') ? 'png' : 'jpg';
    const base = (file.name || 'image').replace(/\.[^.]+$/, '');
    return { data, name: `${base}.${outExt}` };
  } catch (ex) {
    if (ex.i18nKey) throw ex;
    const err = new Error('file.invalidType'); // مثال: صيغة لا يفكّها المتصفح (HEIC)
    err.i18nKey = 'file.invalidType';
    throw err;
  }
}

export const FILE_ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/gif';
export const FILE_ACCEPT_DOCS = 'image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx';
