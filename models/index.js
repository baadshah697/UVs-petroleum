// models/index.js
const { Sequelize, DataTypes } = require('sequelize'); // ✅ THIS LINE IS REQUIRED
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, // ✅ Corrected key name
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  }
);

const Admin = require('./Admin')(sequelize, DataTypes);
const Contact = require('./Contact')(sequelize, DataTypes);

module.exports = {
  sequelize,
  Admin,
  Contact,
};

