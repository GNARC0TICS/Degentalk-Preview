import { db } from '../db';
import { sql } from 'drizzle-orm';
import type { UserId } from '@shared/types/ids';
import Stripe from 'stripe';
import { logger } from '../src/core/logger';

// Initialize Stripe with secret key if available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
	stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
		apiVersion: '2023-10-16'
	});
} else {
	logger.warn('STRIPE_SECRET_KEY not set, Stripe integration disabled');
}

// Available DGT packages
const DGT_PACKAGES = [
	{
		id: 'basic',
		name: 'Basic Pack',
		description: 'Get started with a small amount of DGT',
		dgt_amount: 100,
		usd_price: 5.99,
		discount_percentage: 0,
		is_featured: false
	},
	{
		id: 'standard',
		name: 'Standard Pack',
		description: 'The most popular choice for regular users',
		dgt_amount: 500,
		usd_price: 24.99,
		discount_percentage: 5,
		is_featured: true
	},
	{
		id: 'premium',
		name: 'Premium Pack',
		description: 'Best value for active community members',
		dgt_amount: 1200,
		usd_price: 49.99,
		discount_percentage: 15,
		is_featured: false
	},
	{
		id: 'whale',
		name: 'Whale Pack',
		description: 'For serious Degentalk power users',
		dgt_amount: 3000,
		usd_price: 99.99,
		discount_percentage: 25,
		is_featured: false
	}
];

export class DgtWalletIntegration {
	/**
	 * Get available DGT packages
	 */
	static getAvailablePackages() {
		return DGT_PACKAGES;
	}

	/**
	 * Find package by ID
	 */
	static getPackageById(packageId: string) {
		return DGT_PACKAGES.find((pkg) => pkg.id === packageId);
	}

	/**
	 * Create Stripe checkout session for DGT purchase
	 */
	static async createStripeCheckoutSession(params: {
		userId: UserId;
		packageId: string;
		successUrl: string;
		cancelUrl: string;
	}) {
		const { userId, packageId, successUrl, cancelUrl } = params;

		// Find the package
		const dgtPackage = this.getPackageById(packageId);
		if (!dgtPackage) {
			return { success: false, error: 'Invalid package ID' };
		}

		// Check if Stripe is enabled
		if (!stripe) {
			return { success: false, error: 'Stripe is not configured' };
		}

		try {
			// Get user info
			const [user] = await db.execute(sql`
        SELECT email, username FROM users WHERE user_id = ${userId}
      `);

			if (!user) {
				return { success: false, error: 'User not found' };
			}

			// Create a checkout session
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: [
					{
						price_data: {
							currency: 'usd',
							product_data: {
								name: `${dgtPackage.name} - ${dgtPackage.dgt_amount} DGT`,
								description: dgtPackage.description
							},
							unit_amount: Math.round(dgtPackage.usd_price * 100) // Convert to cents
						},
						quantity: 1
					}
				],
				mode: 'payment',
				success_url: successUrl,
				cancel_url: cancelUrl,
				customer_email: user.email,
				metadata: {
					userId: userId.toString(),
					packageId,
					dgtAmount: dgtPackage.dgt_amount.toString()
				}
			});

			// Create a pending purchase record
			await db.execute(sql`
        INSERT INTO dgt_purchases (
          user_id, 
          package_id, 
          dgt_amount, 
          usd_amount,
          payment_method,
          payment_status,
          stripe_session_id,
          created_at
        ) VALUES (
          ${userId},
          ${packageId},
          ${dgtPackage.dgt_amount},
          ${dgtPackage.usd_price},
          'stripe',
          'pending',
          ${session.id},
          NOW()
        )
      `);

