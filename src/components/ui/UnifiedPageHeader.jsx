import React from 'react';
import UnifiedBackButton from './UnifiedBackButton';

/**
 * UnifiedPageHeader (ترويسة الصفحة الموحدة)
 * ترويسة معيارية موحدة لكافة صفحات وأقسام نظام Easy Center
 * تجمع بين الأيقونة البارزة، العنوان، الوصف، شارات الحالة، أزرار الإجراءات، وزر الرجوع الموحد في أقصى اليسار
 *
 * @param {React.ReactNode} icon أيقونة القسم أو المكون
 * @param {string} iconBg لون خلفية الأيقونة
 * @param {string} iconColor لون أيقونة القسم
 * @param {React.ReactNode} title عنوان الصفحة أو القسم
 * @param {React.ReactNode} subtitle وصف توضيحي مختصر
 * @param {React.ReactNode} badge شارة أو عداد جانبي
 * @param {React.ReactNode} actions أزرار الإجراءات الرئيسية
 * @param {Function} onBack دالة الرجوع
 * @param {string} backLabel نص زر الرجوع
 * @param {string} accentColor لون الشريط الجانبي التمييزي
 * @param {string} className فئات CSS إضافية
 * @param {object} style كائن التنسيقات المخصصة
 */
export default function UnifiedPageHeader({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  badge,
  actions,
  onBack,
  backLabel = 'العودة للقائمة السابقة',
  accentColor,
  className = '',
  style = {},
  ...props
}) {
  const effectiveAccent = accentColor || 'var(--pr)';
  const effectiveIconBg = iconBg || `${effectiveAccent}18`;
  const effectiveIconColor = iconColor || effectiveAccent;

  return (
    <div
      className={`unified-page-header ${className}`.trim()}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRight: `5px solid ${effectiveAccent}`,
        borderRadius: 'var(--r)',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: 'var(--sh)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        ...style,
      }}
      {...props}
    >
      {/* القسم الأيمن: الأيقونة + العنوان والوصف + الشارة */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
        {icon && (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: effectiveIconBg,
              color: effectiveIconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.45rem',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                color: 'var(--text-main)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {title}
            </h1>
            {badge && (
              <span className="bdg" style={{ fontSize: '0.78rem', padding: '3px 10px', fontWeight: '700' }}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-sub)',
                marginTop: '4px',
                marginBottom: 0,
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* القسم الأيسر: الإجراءات وزر العودة */}
      {(actions || onBack) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {actions}
          {onBack && (
            <UnifiedBackButton
              onClick={onBack}
              label={backLabel}
            />
          )}
        </div>
      )}
    </div>
  );
}
