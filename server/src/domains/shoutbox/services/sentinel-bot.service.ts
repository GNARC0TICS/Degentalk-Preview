/**
 * Sentinel Bot Service
 * 
 * Automated bot system for shoutbox announcements, tips, and engagement
 * Configurable messages based on events, time, and user activity
 */

import { db } from '@degentalk/db';
import { shoutboxMessages, users } from '@schema';
import { logger } from '@core/logger';
import type { RoomId } from '@shared/types/ids';
import { wsService } from '@core/websocket/websocket.service';
import { ShoutboxService } from './shoutbox.service';

interface BotMessage {
  type: 'welcome' | 'tip' | 'announcement' | 'milestone' | 'random' | 'market' | 'motivation';
  content: string;
  roomId?: RoomId;
  metadata?: Record<string, any>;
}

interface BotConfig {
  enabled: boolean;
  name: string;
  avatarUrl: string;
  messages: {
    welcome: string[];
    tips: string[];
    announcements: string[];
    milestones: string[];
    random: string[];
    market: string[];
    motivation: string[];
  };
  schedule: {
    randomMessageInterval: number; // minutes
    marketUpdateInterval: number; // minutes
    motivationHour: number; // hour of day (0-23)
  };
}

export class SentinelBotService {
  private static instance: SentinelBotService;
  private config: BotConfig;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private botUserId = 'sentinel-bot'; // Special bot ID

  private defaultConfig: BotConfig = {
    enabled: true,
    name: 'Sentinel',
    avatarUrl: '/images/bots/sentinel.png',
    messages: {
      welcome: [
        "Welcome to DegenTalk, {username}! 🚀 Ready to ape in?",
        "Another degen joins the chat! Welcome {username} 💎🙌",
        "{username} just entered the casino! Place your bets! 🎰",
        "Fresh meat! I mean... Welcome {username}! 🦍",
        "Look who decided to join the degen army! Welcome {username}! 💪"
      ],
      tips: [
        "💡 Pro tip: Use /tip @username amount to share some DGT love!",
        "💡 Did you know? You can /rain DGT on active chatters!",
        "💡 Level up faster by engaging in meaningful discussions!",
        "💡 Custom emojis unlock as you level up. Keep grinding! 🎯",
        "💡 VIP members get reduced cooldowns and exclusive emojis! 👑"
      ],
      announcements: [
        "📢 Server maintenance scheduled for 3 AM UTC. We'll be back faster than a rug pull!",
        "📢 New mission system is live! Check your daily tasks for sweet rewards!",
        "📢 Forum contest this weekend! Big DGT prizes for top contributors! 🏆",
        "📢 Shoutbox commands updated! Type /help for the full list.",
        "📢 Remember: Not your keys, not your cheese! Stay safu out there! 🔐"
      ],
      milestones: [
        "🎉 {username} just hit Level {level}! Absolute legend!",
        "🏆 Congrats to {username} for reaching {milestone} XP! To the moon! 🚀",
        "💯 {username} completed their {count}th mission! Grinding machine!",
        "🔥 {username} is on a {days}-day streak! Diamond hands confirmed! 💎",
        "🐋 {username} just tipped over {amount} DGT total! Whale alert! 🚨"
      ],
      random: [
        "Remember anons, we're all gonna make it! 🌟",
        "Current vibe check: How we feeling today, degens? 🎭",
        "Who's ready for some chaos? Drop a 🚀 if you're bullish!",
        "Fun fact: The first person to type 'gm' gets absolutely nothing! But do it anyway! ☀️",
        "Confession time: I'm just a bot, but even I FOMO'd into $PEPE 🐸",
        "If you're reading this, you're early. Probably nothing... 👀",
        "Wen moon? Soon™️ 🌙",
        "Bears are just bulls who haven't taken the redpill yet 💊",
        "PSA: Touching grass is temporary, but losses are forever! 🌱",
        "I'm not saying buy the dip... but I'm also not NOT saying it 📉"
      ],
      market: [
        "🔴 Market's bleeding harder than my portfolio! Time to DCA, degens!",
        "🟢 Green candles everywhere! Don't FOMO too hard, anons!",
        "🦀 Crab market detected. Time to accumulate and shitpost!",
        "📊 Bitcoin doing Bitcoin things. In other news, water is wet!",
        "⚡ High volatility detected! Buckle up, it's gonna be a wild ride!"
      ],
      motivation: [
        "GM degens! ☀️ Another day, another opportunity to lose money! LFG!",
        "Rise and grind! 💪 The charts won't watch themselves!",
        "Good morning legends! Remember: You miss 100% of the pumps you don't ape into! 🦍",
        "Wakey wakey! Time to check if you're rich yet! 💰",
        "Morning degens! Coffee ☕ Charts 📈 Copium 💊 Let's get this bread! 🍞"
      ]
    },
    schedule: {
      randomMessageInterval: 30, // 30 minutes
      marketUpdateInterval: 120, // 2 hours
      motivationHour: 8 // 8 AM
    }
  };

  private constructor() {
    this.config = this.defaultConfig;
  }

