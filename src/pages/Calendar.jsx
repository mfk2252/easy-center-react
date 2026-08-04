import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../hooks/useStorage';
import { todayStr, uid, daysUntilDate, nextAnnualOccurrenceDate, nowTimeStr } from '../utils/dateHelpers';
import { SPECIALIST_ROLES } from '../utils/constants';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const EV_COLORS = [
  ['bl', 'أزرق', 'rgba(59, 130, 246, 0.1)', '#3b82f6'],
  ['gr', 'أخضر', 'rgba(16, 185, 129, 0.1)', '#10b981'],
  ['or', 'برتقالي', 'rgba(245, 158, 11, 0.1)', '#f59e0b'],
  ['rd', 'أحمر', 'rgba(239, 68, 68, 0.1)', '#ef4444'],
  ['pu', 'بنفسجي', 'rgba(139, 92, 246, 0.1)', '#8b5cf6']
];

const getColorStyles = (colorKey) => {
  const found = EV_COLORS.find(([c]) => c === colorKey);
  if (found) return { bg: found[2], text: found[3] };
  return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
};

const EMPTY_EV = { title: '', date: '', time: '', color: 'bl', type: 'event', notes: '' };
const EMPTY_STU_APPT = { stuId: '', type: 'تخاطب ونطق', date: '', time: '', duration: '45 دقيقة', mode: 'inperson', link: '', empId: '', notes: '' };
const EMPTY_STU_SESS = { stuId: '', type: 'تخاطب ونطق', date: '', time: '', duration: 45, empId: '', status: 'done', notes: '', goals: '', attachData: '', attachName: '' };
const SESS_TYPES = ['تخاطب ونطق', 'تعديل سلوك', 'علاج فيزيائي', 'علاج وظيفي', 'تكامل حسي', 'تعليمي وتربوي', 'مهارات اجتماعية', 'أخرى'];

function isEvalType(type) {
  const t = (type || '').toLowerCase();
  return t.includes('تقييم') || t.includes('evaluation');
}

