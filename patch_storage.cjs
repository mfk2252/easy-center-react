const fs = require('fs');
const path = 'src/firebase/db.js';
let code = fs.readFileSync(path, 'utf8');

// I will add an fbGetByRole method or update fbGetAll to take role & userId.
