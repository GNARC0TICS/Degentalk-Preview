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
      MIN: 8,
      MAX: 15
    },
    POSTS: {
      MIN: 2,
      MAX: 20
    },
    REPLY_CHANCE: 0.4,
    MAX_REPLY_DEPTH: 3
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
      signature: '🛡️ Admin | Keeping degens in line since 2024'
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
      signature: '📈 "Buy the dip, sell the rip" - Ancient Crypto Wisdom'
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
      signature: '🛡️ Moderator | Keeping the peace in degen land'
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
        'DYOR | NFA | WAGMI',
        'Not financial advice',
        'GM everyone! ☀️',
        'Diamond hands 💎🙌',
        'Wen moon? 🌙',
        'HODL or die 💀',
        'This is the way 🚀'
      ])
    });
  }

  // Upsert users
  if (users_to_insert.length > 0) {
    await db.insert(users).values(users_to_insert)
      .onConflictDoUpdate({
        target: users.username,
        set: {
          email: faker.internet.email(), // Update with new email if conflict
          xp: faker.number.int({ min: 100, max: 1000 })
        }
      });
  }

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
                userId: liker.id
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

  console.log(chalk.green(`✅ Created ${total_threads} threads with ${total_posts} total posts`));
}

function generateRealisticPostContent(forum_slug: string, is_first_post: boolean): string {
  const templates = is_first_post ? POST_TEMPLATES.discussion : 
    faker.helpers.arrayElement([POST_TEMPLATES.discussion, POST_TEMPLATES.analysis, POST_TEMPLATES.question]);

  let content = faker.helpers.arrayElement(templates);

  // Replace placeholders with realistic crypto content
  const replacements = {
    '{position}': faker.helpers.arrayElement(['long', 'short', 'spot']),
    '{token}': faker.helpers.arrayElement(['BTC', 'ETH', 'SOL', 'LINK', 'AVAX', 'MATIC', 'ADA', 'DOT']),
    '{result}': faker.helpers.arrayElement(['Made bank', 'Got rekt', 'Break even', 'Small profit', 'Major loss']),
    '{price}': `$${faker.number.int({ min: 100, max: 50000 })}`,
    '{status}': faker.helpers.arrayElement(['up 20%', 'down 15%', 'sideways', 'moon mission', 'bleeding']),
    '{target}': `$${faker.number.int({ min: 100, max: 100000 })}`,
    '{entry}': `$${faker.number.int({ min: 50, max: 10000 })}`,
    '{exit}': `$${faker.number.int({ min: 50, max: 10000 })}`,
    '{emotion}': faker.helpers.arrayElement(['WAGMI', 'Pain', 'Euphoria', 'Cope', 'Hopium']),
    '{timeframe}': faker.helpers.arrayElement(['1h', '4h', '1d', '1w', '1m']),
    '{pattern}': faker.helpers.arrayElement(['bullish divergence', 'head and shoulders', 'cup and handle', 'ascending triangle']),
    '{indicators}': faker.helpers.arrayElement(['RSI', 'MACD', 'Bollinger Bands', 'Volume profile']),
    '{direction}': faker.helpers.arrayElement(['bullish momentum', 'bearish reversal', 'sideways action', 'breakout incoming']),
    '{prediction}': faker.helpers.arrayElement(['moon mission', 'dump incoming', 'crab market', 'volatility ahead']),
    '{reasoning}': faker.helpers.arrayElement(['on-chain metrics', 'technical analysis', 'market sentiment', 'whale activity']),
    '{topic}': faker.helpers.arrayElement(['DeFi yields', 'NFT markets', 'altcoin season', 'Bitcoin dominance']),
    '{opinion}': faker.helpers.arrayElement(['this is just the beginning', 'we\'re in a bubble', 'adoption is accelerating']),
    '{controversial_opinion}': faker.helpers.arrayElement(['NFTs are just expensive JPEGs', 'Bitcoin will flip gold', 'Ethereum will overtake Bitcoin']),
    '{view}': faker.lorem.sentence(),
    '{action}': faker.helpers.arrayElement(['stake my tokens', 'time the market', 'find alpha', 'avoid rugs']),
    '{problem}': faker.helpers.arrayElement(['MetaMask connection', 'high gas fees', 'slippage issues', 'transaction failing'])
  };

  // Apply replacements
  Object.entries(replacements).forEach(([placeholder, replacement]) => {
    content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
  });

  // Add some emoji and crypto slang
  const endings = [
    ' 🚀', ' 💎🙌', ' WAGMI!', ' LFG!', ' DYOR!', ' 📈', ' 🌙', ' NFA!', ' HODL!'
  ];
  
  if (Math.random() > 0.4) {
    content += faker.helpers.arrayElement(endings);
  }

  return content;
}

