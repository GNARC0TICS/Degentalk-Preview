"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = exports.pool = exports.db = void 0;
var serverless_1 = require("@neondatabase/serverless");
var neon_serverless_1 = require("drizzle-orm/neon-serverless");
var better_sqlite3_1 = require("drizzle-orm/better-sqlite3");
var better_sqlite3_2 = require("better-sqlite3");
var ws_1 = require("ws");
var schema = require("@shared/schema");
var dotenv_1 = require("dotenv");
var logger_1 = require("./logger");
// Load environment variables from .env file
(0, dotenv_1.config)();
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
var databaseProvider = process.env.DATABASE_PROVIDER || 'postgres'; // Default to postgres
var db; // Use 'any' for now, or create a common Drizzle instance type
var pool; // Pool is only for Neon/Postgres
if (databaseProvider === 'sqlite') {
    var sqliteDb = new better_sqlite3_2.default(process.env.DATABASE_URL.replace('sqlite:///', ''));
    exports.db = db = (0, better_sqlite3_1.drizzle)(sqliteDb, { schema: schema });
    logger_1.logger.info("DATABASE", "Using SQLite database provider.");
}
else if (databaseProvider === 'postgres' || databaseProvider === 'postgresql') {
    // Configure pool with retry settings
    var poolConfig = {
        connectionString: process.env.DATABASE_URL,
        max: 10,
        connectionTimeoutMillis: 10000,
        retryDelay: 1000,
        maxRetries: 3
    };
    exports.pool = pool = new serverless_1.Pool(poolConfig);
    // Add connection error handling
    pool.on('error', function (err) {
        logger_1.logger.error("DATABASE", 'Unexpected error on idle database client', err);
        process.exit(-1);
    });
    exports.db = db = (0, neon_serverless_1.drizzle)(pool, { schema: schema });
    logger_1.logger.info("DATABASE", "Using PostgreSQL (Neon) database provider.");
}
else {
    throw new Error("Unsupported DATABASE_PROVIDER: ".concat(databaseProvider, ". Must be 'sqlite' or 'postgres'."));
}
// Add retry wrapper
var withRetry = function (operation) { return __awaiter(void 0, void 0, void 0, function () {
    var lastError, _loop_1, i, state_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _loop_1 = function (i) {
                    var _b, error_1;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _c.trys.push([0, 2, , 5]);
                                _b = {};
                                return [4 /*yield*/, operation()];
                            case 1: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                            case 2:
                                error_1 = _c.sent();
                                lastError = error_1;
                                if (!(databaseProvider === 'postgres' && error_1.code === '57P01')) return [3 /*break*/, 4];
                                logger_1.logger.warn("DATABASE", "Connection error (attempt ".concat(i + 1, "), retrying..."));
                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000 * (i + 1)); })];
                            case 3:
                                _c.sent();
                                return [2 /*return*/, "continue"];
                            case 4: 
                            // For SQLite or other errors, throw immediately
                            throw error_1;
                            case 5: return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < 3)) return [3 /*break*/, 4];
                return [5 /*yield**/, _loop_1(i)];
            case 2:
                state_1 = _a.sent();
                if (typeof state_1 === "object")
                    return [2 /*return*/, state_1.value];
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4:
                logger_1.logger.error("DATABASE", 'Max retries reached for database operation.', lastError);
                throw lastError;
        }
    });
}); };
exports.withRetry = withRetry;
