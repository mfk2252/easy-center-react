import { getCenterPrintMeta } from './centerMeta';

const PRINT_CSS = `
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: 'Tajawal', 'Arial', sans-serif;
    background: #fff !important;
    color: #0f172a !important;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  table { width: 100%; border-collapse: collapse; background: #fff !important; }
  th, td { background: #fff !important; color: #0f172a !important; }
  .print-header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 16px 20px; border-bottom: 2px solid #1e293b;
    margin-bottom: 16px;
  }
  .print-header-logo img { max-height: 72px; max-width: 120px; object-fit: contain; }
  .print-header-text { text-align: right; flex: 1; }
  .print-header-text .name-ar { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; }
  .print-header-text .name-en { font-size: 16px; font-weight: 900; color: #334155; margin: 4px 0 0; letter-spacing: 0.02em; }
  .print-header-date { font-size: 11px; color: #64748b; margin-top: 6px; }
  .print-body { padding: 0 20px 12px; }
  .print-footer {
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: 20px; padding: 14px 20px; border-top: 2px solid #1e293b;
    margin-top: 24px; font-size: 11px; color: #334155;
  }
  .print-footer-right { text-align: right; flex: 1; }
  .print-footer-left { text-align: left; direction: ltr; flex: 1; }
  .print-footer-line { margin: 3px 0; }
  .print-attach-center {
    display: flex; justify-content: center; align-items: center;
    margin: 20px auto; page-break-inside: avoid;
    max-width: 100%;
  }
  .print-attach-center img {
    max-width: 90%; max-height: 420px; object-fit: contain;
    border: 1px solid #cbd5e1; border-radius: 8px;
  }
  .print-barcode { margin-top: 8px; }
  .print-barcode img { max-height: 64px; }
  @media print {
    html, body { background: #fff !important; color: #000 !important; }
  }
`;

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildAttachmentPrintHtml(fileData) {
  if (!fileData) return '';
  if (fileData.startsWith('data:image')) {
    return `<div class="print-attach-center"><img src="${fileData}" alt="" /></div>`;
  }
  if (fileData.includes('application/pdf') || fileData.startsWith('data:application/pdf')) {
    return `<div class="print-attach-center"><embed src="${fileData}" type="application/pdf" style="width:90%;height:480px;border:1px solid #cbd5e1;" /></div>`;
  }
  return '';
}

