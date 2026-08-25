const fs = require('fs');
let content = fs.readFileSync('src/utils/measurementBank.js', 'utf8');

const newScale = `
  {
    id: 'conners_parent',
    name: 'مقياس كونرز لفرط الحركة وتشتت الانتباه (نسخة الوالدين المطولة)',
    nameEn: 'Conners Parent Rating Scale - Revised (CPRS-R L)',
    categoryId: 'adhd',
    type: 'conners_parent',
    description: 'تقييم شامل لأعراض فرط الحركة، وتشتت الانتباه، والمشكلات المعرفية والسلوكية للوالدين (80 فقرة).',
    minAge: 3,
    maxAge: 17,
    timeMins: 20,
    itemCount: 80,
    adminType: 'parent',
    clinicalThreshold: 65,
    thresholdText: 'درجة معيارية (T-Score) 65 فأكثر تشير إلى وجود دلالة إكلينيكية.',
    status: 'active',
  },
`;

if (!content.includes("id: 'conners_parent'")) {
    content = content.replace(/export const MEASUREMENTS = \[/, "export const MEASUREMENTS = [" + newScale);
    fs.writeFileSync('src/utils/measurementBank.js', content);
    console.log('MeasurementBank patched');
}