  static getInstance(): SentinelBotService {
    if (!SentinelBotService.instance) {
      SentinelBotService.instance = new SentinelBotService();
    }
    return SentinelBotService.instance;
  }

  async initialize() {
    if (!this.config.enabled) return;

    // Schedule random messages
    this.scheduleRandomMessages();
    
    // Schedule market updates
    this.scheduleMarketUpdates();
    
    // Schedule daily motivation
    this.scheduleDailyMotivation();

    logger.info('Sentinel Bot initialized');
  }

  /**
   * Send a welcome message when a new user joins
   */
  async sendWelcomeMessage(username: string, roomId: RoomId = 'general' as RoomId) {
    if (!this.config.enabled) return;

    const messages = this.config.messages.welcome;
    const content = this.getRandomMessage(messages).replace('{username}', username);
    
    await this.sendBotMessage({
      type: 'welcome',
      content,
      roomId
    });
  }

  /**
   * Send a milestone message
   */
  async sendMilestoneMessage(data: {
    username: string;
    milestone: string;
    value: any;
    roomId?: RoomId;
  }) {
    if (!this.config.enabled) return;

    const messages = this.config.messages.milestones;
    let content = this.getRandomMessage(messages);
    
    // Replace placeholders
    content = content
      .replace('{username}', data.username)
      .replace('{milestone}', data.milestone)
      .replace('{level}', data.value)
      .replace('{count}', data.value)
      .replace('{days}', data.value)
      .replace('{amount}', data.value);

    await this.sendBotMessage({
      type: 'milestone',
      content,
      roomId: data.roomId || ('general' as RoomId),
      metadata: data
    });
  }

  /**
   * Send an announcement
   */
  async sendAnnouncement(content: string, roomId?: RoomId) {
    if (!this.config.enabled) return;

    await this.sendBotMessage({
      type: 'announcement',
      content: `📢 ${content}`,
      roomId: roomId || ('general' as RoomId)
    });
  }

  /**
   * Send a tip message
   */
  async sendTip(roomId?: RoomId) {
    if (!this.config.enabled) return;

    const tips = this.config.messages.tips;
    const content = this.getRandomMessage(tips);

    await this.sendBotMessage({
      type: 'tip',
      content,
      roomId: roomId || ('general' as RoomId)
    });
  }

  private async sendBotMessage(message: BotMessage) {
    try {
      // Insert message into database
      const [dbMessage] = await db.insert(shoutboxMessages).values({
        userId: this.botUserId as any, // Bot has special ID
        roomId: message.roomId || ('general' as RoomId),
        content: message.content,
        isDeleted: false,
        isPinned: false
      }).returning();

      // Broadcast via WebSocket
      wsService.broadcastToRoom(message.roomId || ('general' as RoomId), {
        type: 'new_message',
        payload: {
          message: {
            ...dbMessage,
            user: {
              id: this.botUserId,
              username: this.config.name,
              avatarUrl: this.config.avatarUrl,
              level: 99, // Max level for bot
              isBot: true
            }
          }
        }
      });

      logger.info('Sentinel bot message sent', {
        type: message.type,
        roomId: message.roomId
      });
    } catch (error) {
      logger.error('Failed to send bot message', { error, message });
    }
  }

  private scheduleRandomMessages() {
    const interval = this.config.schedule.randomMessageInterval * 60 * 1000;
    
    const timer = setInterval(async () => {
      const messages = [...this.config.messages.random, ...this.config.messages.tips];
      const content = this.getRandomMessage(messages);
      
      // Get most active room
      const activeRoom = await this.getMostActiveRoom();
      
      await this.sendBotMessage({
        type: 'random',
        content,
        roomId: activeRoom
      });
    }, interval);

    this.intervals.set('random', timer);
  }

  private scheduleMarketUpdates() {
    const interval = this.config.schedule.marketUpdateInterval * 60 * 1000;
    
    const timer = setInterval(async () => {
      const messages = this.config.messages.market;
      const content = this.getRandomMessage(messages);
      
      await this.sendBotMessage({
        type: 'market',
        content,
        roomId: 'general' as RoomId
      });
    }, interval);

    this.intervals.set('market', timer);
  }

  private scheduleDailyMotivation() {
    const checkInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === this.config.schedule.motivationHour && now.getMinutes() === 0) {
        const messages = this.config.messages.motivation;
        const content = this.getRandomMessage(messages);
        
        this.sendBotMessage({
          type: 'motivation',
          content,
          roomId: 'general' as RoomId
        });
      }
    }, 60 * 1000); // Check every minute

    this.intervals.set('motivation', checkInterval);
  }

  private getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private async getMostActiveRoom(): Promise<RoomId> {
    // For now, return general. In future, analyze activity
    return 'general' as RoomId;
  }

  updateConfig(newConfig: Partial<BotConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Restart schedulers if needed
    if (newConfig.schedule) {
      this.shutdown();
      this.initialize();
    }
  }

  shutdown() {
    this.intervals.forEach(timer => clearInterval(timer));
    this.intervals.clear();
    logger.info('Sentinel Bot shut down');
  }
}

export const sentinelBot = SentinelBotService.getInstance();