import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet } from '../../hooks/useStorage';
import { ROLES } from '../../utils/constants';

function roleLabel(r) { return ROLES[r] || r || '—'; }

export default function GlobalSearch() {
  const { searchOpen, setSearchOpen, go } = useApp();
  const [q, setQ] = useState('');
  const inputRef = useRef();

  useEffect(() => { if (searchOpen && inputRef.current) { setQ(''); inputRef.current.focus(); } }, [searchOpen]);

  if (!searchOpen) return null;

  const ql = q.toLowerCase().trim();
  let sections = [];

  if (ql.length > 0) {
    const students = lsGet('students').filter(s =>
      (s.name||'').toLowerCase().includes(ql) ||
      (s.diagnosis||'').includes(q) ||
      (s.parentName||'').toLowerCase().includes(ql) ||
      (s.parentPhone||'').includes(q)
    ).slice(0, 6);

    const emps = lsGet('employees').filter(e =>
      (e.name||'').toLowerCase().includes(ql) ||
      (e.phone||'').includes(q) ||
      (roleLabel(e.role)||'').includes(q)
    ).slice(0, 5);

    const parents = lsGet('students').filter(s =>
      (s.parentName||'').toLowerCase().includes(ql) ||
      (s.parentPhone||'').includes(q)
    ).slice(0, 4);

    const sessions = lsGet('sessions').filter(s => {
      const stus = lsGet('students');
      const stu = stus.find(x => x.id === s.stuId);
      return (stu?.name||'').toLowerCase().includes(ql) || (s.type||'').includes(q);
    }).slice(0, 4);

    if (students.length) sections.push({ label: `👦 الطلاب (${students.length})`, items: students, type: 'student' });
    if (emps.length) sections.push({ label: `👥 الموظفون (${emps.length})`, items: emps, type: 'emp' });
    if (parents.length) sections.push({ label: `👨‍👩‍👦 أولياء الأمور`, items: parents, type: 'parent' });
    if (sessions.length) sections.push({ label: `🩺 الجلسات`, items: sessions, type: 'session' });
  }

  function handleItemClick(type, item) {
    setSearchOpen(false);
    if (type === 'student') { go('students'); }
    else if (type === 'emp') { go('hr'); }
    else if (type === 'parent') { go('center'); }
    else if (type === 'session') { go('students'); }
  }

  function renderItem(type, item) {
    const stus = lsGet('students');
    if (type === 'student') {
      const wa = item.parentPhone ? item.parentPhone.replace(/[^0-9+]/g,'').replace(/^0/,'966') : '';
      return (
        <div key={item.id} className="gsrch-item" onClick={() => handleItemClick(type, item)}>
          <div className="gi-icon" style={{background:'var(--pr-l)'}}>
            {item.photo ? <img src={item.photo} style={{width:34,height:34,objectFit:'cover'}}/> : (item.name||'?').slice(0,2)}
          </div>
          <div style={{flex:1}}>
            <div className="gi-main">{item.name}</div>
            <div className="gi-sub">{item.diagnosis || '—'} · {item.parentName || '—'}</div>
          </div>
          {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl" onClick={e=>e.stopPropagation()}>💬</a>}
        </div>
      );
    }
    if (type === 'emp') {
      const wa = item.phone ? item.phone.replace(/[^0-9+]/g,'').replace(/^0/,'966') : '';
      return (
        <div key={item.id} className="gsrch-item" onClick={() => handleItemClick(type, item)}>
          <div className="gi-icon" style={{background:'var(--pur-l)'}}>
            {item.photo ? <img src={item.photo} style={{width:34,height:34,objectFit:'cover'}}/> : (item.name||'?').slice(0,2)}
          </div>
          <div style={{flex:1}}>
            <div className="gi-main">{item.name}</div>
            <div className="gi-sub">{roleLabel(item.role)} · {item.phone || '—'}</div>
          </div>
          {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl" onClick={e=>e.stopPropagation()}>💬</a>}
        </div>
      );
    }
    if (type === 'parent') {
      return (
        <div key={item.id} className="gsrch-item" onClick={() => handleItemClick(type, item)}>
          <div className="gi-icon" style={{background:'var(--warn-l)'}}>👨‍👩‍👦</div>
          <div style={{flex:1}}>
            <div className="gi-main">{item.parentName || '—'}</div>
            <div className="gi-sub">ولي أمر {item.name} · {item.parentPhone || '—'}</div>
          </div>
        </div>
      );
    }
    if (type === 'session') {
      const stu = stus.find(x => x.id === item.stuId);
      return (
        <div key={item.id} className="gsrch-item" onClick={() => handleItemClick(type, item)}>
          <div className="gi-icon" style={{background:'var(--ok-l)'}}>🩺</div>
          <div>
            <div className="gi-main">{stu?.name || '—'} — {item.type || 'جلسة'}</div>
            <div className="gi-sub">{item.date || '—'}</div>
          </div>
        </div>
      );
    }
  }

  const noResults = ql.length > 0 && sections.length === 0;

  return (
    <div className="gsrch-overlay" onClick={e => { if(e.target === e.currentTarget) setSearchOpen(false); }}>
      <div className="gsrch-box">
        <div className="gsrch-hd">
          <span style={{fontSize:'1.15rem',flexShrink:0}}>🔍</span>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث عن موظف، طالب، ولي أمر، جلسة..."/>
          <button onClick={()=>setSearchOpen(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1rem',color:'var(--g4)',padding:'4px 8px'}}>✕</button>
        </div>
        <div className="gsrch-results">
          {!ql && <div className="gsrch-empty">اضغط Ctrl+K في أي وقت لفتح البحث — أو ابدأ الكتابة…</div>}
          {noResults && <div className="gsrch-empty">🔍 لا توجد نتائج لـ "<b>{q}</b>"</div>}
          {sections.map(sec => (
            <div key={sec.label}>
              <div className="gsrch-sec">{sec.label}</div>
              {sec.items.map(item => renderItem(sec.type, item))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
