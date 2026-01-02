import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  name: process.env.DB_NAME || 'shoe_shop',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
}));
