# Mission System Production Notes & Human Guide

## 🚨 Critical Production Items

### 1. **Database Migration Order**
```bash
# MUST run in this order:
psql $DATABASE_URL < db/migrations/add-mission-conditions.sql
psql $DATABASE_URL < db/migrations/add-mission-metadata.sql
```

### 2. **Missing Integration Points**
- [ ] Hook `logMissionAction()` into existing services:
  - `PostService.createPost()` → `logMissionAction(userId, 'create_post')`
  - `ThreadService.createThread()` → `logMissionAction(userId, 'create_thread')`
  - `TipService.sendTip()` → `logMissionAction(userId, 'tip_sent')`
  - `AuthService.login()` → `logMissionAction(userId, 'daily_login')`
- [ ] Add event emitters for mission tracking in `eventEmitter`
- [ ] Initialize `mission-tracker.ts` on server startup

### 3. **Cron Setup**
```bash
# Add to crontab:
0 0 * * * cd /path/to/degentalk && pnpm tsx scripts/cron/reset-daily-missions.ts >> logs/missions.log 2>&1
```

### 4. **Performance Optimizations**
- [ ] Add Redis caching for `getUserMissionProgress()` (TTL: 5 min)
- [ ] Batch mission progress updates (queue with 1s debounce)
- [ ] Add compound index: `(userId, missionId, isCompleted)`

### 5. **Security Hardening**
- [ ] Rate limit mission claims: 10/min per user
- [ ] Add mutex lock on `claimReward()` to prevent double claims
- [ ] Validate mission metadata against injection attacks
- [ ] Add admin audit log for mission creation/modification

---

## 🎮 Making Missions Sticky & Fun

### Psychology Principles

**1. Variable Reward Schedule**
- Mix guaranteed rewards (daily login) with chance-based (random bonus missions)
- Surprise "flash missions" that appear for 1 hour
- Mystery missions revealed only after completion

**2. Progress Visualization**
```
Daily Streak: 🔥🔥🔥🔥⚪ (4/5 days)
Weekly Progress: ████████░░ 80%
Next Unlock: 47 XP to "Thread Master"
```

**3. Social Proof**
- "87% of users completed this mission"
- "Your friend @degen just earned 'Whale Tipper' badge"
- Leaderboards for mission completions

### Mission Design Framework

```typescript
// Good Mission Design
{
  title: "Morning Motivator",
  description: "Be one of the first 50 to post today after reset",
  why: "Creates urgency, FOMO, and daily habit",
  reward: { xp: 100, dgt: 20, badge: "early_bird" }
}

// Bad Mission Design
{
  title: "Post 100 Times",
  description: "Create 100 posts",
  why: "Too grindy, encourages spam, no creativity"
}
```

### Engagement Loops

```
Login → See Progress → Complete Easy Mission → Feel Good
  ↓                                              ↓
Check Leaderboard ← Claim Reward ← Try Harder Mission
  ↓
Share Achievement → Friends React → Social Validation
  ↓
Return Tomorrow ← Set Personal Goal ← Almost Complete Badge
```

---

## 📊 Mission Analytics & Optimization

### Key Metrics to Track
```sql
-- Mission completion rate by type
SELECT 
  m.type,
  m.title,
  COUNT(DISTINCT ump.user_id) as attempts,
  COUNT(DISTINCT CASE WHEN ump.is_completed THEN ump.user_id END) as completions,
  AVG(CASE WHEN ump.is_completed THEN 1.0 ELSE 0.0 END) as completion_rate
FROM missions m
JOIN user_mission_progress ump ON m.id = ump.mission_id
GROUP BY m.type, m.title
ORDER BY completion_rate DESC;
```

### A/B Testing Framework
```typescript
// Test different reward amounts
const rewardVariants = {
  control: { xp: 50, dgt: 10 },
  variant_a: { xp: 75, dgt: 5 },
  variant_b: { xp: 40, dgt: 20 }
};

// Track which drives more engagement
```

---

## 🎨 Mission Types for Maximum Engagement

### 1. **Skill Builders**
- "Use 3 different markdown formats"
- "Include a code snippet in your post"
- "Add alt text to an image"
→ Teaches platform features naturally

### 2. **Community Builders**
- "Welcome 3 new users"
- "Help someone solve their issue"
- "Start a discussion in a quiet forum"
→ Creates positive interactions

