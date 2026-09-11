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
        borderRight: `5px solid ${effectiveAccent}`,
        ...style,
      }}
      {...props}
    >
      {/* القسم الأيمن: الأيقونة + العنوان والوصف + الشارة */}
      <div className="unified-page-header-main">
        {icon && (
          <div
            className="unified-page-header-icon"
            style={{
              background: effectiveIconBg,
              color: effectiveIconColor,
            }}
          >
            {icon}
          </div>
        )}

        <div className="unified-page-header-text">
          <div className="unified-page-header-title-row">
            <h1 className="unified-page-header-title">
              {title}
            </h1>
            {badge && (
              <span className="bdg unified-page-header-badge">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="unified-page-header-sub">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* القسم الأيسر: الإجراءات وزر العودة */}
      {(actions || onBack) && (
        <div className="unified-page-header-actions">
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
