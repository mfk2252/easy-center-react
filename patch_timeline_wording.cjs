const fs = require('fs');
const path = 'src/components/students/StudentTimeline.jsx';
let code = fs.readFileSync(path, 'utf8');

// Change the title of IEP goals in the timeline from "planChange" to something descriptive
code = code.replace(/title: t\('timeline\.planChange'\)/g, "title: '🎯 إدراج هدف IEP'");
code = code.replace(/title: t\('timeline\.planChange'\)/g, "title: '🎯 هدف IEP'"); // Fallback

fs.writeFileSync(path, code);
console.log("Patched Timeline Wording");
