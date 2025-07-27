#!/usr/bin/env tsx

/**
 * Quick Forum Demo Seeder
 * Creates realistic forum data for visual demo
 */

import '@server/config/loadEnv';
import { db } from '@db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import type { UserId, ForumId, ThreadId } from '@shared/types/ids';
import chalk from 'chalk';

async function seedDemoData() {
  console.log(chalk.cyan('\n🚀 Seeding Demo Forum Data...\n'));

  try {
    // 1. Create demo users if they don't exist
    console.log(chalk.yellow('Creating demo users...'));
    
    const demoUsers = [
      { username: 'CryptoKing', email: 'cryptoking@demo.com' },
      { username: 'MoonBoi', email: 'moonboi@demo.com' },
      { username: 'DiamondHands', email: 'diamondhands@demo.com' },
      { username: 'WhaleWatcher', email: 'whalewatcher@demo.com' },
      { username: 'DeFiDegen', email: 'defidegen@demo.com' }
    ];
    
    // Use a dummy hashed password for all demo users
    const dummyPasswordHash = '$2b$10$K7L1OJ0TLtqj1uwZKpYsKuKQKJ5YD9X9Z8s8Y5Y5Y5Y5Y5Y5Y5Y5Y';

    const createdUsers: UserId[] = [];
    
    for (const userData of demoUsers) {
      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, userData.username))
        .limit(1);
      
      if (existing.length === 0) {
        const [user] = await db
          .insert(schema.users)
          .values({
            username: userData.username,
            email: userData.email,
            password: dummyPasswordHash,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random join date in last 30 days
          })
          .returning();
        
        createdUsers.push(user.id);
        console.log(chalk.green(`✓ Created user: ${user.username}`));
      } else {
        createdUsers.push(existing[0].id);
        console.log(chalk.gray(`- User exists: ${existing[0].username}`));
      }
    }

    // 2. Get forums to populate
    console.log(chalk.yellow('\nFinding forums...'));
    
    const forums = await db
      .select()
      .from(schema.forumStructure)
      .where(eq(schema.forumStructure.type, 'forum'));
    
    console.log(chalk.cyan(`Found ${forums.length} forums to populate`));

    // 3. Create threads in each forum
    console.log(chalk.yellow('\nCreating threads...'));
    
    const threadTopics = [
      { title: "🚀 Bitcoin hitting $100k EOY - Here's why", content: "Technical analysis shows strong bullish patterns..." },
      { title: "⚠️ WARNING: New DeFi scam targeting wallets", content: "Stay safe degens! New phishing attack..." },
      { title: "💎 Hidden gem alert: $PEPE mooning soon?", content: "Found this low cap gem with huge potential..." },
      { title: "📊 Daily market analysis thread", content: "Let's discuss today's market movements..." },
      { title: "🎯 Airdrop hunting strategies that actually work", content: "Been farming airdrops for months, here's what works..." },
      { title: "🔥 ETH vs SOL - Which is the better investment?", content: "Let's settle this debate once and for all..." },
      { title: "💰 Turned $100 into $10k - My journey", content: "Started with nothing, here's how I did it..." },
      { title: "🤔 Is the bull run over? Bear market incoming?", content: "Seeing some concerning signals..." },
      { title: "🎮 GameFi tokens to watch in 2025", content: "Gaming is the next big narrative..." },
      { title: "⛏️ Best yield farming strategies right now", content: "Where are you parking your stables?" }
    ];

    const createdThreads: Array<{ id: ThreadId; forumId: ForumId }> = [];
    
    for (const forum of forums.slice(0, 3)) { // Populate first 3 forums
      for (let i = 0; i < 5; i++) { // 5 threads per forum
        const topic = threadTopics[Math.floor(Math.random() * threadTopics.length)];
        const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        
        // Generate slug from title
        const slug = topic.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim()
          .substring(0, 100) + '-' + Date.now(); // Add timestamp to ensure uniqueness
        
        const [thread] = await db
          .insert(schema.threads)
          .values({
            structureId: forum.id, // This is the forum ID
            userId: author, // This is the author's user ID
            title: topic.title,
            slug: slug,
            isSticky: i === 0, // Pin first thread in each forum
            isLocked: false,
            viewCount: Math.floor(Math.random() * 1000),
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date in last week
          })
          .returning();
        
        createdThreads.push({ id: thread.id, forumId: forum.id });
        console.log(chalk.green(`✓ Created thread in ${forum.name}: ${thread.title.substring(0, 50)}...`));
      }
    }

    // 4. Create posts (replies) in threads
    console.log(chalk.yellow('\nCreating post replies...'));
    
    const replyTemplates = [
      "Great analysis! I'm bullish on this too 🚀",
      "Not sure I agree, here's why...",
      "This aged well 😂",
      "Thanks for sharing, very insightful!",
      "Been saying this for weeks, finally someone gets it",
      "Source? Would love to read more about this",
      "My portfolio is already 50% in this",
      "Careful guys, remember to DYOR",
      "To the moon! LFG! 🌙",
      "This is the confirmation bias I needed today"
    ];

    for (const thread of createdThreads.slice(0, 10)) { // Add replies to first 10 threads
      const replyCount = Math.floor(Math.random() * 15) + 3; // 3-18 replies per thread
      
      for (let i = 0; i < replyCount; i++) {
        const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const content = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
        
        await db
          .insert(schema.posts)
          .values({
            threadId: thread.id,
            userId: author, // Changed from authorId to userId
            content: content + "\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. " + 
                     "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            createdAt: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000) // Random date in last 6 days
          });
      }
      
      console.log(chalk.green(`✓ Added ${replyCount} replies to thread`));
    }

    // 5. Update thread statistics
    console.log(chalk.yellow('\nUpdating thread statistics...'));
    
    for (const thread of createdThreads) {
      const posts = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.threadId, thread.id));
      
      if (posts.length > 0) {
        // Get the last post (most recent)
        const sortedPosts = posts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const lastPost = sortedPosts[0];
        
        await db
          .update(schema.threads)
          .set({
            postCount: posts.length,
            lastPostAt: lastPost.createdAt
          })
          .where(eq(schema.threads.id, thread.id));
      }
    }

    console.log(chalk.green('\n✅ Demo forum data seeded successfully!\n'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Seeding failed:'), error);
    process.exit(1);
  }
}

// Run the seeder
seedDemoData().then(() => process.exit(0));