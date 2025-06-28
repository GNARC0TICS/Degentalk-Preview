---
title: USER ADVERTISEMENT IMPLEMENTATION
status: STABLE
updated: 2025-06-28
---

# User Advertisement System Implementation Plan

## Overview

This document outlines the implementation plan for user-based advertisement features that allow Degentalk community members to spend DGT tokens to promote their content and messages.

## Implementation Phases

### Phase 1: Core User Promotion Infrastructure
**Timeline: 1-2 weeks**

#### Database Schema Extensions

```typescript
// New table: user_promotions
export const userPromotions = pgTable('user_promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: promotionTypeEnum('type').notNull(), // 'thread_boost', 'announcement_bar', 'pinned_shoutbox', 'profile_spotlight'
  contentId: uuid('content_id'), // Reference to thread, post, or profile
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  linkUrl: varchar('link_url', { length: 500 }),
  
  // Placement and timing
  targetPlacement: varchar('target_placement', { length: 100 }), // 'announcement_slot_1', 'shoutbox_pin', etc.
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  duration: integer('duration').notNull(), // Duration in hours
  
  // Financial
  dgtCost: decimal('dgt_cost', { precision: 12, scale: 2 }).notNull(),
  dgtSpent: decimal('dgt_spent', { precision: 12, scale: 2 }).notNull().default('0'),
  
  // Status and moderation
  status: promotionStatusEnum('status').notNull().default('pending'), // 'pending', 'approved', 'active', 'completed', 'rejected', 'cancelled'
  moderatorId: uuid('moderator_id').references(() => users.id),
  moderatorNotes: text('moderator_notes'),
  rejectionReason: text('rejection_reason'),
  
  // Performance tracking
  impressions: integer('impressions').notNull().default(0),
  clicks: integer('clicks').notNull().default(0),
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  approvedAt: timestamp('approved_at'),
  activatedAt: timestamp('activated_at'),
  completedAt: timestamp('completed_at')
});

// New table: announcement_slots
export const announcementSlots = pgTable('announcement_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  slotNumber: integer('slot_number').notNull(), // 1, 2, 3 for different priority levels
  date: date('date').notNull(), // Date for the slot
  hourStart: integer('hour_start').notNull(), // Starting hour (0-23)
  hourEnd: integer('hour_end').notNull(), // Ending hour (0-23)
  
  // Booking information
  userPromotionId: uuid('user_promotion_id').references(() => userPromotions.id),
  isBooked: boolean('is_booked').notNull().default(false),
  bookedAt: timestamp('booked_at'),
  
  // Pricing
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(), // Base DGT price
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }).notNull(), // Dynamic pricing
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// New table: shoutbox_pins
export const shoutboxPins = pgTable('shoutbox_pins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userPromotionId: uuid('user_promotion_id').notNull().references(() => userPromotions.id),
  messageId: uuid('message_id').references(() => shoutboxMessages.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  content: text('content').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  linkUrl: varchar('link_url', { length: 500 }),
  
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// New table: promotion_pricing_config
export const promotionPricingConfig = pgTable('promotion_pricing_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  promotionType: promotionTypeEnum('promotion_type').notNull(),
  duration: varchar('duration', { length: 50 }).notNull(), // '1h', '1d', '1w'
  basePriceDgt: decimal('base_price_dgt', { precision: 10, scale: 2 }).notNull(),
  
  // Dynamic pricing factors
  demandMultiplier: decimal('demand_multiplier', { precision: 3, scale: 2 }).notNull().default('1.0'),
  timeMultiplier: decimal('time_multiplier', { precision: 3, scale: 2 }).notNull().default('1.0'), // Peak hours cost more
  
  isActive: boolean('is_active').notNull().default(true),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});
```

#### Core Services

