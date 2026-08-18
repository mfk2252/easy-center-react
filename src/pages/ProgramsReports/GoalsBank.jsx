import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { PROGRAMS, DOMAINS, SEED_GOALS, programLabel, programColor, domainLabel, domainsForProgram } from '../../utils/goalsBank';
import { ALL_PORTAGE_GOALS } from '../../data/portageGoals';
import { ALL_ABLLS_GOALS } from '../../data/abllsGoals';

export function getAllGoals() {
  const custom = lsGet('progGoalsBank') || [];
  const seeds = SEED_GOALS.map((g, i) => ({ ...g, id: `seed-${i}`, isSeed: true }));
  const portageMasterGoals = (ALL_PORTAGE_GOALS || []).map((g) => {
    // Portage goals: if domain is gross_motor or fine_motor, map to primary 'motor' domain
    const normalizedDomain = (g.domain === 'gross_motor' || g.domain === 'fine_motor' || g.domain === 'motor') ? 'motor' : g.domain;
    const ageGroup = g.ageGroup || (g.ageRange ? g.ageRange.replace(' سنة', '').replace(' سنوات', '').trim() : '0-1');
    const ageRange = g.ageRange || (g.ageGroup ? `${g.ageGroup} سنوات` : '');

    return {
      id: g.id,
      program: 'portage',
      domain: normalizedDomain,
      subDomain: g.domain,
      text: g.text || g.title,
      goalCode: g.goalCode || `P-${normalizedDomain.slice(0, 3).toUpperCase()}-${g.goalNumber}`,
      ageGroup: ageGroup,
      ageRange: ageRange,
      mastery: '3 محاولات متتالية',
      isSeed: true,
    };
  });

  const abllsMasterGoals = (ALL_ABLLS_GOALS || []).map((g) => ({
    id: g.id,
    program: 'ablls',
    domain: g.domain,
    text: g.text || g.title,
    goalCode: `ABLLS:${g.goalCode}`,
    ageGroup: 'مستمر',
    ageRange: 'تقييم شامل',
    scoreScale: g.scoreScale || '0-2',
    mastery: g.mastery || 'إتقان تام للاستجابة',
    tools: 'بيئة طبيعية وأدوات تدريب',
    isSeed: true,
  }));

  return [...portageMasterGoals, ...abllsMasterGoals, ...seeds, ...custom];
}

