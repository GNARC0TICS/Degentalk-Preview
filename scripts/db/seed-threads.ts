import { db, pool } from '@db';
import { 
  users, 
  forumCategories, 
  threads, 
  posts, 
  threadPrefixes, 
  tags, 
  threadTags,
  postReactions,
  // Types that might be needed for Insert operations or function signatures
  type InsertThread, type InsertPost, type InsertTag, type InsertThreadTag, type InsertPostReaction
} from './utils/schema'; // Corrected import path
import { eq, isNull, count } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

// Forum-specific thread content templates
const forumThreadContent = {
  // Core Discussion
  'The Pit': [
    {
      title: "Best practices for risk management in crypto trading",
      content: "<p>I've been trading for about 2 years now and wanted to share some risk management practices that have saved me from liquidation multiple times.</p><p>1. Never risk more than 2% of your portfolio on a single trade</p><p>2. Always use stop losses, even on 'sure things'</p><p>3. Take profits in stages - don't try to time the exact top</p><p>What risk management strategies do you all use?</p>",
      tags: ['Trading', 'Strategy', 'Mindset']
    },
    {
      title: "How do you handle market volatility?",
      content: "<p>Just survived another 20% swing and I'm curious how you all handle the emotional roller coaster of crypto volatility.</p><p>Do you have specific strategies you use to stay calm? Do you simply ignore the charts? Or have you developed some kind of zen-like detachment?</p><p>For me, I've started setting much longer timeframes for my investments and I find that helps me avoid panic reactions.</p>",
      tags: ['Mindset', 'Trading', 'Strategy']
    },
    {
      title: "DCA vs Lump Sum - What's your strategy?",
      content: "<p>Been debating whether to put a decent chunk of cash into my favorite projects now or to DCA over the next few months.</p><p>With the recent market movements, what's your approach? Do you prefer dollar cost averaging or lump sum investments?</p><p>What factors do you consider when making this decision? Time in market vs. timing the market, current market conditions, project fundamentals?</p>",
      tags: ['Trading', 'Strategy', 'Bitcoin']
    }
  ],
  'Brag or Bust': [
    {
      title: "Turned $500 into $15k with this low cap gem!",
      content: "<p>Just had to share this win! Found a small DeFi project last month that was flying under the radar. Did my research on the team, tokenomics, and their roadmap - everything checked out.</p><p>Put in $500 and just sold half my position for $15k! Project has real utility and is still relatively unknown.</p><p>Remember to always DYOR, but sometimes these moonshots do work out if you're careful.</p><p>Anyone else catch a nice pump recently?</p>",
      tags: ['DeFi', 'Altcoins', 'Trading']
    },
    {
      title: "Lost 70% of portfolio on leveraged trades - lessons learned",
      content: "<p>Just wanted to share my painful experience with leverage trading so others might avoid my mistakes.</p><p>Got overconfident after a few successful trades and increased my leverage to 10x. You can guess what happened next - one sudden price drop and my positions got liquidated.</p><p>Lost about 70% of my portfolio in a single day. The worst part? The market recovered just hours later.</p><p>Lessons learned: 1) Never use high leverage 2) Don't trade with money you can't afford to lose 3) Don't chase losses</p>",
      tags: ['Trading', 'Mindset']
    }
  ],
  // Market Moves
  'Technical Analysis': [
    {
      title: "BTC forming a clear bull flag - analysis and potential targets",
      content: "<p>Looking at the 4H chart for BTC, we're seeing a clear bull flag formation after the recent run up from $60k to $73k.</p><p>Volume profile confirms accumulation in this range, and the 50EMA is providing solid support.</p><p>If this formation plays out as expected, we could see a move to $78-80k range in the next couple weeks.</p><p>I've attached my chart analysis with key levels. What do you think? Are you seeing the same pattern?</p>",
      tags: ['Bitcoin', 'Technical', 'Trading']
    },
    {
      title: "RSI divergence: reliable or overrated?",
      content: "<p>I've been tracking RSI divergences on multiple timeframes and comparing them to actual price movements. My results are mixed at best.</p><p>While classic bearish divergences on the daily seem to often predict corrections, bullish divergences on lower timeframes appear less reliable.</p><p>Has anyone done extensive backtresting on RSI divergences? What's your experience with them as trading signals?</p><p>Would love to see some data-backed insights rather than just opinions.</p>",
      tags: ['Technical', 'Trading', 'Strategy']
    }
  ],
  'ETH & BTC Talk': [
    {
      title: "Ethereum's new scaling roadmap - implications for L2s",
      content: "<p>With the latest Ethereum development update, it's clear the team is focusing heavily on rollups and data availability.</p><p>This shift seems bullish for zkRollups in particular, but potentially challenging for optimistic rollups with longer withdrawal periods.</p><p>What are your thoughts on how L2s will evolve alongside Ethereum's scaling roadmap? Will certain L2s become obsolete or will there be room for multiple scaling approaches?</p>",
      tags: ['ETH', 'Layer2', 'DeFi']
    },
    {
      title: "Bitcoin halving historically: Separating fact from hype",
      content: "<p>With the halving approaching, I've analyzed previous halvings and their impact on price both short and long term.</p><p>While the mainstream narrative is that halvings directly cause bull runs, the data shows a more nuanced picture:</p><p>- 2012: Significant price increase began before halving and accelerated after</p><p>- 2016: Modest initial impact, major run 12+ months after</p><p>- 2020: Similar to 2016, major run after significant delay</p><p>What are your expectations for this upcoming halving, and why might this cycle be different or similar?</p>",
      tags: ['Bitcoin', 'Trading', 'Market']
    }
  ],
  // Alpha & Leaks
  'Alpha Drops': [
    {
      title: "Institutional liquidity moving to smaller L1s - insider info",
      content: "<p>Just had an interesting conversation with someone working at a crypto-focused hedge fund. They mentioned that several institutions are quietly accumulating positions in smaller L1s with strong developer activities.</p><p>Specifically mentioned were chains with EVM compatibility, low transaction costs, and unique scaling approaches.</p><p>Anyone else hearing similar rumors or seeing unusual movements in these markets?</p>",
      tags: ['Altcoins', 'Insider', 'Trading']
    },
    {
      title: "Three DeFi protocols testing groundbreaking lending model",
      content: "<p>Through some connections, I found out about three major DeFi protocols currently testing a new risk-adjusted lending model that could significantly reduce liquidations during market volatility.</p><p>The model uses a dynamic collateralization ratio that adjusts based on market conditions rather than fixed thresholds.</p><p>Could be a game changer for lending platforms if implemented properly. Worth watching closely over the next quarter.</p>",
      tags: ['DeFi', 'Alpha', 'Strategy']
    }
  ],
  // Default content for other forums
  'default': [
    {
      title: "Getting started with crypto: Essential resources",
      content: "<p>After helping several friends get into crypto recently, I've compiled a list of essential resources I think everyone should check out:</p><p>1. Bitcoin whitepaper - still the best foundation for understanding crypto</p><p>2. Andreas Antonopoulos' talks on YouTube - great beginner-friendly explanations</p><p>3. Finematics for DeFi concepts</p><p>4. CoinBureau for general market updates</p><p>What resources would you add to this list?</p>",
      tags: ['Beginner', 'Bitcoin', 'ETH', 'DeFi']
    },
    {
      title: "Securing your crypto: Hardware wallets vs. Smart contract wallets",
      content: "<p>I'm evaluating different wallet options for long-term storage and daily use.</p><p>Hardware wallets like Ledger/Trezor seem best for security, but newer smart contract wallets offer features like social recovery and batched transactions.</p><p>What's your wallet setup? Do you use different solutions for different purposes? Any recommendations for a balance of security and usability?</p>",
      tags: ['Security', 'Hardware', 'Web3']
    }
  ]
};

