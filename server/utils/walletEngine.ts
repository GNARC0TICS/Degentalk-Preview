/**
 * Wallet Engine
 *
 * Handles DGT wallet operations including:
 * - Wallet balance management
 * - DGT purchases and unlocks
 * - Transaction logging
 */
import { db } from '../db';
import { sql } from 'drizzle-orm';
import type { UserId } from '@db/types';

interface DgtTransaction {
	id: string;
	user_id: UserId;
	amount: number;
	transaction_type: string;
	reference_id?: string;
	reference_type?: string;
	description: string;
	created_at: Date;
	metadata?: Record<string, any>;
}

interface DgtUnlock {
	id: string;
	name: string;
	type: string;
	cost_dgt: number;
	description: string;
	unlock_data: Record<string, any>;
}

interface UserWallet {
	user_id: UserId;
	dgt_balance: number;
	lifetime_earned: number;
	lifetime_spent: number;
}

interface DgtTransferOptions {
	fromUserId: UserId;
	toUserId: UserId;
	amount: number;
	description: string;
	metadata?: Record<string, any>;
}

interface DgtPurchaseResult {
	success: boolean;
	newBalance?: number;
	transaction?: DgtTransaction;
	errorMessage?: string;
}

export class WalletEngine {
	/**
	 * Get user's wallet information
	 */
	static async getUserWallet(userId: UserId): Promise<UserWallet | null> {
		try {
			// Check if user wallet exists
			const walletResult = await db.execute(sql`
        SELECT * FROM user_wallet
        WHERE user_id = ${userId}
      `);

			if (walletResult.rows.length > 0) {
				return walletResult.rows[0] as UserWallet;
			}

			// Get user's DGT balance from users table
			const userResult = await db.execute(sql`
        SELECT dgt_wallet_balance FROM users
        WHERE user_id = ${userId}
      `);

			if (userResult.rows.length === 0) {
				return null;
			}

			const dgtBalance = userResult.rows[0].dgt_wallet_balance || 0;

			// Create wallet record if it doesn't exist
			const newWalletResult = await db.execute(sql`
        INSERT INTO user_wallet (user_id, dgt_balance, lifetime_earned, lifetime_spent)
        VALUES (${userId}, ${dgtBalance}, ${dgtBalance}, 0)
        RETURNING *
      `);

			return newWalletResult.rows[0] as UserWallet;
		} catch (error) {
			console.error(`Error getting wallet for user ${userId}:`, error);
			return null;
		}
	}

