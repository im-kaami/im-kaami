const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const portfolioDir = 'E:/im-kaami.github.io';
const urls = [
  'https://im-kaami.github.io/',
  'https://github.com/im-kaami?tab=repositories',
  'https://im-kaami.github.io/contact.html',
  'https://linkedin.com/in/ikram-hafeez',
  'https://github.com/im-kaami/InsightForgeAI',
  'https://im-kaami.github.io/projects.html#insightforge',
  'https://im-kaami.github.io/experience/xerox/reporting-automation.html',
  'https://im-kaami.github.io/experience/xerox/device-tracking.html',
  'https://im-kaami.github.io/experience/xerox/device-requests.html',
  'https://im-kaami.github.io/research.html',
  'https://github.com/mariasiles/VeriVision',
  'https://im-kaami.github.io/projects.html#campus-copilot',
  'https://github.com/LiRongchuan/raspbot-public',
  'https://im-kaami.github.io/projects.html#telecom',
  'https://im-kaami.github.io/projects.html'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const cleanUrl = url.split('#')[0];
    const req = https.request(cleanUrl, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ url, error: err.message }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ url, error: 'Timeout' }); });
    req.end();
  });
}

(async () => {
  console.log('=== CHECKING LINK DESTINATIONS ===');
  
  // Local file check in portfolio
  console.log('\n--- Local Portfolio File Status ---');
  const localChecks = [
    { name: 'Home', rel: 'index.html' },
    { name: 'Contact', rel: 'contact.html' },
    { name: 'Projects', rel: 'projects.html' },
    { name: 'Research', rel: 'research.html' },
    { name: 'Xerox Reporting', rel: 'experience/xerox/reporting-automation.html' },
    { name: 'Xerox Device Tracking', rel: 'experience/xerox/device-tracking.html' },
    { name: 'Xerox Device Requests', rel: 'experience/xerox/device-requests.html' }
  ];
  for (const c of localChecks) {
    const p = path.join(portfolioDir, c.rel);
    console.log(`Local file: ${c.name} (${c.rel}) -> ${fs.existsSync(p) ? 'EXISTS LOCALLY' : 'MISSING'}`);
  }

  console.log('\n--- Live HTTP Destination Checks ---');
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(`${res.url} -> ${res.status || res.error}`);
  }
})();
