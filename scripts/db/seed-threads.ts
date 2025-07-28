import 'dotenv/config';
import { db } from '../../db/index';
import { threads } from '../../db/schema/forum/threads';
import { posts } from '../../db/schema/forum/posts';
import { forumStructure } from '../../db/schema/forum/structure';
import { users } from '../../db/schema/user/users';
import { eq } from 'drizzle-orm';
import { logSeed } from './utils/seedUtils';
import type { UserId, StructureId } from '@shared/types/ids';

const SCRIPT_NAME = 'seed-threads';

// Thread titles by forum type
const THREAD_TITLES = {
  'the-pit': [
    "🚀 Bitcoin hitting $100k EOY - Here's why",
    "⚠️ WARNING: New DeFi scam targeting wallets",
    "💎 Hidden gem alert: $PEPE mooning soon?",
    "📊 Daily market analysis thread",
    "🎯 Airdrop hunting strategies that actually work"
  ],
  'market-analysis': [
    "📈 Technical Analysis: BTC breaking out of descending triangle",
    "🔮 ETH 2025 price prediction thread",
    "📊 Weekly altcoin watchlist - December 2024",
    "🎯 Support and resistance levels for major cryptos",
    "💹 Market sentiment analysis using on-chain data"
  ],
  'shill-zone': [
    "🚀 $TURBO - The next 100x memecoin (NFA)",
    "💎 Found this gem on BSC - early AF",
    "🔥 New L2 launching next week - don't miss out",
    "🌙 To the moon with $MOON - community growing fast",
    "⚡ Lightning fast DEX with revenue sharing"
  ],
  'live-trade-reacts': [
    "LIVE: Trading BTC breakout right now",
    "💰 Just opened a long on ETH at $3200",
    "🔴 Closing my SOL position - here's why",
    "📺 Streaming my trading session - join in!",
    "⚡ Quick scalp on AVAX - in and out"
  ],
  'casino-floor': [
    "🎰 Best crypto casinos for 2024",
    "🃏 Poker tournament this weekend - who's in?",
    "🎲 New dice strategy - 90% win rate",
    "💰 Won 5 ETH on slots - withdrawal proof",
    "🎮 GameFi with actual gambling mechanics"
  ],
  'defi-lab': [
    "🧪 New yield farming strategy - 300% APY",
    "⚗️ Testing impermanent loss calculator",
    "🔬 Deep dive into ve(3,3) tokenomics",
    "💡 Innovative lending protocol analysis",
    "🛡️ Security audit results for new protocols"
  ],
  default: [
    "Welcome to our community!",
    "General discussion thread",
    "Questions and answers",
    "Share your thoughts",
    "Community guidelines reminder"
  ]
};

// Post content templates
const POST_CONTENT = [
  "This is exactly what I've been thinking! The market dynamics are shifting rapidly and we need to adapt our strategies accordingly.",
  "I disagree with your analysis. Here's why: [detailed explanation with charts and data]",
  "Great post! I've been following this project for months and the team has been delivering consistently.",
  "Be careful everyone. I've seen similar patterns before and it didn't end well. Always DYOR.",
  "Can someone explain this in simpler terms? I'm new to crypto and trying to learn.",
  "Thanks for sharing! I just checked their GitHub and the code looks solid. Might ape in with a small bag.",
  "This aged well 😂",
  "LFG! 🚀🚀🚀 Who else is bullish?",
  "Not financial advice but I'm loading up here. The risk/reward is too good to pass up.",
  "Remember to take profits along the way. Nobody ever went broke taking profits."
];

async function seedThreads() {
  logSeed(SCRIPT_NAME, '🧵 Starting thread seeding...');

  try {
    // Get all forums (not zones)
    const forums = await db
      .select()
      .from(forumStructure)
      .where(eq(forumStructure.type, 'forum'));

    logSeed(SCRIPT_NAME, `Found ${forums.length} forums to populate with threads`);

    // Get some users to be thread authors
    const allUsers = await db.select().from(users).limit(20);
    if (allUsers.length === 0) {
      logSeed(SCRIPT_NAME, '❌ No users found. Please run seed:users first.');
      return;
    }

    let totalThreadsCreated = 0;
    let totalPostsCreated = 0;

    for (const forum of forums) {
      // Get appropriate thread titles for this forum
      const titles = THREAD_TITLES[forum.slug] || THREAD_TITLES.default;
      const threadsToCreate = Math.min(titles.length, 5);
      
      logSeed(SCRIPT_NAME, `Creating ${threadsToCreate} threads in ${forum.name}...`);

      for (let i = 0; i < threadsToCreate; i++) {
        const author = allUsers[Math.floor(Math.random() * allUsers.length)];
        const title = titles[i];
        const slug = title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 100);

        try {
          // Create thread
          const [thread] = await db.insert(threads).values({
            structureId: forum.id as StructureId,
            userId: author.id as UserId,
            title,
            slug,
            isSticky: i === 0 && Math.random() > 0.7, // First thread might be sticky
            isLocked: false,
            isSolved: title.includes('?') && Math.random() > 0.5
          }).returning();

          totalThreadsCreated++;

          // Create initial post
          const [initialPost] = await db.insert(posts).values({
            threadId: thread.id,
            userId: author.id as UserId,
            content: `${title}\n\n${POST_CONTENT[0]}\n\nWhat do you all think?`
          }).returning();

          totalPostsCreated++;

          // Add 2-5 replies from different users
          const replyCount = Math.floor(Math.random() * 4) + 2;
          for (let j = 0; j < replyCount; j++) {
            const replyAuthor = allUsers[Math.floor(Math.random() * allUsers.length)];
            const replyContent = POST_CONTENT[Math.floor(Math.random() * POST_CONTENT.length)];

            await db.insert(posts).values({
              threadId: thread.id,
              userId: replyAuthor.id as UserId,
              content: replyContent
            });

            totalPostsCreated++;
          }

        } catch (error) {
          logSeed(SCRIPT_NAME, `⚠️ Failed to create thread "${title}": ${error.message}`);
        }
      }
    }

    logSeed(SCRIPT_NAME, `✅ Created ${totalThreadsCreated} threads with ${totalPostsCreated} posts`);

  } catch (error) {
    logSeed(SCRIPT_NAME, `❌ Thread seeding failed: ${error.message}`);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedThreads()
    .then(() => {
      logSeed(SCRIPT_NAME, '✅ Thread seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Thread seeding failed:', error);
      process.exit(1);
    });
}

export { seedThreads };