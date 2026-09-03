const fs = require('fs');
const path = 'src/components/students/StudentTimeline.jsx';
let code = fs.readFileSync(path, 'utf8');

const safeDateHelper = `
const safeDateStr = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val.slice(0, 10);
  if (typeof val.toDate === 'function') {
    try { return val.toDate().toISOString().slice(0, 10); } catch(e) {}
  }
  if (val.seconds) {
    try { return new Date(val.seconds * 1000).toISOString().slice(0, 10); } catch(e) {}
  }
  return String(val).slice(0, 10);
};
`;

if (!code.includes('safeDateStr')) {
  code = code.replace(/export default function StudentTimeline/, safeDateHelper + '\nexport default function StudentTimeline');
}

code = code.replace(/date: \(g\.updatedAt \|\| g\.start \|\| ''\)\.slice\(0, 10\)/g, 'date: safeDateStr(g.updatedAt || g.start)');
code = code.replace(/date: s\.date \|\| ''/g, "date: safeDateStr(s.date)");
code = code.replace(/date: r\.date \|\| ''/g, "date: safeDateStr(r.date)");
code = code.replace(/date: a\.date \|\| ''/g, "date: safeDateStr(a.date)");
code = code.replace(/date: p\.date \|\| ''/g, "date: safeDateStr(p.date)");

fs.writeFileSync(path, code);
console.log("Patched timeline");
