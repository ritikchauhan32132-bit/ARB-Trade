const fs = require('fs');

const code = fs.readFileSync('main_bundle.js', 'utf8');
console.log('Main bundle length in chars:', code.length);

// Extract all routes from Vue router
// Usually { path: "...", name: "...", component: ... }
const routeBlocks = [];
const routeRegex = /\{path:\s*["']([^"']+)["'](?:,name:\s*["']([^"']+)["'])?(?:,component:[^}]+)?/g;
let match;
while ((match = routeRegex.exec(code)) !== null) {
  routeBlocks.push({ path: match[1], name: match[2] || '' });
}
console.log('Found route definitions count:', routeBlocks.length);
console.log('Sample routes:', routeBlocks.slice(0, 50));

// Extract all other chunks loaded dynamically
const chunkRegex = /["'](\.\/[a-zA-Z0-9_\-\.]+\.(?:js|css))["']/g;
const chunks = new Set();
while ((match = chunkRegex.exec(code)) !== null) {
  chunks.add(match[1]);
}
console.log('Dynamically imported chunks:', Array.from(chunks));

// Extract API endpoints / URLs
const apiRegex = /["'](\/(?:api|v[0-9]|user|wallet|auth|account|order|trade|pay|payment|recharge|withdraw|kyc|referral|invite|common|config|notification|message|system|admin)[a-zA-Z0-9_\-\/]*)["']/g;
const apis = new Set();
while ((match = apiRegex.exec(code)) !== null) {
  apis.add(match[1]);
}
console.log('\n--- Discovered API Endpoints ---');
console.log(Array.from(apis));

// Search for key words and features
const featureKeywords = [
  'wallet', 'recharge', 'deposit', 'withdraw', 'transfer', 'trade', 'order', 'kyc',
  'referral', 'invite', 'commission', 'bind', 'bank', 'usdt', 'trc20', 'erc20',
  'upi', 'pix', 'card', 'crypto', 'fiat', 'password', 'security', 'pin', 'fundPassword',
  'vip', 'level', 'bonus', 'rewards', 'history', 'statement', 'team', 'agent'
];

const foundFeatures = {};
featureKeywords.forEach(kw => {
  const count = (code.match(new RegExp(kw, 'gi')) || []).length;
  if (count > 0) foundFeatures[kw] = count;
});
console.log('\n--- Feature keyword occurrences ---', foundFeatures);

