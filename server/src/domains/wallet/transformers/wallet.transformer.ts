/**
 * Wallet Data Transformer - Security-First Implementation
 *
 * Transforms raw database wallet records into role-appropriate
 * response objects with GDPR compliance, financial security, and audit trail.
 */

import type {
	WalletId,
	TransactionId,
	CryptoWalletId,
	UserId,
	DgtAmount,
	UsdAmount,
	XpAmount
} from '@shared/types/ids';
import type {
	PublicWallet,
	AuthenticatedWallet,
	AdminWallet,
	PublicTransaction,
	AuthenticatedTransaction,
	AdminTransaction,
	PublicCryptoWallet,
	AuthenticatedCryptoWallet,
	AdminCryptoWallet,
	TransactionHistoryItem
} from '@shared/types/wallet/wallet.types';
import { createHash } from 'crypto';
import { logger } from '@core/logger';

export class WalletTransformer {
	/**
	 * Transform wallet data for public consumption
	 * Only shows basic balance and public user info
	 */
	static toPublicWallet(dbWallet: any): PublicWallet {
		if (!dbWallet) {
			throw new Error('Invalid wallet data provided to transformer');
		}

		return {
			id: dbWallet.id as WalletId,
			balance: this.sanitizeDgtAmount(dbWallet.balance),

			// User data (via UserTransformer)
			user: {
				id: dbWallet.user?.id as UserId,
				username: dbWallet.user?.username || '[deleted]',
				avatarUrl: dbWallet.user?.avatarUrl || undefined,
				level: this.calculateLevel(dbWallet.user?.xp || 0)
			},

			// Public stats only (if enabled by user preferences)
			publicStats: this.shouldShowPublicStats(dbWallet.user)
				? {
						totalEarned: this.calculateTotalEarned(dbWallet.transactions),
						totalSpent: this.calculateTotalSpent(dbWallet.transactions),
						level: this.calculateLevel(dbWallet.user?.xp || 0)
					}
				: undefined
		};
	}

	/**
	 * Transform wallet data for authenticated user viewing their own wallet
	 * Includes personal financial data and permissions
	 */
	static toAuthenticatedWallet(dbWallet: any, requestingUser: any): AuthenticatedWallet {
		const publicData = this.toPublicWallet(dbWallet);

		return {
			...publicData,
			estimatedUsdValue: this.calculateUsdValue(dbWallet.balance),

			// Transaction permissions
			permissions: this.calculateWalletPermissions(dbWallet, requestingUser),

			// Enhanced stats
			detailedStats: {
				totalTips: this.calculateTotalTips(dbWallet.transactions),
				totalRainReceived: this.calculateTotalRain(dbWallet.transactions),
				totalWithdrawn: this.calculateTotalWithdrawals(dbWallet.transactions),
				totalDeposited: this.calculateTotalDeposits(dbWallet.transactions),
				weeklyEarnings: this.calculateWeeklyEarnings(dbWallet.transactions),
				monthlyEarnings: this.calculateMonthlyEarnings(dbWallet.transactions)
			},

			// Limits and restrictions
			limits: {
				dailyTipLimit: this.getDailyTipLimit(requestingUser),
				dailyWithdrawalLimit: this.getDailyWithdrawalLimit(requestingUser),
				remainingDaily: {
					tips: this.getRemainingDailyTips(dbWallet, requestingUser),
					withdrawals: this.getRemainingDailyWithdrawals(dbWallet, requestingUser)
				}
			}
		};
	}

	/**
	 * Transform wallet data for admin view
	 * Includes all data with proper anonymization and audit trail
	 */
	static toAdminWallet(dbWallet: any): AdminWallet {
		const authenticatedData = this.toAuthenticatedWallet(dbWallet, { role: 'admin' });

		return {
			...authenticatedData,
			// Admin-only financial data
			adminData: {
				totalVolumeUsd: this.calculateTotalVolume(dbWallet.transactions),
				flaggedTransactions: this.countFlaggedTransactions(dbWallet.transactions),
				riskScore: this.calculateRiskScore(dbWallet),
				lastLargeTransaction: this.getLastLargeTransaction(dbWallet.transactions),
				suspiciousActivity: this.detectSuspiciousActivity(dbWallet)
			},

			// System fields
			internalNotes: dbWallet.internalNotes || undefined,
			complianceFlags: dbWallet.complianceFlags || undefined,
			kycStatus: dbWallet.kycStatus || undefined,

			// Enhanced audit trail
			auditLog: {
				createdAt: dbWallet.createdAt,
				createdBy: (dbWallet.createdBy as UserId) || undefined,
				lastModifiedAt: dbWallet.updatedAt,
				lastModifiedBy: (dbWallet.updatedBy as UserId) || undefined,
				accessLog: this.getRecentAccessLog(dbWallet),
				complianceHistory: this.getComplianceHistory(dbWallet)
			}
		};
	}

	/**
	 * Transform transaction data for public consumption
	 * Strips all sensitive financial and system data
	 */
	static toPublicTransaction(dbTransaction: any): PublicTransaction {
		if (!dbTransaction) {
			throw new Error('Invalid transaction data provided to transformer');
		}

		return {
			id: dbTransaction.id as TransactionId,
			type: dbTransaction.type,
			amount: this.sanitizeDgtAmount(dbTransaction.amount),
			status: dbTransaction.status,
			createdAt: dbTransaction.createdAt,

			// Public transaction context (sanitized)
			displayType: this.getDisplayType(dbTransaction.type),
			direction: this.getTransactionDirection(dbTransaction),

			// Related user (if applicable and public)
			relatedUser: this.getPublicRelatedUser(dbTransaction)
		};
	}

