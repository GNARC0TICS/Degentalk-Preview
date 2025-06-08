"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedForumCategories = seedForumCategories;
var db_1 = require("../../server/src/core/db");
var schema_1 = require("../../shared/schema");
var drizzle_orm_1 = require("drizzle-orm");
function seedForumCategories() {
    return __awaiter(this, void 0, void 0, function () {
        var categoriesToSeed, _i, categoriesToSeed_1, categoryData, existingCategory, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Seeding forum categories...');
                    categoriesToSeed = [
                        {
                            name: 'The Pit',
                            slug: 'the-pit',
                            description: 'General discussion and community interaction.',
                            parentId: null,
                            isZone: 1,
                            canonical: 1,
                            position: 1,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#FF5733',
                            icon: 'fire',
                            colorTheme: 'theme-pit',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Announcements',
                            slug: 'announcements',
                            description: 'Official announcements from the staff.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 2,
                            isVip: 0,
                            isLocked: 1,
                            minXp: 0,
                            color: '#4CAF50',
                            icon: 'megaphone',
                            colorTheme: 'theme-announcements',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'General Discussion',
                            slug: 'general-discussion',
                            description: 'Talk about anything and everything.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 3,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#2196F3',
                            icon: 'chat',
                            colorTheme: 'theme-general',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Introductions',
                            slug: 'introductions',
                            description: 'New to the community? Introduce yourself here!',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 4,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#9C27B0',
                            icon: 'hand-wave',
                            colorTheme: 'theme-introductions',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Feedback & Suggestions',
                            slug: 'feedback-suggestions',
                            description: 'Share your thoughts and ideas to improve the platform.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 5,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#FFC107',
                            icon: 'lightbulb',
                            colorTheme: 'theme-feedback',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Bug Reports',
                            slug: 'bug-reports',
                            description: 'Report any bugs or technical issues you encounter.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 6,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#F44336',
                            icon: 'bug',
                            colorTheme: 'theme-bugs',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Off-Topic',
                            slug: 'off-topic',
                            description: 'Discussions that don\'t fit anywhere else.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 7,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#607D8B',
                            icon: 'question',
                            colorTheme: 'theme-offtopic',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Gaming',
                            slug: 'gaming',
                            description: 'Discuss all things gaming.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 8,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#795548',
                            icon: 'gamepad',
                            colorTheme: 'theme-gaming',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Technology',
                            slug: 'technology',
                            description: 'Latest in tech news and discussions.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 9,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#673AB7',
                            icon: 'chip',
                            colorTheme: 'theme-tech',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Development',
                            slug: 'development',
                            description: 'Coding, programming, and software development.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 10,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#00BCD4',
                            icon: 'code',
                            colorTheme: 'theme-dev',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Creative Corner',
                            slug: 'creative-corner',
                            description: 'Share your art, writing, and other creative works.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 11,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#E91E63',
                            icon: 'palette',
                            colorTheme: 'theme-creative',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Marketplace',
                            slug: 'marketplace',
                            description: 'Buy, sell, and trade within the community.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 12,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#CDDC39',
                            icon: 'store',
                            colorTheme: 'theme-marketplace',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Support',
                            slug: 'support',
                            description: 'Get help and support for platform issues.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 13,
                            isVip: 0,
                            isLocked: 0,
                            minXp: 0,
                            color: '#009688',
                            icon: 'lifebuoy',
                            colorTheme: 'theme-support',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Rules & Guidelines',
                            slug: 'rules-guidelines',
                            description: 'Important rules and guidelines for the community.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 14,
                            isVip: 0,
                            isLocked: 1,
                            minXp: 0,
                            color: '#FF9800',
                            icon: 'gavel',
                            colorTheme: 'theme-rules',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                        {
                            name: 'Archive',
                            slug: 'archive',
                            description: 'Older discussions and resolved topics.',
                            parentId: null,
                            isZone: 0,
                            canonical: 0,
                            position: 15,
                            isVip: 0,
                            isLocked: 1,
                            minXp: 0,
                            color: '#757575',
                            icon: 'archive',
                            colorTheme: 'theme-archive',
                            isHidden: 0,
                            minGroupIdRequired: null,
                            pluginData: '{}',
                        },
                    ];
                    _i = 0, categoriesToSeed_1 = categoriesToSeed;
                    _a.label = 1;
                case 1:
                    if (!(_i < categoriesToSeed_1.length)) return [3 /*break*/, 9];
                    categoryData = categoriesToSeed_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, db_1.db.select().from(schema_1.forumCategories).where((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " = ", ""], ["", " = ", ""])), schema_1.forumCategories.slug, categoryData.slug)).limit(1)];
                case 3:
                    existingCategory = _a.sent();
                    if (!(existingCategory.length === 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, db_1.db.insert(schema_1.forumCategories).values(categoryData)];
                case 4:
                    _a.sent();
                    console.log("\u2705 Seeded category: ".concat(categoryData.name));
                    return [3 /*break*/, 6];
                case 5:
                    console.log("\u23ED\uFE0F Category already exists, skipping: ".concat(categoryData.name));
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error("\u274C Error seeding category ".concat(categoryData.name, ":"), error_1);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9:
                    console.log('✅ Forum categories seeding complete.');
                    return [2 /*return*/];
            }
        });
    });
}
// Only run if this file is executed directly
if (import.meta.url === "file://".concat(process.argv[1])) {
    seedForumCategories()
        .then(function () {
        console.log("✅ Forum category seeding complete.");
        process.exit(0);
    })
        .catch(function (err) {
        console.error("❌ Forum category seeding failed:", err);
        process.exit(1);
    });
}
var templateObject_1;
