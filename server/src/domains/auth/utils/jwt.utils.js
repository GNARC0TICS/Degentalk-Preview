import * as jwt from 'jsonwebtoken';
import { logger } from '@core/logger';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}
export function generateToken(userId) {
    try {
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        logger.debug('Auth', 'JWT generated', { userId });
        return token;
    }
    catch (error) {
        logger.error('Auth', 'Error generating JWT', { error, userId });
        throw new Error('Failed to generate authentication token');
    }
}
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        logger.debug('Auth', 'JWT verification failed', { error });
        return null;
    }
}
export function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