### 3. **Discovery Missions**
- "Post in a forum you've never visited"
- "Read the top post from last week"
- "Find and tip a hidden gem post"
→ Increases platform exploration

### 4. **Time-Based Challenges**
- "Night Owl: Post between 2-4 AM"
- "Weekend Warrior: 10 posts on Saturday"
- "Lunch Break: Quick post at noon"
→ Spreads activity across time zones

### 5. **Collaborative Missions**
- "Reply chain: Keep a thread going for 20 replies"
- "Tag Team: You and a friend both complete missions"
- "Forum Raid: 50 users post in one forum today"
→ Builds community bonds

---

## 💡 Advanced Mission Ideas

### Dynamic Difficulty
```typescript
// Adjust mission difficulty based on user skill
if (userLevel < 5) {
  mission.requiredCount = 3; // Easy mode
} else if (userLevel < 20) {
  mission.requiredCount = 5; // Normal mode
} else {
  mission.requiredCount = 10; // Hard mode
  mission.rewards.xp *= 1.5; // Better rewards
}
```

### Narrative Missions
```typescript
// Chain missions that tell a story
const storyChain = [
  { id: 'detective_1', title: 'The Mystery Begins', unlock: 'Find the hidden message' },
  { id: 'detective_2', title: 'Following Clues', unlock: 'Decode the cipher', requires: 'detective_1' },
  { id: 'detective_3', title: 'The Final Revelation', unlock: 'Solve the case', requires: 'detective_2' }
];
```

### Seasonal Events
```typescript
// Halloween Special
{
  title: "Spooky Storyteller",
  description: "Share your scariest crypto story",
  available: { start: "2024-10-25", end: "2024-11-01" },
  rewards: { xp: 200, badge: "halloween_2024", cosmetic: "pumpkin_frame" }
}
```

---

## 🔥 Making It Addictive (Ethically)

### Daily Hooks
1. **Login Streak Counter** - "Don't break your 47-day streak!"
2. **Daily Mission Preview** - Show tomorrow's missions at 11 PM
3. **Friend Activity** - "Your rival just passed you in XP!"

### Weekly Rhythms
- Monday: Fresh weekly missions
- Wednesday: Bonus XP day
- Friday: Special weekend missions preview
- Sunday: Last chance for weekly missions

### Monthly Events
- First week: New mission pack releases
- Mid-month: Community mission (everyone contributes)
- Month end: Leaderboard rewards & resets

---

## 🛠️ Admin Tools Needed

### Mission Performance Dashboard
```
Mission: "Quality Contributor"
├─ Attempts: 1,247
├─ Completions: 834 (66.9%)
├─ Avg Time to Complete: 2.3 days
├─ User Sentiment: 4.2/5 ⭐
└─ Revenue Impact: +12% DGT tips
```

### Quick Actions
- [ ] Pause problematic mission
- [ ] Boost mission rewards (temporary)
- [ ] Send mission notification
- [ ] Create flash mission
- [ ] View mission funnel

---

## 📱 Notification Strategy

### Smart Notifications
```typescript
// Good: Actionable and timely
"🎯 Daily missions reset! You were so close to completing 'Thread Master' yesterday - finish it today?"

// Bad: Generic and spammy
"Check out missions!"
```

### Notification Timing
- Morning: "Your daily missions are ready!"
- Afternoon: "You're 2 posts away from 100 XP"
- Evening: "Last chance for today's bonus mission"

---

## 🎯 Launch Strategy

### Phase 1: Soft Launch (Week 1)
- Enable for 10% of active users
- Focus on daily missions only
- Monitor completion rates & bugs

### Phase 2: Full Launch (Week 2)
- Enable for all users
- Add weekly missions
- Launch first special event

### Phase 3: Optimization (Week 3+)
- A/B test reward amounts
- Introduce stacking missions
- Add collaborative missions

---

## 🚀 Success Metrics

### North Star Metrics
1. **DAU increase**: Target +15% in 30 days
2. **Session length**: Target +3 min average
3. **Posts per user**: Target +25% quality posts
4. **Retention**: D7 retention increase by 10%

### Health Metrics
- Mission completion rate > 60%
- No mission < 20% completion (indicates too hard)
- Reward claim rate > 90% (UX is clear)
- Support tickets < 1% of participants

---

This mission system turns daily forum activity into an engaging game. By carefully balancing rewards, variety, and social elements, it creates sustainable engagement without feeling like a grind. The key is constant iteration based on user behavior data. 🎮