const cheerio = require('cheerio');

const parseInstagram = (html) => {
  const $ = cheerio.load(html);
  const data = {
    username: null,
    displayName: null,
    bio: null,
    followerCount: null,
    followingCount: null,
    postCount: null
  };

  // --- STRATEGY 1: window._sharedData (Legacy/Specific Request) ---
  // This provides exact integer counts if present
  $('script').each((i, el) => {
    const content = $(el).html();
    if (content && content.includes('window._sharedData =')) {
      try {
        // Parse: window._sharedData = { ... };
        const jsonStr = content.split('window._sharedData =')[1].split(';')[0];
        const json = JSON.parse(jsonStr);

        // Path: entry_data.ProfilePage[0].graphql.user
        const user = json?.entry_data?.ProfilePage?.[0]?.graphql?.user;

        if (user) {
          data.followerCount = user.edge_followed_by?.count;
          data.followingCount = user.edge_follow?.count;
          data.postCount = user.edge_owner_to_timeline_media?.count;
          
          if (user.username) data.username = user.username;
          if (user.full_name) data.displayName = user.full_name;
          if (user.biography) data.bio = user.biography;
          
          console.log('[Instagram] Found data in window._sharedData');
        }
      } catch (e) {
        console.log('[Instagram] Failed to parse window._sharedData:', e.message);
      }
    }
  });

  // --- STRATEGY 2: Meta Tags (Fallback for Counts/Name) ---
  const ogTitle = $('meta[property="og:title"]').attr('content'); 
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const titleTag = $('title').text();

  if (!data.username) {
      if (ogTitle) {
          const parts = ogTitle.split(' (@');
          if (parts.length > 1) {
              data.displayName = parts[0].trim();
              data.username = parts[1].split(')')[0].trim();
          }
      } else if (titleTag) {
          const match = titleTag.match(/\(@([^)]+)\)/);
          if (match) data.username = match[1];
      }
  }

  // Only use regex fallback if _sharedData failed
  if (data.followerCount === null && ogDesc) {
      const followMatch = ogDesc.match(/([\d.,km]+)\s*Followers/i);
      if (followMatch) data.followerCount = parseCount(followMatch[1]);

      const followingMatch = ogDesc.match(/([\d.,km]+)\s*Following/i);
      if (followingMatch) data.followingCount = parseCount(followingMatch[1]);

      const postMatch = ogDesc.match(/([\d.,km]+)\s*Posts/i);
      if (postMatch) data.postCount = parseCount(postMatch[1]);
  }

  // --- STRATEGY 3: JSON-LD (Fallback for Bio) ---
  if (!data.bio) {
      $('script[type="application/ld+json"]').each((i, el) => {
          try {
              const json = JSON.parse($(el).html());
              if (json.description) data.bio = json.description;
              if (json.author?.description) data.bio = json.author.description;
          } catch (e) {}
      });
  }

  // --- STRATEGY 4: DOM Fallback (Last Resort for Bio) ---
  if (!data.bio) {
      $('header section div').each((i, el) => {
          const txt = $(el).text().trim();
          if (txt.length > 5 && 
              !txt.includes('followers') && 
              !txt.includes('following') && 
              !txt.match(/\d+k/i) &&
              txt !== data.displayName) {
              if (!data.bio || txt.length > data.bio.length) {
                  data.bio = txt;
              }
          }
      });
  }

  console.log(`[IG Result] User: ${data.username}, Followers: ${data.followerCount}`);
  return data;
};

function parseCount(str) {
    if (typeof str === 'number') return str;
    if (!str) return null;
    const clean = str.replace(/,/g, '').replace(/\s/g, '').toLowerCase();
    let num = parseFloat(clean);
    
    if (isNaN(num)) return null;

    if (clean.includes('k')) num *= 1000;
    if (clean.includes('m')) num *= 1000000;
    
    return Math.floor(num);
}

module.exports = parseInstagram;