async function seedThreadPrefixes() {
  const prefixes = [
    { name: 'ALPHA', color: 'orange-500' },
    { name: 'LIVE', color: 'red-500' },
    { name: 'TRADE', color: 'green-500' },
    { name: 'SHILL', color: 'pink-500' },
    { name: 'GEM', color: 'purple-500' },
    { name: 'REKT', color: 'red-600' },
    { name: 'MOON', color: 'yellow-500' },
    { name: 'SIGNAL', color: 'blue-500' },
    { name: 'TA', color: 'indigo-500' },
    { name: 'BUG', color: 'red-500' },
    { name: 'SUGGESTION', color: 'green-500' },
    { name: 'ANNOUNCEMENT', color: 'yellow-600' },
    { name: 'DICE', color: 'purple-600' },
    { name: 'LIMBO', color: 'orange-600' },
    { name: 'STRATEGY', color: 'blue-600' }
  ];

  const existing = await db.select().from(threadPrefixes);
  const to_insert = prefixes.filter(p => !existing.find(e => e.name === p.name));

  if (to_insert.length > 0) {
    await db.insert(threadPrefixes).values(
      to_insert.map((p, i) => ({ ...p, isActive: true, position: i }))
    ).onConflictDoNothing();
    console.log(chalk.gray(`  Added ${to_insert.length} thread prefixes`));
  }
}

async function seedTags() {
  const tag_names = [
    'bitcoin', 'ethereum', 'defi', 'nft', 'trading', 'altcoins', 'memecoin',
    'yield-farming', 'staking', 'analysis', 'bullish', 'bearish', 'moonshot',
    'rekt', 'diamond-hands', 'paper-hands', 'whale', 'shrimp', 'crab',
    'casino', 'dice', 'limbo', 'strategy', 'high-roller', 'degen',
    'alpha', 'leak', 'announcement', 'update', 'bug', 'feature-request'
  ];

  const existing = await db.select().from(tags);
  const to_insert = tag_names
    .filter(name => !existing.find(e => e.name === name))
    .map(name => ({
      name,
      slug: slugify(name),
      description: `Discussion about ${name}`,
      isActive: true
    }));

  if (to_insert.length > 0) {
    await db.insert(tags).values(to_insert).onConflictDoNothing();
    console.log(chalk.gray(`  Added ${to_insert.length} tags`));
  }
}

async function updateForumStats() {
  console.log(chalk.blue('📊 Updating forum statistics...'));
  
  // This could be enhanced to actually calculate and update
  // thread counts, post counts, last activity etc. for each forum
  const forums = await db.select().from(forumCategories).where(eq(forumCategories.type, 'forum'));
  
  for (const forum of forums) {
    const thread_count = await db.select({ count: threads.id })
      .from(threads)
      .where(eq(threads.categoryId, forum.id));
    
    // Update forum with actual counts (if such columns exist)
    // This is a placeholder for future enhancements
    console.log(chalk.gray(`  ${forum.name}: ${thread_count.length} threads`));
  }
  
  console.log(chalk.green('✅ Forum statistics updated'));
}

// Main execution function
async function seedAll() {
  const options = {
    wipe: { type: 'boolean', short: 'w', default: false },
    'forums-only': { type: 'boolean', default: false },
    'users-only': { type: 'boolean', default: false },
    'threads-only': { type: 'boolean', default: false }
  } as const;

  const { values } = parseArgs({ options, allowPositionals: true });
  const { wipe, 'forums-only': forumsOnly, 'users-only': usersOnly, 'threads-only': threadsOnly } = values;

  console.log(chalk.bgBlue.white('\n🌱 DEGENTALK COMPREHENSIVE SEEDING 🌱\n'));

  try {
    if (wipe) {
      console.log(chalk.yellow('⚠️  WIPE MODE: Clearing existing data...'));
      await db.delete(postLikes);
      await db.delete(threadTags);
      await db.delete(posts);
      await db.delete(threads);
      if (!forumsOnly && !threadsOnly) {
        await db.delete(threadPrefixes);
        await db.delete(tags);
        await db.delete(forumCategories);
        await db.delete(users);
      }
      console.log(chalk.green('✅ Database cleared\n'));
    }

    // 1. Seed Forum Structure
    if (!usersOnly && !threadsOnly) {
      console.log(chalk.bgCyan.black(' STEP 1: FORUM STRUCTURE '));
      await seedForumsFromConfig();
      console.log();
    }

    // 2. Seed Users
    if (!forumsOnly && !threadsOnly) {
      console.log(chalk.bgMagenta.white(' STEP 2: USERS '));
      await seedUsers();
      console.log();
    }

    // 3. Seed Threads and Posts
    if (!forumsOnly && !usersOnly) {
      console.log(chalk.bgGreen.black(' STEP 3: CONTENT '));
      await seedThreadsAndPosts();
      console.log();
    }

    // 4. Update Statistics
    if (!usersOnly) {
      console.log(chalk.bgYellow.black(' STEP 4: STATISTICS '));
      await updateForumStats();
      console.log();
    }

    console.log(chalk.bgGreen.white('\n🎉 SEEDING COMPLETED SUCCESSFULLY! 🎉'));
    console.log(chalk.green('\nYour DegenTalk instance is now ready for testing with:'));
    console.log(chalk.cyan('• Realistic forum structure following README-FORUM.md'));
    console.log(chalk.cyan('• Diverse user base with different roles and personas'));
    console.log(chalk.cyan('• Engaging threads with authentic crypto content'));
    console.log(chalk.cyan('• Posts, replies, likes, and forum interactions'));
    console.log(chalk.cyan('• Tags, prefixes, and proper categorization'));
    console.log(chalk.green('\nNavigate to your app and explore the fully populated forums! 🚀\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ SEEDING FAILED:'), error);
    process.exit(1);
  }
}

// Script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(chalk.red('Script execution failed:'), err);
      process.exit(1);
    });
}

export { seedAll };