	/**
	 * Transform transaction data for authenticated users
	 * Includes personal context and USD values
	 */
	static toAuthenticatedTransaction(
		dbTransaction: any,
		requestingUser: any
	): AuthenticatedTransaction {
		const publicData = this.toPublicTransaction(dbTransaction);

		return {
			...publicData,
			description: dbTransaction.description || undefined,
			metadata: this.filterMetadataForUser(dbTransaction.metadata, requestingUser),

			// Enhanced context with source normalization
			context: {
				source: this.normalizeTransactionSource(
					dbTransaction.metadata?.source || dbTransaction.type
				),
				threadId: dbTransaction.metadata?.threadId || undefined,
				postId: dbTransaction.metadata?.postId || undefined,
				targetUserId: (dbTransaction.toUserId as UserId) || undefined,
				originatingIP: this.getAnonymizedIP(dbTransaction.metadata?.ipAddress),
				platform: dbTransaction.metadata?.platform || 'web'
			},

			// Audit trail for user
			auditTrail: {
				processedAt: new Date().toISOString(),
				verificationStatus: this.getVerificationStatus(dbTransaction),
				riskLevel: this.calculateTransactionRiskLevel(dbTransaction)
			},

			// USD values
			usdAmount: this.calculateTransactionUsdValue(dbTransaction),
			exchangeRate: dbTransaction.exchangeRate || undefined,

			// Fees
			fee: this.calculateTransactionFee(dbTransaction),
			netAmount: this.calculateNetAmount(dbTransaction)
		};
	}

	/**
	 * Transform transaction data for admin view
	 * Includes all system data with proper IP anonymization
	 */
	static toAdminTransaction(dbTransaction: any, requestingAdmin: any): AdminTransaction {
		const authenticatedData = this.toAuthenticatedTransaction(dbTransaction, requestingAdmin);

		return {
			...authenticatedData,
			// Full system data
			systemData: {
				fromWalletId: (dbTransaction.fromWalletId as WalletId) || undefined,
				toWalletId: (dbTransaction.toWalletId as WalletId) || undefined,
				blockchainTxId: dbTransaction.blockchainTxId || undefined,
				fromWalletAddress: dbTransaction.fromWalletAddress || undefined,
				toWalletAddress: dbTransaction.toWalletAddress || undefined,
				isTreasuryTransaction: dbTransaction.isTreasuryTransaction || false,
				ipHash: dbTransaction.ipAddress ? this.hashIP(dbTransaction.ipAddress) : undefined
			},

			// Admin fields
			adminNotes: dbTransaction.adminNotes || undefined,
			flagged: dbTransaction.flagged || false,
			flagReason: dbTransaction.flagReason || undefined,
			reviewedBy: (dbTransaction.reviewedBy as UserId) || undefined,
			reviewedAt: dbTransaction.reviewedAt || undefined,

			// Full metadata
			rawMetadata: dbTransaction.metadata || {},
			auditLog: dbTransaction.auditLog || []
		};
	}

	/**
	 * Transform single transaction for transaction history display
	 * Optimized for wallet history and audit trail views
	 */
	static toTransactionHistoryItem(
		dbTransaction: any,
		requestingUser?: any
	): TransactionHistoryItem {
		return {
			id: dbTransaction.id as TransactionId,
			type: this.normalizeTransactionTypeForHistory(dbTransaction.type),
			amount: this.sanitizeDgtAmount(dbTransaction.amount),
			usdValue: this.calculateTransactionUsdValue(dbTransaction),

			// Direction and counterparty
			direction: this.getTransactionDirection(dbTransaction, requestingUser?.id),
			counterparty: this.getTransactionCounterparty(dbTransaction, requestingUser?.id),

			// Essential metadata
			description: this.sanitizeDescription(dbTransaction.description),
			timestamp: dbTransaction.createdAt.toISOString(),
			status: this.getTransactionStatus(dbTransaction),

			// Enhanced context with source normalization
			context: {
				source: this.normalizeTransactionSource(
					dbTransaction.metadata?.source || dbTransaction.type
				),
				category: this.getTransactionCategory(dbTransaction),
				reference: dbTransaction.metadata?.reference || dbTransaction.id,

				// Related entities (anonymized for privacy)
				threadId: dbTransaction.metadata?.threadId || undefined,
				postId: dbTransaction.metadata?.postId || undefined,
				itemId: dbTransaction.metadata?.itemId || undefined
			},

			// Transaction properties
			properties: {
				isReversible: this.isTransactionReversible(dbTransaction),
				hasReceipt: !!dbTransaction.receiptUrl,
				isInternal: this.isInternalTransaction(dbTransaction),
				requiresConfirmation: this.requiresConfirmation(dbTransaction)
			},

			// Audit and verification
			verification: {
				isVerified: dbTransaction.status === 'confirmed',
				verifiedAt: dbTransaction.confirmedAt?.toISOString(),
				blockchainTxId: dbTransaction.blockchainTxId || undefined,
				confirmations: dbTransaction.confirmations || 0
			}
		};
	}

