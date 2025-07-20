/**
 * Transform wallet balance to public DTO
 */
export function toPublicWalletBalance(balance) {
    return {
        dgtBalance: balance.dgtBalance,
        cryptoBalances: balance.cryptoBalances.map(toPublicCryptoBalance),
        lastUpdated: balance.lastUpdated
    };
}
/**
 * Transform crypto balance to public DTO
 */
export function toPublicCryptoBalance(balance) {
    return {
        coinSymbol: balance.coinSymbol,
        chain: balance.chain,
        balance: balance.balance,
        usdValue: balance.usdValue,
        available: balance.available
    };
}
/**
 * Transform transaction to public DTO
 */
export function toPublicTransaction(transaction) {
    return {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
    };
}
/**
 * Transform transaction to authenticated DTO
 */
export function toAuthenticatedTransaction(transaction) {
    return {
        ...toPublicTransaction(transaction),
        metadata: transaction.metadata
    };
}
/**
 * Transform purchase order to public DTO
 */
export function toPublicPurchaseOrder(order) {
    const { userId: _UserId, ...publicOrder } = order;
    return publicOrder;
}
/**
 * Transform deposit address (no transformation needed - already safe)
 */
export function toPublicDepositAddress(address) {
    return address;
}
/**
 * Transform withdrawal response (no transformation needed - already safe)
 */
export function toPublicWithdrawalResponse(response) {
    return response;
}
/**
 * Transform wallet config (no transformation needed - already public)
 */
export function toPublicWalletConfig(config) {
    return config;
}
/**
 * CCPayment-specific transformers
 */
/**
 * Transform CCPayment balance response to CryptoBalance
 */
export function fromCCPaymentBalance(ccBalance) {
    return {
        coinId: ccBalance.coinId,
        coinSymbol: ccBalance.coinSymbol,
        chain: ccBalance.chain,
        balance: ccBalance.balance,
        usdValue: ccBalance.usdValue,
        available: ccBalance.available,
        frozen: ccBalance.frozen,
        lastUpdated: new Date().toISOString()
    };
}
/**
 * Transform CCPayment deposit address to DepositAddress
 */
export function fromCCPaymentDepositAddress(ccAddress) {
    return {
        coinSymbol: ccAddress.coinSymbol,
        chain: ccAddress.chain,
        address: ccAddress.address,
        memo: ccAddress.memo,
        qrCode: ccAddress.qrCode
    };
}
export function fromDbCryptoWallet(wallet) {
    return {
        address: wallet.address,
        memo: wallet.memo || undefined,
        qrCode: wallet.qrCodeUrl || undefined,
        coinSymbol: wallet.coinSymbol,
        chain: wallet.chain
    };
}
/**
 * Transform CCPayment token info to SupportedCoin
 */
export function fromCCPaymentTokenInfo(token, price) {
    const networks = Object.values(token.networks || {}).map((net) => ({
        network: net.chain,
        chain: net.chain,
        displayName: net.chainFullName,
        canDeposit: net.canDeposit,
        canWithdraw: net.canWithdraw,
        minDepositAmount: net.minimumDepositAmount,
        minWithdrawAmount: net.minimumWithdrawAmount,
        fee: '0' // Fee is not part of this response, would need another call
    }));
    let status = 'online';
    if (token.status === 'Maintain') {
        status = 'maintenance';
    }
    else if (token.status === 'Pre-delisting' || token.status === 'Delisted') {
        status = 'degraded';
    }
    const coin = {
        id: token.symbol.toLowerCase(),
        name: token.coinFullName,
        symbol: token.symbol,
        logoUrl: token.logoUrl,
        status,
        isDegraded: status !== 'online',
        networks,
        currentPrice: price || '0',
        priceLastUpdated: price ? new Date().toISOString() : undefined
    };
    return coin;
}
export function toPublicSupportedCoin(coin) {
    return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        logoUrl: coin.logoUrl,
        status: coin.status,
        networks: coin.networks.map((net) => ({
            network: net.network,
            displayName: net.displayName,
            canDeposit: net.canDeposit,
            canWithdraw: net.canWithdraw
        }))
    };
}
export function toPublicWithdrawFeeInfo(feeInfo) {
    const { coinId: _coinId, ...publicFeeInfo } = feeInfo;
    return publicFeeInfo;
}
/**
 * Utility function to safely extract user-specific data
 */
export function extractUserData(data, requestingUserId) {
    if (data.userId !== requestingUserId) {
        throw new Error('Unauthorized access to user data');
    }
    const { userId: _UserId, ...userData } = data;
    return userData;
}
export function toPaginatedResponse(data, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
}
