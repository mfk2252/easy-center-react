import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { GoalPickerModal, GoalsBankManagerModal, getAllGoals } from './GoalsBank';
import { DOMAINS, PROGRAMS, domainLabel, programLabel, programColor } from '../../utils/goalsBank';
import BulkImporter from './BulkImporter';
import { sendReportToWhatsApp } from './programsWhatsApp';
import ProgramDetailModal from './ProgramDetailModal';

const EMPTY_PROG = {
  ...EMPTY_STU_PICK,
  title: '', duration: 'فصل دراسي (3 أشهر)', startDate: todayStr(), reviewDate: '', specialistName: '',
  goals: [], activities: '', notes: '', status: 'active',
};

const EMPTY_BIP = {
  ...EMPTY_STU_PICK,
  date: todayStr(),
  title: '',
  proceduralBehavior: '', // السلوك الإجرائي المستهدف
  targetBehaviors: '', // للاستمرار في دعم البيانات القديمة
  antecedents: '', // المثيرات القبلية
  consequences: '', // العواقب واللواحق
  behaviorFunction: 'attention', // الوظيفة المفترضة السلوكية
  observationMethod: 'frequency', // طريقة القياس
  baselineLevel: '', // الخط القاعدي القبلي
  replacementBehaviors: '', // السلوك البديل
  reinforcementStrategies: '', // استراتيجيات التدخل والتعزيز
  interventionTechniques: [], // فنيات تعديل السلوك
  timelinePhase: 'observation', // الطور الحالي للخطة
  trackingPoints: [
    { date: 'أسبوع 1', value: 10 },
    { date: 'أسبوع 2', value: 8 },
    { date: 'أسبوع 3', value: 5 },
    { date: 'أسبوع 4', value: 3 },
  ],
  reviewDate: '',
  specialistName: '',
  notes: '',
  status: 'active',
};

export const BEHAVIOR_TECHNIQUES = [
  { id: 'reinforcement', label: 'التعزيز (Reinforcement)', desc: 'تقديم معززات فورية عند صدور السلوك الإيجابي المقبول.' },
  { id: 'extinction', label: 'الإطفاء / التجاهل المنهجي (Systematic Extinction)', desc: 'إيقاف التعزيز الذي كان يحافظ على استمرار السلوك غير المرغوب.' },
  { id: 'shaping', label: 'التشكيل السلوكي التدريجي (Shaping)', desc: 'تعزيز الاستجابات البسيطة المتتالية للوصول للسلوك النهائي.' },
  { id: 'chaining', label: 'التسلسل السلوكي (Chaining)', desc: 'ربط الحلقات السلوكية البسيطة لبناء مهارة مركبة.' },
  { id: 'differential_reinforcement', label: 'التعزيز التفاضلي (Differential Reinforcement)', desc: 'تعزيز سلوك بديل أو نقيض أو غياب السلوك المستهدف.' },
  { id: 'prompting_fading', label: 'التلقين وسحب المساعدات (Prompting & Fading)', desc: 'تزويد الطفل بمساعدة مساندة ثم سحبها تدريجياً لتعويده الاستقلال.' },
  { id: 'token_economy', label: 'الاقتصاد الرمزي (Token Economy)', desc: 'مكافأة الطفل بنقاط أو رموز تُستبدل لاحقاً بمعززات مادية عينية.' },
  { id: 'modeling', label: 'النمذجة والتقليد (Modeling)', desc: 'عرض نموذج حي أو مرئي للسلوك المرغوب ليقوم الطفل بمحاكاته.' },
  { id: 'overcorrection', label: 'التصحيح الزائد (Overcorrection)', desc: 'توجيه الطفل لإصلاح البيئة مع تكرار الاستجابة الصحيحة بشكل مفرط.' },
  { id: 'timeout', label: 'الاستبعاد المؤقت (Time-out)', desc: 'إبعاد الطفل مؤقتاً عن بيئة التعزيز عند اقتراف السلوك غير المرغوب.' }
];

export const BEHAVIOR_FUNCTIONS = [
  { id: 'attention', label: 'لفت الانتباه والاهتمام (Attention)', desc: 'رغبة في لفت انتباه المعلم أو الأخصائي أو الأقران.' },
  { id: 'escape', label: 'الهروب والتجنب (Escape / Avoidance)', desc: 'رغبة الطفل في التملص من مهمة دراسية، أو تمرين، أو بيئة مزعجة.' },
  { id: 'tangible', label: 'الحصول على شيء مادي (Tangible/Access)', desc: 'الحصول على لعبة مفضلة، طعام، حلوى، أو أجهزة إلكترونية.' },
  { id: 'sensory', label: 'التحفيز أو التنظيم الحسي (Sensory/Automatic)', desc: 'سلوك تكراري يمنح الطفل شعوراً مريحاً داخلياً أو يخفف الضغط.' }
];

export const OBSERVATION_METHODS = [
  { id: 'frequency', label: 'تسجيل التكرار (Frequency)', desc: 'حساب عدد مرات اقتراف السلوك خلال فترة محددة.' },
  { id: 'duration', label: 'تسجيل مدة البقاء (Duration)', desc: 'قياس المدة الزمنية المستغرقة من بدء السلوك وحتى انتهائه.' },
  { id: 'intensity', label: 'مقياس الشدة والحدة (Intensity)', desc: 'رصد قوة ودرجة تدميرية/تأثير السلوك رقمياً من 1 إلى 5.' },
  { id: 'intervals', label: 'تسجيل الفترات الزمنية (Intervals)', desc: 'تقسيم فترة الملاحظة لفترات متساوية وتدوين حدوث السلوك.' }
];