	/**
	 * Transform transaction list specifically for history views
	 * Optimized for wallet history display with enhanced filtering
	 */
	static toTransactionHistory(
		dbTransactions: any[],
		requestingUser: any,
		isAdmin: boolean = false
	): { transactions: TransactionHistoryItem[]; summary: any } {
		// Filter transactions if filters provided
		let filteredTransactions = dbTransactions;

		if (filters?.dateRange) {
			filteredTransactions = filteredTransactions.filter((tx) => {
				const txDate = new Date(tx.createdAt);
				return txDate >= filters.dateRange!.start && txDate <= filters.dateRange!.end;
			});
		}

		if (filters?.categories?.length) {
			filteredTransactions = filteredTransactions.filter((tx) => {
				const category = this.getTransactionCategory(tx);
				return filters.categories!.includes(category);
			});
		}

		if (filters?.minAmount !== undefined) {
			filteredTransactions = filteredTransactions.filter(
				(tx) => Math.abs(tx.amount) >= filters.minAmount!
			);
		}

		if (filters?.maxAmount !== undefined) {
			filteredTransactions = filteredTransactions.filter(
				(tx) => Math.abs(tx.amount) <= filters.maxAmount!
			);
		}

		// Transform transactions
		const transactions = filteredTransactions.map((tx) =>
			isAdmin
				? this.toAdminTransaction(tx, requestingUser)
				: this.toAuthenticatedTransaction(tx, requestingUser)
		);

		const summary = this.calculateTransactionSummary(transactions, requestingUser?.id);

		return { transactions, summary };
	}

	/**
	 * Transform crypto wallet data for public consumption
	 * Never exposes wallet addresses publicly
	 */
	static toPublicCryptoWallet(dbCryptoWallet: any): PublicCryptoWallet {
		if (!dbCryptoWallet) {
			throw new Error('Invalid crypto wallet data provided to transformer');
		}

		return {
			id: dbCryptoWallet.id as CryptoWalletId,
			coinSymbol: dbCryptoWallet.coinSymbol,
			chain: dbCryptoWallet.chain
			// Address is NEVER exposed in public view for security
		};
	}

	/**
	 * Transform crypto wallet data for authenticated user (owner only)
	 * Shows CCPayment wallet address only to the owner for security
	 */
	static async toAuthenticatedCryptoWallet(
		dbCryptoWallet: any,
		requestingUser: any
	): Promise<AuthenticatedCryptoWallet> {
		const publicData = this.toPublicCryptoWallet(dbCryptoWallet);

		// Security check: only show CCPayment address to wallet owner
		if (dbCryptoWallet.userId !== requestingUser?.id) {
			throw new Error('Unauthorized access to CCPayment wallet address');
		}

		// Get enhanced token information from CCPayment
		const tokenInfo: any = undefined;
		const currentPrice: any = undefined;
		const withdrawFee: any = undefined;

		try {
			// CCPayment integration temporarily disabled
			logger.warn('CCPayment token service integration disabled');
		} catch (error) {
			// Fallback to basic data if CCPayment API fails
			logger.warn('Failed to fetch enhanced token data:', error);
		}

		return {
			...publicData,
			address: dbCryptoWallet.address, // CCPayment-generated deposit address (owner only)
			memo: dbCryptoWallet.memo || undefined, // Required for some chains (TRX, XRP)
			qrCodeUrl: this.generateQRCodeUrl(dbCryptoWallet.address, dbCryptoWallet.memo), // Generate QR for deposits

			// CCPayment integration data
			balance: this.formatCryptoBalance(dbCryptoWallet.balance || '0'),
			frozenBalance: this.formatCryptoBalance(dbCryptoWallet.frozenBalance || '0'),

			// Enhanced token information
			tokenInfo: tokenInfo
				? {
						logoUrl: tokenInfo.logoUrl,
						coinFullName: tokenInfo.coinFullName,
						status: tokenInfo.status,
						precision: tokenInfo.networks?.[dbCryptoWallet.chain]?.precision || 18
					}
				: undefined,

			// Current market price
			marketPrice: currentPrice ? currentPrice[dbCryptoWallet.coinId] : undefined,

			// USD value of balance
			balanceUsdValue: this.calculateCryptoUsdValue(
				dbCryptoWallet.balance || '0',
				currentPrice ? currentPrice[dbCryptoWallet.coinId] : undefined
			),

			// CCPayment permissions
			permissions: {
				canReceive: this.canReceiveToCCPaymentWallet(dbCryptoWallet, requestingUser),
				canGenerateNew: this.canGenerateNewCCPaymentWallet(requestingUser),
				canWithdraw: this.canWithdrawFromCCPayment(dbCryptoWallet, requestingUser),
				canSwap: this.canSwapCCPayment(requestingUser)
			},

			// Enhanced limits from CCPayment
			limits: {
				minDeposit:
					tokenInfo?.networks?.[dbCryptoWallet.chain]?.minimumDepositAmount ||
					dbCryptoWallet.minDepositAmount ||
					'0',
				minWithdraw:
					tokenInfo?.networks?.[dbCryptoWallet.chain]?.minimumWithdrawAmount ||
					dbCryptoWallet.minWithdrawAmount ||
					'0',
				maxWithdraw: tokenInfo?.networks?.[dbCryptoWallet.chain]?.maximumWithdrawAmount || '0',
				withdrawFee: withdrawFee?.amount || dbCryptoWallet.withdrawFee || '0'
			}
		};
	}

