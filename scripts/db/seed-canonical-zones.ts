// CANONICAL FORUM STRUCTURE SEEDER
// Source of truth: @forum-canon.mdc, @implementation-plan-canon-v1.md
// ... existing code ...
// In each forum object inside EXPANDABLE_ZONES, add:
// isVip: false, minXp: 0 if not present
// ... existing code ... 

import { db } from '../../server/src/core/db';
import { forumCategories, threads as threadsTable, posts as postsTable, users as usersTable } from '@shared/schema';
import { sql, eq, and, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs'; // For password hashing
import { randomUUID } from 'crypto'; // For UUID generation

// Source of truth: docs/forum/implementation-plan-canon-v1.md

const PRIMARY_ZONES_DATA = [
  { id: 1, name: "The Pit", slug: "the-pit", description: "Raw, unfiltered, and often unhinged. Welcome to the heart of degen discussion.", icon: "🔥", colorTheme: "theme-pit", position: 1 },
  { id: 2, name: "Mission Control", slug: "mission-control", description: "Strategic discussions, alpha, and project deep dives. For the serious degen.", icon: "🎯", colorTheme: "theme-mission", position: 2 },
  { id: 3, name: "The Casino Floor", slug: "the-casino-floor", description: "Trading, gambling, and high-stakes plays. May the odds be ever in your favor.", icon: "🎰", colorTheme: "theme-casino", position: 3 },
  { id: 4, name: "The Briefing Room", slug: "the-briefing-room", description: "News, announcements, and official updates. Stay informed.", icon: "📝", colorTheme: "theme-briefing", position: 4 },
  { id: 5, name: "The Archive", slug: "the-archive", description: "Historical records, past glories, and lessons learned. For the degen historian.", icon: "📚", colorTheme: "theme-archive", position: 5 },
];

const EXPANDABLE_ZONES_DATA = [
  {
    id: 6, name: "Market Moves", slug: "market-moves", description: "Price action, TA, coin calls, and degenerate optimism.", colorTheme: "#facc15", icon: "chart-line", position: 1,
    forums: [
      { id: 7, name: "Signals & TA", slug: "signals-ta", description: "Charts, predictions, and hopium.", position: 1, icon: "📊" },
      { id: 8, name: "Moonshots", slug: "moonshots", description: "Low cap gems and 1000x dreams.", position: 2, icon: "🚀" },
      { id: 9, name: "Red Flags", slug: "red-flags", description: "Scam alerts and project warnings.", position: 3, icon: "🚩" },
    ],
  },
  {
    id: 10, name: "Alpha & Leaks", slug: "alpha-leaks", description: "Early plays, token gossip, and stuff you shouldn't know.", colorTheme: "#4ade80", icon: "eye-slash", position: 2,
    forums: [
      { id: 11, name: "Token Intel", slug: "token-intel", description: "Deep dives and fundamental analysis.", position: 1, icon: "🧠" },
      { id: 12, name: "Pre-sales & Whitelists", slug: "presales-whitelists", description: "Get in early, get out rekt (or rich).", position: 2, icon: "🎟️" },
      { id: 13, name: "Screenshots & Leaks", slug: "screenshots-leaks", description: "Allegedly.", position: 3, icon: "📸" },
    ],
  },
  {
    id: 14, name: "Casino & DeGen", slug: "casino-degen", description: "Wagers, rage posts, and unsolicited strategies.", colorTheme: "#f87171", icon: "dice", position: 3,
    forums: [
      { id: 15, name: "Limbo & Dice", slug: "limbo-dice", description: "Max bets and prayer circles.", position: 1, icon: "🎲" },
      { id: 16, name: "Mines & Keno", slug: "mines-keno", description: "Click, click, boom (or lambo).", position: 2, icon: "💣" },
      { id: 17, name: "Rage Logs", slug: "rage-logs", description: "Vent your losses, share your pain.", position: 3, icon: "😠" },
    ],
  },
  {
    id: 18, name: "Builder's Terminal", slug: "builders-terminal", description: "Dev logs, debugging, tool drops, and builder cope.", colorTheme: "#60a5fa", icon: "terminal", position: 4,
    forums: [
      { id: 19, name: "Dev Diaries", slug: "dev-diaries", description: "Share your project journey.", position: 1, icon: "📓" },
      { id: 20, name: "Code & Snippets", slug: "code-snippets", description: "Useful code for fellow builders.", position: 2, icon: "💾" },
      { id: 21, name: "Tool Drops", slug: "tool-drops", description: "New apps, libraries, and utilities.", position: 3, icon: "🔧" },
    ],
  },
  {
    id: 22, name: "Airdrops & Quests", slug: "airdrops-quests", description: "Click. Grind. Pray. Share your links here.", colorTheme: "#a78bfa", icon: "gift", position: 5,
    forums: [
      { id: 23, name: "Quests & Tasks", slug: "quests-tasks", description: "All the Galxe, Zealy, and Layer3 grind.", position: 1, icon: "✅" },
      { id: 24, name: "Claim Links", slug: "claim-links", description: "Direct links to airdrop claims.", position: 2, icon: "🔗" },
      { id: 25, name: "Referral Events", slug: "referral-events", description: "Share your ref links, pyramid together.", position: 3, icon: "🤝" },
    ],
  },
  {
    id: 26, name: "Web3 Culture & News", slug: "web3-culture-news", description: "Drama, memes, launches, and chain wars.", colorTheme: "#f472b6", icon: "newspaper", position: 6,
    forums: [
      { id: 27, name: "General News", slug: "general-news", description: "Industry updates and major announcements.", position: 1, icon: "📰" },
      { id: 28, name: "Memes & Satire", slug: "memes-satire", description: "For the culture.", position: 2, icon: "🐸" },
      { id: 29, name: "Chain Fights", slug: "chain-fights", description: "ETH vs SOL vs BTC maxis. Go.", position: 3, icon: "⚔️" },
    ],
  },
  {
    id: 30, name: "Beginner's Portal", slug: "beginners-portal", description: "No stupid questions. Only bad answers.", colorTheme: "#93c5fd", icon: "baby", position: 7,
    forums: [
      { id: 31, name: "Getting Started", slug: "getting-started", description: "New to crypto? Start here.", position: 1, icon: "👋" },
      { id: 32, name: "Terminology", slug: "terminology", description: "WTF is DeFi, L2, or MEV?", position: 2, icon: "❓" },
      { id: 33, name: "Wallets & Safety", slug: "wallets-safety", description: "How not to get drained 101.", position: 3, icon: "🛡️" },
    ],
  },
  {
    id: 34, name: "Shill & Promote", slug: "shill-promote", description: "Projects, referrals, and maybe your OnlyFans.", colorTheme: "#34d399", icon: "bullhorn", position: 8,
    forums: [
      { id: 35, name: "Token Shills", slug: "token-shills", description: "Your coin, your conviction (or delusion).", position: 1, icon: "📢" },
      { id: 36, name: "Casino Referrals", slug: "casino-referrals", description: "Share those sweet ref bonuses.", position: 2, icon: "🔗" },
      { id: 37, name: "Self-Promo", slug: "self-promo", description: "Promote your services, content, etc.", position: 3, icon: "💡" },
    ],
  },
  {
    id: 38, name: "Marketplace", slug: "marketplace", description: "Buy, sell, flip, or get scammed. DYOR.", colorTheme: "#fcd34d", icon: "store", position: 9,
    forums: [
      { id: 39, name: "Buy & Sell", slug: "buy-sell", description: "P2P trading for goods and services.", position: 1, icon: "💸" },
      { id: 40, name: "Services", slug: "services", description: "Offer or request Web3 services.", position: 2, icon: "🛠️" },
      { id: 41, name: "Free Stuff", slug: "free-stuff", description: "Giveaways and freebies.", position: 3, icon: "🎁" },
    ],
  },
  {
    id: 42, name: "Forum HQ", slug: "forum-hq", description: "Site updates, feedback, suggestions, and bug reports.", colorTheme: "#9ca3af", icon: "cog", position: 10, isCanonicalSidebar: true,
    forums: [
      { id: 43, name: "Announcements", slug: "announcements", description: "Official DegenTalk news.", position: 1, icon: "📣" },
      { id: 44, name: "Suggestions", slug: "suggestions", description: "How can we make this place better?", position: 2, icon: "📝" },
      { id: 45, name: "Bug Reports", slug: "bug-reports", description: "Found a bug? Let us know.", position: 3, icon: "🐞" },
    ],
  },
];

// Strategic color palette for primary zones and forums
const ZONE_COLOR_MAP: Record<string, string> = {
  "The Pit": "#f87171", // Red
  "Mission Control": "#60a5fa", // Blue
  "The Casino Floor": "#facc15", // Yellow
  "The Briefing Room": "#a78bfa", // Purple
  "The Archive": "#9ca3af", // Gray
  // Add more as needed
};
const DEFAULT_FORUM_COLOR = "#6366f1"; // Indigo as a fallback

// Helper: Ensure icon is an emoji, fallback to 📁
function ensureEmojiIcon(icon: string | undefined): string {
  if (!icon) return '📁';
  // Regex for emoji (Unicode)
  return /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(icon) ? icon : '📁';
}

async function seedCanonicalZonesInternal() {
  console.log("Starting canonical zone seeding...");

  console.log("Clearing existing forum categories, threads, and posts...");
  await db.delete(postsTable);
  await db.delete(threadsTable);
  await db.delete(forumCategories);
  console.log("Cleared existing data.");

  console.log("Seeding Primary Zones...");
  for (const zone of PRIMARY_ZONES_DATA) {
    await db.insert(forumCategories).values({
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      description: zone.description,
      type: 'zone',
      parentId: null,
      icon: ensureEmojiIcon(zone.icon),
      color: ZONE_COLOR_MAP[zone.name] || DEFAULT_FORUM_COLOR, // Strategic color
      colorTheme: zone.colorTheme,
      position: zone.position,
      isVip: 0, 
      isLocked: 0, 
      minXp: 0, 
      isHidden: 0, 
      pluginData: '{}',
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${PRIMARY_ZONES_DATA.length} Primary Zones.`);

  console.log("Seeding Expandable Zones and their Child Forums...");
  let expandableCount = 0;
  let childForumCount = 0;
  for (const category of EXPANDABLE_ZONES_DATA) {
    const insertedCategoryResult = await db.insert(forumCategories).values({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      type: 'category',
      parentId: null,
      icon: ensureEmojiIcon(category.icon),
      color: category.colorTheme || DEFAULT_FORUM_COLOR, // Use colorTheme or fallback
      colorTheme: null,
      position: category.position,
      isVip: 0, 
      isLocked: 0, 
      minXp: 0, 
      isHidden: 0, 
      pluginData: '{}',
    }).onConflictDoNothing().returning({ insertedId: forumCategories.id });
    expandableCount++;

    const parentId = insertedCategoryResult[0]?.insertedId ?? category.id;

    if (category.forums && category.forums.length > 0) {
      for (const forum of category.forums) {
        await db.insert(forumCategories).values({
          id: forum.id,
          name: forum.name,
          slug: forum.slug,
          description: forum.description,
          type: 'forum',
          parentId: parentId,
          icon: ensureEmojiIcon(forum.icon),
          color: DEFAULT_FORUM_COLOR,
          colorTheme: null,
          position: forum.position,
          isVip: 0, 
          isLocked: 0, 
          minXp: 0, 
          isHidden: 0, 
          pluginData: '{}',
        }).onConflictDoNothing();
        childForumCount++;
      }
    }
  }
  console.log(`Seeded ${expandableCount} Expandable Zones and ${childForumCount} Child Forums.`);
  console.log("Canonical zone seeding completed.");
}

export const seedCanonicalZones = seedCanonicalZonesInternal;

async function getOrCreateSeedUser() {
  // Use Drizzle query to check for existing user
  const existingUser = await db.select({ user_id: usersTable.id }).from(usersTable).where(eq(usersTable.username, 'seed_user')).limit(1);
  
  if (!existingUser || existingUser.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userUuid = randomUUID();
    
    // Insert seed user using Drizzle ORM with required fields
    const [newUser] = await db.insert(usersTable).values({
      uuid: userUuid,
      username: 'seed_user',
      email: 'seed_user@example.com',
      password: hashedPassword,
      role: 'admin',
      xp: 1000,
      level: 5,
      clout: 50
    }).returning({ user_id: usersTable.id });
    
    console.log("Created seed_user with admin role.");
    return { id: newUser.user_id };
  }
  
  return { id: existingUser[0].user_id };
}

const THREADS_TO_SEED = [
  // Market Moves -> Signals & TA
  { categorySlug: "signals-ta", title: "SOL to $1000 or cope harder?", content: "Thinking of swinging a long here. Anyone riding this pump? Charts look bullish AF."}, 
  { categorySlug: "signals-ta", title: "BTC Dominance Peaking? AltSZN Imminent?", content: "Seeing a lot of chatter about BTC.D topping out. Are we finally going to see alts fly?"},
  // Market Moves -> Moonshots
  { categorySlug: "moonshots", title: "New microcap: DogeGoblinX ($DGX) - 1000x Potential?", content: "Community looks strong. Contract verified. Just aped my life savings. What y'all think?"},
  { categorySlug: "moonshots", title: "Which AI coin has the best narrative for this cycle?", content: "TAO, FET, AGIX, or some new unvetted Chinese AI coin? Discuss."}, 
  // Market Moves -> Red Flags
  { categorySlug: "red-flags", title: "WARNING: Rugpull on 'SafeGalaxyMoonShot' Token", content: "Devs just dumped all their tokens and disabled chat. Avoid this one!"}, 
  // Alpha & Leaks -> Token Intel
  { categorySlug: "token-intel", title: "Deep Dive: The REAL utility of $BLAST", content: "Beyond the ponzinomics, is there actual long-term value here? My analysis."}, 
  // Alpha & Leaks -> Pre-sales & Whitelists
  { categorySlug: "presales-whitelists", title: "Got a WL spot for 'PixelPals Arena'. Worth it?", content: "The art looks decent, but team is anon. Anyone else looking into this?"}, 
  // Alpha & Leaks -> Screenshots & Leaks
  { categorySlug: "screenshots-leaks", title: "Alleged Binance Listing Next Week - Big Exchange, Small Coin!", content: "Source is 'trust me bro' but posted a screenshot that looks legit. DYOR!"},
  // Casino & DeGen -> Limbo & Dice
  { categorySlug: "limbo-dice", title: "Just hit a 1000x on Limbo! AMA!", content: "Literally shaking. Turned $10 into $10k. Proof posted."}, 
  // Casino & DeGen -> Mines & Keno
  { categorySlug: "mines-keno", title: "24 Mines, 1 Bomb strategy - Consistent Profit?", content: "Been trying this out, seems to work okay for small gains. Anyone else use this?"}, 
  // Casino & DeGen -> Rage Logs
  { categorySlug: "rage-logs", title: "Casino drained me again. FML.", content: "Down 3 ETH. Do NOT bet after chest day. I hate everything."}, 
  // Builder's Terminal -> Dev Diaries
  { categorySlug: "dev-diaries", title: "Devlog #01 – Building a PerpDEX on Base", content: "Documenting my smart contract project, open to collabs. Looking for feedback on the architecture."}, 
  // Builder's Terminal -> Code & Snippets
  { categorySlug: "code-snippets", title: "Useful Python script for batch sending transactions", content: "Here's a little script I wrote to automate sending to multiple addresses. Hope it helps someone!"},
  // Builder's Terminal -> Tool Drops
  { categorySlug: "tool-drops", title: "New Telegram Bot for Tracking On-Chain Votes", content: "Just launched a bot that pings you for new DAO proposals on chains you select."}, 
  // Airdrops & Quests -> Quests & Tasks
  { categorySlug: "quests-tasks", title: "LayerZero V2 Airdrop - All tasks listed here", content: "Consolidated list of all known L0 V2 tasks to maximize your allocation."}, 
  // Airdrops & Quests -> Claim Links
  { categorySlug: "claim-links", title: "Airdrop: ZKToken live on Linea - Claim NOW!", content: "Go claim here before it ends — ZKT worth $40+ if you did the testnet."}, 
  // Airdrops & Quests -> Referral Events
  { categorySlug: "referral-events", title: "Stake Casino - Deposit Bonus + Rakeback Ref Link", content: "Use my link for extra goodies on Stake. We all win (except the house, maybe)."},
  // Web3 Culture & News -> General News
  { categorySlug: "general-news", title: "SEC sues another CEX - Who's next?", content: "This is getting ridiculous. When will they provide clear guidelines instead of just suing everyone?"},
  // Web3 Culture & News -> Memes & Satire
  { categorySlug: "memes-satire", title: "Post your best 'this is fine' crypto memes", content: "Market dumping? Rug pull? Exchange hacked? Drop your finest cope memes here."}, 
  // Web3 Culture & News -> Chain Fights
  { categorySlug: "chain-fights", title: "Vitalik vs Justin Sun thread (again)", content: "He called Tron a 'centralized joke' lmao. Thoughts? Is ETH any better?"},
  // Beginner's Portal -> Getting Started
  { categorySlug: "getting-started", title: "New to crypto, where do I even begin?", content: "Heard about Bitcoin on the news, decided to jump in. What are the first steps?"},
  // Beginner's Portal -> Terminology
  { categorySlug: "terminology", title: "What the heck is 'MEV' and why should I care?", content: "Keep seeing this term. ELI5 please!"},
  // Beginner's Portal -> Wallets & Safety
  { categorySlug: "wallets-safety", title: "Best hardware wallet for noobs? Ledger or Trezor?", content: "Just got my first SOL. Don't wanna get drained. Which one is easier and safer?"},
  // Shill & Promote -> Token Shills
  { categorySlug: "token-shills", title: "$DEGENX - The Future of Decentralized Gambling - Backed by GIGABRAINS", content: "This is the next 1000x, team is based, tech is solid, presale ending SOON! NFA DYOR!"},
  // Shill & Promote -> Casino Referrals
  { categorySlug: "casino-referrals", title: "BC.Game Referral Code - Get Free Spins & Bonus", content: "Use my ref code for BC.Game and get some freebies. Good luck!"},
  // Shill & Promote -> Self-Promo
  { categorySlug: "self-promo", title: "Shilling my TG sniper bot project – tip based!", content: "Telegram sniper bot I coded myself. Tips appreciated if you make bank with it! DM for details."}, 
  // Marketplace -> Buy & Sell
  { categorySlug: "buy-sell", title: "Selling my Ledger Nano X - Barely Used", content: "Switched to a Tangem, looking to sell my old Ledger. DM offers."}, 
  // Marketplace -> Services
  { categorySlug: "services", title: "Offering Web3 smart contract audit services (cheap!)", content: "Experienced solidity dev. Will audit your contracts for a reasonable fee. Pay in USDT or SOL."}, 
  // Marketplace -> Free Stuff
  { categorySlug: "free-stuff", title: "Giving away old crypto conference t-shirts", content: "Got a bunch of t-shirts from ETH Denver, Consensus, etc. Just pay shipping."}, 
  // Forum HQ -> Announcements
  { categorySlug: "announcements", title: "New Feature: User Titles and Badges Unlocked!", content: "Check out the new titles and badges you can earn by participating in the forum!"}, 
  // Forum HQ -> Suggestions
  { categorySlug: "suggestions", title: "Can we get a dark mode toggle that actually works?", content: "The current one is a bit janky. Would love a true OLED dark mode."}, 
  // Forum HQ -> Bug Reports
  { categorySlug: "bug-reports", title: "Bug: Thread reactions not loading on mobile", content: "Clicking the reaction icon shows nothing on my iPhone. Anyone else having this issue?"},
];

async function seedDevUser() {
  const devUsername = 'dev_user';
  const devEmail = 'dev@degen.talk';
  const devPassword = 'devpassword123';
  const devSignature = 'I am the dev. 👨‍💻';

  // Check if user exists
  const existing = await db.select({ user_id: usersTable.id }).from(usersTable).where(eq(usersTable.username, devUsername)).limit(1);
  const hashedPassword = await bcrypt.hash(devPassword, 10);
  console.log('DEBUG: hashedPassword for dev_user:', hashedPassword);
  if (existing.length === 0) {
    const userUuid = randomUUID();
    await db.insert(usersTable).values({
      uuid: userUuid,
      username: devUsername,
      email: devEmail,
      password: hashedPassword,
      role: 'admin',
      signature: devSignature,
      isVerified: true,
      isActive: true,
      level: 10,
      xp: 10000,
      clout: 1000
    });
    console.log(`✅ Seeded dev user: ${devUsername} / ${devEmail} / ${devPassword}`);
  } else {
    await db.update(usersTable)
      .set({
        email: devEmail,
        password: hashedPassword,
        role: 'admin',
        signature: devSignature,
        isVerified: true,
        isActive: true,
        level: 10,
        xp: 10000,
        clout: 1000
      })
      .where(eq(usersTable.id, existing[0].user_id));
    console.log(`✅ Updated dev user: ${devUsername} / ${devEmail} / ${devPassword}`);
  }
}

async function seedInitialThreads() {
  console.log("Seeding initial threads...");
  // Use dev user for all threads
  const devUser = await db.select({ user_id: usersTable.id }).from(usersTable).where(eq(usersTable.username, 'dev_user')).limit(1);
  let userId: number;
  if (devUser.length === 0) {
    await seedDevUser();
    const newDevUser = await db.select({ user_id: usersTable.id }).from(usersTable).where(eq(usersTable.username, 'dev_user')).limit(1);
    userId = newDevUser[0].user_id;
  } else {
    userId = devUser[0].user_id;
  }
  // Get all forums (child forums)
  interface ForumInfo {
    id: number;
    slug: string;
    name: string;
  }

  const forums: ForumInfo[] = await db.select({ 
    id: forumCategories.id, 
    slug: forumCategories.slug, 
    name: forumCategories.name 
  }).from(forumCategories).where(sql`parent_id IS NOT NULL`);
  
  const categoryMap = new Map<string, ForumInfo>(forums.map(f => [f.slug, f]));
  // Map of forum slug to threads to seed
  const threadsByForum: Record<string, { title: string; content: string }[]> = {};
  for (const thread of THREADS_TO_SEED) {
    if (!threadsByForum[thread.categorySlug]) threadsByForum[thread.categorySlug] = [];
    threadsByForum[thread.categorySlug].push({ title: thread.title, content: thread.content });
  }
  let seededThreadsCount = 0;
  for (const [slug, forumInfo] of categoryMap.entries()) {
    const threadsForForum = threadsByForum[slug] || [
      { title: `Welcome to ${forumInfo.name}!`, content: `This is the first thread in ${forumInfo.name}. Start the discussion!` }
    ];
    for (const threadData of threadsForForum) {
      const threadSlug = threadData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 250);
      const existingThread = await db.select().from(threadsTable).where(sql`slug = ${threadSlug} AND category_id = ${forumInfo.id}`).limit(1);
      if (!existingThread || existingThread.length === 0) {
        const threadUuid = randomUUID();
        const postUuid = randomUUID();
        const baseViews = Math.floor(Math.random() * 400) + 50;
        const postCount = Math.floor(Math.random() * 25) + 1;
        const likeCount = Math.floor(Math.random() * 30) + 1;
        const hoursOld = Math.random() * 72;
        const hotScore = (baseViews + (postCount * 3) + (likeCount * 2)) / Math.pow(hoursOld + 2, 1.2);
        const lastPostTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000));
        // Insert thread
        const [insertedThread] = await db.insert(threadsTable).values({
          uuid: threadUuid,
          title: threadData.title,
          slug: threadSlug,
          categoryId: forumInfo.id,
          userId: userId,
          viewCount: baseViews,
          postCount: postCount,
          hotScore: Math.round(hotScore * 100) / 100,
          lastPostAt: lastPostTime,
          isSticky: Math.random() < 0.05,
          isHidden: false,
          isDeleted: false
        }).returning({ thread_id: threadsTable.id });
        // Insert first post
        await db.insert(postsTable).values({
          uuid: postUuid,
          threadId: insertedThread.thread_id,
          userId: userId,
          content: threadData.content,
          isFirstPost: true,
          likeCount: likeCount,
          isHidden: false,
          isDeleted: false
        });
        console.log(`✅ Seeded thread: "${threadData.title}" in forum: ${forumInfo.name} (slug: ${slug})`);
        seededThreadsCount++;
      }
    }
  }
  console.log(`Seeded ${seededThreadsCount} threads across all forums.`);
}

async function main() {
  try {
    await seedCanonicalZones();
    await seedDevUser();
    await seedInitialThreads();
    // Verify data
    const totalCategories: { count: number | string }[] = await db.select({ count: sql`count(*)` }).from(forumCategories);
    const totalThreads: { count: number | string }[] = await db.select({ count: sql`count(*)` }).from(threadsTable);
    console.log(`Verification: Total Categories: ${totalCategories[0].count}, Total Threads: ${totalThreads[0].count}`);
    const lastCategory = await db.select().from(forumCategories).orderBy(sql`category_id DESC`).limit(1);
    console.log("Last category ID inserted: ", lastCategory[0]?.id || 'none');

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
}

main();
