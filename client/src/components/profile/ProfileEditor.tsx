import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { Label } from '@app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { useToast } from '@app/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/queryClient';
import { Save, X, User, Image, Globe, MessageSquare } from 'lucide-react'; // Removed Upload icon
import { FileDropZone } from '@app/components/ui/file-drop-zone';
import { logger } from '@app/lib/logger';

interface ProfileEditorProps {
	profile: {
		id: string; // Changed to string
		username: string;
		bio: string | null;
		signature: string | null;
		avatarUrl: string | null;
		bannerUrl: string | null;
		website?: string | null;
		discord?: string | null;
		twitter?: string | null;
		location?: string | null;
	};
	onClose: () => void;
}

export function ProfileEditor({ profile, onClose }: ProfileEditorProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Form state
	const [formData, setFormData] = useState({
		bio: profile.bio || '',
		signature: profile.signature || '',
		website: profile.website || '',
		discord: profile.discord || '',
		twitter: profile.twitter || '',
		location: profile.location || ''
	});

	// Add these state variables to your ProfileEditor component state
	const [uploadProgress, setUploadProgress] = useState<{
		avatar: number;
		banner: number;
	}>({ avatar: 0, banner: 0 });

	const [isUploading, setIsUploading] = useState<{
		avatar: boolean;
		banner: boolean;
	}>({ avatar: false, banner: false });

	// Update profile mutation
	const updateProfileMutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			return apiRequest({
				method: 'PUT',
				url: `/api/profile/update`,
				data
			});
		},
		onSuccess: () => {
			toast({
				title: 'Profile Updated',
				description: 'Your profile has been updated successfully',
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
			onClose();
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to update profile: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	const handleInputChange =
		(field: keyof typeof formData) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setFormData({ ...formData, [field]: e.target.value });
		};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateProfileMutation.mutate(formData);
	};

	// Real-time profile synchronization
	// TODO: Implement WebSocket integration for cross-tab profile updates
	// This will be added in Phase 2 of the upload system implementation
	/*
	useEffect(() => {
	  const handleProfileUpdate = (eventData: {
	    userId: string;
	    updates: { avatarUrl?: string; profileBannerUrl?: string; };
	    timestamp: string;
	  }) => {
	    if (eventData.userId === profile.id) { // .toString() removed as profile.id is now string
	      queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
	      toast({
	        title: 'Profile Updated',
	        description: 'Your profile was updated from another device',
	        variant: 'default'
	      });
	    }
	  };

	  // WebSocket subscription will be implemented here
	  // const unsubscribe = webSocketService.subscribe('profile_updated_event', handleProfileUpdate);
	  
	  return () => {
	    // Cleanup will be implemented here
	    // unsubscribe?.();
	  };
	}, [profile.id, profile.username, queryClient, toast]);
	*/

	// Helper function for XMLHttpRequest-based upload with progress tracking
	function uploadWithProgress(
		file: File,
		uploadUrl: string,
		onProgress: (progress: number) => void
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			// Track upload progress
			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					const progress = (event.loaded / event.total) * 100;
					onProgress(progress);
				}
			});

			// Handle completion
			xhr.addEventListener('load', () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve();
				} else {
					reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
				}
			});

			// Handle errors
			xhr.addEventListener('error', () => {
				reject(new Error('Network error during upload'));
			});

			// Handle timeouts
			xhr.addEventListener('timeout', () => {
				reject(new Error('Upload timed out'));
			});

			// Configure and send request
			xhr.open('PUT', uploadUrl);
			xhr.setRequestHeader('Content-Type', file.type);
			xhr.timeout = 60000; // 60 second timeout
			xhr.send(file);
		});
	}

	// Enhanced upload handler with progress tracking
	async function handleImageUpload(
		file: File,
		uploadType: 'avatar' | 'banner',
		onProgress?: (progress: number) => void
	) {
		try {
			// Set uploading state for this specific upload type
			setIsUploading((prev) => ({ ...prev, [uploadType]: true }));
			setUploadProgress((prev) => ({ ...prev, [uploadType]: 0 }));

			// Show initial upload toast with degen energy
			toast({
				title: 'Uploading…',
				description: `Uploading ${uploadType === 'avatar' ? 'pfp' : 'banner'} to the blockchain...`,
				variant: 'default'
			});

			// Progress helper that updates both local state and callback
			const updateProgress = (progress: number) => {
				setUploadProgress((prev) => ({ ...prev, [uploadType]: Math.min(progress, 100) })); // Ensure progress doesn't exceed 100
				onProgress?.(Math.min(progress, 100));
			};

			// Step 1: Request presigned URL (10% progress)
			updateProgress(10);
			const presignResponse = await apiRequest<{
				uploadUrl: string;
				publicUrl: string;
				relativePath: string;
			}>({
				method: 'POST',
				url: `/api/uploads/presigned-url`,
				data: {
					fileName: file.name,
					fileType: file.type,
					uploadType: uploadType
				}
			});

			// Step 2: Upload to storage with XMLHttpRequest for progress tracking (10% -> 80%)
			updateProgress(20); // Set progress to 20% before starting actual file transfer
			await uploadWithProgress(file, presignResponse.uploadUrl, (progress) => {
				// Map file upload progress from 20% to 80% of total progress
				const adjustedProgress = 20 + progress * 0.6; // User's specified mapping
				updateProgress(adjustedProgress);
			});

			// Step 3: Confirm upload with backend (80% -> 90%)
			updateProgress(80);
			const confirmResponse = await apiRequest<{
				success: boolean;
				publicUrl: string;
			}>({
				method: 'POST',
				url: '/api/uploads/confirm',
				data: {
					relativePath: presignResponse.relativePath,
					uploadType: uploadType
				}
			});

			if (!confirmResponse.success) {
				throw new Error('Backend failed to confirm the upload. Please try again.');
			}

			// Step 4: Update UI and show success (90% -> 100%)
			updateProgress(90);
			queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
			updateProgress(100);

			toast({
				title: 'Success!',
				description: `${uploadType === 'avatar' ? 'Avatar' : 'Banner'} updated, you absolute legend!`,
				variant: 'default'
			});

			// Reset progress after brief success display in FileDropZone
			// setTimeout(() => {
			// 	setUploadProgress(prev => ({ ...prev, [uploadType]: 0 }));
			// }, 2000); // This reset is now handled by FileDropZone
		} catch (error: unknown) {
			// Changed type from any to unknown
			logger.error('ProfileEditor', 'Upload failed:', error);

			// Reset progress on error
			setUploadProgress((prev) => ({ ...prev, [uploadType]: 0 }));
			onProgress?.(0); // Also update FileDropZone's progress

			// Enhanced error handling with degen-friendly messages
			let errorMessage = 'Upload failed';
			const errorWithMessage = error as { message?: string }; // Type assertion

			if (errorWithMessage.message?.includes('too large')) {
				errorMessage = 'File too chunky for the blockchain, anon';
			} else if (
				errorWithMessage.message?.includes('network') ||
				errorWithMessage.message?.includes('timed out') ||
				errorWithMessage.message?.includes('status') ||
				errorWithMessage.message?.includes('Upload failed')
			) {
				errorMessage = 'Network went full bear market, try again';
			} else if (errorWithMessage.message?.includes('type')) {
				errorMessage = 'Wrong file type, we need images not your portfolio screenshots';
			} else {
				errorMessage = errorWithMessage.message || 'Something went wrong, probably user error';
			}

			toast({
				title: 'Upload failed',
				description: errorMessage,
				variant: 'destructive'
			});
		} finally {
			setIsUploading((prev) => ({ ...prev, [uploadType]: false }));
		}
	}

	// Updated file handlers that pass progress callbacks
	const handleAvatarUpload = (file: File, onProgress?: (progress: number) => void) =>
		handleImageUpload(file, 'avatar', onProgress);

	const handleBannerUpload = (file: File, onProgress?: (progress: number) => void) =>
		handleImageUpload(file, 'banner', onProgress);

	return (
		<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700">
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-purple-300">Edit Profile</CardTitle>
						<CardDescription>Update your profile information</CardDescription>
					</div>
					<Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-zinc-800">
						<X className="h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<Tabs defaultValue="basic" className="w-full">
							<TabsList className="grid grid-cols-3 w-full mb-6 bg-zinc-800/50">
								<TabsTrigger
									value="basic"
									className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400"
								>
									Basic Info
								</TabsTrigger>
								<TabsTrigger
									value="social"
									className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400"
								>
									Social Links
								</TabsTrigger>
								<TabsTrigger
									value="media"
									className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400"
								>
									Media
								</TabsTrigger>
							</TabsList>

							<TabsContent value="basic" className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="bio" className="text-emerald-300">
										Bio
									</Label>
									<Textarea
										id="bio"
										placeholder="Tell us about yourself..."
										value={formData.bio}
										onChange={handleInputChange('bio')}
										rows={4}
										className="resize-none bg-zinc-800/50 border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/20"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="signature" className="text-emerald-300">
										Forum Signature
									</Label>
									<Textarea
										id="signature"
										placeholder="Your signature appears at the bottom of your posts..."
										value={formData.signature}
										onChange={handleInputChange('signature')}
										rows={3}
										className="resize-none bg-zinc-800/50 border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/20"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="location" className="text-emerald-300">
										Location
									</Label>
									<Input
										id="location"
										placeholder="Where are you from?"
										value={formData.location}
										onChange={handleInputChange('location')}
										className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/20"
									/>
								</div>
							</TabsContent>

							<TabsContent value="social" className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="website" className="text-purple-300">
										Website
									</Label>
									<div className="relative">
										<Globe className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
										<Input
											id="website"
											placeholder="https://your-website.com"
											value={formData.website}
											onChange={handleInputChange('website')}
											className="pl-10 bg-zinc-800/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="twitter" className="text-purple-300">
										Twitter/X
									</Label>
									<Input
										id="twitter"
										placeholder="@username"
										value={formData.twitter}
										onChange={handleInputChange('twitter')}
										className="bg-zinc-800/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="discord" className="text-purple-300">
										Discord
									</Label>
									<div className="relative">
										<MessageSquare className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
										<Input
											id="discord"
											placeholder="username#0000"
											value={formData.discord}
											onChange={handleInputChange('discord')}
											className="pl-10 bg-zinc-800/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20"
										/>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="media" className="space-y-4">
								<div className="space-y-2">
									<Label className="text-amber-300">Profile Picture</Label>
									<div className="space-y-2">
										<div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden border border-amber-500/30">
											{profile.avatarUrl ? (
												<img
													src={profile.avatarUrl}
													alt="Avatar"
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<User className="h-8 w-8 text-zinc-500" />
												</div>
											)}
										</div>
										<FileDropZone
											onFileSelected={handleAvatarUpload}
											className="mt-2"
											accept={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
											maxSize={5 * 1024 * 1024}
											showPreview={false}
											disabled={isUploading.avatar}
										/>
										{isUploading.avatar && (
											<div className="mt-2 space-y-1">
												<div className="flex justify-between text-xs text-zinc-400">
													<span>Uploading avatar...</span>
													<span>{uploadProgress.avatar.toFixed(0)}%</span>
												</div>
												<div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
													<div
														className="h-full bg-emerald-500 transition-all duration-300"
														style={{ width: `${uploadProgress.avatar}%` }}
													/>
												</div>
											</div>
										)}
									</div>
									<p className="text-xs text-zinc-500">
										Supported formats: JPG, PNG, GIF. Max 5 MB.
									</p>
								</div>

								<div className="space-y-2">
									<Label className="text-amber-300">Profile Banner</Label>
									<div className="space-y-2">
										<div className="w-full h-32 rounded-lg bg-zinc-800 overflow-hidden border border-amber-500/30">
											{profile.bannerUrl ? (
												<img
													src={profile.bannerUrl}
													alt="Banner"
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<Image className="h-8 w-8 text-zinc-500" />
												</div>
											)}
										</div>
										<FileDropZone
											onFileSelected={handleBannerUpload}
											className="mt-2"
											accept={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
											maxSize={8 * 1024 * 1024}
											showPreview={false}
											disabled={isUploading.banner}
										/>
										{isUploading.banner && (
											<div className="mt-2 space-y-1">
												<div className="flex justify-between text-xs text-zinc-400">
													<span>Uploading banner...</span>
													<span>{uploadProgress.banner.toFixed(0)}%</span>
												</div>
												<div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
													<div
														className="h-full bg-emerald-500 transition-all duration-300"
														style={{ width: `${uploadProgress.banner}%` }}
													/>
												</div>
											</div>
										)}
									</div>
									<p className="text-xs text-zinc-500">
										Supported formats: JPG, PNG, GIF. Max 8 MB.
									</p>
								</div>
							</TabsContent>
						</Tabs>

						<div className="flex justify-end gap-3 mt-6">
							<Button
								variant="outline"
								type="button"
								onClick={onClose}
								className="border-zinc-600 text-zinc-400 hover:bg-zinc-800"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={updateProfileMutation.isPending}
								className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border-0 shadow-lg"
							>
								<Save className="mr-2 h-4 w-4" />
								{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
