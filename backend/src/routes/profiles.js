const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.post('/scrape-profile', profileController.scrapeProfile);
router.get('/profiles', profileController.getAllProfiles);

module.exports = router;
