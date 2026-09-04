const fs = require('fs');
const path = 'src/pages/ProgramsReports/PillarAssessment.jsx';
let code = fs.readFileSync(path, 'utf8');

const oldEmpty = /const EMPTY_EVAL = \{[\s\S]*?\};\s*const EMPTY_ASSESSMENT/;
const newEmpty = `const EMPTY_EVAL = {
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

const EMPTY_ASSESSMENT`;

code = code.replace(oldEmpty, newEmpty);

fs.writeFileSync(path, code);
console.log("Patched EMPTY_EVAL");