function buildPrintHeader(meta) {
  const dateStr = new Date().toLocaleDateString('ar-SA');
  const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="print-header">
      <div class="print-header-logo">
        ${meta.logo ? `<img src="${meta.logo}" alt="" />` : '<div style="font-size:2.5rem;">🏥</div>'}
      </div>
      <div class="print-header-text">
        <p class="name-ar">${esc(meta.nameAr || 'المركز')}</p>
        ${meta.nameEn ? `<p class="name-en">${esc(meta.nameEn)}</p>` : ''}
        <p class="print-header-date">📅 ${dateStr} · ⏰ ${timeStr}</p>
      </div>
    </div>
  `;
}

function buildPrintFooter(meta) {
  const phoneFull = [meta.phoneCode, meta.phone].filter(Boolean).join(' ').trim();
  const ig = meta.instagram ? (meta.instagram.startsWith('@') ? meta.instagram : `@${meta.instagram}`) : '';
  return `
    <div class="print-footer">
      <div class="print-footer-right">
        ${meta.address ? `<div class="print-footer-line"><b>العنوان:</b> ${esc(meta.address)}</div>` : ''}
      </div>
      <div class="print-footer-left">
        ${phoneFull ? `<div class="print-footer-line">📞 ${esc(phoneFull)}</div>` : ''}
        ${meta.website ? `<div class="print-footer-line">🌐 ${esc(meta.website)}</div>` : ''}
        ${meta.whatsapp ? `<div class="print-footer-line">💬 WhatsApp: ${esc(meta.whatsapp)}</div>` : ''}
        ${ig ? `<div class="print-footer-line">📷 Instagram: ${esc(ig)}</div>` : ''}
        ${meta.barcode ? `<div class="print-barcode"><img src="${meta.barcode}" alt="" /></div>` : ''}
      </div>
    </div>
  `;
}

function wrapPrintDocument(meta, bodyHtml, attachmentData) {
  const attach = buildAttachmentPrintHtml(attachmentData || '');
  return `
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${esc(meta.nameAr)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
        <style>${PRINT_CSS}</style>
      </head>
      <body>
        ${buildPrintHeader(meta)}
        <div class="print-body">${bodyHtml}${attach}</div>
        ${buildPrintFooter(meta)}
      </body>
    </html>
  `;
}

export function printItem(itemData, itemType, centerLogo, centerName) {
  const printWindow = window.open('', '', 'height=700,width=900');
  const meta = getCenterPrintMeta({ logo: centerLogo, name: centerName });
  const attach = itemData.fileData || itemData.attachmentData || itemData.logo || (itemType === 'activity' ? itemData.image : null);

  let contentHTML = '';

  if (itemType === 'partnership') {
    contentHTML = `
      <h2 style="color:#1a56db;margin:0 0 15px 0;">🤝 بيانات الشراكة</h2>
      <table>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>اسم الشراكة</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.name)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>النوع</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.type)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>جهة الاتصال</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.contact)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>الهاتف</b></td><td style="padding:8px;border:1px solid #ddd;direction:ltr;text-align:left;">${esc(itemData.phone || '—')}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>الإيميل</b></td><td style="padding:8px;border:1px solid #ddd;direction:ltr;text-align:left;">${esc(itemData.email || '—')}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>تاريخ البدء</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.startDate || '—')}</td></tr>
      </table>
      ${itemData.notes ? `<div style="margin-top:12px;padding:10px;background:#fffbeb;border-right:4px solid #f59e0b;">${esc(itemData.notes)}</div>` : ''}
    `;
  } else if (itemType === 'activity') {
    contentHTML = `
      <h2 style="color:#059669;margin:0 0 15px 0;">🎯 بيانات الفعالية</h2>
      <table>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>اسم الفعالية</b></td><td style="padding:8px;border:1px solid #ddd;"><b>${esc(itemData.name)}</b></td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>التاريخ</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.date)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>المشاركون</b></td><td style="padding:8px;border:1px solid #ddd;">${(itemData.participantIds || []).length} طالب</td></tr>
      </table>
      ${itemData.notes ? `<div style="margin-top:12px;">${esc(itemData.notes).replace(/\n/g, '<br/>')}</div>` : ''}
    `;
  } else if (itemType === 'finance') {
    contentHTML = `
      <h2 style="color:#dc2626;margin:0 0 15px 0;">💰 معاملة مالية</h2>
      <table>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>النوع</b></td><td style="padding:8px;border:1px solid #ddd;">${itemData.type === 'income' ? 'إيراد' : 'مصروف'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>الوصف</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.desc)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>الفئة</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.categoryLabel || itemData.cat)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>المبلغ</b></td><td style="padding:8px;border:1px solid #ddd;"><b>${Number(itemData.amount).toLocaleString('ar-SA')} ${meta.currency || 'ر.س'}</b></td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>التاريخ</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.date)}</td></tr>
      </table>
      ${itemData.notes ? `<div style="margin-top:12px;">${esc(itemData.notes)}</div>` : ''}
    `;
  } else if (itemType === 'warning') {
    contentHTML = `
      <h2 style="color:#dc2626;">⚠️ إنذار رسمي</h2>
      <table>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>الموجه إليه</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.recipient)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>التاريخ</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.date)}</td></tr>
        <tr><td colspan="2" style="padding:8px;border:1px solid #ddd;"><b>السبب:</b><br/>${esc(itemData.reason).replace(/\n/g, '<br/>')}</td></tr>
      </table>
    `;
  } else if (itemType === 'document') {
    contentHTML = `
      <h2 style="color:#1a56db;">📄 ${esc(itemData.name)}</h2>
      <p>${esc(itemData.notes || '')}</p>
    `;
  } else if (itemType === 'visit') {
    contentHTML = `
      <h2>🏛️ ${esc(itemData.name)}</h2>
      <table>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>التاريخ</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.date)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>الغرض</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.purpose)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>النتيجة</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.result)}</td></tr>
      </table>
    `;
  } else if (itemType === 'custody') {
    contentHTML = `
      <h2>🗄️ عهدة: ${esc(itemData.name)}</h2>
      <table>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>الفئة</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.category)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>الكمية</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.quantity)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;"><b>الموقع</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(itemData.location)}</td></tr>
      </table>
    `;
  } else if (itemType === 'generic') {
    contentHTML = itemData.html || `<p>${esc(itemData.text || '')}</p>`;
  } else {
    contentHTML = `<pre style="white-space:pre-wrap;">${esc(JSON.stringify(itemData, null, 2))}</pre>`;
  }

  const html = wrapPrintDocument(meta, contentHTML, attach);
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 400);
}

/** طباعة محتوى الصفحة الحالية بدون تأثر الوضع الليلي */
export function printHtmlContent(title, bodyHtml, attachmentData) {
  const meta = getCenterPrintMeta();
  const w = window.open('', '', 'height=700,width=900');
  w.document.write(wrapPrintDocument({ ...meta, nameAr: title || meta.nameAr }, bodyHtml, attachmentData));
  w.document.close();
  setTimeout(() => w.print(), 400);
}