	/**
	 * Get user's DGT transaction history
	 */
	static async getUserTransactions(
		userId: UserId,
		limit: number = 20,
		offset: number = 0
	): Promise<DgtTransaction[]> {
		try {
			const result = await db.execute(sql`
        SELECT * FROM dgt_transactions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

			return result.rows as DgtTransaction[];
		} catch (error) {
			console.error(`Error getting transactions for user ${userId}:`, error);
			return [];
		}
	}

	/**
	 * Get all available DGT unlocks
	 */
	static async getAvailableDgtUnlocks(): Promise<DgtUnlock[]> {
		try {
			const result = await db.execute(sql`
        SELECT * FROM dgt_unlocks
        ORDER BY cost_dgt ASC
      `);

			return result.rows as DgtUnlock[];
		} catch (error) {
			console.error('Error getting available DGT unlocks:', error);
			return [];
		}
	}

	/**
	 * Get a specific DGT unlock by ID
	 */
	static async getDgtUnlockById(unlockId: number): Promise<DgtUnlock | null> {
		try {
			const result = await db.execute(sql`
        SELECT * FROM dgt_unlocks
        WHERE id = ${unlockId}
      `);

			if (result.rows.length === 0) {
				return null;
			}

			return result.rows[0] as DgtUnlock;
		} catch (error) {
			console.error(`Error getting DGT unlock by ID ${unlockId}:`, error);
			return null;
		}
	}

	/**
	 * Get user's purchased DGT unlocks
	 */
	static async getUserUnlocks(
		userId: number
	): Promise<Array<{ unlock: DgtUnlock; acquired_at: Date }>> {
		try {
			const result = await db.execute(sql`
        SELECT u.*, l.acquired_at
        FROM dgt_unlocks u
        JOIN dgt_unlock_log l ON u.id = l.unlock_id
        WHERE l.user_id = ${userId}
        ORDER BY l.acquired_at DESC
      `);

			return result.rows.map((row) => ({
				unlock: {
					id: row.id,
					name: row.name,
					type: row.type,
					cost_dgt: row.cost_dgt,
					description: row.description,
					unlock_data: row.unlock_data
				},
				acquired_at: row.acquired_at
			}));
		} catch (error) {
			console.error(`Error getting unlocks for user ${userId}:`, error);
			return [];
		}
	}

	/**
	 * Purchase a DGT unlock
	 */
	static async purchaseDgtUnlock(userId: UserId, unlockId: number): Promise<DgtPurchaseResult> {
		try {
			return await db.transaction(async (tx) => {
				// Get the unlock
				const unlockResult = await tx.execute(sql`
          SELECT * FROM dgt_unlocks
          WHERE id = ${unlockId}
        `);

				if (unlockResult.rows.length === 0) {
					return {
						success: false,
						errorMessage: 'Unlock not found'
					};
				}

				const unlock = unlockResult.rows[0] as DgtUnlock;

				// Check if user already has this unlock
				const existingUnlockResult = await tx.execute(sql`
          SELECT id FROM dgt_unlock_log
          WHERE user_id = ${userId} AND unlock_id = ${unlockId}
        `);

				if (existingUnlockResult.rows.length > 0) {
					return {
						success: false,
						errorMessage: 'User already has this unlock'
					};
				}

				// Get user's balance
				const userResult = await tx.execute(sql`
          SELECT dgt_wallet_balance FROM users
          WHERE user_id = ${userId}
        `);

				if (userResult.rows.length === 0) {
					return {
						success: false,
						errorMessage: 'User not found'
					};
				}

				const balance = parseInt(userResult.rows[0].dgt_wallet_balance) || 0;

				// Check if user has enough DGT
				if (balance < unlock.cost_dgt) {
					return {
						success: false,
						errorMessage: 'Insufficient DGT balance'
					};
				}

				// Deduct DGT from user's balance
				await tx.execute(sql`
          UPDATE users
          SET dgt_wallet_balance = dgt_wallet_balance - ${unlock.cost_dgt}
          WHERE user_id = ${userId}
        `);

				// Log the unlock purchase
				await tx.execute(sql`
          INSERT INTO dgt_unlock_log (user_id, unlock_id, dgt_spent, acquired_at)
          VALUES (${userId}, ${unlockId}, ${unlock.cost_dgt}, NOW())
        `);

				// Update user's lifetime spent in wallet
				await tx.execute(sql`
          INSERT INTO user_wallet (user_id, dgt_balance, lifetime_earned, lifetime_spent)
          VALUES (${userId}, (SELECT dgt_wallet_balance FROM users WHERE user_id = ${userId}), 0, ${unlock.cost_dgt})
          ON CONFLICT (user_id)
          DO UPDATE SET
            dgt_balance = (SELECT dgt_wallet_balance FROM users WHERE user_id = ${userId}),
            lifetime_spent = user_wallet.lifetime_spent + ${unlock.cost_dgt},
            updated_at = NOW()
        `);

				// Record DGT transaction
				const transactionResult = await tx.execute(sql`
          INSERT INTO dgt_transactions
          (user_id, amount, transaction_type, reference_id, reference_type, description, metadata)
          VALUES (
            ${userId},
            -${unlock.cost_dgt},
            'unlock_purchase',
            ${unlockId},
            'dgt_unlock',
            ${'Purchased ' + unlock.name},
            ${JSON.stringify({
							unlock_id: unlock.id,
							unlock_name: unlock.name,
							unlock_type: unlock.type
						})}
          )
          RETURNING *
        `);

				// Process unlock-specific logic based on type
				switch (unlock.type) {
					case 'avatar_frame':
						if (unlock.unlock_data && unlock.unlock_data.frame_id) {
							await tx.execute(sql`
                UPDATE users
                SET avatar_frame_id = ${unlock.unlock_data.frame_id}
                WHERE user_id = ${userId}
              `);
						}
						break;

					case 'username_color':
						if (unlock.unlock_data && unlock.unlock_data.color_code) {
							await tx.execute(sql`
                UPDATE users
                SET username_color = ${unlock.unlock_data.color_code}
                WHERE user_id = ${userId}
              `);
						}
						break;

					case 'emoji_pack':
						if (unlock.unlock_data && unlock.unlock_data.emoji_ids) {
							await tx.execute(sql`
                UPDATE users
                SET unlocked_emojis = array_cat(unlocked_emojis, ${sql.array(unlock.unlock_data.emoji_ids)})
                WHERE user_id = ${userId}
              `);
						}
						break;

					case 'title':
						if (unlock.unlock_data && unlock.unlock_data.title_id) {
							await tx.execute(sql`
                UPDATE users
                SET unlocked_titles = array_append(unlocked_titles, ${unlock.unlock_data.title_id})
                WHERE user_id = ${userId}
              `);
						}
						break;

					case 'badge':
						if (unlock.unlock_data && unlock.unlock_data.badge_id) {
							await tx.execute(sql`
                UPDATE users
                SET unlocked_badges = array_append(unlocked_badges, ${unlock.unlock_data.badge_id})
                WHERE user_id = ${userId}
              `);
						}
						break;

					case 'profile_boost':
						// Handle profile boost (e.g., set expiration time)
						if (unlock.unlock_data && unlock.unlock_data.days) {
							const days = unlock.unlock_data.days;
							await tx.execute(sql`
                UPDATE users
                SET profile_boost_expiry = COALESCE(
                  profile_boost_expiry,
                  NOW()
                ) + INTERVAL '${days} days'
                WHERE user_id = ${userId}
              `);
						}
						break;

					case 'rename_token':
						// Add rename token to user
						await tx.execute(sql`
              UPDATE users
              SET rename_tokens = COALESCE(rename_tokens, 0) + 1
              WHERE user_id = ${userId}
            `);
						break;

					// Add more cases as needed for different unlock types
				}

				return {
					success: true,
					newBalance: balance - unlock.cost_dgt,
					transaction: transactionResult.rows[0] as DgtTransaction
				};
			});
		} catch (error) {
			console.error(`Error purchasing unlock ${unlockId} for user ${userId}:`, error);

			return {
				success: false,
				errorMessage: 'Server error processing purchase'
			};
		}
	}

	/**
	 * Transfer DGT between users
	 */
	static async transferDgt(options: DgtTransferOptions): Promise<DgtPurchaseResult> {
		const { fromUserId, toUserId, amount, description, metadata = {} } = options;

		if (fromUserId === toUserId) {
			return {
				success: false,
				errorMessage: 'Cannot transfer to yourself'
			};
		}

		if (amount <= 0) {
			return {
				success: false,
				errorMessage: 'Transfer amount must be positive'
			};
		}

		try {
			return await db.transaction(async (tx) => {
				// Get sender's balance
				const senderResult = await tx.execute(sql`
          SELECT dgt_wallet_balance FROM users
          WHERE user_id = ${fromUserId}
        `);

				if (senderResult.rows.length === 0) {
					return {
						success: false,
						errorMessage: 'Sender not found'
					};
				}

				const senderBalance = parseInt(senderResult.rows[0].dgt_wallet_balance) || 0;

				// Check if sender has enough DGT
				if (senderBalance < amount) {
					return {
						success: false,
						errorMessage: 'Insufficient DGT balance'
					};
				}

				// Check if recipient exists
				const recipientResult = await tx.execute(sql`
          SELECT user_id FROM users
          WHERE user_id = ${toUserId}
        `);

				if (recipientResult.rows.length === 0) {
					return {
						success: false,
						errorMessage: 'Recipient not found'
					};
				}

				// Transfer DGT
				// Deduct from sender
				await tx.execute(sql`
          UPDATE users
          SET dgt_wallet_balance = dgt_wallet_balance - ${amount}
          WHERE user_id = ${fromUserId}
        `);

				// Add to recipient
				await tx.execute(sql`
          UPDATE users
          SET dgt_wallet_balance = dgt_wallet_balance + ${amount}
          WHERE user_id = ${toUserId}
        `);

				// Update sender's wallet stats
				await tx.execute(sql`
          INSERT INTO user_wallet (user_id, dgt_balance, lifetime_earned, lifetime_spent)
          VALUES (${fromUserId}, (SELECT dgt_wallet_balance FROM users WHERE user_id = ${fromUserId}), 0, ${amount})
          ON CONFLICT (user_id)
          DO UPDATE SET
            dgt_balance = (SELECT dgt_wallet_balance FROM users WHERE user_id = ${fromUserId}),
            lifetime_spent = user_wallet.lifetime_spent + ${amount},
            updated_at = NOW()
        `);

				// Update recipient's wallet stats
				await tx.execute(sql`
          INSERT INTO user_wallet (user_id, dgt_balance, lifetime_earned, lifetime_spent)
          VALUES (${toUserId}, (SELECT dgt_wallet_balance FROM users WHERE user_id = ${toUserId}), ${amount}, 0)
          ON CONFLICT (user_id)
          DO UPDATE SET
            dgt_balance = (SELECT dgt_wallet_balance FROM users WHERE user_id = ${toUserId}),
            lifetime_earned = user_wallet.lifetime_earned + ${amount},
            updated_at = NOW()
        `);

				// Record sender transaction
				const senderTransactionResult = await tx.execute(sql`
          INSERT INTO dgt_transactions
          (user_id, amount, transaction_type, reference_id, reference_type, description, metadata)
          VALUES (
            ${fromUserId},
            -${amount},
            'transfer_out',
            ${toUserId},
            'user',
            ${description},
            ${JSON.stringify({
							...metadata,
							recipient_id: toUserId
						})}
          )
          RETURNING *
        `);

				// Record recipient transaction
				await tx.execute(sql`
          INSERT INTO dgt_transactions
          (user_id, amount, transaction_type, reference_id, reference_type, description, metadata)
          VALUES (
            ${toUserId},
            ${amount},
            'transfer_in',
            ${fromUserId},
            'user',
            ${description},
            ${JSON.stringify({
							...metadata,
							sender_id: fromUserId
						})}
          )
        `);

				return {
					success: true,
					newBalance: senderBalance - amount,
					transaction: senderTransactionResult.rows[0] as DgtTransaction
				};
			});
		} catch (error) {
			console.error(
				`Error transferring ${amount} DGT from user ${fromUserId} to user ${toUserId}:`,
				error
			);

			return {
				success: false,
				errorMessage: 'Server error processing transfer'
			};
		}
	}

	/**
	 * Add DGT to user's balance (admin function)
	 */
	static async addDgt(
		userId: UserId,
		amount: number,
		reason: string,
		metadata: Record<string, any> = {}
	): Promise<DgtPurchaseResult> {
		if (amount <= 0) {
			return {
				success: false,
				errorMessage: 'Amount must be positive'
			};
		}

		try {
			return await db.transaction(async (tx) => {
				// Check if user exists
				const userResult = await tx.execute(sql`
          SELECT dgt_wallet_balance FROM users
          WHERE user_id = ${userId}
        `);

				if (userResult.rows.length === 0) {
					return {
						success: false,
						errorMessage: 'User not found'
					};
				}

				const currentBalance = parseInt(userResult.rows[0].dgt_wallet_balance) || 0;

				// Add DGT to user's balance
				await tx.execute(sql`
          UPDATE users
          SET dgt_wallet_balance = dgt_wallet_balance + ${amount}
          WHERE user_id = ${userId}
        `);

				// Update user's wallet stats
				await tx.execute(sql`
          INSERT INTO user_wallet (user_id, dgt_balance, lifetime_earned, lifetime_spent)
          VALUES (${userId}, (SELECT dgt_wallet_balance FROM users WHERE user_id = ${userId}), ${amount}, 0)
          ON CONFLICT (user_id)
          DO UPDATE SET
            dgt_balance = (SELECT dgt_wallet_balance FROM users WHERE user_id = ${userId}),
            lifetime_earned = user_wallet.lifetime_earned + ${amount},
            updated_at = NOW()
        `);

				// Record transaction
				const transactionResult = await tx.execute(sql`
          INSERT INTO dgt_transactions
          (user_id, amount, transaction_type, description, metadata)
          VALUES (
            ${userId},
            ${amount},
            'admin_add',
            ${reason},
            ${JSON.stringify(metadata)}
          )
          RETURNING *
        `);

				return {
					success: true,
					newBalance: currentBalance + amount,
					transaction: transactionResult.rows[0] as DgtTransaction
				};
			});
		} catch (error) {
			console.error(`Error adding ${amount} DGT to user ${userId}:`, error);

			return {
				success: false,
				errorMessage: 'Server error processing DGT addition'
			};
		}
	}

	/**
	 * Deduct DGT from user's balance (admin function)
	 */
	static async deductDgt(
		userId: UserId,
		amount: number,
		reason: string,
		metadata: Record<string, any> = {}
	): Promise<DgtPurchaseResult> {
		if (amount <= 0) {
			return {
				success: false,
				errorMessage: 'Amount must be positive'
			};
		}

		try {
			return await db.transaction(async (tx) => {
				// Check if user exists and has enough DGT
				const userResult = await tx.execute(sql`
          SELECT dgt_wallet_balance FROM users
          WHERE user_id = ${userId}
        `);

				if (userResult.rows.length === 0) {
					return {
						success: false,
						errorMessage: 'User not found'
					};
				}

				const currentBalance = parseInt(userResult.rows[0].dgt_wallet_balance) || 0;

				if (currentBalance < amount) {
					return {
						success: false,
						errorMessage: 'Insufficient DGT balance'
					};
				}

				// Deduct DGT from user's balance
				await tx.execute(sql`
          UPDATE users
          SET dgt_wallet_balance = dgt_wallet_balance - ${amount}
          WHERE user_id = ${userId}
        `);

				// Update user's wallet stats
				await tx.execute(sql`
          INSERT INTO user_wallet (user_id, dgt_balance, lifetime_earned, lifetime_spent)
          VALUES (${userId}, (SELECT dgt_wallet_balance FROM users WHERE user_id = ${userId}), 0, ${amount})
          ON CONFLICT (user_id)
          DO UPDATE SET
            dgt_balance = (SELECT dgt_wallet_balance FROM users WHERE user_id = ${userId}),
            lifetime_spent = user_wallet.lifetime_spent + ${amount},
            updated_at = NOW()
        `);

				// Record transaction
				const transactionResult = await tx.execute(sql`
          INSERT INTO dgt_transactions
          (user_id, amount, transaction_type, description, metadata)
          VALUES (
            ${userId},
            -${amount},
            'admin_deduct',
            ${reason},
            ${JSON.stringify(metadata)}
          )
          RETURNING *
        `);

				return {
					success: true,
					newBalance: currentBalance - amount,
					transaction: transactionResult.rows[0] as DgtTransaction
				};
			});
		} catch (error) {
			console.error(`Error deducting ${amount} DGT from user ${userId}:`, error);

			return {
				success: false,
				errorMessage: 'Server error processing DGT deduction'
			};
		}
	}

	/**
	 * Get DGT leaderboard
	 */
	static async getDgtLeaderboard(
		type: 'balance' | 'earned' | 'spent' = 'balance',
		limit: number = 10,
		offset: number = 0
	): Promise<
		Array<{
			user_id: number;
			username: string;
			amount: number;
			rank: number;
		}>
	> {
		try {
			let query;

			switch (type) {
				case 'earned':
					query = sql`
            SELECT 
              u.user_id,
              u.username,
              w.lifetime_earned as amount,
              ROW_NUMBER() OVER (ORDER BY w.lifetime_earned DESC) as rank
            FROM user_wallet w
            JOIN users u ON w.user_id = u.user_id
            ORDER BY w.lifetime_earned DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
					break;

				case 'spent':
					query = sql`
            SELECT 
              u.user_id,
              u.username,
              w.lifetime_spent as amount,
              ROW_NUMBER() OVER (ORDER BY w.lifetime_spent DESC) as rank
            FROM user_wallet w
            JOIN users u ON w.user_id = u.user_id
            ORDER BY w.lifetime_spent DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
					break;

				case 'balance':
				default:
					query = sql`
            SELECT 
              u.user_id,
              u.username,
              u.dgt_wallet_balance as amount,
              ROW_NUMBER() OVER (ORDER BY u.dgt_wallet_balance DESC) as rank
            FROM users u
            ORDER BY u.dgt_wallet_balance DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
					break;
			}

			const result = await db.execute(query);
			return result.rows;
		} catch (error) {
			console.error(`Error getting DGT leaderboard for type ${type}:`, error);
			return [];
		}
	}
}
