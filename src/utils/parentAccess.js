/** هل يمكن لولي الأمر رؤية هذا الطالب؟ */
export function parentCanViewStudent(student, user) {
  if (!user || user.role !== 'parent') return true;
  if (user.studentId) return student.id === user.studentId;
  const norm = v => String(v || '').replace(/\D/g, '');
  const uPhone = norm(user.phone || user.username);
  if (!uPhone) return false;
  const p1 = norm(student.parentPhone);
  const p2 = norm(student.parentPhone2);
  const tail = uPhone.slice(-9);
  return (p1 && (p1 === uPhone || p1.endsWith(tail))) || (p2 && (p2 === uPhone || p2.endsWith(tail)));
}

export function centerWhatsAppUrl(whatsapp, phoneCode, phone) {
  const wa = String(whatsapp || '').replace(/\D/g, '');
  if (wa) return `https://wa.me/${wa}`;
  const p = String(phone || '').replace(/\D/g, '').replace(/^0/, '');
  const code = String(phoneCode || '+966').replace(/\D/g, '');
  if (!p) return '';
  return `https://wa.me/${code}${p}`;
}
