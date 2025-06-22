#!/usr/bin/env tsx
/**
 * Comprehensive Seeding Script for DegenTalk
 * 
 * This script sets up a complete realistic testing environment following
 * the forum structure defined in README-FORUM.md and forumMap.config.ts
 * 
 * Usage:
 *   npm run seed:all           # Seed everything with existing data
 *   npm run seed:all -- --wipe # Wipe and reseed everything
 *   npm run seed:all -- --forums-only # Only seed forums and threads
 */

import { db } from '../../db';
import {
  users,
  forumCategories,
  threads,
  posts,
  threadPrefixes,
  tags,
  threadTags,
  postLikes
} from '../../db/schema';
import { faker } from '@faker-js/faker';
import { eq, inArray, isNotNull, desc, asc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import chalk from 'chalk';
import { parseArgs } from 'node:util';
import { seedForumsFromConfig } from './seedForumsFromConfig';
import { slugify } from '../db/utils/seedUtils';
import { seedShopItems } from '../../server/utils/shop-utils';
import { seedEconomySettings } from '../db/seed-economy-settings';
import { seedXpActions } from '../db/seed-xp-actions';
import { seedAvatarFrames } from './seed-avatar-frames';

// Configuration
const CONFIG = {
  USERS: {
    ADMIN_COUNT: 2,
    MOD_COUNT: 3,
    REGULAR_COUNT: 25,
    PASSWORD: 'password123'
  },
  THREADS: {
    PER_FORUM: {
      MIN: 1,
      MAX: 1
    },
    POSTS: {
      MIN: 2,
      MAX: 2
    },
    REPLY_CHANCE: 1,
    MAX_REPLY_DEPTH: 1
  },
  ENGAGEMENT: {
    LIKE_CHANCE: 0.3,
    TAG_CHANCE: 0.6,
    PREFIX_CHANCE: 0.4,
    STICKY_CHANCE: 0.05,
    LOCK_CHANCE: 0.02
  }
};

// Predefined realistic usernames for crypto/trading community
const REALISTIC_USERNAMES = [
  'diamondhands', 'paperhands', 'cryptowhale', 'moonboi', 'rektard',
  'hodlgang', 'btcmaxi', 'altcoinape', 'degentrader', 'shillmaster',
  'rugdoctor', 'pumpchaser', 'baghodler', 'alphahunter', 'chartist',
  'nftflipper', 'yieldfarmer', 'liquidator', 'arbitrageur', 'memecoin',
  'smartmoney', 'retailfomo', 'whalewatch', 'fisherman', 'crabmarket'
];

// Forum-specific thread topics for realistic content
const THREAD_TOPICS = {
  'live-trade-reacts': [
    'BTC just broke $45k resistance! 🚀',
    'REKT: Lost everything on this LINK trade',
    'ETH looking bullish on 4h chart',
    'This altseason is different... or is it?',
    'Liquidated $50k on SOL leverage trade'
  ],
  'shill-zone': [
    'Hidden gem: $TOKEN going to $100',
    'Why $COPE is the next 100x',
    'Anon insider leak: Major announcement coming',
    'This low cap is going to moon hard',
    'Dev just bought back 10% supply'
  ],
  'alpha-channel': [
    'Binance listing leak confirmed',
    'Whale accumulation spotted on chain',
    'Major partnership announcement tomorrow',
    'Smart money rotating into DeFi',
    'Institutional buying pressure building'
  ],
  'strategy-scripts': [
    'Martingale bot made me 10 BTC',
    'Anti-martingale strategy discussion',
    'House edge analysis for Dice',
    'Best risk management for high-roller',
    'Limbo probability calculations'
  ],
  'announcements': [
    'DegenTalk v2.0 Release Notes',
    'New XP System Launch',
    'Community Guidelines Update',
    'Maintenance Window Scheduled',
    'Bug Bounty Program Launch'
  ],
  'btc-analysis': [
    'BTC weekly chart analysis',
    'Support and resistance levels',
    'Hash rate correlation study',
    'Institutional adoption metrics',
    'On-chain analysis deep dive'
  ],
  'yield-farming': [
    'New 200% APY farm discovered',
    'Impermanent loss calculator',
    'Best stablecoin farming strategies',
    'Rug pull warning signs',
    'Cross-chain yield opportunities'
  ],
  'nft-calls': [
    'Pudgy Penguins floor rising',
    'New PFP project minting soon',
    'Blue chip NFT price predictions',
    'OpenSea volume analysis',
    'Upcoming NFT drops to watch'
  ]
};

// Content templates for different post types
const POST_TEMPLATES = {
  trade_result: [
    'Just closed my {position} on {token}. {result}! Took profit at {price}.',
    'Update on my {token} position: Currently {status}. Next target: {target}.',
    '{token} trade recap: Entry {entry}, Exit {exit}. {emotion}!'
  ],
  analysis: [
    'Looking at the {timeframe} chart for {token}, I see {pattern}.',
    'Technical analysis for {token}: {indicators} suggest {direction}.',
    'My {token} prediction: {prediction} based on {reasoning}.'
  ],
  discussion: [
    'What do you guys think about {topic}? I believe {opinion}.',
    'Hot take: {controversial_opinion}. Change my mind.',
    'Been thinking about {topic} lately. Here\'s my perspective: {view}.'
  ],
  question: [
    'Can someone explain {topic}? New to this and confused.',
    'What\'s the best way to {action}? Looking for advice.',
    'Help needed: Having trouble with {problem}. Any solutions?'
  ]
};

async function seedUsers() {
  console.log(chalk.blue('👥 Seeding users...'));
  
  const passwordHash = await bcrypt.hash(CONFIG.USERS.PASSWORD, 10);
  const users_to_insert = [];

  // Admin users
  users_to_insert.push(
    {
      username: 'degentalk_admin',
      email: 'admin@degentalk.com',
      password: passwordHash,
      role: 'admin' as const,
      xp: 50000,
      clout: 1000,
      level: 20,
      avatarUrl: '/assets/avatars/admin.png',
      isActive: true,
      isBanned: false,
      isVerified: true,
      bio: 'Lead administrator of DegenTalk. Here to keep the chaos organized.',
      signature: '🛡️ Admin | Keeping degens in line since 2024 | [TEST USER]',
      dgtWalletBalance: 10000,
      dgtPoints: 5000
    },
    {
      username: 'cryptosensei',
      email: 'sensei@degentalk.com', 
      password: passwordHash,
      role: 'admin' as const,
      xp: 45000,
      clout: 850,
      level: 18,
      avatarUrl: '/assets/avatars/sensei.png',
      isActive: true,
      isBanned: false,
      isVerified: true,
      bio: 'Trading since Bitcoin was $100. Here to share knowledge.',
      signature: '📈 "Buy the dip, sell the rip" - Ancient Crypto Wisdom | [TEST USER]',
      dgtWalletBalance: 8000,
      dgtPoints: 4500
    }
  );

  // Moderator users
  for (let i = 0; i < CONFIG.USERS.MOD_COUNT; i++) {
    const username = faker.helpers.arrayElement(REALISTIC_USERNAMES) + (Math.random() > 0.5 ? '_mod' : '');
    users_to_insert.push({
      username,
      email: faker.internet.email(),
      password: passwordHash,
      role: 'mod' as const,
      xp: faker.number.int({ min: 15000, max: 35000 }),
      clout: faker.number.int({ min: 300, max: 700 }),
      level: faker.number.int({ min: 12, max: 17 }),
      avatarUrl: '/assets/avatars/default.png',
      isActive: true,
      isBanned: false,
      isVerified: true,
      bio: faker.lorem.sentence(),
      signature: '🛡️ Moderator | Keeping the peace in degen land | [TEST USER]',
      dgtWalletBalance: faker.number.int({ min: 250, max: 5000 }),
      dgtPoints: faker.number.int({ min: 100, max: 5000 })
    });
  }

  // Regular users with realistic crypto personas
  for (let i = 0; i < CONFIG.USERS.REGULAR_COUNT; i++) {
    const baseUsername = faker.helpers.arrayElement(REALISTIC_USERNAMES);
    const username = baseUsername + (Math.random() > 0.7 ? faker.number.int({ min: 1, max: 999 }) : '');
    
    users_to_insert.push({
      username,
      email: faker.internet.email(),
      password: passwordHash,
      role: 'user' as const,
      xp: faker.number.int({ min: 50, max: 15000 }),
      clout: faker.number.int({ min: 10, max: 500 }),
      level: faker.number.int({ min: 1, max: 15 }),
      avatarUrl: '/assets/avatars/default.png',
      isActive: Math.random() > 0.1, // 90% active
      isBanned: Math.random() < 0.05, // 5% banned
      isVerified: Math.random() > 0.3, // 70% verified
      bio: faker.helpers.arrayElement([
        '🚀 Diamond hands since 2021',
        '📈 DeFi yield farmer',
        '🎲 High roller at the casino',
        '🖼️ NFT collector and trader',
        '⚡ Bitcoin maximalist',
        '🌙 Waiting for altseason',
        '💎 HODL gang member',
        '🔥 Meme coin degen'
      ]),
      signature: faker.helpers.arrayElement([
        'DYOR | NFA | WAGMI | [TEST USER]',
        'Not financial advice | [TEST USER]',
        'GM everyone! ☀️ | [TEST USER]',
        'Diamond hands 💎🙌 | [TEST USER]',
        'Wen moon? 🌙 | [TEST USER]',
        'HODL or die 💀 | [TEST USER]',
        'This is the way 🚀 | [TEST USER]'
      ]),
      dgtWalletBalance: faker.number.int({ min: 50, max: 2000 }),
      dgtPoints: faker.number.int({ min: 10, max: 2000 })
    });
  }

  // Deduplicate by username and email to avoid unique constraint violations
  const dedupByUsername = new Map<string, typeof users_to_insert[number]>();
  const dedupByEmail = new Map<string, typeof users_to_insert[number]>();

  for (const u of users_to_insert) {
    if (!dedupByUsername.has(u.username) && !dedupByEmail.has(u.email)) {
      dedupByUsername.set(u.username, u);
      dedupByEmail.set(u.email, u);
    }
  }

  const uniqueUsers = Array.from(dedupByUsername.values());

  // Insert, skipping any user that would conflict on username OR email
  await db
    .insert(users)
    .values(uniqueUsers)
    .onConflictDoNothing();

  console.log(chalk.green(`✅ Seeded ${users_to_insert.length} users`));
  return users_to_insert.length;
}

async function seedThreadsAndPosts() {
  console.log(chalk.blue('💬 Seeding realistic threads and posts...'));

  // Get all users and forums
  const all_users = await db.select().from(users).where(eq(users.isActive, true));
  const all_forums = await db.select().from(forumCategories)
    .where(eq(forumCategories.type, 'forum'))
    .orderBy(asc(forumCategories.position));

  if (all_users.length === 0) {
    throw new Error('No users found. Please seed users first.');
  }

  // Filter to leaf forums (not parent to other forums)
  const all_parent_ids = (await db
    .selectDistinct({ parentId: forumCategories.parentId })
    .from(forumCategories)
    .where(isNotNull(forumCategories.parentId)))
    .map(r => r.parentId)
    .filter(Boolean) as number[];

  const leaf_forums = all_forums.filter(forum => !all_parent_ids.includes(forum.id));
  
  console.log(chalk.gray(`Found ${leaf_forums.length} leaf forums to populate`));

  // Seed prefixes first
  await seedThreadPrefixes();
  await seedTags();

  const all_prefixes = await db.select().from(threadPrefixes);
  const all_tags = await db.select().from(tags);

  let total_threads = 0;
  let total_posts = 0;

  for (const forum of leaf_forums) {
    const threads_count = faker.number.int({
      min: CONFIG.THREADS.PER_FORUM.MIN,
      max: CONFIG.THREADS.PER_FORUM.MAX
    });

    console.log(chalk.cyan(`  📁 ${forum.name}: Creating ${threads_count} threads`));

    for (let i = 0; i < threads_count; i++) {
      await db.transaction(async (tx) => {
        // Create thread
        const author = faker.helpers.arrayElement(all_users);
        const thread_topics = THREAD_TOPICS[forum.slug as keyof typeof THREAD_TOPICS] || [
          'General discussion topic',
          'Question about the market',
          'Sharing my experience',
          'Looking for advice',
          'What do you think?'
        ];
        
        const title = faker.helpers.arrayElement(thread_topics);
        const slug = `${slugify(title)}-${faker.string.alphanumeric(6)}`;
        const created_at = faker.date.recent({ days: 30 });

        // Select prefix if available for this forum
        let prefix_id = null;
        if (Math.random() < CONFIG.ENGAGEMENT.PREFIX_CHANCE && all_prefixes.length > 0) {
          const plugin_data = forum.pluginData as any;
          const available_prefixes = plugin_data?.rules?.availablePrefixes;
          
          if (available_prefixes?.length > 0) {
            const prefix_name = faker.helpers.arrayElement(available_prefixes);
            const prefix = all_prefixes.find(p => p.name === prefix_name);
            if (prefix) prefix_id = prefix.id;
          } else {
            prefix_id = faker.helpers.arrayElement(all_prefixes).id;
          }
        }

        const [new_thread] = await tx.insert(threads).values({
          title,
          slug,
          categoryId: forum.id,
          userId: author.id,
          prefixId: prefix_id,
          isSticky: Math.random() < CONFIG.ENGAGEMENT.STICKY_CHANCE,
          isLocked: Math.random() < CONFIG.ENGAGEMENT.LOCK_CHANCE,
          viewCount: faker.number.int({ min: 1, max: 5000 }),
          createdAt: created_at,
          updatedAt: created_at
        }).returning();

        total_threads++;

        // Create posts for this thread
        const posts_count = faker.number.int({
          min: CONFIG.THREADS.POSTS.MIN,
          max: CONFIG.THREADS.POSTS.MAX
        });

        const thread_posts = [];
        let last_post_time = created_at;

        for (let j = 0; j < posts_count; j++) {
          const post_author = faker.helpers.arrayElement(all_users);
          last_post_time = faker.date.soon({ days: 5, refDate: last_post_time });

          // Determine if this is a reply
          let reply_to_id = null;
          let post_depth = 0;
          
          if (j > 0 && Math.random() < CONFIG.THREADS.REPLY_CHANCE && thread_posts.length > 0) {
            const potential_parents = thread_posts.filter(p => p.depth < CONFIG.THREADS.MAX_REPLY_DEPTH);
            if (potential_parents.length > 0) {
              const parent = faker.helpers.arrayElement(potential_parents);
              reply_to_id = parent.id;
              post_depth = parent.depth + 1;
            }
          }

          // Generate realistic content based on forum type
          let content = generateRealisticPostContent(forum.slug, j === 0);

          const [new_post] = await tx.insert(posts).values({
            threadId: new_thread.id,
            userId: post_author.id,
            content,
            isFirstPost: j === 0,
            replyToPostId: reply_to_id,
            depth: post_depth,
            likeCount: faker.number.int({ min: 0, max: 100 }),
            createdAt: last_post_time,
            updatedAt: last_post_time
          }).returning();

          thread_posts.push(new_post);
          total_posts++;

          // Add some likes to posts
          if (Math.random() < CONFIG.ENGAGEMENT.LIKE_CHANCE) {
            const likers = faker.helpers.arrayElements(
              all_users.filter(u => u.id !== post_author.id),
              faker.number.int({ min: 1, max: 10 })
            );

            for (const liker of likers) {
              await tx.insert(postLikes).values({
                postId: new_post.id,
                likedByUserId: liker.id
              }).onConflictDoNothing();
            }
          }
        }

        // Update thread with post counts and last post info
        const last_post = thread_posts[thread_posts.length - 1];
        await tx.update(threads).set({
          postCount: thread_posts.length,
          lastPostId: last_post.id,
          lastPostAt: last_post.createdAt,
          firstPostLikeCount: thread_posts[0]?.likeCount || 0
        }).where(eq(threads.id, new_thread.id));

        // Add tags to thread
        if (Math.random() < CONFIG.ENGAGEMENT.TAG_CHANCE && all_tags.length > 0) {
          const selected_tags = faker.helpers.arrayElements(all_tags, faker.number.int({ min: 1, max: 3 }));
          await tx.insert(threadTags).values(
            selected_tags.map(tag => ({ threadId: new_thread.id, tagId: tag.id }))
          ).onConflictDoNothing();
        }
      });
    }
  }

  console.log(chalk.green(`✅ Seeded ${total_threads} threads and ${total_posts} posts across all forums!`));
  return { threads: total_threads, posts: total_posts };
}

function generateRealisticPostContent(forumSlug: string, isFirstPost: boolean): string {
  const templates = isFirstPost ? POST_TEMPLATES.analysis : POST_TEMPLATES.discussion;
  
  const tokens = {
    position: faker.helpers.arrayElement(['long', 'short', 'spot']),
    token: faker.helpers.arrayElement(['BTC', 'ETH', 'SOL', 'AVAX', 'LINK', 'DOT']),
    result: faker.helpers.arrayElement(['Massive W', 'Big L', 'Small profit', 'Broke even']),
    price: `$${faker.number.int({ min: 100, max: 100000 })}`,
    entry: `$${faker.number.int({ min: 50, max: 50000 })}`,
    exit: `$${faker.number.int({ min: 60, max: 60000 })}`,
    target: `$${faker.number.int({ min: 200, max: 200000 })}`,
    emotion: faker.helpers.arrayElement(['WAGMI', 'NGMI', 'LFG', 'RIP']),
    timeframe: faker.helpers.arrayElement(['1h', '4h', '1d', '1w']),
    pattern: faker.helpers.arrayElement(['bull flag', 'bear trap', 'double bottom', 'head and shoulders']),
    indicators: faker.helpers.arrayElement(['RSI', 'MACD', 'Bollinger Bands', 'Moving averages']),
    direction: faker.helpers.arrayElement(['bullish', 'bearish', 'sideways']),
    topic: faker.helpers.arrayElement(['DeFi yields', 'NFT prices', 'memecoin season', 'altcoin rotation']),
    opinion: faker.helpers.arrayElement(['This is the top', 'We\'re still early', 'Bear market incoming', 'Bull run continues']),
    controversial_opinion: faker.helpers.arrayElement(['Bitcoin is dead', 'ETH will flip BTC', 'NFTs are worthless', 'DeFi is a scam'])
  };

  let template = faker.helpers.arrayElement(templates);
  
  // Replace tokens
  Object.entries(tokens).forEach(([key, value]) => {
    template = template.replace(new RegExp(`{${key}}`, 'g'), value);
  });

  return template;
}

async function seedThreadPrefixes() {
  const prefixes = [
    { name: 'URGENT', color: '#ff4444', bgColor: '#ff444420' },
    { name: 'DISCUSSION', color: '#4488ff', bgColor: '#4488ff20' },
    { name: 'GUIDE', color: '#44ff44', bgColor: '#44ff4420' },
    { name: 'QUESTION', color: '#ffaa44', bgColor: '#ffaa4420' },
    { name: 'SOLVED', color: '#88ff88', bgColor: '#88ff8820' }
  ];

  await db.insert(threadPrefixes).values(prefixes).onConflictDoNothing();
}

async function seedTags() {
  const tags = [
    { name: 'bitcoin', slug: 'bitcoin' },
    { name: 'ethereum', slug: 'ethereum' },
    { name: 'defi', slug: 'defi' },
    { name: 'nft', slug: 'nft' },
    { name: 'trading', slug: 'trading' },
    { name: 'analysis', slug: 'analysis' },
    { name: 'gambling', slug: 'gambling' },
    { name: 'strategy', slug: 'strategy' },
    { name: 'altcoin', slug: 'altcoin' },
    { name: 'memecoin', slug: 'memecoin' }
  ];

  await db.insert(tags).values(tags).onConflictDoNothing();
}

/**
 * Main seeding function
 */
async function main() {
  const args = parseArgs({
    options: {
      wipe: { type: 'boolean', default: false },
      'forums-only': { type: 'boolean', default: false }
    },
    allowPositionals: true
  });

  const startTime = Date.now();
  
  console.log(chalk.blue.bold('\n🚀 DegenTalk Comprehensive Seeding Script\n'));
  
  try {
    // Phase 1: Infrastructure
    console.log(chalk.yellow('📋 Phase 1: Setting up infrastructure...'));
    
    if (args.values.wipe) {
      console.log(chalk.red('⚠️  Wiping existing data...'));
      // Add wipe logic here if needed
    }

    // Seed forum structure
    await seedForumsFromConfig();
    
    // Seed economy and XP systems
    await seedEconomySettings();
    await seedXpActions();
    
    // Seed avatar frames
    await seedAvatarFrames();
    
    // Seed shop items
    await seedShopItems();

    if (!args.values['forums-only']) {
      // Phase 2: Users
      console.log(chalk.yellow('\n👥 Phase 2: Creating users...'));
      await seedUsers();

      // Phase 3: Content
      console.log(chalk.yellow('\n💬 Phase 3: Generating realistic content...'));
      await seedThreadsAndPosts();
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(chalk.green.bold(`\n✨ Seeding completed successfully in ${duration}s!`));
    console.log(chalk.cyan('\n🎯 Ready to go! Start the dev server with: npm run dev\n'));
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Seeding failed:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}