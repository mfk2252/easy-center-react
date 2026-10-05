import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';

export const THEME_PALETTES = {
  amber: {
    name: 'amber',
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
    primary: '#d97706',
    dark: '#b45309',
    light: '#fffbeb',
    border: '#fde68a',
    badgeBg: '#78350f',
    badgeText: '#fef3c7',
    badgeClass: 'b-or',
    accentText: '#92400e',
  },
  emerald: {
    name: 'emerald',
    gradient: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
    primary: '#059669',
    dark: '#047857',
    light: '#ecfdf5',
    border: '#a7f3d0',
    badgeBg: '#064e3b',
    badgeText: '#d1fae5',
    badgeClass: 'b-gr',
    accentText: '#065f46',
  },
  teal: {
    name: 'teal',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
    primary: '#0d9488',
    dark: '#0f766e',
    light: '#f0fdfa',
    border: '#99f6e4',
    badgeBg: '#134e4a',
    badgeText: '#ccfbf1',
    badgeClass: 'b-bl',
    accentText: '#115e59',
  },
  violet: {
    name: 'violet',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)',
    primary: '#7c3aed',
    dark: '#6d28d9',
    light: '#f5f3ff',
    border: '#ddd6fe',
    badgeBg: '#4c1d95',
    badgeText: '#ede9fe',
    badgeClass: 'b-pu',
    accentText: '#5b21b6',
  },
  rose: {
    name: 'rose',
    gradient: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
    primary: '#e11d48',
    dark: '#be123c',
    light: '#fff1f2',
    border: '#fecdd3',
    badgeBg: '#881337',
    badgeText: '#ffe4e6',
    badgeClass: 'b-rd',
    accentText: '#9f1239',
  },
  sky: {
    name: 'sky',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)',
    primary: '#0284c7',
    dark: '#0369a1',
    light: '#f0f9ff',
    border: '#bae6fd',
    badgeBg: '#0c4a6e',
    badgeText: '#e0f2fe',
    badgeClass: 'b-bl',
    accentText: '#075985',
  },
};

export const DEFAULT_RESPONSE_OPTIONS = [
  { value: 0, label: '0 - لا ينطبق أبداً', description: 'السلوك غير موجود أو لا يظهر إطلاقاً', color: '#059669' },
  { value: 1, label: '1 - نادراً / أحياناً', description: 'يظهر بصورة متقطعة أو طفيفة', color: '#0284c7' },
  { value: 2, label: '2 - غالباً / متكرر', description: 'يظهر بوضوح وبصورة متكررة', color: '#ea580c' },
  { value: 3, label: '3 - دائماً / شديد', description: 'يظهر بصورة دائمة أو يعيق الأداء العام', color: '#dc2626' },
];

/**
 * UniversalAssessmentModal (المكون المعياري الشامل للمقاييس التشخيصية)
 * يضمن توحيد التصميم والهيكلة والتفاعل لجميع مقاييس منظومة Easy Center.
 */
