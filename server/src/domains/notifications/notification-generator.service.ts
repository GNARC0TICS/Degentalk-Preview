/**
 * Notification Generator Service
 * 
 * This service is responsible for generating notifications from event logs.
 * It subscribes to the event logger and creates notifications based on events.
 */
import { createNotificationFromEvent } from './notification.service';
import type { EventLog } from '@schema';

/**
 * Generates a notification from an event log
 * @param eventLog The event log to generate a notification from
 */
export const generateNotificationFromEvent = async (eventLog: EventLog): Promise<{ id: string } | null> => {
  // Skip events that shouldn't generate notifications
  if (!shouldGenerateNotification(eventLog)) {
    return null;
  }

  // Generate notification content based on event type
  const { title, body } = generateNotificationContent(eventLog);

  // Create the notification
  return createNotificationFromEvent(eventLog, title, body);
};

/**
 * Determines if an event should generate a notification
 * @param eventLog The event log to check
 */
const shouldGenerateNotification = (eventLog: EventLog): boolean => {
  // List of event types that should generate notifications
  const notifiableEvents = [
    'rain_claimed',
    'level_up',
    'badge_earned',
    'tip_received',
    'airdrop_claimed',
    'referral_completed',
    'cosmetic_unlocked',
    'mission_completed',
    'post_created' // Only for thread replies
  ];

  // Special case for post_created - only notify for replies to user's threads
  if (eventLog.eventType === 'post_created') {
    // Check if this is a reply to the user's thread
    // This would require additional context that we don't have here
    // In a real implementation, you'd check if the thread author is different from the post author
    return false; // For now, skip post_created events until we have thread ownership data
  }

  return notifiableEvents.includes(eventLog.eventType);
};

/**
 * Generates notification content based on event type
 * @param eventLog The event log to generate content for
 */
const generateNotificationContent = (eventLog: EventLog): { title: string; body: string } => {
  const { eventType, meta } = eventLog;

  switch (eventType) {
    case 'rain_claimed':
      return {
        title: '🌧️ Rain Collected',
        body: `You collected ${meta.amount} tokens from a rain event!`
      };
    
    case 'level_up':
      return {
        title: '🎉 Level Up!',
        body: `Congratulations! You've reached level ${meta.newLevel}.`
      };
    
    case 'badge_earned':
      return {
        title: '🏆 Badge Earned',
        body: `You've earned the "${meta.badgeName}" badge!`
      };
    
    case 'tip_received':
      return {
        title: '💰 Tip Received',
        body: `You received a tip of ${meta.amount} tokens.`
      };
    
    case 'airdrop_claimed':
      return {
        title: '🪂 Airdrop Claimed',
        body: `You claimed ${meta.amount} tokens from an airdrop!`
      };
    
    case 'referral_completed':
      return {
        title: '👥 Referral Bonus',
        body: 'Your referral was successful! You earned a referral bonus.'
      };
    
    case 'cosmetic_unlocked':
      return {
        title: '✨ Cosmetic Unlocked',
        body: `You unlocked the "${meta.cosmeticName}" ${meta.cosmeticType}!`
      };
    
    case 'mission_completed':
      return {
        title: '🎯 Mission Complete',
        body: `You completed the "${meta.missionName}" mission!`
      };
    
    case 'post_created':
      return {
        title: '💬 New Reply',
        body: 'Someone replied to your thread.'
      };
    
    default:
      return {
        title: 'System Notification',
        body: 'You have a new notification.'
      };
  }
}; 