# DegenTalk Seeding Scripts

This directory contains scripts to populate your DegenTalk database with realistic testing data.

## 🚀 Quick Start

To fully populate your database for testing:

```bash
npm run seed:all
```

This will seed:
- Forum structure (zones, forums, subforums) from `forumMap.config.ts`
- Realistic users with crypto personas
- Threads and posts with authentic content
- Prefixes, tags, and engagement data
- Welcome threads for each forum

## 📋 Available Scripts

### Primary Scripts

- `npm run seed:all` - Complete database seeding (recommended)
- `npm run seed:all -- --wipe` - Wipe database and reseed everything
- `npm run sync:forums` - Sync forum structure only

### Specialized Scripts

- `npm run seed:all -- --users-only` - Seed users only
- `npm run seed:all -- --forums-only` - Seed forum structure only  
- `npm run seed:all -- --threads-only` - Seed threads and posts only

### Legacy Scripts

- `npm run seed:realistic-threads` - Old thread seeding script
- `npm run seed:dummy-threads` - Basic dummy data
- `scripts/seed/seedDynamicContent.ts` - Complex full seeding

## 🔧 Configuration

The seeding is configured in `seed-all-comprehensive.ts`:

```typescript
const CONFIG = {
  USERS: {
    ADMIN_COUNT: 2,
    MOD_COUNT: 3,
    REGULAR_COUNT: 25,
  },
  THREADS: {
    PER_FORUM: { MIN: 8, MAX: 15 },
    POSTS: { MIN: 2, MAX: 20 }
  }
}
```

## 🎯 What Gets Seeded

### 1. Forum Structure
- **Primary Zones**: The Pit, Mission Control, Casino Floor, Briefing Room, The Archive
- **General Zones**: Market Analysis, DeFi Lab, NFT District
- **Forums & Subforums**: Following the hierarchy in `forumMap.config.ts`
- **Welcome Threads**: Sticky welcome posts for each forum

### 2. Users
- **Admins**: `degentalk_admin`, `cryptosensei` 
- **Moderators**: 3 mods with elevated permissions
- **Regular Users**: 25 users with realistic crypto usernames like `diamondhands`, `moonboi`, `rektard`

### 3. Realistic Content
- **Threads**: Forum-specific topics (e.g., "BTC just broke $45k!" in live-trade-reacts)
- **Posts**: Authentic crypto slang and terminology
- **Engagement**: Likes, replies, proper threading
- **Prefixes**: `[ALPHA]`, `[LIVE]`, `[SHILL]`, `[REKT]`, etc.
- **Tags**: `bitcoin`, `defi`, `moonshot`, `diamond-hands`, etc.

### 4. Forum-Specific Content

Each forum gets appropriate content:
- **Live Trade Reacts**: Real-time trading reactions
- **Shill Zone**: Gem calls and moonshot predictions  
- **Alpha Channel**: Insider intel and leaks
- **Strategy Scripts**: Gambling strategies and bots
- **Announcements**: Official platform updates

## 🛠️ Customization

### Adding New Content Types

Edit `seed-all-comprehensive.ts` and add to the `THREAD_TOPICS` object:

```typescript
const THREAD_TOPICS = {
  'your-forum-slug': [
    'Custom thread topic 1',
    'Custom thread topic 2'
  ]
}
```

### Modifying User Personas

Update the `REALISTIC_USERNAMES` array:

```typescript
const REALISTIC_USERNAMES = [
  'your_custom_username',
  'another_persona'
]
```

### Changing Content Volume

Adjust the `CONFIG` object at the top of the file.

## 🔄 Development Workflow

1. **First Setup**: `npm run seed:all -- --wipe`
2. **Add New Forums**: Update `forumMap.config.ts`, then `npm run sync:forums`
3. **Refresh Content**: `npm run seed:all -- --threads-only`
4. **Reset Everything**: `npm run seed:all -- --wipe`

## 📁 File Structure

```
scripts/seed/
├── README.md                    # This file
├── seed-all-comprehensive.ts    # Main seeding script
├── seedForumsFromConfig.ts      # Forum structure sync
├── seed-realistic-threads.ts    # Legacy thread seeder
├── seedDynamicContent.ts        # Complex legacy seeder
└── shop/
    └── username-colors.ts       # Shop item seeding
```

## 🎨 Content Examples

The seeding creates realistic crypto community content:

**Thread Examples:**
- "BTC just broke $45k resistance! 🚀"
- "Hidden gem: $TOKEN going to $100" 
- "REKT: Lost everything on this LINK trade"
- "New 200% APY farm discovered"

**Post Examples:**
- "Just closed my long on ETH. Made bank! Took profit at $3200. 💎🙌"
- "Update on my SOL position: Currently up 20%. Next target: $200. WAGMI!"
- "Looking at the 4h chart for BTC, I see bullish divergence. 📈"

**User Personas:**
- `diamondhands` (Level 12, Bio: "🚀 Diamond hands since 2021")
- `cryptowhale` (Level 15, Bio: "📈 DeFi yield farmer") 
- `rektard` (Level 3, Bio: "🎲 High roller at the casino")

## 🚨 Important Notes

- Always run on a development database first
- The `--wipe` flag will delete ALL data
- Some legacy scripts may conflict - use the new `seed:all` command
- Forum structure changes require `npm run sync:forums`

## 🐛 Troubleshooting

**"No users found" error**: Run `npm run seed:all -- --users-only` first

**"No forums found" error**: Run `npm run sync:forums` first

**Duplicate key errors**: Use `npm run seed:all -- --wipe` to reset

**Missing threads**: Check that forum structure exists and is synced

For issues, check the console output for detailed error messages and ensure your database connection is working.