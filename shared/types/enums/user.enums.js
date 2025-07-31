/**
 * User Role Enums
 * Shared across client/server/db layers
 */
export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["MODERATOR"] = "moderator";
    UserRole["DEV"] = "dev";
    UserRole["SHOUTBOX_MOD"] = "shoutbox_mod";
    UserRole["CONTENT_MOD"] = "content_mod";
    UserRole["MARKET_MOD"] = "market_mod";
})(UserRole || (UserRole = {}));
