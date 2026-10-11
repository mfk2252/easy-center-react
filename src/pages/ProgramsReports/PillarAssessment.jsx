import { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import { handleFileInputChange, FILE_ACCEPT_IMAGE } from '../../utils/fileUpload';
import EmptyState from '../../components/ui/EmptyState';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { sendReportToWhatsApp } from './programsWhatsApp';
import SpeechArticulationAssessmentModal from '../../components/assessments/SpeechArticulationAssessmentModal';
import SpeechArticulationReportModal from '../../components/assessments/SpeechArticulationReportModal';
import AbuHasibaAssessmentModal from '../../components/assessments/AbuHasibaAssessmentModal';
import AbuHasibaReportModal from '../../components/assessments/AbuHasibaReportModal';
import LDESAssessmentModal from '../../components/assessments/LDESAssessmentModal';
import LDESReportModal from '../../components/assessments/LDESReportModal';
import DevLdAssessmentModal from '../../components/assessments/DevLdAssessmentModal';
import DevLdReportModal from '../../components/assessments/DevLdReportModal';
import LDDRSAssessmentModal from '../../components/assessments/LDDRSAssessmentModal';
import LDDRSReportModal from '../../components/assessments/LDDRSReportModal';
import SartawiAssessmentModal from '../../components/assessments/SartawiAssessmentModal';
import SartawiReportModal from '../../components/assessments/SartawiReportModal';
import MyklebustAssessmentModal from '../../components/assessments/MyklebustAssessmentModal';
import MyklebustReportModal from '../../components/assessments/MyklebustReportModal';
import FamilyDisintegrationAssessmentModal from '../../components/assessments/FamilyDisintegrationAssessmentModal';
import FamilyDisintegrationReportModal from '../../components/assessments/FamilyDisintegrationReportModal';
import SensoryIntegrationAssessmentModal from '../../components/assessments/SensoryIntegrationAssessmentModal';
import SensoryIntegrationReportModal from '../../components/assessments/SensoryIntegrationReportModal';
import DownSyndromeAssessmentModal from '../../components/assessments/DownSyndromeAssessmentModal';
import DownSyndromeReportModal from '../../components/assessments/DownSyndromeReportModal';
import { DOWN_SYNDROME_SCALES } from '../../data/downSyndromeData';
import { LDES_ITEMS } from '../../data/ldesData';
import { DEV_LD_ITEMS } from '../../data/devLdData';
import { LDDRS_ITEMS } from '../../data/lddrsData';
import { SARTAWI_ITEMS } from '../../data/sartawiData';
import { MYKLEBUST_ITEMS } from '../../data/myklebustData';
import { FAMILY_DISINTEGRATION_ITEMS } from '../../data/familyDisintegrationData';
import { SENSORY_INTEGRATION_ITEMS } from '../../data/sensoryIntegrationData';
import UniversalAssessmentModal from '../../components/modals/UniversalAssessmentModal';
import { lifeSkillsScaleConfig, LIFE_SKILLS_ITEMS } from '../../data/lifeSkillsData';
import InitialAssessmentModal from '../../components/assessments/InitialAssessmentModal';
import IepBridgeModal from './IepBridgeModal';
import { extractRecommendedGoals } from '../../utils/iepBridge';
import {
  DEFAULT_SCALE_LIBRARY,
  MEASUREMENT_CATEGORIES,
  groupScalesByCategory,
  buildAssessmentResult,
  getScaleOptions,
  normalizeCategoryId,
} from '../../utils/measurementBank';

const PROGRAM_DOMAINS = [
  'التربية الخاصة', 'التدخل المبكر', 'مرحلة الروضة', 'صعوبات التعلم',
  'فرط الحركة ونقص الانتباه', 'تعديل السلوك', 'التكامل الحسي',
  'التفاعل الاجتماعي', 'الرعاية الذاتية', 'التخاطب والنطق', 'العلاج الطبيعي', 'العلاج الوظيفي'
];

const EMPTY_EVAL = {
  ...EMPTY_STU_PICK,
  dob: '', age: '', diagnosis: '', specialistName: '', photo: '',
  history: '', caseHistory: '', medicalHistory: '', familyHistory: '',
  appliedTools: '', toolsNotes: '',
  parentsInterview: '', parentsNeeds: '',
  observationSessions: '',
  strengths: '', weaknesses: '',
  recommendations: '', summary: '',
  domain: 'التربية الخاصة', date: '',
};

const EMPTY_ASSESSMENT = {
  ...EMPTY_STU_PICK,
  date: todayStr(),
  measureId: '',
  notes: '',
  score: '',
  percentage: '',
  level: '',
  results: {},
  recommendations: '',
};

const CollapsibleSection = ({ title, color, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isNamedColor = color && color !== 'text-main';
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-card)' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: '12px 16px', 
          background: isNamedColor ? `var(--${color}-l, var(--g0))` : 'var(--g0)', 
          color: isNamedColor ? `var(--${color}, var(--text-main))` : 'var(--text-main)', 
          fontWeight: 800, 
          cursor: 'pointer',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          userSelect: 'none'
        }}>
        <span>{title}</span>
        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{isOpen ? '▲ إخفاء التفاصيل' : '▼ عرض التفاصيل'}</span>
      </div>
      {isOpen && (
        <div style={{ padding: '16px', background: 'var(--bg-card)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default function PillarAssessment({ onDataChange, activeCategoryView: extActiveCategoryView, onCategoryChange }) {
  const { toast, center, currentUser } = useApp();
  const [subTab, setSubTab] = useState('scales'); // 'scales' | 'initial' | 'results'
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const categoryScrollPosRef = useRef(0);

  const isControlled = extActiveCategoryView !== undefined;
  const [internalActiveCategoryView, setInternalActiveCategoryView] = useState(null);
  const activeCategoryView = isControlled ? extActiveCategoryView : internalActiveCategoryView;

  const setActiveCategoryView = (cat) => {
    if (cat) {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      categoryScrollPosRef.current = scrollY;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('scs_prog_category_scroll_y', String(scrollY));
      }
    } else {
      const savedY = categoryScrollPosRef.current || Number(sessionStorage.getItem('scs_prog_category_scroll_y') || 0);
      if (savedY > 0) {
        setTimeout(() => {
          window.scrollTo({ top: savedY, behavior: 'instant' });
        }, 15);
      }
    }
    if (!isControlled) {
      setInternalActiveCategoryView(cat);
    }
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
    setSelectedCategoryFilter(cat || 'all');
    setSearchTerm('');
    setSelectedStudentFilter('');
  };

  useEffect(() => {
    if (activeCategoryView === null) {
      const savedY = categoryScrollPosRef.current || Number(sessionStorage.getItem('scs_prog_category_scroll_y') || 0);
      if (savedY > 0) {
        setTimeout(() => {
          window.scrollTo({ top: savedY, behavior: 'instant' });
        }, 20);
      }
    }
  }, [activeCategoryView]);

  useEffect(() => {
    if (extActiveCategoryView !== undefined) {
      setSelectedCategoryFilter(extActiveCategoryView || 'all');
      setSearchTerm('');
      setSelectedStudentFilter('');
    }
  }, [extActiveCategoryView]);

  // Initial Assessment States
  const [evaluations, setEvaluations] = useState([]);
  const [evalModal, setEvalModal] = useState(false);
  const [selectedEvalItem, setSelectedEvalItem] = useState(null);

  // Scales & Assessments States
  const [assessments, setAssessments] = useState([]);
  const [scaleModal, setScaleModal] = useState(false);
  const [scaleForm, setScaleForm] = useState(EMPTY_ASSESSMENT);
  const [selectedScaleId, setSelectedScaleId] = useState('');
  const [scaleResponses, setScaleResponses] = useState({});








  // Speech & Articulation Specific Specialized Modals States
  const [speechModalOpen, setSpeechModalOpen] = useState(false);
  const [speechEditData, setSpeechEditData] = useState(null);
  const [speechReportOpen, setSpeechReportOpen] = useState(false);
  const [selectedSpeechAssessment, setSelectedSpeechAssessment] = useState(null);


  // Abu Hasiba Specific Specialized Modals States
  const [abuhasibaModalOpen, setAbuhasibaModalOpen] = useState(false);
  const [abuhasibaEditData, setAbuhasibaEditData] = useState(null);
  const [abuhasibaReportOpen, setAbuhasibaReportOpen] = useState(false);
  const [selectedAbuhasibaAssessment, setSelectedAbuhasibaAssessment] = useState(null);


  // LDES Specific Specialized Modals States
  const [ldesModalOpen, setLdesModalOpen] = useState(false);
  const [ldesEditData, setLdesEditData] = useState(null);
  const [ldesReportOpen, setLdesReportOpen] = useState(false);
  const [selectedLdesAssessment, setSelectedLdesAssessment] = useState(null);





  // Developmental LD Checklist (Pre-school) States
  const [devLdModalOpen, setDevLdModalOpen] = useState(false);
  const [devLdEditData, setDevLdEditData] = useState(null);
  const [devLdReportOpen, setDevLdReportOpen] = useState(false);
  const [selectedDevLdAssessment, setSelectedDevLdAssessment] = useState(null);

  // LDDRS Battery (El-Zayat) States
  const [lddrsModalOpen, setLddrsModalOpen] = useState(false);
  const [lddrsEditData, setLddrsEditData] = useState(null);
  const [lddrsReportOpen, setLddrsReportOpen] = useState(false);
  const [selectedLddrsAssessment, setSelectedLddrsAssessment] = useState(null);

  // Sartawi Learning Disabilities Scale States
  const [sartawiModalOpen, setSartawiModalOpen] = useState(false);
  const [sartawiEditData, setSartawiEditData] = useState(null);
  const [sartawiReportOpen, setSartawiReportOpen] = useState(false);
  const [selectedSartawiAssessment, setSelectedSartawiAssessment] = useState(null);

  // Myklebust PRS States
  const [myklebustModalOpen, setMyklebustModalOpen] = useState(false);
  const [myklebustEditData, setMyklebustEditData] = useState(null);
  const [myklebustReportOpen, setMyklebustReportOpen] = useState(false);
  const [selectedMyklebustAssessment, setSelectedMyklebustAssessment] = useState(null);

  // Family Disintegration Scale States
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [familyEditData, setFamilyEditData] = useState(null);
  const [familyReportOpen, setFamilyReportOpen] = useState(false);
  const [selectedFamilyAssessment, setSelectedFamilyAssessment] = useState(null);

  // Sensory Integration Scale States
  const [sensoryModalOpen, setSensoryModalOpen] = useState(false);
  const [sensoryEditData, setSensoryEditData] = useState(null);
  const [sensoryReportOpen, setSensoryReportOpen] = useState(false);
  const [selectedSensoryAssessment, setSelectedSensoryAssessment] = useState(null);



  // Down Syndrome Assessment Battery States
  const [dsModalOpen, setDsModalOpen] = useState(false);
  const [dsEditData, setDsEditData] = useState(null);
  const [dsInitialScaleId, setDsInitialScaleId] = useState('ds_developmental');
  const [dsReportOpen, setDsReportOpen] = useState(false);
  const [selectedDsAssessment, setSelectedDsAssessment] = useState(null);


  // IEP Bridge State
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const [bridgeAssessment, setBridgeAssessment] = useState(null);
  const [bridgeScaleItems, setBridgeScaleItems] = useState([]);

  // Universal Assessment Master Modal States
  const [universalModalOpen, setUniversalModalOpen] = useState(false);
  const [universalScaleConfig, setUniversalScaleConfig] = useState(null);
  const [universalEditData, setUniversalEditData] = useState(null);

  function openUniversalAssessment(config, editItem = null) {
    setUniversalScaleConfig(config);
    setUniversalEditData(editItem);
    setUniversalModalOpen(true);
  }

  function getUniversalConfigByScaleType(scaleType) {
    if (!scaleType) return null;
    const st = String(scaleType).toLowerCase();
    if (st === 'life_skills_scale' || st === 'life_skills' || st === 'lifeskills') return lifeSkillsScaleConfig;
    return null;
  }

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setEvaluations(lsGet('progEvaluations').sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    setAssessments((lsGet('studentAssessments') || []).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    if (onDataChange) onDataChange();
  }

  useEffect(() => { reload(); }, []);

  const allScales = useMemo(() => {
    const custom = lsGet('measurements') || [];
    return [...DEFAULT_SCALE_LIBRARY, ...custom].filter(s => !s.archived && !s.isArchived);
  }, []);

  const categoryMap = useMemo(() => {
    return Object.fromEntries(MEASUREMENT_CATEGORIES.map(c => [c.id, c]));
  }, []);

  const scalesGrouped = useMemo(() => {
    return groupScalesByCategory(allScales);
  }, [allScales]);

  const activeScale = useMemo(() => {
    return allScales.find(s => s.id === selectedScaleId) || allScales[0] || null;
  }, [selectedScaleId, allScales]);

  // Initial Assessment Form Handlers
  function openNewEval() {
    setSelectedEvalItem(null);
    setEvalModal(true);
  }

  function openEditEval(item) {
    setSelectedEvalItem(item);
    setEvalModal(true);
  }

  function delEval(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    lsDel('progEvaluations', id);
    toast('🗑️ تم حذف التقييم', 'ok');
    reload();
  }

  // Scales Form Handlers
  function openNewScaleAssessment(scaleId) {
    if (scaleId?.startsWith('ds_') || scaleId === 'down_syndrome') {
      setDsEditData(null);
      setDsInitialScaleId(scaleId?.startsWith('ds_') ? scaleId : 'ds_scale');
      setDsModalOpen(true);
      return;
    }
    if (scaleId === 'speech_screening' || scaleId === 'speech_articulation') {
      setSpeechEditData(null);
      setSpeechModalOpen(true);
      return;
    }
    if (scaleId === 'abuhasiba_arabic_lang') {
      setAbuhasibaEditData(null);
      setAbuhasibaModalOpen(true);
      return;
    }
    if (scaleId === 'learning_difficulties' || scaleId === 'ldes') {
      setLdesEditData(null);
      setLdesModalOpen(true);
      return;
    }
    if (scaleId === 'dev_learning_difficulties' || scaleId === 'dev_ld_preschool') {
      setDevLdEditData(null);
      setDevLdModalOpen(true);
      return;
    }
    if (scaleId === 'lddrs_battery' || scaleId === 'lddrs' || scaleId.startsWith('lddrs_')) {
      setLddrsEditData(null);
      setLddrsModalOpen(true);
      return;
    }
    if (scaleId === 'sartawi_scale' || scaleId === 'sartawi_ld' || scaleId === 'sartawi') {
      setSartawiEditData(null);
      setSartawiModalOpen(true);
      return;
    }
    if (scaleId === 'myklebust_scale' || scaleId === 'myklebust') {
      setMyklebustEditData(null);
      setMyklebustModalOpen(true);
      return;
    }
    if (scaleId === 'family_disintegration' || scaleId === 'family' || scaleId === 'family_climate') {
      setFamilyEditData(null);
      setFamilyModalOpen(true);
      return;
    }
    if (scaleId === 'sensory_integration_scale' || scaleId === 'sensory_integration' || scaleId === 'sensory') {
      setSensoryEditData(null);
      setSensoryModalOpen(true);
      return;
    }
    const univConfig = getUniversalConfigByScaleType(scaleId);
    if (univConfig) {
      openUniversalAssessment(univConfig);
      return;
    }
    const scale = allScales.find(s => s.id === scaleId) || activeScale;
    setSelectedScaleId(scale?.id || '');
    setScaleResponses({});
    setScaleForm({
      ...EMPTY_ASSESSMENT,
      measureId: scale?.id || '',
      date: todayStr(),
    });
    setScaleModal(true);
  }









  function openEditSpeechAssessment(item) {
    setSpeechEditData(item);
    setSpeechModalOpen(true);
  }

  function openViewSpeechReport(item) {
    setSelectedSpeechAssessment(item);
    setSpeechReportOpen(true);
  }



  function openEditAbuhasibaAssessment(item) {
    setAbuhasibaEditData(item);
    setAbuhasibaModalOpen(true);
  }

  function openViewAbuhasibaReport(item) {
    setSelectedAbuhasibaAssessment(item);
    setAbuhasibaReportOpen(true);
  }



  function openEditLdesAssessment(item) {
    setLdesEditData(item);
    setLdesModalOpen(true);
  }

  function openViewLdesReport(item) {
    setSelectedLdesAssessment(item);
    setLdesReportOpen(true);
  }









  function openEditDevLdAssessment(item) {
    setDevLdEditData(item);
    setDevLdModalOpen(true);
  }

  function openViewDevLdReport(item) {
    setSelectedDevLdAssessment(item);
    setDevLdReportOpen(true);
  }

  function openEditLddrsAssessment(item) {
    setLddrsEditData(item);
    setLddrsModalOpen(true);
  }

  function openViewLddrsReport(item) {
    setSelectedLddrsAssessment(item);
    setLddrsReportOpen(true);
  }

  function openEditSartawiAssessment(item) {
    setSartawiEditData(item);
    setSartawiModalOpen(true);
  }

  function openViewSartawiReport(item) {
    setSelectedSartawiAssessment(item);
    setSartawiReportOpen(true);
  }

  function openEditMyklebustAssessment(item) {
    setMyklebustEditData(item);
    setMyklebustModalOpen(true);
  }

  function openViewMyklebustReport(item) {
    setSelectedMyklebustAssessment(item);
    setMyklebustReportOpen(true);
  }

  function openEditFamilyAssessment(item) {
    setFamilyEditData(item);
    setFamilyModalOpen(true);
  }

  function openViewFamilyReport(item) {
    setSelectedFamilyAssessment(item);
    setFamilyReportOpen(true);
  }

  function openEditSensoryAssessment(item) {
    setSensoryEditData(item);
    setSensoryModalOpen(true);
  }

  function openViewSensoryReport(item) {
    setSelectedSensoryAssessment(item);
    setSensoryReportOpen(true);
  }











  function openEditDsAssessment(item) {
    setDsEditData(item);
    setDsInitialScaleId(item.measureId || item.scaleId || 'ds_scale');
    setDsModalOpen(true);
  }

  function openViewDsReport(item) {
    setSelectedDsAssessment(item);
    setDsReportOpen(true);
  }



  function handleScaleOptionChange(itemId, value) {
    setScaleResponses(prev => ({
      ...prev,
      [itemId]: Number(value),
    }));
  }

  function saveScaleAssessment() {
    if (!validateStudentPick(scaleForm)) { toast('⚠️ اختر الطالب أولاً', 'er'); return; }
    if (!activeScale) { toast('⚠️ المقياس غير محدد', 'er'); return; }

    // Calculate score
    const resultObj = buildAssessmentResult(activeScale, scaleResponses);

    const payload = {
      ...scaleForm,
      measureId: activeScale.id,
      measureName: activeScale.name,
      category: activeScale.category,
      score: resultObj.score,
      maxScore: resultObj.maxScore,
      percentage: resultObj.percentage,
      level: resultObj.level,
      severityColor: resultObj.severityColor,
      results: scaleResponses,
      updatedAt: new Date().toISOString(),
    };

    lsAdd('studentAssessments', { ...payload, id: uid(), createdAt: new Date().toISOString() });
    toast(`✅ تم حفظ نتيجة المقياس (${resultObj.score}/${resultObj.maxScore}) بنجاح`, 'ok');
    setScaleModal(false);
    setSubTab('results');
    reload();
  }

  function delScaleAssessment(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذه النتيجة؟')) return;
    lsDel('studentAssessments', id);
    toast('🗑️ تم حذف النتيجة', 'ok');
    reload();
  }

  function handleOpenBridge(item) {
    setBridgeAssessment(item);
    setBridgeOpen(true);
  }

  // Printing
  function printEvalItem(item) {
    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;">
        <h2 style="color:#1a56db;border-bottom:2px solid #1a56db;padding-bottom:8px;margin-bottom:14px;">
          🎯 تقرير التقييم والتشخيص المبدئي الشامل
        </h2>
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;">
          <tr>
            <td><b>اسم الطالب:</b> ${item.studentName || '—'}</td>
            <td><b>العمر الزمني:</b> ${item.age || '—'}</td>
            <td><b>تاريخ التقييم:</b> ${item.date || '—'}</td>
          </tr>
          <tr>
            <td><b>التشخيص:</b> ${item.diagnosis || '—'}</td>
            <td><b>المجال المستهدف:</b> ${item.domain || '—'}</td>
            <td><b>الأخصائي القائم بالتقييم:</b> ${item.specialistName || '—'}</td>
          </tr>
        </table>
        ${item.history ? `<h3>📜 التاريخ التطوري والحالة النمائية:</h3><p style="white-space:pre-wrap;">${item.history}</p>` : ''}
        ${item.medicalHistory ? `<h3>🏥 التطور الارتقائي والطبي:</h3><p style="white-space:pre-wrap;">${item.medicalHistory}</p>` : ''}
        ${item.familyHistory ? `<h3>🏡 التاريخ العائلي:</h3><p style="white-space:pre-wrap;">${item.familyHistory}</p>` : ''}
        ${item.appliedTools ? `<h3>🧪 الأدوات والمقاييس المستخدمة:</h3><p style="white-space:pre-wrap;">${item.appliedTools}</p>` : ''}
        ${item.toolsNotes ? `<h3>📝 مناقشة وملاحظات أدوات التقييم:</h3><p style="white-space:pre-wrap;">${item.toolsNotes}</p>` : ''}
        ${item.parentsInterview ? `<h3>👨‍👩‍👧 مقابلة ولي الأمر:</h3><p style="white-space:pre-wrap;">${item.parentsInterview}</p>` : ''}
        ${item.parentsNeeds ? `<h3>🎯 الاحتياجات التدريبية للأهل:</h3><p style="white-space:pre-wrap;">${item.parentsNeeds}</p>` : ''}
        ${item.observationSessions ? `<h3>👁️ ملاحظات الجلسات الاستكشافية:</h3><p style="white-space:pre-wrap;">${item.observationSessions}</p>` : ''}
        ${item.strengths ? `<h3>💪 نقاط القوة لدى المستفيد:</h3><p style="white-space:pre-wrap;">${item.strengths}</p>` : ''}
        ${item.weaknesses ? `<h3>⚠️ نقاط الاحتياج والضعف:</h3><p style="white-space:pre-wrap;">${item.weaknesses}</p>` : ''}
        ${item.summary ? `<h3>📌 الخلاصة ومستوى الأداء الحالي:</h3><p style="white-space:pre-wrap;">${item.summary}</p>` : ''}
        ${item.recommendations ? `<h3>💡 التوصيات والبرنامج المقترح (أهداف IEP):</h3><p style="white-space:pre-wrap;">${item.recommendations}</p>` : ''}
        <div style="margin-top:30px;display:flex;justify-content:space-between;border-top:1px dashed #94a3b8;padding-top:16px;">
          <div><b>توقيع الأخصائي:</b> _______________</div>
          <div><b>اعتماد مدير المركز:</b> _______________</div>
        </div>
      </div>
    `;
    printItem({ html }, 'evaluation', center?.logo, center?.name);
  }

  function printScaleAssessmentItem(item) {
    const html = `
      <div style="direction:rtl;text-align:right;font-family:'Tajawal',sans-serif;">
        <h2 style="color:#0891b2;border-bottom:2px solid #0891b2;padding-bottom:8px;margin-bottom:14px;">
          📊 تقرير نتيجة مقياس: ${item.measureName || 'المقياس'}
        </h2>
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;">
          <tr>
            <td><b>اسم الطالب:</b> ${item.studentName || '—'}</td>
            <td><b>العمر الزمني:</b> ${item.age || '—'}</td>
            <td><b>تاريخ التقييم:</b> ${item.date || '—'}</td>
          </tr>
          <tr>
            <td><b>التشخيص:</b> ${item.diagnosis || '—'}</td>
            <td><b>المقياس:</b> ${item.measureName || '—'}</td>
            <td><b>الفئة:</b> ${item.category || 'متلازمة داون والتأهيل النمائي'}</td>
          </tr>
        </table>

        <div style="background:#f0fdfa;border:2px solid #5eead4;border-radius:8px;padding:14px;margin-bottom:16px;">
          <div style="font-size:1.1rem;font-weight:800;color:#0f766e;margin-bottom:6px;">الدرجة المحققة: ${item.score} من أصل ${item.maxScore} (${item.percentage})</div>
          <div style="font-size:0.95rem;font-weight:700;color:#0d9488;">المستوى التقديري والتشخيصي: ${item.level}</div>
        </div>

        ${item.notes ? `<h3>📝 الملاحظات والتوصيات الإكلينيكية:</h3><p style="white-space:pre-wrap;">${item.notes}</p>` : ''}
        
        <div style="margin-top:30px;display:flex;justify-content:space-between;border-top:1px dashed #94a3b8;padding-top:16px;">
          <div><b>الأخصائي الفاحص:</b> _______________</div>
          <div><b>اعتماد مدير المركز:</b> _______________</div>
        </div>
      </div>
    `;
    printItem({ html }, 'assessment_result', center?.logo, center?.name);
  }

  // Filtered lists
  const filteredEvals = evaluations.filter(e => {
    const matchSearch = !searchTerm || (e.studentName && e.studentName.includes(searchTerm)) || (e.domain && e.domain.includes(searchTerm));
    const matchStu = !selectedStudentFilter || e.stuId === selectedStudentFilter;
    return matchSearch && matchStu;
  });

  const filteredAssessments = assessments.filter(a => {
    const matchSearch = !searchTerm || (a.studentName && a.studentName.includes(searchTerm)) || (a.measureName && a.measureName.includes(searchTerm));
    const matchStu = !selectedStudentFilter || a.stuId === selectedStudentFilter;
    const normCat = normalizeCategoryId(a.category);
    const matchCat = selectedCategoryFilter === 'all' || normCat === selectedCategoryFilter;
    return matchSearch && matchStu && matchCat;
  });

  const filteredScales = allScales.filter(s => {
    const normCat = normalizeCategoryId(s.category);
    const matchCat = selectedCategoryFilter === 'all' || normCat === selectedCategoryFilter;
    const matchSearch = !searchTerm || (s.name && s.name.includes(searchTerm)) || (s.nameEn && s.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) || (s.description && s.description.includes(searchTerm));
    
    // Prevent duplication: If the autism or speech featured cards are shown at the top,
    // we do not display those scales in the generic bottom list.
    const isAutismFeatured = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'autism') && !searchTerm;
    const isAutismScale = [].includes(s.id);
    if (isAutismFeatured && isAutismScale) {
      return false; 
    }

    const isSpeechFeatured = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'speech_language') && !searchTerm;
    const isSpeechScale = ['abuhasiba_arabic_lang', 'abuhasiba', 'speech_articulation', 'speech_screening'].includes(s.id);
    if (isSpeechFeatured && isSpeechScale) {
      return false;
    }

    const isLdFeatured = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'learning_academic') && !searchTerm;
    const isLdScale = ['myklebust_scale', 'sartawi_scale', 'lddrs_battery', 'dev_learning_difficulties', 'dev_ld_preschool', 'learning_difficulties', 'ldes'].includes(s.id);
    if (isLdFeatured && isLdScale) {
      return false;
    }

    const isAdhdFeatured = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'adhd') && !searchTerm;
    const isAdhdScale = [].includes(s.id);
    if (isAdhdFeatured && isAdhdScale) {
      return false;
    }

    const isIntelligenceFeatured = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'intelligence_cognitive') && !searchTerm;
    const isIntelligenceScale = ['rpm', 'cpm', 'spm'].includes(s.id);
    if (isIntelligenceFeatured && isIntelligenceScale) {
      return false;
    }

    const isAdaptiveFeatured = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'adaptive_behavior') && !searchTerm;
    const isAdaptiveScale = ['life_skills_scale'].includes(s.id);
    if (isAdaptiveFeatured && isAdaptiveScale) {
      return false;
    }

    const isDevEarlyFeatured = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'developmental_early') && !searchTerm;
    const isDevEarlyScale = [].includes(s.id);
    if (isDevEarlyFeatured && isDevEarlyScale) {
      return false;
    }

    const isBehavioralFeatured = (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'behavioral_emotional') && !searchTerm;
    const isBehavioralScale = ['family_disintegration'].includes(s.id);
    if (isBehavioralFeatured && isBehavioralScale) {
      return false;
    }

    return matchCat && matchSearch;
  });

  const currentCategoryMeta = categoryMap[selectedCategoryFilter] || null;

  return (
    <div>
      {/* Pillar Header & Controls using native Easy Center Tab System - Only visible in Root View */}
      {activeCategoryView === null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div className="tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`tab ${subTab === 'scales' ? 'on' : ''}`}
              onClick={() => { setSubTab('scales'); setActiveCategoryView(null); setSelectedCategoryFilter('all'); }}
            >
              🧪 مقاييس وقوائم تقييم ({allScales.length})
            </button>
            <button
              type="button"
              className={`tab ${subTab === 'initial' ? 'on' : ''}`}
              onClick={() => setSubTab('initial')}
            >
              📋 التقييم والتشخيص المبدئي ({evaluations.length})
            </button>
            <button
              type="button"
              className={`tab ${subTab === 'results' ? 'on' : ''}`}
              onClick={() => setSubTab('results')}
            >
              📊 نتائج المقاييس المسجلة ({assessments.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {subTab === 'initial' && (
              <button type="button" className="btn btn-p" onClick={openNewEval}>
                ➕ تقييم مبدئي جديد
              </button>
            )}
          </div>
        </div>
      )}



      {/* SUBTAB 1: INITIAL COMPREHENSIVE ASSESSMENTS */}
      {subTab === 'initial' && (
        <div>
          {/* Custom Compact Filter Bar */}
          <div className="prog-filter-bar">
            <div className="prog-filter-title">
              <span>🔍 تصفية الفحوصات المبدئية:</span>
            </div>
            <input
              type="text"
              className="prog-search-input"
              placeholder="البحث باسم الطالب أو الأخصائي..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="prog-select-filter"
              value={selectedStudentFilter}
              onChange={e => setSelectedStudentFilter(e.target.value)}
            >
              <option value="">— كل الطلاب —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {(searchTerm || selectedStudentFilter) && (
              <button
                type="button"
                className="btn btn-sm btn-g prog-filter-clear-btn"
                onClick={() => { setSearchTerm(''); setSelectedStudentFilter(''); }}
              >
                مسح التصفية ✖
              </button>
            )}
          </div>

          {filteredEvals.length === 0 ? (
            <EmptyState 
              icon="🎯" 
              title="لا توجد تقييمات مبدئية مسجلة بعد" 
              sub="اضغط ➕ تقييم مبدئي جديد لبدء توثيق رحلة تشخيص الطالب" 
              action={
                <button type="button" className="btn btn-p" onClick={openNewEval}>
                  ➕ تقييم مبدئي جديد
                </button>
              }
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filteredEvals.map(item => (
                <div key={item.id} className="prog-item-card" style={{ gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div className="prog-student-avatar">
                        {item.photo ? <img src={item.photo} alt="" /> : '👦'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="prog-student-name">{item.studentName}</div>
                        <div className="prog-student-meta">{item.diagnosis || 'تشخيص عام'} · {item.date}</div>
                      </div>
                    </div>
                    <span className="bdg b-bl" style={{ flexShrink: 0 }}>{item.domain || 'تربية خاصة'}</span>
                  </div>

                  {item.summary && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-sub)', background: 'var(--g0)', padding: '8px 10px', borderRadius: 'var(--r3)', lineHeight: 1.55, maxHeight: 68, overflow: 'hidden' }}>
                      {item.summary}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ color: 'var(--text-sub)' }}>الأخصائي: <strong style={{ color: 'var(--text-main)' }}>{item.specialistName || '—'}</strong></span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {item.parentPhone && (
                        <button
                          type="button"
                          className="btn btn-xs btn-s"
                          title="إرسال ملخص لولي الأمر عبر واتساب"
                          onClick={() => {
                            sendReportToWhatsApp({
                              parentPhone: item.parentPhone,
                              parentName: item.parentName,
                              studentName: item.studentName,
                              reportTitle: `التقييم المبدئي (${item.domain})`,
                              reportType: 'التقييم والتشخيص الشامل',
                              date: item.date,
                              summary: item.summary,
                              recommendations: item.recommendations,
                              specialistName: item.specialistName,
                              centerName: center?.name,
                            });
                          }}
                        >
                          💬 واتساب
                        </button>
                      )}
                      <button type="button" className="btn btn-xs btn-bl" title="طباعة" onClick={() => printEvalItem(item)}>🖨️</button>
                      <button type="button" className="btn btn-xs btn-g" title="تعديل" onClick={() => openEditEval(item)}>✏️</button>
                      <button type="button" className="btn btn-xs btn-d" title="حذف" onClick={() => delEval(item.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: SCALES LIBRARY WITH 13 DIAGNOSTIC CATEGORIES */}
      {subTab === 'scales' && (
        <div>
          {activeCategoryView === null ? (
            <div>
              {/* Search Bar */}
              <div style={{ margin: '8px 0 24px 0', display: 'flex', justifyContent: 'center' }}>
                <input
                  type="text"
                  className="prog-search-input"
                  style={{ maxWidth: '450px', width: '100%', padding: '10px 16px', borderRadius: '24px', fontSize: '0.9rem', border: '1.5px solid var(--border-color)', boxShadow: 'var(--sh)', textAlign: 'center' }}
                  placeholder="🔍 ابحث عن مقياس محدد أو فئة تشخيصية مباشرة..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {searchTerm ? (
                /* Search active state: Show filtered list of scales immediately */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      🔍 نتائج البحث عن "{searchTerm}" ({filteredScales.length} مقاييس)
                    </h3>
                    <button type="button" className="btn btn-sm btn-g" onClick={() => setSearchTerm('')}>
                      إلغاء البحث والعودة ✖
                    </button>
                  </div>
                  {/* Standard Scales Grid but filtered */}
                  {filteredScales.length === 0 ? (
                    <EmptyState
                      icon="🔍"
                      title="لم يتم العثور على أي مقاييس تطابق البحث"
                      sub="جرب كتابة كلمة أخرى أو تصفح الأقسام مباشرة"
                    />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
                      {filteredScales.map(scale => {
                        const normCat = normalizeCategoryId(scale.category);
                        const catMeta = categoryMap[normCat] || { name: 'أداة تقييم', icon: '📝', color: '#1a56db' };
                        return (
                          <div
                            key={scale.id}
                            className="prog-scale-card"
                            style={{
                              border: selectedScaleId === scale.id ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                              background: selectedScaleId === scale.id ? 'var(--pr-l)' : 'var(--bg-card)',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: 14,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 6 }}>
                              <span className="bdg b-bl" style={{ fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>{catMeta.icon}</span>
                                <span>{catMeta.name}</span>
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                                {scale.items?.length || 15} بنداً
                              </span>
                            </div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                              {scale.name}
                            </h4>
                            {scale.nameEn && (
                              <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 8, direction: 'ltr', textAlign: 'right', fontWeight: 400 }}>
                                {scale.nameEn}
                              </div>
                            )}
                            <p style={{ fontSize: '.78rem', color: 'var(--text-sub)', margin: '0 0 14px 0', minHeight: 40, lineHeight: 1.5, fontWeight: 400 }}>
                              {scale.description || scale.thresholdText || 'قائمة تقييم تساعد الأخصائي في تحديد مستوى الأداء وبناء خطة التدخل'}
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                              <button
                                type="button"
                                className="btn btn-p btn-sm"
                                style={{
                                  flex: 1,
                                  fontWeight: 700,
                                  background: undefined,
                                  borderColor: undefined,
                                }}
                                onClick={() => openNewScaleAssessment(scale.id)}
                              >
                                {'📝 تطبيق المقياس الآن'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* The 13 Categories Grid + 1 All scales card */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {/* Card: All Scales */}
                  <div
                    onClick={() => { setActiveCategoryView('all'); setSelectedCategoryFilter('all'); }}
                    className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    style={{
                      background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--g0) 100%)',
                      border: '1.5px dashed var(--pr)',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '220px',
                    }}
                  >
                    <div>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--pr-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 12 }}>
                        🌟
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                        جميع المقاييس السيكومترية
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', letterSpacing: '0.5px', marginBottom: 8, textTransform: 'uppercase', fontWeight: 400 }}>
                        All Diagnostic Scales
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.5, margin: 0, fontWeight: 400 }}>
                        استعراض وتصفح كافة المقاييس والأدوات التشخيصية المتوفرة بالمنظومة دفعة واحدة مع تصفية متقدمة.
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 10, marginTop: 12 }}>
                      <span className="bdg b-bl" style={{ fontSize: '0.78rem', fontWeight: 600 }}>{allScales.length} مقياس متاح</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--pr)' }}>دخول ⬅</span>
                    </div>
                  </div>

                  {/* 13 Category Cards */}
                  {MEASUREMENT_CATEGORIES.map(cat => {
                    const count = (scalesGrouped[cat.id] || []).length;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => { setActiveCategoryView(cat.id); setSelectedCategoryFilter(cat.id); }}
                        className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '16px',
                          padding: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '220px',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                      >
                        <div>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${cat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 12, border: `1px solid ${cat.color}30` }}>
                            {cat.icon}
                          </div>
                          <h3 style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                            {cat.name}
                          </h3>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', letterSpacing: '0.3px', marginBottom: 8, fontWeight: 400 }}>
                            {cat.nameEn}
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.5, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', fontWeight: 400 }}>
                            {cat.description}
                          </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 10, marginTop: 12 }}>
                          <span className="bdg b-gr" style={{ fontSize: '0.78rem', fontWeight: 600 }}>{count} مقاييس</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>استعراض ⬅</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Sub-Page for Specific Category View */
            <div>
              {!isControlled && currentCategoryMeta && (
                <UnifiedPageHeader
                  icon={<span style={{ fontSize: '1.45rem' }}>{currentCategoryMeta.icon || '🎯'}</span>}
                  iconBg={`${currentCategoryMeta.color || 'var(--pr)'}20`}
                  iconColor={currentCategoryMeta.color || 'var(--pr)'}
                  accentColor={currentCategoryMeta.color || 'var(--pr)'}
                  title={currentCategoryMeta.name}
                  subtitle={currentCategoryMeta.description || 'تصفح المقاييس والأدوات التشخيصية التابعة لهذه الفئة'}
                  badge={<span className="bdg b-bl">{currentCategoryMeta.name}</span>}
                  onBack={() => setActiveCategoryView(null)}
                  backLabel="العودة للفئات التشخيصية"
                  className="sticky top-0 sm:top-[54px] z-20 backdrop-blur shadow-sm sticky-sub-header"
                  style={{
                    position: 'sticky',
                    top: '54px',
                    zIndex: 20,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                />
              )}

              {/* Subtab Compact Filter Bar inside selected Category */}
              <div className="prog-filter-bar">
                <div className="prog-filter-title">
                  <span>🔍 تصفية مقاييس {currentCategoryMeta ? currentCategoryMeta.name : 'الفئة'}:</span>
                </div>
                <input
                  type="text"
                  className="prog-search-input"
                  placeholder="البحث باسم المقياس أو الوصف في هذه الفئة..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                  className="prog-select-filter"
                  value={selectedStudentFilter}
                  onChange={e => setSelectedStudentFilter(e.target.value)}
                >
                  <option value="">— كل الطلاب —</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {(searchTerm || selectedStudentFilter) && (
                  <button
                    type="button"
                    className="btn btn-sm btn-g prog-filter-clear-btn"
                    onClick={() => { setSearchTerm(''); setSelectedStudentFilter(''); }}
                  >
                    مسح التصفية ✖
                  </button>
                )}
              </div>


              {/* Featured Speech and Language Highlight Cards inside category detail view if Speech/Language or All is active */}
              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'speech_language') && !searchTerm && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 14,
                    marginBottom: 20,
                  }}
                >

                  {/* Abu Hasiba Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(3, 105, 161, 0.08), rgba(14, 165, 233, 0.04))',
                      border: '1.5px solid #0369a1',
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="bdg" style={{ background: '#f0f9ff', color: '#0369a1', fontWeight: 600, fontSize: '.72rem' }}>مقياس اللغة المعرب المطور</span>
                        <span className="bdg b-gr" style={{ fontWeight: 600, fontSize: '.72rem' }}>د. أحمد أبو حسيبة</span>
                      </div>
                      <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        🧠 مقياس د. أحمد أبو حسيبة للغة المعرب (PLS)
                      </h3>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 400 }}>
                        133 بنداً تشخيصياً معرباً للبيئة العربية · حساب العمر اللغوي والدرجات وتأخر اللغة واشتقاق خطة فردية تلقائية
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => { setAbuhasibaEditData(null); setAbuhasibaModalOpen(true); }}
                      style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: '#0369a1', color: '#fff', width: '100%' }}
                    >
                      🚀 تطبيق وفحص مقياس الدكتور أبو حسيبة
                    </button>
                  </div>

                  {/* Speech & Articulation Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(56, 189, 248, 0.04))',
                      border: '1.5px solid #0284c7',
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="bdg" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600, fontSize: '.72rem' }}>تقييم مخارج الأصوات والطلاقة</span>
                        <span className="bdg b-gr" style={{ fontWeight: 600, fontSize: '.72rem' }}>سجل الفحص النطقي</span>
                      </div>
                      <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        💬 سجل فحص وتقييم النطق ومخارج الحروف
                      </h3>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 400 }}>
                        فحص إكلينيكي دقيق لمخارج الحروف والأصوات، مواضع الإبدال والحذف والتشويه، والطلاقة اللفظية وبناء الأهداف
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => { setSpeechEditData(null); setSpeechModalOpen(true); }}
                      style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: '#0284c7', color: '#fff', width: '100%' }}
                    >
                      🚀 تطبيق وفحص سجل النطق ومخارج الحروف
                    </button>
                  </div>

                </div>
              )}

              {/* Featured Learning Disabilities Highlight Cards (Myklebust, Sartawi, LDDRS, DevLD, LDES) if Learning Difficulties or All is active */}
              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'learning_academic') && !searchTerm && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 14,
                    marginBottom: 20,
                  }}
                >
                  {/* Myklebust PRS Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.08), rgba(6, 182, 212, 0.04))',
                      border: '1.5px solid #0891b2',
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="bdg" style={{ background: '#cffafe', color: '#0e7490', fontWeight: 600, fontSize: '.72rem' }}>مقياس التقدير السلوكي</span>
                        <span className="bdg b-gr" style={{ fontWeight: 600, fontSize: '.72rem' }}>Myklebust PRS</span>
                      </div>
                      <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        📖 مقياس مايكل بست لتشخيص صعوبات التعلم (PRS)
                      </h3>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 400 }}>
                        24 بنداً تشخيصياً · 5 مجالات نمائية وسلوكية (الاستيعاب السمعي، اللغة المنطوقة، التوجيه، التناسق الحركي، السلوك الشخصي والاجتماعي) · حاصل التعلم LQ
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => { setMyklebustEditData(null); setMyklebustModalOpen(true); }}
                      style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: '#0891b2', color: '#fff', width: '100%' }}
                    >
                      🚀 تطبيق وفحص مقياس مايكل بست
                    </button>
                  </div>

                  {/* Sartawi Scale Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.08), rgba(37, 99, 235, 0.04))',
                      border: '1.5px solid #1e40af',
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="bdg" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 600, fontSize: '.72rem' }}>أ.د. زيدان السرطاوي</span>
                        <span className="bdg b-gr" style={{ fontWeight: 600, fontSize: '.72rem' }}>50 بنداً</span>
                      </div>
                      <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        📘 مقياس د. زيدان السرطاوي لتشخيص صعوبات التعلم
                      </h3>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 400 }}>
                        50 بنداً · 3 أبعاد نمائية وأكاديمية (النمائي المعرفي، الأكاديمي، الانفعالي والسلوكي) · درجات معيارية تائية ورتب مئينية واشتقاق IEP
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => { setSartawiEditData(null); setSartawiModalOpen(true); }}
                      style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: '#1e40af', color: '#fff', width: '100%' }}
                    >
                      🚀 تطبيق وفحص مقياس السرطاوي
                    </button>
                  </div>

                  {/* LDDRS (El-Zayat) Battery Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(234, 88, 12, 0.04))',
                      border: '1.5px solid #dc2626',
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="bdg" style={{ background: '#fee2e2', color: '#991b1b', fontWeight: 600, fontSize: '.72rem' }}>أ.د. فتحي الزيات</span>
                        <span className="bdg b-gr" style={{ fontWeight: 600, fontSize: '.72rem' }}>بطارية LDDRS</span>
                      </div>
                      <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        🎯 بطارية مقاييس التقدير التشخيصية (LDDRS)
                      </h3>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 400 }}>
                        8 مقاييس نمائية وأكاديمية مستقلة (الانتباه، الإدراك السمعي والبصري والحركي، الذاكرة، القراءة، الكتابة، الرياضيات) · تقنين خليجي وعربي شامل
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => { setLddrsEditData(null); setLddrsModalOpen(true); }}
                      style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: '#dc2626', color: '#fff', width: '100%' }}
                    >
                      🚀 تطبيق وفحص بطارية الزيات LDDRS
                    </button>
                  </div>

                  {/* DevLD (Preschool) Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(20, 184, 166, 0.04))',
                      border: '1.5px solid #0d9488',
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="bdg" style={{ background: '#ccfbf1', color: '#0f766e', fontWeight: 600, fontSize: '.72rem' }}>أ.د. عادل عبدالله</span>
                        <span className="bdg b-gr" style={{ fontWeight: 600, fontSize: '.72rem' }}>80 عبارة نمائية</span>
                      </div>
                      <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        🧸 قائمة صعوبات التعلم النمائية لأطفال الروضة
                      </h3>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 400 }}>
                        الكشف والفرز المبكر لمرحلة الروضة وما قبل المدرسة وفق تصنيف Kirk & Chalfant للأبعاد المعرفية واللغوية والبصرية الحركية
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => { setDevLdEditData(null); setDevLdModalOpen(true); }}
                      style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: '#0d9488', color: '#fff', width: '100%' }}
                    >
                      🚀 تطبيق وفحص قائمة صعوبات الروضة
                    </button>
                  </div>

                  {/* LDES Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(245, 158, 11, 0.04))',
                      border: '1.5px solid #d97706',
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="bdg" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 600, fontSize: '.72rem' }}>مقياس تقييم صعوبات التعلم</span>
                        <span className="bdg b-gr" style={{ fontWeight: 600, fontSize: '.72rem' }}>LDES</span>
                      </div>
                      <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        📝 مقياس تقدير صعوبات التعلم (LDES)
                      </h3>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 400 }}>
                        88 بنداً تشخيصياً · 7 مجالات أكاديمية ومعرفية وسلوكية · حساب معامل صعوبات التعلم LDEQ والدرجات المعيارية واشتقاق الخطة الفردية
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => { setLdesEditData(null); setLdesModalOpen(true); }}
                      style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: '#d97706', color: '#fff', width: '100%' }}
                    >
                      🚀 تطبيق وفحص مقياس LDES
                    </button>
                  </div>
                </div>
              )}



              {/* Featured Adaptive Behavior & Life Skills Cards [Theme: Emerald / Green] */}
              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'adaptive_behavior') && !searchTerm && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 14,
                    marginBottom: 20,
                  }}
                >


                  {/* Life Skills & Independence Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(4, 120, 87, 0.04))',
                      border: '1.5px solid #10b981',
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="bdg" style={{ background: '#ecfdf5', color: '#065f46', fontWeight: 600, fontSize: '.72rem' }}>العلاج الوظيفي والتربية الخاصة</span>
                        <span className="bdg b-gr" style={{ fontWeight: 600, fontSize: '.72rem' }}>مهارات الاستقلالية</span>
                      </div>
                      <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        🧰 قائمة مهارات الاستقلالية والرعاية الذاتية
                      </h3>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 400 }}>
                        25 بنداً تقييمياً دقيقاً · 5 مجالات استقلالية (التغذية، النظافة والحمام، ارتداء الملابس، المهارات المنزلية، والمشاركة المجتمعية)
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => openUniversalAssessment(lifeSkillsScaleConfig)}
                      style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: 'linear-gradient(135deg, #10b981, #047857)', color: '#fff', width: '100%' }}
                    >
                      🚀 تطبيق قائمة مهارات الاستقلالية والرعاية الذاتية
                    </button>
                  </div>
                </div>
              )}

              {/* Featured Developmental Screening Cards [Theme: Teal / Cyan] */}
              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'developmental_early') && !searchTerm && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 14,
                    marginBottom: 20,
                  }}
                >

                </div>
              )}

              {/* Featured Behavioral & Emotional Cards [Theme: Violet / Rose] */}
              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'behavioral_emotional') && !searchTerm && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 14,
                    marginBottom: 20,
                  }}
                >

                  {/* Family Disintegration & Psychological Climate Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08), rgba(244, 63, 94, 0.04))',
                      border: '1.5px solid #e11d48',
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="bdg" style={{ background: '#fff1f2', color: '#be123c', fontWeight: 600, fontSize: '.72rem' }}>المناخ الأسري والتوافق النفسي</span>
                        <span className="bdg b-gr" style={{ fontWeight: 600, fontSize: '.72rem' }}>مقياس التفكك الأسري</span>
                      </div>
                      <h3 style={{ margin: '6px 0 4px 0', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        🏡 مقياس التفكك الأسري والمناخ النفسي للطفل
                      </h3>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 400 }}>
                        25 بنداً سيكومترياً · 4 أبعاد أسرية ونفسية (الاستقرار الأسري، الخلافات الوالدية، الإهمال العاطفي، والتواصل الأسري)
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => { setFamilyEditData(null); setFamilyModalOpen(true); }}
                      style={{ fontWeight: 800, padding: '9px 16px', borderRadius: 9, fontSize: '.86rem', background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#fff', width: '100%' }}
                    >
                      🚀 تطبيق وفحص مقياس التفكك الأسري
                    </button>
                  </div>
                </div>
              )}

              {/* SCALES GRID */}
              {filteredScales.length === 0 ? (
                // Only show EmptyState if we are NOT already showing featured cards inside autism or speech or LD or ADHD or Intelligence or Adaptive or Developmental categories
                !((['autism', 'speech_language', 'learning_academic', 'adhd', 'intelligence_cognitive', 'adaptive_behavior', 'developmental_early', 'behavioral_emotional'].includes(selectedCategoryFilter)) && !searchTerm) && (
                  <EmptyState
                    icon="🔍"
                    title="لم يتم العثور على مقاييس تطابق البحث أو الفئة المختارة"
                    sub="جرب تغيير الفئة التشخيصية أو تفريغ خانة البحث"
                  />
                )
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
                  {filteredScales.map(scale => {
                    const normCat = normalizeCategoryId(scale.category);
                    const catMeta = categoryMap[normCat] || { name: 'أداة تقييم', icon: '📝', color: '#1a56db' };

                    return (
                      <div
                        key={scale.id}
                        className="prog-scale-card"
                        style={{
                          border: selectedScaleId === scale.id ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                          background: selectedScaleId === scale.id ? 'var(--pr-l)' : 'var(--bg-card)',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 14,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 6 }}>
                          <span className="bdg b-bl" style={{ fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: 4, background: undefined, color: undefined }}>
                            <span>{catMeta.icon}</span>
                            <span>{catMeta.name}</span>
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                            {scale.items?.length || 80} بنداً
                          </span>
                        </div>

                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                          {scale.name}
                        </h4>
                        {scale.nameEn && (
                          <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 8, direction: 'ltr', textAlign: 'right', fontWeight: 400 }}>
                            {scale.nameEn}
                          </div>
                        )}

                        <p style={{ fontSize: '.78rem', color: 'var(--text-sub)', margin: '0 0 14px 0', minHeight: 40, lineHeight: 1.5, fontWeight: 400 }}>
                          {scale.description || scale.thresholdText || 'قائمة تقييم تساعد الأخصائي في تحديد مستوى الأداء وبناء خطة التدخل'}
                        </p>

                        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                          <button
                            type="button"
                            className="btn btn-p btn-sm"
                            style={{
                              flex: 1,
                              fontWeight: 700,
                              background: undefined,
                              borderColor: undefined,
                            }}
                            onClick={() => openNewScaleAssessment(scale.id)}
                          >
                            {'📝 تطبيق المقياس الآن'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Back to Categories bottom action removed to avoid duplication and clutter */}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: ASSESSMENTS RESULTS */}
      {subTab === 'results' && (
        <div>
          {/* Custom Filter Bar for Results */}
          <div className="prog-filter-bar">
            <div className="prog-filter-title">
              <span>📊 تصفية نتائج المقاييس:</span>
            </div>
            <input
              type="text"
              className="prog-search-input"
              placeholder="البحث باسم الطالب أو المقياس..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="prog-select-filter"
              value={selectedStudentFilter}
              onChange={e => setSelectedStudentFilter(e.target.value)}
            >
              <option value="">— كل الطلاب —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              className="prog-select-filter"
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
            >
              <option value="all">🌟 كل الفئات التشخيصية ({MEASUREMENT_CATEGORIES.length})</option>
              {MEASUREMENT_CATEGORIES.map(cat => {
                const count = (scalesGrouped[cat.id] || []).length;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name} ({count})
                  </option>
                );
              })}
            </select>
            {(searchTerm || selectedStudentFilter || selectedCategoryFilter !== 'all') && (
              <button
                type="button"
                className="btn btn-sm btn-g prog-filter-clear-btn"
                onClick={() => { setSearchTerm(''); setSelectedStudentFilter(''); setSelectedCategoryFilter('all'); }}
              >
                مسح التصفية ✖
              </button>
            )}
          </div>

          {filteredAssessments.length === 0 ? (
            <EmptyState icon="📊" title="لا توجد نتائج مقاييس مسجلة" sub="اختر أحد المقاييس وطبقه على طالب لحفظ نتائجه ومستواه" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filteredAssessments.map(item => {
                const isSpeech = item.measureId === 'speech_screening' || item.scaleType === 'speech_screening';
                const isAbuhasiba = item.measureId === 'abuhasiba_arabic_lang' || item.scaleType === 'abuhasiba_arabic_lang';
                const isLdes = item.measureId === 'learning_difficulties' || item.scaleType === 'learning_difficulties' || item.measureId === 'ldes';
                const isDevLd = item.measureId === 'dev_learning_difficulties' || item.scaleType === 'dev_learning_difficulties' || item.measureId === 'dev_ld_preschool' || item.scaleType === 'dev_ld_preschool';
                const isLddrs = item.measureId === 'lddrs_battery' || item.scaleType === 'lddrs' || item.measureId?.startsWith('lddrs');
                const isSartawi = item.measureId === 'sartawi_scale' || item.scaleType === 'sartawi_ld' || item.scaleType === 'sartawi';
                const isMyklebust = item.measureId === 'myklebust_scale' || item.scaleType === 'myklebust' || item.measureId === 'myklebust';
                const isFamily = item.measureId === 'family_disintegration' || item.scaleType === 'family_disintegration';
                const isSensory = item.measureId === 'sensory_integration_scale' || item.scaleType === 'sensory_integration' || item.isSensoryIntegration;
                const isDownSyndrome = item.isDownSyndrome || item.category === 'down_syndrome' || item.measureId?.startsWith('ds_') || item.scaleType === 'down_syndrome';
                return (
                  <div
                    key={item.id}
                    className="prog-item-card"
                    style={{
                      border: isDownSyndrome ? '1.5px solid #0891b2' : isSensory ? '1.5px solid #0284c7' : isFamily ? '1.5px solid #7c3aed' : isMyklebust ? '1.5px solid #0891b2' : isSartawi ? '1.5px solid #1e40af' : isLddrs ? '1.5px solid #dc2626' : isDevLd ? '1.5px solid #0d9488' : isLdes ? '1.5px solid #d97706' : isSpeech ? '1.5px solid #0284c7' : isAbuhasiba ? '1.5px solid #0369a1' : '1px solid var(--border-color)',
                      boxShadow: isDownSyndrome ? '0 4px 12px rgba(8, 145, 178, 0.08)' : isSensory ? '0 4px 12px rgba(2, 132, 199, 0.08)' : isFamily ? '0 4px 12px rgba(124, 58, 237, 0.08)' : isMyklebust ? '0 4px 12px rgba(8, 145, 178, 0.08)' : isSartawi ? '0 4px 12px rgba(30, 64, 175, 0.08)' : isLddrs ? '0 4px 12px rgba(220, 38, 38, 0.08)' : isDevLd ? '0 4px 12px rgba(13, 148, 136, 0.08)' : isLdes ? '0 4px 12px rgba(217, 119, 6, 0.08)' : isSpeech ? '0 4px 12px rgba(2, 132, 199, 0.08)' : isAbuhasiba ? '0 4px 12px rgba(3, 105, 161, 0.08)' : 'var(--sh)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <div>
                        <div className="prog-student-name" style={{ fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{item.studentName}</span>
                          {isDownSyndrome && <span className="bdg" style={{ background: '#cffafe', color: '#0e7490', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>🧬 متلازمة داون</span>}
                          {isSpeech && <span className="bdg" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>فحص النطق</span>}
                          {isAbuhasiba && <span className="bdg" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>أبو حسيبة PLS</span>}
                          {isLdes && <span className="bdg" style={{ background: '#fef3c7', color: '#b45309', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>LDES صعوبات التعلم</span>}
                          {isDevLd && <span className="bdg" style={{ background: '#ccfbf1', color: '#0f766e', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>قائمة صعوبات الروضة</span>}
                          {isLddrs && <span className="bdg" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>بطارية الزيات LDDRS</span>}
                          {isSartawi && <span className="bdg" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>مقياس السرطاوي (50)</span>}
                          {isMyklebust && <span className="bdg" style={{ background: '#cffafe', color: '#0e7490', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>مايكل بست PRS</span>}
                          {isFamily && <span className="bdg" style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>التفكك الأسري</span>}
                          {isSensory && <span className="bdg" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '.68rem', padding: '1px 6px', fontWeight: 800 }}>التكامل الحسي (90)</span>}
                        </div>
                        <div className="prog-student-meta">{item.measureName} · {item.date}</div>
                      </div>
                      <span className="bdg b-gr" style={{ fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>
                        {isSensory ? `الخام: ${item.score || 0} / 90` : isFamily ? `الخام: ${item.score || 0} / 130` : isMyklebust ? `الخام: ${item.score || 0} / 120 (LQ=${item.lq || item.psychometrics?.learningQuotient || '—'})` : isSartawi ? `الخام: ${item.score || 0} / 250 (T=${item.tScore || item.psychometrics?.totalTScore || '—'})` : isLddrs ? `الدرجة الكلية: ${item.score || 0}` : isDevLd ? `الخام: ${item.score} / ${item.maxScore || 160}` : isLdes ? `معامل LDEQ: ${item.ldeq || item.score}` : isSpeech ? `سليم: ${item.score} / ${item.maxScore}` : isAbuhasiba ? `الخام: ${item.score} / 133` : `الدرجة: ${item.score} / ${item.maxScore}`}
                      </span>
                    </div>




                    {isSensory && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>المستوى: <strong style={{ color: item.severityColor || '#0284c7' }}>{item.level || 'طبيعي'}</strong></span>
                        <span>نسبة الأداء: <strong style={{ color: item.severityColor || '#0284c7' }}>{item.percentage || '—'}</strong></span>
                        <span>الدرجة الكلية: <strong style={{ color: '#0284c7' }}>{item.score || 0} من 90</strong></span>
                      </div>
                    )}

                    {isFamily && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>المستوى: <strong style={{ color: item.severityColor || '#7c3aed' }}>{item.level || 'طبيعي'}</strong></span>
                        <span>نسبة التفكك: <strong style={{ color: item.severityColor || '#7c3aed' }}>{item.percentage || '—'}</strong></span>
                        <span>المتوسط الفرضي: <strong style={{ color: 'var(--text-main)' }}>78 درجة</strong></span>
                      </div>
                    )}

                    {isMyklebust && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>التشخيص: <strong style={{ color: item.severityColor || '#0891b2' }}>{item.level || item.psychometrics?.overallStatus || 'مايكل بست'}</strong></span>
                        <span>حاصل التعلم: <strong style={{ color: '#0891b2' }}>LQ = {item.lq || item.psychometrics?.learningQuotient || '—'}</strong></span>
                        {item.psychometrics?.deficitAreas && (
                          <span>المجالات المتأثرة: <strong style={{ color: '#dc2626' }}>{item.psychometrics.deficitAreas.length} من 5</strong></span>
                        )}
                      </div>
                    )}

                    {isLddrs && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>التشخيص: <strong style={{ color: item.severityColor || '#dc2626' }}>{item.level || 'تشخيص الزيات'}</strong></span>
                        {item.psychometrics?.deficitScales && (
                          <span>المجالات المتأثرة: <strong style={{ color: '#dc2626' }}>{item.psychometrics.deficitScales.length} من 8</strong></span>
                        )}
                      </div>
                    )}

                    {isDevLd && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>نسبة الصعوبة: <strong style={{ color: '#0f766e' }}>{item.percentage || '0%'}</strong></span>
                        <span>التصنيف الإكلينيكي: <strong style={{ color: item.severityColor || '#0f766e' }}>{item.level || 'طبيعي'}</strong></span>
                        {item.affectedDomainsCount !== undefined && (
                          <span>المجالات المتأثرة: <strong style={{ color: '#b91c1c' }}>{item.affectedDomainsCount} من 6</strong></span>
                        )}
                      </div>
                    )}

                    {isLdes && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>حاصل صعوبات التعلم: <strong style={{ color: '#b45309' }}>{item.ldeq || item.score} LDEQ</strong></span>
                        <span>رتبة مئينية: <strong style={{ color: '#b45309' }}>{item.overallPercentile || item.percentile || '—'}%</strong></span>
                        <span>مجموع الدرجات المعيارية: <strong style={{ color: 'var(--text-main)' }}>{item.sumScaledScores || '—'} / 140</strong></span>
                      </div>
                    )}












                    {isSpeech && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>دقة النطق الفونيمي: <strong style={{ color: '#0284c7' }}>{item.percentage}</strong></span>
                        <span>مستوى النطق: <strong style={{ color: item.severityColor || '#0284c7' }}>{item.level}</strong></span>
                      </div>
                    )}


                    {isAbuhasiba && (
                      <div style={{ display: 'flex', gap: 10, margin: '4px 0 8px 0', fontSize: '.76rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                        <span>درجة معيارية: <strong style={{ color: '#0369a1' }}>{item.standardScore || '—'}</strong></span>
                        <span>رتبة مئينية: <strong style={{ color: '#0369a1' }}>{item.percentile || '—'}%</strong></span>
                        <span>عمر مكافئ: <strong style={{ color: '#0369a1' }}>{item.ageEquivalent || '—'}</strong></span>
                        <span>فجوة التأخر: <strong style={{ color: '#b91c1c' }}>{item.delayGap || '—'}</strong></span>
                      </div>
                    )}


                    <div style={{ display: 'flex', gap: 8, margin: '8px 0', alignItems: 'center' }}>
                      <div style={{ flex: 1, background: 'var(--g1)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: item.percentage || '50%', background: isSpeech ? '#0284c7' : isAbuhasiba ? '#0369a1' : 'var(--pr)', height: '100%' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.percentage}</span>
                    </div>

                    <div style={{ fontSize: '0.84rem', margin: '6px 0' }}>
                      <span style={{ color: 'var(--text-sub)' }}>المستوى التقديري: </span>
                      <strong style={{ color: item.severityColor || (isSpeech ? '#0284c7' : isAbuhasiba ? '#0369a1' : 'var(--pr)') }}>{item.level}</strong>
                    </div>

                    {item.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: 4 }}>{item.notes}</div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-xs btn-p"
                          style={{
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #4338ca, #2563eb)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          onClick={() => handleOpenBridge(item)}
                          title="اشتقاق أهداف سلوكية للخطة التربوية الفردية (IEP) تلقائياً من بنود التقييم"
                        >
                          <span>🎓</span>
                          <span>اشتقاق خطة فردية (IEP)</span>
                        </button>



                        {isSartawi && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewSartawiReport(item)}
                            style={{ fontWeight: 800, background: '#1e40af', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isSartawi && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditSartawiAssessment(item)}
                            title="تعديل درجات مقياس السرطاوي"
                          >
                            ✏️
                          </button>
                        )}

                        {isMyklebust && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewMyklebustReport(item)}
                            style={{ fontWeight: 800, background: '#0891b2', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isMyklebust && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditMyklebustAssessment(item)}
                            title="تعديل درجات مايكل بيست"
                          >
                            ✏️
                          </button>
                        )}

                        {isFamily && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewFamilyReport(item)}
                            style={{ fontWeight: 800, background: '#7c3aed', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isFamily && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditFamilyAssessment(item)}
                            title="تعديل درجات مقياس التفكك الأسري"
                          >
                            ✏️
                          </button>
                        )}

                        {isSensory && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewSensoryReport(item)}
                            style={{ fontWeight: 800, background: '#0284c7', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isSensory && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditSensoryAssessment(item)}
                            title="تعديل درجات مقياس التكامل الحسي"
                          >
                            ✏️
                          </button>
                        )}

                        {isLddrs && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewLddrsReport(item)}
                            style={{ fontWeight: 800, background: '#dc2626', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isLddrs && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditLddrsAssessment(item)}
                            title="تعديل درجات بطارية الزيات"
                          >
                            ✏️
                          </button>
                        )}

                        {isDevLd && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewDevLdReport(item)}
                            style={{ fontWeight: 800, background: '#0d9488', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isDevLd && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditDevLdAssessment(item)}
                            title="تعديل درجات قائمة صعوبات التعلم النمائية"
                          >
                            ✏️
                          </button>
                        )}
                        {isLdes && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewLdesReport(item)}
                            style={{ fontWeight: 800, background: '#d97706', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isLdes && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditLdesAssessment(item)}
                            title="تعديل درجات مقياس LDES"
                          >
                            ✏️
                          </button>
                        )}











                        {isSpeech && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewSpeechReport(item)}
                            style={{ fontWeight: 800, background: '#0284c7', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isSpeech && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditSpeechAssessment(item)}
                            title="تعديل درجات البنود"
                          >
                            ✏️
                          </button>
                        )}


                        {isAbuhasiba && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewAbuhasibaReport(item)}
                            style={{ fontWeight: 800, background: '#0369a1', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isAbuhasiba && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditAbuhasibaAssessment(item)}
                            title="تعديل درجات البنود"
                          >
                            ✏️
                          </button>
                        )}



                        {isDownSyndrome && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => openViewDsReport(item)}
                            style={{ fontWeight: 800, background: '#0891b2', color: '#fff' }}
                          >
                            📄 التقرير
                          </button>
                        )}
                        {isDownSyndrome && (
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => openEditDsAssessment(item)}
                            title="تعديل درجات البنود"
                          >
                            ✏️
                          </button>
                        )}
                        {(() => {
                          const univCfg = getUniversalConfigByScaleType(item.measureId || item.scaleType || item.scaleId);
                          if (!univCfg) return null;
                          return (
                            <button
                              type="button"
                              className="btn btn-xs btn-g"
                              onClick={() => openUniversalAssessment(univCfg, item)}
                              title={`تعديل درجات مقياس ${univCfg.title || item.scaleName || ''}`}
                            >
                              ✏️
                            </button>
                          );
                        })()}
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-xs btn-bl"
                          onClick={() => printScaleAssessmentItem(item)}
                          title="طباعة التقرير والنتيجة الرسمية"
                        >
                          🖨️ طباعة
                        </button>
                        {item.parentPhone && (
                          <button
                            type="button"
                            className="btn btn-xs btn-s"
                            onClick={() => {
                              sendReportToWhatsApp({
                                parentPhone: item.parentPhone,
                                parentName: item.parentName,
                                studentName: item.studentName,
                                reportTitle: `نتيجة مقياس ${item.measureName}`,
                                reportType: 'نتائج الاختبارات والتشخيص',
                                date: item.date,
                                summary: `الدرجة المحققة: ${item.score}/${item.maxScore} (${item.percentage}) — المستوى التقديري: ${item.level}`,
                                recommendations: item.recommendations || item.notes,
                                specialistName: item.specialistName,
                                centerName: center?.name,
                              });
                            }}
                          >
                            💬 واتساب
                          </button>
                        )}
                        <button type="button" className="btn btn-xs btn-d" onClick={() => delScaleAssessment(item.id)}>🗑️ حذف</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}















      {evalModal && (
        <InitialAssessmentModal
          isOpen={evalModal}
          onClose={() => { setEvalModal(false); setSelectedEvalItem(null); }}
          onSaved={() => { reload(); }}
          students={students}
          emps={emps}
          initialData={selectedEvalItem}
        />
      )}

      {scaleModal && activeScale && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setScaleModal(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: 'min(94vh, calc(100dvh - 20px))', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd modal-header-custom" style={{ padding: '12px 18px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)' }}>🧪 تطبيق مقياس: {activeScale.name}</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>{activeScale.items?.length || 0} بنداً تشخيصياً معتمداً</span>
              </div>
              <button type="button" className="btn btn-xs btn-p" onClick={() => setScaleModal(false)} style={{ fontWeight: 700 }}>✖ إغلاق</button>
            </div>
            <div className="modal-body-scroll" style={{ padding: '16px 18px', flex: 1, overflowY: 'auto' }}>
              <div className="fg c2" style={{ marginBottom: 14 }}>
                <StudentPicker form={scaleForm} setForm={setScaleForm} students={students} emps={emps} showExtra />
                <div className="fl">
                  <label>تاريخ التطبيق</label>
                  <input type="date" value={scaleForm.date} onChange={e => setScaleForm(f => ({ ...f, date: e.target.value }))}/>
                </div>
              </div>

              <div style={{ background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                <p style={{ fontSize: '.8rem', color: 'var(--text-sub)', margin: 0 }}>حدد تقدير الدرجة لكل بند بناءً على الملاحظة المباشرة وسلوك الطفل:</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(activeScale.items || []).map((it, idx) => {
                  const options = getScaleOptions(activeScale);
                  return (
                    <div key={it.id} style={{ padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-card)' }}>
                      <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 8 }}>
                        {idx + 1}. {it.text}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {options.map((opt, oIdx) => {
                          const val = typeof opt === 'object' && opt !== null ? opt.value : opt;
                          const label = typeof opt === 'object' && opt !== null ? opt.label : `درجة ${val}`;
                          return (
                            <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: 6, cursor: 'pointer', background: scaleResponses[it.id] === val ? 'var(--pr-l)' : 'transparent' }}>
                              <input
                                type="radio"
                                name={`scale_item_${it.id}`}
                                checked={scaleResponses[it.id] === val}
                                onChange={() => handleScaleOptionChange(it.id, val)}
                              />
                              <span style={{ fontSize: '.8rem' }}>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="fl full" style={{ marginTop: 14 }}>
                <label>ملاحظات وتوصيات إضافية للأخصائي</label>
                <textarea
                  value={scaleForm.notes}
                  onChange={e => setScaleForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="ملاحظات حول استجابة الطفل وظروف الاختبار..."
                />
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveScaleAssessment}>💾 حفظ وحساب نتيجة المقياس</button>
              <button type="button" className="btn btn-g" onClick={() => setScaleModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {bridgeOpen && bridgeAssessment && (
        <IepBridgeModal
          isOpen={bridgeOpen}
          onClose={() => setBridgeOpen(false)}
          student={{
            studentId: bridgeAssessment.stuId || bridgeAssessment.studentId,
            studentName: bridgeAssessment.studentName,
            nationalId: bridgeAssessment.nationalId,
            diagnosis: bridgeAssessment.diagnosis,
            className: bridgeAssessment.className,
            parentName: bridgeAssessment.parentName,
            parentPhone: bridgeAssessment.parentPhone,
          }}
          assessmentData={{
            ...bridgeAssessment,
            measureId: bridgeAssessment.measureId || bridgeAssessment.scaleType || '',
            measureName: bridgeAssessment.measureName || 'المقياس',
            date: bridgeAssessment.date,
            score: bridgeAssessment.score,
            results: bridgeAssessment.results || bridgeAssessment.scores || bridgeAssessment.responses || {},
            rawOverrides: bridgeAssessment.rawOverrides || {},
            psychometrics: bridgeAssessment.psychometrics || null,
          }}
          scaleItems={bridgeScaleItems}
        />
      )}

      {speechModalOpen && (
        <SpeechArticulationAssessmentModal
          isOpen={speechModalOpen}
          onClose={() => setSpeechModalOpen(false)}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={speechEditData}
        />
      )}

      {speechReportOpen && selectedSpeechAssessment && (
        <SpeechArticulationReportModal
          isOpen={speechReportOpen}
          onClose={() => setSpeechReportOpen(false)}
          assessment={selectedSpeechAssessment}
          onEdit={(item) => openEditSpeechAssessment(item)}
        />
      )}



      {abuhasibaModalOpen && (
        <AbuHasibaAssessmentModal
          isOpen={abuhasibaModalOpen}
          onClose={() => setAbuhasibaModalOpen(false)}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={abuhasibaEditData}
        />
      )}

      {abuhasibaReportOpen && selectedAbuhasibaAssessment && (
        <AbuHasibaReportModal
          isOpen={abuhasibaReportOpen}
          onClose={() => setAbuhasibaReportOpen(false)}
          assessment={selectedAbuhasibaAssessment}
          onEdit={(item) => openEditAbuhasibaAssessment(item)}
        />
      )}

      {ldesModalOpen && (
        <LDESAssessmentModal
          isOpen={ldesModalOpen}
          onClose={() => setLdesModalOpen(false)}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={ldesEditData}
        />
      )}

      {ldesReportOpen && selectedLdesAssessment && (
        <LDESReportModal
          isOpen={ldesReportOpen}
          onClose={() => setLdesReportOpen(false)}
          assessment={selectedLdesAssessment}
          onEdit={(item) => openEditLdesAssessment(item)}
        />
      )}

      {devLdModalOpen && (
        <DevLdAssessmentModal
          isOpen={devLdModalOpen}
          onClose={() => setDevLdModalOpen(false)}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={devLdEditData}
        />
      )}

      {devLdReportOpen && selectedDevLdAssessment && (
        <DevLdReportModal
          isOpen={devLdReportOpen}
          onClose={() => setDevLdReportOpen(false)}
          assessment={selectedDevLdAssessment}
          onEdit={(item) => openEditDevLdAssessment(item)}
        />
      )}

      {lddrsModalOpen && (
        <LDDRSAssessmentModal
          isOpen={lddrsModalOpen}
          onClose={() => {
            setLddrsModalOpen(false);
            setLddrsEditData(null);
          }}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={lddrsEditData}
        />
      )}

      {lddrsReportOpen && selectedLddrsAssessment && (
        <LDDRSReportModal
          isOpen={lddrsReportOpen}
          onClose={() => setLddrsReportOpen(false)}
          assessment={selectedLddrsAssessment}
          onEdit={(item) => openEditLddrsAssessment(item)}
        />
      )}

      {sartawiModalOpen && (
        <SartawiAssessmentModal
          isOpen={sartawiModalOpen}
          onClose={() => {
            setSartawiModalOpen(false);
            setSartawiEditData(null);
          }}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={sartawiEditData}
        />
      )}

      {sartawiReportOpen && selectedSartawiAssessment && (
        <SartawiReportModal
          isOpen={sartawiReportOpen}
          onClose={() => setSartawiReportOpen(false)}
          assessment={selectedSartawiAssessment}
          onEdit={(item) => openEditSartawiAssessment(item)}
        />
      )}

      {myklebustModalOpen && (
        <MyklebustAssessmentModal
          isOpen={myklebustModalOpen}
          onClose={() => {
            setMyklebustModalOpen(false);
            setMyklebustEditData(null);
          }}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={myklebustEditData}
        />
      )}

      {myklebustReportOpen && selectedMyklebustAssessment && (
        <MyklebustReportModal
          isOpen={myklebustReportOpen}
          onClose={() => setMyklebustReportOpen(false)}
          assessment={selectedMyklebustAssessment}
          onEdit={(item) => openEditMyklebustAssessment(item)}
        />
      )}

      {familyModalOpen && (
        <FamilyDisintegrationAssessmentModal
          isOpen={familyModalOpen}
          onClose={() => {
            setFamilyModalOpen(false);
            setFamilyEditData(null);
          }}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={familyEditData}
        />
      )}

      {familyReportOpen && selectedFamilyAssessment && (
        <FamilyDisintegrationReportModal
          isOpen={familyReportOpen}
          onClose={() => setFamilyReportOpen(false)}
          assessment={selectedFamilyAssessment}
          onEdit={(item) => openEditFamilyAssessment(item)}
        />
      )}

      {sensoryModalOpen && (
        <SensoryIntegrationAssessmentModal
          isOpen={sensoryModalOpen}
          onClose={() => {
            setSensoryModalOpen(false);
            setSensoryEditData(null);
          }}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          students={students}
          emps={emps}
          initialData={sensoryEditData}
        />
      )}

      {sensoryReportOpen && selectedSensoryAssessment && (
        <SensoryIntegrationReportModal
          isOpen={sensoryReportOpen}
          onClose={() => setSensoryReportOpen(false)}
          assessment={selectedSensoryAssessment}
          onEdit={(item) => openEditSensoryAssessment(item)}
        />
      )}







      {dsModalOpen && (
        <DownSyndromeAssessmentModal
          isOpen={dsModalOpen}
          onClose={() => {
            setDsModalOpen(false);
            setDsEditData(null);
          }}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          onOpenIepBridge={(assessmentData) => {
            setDsModalOpen(false);
            setDsEditData(null);
            reload();
            handleOpenBridge(assessmentData);
          }}
          students={students}
          emps={emps}
          initialData={dsEditData}
          initialScaleId={dsInitialScaleId}
        />
      )}

      {dsReportOpen && selectedDsAssessment && (
        <DownSyndromeReportModal
          isOpen={dsReportOpen}
          onClose={() => setDsReportOpen(false)}
          assessment={selectedDsAssessment}
          onEdit={(item) => openEditDsAssessment(item)}
          onOpenIepBridge={(item) => handleOpenBridge(item)}
        />
      )}











      {/* UNIVERSAL ASSESSMENT MASTER MODAL */}
      {universalModalOpen && universalScaleConfig && (
        <UniversalAssessmentModal
          isOpen={universalModalOpen}
          onClose={() => {
            setUniversalModalOpen(false);
            setUniversalEditData(null);
            setUniversalScaleConfig(null);
          }}
          onSaved={() => {
            reload();
            setSubTab('results');
          }}
          scaleConfig={universalScaleConfig}
          students={students}
          emps={emps}
          initialData={universalEditData}
        />
      )}
    </div>
  );
}
