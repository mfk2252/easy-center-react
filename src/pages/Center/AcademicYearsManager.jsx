import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet } from '../../hooks/useStorage';
import { todayStr } from '../../utils/dateHelpers';
import {
  getAcademicYears,
  saveAcademicYears,
  getCalendarConfig,
  saveCalendarConfig,
  setCurrentAcademicYear
} from '../../utils/academicYears';
import {
  Calendar,
  Plus,
  Settings2,
  Edit2,
  Trash2,
  Sparkles,
  Check,
  Layers,
  Clock,
  HelpCircle,
  X
} from 'lucide-react';

const MODE_PRESETS = {
  academic: {
    title: 'نظام السنوات والفصول الدراسية الرسمية',
    icon: '🏫',
    badge: 'تقويم أكاديمي معتمد',
    desc: 'يُقسّم العام إلى 3 فصول دراسية منتظمة (أو فصلين) مع فترات إجازة مدرسية، متوافق كلياً مع تقويم وزارة التعليم لتأهيل الطلاب بالتوازي مع المدارس.',
    defaultTerms: 'الفصل الدراسي الأول, الفصل الدراسي الثاني, الفصل الدراسي الثالث',
    namePlaceholder: 'مثال: 2025 / 2026',
    durationLabel: 'الفترة الدراسية السنوية',
    termTypeLabel: 'الفصول الدراسية',
    cycleNamePrefix: 'العام الدراسي',
    generatorLabel: '⚡ توليد العام الدراسي الجديد بنظام 3 فصول',
    generateName: () => {
      const currentYear = new Date().getFullYear();
      return `${currentYear} / ${currentYear + 1}`;
    },
    generateStartDate: () => `${new Date().getFullYear()}-09-01`,
    generateEndDate: () => `${new Date().getFullYear() + 1}-06-30`,
  },
  continuous: {
    title: 'نظام العمل والتشغيل المستمر طوال العام',
    icon: '🔄',
    badge: 'تشغيل مستمر 12 شهراً',
    desc: 'يعمل المركز على مدار 12 شهراً سنوياً بدون انقطاع، مع تقسيم السنة إلى 4 محطات تقييمية ربع سنوية (Q1, Q2, Q3, Q4) لتقييم تطور المستفيدين بشكل مستمر.',
    defaultTerms: 'الربع الأول (Q1: يناير - مارس), الربع الثاني (Q2: أبريل - يونيو), الربع الثالث (Q3: يوليو - سبتمبر), الربع الرابع (Q4: أكتوبر - ديسمبر)',
    namePlaceholder: 'مثال: دورة العام التشغيلي والتأهيلي 2026',
    durationLabel: 'السنة التشغيلية',
    termTypeLabel: 'الأرباع السنوية للتقييم (Quarters)',
    cycleNamePrefix: 'العام التشغيلي المستمر',
    generatorLabel: '⚡ توليد دورة سنوية مستمرة للعام الجديد (4 أرباع)',
    generateName: () => `العام التشغيلي والتأهيلي ${new Date().getFullYear() + 1}`,
    generateStartDate: () => `${new Date().getFullYear() + 1}-01-01`,
    generateEndDate: () => `${new Date().getFullYear() + 1}-12-31`,
  },
  flexible: {
    title: 'نظام الدورات التأهيلية المرنة والبرامج المكثفة',
    icon: '🎯',
    badge: 'نظام الدفعات التأهيلية (موصى به)',
    desc: 'نظام دورات علاجية وبرامج مكثفة محددة المدة (3 إلى 6 أشهر لكل دورة). يتيح قياس الأهداف القبلية والبعدية بدقة وتدوير الخطط الفردية مع كل دفعة للمركز.',
    defaultTerms: 'المرحلة التأسيسية والتقييم القبلي, المرحلة التدريبية المكثفة, مرحلة التمكين والتقييم البعدي',
    namePlaceholder: 'مثال: الدورة التأهيلية الأولى - 2026 (3 أشهر)',
    durationLabel: 'فترة الدورة التأهيلية',
    termTypeLabel: 'المراحل التتابعية للدورة',
    cycleNamePrefix: 'الدورة التأهيلية',
    generatorLabel: '⚡ إضافة دورة تأهيلية جديدة (3 أشهر)',
    generateName: () => `الدورة التأهيلية المكثفة ${new Date().getFullYear()} - دفعة ${new Date().getMonth() < 6 ? 'الربيع' : 'الخريف'}`,
    generateStartDate: () => todayStr(),
    generateEndDate: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      return d.toISOString().split('T')[0];
    },
  }
};

