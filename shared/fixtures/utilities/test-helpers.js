"use strict";
/**
 * Test Helper Utilities
 * Convenience functions for testing with realistic Degentalk fixtures
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectValidPost = exports.expectValidThread = exports.expectValidUser = exports.setupQuickScenario = exports.createTestPost = exports.createTestThread = exports.createTestWhale = exports.createTestAdmin = exports.createTestUser = exports.testDataManager = exports.TestDataManager = void 0;
var factory_1 = require("../core/factory");
var scenario_generator_1 = require("./scenario-generator");
// Setup helpers for test environments
var TestDataManager = /** @class */ (function () {
    function TestDataManager() {
        this.cleanupTasks = [];
    }
    TestDataManager.getInstance = function () {
        if (!TestDataManager.instance) {
            TestDataManager.instance = new TestDataManager();
        }
        return TestDataManager.instance;
    };
    // Quick setup methods for common test patterns
    TestDataManager.prototype.setupBasicForum = function () {
        return __awaiter(this, void 0, void 0, function () {
            var users, forum, threads, posts, _i, threads_1, thread, threadPosts;
            return __generator(this, function (_a) {
                users = factory_1.Factory.createMany('user', 5);
                forum = factory_1.Factory.create('forum');
                threads = factory_1.Factory.createMany('thread', 3, {
                    overrides: { forumId: forum.id }
                });
                posts = [];
                for (_i = 0, threads_1 = threads; _i < threads_1.length; _i++) {
                    thread = threads_1[_i];
                    threadPosts = factory_1.Factory.createMany('post', 5, {
                        overrides: { threadId: thread.id }
                    });
                    posts.push.apply(posts, threadPosts);
                }
                return [2 /*return*/, { users: users, forum: forum, threads: threads, posts: posts }];
            });
        });
    };
    TestDataManager.prototype.setupAdminScenario = function () {
        return __awaiter(this, void 0, void 0, function () {
            var admin, moderators, users, adminActions;
            return __generator(this, function (_a) {
                admin = factory_1.Factory.create('admin');
                moderators = factory_1.Factory.createMany('user', 2, {
                    overrides: { role: 'moderator' }
                });
                users = factory_1.Factory.createMany('user', 10);
                adminActions = this.generateAdminActions(admin.id, users);
                return [2 /*return*/, { admin: admin, moderators: moderators, users: users, adminActions: adminActions }];
            });
        });
    };
    TestDataManager.prototype.setupEconomyScenario = function () {
        return __awaiter(this, void 0, void 0, function () {
            var users, whales, transactions, tips;
            return __generator(this, function (_a) {
                users = factory_1.Factory.createMany('user', 15);
                whales = factory_1.Factory.createMany('whale', 3);
                transactions = this.generateTransactions(__spreadArray(__spreadArray([], users, true), whales, true));
                tips = this.generateTips(__spreadArray(__spreadArray([], users, true), whales, true));
                return [2 /*return*/, { users: users, transactions: transactions, tips: tips, whales: whales }];
            });
        });
    };
    // Scenario-based setup
    TestDataManager.prototype.setupScenario = function (scenarioName) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, scenario_generator_1.scenarioGenerator.generateScenario(scenarioName)];
                    case 1:
                        result = _a.sent();
                        // Register cleanup for any database operations
                        this.registerCleanup(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                // Cleanup logic would go here
                                console.log("Cleaning up scenario: ".concat(scenarioName));
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/, result.generatedData];
                }
            });
        });
    };
    // User journey helpers
    TestDataManager.prototype.createUserJourney = function (journeyType) {
        var journeys = {
            newbie: this.createNewbieJourney(),
            trader: this.createTraderJourney(),
            whale: this.createWhaleJourney(),
            admin: this.createAdminJourney()
        };
        return journeys[journeyType];
    };
    TestDataManager.prototype.createNewbieJourney = function () {
        var user = factory_1.Factory.create('user', {
            overrides: {
                xp: 0,
                level: 1,
                dgtWalletBalance: BigInt(1000),
                totalPosts: 0,
                isEmailVerified: false
            }
        });
        var firstThread = factory_1.Factory.create('thread', {
            overrides: {
                userId: user.id,
                title: 'New to crypto - need help!',
                viewCount: 50
            }
        });
        var firstPost = factory_1.Factory.create('post', {
            overrides: {
                userId: user.id,
                threadId: firstThread.id,
                isFirstPost: true,
                content: 'Hi everyone! Complete crypto newbie here. Where do I start?'
            }
        });
        return {
            user: user,
            progression: [
                { step: 'registration', completed: true },
                { step: 'first_post', completed: true },
                { step: 'email_verification', completed: false },
                { step: 'first_like', completed: false }
            ],
            initialContent: { thread: firstThread, post: firstPost }
        };
    };
    TestDataManager.prototype.createTraderJourney = function () {
        var user = factory_1.Factory.create('user', {
            overrides: {
                xp: 5000,
                level: 15,
                dgtWalletBalance: BigInt(50000),
                reputation: 800,
                bio: 'Active crypto trader. TA enthusiast. DYOR always!'
            }
        });
        var tradeThreads = factory_1.Factory.createMany('thread', 3, {
            overrides: { userId: user.id }
        }).map(function (thread, i) { return (__assign(__assign({}, thread), { title: [
                'BTC Technical Analysis - Bullish Triangle',
                'My ETH swing trade setup',
                'Altcoin gems for the next bull run'
            ][i] })); });
        var transactions = Array.from({ length: 20 }, function (_, i) { return ({
            id: Date.now() + i,
            userId: user.id,
            type: ['TRADE', 'DEPOSIT', 'WITHDRAWAL'][Math.floor(Math.random() * 3)],
            amount: Math.floor(Math.random() * 10000) + 1000,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }); });
        return {
            user: user,
            tradingActivity: {
                threads: tradeThreads,
                transactions: transactions,
                winRate: 0.65,
                avgReturn: 0.12
            }
        };
    };
    TestDataManager.prototype.createWhaleJourney = function () {
        var whale = factory_1.Factory.create('whale', {
            overrides: {
                username: 'cryptowhale_og',
                dgtWalletBalance: BigInt(10000000),
                reputation: 9500,
                bio: 'Bitcoin since 2011. DeFi pioneer. Building the future.'
            }
        });
        var whaleTransactions = Array.from({ length: 50 }, function (_, i) { return ({
            id: Date.now() + i,
            userId: whale.id,
            type: ['DEPOSIT', 'TIP', 'RAIN', 'PURCHASE'][Math.floor(Math.random() * 4)],
            amount: Math.floor(Math.random() * 500000) + 50000,
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        }); });
        var whaleTips = Array.from({ length: 25 }, function (_, i) { return ({
            id: Date.now() + i,
            fromUserId: whale.id,
            amount: Math.floor(Math.random() * 10000) + 1000,
            message: 'Keep building! 🚀',
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }); });
        return {
            user: whale,
            wealthActivity: {
                largeTransactions: whaleTransactions,
                communityTips: whaleTips,
                marketInfluence: 'high',
                followers: 1500
            }
        };
    };
    TestDataManager.prototype.createAdminJourney = function () {
        var admin = factory_1.Factory.create('admin', {
            overrides: {
                username: 'admin_alpha',
                reputation: 10000,
                bio: 'Degentalk admin. Building the future of crypto communities.'
            }
        });
        var moderationActions = Array.from({ length: 15 }, function (_, i) { return ({
            id: Date.now() + i,
            adminId: admin.id,
            action: ['warn', 'timeout', 'ban', 'delete_post'][Math.floor(Math.random() * 4)],
            reason: 'Community guidelines violation',
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }); });
        var systemChanges = Array.from({ length: 8 }, function (_, i) { return ({
            id: Date.now() + i,
            adminId: admin.id,
            setting: ['max_daily_tips', 'min_post_length', 'rain_cooldown'][Math.floor(Math.random() * 3)],
            oldValue: '100',
            newValue: '150',
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }); });
        return {
            user: admin,
            adminActivity: {
                moderationActions: moderationActions,
                systemChanges: systemChanges,
                dailyTasks: ['user_management', 'content_moderation', 'system_monitoring']
            }
        };
    };
    // Test data generation helpers
    TestDataManager.prototype.generateRealisticPosts = function (threadId, userIds, count) {
        if (count === void 0) { count = 10; }
        var cryptoPostTemplates = [
            'Just bought the dip! Who else is accumulating?',
            'This pump is insane! Target: {target}',
            'TA update: {coin} looking bullish on the 4H chart',
            'GM crypto family! What are we buying today?',
            'That was a fake breakout. Classic bull trap.',
            'DCA is the way. Been stacking {coin} for months.',
            'Anyone else see this whale transaction? 👀',
            'Bear market is for building. Keep your head up!',
            'This {news} is huge for adoption. Bullish!',
            'REKT: My leveraged trade just got liquidated 😅'
        ];
        return Array.from({ length: count }, function (_, i) {
            var template = cryptoPostTemplates[Math.floor(Math.random() * cryptoPostTemplates.length)];
            var content = template
                .replace('{target}', "$".concat(Math.floor(Math.random() * 100), "k"))
                .replace('{coin}', ['BTC', 'ETH', 'SOL', 'LINK'][Math.floor(Math.random() * 4)])
                .replace('{news}', ['partnership', 'upgrade', 'adoption'][Math.floor(Math.random() * 3)]);
            return factory_1.Factory.create('post', {
                overrides: {
                    threadId: threadId,
                    userId: userIds[Math.floor(Math.random() * userIds.length)],
                    content: content,
                    likeCount: Math.floor(Math.random() * 20)
                }
            });
        });
    };
    TestDataManager.prototype.generateTransactions = function (users) {
        var transactionTypes = ['DEPOSIT', 'WITHDRAWAL', 'TIP', 'RAIN', 'PURCHASE', 'TRADE'];
        return Array.from({ length: 100 }, function (_, i) { return ({
            id: Date.now() + i,
            userId: users[Math.floor(Math.random() * users.length)].id,
            type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
            amount: Math.floor(Math.random() * 50000) + 100,
            status: Math.random() > 0.1 ? 'completed' : 'pending',
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }); });
    };
    TestDataManager.prototype.generateTips = function (users) {
        return Array.from({ length: 30 }, function (_, i) { return ({
            id: Date.now() + i,
            fromUserId: users[Math.floor(Math.random() * users.length)].id,
            toUserId: users[Math.floor(Math.random() * users.length)].id,
            amount: Math.floor(Math.random() * 5000) + 100,
            message: ['Great post!', 'Thanks for sharing!', 'Keep it up!'][Math.floor(Math.random() * 3)],
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }); });
    };
    TestDataManager.prototype.generateAdminActions = function (adminId, users) {
        var actions = ['user_warning', 'post_deletion', 'thread_lock', 'user_timeout', 'ban_user'];
        return Array.from({ length: 10 }, function (_, i) { return ({
            id: Date.now() + i,
            adminId: adminId,
            targetUserId: users[Math.floor(Math.random() * users.length)].id,
            action: actions[Math.floor(Math.random() * actions.length)],
            reason: 'Community guidelines violation',
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }); });
    };
    // Cleanup management
    TestDataManager.prototype.registerCleanup = function (task) {
        this.cleanupTasks.push(task);
    };
    TestDataManager.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, task, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.cleanupTasks;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        task = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, task()];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Cleanup task failed:', error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.cleanupTasks = [];
                        return [2 /*return*/];
                }
            });
        });
    };
    // Performance testing helpers
    TestDataManager.prototype.generateLargeDataset = function (config) {
        var _a = config.users, users = _a === void 0 ? 1000 : _a, _b = config.threads, threads = _b === void 0 ? 500 : _b, _c = config.posts, posts = _c === void 0 ? 5000 : _c, _d = config.transactions, transactions = _d === void 0 ? 10000 : _d;
        console.log("Generating large dataset: ".concat(users, " users, ").concat(threads, " threads, ").concat(posts, " posts, ").concat(transactions, " transactions"));
        var userData = factory_1.Factory.createMany('user', users);
        var threadData = factory_1.Factory.createMany('thread', threads);
        var postData = factory_1.Factory.createMany('post', posts);
        var transactionData = this.generateTransactions(userData);
        return {
            users: userData,
            threads: threadData,
            posts: postData,
            transactions: transactionData.slice(0, transactions),
            summary: {
                totalEntities: users + threads + posts + transactions,
                estimatedMemoryUsage: "".concat(Math.round((users + threads + posts + transactions) * 0.5), "KB")
            }
        };
    };
    return TestDataManager;
}());
exports.TestDataManager = TestDataManager;
// Export singleton instance
exports.testDataManager = TestDataManager.getInstance();
// Convenience functions for quick testing
var createTestUser = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return factory_1.Factory.create('user', { overrides: overrides });
};
exports.createTestUser = createTestUser;
var createTestAdmin = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return factory_1.Factory.create('admin', { overrides: overrides });
};
exports.createTestAdmin = createTestAdmin;
var createTestWhale = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return factory_1.Factory.create('whale', { overrides: overrides });
};
exports.createTestWhale = createTestWhale;
var createTestThread = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return factory_1.Factory.create('thread', { overrides: overrides });
};
exports.createTestThread = createTestThread;
var createTestPost = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return factory_1.Factory.create('post', { overrides: overrides });
};
exports.createTestPost = createTestPost;
// Quick scenario setup for tests
var setupQuickScenario = function (type) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (type) {
            case 'basic':
                return [2 /*return*/, exports.testDataManager.setupBasicForum()];
            case 'admin':
                return [2 /*return*/, exports.testDataManager.setupAdminScenario()];
            case 'economy':
                return [2 /*return*/, exports.testDataManager.setupEconomyScenario()];
            case 'large':
                return [2 /*return*/, exports.testDataManager.generateLargeDataset({})];
            default:
                throw new Error("Unknown scenario type: ".concat(type));
        }
        return [2 /*return*/];
    });
}); };
exports.setupQuickScenario = setupQuickScenario;
// Matchers for testing
var expectValidUser = function (user) {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(['admin', 'moderator', 'user']).toContain(user.role || 'user');
};
exports.expectValidUser = expectValidUser;
var expectValidThread = function (thread) {
    expect(thread).toHaveProperty('id');
    expect(thread).toHaveProperty('title');
    expect(thread).toHaveProperty('slug');
    expect(thread).toHaveProperty('forumId');
    expect(thread).toHaveProperty('userId');
    expect(typeof thread.viewCount).toBe('number');
    expect(typeof thread.postCount).toBe('number');
};
exports.expectValidThread = expectValidThread;
var expectValidPost = function (post) {
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('threadId');
    expect(post).toHaveProperty('userId');
    expect(post).toHaveProperty('content');
    expect(typeof post.content).toBe('string');
    expect(post.content.length).toBeGreaterThan(0);
    expect(typeof post.isFirstPost).toBe('boolean');
};
exports.expectValidPost = expectValidPost;
