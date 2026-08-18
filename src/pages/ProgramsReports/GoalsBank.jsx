import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { PROGRAMS, DOMAINS, SEED_GOALS, programLabel, programColor, domainLabel, domainsForProgram } from '../../utils/goalsBank';
import { ALL_PORTAGE_GOALS } from '../../data/portageGoals';

export function getAllGoals() {
  const custom = lsGet('progGoalsBank') || [];
  const seeds = SEED_GOALS.map((g, i) => ({ ...g, id: `seed-${i}`, isSeed: true }));
  const portageMasterGoals = (ALL_PORTAGE_GOALS || []).map((g) => ({
    id: g.id,
    program: g.program,
    domain: g.domain,
    text: g.text || g.title,
    goalCode: g.goalCode || `${g.domain.toUpperCase()}-${g.goalNumber}`,
    ageRange: g.ageRange || `${g.ageGroup} سنوات`,
    mastery: '3 محاولات متتالية',
    isSeed: true,
  }));

  return [...portageMasterGoals, ...seeds, ...custom];
}

export function GoalPickerModal({ domain = 'all', program = 'all', alreadySelected = [], onConfirm, onSelect, onClose }) {
  const [checked, setChecked] = useState(() => new Set((alreadySelected || []).map(g => `${g.program}::${g.domain}::${g.text}`)));
  const [customText, setCustomText] = useState('');
  const [customProgram, setCustomProgram] = useState(program || 'custom');
  const [goalCode, setGoalCode] = useState('');
  const [customDomain, setCustomDomain] = useState(domain || DOMAINS[0].key);
  const [saveToBank, setSaveToBank] = useState(true);
  const [programFilter, setProgramFilter] = useState(program || 'all');
  const [domainFilter, setDomainFilter] = useState(domain || 'all');
  const [keyword, setKeyword] = useState('');

  const allGoals = getAllGoals();

  const visibleGoals = useMemo(() => {
    return allGoals.filter(goal => {
      const matchesDomain = domainFilter === 'all' || goal.domain === domainFilter;
      const matchesProgram = programFilter === 'all' || goal.program === programFilter;
      const q = keyword.trim().toLowerCase();
      const matchesKeyword = !q || (goal.text || '').toLowerCase().includes(q) || (goal.goalCode || '').toLowerCase().includes(q);
      return matchesDomain && matchesProgram && matchesKeyword;
    });
  }, [allGoals, domainFilter, programFilter, keyword]);

  const byProgram = PROGRAMS.map(p => ({ ...p, items: visibleGoals.filter(g => g.program === p.key) })).filter(p => p.items.length > 0);

  function toggle(goal) {
    const key = `${goal.program}::${goal.domain}::${goal.text}`;
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function addCustomNow() {
    if (!customText.trim()) return;
    const payload = {
      id: uid(),
      program: customProgram,
      domain: customDomain,
      text: customText.trim(),
      goalCode: goalCode.trim() || `${programLabel(customProgram)}-${uid().slice(0, 4)}`,
    };

    if (saveToBank) {
      lsAdd('progGoalsBank', payload);
    }

    const key = `${payload.program}::${payload.domain}::${payload.text}`;
    setChecked(prev => new Set(prev).add(key));
    setCustomText('');
    setGoalCode('');
  }

  function confirm() {
    const selected = allGoals.filter(g => {
      const hasKey = `${g.program}::${g.domain}::${g.text}`;
      return checked.has(hasKey);
    });

    const rawEntries = [...checked].filter(key => !allGoals.some(g => `${g.program}::${g.domain}::${g.text}` === key));
    const rawExtras = rawEntries.map(raw => {
      const [program, goalDomain, text] = raw.split('::');
      return { program, domain: goalDomain, text };
    });

    const result = [...selected, ...rawExtras];
    if (onSelect) onSelect(result);
    if (onConfirm) onConfirm(result);
  }

  return (
    <div className="mbg">
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px' }}>
          <h2>🎯 اختيار أهداف — {domain && domain !== 'all' ? domainLabel(domain) : 'جميع المجالات'}</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>يمكنك الاختيار من أكثر من برنامج معاً لنفس المجال</p>
        </div>
        <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <select className="fsel" value={programFilter} onChange={e => setProgramFilter(e.target.value)}>
              <option value="all">جميع البرامج</option>
              {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <select className="fsel" value={domainFilter} onChange={e => setDomainFilter(e.target.value)}>
              <option value="all">كل المجالات</option>
              {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
            <input className="srch" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="بحث سريع بالكلمات/الرمز..." style={{ minWidth: 260 }} />
          </div>

          {byProgram.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--g4)' }}>
              لا توجد بنود في هذا المجال بعد — أضف بنداً مخصصاً بالأسفل
            </div>
          )}
          {byProgram.map(p => (
            <div key={p.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 900, color: p.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} /> {p.label} ({p.items.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.items.map(g => {
                  const key = `${g.program}::${g.domain}::${g.text}`;
                  return (
                    <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', background: checked.has(key) ? 'var(--ok-l)' : 'var(--bg-card)', fontSize: '.86rem', transition: 'background 0.15s ease' }}>
                      <input type="checkbox" checked={checked.has(key)} onChange={() => toggle(g)} style={{ marginTop: 3 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{g.text}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '.72rem', background: 'var(--g1)', color: 'var(--text-sub)', padding: '1px 6px', borderRadius: 4 }}>
                            {domainLabel(g.domain)}
                          </span>
                          {g.ageRange && (
                            <span style={{ fontSize: '.72rem', background: 'var(--pr-l)', color: 'var(--pr)', padding: '1px 6px', borderRadius: 4 }}>
                              👶 {g.ageRange}
                            </span>
                          )}
                          {g.goalCode && (
                            <span style={{ fontSize: '.72rem', color: 'var(--g5)', fontWeight: 700 }}>
                              {g.goalCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: 14, background: 'var(--g0)', borderRadius: 10 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 800, marginBottom: 8 }}>➕ إضافة هدف مخصص لهذا المجال</div>
            <div className="fg c2">
              <div className="fl"><label>البرنامج المصدر</label>
                <select value={customProgram} onChange={e => setCustomProgram(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl"><label>المجال</label>
                <select value={customDomain} onChange={e => setCustomDomain(e.target.value)}>
                  {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </div>
              <div className="fl"><label>رمز الهدف</label><input value={goalCode} onChange={e => setGoalCode(e.target.value)} placeholder="مثل ABLLS: C14" /></div>
              <div className="fl"><label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={saveToBank} onChange={e => setSaveToBank(e.target.checked)} />
                احفظه في بنك المركز لإعادة استخدامه لاحقاً
              </label></div>
              <div className="fl full"><label>نص الهدف</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder="اكتب نص الهدف..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addCustomNow()} />
                  <button type="button" className="btn btn-s btn-sm" onClick={addCustomNow}>➕ إضافة</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fa">
          <button type="button" className="btn btn-p" onClick={confirm}>✅ تأكيد الاختيار ({checked.size})</button>
          <button type="button" className="btn btn-g" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

export function GoalsBankManagerModal({ defaultProgram = 'all', onClose }) {
  const { toast } = useApp();
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterProgram, setFilterProgram] = useState(defaultProgram || 'all');
  const [customBank, setCustomBank] = useState(lsGet('progGoalsBank') || []);
  const [newProgram, setNewProgram] = useState(defaultProgram !== 'all' ? defaultProgram : 'custom');
  const availableDomains = domainsForProgram(newProgram);
  const [newDomain, setNewDomain] = useState(availableDomains[0]?.key || DOMAINS[0].key);
  const [newText, setNewText] = useState('');
  const [newCode, setNewCode] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [bulkPaste, setBulkPaste] = useState('');
  const [search, setSearch] = useState('');

  const allGoals = getAllGoals();

  function reload() { setCustomBank(lsGet('progGoalsBank') || []); }

  function resetForm() {
    setEditingId(null);
    setNewProgram('custom');
    setNewDomain(domainsForProgram('custom')[0]?.key || DOMAINS[0].key);
    setNewText('');
    setNewCode('');
  }

  function handleProgramChange(programKey) {
    setNewProgram(programKey);
    const domains = domainsForProgram(programKey);
    setNewDomain(domains[0]?.key || DOMAINS[0].key);
  }

  function addItem() {
    if (!newText.trim()) { toast('⚠️ اكتب نص الهدف', 'er'); return; }

    const payload = { program: newProgram, domain: newDomain, text: newText.trim(), goalCode: newCode.trim() || undefined };

    if (editingId) {
      lsUpd('progGoalsBank', editingId, payload);
      toast('✅ تم تحديث البند في بنك المركز', 'ok');
    } else {
      lsAdd('progGoalsBank', { id: uid(), ...payload });
      toast('✅ تمت الإضافة لبنك المركز', 'ok');
    }

    resetForm();
    reload();
  }

  function editItem(goal) {
    setEditingId(goal.id);
    setNewProgram(goal.program || 'custom');
    const domains = domainsForProgram(goal.program || 'custom');
    setNewDomain(goal.domain || domains[0]?.key || DOMAINS[0].key);
    setNewText(goal.text || '');
    setNewCode(goal.goalCode || '');
  }

  function del(id) {
    if (!window.confirm('حذف هذا البند من بنك المركز؟')) return;
    lsDel('progGoalsBank', id);
    toast('🗑️ تم الحذف', 'ok');
    if (editingId === id) resetForm();
    reload();
  }

  function parseImportedGoalRows(rawArray) {
    const imported = [];
    (rawArray || []).forEach(item => {
      const goal = {
        id: uid(),
        program: item.program || newProgram || 'custom',
        domain: item.domain || newDomain || DOMAINS[0].key,
        text: item.text || item.goal || item.goalText || item.name || '',
        goalCode: item.goalCode || item.code || item.goal_code || '',
      };
      if (goal.text) imported.push(goal);
    });
    return imported;
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        if (file.name.toLowerCase().endsWith('.json')) {
          const json = JSON.parse(text);
          const rows = Array.isArray(json) ? json : json.goals || json.items || json.data || [];
          const imported = parseImportedGoalRows(rows);
          imported.forEach(g => lsAdd('progGoalsBank', g));
          toast(`✅ تم استيراد ${imported.length} هدفاً`, 'ok');
          reload();
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          const lines = text.split(/\r?\n/).filter(Boolean);
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const rows = lines.slice(1).map(line => line.split(',').reduce((acc, cell, i) => {
            acc[headers[i] || i] = cell.trim();
            return acc;
          }, {}));
          const imported = parseImportedGoalRows(rows);
          imported.forEach(g => lsAdd('progGoalsBank', g));
          toast(`✅ تم استيراد ${imported.length} هدفاً`, 'ok');
          reload();
        } else {
          toast('⚠️ نوع الملف غير مدعوم، استخدم CSV أو JSON فقط', 'er');
        }
      } catch (err) {
        toast('⚠️ فشل تحليل الملف، تأكد من الصيغة', 'er');
      }
    };
    reader.readAsText(file);
  }

  function addPasteGoals() {
    const lines = bulkPaste.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    if (!lines.length) { toast('⚠️ لا توجد أسطر للإضافة', 'er'); return; }
    const imported = lines.map((line, idx) => ({
      id: uid(),
      program: newProgram,
      domain: newDomain,
      goalCode: `Paste-${idx + 1}`,
      text: line,
    }));
    imported.forEach(g => lsAdd('progGoalsBank', g));
    setBulkPaste('');
    toast(`✅ تم إدخال ${imported.length} هدفاً من خلال اللصق السريع`, 'ok');
    reload();
  }

  const filtered = (allGoals || []).filter(g => {
    const domainMatch = filterDomain === 'all' || g.domain === filterDomain;
    const programMatch = filterProgram === 'all' || g.program === filterProgram;
    const q = search.trim().toLowerCase();
    const textMatch = !q || (g.text || '').toLowerCase().includes(q) || (g.goalCode || '').toLowerCase().includes(q);
    return domainMatch && programMatch && textMatch;
  });

  return (
    <div className="mbg">
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px' }}>
          <h2>🗂️ إدارة بنك الأهداف الخاص بمركزك</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>أضف بنودك، استورد مجموعات، أو استخدم الصياغة السريعة للبنك</p>
        </div>
        <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
          <div style={{ padding: 14, background: 'var(--g0)', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 800, marginBottom: 8 }}>{editingId ? '✏️ تحديث بند من البنك' : '➕ إضافة بند جديد للبنك'}</div>
            <div className="fg c3">
              <div className="fl"><label>1️⃣ البرنامج <span className="req">*</span></label>
                <select value={newProgram} onChange={e => handleProgramChange(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl">
                <label>2️⃣ المجال <span className="req">*</span></label>
                <select value={newDomain} onChange={e => setNewDomain(e.target.value)}>
                  {availableDomains.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </div>
              <div className="fl"><label>رمز الهدف</label><input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="ABLLS: C14" /></div>
              <div className="fl full"><label>3️⃣ نص الهدف <span className="req">*</span></label>
                <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="اكتب نص الهدف كما في دليلكم..." onKeyDown={e => e.key === 'Enter' && addItem()} />
              </div>
              <div className="fl full" style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-p" onClick={addItem}>{editingId ? '💾 تحديث' : '➕ إضافة'}</button>
                {editingId && <button type="button" className="btn btn-g" onClick={resetForm}>إلغاء</button>}
              </div>
            </div>
          </div>

          <div style={{ padding: 14, background: 'var(--g0)', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 800, marginBottom: 8 }}>📥 استيراد جماعي / bulk import</div>
            <div className="fg c2">
              <div className="fl">
                <label>رفع ملف CSV أو JSON</label>
                <input type="file" accept=".csv,.json" onChange={handleFileUpload} />
              </div>
              <div className="fl">
                <label>اللصق السريع للأهداف</label>
                <textarea value={bulkPaste} onChange={e => setBulkPaste(e.target.value)} rows={5} placeholder="ألصق أهدافاً مفصولة أسطر..." />
                <div style={{ marginTop: 8 }}><button type="button" className="btn btn-s btn-sm" onClick={addPasteGoals}>إدراج الأهداف</button></div>
              </div>
            </div>
          </div>

          <div className="tabs" style={{ marginBottom: 12 }}>
            <button type="button" className={`tab ${filterDomain === 'all' ? 'on' : ''}`} onClick={() => setFilterDomain('all')}>كل المجالات</button>
            {DOMAINS.map(d => (
              <button key={d.key} type="button" className={`tab ${filterDomain === d.key ? 'on' : ''}`} onClick={() => setFilterDomain(d.key)}>{d.label}</button>
            ))}
          </div>

          <div className="fg c2" style={{ marginBottom: 12 }}>
            <div className="fl">
              <label>البرنامج</label>
              <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
                <option value="all">الكل</option>
                {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div className="fl">
              <label>بحث</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن كلمة/رمز..." />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--g4)' }}>لا توجد بنود في هذا الفلتر</div>
          ) : (
            filtered.map(g => (
              <div key={g.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '10px 14px' }}>
                <div className="av" style={{ background: programColor(g.program) + '22', color: programColor(g.program), fontWeight: 800, minWidth: 36, textAlign: 'center' }}>{programLabel(g.program).slice(0, 2)}</div>
                <div className="ci" style={{ flex: 1 }}>
                  <div className="cn" style={{ fontWeight: 600, fontSize: '.9rem' }}>{g.text}</div>
                  <div className="cm" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontWeight: 700, color: programColor(g.program) }}>{programLabel(g.program)}</span>
                    <span>·</span>
                    <span>{domainLabel(g.domain)}</span>
                    {g.ageRange && (
                      <>
                        <span>·</span>
                        <span style={{ fontSize: '.72rem', background: 'var(--pr-l)', color: 'var(--pr)', padding: '1px 6px', borderRadius: 4 }}>
                          👶 {g.ageRange}
                        </span>
                      </>
                    )}
                    {g.goalCode && (
                      <>
                        <span>·</span>
                        <span style={{ fontSize: '.72rem', color: 'var(--g5)', fontWeight: 700 }}>
                          {g.goalCode}
                        </span>
                      </>
                    )}
                    {g.isSeed && (
                      <span style={{ fontSize: '.68rem', background: 'var(--g1)', color: 'var(--text-sub)', padding: '1px 6px', borderRadius: 4 }}>
                        دليل قياسي
                      </span>
                    )}
                  </div>
                </div>
                {!g.isSeed && (
                  <div className="c-acts" style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn btn-xs btn-g" onClick={() => editItem(g)}>✏️</button>
                    <button type="button" className="btn btn-xs btn-d" onClick={() => del(g.id)}>🗑️</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="fa">
          <button type="button" className="btn btn-g" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
