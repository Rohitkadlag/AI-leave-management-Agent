import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export const hashPassword = async (password) => {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
};

export const verifyPassword = async (password, hash) => {
  try {
    const [salt, key] = hash.split(':');
    const saltBuffer = Buffer.from(salt, 'hex');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = await scryptAsync(password, saltBuffer, 64);
    
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch (error) {
    return false;
  }
};