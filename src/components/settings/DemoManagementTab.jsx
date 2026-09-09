import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getAdminDemoAccounts,
  createAdminDemoAccount,
  extendAdminDemoAccount,
  updateAdminDemoAccountStatus,
  deleteAdminDemoAccount,
} from '../../firebase/auth';

export default function DemoManagementTab({ toast }) {
  const { login } = useApp();
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [testingId, setTestingId] = useState(null);

  // نموذج الإنشاء
  const [form, setForm] = useState({
    centerName: '',
    managerName: '',
    phone: '',
    durationDays: 3,
    notes: '',
    seedData: true,
  });

  // تمديد الصلاحية
  const [extendingId, setExtendingId] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const items = await getAdminDemoAccounts();
      setDemoAccounts(items || []);
    } catch (e) {
      console.error('Error loading demo accounts:', e);
      toast('تعذر جلب العروض التجريبية', 'er');
    } finally {
      setLoading(false);
    }
  }

  const getDirectLink = (acc) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${path}?demo=${acc.username}`;
  };

  const handleCopyLink = (acc) => {
    const link = getDirectLink(acc);
    navigator.clipboard.writeText(link);
    setCopiedId(acc.id || acc.username);
    toast('✅ تم نسخ رابط الدخول المباشر للحافظة', 'ok');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (acc) => {
    const link = getDirectLink(acc);
    const text = `مرحباً ${acc.managerName ? 'أ. ' + acc.managerName : 'بكم'}،
يسعدنا تزويدكم برابط العرض التجريبي المباشر لنظام إدارة مراكز التربية الخاصة والتأهيل المخصص لـ (${acc.centerName || 'مؤسستكم الموقرة'}):

🔗 رابط الدخول المباشر (بدون تسجيل دخول):
${link}

