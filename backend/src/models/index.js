const sequelize = require('../config/database');
const LinkedinProfile = require('./LinkedinProfile');
const InstagramProfile = require('./InstagramProfile');

const db = {
  sequelize,
  LinkedinProfile,
  InstagramProfile
};

module.exports = db;
