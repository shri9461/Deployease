require('dotenv').config();

const config = {
  development: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/deployease',
    jwtSecret: process.env.JWT_SECRET || 'deployflow_secret_key_2026',
    dbPath: './deployments.json',
    logLevel: 'debug'
  },
  test: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/deployease_test',
    jwtSecret: process.env.JWT_SECRET || 'deployflow_secret_key_2026',
    dbPath: './deployments.json',
    logLevel: 'debug'
  },
  staging: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/deployease_staging',
    jwtSecret: process.env.JWT_SECRET || 'deployflow_secret_key_2026',
    dbPath: '/var/lib/deployease/deployments.json',
    logLevel: 'info'
  },
  production: {
    port: process.env.PORT || 80,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/deployease',
    jwtSecret: process.env.JWT_SECRET || 'deployflow_secret_key_2026',
    dbPath: '/var/lib/deployease/deployments.json',
    logLevel: 'error'
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
