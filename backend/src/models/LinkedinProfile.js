const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LinkedinProfile = sequelize.define('LinkedinProfile', {
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  headline: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  followerCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  connectionCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = LinkedinProfile;
