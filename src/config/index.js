'use strict';

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    name: process.env.DB_NAME || 'ai_workday_dev',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
  },

  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  },

  uploads: {
    maxFileSizeMb: parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB, 10) || 5,
    dir: process.env.UPLOAD_DIR || 'uploads',
  },
};

module.exports = config;