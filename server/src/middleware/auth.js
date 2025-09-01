import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export const signJWT = async (payload) => {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(env.JWT_ISSUER)
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);
  } catch (error) {
    logger.error('JWT signing failed:', error);
    throw new Error('Token generation failed');
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, secret, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE
    });

    req.user = payload;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};