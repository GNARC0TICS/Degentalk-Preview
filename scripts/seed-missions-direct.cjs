#!/usr/bin/env node

/**
 * Direct mission seeding without path aliases
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const missionTemplates = [
  // Daily Missions
  {
    title: "First Post of the Day",
    description: "Create your first post today",
    type: "daily",
    requiredAction: "post_create",
    requiredCount: 1,
    xpReward: 50,
    dgtReward: 10,
    icon: "📝",
    isDaily: true,
    isWeekly: false,
    minLevel: 1
  },
  {
    title: "Daily Contributor",
    description: "Create 3 posts today",
    type: "daily",
    requiredAction: "post_create",
    requiredCount: 3,
    xpReward: 150,
    dgtReward: 30,
    icon: "🔥",
    isDaily: true,
    isWeekly: false,
    minLevel: 1
  },
  {
    title: "Engagement Master",
    description: "Reply to 5 different threads",
    type: "daily",
    requiredAction: "post_reply",
    requiredCount: 5,
    xpReward: 200,
    dgtReward: 40,
    icon: "💬",
    isDaily: true,
    isWeekly: false,
    minLevel: 2
  },
  // Weekly Missions
  {
    title: "Weekly Warrior",
    description: "Create 20 posts this week",
    type: "weekly",
    requiredAction: "post_create",
    requiredCount: 20,
    xpReward: 1000,
    dgtReward: 200,
    icon: "⚔️",
    isDaily: false,
    isWeekly: true,
    minLevel: 3
  },
  // Milestone Missions
  {
    title: "Welcome Aboard",
    description: "Complete your first post",
    type: "milestone",
    requiredAction: "post_create",
    requiredCount: 1,
    xpReward: 100,
    dgtReward: 50,
    badgeReward: "newcomer",
    icon: "🎉",
    isDaily: false,
    isWeekly: false,
    minLevel: 1
  },
  // Stacking Mission
  {
    title: "Post Streak",
    description: "Keep posting to earn increasing rewards",
    type: "stacking",
    requiredAction: "post_create",
    requiredCount: 1,
    xpReward: 25,
    dgtReward: 5,
    icon: "📈",
    isDaily: false,
    isWeekly: false,
    minLevel: 1,
    stages: [
      { count: 5, reward: { xp: 50, dgt: 10 } },
      { count: 10, reward: { xp: 100, dgt: 25 } },
      { count: 25, reward: { xp: 250, dgt: 50 } },
      { count: 50, reward: { xp: 500, dgt: 100 } },
      { count: 100, reward: { xp: 1000, dgt: 250, badge: "prolific_poster" } }
    ]
  }
];

async function seedMissions() {
  console.log('🚀 Seeding missions...\n');

  let created = 0;
  let skipped = 0;

  for (const template of missionTemplates) {
    try {
      // Check if mission exists
      const existing = await pool.query(
        'SELECT id FROM missions WHERE title = $1',
        [template.title]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping existing mission: ${template.title}`);
        skipped++;
        continue;
      }

      // Insert mission
      const result = await pool.query(
        `INSERT INTO missions (
          title, description, type, required_action, required_count,
          xp_reward, dgt_reward, badge_reward, icon,
          is_daily, is_weekly, is_active, min_level,
          conditions, stages
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          template.title,
          template.description,
          template.type,
          template.requiredAction,
          template.requiredCount,
          template.xpReward,
          template.dgtReward || null,
          template.badgeReward || null,
          template.icon,
          template.isDaily,
          template.isWeekly,
          true, // is_active
          template.minLevel,
          template.conditions ? JSON.stringify(template.conditions) : null,
          template.stages ? JSON.stringify(template.stages) : null
        ]
      );

      console.log(`✅ Created mission: ${template.title} (${result.rows[0].id})`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating mission ${template.title}:`, error.message);
    }
  }

  console.log(`\n📊 Summary: Created ${created} missions, skipped ${skipped}`);
  await pool.end();
}

seedMissions().catch(console.error);