```typescript
// UserPromotionService
export class UserPromotionService {
  async createPromotion(userId: string, request: CreatePromotionRequest): Promise<UserPromotion> {
    // 1. Validate user has sufficient DGT balance
    // 2. Check slot availability for announcement/pin requests
    // 3. Calculate total cost with dynamic pricing
    // 4. Create promotion record with 'pending' status
    // 5. Hold DGT funds (don't deduct until approved)
    // 6. Queue for moderation if required
  }
  
  async getAvailableSlots(type: string, date: Date): Promise<AvailableSlot[]> {
    // Return available announcement slots or pin timeframes
  }
  
  async calculateCost(type: string, duration: string, targetTime: Date): Promise<number> {
    // Dynamic pricing based on demand and time
  }
  
  async approvePromotion(promotionId: string, moderatorId: string): Promise<void> {
    // 1. Update status to 'approved'
    // 2. Deduct DGT from user balance
    // 3. Schedule activation
    // 4. Send notification to user
  }
  
  async activatePromotion(promotionId: string): Promise<void> {
    // 1. Update status to 'active'
    // 2. Start serving promotion content
    // 3. Begin impression tracking
  }
}

// AnnouncementBarService
export class AnnouncementBarService {
  async getActiveAnnouncements(): Promise<AnnouncementBarItem[]> {
    // Return currently active announcement bar items
  }
  
  async reserveSlot(slotNumber: number, date: Date, hours: number[]): Promise<string> {
    // Reserve announcement slot and return reservation ID
  }
  
  async getSlotAvailability(date: Date): Promise<SlotAvailability> {
    // Check which announcement slots are available
  }
}

// ShoutboxPinService  
export class ShoutboxPinService {
  async createPinnedMessage(promotionId: string, content: string): Promise<PinnedMessage> {
    // Create pinned shoutbox message
  }
  
  async getPinnedMessages(): Promise<PinnedMessage[]> {
    // Get currently active pinned messages
  }
  
  async expirePinnedMessage(pinId: string): Promise<void> {
    // Remove expired pinned message
  }
}
```

### Phase 2: Frontend User Interface
**Timeline: 1 week**

#### User Promotion Dashboard

