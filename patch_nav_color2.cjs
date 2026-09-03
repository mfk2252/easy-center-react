const fs = require('fs');
const path = 'src/styles/layout.css';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\.nav-logout\{([^\}]+)color:var\(--g[45]\);/g, '.nav-logout{$1color:#ffffff;');

fs.writeFileSync(path, code);

const globalPath = 'src/styles/global.css';
let gcode = fs.readFileSync(globalPath, 'utf8');
gcode = gcode.replace(/\.nav-lang-btn\{([^\}]+)color:var\(--g[45]\);/g, '.nav-lang-btn{$1color:#ffffff;');
gcode = gcode.replace(/body\.dark \.nav-logout\{([^}]+)color:[#\w]+;/g, 'body.dark .nav-logout{$1color:#ffffff;');
fs.writeFileSync(globalPath, gcode);

console.log("patched colors");
