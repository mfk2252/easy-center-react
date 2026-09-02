import { useState, useEffect } from 'react';
import { useApp, FONT_OPTIONS, applyFontFamily, applyFontVariables, applyFontSettings } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel, refreshAllSystemData, getCenterId } from '../hooks/useStorage';
import { uid, todayStr } from '../utils/dateHelpers';
import { ROLES, ARAB_CURRENCIES, CENTER_ACTIVITY_TYPES } from '../utils/constants';
import CountrySelector from '../components/ui/CountrySelector';
import { GLOBAL_CURRENCIES, getCountryPresets } from '../data/countriesData';
import { updateCenterSettings, getCenterUsers, getCenterSettings } from '../firebase/db';
import { createStaffAccount, checkSubscriptionStatus, isPlatformAdminEmail } from '../firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLang } from '../context/LanguageContext';
import { handleFileInputChange, FILE_ACCEPT_IMAGE } from '../utils/fileUpload';
import { getRoleLabel, getUserPermissionLabels, getCurrentUsername } from '../utils/userLabels';

const PRESET_COLORS = ['#1a56db', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2', '#db2777', '#0f172a'];
const ROLE_OPTIONS = [
  ['manager', 'مدير'],
  ['vice', 'نائب المدير'],
  ['specialist_speech', 'أخصائي تخاطب'],
  ['specialist_physio', 'أخصائي علاج فيزيائي'],
  ['specialist_behavior', 'أخصائي تعديل سلوك'],
  ['specialist_occupational', 'أخصائي علاج وظيفي'],
  ['specialist', 'أخصائي عام'],
  ['reception', 'استقبال'],
  ['admin', 'إداري'],
  ['technician', 'فني النظام'],
  ['parent', 'ولي أمر']
];

const PERMISSIONS = [
  { key: 'dash', name: 'الرئيسية', icon: '📊' },
  { key: 'students', name: 'الطلاب', icon: '👦' },
  { key: 'hr', name: 'الموظفون', icon: '👥' },
  { key: 'finance', name: 'المالية', icon: '💳' },
  { key: 'reports', name: 'التقارير', icon: '📊' },
  { key: 'settings', name: 'الإعدادات', icon: '⚙️' },
  { key: 'docs', name: 'الوثائق', icon: '📄' },
  { key: 'parents', name: 'أولياء الأمور', icon: '👨‍👩‍👧' },
  { key: 'partnerships', name: 'الشراكات', icon: '🤝' },
  { key: 'visits', name: 'الزيارات', icon: '🏛️' },
  { key: 'calendar', name: 'التقويم', icon: '📅' },
];

const EMPTY_USER_FORM = {
  username: '',
  password: '',
  name: '',
  contactEmail: '',
  role: 'specialist',
  title: '',
  studentId: '',
  phone: '',
  permissions: {}
};

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
    country: center.country || center.countryCode || localStorage.getItem('scs_center_country') || 'SA',
    countryCode: center.countryCode || center.country || localStorage.getItem('scs_center_country_code') || 'SA',
    countryNameAr: center.countryNameAr || localStorage.getItem('scs_center_country_name_ar') || 'المملكة العربية السعودية',
    countryNameEn: center.countryNameEn || localStorage.getItem('scs_center_country_name_en') || 'Saudi Arabia',
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
    shiftType: center.shifts?.type || center.shifts?.shiftType || (center.shifts?.single?.from ? 'single' : 'double'),
    singleFrom: center.shifts?.single?.from || center.shifts?.morning?.from || '08:00',
    singleTo: center.shifts?.single?.to || center.shifts?.morning?.to || '16:00',
    morningFrom: center.shifts?.morning?.from || '07:00',
    morningTo: center.shifts?.morning?.to || '12:00',
    eveningFrom: center.shifts?.evening?.from || '16:00',
    eveningTo: center.shifts?.evening?.to || '20:00',
  });

  const handleCountryChange = (countryObj) => {
    setCenterForm(f => ({
      ...f,
      country: countryObj.code,
      countryCode: countryObj.code,
      countryNameAr: countryObj.nameAr,
      countryNameEn: countryObj.nameEn,
      phoneCode: countryObj.phoneCode,
      currency: countryObj.currency,
      address: f.address ? f.address : `${countryObj.nameAr} - ${countryObj.defaultCity}`,
    }));
    toast(`🌐 تم اختيار ${countryObj.nameAr}: تم ضبط مفتاح الاتصال (${countryObj.phoneCode}) والعملة (${countryObj.currency}) تلقائياً`, 'ok');
  };

  const [selColor, setSelColor] = useState(center.color || '#1a56db');
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
    } catch (e) {
      toast('⚠️ تعذّر تحميل قائمة المستخدمين', 'er');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }

  const fldU = k => e => setUserForm(f => ({ ...f, [k]: e.target.value }));

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
    } catch (e) {
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
    } catch (e) {
      toast('❌ تعذّر تغيير حالة الحساب', 'er');
    }
  }

  async function delUser(u) {
    if (!window.confirm(`حذف حساب "${u.name}" نهائياً؟ لن يستطيع تسجيل الدخول بعد الآن.`)) return;
    try {
      await deleteDoc(doc(db, 'users', u.id));
      if (u.username) {
        try { await deleteDoc(doc(db, 'staffLoginIndex', u.username)); } catch (_) { }
      }
      toast('🗑️ تم حذف الحساب', 'ok');
      reloadUsers();
    } catch (e) {
      toast('❌ تعذّر حذف الحساب', 'er');
    }
  }

  const currentPerms = getUserPermissionLabels(currentUser);
  const currentUsername = getCurrentUsername(currentUser);

  async function handleRefreshAll() {
    if (!centerId) { toast('⚠️ سجّل دخولك أولاً', 'er'); return; }
    setRefreshLoading(true);
    toast('🔄 جارٍ تحديث ومزامنة النظام...', 'ok');
    try {
      const centerData = await refreshAllSystemData(centerId);
      if (centerData) loadCenterData(centerId);
      toast('✅ تم التحديث بنجاح! سيتم إعادة تحميل الصفحة...', 'ok');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      toast('❌ تعذّر التحديث — تحقق من الاتصال بالإنترنت', 'er');
    } finally {
      setRefreshLoading(false);
    }
  }

  async function saveCenter() {
    if (!centerForm.name?.trim()) { toast('⚠️ أدخل اسم المركز بالعربية', 'er'); return; }
    setSavingCenter(true);
    const shifts = {
      type: centerForm.shiftType || 'double',
      shiftType: centerForm.shiftType || 'double',
      single: { from: centerForm.singleFrom || '08:00', to: centerForm.singleTo || '16:00' },
      morning: { from: centerForm.morningFrom || '07:00', to: centerForm.morningTo || '12:00' },
      evening: centerForm.shiftType === 'single'
        ? { from: '', to: '' }
        : { from: centerForm.eveningFrom || '16:00', to: centerForm.eveningTo || '20:00' },
    };
    const socialLinks = { website: centerForm.website || '', whatsapp: centerForm.whatsapp || '', instagram: centerForm.instagram || '' };
    const updated = {
      ...center,
      ...centerForm,
      name: centerForm.name.trim(),
      nameEn: centerForm.nameEn ? centerForm.nameEn.trim() : '',
      shifts,
      socialLinks,
      configured: true
    };
    try {
      if (centerId) {
        await updateCenterSettings(centerId, {
          centerName: centerForm.name.trim(),
          name: centerForm.name.trim(),
          nameEn: centerForm.nameEn ? centerForm.nameEn.trim() : '',
          country: centerForm.country || 'SA',
          countryCode: centerForm.countryCode || 'SA',
          countryNameAr: centerForm.countryNameAr || 'المملكة العربية السعودية',
          countryNameEn: centerForm.countryNameEn || 'Saudi Arabia',
          type: centerForm.type || '',
          phone: centerForm.phone || '',
          phoneCode: centerForm.phoneCode || '+966',
          email: centerForm.email || '',
          address: centerForm.address || '',
          logo: centerForm.logo || '',
          currency: centerForm.currency || 'SAR',
          socialLinks,
          shifts,
          barcode: centerForm.barcode || '',
          isSetup: true,
          setupCompleted: true,
          status: 'active',
        });
      }
      persistConfig(updated);
      toast('✅ تم حفظ بيانات وهوية المركز بنجاح', 'ok');
    } catch (e) {
      console.warn('saveCenter remote sync warning:', e);
      persistConfig(updated);
      toast('✅ تم حفظ بيانات المركز بنجاح', 'ok');
    } finally {
      setSavingCenter(false);
    }
  }

  async function handleBarcode(e) {
    try {
      const res = await handleFileInputChange(e, { imagesOnly: true });
      if (res) {
        setCenterForm(f => ({ ...f, barcode: res.data }));
        toast('✅ تم تحميل صورة الباركود بنجاح', 'ok');
      }
    } catch (ex) {
      toast('⚠️ ' + t(ex.i18nKey || 'file.invalidType'), 'er');
    }
  }

  async function handleCenterLogo(e) {
    try {
      const res = await handleFileInputChange(e, { imagesOnly: true });
      if (res) {
        setCenterForm(prev => ({ ...prev, logo: res.data }));
        toast('✅ تم تحميل شعار المركز بنجاح', 'ok');
      }
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
    toast('✅ تم تصدير النسخة الاحتياطية الشاملة بنجاح', 'ok');
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
    { id: 'center', label: 'بيانات وهوية المركز', icon: '🏥', badge: 'الرئيسية' },
    { id: 'appearance', label: 'المظهر والخطوط', icon: '🎨' },
    { id: 'users', label: 'المستخدمون والصلاحيات', icon: '👥', count: users.length },
    { id: 'backup', label: 'النسخ الاحتياطي والمزامنة', icon: '💾' },
    { id: 'about', label: 'عن المنصة', icon: 'ℹ️' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* رأس الصفحة الحديث والموحد */}
      <div className="ph" style={{ marginBottom: 20, alignItems: 'center' }}>
        <div className="ph-t">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--pr-l)',
              color: 'var(--pr)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              flexShrink: 0
            }}>
              ⚙️
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>إعدادات النظام والمركز</h2>
              <p style={{ margin: '2px 0 0', color: 'var(--g5)', fontSize: '.84rem' }}>
                تخصيص هوية المركز، المظهر، حسابات الكادر، وتأمين البيانات
              </p>
            </div>
          </div>
        </div>

        <div className="ph-a">
          <button
            type="button"
            className="btn btn-g"
            onClick={handleRefreshAll}
            disabled={refreshLoading}
            style={{ fontSize: '.82rem', padding: '8px 14px' }}
            title="مزامنة وتحديث كافة بيانات النظام من السحابة"
          >
            {refreshLoading ? '⏳ جارٍ التحديث...' : '🔄 مزامنة فورية'}
          </button>
        </div>
      </div>

      {/* شريط التبويبات الحديث والمتجاوب */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '6px',
        background: 'var(--g1)',
        borderRadius: 14,
        border: '1px solid var(--border-color)',
        marginBottom: 24,
        scrollbarWidth: 'none'
      }}>
        {TABS.map(tItem => {
          const isAct = tab === tItem.id;
          return (
            <button
              key={tItem.id}
              type="button"
              onClick={() => setTab(tItem.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: isAct ? 'var(--bg-card)' : 'transparent',
                color: isAct ? 'var(--pr)' : 'var(--g6)',
                fontWeight: isAct ? 800 : 600,
                fontSize: '.88rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
                boxShadow: isAct ? 'var(--sh)' : 'none',
                flexShrink: 0
              }}
            >
              <span>{tItem.icon}</span>
              <span>{tItem.label}</span>
              {tItem.count !== undefined && tItem.count > 0 && (
                <span style={{
                  fontSize: '.72rem',
                  padding: '2px 7px',
                  borderRadius: 12,
                  background: isAct ? 'var(--pr-l)' : 'var(--g2)',
                  color: isAct ? 'var(--pr)' : 'var(--g6)',
                  fontWeight: 700
                }}>
                  {tItem.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          تبويب: بيانات المركز والهوية (Center Profile & Brand Assets)
      ────────────────────────────────────────────────────────────── */}
      {tab === 'center' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* بطاقات الهوية البصرية: الشعار والباركود (Visual Branding Assets Cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 16
          }}>
            {/* بطاقة الشعار الرسمي (Logo Card) */}
            <div className="wg" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              <div className="wg-h" style={{ background: 'var(--g0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>🖼️</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '.95rem' }}>شعار المركز الرسمي (Logo)</h3>
                    <div style={{ fontSize: '.74rem', color: 'var(--g5)' }}>يظهر في الترويسة والتقارير والسندات</div>
                  </div>
                </div>
                {centerForm.logo ? (
                  <span className="bdg b-gr">مُعتمد ✅</span>
                ) : (
                  <span className="bdg b-or">غير محدد ⚠️</span>
                )}
              </div>

              <div className="wg-b" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '18px 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'var(--g0)',
                  padding: '16px',
                  borderRadius: 12,
                  border: '1.5px dashed var(--border-color)',
                  justifyContent: 'center',
                  minHeight: 120
                }}>
                  {centerForm.logo ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={centerForm.logo}
                        alt="Logo Preview"
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 14,
                          objectFit: 'contain',
                          background: 'white',
                          padding: 4,
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--sh)'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--g4)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>🏥</div>
                      <div style={{ fontSize: '.8rem', fontWeight: 600 }}>لم يتم رفع شعار للمركز بعد</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn btn-p" style={{ cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
                    <span>📷</span>
                    <span>{centerForm.logo ? 'تغيير الشعار' : 'رفع شعار جديد'}</span>
                    <input
                      type="file"
                      accept={FILE_ACCEPT_IMAGE}
                      style={{ display: 'none' }}
                      onChange={handleCenterLogo}
                    />
                  </label>
                  {centerForm.logo && (
                    <button
                      type="button"
                      className="btn btn-d"
                      onClick={() => setCenterForm(f => ({ ...f, logo: '' }))}
                      title="حذف الشعار الحالي"
                    >
                      🗑️ إزالة
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '.74rem', color: 'var(--g5)', background: 'var(--g1)', padding: '8px 12px', borderRadius: 8, lineHeight: 1.6 }}>
                  💡 يُفضل استخدام صورة مربعة أو بأبعاد 4:3 بدقة عالية وخلفية شفافة (PNG / WebP / JPG).
                </div>
              </div>
            </div>

            {/* بطاقة الباركود والرمز الرقمي (Barcode & QR Card) */}
            <div className="wg" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              <div className="wg-h" style={{ background: 'var(--g0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>🏁</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '.95rem' }}>الباركود / رمز التحقق الرقمي</h3>
                    <div style={{ fontSize: '.74rem', color: 'var(--g5)' }}>يظهر أسفل المطبوعات للتحقق والمسح الضوئي</div>
                  </div>
                </div>
                {centerForm.barcode ? (
                  <span className="bdg b-gr">مُفعّل ✅</span>
                ) : (
                  <span className="bdg b-gy">اختياري</span>
                )}
              </div>

              <div className="wg-b" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '18px 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'var(--g0)',
                  padding: '16px',
                  borderRadius: 12,
                  border: '1.5px dashed var(--border-color)',
                  justifyContent: 'center',
                  minHeight: 120
                }}>
                  {centerForm.barcode ? (
                    <div style={{ background: 'white', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', boxShadow: 'var(--sh)' }}>
                      <img
                        src={centerForm.barcode}
                        alt="Barcode Preview"
                        style={{ height: 68, maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--g4)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>🏁</div>
                      <div style={{ fontSize: '.8rem', fontWeight: 600 }}>لم يتم إضافة باركود / QR بعد</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn btn-p" style={{ cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
                    <span>📷</span>
                    <span>{centerForm.barcode ? 'تغيير الباركود' : 'رفع صورة باركود / QR'}</span>
                    <input
                      type="file"
                      accept={FILE_ACCEPT_IMAGE}
                      style={{ display: 'none' }}
                      onChange={handleBarcode}
                    />
                  </label>
                  {centerForm.barcode && (
                    <button
                      type="button"
                      className="btn btn-d"
                      onClick={() => setCenterForm(f => ({ ...f, barcode: '' }))}
                      title="حذف الباركود الحالي"
                    >
                      🗑️ إزالة
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '.74rem', color: 'var(--g5)', background: 'var(--g1)', padding: '8px 12px', borderRadius: 8, lineHeight: 1.6 }}>
                  💡 يُطبع في أسفل السندات المالية والتقارير الفنية للتحقق الرقمي وسرعة الوصول.
                </div>
              </div>
            </div>
          </div>

          {/* المعلومات الأساسية والترخيص والدولة */}
          <div className="wg" style={{ margin: 0 }}>
            <div className="wg-h">
              <h3>📋 البيانات الأساسية للمركز والدولة المعتمدة</h3>
            </div>
            <div className="wg-b" style={{ padding: '20px' }}>
              <div style={{ marginBottom: 20 }}>
                <CountrySelector
                  value={centerForm.countryCode || centerForm.country || 'SA'}
                  onChange={handleCountryChange}
                  label="الدولة / البلد المعتمد للمركز"
                />
              </div>

              <div className="fg c2">
                <div className="fl">
                  <label>اسم المركز (باللغة العربية) <span className="req">*</span></label>
                  <input
                    value={centerForm.name}
                    onChange={e => setCenterForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="مثال: مركز الأمل للتأهيل التخصصي"
                  />
                </div>

                <div className="fl">
                  <label>اسم المركز (English) <span className="req">*</span></label>
                  <input
                    value={centerForm.nameEn}
                    onChange={e => setCenterForm(f => ({ ...f, nameEn: e.target.value }))}
                    dir="ltr"
                    placeholder="e.g. Al-Amal Rehabilitation Center"
                  />
                </div>

                <div className="fl">
                  <label>نوع ونشاط المركز / التخصص</label>
                  <select
                    value={centerForm.type}
                    onChange={e => setCenterForm(f => ({ ...f, type: e.target.value }))}
                  >
                    <option value="">— اختر نوع ونشاط المركز —</option>
                    {CENTER_ACTIVITY_TYPES.map(tType => (
                      <option key={tType} value={tType}>{tType}</option>
                    ))}
                  </select>
                </div>

                <div className="fl">
                  <label>العملة المعتمدة في النظام</label>
                  <select
                    value={centerForm.currency}
                    onChange={e => setCenterForm(f => ({ ...f, currency: e.target.value }))}
                  >
                    {GLOBAL_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* بيانات الاتصال والتواصل الاجتماعي */}
          <div className="wg" style={{ margin: 0 }}>
            <div className="wg-h">
              <h3>📞 بيانات التواصل والعناوين</h3>
            </div>
            <div className="wg-b" style={{ padding: '20px' }}>
              <div className="fg c3">
                <div className="fl">
                  <label>كود الدولة</label>
                  <input
                    value={centerForm.phoneCode}
                    onChange={e => setCenterForm(f => ({ ...f, phoneCode: e.target.value }))}
                    dir="ltr"
                    placeholder="+966"
                  />
                </div>

                <div className="fl">
                  <label>الهاتف الأساسي</label>
                  <input
                    type="tel"
                    value={centerForm.phone}
                    onChange={e => setCenterForm(f => ({ ...f, phone: e.target.value }))}
                    dir="ltr"
                    placeholder="05XXXXXXXX"
                  />
                </div>

                <div className="fl">
                  <label>البريد الإلكتروني الرسمي</label>
                  <input
                    type="email"
                    value={centerForm.email}
                    onChange={e => setCenterForm(f => ({ ...f, email: e.target.value }))}
                    dir="ltr"
                    placeholder="info@center.com"
                  />
                </div>

                <div className="fl">
                  <label>واتساب المركز للتواصل السريع</label>
                  <input
                    value={centerForm.whatsapp}
                    onChange={e => setCenterForm(f => ({ ...f, whatsapp: e.target.value }))}
                    dir="ltr"
                    placeholder="05XXXXXXXX"
                  />
                </div>

                <div className="fl">
                  <label>الموقع الإلكتروني / الرابط</label>
                  <input
                    value={centerForm.website}
                    onChange={e => setCenterForm(f => ({ ...f, website: e.target.value }))}
                    dir="ltr"
                    placeholder="https://center.com"
                  />
                </div>

                <div className="fl">
                  <label>حساب إنستجرام</label>
                  <input
                    value={centerForm.instagram}
                    onChange={e => setCenterForm(f => ({ ...f, instagram: e.target.value }))}
                    dir="ltr"
                    placeholder="@center_handle"
                  />
                </div>

                <div className="fl full">
                  <label>العنوان الجغرافي التفصيلي للمركز</label>
                  <textarea
                    value={centerForm.address}
                    onChange={e => setCenterForm(f => ({ ...f, address: e.target.value }))}
                    rows={2}
                    placeholder="المدينة، الحي، الشارع، رقم المبنى..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* فترات ومواعيد العمل */}
          <div className="wg" style={{ margin: 0 }}>
            <div className="wg-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <h3>⏰ مواعيد وفترات الدوام الرسمي</h3>
              <div style={{ display: 'flex', gap: 8, background: 'var(--g1)', padding: '4px', borderRadius: 8 }}>
                <button
                  type="button"
                  className={`btn ${centerForm.shiftType === 'single' ? 'btn-p' : 'btn-g'}`}
                  onClick={() => setCenterForm(f => ({ ...f, shiftType: 'single' }))}
                  style={{ padding: '6px 14px', fontSize: '.8rem' }}
                >
                  ☀️ دوام فترة واحدة (من : إلى)
                </button>
                <button
                  type="button"
                  className={`btn ${centerForm.shiftType === 'double' ? 'btn-p' : 'btn-g'}`}
                  onClick={() => setCenterForm(f => ({ ...f, shiftType: 'double' }))}
                  style={{ padding: '6px 14px', fontSize: '.8rem' }}
                >
                  🌗 دوام فترتان (صباحي ومسائي)
                </button>
              </div>
            </div>
            <div className="wg-b" style={{ padding: '20px' }}>
              {centerForm.shiftType === 'single' ? (
                <div style={{
                  padding: '18px 20px',
                  background: 'var(--g0)',
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  maxWidth: 650
                }}>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
                    <span>☀️</span>
                    <span>دوام الفترة الواحدة المتواصلة</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="fl">
                      <label style={{ fontWeight: 700 }}>وقت بدء الدوام (من)</label>
                      <input
                        type="time"
                        value={centerForm.singleFrom}
                        onChange={e => setCenterForm(f => ({ ...f, singleFrom: e.target.value }))}
                      />
                    </div>
                    <div className="fl">
                      <label style={{ fontWeight: 700 }}>وقت نهاية الدوام (إلى)</label>
                      <input
                        type="time"
                        value={centerForm.singleTo}
                        onChange={e => setCenterForm(f => ({ ...f, singleTo: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: '.78rem', color: 'var(--g5)', lineHeight: 1.5 }}>
                    💡 نظام الفترة الواحدة المتواصلة: يبدأ الدوام من الساعة المحددة (مثلاً 08:00 صباحاً) وينتهي عند (16:00 عصراً) دون وجود فترتين منفصلتين.
                  </div>
                </div>
              ) : (
                <div className="fg c2">
                  <div style={{
                    padding: '16px',
                    background: 'var(--g0)',
                    borderRadius: 12,
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '.9rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)' }}>
                      <span>🌅</span>
                      <span>الفترة الصباحية</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="fl">
                        <label>من</label>
                        <input
                          type="time"
                          value={centerForm.morningFrom}
                          onChange={e => setCenterForm(f => ({ ...f, morningFrom: e.target.value }))}
                        />
                      </div>
                      <div className="fl">
                        <label>إلى</label>
                        <input
                          type="time"
                          value={centerForm.morningTo}
                          onChange={e => setCenterForm(f => ({ ...f, morningTo: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    background: 'var(--g0)',
                    borderRadius: 12,
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '.9rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)' }}>
                      <span>🌆</span>
                      <span>الفترة المسائية</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="fl">
                        <label>من</label>
                        <input
                          type="time"
                          value={centerForm.eveningFrom}
                          onChange={e => setCenterForm(f => ({ ...f, eveningFrom: e.target.value }))}
                        />
                      </div>
                      <div className="fl">
                        <label>إلى</label>
                        <input
                          type="time"
                          value={centerForm.eveningTo}
                          onChange={e => setCenterForm(f => ({ ...f, eveningTo: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* زر حفظ كافة الإعدادات */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '16px 20px',
            background: 'var(--bg-card)',
            borderRadius: 14,
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--sh)'
          }}>
            <button
              type="button"
              className="btn btn-p btn-lg"
              onClick={saveCenter}
              disabled={savingCenter}
              style={{ minWidth: 220, justifyContent: 'center' }}
            >
              {savingCenter ? '⏳ جارٍ حفظ البيانات...' : '💾 حفظ وتحديث بيانات المركز'}
            </button>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          تبويب: المظهر والخطوط (Appearance & Typography)
      ────────────────────────────────────────────────────────────── */}
      {tab === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="wg" style={{ margin: 0 }}>
            <div className="wg-h">
              <h3>🎨 تخصيص المظهر ونمط الخطوط</h3>
            </div>
            <div className="wg-b" style={{ padding: '22px' }}>
              
              {/* اختيار الخط */}
              <div style={{ marginBottom: 24, padding: '18px', background: 'var(--g0)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <label style={{ fontWeight: 800, display: 'block', marginBottom: 6, fontSize: '.98rem', color: 'var(--text-main)' }}>
                  🔤 نوع الخط المعتمد للواجهة والتقارير
                </label>
                <p style={{ fontSize: '.84rem', color: 'var(--text-sub)', marginBottom: 16 }}>
                  اختر نمط الخط المناسب، وسيتم تطبيقه فوراً على كافة صفحات النظام والنماذج المطبوعة
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                  gap: 12
                }}>
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
                          padding: '14px 16px',
                          borderRadius: 12,
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
                          boxShadow: isSelected ? 'var(--sh2)' : 'none',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{f.name}</div>
                          <div style={{ fontSize: '.8rem', opacity: 0.85, marginTop: 4 }}>أبجد هوز 123 - عينة الخط</div>
                        </div>
                        {isSelected && (
                          <span style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'var(--pr)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '.85rem',
                            fontWeight: 900
                          }}>
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* أزرار استعادة الافتراضي */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                <button
                  type="button"
                  className="btn btn-g"
                  onClick={() => {
                    setFontFamily('tajawal');
                    setFontSize(16);
                    setFontWeight('400');
                    applyActiveFontSettings(16, '400', 'tajawal');
                  }}
                  style={{ padding: '8px 16px', fontSize: '.85rem' }}
                >
                  🔄 استعادة إعدادات الخط الافتراضية
                </button>
              </div>

              {/* تحكم الحجم والوزن */}
              <div className="fg c2" style={{ marginBottom: 24 }}>
                <div style={{ padding: '16px', background: 'var(--g0)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <label style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text-main)', marginBottom: 10, display: 'block' }}>
                    📏 {t('settings.fontSize')}
                  </label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-g"
                      onClick={() => {
                        const n = Math.max(12, fontSize - 1);
                        setFontSize(n);
                        applyActiveFontSettings(n, fontWeight, fontFamily);
                      }}
                      style={{ padding: '8px 14px' }}
                    >
                      {t('settings.fontSmaller')} A-
                    </button>

                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      color: 'var(--pr)',
                      background: 'var(--bg-card)',
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)'
                    }}>
                      {fontSize}px
                    </div>

                    <button
                      type="button"
                      className="btn btn-g"
                      onClick={() => {
                        const n = Math.min(22, fontSize + 1);
                        setFontSize(n);
                        applyActiveFontSettings(n, fontWeight, fontFamily);
                      }}
                      style={{ padding: '8px 14px' }}
                    >
                      {t('settings.fontLarger')} A+
                    </button>
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'var(--g0)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <label style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text-main)', marginBottom: 10, display: 'block' }}>
                    ⚖️ {t('settings.fontWeight')}
                  </label>
                  <select
                    value={fontWeight}
                    onChange={e => {
                      setFontWeight(e.target.value);
                      applyActiveFontSettings(fontSize, e.target.value, fontFamily);
                    }}
                    style={{ height: 42 }}
                  >
                    <option value="400">{t('settings.fontNormal')} (400)</option>
                    <option value="600">متوسط (600)</option>
                    <option value="700">{t('settings.fontBold')} (700)</option>
                    <option value="900">عريض جداً (900)</option>
                  </select>
                </div>
              </div>

              {/* ألوان السمة الأساسية */}
              <div style={{ marginBottom: 24, padding: '18px', background: 'var(--g0)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <label style={{ fontWeight: 800, display: 'block', marginBottom: 6, fontSize: '.95rem', color: 'var(--text-main)' }}>
                  🎨 {t('settings.mainColor')}
                </label>
                <p style={{ fontSize: '.82rem', color: 'var(--g5)', marginBottom: 14 }}>
                  اللون المعتمد للأزرار والتبويبات والعناصر النشطة في المركز
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {PRESET_COLORS.map(c => {
                    const isSel = selColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setSelColor(c);
                          updateCenterColor(c);
                        }}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: c,
                          border: '3px solid white',
                          cursor: 'pointer',
                          outline: isSel ? `3px solid ${c}` : '1px solid rgba(0,0,0,0.1)',
                          outlineOffset: 2,
                          transform: isSel ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.18s ease',
                          boxShadow: isSel ? 'var(--sh2)' : 'none'
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* زر حفظ المظهر */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-p btn-lg"
                  onClick={saveAppearance}
                  disabled={savingAppearance}
                  style={{ minWidth: 220, justifyContent: 'center' }}
                >
                  {savingAppearance ? '⏳ جارٍ الحفظ...' : '💾 حفظ وتطبيق إعدادات المظهر'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          تبويب: المستخدمون والصلاحيات (Users & Staff Management)
      ────────────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* بطاقة المستخدم الحالي */}
          <div className="wg" style={{ margin: 0 }}>
            <div className="wg-h">
              <h3>👤 حسابك الحالي المسجل</h3>
            </div>
            <div className="wg-b" style={{ padding: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: 16,
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '.78rem', color: 'var(--g5)', display: 'block', marginBottom: 3 }}>الاسم الكامل:</span>
                  <strong style={{ fontSize: '1rem' }}>{currentUser?.name || '—'}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '.78rem', color: 'var(--g5)', display: 'block', marginBottom: 3 }}>اسم المستخدم:</span>
                  <strong dir="ltr" style={{ fontSize: '1rem', color: 'var(--pr)' }}>@{currentUsername}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '.78rem', color: 'var(--g5)', display: 'block', marginBottom: 3 }}>الدور والصلاحية:</span>
                  <span className="bdg b-bl" style={{ fontSize: '.84rem', padding: '4px 10px' }}>
                    {getRoleLabel(currentUser?.role)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: '14px', background: 'var(--g0)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, fontSize: '.82rem', marginBottom: 8, color: 'var(--text-main)' }}>
                  🔐 الصلاحيات الممنوحة لهذا الحساب:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {currentPerms.map(p => (
                    <span key={p} className="bdg b-gr" style={{ fontSize: '.78rem', padding: '3px 8px' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {(subscriptionStatus || currentUser?.subscription)?.reason === 'trial' && (
                <div style={{ marginTop: 12, fontSize: '.84rem', color: 'var(--warn)', background: 'var(--warn-l)', padding: '10px 14px', borderRadius: 8, fontWeight: 700 }}>
                  ⏳ فترة التجربة نشطة: متبقي {(subscriptionStatus || currentUser?.subscription)?.daysLeft ?? '—'} {(subscriptionStatus || currentUser?.subscription)?.daysLeft === 1 ? 'يوم' : 'أيام'}
                </div>
              )}
            </div>
          </div>

          {/* بطاقة الاشتراك للمدير */}
          {isManager && (
            <div className="wg" style={{ margin: 0, border: '1px solid var(--pr)' }}>
              <div className="wg-h" style={{ background: 'var(--pr)', color: '#fff' }}>
                <h3 style={{ margin: 0, color: '#fff' }}>📋 حالة ترخيص واشتراك المركز</h3>
                <span style={{ fontSize: '.82rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20 }}>
                  {isPermanent ? 'اشتراك غير محدود ♾️' : daysLeft > 0 ? `متبقي ${daysLeft} يوم` : 'منتهي الصلاحية'}
                </span>
              </div>
              <div className="wg-b" style={{ padding: '20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                  gap: 16
                }}>
                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--g5)', marginBottom: 4 }}>تاريخ بدء التفعيل</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{activationDateStr}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--g5)', marginBottom: 4 }}>تاريخ انتهاء الصلاحية</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: (!isPermanent && daysLeft < 30) ? 'var(--warn)' : 'var(--ok)' }}>
                      {expiryDateStr}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--g5)', marginBottom: 4 }}>مدة الاشتراك</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{durationStr}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--g5)', marginBottom: 4 }}>الحالة الحالية</div>
                    <span className={`bdg ${isActiveSub ? 'b-gr' : 'b-rd'}`} style={{ fontSize: '.86rem', padding: '4px 12px' }}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {!isPermanent && daysLeft > 0 && daysLeft <= 30 && (
                  <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--warn-l)', color: 'var(--warn)', borderRadius: 10, fontSize: '.88rem', fontWeight: 700 }}>
                    ⚠️ تنبيه: يتبقى {daysLeft} يوم على انتهاء الاشتراك. يرجى التواصل مع إدارة المنصة لتجديد الاشتراك وضمان استمرارية الخدمة.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* قائمة حسابات الكادر والمستخدمين */}
          <div className="wg" style={{ margin: 0 }}>
            <div className="wg-h">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3>👥 حسابات الكادر والمستخدمين ({users.length})</h3>
              </div>
              {isManager && (
                <button type="button" className="btn btn-p" onClick={openNewUserForm}>
                  ➕ إضافة مستخدم جديد
                </button>
              )}
            </div>

            <div className="wg-b" style={{ padding: '20px' }}>
              {usersLoading ? (
                <div className="empty">
                  <div className="ei">⏳</div>
                  <div className="et">جارٍ تحميل المستخدمين...</div>
                </div>
              ) : users.length === 0 ? (
                <div className="empty">
                  <div className="ei">👥</div>
                  <div className="et">لا يوجد مستخدمون مسجلون بعد</div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                  gap: 14
                }}>
                  {users.map(u => {
                    const isActive = u.active !== false;
                    return (
                      <div
                        key={u.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          padding: '16px',
                          background: 'var(--bg-card)',
                          borderRadius: 14,
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--sh)',
                          opacity: isActive ? 1 : 0.65,
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: isActive ? 'var(--pr-l)' : 'var(--g2)',
                            color: isActive ? 'var(--pr)' : 'var(--g5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            flexShrink: 0
                          }}>
                            {u.role === 'manager' ? '👑' : u.role === 'parent' ? '👨‍👩‍👧' : '👤'}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '.96rem', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span>{u.name}</span>
                              {!isActive && <span className="bdg b-gy" style={{ fontSize: '.7rem' }}>معطّل</span>}
                            </div>
                            <div style={{ fontSize: '.78rem', color: 'var(--g5)', marginTop: 2 }}>
                              <span dir="ltr">@{u.username}</span> · <span>{ROLES[u.role] || u.role}</span>
                            </div>
                          </div>
                        </div>

                        {u.contactEmail && (
                          <div style={{ fontSize: '.76rem', color: 'var(--g5)', wordBreak: 'break-all' }}>
                            ✉️ {u.contactEmail}
                          </div>
                        )}

                        {isManager && (
                          <div style={{
                            display: 'flex',
                            gap: 6,
                            justifyContent: 'flex-end',
                            borderTop: '1px solid var(--border-color)',
                            paddingTop: 10,
                            marginTop: 'auto'
                          }}>
                            <button
                              type="button"
                              className="btn btn-xs btn-g"
                              onClick={() => openEditUserForm(u)}
                              title="تعديل الحساب"
                            >
                              ✏️ تعديل
                            </button>
                            <button
                              type="button"
                              className={`btn btn-xs ${isActive ? 'btn-w' : 'btn-s'}`}
                              onClick={() => toggleUserActive(u)}
                              title={isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                            >
                              {isActive ? '⏸️ تعطيل' : '▶️ تفعيل'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-d"
                              onClick={() => delUser(u)}
                              title="حذف الحساب نهائياً"
                            >
                              🗑️ حذف
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* نافذة إنشاء / تعديل المستخدم */}
          {showUserForm && (
            <div className="mbg" onClick={e => { if (e.target === e.currentTarget) { setShowUserForm(false); setEditUserId(null); } }}>
              <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 18 }}>
                <div className="fhd" style={{ padding: '16px 22px', borderRadius: 0 }}>
                  <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{editUserId ? '✏️ تعديل بيانات الحساب' : '➕ إضافة مستخدم جديد'}</h2>
                  {!editUserId && (
                    <p style={{ fontSize: '.82rem', opacity: .9, marginTop: 4 }}>
                      سيُستخدم اسم المستخدم للدخول لاحقاً — تأكد أنه واضح ومميز للموظف
                    </p>
                  )}
                </div>

                <div className="modal-body-scroll" style={{ padding: '20px 22px' }}>
                  <div className="fg c2">
                    <div className="fl full">
                      <label>الاسم الكامل للمستخدم <span className="req">*</span></label>
                      <input value={userForm.name} onChange={fldU('name')} placeholder="مثال: د. أحمد المنصور" />
                    </div>

                    <div className="fl">
                      <label>اسم المستخدم {!editUserId && <span className="req">*</span>}</label>
                      <input
                        value={userForm.username}
                        onChange={fldU('username')}
                        autoComplete="off"
                        disabled={!!editUserId}
                        placeholder="أحرف/أرقام إنجليزية، بدون مسافات"
                        dir="ltr"
                        style={editUserId ? { background: 'var(--g0)' } : {}}
                      />
                      {editUserId && <p style={{ fontSize: '.72rem', color: 'var(--g5)', marginTop: 4 }}>لا يمكن تغيير اسم المستخدم بعد الإنشاء</p>}
                    </div>

                    <div className="fl">
                      <label>كلمة المرور {!editUserId && <span className="req">*</span>}</label>
                      {editUserId ? (
                        <input value="••••••••" disabled style={{ background: 'var(--g0)' }} />
                      ) : (
                        <input
                          type="password"
                          value={userForm.password}
                          onChange={fldU('password')}
                          placeholder="6 أحرف على الأقل"
                        />
                      )}
                    </div>

                    <div className="fl full">
                      <label>البريد/الجوال للتواصل (اختياري)</label>
                      <input
                        value={userForm.contactEmail}
                        onChange={fldU('contactEmail')}
                        placeholder="لا يُستخدم للدخول، فقط للتواصل والإشعارات"
                      />
                    </div>

                    <div className="fl full">
                      <label>الدور الوظيفي</label>
                      <select value={userForm.role} onChange={fldU('role')}>
                        {ROLE_OPTIONS.filter(([v]) => v !== 'manager').map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>

                    {userForm.role === 'parent' && (
                      <div className="fl full">
                        <label>الطالب المرتبط بولي الأمر <span className="req">*</span></label>
                        <select value={userForm.studentId || ''} onChange={fldU('studentId')}>
                          <option value="">— اختر الطالب —</option>
                          {stuList.map(s => (
                            <option key={s.id} value={s.id}>{s.name}{s.className ? ` (${s.className})` : ''}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 800, fontSize: '.9rem', marginBottom: 12, color: 'var(--text-main)' }}>
                      🔐 الصلاحيات الممنوحة للحساب
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                      gap: 10
                    }}>
                      {PERMISSIONS.map(p => {
                        const isGranted = (userForm.permissions || {})[p.key];
                        return (
                          <label
                            key={p.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '10px 12px',
                              border: isGranted ? '1.5px solid var(--ok)' : '1px solid var(--border-color)',
                              borderRadius: 10,
                              cursor: 'pointer',
                              background: isGranted ? 'var(--ok-l)' : 'var(--bg-card)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isGranted || false}
                              onChange={e => setUserForm(f => ({
                                ...f,
                                permissions: { ...(f.permissions || {}), [p.key]: e.target.checked }
                              }))}
                            />
                            <span style={{ fontSize: '.84rem', fontWeight: 700 }}>
                              {p.icon} {p.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="fa" style={{ padding: '14px 22px' }}>
                  <button
                    type="button"
                    className="btn btn-p"
                    onClick={saveUser}
                    disabled={savingUser}
                    style={{ minWidth: 120, justifyContent: 'center' }}
                  >
                    {savingUser ? '⏳ جارٍ الحفظ...' : '💾 حفظ الحساب'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-g"
                    onClick={() => { setShowUserForm(false); setEditUserId(null); }}
                    disabled={savingUser}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          تبويب: النسخ الاحتياطي والمزامنة (Backup & Sync)
      ────────────────────────────────────────────────────────────── */}
      {tab === 'backup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* مزامنة السحابة */}
          <div className="wg" style={{ margin: 0 }}>
            <div className="wg-h">
              <h3>🔄 التحديث والمزامنة الشاملة مع السحابة</h3>
            </div>
            <div className="wg-b" style={{ padding: '22px' }}>
              <p style={{ fontSize: '.88rem', color: 'var(--g6)', marginBottom: 18, lineHeight: 1.7 }}>
                تُجري هذه العملية مزامنة كاملة لجميع أقسام النظام من قاعدة البيانات السحابية المركزية — بما في ذلك الطلاب،
                الموظفين، الخطط الفردية IEP، البرامج التأهيلية، السجلات المالية، والإعدادات.
              </p>

              <button
                type="button"
                className="btn btn-p btn-lg"
                disabled={refreshLoading}
                onClick={handleRefreshAll}
                style={{ minWidth: 240, justifyContent: 'center' }}
              >
                {refreshLoading ? '⏳ جارٍ التحديث والمزامنة...' : '🔄 تحديث ومزامنة النظام الآن'}
              </button>

              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--ok-l)', borderRadius: 10, fontSize: '.82rem', color: 'var(--ok-d)', lineHeight: 1.6 }}>
                💡 <strong>متى يُفضّل استخدام المزامنة؟</strong> عند فتح النظام لأول مرة من متصفح جديد، أو عند إضافة بيانات من جهاز آخر، أو لمزامنة أحدث السجلات السحابية فوراً.
              </div>
            </div>
          </div>

          {/* النسخ الاحتياطي JSON */}
          <div className="wg" style={{ margin: 0 }}>
            <div className="wg-h">
              <h3>💾 النسخ الاحتياطي وتصدير البيانات (JSON Backup)</h3>
            </div>
            <div className="wg-b" style={{ padding: '22px' }}>
              <p style={{ fontSize: '.88rem', color: 'var(--g6)', marginBottom: 18, lineHeight: 1.7 }}>
                تصدير نسخة احتياطية محلية بصيغة JSON لجميع سجلات وبيانات المركز للاحتفاظ بها أو استعادتها لاحقاً.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-p"
                  onClick={exportData}
                  style={{ padding: '10px 20px', fontSize: '.9rem' }}
                >
                  📥 تصدير نسخة احتياطية كاملة
                </button>

                <label
                  className="btn btn-g"
                  style={{ cursor: 'pointer', padding: '10px 20px', fontSize: '.9rem' }}
                >
                  <span>📤 استيراد ملف نسخة احتياطية</span>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={importData}
                  />
                </label>
              </div>

              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--warn-l)', borderRadius: 10, fontSize: '.82rem', color: 'var(--warn)', lineHeight: 1.6 }}>
                ⚠️ <strong>تنبيه أمان:</strong> عملية الاستيراد تستبدل البيانات المخزنة محلياً بالملف المستورد — يُرجى أخذ نسخة احتياطية دائماً قبل الاستيراد.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          تبويب: عن النظام (About System)
      ────────────────────────────────────────────────────────────── */}
      {tab === 'about' && (
        <div className="wg" style={{ margin: 0 }}>
          <div className="wg-h">
            <h3>ℹ️ معلومات المنصة والمركز</h3>
          </div>
          <div className="wg-b" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'var(--pr-l)',
              color: 'var(--pr)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 16px',
              boxShadow: 'var(--sh)'
            }}>
              🏥
            </div>

            <h2 style={{ margin: '0 0 6px', fontSize: '1.3rem', fontWeight: 900 }}>نظام إدارة المراكز المتكامل</h2>
            <div style={{ color: 'var(--pr)', fontWeight: 700, fontSize: '.92rem', marginBottom: 6 }}>Special Centers Cloud Platform — V2.5 Pro</div>
            <p style={{ color: 'var(--g5)', fontSize: '.88rem', maxWidth: 480, margin: '0 auto 24px' }}>
              منظومة إدارية وتأهيلية سحابية متقدمة لتنظيم الطلاب، الجلسات، المقاييس الفنية، والعمليات المالية
            </p>

            <div style={{
              maxWidth: 520,
              margin: '0 auto',
              padding: '18px 22px',
              background: 'var(--g0)',
              borderRadius: 14,
              border: '1px solid var(--border-color)',
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: '.88rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--g5)' }}>المركز المسجل:</span>
                <strong>{center.name || '—'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--g5)' }}>المستخدم الحالي:</span>
                <strong>{currentUser?.name || '—'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--g5)' }}>اسم الدخول:</span>
                <strong dir="ltr" style={{ color: 'var(--pr)' }}>@{getCurrentUsername(currentUser)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--g5)' }}>الدور الوظيفي:</span>
                <strong>{getRoleLabel(currentUser?.role)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