	/**
	 * Transform crypto wallet data for admin view
	 * Includes all CCPayment system data and tracking information
	 */
	static async toAdminCryptoWallet(dbCryptoWallet: any): Promise<AdminCryptoWallet> {
		const authenticatedData = await this.toAuthenticatedCryptoWallet(dbCryptoWallet, {
			role: 'admin',
			id: dbCryptoWallet.userId
		});

		return {
			...authenticatedData,
			// CCPayment-specific admin data
			ccpaymentUserId: dbCryptoWallet.ccpaymentUserId || undefined,
			coinId: dbCryptoWallet.coinId,

			// Blockchain/CCPayment tracking
			createdAt: dbCryptoWallet.createdAt,
			totalReceived: this.calculateTotalReceived(dbCryptoWallet),
			totalWithdrawn: this.calculateTotalWithdrawn(dbCryptoWallet),
			transactionCount: this.getTransactionCount(dbCryptoWallet),
			lastUsed: this.getLastUsedDate(dbCryptoWallet),

			// CCPayment webhook data
			lastDepositAt: dbCryptoWallet.lastDepositAt || undefined,
			lastWithdrawalAt: dbCryptoWallet.lastWithdrawalAt || undefined,

			// Admin monitoring
			riskScore: this.calculateCryptoRiskScore(dbCryptoWallet),
			flaggedTransactions: this.countFlaggedCryptoTransactions(dbCryptoWallet),

			// Enhanced admin data
			networkStatus: authenticatedData.tokenInfo?.status || 'Unknown',
			ccpaymentStatus: this.getCCPaymentWalletStatus(dbCryptoWallet),

			// System status
			isActive: dbCryptoWallet.isActive !== false,
			isFrozen: dbCryptoWallet.isFrozen === true
		};
	}

	/**
	 * Batch transform wallets based on user permissions
	 */
	static toWalletList(
		dbWallets: any[],
		requestingUser: any,
		view: 'public' | 'authenticated' | 'admin' = 'public'
	): (PublicWallet | AuthenticatedWallet | AdminWallet)[] {
		return dbWallets.map((wallet) => {
			switch (view) {
				case 'authenticated':
					return this.toAuthenticatedWallet(wallet, requestingUser);
				case 'admin':
					return this.toAdminWallet(wallet);
				default:
					return this.toPublicWallet(wallet);
			}
		});
	}

	/**
	 * Batch transform transactions based on user permissions
	 */
	static toTransactionList(
		dbTransactions: any[],
		requestingUser: any,
		view: 'public' | 'authenticated' | 'admin' = 'public'
	): (PublicTransaction | AuthenticatedTransaction | AdminTransaction)[] {
		return dbTransactions.map((transaction) => {
			switch (view) {
				case 'authenticated':
					return this.toAuthenticatedTransaction(transaction, requestingUser);
				case 'admin':
					return this.toAdminTransaction(transaction, requestingUser);
				default:
					return this.toPublicTransaction(transaction);
			}
		});
	}

	// Private utility methods for calculations and security

	private static sanitizeDgtAmount(amount: number): DgtAmount {
		// Round to 6 decimal places for DGT
		return (Math.round(amount * 1000000) / 1000000) as DgtAmount;
	}

	private static calculateLevel(xp: number): number {
		if (xp < 0) return 1;
		return Math.floor(xp / 100) + 1;
	}

	private static shouldShowPublicStats(user: any): boolean {
		return user?.privacySettings?.showWalletStats !== false;
	}

	private static calculateUsdValue(dgtAmount: number): UsdAmount {
		// Get current DGT->USD rate from multiple sources with fallback
		const envRate = process.env.DGT_USD_RATE ? parseFloat(process.env.DGT_USD_RATE) : null;
		const configRate = 0.01; // Default fallback rate

		// Use environment rate if valid, otherwise fallback
		const currentRate = envRate && envRate > 0 && envRate < 100 ? envRate : configRate;

		// Round to 4 decimal places for USD
		return (Math.round(dgtAmount * currentRate * 10000) / 10000) as UsdAmount;
	}

	private static calculateTotalEarned(transactions: any[]): DgtAmount {
		if (!transactions) return 0 as DgtAmount;
		return transactions
			.filter((tx) => tx.direction === 'in' && tx.status === 'confirmed')
			.reduce((total, tx) => total + tx.amount, 0) as DgtAmount;
	}

	private static calculateTotalSpent(transactions: any[]): DgtAmount {
		if (!transactions) return 0 as DgtAmount;
		return transactions
			.filter((tx) => tx.direction === 'out' && tx.status === 'confirmed')
			.reduce((total, tx) => total + tx.amount, 0) as DgtAmount;
	}

	private static calculateTotalTips(transactions: any[]): DgtAmount {
		if (!transactions) return 0 as DgtAmount;
		return transactions
			.filter((tx) => tx.type === 'TIP' && tx.status === 'confirmed')
			.reduce((total, tx) => total + tx.amount, 0) as DgtAmount;
	}

	private static calculateTotalRain(transactions: any[]): DgtAmount {
		if (!transactions) return 0 as DgtAmount;
		return transactions
			.filter((tx) => tx.type === 'RAIN' && tx.status === 'confirmed')
			.reduce((total, tx) => total + tx.amount, 0) as DgtAmount;
	}

