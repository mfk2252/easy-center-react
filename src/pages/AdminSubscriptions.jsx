import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { isPlatformAdminEmail } from '../firebase/auth';

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
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customMonths, setCustomMonths] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadCenters(); }, []);

  async function loadCenters() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'centers'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setCenters(data);
    } catch(e) {
      console.error("خطأ جلب البيانات:", e);
    } finally {
      setLoading(false);
    }
  }

  async function activateCenter(centerId, months) {
    setUpdating(centerId);
    try {
      const isPermanent = months == null;
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + (isPermanent ? 1200 : months));

      await updateDoc(doc(db, 'centers', centerId), {
        'subscription.status': 'active',
        'subscription.expiryDate': Timestamp.fromDate(expiry),
        'subscription.activatedAt': serverTimestamp(),
        'subscription.months': isPermanent ? null : months,
        'subscription.isPermanent': isPermanent,
      });
      loadCenters();
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
      loadCenters();
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-main)' }}>⏳ جارٍ تحميل البيانات...</div>;

  const DURATION_BTNS = [
    ['شهر', 1], ['6 أشهر', 6], ['سنة', 12], ['سنتان', 24], ['5 سنوات', 60],
  ];

  return (
    <div style={{ padding: '20px', maxWidth: 1100, margin: '0 auto', direction: 'rtl', color: 'var(--text-main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>🔐 إدارة الاشتراكات</h1>
          <p style={{ margin: '5px 0 0 0', color: 'var(--g5)' }}>إجمالي المراكز المسجلة: {centers.length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 20 }}>
        {[
          ['نشط (مؤقت)', stats.active, '#10b981'],
          ['دائم', stats.permanent, '#7c3aed'],
          ['تجريبي', stats.trial, '#3b82f6'],
          ['ينتهي خلال 7 أيام', stats.expiringSoon, '#f59e0b'],
          ['موقوف', stats.suspended, '#6b7280'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 14px', borderRight: `4px solid ${color}` }}>
            <div style={{ fontSize: '.72rem', color: 'var(--g5)' }}>{label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color }}>{val}</div>
          </div>
        ))}
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
    </div>
  );
}
