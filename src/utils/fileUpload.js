const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const BLOCKED_VIDEO = [
  'video/', 'application/mp4', 'application/x-mpegURL',
  'application/vnd.apple.mpegurl', 'application/octet-stream',
];

const ALLOWED_IMAGE = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function isVideo(file) {
  if (!file) return false;
  if (file.type?.startsWith('video/')) return true;
  const ext = (file.name || '').split('.').pop()?.toLowerCase();
  return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'wmv', 'flv', 'mpeg', 'mpg'].includes(ext);
}

/**
 * Validates upload before read. Returns { ok, errorKey } for i18n.
 * @param {File} file
 * @param {{ imagesOnly?: boolean, allowPdf?: boolean, allowDoc?: boolean }} opts
 */
export function validateUploadFile(file, opts = {}) {
  if (!file) return { ok: false, errorKey: 'file.invalidType' };
  if (isVideo(file)) return { ok: false, errorKey: 'file.invalidType' };
  if (file.size > MAX_BYTES) return { ok: false, errorKey: 'file.tooLarge' };

  const { imagesOnly, allowPdf = true, allowDoc = true } = opts;
  const allowed = [...ALLOWED_IMAGE];
  if (!imagesOnly) {
    if (allowPdf) allowed.push('application/pdf');
    if (allowDoc) {
      allowed.push(...ALLOWED_DOC.filter(t => t !== 'application/pdf'));
    }
  }

  const ext = (file.name || '').split('.').pop()?.toLowerCase();
  const extOk = imagesOnly
    ? ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)
    : ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx'].includes(ext);

  if (file.type && allowed.includes(file.type)) return { ok: true };
  if (extOk) return { ok: true };
  if (!file.type && extOk) return { ok: true };

  return { ok: false, errorKey: 'file.invalidType' };
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = ev => resolve({ data: ev.target.result, name: file.name });
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(file);
  });
}

/**
 * @param {Event} e
 * @param {{ imagesOnly?: boolean, allowPdf?: boolean }} opts
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
  return readFileAsDataURL(file);
}

export const FILE_ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/gif';
export const FILE_ACCEPT_DOCS = 'image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx';
