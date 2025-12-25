const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InstagramProfile = sequelize.define('InstagramProfile', {
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  followerCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  followingCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  postCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = InstagramProfile;
