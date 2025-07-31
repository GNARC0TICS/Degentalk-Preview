/**
 * Economy Transaction Enums
 * Shared across client/server/db layers
 */
export var TransactionType;
(function (TransactionType) {
    TransactionType["TIP"] = "TIP";
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["ADMIN_ADJUST"] = "ADMIN_ADJUST";
    TransactionType["RAIN"] = "RAIN";
    TransactionType["AIRDROP"] = "AIRDROP";
    TransactionType["SHOP_PURCHASE"] = "SHOP_PURCHASE";
    TransactionType["REWARD"] = "REWARD";
    TransactionType["REFERRAL_BONUS"] = "REFERRAL_BONUS";
    TransactionType["FEE"] = "FEE";
    TransactionType["VAULT_LOCK"] = "VAULT_LOCK";
    TransactionType["VAULT_UNLOCK"] = "VAULT_UNLOCK";
})(TransactionType || (TransactionType = {}));
export var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["CONFIRMED"] = "confirmed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["REVERSED"] = "reversed";
    TransactionStatus["DISPUTED"] = "disputed";
})(TransactionStatus || (TransactionStatus = {}));
