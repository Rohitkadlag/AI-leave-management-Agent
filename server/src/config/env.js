import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string(),
  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  APP_BASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url(),
  SERVICE_MAILBOX: z.string().email(),
  MAIL_SENDER_NAME: z.string(),
  // DeepSeek AI Configuration
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().url().default('https://api.deepseek.com')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment validation failed:', parsed.error.format());
  console.error('\n📍 Make sure your .env file exists in the root directory with all required variables.');
  console.error('📄 Check .env.example for reference.');
  process.exit(1);
}

export const env = parsed.data;