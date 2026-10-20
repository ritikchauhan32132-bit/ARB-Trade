const fs = require('fs');

const code = fs.readFileSync('main_bundle.js', 'utf8');

// Extract all route objects from the bundle
// Look for paths with path, name, meta, etc.
const routesAll = [];
const rRegex = /path:\s*["']([^"']+)["'](?:\s*,\s*name:\s*["']([^"']+)["'])?/g;
let m;
const pathSet = new Set();
while ((m = rRegex.exec(code)) !== null) {
  if (!pathSet.has(m[1])) {
    pathSet.add(m[1]);
    routesAll.push({ path: m[1], name: m[2] || '' });
  }
}

console.log('Total unique routes found:', routesAll.length);
console.log(JSON.stringify(routesAll, null, 2));

// Extract all chunk URLs mentioned in main_bundle.js
const chunkMatches = code.match(/\.\/[a-zA-Z0-9_\-\.]+\.js/g) || [];
const uniqueChunks = Array.from(new Set(chunkMatches));
console.log('\nTotal unique JS chunks:', uniqueChunks.length);
fs.writeFileSync('discovered_chunks.json', JSON.stringify(uniqueChunks, null, 2));
fs.writeFileSync('discovered_routes.json', JSON.stringify(routesAll, null, 2));
