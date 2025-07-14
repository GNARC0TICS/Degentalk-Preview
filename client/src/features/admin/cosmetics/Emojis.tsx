/**
 * Admin Emojis Management Component
 * 
 * TODO: Implement emoji management functionality including:
 * - Upload/import custom emojis
 * - Organize emoji categories
 * - Set emoji permissions and availability
 * - Preview emoji usage in forums
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smile, Upload, Settings, Eye } from 'lucide-react';

export default function Emojis() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-admin-text-primary">Emoji Management</h1>
					<p className="text-admin-text-secondary">Manage custom emojis and emoji categories</p>
				</div>
				<Button className="gap-2">
					<Upload className="w-4 h-4" />
					Upload Emoji
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Emoji Categories */}
				<Card className="bg-admin-surface border-admin-border">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-admin-text-primary">
							<Smile className="w-5 h-5" />
							Categories
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex items-center justify-between p-2 rounded hover:bg-admin-surface-hover">
								<span className="text-sm font-medium text-admin-text-primary">Default</span>
								<Badge variant="outline" className="text-xs">12 emojis</Badge>
							</div>
							<div className="flex items-center justify-between p-2 rounded hover:bg-admin-surface-hover">
								<span className="text-sm font-medium text-admin-text-primary">Custom</span>
								<Badge variant="outline" className="text-xs">0 emojis</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Usage Statistics */}
				<Card className="bg-admin-surface border-admin-border">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-admin-text-primary">
							<Eye className="w-5 h-5" />
							Usage Stats
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-admin-text-secondary">Total Emojis</span>
								<span className="text-sm font-medium text-admin-text-primary">12</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-admin-text-secondary">Active Usage</span>
								<span className="text-sm font-medium text-admin-text-primary">8</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-admin-text-secondary">Custom Added</span>
								<span className="text-sm font-medium text-admin-text-primary">0</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Settings */}
				<Card className="bg-admin-surface border-admin-border">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-admin-text-primary">
							<Settings className="w-5 h-5" />
							Settings
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-admin-text-secondary">Allow Custom</span>
								<Badge className="text-xs bg-admin-status-ok/10 text-admin-status-ok">Enabled</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-admin-text-secondary">Max Size</span>
								<span className="text-xs text-admin-text-secondary">64KB</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* TODO: Add emoji grid, upload form, and management controls */}
			<Card className="bg-admin-surface border-admin-border">
				<CardHeader>
					<CardTitle className="text-admin-text-primary">Emoji Library</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-12">
						<Smile className="w-16 h-16 mx-auto mb-4 opacity-50 text-admin-text-secondary" />
						<p className="text-admin-text-secondary mb-4">Emoji management interface coming soon</p>
						<p className="text-sm text-admin-text-secondary">
							This will include emoji upload, categorization, and usage management
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}