```typescript
// Component: UserPromotionDashboard
export default function UserPromotionDashboard() {
  const [activePromotions, setActivePromotions] = useState<UserPromotion[]>([]);
  const [dgtBalance, setDgtBalance] = useState<number>(0);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  return (
    <Container className="py-8">
      <div className="space-y-8">
        {/* Balance and Stats Overview */}
        <PromotionStatsOverview 
          balance={dgtBalance}
          activePromotions={activePromotions.length}
          totalSpent={calculateTotalSpent(activePromotions)}
        />
        
        {/* Quick Actions */}
        <QuickPromotionActions />
        
        {/* Active Promotions */}
        <ActivePromotionsTable promotions={activePromotions} />
        
        {/* Create New Promotion */}
        <CreatePromotionPanel />
      </div>
    </Container>
  );
}

// Component: CreatePromotionPanel
function CreatePromotionPanel() {
  const [promotionType, setPromotionType] = useState<PromotionType>('thread_boost');
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [duration, setDuration] = useState<string>('1d');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Create New Promotion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Promotion Type Selection */}
        <PromotionTypeSelector 
          value={promotionType}
          onChange={setPromotionType}
        />
        
        {/* Content Selection */}
        <ContentSelector 
          type={promotionType}
          value={selectedContent}
          onChange={setSelectedContent}
        />
        
        {/* Duration and Timing */}
        <DurationSelector 
          value={duration}
          onChange={setDuration}
          onCostUpdate={setEstimatedCost}
        />
        
        {/* Slot Selection (for announcement/pin types) */}
        {(promotionType === 'announcement_bar' || promotionType === 'pinned_shoutbox') && (
          <SlotSelector 
            type={promotionType}
            duration={duration}
            onSelectionChange={handleSlotSelection}
          />
        )}
        
        {/* Cost Preview */}
        <CostPreview 
          estimatedCost={estimatedCost}
          balance={dgtBalance}
        />
        
        {/* Submit */}
        <Button 
          onClick={handleCreatePromotion}
          disabled={estimatedCost > dgtBalance}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          Create Promotion for {estimatedCost} DGT
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Announcement Bar Integration

```typescript
// Component: AnnouncementBar (Enhanced)
export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch both admin and user-generated announcements
    const fetchAnnouncements = async () => {
      const [adminAnnouncements, userPromotions] = await Promise.all([
        fetch('/api/admin/announcements/active').then(r => r.json()),
        fetch('/api/ads/announcement-slots/active').then(r => r.json())
      ]);
      
      // Merge and prioritize announcements
      const merged = mergeAnnouncementsByPriority(adminAnnouncements, userPromotions);
      setAnnouncements(merged);
    };
    
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate announcements every 10 seconds
  useEffect(() => {
    if (announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 10000);
      
      return () => clearInterval(timer);
    }
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-2 px-4 relative">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Announcement Type Indicator */}
          <AnnouncementTypeIndicator type={currentAnnouncement.type} />
          
          {/* Content */}
          <div className="flex-1">
            {currentAnnouncement.linkUrl ? (
              <a 
                href={currentAnnouncement.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                onClick={() => trackAnnouncementClick(currentAnnouncement.id)}
              >
                {currentAnnouncement.content}
              </a>
            ) : (
              <span>{currentAnnouncement.content}</span>
            )}
          </div>
        </div>
        
        {/* Navigation Dots */}
        {announcements.length > 1 && (
          <div className="flex space-x-1">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Close Button (for user promotions) */}
        {currentAnnouncement.type === 'user_promotion' && (
          <button 
            onClick={() => dismissAnnouncement(currentAnnouncement.id)}
            className="ml-4 text-white/70 hover:text-white"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
```

#### Shoutbox Pinned Messages

```typescript
// Component: ShoutboxPinnedMessages
export function ShoutboxPinnedMessages() {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);

  useEffect(() => {
    fetchPinnedMessages();
    const interval = setInterval(fetchPinnedMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2 mb-4">
      {pinnedMessages.map((message) => (
        <div 
          key={message.id}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {/* Pin Icon */}
              <Pin className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
              
              {/* User Avatar */}
              <img 
                src={message.user.avatarUrl || '/default-avatar.png'}
                alt={message.user.username}
                className="w-8 h-8 rounded-full"
              />
              
              {/* Message Content */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-yellow-400">
                    {message.user.username}
                  </span>
                  <Badge variant="outline" className="text-xs bg-yellow-500/20 border-yellow-500/50">
                    PINNED
                  </Badge>
                  <span className="text-xs text-zinc-400">
                    {formatTimeAgo(message.createdAt)}
                  </span>
                </div>
                
                <div className="text-white">
                  {message.linkUrl ? (
                    <a 
                      href={message.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-400"
                      onClick={() => trackPinnedMessageClick(message.id)}
                    >
                      {message.content}
                    </a>
                  ) : (
                    message.content
                  )}
                </div>
                
                {message.imageUrl && (
                  <img 
                    src={message.imageUrl}
                    alt="Pinned message"
                    className="mt-2 max-w-sm rounded-lg"
                  />
                )}
              </div>
            </div>
            
            {/* Time Remaining */}
            <TimeRemaining endTime={message.endTime} />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Phase 3: Advanced Features
**Timeline: 1-2 weeks**

#### Thread Boosting System

```typescript
// Component: ThreadBoostButton
export function ThreadBoostButton({ threadId, currentBoost }: { threadId: string; currentBoost?: ThreadBoost }) {
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostOptions, setBoostOptions] = useState<BoostOption[]>([]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowBoostModal(true)}
        className={currentBoost ? 'border-emerald-500 text-emerald-400' : ''}
      >
        {currentBoost ? (
          <>
            <TrendingUp className="h-4 w-4 mr-1" />
            Boosted
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-1" />
            Boost Thread
          </>
        )}
      </Button>

      <ThreadBoostModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        threadId={threadId}
        onBoostCreated={handleBoostCreated}
      />
    </>
  );
}

// Service: ThreadBoostService
export class ThreadBoostService {
  async boostThread(threadId: string, userId: string, duration: string, budget: number): Promise<ThreadBoost> {
    // 1. Validate thread exists and user owns it or has permission
    // 2. Calculate boost cost based on duration and current demand
    // 3. Check user DGT balance
    // 4. Create boost record
    // 5. Deduct DGT from user balance
    // 6. Apply boost effects (higher ranking in lists, special indicators)
  }
  
  async getActiveBoosts(threadId?: string): Promise<ThreadBoost[]> {
    // Return active thread boosts
  }
  
  async calculateBoostMultiplier(threadId: string): Promise<number> {
    // Calculate how much to boost thread visibility
  }
}
```

#### Profile Spotlight System

```typescript
// Component: ProfileSpotlight
export function ProfileSpotlight() {
  const [spotlightUsers, setSpotlightUsers] = useState<SpotlightUser[]>([]);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-500" />
          Community Spotlight
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {spotlightUsers.map((user) => (
          <div key={user.id} className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
            <img 
              src={user.avatarUrl || '/default-avatar.png'}
              alt={user.username}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">{user.username}</span>
                <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/50">
                  SPOTLIGHT
                </Badge>
              </div>
              <p className="text-sm text-zinc-400">{user.spotlightMessage}</p>
              <div className="flex items-center space-x-4 mt-1 text-xs text-zinc-500">
                <span>{user.totalPosts} posts</span>
                <span>{user.dgtBalance} DGT</span>
                <span>Level {user.xpLevel}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = `/profile/${user.username}`}
            >
              View Profile
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### Phase 4: Admin Tools and Moderation
**Timeline: 1 week**

#### User Promotion Moderation Queue

```typescript
// Component: UserPromotionModerationQueue
export function UserPromotionModerationQueue() {
  const [pendingPromotions, setPendingPromotions] = useState<UserPromotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<UserPromotion | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Promotion Moderation Queue</h2>
        <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/50">
          {pendingPromotions.length} Pending
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Promotion List */}
        <div className="lg:col-span-2 space-y-4">
          {pendingPromotions.map((promotion) => (
            <PromotionModerationCard
              key={promotion.id}
              promotion={promotion}
              isSelected={selectedPromotion?.id === promotion.id}
              onClick={() => setSelectedPromotion(promotion)}
            />
          ))}
        </div>

        {/* Detailed Review Panel */}
        <div className="lg:col-span-1">
          {selectedPromotion && (
            <PromotionReviewPanel
              promotion={selectedPromotion}
              onApprove={handleApproval}
              onReject={handleRejection}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

#### Dynamic Pricing Management

```typescript
// Component: PromotionPricingConfig
export function PromotionPricingConfig() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Dynamic Pricing Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base Pricing */}
        <BasePricingTable rules={pricingRules} />
        
        {/* Demand Multipliers */}
        <DemandMultiplierConfig />
        
        {/* Time-Based Pricing */}
        <TimeBasedPricingConfig />
        
        {/* Peak Hour Configuration */}
        <PeakHourConfig />
      </CardContent>
    </Card>
  );
}
```

## API Implementation Details

### User Promotion Endpoints

```typescript
// User Promotion Routes
router.post('/user-promotions', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const promotionData = createUserPromotionSchema.parse(req.body);
    
    const promotion = await userPromotionService.createPromotion(userId, promotionData);
    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/user-promotions', isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const promotions = await userPromotionService.getUserPromotions(userId);
  res.json(promotions);
});

router.post('/user-promotions/:id/extend', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { additionalHours } = req.body;
  
  const result = await userPromotionService.extendPromotion(id, additionalHours);
  res.json(result);
});

router.delete('/user-promotions/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  await userPromotionService.cancelPromotion(id);
  res.status(204).send();
});

// Announcement Slot Routes
router.get('/announcement-slots/available', async (req, res) => {
  const { date, duration } = req.query;
  const slots = await announcementBarService.getAvailableSlots(date, duration);
  res.json(slots);
});

router.post('/announcement-slots/reserve', isAuthenticated, async (req, res) => {
  const { slotNumber, date, hours, promotionId } = req.body;
  const reservation = await announcementBarService.reserveSlot(slotNumber, date, hours, promotionId);
  res.json(reservation);
});

// Shoutbox Pin Routes
router.post('/shoutbox/pin', isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const { content, duration, imageUrl, linkUrl } = req.body;
  
  const pin = await shoutboxPinService.createPin(userId, {
    content,
    duration,
    imageUrl,
    linkUrl
  });
  
  res.status(201).json(pin);
});

router.get('/shoutbox/pins/active', async (req, res) => {
  const activePins = await shoutboxPinService.getActivePins();
  res.json(activePins);
});
```

### Admin Moderation Endpoints

```typescript
// Admin moderation routes
router.get('/admin/user-promotions/pending', isAdmin, async (req, res) => {
  const pendingPromotions = await userPromotionService.getPendingPromotions();
  res.json(pendingPromotions);
});

router.post('/admin/user-promotions/:id/approve', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { moderatorNotes } = req.body;
  const moderatorId = req.user.id;
  
  await userPromotionService.approvePromotion(id, moderatorId, moderatorNotes);
  res.json({ success: true });
});

router.post('/admin/user-promotions/:id/reject', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const moderatorId = req.user.id;
  
  await userPromotionService.rejectPromotion(id, moderatorId, rejectionReason);
  res.json({ success: true });
});

router.get('/admin/promotion-analytics', isAdmin, async (req, res) => {
  const { from, to } = req.query;
  const analytics = await userPromotionService.getPromotionAnalytics(from, to);
  res.json(analytics);
});
```

## Recommended Ad Placement Locations

### Strategic Placement Analysis

#### High-Value Locations

1. **Homepage Header Banner** (728x90)
   - **Traffic**: Highest - All users see this first
   - **User Promotion**: Premium announcement slot (2000 DGT/day)
   - **External Ads**: Prime real estate for major campaigns

2. **Forum Zone Headers** (468x60)
   - **Traffic**: High - Zone-specific targeting
   - **User Promotion**: Zone-specific thread boosting
   - **External Ads**: Contextual crypto category targeting

3. **Thread Header** (300x250)
   - **Traffic**: High engagement - Users actively reading
   - **User Promotion**: Thread boost indicators and related content
   - **External Ads**: Content-relevant advertisements

4. **Sidebar Top** (300x250)
   - **Traffic**: Persistent across page views
   - **User Promotion**: Profile spotlights and user achievements
   - **External Ads**: Consistent brand exposure

#### Medium-Value Locations

5. **Between Posts** (320x50 mobile / 728x90 desktop)
   - **Traffic**: Natural reading flow
   - **User Promotion**: Related thread boosting suggestions
   - **External Ads**: Native content integration

6. **Announcement Bar** (Full width)
   - **Traffic**: Visible site-wide
   - **User Promotion**: 3 rotating slots for community announcements
   - **External Ads**: Brief promotional messages

7. **Shoutbox Area** 
   - **Traffic**: Active community engagement
   - **User Promotion**: Pinned messages with visual distinction
   - **External Ads**: Real-time promotional integration

#### Specialized Locations

8. **Profile Pages** (300x250)
   - **Traffic**: User-specific targeting
   - **User Promotion**: Achievement highlights and personal showcases
   - **External Ads**: Behavior-based targeting

9. **Search Results** (Sponsored listings)
   - **Traffic**: High intent users
   - **User Promotion**: Boosted thread visibility in search
   - **External Ads**: Keyword-targeted campaigns

10. **Mobile-Specific** (320x50)
    - **Traffic**: Growing mobile user base
    - **User Promotion**: Mobile-optimized promotion formats
    - **External Ads**: Touch-friendly advertisement units

## Next Steps

### Immediate Actions (Week 1)
1. **Database Migration**: Create user promotion tables
2. **Core Services**: Implement UserPromotionService and AnnouncementBarService
3. **Basic API**: Create user promotion CRUD endpoints
4. **DGT Integration**: Connect with wallet system for balance checking and deduction

### Short-term Goals (Weeks 2-3)
1. **Frontend Components**: Build user promotion dashboard and creation interfaces
2. **Moderation Tools**: Implement admin approval workflow
3. **Announcement Integration**: Enhance existing announcement bar with user content
4. **Shoutbox Pins**: Add pinned message functionality to chat

### Medium-term Goals (Month 2)
1. **Thread Boosting**: Implement thread visibility boosting system
2. **Profile Spotlights**: Create featured user showcase system
3. **Analytics Dashboard**: Build comprehensive user promotion analytics
4. **Dynamic Pricing**: Implement demand-based pricing algorithms

### Long-term Goals (Month 3+)
1. **Advanced Targeting**: AI-driven content recommendation for promotions
2. **Performance Optimization**: Real-time bidding for announcement slots
3. **Community Features**: User voting on promoted content quality
4. **Mobile App Integration**: Native mobile promotion creation and management

This implementation plan provides a comprehensive roadmap for building a robust user-based advertisement system that integrates seamlessly with Degentalk's existing DGT economy and community features.