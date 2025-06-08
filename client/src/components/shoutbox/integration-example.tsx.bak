/**
 * This is a reference example showing how to integrate the rain/tip features into the app.
 * This file itself is not meant to be used directly, but serves as a guide for implementation.
 */

import React, { useEffect } from 'react';
import { ShoutboxWidget, StyledShoutboxMessage, detectMessageType } from './';
import { RainNotifications } from './shoutbox-rain-notification';
import { useRainNotifications } from '@/hooks/use-rain-notifications';
import { processHelpCommand } from './shoutbox-help-command';

// Example component showing integration
export function ShoutboxWithRainSupport() {
  const { 
    notifications, 
    addNotification, 
    removeNotification 
  } = useRainNotifications();

  // Example: manually trigger a notification (for testing)
  const triggerTestNotification = () => {
    addNotification({
      type: 'rain',
      amount: 25,
      currency: 'DGT',
      sender: 'testUser123',
      timestamp: new Date().toISOString()
    });
  };

  // Example message rendering with rain/tip formatting
  const renderMessage = (message: any) => {
    // 1. First detect if this is a special message (rain/tip)
    const messageType = detectMessageType(message.content);

    // 2. Render with appropriate styling based on message type
    if (messageType.type === 'regular') {
      // Regular message rendering
      return <span>{message.content}</span>;
    } else if (messageType.type === 'rain' || messageType.type === 'tip') {
      // Special styling for rain/tip messages
      return (
        <StyledShoutboxMessage
          type={messageType.type}
          content={message.content}
          sender={message.user.username}
          amount={messageType.amount}
          currency={messageType.currency}
        />
      );
    }

    // Fallback
    return <span>{message.content}</span>;
  };

  // Process message before sending
  const processMessage = (content: string) => {
    // Check if it's a help command
    const helpResult = processHelpCommand(content);
    if (helpResult.isHelpCommand && helpResult.message) {
      // Display help message directly in the shoutbox
      // This should be handled in the actual widget component
      return true; // Message was handled
    }

    // Other command processing...
    return false; // Not a special command, proceed with normal send
  };

  return (
    <>
      {/* Regular shoutbox widget - the actual implementation would 
      need to be updated to use renderMessage and processMessage */}
      <ShoutboxWidget />

      {/* Rain notifications component */}
      <RainNotifications 
        notifications={notifications} 
        onDismiss={removeNotification} 
      />

      {/* Example debug button for testing - not for production */}
      <button 
        onClick={triggerTestNotification}
        className="fixed bottom-20 right-4 bg-emerald-500 text-black p-2 rounded"
      >
        Test Rain Notification
      </button>
    </>
  );
}

/**
 * IMPLEMENTATION STEPS:
 * 
 * 1. Update ShoutboxWidget to use StyledShoutboxMessage for message rendering
 * 2. Add rain/tip detection in the message rendering logic
 * 3. Integrate the help command processor in the message sending flow
 * 4. Add RainNotifications component at the app root level to ensure it's always visible
 * 5. Hook up useRainNotifications in a parent component to manage notifications
 */ 