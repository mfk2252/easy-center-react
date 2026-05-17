/**
 * صفحة إدارة الاشتراكات - للمطور فقط
 * الوصول: /admin في الكود (غير مرئي للمستخدمين)
 */
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// ايميل المطور - الوحيد الذي يرى هذه الصفحة
const ADMIN_EMAIL = 'mfekry225@gmail.com';

export default function AdminSubscriptions({ currentUserEmail }) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { loadCenters(); }, []);

  async function loadCenters() {
    setLoading(true);
    try {
      const { db } = await import('../firebase/config');
      const snap = await getDocs(collection(db, 'centers'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // ترتيب حسب تاريخ الإنشاء
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setCenters(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function activateCenter(centerId, months = 1) {
    setUpdating(centerId);
    try {
      const { db } = await import('../firebase/config');
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + months);

      await updateDoc(doc(db, 'centers', centerId), {
        'subscription.status': 'active',
        'subscription.expiryDate': Timestamp.fromDate(expiry),
        'subscription.activatedAt': serverTimestamp(),
        'subscription.months': months
      });

      setCenters(prev => prev.map(c => c.id === centerId ? {
        ...c,
        subscription: {
          ...c.subscription,
          status: 'active',
          expiryDate: { toDate: () => expiry }
        }
      } : c));

      alert(`✅ تم تفعيل المركز لمدة ${months} شهر`);
    } catch(e) {
      alert('❌ خطأ: ' + e.message);
    } finally {
      setUpdating(null);
    }
  }

  async function suspendCenter(centerId) {
    if (!window.confirm('إيقاف هذا المركز؟')) return;
    setUpdating(centerId);
    try {
      const { db } = await import('../firebase/config');
      await updateDoc(doc(db, 'centers', centerId), {
        'subscription.status': 'suspended',
        'subscription.suspendedAt': serverTimestamp()
      });
      setCenters(prev => prev.map(c => c.id === centerId ? {
        ...c, subscription: { ...c.subscription, status: 'suspended' }
      } : c));
      alert('✅ تم إيقاف المركز');
    } catch(e) {
      alert('❌ خطأ: ' + e.message);
    } finally {
      setUpdating(null);
    }
  }

  function getStatusBadge(center) {
    const status = center.subscription?.status;
    const expiry = center.subscription?.expiryDate?.toDate?.();
    const trialExpiry = center.subscription?.trialExpiry?.toDate?.();
    const now = new Date();

    if (status === 'active') {
      if (expiry && expiry < now) return { label: 'منتهي', color: '#ef4444' };
      return { label: 'مفعّل ✅', color: '#10b981' };
    }
    if (status === 'suspended') return { label: 'موقوف 🔒', color: '#6b7280' };
    if (status === 'trial') {
      if (trialExpiry && trialExpiry < now) return { label: 'تجربة منتهية ⚠️', color: '#f59e0b' };
      const days = trialExpiry ? Math.ceil((trialExpiry - now) / 86400000) : 5;
      return { label: `تجريبي (${days}ي)`, color: '#3b82f6' };
    }
    return { label: 'غير محدد', color: '#6b7280' };
  }

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center' }}>⏳ جارٍ التحميل...</div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>🔐 إدارة الاشتراكات</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--g5)', fontSize: '.85rem' }}>
            {centers.length} مركز مسجل
          </p>
        </div>
        <button className="btn btn-g" onClick={loadCenters}>🔄 تحديث</button>
      </div>

      {/* إحصائيات سريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'مفعّل', count: centers.filter(c => c.subscription?.status === 'active').length, color: '#10b981' },
          { label: 'تجريبي', count: centers.filter(c => c.subscription?.status === 'trial' || !c.subscription?.status).length, color: '#3b82f6' },
          { label: 'موقوف', count: centers.filter(c => c.subscription?.status === 'suspended').length, color: '#6b7280' },
          { label: 'الإيراد/شهر', count: `${centers.filter(c => c.subscription?.status === 'active').length * 100} ر`, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--g5)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* قائمة المراكز */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {centers.map(center => {
          const badge = getStatusBadge(center);
          const isUpdating = updating === center.id;

          return (
            <div key={center.id} style={{
              background: 'var(--card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap'
            }}>
              {/* الشعار */}
              {center.logo
                ? <img src={center.logo} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} alt=""/>
                : <div style={{ width: 44, height: 44, borderRadius: 8, background: center.color || '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏥</div>
              }

              {/* معلومات المركز */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: '.95rem' }}>
                  {center.name || '(بدون اسم)'} {!center.isSetup && <span style={{ color: 'var(--g4)', fontWeight: 400, fontSize: '.78rem' }}>- لم يكتمل الإعداد</span>}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--g5)', marginTop: 2 }}>
                  {center.managerEmail} • {center.type || 'غير محدد'}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--g4)', marginTop: 2 }}>
                  انضم: {center.createdAt?.toDate?.()?.toLocaleDateString('ar-SA') || '—'}
                  {center.subscription?.expiryDate?.toDate && (
                    <> • ينتهي: {center.subscription.expiryDate.toDate().toLocaleDateString('ar-SA')}</>
                  )}
                </div>
              </div>

              {/* الحالة */}
              <div style={{
                padding: '4px 12px',
                borderRadius: 20,
                background: badge.color + '22',
                color: badge.color,
                fontSize: '.78rem',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                {badge.label}
              </div>

              {/* الإجراءات */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-xs btn-p"
                  disabled={isUpdating}
                  onClick={() => activateCenter(center.id, 1)}
                  style={{ fontSize: '.72rem' }}
                >
                  {isUpdating ? '⏳' : '✅ شهر'}
                </button>
                <button
                  className="btn btn-xs btn-s"
                  disabled={isUpdating}
                  onClick={() => activateCenter(center.id, 12)}
                  style={{ fontSize: '.72rem' }}
                >
                  📅 سنة
                </button>
                <button
                  className="btn btn-xs btn-d"
                  disabled={isUpdating}
                  onClick={() => suspendCenter(center.id)}
                  style={{ fontSize: '.72rem' }}
                >
                  🔒
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
