const cheerio = require('cheerio');

const parseLinkedin = (html) => {
  const $ = cheerio.load(html);
  const data = {
    name: null,
    headline: null,
    location: null,
    about: null,
    followerCount: null,
    connectionCount: null
  };

  const bodyText = $('body').text().replace(/\s+/g, ' ');

  // --- 1. NAME ---
  data.name = $('h1').first().text().trim();
  if (!data.name || data.name.toLowerCase() === 'linkedin') {
      const title = $('title').text();
      // Title format: "(1) Name | LinkedIn" or "Name - Headline | LinkedIn"
      data.name = title.split('|')[0].split('-')[0].replace(/\(\d+\)/, '').trim(); 
  }

  // --- 2. HEADLINE STRATEGIES ---
  
  // Strategy A: Standard Class (Most common in 2024/2025)
  if (!data.headline) {
      const el = $('.text-body-medium.break-words').first();
      if (el.length) data.headline = el.text().trim();
  }

  // Strategy B: Top Card specific container
  // The headline is usually in the left panel of the top card
  if (!data.headline) {
      const el = $('.pv-text-details__left-panel .text-body-medium').first();
      if (el.length) data.headline = el.text().trim();
  }

  // Strategy C: Meta Description
  // Format: "Name - Headline - Location | LinkedIn"
  if (!data.headline) {
      const metaDesc = $('meta[name="description"]').attr('content'); 
      if (metaDesc) {
          // Split by " - " or " | "
          const parts = metaDesc.split(/ [-|] /);
          // Index 0: Name, Index 1: Headline (usually), Index 2: Location
          if (parts[1] && parts[1] !== 'LinkedIn' && parts[1].length > 5) {
              data.headline = parts[1].trim();
          }
      }
  }

  // Strategy D: DOM Sibling traversal
  // Find the H1 (Name), then look for the next block-level element with text
  if (!data.headline && data.name) {
      const nameH1 = $('h1').first();
      // Try next sibling of parent
      let candidate = nameH1.parent().next().text().trim();
      if (candidate && candidate !== data.name) {
          data.headline = candidate;
      } else {
          // Try parent's parent's next sibling (common in some layouts)
          candidate = nameH1.parent().parent().find('div').eq(1).text().trim();
           if (candidate && candidate !== data.name && candidate.length > 5) {
               data.headline = candidate;
           }
      }
  }

  // Strategy E: Generic H2 Fallback (Mobile/Tablet views)
  if (!data.headline) {
      const h2 = $('.pv-top-card h2').first();
      if (h2.length) data.headline = h2.text().trim();
  }

  // --- 3. LOCATION ---
  // Often in a span with "text-body-small" and "inline"
  $('.text-body-small').each((i, el) => {
      const txt = $(el).text().trim();
      if (txt.includes(',') && !txt.includes('follower') && !txt.includes('connection') && txt.length < 60) {
          data.location = txt;
          return false;
      }
  });

  // --- 4. ABOUT ---
  const aboutSection = $('#about').closest('section');
  if (aboutSection.length) {
      data.about = aboutSection.find('.inline-show-more-text').text().trim() || 
                   aboutSection.find('span[aria-hidden="true"]').last().text().trim();
  }

  // --- 5. COUNTS (Global Regex) ---
  const followersMatch = bodyText.match(/([\d,.]+)\s*followers/i);
  if (followersMatch) data.followerCount = parseCount(followersMatch[1]);

  const connectionsMatch = bodyText.match(/([\d,.]+)\+?\s*connections/i);
  if (connectionsMatch) data.connectionCount = parseCount(connectionsMatch[1]);

  console.log(`[Scraper Result] Name: ${data.name}\nHeadline: ${data.headline}\nLocation: ${data.location}`);

  return data;
};

function parseCount(str) {
    if (!str) return null;
    const clean = str.replace(/,/g, '').toLowerCase();
    let num = parseFloat(clean);
    if (isNaN(num)) return null;
    if (clean.includes('k')) num *= 1000;
    if (clean.includes('m')) num *= 1000000;
    return Math.floor(num);
}

module.exports = parseLinkedin;

function parseCount(str) {
    if (!str) return null;
    const clean = str.replace(/,/g, '').replace(/\s/g, '').toLowerCase();
    let num = parseFloat(clean);
    if (isNaN(num)) return null;
    if (clean.includes('k')) num *= 1000;
    if (clean.includes('m')) num *= 1000000;
    return Math.floor(num);
}

module.exports = parseLinkedin;