const replyTemplates = [
  // Supportive replies
  "<p>Great analysis! I've been watching the same pattern and completely agree with your assessment.</p><p>One additional factor worth considering is the increasing institutional involvement we're seeing lately.</p>",
  "<p>Thanks for sharing your insights. This is exactly the kind of content that makes this forum valuable.</p><p>I've had similar experiences and would add that timing is also critical in these situations.</p>",
  "<p>Solid breakdown of the situation. I've been thinking along similar lines but hadn't connected all the dots yet.</p>",
  
  // Questioning/challenging replies
  "<p>Interesting perspective, but I'm not entirely convinced. Have you considered the regulatory implications?</p><p>Recent statements from the SEC suggest a different direction that could impact this analysis.</p>",
  "<p>I see where you're coming from, but the data I'm looking at shows a different pattern.</p><p>Check out this analysis from [respected source] that points to a possible alternative outcome.</p>",
  "<p>While I appreciate the thoughtful post, I think you might be overlooking some key market dynamics.</p><p>Specifically, the derivatives market is showing significant counter-positioning to this narrative.</p>",
  
  // Adding information
  "<p>To add to this excellent discussion: I've been tracking on-chain movements that support this thesis.</p><p>Large wallets have been accumulating steadily during the recent price action, suggesting smart money sees value at these levels.</p>",
  "<p>Great points all around. For those interested in diving deeper, check out the research paper published by [University/Research Group] last month.</p><p>They provide empirical evidence that strongly correlates with this analysis.</p>",
  
  // Technical discussions
  "<p>If you look at the weekly chart with Bollinger Bands and the 50/200 EMAs, you'll see we're approaching a critical decision point.</p><p>The last three times we've seen this setup, it's resulted in a 30%+ move within 2 weeks.</p>",
  "<p>I ran some backtests on this strategy across multiple market cycles. The results are promising but very dependent on market volatility conditions.</p><p>In low-vol environments, win rate drops from 68% to about 43%.</p>"
];

