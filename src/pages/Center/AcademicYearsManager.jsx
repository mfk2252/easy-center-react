import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
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
  CheckCircle2,
  Clock,
  Settings2,
  Edit2,
  Trash2,
  Award,
  BookOpen
} from 'lucide-react';

const EMPTY_YEAR = {
  name: '',
  code: '',
  startDate: todayStr(),
  endDate: '',
  isCurrent: false,
  status: 'active',
  terms: 'الفصل الأول, الفصل الثاني, الفصل الثالث'
};

export default function AcademicYearsManager() {
  const { toast } = useApp();
  const [years, setYears] = useState([]);
  const [calendarConfig, setCalendarConfig] = useState(getCalendarConfig());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_YEAR);
  const [editId, setEditId] = useState(null);

  // IEP plans count per year
  const [plansPerYear, setPlansPerYear] = useState({});

  function reload() {
    const list = getAcademicYears();
    setYears(list);
    setCalendarConfig(getCalendarConfig());

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

  const handleConfigChange = (mode) => {
    const updated = { ...calendarConfig, mode };
    setCalendarConfig(updated);
    saveCalendarConfig(updated);
    toast('✅ تم تحديث نمط التقويم بالمركز', 'ok');
  };

  const handleSetActive = (yearId) => {
    setCurrentAcademicYear(yearId);
    reload();
    toast('⭐ تم تعيين العام كعام نشط رئيسي للمركز', 'ok');
  };

  const handleOpenNew = () => {
    setForm(EMPTY_YEAR);
    setEditId(null);
    setShowModal(true);
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
    if (!window.confirm('هل أنت متأكد من حذف هذا العام / الدورة؟')) return;
    const filtered = years.filter(y => y.id !== yearId);
    saveAcademicYears(filtered);
    reload();
    toast('🗑️ تم حذف العام بنجاح', 'ok');
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast('⚠️ يرجى إدخال اسم العام الدراسي أو الدورة', 'er');
      return;
    }

    const termsArray = form.terms
      ? form.terms.split(',').map(t => t.trim()).filter(Boolean)
      : ['الفصل الأول', 'الفصل الثاني'];

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
      toast('✅ تم تحديث بيانات العام الدراسي بنجاح', 'ok');
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
      toast('✅ تم إضافة العام الدراسي بنجاح', 'ok');
    }

    saveAcademicYears(updatedYears);
    setShowModal(false);
    reload();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Calendar Mode Selector */}
      <div className="wg" style={{ margin: 0, padding: '16px 20px', borderRadius: 14, border: '1px solid var(--border-color)', background: 'var(--card-bg, #fff)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
              <Settings2 style={{ width: 18, height: 18, color: 'var(--pr)' }} />
              <span>نظام ونمط التقويم المعتمد بالمركز:</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: 2 }}>
              يحدد كيفية تصنيف الخطط التربوية الفردية (IEP) والصفوف والتقارير عبر المواسم
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${calendarConfig.mode === 'academic' ? 'btn-p' : 'btn-g'}`}
              onClick={() => handleConfigChange('academic')}
            >
              🏫 سنوات وفصول دراسية (رسمية)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${calendarConfig.mode === 'continuous' ? 'btn-p' : 'btn-g'}`}
              onClick={() => handleConfigChange('continuous')}
            >
              🔄 مستمر طوال العام
            </button>
            <button
              type="button"
              className={`btn btn-sm ${calendarConfig.mode === 'flexible' ? 'btn-p' : 'btn-g'}`}
              onClick={() => handleConfigChange('flexible')}
            >
              🎯 دورات تأهيلية مرنة (موصى به)
            </button>
          </div>
        </div>
      </div>

      {/* Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar style={{ width: 20, height: 20, color: 'var(--pr)' }} />
            <span>قائمة السنوات والدورات التأهيلية ({years.length})</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
            تتيح للأخصائيين ترقية خطط الطلاب من سنة لأخرى ومقارنة الأهداف والمقاييس التراكمية
          </span>
        </div>

        <button
          type="button"
          className="btn btn-p"
          onClick={handleOpenNew}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          <span>إضافة عام / دورة جديدة</span>
        </button>
      </div>

      {/* Years Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {years.map(yr => {
          const isAct = yr.isCurrent;
          const plansCount = (plansPerYear[yr.id] || 0) + (plansPerYear[yr.name] || 0);

          return (
            <div
              key={yr.id}
              className="card"
              style={{
                padding: '16px 18px',
                borderRadius: 14,
                border: isAct ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                background: isAct ? 'rgba(37, 99, 235, 0.03)' : 'var(--card-bg, #fff)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{yr.name}</span>
                    {isAct && (
                      <span className="bdg b-bl" style={{ fontSize: '0.7rem' }}>
                        ⭐ العام النشط حالياً
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: 2 }}>
                    الكود: {yr.code || yr.name}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-g"
                    onClick={() => handleOpenEdit(yr)}
                    title="تعديل"
                  >
                    <Edit2 style={{ width: 13, height: 13 }} />
                  </button>
                  {!isAct && (
                    <button
                      type="button"
                      className="btn btn-xs btn-d"
                      onClick={() => handleDelete(yr.id)}
                      title="حذف"
                    >
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dates & Terms */}
              <div style={{ background: 'var(--g0)', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>الفترة:</span>
                  <span style={{ fontWeight: 600 }}>{yr.startDate || '—'} إلى {yr.endDate || '—'}</span>
                </div>
                {yr.terms && yr.terms.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>الفترات / الفصول:</span>
                    <span style={{ fontWeight: 600 }}>{yr.terms.join(' · ')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>الخطط الفردية المسجلة:</span>
                  <span className="bdg b-gr" style={{ fontSize: '0.72rem' }}>{plansCount} خطط IEP</span>
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`bdg ${yr.status === 'completed' ? 'b-gr' : yr.status === 'upcoming' ? 'b-yl' : 'b-bl'}`} style={{ fontSize: '0.7rem' }}>
                  {yr.status === 'completed' ? 'مكتمل / منتهي' : yr.status === 'upcoming' ? 'مستقبلي' : 'نشط'}
                </span>

                {!isAct && (
                  <button
                    type="button"
                    className="btn btn-xs btn-p"
                    onClick={() => handleSetActive(yr.id)}
                    style={{ fontSize: '0.76rem' }}
                  >
                    ⭐ تعيين كعام نشط
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add/Edit Academic Year */}
      {showModal && (
        <div className="mbg" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="mb" style={{ maxWidth: 520 }}>
            <div className="fhd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                {editId ? '✏️ تعديل العام الدراسي / الدورة' : '➕ إضافة عام دراسي / دورة جديدة'}
              </h3>
              <button type="button" className="btn btn-g btn-xs" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="fg c1" style={{ gap: 12 }}>
              <div className="fl">
                <label style={{ fontWeight: 700 }}>اسم العام الدراسي / الدورة <span className="req">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="مثال: 2025 / 2026 أو الدورة التأهيلية الثالثة"
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700 }}>الرمز أو الاختصار</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="مثال: 2025-2026"
                />
              </div>

              <div className="fg c2" style={{ margin: 0 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>تاريخ البداية</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>تاريخ النهاية</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700 }}>الفصول / الفترات (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={form.terms}
                  onChange={(e) => setForm(f => ({ ...f, terms: e.target.value }))}
                  placeholder="الفصل الأول, الفصل الثاني, الفصل الثالث"
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700 }}>حالة العام</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">نشط وقيد التطبيق</option>
                  <option value="completed">منتهي ومؤرشف</option>
                  <option value="upcoming">مستقبلي / تحضيري</option>
                </select>
              </div>
            </div>

            <div className="fa" style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-g" onClick={() => setShowModal(false)}>إلغاء</button>
              <button type="button" className="btn btn-p" onClick={handleSave}>حفظ العام الدراسي</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
