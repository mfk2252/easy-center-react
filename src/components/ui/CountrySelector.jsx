import { useState, useRef, useEffect, useMemo } from 'react';
import { COUNTRIES, getCountryByCode } from '../../data/countriesData';

export default function CountrySelector({
  value,
  onChange,
  label = 'البلد / الدولة',
  required = false,
  disabled = false,
  id = 'center-country-selector',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all'); // all | arab | world
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // الدولة المحددة حالياً
  const selectedCountry = useMemo(() => {
    return getCountryByCode(value);
  }, [value]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // تصفية الدول حسب البحث والتصنيف
  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COUNTRIES.filter(c => {
      // تصفية المنطقة
      if (regionFilter === 'arab' && !c.isArab) return false;
      if (regionFilter === 'world' && c.isArab) return false;

      // تصفية البحث
      if (!q) return true;
      return (
        c.nameAr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phoneCode.replace('+', '').includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.currencyNameAr.toLowerCase().includes(q)
      );
    });
  }, [search, regionFilter]);

  const handleSelect = (country) => {
    if (disabled) return;
    onChange(country);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="fl" ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
          <span>🌐 {label}</span>
          {required && <span className="req" style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* زر عرض الدولة المختارة وفتح القائمة */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          minHeight: 40,
          padding: '6px 12px',
          borderRadius: 'var(--rd, 8px)',
          border: isOpen ? '1.5px solid var(--pr, #1a56db)' : '1px solid var(--border-color, #cbd5e1)',
          background: disabled ? 'var(--g1, #f1f5f9)' : 'var(--bg-card, #ffffff)',
          color: 'var(--text-main, #0f172a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px var(--pr-l, rgba(26, 86, 219, 0.15))' : 'none',
          transition: 'all 0.15s ease',
          fontSize: '0.88rem',
          textAlign: 'right',
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{selectedCountry.flag}</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
            <span style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedCountry.nameAr}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--g5, #64748b)', whiteSpace: 'nowrap' }}>
              {selectedCountry.nameEn} · {selectedCountry.phoneCode} · {selectedCountry.currency}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              background: 'var(--g1, #f1f5f9)',
              color: 'var(--g7, #334155)',
              padding: '2px 6px',
              borderRadius: 6,
              border: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            {selectedCountry.code}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--g4, #94a3b8)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            ▼
          </span>
        </div>
      </button>

      {/* القائمة المنبثقة للبحث والاختيار الذكي */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            left: 0,
            minWidth: 320,
            maxWidth: '100%',
            maxHeight: 380,
            background: 'var(--bg-card, #ffffff)',
            borderRadius: 12,
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--border-color, rgba(0,0,0,0.08))',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'countryFadeIn 0.15s ease-out',
          }}
        >
          {/* حقل البحث السريع */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color, #e2e8f0)', background: 'var(--g0, #f8fafc)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', right: 10, fontSize: '0.9rem', color: 'var(--g4, #94a3b8)', pointerEvents: 'none' }}>
                🔍
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث بالاسم (عربي / English)، الرمز، العملة..."
                style={{
                  width: '100%',
                  padding: '7px 32px 7px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color, #cbd5e1)',
                  background: 'var(--bg-card, #ffffff)',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredCountries.length > 0) {
                    handleSelect(filteredCountries[0]);
                  }
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    left: 8,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--g4, #94a3b8)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    padding: 2,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* أزرار التصفية السريعة للمناطق */}
            <div style={{ display: 'flex', gap: 4, marginTop: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'arab', label: '🌍 الدول العربية' },
                { id: 'world', label: '🌐 باقي دول العالم' },
              ].map(tab => {
                const isAct = regionFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRegionFilter(tab.id)}
                    style={{
                      border: 'none',
                      borderRadius: 14,
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      fontWeight: isAct ? 700 : 500,
                      background: isAct ? 'var(--pr, #1a56db)' : 'var(--g1, #f1f5f9)',
                      color: isAct ? '#ffffff' : 'var(--g6, #475569)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* قائمة الدول مع التمرير */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {filteredCountries.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--g5, #64748b)', fontSize: '0.82rem' }}>
                <div>🔍 لا توجد دولة مطابقة للبحث "{search}"</div>
              </div>
            ) : (
              filteredCountries.map(c => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <div
                    key={c.code}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: isSelected ? 'var(--pr-l, rgba(26, 86, 219, 0.08))' : 'transparent',
                      border: isSelected ? '1px solid var(--pr, #1a56db)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                      gap: 8,
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--g1, #f1f5f9)';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* العلم والاسم */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{c.flag}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: isSelected ? 800 : 600, fontSize: '0.84rem', color: isSelected ? 'var(--pr, #1a56db)' : 'var(--text-main, #0f172a)' }}>
                          {c.nameAr}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--g5, #64748b)' }}>
                          {c.nameEn} · {c.currencyNameAr} ({c.currency})
                        </div>
                      </div>
                    </div>

                    {/* كود الهاتف والشارة */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span
                        dir="ltr"
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: 'var(--g6, #475569)',
                          background: 'var(--g1, #f1f5f9)',
                          padding: '2px 6px',
                          borderRadius: 6,
                          border: '1px solid var(--border-color, #e2e8f0)',
                        }}
                      >
                        {c.phoneCode}
                      </span>
                      {isSelected && (
                        <span style={{ color: 'var(--pr, #1a56db)', fontSize: '0.9rem', fontWeight: 800 }}>
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* تذييل القائمة مع شرح الميزة الذكية */}
          <div
            style={{
              padding: '6px 12px',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--g0, #f8fafc)',
              fontSize: '0.7rem',
              color: 'var(--g5, #64748b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>💡 اختيار الدولة يضبط مفتاح الاتصال والعملة تلقائياً</span>
            <span>{filteredCountries.length} دولة</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes countryFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
