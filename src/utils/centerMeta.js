/** قراءة/حفظ بيانات المركز للطباعة والإعدادات */
export function getCenterPrintMeta(extra = {}) {
  const social = (() => {
    try { return JSON.parse(localStorage.getItem('scs_center_social') || '{}'); }
    catch { return {}; }
  })();
  const shifts = (() => {
    try { return JSON.parse(localStorage.getItem('scs_center_shifts') || '{}'); }
    catch { return {}; }
  })();

  return {
    nameAr: extra.name || localStorage.getItem('scs_center_name') || '',
    nameEn: extra.nameEn || localStorage.getItem('scs_center_name_en') || '',
    logo: extra.logo || localStorage.getItem('scs_center_logo') || '',
    address: extra.address || localStorage.getItem('scs_center_address') || '',
    phone: extra.phone || localStorage.getItem('scs_center_phone') || '',
    phoneCode: extra.phoneCode || localStorage.getItem('scs_center_phone_code') || '+966',
    email: extra.email || localStorage.getItem('scs_center_email') || '',
    website: extra.website || social.website || localStorage.getItem('scs_center_website') || '',
    whatsapp: extra.whatsapp || social.whatsapp || localStorage.getItem('scs_center_whatsapp') || '',
    instagram: extra.instagram || social.instagram || localStorage.getItem('scs_center_instagram') || '',
    currency: extra.currency || localStorage.getItem('scs_center_currency') || 'SAR',
    barcode: extra.barcode || localStorage.getItem('scs_center_barcode') || '',
    shifts,
    social,
  };
}

export function persistCenterMeta(data) {
  if (data.name != null) localStorage.setItem('scs_center_name', data.name);
  if (data.nameEn != null) localStorage.setItem('scs_center_name_en', data.nameEn);
  if (data.logo != null) localStorage.setItem('scs_center_logo', data.logo);
  if (data.address != null) localStorage.setItem('scs_center_address', data.address);
  if (data.phone != null) localStorage.setItem('scs_center_phone', data.phone);
  if (data.phoneCode != null) localStorage.setItem('scs_center_phone_code', data.phoneCode);
  if (data.email != null) localStorage.setItem('scs_center_email', data.email);
  if (data.currency != null) localStorage.setItem('scs_center_currency', data.currency);
  if (data.barcode != null) localStorage.setItem('scs_center_barcode', data.barcode);
  if (data.website != null) localStorage.setItem('scs_center_website', data.website);
  if (data.socialLinks || data.social) {
    const s = data.socialLinks || data.social || {};
    localStorage.setItem('scs_center_social', JSON.stringify(s));
    if (s.website) localStorage.setItem('scs_center_website', s.website);
    if (s.whatsapp) localStorage.setItem('scs_center_whatsapp', s.whatsapp);
    if (s.instagram) localStorage.setItem('scs_center_instagram', s.instagram);
  }
  if (data.shifts) localStorage.setItem('scs_center_shifts', JSON.stringify(data.shifts));
}
