import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production-at-least-32-chars',
  encryptionPepper: process.env.ENCRYPTION_PEPPER || '',
  hibpApiKey: process.env.HIBP_API_KEY || '',
  cronSchedule: process.env.CRON_SCHEDULE || '0 */6 * * *',
};
