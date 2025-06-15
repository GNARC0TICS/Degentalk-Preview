import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Upload, Save, X, User, Image, Globe, MessageSquare } from 'lucide-react';
import { FileDropZone } from '@/components/ui/FileDropZone';

interface ProfileEditorProps {
	profile: {
		id: number;
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

	async function handleImageUpload(file: File, field: 'avatar' | 'banner') {
		try {
			toast({ title: 'Uploading…', description: `Uploading ${field}…`, variant: 'default' });
			// 1. Request presigned URL
			const presign = await apiRequest<{ uploadUrl: string; publicUrl: string }>({
				method: 'POST',
				url: `/api/uploads/presign`,
				data: { field, fileName: file.name, fileType: file.type }
			});

			// 2. PUT file to storage
			await fetch(presign.uploadUrl, {
				method: 'PUT',
				body: file,
				headers: { 'Content-Type': file.type }
			});

			// 3. Update user profile with new URL
			await apiRequest({
				method: 'PUT',
				url: '/api/profile/update',
				data: field === 'avatar' ? { avatarUrl: presign.publicUrl } : { bannerUrl: presign.publicUrl }
			});

			queryClient.invalidateQueries({ queryKey: ['profile', profile.username] });
			toast({
				title: 'Success',
				description: `${field === 'avatar' ? 'Avatar' : 'Banner'} updated`,
				variant: 'default'
			});
		} catch (error: any) {
			toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
		}
	}

	const handleAvatarUpload = (file: File) => handleImageUpload(file, 'avatar');
	const handleBannerUpload = (file: File) => handleImageUpload(file, 'banner');

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
											accept={["image/jpeg", "image/png", "image/webp", "image/gif"]}
											maxSize={5 * 1024 * 1024}
											showPreview={false}
										/>
									</div>
									<p className="text-xs text-zinc-500">Supported formats: JPG, PNG, GIF. Max 5 MB.</p>
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
											accept={["image/jpeg", "image/png", "image/webp"]}
											maxSize={8 * 1024 * 1024}
											showPreview={false}
										/>
									</div>
									<p className="text-xs text-zinc-500">Supported formats: JPG, PNG, GIF. Max 8 MB.</p>
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
