/**
 * صفحة إدارة الاشتراكات - للمطور فقط
 */
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function AdminSubscriptions({ currentUserEmail }) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { loadCenters(); }, []);

  async function loadCenters() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'centers'));
      // تصحيح: ضمان وجود هيكل افتراضي لكل مركز لعدم حدوث خطأ أثناء العرض
      const data = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        subscription: d.data().subscription || { status: 'trial' } 
      }));
      
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setCenters(data);
    } catch(e) {
      console.error("Error loading centers:", e);
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

      setCenters(prev => prev.map(c => c.id === centerId ? {
        ...c,
        subscription: {
          ...c.subscription,
          status: 'active',
          expiryDate: { toDate: () => expiry }
        }
      } : c));

      alert(`✅ تم التفعيل بنجاح`);
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
      await updateDoc(doc(db, 'centers', centerId), {
        'subscription.status': 'suspended',
        'subscription.suspendedAt': serverTimestamp()
      });
      setCenters(prev => prev.map(c => c.id === centerId ? {
        ...c, subscription: { ...c.subscription, status: 'suspended' }
      } : c));
    } catch(e) {
      alert('❌ خطأ: ' + e.message);
    } finally {
      setUpdating(null);
    }
  }

  function getStatusBadge(center) {
    // معالجة آمنة جداً لحالة الاشتراك
    const sub = center.subscription || {};
    const status = sub.status;
    const expiry = sub.expiryDate?.toDate?.();
    const trialExpiry = sub.trialExpiry?.toDate?.();
    const now = new Date();

    if (status === 'active') {
      if (expiry && expiry < now) return { label: 'منتهي', color: '#ef4444' };
      return { label: 'مفعّل ✅', color: '#10b981' };
    }
    if (status === 'suspended') return { label: 'موقوف 🔒', color: '#6b7280' };
    
    // حالة التجريبي
    if (status === 'trial' || !status) {
      if (trialExpiry && trialExpiry < now) return { label: 'تجربة منتهية ⚠️', color: '#f59e0b' };
      const days = trialExpiry ? Math.ceil((trialExpiry - now) / 86400000) : 0;
      return { label: `تجريبي (${days}ي)`, color: '#3b82f6' };
    }
    return { label: 'غير محدد', color: '#6b7280' };
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>⏳ جارٍ تحميل البيانات...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>🔐 إدارة الاشتراكات</h1>
          <p style={{ color: 'var(--g5)' }}>{centers.length} مركز موجود في النظام</p>
        </div>
        <button className="btn btn-g" onClick={loadCenters}>🔄 تحديث البيانات</button>
      </div>

      {/* إحصائيات أكثر دقة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'مفعّل', count: centers.filter(c => c.subscription?.status === 'active').length, color: '#10b981' },
          { label: 'تجريبي', count: centers.filter(c => c.subscription?.status === 'trial' || !c.subscription?.status).length, color: '#3b82f6' },
          { label: 'موقوف', count: centers.filter(c => c.subscription?.status === 'suspended').length, color: '#6b7280' },
          { label: 'الإيراد/شهر', count: `${centers.filter(c => c.subscription?.status === 'active').length * 100} ر`, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--g5)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {centers.map(center => {
          const badge = getStatusBadge(center);
          return (
            <div key={center.id} style={{ background: 'var(--card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{center.name || 'مركز غير مسمى'}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--g5)' }}>{center.managerEmail}</div>
              </div>
              <div style={{ padding: '4px 12px', borderRadius: 20, background: badge.color + '22', color: badge.color, fontSize: '.75rem', fontWeight: 700 }}>
                {badge.label}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-xs btn-p" onClick={() => activateCenter(center.id, 1)}>✅ شهر</button>
                <button className="btn btn-xs btn-d" onClick={() => suspendCenter(center.id)}>🔒</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}