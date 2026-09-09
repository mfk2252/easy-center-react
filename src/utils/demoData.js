/**
 * Demo Data Generator & Initializer
 * يُهيئ بيئة تجريبية واقعية وكاملة ومعزولة 100% لمراكز التربية الخاصة والتأهيل
 * عند تصفح النظام بحساب الديمو التفاعلي، متضمنة الأخصائيين، الطلاب، الخطط الفردية (IEP)،
 * خطط تعديل السلوك (BIP)، الجلسات، والحسابات.
 */

import { fbBatchSet, updateCenterSettings } from '../firebase/db';

export function initDemoData(centerId = 'demo_center', visitorName = '', customCenterName = '', daysLeft = 3) {
  try {
    const prefix = `${centerId}_`;
    const resolvedCenterName = customCenterName ? `${customCenterName} (بيئة تجريبية)` : 'مركز الأمل للتأهيل والتربية الخاصة (بيئة تجريبية)';
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. بيانات المركز التجريبي
    const demoCenter = {
      centerId,
      id: centerId,
      name: resolvedCenterName,
      centerName: resolvedCenterName,
      nameEn: 'Special Education & Rehabilitation Center (Demo)',
      type: 'تأهيل شامل وتربية خاصة ونطق وتخاطب',
      managerName: visitorName || 'مدير تجريبي (زائر)',
      managerEmail: 'demo@easycenter.local',
      ownerEmail: 'demo@easycenter.local',
      phone: '0501234567',
      phoneCode: '+966',
      country: 'SA',
      countryCode: 'SA',
      countryNameAr: 'المملكة العربية السعودية',
      countryNameEn: 'Saudi Arabia',
      address: 'الرياض - حي الياسمين - طريق الملك عبدالعزيز',
      currency: 'SAR',
      color: '#1a56db',
      fontFamily: 'dubai',
      fontSize: '15',
      fontWeight: '400',
      isSetup: true,
      setupCompleted: true,
      configured: true,
      status: 'active',
      subscription: {
        status: 'trial',
        daysLeft: Math.max(1, parseInt(daysLeft, 10) || 3),
        allowed: true,
        reason: 'demo',
        isDemo: true,
      },
    };

    localStorage.setItem(`scs_center_settings_${centerId}`, JSON.stringify(demoCenter));
    localStorage.setItem(`${prefix}center_settings`, JSON.stringify(demoCenter));

    // 2. الكادر والأخصائيين المعتمدين للديمو (فريق متعدد التخصصات)
    const demoEmployees = [
      {
        id: 'emp_demo_1',
        name: 'د. سارة المنصور',
        jobTitle: 'أخصائية نفسية وتحليل سلوك تطبيقي (BCBA)',
        role: 'specialist',
        department: 'قسم تعديل السلوك والتوحد',
        phone: '0551112233',
        email: 'sara@demo.local',
        nationalId: '1087654321',
        salary: 12500,
        status: 'active',
      },
      {
        id: 'emp_demo_2',
        name: 'أ. هدى الحربي',
        jobTitle: 'أخصائية نطق ولغة وتخاطب',
        role: 'specialist',
        department: 'قسم التخاطب واضطرابات البلع',
        phone: '0552223344',
        email: 'huda@demo.local',
        nationalId: '1076543210',
        salary: 10000,
        status: 'active',
      },
      {
        id: 'emp_demo_3',
        name: 'د. عمر الفاروق',
        jobTitle: 'أخصائي علاج وظيفي وتكامل حسي',
        role: 'specialist',
        department: 'قسم العلاج الطبيعي والوظيفي',
        phone: '0553334455',
        email: 'omar@demo.local',
        nationalId: '1065432109',
        salary: 11500,
        status: 'active',
      },
      {
        id: 'emp_demo_4',
        name: 'أ. منى الدوسري',
        jobTitle: 'معلمة تربية خاصة وصعوبات تعلم',
        role: 'teacher',
        department: 'قسم التعليم الخاص والمساند',
        phone: '0554445566',
        email: 'mona@demo.local',
        nationalId: '1054321098',
        salary: 9500,
        status: 'active',
      },
    ];
    localStorage.setItem(`${prefix}employees`, JSON.stringify(demoEmployees));

    // 3. الطلاب التجريبيين (ملفات واقعية كاملة)
    const demoStudents = [
      {
        id: 'stu_demo_1',
        name: 'ريان أحمد العتيبي',
        fileNo: 'STU-2026-001',
        nationalId: '1102938475',
        dob: '2019-04-12',
        gender: 'male',
        diagnosis: 'اضطراب طيف التوحد (درجة متوسطة)',
        classification: 'autism',
        guardianName: 'أحمد بن فهد العتيبي',
        guardianPhone: '0555123456',
        guardianRelation: 'أب',
        emergencyPhone: '0555987654',
        bloodType: 'O+',
        enrollmentDate: '2025-09-01',
        status: 'active',
        section: 'التوحد وتعديل السلوك',
        specialistName: 'د. سارة المنصور',
        specialistId: 'emp_demo_1',
        notes: 'يستجيب جيداً للتعزيز البصري وجداول بيكس (PECS)',
        iepGoalsCount: 4,
        progressRate: 78,
      },
      {
        id: 'stu_demo_2',
        name: 'سارة خالد الشمري',
        fileNo: 'STU-2026-002',
        nationalId: '1109847362',
        dob: '2018-08-25',
        gender: 'female',
        diagnosis: 'تأخر نمائي لغوي واضطراب نطق وتخاطب',
        classification: 'speech',
        guardianName: 'خالد بن ناصر الشمري',
        guardianPhone: '0504112233',
        guardianRelation: 'أب',
        emergencyPhone: '0504998877',
        bloodType: 'A+',
        enrollmentDate: '2025-10-15',
        status: 'active',
        section: 'النطق والتخاطب',
        specialistName: 'أ. هدى الحربي',
        specialistId: 'emp_demo_2',
        notes: 'جلسات تخاطب فردية 3 مرات أسبوعياً، تحسن كبير في مخارج الأصوات الحلقية',
        iepGoalsCount: 3,
        progressRate: 85,
      },
      {
        id: 'stu_demo_3',
        name: 'عمر يوسف القحطاني',
        fileNo: 'STU-2026-003',
        nationalId: '1114758392',
        dob: '2020-01-10',
        gender: 'male',
        diagnosis: 'متلازمة داون (تأخر حركي ونمائي)',
        classification: 'down',
        guardianName: 'يوسف بن سالم القحطاني',
        guardianPhone: '0567334455',
        guardianRelation: 'أب',
        emergencyPhone: '0567001122',
        bloodType: 'B+',
        enrollmentDate: '2025-11-01',
        status: 'active',
        section: 'العلاج الوظيفي والتأهيل الحركي',
        specialistName: 'د. عمر الفاروق',
        specialistId: 'emp_demo_3',
        notes: 'خطة علاج وظيفي وتكامل حسي، تدريب على مهارات الاستقلالية اليومية',
        iepGoalsCount: 3,
        progressRate: 70,
      },
      {
        id: 'stu_demo_4',
        name: 'نورة فهد السبيعي',
        fileNo: 'STU-2026-004',
        nationalId: '1120938471',
        dob: '2017-06-18',
        gender: 'female',
        diagnosis: 'صعوبات تعلم محددة (ديسلكسيا ونمائي)',
        classification: 'learning_disabilities',
        guardianName: 'فهد بن محمد السبيعي',
        guardianPhone: '0533221100',
        guardianRelation: 'أب',
        emergencyPhone: '0533887766',
        bloodType: 'AB+',
        enrollmentDate: '2025-09-10',
        status: 'active',
        section: 'صعوبات التعلم والتربية الخاصة',
        specialistName: 'أ. منى الدوسري',
        specialistId: 'emp_demo_4',
        notes: 'تطبيق برامج مايكلبست وتعديل الاستراتيجيات البصرية',
        iepGoalsCount: 4,
        progressRate: 88,
      },
    ];
    localStorage.setItem(`${prefix}students`, JSON.stringify(demoStudents));

    // 4. الخطط التربوية الفردية التخصصية (IEP Programs) - حصرية ومعزولة للمركز التجريبي
    const demoPrograms = [
      {
        id: 'prog_demo_1',
        stuId: 'stu_demo_1',
        studentName: 'ريان أحمد العتيبي',
        specialistName: 'د. سارة المنصور',
        title: 'الخطة التربوية الفردية (IEP) - التواصل الوظيفي والتفاعل الاجتماعي والتهيئة السلوكية',
        duration: 'فصل دراسي (3 أشهر)',
        startDate: '2025-09-01',
        reviewDate: '2025-12-15',
        status: 'active',
        academicYear: 'العام الدراسي 1447 / 1448هـ',
        academicYearId: 'ay_demo_current',
        cycleNumber: 1,
        goals: [
          {
            id: 'g_1',
            code: 'COG-01',
            domain: 'cognitive',
            program: 'البرنامج الإدراكي المعرفي',
            text: 'أن يطابق الطالب الصور المتشابهة للأشياء الواقعية من بين 4 خيارات بنسبة إتقان 85%',
            mastery: '85%',
            progress: 85,
            status: 'achieved',
          },
          {
            id: 'g_2',
            code: 'COM-02',
            domain: 'communication',
            program: 'برنامج التواصل الوظيفي بيكس (PECS)',
            text: 'أن يسحب الطالب بطاقة الصورة المعبرة عن رغبته ويسلمها للأخصائي لطلب المعزز',
            mastery: '80%',
            progress: 75,
            status: 'in_progress',
          },
          {
            id: 'g_3',
            code: 'SOC-03',
            domain: 'social',
            program: 'برنامج التفاعل والمشاركة الاجتماعية',
            text: 'أن يستجيب الطالب للمناداة باسمه عبر التواصل البصري لمدة 3 ثوانٍ متتالية',
            mastery: '80%',
            progress: 70,
            status: 'in_progress',
          },
          {
            id: 'g_4',
            code: 'BEH-04',
            domain: 'behavioral',
            program: 'برنامج التكيف السلوكي والانتقال الهادئ',
            text: 'خفض تكرار نوبات الرفض عند الانتقال بين الأنشطة التعليمية إلى أقل من مرتين أسبوعياً',
            mastery: '90%',
            progress: 80,
            status: 'in_progress',
          },
        ],
        activities: 'أنشطة مطابقة بصرية تفاعلية، تدريب التواصل بالصور PECS المرحلة الثالثة، تعزيز تفاضلي فوري',
        notes: 'تطور ملحوظ في الانتباه المشترك وتقليل مقاومة الانتقال بين الجلسات بفضل الجداول المصورة',
      },
      {
        id: 'prog_demo_2',
        stuId: 'stu_demo_2',
        studentName: 'سارة خالد الشمري',
        specialistName: 'أ. هدى الحربي',
        title: 'خطة التأهيل اللغوي الفردية (IEP) - مخارج الحروف وتنمية الحصيلة اللفظية التعبيرية',
        duration: 'فصل دراسي (3 أشهر)',
        startDate: '2025-09-15',
        reviewDate: '2025-12-20',
        status: 'active',
        academicYear: 'العام الدراسي 1447 / 1448هـ',
        academicYearId: 'ay_demo_current',
        cycleNumber: 1,
        goals: [
          {
            id: 'g_21',
            code: 'SPH-01',
            domain: 'articulation',
            program: 'برنامج النطق وتصحيح مخارج الأصوات',
            text: 'نطق صوت الراء بصورة سليمة في كلمات منفردة مكونة من مقطعين بنسبة نجاح 80%',
            mastery: '80%',
            progress: 90,
            status: 'achieved',
          },
          {
            id: 'g_22',
            code: 'LNG-02',
            domain: 'expressive',
            program: 'برنامج اللغة التعبيرية وبناء الجملة',
            text: 'أن تكون الطالبة جملة من كلمتين (فعل + اسم) مثل "أريد لعبة" في 4 من أصل 5 محاولات',
            mastery: '85%',
            progress: 80,
            status: 'in_progress',
          },
          {
            id: 'g_23',
            code: 'REC-03',
            domain: 'receptive',
            program: 'برنامج اللغة الاستقبالية وتصنيف المفاهيم',
            text: 'أن تميز الطالبة بين أدوات الطعام وأدوات اللعب بالإشارة الصحيحة عند التسمية',
            mastery: '90%',
            progress: 85,
            status: 'in_progress',
          },
        ],
        activities: 'تمارين نفخ وتقوية عضلات الفم واللسان، مرآة التدريب الصوتي، بطاقات التسمية والتركيب اللغوي',
        notes: 'استجابة ممتازة لجلسات التخاطب بمعدل 3 جلسات أسبوعياً مع تدريب أسري منزلي موازي',
      },
      {
        id: 'prog_demo_3',
        stuId: 'stu_demo_3',
        studentName: 'عمر يوسف القحطاني',
        specialistName: 'د. عمر الفاروق',
        title: 'خطة العلاج الوظيفي والتكامل الحسي (IEP) - التناسق الحركي الدقيق واستقلالية العناية الذاتية',
        duration: 'فصل دراسي (3 أشهر)',
        startDate: '2025-10-01',
        reviewDate: '2026-01-10',
        status: 'active',
        academicYear: 'العام الدراسي 1447 / 1448هـ',
        academicYearId: 'ay_demo_current',
        cycleNumber: 1,
        goals: [
          {
            id: 'g_31',
            code: 'MOT-01',
            domain: 'motor_fine',
            program: 'برنامج تنمية المهارات الحركية الدقيقة',
            text: 'مسك القلم بالقبضة الثلاثية الصحيحة وتوصيل خطين مستقيمين دون مساعدة بدقة 75%',
            mastery: '75%',
            progress: 70,
            status: 'in_progress',
          },
          {
            id: 'g_32',
            code: 'SEN-02',
            domain: 'sensory',
            program: 'برنامج التكامل الحسي والتنظيم العصبي',
            text: 'المشاركة في أنشطة الملامس الحسية (الصلصال والرمل والماء) لمدة 10 دقائق دون تجنب',
            mastery: '80%',
            progress: 80,
            status: 'in_progress',
          },
          {
            id: 'g_33',
            code: 'SLF-03',
            domain: 'self_care',
            program: 'برنامج مهارات الحياة اليومية والاستقلالية',
            text: 'ارتداء السترة وإغلاق السحاب البلاستيكي الكبير باستقلالية بنسبة 85%',
            mastery: '85%',
            progress: 75,
            status: 'in_progress',
          },
        ],
        activities: 'صالة التكامل الحسي، تمارين المرجحة والتوازن، تدريبات الأزرار ومقابض اليد، العجين العلاجي',
        notes: 'تحسن مستمر في التناسق العضلي البصري وزيادة فترة التركيز داخل غرفة العلاج الوظيفي',
      },
    ];
    localStorage.setItem(`${prefix}progPrograms`, JSON.stringify(demoPrograms));

    // 5. خطط تعديل السلوك (BIP Behavior Intervention Plans)
    const demoBIP = [
      {
        id: 'bip_demo_1',
        stuId: 'stu_demo_1',
        studentName: 'ريان أحمد العتيبي',
        specialistName: 'د. سارة المنصور',
        date: todayStr,
        title: 'خطة التدخل السلوكي (BIP) - خفض سلوك الصراخ عند الانتقال بين الأنشطة',
        proceduralBehavior: 'الصراخ المرتفع والرمي بالأدوات على الأرض عند إعلان انتهاء النشاط المحبب',
        targetBehaviors: 'الصراخ وإلقاء الأدوات التعليمية',
        antecedents: 'انتهاء النشاط الترفيهي المفضل والإشارة إلى بدء الجلسة الإدراكية',
        consequences: 'تأخير الانتقال أو محاولة المربي تهدئة الطالب مما يعزز السلوك لا إرادياً',
        behaviorFunction: 'escape',
        observationMethod: 'frequency',
        baselineLevel: 'تكرار بمعدل 7 إلى 9 مرات يومياً عند كل انتقال رئيسي',
        replacementBehaviors: 'استخدام بطاقة "استراحة 2 دقيقة" أو بطاقة "المؤقت البصري" لطلب الاستعداد',
        reinforcementStrategies: 'التعزيز التفاضلي للسلوك البديل (DRA) مع جدول نجوم فوري بعد الانتقال الهادئ',
        interventionTechniques: ['reinforcement', 'prompting_fading', 'differential_reinforcement', 'token_economy'],
        timelinePhase: 'intervention',
        trackingPoints: [
          { date: 'الأسبوع 1 (خط الأساس)', value: 9 },
          { date: 'الأسبوع 2 (بدء التدخل)', value: 6 },
          { date: 'الأسبوع 3 (التعزيز)', value: 4 },
          { date: 'الأسبوع 4 (الاستقرار)', value: 2 },
        ],
        reviewDate: '2025-12-25',
        notes: 'تراجع ملحوظ في وتيرة الصراخ واستجابة سريعة للجدول البصري التنازلي',
        status: 'active',
      },
    ];
    localStorage.setItem(`${prefix}progBehaviorReports`, JSON.stringify(demoBIP));

    // 6. مواعيد وجلسات اليوم والأسبوع
    const demoAppointments = [
      {
        id: 'apt_demo_1',
        studentId: 'stu_demo_1',
        studentName: 'ريان أحمد العتيبي',
        specialistId: 'emp_demo_1',
        specialistName: 'د. سارة المنصور',
        date: todayStr,
        time: '09:00',
        duration: 45,
        type: 'جلسة تعديل سلوك وتواصل وظيفي',
        room: 'غرفة التأهيل السلوكي (1)',
        status: 'confirmed',
        notes: 'التركيز على مهارة المطابقة والتواصل البصري مع جدول بيكس',
      },
      {
        id: 'apt_demo_2',
        studentId: 'stu_demo_2',
        studentName: 'سارة خالد الشمري',
        specialistId: 'emp_demo_2',
        specialistName: 'أ. هدى الحربي',
        date: todayStr,
        time: '10:30',
        duration: 45,
        type: 'جلسة نطق وتخاطب فردية',
        room: 'عيادة التخاطب (2)',
        status: 'completed',
        notes: 'تدريب على مخرج حرف الراء والسين مع محاكاة تفاعلية',
      },
      {
        id: 'apt_demo_3',
        studentId: 'stu_demo_3',
        studentName: 'عمر يوسف القحطاني',
        specialistId: 'emp_demo_3',
        specialistName: 'د. عمر الفاروق',
        date: todayStr,
        time: '12:00',
        duration: 50,
        type: 'جلسة تكامل حسي وتآزر عضلي',
        room: 'غرفة التكامل الحسي الحس-حركية',
        status: 'confirmed',
        notes: 'استخدام الأرجوحة والمثيرات اللمسية العميقة لتهدئة الجهاز العصبي',
      },
    ];
    localStorage.setItem(`${prefix}appointments`, JSON.stringify(demoAppointments));
    localStorage.setItem(`${prefix}sessions`, JSON.stringify(demoAppointments));

    // 7. أهداف الخطط الفردية (IEP Goals العامة)
    const demoGoals = [
      {
        id: 'goal_demo_1',
        studentId: 'stu_demo_1',
        area: 'التواصل واللغة الاستقبالية',
        title: 'أن يستجيب الطالب لاسمه من مسافة 2 متر بنسبة إتقان 80%',
        targetDate: '2026-10-30',
        currentLevel: 4,
        targetLevel: 5,
        status: 'in_progress',
        progress: 75,
        specialistName: 'د. سارة المنصور',
      },
      {
        id: 'goal_demo_2',
        studentId: 'stu_demo_2',
        area: 'النطق ومخارج الحروف',
        title: 'نطق الكلمات المشتملة على حرف السين في البداية والوسط بدقة 85%',
        targetDate: '2026-11-15',
        currentLevel: 4,
        targetLevel: 5,
        status: 'in_progress',
        progress: 85,
        specialistName: 'أ. هدى الحربي',
      },
      {
        id: 'goal_demo_3',
        studentId: 'stu_demo_3',
        area: 'العلاج الوظيفي والعناية الذاتية',
        title: 'ارتداء الحذاء وإغلاق اللاصق الذاتي باستقلالية تامة',
        targetDate: '2026-12-01',
        currentLevel: 3,
        targetLevel: 5,
        status: 'in_progress',
        progress: 60,
        specialistName: 'د. عمر الفاروق',
      },
    ];
    localStorage.setItem(`${prefix}iepGoals`, JSON.stringify(demoGoals));

    // 8. الحضور والغياب للطلاب والموظفين
    const demoAttStu = [
      { id: 'att_s1', studentId: 'stu_demo_1', date: todayStr, status: 'present', time: '08:45' },
      { id: 'att_s2', studentId: 'stu_demo_2', date: todayStr, status: 'present', time: '09:10' },
      { id: 'att_s3', studentId: 'stu_demo_3', date: todayStr, status: 'present', time: '08:50' },
      { id: 'att_s4', studentId: 'stu_demo_4', date: todayStr, status: 'absent_excused', reason: 'موعد طبي' },
    ];
    localStorage.setItem(`${prefix}attStu`, JSON.stringify(demoAttStu));

    // 9. المالية والسندات التجريبية
    const demoIncome = [
      { id: 'inc_1', voucherNo: 'REC-2026-101', date: todayStr, amount: 4500, category: 'رسوم تأهيل فصلي', studentId: 'stu_demo_1', studentName: 'ريان أحمد العتيبي', method: 'mada', notes: 'الدفعة الأولى من الفصل الدراسي' },
      { id: 'inc_2', voucherNo: 'REC-2026-102', date: todayStr, amount: 3200, category: 'جلسات تخاطب مكثفة', studentId: 'stu_demo_2', studentName: 'سارة خالد الشمري', method: 'transfer', notes: 'باقة 12 جلسة' },
    ];
    localStorage.setItem(`${prefix}income`, JSON.stringify(demoIncome));

    const demoExpenses = [
      { id: 'exp_1', voucherNo: 'PAY-2026-050', date: todayStr, amount: 1200, category: 'أدوات ومقاييس تشخيصية', beneficiary: 'دار المقاييس النفسية', method: 'bank', notes: 'حقائب اختبارات CARS-2 ومجموعات بيكس' },
      { id: 'exp_2', voucherNo: 'PAY-2026-051', date: todayStr, amount: 850, category: 'وسائل حسية وألعاب ذكاء', beneficiary: 'مؤسسة التجهيزات التعليمية', method: 'cash', notes: 'كرات حسية ومثيرات ضوئية' },
    ];
    localStorage.setItem(`${prefix}expenses`, JSON.stringify(demoExpenses));

    // 10. أقسام وتصنيفات المركز
    const demoSections = [
      { id: 'sec_1', name: 'قسم التوحد واضطرابات السلوك', head: 'د. سارة المنصور', studentsCount: 14 },
      { id: 'sec_2', name: 'قسم النطق والتخاطب واللغة', head: 'أ. هدى الحربي', studentsCount: 22 },
      { id: 'sec_3', name: 'قسم العلاج الوظيفي والتكامل الحسي', head: 'د. عمر الفاروق', studentsCount: 18 },
      { id: 'sec_4', name: 'قسم صعوبات التعلم والتربية الخاصة', head: 'أ. منى الدوسري', studentsCount: 16 },
    ];
    localStorage.setItem(`${prefix}sections`, JSON.stringify(demoSections));

    // 11. العام الدراسي التجريبي
    const demoAcademicYears = [
      {
        id: 'ay_demo_current',
        name: 'العام الدراسي 1447 / 1448هـ (2025 - 2026م)',
        isCurrent: true,
        startDate: '2025-08-25',
        endDate: '2026-06-15',
        status: 'active',
      },
    ];
    localStorage.setItem(`${prefix}academicYears`, JSON.stringify(demoAcademicYears));

    // 12. أنشطة وفعاليات المركز
    const demoEvents = [
      {
        id: 'evt_1',
        title: 'ورشة الإرشاد الأسري وتنمية التواصل في المنزل',
        date: todayStr,
        time: '17:00',
        location: 'قاعة المحاضرات الرئيسية بالمركز',
        presenter: 'د. سارة المنصور',
        type: 'workshop',
      },
      {
        id: 'evt_2',
        title: 'اليوم الرياضي الحسي الترفيهي للطلاب وأولياء الأمور',
        date: todayStr,
        time: '10:00',
        location: 'الصالة الرياضية متعددة الأغراض',
        presenter: 'د. عمر الفاروق',
        type: 'activity',
      },
    ];
    localStorage.setItem(`${prefix}centerEvents`, JSON.stringify(demoEvents));
    localStorage.setItem(`${prefix}centerActivities`, JSON.stringify(demoEvents));

    // مزامنة البيانات بشكل غير متزامن مع Firestore تحت معرف المركز التجريبي لضمان عمل الرابط من أي جهاز خارجي
    if (centerId && centerId.startsWith('demo_')) {
      Promise.all([
        updateCenterSettings(centerId, demoCenter).catch(() => {}),
        fbBatchSet(centerId, 'employees', demoEmployees).catch(() => {}),
        fbBatchSet(centerId, 'students', demoStudents).catch(() => {}),
        fbBatchSet(centerId, 'progPrograms', demoPrograms).catch(() => {}),
        fbBatchSet(centerId, 'progBehaviorReports', demoBIP).catch(() => {}),
        fbBatchSet(centerId, 'appointments', demoAppointments).catch(() => {}),
        fbBatchSet(centerId, 'sessions', demoAppointments).catch(() => {}),
        fbBatchSet(centerId, 'iepGoals', demoGoals).catch(() => {}),
        fbBatchSet(centerId, 'attStu', demoAttStu).catch(() => {}),
        fbBatchSet(centerId, 'income', demoIncome).catch(() => {}),
        fbBatchSet(centerId, 'expenses', demoExpenses).catch(() => {}),
        fbBatchSet(centerId, 'sections', demoSections).catch(() => {}),
        fbBatchSet(centerId, 'academicYears', demoAcademicYears).catch(() => {}),
        fbBatchSet(centerId, 'centerEvents', demoEvents).catch(() => {}),
      ]).catch(() => {});
    }

    return true;
  } catch (err) {
    console.error('Error initializing demo data:', err);
    return false;
  }
}
