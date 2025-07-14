import { db } from '../db';
import { missions } from '../db/schema';

async function seedMissions() {
  console.log('🌱 Seeding missions...');
  
  const defaultMissions = [
    {
      title: 'First Steps',
      description: 'Create your first post',
      type: 'daily',
      requiredAction: 'POST_CREATED',
      requiredCount: 1,
      xpReward: 50,
      dgtReward: 10,
      isDaily: true,
      isWeekly: false,
      isActive: true,
      minLevel: 1,
      sortOrder: 1,
      conditions: JSON.stringify({
        type: 'single',
        actionType: 'POST_CREATED',
        targetValue: 1,
        operator: '>='
      })
    },
    {
      title: 'Conversation Starter',
      description: 'Reply to 5 posts',
      type: 'daily',
      requiredAction: 'REPLY_CREATED',
      requiredCount: 5,
      xpReward: 100,
      dgtReward: 20,
      isDaily: true,
      isWeekly: false,
      isActive: true,
      minLevel: 1,
      sortOrder: 2,
      conditions: JSON.stringify({
        type: 'single',
        actionType: 'REPLY_CREATED',
        targetValue: 5,
        operator: '>='
      })
    },
    {
      title: 'Popular Creator',
      description: 'Receive 10 likes on your posts',
      type: 'weekly',
      requiredAction: 'LIKE_RECEIVED',
      requiredCount: 10,
      xpReward: 200,
      dgtReward: 50,
      isDaily: false,
      isWeekly: true,
      isActive: true,
      minLevel: 1,
      sortOrder: 3,
      conditions: JSON.stringify({
        type: 'single',
        actionType: 'LIKE_RECEIVED',
        targetValue: 10,
        operator: '>='
      })
    },
    {
      title: 'Generous Tipper',
      description: 'Send 100 DGT in tips',
      type: 'weekly',
      requiredAction: 'TIP_SENT',
      requiredCount: 100,
      xpReward: 300,
      dgtReward: 75,
      isDaily: false,
      isWeekly: true,
      isActive: true,
      minLevel: 5,
      sortOrder: 4,
      conditions: JSON.stringify({
        type: 'single',
        actionType: 'TIP_SENT',
        targetValue: 100,
        operator: '>='
      })
    },
    {
      title: 'Daily Contributor',
      description: 'Create posts and receive likes',
      type: 'daily',
      requiredAction: 'COMPOSITE',
      requiredCount: 1,
      xpReward: 150,
      dgtReward: 40,
      badgeReward: 'special-badge-1',
      isDaily: true,
      isWeekly: false,
      isActive: true,
      minLevel: 3,
      sortOrder: 5,
      conditions: JSON.stringify({
        type: 'composite',
        operator: 'AND',
        conditions: [
          {
            type: 'single',
            actionType: 'POST_CREATED',
            targetValue: 2,
            operator: '>='
          },
          {
            type: 'single',
            actionType: 'LIKE_RECEIVED',
            targetValue: 5,
            operator: '>='
          }
        ]
      })
    }
  ];

  try {
    // Insert missions
    await db.insert(missions).values(defaultMissions).onConflictDoNothing();
    
    console.log('✅ Missions seeded successfully!');
    
    // Show seeded missions
    const seededMissions = await db.select({
      id: missions.id,
      title: missions.title,
      type: missions.type,
      isActive: missions.isActive
    }).from(missions);
    
    console.log(`\n📋 Seeded ${seededMissions.length} missions:`);
    seededMissions.forEach(m => {
      console.log(`  - ${m.title} (${m.type}) - Active: ${m.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding missions:', error);
  }
  
  process.exit(0);
}

seedMissions();