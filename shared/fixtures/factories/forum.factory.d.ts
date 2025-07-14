/**
 * Forum content factories for realistic crypto community discussions
 */
import { BaseFactory } from '../core/factory';
import type { Thread, Post, ForumCategory } from '@schema';
export declare class ThreadFactory extends BaseFactory<Thread> {
    private static readonly CRYPTO_THREAD_TITLES;
    private static readonly CRYPTO_TOKENS;
    private static readonly PRICE_TARGETS;
    private static readonly CRYPTO_TAGS;
    definition(): Partial<Thread>;
    private generateCryptoTitle;
    private slugify;
    protected getState(state: string): Partial<Thread>;
}
export declare class PostFactory extends BaseFactory<Post> {
    private static readonly CRYPTO_POST_TEMPLATES;
    private static readonly PATTERNS;
    private static readonly NEWS_TYPES;
    private static readonly OPINIONS;
    definition(): Partial<Post>;
    private generateCryptoContent;
    protected getState(state: string): Partial<Post>;
    private generateLongCryptoContent;
}
export declare class ForumCategoryFactory extends BaseFactory<ForumCategory> {
    private static readonly CRYPTO_FORUM_NAMES;
    definition(): Partial<ForumCategory>;
    private slugify;
    private generateForumDescription;
}
