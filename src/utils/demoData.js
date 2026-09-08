/**
 * Demo Data Generator & Initializer
 * يُهيئ بيئة تجريبية واقعية وكاملة لمراكز التربية الخاصة والتأهيل عند تصفح النظام بحساب الديمو التفاعلي
 */

export function initDemoData(centerId = 'demo_center', visitorName = '') {
  try {
    const prefix = `${centerId}_`;

    // 1. مركز الأمل الديمو (بيانات المركز)
    const demoCenter = {
      centerId,
      name: 'مركز الأمل للتأهيل والتربية الخاصة (بيئة تجريبية)',
      centerName: 'مركز الأمل للتأهيل والتربية الخاصة (بيئة تجريبية)',
      nameEn: 'Al-Amal Rehabilitation & Special Ed Center (Demo)',
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
        daysLeft: 5,
        allowed: true,
        reason: 'demo',
        isDemo: true,
      },
    };

    localStorage.setItem(`scs_center_settings_${centerId}`, JSON.stringify(demoCenter));
    localStorage.setItem('scs_center_name', demoCenter.name);
    localStorage.setItem('scs_center_color', demoCenter.color);

    // 2. بيانات الطلاب التجريبية الواقعية
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
        iepGoalsCount: 6,
        progressRate: 75,
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
        iepGoalsCount: 5,
        progressRate: 82,
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
        iepGoalsCount: 4,
        progressRate: 65,
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
        iepGoalsCount: 7,
        progressRate: 88,
      },
    ];
    localStorage.setItem(`${prefix}students`, JSON.stringify(demoStudents));

    // 3. بيانات الموظفين والأخصائيين التجريبية
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

    // 4. مواعيد وجلسات اليوم والأسبوع
    const todayStr = new Date().toISOString().split('T')[0];
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
        notes: 'التركيز على مهارة المطابقة والتواصل البصري',
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
        notes: 'تدريب على مخرج حرف الراء والسين مع تعزيز تفاعلي',
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
        notes: 'استخدام الأرجوحة والمثيرات اللمسية العميقة',
      },
    ];
    localStorage.setItem(`${prefix}appointments`, JSON.stringify(demoAppointments));

    // 5. أهداف الخطط الفردية (IEP Goals)
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

    // 6. الحضور والغياب للطلاب والموظفين
    const demoAttStu = [
      { id: 'att_s1', studentId: 'stu_demo_1', date: todayStr, status: 'present', time: '08:45' },
      { id: 'att_s2', studentId: 'stu_demo_2', date: todayStr, status: 'present', time: '09:10' },
      { id: 'att_s3', studentId: 'stu_demo_3', date: todayStr, status: 'present', time: '08:50' },
      { id: 'att_s4', studentId: 'stu_demo_4', date: todayStr, status: 'absent_excused', reason: 'موعد طبي' },
    ];
    localStorage.setItem(`${prefix}attStu`, JSON.stringify(demoAttStu));

    // 7. المالية والسندات التجريبية
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

    // 8. أقسام وتصنيفات المركز
    const demoSections = [
      { id: 'sec_1', name: 'قسم التوحد واضطرابات السلوك', head: 'د. سارة المنصور', studentsCount: 14 },
      { id: 'sec_2', name: 'قسم النطق والتخاطب واللغة', head: 'أ. هدى الحربي', studentsCount: 22 },
      { id: 'sec_3', name: 'قسم العلاج الوظيفي والتكامل الحسي', head: 'د. عمر الفاروق', studentsCount: 18 },
      { id: 'sec_4', name: 'قسم صعوبات التعلم والتربية الخاصة', head: 'أ. منى الدوسري', studentsCount: 16 },
    ];
    localStorage.setItem(`${prefix}sections`, JSON.stringify(demoSections));

    return true;
  } catch (err) {
    console.error('Error initializing demo data:', err);
    return false;
  }
}
