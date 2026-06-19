import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function AdminSubscriptions() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

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

  function getStatusBadge(center) {
    // شرط خاص للأدمن ليظهر دائماً بشكل مميز
    if (center.managerEmail === "mfekry225@gmail.com") return { label: 'مدير النظام 👑', color: '#8b5cf6' };
    
    const sub = center.subscription;
    if (!sub) return { label: 'تجريبي', color: '#3b82f6' };
    if (sub.status === 'active') return { label: 'مفعّل ✅', color: '#10b981' };
    if (sub.status === 'suspended') return { label: 'موقوف 🔒', color: '#6b7280' };
    return { label: 'تجريبي', color: '#3b82f6' };
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>⏳ جارٍ تحميل البيانات...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
      <h1>🔐 إدارة الاشتراكات</h1>
      <p>عدد المراكز: {centers.length}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {centers.map(center => {
          const badge = getStatusBadge(center);
          return (
            <div key={center.id} style={{ 
                background: 'var(--card)', 
                border: '1px solid var(--border-color)', 
                padding: '15px', 
                borderRadius: 12, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 14 
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{center.name || 'بدون اسم'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--g5)' }}>{center.managerEmail}</div>
              </div>
              
              <div style={{ padding: '5px 12px', borderRadius: 20, color: badge.color, background: badge.color + '22', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {badge.label}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-xs" onClick={() => activateCenter(center.id, 1)}>شهر</button>
                <button className="btn btn-xs" onClick={() => activateCenter(center.id, 6)}>6أشهر</button>
                <button className="btn btn-xs" onClick={() => activateCenter(center.id, 12)}>سنة</button>
                <button className="btn btn-xs btn-d" onClick={() => suspendCenter(center.id)}>إيقاف</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
