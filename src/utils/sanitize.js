/**
 * Easy Center - Input Sanitization & Safety Utility
 * ينظف المدخلات والنصوص لمنع أي ثغرات أو وسم برمجي خبيث (XSS Injection) أثناء حفظ التقييمات
 */

export function sanitizeInput(input) {
  if (input === null || input === undefined) return '';

  if (typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '') // Remove <script> blocks
      .replace(/<[^>]*>/g, '')                             // Strip HTML tags
      .replace(/javascript:/gi, '')                       // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '')                         // Remove inline event handlers like onload=
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object') {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizeInput(value);
    }
    return sanitizedObj;
  }

  return String(input).trim();
}

/**
 * تنظيف الحقول النصية في كائن التقييم قبل الحفظ
 */
export function sanitizeAssessmentForm(form, textFields = ['studentName', 'notes', 'clinicalSummary', 'recommendations', 'raterName', 'examinerName', 'diagnosis']) {
  if (!form || typeof form !== 'object') return form;

  const cleaned = { ...form };
  textFields.forEach(field => {
    if (cleaned[field] && typeof cleaned[field] === 'string') {
      cleaned[field] = sanitizeInput(cleaned[field]);
    }
  });

  if (cleaned.itemNotes && typeof cleaned.itemNotes === 'object') {
    cleaned.itemNotes = sanitizeInput(cleaned.itemNotes);
  }

  return cleaned;
}
