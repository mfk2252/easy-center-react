const fs = require('fs');
const path = 'src/pages/ProgramsReports/InitialAssessment.jsx';
let code = fs.readFileSync(path, 'utf8');

// Guide the user in the UI to write recommendations properly
code = code.replace(
  /<textarea value=\{evalForm\.recommendations\} onChange=\{fld\('recommendations'\)\} rows=\{4\}\/>/g,
  "<textarea value={evalForm.recommendations} onChange={fld('recommendations')} rows={4} placeholder=\"اكتب التوصيات على شكل نقاط (كل نقطة في سطر مستقل) لتسهيل استيرادها لاحقاً في خطة IEP\" />"
);

fs.writeFileSync(path, code);
console.log("Patched Initial Assessment UI");
