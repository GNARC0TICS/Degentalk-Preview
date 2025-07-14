"use strict";
/**
 * Scenario Generator Utilities
 * Generates complex, realistic test scenarios for the Degentalk platform
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
exports.availableScenarios = exports.scenarioGenerator = exports.ScenarioGenerator = void 0;
var factory_1 = require("../core/factory");
var user_factory_1 = require("../factories/user.factory");
var forum_factory_1 = require("../factories/forum.factory");
// Register all factories
factory_1.Factory.register('user', new user_factory_1.UserFactory());
factory_1.Factory.register('admin', new user_factory_1.AdminUserFactory());
factory_1.Factory.register('whale', new user_factory_1.CryptoWhaleFactory());
factory_1.Factory.register('thread', new forum_factory_1.ThreadFactory());
factory_1.Factory.register('post', new forum_factory_1.PostFactory());
factory_1.Factory.register('forum', new forum_factory_1.ForumCategoryFactory());
var ScenarioGenerator = /** @class */ (function () {
    function ScenarioGenerator() {
        this.startTime = 0;
    }
    ScenarioGenerator.prototype.generateScenario = function (scenarioName) {
        return __awaiter(this, void 0, void 0, function () {
            var scenario, generatedData, relationships;
            return __generator(this, function (_a) {
                this.startTime = Date.now();
                scenario = this.getScenarioDefinition(scenarioName);
                if (!scenario) {
                    throw new Error("Unknown scenario: ".concat(scenarioName));
                }
                generatedData = {};
                relationships = {};
                switch (scenarioName) {
                    case 'forum-discussion':
                        return [2 /*return*/, this.generateForumDiscussion()];
                    case 'whale-activity':
                        return [2 /*return*/, this.generateWhaleActivity()];
                    case 'new-user-onboarding':
                        return [2 /*return*/, this.generateNewUserOnboarding()];
                    case 'admin-moderation':
                        return [2 /*return*/, this.generateAdminModeration()];
                    case 'crypto-market-event':
                        return [2 /*return*/, this.generateCryptoMarketEvent()];
                    case 'community-growth':
                        return [2 /*return*/, this.generateCommunityGrowth()];
                    default:
                        throw new Error("Scenario '".concat(scenarioName, "' not implemented"));
                }
                return [2 /*return*/];
            });
        });
    };
    ScenarioGenerator.prototype.getScenarioDefinition = function (name) {
        var scenarios = {
            'forum-discussion': {
                name: 'Forum Discussion',
                description: 'Active forum discussion with users, threads, and engagement',
                complexity: 'medium',
                estimatedDuration: '2-3 minutes'
            },
            'whale-activity': {
                name: 'Crypto Whale Activity',
                description: 'High-value user with large transactions and community impact',
                complexity: 'simple',
                estimatedDuration: '1 minute'
            },
            'new-user-onboarding': {
                name: 'New User Onboarding',
                description: 'Fresh user journey from registration to first engagement',
                complexity: 'simple',
                estimatedDuration: '1 minute'
            },
            'admin-moderation': {
                name: 'Admin Moderation',
                description: 'Admin activities including user management and content moderation',
                complexity: 'complex',
                estimatedDuration: '3-5 minutes'
            },
            'crypto-market-event': {
                name: 'Crypto Market Event',
                description: 'Community reaction to major market movements',
                complexity: 'complex',
                estimatedDuration: '3-5 minutes'
            },
            'community-growth': {
                name: 'Community Growth',
                description: 'Large-scale community with diverse user types and content',
                complexity: 'complex',
                estimatedDuration: '5-10 minutes'
            }
        };
        return scenarios[name] || null;
    };
    ScenarioGenerator.prototype.generateForumDiscussion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var users, forum, threads, posts, _i, threads_1, thread, firstPost, replyCount, replies, engagementData;
            return __generator(this, function (_a) {
                users = __spreadArray(__spreadArray(__spreadArray([], factory_1.Factory.createMany('user', 7, { overrides: { role: 'user' } }), true), factory_1.Factory.createMany('admin', 2), true), factory_1.Factory.createMany('whale', 1), true);
                forum = factory_1.Factory.create('forum', {
                    overrides: {
                        name: 'Bull Market Discussion',
                        description: 'Discuss the latest bull run and market trends'
                    }
                });
                threads = factory_1.Factory.createMany('thread', 3, {
                    overrides: {
                        forumId: forum.id,
                        userId: users[Math.floor(Math.random() * users.length)].id
                    }
                }).map(function (thread, index) { return (__assign(__assign({}, thread), { title: [
                        'BTC just broke $50k resistance! 🚀',
                        'Altseason is here - which coins are you buying?',
                        'Market analysis: Why this bull run is different'
                    ][index] })); });
                posts = [];
                for (_i = 0, threads_1 = threads; _i < threads_1.length; _i++) {
                    thread = threads_1[_i];
                    firstPost = factory_1.Factory.create('post', {
                        overrides: {
                            threadId: thread.id,
                            userId: thread.userId,
                            isFirstPost: true,
                            content: this.generateThreadStarterContent(thread.title)
                        }
                    });
                    posts.push(firstPost);
                    replyCount = Math.floor(Math.random() * 15) + 5;
                    replies = factory_1.Factory.createMany('post', replyCount, {
                        overrides: {
                            threadId: thread.id,
                            userId: users[Math.floor(Math.random() * users.length)].id,
                            isFirstPost: false
                        }
                    });
                    posts.push.apply(posts, replies);
                }
                engagementData = this.generateEngagementData(users, posts);
                return [2 /*return*/, this.buildScenarioResult('forum-discussion', {
                        users: users,
                        forums: [forum],
                        threads: threads,
                        posts: posts,
                        engagement: engagementData
                    }, {
                        threads: ["".concat(threads.length, " threads in forum ").concat(forum.id)],
                        posts: ["".concat(posts.length, " posts across ").concat(threads.length, " threads")],
                        engagement: ["Likes, tips, and replies for ".concat(users.length, " users")]
                    })];
            });
        });
    };
    ScenarioGenerator.prototype.generateWhaleActivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var whale, regularUsers, transactions, whalePosts, tips;
            return __generator(this, function (_a) {
                whale = factory_1.Factory.create('whale', {
                    overrides: {
                        username: 'cryptowhale_2024',
                        dgtWalletBalance: BigInt(5000000), // 5M DGT
                        reputation: 8500,
                        bio: 'Crypto whale 🐋 Early Bitcoin adopter. Building the future of DeFi.'
                    }
                });
                regularUsers = factory_1.Factory.createMany('user', 5);
                transactions = this.generateWhaleTransactions(whale.id);
                whalePosts = factory_1.Factory.createMany('post', 8, {
                    overrides: {
                        userId: whale.id,
                        likeCount: Math.floor(Math.random() * 100) + 50 // High engagement
                    }
                });
                tips = this.generateWhaleTips(whale.id, regularUsers.map(function (u) { return u.id; }));
                return [2 /*return*/, this.buildScenarioResult('whale-activity', {
                        users: __spreadArray([whale], regularUsers, true),
                        transactions: transactions,
                        posts: whalePosts,
                        tips: tips
                    }, {
                        whale: ["High-value user ".concat(whale.username, " with 5M DGT")],
                        transactions: ["".concat(transactions.length, " high-value transactions")],
                        community_impact: ["Tips and engagement with ".concat(regularUsers.length, " users")]
                    })];
            });
        });
    };
    ScenarioGenerator.prototype.generateNewUserOnboarding = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newUser, helpfulUsers, beginnerForum, firstThread, firstPost, helpfulReplies, progressionData;
            return __generator(this, function (_a) {
                newUser = factory_1.Factory.create('user', {
                    overrides: {
                        xp: 0,
                        level: 1,
                        dgtWalletBalance: BigInt(1000), // Starting balance
                        reputation: 0,
                        totalPosts: 0,
                        totalThreads: 0,
                        isEmailVerified: false,
                        createdAt: new Date(),
                        bio: ''
                    }
                });
                helpfulUsers = factory_1.Factory.createMany('user', 3, {
                    overrides: {
                        role: 'user',
                        reputation: Math.floor(Math.random() * 1000) + 500
                    }
                });
                beginnerForum = factory_1.Factory.create('forum', {
                    overrides: {
                        name: 'Beginner Questions',
                        description: 'New to crypto? Ask your questions here!'
                    }
                });
                firstThread = factory_1.Factory.create('thread', {
                    overrides: {
                        title: 'New to crypto - where do I start?',
                        forumId: beginnerForum.id,
                        userId: newUser.id,
                        viewCount: 0,
                        postCount: 1
                    }
                });
                firstPost = factory_1.Factory.create('post', {
                    overrides: {
                        threadId: firstThread.id,
                        userId: newUser.id,
                        isFirstPost: true,
                        content: "Hi everyone! I'm completely new to cryptocurrency and this community. I've been reading about Bitcoin and Ethereum but feeling overwhelmed. \n\nWhere should I start? What are the basics I need to understand? Any recommended resources for beginners?\n\nThanks in advance for any help! \uD83D\uDE4F",
                        likeCount: 0
                    }
                });
                helpfulReplies = factory_1.Factory.createMany('post', 3, {
                    overrides: {
                        threadId: firstThread.id,
                        isFirstPost: false
                    }
                }).map(function (post, index) { return (__assign(__assign({}, post), { userId: helpfulUsers[index].id, content: [
                        'Welcome to the community! 👋 Start with understanding Bitcoin whitepaper and basic blockchain concepts. DM me if you have specific questions!',
                        'Great question! I recommend starting with small amounts, learning about wallets, and understanding the difference between centralized and decentralized exchanges.',
                        'Welcome! Check out our pinned beginner guides. Most important: never invest more than you can afford to lose, and always DYOR (Do Your Own Research)!'
                    ][index] })); });
                progressionData = this.generateOnboardingProgression(newUser.id);
                return [2 /*return*/, this.buildScenarioResult('new-user-onboarding', {
                        users: __spreadArray([newUser], helpfulUsers, true),
                        forums: [beginnerForum],
                        threads: [firstThread],
                        posts: __spreadArray([firstPost], helpfulReplies, true),
                        progression: progressionData
                    }, {
                        new_user: ["Fresh user ".concat(newUser.username, " starting their journey")],
                        community_support: ["".concat(helpfulUsers.length, " helpful community members")],
                        learning_path: ['First thread, helpful replies, progression tracking']
                    })];
            });
        });
    };
    ScenarioGenerator.prototype.generateAdminModeration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var admins, moderators, problematicUsers, regularUsers, moderationActions, auditLogs, settingsChanges;
            return __generator(this, function (_a) {
                admins = factory_1.Factory.createMany('admin', 2);
                moderators = factory_1.Factory.createMany('user', 2, {
                    overrides: { role: 'moderator' }
                });
                problematicUsers = factory_1.Factory.createMany('user', 3, {
                    overrides: {
                        totalPosts: Math.floor(Math.random() * 20) + 5
                    }
                });
                regularUsers = factory_1.Factory.createMany('user', 10);
                moderationActions = this.generateModerationActions(__spreadArray(__spreadArray([], admins, true), moderators, true), problematicUsers);
                auditLogs = this.generateAuditLogs(admins, moderationActions);
                settingsChanges = this.generateSettingsChanges(admins[0].id);
                return [2 /*return*/, this.buildScenarioResult('admin-moderation', {
                        users: __spreadArray(__spreadArray(__spreadArray(__spreadArray([], admins, true), moderators, true), problematicUsers, true), regularUsers, true),
                        moderation_actions: moderationActions,
                        audit_logs: auditLogs,
                        settings_changes: settingsChanges
                    }, {
                        admin_team: ["".concat(admins.length, " admins, ").concat(moderators.length, " moderators")],
                        moderation: ["".concat(moderationActions.length, " moderation actions taken")],
                        audit_trail: ["".concat(auditLogs.length, " audit log entries")]
                    })];
            });
        });
    };
    ScenarioGenerator.prototype.generateCryptoMarketEvent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var eventTitle, users, marketForum, eventThread, posts, marketData;
            var _this = this;
            return __generator(this, function (_a) {
                eventTitle = 'Bitcoin Hits New All-Time High!';
                users = __spreadArray(__spreadArray(__spreadArray([], factory_1.Factory.createMany('user', 15), true), factory_1.Factory.createMany('whale', 3), true), factory_1.Factory.createMany('admin', 1) // Admin
                , true);
                marketForum = factory_1.Factory.create('forum', {
                    overrides: {
                        name: 'Market Events',
                        description: 'Real-time market discussion and analysis'
                    }
                });
                eventThread = factory_1.Factory.create('thread', {
                    overrides: {
                        title: eventTitle,
                        forumId: marketForum.id,
                        userId: users[0].id,
                        viewCount: Math.floor(Math.random() * 5000) + 10000, // High views
                        isPinned: true
                    }
                });
                posts = factory_1.Factory.createMany('post', 25, {
                    overrides: {
                        threadId: eventThread.id,
                        likeCount: Math.floor(Math.random() * 50) + 10 // High engagement
                    }
                }).map(function (post, index) { return (__assign(__assign({}, post), { userId: users[index % users.length].id, content: _this.generateMarketEventContent(index) })); });
                marketData = this.generateMarketReactionData(users, eventThread.id);
                return [2 /*return*/, this.buildScenarioResult('crypto-market-event', {
                        users: users,
                        forums: [marketForum],
                        threads: [eventThread],
                        posts: posts,
                        market_data: marketData
                    }, {
                        market_event: [eventTitle],
                        community_reaction: ["".concat(posts.length, " posts from ").concat(users.length, " users")],
                        engagement: ['High views, likes, and rapid posting activity']
                    })];
            });
        });
    };
    ScenarioGenerator.prototype.generateCommunityGrowth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var users, forums, threads, _i, forums_1, forum, forumThreads, posts, _a, threads_2, thread, postCount, threadPosts, stats;
            return __generator(this, function (_b) {
                users = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], factory_1.Factory.createMany('admin', 3), true), factory_1.Factory.createMany('user', 45, { overrides: { role: 'moderator' } }), true), factory_1.Factory.createMany('whale', 5), true), factory_1.Factory.createMany('user', 147) // Regular users
                , true);
                forums = [
                    'General Trading',
                    'DeFi Discussion',
                    'NFT Marketplace',
                    'Technical Analysis',
                    'Beginner Questions',
                    'Market News'
                ].map(function (name) {
                    return factory_1.Factory.create('forum', {
                        overrides: { name: name, description: "Community discussion about ".concat(name.toLowerCase()) }
                    });
                });
                threads = [];
                for (_i = 0, forums_1 = forums; _i < forums_1.length; _i++) {
                    forum = forums_1[_i];
                    forumThreads = factory_1.Factory.createMany('thread', Math.floor(Math.random() * 10) + 5, // 5-15 threads per forum
                    { overrides: { forumId: forum.id } });
                    threads.push.apply(threads, forumThreads);
                }
                posts = [];
                for (_a = 0, threads_2 = threads; _a < threads_2.length; _a++) {
                    thread = threads_2[_a];
                    postCount = Math.floor(Math.random() * 20) + 3;
                    threadPosts = factory_1.Factory.createMany('post', postCount, {
                        overrides: { threadId: thread.id }
                    });
                    posts.push.apply(posts, threadPosts);
                }
                stats = this.generateCommunityStats(users, forums, threads, posts);
                return [2 /*return*/, this.buildScenarioResult('community-growth', {
                        users: users,
                        forums: forums,
                        threads: threads,
                        posts: posts,
                        statistics: stats
                    }, {
                        scale: ["".concat(users.length, " users, ").concat(forums.length, " forums, ").concat(threads.length, " threads")],
                        content: ["".concat(posts.length, " total posts generated")],
                        diversity: ['Multiple user types, varied content, realistic engagement']
                    })];
            });
        });
    };
    // Helper methods for content generation
    ScenarioGenerator.prototype.generateThreadStarterContent = function (title) {
        var templates = [
            "".concat(title, "\n\nWhat do you all think about this? I've been watching the charts and the momentum is incredible. Volume is picking up and we're seeing some serious institutional interest.\n\nMy target is set at $75k by end of year. Diamond hands! \uD83D\uDC8E\uD83D\uDE4C"),
            "".concat(title, "\n\nJust saw this breakout happen live! The technical analysis was spot on - that ascending triangle pattern played out perfectly.\n\nAnyone else catch this move? What's your next target?"),
            "".concat(title, "\n\nThis could be the start of something big. Market sentiment is shifting and retail is starting to FOMO in.\n\nBuckle up degens, we're going to the moon! \uD83D\uDE80")
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    };
    ScenarioGenerator.prototype.generateWhaleTransactions = function (whaleId) {
        return Array.from({ length: 12 }, function (_, i) { return ({
            id: Date.now() + i,
            userId: whaleId,
            type: ['DEPOSIT', 'TIP', 'RAIN', 'PURCHASE'][Math.floor(Math.random() * 4)],
            amount: Math.floor(Math.random() * 100000) + 10000, // Large amounts
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            status: 'completed'
        }); });
    };
    ScenarioGenerator.prototype.generateWhaleTips = function (whaleId, userIds) {
        return Array.from({ length: 8 }, function (_, i) { return ({
            id: Date.now() + i,
            fromUserId: whaleId,
            toUserId: userIds[Math.floor(Math.random() * userIds.length)],
            amount: Math.floor(Math.random() * 5000) + 1000, // 1k-6k DGT tips
            message: 'Great post! Keep up the good work 🙌',
            createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
        }); });
    };
    ScenarioGenerator.prototype.generateEngagementData = function (users, posts) {
        var engagements = [];
        // Generate likes
        for (var _i = 0, posts_1 = posts; _i < posts_1.length; _i++) {
            var post = posts_1[_i];
            var likeCount = Math.floor(Math.random() * 20);
            for (var i = 0; i < likeCount; i++) {
                engagements.push({
                    type: 'like',
                    userId: users[Math.floor(Math.random() * users.length)].id,
                    postId: post.id,
                    createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
                });
            }
        }
        return engagements;
    };
    ScenarioGenerator.prototype.generateOnboardingProgression = function (userId) {
        return [
            { step: 'registration', completed: true, timestamp: new Date() },
            { step: 'email_verification', completed: false, timestamp: null },
            { step: 'first_post', completed: true, timestamp: new Date() },
            { step: 'profile_setup', completed: false, timestamp: null },
            { step: 'first_like_received', completed: false, timestamp: null }
        ];
    };
    ScenarioGenerator.prototype.generateModerationActions = function (moderators, users) {
        var actions = ['warn', 'timeout', 'ban', 'delete_post', 'lock_thread'];
        return Array.from({ length: 8 }, function (_, i) { return ({
            id: Date.now() + i,
            moderatorId: moderators[Math.floor(Math.random() * moderators.length)].id,
            targetUserId: users[Math.floor(Math.random() * users.length)].id,
            action: actions[Math.floor(Math.random() * actions.length)],
            reason: 'Violation of community guidelines',
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }); });
    };
    ScenarioGenerator.prototype.generateAuditLogs = function (admins, actions) {
        return actions.map(function (action, i) { return ({
            id: Date.now() + i,
            adminId: admins[Math.floor(Math.random() * admins.length)].id,
            action: "moderation.".concat(action.action),
            entityType: 'user',
            entityId: action.targetUserId,
            details: { reason: action.reason, moderator: action.moderatorId },
            timestamp: action.createdAt
        }); });
    };
    ScenarioGenerator.prototype.generateSettingsChanges = function (adminId) {
        return [
            {
                setting: 'max_daily_tips',
                oldValue: '100',
                newValue: '150',
                changedBy: adminId,
                timestamp: new Date()
            },
            {
                setting: 'minimum_post_length',
                oldValue: '10',
                newValue: '20',
                changedBy: adminId,
                timestamp: new Date(Date.now() - 60 * 60 * 1000)
            }
        ];
    };
    ScenarioGenerator.prototype.generateMarketEventContent = function (index) {
        var reactions = [
            'HOLY SHIT! We actually did it! Bitcoin new ATH! 🚀🚀🚀',
            "Told you all to buy the dip! Who's laughing now? 😂",
            'This is just the beginning. Next stop: $100k! 💎🙌',
            'Taking some profits here. Smart money knows when to scale out.',
            'My grandmother just asked me about Bitcoin. Top signal? 📈',
            "HODL gang where you at? We've been waiting for this moment!",
            'Technical analysis called this perfectly. That breakout was textbook.',
            'Altseason incoming! Time to rotate into some quality alts.',
            'Remember when everyone said Bitcoin was dead at $15k? 🤡',
            'This is why we DCA. Patience pays off in crypto.'
        ];
        return reactions[index % reactions.length];
    };
    ScenarioGenerator.prototype.generateMarketReactionData = function (users, threadId) {
        return {
            threadActivity: {
                threadId: threadId,
                postsPerHour: Math.floor(Math.random() * 20) + 30, // High activity
                uniqueUsers: Math.floor(users.length * 0.7), // 70% participation
                avgSentiment: 0.8 // Bullish sentiment
            },
            userBehavior: {
                newRegistrations: Math.floor(Math.random() * 50) + 20,
                dailyActiveUsers: Math.floor(users.length * 0.9),
                tipVolume: Math.floor(Math.random() * 100000) + 50000
            }
        };
    };
    ScenarioGenerator.prototype.generateCommunityStats = function (users, forums, threads, posts) {
        return {
            userDistribution: {
                total: users.length,
                admins: users.filter(function (u) { return u.role === 'admin'; }).length,
                moderators: users.filter(function (u) { return u.role === 'moderator'; }).length,
                regular: users.filter(function (u) { return u.role === 'user' || !u.role; }).length,
                whales: users.filter(function (u) { return u.dgtWalletBalance > 1000000; }).length
            },
            contentStats: {
                totalThreads: threads.length,
                totalPosts: posts.length,
                avgPostsPerThread: Math.round(posts.length / threads.length),
                avgThreadsPerForum: Math.round(threads.length / forums.length)
            },
            engagementMetrics: {
                avgPostsPerUser: Math.round(posts.length / users.length),
                activeForums: forums.length,
                dailyActiveThreads: Math.floor(threads.length * 0.3)
            }
        };
    };
    ScenarioGenerator.prototype.buildScenarioResult = function (scenarioName, generatedData, relationships) {
        var config = this.getScenarioDefinition(scenarioName);
        var entitiesByType = {};
        var totalEntities = 0;
        for (var _i = 0, _a = Object.entries(generatedData); _i < _a.length; _i++) {
            var _b = _a[_i], type = _b[0], data = _b[1];
            var count = Array.isArray(data) ? data.length : 1;
            entitiesByType[type] = count;
            totalEntities += count;
        }
        return {
            config: config,
            generatedData: generatedData,
            relationships: relationships,
            statistics: {
                totalEntities: totalEntities,
                entitiesByType: entitiesByType,
                generationTime: Date.now() - this.startTime
            }
        };
    };
    return ScenarioGenerator;
}());
exports.ScenarioGenerator = ScenarioGenerator;
// Export pre-configured scenario instances
exports.scenarioGenerator = new ScenarioGenerator();
// Export available scenarios list
exports.availableScenarios = [
    'forum-discussion',
    'whale-activity',
    'new-user-onboarding',
    'admin-moderation',
    'crypto-market-event',
    'community-growth'
];
