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
      // جلب البيانات من مجموعة 'centers'
      const snap = await getDocs(collection(db, 'centers'));
      
      // --- أداة تتبع المشكلة ---
      console.log("إجمالي الوثائق التي تم العثور عليها:", snap.size);
      snap.forEach((doc) => {
        console.log("بيانات المركز:", doc.id, "=>", doc.data());
      });
      // -------------------------

      const data = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        subscription: d.data().subscription || { status: 'trial' } 
      }));
      
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setCenters(data);
    } catch(e) {
      console.error("خطأ أثناء جلب البيانات:", e);
      alert("حدث خطأ أثناء جلب البيانات، راجع Console المتصفح");
    } finally {
      setLoading(false);
    }
  }

  // ... (دوال activateCenter و suspendCenter و getStatusBadge كما هي) ...
  // يرجى إبقاء الدوال السابقة في مكانها لضمان عمل الكود
  
  // (قمت باختصار الدوال هنا للتركيز على المشكلة)
  async function activateCenter(centerId, months = 1) { /* ... نفس كودك السابق ... */ }
  async function suspendCenter(centerId) { /* ... نفس كودك السابق ... */ }
  function getStatusBadge(center) { /* ... نفس كودك السابق ... */ }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>⏳ جارٍ تحميل البيانات...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>🔐 إدارة الاشتراكات</h1>
          <p style={{ color: 'var(--g5)' }}>عدد المراكز المكتشفة: {centers.length}</p>
        </div>
        <button className="btn btn-g" onClick={loadCenters}>🔄 تحديث البيانات</button>
      </div>

      {/* عرض قائمة المراكز */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {centers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20 }}>لا توجد مراكز تم جلبها من قاعدة البيانات.</div>
        ) : (
          centers.map(center => (
            <div key={center.id} style={{ background: 'var(--card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{center.name || 'مركز غير مسمى'}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--g5)' }}>{center.managerEmail}</div>
              </div>
              <button className="btn btn-xs btn-p" onClick={() => activateCenter(center.id, 1)}>✅ تفعيل</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