يمكنكم النقر على الرابط واستكشاف النظام وإدارة الطلاب، الأخصائيين، الخطط الفردية (IEP)، الجلسات، والتقارير فوراً.
صلاحية الرابط: ${acc.durationDays || 3} أيام.`;

    const cleanPhone = (acc.phone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenDemo = (acc) => {
    const link = getDirectLink(acc);
    window.open(link, '_blank');
  };

  const handleTestInCurrentSession = async (acc) => {
    try {
      setTestingId(acc.username);
      toast('جاري تجهيز والدخول لبيئة العرض التجريبي المعزولة...', 'info');
      const { autoLoginDemoToken } = await import('../../firebase/auth');
      const demoUser = await autoLoginDemoToken(acc.username);
      if (demoUser) {
        await login(demoUser);
        toast(`🎮 تم التبديل إلى العرض التجريبي لـ ${acc.centerName} بنجاح`, 'ok');
      }
    } catch (err) {
      toast(err.message || 'تعذر الدخول إلى حساب الديمو', 'er');
    } finally {
      setTestingId(null);
    }
  };

  async function handleCreate(e) {
    if (e) e.preventDefault();
    if (!form.centerName.trim()) {
      toast('⚠️ يرجى إدخال اسم المركز أو المؤسسة المستهدفة', 'er');
      return;
    }

    setCreating(true);
    try {
      // توليد اسم مستخدم عشوائي نظيف
      const rnd = Math.random().toString(36).substring(2, 7);
      const autoUser = `demo_${rnd}`;

      const demo = await createAdminDemoAccount({
        centerName: form.centerName.trim(),
        managerName: form.managerName.trim() || 'مسؤول المؤسسة',
        username: autoUser,
        password: '123',
        durationDays: form.durationDays || 3,
        phone: form.phone.trim(),
        notes: form.notes.trim(),
        seedData: form.seedData,
      });

      setDemoAccounts(prev => [demo, ...prev.filter(d => d.username !== demo.username)]);
      setCreatedSuccess(demo);
      setShowCreateModal(false);
      setForm({
        centerName: '',
        managerName: '',
        phone: '',
        durationDays: 3,
        notes: '',
        seedData: true,
      });
      toast('🎉 تم إنشاء العرض التجريبي ورابط الدخول بنجاح', 'ok');
    } catch (err) {
      toast('تعذر إنشاء العرض التجريبي: ' + err.message, 'er');
    } finally {
      setCreating(false);
    }
  }

  async function handleExtend(username, days) {
    try {
      const updated = await extendAdminDemoAccount(username, days);
      setDemoAccounts(prev => prev.map(d => d.username === updated.username ? updated : d));
      setExtendingId(null);
      toast(`✅ تم تمديد صلاحية العرض ${days} أيام إضافية`, 'ok');
    } catch (err) {
      toast('تعذر تمديد الصلاحية: ' + err.message, 'er');
    }
  }

  async function handleToggleStatus(username, curStatus) {
    const nextStatus = curStatus === 'active' ? 'suspended' : 'active';
    try {
      const updated = await updateAdminDemoAccountStatus(username, nextStatus);
      setDemoAccounts(prev => prev.map(d => d.username === updated.username ? updated : d));
      toast(nextStatus === 'active' ? '✅ تم تفعيل العرض التجريبي' : '⏸️ تم إيقاف العرض مؤقتاً', 'ok');
    } catch (err) {
      toast('تعذر تحديث الحالة: ' + err.message, 'er');
    }
  }

  async function handleDelete(username) {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف هذا العرض التجريبي نهائياً؟`)) return;
    try {
      await deleteAdminDemoAccount(username);
      setDemoAccounts(prev => prev.filter(d => d.username !== username && d.id !== username));
      toast('🗑️ تم حذف العرض التجريبي', 'ok');
    } catch (err) {
      toast('تعذر حذف العرض: ' + err.message, 'er');
    }
  }

  const activeCount = demoAccounts.filter(d => {
    const isExpired = new Date(d.expiryDate) <= new Date();
    return d.status === 'active' && !isExpired;
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* بطاقة الشرح والتوجيه */}
      <div className="wg" style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(59, 130, 246, 0.04))',
        border: '1.5px solid rgba(2, 132, 199, 0.25)',
        borderRadius: 16,
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: '1.8rem' }}>🚀</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0369a1' }}>
                العروض التجريبية المباشرة (ديمو بنقرة واحدة بدون تسجيل دخول)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-sub)', lineHeight: 1.7, maxWidth: 850 }}>
              تتيح لك هذه الميزة كمدير للمنصة إنشاء عروض تجريبية مخصصة لأي مؤسسة، مركز، أو عميل يتواصل معك.
              تقوم المنصة بتوليد <strong>رابط دخول مباشر وسحري</strong> ترسله للجهة عبر واتساب أو تفتحه أثناء عرضك التقديمي،
              فيدخل الطرف الآخر إلى المنصة فوراً وتظهر أمامه كافة مميزات النظام وبياناته النموذجية المتكاملة بدون أي حواجز أو كلمات مرور!
            </p>
          </div>

          <button
            type="button"
            className="btn btn-p"
            onClick={() => { setCreatedSuccess(null); setShowCreateModal(true); }}
            style={{
              padding: '12px 22px',
              fontSize: '0.92rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>➕</span>
            <span>إنشاء عرض تجريبي جديد (ديمو)</span>
          </button>
        </div>

        {/* إحصائيات سريعة */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
          <div style={{ background: 'white', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '1.6rem', background: '#e0f2fe', width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>إجمالي العروض المنشأة</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{demoAccounts.length}</div>
            </div>
          </div>
          <div style={{ background: 'white', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '1.6rem', background: '#dcfce7', width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🟢</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>عروض نشطة وصالحة</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>{activeCount}</div>
            </div>
          </div>
          <div style={{ background: 'white', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '1.6rem', background: '#fef3c7', width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>نوع الدخول المتاح</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#d97706' }}>دخول مباشر بدون كلمة مرور</div>
            </div>
          </div>
        </div>
      </div>

      {/* تنبيه بالرابط المنشأ حديثاً */}
      {createdSuccess && (
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: 14,
          padding: '18px 22px',
          boxShadow: '0 6px 20px rgba(34, 197, 94, 0.12)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.8rem' }}>🎉</span>
              <div>
                <h4 style={{ margin: 0, fontWeight: 900, color: '#166534', fontSize: '1.05rem' }}>
                  تم تجهيز العرض التجريبي لـ ({createdSuccess.centerName}) بنجاح!
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#15803d' }}>
                  صالح لمدة {createdSuccess.durationDays} أيام · جهزنا بيانات كاملة للعرض
                </span>
              </div>
            </div>
            <button
              onClick={() => setCreatedSuccess(null)}
              className="btn btn-g btn-xs"
              style={{ borderRadius: '50%', width: 26, height: 26, padding: 0 }}
            >
              ✕
            </button>
          </div>

          <div style={{
            background: 'white',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px dashed #4ade80',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
            overflow: 'hidden'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#1e293b', direction: 'ltr', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {getDirectLink(createdSuccess)}
            </span>
            <button
              onClick={() => handleCopyLink(createdSuccess)}
              className="btn btn-sm btn-s"
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>{copiedId === (createdSuccess.id || createdSuccess.username) ? '✅ تم النسخ' : '📋 نسخ الرابط'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleShareWhatsApp(createdSuccess)}
              className="btn btn-sm"
              style={{ background: '#25D366', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>📲</span>
              <span>إرسال الرابط للعميل عبر واتساب</span>
            </button>
            <button
              onClick={() => handleOpenDemo(createdSuccess)}
              className="btn btn-sm btn-p"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>🚀</span>
              <span>فتح في تبويب جديد</span>
            </button>
            <button
              onClick={() => handleTestInCurrentSession(createdSuccess)}
              disabled={testingId === createdSuccess.username}
              className="btn btn-sm btn-s"
              style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>⚡</span>
              <span>{testingId === createdSuccess.username ? 'جاري التحضير...' : 'تجربة العرض في هذا المتصفح'}</span>
            </button>
          </div>
        </div>
      )}

      {/* قائمة العروض المنشأة */}
      <div className="wg">
        <div className="wg-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>سجل العروض التجريبية المخصصة ({demoAccounts.length})</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
              جميع روابط الديمو التي قمت بتوليدها مع حالة الصلاحية والأيام المتبقية
            </span>
          </div>
          <button
            type="button"
            className="btn btn-g btn-xs"
            onClick={loadAccounts}
            disabled={loading}
          >
            {loading ? '⏳' : '🔄 تحديث القائمة'}
          </button>
        </div>

        <div className="wg-b" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-sub)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
              <div>جارٍ تحميل العروض التجريبية...</div>
            </div>
          ) : demoAccounts.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-sub)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚀</div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                لم تقم بإنشاء أي عروض تجريبية بعد
              </h4>
              <p style={{ margin: '6px auto 18px', maxWidth: 450, fontSize: '0.84rem', lineHeight: 1.6 }}>
                عندما يتواصل معك أي مركز أو ترغب في تقديم عرض تسويقي، انقر على زر "إنشاء عرض تجريبي جديد" لتوليد رابط ديمو فوري بدون تسجيل دخول.
              </p>
              <button
                type="button"
                className="btn btn-p"
                onClick={() => { setCreatedSuccess(null); setShowCreateModal(true); }}
              >
                ➕ إنشاء أول ديمو الآن
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-sub)', fontSize: '0.78rem' }}>
                    <th style={{ padding: '12px 16px' }}>الجهة أو المركز المستهدف</th>
                    <th style={{ padding: '12px 16px' }}>المسؤول والاتصال</th>
                    <th style={{ padding: '12px 16px' }}>تاريخ الإنشاء والانتهاء</th>
                    <th style={{ padding: '12px 16px' }}>الحالة والمدة المتبقية</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>رابط الدخول السريع</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {demoAccounts.map(acc => {
                    const expiry = new Date(acc.expiryDate);
                    const now = new Date();
                    const isExpired = expiry <= now || acc.status === 'expired';
                    const daysLeft = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
                    const isCopied = copiedId === (acc.id || acc.username);

                    return (
                      <tr key={acc.id || acc.username} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>🏥</span>
                            <span>{acc.centerName || 'مركز تجريبي'}</span>
                          </div>
                          {acc.notes && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: 3 }}>
                              📝 {acc.notes}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{acc.managerName || 'مسؤول المؤسسة'}</div>
                          {acc.phone && (
                            <div style={{ fontSize: '0.75rem', color: '#2563eb', direction: 'ltr', display: 'inline-block' }}>
                              📞 {acc.phone}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                          <div>من: {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('ar-SA') : '—'}</div>
                          <div>إلى: {acc.expiryDate ? new Date(acc.expiryDate).toLocaleDateString('ar-SA') : '—'}</div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {acc.status === 'suspended' ? (
                            <span className="bdg" style={{ background: '#fef3c7', color: '#b45309' }}>⏸️ معلق مؤقتاً</span>
                          ) : isExpired ? (
                            <span className="bdg" style={{ background: '#fee2e2', color: '#b91c1c' }}>🔴 منتهي الصلاحية</span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <span className="bdg" style={{ background: '#dcfce7', color: '#15803d', width: 'fit-content' }}>
                                🟢 نشط (متبقي {daysLeft} يوم)
                              </span>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <button
                              onClick={() => handleCopyLink(acc)}
                              className="btn btn-xs btn-s"
                              title="نسخ رابط الدخول المباشر بدون تسجيل"
                            >
                              {isCopied ? '✅ تم' : '📋 نسخ'}
                            </button>
                            <button
                              onClick={() => handleShareWhatsApp(acc)}
                              className="btn btn-xs"
                              style={{ background: '#25D366', color: 'white' }}
                              title="إرسال الرابط عبر واتساب"
                            >
                              📲
                            </button>
                            <button
                              onClick={() => handleOpenDemo(acc)}
                              className="btn btn-xs btn-p"
                              title="فتح العرض التجريبي في تبويب جديد"
                            >
                              🚀 فتح
                            </button>
                            <button
                              onClick={() => handleTestInCurrentSession(acc)}
                              disabled={testingId === acc.username}
                              className="btn btn-xs btn-g"
                              title="تجربة بيئة العرض مباشرة في هذه الجلسة"
                            >
                              {testingId === acc.username ? '⏳' : '⚡ تجربة'}
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            {/* تمديد الصلاحية */}
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={() => setExtendingId(extendingId === acc.username ? null : acc.username)}
                                className="btn btn-xs btn-g"
                                title="تمديد أيام الصلاحية"
                              >
                                ⏳ تمديد
                              </button>
                              {extendingId === acc.username && (
                                <div style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: '100%',
                                  zIndex: 100,
                                  background: 'white',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                  borderRadius: 8,
                                  padding: 8,
                                  border: '1px solid #e2e8f0',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 4,
                                  minWidth: 120
                                }}>
                                  <button onClick={() => handleExtend(acc.username, 3)} className="btn btn-xs btn-g" style={{ textAlign: 'right' }}>+ 3 أيام</button>
                                  <button onClick={() => handleExtend(acc.username, 7)} className="btn btn-xs btn-g" style={{ textAlign: 'right' }}>+ 7 أيام (أسبوع)</button>
                                  <button onClick={() => handleExtend(acc.username, 14)} className="btn btn-xs btn-g" style={{ textAlign: 'right' }}>+ 14 يوماً</button>
                                </div>
                              )}
                            </div>

                            {/* تعليق / تفعيل */}
                            <button
                              onClick={() => handleToggleStatus(acc.username, acc.status)}
                              className="btn btn-xs btn-g"
                              title={acc.status === 'active' ? 'إيقاف مؤقت' : 'تفعيل'}
                            >
                              {acc.status === 'active' ? '⏸️' : '▶️'}
                            </button>

                            {/* حذف */}
                            <button
                              onClick={() => handleDelete(acc.username)}
                              className="btn btn-xs btn-d"
                              title="حذف العرض التجريبي نهائياً"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* نافذة إنشاء ديمو جديد */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div className="wg" style={{ width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', margin: 0 }}>
            <div className="wg-h">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>🚀</span>
                <div>
                  <h3 style={{ margin: 0 }}>إنشاء عرض تجريبي جديد (ديمو مباشر)</h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                    سيتم توليد رابط دخول فوري للجهة دون الحاجة لأي تسجيل دخول
                  </span>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-g btn-xs">✕</button>
            </div>

            <form onSubmit={handleCreate} className="wg-b fg c2" style={{ padding: 20 }}>
              <div className="fl full">
                <label>اسم المؤسسة / المركز المستهدف <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جمعية رعاية وتأهيل المستفيدين / مركز النور"
                  value={form.centerName}
                  onChange={e => setForm({ ...form, centerName: e.target.value })}
                />
              </div>

              <div className="fl">
                <label>اسم المسؤول / المنسق المستهدف</label>
                <input
                  type="text"
                  placeholder="مثال: أ. خالد بن أحمد"
                  value={form.managerName}
                  onChange={e => setForm({ ...form, managerName: e.target.value })}
                />
              </div>

              <div className="fl">
                <label>رقم هاتف / واتساب للتواصل</label>
                <input
                  type="tel"
                  placeholder="مثال: 966501234567"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div className="fl">
                <label>مدة صلاحية العرض التجريبي <span className="req">*</span></label>
                <select
                  value={form.durationDays}
                  onChange={e => setForm({ ...form, durationDays: Number(e.target.value) })}
                >
                  <option value={1}>يوم واحد (عرض تقديمي واجتماع مباشر)</option>
                  <option value={3}>3 أيام (الخيار الافتراضي المتوازن)</option>
                  <option value={7}>7 أيام (تجربة أسبوعية كاملة)</option>
                  <option value={14}>14 يوماً (أسبوعان)</option>
                  <option value={30}>30 يوماً (شهر تجريبي)</option>
                </select>
              </div>

              <div className="fl full" style={{ background: 'var(--g0)', padding: 12, borderRadius: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={form.seedData}
                    onChange={e => setForm({ ...form, seedData: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                      تجهيز بيانات وعينات نموذجية تلقائياً 📊
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                      ملء الديمو بملفات طلاب، أخصائيين، أهداف خطط فردية (IEP)، جلسات، تقارير، وحضور لإبهار العميل بكامل مزايا النظام 1 2 3
                    </div>
                  </div>
                </label>
              </div>

              <div className="fl full">
                <label>ملاحظات إدارية خاصة بالعرض (اختياري)</label>
                <textarea
                  rows="2"
                  placeholder="مثال: تم التنسيق مع مدير المركز لعقد اجتماع عرض المنصة يوم الخميس القادم..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="full" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-g"
                  disabled={creating}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-p"
                  disabled={creating}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {creating ? '⏳ جارٍ التجهيز...' : '🚀 إنشاء وتوليد رابط الديمو المباشر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