	private static calculateTotalWithdrawals(transactions: any[]): DgtAmount {
		if (!transactions) return 0 as DgtAmount;
		return transactions
			.filter((tx) => tx.type === 'WITHDRAWAL' && tx.status === 'confirmed')
			.reduce((total, tx) => total + tx.amount, 0) as DgtAmount;
	}

	private static calculateTotalDeposits(transactions: any[]): DgtAmount {
		if (!transactions) return 0 as DgtAmount;
		return transactions
			.filter((tx) => tx.type === 'DEPOSIT' && tx.status === 'confirmed')
			.reduce((total, tx) => total + tx.amount, 0) as DgtAmount;
	}

	private static calculateWeeklyEarnings(transactions: any[]): DgtAmount {
		if (!transactions) return 0 as DgtAmount;
		const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		return transactions
			.filter(
				(tx) =>
					tx.direction === 'in' && tx.status === 'confirmed' && new Date(tx.createdAt) > weekAgo
			)
			.reduce((total, tx) => total + tx.amount, 0) as DgtAmount;
	}

	private static calculateMonthlyEarnings(transactions: any[]): DgtAmount {
		if (!transactions) return 0 as DgtAmount;
		const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		return transactions
			.filter(
				(tx) =>
					tx.direction === 'in' && tx.status === 'confirmed' && new Date(tx.createdAt) > monthAgo
			)
			.reduce((total, tx) => total + tx.amount, 0) as DgtAmount;
	}

	private static calculateWalletPermissions(dbWallet: any, user: any) {
		const isOwner = dbWallet.userId === user?.id;
		const isAdmin = this.isAdmin(user);
		const userLevel = this.calculateLevel(user?.xp || 0);

		return {
			canTip: isOwner && userLevel >= 2,
			canWithdraw: isOwner && user?.kycVerified === true,
			canDeposit: isOwner,
			canTransfer: (isOwner && userLevel >= 5) || isAdmin
		};
	}

	private static getDailyTipLimit(user: any): DgtAmount {
		const level = this.calculateLevel(user?.xp || 0);
		// Tip limit increases with level
		return Math.min(1000, level * 100) as DgtAmount;
	}

	private static getDailyWithdrawalLimit(user: any): UsdAmount {
		if (!user?.kycVerified) return 0 as UsdAmount;
		return user?.withdrawalLimit || (1000 as UsdAmount);
	}

	private static getRemainingDailyTips(dbWallet: any, user: any): DgtAmount {
		const dailyLimit = this.getDailyTipLimit(user);
		const todaysTips = this.getTodaysTips(dbWallet.transactions);
		return Math.max(0, dailyLimit - todaysTips) as DgtAmount;
	}

	private static getRemainingDailyWithdrawals(dbWallet: any, user: any): UsdAmount {
		const dailyLimit = this.getDailyWithdrawalLimit(user);
		const todaysWithdrawals = this.getTodaysWithdrawals(dbWallet.transactions);
		return Math.max(0, dailyLimit - todaysWithdrawals) as UsdAmount;
	}

	private static getTodaysTips(transactions: any[]): DgtAmount {
		if (!transactions) return 0 as DgtAmount;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return transactions
			.filter(
				(tx) => tx.type === 'TIP' && tx.direction === 'out' && new Date(tx.createdAt) >= today
			)
			.reduce((total, tx) => total + tx.amount, 0) as DgtAmount;
	}

	private static getTodaysWithdrawals(transactions: any[]): UsdAmount {
		if (!transactions) return 0 as UsdAmount;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return transactions
			.filter((tx) => tx.type === 'WITHDRAWAL' && new Date(tx.createdAt) >= today)
			.reduce((total, tx) => total + (tx.usdAmount || 0), 0) as UsdAmount;
	}

	private static getDisplayType(type: string): string {
		const displayMap: Record<string, string> = {
			TIP: 'Tip',
			RAIN: 'Rain',
			DEPOSIT: 'Deposit',
			WITHDRAWAL: 'Withdrawal',
			SHOP_PURCHASE: 'Purchase',
			ADMIN_ADJUST: 'Adjustment',
			AIRDROP: 'Airdrop',
			REWARD: 'Reward',
			REFERRAL_BONUS: 'Referral',
			FEE: 'Fee'
		};
		return displayMap[type] || type;
	}

	private static getTransactionDirection(dbTransaction: any): 'in' | 'out' {
		// This logic depends on how transactions are structured
		// Typically, positive amounts are 'in', negative are 'out'
		return dbTransaction.amount > 0 ? 'in' : 'out';
	}

	private static getPublicRelatedUser(dbTransaction: any): any {
		if (!dbTransaction.relatedUser) return undefined;

		return {
			id: dbTransaction.relatedUser.id,
			username: dbTransaction.relatedUser.username,
			avatarUrl: dbTransaction.relatedUser.avatarUrl
		};
	}

	private static filterMetadataForUser(metadata: any, user: any): Record<string, any> {
		if (!metadata) return {};

		// Filter sensitive metadata fields for non-admin users
		if (!this.isAdmin(user)) {
			const { ipAddress, internalNotes, systemFlags, ...safeMetadata } = metadata;
			return safeMetadata;
		}

		return metadata;
	}

