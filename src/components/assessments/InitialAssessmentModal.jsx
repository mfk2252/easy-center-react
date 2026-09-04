import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import { printHtmlContent } from '../../utils/printUtils';
import { handleFileInputChange, FILE_ACCEPT_IMAGE } from '../../utils/fileUpload';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

export const PROGRAM_DOMAINS = [
  'التربية الخاصة',
  'التدخل المبكر',
  'مرحلة الروضة',
  'صعوبات التعلم',
  'فرط الحركة ونقص الانتباه',
  'تعديل السلوك',
  'التكامل الحسي',
  'التفاعل الاجتماعي',
  'الرعاية الذاتية',
  'التخاطب والنطق',
];

export const EMPTY_INITIAL_EVAL = {
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
  specialistName: '',
  date: todayStr(),
  domain: 'التربية الخاصة',
  photo: '',
  history: '',
  caseHistory: '',
  medicalHistory: '',
  familyHistory: '',
  appliedTools: '',
  toolsNotes: '',
  parentsInterview: '',
  parentsNeeds: '',
  observationSessions: '',
  strengths: '',
  weaknesses: '',
  summary: '',
  recommendations: '',
  interventionLevel: 'متوسط',
};

const SECTIONS_CONFIG = [
  { id: 'all', name: 'جميع المحاور (6)', icon: '🌐', color: 'slate' },
  { id: 'history', name: 'التاريخ والتطور (3)', icon: '📜', color: 'blue', tag: '#1 - HIST' },
  { id: 'tools', name: 'الأدوات والمقاييس (2)', icon: '🧪', color: 'cyan', tag: '#2 - TOOLS' },
  { id: 'family', name: 'المقابلة الأسرية (2)', icon: '👨‍👩‍👧', color: 'amber', tag: '#3 - FAMILY' },
  { id: 'observation', name: 'الأداء والملاحظة (3)', icon: '👁️', color: 'purple', tag: '#4 - OBS' },
  { id: 'summary', name: 'الخلاصة والتوصيات (2)', icon: '💡', color: 'emerald', tag: '#5 - IEP' },
];