export default function PillarPlans({ onDataChange }) {
  const { toast, center } = useApp();
  const [subTab, setSubTab] = useState('iep'); // 'iep' | 'bank' | 'behavior'
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');

  // IEP Programs state
  const [programs, setPrograms] = useState([]);
  const [progModal, setProgModal] = useState(false);
  const [progEditId, setProgEditId] = useState(null);
  const [progForm, setProgForm] = useState(EMPTY_PROG);
  const [viewProg, setViewProg] = useState(null);
  const [viewGrouping, setViewGrouping] = useState('student');

  // Modals for Goal Picker & Bank Manager
  const [goalPickerOpen, setGoalPickerOpen] = useState(false);
  const [bankManagerOpen, setBankManagerOpen] = useState(false);
  const [selectedBankProgram, setSelectedBankProgram] = useState('all');
  const [bulkImporterOpen, setBulkImporterOpen] = useState(false);

  // BIP Behavior Plans state
  const [bipList, setBipList] = useState([]);
  const [bipModal, setBipModal] = useState(false);
  const [bipEditId, setBipEditId] = useState(null);
  const [bipForm, setBipForm] = useState(EMPTY_BIP);

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setPrograms((lsGet('progPrograms') || []).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || '')));
    setBipList((lsGet('progBehaviorReports') || []).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    if (onDataChange) onDataChange();
  }

  useEffect(() => { reload(); }, []);

  // ----------------------------------------------------
  // IEP Programs Actions
  // ----------------------------------------------------
  function openNewProg() {
    setProgForm({ ...EMPTY_PROG, startDate: todayStr() });
    setProgEditId(null);
    setProgModal(true);
  }

  function openEditProg(item) {
    setProgForm({ ...EMPTY_PROG, ...item });
    setProgEditId(item.id);
    setProgModal(true);
  }

  function saveProg() {
    if (!validateStudentPick(progForm)) { toast('⚠️ اختر الطالب من القائمة أو أدخل اسمه', 'er'); return; }
    if (!progForm.title.trim()) { toast('⚠️ أدخل عنوان الخطة أو البرنامج', 'er'); return; }

    const payload = {
      ...progForm,
      goals: progForm.goals || [],
      isUnregistered: progForm.mode === 'other',
      updatedAt: new Date().toISOString(),
    };

    if (progEditId) {
      lsUpd('progPrograms', progEditId, payload);
      toast('✅ تم تحديث الخطة الفردية', 'ok');
    } else {
      lsAdd('progPrograms', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ الخطة الفردية بنجاح', 'ok');
    }
    setProgModal(false);
    reload();
  }

  function delProg(id) {
    if (!window.confirm('حذف هذه الخطة الفردية؟')) return;
    lsDel('progPrograms', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  function handleGoalsSelected(newGoals) {
    setProgForm(f => ({
      ...f,
      goals: [...(f.goals || []), ...newGoals],
    }));
    setGoalPickerOpen(false);
    toast(`✅ تمت إضافة ${newGoals.length} أهداف من البنك للخطة`, 'ok');
  }

  function removeGoalFromProg(index) {
    setProgForm(f => ({
      ...f,
      goals: (f.goals || []).filter((_, i) => i !== index),
    }));
  }

  // ----------------------------------------------------
  // Behavior Plans (BIP) Actions
  // ----------------------------------------------------
  // Dynamic Progress Chart Renderer for BIP
  function renderBipChart(points) {
    if (!points || points.length === 0) return null;
    
    const width = 500;
    const height = 150;
    const padding = 35;
    
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxVal = Math.max(...points.map(p => Number(p.value) || 0), 5);
    
    const coords = points.map((p, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * chartWidth;
      const y = height - padding - ((Number(p.value) || 0) / maxVal) * chartHeight;
      return { x, y, label: p.date, value: p.value };
    });
    
    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    
    return (
      <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 12, marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong style={{ fontSize: '.82rem', color: 'var(--text-main)' }}>📈 الخط البياني لتتبع السلوك (رصد التقدم وتناقص معدل حدوث السلوك المستهدف)</strong>
          <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>المعدل الحالي: <strong style={{ color: 'var(--err)' }}>{points[points.length - 1]?.value || 0}</strong></span>
        </div>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * chartHeight;
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border-color)" strokeDasharray="3 3" />
                <text x={padding - 8} y={y + 4} textAnchor="end" fontSize="9" fill="var(--text-sub)">{val}</text>
              </g>
            );
          })}
          
          {/* Area under the line */}
          {coords.length > 1 && (
            <path
              d={`${linePath} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`}
              fill="rgba(239, 68, 68, 0.15)"
            />
          )}
          
          {/* Main Line */}
          <path d={linePath} fill="none" stroke="var(--err)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Data Points */}
          {coords.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r="5" fill="var(--bg-card)" stroke="var(--err)" strokeWidth="3" />
              <circle cx={c.x} cy={c.y} r="2" fill="var(--err)" />
              <text x={c.x} y={c.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text-main)">{c.value}</text>
              <text x={c.x} y={height - padding + 15} textAnchor="middle" fontSize="9" fill="var(--text-sub)">{c.label}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  function openNewBip() {
    setBipForm({ ...EMPTY_BIP, date: todayStr() });
    setBipEditId(null);
    setBipModal(true);
  }

  function openEditBip(item) {
    setBipForm({
      ...EMPTY_BIP,
      ...item,
      proceduralBehavior: item.proceduralBehavior || item.targetBehaviors || '',
    });
    setBipEditId(item.id);
    setBipModal(true);
  }

  function saveBip() {
    if (!validateStudentPick(bipForm)) { toast('⚠️ اختر الطالب أولاً', 'er'); return; }
    if (!bipForm.title.trim()) { toast('⚠️ أدخل عنوان خطة تعديل السلوك', 'er'); return; }

    const payload = {
      ...bipForm,
      targetBehaviors: bipForm.proceduralBehavior || bipForm.targetBehaviors,
      isUnregistered: bipForm.mode === 'other',
      updatedAt: new Date().toISOString(),
    };

    if (bipEditId) {
      lsUpd('progBehaviorReports', bipEditId, payload);
      toast('✅ تم تحديث خطة تعديل السلوك', 'ok');
    } else {
      lsAdd('progBehaviorReports', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ خطة تعديل السلوك', 'ok');
    }
    setBipModal(false);
    reload();
  }

  function delBip(id) {
    if (!window.confirm('حذف خطة السلوك هذه؟')) return;
    lsDel('progBehaviorReports', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  // Print IEP
  function printIEP(p) {
    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const goalsRows = (p.goals || []).map((g, i) => `
      <tr>
        <td style="text-align:center;color:#64748b;">${i + 1}</td>
        <td><b>${esc(g.code || '—')}</b></td>
        <td>${esc(g.text)}</td>
        <td style="text-align:center;">${esc(domainLabel(g.domain) || 'عام')}</td>
        <td style="font-size:.78rem;">${esc(g.mastery || '—')}</td>
        <td style="text-align:center;">${esc(g.status || 'مستمر')}</td>
      </tr>
    `).join('');

    const html = `
      <div style="direction:rtl;text-align:right;">
        <h2 style="color:#7c3aed;border-bottom:2px solid #7c3aed;padding-bottom:8px;margin-bottom:14px;">
          📋 الخطة التربوية / التأهيلية الفردية (IEP)
        </h2>
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;">
          <tr>
            <td><b>اسم الطالب:</b> ${esc(p.studentName)}</td>
            <td><b>العمر:</b> ${esc(p.age || '—')}</td>
            <td><b>التشخيص:</b> ${esc(p.diagnosis || '—')}</td>
          </tr>
          <tr>
            <td><b>عنوان الخطة:</b> ${esc(p.title)}</td>
            <td><b>المدة المقررة:</b> ${esc(p.duration || '—')}</td>
            <td><b>الأخصائي المسؤول:</b> ${esc(p.specialistName || '—')}</td>
          </tr>
          <tr>
            <td><b>تاريخ البدء:</b> ${esc(p.startDate || '—')}</td>
            <td><b>تاريخ المراجعة:</b> ${esc(p.reviewDate || '—')}</td>
            <td><b>الحالة:</b> ${p.status === 'completed' ? 'مكتملة ✅' : 'نشطة ⏳'}</td>
          </tr>
        </table>

        <h3>🎯 الأهداف الإجرائية والتعليمية المحددة:</h3>
        <table border="1" style="width:100%;border-collapse:collapse;margin-top:8px;font-size:12px;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:6px;width:35px;">#</th>
              <th style="padding:6px;width:70px;">الرمز</th>
              <th style="padding:6px;">الهدف التعليمي / التأهيلي</th>
              <th style="padding:6px;width:110px;">المجال</th>
              <th style="padding:6px;width:110px;">معيار الإتقان</th>
              <th style="padding:6px;width:80px;">التقدم</th>
            </tr>
          </thead>
          <tbody>
            ${goalsRows || '<tr><td colspan="6" style="text-align:center;padding:12px;">لا توجد أهداف مسجلة</td></tr>'}
          </tbody>
        </table>

        ${p.activities ? `<h3 style="margin-top:16px;">🎨 الأنشطة والوسائل التعليمية المقترحة:</h3><p style="white-space:pre-wrap;">${esc(p.activities)}</p>` : ''}
        ${p.notes ? `<h3 style="margin-top:14px;">📝 ملاحظات وتوجيهات الخطة:</h3><p style="white-space:pre-wrap;">${esc(p.notes)}</p>` : ''}

        <div style="margin-top:30px;display:flex;justify-content:space-between;border-top:1px dashed #94a3b8;padding-top:16px;">
          <div><b>الأخصائي القائم بالخطة:</b> _______________</div>
          <div><b>توقيع ولي الأمر:</b> _______________</div>
          <div><b>اعتماد إدارة المركز:</b> _______________</div>
        </div>
      </div>
    `;

    const win = window.open('', '_blank');
    if (!win) { toast('⚠️ يرجى السماح بالنوافذ المنبثقة للطباعة', 'er'); return; }
    win.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>خطة IEP - ${p.studentName}</title>
          <style>body { font-family: 'Segoe UI', Tahoma, Arial; padding: 20px; font-size: 13px; }</style>
        </head>
        <body>
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #334155;padding-bottom:10px;margin-bottom:16px;">
            <div style="font-size:1.4rem;font-weight:bold;color:#1e40af;">${center?.name || 'مركز الأمل للتربية الخاصة'}</div>
            ${center?.logo ? `<img src="${center.logo}" style="height:60px;" />` : ''}
          </div>
          ${html}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  }

  // Print BIP Behavior Intervention Plan
  function printBip(b) {
    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    const funcLabel = BEHAVIOR_FUNCTIONS.find(f => f.id === b.behaviorFunction)?.label || b.behaviorFunction || 'غير محدد';
    const obsLabel = OBSERVATION_METHODS.find(o => o.id === b.observationMethod)?.label || b.observationMethod || 'غير محدد';
    const phaseLabel = {
      observation: 'الملاحظة والتقييم القبلي',
      intervention: 'التطبيق الفعلي لفنيات التدخل',
      generalization: 'مرحلة التعميم والثبات',
      followup: 'المتابعة الدورية وصيانة السلوك'
    }[b.timelinePhase || 'observation'] || 'غير محدد';

    const statusLabel = {
      active: 'نشطة ⏳',
      maintenance: 'مرحلة التعميم والثبات 🤝',
      achieved: 'تم تعديل السلوك بنجاح ✅',
      needs_revision: 'بحاجة لمراجعة وتعديل الخطة ⚠️'
    }[b.status] || 'نشطة ⏳';

    const techsList = (b.interventionTechniques || []).map(id => {
      const found = BEHAVIOR_TECHNIQUES.find(t => t.id === id);
      return found ? `<li style="margin-bottom: 6px;"><b>${esc(found.label)}:</b> ${esc(found.desc)}</li>` : '';
    }).filter(Boolean).join('');

    const trackingRows = (b.trackingPoints || []).map((pt, i) => `
      <tr>
        <td style="text-align:center;padding:6px;border:1px solid #cbd5e1;">${i + 1}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;"><b>${esc(pt.date)}</b></td>
        <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;color:#ef4444;font-weight:bold;">${esc(pt.value)}</td>
      </tr>
    `).join('');

    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Segoe UI', Tahoma, Arial, sans-serif;color:#1e293b;line-height:1.6;">
        <h2 style="color:#ef4444;border-bottom:3px solid #ef4444;padding-bottom:8px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          <span>📐 خطة تعديل السلوك والتدخل السلوكي الفردية (BIP)</span>
          <span style="font-size:1rem;background:#fef2f2;color:#ef4444;padding:4px 10px;border-radius:6px;border:1px solid #fee2e2;">نموذج معتمد</span>
        </h2>
        
        <table style="width:100%;margin-bottom:20px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:12px;border-collapse:separate;border-spacing:0 8px;">
          <tr>
            <td style="width:33%;"><b>اسم الطالب:</b> ${esc(b.studentName)}</td>
            <td style="width:33%;"><b>العمر النمائي:</b> ${esc(b.age || '—')}</td>
            <td style="width:33%;"><b>التشخيص:</b> ${esc(b.diagnosis || '—')}</td>
          </tr>
          <tr>
            <td><b>عنوان الخطة:</b> ${esc(b.title)}</td>
            <td><b>تاريخ البدء:</b> ${esc(b.date || '—')}</td>
            <td><b>أخصائي تعديل السلوك:</b> ${esc(b.specialistName || '—')}</td>
          </tr>
          <tr>
            <td><b>تاريخ المراجعة:</b> ${esc(b.reviewDate || '—')}</td>
            <td><b>حالة الخطة الحالية:</b> <strong style="color:#dc2626;">${statusLabel}</strong></td>
            <td><b>الصف/المجموعة:</b> ${esc(b.className || '—')}</td>
          </tr>
        </table>

        <!-- ABC ANALYSIS -->
        <div style="background:#fff4f4;border:1px solid #fecaca;border-radius:10px;padding:14px;margin-bottom:18px;">
          <h3 style="color:#991b1b;margin-top:0;margin-bottom:10px;border-bottom:1px solid #fca5a5;padding-bottom:6px;">🧬 التحليل الوظيفي العلمي للسلوك (ABC Analysis)</h3>
          <p style="margin:6px 0;"><b>1. السلوك المستهدف إجرائياً (Behavior):</b></p>
          <div style="background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #fca5a5;margin-bottom:10px;white-space:pre-wrap;">${esc(b.proceduralBehavior || b.targetBehaviors || 'لا يوجد وصف إجرائي')}</div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;">
            <div>
              <b>2. المثيرات والظروف القبلية (Antecedents):</b>
              <div style="background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #fca5a5;margin-top:4px;min-height:60px;white-space:pre-wrap;">${esc(b.antecedents || '—')}</div>
            </div>
            <div>
              <b>3. عواقب السلوك واللواحق الحالية (Consequences):</b>
              <div style="background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #fca5a5;margin-top:4px;min-height:60px;white-space:pre-wrap;">${esc(b.consequences || '—')}</div>
            </div>
          </div>
          <p style="margin:6px 0;"><b>4. الوظيفة المفترضة السلوكية (Hypothesized Function):</b> <strong style="color:#b91c1c;">${funcLabel}</strong></p>
        </div>

        <!-- MEASUREMENT & TIMELINE -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin-bottom:18px;">
          <h3 style="color:#166534;margin-top:0;margin-bottom:10px;border-bottom:1px solid #86efac;padding-bottom:6px;">🔎 تشخيص وقياس السلوك والخط القاعدي</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;width:33%;"><b>طريقة الملاحظة المعتمدة:</b> <span style="background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #86efac;">${obsLabel}</span></td>
              <td style="padding:6px 0;width:33%;"><b>مستوى الخط القاعدي القبلي:</b> <span style="background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #86efac;font-weight:bold;color:#15803d;">${esc(b.baselineLevel || '—')}</span></td>
              <td style="padding:6px 0;width:33%;"><b>الطور الحالي للخطة:</b> <span style="background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #86efac;">${phaseLabel}</span></td>
            </tr>
          </table>
        </div>

        <!-- INTERVENTIONS & REPLACEMENT -->
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px;margin-bottom:18px;">
          <h3 style="color:#075985;margin-top:0;margin-bottom:10px;border-bottom:1px solid #7dd3fc;padding-bottom:6px;">🎯 فنيات التدخل المطبقة والسلوك البديل</h3>
          <p style="margin:6px 0;"><b>السلوك البديل الإيجابي المقبول وظيفياً (Alternative Behavior):</b></p>
          <div style="background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #7dd3fc;margin-bottom:10px;white-space:pre-wrap;font-weight:bold;color:#0369a1;">${esc(b.replacementBehaviors || '—')}</div>
          
          ${techsList ? `
            <p style="margin:8px 0 4px 0;"><b>فنيات تعديل السلوك المعتمدة بالخطة:</b></p>
            <ul style="margin:0;padding-right:20px;font-size:0.85rem;color:#0f172a;">
              ${techsList}
            </ul>
          ` : ''}

          ${b.reinforcementStrategies ? `
            <p style="margin:10px 0 4px 0;"><b>تفاصيل إجراءات التدخل واستراتيجيات التعزيز:</b></p>
            <div style="background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #7dd3fc;white-space:pre-wrap;font-size:0.85rem;">${esc(b.reinforcementStrategies)}</div>
          ` : ''}
        </div>

        <!-- PROGRESS GRAPH / DATA -->
        ${b.trackingPoints && b.trackingPoints.length > 0 ? `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:18px;">
            <h3 style="color:#475569;margin-top:0;margin-bottom:10px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;">📈 الخط البياني لرصد التقدم (معدل حدوث السلوك المستهدف)</h3>
            <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;">
              <table style="width:230px;border-collapse:collapse;font-size:12px;background:#fff;">
                <thead>
                  <tr style="background:#f1f5f9;">
                    <th style="padding:5px;border:1px solid #cbd5e1;">#</th>
                    <th style="padding:5px;border:1px solid #cbd5e1;">أسبوع / جلسة القياس</th>
                    <th style="padding:5px;border:1px solid #cbd5e1;">المعدل / القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  ${trackingRows}
                </tbody>
              </table>
              <div style="flex:1;min-width:280px;text-align:center;padding:10px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;">
                <div style="font-size:11px;color:#64748b;margin-bottom:6px;">منحنى تنازلي مرغوب (رصد الانخفاض التدريجي للسلوك غير المرغوب)</div>
                <!-- Mini text chart indicator -->
                <div style="display:flex;justify-content:space-around;align-items:flex-end;height:70px;padding-top:10px;border-bottom:2px solid #94a3b8;position:relative;">
                  ${(b.trackingPoints || []).map((pt) => {
                    const maxVal = Math.max(...b.trackingPoints.map(p => Number(p.value) || 0), 1);
                    const pct = ((Number(pt.value) || 0) / maxVal) * 100;
                    return `
                      <div style="display:flex;flex-direction:column;align-items:center;width:40px;">
                        <span style="font-size:10px;font-weight:bold;color:#ef4444;margin-bottom:2px;">${pt.value}</span>
                        <div style="width:16px;height:${Math.max(pct * 0.5, 4)}px;background:#fca5a5;border:1px solid #ef4444;border-bottom:none;border-radius:3px 3px 0 0;"></div>
                        <span style="font-size:9px;color:#64748b;margin-top:4px;white-space:nowrap;">${pt.date}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        ${b.notes ? `
          <div style="margin-top:14px;background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #cbd5e1;">
            <b>📝 ملاحظات وتوجيهات إضافية:</b>
            <p style="margin:4px 0 0 0;font-size:.85rem;white-space:pre-wrap;">${esc(b.notes)}</p>
          </div>
        ` : ''}

        <div style="margin-top:40px;display:flex;justify-content:space-between;border-top:1px dashed #94a3b8;padding-top:20px;font-size:12px;">
          <div><b>أخصائي تعديل السلوك المعالج:</b> _______________</div>
          <div><b>توقيع ولي الأمر المطلع:</b> _______________</div>
          <div><b>اعتماد المشرف الفني للمركز:</b> _______________</div>
        </div>
      </div>
    `;

    const win = window.open('', '_blank');
    if (!win) { toast('⚠️ يرجى السماح بالنوافذ المنبثقة للطباعة', 'er'); return; }
    win.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>خطة تعديل السلوك BIP - ${b.studentName}</title>
          <style>body { font-family: 'Segoe UI', Tahoma, Arial; padding: 20px; font-size: 13px; }</style>
        </head>
        <body>
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #334155;padding-bottom:10px;margin-bottom:16px;">
            <div style="font-size:1.4rem;font-weight:bold;color:#dc2626;">${center?.name || 'مركز الأمل للتربية الخاصة'}</div>
            ${center?.logo ? `<img src="${center.logo}" style="height:60px;" />` : ''}
          </div>
          ${html}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  }

  // Filtered lists
  const filteredPrograms = programs.filter(p => {
    const matchSearch = !searchTerm || (p.studentName && p.studentName.includes(searchTerm)) || (p.title && p.title.includes(searchTerm));
    const matchStu = !selectedStudentFilter || p.stuId === selectedStudentFilter;
    return matchSearch && matchStu;
  });

  const filteredBips = bipList.filter(b => {
    const matchSearch = !searchTerm || (b.studentName && b.studentName.includes(searchTerm)) || (b.title && b.title.includes(searchTerm));
    const matchStu = !selectedStudentFilter || b.stuId === selectedStudentFilter;
    return matchSearch && matchStu;
  });

  // Grouping programs by student
  const programsGroupedByStudent = useMemo(() => {
    const groups = {};
    filteredPrograms.forEach(p => {
      const key = p.stuId || p.studentName || 'unregistered';
      if (!groups[key]) {
        const sInfo = students.find(s => s.id === p.stuId) || {
          name: p.studentName,
          diagnosis: p.diagnosis,
          className: p.className || '',
        };
        groups[key] = {
          studentId: p.stuId,
          studentName: p.studentName,
          diagnosis: p.diagnosis || sInfo.diagnosis || 'تشخيص عام',
          className: sInfo.className || p.className || '',
          photo: sInfo.photo || '',
          gender: sInfo.gender || '',
          programs: [],
        };
      }
      groups[key].programs.push(p);
    });
    return Object.values(groups);
  }, [filteredPrograms, students]);

  // Grouping programs by classroom
  const programsGroupedByClass = useMemo(() => {
    const groups = {};
    filteredPrograms.forEach(p => {
      const sInfo = students.find(s => s.id === p.stuId);
      const className = sInfo?.className || p.className || 'بدون صف مخصص';
      if (!groups[className]) {
        groups[className] = {
          className,
          programs: [],
        };
      }
      groups[className].programs.push(p);
    });
    return Object.values(groups);
  }, [filteredPrograms, students]);

  return (
    <div>
      {/* Sub Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`tab ${subTab === 'iep' ? 'on' : ''}`}
            onClick={() => setSubTab('iep')}
          >
            📘 خطط البرامج الفردية IEP ({programs.length})
          </button>
          <button
            type="button"
            className={`tab ${subTab === 'bank' ? 'on' : ''}`}
            onClick={() => setSubTab('bank')}
          >
            🎯 بنك الأهداف التخصصي
          </button>
          <button
            type="button"
            className={`tab ${subTab === 'behavior' ? 'on' : ''}`}
            onClick={() => setSubTab('behavior')}
          >
            📐 خطط تعديل السلوك BIP ({bipList.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {subTab === 'iep' && (
            <button type="button" className="btn btn-p" onClick={openNewProg}>
              ➕ إنشاء خطة فردية IEP
            </button>
          )}
          {subTab === 'bank' && (
            <>
              <button type="button" className="btn btn-p" onClick={() => setBankManagerOpen(true)}>
                ⚙️ إدارة بنك الأهداف
              </button>
              <button type="button" className="btn btn-s" onClick={() => setBulkImporterOpen(true)}>
                📥 استيراد أهداف
              </button>
            </>
          )}
          {subTab === 'behavior' && (
            <button type="button" className="btn btn-p" onClick={openNewBip}>
              ➕ خطة تعديل سلوك جديدة
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="prog-filter-bar">
        <input
          type="text"
          className="prog-search-input"
          placeholder="🔍 بحث باسم الطالب أو عنوان الخطة..."
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

      {/* SUBTAB 1: IEP PROGRAMS */}
      {subTab === 'iep' && (
        <div>
          {/* View Grouping Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, background: 'var(--g0)', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--text-sub)' }}>👁️ تنظيم وتجميع العرض:</span>
            </div>
            <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card)', padding: 3, borderRadius: 10, border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '.82rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewGrouping === 'student' ? 'var(--pr)' : 'transparent',
                  color: viewGrouping === 'student' ? '#fff' : 'var(--text-sub)',
                  transition: 'all 0.2s',
                }}
                onClick={() => setViewGrouping('student')}
              >
                🗂️ حسب الطلاب ({programsGroupedByStudent.length})
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '.82rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewGrouping === 'class' ? 'var(--pr)' : 'transparent',
                  color: viewGrouping === 'class' ? '#fff' : 'var(--text-sub)',
                  transition: 'all 0.2s',
                }}
                onClick={() => setViewGrouping('class')}
              >
                🏫 حسب الفصول ({programsGroupedByClass.length})
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '.82rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewGrouping === 'flat' ? 'var(--pr)' : 'transparent',
                  color: viewGrouping === 'flat' ? '#fff' : 'var(--text-sub)',
                  transition: 'all 0.2s',
                }}
                onClick={() => setViewGrouping('flat')}
              >
                📋 كل الخطط مسطحة ({filteredPrograms.length})
              </button>
            </div>
          </div>

          {filteredPrograms.length === 0 ? (
            <EmptyState icon="📋" title="لا توجد خطط فردية (IEP) مسجلة" sub="اضغط ➕ إنشاء خطة فردية IEP لتحديد الأهداف والأنشطة ومتابعة التقدم" />
          ) : viewGrouping === 'student' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
              {programsGroupedByStudent.map(group => {
                const activeCount = group.programs.filter(p => p.status === 'active').length;
                return (
                  <div key={group.studentId || group.studentName} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid var(--border-color)', borderRadius: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px dashed var(--border-color)', paddingBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--pr-l)', color: 'var(--pr)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {group.studentName.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-main)' }}>{group.studentName}</div>
                        <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                          {group.className && <span style={{ background: 'var(--g0)', padding: '2px 6px', borderRadius: 4 }}>📚 {group.className}</span>}
                          <span style={{ color: 'var(--pr)' }}>🩺 {group.diagnosis}</span>
                        </div>
                      </div>
                      {activeCount > 0 && (
                        <span className="bdg b-or" style={{ fontSize: '.68rem' }}>
                          {activeCount} نشطة
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {group.programs.map(item => {
                        const goalsCount = item.goals?.length || 0;
                        return (
                          <div 
                            key={item.id} 
                            style={{ 
                              background: 'var(--g0)', 
                              borderRadius: 10, 
                              padding: '10px 12px', 
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                              cursor: 'pointer',
                            }}
                            onClick={() => setViewProg(item)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '.86rem', color: 'var(--text-main)' }}>{item.title}</strong>
                              <span className={`bdg ${item.status === 'completed' ? 'b-gr' : 'b-or'}`} style={{ fontSize: '.68rem' }}>
                                {item.status === 'completed' ? 'مكتملة ✅' : 'نشطة ⏳'}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.75rem', color: 'var(--text-sub)', flexWrap: 'wrap', gap: 6 }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <span>📅 {item.startDate || '—'}</span>
                                <span>🎯 {goalsCount} أهداف</span>
                              </div>
                              <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                                <button type="button" className="btn btn-xs btn-p" title="عرض التفاصيل" onClick={() => setViewProg(item)}>👁️ عرض</button>
                                <button type="button" className="btn btn-xs btn-bl" title="طباعة" onClick={() => printIEP(item)}>🖨️</button>
                                <button type="button" className="btn btn-xs btn-g" title="تعديل" onClick={() => openEditProg(item)}>✏️</button>
                                <button type="button" className="btn btn-xs btn-d" title="حذف" onClick={() => delProg(item.id)}>🗑️</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewGrouping === 'class' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {programsGroupedByClass.map(group => (
                <div key={group.className} className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 14 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--pr)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                    <span>🏫</span>
                    <span>{group.className}</span>
                    <span style={{ fontSize: '.75rem', background: 'var(--pr-l)', color: 'var(--pr)', padding: '2px 8px', borderRadius: 8, fontWeight: 'normal' }}>
                      {group.programs.length} خطط فردية
                    </span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                    {group.programs.map(item => {
                      const goalsCount = item.goals?.length || 0;
                      return (
                        <div 
                          key={item.id} 
                          className="prog-item-card" 
                          style={{ gap: 10, cursor: 'pointer' }}
                          onClick={() => setViewProg(item)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div>
                              <div className="prog-student-name" style={{ fontSize: '1.02rem' }}>{item.title}</div>
                              <div className="prog-student-meta">
                                الطالب: <strong style={{ color: 'var(--text-main)' }}>{item.studentName}</strong> {item.diagnosis && `· (${item.diagnosis})`}
                              </div>
                            </div>
                            <span className={`bdg ${item.status === 'completed' ? 'b-gr' : 'b-or'}`} style={{ flexShrink: 0 }}>
                              {item.status === 'completed' ? 'مكتملة ✅' : 'نشطة ⏳'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-sub)', background: 'var(--g0)', padding: '8px 10px', borderRadius: 'var(--r3)', flexWrap: 'wrap' }}>
                            <div>🗓️ البدء: <strong style={{ color: 'var(--text-main)' }}>{item.startDate || '—'}</strong></div>
                            <div>🎯 الأهداف: <strong style={{ color: 'var(--text-main)' }}>{goalsCount} هدف</strong></div>
                            <div>⏳ المدة: <strong style={{ color: 'var(--text-main)' }}>{item.duration || 'فصل'}</strong></div>
                          </div>

                          {item.goals && item.goals.length > 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', maxHeight: 68, overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>أبرز الأهداف:</div>
                              <ul style={{ margin: 0, paddingRight: 18 }}>
                                {item.goals.slice(0, 2).map((g, i) => (
                                  <li key={i}>{g.text}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div 
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', flexWrap: 'wrap', gap: 8 }}
                            onClick={e => e.stopPropagation()}
                          >
                            <span style={{ color: 'var(--text-sub)' }}>الأخصائي: <strong style={{ color: 'var(--text-main)' }}>{item.specialistName || '—'}</strong></span>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {item.parentPhone && (
                                <button
                                  type="button"
                                  className="btn btn-xs btn-s"
                                  title="إرسال الخطة لولي الأمر عبر واتساب"
                                  onClick={() => {
                                    const goalsSummary = (item.goals || []).map((g, i) => `${i + 1}. ${g.text}`).join('\n');
                                    sendReportToWhatsApp({
                                      parentPhone: item.parentPhone,
                                      parentName: item.parentName,
                                      studentName: item.studentName,
                                      reportTitle: item.title,
                                      reportType: 'الخطة الفردية (IEP)',
                                      date: item.startDate,
                                      summary: `مدة الخطة: ${item.duration}\nعدد الأهداف المستهدفة: ${goalsCount}\n${goalsSummary}`,
                                      recommendations: item.activities || item.notes,
                                      specialistName: item.specialistName,
                                      centerName: center?.name,
                                    });
                                  }}
                                >
                                  💬 واتساب
                                </button>
                              )}
                              <button type="button" className="btn btn-xs btn-p" title="عرض التفاصيل" onClick={() => setViewProg(item)}>👁️ عرض</button>
                              <button type="button" className="btn btn-xs btn-bl" title="طباعة A4" onClick={() => printIEP(item)}>🖨️</button>
                              <button type="button" className="btn btn-xs btn-g" title="تعديل" onClick={() => openEditProg(item)}>✏️</button>
                              <button type="button" className="btn btn-xs btn-d" title="حذف" onClick={() => delProg(item.id)}>🗑️</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
              {filteredPrograms.map(item => {
                const goalsCount = item.goals?.length || 0;
                return (
                  <div 
                    key={item.id} 
                    className="prog-item-card" 
                    style={{ gap: 10, cursor: 'pointer' }}
                    onClick={() => setViewProg(item)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div className="prog-student-name" style={{ fontSize: '1.02rem' }}>{item.title}</div>
                        <div className="prog-student-meta">
                          الطالب: <strong style={{ color: 'var(--text-main)' }}>{item.studentName}</strong> {item.diagnosis && `· (${item.diagnosis})`}
                        </div>
                      </div>
                      <span className={`bdg ${item.status === 'completed' ? 'b-gr' : 'b-or'}`} style={{ flexShrink: 0 }}>
                        {item.status === 'completed' ? 'مكتملة ✅' : 'نشطة ⏳'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-sub)', background: 'var(--g0)', padding: '8px 10px', borderRadius: 'var(--r3)', flexWrap: 'wrap' }}>
                      <div>🗓️ البدء: <strong style={{ color: 'var(--text-main)' }}>{item.startDate || '—'}</strong></div>
                      <div>🎯 الأهداف: <strong style={{ color: 'var(--text-main)' }}>{goalsCount} هدف</strong></div>
                      <div>⏳ المدة: <strong style={{ color: 'var(--text-main)' }}>{item.duration || 'فصل'}</strong></div>
                    </div>

                    {item.goals && item.goals.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', maxHeight: 68, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>أبرز الأهداف:</div>
                        <ul style={{ margin: 0, paddingRight: 18 }}>
                          {item.goals.slice(0, 2).map((g, i) => (
                            <li key={i}>{g.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', flexWrap: 'wrap', gap: 8 }}
                      onClick={e => e.stopPropagation()}
                    >
                      <span style={{ color: 'var(--text-sub)' }}>الأخصائي: <strong style={{ color: 'var(--text-main)' }}>{item.specialistName || '—'}</strong></span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {item.parentPhone && (
                          <button
                            type="button"
                            className="btn btn-xs btn-s"
                            title="إرسال الخطة لولي الأمر عبر واتساب"
                            onClick={() => {
                              const goalsSummary = (item.goals || []).map((g, i) => `${i + 1}. ${g.text}`).join('\n');
                              sendReportToWhatsApp({
                                parentPhone: item.parentPhone,
                                parentName: item.parentName,
                                studentName: item.studentName,
                                reportTitle: item.title,
                                reportType: 'الخطة الفردية (IEP)',
                                date: item.startDate,
                                summary: `مدة الخطة: ${item.duration}\nعدد الأهداف المستهدفة: ${goalsCount}\n${goalsSummary}`,
                                recommendations: item.activities || item.notes,
                                specialistName: item.specialistName,
                                centerName: center?.name,
                              });
                            }}
                          >
                            💬 واتساب
                          </button>
                        )}
                        <button type="button" className="btn btn-xs btn-p" title="عرض التفاصيل" onClick={() => setViewProg(item)}>👁️ عرض</button>
                        <button type="button" className="btn btn-xs btn-bl" title="طباعة A4" onClick={() => printIEP(item)}>🖨️</button>
                        <button type="button" className="btn btn-xs btn-g" title="تعديل" onClick={() => openEditProg(item)}>✏️</button>
                        <button type="button" className="btn btn-xs btn-d" title="حذف" onClick={() => delProg(item.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: GOALS BANK EXPLORER */}
      {subTab === 'bank' && (
        <div>
          <div className="card" style={{ marginBottom: 16, background: 'var(--pr-l)', border: '1px solid var(--pr)' }}>
            <h3 style={{ margin: '0 0 6px 0', color: 'var(--pr)' }}>🎯 بنك الأهداف التخصصي للمركز</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', margin: 0 }}>
              يحتوي على مئات الأهداف الإجرائية المقننة والموزعة حسب البرامج العالمية (لوفاس، بورتاج، إيبلز، بيب-3، هيلب) والمجالات النمائية.
              يمكنك ربطها مباشرة بأي خطة فردية (IEP)، أو تخصيص بنك الأهداف الخاص بمركزك.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
            {PROGRAMS.map(prog => (
              <div key={prog.key} className="prog-bank-card" style={{ borderTop: `4px solid ${prog.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: prog.color }}>{prog.label}</h4>
                  <span className="bdg b-bl">{prog.labelEn}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-p btn-sm"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: prog.color,
                      borderColor: prog.color,
                      boxSizing: 'border-box'
                    }}
                    onClick={() => {
                      setSelectedBankProgram(prog.key);
                      setBankManagerOpen(true);
                    }}
                  >
                    🔍 استعراض الأهداف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: BEHAVIOR PLANS (BIP) */}
      {subTab === 'behavior' && (
        <div>
          {filteredBips.length === 0 ? (
            <EmptyState icon="📐" title="لا توجد خطط تعديل سلوك مسجلة" sub="اضغط ➕ خطة تعديل سلوك جديدة لتوثيق السلوكيات والبدائل والاستراتيجيات" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filteredBips.map(bip => (
                <div key={bip.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '.98rem' }}>{bip.title}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--g5)' }}>الطالب: {bip.studentName} · {bip.date}</div>
                    </div>
                    <span className="bdg b-or">خطة سلوك</span>
                  </div>

                  {bip.targetBehaviors && (
                    <div style={{ fontSize: '.82rem', background: 'var(--g0)', padding: '6px 8px', borderRadius: 6 }}>
                      <strong style={{ color: 'var(--err)' }}>السلوك المستهدف:</strong> {bip.targetBehaviors}
                    </div>
                  )}

                  {bip.replacementBehaviors && (
                    <div style={{ fontSize: '.82rem', background: 'var(--ok-l)', padding: '6px 8px', borderRadius: 6, color: 'var(--ok)' }}>
                      <strong>السلوك البديل المقترح:</strong> {bip.replacementBehaviors}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '.78rem' }}>
                    <span style={{ color: 'var(--g5)' }}>الأخصائي: <strong>{bip.specialistName || '—'}</strong></span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {bip.parentPhone && (
                        <button
                          type="button"
                          className="btn btn-xs btn-s"
                          onClick={() => {
                            sendReportToWhatsApp({
                              parentPhone: bip.parentPhone,
                              parentName: bip.parentName,
                              studentName: bip.studentName,
                              reportTitle: bip.title,
                              reportType: 'خطة التدخل السلوكي (BIP)',
                              date: bip.date,
                              summary: `السلوك المستهدف: ${bip.targetBehaviors}\nالسلوك البديل: ${bip.replacementBehaviors}`,
                              recommendations: bip.reinforcementStrategies || bip.notes,
                              specialistName: bip.specialistName,
                              centerName: center?.name,
                            });
                          }}
                        >
                          💬 واتساب
                        </button>
                      )}
                      <button type="button" className="btn btn-xs btn-g" onClick={() => openEditBip(bip)}>✏️</button>
                      <button type="button" className="btn btn-xs btn-d" onClick={() => delBip(bip.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE / EDIT IEP PROGRAM */}
      {progModal && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setProgModal(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: 'min(94vh, calc(100dvh - 20px))', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd modal-header-custom" style={{ padding: '12px 18px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)' }}>📋 {progEditId ? 'تعديل الخطة الفردية (IEP)' : 'إنشاء خطة تربوية / تأهيلية فردية (IEP)'}</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>تحديد الأهداف السلوكية والوسائل المعينة ومواعيد التقييم</span>
              </div>
              <button type="button" className="btn btn-xs btn-p" onClick={() => setProgModal(false)} style={{ fontWeight: 700 }}>✖ إغلاق</button>
            </div>
            <div className="modal-body-scroll" style={{ padding: '16px 18px', flex: 1, overflowY: 'auto' }}>
              <div className="fg c2">
                <StudentPicker form={progForm} setForm={setProgForm} students={students} emps={emps} showExtra />
                <div className="fl full">
                  <label>عنوان الخطة الفردية <span className="req">*</span></label>
                  <input
                    value={progForm.title}
                    onChange={e => setProgForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="مثال: الخطة التربوية الفردية - الفصل الأول..."
                  />
                </div>
                <div className="fl">
                  <label>تاريخ البدء</label>
                  <input type="date" value={progForm.startDate} onChange={e => setProgForm(f => ({ ...f, startDate: e.target.value }))}/>
                </div>
                <div className="fl">
                  <label>تاريخ المراجعة والتقييم</label>
                  <input type="date" value={progForm.reviewDate} onChange={e => setProgForm(f => ({ ...f, reviewDate: e.target.value }))}/>
                </div>
                <div className="fl">
                  <label>المدة الزمنية المقررة</label>
                  <input value={progForm.duration} onChange={e => setProgForm(f => ({ ...f, duration: e.target.value }))} placeholder="مثال: 3 أشهر، 6 أشهر..."/>
                </div>
                <div className="fl">
                  <label>حالة الخطة</label>
                  <select value={progForm.status} onChange={e => setProgForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">نشطة وقيد التطبيق ⏳</option>
                    <option value="completed">مكتملة ومحققة ✅</option>
                    <option value="review">تحت المراجعة 🔍</option>
                  </select>
                </div>
              </div>

              {/* GOALS SECTION */}
              <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: '.96rem' }}>
                    🎯 الأهداف المحددة للخطة ({progForm.goals?.length || 0})
                  </div>
                  <button
                    type="button"
                    className="btn btn-s btn-sm"
                    onClick={() => setGoalPickerOpen(true)}
                  >
                    ➕ اختيار أهداف من بنك الأهداف
                  </button>
                </div>

                {(!progForm.goals || progForm.goals.length === 0) ? (
                  <div style={{ padding: '16px', background: 'var(--g0)', borderRadius: 8, textAlign: 'center', fontSize: '.84rem', color: 'var(--g5)' }}>
                    لم يتم إضافة أهداف للخطة بعد. اضغط «➕ اختيار أهداف من بنك الأهداف» لإدراج أهداف جاهزة أو مخصصة.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {progForm.goals.map((goal, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '.88rem' }}>
                            {idx + 1}. {goal.text}
                          </div>
                          <div style={{ display: 'flex', gap: 8, fontSize: '.74rem', color: 'var(--g5)', marginTop: 4 }}>
                            {goal.code && <span className="bdg b-bl">{goal.code}</span>}
                            <span>المجال: <strong>{domainLabel(goal.domain) || goal.domain || 'عام'}</strong></span>
                            {goal.mastery && <span>الإتقان: {goal.mastery}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs btn-d"
                          onClick={() => removeGoalFromProg(idx)}
                          title="حذف الهدف من الخطة"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="fg c2" style={{ marginTop: 16 }}>
                <div className="fl full">
                  <label>الأنشطة والوسائل التعليمية والتأهيلية</label>
                  <textarea
                    value={progForm.activities}
                    onChange={e => setProgForm(f => ({ ...f, activities: e.target.value }))}
                    rows={3}
                    placeholder="الأدوات المعينة، المعززات، استراتيجيات التدريب والنمذجة..."
                  />
                </div>
                <div className="fl full">
                  <label>ملاحظات إضافية</label>
                  <textarea
                    value={progForm.notes}
                    onChange={e => setProgForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveProg}>💾 حفظ الخطة</button>
              <button type="button" className="btn btn-g" onClick={() => setProgModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT BIP */}
      {bipModal && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setBipModal(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: 'min(94vh, calc(100dvh - 20px))', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd modal-header-custom" style={{ padding: '12px 18px', background: 'var(--err)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '1.4rem' }}>📐</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '1.12rem', fontWeight: 800 }}>
                    {bipEditId ? 'تعديل خطة التدخل السلوكي (BIP)' : 'إنشاء خطة تدخل وتعديل سلوك فردية (BIP)'}
                  </h2>
                  <span style={{ fontSize: '0.74rem', opacity: 0.9 }}>تحليل السلوك، السلوك البديل، وفنيات التدخل الإجرائية</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-xs"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700 }}
                onClick={() => setBipModal(false)}
              >
                ✕ إغلاق
              </button>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px', flex: 1, overflowY: 'auto' }}>
              <div className="fg c2">
                
                {/* 1. Student Info Section */}
                <div className="fl full" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 12 }}>
                  <StudentPicker form={bipForm} setForm={setBipForm} students={students} emps={emps} showExtra />
                </div>

                {/* 2. Basic Fields Section */}
                <div className="fl full">
                  <label style={{ fontWeight: 800 }}>عنوان الخطة السلوكية <span className="req">*</span></label>
                  <input
                    value={bipForm.title}
                    onChange={e => setBipForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="مثال: خطة خفض تكرار سلوك نوبات الغضب وتنمية التواصل اللفظي البديل"
                  />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 800 }}>تاريخ بدء الخطة</label>
                  <input type="date" value={bipForm.date} onChange={e => setBipForm(f => ({ ...f, date: e.target.value }))}/>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 800 }}>تاريخ المراجعة والتقييم</label>
                  <input type="date" value={bipForm.reviewDate} onChange={e => setBipForm(f => ({ ...f, reviewDate: e.target.value }))}/>
                </div>
                
                <div className="fl">
                  <label style={{ fontWeight: 800 }}>حالة الخطة الحالية</label>
                  <select
                    value={bipForm.status || 'active'}
                    onChange={e => setBipForm(f => ({ ...f, status: e.target.value }))}
                    style={{ fontWeight: 'bold' }}
                  >
                    <option value="active">⏳ نشطة وتحت التطبيق</option>
                    <option value="maintenance">🤝 مرحلة التعميم وصيانة السلوك</option>
                    <option value="achieved">✅ تم تعديل السلوك بنجاح</option>
                    <option value="needs_revision">⚠️ بحاجة لتعديل ومراجعة الفنيات</option>
                  </select>
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 800 }}>الطور الحالي للخطة</label>
                  <select
                    value={bipForm.timelinePhase || 'observation'}
                    onChange={e => setBipForm(f => ({ ...f, timelinePhase: e.target.value }))}
                    style={{ fontWeight: 'bold', color: 'var(--pr)' }}
                  >
                    <option value="observation">🔎 الملاحظة والتقييم القبلي</option>
                    <option value="intervention">⚡ التطبيق الفعلي لفنيات التدخل</option>
                    <option value="generalization">🤝 مرحلة التعميم والثبات</option>
                    <option value="followup">📅 المتابعة الدورية وصيانة السلوك</option>
                  </select>
                </div>

                {/* 3. ABC Behavioural Analysis Panel */}
                <div className="fl full" style={{ border: '1px solid var(--err)', background: 'var(--err-l)', borderRadius: 12, padding: 16, marginTop: 12 }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--err)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🧬</span> <span>التحليل العلمي والوظيفي للسلوك (ABC Behavioral Analysis)</span>
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)', marginBottom: 4, display: 'block' }}>
                        1. السلوك المستهدف إجرائياً (Behavior) <span className="req">*</span>
                      </label>
                      <textarea
                        value={bipForm.proceduralBehavior}
                        onChange={e => setBipForm(f => ({ ...f, proceduralBehavior: e.target.value }))}
                        rows={3}
                        placeholder="صف السلوك بشكل دقيق وقابل للقياس (مثال: يقوم الطالب بالصراخ ورمي الأدوات الدراسية على الأرض عندما يطلب منه الكتابة)"
                        style={{ border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)', marginBottom: 4, display: 'block' }}>
                          2. السوابق والمثيرات القبلية (Antecedents)
                        </label>
                        <textarea
                          value={bipForm.antecedents}
                          onChange={e => setBipForm(f => ({ ...f, antecedents: e.target.value }))}
                          rows={3}
                          placeholder="ما يحدث قبل ظهور السلوك مباشرة (مثال: طلب أداء مهمة صعبة، رفض تقديم معزز، ضوضاء عالية)"
                          style={{ border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)', marginBottom: 4, display: 'block' }}>
                          3. العواقب واللواحق والتدابير الحالية (Consequences)
                        </label>
                        <textarea
                          value={bipForm.consequences}
                          onChange={e => setBipForm(f => ({ ...f, consequences: e.target.value }))}
                          rows={3}
                          placeholder="ما يحدث فوراً بعد السلوك (مثال: يتم استبعاد الطالب من الحصة، أو منحه اللعبة لإسكاته)"
                          style={{ border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Behavior Function radio selector */}
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                      4. الوظيفة الافتراضية للسلوك (الدافع المحرك للسلوك)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                      {BEHAVIOR_FUNCTIONS.map(fn => (
                        <label key={fn.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '.78rem', cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: bipForm.behaviorFunction === fn.id ? '2px solid var(--err)' : '1px solid var(--border-color)', background: bipForm.behaviorFunction === fn.id ? 'var(--err-l)' : 'var(--bg-card)', margin: 0, transition: 'all 0.2s' }}>
                          <input
                            type="radio"
                            name="behaviorFunction"
                            checked={bipForm.behaviorFunction === fn.id}
                            style={{ marginTop: 2, accentColor: 'var(--err)' }}
                            onChange={() => setBipForm(f => ({ ...f, behaviorFunction: fn.id }))}
                          />
                          <div>
                            <strong style={{ color: 'var(--text-main)', fontSize: '.78rem' }}>{fn.label}</strong>
                            <div style={{ fontSize: '.68rem', color: 'var(--text-sub)', marginTop: 2 }}>{fn.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Measurement & Diagnostics Panel */}
                <div className="fl full" style={{ border: '1px solid var(--ok)', background: 'var(--ok-l)', borderRadius: 12, padding: 16, marginTop: 12 }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🔎</span> <span>تشخيص وقياس السلوك والخط القاعدي القبلي</span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 14 }}>
                    <div className="fl full" style={{ margin: 0 }}>
                      <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)' }}>مستوى الخط القاعدي القبلي (القياس قبل التدخل)</label>
                      <input
                        value={bipForm.baselineLevel}
                        onChange={e => setBipForm(f => ({ ...f, baselineLevel: e.target.value }))}
                        placeholder="مثال: يكرر السلوك ١٥ مرة يومياً / مدة السلوك تستمر لـ ١٠ دقائق"
                        style={{ border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                      طريقة القياس والملاحظة المعتمدة بالخطة
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                      {OBSERVATION_METHODS.map(obs => (
                        <label key={obs.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '.78rem', cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: bipForm.observationMethod === obs.id ? '2px solid var(--ok)' : '1px solid var(--border-color)', background: bipForm.observationMethod === obs.id ? 'var(--ok-l)' : 'var(--bg-card)', margin: 0, transition: 'all 0.2s' }}>
                          <input
                            type="radio"
                            name="observationMethod"
                            checked={bipForm.observationMethod === obs.id}
                            style={{ marginTop: 2, accentColor: 'var(--ok)' }}
                            onChange={() => setBipForm(f => ({ ...f, observationMethod: obs.id }))}
                          />
                          <div>
                            <strong style={{ color: 'var(--text-main)', fontSize: '.78rem' }}>{obs.label}</strong>
                            <div style={{ fontSize: '.68rem', color: 'var(--text-sub)', marginTop: 2 }}>{obs.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Graphing & Tracking Points Section */}
                <div className="fl full" style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, background: 'var(--g0)', marginTop: 12 }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--pr)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📈</span> <span>رصد نقاط القياس والتتبع (الرسم البياني لتطور السلوك)</span>
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {(bipForm.trackingPoints || []).map((pt, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', minWidth: 100, flex: '1 1 100px' }}>
                          <label style={{ fontSize: '.7rem', color: 'var(--g5)', margin: 0 }}>الأسبوع / جلسة القياس</label>
                          <input
                            style={{ fontSize: '.78rem', padding: '4px 6px', width: '100%', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                            value={pt.date}
                            placeholder="مثال: أسبوع 1"
                            onChange={e => {
                              const copy = [...(bipForm.trackingPoints || [])];
                              copy[idx].date = e.target.value;
                              setBipForm(f => ({ ...f, trackingPoints: copy }));
                            }}
                          />
                          <label style={{ fontSize: '.7rem', color: 'var(--g5)', margin: 0 }}>معدل التكرار/المدة</label>
                          <input
                            type="number"
                            style={{ fontSize: '.78rem', padding: '4px 6px', width: '100%', fontWeight: 'bold', color: 'var(--err)' }}
                            value={pt.value}
                            placeholder="تكرار"
                            onChange={e => {
                              const copy = [...(bipForm.trackingPoints || [])];
                              copy[idx].value = Number(e.target.value);
                              setBipForm(f => ({ ...f, trackingPoints: copy }));
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = (bipForm.trackingPoints || []).filter((_, i) => i !== idx);
                              setBipForm(f => ({ ...f, trackingPoints: copy }));
                            }}
                            style={{
                              position: 'absolute',
                              top: -6,
                              left: -6,
                              background: 'var(--err)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 18,
                              height: 18,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '.65rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-g btn-xs"
                        onClick={() => {
                          const copy = [...(bipForm.trackingPoints || [])];
                          const nextNum = copy.length + 1;
                          copy.push({ date: `أسبوع ${nextNum}`, value: 5 });
                          setBipForm(f => ({ ...f, trackingPoints: copy }));
                        }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 100, flex: '1 1 100px', border: '1px dashed var(--pr)', background: 'var(--bg-card)' }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>➕</span>
                        <span style={{ fontSize: '.75rem', fontWeight: 'bold' }}>أضف نقطة تتبع</span>
                      </button>
                    </div>

                    {/* Chart preview */}
                    {bipForm.trackingPoints && bipForm.trackingPoints.length > 0 && renderBipChart(bipForm.trackingPoints)}
                  </div>
                </div>

                {/* 6. Interventions & Replacement Behaviour Panel */}
                <div className="fl full" style={{ border: '1px solid var(--cyan)', background: 'var(--cyan-l)', borderRadius: 12, padding: 16, marginTop: 12 }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '.95rem', fontWeight: 800, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🎯</span> <span>فنيات التدخل المطبقة وتدريب السلوك البديل</span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)', marginBottom: 4, display: 'block' }}>
                        السلوك البديل الإيجابي المقترح والمقبول وظيفياً (Alternative Replacement Behavior)
                      </label>
                      <textarea
                        value={bipForm.replacementBehaviors}
                        onChange={e => setBipForm(f => ({ ...f, replacementBehaviors: e.target.value }))}
                        rows={2}
                        placeholder="مثال: تدريب الطالب على رفع البطاقة الحمراء أو استخدام نظام بيكس (PECS) لطلب الراحة بدلاً من الصراخ والرمي"
                        style={{ border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                      />
                    </div>
                  </div>

                  {/* Checkbox checklist of techniques */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                      فنيات وإجراءات تعديل السلوك المطبقة بالخطة (حدد كل ما يطبق)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 14, borderRadius: 10 }}>
                      {BEHAVIOR_TECHNIQUES.map(tech => {
                        const isChecked = (bipForm.interventionTechniques || []).includes(tech.id);
                        return (
                          <label key={tech.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '.78rem', cursor: 'pointer', margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--cyan)' }}
                              onChange={e => {
                                let copy = [...(bipForm.interventionTechniques || [])];
                                if (e.target.checked) {
                                  if (!copy.includes(tech.id)) copy.push(tech.id);
                                } else {
                                  copy = copy.filter(id => id !== tech.id);
                                }
                                setBipForm(f => ({ ...f, interventionTechniques: copy }));
                              }}
                            />
                            <div>
                              <strong style={{ color: 'var(--text-main)', display: 'block' }}>{tech.label}</strong>
                              <span style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>{tech.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)', marginBottom: 4, display: 'block' }}>
                      تفاصيل إجراءات التدخل واستراتيجيات تعزيز السلوك البديل
                    </label>
                    <textarea
                      value={bipForm.reinforcementStrategies}
                      onChange={e => setBipForm(f => ({ ...f, reinforcementStrategies: e.target.value }))}
                      rows={3}
                      placeholder="صف بالتفصيل كيف سيتم تعزيز الطالب، نوع المعززات، جدول التعزيز (مستمر/متقطع)، وكيفية إدارة نوبة السلوك في حال حدوثها..."
                      style={{ border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                {/* 7. Additional Notes */}
                <div className="fl full" style={{ marginTop: 12 }}>
                  <label style={{ fontWeight: 800 }}>ملاحظات وتوجيهات أخصائي تعديل السلوك</label>
                  <textarea
                    value={bipForm.notes}
                    onChange={e => setBipForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    placeholder="ملاحظات حول تعميم الخطة مع الأسرة، توصيات التثبيت، إلخ..."
                  />
                </div>

              </div>
            </div>
            <div className="fa" style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={saveBip} style={{ background: 'var(--err)', border: 'none' }}>💾 حفظ خطة السلوك المعتمدة</button>
              <button type="button" className="btn btn-g" onClick={() => setBipModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW IEP PROGRAM DETAIL (Comprehensive Program Card View) */}
      {viewProg && (
        <ProgramDetailModal
          program={viewProg}
          onClose={() => setViewProg(null)}
          onUpdate={(updatedProg) => {
            setPrograms(lsGet('progPrograms') || []);
            setViewProg(updatedProg);
          }}
          onPrint={(prog) => printIEP(prog)}
          onEdit={(prog) => {
            openEditProg(prog);
            setViewProg(null);
          }}
        />
      )}

      {/* MODAL: GOAL PICKER */}
      {goalPickerOpen && (
        <GoalPickerModal
          onSelect={handleGoalsSelected}
          onClose={() => setGoalPickerOpen(false)}
        />
      )}

      {/* MODAL: GOALS BANK MANAGER */}
      {bankManagerOpen && (
        <GoalsBankManagerModal
          defaultProgram={selectedBankProgram}
          onClose={() => {
            setBankManagerOpen(false);
            reload();
          }}
        />
      )}

      {/* MODAL: BULK IMPORTER */}
      {bulkImporterOpen && (
        <BulkImporter
          onClose={() => {
            setBulkImporterOpen(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
