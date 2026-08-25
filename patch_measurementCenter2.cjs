const fs = require('fs');
let content = fs.readFileSync('src/pages/ProgramsReports/MeasurementCenter.jsx', 'utf8');

// Add state variables for conners parent
if (!content.includes('connersParentModalOpen')) {
    content = content.replace(/const \[sensoryModalOpen, setSensoryModalOpen\] = useState\(false\);/, "const [sensoryModalOpen, setSensoryModalOpen] = useState(false);\n  const [connersParentModalOpen, setConnersParentModalOpen] = useState(false);\n  const [connersParentReportOpen, setConnersParentReportOpen] = useState(false);\n  const [selectedConnersParent, setSelectedConnersParent] = useState(null);");
}

// Add to openAssessmentModal
if (!content.includes('setConnersParentModalOpen(true)')) {
    content = content.replace(/if \(scaleId === 'sensory_integration_scale'/, "if (scaleId === 'conners_parent') {\n      setConnersParentModalOpen(true);\n      return;\n    }\n    if (scaleId === 'sensory_integration_scale'");
}

// Add viewReport handler logic
if (!content.includes('setConnersParentReportOpen(true)')) {
    content = content.replace(/if \(asst\.measureId === 'sensory_integration_scale'/, "if (asst.measureId === 'conners_parent') {\n      setSelectedConnersParent(asst);\n      setConnersParentReportOpen(true);\n      return;\n    }\n    if (asst.measureId === 'sensory_integration_scale'");
}

// Add the Modals to the render tree
if (!content.includes('<ConnersParentAssessmentModal')) {
    const modalsJSX = `
      {connersParentModalOpen && (
        <ConnersParentAssessmentModal
          isOpen={connersParentModalOpen}
          onClose={() => setConnersParentModalOpen(false)}
          onSaved={() => {
            reload();
            setConnersParentModalOpen(false);
          }}
          students={students}
          emps={emps}
        />
      )}
      {connersParentReportOpen && selectedConnersParent && (
        <ConnersParentReportModal
          isOpen={connersParentReportOpen}
          onClose={() => setConnersParentReportOpen(false)}
          assessment={selectedConnersParent}
        />
      )}
`;
    content = content.replace(/{carsModalOpen && \(/, modalsJSX + "\n      {carsModalOpen && (");
}

fs.writeFileSync('src/pages/ProgramsReports/MeasurementCenter.jsx', content);
console.log("MeasurementCenter correctly patched!");
