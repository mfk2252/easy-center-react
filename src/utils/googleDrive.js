// ===== Google Drive Backup Utility =====
const CLIENT_ID = '613431742255-jrbkqd64dsumt36i59hiaab8p16u34eh.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
const BACKUP_FILENAME = 'easy-center-backup.json';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

let tokenClient = null;
let gapiInited = false;
let gisInited = false;

// Load GAPI
export function loadGapi() {
  return new Promise((resolve) => {
    if (window.gapi) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        resolve();
      });
    };
    document.head.appendChild(script);
  });
}

// Load GIS (Google Identity Services)
export function loadGis() {
  return new Promise((resolve) => {
    if (window.google?.accounts) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      gisInited = true;
      resolve();
    };
    document.head.appendChild(script);
  });
}

// Initialize both
export async function initGoogle() {
  await Promise.all([loadGapi(), loadGis()]);
}

// Get access token
function getToken() {
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) reject(resp);
        else resolve(resp.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

// Sign in with Google and get user info
export async function signInWithGoogle() {
  await initGoogle();
  
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (resp) => {
        if (resp.error) { reject(new Error(resp.error)); return; }
        
        const token = resp.access_token;
        
        try {
          // Get user info
          const userResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userInfo = await userResp.json();
          
          // Save token and user info
          localStorage.setItem('google_token', token);
          localStorage.setItem('google_token_expiry', String(Date.now() + 3500000));
          localStorage.setItem('google_user', JSON.stringify({
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            sub: userInfo.sub
          }));
          
          resolve({
            token,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            sub: userInfo.sub
          });
        } catch(e) {
          reject(e);
        }
      },
    });
    
    client.requestAccessToken({ prompt: 'consent' });
  });
}

// Sign out
export function signOutGoogle() {
  const token = localStorage.getItem('google_token');
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token);
  }
  localStorage.removeItem('google_token');
  localStorage.removeItem('google_token_expiry');
  localStorage.removeItem('google_user');
}

// Get valid token
async function getValidToken() {
  const token = localStorage.getItem('google_token');
  const expiry = Number(localStorage.getItem('google_token_expiry') || '0');
  
  if (token && Date.now() < expiry) return token;
  
  // Token expired, get new one silently
  await initGoogle();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) { reject(new Error(resp.error)); return; }
        localStorage.setItem('google_token', resp.access_token);
        localStorage.setItem('google_token_expiry', String(Date.now() + 3500000));
        resolve(resp.access_token);
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
}

// Find backup file on Drive
async function findBackupFile(token) {
  const resp = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}' and trashed=false&fields=files(id,name,modifiedTime)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await resp.json();
  return data.files?.[0] || null;
}

// Save backup to Google Drive
export async function saveBackupToDrive(allData) {
  try {
    const token = await getValidToken();
    const content = JSON.stringify({ ...allData, backupDate: new Date().toISOString(), version: '1.1' });
    const blob = new Blob([content], { type: 'application/json' });
    
    // Check if file exists
    const existing = await findBackupFile(token);
    
    let url, method;
    if (existing) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`;
      method = 'PATCH';
    } else {
      url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      method = 'POST';
    }
    
    // Multipart upload
    const metadata = { name: BACKUP_FILENAME, mimeType: 'application/json' };
    const boundary = 'backup_boundary_123';
    const multipart = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      content,
      `--${boundary}--`
    ].join('\r\n');
    
    const uploadResp = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipart,
    });
    
    if (!uploadResp.ok) throw new Error('Upload failed');
    return true;
  } catch(e) {
    console.error('Drive backup error:', e);
    throw e;
  }
}

// Load backup from Google Drive
export async function loadBackupFromDrive() {
  try {
    const token = await getValidToken();
    const file = await findBackupFile(token);
    
    if (!file) return null;
    
    const resp = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!resp.ok) throw new Error('Download failed');
    const data = await resp.json();
    return { data, fileId: file.id, modifiedTime: file.modifiedTime };
  } catch(e) {
    console.error('Drive load error:', e);
    throw e;
  }
}

// Get current Google user from localStorage
export function getGoogleUser() {
  try {
    return JSON.parse(localStorage.getItem('google_user') || 'null');
  } catch(e) {
    return null;
  }
}

// Check if signed in
export function isGoogleSignedIn() {
  const token = localStorage.getItem('google_token');
  const expiry = Number(localStorage.getItem('google_token_expiry') || '0');
  const user = getGoogleUser();
  return !!(token && Date.now() < expiry && user);
}

// Collect all localStorage data for backup
export function collectAllData() {
  const keys = [
    'students', 'employees', 'sessions', 'appointments', 'iepGoals',
    'attStu', 'attEmp', 'income', 'expenses', 'salaries', 'leaves',
    'notifs', 'manualAlerts', 'calEvents', 'centerActivities',
    'parentInteractions', 'consultations', 'evaluations', 'warnings',
    'users', 'stuReports', 'behaviorPlans', 'studentFees', 'payments',
    'scs_v2_config'
  ];
  
  const data = {};
  keys.forEach(key => {
    try {
      const val = localStorage.getItem(key) || localStorage.getItem('local_' + key);
      if (val) data[key] = JSON.parse(val);
    } catch(e) {}
  });
  
  return data;
}

// Restore all data from backup
export function restoreAllData(data) {
  const keyMap = {
    'scs_v2_config': 'scs_v2_config',
  };
  
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'backupDate' || key === 'version') return;
    try {
      const storageKey = keyMap[key] || 'local_' + key;
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch(e) {}
  });
}
