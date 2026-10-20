const fs = require('fs');

const code = fs.readFileSync('main_bundle.js', 'utf8');

// 1. Extract all API calls / axios / fetch endpoints
const apiPatterns = [
  /\/api\/[a-zA-Z0-9_\-\/]+/g,
  /\/v[0-9]\/[a-zA-Z0-9_\-\/]+/g,
  /\/user\/[a-zA-Z0-9_\-\/]+/g,
  /\/wallet\/[a-zA-Z0-9_\-\/]+/g,
  /\/order\/[a-zA-Z0-9_\-\/]+/g,
  /\/auth\/[a-zA-Z0-9_\-\/]+/g,
  /\/kyc\/[a-zA-Z0-9_\-\/]+/g,
  /\/trade\/[a-zA-Z0-9_\-\/]+/g,
  /\/pay\/[a-zA-Z0-9_\-\/]+/g,
  /\/payment\/[a-zA-Z0-9_\-\/]+/g,
  /\/usdt\/[a-zA-Z0-9_\-\/]+/g,
  /\/task\/[a-zA-Z0-9_\-\/]+/g,
  /\/team\/[a-zA-Z0-9_\-\/]+/g,
  /\/help\/[a-zA-Z0-9_\-\/]+/g,
  /\/notice\/[a-zA-Z0-9_\-\/]+/g,
  /\/message\/[a-zA-Z0-9_\-\/]+/g
];

const foundApis = new Set();
apiPatterns.forEach(pattern => {
  const matches = code.match(pattern) || [];
  matches.forEach(m => foundApis.add(m));
});

console.log('--- Extracted APIs ---');
console.log(Array.from(foundApis));

// 2. Extract Pinia / Vuex Store definitions or state models
const storeMatches = code.match(/use[A-Z][a-zA-Z0-9]*Store|pinia|defineStore\(["'][^"']+["']/g) || [];
console.log('\n--- Store definitions ---');
console.log(Array.from(new Set(storeMatches)));

// 3. Extract English / UI labels and form fields
// Look for object keys with english words
const fieldMatches = code.match(/(?:username|password|email|phone|mobile|amount|currency|chain|address|txid|hash|balance|frozen|fee|rate|bankName|accountNumber|ifsc|upiId|realName|idCard|idNumber|status|type|remark|inviteCode|verifyCode|captcha|otp|paymentPassword|fundPassword)/gi) || [];
const fieldFreq = {};
fieldMatches.forEach(f => {
  const k = f.toLowerCase();
  fieldFreq[k] = (fieldFreq[k] || 0) + 1;
});
console.log('\n--- Field names & frequencies ---');
console.log(fieldFreq);

// 4. Save extracted summary to JSON
fs.writeFileSync('extracted_summary.json', JSON.stringify({
  apis: Array.from(foundApis),
  stores: Array.from(new Set(storeMatches)),
  fields: fieldFreq
}, null, 2));

console.log('Extracted summary saved.');