			return { success: true, url: session.url };
		} catch (error) {
			console.error('Error creating Stripe checkout session:', error);
			return { success: false, error: 'Failed to create checkout session' };
		}
	}

	/**
	 * Process USDT purchase for DGT
	 */
	static async processUsdtPurchase(params: {
		userId: UserId;
		packageId: string;
		usdtAmount: number;
		txHash: string;
	}) {
		const { userId, packageId, usdtAmount, txHash } = params;

		// Find the package
		const dgtPackage = this.getPackageById(packageId);
		if (!dgtPackage) {
			return { success: false, error: 'Invalid package ID' };
		}

		try {
			// Check if transaction hash already exists
			const [existingTx] = await db.execute(sql`
        SELECT id FROM dgt_purchases 
        WHERE usdt_tx_hash = ${txHash}
      `);

			if (existingTx) {
				return { success: false, error: 'Transaction hash already used' };
			}

			// Create a pending purchase record
			await db.execute(sql`
        INSERT INTO dgt_purchases (
          user_id, 
          package_id, 
          dgt_amount, 
          usd_amount,
          payment_method,
          payment_status,
          usdt_tx_hash,
          created_at
        ) VALUES (
          ${userId},
          ${packageId},
          ${dgtPackage.dgt_amount},
          ${dgtPackage.usd_price},
          'usdt',
          'pending',
          ${txHash},
          NOW()
        )
      `);

			return { success: true, dgtAmount: dgtPackage.dgt_amount };
		} catch (error) {
			console.error('Error processing USDT purchase:', error);
			return { success: false, error: 'Failed to process purchase' };
		}
	}

	/**
	 * Get user's DGT purchase history
	 */
	static async getUserDgtPurchaseHistory(userId: UserId, limit = 20, offset = 0) {
		try {
			const purchases = await db.execute(sql`
        SELECT 
          id,
          package_id,
          dgt_amount,
          usd_amount,
          payment_method,
          payment_status,
          stripe_session_id,
          usdt_tx_hash,
          created_at,
          completed_at
        FROM dgt_purchases
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

			return purchases.rows;
		} catch (error) {
			console.error('Error fetching purchase history:', error);
			return [];
		}
	}

	/**
	 * Handle Stripe webhook events
	 */
	static async handleStripeWebhook(event: any) {
		try {
			// Handle the event
			switch (event.type) {
				case 'checkout.session.completed': {
					const session = event.data.object;
					await this.processSuccessfulStripePayment(session);
					break;
				}
				case 'payment_intent.succeeded': {
					// Process payment if not already processed by checkout.session.completed
					const paymentIntent = event.data.object;
					// Lookup session by payment intent ID
					if (stripe) {
						const sessions = await stripe.checkout.sessions.list({
							payment_intent: paymentIntent.id,
							limit: 1
						});

						if (sessions.data.length > 0) {
							const session = sessions.data[0];
							await this.processSuccessfulStripePayment(session);
						}
					}
					break;
				}
				default:
					console.log(`Unhandled event type ${event.type}`);
			}

			return { success: true };
		} catch (error) {
			console.error('Error processing webhook:', error);
			return { success: false, error: 'Webhook processing failed' };
		}
	}

	/**
	 * Process successful Stripe payment
	 */
	private static async processSuccessfulStripePayment(session: any) {
		const { userId, packageId, dgtAmount } = session.metadata;

		// Find the purchase record
		const [purchase] = await db.execute(sql`
      SELECT id, payment_status 
      FROM dgt_purchases 
      WHERE stripe_session_id = ${session.id}
    `);

		if (!purchase) {
			console.error('Purchase record not found for session:', session.id);
			return;
		}

		// If already processed, skip
		if (purchase.payment_status === 'completed') {
			return;
		}

		// Update the purchase record
		await db.execute(sql`
      UPDATE dgt_purchases
      SET payment_status = 'completed', completed_at = NOW()
      WHERE id = ${purchase.id}
    `);

		// Add DGT to user's wallet
		await db.execute(sql`
      UPDATE users
      SET dgt_wallet_balance = dgt_wallet_balance + ${parseInt(dgtAmount)}
      WHERE user_id = ${parseInt(userId)}
    `);

		// Record the transaction
		await db.execute(sql`
      INSERT INTO wallet_transactions (
        user_id,
        transaction_type,
        amount,
        description,
        reference_id,
        created_at
      ) VALUES (
        ${parseInt(userId)},
        'purchase',
        ${parseInt(dgtAmount)},
        'DGT purchase via Stripe',
        ${purchase.id},
        NOW()
      )
    `);

		// Update lifetime earned in user_wallet
		await db.execute(sql`
      INSERT INTO user_wallet (user_id, lifetime_earned)
      VALUES (${parseInt(userId)}, ${parseInt(dgtAmount)})
      ON CONFLICT (user_id)
      DO UPDATE SET lifetime_earned = user_wallet.lifetime_earned + ${parseInt(dgtAmount)}
    `);
	}
}
