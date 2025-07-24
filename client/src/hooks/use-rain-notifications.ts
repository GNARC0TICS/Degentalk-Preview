import { useState, useEffect, useCallback } from 'react';
import { RainNotification } from '@app/components/shoutbox/shoutbox-rain-notification';
import { useAuth } from '@app/hooks/use-auth';
import { logger } from '@app/lib/logger';

export function useRainNotifications() {
	const [notifications, setNotifications] = useState<RainNotification[]>([]);
	const { user: currentUser } = useAuth(); // Get user from auth context

	// Function to add a new notification
	const addNotification = useCallback((notification: Omit<RainNotification, 'id'>) => {
		const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const newNotification = { ...notification, id };

		setNotifications((prev) => [...prev, newNotification]);

		return id;
	}, []);

	// Function to remove a notification
	const removeNotification = useCallback((id: string) => {
		setNotifications((prev) => prev.filter((notification) => notification.id !== id));
	}, []);

	// Clear all notifications
	const clearAllNotifications = useCallback(() => {
		setNotifications([]);
	}, []);

	// Handle WebSocket events for rain and tip notifications
	useEffect(() => {
		let ws: WebSocket | null = null;

		// Only set up WebSocket if we have a current user
		if (currentUser?.id) {
			// Create WebSocket connection for real-time notifications
			const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
			const host = window.location.host;
			ws = new WebSocket(`${protocol}${host}/ws?userId=${currentUser.id}`);

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);

					// Handle rain events
					if (data.type === 'rain_event') {
						// Check if the current user is a recipient
						const isRecipient = data.recipients.some(
							(recipient: any) =>
								recipient.id === currentUser.id || recipient.username === currentUser.username
						);

						if (isRecipient) {
							// Calculate approximate amount received (total / number of recipients)
							const recipientAmount = data.amount / data.recipients.length;

							addNotification({
								type: 'rain',
								amount: parseFloat(recipientAmount.toFixed(2)),
								currency: data.currency,
								sender: data.sender,
								timestamp: data.timestamp
							});
						}
					}

					// Handle tip events
					if (data.type === 'tip_event' && data.recipientId === currentUser.id) {
						addNotification({
							type: 'tip',
							amount: data.amount,
							currency: data.currency,
							sender: data.sender,
							timestamp: data.timestamp
						});
					}
				} catch (error) {
					logger.error('useRainNotifications', 'Error parsing WebSocket message:', error);
				}
			};

			ws.onerror = (error) => {
				logger.error('useRainNotifications', 'WebSocket error:', error);
			};

			ws.onclose = () => {
				// WebSocket connection closed
			};
		}

		// Clean up WebSocket on unmount or when user changes
		return () => {
			if (ws) {
				ws.close();
			}
		};
	}, [currentUser, addNotification]);

	return {
		notifications,
		addNotification,
		removeNotification,
		clearAllNotifications
	};
}
