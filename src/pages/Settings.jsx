import { useState, useEffect } from 'react';
import { useApp, FONT_OPTIONS, applyFontFamily, applyFontVariables, applyFontSettings } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel, refreshAllSystemData, getCenterId } from '../hooks/useStorage';
import { uid, todayStr } from '../utils/dateHelpers';
import { ROLES, ARAB_CURRENCIES } from '../utils/constants';
import { updateCenterSettings, getCenterUsers, getCenterSettings } from '../firebase/db';
import { createStaffAccount, checkSubscriptionStatus, isPlatformAdminEmail } from '../firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLang } from '../context/LanguageContext';
import { handleFileInputChange, FILE_ACCEPT_IMAGE } from '../utils/fileUpload';
import { getRoleLabel, getUserPermissionLabels, getCurrentUsername } from '../utils/userLabels';

const PRESET_COLORS=['#1a56db','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];
const ROLE_OPTIONS=[['manager','مدير'],['vice','نائب المدير'],['specialist_speech','أخصائي تخاطب'],['specialist_physio','أخصائي علاج فيزيائي'],['specialist_behavior','أخصائي تعديل سلوك'],['specialist_occupational','أخصائي علاج وظيفي'],['specialist','أخصائي عام'],['reception','استقبال'],['admin','إداري'],['technician','فني النظام'],['parent','ولي أمر']];

const PERMISSIONS = [
  {key:'dash',name:'الرئيسية',icon:'📊'},
  {key:'students',name:'الطلاب',icon:'👦'},
  {key:'hr',name:'الموظفون',icon:'👥'},
  {key:'finance',name:'المالية',icon:'💳'},
  {key:'reports',name:'التقارير',icon:'📊'},
  {key:'settings',name:'الإعدادات',icon:'⚙️'},
  {key:'docs',name:'الوثائق',icon:'📄'},
  {key:'parents',name:'أولياء الأمور',icon:'👨‍👩‍👧'},
  {key:'partnerships',name:'الشراكات',icon:'🤝'},
  {key:'visits',name:'الزيارات',icon:'🏛️'},
  {key:'calendar',name:'التقويم',icon:'📅'},
];

const EMPTY_USER_FORM = { username:'', password:'', name:'', contactEmail:'', role:'specialist', title:'', studentId:'', phone:'', permissions:{} };

// دالة مساعدة لتنسيق التاريخ
const formatDate = (val) => {
  if (!val) return '—';
  try {
    let date;
    if (val?.toDate && typeof val.toDate === 'function') {
      date = val.toDate();
    } else if (val?.seconds) {
      date = new Date(val.seconds * 1000);
    } else if (val instanceof Date) {
      date = val;
    } else {
      date = new Date(val);
    }
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return '—';
  }
};

export default function Settings() {
  const { center, currentUser, persistConfig, updateCenterColor, toast, loadCenterData, subscriptionStatus } = useApp();
  const { t } = useLang();
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('scs_fontsize')) || 15);
  const [fontWeight, setFontWeight] = useState(() => localStorage.getItem('scs_fontweight') || '600');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('scs_fontfamily') || center.fontFamily || 'arabicui');
  const [tab, setTab] = useState('center');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [savingUser, setSavingUser] = useState(false);
  const [stuList, setStuList] = useState([]);
  const [centerForm, setCenterForm] = useState({
    name: center.name || '',
    nameEn: center.nameEn || localStorage.getItem('scs_center_name_en') || '',
    type: center.type || '',
    phone: center.phone || '',
    phoneCode: center.phoneCode || localStorage.getItem('scs_center_phone_code') || '+966',
    email: center.email || '',
    address: center.address || localStorage.getItem('scs_center_address') || '',
    logo: center.logo || '',
    currency: center.currency || 'SAR',
    website: center.website || '',
    whatsapp: center.whatsapp || '',
    instagram: center.instagram || '',
    barcode: center.barcode || '',
    morningFrom: center.shifts?.morning?.from || '07:00',
    morningTo: center.shifts?.morning?.to || '12:00',
    eveningFrom: center.shifts?.evening?.from || '16:00',
    eveningTo: center.shifts?.evening?.to || '20:00',
  });
  const [selColor, setSelColor] = useState(center.color||'#1a56db');
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [savingCenter, setSavingCenter] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);

  const isManager = currentUser?.role === 'manager';
  const centerId = currentUser?.centerId || currentUser?.uid || getCenterId();
  const [liveSub, setLiveSub] = useState(null);

  useEffect(() => {
    async function fetchLiveSubscription() {
      if (!centerId) return;
      try {
        const cData = await getCenterSettings(centerId);
        if (cData) {
          const status = checkSubscriptionStatus(cData);
          setLiveSub(status);
        }
      } catch (e) {
        console.warn('Failed to fetch live sub:', e);
      }
    }
    fetchLiveSubscription();
  }, [centerId]);

  // استخراج بيانات الاشتراك من المصادر المتاحة
  const sub = liveSub || subscriptionStatus || currentUser?.subscription || (center?.subscription ? checkSubscriptionStatus(center) : null) || {};
  const isPlatformAdmin = isPlatformAdminEmail(currentUser?.email) || sub?.reason === 'platform_admin' || sub?.reason === 'super_admin';
  const isPermanent = sub?.isPermanent || isPlatformAdmin;
  const isTrial = sub?.reason === 'trial' || sub?.status === 'trial';
  const isActiveSub = isPlatformAdmin || sub?.reason === 'active' || sub?.status === 'active' || isTrial;

  const daysLeft = isPermanent ? 9999 : (typeof sub?.daysLeft === 'number'
    ? sub.daysLeft
    : (sub?.trialExpiry || sub?.expiryDate)
      ? Math.max(0, Math.ceil((new Date(sub.trialExpiry || sub.expiryDate) - new Date()) / 86400000))
      : (isTrial ? 5 : 0));

  const activationDateStr = isPlatformAdmin
    ? 'حساب دائم (مالك المنصة)'
    : formatDate(sub?.activatedAt || sub?.createdAt || center?.createdAt || new Date());

  const expiryDateStr = isPermanent
    ? 'غير محدد (اشتراك دائم ♾️)'
    : (sub?.expiryDate || sub?.trialExpiry)
      ? formatDate(sub.expiryDate || sub.trialExpiry)
      : daysLeft > 0
        ? `خلال ${daysLeft} يوم`
        : 'منتهي الصلاحية';

  const durationStr = isPermanent
    ? 'دائم ♾️'
    : sub?.months
      ? `${sub.months} شهر`
      : isTrial
        ? 'فترة تجريبية (5 أيام)'
        : 'اشتراك سنوي';

  const statusLabel = isPlatformAdmin
    ? 'مالك المنصة 👑'
    : (sub?.status === 'active' || sub?.reason === 'active')
      ? 'نشط ومفعّل ✅'
      : isTrial
        ? 'تجريبي نشط ⏳'
        : sub?.status === 'suspended'
          ? 'موقوف مؤقتاً 🔒'
          : (!sub?.allowed || sub?.status === 'expired' || sub?.reason === 'expired' || sub?.reason === 'trial_expired')
            ? 'منتهي الصلاحية ❌'
            : 'نشط ✅';

  useEffect(() => {
    reloadUsers();
    setStuList(lsGet('students'));
  }, []);

  async function reloadUsers() {
    if (!centerId) return;
    setUsersLoading(true);
    try {
      const fbUsers = await getCenterUsers(centerId);
      setUsers(fbUsers);
    } catch(e) {
      toast('⚠️ تعذّر تحميل قائمة المستخدمين', 'er');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }

  const fldU = k => e => setUserForm(f=>({...f,[k]:e.target.value}));

  function openNewUserForm() {
    setUserForm({ ...EMPTY_USER_FORM });
    setEditUserId(null);
    setShowUserForm(true);
  }

  function openEditUserForm(u) {
    setUserForm({
      username: u.username || '',
      password: '', 
      name: u.name || '',
      contactEmail: u.contactEmail || '',
      role: u.role || 'specialist',
      title: u.title || '',
      studentId: u.studentId || '',
      phone: u.phone || '',
      permissions: u.permissions || {},
    });
    setEditUserId(u.id); 
    setShowUserForm(true);
  }

  async function saveUser() {
    if (!userForm.name.trim()) { toast('⚠️ أدخل الاسم الكامل', 'er'); return; }
    if (userForm.role === 'parent' && !userForm.studentId) { toast('⚠️ اختر الطالب المرتبط بولي الأمر', 'er'); return; }

    setSavingUser(true);
    try {
      if (editUserId) {
        await updateDoc(doc(db, 'users', editUserId), {
          name: userForm.name,
          role: userForm.role,
          permissions: userForm.permissions || {},
          title: userForm.title,
          studentId: userForm.studentId,
          phone: userForm.phone,
          contactEmail: userForm.contactEmail,
        });
        toast('✅ تم تحديث بيانات الحساب', 'ok');
      } else {
        if (!userForm.username.trim()) { toast('⚠️ أدخل اسم مستخدم', 'er'); setSavingUser(false); return; }
        if (!userForm.password || userForm.password.length < 6) { toast('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'er'); setSavingUser(false); return; }

        await createStaffAccount(centerId, {
          username: userForm.username,
          password: userForm.password,
          name: userForm.name,
          role: userForm.role,
          permissions: userForm.permissions || {},
          title: userForm.title,
          studentId: userForm.studentId,
          phone: userForm.phone,
          contactEmail: userForm.contactEmail,
        });
        toast('✅ تم إنشاء الحساب بنجاح', 'ok');
      }
      setShowUserForm(false);
      setEditUserId(null);
      setUserForm({ ...EMPTY_USER_FORM });
      reloadUsers();
    } catch(e) {
      toast('❌ ' + (e.message || 'حدث خطأ غير متوقع'), 'er');
    } finally {
      setSavingUser(false);
    }
  }

  async function toggleUserActive(u) {
    try {
      await updateDoc(doc(db, 'users', u.id), { active: !(u.active !== false) });
      toast(u.active === false ? '✅ تم تفعيل الحساب' : '⏸️ تم تعطيل الحساب', 'ok');
      reloadUsers();
    } catch(e) {
      toast('❌ تعذّر تغيير حالة الحساب', 'er');
    }
  }

  async function delUser(u) {
    if (!window.confirm(`حذف حساب "${u.name}" نهائياً؟ لن يستطيع تسجيل الدخول بعد الآن.`)) return;
    try {
      await deleteDoc(doc(db, 'users', u.id));
      if (u.username) {
        try { await deleteDoc(doc(db, 'staffLoginIndex', u.username)); } catch(_) {}
      }
      toast('🗑️ تم حذف الحساب', 'ok');
      reloadUsers();
    } catch(e) {
      toast('❌ تعذّر حذف الحساب', 'er');
    }
  }

  const currentPerms = getUserPermissionLabels(currentUser);
  const currentUsername = getCurrentUsername(currentUser);

  async function handleRefreshAll() {
    if (!centerId) { toast('⚠️ سجّل دخولك أولاً', 'er'); return; }
    setRefreshLoading(true);
    toast('🔄 جارٍ تحديث النظام...', 'ok');
    try {
      const centerData = await refreshAllSystemData(centerId);
      if (centerData) loadCenterData(centerId);
      toast('✅ تم التحديث! سيتم إعادة تحميل النظام...', 'ok');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      toast('❌ تعذّر التحديث — تحقق من الاتصال', 'er');
    } finally {
      setRefreshLoading(false);
    }
  }

  async function saveCenter() {
    if (!centerForm.name?.trim()) { toast('⚠️ أدخل اسم المركز بالعربية','er'); return; }
    if (!centerForm.nameEn?.trim()) { toast('⚠️ أدخل اسم المركز بالإنجليزية','er'); return; }
    setSavingCenter(true);
    const shifts = {
      morning: { from: centerForm.morningFrom, to: centerForm.morningTo },
      evening: { from: centerForm.eveningFrom, to: centerForm.eveningTo },
    };
    const socialLinks = { website: centerForm.website, whatsapp: centerForm.whatsapp, instagram: centerForm.instagram };
    const updated = { ...center, ...centerForm, shifts, socialLinks, configured: true };
    try {
      if (centerId) {
        await updateCenterSettings(centerId, {
          centerName: centerForm.name.trim(),
          name: centerForm.name.trim(),
          nameEn: centerForm.nameEn.trim(),
          type: centerForm.type,
          phone: centerForm.phone,
          phoneCode: centerForm.phoneCode,
          email: centerForm.email,
          address: centerForm.address,
          logo: centerForm.logo,
          currency: centerForm.currency,
          socialLinks,
          shifts,
          barcode: centerForm.barcode,
          isSetup: true,
          setupCompleted: true,
          status: 'active',
        });
      }
      persistConfig(updated);
      toast('✅ تم حفظ بيانات المركز بنجاح','ok');
    } catch(e) {
      toast('❌ خطأ في حفظ بيانات المركز','er');
    } finally {
      setSavingCenter(false);
    }
  }

  async function handleBarcode(e) {
    try {
      const res = await handleFileInputChange(e, { imagesOnly: true });
      if (res) setCenterForm(f => ({ ...f, barcode: res.data }));
    } catch (ex) {
      toast('⚠️ ' + t(ex.i18nKey || 'file.invalidType'), 'er');
    }
  }

  async function handleCenterLogo(e) {
    try {
      const res = await handleFileInputChange(e, { imagesOnly: true });
      if (res) setCenterForm(prev => ({ ...prev, logo: res.data }));
    } catch (ex) {
      toast('⚠️ ' + t(ex.i18nKey || 'file.invalidType'), 'er');
    }
  }

  function applyActiveFontSettings(size, weight, family) {
    const activeFamily = family || fontFamily;
    applyFontVariables(size, weight);
    if (activeFamily) {
      applyFontFamily(activeFamily);
    }
  }

  async function saveAppearance() {
    setSavingAppearance(true);
    try {
      applyActiveFontSettings(fontSize, fontWeight, fontFamily);
      updateCenterColor(selColor);
      localStorage.setItem('scs_fontsize', String(fontSize));
      localStorage.setItem('scs_fontweight', String(fontWeight));
      localStorage.setItem('scs_fontfamily', fontFamily);
      localStorage.setItem('scs_color', selColor);

      if (centerId) {
        await updateCenterSettings(centerId, {
          fontSize,
          fontWeight,
          fontFamily,
          color: selColor,
        }).catch((err) => console.warn('Could not save to remote center settings:', err));
      }
      persistConfig({ ...center, color: selColor, fontSize, fontWeight, fontFamily });
      toast('✅ تم حفظ وتطبيق إعدادات المظهر بنجاح', 'ok');
    } catch (e) {
      console.error('Error saving appearance:', e);
      toast('❌ تعذّر حفظ إعدادات المظهر', 'er');
    } finally {
      setSavingAppearance(false);
    }
  }

  const ALL_BACKUP_KEYS = [
    'students', 'employees', 'sessions', 'leaves', 'salaries', 'attEmp', 'attStu',
    'appointments', 'iepGoals', 'calEvents', 'income', 'expenses', 'notifs',
    'studentFees', 'payments', 'warnings', 'progPrograms', 'progReports',
    'progEvaluations', 'measurements', 'measureItems', 'studentAssessments',
    'behaviorPlans', 'stuReports', 'progGoalsBank'
  ];

  function exportData() {
    const data = {};
    ALL_BACKUP_KEYS.forEach(k => { data[k] = lsGet(k); });
    data.centerName = center.name;
    data.exportDate = new Date().toISOString();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${center.name || 'center'}_${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('✅ تم تصدير النسخة الاحتياطية الشاملة', 'ok');
  }

  function importData(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        ALL_BACKUP_KEYS.forEach(k => {
          if (data[k]) localStorage.setItem(`${centerId}_${k}`, JSON.stringify(data[k]));
        });
        toast('✅ تم استيراد البيانات بنجاح - أعد تحميل الصفحة', 'ok');
      } catch (err) {
        toast('❌ خطأ في تنسيق ملف النسخة الاحتياطية', 'er');
      }
    };
    r.readAsText(f);
  }

  const TABS = [
    ['center','🏥 بيانات المركز'],
    ['appearance','🎨 المظهر'],
    ['users','👥 المستخدمون'],
    ['backup','💾 النسخ الاحتياطي'],
    ['about','ℹ️ عن النظام'],
  ];

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>⚙️ الإعدادات</h2>
          <p>إدارة النظام والمستخدمين</p>
        </div>
      </div>

      <div className="tabs" style={{flexWrap:'wrap',marginBottom:20}}>
        {TABS.map(([v,l])=>(
          <button key={v} type="button" className={`tab ${tab===v?'on':''}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {/* بيانات المركز */}
      {tab==='center' && (
        <div className="wg">
          <div className="wg-h"><h3>🏥 بيانات المركز</h3></div>
          <div className="wg-b">
            <div className="fg c2">
              <div className="fl"><label>اسم المركز (عربي) <span className="req">*</span></label><input value={centerForm.name} onChange={e=>setCenterForm(f=>({...f,name:e.target.value}))}/></div>
              <div className="fl"><label>اسم المركز (English) <span className="req">*</span></label><input value={centerForm.nameEn} onChange={e=>setCenterForm(f=>({...f,nameEn:e.target.value}))} dir="ltr"/></div>
              <div className="fl"><label>نوع المركز</label>
                <select value={centerForm.type} onChange={e=>setCenterForm(f=>({...f,type:e.target.value}))}>
                  <option value="">اختر</option>
                  {['تربية خاصة','تأهيل','تخاطب','توحد','صعوبات تعلم','متعدد التخصصات'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="fl"><label>العملة</label>
                <select value={centerForm.currency} onChange={e=>setCenterForm(f=>({...f,currency:e.target.value}))}>
                  {ARAB_CURRENCIES.map(c=>(
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="fl"><label>كود الدولة</label><input value={centerForm.phoneCode} onChange={e=>setCenterForm(f=>({...f,phoneCode:e.target.value}))} dir="ltr" placeholder="+966"/></div>
              <div className="fl"><label>الهاتف الأساسي</label><input type="tel" value={centerForm.phone} onChange={e=>setCenterForm(f=>({...f,phone:e.target.value}))} dir="ltr"/></div>
              <div className="fl"><label>البريد</label><input type="email" value={centerForm.email} onChange={e=>setCenterForm(f=>({...f,email:e.target.value}))} dir="ltr"/></div>
              <div className="fl full"><label>العنوان</label><textarea value={centerForm.address} onChange={e=>setCenterForm(f=>({...f,address:e.target.value}))} rows={2}/></div>
              <div className="fl"><label>الموقع / صفحة التواصل</label><input value={centerForm.website} onChange={e=>setCenterForm(f=>({...f,website:e.target.value}))} dir="ltr" placeholder="https://"/></div>
              <div className="fl"><label>واتساب المركز</label><input value={centerForm.whatsapp} onChange={e=>setCenterForm(f=>({...f,whatsapp:e.target.value}))} dir="ltr"/></div>
              <div className="fl"><label>إنستجرام</label><input value={centerForm.instagram} onChange={e=>setCenterForm(f=>({...f,instagram:e.target.value}))} dir="ltr" placeholder="@center"/></div>
              <div className="fl full"><label>الفترة الصباحية</label>
                <div style={{display:'flex',gap:8}}>
                  <input type="time" value={centerForm.morningFrom} onChange={e=>setCenterForm(f=>({...f,morningFrom:e.target.value}))}/>
                  <span>—</span>
                  <input type="time" value={centerForm.morningTo} onChange={e=>setCenterForm(f=>({...f,morningTo:e.target.value}))}/>
                </div>
              </div>
              <div className="fl full"><label>الفترة المسائية</label>
                <div style={{display:'flex',gap:8}}>
                  <input type="time" value={centerForm.eveningFrom} onChange={e=>setCenterForm(f=>({...f,eveningFrom:e.target.value}))}/>
                  <span>—</span>
                  <input type="time" value={centerForm.eveningTo} onChange={e=>setCenterForm(f=>({...f,eveningTo:e.target.value}))}/>
                </div>
              </div>
              <div className="fl full">
                <label>الشعار</label>
                <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
                  {centerForm.logo ? <img src={centerForm.logo} alt="logo" style={{width:56,height:56,borderRadius:10,objectFit:'cover'}}/> : <div style={{width:56,height:56,borderRadius:10,background:'var(--g1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>🏥</div>}
                  <label className="btn btn-g" style={{cursor:'pointer'}}>📷 رفع شعار<input type="file" accept={FILE_ACCEPT_IMAGE} style={{display:'none'}} onChange={handleCenterLogo}/></label>
                  {centerForm.logo && <button type="button" className="btn btn-d" onClick={()=>setCenterForm(f=>({...f,logo:''}))}>🗑️</button>}
                </div>
              </div>
              <div className="fl full">
                <label>الباركود (يظهر في الطباعة)</label>
                <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
                  {centerForm.barcode && <img src={centerForm.barcode} alt="" style={{height:64}}/>}
                  <label className="btn btn-g" style={{cursor:'pointer'}}>📷 رفع باركود<input type="file" accept={FILE_ACCEPT_IMAGE} style={{display:'none'}} onChange={handleBarcode}/></label>
                </div>
              </div>
            </div>
            <button type="button" className="btn btn-p" style={{marginTop:16}} onClick={saveCenter} disabled={savingCenter}>
              {savingCenter ? '⏳ جارٍ الحفظ...' : '💾 حفظ بيانات المركز'}
            </button>
          </div>
        </div>
      )}

      {/* المظهر */}
      {tab==='appearance' && (
        <div className="wg">
          <div className="wg-h"><h3>🎨 {t('settings.appearance')}</h3></div>
          <div className="wg-b">
            {/* اختيار الخط المجهز */}
            <div style={{ marginBottom: 22, padding: '16px', background: 'var(--g0)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <label style={{ fontWeight: 800, display: 'block', marginBottom: 6, fontSize: '.95rem', color: 'var(--text-main)' }}>
                🔤 نوع الخط المعتمد للواجهة والتقارير
              </label>
              <p style={{ fontSize: '.82rem', color: 'var(--text-sub)', marginBottom: 12 }}>
                اختر الخط المفضل لمركزك، وسيتم تطبيقه فوراً على كافة صفحات النظام والمطبوعات
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
                {FONT_OPTIONS.map(f => {
                  const isSelected = fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setFontFamily(f.id);
                        applyActiveFontSettings(fontSize, fontWeight, f.id);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid var(--pr)' : '1.5px solid var(--border-color)',
                        background: isSelected ? 'var(--pr-l)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--pr-d)' : 'var(--text-main)',
                        textAlign: 'right',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        fontFamily: f.family,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isSelected ? 'var(--sh)' : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{f.name}</div>
                        <div style={{ fontSize: '.78rem', opacity: 0.8, marginTop: 2 }}>معاينة النص العربي 123</div>
                      </div>
                      {isSelected && <span style={{ color: 'var(--pr)', fontWeight: 900, fontSize: '1.1rem' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="fg c2" style={{ marginBottom: 20 }}>
              <div className="fl">
                <label>{t('settings.fontSize')}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-g btn-sm" onClick={() => { const n = Math.max(12, fontSize - 1); setFontSize(n); applyActiveFontSettings(n, fontWeight, fontFamily); }}>{t('settings.fontSmaller')}</button>
                  <span style={{ fontWeight: 700, minWidth: 48, textAlign: 'center' }}>{fontSize}px</span>
                  <button type="button" className="btn btn-g btn-sm" onClick={() => { const n = Math.min(22, fontSize + 1); setFontSize(n); applyActiveFontSettings(n, fontWeight, fontFamily); }}>{t('settings.fontLarger')}</button>
                </div>
              </div>
              <div className="fl">
                <label>{t('settings.fontWeight')}</label>
                <select value={fontWeight} onChange={e => { setFontWeight(e.target.value); applyActiveFontSettings(fontSize, e.target.value, fontFamily); }}>
                  <option value="400">{t('settings.fontNormal')} (400)</option>
                  <option value="600">متوسط (600)</option>
                  <option value="700">{t('settings.fontBold')} (700)</option>
                  <option value="900">عريض جداً (900)</option>
                </select>
              </div>
            </div>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>{t('settings.mainColor')}</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => { setSelColor(c); updateCenterColor(c); }} style={{
                  width: 38, height: 38, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  outline: selColor === c ? `3px solid ${c}` : 'none', outlineOffset: 2,
                  transform: selColor === c ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s',
                }}/>
              ))}
            </div>
            <button type="button" className="btn btn-p" onClick={saveAppearance} disabled={savingAppearance}>
              {savingAppearance ? '⏳ جارٍ الحفظ...' : '💾 حفظ إعدادات المظهر'}
            </button>
          </div>
        </div>
      )}

      {/* المستخدمون */}
      {tab==='users' && (
        <div>
          <div className="wg" style={{ marginBottom: 14 }}>
            <div className="wg-h"><h3>👤 المستخدم الحالي</h3></div>
            <div className="wg-b">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, fontSize: '.88rem' }}>
                <div><span style={{ color: 'var(--g5)' }}>الاسم:</span> <strong>{currentUser?.name || '—'}</strong></div>
                <div><span style={{ color: 'var(--g5)' }}>اسم المستخدم:</span> <strong dir="ltr">@{currentUsername}</strong></div>
                <div><span style={{ color: 'var(--g5)' }}>الصلاحية:</span> <strong>{getRoleLabel(currentUser?.role)}</strong></div>
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--g0)', borderRadius: 8, fontSize: '.82rem' }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>الأذونات المتاحة:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {currentPerms.map(p => (
                    <span key={p} className="bdg b-gr" style={{ fontSize: '.75rem' }}>{p}</span>
                  ))}
                </div>
              </div>
              
              {/* عرض فترة التجربة فقط إذا كانت نشطة */}
              {(subscriptionStatus || currentUser?.subscription)?.reason === 'trial' && (
                <div style={{ marginTop: 10, fontSize: '.82rem', color: 'var(--warn)' }}>
                  ⏳ فترة التجربة: متبقي <strong>{(subscriptionStatus || currentUser?.subscription)?.daysLeft ?? '—'}</strong> {(subscriptionStatus || currentUser?.subscription)?.daysLeft === 1 ? 'يوم' : 'أيام'}
                </div>
              )}
            </div>
          </div>

          {/* بطاقة معلومات الاشتراك - تظهر للمدير فقط */}
          {isManager && (
            <div className="wg" style={{ marginBottom: 14, border: '1px solid var(--pr)', background: 'var(--pr-l)' }}>
              <div className="wg-h" style={{ background: 'var(--pr)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#fff' }}>📋 حالة اشتراك المركز</h3>
                <span style={{ fontSize: '.8rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4 }}>
                  {isPermanent ? 'اشتراك غير محدود' : daysLeft > 0 ? `متبقي ${daysLeft} يوم` : 'منتهي'}
                </span>
              </div>
              <div className="wg-b">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '.8rem', color: 'var(--g6)', marginBottom: 4 }}>تاريخ بدء التفعيل</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{activationDateStr}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.8rem', color: 'var(--g6)', marginBottom: 4 }}>تاريخ انتهاء الصلاحية</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: (!isPermanent && daysLeft < 30) ? 'var(--warn)' : 'var(--ok)' }}>
                      {expiryDateStr}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.8rem', color: 'var(--g6)', marginBottom: 4 }}>مدة الاشتراك</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{durationStr}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.8rem', color: 'var(--g6)', marginBottom: 4 }}>الحالة الحالية</div>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: '.85rem',
                      fontWeight: 700,
                      background: isActiveSub ? 'var(--ok)' : 'var(--err)',
                      color: '#fff'
                    }}>
                      {statusLabel}
                    </div>
                  </div>
                  {!isPermanent && daysLeft > 0 && daysLeft <= 30 && (
                    <div style={{ gridColumn: '1 / -1', padding: '10px', background: 'var(--warn-l)', color: 'var(--warn)', borderRadius: 8, fontSize: '.9rem', fontWeight: 600 }}>
                      ⚠️ تنبيه: يتبقى {daysLeft} يوم على انتهاء الاشتراك. يرجى التواصل مع الإدارة للتجديد لتجنب انقطاع الخدمة.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            {isManager && <button className="btn btn-p" onClick={openNewUserForm}>➕ مستخدم جديد</button>}
          </div>

          {usersLoading ? (
            <div className="empty"><div className="ei">⏳</div><div className="et">جارٍ التحميل...</div></div>
          ) : users.length===0 ? (
            <div className="empty"><div className="ei">👥</div><div className="et">لا يوجد مستخدمون</div></div>
          ) : (
            <div className="g2">
              {users.map(u=>{
                const isActive = u.active !== false;
                return (
                  <div key={u.id} className="card">
                    <div style={{display:'flex',alignItems:'center',gap:12,width:'100%'}}>
                      <div style={{width:44,height:44,borderRadius:'50%',background:'var(--pr-l)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',opacity:isActive?1:.4}}>
                        {u.role==='manager'?'👑':u.role==='parent'?'👨‍👩‍👧':'👤'}
                      </div>
                      <div style={{flex:1,opacity:isActive?1:.6}}>
                        <div style={{fontWeight:700}}>{u.name} {!isActive && <span className="bdg b-gy">معطّل</span>}</div>
                        <div style={{fontSize:'.78rem',color:'var(--g5)'}}>@{u.username} · {ROLES[u.role]||u.role}</div>
                      </div>
                      {isManager && (
                        <div className="c-acts">
                          <button className="btn btn-xs btn-g" onClick={()=>openEditUserForm(u)}>✏️</button>
                          <button className={`btn btn-xs ${isActive?'btn-w':'btn-s'}`} onClick={()=>toggleUserActive(u)}>{isActive?'⏸️':'▶️'}</button>
                          <button className="btn btn-xs btn-d" onClick={()=>delUser(u)}>🗑️</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* نافذة المستخدم */}
          {showUserForm && (
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget){setShowUserForm(false);setEditUserId(null);}}}>
              <div className="mb mb-xl" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}>
                  <h2>{editUserId?'✏️ تعديل حساب':'➕ مستخدم جديد'}</h2>
                  {!editUserId && <p style={{fontSize:'.8rem',opacity:.85,marginTop:4}}>سيُستخدم اسم المستخدم للدخول لاحقاً — تأكد أنه واضح للموظف</p>}
                </div>
                <div className="modal-body-scroll" style={{padding:'18px 20px'}}>
                  <div className="fg c2">
                    <div className="fl full"><label>الاسم الكامل <span className="req">*</span></label><input value={userForm.name} onChange={fldU('name')}/></div>

                    <div className="fl"><label>اسم المستخدم {!editUserId && <span className="req">*</span>}</label>
                      <input value={userForm.username} onChange={fldU('username')} autoComplete="off" disabled={!!editUserId}
                        placeholder="أحرف/أرقام إنجليزية، بدون مسافات" dir="ltr" style={editUserId?{background:'var(--g0)'}:{}}/>
                      {editUserId && <p style={{fontSize:'.72rem',color:'var(--g5)',marginTop:4}}>لا يمكن تغيير اسم المستخدم بعد الإنشاء</p>}
                    </div>

                    <div className="fl"><label>كلمة المرور {!editUserId && <span className="req">*</span>}</label>
                      {editUserId ? (
                        <input value="••••••••" disabled style={{background:'var(--g0)'}}/>
                      ) : (
                        <input type="password" value={userForm.password} onChange={fldU('password')} placeholder="6 أحرف على الأقل"/>
                      )}
                    </div>

                    <div className="fl full"><label>البريد/الجوال للتواصل (اختياري)</label><input value={userForm.contactEmail} onChange={fldU('contactEmail')} placeholder="لا يُستخدم للدخول، فقط للتواصل"/></div>

                    <div className="fl full"><label>الدور</label>
                      <select value={userForm.role} onChange={fldU('role')}>
                        {ROLE_OPTIONS.filter(([v])=>v!=='manager').map(([v,l])=><option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    {userForm.role === 'parent' && (
                      <div className="fl full">
                        <label>الطالب المرتبط <span className="req">*</span></label>
                        <select value={userForm.studentId || ''} onChange={fldU('studentId')}>
                          <option value="">— اختر الطالب —</option>
                          {stuList.map(s => <option key={s.id} value={s.id}>{s.name}{s.className ? ` (${s.className})` : ''}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div style={{marginTop:20}}>
                    <div className="fsh">🔐 الصلاحيات</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
                      {PERMISSIONS.map(p=>(
                        <label key={p.key} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',border:'1px solid var(--border-color)',borderRadius:8,cursor:'pointer',background:(userForm.permissions||{})[p.key]?'var(--ok-l)':'transparent'}}>
                          <input type="checkbox" checked={(userForm.permissions||{})[p.key]||false} onChange={e=>setUserForm(f=>({...f,permissions:{...(f.permissions||{}),[p.key]:e.target.checked}}))}/>
                          <span style={{fontSize:'.84rem',fontWeight:700}}>{p.icon} {p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="fa">
                  <button className="btn btn-p" onClick={saveUser} disabled={savingUser}>{savingUser ? '⏳ جارٍ الحفظ...' : '💾 حفظ'}</button>
                  <button className="btn btn-g" onClick={()=>{setShowUserForm(false);setEditUserId(null);}} disabled={savingUser}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* النسخ الاحتياطي */}
      {tab==='backup' && (
        <div>
          {/* Firebase Sync */}
          <div className="wg" style={{marginBottom:14}}>
            <div className="wg-h"><h3>🔄 تحديث الكل</h3></div>
            <div className="wg-b">
              <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:16,lineHeight:1.7}}>
                يساعد على تحميل جميع أجزاء النظام بسلاسة من السحابة، ويتحقق من بيانات المركز والمستخدم الحالي
                لضمان عمل النظام بشكل طبيعي — الطلاب، الموظفون، البرامج، المالية، والإعدادات.
              </p>
              <button
                type="button"
                className="btn btn-p"
                disabled={refreshLoading}
                onClick={handleRefreshAll}
                style={{ minWidth: 200 }}
              >
                {refreshLoading ? '⏳ جارٍ التحديث...' : '🔄 تحديث الكل الآن'}
              </button>
              <div style={{marginTop:12,padding:'10px 14px',background:'var(--ok-l)',borderRadius:8,fontSize:'.78rem',color:'var(--ok)'}}>
                💡 يُفضّل استخدامه عند فتح النظام لأول مرة، أو عند ملاحظة نقص في البيانات، أو بعد تسجيل الدخول من جهاز جديد.
              </div>
            </div>
          </div>

          {/* JSON Backup */}
          <div className="wg" style={{marginBottom:14}}>
            <div className="wg-h"><h3>💾 نسخة احتياطية JSON</h3></div>
            <div className="wg-b">
              <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:16}}>تصدير واستيراد جميع بيانات المركز كملف JSON.</p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button className="btn btn-p" onClick={exportData}>📥 تصدير البيانات</button>
                <label className="btn btn-s" style={{cursor:'pointer'}}>
                  📤 استيراد بيانات
                  <input type="file" accept=".json" style={{display:'none'}} onChange={importData}/>
                </label>
              </div>
              <div style={{marginTop:12,padding:'10px',background:'var(--warn-l)',borderRadius:8,fontSize:'.78rem',color:'var(--warn)'}}>
                ⚠️ الاستيراد سيستبدل البيانات الحالية — تأكد من أخذ نسخة احتياطية أولاً.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* عن النظام */}
      {tab==='about' && (
        <div className="wg">
          <div className="wg-h"><h3>ℹ️ عن النظام</h3></div>
          <div className="wg-b" style={{textAlign:'center',padding:30}}>
            <div style={{fontSize:'3rem',marginBottom:12}}>🏥</div>
            <h2 style={{margin:'0 0 8px'}}>نظام إدارة المركز المتكامل</h2>
            <p style={{color:'var(--g5)',marginBottom:4}}>الإصدار V1</p>
            <p style={{color:'var(--g5)',fontSize:'.85rem'}}>منصة إدارية شاملة للمراكز التعليمية والتأهيلية</p>
            <div style={{marginTop:20,padding:'12px 16px',background:'var(--g0)',borderRadius:10,fontSize:'.82rem',color:'var(--g5)'}}>
              <div>المركز: <strong>{center.name||'—'}</strong></div>
              <div>المستخدم: <strong>{currentUser?.name||'—'}</strong></div>
              <div>اسم المستخدم: <strong dir="ltr">@{getCurrentUsername(currentUser)}</strong></div>
              <div>الصلاحية: <strong>{getRoleLabel(currentUser?.role)}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