export default function AcademicYearsManager() {
  const { toast } = useApp();
  const [years, setYears] = useState([]);
  const [calendarConfig, setCalendarConfig] = useState(getCalendarConfig());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    startDate: todayStr(),
    endDate: '',
    isCurrent: false,
    status: 'active',
    terms: ''
  });
  const [editId, setEditId] = useState(null);
  const [plansPerYear, setPlansPerYear] = useState({});

  function reload() {
    const list = getAcademicYears();
    setYears(list);
    const cfg = getCalendarConfig();
    setCalendarConfig(cfg);

    // Calculate plans count per year
    const allPlans = lsGet('progPrograms') || [];
    const counts = {};
    allPlans.forEach(p => {
      const yKey = p.academicYearId || p.academicYear || 'other';
      counts[yKey] = (counts[yKey] || 0) + 1;
    });
    setPlansPerYear(counts);
  }

  useEffect(() => {
    reload();
  }, []);

  const activeModeKey = calendarConfig?.mode || 'flexible';
  const currentModeInfo = MODE_PRESETS[activeModeKey] || MODE_PRESETS.flexible;

  const handleConfigChange = (mode) => {
    const updated = { ...calendarConfig, mode };
    setCalendarConfig(updated);
    saveCalendarConfig(updated);
    const preset = MODE_PRESETS[mode];
    toast(`✅ تم تفعيل ${preset.title}`, 'ok');
  };

  const handleSetActive = (yearId) => {
    setCurrentAcademicYear(yearId);
    reload();
    toast('⭐ تم تعيين هذا العام كعام نشط رئيسي للمركز', 'ok');
  };

  const handleOpenNew = () => {
    const preset = MODE_PRESETS[activeModeKey];
    setForm({
      name: preset.generateName ? preset.generateName() : '',
      code: '',
      startDate: preset.generateStartDate ? preset.generateStartDate() : todayStr(),
      endDate: preset.generateEndDate ? preset.generateEndDate() : '',
      isCurrent: years.length === 0,
      status: 'active',
      terms: preset.defaultTerms || 'الفصل الأول, الفصل الثاني, الفصل الثالث'
    });
    setEditId(null);
    setShowModal(true);
  };

  const handleQuickGenerate = () => {
    const preset = MODE_PRESETS[activeModeKey];
    const generatedName = preset.generateName();
    const startDate = preset.generateStartDate();
    const endDate = preset.generateEndDate();
    const termsArray = preset.defaultTerms.split(',').map(t => t.trim());

    // Check if duplicate name
    if (years.some(y => y.name === generatedName)) {
      toast(`⚠️ العام أو الدورة (${generatedName}) موجودة مسبقاً`, 'warn');
      return;
    }

    const newYearObj = {
      id: `ay_${Date.now()}`,
      name: generatedName,
      code: generatedName.replace(/\s+/g, '-'),
      startDate,
      endDate,
      isCurrent: false,
      status: 'active',
      terms: termsArray
    };

    const updated = [...years, newYearObj];
    saveAcademicYears(updated);
    reload();
    toast(`✨ تم توليد وإضافة (${generatedName}) بنجاح`, 'ok');
  };

  const handleOpenEdit = (yr) => {
    setForm({
      name: yr.name || '',
      code: yr.code || '',
      startDate: yr.startDate || '',
      endDate: yr.endDate || '',
      isCurrent: yr.isCurrent || false,
      status: yr.status || 'active',
      terms: Array.isArray(yr.terms) ? yr.terms.join(', ') : (yr.terms || '')
    });
    setEditId(yr.id);
    setShowModal(true);
  };

  const handleDelete = (yearId) => {
    const target = years.find(y => y.id === yearId);
    if (!window.confirm(`هل أنت متأكد من حذف (${target?.name || 'هذا العام'})؟`)) return;
    const filtered = years.filter(y => y.id !== yearId);
    saveAcademicYears(filtered);
    reload();
    toast('🗑️ تم حذف العام / الدورة بنجاح', 'ok');
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast('⚠️ يرجى إدخال اسم العام الدراسي أو الدورة', 'er');
      return;
    }

    const termsArray = form.terms
      ? form.terms.split(',').map(t => t.trim()).filter(Boolean)
      : ['الفترة الأولى', 'الفترة الثانية'];

    let updatedYears = [...years];
    if (editId) {
      updatedYears = updatedYears.map(y => {
        if (y.id === editId) {
          return {
            ...y,
            name: form.name.trim(),
            code: form.code.trim() || form.name.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
            status: form.status,
            terms: termsArray
          };
        }
        return y;
      });
      toast('✅ تم حفظ تعديلات العام / الدورة بنجاح', 'ok');
    } else {
      const newYearObj = {
        id: `ay_${Date.now()}`,
        name: form.name.trim(),
        code: form.code.trim() || form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        isCurrent: updatedYears.length === 0,
        status: form.status,
        terms: termsArray
      };
      updatedYears.push(newYearObj);
      toast('✅ تم إضافة العام / الدورة بنجاح', 'ok');
    }

    saveAcademicYears(updatedYears);
    setShowModal(false);
    reload();
  };

  return (
    <div className="wg" style={{ margin: 0 }}>
      {/* Container Header */}
      <div className="wg-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.25rem' }}>📅</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800 }}>نظام ونمط العمل السنوي والدورات التأهيلية (معايير الجودة)</h3>
            <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>
              تنظيم وتقسيم الطلاب، البرامج، الخطط الفردية (IEP)، والفعاليات في سجلات سنوية مستقلة ومتتابعة
            </div>
          </div>
        </div>

        <span className="bdg b-bl" style={{ fontWeight: 700 }}>
          {currentModeInfo.icon} {currentModeInfo.badge}
        </span>
      </div>

      <div className="wg-b" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        
        {/* 1. Selector for Operating Calendar Mode */}
        <div style={{
          background: 'var(--g0)',
          borderRadius: 12,
          padding: '16px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '.92rem', color: 'var(--text-main)' }}>
              <Settings2 style={{ width: 17, height: 17, color: 'var(--pr)' }} />
              <span>اختر النمط والتقويم المعتمد لإدارة المركز:</span>
            </div>
            <div style={{ fontSize: '.74rem', color: 'var(--text-sub)' }}>
              ينعكس تلقائياً على خيارات التسجيل، التقارير، والخطط الفردية
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {Object.entries(MODE_PRESETS).map(([key, mode]) => {
              const isSelected = activeModeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleConfigChange(key)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: isSelected ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--pr-l)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--pr)' : 'var(--text-main)',
                    textAlign: 'right',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{mode.icon}</span>
                      <span>{mode.title}</span>
                    </div>
                    {isSelected && <Check style={{ width: 16, height: 16, color: 'var(--pr)' }} />}
                  </div>
                  <div style={{ fontSize: '.72rem', color: isSelected ? 'var(--pr)' : 'var(--text-sub)', opacity: 0.9 }}>
                    {mode.badge}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic explanation card for selected mode */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px dashed var(--border-color)',
            fontSize: '.8rem',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            lineHeight: 1.6
          }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>💡</span>
            <div>
              <strong style={{ color: 'var(--pr)', display: 'block', marginBottom: 2 }}>
                {currentModeInfo.icon} {currentModeInfo.title}:
              </strong>
              <span>{currentModeInfo.desc}</span>
            </div>
          </div>
        </div>

        {/* 2. List of Configured Years / Cohorts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '.96rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar style={{ width: 18, height: 18, color: 'var(--pr)' }} />
              <span>السنوات والدورات المسجلة بالمركز ({years.length})</span>
            </div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>
              حدد العام النشط حالياً لتلقي خطط الطلاب والتقارير الجديدة
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-s"
              onClick={handleQuickGenerate}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              title="توليد تلقائي سريع حسب النمط المختار"
            >
              <Sparkles style={{ width: 14, height: 14 }} />
              <span>{currentModeInfo.generatorLabel}</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-p"
              onClick={handleOpenNew}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              <span>إضافة يدوية مخصصة</span>
            </button>
          </div>
        </div>

        {/* Grid of registered Years/Cycles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {years.map(yr => {
            const isAct = yr.isCurrent;
            const plansCount = (plansPerYear[yr.id] || 0) + (plansPerYear[yr.name] || 0);

            return (
              <div
                key={yr.id}
                style={{
                  padding: '16px',
                  borderRadius: 12,
                  border: isAct ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                  background: isAct ? 'var(--pr-l)' : 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: 'var(--sh)',
                  transition: 'all 0.18s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '.98rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{yr.name}</span>
                      {isAct && (
                        <span className="bdg b-bl" style={{ fontSize: '.68rem', padding: '2px 8px' }}>
                          ⭐ العام النشط
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
                      الكود المرجعي: {yr.code || yr.name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={() => handleOpenEdit(yr)}
                      title="تعديل بيانات هذا العام"
                    >
                      <Edit2 style={{ width: 12, height: 12 }} />
                    </button>
                    {!isAct && (
                      <button
                        type="button"
                        className="btn btn-xs btn-d"
                        onClick={() => handleDelete(yr.id)}
                        title="حذف هذا العام"
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub info */}
                <div style={{
                  background: 'var(--g0)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: '.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>{currentModeInfo.durationLabel}:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {yr.startDate || '—'} إلى {yr.endDate || '—'}
                    </span>
                  </div>

                  {yr.terms && yr.terms.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                      <span style={{ color: 'var(--text-sub)' }}>{currentModeInfo.termTypeLabel}:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '.74rem' }}>
                        {yr.terms.join(' · ')}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <span style={{ color: 'var(--text-sub)' }}>خطط الطلاب (IEP) المرتبطة:</span>
                    <span className="bdg b-gr" style={{ fontSize: '.7rem', padding: '1px 7px' }}>
                      {plansCount} خطط مسجلة
                    </span>
                  </div>
                </div>

                {/* Action footer */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                  <span className={`bdg ${yr.status === 'completed' ? 'b-gr' : yr.status === 'upcoming' ? 'b-yl' : 'b-bl'}`} style={{ fontSize: '.68rem' }}>
                    {yr.status === 'completed' ? 'مكتمل ومؤرشف ✅' : yr.status === 'upcoming' ? 'مستقبلي ⏳' : 'نشط تشغيلياً 🟢'}
                  </span>

                  {!isAct && (
                    <button
                      type="button"
                      className="btn btn-xs btn-p"
                      onClick={() => handleSetActive(yr.id)}
                      style={{ fontSize: '.72rem', padding: '4px 10px', fontWeight: 700 }}
                    >
                      ⭐ تعيين كعام نشط
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          fontSize: '.76rem',
          color: 'var(--text-sub)',
          background: 'var(--g0)',
          padding: '10px 14px',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <HelpCircle style={{ width: 16, height: 16, color: 'var(--pr)', flexShrink: 0 }} />
          <span>
            <strong>توجيه الجودة والاعتماد:</strong> يساعد فرز البيانات وفق السنوات في إعداد تقارير التطور التراكمية، ومطابقة متطلبات تدقيق وزارة التنمية، واستخراج نتائج المقاييس والخطط لكل عام بدقة متناهية.
          </span>
        </div>

      </div>

      {/* MODAL: ADD / EDIT ACADEMIC YEAR OR REHAB CYCLE */}
      {showModal && (
        <div
          className="mbg"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 520,
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              borderRadius: 16,
              border: '1px solid var(--border-color)',
              padding: 0,
              overflow: 'hidden',
              boxShadow: 'var(--sh3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--g0)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                <span>{currentModeInfo.icon}</span>
                <span>{editId ? 'تعديل بيانات العام / الدورة' : `إضافة ${currentModeInfo.cycleNamePrefix} جديدة`}</span>
              </div>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => setShowModal(false)}
                style={{ padding: '4px 8px', borderRadius: 8 }}
              >
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                  اسم العام / الدورة التأهيلية <span style={{ color: 'var(--err)' }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={currentModeInfo.namePlaceholder}
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>الكود المرجعي / المعرف المختصر</label>
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="مثال: 2025-2026 أو CYCLE-01"
                  dir="ltr"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>تاريخ البدء</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                  {currentModeInfo.termTypeLabel} (افصل بينها بفاصلة ,)
                </label>
                <input
                  value={form.terms}
                  onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
                  placeholder={currentModeInfo.defaultTerms}
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
                <div style={{ fontSize: '.72rem', color: 'var(--text-sub)', marginTop: 3 }}>
                  مثال: {currentModeInfo.defaultTerms}
                </div>
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>حالة العام / الدورة</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                >
                  <option value="active">نشط تشغيلياً 🟢</option>
                  <option value="upcoming">مستقبلي / قيد الإعداد ⏳</option>
                  <option value="completed">مكتمل ومؤرشف ✅</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              padding: '14px 20px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--g0)'
            }}>
              <button
                type="button"
                className="btn btn-g"
                onClick={() => setShowModal(false)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="btn btn-p"
                onClick={handleSave}
                style={{ fontWeight: 700 }}
              >
                💾 حفظ وتثبيت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
