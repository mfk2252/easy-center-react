const fs = require('fs');
const path = 'src/styles/layout.css';
let code = fs.readFileSync(path, 'utf8');

// We need to carefully replace color for specific navbar classes.
code = code.replace(/\.nav-uname\{([^\}]+)color:var\(--g4\);/g, '.nav-uname{$1color:#ffffff;');
code = code.replace(/\.nb\{([^\}]+)color:var\(--g4\);/g, '.nb{$1color:#ffffff;');
code = code.replace(/\.nav-icon-btn\{([^\}]+)color:var\(--g4\);/g, '.nav-icon-btn{$1color:#ffffff;');
code = code.replace(/\.dark-toggle\{([^\}]+)color:var\(--g4\);/g, '.dark-toggle{$1color:#ffffff;');
code = code.replace(/\.nav-logout\{([^\}]+)color:var\(--g4\);/g, '.nav-logout{$1color:#ffffff;'); // wait, nav-logout had --g5, but wait, the undo step reversed it to --g4 or --g5? Let's use regex for both.

fs.writeFileSync(path, code);
