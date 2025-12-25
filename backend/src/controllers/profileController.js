const { getScraper } = require('../scrapers');
const { LinkedinProfile, InstagramProfile } = require('../models');

exports.scrapeProfile = async (req, res) => {
  console.log('------------------------------------------------');
  console.log('RECEIVED POST /api/scrape-profile');
  
  try {
    const { url, html } = req.body;

    if (!url || !html) {
      return res.status(400).json({ error: 'URL and HTML are required' });
    }

    const scraper = getScraper(url);
    if (!scraper) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    // 1. Scrape Data
    console.log(`Processing URL: ${url} (Platform: ${scraper.platform})`);
    const scrapedData = scraper.parse(html);
    
    // Log what the scraper found
    console.log('Scraped Data:', JSON.stringify(scrapedData, null, 2));
    
    // 2. Validate essential data
    const isEmpty = Object.values(scrapedData).every(x => x === null || x === undefined);
    if (isEmpty) {
        console.warn('WARNING: Scraper returned all nulls.');
        return res.status(422).json({ 
            error: 'Parsing failed', 
            message: 'Could not extract any data. Layout might have changed.' 
        });
    }

    // 3. Save to DB (Using Upsert Logic)
    let savedProfile;
    if (scraper.platform === 'linkedin') {
        // Upsert: Create or Update based on URL
        // SQLite support for upsert can be tricky, so we use a robust find/create pattern
        const [profile, created] = await LinkedinProfile.findOrCreate({
            where: { url },
            defaults: scrapedData
        });
        
        if (!created) {
            savedProfile = await profile.update(scrapedData);
        } else {
            savedProfile = profile;
        }

    } else if (scraper.platform === 'instagram') {
        const [profile, created] = await InstagramProfile.findOrCreate({
            where: { url },
            defaults: scrapedData
        });

        if (!created) {
            savedProfile = await profile.update(scrapedData);
        } else {
            savedProfile = profile;
        }
    }

    console.log('Database Operation Successful.');
    console.log('------------------------------------------------');

    // 4. Respond
    return res.status(200).json({
      status: 'success',
      platform: scraper.platform,
      data: savedProfile
    });

  } catch (error) {
    console.error('Scrape Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

exports.getAllProfiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const linkedin = await LinkedinProfile.findAndCountAll({
            limit,
            offset,
            order: [['updatedAt', 'DESC']]
        });

        const instagram = await InstagramProfile.findAndCountAll({
            limit,
            offset,
            order: [['updatedAt', 'DESC']]
        });

        res.json({
            meta: {
                page,
                limit,
                total_linkedin: linkedin.count,
                total_instagram: instagram.count
            },
            data: {
                linkedin: linkedin.rows,
                instagram: instagram.rows
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
