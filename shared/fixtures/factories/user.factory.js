"use strict";
/**
 * User factory with crypto-community personas and realistic test data
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewbieUserFactory = exports.CryptoWhaleFactory = exports.AdminUserFactory = exports.UserFactory = void 0;
// STREAM-LOCK: B
var factory_1 = require("../core/factory");
var id_1 = require("@shared/utils/id");
var UserFactory = /** @class */ (function (_super) {
    __extends(UserFactory, _super);
    function UserFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UserFactory.prototype.definition = function () {
        var username = this.generateCryptoUsername();
        return {
            id: (0, id_1.generateId)(),
            username: username,
            email: "".concat(username, "@").concat(this.faker.helpers.arrayElement(UserFactory.CRYPTO_EMAILS)),
            passwordHash: '$2b$10$' + this.faker.string.alphanumeric(53), // Realistic bcrypt hash
            role: 'user',
            xp: this.faker.number.int({ min: 0, max: 10000 }),
            level: this.calculateLevel(),
            dgtWalletBalance: BigInt(this.faker.number.int({ min: 0, max: 100000 })),
            reputation: this.faker.number.int({ min: 0, max: 1000 }),
            totalPosts: this.faker.number.int({ min: 0, max: 500 }),
            totalThreads: this.faker.number.int({ min: 0, max: 50 }),
            totalLikes: this.faker.number.int({ min: 0, max: 200 }),
            totalTips: this.faker.number.int({ min: 0, max: 100 }),
            bio: this.generateCryptoBio(),
            avatarUrl: this.faker.image.avatar(),
            isActive: true,
            isEmailVerified: this.faker.datatype.boolean(0.8),
            createdAt: this.faker.date.past({ years: 2 }),
            updatedAt: new Date()
        };
    };
    UserFactory.prototype.generateCryptoUsername = function () {
        var _this = this;
        var base = this.faker.helpers.arrayElement(UserFactory.CRYPTO_USERNAMES);
        var suffix = this.faker.helpers.maybe(function () { return _this.faker.number.int({ min: 1, max: 9999 }).toString(); }, { probability: 0.6 });
        return suffix ? "".concat(base).concat(suffix) : base;
    };
    UserFactory.prototype.calculateLevel = function () {
        var xp = this.faker.number.int({ min: 0, max: 10000 });
        // Simple XP to level calculation
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    };
    /**
     * Create mock UserStats with new fields
     */
    UserFactory.createUserStats = function () {
        var faker = this.createFaker();
        return {
            postCount: faker.number.int({ min: 0, max: 500 }),
            threadCount: faker.number.int({ min: 0, max: 50 }),
            tipsSent: faker.number.int({ min: 0, max: 100 }),
            tipsReceived: faker.number.int({ min: 0, max: 100 }),
            reputation: faker.number.int({ min: -100, max: 1000 }),
            totalXp: faker.number.int({ min: 0, max: 50000 }),
            dailyStreak: faker.number.int({ min: 0, max: 365 }),
            bestStreak: faker.number.int({ min: 0, max: 365 }),
            achievementCount: faker.number.int({ min: 0, max: 50 }),
            lastPostAt: faker.date.recent({ days: 30 }),
            joinedAt: faker.date.past({ years: 2 })
        };
    };
    /**
     * Create mock LevelConfig
     */
    UserFactory.createLevelConfig = function (level) {
        if (level === void 0) { level = 1; }
        var levelNames = [
            'Newcomer',
            'Lurker',
            'Poster',
            'Regular',
            'Veteran',
            'Elite',
            'Legend',
            'Master',
            'Grandmaster',
            'Deity'
        ];
        var colors = ['#gray', '#green', '#blue', '#purple', '#orange', '#red'];
        return {
            level: level,
            name: levelNames[Math.min(level - 1, levelNames.length - 1)] || "Level ".concat(level),
            minXp: level === 1 ? 0 : (level - 1) * 1000,
            maxXp: level * 1000,
            color: colors[Math.min(level - 1, colors.length - 1)] || '#gold'
        };
    };
    /**
     * Create mock DisplaySettings
     */
    UserFactory.createDisplaySettings = function () {
        var faker = this.createFaker();
        return {
            language: 'en',
            timezone: 'UTC',
            dateFormat: faker.helpers.arrayElement(['relative', 'absolute']),
            showSignatures: faker.datatype.boolean(0.8),
            postsPerPage: faker.helpers.arrayElement([10, 20, 50, 100]),
            theme: faker.helpers.arrayElement(['system', 'light', 'dark']),
            fontSize: faker.helpers.arrayElement(['small', 'medium', 'large']),
            threadDisplayMode: faker.helpers.arrayElement(['card', 'list', 'compact']),
            reducedMotion: faker.datatype.boolean(0.2),
            hideNsfw: faker.datatype.boolean(0.7),
            showMatureContent: faker.datatype.boolean(0.3),
            showOfflineUsers: faker.datatype.boolean(0.6)
        };
    };
    UserFactory.prototype.generateCryptoBio = function () {
        var templates = [
            'Diamond hands since {year}. {coin} to the moon! 🚀',
            'DeFi degen, yield farmer, rug survivor. HODL or die.',
            'NFT collector, meme coin enthusiast. Not financial advice.',
            'Building in the bear market. {framework} developer.',
            'Crypto trader, shit poster, moon dreamer. WAGMI.'
        ];
        var template = this.faker.helpers.arrayElement(templates);
        return template
            .replace('{year}', this.faker.date.past({ years: 5 }).getFullYear().toString())
            .replace('{coin}', this.faker.helpers.arrayElement(['BTC', 'ETH', 'SOL', 'LINK', 'DOGE']))
            .replace('{framework}', this.faker.helpers.arrayElement(['Solidity', 'Rust', 'Move', 'React']));
    };
    // State definitions for different user types
    UserFactory.prototype.getState = function (state) {
        var states = {
            admin: {
                role: 'admin',
                xp: this.faker.number.int({ min: 50000, max: 100000 }),
                level: this.faker.number.int({ min: 50, max: 100 }),
                reputation: this.faker.number.int({ min: 5000, max: 10000 }),
                dgtWalletBalance: BigInt(this.faker.number.int({ min: 500000, max: 1000000 })),
                isEmailVerified: true
            },
            moderator: {
                role: 'moderator',
                xp: this.faker.number.int({ min: 25000, max: 75000 }),
                level: this.faker.number.int({ min: 25, max: 75 }),
                reputation: this.faker.number.int({ min: 2500, max: 7500 }),
                dgtWalletBalance: BigInt(this.faker.number.int({ min: 100000, max: 500000 })),
                isEmailVerified: true
            },
            newbie: {
                xp: this.faker.number.int({ min: 0, max: 100 }),
                level: 1,
                reputation: 0,
                totalPosts: this.faker.number.int({ min: 0, max: 5 }),
                totalThreads: 0,
                dgtWalletBalance: BigInt(1000), // Starting balance
                isEmailVerified: false
            },
            whale: {
                dgtWalletBalance: BigInt(this.faker.number.int({ min: 1000000, max: 10000000 })),
                reputation: this.faker.number.int({ min: 5000, max: 10000 }),
                totalTips: this.faker.number.int({ min: 500, max: 2000 }),
                bio: 'Crypto whale 🐋 Large bag holder. Tips generously.'
            },
            banned: {
                isActive: false,
                bio: 'Account suspended for violations.'
            },
            inactive: {
                updatedAt: this.faker.date.past({ years: 1 }),
                totalPosts: 0,
                totalThreads: 0
            }
        };
        return states[state] || {};
    };
    UserFactory.CRYPTO_USERNAMES = [
        'diamondhands',
        'paperhands',
        'cryptowhale',
        'moonboi',
        'hodler',
        'degen',
        'apefollower',
        'nftfloor',
        'yieldfarmer',
        'defilover',
        'btcmaxi',
        'etherean',
        'altcoinhunter',
        'memecoinlord',
        'rugpuller'
    ];
    UserFactory.CRYPTO_EMAILS = [
        'gmail.com',
        'protonmail.com',
        'tutanota.com',
        'outlook.com'
    ];
    return UserFactory;
}(factory_1.BaseFactory));
exports.UserFactory = UserFactory;
// Specialized user factories for common scenarios
var AdminUserFactory = /** @class */ (function (_super) {
    __extends(AdminUserFactory, _super);
    function AdminUserFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AdminUserFactory.prototype.definition = function () {
        return __assign(__assign(__assign({}, _super.prototype.definition.call(this)), this.getState('admin')), { username: "admin_".concat(this.faker.string.alphanumeric(8)) });
    };
    return AdminUserFactory;
}(UserFactory));
exports.AdminUserFactory = AdminUserFactory;
var CryptoWhaleFactory = /** @class */ (function (_super) {
    __extends(CryptoWhaleFactory, _super);
    function CryptoWhaleFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CryptoWhaleFactory.prototype.definition = function () {
        return __assign(__assign(__assign({}, _super.prototype.definition.call(this)), this.getState('whale')), { username: "whale_".concat(this.faker.string.alphanumeric(8)) });
    };
    return CryptoWhaleFactory;
}(UserFactory));
exports.CryptoWhaleFactory = CryptoWhaleFactory;
var NewbieUserFactory = /** @class */ (function (_super) {
    __extends(NewbieUserFactory, _super);
    function NewbieUserFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NewbieUserFactory.prototype.definition = function () {
        return __assign(__assign(__assign({}, _super.prototype.definition.call(this)), this.getState('newbie')), { createdAt: this.faker.date.recent({ days: 7 }) });
    };
    return NewbieUserFactory;
}(UserFactory));
exports.NewbieUserFactory = NewbieUserFactory;
