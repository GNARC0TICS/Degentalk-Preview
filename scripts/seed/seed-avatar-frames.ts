#!/usr/bin/env tsx
/**
 * Seed Avatar Frames
 * 
 * This script populates the avatar_frames table with default frames
 * and adds them to the shop products table for purchase.
 */

import { db } from '../../db';
import { avatarFrames, products } from '../../db/schema';
import { eq } from 'drizzle-orm';
import chalk from 'chalk';

const defaultFrames = [
  // Common Frames
  {
    name: 'Basic Bronze Frame',
    imageUrl: '/assets/frames/bronze-frame.svg',
    rarity: 'common',
    animated: false,
    shopData: {
      description: 'A simple bronze frame to get you started.',
      priceDGT: 100,
      priceUSDT: 1,
      category: 'avatar_frames'
    }
  },
  {
    name: 'Silver Elegance',
    imageUrl: '/assets/frames/silver-frame.svg',
    rarity: 'common',
    animated: false,
    shopData: {
      description: 'A sleek silver frame with a polished finish.',
      priceDGT: 250,
      priceUSDT: 2.5,
      category: 'avatar_frames'
    }
  },
  
  // Rare Frames
  {
    name: 'Gold Prestige',
    imageUrl: '/assets/frames/gold-frame.svg',
    rarity: 'rare',
    animated: false,
    shopData: {
      description: 'Show your wealth with this luxurious gold frame.',
      priceDGT: 1000,
      priceUSDT: 10,
      category: 'avatar_frames'
    }
  },
  {
    name: 'Electric Blue',
    imageUrl: '/assets/frames/electric-blue-frame.svg',
    rarity: 'rare',
    animated: false,
    shopData: {
      description: 'A vibrant electric blue frame that catches the eye.',
      priceDGT: 750,
      priceUSDT: 7.5,
      category: 'avatar_frames'
    }
  },
  {
    name: 'Cyber Circuit',
    imageUrl: '/assets/frames/cyber-circuit-frame.svg',
    rarity: 'rare',
    animated: false,
    shopData: {
      description: 'A futuristic frame with circuit board patterns.',
      priceDGT: 800,
      priceUSDT: 8,
      category: 'avatar_frames'
    }
  },
  
  // Epic Frames
  {
    name: 'Diamond Crown',
    imageUrl: '/assets/frames/diamond-crown-frame.svg',
    rarity: 'epic',
    animated: false,
    shopData: {
      description: 'A majestic crown frame adorned with diamonds.',
      priceDGT: 2500,
      priceUSDT: 25,
      category: 'avatar_frames'
    }
  },
  
  // Special/Event Frames
  {
    name: 'OG Beta Frame',
    imageUrl: '/assets/frames/og-beta-frame.svg',
    rarity: 'legendary',
    animated: false,
    shopData: {
      description: 'Exclusive frame for beta testers - not for sale.',
      priceDGT: null,
      priceUSDT: null,
      category: 'avatar_frames',
      isSpecial: true
    }
  }
];

async function seedAvatarFrames() {
  console.log(chalk.blue('🖼️  Seeding avatar frames...'));
  
  try {
    // Check if frames already exist
    const existingFrames = await db.select().from(avatarFrames);
    
    if (existingFrames.length > 0) {
      console.log(chalk.yellow(`⚠️  Avatar frames table already has ${existingFrames.length} frames. Skipping seed.`));
      return;
    }
    
    // Insert frames
    const insertedFrames = [];
    
    for (const frame of defaultFrames) {
      const [insertedFrame] = await db.insert(avatarFrames).values({
        name: frame.name,
        imageUrl: frame.imageUrl,
        rarity: frame.rarity,
        animated: frame.animated
      }).returning();
      
      insertedFrames.push(insertedFrame);
      console.log(chalk.green(`✅ Created frame: ${frame.name}`));
      
      // Add to shop if it has pricing
      if (frame.shopData.priceDGT !== null && frame.shopData.priceUSDT !== null) {
        const slug = frame.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        await db.insert(products).values({
          name: frame.name,
          slug: slug,
          description: frame.shopData.description,
          price: frame.shopData.priceUSDT,
          pointsPrice: frame.shopData.priceDGT,
          status: 'published',
          isDeleted: false,
          pluginReward: JSON.stringify({
            type: 'avatar_frame',
            frameId: insertedFrame.id,
            rarity: frame.rarity
          }),
          stockLimit: frame.shopData.isLimited ? 100 : null,
          promotionLabel: frame.shopData.isLimited ? 'LIMITED EDITION' : null,
          isDigital: true,
          stock: 999 // Digital items have unlimited stock
        });
        
        console.log(chalk.green(`  └─ Added to shop for ${frame.shopData.priceDGT} DGT / $${frame.shopData.priceUSDT} USDT`));
      }
    }
    
    console.log(chalk.blue(`\n✨ Successfully seeded ${insertedFrames.length} avatar frames!`));
    
    // Display summary
    const summary = {
      common: insertedFrames.filter(f => f.rarity === 'common').length,
      rare: insertedFrames.filter(f => f.rarity === 'rare').length,
      epic: insertedFrames.filter(f => f.rarity === 'epic').length,
      legendary: insertedFrames.filter(f => f.rarity === 'legendary').length,
      animated: insertedFrames.filter(f => f.animated).length
    };
    
    console.log(chalk.cyan('\n📊 Summary:'));
    console.log(chalk.cyan(`  Common: ${summary.common}`));
    console.log(chalk.cyan(`  Rare: ${summary.rare}`));
    console.log(chalk.cyan(`  Epic: ${summary.epic}`));
    console.log(chalk.cyan(`  Legendary: ${summary.legendary}`));
    console.log(chalk.cyan(`  Animated: ${summary.animated}`));
    
  } catch (error) {
    console.error(chalk.red('❌ Error seeding avatar frames:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAvatarFrames()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedAvatarFrames };