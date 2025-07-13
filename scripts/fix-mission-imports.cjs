#!/usr/bin/env node

/**
 * Quick import fixer for mission system
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // Mission routes
  {
    file: 'server/src/domains/gamification/routes/mission.routes.ts',
    replacements: [
      ['@domains/xp/xp.service', '../../xp/xp.service'],
      ['@domains/wallet/services/dgtService', '../../wallet/services/dgtService'],
      ['@domains/activity/services/event-log.service', '../../activity/services/event-log.service'],
      ['@config/missions.config', '../../../../../config/missions.config']
    ]
  },
  // Cron job
  {
    file: 'scripts/cron/reset-daily-missions.ts',
    replacements: [
      ['@db', '../../db'],
      ['@schema', '../../db/schema'],
      ['@domains/gamification/services/mission.service', '../../server/src/domains/gamification/services/mission.service'],
      ['@config/missions.config', '../../config/missions.config'],
      ['@core/logger', '../../server/src/core/logger']
    ]
  },
  // Action dispatcher
  {
    file: 'server/src/domains/gamification/utils/mission-action-dispatcher.ts',
    replacements: [
      ['@domains/gamification/services/mission.service', '../services/mission.service'],
      ['@core/logger', '../../../core/logger']
    ]
  }
];

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  replacements.forEach(([from, to]) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      changed = true;
      console.log(`✅ Fixed: ${from} → ${to}`);
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`💾 Updated ${file}\n`);
  }
});

console.log('✨ Import fixes complete!');