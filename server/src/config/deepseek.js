import OpenAI from 'openai';
import { env } from './env.js';
import { logger } from './logger.js';

let deepseekClient = null;

export const createDeepSeekClient = () => {
  if (!env.DEEPSEEK_API_KEY) {
    logger.warn('DeepSeek API key not provided. AI features will be disabled.');
    return null;
  }

  if (!deepseekClient) {
    deepseekClient = new OpenAI({
      apiKey: env.DEEPSEEK_API_KEY,
      baseURL: env.DEEPSEEK_BASE_URL
    });
    logger.info('DeepSeek AI client initialized');
  }

  return deepseekClient;
};

export const getDeepSeekClient = () => {
  if (!deepseekClient) {
    return createDeepSeekClient();
  }
  return deepseekClient;
};