export function GoalPickerModal({ domain = 'all', program = 'all', alreadySelected = [], onConfirm, onSelect, onClose }) {
  const [checked, setChecked] = useState(() => new Set((alreadySelected || []).map(g => `${g.program}::${g.domain}::${g.text}`)));
  const [customText, setCustomText] = useState('');
  const [customProgram, setCustomProgram] = useState(program !== 'all' ? program : 'portage');
  const [goalCode, setGoalCode] = useState('');
  const [customDomain, setCustomDomain] = useState(() => {
    const avail = domainsForProgram(program !== 'all' ? program : 'portage');
    return (domain !== 'all' && avail.some(d => d.key === domain)) ? domain : (avail[0]?.key || DOMAINS[0].key);
  });
  const [saveToBank, setSaveToBank] = useState(true);
  const [programFilter, setProgramFilter] = useState(program || 'all');
  const [domainFilter, setDomainFilter] = useState(domain || 'all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [keyword, setKeyword] = useState('');

  const allGoals = getAllGoals();

  // Dynamic available domains based on selected program
  const availableDomains = useMemo(() => {
    return domainsForProgram(programFilter);
  }, [programFilter]);

  // Handle program change: reset domain filter if not available in selected program
  function handleProgramFilterChange(newProg) {
    setProgramFilter(newProg);
    const validDomains = domainsForProgram(newProg);
    if (domainFilter !== 'all' && !validDomains.some(d => d.key === domainFilter)) {
      setDomainFilter('all');
    }
  }

  // Handle custom program change in addition form
  function handleCustomProgramChange(newProg) {
    setCustomProgram(newProg);
    const avail = domainsForProgram(newProg);
    if (!avail.some(d => d.key === customDomain)) {
      setCustomDomain(avail[0]?.key || DOMAINS[0].key);
    }
  }

  const visibleGoals = useMemo(() => {
    return allGoals.filter(goal => {
      const matchesProgram = programFilter === 'all' || goal.program === programFilter;
      const matchesDomain = domainFilter === 'all' || goal.domain === domainFilter;
      const matchesAge = ageFilter === 'all' || goal.ageGroup === ageFilter || (goal.ageRange && goal.ageRange.includes(ageFilter));
      const q = keyword.trim().toLowerCase();
      const matchesKeyword = !q || (goal.text || '').toLowerCase().includes(q) || (goal.goalCode || '').toLowerCase().includes(q);
      return matchesDomain && matchesProgram && matchesAge && matchesKeyword;
    });
  }, [allGoals, domainFilter, programFilter, ageFilter, keyword]);

  const byProgram = PROGRAMS.map(p => ({ ...p, items: visibleGoals.filter(g => g.program === p.key) })).filter(p => p.items.length > 0);

  // Check if all currently visible goals are selected
  const allVisibleSelected = visibleGoals.length > 0 && visibleGoals.every(g => checked.has(`${g.program}::${g.domain}::${g.text}`));
  const someVisibleSelected = visibleGoals.some(g => checked.has(`${g.program}::${g.domain}::${g.text}`));

  function toggleSelectAllVisible() {
    setChecked(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        // Deselect all visible
        visibleGoals.forEach(g => {
          next.delete(`${g.program}::${g.domain}::${g.text}`);
        });
      } else {
        // Select all visible
        visibleGoals.forEach(g => {
          next.add(`${g.program}::${g.domain}::${g.text}`);
        });
      }
      return next;
    });
  }

  function toggleProgramGroup(programGoals) {
    const allProgSelected = programGoals.length > 0 && programGoals.every(g => checked.has(`${g.program}::${g.domain}::${g.text}`));
    setChecked(prev => {
      const next = new Set(prev);
      if (allProgSelected) {
        programGoals.forEach(g => next.delete(`${g.program}::${g.domain}::${g.text}`));
      } else {
        programGoals.forEach(g => next.add(`${g.program}::${g.domain}::${g.text}`));
      }
      return next;
    });
  }

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
      const [progKey, goalDomain, text] = raw.split('::');
      return { program: progKey, domain: goalDomain, text };
    });

    const result = [...selected, ...rawExtras];
    if (onSelect) onSelect(result);
    if (onConfirm) onConfirm(result);
  }

  return (
    <div className="mbg">
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px' }}>
          <h2>🎯 اختيار أهداف — {programFilter !== 'all' ? programLabel(programFilter) : 'جميع البرامج'} {domainFilter !== 'all' ? `(${domainLabel(domainFilter)})` : ''}</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>اختر البرنامج والمجال والعمر لتصفية بنود الأهداف بدقة</p>
        </div>
        <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14, background: 'var(--g0)', padding: 12, borderRadius: 10 }}>
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-sub)' }}>البرنامج</label>
              <select className="fsel" style={{ width: '100%' }} value={programFilter} onChange={e => handleProgramFilterChange(e.target.value)}>
                <option value="all">جميع البرامج</option>
                {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-sub)' }}>المجال</label>
              <select className="fsel" style={{ width: '100%' }} value={domainFilter} onChange={e => setDomainFilter(e.target.value)}>
                <option value="all">كل المجالات {programFilter !== 'all' ? `(${availableDomains.length})` : ''}</option>
                {availableDomains.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-sub)' }}>الفئة العمرية</label>
              <select className="fsel" style={{ width: '100%' }} value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
                <option value="all">جميع الأعمار</option>
                <option value="infant">مرحلة الرضيع (0-4 أشهر)</option>
                <option value="0-1">من 0 إلى 1 سنة</option>
                <option value="1-2">من 1 إلى 2 سنة</option>
                <option value="2-3">من 2 إلى 3 سنوات</option>
                <option value="3-4">من 3 إلى 4 سنوات</option>
                <option value="4-5">من 4 إلى 5 سنوات</option>
                <option value="5-6">من 5 إلى 6 سنوات</option>
                <option value="+6">+6 سنوات فما فوق</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '.75rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-sub)' }}>بحث سريع</label>
              <input className="srch" style={{ width: '100%', height: 38 }} value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="بحث بالكلمات أو الرمز..." />
            </div>
          </div>

          {/* Quick Action Bar for Select All */}
          {visibleGoals.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--g0)', borderRadius: 10, marginBottom: 14, border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: '.88rem', margin: 0, color: 'var(--text-main)' }}>
                <input
                  type="checkbox"
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                  checked={allVisibleSelected}
                  ref={el => { if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected; }}
                  onChange={toggleSelectAllVisible}
                />
                <span>تحديد كل النتائج المصفاة ({visibleGoals.length} هدف)</span>
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-s btn-xs"
                  onClick={toggleSelectAllVisible}
                  style={{ borderRadius: 6, fontSize: '.78rem' }}
                >
                  {allVisibleSelected ? 'إلغاء تحديد الكل' : '✅ تحديد الكل'}
                </button>
                <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>
                  المحدد: <strong style={{ color: 'var(--pr)' }}>{checked.size}</strong>
                </span>
              </div>
            </div>
          )}

          {byProgram.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--g4)' }}>
              لا توجد بنود في هذا المجال بعد — أضف بنداً مخصصاً بالأسفل
            </div>
          )}
          {byProgram.map(p => {
            const allInProg = p.items.length > 0 && p.items.every(g => checked.has(`${g.program}::${g.domain}::${g.text}`));
            const someInProg = p.items.some(g => checked.has(`${g.program}::${g.domain}::${g.text}`));

            return (
              <div key={p.key} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '.82rem', fontWeight: 900, color: p.color, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: p.color + '10', padding: '6px 10px', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} /> {p.label} ({p.items.length})
                  </div>
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={() => toggleProgramGroup(p.items)}
                    style={{ background: 'var(--bg-card)', border: `1px solid ${p.color}40`, color: p.color, fontSize: '.72rem', padding: '2px 8px', borderRadius: 4 }}
                  >
                    {allInProg ? 'إلغاء تحديد القسم' : 'تحديد قسم ' + p.label}
                  </button>
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
          );
        })}

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
                  {domainsForProgram(customProgram).map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
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
  const [filterAge, setFilterAge] = useState('all');
  const [customBank, setCustomBank] = useState(lsGet('progGoalsBank') || []);
  const [newProgram, setNewProgram] = useState(defaultProgram !== 'all' ? defaultProgram : 'portage');
  const availableDomains = domainsForProgram(newProgram);
  const [newDomain, setNewDomain] = useState(availableDomains[0]?.key || DOMAINS[0].key);
  const [newText, setNewText] = useState('');
  const [newCode, setNewCode] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [bulkPaste, setBulkPaste] = useState('');
  const [search, setSearch] = useState('');

  const allGoals = getAllGoals();

  const filterAvailableDomains = useMemo(() => {
    return domainsForProgram(filterProgram);
  }, [filterProgram]);

  function reload() { setCustomBank(lsGet('progGoalsBank') || []); }

  function resetForm() {
    setEditingId(null);
    setNewProgram('portage');
    setNewDomain(domainsForProgram('portage')[0]?.key || DOMAINS[0].key);
    setNewText('');
    setNewCode('');
  }

  function handleProgramFilterChange(progKey) {
    setFilterProgram(progKey);
    const valid = domainsForProgram(progKey);
    if (filterDomain !== 'all' && !valid.some(d => d.key === filterDomain)) {
      setFilterDomain('all');
    }
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
    const ageMatch = filterAge === 'all' || g.ageGroup === filterAge || (g.ageRange && g.ageRange.includes(filterAge));
    const q = search.trim().toLowerCase();
    const textMatch = !q || (g.text || '').toLowerCase().includes(q) || (g.goalCode || '').toLowerCase().includes(q);
    return domainMatch && programMatch && ageMatch && textMatch;
  });

  return (
    <div className="mbg">
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px' }}>
          <h2>🗂️ إدارة بنك الأهداف الخاص بمركزك</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>أضف بنودك، استورد مجموعات، أو استعرض أهداف البرامج القياسية المقننة</p>
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
              <div className="fl"><label>رمز الهدف</label><input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="مثال: P-MOT-15" /></div>
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
            <div style={{ fontSize: '.8rem', fontWeight: 800, marginBottom: 8 }}>📥 استيراد جماعي / Bulk Import</div>
            <div className="fg c2">
              <div className="fl">
                <label>رفع ملف CSV أو JSON</label>
                <input type="file" accept=".csv,.json" onChange={handleFileUpload} />
              </div>
              <div className="fl">
                <label>اللصق السريع للأهداف</label>
                <textarea value={bulkPaste} onChange={e => setBulkPaste(e.target.value)} rows={3} placeholder="ألصق أهدافاً مفصولة بأطر..." />
                <div style={{ marginTop: 8 }}><button type="button" className="btn btn-s btn-sm" onClick={addPasteGoals}>إدراج الأهداف</button></div>
              </div>
            </div>
          </div>

          {/* DYNAMIC DOMAIN TABS BASED ON SELECTED PROGRAM */}
          <div className="tabs" style={{ marginBottom: 12, overflowX: 'auto', display: 'flex', gap: 4 }}>
            <button type="button" className={`tab ${filterDomain === 'all' ? 'on' : ''}`} onClick={() => setFilterDomain('all')}>
              كل المجالات ({filterAvailableDomains.length})
            </button>
            {filterAvailableDomains.map(d => (
              <button key={d.key} type="button" className={`tab ${filterDomain === d.key ? 'on' : ''}`} onClick={() => setFilterDomain(d.key)}>
                {d.label}
              </button>
            ))}
          </div>

          <div className="fg c3" style={{ marginBottom: 12 }}>
            <div className="fl">
              <label>البرنامج</label>
              <select value={filterProgram} onChange={e => handleProgramFilterChange(e.target.value)}>
                <option value="all">جميع البرامج</option>
                {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div className="fl">
              <label>الفئة العمرية</label>
              <select value={filterAge} onChange={e => setFilterAge(e.target.value)}>
                <option value="all">جميع الأعمار</option>
                <option value="infant">مرحلة الرضيع (0-4 أشهر)</option>
                <option value="0-1">من 0 إلى 1 سنة</option>
                <option value="1-2">من 1 إلى 2 سنة</option>
                <option value="2-3">من 2 إلى 3 سنوات</option>
                <option value="3-4">من 3 إلى 4 سنوات</option>
                <option value="4-5">من 4 إلى 5 سنوات</option>
                <option value="5-6">من 5 إلى 6 سنوات</option>
                <option value="+6">+6 سنوات فما فوق</option>
              </select>
            </div>
            <div className="fl">
              <label>بحث بالكلمات أو الرمز</label>
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
