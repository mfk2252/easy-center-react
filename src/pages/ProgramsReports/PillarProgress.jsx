import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { sendReportToWhatsApp } from './programsWhatsApp';

const REPORT_TYPES = [
  { key: 'weekly', label: 'التقارير الأسبوعية', collection: 'progWeeklyReports', icon: '📅' },
  { key: 'monthly', label: 'التقارير الشهرية', collection: 'progMonthlyReports', icon: '🗓️' },
  { key: 'semiAnnual', label: 'التقرير النصف سنوي', collection: 'progSemiAnnualReports', icon: '📊' },
  { key: 'annual', label: 'التقرير السنوي الشامل', collection: 'progAnnualReports', icon: '📈' },
  { key: 'general', label: 'تقارير عامة', collection: 'progReports', icon: '📑' },
];

const EMPTY_REPORT = {
  ...EMPTY_STU_PICK,
  date: todayStr(),
  title: '',
  period: 'أسبوعي',
  achievedGoals: '',
  inProgressGoals: '',
  challenges: '',
  recommendations: '',
  progressRate: '80%',
  specialistName: '',
  notes: '',
};

export default function PillarProgress({ onDataChange }) {
  const { toast, center } = useApp();
  const [activeType, setActiveType] = useState('weekly'); // 'weekly' | 'monthly' | 'semiAnnual' | 'annual' | 'general'
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_REPORT);

  const currentTypeConfig = REPORT_TYPES.find(r => r.key === activeType) || REPORT_TYPES[0];

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setReports((lsGet(currentTypeConfig.collection) || []).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    if (onDataChange) onDataChange();
  }

  useEffect(() => {
    reload();
  }, [activeType]);

  function openNew() {
    setForm({
      ...EMPTY_REPORT,
      date: todayStr(),
      title: `${currentTypeConfig.label} - ${todayStr()}`,
    });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setForm({ ...EMPTY_REPORT, ...item });
    setEditId(item.id);
    setModalOpen(true);
  }

  function save() {
    if (!validateStudentPick(form)) { toast('⚠️ اختر الطالب أولاً', 'er'); return; }
    if (!form.title.trim()) { toast('⚠️ أدخل عنوان التقرير', 'er'); return; }

    const payload = {
      ...form,
      reportType: activeType,
      isUnregistered: form.mode === 'other',
      updatedAt: new Date().toISOString(),
    };

    if (editId) {
      lsUpd(currentTypeConfig.collection, editId, payload);
      toast('✅ تم تحديث التقرير بنجاح', 'ok');
    } else {
      lsAdd(currentTypeConfig.collection, { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ التقرير بنجاح', 'ok');
    }
    setModalOpen(false);
    reload();
  }

  function del(id) {
    if (!window.confirm('حذف هذا التقرير نهائياً؟')) return;
    lsDel(currentTypeConfig.collection, id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  function printReport(item) {
    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `
      <div style="direction:rtl;text-align:right;">
        <h2 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:8px;margin-bottom:14px;">
          ${currentTypeConfig.icon} ${esc(item.title || currentTypeConfig.label)}
        </h2>
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;">
          <tr>
            <td><b>اسم الطالب:</b> ${esc(item.studentName)}</td>
            <td><b>العمر:</b> ${esc(item.age || '—')}</td>
            <td><b>تاريخ التقرير:</b> ${esc(item.date || '—')}</td>
          </tr>
          <tr>
            <td><b>التشخيص:</b> ${esc(item.diagnosis || '—')}</td>
            <td><b>نوع التقرير:</b> ${esc(currentTypeConfig.label)}</td>
            <td><b>نسبة الإنجاز المقدرة:</b> ${esc(item.progressRate || '—')}</td>
          </tr>
        </table>

        ${item.achievedGoals ? `<h3 style="color:#059669;">✅ الأهداف التي تم إتقانها وتحقيقها:</h3><p style="white-space:pre-wrap;">${esc(item.achievedGoals)}</p>` : ''}
        ${item.inProgressGoals ? `<h3 style="color:#d97706;">⏳ الأهداف قيد التدريب والتطوير:</h3><p style="white-space:pre-wrap;">${esc(item.inProgressGoals)}</p>` : ''}
        ${item.challenges ? `<h3 style="color:#dc2626;">⚠️ التحديات والملاحظات السلوكية:</h3><p style="white-space:pre-wrap;">${esc(item.challenges)}</p>` : ''}
        ${item.recommendations ? `<h3 style="color:#1d4ed8;">💡 التوصيات والإرشادات للمرحلة القادمة:</h3><p style="white-space:pre-wrap;">${esc(item.recommendations)}</p>` : ''}

        <div style="margin-top:30px;display:flex;justify-content:space-between;border-top:1px dashed #94a3b8;padding-top:16px;">
          <div><b>الأخصائي المسؤول:</b> ${esc(item.specialistName || '_______________')}</div>
          <div><b>اعتماد الإدارة:</b> _______________</div>
        </div>
      </div>
    `;
    printItem({ html }, 'report', center?.logo, center?.name);
  }

  const filteredReports = reports.filter(r => {
    const matchSearch = !searchTerm || (r.studentName && r.studentName.includes(searchTerm)) || (r.title && r.title.includes(searchTerm));
    const matchStu = !selectedStudentFilter || r.stuId === selectedStudentFilter;
    return matchSearch && matchStu;
  });

  return (
    <div>
      {/* Types Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
          {REPORT_TYPES.map(type => (
            <button
              key={type.key}
              type="button"
              className={`tab ${activeType === type.key ? 'on' : ''}`}
              onClick={() => setActiveType(type.key)}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        <button type="button" className="btn btn-p" onClick={openNew}>
          ➕ إضافة {currentTypeConfig.label}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="prog-filter-bar">
        <input
          type="text"
          className="prog-search-input"
          placeholder="🔍 بحث باسم الطالب أو عنوان التقرير..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="prog-select-filter"
          value={selectedStudentFilter}
          onChange={e => setSelectedStudentFilter(e.target.value)}
        >
          <option value="">— تصفية بكل الطلاب —</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {(searchTerm || selectedStudentFilter) && (
          <button type="button" className="btn btn-sm btn-g" onClick={() => { setSearchTerm(''); setSelectedStudentFilter(''); }}>
            إلغاء التصفية ✖
          </button>
        )}
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={currentTypeConfig.icon}
          title={`لا توجد سجلات في ${currentTypeConfig.label} بعد`}
          sub="اضغط ➕ للبدء في توثيق تقرير جديد للطالب ومشاركته مع الأهل"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 14 }}>
          {filteredReports.map(item => (
            <div key={item.id} className="prog-item-card" style={{ gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div className="prog-student-name" style={{ fontSize: '1.02rem' }}>{item.title}</div>
                  <div className="prog-student-meta">
                    الطالب: <strong style={{ color: 'var(--text-main)' }}>{item.studentName}</strong> · {item.date}
                  </div>
                </div>
                {item.progressRate && (
                  <span className="bdg b-gr" style={{ fontWeight: 700, flexShrink: 0 }}>
                    نسبة الإنجاز: {item.progressRate}
                  </span>
                )}
              </div>

              {item.achievedGoals && (
                <div style={{ fontSize: '0.82rem', background: 'var(--ok-l)', padding: '6px 8px', borderRadius: 'var(--r3)', color: 'var(--ok)' }}>
                  <strong>الأهداف المنجزة:</strong> {item.achievedGoals}
                </div>
              )}

              {item.recommendations && (
                <div style={{ fontSize: '0.82rem', background: 'var(--g0)', padding: '6px 8px', borderRadius: 'var(--r3)', color: 'var(--text-sub)' }}>
                  <strong style={{ color: 'var(--text-main)' }}>التوصيات:</strong> {item.recommendations}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ color: 'var(--text-sub)' }}>الأخصائي: <strong style={{ color: 'var(--text-main)' }}>{item.specialistName || '—'}</strong></span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {item.parentPhone && (
                    <button
                      type="button"
                      className="btn btn-xs btn-s"
                      title="إرسال التقرير لولي الأمر عبر واتساب"
                      onClick={() => {
                        sendReportToWhatsApp({
                          parentPhone: item.parentPhone,
                          parentName: item.parentName,
                          studentName: item.studentName,
                          reportTitle: item.title,
                          reportType: currentTypeConfig.label,
                          date: item.date,
                          summary: `نسبة الإنجاز: ${item.progressRate || '—'}\nالأهداف المحققة: ${item.achievedGoals || '—'}\nالأهداف قيد التدريب: ${item.inProgressGoals || '—'}`,
                          recommendations: item.recommendations || item.notes,
                          specialistName: item.specialistName,
                          centerName: center?.name,
                        });
                      }}
                    >
                      💬 واتساب
                    </button>
                  )}
                  <button type="button" className="btn btn-xs btn-bl" title="طباعة" onClick={() => printReport(item)}>🖨️</button>
                  <button type="button" className="btn btn-xs btn-g" title="تعديل" onClick={() => openEdit(item)}>✏️</button>
                  <button type="button" className="btn btn-xs btn-d" title="حذف" onClick={() => del(item.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: REPORT FORM */}
      {modalOpen && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>{currentTypeConfig.icon} {editId ? `تعديل — ${currentTypeConfig.label}` : `إضافة جديد — ${currentTypeConfig.label}`}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <StudentPicker form={form} setForm={setForm} students={students} emps={emps} showExtra />
                <div className="fl">
                  <label>تاريخ التقرير <span className="req">*</span></label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/>
                </div>
                <div className="fl">
                  <label>نسبة تحقيق الأهداف المقدرة</label>
                  <select value={form.progressRate} onChange={e => setForm(f => ({ ...f, progressRate: e.target.value }))}>
                    <option value="100%">100% — إتقان كامل وممتاز</option>
                    <option value="80%">80% — تقدم ملحوظ جداً</option>
                    <option value="60%">60% — تقدم متوسط</option>
                    <option value="40%">40% — يحتاج تكثيف تدريب</option>
                    <option value="20%">20% — بداية الاستجابة</option>
                  </select>
                </div>
                <div className="fl full">
                  <label>عنوان التقرير <span className="req">*</span></label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="عنوان التقرير..."
                  />
                </div>
                <div className="fl full">
                  <label>الأهداف والمهارات التي تم إتقانها</label>
                  <textarea
                    value={form.achievedGoals}
                    onChange={e => setForm(f => ({ ...f, achievedGoals: e.target.value }))}
                    rows={2}
                    placeholder="الأهداف المحققة ونقاط التحسن..."
                  />
                </div>
                <div className="fl full">
                  <label>الأهداف قيد التدريب والتطوير</label>
                  <textarea
                    value={form.inProgressGoals}
                    onChange={e => setForm(f => ({ ...f, inProgressGoals: e.target.value }))}
                    rows={2}
                    placeholder="المهارات التي ما زال الطفل يتدرب عليها..."
                  />
                </div>
                <div className="fl full">
                  <label>التحديات والصعوبات الملاحظة</label>
                  <textarea
                    value={form.challenges}
                    onChange={e => setForm(f => ({ ...f, challenges: e.target.value }))}
                    rows={2}
                    placeholder="تشتت الانتباه، مقاومة بعض المهام..."
                  />
                </div>
                <div className="fl full">
                  <label>التوصيات والإرشادات المنزلية للأهل</label>
                  <textarea
                    value={form.recommendations}
                    onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                    rows={3}
                    placeholder="إرشادات واضحة للأسرة لتعزيز المهارات بالمنزل..."
                  />
                </div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={save}>💾 حفظ التقرير</button>
              <button type="button" className="btn btn-g" onClick={() => setModalOpen(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
