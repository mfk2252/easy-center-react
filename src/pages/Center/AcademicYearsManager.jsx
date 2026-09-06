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
    namePlaceholder: 'مثال: 2028 / 2029',
    durationLabel: 'الفترة الدراسية السنوية',
    termTypeLabel: 'الفصول الدراسية',
    cycleNamePrefix: 'العام الدراسي',
    generatorLabel: '⚡ توليد العام الدراسي التالي تلقائياً',
    generateNext: (existingYears = []) => {
      let maxEndYear = 2026;
      existingYears.forEach(y => {
        const matches = (y.name || '').match(/\b(20\d\d)\b/g);
        if (matches && matches.length >= 2) {
          const endY = parseInt(matches[1], 10);
          if (endY > maxEndYear) maxEndYear = endY;
        } else if (matches && matches.length === 1) {
          const yNum = parseInt(matches[0], 10);
          if (yNum >= maxEndYear) maxEndYear = yNum + 1;
        }
        if (y.endDate) {
          const ey = parseInt(y.endDate.slice(0, 4), 10);
          if (!isNaN(ey) && ey > maxEndYear) maxEndYear = ey;
        }
      });
      const nextStart = maxEndYear;
      const nextEnd = maxEndYear + 1;
      return {
        name: `${nextStart} / ${nextEnd}`,
        startDate: `${nextStart}-09-01`,
        endDate: `${nextEnd}-06-30`
      };
    }
  },
  continuous: {
    title: 'نظام العمل والتشغيل المستمر طوال العام',
    icon: '🔄',
    badge: 'تشغيل مستمر 12 شهراً',
    desc: 'يعمل المركز على مدار 12 شهراً سنوياً بدون انقطاع، مع تقسيم السنة إلى 4 محطات تقييمية ربع سنوية (Q1, Q2, Q3, Q4) لتقييم تطور المستفيدين بشكل مستمر.',
    defaultTerms: 'الربع الأول (Q1: يناير - مارس), الربع الثاني (Q2: أبريل - يونيو), الربع الثالث (Q3: يوليو - سبتمبر), الربع الرابع (Q4: أكتوبر - ديسمبر)',
    namePlaceholder: 'مثال: دورة العام التشغيلي والتأهيلي 2028',
    durationLabel: 'السنة التشغيلية',
    termTypeLabel: 'الأرباع السنوية للتقييم (Quarters)',
    cycleNamePrefix: 'العام التشغيلي المستمر',
    generatorLabel: '⚡ توليد السنة التشغيلية التالية (4 أرباع)',
    generateNext: (existingYears = []) => {
      let maxYear = 2026;
      existingYears.forEach(y => {
        const matches = (y.name || '').match(/\b(20\d\d)\b/g);
        if (matches) {
          matches.forEach(m => {
            const num = parseInt(m, 10);
            if (num > maxYear) maxYear = num;
          });
        }
        if (y.endDate) {
          const ey = parseInt(y.endDate.slice(0, 4), 10);
          if (!isNaN(ey) && ey > maxYear) maxYear = ey;
        }
      });
      const nextYear = maxYear + 1;
      return {
        name: `العام التشغيلي والتأهيلي ${nextYear}`,
        startDate: `${nextYear}-01-01`,
        endDate: `${nextYear}-12-31`
      };
    }
  },
  flexible: {
    title: 'نظام الدورات التأهيلية المرنة والبرامج المكثفة',
    icon: '🎯',
    badge: 'نظام الدفعات التأهيلية (موصى به)',
    desc: 'نظام دورات علاجية وبرامج مكثفة محددة المدة (3 إلى 6 أشهر لكل دورة). يتيح قياس الأهداف القبلية والبعدية بدقة وتدوير الخطط الفردية مع كل دفعة للمركز.',
    defaultTerms: 'المرحلة التأسيسية والتقييم القبلي, المرحلة التدريبية المكثفة, مرحلة التمكين والتقييم البعدي',
    namePlaceholder: 'مثال: الدورة التأهيلية (4) - 2028',
    durationLabel: 'فترة الدورة التأهيلية',
    termTypeLabel: 'المراحل التتابعية للدورة',
    cycleNamePrefix: 'الدورة التأهيلية',
    generatorLabel: '⚡ إضافة وتوليد دورة تأهيلية تالية (3 أشهر)',
    generateNext: (existingYears = []) => {
      let latestDate = new Date();
      existingYears.forEach(y => {
        if (y.endDate) {
          const d = new Date(y.endDate);
          if (!isNaN(d.getTime()) && d > latestDate) {
            latestDate = d;
          }
        }
      });
      const start = new Date(latestDate.getTime() + 86400000);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 3);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      const count = existingYears.length + 1;
      return {
        name: `الدورة التأهيلية (${count}) - ${start.getFullYear()}`,
        startDate: startStr,
        endDate: endStr
      };
    }
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
    const generated = preset.generateNext ? preset.generateNext(years) : {};
    setForm({
      name: generated.name || '',
      code: generated.code || '',
      startDate: generated.startDate || todayStr(),
      endDate: generated.endDate || '',
      isCurrent: years.length === 0,
      status: 'active',
      terms: preset.defaultTerms || 'الفصل الأول, الفصل الثاني, الفصل الثالث'
    });
    setEditId(null);
    setShowModal(true);
  };

  const handleQuickGenerate = () => {
    const preset = MODE_PRESETS[activeModeKey];
    const generated = preset.generateNext ? preset.generateNext(years) : {
      name: `دورة جديدة ${new Date().getFullYear()}`,
      startDate: todayStr(),
      endDate: ''
    };
    const generatedName = generated.name;
    const startDate = generated.startDate;
    const endDate = generated.endDate;
    const termsArray = preset.defaultTerms.split(',').map(t => t.trim());

    // Check if duplicate name
    if (years.some(y => y.name === generatedName)) {
      toast(`⚠️ العام أو الدورة (${generatedName}) موجودة مسبقاً`, 'warn');
      return;
    }

    const newYearObj = {
      id: `ay_${Date.now()}`,
      name: generatedName,
      code: generated.code || generatedName.replace(/\s+/g, '-'),
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
      if (form.isCurrent) {
        updatedYears = updatedYears.map(y => ({ ...y, isCurrent: y.id === editId }));
      }
      toast('✅ تم حفظ تعديلات العام / الدورة بنجاح', 'ok');
    } else {
      const newId = `ay_${Date.now()}`;
      const isCurr = form.isCurrent || updatedYears.length === 0;
      if (isCurr) {
        updatedYears = updatedYears.map(y => ({ ...y, isCurrent: false }));
      }
      const newYearObj = {
        id: newId,
        name: form.name.trim(),
        code: form.code.trim() || form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        isCurrent: isCurr,
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
        <div className="mbg">
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            {/* Modal Header */}
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{currentModeInfo.icon}</span>
                  <span>{editId ? 'تعديل بيانات العام / الدورة' : `إضافة ${currentModeInfo.cycleNamePrefix} جديدة`}</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '.78rem', opacity: 0.9 }}>
                  ضبط المدى الزمني والمحطات التقييمية لربط الخطط الفردية والتقارير
                </p>
              </div>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '.8rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
                title="إغلاق النافذة"
              >
                <X style={{ width: 15, height: 15 }} />
                <span>إغلاق</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body-scroll" style={{ padding: '20px 22px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                    اسم العام / الدورة التأهيلية <span className="req">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={currentModeInfo.namePlaceholder}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                    الكود المرجعي / المعرف المختصر
                  </label>
                  <input
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="مثال: 2025-2026 أو CYCLE-01"
                    dir="ltr"
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                    حالة العام / الدورة
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="active">نشط تشغيلياً 🟢</option>
                    <option value="upcoming">مستقبلي / قيد الإعداد ⏳</option>
                    <option value="completed">مكتمل ومؤرشف ✅</option>
                  </select>
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                    تاريخ البدء
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  />
                </div>

                <div className="fl full">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                    {currentModeInfo.termTypeLabel} <span style={{ fontSize: '.74rem', color: 'var(--text-sub)', fontWeight: 400 }}>(افصل بينها بفاصلة ,)</span>
                  </label>
                  <input
                    value={form.terms}
                    onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
                    placeholder={currentModeInfo.defaultTerms}
                  />
                  <div style={{ fontSize: '.73rem', color: 'var(--text-sub)', marginTop: 4 }}>
                    💡 اقتراح نمطي: {currentModeInfo.defaultTerms}
                  </div>
                </div>

                <div className="fl full" style={{
                  background: 'var(--g0)',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 6
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text-main)' }}>
                      تعيين كعام نشط رئيسي للمركز ⭐
                    </div>
                    <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
                      يتم اعتماد هذا العام تلقائياً للطلاب الجدد والخطط التأهيلية والتقارير
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isCurrent}
                    onChange={e => setForm(f => ({ ...f, isCurrent: e.target.checked }))}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--pr)' }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="fa">
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
                style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                💾 حفظ وتثبيت التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
