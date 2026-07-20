import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { isPlatformAdminEmail } from '../firebase/auth';

export default function AdminSubscriptions() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  async function activateCenter(centerId, months = 1) {
    setUpdating(centerId);
    try {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + months);

      await updateDoc(doc(db, 'centers', centerId), {
        'subscription.status': 'active',
        'subscription.expiryDate': Timestamp.fromDate(expiry),
        'subscription.activatedAt': serverTimestamp(),
        'subscription.months': months
      });
      loadCenters();
      alert("✅ تم التفعيل بنجاح");
    } catch(e) {
      alert('❌ خطأ: ' + e.message);
    } finally {
      setUpdating(null);
    }
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

  function getDaysLeftInfo(expiryDate) {
    if (!expiryDate) return null;
    const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'منتهي ❌', color: '#ef4444' };
    if (diffDays <= 7) return { label: `متبقي ${diffDays} أيام ⚠️`, color: '#f59e0b' };
    return { label: `متبقي ${diffDays} يوماً 🟢`, color: '#10b981' }; // تم إصلاح علامة التنصيص هنا ✅
  }

  function getStatusBadge(center) {
    if (isPlatformAdminEmail(center.managerEmail)) return { label: 'مدير النظام 👑', color: '#8b5cf6', type: 'admin' };

    const sub = center.subscription;
    if (!sub) return { label: 'تجريبي ⏳', color: '#3b82f6', type: 'trial' };
    if (sub.status === 'active') return { label: 'مفعّل ✅', color: '#10b981', type: 'active' };
    if (sub.status === 'suspended') return { label: 'موقوف 🔒', color: '#6b7280', type: 'suspended' };
    return { label: 'تجريبي ⏳', color: '#3b82f6', type: 'trial' };
  }

  const filteredCenters = centers.filter(center => {
    const matchesSearch = 
      (center.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (center.managerEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const badge = getStatusBadge(center);
    const matchesFilter = filterStatus === 'all' || badge.type === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-main)' }}>⏳ جارٍ تحميل البيانات...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: 1000, margin: '0 auto', direction: 'rtl', color: 'var(--text-main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>🔐 إدارة الاشتراكات</h1>
          <p style={{ margin: '5px 0 0 0', color: 'var(--g5)' }}>إجمالي المراكز المسجلة: {centers.length}</p>
        </div>
      </div>

      {/* شريط البحث والفلترة المتوافق مع الوضعين */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 20, 
        background: 'var(--card)', 
        padding: 14, 
        borderRadius: 12, 
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input 
          type="text" 
          placeholder="🔍 ابحث باسم المركز أو البريد الإلكتروني..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, 
            minWidth: 250, 
            padding: '8px 14px', 
            borderRadius: 8, 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg)', 
            color: 'var(--text-main)' 
          }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'المفعلة' },
            { id: 'suspended', label: 'الموقوفة' },
            { id: 'trial', label: 'التجريبية' },
            { id: 'admin', label: 'المدراء' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: filterStatus === btn.id ? 'var(--pr, #8b5cf6)' : 'transparent',
                color: filterStatus === btn.id ? '#fff' : 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة المراكز المتوافقة بالكامل */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredCenters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--g4)' }}>ℹ️ لا توجد نتائج مطابقة للبحث.</div>
        ) : (
          filteredCenters.map(center => {
            const badge = getStatusBadge(center);
            const daysInfo = getDaysLeftInfo(center.subscription?.expiryDate);
            const isSystemAdmin = isPlatformAdminEmail(center.managerEmail);

            const expiryText = center.subscription?.expiryDate 
              ? new Date(center.subscription.expiryDate.seconds * 1000).toLocaleDateString('ar-EG') 
              : 'غير محدد';
            
            const whatsappText = encodeURIComponent(
              `مرحباً أستاذ، نود تذكيركم بحالة اشتراك مركزكم الفاضل (${center.name || 'Easy Center'}) في النظام، ينتهي الاشتراك بتاريخ: ${expiryText}. طاب يومكم بكل خير.`
            );
            const whatsappUrl = `https://wa.me/${center.managerPhone || ''}?text=${whatsappText}`;

            return (
              <div key={center.id} style={{ 
                  background: 'var(--card)', 
                  border: '1px solid var(--border-color)', 
                  padding: '16px', 
                  borderRadius: 14, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  opacity: updating === center.id ? 0.6 : 1,
                  pointerEvents: updating === center.id ? 'none' : 'auto',
                  direction: 'rtl'
              }}>
                {/* العمود الأول: بيانات المركز */}
                <div style={{ flex: '1 1 250px', textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    {center.name || 'بدون اسم'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--g5)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{center.managerEmail}</span>
                    {center.managerPhone && (
                      <a href={whatsappUrl} target="_blank" rel="noreferrer" title="تذكير عبر واتساب" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                        💬
                      </a>
                    )}
                  </div>
                  {center.subscription?.expiryDate && !isSystemAdmin && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--g4)', marginTop: 4 }}>
                      📅 ينتهي في: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{new Date(center.subscription.expiryDate.seconds * 1000).toLocaleDateString('ar-EG')}</span>
                    </div>
                  )}
                </div>
                
                {/* العمود الثاني: شارات الحالة */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', minWidth: 120 }}>
                  <div style={{ padding: '4px 10px', borderRadius: 20, color: badge.color, background: badge.color + '18', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {badge.label}
                  </div>
                  {daysInfo && !isSystemAdmin && (
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: daysInfo.color, padding: '2px 8px', background: daysInfo.color + '10', borderRadius: 6, fontVariantNumeric: 'tabular-nums' }}>
                      {daysInfo.label}
                    </div>
                  )}
                </div>

                {/* العمود الثالث: أزرار التحكم */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: '0', marginRight: 'auto' }}>
                  <button className="btn btn-xs" style={{ minWidth: 50 }} onClick={() => activateCenter(center.id, 1)}>شهر</button>
                  <button className="btn btn-xs" style={{ minWidth: 50 }} onClick={() => activateCenter(center.id, 6)}>6 أشهر</button>
                  <button className="btn btn-xs" style={{ minWidth: 50 }} onClick={() => activateCenter(center.id, 12)}>سنة</button>
                  {!isSystemAdmin && (
                    <button className="btn btn-xs btn-d" style={{ minWidth: 55 }} onClick={() => suspendCenter(center.id)}>إيقاف</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
