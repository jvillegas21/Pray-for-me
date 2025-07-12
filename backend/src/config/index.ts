import dotenv from 'dotenv';

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pray-for-me',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@prayfor.me',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // File uploads
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  
  // Push notifications
  FCM_SERVER_KEY: process.env.FCM_SERVER_KEY || '',
  
  // AI/ML Services
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Geolocation
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Content moderation
  CONTENT_MODERATION_ENABLED: process.env.CONTENT_MODERATION_ENABLED === 'true',
  
  // Crisis intervention
  CRISIS_HOTLINE_NUMBER: process.env.CRISIS_HOTLINE_NUMBER || '988',
  CRISIS_KEYWORDS: (process.env.CRISIS_KEYWORDS || 'suicide,kill,die,hurt,harm').split(','),
  
  // Privacy
  PRIVACY_ZONE_DEFAULT_RADIUS: parseInt(process.env.PRIVACY_ZONE_DEFAULT_RADIUS || '1000', 10), // meters
  LOCATION_PRECISION: parseInt(process.env.LOCATION_PRECISION || '100', 10), // meters
  
  // Community settings
  MAX_COMMUNITY_MEMBERS: parseInt(process.env.MAX_COMMUNITY_MEMBERS || '1000', 10),
  MAX_PRAYER_REQUESTS_PER_DAY: parseInt(process.env.MAX_PRAYER_REQUESTS_PER_DAY || '10', 10),
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log',
};