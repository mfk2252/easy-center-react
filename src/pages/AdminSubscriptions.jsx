import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, Timestamp, query, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  isPlatformAdminEmail, getTrialLeads, updateTrialLeadStatus, deleteTrialLead, saveTrialLead,
  createAdminDemoAccount, getAdminDemoAccounts, extendAdminDemoAccount,
  updateAdminDemoAccountStatus, deleteAdminDemoAccount
} from '../firebase/auth';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import { useApp } from '../context/AppContext';

const COUNTRY_BY_CODE = {
  '+966': 'السعودية', '+971': 'الإمارات', '+973': 'البحرين', '+974': 'قطر',
  '+965': 'الكويت', '+968': 'عُمان', '+20': 'مصر', '+962': 'الأردن',
  '+961': 'لبنان', '+963': 'سوريا', '+964': 'العراق', '+970': 'فلسطين',
  '+212': 'المغرب', '+216': 'تونس', '+213': 'الجزائر', '+218': 'ليبيا',
  '+249': 'السودان', '+967': 'اليمن', '+222': 'موريتانيا',
};

function countryFromPhoneCode(code) { return COUNTRY_BY_CODE[code] || (code || '—'); }
function tsToDate(ts) { return ts?.toDate ? ts.toDate() : (ts ? new Date(ts.seconds ? ts.seconds * 1000 : ts) : null); }
function fmtDate(d) { return d ? d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'; }

export default function AdminSubscriptions() {
  const { login } = useApp();
  const [activeTab, setActiveTab] = useState('centers'); // 'centers' | 'demoAccounts' | 'leads'
  const [centers, setCenters] = useState([]);
  const [leads, setLeads] = useState([]);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customMonths, setCustomMonths] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  // إدارة حسابات الديمو المؤقتة (Demo Accounts)
  const [showCreateDemoModal, setShowCreateDemoModal] = useState(false);
  const [createdDemoSuccess, setCreatedDemoSuccess] = useState(null);
  const [demoSearch, setDemoSearch] = useState('');
  const [demoFilterStatus, setDemoFilterStatus] = useState('all');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedDemoToExtend, setSelectedDemoToExtend] = useState(null);
  const [extendDaysCount, setExtendDaysCount] = useState(3);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [createDemoForm, setCreateDemoForm] = useState({
    centerName: '',
    managerName: '',
    username: 'admin',
    password: '123',
    durationDays: 3,
    phone: '',
    notes: '',
    seedData: true,
  });

  // فلاتر وميزات تبويب العملاء المحتملين (Leads)
  const [leadSearch, setLeadSearch] = useState('');
  const [leadFilterStatus, setLeadFilterStatus] = useState('all');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({ name: '', email: '', phone: '', org: '', note: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    await Promise.all([loadCenters(), loadDemoAccounts(), loadLeads()]);
    setLoading(false);
  }

  async function loadCenters() {
    try {
      const q = query(collection(db, 'centers'), limit(150));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setCenters(data);
    } catch(e) {
      console.error("خطأ جلب المراكز:", e);
    }
  }

  async function loadDemoAccounts() {
    try {
      const items = await getAdminDemoAccounts();
      setDemoAccounts(items);
    } catch (e) {
      console.error("خطأ جلب حسابات الديمو:", e);
    }
  }

  async function loadLeads() {
    try {
      const items = await getTrialLeads();
      setLeads(items);
    } catch (e) {
      console.error("خطأ جلب العملاء المحتملين:", e);
    }
  }

  async function handleCreateDemoSubmit(e) {
    if (e) e.preventDefault();
    if (!createDemoForm.username.trim()) {
      alert('يرجى كتابة اسم مستخدم للديمو');
      return;
    }
    if (!createDemoForm.password.trim()) {
      alert('يرجى كتابة كلمة مرور للديمو');
      return;
    }
    setCreatingDemo(true);
    try {
      const demo = await createAdminDemoAccount({
        centerName: createDemoForm.centerName || 'مركز تجريبي للعرض',
        managerName: createDemoForm.managerName || 'مدير تجريبي',
        username: createDemoForm.username,
        password: createDemoForm.password,
        durationDays: createDemoForm.durationDays || 3,
        phone: createDemoForm.phone,
        notes: createDemoForm.notes,
        seedData: createDemoForm.seedData,
      });

      setDemoAccounts(prev => [demo, ...prev.filter(d => d.username !== demo.username)]);
      setShowCreateDemoModal(false);
      setCreatedDemoSuccess(demo);
      setCreateDemoForm({
        centerName: '',
        managerName: '',
        username: 'admin',
        password: '123',
        durationDays: 3,
        phone: '',
        notes: '',
        seedData: true,
      });
    } catch (err) {
      alert('تعذر إنشاء حساب الديمو: ' + err.message);
    } finally {
      setCreatingDemo(false);
    }
  }

  async function handleExtendDemoSubmit(e) {
    if (e) e.preventDefault();
    if (!selectedDemoToExtend) return;
    try {
      const updated = await extendAdminDemoAccount(selectedDemoToExtend.username, extendDaysCount);
      setDemoAccounts(prev => prev.map(d => d.username === updated.username ? updated : d));
      setShowExtendModal(false);
      setSelectedDemoToExtend(null);
      alert(`✅ تم تمديد صلاحية الديمو لمدة ${extendDaysCount} أيام بنجاح`);
    } catch (err) {
      alert('تعذر تمديد الصلاحية: ' + err.message);
    }
  }

  async function handleToggleDemoStatus(username, currentStatus) {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const updated = await updateAdminDemoAccountStatus(username, nextStatus);
      setDemoAccounts(prev => prev.map(d => d.username === username ? updated : d));
    } catch (err) {
      alert('تعذر تغيير الحالة: ' + err.message);
    }
  }

  async function handleDeleteDemo(username) {
    if (!window.confirm(`هل أنت متأكد من حذف حساب الديمو (${username}) وبياناته؟`)) return;
    try {
      await deleteAdminDemoAccount(username);
      setDemoAccounts(prev => prev.filter(d => d.username !== username));
    } catch (err) {
      alert('تعذر الحذف: ' + err.message);
    }
  }

  async function handleLaunchDemoDirectly(demo) {
    const { initDemoData } = await import('../utils/demoData');
    const expiry = new Date(demo.expiryDate);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((expiry - now) / 86400000));
    initDemoData(demo.centerId, demo.managerName, demo.centerName, daysLeft);

    const demoUser = {
      uid: demo.centerId,
      email: demo.username.includes('@') ? demo.username : `${demo.username}@easycenter.demo`,
      name: demo.managerName || 'مدير تجريبي',
      role: 'manager',
      centerId: demo.centerId,
      isDemo: true,
      demoAccount: { ...demo, daysLeft },
      subscription: {
        allowed: true,
        status: 'trial',
        reason: 'admin_demo',
        daysLeft,
        isDemo: true,
        expiryDate: demo.expiryDate,
      },
    };
    login(demoUser);
  }

  async function handleUpdateLeadStatus(leadId, status) {
    try {
      await updateTrialLeadStatus(leadId, status);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    } catch (e) {
      alert('تعذر تحديث حالة العميل: ' + e.message);
    }
  }

  async function handleDeleteLead(leadId) {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل من القائمة؟')) return;
    try {
      await deleteTrialLead(leadId);
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (e) {
      alert('تعذر الحذف: ' + e.message);
    }
  }

  async function handleAddManualLead(e) {
    e.preventDefault();
    if (!newLeadForm.email || !newLeadForm.name) {
      alert('يرجى كتابة الاسم والبريد الإلكتروني على الأقل');
      return;
    }
    try {
      const saved = await saveTrialLead({
        ...newLeadForm,
        type: 'manual_lead',
      });
      setLeads(prev => [saved, ...prev]);
      setShowAddLeadModal(false);
      setNewLeadForm({ name: '', email: '', phone: '', org: '', note: '' });
      alert('✅ تم إضافة العميل المحتمل بنجاح');
    } catch (err) {
      alert('حدث خطأ أثناء الإضافة: ' + err.message);
    }
  }

  async function activateCenter(centerId, months) {
    setUpdating(centerId);
    try {
      const isPermanent = months == null;
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + (isPermanent ? 1200 : months));

      const subData = {
        status: 'active',
        expiryDate: Timestamp.fromDate(expiry),
        months: isPermanent ? null : months,
        isPermanent: isPermanent,
      };

      await updateDoc(doc(db, 'centers', centerId), {
        'subscription.status': 'active',
        'subscription.expiryDate': subData.expiryDate,
        'subscription.activatedAt': serverTimestamp(),
        'subscription.months': subData.months,
        'subscription.isPermanent': subData.isPermanent,
      });

      // تحديث الحالة محلياً لتوفير استعلام كامل لكل المراكز
      setCenters(prev => prev.map(c => c.id === centerId ? {
        ...c,
        subscription: {
          ...(c.subscription || {}),
          ...subData,
        }
      } : c));

      alert(isPermanent ? '✅ تم تفعيل اشتراك دائم' : '✅ تم التفعيل بنجاح');
    } catch(e) {
      alert('❌ خطأ: ' + e.message);
    } finally {
      setUpdating(null);
    }
  }

  async function activateCustom(centerId) {
    const n = Number(customMonths[centerId]);
    if (!n || n <= 0) { alert('⚠️ أدخل عدد أشهر صحيح'); return; }
    await activateCenter(centerId, n);
  }

  async function suspendCenter(centerId) {
    if (!window.confirm('إيقاف المركز؟')) return;
    setUpdating(centerId);
    try {
      await updateDoc(doc(db, 'centers', centerId), { 'subscription.status': 'suspended' });
      setCenters(prev => prev.map(c => c.id === centerId ? {
        ...c,
        subscription: { ...(c.subscription || {}), status: 'suspended' }
      } : c));
    } catch(e) {
      alert('❌ خطأ: ' + e.message);
    } finally {
      setUpdating(null);
    }
  }

  function getDaysLeftInfo(sub) {
    if (!sub?.expiryDate || sub.status !== 'active') return null;
    if (sub.isPermanent) return { label: '∞ دائم', color: '#7c3aed' };

    const expiry = tsToDate(sub.expiryDate);
    const diffDays = Math.ceil((expiry - new Date()) / 86400000);

    if (diffDays <= 0) return { label: 'منتهي ❌', color: '#ef4444' };
    if (diffDays <= 7) return { label: `متبقي ${diffDays} أيام ⚠️`, color: '#f59e0b' };
    if (diffDays <= 30) return { label: `متبقي ${diffDays} يوماً`, color: '#f59e0b' };
    return { label: `متبقي ${diffDays} يوماً 🟢`, color: '#10b981' };
  }

  function getStatusBadge(center) {
    if (isPlatformAdminEmail(center.managerEmail)) return { label: 'مدير النظام 👑', color: '#8b5cf6', type: 'admin' };
    const sub = center.subscription;
    if (!sub) return { label: 'تجريبي ⏳', color: '#3b82f6', type: 'trial' };
    if (sub.status === 'active') {
      if (sub.isPermanent) return { label: 'دائم ♾️', color: '#7c3aed', type: 'active' };
      return { label: 'مفعّل ✅', color: '#10b981', type: 'active' };
    }
    if (sub.status === 'suspended') return { label: 'موقوف 🔒', color: '#6b7280', type: 'suspended' };
    return { label: 'تجريبي ⏳', color: '#3b82f6', type: 'trial' };
  }

  const enriched = useMemo(() => centers.map(c => ({
    ...c,
    _created: tsToDate(c.createdAt),
    _activatedAt: tsToDate(c.subscription?.activatedAt),
    _expiry: tsToDate(c.subscription?.expiryDate),
  })), [centers]);

  const filteredCenters = useMemo(() => enriched.filter(center => {
    const matchesSearch =
      (center.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (center.managerEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    const badge = getStatusBadge(center);
    const matchesFilter = filterStatus === 'all' || badge.type === filterStatus;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const aLeft = a.subscription?.status === 'active' && !a.subscription?.isPermanent && a._expiry ? a._expiry - new Date() : Infinity;
    const bLeft = b.subscription?.status === 'active' && !b.subscription?.isPermanent && b._expiry ? b._expiry - new Date() : Infinity;
    return aLeft - bLeft;
  }), [enriched, searchTerm, filterStatus]);

  const stats = useMemo(() => ({
    total: enriched.length,
    active: enriched.filter(c => c.subscription?.status === 'active' && !c.subscription?.isPermanent).length,
    permanent: enriched.filter(c => c.subscription?.isPermanent).length,
    trial: enriched.filter(c => !c.subscription || !c.subscription.status || c.subscription.status === 'trial').length,
    expiringSoon: enriched.filter(c => {
      if (c.subscription?.status !== 'active' || c.subscription?.isPermanent || !c._expiry) return false;
      const d = Math.ceil((c._expiry - new Date()) / 86400000);
      return d > 0 && d <= 7;
    }).length,
    suspended: enriched.filter(c => c.subscription?.status === 'suspended').length,
  }), [enriched]);

  const leadStats = useMemo(() => ({
    total: leads.length,
    newCount: leads.filter(l => !l.status || l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    demoTrials: leads.filter(l => l.type === 'interactive_demo' || l.type === 'demo_request').length,
    registeredTrials: leads.filter(l => l.type === 'registered_trial').length,
  }), [leads]);

  const filteredLeads = useMemo(() => leads.filter(l => {
    const term = leadSearch.toLowerCase();
    const matchSearch =
      (l.name || '').toLowerCase().includes(term) ||
      (l.email || '').toLowerCase().includes(term) ||
      (l.phone || '').toLowerCase().includes(term) ||
      (l.org || '').toLowerCase().includes(term);
    const matchStatus = leadFilterStatus === 'all' || (l.status || 'new') === leadFilterStatus;
    return matchSearch && matchStatus;
  }), [leads, leadSearch, leadFilterStatus]);

  const demoStats = useMemo(() => {
    const now = new Date();
    return {
      total: demoAccounts.length,
      active: demoAccounts.filter(d => d.status !== 'suspended' && new Date(d.expiryDate) > now).length,
      expired: demoAccounts.filter(d => d.status === 'expired' || new Date(d.expiryDate) <= now).length,
      suspended: demoAccounts.filter(d => d.status === 'suspended').length,
    };
  }, [demoAccounts]);

  const filteredDemoAccounts = useMemo(() => {
    const term = demoSearch.toLowerCase().trim();
    const now = new Date();
    return demoAccounts.filter(d => {
      const matchSearch =
        (d.centerName || '').toLowerCase().includes(term) ||
        (d.managerName || '').toLowerCase().includes(term) ||
        (d.username || '').toLowerCase().includes(term) ||
        (d.phone || '').toLowerCase().includes(term) ||
        (d.notes || '').toLowerCase().includes(term);

      const isExpired = new Date(d.expiryDate) <= now || d.status === 'expired';
      const isSuspended = d.status === 'suspended';
      const isActive = !isExpired && !isSuspended;

      let matchStatus = true;
      if (demoFilterStatus === 'active') matchStatus = isActive;
      else if (demoFilterStatus === 'expired') matchStatus = isExpired;
      else if (demoFilterStatus === 'suspended') matchStatus = isSuspended;

      return matchSearch && matchStatus;
    });
  }, [demoAccounts, demoSearch, demoFilterStatus]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-main)' }}>⏳ جارٍ تحميل البيانات...</div>;

  const DURATION_BTNS = [
    ['شهر', 1], ['6 أشهر', 6], ['سنة', 12], ['سنتان', 24], ['5 سنوات', 60],
  ];

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto', direction: 'rtl', color: 'var(--text-main)' }}>
      <UnifiedPageHeader
        icon="🔐"
        title="إدارة اشتراكات المنصة والمراكز"
        subtitle="إدارة تراخيص المراكز، تمديد الفترات، وإنشاء حسابات الديمو المؤقتة للعروض والزيارات"
        badge={`${centers.length} مراكز · ${demoAccounts.length} حسابات ديمو · ${leads.length} عملاء مهتمين`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {activeTab === 'demoAccounts' && (
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: '#fff', fontWeight: 800 }}
                onClick={() => setShowCreateDemoModal(true)}
              >
                ➕ إنشاء حساب ديمو تجريبي جديد
              </button>
            )}
            {activeTab === 'leads' && (
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'var(--pr)', color: '#fff' }}
                onClick={() => setShowAddLeadModal(true)}
              >
                ➕ إضافة عميل يدوياً
              </button>
            )}
            <button
              type="button"
              className="btn btn-g btn-sm"
              onClick={loadAllData}
              title="تحديث البيانات من السحابة"
            >
              🔄 تحديث البيانات
            </button>
          </div>
        }
      />

      {/* شريط التبديل بين المراكز والحسابات التجريبية والعملاء المحتملين */}
      <div style={{
        display: 'flex',
        gap: 10,
        margin: '18px 0 22px',
        background: 'var(--bg-card)',
        padding: '6px',
        borderRadius: 14,
        border: '1px solid var(--border-color)',
        width: 'fit-content',
        flexWrap: 'wrap',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('centers')}
          style={{
            padding: '9px 20px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'centers' ? 'var(--pr)' : 'transparent',
            color: activeTab === 'centers' ? '#fff' : 'var(--text-main)',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all .15s',
          }}
        >
          <span>🏢 المراكز والاشتراكات</span>
          <span style={{
            fontSize: '.76rem',
            background: activeTab === 'centers' ? 'rgba(255,255,255,.25)' : 'var(--g1)',
            padding: '2px 8px',
            borderRadius: 999,
          }}>
            {centers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('demoAccounts')}
          style={{
            padding: '9px 20px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'demoAccounts' ? '#0284c7' : 'transparent',
            color: activeTab === 'demoAccounts' ? '#fff' : 'var(--text-main)',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all .15s',
          }}
        >
          <span>🎮 الحسابات التجريبية (ديمو مؤقت)</span>
          <span style={{
            fontSize: '.76rem',
            background: activeTab === 'demoAccounts' ? 'rgba(255,255,255,.25)' : 'var(--g1)',
            padding: '2px 8px',
            borderRadius: 999,
          }}>
            {demoAccounts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          style={{
            padding: '9px 20px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'leads' ? 'var(--pr)' : 'transparent',
            color: activeTab === 'leads' ? '#fff' : 'var(--text-main)',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all .15s',
          }}
        >
          <span>🎯 العملاء المهتمين والمتابعة</span>
          {leadStats.newCount > 0 ? (
            <span style={{
              fontSize: '.76rem',
              background: '#ef4444',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 999,
              fontWeight: 900,
            }}>
              {leadStats.newCount} جديد
            </span>
          ) : (
            <span style={{
              fontSize: '.76rem',
              background: activeTab === 'leads' ? 'rgba(255,255,255,.25)' : 'var(--g1)',
              padding: '2px 8px',
              borderRadius: 999,
            }}>
              {leads.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'centers' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="unified-stat-box">
          <div className="stat-label">✅ نشط (مؤقت)</div>
          <div className="stat-val" style={{ color: '#10b981' }}>{stats.active}</div>
          <div className="stat-sub">اشتراك سنوي أو شهري سارٍ</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">💎 اشتراك دائم</div>
          <div className="stat-val" style={{ color: '#7c3aed' }}>{stats.permanent}</div>
          <div className="stat-sub">ترخيص مدى الحياة</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">⏳ تجريبي</div>
          <div className="stat-val" style={{ color: '#3b82f6' }}>{stats.trial}</div>
          <div className="stat-sub">فترة تجربة مجانية</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">⚠️ ينتهي قريباً (7 أيام)</div>
          <div className="stat-val" style={{ color: '#f59e0b' }}>{stats.expiringSoon}</div>
          <div className="stat-sub">يتطلب تجديد الاشتراك</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">🛑 موقوف</div>
          <div className="stat-val" style={{ color: '#6b7280' }}>{stats.suspended}</div>
          <div className="stat-sub">اشتراكات معلقة أو ملغاة</div>
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, background: 'var(--bg-card)', padding: 14,
        borderRadius: 12, border: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="🔍 ابحث باسم المركز أو البريد الإلكتروني..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1, minWidth: 250, padding: '8px 14px', borderRadius: 8,
            border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)',
          }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'المفعلة' },
            { id: 'suspended', label: 'الموقوفة' },
            { id: 'trial', label: 'التجريبية' },
            { id: 'admin', label: 'المدراء' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-color)',
                background: filterStatus === btn.id ? 'var(--pr)' : 'transparent',
                color: filterStatus === btn.id ? '#fff' : 'var(--text-main)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredCenters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--g4)' }}>ℹ️ لا توجد نتائج مطابقة للبحث.</div>
        ) : (
          filteredCenters.map(center => {
            const badge = getStatusBadge(center);
            const daysInfo = getDaysLeftInfo(center.subscription);
            const isSystemAdmin = isPlatformAdminEmail(center.managerEmail);
            const isExpanded = expandedId === center.id;
            const expiryText = center._expiry ? fmtDate(center._expiry) : 'غير محدد';
            const whatsappText = encodeURIComponent(
              `مرحباً أستاذ، نود تذكيركم بحالة اشتراك مركزكم الفاضل (${center.name || 'Easy Center'}) في النظام، ينتهي الاشتراك بتاريخ: ${expiryText}. طاب يومكم بكل خير.`
            );
            const whatsappUrl = `https://wa.me/${center.managerPhone || ''}?text=${whatsappText}`;

            return (
              <div key={center.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', opacity: updating === center.id ? 0.6 : 1,
                pointerEvents: updating === center.id ? 'none' : 'auto', overflow: 'hidden',
              }}>
                <div
                  style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : center.id)}
                >
                  <div style={{ flex: '1 1 250px', textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {center.name || 'بدون اسم'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--g5)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{center.managerEmail}</span>
                      {center.managerPhone && (
                        <a href={whatsappUrl} target="_blank" rel="noreferrer" title="تذكير عبر واتساب"
                           onClick={e => e.stopPropagation()}
                           style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                          💬
                        </a>
                      )}
                    </div>
                    {center._expiry && !isSystemAdmin && !center.subscription?.isPermanent && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--g4)', marginTop: 4 }}>
                        📅 ينتهي في: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{expiryText}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', minWidth: 120 }}>
                    <div style={{ padding: '4px 10px', borderRadius: 20, color: badge.color, background: badge.color + '18', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {badge.label}
                    </div>
                    {daysInfo && !isSystemAdmin && (
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: daysInfo.color, padding: '2px 8px', background: daysInfo.color + '18', borderRadius: 6, fontVariantNumeric: 'tabular-nums' }}>
                        {daysInfo.label}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '.8rem', color: 'var(--g5)' }}>{isExpanded ? '▲ إخفاء' : '▼ تفاصيل وتفعيل'}</span>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, margin: '14px 0' }}>
                      {[
                        ['اسم المركز', center.name || '—'],
                        ['البريد', center.managerEmail || '—'],
                        ['الدولة', countryFromPhoneCode(center.phoneCode)],
                        ['الهاتف', center.phone || center.managerPhone || '—'],
                        ['تاريخ التسجيل بالمنصة', fmtDate(center._created)],
                        ['آخر تفعيل', fmtDate(center._activatedAt)],
                        ['تاريخ الانتهاء', center.subscription?.isPermanent ? '∞ دائم' : expiryText],
                        ['المدة الحالية', center.subscription?.isPermanent ? 'دائم' : (center.subscription?.months ? `${center.subscription.months} شهر` : '—')],
                      ].map(([k, v]) => (
                        <div key={k} style={{ background: 'var(--g0)', borderRadius: 8, padding: '8px 12px' }}>
                          <div style={{ fontSize: '.7rem', color: 'var(--g5)' }}>{k}</div>
                          <div style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--text-main)' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {DURATION_BTNS.map(([label, m]) => (
                        <button key={label} className="btn btn-xs" onClick={() => activateCenter(center.id, m)}>{label}</button>
                      ))}
                      <button className="btn btn-xs" style={{ background: '#7c3aed', color: '#fff' }} onClick={() => activateCenter(center.id, null)}>
                        ♾️ دائم
                      </button>
                      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input
                          type="number" min="1" placeholder="عدد أشهر مخصص"
                          value={customMonths[center.id] || ''}
                          onChange={e => setCustomMonths(f => ({ ...f, [center.id]: e.target.value }))}
                          style={{ width: 110, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                        />
                        <button className="btn btn-xs btn-g" onClick={() => activateCustom(center.id)}>تفعيل مخصص</button>
                      </span>

                      {!isSystemAdmin && (
                        <button className="btn btn-xs btn-d" style={{ marginRight: 'auto' }} onClick={() => suspendCenter(center.id)}>إيقاف</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
          </div>
        </>
      ) : activeTab === 'demoAccounts' ? (
        /* تبويب حسابات الديمو المؤقتة (Demo Accounts) */
        <>
          {/* إحصائيات حسابات الديمو */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div className="unified-stat-box">
              <div className="stat-label">🎮 إجمالي حسابات الديمو</div>
              <div className="stat-val" style={{ color: '#0284c7' }}>{demoStats.total}</div>
              <div className="stat-sub">حسابات منشأة للعروض والزيارات</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">🟢 نشطة وسارية المفعول</div>
              <div className="stat-val" style={{ color: '#10b981' }}>{demoStats.active}</div>
              <div className="stat-sub">يمكن تسجيل الدخول بها حالياً</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">🔴 منتهية الصلاحية</div>
              <div className="stat-val" style={{ color: '#ef4444' }}>{demoStats.expired}</div>
              <div className="stat-sub">انتهت مدتها (تتطلب تمديد أو اشتراك)</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">⏸️ موقوفة يدوياً</div>
              <div className="stat-val" style={{ color: '#64748b' }}>{demoStats.suspended}</div>
              <div className="stat-sub">تم إيقافها من لوحة التحكم</div>
            </div>
          </div>

          {/* شريط البحث والفلترة وأزرار الإجراءات */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 20, background: 'var(--bg-card)', padding: 14,
            borderRadius: 12, border: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <input
              type="text"
              placeholder="🔍 ابحث بالمركز، اسم المسؤول، اسم المستخدم، الجوال، الملاحظات..."
              value={demoSearch}
              onChange={(e) => setDemoSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 260, padding: '8px 14px', borderRadius: 8,
                border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)',
              }}
            />

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'active', label: 'ساري المفعول 🟢' },
                { id: 'expired', label: 'منتهي الصلاحية 🔴' },
                { id: 'suspended', label: 'موقوف ⏸️' },
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setDemoFilterStatus(btn.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-color)',
                    background: demoFilterStatus === btn.id ? '#0284c7' : 'transparent',
                    color: demoFilterStatus === btn.id ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-sm"
              style={{ background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: '#fff', fontWeight: 800 }}
              onClick={() => setShowCreateDemoModal(true)}
            >
              ➕ إنشاء ديمو جديد
            </button>
          </div>

          {/* قائمة كروت حسابات الديمو */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredDemoAccounts.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: 48, background: 'var(--bg-card)', borderRadius: 16,
                border: '1px dashed var(--border-color)', color: 'var(--text-sub)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎮</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: 'var(--text-main)' }}>لا توجد حسابات ديمو تجريبية حالياً</h3>
                <p style={{ maxWidth: 480, margin: '0 auto 18px', fontSize: '0.9rem' }}>
                  يمكنك إنشاء حساب تجريبي مؤقت بمدة مخصصة (3، 4، 5 أيام...) لتقديمه للمؤسسات والعملاء كعرض حي ومباشر للنظام.
                </p>
                <button
                  type="button"
                  className="btn"
                  style={{ background: '#0284c7', color: '#fff', fontWeight: 800, padding: '10px 24px' }}
                  onClick={() => setShowCreateDemoModal(true)}
                >
                  ➕ إنشاء أول حساب ديمو الآن
                </button>
              </div>
            ) : (
              filteredDemoAccounts.map(demo => {
                const now = new Date();
                const expiry = new Date(demo.expiryDate);
                const isExpired = expiry <= now || demo.status === 'expired';
                const isSuspended = demo.status === 'suspended';
                const daysLeft = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
                const hoursLeft = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60)));

                const shareText = `السلام عليكم ورحمة الله وبركاته 🌸\nيسعدنا تزويدكم ببيانات الحساب التجريبي المخصص لـ (${demo.centerName}) على نظام Easy Center لإدارة وتأهيل ذوي الإعاقة:\n\n🌐 رابط المنصة: ${window.location.origin}\n👤 اسم المستخدم: ${demo.username}\n🔑 كلمة المرور: ${demo.password}\n⏳ صلاحية الحساب: ${demo.durationDays || 3} أيام (حتى ${expiry.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })})\n\nنتمنى لكم تجربة موفقة ومميزة، ونحن على أتم الاستعداد لأي استفسار! 🌟`;
                const cleanPhone = (demo.phone || '').replace(/[^0-9]/g, '');
                const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareText)}` : `https://wa.me/?text=${encodeURIComponent(shareText)}`;

                return (
                  <div key={demo.username} style={{
                    background: 'var(--bg-card)',
                    border: isExpired ? '1.5px solid #f87171' : isSuspended ? '1px solid var(--g4)' : '1.5px solid #38bdf8',
                    borderRadius: 16, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 280 }}>
                        {/* العنوان والحالة */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.4rem' }}>🎮</span>
                          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{demo.centerName}</h3>
                          <span style={{
                            fontSize: '.75rem', padding: '3px 10px', borderRadius: 999, fontWeight: 800,
                            background: isExpired ? '#fee2e2' : isSuspended ? '#f1f5f9' : '#dcfce7',
                            color: isExpired ? '#ef4444' : isSuspended ? '#64748b' : '#15803d',
                          }}>
                            {isExpired ? '🔴 منتهي الصلاحية' : isSuspended ? '⏸️ موقوف' : `🟢 ساري (متبقي ${daysLeft > 0 ? `${daysLeft} يوم` : `${hoursLeft} ساعة`})`}
                          </span>
                        </div>

                        {/* صندوق بيانات الاعتماد المباشرة */}
                        <div style={{
                          background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                          borderRadius: 10, padding: '10px 14px', margin: '10px 0',
                          display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
                        }}>
                          <div>
                            <span style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>اسم المسؤول: </span>
                            <strong style={{ fontSize: '.88rem' }}>{demo.managerName || 'مدير تجريبي'}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>اسم المستخدم: </span>
                            <code style={{ fontSize: '.9rem', color: '#0284c7', fontWeight: 800, background: 'rgba(2,132,199,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                              {demo.username}
                            </code>
                          </div>
                          <div>
                            <span style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>كلمة المرور: </span>
                            <code style={{ fontSize: '.9rem', color: '#059669', fontWeight: 800, background: 'rgba(5,150,105,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                              {demo.password}
                            </code>
                          </div>
                        </div>

                        {/* التفاصيل الإضافية */}
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {demo.phone && <div>📱 <strong>الهاتف / واتساب:</strong> {demo.phone}</div>}
                          {demo.notes && <div>📝 <strong>ملاحظات العرض:</strong> {demo.notes}</div>}
                          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4, fontSize: '.76rem', color: 'var(--g4)' }}>
                            <span>📅 تاريخ الإنشاء: {new Date(demo.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            <span>⏳ تاريخ الانتهاء: {expiry.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} ({demo.durationDays || 3} أيام)</span>
                          </div>
                        </div>
                      </div>

                      {/* أزرار الإجراءات */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-xs"
                            style={{ background: '#0284c7', color: '#fff', fontWeight: 800, padding: '6px 12px' }}
                            onClick={() => {
                              navigator.clipboard.writeText(shareText);
                              alert('✅ تم نسخ بيانات الدخول المنسقة كاملة للحافظة جاهزة للإرسال!');
                            }}
                          >
                            📋 نسخ بيانات الدخول
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs"
                            style={{ background: '#25D366', color: '#fff', fontWeight: 800, padding: '6px 12px' }}
                          >
                            💬 إرسال عبر واتساب
                          </a>

                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            style={{ padding: '6px 12px', fontWeight: 700 }}
                            onClick={() => {
                              setSelectedDemoToExtend(demo);
                              setExtendDaysCount(3);
                              setShowExtendModal(true);
                            }}
                          >
                            ⏱️ تمديد الصلاحية
                          </button>

                          <button
                            type="button"
                            className="btn btn-xs"
                            style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', fontWeight: 800, padding: '6px 12px' }}
                            onClick={() => handleLaunchDemoDirectly(demo)}
                            title="فتح الديمو واستعراضه فوراً"
                          >
                            🚀 تجربة الديمو الآن
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                          <button
                            type="button"
                            className="btn btn-xs"
                            style={{
                              background: isSuspended ? '#dcfce7' : '#fee2e2',
                              color: isSuspended ? '#15803d' : '#b91c1c',
                              fontWeight: 700,
                            }}
                            onClick={() => handleToggleDemoStatus(demo.username, demo.status)}
                          >
                            {isSuspended ? '▶️ تنشيط الحساب' : '⏸️ إيقاف مؤقت'}
                          </button>

                          <button
                            type="button"
                            className="btn btn-xs btn-d"
                            onClick={() => handleDeleteDemo(demo.username)}
                            title="حذف حساب الديمو نهائياً"
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* تبويب العملاء المحتملين وطلبات الديمو (Trial Leads) */
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div className="unified-stat-box">
              <div className="stat-label">🎯 إجمالي المهتمين</div>
              <div className="stat-val" style={{ color: 'var(--pr)' }}>{leadStats.total}</div>
              <div className="stat-sub">كافة طلبات الديمو والتجربة</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">🔥 بحاجة لمتابعة (جديد)</div>
              <div className="stat-val" style={{ color: '#ef4444' }}>{leadStats.newCount}</div>
              <div className="stat-sub">تواصل معهم لتقديم عروض</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">🎮 طلبات ديمو تفاعلي</div>
              <div className="stat-val" style={{ color: '#0284c7' }}>{leadStats.demoTrials}</div>
              <div className="stat-sub">جرّبوا الحساب التجريبي</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">✨ مراكز تجريبية (5 أيام)</div>
              <div className="stat-val" style={{ color: '#f59e0b' }}>{leadStats.registeredTrials}</div>
              <div className="stat-sub">أنشأوا حسابات مراكز جديدة</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">🏆 تم التحويل لاشتراك</div>
              <div className="stat-val" style={{ color: '#10b981' }}>{leadStats.converted}</div>
              <div className="stat-sub">أصبحوا عملاء فعليين</div>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 12, marginBottom: 20, background: 'var(--bg-card)', padding: 14,
            borderRadius: 12, border: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center',
          }}>
            <input
              type="text"
              placeholder="🔍 ابحث بالاسم، البريد، الجوال، أو اسم المركز..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 260, padding: '8px 14px', borderRadius: 8,
                border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)',
              }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'new', label: 'جديد 🔴' },
                { id: 'contacted', label: 'تم التواصل 💬' },
                { id: 'converted', label: 'تم التحويل 🏆' },
                { id: 'closed', label: 'مغلقة' },
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setLeadFilterStatus(btn.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-color)',
                    background: leadFilterStatus === btn.id ? 'var(--pr)' : 'transparent',
                    color: leadFilterStatus === btn.id ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredLeads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-color)', color: 'var(--g4)' }}>
                ℹ️ لا يوجد عملاء محتملين مسجلين وفق هذا الفلتر حالياً. بمجرد أن يطلب زائر ديمو أو ينشئ مركزاً تجريبياً، ستظهر بياناته هنا فوراً للتواصل معه.
              </div>
            ) : (
              filteredLeads.map(lead => {
                const isNew = !lead.status || lead.status === 'new';
                const isContacted = lead.status === 'contacted';
                const isConverted = lead.status === 'converted';

                const createdStr = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '—';

                const leadMsg = encodeURIComponent(
                  `السلام عليكم ورحمة الله وبركاته، أهلاً بك أستاذ/ة ${lead.name || ''} 🌸\nمعك إدارة نظام Easy Center لإدارة وتأهيل ذوي الإعاقة.\nلاحظنا اهتمامكم وتجربتكم للنظام${lead.org ? ` بخصوص (${lead.org})` : ''}، ويسعدنا جداً تقديم الدعم أو الإجابة على أي استفسار، وترتيب العرض الأنسب لمركزكم. هل يناسبكم التواصل الآن؟`
                );
                const leadPhoneClean = (lead.phone || '').replace(/[^0-9]/g, '');
                const waUrl = leadPhoneClean ? `https://wa.me/${leadPhoneClean}?text=${leadMsg}` : null;
                const mailtoUrl = lead.email ? `mailto:${lead.email}?subject=${encodeURIComponent('بخصوص تجربتكم لنظام Easy Center لإدارة مراكز التأهيل')}` : null;

                return (
                  <div key={lead.id} style={{
                    background: 'var(--bg-card)', border: isNew ? '1.5px solid #f87171' : '1px solid var(--border-color)',
                    borderRadius: 14, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800 }}>{lead.name || 'عميل بدون اسم'}</h3>
                          {lead.type === 'interactive_demo' && (
                            <span style={{ fontSize: '.72rem', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                              🎮 ديمو تفاعلي
                            </span>
                          )}
                          {lead.type === 'registered_trial' && (
                            <span style={{ fontSize: '.72rem', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                              ✨ تسجيل مركز تجريبي (5 أيام)
                            </span>
                          )}
                          {lead.type === 'manual_lead' && (
                            <span style={{ fontSize: '.72rem', background: '#f3e8ff', color: '#7c3aed', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                              👤 مدخل يدوياً
                            </span>
                          )}
                          <span style={{
                            fontSize: '.72rem', padding: '2px 8px', borderRadius: 6, fontWeight: 800,
                            background: isNew ? '#fee2e2' : isContacted ? '#dbeafe' : isConverted ? '#d1fae5' : '#f1f5f9',
                            color: isNew ? '#ef4444' : isContacted ? '#2563eb' : isConverted ? '#059669' : '#64748b',
                          }}>
                            {isNew ? '🔴 جديد (بحاجة لتواصل)' : isContacted ? '💬 تم التواصل' : isConverted ? '🏆 تم التحويل لمشترك' : 'مغلقة'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.86rem', color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {lead.org && <div>🏢 <strong>المركز / الجهة:</strong> {lead.org}</div>}
                          <div>📧 <strong>البريد:</strong> <a href={mailtoUrl} style={{ color: 'var(--pr)', textDecoration: 'none' }}>{lead.email}</a></div>
                          {lead.phone && <div>📱 <strong>الجوال:</strong> {lead.phone}</div>}
                          {lead.note && <div>📝 <strong>ملاحظة:</strong> {lead.note}</div>}
                          <div style={{ fontSize: '0.74rem', color: 'var(--g4)', marginTop: 4 }}>🕒 تاريخ الطلب: {createdStr}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs"
                              style={{ background: '#25D366', color: '#fff', fontWeight: 800, padding: '6px 12px' }}
                            >
                              💬 مراسلة واتساب
                            </a>
                          )}
                          {mailtoUrl && (
                            <a
                              href={mailtoUrl}
                              className="btn btn-xs btn-g"
                              style={{ padding: '6px 12px' }}
                            >
                              ✉️ مراسلة بريد
                            </a>
                          )}
                          <button
                            type="button"
                            className="btn btn-xs btn-d"
                            onClick={() => handleDeleteLead(lead.id)}
                            title="حذف العميل"
                          >
                            🗑️
                          </button>
                        </div>

                        {/* تغيير الحالة */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>الحالة:</span>
                          <select
                            value={lead.status || 'new'}
                            onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                            style={{
                              padding: '4px 8px', borderRadius: 6, fontSize: '.78rem',
                              border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)',
                              fontWeight: 700,
                            }}
                          >
                            <option value="new">🔴 جديد</option>
                            <option value="contacted">💬 تم التواصل</option>
                            <option value="converted">🏆 تم التحويل لمشترك</option>
                            <option value="closed">⚪ مغلقة / غير مهتم</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* نافذة إنشاء حساب ديمو تجريبي جديد */}
      {showCreateDemoModal && (
        <div className="demo-modal-overlay" onClick={() => !creatingDemo && setShowCreateDemoModal(false)}>
          <div className="demo-modal-card" onClick={e => e.stopPropagation()}>
            <div className="demo-modal-hd">
              <button
                type="button"
                className="demo-modal-close"
                onClick={() => setShowCreateDemoModal(false)}
                disabled={creatingDemo}
              >
                ✕
              </button>
              <h3>🎮 إنشاء حساب ديمو تجريبي مؤقت</h3>
              <p>أنشئ حساب ديمو فوري لمؤسسة أو عميل، مع تحديد اسم المستخدم وكلمة المرور وصلاحية الأيام (3، 4، 5 أيام...) يدوياً.</p>
            </div>

            <form className="demo-modal-body" onSubmit={handleCreateDemoSubmit}>
              <div className="lf">
                <label>اسم المركز أو المؤسسة *</label>
                <input
                  required
                  value={createDemoForm.centerName}
                  onChange={e => setCreateDemoForm({ ...createDemoForm, centerName: e.target.value })}
                  placeholder="مثال: مركز الأمل للتأهيل والعلاج الطبيعي"
                  disabled={creatingDemo}
                />
              </div>

              <div className="lf">
                <label>اسم الشخص المسؤول / المدير التجريبي</label>
                <input
                  value={createDemoForm.managerName}
                  onChange={e => setCreateDemoForm({ ...createDemoForm, managerName: e.target.value })}
                  placeholder="مثال: د. عبدالرحمن أو أ. فاطمة"
                  disabled={creatingDemo}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="lf">
                  <label>اسم المستخدم للدخول (Username) *</label>
                  <input
                    required
                    value={createDemoForm.username}
                    onChange={e => setCreateDemoForm({ ...createDemoForm, username: e.target.value })}
                    placeholder="admin أو amal-demo"
                    dir="ltr"
                    disabled={creatingDemo}
                  />
                  <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>اسم بسيط للدخول دون تعقيد</span>
                </div>

                <div className="lf">
                  <label>كلمة المرور للدخول (Password) *</label>
                  <input
                    required
                    value={createDemoForm.password}
                    onChange={e => setCreateDemoForm({ ...createDemoForm, password: e.target.value })}
                    placeholder="123 أو easy123"
                    dir="ltr"
                    disabled={creatingDemo}
                  />
                  <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>كلمة مرور سهلة للمعاينة</span>
                </div>
              </div>

              <div className="lf">
                <label>مدة الصلاحية بالأيام (Duration in Days) *</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    required
                    type="number"
                    min="1"
                    max="60"
                    value={createDemoForm.durationDays}
                    onChange={e => setCreateDemoForm({ ...createDemoForm, durationDays: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: 100 }}
                    disabled={creatingDemo}
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[3, 4, 5, 7, 10, 14].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setCreateDemoForm({ ...createDemoForm, durationDays: days })}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: '.78rem',
                          border: '1px solid var(--border-color)',
                          background: createDemoForm.durationDays === days ? '#0284c7' : 'var(--bg-main)',
                          color: createDemoForm.durationDays === days ? '#fff' : 'var(--text-main)',
                          cursor: 'pointer', fontWeight: 700,
                        }}
                      >
                        {days} أيام
                      </button>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>
                  سيتم إغلاق الحساب التجريبي تلقائياً بعد انقضاء هذه المدة وإظهار رسالة انتهاء الصلاحية للمستخدم
                </span>
              </div>

              <div className="lf">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={createDemoForm.seedData}
                    onChange={e => setCreateDemoForm({ ...createDemoForm, seedData: e.target.checked })}
                    disabled={creatingDemo}
                  />
                  <span>🌟 تعبئة المركز ببيانات نموذجية جاهزة (طلاب، جلسات، خطط علاجية، مقاييس، وتقارير فورية)</span>
                </label>
              </div>

              <div className="lf">
                <label>رقم الجوال / واتساب العميل (اختياري)</label>
                <input
                  type="tel"
                  value={createDemoForm.phone}
                  onChange={e => setCreateDemoForm({ ...createDemoForm, phone: e.target.value })}
                  placeholder="05xxxxxxxx أو +966..."
                  dir="ltr"
                  disabled={creatingDemo}
                />
              </div>

              <div className="lf">
                <label>ملاحظات داخلية</label>
                <input
                  value={createDemoForm.notes}
                  onChange={e => setCreateDemoForm({ ...createDemoForm, notes: e.target.value })}
                  placeholder="مثال: ديمو مخصص لعرض برنامج التوحد في جمعية رعاية..."
                  disabled={creatingDemo}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button
                  type="submit"
                  className="login-btn"
                  style={{ flex: 1, background: 'linear-gradient(135deg,#0284c7,#0369a1)' }}
                  disabled={creatingDemo}
                >
                  {creatingDemo ? 'جاري تجهيز وإنشاء حساب الديمو...' : 'إنشاء وتفعيل حساب الديمو الآن 🚀'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateDemoModal(false)}
                  disabled={creatingDemo}
                  style={{
                    padding: '10px 16px', border: '1px solid var(--border-color)',
                    background: 'transparent', borderRadius: 10, cursor: 'pointer', color: 'var(--text-sub)',
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة نجاح إنشاء الديمو وتوفير رسالة المشاركة الفورية */}
      {createdDemoSuccess && (
        <div className="demo-modal-overlay" onClick={() => setCreatedDemoSuccess(null)}>
          <div className="demo-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="demo-modal-hd" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 6 }}>🎉</div>
              <h3 style={{ color: '#059669' }}>تم إنشاء حساب الديمو بنجاح!</h3>
              <p>بيانات الدخول جاهزة الآن ويمكنك مشاركتها فوراً مع العميل عبر الواتساب أو نسخها للحافظة:</p>
            </div>

            <div style={{
              background: 'var(--bg-main)', border: '1.5px solid #38bdf8',
              borderRadius: 12, padding: 16, margin: '14px 0', fontSize: '0.9rem',
              lineHeight: 1.7,
            }}>
              <div>🏢 <strong>المركز:</strong> {createdDemoSuccess.centerName}</div>
              <div>👤 <strong>اسم المستخدم:</strong> <code style={{ color: '#0284c7', fontWeight: 800 }}>{createdDemoSuccess.username}</code></div>
              <div>🔑 <strong>كلمة المرور:</strong> <code style={{ color: '#059669', fontWeight: 800 }}>{createdDemoSuccess.password}</code></div>
              <div>⏳ <strong>مدة الصلاحية:</strong> {createdDemoSuccess.durationDays} أيام (حتى {new Date(createdDemoSuccess.expiryDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })})</div>
              <div>🌐 <strong>رابط تسجيل الدخول:</strong> {window.location.origin}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="login-btn"
                  style={{ flex: 1, background: '#0284c7' }}
                  onClick={() => {
                    const shareText = `السلام عليكم ورحمة الله وبركاته 🌸\nيسعدنا تزويدكم ببيانات الحساب التجريبي المخصص لـ (${createdDemoSuccess.centerName}) على نظام Easy Center لإدارة وتأهيل ذوي الإعاقة:\n\n🌐 رابط المنصة: ${window.location.origin}\n👤 اسم المستخدم: ${createdDemoSuccess.username}\n🔑 كلمة المرور: ${createdDemoSuccess.password}\n⏳ صلاحية الحساب: ${createdDemoSuccess.durationDays} أيام\n\nنتمنى لكم تجربة موفقة ومميزة، ونحن على أتم الاستعداد لأي استفسار! 🌟`;
                    navigator.clipboard.writeText(shareText);
                    alert('✅ تم نسخ بيانات الدخول المنسقة كاملة للحافظة!');
                  }}
                >
                  📋 نسخ الرسالة كاملة
                </button>

                <a
                  href={`https://wa.me/${(createdDemoSuccess.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام عليكم ورحمة الله وبركاته 🌸\nيسعدنا تزويدكم ببيانات الحساب التجريبي المخصص لـ (${createdDemoSuccess.centerName}) على نظام Easy Center لإدارة وتأهيل ذوي الإعاقة:\n\n🌐 رابط المنصة: ${window.location.origin}\n👤 اسم المستخدم: ${createdDemoSuccess.username}\n🔑 كلمة المرور: ${createdDemoSuccess.password}\n⏳ صلاحية الحساب: ${createdDemoSuccess.durationDays} أيام\n\nنتمنى لكم تجربة موفقة ومميزة! 🌟`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ background: '#25D366', color: '#fff', fontWeight: 800, padding: '10px 18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  💬 واتساب
                </a>
              </div>

              <button
                type="button"
                className="btn btn-g"
                style={{ padding: '10px', fontWeight: 800 }}
                onClick={() => {
                  const demo = createdDemoSuccess;
                  setCreatedDemoSuccess(null);
                  handleLaunchDemoDirectly(demo);
                }}
              >
                🚀 فتح الديمو وتجربته الآن
              </button>

              <button
                type="button"
                onClick={() => setCreatedDemoSuccess(null)}
                style={{
                  padding: '8px', border: 'none', background: 'transparent',
                  color: 'var(--text-sub)', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem',
                }}
              >
                إغلاق والعودة للقائمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تمديد صلاحية الديمو */}
      {showExtendModal && selectedDemoToExtend && (
        <div className="demo-modal-overlay" onClick={() => setShowExtendModal(false)}>
          <div className="demo-modal-card" onClick={e => e.stopPropagation()}>
            <div className="demo-modal-hd">
              <button
                type="button"
                className="demo-modal-close"
                onClick={() => setShowExtendModal(false)}
              >
                ✕
              </button>
              <h3>⏱️ تمديد صلاحية الحساب التجريبي</h3>
              <p>تمديد مدة تجربة مركز: <strong>{selectedDemoToExtend.centerName}</strong> ({selectedDemoToExtend.username})</p>
            </div>

            <form className="demo-modal-body" onSubmit={handleExtendDemoSubmit}>
              <div className="lf">
                <label>عدد الأيام الإضافية للتمديد:</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    required
                    type="number"
                    min="1"
                    max="60"
                    value={extendDaysCount}
                    onChange={e => setExtendDaysCount(parseInt(e.target.value, 10) || 1)}
                    style={{ width: 100 }}
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[3, 5, 7, 10, 14, 30].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setExtendDaysCount(days)}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: '.78rem',
                          border: '1px solid var(--border-color)',
                          background: extendDaysCount === days ? '#0284c7' : 'var(--bg-main)',
                          color: extendDaysCount === days ? '#fff' : 'var(--text-main)',
                          cursor: 'pointer', fontWeight: 700,
                        }}
                      >
                        +{days} أيام
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button type="submit" className="login-btn" style={{ flex: 1, background: '#0284c7' }}>
                  تأكيد تمديد الصلاحية ✓
                </button>
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  style={{
                    padding: '10px 16px', border: '1px solid var(--border-color)',
                    background: 'transparent', borderRadius: 10, cursor: 'pointer', color: 'var(--text-sub)',
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة عميل محتمل يدوياً */}
      {showAddLeadModal && (
        <div className="demo-modal-overlay" onClick={() => setShowAddLeadModal(false)}>
          <div className="demo-modal-card" onClick={e => e.stopPropagation()}>
            <div className="demo-modal-hd">
              <button
                type="button"
                className="demo-modal-close"
                onClick={() => setShowAddLeadModal(false)}
              >
                ✕
              </button>
              <h3>➕ إضافة عميل محتمل للمتابعة</h3>
              <p>سجّل بيانات مهتم أو اتصال هاتفي أو زيارة معرض لتتذكره وتتواصل معه لاحقاً عبر الواتساب أو البريد.</p>
            </div>

            <form className="demo-modal-body" onSubmit={handleAddManualLead}>
              <div className="lf">
                <label>اسم العميل / المسؤول *</label>
                <input
                  required
                  value={newLeadForm.name}
                  onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="مثال: د. عبدالعزيز السالم"
                />
              </div>

              <div className="lf">
                <label>البريد الإلكتروني *</label>
                <input
                  required
                  type="email"
                  value={newLeadForm.email}
                  onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  placeholder="contact@center.com"
                  dir="ltr"
                />
              </div>

              <div className="lf">
                <label>رقم الجوال / واتساب</label>
                <input
                  type="tel"
                  value={newLeadForm.phone}
                  onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="050xxxxxxx"
                  dir="ltr"
                />
              </div>

              <div className="lf">
                <label>اسم المركز أو المؤسسة</label>
                <input
                  value={newLeadForm.org}
                  onChange={e => setNewLeadForm({ ...newLeadForm, org: e.target.value })}
                  placeholder="مثال: مدرسة التميز للتوحد"
                />
              </div>

              <div className="lf">
                <label>ملاحظات إضافية</label>
                <input
                  value={newLeadForm.note}
                  onChange={e => setNewLeadForm({ ...newLeadForm, note: e.target.value })}
                  placeholder="مثال: تم الاتصال به في مؤتمر الرياض، طلب تجربة لمدة أسبوع"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button type="submit" className="login-btn" style={{ flex: 1 }}>
                  حفظ العميل في السجلات ✓
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    borderRadius: 10,
                    cursor: 'pointer',
                    color: 'var(--text-sub)',
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