// 1. Define canonical primary zones
const PRIMARY_ZONES = [
  { name: 'The Pit', description: 'Raw, unfiltered, and often unhinged. Welcome to the heart of degen discussion.', icon: '��', colorTheme: 'pit', canonical: true },
  { name: 'Mission Control', description: 'Strategic discussions, alpha, and project deep dives. For the serious degen.', icon: '🎯', colorTheme: 'mission', canonical: true },
  { name: 'The Casino Floor', description: 'Trading, gambling, and high-stakes plays. May the odds be ever in your favor.', icon: '🎰', colorTheme: 'casino', canonical: true },
  { name: 'The Briefing Room', description: 'News, announcements, and official updates. Stay informed.', icon: '📝', colorTheme: 'briefing', canonical: true },
  { name: 'The Archive', description: 'Historical records, past glories, and lessons learned. For the degen historian.', icon: '📚', colorTheme: 'archive', canonical: true },
];

// 2. Define canonical categories and their child forums
const CATEGORIES = [
  {
    name: 'Market Moves',
    description: 'Price action, TA, coin calls, and degenerate optimism.',
    forums: [
      { name: 'Signals & TA', description: 'Charts, predictions, and hopium.' },
      { name: 'Moonshots', description: 'Low cap gems and 1000x dreams.' },
      { name: 'Red Flags', description: 'Scam alerts and project warnings.' },
    ],
  },
  // Add more categories as needed
];

async function upsertForumCategory({ name, slug, description, parentId = null, isZone = false, canonical = false, position = 0, colorTheme = null, icon = 'hash' }: { name: string, slug: string, description: string, parentId?: number | null, isZone?: boolean, canonical?: boolean, position?: number, colorTheme?: string | null | undefined, icon?: string }) {
  let existing;
  if (parentId === null) {
    existing = await db.select().from(forumCategories).where(sql`name = ${name} AND parent_id IS NULL`);
  } else {
    existing = await db.select().from(forumCategories).where(sql`name = ${name} AND parent_id = ${parentId}`);
  }
  if (existing && existing.length > 0) {
    await db.update(forumCategories)
      .set({ description, is_zone: isZone, canonical, position, color_theme: colorTheme, icon })
      .where(sql`category_id = ${existing[0].id}`);
    return existing[0].id;
  } else {
    const [inserted] = await db.insert(forumCategories)
      .values({ name, slug, description, parent_id: parentId, is_zone: isZone, canonical, position, color_theme: colorTheme, icon })
      .returning({ id: forumCategories.id });
    return inserted.id;
  }
}

