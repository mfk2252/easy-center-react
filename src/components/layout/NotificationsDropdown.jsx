import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LanguageContext';
import {
  fetchGlobalNotifications,
  markNotifAsRead,
  markAllNotifsAsRead,
  clearAllReadNotifs
} from '../../services/notificationService';

export default function NotificationsDropdown() {
  const { currentUser, go } = useApp();
  const { t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all | unread | sessions | appointments | finance | attendance | iep | general
  const [notifData, setNotifData] = useState({ list: [], unreadCount: 0, totalCount: 0, hasUrgent: false });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef(null);

  // تحديث الإشعارات من قاعدة البيانات
  const refreshNotifications = useCallback(() => {
    setIsRefreshing(true);
    try {
      const data = fetchGlobalNotifications(currentUser);
      setNotifData(data);
    } catch (e) {
      console.warn('Error fetching notifications:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 200);
    }
  }, [currentUser]);

  // تحديث تلقائي عند فتح القائمة، وتحديث دوري كل 20 ثانية لرصد أي تغييرات لحظية
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 20000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  // إغلاق القائمة عند النقر في الخارج أو الضغط على زر Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // تصفية الإشعارات حسب التبويب النشط
  const filteredList = useMemo(() => {
    let items = notifData.list;
    if (activeFilter === 'unread') {
      return items.filter(n => !n.isRead);
    }
    if (activeFilter === 'sessions') {
      return items.filter(n => n.category === 'sessions');
    }
    if (activeFilter === 'appointments') {
      return items.filter(n => n.category === 'appointments');
    }
    if (activeFilter === 'finance') {
      return items.filter(n => n.category === 'finance');
    }
    if (activeFilter === 'attendance') {
      return items.filter(n => n.category === 'attendance' || n.category === 'iep');
    }
    if (activeFilter === 'general') {
      return items.filter(n => n.category === 'general' || n.category === 'hr');
    }
    return items;
  }, [notifData.list, activeFilter]);

  // التفاعل مع النقر على إشعار محدد
  const handleItemClick = (item) => {
    markNotifAsRead(item.id, currentUser);
    refreshNotifications();
    setIsOpen(false);
    if (item.actionView) {
      go(item.actionView);
    }
  };

  // تمييز كافة الإشعارات كمقروءة
  const handleMarkAllRead = () => {
    const unreadIds = notifData.list.filter(n => !n.isRead).map(n => n.id);
    markAllNotifsAsRead(unreadIds, currentUser);
    refreshNotifications();
  };

  // مسح السجل
  const handleClearAll = () => {
    clearAllReadNotifs(currentUser);
    refreshNotifications();
  };

  // تفاصيل الشدة اللمسية واللونية
  const getSeverityStyle = (sev, isRead) => {
    if (isRead) {
      return {
        badge: { background: 'var(--g1)', color: 'var(--g5)', border: '1px solid var(--g2)' },
        label: 'مقروء',
        dot: false,
      };
    }
    switch (sev) {
      case 'urgent':
        return {
          badge: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
          label: 'عاجل',
          dot: true,
          dotColor: '#ef4444',
        };
      case 'warn':
        return {
          badge: { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' },
          label: 'تنبيه',
          dot: true,
          dotColor: '#f59e0b',
        };
      case 'success':
        return {
          badge: { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' },
          label: 'مكتمل',
          dot: false,
          dotColor: '#10b981',
        };
      case 'info':
      default:
        return {
          badge: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
          label: 'معلومة',
          dot: true,
          dotColor: '#3b82f6',
        };
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* زر الجرس الرئيسي في شريط التنقل */}
      <button
        type="button"
        id="btn-global-notifications"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) refreshNotifications();
        }}
        className="nav-icon-btn no-print"
        title="مركز الإشعارات والتنبيهات"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
          color: notifData.unreadCount > 0 ? '#ffffff' : 'var(--g4)',
          border: 'none',
          cursor: 'pointer',
          borderRadius: 8,
          width: 36,
          height: 36,
          fontSize: '1.1rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="قائمة التنبيهات والإشعارات"
      >
        <span style={{ transform: notifData.unreadCount > 0 ? 'scale(1.08)' : 'scale(1)', display: 'inline-block' }}>
          🔔
        </span>

        {/* شارة عدد الإشعارات غير المقروءة */}
        {notifData.unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              background: notifData.hasUrgent ? '#ef4444' : 'var(--pr, #1a56db)',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--g9, #0f172a)',
              boxShadow: notifData.hasUrgent ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 1px 4px rgba(0,0,0,0.3)',
              animation: notifData.hasUrgent ? 'pulse 2s infinite' : 'none',
            }}
          >
            {notifData.unreadCount > 99 ? '+99' : notifData.unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة للتنبيهات */}
      {isOpen && (
        <div
          id="global-notifications-dropdown"
          className="notifs-popup-container"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: 'min(420px, 92vw)',
            maxHeight: 'min(580px, 82vh)',
            background: 'var(--bg-card, #ffffff)',
            color: 'var(--text-main, #1e293b)',
            borderRadius: 16,
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--border-color, rgba(0,0,0,0.08))',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1200,
            overflow: 'hidden',
            fontFamily: 'var(--font-main, inherit)',
            animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'top left',
          }}
        >
          {/* ترويسة القائمة المنسدلة */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--g0, #f8fafc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem' }}>🔔</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  الإشعارات والتنبيهات
                  {notifData.unreadCount > 0 && (
                    <span
                      style={{
                        background: 'var(--pr-l, rgba(26,86,219,0.12))',
                        color: 'var(--pr, #1a56db)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: 12,
                      }}
                    >
                      {notifData.unreadCount} جديدة
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--g5, #64748b)', marginTop: 1 }}>
                  متابعة شاملة لجميع أحداث وعمليات المركز
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {notifData.unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--pr, #1a56db)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                  title="تحديد كل التنبيهات كمقروءة"
                >
                  ✓ مقروء للكل
                </button>
              )}
              <button
                type="button"
                onClick={refreshNotifications}
                disabled={isRefreshing}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--g5, #64748b)',
                  fontSize: '0.82rem',
                  padding: '4px 6px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  opacity: isRefreshing ? 0.5 : 1,
                  transform: isRefreshing ? 'rotate(180deg)' : 'none',
                  transition: 'all 0.3s',
                }}
                title="تحديث البيانات لحظياً"
              >
                🔄
              </button>
            </div>
          </div>

          {/* شريط الفلاتر والتصنيفات */}
          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-card, #ffffff)',
              scrollbarWidth: 'none',
            }}
          >
            {[
              { id: 'all', label: 'الكل', count: notifData.totalCount },
              { id: 'unread', label: 'غير المقروء', count: notifData.unreadCount },
              { id: 'sessions', label: '⏱️ الجلسات' },
              { id: 'appointments', label: '🗓️ المواعيد' },
              { id: 'finance', label: '💰 المالية' },
              { id: 'attendance', label: '📋 الحضور والخطط' },
              { id: 'general', label: '🏢 عام وإداري' },
            ].map(f => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    border: 'none',
                    borderRadius: 20,
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'var(--pr, #1a56db)' : 'var(--g1, #f1f5f9)',
                    color: isSelected ? '#ffffff' : 'var(--g6, #475569)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {f.label}
                  {f.count !== undefined && f.count > 0 && (
                    <span
                      style={{
                        fontSize: '0.66rem',
                        padding: '1px 5px',
                        borderRadius: 10,
                        background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--g2, #e2e8f0)',
                        color: isSelected ? '#ffffff' : 'var(--g7, #334155)',
                        fontWeight: 700,
                      }}
                    >
                      {f.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* قائمة التنبيهات مع التمرير السلس */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxHeight: 400,
            }}
          >
            {filteredList.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  color: 'var(--g5, #64748b)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: '2.4rem' }}>🎉</div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main, #1e293b)' }}>
                  {activeFilter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد تنبيهات في هذا القسم'}
                </div>
                <div style={{ fontSize: '0.78rem', maxWidth: 260, lineHeight: 1.5 }}>
                  كافة الأنشطة والمواعيد والبيانات الحالية مسجلة بانتظام.
                </div>
              </div>
            ) : (
              filteredList.map(item => {
                const sevMeta = getSeverityStyle(item.severity, item.isRead);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: item.isRead ? 'transparent' : 'var(--g0, #f8fafc)',
                      border: item.isRead
                        ? '1px solid transparent'
                        : '1px solid var(--border-color, #e2e8f0)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      textAlign: 'right',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--g1, #f1f5f9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = item.isRead ? 'transparent' : 'var(--g0, #f8fafc)';
                    }}
                  >
                    {/* أيقونة الفئة */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'var(--g1, #f1f5f9)',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {item.categoryIcon || '🔔'}
                    </div>

                    {/* المحتوى النصي */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                          {!item.isRead && (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: sevMeta.dotColor || 'var(--pr, #1a56db)',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <span
                            style={{
                              fontWeight: item.isRead ? 600 : 800,
                              fontSize: '0.84rem',
                              color: item.isRead ? 'var(--g6, #475569)' : 'var(--text-main, #0f172a)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.title}
                          </span>
                        </div>

                        {/* شارة الشدة */}
                        <span
                          style={{
                            ...sevMeta.badge,
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 6,
                            flexShrink: 0,
                          }}
                        >
                          {sevMeta.label}
                        </span>
                      </div>

                      {/* التفاصيل الإضافية */}
                      {item.detail && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--g5, #64748b)',
                            marginTop: 3,
                            lineHeight: 1.4,
                            wordBreak: 'break-word',
                          }}
                        >
                          {item.detail}
                        </div>
                      )}

                      {/* معلومات الوقت والتوجيه */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 6,
                          fontSize: '0.68rem',
                          color: 'var(--g4, #94a3b8)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          🕒 {item.time}
                        </span>
                        <span style={{ color: 'var(--pr, #1a56db)', fontWeight: 600 }}>
                          عرض والتفاصيل ↗
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* التذييل وخيارات المتابعة السريعة */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--g0, #f8fafc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--g5, #64748b)', fontWeight: 500 }}>
              {notifData.unreadCount > 0
                ? `${notifData.unreadCount} تنبيه بحاجة لمتابعتك`
                : 'كافة التنبيهات مقروءة ومحدثة'}
            </span>

            <button
              type="button"
              onClick={handleClearAll}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--g5, #64748b)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 4,
                textDecoration: 'underline',
              }}
              title="إعادة ضبط سجل الإشعارات"
            >
              مسح السجل
            </button>
          </div>
        </div>
      )}

      {/* الرسوم المتحركة للقائمة المنسدلة */}
      <style>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        @media (max-width: 480px) {
          .notifs-popup-container {
            position: fixed !important;
            top: 54px !important;
            left: 8px !important;
            right: 8px !important;
            width: calc(100vw - 16px) !important;
            max-height: calc(100vh - 70px) !important;
          }
        }
      `}</style>
    </div>
  );
}
