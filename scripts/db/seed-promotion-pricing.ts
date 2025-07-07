import type { AdminId } from '@shared/types/ids';
#!/usr/bin/env tsx

/**
 * Seed script for user promotion pricing configuration
 * Sets up initial pricing for DGT-powered user advertisements
 */

import { db } from '../../server/src/core/db';
import { 
  promotionPricingConfig, 
  announcementSlots,
  type InsertPromotionPricingConfig,
  type InsertAnnouncementSlot 
} from '../../db/schema';
import { eq, and } from 'drizzle-orm';

// Base pricing configuration for different promotion types and durations
const pricingConfigs: InsertPromotionPricingConfig[] = [
  // Thread Boost Pricing
  {
    promotionType: 'thread_boost',
    duration: '1h',
    basePriceDgt: '50',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.2',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.3',
    minPrice: '25',
    maxPrice: '200',
    isActive: true
  },
  {
    promotionType: 'thread_boost',
    duration: '6h',
    basePriceDgt: '250',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.2',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.3',
    minPrice: '150',
    maxPrice: '800',
    isActive: true
  },
  {
    promotionType: 'thread_boost',
    duration: '1d',
    basePriceDgt: '1000',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.2',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.3',
    minPrice: '500',
    maxPrice: '2500',
    isActive: true
  },
  {
    promotionType: 'thread_boost',
    duration: '3d',
    basePriceDgt: '2500',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.1',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.2',
    minPrice: '1500',
    maxPrice: '5000',
    isActive: true
  },
  {
    promotionType: 'thread_boost',
    duration: '1w',
    basePriceDgt: '5000',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.1',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.2',
    minPrice: '3000',
    maxPrice: '10000',
    isActive: true
  },

  // Announcement Bar Pricing (Premium placement)
  {
    promotionType: 'announcement_bar',
    duration: '1h',
    basePriceDgt: '500',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.3',
    peakHours: '[16,17,18,19,20,21,22]',
    peakMultiplier: '1.8',
    minPrice: '300',
    maxPrice: '2000',
    isActive: true
  },
  {
    promotionType: 'announcement_bar',
    duration: '6h',
    basePriceDgt: '2500',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.3',
    peakHours: '[16,17,18,19,20,21,22]',
    peakMultiplier: '1.8',
    minPrice: '1500',
    maxPrice: '8000',
    isActive: true
  },
  {
    promotionType: 'announcement_bar',
    duration: '1d',
    basePriceDgt: '8000',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.3',
    peakHours: '[16,17,18,19,20,21,22]',
    peakMultiplier: '1.5',
    minPrice: '5000',
    maxPrice: '20000',
    isActive: true
  },
  {
    promotionType: 'announcement_bar',
    duration: '3d',
    basePriceDgt: '20000',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.2',
    peakHours: '[16,17,18,19,20,21,22]',
    peakMultiplier: '1.3',
    minPrice: '15000',
    maxPrice: '40000',
    isActive: true
  },

  // Pinned Shoutbox Pricing
  {
    promotionType: 'pinned_shoutbox',
    duration: '1h',
    basePriceDgt: '100',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.4',
    peakHours: '[17,18,19,20,21,22,23]',
    peakMultiplier: '1.6',
    minPrice: '50',
    maxPrice: '500',
    isActive: true
  },
  {
    promotionType: 'pinned_shoutbox',
    duration: '6h',
    basePriceDgt: '500',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.4',
    peakHours: '[17,18,19,20,21,22,23]',
    peakMultiplier: '1.6',
    minPrice: '300',
    maxPrice: '1500',
    isActive: true
  },
  {
    promotionType: 'pinned_shoutbox',
    duration: '12h',
    basePriceDgt: '800',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.3',
    peakHours: '[17,18,19,20,21,22,23]',
    peakMultiplier: '1.4',
    minPrice: '500',
    maxPrice: '2000',
    isActive: true
  },
  {
    promotionType: 'pinned_shoutbox',
    duration: '1d',
    basePriceDgt: '1500',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.3',
    peakHours: '[17,18,19,20,21,22,23]',
    peakMultiplier: '1.3',
    minPrice: '1000',
    maxPrice: '3000',
    isActive: true
  },

  // Profile Spotlight Pricing
  {
    promotionType: 'profile_spotlight',
    duration: '1d',
    basePriceDgt: '2000',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.2',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.3',
    minPrice: '1500',
    maxPrice: '5000',
    isActive: true
  },
  {
    promotionType: 'profile_spotlight',
    duration: '3d',
    basePriceDgt: '5000',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.2',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.3',
    minPrice: '3500',
    maxPrice: '10000',
    isActive: true
  },
  {
    promotionType: 'profile_spotlight',
    duration: '1w',
    basePriceDgt: '10000',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.1',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.2',
    minPrice: '7500',
    maxPrice: '20000',
    isActive: true
  },

  // Achievement Highlight Pricing (New feature)
  {
    promotionType: 'achievement_highlight',
    duration: '1d',
    basePriceDgt: '750',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.1',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.2',
    minPrice: '500',
    maxPrice: '2000',
    isActive: true
  },
  {
    promotionType: 'achievement_highlight',
    duration: '3d',
    basePriceDgt: '2000',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.1',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.2',
    minPrice: '1500',
    maxPrice: '4000',
    isActive: true
  },
  {
    promotionType: 'achievement_highlight',
    duration: '1w',
    basePriceDgt: '4000',
    demandMultiplier: '1.0',
    timeMultiplier: '1.0',
    weekendMultiplier: '1.1',
    peakHours: '[18,19,20,21]',
    peakMultiplier: '1.2',
    minPrice: '3000',
    maxPrice: '8000',
    isActive: true
  }
];