function isCalendarNewStudent(st) {
  return st && st.status === 'waitlist';
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
    const col = isEvalType(a.type) ? 'or' : isCalendarNewStudent(st) ? 'pu' : 'gr';
    items.push({
      id: `ap-${a.id}`,
      source: isEvalType(a.type) ? 'تقييم' : 'موعد',
      date: a.date,
      time: a.time || '',
      title: `${st?.name || 'طالب'} — ${a.type || 'موعد'}${isCalendarNewStudent(st) ? ' ⭐' : ''}`,
      detail: [a.duration, a.mode === 'online' ? '🌐 أونلاين' : '', a.notes].filter(Boolean).join(' · '),
      color: col,
      raw: a,
      editable: false,
    });
  });

  lsGet('sessions').forEach(s => {
    if (!s.date) return;
    const st = stuMap[s.stuId];
    const emp = empMap[s.empId];
    const col = isCalendarNewStudent(st) ? 'pu' : s.status === 'done' ? 'gr' : 'bl';
    items.push({
      id: `se-${s.id}`,
      source: 'جلسة',
      date: s.date,
      time: s.time || '',
      title: `جلسة ${s.type || ''} — ${st?.name || 'طالب'}${isCalendarNewStudent(st) ? ' ⭐' : ''}`,
      detail: [emp?.name, s.status === 'done' ? '✅ منجزة' : '⏳ مجدولة', s.notes].filter(Boolean).join(' · '),
      color: col,
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
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_EV);
  const [showStuAppt, setShowStuAppt] = useState(false);
  const [stuApptForm, setStuApptForm] = useState(EMPTY_STU_APPT);
  const [showStuSess, setShowStuSess] = useState(false);
  const [stuSessForm, setStuSessForm] = useState(EMPTY_STU_SESS);
  const [showEval, setShowEval] = useState(false);
  const [evalForm, setEvalForm] = useState({ childName:'', parentName:'', diagnosis:'', date:'', time:'', notes:'' });
  const [selDay, setSelDay] = useState(null);
  const [selItem, setSelItem] = useState(null);

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
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
    if (!form.title || !form.title.trim() || !form.date) {
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
  const fldA = k => e => setStuApptForm(f => ({ ...f, [k]: e.target.value }));
  const fldS = k => e => setStuSessForm(f => ({ ...f, [k]: e.target.value }));
  const specialists = emps.filter(e => SPECIALIST_ROLES.includes(e.role));
  const today = todayStr();

  function openStuAppt(d = null) {
    setStuApptForm({ ...EMPTY_STU_APPT, date: d ? dateStr(d) : todayStr(), time: nowTimeStr() });
    setShowStuAppt(true);
  }

  function saveStuAppt() {
    if (!stuApptForm.stuId || !stuApptForm.date || !stuApptForm.time) {
      toast('⚠️ اختر الطالب والتاريخ والوقت', 'er');
      return;
    }
    lsAdd('appointments', { ...stuApptForm, id: uid() });
    toast('✅ تم تسجيل الموعد', 'ok');
    setShowStuAppt(false);
    reload();
  }

  function openStuSess(d = null) {
    setStuSessForm({ ...EMPTY_STU_SESS, date: d ? dateStr(d) : todayStr(), time: nowTimeStr() });
    setShowStuSess(true);
  }

  function sessAttach(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setStuSessForm(fm => ({ ...fm, attachData: ev.target.result, attachName: f.name }));
    r.readAsDataURL(f);
    e.target.value = '';
  }

  function saveStuSess() {
    if (!stuSessForm.stuId || !stuSessForm.date) {
      toast('⚠️ اختر الطالب والتاريخ', 'er');
      return;
    }
    lsAdd('sessions', {
      id: uid(),
      stuId: stuSessForm.stuId,
      type: stuSessForm.type,
      date: stuSessForm.date,
      time: stuSessForm.time,
      duration: Number(stuSessForm.duration) || 45,
      empId: stuSessForm.empId,
      status: stuSessForm.status,
      notes: stuSessForm.notes,
      goals: stuSessForm.goals || '',
      attachmentData: stuSessForm.attachData || '',
      attachmentName: stuSessForm.attachName || '',
    });
    toast('✅ تم تسجيل الجلسة', 'ok');
    setShowStuSess(false);
    reload();
  }

  const selDateStr = selDay ? dateStr(selDay) : null;
  const dayItems = selDay ? itemsOnDay(selDay) : [];

  function openEval(d = null) {
    setEvalForm({ childName:'', parentName:'', diagnosis:'', date: d ? dateStr(d) : todayStr(), time:'', notes:'' });
    setShowEval(true);
  }

  function saveEval() {
    if (!evalForm.childName || !evalForm.childName.trim() || !evalForm.date || !evalForm.time) {
      toast('⚠️ أدخل اسم الطفل والموعد والساعة', 'er'); return;
    }
    lsAdd('evaluations', { ...evalForm, id: uid() });
    lsAdd('manualAlerts', {
      id: uid(),
      title: `📋 تذكير: تسجيل بيانات ${evalForm.childName} كاملة`,
      details: `لديه موعد تقييم بتاريخ ${evalForm.date} الساعة ${evalForm.time} — يُنصح بتسجيل بياناته كطالب عند حضور الموعد`,
      date: evalForm.date,
      time: evalForm.time,
      severity: 'warn',
    });
    toast('✅ تم تسجيل موعد التقييم وإضافة تنبيه ذكي', 'ok');
    setShowEval(false);
    reload();
  }
  const fldEv = k => e => setEvalForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    setSelItem(null);
  }, [selDay]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '12px 16px', fontFamily: 'inherit' }}>
      
      {/* 1. Header العصري المدمج والمعدل بالكامل لطلبك */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
        background: 'var(--bg-card)',
        padding: '12px 20px',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          {/* تم جعل العنوان الكبير هو الشهر الحالي مع السنة بدلاً من الكلمة السابقة */}
          <h2 style={{ fontSize: '1.6rem', fontWeight: 850, margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
            <span>🗓️</span> {MONTHS_AR[month]} {year}
          </h2>
          {/* النص الرفيع بالأسفل */}
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-sub)', opacity: 0.85, fontWeight: 'normal' }}>
            التقويم الأكاديمي — متابعة الجلسات والأحداث اليومية
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* التحكم بالتنقل - مظهر الأزرار المحدث */}
          <div style={{ display: 'flex', background: 'var(--g0)', padding: 4, borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <button 
              type="button" 
              className="btn btn-sm" 
              style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '4px 10px', color: 'var(--text)', fontWeight: 'bold' }} 
              onClick={() => setCur(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
            >
              → السابق
            </button>
            <button 
              type="button" 
              className="btn btn-sm" 
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 12px', fontWeight: 'bold', color: 'var(--text)' }} 
              onClick={() => setCur(new Date())}
            >
              اليوم
            </button>
            <button 
              type="button" 
              className="btn btn-sm" 
              style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '4px 10px', color: 'var(--text)', fontWeight: 'bold' }} 
              onClick={() => setCur(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
            >
              التالي ←
            </button>
          </div>

          {/* أزرار الإضافة السريعة */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-p btn-sm" style={{ borderRadius: 8, padding: '6px 12px' }} onClick={() => openForm()}>
              ➕ حدث عام
            </button>
            <button type="button" className="btn btn-s btn-sm" style={{ borderRadius: 8, padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)' }} onClick={() => openStuAppt()}>
              📅 موعد طالب
            </button>
            <button type="button" className="btn btn-s btn-sm" style={{ borderRadius: 8, padding: '6px 12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.15)' }} onClick={() => openStuSess()}>
              🩺 جلسة علاجية
            </button>
            <button type="button" className="btn btn-sm" style={{ borderRadius: 8, padding: '6px 12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.15)' }} onClick={() => openEval()}>
              📋 تقييم جديد
            </button>
          </div>
        </div>
      </div>

      {/* 2. شبكة التقويم المعدلة بالكامل لحل مشكلة التباين واللون الداكن */}
      <div className="wg" style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
        <div className="wg-b" style={{ padding: 10, background: 'var(--bg-card)' }}>
          
          {/* أيام الأسبوع (تم تصحيح اللون ليكون أبيض ناصع/واضح تماماً بالثيم الداكن) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
            {DAYS_AR.map(d => (
              <div 
                key={d} 
                style={{ 
                  textAlign: 'center', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold', 
                  color: 'var(--text)', // يعتمد على لون النص الرئيسي للثيم وليس الخافت
                  padding: '8px 0', 
                  borderBottom: '1px solid var(--border-color)',
                  opacity: 0.95
                }}
              >
                {d}
              </div>
            ))}
          </div>
          
          {/* خلايا الأيام */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} style={{ minHeight: '72px', background: 'var(--g0)', borderRadius: 10, opacity: 0.15 }} />;
              const ds = dateStr(d);
              const row = itemsOnDay(d);
              const isToday = ds === today;
              const isSel = d === selDay;

              let cellBg = 'var(--bg-card)';
              let borderStyle = '1px solid var(--border-color)';
              let textWeight = '700';
              let numColor = 'var(--text)';

              if (isToday) {
                cellBg = 'rgba(59, 130, 246, 0.08)';
                borderStyle = '1.5px solid var(--pr)';
                textWeight = '800';
              } else if (isSel) {
                cellBg = 'var(--pr-l)';
                borderStyle = '1px solid var(--pr)';
                textWeight = '800';
              }

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setSelDay(d === selDay ? null : d);
                    setSelItem(null);
                  }}
                  style={{
                    minHeight: '72px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'stretch',
                    border: borderStyle,
                    borderRadius: 10,
                    padding: '6px 7px 8px',
                    background: cellBg,
                    cursor: 'pointer',
                    textAlign: 'right',
                    position: 'relative',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: isToday || isSel ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = isToday || isSel ? '0 2px 8px rgba(0,0,0,0.04)' : 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 4 }}>
                    <span style={{ 
                      fontSize: '0.82rem', 
                      fontWeight: textWeight, 
                      color: numColor,
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: isToday ? 'rgba(59, 130, 246, 0.12)' : 'transparent'
                    }}>
                      {d}
                    </span>
                    {row.length > 0 && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--pr)' }}>
                        •
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {row.slice(0, 3).map(it => (
                      <span 
                        key={it.id} 
                        style={{ 
                          width: 7, 
                          height: 7, 
                          borderRadius: '50%', 
                          background: getColorStyles(it.color).text,
                          display: 'inline-block',
                          flexShrink: 0
                        }} 
                        title={it.title}
                      />
                    ))}
                    {row.length > 3 && (
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-sub)' }}>+{row.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. الأجندة اليومية الذكية عند تحديد يوم معين */}
      {selDay && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 16, 
          marginTop: 16,
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* قائمة المهام والأحداث */}
          <div className="wg" style={{ border: '1px solid var(--border-color)', borderRadius: 12 }}>
            <div className="wg-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', padding: '12px 16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
                📅 جدول يوم {selDay} {MONTHS_AR[month]}
              </h3>
              <div style={{ display: 'flex', gap: 4 }}>
                <button type="button" className="btn btn-p btn-sm" onClick={() => openForm(selDay)} style={{ borderRadius: 6 }}>➕ عام</button>
                <button type="button" className="btn btn-s btn-sm" onClick={() => openStuAppt(selDay)} style={{ borderRadius: 6 }}>📅 موعد</button>
              </div>
            </div>
            
            <div className="wg-b" style={{ padding: 14, maxHeight: 320, overflowY: 'auto' }}>
              {dayItems.length === 0 ? (
                <div style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '22px 0' }}>
                  <p style={{ fontSize: '1.3rem', margin: 0 }}>☕</p>
                  <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>لا توجد عناصر مجدولة اليوم.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dayItems.map(it => {
                    const colorTheme = getColorStyles(it.color);
                    const isSelected = selItem?.id === it.id;
                    return (
                      <button
                        type="button"
                        key={it.id}
                        onClick={() => setSelItem(it)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'right',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: isSelected ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--pr-l)' : 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                          <span style={{ 
                            fontSize: '0.64rem', 
                            padding: '2px 6px', 
                            borderRadius: 4, 
                            background: colorTheme.bg, 
                            color: colorTheme.text,
                            fontWeight: 'bold'
                          }}>
                            {it.source}
                          </span>
                          {it.time && <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>🕐 {it.time}</span>}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)' }}>{it.title}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* معاينة التفاصيل بالكامل */}
          <div className="wg" style={{ border: '1px solid var(--border-color)', borderRadius: 12 }}>
            <div className="wg-h" style={{ borderBottom: '1px solid var(--border-color)', padding: '12px 16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>📌 بطاقة التفاصيل</h3>
            </div>
            <div className="wg-b" style={{ padding: 16 }}>
              {selItem ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6, background: 'var(--g0)', color: 'var(--text)', fontWeight: 'bold' }}>
                      المصدر: {selItem.source}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6, background: 'var(--g0)', color: 'var(--text)', fontWeight: 'bold' }}>
                      التاريخ: {selItem.date}
                    </span>
                  </div>

                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                    {selItem.title}
                  </h4>

                  {selItem.time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--g0)', padding: '8px 12px', borderRadius: 8 }}>
                      <span style={{ fontSize: '1rem' }}>🕒</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text)' }}>{selItem.time}</div>
                    </div>
                  )}

                  {selItem.detail && (
                    <div style={{ background: 'var(--g0)', padding: 12, borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text)' }}>
                      {selItem.detail}
                    </div>
                  )}

                  {selItem.editable && selItem.raw?.id && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                      <button type="button" className="btn btn-g btn-sm" style={{ flex: 1, borderRadius: 6 }} onClick={() => { setForm({ ...selItem.raw }); setEditId(selItem.raw.id); setShowForm(true); }}>
                        ✏️ تعديل
                      </button>
                      <button type="button" className="btn btn-d btn-sm" style={{ flex: 1, borderRadius: 6 }} onClick={() => del(selItem.raw.id)}>
                        🗑️ حذف
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-sub)' }}>
                  <span style={{ fontSize: '2rem' }}>🎯</span>
                  <p style={{ fontSize: '0.8rem', marginTop: 8 }}>اضغط على أي عنصر في الأجندة لعرض تفاصيله الكاملة هنا.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS SECTION ================= */}

      {/* 1. إضافة وتعديل حدث عام */}
      {showForm && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="mb mb-sm" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, background: 'var(--pr)' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>{editId ? '✏️ تعديل الحدث' : '➕ إضافة حدث جديد'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>عنوان الحدث <span className="req">*</span></label>
                  <input value={form.title} onChange={fld('title')} placeholder="اكتب اسم النشاط أو الحدث..." autoFocus />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>التاريخ <span className="req">*</span></label>
                  <input type="date" value={form.date} onChange={fld('date')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الوقت</label>
                  <input type="time" value={form.time} onChange={fld('time')} />
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700, marginBottom: 6 }}>تصنيف اللون</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {EV_COLORS.map(([c, l, bg, text]) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setForm(f => ({ ...f, color: c }))}
                        style={{
                          padding: '4px 10px',
                          cursor: 'pointer',
                          background: bg,
                          color: text,
                          border: form.color === c ? `2px solid ${text}` : '2px solid transparent',
                          borderRadius: 6,
                          font: 'inherit',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>ملاحظات وتفاصيل</label>
                  <textarea value={form.notes} onChange={fld('notes')} rows={3} placeholder="أي معلومات أو تفاصيل مهمة..." />
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '12px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={save}>💾 حفظ</button>
              <button type="button" className="btn btn-g" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. موعد طالب جديد */}
      {showStuAppt && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowStuAppt(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>📅 تسجيل موعد مرتبط بطالب</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>اختر الطالب <span className="req">*</span></label>
                  <select value={stuApptForm.stuId} onChange={fldA('stuId')}>
                    <option value="">— ابحث باسم الطالب —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.status === 'waitlist' ? ' ⏱️ (قائمة انتظار)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>مجال أو نوع الموعد <span className="req">*</span></label>
                  <select value={stuApptForm.type} onChange={fldA('type')}>
                    {SESS_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>تاريخ الجلسة / الموعد <span className="req">*</span></label>
                  <input type="date" value={stuApptForm.date} onChange={fldA('date')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>ساعة البدء <span className="req">*</span></label>
                  <input type="time" value={stuApptForm.time} onChange={fldA('time')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الأخصائي المسؤول</label>
                  <select value={stuApptForm.empId} onChange={fldA('empId')}>
                    <option value="">— حدد الأخصائي —</option>
                    {specialists.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>المدة</label>
                  <select value={stuApptForm.duration} onChange={fldA('duration')}>
                    <option>30 دقيقة</option>
                    <option>45 دقيقة</option>
                    <option>60 دقيقة</option>
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الحضور</label>
                  <select value={stuApptForm.mode} onChange={fldA('mode')}>
                    <option value="inperson">حضوري بالمركز</option>
                    <option value="online">أونلاين (عن بعد)</option>
                  </select>
                </div>
                {stuApptForm.mode === 'online' && (
                  <div className="fl full">
                    <label style={{ fontWeight: 700 }}>رابط الغرفة الافتراضية</label>
                    <input type="url" value={stuApptForm.link} onChange={fldA('link')} placeholder="https://..." />
                  </div>
                )}
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>ملاحظات</label>
                  <textarea value={stuApptForm.notes} onChange={fldA('notes')} rows={2} />
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '12px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={saveStuAppt}>💾 حفظ الموعد</button>
              <button type="button" className="btn btn-g" onClick={() => setShowStuAppt(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. تسجيل جلسة جديدة */}
      {showStuSess && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowStuSess(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>🩺 تسجيل جلسة علاجية وتوثيقها</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>الطالب <span className="req">*</span></label>
                  <select value={stuSessForm.stuId} onChange={fldS('stuId')}>
                    <option value="">— اختر الطالب —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.status === 'waitlist' ? ' (انتظار)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>النوع</label>
                  <select value={stuSessForm.type} onChange={fldS('type')}>
                    {SESS_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>التاريخ <span className="req">*</span></label>
                  <input type="date" value={stuSessForm.date} onChange={fldS('date')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الوقت</label>
                  <input type="time" value={stuSessForm.time} onChange={fldS('time')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الأخصائي المنفذ</label>
                  <select value={stuSessForm.empId} onChange={fldS('empId')}>
                    <option value="">— حدد الأخصائي —</option>
                    {specialists.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>المدة الفعالة (دقائق)</label>
                  <input type="number" min={15} value={stuSessForm.duration} onChange={fldS('duration')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الحالة</label>
                  <select value={stuSessForm.status} onChange={fldS('status')}>
                    <option value="done">✅ تم إنجازها</option>
                    <option value="scheduled">⏳ مجدولة</option>
                  </select>
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>المخرجات والملاحظات السلوكية</label>
                  <textarea value={stuSessForm.notes} onChange={fldS('notes')} rows={2} />
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700, marginBottom: 6 }}>تحميل وثيقة/ملف</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--g0)', padding: 10, borderRadius: 8, border: '1px dashed var(--border-color)' }}>
                    <input type="file" accept="image/*,.pdf" onChange={sessAttach} style={{ border: 'none', background: 'transparent', padding: 0 }} />
                    {stuSessForm.attachName && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--pr)' }}>
                        📎 {stuSessForm.attachName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '12px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={saveStuSess}>💾 حفظ الجلسة</button>
              <button type="button" className="btn btn-g" onClick={() => setShowStuSess(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. تسجيل تقييم لحالة جديدة */}
      {showEval && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowEval(false)}>
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, background: 'var(--or)' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>📋 تقييم مستفيد جديد</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>اسم الطفل المستهدف <span className="req">*</span></label>
                  <input value={evalForm.childName} onChange={fldEv('childName')} placeholder="الاسم ثلاثي..." />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>اسم ولي الأمر</label>
                  <input value={evalForm.parentName} onChange={fldEv('parentName')} />
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>التشخيص الأولي / الغرض من التقييم</label>
                  <input value={evalForm.diagnosis} onChange={fldEv('diagnosis')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>تاريخ الحضور <span className="req">*</span></label>
                  <input type="date" value={evalForm.date} onChange={fldEv('date')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>توقيت المقابلة <span className="req">*</span></label>
                  <input type="time" value={evalForm.time} onChange={fldEv('time')} />
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>ملاحظات أولية</label>
                  <textarea value={evalForm.notes} onChange={fldEv('notes')} rows={3} />
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '12px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" style={{ background: 'var(--or)', borderColor: 'var(--or)' }} onClick={saveEval}>💾 تسجيل موعد التقييم</button>
              <button type="button" className="btn btn-g" onClick={() => setShowEval(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
