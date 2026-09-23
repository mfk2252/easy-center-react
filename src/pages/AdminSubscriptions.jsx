import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, Timestamp, query, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  isPlatformAdminEmail, getTrialLeads, updateTrialLeadStatus, deleteTrialLead, saveTrialLead
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
  const { login, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('centers'); // 'centers' | 'leads'
  const [centers, setCenters] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customMonths, setCustomMonths] = useState({});
  const [expandedId, setExpandedId] = useState(null);

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
    await Promise.all([loadCenters(), loadLeads()]);
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

  async function loadLeads() {
    try {
      const items = await getTrialLeads();
      setLeads(items);
    } catch (e) {
      console.error("خطأ جلب العملاء المحتملين:", e);
    }
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-main)' }}>⏳ جارٍ تحميل البيانات...</div>;

  const DURATION_BTNS = [
    ['شهر', 1], ['6 أشهر', 6], ['سنة', 12], ['سنتان', 24], ['5 سنوات', 60],
  ];

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto', direction: 'rtl', color: 'var(--text-main)' }}>
      <UnifiedPageHeader
        icon="🔐"
        title="إدارة اشتراكات المنصة والمراكز"
        subtitle="إدارة تراخيص المراكز، تمديد الفترات، ومتابعة العملاء المهتمين"
        badge={`${centers.length} مراكز · ${leads.length} عملاء مهتمين`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
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

      {/* شريط التبديل بين المراكز والعملاء المحتملين */}
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
      ) : (
        /* تبويب العملاء المحتملين وطلبات الاشتراك (Leads) */
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div className="unified-stat-box">
              <div className="stat-label">🎯 إجمالي المهتمين</div>
              <div className="stat-val" style={{ color: 'var(--pr)' }}>{leadStats.total}</div>
              <div className="stat-sub">كافة طلبات التجربة والاستفسار</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">🔥 بحاجة لمتابعة (جديد)</div>
              <div className="stat-val" style={{ color: '#ef4444' }}>{leadStats.newCount}</div>
              <div className="stat-sub">تواصل معهم لتقديم عروض</div>
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

      {/* نافذة إضافة عميل محتمل يدوياً */}
      {showAddLeadModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddLeadModal(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-hd">
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddLeadModal(false)}
              >
                ✕
              </button>
              <h3>➕ إضافة عميل محتمل للمتابعة</h3>
              <p>سجّل بيانات مهتم أو اتصال هاتفي أو زيارة معرض لتتذكره وتتواصل معه لاحقاً عبر الواتساب أو البريد.</p>
            </div>

            <form className="admin-modal-body" onSubmit={handleAddManualLead}>
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
