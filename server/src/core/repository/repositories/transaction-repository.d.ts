/**
 * Transaction Repository Implementation
 *
 * QUALITY IMPROVEMENT: Repository pattern for Transaction data access
 * Implements ITransactionRepository interface with proper error handling and type safety
 */
import type { UserId } from '@shared/types/ids';
import { BaseRepository, type PaginatedResult, type QueryOptions } from '../base-repository';
import type { ITransactionRepository } from '../interfaces';
import type { Transaction } from '@schema';
export declare class TransactionRepository extends BaseRepository<Transaction> implements ITransactionRepository {
    protected table: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "transactions";
        schema: undefined;
        columns: {
            id: import("drizzle-orm/pg-core").PgColumn<{
                name: "id";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: true;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            userId: import("drizzle-orm/pg-core").PgColumn<{
                name: "user_id";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            walletId: import("drizzle-orm/pg-core").PgColumn<{
                name: "wallet_id";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            fromUserId: import("drizzle-orm/pg-core").PgColumn<{
                name: "from_user_id";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            toUserId: import("drizzle-orm/pg-core").PgColumn<{
                name: "to_user_id";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            amount: import("drizzle-orm/pg-core").PgColumn<{
                name: "amount";
                tableName: "transactions";
                dataType: "number";
                columnType: "PgBigInt53";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            type: import("drizzle-orm/pg-core").PgColumn<{
                name: "type";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgEnumColumn";
                data: "TIP" | "DEPOSIT" | "WITHDRAWAL" | "ADMIN_ADJUST" | "RAIN" | "AIRDROP" | "SHOP_PURCHASE" | "REWARD" | "REFERRAL_BONUS" | "FEE" | "VAULT_LOCK" | "VAULT_UNLOCK";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["TIP", "DEPOSIT", "WITHDRAWAL", "ADMIN_ADJUST", "RAIN", "AIRDROP", "SHOP_PURCHASE", "REWARD", "REFERRAL_BONUS", "FEE", "VAULT_LOCK", "VAULT_UNLOCK"];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            status: import("drizzle-orm/pg-core").PgColumn<{
                name: "status";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgEnumColumn";
                data: "pending" | "confirmed" | "failed" | "reversed" | "disputed";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["pending", "confirmed", "failed", "reversed", "disputed"];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            description: import("drizzle-orm/pg-core").PgColumn<{
                name: "description";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgText";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [string, ...string[]];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            metadata: import("drizzle-orm/pg-core").PgColumn<{
                name: "metadata";
                tableName: "transactions";
                dataType: "json";
                columnType: "PgJsonb";
                data: unknown;
                driverParam: unknown;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            blockchainTxId: import("drizzle-orm/pg-core").PgColumn<{
                name: "blockchain_tx_id";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [string, ...string[]];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {
                length: 255;
            }>;
            fromWalletAddress: import("drizzle-orm/pg-core").PgColumn<{
                name: "from_wallet_address";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [string, ...string[]];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {
                length: 255;
            }>;
            toWalletAddress: import("drizzle-orm/pg-core").PgColumn<{
                name: "to_wallet_address";
                tableName: "transactions";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [string, ...string[]];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {
                length: 255;
            }>;
            isTreasuryTransaction: import("drizzle-orm/pg-core").PgColumn<{
                name: "is_treasury_transaction";
                tableName: "transactions";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            createdAt: import("drizzle-orm/pg-core").PgColumn<{
                name: "created_at";
                tableName: "transactions";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            updatedAt: import("drizzle-orm/pg-core").PgColumn<{
                name: "updated_at";
                tableName: "transactions";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
        };
        dialect: "pg";
    }>;
    protected entityName: string;
    /**
     * Find transactions by user ID with pagination
     */
    findByUserId(userId: UserId, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;
    /**
     * Find transactions by type with pagination
     */
    findByType(type: string, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;
    /**
     * Find transactions by status with pagination
     */
    findByStatus(status: string, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;
    /**
     * Get total transaction amount by user and optionally by type
     */
    getTotalByUser(userId: UserId, type?: string): Promise<number>;
    /**
     * Get balance by user (credits minus debits)
     */
    getBalanceByUser(userId: UserId): Promise<number>;
    /**
     * Get transactions by date range
     */
    findByDateRange(startDate: Date, endDate: Date, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;
    /**
     * Get transaction statistics for a user
     */
    getUserStats(userId: UserId): Promise<{
        totalTransactions: number;
        totalCredits: number;
        totalDebits: number;
        balance: number;
        lastTransactionAt: Date | null;
    }>;
    /**
     * Prepare data for transaction creation with validation
     */
    protected prepareCreateData(data: Partial<Transaction>): any;
}
