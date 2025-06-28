---
title: FIXTURES GUIDE
status: STABLE
updated: 2025-06-28
---

# Degentalk Fixtures System Guide

> **Comprehensive test data generation for the crypto community platform**

The Degentalk Fixtures System provides realistic, crypto-themed test data with an interactive UI and powerful programmatic API. Perfect for testing, development, and demos.

## 🚀 Quick Start

### 1. Basic Usage

```typescript
import { Factory } from '@fixtures';

// Create single entities
const user = Factory.create('user');
const thread = Factory.create('thread');
const post = Factory.create('post');

// Create multiple entities
const users = Factory.createMany('user', 10);
```

### 2. Using the Dashboard

Navigate to `/fixtures-dashboard` to access the interactive UI:

1. **Builder Tab** - Configure and generate fixtures visually
2. **Preview Tab** - View generated data with realistic styling
3. **History Tab** - Manage previous fixture sessions

### 3. Scenario Generation

```typescript
import { scenarioGenerator } from '@fixtures';

// Generate complete test scenarios
const scenario = await scenarioGenerator.generateScenario('forum-discussion');
// Returns: users, threads, posts, engagement data
```

## 📚 Available Entities

| Entity | Description | Example Usage |
|--------|-------------|---------------|
| `user` | Regular crypto community members | `Factory.create('user')` |
| `admin` | Administrator accounts | `Factory.create('admin')` |
| `whale` | High-value users with large balances | `Factory.create('whale')` |
| `thread` | Forum discussion threads | `Factory.create('thread')` |
| `post` | Individual forum posts | `Factory.create('post')` |
| `forum` | Forum categories | `Factory.create('forum')` |

## 🎭 User States

Create users with specific characteristics:

```typescript
// Predefined user states
const admin = Factory.get('user').states('admin').build();
const newbie = Factory.get('user').states('newbie').build();
const whale = Factory.get('user').states('whale').build();
const banned = Factory.get('user').states('banned').build();
```

### Available User States

- **`admin`** - Administrative privileges, high XP/reputation
- **`moderator`** - Moderation permissions, good standing
- **`newbie`** - Fresh account, low XP, unverified email
- **`whale`** - High DGT balance, excellent reputation
- **`banned`** - Inactive account, suspended
- **`inactive`** - Long-term inactive user

## 🧵 Thread & Post States

```typescript
// Thread states
const hotThread = Factory.get('thread').states('hot').build();
const pinnedThread = Factory.get('thread').states('pinned').build();
const lockedThread = Factory.get('thread').states('locked').build();

// Post states  
const firstPost = Factory.get('post').states('first').build();
const popularPost = Factory.get('post').states('popular').build();
const controversialPost = Factory.get('post').states('controversial').build();
```

## 🎯 Custom Overrides

Customize any property:

```typescript
// Override specific fields
const customUser = Factory.create('user', {
  overrides: {
    username: 'crypto_legend',
    dgtWalletBalance: BigInt(1000000),
    bio: 'Diamond hands since 2017 💎🙌'
  }
});

// Fluent API
const richTrader = Factory.get('user')
  .with({ 
    username: 'whale_trader',
    reputation: 9500 
  })
  .build();
```

## 🎬 Pre-built Scenarios

### Available Scenarios

| Scenario | Description | Entities Generated |
|----------|-------------|-------------------|
| `forum-discussion` | Active forum with engaged users | 10 users, 1 forum, 3 threads, 20+ posts |
| `whale-activity` | High-value user interactions | 1 whale, 5 users, transactions, tips |
| `new-user-onboarding` | Fresh user journey | 1 newbie, helpers, first thread/post |
| `admin-moderation` | Administrative workflows | Admins, mods, moderation actions |
| `crypto-market-event` | Community reacting to market news | 19 users, market thread, excited posts |
| `community-growth` | Large-scale community | 200+ users, 6 forums, hundreds of posts |

### Using Scenarios