	private static calculateTransactionUsdValue(dbTransaction: any): UsdAmount | undefined {
		if (!dbTransaction.amount) return undefined;

		// Use transaction-specific rate if available, otherwise current rate
		const transactionRate = dbTransaction.exchangeRate;
		const currentRate = this.getCurrentDgtUsdRate();

		const rate = transactionRate || currentRate;
		return (Math.round(dbTransaction.amount * rate * 10000) / 10000) as UsdAmount;
	}

	private static getCurrentDgtUsdRate(): number {
		const envRate = process.env.DGT_USD_RATE ? parseFloat(process.env.DGT_USD_RATE) : null;
		return envRate && envRate > 0 && envRate < 100 ? envRate : 0.01;
	}

	private static calculateTransactionFee(dbTransaction: any): DgtAmount {
		return dbTransaction.fee || (0 as DgtAmount);
	}

	private static calculateNetAmount(dbTransaction: any): DgtAmount {
		const fee = this.calculateTransactionFee(dbTransaction);
		return (dbTransaction.amount - fee) as DgtAmount;
	}

	private static hashIP(ip: string): string {
		if (!ip) return '';
		return createHash('sha256')
			.update(ip + process.env.IP_SALT || 'default-salt')
			.digest('hex');
	}

	private static isAdmin(user: any): boolean {
		return user && (user.role === 'admin' || user.role === 'owner');
	}

	// Admin calculation methods
	private static calculateTotalVolume(transactions: any[]): UsdAmount {
		if (!transactions) return 0 as UsdAmount;
		return transactions
			.filter((tx) => tx.status === 'confirmed')
			.reduce((total, tx) => total + (tx.usdAmount || 0), 0) as UsdAmount;
	}

	private static countFlaggedTransactions(transactions: any[]): number {
		if (!transactions) return 0;
		return transactions.filter((tx) => tx.flagged === true).length;
	}

	private static calculateRiskScore(dbWallet: any): number {
		// Simple risk scoring based on transaction patterns
		let score = 0;

		const balance = dbWallet.balance || 0;
		const transactionCount = dbWallet.transactions?.length || 0;

		if (balance > 100000) score += 2; // Large balance
		if (transactionCount > 1000) score += 2; // High activity
		// Add more risk factors as needed

		return Math.min(10, score);
	}

	private static getLastLargeTransaction(transactions: any[]): Date | undefined {
		if (!transactions) return undefined;

		const largeTransactions = transactions
			.filter((tx) => tx.amount > 10000 && tx.status === 'confirmed')
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return largeTransactions[0]?.createdAt;
	}

	private static detectSuspiciousActivity(dbWallet: any): boolean {
		// Simple suspicious activity detection
		const riskScore = this.calculateRiskScore(dbWallet);
		const flaggedCount = this.countFlaggedTransactions(dbWallet.transactions);

		return riskScore > 7 || flaggedCount > 5;
	}

	// CCPayment crypto wallet specific methods
	private static canReceiveToCCPaymentWallet(dbCryptoWallet: any, user: any): boolean {
		// Check if user owns the wallet and has CCPayment account initialized
		return dbCryptoWallet.userId === user?.id && !!user?.ccpaymentUserId;
	}

	private static canGenerateNewCCPaymentWallet(user: any): boolean {
		// Users can generate wallets if they have CCPayment account and meet level requirements
		return user?.level >= 2 && !!user?.ccpaymentUserId;
	}

	// CCPayment crypto wallet utility methods
	private static formatCryptoBalance(balance: string): string {
		// Format crypto balance with proper decimal places
		const num = parseFloat(balance);
		return isNaN(num) ? '0' : num.toString();
	}

	private static generateQRCodeUrl(address: string, memo?: string): string | undefined {
		if (!address) return undefined;

		// Generate QR code URL for crypto deposits
		const qrData = memo ? `${address}?memo=${memo}` : address;
		return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
	}

	private static canWithdrawFromCCPayment(dbCryptoWallet: any, user: any): boolean {
		return (
			dbCryptoWallet.userId === user?.id &&
			!!user?.ccpaymentUserId &&
			user?.kycVerified === true &&
			!dbCryptoWallet.isFrozen
		);
	}

	private static canSwapCCPayment(user: any): boolean {
		return !!user?.ccpaymentUserId && user?.level >= 3;
	}

	private static calculateTotalReceived(dbCryptoWallet: any): string {
		// Total received from CCPayment deposit records
		return dbCryptoWallet.totalReceived || '0';
	}

	private static calculateTotalWithdrawn(dbCryptoWallet: any): string {
		// Total withdrawn from CCPayment withdrawal records
		return dbCryptoWallet.totalWithdrawn || '0';
	}

	private static getTransactionCount(dbCryptoWallet: any): number {
		return (dbCryptoWallet.depositCount || 0) + (dbCryptoWallet.withdrawalCount || 0);
	}

	private static getLastUsedDate(dbCryptoWallet: any): Date | undefined {
		const lastDeposit = dbCryptoWallet.lastDepositAt;
		const lastWithdrawal = dbCryptoWallet.lastWithdrawalAt;

		if (!lastDeposit && !lastWithdrawal) return undefined;
		if (!lastDeposit) return new Date(lastWithdrawal);
		if (!lastWithdrawal) return new Date(lastDeposit);

		return new Date(Math.max(new Date(lastDeposit).getTime(), new Date(lastWithdrawal).getTime()));
	}

