import type { UserId } from '@shared/types/ids';
interface JWTPayload {
    userId: UserId;
    iat?: number;
    exp?: number;
}
export declare function generateToken(userId: UserId): string;
export declare function verifyToken(token: string): JWTPayload | null;
export declare function extractTokenFromHeader(authHeader: string | undefined): string | null;
export {};