export default function UniversalAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  onSave,
  scaleConfig,
  themeColor: overrideThemeColor,
  scoringEngine,
  userResponses: externalResponses,
  onResponseChange: externalOnResponseChange,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast, currentUser } = useApp();
  const modalScrollBodyRef = useRef(null);

  // Resolution of scale metadata
  const config = useMemo(() => scaleConfig || {}, [scaleConfig]);
  const scaleId = config.id || 'assessment_scale';
  const scaleTitle = config.title || config.name || 'المقياس التشخيصي المعتمد';
  const scaleTitleEn = config.titleEn || config.nameEn || '';
  const scaleIcon = config.icon || '📘';
  const scaleCategoryName = config.categoryName || config.category || 'تشخيص مقنن';
  
  // Theme resolution
  const activeThemeKey = overrideThemeColor || config.themeColor || 'amber';
  const theme = THEME_PALETTES[activeThemeKey] || THEME_PALETTES.amber;

  // Subscales / Domains and Items resolution
  const domains = useMemo(() => {
    return config.subscales || config.domains || [
      { id: 'general', name: 'البنود العامة', code: 'GEN', color: theme.primary, itemsCount: (config.items || []).length }
    ];
  }, [config.subscales, config.domains, config.items, theme.primary]);

  const items = useMemo(() => {
    return (config.items || []).map((it, idx) => ({
      ...it,
      id: it.id !== undefined ? it.id : (idx + 1),
      domainId: it.subscaleId || it.domainId || 'general',
      targetExample: it.targetExample || it.example || it.operationalTarget || '',
    }));
  }, [config.items]);

  const defaultOptions = config.options || config.responseOptions || DEFAULT_RESPONSE_OPTIONS;

  // Copyright and metadata
  const copyright = useMemo(() => {
    return {
      authorAr: config.author || config.authorAr || 'الجمعية الأمريكية للقياس والتشخيص',
      authorEn: config.authorEn || '',
      publisherAr: config.publisher || config.publisherAr || 'الهيئة العالمية للمقاييس النفسية والتربوية',
      targetAge: config.targetAge || 'جميع الفئات العمرية المعتمدة بالدليل',
      standardsReference: config.standardsReference || 'DSM-5 / ICD-11 Standardized Assessment Battery',
      notice: config.notice || 'أداة تشخيصية وسيكومترية معتمدة لتحديد مستوى الأداء الحالي وإعداد البرامج التربوية الفردية (IEP).',
      disclaimer: config.disclaimer || 'يقتصر تطبيق هذا المقياس على الأخصائيين المعتمدين والمؤهلين إكلينيكياً وتربوياً.',
    };
  }, [config]);

  // Form State
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        mode: initialData.mode || (initialData.stuId ? 'registered' : 'other'),
        stuId: initialData.stuId || '',
        studentName: initialData.studentName || '',
        dob: initialData.dob || '',
        age: initialData.age || '',
        diagnosis: initialData.diagnosis || '',
        grade: initialData.grade || '',
        school: initialData.school || '',
        raterName: initialData.raterName || '',
        raterRelation: initialData.raterRelation || '',
        examinerName: initialData.examinerName || currentUser?.name || '',
        date: initialData.date || todayStr(),
        notes: initialData.notes || '',
        itemNotes: initialData.itemNotes || {},
        scores: initialData.results || initialData.scores || initialData.answers || {},
        clinicalSummary: initialData.clinicalSummary || initialData.summary || '',
        recommendations: initialData.recommendations || '',
      };
    }
    return {
      mode: 'registered',
      stuId: '',
      studentName: '',
      dob: '',
      age: '',
      diagnosis: '',
      grade: '',
      school: '',
      raterName: '',
      raterRelation: '',
      examinerName: currentUser?.name || '',
      date: todayStr(),
      notes: '',
      itemNotes: {},
      scores: {},
      clinicalSummary: '',
      recommendations: '',
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Sync external user responses if controlled
  const effectiveScores = externalResponses !== undefined ? externalResponses : form.scores;

  function handleSelectStudent(e) {
    const val = e.target.value;
    if (val === '__other__') {
      setForm(f => ({
        ...f,
        mode: 'other',
        stuId: '',
        studentName: '',
        dob: '',
        age: '',
        diagnosis: '',
        grade: '',
        school: '',
      }));
      return;
    }
    const stu = students.find(s => s.id === val);
    if (!stu) {
      setForm(f => ({ ...f, mode: 'registered', stuId: '', studentName: '' }));
      return;
    }

    const calculatedAge = stu.dob ? calcAge(stu.dob) : '';
    setForm(f => ({
      ...f,
      mode: 'registered',
      stuId: stu.id,
      studentName: stu.name || '',
      dob: stu.dob || '',
      diagnosis: stu.diagnosis || '',
      age: calculatedAge || stu.age || '',
      grade: stu.grade || stu.className || '',
      school: stu.school || stu.schoolName || '',
    }));
  }

  // Pure Scoring Engine Execution (Strategy Pattern)
  const psychometrics = useMemo(() => {
    const calcFn = scoringEngine || config.calculateScore;
    const answeredCount = Object.keys(effectiveScores || {}).filter(k => effectiveScores[k] !== undefined && effectiveScores[k] !== null).length;
    const totalCount = items.length;

    // Neutral Zero-State fallback when no responses yet
    if (answeredCount === 0) {
      return {
        totalAnswered: 0,
        totalItems: totalCount,
        completionPercentage: 0,
        severityKey: 'unassessed',
        severityLabel: 'في انتظار البدء بالتقييم...',
        severityColor: 'var(--text-sub)',
        isZeroState: true,
        metrics: [
          { label: 'حالة التقييم', value: 'لم يبدأ بعد', sub: 'يرجى رصد إجابات البنود', color: 'var(--text-sub)' },
          { label: 'إجمالي البنود', value: totalCount, sub: `${domains.length} مجالات فرعية`, color: theme.primary },
          { label: 'نسبة الإنجاز', value: '0%', sub: '0 بند مجاب', color: 'var(--text-sub)' },
        ],
        subscaleResults: domains.map(dom => ({
          id: dom.id,
          name: dom.name,
          answeredCount: 0,
          totalCount: items.filter(it => it.domainId === dom.id).length || dom.itemsCount || 0,
        })),
        summary: 'في انتظار البدء بالتقييم - يرجى تحديد إجابات البنود لحساب المؤشرات النمائية والتشخيصية.',
        recommendations: 'سيتم توليد التوصيات التربوية تلقائياً بمجرد إدخال درجات المقياس.',
      };
    }

    if (typeof calcFn === 'function') {
      try {
        const result = calcFn(effectiveScores, { items, domains, student: form });
        const pct = result.completionPercentage !== undefined
          ? result.completionPercentage
          : (totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0);

        return {
          ...result,
          totalAnswered: result.totalAnswered || answeredCount,
          totalItems: result.totalItems || totalCount,
          completionPercentage: pct,
          isZeroState: false,
          severityColor: result.severityColor || (pct === 100 ? 'var(--ok)' : theme.primary),
        };
      } catch (err) {
        console.warn('Scoring engine execution warning:', err);
      }
    }

    // Default universal scoring strategy if no custom engine provided
    let sumRaw = 0;
    Object.values(effectiveScores || {}).forEach(v => {
      const num = Number(v);
      if (!isNaN(num)) sumRaw += num;
    });

    const completionPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
    
    return {
      totalAnswered: answeredCount,
      totalItems: totalCount,
      completionPercentage: completionPct,
      totalRawScore: sumRaw,
      isZeroState: false,
      severityKey: completionPct === 100 ? 'completed' : 'in_progress',
      severityLabel: completionPct === 100 ? 'مكتمل الرصد' : 'قيد التطبيق',
      severityColor: completionPct === 100 ? 'var(--ok)' : theme.primary,
      metrics: [
        { label: 'الدرجة الخام الكلية', value: sumRaw, sub: `من ${totalCount * 3}`, color: theme.primary },
        { label: 'البنود المكتملة', value: `${answeredCount} / ${totalCount}`, sub: `${completionPct}%`, color: 'var(--text-main)' },
        { label: 'الحالة الإكلينيكية', value: completionPct === 100 ? 'مكتمل' : 'قيد الرصد', sub: 'جاهز للاعتماد', color: completionPct === 100 ? 'var(--ok)' : theme.primary },
      ],
      subscaleResults: domains.map(dom => {
        const domItems = items.filter(it => it.domainId === dom.id);
        const domAnswered = domItems.filter(it => effectiveScores[it.id] !== undefined).length;
        return {
          id: dom.id,
          name: dom.name,
          answeredCount: domAnswered,
          totalCount: domItems.length,
        };
      }),
      summary: `تم تقييم الطالب على ${scaleTitle}؛ وبلغ مجموع الدرجات الخام الملاحظة (${sumRaw}) بنسبة إنجاز (${completionPct}%).`,
      recommendations: 'يوصى بمتابعة الأداء وإدراج المهارات ذات الدرجات المنخفضة ضمن الخطة التربوية الفردية (IEP).',
    };
  }, [scoringEngine, config, effectiveScores, items, domains, form, theme.primary, scaleTitle]);

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return items;
    return items.filter(it => it.domainId === activeDomainFilter);
  }, [activeDomainFilter, items]);

  function handleScoreSelect(itemId, scoreValue) {
    const updated = {
      ...form.scores,
      [itemId]: scoreValue,
    };
    setForm(prev => ({
      ...prev,
      scores: updated,
    }));
    if (externalOnResponseChange) {
      externalOnResponseChange(itemId, scoreValue, updated);
    }
  }

  function handleItemNoteChange(itemId, noteText) {
    setForm(prev => ({
      ...prev,
      itemNotes: {
        ...prev.itemNotes,
        [itemId]: noteText,
      },
    }));
  }

  function autoFillSample(presetLevel = 'moderate') {
    const newScores = {};
    items.forEach((it, idx) => {
      if (presetLevel === 'mild') {
        newScores[it.id] = (idx % 3 === 0) ? 1 : 0;
      } else if (presetLevel === 'moderate') {
        newScores[it.id] = (idx % 4 === 0) ? 2 : (idx % 2 === 0 ? 1 : 0);
      } else if (presetLevel === 'severe') {
        newScores[it.id] = (idx % 3 === 0) ? 2 : 3;
      } else {
        newScores[it.id] = 0;
      }
    });

    setForm(prev => ({
      ...prev,
      scores: newScores,
    }));
    if (externalOnResponseChange) {
      Object.entries(newScores).forEach(([k, v]) => {
        externalOnResponseChange(k, v, newScores);
      });
    }
    toast('⚡ تم تعبئة نموذج تطبيقي افتراضي بنجاح', 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.isZeroState) {
      toast('⚠️ يرجى رصد إجابات بعض البنود أولاً لتوليد التقرير', 'er');
      return;
    }
    const sumText = psychometrics.summary || psychometrics.clinicalSummary || `تم إجراء التقييم على ${scaleTitle} وحقق المفحوص درجة (${psychometrics.totalRawScore || 0}) بنسبة (${psychometrics.completionPercentage || 0}%).`;
    const recText = psychometrics.recommendations || 'يوصى بالتركيز على مجالات القوة وتدعيم المهارات السلوكية والتكيفية غير المتقنة وفق خطة عمل دورية.';

    setForm(f => ({
      ...f,
      clinicalSummary: sumText,
      recommendations: recText,
    }));
    toast('✨ تم توليد التقرير السيكومتري والتوصيات آلياً', 'ok');
  }

  function handleSave() {
    if (!form.studentName.trim()) {
      toast('⚠️ يرجى تحديد الطالب أو إدخال اسم المستفيد أولاً', 'er');
      return;
    }

    const answeredCount = Object.keys(effectiveScores || {}).length;
    if (answeredCount === 0) {
      toast('⚠️ لم يتم رصد أي استجابة على بنود المقياس بعد', 'er');
      return;
    }

    const payload = {
      measureId: scaleId,
      scaleId: scaleId,
      scaleType: scaleId,
      scaleName: scaleTitle,
      category: config.category || 'assessments',
      mode: form.mode,
      stuId: form.stuId || '',
      studentName: form.studentName.trim(),
      dob: form.dob,
      age: form.age,
      diagnosis: form.diagnosis,
      grade: form.grade,
      school: form.school,
      raterName: form.raterName,
      raterRelation: form.raterRelation,
      examinerName: form.examinerName,
      date: form.date || todayStr(),
      notes: form.notes,
      itemNotes: form.itemNotes,
      scores: effectiveScores,
      answers: effectiveScores,
      results: effectiveScores,
      score: psychometrics.standardScore || psychometrics.totalRawScore || 0,
      rawScore: psychometrics.totalRawScore || 0,
      standardScore: psychometrics.standardScore || null,
      percentile: psychometrics.percentile || null,
      severityLevel: psychometrics.severityLabel || psychometrics.severityKey || 'مكتمل',
      psychometrics: psychometrics,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      updatedAt: new Date().toISOString(),
    };

    if (onSave) {
      onSave(payload);
    } else if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast(`✅ تم تحديث تطبيق مقياس (${scaleTitle}) بنجاح`, 'ok');
    } else {
      const newId = uid();
      lsAdd('studentAssessments', {
        ...payload,
        id: newId,
        createdAt: new Date().toISOString(),
      });
      toast(`✅ تم حفظ تطبيق مقياس (${scaleTitle}) بنجاح`, 'ok');
    }

    if (onSaved) onSaved(payload);
    onClose();
  }

  function handleSafeClose() {
    const answeredCount = Object.keys(effectiveScores || {}).length;
    if (answeredCount > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${answeredCount}) بنداً في المقياس. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && handleSafeClose()}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          borderRadius: 16,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* 1. Modal Main Header with Dynamic Palette */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: theme.gradient,
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>{scaleIcon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  {scaleTitle}
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  {items.length} بنداً تشخيصياً · {domains.length} مجالات فرعية
                </span>
                <span className="bdg" style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.68rem', fontWeight: 600 }}>
                  {scaleCategoryName}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: theme.badgeBg, color: theme.badgeText, fontSize: '0.68rem', fontWeight: 800 }}>
                  © {copyright.authorAr}
                </span>
                {scaleTitleEn && (
                  <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                    {scaleTitleEn}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setShowCopyrightDetails(s => !s)}
              style={{
                background: showCopyrightDetails ? '#fff' : 'rgba(255,255,255,0.2)',
                color: showCopyrightDetails ? theme.dark : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق المقياس' : 'الاعتماد العلمي وحقوق الملكية'}
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleSafeClose}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700 }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* EXPANDABLE DETAILED COPYRIGHT & SCIENTIFIC ACCREDITATION */}
        {showCopyrightDetails && (
          <div
            style={{
              background: theme.light,
              padding: '14px 20px',
              borderBottom: `2px solid ${theme.border}`,
              fontSize: '0.82rem',
              color: theme.accentText,
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس {scaleTitle}:
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>المرجعية العلمية:</strong> {scaleTitle} — إعداد: {copyright.authorAr} {copyright.authorEn ? `(${copyright.authorEn})` : ''} · {copyright.publisherAr}.
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#fff', padding: '3px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, fontWeight: 700 }}>
                مخصص للتشخيص والتقييم الإكلينيكي المعتمد
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.border}` }}>
                <strong>الفئة المستهدفة:</strong> {copyright.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.border}` }}>
                <strong>المرجعية التشخيصية:</strong> {copyright.standardsReference}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: 8 }}>
              {copyright.notice}
              <br />
              <strong>{copyright.disclaimer}</strong>
            </div>
          </div>
        )}

        {/* 2. Real-time Psychometrics & Clinical Metrics Strip */}
        <div
          className="modal-subbar"
          style={{
            background: 'var(--g0)',
            padding: '10px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Neutral Zero-State Display vs Calculated Dynamic Metrics */}
            {psychometrics.isZeroState ? (
              <div
                style={{
                  background: 'var(--bg-card)',
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>⏱️</span>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                    في انتظار البدء بالتقييم
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>
                    حدد إجابات البنود أدناه لحساب الدرجات والمؤشرات السيكومترية تلقائياً
                  </span>
                </div>
              </div>
            ) : (
              psychometrics.metrics && psychometrics.metrics.length > 0 ? (
                psychometrics.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-card)',
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: idx === 0 ? `1.5px solid ${theme.primary}` : '1px solid var(--border-color)',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>
                      {m.label}:
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: m.color || theme.primary }}>
                      {m.value}
                    </span>
                    {m.sub && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                        ({m.sub})
                      </span>
                    )}
                  </div>
                ))
              ) : (
                /* Fallback standard metric cards */
                <>
                  <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${theme.primary}`, textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الكلية:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: psychometrics.severityColor }}>
                      {psychometrics.totalRawScore || 0}
                    </span>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>التصنيف:</span>
                    <span className="bdg" style={{ background: `${theme.primary}18`, color: theme.primary, fontWeight: 800, fontSize: '0.78rem' }}>
                      {psychometrics.severityLabel || 'قيد التطبيق'}
                    </span>
                  </div>
                </>
              )
            )}

            {/* Diagnostic Result Badge */}
            {!psychometrics.isZeroState && psychometrics.severityLabel && (
              <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>النتيجة الكلينيكية:</span>
                <span
                  className="bdg"
                  style={{
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    background: `${psychometrics.severityColor}18`,
                    color: psychometrics.severityColor,
                    border: `1px solid ${psychometrics.severityColor}35`,
                  }}
                >
                  {psychometrics.severityLabel}
                </span>
              </div>
            )}

            {/* Progress Counter & Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {psychometrics.totalAnswered} / {psychometrics.totalItems} بنداً
              </span>
              <div style={{ width: 60, height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${psychometrics.completionPercentage}%`,
                    height: '100%',
                    background: psychometrics.completionPercentage === 100 ? 'var(--ok)' : theme.primary,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Scrollable Form Body */}
        <div ref={modalScrollBodyRef} className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          
          {/* Student & Assessment Information Card (Collapsible) */}
          <div
            style={{
              background: 'var(--g0)',
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 14,
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isHeaderCollapsed ? 0 : 8,
              }}
            >
              <div
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: theme.dark,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>👦</span>
                <span>بيانات المفحوص والفحص الإكلينيكي</span>
                {form.studentName && (
                  <span
                    style={{
                      fontSize: '0.76rem',
                      background: `${theme.primary}18`,
                      color: theme.dark,
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontWeight: 700,
                    }}
                  >
                    {form.studentName}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsManualEdit(prev => !prev)}
                  className="btn btn-xs btn-g"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', height: 24 }}
                  title="تفعيل التعديل اليدوي على البيانات المجلوبة تلقائياً"
                >
                  {isManualEdit ? '🔒 قفل التعديل' : '✏️ تعديل يدوي'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsHeaderCollapsed(prev => !prev)}
                  className="btn btn-xs btn-g"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', height: 24, fontWeight: 700 }}
                >
                  {isHeaderCollapsed ? '⬇️ إظهار التفاصيل' : '⬆️ إخفاء التفاصيل'}
                </button>
              </div>
            </div>

            {!isHeaderCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {form.mode === 'other' && (
                  <div style={{ marginBottom: 4 }}>
                    <div className="fl full">
                      <label style={{ fontSize: '0.76rem', marginBottom: 2 }}>اسم المستفيد الخارجي <span className="req">*</span></label>
                      <input
                        style={{ height: 32, fontSize: '0.82rem' }}
                        value={form.studentName || ''}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                        placeholder="اكتب اسم الطالب / المستفيد..."
                      />
                    </div>
                  </div>
                )}

                {/* ROW 1: Essentials */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الطالب المسجل <span className="req">*</span></label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">— اختر من الطلاب المسجلين بالمركز —</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                      <option value="__other__">➕ مستفيد خارجي (غير مسجل)</option>
                    </select>
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>العمر الزمني</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.age || (form.dob ? calcAge(form.dob) : '')}
                      readOnly={!isManualEdit}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                      placeholder="تلقائي حسب تاريخ الميلاد"
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>التشخيص الطبي / التربوي</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.diagnosis || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="التشخيص المعتمد..."
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>تاريخ التقييم</label>
                    <input
                      type="date"
                      dir="ltr"
                      style={{ height: 32, fontSize: '0.82rem', textAlign: 'right', padding: '2px 8px' }}
                      value={form.date || todayStr()}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* ROW 2: Respondent and Role */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الأخصائي الفاحص</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم الأخصائي الفاحص"
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستجيب (معلم / ولي أمر)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم المستجيب على المقياس"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الصف / المستوى الدراسي</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      type="text"
                      placeholder="مثال: مرحلة التدخل المبكر / الصف الثاني"
                      value={form.grade || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صلة القرابة / الصفة</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="معلم تربية خاصة، ولي الأمر، أخصائي..."
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Subscale Navigation Tabs & Filter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📑 بنود المقاييس والأبعاد الفرعية:
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-sub)' }}>
                اختر الدرجة المناسبة لكل بند وفق الملاحظة الإكلينيكية المباشرة
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع البنود ({items.length})
              </button>
              {domains.map(dom => {
                const domStat = (psychometrics.subscaleResults || []).find(d => d.id === dom.id);
                const domItemsCount = items.filter(it => it.domainId === dom.id).length || dom.itemsCount || 0;
                const domColor = dom.color || theme.primary;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    className={`tab ${activeDomainFilter === dom.id ? 'on' : ''}`}
                    onClick={() => setActiveDomainFilter(dom.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${domColor}`,
                    }}
                  >
                    {dom.icon || '📌'} {dom.name.split(' ')[0]} ({domStat?.answeredCount || 0}/{domItemsCount})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Standardized Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const domain = domains.find(d => d.id === item.domainId) || { name: 'عام', code: 'GEN', color: theme.primary };
              const currentScore = effectiveScores[item.id];
              const currentNote = form.itemNotes[item.id] || '';
              const itemOptions = item.options || defaultOptions;

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined ? `1.5px solid ${domain.color || theme.primary}` : '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <span
                        style={{
                          background: domain.color || theme.primary,
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        #{item.id} · {domain.code || domain.name.slice(0, 4)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.45 }}>
                          {item.text}
                        </div>
                        {/* Prominent Operational Target Box */}
                        {item.targetExample && (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-sub)',
                              marginTop: 6,
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 6,
                              lineHeight: 1.45,
                              background: 'rgba(245, 158, 11, 0.08)',
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                            }}
                          >
                            <span style={{ color: '#d97706', fontWeight: 800, flexShrink: 0, fontSize: '0.76rem' }}>
                              💡 الهدف الإجرائي / مثال توضيحي:
                            </span>
                            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                              {item.targetExample}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Standard Rating Scale Buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {itemOptions.map(opt => {
                        const isSelected = currentScore === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleScoreSelect(item.id, opt.value)}
                            className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              fontWeight: isSelected ? 800 : 500,
                              background: isSelected
                                ? (opt.color || (opt.value === 3 ? '#dc2626' : opt.value === 2 ? '#ea580c' : opt.value === 1 ? '#0284c7' : '#059669'))
                                : undefined,
                              color: isSelected ? '#fff' : undefined,
                              border: isSelected ? 'none' : undefined,
                            }}
                            title={opt.description}
                          >
                            {opt.label.split(' - ')[0]} {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Item Behavior Note */}
                  <div style={{ marginTop: 6 }}>
                    <input
                      type="text"
                      placeholder="ملاحظات سلوكية أو تفاصيل إضافية لهذا البند (اختياري)..."
                      value={currentNote}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      style={{
                        fontSize: '0.76rem',
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px dashed var(--border-color)',
                        width: '100%',
                        background: 'var(--g0)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 6. Diagnostic Interpretation & Recommendations Section */}
          <div style={{ background: 'var(--g0)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: theme.dark, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة التشخيصية والتوصيات التربوية المعتمدة
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700 }}
              >
                ✨ إعادة توليد الخلاصة بناءً على الدرجات
              </button>
            </div>

            <div className="fg c1">
              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>التقرير السيكومتري والتشخيص الإكلينيكي</label>
                <textarea
                  rows={5}
                  placeholder={`الخلاصة التشخيصية والوصف النفسي التربوي وفق معايير ${scaleTitle}...`}
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>توصيات الخطة التربوية والتأهيلية الفردية (IEP)</label>
                <textarea
                  rows={4}
                  placeholder="التوصيات العلاجية، الأهداف السلوكية والنمائية ذات الأولوية، واستراتيجيات التدخل..."
                  value={form.recommendations || ''}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7. Modal Sticky Footer Controls */}
        <div
          style={{
            padding: '10px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
              تم الإجابة على <strong>{psychometrics.totalAnswered}</strong> من <strong>{items.length}</strong> بنداً
            </span>
            <span className={`bdg ${psychometrics.completionPercentage === 100 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
              {psychometrics.completionPercentage}% مكتمل
            </span>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 6 }}>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => autoFillSample('moderate')}
                title="تعبئة نموذج افتراضي للتجربة السريعة"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة سريعة
              </button>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, fontSize: '0.74rem' }}
              >
                ✨ توليد التقرير والتوصيات آلياً
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={handleSafeClose}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{
                background: theme.gradient,
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                padding: '8px 20px',
              }}
            >
              💾 حفظ تقييم ({scaleTitle})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