	private static calculateCryptoRiskScore(dbCryptoWallet: any): number {
		let score = 0;

		const totalReceived = parseFloat(dbCryptoWallet.totalReceived || '0');
		const totalWithdrawn = parseFloat(dbCryptoWallet.totalWithdrawn || '0');
		const transactionCount = this.getTransactionCount(dbCryptoWallet);

		// High volume activity
		if (totalReceived > 10000) score += 2;
		if (totalWithdrawn > 10000) score += 2;

		// High frequency activity
		if (transactionCount > 100) score += 1;

		// Suspicious patterns
		if (dbCryptoWallet.flaggedTransactions > 0) score += 3;

		return Math.min(10, score);
	}

	private static countFlaggedCryptoTransactions(dbCryptoWallet: any): number {
		return dbCryptoWallet.flaggedTransactions || 0;
	}

	private static calculateCryptoUsdValue(balance: string, usdtPrice?: string): string {
		if (!usdtPrice || !balance) return '0';

		try {
			const balanceNum = parseFloat(balance);
			const priceNum = parseFloat(usdtPrice);

			if (isNaN(balanceNum) || isNaN(priceNum)) return '0';

			const usdValue = balanceNum * priceNum;
			return usdValue.toFixed(4);
		} catch (error) {
			return '0';
		}
	}

	private static getCCPaymentWalletStatus(
		dbCryptoWallet: any
	): 'active' | 'inactive' | 'frozen' | 'maintenance' {
		if (dbCryptoWallet.isFrozen) return 'frozen';
		if (!dbCryptoWallet.isActive) return 'inactive';
		if (dbCryptoWallet.underMaintenance) return 'maintenance';
		return 'active';
	}

	// Transaction source normalization and audit trail methods
	private static normalizeTransactionSource(rawSource: string): string {
		const sourceMap: Record<string, string> = {
			TIP: 'user_tip',
			RAIN: 'community_rain',
			DEPOSIT: 'crypto_deposit',
			WITHDRAWAL: 'crypto_withdrawal',
			SHOP_PURCHASE: 'shop_purchase',
			ADMIN_ADJUST: 'admin_adjustment',
			AIRDROP: 'promotional_airdrop',
			REWARD: 'system_reward',
			REFERRAL_BONUS: 'referral_program',
			FEE: 'service_fee',
			INTERNAL_TRANSFER: 'internal_transfer',
			CCPAYMENT_DEPOSIT: 'external_deposit',
			CCPAYMENT_WITHDRAWAL: 'external_withdrawal'
		};

		return sourceMap[rawSource?.toUpperCase()] || 'unknown_source';
	}

	private static getAnonymizedIP(ipAddress?: string): string | undefined {
		if (!ipAddress) return undefined;

		// Anonymize IP for GDPR compliance - keep first 3 octets for IPv4, first 4 groups for IPv6
		if (ipAddress.includes(':')) {
			// IPv6
			const parts = ipAddress.split(':');
			return parts.slice(0, 4).join(':') + '::****';
		} else {
			// IPv4
			const parts = ipAddress.split('.');
			return parts.slice(0, 3).join('.') + '.***';
		}
	}

	private static getVerificationStatus(dbTransaction: any): 'verified' | 'pending' | 'flagged' {
		if (dbTransaction.flagged) return 'flagged';
		if (dbTransaction.status === 'confirmed') return 'verified';
		return 'pending';
	}

	private static calculateTransactionRiskLevel(dbTransaction: any): 'low' | 'medium' | 'high' {
		let riskScore = 0;

		// Large amounts increase risk
		if (dbTransaction.amount > 10000) riskScore += 2;
		else if (dbTransaction.amount > 1000) riskScore += 1;

		// Certain transaction types are higher risk
		const highRiskTypes = ['WITHDRAWAL', 'ADMIN_ADJUST'];
		if (highRiskTypes.includes(dbTransaction.type)) riskScore += 1;

		// Flagged transactions are high risk
		if (dbTransaction.flagged) riskScore += 3;

		// Time-based risk (very recent transactions)
		const transactionAge = Date.now() - new Date(dbTransaction.createdAt).getTime();
		if (transactionAge < 60000) riskScore += 1; // Less than 1 minute old

		if (riskScore >= 4) return 'high';
		if (riskScore >= 2) return 'medium';
		return 'low';
	}

	private static getRecentAccessLog(
		dbWallet: any
	): Array<{ timestamp: string; action: string; ip?: string }> {
		// Return recent access events (would come from audit log table)
		return dbWallet.recentAccess || [];
	}

	private static getComplianceHistory(
		dbWallet: any
	): Array<{ timestamp: string; event: string; details?: string }> {
		// Return compliance-related events (would come from compliance log table)
		return dbWallet.complianceEvents || [];
	}

	// Transaction History utility methods
	private static normalizeTransactionTypeForHistory(type: string): string {
		const typeMap: Record<string, string> = {
			TIP: 'tip',
			RAIN: 'rain',
			DEPOSIT: 'deposit',
			WITHDRAWAL: 'withdrawal',
			SHOP_PURCHASE: 'purchase',
			ADMIN_ADJUST: 'adjustment',
			AIRDROP: 'airdrop',
			REWARD: 'reward',
			REFERRAL_BONUS: 'referral',
			FEE: 'fee',
			REFUND: 'refund',
			INTERNAL_TRANSFER: 'transfer'
		};

		return typeMap[type?.toUpperCase()] || type?.toLowerCase() || 'unknown';
	}