// Generate announcement slots for the next 30 days
function generateAnnouncementSlots(): InsertAnnouncementSlot[] {
  const slots: InsertAnnouncementSlot[] = [];
  const today = new Date();
  
  // Generate slots for next 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Create 3 priority slots for each day, 24 hours coverage
    for (let slot = 1; slot <= 3; slot++) {
      for (let hour = 0; hour < 24; hour++) {
        let priority: 'premium' | 'standard' | 'economy';
        let basePrice: : AdminId;
        
        // Slot 1 = Premium, Slot 2 = Standard, Slot 3 = Economy
        switch (slot) {
          case 1:
            priority = 'premium';
            basePrice = '2000';
            break;
          case 2:
            priority = 'standard';
            basePrice = '1500';
            break;
          case 3:
            priority = 'economy';
            basePrice = '1000';
            break;
          default:
            priority = 'standard';
            basePrice = '1500';
        }
        
        // Apply peak hour pricing
        const isPeakHour = hour >= 16 && hour <= 22;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        let currentPrice = parseFloat(basePrice);
        if (isPeakHour) {
          currentPrice *= 1.5;
        }
        if (isWeekend) {
          currentPrice *= 1.3;
        }
        
        slots.push({
          slotNumber: slot,
          priority,
          date: dateStr,
          hourStart: hour,
          hourEnd: hour + 1,
          basePrice,
          currentPrice: Math.round(currentPrice).toString(),
          demandMultiplier: '1.0',
          maxContentLength: priority === 'premium' ? 300 : priority === 'standard' ? 250 : 200,
          allowImages: true,
          allowLinks: true,
          isBooked: false
        });
      }
    }
  }
  
  return slots;
}

async function seedPromotionPricing(): Promise<void> {
  console.log('🌱 Seeding user promotion pricing configuration...');

  try {
    // Clear existing pricing config
    await db.delete(promotionPricingConfig);
    console.log('   Cleared existing pricing configuration');

    // Insert new pricing configs
    const insertedPricing = await db
      .insert(promotionPricingConfig)
      .values(pricingConfigs)
      .returning();

    console.log(`   ✅ Inserted ${insertedPricing.length} pricing configurations`);

    // Seed announcement slots
    console.log('   Generating announcement slots for next 30 days...');
    
    // Clear existing slots
    await db.delete(announcementSlots);
    
    const announcementSlotsData = generateAnnouncementSlots();
    
    // Insert in batches to avoid overwhelming the database
    const batchSize = 100;
    let insertedSlots = 0;
    
    for (let i = 0; i < announcementSlotsData.length; i += batchSize) {
      const batch = announcementSlotsData.slice(i, i + batchSize);
      await db.insert(announcementSlots).values(batch);
      insertedSlots += batch.length;
      
      if (i % (batchSize * 10) === 0) {
        console.log(`   Inserted ${insertedSlots}/${announcementSlotsData.length} announcement slots...`);
      }
    }

    console.log(`   ✅ Inserted ${insertedSlots} announcement slots`);

    // Display pricing summary
    console.log('\n📊 Pricing Summary:');
    console.log('   Thread Boost: 50 DGT/hour → 5,000 DGT/week');
    console.log('   Announcement Bar: 500 DGT/hour → 20,000 DGT/3days');
    console.log('   Pinned Shoutbox: 100 DGT/hour → 1,500 DGT/day');
    console.log('   Profile Spotlight: 2,000 DGT/day → 10,000 DGT/week');
    console.log('   Achievement Highlight: 750 DGT/day → 4,000 DGT/week');

    console.log('\n🎯 Dynamic Pricing Features:');
    console.log('   - Peak hour multipliers (6PM-10PM)');
    console.log('   - Weekend pricing adjustments');
    console.log('   - Demand-based price scaling');
    console.log('   - 3-tier announcement slots (Premium/Standard/Economy)');

    console.log('\n✨ User promotion pricing system is ready!');

  } catch (error) {
    console.error('❌ Error seeding promotion pricing:', error);
    throw error;
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedPromotionPricing()
    .then(() => {
      console.log('\n🎉 Promotion pricing seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Promotion pricing seeding failed:', error);
      process.exit(1);
    });
}

export { seedPromotionPricing };