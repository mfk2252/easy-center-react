const fs = require('fs');
let content = fs.readFileSync('src/pages/ProgramsReports/MeasurementCenter.jsx', 'utf8');

// Add isConnersParent
if (!content.includes('const isConnersParent = item.measureId')) {
    content = content.replace(/const isSensory = item.measureId === 'sensory_integration_scale'.*;/g, "$&\n              const isConnersParent = item.measureId === 'conners_parent' || item.type === 'conners_parent';");
}

// Add bdg badge
if (!content.includes('isConnersParent && <span className="bdg"')) {
    content = content.replace(/{isSensory && <span className="bdg".*?التكامل الحسي \(90\)<\/span>}/g, "$&\n                      {isConnersParent && <span className=\"bdg\" style={{ background: '#ffedd5', color: '#c2410c', fontSize: '.68rem', fontWeight: 800 }}>كونرز للوالدين</span>}");
}

// Add Button logic
if (!content.includes('isConnersParent && (')) {
    const btnJSX = `
                    {isConnersParent && (
                      <button
                        type="button"
                        className="btn btn-xs"
                        style={{ background: '#ea580c', color: '#fff', fontWeight: 800 }}
                        onClick={() => {
                          setSelectedConnersParent(item);
                          setConnersParentReportOpen(true);
                        }}
                      >
                        📄 تقرير كونرز (L)
                      </button>
                    )}
`;
    content = content.replace(/{isSensory && \(/g, btnJSX + "                    {isSensory && (");
}

fs.writeFileSync('src/pages/ProgramsReports/MeasurementCenter.jsx', content);
console.log("MeasurementCenter completely patched!");
