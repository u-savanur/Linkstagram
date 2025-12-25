const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

// Look for debug_capture.html in the same folder as the script
const htmlFilePath = path.join(__dirname, 'debug_capture.html');

console.log(`
🔍 Linkstagram HTML Analyzer (Node.js Mode)`);
console.log(`-----------------------------------------------`);

if (!fs.existsSync(htmlFilePath)) {
    console.error(`❌ Error: Could not find input file: ${htmlFilePath}`);
    console.log(`   Please ensure 'debug_capture.html' is in the 'backend' folder.`);
    process.exit(1);
}

const html = fs.readFileSync(htmlFilePath, 'utf8');
const $ = cheerio.load(html);

// --- ANALYSIS ---

console.log(`
📄 Basic Meta Information:`);
console.log(`   - Title Tag:       "${$('title').text().trim() || 'Not found'}"`);
console.log(`   - Meta Desc:       "${$('meta[name="description"]').attr('content') || 'Not found'}"`);
console.log(`   - OG Title:        "${$('meta[property="og:title"]').attr('content') || 'Not found'}"`);

console.log(`
📌 Header Analysis (H1/H2):`);
const h1 = $('h1').first();
console.log(`   - First H1 Text:   "${h1.text().trim() || 'Not found'}"`);
console.log(`   - First H1 Class:  "${h1.attr('class') || 'none'}"`);

console.log(`
🔍 Regex Pattern Check (Body Text):`);
const bodyText = $('body').text().replace(/\s+/g, ' ');
const followersMatch = bodyText.match(/([\d.,km]+)\s*Followers/i);
const followingMatch = bodyText.match(/([\d.,km]+)\s*Following/i);

console.log(`   - "Followers":     ${followersMatch ? '✅ Match: ' + followersMatch[0] : '❌ No match'}`);
console.log(`   - "Following":     ${followingMatch ? '✅ Match: ' + followingMatch[0] : '❌ No match'}`);

console.log(`
📜 Script Tag Analysis:`);
$('script').each((i, el) => {
    const content = $(el).html() || '';
    if (content.includes('window._sharedData =')) {
        console.log(`   - ✅ Found 'window._sharedData'`);
    }
    if ($(el).attr('type') === 'application/ld+json') {
        console.log(`   - ✅ Found 'application/ld+json'`);
    }
});

console.log(`
🎨 Critical Class Check:`);
const classesToCheck = ['text-body-medium', 'pv-text-details__left-panel', 'inline-show-more-text', '_aa_c'];
classesToCheck.forEach(cls => {
    const count = $(`.${cls}`).length;
    console.log(`   - .${cls}: ${count > 0 ? '✅ Found (' + count + ')' : '❌ Not found'}`);
});

console.log(`
-----------------------------------------------
`);
