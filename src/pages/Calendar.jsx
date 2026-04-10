import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../hooks/useStorage';
import { todayStr, uid, daysUntilDate, nextAnnualOccurrenceDate } from '../utils/dateHelpers';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const EV_COLORS = [
  ['bl', 'أزرق'],
  ['gr', 'أخضر'],
  ['or', 'برتقالي'],
  ['rd', 'أحمر'],
];
const EMPTY_EV = { title: '', date: '', time: '', color: 'bl', type: 'event', notes: '' };

function isEvalType(type) {
  const t = (type || '').toLowerCase();
  return t.includes('تقييم') || t.includes('evaluation');
}

function buildCalendarItems() {
  const students = lsGet('students');
  const emps = lsGet('employees');
  const stuMap = Object.fromEntries(students.map(s => [s.id, s]));
  const empMap = Object.fromEntries(emps.map(e => [e.id, e]));
  const items = [];

  lsGet('calEvents').forEach(e => {
    items.push({
      id: `ce-${e.id}`,
      source: 'تقويم',
      date: e.date,
      time: e.time || '',
      title: e.title,
      detail: e.notes || '',
      color: e.color || 'bl',
      raw: e,
      editable: true,
    });
  });

  lsGet('appointments').forEach(a => {
    const st = stuMap[a.stuId];
    items.push({
      id: `ap-${a.id}`,
      source: isEvalType(a.type) ? 'تقييم' : 'موعد',
      date: a.date,
      time: a.time || '',
      title: `${st?.name || 'طالب'} — ${a.type || 'موعد'}`,
      detail: [a.duration, a.mode === 'online' ? '🌐 أونلاين' : '', a.notes].filter(Boolean).join(' · '),
      color: isEvalType(a.type) ? 'or' : 'gr',
      raw: a,
      editable: false,
    });
  });

  lsGet('sessions').forEach(s => {
    if (!s.date) return;
    const st = stuMap[s.stuId];
    const emp = empMap[s.empId];
    items.push({
      id: `se-${s.id}`,
      source: 'جلسة',
      date: s.date,
      time: s.time || '',
      title: `جلسة ${s.type || ''} — ${st?.name || 'طالب'}`,
      detail: [emp?.name, s.status === 'done' ? '✅ منجزة' : '⏳ مجدولة', s.notes].filter(Boolean).join(' · '),
      color: s.status === 'done' ? 'gr' : 'bl',
      raw: s,
      editable: false,
    });
  });

  lsGet('manualAlerts').forEach(m => {
    if (!m.date) return;
    items.push({
      id: `ma-${m.id}`,
      source: 'تنبيه يدوي',
      date: m.date,
      time: m.time || '',
      title: m.title || 'تنبيه',
      detail: m.details || '',
      color: m.severity === 'urgent' ? 'rd' : m.severity === 'warn' ? 'or' : 'bl',
      raw: m,
      editable: false,
    });
  });

  lsGet('centerActivities').forEach(act => {
    if (!act.date) return;
    items.push({
      id: `act-${act.id}`,
      source: 'فعالية',
      date: act.date,
      time: '',
      title: act.name || 'نشاط',
      detail: [act.year && `العام ${act.year}`, act.notes].filter(Boolean).join(' · '),
      color: 'or',
      raw: act,
      editable: false,
    });
  });

  lsGet('iepGoals').forEach(g => {
    if (!g.review) return;
    const st = stuMap[g.stuId];
    items.push({
      id: `iep-${g.id}`,
      source: 'مراجعة IEP',
      date: g.review,
      time: '',
      title: `مراجعة هدف — ${st?.name || 'طالب'}`,
      detail: `${g.domain || ''} — ${g.goal || ''}`,
      color: 'rd',
      raw: g,
      editable: false,
    });
  });

  students.forEach(s => {
    if (!s.dob) return;
    const nd = nextAnnualOccurrenceDate(s.dob);
    const d = daysUntilDate(nd);
    if (d == null || d < 0 || d > 14) return;
    const iso = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`;
    items.push({
      id: `bd-s-${s.id}`,
      source: 'عيد ميلاد',
      date: iso,
      time: '',
      title: `🎂 ${s.name} (طالب)`,
      detail: d === 0 ? 'اليوم' : d === 1 ? 'غداً' : `خلال ${d} يوم`,
      color: 'gr',
      raw: s,
      editable: false,
    });
  });

  emps.forEach(e => {
    if (!e.dob) return;
    const nd = nextAnnualOccurrenceDate(e.dob);
    const d = daysUntilDate(nd);
    if (d == null || d < 0 || d > 14) return;
    const iso = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`;
    items.push({
      id: `bd-e-${e.id}`,
      source: 'عيد ميلاد',
      date: iso,
      time: '',
      title: `🎂 ${e.name} (موظف)`,
      detail: d === 0 ? 'اليوم' : d === 1 ? 'غداً' : `خلال ${d} يوم`,
      color: 'gr',
      raw: e,
      editable: false,
    });
  });

  return items;
}