```typescript
import { scenarioGenerator } from '@fixtures';

// Generate a complete scenario
const result = await scenarioGenerator.generateScenario('forum-discussion');

// Access generated data
const { users, forums, threads, posts } = result.generatedData;

// View statistics
console.log(result.statistics);
// { totalEntities: 34, entitiesByType: {...}, generationTime: 1500 }
```

## 🧪 Testing Helpers

### Quick Test Setup

```typescript
import { setupQuickScenario, testDataManager } from '@fixtures';

// Predefined test scenarios
const basicData = await setupQuickScenario('basic');     // Forum with users, threads, posts
const adminData = await setupQuickScenario('admin');     // Admin scenario with moderation
const economyData = await setupQuickScenario('economy'); // Users with transactions, tips
const largeData = await setupQuickScenario('large');     // Performance testing dataset
```

### User Journey Testing

```typescript
// Create specific user journeys
const newbieJourney = testDataManager.createUserJourney('newbie');
const traderJourney = testDataManager.createUserJourney('trader');
const whaleJourney = testDataManager.createUserJourney('whale');
const adminJourney = testDataManager.createUserJourney('admin');

// Access journey data
const { user, progression, initialContent } = newbieJourney;
```

### Validation Helpers

```typescript
import { expectValidUser, expectValidThread, expectValidPost } from '@fixtures';

// Test data validation
expectValidUser(user);      // Validates user structure and required fields
expectValidThread(thread);  // Validates thread properties
expectValidPost(post);      // Validates post content and relationships
```

## 💻 Dashboard Features

### Fixture Builder

Access the visual builder at `/fixtures-dashboard`:

1. **Type Selection** - Choose entity type with visual cards
2. **Configuration** - Set count, state, custom overrides
3. **Quick Actions** - Pre-configured common scenarios
4. **Real-time Generation** - See results immediately

### Preview & Management

- **Realistic Previews** - Cards styled like actual platform components
- **Session Management** - Save and restore fixture sessions
- **Export/Import** - Share fixture configurations
- **Statistics Dashboard** - Usage tracking and metrics

### Quick Actions

| Button | Result |
|--------|--------|
| "5 Admin Users" | 5 administrative accounts |
| "20 Hot Threads" | 20 trending discussion threads |
| "100 Crypto Whales" | 100 high-value users |
| "1000 Transactions" | 1000 wallet transactions |

## 🔧 Advanced Usage

### Custom Factories

Create your own specialized factories:

```typescript
import { BaseFactory } from '@fixtures';

class TraderFactory extends BaseFactory<User> {
  definition(): Partial<User> {
    return {
      ...super.definition(),
      bio: 'Technical analysis expert. DYOR always!',
      reputation: this.faker.number.int({ min: 1000, max: 5000 }),
      // Custom trader-specific properties
    };
  }
}

// Register custom factory
Factory.register('trader', new TraderFactory());
```

### Relationship Building

```typescript
// Create related entities
const forum = Factory.create('forum');
const threads = Factory.createMany('thread', 5, {
  overrides: { forumId: forum.id }
});

// Generate posts for specific threads
const posts = threads.flatMap(thread => 
  Factory.createMany('post', 10, {
    overrides: { threadId: thread.id }
  })
);
```

### Performance Testing

```typescript
// Generate large datasets for performance testing
const largeDataset = testDataManager.generateLargeDataset({
  users: 10000,
  threads: 5000, 
  posts: 50000,
  transactions: 100000
});

console.log(largeDataset.summary);
// { totalEntities: 165000, estimatedMemoryUsage: "82500KB" }
```

## 🎨 Crypto-Authentic Content

The fixtures generate realistic crypto community content:

### Usernames
- `diamondhands2024`, `cryptowhale_og`, `degen_trader`
- `moonboi`, `hodler`, `nftfloor`, `yieldfarmer`

### Thread Titles
- "BTC just broke $50k resistance! 🚀"
- "Why ETH is going to $10k (TA inside)" 
- "REKT: Lost everything on this LINK trade"
- "Daily DOGE discussion - bullish patterns forming"

