import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'SECRET_KEY',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
}));