export default function Calendar() {
  const { toast, activeView } = useApp();
  const [cur, setCur] = useState(new Date());
  const [allItems, setAllItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_EV);
  const [selDay, setSelDay] = useState(null);
  const [selItem, setSelItem] = useState(null);

  function reload() {
    setAllItems(buildCalendarItems());
  }

  useEffect(() => {
    reload();
  }, [activeView]);

  const year = cur.getFullYear();
  const month = cur.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(d) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function itemsOnDay(d) {
    const ds = dateStr(d);
    return allItems.filter(it => it.date === ds).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }

  function openForm(d = null) {
    setForm({ ...EMPTY_EV, date: d ? dateStr(d) : todayStr() });
    setEditId(null);
    setShowForm(true);
  }
  function save() {
    if (!form.title.trim() || !form.date) {
      toast('⚠️ أدخل العنوان والتاريخ', 'er');
      return;
    }
    if (editId) {
      lsUpd('calEvents', editId, form);
      toast('✅ تم التحديث', 'ok');
    } else {
      lsAdd('calEvents', { ...form, id: uid() });
      toast('✅ تم إضافة الحدث', 'ok');
    }
    setShowForm(false);
    reload();
  }
  function del(id) {
    lsDel('calEvents', id);
    reload();
    toast('🗑️ تم الحذف', 'ok');
    setSelItem(null);
  }
  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const today = todayStr();

  const selDateStr = selDay ? dateStr(selDay) : null;
  const dayItems = selDay ? itemsOnDay(selDay) : [];

  useEffect(() => {
    setSelItem(null);
  }, [selDay]);

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>🗓️ التقويم</h2>
          <p>
            {MONTHS_AR[month]} {year} — جميع المواعيد والجلسات والتنبيهات
          </p>
        </div>
        <div className="ph-a">
          <button type="button" className="btn btn-g btn-sm" onClick={() => setCur(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}>
            → السابق
          </button>
          <button type="button" className="btn btn-p btn-sm" onClick={() => setCur(new Date())}>
            اليوم
          </button>
          <button type="button" className="btn btn-g btn-sm" onClick={() => setCur(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}>
            التالي ←
          </button>
          <button type="button" className="btn btn-p" onClick={() => openForm()}>
            ➕ حدث
          </button>
        </div>
      </div>

      <div className="wg">
        <div className="wg-b" style={{ padding: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DAYS_AR.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '.75rem', fontWeight: 900, color: 'var(--text-sub)', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} style={{ minHeight: 70, background: 'var(--g0)', borderRadius: 'var(--r3)', opacity: 0.4 }} />;
              const ds = dateStr(d);
              const row = itemsOnDay(d);
              const isToday = ds === today;
              const isSel = d === selDay;
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setSelDay(d === selDay ? null : d);
                    setSelItem(null);
                  }}
                  style={{
                    minHeight: 70,
                    border: `${isToday ? '2px' : '1px'} solid ${isToday ? 'var(--pr)' : isSel ? 'var(--pr)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--r3)',
                    padding: 5,
                    background: isSel ? 'var(--pr-l)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all .15s',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ fontSize: '.8rem', fontWeight: isToday ? 900 : 700, color: isToday ? 'var(--pr)' : 'var(--text-sub)', marginBottom: 3 }}>{d}</div>
                  {row.slice(0, 3).map(it => (
                    <div key={it.id} className={`cal-ev ${it.color || 'bl'}`} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.title}
                    </div>
                  ))}
                  {row.length > 3 && <div style={{ fontSize: '.65rem', color: 'var(--g4)' }}>+{row.length - 3}</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selDay && (
        <div className="wg">
          <div className="wg-h">
            <h3>
              📅 {selDay} {MONTHS_AR[month]} {year}
            </h3>
            <button type="button" className="btn btn-p btn-sm" onClick={() => openForm(selDay)}>
              ➕ إضافة للتقويم
            </button>
          </div>
          <div className="wg-b">
            {dayItems.length === 0 ? (
              <div style={{ color: 'var(--g4)', textAlign: 'center', padding: '12px 0', fontSize: '.84rem' }}>لا توجد أحداث في هذا اليوم</div>
            ) : (
              dayItems.map(it => (
                <button
                  type="button"
                  key={it.id}
                  onClick={() => setSelItem(it)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'right',
                    marginBottom: 8,
                    padding: '10px 12px',
                    borderRadius: 'var(--r2)',
                    border: selItem?.id === it.id ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                    background: selItem?.id === it.id ? 'var(--pr-l)' : 'var(--g0)',
                    cursor: 'pointer',
                    font: 'inherit',
                  }}
                >
                  <div style={{ fontSize: '.72rem', color: 'var(--g5)', marginBottom: 4 }}>{it.source}</div>
                  <div style={{ fontWeight: 800, fontSize: '.88rem' }}>{it.title}</div>
                  {(it.time || it.detail) && (
                    <div style={{ fontSize: '.78rem', color: 'var(--g4)', marginTop: 4 }}>
                      {it.time && `🕐 ${it.time}`}
                      {it.time && it.detail ? ' · ' : ''}
                      {it.detail}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selItem && (
        <div className="wg" style={{ marginTop: 12 }}>
          <div className="wg-h">
            <h3>📌 تفاصيل الحدث</h3>
          </div>
          <div className="wg-b" style={{ fontSize: '.9rem', lineHeight: 1.7 }}>
            <div>
              <b>المصدر:</b> {selItem.source}
            </div>
            <div>
              <b>التاريخ:</b> {selItem.date}
            </div>
            {selItem.time && (
              <div>
                <b>الوقت:</b> {selItem.time}
              </div>
            )}
            <div>
              <b>العنوان:</b> {selItem.title}
            </div>
            {selItem.detail && (
              <div style={{ marginTop: 8 }}>
                <b>التفاصيل:</b> {selItem.detail}
              </div>
            )}
            {selItem.editable && selItem.raw?.id && (
              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-g btn-sm" onClick={() => { setForm({ ...selItem.raw }); setEditId(selItem.raw.id); setShowForm(true); }}>
                  ✏️ تعديل
                </button>
                <button type="button" className="btn btn-d btn-sm" onClick={() => del(selItem.raw.id)}>
                  🗑️ حذف من التقويم
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="mb mb-sm" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
              <h2>{editId ? '✏️ تعديل الحدث' : '➕ حدث جديد'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label>
                    عنوان الحدث <span className="req">*</span>
                  </label>
                  <input value={form.title} onChange={fld('title')} placeholder="اسم الحدث..." autoFocus />
                </div>
                <div className="fl">
                  <label>
                    التاريخ <span className="req">*</span>
                  </label>
                  <input type="date" value={form.date} onChange={fld('date')} />
                </div>
                <div className="fl">
                  <label>الوقت</label>
                  <input type="time" value={form.time} onChange={fld('time')} />
                </div>
                <div className="fl full">
                  <label>اللون</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    {EV_COLORS.map(([c, l]) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`cal-ev ${c}`}
                        style={{
                          padding: '4px 10px',
                          cursor: 'pointer',
                          border: form.color === c ? '2px solid var(--g8)' : '2px solid transparent',
                          borderRadius: 6,
                          font: 'inherit',
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="fl full">
                  <label>ملاحظات</label>
                  <textarea value={form.notes} onChange={fld('notes')} rows={2} />
                </div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={save}>
                💾 حفظ
              </button>
              <button type="button" className="btn btn-g" onClick={() => setShowForm(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
