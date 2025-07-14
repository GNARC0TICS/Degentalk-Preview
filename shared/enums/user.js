"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoleEnum = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// Canonical user roles used across the entire platform
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', [
    'user',
    'super_admin',
    'admin',
    'moderator',
    'dev',
    'shoutbox_mod',
    'content_mod',
    'market_mod'
]);
