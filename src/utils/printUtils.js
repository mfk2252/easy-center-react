export function printItem(itemData, itemType, centerLogo, centerName) {
  const printWindow = window.open('', '', 'height=600,width=900');
  
  // شعار المركز والعنوان
  const headerHTML = `
    <div style="text-align:center;padding:20px;border-bottom:2px solid #333;margin-bottom:20px;">
      ${centerLogo ? `<img src="${centerLogo}" style="height:70px;margin-bottom:10px;border-radius:8px;object-fit:contain;">` : '<div style="font-size:3rem;margin-bottom:10px;">🏥</div>'}
      <h1 style="margin:0;font-size:28px;color:#0f172a;font-weight:900;">${centerName}</h1>
      <p style="margin:8px 0;color:#666;font-size:13px;">📅 ${new Date().toLocaleDateString('ar-SA')} | ⏰ ${new Date().toLocaleTimeString('ar-SA')}</p>
    </div>
  `;

  // محتوى البند حسب النوع
  let contentHTML = '';
  
  if (itemType === 'partnership') {
    contentHTML = `
      <div style="padding:0 20px;">
        <h2 style="color:#1a56db;margin:0 0 15px 0;">🤝 بيانات الشراكة</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#f5f5f5;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>اسم الشراكة</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.name}</td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>النوع</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.type}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>جهة الاتصال</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.contact}</td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>الهاتف</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;direction:ltr;${itemData.phone?'':'color:#999;'}">${itemData.phone || '—'}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>الإيميل</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;direction:ltr;${itemData.email?'':'color:#999;'}">${itemData.email || '—'}</td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>تاريخ البدء</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.startDate || '—'}</td>
          </tr>
        </table>
        ${itemData.notes ? `
          <div style="margin-top:15px;padding:12px;background:#fffbeb;border-right:4px solid #f59e0b;border-radius:4px;">
            <b style="color:#d97706;">📝 ملاحظات:</b><br/>
            ${itemData.notes}
          </div>
        ` : ''}
      </div>
    `;
  } else if (itemType === 'activity') {
    contentHTML = `
      <div style="padding:0 20px;">
        <h2 style="color:#059669;margin:0 0 15px 0;">🎯 بيانات الفعالية</h2>
        ${itemData.image ? `<img src="${itemData.image}" style="width:100%;max-height:300px;object-fit:cover;margin:15px 0;border-radius:8px;border:1px solid #ddd;">` : ''}
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#f5f5f5;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>اسم الفعالية</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;"><b>${itemData.name}</b></td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>التاريخ</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.date}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>العام الدراسي</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.year}</td>
          </tr>
          ${itemData.section ? `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>القسم</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.section}</td>
          </tr>
          ` : ''}
          <tr style="background:#f5f5f5;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>عدد المشاركين</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;"><b>${(itemData.participantIds||[]).length} طالب</b></td>
          </tr>
        </table>
        ${itemData.notes ? `
          <div style="margin-top:15px;padding:12px;background:#dbeafe;border-right:4px solid #0284c7;border-radius:4px;">
            <b style="color:#0284c7;">📝 ملاحظات:</b><br/>
            ${itemData.notes.replace(/\n/g, '<br/>')}
          </div>
        ` : ''}
        ${itemData.fileName ? `
          <div style="margin-top:10px;padding:10px;background:#f0fdf4;border-radius:4px;color:#15803d;">
            📎 <b>مرفق:</b> ${itemData.fileName}
          </div>
        ` : ''}
      </div>
    `;
  } else if (itemType === 'finance') {
    contentHTML = `
      <div style="padding:0 20px;">
        <h2 style="color:#dc2626;margin:0 0 15px 0;">💰 بيانات معاملة مالية</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#f5f5f5;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>النوع</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;"><b>${itemData.type === 'income' ? '📈 إيراد' : '📉 مصروف'}</b></td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>الوصف</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.desc}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>الفئة</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.cat}</td>
          </tr>
          <tr style="background:${itemData.type === 'income' ? '#dcfce7' : '#fee2e2'};">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b style="font-size:16px;">المبلغ</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;"><b style="font-size:18px;color:${itemData.type === 'income' ? '#15803d' : '#dc2626'};">${itemData.amount.toLocaleString('ar-SA')} ريال</b></td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>التاريخ</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.date}</td>
          </tr>
        </table>
        ${itemData.notes ? `
          <div style="margin-top:15px;padding:12px;background:#fef3c7;border-right:4px solid #f59e0b;border-radius:4px;">
            <b style="color:#d97706;">📝 ملاحظات:</b><br/>
            ${itemData.notes}
          </div>
        ` : ''}
      </div>
    `;
  } else if (itemType === 'warning') {
    contentHTML = `
      <div style="padding:0 20px;">
        <h2 style="color:#dc2626;margin:0 0 15px 0;">⚠️ إنذار رسمي</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#fee2e2;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>الموجه إليه</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;"><b>${itemData.recipient}</b></td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>نوع الإنذار</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.type === 'warning' ? '⚠️ إنذار' : itemData.type === 'suspension' ? '🚫 إيقاف' : '❌ إنهاء'}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:10px;border-bottom:1px solid #ddd;"><b>التاريخ</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd;text-align:left;">${itemData.date}</td>
          </tr>
          <tr style="background:#fef3c7;">
            <td colspan="2" style="padding:10px;border-bottom:1px solid #ddd;"><b>السبب:</b></td>
          </tr>
          <tr>
            <td colspan="2" style="padding:10px;border-bottom:1px solid #ddd;line-height:1.8;">${itemData.reason.replace(/\n/g, '<br/')}</td>
          </tr>
        </table>
        ${itemData.notes ? `
          <div style="margin-top:15px;padding:12px;background:#fffbeb;border-right:4px solid #f59e0b;border-radius:4px;">
            <b style="color:#d97706;">📝 ملاحظات إضافية:</b><br/>
            ${itemData.notes.replace(/\n/g, '<br/')}
          </div>
        ` : ''}
        <div style="margin-top:40px;text-align:center;border-top:2px solid #ddd;padding-top:20px;">
          <p style="margin:20px 0;font-size:14px;color:#666;">توقيع مسؤول المركز</p>
          <div style="width:200px;height:60px;border:1px dashed #ddd;margin:0 auto;"></div>
        </div>
      </div>
    `;
  }

  const htmlContent = `
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة</title>
        <style>
          body { 
            font-family: 'Tajawal', 'Arial', sans-serif; 
            margin:0; 
            padding:20px; 
            background:#f5f5f5;
            color:#0f172a;
            line-height:1.6;
          }
          table { background:white; }
          @media print { 
            body { background:white; padding:0; }
            .no-print { display:none !important; }
          }
        </style>
      </head>
      <body>
        ${headerHTML}
        ${contentHTML}
        <div style="margin-top:50px;text-align:center;color:#999;font-size:11px;border-top:1px solid #eee;padding-top:20px;">
          تم طباعة هذا البند بنجاح من نظام إدارة المركز المتكامل — ${new Date().getFullYear()}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
