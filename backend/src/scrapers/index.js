const parseLinkedin = require('./linkedin');
const parseInstagram = require('./instagram');

const getScraper = (url) => {
  if (!url) return null;

  if (url.includes('linkedin.com/in/')) {
    return { platform: 'linkedin', parse: parseLinkedin };
  } else if (url.includes('instagram.com/')) {
    return { platform: 'instagram', parse: parseInstagram };
  } else {
    return null;
  }
};

module.exports = { getScraper };
