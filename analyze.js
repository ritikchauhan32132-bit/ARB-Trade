const fs = require('fs');

const code = fs.readFileSync('index_bundle.js', 'utf8');
console.log('Bundle length in chars:', code.length);

// Extract strings or router definitions
const routeRegex = /name:\s*["']([^"']+)["']\s*,\s*path:\s*["']([^"']+)["']/g;
let match;
const routes = [];
while ((match = routeRegex.exec(code)) !== null) {
  routes.push({ name: match[1], path: match[2] });
}
console.log('--- Vue/React Router Routes (name & path) ---');
console.log(JSON.stringify(routes, null, 2));

// Look for other route patterns
const pathRegex = /path:\s*["']([^"']+)["']/g;
const paths = new Set();
while ((match = pathRegex.exec(code)) !== null) {
  paths.add(match[1]);
}
console.log('\n--- All router paths found ---');
console.log(Array.from(paths));

// Look for API endpoints (e.g., /api/..., /user/..., /wallet/..., /trade/..., /order/...)
const urlRegex = /["'](\/[a-zA-Z0-9_\-\/]+)["']/g;
const apiUrls = new Set();
while ((match = urlRegex.exec(code)) !== null) {
  const u = match[1];
  if (u.length > 2 && !u.startsWith('//') && !u.includes('node_modules') && !u.includes('.svg') && !u.includes('.png')) {
    apiUrls.add(u);
  }
}
console.log('\n--- URLs & Endpoints found ---');
console.log(Array.from(apiUrls).filter(u => u.includes('/')).slice(0, 100));

// Look for language / i18n keys or UI text strings
const textMatches = code.match(/["']([a-zA-Z0-9_\s\.\:\,\!\?\-\/\$\#\%\&\*\(\)\+]{4,40})["']/g) || [];
console.log('\nSample text count:', textMatches.length);
