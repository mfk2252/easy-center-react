const fs = require('fs');
let content = fs.readFileSync('src/pages/ProgramsReports/MeasurementCenter.jsx', 'utf8');

if (!content.includes('ConnersParentAssessmentModal')) {
    content = content.replace(/import .* from 'react';/, "import { useState, useMemo } from 'react';\nimport ConnersParentAssessmentModal from '../../components/assessments/ConnersParentAssessmentModal';\nimport ConnersParentReportModal from '../../components/assessments/ConnersParentReportModal';");
    
    // Add to render
    content = content.replace(/<GARS3ReportModal/, "<ConnersParentAssessmentModal\n        isOpen={activeAssessmentType === 'conners_parent'}\n        onClose={() => setActiveAssessmentType(null)}\n        onSaved={() => { setRefresh(r => r + 1); setActiveAssessmentType(null); }}\n        students={students}\n        emps={emps}\n        initialData={editRecord?.type === 'conners_parent' ? editRecord : null}\n      />\n      <ConnersParentReportModal\n        isOpen={viewReportType === 'conners_parent'}\n        onClose={() => { setViewReportType(null); setActiveRecord(null); }}\n        assessment={activeRecord}\n      />\n\n      <GARS3ReportModal");
}

fs.writeFileSync('src/pages/ProgramsReports/MeasurementCenter.jsx', content);
console.log('MeasurementCenter patched');