export default function InitialAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast, currentUser, center } = useApp?.() || { toast: () => {}, currentUser: null, center: null };

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_INITIAL_EVAL,
        ...initialData,
        date: initialData.date || todayStr(),
      };
    }
    return {
      ...EMPTY_INITIAL_EVAL,
      specialistName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeSectionFilter, setActiveSectionFilter] = useState('all');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);

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

  async function onPhotoUpload(e) {
    try {
      const res = await handleFileInputChange(e, { imagesOnly: true });
      if (res?.data) {
        setForm(f => ({ ...f, photo: res.data }));
        toast('📸 تم تحميل صورة التقييم بنجاح', 'ok');
      }
    } catch (ex) {
      toast('⚠️ ' + (ex.i18nKey === 'file.tooLarge' ? 'حجم الصورة يتجاوز 2 ميجابايت' : 'نوع الملف غير مدعوم'), 'er');
    }
  }

  // Calculate clinical completion metrics
  const completionMetrics = useMemo(() => {
    let completedCount = 0;
    const totalCount = 12; // 12 key clinical fields

    if (form.stuId || form.studentName) completedCount++;
    if (form.date) completedCount++;
    if (form.caseHistory || form.history) completedCount++;
    if (form.medicalHistory) completedCount++;
    if (form.familyHistory) completedCount++;
    if (form.appliedTools) completedCount++;
    if (form.toolsNotes) completedCount++;
    if (form.parentsInterview) completedCount++;
    if (form.parentsNeeds) completedCount++;
    if (form.strengths) completedCount++;
    if (form.weaknesses) completedCount++;
    if (form.recommendations || form.summary) completedCount++;

    const percent = Math.round((completedCount / totalCount) * 100);

    let readiness = 'قيد التوثيق';
    let readinessColor = 'var(--warn, #f59e0b)';
    if (percent >= 80) {
      readiness = 'جاهز للاعتماد والخطة IEP';
      readinessColor = 'var(--ok, #10b981)';
    } else if (percent >= 40) {
      readiness = 'مكتمل جزئياً';
      readinessColor = '#3b82f6';
    }

    // Recommended intervention level based on weaknesses & history
    let recTier = form.interventionLevel || 'متوسط';
    if ((form.weaknesses?.length || 0) > 120 || (form.summary?.length || 0) > 150) {
      recTier = 'مكثف / فردي';
    } else if ((form.strengths?.length || 0) > 100 && (form.weaknesses?.length || 0) < 60) {
      recTier = 'متابعة وإرشاد';
    }

    return {
      completedCount,
      totalCount,
      percent,
      readiness,
      readinessColor,
      recTier,
    };
  }, [form]);

  if (!isOpen) return null;

  function fillSuggestedDraft() {
    const d = form.domain || 'التربية الخاصة';
    const sName = form.studentName || 'المفحوص';
    setForm(f => ({
      ...f,
      caseHistory: f.caseHistory || f.history || `تم تحويل الحالة (${sName}) للاستشارة والتشخيص الشامل لتحديد جوانب القصور والاحتياج وتصميم البرنامج التأهيلي الملائم.`,
      medicalHistory: f.medicalHistory || 'تاريخ الحمل والولادة طبيعي دون مضاعفات حرجة، اكتمال التطعيمات، سلامة الفحوصات السمعية والبصرية العامة مع حاجة لمتابعة التناسق العضلي الدقيق.',
      familyHistory: f.familyHistory || 'يعيش في بيئة أسرية مستقرة ومتعاونة، ترتيبه الثاني بين إخوته، لا توجد حالات وراثية مماثلة في الأسرة المباشرة.',
      appliedTools: f.appliedTools || '• استمارة المقابلة الإكلينيكية المبدئية الشاملة\n• الملاحظة المباشرة في البيئة الطبيعية الحرة وغرفة الفحص\n• مقاييس السلوك التكيفي والفرز النمائي الأولي',
      toolsNotes: f.toolsNotes || 'أظهر المفحوص استجابة إيجابية للتفاعل القائم على المعززات البصرية والملموسة، مع تشتت ملحوظ عند تقديم أوامر متعددة الخطوات دون تجزئة.',
      parentsInterview: f.parentsInterview || 'أفادت الأسرة بوجود رغبة قوية في تنمية قدرات الطفل الاستقلالية وتحسين التواصل التعبيري والحد من نوبات الغضب الناتجة عن صعوبة التعبير.',
      parentsNeeds: f.parentsNeeds || '1. برنامج إرشاد أسري للتدريب على استراتيجيات التعزيز الإيجابي في المنزل.\n2. استخدام الجداول البصرية لتنظيم الروتين اليومي.\n3. أساليب تعميم المهارات المكتسبة خارج المركز.',
      strengths: f.strengths || '• تواصل بصري جيد عند المناداة باسمه واستخدام المعززات المحببة\n• قدرة جيدة على المطابقة والمهارات الحركية الكبرى\n• دافعية عالية للتعلم عند تبسيط وتوضيح المهام بصرياً',
      weaknesses: f.weaknesses || '• ضعف الاستجابة للأوامر الشفهية المركبة (صعوبة في المعالجة السمعية)\n• تشتت الانتباه بعد 5 دقائق من العمل المستمر\n• حاجة ماسة لتنمية مهارات الرعاية الذاتية والتواصل الوظيفي',
      observationSessions: f.observationSessions || 'لوحظ استمتاعه بالألعاب التركيبية، الميل للعب الفردي مع بداية تقبل المشاركة التناوبية بإشراف مباشر، استجابة جيدة للإشارات البصرية والإيماءات.',
      summary: f.summary || `تشير المؤشرات الإكلينيكية والنمائية إلى احتياج الطالب لبرنامج تدخل فردي شامل في مجال (${d}) يركز على تنمية الانتباه المشترك، التواصل الوظيفي، وتعديل السلوك وتدريب الأسرة.`,
      recommendations: f.recommendations || `1. إلحاق الطالب ببرنامج التدخل المباشر في مجال (${d}) بمعدل 4 جلسات أسبوعياً.\n2. إعداد خطة تربوية وتأهيلية فردية (IEP) تتضمن أهدافاً مرحلية محددة وقابلة للقياس.\n3. تطبيق استراتيجيات التحفيز البصري والتدريس متعدد الحواس وتجزئة التعليمات.\n4. جدولة جلسات إرشاد وتدريب لولي الأمر لضمان استمرارية البرنامج في البيئة المنزلية.`,
      interventionLevel: 'مكثف / فردي',
    }));
    toast('✨ تم توليد مسودة سريرية متكاملة بنجاح — يمكنك مراجعتها وتعديلها', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً أو إدخال اسمه', 'er');
      return;
    }
    if (!form.date) {
      toast('⚠️ يرجى تحديد تاريخ التقييم', 'er');
      return;
    }

    const stu = students.find(s => s.id === form.stuId);
    const resolvedName = form.studentName || stu?.name || '';
    const resolvedAge = form.age || (form.dob ? calcAge(form.dob) : '');

    const payload = {
      ...form,
      studentName: resolvedName,
      age: resolvedAge,
      isUnregistered: form.mode === 'other',
      measureId: 'initial_eval',
      measureName: 'التقييم والتشخيص المبدئي الشامل',
      scaleName: 'التقييم المبدئي الشامل',
      category: 'initial_diagnosis',
      categoryName: 'التقييم المبدئي والشامل',
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('progEvaluations', initialData.id, payload);
      toast('✅ تم تحديث التقييم المبدئي الشامل بنجاح', 'ok');
    } else {
      lsAdd('progEvaluations', {
        ...payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ التقييم المبدئي الشامل بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  function handleSafeClose() {
    if (completionMetrics.completedCount > 2) {
      if (window.confirm('⚠️ تنبيه: تم إدخال بيانات في التقييم المبدئي. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  function printReport() {
    const stu = students.find(s => s.id === form.stuId);
    const resolvedName = form.studentName || stu?.name || 'المفحوص';
    const resolvedAge = form.age || (form.dob ? calcAge(form.dob) : '—');

    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl; line-height: 1.7; color: #1e293b;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="color: #1e3a8a; margin: 0 0 6px; font-size: 20px;">📋 تقرير التقييم والتشخيص المبدئي الشامل</h1>
          <p style="margin: 0; color: #64748b; font-size: 13px;">Comprehensive Initial Clinical Assessment & IEP Diagnostic Profile</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; width: 20%; font-weight: bold;">اسم المفحوص:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; width: 30%; color: #1e3a8a; font-weight: bold;">${resolvedName}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; width: 20%; font-weight: bold;">العمر الزمني:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; width: 30%;">${resolvedAge}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">تاريخ التقييم:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${form.date || '—'}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">المجال المستهدف:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${form.domain || 'التربية الخاصة'}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">التشخيص الطبي / التربوي:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${form.diagnosis || '—'}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">الأخصائي الفاحص:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${form.specialistName || currentUser?.name || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">المستجيب / الصفة:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${form.raterName || 'ولي الأمر'} ${form.raterRelation ? `(${form.raterRelation})` : ''}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">مستوى التدخل المقترح:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #2563eb;">${completionMetrics.recTier}</td>
          </tr>
        </table>

        ${form.photo ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${form.photo}" style="max-height: 120px; border-radius: 8px; border: 1px solid #cbd5e1;" alt="صورة المفحوص"/></div>` : ''}

        ${(form.caseHistory || form.history) ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #1e3a8a; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #2563eb; padding-right: 8px; background: #eff6ff; padding: 4px 8px;">📜 تاريخ الحالة وتاريخ المشكلة</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.caseHistory || form.history}</p>
          </div>
        ` : ''}

        ${form.medicalHistory ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #1e3a8a; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #2563eb; padding-right: 8px; background: #eff6ff; padding: 4px 8px;">🏥 التطور الارتقائي والطبي</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.medicalHistory}</p>
          </div>
        ` : ''}

        ${form.familyHistory ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #1e3a8a; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #2563eb; padding-right: 8px; background: #eff6ff; padding: 4px 8px;">🏡 التاريخ والوضع العائلي</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.familyHistory}</p>
          </div>
        ` : ''}

        ${form.appliedTools ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #0e7490; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #06b6d4; padding-right: 8px; background: #ecfeff; padding: 4px 8px;">🧪 الأدوات والمقاييس المطبقة</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.appliedTools}</p>
          </div>
        ` : ''}

        ${form.toolsNotes ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #0e7490; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #06b6d4; padding-right: 8px; background: #ecfeff; padding: 4px 8px;">📝 مناقشة نتائج الأدوات وظروف التقييم</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.toolsNotes}</p>
          </div>
        ` : ''}

        ${form.parentsInterview ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #b45309; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #f59e0b; padding-right: 8px; background: #fffbeb; padding: 4px 8px;">👨‍👩‍👧 نتائج مقابلة ولي الأمر وملاحظات الأسرة</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.parentsInterview}</p>
          </div>
        ` : ''}

        ${form.parentsNeeds ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #b45309; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #f59e0b; padding-right: 8px; background: #fffbeb; padding: 4px 8px;">🎯 الاحتياجات التدريبية والإرشادية للأسرة</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.parentsNeeds}</p>
          </div>
        ` : ''}

        ${form.strengths ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #047857; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #10b981; padding-right: 8px; background: #ecfdf5; padding: 4px 8px;">💪 نقاط القوة والمهارات الإيجابية المتقنة</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.strengths}</p>
          </div>
        ` : ''}

        ${form.weaknesses ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #b91c1c; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #ef4444; padding-right: 8px; background: #fef2f2; padding: 4px 8px;">⚠️ نقاط الضعف وجوانب القصور والاحتياج</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.weaknesses}</p>
          </div>
        ` : ''}

        ${form.observationSessions ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #6d28d9; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #8b5cf6; padding-right: 8px; background: #f5f3ff; padding: 4px 8px;">👁️ الملاحظات السلوكية أثناء الجلسات الاستكشافية</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px;">${form.observationSessions}</p>
          </div>
        ` : ''}

        ${form.summary ? `
          <div style="margin-bottom: 16px;">
            <h3 style="color: #1e3a8a; font-size: 14px; margin: 0 0 6px; border-right: 4px solid #2563eb; padding-right: 8px; background: #eff6ff; padding: 4px 8px;">📌 الخلاصة ومستوى الأداء الحالي</h3>
            <p style="white-space: pre-wrap; margin: 0; padding: 8px 12px; font-size: 13px; font-weight: 500;">${form.summary}</p>
          </div>
        ` : ''}

        ${form.recommendations ? `
          <div style="margin-bottom: 24px; border: 1.5px solid #2563eb; border-radius: 8px; overflow: hidden;">
            <h3 style="color: #fff; font-size: 14px; margin: 0; background: #2563eb; padding: 8px 12px;">💡 التوصيات وأهداف الخطة التربوية الفردية المقترحة (IEP Objectives)</h3>
            <div style="white-space: pre-wrap; margin: 0; padding: 12px; font-size: 13px; background: #f8fafc; font-weight: 600; line-height: 1.8;">${form.recommendations}</div>
          </div>
        ` : ''}

        <div style="margin-top: 36px; display: flex; justify-content: space-between; border-top: 1px dashed #94a3b8; padding-top: 16px; font-size: 13px;">
          <div><b>الأخصائي الفاحص:</b> ${form.specialistName || currentUser?.name || '________________'}</div>
          <div><b>التوقيع:</b> _______________</div>
          <div><b>اعتماد المشرف الفني / مدير المركز:</b> _______________</div>
        </div>
      </div>
    `;

    printHtmlContent(`تقرير التقييم المبدئي الشامل - ${resolvedName}`, html);
  }

  return (
    <div className="mbg">
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
          height: '94vh',
          maxHeight: 'calc(100dvh - 24px)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Modal Main Header - Matching Project Standard */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  التقييم والتشخيص المبدئي الشامل (Initial Diagnostic Evaluation)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  6 محاور رئيسية · توثيق سريري متكامل
                </span>
                <span className="bdg" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.7rem', fontWeight: 800 }}>
                  معتمد لخطط التربية الفردية (IEP)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#172554', color: '#bfdbfe', fontSize: '0.68rem', fontWeight: 800 }}>
                  نظام التوثيق والفرز المعتمد
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  تحديد مستوى الأداء الحالي ونقاط القوة والاحتياج ومقابلة الأسرة والتوصيات التأهيلية
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setShowGuidelines(s => !s)}
              style={{
                background: showGuidelines ? '#fff' : 'rgba(255,255,255,0.2)',
                color: showGuidelines ? '#1e3a8a' : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
              }}
            >
              📜 {showGuidelines ? 'إخفاء الإرشادات' : 'إرشادات التوثيق الإكلينيكي'}
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

        {/* EXPANDABLE DETAILED GUIDELINES */}
        {showGuidelines && (
          <div
            style={{
              background: '#f8fafc',
              padding: '14px 20px',
              borderBottom: '2px solid #93c5fd',
              fontSize: '0.82rem',
              color: '#1e3a8a',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> المعايير المهنية لتطبيق التقييم المبدئي وتوثيق الحالة:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>الهدف من التقييم:</strong> رصد مستوى الأداء الحالي بدقة، وتحديد أسباب الإحالة، وتوجيه فريق التدخل نحو الأدوات المتخصصة (PEP-3, LDES, CARS-2).
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>التكامل مع خطة IEP:</strong> التوصيات المدونة في نهاية هذا التقييم تستخرج تلقائياً كأهداف علاجية وسلوكية في الخطة الفردية للطالب.
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>إشراك الأسرة:</strong> توثيق شكوى الأهل وتطلعاتهم والاحتياجات التدريبية للأسرة هو ركيزة أساسية لضمان تعميم الأهداف في البيئة المنزلية.
              </div>
            </div>
          </div>
        )}

        {/* Real-time Diagnostic & Progress Strip (matching screenshot) */}
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
            {/* Completion Percentage Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #3b82f6',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>نسبة استيفاء التقييم:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: completionMetrics.percent >= 80 ? '#10b981' : '#2563eb' }}>
                {completionMetrics.percent}%
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                ({completionMetrics.completedCount} / {completionMetrics.totalCount} حقول رئيسية)
              </span>
            </div>

            {/* Target Domain Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المجال التعليمي/العلاجي:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb' }}>
                {form.domain || 'التربية الخاصة'}
              </span>
            </div>

            {/* Recommended Tier */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>مستوى التدخل المقترح:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#8b5cf6' }}>
                {completionMetrics.recTier}
              </span>
            </div>

            {/* Readiness Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>جاهزية الخطة (IEP):</span>
              <span className="bdg" style={{ background: completionMetrics.percent >= 80 ? '#ecfdf5' : '#eff6ff', color: completionMetrics.readinessColor, fontWeight: 800, fontSize: '0.78rem' }}>
                {completionMetrics.readiness}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 70, height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${completionMetrics.percent}%`,
                    height: '100%',
                    background: completionMetrics.percent >= 80 ? '#10b981' : '#3b82f6',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. Student & Clinical Header Card (Matching LDES screenshot) */}
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
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>🧑‍⚕️</span>
                <span>بيانات المفحوص والفحص الإكلينيكي</span>
                {form.studentName && (
                  <span
                    style={{
                      fontSize: '0.76rem',
                      background: '#dbeafe',
                      color: '#1e40af',
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
                  style={{ fontSize: '0.72rem', padding: '3px 8px', height: 24 }}
                >
                  {isHeaderCollapsed ? '⬇️ عرض التفاصيل' : '⬆️ إخفاء التفاصيل'}
                </button>
              </div>
            </div>

            {!isHeaderCollapsed && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 10,
                  fontSize: '0.82rem',
                }}
              >
                {/* 1. Student Picker */}
                <div>
                  <label style={{ display: 'block', marginBottom: 3, fontWeight: 700, color: 'var(--text-sub)' }}>
                    الطالب المسجل <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    value={form.mode === 'other' ? '__other__' : form.stuId}
                    onChange={handleSelectStudent}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                    }}
                  >
                    <option value="">— اختر من الطلاب المسجلين بالمركز —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </option>
                    ))}
                    <option value="__other__">➕ مستفيد غير مسجل / خارجي</option>
                  </select>
                </div>

                {/* If external student */}
                {form.mode === 'other' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 3, fontWeight: 700, color: 'var(--text-sub)' }}>
                      اسم المفحوص الخارجي <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.studentName}
                      onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                      placeholder="أدخل اسم المفحوص الرباعي..."
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                      }}
                    />
                  </div>
                )}

                {/* 2. Chronological Age */}
                <div>
                  <label style={{ display: 'block', marginBottom: 3, fontWeight: 700, color: 'var(--text-sub)' }}>
                    العمر الزمني
                  </label>
                  <input
                    type="text"
                    value={form.age}
                    readOnly={!isManualEdit && form.mode !== 'other'}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="تلقائي حسب تاريخ الميلاد"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: (!isManualEdit && form.mode !== 'other') ? 'var(--g1)' : 'var(--bg-card)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                {/* 3. Diagnosis */}
                <div>
                  <label style={{ display: 'block', marginBottom: 3, fontWeight: 700, color: 'var(--text-sub)' }}>
                    التشخيص الطبي / التربوي
                  </label>
                  <input
                    type="text"
                    value={form.diagnosis}
                    readOnly={!isManualEdit && form.mode !== 'other'}
                    onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                    placeholder="مثال: طيف توحد، تأخر نمائي..."
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: (!isManualEdit && form.mode !== 'other') ? 'var(--g1)' : 'var(--bg-card)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                {/* 4. Assessment Date */}
                <div>
                  <label style={{ display: 'block', marginBottom: 3, fontWeight: 700, color: 'var(--text-sub)' }}>
                    تاريخ التقييم <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                {/* 5. Target Domain */}
                <div>
                  <label style={{ display: 'block', marginBottom: 3, fontWeight: 700, color: 'var(--text-sub)' }}>
                    المجال التعليمي / العلاجي <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    value={form.domain}
                    onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                    }}
                  >
                    {PROGRAM_DOMAINS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* 6. Examiner Specialist */}
                <div>
                  <label style={{ display: 'block', marginBottom: 3, fontWeight: 700, color: 'var(--text-sub)' }}>
                    الأخصائي الفاحص
                  </label>
                  <input
                    type="text"
                    value={form.specialistName}
                    onChange={e => setForm(f => ({ ...f, specialistName: e.target.value }))}
                    placeholder="اسم الأخصائي المعتمد..."
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                {/* 7. Respondent / Parent Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: 3, fontWeight: 700, color: 'var(--text-sub)' }}>
                    المستجيب (معلم / ولي أمر)
                  </label>
                  <input
                    type="text"
                    value={form.raterName}
                    onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    placeholder="اسم المستجيب على المقابلة..."
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                {/* 8. Relation / Role */}
                <div>
                  <label style={{ display: 'block', marginBottom: 3, fontWeight: 700, color: 'var(--text-sub)' }}>
                    صلة القرابة / الصفة
                  </label>
                  <input
                    type="text"
                    value={form.raterRelation}
                    onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    placeholder="مثال: ولي الأمر، الأم، معلم الصف..."
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                {/* Photo Upload Thumbnail Box */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <div
                    onClick={() => document.getElementById('init-eval-photo-input')?.click()}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      border: '1.5px dashed var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: form.photo ? `url(${form.photo}) center/cover` : 'var(--bg-card)',
                      flexShrink: 0,
                    }}
                    title="تحميل صورة المفحوص أو المستند الطبي"
                  >
                    {!form.photo && <span style={{ fontSize: '1rem' }}>📷</span>}
                  </div>
                  <input
                    id="init-eval-photo-input"
                    type="file"
                    accept={FILE_ACCEPT_IMAGE}
                    style={{ display: 'none' }}
                    onChange={onPhotoUpload}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                    <span>صورة المفحوص (اختياري)</span>
                    {form.photo && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, photo: '' }))}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'block', padding: 0 }}
                      >
                        إزالة الصورة
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Subscales Navigation Pills - Matching LDES screenshot exactly */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📑</span> محاور التقييم المبدئي الشامل (Initial Evaluation Subscales):
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>
                انقر على التبويب للتنقل السريع والتركيز على المحور المطلوب
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingBottom: 6,
                alignItems: 'center',
              }}
            >
              {SECTIONS_CONFIG.map(sec => {
                const isActive = activeSectionFilter === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionFilter(sec.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 800 : 600,
                      border: isActive ? '1.5px solid #2563eb' : '1px solid var(--border-color)',
                      background: isActive ? '#eff6ff' : 'var(--bg-card)',
                      color: isActive ? '#1e40af' : 'var(--text-main)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{sec.icon}</span>
                    <span>{sec.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Section Cards */}

          {/* Section 1: History & Development */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'history') && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '16px',
                marginBottom: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="bdg b-bl" style={{ fontWeight: 800, fontSize: '0.72rem' }}>#1 - HIST</span>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    التاريخ والتطور (تاريخ الحالة والتاريخ الطبي والعائلي)
                  </h3>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  💡 مثال توضيحي: توثيق أسباب التحويل والبدايات النمائية والظروف البيئية
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                    تاريخ الحالة وظروف الإحالة
                  </label>
                  <textarea
                    value={form.caseHistory || form.history}
                    onChange={e => setForm(f => ({ ...f, caseHistory: e.target.value, history: e.target.value }))}
                    rows={3}
                    placeholder="متى بدأت المشكلة؟ من قام بالتحويل؟ ما هي ملاحظات الأسرة الأولية؟..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                      التطور الارتقائي والطبي
                    </label>
                    <textarea
                      value={form.medicalHistory}
                      onChange={e => setForm(f => ({ ...f, medicalHistory: e.target.value }))}
                      rows={3}
                      placeholder="أمراض سابقة، تاريخ الحمل والولادة، التطور الحركي واللغوي، الفحوصات الطبية..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                      التاريخ العائلي والبيئي
                    </label>
                    <textarea
                      value={form.familyHistory}
                      onChange={e => setForm(f => ({ ...f, familyHistory: e.target.value }))}
                      rows={3}
                      placeholder="صلة القرابة، وجود حالات مشابهة، ترتيب الطفل في الأسرة، الوضع الاجتماعي..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Applied Tools & Evaluation Measures */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'tools') && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '16px',
                marginBottom: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="bdg b-cy" style={{ fontWeight: 800, fontSize: '0.72rem' }}>#2 - TOOLS</span>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    التقييمات والأدوات المستخدمة
                  </h3>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  💡 مثال توضيحي: مقياس بورتيج، كارز-2، بيب-3، فاينلاند، أو استمارات المقابلة
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                    ما هي التقييمات والأدوات المستخدمة؟
                  </label>
                  <textarea
                    value={form.appliedTools}
                    onChange={e => setForm(f => ({ ...f, appliedTools: e.target.value }))}
                    rows={3}
                    placeholder="مثال: مقياس بورتيج، كارز-2، بيب-3، مقياس صعوبات التعلم LDES..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                    ملاحظات ومناقشة نتائج أدوات التقييم
                  </label>
                  <textarea
                    value={form.toolsNotes}
                    onChange={e => setForm(f => ({ ...f, toolsNotes: e.target.value }))}
                    rows={3}
                    placeholder="استجابة الطالب، العوائق أثناء التقييم، مدى تعاون المفحوص، ظروف قاعة الفحص..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Family Interview */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'family') && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '16px',
                marginBottom: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="bdg b-or" style={{ fontWeight: 800, fontSize: '0.72rem' }}>#3 - FAMILY</span>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    المقابلة الأسرية وملاحظات أولياء الأمور
                  </h3>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  💡 مثال توضيحي: شكوى الأهل الأساسية، تطلعاتهم المستقبلية، واحتياجاتهم التدريبية
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                    ملاحظات الأهل أثناء المقابلة الإكلينيكية الأولى
                  </label>
                  <textarea
                    value={form.parentsInterview}
                    onChange={e => setForm(f => ({ ...f, parentsInterview: e.target.value }))}
                    rows={3}
                    placeholder="ما هي شكوى الأهل الرئيسية؟ وما هي تطلعاتهم من برنامج التأهيل والتدخل؟..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                    الاحتياجات التدريبية والإرشادية للأسرة
                  </label>
                  <textarea
                    value={form.parentsNeeds}
                    onChange={e => setForm(f => ({ ...f, parentsNeeds: e.target.value }))}
                    rows={3}
                    placeholder="ما الذي تحتاجه الأسرة لدعم الطفل (نفسياً، مهارياً، تثقيفياً، وتعميم المهارات في المنزل)؟..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Current Performance & Direct Observation */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'observation') && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '16px',
                marginBottom: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="bdg b-pr" style={{ fontWeight: 800, fontSize: '0.72rem' }}>#4 - OBS</span>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    الأداء الحالي والملاحظة الاستكشافية المباشرة
                  </h3>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  💡 مثال توضيحي: نقاط القوة المتقنة التي نبني عليها، ونقاط الاحتياج العاجلة
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4, color: '#047857' }}>
                      💪 نقاط القوة لدى المفحوص (المهارات المتقنة)
                    </label>
                    <textarea
                      value={form.strengths}
                      onChange={e => setForm(f => ({ ...f, strengths: e.target.value }))}
                      rows={3}
                      placeholder="ما الذي يتقنه المستفيد؟ المهارات الإيجابية، المعززات المفضلة، الاستجابات الناجحة..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4, color: '#b91c1c' }}>
                      ⚠️ نقاط الضعف أو الاحتياج لدى المفحوص (مجالات القصور)
                    </label>
                    <textarea
                      value={form.weaknesses}
                      onChange={e => setForm(f => ({ ...f, weaknesses: e.target.value }))}
                      rows={3}
                      placeholder="المجالات والمهارات التي تحتاج إلى تدخل مباشر وعلاج فوري..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                    الملاحظات السلوكية أثناء الجلسات الاستكشافية
                  </label>
                  <textarea
                    value={form.observationSessions}
                    onChange={e => setForm(f => ({ ...f, observationSessions: e.target.value }))}
                    rows={2}
                    placeholder="الانتباه، فرط الحركة، التواصل البصري، السلوك النمطي، التفاعل مع الأقران والفاحص..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Summary & IEP Recommendations */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'summary') && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid #2563eb',
                borderRadius: 12,
                padding: '16px',
                marginBottom: 14,
                boxShadow: '0 2px 6px rgba(37,99,235,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="bdg b-gr" style={{ fontWeight: 800, fontSize: '0.72rem' }}>#5 - IEP</span>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1e40af' }}>
                    الخلاصة والتوصيات (تغذي أهداف الخطة التربوية الفردية IEP)
                  </h3>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  💡 يتم تصدير التوصيات تلقائياً إلى بنك أهداف خطة IEP للطالب
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                    مناقشة عامة على التقييم / الخلاصة والتشخيص الفارق
                  </label>
                  <textarea
                    value={form.summary}
                    onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                    rows={3}
                    placeholder="تلخيص شامل لحالة المفحوص واحتياجاته الفعلية بناءً على المحاور والمقاييس السابقة..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4, color: '#1e40af' }}>
                    التوصيات والبرنامج المقترح (تُستخرج تلقائياً كأهداف في خطة IEP)
                  </label>
                  <textarea
                    value={form.recommendations}
                    onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                    rows={4}
                    placeholder="اكتب التوصيات على شكل نقاط رقمية أو شرطات (كل توصية في سطر مستقل) لتسهيل استيرادها لاحقاً في خطة IEP..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #93c5fd',
                      background: '#f8fafc',
                      color: '#1e293b',
                      fontSize: '0.85rem',
                      lineHeight: 1.7,
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sticky Action Footer - Matching LDES screenshot exactly */}
        <div
          className="fhd modal-footer-custom"
          style={{
            padding: '12px 20px',
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
              تم استيفاء <strong>{completionMetrics.completedCount}</strong> من <strong>{completionMetrics.totalCount}</strong> محاور إكلينيكية
            </span>
            <span className={`bdg ${completionMetrics.percent >= 80 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
              {completionMetrics.percent}% مكتمل
            </span>

            {/* Quick Actions in Footer */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 6 }}>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={fillSuggestedDraft}
                title="تعبئة نموذج استرشادي افتراضي لحالة متكاملة"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة سريعة (مسودة نموذجية)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={fillSuggestedDraft}
                style={{
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  color: '#fff',
                  border: 'none',
                }}
              >
                ✨ توليد التقرير والتوصيات آلياً
              </button>
              <button
                type="button"
                className="btn btn-xs btn-bl"
                onClick={printReport}
                style={{ fontWeight: 700, fontSize: '0.74rem' }}
              >
                🖨️ طباعة التقرير الشامل
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
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                padding: '8px 24px',
              }}
            >
              💾 حفظ التقييم المبدئي الشامل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