// Helper to generate a URL-safe, unique slug
function generateSlug(name: string, usedSlugs: Set<string>): string {
  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let slug = baseSlug;
  let attempt = 1;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${attempt}`;
    attempt++;
  }
  usedSlugs.add(slug);
  return slug;
}

async function upsertAllForums(usedSlugs: Set<string>) {
  // 1. Upsert primary zones
  for (let i = 0; i < PRIMARY_ZONES.length; i++) {
    const zone = PRIMARY_ZONES[i];
    const slug = generateSlug(zone.name, usedSlugs);
    const id = await upsertForumCategory({
      name: zone.name,
      slug,
      description: zone.description,
      isZone: true,
      canonical: true,
      position: i,
      colorTheme: zone.colorTheme || null,
      icon: zone.icon
    });
    console.log(`✅ Upserted primary zone: ${zone.name} (id: ${id}, slug: ${slug})`);
  }
  // 2. Upsert categories and child forums
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const catSlug = generateSlug(cat.name, usedSlugs);
    const catId = await upsertForumCategory({
      name: cat.name,
      slug: catSlug,
      description: cat.description,
      isZone: false,
      canonical: false,
      position: i
    });
    console.log(`✅ Upserted category: ${cat.name} (id: ${catId}, slug: ${catSlug})`);
    for (let j = 0; j < cat.forums.length; j++) {
      const forum = cat.forums[j];
      const forumSlug = generateSlug(forum.name, usedSlugs);
      const forumId = await upsertForumCategory({
        name: forum.name,
        slug: forumSlug,
        description: forum.description,
        parentId: catId,
        isZone: false,
        canonical: false,
        position: j
      });
      console.log(`  ↳ Upserted child forum: ${forum.name} (id: ${forumId}, slug: ${forumSlug}) under category ${cat.name}`);
    }
  }
}

async function seedThreads() {
  console.log('🌱 Seeding thread data...');

  // Upsert all forums before seeding threads
  const usedSlugs = new Set<string>();
  await upsertAllForums(usedSlugs);

  // After upsertAllForums, re-query all forums for thread seeding
  const allForumsList = await db.select({
    id: forumCategories.id,
    name: forumCategories.name,
    parentId: forumCategories.parentId,
    isZone: forumCategories.isZone,
    canonical: forumCategories.canonical,
    slug: forumCategories.slug
  })
  .from(forumCategories)
  .where(eq(forumCategories.isHidden, false));

  // Forums with canHaveThreads: true are:
  // - Primary zones: isZone: true, canonical: true, parentId: null
  // - Child forums: isZone: false, parentId != null
  const forums = allForumsList.filter(forum =>
    (forum.isZone && forum.canonical && forum.parentId === null) ||
    (!forum.isZone && forum.parentId !== null)
  );
  if (forums.length === 0) {
    throw new Error('No forums found after upsert. This should not happen.');
  }
  console.log(`🔎 Forums to seed threads in: ${forums.map(f => f.name).join(', ')}`);
  
  // Get available users 
  const usersList = await db.select({ id: users.id }).from(users);
  if (usersList.length === 0) {
    throw new Error('No users found. Please seed users first.');
  }
  
  // Get available thread prefixes
  const prefixesList = await db.select({ id: threadPrefixes.id, name: threadPrefixes.name }).from(threadPrefixes);
  const prefixesMap = new Map(prefixesList.map(prefix => [prefix.name, prefix.id]));
  
  // Create or get tags
  const tagsMap = new Map<string, number>();
  // Get existing tags
  const existingTags = await db.select({ id: tags.id, name: tags.name }).from(tags);
  existingTags.forEach(tag => {
    tagsMap.set(tag.name, tag.id);
  });
  
  // Check if threads already exist
  const [threadCount] = await db.select({ count: count() }).from(threads);
  
  if (Number(threadCount?.count) > 0) {
    console.log(`🔍 ${threadCount.count} threads already exist.`);
    
    // Force recreate threads
    console.log(`🧹 Clearing existing threads and related data...`);
    await db.delete(threadTags);
    await db.delete(postReactions);
    await db.delete(posts);
    await db.delete(threads);
    console.log(`✅ Existing thread data cleared.`);
    
    // Reset sequences for threads and posts
    console.log(`🔄 Resetting sequences for threads and posts...`);
    await db.execute(sql`ALTER SEQUENCE threads_thread_id_seq RESTART WITH 1;`);
    await db.execute(sql`ALTER SEQUENCE posts_post_id_seq RESTART WITH 1;`);
    console.log(`✅ Sequences reset.`);
  }
  
  // Generate threads for each forum
  for (const forum of forums) {
    if (!forum || !forum.id || !forum.name) {
      console.error('Skipping undefined or invalid forum:', forum);
      continue;
    }
    // Guarantee forum has a slug
    let forumSlug = forum.slug;
    if (!forumSlug) {
      forumSlug = generateSlug(forum.name, usedSlugs);
      await db.update(forumCategories).set({ slug: forumSlug }).where(eq(forumCategories.id, forum.id));
      console.log(`🛠️  Added missing slug for forum: ${forum.name} (id: ${forum.id}, slug: ${forumSlug})`);
    }
    console.log(`📝 Creating threads for forum: ${forum.name} (id: ${forum.id}, slug: ${forumSlug})`);
    // Get the thread templates for this forum, or use default if none exist
    const forumTemplates = forumThreadContent[forum.name] || forumThreadContent['default'];
    let threadsCreated = 0;
    // Always create at least one thread per forum
    const templatesToUse = forumTemplates && forumTemplates.length > 0 ? forumTemplates : [{
      title: `Welcome to ${forum.name}`,
      content: `<p>This is the first thread in ${forum.name}. Start the discussion!</p>`,
      tags: ['General']
    }];
    for (const template of templatesToUse) {
      // Generate thread data
      const title = template.title;
      
      // Generate a unique slug by checking the database for conflicts
      let slug = generateSlug(title, usedSlugs);
      
      const userId = usersList[Math.floor(Math.random() * usersList.length)]?.id;
      if (!userId) {
        console.error('No valid user found for thread, skipping. Forum:', forum);
        continue;
      }
      const isSticky = Math.random() < 0.2; // 20% chance thread is sticky
      const isLocked = Math.random() < 0.1; // 10% chance thread is locked
      
      // Assign a relevant prefix based on content if available
      let prefixId: number | null = null;
      if (title.toLowerCase().includes('analysis') || title.toLowerCase().includes('chart')) {
        prefixId = typeof prefixesMap.get('Technical') === 'number' ? prefixesMap.get('Technical') : null;
      } else if (title.toLowerCase().includes('guide') || title.toLowerCase().includes('how to')) {
        prefixId = typeof prefixesMap.get('Guide') === 'number' ? prefixesMap.get('Guide') : null;
      } else if (title.toLowerCase().includes('strategy')) {
        prefixId = typeof prefixesMap.get('Strategy') === 'number' ? prefixesMap.get('Strategy') : null;
      } else if (title.toLowerCase().includes('alpha') || title.toLowerCase().includes('insider')) {
        prefixId = typeof prefixesMap.get('Leak') === 'number' ? prefixesMap.get('Leak') : null;
      } else if (title.toLowerCase().includes('scam') || title.toLowerCase().includes('warning')) {
        prefixId = typeof prefixesMap.get('Scam Alert') === 'number' ? prefixesMap.get('Scam Alert') : null;
      } else if (prefixesList.length > 0 && Math.random() < 0.3) { // 30% chance of random prefix for other threads
        const randomPrefix = prefixesList[Math.floor(Math.random() * prefixesList.length)];
        prefixId = randomPrefix && typeof randomPrefix.id === 'number' ? randomPrefix.id : null;
      } else if (prefixesList.length === 0) {
        console.warn('No thread prefixes available. Skipping prefix assignment.');
        prefixId = null;
      }
      
      // Insert thread
      const [thread] = await db.insert(threads)
        .values({
          title,
          slug,
          categoryId: forum.id,
          userId,
          prefixId,
          isSticky,
          isLocked,
          viewCount: Math.floor(Math.random() * 100) + 20, // More realistic view counts
          isSolved: false, // Will be updated later if a solution is marked
        })
        .returning({ id: threads.id });

      // Generate first post (OP) using the template content
      const [firstPost] = await db.insert(posts)
        .values({
          threadId: thread.id,
          userId,
          content: template.content,
          isFirstPost: true,
          likeCount: Math.floor(Math.random() * 10) + 2, // More realistic like counts
        })
        .returning({ id: posts.id, createdAt: posts.createdAt });

      // Generate likes for first post
      const likeCount = Math.floor(Math.random() * 7) + 3; // 3-10 likes
      for (let l = 0; l < likeCount; l++) {
        const likerUserId = usersList[Math.floor(Math.random() * usersList.length)].id;
        if (likerUserId !== userId) { // Don't like your own post
          try {
            await db.insert(postReactions)
              .values({
                userId: likerUserId,
                postId: firstPost.id,
                reactionType: 'like'
              });
          } catch (error) {
            // Ignore duplicate like errors
          }
        }
      }
      
      // Generate 3-10 replies using the reply templates
      const replyCount = Math.floor(Math.random() * 8) + 3; // 3-10 replies
      const replyPosts: any[] = [];
      
      for (let j = 0; j < replyCount; j++) {
        const replyUserId = usersList[Math.floor(Math.random() * usersList.length)].id;
        const replyContent = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
        
        const [reply] = await db.insert(posts)
          .values({
            threadId: thread.id,
            userId: replyUserId,
            content: replyContent,
            likeCount: Math.floor(Math.random() * 5),
          })
          .returning({ id: posts.id, createdAt: posts.createdAt, userId: posts.userId });
        
        replyPosts.push(reply);
        
        // Generate likes for reply
        const replyLikeCount = Math.floor(Math.random() * 4); // 0-3 likes
        for (let l = 0; l < replyLikeCount; l++) {
          const likerUserId = usersList[Math.floor(Math.random() * usersList.length)].id;
          if (likerUserId !== replyUserId) { // Don't like your own post
            try {
              await db.insert(postReactions)
                .values({
                  userId: likerUserId,
                  postId: reply.id,
                  reactionType: 'like'
                });
            } catch (error) {
              // Ignore duplicate like errors
            }
          }
        }
      }
      
      // Randomly mark one reply as solution (for 40% of threads)
      const shouldHaveSolution = Math.random() < 0.4 && replyPosts.length > 0;
      
      if (shouldHaveSolution) {
        // Pick a random reply to be the solution
        const solutionPost = replyPosts[Math.floor(Math.random() * replyPosts.length)];
        if (solutionPost && solutionPost.id) {
          // Update thread with solving post
          await db.update(threads)
            .set({ 
              solvingPostId: solutionPost.id,
              isSolved: true
            })
            .where(eq(threads.id, thread.id));
          console.log(`  ✅ Thread "${title}" marked as solved with post ID ${solutionPost.id}`);
        }
      }
      
      // Update thread's lastPostId, lastPostAt, and postCount
      if (replyPosts.length > 0) {
        const lastPost = replyPosts[replyPosts.length - 1];
        if (lastPost && lastPost.id && lastPost.createdAt) {
          await db.update(threads)
            .set({ 
              lastPostId: lastPost.id,
              lastPostAt: lastPost.createdAt,
              postCount: replyCount + 1 // First post + replies
            })
            .where(eq(threads.id, thread.id));
        }
      }
      
      // Add the tags from the template to the thread
      if (template.tags && template.tags.length > 0) {
        for (const tagName of template.tags) {
          // Get the tag ID, or find a similar tag if exact match not found
          const exactTag = existingTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          let tagId = exactTag?.id;
          
          // If no exact match, look for similar tags
          if (!tagId) {
            const similarTag = existingTags.find(t => 
              t.name.toLowerCase().includes(tagName.toLowerCase()) || 
              tagName.toLowerCase().includes(t.name.toLowerCase())
            );
            tagId = similarTag?.id;
          }
          
          // If we have a tag ID, add it to the thread
          if (tagId) {
            try {
              await db.insert(threadTags)
                .values({
                  threadId: thread.id,
                  tagId
                });
            } catch (error) {
              // Ignore duplicate tag errors
            }
          }
        }
      }
      threadsCreated++;
    }
    if (threadsCreated === 0) {
      // Fallback: create a generic thread
      const title = `Welcome to ${forum.name}`;
      let slug = generateSlug(title, usedSlugs);
      let slugIsUnique = false;
      let attempt = 0;
      while (!slugIsUnique) {
        const existing = await db.select().from(threads).where(sql`slug = ${slug}`).limit(1);
        if (!existing || existing.length === 0) {
          slugIsUnique = true;
        } else {
          slug = `${slug}-${forum.id}${attempt > 0 ? '-' + Math.floor(Math.random() * 1000) : ''}`;
          attempt++;
        }
      }
      const userId = usersList[Math.floor(Math.random() * usersList.length)]?.id;
      if (!userId) continue;
      const [thread] = await db.insert(threads)
        .values({
          title,
          slug,
          categoryId: forum.id,
          userId,
          isSticky: false,
          isLocked: false,
          viewCount: Math.floor(Math.random() * 100),
          isSolved: false,
        })
        .returning({ id: threads.id });
      // Seed at least one reply
      const replyContent = `<p>First reply in ${forum.name}!</p>`;
      await db.insert(posts)
        .values({
          threadId: thread.id,
          userId,
          content: replyContent,
          isFirstPost: false,
          likeCount: 0,
        });
      threadsCreated++;
    }
    console.log(`  ✅ ${threadsCreated} thread(s) created for forum: ${forum.name}`);
  }
  
  console.log('✅ Thread seeding completed!');
}

seedThreads()
  .catch(err => {
    console.error('Error seeding threads:', err);
    process.exit(1);
  })
  .finally(async () => {
    // The db object doesn't have a disconnect method
    // Instead, close the underlying pool connection
    await pool.end();
    process.exit(0);
  }); 