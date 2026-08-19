/**
 * مساعد إرسال تقارير وبرامج Easy Center لولي الأمر عبر WhatsApp
 */
export function sendReportToWhatsApp({
  parentPhone,
  parentName,
  studentName,
  reportTitle,
  reportType,
  date,
  summary,
  recommendations,
  specialistName,
  centerName,
}) {
  const normPhone = String(parentPhone || '').replace(/\D/g, '').replace(/^0/, '');
  if (!normPhone) {
    return { ok: false, message: 'رقم هاتف ولي الأمر غير متوفر أو غير صالح' };
  }

  const cleanCenter = centerName || 'المركز';
  const cleanParent = parentName ? `المحترم/ة ${parentName}` : 'المحترم/ة ولي الأمر';
  
  const text = `السلام عليكم ورحمة الله وبركاته 🌹
إلى: ${cleanParent}
تحية طيبة من إدارة ${cleanCenter}،

نرفق لكم ملخص ${reportType || 'التقرير'} الخاص بالطالب/ة: *${studentName}*
📅 *التاريخ:* ${date || '—'}
📋 *العنوان:* ${reportTitle || 'تقرير متابعة'}
${specialistName ? `👨‍⚕️ *الأخصائي المسؤول:* ${specialistName}\n` : ''}
${summary ? `\n📌 *الملخص:* \n${summary}\n` : ''}
${recommendations ? `\n💡 *التوصيات والإرشادات المنزلية:* \n${recommendations}\n` : ''}
نسعد دائماً بتواصلكم ومشاركتكم في تعزيز تقدم الطالب/ة 🌟
دمتم بخير وعافية.
—
${cleanCenter}`;

  const encoded = encodeURIComponent(text);
  // Support international codes or default +966 / local
  const finalPhone = normPhone.startsWith('966') || normPhone.startsWith('20') || normPhone.startsWith('971') || normPhone.startsWith('965') || normPhone.startsWith('974') || normPhone.startsWith('973') || normPhone.startsWith('968')
    ? normPhone
    : `966${normPhone}`;

  const url = `https://wa.me/${finalPhone}?text=${encoded}`;
  window.open(url, '_blank');
  return { ok: true, url };
}
