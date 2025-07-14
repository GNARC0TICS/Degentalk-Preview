"use strict";
/**
 * Forum content factories for realistic crypto community discussions
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumCategoryFactory = exports.PostFactory = exports.ThreadFactory = void 0;
var factory_1 = require("../core/factory");
var id_1 = require("@shared/utils/id");
var ThreadFactory = /** @class */ (function (_super) {
    __extends(ThreadFactory, _super);
    function ThreadFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ThreadFactory.prototype.definition = function () {
        var title = this.generateCryptoTitle();
        return {
            id: (0, id_1.generateId)(),
            title: title,
            slug: this.slugify(title),
            forumId: (0, id_1.generateId)(),
            userId: (0, id_1.generateId)(),
            isPinned: this.faker.datatype.boolean(0.05),
            isLocked: this.faker.datatype.boolean(0.02),
            viewCount: this.faker.number.int({ min: 0, max: 10000 }),
            postCount: this.faker.number.int({ min: 1, max: 500 }),
            lastPostAt: this.faker.date.recent({ days: 30 }),
            createdAt: this.faker.date.past({ months: 6 }),
            updatedAt: this.faker.date.recent({ days: 7 })
        };
    };
    ThreadFactory.prototype.generateCryptoTitle = function () {
        var template = this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_THREAD_TITLES);
        var token = this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_TOKENS);
        var price = this.faker.number.int({ min: 1, max: 100 });
        var target = this.faker.helpers.arrayElement(ThreadFactory.PRICE_TARGETS);
        var tag = this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_TAGS);
        var date = this.faker.date.recent().toLocaleDateString();
        return template
            .replace('${token}', token)
            .replace('${price}', price.toString())
            .replace('${target}', target)
            .replace('${tag}', tag)
            .replace('${date}', date)
            .replace('${sector}', this.faker.helpers.arrayElement(['DeFi', 'GameFi', 'RWA', 'AI']));
    };
    ThreadFactory.prototype.slugify = function (title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    };
    ThreadFactory.prototype.getState = function (state) {
        var states = {
            hot: {
                viewCount: this.faker.number.int({ min: 5000, max: 50000 }),
                postCount: this.faker.number.int({ min: 100, max: 1000 }),
                lastPostAt: this.faker.date.recent({ hours: 2 })
            },
            pinned: {
                isPinned: true,
                viewCount: this.faker.number.int({ min: 10000, max: 100000 }),
                title: '[PINNED] ' + this.generateCryptoTitle()
            },
            locked: {
                isLocked: true,
                title: '[LOCKED] ' + this.generateCryptoTitle(),
                lastPostAt: this.faker.date.past({ days: 30 })
            },
            empty: {
                postCount: 1, // Just the first post
                viewCount: this.faker.number.int({ min: 0, max: 100 }),
                lastPostAt: this.faker.date.recent({ days: 1 })
            }
        };
        return states[state] || {};
    };
    ThreadFactory.CRYPTO_THREAD_TITLES = [
        'BTC just broke ${price}k resistance! 🚀',
        'REKT: Lost everything on this ${token} trade',
        'Why ${token} is going to ${target} (TA inside)',
        "${token} holders, we're so back!",
        'Daily ${token} discussion - ${date}',
        'Is ${token} dead? Serious discussion only',
        'Just aped into ${token} at ${price}',
        '${token} tokenomics are actually genius',
        'Unpopular opinion: ${token} is overvalued',
        "#{tag} Why I'm bullish on ${sector}"
    ];
    ThreadFactory.CRYPTO_TOKENS = [
        'ETH',
        'BTC',
        'SOL',
        'LINK',
        'DOGE',
        'SHIB',
        'PEPE',
        'MATIC',
        'AVAX',
        'ADA'
    ];
    ThreadFactory.PRICE_TARGETS = [
        '100k',
        '50k',
        '25k',
        '$1',
        '$10',
        '$100',
        'moon',
        'zero'
    ];
    ThreadFactory.CRYPTO_TAGS = [
        'bull-market',
        'bear-market',
        'altseason',
        'defi',
        'nft',
        'memecoins',
        'ta',
        'fundamentals'
    ];
    return ThreadFactory;
}(factory_1.BaseFactory));
exports.ThreadFactory = ThreadFactory;
var PostFactory = /** @class */ (function (_super) {
    __extends(PostFactory, _super);
    function PostFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PostFactory.prototype.definition = function () {
        return {
            id: (0, id_1.generateId)(),
            threadId: (0, id_1.generateId)(),
            userId: (0, id_1.generateId)(),
            content: this.generateCryptoContent(),
            isFirstPost: false,
            likeCount: this.faker.number.int({ min: 0, max: 100 }),
            createdAt: this.faker.date.past({ months: 3 }),
            updatedAt: this.faker.date.recent({ days: 1 })
        };
    };
    PostFactory.prototype.generateCryptoContent = function () {
        var template = this.faker.helpers.arrayElement(PostFactory.CRYPTO_POST_TEMPLATES);
        return template
            .replace('${price}', "$".concat(this.faker.number.int({ min: 100, max: 50000 })))
            .replace('${token}', this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_TOKENS))
            .replace('${pattern}', this.faker.helpers.arrayElement(PostFactory.PATTERNS))
            .replace('${target}', "$".concat(this.faker.number.int({ min: 1000, max: 100000 })))
            .replace('${news}', this.faker.helpers.arrayElement(PostFactory.NEWS_TYPES))
            .replace('${opinion}', this.faker.helpers.arrayElement(PostFactory.OPINIONS))
            .replace('${period}', this.faker.helpers.arrayElement(['6 months', '1 year', '2 years']))
            .replace('${marketcap}', "$".concat(this.faker.number.int({ min: 1, max: 1000 }), "M"))
            .replace('${feature}', this.faker.helpers.arrayElement([
            'yield farming',
            'staking rewards',
            'low fees',
            'fast txs'
        ]))
            .replace('${reason}', this.faker.helpers.arrayElement([
            'tokenomics are broken',
            'team is dumping',
            'no real utility'
        ]))
            .replace('${tag}', this.faker.helpers.arrayElement(ThreadFactory.CRYPTO_TAGS))
            .replace('${content}', this.faker.lorem.paragraph());
    };
    PostFactory.prototype.getState = function (state) {
        var states = {
            first: {
                isFirstPost: true,
                content: this.generateLongCryptoContent()
            },
            popular: {
                likeCount: this.faker.number.int({ min: 50, max: 500 })
            },
            controversial: {
                likeCount: this.faker.number.int({ min: -20, max: 20 }),
                content: 'Unpopular opinion: ' + this.generateCryptoContent()
            },
            reply: {
                content: "@".concat(this.faker.internet.userName(), " ").concat(this.generateCryptoContent())
            }
        };
        return states[state] || {};
    };
    PostFactory.prototype.generateLongCryptoContent = function () {
        var intro = this.generateCryptoContent();
        var body = this.faker.lorem.paragraphs(2, '\n\n');
        var conclusion = this.faker.helpers.arrayElement([
            'DYOR and not financial advice!',
            'What do you think? Diamond hands or paper hands?',
            "LFG! Who's with me?",
            'Bullish or bearish? Drop your thoughts below.'
        ]);
        return "".concat(intro, "\n\n").concat(body, "\n\n").concat(conclusion);
    };
    PostFactory.CRYPTO_POST_TEMPLATES = [
        'Just bought the dip at ${price}! Who else is accumulating?',
        'TA update: ${token} is forming a ${pattern}. Target: ${target}',
        "GM crypto degens! What's everyone buying today?",
        'This ${news} is huge for ${token}. Moon mission incoming! 🚀',
        'Unpopular opinion: ${opinion}',
        'REKT check: How much did you lose on ${token}?',
        'DCA is the way. Been buying ${token} every week for ${period}',
        'Found this gem: ${token}. ${marketcap} mcap, ${feature}',
        'Bearish on ${token}. ${reason}. Change my mind.',
        '#{tag} ${content}'
    ];
    PostFactory.PATTERNS = [
        'ascending triangle',
        'bull flag',
        'cup and handle',
        'double bottom',
        'inverse head and shoulders'
    ];
    PostFactory.NEWS_TYPES = [
        'partnership',
        'listing',
        'upgrade',
        'hack',
        'regulation',
        'adoption'
    ];
    PostFactory.OPINIONS = [
        'most altcoins will go to zero',
        'Bitcoin is digital gold',
        'DeFi is overrated',
        'NFTs will come back',
        "we're still early"
    ];
    return PostFactory;
}(factory_1.BaseFactory));
exports.PostFactory = PostFactory;
var ForumCategoryFactory = /** @class */ (function (_super) {
    __extends(ForumCategoryFactory, _super);
    function ForumCategoryFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ForumCategoryFactory.prototype.definition = function () {
        var name = this.faker.helpers.arrayElement(ForumCategoryFactory.CRYPTO_FORUM_NAMES);
        return {
            id: (0, id_1.generateId)(),
            name: name,
            slug: this.slugify(name),
            description: this.generateForumDescription(name),
            isActive: true,
            sortOrder: this.faker.number.int({ min: 1, max: 100 }),
            threadCount: this.faker.number.int({ min: 0, max: 10000 }),
            postCount: this.faker.number.int({ min: 0, max: 100000 }),
            createdAt: this.faker.date.past({ years: 1 }),
            updatedAt: this.faker.date.recent({ days: 30 })
        };
    };
    ForumCategoryFactory.prototype.slugify = function (name) {
        return name.toLowerCase().replace(/\s+/g, '-');
    };
    ForumCategoryFactory.prototype.generateForumDescription = function (name) {
        var descriptions = {
            'General Trading': 'Discuss your trades, share wins and losses, get trading advice',
            'DeFi Discussion': 'Decentralized finance protocols, yield farming, and liquidity mining',
            'NFT Marketplace': 'Buy, sell, and discuss non-fungible tokens and digital collectibles',
            'Meme Coins': 'DOGE, SHIB, PEPE and other meme-based cryptocurrencies',
            'Technical Analysis': 'Charts, patterns, indicators and market analysis',
            'Market News': 'Latest crypto news, regulations, and market updates',
            'Beginner Questions': 'New to crypto? Ask your questions here',
            'Whale Alerts': 'Large transactions and whale movement tracking'
        };
        return descriptions[name] || this.faker.lorem.sentence();
    };
    ForumCategoryFactory.CRYPTO_FORUM_NAMES = [
        'General Trading',
        'DeFi Discussion',
        'NFT Marketplace',
        'Meme Coins',
        'Technical Analysis',
        'Market News',
        'Beginner Questions',
        'Whale Alerts',
        'Rugpull Warnings',
        'Yield Farming',
        'Staking Rewards',
        'Crypto Gaming'
    ];
    return ForumCategoryFactory;
}(factory_1.BaseFactory));
exports.ForumCategoryFactory = ForumCategoryFactory;
