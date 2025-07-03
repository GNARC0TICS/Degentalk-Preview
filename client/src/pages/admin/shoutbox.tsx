/**
 * Admin Shoutbox Management Page
 *
 * Comprehensive admin interface for:
 * - Shoutbox configuration management
 * - Chat room creation and management
 * - Message moderation and analytics
 * - User management and ignore system
 * - Export functionality
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
	Settings,
	MessageSquare,
	Users,
	BarChart3,
	Download,
	Plus,
	Edit,
	Trash2,
	Pin,
	Eye,
	EyeOff,
	RefreshCw
} from 'lucide-react';
import type { RoomId, GroupId, UserId } from '@db/types';

interface ShoutboxConfig {
	id: string;
	scope: string;
	roomId?: string;
	enabled: boolean;
	maxMessageLength: number;
	messageRetentionDays: number;
	rateLimitSeconds: number;
	autoModerationEnabled: boolean;
	profanityFilterEnabled: boolean;
	spamDetectionEnabled: boolean;
	allowUserAvatars: boolean;
	allowUsernameColors: boolean;
	allowCustomEmojis: boolean;
	allowMentions: boolean;
	allowReactions: boolean;
	commandsEnabled: boolean;
	allowTippingCommands: boolean;
	allowRainCommands: boolean;
	allowAirdropCommands: boolean;
	allowModerationCommands: boolean;
	allowPinnedMessages: boolean;
	maxPinnedMessages: number;
	pinnedMessageDuration?: number;
	analyticsEnabled: boolean;
	userIgnoreSystemEnabled: boolean;
	typingIndicatorsEnabled: boolean;
	messageQueueEnabled: boolean;
	maxConcurrentUsers: number;
	messagePreloadCount: number;
	cacheEnabled: boolean;
	cacheTtlSeconds: number;
	themeConfig: Record<string, any>;
	rolePermissions: Record<string, any>;
}

interface ChatRoom {
	id: RoomId;
	name: string;
	description: string | null;
	isPrivate: boolean;
	minXpRequired: number | null;
	minGroupIdRequired: GroupId | null;
	order: number | null;
	createdAt: string;
	createdBy: UserId;
	isDeleted: boolean;
	accessRoles: string[] | null;
	themeConfig: Record<string, any>;
	maxUsers: number | null;
	messageCount: number;
	activeUsers: number;
	onlineUsers: number;
	lastActivity: string | null;
	pinnedMessageCount: number;
}

interface AnalyticsData {
	period: string;
	roomId?: RoomId;
	eventCounts: Array<{ eventType: string; count: number }>;
	hourlyActivity: Array<{ hour: number; count: number }>;
	topUsers: Array<{ userId: string; username: string; count: number }>;
}

const ShoutboxAdminPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<
		'config' | 'rooms' | 'moderation' | 'analytics' | 'export'
	>('config');
	const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
	const [showCreateRoom, setShowCreateRoom] = useState(false);
	const [editingRoom, setEditingRoom] = useState<ChatRoom | null>(null);

	const queryClient = useQueryClient();

	// Fetch shoutbox configuration
	const { data: config, isLoading: configLoading } = useQuery<ShoutboxConfig>({
		queryKey: ['shoutbox-config', selectedRoom],
		queryFn: async () => {
			const url = selectedRoom
				? `/api/shoutbox/config?roomId=${selectedRoom}`
				: '/api/shoutbox/config';
			const response = await fetch(url);
			if (!response.ok) throw new Error('Failed to fetch config');
			const result = await response.json();
			return result.data;
		}
	});

	// Fetch chat rooms
	const { data: rooms, isLoading: roomsLoading } = useQuery<ChatRoom[]>({
		queryKey: ['shoutbox-rooms'],
		queryFn: async () => {
			const response = await fetch('/api/shoutbox/rooms?includeStats=true');
			if (!response.ok) throw new Error('Failed to fetch rooms');
			const result = await response.json();
			return result.data;
		}
	});

	// Fetch analytics
	const { data: analytics } = useQuery<AnalyticsData>({
		queryKey: ['shoutbox-analytics', selectedRoom],
		queryFn: async () => {
			const url = selectedRoom
				? `/api/shoutbox/analytics?roomId=${selectedRoom}&period=24h`
				: '/api/shoutbox/analytics?period=24h';
			const response = await fetch(url);
			if (!response.ok) throw new Error('Failed to fetch analytics');
			const result = await response.json();
			return result.data;
		},
		enabled: activeTab === 'analytics'
	});

	// Update configuration mutation
	const updateConfigMutation = useMutation({
		mutationFn: async (updates: Partial<ShoutboxConfig>) => {
			const url = selectedRoom
				? `/api/shoutbox/config?roomId=${selectedRoom}`
				: '/api/shoutbox/config';
			const response = await fetch(url, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});
			if (!response.ok) throw new Error('Failed to update config');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['shoutbox-config'] });
			toast.success('Configuration updated successfully');
		},
		onError: () => {
			toast.error('Failed to update configuration');
		}
	});

	// Create room mutation
	const createRoomMutation = useMutation({
		mutationFn: async (roomData: any) => {
			const response = await fetch('/api/shoutbox/rooms', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(roomData)
			});
			if (!response.ok) throw new Error('Failed to create room');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['shoutbox-rooms'] });
			setShowCreateRoom(false);
			toast.success('Room created successfully');
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to create room');
		}
	});

	// Update room mutation
	const updateRoomMutation = useMutation({
		mutationFn: async ({ roomId, updates }: { roomId: RoomId; updates: any }) => {
			const response = await fetch(`/api/shoutbox/rooms/${roomId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});
			if (!response.ok) throw new Error('Failed to update room');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['shoutbox-rooms'] });
			setEditingRoom(null);
			toast.success('Room updated successfully');
		},
		onError: () => {
			toast.error('Failed to update room');
		}
	});

	// Delete room mutation
	const deleteRoomMutation = useMutation({
		mutationFn: async (roomId: RoomId) => {
			const response = await fetch(`/api/shoutbox/rooms/${roomId}`, {
				method: 'DELETE'
			});
			if (!response.ok) throw new Error('Failed to delete room');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['shoutbox-rooms'] });
			toast.success('Room deleted successfully');
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to delete room');
		}
	});

	const handleConfigUpdate = (field: keyof ShoutboxConfig, value: any) => {
		updateConfigMutation.mutate({ [field]: value });
	};

	const handleExport = async (format: 'json' | 'csv') => {
		try {
			const url = selectedRoom
				? `/api/shoutbox/export?format=${format}&roomId=${selectedRoom}`
				: `/api/shoutbox/export?format=${format}`;

			const response = await fetch(url);
			if (!response.ok) throw new Error('Failed to export data');

			if (format === 'csv') {
				const blob = await response.blob();
				const downloadUrl = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = downloadUrl;
				link.download = `shoutbox-export-${Date.now()}.csv`;
				link.click();
				window.URL.revokeObjectURL(downloadUrl);
			} else {
				const data = await response.json();
				const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
				const downloadUrl = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = downloadUrl;
				link.download = `shoutbox-export-${Date.now()}.json`;
				link.click();
				window.URL.revokeObjectURL(downloadUrl);
			}

			toast.success('Export completed successfully');
		} catch (error) {
			toast.error('Failed to export data');
		}
	};

	const tabs = [
		{ id: 'config', label: 'Configuration', icon: Settings },
		{ id: 'rooms', label: 'Room Management', icon: MessageSquare },
		{ id: 'moderation', label: 'Moderation', icon: Users },
		{ id: 'analytics', label: 'Analytics', icon: BarChart3 },
		{ id: 'export', label: 'Export', icon: Download }
	];

	if (configLoading || roomsLoading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="flex items-center justify-center h-64">
					<RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
					<span className="ml-2 text-gray-600">Loading shoutbox settings...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Shoutbox Administration</h1>
					<p className="text-gray-600 mt-2">
						Manage chat rooms, configuration, moderation, and analytics
					</p>
				</div>

				{/* Room Selection */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">Room Context</label>
					<select
						value={selectedRoom || ''}
						onChange={(e) => setSelectedRoom(e.target.value ? parseInt(e.target.value) : null)}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Global Settings</option>
						{rooms?.map((room) => (
							<option key={room.id} value={room.id}>
								{room.name} {room.isPrivate ? '(Private)' : '(Public)'}
							</option>
						))}
					</select>
				</div>

				{/* Tab Navigation */}
				<div className="bg-white rounded-lg shadow mb-6">
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8 px-6">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id as any)}
										className={`flex items-center py-4 text-sm font-medium border-b-2 ${
											activeTab === tab.id
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:text-gray-700'
										}`}
									>
										<Icon className="w-5 h-5 mr-2" />
										{tab.label}
									</button>
								);
							})}
						</nav>
					</div>

					{/* Tab Content */}
					<div className="p-6">
						{/* Configuration Tab */}
						{activeTab === 'config' && config && (
							<div className="space-y-6">
								<h2 className="text-xl font-semibold">
									{selectedRoom ? `Room Configuration` : 'Global Configuration'}
								</h2>

								{/* Basic Settings */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									<div>
										<label className="flex items-center">
											<input
												type="checkbox"
												checked={config.enabled}
												onChange={(e) => handleConfigUpdate('enabled', e.target.checked)}
												className="mr-2"
											/>
											<span className="text-sm font-medium">Enable Shoutbox</span>
										</label>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Max Message Length
										</label>
										<input
											type="number"
											value={config.maxMessageLength}
											onChange={(e) =>
												handleConfigUpdate('maxMessageLength', parseInt(e.target.value))
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md"
											min="1"
											max="2000"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Message Retention (Days)
										</label>
										<input
											type="number"
											value={config.messageRetentionDays}
											onChange={(e) =>
												handleConfigUpdate('messageRetentionDays', parseInt(e.target.value))
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md"
											min="1"
											max="3650"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Rate Limit (Seconds)
										</label>
										<input
											type="number"
											value={config.rateLimitSeconds}
											onChange={(e) =>
												handleConfigUpdate('rateLimitSeconds', parseInt(e.target.value))
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md"
											min="1"
											max="300"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Max Pinned Messages
										</label>
										<input
											type="number"
											value={config.maxPinnedMessages}
											onChange={(e) =>
												handleConfigUpdate('maxPinnedMessages', parseInt(e.target.value))
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md"
											min="0"
											max="20"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Max Concurrent Users
										</label>
										<input
											type="number"
											value={config.maxConcurrentUsers}
											onChange={(e) =>
												handleConfigUpdate('maxConcurrentUsers', parseInt(e.target.value))
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md"
											min="10"
											max="50000"
										/>
									</div>
								</div>

								{/* Feature Toggles */}
								<div>
									<h3 className="text-lg font-semibold mb-4">Features</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{[
											{ key: 'autoModerationEnabled', label: 'Auto Moderation' },
											{ key: 'profanityFilterEnabled', label: 'Profanity Filter' },
											{ key: 'spamDetectionEnabled', label: 'Spam Detection' },
											{ key: 'allowUserAvatars', label: 'User Avatars' },
											{ key: 'allowUsernameColors', label: 'Username Colors' },
											{ key: 'allowCustomEmojis', label: 'Custom Emojis' },
											{ key: 'allowMentions', label: 'Mentions' },
											{ key: 'allowReactions', label: 'Reactions' },
											{ key: 'commandsEnabled', label: 'Commands' },
											{ key: 'allowTippingCommands', label: 'Tipping Commands' },
											{ key: 'allowRainCommands', label: 'Rain Commands' },
											{ key: 'allowAirdropCommands', label: 'Airdrop Commands' },
											{ key: 'allowModerationCommands', label: 'Moderation Commands' },
											{ key: 'userIgnoreSystemEnabled', label: 'User Ignore System' },
											{ key: 'typingIndicatorsEnabled', label: 'Typing Indicators' },
											{ key: 'analyticsEnabled', label: 'Analytics' }
										].map((feature) => (
											<label key={feature.key} className="flex items-center">
												<input
													type="checkbox"
													checked={config[feature.key as keyof ShoutboxConfig] as boolean}
													onChange={(e) =>
														handleConfigUpdate(
															feature.key as keyof ShoutboxConfig,
															e.target.checked
														)
													}
													className="mr-2"
												/>
												<span className="text-sm">{feature.label}</span>
											</label>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Room Management Tab */}
						{activeTab === 'rooms' && (
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h2 className="text-xl font-semibold">Chat Rooms</h2>
									<button
										onClick={() => setShowCreateRoom(true)}
										className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										<Plus className="w-4 h-4 mr-2" />
										Create Room
									</button>
								</div>

								<div className="grid gap-4">
									{rooms?.map((room) => (
										<div key={room.id} className="bg-gray-50 rounded-lg p-4">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<h3 className="font-semibold">{room.name}</h3>
														{room.isPrivate && (
															<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
																Private
															</span>
														)}
													</div>
													<p className="text-gray-600 text-sm mb-2">
														{room.description || 'No description'}
													</p>
													<div className="flex gap-4 text-sm text-gray-500">
														<span>{room.messageCount} messages</span>
														<span>{room.activeUsers} active users</span>
														<span>{room.pinnedMessageCount} pinned</span>
														{room.lastActivity && (
															<span>Last: {new Date(room.lastActivity).toLocaleDateString()}</span>
														)}
													</div>
												</div>
												<div className="flex gap-2">
													<button
														onClick={() => setEditingRoom(room)}
														className="p-1 text-gray-400 hover:text-blue-600"
													>
														<Edit className="w-4 h-4" />
													</button>
													{room.name !== 'degen-lounge' && (
														<button
															onClick={() => deleteRoomMutation.mutate(room.id)}
															className="p-1 text-gray-400 hover:text-red-600"
															disabled={deleteRoomMutation.isPending}
														>
															<Trash2 className="w-4 h-4" />
														</button>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Analytics Tab */}
						{activeTab === 'analytics' && analytics && (
							<div className="space-y-6">
								<h2 className="text-xl font-semibold">Analytics</h2>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{/* Event Counts */}
									<div className="bg-gray-50 rounded-lg p-4">
										<h3 className="font-semibold mb-3">Event Types (24h)</h3>
										<div className="space-y-2">
											{analytics.eventCounts.map((event) => (
												<div key={event.eventType} className="flex justify-between">
													<span className="capitalize">{event.eventType}</span>
													<span className="font-medium">{event.count}</span>
												</div>
											))}
										</div>
									</div>

									{/* Top Users */}
									<div className="bg-gray-50 rounded-lg p-4">
										<h3 className="font-semibold mb-3">Most Active Users</h3>
										<div className="space-y-2">
											{analytics.topUsers.slice(0, 5).map((user, index) => (
												<div key={user.userId} className="flex justify-between">
													<span>{user.username || 'Unknown'}</span>
													<span className="font-medium">{user.count}</span>
												</div>
											))}
										</div>
									</div>

									{/* Hourly Activity */}
									<div className="bg-gray-50 rounded-lg p-4">
										<h3 className="font-semibold mb-3">Hourly Activity</h3>
										<div className="text-sm text-gray-600">
											Peak hour:{' '}
											{analytics.hourlyActivity.sort((a, b) => b.count - a.count)[0]?.hour || 'N/A'}
											:00
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Export Tab */}
						{activeTab === 'export' && (
							<div className="space-y-6">
								<h2 className="text-xl font-semibold">Export Data</h2>

								<div className="bg-gray-50 rounded-lg p-6">
									<h3 className="font-semibold mb-4">Message History Export</h3>
									<p className="text-gray-600 mb-4">
										Export message history for {selectedRoom ? 'the selected room' : 'all rooms'}.
									</p>

									<div className="flex gap-4">
										<button
											onClick={() => handleExport('json')}
											className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
										>
											Export as JSON
										</button>
										<button
											onClick={() => handleExport('csv')}
											className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
										>
											Export as CSV
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Create Room Modal */}
			{showCreateRoom && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h3 className="text-lg font-semibold mb-4">Create New Room</h3>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								const formData = new FormData(e.currentTarget);
								createRoomMutation.mutate({
									name: formData.get('name'),
									description: formData.get('description'),
									isPrivate: formData.has('isPrivate'),
									minXpRequired: formData.get('minXpRequired')
										? parseInt(formData.get('minXpRequired') as string)
										: undefined,
									maxUsers: formData.get('maxUsers')
										? parseInt(formData.get('maxUsers') as string)
										: undefined
								});
							}}
						>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Room Name *
									</label>
									<input
										name="name"
										type="text"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										placeholder="Enter room name"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Description
									</label>
									<textarea
										name="description"
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										rows={3}
										placeholder="Room description (optional)"
									/>
								</div>

								<div>
									<label className="flex items-center">
										<input name="isPrivate" type="checkbox" className="mr-2" />
										<span className="text-sm">Private Room</span>
									</label>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Minimum XP Required
									</label>
									<input
										name="minXpRequired"
										type="number"
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										min="0"
										placeholder="0"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
									<input
										name="maxUsers"
										type="number"
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										min="1"
										placeholder="1000"
									/>
								</div>
							</div>

							<div className="flex justify-end gap-2 mt-6">
								<button
									type="button"
									onClick={() => setShowCreateRoom(false)}
									className="px-4 py-2 text-gray-600 hover:text-gray-800"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={createRoomMutation.isPending}
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
								>
									{createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default ShoutboxAdminPage;