	private static getTransactionDirection(
		dbTransaction: any,
		userId?: any
	): 'incoming' | 'outgoing' | 'internal' {
		if (!userId) return 'internal';

		if (dbTransaction.fromUserId === userId) {
			return dbTransaction.toUserId === userId ? 'internal' : 'outgoing';
		} else if (dbTransaction.toUserId === userId) {
			return 'incoming';
		}

		return 'internal';
	}

	private static getTransactionCounterparty(
		dbTransaction: any,
		userId?: any
	): { type: string; name: string; id?: string } | undefined {
		const direction = this.getTransactionDirection(dbTransaction, userId);

		if (direction === 'internal') {
			return { type: 'system', name: 'System' };
		}

		if (direction === 'outgoing' && dbTransaction.toUserId) {
			return {
				type: 'user',
				name: dbTransaction.toUsername || 'Unknown User',
				id: dbTransaction.toUserId
			};
		}

		if (direction === 'incoming' && dbTransaction.fromUserId) {
			return {
				type: 'user',
				name: dbTransaction.fromUsername || 'Unknown User',
				id: dbTransaction.fromUserId
			};
		}

		// Check for system/shop transactions
		if (dbTransaction.type?.includes('SHOP')) {
			return { type: 'shop', name: 'DegenTalk Shop' };
		}

		if (dbTransaction.type?.includes('ADMIN')) {
			return { type: 'admin', name: 'Administration' };
		}

		return { type: 'system', name: 'System' };
	}

	private static sanitizeDescription(description?: string): string {
		if (!description) return 'Transaction';

		// Truncate long descriptions
		if (description.length > 100) {
			return description.substring(0, 97) + '...';
		}

		return description;
	}

	private static getTransactionStatus(
		dbTransaction: any
	): 'pending' | 'confirmed' | 'failed' | 'cancelled' {
		if (dbTransaction.status === 'confirmed') return 'confirmed';
		if (dbTransaction.status === 'failed') return 'failed';
		if (dbTransaction.status === 'cancelled') return 'cancelled';
		return 'pending';
	}

	private static getTransactionCategory(dbTransaction: any): string {
		const type = this.normalizeTransactionTypeForHistory(dbTransaction.type);

		const categoryMap: Record<string, string> = {
			tip: 'social',
			rain: 'social',
			purchase: 'shopping',
			deposit: 'wallet',
			withdrawal: 'wallet',
			transfer: 'wallet',
			reward: 'earning',
			airdrop: 'earning',
			referral: 'earning',
			fee: 'system',
			adjustment: 'system',
			refund: 'system'
		};

		return categoryMap[type] || 'other';
	}

	private static isTransactionReversible(dbTransaction: any): boolean {
		// Most transactions are not reversible after confirmation
		if (dbTransaction.status === 'confirmed') {
			// Only certain types can be reversed by admin
			const reversibleTypes = ['ADMIN_ADJUST', 'REFUND'];
			return reversibleTypes.includes(dbTransaction.type);
		}

		// Pending transactions can usually be cancelled
		return dbTransaction.status === 'pending';
	}

	private static isInternalTransaction(dbTransaction: any): boolean {
		// Internal transactions don't touch external blockchain
		const internalTypes = ['TIP', 'RAIN', 'SHOP_PURCHASE', 'INTERNAL_TRANSFER', 'ADMIN_ADJUST'];
		return internalTypes.includes(dbTransaction.type);
	}

	private static requiresConfirmation(dbTransaction: any): boolean {
		// External transactions require blockchain confirmations
		const externalTypes = ['DEPOSIT', 'WITHDRAWAL'];
		return externalTypes.includes(dbTransaction.type);
	}

	private static calculateTransactionSummary(
		transactions: any[],
		userId?: any
	): {
		totalIn: DgtAmount;
		totalOut: DgtAmount;
		netChange: DgtAmount;
		transactionCount: number;
		categoryBreakdown: Record<string, { count: number; amount: DgtAmount }>;
	} {
		let totalIn = 0 as DgtAmount;
		let totalOut = 0 as DgtAmount;
		const categoryBreakdown: Record<string, { count: number; amount: DgtAmount }> = {};

		for (const tx of transactions) {
			// Add to category breakdown
			if (!categoryBreakdown[tx.context.category]) {
				categoryBreakdown[tx.context.category] = { count: 0, amount: 0 as DgtAmount };
			}
			categoryBreakdown[tx.context.category].count++;
			categoryBreakdown[tx.context.category].amount = (categoryBreakdown[tx.context.category]
				.amount + Math.abs(tx.amount)) as DgtAmount;

			// Calculate in/out totals based on direction
			if (tx.direction === 'incoming') {
				totalIn = (totalIn + tx.amount) as DgtAmount;
			} else if (tx.direction === 'outgoing') {
				totalOut = (totalOut + Math.abs(tx.amount)) as DgtAmount;
			}
		}

		const netChange = (totalIn - totalOut) as DgtAmount;

		return {
			totalIn,
			totalOut,
			netChange,
			transactionCount: transactions.length,
			categoryBreakdown
		};
	}
}

// Export convenience methods
export const {
	toPublicWallet,
	toAuthenticatedWallet,
	toAdminWallet,
	toPublicTransaction,
	toAuthenticatedTransaction,
	toAdminTransaction
} = WalletTransformer;
