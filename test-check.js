const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const css = fs.readFileSync('style.css', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');

console.log('--- HTML CHECK ---');
const sectionMatches = [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map(m => m[1]);
console.log('Sections in index.html:', sectionMatches);

const requiredSections = [
  'hero',
  'universal-profile',
  'interactive-demo',
  'matching-engine',
  'one-body-many-sizes',
  'product-page-mock',
  'business-model',
  'outcome',
  'cta-section'
];

requiredSections.forEach(req => {
  console.log(`Section #${req}:`, sectionMatches.includes(req) ? 'FOUND' : 'MISSING');
});

console.log('\n--- KEYWORD & REQUIREMENT CHECK ---');
const keywords = [
  'Medium here. Large there. Small everywhere else.',
  'Same person.',
  '#E6F200',
  'YOUR UNIVERSAL SIZE PROFILE',
  'ONE PROFILE. MULTIPLE BRANDS.',
  'ENTER IT ONCE.',
  'Fictional sample measurements',
  'SIZE MATCHING ENGINE',
  'ONE BODY, MANY SIZES.',
  'Illustrative examples, not actual brand size recommendations',
  'Essential cotton tee',
  'YOUR RECOMMENDED SIZE:',
  'FASHION BRANDS',
  'SIZE RECOMMENDATION TECHNOLOGY',
  'CUSTOMERS',
  'No pricing or revenue figures implied',
  'FEWER SIZE-RELATED RETURNS.',
  'Potential benefit, not guaranteed',
  'ONE PROFILE. BETTER SIZE MATCHING.',
  'For brands: request a demo',
  'For shoppers: join the waitlist',
  'Built in India 🇮🇳'
];

let allPassed = true;
keywords.forEach(kw => {
  const inText = textOnly.includes(kw);
  const inHtml = html.includes(kw);
  const inCss = css.includes(kw);
  const ok = inText || inHtml || inCss;
  if (!ok) allPassed = false;
  console.log(`Keyword "${kw}":`, ok ? 'YES' : 'NO');
});

console.log('\nALL VERIFICATIONS PASSED:', allPassed);
