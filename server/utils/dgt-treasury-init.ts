import { db } from '../db';
import { sql } from 'drizzle-orm';
import { logger, LogLevel, LogAction } from '../src/core/logger';

// Constants for DGT token economy
const TOTAL_DGT_SUPPLY = 1000000000n * 1000000n; // 1 billion tokens with 6 decimal places
const TREASURY_ALLOCATION_PERCENT = 50; // 50% of total supply
const COMMUNITY_REWARDS_ALLOCATION_PERCENT = 20; // 20% of total supply
const TEAM_ADVISORS_ALLOCATION_PERCENT = 15; // 15% of total supply
const LIQUIDITY_ALLOCATION_PERCENT = 10; // 10% of total supply
const PARTNERSHIPS_ALLOCATION_PERCENT = 5; // 5% of total supply

/**
 * Initialize the DGT Treasury and allocate the initial supply
 */
export async function initializeTreasurySystem() {
	logger.info('TREASURY', 'Starting DGT Treasury system initialization...');

	try {
		// Check if the treasury settings already exist
		const existingSettings = await db.execute(sql`
      SELECT * FROM treasury_settings LIMIT 1
    `);

		if (existingSettings.rows.length > 0) {
			logger.info('TREASURY', 'Treasury settings already exist, skipping initialization.');
			return;
		}

		// Calculate token allocations
		const treasuryAmount = (TOTAL_DGT_SUPPLY * BigInt(TREASURY_ALLOCATION_PERCENT)) / 100n;

		// Insert initial treasury settings
		await db.execute(sql`
      INSERT INTO treasury_settings (
        treasury_wallet_address,
        dgt_treasury_balance,
        min_withdrawal_amount,
        withdrawal_fee_percent,
        reward_distribution_delay_hours,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        'TREASURY_SYSTEM_TRON_ADDRESS',
        ${treasuryAmount.toString()},
        5000000, -- 5 DGT
        0.0,
        24,
        TRUE,
        NOW(),
        NOW()
      )
    `);

		logger.info(
			'TREASURY',
			`✅ Created treasury settings with initial balance of ${Number(treasuryAmount) / 1000000} DGT`
		);

		// Record the initial supply allocation as a transaction
		await db.execute(sql`
      INSERT INTO transactions (
        uuid,
        amount,
        type,
        status,
        description,
        is_treasury_transaction,
        created_at,
        updated_at,
        confirmed_at
      ) VALUES (
        GEN_RANDOM_UUID(),
        ${treasuryAmount.toString()},
        'ADMIN_ADJUST',
        'confirmed',
        'Initial treasury allocation of DGT supply',
        TRUE,
        NOW(),
        NOW(),
        NOW()
      )
    `);

		logger.info('TREASURY', '✅ Recorded initial treasury allocation transaction');

		// Log the allocation breakdown for verification
		const allocationInfo = [
			'DGT Token Allocation:',
			`- Treasury Reserve (${TREASURY_ALLOCATION_PERCENT}%): ${Number(treasuryAmount) / 1000000} DGT`,
			`- Community Rewards (${COMMUNITY_REWARDS_ALLOCATION_PERCENT}%): ${Number((TOTAL_DGT_SUPPLY * BigInt(COMMUNITY_REWARDS_ALLOCATION_PERCENT)) / 100n) / 1000000} DGT`,
			`- Team/Advisors (${TEAM_ADVISORS_ALLOCATION_PERCENT}%): ${Number((TOTAL_DGT_SUPPLY * BigInt(TEAM_ADVISORS_ALLOCATION_PERCENT)) / 100n) / 1000000} DGT`,
			`- Liquidity (${LIQUIDITY_ALLOCATION_PERCENT}%): ${Number((TOTAL_DGT_SUPPLY * BigInt(LIQUIDITY_ALLOCATION_PERCENT)) / 100n) / 1000000} DGT`,
			`- Partnerships (${PARTNERSHIPS_ALLOCATION_PERCENT}%): ${Number((TOTAL_DGT_SUPPLY * BigInt(PARTNERSHIPS_ALLOCATION_PERCENT)) / 100n) / 1000000} DGT`
		].join('\n');

		logger.info('TREASURY', allocationInfo);
		logger.info('TREASURY', '✅ DGT Treasury system initialized successfully');
	} catch (error) {
		logger.error('TREASURY', '❌ Failed to initialize DGT Treasury system', error);
		throw error;
	}
}
