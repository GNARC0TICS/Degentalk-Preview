import type { UserId } from '../../types/ids.js';
export declare function logDevEvent(action: string, result: any, setLog: (fn: (prev: string[]) => string[]) => void): void;
export declare function mockDeposit(userId: UserId, amount: number): Promise<void>;
export declare function forceBalanceSync(userId: UserId): Promise<void>;