### Post Content
- Technical analysis discussions
- Trade results and P&L sharing
- Market sentiment and predictions
- Community support and advice
- Meme coin enthusiasm

### User Bios
- "Diamond hands since 2017. BTC to the moon! 🚀"
- "DeFi degen, yield farmer, rug survivor. HODL or die."
- "NFT collector, meme coin enthusiast. Not financial advice."

## 🔄 Cleanup & Memory Management

```typescript
// Automatic cleanup after tests
import { testDataManager } from '@fixtures';

afterEach(async () => {
  await testDataManager.cleanup();
});

// Manual cleanup registration
testDataManager.registerCleanup(async () => {
  // Custom cleanup logic
  await clearTestDatabase();
});
```

## 📝 Configuration

### Global Configuration

```typescript
import { initializeFixtures } from '@fixtures';

initializeFixtures({
  seed: 12345,              // Deterministic generation
  locale: 'en',             // Faker locale
  environment: 'test',      // Environment context
  defaults: {
    userCount: 20,
    threadCount: 10,
    postCount: 50
  }
});
```

### Environment Variables

```bash
# Control fixture behavior
FIXTURES_SEED=12345
FIXTURES_LOCALE=en
FIXTURES_ENV=test
```

## 🚨 Best Practices

### Testing

1. **Use scenarios** for integration tests
2. **Use quick setup** for unit tests  
3. **Validate generated data** with helper functions
4. **Clean up after tests** to prevent memory leaks

### Development

1. **Use the dashboard** for visual fixture creation
2. **Save sessions** for repeatable dev data
3. **Export configurations** to share with team
4. **Generate realistic content** for demos

### Performance

1. **Batch generate** large datasets
2. **Use appropriate scenario size** for test needs
3. **Clean up unused data** regularly
4. **Monitor memory usage** for large datasets

## 🐛 Troubleshooting

### Common Issues

**Fixtures not generating:**
```typescript
// Check factory registration
console.log(Factory.get('user')); // Should not throw
```

**Type errors:**
```typescript
// Ensure proper imports
import type { FixtureUser } from '@fixtures';
```

**Memory issues:**
```typescript
// Use cleanup helpers
await testDataManager.cleanup();
```

**Dashboard not loading:**
- Check route configuration: `/fixtures-dashboard`
- Verify component imports in routing

### Performance Issues

For large datasets (>10k entities):
1. Generate in batches
2. Use streaming where possible
3. Clean up frequently
4. Monitor memory usage

## 📊 Examples by Use Case

### Unit Testing
```typescript
import { createTestUser, createTestThread } from '@fixtures';

describe('User Service', () => {
  it('should create user', () => {
    const user = createTestUser({ username: 'testuser' });
    expect(user.username).toBe('testuser');
  });
});
```

### Integration Testing
```typescript
import { setupQuickScenario } from '@fixtures';

describe('Forum Integration', () => {
  it('should handle forum discussion', async () => {
    const { users, threads, posts } = await setupQuickScenario('basic');
    // Test forum functionality with realistic data
  });
});
```

### Development Seeding
```typescript
import { scenarioGenerator } from '@fixtures';

// Seed development database
async function seedDevDatabase() {
  const scenario = await scenarioGenerator.generateScenario('community-growth');
  await saveToDatabase(scenario.generatedData);
}
```

### Demo Preparation
```typescript
// Use dashboard to create impressive demo data
// 1. Go to /fixtures-dashboard
// 2. Select "Community Growth" scenario
// 3. Generate and export
// 4. Import into demo environment
```

---

## 🔗 Related Documentation

- [Testing Strategy](./TESTING.md)
- [Database Schema](./DATABASE.md) 
- [API Documentation](./API.md)
- [Development Setup](../README.md)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the examples for your use case
3. Consult the type definitions in `shared/fixtures/`
4. File an issue with reproduction steps

---

*Happy testing with realistic crypto community data! 🚀*