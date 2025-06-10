# Degentalk™™ Shoutbox Rain & Tip Features

## Status: Reviewed – Awaiting Final Approval | 2025-06-02

This directory contains components for implementing the rain and tip features in the Degentalk™™ shoutbox.

## Components

### 1. ShoutboxRainNotification

A notification component displayed when a user receives a tip or rain. It shows:

- The type of transaction (rain or tip)
- Amount and currency
- Sender username
- Timestamp

### 2. StyledShoutboxMessage

A component that provides special styling for rain and tip messages in the shoutbox:

- Rain messages have a cloud-rain icon with cyan/emerald styling
- Tip messages have a gift icon with blue/amber styling
- Includes currency badges and amount display

### 3. ShoutboxHelpCommand

A component that displays help for all available shoutbox commands, including:

- /tip @username amount currency - Send a tip to a user
- /rain amount currency recipientCount - Distribute tokens to random active users

## Hooks

### 1. useRainNotifications

A custom hook that manages rain and tip notifications:

- Tracks active notifications
- Connects to WebSocket for real-time updates
- Provides addNotification/removeNotification methods

## Integration Guide

To implement these features:

1. **Add the RainNotifications component** to the app root to ensure notifications are visible app-wide:

```tsx
import { RainNotifications } from '@/components/shoutbox';
import { useRainNotifications } from '@/hooks';

function YourApp() {
	const { notifications, removeNotification } = useRainNotifications();

	return (
		<>
			{/* Your app content */}
			<RainNotifications notifications={notifications} onDismiss={removeNotification} />
		</>
	);
}
```

2. **Update your ShoutboxWidget** to style rain and tip messages:

```tsx
import { detectMessageType, StyledShoutboxMessage } from '@/components/shoutbox';

// In your message rendering function:
const renderMessage = (message) => {
	const messageType = detectMessageType(message.content);

	if (messageType.type === 'rain' || messageType.type === 'tip') {
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

	// Regular message handling
	return <span>{message.content}</span>;
};
```

3. **Add help command support** to your message input handling:

```tsx
import { processHelpCommand } from '@/components/shoutbox';

// In your shoutbox message handler:
const handleSendMessage = () => {
	// Check if it's a help command
	const helpResult = processHelpCommand(message);
	if (helpResult.isHelpCommand) {
		// Add help message to the chat display
		displayHelpMessage(helpResult.message);
		return;
	}

	// Regular message sending
	sendMessageToServer();
};
```

## WebSocket Event Handling

The rain and tip notifications rely on these WebSocket event formats:

1. **Rain Event**:

```json
{
  "type": "rain_event",
  "sender": "username",
  "amount": 50,
  "currency": "DGT",
  "recipients": [{ "id": 1, "username": "user1" }, ...],
  "timestamp": "2023-07-26T12:34:56Z"
}
```

2. **Tip Event**:

```json
{
	"type": "tip_event",
	"sender": "username",
	"recipientId": 2,
	"amount": 10,
	"currency": "USDT",
	"timestamp": "2023-07-26T12:34:56Z"
}
```

## Visual Styling

- **Rain DGT**: Emerald green theme
- **Rain USDT**: Cyan blue theme
- **Tip DGT**: Amber yellow theme
- **Tip USDT**: Blue theme

All messages include elegant animations and currency badges for maximum visual impact.

## Example Implementation

See the `integration-example.tsx` file for a complete implementation example.
